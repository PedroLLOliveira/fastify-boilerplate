export default function fastifyDbTypesTemplate({ orm = 'sequelize' } = {}) {
    if (orm === 'prisma') {
        return `
import 'fastify';
import type { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    db: PrismaClient;
  }
}
`.trim();
    }

    if (orm === 'mongoose') {
        return `
import 'fastify';
import type { Mongoose } from 'mongoose';

declare module 'fastify' {
  interface FastifyInstance {
    db: Mongoose | null;
  }
}
`.trim();
    }

    if (orm === 'sequelize') {
        return `
import 'fastify';
import type { Sequelize } from 'sequelize';

declare module 'fastify' {
  interface FastifyInstance {
    db: Sequelize | null;
  }
}
`.trim();
    }

    // orm === 'none'
    return `
import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    db: any;
  }
}
`.trim();
}