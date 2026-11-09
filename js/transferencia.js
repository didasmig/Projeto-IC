// Alertar o user de quando a transferência é concluída e atualizar o saldo
document.getElementById("transferForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const destinatario = e.target.destinatario.value.trim();
    const quantia = Number(e.target.quantia.value);
    const saldo = obterSaldo();

    if (!Number.isFinite(quantia) || quantia <= 0) {
        alert("Introduza uma quantia válida.");
        return;
    }

    if (quantia > saldo) {
        alert("Saldo insuficiente.");
        return;
    }

    atualizarSaldo(saldo - quantia);

    
    // Guardar transferência no histórico da conta atual
    guardarMovimento({
        tipo: "transferencia",
        destinatario: destinatario,
        valor: quantia
    });


    const novoMovimento = {
        tipo: "transferencia",
        destinatario: destinatario,
        valor: quantia,
        data: new Date().toISOString()
    };

    movimentos.unshift(novoMovimento);

    const movimentosRecentes = movimentos.slice(0, 10);

    localStorage.setItem(
        "movimentosBanDy",
        JSON.stringify(movimentosRecentes)
    );


    alert(`Transferência de ${quantia.toFixed(2).replace(".", ",")} € para ${destinatario} concluída!`);
    e.target.reset();
});