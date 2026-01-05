export function controllerTemplate(orm) {
  const needsDb = orm && orm !== 'none';

  const guardBlock = needsDb
    ? `type WithDb = FastifyInstance & { db: unknown };

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

  const dbAccess = needsDb ? '(fastify.db as any)' : 'getDb(fastify)';

  const assertLine = needsDb ? 'assertDb(fastify);\n  ' : '';

  return `/**
 * Referências oficiais:
 * - Fastify TypeScript (handlers, FastifyRequest/FastifyReply): https://fastify.io/docs/latest/Reference/TypeScript/
 * - Fastify Decorators (adicionar \`db\` no fastify): https://fastify.io/docs/latest/Reference/Decorators/
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { buildUserService } from '../services/userService.js';

${guardBlock}
export const listUsers = (fastify: FastifyInstance) => async (_req: FastifyRequest, reply: FastifyReply) => {
  ${assertLine}const svc = buildUserService(${dbAccess});
  return reply.send(await svc.list());
};

export const getUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  ${assertLine}const svc = buildUserService(${dbAccess});
  const item = await svc.get(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Body: { email: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  ${assertLine}const svc = buildUserService(${dbAccess});
  const created = await svc.create(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string }; Body: { email?: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  ${assertLine}const svc = buildUserService(${dbAccess});
  const updated = await svc.update(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  ${assertLine}const svc = buildUserService(${dbAccess});
  const n = await svc.delete(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
}
