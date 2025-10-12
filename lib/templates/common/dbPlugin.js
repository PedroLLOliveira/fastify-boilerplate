// templates/common/dbPlugin.js
export function dbPluginTemplate(isTS, answers) {
  // atalho
  const a = answers;

  // Se NÃO houver Query Builder e houver ORM, mantém o comportamento anterior (ORMs)
  if (a.queryBuilder === 'none' && a.orm && a.orm !== 'none') {
    if (a.orm === 'mongoose') {
      return isTS
        ? `import mongoose from 'mongoose';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
export default async function dbPlugin(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    fastify.log.warn('DATABASE_URL não configurado. Pulando conexão MongoDB.');
    fastify.decorate('db', null as any);
    return;
  }
  await mongoose.connect(url);
  fastify.addHook('onClose', async () => mongoose.connection.close());
  fastify.decorate('db', mongoose as any);
}
`
        : `import mongoose from 'mongoose';
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
      return isTS
        ? `import { Sequelize } from 'sequelize';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
export default async function dbPlugin(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    fastify.log.warn('DATABASE_URL não configurado. Pulando conexão Sequelize.');
    fastify.decorate('db', null as any);
    return;
  }
  const sequelize = new Sequelize(url, { logging: false });
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    fastify.log.info('Sequelize conectado e sincronizado');
  } catch (e) {
    fastify.log.error(e);
  }
  fastify.addHook('onClose', async () => sequelize.close());
  fastify.decorate('db', sequelize as any);
}
`
        : `import { Sequelize } from 'sequelize';
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
    await sequelize.sync();
    fastify.log.info('Sequelize conectado e sincronizado');
  } catch (e) {
    fastify.log.error(e);
  }
  fastify.addHook('onClose', async () => sequelize.close());
  fastify.decorate('db', sequelize);
}
`;
    }

    if (a.orm === 'prisma') {
      return isTS
        ? `import { PrismaClient } from '@prisma/client';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
export default async function dbPlugin(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  const prisma = new PrismaClient();
  fastify.addHook('onClose', async () => prisma.$disconnect());
  fastify.decorate('db', prisma as any);
}
`
        : `import { PrismaClient } from '@prisma/client';
export default async function dbPlugin(fastify, _opts) {
  const prisma = new PrismaClient();
  fastify.addHook('onClose', async () => prisma.$disconnect());
  fastify.decorate('db', prisma);
}
`;
    }
  }

  // A partir daqui: Query Builders (têm precedência sobre ORM no scaffold)
  const isTSImport =
    isTS ? `import type { FastifyInstance, FastifyPluginOptions } from 'fastify';\n` : '';

  const header = `/**
 * Plugin de DB único:
 * - Sem ORM e sem QB  -> db = null
 * - Knex              -> db = knex instance
 * - Kysely            -> db = Kysely instance
 *
 * Fastify Decorators: https://fastify.io/docs/latest/Reference/Decorators/
 */
import fp from 'fastify-plugin';
${a.queryBuilder === 'knex' ? `import knex from 'knex';\n` : ''}
${a.queryBuilder === 'kysely' ? `import { Kysely, PostgresDialect, MysqlDialect, SqliteDialect } from 'kysely';
import { Pool } from 'pg';
import { createPool } from 'mysql2';
import Database from 'better-sqlite3';\n` : ''}
${isTSImport}`;

  // KNEX
  if (a.queryBuilder === 'knex') {
    const client =
      a.database === 'mysql' ? 'mysql2' :
      a.database === 'sqlite' ? 'sqlite3' : 'pg';

    return `${header}
export default fp(async (fastify${isTS ? ': FastifyInstance' : ''}) => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    fastify.log.warn('DATABASE_URL não configurado. Pulando conexão Knex.');
    fastify.decorate('db', ${isTS ? 'null as any' : 'null'});
    return;
  }

  const db = knex({
    client: '${client}',
    connection: url,
    migrations: { directory: 'db/migrations' },
    seeds: { directory: 'db/seeds' },
    useNullAsDefault: ${a.database === 'sqlite' ? 'true' : 'false'}
  });

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await db.destroy();
  });
});
`;
  }

  // KYSELY
  if (a.queryBuilder === 'kysely') {
    // dialetos corretos do core do Kysely
    const dialectBlock =
      a.database === 'postgres'
        ? `
  const db = new Kysely({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: process.env.DATABASE_URL })
    })
  });
`
        : a.database === 'mysql'
        ? `
  const db = new Kysely({
    dialect: new MysqlDialect({
      pool: createPool(process.env.DATABASE_URL)
    })
  });
`
        : `
  const sqlitePath = process.env.DATABASE_URL?.startsWith('file:')
    ? process.env.DATABASE_URL.replace('file:', '')
    : (process.env.DATABASE_URL || './dev.db');

  const db = new Kysely({
    dialect: new SqliteDialect({
      database: new Database(sqlitePath)
    })
  });
`;

    return `${header}
export default fp(async (fastify${isTS ? ': FastifyInstance' : ''}) => {${dialectBlock}
  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    // Kysely expõe destroy() para fechar pools/conexões
    if (typeof db?.destroy === 'function') {
      await db.destroy();
    }
  });
});
`;
  }

  // Sem ORM e sem QB -> expõe db = null
  return `${header}
export default fp(async (fastify${isTS ? ': FastifyInstance' : ''}) => {
  fastify.decorate('db', ${isTS ? 'null as any' : 'null'});
});
`;
}
