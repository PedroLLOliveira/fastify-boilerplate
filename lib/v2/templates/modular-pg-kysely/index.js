import {
  tsconfigContent,
  eslintContent,
  gitignoreContent,
  healthSchemaContent,
  serverContent
} from '../modular/index.js';

export { tsconfigContent, eslintContent, gitignoreContent, healthSchemaContent, serverContent };

export const healthRouteContent = `import type { FastifyInstance } from 'fastify';
import { sql } from 'kysely';
import { getHealthSchema } from './health.schema.js';
import { db } from '../../db/database.js';

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/health', { schema: getHealthSchema }, async () => ({ status: 'ok' }));

  app.get('/ready', { schema: getHealthSchema }, async (req, reply) => {
    try {
      await sql\`SELECT 1\`.execute(db);
      return { status: 'ok' };
    } catch (err) {
      req.log.error(err);
      return reply.status(503).send({ status: 'unavailable' });
    }
  });
}
`;

export const dockerComposeContent = `services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: fastify_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devuser -d fastify_dev"]
      interval: 2s
      timeout: 3s
      retries: 15

volumes:
  postgres_data:
`;

export const envFileContent = `PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://devuser:devpassword@localhost:5432/fastify_dev
`;

export const configEnvContent = `import 'dotenv/config';

export function loadEnv() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in environment variables');
  }
  return {
    PORT: process.env.PORT || '3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL
  };
}
`;

export const dbPoolContent = `import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import pkg from 'pg';
const { Pool } = pkg;

export default fp(async (fastify: FastifyInstance, opts: { connectionString: string }) => {
  const pool = new Pool({
    connectionString: opts.connectionString,
  });

  // Fail-fast test connection
  const client = await pool.connect();
  client.release();

  fastify.decorate('dbPool', pool);

  fastify.addHook('onClose', async () => {
    await pool.end();
  });
});
`;

export const databaseTsContent = `import { Kysely, PostgresDialect, type Generated } from 'kysely';
import pkg from 'pg';
import { loadEnv } from '../config/env.js';

const { Pool } = pkg;

// Interfaces for tables
export interface UserTable {
  id: Generated<string>;
  name: string;
  email: string;
  created_at: Generated<Date>;
}

export interface Database {
  users: UserTable;
}

const env = loadEnv();
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: env.DATABASE_URL
    })
  })
});
`;

export const migrateScriptContent = `import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Migrator, FileMigrationProvider } from 'kysely';
import { db } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, '../migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log('Migration "' + it.migrationName + '" was executed successfully');
    } else if (it.status === 'Error') {
      console.error('Failed to execute migration "' + it.migrationName + '"');
    }
  });

  if (error) {
    console.error('Failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
`;

export const migration0001Content = `import { Kysely, sql } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql\`gen_random_uuid()\`),)
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql\`now()\`).notNull())
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute();
}
`;

export const seedScriptContent = `import { db } from '../database.js';

async function seed() {
  await db
    .insertInto('users')
    .values({ name: 'Ada Lovelace', email: 'ada@example.com' })
    .onConflict((oc) => oc.column('email').doNothing())
    .execute();

  console.log('Seed concluído: usuário de exemplo garantido.');
  await db.destroy();
}

seed().catch((err) => {
  console.error('Falha ao rodar o seed:', err);
  process.exit(1);
});
`;

export const appTsContent = `import Fastify, { type FastifyInstance } from 'fastify';
import dbPool from './plugins/db-pool.js';
import { loadEnv } from './config/env.js';
import healthRoutes from './modules/health/health.route.js';
import usersRoutes from './modules/users/users.route.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
    genReqId: () => 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
  });
  
  const env = loadEnv();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.setErrorHandler((error: any, request, reply) => {
    request.log.error(error);
    
    if (error.validation) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: error.message,
        statusCode: 400,
        reqId: request.id
      });
    }

    if (error.name === 'ConflictError') {
      return reply.status(409).send({
        error: 'Conflict',
        message: error.message,
        statusCode: 409,
        reqId: request.id
      });
    }

    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500,
      reqId: request.id
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: 'Route ' + request.method + ':' + request.url + ' not found',
      statusCode: 404,
      reqId: request.id
    });
  });

  // Lifecycle
  await app.register(dbPool, { connectionString: env.DATABASE_URL });

  // Routes
  await app.register(healthRoutes);
  await app.register(usersRoutes, { prefix: '/users' });

  return app;
}
`;

export const usersRouteContent = `import type { FastifyInstance } from 'fastify';
import { getUsersHandler, createUserHandler } from './users.handler.js';
import { getUsersSchema, createUserSchema } from './users.schema.js';

export default async function usersRoutes(app: FastifyInstance) {
  app.get('/', { schema: getUsersSchema }, getUsersHandler);
  app.post('/', { schema: createUserSchema }, createUserHandler);
}
`;

export const usersSchemaContent = `export const getUsersSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    }
  }
};

export const createUserSchema = {
  body: {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string' }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
  }
};
`;

export const usersHandlerContent = `import type { FastifyRequest, FastifyReply } from 'fastify';
import * as userService from './users.service.js';

export async function getUsersHandler() {
  const users = await userService.listUsers();
  return { data: users };
}

export async function createUserHandler(
  request: FastifyRequest<{ Body: { name: string; email: string } }>, 
  reply: FastifyReply
) {
  const user = await userService.createUser(request.body.name, request.body.email);
  return reply.status(201).send({ data: user });
}
`;

export const usersServiceContent = `import * as userRepository from './users.repository.js';

export async function listUsers() {
  return userRepository.findAll();
}

export async function createUser(name: string, email: string) {
  const exists = await userRepository.findByEmail(email);
  if (exists) {
    const err = new Error('Email already in use');
    err.name = 'ConflictError';
    throw err;
  }
  return userRepository.create(name, email);
}
`;

export const usersRepositoryContent = `import { db } from '../../db/database.js';

export async function findAll() {
  return db.selectFrom('users')
    .select(['id', 'name', 'email', 'created_at'])
    .execute();
}

export async function findByEmail(email: string) {
  return db.selectFrom('users')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();
}

export async function create(name: string, email: string) {
  return db.insertInto('users')
    .values({ name, email })
    .returning(['id', 'name', 'email'])
    .executeTakeFirstOrThrow();
}
`;

export const testEnvContent = `import test from 'node:test';
import assert from 'node:assert';
import { loadEnv } from '../src/config/env.js';

test('Throws if DATABASE_URL is missing', () => {
  const original = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  assert.throws(() => loadEnv(), /DATABASE_URL is missing/);
  process.env.DATABASE_URL = original; // Restore
});
`;

export const testEnvContentVitest = `import { test, expect } from 'vitest';
import { loadEnv } from '../src/config/env.js';

test('Throws if DATABASE_URL is missing', () => {
  const original = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  expect(() => loadEnv()).toThrow(/DATABASE_URL is missing/);
  process.env.DATABASE_URL = original; // Restore
});
`;

export const testUsersContent = `import test from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app.js';
import { db } from '../src/db/database.js';

test('Users API flow', async (t) => {
  // We clean the table before testing to ensure idempotency
  await db.deleteFrom('users').execute();
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
  await db.destroy();
});
`;

export const testUsersContentVitest = `import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { db } from '../src/db/database.js';

describe('Users API flow', () => {
  let app;

  beforeAll(async () => {
    // We clean the table before testing to ensure idempotency
    await db.deleteFrom('users').execute();
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
    await db.destroy();
  });

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
