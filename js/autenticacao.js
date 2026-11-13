
/* =================================
   SISTEMA DE AUTENTICAÇÃO BANDY
================================= */

// Chaves usadas no armazenamento do navegador
const CHAVE_CONTAS_BANDY = "contasBanDyV2";
const CHAVE_SESSAO_BANDY = "sessaoBanDyV2";

// Páginas que exigem login
const PAGINAS_PROTEGIDAS = [
    "carteira.html",
    "depositar.html",
    "metodo_pagamento.html",
    "transferir.html",
    "pagamento.html",
    "conta_conjunta.html",
    "adicionar_bilhete.html",
    "comprar_bilhete.html"
];

// Obter todas as contas registadas
function obterContasBanDy() {
    try {
        const contas = JSON.parse(
            localStorage.getItem(CHAVE_CONTAS_BANDY) || "[]"
        );

        return Array.isArray(contas) ? contas : [];

    } catch (erro) {
        return [];
    }
}

// Obter o utilizador com sessão iniciada
function obterUtilizador() {
    const id = sessionStorage.getItem(CHAVE_SESSAO_BANDY);

    if (!id) {
        return null;
    }

    const conta = obterContasBanDy().find(
        (item) => item.id === id
    );

    if (!conta) {
        sessionStorage.removeItem(CHAVE_SESSAO_BANDY);
    }

    return conta || null;
}

// Verificar se existe uma sessão iniciada
function temSessao() {
    return obterUtilizador() !== null;
}

// Criar uma chave de armazenamento própria de cada conta
function chaveDoUtilizador(chave) {
    const conta = obterUtilizador();

    return conta ? `BanDy_${conta.id}_${chave}` : null;
}

// Terminar sessão
function terminarSessao() {
    sessionStorage.removeItem(CHAVE_SESSAO_BANDY);

    window.location.href = "perfil.html";
}

/* =================================
   PALAVRAS-PASSE
================================= */

// Converter bytes para hexadecimal
function hexadecimal(bytes) {
    return Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, "0")
    ).join("");
}

// Derivar um hash da palavra-passe
async function derivarPalavraPasse(palavraPasse, saltHex) {

    const salt = new Uint8Array(
        saltHex.match(/.{2}/g).map(
            (valor) => parseInt(valor, 16)
        )
    );

    const chave = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(palavraPasse),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 180000,
            hash: "SHA-256"
        },
        chave,
        256
    );

    return hexadecimal(new Uint8Array(bits));
}

/* =================================
   REGISTO
================================= */

async function registarConta(dados) {

    const contas = obterContasBanDy();

    const email = dados.email.trim().toLowerCase();

    // Impedir registos com emails repetidos
    if (contas.some((conta) => conta.email === email)) {
        throw new Error("Já existe uma conta com este email.");
    }

    const salt = hexadecimal(
        crypto.getRandomValues(new Uint8Array(16))
    );

    const hash = await derivarPalavraPasse(
        dados.palavraPasse,
        salt
    );

    // Criar conta
    const conta = {
        id: crypto.randomUUID(),
        nome: dados.nome.trim(),
        email: email,
        dataNascimento: dados.dataNascimento,
        genero: dados.genero,
        salt: salt,
        hash: hash
    };

    contas.push(conta);

    // Guardar contas
    localStorage.setItem(
        CHAVE_CONTAS_BANDY,
        JSON.stringify(contas)
    );

    // Iniciar sessão automaticamente após o registo
    sessionStorage.setItem(
        CHAVE_SESSAO_BANDY,
        conta.id
    );
}

/* =================================
   LOG-IN
================================= */

async function iniciarSessao(email, palavraPasse) {

    const conta = obterContasBanDy().find(
        (item) => item.email === email.trim().toLowerCase()
    );

    if (!conta) {
        throw new Error("Email ou palavra-passe incorretos.");
    }

    const hash = await derivarPalavraPasse(
        palavraPasse,
        conta.salt
    );

    if (hash !== conta.hash) {
        throw new Error("Email ou palavra-passe incorretos.");
    }

    sessionStorage.setItem(
        CHAVE_SESSAO_BANDY,
        conta.id
    );
}

/* =================================
   POP-UPS
================================= */

// Fechar o pop-up
function fecharPopupBanDy() {
    document.getElementById("modal-bandy")?.remove();
}

// Criar um pop-up
function criarPopupBanDy(conteudo) {

    fecharPopupBanDy();

    const fundo = document.createElement("div");

    fundo.id = "modal-bandy";
    fundo.className = "modal-bandy-fundo";

    fundo.innerHTML = `
        <div class="modal-bandy-caixa"
             role="dialog"
             aria-modal="true"
             aria-label="BanDy">

            <button type="button"
                    class="modal-bandy-x"
                    aria-label="Fechar">×</button>

            <div id="modal-bandy-conteudo"></div>

        </div>
    `;

    fundo.querySelector("#modal-bandy-conteudo")
        .appendChild(conteudo);

    document.body.appendChild(fundo);

    fundo.querySelector(".modal-bandy-x")
        .addEventListener("click", fecharPopupBanDy);

    // Fechar ao clicar fora da caixa
    fundo.addEventListener("click", (evento) => {
        if (evento.target === fundo) {
            fecharPopupBanDy();
        }
    });

    fundo.querySelector(".modal-bandy-x").focus();
}

