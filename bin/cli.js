#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';
import { blue, green, yellow, red, cyan } from 'kolorist';

import { computeDeps } from '../lib/scaffold/deps.js';
import { makeFolders } from '../lib/scaffold/makeFolders.js';
import { writeBaseFiles } from '../lib/scaffold/writeBaseFiles.js';
import { writePackageJson } from '../lib/scaffold/pkgjson.js';
import { generateExamples } from '../lib/examples/index.js';

const PKG = 'create-fastify-team';

function validateProjectName(input) {
  const name = String(input ?? '').trim();
  if (!name) return 'Informe um nome de pasta.';
  if (name.includes('/') || name.includes('\\')) return 'Use apenas o nome da pasta (sem caminhos).';
  if (name === '.' || name === '..') return 'Nome de pasta inválido.';
  return true;
}

async function dirIsNonEmpty(dir) {
  try {
    const entries = await fsp.readdir(dir);
    return entries.length > 0;
  } catch {
    return false; // não existe -> não é "não-vazia"
  }
}

/**
 * Define quais bancos são compatíveis com ORM/QB.
 * Importante: Prisma suporta MongoDB, mas Sequelize/Knex/Kysely não.
 */
function allowedDatabases({ orm, queryBuilder }) {
  // Se Query Builder está ativo, ORM é ignorado (camada principal)
  if (queryBuilder === 'knex' || queryBuilder === 'kysely') {
    return ['postgres', 'mysql', 'sqlite'];
  }

  if (orm === 'mongoose') return ['mongodb'];
  if (orm === 'sequelize') return ['postgres', 'mysql', 'sqlite'];
  if (orm === 'prisma') return ['postgres', 'mysql', 'sqlite', 'mongodb'];

  // Sem ORM e sem QB -> banco não é necessário, mas mantemos default para .env.example
  return ['postgres', 'mysql', 'sqlite', 'mongodb'];
}

function dbChoicesFor(allowed) {
  const map = {
    postgres: { name: 'Postgres', value: 'postgres' },
    mysql: { name: 'MySQL', value: 'mysql' },
    mongodb: { name: 'MongoDB', value: 'mongodb' },
    sqlite: { name: 'SQLite (dev)', value: 'sqlite' },
  };
  return allowed.map((k) => map[k]).filter(Boolean);
}

function normalizeAnswers(raw) {
  const notices = [];
  const a = { ...raw };

  // Query Builder tem precedência
  if (a.queryBuilder !== 'none') {
    if (a.orm && a.orm !== 'none') {
      notices.push('> Observação: Query Builder selecionado. Desativando ORM (camada principal = QB).');
    }
    a.orm = 'none';
  }

  // Mongoose exige MongoDB e não faz sentido com QB
  if (a.orm === 'mongoose') {
    if (a.database !== 'mongodb') {
      notices.push('> Ajuste: Mongoose requer MongoDB. Alterando banco para MongoDB.');
      a.database = 'mongodb';
    }
    if (a.queryBuilder !== 'none') {
      notices.push('> Ajuste: Mongoose não combina com Query Builder SQL. Desativando Query Builder.');
      a.queryBuilder = 'none';
    }
  }

  // Sequelize não suporta MongoDB
  if (a.orm === 'sequelize' && a.database === 'mongodb') {
    notices.push('> Ajuste: Sequelize não suporta MongoDB. Alterando banco para Postgres.');
    a.database = 'postgres';
  }

  // Knex/Kysely exigem banco SQL
  if ((a.queryBuilder === 'knex' || a.queryBuilder === 'kysely') && a.database === 'mongodb') {
    notices.push('> Ajuste: Query Builder SQL requer banco SQL. Alterando banco para Postgres.');
    a.database = 'postgres';
  }

  // Se nada foi escolhido (sem ORM e sem QB), garantimos banco default para .env.example
  if ((a.orm === 'none' || !a.orm) && (a.queryBuilder === 'none' || !a.queryBuilder)) {
    if (!a.database) a.database = 'postgres';
  }

  // Sanitiza arquitetura default
  if (!['mvc', 'clean', 'modular'].includes(a.architecture)) {
    a.architecture = 'modular';
  }

  // Sanitiza linguagem
  if (!['ts', 'js'].includes(a.language)) {
    a.language = 'ts';
  }

  return { answers: a, notices };
}

