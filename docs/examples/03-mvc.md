# Exemplo — MVC

> **Estado real vs. este documento**: o profile `mvc` gerado hoje só tem `/health` (ver nota em
> `docs/architecture/mvc.md`). O CRUD de `users` com `repositories/`/`models/` abaixo é design-alvo
> para quando o profile ganhar uma capability de persistência — ainda não existe.

## Quando usar

Para equipes com convenção MVC estabelecida ou quando a clareza controller/service/model é mais importante que uma organização por módulo. Deve ser tratado como profile de compatibilidade, não como padrão sem avaliação de contexto.

## Estrutura

```text
src/
  routes/
    users.routes.ts
  controllers/
    users.controller.ts
  services/
    users.service.ts
  repositories/
    users.repository.ts
  models/
    user.model.ts
```

## Controller

```ts
export class UsersController {
  constructor(private readonly service: UsersService) {}

  create = async (
    request: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply,
  ) => {
    const user = await this.service.create(request.body);
    return reply.code(201).send(user);
  };
}
```

## Cuidados

- Controller não conversa diretamente com ORM.
- Model não deve virar depósito de regra de negócio.
- Rotas devem continuar declarando schema Fastify.
- Não misturar controllers de MVC com módulos de outra arquitetura na mesma feature.

## Referências

- [F-FASTIFY-VALIDATION]
- [F-FASTIFY-TESTING]
