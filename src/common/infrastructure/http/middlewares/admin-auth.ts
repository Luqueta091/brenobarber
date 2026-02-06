import type { NextFunction, Request, Response } from "express";
import { env } from "../../../../config/env.js";
import { unauthorized } from "../../../errors/app-error.js";

export function adminAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.header("x-admin-token") || req.header("authorization")?.replace("Bearer ", "");
  if (!token || token !== env.ADMIN_TOKEN) {
    return next(unauthorized("Token admin inválido"));
  }
  return next();
}
