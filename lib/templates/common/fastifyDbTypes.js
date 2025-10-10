// templates/common/fastifyDbTypes.js
export default function fastifyDbTypesTemplate({ orm = 'sequelize', qb = 'none' } = {}) {
  // Prioridade: Query Builder (Knex)
  if (qb === 'knex') {
    return `
import 'fastify';
import type { Knex } from 'knex';

declare module 'fastify' {
  interface FastifyInstance {
    db: Knex;
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
    db: PrismaClient;
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
    db: Connection;
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
    db: Sequelize;
  }
}
`.trim();
  }

  // orm === 'none' (ou desconhecido)
  return `
import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    db: any;
  }
}
`.trim();
}
