# Arquitetura-alvo da v2

## Proposta de monorepo lógico

```text
packages/
  cli/                  # UX, argumentos, modo interativo e não interativo
  core/                 # profile registry, capabilities, manifests e renderer
  profiles/
    minimal/
    modular/
    mvc/
    clean/
  persistence/
    none/
    postgres-kysely/
    postgres-sequelize/
  testkit/              # helpers para gerar, instalar e verificar projects
examples/
  minimal/
  modular/
  mvc/
  clean/
evals/
  profiles/
docs/
specs/
```

O layout pode ser implementado em `npm workspaces` ou outro workspace aprovado por ADR. O ponto essencial não é a ferramenta, mas a separação: CLI não decide template; templates não escondem dependências; profile não faz I/O direto; eval não replica manualmente as regras do core.

## Tipos conceituais

```ts
interface ProfileDefinition {
  id: string;
  architecture: 'minimal' | 'modular' | 'mvc' | 'clean';
  persistence: 'none' | 'postgres-kysely' | 'postgres-sequelize';
  status: 'experimental' | 'supported' | 'deprecated';
  dependencies: DependencyManifest;
  files: FileManifest[];
  checks: EvalRequirement[];
}
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
