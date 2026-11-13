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

// Pagamento feito com a conta conjunta (pagamento.html?conta=conjunta)
const modoConjunta =
    new URLSearchParams(window.location.search).get("conta") === "conjunta";

// Pagar com o saldo da conta conjunta
function pagarComContaConjunta(compra, metodo) {

    // Ler as contas outra vez: o outro titular pode ter feito alterações
    const contas = obterContasConjuntas();
    const eu = obterUtilizador();
    const conta = contas.find((item) => item.titulares.includes(eu.id));

    if (!conta) {
        window.location.href = "conta_conjunta.html";
        return;
    }

    // Saldo insuficiente
    if (compra.valor > conta.saldo) {
        popupTitulo.textContent = "Saldo insuficiente";
        popupValor.textContent = "- " + formatarEuros(compra.valor);
        popupDestino.textContent = "Destino: " + compra.destino;
        popupSaldo.textContent = "Saldo da conta conjunta: " + formatarEuros(conta.saldo);
        popup.hidden = false;
        return;
    }

    conta.saldo = arredondar(conta.saldo - compra.valor);

    // Guardar no histórico da conta conjunta (últimos 20 movimentos)
    conta.movimentos.unshift({
        tipo: "pagamento",
        valor: compra.valor,
        autor: eu.id,
        destinatario: compra.destino,
        data: new Date().toISOString()
    });

    conta.movimentos = conta.movimentos.slice(0, 20);

    guardarContasConjuntas(contas);

    mostrarSaldoDaContaConjunta();

    // Mostrar pop-up
    popupTitulo.textContent = "Pagamento realizado";
    popupValor.textContent = "- " + formatarEuros(compra.valor);
    popupDestino.textContent = "Destino: " + compra.destino + " (" + metodo + ")";
    popupSaldo.textContent = "Novo saldo da conta conjunta: " + formatarEuros(conta.saldo);
    popup.hidden = false;
}

// No modo conta conjunta o cabeçalho mostra o saldo da conta conjunta
function mostrarSaldoDaContaConjunta() {

    const conta = obterContaConjunta();

    if (!conta) {
        return;
    }

    document.querySelectorAll("[data-saldo]").forEach((elemento) => {
        elemento.textContent = formatarEuros(conta.saldo);
    });
}

document.addEventListener("DOMContentLoaded", () => {

    if (!modoConjunta || !temSessao()) {
        return;
    }

    const conta = obterContaConjunta();

    // Sem conta conjunta: voltar à página da conta conjunta
    if (!conta) {
        window.location.href = "conta_conjunta.html";
        return;
    }

    document.getElementById("botao-voltar-pagamento").href = "conta_conjunta.html";

    const subtitulo = document.getElementById("subtitulo-pagamento");
    subtitulo.textContent = "Conta conjunta: " + conta.nome;
    subtitulo.hidden = false;

    mostrarSaldoDaContaConjunta();
});

function simularPagamento(metodo) {

    // É preciso ter sessão iniciada para pagar
    if (!temSessao()) {
        mostrarBloqueioBanDy();
        return;
    }

    // Escolher uma compra ao acaso
    const compra = compras[Math.floor(Math.random() * compras.length)];

    if (modoConjunta) {
        pagarComContaConjunta(compra, metodo);
        return;
    }

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