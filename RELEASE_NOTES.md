# fastify-boilerplate v2.1.0 — Roadmap "Primeiro comando" completo

Sete fases, um único motor. Esta versão fecha o roadmap "Primeiro comando": a v2.0.0 tinha a arquitetura certa, mas o contrato entre o que o CLI promete e o que aterrissa no disco estava quebrado em vários pontos, e a rede de verificação que deveria pegar isso estava desligada. v2.1.0 é a versão em que `npm install && npm run dev` funciona de verdade, nos 6 profiles herdados da v2.0.0 mais um novo.

## Destaques

- **Rede de verificação reacesa**: os evals E2E do V2 voltaram a rodar dentro de `npm test` e a passar; CI no GitHub Actions (Node 20 e 22) validando todo push e PR para `main`.
- **`npm install && npm run dev` honrado**: `.env` gerado automaticamente, scripts de banco (`db:migrate`, `db:seed`, `db:reset`) reais, `predev` sobe Docker Compose com healthcheck e espera o banco ficar pronto, seed de exemplo garante dado no primeiro `GET`.
- **Bugs conhecidos corrigidos**: profile `clean` (import quebrado, TS2307), Vitest (suíte de teste agora acompanha o trait escolhido), permissões de arquivo no manifesto (hook do Husky nasce executável), `NODE_ENV=test` nos scripts gerados.
- **Engine componentizada**: arquitetura + capability de persistência, em vez de templates monolíticos por combinação — os dois profiles Postgres (Kysely/Sequelize) compartilham o mesmo núcleo HTTP, eliminando ~80% de duplicação medida.
- **Contrato de ambiente fechado**: README gerado dinamicamente por profile, shutdown gracioso (SIGTERM/SIGINT → `app.close()`), `/health` comprovadamente independente de serviços externos, pool único de conexão no Kysely.
- **Catálogo expandido com uma capability de prova**: `@fastify/cors` como novo profile `modular-cors`, provando que o modelo de `Capability` se estende a um terceiro tipo (`kind: 'platform'`) sem custo extra na engine.
- **V1 removida por completo** ([ADR-004](docs/adr/ADR-004-remocao-v1.md)): `lib/scaffold/`, `lib/templates/{js,common,ts}` e `lib/examples/` — código morto desde a reescrita para v2.0.0 — saíram do repositório junto com os 11 testes que só cobriam esse caminho.
- **CLI mais rígido**: guarda de diretório não vazio (`--force` explícito para sobrescrever), slug normalizado para o `name` do `package.json` gerado, `--packageManager` removido (prometia mais do que entregava), resolução de profile via registro declarativo.

## Como atualizar

```bash
npx fastify-boilerplate@latest --profile modular-postgres-kysely --projectName meu-app
```

## Detalhes

O histórico completo das sete fases (achados, verificação, decisões de escopo) está em [`HANDOFF.md`](HANDOFF.md).

---

# Fastify Boilerplate V2: The Architect Release 🏗️

Nós reconstruímos o **Fastify Boilerplate** do zero para entregar a experiência definitiva de geração de APIs corporativas. A V1 focava em *boilerplate interativo*, mas pecava por permitir combinações inseguras. A V2 foca em **Runtime Contracts Inquebráveis e Composição Elegante**.

## O Que Há de Novo? ✨

### 1. Motor Determinístico Baseado em Profiles
Diga adeus a replaces frágeis de strings! A V2 introduz um sistema rigoroso de arquivos e templates definidos como código (AST/manifests). 
- **Modular por Padrão**: Arquitetura orientada a domínios de negócio para escalabilidade (Spec 002).
- **Contratos Globais**: Endpoints padronizados (`/health`, `/ready`), `genReqId` nativo, e um Error Handler global capaz de processar erros de validação e de negócio deterministamente.

### 2. Traits de Tooling (A La Carte)
Recuperamos a customização interativa da V1, mas agora via **Traits** (Spec 006). Você pode acoplar Linter e Testes a qualquer perfil sem arriscar a build:
- **Linters**: ESLint Basic, ESLint + Prettier.
- **Git Hooks**: Husky + lint-staged configurado em um clique.
- **Framework de Testes**: Escolha entre a velocidade pura do *Node:test* ou o poder do *Vitest*.

### 3. Integração SQL Type-Safe (O Fim do "Any")
Removidas ferramentas defasadas e implementadas as pilhas mais potentes do mercado:
- **Kysely**: Query Builder TS-first com inferência de tipo completa direto no banco (Spec 003).
- **Sequelize**: Para times acostumados com o clássico Active Record ORM.

### 4. Volta das Arquiteturas Tradicionais (MVC & Clean Architecture)
A saudade bateu? Atendendo a pedidos, o gerador conta novamente com scaffolds completos para MVC (Controller-Service-Repository) e Clean Architecture (UseCases, Inversão de Controle) perfeitamente testados (Spec 007).

### 5. E2E Evals
Todas as combinações oferecidas pela CLI agora são garantidas por uma suíte rigorosa de E2E Eval que **instala, constrói, sobe o Docker Compose, roda migrations e testa** cada boilerplate antes de podermos publicá-lo. Se algo quebra na geração, nunca chega até você.

## Como usar
Atualize para a V2 e rode:
\`\`\`bash
npx fastify-boilerplate@latest
\`\`\`
*(Escolha a opção "🛠️ Personalizado" para montar a sua stack passo a passo)*.

> Nota adicionada em v2.1.0: o comando acima estava documentado como `npx create-fastify-team@latest` nesta seção — nunca existiu um pacote com esse nome; era um resquício do nome interno do projeto numa versão anterior. Corrigido para o comando real.
