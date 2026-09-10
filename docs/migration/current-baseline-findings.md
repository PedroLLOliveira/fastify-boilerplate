# Baseline da v1 — achados para orientar a migração

> **Resolvido por remoção — [ADR-004](../adr/ADR-004-remocao-v1.md), Fase 6 do roadmap
> "Primeiro comando" (ver `HANDOFF.md`).** `lib/scaffold/`, `lib/templates/js`,
> `lib/templates/ts`, `lib/templates/common` e `lib/examples/` — o código que os achados abaixo
> descrevem — foram apagados do repositório. Os itens não foram corrigidos um a um: deixaram de
> ter código correspondente. Este documento permanece como histórico da decisão de migração, não
> como lista de pendências.

Este documento registra divergências observadas na branch `main` analisada durante a preparação do harness. Ele não é uma crítica ao produto; é a fila inicial de caracterização brownfield.

## Achados prioritários

1. **README anuncia opções que o wizard não expõe.** O README cita arquiteturas e ORMs além do que aparece no CLI; MVC, Clean e Prisma estão comentados, enquanto o wizard deixa apenas Modular, Sequelize/Nenhum e Postgres.
2. **Comando publicado diverge do bin e da mensagem do CLI.** O `package.json`, README e constante de título do CLI usam nomes diferentes.
3. **Knex possui caminho de import inconsistente.** O servidor tenta importar `plugins/db-knex`, mas a geração base grava `plugins/db`.
4. **Kysely não é registrado pelo servidor atual.** O template trata explicitamente Knex e ORM, não a opção Kysely; o plugin é escrito, porém não importado/registrado.
5. **`fastify-plugin` é usado em template de query builder sem entrar em dependencies.**
6. **A geração TypeScript de usuários tem substituição de texto inválida.** A injeção de import/register usa `replace` com parâmetros incompatíveis e pode não inserir a rota.
7. **Scripts prometidos não existem no projeto gerado.** README cita `npm test`, porém o `package.json` gerado não define teste nem cria arquivos de teste.
8. **Versões `latest` são gravadas no projeto gerado.** Isso impede reprodução estável e torna uma eval de hoje diferente da mesma eval no futuro.

## Uso deste baseline

- Cada item precisa virar spec, tarefa ou ADR.
- Corrigir um achado sem criar contrato/eval apenas desloca o problema.
- O roadmap não exige manter todas as opções atuais; exige decidir explicitamente quais serão migradas, deprecadas ou removidas.

## Fontes internas

- `bin/cli.js`
- `lib/scaffold/deps.js`
- `lib/scaffold/writeBaseFiles.js`
- `lib/scaffold/pkgjson.js`
- `lib/templates/js/server.js`
- `lib/templates/ts/server.js`
- `lib/templates/common/dbPlugin.js`
- `lib/examples/ts/index.js`
- `README.md`
