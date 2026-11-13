
/* =================================
   CONTA CONJUNTA
================================= */

// Todas as contas conjuntas ficam guardadas numa lista partilhada,
// para os dois titulares verem o mesmo saldo e os mesmos movimentos
const CHAVE_CONTAS_CONJUNTAS = "contasConjuntasBanDy";

// Obter todas as contas conjuntas
function obterContasConjuntas() {
    try {
        const contas = JSON.parse(
            localStorage.getItem(CHAVE_CONTAS_CONJUNTAS) || "[]"
        );

        return Array.isArray(contas) ? contas : [];

    } catch (erro) {
        return [];
    }
}

function guardarContasConjuntas(contas) {
    localStorage.setItem(CHAVE_CONTAS_CONJUNTAS, JSON.stringify(contas));
}

// Obter a conta conjunta do utilizador atual
function obterContaConjunta() {
    const utilizador = obterUtilizador();

    if (!utilizador) {
        return null;
    }

    return obterContasConjuntas().find(
        (conta) => conta.titulares.includes(utilizador.id)
    ) || null;
}

// Primeiro nome de um titular
function nomeDoTitular(id) {
    const conta = obterContasBanDy().find((item) => item.id === id);

    return conta ? conta.nome.split(" ")[0] : "Utilizador";
}

// "Ana", "Ana e Rui", "Ana, Rui e Sofia"
function listaDeTitulares(conta) {
    const nomes = conta.titulares.map(nomeDoTitular);

    if (nomes.length === 1) {
        return nomes[0];
    }

    return nomes.slice(0, -1).join(", ") + " e " + nomes[nomes.length - 1];
}

// Número máximo de titulares de uma conta conjunta
const MAX_TITULARES = 6;

function formatarEuros(valor) {
    return Number(valor).toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " €";
}

// Arredondar para cêntimos (evita erros de vírgula flutuante)
function arredondar(valor) {
    return Math.round(valor * 100) / 100;
}

/* =================================
   MOSTRAR A PÁGINA
================================= */

let modoMovimento = null;   // "depositar", "levantar" ou "pagar"

function mostrarSaldoConjunta() {

    const conta = obterContaConjunta();
    const elemento = document.getElementById("saldo-conjunta");

    if (!conta || !elemento) {
        return;
    }

    // Respeitar o botão de ocultar saldo (carteira.js)
    const oculto = typeof saldoVisivel !== "undefined" && !saldoVisivel;

    elemento.textContent = oculto ? "••••••" : formatarEuros(conta.saldo);
}

function mostrarMovimentosConjunta(conta) {

    const lista = document.getElementById("lista-movimentos-conjunta");

    lista.innerHTML = "";

    if (conta.movimentos.length === 0) {
        const vazio = document.createElement("p");
        vazio.classList.add("texto-conta-conjunta");
        vazio.textContent = "Ainda não há movimentos.";
        lista.appendChild(vazio);
        return;
    }

    conta.movimentos.forEach((movimento) => {

        const artigo = document.createElement("article");
        artigo.classList.add("movimento");

        const nome = document.createElement("span");
        nome.classList.add("nome-movimento");

        const valor = document.createElement("span");

        const autor = nomeDoTitular(movimento.autor);

        if (movimento.tipo === "deposito") {
            nome.textContent = autor + " - Depósito";
            valor.classList.add("valor-positivo");
            valor.textContent = "+ " + formatarEuros(movimento.valor);
        } else if (movimento.tipo === "pagamento") {
            nome.textContent = autor + " - Pagamento - " + movimento.destinatario;
            valor.classList.add("valor-negativo");
            valor.textContent = "- " + formatarEuros(movimento.valor);
        } else {
            nome.textContent = autor + " - Levantamento";
            valor.classList.add("valor-negativo");
            valor.textContent = "- " + formatarEuros(movimento.valor);
        }

        artigo.appendChild(nome);
        artigo.appendChild(valor);
        lista.appendChild(artigo);
    });
}

