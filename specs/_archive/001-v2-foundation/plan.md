# Plano — Fundação v2: profile minimal TypeScript

## Design e Arquitetura

- **Catálogo Central**: Criar um dicionário isolado (arquivo) que define versões seguras em semver e validações rigorosas (proibição de `"latest"`).
- **Template Declarativo Estático**: O profile "minimal" não utilizará `String.replace()` para injeções dentro do `server.ts` ou `app.ts`. O core do app providenciará dependências injetadas pela árvore de import declarativa, prevenindo rotas órfãs.
- **Composição Desacoplada**: A aplicação deve separar a construção (`src/app.ts`) e o processo de rede HTTP (`src/server.ts`), assegurando viabilidade imediata para testes unitários.

## Estratégia de convivência entre v1 e v2

Para evitar que a refatoração cause quebras ou torne as mudanças difíceis de debugar, adotaremos um approach "via expressa isolada":
- A CLI atual (`bin/cli.js`) suportará flag não-interativa. Quando identificar `--profile` mapeada na v2 (ex: `--profile minimal`), irá contornar o wizard antigo e chamar o novo motor de renderização da V2 (sugestão de caminho: `packages/core`).
- O fluxo interativo legadão (`v1`) e profiles incompatíveis continuarão existindo até suas substituições definitivas, mantendo o retro-funcionamento isolado.

## Testes Unitários e de Contrato

- **Motor Core**: Validar a rejeição de inputs CLI inválidos. Validar conversão estrita do catálogo de deps.
- **Geração de Manifestos**: Validar que as interfaces `ProfileDefinition`, `CapabilitySet` e `FileManifest` respeitam a tipagem TS criada.

## Eval end-to-end (E2E)

A peça que faltava na v1. Implementaremos um `eval script` (usando node:test ou bash avançado na branch de CI) que garante que a app criada está inteira:
1. Emissão do gerador CLI apontando para um subdiretório em `/tmp`.
2. Verificação de presença correta dos manifests.
3. Execução in-loco de `npm install`.
4. Run de linter (`npm run lint`), tipagem/compilação (`npm run build`).
5. Run do teste nativo da própria aplicação (`npm test` via `app.inject`).
6. Validação de smoke test ligando o server e respondendo 200 de volta num curl script simples se aplicável, demonstrando saúde plena.

## Riscos

- **Evolução de Módulos (ESM vs CJS)**: Mitigado pela migração para TS module/moduleResolution usando `NodeNext` tanto em dev quanto build. 
- **Compatibilidade cruzada de workspaces v2**: Mitigada pela ausência inicial de symlinks complexos (será import simples durante incubação).
