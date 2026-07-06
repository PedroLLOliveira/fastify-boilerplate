---
name: quality-evals
description: Use para definir, implementar ou executar testes do gerador, testes da aplicação gerada, snapshots de árvore, smoke tests e gates de qualidade.
---

# Estratégia de qualidade e evals

## Pirâmide necessária

1. **Unitários do gerador**: parsing de argumentos, perfil, dependencies, renderers e validação.
2. **Contrato de arquivos**: árvore e conteúdo crítico para cada profile.
3. **Geração real**: CLI cria projeto em diretório temporário sem interação.
4. **Runtime da app gerada**: instala dependências, typecheck/build e testa `/health` e rota exemplo com `app.inject()` ou processo controlado.
5. **Documentação**: scripts, opções e fontes são verificados contra os contratos.

## Critérios de uma eval forte

- começa em diretório vazio;
- usa argumentos não interativos determinísticos;
- não depende de rede fora da etapa explícita de instalação;
- falha se houver import sem arquivo, import sem dependência ou script inexistente;
- preserva artefatos de falha suficientes para diagnóstico;
- cobre ao menos um caminho feliz e uma seleção inválida.

## Gate de release

Nenhum profile é promovido para “suportado” sem uma eval verde em plataforma limpa.
