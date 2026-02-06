const telefoneEl = document.getElementById("telefone");
const buscarEl = document.getElementById("buscar");
const listaEl = document.getElementById("lista");
const mensagemEl = document.getElementById("mensagem");
const buscaFormEl = document.getElementById("buscaForm");

const cachedTelefone = localStorage.getItem("cliente_telefone") || "";
if (cachedTelefone) telefoneEl.value = cachedTelefone;

async function fetchJson(url, options) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Erro inesperado");
  }
  return data;
}

function setMensagem(text, isError = false) {
  mensagemEl.textContent = text;
  mensagemEl.style.color = isError ? "#7a2e12" : "";
}

function renderAgendamentos(agendamentos) {
  listaEl.innerHTML = "";
  if (agendamentos.length === 0) {
    listaEl.innerHTML = "<div class=\"list-item\">Nenhum agendamento ativo.</div>";
    return;
  }
  agendamentos.forEach((agendamento) => {
    const item = document.createElement("div");
    item.className = "list-item";
    const inicio = new Date(agendamento.inicioEm);
    item.innerHTML = `
      <strong>${agendamento.servico.nome}</strong><br />
      ${agendamento.unidade.nome}<br />
      ${inicio.toLocaleDateString("pt-BR")} ${inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
    `;
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancelar";
    cancelBtn.style.marginTop = "10px";
    cancelBtn.addEventListener("click", async () => {
      try {
        await fetchJson(`/public/agendamentos/${agendamento.id}/cancelar`, { method: "POST" });
        await buscarAgendamentos();
      } catch (error) {
        setMensagem(error.message || "Erro ao cancelar", true);
      }
    });
    item.appendChild(cancelBtn);
    listaEl.appendChild(item);
  });
}

async function buscarAgendamentos() {
  const telefone = telefoneEl.value.trim();
  if (!telefone) {
    setMensagem("Informe o telefone.", true);
    return;
  }
  try {
    setMensagem("");
    const { data } = await fetchJson(`/public/agendamentos?telefone=${encodeURIComponent(telefone)}`);
    localStorage.setItem("cliente_telefone", telefone);
    renderAgendamentos(data);
  } catch (error) {
    setMensagem(error.message || "Erro ao buscar", true);
  }
}

buscarEl.addEventListener("click", buscarAgendamentos);

async function carregarAutomatico() {
  if (!cachedTelefone) {
    return;
  }
  if (buscaFormEl) {
    buscaFormEl.style.display = "none";
  }
  try {
    setMensagem("");
    const { data } = await fetchJson(
      `/public/agendamentos?telefone=${encodeURIComponent(cachedTelefone)}`
    );
    renderAgendamentos(data);
  } catch (error) {
    setMensagem(error.message || "Erro ao buscar", true);
  }
}

carregarAutomatico();
