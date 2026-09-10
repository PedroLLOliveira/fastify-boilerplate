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
        reject(new Error('Command ' + command + ' ' + args.join(' ') + ' failed with code ' + code + '.\nStderr: ' + stderr + '\nStdout: ' + stdout));
      } else {
        resolve(stdout);
      }
    });
  });
}

function startDev(cwd) {
  const { NODE_TEST_CONTEXT, ...childEnv } = process.env;
  let output = '';
  const proc = spawn('npm', ['run', 'dev'], { cwd, shell: true, stdio: 'pipe', env: childEnv, detached: true });
  proc.stdout.on('data', (d) => { output += d.toString(); });
  proc.stderr.on('data', (d) => { output += d.toString(); });
  return { proc, getOutput: () => output };
}

function stopDev(proc) {
  return new Promise((resolve) => {
    if (!proc || proc.exitCode !== null) return resolve();
    const forceKill = setTimeout(() => {
      try { process.kill(-proc.pid, 'SIGKILL'); } catch { /* já morreu */ }
    }, 5000);
    proc.once('close', () => { clearTimeout(forceKill); resolve(); });
    try {
      process.kill(-proc.pid, 'SIGTERM');
    } catch {
      clearTimeout(forceKill);
      resolve();
    }
  });
}

async function waitForHealth(url, timeoutMs, getOutput) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      return await fetch(url);
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('Timeout esperando ' + url + ': ' + lastErr + '\n--- saída do "npm run dev" ---\n' + getOutput());
}

// Prova da Fase 5: a capability `cors` (kind: 'platform') não é persistência
// nem infra, e mesmo assim compõe com a arquitetura `modular` pelo mesmo
// `appFragment` que as capabilities de Postgres usam — sem nenhuma mudança
// na engine. Este eval segue o mesmo pipeline gerar → instalar → lint →
// build → test dos outros evals de profile, e acrescenta uma checagem com
// servidor real de pé (não só `app.inject()` dentro da suíte gerada).
test('V2 E2E Eval - Profile Modular + CORS', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fastify-v2-eval-modular-cors-'));
  const projectName = 'modular-cors-e2e-app';
  const projectPath = path.join(tmpDir, projectName);
  let dev;

  try {
    console.log('[E2E-ModularCors] Gerando projeto em', tmpDir);
    await runCommand('node', [CLI_PATH, '--profile', 'modular-cors', '--projectName', projectName], tmpDir);

    const pkg = JSON.parse(await fs.readFile(path.join(projectPath, 'package.json'), 'utf8'));
    assert.ok(pkg.dependencies['@fastify/cors'], 'package.json deveria depender de @fastify/cors');

    console.log('[E2E-ModularCors] npm install...');
    await runCommand('npm', ['install'], projectPath);

    console.log('[E2E-ModularCors] npm run lint...');
    await runCommand('npm', ['run', 'lint'], projectPath);

    console.log('[E2E-ModularCors] npm run build...');
    await runCommand('npm', ['run', 'build'], projectPath);

    console.log('[E2E-ModularCors] npm test (inclui o teste de CORS gerado)...');
    const testOutput = await runCommand('npm', ['test'], projectPath);
    assert.ok(testOutput.includes('CORS habilitado'), 'A suíte gerada deveria testar o CORS');

    console.log('[E2E-ModularCors] npm run dev (verificação com requisição HTTP real)...');
    dev = startDev(projectPath);
    const healthRes = await waitForHealth('http://localhost:3000/health', 30000, dev.getOutput);
    assert.strictEqual(healthRes.status, 200);

    const corsRes = await fetch('http://localhost:3000/health', { headers: { Origin: 'https://example.com' } });
    assert.strictEqual(
      corsRes.headers.get('access-control-allow-origin'),
      '*',
      '/health deveria responder com o header de CORS (config padrão do @fastify/cors, sem allowlist)'
    );

    console.log('[E2E-ModularCors] Eval finalizada: capability de plataforma (CORS) provada de ponta a ponta.');
  } finally {
    await stopDev(dev?.proc);
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
});
