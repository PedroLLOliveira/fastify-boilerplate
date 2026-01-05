import path from 'path';
import fsp from 'fs/promises';

import { envLoaderTemplate } from '../templates/common/envLoader.js';
import { dbPluginTemplate } from '../templates/common/dbPlugin.js';
import { healthRouteTemplate } from '../templates/common/healthRoute.js';
import { helloRouteTemplate } from '../templates/common/helloRoute.js';
import { prismaSchemaTemplate } from '../templates/common/prismaSchema.js';
import { eslintConfigTemplate } from '../templates/common/eslintConfig.js';
import { tsconfigTemplate } from '../templates/common/tsconfig.js';
import { devContainerTemplate, devContainerDockerfile } from '../templates/common/devcontainer.js';
import { knexFileTemplate } from '../templates/common/knexfile.js';
import fastifyDbTypesTemplate from '../templates/common/fastifyDbTypes.js';

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function write(filePath, content) {
  await fsp.writeFile(filePath, content, 'utf8');
}

function buildServerFile({ isTS, ext }) {
  // JS = ESM com extensão explícita
  const withExt = (p) => (isTS ? p : `${p}.${ext}`);

  if (isTS) {
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
  // - Sem DB: decora fastify.db = null (evita quebra dos exemplos)
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

  // JS (ESM) — mantém estilo async/await sem depender de replace frágil no injector
  return `import 'dotenv/config';
import Fastify from 'fastify';
import db from '${withExt('./plugins/db')}';
import { loadEnv } from '${withExt('./config/env')}';
import health from '${withExt('./routes/health')}';
import hello from '${withExt('./routes/hello')}';

// @gen:imports

const env = loadEnv();
const app = Fastify({ logger: true });

async function bootstrap() {
  try {
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

function buildEnvExample({ answers }) {
  const samples = {
    postgres: 'postgresql://user:password@localhost:5432/mydb?schema=public',
    mysql: 'mysql://user:password@localhost:3306/mydb',
    mongodb: 'mongodb://localhost:27017/mydb',
    sqlite: 'file:./dev.db',
  };

  const hasDbLayer = (answers.queryBuilder && answers.queryBuilder !== 'none')
    || (answers.orm && answers.orm !== 'none');

  // Se não houver DB layer, deixamos vazio (mas mantemos a variável por padrão)
  const sampleUrl = hasDbLayer ? (samples[answers.database] ?? '') : '';

  return `NODE_ENV=development
PORT=3000
DATABASE_URL="${sampleUrl}"
`;
}

export async function writeBaseFiles({ root, answers, isTS, ext }) {
  const srcDir = path.join(root, 'src');
  const pluginDir = path.join(srcDir, 'plugins');
  const routesDir = path.join(srcDir, 'routes');
  const configDir = path.join(srcDir, 'config');
  const typesDir = path.join(srcDir, 'types');

  // Garante dirs (mesmo que makeFolders já tenha criado)
  await ensureDir(srcDir);
  await ensureDir(pluginDir);
  await ensureDir(routesDir);
  await ensureDir(configDir);

  // server.{ts|js} (base consistente + marcadores p/ injeção)
  const serverCode = buildServerFile({ isTS, ext });
  await write(path.join(srcDir, `server.${ext}`), serverCode);

  // rotas base
  await write(path.join(routesDir, `hello.${ext}`), helloRouteTemplate(isTS));
  await write(path.join(routesDir, `health.${ext}`), healthRouteTemplate(isTS));

  // plugin db + env loader
  await write(path.join(pluginDir, `db.${ext}`), dbPluginTemplate(isTS, answers));
  await write(path.join(configDir, `env.${ext}`), envLoaderTemplate(isTS));

  // .env.example
  await write(path.join(root, '.env.example'), buildEnvExample({ answers }));

  // TS: tsconfig + augment
  if (isTS) {
    await write(path.join(root, 'tsconfig.json'), tsconfigTemplate());
    await ensureDir(typesDir);
    await write(
      path.join(typesDir, 'fastify.d.ts'),
      fastifyDbTypesTemplate({ orm: answers.orm, qb: answers.queryBuilder })
    );
  }

  // Prisma schema (TS e JS)
  if (answers.orm === 'prisma') {
    const prismaDir = path.join(root, 'prisma');
    await ensureDir(prismaDir);
    await write(path.join(prismaDir, 'schema.prisma'), prismaSchemaTemplate(answers.database));
  }

  // Devcontainer
  if (answers.devcontainer) {
    const dcDir = path.join(root, '.devcontainer');
    await ensureDir(dcDir);
    await write(path.join(dcDir, 'devcontainer.json'), devContainerTemplate());
    await write(path.join(dcDir, 'Dockerfile'), devContainerDockerfile());
  }

  // ESLint / Prettier
  if (answers.eslint !== 'none') {
    await write(path.join(root, '.eslintrc.cjs'), eslintConfigTemplate(answers.eslint, isTS));
    if (answers.eslint === 'prettier') {
      await write(path.join(root, '.prettierrc'), JSON.stringify({ semi: true, singleQuote: true }, null, 2));
    }
  }

  // Knex (migrations scaffolding)
  if (answers.queryBuilder === 'knex') {
    await write(path.join(root, 'knexfile.cjs'), knexFileTemplate(answers));

    const dbDir = path.join(root, 'db');
    await ensureDir(path.join(dbDir, 'migrations'));
    await ensureDir(path.join(dbDir, 'seeds'));
  }

  // (Opcional, mas útil) .gitignore mínimo
  const gitignorePath = path.join(root, '.gitignore');
  try {
    await fsp.access(gitignorePath);
  } catch {
    await write(
      gitignorePath,
      `node_modules
dist
.env
.dev.db
.DS_Store
`
    );
  }
}