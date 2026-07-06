# Exemplos de código por estrutura

## Regra de uso

Os exemplos são parte do contrato do produto. Cada um representa a mesma feature pequena — uma rota de usuários — para permitir comparar organização e responsabilidades sem confundir o leitor com regras de negócio diferentes.

| Documento | Profile | Uso recomendado |
|---|---|---|
| `01-minimal.md` | minimal | serviços pequenos e APIs diretas |
| `02-modular.md` | modular | padrão para novos projetos |
| `03-mvc.md` | MVC | compatibilidade/didática |
| `04-clean.md` | Clean | domínios com regras e integrações complexas |

## Convenções comuns

- `buildApp()` compõe plugins e rotas.
- `server.ts` apenas inicia o processo.
- schemas descrevem entrada e saída.
- handlers não acessam banco diretamente; delegam para serviço ou caso de uso.
- testes de rota usam `app.inject()`.

As APIs de Fastify usadas nos exemplos têm referência no catálogo: [F-FASTIFY-PLUGINS], [F-FASTIFY-VALIDATION] e [F-FASTIFY-TESTING].
