export function knexPluginTemplate(isTS, answers) {
  return `/**
 * Referências:
 * - Knex Guide (instalação/config): https://knexjs.org/guide/
 * - Fastify Decorators: https://fastify.io/docs/latest/Reference/Decorators/
 */
import fp from 'fastify-plugin';
import knex from 'knex';

export default fp(async (fastify) => {
  const client = '${answers.database === 'mysql' ? 'mysql2' : answers.database === 'sqlite' ? 'sqlite3' : 'pg'}';
  const db = knex({
    client,
    connection: process.env.DATABASE_URL,
    // pool padrão do Knex (min/max) para PG/MySQL; 1 p/ sqlite. :contentReference[oaicite:2]{index=2}
    migrations: { directory: 'db/migrations' },
    seeds: { directory: 'db/seeds' },
    useNullAsDefault: ${answers.database === 'sqlite' ? 'true' : 'false'}
  });

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await db.destroy();
  });
});
`;
}
