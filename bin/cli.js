#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const inquirer = require('inquirer');
const { blue, green, yellow, red, cyan } = require('kolorist');

const PKG = 'create-fastify-team';

async function main() {
  console.log(blue(`\n${PKG} — Gerador de projetos Fastify para times\n`));

  const answers = await inquirer.prompt([
    {
      name: 'projectName',
      message: 'Nome do projeto (pasta destino):',
      default: 'fastify-app'
    },
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
    {
      name: 'devcontainer',
      type: 'confirm',
      message: 'Criar Dev Container (VS Code)?',
      default: false
    }
  ]);

  // Valida combinações ORM/DB
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

  // Compute deps
  const isTS = answers.language === 'ts';
  const deps = new Set(['fastify', 'dotenv']);
  const devDeps = new Set(['@types/node', 'rimraf']); // rimraf pra limpar dist

  if (isTS) {
    devDeps.add('typescript');
    devDeps.add('tsx'); // executa TS no dev
  } else {
    devDeps.add('nodemon');
  }

  // ORM deps
  if (answers.orm === 'prisma') {
    deps.add('@prisma/client');
    devDeps.add('prisma');
  } else if (answers.orm === 'sequelize') {
    deps.add('sequelize');
    // driver por banco
    if (answers.database === 'postgres') {
      deps.add('pg'); deps.add('pg-hstore');
    } else if (answers.database === 'mysql') {
      deps.add('mysql2');
    } else if (answers.database === 'sqlite') {
      deps.add('sqlite3');
    }
  } else if (answers.orm === 'mongoose') {
    deps.add('mongoose');
  }

  // ESLint deps
  if (answers.eslint !== 'none') {
    devDeps.add('eslint');
    if (answers.eslint === 'prettier') {
      devDeps.add('prettier'); devDeps.add('eslint-config-prettier');
    }
    if (isTS) {
      devDeps.add('@typescript-eslint/parser');
      devDeps.add('@typescript-eslint/eslint-plugin');
    }
  }

  // Estrutura base
  const srcDir = path.join(root, 'src');
  const pluginDir = path.join(srcDir, 'plugins');
  const routesDir = path.join(srcDir, 'routes');
  const configDir = path.join(srcDir, 'config');

  await fsp.mkdir(srcDir, { recursive: true });
  await fsp.mkdir(pluginDir, { recursive: true });
  await fsp.mkdir(routesDir, { recursive: true });
  await fsp.mkdir(configDir, { recursive: true });

  // Arquitetura extra
  if (answers.architecture === 'mvc') {
    await fsp.mkdir(path.join(srcDir, 'controllers'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'services'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'models'), { recursive: true });
  } else if (answers.architecture === 'clean') {
    await fsp.mkdir(path.join(srcDir, 'domain/entities'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'domain/repositories'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'application/use-cases'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'infra/db'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'infra/http'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'infra/repositories'), { recursive: true });
    await fsp.mkdir(path.join(srcDir, 'main'), { recursive: true });
  } else if (answers.architecture === 'modular') {
    await fsp.mkdir(path.join(srcDir, 'modules/example'), { recursive: true });
  }

  // server file
  const ext = isTS ? 'ts' : 'js';
  await fsp.writeFile(path.join(srcDir, `server.${ext}`), serverTemplate(isTS, answers), 'utf8');
  await fsp.writeFile(path.join(routesDir, `hello.${ext}`), helloRouteTemplate(isTS), 'utf8');
  await fsp.writeFile(path.join(routesDir, `health.${ext}`), healthRouteTemplate(isTS), 'utf8');

  // DB plugin
  await fsp.writeFile(path.join(pluginDir, `db.${ext}`), dbPluginTemplate(isTS, answers), 'utf8');

  // config: env loader
  await fsp.writeFile(path.join(configDir, `env.${ext}`), envLoaderTemplate(isTS), 'utf8');

  // .env.example
  await fsp.writeFile(path.join(root, `.env.example`), envExample(answers), 'utf8');

  // tsconfig
  if (isTS) {
    await fsp.writeFile(path.join(root, 'tsconfig.json'), tsconfigTemplate(), 'utf8');
  }

  // ESLint
  if (answers.eslint !== 'none') {
    const eslintName = isTS ? '.eslintrc.cjs' : '.eslintrc.cjs';
    await fsp.writeFile(path.join(root, eslintName), eslintConfigTemplate(answers.eslint, isTS), 'utf8');
    if (answers.eslint === 'prettier') {
      await fsp.writeFile(path.join(root, '.prettierrc'), JSON.stringify({ semi: true, singleQuote: true }, null, 2));
    }
  }

  // Dev Container
  if (answers.devcontainer) {
    const dcDir = path.join(root, '.devcontainer');
    await fsp.mkdir(dcDir, { recursive: true });
    await fsp.writeFile(path.join(dcDir, 'devcontainer.json'), devContainerTemplate(), 'utf8');
    await fsp.writeFile(path.join(dcDir, 'Dockerfile'), devContainerDockerfile(), 'utf8');
  }

  // Prisma schema
  if (answers.orm === 'prisma') {
    const prismaDir = path.join(root, 'prisma');
    await fsp.mkdir(prismaDir, { recursive: true });
    await fsp.writeFile(path.join(prismaDir, 'schema.prisma'), prismaSchemaTemplate(answers.database), 'utf8');
  }

  // Geração dos exemplos de cada template
  await generateCrudExample({ root, answers, isTS, ext });
  await appendUsersImportAndRegister({ root, isTS });

  // package.json do projeto gerado
  const appPkg = applicationPackageJson(answers, Array.from(deps), Array.from(devDeps));
  await fsp.writeFile(path.join(root, 'package.json'), JSON.stringify(appPkg, null, 2), 'utf8');

  console.log('\n' + green('✅ Projeto criado em: ') + cyan(root));
  console.log('\nPróximos passos:');
  console.log(blue(`  cd ${answers.projectName}`));
  console.log(blue('  cp .env.example .env   # ajuste DATABASE_URL'));
  console.log(blue('  npm install'));
  if (answers.orm === 'prisma') {
    console.log(blue('  npx prisma generate     # gera cliente Prisma'));
    if (answers.database !== 'mongodb') console.log(blue('  npx prisma migrate dev  # cria migrações (opcional no MVP)'));
  }
  console.log(blue(isTS ? '  npm run dev' : '  npm run dev'));
  console.log('\nBoas builds! 🚀\n');
}

