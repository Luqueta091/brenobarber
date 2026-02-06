import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import { validationError } from "../errors/app-error.js";

export function parse<T>(schema: ZodSchema<T>, payload: unknown): T {
  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.flatten();
      throw validationError("Dados inválidos", { issues: details });
    }
    throw error;
  }
}
