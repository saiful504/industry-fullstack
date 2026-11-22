import Fastify from "fastify";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",

    redact: ["req.headers.authorization", "req.headers.cookie"],
  },
});

// Initial health endpoint
app.get("/api/v1/health", async () => {
  return {
    status: "ok",
    service: "industry-api",
    timestamp: new Date().toISOString(),
  };
});

// Start server
const start = async (): Promise<void> => {
  try {
    await app.listen({
      host: process.env.API_HOST ?? "127.0.0.1",
      port: Number(process.env.API_PORT ?? 4000),
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
