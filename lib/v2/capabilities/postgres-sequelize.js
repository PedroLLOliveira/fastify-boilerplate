// Capability de persistência: PostgreSQL via Sequelize, para a arquitetura
// modular. Só o que de fato é específico deste ORM mora aqui — client de
// banco, plugin fastify, model, migrations (sequelize-cli), seed,
// repositório e a checagem de /ready. Rotas, schemas, handler e error/
// not-found handler vêm do núcleo compartilhado em
// architectures/modular-persisted.js; .env.example, config/env.ts e
// docker-compose.yml vêm de postgres-shared.js (mesma infra que o Kysely
// usa, mas isso é coincidência de "os dois sobem Postgres", não uma regra
// da arquitetura).
import { envFileContent, configEnvContent, dockerComposeContent } from './postgres-shared.js';

const sequelizercContent = `const path = require('path');

module.exports = {
  'config': path.resolve('src/db/config.cjs'),
  'models-path': path.resolve('src/db/models'),
  'seeders-path': path.resolve('src/db/seeders'),
  'migrations-path': path.resolve('src/db/migrations')
};
`;

const sequelizeConfigCjsContent = `require('dotenv/config');

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false
  }
};
`;

const databaseTsContent = `import { Sequelize } from 'sequelize';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'test' ? false : console.log,
});
`;

const dbPluginContent = `import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { sequelize } from '../db/database.js';

export default fp(async (fastify: FastifyInstance) => {
  // Fail-fast test connection
  await sequelize.authenticate();

  fastify.decorate('db', sequelize);

  fastify.addHook('onClose', async () => {
    await sequelize.close();
  });
});
`;

const userModelContent = `import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database.js';

export class User extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
  declare created_at: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);
`;

const migration0001Content = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
`;

const seedScriptContent = `import { User } from '../models/user.js';
import { sequelize } from '../database.js';

async function seed() {
  await User.findOrCreate({
    where: { email: 'ada@example.com' },
    defaults: { name: 'Ada Lovelace', email: 'ada@example.com' }
  });

  console.log('Seed concluído: usuário de exemplo garantido.');
  await sequelize.close();
}

seed().catch((err) => {
  console.error('Falha ao rodar o seed:', err);
  process.exit(1);
});
`;

const healthRouteContent = `import type { FastifyInstance } from 'fastify';
import { getHealthSchema } from './health.schema.js';
import { sequelize } from '../../db/database.js';

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/health', { schema: getHealthSchema }, async () => ({ status: 'ok' }));

  app.get('/ready', { schema: getHealthSchema }, async (req, reply) => {
    try {
      await sequelize.authenticate();
      return { status: 'ok' };
    } catch (err) {
      req.log.error(err);
      return reply.status(503).send({ status: 'unavailable' });
    }
  });
}
`;

const usersServiceContent = `import * as userRepository from './users.repository.js';

export async function listUsers() {
  return userRepository.findAll();
}

export async function createUser(name: string, email: string) {
  return userRepository.create(name, email);
}
`;

const usersRepositoryContent = `import { UniqueConstraintError } from 'sequelize';
import { User } from '../../db/models/user.js';

export async function findAll() {
  return User.findAll({ attributes: ['id', 'name', 'email', 'created_at'] });
}

export async function findByEmail(email: string) {
  return User.findOne({ where: { email } });
}

export async function create(name: string, email: string) {
  try {
    const user = await User.create({ name, email });
    return user.toJSON();
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      const err = new Error('Email already in use');
      err.name = 'ConflictError';
      throw err;
    }
    throw error;
  }
}
`;

const testEnvContent = `import test from 'node:test';
import assert from 'node:assert';
import { loadEnv } from '../src/config/env.js';

test('Throws if DATABASE_URL is missing', () => {
  const original = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  assert.throws(() => loadEnv(), /DATABASE_URL is missing/);
  process.env.DATABASE_URL = original; // Restore
});
`;

const testEnvContentVitest = `import { test, expect } from 'vitest';
import { loadEnv } from '../src/config/env.js';

test('Throws if DATABASE_URL is missing', () => {
  const original = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  expect(() => loadEnv()).toThrow(/DATABASE_URL is missing/);
  process.env.DATABASE_URL = original; // Restore
});
`;

const testUsersContent = `import test from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app.js';
import { User } from '../src/db/models/user.js';

