import type { Request, Response } from "express";
import { parse } from "../../../common/validation/validators.js";
import { disponibilidadeQuerySchema } from "../dtos/disponibilidade.dto.js";
import { calcularDisponibilidade } from "../services/disponibilidade.service.js";

export async function obterDisponibilidade(req: Request, res: Response) {
  const params = parse(disponibilidadeQuerySchema, req.query);
  const slots = await calcularDisponibilidade(params);
  res.json({ data: slots });
}