async function main() {
  console.log(blue(`\n${PKG} — Gerador de projetos Fastify para times\n`));

  // 1) Perguntas (com when/choices dinâmicos)
  const raw = await inquirer.prompt([
    {
      name: 'projectName',
      message: 'Nome do projeto (pasta destino):',
      default: 'fastify-app',
      validate: validateProjectName,
      filter: (v) => String(v).trim(),
    },
    {
      name: 'language',
      type: 'list',
      message: 'Linguagem?',
      choices: [
        { name: 'TypeScript', value: 'ts' },
        { name: 'JavaScript (ESM)', value: 'js' },
      ],
      default: 'ts',
    },
    {
      name: 'architecture',
      type: 'list',
      message: 'Arquitetura de pastas?',
      choices: [
        { name: 'MVC', value: 'mvc' },
        { name: 'Clean Architecture', value: 'clean' },
        { name: 'Modular (partials)', value: 'modular' },
      ],
      default: 'modular',
    },

    // Data layer primeiro: Query Builder (se escolher, não pergunta ORM)
    {
      name: 'queryBuilder',
      type: 'list',
      message: 'Query Builder?',
      choices: [
        { name: 'Nenhum', value: 'none' },
        { name: 'Knex', value: 'knex' },
        { name: 'Kysely (TS-first)', value: 'kysely' },
      ],
      default: 'none',
    },

    // ORM só aparece quando não há Query Builder
    {
      name: 'orm',
      type: 'list',
      message: 'ORM?',
      when: (a) => a.queryBuilder === 'none',
      choices: [
        { name: 'Nenhum', value: 'none' },
        { name: 'Prisma', value: 'prisma' },
        { name: 'Sequelize', value: 'sequelize' },
        { name: 'Mongoose (MongoDB)', value: 'mongoose' },
      ],
      default: 'none',
    },

    // Banco só aparece quando há ORM ou QB. Caso contrário, fica default interno.
    {
      name: 'database',
      type: 'list',
      message: 'Banco de dados?',
      when: (a) => (a.queryBuilder !== 'none') || (a.orm && a.orm !== 'none'),
      choices: (a) => dbChoicesFor(allowedDatabases({ orm: a.orm ?? 'none', queryBuilder: a.queryBuilder ?? 'none' })),
      default: (a) => {
        const allowed = allowedDatabases({ orm: a.orm ?? 'none', queryBuilder: a.queryBuilder ?? 'none' });
        // preferências: postgres > mysql > sqlite > mongodb
        return allowed.includes('postgres') ? 'postgres'
          : allowed.includes('mysql') ? 'mysql'
          : allowed.includes('sqlite') ? 'sqlite'
          : 'mongodb';
      },
    },

    {
      name: 'eslint',
      type: 'list',
      message: 'ESLint?',
      choices: [
        { name: 'Sem ESLint', value: 'none' },
        { name: 'Básico', value: 'basic' },
        { name: 'Com Prettier (recomendado)', value: 'prettier' },
      ],
      default: 'prettier',
    },
    {
      name: 'devcontainer',
      type: 'confirm',
      message: 'Criar Dev Container (VS Code)?',
      default: false,
    },
  ]);

  // Garante campos sempre presentes
  if (!raw.orm) raw.orm = 'none';
  if (!raw.database) raw.database = 'postgres';

  // 2) Normalização final (blindagem)
  const { answers, notices } = normalizeAnswers(raw);
  for (const n of notices) console.log(yellow(n));

  // 3) Preparar diretório (evitar sobrescrever sem querer)
  const root = path.resolve(process.cwd(), answers.projectName);

  if (fs.existsSync(root) && await dirIsNonEmpty(root)) {
    const { overwrite } = await inquirer.prompt([
      {
        name: 'overwrite',
        type: 'confirm',
        message: `A pasta "${answers.projectName}" já existe e não está vazia. Deseja sobrescrever (apagar tudo)?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(yellow('\nCancelado. Nenhum arquivo foi gerado.\n'));
      process.exit(0);
    }

    await fsp.rm(root, { recursive: true, force: true });
  }

  await fsp.mkdir(root, { recursive: true });

  // 4) Scaffold
  const ctx = {
    root,
    answers,
    isTS: answers.language === 'ts',
    ext: answers.language === 'ts' ? 'ts' : 'js',
  };

  await makeFolders(ctx);

  const { deps, devDeps } = computeDeps(ctx);
  await writeBaseFiles({ ...ctx, deps, devDeps });

  // exemplos por linguagem
  await generateExamples(ctx);

  // package.json
  await writePackageJson({ ...ctx, deps, devDeps });

  // 5) Output
  console.log('\n' + green('✅ Projeto criado em: ') + cyan(root));
  console.log('\nPróximos passos:');
  console.log(blue(`  cd ${answers.projectName}`));
  console.log(blue('  cp .env.example .env   # ajuste DATABASE_URL (se aplicável)'));
  console.log(blue('  npm install'));

  if (answers.orm === 'prisma') {
    console.log(blue('  npm run prisma:generate'));
    if (answers.database !== 'mongodb') console.log(blue('  npm run prisma:migrate'));
  }

  if (answers.queryBuilder === 'knex') {
    console.log(blue('  npm run knex:migrate'));
  }

  console.log(blue('  npm run dev'));
  console.log('\nBoas builds!\n');
}

main().catch((e) => {
  console.error(red('Erro ao criar o projeto:'), e);
  process.exit(1);
});
