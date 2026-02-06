type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, unknown> | undefined;

function log(level: LogLevel, message: string, meta?: LogMeta) {
  const payload = meta ? { level, message, ...meta } : { level, message };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, meta?: LogMeta) => log("info", message, meta),
  warn: (message: string, meta?: LogMeta) => log("warn", message, meta),
  error: (message: string, meta?: LogMeta) => log("error", message, meta)
};
