#!/usr/bin/env node
/**
 * Gera docs/product/support-matrix.md a partir do campo `status` de cada
 * lib/v2/profiles/*.js. Esse arquivo é a fonte de verdade única — a
 * matriz em Markdown nunca deve ser editada à mão.
 *
 * Uso:
 *   node scripts/generate-support-matrix.js          # regrava o arquivo
 *   node scripts/generate-support-matrix.js --check  # falha (exit 1) se o
 *                                                     # arquivo divergir; usado no CI.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { minimalProfile } from '../lib/v2/profiles/minimal.js';
import { modularProfile } from '../lib/v2/profiles/modular.js';
import { modularPgKyselyProfile } from '../lib/v2/profiles/modular-pg-kysely.js';
import { modularPgSequelizeProfile } from '../lib/v2/profiles/modular-postgres-sequelize.js';
import { mvcProfile } from '../lib/v2/profiles/mvc.js';
import { cleanProfile } from '../lib/v2/profiles/clean.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'docs/product/support-matrix.md');

const STATUS_LABEL = {
  supported: 'suportado',
  experimental: 'experimental',
  deprecated: 'deprecated'
};

// Cada profile é avaliado por um eval E2E próprio em tests/v2/. O nome do
// arquivo não segue um padrão único com o id do profile, então o mapeamento
// é explícito aqui.
const PROFILES = [
  { profile: minimalProfile, arquitetura: 'minimal', persistencia: 'none', evalFile: 'tests/v2/eval-minimal.test.js' },
  { profile: modularProfile, arquitetura: 'modular', persistencia: 'none', evalFile: 'tests/v2/eval-modular.test.js' },
  { profile: modularPgKyselyProfile, arquitetura: 'modular', persistencia: 'PostgreSQL + Kysely', evalFile: 'tests/v2/eval-modular-pg.test.js' },
  { profile: modularPgSequelizeProfile, arquitetura: 'modular', persistencia: 'PostgreSQL + Sequelize', evalFile: 'tests/v2/eval-modular-pg-sequelize.test.js' },
  { profile: mvcProfile, arquitetura: 'MVC', persistencia: 'none', evalFile: 'tests/v2/eval-mvc.test.js' },
  { profile: cleanProfile, arquitetura: 'Clean', persistencia: 'none', evalFile: 'tests/v2/eval-clean.test.js' }
];

function renderRow({ profile, arquitetura, persistencia, evalFile }) {
  const hasEval = fs.existsSync(path.join(ROOT, evalFile));
  const status = STATUS_LABEL[profile.status] ?? profile.status;
  const eval_ = hasEval ? `\`${evalFile.replace('tests/v2/', '')}\`` : 'ausente';
  return `| \`${profile.id}\` | ${arquitetura} | ${persistencia} | ${status} | ${eval_} |`;
}

function render() {
  const rows = PROFILES.map(renderRow).join('\n');
  return `# Matriz de suporte

> Gerado automaticamente por \`scripts/generate-support-matrix.js\` a partir do
> campo \`status\` em \`lib/v2/profiles/*.js\`. Não edite este arquivo à mão —
> rode \`npm run docs:support-matrix\` depois de mudar um profile.

| Profile ID | Arquitetura | Persistência | Status | Eval E2E |
|---|---|---|---|---|
${rows}

## Política

- \`supported\`: pode aparecer no wizard e no README principal; tem eval E2E verde em CI.
- \`experimental\`: aparece apenas com aviso explícito; não é recomendado para produção sem revisão do time. É o estado obrigatório de qualquer profile sem eval E2E.
- \`deprecated\`: continua documentado com caminho de migração e data de remoção.
- \`removed\`: não aparece no CLI; docs históricas só em changelog/migration guide.

Um profile só sobe de \`experimental\` para \`supported\` quando ganha um eval E2E
em \`tests/v2/\` e esse eval está verde em CI — nunca por edição direta deste
arquivo ou do campo \`status\`.

## Decisão de escopo

A v2 não promete "todos os ORMs". Perfis são combinações deliberadas. Prisma, TypeORM, Mongo/Mongoose e outros bancos podem ser adicionados somente depois de uma spec que justifique demanda, custo de manutenção e eval completa.
`;
}

function main() {
  const content = render();
  const check = process.argv.includes('--check');

  if (check) {
    const current = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : null;
    if (current !== content) {
      console.error(
        `${OUTPUT_PATH} está desatualizado em relação aos profiles.\n` +
        'Rode `npm run docs:support-matrix` e commite o resultado.'
      );
      process.exit(1);
    }
    console.log('support-matrix.md está em dia com os profiles.');
    return;
  }

  fs.writeFileSync(OUTPUT_PATH, content);
  console.log(`Gerado: ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main();
