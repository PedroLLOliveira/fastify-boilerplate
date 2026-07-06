import * as templates from '../templates/modular-pg-sequelize/index.js';

/** @type {import('../core/types.d.ts').ProfileDefinition} */
export const modularPgSequelizeProfile = {
  id: 'modular-postgres-sequelize',
  architecture: 'modular',
  persistence: 'postgres',
  status: 'supported',
  dependencies: {
    runtime: ['fastify', 'fastify-plugin', 'dotenv', 'pg', 'pg-hstore', 'sequelize'],
    dev: ['typescript', 'tsx', '@types/node', '@types/pg', 'rimraf', 'sequelize-cli']
  },
  files: [
    { path: 'tsconfig.json', content: templates.tsconfigContent },
    { path: '.env.example', content: templates.envFileContent },
    { path: '.gitignore', content: templates.gitignoreContent },
    { path: 'docker-compose.yml', content: templates.dockerComposeContent },
    { path: '.sequelizerc', content: templates.sequelizercContent },
    { path: 'src/server.ts', content: templates.serverContent },
    { path: 'src/app.ts', content: templates.appTsContent },
    { path: 'src/config/env.ts', content: templates.configEnvContent },
    { path: 'src/plugins/db-sequelize.ts', content: templates.dbPluginContent },
    { path: 'src/db/database.ts', content: templates.databaseTsContent },
    { path: 'src/db/config.cjs', content: templates.sequelizeConfigCjsContent },
    { path: 'src/db/models/user.ts', content: templates.userModelContent },
    { path: 'src/db/migrations/20240101000000-create-users.cjs', content: templates.migration0001Content },
    { path: 'src/modules/health/health.route.ts', content: templates.healthRouteContent },
    { path: 'src/modules/health/health.schema.ts', content: templates.healthSchemaContent },
    { path: 'src/modules/users/users.route.ts', content: templates.usersRouteContent },
    { path: 'src/modules/users/users.schema.ts', content: templates.usersSchemaContent },
    { path: 'src/modules/users/users.handler.ts', content: templates.usersHandlerContent },
    { path: 'src/modules/users/users.service.ts', content: templates.usersServiceContent },
    { path: 'src/modules/users/users.repository.ts', content: templates.usersRepositoryContent },
    { path: 'tests/env.test.ts', content: templates.testEnvContent },
    { path: 'tests/users.test.ts', content: templates.testUsersContent }
  ],
  checks: ['typecheck', 'unit', 'generation-eval', 'health-smoke'],
  defaultTraits: ['eslint-basic', 'node-native-test']
};
