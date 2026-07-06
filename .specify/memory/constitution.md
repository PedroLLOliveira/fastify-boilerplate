# Constituição do fastify-boilerplate

## I. Produto gerado é produto real

A aplicação gerada deve instalar, compilar, iniciar e responder aos endpoints documentados. Templates não são “só texto”; são código de produção para milhares de projetos potenciais.

## II. Contratos antes de opções

Nenhuma opção será anunciada no CLI ou README sem contrato completo de capabilities, dependências, arquivos, runtime, exemplo e eval.

## III. TypeScript e Fastify idiomático

A v2 prioriza TypeScript, ESM, Fastify v5 e o modelo de plugins/encapsulamento do Fastify. Decisões de compatibilidade precisam ser explícitas e versionadas.

## IV. Especificação antes de implementação

Toda alteração funcional relevante nasce de uma spec. Specs descrevem intenção; planos registram arquitetura; tarefas fatiam execução; evals comprovam resultado.

## V. Testar a geração de verdade

Testes unitários são necessários, mas insuficientes. Cada profile suportado precisa de geração em diretório limpo e smoke test da app resultante.

## VI. Exemplos com fonte e execução

Exemplos devem ser pequenos, executáveis e rastreáveis a fontes primárias. A fonte do framework não substitui a explicação da decisão local do boilerplate.

## VII. Segurança e reversibilidade

Agentes não publicam, não manipulam secrets e não executam ações irreversíveis sem aprovação humana. Mudanças que aumentam superfície de supply chain exigem análise adicional.

## Governança

Uma decisão que viola esta constituição exige ADR aprovada antes da implementação. Quando rapidez e confiabilidade entrarem em conflito, preservar o contrato publicado é prioridade.
