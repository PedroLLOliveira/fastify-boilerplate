import { prisma } from '../database/connection';

export class ExampleService {
    async createExample(name: string, email: string) {
        return prisma.example.create({
            data: { name, email },
        });
    }

    async getAllExamples() {
        return prisma.example.findMany();
    }
}
