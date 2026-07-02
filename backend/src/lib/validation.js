import { z } from "zod";
import { ValidationError } from "../lib/errors.js";

export const cuidSchema = z.string().cuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function validate(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.flatten());
  }

  return result.data;
}

export function validateAsync(schema, data) {
  return Promise.resolve(validate(schema, data));
}
