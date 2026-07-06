# Contrato do gerador

## Forma do contrato

Cada profile publicado é descrito por sete partes obrigatórias.

| Camada | Pergunta que responde | Exemplo |
|---|---|---|
| Entrada | O que o usuário escolhe? | `--profile modular-postgres-kysely` |
| Validação | O que é aceito ou rejeitado? | profile existe e Node é compatível |
| Capabilities | O que o profile oferece? | DB, migrations, módulos, schemas |
| Dependências | O que precisa ser instalado? | versões fixadas e justificadas |
| Arquivos | O que será criado? | manifest com caminho e renderizador |
| Runtime | Como a app se comporta? | `/health`, conexão, shutdown |
| Evidência | Como provar que funciona? | unit, contract, generation, runtime eval |

## Invariantes de integridade

- Imports gerados precisam ter arquivo e dependency correspondentes.
- Cada script gerado precisa existir e ser documentado.
- `.env.example` deve corresponder à configuração realmente lida.
- Um profile deve declarar se cria banco, migrations, seed, OpenAPI e Dev Container.
- Se uma capability é opcional, sua ausência deve produzir projeto válido, não import quebrado.

## Exemplo de manifesto conceitual

```ts
const minimal: ProfileDefinition = {
  id: 'minimal',
  architecture: 'minimal',
  persistence: 'none',
  status: 'supported',
  dependencies: { runtime: ['fastify'], dev: ['typescript', 'tsx'] },
  files: [
    { path: 'src/app.ts', template: 'app' },
    { path: 'src/server.ts', template: 'server' },
    { path: 'src/routes/health.ts', template: 'health' },
  ],
  checks: ['typecheck', 'unit', 'generation-eval', 'health-smoke'],
};
```

O código é ilustrativo. A implementação final deve usar tipos e catálogo central reais.
