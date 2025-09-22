export function controllerTemplate() {
  return `import { buildUserService } from '../services/userService.js';

export const listUsers = (fastify) => async (_req, reply) => {
  const svc = buildUserService(fastify.db);
  return reply.send(await svc.list());
};

export const getUser = (fastify) => async (req, reply) => {
  const svc = buildUserService(fastify.db);
  const item = await svc.get(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify) => async (req, reply) => {
  const svc = buildUserService(fastify.db);
  const created = await svc.create(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify) => async (req, reply) => {
  const svc = buildUserService(fastify.db);
  const updated = await svc.update(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify) => async (req, reply) => {
  const svc = buildUserService(fastify.db);
  const n = await svc.delete(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
}
