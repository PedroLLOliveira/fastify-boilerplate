// Capability de plataforma: um plugin Fastify puro, sem persistência e sem
// serviço de infra (nada em docker-compose.yml, nenhuma env var própria).
// Existe como prova da Fase 5: o tipo `Capability` e o mecanismo de
// `appFragment` foram desenhados na Fase 3 pensando em persistência
// (Postgres); este arquivo confirma que o mesmo modelo serve para uma
// terceira categoria (`kind: 'platform'`) sem precisar de nenhum ajuste na
// engine — só o app.ts da arquitetura precisou aprender a aceitar um
// fragmento (ver `templates/modular/index.js::buildAppTsContent`).
/** @type {import('../core/types.d.ts').Capability} */
export const corsCapability = {
  id: 'cors',
  kind: 'platform',
  dependencies: {
    runtime: ['@fastify/cors']
  },
  appFragment: {
    imports: ["import cors from '@fastify/cors';"],
    needsEnv: false,
    registration: 'await app.register(cors);'
  }
};
