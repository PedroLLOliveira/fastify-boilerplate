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

test('V2 E2E Eval - Profile Minimal', async (t) => {
  // We need to extend the timeout since npm install takes time
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fastify-v2-eval-'));
  const projectName = 'minimal-e2e-app';
  const projectPath = path.join(tmpDir, projectName);

  try {
    console.log('[E2E] Generating project in', tmpDir);
    // 1. Generate App
    await runCommand('node', [CLI_PATH, '--profile', 'minimal', '--projectName', projectName], tmpDir);
    
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

    console.log('[E2E] Installing dependencies (this may take a few seconds)...');
    // 2. Install Dependencies
    await runCommand('npm', ['install'], projectPath);

    console.log('[E2E] Running lint...');
    // 3. Lint
    await runCommand('npm', ['run', 'lint'], projectPath);

    console.log('[E2E] Running build (checking ESM/NodeNext conflicts)...');
    // 4. Build
    await runCommand('npm', ['run', 'build'], projectPath);

    console.log('[E2E] Running native tests...');
    // 5. Test
    const testOutput = await runCommand('npm', ['test'], projectPath);
    assert.ok(testOutput.includes('GET /health returns 200'), 'Test output should indicate success on /health');

    console.log('[E2E] Eval finished perfectly! All CA-001 to CA-006 fulfilled.');
  } finally {
    // Cleanup
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
});
