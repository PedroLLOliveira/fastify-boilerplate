import { FastifyInstance } from 'fastify';

export default async function appRoutes(fastify: FastifyInstance) {
    fastify.get('/hello-world', async (request, reply) => {
        return reply.send('Hello World');
    });
}