// Templates
function serverTemplate(isTS, a) {
  const importFastify = `import Fastify from 'fastify';`;
  const importDotenv = `import 'dotenv/config';`;
  const importDB = `import db from './plugins/db.${isTS ? 'ts' : 'js'}';`;
  const importEnv = `import { loadEnv } from './config/env.${isTS ? 'ts' : 'js'}';`;
  const importRoutes = `import hello from './routes/hello.${isTS ? 'ts' : 'js'}';\nimport health from './routes/health.${isTS ? 'ts' : 'js'}';`;

  return `${importDotenv}
${importFastify}
${importEnv}
${importDB}
${importRoutes}

const env = loadEnv();
const app = Fastify({ logger: true });

// registra plugin de DB (no-op se ORM = none)
app.register(db);

// rotas
app.register(health);
app.register(hello, { prefix: '/api' });

const start = async () => {
  try {
    await app.listen({ port: Number(env.PORT) || 3000, host: '0.0.0.0' });
    app.log.info(\`HTTP on :\${env.PORT || 3000}\`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
`;
}

function healthRouteTemplate(isTS) {
  return `export default async function health(fastify, _opts) {
  fastify.get('/health', async () => ({ status: 'ok' }));
}
`;
}

function helloRouteTemplate(isTS) {
  return `export default async function hello(fastify, _opts) {
  fastify.get('/hello', async () => ({ message: 'Hello, Fastify Team!' }));
}
`;
}

function envLoaderTemplate(isTS) {
  return `export function loadEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: process.env.PORT ?? '3000',
    DATABASE_URL: process.env.DATABASE_URL ?? ''
  };
}
`;
}

