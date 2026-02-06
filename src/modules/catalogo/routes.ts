import { Router } from "express";
import {
  ativarServico,
  atualizarServico,
  atualizarUnidade,
  criarServico,
  desativarServico,
  listarServicos,
  listarServicosAtivos,
  listarUnidades,
  obterUnidadePorSlug,
  removerServico
} from "./controllers/catalogo.controller.js";

export const catalogoPublicRouter = Router();
export const catalogoAdminRouter = Router();

catalogoPublicRouter.get("/unidades", listarUnidades);
catalogoPublicRouter.get("/unidades/:slug", obterUnidadePorSlug);
catalogoPublicRouter.get("/servicos", listarServicosAtivos);

catalogoAdminRouter.get("/servicos", listarServicos);
catalogoAdminRouter.put("/unidades/:id", atualizarUnidade);
catalogoAdminRouter.post("/servicos", criarServico);
catalogoAdminRouter.put("/servicos/:id", atualizarServico);
catalogoAdminRouter.patch("/servicos/:id/ativar", ativarServico);
catalogoAdminRouter.patch("/servicos/:id/desativar", desativarServico);
catalogoAdminRouter.delete("/servicos/:id", removerServico);
