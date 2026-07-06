import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { computeDeps } from './lib/scaffold/deps.js';
import { makeFolders } from './lib/scaffold/makeFolders.js';
import { writeBaseFiles } from './lib/scaffold/writeBaseFiles.js';
import { writePackageJson } from './lib/scaffold/pkgjson.js';
import { generateExamples } from './lib/examples/index.js';

async function testGen(name, answers) {
  const root = path.resolve(process.cwd(), name);
  await fsp.mkdir(root, { recursive: true });

  const ctx = { root, answers, isTS: answers.language === 'ts', ext: answers.language === 'ts' ? 'ts' : 'js' };
  await makeFolders(ctx);
  const { deps, devDeps } = computeDeps(ctx);
  await writeBaseFiles({ ...ctx, deps, devDeps });
  await generateExamples(ctx);
  await writePackageJson({ ...ctx, deps, devDeps });
  console.log(`Generated ${name}`);
}

async function run() {
  await testGen('test-app-1', {
    projectName: 'test-app-1',
    language: 'ts',
    architecture: 'modular',
    orm: 'none',
    database: 'postgres',
    queryBuilder: 'none',
    eslint: 'basic',
    devcontainer: false
  });
}
run().catch(console.error);
