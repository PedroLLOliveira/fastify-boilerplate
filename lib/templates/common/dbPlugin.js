// templates/common/dbPlugin.js
export function dbPluginTemplate(isTS, answers) {
  const a = answers;

  const hasQB = a.queryBuilder && a.queryBuilder !== 'none';
  const hasOrm = a.orm && a.orm !== 'none';

  const tsTypeImports = isTS
    ? `import type { FastifyInstance } from 'fastify';\n`
    : '';

  // Helper TS/JS para assinar o parâmetro `fastify`
  const fastifyParam = isTS ? 'fastify: FastifyInstance' : 'fastify';

  // Comentário comum
  const header = `/**
 * Plugin único de DB (sempre registrado no server):
 * - QB = knex     -> fastify.db = Knex instance
 * - QB = kysely   -> fastify.db = Kysely instance
 * - ORM = prisma  -> fastify.db = PrismaClient
 * - ORM = sequelize -> fastify.db = Sequelize
 * - ORM = mongoose -> fastify.db = mongoose.Connection
 * - none          -> fastify.db = null
 *
 * Decorators (Fastify): https://fastify.io/docs/latest/Reference/Decorators/
 * fastify-plugin: https://github.com/fastify/fastify-plugin
 */`;

  // =========================
  // Query Builder: KNEX
  // =========================
  if (hasQB && a.queryBuilder === 'knex') {
    const client =
      a.database === 'mysql' ? 'mysql2'
      : a.database === 'sqlite' ? 'sqlite3'
      : a.database === 'postgres' ? 'pg'
      : null;

    // proteção: knex não suporta mongodb
    if (!client) {
      return `${header}
import fp from 'fastify-plugin';
${tsTypeImports}
export default fp(async (${fastifyParam}) => {
  throw new Error('Knex requer banco SQL (postgres/mysql/sqlite). Opção atual: ${a.database}');
});
`;
    }

    // sqlite: knex prefere filename
    const knexConnectionBlock =
      a.database === 'sqlite'
        ? `  const raw = process.env.DATABASE_URL;
  const filename = raw?.startsWith('file:') ? raw.replace('file:', '') : (raw || './dev.db');

  const db = knex({
    client: '${client}',
    connection: { filename },
    migrations: { directory: 'db/migrations' },
    seeds: { directory: 'db/seeds' },
    useNullAsDefault: true
  });`
        : `  const url = process.env.DATABASE_URL;

  const db = knex({
    client: '${client}',
    connection: url,
    migrations: { directory: 'db/migrations' },
    seeds: { directory: 'db/seeds' },
    useNullAsDefault: false
  });`;

    return `${header}
import fp from 'fastify-plugin';
import knex from 'knex';
${tsTypeImports}

export default fp(async (${fastifyParam}) => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurado. Configure .env antes de iniciar o servidor.');
  }

${knexConnectionBlock}

  ${isTS ? 'fastify.decorate(\'db\', db as any);' : "fastify.decorate('db', db);"}

  fastify.addHook('onClose', async () => {
    await db.destroy();
  });
});
`;
  }

  // =========================
  // Query Builder: KYSELY
  // =========================
  if (hasQB && a.queryBuilder === 'kysely') {
    // proteção: kysely não suporta mongodb
    const isSqlDb = ['postgres', 'mysql', 'sqlite'].includes(a.database);
    if (!isSqlDb) {
      return `${header}
import fp from 'fastify-plugin';
${tsTypeImports}
export default fp(async (${fastifyParam}) => {
  throw new Error('Kysely requer banco SQL (postgres/mysql/sqlite). Opção atual: ${a.database}');
});
`;
    }

    // Dialect blocks com imports dinâmicos dos drivers
    const dialectBlock =
      a.database === 'postgres'
        ? `  const pgMod = await import('pg');
  const Pool = pgMod.Pool ?? pgMod.default?.Pool;
  if (!Pool) throw new Error('Falha ao carregar pg.Pool');

  const db = new Kysely({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: process.env.DATABASE_URL })
    })
  });`
        : a.database === 'mysql'
        ? `  const mysql2Mod = await import('mysql2');
  const createPool = mysql2Mod.createPool ?? mysql2Mod.default?.createPool;
  if (!createPool) throw new Error('Falha ao carregar mysql2.createPool');

  const db = new Kysely({
    dialect: new MysqlDialect({
      pool: createPool(process.env.DATABASE_URL)
    })
  });`
        : `  const sqliteMod = await import('better-sqlite3');
  const DatabaseCtor = sqliteMod.default ?? sqliteMod.Database ?? sqliteMod;
  if (!DatabaseCtor) throw new Error('Falha ao carregar better-sqlite3');

  const raw = process.env.DATABASE_URL;
  const sqlitePath = raw?.startsWith('file:') ? raw.replace('file:', '') : (raw || './dev.db');

  const db = new Kysely({
    dialect: new SqliteDialect({
      database: new DatabaseCtor(sqlitePath)
    })
  });`;

    return `${header}
import fp from 'fastify-plugin';
import { Kysely, PostgresDialect, MysqlDialect, SqliteDialect } from 'kysely';
${tsTypeImports}

export default fp(async (${fastifyParam}) => {
  if (!process.env.DATABASE_URL && '${a.database}' !== 'sqlite') {
    throw new Error('DATABASE_URL não configurado. Configure .env antes de iniciar o servidor.');
  }

${dialectBlock}

  ${isTS ? 'fastify.decorate(\'db\', db as any);' : "fastify.decorate('db', db);"}

  fastify.addHook('onClose', async () => {
    if (typeof db?.destroy === 'function') {
      await db.destroy();
    }
  });
});
`;
  }

  // =========================
  // ORM: PRISMA
  // =========================
  if (!hasQB && hasOrm && a.orm === 'prisma') {
    return `${header}
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
${tsTypeImports}

export default fp(async (${fastifyParam}) => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurado. Configure .env antes de iniciar o servidor.');
  }

  const prisma = new PrismaClient();
  await prisma.$connect();

  ${isTS ? 'fastify.decorate(\'db\', prisma as any);' : "fastify.decorate('db', prisma);"}

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
});
`;
  }

  // =========================
  // ORM: SEQUELIZE
  // =========================
  if (!hasQB && hasOrm && a.orm === 'sequelize') {
    return `${header}
import fp from 'fastify-plugin';
import { Sequelize } from 'sequelize';
${tsTypeImports}

export default fp(async (${fastifyParam}) => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurado. Configure .env antes de iniciar o servidor.');
  }

  const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });

  // Fail fast: valida conexão no boot
  await sequelize.authenticate();

  // Scaffold-friendly:
  // Para rodar exemplos rapidamente, criamos as tabelas automaticamente.
  // Em produção, prefira migrations e remova/condicione este sync.
  await sequelize.sync();

  ${isTS ? 'fastify.decorate(\'db\', sequelize as any);' : "fastify.decorate('db', sequelize);"}

  fastify.addHook('onClose', async () => {
    await sequelize.close();
  });
});
`;
  }

  // =========================
  // ORM: MONGOOSE
  // =========================
  if (!hasQB && hasOrm && a.orm === 'mongoose') {
    return `${header}
import fp from 'fastify-plugin';
import mongoose from 'mongoose';
${tsTypeImports}

export default fp(async (${fastifyParam}) => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurado. Configure .env antes de iniciar o servidor.');
  }

  await mongoose.connect(process.env.DATABASE_URL);

  // Alinhado ao fastifyDbTypesTemplate: db = mongoose.Connection
  ${isTS ? "fastify.decorate('db', mongoose.connection as any);" : "fastify.decorate('db', mongoose.connection);"}

  fastify.addHook('onClose', async () => {
    await mongoose.connection.close();
  });
});
`;
  }

  // =========================
  // Sem ORM e sem QB
  // =========================
  return `${header}
import fp from 'fastify-plugin';
${tsTypeImports}

export default fp(async (${fastifyParam}) => {
  ${isTS ? "fastify.decorate('db', null as any);" : "fastify.decorate('db', null);"}
});
`;
}
