export function repoImplTemplate(orm) {
  if (orm === 'prisma') {
    return `import { UserRepository } from '../../domain/repositories/UserRepository.js';
export class PrismaUserRepository extends UserRepository {
  constructor(db) { super(); this.db = db; }
  list() { return this.db.user.findMany(); }
  get(id) { return this.db.user.findUnique({ where: { id: Number(id) } }); }
  create(dto) { return this.db.user.create({ data: dto }); }
  update(id, dto) { return this.db.user.update({ where: { id: Number(id) }, data: dto }); }
  delete(id) { return this.db.user.delete({ where: { id: Number(id) } }).then(_=>1).catch(_=>0); }
}
`;
  }
  if (orm === 'sequelize') {
    return `import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { DataTypes } from 'sequelize';
export class SequelizeUserRepository extends UserRepository {
  constructor(db) {
    super(); this.db = db;
    this.User = this.db.define('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      name: { type: DataTypes.STRING }
    }, { tableName: 'users', timestamps: false });
  }
  list() { return this.User.findAll(); }
  get(id) { return this.User.findByPk(Number(id)); }
  create(dto) { return this.User.create(dto); }
  async update(id, dto) { const inst = await this.User.findByPk(Number(id)); if(!inst) return null; return inst.update(dto); }
  async delete(id) { const inst = await this.User.findByPk(Number(id)); if(!inst) return 0; await inst.destroy(); return 1; }
}
`;
  }
  if (orm === 'mongoose') {
    return `import { UserRepository } from '../../domain/repositories/UserRepository.js';
import mongoose from 'mongoose';
const schema = new mongoose.Schema({ email: { type: String, unique: true, required: true }, name: String }, { timestamps: false });
const User = mongoose.models.User || mongoose.model('User', schema);
export class MongooseUserRepository extends UserRepository {
  list() { return User.find(); }
  get(id) { return User.findById(id); }
  create(dto) { return User.create(dto); }
  update(id, dto) { return User.findByIdAndUpdate(id, dto, { new: true }); }
  delete(id) { return User.findByIdAndDelete(id).then(r => (r ? 1 : 0)); }
}
`;
  }
  // memória
  return `import { UserRepository } from '../../domain/repositories/UserRepository.js';
const store = { seq: 1, data: [] };
export class MemoryUserRepository extends UserRepository {
  list() { return store.data; }
  get(id) { return store.data.find(u => u.id === Number(id)) || null; }
  create(dto) { const u = { id: store.seq++, email: dto.email, name: dto.name ?? null }; store.data.push(u); return u; }
  update(id, dto) { const i = store.data.findIndex(u => u.id === Number(id)); if(i<0) return null; store.data[i] = { ...store.data[i], ...dto }; return store.data[i]; }
  delete(id) { const b = store.data.length; store.data = store.data.filter(u => u.id !== Number(id)); return b - store.data.length; }
}
`;
}
