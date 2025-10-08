export function modelTemplate(orm) {
  if (orm === 'sequelize') {
    return `/**
 * Referências oficiais (Sequelize v6):
 * - Model Basics: https://sequelize.org/docs/v6/core-concepts/model-basics/
 * - Model Querying - Finders: https://sequelize.org/docs/v6/core-concepts/model-querying-finders/
 */
import type { Sequelize, Model, ModelStatic } from 'sequelize';
import { DataTypes } from 'sequelize';

export function defineUser(sequelize: Sequelize): ModelStatic<Model<any, any>> {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: true },
  }, { tableName: 'users', timestamps: false });
}
`;
  }
  if (orm === 'mongoose') {
    return `/**
 * Referências oficiais (Mongoose):
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
  }
  // memória
  return `/**
 * Store em memória para dev/testes (sem refs externas).
 */
const store = { seq: 1, data: [] as any[] };
export default store;
`;
}
