export function serverTemplateJS(a) {
  return `import 'dotenv/config';
import Fastify from 'fastify';
import db from './plugins/db.js';
import { loadEnv } from './config/env.js';
import hello from './routes/hello.js';
import health from './routes/health.js';

const env = loadEnv();
const app = Fastify({ logger: true });

app.register(db);
app.register(health);
app.register(hello, { prefix: '/api' });

const start = async () => {
  try {
    await app.listen({ port: Number(env.PORT) || 3000, host: '0.0.0.0' });
    app.log.info(\`HTTP on :\${env.PORT || 3000}\`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
`;
}
