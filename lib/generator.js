import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função principal para criar o projeto
export async function createProject(config) {
  const { targetDirectory, architecture, tools, orm, projectName } = config;
  
  console.log(chalk.blue('Criando diretório do projeto...'));
  fs.ensureDirSync(targetDirectory);
  
  // Copiar template base da arquitetura selecionada
  const templateDir = path.join(__dirname, '../templates', architecture);
  console.log(chalk.blue(`Aplicando template da arquitetura ${architecture}...`));
  await fs.copy(templateDir, targetDirectory, { overwrite: true });
  
  // Adicionar ferramentas selecionadas
  console.log(chalk.blue('Adicionando ferramentas selecionadas...'));
  for (const tool of tools) {
    await addTool(tool, targetDirectory);
  }
  
  // Adicionar ORM selecionado
  if (orm !== 'none') {
    console.log(chalk.blue(`Configurando ORM: ${orm}...`));
    await addORM(orm, targetDirectory);
  }
  
  // Criar ou modificar package.json
  await updatePackageJson(targetDirectory, config);
  
  // Processar templates EJS
  await processTemplates(targetDirectory, config);
  
  // Criar o README
  await createReadme(targetDirectory, config);
}

// Função para adicionar uma ferramenta específica
async function addTool(tool, targetDir) {
  const toolDir = path.join(__dirname, '../templates/partials', tool);
  
  if (fs.existsSync(toolDir)) {
    await fs.copy(toolDir, targetDir, { overwrite: true });
    console.log(chalk.green(`✅ Ferramenta ${tool} adicionada`));
  } else {
    console.log(chalk.yellow(`⚠️ Template para ${tool} não encontrado`));
  }
}

// Função para adicionar um ORM específico
async function addORM(orm, targetDir) {
  const ormDir = path.join(__dirname, '../templates/partials/orms', orm);
  
  if (fs.existsSync(ormDir)) {
    await fs.copy(ormDir, targetDir, { overwrite: true });
    console.log(chalk.green(`✅ ORM ${orm} configurado`));
  } else {
    console.log(chalk.yellow(`⚠️ Template para o ORM ${orm} não encontrado`));
  }
}

// Função para atualizar o package.json com as dependências corretas
async function updatePackageJson(targetDir, config) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  let packageJson = {};
  
  // Se já existe um package.json, carregar ele
  if (fs.existsSync(packageJsonPath)) {
    packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  }
  
  // Configuração básica
  packageJson.name = config.projectName;
  packageJson.version = packageJson.version || '1.0.0';
  packageJson.description = packageJson.description || 'Projeto Fastify criado com fastify-boilerplate';
  
  // Adicionar scripts base
  packageJson.scripts = {
    ...packageJson.scripts,
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  };
  
  // Adicionar dependências base
  packageJson.dependencies = {
    ...packageJson.dependencies,
    "fastify": "^4.24.0",
    "fastify-plugin": "^4.5.1",
    "dotenv": "^16.3.1"
  };
  
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    "nodemon": "^3.0.1"
  };
  
  // Adicionar dependências específicas baseadas nas ferramentas
  if (config.tools.includes('eslint')) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      "eslint": "^8.50.0",
      "eslint-config-standard": "^17.1.0",
      "eslint-plugin-import": "^2.28.1"
    };
    packageJson.scripts.lint = "eslint src";
  }
  
  if (config.tools.includes('prettier')) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      "prettier": "^3.0.3"
    };
    packageJson.scripts.format = "prettier --write \"src/**/*.js\"";
  }
  
  if (config.tools.includes('jest')) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      "jest": "^29.7.0",
      "supertest": "^6.3.3"
    };
    packageJson.scripts.test = "jest";
    packageJson.scripts["test:watch"] = "jest --watch";
  }
  
  // Adicionar dependências do ORM
  if (config.orm === 'prisma') {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      "@prisma/client": "^5.3.1",
      "prisma": "^5.3.1"
    };
    packageJson.scripts.prisma = "prisma";
    packageJson.scripts["prisma:generate"] = "prisma generate";
    packageJson.scripts["prisma:migrate"] = "prisma migrate dev";
  } else if (config.orm === 'typeorm') {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "typeorm": "^0.3.17",
      "pg": "^8.11.3",
      "reflect-metadata": "^0.1.13"
    };
  } else if (config.orm === 'mongoose') {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "mongoose": "^7.5.3"
    };
  }
  
  // Salvar o package.json atualizado
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(chalk.green('✅ package.json configurado'));
}

// Função para processar templates EJS
async function processTemplates(targetDir, config) {
  const files = await fs.readdir(targetDir, { recursive: true });
  
  for (const file of files) {
    const filePath = path.join(targetDir, file);
    const stats = await fs.stat(filePath);
    
    if (stats.isFile() && file.endsWith('.ejs')) {
      const content = await fs.readFile(filePath, 'utf8');
      const rendered = ejs.render(content, config);
      
      // Salvar o arquivo processado sem a extensão .ejs
      const newFilePath = filePath.replace('.ejs', '');
      await fs.writeFile(newFilePath, rendered);
      await fs.remove(filePath);
    }
  }
  
  console.log(chalk.green('✅ Templates processados'));
}

// Função para criar README
async function createReadme(targetDir, config) {
  const readmePath = path.join(targetDir, 'README.md');
  
  const readmeContent = `# ${config.projectName}

## Sobre
Projeto criado com fastify-boilerplate usando arquitetura ${config.architecture}.

## Ferramentas incluídas
${config.tools.map(tool => `- ${tool}`).join('\n')}
${config.orm !== 'none' ? `\n## ORM\n- ${config.orm}` : ''}

## Começando

\`\`\`bash
# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev

# Iniciar em produção
npm start
\`\`\`

${config.tools.includes('jest') ? '## Testes\n\n```bash\nnpm test\n```' : ''}
`;

  await fs.writeFile(readmePath, readmeContent);
  console.log(chalk.green('✅ README.md criado'));
}