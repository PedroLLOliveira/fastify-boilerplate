import {
  tsconfigContent,
  eslintContent,
  gitignoreContent,
  healthSchemaContent,
  serverContent
} from '../modular/index.js';

export { tsconfigContent, eslintContent, gitignoreContent, healthSchemaContent, serverContent };

export const dockerComposeContent = `services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: fastify_dev
    ports:
      - "5432:5432"
`;

export const envFileContent = `PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://devuser:devpassword@localhost:5432/fastify_dev
`;

export const configEnvContent = `import 'dotenv/config';

export function loadEnv() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in environment variables');
  }
  return {
    PORT: process.env.PORT || '3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL
  };
}
`;

export const sequelizercContent = `const path = require('path');

module.exports = {
  'config': path.resolve('src/db/config.cjs'),
  'models-path': path.resolve('src/db/models'),
  'seeders-path': path.resolve('src/db/seeders'),
  'migrations-path': path.resolve('src/db/migrations')
};
`;

export const sequelizeConfigCjsContent = `require('dotenv/config');

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false
  }
};
`;

export const databaseTsContent = `import { Sequelize } from 'sequelize';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'test' ? false : console.log,
});
`;

export const dbPluginContent = `import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { sequelize } from '../db/database.js';

export default fp(async (fastify: FastifyInstance) => {
  // Fail-fast test connection
  await sequelize.authenticate();

  fastify.decorate('db', sequelize);

  fastify.addHook('onClose', async () => {
    await sequelize.close();
  });
});
`;

export const userModelContent = `import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database.js';

export class User extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
  declare created_at: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);
`;

export const migration0001Content = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
`;

export const appTsContent = `import Fastify, { type FastifyInstance } from 'fastify';
import dbPlugin from './plugins/db-sequelize.js';
import healthRoutes from './modules/health/health.route.js';
import usersRoutes from './modules/users/users.route.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
    genReqId: () => 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.setErrorHandler((error: any, request, reply) => {
    request.log.error(error);
    
    if (error.validation) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: error.message,
        statusCode: 400,
        reqId: request.id
      });
    }

    if (error.name === 'ConflictError') {
      return reply.status(409).send({
        error: 'Conflict',
        message: error.message,
        statusCode: 409,
        reqId: request.id
      });
    }

    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500,
      reqId: request.id
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: 'Route ' + request.method + ':' + request.url + ' not found',
      statusCode: 404,
      reqId: request.id
    });
  });

  // Lifecycle
  await app.register(dbPlugin);

  // Routes
  await app.register(healthRoutes);
  await app.register(usersRoutes, { prefix: '/users' });

  return app;
}
`;

export const healthRouteContent = `import type { FastifyInstance } from 'fastify';
import { getHealthSchema } from './health.schema.js';
import { sequelize } from '../../db/database.js';

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/health', { schema: getHealthSchema }, async () => ({ status: 'ok' }));

  app.get('/ready', { schema: getHealthSchema }, async (req, reply) => {
    try {
      await sequelize.authenticate();
      return { status: 'ok' };
    } catch (err) {
      req.log.error(err);
      return reply.status(503).send({ status: 'unavailable' });
    }
  });
}
`;

export const usersRouteContent = `import type { FastifyInstance } from 'fastify';
import { getUsersHandler, createUserHandler } from './users.handler.js';
import { getUsersSchema, createUserSchema } from './users.schema.js';

export default async function usersRoutes(app: FastifyInstance) {
  app.get('/', { schema: getUsersSchema }, getUsersHandler);
  app.post('/', { schema: createUserSchema }, createUserHandler);
}
`;

export const usersSchemaContent = `export const getUsersSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    }
  }
};

export const createUserSchema = {
  body: {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string' }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
  }
};
`;

export const usersHandlerContent = `import type { FastifyRequest, FastifyReply } from 'fastify';
import * as userService from './users.service.js';

export async function getUsersHandler() {
  const users = await userService.listUsers();
  return { data: users };
}

export async function createUserHandler(
  request: FastifyRequest<{ Body: { name: string; email: string } }>, 
  reply: FastifyReply
) {
  const user = await userService.createUser(request.body.name, request.body.email);
  return reply.status(201).send({ data: user });
}
`;

export const usersServiceContent = `import * as userRepository from './users.repository.js';

export async function listUsers() {
  return userRepository.findAll();
}

export async function createUser(name: string, email: string) {
  return userRepository.create(name, email);
}
`;

export const usersRepositoryContent = `import { UniqueConstraintError } from 'sequelize';
import { User } from '../../db/models/user.js';

export async function findAll() {
  return User.findAll({ attributes: ['id', 'name', 'email', 'created_at'] });
}

export async function findByEmail(email: string) {
  return User.findOne({ where: { email } });
}

export async function create(name: string, email: string) {
  try {
    const user = await User.create({ name, email });
    return user.toJSON();
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      const err = new Error('Email already in use');
      err.name = 'ConflictError';
      throw err;
    }
    throw error;
  }
}
`;

export const testEnvContent = `import test from 'node:test';
import assert from 'node:assert';
import { loadEnv } from '../src/config/env.js';

test('Throws if DATABASE_URL is missing', () => {
  const original = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  assert.throws(() => loadEnv(), /DATABASE_URL is missing/);
  process.env.DATABASE_URL = original; // Restore
});
`;

export const testUsersContent = `import test from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app.js';
import { User } from '../src/db/models/user.js';

test('Users API flow', async (t) => {
  // We clean the table before testing to ensure idempotency
  await User.destroy({ truncate: true, cascade: true });
  const app = await buildApp();

  await t.test('POST /users creates a user', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { name: 'Alice', email: 'alice@test.com' }
    });
    assert.strictEqual(res.statusCode, 201);
    const data = res.json().data;
    assert.strictEqual(data.name, 'Alice');
  });

  await t.test('POST /users returns 409 on email conflict', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { name: 'Alice 2', email: 'alice@test.com' }
    });
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.json().error, 'Conflict');
  });

  await t.test('GET /users returns list', async () => {
    const res = await app.inject({ method: 'GET', url: '/users' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json().data.length, 1);
  });

  await t.test('POST /users returns 400 on invalid payload', async () => {
    const res = await app.inject({ method: 'POST', url: '/users', payload: {} });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.json().error, 'Bad Request');
  });

  await t.test('GET /missing returns 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/missing' });
    assert.strictEqual(res.statusCode, 404);
  });

  await t.test('GET /ready returns 200 with DB available', async () => {
    const res = await app.inject({ method: 'GET', url: '/ready' });
    assert.strictEqual(res.statusCode, 200);
  });

  await app.close();
});
`;
