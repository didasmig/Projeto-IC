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

const videoQr = document.getElementById("video-qr");
const leitorVazio = document.getElementById("leitor-qr-vazio");
const molduraQr = document.getElementById("moldura-qr");
const botaoCamara = document.getElementById("botao-camara");
const botaoImagem = document.getElementById("botao-imagem");
const ficheiroQr = document.getElementById("ficheiro-qr");

const notificacaoBilhete = document.getElementById("notificacao-bilhete");

let streamCamara = null;
let leituraAtiva = false;
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

        if (!qr) {
            pararCamara();
        }
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

// Procurar um QR numa imagem (frame de vídeo ou ficheiro)
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

async function ligarCamara() {

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        mostrarMensagem("Este navegador não permite usar a câmara. Escreve o código ou carrega uma imagem.");
        return;
    }

    try {
        streamCamara = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
    } catch (erro) {
        mostrarMensagem("Não foi possível aceder à câmara. Verifica as permissões.");
        return;
    }

    videoQr.srcObject = streamCamara;
    await videoQr.play();

    videoQr.hidden = false;
    molduraQr.hidden = false;
    leitorVazio.hidden = true;

    botaoCamara.innerHTML = '<i class="fa-solid fa-stop"></i> Desligar câmara';

    mostrarMensagem("");

    leituraAtiva = true;
    requestAnimationFrame(analisarFrame);
}

function pararCamara() {

    leituraAtiva = false;

    if (streamCamara) {
        streamCamara.getTracks().forEach((faixa) => faixa.stop());
        streamCamara = null;
    }

    videoQr.srcObject = null;
    videoQr.hidden = true;
    molduraQr.hidden = true;
    leitorVazio.hidden = false;

    botaoCamara.innerHTML = '<i class="fa-solid fa-camera"></i> Ligar câmara';
}

const canvasQr = document.createElement("canvas");
const contextoQr = canvasQr.getContext("2d", { willReadFrequently: true });

function analisarFrame() {

    if (!leituraAtiva) {
        return;
    }

    if (videoQr.readyState === videoQr.HAVE_ENOUGH_DATA) {

        canvasQr.width = videoQr.videoWidth;
        canvasQr.height = videoQr.videoHeight;
        contextoQr.drawImage(videoQr, 0, 0);

        const texto = lerQrDaImagem(
            contextoQr.getImageData(0, 0, canvasQr.width, canvasQr.height)
        );

        if (texto) {
            usarCodigoLido(texto);
            pararCamara();
            return;
        }
    }

    requestAnimationFrame(analisarFrame);
}

botaoCamara.addEventListener("click", () => {
    if (streamCamara) {
        pararCamara();
    } else {
        ligarCamara();
    }
});

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

// Desligar a câmara ao sair da página
window.addEventListener("pagehide", pararCamara);

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

    pararCamara();
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
