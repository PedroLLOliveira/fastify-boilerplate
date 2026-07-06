# Spec 006: V2 Dev Tooling & Testing Composability

## 1. Contexto e Problema
A versão V1 do gerador permitia que o usuário personalizasse livremente a configuração de ferramentas auxiliares (Linter, Pre-commit) independentemente da arquitetura escolhida. Na transição para a V2, adotamos *Profiles Determinísticos* rígidos, que garantiram confiabilidade e testes end-to-end precisos (Spec 001 a 005), mas resultaram na perda da capacidade do usuário de desativar ou alterar ferramentas satélites (como optar por *Nenhum Linter* ou adicionar *Husky/Pre-commit*).

Criar um profile isolado para cada permutação (ex: \`modular-postgres-kysely-eslint-husky-vitest\`) causaria uma explosão combinatória insustentável.

## 2. Objetivos
Reintroduzir as opções de configuração do V1 na arquitetura V2 de forma elegante e 100% funcional.
- Permitir a escolha de **Linter** (Nenhum, ESLint Basic, ESLint + Prettier).
- Permitir a inclusão de hooks de **Pre-commit** (Husky + lint-staged).
- Permitir a escolha do **Framework de Testes** (Node Native Test [padrão] ou Vitest).
- Implementar um mecanismo de **Traits (Modificadores)** na engine V2 para plugar essas configurações sem violar a regra de *contrato determinístico*.

## 3. Escopo
- Alterar o `lib/v2/core/engine.js` para suportar composição de `Traits` sobre um `ProfileDefinition` base.
- Criar a pasta `lib/v2/traits/` para armazenar as manifestações de ferramentas isoladas.
- Expandir o Assistente CLI (V2 Custom) para perguntar sobre Linter, Pre-commit e Testes.
- Atualizar os testes de avaliação (E2E Evals) para validar perfis acoplados a traits.

## 4. O que não faz parte do escopo
- Adicionar ferramentas não suportadas pela V1.
- Criar testes unitários complexos para ferramentas satélites.

## 5. Critérios de Aceite
- [ ] O CLI interativo permite escolher Linter, Pre-commit e Framework de Teste sob a opção "Personalizado".
- [ ] A engine mescla as dependências dos *Traits* escolhidos com as dependências do profile base, sem conflitos.
- [ ] Arquivos satélites (`.prettierrc`, `.lintstagedrc`, `.husky/pre-commit`) são injetados na árvore de destino correta.
- [ ] As opções de scripts no `package.json` gerado (`test`, `lint`) se adaptam dinamicamente ao que foi escolhido.
- [ ] O comportamento continua testável E2E de forma previsível e sem intervenção manual.
