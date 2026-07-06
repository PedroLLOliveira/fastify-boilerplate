import * as templates from '../templates/clean/index.js';

/** @type {import('../core/types.d.ts').ProfileDefinition} */
export const cleanProfile = {
  id: 'clean',
  architecture: 'clean',
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
    { path: 'src/infrastructure/web/fastify/app.ts', content: templates.appContent },
    { path: 'src/config/env.ts', content: templates.configEnvContent },
    { path: 'src/infrastructure/web/routes/health.route.ts', content: templates.healthRouteContent },
    { path: 'src/infrastructure/web/controllers/health.controller.ts', content: templates.healthControllerContent },
    { path: 'src/core/useCases/checkHealth.usecase.ts', content: templates.checkHealthUseCaseContent },
    { path: 'tests/health.test.ts', content: templates.testHealthContent }
  ],
  checks: ['typecheck', 'unit', 'generation-eval', 'health-smoke']
};
