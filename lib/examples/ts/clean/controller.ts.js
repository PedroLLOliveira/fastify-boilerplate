export function controllerTemplate(orm) {
  if (orm === 'prisma') {
    return `/**
 * Referências oficiais:
 * - Fastify TypeScript (handlers, FastifyRequest/FastifyReply): https://fastify.io/docs/latest/Reference/TypeScript/
 * - Fastify Decorators (para adicionar \`db\` em \`fastify\`): https://fastify.io/docs/latest/Reference/Decorators/
 * - Prisma Client CRUD: https://www.prisma.io/docs/orm/prisma-client/queries/crud
 * - Prisma Client API ref.: https://www.prisma.io/docs/orm/reference/prisma-client-reference
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../repositories/UserRepository.js';
import { CreateUser, UpdateUser, DeleteUser, GetUser, ListUsers } from '../../application/use-cases/index.js';

type WithPrisma = FastifyInstance & { db: PrismaClient };

function makeRepo(db: PrismaClient) {
  if (!db || typeof db.\$transaction !== 'function') {
    throw new Error('PrismaClient não encontrado em fastify.db. Registre-o com fastify.decorate("db", prisma).');
  }
  return new PrismaUserRepository(db);
}

export const listUsers = (fastify: WithPrisma) => async (_req: FastifyRequest, reply: FastifyReply) => {
  const uc = ListUsers(makeRepo(fastify.db));
  const data = await uc.execute();
  return reply.send(data);
};

export const getUser = (fastify: WithPrisma) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = GetUser(makeRepo(fastify.db));
  const item = await uc.execute(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify: WithPrisma) => async (
  req: FastifyRequest<{ Body: { email: string; name?: string } }>,
  reply: FastifyReply
) => {
  const uc = CreateUser(makeRepo(fastify.db));
  const created = await uc.execute(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify: WithPrisma) => async (
  req: FastifyRequest<{ Params: { id: string }; Body: { email?: string; name?: string } }>,
  reply: FastifyReply
) => {
  const uc = UpdateUser(makeRepo(fastify.db));
  const updated = await uc.execute(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify: WithPrisma) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = DeleteUser(makeRepo(fastify.db));
  const n = await uc.execute(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
  }

  if (orm === 'sequelize') {
    return `/**
 * Referências oficiais:
 * - Fastify TypeScript (handlers, FastifyRequest/FastifyReply): https://fastify.io/docs/latest/Reference/TypeScript/
 * - Fastify Decorators (para adicionar \`db\` em \`fastify\`): https://fastify.io/docs/latest/Reference/Decorators/
 * - Sequelize v6 (finders): https://sequelize.org/docs/v6/core-concepts/model-querying-finders/
 * - Sequelize v7 (modelos – referência atualizada): https://sequelize.org/docs/v7/models/advanced/
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Sequelize } from 'sequelize';
import { SequelizeUserRepository } from '../repositories/UserRepository.js';
import { CreateUser, UpdateUser, DeleteUser, GetUser, ListUsers } from '../../application/use-cases/index.js';

type WithSequelize = FastifyInstance & { db: Sequelize };

function makeRepo(db: Sequelize) {
  if (!db || typeof db.define !== 'function') {
    throw new Error('Sequelize não encontrado em fastify.db. Registre-o com fastify.decorate("db", sequelize).');
  }
  return new SequelizeUserRepository(db);
}

export const listUsers = (fastify: WithSequelize) => async (_req: FastifyRequest, reply: FastifyReply) => {
  const uc = ListUsers(makeRepo(fastify.db));
  const data = await uc.execute();
  return reply.send(data);
};

export const getUser = (fastify: WithSequelize) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = GetUser(makeRepo(fastify.db));
  const item = await uc.execute(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify: WithSequelize) => async (
  req: FastifyRequest<{ Body: { email: string; name?: string } }>,
  reply: FastifyReply
) => {
  const uc = CreateUser(makeRepo(fastify.db));
  const created = await uc.execute(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify: WithSequelize) => async (
  req: FastifyRequest<{ Params: { id: string }; Body: { email?: string; name?: string } }>,
  reply: FastifyReply
) => {
  const uc = UpdateUser(makeRepo(fastify.db));
  const updated = await uc.execute(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify: WithSequelize) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = DeleteUser(makeRepo(fastify.db));
  const n = await uc.execute(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
  }

  if (orm === 'prisma') {
  return `/**
 * Referências oficiais:
 * - Fastify TypeScript (handlers, FastifyRequest/FastifyReply): https://fastify.io/docs/latest/Reference/TypeScript/
 * - Fastify Decorators (para adicionar \`db\` em \`fastify\`): https://fastify.io/docs/latest/Reference/Decorators/
 * - Mongoose Model API: https://mongoosejs.com/docs/api/model.html
 * - Mongoose Queries: https://mongoosejs.com/docs/queries.html
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Connection } from 'mongoose';
import { MongooseUserRepository } from '../repositories/UserRepository.js';
import { CreateUser, UpdateUser, DeleteUser, GetUser, ListUsers } from '../../application/use-cases/index.js';

type WithMongoose = FastifyInstance & { db: Connection };

function makeRepo(db: Connection) {
  if (!db || db.readyState === 0) {
    throw new Error('Conexão Mongoose não encontrada/indisponível em fastify.db.');
  }
  // O repo usa models globais (mongoose.model), mas exigimos conexão ativa
  return new MongooseUserRepository();
}

export const listUsers = (fastify: WithMongoose) => async (_req: FastifyRequest, reply: FastifyReply) => {
  const uc = ListUsers(makeRepo(fastify.db));
  const data = await uc.execute();
  return reply.send(data);
};

export const getUser = (fastify: WithMongoose) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = GetUser(makeRepo(fastify.db));
  const item = await uc.execute(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify: WithMongoose) => async (
  req: FastifyRequest<{ Body: { email: string; name?: string } }>,
  reply: FastifyReply
) => {
  const uc = CreateUser(makeRepo(fastify.db));
  const created = await uc.execute(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify: WithMongoose) => async (
  req: FastifyRequest<{ Params: { id: string }; Body: { email?: string; name?: string } }>,
  reply: FastifyReply
) => {
  const uc = UpdateUser(makeRepo(fastify.db));
  const updated = await uc.execute(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify: WithMongoose) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = DeleteUser(makeRepo(fastify.db));
  const n = await uc.execute(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
  }
}
