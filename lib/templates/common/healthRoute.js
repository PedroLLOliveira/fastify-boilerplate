// healthRoute.js
export function healthRouteTemplate(isTS) {
  return isTS
    ? `import type { FastifyPluginAsync } from 'fastify';

const health: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => ({ status: 'ok' }));
};

export default health;
`
    : `export default async function health(fastify, _opts) {
  fastify.get('/health', async () => ({ status: 'ok' }));
}
`;
}
