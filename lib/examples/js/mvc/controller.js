export function controllerTemplate(orm = 'none') {
  const needsDb = orm !== 'none';

  return `import { buildUserService } from '../services/userService.js';

function getService(fastify, reply) {
  const needsDb = ${JSON.stringify(needsDb)};
  if (needsDb && !fastify.db) {
    reply.code(503).send({
      error: 'DB not initialized',
      message: 'fastify.db não inicializado. Verifique DATABASE_URL e o registro do plugin de DB.'
    });
    return null;
  }
  return buildUserService(fastify.db);
}

export const listUsers = (fastify) => async (_req, reply) => {
  const svc = getService(fastify, reply);
  if (!svc) return;
  return reply.send(await svc.list());
};

export const getUser = (fastify) => async (req, reply) => {
  const svc = getService(fastify, reply);
  if (!svc) return;

  const item = await svc.get(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify) => async (req, reply) => {
  const svc = getService(fastify, reply);
  if (!svc) return;

  const created = await svc.create(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify) => async (req, reply) => {
  const svc = getService(fastify, reply);
  if (!svc) return;

  const updated = await svc.update(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify) => async (req, reply) => {
  const svc = getService(fastify, reply);
  if (!svc) return;

  const n = await svc.delete(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
}
