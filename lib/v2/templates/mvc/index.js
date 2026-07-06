import { tsconfigContent, envContent, gitignoreContent, configEnvContent, serverContent } from '../minimal/index.js';

export { tsconfigContent, envContent, gitignoreContent, configEnvContent, serverContent };

export const appContent = `import Fastify, { type FastifyInstance } from 'fastify';
import healthRoutes from './routes/health.route.js';

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
import { healthController } from '../controllers/health.controller.js';
import { healthResponseSchema } from '../schemas/health.schema.js';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', { schema: { response: { 200: healthResponseSchema } } }, healthController);
};

export default healthRoutes;
`;

export const healthSchemaContent = `export const healthResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' }
  }
};
`;

export const healthControllerContent = `import type { FastifyRequest, FastifyReply } from 'fastify';
import { checkHealth } from '../services/health.service.js';

export async function healthController(request: FastifyRequest, reply: FastifyReply) {
  const status = await checkHealth();
  return reply.send(status);
}
`;

export const healthServiceContent = `export async function checkHealth() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
`;

export const testHealthContent = `import test from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app.js';

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
