// helloRoute.js
export function helloRouteTemplate(isTS) {
  return isTS
    ? `import type { FastifyPluginAsync } from 'fastify';

const hello: FastifyPluginAsync = async (fastify) => {
  fastify.get('/hello', async () => ({ message: 'Hello, Fastify Team!' }));
};

export default hello;
`
    : `export default async function hello(fastify, _opts) {
  fastify.get('/hello', async () => ({ message: 'Hello, Fastify Team!' }));
}
`;
}
