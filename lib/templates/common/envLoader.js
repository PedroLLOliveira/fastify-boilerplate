// envLoader.js
export function envLoaderTemplate(isTS) {
  return isTS
    ? `export function loadEnv(): { NODE_ENV: string; PORT: string; DATABASE_URL: string } {
  return {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: process.env.PORT ?? '3000',
    DATABASE_URL: process.env.DATABASE_URL ?? ''
  };
}
`
    : `export function loadEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: process.env.PORT ?? '3000',
    DATABASE_URL: process.env.DATABASE_URL ?? ''
  };
}
`;
}
