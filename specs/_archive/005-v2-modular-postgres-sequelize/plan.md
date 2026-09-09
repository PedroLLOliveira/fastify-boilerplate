# Plano de Implementação — V2 Modular Postgres Sequelize

## 1. Definição do Profile no Core
- Criar a constante de manifesto em um arquivo dedicado (`lib/v2/profiles/modular-sequelize.js`) ou integrá-lo adequadamente no registro da V2.
- Configurar dependências fixas: `sequelize`, `pg`, `pg-hstore` para runtime e `sequelize-cli` no escopo de dev. Nenhuma será marcada com `latest`.

## 2. Estrutura e Camadas no Projeto Gerado
O gerador construirá os arquivos na seguinte ordem de responsabilidades, de fora para dentro:
- **Infraestrutura**: `src/db/database.ts` instancia e exporta explicitamente o objeto Sequelize a partir da `DATABASE_URL`. Arquivo `.sequelizerc` gerenciará pastas padrões de migrações e sementes (seeds) para interligar com a CLI do próprio ORM.
- **Plugin Fastify**: `src/plugins/db-sequelize.ts` atua como ponte de gerenciamento de recursos, invocando `sequelize.authenticate()` no hook de inicialização do plugin e garantindo o fechamento por meio de `sequelize.close()` atrelado ao hook de desligamento `onClose`.
- **Repository**: `src/modules/users/users.repository.ts` restringe o acesso direto ao banco. Esta classe importa os modelos do Sequelize (`User.create()`, `User.findAll()`) e as converte em primitivas ou objetos puros TypeScript. Erros nativos (`UniqueConstraintError`) são interceptados e recompostos como Erros de Domínio específicos (ex: `DomainConflictError`).
- **Service**: `src/modules/users/users.service.ts` atua orquestrando a lógica de negócios e validação complementar da entidade (se houver), disparando ações no repositório.
- **Handler**: `src/modules/users/users.handler.ts` consome estritamente o Service correspondente, retornando respostas consistentes encapsuladas no padrão `{ data: ... }` com formatação HTTP correta, mantendo sua tipagem totalmente desacoplada de objetos do Sequelize.

## 3. Gestão de Erros e Prontidão (Spec 004 Compliance)
- **Liveness & Readiness**: O `GET /health` responde estaticamente. O `GET /ready` será atrelado à validação autêntica de conexão com `sequelize.authenticate()`. Caso a comunicação falhe ou ultrapasse limites de latência aceitáveis, o Fastify retornará de forma previsível um erro `503 Service Unavailable`.
- **Falhas de Unicidade**: Para substituir checagens textuais propensas a falha (fragile string matches), o repositório capturará as anomalias da infraestrutura (Unique Constraint) lançadas pelo Sequelize e projetará uma exceção estabilizada (ex: `ConflictError` contendo código HTTP e message padrão), permitindo o handler global lidar passivamente na conversão em `409 Conflict`.

## 4. Estratégia de Avaliação (Evals)
- Construção de rotina E2E automatizada (`eval-modular-pg-sequelize.test.js`) imitando o rigor exigido no Kysely:
  1. Geração isolada de uma nova base de código.
  2. Instalação assíncrona da árvore de pacotes.
  3. Composição e spin-up de contêineres Docker alocando um PostgreSQL transiente.
  4. Execução síncrona do `sequelize-cli db:migrate`.
  5. Compilação TypeScript (`npm run build`).
  6. Disparo da suíte local de testes na nova API cobrindo ciclo de persistência e consultas, atestando conformidade plena do contrato.
