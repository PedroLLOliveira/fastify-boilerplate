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
  if (orm === 'prisma') {
    return`/**
 * User Model (Data Access Layer)
 *
 * This class encapsulates all database access logic for the User entity.
 * It uses Prisma Client to perform CRUD (Create, Read, Update, Delete) operations.
 *
 * Prisma CRUD Operations: https://www.prisma.io/docs/concepts/components/prisma-client/crud
 * Prisma Client API Reference: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
*/
import { prisma } from '../lib/prisma';
import { CreateUserInput, UpdateUserInput } from '../schemas/userSchema';

export class UserModel {
  // Creates a new user in the database
  async create(data: CreateUserInput) {
    return prisma.user.create({ data });
  }

  // Finds a user by their email
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  // Finds a user by their ID
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  // Retrieves all users from the database
  async findMany() {
    return prisma.user.findMany();
  }

  // Updates a user's data
  async update(id: string, data: UpdateUserInput) {
    return prisma.user.update({ where: { id }, data });
  }

  // Deletes a user from the database
  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
`
  }
  // memória
  return `/**
 * Store em memória para dev/testes (sem refs externas).
 */
const store = { seq: 1, data: [] as any[] };
export default store;
`;
}
