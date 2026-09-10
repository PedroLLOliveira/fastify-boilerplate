/**
 * Monta um ProfileDefinition a partir de uma arquitetura-base + uma
 * capability de persistência, em vez de um manifesto de arquivos escrito à
 * mão por combinação. É o que torna "profile" uma receita (arquitetura +
 * persistência) e não mais um blob — ver architectures/ e capabilities/.
 *
 * @param {object} params
 * @param {string} params.id
 * @param {import('./types.d.ts').ProfileDefinition['architecture']} params.architecture
 * @param {import('./types.d.ts').ProfileDefinition['persistence']} params.persistence
 * @param {import('./types.d.ts').ProfileDefinition['status']} params.status
 * @param {string[]} params.checks
 * @param {string[]} [params.defaultTraits]
 * @param {import('./types.d.ts').DependencyManifest} params.baseDependencies Dependências da arquitetura, sem a persistência.
 * @param {import('./types.d.ts').FileManifest[]} params.baseFiles Arquivos da arquitetura, sem a persistência.
 * @param {import('./types.d.ts').Capability} params.capability
 * @returns {import('./types.d.ts').ProfileDefinition}
 */
export function composeProfile({
  id,
  architecture,
  persistence,
  status,
  checks,
  defaultTraits,
  baseDependencies,
  baseFiles,
  capability
}) {
  return {
    id,
    architecture,
    persistence,
    status,
    checks,
    defaultTraits,
    dependencies: {
      runtime: [...baseDependencies.runtime, ...(capability.dependencies?.runtime || [])],
      dev: [...baseDependencies.dev, ...(capability.dependencies?.dev || [])]
    },
    files: [...baseFiles, ...(capability.files || [])],
    scripts: { ...(capability.scripts || {}) },
    testFiles: capability.testFiles
  };
}
