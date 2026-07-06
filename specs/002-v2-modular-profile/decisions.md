# Decisões — V2 Modular Profile

## 1. Módulos Isolados (Sem auto-loading no gerador)

**Contexto**: Em geradores tradicionais ou versões V1 deste repositório, utilizava-se substituição de string (Regex) para injetar as rotas de acordo com a arquitetura no `server.ts`.
**Decisão**: O `app.ts` gerado pela Spec 002 importará declarativamente e estaticamente os arquivos de roteamento (`modules/users/users.route.js` e `modules/health/health.route.js`).
**Motivo**: Garante clareza, validação rigorosa de TypeCheck pelo compilador TypeScript desde o momento 0 e atende ao requisito fundamental da V2 de evitar manipulação de AST ou replace textual frágil pós-geração.

## 2. Padrão de 4 Camadas por Módulo (Route, Schema, Handler, Service)

**Contexto**: Há uma infinidade de padrões para Node.js, oscilando de um monólito até Clean Architecture com Inversão de Controle rigorosa.
**Decisão**: Definimos um padrão pragmático e idiomático, separando estritamente a camada de framework (Route + Handler), a camada de validação e serialização JSON (Schema) e a camada de negócios pura (Service).
**Motivo**: Impede o inchaço de funções de rota, mantendo o profile testável e permitindo escalabilidade para times grandes sem o overhead de injeção de dependências prematura.

## 3. Mock em Memória no Service (Ausência de Persistência)

**Contexto**: O módulo `users` normalmente teria um `users.repository.ts` acoplado a um banco de dados real.
**Decisão**: O profile `modular` manterá os dados mockados no `users.service.ts` usando arrays em memória (e.g. `[{ id: 1, name: "Alice" }]`).
**Motivo**: A Spec 002 é especificamente sobre organizar o *roteamento e os domínios*. Não se deve misturar isso com ORMs para preservar o determinismo do baseline gerado (que atualmente independe de containers Docker e credenciais para rodar os evals). Adições de infraestrutura virão em Specs dedicadas (Kysely, etc.).
