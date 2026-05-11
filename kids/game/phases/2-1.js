/*
  Sankofa Kids — Phase 2.1: Cheias do Kemet
  HGA Vol. II — Reinos do Nilo, Egipto Antigo (~3000 a.C.).
  Spec: kids/docs/world-2-nilo/PHASES-2-1-2-2-2-3.md
  Status: data layer; mechanics consumers (flood, hieroglyph) pending.
*/
(function(){
'use strict';

window.PHASE_2_1 = {
  id: '2.1',
  name: 'Cheias do Kemet',
  period: '~3000 a.C.',
  vol: 'Vol. II',
  prevDone: '1.3',
  respawnMode: 'lastSafe',

  palette: {
    sh: 0x0e0a05,
    dk: 0x2a1f0a,
    ea: 0xcfa572,
    sk: 0xe8c98a,
    tr: 0xb85a3a,
    gd: 0xffd97a,
    sa: 0xf2dca8,
    lt: 0xe8d5a0,
    wh: 0xf5efe0,
    gn: 0x4a8060,
    lf: 0x6b9f4a,
    nt: 0x1a4080,
    dp: 0x0e3270,
    wt: 0x2a5a9a
  },

  audio: {
    bg: 'assets/world2-1/bg-music.mp3',
    sfx: {
      flood:        'assets/world2-1/cheia.mp3',
      floodWarning: 'assets/world2-1/cheia-warning.mp3',
      stoneDoor:    'assets/world2-1/pedra.mp3'
    },
    griot: {
      papiro:    'assets/world2-1/griot/papiro.mp3',
      cartouche: 'assets/world2-1/griot/cartouche.mp3',
      siro:      'assets/world2-1/griot/siro.mp3'
    }
  },

  // [cx, cy, w, h, type?]  type: 'ground' (default) | 'float' | 'riverPlat'
  // riverPlat = submerge during flood high phase
  plats: [
    [ 2,   0, 12,  1],            // start safe ground
    [12,   0,  3,  1, 'riverPlat'],
    [17,   0,  3,  1, 'riverPlat'],
    [22,   0,  3,  1, 'riverPlat'],
    [27,   0,  3,  1, 'riverPlat'],
    [32,   0,  4,  1],            // mid safe ground
    [38,   0,  3,  1, 'riverPlat'],
    [43,   0,  3,  1, 'riverPlat'],
    [50,   0,  6,  1],            // temple safe ground
    [18,   2.8, 2.5, 0.35, 'float'],
    [25,   4.0, 2.2, 0.35, 'float'],
    [40,   3.2, 2.5, 0.35, 'float']
  ],

  // Flood cycle (mechanic pending consumer).
  // Phases: low(0-3900) -> warning(2400-3900) -> rising(3900-4000)
  //         -> high(4000-7900) -> falling(7900-8000) -> loop.
  waterCycle: {
    cycleMs: 8000,
    warningStartMs: 2400,
    risingStartMs: 3900,
    highStartMs: 4000,
    fallingStartMs: 7900,
    hysteresisMs: 200,
    visualY: 0.5
  },

  // Cartouches for hieroglyph reading (mechanic pending consumer).
  // Reuses #enigma overlay with attempts / hints / nonBlocking.
  hieroglyphs: [
    {
      x: 35, y: 2,
      symbols: ['𓂀', '𓃻', '𓆣'],
      fallbackPng: ['assets/world2-1/hieroglyphs/eye.png',
                    'assets/world2-1/hieroglyphs/lion.png',
                    'assets/world2-1/hieroglyphs/scarab.png'],
      diff: 'fácil',
      type: 'observação',
      scene: 'Uma porta de pedra. Três símbolos esculpidos no cartouche.',
      q: 'Que mensagem este cartouche guarda?',
      o: ['Olho que vê + leão forte + escaravelho renasce = nome real protegido',
          'Apenas decoração sem sentido',
          'Aviso de perigo',
          'Mapa do tesouro'],
      c: 0,
      attempts: 3,
      hints: [
        'O escaravelho representa renascimento — vida que volta.',
        'O olho é símbolo de proteção. O leão = força do rei.'
      ],
      nonBlocking: true,
      reward: 'passagem',
      e: 'Hieróglifos combinam pictograma + fonograma + determinativo. O nome do faraó (cartouche) era considerado sagrado e protegido pelos símbolos.'
    }
  ],

  cauris: [
    [0, 1.2], [4, 1.2], [8, 1.2],
    [13, 1.2], [18, 3.5], [25, 4.7], [32, 1.2],
    [40, 3.9], [44, 1.2], [50, 1.2], [54, 1.2]
  ],

  mems: [
    { pos: [15, 3.0], type: 'papiro',
      label: 'Rolo de papiro',
      griot: 'Papiro é mais antigo que o papel. Era feito de junco — palavra que dura.' },
    { pos: [25, 5.0], type: 'cartouche',
      label: 'Cartouche real',
      griot: 'O nome do faraó dentro do oval era sagrado. Memória escrita = imortal.' },
    { pos: [44, 4.0], type: 'siro',
      label: 'Estrela Sírio',
      griot: 'Sírio reaparece — Nilo enche — ano novo começa. O céu e o rio escreviam o calendário antes do papel.' }
  ],

  npcs: [
    {
      x: 8, scale: [1.7, 2.3], tint: 0xc9a84c,
      avatar: '🧑🏿‍🏫', emoji: '🧑🏿‍🏫',
      name: 'Escriba Imhotep', diff: 'fácil', unlock: 0,
      role: 'Sou escriba do faraó. As minhas mãos pintam o que o tempo apaga.',
      scene: 'Ele segura um pedaço de papiro com três símbolos desenhados.',
      q: 'Para que serviam os hieróglifos para os antigos egípcios?',
      o: ['Apenas decoração de túmulos',
          'Escrita: registar leis, histórias, contas e ciência',
          'Magia para invocar fantasmas',
          'Linguagem secreta dos faraós'],
      c: 1,
      r: '+5 cauris',
      rfn: function(S){ S.cc += 5; },
      ok: 'Escrita completa — pictograma, fonograma e determinativo. Não é arte primitiva.'
    },
    {
      x: 28, scale: [1.7, 2.4], tint: 0xb85a3a,
      avatar: '👑', emoji: '👑',
      name: 'Faraó Núbio Pianí', diff: 'médio', unlock: 1,
      role: 'Reinei em Tebas e em Napata. A minha pele é negra como o solo do Kush.',
      scene: 'Coroa dupla na cabeça (Alto + Baixo Egipto unidos). Atrás dele, exército com elefantes de guerra.',
      q: 'Que reino africano conquistou o Egipto e fundou a 25ª dinastia faraónica?',
      o: ['Roma', 'Reino de Kush (Núbia)', 'Grécia antiga', 'Império Persa'],
      c: 1,
      r: '+1 vida',
      rfn: function(S){ if(S.hp < 3) S.hp++; },
      ok: 'Pianí (c. 747–716 a.C.) veio de Napata com exército de elefantes. Não foi invasor — foi restaurador das tradições faraónicas abandonadas.'
    },
    {
      x: 44, scale: [1.7, 2.3], tint: 0x4a7a50,
      avatar: '🧙🏿‍♀️', emoji: '🧙🏿‍♀️',
      name: 'Sacerdotisa de Ísis', diff: 'difícil', unlock: 2,
      role: 'Guardo a memória da deusa Ísis e a astronomia do Nilo.',
      scene: 'Aponta para o céu noturno onde Sírio brilha.',
      q: 'O que os antigos egípcios viam quando a estrela Sírio reaparecia?',
      o: ['O fim do mundo',
          'O início da cheia do Nilo e do ano novo',
          'Uma estrela igual às outras',
          'Sinal de guerra'],
      c: 1,
      r: 'abrir passagem',
      rfn: function(S){ S.passageOpen = true; },
      ok: 'Astronomia africana antiga. Calendário solar de 365 dias inventado aqui, sincronizado com Sírio e o Nilo.'
    }
  ],

  enigmas: [
    { diff: 'fácil', type: 'observação',
      scene: 'Lucinha vê um rolo de papiro pintado com cenas do dia-a-dia: agricultura, comércio, escrita.',
      q: 'O que esse rolo prova sobre o Egipto Antigo?',
      o: ['Era uma sociedade complexa com escrita, leis e ciência',
          'Era apenas magia e túmulos',
          'Não tinha civilização',
          'Foi inventado pelos europeus'],
      c: 0,
      reward: 'cauris',
      e: 'Papiro permitiu registar leis, contas, histórias, medicina e astronomia. Egipto Antigo = civilização literária e administrativa, parte da história africana.' },
    { diff: 'médio', type: 'comparação',
      scene: 'A 25ª dinastia faraónica veio do Kush (atual Sudão). Os faraós tinham pele negra como a terra do Nilo.',
      q: 'Como devemos pensar a relação entre Egipto e África subsariana?',
      o: ['Egipto era separado, "não africano"',
          'Egipto era parte da história africana; trocas constantes com Núbia, Kush, Punt',
          'Egipto colonizou toda a África',
          'Não havia contacto'],
      c: 1,
      reward: 'vida',
      e: 'Faraós negros, comércio com Punt (Eritreia/Somália), influência mútua com Kush. Egipto é capítulo africano, não excepção.' },
    { diff: 'médio', type: 'comparação',
      scene: 'A cheia anual do Nilo deixava lama escura que enriquecia a terra. Por isso o Egipto chamava-se "Kemet" — Terra Negra.',
      q: 'O nome "Kemet" referia-se a quê?',
      o: ['À cor escura da pele do povo',
          'À cor escura do solo fértil pós-cheia',
          'À escuridão da noite',
          'A nada em particular'],
      c: 1,
      reward: 'cauris',
      e: 'Kemet = "Terra Negra" pela cor do limo fértil. Os egípcios distinguiam Kemet (terra negra cultivada) de Deshret (terra vermelha do deserto).' },
    { diff: 'difícil', type: 'inferência',
      scene: 'Sírio reaparecia no céu. Dias depois, o Nilo enchia. Os sacerdotes previam a cheia observando estrelas.',
      q: 'O que essa relação céu-rio permite concluir?',
      o: ['Os egípcios faziam astronomia aplicada à agricultura',
          'Era apenas coincidência',
          'Não havia observação científica',
          'Os romanos inventaram'],
      c: 0,
      reward: 'passagem',
      e: 'Astronomia africana antiga: observação sistemática do céu, calendário solar 365 dias, previsão de cheias. Ciência aplicada — não magia.' }
  ],

  tutorial: [
    { delay: 1500, ms: 5500, html: 'Bem-vinda ao <b>Kemet</b> · O Nilo enche em ciclo. Cuidado com as plataformas que <b>submergem</b>.' },
    { delay: 7500, ms: 6000, html: 'Olha para a <b>aura azul</b> · 1,5s antes da água subir, as plataformas avisam.' },
    { delay: 14000, ms: 6500, html: 'Encontra o <b>Escriba Imhotep</b> 🧑🏿‍🏫 — ele ensina hieróglifos.' },
    { delay: 21000, ms: 7000, html: 'Cartouches têm <b>3 tentativas</b> sem custo de vida. Falha = recebe dica.' }
  ],

  progress: {
    memsTotal: 3,
    msg1: '1ª memória do Kemet! Faltam <b>{left}</b>',
    msg2: 'Quase lá! Falta <b>1 memória do Nilo</b>',
    msg3: '🌟 As memórias do Egipto Antigo foram recuperadas!'
  },

  win: {
    base:    { mems: 3, npcs: 2 },
    perfect: { mems: 3, npcs: 3, allCauris: true, noDamage: true, code: 'KEMET3000' }
  },

  strings: {
    titleCard: 'Atravessa o Nilo · Cuidado com as cheias · Lê hieróglifos',
    winTitle: '🌟 Kemet lembrado!',
    winMsg: 'Lucinha viu o Egipto Antigo como parte de África — não exceção.',
    winMsgPerfect: 'Sem perder uma vida. Escriba e astrónoma do Sankofa.',
    stageWin: '🌟 <b>Cheias do Kemet</b> — memórias do Nilo recuperadas',
    stageWinPerfect: '🌟 <b>PERFEIÇÃO</b> — Guardiã do calendário do Nilo'
  },

  // Decor parallax — pyramid silhouettes
  parallax: [
    { sprite: 'assets/world2-1/piramide-bg.png',
      positions: [[5,-6,2.0],[18,-7,1.6],[36,-6,1.8],[50,-7,1.4]] }
  ]
};

})();
