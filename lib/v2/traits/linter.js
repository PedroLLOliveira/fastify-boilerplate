/** @type {import('../core/types.d.ts').TraitDefinition} */
export const eslintBasicTrait = {
  id: 'eslint-basic',
  dependencies: {
    dev: ['eslint', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser']
  },
  scripts: {
    lint: 'eslint .'
  },
  files: [
    {
      path: '.eslintrc.cjs',
      content: `module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  }
};`
    }
  ]
};

/** @type {import('../core/types.d.ts').TraitDefinition} */
export const eslintPrettierTrait = {
  id: 'eslint-prettier',
  dependencies: {
    dev: ['eslint', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser', 'prettier', 'eslint-config-prettier']
  },
  scripts: {
    lint: 'eslint .',
    format: 'prettier --write .'
  },
  files: [
    {
      path: '.eslintrc.cjs',
      content: `module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  }
};`
    },
    {
      path: '.prettierrc',
      content: `{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2
}`
    }
  ]
};
