export function serverTemplateTS(_a) {
  return `import 'dotenv/config';
import Fastify, { type FastifyInstance } from 'fastify';

import db from './plugins/db';
import { loadEnv } from './config/env';
import health from './routes/health';
import hello from './routes/hello';

// @gen:imports

const env = loadEnv();
const app: FastifyInstance = Fastify({ logger: true });

async function bootstrap(): Promise<void> {
  // Sempre registra o plugin de DB:
  // - ORM/QB: conecta e decora fastify.db
  // - Sem DB: decora fastify.db = null
  await app.register(db);

  await app.register(health);
  await app.register(hello, { prefix: '/api' });

  // @gen:routes

  const fallbackPort = 3000;
  const parsedPort = Number(env.PORT);
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : fallbackPort;

  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(\`HTTP on :\${port}\`);
}

bootstrap().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
`;
}
