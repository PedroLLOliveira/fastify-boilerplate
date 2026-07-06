# 000 — Visão da plataforma v2

## Problema

A v1 mistura promessa pública e comportamento disponível. O CLI, os templates, o `package.json` gerado, os exemplos e o README podem divergir, o que torna difícil confiar no boilerplate como base de produção.

## Visão

A v2 será uma plataforma de geração de APIs Fastify com profiles explicitamente suportados. Cada profile poderá ser criado de forma não interativa, terá contrato de capabilities, exemplo documentado, fonte técnica e avaliação end-to-end.

## Usuários

- desenvolvedor que quer começar uma API com setup consistente;
- time que precisa padronizar kickoffs;
- mantenedor que adiciona novos profiles sem quebrar combinações existentes;
- agente de IA que precisa navegar o repositório com previsibilidade.

## Objetivos

- oferecer um caminho “funciona ao sair da caixa”;
- reduzir a explosão combinatória por matriz de suporte gradual;
- tornar exemplos parte do produto testado;
- permitir evolução baseada em specs e ADRs;
- ser utilizável no Antigravity, Cursor, Claude Code, Codex e VS Code por meio de artefatos portáveis.

## Fora de escopo inicial

- suportar todos os ORMs e bancos disponíveis no ecossistema Node;
- criar uma plataforma SaaS, painel visual ou marketplace;
- manter compatibilidade infinita com todas as estruturas antigas;
- usar IA em runtime da aplicação gerada.

## Requisitos de produto

- RP-001: o CLI deve ter modo não interativo e interativo.
- RP-002: cada profile exibido deve ter uma eval verde.
- RP-003: cada profile deve gerar documentação inicial e um exemplo executável.
- RP-004: o usuário deve conseguir identificar versão de Node, Fastify e contrato de compatibilidade.
- RP-005: exemplos devem apontar para fontes primárias e ADRs locais.

## Métricas de sucesso

- 100% dos profiles oficialmente suportados passam em geração limpa e smoke test.
- 0 imports sem dependência ou arquivo em profiles suportados.
- 0 opções documentadas que não sejam selecionáveis e avaliadas.
- redução mensurável do tempo para um usuário obter `/health` e uma feature exemplo funcionando.
