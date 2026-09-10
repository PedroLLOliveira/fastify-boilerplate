export type FileManifest = {
  path: string;
  template?: string;
  content?: string;
  /** Modo POSIX do arquivo (ex.: 0o755 para hooks executáveis como o do Husky). */
  mode?: number;
};

export type DependencyManifest = {
  runtime: string[];
  dev: string[];
};

export type ProfileDefinition = {
  id: string;
  architecture: 'minimal' | 'modular' | 'mvc' | 'clean';
  persistence: 'none' | 'postgres-kysely' | 'postgres-sequelize';
  status: 'experimental' | 'supported' | 'deprecated';
  dependencies: DependencyManifest;
  files: FileManifest[];
  checks: string[];
  defaultTraits?: string[];
  scripts?: Record<string, string>;
  /**
   * Arquivos de teste, mantidos fora de `files` porque a sintaxe depende do
   * trait de teste escolhido (node:test vs. Vitest). Chave = id do trait
   * (`node-native-test` | `vitest`); a engine escolhe o conjunto certo.
   */
  testFiles?: Record<string, FileManifest[]>;
};

export type TraitDefinition = {
  id: string;
  dependencies?: Partial<DependencyManifest>;
  files?: FileManifest[];
  scripts?: Record<string, string>;
};

/**
 * Uma capability é uma peça de persistência (ou, no futuro, infra) composta
 * pela arquitetura em vez de reescrita por profile. Existe para que
 * "modular + Postgres" pare de exigir um arquivo de 400 linhas por ORM —
 * hoje ~80% desse arquivo (rotas, schemas, handler, error/not-found
 * handler, docker-compose base) é idêntico entre kysely e sequelize; a
 * capability carrega só a parte que de fato muda: client de banco, plugin
 * fastify, repositório, migrations, seed e o fragmento que o app.ts da
 * arquitetura injeta.
 */
export type Capability = {
  id: string;
  kind: 'persistence' | 'infra';
  dependencies?: Partial<DependencyManifest>;
  /** Arquivos que só essa capability conhece (database.ts, repositório, migrations, seed...). */
  files?: FileManifest[];
  scripts?: Record<string, string>;
  /** Mesma ideia de `ProfileDefinition.testFiles`: um conjunto por trait de teste. */
  testFiles?: Record<string, FileManifest[]>;
  /** Mesclado em `services` no docker-compose.yml da arquitetura, quando ela tiver um. */
  composeServices?: Record<string, unknown>;
  /** Ponto de extensão que a arquitetura injeta no app.ts que ela monta. */
  appFragment?: {
    /** Linhas de import adicionadas logo abaixo do import do Fastify. */
    imports?: string[];
    /** Vira `const env = loadEnv();` (ou equivalente) antes dos handlers, se true. */
    needsEnv?: boolean;
    /** Linha(s) de `await app.register(...)` na seção de lifecycle. */
    registration?: string;
  };
};
