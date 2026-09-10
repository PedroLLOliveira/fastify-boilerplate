export const tsconfigContent = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
`;

export const eslintContent = `module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {},
};
`;

export const envContent = `PORT=3000
NODE_ENV=development
`;

export const gitignoreContent = `node_modules
dist
.env
`;

export const configEnvContent = `export function loadEnv() {
  return {
    PORT: process.env.PORT || '3000',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
}
`;

export const healthRouteContent = `import type { FastifyInstance } from 'fastify';

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          required: ['status'],
          properties: { status: { type: 'string' } },
        },
      },
    },
  }, async () => ({ status: 'ok' }));

  app.get('/ready', {
    schema: {
      response: {
        200: {
          type: 'object',
          required: ['status'],
          properties: { status: { type: 'string' } },
        },
      },
    },
  }, async () => ({ status: 'ok' }));
}
`;

export const helloRouteContent = `import type { FastifyInstance } from 'fastify';

export default async function helloRoutes(app: FastifyInstance) {
  app.get('/hello', {
    schema: {
      response: {
        200: {
          type: 'object',
          required: ['message'],
          properties: { message: { type: 'string' } },
        },
      },
    },
  }, async () => ({ message: 'Hello, Fastify v5!' }));
}
`;

export const appContent = `import Fastify, { type FastifyInstance } from 'fastify';
import healthRoutes from './routes/health.js';
import helloRoutes from './routes/hello.js';

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

  // Register routes explicitly (no magic replaces)
  await app.register(healthRoutes);
  await app.register(helloRoutes, { prefix: '/api' });

  return app;
}
`;

export const serverContent = `import 'dotenv/config';
import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';

async function start() {
  const env = loadEnv();
  const app = await buildApp();

  const port = Number(env.PORT);

  try {
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(\`Server listening on port \${port}\`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
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

  const missingResponse = await app.inject({ method: 'GET', url: '/missing' });
  assert.strictEqual(missingResponse.statusCode, 404);
  assert.strictEqual(missingResponse.json().error, 'Not Found');
  assert.ok(missingResponse.json().reqId);

  await app.close();
});
`;

export const testHealthContentVitest = `import { test, expect } from 'vitest';
import { buildApp } from '../src/app.js';

test('GET /health returns 200 and { status: "ok" }', async () => {
  const app = await buildApp();

  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ status: 'ok' });

  const readyResponse = await app.inject({ method: 'GET', url: '/ready' });
  expect(readyResponse.statusCode).toBe(200);

  const missingResponse = await app.inject({ method: 'GET', url: '/missing' });
  expect(missingResponse.statusCode).toBe(404);
  expect(missingResponse.json().error).toBe('Not Found');
  expect(missingResponse.json().reqId).toBeTruthy();

  await app.close();
});
`;
