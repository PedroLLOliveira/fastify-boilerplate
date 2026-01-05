export function handlersTemplate(orm) {
  const hasDb = orm && orm !== 'none';

  const dbTypeImport =
    orm === 'prisma'
      ? `import type { PrismaClient } from '@prisma/client';`
      : orm === 'sequelize'
        ? `import type { Sequelize } from 'sequelize';`
        : orm === 'mongoose'
          ? `import type { Connection } from 'mongoose';`
          : ``;

  const dbType =
    orm === 'prisma'
      ? 'PrismaClient'
      : orm === 'sequelize'
        ? 'Sequelize'
        : orm === 'mongoose'
          ? 'Connection'
          : 'unknown';

  const dbGuard = hasDb
    ? `type WithDb = FastifyInstance & { db: ${dbType} };

function assertDb(fastify: FastifyInstance): asserts fastify is WithDb {
  if (!('db' in fastify) || (fastify as any).db == null) {
    throw new Error('fastify.db não inicializado. Registre o plugin de DB (fastify.decorate("db", ...)) antes das rotas.');
  }
}
`
    : `type WithMaybeDb = FastifyInstance & { db?: unknown };

function getDb(fastify: WithMaybeDb): unknown {
  return (fastify as any).db ?? null;
}
`;

  const dbAccess = hasDb ? 'fastify.db' : 'getDb(fastify)';
  const assertLine = hasDb ? 'assertDb(fastify);\n  ' : '';

  return `/**
 * Referências oficiais
 * - Fastify TypeScript (handlers, FastifyRequest/FastifyReply): https://fastify.io/docs/latest/Reference/TypeScript/
 * - Fastify Decorators (para adicionar \`db\` em \`fastify\`): https://fastify.io/docs/latest/Reference/Decorators/
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
${dbTypeImport}
import { repo as buildRepo } from './repository.js';

${dbGuard}
export const listUsers = (fastify: FastifyInstance) => async (_req: FastifyRequest, reply: FastifyReply) => {
  ${assertLine}const r = buildRepo(${dbAccess} as any);
  const users = await r.list();
  return reply.send(users);
};

export const getUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  ${assertLine}const r = buildRepo(${dbAccess} as any);
  const item = await r.get(req.params.id);
  if (item == null) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Body: { email: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  ${assertLine}const r = buildRepo(${dbAccess} as any);
  const created = await r.create(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string }; Body: { email?: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  ${assertLine}const r = buildRepo(${dbAccess} as any);
  const updated = await r.update(req.params.id, req.body);
  if (updated == null) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  ${assertLine}const r = buildRepo(${dbAccess} as any);
  const n = await r.delete(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
}
