import { FastifyInstance } from 'fastify';
import { ExampleRepository } from '../repositories/example.repositorie';

export async function exampleRoutes(fastify: FastifyInstance) {
    const repository = new ExampleRepository();

    fastify.post('/typeorm/examples', async (request, reply) => {
        const { name, email } = request.body as { name: string; email: string };
        const example = await repository.createExample(name, email);
        return reply.send(example);
    });

    fastify.get('/typeorm/examples', async (_, reply) => {
        const examples = await repository.getAllExamples();
        return reply.send(examples);
    });
}
