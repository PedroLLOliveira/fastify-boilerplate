import * as templates from '../templates/minimal/index.js';

/** @type {import('../core/types.d.ts').ProfileDefinition} */
export const minimalProfile = {
  id: 'minimal',
  architecture: 'minimal',
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
    { path: 'src/routes/health.ts', content: templates.healthRouteContent },
    { path: 'src/routes/hello.ts', content: templates.helloRouteContent }
  ],
  checks: ['typecheck', 'unit', 'generation-eval', 'health-smoke'],
  defaultTraits: ['eslint-basic', 'node-native-test'],
  testFiles: {
    'node-native-test': [{ path: 'tests/health.test.ts', content: templates.testHealthContent }],
    vitest: [{ path: 'tests/health.test.ts', content: templates.testHealthContentVitest }]
  }
};
