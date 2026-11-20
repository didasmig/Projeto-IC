
// SALDO E MOVIMENTOS DE CADA CONTA

const SALDO_INICIAL = 0;

// Obter saldo da conta
function obterSaldo() {

    const chave = chaveDoUtilizador("saldoBanDy");

    if (!chave) {
        return 0;
    }

    // Criar saldo inicial para contas novas
    if (localStorage.getItem(chave) === null) {
        localStorage.setItem(
            chave,
            SALDO_INICIAL.toFixed(2)
        );
    }

    return Number(localStorage.getItem(chave));
}

// Atualizar saldo
function atualizarSaldo(novoSaldo) {

    const chave = chaveDoUtilizador("saldoBanDy");

    if (!chave) {
        mostrarBloqueioBanDy();
        return;
    }

    if (!Number.isFinite(novoSaldo) || novoSaldo < 0) {
        return;
    }

    localStorage.setItem(
        chave,
        novoSaldo.toFixed(2)
    );

    mostrarSaldo();
}

// Mostrar saldo no HTML

function mostrarSaldo() {

    document.querySelectorAll("[data-saldo]").forEach((elemento) => {

        // Se o utilizador tiver sessão iniciada
        if (temSessao()) {

            const saldoFormatado = obterSaldo().toLocaleString("pt-PT", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + " €";

            elemento.textContent = saldoFormatado;

        } else {

            // Se não tiver sessão, mostrar um link para o perfil
            elemento.innerHTML = "";

            const linkLogin = document.createElement("a");

            linkLogin.href = "perfil.html";
            linkLogin.classList.add("link-iniciar-sessao");
            linkLogin.textContent = "Iniciar sessão";

            elemento.appendChild(linkLogin);
        }

    });
}


document.addEventListener("DOMContentLoaded", mostrarSaldo);

/* =================================
   HISTÓRICO DE MOVIMENTOS
================================= */

// Obter movimentos da conta
function obterMovimentos() {

    const chave = chaveDoUtilizador("movimentosBanDy");

    if (!chave) {
        return [];
    }

    try {

        const movimentos = JSON.parse(
            localStorage.getItem(chave) || "[]"
        );

        return Array.isArray(movimentos)
            ? movimentos
            : [];

    } catch (erro) {
        return [];
    }
}

// Guardar um novo movimento
function guardarMovimento(movimento) {

    const chave = chaveDoUtilizador("movimentosBanDy");

    if (!chave) {
        mostrarBloqueioBanDy();
        return;
    }

    const movimentos = obterMovimentos();

    movimentos.unshift({
        ...movimento,
        data: new Date().toISOString()
    });

    // Guardar os últimos 10 movimentos
    localStorage.setItem(
        chave,
        JSON.stringify(movimentos.slice(0, 10))
    );
}

/* =================================
   CREDITAR OUTRA CONTA
   (usado nas transferências entre utilizadores)
================================= */

function creditarTransferencia(idDestino, valor, nomeRemetente) {

    const chaveSaldo = `BanDy_${idDestino}_saldoBanDy`;
    const chaveMovimentos = `BanDy_${idDestino}_movimentosBanDy`;

    const atual = localStorage.getItem(chaveSaldo) === null
        ? SALDO_INICIAL
        : Number(localStorage.getItem(chaveSaldo));

    localStorage.setItem(
        chaveSaldo,
        (Math.round((atual + valor) * 100) / 100).toFixed(2)
    );

    let movimentos = [];

    try {
        movimentos = JSON.parse(localStorage.getItem(chaveMovimentos) || "[]");
    } catch (erro) {
        movimentos = [];
    }

    if (!Array.isArray(movimentos)) {
        movimentos = [];
    }

    movimentos.unshift({
        tipo: "transferencia_recebida",
        remetente: nomeRemetente,
        valor: valor,
        data: new Date().toISOString()
    });

    localStorage.setItem(chaveMovimentos, JSON.stringify(movimentos.slice(0, 10)));
}