function dbPluginTemplate(isTS, a) {
  if (a.orm === 'none') {
    return `export default async function dbPlugin(fastify, _opts) {
  fastify.decorate('db', null);
}
`;
  }
  if (a.orm === 'mongoose') {
    return `import mongoose from 'mongoose';

export default async function dbPlugin(fastify, _opts) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    fastify.log.warn('DATABASE_URL não configurado. Pulando conexão MongoDB.');
    fastify.decorate('db', null);
    return;
  }
  await mongoose.connect(url);
  fastify.addHook('onClose', async () => mongoose.connection.close());
  fastify.decorate('db', mongoose);
}
`;
  }
    if (a.orm === 'sequelize') {
    return `import { Sequelize } from 'sequelize';

export default async function dbPlugin(fastify, _opts) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    fastify.log.warn('DATABASE_URL não configurado. Pulando conexão Sequelize.');
    fastify.decorate('db', null);
    return;
  }
  const sequelize = new Sequelize(url, { logging: false });
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // ⚠️ simples p/ MVP: cria tabela users
    fastify.log.info('Sequelize conectado e sincronizado');
  } catch (e) {
    fastify.log.error(e);
  }
  fastify.addHook('onClose', async () => sequelize.close());
  fastify.decorate('db', sequelize);
}
`;
  }
  // Prisma
  return `import { PrismaClient } from '@prisma/client';

export default async function dbPlugin(fastify, _opts) {
  const prisma = new PrismaClient();
  fastify.addHook('onClose', async () => prisma.$disconnect());
  fastify.decorate('db', prisma);
}
`;
}

function envExample(a) {
  const samples = {
    postgres: 'postgresql://user:password@localhost:5432/mydb?schema=public',
    mysql: 'mysql://user:password@localhost:3306/mydb',
    mongodb: 'mongodb://localhost:27017/mydb',
    sqlite: 'file:./dev.db'
  };
  return `# Ambiente
NODE_ENV=development
PORT=3000

# Banco
DATABASE_URL="${samples[a.database]}"
`;
}

async function appendUsersImportAndRegister({ root, isTS }) {
  const srcServer = path.join(root, 'src', `server.${isTS ? 'ts' : 'js'}`);
  let content = await fsp.readFile(srcServer, 'utf8');

  // já tem imports base; vamos inserir import e register
  const importMarker = `import health from './routes/health.${isTS ? 'ts' : 'js'}';`;
  const hasImport = content.includes(`./routes/users.${isTS ? 'ts' : 'js'}`);
  if (!hasImport) {
    content = content.replace(
      importMarker,
      `${importMarker}\nimport users from './routes/users.${isTS ? 'ts' : 'js'}';`
    );
  }

  const registerMarker = `app.register(hello, { prefix: '/api' });`;
  if (!content.includes(`app.register(users`)) {
    content = content.replace(
      registerMarker,
      `${registerMarker}\napp.register(users, { prefix: '/api' });`
    );
  }

  await fsp.writeFile(srcServer, content, 'utf8');
}

async function generateCrudExample({ root, answers, isTS, ext }) {
  const srcDir = path.join(root, 'src');
  const orm = answers.orm; // 'prisma' | 'sequelize' | 'mongoose' | 'none'
  const arch = answers.architecture; // 'mvc' | 'clean' | 'modular'

  // 1) sempre criamos uma rota users que chama a camada da arquitetura
  const routesDir = path.join(srcDir, 'routes');
  await fsp.writeFile(path.join(routesDir, `users.${ext}`), usersRouteTemplate(arch, isTS), 'utf8');

  if (arch === 'mvc') {
    await generateMvcCrud({ root, isTS, ext, orm });
  } else if (arch === 'clean') {
    await generateCleanCrud({ root, isTS, ext, orm });
  } else {
    await generateModularCrud({ root, isTS, ext, orm });
  }
}

