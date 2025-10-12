export function serverTemplateJS(a) {
  const useKnex = a.queryBuilder === 'knex';
  const useOrm  = a.orm && a.orm !== 'none';

  const dbImport = useKnex
    ? "import dbKnex from './plugins/db-knex.js';"
    : useOrm
      ? "import db from './plugins/db.js';"
      : "// (sem banco)";

  const dbRegister = useKnex
    ? "app.register(dbKnex);"
    : useOrm
      ? "app.register(db);"
      : "// (sem registro de DB)";

  return `import 'dotenv/config';
import Fastify from 'fastify';
${dbImport}
import { loadEnv } from './config/env.js';
import hello from './routes/hello.js';
import health from './routes/health.js';

const env = loadEnv();
const app = Fastify({ logger: true });

${dbRegister}
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
