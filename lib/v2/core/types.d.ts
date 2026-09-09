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
