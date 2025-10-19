export function userSchemaTemplate(orm) {
    if (orm === 'prisma') {
        return `/**
 * Zod Schemas for User Validation
 *
 * This file contains Zod schemas used to validate incoming request data
 * for user-related operations, ensuring type safety and data integrity.
 *
 * Zod Documentation: https://zod.dev/
 * Basic Usage: https://zod.dev/?id=basic-usage
 * String Validators (email, uuid, min): https://zod.dev/?id=strings
 * Objects: https://zod.dev/?id=objects
 * Optional Modifier: https://zod.dev/?id=optional
 * Type Inference: https://zod.dev/?id=type-inference
*/
import { z } from 'zod';

// Schema for user creation
export const createUserSchema = z.object({
  email: z.string().email('Invalid email.'),
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
});
// Inferred type for the creation request body
export type CreateUserInput = z.infer<typeof createUserSchema>;

// Schema for update (all fields are optional)
export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(3).optional(),
});
// Inferred type for the update request body
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Schema for route parameters (e.g., /users/:id)
export const userIdParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID.'),
});
// Inferred type for the parameters
export type UserIdParams = z.infer<typeof userIdParamsSchema>;

`;
    }
}