import { Router } from "express";
import {
  atualizarHorario,
  criarBloqueio,
  criarHorario,
  listarBloqueios,
  listarHorarios,
  removerBloqueio,
  removerHorario
} from "./controllers/agenda.controller.js";

export const agendaAdminRouter = Router();

agendaAdminRouter.post("/horarios-trabalho", criarHorario);
agendaAdminRouter.put("/horarios-trabalho/:id", atualizarHorario);
agendaAdminRouter.delete("/horarios-trabalho/:id", removerHorario);
agendaAdminRouter.get("/horarios-trabalho", listarHorarios);

agendaAdminRouter.post("/bloqueios", criarBloqueio);
agendaAdminRouter.delete("/bloqueios/:id", removerBloqueio);
agendaAdminRouter.get("/bloqueios", listarBloqueios);