function usersRouteTemplate(arch, isTS) {
  const importPath =
    arch === 'mvc'
      ? "../controllers/userController"
      : arch === 'clean'
      ? "../infra/http/users.controller"
      : "../modules/users"; // modular expõe handlers

  return `import * as handlers from '${importPath}.${isTS ? 'ts' : 'js'}';

export default async function users(fastify, _opts) {
  fastify.get('/users', handlers.listUsers(fastify));
  fastify.get('/users/:id', handlers.getUser(fastify));
  fastify.post('/users', handlers.createUser(fastify));
  fastify.put('/users/:id', handlers.updateUser(fastify));
  fastify.delete('/users/:id', handlers.deleteUser(fastify));
}
`;
}

async function generateMvcCrud({ root, isTS, ext, orm }) {
  const base = path.join(root, 'src');
  const controllersDir = path.join(base, 'controllers');
  const servicesDir = path.join(base, 'services');
  const modelsDir = path.join(base, 'models');
  await fsp.mkdir(controllersDir, { recursive: true });
  await fsp.mkdir(servicesDir, { recursive: true });
  await fsp.mkdir(modelsDir, { recursive: true });

  // Model (se preciso)
  if (orm === 'sequelize') {
    await fsp.writeFile(path.join(modelsDir, `user.${ext}`), sequelizeUserModel(), 'utf8');
  } else if (orm === 'mongoose') {
    await fsp.writeFile(path.join(modelsDir, `user.${ext}`), mongooseUserModel(), 'utf8');
  } else if (orm === 'none') {
    await fsp.writeFile(path.join(modelsDir, `user.${ext}`), memoryUserStore(), 'utf8');
  }

  await fsp.writeFile(path.join(servicesDir, `userService.${ext}`), mvcServiceTemplate(orm), 'utf8');
  await fsp.writeFile(path.join(controllersDir, `userController.${ext}`), mvcControllerTemplate(), 'utf8');
}

// MODELS
function sequelizeUserModel() {
  return `import { DataTypes } from 'sequelize';

export function defineUser(sequelize) {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING }
  }, { tableName: 'users', timestamps: false });
  return User;
}
`;
}
function mongooseUserModel() {
  return `import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String }
}, { timestamps: false });
export const User = mongoose.models.User || mongoose.model('User', schema);
`;
}
function memoryUserStore() {
  return `const store = { seq: 1, data: [] };
export default store;
`;
}

// SERVICE
function mvcServiceTemplate(orm) {
  if (orm === 'prisma') {
    return `export function buildUserService(db) {
  return {
    list: () => db.user.findMany(),
    get: (id) => db.user.findUnique({ where: { id: Number(id) } }),
    create: (dto) => db.user.create({ data: dto }),
    update: (id, dto) => db.user.update({ where: { id: Number(id) }, data: dto }),
    delete: (id) => db.user.delete({ where: { id: Number(id) } })
  };
}
`;
  }
  if (orm === 'sequelize') {
    return `import { defineUser } from '../models/user.${'js'}';

export function buildUserService(db) {
  const User = defineUser(db); // db = Sequelize
  return {
    list: () => User.findAll(),
    get: (id) => User.findByPk(Number(id)),
    create: (dto) => User.create(dto),
    update: async (id, dto) => {
      const inst = await User.findByPk(Number(id));
      if (!inst) return null;
      return inst.update(dto);
    },
    delete: async (id) => {
      const inst = await User.findByPk(Number(id));
      if (!inst) return 0;
      await inst.destroy();
      return 1;
    }
  };
}
`;
  }
  if (orm === 'mongoose') {
    return `import { User } from '../models/user.${'js'}';

export function buildUserService(_db) {
  return {
    list: () => User.find(),
    get: (id) => User.findById(id),
    create: (dto) => User.create(dto),
    update: (id, dto) => User.findByIdAndUpdate(id, dto, { new: true }),
    delete: (id) => User.findByIdAndDelete(id).then(r => (r ? 1 : 0))
  };
}
`;
  }
  // none -> memory
  return `import store from '../models/user.${'js'}';

export function buildUserService(_db) {
  return {
    list: () => store.data,
    get: (id) => store.data.find(u => u.id === Number(id)) || null,
    create: (dto) => {
      const u = { id: store.seq++, email: dto.email, name: dto.name ?? null };
      store.data.push(u);
      return u;
    },
    update: (id, dto) => {
      const idx = store.data.findIndex(u => u.id === Number(id));
      if (idx < 0) return null;
      store.data[idx] = { ...store.data[idx], ...dto };
      return store.data[idx];
    },
    delete: (id) => {
      const before = store.data.length;
      store.data = store.data.filter(u => u.id !== Number(id));
      return before - store.data.length;
    }
  };
}
`;
}

