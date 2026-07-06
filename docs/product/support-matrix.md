# Matriz de suporte

> Esta é a matriz-alvo da v2. Um item só muda para **suportado** quando a eval correspondente estiver verde em CI.

| Profile ID | Arquitetura | Persistência | Status alvo | Versão inicial | Eval obrigatória |
|---|---|---|---|---|---|
| `minimal` | minimal | none | suportado | 2.0 | criação, typecheck, teste, `/health` |
| `modular` | modular | none | suportado | 2.1 | criação, CRUD exemplo, `/health` |
| `modular-postgres-kysely` | modular | PostgreSQL + Kysely | suportado | 2.2 | criação, migração, CRUD, cleanup |
| `modular-postgres-sequelize` | modular | PostgreSQL + Sequelize | compatibilidade | 2.3 | criação, model, CRUD, cleanup |
| `mvc` | MVC | none | experimental | 2.4 | criação, exemplo, docs |
| `clean` | Clean | none | experimental | 2.5 | criação, exemplo, boundary checks |

## Política

- `supported`: pode aparecer no wizard e no README principal; tem compatibilidade, exemplo e eval.
- `experimental`: aparece apenas com aviso explícito; não é recomendado para produção sem revisão do time.
- `deprecated`: continua documentado com caminho de migração e data de remoção.
- `removed`: não aparece no CLI; docs históricas só em changelog/migration guide.

## Decisão de escopo

A v2 não promete “todos os ORMs”. Perfis são combinações deliberadas. Prisma, TypeORM, Mongo/Mongoose e outros bancos podem ser adicionados somente depois de uma spec que justifique demanda, custo de manutenção e eval completa.
