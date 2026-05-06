// Súditos / NPCs. Cada um aparece após condição. Recrutado via audiência diária.
window.SANKOFA_SUDITOS = [
  {
    id: "lucy", name: "Velha Lucy", role: "Anciã do Vale do Rift", emblem: "◦",
    unlockSolved: 1,
    line: "Antes do nome, antes da palavra, já caminhávamos. Eu vi.",
    gift: { cauris: 1, daily: true }, vol: "I"
  },
  {
    id: "escriba_meh", name: "Escriba de Mêh", role: "Guardião dos hieróglifos", emblem: "◍",
    unlockWorld: 1,
    line: "O papiro guarda o que o vento esquece.",
    gift: { cauris: 2, daily: true }, vol: "II"
  },
  {
    id: "mansa_musa", name: "Mansa Musa", role: "Imperador do Mali", emblem: "♛",
    unlockHouse: "mali",
    line: "Levei tanto ouro a Meca que o Cairo ainda chora a inflação.",
    gift: { good: "ouro", amount: 1, daily: true }, vol: "III"
  },
  {
    id: "mercadora_suaili", name: "Mercadora Suaíli", role: "Senhora da Costa", emblem: "◈",
    unlockWorld: 4,
    line: "Cravo e marfim atravessam a monção. Tudo tem preço justo.",
    gift: { good: "marfim", amount: 1, daily: false, weekly: true }, vol: "IV"
  },
  {
    id: "amanirenas", name: "Amanirenas", role: "Kandake guerreira", emblem: "𓋹",
    unlockHouse: "kush",
    line: "Roma quebrou estátuas. Nós quebramos legiões.",
    gift: { cauris: 5, daily: true }, vol: "II"
  },
  {
    id: "nzinga", name: "Rainha Nzinga", role: "Estratégia Ndongo-Matamba", emblem: "♚",
    unlockSolved: 15,
    line: "Senta no soldado. A rainha não senta no chão.",
    gift: { cauris: 3, daily: true, perkId: "skip_blocker" }, vol: "VI"
  },
  {
    id: "dandara", name: "Tia Dandara", role: "Capitã de Palmares", emblem: "✊🏿",
    unlockHouse: "quilombo",
    line: "Quem conta a história também é a história.",
    gift: { cauris: 5, daily: true, lore: "palmares" }, vol: "VI"
  },
  {
    id: "sundiata", name: "Sundiata Keita", role: "Leão do Mali", emblem: "🦁",
    unlockSolved: 10,
    line: "Caí, mas levantei. A terra do Mali me reconheceu.",
    gift: { cauris: 2, daily: true }, vol: "III"
  },
  {
    id: "biko", name: "Steve Biko", role: "Consciência Negra", emblem: "✦",
    unlockWorld: 8,
    line: "Mente livre constrói corpo livre.",
    gift: { cauris: 3, daily: true, lore: "anti_apartheid" }, vol: "VIII"
  }
];
