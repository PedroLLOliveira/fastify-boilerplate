import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { prismaSchemaTemplate } from '../lib/templates/common/prismaSchema.js';

test('prismaSchemaTemplate - should generate Prisma schema for PostgreSQL', () => {
  const result = prismaSchemaTemplate('postgres');
  
  assert.ok(result.includes('provider = "postgresql"'));
});

test('prismaSchemaTemplate - should generate Prisma schema for MySQL', () => {
  const result = prismaSchemaTemplate('mysql');
  
  assert.ok(result.includes('provider = "mysql"'));
});

test('prismaSchemaTemplate - should generate Prisma schema for MongoDB', () => {
  const result = prismaSchemaTemplate('mongodb');
  
  assert.ok(result.includes('provider = "mongodb"'));
});

test('prismaSchemaTemplate - should generate Prisma schema for SQLite', () => {
  const result = prismaSchemaTemplate('sqlite');
  
  assert.ok(result.includes('provider = "sqlite"'));
});