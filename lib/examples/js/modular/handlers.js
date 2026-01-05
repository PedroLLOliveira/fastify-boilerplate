export function handlersTemplate(orm = 'none') {
  const needsDb = orm !== 'none';

  return `import { repo as buildRepo } from './repository.js';

function getRepo(fastify, reply) {
  const needsDb = ${JSON.stringify(needsDb)};
  if (needsDb && !fastify.db) {
    reply.code(503).send({
      error: 'DB not initialized',
      message: 'fastify.db não inicializado. Verifique DATABASE_URL e o registro do plugin de DB.'
    });
    return null;
  }
  return buildRepo(fastify.db);
}

export const listUsers = (fastify) => async (_req, reply) => {
  const r = getRepo(fastify, reply);
  if (!r) return;
  return reply.send(await r.list());
};

export const getUser = (fastify) => async (req, reply) => {
  const r = getRepo(fastify, reply);
  if (!r) return;

  const item = await r.get(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify) => async (req, reply) => {
  const r = getRepo(fastify, reply);
  if (!r) return;

  const created = await r.create(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify) => async (req, reply) => {
  const r = getRepo(fastify, reply);
  if (!r) return;

  const updated = await r.update(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify) => async (req, reply) => {
  const r = getRepo(fastify, reply);
  if (!r) return;

  const n = await r.delete(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
}
