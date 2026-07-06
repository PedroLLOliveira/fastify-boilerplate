# Eval — criar profile minimal

## Vínculo

- Spec: `001-v2-foundation`
- Critérios: CA-001 a CA-005

## Pré-requisitos

- Node LTS suportado;
- diretório temporário vazio;
- acesso ao registry somente na etapa de instalação;
- CLI compilado/local disponível.

## Ação

```bash
create-fastify-boilerplate sample-api --profile minimal --no-interactive
```

## Assertions

- [ ] comando termina com código 0;
- [ ] `sample-api/package.json` existe;
- [ ] `sample-api/src/app.ts` e `src/server.ts` existem;
- [ ] scripts `dev`, `test`, `lint`, `typecheck` e `build` existem;
- [ ] dependências não usam `latest`;
- [ ] `npm install`, `npm test`, `npm run typecheck` e `npm run build` passam;
- [ ] teste/injeção de `/health` retorna 200 e `{ status: 'ok' }`.

## Falhas que devem reprovar

- import sem arquivo;
- import sem dependency;
- README ensinando script inexistente;
- configuração exigindo banco em profile `none`;
- porta fixa que impede execução paralela de CI.
