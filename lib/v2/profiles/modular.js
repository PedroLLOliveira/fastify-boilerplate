import * as templates from '../templates/modular/index.js';

/** @type {import('../core/types.d.ts').ProfileDefinition} */
export const modularProfile = {
  id: 'modular',
  architecture: 'modular',
  persistence: 'none',
  status: 'supported',
  dependencies: {
    runtime: ['fastify', 'dotenv'],
    dev: ['typescript', 'tsx', '@types/node', 'rimraf']
  },
  files: [
    { path: 'tsconfig.json', content: templates.tsconfigContent },
    { path: '.env.example', content: templates.envContent },
    { path: '.gitignore', content: templates.gitignoreContent },
    { path: 'src/server.ts', content: templates.serverContent },
    { path: 'src/app.ts', content: templates.appContent },
    { path: 'src/config/env.ts', content: templates.configEnvContent },
    { path: 'src/modules/health/health.route.ts', content: templates.healthRouteContent },
    { path: 'src/modules/health/health.schema.ts', content: templates.healthSchemaContent },
    { path: 'src/modules/users/users.route.ts', content: templates.usersRouteContent },
    { path: 'src/modules/users/users.schema.ts', content: templates.usersSchemaContent },
    { path: 'src/modules/users/users.handler.ts', content: templates.usersHandlerContent },
    { path: 'src/modules/users/users.service.ts', content: templates.usersServiceContent },
    { path: 'tests/health.test.ts', content: templates.testHealthContent },
    { path: 'tests/users.test.ts', content: templates.testUsersContent }
  ],
  checks: ['typecheck', 'unit', 'generation-eval', 'health-smoke']
};
