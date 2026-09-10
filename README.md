# fastify-boilerplate

![Fastify](https://img.shields.io/badge/Fastify-%5E5.0.0-blue?style=flat-square&logo=fastify)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-%5E5.5.0-blue?style=flat-square&logo=typescript)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI/CD-blue?style=flat-square&logo=github-actions)

🚀 **fastify-boilerplate** é um **gerador de projetos Fastify**: você escolhe um profile, roda dois
comandos, e tem um app Node.js + TypeScript pronto para rodar — arquitetura organizada, lint,
testes e (quando aplicável) infraestrutura de banco via Docker Compose já configurados.

Existe um único motor de geração. Toda combinação anunciada aqui tem eval E2E verde em CI — nada
neste README descreve um caminho que o CLI não entrega de verdade (ver
`docs/product/support-matrix.md`, gerado a partir do código, não editado à mão).

---

## 🚀 Uso

```bash
npx fastify-boilerplate --profile modular --projectName meu-app
cd meu-app
npm install
npm run dev
```

Sem `--profile`, o CLI abre um wizard interativo com atalhos para os profiles mais comuns e uma
opção **🛠️ Personalizado** para montar arquitetura + banco + linter + pre-commit + framework de
teste passo a passo.

Flags de conveniência:

```bash
npx fastify-boilerplate --profile modular --projectName meu-app --install --git
# --install: já roda "npm install" ao final
# --git: já inicializa o repositório e cria o commit inicial
```

Gerando por cima de um diretório que já existe e não está vazio, o CLI recusa com um erro
explícito — use `--force` se a intenção é mesmo misturar/sobrescrever.

---

## 📦 Profiles disponíveis

| Profile | Arquitetura | Persistência | Quando escolher |
|---|---|---|---|
| `minimal` | Minimal | nenhuma | Um único arquivo de rotas — o menor ponto de partida. |
| `modular` | Modular | nenhuma (CRUD em memória) | Domínios separados por pasta, sem banco. |
| `modular-cors` | Modular | nenhuma (CRUD em memória) | `modular` + `@fastify/cors` já registrado. |
| `modular-postgres-kysely` | Modular | PostgreSQL + Kysely | SQL type-safe, migrations e seed prontos. |
| `modular-postgres-sequelize` | Modular | PostgreSQL + Sequelize | Active Record clássico. |
| `mvc` | MVC (Controller-Service-Repository) | nenhuma | Time acostumado com a separação MVC tradicional. |
| `clean` | Clean Architecture | nenhuma | Isolamento de casos de uso, portas e adaptadores. |

A lista oficial e atualizada é sempre `docs/product/support-matrix.md` — ele é gerado por
`npm run docs:support-matrix` a partir do campo `status` de cada `lib/v2/profiles/*.js`, então as
duas fontes nunca divergem em CI.

Nos profiles com Postgres, `npm run dev` sozinho já sobe o banco via Docker Compose (com
healthcheck e volume nomeado), roda as migrations e o seed de exemplo — não precisa de nenhum
comando manual antes. Já tem um Postgres seu? `npm run dev:no-infra` pula o Docker Compose.

Cada projeto gerado ganha o seu próprio `README.md`, montado a partir dos scripts e arquivos
finais daquela combinação específica (depois de traits e capabilities aplicados) — nunca promete
um comando ou rota que a combinação escolhida não tem.

---

## 🧪 Scripts do projeto gerado

```bash
npm run dev        # servidor em modo desenvolvimento (watch)
npm run build      # compila para dist/
npm start          # roda a build de produção
npm run lint       # ESLint
npm test           # suíte de testes (node:test ou Vitest, conforme o trait escolhido)
```

Profiles com Postgres também ganham `db:migrate`, `db:seed`, `db:reset` e `predev` (que encadeia
compose + migrate + seed automaticamente).

---

## 🤝 Como contribuir

1. Fork e branch descritiva (ex.: `feat/nova-capability-redis`).
2. `npm ci && npm test` — roda os testes unitários do gerador e os evals E2E (geram projeto de
   verdade em diretório temporário, instalam dependências reais e, quando aplicável, sobem
   Postgres via Docker).
3. Toda mudança que altera geração precisa atualizar entrada do CLI, dependências, arquivos,
   testes e documentação afetados — ver `AGENTS.md` e a constituição em
   `.specify/memory/constitution.md`.
4. Abra o Pull Request com os evals relevantes passando localmente.
