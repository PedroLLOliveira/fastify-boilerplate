export function repoImplTemplate(orm) {
  if (orm === 'prisma') {
    return `/**
 * Referências oficiais:
 * - Prisma Client CRUD: https://www.prisma.io/docs/orm/prisma-client/queries/crud
 * - Prisma Client API ref.: https://www.prisma.io/docs/orm/reference/prisma-client-reference
 */

import type { PrismaClient } from '@prisma/client';
import { UserRepository, type IUserDTO } from '../../domain/repositories/UserRepository';

export class PrismaUserRepository extends UserRepository {
  constructor(private db: PrismaClient) { super(); }

  list() {
    return this.db.user.findMany();
  }

  get(id: string | number) {
    return this.db.user.findUnique({ where: { id: Number(id) } });
  }

  create(dto: IUserDTO) {
    return this.db.user.create({ data: dto });
  }

  update(id: string | number, dto: Partial<IUserDTO>) {
    return this.db.user.update({ where: { id: Number(id) }, data: dto });
  }

  async delete(id: string | number) {
    await this.db.user.delete({ where: { id: Number(id) } });
    return 1;
  }
}
`;
  }

  if (orm === 'sequelize') {
    return `/**
 * Referências oficiais:
 * - Sequelize v6 (finders): https://sequelize.org/docs/v6/core-concepts/model-querying-finders/
 * - Sequelize v6 API Model: https://sequelize.org/api/v6/class/src/model.js~model
 * - Sequelize v7 (modelos – tópicos avançados): https://sequelize.org/docs/v7/models/advanced/
 */

import type { Sequelize, ModelStatic, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { DataTypes, Model as SequelizeModel } from 'sequelize';
import { UserRepository, type IUserDTO } from '../../domain/repositories/UserRepository';

class UserModel extends SequelizeModel<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  declare id: number;
  declare email: string;
  declare name: string | null;
}

export class SequelizeUserRepository extends UserRepository {
  private User: ModelStatic<UserModel>;

  constructor(private db: Sequelize) {
    super();
    this.User = this.db.define<UserModel>('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: true },
    }, { tableName: 'users', timestamps: false });
  }

  list() {
    return this.User.findAll();
  }

  get(id: string | number) {
    return this.User.findByPk(Number(id));
  }

  create(dto: IUserDTO) {
    return this.User.create(dto as any);
  }

  async update(id: string | number, dto: Partial<IUserDTO>) {
    const u = await this.User.findByPk(Number(id));
    if (!u) return null;
    return u.update(dto as any);
  }

  async delete(id: string | number) {
    const u = await this.User.findByPk(Number(id));
    if (!u) return 0;
    await u.destroy();
    return 1;
  }
}
`;
  }

  if (orm === 'mongoose') {
    return `/**
 * Referências oficiais:
 * - Mongoose Model API: https://mongoosejs.com/docs/api/model.html
 * - Mongoose Queries: https://mongoosejs.com/docs/queries.html
 */

import mongoose from 'mongoose';
import { UserRepository, type IUserDTO } from '../../domain/repositories/UserRepository';

type IUser = { email: string; name?: string | null };

const schema = new mongoose.Schema<IUser>(
  {
    email: { type: String, unique: true, required: true },
    name: { type: String, default: null },
  },
  { timestamps: false }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', schema);

export class MongooseUserRepository extends UserRepository {
  list() {
    return User.find().lean();
  }

  get(id: string | number) {
    return User.findById(id).lean();
  }

  create(dto: IUserDTO) {
    return User.create(dto);
  }

  update(id: string | number, dto: Partial<IUserDTO>) {
    return User.findByIdAndUpdate(id, dto, { new: true, lean: true });
  }

  async delete(id: string | number) {
    const r = await User.findByIdAndDelete(id);
    return r ? 1 : 0;
  }
}
`;
  }

  // memória (sem refs externas necessárias)
  return `/**
 * Implementação em memória (somente para desenvolvimento/testes).
 */

import { UserRepository, type IUserDTO } from '../../domain/repositories/UserRepository';

const store: { seq: number; data: Array<{ id: number } & IUserDTO> } = { seq: 1, data: [] };

export class MemoryUserRepository extends UserRepository {
  list() { return Promise.resolve(store.data); }
  get(id: string | number) { return Promise.resolve(store.data.find(u => u.id === Number(id)) ?? null); }
  create(dto: IUserDTO) { const u = { id: store.seq++, email: dto.email, name: dto.name ?? null }; store.data.push(u); return Promise.resolve(u); }
  update(id: string | number, dto: Partial<IUserDTO>) {
    const i = store.data.findIndex(u => u.id === Number(id));
    if (i < 0) return Promise.resolve(null);
    store.data[i] = { ...store.data[i], ...dto };
    return Promise.resolve(store.data[i]);
  }
  delete(id: string | number) {
    const before = store.data.length;
    store.data = store.data.filter(u => u.id !== Number(id));
    return Promise.resolve(before - store.data.length);
  }
}
`;
}
