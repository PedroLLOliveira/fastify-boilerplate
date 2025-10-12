import path from 'path';
import fsp from 'fs/promises';

export async function writePackageJson({ root, answers, deps, devDeps }) {
  const isTS = answers.language === 'ts';
  const scripts = isTS
    ? {
        dev: "tsx watch src/server.ts",
        build: "rimraf dist && tsc -p tsconfig.json",
        start: "node dist/server.js",
        lint: answers.eslint === 'none' ? "echo \"no lint\"" : "eslint ."
      }
    : {
        dev: "nodemon --watch src --ext js,mjs --exec \"node src/server.js\"",
        start: "node src/server.js",
        lint: answers.eslint === 'none' ? "echo \"no lint\"" : "eslint ."
      };

  const pkg = {
    name: answers.projectName,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts,
    dependencies: {},
    devDependencies: {}
  };

  if (answers.orm === 'prisma') {
    pkg.scripts['prisma:studio'] = 'prisma studio';
    pkg.scripts['prisma:generate'] = 'prisma generate';
    pkg.scripts['prisma:migrate'] = 'prisma migrate dev';
  }

  if (answers.queryBuilder === 'knex') {
    pkg.scripts['knex:migrate'] = 'knex migrate:latest --knexfile knexfile.cjs';
    pkg.scripts['knex:rollback'] = 'knex migrate:rollback --knexfile knexfile.cjs';
    pkg.scripts['knex:seed'] = 'knex seed:run --knexfile knexfile.cjs';
  }

  deps.sort().forEach(d => (pkg.dependencies[d] = 'latest'));
  devDeps.sort().forEach(d => (pkg.devDependencies[d] = 'latest'));

  await fsp.writeFile(path.join(root, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');
}
