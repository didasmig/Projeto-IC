document.getElementById("transferForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const destinatario = e.target.destinatario.value.trim();
    const quantia = Number(e.target.quantia.value)
        .toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

    alert(`Transferência de ${quantia} para ${destinatario} concluída!`);
    e.target.reset();
});