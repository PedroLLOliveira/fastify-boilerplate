import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_PATH = path.resolve(__dirname, '../../bin/cli.js');

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const { NODE_TEST_CONTEXT, ...childEnv } = process.env;
    const proc = spawn(command, args, { cwd, shell: true, stdio: 'pipe', env: childEnv });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Command ' + command + ' ' + args.join(' ') + ' failed with code ' + code + '.\\nStderr: ' + stderr + '\\nStdout: ' + stdout));
      } else {
        resolve(stdout);
      }
    });
  });
}

test('V2 E2E Eval - Profile Modular', async (t) => {
  // We need to extend the timeout since npm install takes time
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fastify-v2-eval-modular-'));
  const projectName = 'modular-e2e-app';
  const projectPath = path.join(tmpDir, projectName);

  try {
    console.log('[E2E-Modular] Generating project in', tmpDir);
    // 1. Generate App
    await runCommand('node', [CLI_PATH, '--profile', 'modular', '--projectName', projectName], tmpDir);
    
    // Check if it was created
    const stats = await fs.stat(path.join(projectPath, 'package.json'));
    assert.ok(stats.isFile(), 'package.json should exist');

    const pkgContent = await fs.readFile(path.join(projectPath, 'package.json'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    assert.ok(pkg.scripts.dev, 'Should have dev script');
    assert.ok(pkg.scripts.build, 'Should have build script');
    assert.ok(pkg.scripts.start, 'Should have start script');
    assert.ok(pkg.scripts.lint, 'Should have lint script');
    assert.ok(pkg.scripts.test, 'Should have test script');

    // Check specific files
    const usersHandlerStats = await fs.stat(path.join(projectPath, 'src/modules/users/users.handler.ts'));
    assert.ok(usersHandlerStats.isFile(), 'users.handler.ts should exist');

    console.log('[E2E-Modular] Installing dependencies (this may take a few seconds)...');
    // 2. Install Dependencies
    await runCommand('npm', ['install'], projectPath);

    console.log('[E2E-Modular] Running lint...');
    // 3. Lint
    await runCommand('npm', ['run', 'lint'], projectPath);

    console.log('[E2E-Modular] Running build (checking ESM/NodeNext conflicts)...');
    // 4. Build
    await runCommand('npm', ['run', 'build'], projectPath);

    console.log('[E2E-Modular] Running native tests...');
    // 5. Test
    const testOutput = await runCommand('npm', ['test'], projectPath);
    assert.ok(testOutput.includes('GET /health returns 200'), 'Test output should indicate success on /health');
    assert.ok(testOutput.includes('GET /users returns 200'), 'Test output should indicate success on /users');
    assert.ok(testOutput.includes('POST /users returns 400'), 'Test output should indicate 400 on invalid payload');
    assert.ok(testOutput.includes('POST /users returns 409'), 'Test output should indicate 409 on conflict');

    console.log('[E2E-Modular] Eval finished perfectly! All CA-001 to CA-006 fulfilled.');
  } finally {
    // Cleanup
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
});
