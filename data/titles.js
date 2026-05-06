// Títulos do jogador — ascensão real ancorada na HGA.
// Avaliados em ordem; o de maior rank que casar é o atual.
// `t` contém: totalEnigmas, worldsWithContent, worldsCompleted.
window.SANKOFA_TITLES = [
  {
    rank: 1,
    id: "cacador",
    title: "Caçador-Coletor",
    short: "Caçador",
    icon: "◦",
    desc: "Os primeiros passos. Toda história começa aqui.",
    c: function () { return true; }
  },
  {
    rank: 2,
    id: "grio",
    title: "Griô Aprendiz",
    short: "Griô",
    icon: "◌",
    desc: "Guarda as primeiras memórias da aldeia.",
    c: function (s) { return s.solved.length >= 1; }
  },
  {
    rank: 3,
    id: "escriba",
    title: "Escriba de Mêh",
    short: "Escriba",
    icon: "◍",
    desc: "Domina os símbolos sagrados de Kemet.",
    c: function (s) { return s.solved.filter(function (e) { return e.indexOf("w1") === 0; }).length >= 5; }
  },
  {
    rank: 4,
    id: "mercador",
    title: "Mercador de Cauris",
    short: "Mercador",
    icon: "◈",
    desc: "Atravessa rotas com mais de 200 cauris no bornal.",
    c: function (s) { return (s.cauris || 0) >= 200; }
  },
  {
    rank: 5,
    id: "conselheiro",
    title: "Conselheiro Real",
    short: "Conselheiro",
    icon: "◇",
    desc: "Fala aos ouvidos do Mansa. Domina dois mundos.",
    c: function (s, t) { return (t && t.worldsCompleted >= 2); }
  },
  {
    rank: 6,
    id: "principe",
    title: "Príncipe(sa) da Casa",
    short: "Príncipe",
    icon: "◆",
    desc: "Sangue real corre nas linhagens da África.",
    c: function (s, t) { return !!s.house || (t && t.worldsCompleted >= 3); }
  },
  {
    rank: 7,
    id: "mansa",
    title: "Mansa, Faraó, Negus",
    short: "Mansa",
    icon: "♛",
    desc: "Soberano de uma das grandes casas africanas.",
    c: function (s, t) {
      // Mansa = 5 mundos completos OU casa escolhida + mundo da casa 100%.
      if (t && t.worldsCompleted >= 5) return true;
      if (s.house && t && t.houseWorldComplete) return true;
      return false;
    }
  },
  {
    rank: 8,
    id: "soberano",
    title: "Soberano Pan-Africano",
    short: "Soberano",
    icon: "☀",
    desc: "Reúne sob a sua coroa todos os fragmentos do continente.",
    c: function (s, t) {
      if (!t || !t.worldsWithContent) return false;
      return t.worldsCompleted >= t.worldsWithContent;
    }
  }
];
