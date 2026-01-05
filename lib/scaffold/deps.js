export function computeDeps({ answers, isTS }) {
  // deps base
  const deps = new Set(['fastify', 'dotenv', 'fastify-plugin']);
  const devDeps = new Set(['rimraf']); // usado no build TS

  // runtime TS/JS
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
    if (answers.database === 'mysql') deps.add('mysql2');
    if (answers.database === 'sqlite') deps.add('sqlite3');
  } else if (answers.orm === 'mongoose') {
    deps.add('mongoose');
  }

  // Query Builder: Knex
  if (answers.queryBuilder === 'knex') {
    deps.add('knex');
    if (answers.database === 'postgres') deps.add('pg');
    if (answers.database === 'mysql') deps.add('mysql2');
    if (answers.database === 'sqlite') deps.add('sqlite3');
  }

  // Query Builder: Kysely
  if (answers.queryBuilder === 'kysely') {
    deps.add('kysely');

    // IMPORTANTE:
    // O template atual do plugin do Kysely importa pg/mysql2/better-sqlite3 no topo,
    // então precisamos garantir que existam, independentemente do banco escolhido.
    deps.add('pg');
    deps.add('mysql2');
    deps.add('better-sqlite3');
  }

  // ESLint
  if (answers.eslint !== 'none') {
    devDeps.add('eslint');
    devDeps.add('eslint-plugin-promise');
    devDeps.add('eslint-plugin-import');
    devDeps.add('eslint-plugin-n');

    if (answers.eslint === 'prettier') {
      devDeps.add('prettier');
      devDeps.add('eslint-config-prettier');
    }

    if (isTS) {
      devDeps.add('@typescript-eslint/parser');
      devDeps.add('@typescript-eslint/eslint-plugin');
      devDeps.add('eslint-config-standard-with-typescript');
    } else {
      devDeps.add('eslint-config-standard');
    }
  }

  return { deps: Array.from(deps), devDeps: Array.from(devDeps) };
}
