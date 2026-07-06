# V2 Architecture: MVC (Model-View-Controller)

O perfil **MVC** adapta o tradicional padrão Model-View-Controller para o contexto de REST APIs modernas com Fastify, separando horizontalmente as responsabilidades técnicas (diferente da arquitetura Modular que separa por domínio de negócio).

No contexto de APIs, "View" é frequentemente substituída por respostas JSON ou serializadores, enquanto "Controller" é representado pelos handlers de rota.

## Organização de Pastas

```text
src/
├── config/           # Configurações de ambiente (.env), logger, etc
├── controllers/      # Handlers HTTP, extração de params/body e retorno HTTP
├── middlewares/      # Fastify hooks e plugins transversais
├── models/           # (Ou Repositories) Regras de persistência de dados
├── routes/           # Mapeamento estrito de rotas Fastify -> Controllers
├── schemas/          # Validação JSON Schema usando TypeBox / JSON Schema
├── services/         # Regras de negócio puras (sem acoplamento com HTTP)
├── app.ts            # Registro de plugins e rotas
└── server.ts         # Ponto de entrada (escuta de porta)
```

## Separação de Responsabilidades (Contratos V2)

1. **Routes**: Apenas chamam `fastify.get(...)` registrando o Schema e apontando para a função do Controller correspondente.
2. **Controllers**: Isolam a requisição/resposta. Chamam os Services. Devem encaminhar exceções (ou lançá-las) para que o *ErrorHandler global* processe o 400/404/409/500 padrão da V2.
3. **Services**: Não podem receber objetos `FastifyRequest` ou `FastifyReply`. Recebem apenas DTOs / Parâmetros tipados.
4. **Models/Repositories**: Isolam a lógica SQL (Kysely, Sequelize). Os Services desconhecem o dialeto ou os drivers de banco.

## Exemplo de Fluxo

\`\`\`typescript
// src/routes/users.ts
fastify.post('/', { schema }, userController.createUser);

// src/controllers/user.controller.ts
export async function createUser(req, reply) {
  const user = await userService.registerUser(req.body);
  return reply.status(201).send(user);
}

// src/services/user.service.ts
export async function registerUser(data: CreateUserDTO) {
  if (await userRepository.exists(data.email)) throw new ConflictError('User exists');
  return userRepository.create(data);
}
\`\`\`
