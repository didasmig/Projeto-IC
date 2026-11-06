const compras = [
    { destino: "Restaurante", valor: 50.00 }
];

const popup = document.getElementById("popup-pagamento");
const popupTitulo = document.getElementById("popup-titulo");
const popupValor = document.getElementById("popup-valor");
const popupDestino = document.getElementById("popup-destino");
const popupSaldo = document.getElementById("popup-saldo");

function formatarEuros(valor) {
    return valor.toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " €";
}

function simularPagamento(metodo) {

    // Escolher uma compra ao acaso
    const compra = compras[Math.floor(Math.random() * compras.length)];
    const saldo = obterSaldo();

    // Saldo insuficiente
    if (compra.valor > saldo) {
        popupTitulo.textContent = "Saldo insuficiente";
        popupValor.textContent = "- " + formatarEuros(compra.valor);
        popupDestino.textContent = "Destino: " + compra.destino;
        popupSaldo.textContent = "Saldo atual: " + formatarEuros(saldo);
        popup.hidden = false;
        return;
    }

    // Atualizar saldo
    const novoSaldo = saldo - compra.valor;
    atualizarSaldo(novoSaldo);

    // Guardar no histórico de movimentos
    const movimentos = JSON.parse(
        localStorage.getItem("movimentosBanDy") || "[]"
    );

    movimentos.unshift({
        tipo: "pagamento",
        destinatario: compra.destino,
        valor: compra.valor,
        data: new Date().toISOString()
    });

    localStorage.setItem(
        "movimentosBanDy",
        JSON.stringify(movimentos.slice(0, 10))
    );

    // Mostrar pop-up
    popupTitulo.textContent = "Pagamento realizado";
    popupValor.textContent = "- " + formatarEuros(compra.valor);
    popupDestino.textContent = "Destino: " + compra.destino + " (" + metodo + ")";
    popupSaldo.textContent = "Novo saldo: " + formatarEuros(novoSaldo);
    popup.hidden = false;
}

document.querySelectorAll(".botao-pagamento").forEach((botao) => {
    botao.addEventListener("click", () => {
        simularPagamento(botao.dataset.metodo);
    });
});

document.getElementById("popup-fechar").addEventListener("click", () => {
    popup.hidden = true;
});

// Fechar ao clicar fora da caixa
popup.addEventListener("click", (e) => {
    if (e.target === popup) {
        popup.hidden = true;
    }
});