# Exemplo — Clean Architecture

## Quando usar

Para domínios com invariantes relevantes, múltiplos adapters e necessidade real de substituir infraestrutura. Não use só para multiplicar camadas.

## Estrutura

```text
src/
  domain/
    users/
      user.ts
      users.repository.ts
  application/
    users/
      create-user.use-case.ts
  infra/
    persistence/
      users.repository.pg.ts
    http/
      users.routes.ts
  main/
    app.ts
    composition.ts
```

## Caso de uso

```ts
export class CreateUser {
  constructor(private readonly users: UsersRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new EmailAlreadyInUseError(input.email);
    return this.users.save(User.create(input));
  }
}
```

## Adapter HTTP

```ts
app.post('/users', { schema: createUserSchema }, async (request, reply) => {
  const user = await createUser.execute(request.body);
  return reply.code(201).send(user.toJSON());
});
```

## Cuidados

- Domínio não importa Fastify, ORM ou driver de banco.
- Casos de uso dependem de portas/interfaces, não de adapters.
- A composição de dependências ocorre em `main`.
- Só publicar este profile depois de uma feature completa, testes e eval.

## Referências

- [F-FASTIFY-PLUGINS]
- [F-FASTIFY-VALIDATION]
- [F-FASTIFY-TESTING]
