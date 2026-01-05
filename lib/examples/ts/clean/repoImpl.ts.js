export function repoImplTemplate(orm) {
  if (orm === 'prisma') {
    return `/**
 * Prisma Repository Implementation
 * Referências:
 * - CRUD: https://www.prisma.io/docs/orm/prisma-client/queries/crud
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

  async update(id: string | number, dto: Partial<IUserDTO>) {
    try {
      return await this.db.user.update({ where: { id: Number(id) }, data: dto });
    } catch {
      return null;
    }
  }

  async delete(id: string | number) {
    try {
      await this.db.user.delete({ where: { id: Number(id) } });
      return 1;
    } catch {
      return 0;
    }
  }
}
`;
  }

  if (orm === 'sequelize') {
    return `/**
 * Sequelize Repository Implementation
 * Referências:
 * - Finders: https://sequelize.org/docs/v6/core-concepts/model-querying-finders/
 */

import type { Sequelize, ModelStatic, Model } from 'sequelize';
import { DataTypes } from 'sequelize';

import { UserRepository, type IUserDTO } from '../../domain/repositories/UserRepository';

export class SequelizeUserRepository extends UserRepository {
  private User: ModelStatic<Model<any, any>>;

  constructor(private db: Sequelize) {
    super();

    // Evita redefinir o modelo se já existir no Sequelize instance
    const existing = (this.db.models as any).User;
    this.User = existing ?? this.db.define('User', {
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
 * Mongoose Repository Implementation
 * Referências:
 * - Model API: https://mongoosejs.com/docs/api/model.html
 * - Queries: https://mongoosejs.com/docs/queries.html
 */

import mongoose from 'mongoose';
import { UserRepository, type IUserDTO } from '../../domain/repositories/UserRepository';

type IUser = { email: string; name?: string | null };

const schema = new mongoose.Schema<IUser>({
  email: { type: String, unique: true, required: true },
  name: { type: String, default: null },
}, { timestamps: false });

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

  // memory
  return `/**
 * Memory Repository Implementation
 * Apenas para dev/testes (exemplo).
 */

import { UserRepository, type IUserDTO } from '../../domain/repositories/UserRepository';

const store: { seq: number; data: Array<{ id: number } & IUserDTO> } = { seq: 1, data: [] };

export class MemoryUserRepository extends UserRepository {
  async list() {
    return store.data;
  }

  async get(id: string | number) {
    return store.data.find(u => u.id === Number(id)) ?? null;
  }

  async create(dto: IUserDTO) {
    const u = { id: store.seq++, email: dto.email, name: dto.name ?? null };
    store.data.push(u);
    return u;
  }

  async update(id: string | number, dto: Partial<IUserDTO>) {
    const i = store.data.findIndex(u => u.id === Number(id));
    if (i < 0) return null;
    store.data[i] = { ...store.data[i], ...dto };
    return store.data[i];
  }

  async delete(id: string | number) {
    const before = store.data.length;
    store.data = store.data.filter(u => u.id !== Number(id));
    return before - store.data.length;
  }
}
`;
}
