export function controllerTemplate(orm) {
  if (orm === 'prisma') {
    return `import { PrismaUserRepository } from '../repositories/UserRepository.js';
import { CreateUser, UpdateUser, DeleteUser, GetUser, ListUsers } from '../../application/use-cases/index.js';

function makeRepo(db: any) {
  if (!db || !db.$transaction) {
    throw new Error('PrismaClient não encontrado em fastify.db. Certifique-se de registrá-lo no plugin.');
  }
  return new PrismaUserRepository(db);
};

export const listUsers = (fastify: FastifyInstance) => async (_req: FastifyRequest, reply: FastifyReply) => {
  const uc = ListUsers(makeRepo(fastify.db));
  return reply.send(await uc.execute());
};

export const getUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const uc = GetUser(makeRepo(fastify.db));
  const item = await uc.execute(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Body: { email: string; name?: string } }>, reply: FastifyReply) => {
  const uc = CreateUser(makeRepo(fastify.db));
  const created = await uc.execute(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Params: { id: string }, Body: { email?: string; name?: string } }>, reply: FastifyReply) => {
  const uc = UpdateUser(makeRepo(fastify.db));
  const updated = await uc.execute(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const uc = DeleteUser(makeRepo(fastify.db));
  const n = await uc.execute(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
  };
  if (orm === 'sequelize') {
    return `import { SequelizeUserRepository } from '../repositories/UserRepository.js';
import { CreateUser, UpdateUser, DeleteUser, GetUser, ListUsers } from '../../application/use-cases/index.js';

function makeRepo(db: any) {
  if (!db || !db.$transaction) {
    throw new Error('Sequelize não encontrado em fastify.db. Certifique-se de registrá-lo no plugin.');
  }
  return new SequelizeUserRepository(db);
};

export const listUsers = (fastify: FastifyInstance) => async (_req: FastifyRequest, reply: FastifyReply) => {
  const uc = ListUsers(makeRepo(fastify.db));
  return reply.send(await uc.execute());
};

export const getUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const uc = GetUser(makeRepo(fastify.db));
  const item = await uc.execute(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Body: { email: string; name?: string } }>, reply: FastifyReply) => {
  const uc = CreateUser(makeRepo(fastify.db));
  const created = await uc.execute(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Params: { id: string }, Body: { email?: string; name?: string } }>, reply: FastifyReply) => {
  const uc = UpdateUser(makeRepo(fastify.db));
  const updated = await uc.execute(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const uc = DeleteUser(makeRepo(fastify.db));
  const n = await uc.execute(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
  };
  if (orm === 'mongoose') {
    return `import { MongooseUserRepository } from '../repositories/UserRepository.js';
import { CreateUser, UpdateUser, DeleteUser, GetUser, ListUsers } from '../../application/use-cases/index.js';

function makeRepo(db: any) {
  if (!db || !db.$transaction) {
    throw new Error('Mongoose não encontrado em fastify.db. Certifique-se de registrá-lo no plugin.');
  }
  return new MongooseUserRepository(db);
};

export const listUsers = (fastify: FastifyInstance) => async (_req: FastifyRequest, reply: FastifyReply) => {
  const uc = ListUsers(makeRepo(fastify.db));
  return reply.send(await uc.execute());
};

export const getUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const uc = GetUser(makeRepo(fastify.db));
  const item = await uc.execute(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Body: { email: string; name?: string } }>, reply: FastifyReply) => {
  const uc = CreateUser(makeRepo(fastify.db));
  const created = await uc.execute(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Params: { id: string }, Body: { email?: string; name?: string } }>, reply: FastifyReply) => {
  const uc = UpdateUser(makeRepo(fastify.db));
  const updated = await uc.execute(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify: FastifyInstance) => async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const uc = DeleteUser(makeRepo(fastify.db));
  const n = await uc.execute(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
  };
}
