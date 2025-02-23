import Fastify from 'fastify';
import { AppDataSource } from './database/connection';
import { exampleRoutes } from './routes/routes';

const fastify = Fastify();

fastify.register(exampleRoutes);

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('📦 Database connected!');

        await fastify.listen({ port: 3001 });
        console.log('🚀 TypeORM Example API running on http://localhost:3001');
    } catch (error) {
        console.error('❌ Error connecting to the database', error);
        process.exit(1);
    }
};

startServer();
