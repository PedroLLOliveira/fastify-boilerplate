import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { catalog, resolveDependencies } from '../../lib/v2/core/catalog.js';
import { renderProfile } from '../../lib/v2/core/engine.js';
import { minimalProfile } from '../../lib/v2/profiles/minimal.js';

test('V2 Catalog - Should not contain "latest" in any dependency', () => {
  const allDeps = { ...catalog.dependencies, ...catalog.devDependencies };
  for (const [name, version] of Object.entries(allDeps)) {
    assert.notStrictEqual(version, 'latest', `Dependency ${name} uses 'latest'`);
    assert.ok(version.match(/^[\^~]?\d+\.\d+\.\d+$/) || version.match(/^>=?\s?\d+\.\d+\.\d+$/), `Dependency ${name} has invalid semver: ${version}`);
  }
});

test('V2 Catalog - resolveDependencies throws on invalid dep', () => {
  assert.throws(() => resolveDependencies(['non-existent'], 'dependencies'), /Dependência não encontrada/);
});

test('V2 Engine - Should render deterministic minimal profile', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fastify-v2-test-'));
  try {
    const result = await renderProfile(minimalProfile, [], tmpDir, 'test-app');
    
    // Check return object
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.pkg.name, 'test-app');
    assert.strictEqual(result.pkg.type, 'module');
    
    // Check package.json was written
    const pkgContent = await fs.readFile(path.join(tmpDir, 'package.json'), 'utf8');
    const pkgJson = JSON.parse(pkgContent);
    assert.strictEqual(pkgJson.dependencies.fastify, catalog.dependencies.fastify);
    assert.strictEqual(pkgJson.devDependencies.typescript, catalog.devDependencies.typescript);

    // Check files were created
    for (const file of minimalProfile.files) {
      const stats = await fs.stat(path.join(tmpDir, file.path));
      assert.ok(stats.isFile(), `File ${file.path} was not created`);
    }

  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
