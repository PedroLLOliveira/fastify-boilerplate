// Compartilhado entre capabilities que rodam sobre Postgres (kysely,
// sequelize) — não entre arquiteturas. `.env.example`, `docker-compose.yml`
// e `config/env.ts` são específicos de QUAL infraestrutura a persistência
// precisa, não da arquitetura HTTP por cima; uma capability de MySQL, por
// exemplo, traria seu próprio compose (imagem, envs, healthcheck diferentes)
// em vez de reusar este módulo. Kysely e Sequelize compartilham porque as
// duas literalmente sobem o mesmo Postgres — a duplicação aqui seria
// acidental, não estrutural.

export const envFileContent = `PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://devuser:devpassword@localhost:5432/fastify_dev
`;

export const configEnvContent = `import 'dotenv/config';

export function loadEnv() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in environment variables');
  }
  return {
    PORT: process.env.PORT || '3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL
  };
}
`;

export const dockerComposeContent = `services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: fastify_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devuser -d fastify_dev"]
      interval: 2s
      timeout: 3s
      retries: 15

volumes:
  postgres_data:
`;
