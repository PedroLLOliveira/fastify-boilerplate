export function handlersTemplate() {
  return `import { repo as buildRepo } from './repository.js';

export const listUsers = (fastify) => async (_req, reply) => {
  const r = buildRepo(fastify.db);
  return reply.send(await r.list());
};
export const getUser = (fastify) => async (req, reply) => {
  const r = buildRepo(fastify.db);
  const item = await r.get(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};
export const createUser = (fastify) => async (req, reply) => {
  const r = buildRepo(fastify.db);
  const created = await r.create(req.body);
  return reply.code(201).send(created);
};
export const updateUser = (fastify) => async (req, reply) => {
  const r = buildRepo(fastify.db);
  const updated = await r.update(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};
export const deleteUser = (fastify) => async (req, reply) => {
  const r = buildRepo(fastify.db);
  const n = await r.delete(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
}
