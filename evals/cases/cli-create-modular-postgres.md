# Eval — criar profile modular PostgreSQL Kysely

## Vínculo

- Spec futura: `00X-modular-postgres-kysely`

## Pré-requisitos

- Node LTS suportado;
- Postgres efêmero no CI ou container de teste;
- banco isolado por execução.

## Assertions

- [ ] CLI cria profile `modular-postgres-kysely` sem opções implícitas;
- [ ] plugin de banco é registrado antes de módulos que o usam;
- [ ] dependências incluem driver e `fastify-plugin` quando usado;
- [ ] migrations e scripts correspondem aos arquivos gerados;
- [ ] `/health` não precisa de banco e readiness pode relatar indisponibilidade conforme spec;
- [ ] CRUD de Users passa após migration;
- [ ] `app.close()` fecha pool/conexões;
- [ ] cleanup remove dados/containers temporários.
