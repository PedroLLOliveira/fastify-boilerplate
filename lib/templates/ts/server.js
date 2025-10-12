export function serverTemplateTS(a) {
  const useKnex = a.queryBuilder === 'knex';
  const useOrm  = a.orm && a.orm !== 'none';

  const dbImport = useKnex
    ? "import dbKnex from './plugins/db-knex';"
    : useOrm
      ? "import db from './plugins/db';"
      : "// (sem banco)";

  const dbRegister = useKnex
    ? "app.register(dbKnex);"
    : useOrm
      ? "app.register(db);"
      : "// (sem registro de DB)";

  return `import 'dotenv/config';
import Fastify, { type FastifyInstance } from 'fastify';
${dbImport}
import { loadEnv } from './config/env';
import hello from './routes/hello';
import health from './routes/health';

const env = loadEnv();
const app: FastifyInstance = Fastify({ logger: true });

// Importante: para TS, garanta que o augment \`fastify.d.ts\` corresponda ao que foi gerado:
// - Knex: FastifyInstance.db: Knex
// - Prisma/Sequelize/Mongoose: tipo correspondente
// - Sem DB: não declare a prop \`db\`, ou use \`any\` se preferir.
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
