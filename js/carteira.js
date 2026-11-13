
// OCULTAR E MOSTRAR SALDO

const botaoOcultarSaldo = document.querySelector(
    '[data-acao="ocultar-saldo"]'
);

let saldoVisivel = true;

if (botaoOcultarSaldo) {

    botaoOcultarSaldo.addEventListener("click", () => {

        saldoVisivel = !saldoVisivel;

        if (saldoVisivel) {

            mostrarSaldo();

            botaoOcultarSaldo.innerHTML = "◉";

        } else {

            document.querySelectorAll("[data-saldo]")
                .forEach((elemento) => {
                    elemento.textContent = "••••••";
                });

            botaoOcultarSaldo.innerHTML = "◎";
        }
    });
}

/* =================================
   BOTÕES DA CARTEIRA
================================= */

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

/* =================================
   ÚLTIMOS MOVIMENTOS
================================= */

function mostrarMovimentos() {

    const listaMovimentos = document.querySelector(
        "#lista-movimentos"
    );

    if (!listaMovimentos) {
        return;
    }

    // Guardar os 3 movimentos iniciais do HTML
    const movimentosIniciais = listaMovimentos.innerHTML;

    // Obter movimentos da conta atual
    const movimentos = obterMovimentos();

    listaMovimentos.innerHTML = "";

    movimentos.slice(0, 10).forEach((movimento) => {

        const elementoMovimento = document.createElement(
            "article"
        );

        elementoMovimento.classList.add("movimento");

        const nomeMovimento = document.createElement("span");
        nomeMovimento.classList.add("nome-movimento");

        const valorMovimento = document.createElement("span");

        const valorFormatado = Number(
            movimento.valor
        ).toLocaleString("pt-PT", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // Transferência
        if (movimento.tipo === "transferencia") {

            nomeMovimento.textContent =
                "Transferência - " + movimento.destinatario;

            valorMovimento.classList.add("valor-negativo");

            valorMovimento.textContent =
                "- " + valorFormatado + " €";

        // Depósito
        } else if (movimento.tipo === "deposito") {

            nomeMovimento.textContent = "Depósito";

            valorMovimento.classList.add("valor-positivo");

            valorMovimento.textContent =
                "+ " + valorFormatado + " €";

        // Pagamento
        } else if (movimento.tipo === "pagamento") {

            nomeMovimento.textContent =
                "Pagamento - " + movimento.destinatario;

            valorMovimento.classList.add("valor-negativo");

            valorMovimento.textContent =
                "- " + valorFormatado + " €";

        // Compra de bilhete
        } else if (movimento.tipo === "bilhete") {

            nomeMovimento.textContent =
                "Bilhete - " + movimento.destinatario;

            valorMovimento.classList.add("valor-negativo");

            valorMovimento.textContent =
                "- " + valorFormatado + " €";

        } else {
            return;
        }

        elementoMovimento.appendChild(nomeMovimento);
        elementoMovimento.appendChild(valorMovimento);

        listaMovimentos.appendChild(elementoMovimento);
    });

    // Completar com os 3 movimentos de exemplo
    const quantidadeRestante = Math.max(
        0,
        10 - movimentos.length
    );

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
