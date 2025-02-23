export class CustomError extends Error {
    public statusCode: number;
    public details?: unknown;

    constructor(message: string, statusCode: number, details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}