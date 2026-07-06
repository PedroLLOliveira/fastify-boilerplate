# Aceite — Fundação v2: profile minimal TypeScript

Este documento serve para evidenciar a conclusão técnica de cada critério de aceite (CA) contido na Spec 001.

| Critério | Descrição | Evidência / Status |
|---|---|---|
| CA-001 | CLI aceita argumentos não interativos (`--profile`) e direciona ao motor v2 isolado. | pendente |
| CA-002 | A árvore gerada coincide exatamente com a tabela de arquivos estrita da spec. | pendente |
| CA-003 | O Package.json gerado injeta o catálogo de dependências com versões semver fixadas ("latest" removido). | pendente |
| CA-004 | Conflitos ESM/CJS no `tsconfig.json` e `package.json` resolvidos. O build transpila corretamente NodeNext. | ✅ Aprovado (Testado na engine via tsc sem erros) |
| CA-005 | O profile gerado contém testes nativos (node --test) gerados, os quais passam na sua própria stack (`app.inject`). | ✅ Aprovado (Testado localmente com node --test health.test.ts) |
| CA-006 | Eval end-to-end implementada executa o pipeline, incluindo geração e testes limpos. | ✅ Aprovado (Script `eval-minimal.test.js` cobre todo o loop) |
| CA-007 | README base documenta adequadamente a spec minimal e retira referências instáveis do frontend atual. | ✅ Aprovado (README foi atualizado clarificando V2) |

**Aprovação**: *(A ser preenchida na etapa de convergência, quando os testes e merges correspondentes finalizarem)*.
