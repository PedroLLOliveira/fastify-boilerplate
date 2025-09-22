import path from 'path';
import fsp from 'fs/promises';
import { repositoryTemplate } from './repository.js';
import { handlersTemplate } from './handlers.js';

export async function generate({ root, ext, orm }) {
  const usersDir = path.join(root, 'src', 'modules', 'users');
  await fsp.mkdir(usersDir, { recursive: true });

  // model só para orm que precisa
  if (orm === 'sequelize') {
    const model = `import { DataTypes } from 'sequelize';
export function defineUser(sequelize) {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING }
  }, { tableName: 'users', timestamps: false });
}
`;
    await fsp.writeFile(path.join(usersDir, `model.${ext}`), model, 'utf8');
  }
  if (orm === 'mongoose') {
    const model = `import mongoose from 'mongoose';
const schema = new mongoose.Schema({ email: { type: String, unique: true, required: true }, name: String }, { timestamps: false });
export const User = mongoose.models.User || mongoose.model('User', schema);
`;
    await fsp.writeFile(path.join(usersDir, `model.${ext}`), model, 'utf8');
  }

  await fsp.writeFile(path.join(usersDir, `repository.${ext}`), repositoryTemplate(orm), 'utf8');
  await fsp.writeFile(path.join(usersDir, `index.${ext}`), handlersTemplate(), 'utf8');
}
