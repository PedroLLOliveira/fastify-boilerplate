import * as templates from '../templates/modular-pg-kysely/index.js';

/** @type {import('../core/types.d.ts').ProfileDefinition} */
export const modularPgKyselyProfile = {
  id: 'modular-postgres-kysely',
  architecture: 'modular',
  persistence: 'postgres',
  status: 'supported',
  dependencies: {
    runtime: ['fastify', 'fastify-plugin', 'dotenv', 'pg', 'kysely'],
    dev: ['typescript', 'tsx', '@types/node', '@types/pg', 'rimraf']
  },
  files: [
    { path: 'tsconfig.json', content: templates.tsconfigContent },
    { path: '.env.example', content: templates.envFileContent },
    { path: '.gitignore', content: templates.gitignoreContent },
    { path: 'docker-compose.yml', content: templates.dockerComposeContent },
    { path: 'src/server.ts', content: templates.serverContent },
    { path: 'src/app.ts', content: templates.appTsContent },
    { path: 'src/config/env.ts', content: templates.configEnvContent },
    { path: 'src/plugins/db-pool.ts', content: templates.dbPoolContent },
    { path: 'src/db/database.ts', content: templates.databaseTsContent },
    { path: 'src/db/scripts/migrate.ts', content: templates.migrateScriptContent },
    { path: 'src/db/scripts/seed.ts', content: templates.seedScriptContent },
    { path: 'src/db/migrations/0001_create_users.ts', content: templates.migration0001Content },
    { path: 'src/modules/health/health.route.ts', content: templates.healthRouteContent },
    { path: 'src/modules/health/health.schema.ts', content: templates.healthSchemaContent },
    { path: 'src/modules/users/users.route.ts', content: templates.usersRouteContent },
    { path: 'src/modules/users/users.schema.ts', content: templates.usersSchemaContent },
    { path: 'src/modules/users/users.handler.ts', content: templates.usersHandlerContent },
    { path: 'src/modules/users/users.service.ts', content: templates.usersServiceContent },
    { path: 'src/modules/users/users.repository.ts', content: templates.usersRepositoryContent }
  ],
  checks: ['typecheck', 'unit', 'generation-eval', 'health-smoke'],
  defaultTraits: ['eslint-basic', 'node-native-test'],
  testFiles: {
    'node-native-test': [
      { path: 'tests/env.test.ts', content: templates.testEnvContent },
      { path: 'tests/users.test.ts', content: templates.testUsersContent }
    ],
    vitest: [
      { path: 'tests/env.test.ts', content: templates.testEnvContentVitest },
      { path: 'tests/users.test.ts', content: templates.testUsersContentVitest }
    ]
  },
  scripts: {
    predev: 'docker compose up -d --wait && npm run db:migrate && npm run db:seed',
    'dev:no-infra': 'tsx watch src/server.ts',
    'db:migrate': 'tsx src/db/scripts/migrate.ts',
    'db:seed': 'tsx src/db/scripts/seed.ts',
    'db:reset': 'docker compose down -v && docker compose up -d --wait && npm run db:migrate && npm run db:seed'
  }
};
