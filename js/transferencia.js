// Alertar o user de quando a transferência é concluída e atualizar o saldo
document.getElementById("transferForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const destinatario = e.target.destinatario.value.trim();
    const quantia = Number(e.target.quantia.value);
    const saldo = obterSaldo();

    if (quantia > saldo) {
        alert("Saldo insuficiente.");
        return;
    }

    atualizarSaldo(saldo - quantia);

    alert(`Transferência de ${quantia.toFixed(2).replace(".", ",")} € para ${destinatario} concluída!`);
    e.target.reset();
});