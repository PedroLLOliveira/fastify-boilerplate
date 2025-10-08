import path from 'path';
import fsp from 'fs/promises';
import { repositoryTemplate } from './repository.ts.js';
import { handlersTemplate } from './handlers.ts.js';

export async function generate({ root, ext, orm }) {
  const usersDir = path.join(root, 'src', 'modules', 'users');
  await fsp.mkdir(usersDir, { recursive: true });

  if (orm === 'sequelize') {
    const model = `/**
 * Referências oficiais (Sequelize)
 * - v6 Model Basics: https://sequelize.org/docs/v6/core-concepts/model-basics/
 * - v7 Defining models: https://sequelize.org/docs/v7/models/defining-models/
 */
import type { Sequelize, ModelStatic, Model } from 'sequelize';
import { DataTypes } from 'sequelize';

export function defineUser(sequelize: Sequelize): ModelStatic<Model<any, any>> {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: true },
  }, { tableName: 'users', timestamps: false });
}
`;
    await fsp.writeFile(path.join(usersDir, `model.${ext}`), model, 'utf8');
  }

  if (orm === 'mongoose') {
    const model = `/**
 * Referências oficiais (Mongoose)
 * - Models (guia): https://mongoosejs.com/docs/models.html
 * - Model API: https://mongoosejs.com/docs/api/model.html
 */
import mongoose from 'mongoose';

export type IUser = { email: string; name?: string | null };

const schema = new mongoose.Schema<IUser>({
  email: { type: String, unique: true, required: true },
  name: { type: String, default: null },
}, { timestamps: false });

export const User = mongoose.models.User || mongoose.model<IUser>('User', schema);
`;
    await fsp.writeFile(path.join(usersDir, `model.${ext}`), model, 'utf8');
  }

  await fsp.writeFile(path.join(usersDir, `repository.${ext}`), repositoryTemplate(orm), 'utf8');
  await fsp.writeFile(path.join(usersDir, `index.${ext}`), handlersTemplate(), 'utf8');
}
