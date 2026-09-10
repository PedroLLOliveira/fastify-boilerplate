import fsp from 'fs/promises';
import path from 'path';
import { resolveDependencies, catalog } from './catalog.js';
import { buildReadmeContent } from './readme.js';
import { toPackageName } from './slug.js';

/**
 * Renderiza um profile
 * @param {import('./types.d.ts').ProfileDefinition} profile 
 * @param {import('./types.d.ts').TraitDefinition[]} traits
 * @param {string} outDir 
 * @param {string} projectName 
 */
export async function renderProfile(profile, traits = [], outDir, projectName) {
  // 1. Cria diretório
  await fsp.mkdir(outDir, { recursive: true });

  const combinedRuntime = [...profile.dependencies.runtime];
  const combinedDev = [...profile.dependencies.dev];
  let combinedFiles = [...profile.files];
  const combinedScripts = {
    dev: 'tsx watch src/server.ts',
    build: 'rimraf dist && tsc -p tsconfig.json',
    start: 'node dist/server.js'
  };

  if (profile.scripts) Object.assign(combinedScripts, profile.scripts);

  for (const trait of traits) {
    if (trait.dependencies?.runtime) combinedRuntime.push(...trait.dependencies.runtime);
    if (trait.dependencies?.dev) combinedDev.push(...trait.dependencies.dev);
    if (trait.files) combinedFiles.push(...trait.files);
    if (trait.scripts) Object.assign(combinedScripts, trait.scripts);
  }

  // Os arquivos de teste ficam fora de profile.files porque a sintaxe muda
  // conforme o trait de teste (node:test vs. Vitest) — sem isso, trocar de
  // runner deixava o app com arquivos de teste que ele não sabia rodar.
  // Sem nenhum trait de teste ativo (categoria "Nenhum"), nenhum arquivo de
  // teste é escrito.
  const testTrait = traits.find((t) => t.id === 'node-native-test' || t.id === 'vitest');
  if (testTrait && profile.testFiles?.[testTrait.id]) {
    combinedFiles = [...combinedFiles, ...profile.testFiles[testTrait.id]];
  }

  // Grava .env ao lado do .env.example com os mesmos valores de dev — sem
  // isso o app tenta subir sem DATABASE_URL (ou equivalente) e quebra no
  // primeiro comando que o próprio CLI manda rodar.
  const envExample = combinedFiles.find((f) => f.path === '.env.example');
  if (envExample && !combinedFiles.some((f) => f.path === '.env')) {
    combinedFiles = [...combinedFiles, { path: '.env', content: envExample.content }];
  }

  // README gerado a partir dos arquivos e scripts finais (depois de traits
  // e capability aplicados), não um texto fixo por profile — assim ele
  // nunca promete um comando ou rota que a combinação escolhida não tem.
  // `/ready` e `/users` existem em `modular` mesmo sem persistência (CRUD
  // em memória), por isso a checagem é pela presença real do arquivo, não
  // por `profile.persistence !== 'none'`.
  if (!combinedFiles.some((f) => f.path === 'README.md')) {
    const healthRouteFile = combinedFiles.find((f) => f.path.includes('health.route'));
    combinedFiles = [...combinedFiles, {
      path: 'README.md',
      content: buildReadmeContent({
        projectName,
        architecture: profile.architecture,
        persistence: profile.persistence,
        scripts: combinedScripts,
        hasEnvExample: Boolean(envExample),
        hasReadyRoute: Boolean(healthRouteFile?.content?.includes("'/ready'")),
        hasUsersRoutes: combinedFiles.some((f) => f.path.includes('users.route'))
      })
    }];
  }

  // Deduplicar dependências
  const uniqueRuntime = [...new Set(combinedRuntime)];
  const uniqueDev = [...new Set(combinedDev)];

  // 2. Resolve package.json determinístico
  const pkg = {
    name: toPackageName(projectName),
    version: '0.1.0',
    private: true,
    type: 'module',
    engines: {
      node: catalog.nodeLTS
    },
    scripts: combinedScripts,
    dependencies: resolveDependencies(uniqueRuntime, 'dependencies'),
    devDependencies: resolveDependencies(uniqueDev, 'devDependencies'),
  };

  await fsp.writeFile(
    path.join(outDir, 'package.json'),
    JSON.stringify(pkg, null, 2)
  );

  // 3. Escreve os arquivos do manifesto
  for (const file of combinedFiles) {
    const filePath = path.join(outDir, file.path);
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    
    // Na engine inicial (T004) apenas escrevemos o content puro.
    // Em T010 implementaremos os templates reais no manifesto.
    const content = file.content || `// TODO: Template for ${file.template}\n`;
    await fsp.writeFile(filePath, content);
    if (file.mode) await fsp.chmod(filePath, file.mode);
  }

  return { success: true, pkg };
}
