import { Router } from "express";
import { obterDisponibilidade } from "./controllers/disponibilidade.controller.js";

export const disponibilidadeRouter = Router();

disponibilidadeRouter.get("/disponibilidade", obterDisponibilidade);
