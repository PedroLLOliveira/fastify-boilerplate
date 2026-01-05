import path from 'path';
import fsp from 'fs/promises';
import { repositoryTemplate } from './repository.js';
import { handlersTemplate } from './handlers.js';

export async function generate({ root, ext, orm }) {
  const srcDir = path.join(root, 'src');

  // Pasta do módulo (feature)
  const usersModuleDir = path.join(srcDir, 'modules', 'users');
  await fsp.mkdir(usersModuleDir, { recursive: true });

  // (1) Model somente quando ORM exige arquivo de model
  if (orm === 'sequelize') {
    const model = `import { DataTypes } from 'sequelize';

export function defineUser(sequelize) {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: true }
  }, { tableName: 'users', timestamps: false });
}
`;
    await fsp.writeFile(path.join(usersModuleDir, `model.${ext}`), model, 'utf8');
  }

  if (orm === 'mongoose') {
    const model = `import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, default: null }
}, { timestamps: false });

export const User = mongoose.models.User || mongoose.model('User', schema);
`;
    await fsp.writeFile(path.join(usersModuleDir, `model.${ext}`), model, 'utf8');
  }

  // (2) Repository + handlers dentro do módulo
  await fsp.writeFile(
    path.join(usersModuleDir, `repository.${ext}`),
    repositoryTemplate(orm),
    'utf8'
  );

  await fsp.writeFile(
    path.join(usersModuleDir, `index.${ext}`),
    handlersTemplate(orm),
    'utf8'
  );

  // (3) Barrel file para compatibilidade ESM:
  // src/routes/users.js importa "../modules/users.js"
  // então garantimos que esse arquivo exista.
  const modulesDir = path.join(srcDir, 'modules');
  await fsp.mkdir(modulesDir, { recursive: true });

  const barrel = `export * from './users/index.js';
`;
  await fsp.writeFile(path.join(modulesDir, `users.${ext}`), barrel, 'utf8');
}
