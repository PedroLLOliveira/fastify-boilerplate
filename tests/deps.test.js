import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { computeDeps } from '../lib/scaffold/deps.js';

test('computeDeps - should return basic dependencies for JavaScript project', () => {
  const ctx = {
    answers: {
      orm: 'none',
      queryBuilder: 'none',
      eslint: 'none',
      database: 'postgres'
    },
    isTS: false
  };

  const { deps, devDeps } = computeDeps(ctx);
  
  assert.ok(deps.includes('fastify'));
  assert.ok(deps.includes('dotenv'));
  assert.ok(devDeps.includes('rimraf'));
  assert.ok(devDeps.includes('nodemon'));
  assert.ok(!devDeps.includes('typescript'));
});

test('computeDeps - should return basic dependencies for TypeScript project', () => {
  const ctx = {
    answers: {
      orm: 'none',
      queryBuilder: 'none',
      eslint: 'none',
      database: 'postgres'
    },
    isTS: true
  };

  const { deps, devDeps } = computeDeps(ctx);
  
  assert.ok(deps.includes('fastify'));
  assert.ok(deps.includes('dotenv'));
  assert.ok(devDeps.includes('rimraf'));
  assert.ok(devDeps.includes('typescript'));
  assert.ok(devDeps.includes('tsx'));
  assert.ok(devDeps.includes('@types/node'));
  assert.ok(!devDeps.includes('nodemon'));
});

test('computeDeps - should include Prisma dependencies when selected', () => {
  const ctx = {
    answers: {
      orm: 'prisma',
      queryBuilder: 'none',
      eslint: 'none',
      database: 'postgres'
    },
    isTS: true
  };

  const { deps, devDeps } = computeDeps(ctx);
  
  assert.ok(deps.includes('@prisma/client'));
  assert.ok(devDeps.includes('prisma'));
});

test('computeDeps - should include Sequelize dependencies with PostgreSQL', () => {
  const ctx = {
    answers: {
      orm: 'sequelize',
      queryBuilder: 'none',
      eslint: 'none',
      database: 'postgres'
    },
    isTS: true
  };

  const { deps, devDeps } = computeDeps(ctx);
  
  assert.ok(deps.includes('sequelize'));
  assert.ok(deps.includes('pg'));
  assert.ok(deps.includes('pg-hstore'));
});

test('computeDeps - should include Sequelize dependencies with MySQL', () => {
  const ctx = {
    answers: {
      orm: 'sequelize',
      queryBuilder: 'none',
      eslint: 'none',
      database: 'mysql'
    },
    isTS: true
  };

  const { deps, devDeps } = computeDeps(ctx);
  
  assert.ok(deps.includes('sequelize'));
  assert.ok(deps.includes('mysql2'));
});

test('computeDeps - should include Sequelize dependencies with SQLite', () => {
  const ctx = {
    answers: {
      orm: 'sequelize',
      queryBuilder: 'none',
      eslint: 'none',
      database: 'sqlite'
    },
    isTS: true
  };

  const { deps, devDeps } = computeDeps(ctx);
  
  assert.ok(deps.includes('sequelize'));
  assert.ok(deps.includes('sqlite3'));
});

test('computeDeps - should include Mongoose dependencies', () => {
  const ctx = {
    answers: {
      orm: 'mongoose',
      queryBuilder: 'none',
      eslint: 'none',
      database: 'mongodb'
    },
    isTS: true
  };

  const { deps, devDeps } = computeDeps(ctx);
  
  assert.ok(deps.includes('mongoose'));
});

test('computeDeps - should include Knex dependencies with PostgreSQL', () => {
  const ctx = {
    answers: {
      orm: 'none',
      queryBuilder: 'knex',
      eslint: 'none',
      database: 'postgres'
    },
    isTS: true
  };

  const { deps, devDeps } = computeDeps(ctx);
  
  assert.ok(deps.includes('knex'));
  assert.ok(deps.includes('pg'));
});

test('computeDeps - should include Kysely dependencies with PostgreSQL', () => {
  const ctx = {
    answers: {
      orm: 'none',
      queryBuilder: 'kysely',
      eslint: 'none',
      database: 'postgres'
    },
    isTS: true
  };

  const { deps, devDeps } = computeDeps(ctx);
  
  assert.ok(deps.includes('kysely'));
  assert.ok(deps.includes('pg'));
});

test('computeDeps - should include ESLint dependencies', () => {
  const ctx = {
    answers: {
      orm: 'none',
      queryBuilder: 'none',
      eslint: 'prettier',
      database: 'postgres'
    },
    isTS: true
  };

  const { deps, devDeps } = computeDeps(ctx);
  
  assert.ok(devDeps.includes('eslint'));
  assert.ok(devDeps.includes('prettier'));
  assert.ok(devDeps.includes('eslint-config-prettier'));
  assert.ok(devDeps.includes('@typescript-eslint/parser'));
  assert.ok(devDeps.includes('@typescript-eslint/eslint-plugin'));
});