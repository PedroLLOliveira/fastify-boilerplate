import { tsconfigContent, envContent, gitignoreContent, configEnvContent } from '../minimal/index.js';

export { tsconfigContent, envContent, gitignoreContent, configEnvContent };

// server.ts não pode ser herdado do minimal: lá `buildApp` mora em
// `./app.js` (mesmo diretório), mas na Clean Architecture o app.ts fica em
// src/infrastructure/web/fastify/app.ts — o import precisa refletir isso.
export const serverContent = `import 'dotenv/config';
import { buildApp } from './infrastructure/web/fastify/app.js';
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

  const shutdown = async (signal: string) => {
    app.log.info(\`\${signal} recebido, encerrando graciosamente...\`);
    try {
      await app.close();
      process.exit(0);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
`;

export const appContent = `import Fastify, { type FastifyInstance } from 'fastify';
import healthRoutes from '../routes/health.route.js';

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
      message: 'Route not found',
      statusCode: 404,
      reqId: request.id
    });
  });

  app.register(healthRoutes, { prefix: '/health' });

  return app;
}
`;

export const healthRouteContent = `import type { FastifyPluginAsync } from 'fastify';
import { HealthController } from '../controllers/health.controller.js';
import { CheckHealthUseCase } from '../../../core/useCases/checkHealth.usecase.js';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Composition Root
  const checkHealthUseCase = new CheckHealthUseCase();
  const healthController = new HealthController(checkHealthUseCase);

  const schema = {
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    }
  };

  fastify.get('/', { schema }, healthController.handle.bind(healthController));
};

export default healthRoutes;
`;

export const healthControllerContent = `import type { FastifyRequest, FastifyReply } from 'fastify';
import type { CheckHealthUseCase } from '../../../core/useCases/checkHealth.usecase.js';

export class HealthController {
  constructor(private checkHealthUseCase: CheckHealthUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const status = await this.checkHealthUseCase.execute();
    return reply.send(status);
  }
}
`;

export const checkHealthUseCaseContent = `export class CheckHealthUseCase {
  async execute() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
`;

export const testHealthContent = `import test from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/infrastructure/web/fastify/app.js';

test('GET /health returns 200 and status ok', async (t) => {
  const app = await buildApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });

  assert.strictEqual(response.statusCode, 200);
  const payload = JSON.parse(response.payload);
  assert.strictEqual(payload.status, 'ok');
});
`;

export const testHealthContentVitest = `import { test, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/infrastructure/web/fastify/app.js';

let app;
beforeAll(async () => { app = await buildApp(); });
afterAll(() => app.close());

test('GET /health returns 200 and status ok', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });

  expect(response.statusCode).toBe(200);
  const payload = JSON.parse(response.payload);
  expect(payload.status).toBe('ok');
});
`;
