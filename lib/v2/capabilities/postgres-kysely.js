// Capability de persistência: PostgreSQL via Kysely, para a arquitetura
// modular. Só o que de fato é específico deste ORM mora aqui — client de
// banco, plugin fastify, migrations, seed, repositório e a checagem de
// /ready. Rotas, schemas, handler e error/not-found handler vêm do núcleo
// compartilhado em architectures/modular-persisted.js; .env.example,
// config/env.ts e docker-compose.yml vêm de postgres-shared.js (mesma
// infra que o Sequelize usa, mas isso é coincidência de "os dois sobem
// Postgres", não uma regra da arquitetura).
import { envFileContent, configEnvContent, dockerComposeContent } from './postgres-shared.js';

const healthRouteContent = `import type { FastifyInstance } from 'fastify';
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

const dbPoolContent = `import fp from 'fastify-plugin';
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

const databaseTsContent = `import { Kysely, PostgresDialect, type Generated } from 'kysely';
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

const migrateScriptContent = `import { promises as fs } from 'fs';
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

const migration0001Content = `import { Kysely, sql } from 'kysely';

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

const seedScriptContent = `import { db } from '../database.js';

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

const usersServiceContent = `import * as userRepository from './users.repository.js';

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

const usersRepositoryContent = `import { db } from '../../db/database.js';

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

const testUsersContentVitest = `import { describe, test, expect, beforeAll, afterAll } from 'vitest';
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

/** @type {import('../core/types.d.ts').Capability} */
export const postgresKyselyCapability = {
  id: 'postgres-kysely',
  kind: 'persistence',
  dependencies: {
    runtime: ['fastify-plugin', 'pg', 'kysely'],
    dev: ['@types/pg']
  },
  files: [
    { path: '.env.example', content: envFileContent },
    { path: 'docker-compose.yml', content: dockerComposeContent },
    { path: 'src/config/env.ts', content: configEnvContent },
    { path: 'src/plugins/db-pool.ts', content: dbPoolContent },
    { path: 'src/db/database.ts', content: databaseTsContent },
    { path: 'src/db/scripts/migrate.ts', content: migrateScriptContent },
    { path: 'src/db/scripts/seed.ts', content: seedScriptContent },
    { path: 'src/db/migrations/0001_create_users.ts', content: migration0001Content },
    { path: 'src/modules/health/health.route.ts', content: healthRouteContent },
    { path: 'src/modules/users/users.service.ts', content: usersServiceContent },
    { path: 'src/modules/users/users.repository.ts', content: usersRepositoryContent }
  ],
  scripts: {
    predev: 'docker compose up -d --wait && npm run db:migrate && npm run db:seed',
    'dev:no-infra': 'tsx watch src/server.ts',
    'db:migrate': 'tsx src/db/scripts/migrate.ts',
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
    imports: [
      "import dbPool from './plugins/db-pool.js';",
      "import { loadEnv } from './config/env.js';"
    ],
    needsEnv: true,
    registration: 'await app.register(dbPool, { connectionString: env.DATABASE_URL });'
  }
};
