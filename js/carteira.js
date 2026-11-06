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

        alert("Conta Conjunta em desenvolvimento.");

    });

}

// MOSTRAR ÚLTIMOS MOVIMENTOS

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

    // Mostrar ambos os depósitos e as transferências
    movimentos.slice(0, 10).forEach((movimento) => {

        const elementoMovimento = document.createElement("article");
        elementoMovimento.classList.add("movimento");

        const nomeMovimento = document.createElement("span");
        nomeMovimento.classList.add("nome-movimento");

        const valorMovimento = document.createElement("span");

        const valorFormatado = Number(movimento.valor).toLocaleString("pt-PT", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        if (movimento.tipo === "transferencia") {

            // Transferência: valor negativo
            nomeMovimento.textContent =
                "Transferência - " + movimento.destinatario;

            valorMovimento.classList.add("valor-negativo");

            valorMovimento.textContent = "- " + valorFormatado + " €";

        } else if (movimento.tipo === "deposito") {

            // Depósito: valor positivo
            nomeMovimento.textContent = "Depósito";

            valorMovimento.classList.add("valor-positivo");

            valorMovimento.textContent = "+ " + valorFormatado + " €";

        } else {
            return;
        }

        elementoMovimento.appendChild(nomeMovimento);
        elementoMovimento.appendChild(valorMovimento);

        listaMovimentos.appendChild(elementoMovimento);
    });

    // Completar até 10 movimentos com os 3 iniciais
    const quantidadeRestante = Math.max(0, 10 - movimentos.length);

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