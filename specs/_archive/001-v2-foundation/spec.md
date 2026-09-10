# 001 — Fundação v2: profile minimal TypeScript

## Problema

O gerador atual não possui uma prova end-to-end de que uma opção selecionada gera uma aplicação utilizável. O baseline revelou que projetos são gerados com conflitos severos de módulo (ESM no package, CJS no tsconfig), dependências não determinísticas ("latest") e injeção de rotas defeituosas por replace de strings. Antes de suportar várias arquiteturas e persistências, é necessário criar um caminho de referência pequeno e confiável na v2.

## Objetivo

Disponibilizar um profile `minimal` em TypeScript, sem banco, que possa ser gerado de forma não interativa e que entregue uma app Fastify com `/health`, uma rota de exemplo, schemas de entrada/saída, lint, typecheck, testes nativos executáveis e documentação inicial.

## Contrato do Profile Minimal TypeScript

- **Linguagem**: TypeScript com configuração `NodeNext`/`ESNext` (ESM puro nativo).
- **Fastify**: Versão `^5.0.0` fixada, utilizando plugins e encadernação sem replaces quebrados.
- **Node.js**: LTS ativo (v20 ou superior).
- **Injeção de dependência**: Sem manipulação de string regex no gerador (sem `replace` para injetar binds de rotas). A estrutura de `server.ts` e `app.ts` deve ser estática e segura.

## Argumentos não interativos do CLI

A interface da CLI deve aceitar flags para ignorar o modo interativo e chamar o motor v2:
- `--profile minimal`: Define explicitamente a arquitetura-alvo da v2.
- `--projectName <nome>`: O nome do diretório destino.
- `--packageManager <npm|yarn|pnpm>`: Padrão de gerenciador (padrão: npm).

## Versões fixadas de dependências e Node

Não é permitido o uso da tag `"latest"` no output do gerador. O core da v2 deve possuir um catálogo de dependências com versões explicitamente fixadas:
- `node`: `>= 20.0.0`
- `fastify`: `^5.0.0`
- `typescript`: `^5.5.0`
- `tsx`: `^4.10.0`
- Outras dependências devem ter suas versões major preestabelecidas.

## Árvore exata do projeto gerado

```text
/
├── package.json
├── tsconfig.json
├── .eslintrc.cjs
├── .env.example
├── .gitignore
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── config/
│   │   └── env.ts
│   └── routes/
│       ├── health.ts
│       └── hello.ts
└── tests/
    └── health.test.ts
```

## Scripts obrigatórios

O `package.json` gerado deve conter minimamente os comandos unificados:
- `dev`: `tsx watch src/server.ts`
- `build`: `rimraf dist && tsc -p tsconfig.json`
- `start`: `node dist/server.js`
- `test`: `node --test tests/**/*.test.ts` (ou via tsx test)
- `lint`: script funcional para eslint

## Critérios explícitos para considerar o profile publicado

- O README.md do root só pode listar o profile `minimal` como estável. Quaisquer outros profiles prometidos antes da cobertura E2E devem ser removidos da página principal (ou explicitados como legado/quebrado).
- O `eval end-to-end` no CI deve rodar de forma perfeitamente verde executando todo o fluxo de compilação, teste, linter e um smoke test local.

## Cenário principal

**Dado** um diretório vazio e Node na versão 20 LTS,  
**Quando** o usuário executa o comando de criação com `--profile minimal --projectName my-app`,  
**Então** o gerador cria uma aplicação com dependências fixadas, compila tsconfig perfeitamente em ESM puro sem conflito, executa o script de teste validando `/health` com sucesso, e roda a porta do app sem falhas de importação (address em uso excluído).

## Fora de escopo

- banco de dados;
- autenticação;
- Swagger/OpenAPI;
- migrations;
- compatibilidade de JavaScript puro no escopo v2.

## Critérios de aceite

- CA-001: CLI aceita argumentos não interativos e mapeia requisição para o motor v2 isolado.
- CA-002: Árvore gerada coincide exatamente com o contrato estático de arquivos da spec.
- CA-003: O package.json gerado impõe as versões semver (`latest` é erradicado).
- CA-004: Conflito ESM/CJS resolvido em tsconfig via build perfeita com `NodeNext`.
- CA-005: Arquivos de teste e app gerada possuem coverage garantida (inclui script `npm test` gerado).
- CA-006: Teste end-to-end de eval do profile temporário fica verde no CI.
