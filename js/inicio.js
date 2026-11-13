
// CARTÕES DOS FESTIVAIS

function abrirFestival(nome, id) {

    if (!temSessao()) {
        mostrarBloqueioBanDy();
        return;
    }

    // Festival com bilhete: abrir a página do festival
    if (id) {
        window.location.href = "festival.html?id=" + encodeURIComponent(id);
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
    window.location.href = "adicionar_festival.html";
}

/* =================================
   FESTIVAIS COM BILHETE
   o mais próximo ocupa "Festival Atual" e os restantes
   ocupam o lugar de "Festival Futuro"
================================= */

// Ids dos festivais dos bilhetes da conta, do mais próximo para o mais distante
function obterFestivaisComBilhete() {

    const chave = chaveDoUtilizador("bilhetesBanDy");

    if (!chave) {
        return [];
    }

    let bilhetes = [];

    try {
        bilhetes = JSON.parse(localStorage.getItem(chave) || "[]");
    } catch (erro) {
        bilhetes = [];
    }

    if (!Array.isArray(bilhetes)) {
        return [];
    }

    const ids = [...new Set(bilhetes.map((bilhete) => bilhete.festival))]
        .filter((id) => Object.prototype.hasOwnProperty.call(FESTIVAIS, id));

    return ids
        .map((id) => ({
            id: id,
            ...FESTIVAIS[id],
            edicao: obterProximaEdicao(FESTIVAIS[id])
        }))
        .sort((a, b) => a.edicao.inicio - b.edicao.inicio);
}

// Escrever nome e datas dentro de um cartão
function preencherCartaoFestival(cartao, festival) {

    cartao.textContent = "";

    const nome = document.createElement("span");
    nome.textContent = festival.nome;

    const datas = document.createElement("small");
    datas.textContent = festival.datas;

    cartao.append(nome, datas);
    cartao.dataset.festival = festival.nome;
    cartao.dataset.festivalId = festival.id;
}

function mostrarFestivaisComBilhete() {

    const cartaoAtual = document.getElementById("festival-atual");
    const cartaoFuturo = document.getElementById("festival-futuro");

    if (!cartaoAtual || !cartaoFuturo) {
        return;
    }

    // Limpar cartões criados anteriormente
    document.querySelectorAll(".festival-comprado")
        .forEach((cartao) => cartao.remove());

    // Repor os textos de exemplo
    cartaoAtual.textContent = "Festival Atual";
    cartaoAtual.dataset.festival = "Festival Atual";
    delete cartaoAtual.dataset.festivalId;
    cartaoFuturo.hidden = false;

    const festivais = temSessao() ? obterFestivaisComBilhete() : [];

    // Sem festivais adicionados: esconder o cartão "Festival Futuro"
    if (festivais.length === 0) {
        cartaoFuturo.hidden = true;
        return;
    }

    // Festival mais próximo
    preencherCartaoFestival(cartaoAtual, festivais[0]);

    // Restantes festivais
    const restantes = festivais.slice(1);

    if (restantes.length === 0) {
        return;
    }

    cartaoFuturo.hidden = true;

    restantes.forEach((festival) => {

        const cartao = document.createElement("button");
        cartao.type = "button";
        cartao.classList.add("festival-card", "festival-comprado");

        preencherCartaoFestival(cartao, festival);

        cartao.addEventListener("click", () => {
            abrirFestival(festival.nome, festival.id);
        });

        cartaoFuturo.before(cartao);
    });
}

document.addEventListener("DOMContentLoaded", mostrarFestivaisComBilhete);

// Voltar a esta página pelo histórico: atualizar os festivais
window.addEventListener("pageshow", (evento) => {
    if (evento.persisted) {
        mostrarFestivaisComBilhete();
    }
});

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
                abrirFestival(card.dataset.festival, card.dataset.festivalId);
            });

        });

});


