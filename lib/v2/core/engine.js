import fsp from 'fs/promises';
import path from 'path';
import { resolveDependencies, catalog } from './catalog.js';

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

  for (const trait of traits) {
    if (trait.dependencies?.runtime) combinedRuntime.push(...trait.dependencies.runtime);
    if (trait.dependencies?.dev) combinedDev.push(...trait.dependencies.dev);
    if (trait.files) combinedFiles.push(...trait.files);
    if (trait.scripts) Object.assign(combinedScripts, trait.scripts);
  }

  // Deduplicar dependências
  const uniqueRuntime = [...new Set(combinedRuntime)];
  const uniqueDev = [...new Set(combinedDev)];

  // 2. Resolve package.json determinístico
  const pkg = {
    name: projectName,
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
  }

  return { success: true, pkg };
}
