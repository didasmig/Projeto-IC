
// CARTÕES DOS FESTIVAIS

function abrirFestival(nome) {

    if (!temSessao()) {
        mostrarBloqueioBanDy();
        return;
    }

    alert("Abrir: " + nome);
}

// ADICIONAR FESTIVAL

function adicionarFestival() {

    if (!temSessao()) {
        mostrarBloqueioBanDy();
        return;
    }

    const nome = prompt("Qual é o nome do festival?");

    if (nome && nome.trim() !== "") {
        alert(nome.trim() + " foi adicionado!");
    }
}

/* =================================
   NAVEGAÇÃO INFERIOR
================================= */

document.addEventListener("DOMContentLoaded", () => {

    const paginaAtual = window.location.pathname;

    const botoes = document.querySelectorAll(
        ".botao-navegacao"
    );

    botoes.forEach((botao) => {

        botao.classList.remove("ativo");

        if (
            botao.getAttribute("href") ===
            paginaAtual.split("/").pop()
        ) {
            botao.classList.add("ativo");
        }

    });
});

/* =================================
   EVENTOS DOS BOTÕES
================================= */

document.addEventListener("DOMContentLoaded", () => {

    // Botão voltar
    const botaoVoltar = document.querySelector(
        '[data-action="back"]'
    );

    if (botaoVoltar) {
        botaoVoltar.addEventListener("click", () => {
            history.back();
        });
    }

    // Adicionar festival
    const botaoAdicionar = document.querySelector(
        '[data-action="add-festival"]'
    );

    if (botaoAdicionar) {
        botaoAdicionar.addEventListener(
            "click",
            adicionarFestival
        );
    }

    // Cartões dos festivais
    document.querySelectorAll("[data-festival]")
        .forEach((card) => {

            card.addEventListener("click", () => {
                abrirFestival(card.dataset.festival);
            });

        });

});


