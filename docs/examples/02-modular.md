# Exemplo — Modular

## Quando usar

Este é o profile padrão para novas APIs. Ele organiza por capacidade de negócio e preserva o modelo de plugins do Fastify.

## Estrutura

```text
src/
  app.ts
  server.ts
  modules/
    users/
      users.routes.ts
      users.schema.ts
      users.handlers.ts
      users.service.ts
      users.repository.ts
```

## Composição de módulo

```ts
export default async function usersModule(app: FastifyInstance) {
  const repository = createUsersRepository();
  const service = createUsersService(repository);

  app.post('/users', { schema: createUserSchema },
    createUserHandler(service),
  );
}
```

## Handler fino

```ts
export const createUserHandler = (service: UsersService) =>
  async (request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) => {
    const user = await service.create(request.body);
    return reply.code(201).send(user);
  };
```

## Regras de fronteira

- Rotas montam schema e handler.
- Handlers adaptam HTTP; não concentram regra de negócio.
- Serviço contém regra de aplicação.
- Repositório encapsula persistência.
- Um módulo não importa internals de outro módulo; use contrato/serviço público.

## Referências

- [F-FASTIFY-PLUGINS]
- [F-FASTIFY-VALIDATION]
- [F-FASTIFY-TESTING]
