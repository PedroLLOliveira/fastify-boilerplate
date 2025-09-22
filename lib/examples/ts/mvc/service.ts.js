export function serviceTemplate(orm) {
  if (orm === 'prisma') {
    return `import type { PrismaClient } from '@prisma/client';
type DB = PrismaClient;
type UserDTO = { email: string; name?: string | null };

export function buildUserService(db: DB) {
  return {
    list: () => db.user.findMany(),
    get: (id: string) => db.user.findUnique({ where: { id: Number(id) } }),
    create: (dto: UserDTO) => db.user.create({ data: dto }),
    update: (id: string, dto: Partial<UserDTO>) => db.user.update({ where: { id: Number(id) }, data: dto }),
    delete: (id: string) => db.user.delete({ where: { id: Number(id) } }).then(() => 1).catch(() => 0)
  };
}
`;
  }
  if (orm === 'sequelize') {
    return `import type { Sequelize, ModelStatic, Model } from 'sequelize';
import { defineUser } from '../models/user';

type DB = Sequelize;
type UserDTO = { email: string; name?: string | null };

export function buildUserService(db: DB) {
  const User: ModelStatic<Model<any, any>> = defineUser(db);
  return {
    list: () => User.findAll(),
    get: (id: string) => User.findByPk(Number(id)),
    create: (dto: UserDTO) => User.create(dto as any),
    update: async (id: string, dto: Partial<UserDTO>) => { const u = await User.findByPk(Number(id)); if(!u) return null; return u.update(dto as any); },
    delete: async (id: string) => { const u = await User.findByPk(Number(id)); if(!u) return 0; await u.destroy(); return 1; }
  };
}
`;
  }
  if (orm === 'mongoose') {
    return `import { User } from '../models/user';
type UserDTO = { email: string; name?: string | null };

export function buildUserService(_db: unknown) {
  return {
    list: () => User.find(),
    get: (id: string) => User.findById(id),
    create: (dto: UserDTO) => User.create(dto),
    update: (id: string, dto: Partial<UserDTO>) => User.findByIdAndUpdate(id, dto, { new: true }),
    delete: (id: string) => User.findByIdAndDelete(id).then(r => (r ? 1 : 0))
  };
}
`;
  }
  // none
  return `type UserDTO = { email: string; name?: string | null };
const store: { seq: number; data: Array<{ id: number } & UserDTO> } = { seq: 1, data: [] };

export function buildUserService(_db: unknown) {
  return {
    list: () => store.data,
    get: (id: string) => store.data.find(u => u.id === Number(id)) ?? null,
    create: (dto: UserDTO) => { const u = { id: store.seq++, email: dto.email, name: dto.name ?? null }; store.data.push(u); return u; },
    update: (id: string, dto: Partial<UserDTO>) => { const i = store.data.findIndex(u => u.id === Number(id)); if(i<0) return null; store.data[i] = { ...store.data[i], ...dto }; return store.data[i]; },
    delete: (id: string) => { const b = store.data.length; store.data = store.data.filter(u => u.id !== Number(id)); return b - store.data.length; }
  };
}
`;
}
