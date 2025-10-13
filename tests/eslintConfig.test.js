import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { eslintConfigTemplate } from '../lib/templates/common/eslintConfig.js';

test('eslintConfigTemplate - should generate ESLint config for basic setup', () => {
  const result = eslintConfigTemplate('basic', true);
  
  assert.ok(result.includes('standard-with-typescript'));
});

test('eslintConfigTemplate - should generate ESLint config for prettier setup', () => {
  const result = eslintConfigTemplate('prettier', true);
  
  assert.ok(result.includes('standard-with-typescript'));
  assert.ok(result.includes('prettier'));
});

test('eslintConfigTemplate - should generate ESLint config for JavaScript project', () => {
  const result = eslintConfigTemplate('basic', false);
  
  assert.ok(result.includes('standard'));
});