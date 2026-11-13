/* =================================
   ADICIONAR BILHETE
   código escrito ou leitura de QR → confirmar → notificação
================================= */

const formularioBilhete = document.getElementById("formulario-bilhete");
const campoCodigo = document.getElementById("codigo-bilhete");
const botaoConfirmarBilhete = document.getElementById("botao-confirmar-bilhete");
const mensagemBilhete = document.getElementById("mensagem-bilhete");

const painelCodigo = document.getElementById("painel-codigo");
const painelQr = document.getElementById("painel-qr");

const botaoImagem = document.getElementById("botao-imagem");
const ficheiroQr = document.getElementById("ficheiro-qr");

const notificacaoBilhete = document.getElementById("notificacao-bilhete");

let temporizadorBilhete = null;

/* =================================
   CÓDIGO DO BILHETE
================================= */

// Normalizar: maiúsculas e sem espaços ou hífenes
function normalizarCodigo(texto) {
    return texto.toUpperCase().replace(/[\s-]/g, "");
}

// Formato aceite (simulação): 6 a 32 letras ou números
function codigoValido(codigo) {
    return /^[A-Z0-9]{6,32}$/.test(codigo);
}

function mostrarMensagem(texto, sucesso = false) {
    mensagemBilhete.textContent = texto;
    mensagemBilhete.classList.toggle("sucesso", sucesso);
}

// Bilhetes guardados na conta atual
function obterBilhetes() {

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

function guardarBilhete(codigo) {

    const chave = chaveDoUtilizador("bilhetesBanDy");

    if (!chave) {
        mostrarBloqueioBanDy();
        return;
    }

    const lista = obterBilhetes();

    lista.unshift({
        codigo: codigo,
        data: new Date().toISOString()
    });

    localStorage.setItem(chave, JSON.stringify(lista));
}

// Só permite confirmar com algum código escrito
campoCodigo.addEventListener("input", () => {
    botaoConfirmarBilhete.disabled = campoCodigo.value.trim() === "";
    mostrarMensagem("");
});

/* =================================
   SEPARADORES: CÓDIGO / QR
================================= */

document.querySelectorAll("[data-separador]").forEach((botao) => {

    botao.addEventListener("click", () => {

        const qr = botao.dataset.separador === "qr";

        document.querySelectorAll("[data-separador]").forEach((b) => {
            const ativo = b === botao;
            b.classList.toggle("selecionado", ativo);
            b.setAttribute("aria-selected", ativo);
        });

        painelCodigo.hidden = qr;
        painelQr.hidden = !qr;

        mostrarMensagem("");
    });
});

/* =================================
   LEITURA DE QR
================================= */

// Usar o texto lido do QR como código do bilhete
function usarCodigoLido(texto) {

    campoCodigo.value = texto.trim();
    botaoConfirmarBilhete.disabled = campoCodigo.value === "";

    mostrarMensagem("Código QR lido. Carrega em Confirmar para adicionar.", true);
}

// Procurar um QR numa imagem (ficheiro de imagem)
function lerQrDaImagem(imagemData) {

    if (typeof jsQR !== "function") {
        return null;
    }

    const resultado = jsQR(
        imagemData.data,
        imagemData.width,
        imagemData.height,
        { inversionAttempts: "dontInvert" }
    );

    return resultado ? resultado.data : null;
}

const canvasQr = document.createElement("canvas");
const contextoQr = canvasQr.getContext("2d", { willReadFrequently: true });

// Ler QR a partir de uma imagem
botaoImagem.addEventListener("click", () => ficheiroQr.click());

ficheiroQr.addEventListener("change", () => {

    const ficheiro = ficheiroQr.files[0];

    if (!ficheiro) {
        return;
    }

    const imagem = new Image();
    const endereco = URL.createObjectURL(ficheiro);

    imagem.onload = () => {

        canvasQr.width = imagem.naturalWidth;
        canvasQr.height = imagem.naturalHeight;
        contextoQr.drawImage(imagem, 0, 0);

        const texto = lerQrDaImagem(
            contextoQr.getImageData(0, 0, canvasQr.width, canvasQr.height)
        );

        URL.revokeObjectURL(endereco);

        if (texto) {
            usarCodigoLido(texto);
        } else {
            mostrarMensagem("Não foi encontrado nenhum código QR nessa imagem.");
        }
    };

    imagem.onerror = () => {
        URL.revokeObjectURL(endereco);
        mostrarMensagem("Não foi possível abrir essa imagem.");
    };

    imagem.src = endereco;
    ficheiroQr.value = "";
});

/* =================================
   CONFIRMAR
================================= */

formularioBilhete.addEventListener("submit", (e) => {

    e.preventDefault();

    const codigo = normalizarCodigo(campoCodigo.value);

    if (!codigo) {
        mostrarMensagem("Indica o código do bilhete.");
        return;
    }

    if (!codigoValido(codigo)) {
        mostrarMensagem("Código inválido. Usa 6 a 32 letras ou números.");
        return;
    }

    if (obterBilhetes().some((bilhete) => bilhete.codigo === codigo)) {
        mostrarMensagem("Este bilhete já foi adicionado à tua conta.");
        return;
    }

    guardarBilhete(codigo);

    formularioBilhete.reset();
    botaoConfirmarBilhete.disabled = true;
    mostrarMensagem("");

    mostrarNotificacaoBilhete("Código: " + codigo);
});

/* =================================
   NOTIFICAÇÃO
================================= */

function fecharNotificacaoBilhete() {
    clearTimeout(temporizadorBilhete);
    notificacaoBilhete.hidden = true;
}

function mostrarNotificacaoBilhete(mensagem) {

    document.getElementById("notificacao-bilhete-mensagem").textContent = mensagem;

    notificacaoBilhete.hidden = false;

    clearTimeout(temporizadorBilhete);
    temporizadorBilhete = setTimeout(fecharNotificacaoBilhete, 6000);
}

document.getElementById("notificacao-bilhete-fechar")
    .addEventListener("click", fecharNotificacaoBilhete);
