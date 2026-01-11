import pino from "pino";

// A single, shared instance
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // Standard JSON output for production, pretty-print for dev
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
