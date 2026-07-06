# Release e compatibilidade

## Política de versões

- Adotar semver para o pacote público.
- Breaking changes de CLI, profile, layout gerado ou versões mínimas de Node/Fastify exigem major ou política de migração equivalente.
- Usar prereleases (`next`, `beta`, `rc`) para validar v2 antes de promover stable.

## Política de Node

Projetos gerados devem suportar apenas versões Node em Active LTS ou Maintenance LTS. Na data de consulta, Node 24 e Node 22 aparecem como LTS; Node 20 está EOL. Ver [F-NODE-RELEASES].

## Checklist pré-release

- [ ] matriz de profiles verdes;
- [ ] lockfile e catálogo de dependências atualizados;
- [ ] changelog e migration guide revisados;
- [ ] pacote verificado antes de publicação;
- [ ] documentação não anuncia profile experimental como suportado;
- [ ] revisão humana de publicação aprovada.

## Compatibilidade da app gerada

O repositório deve publicar, por release, uma tabela com:

- versão do generator;
- versões de Node/Fastify/TypeScript suportadas;
- profiles suportados;
- dependências de persistência;
- breaking changes;
- caminho de upgrade.
