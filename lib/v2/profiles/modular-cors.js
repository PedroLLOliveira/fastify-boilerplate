// Perfil de prova da Fase 5: arquitetura `modular` (a mesma do perfil
// `modular`, in-memory, sem banco) + a capability de plataforma `cors`.
// Montado à mão (não via `composeProfile`) porque `compose.js` foi desenhado
// para a família "modular + persistência", onde a capability é dona de todo
// o `testFiles` (o banco substitui as rotas/handlers inteiros). Aqui a
// capability só acrescenta um teste aos que o `modular` já tem — mesclar as
// duas listas manualmente é mais simples e mais honesto do que generalizar
// `compose.js` para um caso que ainda não tem um segundo exemplo real.
import * as templates from '../templates/modular/index.js';
import { corsCapability } from '../capabilities/cors.js';

const testCorsContent = `import test from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app.js';

test('CORS habilitado responde ao preflight e expõe o header em respostas normais', async () => {
  const app = await buildApp();

  const preflight = await app.inject({
    method: 'OPTIONS',
    url: '/health',
    headers: {
      origin: 'https://example.com',
      'access-control-request-method': 'GET'
    }
  });
  assert.strictEqual(preflight.statusCode, 204);
  assert.strictEqual(preflight.headers['access-control-allow-origin'], '*');

  const res = await app.inject({ method: 'GET', url: '/health', headers: { origin: 'https://example.com' } });
  assert.strictEqual(res.headers['access-control-allow-origin'], '*');

  await app.close();
});
`;

const testCorsContentVitest = `import { test, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';

let app;
beforeAll(async () => { app = await buildApp(); });
afterAll(() => app.close());

test('CORS habilitado responde ao preflight e expõe o header em respostas normais', async () => {
  const preflight = await app.inject({
    method: 'OPTIONS',
    url: '/health',
    headers: {
      origin: 'https://example.com',
      'access-control-request-method': 'GET'
    }
  });
  expect(preflight.statusCode).toBe(204);
  expect(preflight.headers['access-control-allow-origin']).toBe('*');

  const res = await app.inject({ method: 'GET', url: '/health', headers: { origin: 'https://example.com' } });
  expect(res.headers['access-control-allow-origin']).toBe('*');
});
`;

/** @type {import('../core/types.d.ts').ProfileDefinition} */
export const modularCorsProfile = {
  id: 'modular-cors',
  architecture: 'modular',
  persistence: 'none',
  status: 'supported',
  dependencies: {
    runtime: ['fastify', 'dotenv', ...corsCapability.dependencies.runtime],
    dev: ['typescript', 'tsx', '@types/node', 'rimraf']
  },
  files: [
    { path: 'tsconfig.json', content: templates.tsconfigContent },
    { path: '.env.example', content: templates.envContent },
    { path: '.gitignore', content: templates.gitignoreContent },
    { path: 'src/server.ts', content: templates.serverContent },
    { path: 'src/app.ts', content: templates.buildAppTsContent(corsCapability.appFragment) },
    { path: 'src/config/env.ts', content: templates.configEnvContent },
    { path: 'src/modules/health/health.route.ts', content: templates.healthRouteContent },
    { path: 'src/modules/health/health.schema.ts', content: templates.healthSchemaContent },
    { path: 'src/modules/users/users.route.ts', content: templates.usersRouteContent },
    { path: 'src/modules/users/users.schema.ts', content: templates.usersSchemaContent },
    { path: 'src/modules/users/users.handler.ts', content: templates.usersHandlerContent },
    { path: 'src/modules/users/users.service.ts', content: templates.usersServiceContent }
  ],
  checks: ['typecheck', 'unit', 'generation-eval', 'health-smoke'],
  defaultTraits: ['eslint-basic', 'node-native-test'],
  testFiles: {
    'node-native-test': [
      { path: 'tests/health.test.ts', content: templates.testHealthContent },
      { path: 'tests/users.test.ts', content: templates.testUsersContent },
      { path: 'tests/cors.test.ts', content: testCorsContent }
    ],
    vitest: [
      { path: 'tests/health.test.ts', content: templates.testHealthContentVitest },
      { path: 'tests/users.test.ts', content: templates.testUsersContentVitest },
      { path: 'tests/cors.test.ts', content: testCorsContentVitest }
    ]
  }
};
