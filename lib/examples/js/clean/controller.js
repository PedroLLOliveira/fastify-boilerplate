export function controllerTemplate(orm) {
  const repoImport =
    orm === 'prisma'
      ? `import { PrismaUserRepository, MemoryUserRepository } from '../repositories/UserRepository.js';`
      : orm === 'sequelize'
        ? `import { SequelizeUserRepository, MemoryUserRepository } from '../repositories/UserRepository.js';`
        : orm === 'mongoose'
          ? `import { MongooseUserRepository, MemoryUserRepository } from '../repositories/UserRepository.js';`
          : `import { MemoryUserRepository } from '../repositories/UserRepository.js';`;

  const makeRepoFn =
    orm === 'prisma'
      ? `function makeRepo(db) {
  // PrismaClient costuma ter .$transaction e o delegate "user"
  if (!db || typeof db.$transaction !== 'function' || !db.user) return new MemoryUserRepository();
  return new PrismaUserRepository(db);
}`
      : orm === 'sequelize'
        ? `function makeRepo(db) {
  // Sequelize tem .define (ou .models)
  if (!db || (typeof db.define !== 'function' && !db.models)) return new MemoryUserRepository();
  return new SequelizeUserRepository(db);
}`
        : orm === 'mongoose'
          ? `function makeRepo(db) {
  // No seu plugin você costuma decorar "mongoose" (não a Connection)
  // Então aqui checamos se existe conexão ativa.
  const conn = db?.connection;
  if (!db || !conn || conn.readyState === 0) return new MemoryUserRepository();
  return new MongooseUserRepository(db);
}`
          : `function makeRepo(_db) {
  return new MemoryUserRepository();
}`;

  return `${repoImport}
import { CreateUser, UpdateUser, DeleteUser, GetUser, ListUsers } from '../../application/use-cases/index.js';

${makeRepoFn}

export const listUsers = (fastify) => async (_req, reply) => {
  const uc = ListUsers(makeRepo(fastify.db));
  return reply.send(await uc.execute());
};

export const getUser = (fastify) => async (req, reply) => {
  const uc = GetUser(makeRepo(fastify.db));
  const item = await uc.execute(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify) => async (req, reply) => {
  const uc = CreateUser(makeRepo(fastify.db));
  const created = await uc.execute(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify) => async (req, reply) => {
  const uc = UpdateUser(makeRepo(fastify.db));
  const updated = await uc.execute(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify) => async (req, reply) => {
  const uc = DeleteUser(makeRepo(fastify.db));
  const n = await uc.execute(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
}
