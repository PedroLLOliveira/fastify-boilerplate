import { FastifyReply, FastifyRequest } from 'fastify';
import { CustomError } from '../services/CustomError';
import logger from './logger';

export const errorHandler = (error: unknown, request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof CustomError) {
        logger.error({
            message: error.message,
            statusCode: error.statusCode,
            details: error.details || 'No additional details',
        });

        return reply.status(error.statusCode).send({
            error: error.message,
            details: error.details,
        });
    }

    logger.error({
        message: 'Internal Server Error',
        error,
    });

    return reply.status(500).send({
        error: 'Internal Server Error',
    });
};