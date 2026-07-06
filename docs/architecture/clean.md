# V2 Architecture: Clean Architecture

O perfil **Clean Architecture** é focado no isolamento total do Domínio (Regras de Negócio Empresariais) de detalhes de infraestrutura (Banco de dados, Framework web, Bibliotecas de terceiros).

## Organização de Pastas

```text
src/
├── core/
│   ├── domain/             # Entidades puras, Types, Contratos/Interfaces
│   └── useCases/           # Casos de uso (Application Services) independentes de framework
├── infrastructure/
│   ├── database/           # Configuração de persistência (Postgres, Sequelize, Kysely)
│   ├── repositories/       # Implementação concreta das interfaces do core/domain
│   └── web/
│       ├── fastify/        # O servidor Fastify, errorHandler, app.ts
│       ├── controllers/    # Adaptadores que traduzem HTTP Request -> UseCase Input
│       └── routes/         # Injeção de dependência e roteamento Fastify
└── server.ts               # Ponto de composição (Composition Root)
```

## Regras e Restrições (Contratos V2)

1. **A Regra de Dependência**: O código em `core/` não pode conhecer NADA de `infrastructure/`. Não importamos Fastify, Kysely, Sequelize ou Axios dentro de `core/`.
2. **Inversão de Dependência**: Os `useCases` recebem dependências via construtor (Injeção de Dependências). Eles declaram Interfaces (ex: `IUserRepository`), e a camada `infrastructure/repositories/` implementa essa interface.
3. **Controllers**: Ficam em `infrastructure/web/controllers/`. Extraem dados do FastifyRequest, chamam o UseCase e formatam a resposta HTTP.

## Composition Root

Como os casos de uso necessitam das instâncias concretas de repositórios, a instância deles ocorre fora das rotas, geralmente atrelada ao registro do servidor Fastify ou por um contêiner de DI.

Exemplo de injeção manual em uma rota:
\`\`\`typescript
const userRepository = new PostgresUserRepository(db);
const createUserUseCase = new CreateUserUseCase(userRepository);
const userController = new UserController(createUserUseCase);

fastify.post('/users', { schema }, userController.handle.bind(userController));
\`\`\`
