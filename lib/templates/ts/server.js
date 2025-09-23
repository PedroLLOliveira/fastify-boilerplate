export function serverTemplateTS(a) {
  return `import 'dotenv/config';
import Fastify, { type FastifyInstance } from 'fastify';
import db from './plugins/db';
import { loadEnv } from './config/env';
import hello from './routes/hello';
import health from './routes/health';

const env = loadEnv();
const app: FastifyInstance = Fastify({ logger: true });

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
