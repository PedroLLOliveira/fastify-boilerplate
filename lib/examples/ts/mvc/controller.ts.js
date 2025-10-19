export function controllerTemplate(_orm) {
  return `/**
 * User Controller (Request/Response Layer)
 *
 * This class is responsible for handling incoming HTTP requests for user-related
 * routes. It validates input using Zod schemas, calls the appropriate service
 * methods to perform business logic, and formats the HTTP response.
 *
 * Fastify Documentation:
 * - Request Object: https://www.fastify.io/docs/latest/Reference/Request/
 * - Reply Object: https://www.fastify.io/docs/latest/Reference/Reply/
 * - Error Handling: https://www.fastify.io/docs/latest/Reference/Errors/
 *
 * Zod Documentation:
 * - Parsing and Validation: https://zod.dev/?id=parse
 * - Error Handling with ZodError: https://zod.dev/?id=error-handling
*/
import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { UserService } from '../services/user.service';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
} from '../schemas/userSchema';

export class UserController {
  constructor(private userService: UserService) {}

  // Handler to CREATE a user
  public async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedBody = createUserSchema.parse(request.body);
      const user = await this.userService.create(validatedBody);
      return reply.status(201).send(user);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  // Handler to GET ALL users
  public async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.getAll();
      return reply.status(200).send(users);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  // Handler to GET a user by ID
  public async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = userIdParamsSchema.parse(request.params);
      const user = await this.userService.getById(id);
      return reply.status(200).send(user);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  // Handler to UPDATE a user
  public async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = userIdParamsSchema.parse(request.params);
      const validatedBody = updateUserSchema.parse(request.body);
      const user = await this.userService.update(id, validatedBody);
      return reply.status(200).send(user);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  // Handler to DELETE a user
  public async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = userIdParamsSchema.parse(request.params);
      await this.userService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  // Private method to centralize error handling
  private handleError(error: unknown, reply: FastifyReply) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.flatten().fieldErrors,
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ message: error.message });
    }

    // Fallback for unexpected errors
    console.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
}

`;
}
