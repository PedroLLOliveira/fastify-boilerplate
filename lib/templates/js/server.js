export function serverTemplateJS(_a) {
  return `import 'dotenv/config';
import Fastify from 'fastify';

import db from './plugins/db.js';
import { loadEnv } from './config/env.js';
import health from './routes/health.js';
import hello from './routes/hello.js';

// @gen:imports

const env = loadEnv();
const app = Fastify({ logger: true });

async function bootstrap() {
  try {
    // Sempre registra o plugin de DB:
    // - ORM/QB: conecta e decora fastify.db
    // - Sem DB: decora fastify.db = null
    await app.register(db);

    await app.register(health);
    await app.register(hello, { prefix: '/api' });

    // @gen:routes

    const port = Number(env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(\`HTTP on :\${port}\`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
`;
}
