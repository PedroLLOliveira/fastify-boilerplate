import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { devContainerTemplate, devContainerDockerfile } from '../lib/templates/common/devcontainer.js';

test('devContainerTemplate - should generate dev container configuration', () => {
  const result = devContainerTemplate();
  
  assert.ok(result.includes('"name"'));
  assert.ok(result.includes('dockerfile'));
  assert.ok(result.includes('forwardPorts'));
  assert.ok(result.includes('3000'));
});

test('devContainerDockerfile - should generate dev container Dockerfile', () => {
  const result = devContainerDockerfile();
  
  assert.ok(result.includes('FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye'));
  assert.ok(result.includes('WORKDIR /workspaces/app'));
});