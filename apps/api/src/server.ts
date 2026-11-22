import { is } from "zod/v4/locales";
import { buildApp } from "./app.js";
import { env } from "./config/env.js";
const app = buildApp();
let isShuttingDown = false;
async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  app.log.info({ signal }, "Shutdown  signal received ");
  try {
    await app.close();
    app.log.info("Application closed gracefully ");
  } catch (error) {
    app.log.error({ err: error }, "Graceful shutdown failed");
    process.exitCode = 1;
  }
  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}
async function startServer(): Promise<void> {
  try {
    await app.listen({
      host: env.API_HOST,
      port: env.API_PORT,
    });
    app.log.info(
      { host: env.API_HOST, port: env.API_PORT },
      "API server running ",
    );
  } catch (error) {
    app.log.fatal({ err: error }, "ÄPI server startup failed ");
    try {
      await app.close();
    } catch (closeError) {
      app.log.error({ err: closeError }, "Application cleanup failed");
    }
    process.exitCode = 1;
  }
}
void startServer();
