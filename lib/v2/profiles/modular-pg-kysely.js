import { composeProfile } from '../core/compose.js';
import * as arch from '../architectures/modular-persisted.js';
import { postgresKyselyCapability } from '../capabilities/postgres-kysely.js';

const baseFiles = [
  { path: 'tsconfig.json', content: arch.tsconfigContent },
  { path: '.gitignore', content: arch.gitignoreContent },
  { path: 'src/server.ts', content: arch.serverContent },
  { path: 'src/app.ts', content: arch.buildAppTsContent(postgresKyselyCapability.appFragment) },
  { path: 'src/modules/health/health.schema.ts', content: arch.healthSchemaContent },
  { path: 'src/modules/users/users.route.ts', content: arch.usersRouteContent },
  { path: 'src/modules/users/users.schema.ts', content: arch.usersSchemaContent },
  { path: 'src/modules/users/users.handler.ts', content: arch.usersHandlerContent }
];

/** @type {import('../core/types.d.ts').ProfileDefinition} */
export const modularPgKyselyProfile = composeProfile({
  id: 'modular-postgres-kysely',
  architecture: 'modular',
  persistence: 'postgres',
  status: 'supported',
  checks: ['typecheck', 'unit', 'generation-eval', 'health-smoke'],
  defaultTraits: ['eslint-basic', 'node-native-test'],
  baseDependencies: {
    runtime: ['fastify', 'dotenv'],
    dev: ['typescript', 'tsx', '@types/node', 'rimraf']
  },
  baseFiles,
  capability: postgresKyselyCapability
});