// CONTROLLER
function mvcControllerTemplate() {
  return `import { buildUserService } from '../services/userService.js';

export const listUsers = (fastify) => async (_req, reply) => {
  const svc = buildUserService(fastify.db);
  const data = await svc.list();
  return reply.send(data);
};

export const getUser = (fastify) => async (req, reply) => {
  const svc = buildUserService(fastify.db);
  const item = await svc.get(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify) => async (req, reply) => {
  const svc = buildUserService(fastify.db);
  const created = await svc.create(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify) => async (req, reply) => {
  const svc = buildUserService(fastify.db);
  const updated = await svc.update(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify) => async (req, reply) => {
  const svc = buildUserService(fastify.db);
  const n = await svc.delete(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
}

async function generateCleanCrud({ root, isTS, ext, orm }) {
  const base = path.join(root, 'src');
  const domain = path.join(base, 'domain');
  const app = path.join(base, 'application');
  const infra = path.join(base, 'infra');
  await fsp.mkdir(path.join(domain, 'entities'), { recursive: true });
  await fsp.mkdir(path.join(domain, 'repositories'), { recursive: true });
  await fsp.mkdir(path.join(app, 'use-cases'), { recursive: true });
  await fsp.mkdir(path.join(infra, 'repositories'), { recursive: true });
  await fsp.mkdir(path.join(infra, 'http'), { recursive: true });

  await fsp.writeFile(path.join(domain, 'entities', `User.${ext}`), cleanEntity(), 'utf8');
  await fsp.writeFile(path.join(domain, 'repositories', `UserRepository.${ext}`), cleanRepoPort(), 'utf8');

  await fsp.writeFile(path.join(app, 'use-cases', `CreateUser.${ext}`), useCaseCreate(), 'utf8');
  await fsp.writeFile(path.join(app, 'use-cases', `UpdateUser.${ext}`), useCaseUpdate(), 'utf8');
  await fsp.writeFile(path.join(app, 'use-cases', `DeleteUser.${ext}`), useCaseDelete(), 'utf8');
  await fsp.writeFile(path.join(app, 'use-cases', `GetUser.${ext}`), useCaseGet(), 'utf8');
  await fsp.writeFile(path.join(app, 'use-cases', `ListUsers.${ext}`), useCaseList(), 'utf8');

  await fsp.writeFile(path.join(infra, 'repositories', `UserRepository.${ext}`), infraRepoImpl(orm), 'utf8');
  await fsp.writeFile(path.join(infra, 'http', `users.controller.${ext}`), cleanController(), 'utf8');
}

function cleanEntity() {
  return `export class User {
  constructor(public id, public email, public name) {}
}
`;
}
function cleanRepoPort() {
  return `export class UserRepository {
  list() { throw new Error('not implemented'); }
  get(id) { throw new Error('not implemented'); }
  create(dto) { throw new Error('not implemented'); }
  update(id, dto) { throw new Error('not implemented'); }
  delete(id) { throw new Error('not implemented'); }
}
`;
}
function useCaseCreate() {
  return `export const CreateUser = (repo) => ({ execute: (dto) => repo.create(dto) });`;
}
function useCaseUpdate() {
  return `export const UpdateUser = (repo) => ({ execute: (id, dto) => repo.update(id, dto) });`;
}
function useCaseDelete() {
  return `export const DeleteUser = (repo) => ({ execute: (id) => repo.delete(id) });`;
}
function useCaseGet() {
  return `export const GetUser = (repo) => ({ execute: (id) => repo.get(id) });`;
}
function useCaseList() {
  return `export const ListUsers = (repo) => ({ execute: () => repo.list() });`;
}
function infraRepoImpl(orm) {
  if (orm === 'prisma') {
    return `import { UserRepository } from '../../domain/repositories/UserRepository.js';
export class PrismaUserRepository extends UserRepository {
  constructor(db) { super(); this.db = db; }
  list() { return this.db.user.findMany(); }
  get(id) { return this.db.user.findUnique({ where: { id: Number(id) } }); }
  create(dto) { return this.db.user.create({ data: dto }); }
  update(id, dto) { return this.db.user.update({ where: { id: Number(id) }, data: dto }); }
  delete(id) { return this.db.user.delete({ where: { id: Number(id) } }).then(_=>1).catch(_=>0); }
}
`;
  }
  if (orm === 'sequelize') {
    return `import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { DataTypes } from 'sequelize';
export class SequelizeUserRepository extends UserRepository {
  constructor(db) {
    super(); this.db = db;
    this.User = this.db.define('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      name: { type: DataTypes.STRING }
    }, { tableName: 'users', timestamps: false });
  }
  list() { return this.User.findAll(); }
  get(id) { return this.User.findByPk(Number(id)); }
  create(dto) { return this.User.create(dto); }
  async update(id, dto) { const inst = await this.User.findByPk(Number(id)); if(!inst) return null; return inst.update(dto); }
  async delete(id) { const inst = await this.User.findByPk(Number(id)); if(!inst) return 0; await inst.destroy(); return 1; }
}
`;
  }
  if (orm === 'mongoose') {
    return `import { UserRepository } from '../../domain/repositories/UserRepository.js';
