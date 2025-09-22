export function eslintConfigTemplate(kind, isTS) {
  if (isTS) {
    const base = {
      root: true,
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      env: { node: true, es2022: true },
      parserOptions: { sourceType: 'module' },
      extends: kind === 'prettier'
        ? ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier']
        : ['eslint:recommended', 'plugin:@typescript-eslint/recommended']
    };
    return 'module.exports = ' + JSON.stringify(base, null, 2) + '\n';
  }

  const base = {
    root: true,
    env: { node: true, es2022: true },
    parserOptions: { sourceType: 'module' },
    extends: kind === 'prettier'
      ? ['eslint:recommended', 'prettier']
      : ['eslint:recommended']
  };
  return 'module.exports = ' + JSON.stringify(base, null, 2) + '\n';
}
