/* =================================
   DADOS DOS FESTIVAIS
   (usados por adicionar_festival.html, festival.html e comprar_bilhete.html)

   Para adicionar um festival basta acrescentar uma entrada em DADOS_FESTIVAIS.
   Os dias do festival e os bilhetes são calculados a partir destes dados.
================================= */

const DADOS_FESTIVAIS = {

    "primavera-sound": {
        nome: "NOS Primavera Sound",
        iniciais: "PS",
        mes: "Junho",
        diaInicio: 4,
        diaFim: 6,
        local: "Porto",
        latitude: 41.1750,
        longitude: -8.6850,
        precoDiario: 30,
        precoPasse: 70
    },

    "super-bock-super-rock": {
        nome: "Super Bock Super Rock",
        iniciais: "SB",
        mes: "Julho",
        diaInicio: 16,
        diaFim: 18,
        local: "Meco",
        latitude: 38.5073,
        longitude: -9.1650,
        precoDiario: 28,
        precoPasse: 65
    },

    "meo-sudoeste": {
        nome: "MEO Sudoeste",
        iniciais: "MS",
        mes: "Agosto",
        diaInicio: 12,
        diaFim: 17,
        local: "Azenhas do Mar",
        latitude: 38.8393,
        longitude: -9.4609,
        precoDiario: 25,
        precoPasse: 60
    },

    "paredes-de-coura": {
        nome: "Vodafone Paredes de Coura",
        iniciais: "PC",
        mes: "Agosto",
        diaInicio: 17,
        diaFim: 20,
        local: "Paredes de Coura",
        latitude: 41.9136,
        longitude: -8.5667,
        precoDiario: 27,
        precoPasse: 72
    },

    "sumol-summerfest": {
        nome: "Sumol Summerfest",
        iniciais: "SS",
        mes: "Agosto",
        diaInicio: 21,
        diaFim: 23,
        local: "Ericeira",
        latitude: 38.9630,
        longitude: -9.4150,
        precoDiario: 22,
        precoPasse: 50
    },

    "nos-alive": {
        nome: "NOS Alive",
        iniciais: "NA",
        mes: "Agosto",
        diaInicio: 28,
        diaFim: 31,
        local: "Algés",
        latitude: 38.7017,
        longitude: -9.2304,
        precoDiario: 28,
        precoPasse: 75
    },

    "meo-kalorama": {
        nome: "MEO Kalorama",
        iniciais: "MK",
        mes: "Setembro",
        diaInicio: 4,
        diaFim: 6,
        local: "Lisboa",
        latitude: 38.7640,
        longitude: -9.1300,
        precoDiario: 26,
        precoPasse: 55
    },

    "festival-f": {
        nome: "Festival F",
        iniciais: "FF",
        mes: "Setembro",
        diaInicio: 10,
        diaFim: 12,
        local: "Faro",
        latitude: 37.0194,
        longitude: -7.9304,
        precoDiario: 20,
        precoPasse: 45
    }
};

// Calcular dias, datas e bilhetes de cada festival
const FESTIVAIS = {};

Object.keys(DADOS_FESTIVAIS).forEach((id) => {

    const festival = DADOS_FESTIVAIS[id];

    const dias = [];

    for (let dia = festival.diaInicio; dia <= festival.diaFim; dia++) {
        dias.push({
            id: String(dia),
            rotulo: dia + " " + festival.mes
        });
    }

    FESTIVAIS[id] = {
        ...festival,
        datas: festival.diaInicio + "–" + festival.diaFim + " " + festival.mes,
        dias: dias,
        bilhetes: [
            {
                id: "diario",
                nome: "Bilhete diário",
                descricao: "Acesso a um dia à escolha",
                preco: festival.precoDiario
            },
            {
                id: "passe",
                nome: "Passe geral",
                descricao: "Acesso aos " + dias.length + " dias",
                preco: festival.precoPasse
            }
        ]
    };
});

// Obter o festival indicado no endereço (?id=...)
function obterFestivalDoEndereco() {

    const id = new URLSearchParams(window.location.search).get("id");

    if (id && Object.prototype.hasOwnProperty.call(FESTIVAIS, id)) {
        return { id: id, ...FESTIVAIS[id] };
    }

    return null;
}

/* =================================
   DATAS DA PRÓXIMA EDIÇÃO
   (os festivais repetem-se todos os anos)
================================= */

const NOMES_MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Início e fim da edição a decorrer ou da próxima a acontecer
function obterProximaEdicao(festival, hoje = new Date()) {

    const mes = NOMES_MESES.indexOf(festival.mes);

    let ano = hoje.getFullYear();

    let fim = new Date(ano, mes, festival.diaFim, 23, 59, 59);

    // Já passou este ano: a próxima edição é no ano seguinte
    if (fim < hoje) {
        ano++;
        fim = new Date(ano, mes, festival.diaFim, 23, 59, 59);
    }

    return {
        inicio: new Date(ano, mes, festival.diaInicio),
        fim: fim
    };
}
