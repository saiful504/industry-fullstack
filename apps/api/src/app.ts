import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env.js";

import { registerErrorHandlers } from "./shared/errors/error-handler.js";
import { healthRoutes } from "./modules/health/health.routes.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      //! Redact sensitive information from request and response logs.
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          //if use different name on json ,it will not work .so be careful both name must be same
          "req.body.password",
          "req.body.confirmPassword",
          "req.body.accessToken",
          "req.body.refreshToken",
          "*.password",
        ],
        censor: "****redacted*****",
      },
    },
  });

  //**Register CORS plugin.
  app.register(cors, {
    origin: env.WEB_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key", "Accept"],
    maxAge: 600,
  });

  //* Register global error handlers.

  registerErrorHandlers(app);

  //* Register API routes

  app.register(healthRoutes, {
    prefix: "/api/v1",
  });

  return app;
}
