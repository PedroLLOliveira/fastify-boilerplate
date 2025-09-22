export function repoImplTemplate(orm) {
  if (orm === 'prisma') {
    return `import type { PrismaClient } from '@prisma/client';
import { UserRepository, type IUserDTO } from '../../domain/repositories/UserRepository';
export class PrismaUserRepository extends UserRepository {
  constructor(private db: PrismaClient) { super(); }
  list() { return this.db.user.findMany(); }
  get(id: string | number) { return this.db.user.findUnique({ where: { id: Number(id) } }); }
  create(dto: IUserDTO) { return this.db.user.create({ data: dto }); }
  update(id: string | number, dto: Partial<IUserDTO>) { return this.db.user.update({ where: { id: Number(id) }, data: dto }); }
  delete(id: string | number) { return this.db.user.delete({ where: { id: Number(id) } }).then(()=>1).catch(()=>0); }
}
`;
  }
  if (orm === 'sequelize') {
    return `import type { Sequelize, ModelStatic, Model } from 'sequelize';
import { DataTypes } from 'sequelize';
import { UserRepository, type IUserDTO } from '../../domain/repositories/UserRepository';
export class SequelizeUserRepository extends UserRepository {
  private User: ModelStatic<Model<any, any>>;
  constructor(private db: Sequelize) {
    super();
    this.User = this.db.define('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      name: { type: DataTypes.STRING }
    }, { tableName: 'users', timestamps: false });
  }
  list() { return this.User.findAll(); }
  get(id: string | number) { return this.User.findByPk(Number(id)); }
  create(dto: IUserDTO) { return this.User.create(dto as any); }
  async update(id: string | number, dto: Partial<IUserDTO>) { const u = await this.User.findByPk(Number(id)); if(!u) return null; return u.update(dto as any); }
  async delete(id: string | number) { const u = await this.User.findByPk(Number(id)); if(!u) return 0; await u.destroy(); return 1; }
}
`;
  }
  if (orm === 'mongoose') {
    return `import mongoose from 'mongoose';
import { UserRepository, type IUserDTO } from '../../domain/repositories/UserRepository';
type IUser = { email: string; name?: string | null };
const schema = new mongoose.Schema<IUser>({ email: { type: String, unique: true, required: true }, name: String }, { timestamps: false });
const User = mongoose.models.User || mongoose.model<IUser>('User', schema);
export class MongooseUserRepository extends UserRepository {
  list() { return User.find(); }
  get(id: string | number) { return User.findById(id); }
  create(dto: IUserDTO) { return User.create(dto); }
  update(id: string | number, dto: Partial<IUserDTO>) { return User.findByIdAndUpdate(id, dto, { new: true }); }
  delete(id: string | number) { return User.findByIdAndDelete(id).then(r => (r ? 1 : 0)); }
}
`;
  }
  // memória
  return `import { UserRepository, type IUserDTO } from '../../domain/repositories/UserRepository';
const store: { seq: number; data: Array<{ id: number } & IUserDTO> } = { seq: 1, data: [] };
export class MemoryUserRepository extends UserRepository {
  list() { return store.data; }
  get(id: string | number) { return store.data.find(u => u.id === Number(id)) ?? null; }
  create(dto: IUserDTO) { const u = { id: store.seq++, email: dto.email, name: dto.name ?? null }; store.data.push(u); return u; }
  update(id: string | number, dto: Partial<IUserDTO>) { const i = store.data.findIndex(u => u.id === Number(id)); if(i<0) return null; store.data[i] = { ...store.data[i], ...dto }; return store.data[i]; }
  delete(id: string | number) { const b = store.data.length; store.data = store.data.filter(u => u.id !== Number(id)); return b - store.data.length; }
}
`;
}
