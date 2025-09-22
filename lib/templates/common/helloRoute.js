// helloRoute.js
export function helloRouteTemplate(isTS) {
  return isTS
    ? `import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
export default async function hello(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.get('/hello', async () => ({ message: 'Hello, Fastify Team!' }));
}
`
    : `export default async function hello(fastify, _opts) {
  fastify.get('/hello', async () => ({ message: 'Hello, Fastify Team!' }));
}
`;
}
