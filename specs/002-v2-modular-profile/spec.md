# 002 — V2 Modular Profile

## Problema

O profile `minimal` da V2 provê a infraestrutura e segurança de build para o Fastify com TypeScript e NodeNext. No entanto, para projetos reais de médio e grande porte, colocar todas as rotas e regras de negócio em arquivos simples (como `hello.ts` e `health.ts`) leva rapidamente a um alto acoplamento e à desorganização. 
Precisamos oferecer uma fundação **Modular**, onde a aplicação é separada por domínios/módulos, mas mantendo a mesma garantia determinística da fundação V2 (sem replaces textuais frágeis).

## Objetivo

Criar um profile `modular` em TypeScript, sem persistência (sem banco de dados e sem ORM), utilizando a engine determinística da V2. O profile deve apresentar uma separação clara de responsabilidades: rotas, schemas, handlers e services.

## Interface da CLI (Motor V2)

A interface da CLI deve mapear a nova arquitetura através de flag não-interativa:
- `--profile modular`: Direciona a execução para o gerador V2 com a árvore de arquivos e dependências do novo profile.
- Restrição: Assim como no `minimal`, não é suportado o uso interativo legado para essa fundação.

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
│   └── modules/
│       ├── health/
│       │   ├── health.route.ts
│       │   └── health.schema.ts
│       └── users/
│           ├── users.route.ts
│           ├── users.schema.ts
│           ├── users.handler.ts
│           └── users.service.ts
└── tests/
    ├── health.test.ts
    └── users.test.ts
```

## Convenções de Arquitetura

O profile modular divide as responsabilidades estritamente por domínio de negócio:
- **`*.route.ts`**: Define exclusivamente o contrato HTTP, instanciando `app.get`, `app.post`, conectando o Schema ao Handler correspondente.
- **`*.schema.ts`**: Contém a tipagem estática (TypeBox, JSON Schema) para validação de entrada (Params, Querystring, Body) e saída (Reply).
- **`*.handler.ts`**: A camada de controle. Recebe a `FastifyRequest`, extrai e sanitiza parâmetros, chama o serviço adequado e envia a `FastifyReply`.
- **`*.service.ts`**: Onde reside a lógica de negócios e as regras independentes do protocolo HTTP. Não deve conhecer o objeto `request` ou `reply`.

## Como um módulo registra rotas no servidor

Para garantir que **nenhum arquivo seja modificado por replace textual frágil** (uso de Regex ou `String.replace()` via script de geração), os módulos base do template (`health` e `users`) já vêm registrados de forma **estática e declarativa** no arquivo `src/app.ts` gerado.

Exemplo de `src/app.ts`:
```ts
import Fastify from 'fastify';
import healthRoutes from './modules/health/health.route.js';
import usersRoutes from './modules/users/users.route.js';

export async function buildApp() {
  const app = Fastify({ logger: true });
  
  app.register(healthRoutes, { prefix: '/health' });
  app.register(usersRoutes, { prefix: '/users' });

  return app;
}
```
Se o usuário quiser criar novos módulos no futuro, ele simplesmente seguirá este padrão manual, pois templates não devem manipular o AST ou strings do projeto pós-geração.

## Contrato de respostas HTTP e tratamento de erros

- Respostas de sucesso devem priorizar retorno direto do payload JSON (ex: `return { data: user }`).
- Tratamento de erros de domínio deve usar instâncias da classe `Error` com status apropriado, ou lançar `http-errors`.
- A validação de entrada será tratada automaticamente pelo Fastify usando os Schemas do módulo, que retornam `400 Bad Request` sem poluir os handlers.

## Testes e Evals

- **Testes de template unitários**: O core da CLI (no repositório gerador) deve testar se o profile de fato exibe a definição correta em JSON.
- **Eval end-to-end (E2E)**: O CI deve rodar `eval-modular.test.js` que:
  1. Cria um projeto temporário via `--profile modular`.
  2. Executa `npm install`.
  3. Executa `npm run lint` e `npm run build` confirmando compatibilidade NodeNext.
  4. Roda `npm test` garantindo que os testes internos (`health.test.ts` e `users.test.ts`) fiquem verdes localmente.
  5. Inicia e finaliza o build limpo.

## Exemplo completo de módulo `users` (Sem Persistência)

Serão injetados objetos em memória para simular regra de negócios e viabilizar os testes.

*`users.service.ts`*
```ts
const users = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }];
export async function listUsers() {
  return users;
}
```

*`users.handler.ts`*
```ts
import { FastifyRequest, FastifyReply } from 'fastify';
import * as userService from './users.service.js';

export async function getUsersHandler(request: FastifyRequest, reply: FastifyReply) {
  const users = await userService.listUsers();
  return { data: users };
}
```

*`users.route.ts`*
```ts
import { FastifyInstance } from 'fastify';
import { getUsersHandler } from './users.handler.js';
import { getUsersSchema } from './users.schema.js';

export default async function usersRoutes(app: FastifyInstance) {
  app.get('/', { schema: getUsersSchema }, getUsersHandler);
}
```

## Fora de Escopo

- MVC, Clean Architecture
- ORM e acesso a Banco de Dados
- Swagger / OpenAPI
- Autenticação e Autorização

## Referências
- Documentação de Validação: [Fastify Validation & Serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)
- Documentação de Roteamento: [Fastify Routes](https://fastify.dev/docs/latest/Reference/Routes/)
