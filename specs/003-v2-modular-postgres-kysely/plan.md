# Plano — V2 Modular Postgres Kysely Profile

## Arquitetura de Dados (Data Access Layer)

A especificação obriga o isolamento do Kysely da camada HTTP. O fluxo de dados será unidirecional:
1. `Handler`: Avalia o request e extrai body/params.
2. `Service`: Implementa negócio e delega para persistência.
3. `Repository`: Exporta métodos que usam a instância do Kysely para falar com o Banco de Dados.

## Estratégia do Template Engine

- A engine V2 (`renderProfile`) permanecerá inalterada, pois sua abstração lida nativamente com novos profiles.
- As dependências específicas do Node (`pg` e `kysely`) serão inseridas no `catalog.js` com o teto de versão fixado.
- Reutilizaremos o arquivo base de `app.ts` do profile Modular, mas precisaremos alterá-lo localmente dentro da pasta de templates deste profile para incluir o registro do plugin global `db-pool`. A regra de zero-replace (RegEx) significa que o profile Kysely deve possuir seu próprio `app.ts` integral, contendo os imports necessários.

## Ciclo de Vida da Conexão e o Plugin Fastify

O `pg` usa um pool de conexões. O Fastify precisa fechar ativamente o pool quando o servidor é derrubado (SIGTERM/SIGINT) em produção.
Criaremos `src/plugins/db-pool.ts` (Fastify Plugin):
- Valida o `DATABASE_URL` oriundo da configuração.
- Instancia o `Pool` nativo do `pg`.
- Fornece essa instância para a configuração centralizada do Kysely.
- Atrela `app.addHook('onClose')` fechando todas as conexões simultâneas do pool.

## O Teste Eval End-to-End

O maior desafio técnico será executar os evals deste profile nos pipelines de Integração Contínua ou Local:
A eval precisará testar as chamadas reais contra um Postgres. O script `eval-modular-pg.test.js`:
- Irá criar o ambiente temporário;
- Irá rodar `docker compose up -d` na pasta do projeto gerado (usando o docker-compose.yml injetado pelo boilerplate);
- Irá esperar a porta de rede do BD estar disponível (tcp-wait);
- Executará `npm run db:migrate`;
- Validará o teste da API.
- Executará o teardown: `docker compose down -v`.
