// CARTÕES DOS FESTIVAIS

function abrirFestival(nome) {
    alert("Abrir: " + nome);
}

function adicionarFestival() {

    const nome = prompt("Qual é o nome do festival?");

    if (nome && nome.trim() !== "") {
        alert(nome.trim() + " foi adicionado!");
    }

}



// NAVEGAÇÃO INFERIOR

// Destacar a página atualmente selecionada

document.addEventListener("DOMContentLoaded", () => {

    const paginaAtual = window.location.pathname;
    const botoes = document.querySelectorAll(".botao-navegacao");

    botoes.forEach((botao) => {

        botao.classList.remove("ativo");

        if (botao.getAttribute("href") === paginaAtual.split("/").pop()) {
            botao.classList.add("ativo");
        }

    });

});

// EVENTOS DOS BOTÕES

document.addEventListener("DOMContentLoaded", () => {

    // Botão voltar
    document.querySelector('[data-action="back"]')
        .addEventListener("click", () => {
            history.back();
        });

    // Adicionar festival
    document.querySelector('[data-action="add-festival"]')
        .addEventListener("click", adicionarFestival);

    // Cartões dos festivais
    document.querySelectorAll("[data-festival]").forEach((card) => {

        card.addEventListener("click", () => {
            abrirFestival(card.dataset.festival);
        });

    });

    // Menu inferior
    document.querySelectorAll("[data-page]").forEach((button) => {

        button.addEventListener("click", () => {
            mudarPagina(button, button.dataset.page);
        });

    });

});


