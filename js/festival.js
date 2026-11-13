/* =================================
   PÁGINA DO FESTIVAL
   mostra as informações do festival escolhido (?id=...)
================================= */

document.addEventListener("DOMContentLoaded", () => {

    const festival = obterFestivalDoEndereco();

    if (!festival) {
        document.getElementById("festival-inexistente").hidden = false;
        return;
    }

    document.title = "BanDy - " + festival.nome;

    document.getElementById("festival-nome").textContent = festival.nome;
    document.getElementById("festival-iniciais").textContent = festival.iniciais;
    document.getElementById("festival-cartaz-nome").textContent = festival.nome;
    document.getElementById("festival-cartaz").setAttribute("aria-label", "Cartaz de " + festival.nome);
    document.getElementById("festival-datas").textContent = festival.datas;
    document.getElementById("festival-local").textContent = festival.local;

    // Mapa (OpenStreetMap) centrado no local do festival
    const margem = 0.012;
    const caixa = [
        festival.longitude - margem * 1.6,
        festival.latitude - margem,
        festival.longitude + margem * 1.6,
        festival.latitude + margem
    ].join(",");

    document.getElementById("festival-mapa").src =
        "https://www.openstreetmap.org/export/embed.html?bbox=" + caixa +
        "&layer=mapnik&marker=" + festival.latitude + "," + festival.longitude;

    document.getElementById("festival-mapa-ligacao").href =
        "https://www.openstreetmap.org/?mlat=" + festival.latitude +
        "&mlon=" + festival.longitude +
        "#map=15/" + festival.latitude + "/" + festival.longitude;

    // Botão comprar bilhete
    document.getElementById("botao-comprar-bilhete").href =
        "comprar_bilhete.html?id=" + encodeURIComponent(festival.id);

    document.getElementById("conteudo-festival").hidden = false;

    mostrarBilhetes(festival);
    configurarRemocao(festival);
});

/* =================================
   BILHETES DO FESTIVAL
   se já tens bilhete, vês o bilhete em vez do botão de compra
================================= */

// Criar a imagem do código QR (se a biblioteca estiver carregada)
function criarImagemQr(texto) {

    if (typeof qrcode !== "function") {
        return null;
    }

    try {
        const qr = qrcode(0, "M");
        qr.addData(texto);
        qr.make();

        const imagem = document.createElement("img");
        imagem.src = qr.createDataURL(4, 2);
        imagem.alt = "Código QR do bilhete " + texto;
        imagem.classList.add("qr-bilhete");

        return imagem;

    } catch (erro) {
        return null;
    }
}

function criarCartaoBilhete(bilhete, festival, numero) {

    const cartao = document.createElement("article");
    cartao.classList.add("cartao-bilhete");

    const imagem = criarImagemQr(bilhete.codigo);

    if (imagem) {
        cartao.appendChild(imagem);
    }

    const texto = document.createElement("div");
    texto.classList.add("texto-bilhete");

    const tipo = festival.bilhetes.find((item) => item.id === bilhete.tipo);

    const nome = document.createElement("strong");
    nome.textContent = tipo ? tipo.nome : "Bilhete";

    const dia = document.createElement("span");

    const diaEscolhido = festival.dias.find((item) => item.id === bilhete.dia);

    dia.textContent = diaEscolhido
        ? "Dia: " + diaEscolhido.rotulo
        : "Todos os dias · " + festival.datas;

    const codigo = document.createElement("small");
    codigo.textContent = "Código: " + bilhete.codigo;

    texto.append(nome, dia, codigo);
    cartao.appendChild(texto);

    return cartao;
}

function mostrarBilhetes(festival) {

    const bilhetes = lerBilhetesDaConta()
        .filter((bilhete) => bilhete.festival === festival.id);

    if (bilhetes.length === 0) {
        return;
    }

    const lista = document.getElementById("lista-bilhetes");

    lista.textContent = "";

    bilhetes.forEach((bilhete, indice) => {
        lista.appendChild(criarCartaoBilhete(bilhete, festival, indice + 1));
    });

    document.getElementById("bilhetes-festival").hidden = false;

    // Já tens bilhete: o botão de compra deixa de aparecer
    document.getElementById("botao-comprar-bilhete").hidden = true;
}

/* =================================
   REMOVER FESTIVAL
   (só quando já existem bilhetes deste festival na conta)
================================= */

// Ler a lista de bilhetes da conta atual
function lerBilhetesDaConta() {

    const chave = chaveDoUtilizador("bilhetesBanDy");

    if (!chave) {
        return [];
    }

    try {
        const lista = JSON.parse(localStorage.getItem(chave) || "[]");
        return Array.isArray(lista) ? lista : [];
    } catch (erro) {
        return [];
    }
}

function configurarRemocao(festival) {

    const info = document.getElementById("info-bilhetes");
    const botao = document.getElementById("botao-remover-festival");
    const popup = document.getElementById("popup-remover-festival");

    const quantidade = lerBilhetesDaConta()
        .filter((bilhete) => bilhete.festival === festival.id).length;

    if (quantidade === 0) {
        return;
    }

    info.textContent = quantidade === 1
        ? "Tens 1 bilhete para este festival."
        : "Tens " + quantidade + " bilhetes para este festival.";

    info.hidden = false;
    botao.hidden = false;

    function fechar() {
        popup.hidden = true;
    }

    botao.addEventListener("click", () => {

        document.getElementById("remover-texto").textContent =
            "O festival " + festival.nome + " deixa de aparecer na página inicial " +
            "e os teus " + quantidade + (quantidade === 1 ? " bilhete é removido" : " bilhetes são removidos") +
            ". O valor pago não é reembolsado.";

        popup.hidden = false;
        document.getElementById("remover-cancelar").focus();
    });

    document.getElementById("remover-cancelar").addEventListener("click", fechar);

    popup.addEventListener("click", (e) => {
        if (e.target === popup) {
            fechar();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !popup.hidden) {
            fechar();
        }
    });

    document.getElementById("remover-confirmar").addEventListener("click", () => {

        const chave = chaveDoUtilizador("bilhetesBanDy");

        if (!chave) {
            mostrarBloqueioBanDy();
            return;
        }

        // Manter os bilhetes de todos os outros festivais
        const restantes = lerBilhetesDaConta()
            .filter((bilhete) => bilhete.festival !== festival.id);

        localStorage.setItem(chave, JSON.stringify(restantes));

        window.location.href = "inicio.html";
    });
}
