# Arquitetura-alvo da v2

> Este documento descrevia, antes da implementação, uma proposta de monorepo com `npm workspaces`.
> A implementação real ficou mais simples — um único pacote (`lib/v2/`), sem workspaces — mas
> preservou a separação de responsabilidades que era o ponto essencial da proposta. A seção
> "Layout real" abaixo é a fonte de verdade; a proposta original fica só como registro da decisão.

## Layout real (`lib/v2/`)

```text
lib/v2/
  core/
    catalog.js          # versões fixas de dependências (sem "latest")
    engine.js            # renderProfile(profile, traits, outDir, projectName)
    compose.js            # composeProfile({ architecture, capability, ... }) — arquitetura + capability
    readme.js             # gera o README.md do projeto a partir dos arquivos/scripts finais
    slug.js               # normaliza o projectName para um name de package.json válido
    types.d.ts            # ProfileDefinition, TraitDefinition, Capability
  architectures/
    modular-persisted.js  # núcleo HTTP compartilhado entre capabilities de persistência do modular
  capabilities/
    postgres-kysely.js
    postgres-sequelize.js
    postgres-shared.js    # infra comum às duas (.env.example, docker-compose.yml, config/env.ts)
    cors.js                # capability de plataforma (kind: 'platform'), sem infra nem env
  profiles/
    minimal.js
    modular.js
    modular-cors.js
    modular-pg-kysely.js
    modular-postgres-sequelize.js
    mvc.js
    clean.js
  templates/
    minimal/index.js
    modular/index.js
    mvc/index.js
    clean/index.js        # os profiles Postgres e o modular-cors não têm templates/ próprio
  traits/
    linter.js              # ESLint básico/Prettier
    precommit.js            # Husky + lint-staged
    testing.js               # node:test nativo / Vitest
```

`bin/cli.js` resolve o profile por um registro declarativo (`PROFILE_LOADERS: Record<id, () =>
Promise<ProfileDefinition>>`) — não por uma cadeia de `if/else`. CLI não decide conteúdo de
template; templates não escondem dependências; profile não faz I/O direto; eval não replica
manualmente as regras do core.

## Tipos reais (ver `lib/v2/core/types.d.ts`)

```ts
type ProfileDefinition = {
  id: string;
  architecture: 'minimal' | 'modular' | 'mvc' | 'clean';
  persistence: 'none' | 'postgres-kysely' | 'postgres-sequelize';
  status: 'experimental' | 'supported' | 'deprecated';
  dependencies: DependencyManifest;
  files: FileManifest[];
  checks: string[];
  defaultTraits?: string[];
  scripts?: Record<string, string>;
  testFiles?: Record<string, FileManifest[]>; // chave = id do trait de teste
};

// Uma capability é composta pela arquitetura via core/compose.js — introduzida
// para eliminar a duplicação entre os dois profiles Postgres (~80% medido antes
// do refactor), e estendida na Fase 5 para um terceiro `kind` (platform).
type Capability = {
  id: string;
  kind: 'persistence' | 'infra' | 'platform';
  dependencies?: Partial<DependencyManifest>;
  files?: FileManifest[];
  scripts?: Record<string, string>;
  testFiles?: Record<string, FileManifest[]>;
  composeServices?: Record<string, unknown>; // declarado; merge de 2+ capabilities de infra no mesmo profile ainda não implementado
  appFragment?: { imports?: string[]; needsEnv?: boolean; registration?: string };
};
```

## Pipeline de geração

```text
CLI input
  → normalize/validate
  → resolve profile ID
  → load capabilities
  → render file manifest
  → write project
  → write package metadata
  → print next steps
  → eval verifies result in CI
```

## Por que profiles nomeados

Evita uma combinação cartesiana frágil. Em vez de declarar que “qualquer arquitetura funciona com qualquer ORM”, a ferramenta publica combinações reais, como `modular-postgres-kysely`, cada uma com exemplo e eval.

## Contrato de composição Fastify

A app gerada deve separar composição de execução:

```ts
// src/app.ts
export async function buildApp() {
  const app = Fastify({ logger: true });
  await app.register(healthRoutes);
  return app;
}

// src/server.ts
const app = await buildApp();
await app.listen({ host: '0.0.0.0', port });
```

Essa decisão facilita teste por `app.inject()` e deixa o processo de rede fora das rotas. Veja as fontes [F-FASTIFY-PLUGINS] e [F-FASTIFY-TESTING].
