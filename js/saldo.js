/* =================================
   GESTÃO DO SALDO DA BANDY
================================= */

// Saldo inicial da aplicação
const SALDO_INICIAL = 34.29;

// Verificar se já existe um saldo guardado
if (localStorage.getItem("saldoBanDy") === null) {

    localStorage.setItem(
        "saldoBanDy",
        SALDO_INICIAL
    );

}


// Obter o saldo atual
function obterSaldo() {

    return Number(
        localStorage.getItem("saldoBanDy")
    );

}


// Atualizar o saldo
function atualizarSaldo(novoSaldo) {

    localStorage.setItem(
        "saldoBanDy",
        novoSaldo.toFixed(2)
    );

    mostrarSaldo();

}


// Mostrar o saldo nas páginas
function mostrarSaldo() {

    const saldo = obterSaldo();

    const saldoFormatado = saldo.toLocaleString(
        "pt-PT",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + " €";

    document.querySelectorAll("[data-saldo]").forEach((elemento) => {

        elemento.textContent = saldoFormatado;

    });

}

document.addEventListener("DOMContentLoaded", () => {

    mostrarSaldo();

});


// Executar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {

    mostrarSaldo();

});
