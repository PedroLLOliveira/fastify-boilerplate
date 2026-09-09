import * as templates from '../templates/mvc/index.js';

/** @type {import('../core/types.d.ts').ProfileDefinition} */
export const mvcProfile = {
  id: 'mvc',
  architecture: 'mvc',
  persistence: 'none',
  status: 'experimental',
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
    { path: 'src/routes/health.route.ts', content: templates.healthRouteContent },
    { path: 'src/schemas/health.schema.ts', content: templates.healthSchemaContent },
    { path: 'src/controllers/health.controller.ts', content: templates.healthControllerContent },
    { path: 'src/services/health.service.ts', content: templates.healthServiceContent },
    { path: 'tests/health.test.ts', content: templates.testHealthContent }
  ],
  checks: ['typecheck', 'unit', 'generation-eval', 'health-smoke'],
  defaultTraits: ['eslint-basic', 'node-native-test']
};
