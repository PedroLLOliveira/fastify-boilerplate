export function appErrorsTemplate() {
    return `/**
 * Custom Error Classes in TypeScript
 *
 * This file defines custom error classes that extend the native JavaScript Error class.
 * This pattern allows for more specific error handling throughout the application.
 *
 * MDN Error Documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 * TypeScript Classes: https://www.typescriptlang.org/docs/handbook/2/classes.html
*/

// Base class for application-specific errors
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Error for when a resource is not found
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

// Error for data conflicts (e.g., email already exists)
export class ConflictError extends AppError {
  constructor(message = 'Data conflict') {
    super(message, 409);
  }
}

`
};