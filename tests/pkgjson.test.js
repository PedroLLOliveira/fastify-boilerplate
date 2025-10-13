import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { writePackageJson } from '../lib/scaffold/pkgjson.js';
import fs from 'fs';
import path from 'path';
import fsp from 'fs/promises';
import os from 'os';

test('writePackageJson - should create package.json for TypeScript project', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const answers = { 
      projectName: 'test-project', 
      language: 'ts',
      eslint: 'none',
      orm: 'none',
      queryBuilder: 'none'
    };
    
    const deps = ['fastify', 'dotenv'];
    const devDeps = ['rimraf', 'typescript', 'tsx', '@types/node'];
    
    const ctx = {
      root: tempDir,
      answers,
      deps,
      devDeps
    };
    
    await writePackageJson(ctx);
    
    const pkgPath = path.join(tempDir, 'package.json');
    assert.ok(fs.existsSync(pkgPath));
    
    const pkg = JSON.parse(await fsp.readFile(pkgPath, 'utf8'));
    
    assert.strictEqual(pkg.name, 'test-project');
    assert.strictEqual(pkg.version, '0.1.0');
    assert.strictEqual(pkg.type, 'module');
    assert.deepStrictEqual(Object.keys(pkg.scripts), ['dev', 'build', 'start', 'lint']);
    assert.strictEqual(pkg.scripts.dev, 'tsx watch src/server.ts');
    assert.strictEqual(pkg.scripts.build, 'rimraf dist && tsc -p tsconfig.json');
    assert.strictEqual(pkg.scripts.start, 'node dist/server.js');
    assert.strictEqual(pkg.scripts.lint, 'echo "no lint"');
    
    assert.ok(pkg.dependencies.fastify);
    assert.ok(pkg.dependencies.dotenv);
    assert.ok(pkg.devDependencies.rimraf);
    assert.ok(pkg.devDependencies.typescript);
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});

test('writePackageJson - should create package.json for JavaScript project', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const answers = { 
      projectName: 'test-project', 
      language: 'js',
      eslint: 'none',
      orm: 'none',
      queryBuilder: 'none'
    };
    
    const deps = ['fastify', 'dotenv'];
    const devDeps = ['rimraf', 'nodemon'];
    
    const ctx = {
      root: tempDir,
      answers,
      deps,
      devDeps
    };
    
    await writePackageJson(ctx);
    
    const pkgPath = path.join(tempDir, 'package.json');
    assert.ok(fs.existsSync(pkgPath));
    
    const pkg = JSON.parse(await fsp.readFile(pkgPath, 'utf8'));
    
    assert.strictEqual(pkg.name, 'test-project');
    assert.strictEqual(pkg.version, '0.1.0');
    assert.strictEqual(pkg.type, 'module');
    assert.deepStrictEqual(Object.keys(pkg.scripts), ['dev', 'start', 'lint']);
    assert.strictEqual(pkg.scripts.dev, 'nodemon --watch src --ext js,mjs --exec "node src/server.js"');
    assert.strictEqual(pkg.scripts.start, 'node src/server.js');
    assert.strictEqual(pkg.scripts.lint, 'echo "no lint"');
    
    assert.ok(pkg.dependencies.fastify);
    assert.ok(pkg.dependencies.dotenv);
    assert.ok(pkg.devDependencies.rimraf);
    assert.ok(pkg.devDependencies.nodemon);
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});

test('writePackageJson - should include Prisma scripts when ORM is Prisma', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const answers = { 
      projectName: 'test-project', 
      language: 'ts',
      eslint: 'none',
      orm: 'prisma',
      queryBuilder: 'none'
    };
    
    const deps = ['fastify', 'dotenv', '@prisma/client'];
    const devDeps = ['rimraf', 'typescript', 'tsx', '@types/node', 'prisma'];
    
    const ctx = {
      root: tempDir,
      answers,
      deps,
      devDeps
    };
    
    await writePackageJson(ctx);
    
    const pkgPath = path.join(tempDir, 'package.json');
    assert.ok(fs.existsSync(pkgPath));
    
    const pkg = JSON.parse(await fsp.readFile(pkgPath, 'utf8'));
    
    assert.ok(pkg.scripts['prisma:studio']);
    assert.ok(pkg.scripts['prisma:generate']);
    assert.ok(pkg.scripts['prisma:migrate']);
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});

test('writePackageJson - should include Knex scripts when query builder is Knex', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const answers = { 
      projectName: 'test-project', 
      language: 'ts',
      eslint: 'none',
      orm: 'none',
      queryBuilder: 'knex'
    };
    
    const deps = ['fastify', 'dotenv', 'knex'];
    const devDeps = ['rimraf', 'typescript', 'tsx', '@types/node'];
    
    const ctx = {
      root: tempDir,
      answers,
      deps,
      devDeps
    };
    
    await writePackageJson(ctx);
    
    const pkgPath = path.join(tempDir, 'package.json');
    assert.ok(fs.existsSync(pkgPath));
    
    const pkg = JSON.parse(await fsp.readFile(pkgPath, 'utf8'));
    
    assert.ok(pkg.scripts['knex:migrate']);
    assert.ok(pkg.scripts['knex:rollback']);
    assert.ok(pkg.scripts['knex:seed']);
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});

test('writePackageJson - should include ESLint script when ESLint is enabled', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const answers = { 
      projectName: 'test-project', 
      language: 'ts',
      eslint: 'prettier',
      orm: 'none',
      queryBuilder: 'none'
    };
    
    const deps = ['fastify', 'dotenv'];
    const devDeps = ['rimraf', 'typescript', 'tsx', '@types/node', 'eslint', 'prettier', 'eslint-config-prettier', '@typescript-eslint/parser', '@typescript-eslint/eslint-plugin'];
    
    const ctx = {
      root: tempDir,
      answers,
      deps,
      devDeps
    };
    
    await writePackageJson(ctx);
    
    const pkgPath = path.join(tempDir, 'package.json');
    assert.ok(fs.existsSync(pkgPath));
    
    const pkg = JSON.parse(await fsp.readFile(pkgPath, 'utf8'));
    
    assert.strictEqual(pkg.scripts.lint, 'eslint .');
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});