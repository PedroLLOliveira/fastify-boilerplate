export const catalog = {
  nodeLTS: '>= 20.0.0',
  dependencies: {
    fastify: '^5.0.0',
    'fastify-plugin': '^4.5.1',
    dotenv: '^16.4.5',
    pg: '^8.11.5',
    'pg-hstore': '^2.3.4',
    kysely: '^0.27.3',
    sequelize: '^6.37.3',
    '@fastify/cors': '^11.3.0'
  },
  devDependencies: {
    typescript: '^5.5.0',
    tsx: '^4.10.0',
    '@types/node': '^20.0.0',
    '@types/pg': '^8.11.6',
    eslint: '^8.57.0',
    '@typescript-eslint/eslint-plugin': '^7.10.0',
    '@typescript-eslint/parser': '^7.10.0',
    rimraf: '^5.0.5',
    'sequelize-cli': '^6.6.2',
    husky: '^9.0.11',
    'lint-staged': '^15.2.5',
    prettier: '^3.2.5',
    'eslint-config-prettier': '^9.1.0',
    vitest: '^1.6.0'
  }
};

/**
 * Retorna as versões fixadas a partir de um array de dependências
 * @param {string[]} deps 
 * @param {'dependencies' | 'devDependencies'} type 
 * @returns {Record<string, string>}
 */
export function resolveDependencies(deps, type = 'dependencies') {
  const result = {};
  for (const dep of deps) {
    if (!catalog[type][dep]) {
      throw new Error(`Dependência não encontrada no catálogo: ${dep}`);
    }
    result[dep] = catalog[type][dep];
  }
  return result;
}
