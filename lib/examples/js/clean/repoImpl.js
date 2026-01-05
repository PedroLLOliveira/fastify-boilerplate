export function repoImplTemplate(orm) {
  // Sempre exportamos MemoryUserRepository para fallback
  const memory = `import { UserRepository } from '../../domain/repositories/UserRepository.js';

const store = { seq: 1, data: [] };

export class MemoryUserRepository extends UserRepository {
  list() { return store.data; }
  get(id) { return store.data.find(u => u.id === Number(id)) || null; }
  create(dto) {
    const u = { id: store.seq++, email: dto.email, name: dto.name ?? null };
    store.data.push(u);
    return u;
  }
  update(id, dto) {
    const i = store.data.findIndex(u => u.id === Number(id));
    if (i < 0) return null;
    store.data[i] = { ...store.data[i], ...dto };
    return store.data[i];
  }
  delete(id) {
    const before = store.data.length;
    store.data = store.data.filter(u => u.id !== Number(id));
    return before - store.data.length;
  }
}
`;

  if (orm === 'prisma') {
    return `${memory}

export class PrismaUserRepository extends UserRepository {
  constructor(db) { super(); this.db = db; }

  list() { return this.db.user.findMany(); }
  get(id) { return this.db.user.findUnique({ where: { id: Number(id) } }); }
  create(dto) { return this.db.user.create({ data: dto }); }
  update(id, dto) { return this.db.user.update({ where: { id: Number(id) }, data: dto }); }

  async delete(id) {
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
    return `${memory}

import { DataTypes } from 'sequelize';

export class SequelizeUserRepository extends UserRepository {
  constructor(db) {
    super();
    this.db = db;

    this.User = this.db.define('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: true }
    }, { tableName: 'users', timestamps: false });
  }

  list() { return this.User.findAll(); }
  get(id) { return this.User.findByPk(Number(id)); }
  create(dto) { return this.User.create(dto); }

  async update(id, dto) {
    const inst = await this.User.findByPk(Number(id));
    if (!inst) return null;
    return inst.update(dto);
  }

  async delete(id) {
    const inst = await this.User.findByPk(Number(id));
    if (!inst) return 0;
    await inst.destroy();
    return 1;
  }
}
`;
  }

  if (orm === 'mongoose') {
    return `${memory}

import mongoose from 'mongoose';

function getUserModel(m) {
  const schema = new m.Schema({
    email: { type: String, unique: true, required: true },
    name: { type: String, default: null }
  }, { timestamps: false });

  return m.models.User || m.model('User', schema);
}

export class MongooseUserRepository extends UserRepository {
  constructor(m) {
    super();
    // aqui esperamos receber o "mongoose" (como você decorou no fastify.db)
    this.m = m || mongoose;
    this.User = getUserModel(this.m);
  }

  list() { return this.User.find(); }
  get(id) { return this.User.findById(id); }
  create(dto) { return this.User.create(dto); }
  update(id, dto) { return this.User.findByIdAndUpdate(id, dto, { new: true }); }
  delete(id) { return this.User.findByIdAndDelete(id).then(r => (r ? 1 : 0)); }
}
`;
  }

  // orm === 'none' (ou qualquer outro): somente memória
  return memory;
}
