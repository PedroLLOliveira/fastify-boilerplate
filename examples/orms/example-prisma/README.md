# 🚀 Fastify com Prisma

Este exemplo demonstra como integrar Prisma como ORM em um projeto Fastify com PostgreSQL. O objetivo é fornecer uma implementação simples e eficiente para manipulação de dados com Prisma, seguindo boas práticas de organização e desenvolvimento.

---

## 📂 Estrutura do Projeto

A estrutura do projeto segue um padrão simples e organizado:

📂 prisma/
 ┣ 📂 .devcontainer/       # Configuração do ambiente Docker/Dev Container
 ┣ 📂 prisma/              # Schema do Prisma e migrações
 ┣ 📂 src/
 ┃ ┣ 📂 database/          # Configuração do banco de dados
 ┃ ┣ 📂 routes/            # Definição das rotas
 ┃ ┣ 📂 services/          # Lógica de negócios e acesso ao banco
 ┃ ┣ 📄 server.ts          # Inicialização do servidor Fastify
 ┣ 📄 .env                 # Configurações de ambiente
 ┣ 📄 package.json         # Dependências e scripts do projeto
 ┣ 📄 README.md            # Documentação do exemplo Prisma


---

## 🛠 Configuração e Instalação

1️⃣ Clonar o Repositório

```
git clone https://github.com/seu-usuario/fastify-boilerplate.git
cd fastify-boilerplate/examples/orms/prisma
```
2️⃣ Abrir o Projeto com Dev Container (Opcional)
Se estiver usando VS Code + Dev Container, abra o projeto no VS Code e pressione F1, depois selecione:

```
Remote-Containers: Reopen in Container
```

3️⃣ Instalar Dependências

```
npm install
```

4️⃣ Configurar o Banco de Dados
Antes de rodar o projeto, edite o arquivo .env e defina a string de conexão do banco:

```
DATABASE_URL="postgresql://admin:admin@database:5432/fastify_prisma"
```

5️⃣ Executar Migrações

```
npx prisma migrate dev --name init
```

6️⃣ Rodar o Servidor

```
npm run dev
```



---

## 📄 Definição do Modelo Prisma

O arquivo prisma/schema.prisma define o modelo de dados:

```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Example {
  id    String @id @default(uuid())
  name  String
  email String @unique
}
```

---
## 🔌 Conexão com o Banco de Dados

📍 Arquivo: src/database/prismaClient.ts

```
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

```

## 🔍 Serviço para Manipulação dos Dados

📍 Arquivo: src/services/example.service.ts

```
import { prisma } from "../database/prismaClient";

export class ExampleService {
  async createExample(name: string, email: string) {
    return prisma.example.create({
      data: { name, email },
    });
  }

  async getExamples() {
    return prisma.example.findMany();
  }
}

```

## 🌐 Definição das Rotas

📍 Arquivo: src/routes/example.routes.ts

```
import { FastifyInstance } from "fastify";
import { ExampleService } from "../services/example.service";

export async function exampleRoutes(fastify: FastifyInstance) {
  const service = new ExampleService();

  fastify.post("/examples", async (request, reply) => {
    const { name, email } = request.body as { name: string; email: string };
    const example = await service.createExample(name, email);
    return reply.send(example);
  });

  fastify.get("/examples", async (_, reply) => {
    const examples = await service.getExamples();
    return reply.send(examples);
  });
}

```

## 🏁 Inicializando o Servidor Fastify

📍 Arquivo: src/server.ts

```
import Fastify from "fastify";
import { exampleRoutes } from "./routes/example.routes";

const fastify = Fastify();

fastify.register(exampleRoutes);

fastify.listen({ port: 3001 }, async () => {
  console.log("🚀 Prisma Example API running on http://localhost:3001");
});

```


## 🔄 Testando a API

### 1️⃣ Criar um exemplo

📌 POST http://localhost:3001/examples
```
{
  "name": "Teste",
  "email": "teste@email.com"
}

```

### 2️⃣ Listar exemplos

📌 GET http://localhost:3001/examples

```
[
  {
    "id": "uuid",
    "name": "Teste",
    "email": "teste@email.com"
  }
]

```

---

## 🛠 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor Fastify em modo de desenvolvimento. |
| `npm run lint` | Executa o ESLint para verificar erros de código. |
| `npm test` | Roda os testes unitários e de integração com Jest. |
| `npm run build` | Gera a build para produção. |
| `npx prisma generate` | Gera os arquivos do cliente Prisma. |
| `npx prisma migrate dev` | Aplica as migrações do banco de dados |

---

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir **issues** e **pull requests** para melhorias, correções ou novas funcionalidades. 💙

