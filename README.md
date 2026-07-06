# fastify-boilerplate

![Fastify](https://img.shields.io/badge/Fastify-%5E5.0.0-blue?style=flat-square&logo=fastify)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-%5E5.5.0-blue?style=flat-square&logo=typescript)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI/CD-blue?style=flat-square&logo=github-actions)

🚀 **Fastify Boilerplate** é um **gerador de projetos Fastify** para times e solo: você cria um novo app Node.js já com **arquitetura organizada, padrões de código, testes, CI** e **ambiente de desenvolvimento** prontos.

> ⚠️ **Aviso de Refatoração V2:** O projeto está passando por uma reescrita para garantir o uso rigoroso de TypeScript ESM (NodeNext), Fastify v5, dependências com versões fixas determinísticas e execução end-to-end garantida.

Atualmente, a fundação V2 suporta os profiles **Minimal** e **Modular** (ambos 100% testáveis nativamente). As demais opções (ORMs, MVC, etc) pertencem ao fluxo Interativo Legacy (V1) e poderão apresentar conflitos se misturados até que ganhem suas specs definitivas na V2.

---

## ✨ O que vem pronto (V2 - Profiles Minimal & Modular)

- ✅ **Fastify v5** → servidor web leve e veloz para Node.js.
- ✅ **TypeScript ESM Puro** → `type: module` e `moduleResolution: NodeNext`.
- ✅ **Testes Nativos** → Configuração do framework `node:test` (via tsx) sem dependências pesadas, com app.inject().
- ✅ **ESLint** → linting consistente.
- ✅ **Composição estática** → Divisão rigorosa entre `app.ts` (setup e binds) e `server.ts` (socket handler e shutdown).

---

## 🚀 Instalação & uso

Você pode usar o gerador pontualmente usando `npx`.

### Gerando o projeto suportado (V2 - Minimal ou Modular Profile)

Para criar o projeto usando o motor determinístico V2, que provê uma base impecável em TS ESM e testável nativamente:

```bash
npx fastify-boilerplate --profile modular --projectName meu-app
# ou --profile minimal
```

Isso fará o *bypass* do assistente antigo e usará o gerador estrito que garante a compatibilidade e build sem problemas com o Node v20+.

### Fluxo Interativo Legado (V1)

Caso precise gerar projetos com Sequelize, Knex ou arquitetura MVC, você pode acessar o assistente v1. **Atenção: essas arquiteturas estão sem Evals E2E no momento e podem precisar de ajustes em seus imports/builds**.

```bash
npx fastify-boilerplate
```

O CLI abrirá um wizard interativo onde você poderá explorar as antigas opções.

---

## 🧪 Scripts úteis (no projeto gerado na V2)

Após gerar o projeto (Minimal ou Modular), a sua aplicação já conterá no `package.json`:

```bash
npm run dev        # inicia o servidor em desenvolvimento via tsx
npm run build      # limpa e compila o dist/ em NodeNext
npm test           # roda a suite nativa (node --test) via tsx
npm run lint       # executa o ESLint
npm start          # roda a versão de produção gerada no dist
```

---

## 🧭 Roadmap sugerido após gerar o projeto

1. Acesse o diretório: `cd meu-app`
2. Instale as dependências: `npm install`
3. Crie a cópia do env local: `cp .env.example .env`
4. Rode a suite de testes: `npm test`
5. Suba em dev `npm run dev` e chame `http://localhost:3000/health`.

---

## 🤝 Como contribuir

Contribuições são super bem-vindas! Nosso foco no momento é migrar os antigos templates v1 (ORMs, Modular) para o motor determinístico da v2.

1. **Faça um fork** do repositório.
2. **Crie uma branch** descritiva (ex: `feat/v2-profile-modular`)
3. **Instale as deps e rode testes**:
   ```bash
   npm ci
   npm test
   ```
4. **Implemente sua melhoria**
5. Abra um Pull Request e assegure-se de que os testes end-to-end de geração de pastas temporárias estejam passando (nenhum projeto deve ser quebrado!).
