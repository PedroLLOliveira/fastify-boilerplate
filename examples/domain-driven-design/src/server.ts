import Fastify from 'fastify';
import { exampleModule } from './modules/example/example.module';

const fastify = Fastify();

async function main() {
    await fastify.register(exampleModule);

    fastify.listen({ port: 3000 }, (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log('🚀 Server is running on http://localhost:3000');
    });
}

main();
