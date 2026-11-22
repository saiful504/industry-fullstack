import type { FastifyError, FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
  };
}
export function registerErrorHandlers(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    const requestId = request.id;
    //zod validation error
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      request.log.warn({ requestId, details }, "Request validation failed");
      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data.",
          requestId,
          details,
        },
      } satisfies ErrorResponse);
    }
    // Custom application error
    if (error instanceof AppError) {
      const isServerError = error.statusCode >= 500;
      const log = isServerError
        ? request.log.error.bind(request.log)
        : request.log.warn.bind(request.log);
      log(
        {
          requestId,
          code: error.code,
          statusCode: error.statusCode,
          err: error,
        },
        error.message,
      );
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: isServerError
            ? "An unexpected error occurred."
            : error.message,
          requestId,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
      } satisfies ErrorResponse);
    }
    // Fastify validation error
    const fastifyErr = error as FastifyError;

    if (fastifyErr.validation) {
      const details = fastifyErr.validation.map((issue) => {
        const rawField = issue.instancePath
          ? issue.instancePath.replace(/^\//, "")
          : String(issue.params?.missingProperty || "unknown");

        return {
          field: rawField,
          message: issue.message ?? "Invalid value",
        };
      });

      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details,
        },
        meta: {
          requestId: request.id,
        },
      });
    }
  });
}
