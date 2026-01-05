export function knexFileTemplate(answers) {
  const client =
    answers.database === 'mysql'
      ? 'mysql2'
      : answers.database === 'sqlite'
        ? 'sqlite3'
        : 'pg';

  return `/**
 * Referências oficiais (Knex):
 * - Migrations (CLI): https://knexjs.org/guide/migrations
 * - Query Builder: https://knexjs.org/guide/query-builder.html
 */

// Garante que DATABASE_URL vindo do .env esteja disponível quando rodar via CLI (knex ...).
require('dotenv').config();

const connection = process.env.DATABASE_URL;

if (!connection) {
  throw new Error('DATABASE_URL não configurado. Crie um .env (ou exporte a variável) antes de rodar migrations/seeds.');
}

module.exports = {
  client: '${client}',
  connection,
  migrations: {
    tableName: 'knex_migrations',
    directory: './db/migrations'
  },
  seeds: {
    directory: './db/seeds'
  },
  useNullAsDefault: ${answers.database === 'sqlite' ? 'true' : 'false'}
};
`;
}
