export function controllerTemplate() {
  return `import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PrismaUserRepository } from '../repositories/UserRepository';
import { SequelizeUserRepository } from '../repositories/UserRepository';
import { MongooseUserRepository } from '../repositories/UserRepository';
import { MemoryUserRepository } from '../repositories/UserRepository';
import { CreateUser, UpdateUser, DeleteUser, GetUser, ListUsers } from '../../application/use-cases';

function makeRepo(db: any) {
  if (!db) return new MemoryUserRepository();
  if (db?.$transaction) return new PrismaUserRepository(db);
  if (db?.models || db?.define) return new SequelizeUserRepository(db);
  if (db?.connection || db?.model) return new MongooseUserRepository();
  return new MemoryUserRepository();
}

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
}