function mostrarContaConjunta() {

    const conta = obterContaConjunta();

    document.getElementById("sem-conta").hidden = Boolean(conta);
    document.getElementById("com-conta").hidden = !conta;

    if (!conta) {
        return;
    }

    document.getElementById("nome-conta-conjunta").textContent = conta.nome;

    document.getElementById("titulares-conta").textContent =
        (conta.titulares.length === 1 ? "Titular: " : "Titulares: ") +
        listaDeTitulares(conta);

    mostrarSaldoConjunta();
    mostrarMovimentosConjunta(conta);
}

/* =================================
   CRIAR CONTA CONJUNTA
================================= */

function criarContaConjunta(evento) {

    evento.preventDefault();

    const erro = document.getElementById("erro-criar");
    const nome = document.getElementById("nome-conta").value.trim();
    const email = document.getElementById("email-titular").value
        .trim().toLowerCase();

    const eu = obterUtilizador();

    erro.textContent = "";

    if (!eu) {
        mostrarBloqueioBanDy();
        return;
    }

    if (!nome || !email) {
        erro.textContent = "Preenche o nome da conta e o email do outro titular.";
        return;
    }

    if (email === eu.email) {
        erro.textContent = "Indica o email de outro utilizador, não o teu.";
        return;
    }

    const outro = obterContasBanDy().find((conta) => conta.email === email);

    if (!outro) {
        erro.textContent = "Não existe nenhum utilizador BanDy com este email.";
        return;
    }

    const contas = obterContasConjuntas();

    if (contas.some((conta) => conta.titulares.includes(outro.id))) {
        erro.textContent = "Este utilizador já tem uma conta conjunta.";
        return;
    }

    contas.push({
        id: crypto.randomUUID(),
        nome: nome,
        titulares: [eu.id, outro.id],
        saldo: 0,
        movimentos: []
    });

    guardarContasConjuntas(contas);
    mostrarContaConjunta();
}

/* =================================
   DEPOSITAR E LEVANTAR
================================= */

function abrirFormularioMovimento(modo) {

    fecharFormularioMembro();
    fecharFormularioEliminar();

    modoMovimento = modo;

    const formulario = document.getElementById("formulario-movimento");
    const pagamento = modo === "pagar";

    const etiquetas = {
        depositar: "Valor a depositar (€)",
        levantar: "Valor a levantar (€)",
        pagar: "Valor a pagar (€)"
    };

    document.getElementById("etiqueta-movimento").textContent = etiquetas[modo];

    // O campo "Pagar a" só aparece nos pagamentos
    document.getElementById("etiqueta-destinatario").hidden = !pagamento;
    document.getElementById("destinatario-pagamento").hidden = !pagamento;
    document.getElementById("destinatario-pagamento").value = "";

    document.getElementById("valor-movimento").value = "";
    document.getElementById("erro-movimento").textContent = "";

    formulario.hidden = false;

    (pagamento
        ? document.getElementById("destinatario-pagamento")
        : document.getElementById("valor-movimento")
    ).focus();
}

function fecharFormularioMovimento() {
    modoMovimento = null;
    document.getElementById("formulario-movimento").hidden = true;
}

function abrirFormularioMembro() {

    fecharFormularioMovimento();
    fecharFormularioEliminar();

    document.getElementById("email-novo-membro").value = "";
    document.getElementById("erro-membro").textContent = "";

    document.getElementById("formulario-membro").hidden = false;
    document.getElementById("email-novo-membro").focus();
}

function fecharFormularioMembro() {
    document.getElementById("formulario-membro").hidden = true;
}

/* =================================
   ELIMINAR CONTA CONJUNTA
================================= */

// Dividir o saldo pelos titulares: cada um recebe a mesma parte e
// os cêntimos que sobram ficam para quem elimina a conta
function dividirSaldo(conta, idDeQuemElimina) {

    const total = Math.round(conta.saldo * 100);
    const parte = Math.floor(total / conta.titulares.length);
    const resto = total - parte * conta.titulares.length;

    return conta.titulares.map((id) => ({
        id: id,
        valor: (parte + (id === idDeQuemElimina ? resto : 0)) / 100
    }));
}

