export function serviceTemplate(orm) {
  if (orm === 'prisma') {
    return `export function buildUserService(db) {
  return {
    list: () => db.user.findMany(),
    get: (id) => db.user.findUnique({ where: { id: Number(id) } }),
    create: (dto) => db.user.create({ data: dto }),

    update: async (id, dto) => {
      try {
        return await db.user.update({ where: { id: Number(id) }, data: dto });
      } catch (_e) {
        return null;
      }
    },

    delete: async (id) => {
      try {
        await db.user.delete({ where: { id: Number(id) } });
        return 1;
      } catch (_e) {
        return 0;
      }
    }
  };
}
`;
  }

  if (orm === 'sequelize') {
    return `import { defineUser } from '../models/user.js';

export function buildUserService(db) {
  const User = defineUser(db);
  return {
    list: () => User.findAll(),
    get: (id) => User.findByPk(Number(id)),
    create: (dto) => User.create(dto),
    update: async (id, dto) => {
      const u = await User.findByPk(Number(id));
      if (!u) return null;
      return u.update(dto);
    },
    delete: async (id) => {
      const u = await User.findByPk(Number(id));
      if (!u) return 0;
      await u.destroy();
      return 1;
    }
  };
}
`;
  }

  if (orm === 'mongoose') {
    return `import { User } from '../models/user.js';

export function buildUserService(_db) {
  return {
    list: () => User.find().lean(),
    get: (id) => User.findById(id).lean(),
    create: (dto) => User.create(dto),
    update: (id, dto) => User.findByIdAndUpdate(id, dto, { new: true, lean: true }),
    delete: (id) => User.findByIdAndDelete(id).then(r => (r ? 1 : 0))
  };
}
`;
  }

  // none -> memória
  return `import store from '../models/user.js';

export function buildUserService(_db) {
  return {
    list: () => store.data,
    get: (id) => store.data.find(u => u.id === Number(id)) || null,
    create: (dto) => {
      const u = { id: store.seq++, email: dto.email, name: dto.name ?? null };
      store.data.push(u);
      return u;
    },
    update: (id, dto) => {
      const i = store.data.findIndex(u => u.id === Number(id));
      if (i < 0) return null;
      store.data[i] = { ...store.data[i], ...dto };
      return store.data[i];
    },
    delete: (id) => {
      const before = store.data.length;
      store.data = store.data.filter(u => u.id !== Number(id));
      return before - store.data.length;
    }
  };
}
`;
}
