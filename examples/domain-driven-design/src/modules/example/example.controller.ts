import { FastifyReply, FastifyRequest } from 'fastify';
import { ExampleService } from './example.service';

export class ExampleController {
    private service: ExampleService;

    constructor() {
        this.service = new ExampleService();
    }

    async getHello(req: FastifyRequest, reply: FastifyReply) {
        const message = this.service.getMessage();
        return reply.send({ message });
    }
}
