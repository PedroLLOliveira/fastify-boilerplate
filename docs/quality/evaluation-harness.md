# Harness de avaliações

## Convenção de caso

Cada caso em `evals/cases/` deve declarar:

- profile e versão testados;
- pré-requisitos;
- comando/ação;
- assertions;
- artefatos esperados;
- sinais de falha;
- limpeza necessária;
- vínculo com spec e critérios de aceite.

## Matriz mínima de CI

```text
lint do gerador
→ testes unitários
→ contrato dos profiles suportados
→ geração minimal
→ instalação minimal
→ test/typecheck/build minimal
→ health smoke minimal
→ geração modular
→ ...
```

## Anti-padrões

- snapshot sem execução da app;
- testar template isolado e chamar isso de integração;
- permitir que documentação diga “rode X” quando X não está no package gerado;
- usar rede/versões flutuantes sem cache ou lockfile nas evals;
- aprovar profile “experimental” sem sinalização explícita para usuário.
