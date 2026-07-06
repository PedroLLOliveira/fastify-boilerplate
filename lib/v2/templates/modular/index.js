import {
  tsconfigContent,
  eslintContent,
  envContent,
  gitignoreContent,
  configEnvContent,
  serverContent
} from '../minimal/index.js';

export {
  tsconfigContent,
  eslintContent,
  envContent,
  gitignoreContent,
  configEnvContent,
  serverContent
};

export const appContent = `import Fastify, { type FastifyInstance } from 'fastify';
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

  await app.register(healthRoutes);
  await app.register(usersRoutes, { prefix: '/users' });

  return app;
}
`;

export const healthRouteContent = `import type { FastifyInstance } from 'fastify';
import { getHealthSchema } from './health.schema.js';

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/health', { schema: getHealthSchema }, async () => ({ status: 'ok' }));
  app.get('/ready', { schema: getHealthSchema }, async () => ({ status: 'ok' }));
}
`;

export const healthSchemaContent = `export const getHealthSchema = {
  response: {
    200: {
      type: 'object',
      required: ['status'],
      properties: { status: { type: 'string' } },
    },
    503: {
      type: 'object',
      required: ['status'],
      properties: { status: { type: 'string' } },
    }
  },
};
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
      required: ['data'],
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' }
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

export const usersServiceContent = `const users = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' }
];

export async function listUsers() {
  return users;
}

export async function createUser(name: string, email: string) {
  if (email === 'alice@test.com') {
    const err = new Error('Email already in use');
    err.name = 'ConflictError';
    throw err;
  }
  return { id: '3', name, email };
}
`;

export const testHealthContent = `import test from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app.js';

test('GET /health returns 200 and { status: "ok" }', async () => {
  const app = await buildApp();
  
  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });

  assert.strictEqual(response.statusCode, 200);
  assert.deepStrictEqual(response.json(), { status: 'ok' });
  
  const readyResponse = await app.inject({ method: 'GET', url: '/ready' });
  assert.strictEqual(readyResponse.statusCode, 200);

  await app.close();
});
`;

export const testUsersContent = `import test from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app.js';

test('Users API flow', async (t) => {
  const app = await buildApp();
  
  await t.test('GET /users returns 200 and list of users', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users'
    });

    assert.strictEqual(response.statusCode, 200);
    const payload = response.json();
    assert.ok(Array.isArray(payload.data));
    assert.strictEqual(payload.data.length, 2);
    assert.strictEqual(payload.data[0].name, 'Alice');
  });
  
  await t.test('POST /users returns 400 on invalid body', async () => {
    const res = await app.inject({ method: 'POST', url: '/users', payload: {} });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.json().error, 'Bad Request');
  });

  await t.test('POST /users returns 409 on conflict', async () => {
    const res = await app.inject({ method: 'POST', url: '/users', payload: { name: 'Alice', email: 'alice@test.com' } });
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.json().error, 'Conflict');
  });

  await app.close();
});
`;
