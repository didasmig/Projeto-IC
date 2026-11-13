/* =================================
   PÁGINA ADICIONAR FESTIVAL
================================= */

// Remover acentos e maiúsculas para a pesquisa
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

document.addEventListener("DOMContentLoaded", () => {

    const campo = document.getElementById("pesquisa-festival");
    const lista = document.getElementById("lista-festivais");
    const semResultados = document.getElementById("sem-resultados");

    // Criar um cartão para cada festival (dados em js/festivais.js)
    Object.keys(FESTIVAIS).forEach((id) => {

        const festival = FESTIVAIS[id];

        const cartao = document.createElement("a");
        cartao.classList.add("cartao-festival");
        cartao.href = "festival.html?id=" + encodeURIComponent(id);
        cartao.dataset.nome = festival.nome;

        const iniciais = document.createElement("span");
        iniciais.classList.add("iniciais-festival");
        iniciais.textContent = festival.iniciais;

        const informacao = document.createElement("div");
        informacao.classList.add("informacao-festival");

        const nome = document.createElement("span");
        nome.classList.add("nome-festival");
        nome.textContent = festival.nome;

        const datas = document.createElement("span");
        datas.classList.add("datas-festival");
        datas.textContent = festival.datas + " · " + festival.local;

        informacao.append(nome, datas);

        const seta = document.createElement("i");
        seta.classList.add("fa-solid", "fa-chevron-right", "seta-festival");

        cartao.append(iniciais, informacao, seta);
        lista.appendChild(cartao);
    });

    const cartoes = lista.querySelectorAll(".cartao-festival");

    // Pesquisa: filtra a lista enquanto se escreve
    campo.addEventListener("input", () => {

        const termo = normalizarTexto(campo.value.trim());
        let visiveis = 0;

        cartoes.forEach((cartao) => {

            const mostrar = normalizarTexto(cartao.dataset.nome).includes(termo);

            cartao.hidden = !mostrar;

            if (mostrar) {
                visiveis++;
            }
        });

        semResultados.hidden = visiveis > 0;
    });

    // Botão "Já tenho bilhete"
    const botaoBilhete = document.querySelector('[data-acao="ja-tenho-bilhete"]');

    if (botaoBilhete) {
        botaoBilhete.addEventListener("click", () => {
            window.location.href = "adicionar_bilhete.html";
        });
    }
});
