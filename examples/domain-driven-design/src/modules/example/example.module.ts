import { FastifyInstance } from 'fastify';
import { exampleRoutes } from './example.routes';

export async function exampleModule(fastify: FastifyInstance) {
    fastify.register(exampleRoutes);
}
