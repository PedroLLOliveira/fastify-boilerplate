# Matriz de suporte

> Gerado automaticamente por `scripts/generate-support-matrix.js` a partir do
> campo `status` em `lib/v2/profiles/*.js`. Não edite este arquivo à mão —
> rode `npm run docs:support-matrix` depois de mudar um profile.

| Profile ID | Arquitetura | Persistência | Status | Eval E2E |
|---|---|---|---|---|
| `minimal` | minimal | none | suportado | `eval-minimal.test.js` |
| `modular` | modular | none | suportado | `eval-modular.test.js` |
| `modular-postgres-kysely` | modular | PostgreSQL + Kysely | suportado | `eval-modular-pg.test.js` |
| `modular-postgres-sequelize` | modular | PostgreSQL + Sequelize | suportado | `eval-modular-pg-sequelize.test.js` |
| `mvc` | MVC | none | suportado | `eval-mvc.test.js` |
| `clean` | Clean | none | suportado | `eval-clean.test.js` |

## Política

- `supported`: pode aparecer no wizard e no README principal; tem eval E2E verde em CI.
- `experimental`: aparece apenas com aviso explícito; não é recomendado para produção sem revisão do time. É o estado obrigatório de qualquer profile sem eval E2E.
- `deprecated`: continua documentado com caminho de migração e data de remoção.
- `removed`: não aparece no CLI; docs históricas só em changelog/migration guide.

Um profile só sobe de `experimental` para `supported` quando ganha um eval E2E
em `tests/v2/` e esse eval está verde em CI — nunca por edição direta deste
arquivo ou do campo `status`.

## Decisão de escopo

A v2 não promete "todos os ORMs". Perfis são combinações deliberadas. Prisma, TypeORM, Mongo/Mongoose e outros bancos podem ser adicionados somente depois de uma spec que justifique demanda, custo de manutenção e eval completa.
