
/* =================================
   GESTÃO DO SALDO DA BANDUP
================================= */

// Saldo inicial da aplicação
const SALDO_INICIAL = 34.29;

// Verificar se já existe um saldo guardado
if (localStorage.getItem("saldoBandUp") === null) {

    localStorage.setItem(
        "saldoBandUp",
        SALDO_INICIAL
    );

}


// Obter o saldo atual
function obterSaldo() {

    return Number(
        localStorage.getItem("saldoBandUp")
    );

}


// Atualizar o saldo
function atualizarSaldo(novoSaldo) {

    localStorage.setItem(
        "saldoBandUp",
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


    // Atualizar todos os elementos com data-saldo
    document.querySelectorAll("[data-saldo]").forEach((elemento) => {

        elemento.textContent = saldoFormatado;

    });

}


// Executar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {

    mostrarSaldo();

});
