# Roadmap de refatoração — Fastify Boilerplate v2

> **Status: concluído.** Este foi o roadmap de fundação da v2 (specs `000`–`007`, hoje em
> `specs/_archive/`). Todas as fases abaixo foram implementadas — os 4+ profiles existem, a v1
> mencionada na Fase 0/7 foi removida por completo (não só deprecada) em `v2.1.0` via
> [ADR-004](../adr/ADR-004-remocao-v1.md), e um segundo roadmap ("Primeiro comando", documentado em
> `HANDOFF.md`, seções 8–14) fechou os gaps de contrato que este aqui não cobria (a promessa de
> `npm install && npm run dev` funcionar de fato, CI real, engine componentizada em capabilities).
> Mantido como histórico da decisão original; para o estado atual, use `HANDOFF.md` e
> `docs/product/support-matrix.md`.

## Norte

Criar uma biblioteca/CLI que gere projetos Fastify utilizáveis no primeiro comando, com profiles limitados, explícitos e cobertos de ponta a ponta.

## Fase 0 — Caracterização e congelamento da v1

**Objetivo:** transformar conhecimento implícito em baseline verificável.

Entregas:

- registrar as opções realmente expostas e as documentadas;
- criar testes de caracterização para comportamentos que serão preservados temporariamente;
- classificar cada opção atual: migrar, deprecar ou remover;
- corrigir somente defeitos críticos de release, sem ampliar escopo.

Saída: `docs/migration/current-baseline-findings.md` atualizado e ADR de escopo da v2.

## Fase 1 — Fundação de produto e harness

**Objetivo:** institucionalizar o ciclo spec-driven e a matriz de suporte.

Entregas:

- adicionar este harness ao repositório;
- adotar constituição, templates de spec e ADRs;
- definir política de Node, Fastify, TypeScript e dependências fixadas;
- criar estrutura interna `cli/core/profiles/testkit` sem migrar todos os templates.

Saída: primeiro profile pode ser implementado sem duplicar lógica.

## Fase 2 — Profile `minimal` TypeScript sem banco

**Objetivo:** estabelecer uma referência de qualidade completa.

Entregas:

- comando não interativo e wizard mínimo;
- `buildApp`, `server`, health, exemplo schema-first, testes e lint;
- README gerado e `.env.example` coerentes;
- eval de criação limpa, instalação, typecheck/build/test e `/health`.

Gate: só avançar quando o profile minimal estiver verde em CI e documentado.

## Fase 3 — Profile `modular` sem persistência

**Objetivo:** tornar o perfil padrão útil sem multiplicar complexidade.

Entregas:

- módulo exemplo `users` com rota, schema, handler e serviço;
- regras de dependência entre módulos;
- exemplos e avaliação CRUD usando armazenamento em memória/double;
- guia “quando usar modular”.

Gate: o módulo exemplo deve ser executável e demonstrar composição por plugins.

## Fase 4 — Persistência PostgreSQL por profiles nomeados

**Objetivo:** adicionar banco sem acoplamento implícito.

Entregas:

- primeiro profile `modular-postgres-kysely`;
- plugin de DB, configuração, health/readiness separados, migrations e cleanup;
- eval com banco efêmero/serviço de CI;
- catálogo de versões e políticas de upgrade.

Decisão: `postgres-sequelize` entra apenas como profile de compatibilidade se a demanda justificar manutenção adicional.

## Fase 5 — Perfis MVC e Clean

**Objetivo:** oferecer exemplos completos, não apenas pastas vazias.

Entregas:

- mesma feature de referência (Users) implementada nos dois perfis;
- exemplos de boundaries, testes e fontes;
- eval de geração por profile;
- comparação objetiva “quando usar / quando não usar”.

Gate: nenhuma arquitetura é anunciada como produção antes da mesma cobertura de contrato do modular.

## Fase 6 — Documentação, examples e DX

**Objetivo:** transformar o repositório em produto ensinável.

Entregas:

- exemplos executáveis e documentação de origem;
- CLI help, README e migration guide alinhados;
- Dev Container opcional testado;
- templates de CI opcionais, sem forçar publicação/deploy;
- troubleshooting por profile.

## Fase 7 — Release v2 e deprecação v1

**Objetivo:** publicar com transição segura.

Entregas:

- changelog de breaking changes;
- guia de migração;
- pacote verificado antes de publicação;
- janelas de deprecação e remoção;
- telemetry opt-in somente se houver uma decisão explícita de privacidade.

## Ordem de prioridade

1. confiabilidade da geração;
2. contrato e testes;
3. profile modular útil;
4. banco de dados;
5. variedade de arquiteturas e conveniências.

Não inverter essa ordem. Mais opções sem evals só aumentam suporte aparente e defeitos reais.
