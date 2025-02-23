# fastify-boilerplate

![Fastify](https://img.shields.io/badge/Fastify-%5E4.0.0-blue?style=flat-square&logo=fastify)
![Node.js](https://img.shields.io/badge/Node.js-%5E18.0.0-green?style=flat-square&logo=node.js)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI/CD-blue?style=flat-square&logo=github-actions)
![Sequelize](https://img.shields.io/badge/Sequelize-%5E6.0.0-blue?style=flat-square&logo=sequelize)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%5E14.0-blue?style=flat-square&logo=postgresql)
![Jest](https://img.shields.io/badge/Jest-%5E29.0.0-red?style=flat-square&logo=jest)


🚀 **Fastify Boilerplate** é um template de projeto para aplicações **Node.js** utilizando o framework **Fastify**. Criado para oferecer uma base sólida e bem configurada, inclui ferramentas essenciais para um fluxo de trabalho eficiente, colaborativo e escalável.

---

## ✨ Tecnologias e Ferramentas Incluídas

- ✅ **Fastify** → Framework rápido e eficiente para Node.js.
- ✅ **Dev Container** → Ambiente de desenvolvimento padronizado utilizando contêineres.
- ✅ **Sequelize** → ORM para modelagem e interação com bancos de dados SQL de forma simplificada.
- ✅ **PostgreSQL** → Banco de dados relacional poderoso, escalável e seguro.
- ✅ **GitHub Actions** → Automatização de CI/CD, garantindo qualidade no código.
- ✅ **ESLint** → Padronização do código e prevenção de erros comuns.
- ✅ **Jest (TypeScript)** → Testes unitários e de integração para garantir robustez.

---

## 💡 Por que essas Tecnologias?

| Tecnologia        | Benefícios |
|------------------|------------|
| **Fastify** | Framework rápido e otimizado para alta performance. |
| **Dev Container** | Garante um ambiente idêntico para toda a equipe. |
| **Sequelize** | Facilita a manipulação de bancos de dados SQL com um ORM robusto. |
| **PostgreSQL** | Banco de dados escalável e confiável para aplicações modernas. |
| **GitHub Actions** | Automatiza testes e deploys, melhorando a produtividade. |
| **ESLint** | Mantém um código limpo e padronizado. |
| **Jest (TS)** | Testes confiáveis com TypeScript, garantindo a qualidade do código. |

---

## 🚀 Como Usar Este Template

### 📂 Exemplos de Arquitetura

Este repositório contém exemplos de diferentes abordagens arquiteturais para aplicações Fastify. Cada exemplo está disponível na pasta [`examples`](./examples).

| Arquitetura | Descrição | Link |
|------------|------------|------|
| **Domain-Driven Design (DDD) Modular** | Organização modular baseada em Domínios e Contextos Delimitados (Bounded Contexts). | [Ver Exemplo](./examples/domain-driven-design/) |

---

### 🛢 ORMs Disponíveis
Este repositório oferece suporte a diferentes ORMs para integração com PostgreSQL.

| Arquitetura | Descrição | Link |
|------------|------------|------|
| **Sequelize** | ORM tradicional baseado em Active Record para bancos SQL. | Implementado no boilerplate principal |
| **Prisma** | ORM moderno, baseado em Schema-First, com suporte a migrações e geração automática de tipos. | [Ver Exemplo](https://github.com/PedroLLOliveira/fastify-boilerplate/tree/main/examples/orms/example-prisma) |
| **TypeORM** | ORM focado em Data Mapper, com suporte a migrations, decorators e entidades. | [Ver Exemplo](https://github.com/PedroLLOliveira/fastify-boilerplate/tree/main/examples/orms/example-typeORM) |
### 1️⃣ Clonar o Repositório
```sh
 git clone https://github.com/seu-usuario/fastify-boilerplate.git nome-do-seu-projeto
 cd nome-do-seu-projeto
```

### 2️⃣ Abrir o Projeto com Dev Container (Opcional)
Caso utilize o **Dev Container**, siga os passos abaixo:
- Certifique-se de ter o **Docker** e o **VS Code** instalados.
- Abra o VS Code e instale a extensão **Remote - Containers**.
- No VS Code, abra a pasta do projeto e pressione `F1`, digite **Remote-Containers: Reopen in Container** e selecione essa opção.
- O ambiente será inicializado automaticamente dentro do contêiner.

### 3️⃣ Instalar Dependências
```sh
npm install
```

### 4️⃣ Rodar o Servidor em Desenvolvimento
```sh
npm run dev
```
🟢 A aplicação estará rodando em `http://localhost:3000`

### 5️⃣ Rodar Linter e Testes
- Para verificar problemas no código:
```sh
npm run lint
```
- Para executar os testes automatizados:
```sh
npm test
```

### 6️⃣ Gerar Build para Produção
```sh
npm run build
```

---

## 🛠 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor Fastify em modo de desenvolvimento. |
| `npm run lint` | Executa o ESLint para verificar erros de código. |
| `npm test` | Roda os testes unitários e de integração com Jest. |
| `npm run build` | Gera a build para produção. |

---

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir **issues** e **pull requests** para melhorias, correções ou novas funcionalidades. 💙