// Devolver dinheiro à conta pessoal de um titular
function creditarUtilizador(id, valor) {

    const chaveSaldo = `BanDy_${id}_saldoBanDy`;
    const chaveMovimentos = `BanDy_${id}_movimentosBanDy`;

    const atual = localStorage.getItem(chaveSaldo) === null
        ? SALDO_INICIAL
        : Number(localStorage.getItem(chaveSaldo));

    localStorage.setItem(chaveSaldo, arredondar(atual + valor).toFixed(2));

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
        tipo: "deposito",
        valor: valor,
        data: new Date().toISOString()
    });

    localStorage.setItem(chaveMovimentos, JSON.stringify(movimentos.slice(0, 10)));
}

function abrirFormularioEliminar() {

    const conta = obterContaConjunta();

    if (!conta) {
        return;
    }

    fecharFormularioMovimento();
    fecharFormularioMembro();

    const partes = dividirSaldo(conta, obterUtilizador().id);
    const base = partes.length ? Math.min(...partes.map((p) => p.valor)) : 0;

    let aviso = "Vais eliminar a conta \"" + conta.nome + "\". ";

    if (conta.saldo > 0) {
        aviso += "O saldo de " + formatarEuros(conta.saldo) +
            " é dividido por " + conta.titulares.length +
            " titulares (cerca de " + formatarEuros(base) + " cada). ";
    } else {
        aviso += "A conta não tem saldo. ";
    }

    aviso += "Esta ação não pode ser desfeita.";

    document.getElementById("aviso-eliminar").textContent = aviso;
    document.getElementById("formulario-eliminar").hidden = false;
}

function fecharFormularioEliminar() {
    document.getElementById("formulario-eliminar").hidden = true;
}

function eliminarContaConjunta(evento) {

    evento.preventDefault();

    const contas = obterContasConjuntas();
    const eu = obterUtilizador();
    const conta = contas.find((item) => item.titulares.includes(eu.id));

    if (!conta) {
        return;
    }

    // Devolver a cada titular a sua parte do saldo
    if (conta.saldo > 0) {
        dividirSaldo(conta, eu.id).forEach((parte) => {
            if (parte.valor > 0) {
                creditarUtilizador(parte.id, parte.valor);
            }
        });
    }

    guardarContasConjuntas(contas.filter((item) => item.id !== conta.id));

    fecharFormularioEliminar();
    mostrarSaldo();
    mostrarContaConjunta();

    document.getElementById("aviso-conta-eliminada").textContent =
        "A conta \"" + conta.nome + "\" foi eliminada" +
        (conta.saldo > 0 ? " e o saldo foi dividido pelos titulares." : ".");
}

/* =================================
   ADICIONAR MEMBRO
================================= */

function adicionarMembro(evento) {

    evento.preventDefault();

    const erro = document.getElementById("erro-membro");
    const email = document.getElementById("email-novo-membro").value
        .trim().toLowerCase();

    erro.textContent = "";

    if (!email) {
        erro.textContent = "Indica o email do novo membro.";
        return;
    }

    const contas = obterContasConjuntas();
    const eu = obterUtilizador();
    const conta = contas.find((item) => item.titulares.includes(eu.id));

    if (!conta) {
        return;
    }

    if (conta.titulares.length >= MAX_TITULARES) {
        erro.textContent = "A conta já tem o máximo de " + MAX_TITULARES + " titulares.";
        return;
    }

    const novo = obterContasBanDy().find((item) => item.email === email);

    if (!novo) {
        erro.textContent = "Não existe nenhum utilizador BanDy com este email.";
        return;
    }

    if (conta.titulares.includes(novo.id)) {
        erro.textContent = "Este utilizador já é titular desta conta.";
        return;
    }

    if (contas.some((item) => item.titulares.includes(novo.id))) {
        erro.textContent = "Este utilizador já tem uma conta conjunta.";
        return;
    }

    conta.titulares.push(novo.id);

    guardarContasConjuntas(contas);

    fecharFormularioMembro();
    mostrarContaConjunta();
}

