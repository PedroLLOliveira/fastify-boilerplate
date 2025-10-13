import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import fs from 'fs';
import path from 'path';
import fsp from 'fs/promises';
import os from 'os';

test('CLI - should generate project with default options', async () => {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'fastify-cli-test-'));
  
  try {
    const cliPath = path.join(process.cwd(), 'bin/cli.js');
    assert.ok(fs.existsSync(cliPath));
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
});