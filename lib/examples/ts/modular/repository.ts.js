export function repositoryTemplate(orm) {
  if (orm === 'prisma') {
    return `/**
 * Referências oficiais (Prisma)
 * - CRUD com Prisma Client: https://www.prisma.io/docs/orm/prisma-client/queries/crud
 * - API Reference do Prisma Client: https://www.prisma.io/docs/orm/reference/prisma-client-reference
 */
import type { PrismaClient } from '@prisma/client';
type DB = PrismaClient;

export type UserDTO = { email: string; name?: string | null };

export const repo = (db: DB) => ({
  list: () => db.user.findMany(),
  get: (id: string) => db.user.findUnique({ where: { id: Number(id) } }),
  create: (dto: UserDTO) => db.user.create({ data: dto }),
  update: (id: string, dto: Partial<UserDTO>) => db.user.update({ where: { id: Number(id) }, data: dto }),
  delete: async (id: string) => {
    try {
      await db.user.delete({ where: { id: Number(id) } });
      return 1;
    } catch {
      return 0;
    }
  },
});
`;
  }

  if (orm === 'sequelize') {
    return `/**
 * Referências oficiais (Sequelize)
 * - v6 Querying - Basics (CRUD): https://sequelize.org/docs/v6/core-concepts/model-querying-basics/
 * - v6 Querying - Finders: https://sequelize.org/docs/v6/core-concepts/model-querying-finders/
 */
import type { Sequelize, ModelStatic, Model } from 'sequelize';
import { defineUser } from './model.js';

export interface UserDTO { email: string; name?: string | null; }
type DB = Sequelize;

interface UserAttributes { email: string; name?: string | null; }
type UserCreationAttributes = UserDTO;

export const repo = (sequelize: DB): {
  list: () => Promise<Array<Model<UserAttributes, UserCreationAttributes>>>,
  get: (id: string) => Promise<Model<UserAttributes, UserCreationAttributes> | null>,
  create: (dto: UserDTO) => Promise<Model<UserAttributes, UserCreationAttributes>>,
  update: (id: string, dto: Partial<UserDTO>) => Promise<Model<UserAttributes, UserCreationAttributes> | null>,
  delete: (id: string) => Promise<number>
} => {
  const User: ModelStatic<Model<UserAttributes, UserCreationAttributes>> = defineUser(sequelize);

  return {
    list: async () => await User.findAll(),
    get: async (id: string) => await User.findByPk(Number(id)),
    create: async (dto: UserDTO) => await User.create(dto as any),
    update: async (id: string, dto: Partial<UserDTO>) => {
      const u = await User.findByPk(Number(id));
      if (!u) return null;
      return await u.update(dto as any);
    },
    delete: async (id: string) => {
      const u = await User.findByPk(Number(id));
      if (!u) return 0;
      await u.destroy();
      return 1;
    },
  };
};
`;
  }

  if (orm === 'mongoose') {
    return `/**
 * Referências oficiais (Mongoose)
 * - Model API: https://mongoosejs.com/docs/api/model.html
 * - Queries: https://mongoosejs.com/docs/queries.html
 */
import { User } from './model.js';

export type UserDTO = { email: string; name?: string | null };

export const repo = (_db: unknown) => ({
  list: () => User.find().lean(),
  get: (id: string) => User.findById(id).lean(),
  create: (dto: UserDTO) => User.create(dto),
  update: (id: string, dto: Partial<UserDTO>) => User.findByIdAndUpdate(id, dto, { new: true, lean: true }),
  delete: async (id: string) => {
    const r = await User.findByIdAndDelete(id);
    return r ? 1 : 0;
  },
});
`;
  }

  // memória
  return `/**
 * Implementação em memória (dev/teste).
 * Sem refs externas.
 */
export type UserDTO = { email: string; name?: string | null };

const store: { seq: number; data: Array<{ id: number } & UserDTO> } = { seq: 1, data: [] };

export const repo = (_db: unknown) => ({
  list: () => store.data,
  get: (id: string) => store.data.find((u) => u.id === Number(id)) ?? null,
  create: (dto: UserDTO) => {
    const u = { id: store.seq++, email: dto.email, name: dto.name ?? null };
    store.data.push(u);
    return u;
  },
  update: (id: string, dto: Partial<UserDTO>) => {
    const i = store.data.findIndex((u) => u.id === Number(id));
    if (i < 0) return null;
    store.data[i] = { ...store.data[i], ...dto };
    return store.data[i];
  },
  delete: (id: string) => {
    const before = store.data.length;
    store.data = store.data.filter((u) => u.id !== Number(id));
    return before - store.data.length;
  },
});
`;
}
