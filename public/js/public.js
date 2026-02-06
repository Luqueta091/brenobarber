const unitSlugEl = document.getElementById("unitSlug");
const unitNameEl = document.getElementById("unitName");
const servicoEl = document.getElementById("servico");
const dataEl = document.getElementById("data");
const slotsEl = document.getElementById("slots");
const slotsEmptyEl = document.getElementById("slotsEmpty");
const resumoEl = document.getElementById("resumo");
const nomeEl = document.getElementById("nome");
const telefoneEl = document.getElementById("telefone");
const confirmarEl = document.getElementById("confirmar");
const verMeusEl = document.getElementById("verMeus");
const mensagemEl = document.getElementById("mensagem");

const unitSlug = window.location.pathname.replace("/", "");
let selectedSlot = null;
let selectedServico = null;

const cachedNome = localStorage.getItem("cliente_nome") || "";
const cachedTelefone = localStorage.getItem("cliente_telefone") || "";
if (cachedNome) nomeEl.value = cachedNome;
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

async function carregarUnidade() {
  unitSlugEl.textContent = unitSlug;
  const { data } = await fetchJson(`/public/unidades/${unitSlug}`);
  unitNameEl.textContent = data.nome;
}

async function carregarServicos() {
  const { data } = await fetchJson("/public/servicos");
  servicoEl.innerHTML = data
    .map((servico) => `<option value="${servico.id}">${servico.nome}</option>`)
    .join("");
  selectedServico = servicoEl.value;
}

function renderSlots(slots) {
  slotsEl.innerHTML = "";
  slotsEmptyEl.style.display = slots.length === 0 ? "block" : "none";
  selectedSlot = null;
  slots.forEach((slot) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot";
    const date = new Date(slot.inicioEm);
    btn.textContent = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    btn.addEventListener("click", () => {
      document.querySelectorAll(".slot").forEach((el) => el.classList.remove("selected"));
      btn.classList.add("selected");
      selectedSlot = slot;
      atualizarResumo();
    });
    slotsEl.appendChild(btn);
  });
}

function atualizarResumo() {
  if (!selectedSlot || !dataEl.value || !selectedServico) {
    resumoEl.style.display = "none";
    return;
  }
  const date = new Date(selectedSlot.inicioEm);
  resumoEl.textContent = `Selecionado: ${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  resumoEl.style.display = "block";
}

async function carregarSlots() {
  if (!dataEl.value || !servicoEl.value) {
    return;
  }
  setMensagem("");
  const { data } = await fetchJson(
    `/public/disponibilidade?unidadeSlug=${unitSlug}&data=${dataEl.value}&servicoId=${servicoEl.value}`
  );
  renderSlots(data);
  atualizarResumo();
}

confirmarEl.addEventListener("click", async () => {
  try {
    setMensagem("");
    confirmarEl.disabled = true;
    if (!selectedSlot) {
      setMensagem("Selecione um horário.", true);
      confirmarEl.disabled = false;
      return;
    }
    if (!nomeEl.value || !telefoneEl.value) {
      setMensagem("Informe nome e telefone.", true);
      confirmarEl.disabled = false;
      return;
    }
    const payload = {
      unidadeSlug: unitSlug,
      servicoId: servicoEl.value,
      inicioEm: selectedSlot.inicioEm,
      nome: nomeEl.value,
      telefone: telefoneEl.value
    };
    const { data } = await fetchJson("/public/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    localStorage.setItem("cliente_nome", nomeEl.value);
    localStorage.setItem("cliente_telefone", telefoneEl.value);
    localStorage.setItem(
      "ultimo_agendamento",
      JSON.stringify({
        id: data.id,
        unidade: data.unidade?.nome,
        servico: data.servico?.nome,
        inicioEm: data.inicioEm,
        fimEm: data.fimEm
      })
    );

    window.location.href = "/confirmacao";
  } catch (error) {
    setMensagem(error.message || "Erro ao confirmar", true);
    confirmarEl.disabled = false;
  }
});

verMeusEl.addEventListener("click", () => {
  window.location.href = "/meus-agendamentos";
});

servicoEl.addEventListener("change", () => {
  selectedServico = servicoEl.value;
  carregarSlots();
});

dataEl.addEventListener("change", carregarSlots);

(async () => {
  try {
    await carregarUnidade();
    await carregarServicos();
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, "0");
    const dd = String(hoje.getDate()).padStart(2, "0");
    dataEl.value = `${yyyy}-${mm}-${dd}`;
    carregarSlots();
  } catch (error) {
    setMensagem("Erro ao carregar dados", true);
  }
})();
