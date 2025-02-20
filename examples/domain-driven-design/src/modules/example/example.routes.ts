import { FastifyInstance } from 'fastify';
import { ExampleController } from './example.controller';
import { exampleSchema } from './example.schema';

export async function exampleRoutes(fastify: FastifyInstance) {
    const controller = new ExampleController();

    fastify.get(
        '/example',
        { schema: exampleSchema },
        controller.getHello.bind(controller)
    );
}
