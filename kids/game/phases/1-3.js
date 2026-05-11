/*
  Sankofa Kids — Phase 1.3: Forja Bantu
  Spec: kids/docs/world-1-rift/PHASES-1-2-1-3.md
  Status: scaffold — data layer only, game.js consumer pending.
*/
(function(){
'use strict';

window.PHASE_1_3 = {
  id: '1.3',
  name: 'Forja Bantu',
  period: '~3000–2000 anos atrás',
  vol: 'Vol. I',
  prevDone: '1.2',

  palette: {
    sh: 0x0a0808,
    dk: 0x1a2218,
    ea: 0x3d2818,
    sk: 0x5a4030,
    tr: 0x8a4a2a,
    gd: 0xc9a84c,
    sa: 0x4a3520,
    lt: 0x2b3a2a,
    wh: 0xe8d5b7,
    gn: 0x5a8a3a,
    lf: 0x6b9f4a,
    nt: 0x1a2a3a,
    dp: 0x0f1a14,
    fo: 0x5a8a3a,
    fe: 0x8a8a8a,
    br: 0xff6a2a
  },

  audio: {
    bg: 'assets/world1-3/bg-music.mp3',
    sfx: {
      hammer: 'assets/world1-3/martelo.mp3',
      vine:   'assets/world1-3/cipo-corte.mp3',
      canoe:  'assets/world1-3/canoa-agua.mp3'
    },
    griot: {
      forno:  'assets/world1-3/griot/forno.mp3',
      enxada: 'assets/world1-3/griot/enxada.mp3',
      canoa:  'assets/world1-3/griot/canoa.mp3'
    }
  },

  plats: [
    [ 2,   0, 12,  1],
    [15,   0,  4,  1],
    [22,   0,  4,  1],
    [29,   0,  4,  1],
    [16,   3.5, 2.5, 0.35, 'float'],
    [19,   5.0, 2.0, 0.35, 'float'],
    [23,   6.5, 2.0, 0.35, 'float'],
    [27,   5.5, 2.2, 0.35, 'float'],
    [50,   0,  4,  1]
  ],

  // Setor 3: rio. Canoa-plataforma móvel.
  movingPlats: [
    { id: 'canoe', cx: 40, cy: 0.6, w: 2.5, h: 0.4, axis: 'x', range: [35, 45], speed: 1.2 }
  ],

  // Quedas dentro do rio (sem canoa) = hazard.
  waterGaps: [
    [33, 48]
  ],

  cauris: [
    [0, 1.2], [3, 1.2], [6, 1.2], [10, 1.2],
    [16, 4.7], [19, 6.2], [23, 7.7], [27, 6.7],
    [22, 1.2], [29, 1.2],
    [40, 1.5], [44, 1.5],
    [50, 1.2], [52, 1.2], [54, 1.2]
  ],

  // Cipós bloqueiam trilho. Cortar com machado (B reaproveita).
  vines: [
    [18, 3, 'cipo'],
    [24, 5, 'cipo']
  ],

  // Bigorna: mini-QTE pra forjar machado. Aproxima + E.
  interactables: [
    { type: 'anvil', x: 5, y: 0.6, gives: 'axe' }
  ],

  hazards: [
    { type: 'snake', x: 20, range: [20, 20], cycleAxis: 'y', cycle: [1, 3], speed: 1.0, damage: 1 }
  ],

  mems: [
    { pos: [ 8, 2.0], type: 'forno',  label: 'Forno de fundição',  griot: 'Argila + foles — temperatura derrete pedra-ferro.' },
    { pos: [26, 6.0], type: 'enxada', label: 'Enxada de ferro',    griot: 'Ferro lavra terra mais funda — colheita maior, aldeia cresce.' },
    { pos: [45, 2.5], type: 'canoa',  label: 'Canoa escavada',     griot: 'Um tronco, um machado, um rio — três continentes ligados.' }
  ],

  // Memória bónus: derrubar árvore específica
  bonusMems: [
    { pos: [30, 2.0], type: 'bantu-arvore', label: 'Árvore Bantu',
      griot: 'Cada palavra Bantu é um galho da mesma árvore.',
      requires: 'axe', cauriBonus: 5 }
  ],

  npcs: [
    {
      x: 3, scale: [1.7, 2.3], tint: 0xff6a2a,
      img: 'assets/world1-3/ferreiro.jpg', avatar: '🧑🏿‍🏭',
      name: 'Ferreiro Nok', diff: 'fácil', unlock: 0,
      role: 'Bate no ferro enquanto quente — primeira tecnologia que mudou África.',
      scene: 'Ele mostra terracota, carvão e uma lâmina recém-batida.',
      q: 'Que cultura africana ficou ligada cedo ao ferro nessa região?',
      o: ['Vikings', 'Cultura Nok', 'Romanos'], c: 1,
      r: 'machado de ferro', rfn: function(S){ S.anvilUnlocked = true; S.axe = true; },
      ok: 'Nok — séc. V a.C., terracotas + ferro.'
    },
    {
      x: 22, scale: [1.7, 2.3], tint: 0x5a8a3a,
      img: 'assets/world1-3/linguista.jpg', avatar: '👨🏿‍🏫',
      name: 'Linguista Bantu', diff: 'médio', unlock: 1,
      role: 'Uma língua, mil filhas — sigo as palavras pela floresta.',
      scene: 'Ele repete palavras parecidas em aldeias distantes, como ecos da mesma árvore.',
      q: 'O que essa semelhança de palavras revela?',
      o: ['Que todas as aldeias eram iguais', 'Que não houve migração', 'Uma grande família linguística Bantu', 'Que ninguém viajou'], c: 2,
      r: '+10 cauris', rfn: function(S){ S.cc += 10; },
      ok: 'Suaíli, Quicongo, Zulu, Xhosa — todas filhas Bantu.'
    },
    {
      x: 42, scale: [1.7, 2.3], tint: 0x3a6a7a,
      img: 'assets/world1-3/pescador.jpg', avatar: '🧑🏿‍🌾',
      name: 'Pescador Canoeiro', diff: 'difícil', unlock: 2,
      role: 'Machado fez canoa, canoa levou-nos a sul.',
      scene: 'Ele toca a canoa, a enxada e o machado: três ferramentas para uma longa viagem.',
      q: 'Como muitos povos Bantu se espalharam pelo sub-Sahara?',
      o: ['Não migraram', 'Migração com ferro, agricultura e adaptação aos rios/florestas', 'Apenas por navios europeus', 'Usando cavalos no deserto'], c: 1,
      r: '+2 vidas (cap 5)', rfn: function(S){ S.hp = Math.min(5, S.hp + 2); S.hpCap = 5; },
      ok: '~3000 anos atrás, dos Camarões para sul/leste.'
    }
  ],

  enigmas: [
    { diff: 'médio', type: 'observação',
      scene: 'Lucinha vê uma fornalha: argila, carvão, ar soprado e pedra-ferro brilhando.',
      q: 'O que a forja transforma?',
      o: ['Pedra-ferro em ferramenta de metal', 'Água em areia', 'Pintura em animal vivo', 'Som em pedra'], c: 0,
      reward: 'ferramenta',
      e: 'A metalurgia transforma minério em ferro útil para ferramentas, armas agrícolas e objetos.' },
    { diff: 'médio', type: 'comparação',
      scene: 'Com uma pedra lascada, Lucinha corta pouco. Com ferro, abre cipó e madeira.',
      q: 'Por que o ferro muda o jogo?',
      o: ['Porque é apenas decorativo', 'Porque permite ferramentas mais fortes e trabalho mais profundo', 'Porque impede agricultura', 'Porque apaga línguas'], c: 1,
      e: 'Ferramentas de ferro ajudaram a abrir campos, trabalhar madeira e intensificar agricultura.' },
    { diff: 'difícil', type: 'inferência',
      scene: 'Aldeias distantes compartilham palavras, plantios e técnicas de ferro.',
      q: 'Qual hipótese explica melhor essas pistas juntas?',
      o: ['Migração e contatos entre povos Bantu ao longo de gerações', 'Todas as aldeias nasceram no mesmo dia', 'As palavras vieram de computadores', 'Não houve troca cultural'], c: 0,
      e: 'A expansão Bantu combinou movimentos populacionais, línguas aparentadas, agricultura e tecnologias.' },
    { diff: 'difícil', type: 'inferência',
      scene: 'Uma enxada abre terra, o machado faz canoa, a canoa atravessa rio.',
      q: 'Qual consequência histórica essas ferramentas tornam possível?',
      o: ['Ficar preso na aldeia original', 'Apagar memórias orais', 'Viajar, cultivar e formar novas comunidades', 'Transformar deserto em gelo'], c: 2,
      reward: 'passagem',
      e: 'Tecnologia não é só objeto: ela muda caminhos, trabalho, alimentação e formas de viver.' }
  ],

  tutorial: [
    { delay: 1500, ms: 5500, html: 'Floresta densa. Encontra a <b>bigorna</b> 🔨 e <b>forja um machado</b>.' },
    { delay: 7500, ms: 6000, html: 'Aproxima da bigorna + <b>E</b> · Mini-jogo: 3 toques no ritmo.' },
    { delay: 14000, ms: 6000, html: 'Com machado: <b>B</b> corta cipós e derruba árvores.' },
    { delay: 21000, ms: 6500, html: 'Rio à direita — apanha a <b>canoa</b> 🛶 quando passar perto.' }
  ],

  win: {
    base:    { mems: 3, npcs: 2 },
    perfect: { mems: 3, npcs: 3, allCauris: true, axeForged: true, code: 'BANTU3000' }
  },

  strings: {
    titleCard: 'Forja o machado (E na bigorna) · depois B para cortar cipós e árvores',
    winTitle: '🌟 Forja Bantu!',
    winMsg: 'Lucinha forjou o ferro, abriu caminho e seguiu o rio com os Bantu.',
    winMsgPerfect: 'Sem perder uma vida. Ferreira, caminhante e guardiã da palavra.',
    stageWin: '🌟 <b>Forja Bantu</b> — ferro, língua e caminho conectados',
    stageWinPerfect: '🌟 <b>PERFEIÇÃO</b> — Mestra ferreira do Sankofa'
  },

  progress: {
    memsTotal: 3,
    msg1: '1ª memória da Forja Bantu! Faltam <b>{left}</b>',
    msg2: 'Quase lá! Falta <b>1 memória de ferro e viagem</b>',
    msg3: '🌟 Ferro, língua e caminho foram conectados!'
  },

  parallax: [
    { sprite: 'assets/world1-3/arvore-floresta.png', positions: [[-2,-4,1.4],[5,-5,1.2],[12,-4,1.5],[18,-5,1.3],[26,-4,1.4],[34,-5,1.2],[44,-4,1.3]] }
  ]
};

})();
