#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { spawnSync } from 'child_process';
import inquirer from 'inquirer';
import { blue, green, yellow, red, cyan } from 'kolorist';
import { Command } from 'commander';

import { renderProfile } from '../lib/v2/core/engine.js';

const PKG = 'create-fastify-team';

async function main() {
  console.log(blue(`\n${PKG} — Gerador de projetos Fastify para times (V2)\n`));

  const program = new Command();
  program
    .option('--profile <type>', 'Nome do profile determinístico (ex: modular-postgres-kysely)')
    .option('--traits <list>', 'Traits separados por vírgula (ex: eslint-basic,vitest)')
    .option('--projectName <name>', 'Nome do projeto destino')
    .option('--packageManager <pm>', 'Gerenciador de pacotes', 'npm')
    .option('--install', 'Roda a instalação de dependências automaticamente após gerar o projeto')
    .option('--git', 'Inicializa um repositório git e cria o commit inicial');

  program.parse(process.argv);
  const options = program.opts();

  const v2Profiles = ['minimal', 'modular', 'modular-postgres-kysely', 'modular-postgres-sequelize', 'mvc', 'clean'];
  
  let selectedProfile = options.profile;
  let pName = options.projectName;
  let selectedTraits = options.traits ? options.traits.split(',') : [];

  // 1. Interactive prompt se o profile não for fornecido por flag
  if (!selectedProfile) {
    const initAnswers = await inquirer.prompt([
      { 
        name: 'projectName', 
        message: 'Nome do projeto (pasta destino):', 
        default: pName || 'fastify-app',
        when: !pName 
      },
      {
        name: 'profileChoice',
        type: 'list',
        message: 'Como deseja iniciar seu projeto?',
        choices: [
          { name: '🟢 Minimal (Apenas rotas e estrutura base)', value: 'minimal' },
          { name: '🟡 Modular (Domínios separados, sem banco)', value: 'modular' },
          { name: '🔵 Modular + Postgres + Kysely', value: 'modular-postgres-kysely' },
          { name: '🟣 Modular + Postgres + Sequelize', value: 'modular-postgres-sequelize' },
          new inquirer.Separator(),
          { name: '🛠️  Personalizado (Montar stack V2 passo a passo)', value: 'custom' }
        ]
      }
    ]);

    pName = pName || initAnswers.projectName;

    if (initAnswers.profileChoice === 'custom') {
      console.log(cyan('\n> Vamos configurar seu profile V2 sob medida...\n'));
      
      const customAnswers = await inquirer.prompt([
        {
          name: 'arch',
          type: 'list',
          message: '1. Arquitetura base:',
          choices: [
            { name: 'Modular (Recomendado, escalável por domínio)', value: 'modular' },
            { name: 'MVC (Controller-Service-Repository)', value: 'mvc' },
            { name: 'Clean Architecture (Isolamento de UseCases)', value: 'clean' },
            { name: 'Minimal (Apenas 1 arquivo de rota principal)', value: 'minimal' }
          ]
        },
        {
          name: 'db',
          type: 'list',
          message: '2. Banco de dados:',
          choices: [
            { name: 'PostgreSQL (via Docker Compose)', value: 'postgres' },
            { name: 'Nenhum', value: 'none' }
          ],
          when: (ans) => ans.arch === 'modular'
        },
        {
          name: 'orm',
          type: 'list',
          message: '3. Ferramenta de Persistência:',
          choices: [
            { name: 'Kysely (Type-safe SQL Query Builder)', value: 'kysely' },
            { name: 'Sequelize (Active Record ORM)', value: 'sequelize' }
          ],
          when: (ans) => ans.db === 'postgres'
        },
        {
          name: 'linter',
          type: 'list',
          message: '4. Linter e formatação:',
          choices: [
            { name: 'ESLint Básico', value: 'eslint-basic' },
            { name: 'ESLint + Prettier', value: 'eslint-prettier' },
            { name: 'Nenhum', value: 'none' }
          ]
        },
        {
          name: 'precommit',
          type: 'confirm',
          message: '5. Configurar Husky + lint-staged (Pre-commit)?',
          default: true
        },
        {
          name: 'testFramework',
          type: 'list',
          message: '6. Framework de Testes:',
          choices: [
            { name: 'Node Native Test Runner (node:test)', value: 'node-native-test' },
            { name: 'Vitest', value: 'vitest' },
            { name: 'Nenhum', value: 'none' }
          ]
        }
      ]);

      if (customAnswers.arch === 'minimal') {
        selectedProfile = 'minimal';
      } else if (customAnswers.arch === 'mvc') {
        selectedProfile = 'mvc';
        if (customAnswers.db && customAnswers.db !== 'none') {
           console.log(yellow('> Obs: A integração com banco de dados no MVC ainda está em desenvolvimento na V2. O profile base MVC será gerado.'));
        }
      } else if (customAnswers.arch === 'clean') {
        selectedProfile = 'clean';
        if (customAnswers.db && customAnswers.db !== 'none') {
           console.log(yellow('> Obs: A integração com banco de dados na Clean Arch ainda está em desenvolvimento na V2. O profile base Clean será gerado.'));
        }
      } else if (customAnswers.arch === 'modular') {
        if (!customAnswers.db || customAnswers.db === 'none') {
          selectedProfile = 'modular';
        } else if (customAnswers.db === 'postgres') {
          if (customAnswers.orm === 'kysely') selectedProfile = 'modular-postgres-kysely';
          else if (customAnswers.orm === 'sequelize') selectedProfile = 'modular-postgres-sequelize';
        }
      }

      // "Nenhum" precisa desligar o default da categoria, não só deixar de
      // adicionar trait nenhum — por isso um sentinel `disable:<categoria>`
      // em vez de simplesmente omitir a escolha.
      selectedTraits.push(customAnswers.linter !== 'none' ? customAnswers.linter : 'disable:eslint');
      if (customAnswers.precommit) selectedTraits.push('husky-lint-staged');
      selectedTraits.push(customAnswers.testFramework !== 'none' ? customAnswers.testFramework : 'disable:test');

    } else {
      selectedProfile = initAnswers.profileChoice;
      // Default traits para escolhas rápidas pra manter consistência com o que existia
      selectedTraits = ['eslint-basic', 'node-native-test'];
    }
  }

  // 2. V2 Bypass & Engine Execution
  if (!v2Profiles.includes(selectedProfile)) {
    console.error(red(`\nErro: Profile desconhecido ou não resolvido: ${selectedProfile}`));
    process.exit(1);
  }

  const root = path.resolve(process.cwd(), pName);
  console.log(blue(`\n> Iniciando motor V2... Resolvendo dependências para: ${selectedProfile}`));
  

  let targetProfile;
  if (selectedProfile === 'minimal') {
    const { minimalProfile } = await import('../lib/v2/profiles/minimal.js');
    targetProfile = minimalProfile;
  } else if (selectedProfile === 'modular') {
    const { modularProfile } = await import('../lib/v2/profiles/modular.js');
    targetProfile = modularProfile;
  } else if (selectedProfile === 'mvc') {
    const { mvcProfile } = await import('../lib/v2/profiles/mvc.js');
    targetProfile = mvcProfile;
  } else if (selectedProfile === 'clean') {
    const { cleanProfile } = await import('../lib/v2/profiles/clean.js');
    targetProfile = cleanProfile;
  } else if (selectedProfile === 'modular-postgres-kysely') {
    const { modularPgKyselyProfile } = await import('../lib/v2/profiles/modular-pg-kysely.js');
    targetProfile = modularPgKyselyProfile;
  } else if (selectedProfile === 'modular-postgres-sequelize') {
    const { modularPgSequelizeProfile } = await import('../lib/v2/profiles/modular-postgres-sequelize.js');
    targetProfile = modularPgSequelizeProfile;
  }

  // Resolver traits (merging explicit traits with profile default traits)
  const finalTraits = new Set(targetProfile.defaultTraits || []);
  for (const t of selectedTraits) {
    if (t === 'none') continue;

    // "Nenhum" desliga o default inteiro da categoria, em vez de só não
    // adicionar nada por cima (antes, escolher "Nenhum" no linter/testes
    // deixava o default do profile — ex.: eslint-basic — vivo do mesmo jeito).
    if (t === 'disable:eslint') {
      finalTraits.delete('eslint-basic');
      finalTraits.delete('eslint-prettier');
      continue;
    }
    if (t === 'disable:test') {
      finalTraits.delete('node-native-test');
      finalTraits.delete('vitest');
      continue;
    }

    // Evitar conflitos substituindo traits da mesma categoria
    if (t.startsWith('eslint')) {
      finalTraits.delete('eslint-basic');
      finalTraits.delete('eslint-prettier');
    }
    if (t === 'node-native-test' || t === 'vitest') {
      finalTraits.delete('node-native-test');
      finalTraits.delete('vitest');
    }

    finalTraits.add(t);
  }

  // Carregar os traits solicitados
  const loadedTraits = [];
  for (const t of finalTraits) {
    if (t.startsWith('eslint')) {
      const mod = await import('../lib/v2/traits/linter.js');
      loadedTraits.push(t === 'eslint-basic' ? mod.eslintBasicTrait : mod.eslintPrettierTrait);
    } else if (t === 'husky-lint-staged') {
      const mod = await import('../lib/v2/traits/precommit.js');
      loadedTraits.push(mod.huskyLintStagedTrait);
    } else if (t === 'node-native-test') {
      const mod = await import('../lib/v2/traits/testing.js');
      loadedTraits.push(mod.nodeNativeTestTrait);
    } else if (t === 'vitest') {
      const mod = await import('../lib/v2/traits/testing.js');
      loadedTraits.push(mod.vitestTrait);
    }
  }

  await renderProfile(targetProfile, loadedTraits, root, pName);

  console.log('\n' + green('✅ Projeto criado em: ') + cyan(root));

  if (options.install) {
    console.log(blue(`\n> Instalando dependências (${options.packageManager} install)...`));
    const result = spawnSync(options.packageManager, ['install'], { cwd: root, stdio: 'inherit', shell: true });
    if (result.status !== 0) {
      console.error(red('\nErro: falha ao instalar dependências. Rode manualmente dentro do projeto.'));
      process.exit(1);
    }
  }

  if (options.git) {
    console.log(blue('\n> Inicializando repositório git...'));
    // Sem shell: true — argumentos com espaço (a mensagem de commit) não podem
    // ser reconstituídos numa linha de comando de shell sem quoting explícito.
    spawnSync('git', ['init'], { cwd: root, stdio: 'inherit' });
    spawnSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
    spawnSync('git', ['commit', '-m', 'chore: scaffold inicial via fastify-boilerplate'], { cwd: root, stdio: 'inherit' });
  }

  console.log('\nPróximos passos:');
  console.log(blue(`  cd ${pName}`));
  if (!options.install) {
    console.log(blue(`  ${options.packageManager} install`));
  }
  console.log(blue(`  ${options.packageManager} run dev\n`));
  if (selectedProfile.includes('postgres')) {
    console.log(cyan('> npm run dev sobe o Postgres via Docker Compose, roda as migrations e o seed de exemplo antes do servidor — é literalmente o único comando.'));
    console.log(cyan('> Já tem um Postgres seu? Use "npm run dev:no-infra" para pular o Docker Compose.\n'));
  }
  console.log(green('Boas builds! 🚀\n'));
}

main().catch((e) => {
  console.error(red('Erro ao criar o projeto:'), e);
  process.exit(1);
});
