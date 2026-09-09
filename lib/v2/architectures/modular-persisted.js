// Núcleo compartilhado da arquitetura "modular" quando composta com uma
// capability de persistência (Postgres + Kysely, Postgres + Sequelize, e
// futuramente outras). Existe porque a auditoria mediu ~80% de duplicação
// literal entre modular-pg-kysely/index.js e modular-pg-sequelize/index.js:
// error handler, not-found handler, rotas, schemas e handler de users eram
// copiados byte a byte de um arquivo pro outro. Aqui isso existe uma vez só;
// cada capability de persistência entra apenas com o que de fato muda
// (client de banco, plugin fastify, repositório, migrations, seed).
import {
  tsconfigContent,
  gitignoreContent,
  serverContent,
  healthSchemaContent,
  usersRouteContent,
  usersHandlerContent
} from '../templates/modular/index.js';

export { tsconfigContent, gitignoreContent, serverContent, healthSchemaContent, usersRouteContent, usersHandlerContent };

// Schema com `email`, diferente do schema do modular "puro" (que guarda só
// name em memória) — mas idêntico entre todas as capabilities de Postgres,
// então vive aqui em vez de duplicado em cada uma.
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

/**
 * Monta o app.ts da variante persistida do modular. O que muda de uma
 * capability de persistência pra outra é só isto: os imports do plugin de
 * banco, se precisa de `loadEnv()` antes dos handlers, e a linha de
 * `await app.register(...)`. Error handler, not-found handler e as rotas
 * de health/users existem uma vez só, aqui.
 *
 * @param {{ imports?: string[], needsEnv?: boolean, registration: string }} fragment
 */
export function buildAppTsContent(fragment) {
  const imports = fragment.imports?.length ? fragment.imports.join('\n') + '\n' : '';
  const envDecl = fragment.needsEnv ? '\n  const env = loadEnv();\n' : '';

  return `import Fastify, { type FastifyInstance } from 'fastify';
${imports}import healthRoutes from './modules/health/health.route.js';
import usersRoutes from './modules/users/users.route.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
    genReqId: () => 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
  });
${envDecl}
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
  ${fragment.registration}

  // Routes
  await app.register(healthRoutes);
  await app.register(usersRoutes, { prefix: '/users' });

  return app;
}
`;
}
