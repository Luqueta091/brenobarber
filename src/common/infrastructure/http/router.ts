import { Router } from "express";
import { catalogoPublicRouter, catalogoAdminRouter } from "../../../modules/catalogo/routes.js";
import { agendaAdminRouter } from "../../../modules/agenda/routes.js";
import {
  agendamentosPublicRouter,
  agendamentosAdminRouter
} from "../../../modules/agendamentos/routes.js";
import { disponibilidadeRouter } from "../../../modules/disponibilidade/routes.js";

export const router = Router();

router.use("/public", catalogoPublicRouter);
router.use("/public", disponibilidadeRouter);
router.use("/public", agendamentosPublicRouter);

router.use("/admin", catalogoAdminRouter);
router.use("/admin", agendaAdminRouter);
router.use("/admin", agendamentosAdminRouter);
