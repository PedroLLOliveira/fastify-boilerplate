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
        reject(new Error(`Command ${command} ${args.join(' ')} failed with code ${code}.\nStderr: ${stderr}\nStdout: ${stdout}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

test('V2 E2E Eval - Profile Clean', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fastify-v2-eval-clean-'));
  const projectName = 'clean-e2e-app';
  const projectPath = path.join(tmpDir, projectName);

  try {
    console.log('[E2E-Clean] Generating project in', tmpDir);
    await runCommand('node', [CLI_PATH, '--profile', 'clean', '--projectName', projectName], tmpDir);

    const pkgContent = await fs.readFile(path.join(projectPath, 'package.json'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    assert.ok(pkg.scripts.dev, 'Should have dev script');
    assert.ok(pkg.scripts.build, 'Should have build script');
    assert.ok(pkg.scripts.start, 'Should have start script');
    assert.ok(pkg.scripts.lint, 'Should have lint script');
    assert.ok(pkg.scripts.test, 'Should have test script');

    // Regressão do achado 03: app.ts vivia em
    // src/infrastructure/web/fastify/ mas era importado como se estivesse
    // em src/, e o import interno do health.route.js não subia os níveis
    // certos. Confirma que os arquivos da camada de infraestrutura existem
    // no caminho declarado pelo profile antes de depender do build pra
    // pegar o TS2307.
    const appStats = await fs.stat(path.join(projectPath, 'src/infrastructure/web/fastify/app.ts'));
    assert.ok(appStats.isFile(), 'app.ts should exist em infrastructure/web/fastify');

    console.log('[E2E-Clean] Installing dependencies...');
    await runCommand('npm', ['install'], projectPath);

    console.log('[E2E-Clean] Running lint...');
    await runCommand('npm', ['run', 'lint'], projectPath);

    console.log('[E2E-Clean] Running build (regressão do achado 03 — TS2307)...');
    await runCommand('npm', ['run', 'build'], projectPath);

    console.log('[E2E-Clean] Running native tests...');
    const testOutput = await runCommand('npm', ['test'], projectPath);
    assert.ok(testOutput.includes('GET /health returns 200'), 'Test output should indicate success on /health');

    console.log('[E2E-Clean] Eval finished perfectly!');
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
});
