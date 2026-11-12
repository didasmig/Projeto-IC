// Compras possíveis (simulação)
const compras = [
    { destino: "Água", valor: 1.50 },
    { destino: "Bar", valor: 4.50 },
    { destino: "Comida", valor: 8.50 },
    { destino: "Restaurante", valor: 12.00 },
    { destino: "Loja do festival", valor: 18.90 },
    { destino: "Merchandising", valor: 25.00 }
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

    // É preciso ter sessão iniciada para pagar
    if (!temSessao()) {
        mostrarBloqueioBanDy();
        return;
    }

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
    const novoSaldo = Math.round((saldo - compra.valor) * 100) / 100;
    atualizarSaldo(novoSaldo);

    
    // Guardar pagamento no histórico da conta atual
    guardarMovimento({
        tipo: "pagamento",
        destinatario: compra.destino,
        valor: compra.valor
    });

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

// Fechar com a tecla Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        popup.hidden = true;
    }
});

// Fechar ao clicar fora da caixa
popup.addEventListener("click", (e) => {
    if (e.target === popup) {
        popup.hidden = true;
    }
});