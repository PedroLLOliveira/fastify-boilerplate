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

async function main() {
  console.log(blue(`\n${PKG} — Gerador de projetos Fastify para times\n`));

  const answers = await inquirer.prompt([
    { name: 'projectName', message: 'Nome do projeto (pasta destino):', default: 'fastify-app' },
    {
      name: 'language',
      type: 'list',
      message: 'Linguagem?',
      choices: [
        { name: 'TypeScript', value: 'ts' },
        { name: 'JavaScript (ESM)', value: 'js' }
      ],
      default: 'ts'
    },
    {
      name: 'architecture',
      type: 'list',
      message: 'Arquitetura de pastas?',
      choices: [
        { name: 'MVC', value: 'mvc' },
        { name: 'Clean Architecture', value: 'clean' },
        { name: 'Modular (partials)', value: 'modular' }
      ],
      default: 'mvc'
    },
    {
      name: 'orm',
      type: 'list',
      message: 'ORM?',
      choices: [
        { name: 'Prisma', value: 'prisma' },
        { name: 'Sequelize', value: 'sequelize' },
        { name: 'Mongoose (MongoDB)', value: 'mongoose' },
        { name: 'Nenhum', value: 'none' }
      ],
      default: 'prisma'
    },
    {
      name: 'database',
      type: 'list',
      message: 'Banco de dados?',
      choices: [
        { name: 'Postgres', value: 'postgres' },
        { name: 'MySQL', value: 'mysql' },
        { name: 'MongoDB', value: 'mongodb' },
        { name: 'SQLite (dev)', value: 'sqlite' }
      ],
      default: 'postgres'
    },
    {
      name: 'eslint',
      type: 'list',
      message: 'ESLint?',
      choices: [
        { name: 'Sem ESLint', value: 'none' },
        { name: 'Básico (eslint:recommended)', value: 'basic' },
        { name: 'Com Prettier (recomendado)', value: 'prettier' }
      ],
      default: 'prettier'
    },
    { name: 'devcontainer', type: 'confirm', message: 'Criar Dev Container (VS Code)?', default: false }
  ]);

  // Validações simples
  if (answers.orm === 'mongoose' && answers.database !== 'mongodb') {
    console.log(yellow('> Ajuste: Mongoose requer MongoDB. Alterando banco para MongoDB.'));
    answers.database = 'mongodb';
  }
  if (answers.orm === 'sequelize' && answers.database === 'mongodb') {
    console.log(yellow('> Ajuste: Sequelize não suporta MongoDB. Alterando ORM para Prisma.'));
    answers.orm = 'prisma';
  }

  const root = path.resolve(process.cwd(), answers.projectName);
  await fsp.mkdir(root, { recursive: true });

  // Pastas + arquivos base
  const ctx = { root, answers, isTS: answers.language === 'ts', ext: answers.language === 'ts' ? 'ts' : 'js' };
  await makeFolders(ctx);
  const { deps, devDeps } = computeDeps(ctx);
  await writeBaseFiles({ ...ctx, deps, devDeps });

  // 🔥 Geração dos EXEMPLOS por linguagem (tudo aqui dentro é segregado)
  await generateExamples(ctx);

  // package.json
  await writePackageJson({ ...ctx, deps, devDeps });

  console.log('\n' + green('✅ Projeto criado em: ') + cyan(root));
  console.log('\nPróximos passos:');
  console.log(blue(`  cd ${answers.projectName}`));
  console.log(blue('  cp .env.example .env   # ajuste DATABASE_URL'));
  console.log(blue('  npm install'));
  if (answers.orm === 'prisma') {
    console.log(blue('  npx prisma generate'));
    if (answers.database !== 'mongodb') console.log(blue('  npx prisma migrate dev'));
  }
  console.log(blue(ctx.isTS ? '  npm run dev' : '  npm run dev'));
  console.log('\nBoas builds! 🚀\n');
}

main().catch((e) => {
  console.error(red('Erro ao criar o projeto:'), e);
  process.exit(1);
});
