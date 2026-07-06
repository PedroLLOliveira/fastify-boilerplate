---
name: fastify-architecture
description: Use para criar ou revisar os perfis minimal, modular, MVC e clean que o gerador Fastify oferece.
---

# Perfis arquiteturais Fastify

## Princípio base

Fastify organiza aplicações naturalmente por plugins e encapsulamento. Perfis de arquitetura devem aproveitar esse modelo, sem fingir que uma estrutura de pastas substitui as fronteiras de dependência.

## Perfis

### minimal

Para serviços simples, POCs e APIs pequenas. Possui `app.ts`, `server.ts`, `plugins/`, `routes/`, schemas e testes de rota.

### modular

Perfil padrão. Cada módulo possui rota, schema, handler, serviço e repositório opcional. Módulos não importam detalhes internos uns dos outros; comunicação passa por contratos ou serviços expostos.

### mvc

Perfil didático/compatível para times que já trabalham com controllers e services. Deve evitar controllers com regra de negócio e models usados diretamente por rotas.

### clean

Perfil avançado para domínios que exigem isolamento de regras. Separar domínio, aplicação, adapters e composição. Não gerar esse perfil até que a mesma feature de exemplo esteja coberta ponta a ponta.

## Regras de Fastify

- Inicializar a aplicação em `buildApp()`; `server.ts` apenas lê configuração e chama `listen`.
- Registrar plugins de infraestrutura antes de rotas que dependam deles.
- Usar schemas para entrada e saída.
- Usar `fastify-plugin` para plugins que decoram a instância raiz e precisam ultrapassar o escopo de encapsulamento.
- Preferir `app.inject()` em testes de integração de rota.

## Escolha de profile

Não escolha uma arquitetura por estética. A spec deve justificar o profile por tamanho do domínio, integrações, evolução prevista e necessidade de isolamento.