function confirmarMovimento(evento) {

    evento.preventDefault();

    const erro = document.getElementById("erro-movimento");
    let destinoPagamento = "";
    const valor = arredondar(
        Number(document.getElementById("valor-movimento").value)
    );

    erro.textContent = "";

    if (!Number.isFinite(valor) || valor <= 0) {
        erro.textContent = "Indica um valor superior a 0.";
        return;
    }

    // Ler as contas outra vez: o outro titular pode ter feito alterações
    const contas = obterContasConjuntas();
    const eu = obterUtilizador();
    const conta = contas.find((item) => item.titulares.includes(eu.id));

    if (!conta) {
        return;
    }

    if (modoMovimento === "depositar") {

        const meuSaldo = obterSaldo();

        if (valor > meuSaldo) {
            erro.textContent =
                "Saldo insuficiente. A tua conta tem " + formatarEuros(meuSaldo) + ".";
            return;
        }

        atualizarSaldo(arredondar(meuSaldo - valor));
        conta.saldo = arredondar(conta.saldo + valor);

        // Aparece também nos movimentos da carteira pessoal
        guardarMovimento({
            tipo: "transferencia",
            destinatario: conta.nome,
            valor: valor
        });

    } else if (modoMovimento === "pagar") {

        const destinatario = document
            .getElementById("destinatario-pagamento").value.trim();

        if (!destinatario) {
            erro.textContent = "Indica a quem queres pagar.";
            return;
        }

        if (valor > conta.saldo) {
            erro.textContent =
                "Saldo insuficiente. A conta conjunta tem " + formatarEuros(conta.saldo) + ".";
            return;
        }

        conta.saldo = arredondar(conta.saldo - valor);
        destinoPagamento = destinatario;

    } else if (modoMovimento === "levantar") {

        if (valor > conta.saldo) {
            erro.textContent =
                "Saldo insuficiente. A conta conjunta tem " + formatarEuros(conta.saldo) + ".";
            return;
        }

        conta.saldo = arredondar(conta.saldo - valor);
        atualizarSaldo(arredondar(obterSaldo() + valor));

        guardarMovimento({
            tipo: "deposito",
            valor: valor
        });

    } else {
        return;
    }

    const tipos = {
        depositar: "deposito",
        levantar: "levantamento",
        pagar: "pagamento"
    };

    const movimento = {
        tipo: tipos[modoMovimento],
        valor: valor,
        autor: eu.id,
        data: new Date().toISOString()
    };

    if (modoMovimento === "pagar") {
        movimento.destinatario = destinoPagamento;
    }

    conta.movimentos.unshift(movimento);

    // Guardar os últimos 20 movimentos
    conta.movimentos = conta.movimentos.slice(0, 20);

    guardarContasConjuntas(contas);

    fecharFormularioMovimento();
    mostrarContaConjunta();
}

/* =================================
   INICIAR
================================= */

document.addEventListener("DOMContentLoaded", () => {

    if (!document.getElementById("sem-conta") || !temSessao()) {
        return;
    }

    document.getElementById("formulario-criar-conta")
        .addEventListener("submit", criarContaConjunta);

    document.getElementById("formulario-movimento")
        .addEventListener("submit", confirmarMovimento);

    document.getElementById("botao-cancelar-movimento")
        .addEventListener("click", fecharFormularioMovimento);

    document.getElementById("formulario-membro")
        .addEventListener("submit", adicionarMembro);

    document.getElementById("formulario-eliminar")
        .addEventListener("submit", eliminarContaConjunta);

    document.getElementById("botao-cancelar-eliminar")
        .addEventListener("click", fecharFormularioEliminar);

    document.getElementById("botao-cancelar-membro")
        .addEventListener("click", fecharFormularioMembro);

    document.querySelectorAll("[data-conjunta]").forEach((botao) => {
        botao.addEventListener("click", () => {

            if (botao.dataset.conjunta === "membro") {
                abrirFormularioMembro();
            } else if (botao.dataset.conjunta === "eliminar") {
                abrirFormularioEliminar();
            } else if (botao.dataset.conjunta === "pagar") {
                // Mesmo pagamento da conta principal (QR Code / NFC)
                window.location.href = "pagamento.html?conta=conjunta";
            } else {
                abrirFormularioMovimento(botao.dataset.conjunta);
            }
        });
    });

    // O carteira.js alterna "saldoVisivel"; aqui só voltamos a desenhar o saldo
    document.querySelector('[data-acao="ocultar-saldo"]')
        ?.addEventListener("click", mostrarSaldoConjunta);

    mostrarContaConjunta();
});
