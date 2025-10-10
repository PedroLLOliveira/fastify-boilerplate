import path from 'path';
import fsp from 'fs/promises';
import { serverTemplateJS } from '../templates/js/server.js';
import { serverTemplateTS } from '../templates/ts/server.js';
import { envLoaderTemplate } from '../templates/common/envLoader.js';
import { dbPluginTemplate } from '../templates/common/dbPlugin.js';
import { healthRouteTemplate } from '../templates/common/healthRoute.js';
import { helloRouteTemplate } from '../templates/common/helloRoute.js';
import { prismaSchemaTemplate } from '../templates/common/prismaSchema.js';
import { eslintConfigTemplate } from '../templates/common/eslintConfig.js';
import { tsconfigTemplate } from '../templates/common/tsconfig.js';
import { devContainerTemplate, devContainerDockerfile } from '../templates/common/devcontainer.js';
import { knexPluginTemplate } from '../templates/common/knexPlugin.js';
import { knexFileTemplate } from '../templates/common/knexfile.js';
import fastifyDbTypesTemplate from '../templates/common/fastifyDbTypes.js';

export async function writeBaseFiles({ root, answers, isTS, ext }) {
  const srcDir = path.join(root, 'src');
  const pluginDir = path.join(srcDir, 'plugins');
  const routesDir = path.join(srcDir, 'routes');
  const configDir = path.join(srcDir, 'config');
  const typesDir = path.join(srcDir, 'types');

  const server = isTS ? serverTemplateTS(answers) : serverTemplateJS(answers);
  await fsp.writeFile(path.join(srcDir, `server.${ext}`), server, 'utf8');

  await fsp.writeFile(path.join(routesDir, `hello.${ext}`), helloRouteTemplate(isTS), 'utf8');
  await fsp.writeFile(path.join(routesDir, `health.${ext}`), healthRouteTemplate(isTS), 'utf8');
  await fsp.writeFile(path.join(pluginDir, `db.${ext}`), dbPluginTemplate(isTS, answers), 'utf8');
  await fsp.writeFile(path.join(configDir, `env.${ext}`), envLoaderTemplate(isTS), 'utf8');

  // .env.example
  const samples = {
    postgres: 'postgresql://user:password@localhost:5432/mydb?schema=public',
    mysql: 'mysql://user:password@localhost:3306/mydb',
    mongodb: 'mongodb://localhost:27017/mydb',
    sqlite: 'file:./dev.db'
  };
  const env = `NODE_ENV=development
PORT=3000
DATABASE_URL="${samples[answers.database]}"
`;
  await fsp.writeFile(path.join(root, `.env.example`), env, 'utf8');

  if (isTS) {
    await fsp.writeFile(path.join(root, 'tsconfig.json'), tsconfigTemplate(), 'utf8');
    await fsp.mkdir(typesDir, { recursive: true });
    await fsp.writeFile(
      path.join(typesDir, 'fastify.d.ts'),
      fastifyDbTypesTemplate({ orm: answers.orm }),
      'utf8'
    )
    if (answers.eslint !== 'none') {
      await fsp.writeFile(path.join(root, '.eslintrc.cjs'), eslintConfigTemplate(answers.eslint, isTS), 'utf8');
      if (answers.eslint === 'prettier') {
        await fsp.writeFile(path.join(root, '.prettierrc'), JSON.stringify({ semi: true, singleQuote: true }, null, 2));
      }
    }
    if (answers.devcontainer) {
      const dcDir = path.join(root, '.devcontainer');
      await fsp.mkdir(dcDir, { recursive: true });
      await fsp.writeFile(path.join(dcDir, 'devcontainer.json'), devContainerTemplate(), 'utf8');
      await fsp.writeFile(path.join(dcDir, 'Dockerfile'), devContainerDockerfile(), 'utf8');
    }
    if (answers.orm === 'prisma') {
      const prismaDir = path.join(root, 'prisma');
      await fsp.mkdir(prismaDir, { recursive: true });
      await fsp.writeFile(path.join(prismaDir, 'schema.prisma'), prismaSchemaTemplate(answers.database), 'utf8');
    }
  }

  if (answers.queryBuilder === 'knex') {
    const pluginDir = path.join(root, 'src', 'plugins');
    await fsp.writeFile(
      path.join(pluginDir, `db-knex.${ext}`),
      knexPluginTemplate(isTS, answers),
      'utf8'
    );

    await fsp.writeFile(path.join(root, 'knexfile.cjs'), knexFileTemplate(answers), 'utf8');

    const dbDir = path.join(root, 'db');
    await fsp.mkdir(path.join(dbDir, 'migrations'), { recursive: true });
    await fsp.mkdir(path.join(dbDir, 'seeds'), { recursive: true });

    if (isTS) {
      const typesDir = path.join(root, 'src', 'types');
      await fsp.mkdir(typesDir, { recursive: true });
      await fsp.writeFile(
        path.join(typesDir, 'fastify.d.ts'),
        fastifyDbTypesTemplate({ orm: 'none', qb: 'knex' }),
        'utf8'
      );
    }
  }
}
