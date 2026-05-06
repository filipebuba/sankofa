// Liga dos Griôs — tiers semanais. Reset domingo 00:00 UTC.
window.SANKOFA_LEAGUES = [
  { rank: 1, id: "cacador",  name: "Caçador",                 minPct: 0,   color: "#5a5245" },
  { rank: 2, id: "grio",     name: "Griô do Sahel",           minPct: 50,  color: "#8a6a20" },
  { rank: 3, id: "mercador", name: "Mercador de Tombuctu",    minPct: 75,  color: "#c9a84c" },
  { rank: 4, id: "consel",   name: "Conselheiro Real",        minPct: 90,  color: "#b85a3a" },
  { rank: 5, id: "mansa",    name: "Mansa da Semana",         minPct: 97,  color: "#d9be62" },
  { rank: 6, id: "soberano", name: "Soberano Pan-Africano",   minPct: 100, color: "#ede5d5" }
];

// Util: get current week start (Sunday UTC).
window.SANKOFA_LEAGUE_WEEK_START = function () {
  var now = new Date();
  var day = now.getUTCDay();
  var ws = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day, 0, 0, 0));
  return ws.toISOString().slice(0, 10);
};
