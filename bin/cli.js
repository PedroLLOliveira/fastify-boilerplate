#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProject } from '../lib/generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Versão do pacote
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

program
  .version(packageJson.version)
  .argument('[directory]', 'Diretório para criar o projeto')
  .action(async (directory) => {
    console.log(chalk.blue.bold('🚀 Bem-vindo ao Fastify Boilerplate Generator! 🚀'));
    
    // Se o diretório não for especificado, pergunte ao usuário
    if (!directory) {
      const response = await inquirer.prompt([
        {
          type: 'input',
          name: 'directory',
          message: 'Em qual diretório você quer criar o projeto?',
          default: 'my-fastify-app'
        }
      ]);
      directory = response.directory;
    }
    
    // Verificar se o diretório já existe
    if (fs.existsSync(directory)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `O diretório "${directory}" já existe. Deseja sobrescrever?`,
          default: false
        }
      ]);
      
      if (!overwrite) {
        console.log(chalk.yellow('Operação cancelada.'));
        process.exit(0);
      }
    }
    
    // Perguntas sobre ferramentas
    const toolsQuestions = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'tools',
        message: 'Quais ferramentas você deseja incluir?',
        choices: [
          { name: 'ESLint - Linter para código JavaScript', value: 'eslint', checked: true },
          { name: 'Prettier - Formatador de código', value: 'prettier', checked: true },
          { name: 'Jest - Framework de testes', value: 'jest' },
          { name: 'Dev Container - Configuração para desenvolvimento em container', value: 'devcontainer' }
        ],
        // Adicione esta configuração:
        pageSize: 10,
        // Símbolos para os checkboxes
        symbols: {
          checked: '✓',
          unchecked: '○'
        }
      },
      {
        type: 'list',
        name: 'orm',
        message: 'Qual ORM você deseja utilizar?',
        choices: [
          { name: 'Nenhum', value: 'none' },
          { name: 'Prisma', value: 'prisma' },
          { name: 'TypeORM', value: 'typeorm' },
          { name: 'Mongoose (MongoDB)', value: 'mongoose' }
        ]
      }
    ]);
    
    // Pergunta sobre a arquitetura
    const architectureQuestion = await inquirer.prompt([
      {
        type: 'list',
        name: 'architecture',
        message: 'Qual arquitetura você deseja utilizar?',
        choices: [
          { name: 'MVC (Model-View-Controller)', value: 'mvc' },
          { name: 'Clean Architecture', value: 'clean-arch' },
          { name: 'Padrão Simples', value: 'default' }
        ]
      }
    ]);
    
    const projectConfig = {
      ...toolsQuestions,
      ...architectureQuestion,
      projectName: path.basename(directory),
      targetDirectory: directory
    };
    
    try {
      // Gerar o projeto
      await createProject(projectConfig);
      
      console.log(chalk.green.bold('\n✅ Projeto criado com sucesso!'));
      console.log(chalk.cyan(`\nPara começar, execute:`));
      console.log(chalk.white(`  cd ${directory}`));
      console.log(chalk.white('  npm install'));
      console.log(chalk.white('  npm run dev'));
      
    } catch (error) {
      console.log(chalk.red('Erro ao criar o projeto:'));
      console.error(error);
    }
  });

program.parse(process.argv);