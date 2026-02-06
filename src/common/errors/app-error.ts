export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly status: number;
  readonly code: AppErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    code: AppErrorCode = "INTERNAL_ERROR",
    details?: Record<string, unknown>
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: Record<string, unknown>) =>
  new AppError(message, 400, "BAD_REQUEST", details);

export const unauthorized = (message = "Não autorizado") =>
  new AppError(message, 401, "UNAUTHORIZED");

export const forbidden = (message = "Acesso negado") =>
  new AppError(message, 403, "FORBIDDEN");

export const notFound = (message = "Não encontrado") =>
  new AppError(message, 404, "NOT_FOUND");

export const conflict = (message: string, details?: Record<string, unknown>) =>
  new AppError(message, 409, "CONFLICT", details);

export const validationError = (message: string, details?: Record<string, unknown>) =>
  new AppError(message, 422, "VALIDATION_ERROR", details);
