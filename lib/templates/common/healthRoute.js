// healthRoute.js
export function healthRouteTemplate(isTS) {
  return isTS
    ? `import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
export default async function health(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.get('/health', async () => ({ status: 'ok' }));
}
`
    : `export default async function health(fastify, _opts) {
  fastify.get('/health', async () => ({ status: 'ok' }));
}
`;
}
