/* =================================
   COMPRAR BILHETE
   1) escolher tipo e quantidade  2) confirmar  3) notificação
   O pagamento é feito com o saldo da conta BanDy.
================================= */

const festivalCompra = obterFestivalDoEndereco();

const MAXIMO_BILHETES = 4;

let bilheteEscolhido = null;
let diaEscolhido = null;
let quantidadeEscolhida = 1;
let compraPendente = null;
let temporizadorCompra = null;

function formatarPreco(valor) {
    return valor.toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " €";
}

function arredondar(valor) {
    return Math.round(valor * 100) / 100;
}

document.addEventListener("DOMContentLoaded", () => {

    if (!festivalCompra) {
        document.getElementById("compra-inexistente").hidden = false;
        return;
    }

    const formulario = document.getElementById("formulario-compra");
    const opcoes = document.getElementById("opcoes-bilhete");
    const quantidadeValor = document.getElementById("quantidade-valor");
    const totalCompra = document.getElementById("compra-total");
    const mensagem = document.getElementById("mensagem-compra");
    const seccaoDia = document.getElementById("seccao-dia");
    const diasBilhete = document.getElementById("dias-bilhete");

    const popup = document.getElementById("popup-confirmar-compra");
    const notificacao = document.getElementById("notificacao-compra");

    document.title = "BanDy - Comprar bilhete";
    document.getElementById("compra-festival").textContent =
        festivalCompra.nome + " · " + festivalCompra.datas;

    document.getElementById("botao-voltar-festival").href =
        "festival.html?id=" + encodeURIComponent(festivalCompra.id);

    /* ---------- Tipos de bilhete ---------- */

    festivalCompra.bilhetes.forEach((bilhete, indice) => {

        const botao = document.createElement("button");
        botao.type = "button";
        botao.classList.add("opcao-bilhete");
        botao.dataset.id = bilhete.id;

        const texto = document.createElement("span");
        texto.classList.add("opcao-texto");

        const nome = document.createElement("strong");
        nome.textContent = bilhete.nome;

        const descricao = document.createElement("small");
        descricao.textContent = bilhete.descricao;

        texto.append(nome, descricao);

        const preco = document.createElement("span");
        preco.classList.add("opcao-preco");
        preco.textContent = formatarPreco(bilhete.preco);

        botao.append(texto, preco);

        botao.addEventListener("click", () => escolherBilhete(bilhete));

        opcoes.appendChild(botao);

        if (indice === 0) {
            escolherBilhete(bilhete);
        }
    });

    /* ---------- Dia (só para o bilhete diário) ---------- */

    festivalCompra.dias.forEach((dia, indice) => {

        const botao = document.createElement("button");
        botao.type = "button";
        botao.classList.add("botao-dia");
        botao.dataset.id = dia.id;
        botao.textContent = dia.rotulo;

        botao.addEventListener("click", () => escolherDia(dia));

        diasBilhete.appendChild(botao);

        if (indice === 0) {
            diaEscolhido = dia;
            botao.classList.add("selecionado");
        }
    });

    function escolherDia(dia) {

        diaEscolhido = dia;

        diasBilhete.querySelectorAll(".botao-dia").forEach((botao) => {
            botao.classList.toggle("selecionado", botao.dataset.id === dia.id);
        });

        mensagem.textContent = "";
    }

    // Dia escolhido (null se o bilhete não for diário)
    function diaDaCompra() {
        return bilheteEscolhido.id === "diario" ? diaEscolhido : null;
    }

    function escolherBilhete(bilhete) {

        bilheteEscolhido = bilhete;

        seccaoDia.hidden = bilhete.id !== "diario";

        opcoes.querySelectorAll(".opcao-bilhete").forEach((botao) => {
            botao.classList.toggle("selecionado", botao.dataset.id === bilhete.id);
        });

        atualizarTotal();
    }

    /* ---------- Quantidade ---------- */

    function atualizarTotal() {

        quantidadeValor.textContent = quantidadeEscolhida;

        totalCompra.textContent = formatarPreco(
            arredondar(bilheteEscolhido.preco * quantidadeEscolhida)
        );

        mensagem.textContent = "";
    }

    document.getElementById("quantidade-menos").addEventListener("click", () => {
        if (quantidadeEscolhida > 1) {
            quantidadeEscolhida--;
            atualizarTotal();
        }
    });

    document.getElementById("quantidade-mais").addEventListener("click", () => {
        if (quantidadeEscolhida < MAXIMO_BILHETES) {
            quantidadeEscolhida++;
            atualizarTotal();
        }
    });

    /* ---------- 1) Pedir a compra ---------- */

    function mostrarSaldoInsuficiente(saldo) {

        mensagem.textContent =
            "Saldo insuficiente. Tens " + formatarPreco(saldo) + ". ";

        const ligacao = document.createElement("a");
        ligacao.href = "depositar.html";
        ligacao.textContent = "Depositar";
        ligacao.classList.add("link-iniciar-sessao");

        mensagem.appendChild(ligacao);
    }

    formulario.addEventListener("submit", (e) => {

        e.preventDefault();

        const total = arredondar(bilheteEscolhido.preco * quantidadeEscolhida);
        const saldo = obterSaldo();

        if (total > saldo) {
            mostrarSaldoInsuficiente(saldo);
            return;
        }

        compraPendente = {
            bilhete: bilheteEscolhido,
            quantidade: quantidadeEscolhida,
            total,
            dia: diaDaCompra()
        };

        document.getElementById("confirmar-compra-valor").textContent = "- " + formatarPreco(total);
        document.getElementById("confirmar-compra-descricao").textContent =
            quantidadeEscolhida + " × " + bilheteEscolhido.nome +
            (diaDaCompra() ? " (" + diaDaCompra().rotulo + ")" : "") +
            " · " + festivalCompra.nome;
        document.getElementById("confirmar-compra-saldo").textContent =
            "Saldo depois: " + formatarPreco(arredondar(saldo - total));

        popup.hidden = false;
        document.getElementById("confirmar-compra-confirmar").focus();
    });

    /* ---------- 2) Confirmar ou cancelar ---------- */

    function fecharConfirmacao() {
        popup.hidden = true;
        compraPendente = null;
    }

    // Código único de cada bilhete
    function gerarCodigoBilhete() {

        const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        const valores = crypto.getRandomValues(new Uint8Array(8));

        return "BD" + Array.from(valores, (v) => letras[v % letras.length]).join("");
    }

    function confirmarCompra() {

        if (!compraPendente) {
            return;
        }

        const { bilhete, quantidade, total, dia } = compraPendente;

        // Ler o saldo outra vez, por segurança
        const saldo = obterSaldo();

        fecharConfirmacao();

        if (total > saldo) {
            mostrarSaldoInsuficiente(saldo);
            return;
        }

        const novoSaldo = arredondar(saldo - total);

        atualizarSaldo(novoSaldo);

        // Guardar os bilhetes na conta (mesma lista da página "Já tenho bilhete")
        const chave = chaveDoUtilizador("bilhetesBanDy");

        if (chave) {

            let lista = [];

            try {
                lista = JSON.parse(localStorage.getItem(chave) || "[]");
            } catch (erro) {
                lista = [];
            }

            for (let i = 0; i < quantidade; i++) {
                lista.unshift({
                    codigo: gerarCodigoBilhete(),
                    festival: festivalCompra.id,
                    tipo: bilhete.id,
                    dia: dia ? dia.id : null,
                    data: new Date().toISOString()
                });
            }

            localStorage.setItem(chave, JSON.stringify(lista));
        }

        // Guardar no histórico de movimentos
        guardarMovimento({
            tipo: "bilhete",
            destinatario: festivalCompra.nome,
            valor: total
        });

        quantidadeEscolhida = 1;
        atualizarTotal();

        mostrarNotificacao(
            quantidade + " × " + bilhete.nome + (dia ? " (" + dia.rotulo + ")" : "") +
            " para " + festivalCompra.nome + ".",
            "Novo saldo: " + formatarPreco(novoSaldo)
        );
    }

    document.getElementById("confirmar-compra-confirmar")
        .addEventListener("click", confirmarCompra);

    document.getElementById("confirmar-compra-cancelar")
        .addEventListener("click", fecharConfirmacao);

    popup.addEventListener("click", (e) => {
        if (e.target === popup) {
            fecharConfirmacao();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !popup.hidden) {
            fecharConfirmacao();
        }
    });

    /* ---------- 3) Notificação ---------- */

    function fecharNotificacao() {
        clearTimeout(temporizadorCompra);
        notificacao.hidden = true;
    }

    function mostrarNotificacao(texto, saldo) {

        document.getElementById("notificacao-compra-mensagem").textContent = texto;
        document.getElementById("notificacao-compra-saldo").textContent = saldo;

        notificacao.hidden = false;

        clearTimeout(temporizadorCompra);
        temporizadorCompra = setTimeout(fecharNotificacao, 6000);
    }

    document.getElementById("notificacao-compra-fechar")
        .addEventListener("click", fecharNotificacao);

    document.getElementById("conteudo-compra").hidden = false;
});
