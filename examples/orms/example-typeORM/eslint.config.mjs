import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,ts}'],
    languageOptions: { globals: globals.node },
    rules: {
      'constructor-super': 'error',
      'no-console': 'warn',
      'semi': ['error', 'always'],
      'curly': ['error', 'all'],
      'quotes': ['warn', 'single'],
      'indent': ['error', 4],
      'no-var': 'error',
      'prefer-const': 'warn',
      'arrow-parens': ['error', 'always'],
      'object-curly-spacing': ['warn', 'always'],
      'no-debugger': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'eqeqeq': ['error', 'always']
    }
  }
];