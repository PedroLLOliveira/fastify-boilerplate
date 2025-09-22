export function modelTemplate(orm) {
  if (orm === 'sequelize') {
    return `import { DataTypes } from 'sequelize';
export function defineUser(sequelize) {
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
const schema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String }
}, { timestamps: false });
export const User = mongoose.models.User || mongoose.model('User', schema);
`;
  }
  // memória
  return `const store = { seq: 1, data: [] };
export default store;
`;
}
