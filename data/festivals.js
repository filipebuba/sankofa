// Festivais sazonais — bônus quando data atual cruza intervalo.
// Tudo offline-checkável: comparar new Date() com mês/dia.
window.SANKOFA_FESTIVALS = [
  {
    id: "dia_africa", name: "Dia da África", month: 5, day: 25, durationDays: 1,
    bonusCauris: 2.0, lore: "União Africana fundada em 25/05/1963 (OUA).",
    icon: "☀"
  },
  {
    id: "consciencia_negra", name: "Consciência Negra", month: 11, day: 20, durationDays: 1,
    bonusCauris: 2.0, lore: "Morte de Zumbi dos Palmares, 20/11/1695.",
    icon: "✊🏿"
  },
  {
    id: "lua_nova", name: "Lua Nova de Tombuctu", month: null, day: null, durationDays: 1,
    bonusCauris: 1.5, lore: "Mercado descontado. Caravaneiros aproveitam.",
    icon: "◐", isLunar: true
  },
  {
    id: "festa_sankofa", name: "Festa de Sankofa", month: 7, day: 10, durationDays: 3,
    bonusCauris: 1.75, lore: "Volte e busque. Festa do projeto.",
    icon: "𓅓"
  }
];
