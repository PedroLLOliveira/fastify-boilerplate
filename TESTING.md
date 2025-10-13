# Cobertura de Testes - Fastify Boilerplate

## Visão Geral
Documento descrevendo a cobertura de testes implementada para o Fastify Boilerplate.

## Módulos Testados

### 1. computeDeps (lib/scaffold/deps.js)
- [x] Retorna dependências básicas para projetos JavaScript
- [x] Retorna dependências básicas para projetos TypeScript
- [x] Inclui dependências do Prisma quando selecionado
- [x] Inclui dependências do Sequelize com PostgreSQL
- [x] Inclui dependências do Sequelize com MySQL
- [x] Inclui dependências do Sequelize com SQLite
- [x] Inclui dependências do Mongoose
- [x] Inclui dependências do Knex com PostgreSQL
- [x] Inclui dependências do Kysely com PostgreSQL
- [x] Inclui dependências do ESLint

### 2. makeFolders (lib/scaffold/makeFolders.js)
- [x] Cria pastas básicas para qualquer arquitetura
- [x] Cria pastas para arquitetura MVC
- [x] Cria pastas para arquitetura Limpa (Clean)
- [x] Cria pastas para arquitetura Modular

### 3. writePackageJson (lib/scaffold/pkgjson.js)
- [x] Cria package.json para projeto TypeScript
- [x] Cria package.json para projeto JavaScript
- [x] Inclui scripts do Prisma quando ORM é Prisma
- [x] Inclui scripts do Knex quando query builder é Knex
- [x] Inclui script ESLint quando ESLint está habilitado

### 4. writeBaseFiles (lib/scaffold/writeBaseFiles.js)
- [x] Cria arquivos base para projeto TypeScript
- [x] Cria arquivos base para projeto JavaScript
- [x] Cria arquivos do Prisma quando ORM é Prisma
- [x] Cria arquivos do Knex quando query builder é Knex
- [x] Cria configuração ESLint quando ESLint está habilitado

### 5. CLI (bin/cli.js)
- [x] Verifica existência do arquivo CLI
- [ ] Teste funcional completo

## Scripts de Teste

Scripts disponíveis:
- `npm test` - Executa todos os testes
- `npm run test:watch` - Executa testes em modo watch

## Estrutura de Testes
```
tests/
├── cli.test.js
├── deps.test.js
├── makeFolders.test.js
├── pkgjson.test.js
├── writeBaseFiles.test.js
```

## Observações
- Testes baseados no framework nativo do Node.js (node:test)
- Testes utilizam diretórios temporários para isolamento
- Todos os testes passam corretamente
- Cobertura de testes unitários completa para as funções principais