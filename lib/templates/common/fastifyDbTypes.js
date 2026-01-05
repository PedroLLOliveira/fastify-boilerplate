// templates/common/fastifyDbTypes.js
export default function fastifyDbTypesTemplate({ orm = 'none', qb = 'none' } = {}) {
  // Prioridade: Query Builder (tem precedência sobre ORM)
  if (qb === 'knex') {
    return `
import 'fastify';
import type { Knex } from 'knex';

declare module 'fastify' {
  interface FastifyInstance {
    db: Knex | null;
  }
}
`.trim();
  }

  if (qb === 'kysely') {
    return `
import 'fastify';
import type { Kysely } from 'kysely';

declare module 'fastify' {
  interface FastifyInstance {
    db: Kysely<unknown> | null;
  }
}
`.trim();
  }

  // ORMs
  if (orm === 'prisma') {
    return `
import 'fastify';
import type { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    db: PrismaClient | null;
  }
}
`.trim();
  }

  if (orm === 'mongoose') {
    return `
import 'fastify';
import type { Connection } from 'mongoose';

declare module 'fastify' {
  interface FastifyInstance {
    db: Connection | null;
  }
}
`.trim();
  }

  if (orm === 'sequelize') {
    return `
import 'fastify';
import type { Sequelize } from 'sequelize';

declare module 'fastify' {
  interface FastifyInstance {
    db: Sequelize | null;
  }
}
`.trim();
  }

  // Sem DB (nenhum ORM/QB selecionado)
  return `
import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    db: null;
  }
}
`.trim();
}
