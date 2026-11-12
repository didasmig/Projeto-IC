
/* =================================
   PÁGINA DO MÉTODO DE PAGAMENTO
   (passo entre "Depositar" e o saldo ser atualizado)
================================= */

// Guardado por depositar.js antes de vir para esta página
const CHAVE_DEPOSITO_PENDENTE = "depositoPendenteBanDy";

const METODOS = ["MBWay", "PayPal", "Multibanco", "ApplePay"];

const NOMES_METODOS = {
    MBWay: "MB WAY",
    PayPal: "PayPal",
    Multibanco: "Multibanco",
    ApplePay: "Apple Pay"
};

let depositoPendente = null;
let emProcessamento = false;

function obterDepositoPendente() {
    try {
        const dados = JSON.parse(
            sessionStorage.getItem(CHAVE_DEPOSITO_PENDENTE)
        );

        if (
            dados &&
            Number.isFinite(dados.valor) &&
            dados.valor > 0 &&
            METODOS.includes(dados.metodo)
        ) {
            return dados;
        }

    } catch (erro) {
        // dados inválidos: voltar ao início do depósito
    }

    return null;
}

function formatarEuros(valor) {
    return Number(valor).toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " €";
}

// Gerar uma referência Multibanco (só se ainda não existir)
function referenciaMultibanco() {

    if (!depositoPendente.referencia) {
        const numero = String(
            Math.floor(100000000 + Math.random() * 900000000)
        );

        depositoPendente.referencia =
            numero.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");

        sessionStorage.setItem(
            CHAVE_DEPOSITO_PENDENTE,
            JSON.stringify(depositoPendente)
        );
    }

    return depositoPendente.referencia;
}

/* =================================
   CONCLUIR O DEPÓSITO
================================= */

function concluirDeposito() {

    const saldoAtual = obterSaldo();
    const novoSaldo = Math.round((saldoAtual + depositoPendente.valor) * 100) / 100;

    atualizarSaldo(novoSaldo);

    guardarMovimento({
        tipo: "deposito",
        valor: depositoPendente.valor,
        metodo: depositoPendente.metodo
    });

    sessionStorage.removeItem(CHAVE_DEPOSITO_PENDENTE);

    document.getElementById("popup-deposito-valor").textContent =
        "+ " + formatarEuros(depositoPendente.valor);

    document.getElementById("popup-deposito-metodo").textContent =
        "Método: " + NOMES_METODOS[depositoPendente.metodo];

    document.getElementById("popup-deposito-saldo").textContent =
        "Novo saldo: " + formatarEuros(novoSaldo);

    document.getElementById("estado-processamento").textContent = "";
    document.getElementById("popup-deposito").hidden = false;
}

// Simular o tempo que o pagamento demora a ser confirmado
function processarPagamento(mensagem) {

    if (emProcessamento) {
        return;
    }

    emProcessamento = true;

    document.querySelectorAll("button").forEach((botao) => {
        botao.disabled = true;
    });

    document.getElementById("estado-processamento").textContent = mensagem;

    setTimeout(concluirDeposito, 1500);
}

/* =================================
   VALIDAR CADA MÉTODO
================================= */

const validadores = {

    MBWay() {
        const numero = document.getElementById("telemovel-mbway")
            .value.replace(/\s/g, "");

        if (!/^9[1236]\d{7}$/.test(numero)) {
            return { erro: "Número de telemóvel inválido (ex.: 912 345 678)." };
        }

        return { mensagem: "Pedido enviado. Confirma o pagamento na app MB WAY..." };
    },

    PayPal() {
        const email = document.getElementById("email-paypal").value.trim();
        const palavraPasse = document.getElementById("palavra-passe-paypal").value;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { erro: "Indica um email válido." };
        }

        if (!palavraPasse) {
            return { erro: "Introduz a palavra-passe." };
        }

        return { mensagem: "A autorizar pagamento no PayPal..." };
    },

    Multibanco() {
        return { mensagem: "A confirmar o pagamento da referência..." };
    },

    ApplePay() {
        return { mensagem: "A confirmar com Apple Pay..." };
    }
};

/* =================================
   INICIAR
================================= */

document.addEventListener("DOMContentLoaded", () => {

    if (!temSessao()) {
        return;
    }

    depositoPendente = obterDepositoPendente();

    // Sem depósito em curso: voltar ao início do depósito
    if (!depositoPendente) {
        window.location.replace("depositar.html");
        return;
    }

    const metodo = depositoPendente.metodo;

    document.getElementById("titulo-metodo").textContent =
        "Pagar com " + NOMES_METODOS[metodo];

    document.getElementById("resumo-valor").textContent =
        formatarEuros(depositoPendente.valor);

    if (metodo === "Multibanco") {
        document.getElementById("mb-entidade").textContent = "21312";
        document.getElementById("mb-referencia").textContent = referenciaMultibanco();
        document.getElementById("mb-montante").textContent =
            formatarEuros(depositoPendente.valor);
    }

    // Mostrar só o ecrã do método escolhido
    const formulario = document.querySelector(`[data-ecra="${metodo}"]`);

    formulario.hidden = false;

    formulario.addEventListener("submit", (evento) => {

        evento.preventDefault();

        const resultado = validadores[metodo]();
        const erro = formulario.querySelector(".mensagem-conta");

        if (resultado.erro) {
            erro.textContent = resultado.erro;
            return;
        }

        erro.textContent = "";
        processarPagamento(resultado.mensagem);
    });
});
