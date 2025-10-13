import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { dbPluginTemplate } from '../lib/templates/common/dbPlugin.js';

test('dbPluginTemplate - should generate Mongoose template for TypeScript', () => {
  const result = dbPluginTemplate(true, { orm: 'mongoose', queryBuilder: 'none' });
  
  assert.ok(result.includes("import mongoose from 'mongoose'"));
  assert.ok(result.includes('FastifyInstance, FastifyPluginOptions'));
  assert.ok(result.includes('mongoose as any'));
});

test('dbPluginTemplate - should generate Mongoose template for JavaScript', () => {
  const result = dbPluginTemplate(false, { orm: 'mongoose', queryBuilder: 'none' });
  
  assert.ok(result.includes("import mongoose from 'mongoose'"));
  assert.ok(!result.includes('FastifyInstance'));
  assert.ok(result.includes('mongoose'));
});

test('dbPluginTemplate - should generate Sequelize template for TypeScript', () => {
  const result = dbPluginTemplate(true, { orm: 'sequelize', queryBuilder: 'none' });
  
  assert.ok(result.includes("import { Sequelize } from 'sequelize'"));
  assert.ok(result.includes('FastifyInstance, FastifyPluginOptions'));
});

test('dbPluginTemplate - should generate Sequelize template for JavaScript', () => {
  const result = dbPluginTemplate(false, { orm: 'sequelize', queryBuilder: 'none' });
  
  assert.ok(result.includes("import { Sequelize } from 'sequelize'"));
  assert.ok(!result.includes('FastifyInstance'));
});

test('dbPluginTemplate - should generate Prisma template for TypeScript', () => {
  const result = dbPluginTemplate(true, { orm: 'prisma', queryBuilder: 'none' });
  
  assert.ok(result.includes("import { PrismaClient } from '@prisma/client'"));
  assert.ok(result.includes('FastifyInstance, FastifyPluginOptions'));
});

test('dbPluginTemplate - should generate Prisma template for JavaScript', () => {
  const result = dbPluginTemplate(false, { orm: 'prisma', queryBuilder: 'none' });
  
  assert.ok(result.includes("import { PrismaClient } from '@prisma/client'"));
  assert.ok(!result.includes('FastifyInstance'));
});

test('dbPluginTemplate - should generate Knex template for PostgreSQL with TypeScript', () => {
  const result = dbPluginTemplate(true, { queryBuilder: 'knex', database: 'postgres', orm: 'none' });
  
  assert.ok(result.includes("import knex from 'knex'"));
  assert.ok(result.includes('client: \'pg\''));
  assert.ok(result.includes('FastifyInstance'));
});

test('dbPluginTemplate - should generate Knex template for MySQL with JavaScript', () => {
  const result = dbPluginTemplate(false, { queryBuilder: 'knex', database: 'mysql', orm: 'none' });
  
  assert.ok(result.includes("import knex from 'knex'"));
  assert.ok(result.includes('client: \'mysql2\''));
  assert.ok(!result.includes('FastifyInstance'));
});

test('dbPluginTemplate - should generate Knex template for SQLite', () => {
  const result = dbPluginTemplate(false, { queryBuilder: 'knex', database: 'sqlite', orm: 'none' });
  
  assert.ok(result.includes("import knex from 'knex'"));
  assert.ok(result.includes('client: \'sqlite3\''));
  assert.ok(result.includes('useNullAsDefault: true'));
});

test('dbPluginTemplate - should generate Kysely template for PostgreSQL', () => {
  const result = dbPluginTemplate(false, { queryBuilder: 'kysely', database: 'postgres', orm: 'none' });
  
  assert.ok(result.includes('Kysely, PostgresDialect'));
  assert.ok(result.includes('new PostgresDialect'));
});

test('dbPluginTemplate - should generate Kysely template for MySQL', () => {
  const result = dbPluginTemplate(false, { queryBuilder: 'kysely', database: 'mysql', orm: 'none' });
  
  assert.ok(result.includes('Kysely'));
  assert.ok(result.includes('MysqlDialect'));
  assert.ok(result.includes('createPool'));
});

test('dbPluginTemplate - should generate Kysely template for SQLite', () => {
  const result = dbPluginTemplate(false, { queryBuilder: 'kysely', database: 'sqlite', orm: 'none' });
  
  assert.ok(result.includes('Kysely'));
  assert.ok(result.includes('SqliteDialect'));
  assert.ok(result.includes('better-sqlite3'));
});

test('dbPluginTemplate - should generate null template when no ORM and no query builder', () => {
  const result = dbPluginTemplate(false, { queryBuilder: 'none', orm: 'none' });
  
  assert.ok(result.includes('fastify.decorate(\'db\', null)'));
  assert.ok(result.includes('fastify-plugin'));
});