import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { logger } from "../../logging/logger.js";
import { AppError } from "../../errors/app-error.js";
import { router } from "./router.js";

export interface RequestWithId extends Request {
  requestId: string;
}

export function createServer(publicDir?: string) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = randomUUID();
    (req as RequestWithId).requestId = requestId;
    res.setHeader("x-request-id", requestId);
    const start = Date.now();

    res.on("finish", () => {
      logger.info("request", {
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - start
      });
    });

    next();
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  if (publicDir) {
    app.use(express.static(publicDir));
    app.get("/", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));
    app.get("/unidadeA", (_req, res) => res.sendFile(path.join(publicDir, "unidade.html")));
    app.get("/unidadeB", (_req, res) => res.sendFile(path.join(publicDir, "unidade.html")));
    app.get("/confirmacao", (_req, res) =>
      res.sendFile(path.join(publicDir, "confirmacao.html"))
    );
    app.get("/meus-agendamentos", (_req, res) =>
      res.sendFile(path.join(publicDir, "meus-agendamentos.html"))
    );
    app.get("/admin", (_req, res) => res.sendFile(path.join(publicDir, "admin.html")));
  }

  app.use((req, res, next) => {
    if (req.path.startsWith("/public") || req.path.startsWith("/admin")) {
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Pragma", "no-cache");
    }
    next();
  });

  app.use(router);

  app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
    const requestId = (req as RequestWithId).requestId;
    if (error instanceof AppError) {
      return res.status(error.status).json({
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        },
        requestId
      });
    }

    logger.error("unhandled_error", { requestId, error: String(error) });

    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Erro interno inesperado"
      },
      requestId
    });
  });

  return app;
}
