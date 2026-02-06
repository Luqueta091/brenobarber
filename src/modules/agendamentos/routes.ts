import { Router } from "express";
import {
  cancelarAgendamentoAdmin,
  cancelarAgendamentoPublico,
  concluirAgendamentoAdmin,
  criarAgendamentoPublico,
  faltaAgendamentoAdmin,
  iniciarAgendamentoAdmin,
  listarAgendaDiaAdmin,
  listarAgendaSemanaAdmin,
  listarAgendamentosPublico
} from "./controllers/agendamentos.controller.js";

export const agendamentosPublicRouter = Router();
export const agendamentosAdminRouter = Router();

agendamentosPublicRouter.post("/agendamentos", criarAgendamentoPublico);
agendamentosPublicRouter.get("/agendamentos", listarAgendamentosPublico);
agendamentosPublicRouter.post("/agendamentos/:id/cancelar", cancelarAgendamentoPublico);

agendamentosAdminRouter.get("/agenda/dia", listarAgendaDiaAdmin);
agendamentosAdminRouter.get("/agenda/semana", listarAgendaSemanaAdmin);

agendamentosAdminRouter.post("/agendamentos/:id/cancelar", cancelarAgendamentoAdmin);
agendamentosAdminRouter.post("/agendamentos/:id/iniciar", iniciarAgendamentoAdmin);
agendamentosAdminRouter.post("/agendamentos/:id/concluir", concluirAgendamentoAdmin);
agendamentosAdminRouter.post("/agendamentos/:id/falta", faltaAgendamentoAdmin);
