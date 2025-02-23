import logger from '../middlewares/logger';
import { CustomError } from '../services/CustomError';

export class BaseBusiness {
    protected handleError(error: unknown): never {
        this.logError(error); // Log o erro
        if (error instanceof CustomError) {
            throw error;
        } else if (error instanceof Error) {
            throw new CustomError(error.message, 500);
        } else {
            throw new CustomError('Unknown error', 500);
        }
    }

    private logError(error: unknown): void {
        if (error instanceof Error) {
            logger.error({
                message: error.message,
                stack: error.stack,
                name: error.name,
            });
        } else if (error instanceof CustomError) {
            logger.error({
                message: error.message,
                details: error.details,
            });
        } else {
            logger.error({
                message: 'Unknown error',
                details: error,
            });
        }
    }


    protected validateRequiredFields(data: Record<string, unknown>, fields: string[]): void {
        const missingFields = fields.filter((field) => !data[field]);
        if (missingFields.length > 0) {
            throw new CustomError(
                `Missing required fields: ${missingFields.join(', ')}`,
                400,
            );
        }
    }
    protected assertPermission(condition: boolean, message = 'Permission denied'): void {
        if (!condition) {
            throw new CustomError(message, 403, );
        }
    }
    protected assertFound(data: unknown, message = 'Resource not found'): void {
        if (!data) {
            throw new CustomError(message, 404, );
        }
    }
}