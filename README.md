# fastify-boilerplate

![Fastify](https://img.shields.io/badge/Fastify-%5E4.0.0-blue?style=flat-square&logo=fastify)
![Node.js](https://img.shields.io/badge/Node.js-%5E18.0.0-green?style=flat-square&logo=node.js)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI/CD-blue?style=flat-square&logo=github-actions)
![Sequelize](https://img.shields.io/badge/Sequelize-%5E6.0.0-blue?style=flat-square&logo=sequelize)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%5E14.0-blue?style=flat-square&logo=postgresql)
![Jest](https://img.shields.io/badge/Jest-%5E29.0.0-red?style=flat-square&logo=jest)


🚀 **Fastify Boilerplate** é um **gerador de projetos Fastify** para times e solo: você cria um novo app Node.js já com **arquitetura organizada, padrões de código, testes, CI** e **ambiente de desenvolvimento** prontos. Ideal para acelerar kickoffs, padronizar entre squads e manter a casa em ordem sem perder velocidade.

---

## ✨ O que vem pronto

- ✅ **Fastify** → servidor web leve e veloz para Node.js.
- ✅ **Dev Container** → ambiente padronizado em Docker para todos trabalharem igual.
- ✅ **ORM + PostgreSQL** → escolha entre Sequelize (default), Prisma ou TypeORM.
- ✅ **GitHub Actions** → pipeline de CI/CD para testes e qualidade.
- ✅ **ESLint** → linting consistente.
- ✅ **Jest** → testes (com suporte a TypeScript no projeto de testes).

> Por que essas escolhas?
> - "**Performance e DX** com Fastify";
> - "**Ambiente idêntico** entre devs com Dev Container";
> - "**ORMs maduros + PostgresSQL** para escalar com segurança";
> - "**Automação** com Actions; **qualidade contínua** com ESLint + Jest";

---

## 🚀 Instalação & uso
> Você pode usar globalmente (CLI no PATH) ou pontual com `npx`

### Opção A) Global (recomendado para uso frequente)
```bash
npm i -g fastify-boilerplate
fastify-boilerplate
```

### Opção B) Pontual com npx (zero instalação)
```bash
npx fastify-boilerplate@latest
```

O CLI abrirá um **wizard interativo** para você escolher:
- **Nome do projeto**
- **Arquitetura** (ex.: DDD modular ou básica)
- **ORM** (Sequelize/Prisma/TypeORM)
- **Ativar Dev Container**
- **Configurar CI(Github Actions)**
> Dica: após gerar, os scripts padrão do projeto incluem `dev`, `lint`, `test` e `build`.

---

## 🧰 Tecnologias (e por que elas estão aqui)

| Tecnologia        | Papel no projeto | Por que usar |
|------------------|------------|-----------------|
| **Fastify** | Framework HTTP | Alto desempenho + ecossistema robusto |
| **Dev Container** | Ambiente dev | Mesmo setup para todos do time |
| **Sequelize** | ORM (default) | Simples, estável e direto com SQL |
| **Prisma** | ORM (opcional) | DX excelente, schema-first e tipos |
| **TypeORM** | ORM (opcional) | Data Mapper com decorators e migrations |
| **PostgreSQL** | Banco de dados | Confiável, escalável, recursos avançados |
| **GitHub Actions** | CI/CD | Testes e checks automatizados |
| **ESLint** | Qualidade | Padroniza e previne erros comuns |
| **Jest (TS)** | Testes | Unitários/integração simples e rápidos |

As opções acima aparecem como escolhas no gerador e também existem **exemplos de arquitetura e ORMs** no repositório

---

## 🧪 Scripts úteis (no projeto gerado)
```bash
npm run dev        # inicia o servidor em desenvolvimento
npm run lint       # executa o ESLint
npm test           # roda a suite de testes
npm run build      # gera build de produção
```

Esses scripts já vêm configurados para você começar a trabalhar imediatamente.

---

## 🧱 Exemplos de projetos que você pode gera
A CLI oferece variações de **arquitetura** e **ORM**. Aqui vão exemplos tpipicos de uso:

### 1) API básica com Sequelize (default)
- **Quando usar**: CRUDs rápidos, time acostumado com Active Record.
- **Como gerar**: no wizard, escolha **Arquitetura Básica + Sequelize**.
- **Scripts promps**: `dev`, `lint`, `test` e `build`.

### 2) API modular (DDD) com Sequelize
- **Quando usar**: domínios bem definidos, times grandes ou mpultiplos contextos.
- **Como gerar**: no wizard, escolha **Arquitetura DDD Modular + Sequelize**.
- **Beneficíos**: separação por dompinios, crescimento sustentável do código.
   (O repositório traz referência de DDD modular)

### 3) API com Prisma
- **Quando usar**: produtividade + tipos fortes, migrações simples, DX moderna.
- **Como gerar**: no wizard, escolha **Prisma**.
- **Resultado**: projeto já apontado para PostgresSQL e pronto para `prisma migrate`. 

### 4) API com TypeORM
- **Quando usar**: preferência por Data Mapper, decorators e entities.
- **Como gerar**: no wizard, escolha **TypeORM**
> Observação: as opções de arquitetura e ORMs citadas fazem parte do escopo descrito no repositório e seus exemplos. Ajustes/novas variações podem surgir conforme evolução do projeto.

---

## 🧭 Roadmap sugerido após gerar o projeto

1. Criar DB local e configurar `.env`.
2. Subir no Dev Container (se você optou por usar).
3. Rodar `npm run dev` e validar `http://localhost:3000`.
4. Escrever os primeiros testes (`npm teste`).
5. Configurar secrets do repositório (se for usar Actions para deploy).

---

## 🤝 Como contribuir
Contribuições são super bem-vindas! Siga este passo a passo:
1. **Faça um fork** do repositório.
2. **Crie uma branch** descritiva:
   ```bash
   git checkout -b feat/cli-prompts-orm
   ```
3. **Instale as deps e rode testes/lint**:
   ```bash
   npm ci
   npm run lint
   npm test
   ```
4. **Implemente sua melhoria** (código, docs, templates, exemplos).
5. **Abra um Pull Request** explicando o contexto, o "porquê" e como validar.
6. Se sua mudança alterar comportamento do gerador, **acidione/atualize exemplos** e **changelog**.
> Dicas:
> - "Prefica **commits atômcos** e mensagens no padrão conventional commits (`feat:`, `fix:`, `docs:`...)"
> - "Inclua **testes** quando fizer sentido."
> - "Mantenha a **qualidade**: o pipeline de CI (Github Actions) confere o básico."



