export function computeDeps({ answers, isTS }) {
  const deps = new Set(['fastify', 'dotenv']);
  const devDeps = new Set(['rimraf']); // limpar dist

  if (isTS) {
    devDeps.add('typescript');
    devDeps.add('tsx');
    devDeps.add('@types/node');
  } else {
    devDeps.add('nodemon');
  }

  // ORM
  if (answers.orm === 'prisma') {
    deps.add('@prisma/client');
    devDeps.add('prisma');
  } else if (answers.orm === 'sequelize') {
    deps.add('sequelize');
    if (answers.database === 'postgres') { deps.add('pg'); deps.add('pg-hstore'); }
    if (answers.database === 'mysql') { deps.add('mysql2'); }
    if (answers.database === 'sqlite') { deps.add('sqlite3'); }
  } else if (answers.orm === 'mongoose') {
    deps.add('mongoose');
  }

  // Query Builder (Knex)
  if (answers.queryBuilder === 'knex') {
    deps.add('knex');
    if (answers.database === 'postgres') deps.add('pg');
    if (answers.database === 'mysql') deps.add('mysql2');
    if (answers.database === 'sqlite') deps.add('sqlite3');
  }

  // ESLint
  if (answers.eslint !== 'none') {
    devDeps.add('eslint');
    if (answers.eslint === 'prettier') { devDeps.add('prettier'); devDeps.add('eslint-config-prettier'); }
    if (isTS) { devDeps.add('@typescript-eslint/parser'); devDeps.add('@typescript-eslint/eslint-plugin'); }
  }

  return { deps: Array.from(deps), devDeps: Array.from(devDeps) };
}
