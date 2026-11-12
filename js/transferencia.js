
/* =================================
   TRANSFERÊNCIAS
   1) validar  2) pop-up de confirmação  3) notificação
================================= */

const formularioTransferencia = document.getElementById("transferForm");

const erroTransferencia = document.getElementById("erro-transferencia");

const popupConfirmar = document.getElementById("popup-confirmar-transferencia");
const confirmarValor = document.getElementById("confirmar-valor");
const confirmarDestinatario = document.getElementById("confirmar-destinatario");
const confirmarSaldo = document.getElementById("confirmar-saldo");

const notificacao = document.getElementById("notificacao-transferencia");

// Transferência à espera de confirmação
let transferenciaPendente = null;
let temporizadorNotificacao = null;

function formatarEuros(valor) {
    return valor.toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " €";
}

/* =================================
   1) PEDIR A TRANSFERÊNCIA
================================= */

formularioTransferencia?.addEventListener("submit", (e) => {

    e.preventDefault();

    erroTransferencia.textContent = "";

    const destinatario = e.target.destinatario.value.trim();
    const quantia = Math.round(Number(e.target.quantia.value) * 100) / 100;
    const saldo = obterSaldo();

    if (!destinatario) {
        erroTransferencia.textContent = "Indica o destinatário.";
        return;
    }

    if (!Number.isFinite(quantia) || quantia <= 0) {
        erroTransferencia.textContent = "Introduza uma quantia válida.";
        return;
    }

    if (quantia > saldo) {
        erroTransferencia.textContent =
            "Saldo insuficiente. Tens " + formatarEuros(saldo) + ".";
        return;
    }

    // Pedir confirmação antes de mexer no saldo
    transferenciaPendente = { destinatario, quantia };

    confirmarValor.textContent = "- " + formatarEuros(quantia);
    confirmarDestinatario.textContent = "Para: " + destinatario;
    confirmarSaldo.textContent =
        "Saldo depois: " + formatarEuros(Math.round((saldo - quantia) * 100) / 100);

    popupConfirmar.hidden = false;
    document.getElementById("confirmar-confirmar").focus();
});

/* =================================
   2) CONFIRMAR OU CANCELAR
================================= */

function fecharConfirmacao() {
    popupConfirmar.hidden = true;
    transferenciaPendente = null;
}

function confirmarTransferencia() {

    if (!transferenciaPendente) {
        return;
    }

    const { destinatario, quantia } = transferenciaPendente;

    // Ler o saldo outra vez, por segurança
    const saldo = obterSaldo();

    fecharConfirmacao();

    if (quantia > saldo) {
        erroTransferencia.textContent =
            "Saldo insuficiente. Tens " + formatarEuros(saldo) + ".";
        return;
    }

    const novoSaldo = Math.round((saldo - quantia) * 100) / 100;

    atualizarSaldo(novoSaldo);

    // Guardar transferência no histórico da conta atual
    guardarMovimento({
        tipo: "transferencia",
        destinatario: destinatario,
        valor: quantia
    });

    formularioTransferencia.reset();

    mostrarNotificacao(
        "Transferência concluída",
        "Enviaste " + formatarEuros(quantia) + " para " + destinatario + ".",
        "Novo saldo: " + formatarEuros(novoSaldo)
    );
}

document.getElementById("confirmar-confirmar")
    ?.addEventListener("click", confirmarTransferencia);

document.getElementById("confirmar-cancelar")
    ?.addEventListener("click", fecharConfirmacao);

// Fechar ao clicar fora da caixa
popupConfirmar?.addEventListener("click", (e) => {
    if (e.target === popupConfirmar) {
        fecharConfirmacao();
    }
});

// Fechar com a tecla Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popupConfirmar && !popupConfirmar.hidden) {
        fecharConfirmacao();
    }
});

/* =================================
   3) NOTIFICAÇÃO
================================= */

function fecharNotificacao() {
    clearTimeout(temporizadorNotificacao);
    notificacao.hidden = true;
}

function mostrarNotificacao(titulo, mensagem, saldo) {

    document.getElementById("notificacao-titulo").textContent = titulo;
    document.getElementById("notificacao-mensagem").textContent = mensagem;
    document.getElementById("notificacao-saldo").textContent = saldo;

    notificacao.hidden = false;

    // Desaparece sozinha ao fim de uns segundos
    clearTimeout(temporizadorNotificacao);
    temporizadorNotificacao = setTimeout(fecharNotificacao, 6000);
}

document.getElementById("notificacao-fechar")
    ?.addEventListener("click", fecharNotificacao);
