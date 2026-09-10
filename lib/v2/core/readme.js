// Gera o README.md a partir do que o profile realmente resolveu (scripts e
// arquivos finais, depois de traits e capability aplicados) — não um texto
// fixo por profile. Assim ele nunca promete um comando que não existe (era
// exatamente o problema do achado 02: o CLI mandava rodar `npm run
// db:migrate` antes desse script existir).

const SCRIPT_DESCRIPTIONS = {
  dev: 'Sobe o servidor em modo desenvolvimento, com watch.',
  predev: 'Roda sozinho antes do `dev` (convenção do npm) — sobe a infraestrutura, migra e semeia. Não precisa ser chamado direto.',
  'dev:no-infra': 'Mesmo que `dev`, mas sem subir a infraestrutura via Docker Compose — use se você já tem um banco rodando.',
  build: 'Compila o projeto para `dist/`.',
  start: 'Roda a build de produção (`dist/server.js`).',
  lint: 'Roda o linter.',
  format: 'Formata o código.',
  test: 'Roda a suíte de testes.',
  prepare: 'Instala os hooks do Husky (roda sozinho depois do `npm install`).',
  'db:migrate': 'Aplica as migrations pendentes no banco.',
  'db:seed': 'Insere o dado de exemplo no banco (idempotente).',
  'db:reset': 'Derruba o banco (Docker, com volume), sobe de novo, migra e semeia.'
};

const PERSISTENCE_LABEL = {
  none: 'sem persistência',
  postgres: 'PostgreSQL'
};

/**
 * @param {object} params
 * @param {string} params.projectName
 * @param {string} params.architecture
 * @param {string} params.persistence
 * @param {Record<string, string>} params.scripts
 * @param {boolean} params.hasEnvExample
 * @param {boolean} params.hasReadyRoute
 * @param {boolean} params.hasUsersRoutes
 */
export function buildReadmeContent({ projectName, architecture, persistence, scripts, hasEnvExample, hasReadyRoute, hasUsersRoutes }) {
  const persistenceLabel = PERSISTENCE_LABEL[persistence] || persistence;
  const lines = [];

  lines.push(`# ${projectName}`);
  lines.push('');
  lines.push(`Gerado com [fastify-boilerplate](https://github.com/PedroLLOliveira/fastify-boilerplate) — arquitetura \`${architecture}\`, ${persistenceLabel}.`);
  lines.push('');
  lines.push('## Como rodar');
  lines.push('');
  lines.push('```bash');
  lines.push('npm install');
  lines.push('npm run dev');
  lines.push('```');
  lines.push('');

  if (scripts.predev) {
    lines.push('`npm run dev` já sobe a infraestrutura necessária (Docker Compose), roda as migrations e o seed de exemplo antes de iniciar o servidor — os dois comandos acima bastam.');
    if (scripts['dev:no-infra']) {
      lines.push('');
      lines.push('Já tem um banco próprio rodando? Use `npm run dev:no-infra` para pular o Docker Compose.');
    }
    lines.push('');
  }

  lines.push('## Endpoints');
  lines.push('');
  lines.push('- `GET /health` — liveness, não depende de nenhum serviço externo.');
  if (hasReadyRoute) {
    lines.push(
      persistence !== 'none'
        ? '- `GET /ready` — readiness, confere a conexão com o banco.'
        : '- `GET /ready` — readiness (sem dependência externa a checar nesta combinação).'
    );
  }
  if (hasUsersRoutes) {
    lines.push('- `GET /users`, `POST /users` — CRUD de exemplo.');
  }
  lines.push('');

  lines.push('## Scripts');
  lines.push('');
  lines.push('| Comando | O que faz |');
  lines.push('|---|---|');
  for (const name of Object.keys(scripts)) {
    lines.push(`| \`npm run ${name}\` | ${SCRIPT_DESCRIPTIONS[name] || 'Script do projeto.'} |`);
  }
  lines.push('');

  if (hasEnvExample) {
    lines.push('## Ambiente');
    lines.push('');
    lines.push('Um `.env` de desenvolvimento já vem gerado ao lado do `.env.example`, com valores prontos para uso local — ajuste conforme necessário. Nenhum dos dois deve conter credenciais reais; `.env` já está no `.gitignore`.');
    lines.push('');
  }

  return lines.join('\n');
}
