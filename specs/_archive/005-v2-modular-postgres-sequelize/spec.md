# 005 — V2 Modular Postgres Sequelize Profile

## Problema
Usuários da V1 do boilerplate dependem massivamente do ecossistema do Sequelize. Embora a arquitetura-alvo da V2 priorize a adoção progressiva de Query Builders tipados como o Kysely (`modular-postgres-kysely`), a base de usuários exige suporte para equipes que já dominam ou exigem o Sequelize como padrão de ORM interno em seus produtos. Precisamos oferecer um profile oficial `modular-postgres-sequelize` na V2 que mantenha a capacidade de utilizar a biblioteca legada, mas que a eleve aos novos padrões rigorosos arquiteturais da V2 (sem uso de replace textual em geradores, com avaliação real local, separação rígida de camadas e respeito ao Runtime Contract HTTP).

## Objetivo
Criar o profile `modular-postgres-sequelize` integrado de forma determinística ao gerador V2. O projeto gerado entregará a arquitetura modular com PostgreSQL e utilizará o ORM Sequelize, mantendo separação rígida entre rotas, handlers, services e repositórios. Deve também cumprir integralmente os Runtime Contracts (Spec 004), prevendo tratamento de erros específicos (ex: conflitos de unicidade) convertidos para domínios estáveis, sem expor as abstrações da biblioteca Sequelize para a camada de HTTP.

## Escopo
- Definição do comando: `--profile modular-postgres-sequelize`.
- Adoção das versões fixadas de bibliotecas e política de lockfile estrita.
- Contrato baseado unicamente em `DATABASE_URL`.
- Criação de um plugin Fastify exclusivo para o ciclo de vida do Sequelize, com encerramento das conexões no `app.close()`.
- Estratégia de Models, Migrations e Seed delegada nativamente às configurações do `sequelize-cli` (`.sequelizerc`).
- Adapter/Repository (`UserRepository`) como uma muralha isolando a infraestrutura de dados da camada de negócios.
- Tratamento explícito de falhas de unicidade, convertendo o `UniqueConstraintError` do Sequelize para uma classe de erro de domínio estável, devolvendo código HTTP previsível sem strings hardcoded frágeis.
- Compatibilidade absoluta com os contratos da Spec 004, contemplando timeout/catches em endpoints de readiness.
- Evals com instâncias reais de Postgres via Docker Compose.
- Geração de documentação referenciando as fontes oficiais utilizadas.

## Restrições (Fora de Escopo e Regras Estritas)
- **Não alterar** o profile `minimal`.
- **Não alterar** o profile `modular` sem banco.
- **Não alterar** o profile `modular-postgres-kysely`.
- **Não utilizar** o identificador `latest` nas dependências do projeto gerado.
- **Não permitir** a importação ou injeção de tipos e métodos do Sequelize (ex: `Model`) dentro de Handlers. O acoplamento HTTP com o banco é vetado.
- **Não criar** nenhuma camada ORM abstrata, monolítica ou genérica que vise unificar Kysely e Sequelize. Repositórios de ambos os profiles devem ser totalmente independentes.
- **Não usar** abordagens de _replace_ textual ou regex arbitrárias para montar ou modificar arquivos em runtime de gerador. Os templates precisam ser autossuficientes.
- **Não adicionar** ORMs concorrentes ou features fora do núcleo neste profile (Prisma, TypeORM, Swagger, autenticação, cache ou mensageria).

## Entregáveis do Spec
1. Árvore de arquivos do profile.
2. Fluxo HTTP → service → repository → Sequelize → Postgres.
3. Comparação com profile Kysely.
4. Análise de riscos e contenção de duplicações.
5. Decisões que exigem aprovação humana.
