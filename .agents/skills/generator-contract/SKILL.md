---
name: generator-contract
description: Use ao alterar CLI, prompts, escolhas de perfil, dependências, templates, renderização, arquivos gerados ou compatibilidade do fastify-boilerplate.
---

# Contrato do gerador

## Modelo mental

O boilerplate não é uma coleção de templates soltos. Cada opção pública é um produto completo:

`entrada → resolução de capability → dependências → arquivos → runtime → testes → exemplo → documentação`

## Procedimento

1. Atualizar a matriz de suporte antes de exibir ou remover uma opção.
2. Definir uma chave de profile estável, por exemplo `modular-postgres-kysely`.
3. Resolver capabilities em um único ponto; templates não devem decidir dependências por conta própria.
4. Produzir uma árvore de arquivos declarativa e determinística.
5. Gerar `package.json` a partir de um catálogo de versões centralizado e fixado.
6. Criar uma eval que cria um projeto limpo e valida o perfil selecionado.
7. Atualizar exemplo e docs do profile.

## Invariantes

- Cada import gerado deve corresponder a arquivo e dependência gerados.
- Nenhum script documentado pode faltar no `package.json` gerado.
- Nenhuma dependência usada por template pode estar ausente.
- Opções desabilitadas não devem aparecer como suportadas no README.
- Um profile não pode depender de comportamento implícito de outro profile.
- A mesma entrada deve gerar a mesma árvore, salvo valores explícitos como nome do projeto e timestamp controlado.

## Checklist de mudança

- [ ] CLI e `--help`
- [ ] validação de argumentos
- [ ] capability/profile
- [ ] catálogo de dependências
- [ ] templates
- [ ] árvore de arquivos
- [ ] testes unitários
- [ ] eval de geração
- [ ] exemplo documentado
- [ ] matriz e changelog