// Mostrar aviso quando não existe sessão
function mostrarBloqueioBanDy() {

    const conteudo = document.createElement("div");

    conteudo.innerHTML = `
        <div class="modal-bandy-icone">
            <i class="fa-solid fa-lock"></i>
        </div>

        <h2>Inicia sessão para continuar</h2>

        <p>
            Precisas de fazer Log-In ou Registo
            para aceder a esta funcionalidade.
        </p>

        <button type="button"
                class="modal-bandy-botao"
                id="modal-bandy-entrar">
            Fazer Log-In / Registo
        </button>

        <button type="button"
                class="modal-bandy-secundario"
                id="modal-bandy-cancelar">
            Agora não
        </button>
    `;

    criarPopupBanDy(conteudo);

    conteudo.querySelector("#modal-bandy-entrar")
        .addEventListener("click", () => {
            mostrarFormularioBanDy();
        });

    conteudo.querySelector("#modal-bandy-cancelar")
        .addEventListener("click", fecharPopupBanDy);
}

/* =================================
   FORMULÁRIO DE LOG-IN E REGISTO
================================= */

function mostrarFormularioBanDy(separador = "login") {

    const conteudo = document.createElement("div");

    conteudo.innerHTML = `
        <h2>Bem-vindo à BanDy</h2>

        <div class="modal-bandy-separadores">
            <button type="button" data-separador="login">
                Log-In
            </button>

            <button type="button" data-separador="registo">
                Registo
            </button>
        </div>

        <form id="formulario-auth" class="formulario-auth">

            <div class="campos-registo" hidden>
                <label>
                    Nome completo
                    <input name="nome"
                           autocomplete="name"
                           maxlength="100">
                </label>
            </div>

            <label>
                Email
                <input name="email"
                       type="email"
                       autocomplete="email"
                       required>
            </label>

            <div class="campos-registo" hidden>

                <label>
                    Data de nascimento
                    <input name="dataNascimento" type="date">
                </label>

                <label>
                    Género
                    <select name="genero">
                        <option value="">Selecionar</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                        <option value="Prefiro não indicar">
                            Prefiro não indicar
                        </option>
                    </select>
                </label>

            </div>

            <label>
                Palavra-passe
                <input name="palavraPasse"
                       type="password"
                       minlength="8"
                       autocomplete="current-password"
                       required>
            </label>

            <p id="erro-auth"
               class="erro-auth"
               role="alert"
               hidden></p>

            <button type="submit"
                    class="modal-bandy-botao"
                    id="submeter-auth">
                Entrar
            </button>

        </form>
    `;

    criarPopupBanDy(conteudo);

    const formulario = conteudo.querySelector("#formulario-auth");

    const botoes = conteudo.querySelectorAll("[data-separador]");

    // Alternar entre Log-In e Registo
    function mudarSeparador(valor) {

        separador = valor;

        conteudo.querySelectorAll(".campos-registo")
            .forEach((elemento) => {

                elemento.hidden = valor !== "registo";

                elemento.querySelectorAll("input, select")
                    .forEach((campo) => {
                        campo.required = valor === "registo";
                    });
            });

        botoes.forEach((botao) => {
            botao.classList.toggle(
                "selecionado",
                botao.dataset.separador === valor
            );
        });

        formulario.elements.palavraPasse.autocomplete =
            valor === "registo"
                ? "new-password"
                : "current-password";

        conteudo.querySelector("#submeter-auth").textContent =
            valor === "registo" ? "Criar conta" : "Entrar";

        conteudo.querySelector("#erro-auth").hidden = true;
    }

    botoes.forEach((botao) => {
        botao.addEventListener("click", () => {
            mudarSeparador(botao.dataset.separador);
        });
    });

    mudarSeparador(separador);

    // Submeter o formulário
    formulario.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        const erro = conteudo.querySelector("#erro-auth");
        const botao = conteudo.querySelector("#submeter-auth");

        erro.hidden = true;
        botao.disabled = true;

        try {

            if (!crypto.subtle || !crypto.randomUUID) {
                throw new Error(
                    "Abre o site através do Live Server (localhost)."
                );
            }

            if (separador === "registo") {

                await registarConta({
                    nome: formulario.elements.nome.value,
                    email: formulario.elements.email.value,
                    dataNascimento: formulario.elements.dataNascimento.value,
                    genero: formulario.elements.genero.value,
                    palavraPasse: formulario.elements.palavraPasse.value
                });

            } else {

                await iniciarSessao(
                    formulario.elements.email.value,
                    formulario.elements.palavraPasse.value
                );

            }

            // Atualizar a página depois da autenticação
            window.location.href = "perfil.html";

        } catch (excecao) {

            erro.textContent =
                excecao.message || "Não foi possível iniciar sessão.";

            erro.hidden = false;
            botao.disabled = false;
        }
    });
}

/* =================================
   PROTEGER A NAVEGAÇÃO
================================= */

// Intercetar links de páginas protegidas
document.addEventListener("click", (evento) => {

    const link = evento.target.closest("a[href]");

    if (!link || temSessao()) {
        return;
    }

    const destino = new URL(link.href, location.href)
        .pathname.split("/").pop().toLowerCase();

    if (PAGINAS_PROTEGIDAS.includes(destino)) {

        evento.preventDefault();
        evento.stopImmediatePropagation();

        mostrarBloqueioBanDy();
    }

}, true);

// Impedir acesso direto às páginas protegidas
const paginaAtual = location.pathname
    .split("/")
    .pop()
    .toLowerCase();

if (PAGINAS_PROTEGIDAS.includes(paginaAtual) && !temSessao()) {
    window.location.replace("inicio.html");
}
