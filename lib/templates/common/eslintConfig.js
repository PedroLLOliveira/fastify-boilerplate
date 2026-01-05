export function eslintConfigTemplate(kind, isTS) {
  // Mantemos saída em CJS porque o projeto gerado é ESM ("type":"module")
  if (isTS) {
    const base = {
      root: true,
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'promise', 'import', 'n'],
      env: { node: true, es2022: true },
      parserOptions: {
        sourceType: 'module',
        // Necessário para configs "with-typescript" (type-aware linting)
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      },
      extends: kind === 'prettier'
        ? ['standard-with-typescript', 'prettier']
        : ['standard-with-typescript'],
      ignorePatterns: ['dist/', 'node_modules/']
    };

    return 'module.exports = ' + JSON.stringify(base, null, 2) + '\n';
  }

  const base = {
    root: true,
    env: { node: true, es2022: true },
    parserOptions: { sourceType: 'module' },
    plugins: ['promise', 'import', 'n'],
    extends: kind === 'prettier'
      ? ['standard', 'prettier']
      : ['standard'],
    ignorePatterns: ['node_modules/']
  };

  return 'module.exports = ' + JSON.stringify(base, null, 2) + '\n';
}
