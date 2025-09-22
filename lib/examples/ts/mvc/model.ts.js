export function modelTemplate(orm) {
  if (orm === 'sequelize') {
    return `import type { Sequelize, Model, ModelStatic } from 'sequelize';
import { DataTypes } from 'sequelize';

export function defineUser(sequelize: Sequelize): ModelStatic<Model<any, any>> {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING }
  }, { tableName: 'users', timestamps: false });
}
`;
  }
  if (orm === 'mongoose') {
    return `import mongoose from 'mongoose';
export type IUser = { email: string; name?: string | null };
const schema = new mongoose.Schema<IUser>({ email: { type: String, unique: true, required: true }, name: { type: String } }, { timestamps: false });
export const User = mongoose.models.User || mongoose.model<IUser>('User', schema);
`;
  }
  // memória
  return `const store = { seq: 1, data: [] as any[] };
export default store;
`;
}