test('Users API flow', async (t) => {
  // We clean the table before testing to ensure idempotency
  await User.destroy({ truncate: true, cascade: true });
  const app = await buildApp();

  await t.test('POST /users creates a user', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { name: 'Alice', email: 'alice@test.com' }
    });
    assert.strictEqual(res.statusCode, 201);
    const data = res.json().data;
    assert.strictEqual(data.name, 'Alice');
  });

  await t.test('POST /users returns 409 on email conflict', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { name: 'Alice 2', email: 'alice@test.com' }
    });
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.json().error, 'Conflict');
  });

  await t.test('GET /users returns list', async () => {
    const res = await app.inject({ method: 'GET', url: '/users' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json().data.length, 1);
  });

  await t.test('POST /users returns 400 on invalid payload', async () => {
    const res = await app.inject({ method: 'POST', url: '/users', payload: {} });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.json().error, 'Bad Request');
  });

  await t.test('GET /missing returns 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/missing' });
    assert.strictEqual(res.statusCode, 404);
  });

  await t.test('GET /ready returns 200 with DB available', async () => {
    const res = await app.inject({ method: 'GET', url: '/ready' });
    assert.strictEqual(res.statusCode, 200);
  });

  await app.close();
});
`;

const testUsersContentVitest = `import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { User } from '../src/db/models/user.js';

describe('Users API flow', () => {
  let app;

  beforeAll(async () => {
    // We clean the table before testing to ensure idempotency
    await User.destroy({ truncate: true, cascade: true });
    app = await buildApp();
  });

  afterAll(() => app.close());

  test('POST /users creates a user', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { name: 'Alice', email: 'alice@test.com' }
    });
    expect(res.statusCode).toBe(201);
    const data = res.json().data;
    expect(data.name).toBe('Alice');
  });

  test('POST /users returns 409 on email conflict', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { name: 'Alice 2', email: 'alice@test.com' }
    });
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe('Conflict');
  });

  test('GET /users returns list', async () => {
    const res = await app.inject({ method: 'GET', url: '/users' });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.length).toBe(1);
  });

  test('POST /users returns 400 on invalid payload', async () => {
    const res = await app.inject({ method: 'POST', url: '/users', payload: {} });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('Bad Request');
  });

  test('GET /missing returns 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/missing' });
    expect(res.statusCode).toBe(404);
  });

  test('GET /ready returns 200 with DB available', async () => {
    const res = await app.inject({ method: 'GET', url: '/ready' });
    expect(res.statusCode).toBe(200);
  });
});
`;

/** @type {import('../core/types.d.ts').Capability} */
export const postgresSequelizeCapability = {
  id: 'postgres-sequelize',
  kind: 'persistence',
  dependencies: {
    runtime: ['fastify-plugin', 'pg', 'pg-hstore', 'sequelize'],
    dev: ['@types/pg', 'sequelize-cli']
  },
  files: [
    { path: '.env.example', content: envFileContent },
    { path: 'docker-compose.yml', content: dockerComposeContent },
    { path: 'src/config/env.ts', content: configEnvContent },
    { path: '.sequelizerc', content: sequelizercContent },
    { path: 'src/plugins/db-sequelize.ts', content: dbPluginContent },
    { path: 'src/db/database.ts', content: databaseTsContent },
    { path: 'src/db/config.cjs', content: sequelizeConfigCjsContent },
    { path: 'src/db/models/user.ts', content: userModelContent },
    { path: 'src/db/migrations/20240101000000-create-users.cjs', content: migration0001Content },
    { path: 'src/db/scripts/seed.ts', content: seedScriptContent },
    { path: 'src/modules/health/health.route.ts', content: healthRouteContent },
    { path: 'src/modules/users/users.service.ts', content: usersServiceContent },
    { path: 'src/modules/users/users.repository.ts', content: usersRepositoryContent }
  ],
  scripts: {
    predev: 'docker compose up -d --wait && npm run db:migrate && npm run db:seed',
    'dev:no-infra': 'tsx watch src/server.ts',
    'db:migrate': 'sequelize-cli db:migrate',
    'db:seed': 'tsx src/db/scripts/seed.ts',
    'db:reset': 'docker compose down -v && docker compose up -d --wait && npm run db:migrate && npm run db:seed'
  },
  testFiles: {
    'node-native-test': [
      { path: 'tests/env.test.ts', content: testEnvContent },
      { path: 'tests/users.test.ts', content: testUsersContent }
    ],
    vitest: [
      { path: 'tests/env.test.ts', content: testEnvContentVitest },
      { path: 'tests/users.test.ts', content: testUsersContentVitest }
    ]
  },
  appFragment: {
    imports: ["import dbPlugin from './plugins/db-sequelize.js';"],
    needsEnv: false,
    registration: 'await app.register(dbPlugin);'
  }
};
