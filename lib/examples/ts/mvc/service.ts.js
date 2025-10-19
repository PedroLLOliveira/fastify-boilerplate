export function serviceTemplate(orm) {
  if (orm === 'prisma') {
    return `/**
 * User Service (Business Logic Layer)
 *
 * This class contains the business logic for user-related operations. It acts as
 * an intermediary between the controllers (request/response layer) and the model
 * (data access layer). This separation of concerns makes the application more
 * modular, testable, and easier to maintain.
 *
 * It utilizes dependency injection to receive an instance of the UserModel,
 * decoupling it from the specific data access implementation.
 *
 * Software Design Patterns:
 * - Service Layer: https://martinfowler.com/eaaCatalog/serviceLayer.html
 * - Dependency Injection: https://martinfowler.com/articles/injection.html
*/
import { CreateUserInput, UpdateUserInput } from '../schemas/userSchema';
import { ConflictError, NotFoundError } from '../errors/AppError';
import { UserModel } from '../models/user.model';

export class UserService {
  // Receives the model via "dependency injection" in the constructor
  constructor(private userModel: UserModel) {}

  public async create(data: CreateUserInput) {
    // BUSINESS LOGIC: Check if the email is already in use
    const existingUser = await this.userModel.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictError('This email is already in use.');
    }

    // Calls the model to create the user
    return this.userModel.create(data);
  }

  public async getAll() {
    return this.userModel.findMany();
  }

  public async getById(id: string) {
    const user = await this.userModel.findById(id);

    // BUSINESS LOGIC: Check if the user exists
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    return user;
  }

  public async update(id: string, data: UpdateUserInput) {
    // BUSINESS LOGIC: Ensure the user exists before updating
    await this.getById(id);
    return this.userModel.update(id, data);
  }

  public async delete(id: string) {
    // BUSINESS LOGIC: Ensure the user exists before deleting
    await this.getById(id);
    return this.userModel.delete(id);
  }
}

`;
  }

  if (orm === 'sequelize') {
    return `/**
 * Referências oficiais (Sequelize v6):
 * - Model Querying - Basics (CRUD): https://sequelize.org/docs/v6/core-concepts/model-querying-basics/
 * - Model Querying - Finders: https://sequelize.org/docs/v6/core-concepts/model-querying-finders/
 */
import type { Sequelize, ModelStatic, Model } from 'sequelize';
import { defineUser } from '../models/user';

type DB = Sequelize;
type UserDTO = { email: string; name?: string | null };

export function buildUserService(db: DB) {
  const User: ModelStatic<Model<any, any>> = defineUser(db);
  return {
    list: () => User.findAll(),
    get: (id: string) => User.findByPk(Number(id)),
    create: (dto: UserDTO) => User.create(dto as any),
    update: async (id: string, dto: Partial<UserDTO>) => {
      const u = await User.findByPk(Number(id));
      if (!u) return null;
      return u.update(dto as any);
    },
    delete: async (id: string) => {
      const u = await User.findByPk(Number(id));
      if (!u) return 0;
      await u.destroy();
      return 1;
    },
  };
}
`;
  }

  if (orm === 'mongoose') {
    return `/**
 * Referências oficiais (Mongoose):
 * - Queries: https://mongoosejs.com/docs/queries.html
 * - Model API: https://mongoosejs.com/docs/api/model.html
 */
import { User } from '../models/user';
type UserDTO = { email: string; name?: string | null };

export function buildUserService(_db: unknown) {
  return {
    list: () => User.find().lean(),
    get: (id: string) => User.findById(id).lean(),
    create: (dto: UserDTO) => User.create(dto),
    update: (id: string, dto: Partial<UserDTO>) => User.findByIdAndUpdate(id, dto, { new: true, lean: true }),
    delete: async (id: string) => {
      const r = await User.findByIdAndDelete(id);
      return r ? 1 : 0;
    },
  };
}
`;
  }

  // memória
  return `/**
 * Service em memória (dev/testes).
 */
type UserDTO = { email: string; name?: string | null };
const store: { seq: number; data: Array<{ id: number } & UserDTO> } = { seq: 1, data: [] };

export function buildUserService(_db: unknown) {
  return {
    list: () => store.data,
    get: (id: string) => store.data.find(u => u.id === Number(id)) ?? null,
    create: (dto: UserDTO) => { const u = { id: store.seq++, email: dto.email, name: dto.name ?? null }; store.data.push(u); return u; },
    update: (id: string, dto: Partial<UserDTO>) => { const i = store.data.findIndex(u => u.id === Number(id)); if (i < 0) return null; store.data[i] = { ...store.data[i], ...dto }; return store.data[i]; },
    delete: (id: string) => { const b = store.data.length; store.data = store.data.filter(u => u.id !== Number(id)); return b - store.data.length; },
  };
}
`;
}
