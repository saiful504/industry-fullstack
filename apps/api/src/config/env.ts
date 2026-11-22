import { z } from "zod";
const envSchema = z.object({
  /**
   ** Environment schema
   */
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_HOST: z.string().min(1).default("127.0.0.1"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.url().default("http://localhost:5173"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});
/**
 ** Validate process.env
 */
const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error("\n Invalid environment configuration :\n");
  for (const issue of result.error.issues) {
    console.error(`${issue.path.join(".")}:${issue.message}`);
  }
  console.error("\nBackend startup aborted.");
  process.exit(1);
}
/**
 * Export validated environment variables.
 */

export const env = result.data;
export type AppEnv = z.infer<typeof envSchema>;
