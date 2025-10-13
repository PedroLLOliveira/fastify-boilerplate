import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { writeBaseFiles } from '../lib/scaffold/writeBaseFiles.js';
import { makeFolders } from '../lib/scaffold/makeFolders.js';
import fs from 'fs';
import path from 'path';
import fsp from 'fs/promises';
import os from 'os';

test('writeBaseFiles - should create devcontainer files when devcontainer is enabled', async () => {
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
      devcontainer: true  // Enable devcontainer
    };
    
    const ctx = {
      root: tempDir,
      answers,
      isTS: true,
      ext: 'ts'
    };
    
    await makeFolders(ctx);
    
    await writeBaseFiles(ctx);
    
    // Check that devcontainer files were created
    const dcDir = path.join(tempDir, '.devcontainer');
    assert.ok(fs.existsSync(dcDir));
    assert.ok(fs.existsSync(path.join(dcDir, 'devcontainer.json')));
    assert.ok(fs.existsSync(path.join(dcDir, 'Dockerfile')));
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});

test('writeBaseFiles - should handle all database types in .env.example', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-test-'));
  
  try {
    const testCases = [
      { database: 'postgres', expectedUrl: 'postgresql://' },
      { database: 'mysql', expectedUrl: 'mysql://' },
      { database: 'mongodb', expectedUrl: 'mongodb://' },
      { database: 'sqlite', expectedUrl: 'file:./dev.db' }
    ];
    
    for (const testCase of testCases) {
      const tempSubDir = await fsp.mkdtemp(path.join(tempDir, 'sub-'));
      const answers = { 
        projectName: 'test-project', 
        language: 'ts',
        architecture: 'mvc',
        eslint: 'none',
        orm: 'none',
        queryBuilder: 'none',
        database: testCase.database,
        devcontainer: false
      };
      
      const ctx = {
        root: tempSubDir,
        answers,
        isTS: true,
        ext: 'ts'
      };
      
      await makeFolders(ctx);
      await writeBaseFiles(ctx);
      
      // Check that .env.example contains the correct database URL
      const envPath = path.join(tempSubDir, '.env.example');
      const envContent = await fsp.readFile(envPath, 'utf8');
      assert.ok(envContent.includes(testCase.expectedUrl));
      
      await fsp.rm(tempSubDir, { recursive: true, force: true });
    }
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});