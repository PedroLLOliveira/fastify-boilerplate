import fastify from 'fastify';
import { errorHandler } from './middlewares/errorHandler';
import appRoutes from './routes/routes';

const server = fastify();
server.setErrorHandler(errorHandler);
server.register(appRoutes);


if (process.env.NODE_ENV !== 'test') {
    server.listen({ port: 3000 }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
}

export default server;