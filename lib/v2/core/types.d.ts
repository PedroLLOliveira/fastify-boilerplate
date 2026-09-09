export type FileManifest = {
  path: string;
  template?: string;
  content?: string;
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
};

export type TraitDefinition = {
  id: string;
  dependencies?: Partial<DependencyManifest>;
  files?: FileManifest[];
  scripts?: Record<string, string>;
};
