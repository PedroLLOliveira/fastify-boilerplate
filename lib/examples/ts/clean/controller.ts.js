export function controllerTemplate(orm) {
  // Prisma
  if (orm === 'prisma') {
    return `/**
 * Referências oficiais:
 * - Fastify TypeScript: https://fastify.io/docs/latest/Reference/TypeScript/
 * - Decorators: https://fastify.io/docs/latest/Reference/Decorators/
 * - Prisma CRUD: https://www.prisma.io/docs/orm/prisma-client/queries/crud
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { PrismaClient } from '@prisma/client';

import { PrismaUserRepository } from '../repositories/UserRepository';
import { CreateUser, UpdateUser, DeleteUser, GetUser, ListUsers } from '../../application/use-cases';

type WithPrisma = FastifyInstance & { db: PrismaClient };

function assertPrisma(fastify: FastifyInstance): asserts fastify is WithPrisma {
  const db = (fastify as any).db;
  if (!db || typeof db.$transaction !== 'function') {
    throw new Error('PrismaClient não encontrado em fastify.db. Registre com fastify.decorate("db", prisma).');
  }
}

function makeRepo(fastify: FastifyInstance) {
  assertPrisma(fastify);
  return new PrismaUserRepository(fastify.db);
}

export const listUsers = (fastify: FastifyInstance) => async (_req: FastifyRequest, reply: FastifyReply) => {
  const uc = ListUsers(makeRepo(fastify));
  return reply.send(await uc.execute());
};

export const getUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = GetUser(makeRepo(fastify));
  const item = await uc.execute(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Body: { email: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  const uc = CreateUser(makeRepo(fastify));
  const created = await uc.execute(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string }; Body: { email?: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  const uc = UpdateUser(makeRepo(fastify));
  const updated = await uc.execute(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = DeleteUser(makeRepo(fastify));
  const n = await uc.execute(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
  }

  // Sequelize
  if (orm === 'sequelize') {
    return `/**
 * Referências oficiais:
 * - Fastify TypeScript: https://fastify.io/docs/latest/Reference/TypeScript/
 * - Decorators: https://fastify.io/docs/latest/Reference/Decorators/
 * - Sequelize v6 finders: https://sequelize.org/docs/v6/core-concepts/model-querying-finders/
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Sequelize } from 'sequelize';

import { SequelizeUserRepository } from '../repositories/UserRepository';
import { CreateUser, UpdateUser, DeleteUser, GetUser, ListUsers } from '../../application/use-cases';

type WithSequelize = FastifyInstance & { db: Sequelize };

function assertSequelize(fastify: FastifyInstance): asserts fastify is WithSequelize {
  const db = (fastify as any).db;
  if (!db || typeof db.define !== 'function') {
    throw new Error('Sequelize não encontrado em fastify.db. Registre com fastify.decorate("db", sequelize).');
  }
}

function makeRepo(fastify: FastifyInstance) {
  assertSequelize(fastify);
  return new SequelizeUserRepository(fastify.db);
}

export const listUsers = (fastify: FastifyInstance) => async (_req: FastifyRequest, reply: FastifyReply) => {
  const uc = ListUsers(makeRepo(fastify));
  return reply.send(await uc.execute());
};

export const getUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = GetUser(makeRepo(fastify));
  const item = await uc.execute(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Body: { email: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  const uc = CreateUser(makeRepo(fastify));
  const created = await uc.execute(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string }; Body: { email?: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  const uc = UpdateUser(makeRepo(fastify));
  const updated = await uc.execute(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = DeleteUser(makeRepo(fastify));
  const n = await uc.execute(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
  }

  // Mongoose
  if (orm === 'mongoose') {
    return `/**
 * Referências oficiais:
 * - Fastify TypeScript: https://fastify.io/docs/latest/Reference/TypeScript/
 * - Decorators: https://fastify.io/docs/latest/Reference/Decorators/
 * - Mongoose Model API: https://mongoosejs.com/docs/api/model.html
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { MongooseUserRepository } from '../repositories/UserRepository';
import { CreateUser, UpdateUser, DeleteUser, GetUser, ListUsers } from '../../application/use-cases';

type WithMongoose = FastifyInstance & { db: any };

function assertMongoose(fastify: FastifyInstance): asserts fastify is WithMongoose {
  const db = (fastify as any).db;

  // Pode ser Connection (ideal) ou o próprio mongoose (dependendo do plugin).
  const conn = db?.connection ?? db;
  const readyState = conn?.readyState;

  if (readyState == null) {
    throw new Error('Mongoose não encontrado em fastify.db. Registre com fastify.decorate("db", mongoose.connection ou mongoose).');
  }
  if (readyState === 0) {
    throw new Error('Conexão Mongoose indisponível em fastify.db (readyState=0).');
  }
}

function makeRepo(fastify: FastifyInstance) {
  assertMongoose(fastify);
  return new MongooseUserRepository();
}

export const listUsers = (fastify: FastifyInstance) => async (_req: FastifyRequest, reply: FastifyReply) => {
  const uc = ListUsers(makeRepo(fastify));
  return reply.send(await uc.execute());
};

export const getUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = GetUser(makeRepo(fastify));
  const item = await uc.execute(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Body: { email: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  const uc = CreateUser(makeRepo(fastify));
  const created = await uc.execute(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string }; Body: { email?: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  const uc = UpdateUser(makeRepo(fastify));
  const updated = await uc.execute(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = DeleteUser(makeRepo(fastify));
  const n = await uc.execute(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
  }

  // none / memory
  return `/**
 * Clean Architecture (Memory)
 * Sem banco/ORM — apenas store em memória para exemplo.
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { MemoryUserRepository } from '../repositories/UserRepository';
import { CreateUser, UpdateUser, DeleteUser, GetUser, ListUsers } from '../../application/use-cases';

function makeRepo() {
  return new MemoryUserRepository();
}

export const listUsers = (_fastify: FastifyInstance) => async (_req: FastifyRequest, reply: FastifyReply) => {
  const uc = ListUsers(makeRepo());
  return reply.send(await uc.execute());
};

export const getUser = (_fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = GetUser(makeRepo());
  const item = await uc.execute(req.params.id);
  if (!item) return reply.code(404).send({ error: 'Not found' });
  return reply.send(item);
};

export const createUser = (_fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Body: { email: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  const uc = CreateUser(makeRepo());
  const created = await uc.execute(req.body);
  return reply.code(201).send(created);
};

export const updateUser = (_fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string }; Body: { email?: string; name?: string | null } }>,
  reply: FastifyReply
) => {
  const uc = UpdateUser(makeRepo());
  const updated = await uc.execute(req.params.id, req.body);
  if (!updated) return reply.code(404).send({ error: 'Not found' });
  return reply.send(updated);
};

export const deleteUser = (_fastify: FastifyInstance) => async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const uc = DeleteUser(makeRepo());
  const n = await uc.execute(req.params.id);
  if (!n) return reply.code(404).send({ error: 'Not found' });
  return reply.code(204).send();
};
`;
}
