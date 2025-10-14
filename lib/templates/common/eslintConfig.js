export function eslintConfigTemplate(kind, isTS) {
  if (isTS) {
    const base = {
      root: true,
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'promise', 'import', 'n'],
      env: { node: true, es2022: true },
      parserOptions: { sourceType: 'module' },
      extends: kind === 'prettier'
        ? ['standard-with-typescript', 'prettier']
        : ['standard-with-typescript']
    };
    return 'module.exports = ' + JSON.stringify(base, null, 2) + '\n';
  }

  const base = {
    root: true,
    env: { node: true, es2022: true },
    parserOptions: { sourceType: 'module' },
    extends: kind === 'prettier'
      ? ['standard', 'prettier']
      : ['standard']
  };
  return 'module.exports = ' + JSON.stringify(base, null, 2) + '\n';
}
