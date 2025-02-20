# 🏗️ Arquitetura Modular baseada em DDD no Fastify

A Arquitetura Modular baseada em Domain-Driven Design (DDD) organiza a aplicação em módulos independentes, onde cada módulo representa um Bounded Context do domínio. Essa abordagem promove separação de responsabilidades, facilitando a manutenção, escalabilidade e reutilização do código.

---

Cada módulo segue uma estrutura padrão, composta por:

- Business → Contém as regras de negócio do domínio.
- Service → Camada de aplicação que intermedia o controller e a business.
- Controller → Gerencia as requisições HTTP e respostas da API.
- Schema → Define a estrutura de validação dos dados.
- Routes → Configura as rotas do módulo.
- Module → Responsável por registrar o módulo no servidor Fastify.

---

🎯 Benefícios
- ✅ Alta organização e modularização
- ✅ Facilidade de manutenção e expansão
- ✅ Baixo acoplamento entre módulos
- ✅ Melhor testabilidade e reutilização de código

Esse modelo é ideal para aplicações escaláveis, seguindo boas práticas do DDD, e garantindo que cada domínio da aplicação seja tratado de forma independente. 🚀

---

📂 Estrutura do módulo example
```
📂 modules
 ┣ 📂 example
 ┃ ┣ 📄 example.business.ts
 ┃ ┣ 📄 example.controller.ts
 ┃ ┣ 📄 example.module.ts
 ┃ ┣ 📄 example.routes.ts
 ┃ ┣ 📄 example.schema.ts
 ┃ ┣ 📄 example.service.ts
 ```

 ---

Agora, o código de cada arquivo:

📄 example.business.ts (Regra de Negócio - Opcional)
```ts
export class ExampleBusiness {
  getMessage(): string {
    return "Hello, World! from Business Layer";
  }
}
```
📌 Explicação:

Esse arquivo contém a lógica de negócios do domínio.
Para algo simples como um "Hello, World!", não há muita lógica, mas seria útil para regras mais complexas.

---

📄 example.service.ts (Camada de Serviço)
```ts
import { ExampleBusiness } from "./example.business";

export class ExampleService {
  private business: ExampleBusiness;

  constructor() {
    this.business = new ExampleBusiness();
  }

  getMessage(): string {
    return this.business.getMessage();
  }
}
```
📌 Explicação:

O Service lida com a lógica de aplicação, chamando a camada de Business para obter os dados.

---

📄 example.controller.ts (Controlador - Lida com a Requisição)
```ts
import { FastifyReply, FastifyRequest } from "fastify";
import { ExampleService } from "./example.service";

export class ExampleController {
  private service: ExampleService;

  constructor() {
    this.service = new ExampleService();
  }

  async getHello(req: FastifyRequest, reply: FastifyReply) {
    const message = this.service.getMessage();
    return reply.send({ message });
  }
}
```
📌 Explicação:

O Controller recebe as requisições e delega para o Service.
Responde com um JSON contendo a mensagem "Hello, World!".

---

📄 example.schema.ts (Definição do Esquema de Validação)
```ts
export const exampleSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};
```
📌 Explicação:

Define o esquema da resposta da API usando JSON Schema.
Garante que o retorno sempre contenha { message: string }.

---

📄 example.routes.ts (Rotas do Módulo)
```ts
import { FastifyInstance } from "fastify";
import { ExampleController } from "./example.controller";
import { exampleSchema } from "./example.schema";

export async function exampleRoutes(fastify: FastifyInstance) {
  const controller = new ExampleController();

  fastify.get(
    "/example",
    { schema: exampleSchema },
    controller.getHello.bind(controller)
  );
}
```
📌 Explicação:

Define as rotas do módulo, associando /example ao método do controller.

---

📄 example.module.ts (Registro do Módulo no Fastify)
```ts
import { FastifyInstance } from "fastify";
import { exampleRoutes } from "./example.routes";

export async function exampleModule(fastify: FastifyInstance) {
  fastify.register(exampleRoutes);
}
```
📌 Explicação:

Esse arquivo registra o módulo no Fastify, permitindo que seja carregado separadamente.

---

📄 server.ts (Importando e Registrando o Módulo)
```ts
import Fastify from "fastify";
import { exampleModule } from "./modules/example/example.module";

const fastify = Fastify();

async function main() {
  await fastify.register(exampleModule);

  fastify.listen({ port: 3000 }, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log("🚀 Server is running on http://localhost:3000");
  });
}

main();
```
📌 Explicação:

- O server.ts registra o módulo example.
- O servidor Fastify inicia na porta 3000.
