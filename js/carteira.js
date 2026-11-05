//--script para carteira--//

// Elementos da página
const valorSaldo = document.querySelector(".valor-saldo");
const botaoOcultarSaldo = document.querySelector(
    '[data-acao="ocultar-saldo"]'
);


// =================================
// OCULTAR / MOSTRAR SALDO
// =================================

let saldoVisivel = true;

botaoOcultarSaldo.addEventListener("click", () => {

    saldoVisivel = !saldoVisivel;

    if (saldoVisivel) {
        valorSaldo.textContent = "34,25 €";
        botaoOcultarSaldo.textContent = "◉";
    } else {
        valorSaldo.textContent = "••••••";
        botaoOcultarSaldo.textContent = "◎";
    }

});


// =================================
// OPERAÇÕES DA CARTEIRA
// =================================

// Depositar
document.querySelector('[data-acao="depositar"]')
    .addEventListener("click", () => {

        alert("Abrir página de depósito.");

    });


// Pagamento
document.querySelector('[data-acao="pagamento"]')
    .addEventListener("click", () => {

        alert("Abrir página de pagamento.");

    });


// Transferir
document.querySelector('[data-acao="transferir"]')
    .addEventListener("click", () => {

        alert("Abrir página de transferência.");

    });


// Consultar conta
document.querySelector('[data-acao="consultar-conta"]')
    .addEventListener("click", () => {

        alert("Consultar dados da conta.");

    });