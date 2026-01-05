// envLoader.js
export function envLoaderTemplate(isTS) {
  return isTS
    ? `export function loadEnv(): {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
} {
  return {
    NODE_ENV: (process.env.NODE_ENV ?? 'development').trim(),
    PORT: (process.env.PORT ?? '3000').trim(),
    // Mantemos string vazia por padrão para não propagar undefined.
    // O plugin de DB decide se isso é obrigatório, conforme as escolhas do scaffold.
    DATABASE_URL: (process.env.DATABASE_URL ?? '').trim()
  };
}
`
    : `export function loadEnv() {
  return {
    NODE_ENV: (process.env.NODE_ENV ?? 'development').trim(),
    PORT: (process.env.PORT ?? '3000').trim(),
    // Mantemos string vazia por padrão para não propagar undefined.
    // O plugin de DB decide se isso é obrigatório, conforme as escolhas do scaffold.
    DATABASE_URL: (process.env.DATABASE_URL ?? '').trim()
  };
}
`;
}
