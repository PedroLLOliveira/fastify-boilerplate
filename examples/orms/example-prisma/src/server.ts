import Fastify from 'fastify';
import { exampleRoutes } from './routes/routes';
import { prisma } from './database/connection';

const fastify = Fastify();

fastify.register(exampleRoutes);

fastify.listen({ port: 3001 }, async () => {
    await prisma.$connect();
    console.log('🚀 Prisma Example API running on http://localhost:3001');
});