import mongoose from 'mongoose';
const schema = new mongoose.Schema({ email: { type: String, unique: true, required: true }, name: String }, { timestamps: false });
const User = mongoose.models.User || mongoose.model('User', schema);

export class MongooseUserRepository extends UserRepository {
  list() { return User.find(); }
  get(id) { return User.findById(id); }
  create(dto) { return User.create(dto); }
  update(id, dto) { return User.findByIdAndUpdate(id, dto, { new: true }); }
  delete(id) { return User.findByIdAndDelete(id).then(r => (r ? 1 : 0)); }
}
`;
  }
  // none
  return `import { UserRepository } from '../../domain/repositories/UserRepository.js';
const store = { seq: 1, data: [] };
export class MemoryUserRepository extends UserRepository {
  list() { return store.data; }
  get(id) { return store.data.find(u => u.id === Number(id)) || null; }
  create(dto) { const u = { id: store.seq++, email: dto.email, name: dto.name ?? null }; store.data.push(u); return u; }
  update(id, dto) { const i = store.data.findIndex(u => u.id === Number(id)); if(i<0) return null; store.data[i] = { ...store.data[i], ...dto }; return store.data[i]; }
  delete(id) { const before = store.data.length; store.data = store.data.filter(u => u.id !== Number(id)); return before - store.data.length; }
}
`;
}
function cleanController() {
  return `import { PrismaUserRepository } from '../repositories/UserRepository.js';
import { SequelizeUserRepository } from '../repositories/UserRepository.js';
import { MongooseUserRepository } from '../repositories/UserRepository.js';
import { MemoryUserRepository } from '../repositories/UserRepository.js';
import { CreateUser } from '../../application/use-cases/CreateUser.js';
import { UpdateUser } from '../../application/use-cases/UpdateUser.js';
import { DeleteUser } from '../../application/use-cases/DeleteUser.js';
import { GetUser } from '../../application/use-cases/GetUser.js';
import { ListUsers } from '../../application/use-cases/ListUsers.js';

// fábrica de repo conforme ORM do fastify.db
function makeRepo(db) {
  if (!db) return new MemoryUserRepository();
  if (db?.$transaction) return new PrismaUserRepository(db);
  if (db?.models || db?.define) return new SequelizeUserRepository(db);
  if (db?.connection || db?.model) return new MongooseUserRepository();
  return new MemoryUserRepository();
}

