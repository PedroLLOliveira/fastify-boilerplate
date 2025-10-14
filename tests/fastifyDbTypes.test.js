import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import fastifyDbTypesTemplate from '../lib/templates/common/fastifyDbTypes.js';

test('fastifyDbTypesTemplate - should generate types for Prisma', () => {
  const result = fastifyDbTypesTemplate({ orm: 'prisma', qb: 'none' });
  
  assert.ok(result.includes('PrismaClient'));
  assert.ok(result.includes('db: PrismaClient'));
});

test('fastifyDbTypesTemplate - should generate types for Sequelize', () => {
  const result = fastifyDbTypesTemplate({ orm: 'sequelize', qb: 'none' });
  
  assert.ok(result.includes('Sequelize'));
  assert.ok(result.includes('db: Sequelize'));
});

test('fastifyDbTypesTemplate - should generate types for Mongoose', () => {
  const result = fastifyDbTypesTemplate({ orm: 'mongoose', qb: 'none' });
  
  assert.ok(result.includes('Connection'));
  assert.ok(result.includes('db: Connection'));
});

test('fastifyDbTypesTemplate - should generate types for Knex', () => {
  const result = fastifyDbTypesTemplate({ orm: 'none', qb: 'knex' });
  
  assert.ok(result.includes('Knex'));
  assert.ok(result.includes('db: Knex'));
});

test('fastifyDbTypesTemplate - should generate types for Kysely', () => {
  const result = fastifyDbTypesTemplate({ orm: 'none', qb: 'kysely' });
  
  assert.ok(result.includes('Kysely'));
  assert.ok(result.includes('db: Kysely<any>'));
});

test('fastifyDbTypesTemplate - should generate null types when no ORM and no QB', () => {
  const result = fastifyDbTypesTemplate({ orm: 'none', qb: 'none' });
  
  assert.ok(result.includes('db: any'));
});