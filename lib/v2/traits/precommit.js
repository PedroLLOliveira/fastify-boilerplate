/** @type {import('../core/types.d.ts').TraitDefinition} */
export const huskyLintStagedTrait = {
  id: 'husky-lint-staged',
  dependencies: {
    dev: ['husky', 'lint-staged']
  },
  scripts: {
    prepare: 'husky'
  },
  files: [
    {
      path: '.husky/pre-commit',
      content: `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
`
    },
    {
      path: '.lintstagedrc',
      content: `{
  "*.{js,ts}": [
    "eslint --fix"
  ]
}`
    }
  ]
};
