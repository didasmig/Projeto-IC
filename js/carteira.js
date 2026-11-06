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

const botaoDepositar = document.querySelector(
    '[data-acao="depositar"]'
);

if (botaoDepositar) {

    botaoDepositar.addEventListener("click", () => {

        window.location.href = "depositar.html";

    });

}

const botaoPagamento = document.querySelector(
    '[data-acao="pagamento"]'
);

if (botaoPagamento) {
    botaoPagamento.addEventListener("click", () => {
        window.location.href = "pagamento.html";
    });
}

const botaoTransferir = document.querySelector(
    '[data-acao="transferir"]'
);

if (botaoTransferir) {

    botaoTransferir.addEventListener("click", () => {

        window.location.href = "transferir.html";

    });

}


const botaoConsultar = document.querySelector(
    '[data-acao="conta-conjunta"]'
);

if (botaoConsultar) {

    botaoConsultar.addEventListener("click", () => {

        window.location.href = "conta_conjunta.html";

    });

}

function mostrarMovimentos() {
    const listaMovimentos = document.querySelector("#lista-movimentos");

    if (!listaMovimentos) {
        return;
    }

    // Guardar os movimentos iniciais apenas uma vez
    if (localStorage.getItem("movimentosIniciaisBanDy") === null) {
        const movimentosIniciais = listaMovimentos.innerHTML;

        localStorage.setItem(
            "movimentosIniciaisBanDy",
            movimentosIniciais
        );
    }

    const movimentosIniciais = localStorage.getItem("movimentosIniciaisBanDy");

    const movimentos = JSON.parse(
        localStorage.getItem("movimentosBanDy") || "[]"
    );

    listaMovimentos.innerHTML = "";

    movimentos.slice(0, 10).forEach((movimento) => {
        const elementoMovimento = document.createElement("div");
        elementoMovimento.classList.add("movimento");

        const nomeMovimento = document.createElement("span");
        nomeMovimento.classList.add("nome-movimento");
        nomeMovimento.textContent = "Depósito";

        const valorMovimento = document.createElement("span");
        valorMovimento.classList.add("valor-positivo");

        valorMovimento.textContent = "+ " +
            Number(movimento.valor).toLocaleString("pt-PT", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + " €";

        elementoMovimento.appendChild(nomeMovimento);
        elementoMovimento.appendChild(valorMovimento);

        listaMovimentos.appendChild(elementoMovimento);
    });

    const quantidadeRestante = 10 - movimentos.length;

    if (quantidadeRestante > 0) {
        const recipiente = document.createElement("div");
        recipiente.innerHTML = movimentosIniciais;

        const movimentosAntigos = Array.from(
            recipiente.querySelectorAll(".movimento")
        );

        movimentosAntigos
            .slice(0, quantidadeRestante)
            .forEach((movimento) => {
                listaMovimentos.appendChild(movimento);
            });
    }
}

mostrarMovimentos();