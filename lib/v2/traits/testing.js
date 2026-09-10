/** @type {import('../core/types.d.ts').TraitDefinition} */
export const nodeNativeTestTrait = {
  id: 'node-native-test',
  dependencies: {
    dev: []
  },
  scripts: {
    test: 'NODE_ENV=test node --import tsx --test tests/*.test.ts'
  },
  files: []
};

/** @type {import('../core/types.d.ts').TraitDefinition} */
export const vitestTrait = {
  id: 'vitest',
  dependencies: {
    dev: ['vitest']
  },
  scripts: {
    test: 'NODE_ENV=test vitest run'
  },
  files: [
    {
      path: 'vitest.config.ts',
      content: `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts']
  }
});
`
    }
  ]
};
