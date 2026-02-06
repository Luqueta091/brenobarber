const adminTokenEl = document.getElementById("adminToken");
const salvarTokenEl = document.getElementById("salvarToken");
const authMsgEl = document.getElementById("authMsg");

const servicosListaEl = document.getElementById("servicosLista");
const novoServicoNomeEl = document.getElementById("novoServicoNome");
const novoServicoDuracaoEl = document.getElementById("novoServicoDuracao");
const novoServicoPrecoEl = document.getElementById("novoServicoPreco");
const criarServicoEl = document.getElementById("criarServico");

const horarioUnidadeEl = document.getElementById("horarioUnidade");
const horarioDiaEl = document.getElementById("horarioDia");
const horarioInicioEl = document.getElementById("horarioInicio");
const horarioFimEl = document.getElementById("horarioFim");
const criarHorarioEl = document.getElementById("criarHorario");
const horariosListaEl = document.getElementById("horariosLista");

const bloqueioUnidadeEl = document.getElementById("bloqueioUnidade");
const bloqueioInicioEl = document.getElementById("bloqueioInicio");
const bloqueioFimEl = document.getElementById("bloqueioFim");
const bloqueioMotivoEl = document.getElementById("bloqueioMotivo");
const criarBloqueioEl = document.getElementById("criarBloqueio");
const bloqueiosListaEl = document.getElementById("bloqueiosLista");

const agendaUnidadeEl = document.getElementById("agendaUnidade");
const agendaDataEl = document.getElementById("agendaData");
const carregarAgendaEl = document.getElementById("carregarAgenda");
const agendaListaEl = document.getElementById("agendaLista");

const agendaSemanaUnidadeEl = document.getElementById("agendaSemanaUnidade");
const agendaSemanaInicioEl = document.getElementById("agendaSemanaInicio");
const carregarAgendaSemanaEl = document.getElementById("carregarAgendaSemana");
const agendaSemanaListaEl = document.getElementById("agendaSemanaLista");

const storedToken = localStorage.getItem("admin_token") || "";
adminTokenEl.value = storedToken;

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

async function fetchJson(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    "x-admin-token": getToken()
  };
  const response = await fetch(url, { cache: "no-store", ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Erro inesperado");
  }
  return data;
}

function setAuthMsg(text) {
  authMsgEl.textContent = text;
}

salvarTokenEl.addEventListener("click", () => {
  localStorage.setItem("admin_token", adminTokenEl.value.trim());
  setAuthMsg("Token salvo.");
  carregarTudo();
});

async function carregarUnidades() {
  const { data } = await fetch("/public/unidades", { cache: "no-store" }).then((res) => res.json());
  const options = data.map((unidade) => `<option value="${unidade.id}">${unidade.nome}</option>`);
  horarioUnidadeEl.innerHTML = options.join("");
  agendaUnidadeEl.innerHTML = options.join("");
  agendaSemanaUnidadeEl.innerHTML = options.join("");
  bloqueioUnidadeEl.innerHTML = `<option value="">Global</option>${options.join("")}`;
}

