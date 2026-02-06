import type { Request, Response } from "express";
import { parse } from "../../../common/validation/validators.js";
import { conflict, notFound } from "../../../common/errors/app-error.js";
import { criarServicoSchema, atualizarServicoSchema, atualizarUnidadeSchema } from "../dtos/servico.dto.js";
import { catalogoRepository } from "../repository/catalogo.repository.js";

export async function listarUnidades(_req: Request, res: Response) {
  const unidades = await catalogoRepository.listarUnidades();
  res.json({ data: unidades });
}

export async function obterUnidadePorSlug(req: Request, res: Response) {
  const unidade = await catalogoRepository.obterUnidadePorSlug(req.params.slug);
  if (!unidade) {
    throw notFound("Unidade não encontrada");
  }
  res.json({ data: unidade });
}

export async function listarServicosAtivos(_req: Request, res: Response) {
  const servicos = await catalogoRepository.listarServicosAtivos();
  res.json({ data: servicos });
}

export async function listarServicos(_req: Request, res: Response) {
  const servicos = await catalogoRepository.listarServicos();
  res.json({ data: servicos });
}

export async function atualizarUnidade(req: Request, res: Response) {
  const payload = parse(atualizarUnidadeSchema, req.body);
  const unidade = await catalogoRepository.atualizarUnidade(req.params.id, payload);
  res.json({ data: unidade });
}

export async function criarServico(req: Request, res: Response) {
  const payload = parse(criarServicoSchema, req.body);
  const servico = await catalogoRepository.criarServico(payload);
  res.status(201).json({ data: servico });
}

export async function atualizarServico(req: Request, res: Response) {
  const payload = parse(atualizarServicoSchema, req.body);
  const servico = await catalogoRepository.atualizarServico(req.params.id, payload);
  res.json({ data: servico });
}

export async function ativarServico(req: Request, res: Response) {
  const servico = await catalogoRepository.definirAtivo(req.params.id, true);
  res.json({ data: servico });
}

export async function desativarServico(req: Request, res: Response) {
  const servico = await catalogoRepository.definirAtivo(req.params.id, false);
  res.json({ data: servico });
}

export async function removerServico(req: Request, res: Response) {
  const agendamentos = await catalogoRepository.contarAgendamentosPorServico(req.params.id);
  if (agendamentos > 0) {
    throw conflict("Serviço possui agendamentos. Desative para removê-lo do catálogo.");
  }
  const servico = await catalogoRepository.removerServico(req.params.id);
  res.json({ data: servico });
}
