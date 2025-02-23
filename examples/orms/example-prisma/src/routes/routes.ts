import { FastifyInstance } from 'fastify';
import { ExampleService } from '../services/example.service';

export async function exampleRoutes(fastify: FastifyInstance) {
    const service = new ExampleService();

    fastify.post('/examples', async (request, reply) => {
        const { name, email } = request.body as { name: string; email: string };
        const example = await service.createExample(name, email);
        return reply.send(example);
    });

    fastify.get('/examples', async (_, reply) => {
        const examples = await service.getAllExamples();
        return reply.send(examples);
    });
}
