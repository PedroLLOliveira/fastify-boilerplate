import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_PATH = path.resolve(__dirname, '../../bin/cli.js');

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd, shell: true, stdio: 'pipe' });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command ${command} ${args.join(' ')} failed with code ${code}.\nStderr: ${stderr}\nStdout: ${stdout}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

function waitForPort(port, host = '127.0.0.1', timeout = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const socket = new net.Socket();
      socket.connect(port, host, () => {
        socket.destroy();
        clearInterval(interval);
        resolve();
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          clearInterval(interval);
          reject(new Error(`Timeout waiting for port ${port}`));
        }
      });
    }, 500);
  });
}

test('V2 E2E Eval - Profile Modular PG Kysely', async (t) => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fastify-v2-eval-pg-'));
  const projectName = 'modular-pg-e2e-app';
  const projectPath = path.join(tmpDir, projectName);

  try {
    console.log('[E2E-PG] Generating project in', tmpDir);
    await runCommand('node', [CLI_PATH, '--profile', 'modular-postgres-kysely', '--traits', 'eslint-basic,node-native-test', '--projectName', projectName], tmpDir);
    
    console.log('[E2E-PG] Installing dependencies...');
    await runCommand('npm', ['install'], projectPath);

    // Create env file
    await runCommand('cp', ['.env.example', '.env'], projectPath);

    console.log('[E2E-PG] Starting Postgres via Docker Compose...');
    await runCommand('docker', ['compose', 'up', '-d'], projectPath);
    
    console.log('[E2E-PG] Waiting for Postgres port 5432...');
    await waitForPort(5432);
    // Give Postgres a moment to actually be ready to accept connections after port opens
    await new Promise(r => setTimeout(r, 2000));

    console.log('[E2E-PG] Running migrations...');
    // We add a script to package.json dynamically or run via tsx directly
    await runCommand('npx', ['tsx', 'src/db/scripts/migrate.ts'], projectPath);

    console.log('[E2E-PG] Running lint...');
    await runCommand('npm', ['run', 'lint'], projectPath);

    console.log('[E2E-PG] Running build...');
    await runCommand('npm', ['run', 'build'], projectPath);

    console.log('[E2E-PG] Running native tests...');
    const testOutput = await runCommand('npm', ['test'], projectPath);
    
    assert.ok(testOutput.includes('POST /users creates a user'), 'Should test create user');
    assert.ok(testOutput.includes('POST /users returns 409 on email conflict'), 'Should test email conflict');
    assert.ok(testOutput.includes('POST /users returns 400 on invalid payload'), 'Should test 400 bad request');
    assert.ok(testOutput.includes('Throws if DATABASE_URL is missing'), 'Should test missing DATABASE_URL');
    assert.ok(testOutput.includes('GET /ready returns 200'), 'Should test readiness probe');
    assert.ok(testOutput.includes('GET /missing returns 404'), 'Should test missing route');

    console.log('[E2E-PG] Eval finished perfectly!');
  } catch (err) {
    console.error('Eval failed with error:', err);
    throw err;
  } finally {
    // Teardown docker
    console.log('[E2E-PG] Tearing down Docker...');
    await runCommand('docker', ['compose', 'down', '-v'], projectPath).catch(() => {});
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
});
