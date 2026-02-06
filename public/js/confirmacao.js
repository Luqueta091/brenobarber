const resumoEl = document.getElementById("resumo");

const ultimo = localStorage.getItem("ultimo_agendamento");
if (!ultimo) {
  resumoEl.innerHTML = "<div class=\"list-item\">Nenhum agendamento recente.</div>";
} else {
  const data = JSON.parse(ultimo);
  const inicio = new Date(data.inicioEm);
  const fim = new Date(data.fimEm);
  resumoEl.innerHTML = `
    <div class="list-item">
      <strong>${data.servico || "Serviço"}</strong><br />
      ${data.unidade || "Unidade"}<br />
      ${inicio.toLocaleDateString("pt-BR")} ${inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
      - ${fim.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
    </div>
  `;
}