export const listUsers = (fastify) => async (_req, reply) => {
  const repo = makeRepo(fastify.db);
  const uc = ListUsers(repo);
  return reply.send(await uc.execute());
};
export const getUser = (fastify) => async (req, reply) => {
  const repo = makeRepo(fastify.db);
  const uc = GetUser(repo);
  const item = await uc.execute(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};
export const createUser = (fastify) => async (req, reply) => {
  const repo = makeRepo(fastify.db);
  const uc = CreateUser(repo);
  const created = await uc.execute(req.body);
  return reply.code(201).send(created);
};
export const updateUser = (fastify) => async (req, reply) => {
  const repo = makeRepo(fastify.db);
  const uc = UpdateUser(repo);
  const updated = await uc.execute(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};
export const deleteUser = (fastify) => async (req, reply) => {
  const repo = makeRepo(fastify.db);
  const uc = DeleteUser(repo);
  const n = await uc.execute(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
}

async function generateModularCrud({ root, isTS, ext, orm }) {
  const usersDir = path.join(root, 'src', 'modules', 'users');
  await fsp.mkdir(usersDir, { recursive: true });

  // model se precisar
  if (orm === 'sequelize') {
    await fsp.writeFile(path.join(usersDir, `model.${ext}`), `import { DataTypes } from 'sequelize';
export function defineUser(sequelize) {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING }
  }, { tableName: 'users', timestamps: false });
}
`, 'utf8');
  } else if (orm === 'mongoose') {
    await fsp.writeFile(path.join(usersDir, `model.${ext}`), `import mongoose from 'mongoose';
const schema = new mongoose.Schema({ email: { type: String, unique: true, required: true }, name: String }, { timestamps: false });
export const User = mongoose.models.User || mongoose.model('User', schema);
`, 'utf8');
  }

  await fsp.writeFile(path.join(usersDir, `repository.${ext}`), modularRepository(orm), 'utf8');
  await fsp.writeFile(path.join(usersDir, `index.${ext}`), modularHandlers(), 'utf8');
}

function modularRepository(orm) {
  if (orm === 'prisma') {
    return `export const repo = (db) => ({
  list: () => db.user.findMany(),
  get: (id) => db.user.findUnique({ where: { id: Number(id) } }),
  create: (dto) => db.user.create({ data: dto }),
  update: (id, dto) => db.user.update({ where: { id: Number(id) }, data: dto }),
  delete: (id) => db.user.delete({ where: { id: Number(id) } }).then(_=>1).catch(_=>0)
});
`;
  }
  if (orm === 'sequelize') {
    return `import { defineUser } from './model.js';
export const repo = (sequelize) => {
  const User = defineUser(sequelize);
  return {
    list: () => User.findAll(),
    get: (id) => User.findByPk(Number(id)),
    create: (dto) => User.create(dto),
    update: async (id, dto) => { const inst = await User.findByPk(Number(id)); if(!inst) return null; return inst.update(dto); },
    delete: async (id) => { const inst = await User.findByPk(Number(id)); if(!inst) return 0; await inst.destroy(); return 1; }
  };
};
`;
  }
  if (orm === 'mongoose') {
    return `import { User } from './model.js';
export const repo = (_db) => ({
  list: () => User.find(),
  get: (id) => User.findById(id),
  create: (dto) => User.create(dto),
  update: (id, dto) => User.findByIdAndUpdate(id, dto, { new: true }),
  delete: (id) => User.findByIdAndDelete(id).then(r => (r ? 1 : 0))
});
`;
  }
  // none
  return `const store = { seq: 1, data: [] };
export const repo = (_db) => ({
  list: () => store.data,
  get: (id) => store.data.find(u => u.id === Number(id)) || null,
  create: (dto) => { const u = { id: store.seq++, email: dto.email, name: dto.name ?? null }; store.data.push(u); return u; },
  update: (id, dto) => { const i = store.data.findIndex(u => u.id === Number(id)); if(i<0) return null; store.data[i] = { ...store.data[i], ...dto }; return store.data[i]; },
  delete: (id) => { const before = store.data.length; store.data = store.data.filter(u => u.id !== Number(id)); return before - store.data.length; }
});
`;
}
function modularHandlers() {
  return `import { repo as buildRepo } from './repository.js';

export const listUsers = (fastify) => async (_req, reply) => {
  const r = buildRepo(fastify.db);
  return reply.send(await r.list());
};
export const getUser = (fastify) => async (req, reply) => {
  const r = buildRepo(fastify.db);
  const item = await r.get(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};
export const createUser = (fastify) => async (req, reply) => {
  const r = buildRepo(fastify.db);
  const created = await r.create(req.body);
  return reply.code(201).send(created);
};
export const updateUser = (fastify) => async (req, reply) => {
  const r = buildRepo(fastify.db);
  const updated = await r.update(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};
export const deleteUser = (fastify) => async (req, reply) => {
  const r = buildRepo(fastify.db);
  const n = await r.delete(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
}



function tsconfigTemplate() {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'NodeNext',
      outDir: 'dist',
      skipLibCheck: true,
      strict: true,
      esModuleInterop: true
    },
    include: ['src']
  }, null, 2);
}

function eslintConfigTemplate(kind, isTS) {
  if (isTS) {
    const base = {
      root: true,
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      env: { node: true, es2022: true }
    };
    if (kind === 'prettier') {
      base.extends = ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'];
    } else {
      base.extends = ['eslint:recommended', 'plugin:@typescript-eslint/recommended'];
    }
    base.parserOptions = { sourceType: 'module' };
    return 'module.exports = ' + JSON.stringify(base, null, 2) + '\n';
  } else {
    const base = {
      root: true,
      env: { node: true, es2022: true },
      parserOptions: { sourceType: 'module' },
      extends: kind === 'prettier' ? ['eslint:recommended', 'prettier'] : ['eslint:recommended']
    };
    return 'module.exports = ' + JSON.stringify(base, null, 2) + '\n';
  }
}

function devContainerTemplate() {
  return `{
  "name": "Fastify Team",
  "build": { "dockerfile": "Dockerfile" },
  "forwardPorts": [3000],
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
`;
}

function devContainerDockerfile() {
  return `FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye
WORKDIR /workspaces/app
`;
}

function prismaSchemaTemplate(db) {
  const provider = db === 'postgres' ? 'postgresql'
    : db === 'mysql' ? 'mysql'
    : db === 'mongodb' ? 'mongodb'
    : 'sqlite';

  const preview = db === 'mongodb' ? '[], // MongoDB não requer previews aqui no MVP' : '[]';

  const datasource = db === 'sqlite'
    ? `datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}`
    : `datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}`;

  const modelExample = db === 'mongodb'
    ? `model User {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  email String @unique
  name  String?
}`
    : `model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
}`;

  return `${datasource}

generator client {
  provider = "prisma-client-js"
}

${modelExample}
`;
}

function applicationPackageJson(a, deps, devDeps) {
  const isTS = a.language === 'ts';
  const scripts = isTS ? {
    "dev": "tsx watch src/server.ts",
    "build": "rimraf dist && tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "lint": a.eslint === 'none' ? "echo \"no lint\"" : "eslint ."
  } : {
    "dev": "nodemon --watch src --ext js,mjs --exec \"node src/server.js\"",
    "start": "node src/server.js",
    "lint": a.eslint === 'none' ? "echo \"no lint\"" : "eslint ."
  };

  const pkg = {
    name: a.projectName,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts,
    dependencies: {},
    devDependencies: {}
  };

  // Prisma precisa do "prisma" no scripts convenientemente
  if (a.orm === 'prisma') {
    pkg.scripts['prisma:studio'] = 'prisma studio';
    pkg.scripts['prisma:generate'] = 'prisma generate';
    pkg.scripts['prisma:migrate'] = 'prisma migrate dev';
  }

  deps.sort().forEach(d => pkg.dependencies[d] = "latest");
  devDeps.sort().forEach(d => pkg.devDependencies[d] = "latest");

  return pkg;
}

main().catch((e) => {
  console.error(red('Erro ao criar o projeto:'), e);
  process.exit(1);
});
