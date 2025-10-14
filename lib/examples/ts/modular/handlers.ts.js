export function handlersTemplate() {
  return `/**
 * Referências oficiais
 * - Fastify TypeScript (handlers, FastifyRequest/FastifyReply): https://fastify.io/docs/latest/Reference/TypeScript/
 * - Fastify Decorators (para adicionar \`db\` em \`fastify\`): https://fastify.io/docs/latest/Reference/Decorators/
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Sequelize } from 'sequelize';
import { repo as buildRepo } from './repository.js';

// Guard opcional: se você não tiver augment garantindo db != null
function assertDb(fastify: FastifyInstance): asserts fastify is FastifyInstance & { db: unknown } {
  if (!('db' in fastify) || (fastify as any).db == null) {
    throw new Error('fastify.db não inicializado. Registre seu ORM via fastify.decorate("db", ...).');
  }
}

export const listUsers = (fastify: FastifyInstance) => async (_req: FastifyRequest, reply: FastifyReply) => {
  const r = buildRepo(fastify.db);
  const users = await r.list();
  return await reply.send(users);
};

export const getUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  assertDb(fastify);
  const r = buildRepo(fastify.db);
  const item = await r.get(req.params.id);
  if (item === null || item === undefined) return await reply.code(404).send({ error: 'Not found' });
  return await reply.send(item);
};


export const createUser = (fastify: FastifyInstance & { db: Sequelize }) => async (
  req: FastifyRequest<{ Body: { email: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  assertDb(fastify);
  const r = buildRepo(fastify.db);
  const created = await r.create(req.body);
  return await reply.code(201).send(created);
};


export const updateUser = (fastify: FastifyInstance & { db: Sequelize }) => async (
  req: FastifyRequest<{ Params: { id: string }; Body: { email?: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  assertDb(fastify);
  const r = buildRepo(fastify.db);
  const updated = await r.update(req.params.id, req.body);
  if (updated === null || updated === undefined) return await reply.code(404).send({ error: 'Not found' });
  return await reply.send(updated);
};

export const deleteUser = (fastify: FastifyInstance & { db: Sequelize }) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  assertDb(fastify);
  const r = buildRepo(fastify.db);
  const n = await r.delete(req.params.id);

  if (n === 0 || Number.isNaN(n)) {
    return await reply.code(404).send({ error: 'Not found' });
  }
  return await reply.code(204).send();
};
`;
}
