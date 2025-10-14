import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { helloRouteTemplate } from '../lib/templates/common/helloRoute.js';
import { healthRouteTemplate } from '../lib/templates/common/healthRoute.js';

test('helloRouteTemplate - should generate TypeScript template', () => {
  const result = helloRouteTemplate(true);
  
  assert.ok(result.includes('FastifyInstance'));
  assert.ok(result.includes('async function hello(fastify: FastifyInstance'));
});

test('helloRouteTemplate - should generate JavaScript template', () => {
  const result = helloRouteTemplate(false);
  
  assert.ok(!result.includes('FastifyInstance'));
  assert.ok(result.includes('async function hello(fastify, _opts)'));
});

test('healthRouteTemplate - should generate TypeScript template', () => {
  const result = healthRouteTemplate(true);
  
  assert.ok(result.includes('FastifyInstance'));
  assert.ok(result.includes('async function health(fastify: FastifyInstance'));
});

test('healthRouteTemplate - should generate JavaScript template', () => {
  const result = healthRouteTemplate(false);
  
  assert.ok(!result.includes('FastifyInstance'));
  assert.ok(result.includes('async function health(fastify, _opts)'));
});