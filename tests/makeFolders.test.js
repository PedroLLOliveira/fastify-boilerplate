import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { makeFolders } from '../lib/scaffold/makeFolders.js';
import fs from 'fs';
import path from 'path';
import fsp from 'fs/promises';
import os from 'os';
import { tmpdir } from 'os';

test('makeFolders - should create basic folders for any architecture', async () => {

  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const ctx = {
      root: tempDir,
      answers: { architecture: 'mvc' },
      ext: 'js'
    };
    
    await makeFolders(ctx);
    
    
    const srcDir = path.join(tempDir, 'src');
    const pluginDir = path.join(srcDir, 'plugins');
    const routesDir = path.join(srcDir, 'routes');
    const configDir = path.join(srcDir, 'config');
    
    assert.ok(fs.existsSync(srcDir));
    assert.ok(fs.existsSync(pluginDir));
    assert.ok(fs.existsSync(routesDir));
    assert.ok(fs.existsSync(configDir));
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});

test('makeFolders - should create MVC architecture folders', async () => {
  
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const ctx = {
      root: tempDir,
      answers: { architecture: 'mvc' },
      ext: 'js'
    };
    
    await makeFolders(ctx);
    

    const srcDir = path.join(tempDir, 'src');
    const controllersDir = path.join(srcDir, 'controllers');
    const servicesDir = path.join(srcDir, 'services');
    const modelsDir = path.join(srcDir, 'models');
    
    assert.ok(fs.existsSync(controllersDir));
    assert.ok(fs.existsSync(servicesDir));
    assert.ok(fs.existsSync(modelsDir));
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});

test('makeFolders - should create Clean Architecture folders', async () => {

  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const ctx = {
      root: tempDir,
      answers: { architecture: 'clean' },
      ext: 'js'
    };
    
    await makeFolders(ctx);
    
    
    const srcDir = path.join(tempDir, 'src');
    const domainEntitiesDir = path.join(srcDir, 'domain/entities');
    const domainRepositoriesDir = path.join(srcDir, 'domain/repositories');
    const applicationUseCasesDir = path.join(srcDir, 'application/use-cases');
    const infraDbDir = path.join(srcDir, 'infra/db');
    const infraHttpDir = path.join(srcDir, 'infra/http');
    const infraRepositoriesDir = path.join(srcDir, 'infra/repositories');
    const mainDir = path.join(srcDir, 'main');
    
    assert.ok(fs.existsSync(domainEntitiesDir));
    assert.ok(fs.existsSync(domainRepositoriesDir));
    assert.ok(fs.existsSync(applicationUseCasesDir));
    assert.ok(fs.existsSync(infraDbDir));
    assert.ok(fs.existsSync(infraHttpDir));
    assert.ok(fs.existsSync(infraRepositoriesDir));
    assert.ok(fs.existsSync(mainDir));
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});

test('makeFolders - should create Modular architecture folders', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const ctx = {
      root: tempDir,
      answers: { architecture: 'modular' },
      ext: 'js'
    };
    
    await makeFolders(ctx);
    
    const srcDir = path.join(tempDir, 'src');
    const modulesExampleDir = path.join(srcDir, 'modules/example');
    
    assert.ok(fs.existsSync(modulesExampleDir));
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});