# 🚀 Fastify com TypeORM

Este exemplo demonstra como integrar TypeORM como ORM em um projeto Fastify com PostgreSQL. O objetivo é fornecer uma implementação simples e eficiente para manipulação de dados com TypeORM, seguindo boas práticas de organização e desenvolvimento.

---

## 📂 Estrutura do Projeto

A estrutura do projeto segue um padrão simples e organizado:

📂 typeorm/
 ┣ 📂 .devcontainer/       # Configuração do ambiente Docker/Dev Container
 ┣ 📂 src/
 ┃ ┣ 📂 database/          # Configuração do banco de dados (TypeORM)
 ┃ ┣ 📂 entities/          # Definição das tabelas do banco
 ┃ ┣ 📂 repositories/      # Métodos de acesso ao banco de dados
 ┃ ┣ 📂 routes/            # Definição das rotas
 ┃ ┣ 📂 services/          # Lógica de negócios
 ┃ ┣ 📄 server.ts          # Inicialização do servidor Fastify
 ┣ 📄 .env                 # Configurações de ambiente
 ┣ 📄 package.json         # Dependências e scripts do projeto
 ┣ 📄 README.md            # Documentação do exemplo TypeORM

---

## 🛠 Configuração e Instalação

1️⃣ Clonar o Repositório

```
git clone https://github.com/seu-usuario/fastify-boilerplate.git
cd fastify-boilerplate/examples/orms/typeorm

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
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

```

5️⃣ Executar Migrações

```
npm run typeorm:migration:generate
npm run typeorm:migration:run

```

6️⃣ Rodar o Servidor

```
npm run dev
```



---

## 📄 Definição da Configuração do TypeORM

O arquivo src/database/data-source.ts define a conexão com o banco de dados:

```
import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "fastify_typeorm",
  synchronize: true, // ⚠️ Alterar para false em produção
  logging: false,
  entities: ["src/entities/*.ts"],
  migrations: ["src/migrations/*.ts"],
});

```

---
## 🔌 Definição da Entidade TypeORM

📍 Arquivo: src/entities/Example.ts

```
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("examples")
export class Example {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;
}

```

## 🔍 Serviço para Manipulação dos Dados

📍 Arquivo: src/repositories/example.repository.ts

```
import { AppDataSource } from "../database/data-source";
import { Example } from "../entities/Example";
import { Repository } from "typeorm";

export class ExampleRepository {
  private repo: Repository<Example>;

  constructor() {
    this.repo = AppDataSource.getRepository(Example);
  }

  async createExample(name: string, email: string) {
    const example = this.repo.create({ name, email });
    return this.repo.save(example);
  }

  async getAllExamples() {
    return this.repo.find();
  }
}

```

## 🌐 Definição das Rotas

📍  Arquivo: src/routes/example.routes.ts

```
import { FastifyInstance } from "fastify";
import { ExampleRepository } from "../repositories/example.repository";

export async function exampleRoutes(fastify: FastifyInstance) {
  const repository = new ExampleRepository();

  fastify.post("/typeorm/examples", async (request, reply) => {
    const { name, email } = request.body as { name: string; email: string };
    const example = await repository.createExample(name, email);
    return reply.send(example);
  });

  fastify.get("/typeorm/examples", async (_, reply) => {
    const examples = await repository.getAllExamples();
    return reply.send(examples);
  });
}


```

## 🏁 Inicializando o Servidor Fastify

📍 Arquivo: src/server.ts

```
import Fastify from "fastify";
import { AppDataSource } from "./database/data-source";
import { exampleRoutes } from "./routes/example.routes";

const fastify = Fastify();

fastify.register(exampleRoutes);

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("📦 Database connected!");

    await fastify.listen({ port: 3001 });
    console.log("🚀 TypeORM Example API running on http://localhost:3001");
  } catch (error) {
    console.error("❌ Error connecting to the database", error);
    process.exit(1);
  }
};

startServer();


```


## 🔄 Testando a API

### 1️⃣ Criar um exemplo

📌 POST http://localhost:3001/typeorm/examples

```
{
  "name": "Teste",
  "email": "teste@email.com"
}

```

### 2️⃣ Listar exemplos

📌  GET http://localhost:3001/typeorm/examples

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
| `npm run typeorm:migration:generate` | Gera um arquivo de migração |
| `npm run typeorm:migration:run` | Aplica as migrações no banco de dados |

---

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir **issues** e **pull requests** para melhorias, correções ou novas funcionalidades. 💙

