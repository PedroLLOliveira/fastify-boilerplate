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

// Sobe "npm run dev" como líder de um novo grupo de processos, para que
// predev (docker compose, migrate, seed) e o tsx watch (e o node que ele
// respawna) possam ser derrubados de uma vez só no teardown.
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
      const res = await fetch(url);
      return res;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Timeout esperando ${url}: ${lastErr}\n--- saída do "npm run dev" ---\n${getOutput()}`);
}

const PROFILES = [
  { id: 'minimal', needsDocker: false },
  { id: 'modular', needsDocker: false },
  { id: 'mvc', needsDocker: false },
  { id: 'modular-postgres-kysely', needsDocker: true },
  { id: 'modular-postgres-sequelize', needsDocker: true }
];

for (const { id, needsDocker } of PROFILES) {
  test(`V2 First-Command Eval - "npm install && npm run dev" - ${id}`, async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fastify-v2-first-cmd-'));
    const projectName = 'first-cmd-app';
    const projectPath = path.join(tmpDir, projectName);
    let dev;

    try {
      console.log(`[FIRST-CMD:${id}] Gerando projeto em`, tmpDir);
      await runCommand('node', [CLI_PATH, '--profile', id, '--projectName', projectName], tmpDir);

      console.log(`[FIRST-CMD:${id}] npm install...`);
      await runCommand('npm', ['install'], projectPath);

      console.log(`[FIRST-CMD:${id}] npm run dev...`);
      dev = startDev(projectPath);

      const healthRes = await waitForHealth('http://localhost:3000/health', 60000, dev.getOutput);
      assert.strictEqual(healthRes.status, 200, '/health deveria responder 200');
      const healthBody = await healthRes.json();
      assert.strictEqual(healthBody.status, 'ok');

      if (needsDocker) {
        const readyRes = await fetch('http://localhost:3000/ready');
        assert.strictEqual(readyRes.status, 200, '/ready deveria responder 200 (banco migrado pelo predev)');

        const usersRes = await fetch('http://localhost:3000/users');
        assert.strictEqual(usersRes.status, 200);
        const usersBody = await usersRes.json();
        assert.ok(usersBody.data.length >= 1, 'o seed do predev deveria garantir pelo menos um usuário no primeiro GET');
      }

      console.log(`[FIRST-CMD:${id}] "npm install && npm run dev" honrou a promessa.`);
    } finally {
      await stopDev(dev?.proc);
      if (needsDocker) {
        await runCommand('docker', ['compose', 'down', '-v'], projectPath).catch(() => {});
      }
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  });
}

// `clean` está com status: 'experimental' (Fase 0) por um bug pré-existente e
// não relacionado a este eval: o app.ts gerado importa um caminho que não
// existe (achado 03 do roadmap), então nem `npm run build`/`dev` funcionam.
// Corrigir isso é escopo da Fase 2 — só então este profile entra aqui.
test('V2 First-Command Eval - "npm install && npm run dev" - clean', { skip: 'clean está quebrado (achado 03); conserto e eval entram na Fase 2' }, () => {});
