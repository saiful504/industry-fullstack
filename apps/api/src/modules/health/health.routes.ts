import type { FastifyPluginAsync } from "fastify";

//Health Check Module

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health/live", { logLevel: "silent" }, async (request) => {
    return {
      data: {
        status: "ok",
        service: "industry-api",
        timestamp: new Date().toISOString(),
      },

      meta: {
        requestId: request.id,
      },
    };
  });
};
