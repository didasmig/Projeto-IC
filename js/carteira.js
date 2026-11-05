
/* =================================
   FUNCIONALIDADES DA CARTEIRA
================================= */

// =================================
// OCULTAR / MOSTRAR SALDO
// =================================

const botoesOcultarSaldo = document.querySelector(
    '[data-acao="ocultar-saldo"]'
);

let saldoVisivel = true;

if (botoesOcultarSaldo) {

    botoesOcultarSaldo.addEventListener("click", () => {

        saldoVisivel = !saldoVisivel;

        if (saldoVisivel) {

            mostrarSaldo();

            botoesOcultarSaldo.innerHTML = "◉";

        } else {

            document.querySelectorAll("[data-saldo]").forEach((elemento) => {
                elemento.textContent = "••••••";
            });

            botoesOcultarSaldo.innerHTML = "◎";

        }

    });

}


// =================================
// DEPOSITAR
// =================================

const botaoDepositar = document.querySelector(
    '[data-acao="depositar"]'
);

if (botaoDepositar) {

    botaoDepositar.addEventListener("click", () => {

        window.location.href = "depositar.html";

    });

}


// =================================
// OUTRAS OPERAÇÕES
// =================================

const botaoPagamento = document.querySelector(
    '[data-acao="pagamento"]'
);

if (botaoPagamento) {

    botaoPagamento.addEventListener("click", () => {

        alert("Funcionalidade de pagamento em desenvolvimento.");

    });

}


const botaoTransferir = document.querySelector(
    '[data-acao="transferir"]'
);

if (botaoTransferir) {

    botaoTransferir.addEventListener("click", () => {

        alert("Funcionalidade de transferência em desenvolvimento.");

    });

}


const botaoConsultar = document.querySelector(
    '[data-acao="conta-conjunta"]'
);

if (botaoConsultar) {

    botaoConsultar.addEventListener("click", () => {

        alert("Conta Conjunta em desenvolvimento.");

    });

}