async function carregarServicos() {
  const { data } = await fetchJson("/admin/servicos");
  servicosListaEl.innerHTML = "";
  data.forEach((servico) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <strong>${servico.nome}</strong><br />
      ${servico.duracaoMinutos} min - R$ ${Number(servico.preco).toFixed(2)}<br />
      <small class="muted">${servico.ativo ? "Ativo" : "Inativo"}</small>
    `;
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = servico.ativo ? "Desativar" : "Ativar";
    toggleBtn.className = "secondary";
    toggleBtn.style.marginTop = "10px";
    toggleBtn.addEventListener("click", async () => {
      const path = servico.ativo ? "desativar" : "ativar";
      await fetchJson(`/admin/servicos/${servico.id}/${path}`, { method: "PATCH" });
      carregarServicos();
    });
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remover";
    removeBtn.className = "secondary";
    removeBtn.style.marginTop = "10px";
    removeBtn.addEventListener("click", async () => {
      await fetchJson(`/admin/servicos/${servico.id}`, { method: "DELETE" });
      carregarServicos();
    });
    item.appendChild(toggleBtn);
    item.appendChild(removeBtn);
    servicosListaEl.appendChild(item);
  });
}

criarServicoEl.addEventListener("click", async () => {
  const nome = novoServicoNomeEl.value.trim();
  const duracao = Number(novoServicoDuracaoEl.value);
  const preco = Number(novoServicoPrecoEl.value);
  if (!nome || !duracao || Number.isNaN(preco)) {
    return;
  }
  await fetchJson("/admin/servicos", {
    method: "POST",
    body: JSON.stringify({ nome, duracaoMinutos: duracao, preco })
  });
  novoServicoNomeEl.value = "";
  novoServicoDuracaoEl.value = "";
  novoServicoPrecoEl.value = "";
  carregarServicos();
});

async function carregarHorarios() {
  const unidadeId = horarioUnidadeEl.value;
  if (!unidadeId) return;
  const { data } = await fetchJson(`/admin/horarios-trabalho?unidadeId=${unidadeId}`);
  horariosListaEl.innerHTML = "";
  data.forEach((horario) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.textContent = `Dia ${horario.diaSemana} - ${horario.horaInicio} às ${horario.horaFim}`;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remover";
    removeBtn.className = "secondary";
    removeBtn.style.marginTop = "10px";
    removeBtn.addEventListener("click", async () => {
      await fetchJson(`/admin/horarios-trabalho/${horario.id}`, { method: "DELETE" });
      carregarHorarios();
    });
    item.appendChild(removeBtn);
    horariosListaEl.appendChild(item);
  });
}

criarHorarioEl.addEventListener("click", async () => {
  const payload = {
    unidadeId: horarioUnidadeEl.value,
    diaSemana: Number(horarioDiaEl.value),
    horaInicio: horarioInicioEl.value,
    horaFim: horarioFimEl.value
  };
  await fetchJson("/admin/horarios-trabalho", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  carregarHorarios();
});

horarioUnidadeEl.addEventListener("change", carregarHorarios);

async function carregarBloqueios() {
  const unidadeId = bloqueioUnidadeEl.value;
  const now = new Date();
  const start = now.toISOString();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const query = new URLSearchParams({ inicioEm: start, fimEm: end });
  if (unidadeId) query.append("unidadeId", unidadeId);
  const { data } = await fetchJson(`/admin/bloqueios?${query.toString()}`);
  bloqueiosListaEl.innerHTML = "";
  data.forEach((bloqueio) => {
    const inicio = new Date(bloqueio.inicioEm);
    const fim = new Date(bloqueio.fimEm);
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `${inicio.toLocaleString("pt-BR")} - ${fim.toLocaleString("pt-BR")} (${
      bloqueio.motivo || "sem motivo"
    })`;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remover";
    removeBtn.className = "secondary";
    removeBtn.style.marginTop = "10px";
    removeBtn.addEventListener("click", async () => {
      await fetchJson(`/admin/bloqueios/${bloqueio.id}`, { method: "DELETE" });
      carregarBloqueios();
    });
    item.appendChild(removeBtn);
    bloqueiosListaEl.appendChild(item);
  });
}

criarBloqueioEl.addEventListener("click", async () => {
  if (!bloqueioInicioEl.value || !bloqueioFimEl.value) {
    return;
  }
  const payload = {
    inicioEm: new Date(bloqueioInicioEl.value).toISOString(),
    fimEm: new Date(bloqueioFimEl.value).toISOString(),
    motivo: bloqueioMotivoEl.value.trim() || undefined,
    unidadeId: bloqueioUnidadeEl.value || null
  };
  await fetchJson("/admin/bloqueios", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  carregarBloqueios();
});

bloqueioUnidadeEl.addEventListener("change", carregarBloqueios);

async function carregarAgenda() {
  const unidadeId = agendaUnidadeEl.value;
  const data = agendaDataEl.value;
  if (!unidadeId || !data) return;
  const { data: agenda } = await fetchJson(
    `/admin/agenda/dia?unidadeId=${unidadeId}&data=${data}`
  );
  agendaListaEl.innerHTML = "";
  agenda.forEach((agendamento) => {
    const item = document.createElement("div");
    item.className = "list-item";
    const inicio = new Date(agendamento.inicioEm);
    item.innerHTML = `
      <strong>${agendamento.cliente.nome}</strong><br />
      ${agendamento.servico.nome}<br />
      ${inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - ${agendamento.status}
    `;
    const actions = document.createElement("div");
    actions.className = "inline";
    actions.style.marginTop = "8px";
    const cancelBtn = createAction("Cancelar", () => atualizarStatus(agendamento.id, "cancelar"));
    const iniciarBtn = createAction("Iniciar", () => atualizarStatus(agendamento.id, "iniciar"));
    const concluirBtn = createAction("Concluir", () => atualizarStatus(agendamento.id, "concluir"));
    const faltaBtn = createAction("Falta", () => atualizarStatus(agendamento.id, "falta"));
    actions.append(cancelBtn, iniciarBtn, concluirBtn, faltaBtn);
    item.appendChild(actions);
    agendaListaEl.appendChild(item);
  });
}

async function carregarAgendaSemana() {
  const unidadeId = agendaSemanaUnidadeEl.value;
  const dataInicio = agendaSemanaInicioEl.value;
  if (!unidadeId || !dataInicio) return;
  const { data: agenda } = await fetchJson(
    `/admin/agenda/semana?unidadeId=${unidadeId}&dataInicio=${dataInicio}`
  );
  agendaSemanaListaEl.innerHTML = "";
  if (agenda.length === 0) {
    agendaSemanaListaEl.innerHTML = "<div class=\"list-item\">Sem agenda.</div>";
    return;
  }
  const grouped = agenda.reduce((acc, agendamento) => {
    const dateKey = new Date(agendamento.inicioEm).toISOString().slice(0, 10);
    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(agendamento);
    return acc;
  }, {});
  Object.entries(grouped).forEach(([dateKey, items]) => {
    const header = document.createElement("div");
    header.className = "list-item";
    header.innerHTML = `<strong>${new Date(dateKey).toLocaleDateString("pt-BR")}</strong>`;
    agendaSemanaListaEl.appendChild(header);
    items.forEach((agendamento) => {
      const item = document.createElement("div");
      item.className = "list-item";
      const inicio = new Date(agendamento.inicioEm);
      item.innerHTML = `
        <strong>${agendamento.cliente.nome}</strong><br />
        ${agendamento.servico.nome}<br />
        ${inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - ${
          agendamento.status
        }
      `;
      const actions = document.createElement("div");
      actions.className = "inline";
      actions.style.marginTop = "8px";
      const cancelBtn = createAction("Cancelar", () =>
        atualizarStatus(agendamento.id, "cancelar", carregarAgendaSemana)
      );
      const iniciarBtn = createAction("Iniciar", () =>
        atualizarStatus(agendamento.id, "iniciar", carregarAgendaSemana)
      );
      const concluirBtn = createAction("Concluir", () =>
        atualizarStatus(agendamento.id, "concluir", carregarAgendaSemana)
      );
      const faltaBtn = createAction("Falta", () =>
        atualizarStatus(agendamento.id, "falta", carregarAgendaSemana)
      );
      actions.append(cancelBtn, iniciarBtn, concluirBtn, faltaBtn);
      item.appendChild(actions);
      agendaSemanaListaEl.appendChild(item);
    });
  });
}

function createAction(label, onClick) {
  const btn = document.createElement("button");
  btn.className = "secondary";
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

async function atualizarStatus(id, action, refresh) {
  await fetchJson(`/admin/agendamentos/${id}/${action}`, { method: "POST" });
  if (typeof refresh === "function") {
    refresh();
  } else {
    carregarAgenda();
  }
}

carregarAgendaEl.addEventListener("click", carregarAgenda);
carregarAgendaSemanaEl.addEventListener("click", carregarAgendaSemana);

async function carregarTudo() {
  if (!getToken()) {
    setAuthMsg("Informe o token admin.");
    return;
  }
  await carregarUnidades();
  await carregarServicos();
  await carregarHorarios();
  await carregarBloqueios();
}

(async () => {
  if (storedToken) {
    agendaDataEl.value = new Date().toISOString().slice(0, 10);
    agendaSemanaInicioEl.value = new Date().toISOString().slice(0, 10);
    await carregarTudo();
  }
})();
