// dbPlugin.js
export function dbPluginTemplate(isTS, a) {
  if (a.orm === 'none') {
    return isTS
      ? `import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
export default async function dbPlugin(_fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  _fastify.decorate('db', null as any);
}
`
      : `export default async function dbPlugin(fastify, _opts) {
  fastify.decorate('db', null);
}
`;
  }
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
  // Prisma
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
