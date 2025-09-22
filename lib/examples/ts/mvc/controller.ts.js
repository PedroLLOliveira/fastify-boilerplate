export function controllerTemplate(_orm) {
  return `import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { buildUserService } from '../services/userService';

export const listUsers = (fastify: FastifyInstance) => async (_req: FastifyRequest, reply: FastifyReply) => {
  const svc = buildUserService(fastify.db as any);
  return reply.send(await svc.list());
};
export const getUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const svc = buildUserService(fastify.db as any);
  const item = await svc.get(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};
export const createUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Body: { email: string; name?: string } }>, reply: FastifyReply) => {
  const svc = buildUserService(fastify.db as any);
  const created = await svc.create(req.body);
  return reply.code(201).send(created);
};
export const updateUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Params: { id: string }, Body: { email?: string; name?: string } }>, reply: FastifyReply) => {
  const svc = buildUserService(fastify.db as any);
  const updated = await svc.update(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};
export const deleteUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const svc = buildUserService(fastify.db as any);
  const n = await svc.delete(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
}
