// 9 Casas Reais Africanas. Cada uma: cor, emblema, perk leve, mundo de origem.
window.SANKOFA_HOUSES = [
  {
    id: "kemet", name: "Faraós de Kemet", title: "Faraó(ona)", origin: "Egito Antigo",
    worldId: 2, vol: "Vol. II", color: "#d9b95a", color2: "#2a4570",
    emblem: "𓂀", motto: "Ordem da Maat",
    perk: { id: "vol2_bonus", label: "+5 cauris em enigmas do Vol. II", cauris: 5, world: 2 },
    questIds: ["q_kemet_1", "q_kemet_2", "q_kemet_3"],
    locked: false
  },
  {
    id: "kush", name: "Kandakes de Kush", title: "Kandake", origin: "Núbia / Sudão",
    worldId: 2, vol: "Vol. II", color: "#b85a3a", color2: "#4a1a10",
    emblem: "𒀭", motto: "Filhas do arco",
    perk: { id: "vol2_hint", label: "1 dica grátis por enigma do Vol. II", world: 2, freeHint: true },
    questIds: ["q_kush_1", "q_kush_2", "q_kush_3"],
    locked: false
  },
  {
    id: "mali", name: "Mansas do Mali", title: "Mansa", origin: "Mali / Sahel",
    worldId: 3, vol: "Vol. III", color: "#c9a84c", color2: "#4a3018",
    emblem: "♛", motto: "Ouro e palavra",
    perk: { id: "trade_sal_ouro", label: "Trocar 5 sal por 1 ouro 1×/dia" },
    questIds: ["q_mali_1", "q_mali_2", "q_mali_3"],
    locked: false
  },
  {
    id: "aksum", name: "Negus de Aksum", title: "Negus", origin: "Etiópia",
    worldId: 4, vol: "Vol. III-IV", color: "#4a8a50", color2: "#1a3020",
    emblem: "✟", motto: "Cruz e crescente",
    perk: { id: "context_bonus", label: "+2 cauris ao ler contexto", contextBonus: 2 },
    questIds: ["q_aksum_1", "q_aksum_2", "q_aksum_3"],
    locked: false
  },
  {
    id: "asante", name: "Asantehene", title: "Asantehene", origin: "Gana",
    worldId: 5, vol: "Vol. IV-V", color: "#d9be62", color2: "#1a1208",
    emblem: "⊕", motto: "Trono de ouro",
    perk: { id: "first_try_bonus", label: "+5 cauris extra em acertos 1ª tentativa", firstTryBonus: 5 },
    questIds: ["q_asante_1", "q_asante_2", "q_asante_3"],
    locked: false
  },
  {
    id: "benin", name: "Obas do Benin", title: "Oba", origin: "Reino do Benin (Nigéria)",
    worldId: 5, vol: "Vol. V", color: "#8a6030", color2: "#2a1810",
    emblem: "☥", motto: "Bronze e memória",
    perk: { id: "bronze_skin", label: "Skin de bronze nos fragmentos", skin: "bronze" },
    questIds: ["q_benin_1", "q_benin_2", "q_benin_3"],
    locked: false
  },
  {
    id: "kongo", name: "Manikongo", title: "Manikongo", origin: "Kongo",
    worldId: 5, vol: "Vol. V-VI", color: "#b85a3a", color2: "#3a2010",
    emblem: "✣", motto: "Quatro momentos do sol",
    perk: { id: "vol5_copper", label: "+2 cobre Katanga por enigma do Vol. V", world: 5, good: "cobre", amount: 2 },
    questIds: ["q_kongo_1", "q_kongo_2", "q_kongo_3"],
    locked: false
  },
  {
    id: "ruanda", name: "Mwami do Ruanda", title: "Mwami", origin: "Grandes Lagos",
    worldId: 1, vol: "Vol. I-V", color: "#ede5d5", color2: "#3a3025",
    emblem: "◉", motto: "Tambor karinga",
    perk: { id: "vol1_bonus", label: "+5 cauris em enigmas do Vol. I", cauris: 5, world: 1 },
    questIds: ["q_ruanda_1", "q_ruanda_2", "q_ruanda_3"],
    locked: false
  },
  {
    id: "quilombo", name: "Linhagem Quilombola", title: "Líder Quilombola", origin: "Diáspora",
    worldId: 7, vol: "Vol. VI-VII", color: "#1f6b4c", color2: "#0c0a06",
    emblem: "✊🏿", motto: "Sankofa diaspórica",
    perk: { id: "double_streak", label: "Dobra recompensa de streak", doubleStreak: true },
    questIds: ["q_quilombo_1", "q_quilombo_2", "q_quilombo_3"],
    locked: false
  }
];
