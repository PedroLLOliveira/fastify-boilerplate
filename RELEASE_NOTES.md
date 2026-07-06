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
npx create-fastify-team@latest
\`\`\`
*(Escolha a opção "🛠️ Personalizado" para montar a sua stack passo a passo)*.
