
// MOSTRAR DADOS DO PERFIL

const utilizadorPerfil = obterUtilizador();

const perfilVisitante = document.getElementById("perfil-visitante");

const perfilUtilizador = document.getElementById("perfil-utilizador");

if (utilizadorPerfil) {

    // Utilizador com sessão iniciada
    perfilUtilizador.hidden = false;

    document.getElementById("perfil-nome-destaque").textContent =
        utilizadorPerfil.nome;

    document.getElementById("perfil-nome").textContent =
        utilizadorPerfil.nome;

    document.getElementById("perfil-email").textContent =
        utilizadorPerfil.email;

    document.getElementById("perfil-data").textContent =
        utilizadorPerfil.dataNascimento
            ? utilizadorPerfil.dataNascimento
                .split("-").reverse().join("/")
            : "Não indicado";

    document.getElementById("perfil-genero").textContent =
        utilizadorPerfil.genero || "Não indicado";

    // Botão terminar sessão
    document.getElementById("botao-terminar-sessao")
        .addEventListener("click", terminarSessao);

} else {

    // Utilizador sem sessão iniciada
    perfilVisitante.hidden = false;

    document.getElementById("botao-login")
        .addEventListener("click", () => {
            mostrarFormularioBanDy();
        });
}
