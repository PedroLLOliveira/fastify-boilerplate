import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { writeBaseFiles } from '../lib/scaffold/writeBaseFiles.js';
import { makeFolders } from '../lib/scaffold/makeFolders.js';
import fs from 'fs';
import path from 'path';
import fsp from 'fs/promises';
import os from 'os';

test('writeBaseFiles - should create base files for TypeScript project', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const answers = { 
      projectName: 'test-project', 
      language: 'ts',
      architecture: 'mvc',
      eslint: 'none',
      orm: 'none',
      queryBuilder: 'none',
      database: 'postgres',
      devcontainer: false
    };
    
    const ctx = {
      root: tempDir,
      answers,
      isTS: true,
      ext: 'ts'
    };
    
    await makeFolders(ctx);
    
    await writeBaseFiles(ctx);
    
    const serverPath = path.join(tempDir, 'src', 'server.ts');
    const routesDir = path.join(tempDir, 'src', 'routes');
    const pluginsDir = path.join(tempDir, 'src', 'plugins');
    const configDir = path.join(tempDir, 'src', 'config');
    
    assert.ok(fs.existsSync(serverPath));
    assert.ok(fs.existsSync(path.join(routesDir, 'hello.ts')));
    assert.ok(fs.existsSync(path.join(routesDir, 'health.ts')));
    assert.ok(fs.existsSync(path.join(pluginsDir, 'db.ts')));
    assert.ok(fs.existsSync(path.join(configDir, 'env.ts')));
    assert.ok(fs.existsSync(path.join(tempDir, '.env.example')));
    assert.ok(fs.existsSync(path.join(tempDir, 'tsconfig.json')));
    
    const typesDir = path.join(tempDir, 'src', 'types');
    assert.ok(fs.existsSync(path.join(typesDir, 'fastify.d.ts')));
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});

test('writeBaseFiles - should create base files for JavaScript project', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const answers = { 
      projectName: 'test-project', 
      language: 'js',
      architecture: 'mvc',
      eslint: 'none',
      orm: 'none',
      queryBuilder: 'none',
      database: 'postgres',
      devcontainer: false
    };
    
    const ctx = {
      root: tempDir,
      answers,
      isTS: false,
      ext: 'js'
    };
    
    await makeFolders(ctx);
    
    await writeBaseFiles(ctx);
    
    const serverPath = path.join(tempDir, 'src', 'server.js');
    const routesDir = path.join(tempDir, 'src', 'routes');
    const pluginsDir = path.join(tempDir, 'src', 'plugins');
    const configDir = path.join(tempDir, 'src', 'config');
    
    assert.ok(fs.existsSync(serverPath));
    assert.ok(fs.existsSync(path.join(routesDir, 'hello.js')));
    assert.ok(fs.existsSync(path.join(routesDir, 'health.js')));
    assert.ok(fs.existsSync(path.join(pluginsDir, 'db.js')));
    assert.ok(fs.existsSync(path.join(configDir, 'env.js')));
    assert.ok(fs.existsSync(path.join(tempDir, '.env.example')));
    
    assert.ok(!fs.existsSync(path.join(tempDir, 'tsconfig.json')));
    const typesDir = path.join(tempDir, 'src', 'types');
    assert.ok(!fs.existsSync(typesDir));
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});

test('writeBaseFiles - should create Prisma files when ORM is Prisma', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const answers = { 
      projectName: 'test-project', 
      language: 'ts',
      architecture: 'mvc',
      eslint: 'none',
      orm: 'prisma',
      queryBuilder: 'none',
      database: 'postgres',
      devcontainer: false
    };
    
    const ctx = {
      root: tempDir,
      answers,
      isTS: true,
      ext: 'ts'
    };
    
    await makeFolders(ctx);
    
    await writeBaseFiles(ctx);
    
    const prismaDir = path.join(tempDir, 'prisma');
    assert.ok(fs.existsSync(prismaDir));
    assert.ok(fs.existsSync(path.join(prismaDir, 'schema.prisma')));
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});

test('writeBaseFiles - should create Knex files when query builder is Knex', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const answers = { 
      projectName: 'test-project', 
      language: 'ts',
      architecture: 'mvc',
      eslint: 'none',
      orm: 'none',
      queryBuilder: 'knex',
      database: 'postgres',
      devcontainer: false
    };
    
    const ctx = {
      root: tempDir,
      answers,
      isTS: true,
      ext: 'ts'
    };
    
    await makeFolders(ctx);
    
    await writeBaseFiles(ctx);
    
    const knexfilePath = path.join(tempDir, 'knexfile.cjs');
    const dbDir = path.join(tempDir, 'db');
    const migrationsDir = path.join(dbDir, 'migrations');
    const seedsDir = path.join(dbDir, 'seeds');
    
    assert.ok(fs.existsSync(knexfilePath));
    assert.ok(fs.existsSync(dbDir));
    assert.ok(fs.existsSync(migrationsDir));
    assert.ok(fs.existsSync(seedsDir));
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});

test('writeBaseFiles - should create ESLint config when ESLint is enabled', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const answers = { 
      projectName: 'test-project', 
      language: 'ts',
      architecture: 'mvc',
      eslint: 'prettier',
      orm: 'none',
      queryBuilder: 'none',
      database: 'postgres',
      devcontainer: false
    };
    
    const ctx = {
      root: tempDir,
      answers,
      isTS: true,
      ext: 'ts'
    };
    
    await makeFolders(ctx);
    
    await writeBaseFiles(ctx);
    
    const eslintConfigPath = path.join(tempDir, '.eslintrc.cjs');
    const prettierConfigPath = path.join(tempDir, '.prettierrc');
    
    assert.ok(fs.existsSync(eslintConfigPath));
    assert.ok(fs.existsSync(prettierConfigPath));
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});