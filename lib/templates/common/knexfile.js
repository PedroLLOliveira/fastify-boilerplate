export function knexFileTemplate(answers) {
  const client = answers.database === 'mysql' ? 'mysql2' : (answers.database === 'sqlite' ? 'sqlite3' : 'pg');
  return `/**
 * Referências oficiais (Knex):
 * - Migrations (CLI): https://knexjs.org/guide/migrations
 * - Query Builder: https://knexjs.org/guide/query-builder.html
 */
module.exports = {
  client: '${client}',
  connection: process.env.DATABASE_URL,
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
