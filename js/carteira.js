
/* =================================
   FUNCIONALIDADES DA CARTEIRA
================================= */


// =================================
// OCULTAR / MOSTRAR SALDO
// =================================

const valorSaldo = document.querySelector(".valor-saldo");

const botaoOcultarSaldo = document.querySelector(
    '[data-acao="ocultar-saldo"]'
);

let saldoVisivel = true;


if (botaoOcultarSaldo && valorSaldo) {

    botaoOcultarSaldo.addEventListener("click", () => {

        saldoVisivel = !saldoVisivel;

        if (saldoVisivel) {

            mostrarSaldo();

            valorSaldo.style.visibility = "visible";

            botaoOcultarSaldo.innerHTML = "◉";

        } else {

            valorSaldo.textContent = "••••••";

            botaoOcultarSaldo.innerHTML = "◎";

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
    '[data-acao="consultar-conta"]'
);

if (botaoConsultar) {

    botaoConsultar.addEventListener("click", () => {

        alert("Consulta de conta em desenvolvimento.");

    });

}
