
/* =================================
   FUNCIONALIDADES DO DEPÓSITO
================================= */

// Elementos HTML
const campoValor = document.getElementById(
    "valor-personalizado"
);

const campoMetodo = document.getElementById(
    "metodo-pagamento"
);

const botaoConfirmar = document.getElementById(
    "confirmar-deposito"
);

const botoesValor = document.querySelectorAll(
    ".botao-valor"
);


// =================================
// SELECIONAR VALORES PREDEFINIDOS
// =================================

botoesValor.forEach((botao) => {

    botao.addEventListener("click", () => {

        // Colocar o valor no campo personalizado
        campoValor.value = botao.dataset.valor;

        // Retirar seleção dos restantes botões
        botoesValor.forEach((outroBotao) => {
            outroBotao.classList.remove("selecionado");
        });

        // Destacar o botão escolhido
        botao.classList.add("selecionado");

    });

});


// =================================
// ESCREVER VALOR PERSONALIZADO
// =================================

campoValor.addEventListener("input", () => {

    // Retirar seleção dos valores predefinidos
    botoesValor.forEach((botao) => {
        botao.classList.remove("selecionado");
    });

});


// =================================
// CONFIRMAR DEPÓSITO
// =================================

botaoConfirmar.addEventListener("click", () => {

    const valor = Number(campoValor.value);

    const metodo = campoMetodo.value;


    // Verificar se o valor é válido
    if (!Number.isFinite(valor) || valor <= 0) {

        alert("Por favor, introduza um valor válido.");

        return;

    }


    // Verificar se foi escolhido um método
    if (metodo === "") {

        alert("Por favor, escolha um método de pagamento.");

        return;

    }


    // Obter saldo atual
    const saldoAtual = obterSaldo();


    // Calcular novo saldo
    const novoSaldo = saldoAtual + valor;


    // Guardar novo saldo
    atualizarSaldo(novoSaldo);


    // Mostrar confirmação
    alert(
        "Depósito realizado com sucesso!\n\n" +
        "Valor: " + valor.toFixed(2) + " €\n" +
        "Método: " + metodo + "\n" +
        "Novo saldo: " + novoSaldo.toFixed(2) + " €"
    );


    // Regressar à carteira
    window.location.href = "carteira.html";

});
