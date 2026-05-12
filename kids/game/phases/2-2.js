/*
  Sankofa Kids — Phase 2.2: Pirâmides de Meroé
  HGA Vol. II — Reino de Kush (~800 a.C. – 350 d.C.).
  Spec: kids/docs/world-2-nilo/PHASES-2-1-2-2-2-3.md
  Status: data layer; mechanics consumers (torches, push-blocks, falling-rocks) pending.
*/
(function(){
'use strict';

window.PHASE_2_2 = {
  id: '2.2',
  name: 'Pirâmides de Meroé',
  period: '~800 a.C. – 350 d.C.',
  vol: 'Vol. II',
  prevDone: '2.1',
  respawnMode: 'lastSafe',

  palette: {
    sh: 0x080604,
    dk: 0x1a0e08,
    ea: 0x4a2a1a,
    sk: 0x8a5a3a,
    tr: 0xa84a3a,
    gd: 0xd4a040,
    sa: 0x6a3a2a,
    lt: 0x3a1a10,
    wh: 0xc8a880,
    gn: 0x4a6030,
    lf: 0x5a7a40,
    nt: 0x0a0808,
    dp: 0x050505,
    tc: 0xff8a3a
  },

  audio: {
    bg: 'assets/world2-2/bg-music.mp3',
    sfx: {
      torch:    'assets/world2-2/tocha.mp3',
      block:    'assets/world2-2/bloco-arrastar.mp3',
      rockFall: 'assets/world2-2/pedra-cair.mp3'
    },
    griot: {
      piramide: 'assets/world2-2/griot/piramide.mp3',
      coroa:    'assets/world2-2/griot/coroa.mp3',
      forja2:   'assets/world2-2/griot/forja2.mp3'
    }
  },

  // Three sectors: savanna entry, pyramid interior corridors, treasure chamber.
  plats: [
    [ 0,  0, 10, 1],            // savanna entry safe
    [12,  0,  4, 1],            // approach
    [18,  0,  6, 1],            // corridor 1
    [26,  0,  4, 1],            // corridor 2 (gap for block puzzle)
    [32,  0,  6, 1],            // corridor 3
    [40,  0,  4, 1],            // corridor 4
    [48,  0,  8, 1],            // treasure chamber
    // Floating ledges for vertical access
    [16,  3.0, 2.5, 0.35, 'float'],
    [19,  4.0, 2.0, 0.35, 'float'],
    [22,  4.5, 2.2, 0.35, 'float'],
    [25,  3.8, 2.0, 0.35, 'float'],
    [28,  3.2, 2.5, 0.35, 'float'],
    [34,  2.4, 2.0, 0.35, 'float'],
    [38,  4.0, 2.2, 0.35, 'float']
  ],

  // Torches: PointLight consumer pending. Lifetime 8s, re-light with B.
  // Sector 2 (x: 15..38) carries dense fog when not lit.
  torches: [
    { x: 17, y: 1.5, lifetime: 8000, defaultLit: true },
    { x: 24, y: 1.5, lifetime: 8000, defaultLit: false },
    { x: 31, y: 1.5, lifetime: 8000, defaultLit: false },
    { x: 36, y: 1.5, lifetime: 8000, defaultLit: false }
  ],

  // FogExp2 only inside the pyramid corridor sector.
  fog: {
    type: 'exp2',
    color: 0x000000,
    density: 0.15,
    sectorX: [15, 42]
  },

  // Movable stone blocks. AABB push when player holds direction.
  pushBlocks: [
    { x: 22, y: 0.5, w: 1.2, h: 1.2, minX: 21, maxX: 24 },
    { x: 30, y: 0.5, w: 1.2, h: 1.2, minX: 28, maxX: 33 }
  ],

  cauris: [
    [ 2, 1.2], [ 6, 1.2], [12, 1.2],
    [16, 3.9], [19, 4.7], [22, 5.4], [25, 4.5], [28, 4.0],
    [34, 3.0], [38, 4.7],
    [40, 1.2], [48, 1.2], [52, 1.2], [54, 1.2]
  ],

  mems: [
    { pos: [ 8, 2.5], type: 'piramide',
      label: 'Pirâmide de Meroé',
      griot: 'Mais de 200 pirâmides em Meroé. Mais que no Egipto. Mais pequenas, mas mais numerosas.' },
    { pos: [30, 4.5], type: 'coroa',
      label: 'Coroa Kandake',
      griot: 'A Kandake usava coroa e tinha exército. Poder real, não decoração.' },
    { pos: [50, 3.0], type: 'forja2',
      label: 'Forja industrial Meroé',
      griot: 'O ferro de Meroé chegou ao Mediterrâneo. África exportava, não só importava.' }
  ],

  hazards: [
    // Sombra do Ferro patrols corridors; flees from active torches.
    { type: 'sombra', x: 25, range: [20, 36], speed: 1.3, damage: 1, repelledByLight: true },
    // Falling rocks at 3 spots, 1s shadow warning then drop.
    { type: 'fallingRock', x: 21, y: 4, dropY: 0.5, cycleMs: 5000, warningMs: 1000 },
    { type: 'fallingRock', x: 28, y: 4, dropY: 0.5, cycleMs: 6500, warningMs: 1000 },
    { type: 'fallingRock', x: 37, y: 4, dropY: 0.5, cycleMs: 5500, warningMs: 1000 }
  ],

  npcs: [
    {
      x: 5, scale: [1.7, 2.4], tint: 0x8a3a3a,
      img: 'assets/world2-2/kandake.jpg', avatar: '⚔️', emoji: '⚔️',
      name: 'Kandake Amanirenas', diff: 'fácil', unlock: 0,
      role: 'Sou rainha do Kush. Perdi um olho a guerrear contra os romanos de Petronius.',
      scene: 'Bastão real numa mão, lança noutra, capa de couro. Olho esquerdo coberto por venda.',
      q: 'Que poder muitas Kandakes (rainhas) tinham em Meroé?',
      o: ['Apenas serviam o rei',
          'Reinavam, comandavam exércitos e faziam tratados',
          'Não existiram',
          'Eram apenas decoração'],
      c: 1,
      r: '+1 vida',
      rfn: function(S){ if(S.hp < 3) S.hp++; },
      ok: 'Amanirenas guerreou contra os romanos do prefeito Petronius e negociou tratado em 21 a.C. que cancelou impostos. Strabo descreveu-a como "mulher masculina com um olho destruído".'
    },
    {
      x: 25, scale: [1.7, 2.3], tint: 0xff6a2a,
      img: 'assets/world2-2/ferreiro-meroe.jpg', avatar: '🧑🏿‍🏭', emoji: '🧑🏿‍🏭',
      name: 'Ferreiro Meroé', diff: 'médio', unlock: 1,
      role: 'Faço ferro em fornos de redução direta (bloomery). Toneladas quando Roma ainda usava bronze.',
      scene: 'Fornalha com camadas de oolitic ironstone e carvão. Temperatura interna >700°C.',
      q: 'Que produção africana antiga já existia em Meroé?',
      o: ['Plástico',
          'Ferro em escala — toneladas por ano em fornos bloomery',
          'Computadores',
          'Tecidos sintéticos'],
      c: 1,
      r: 'recebe ferramenta',
      rfn: function(S){ S.axe = true; },
      ok: 'Meroé teve produção de ferro 800 a.C.–600 d.C. — uma das primeiras cidades industriais africanas. Minério oolitic local + fornos bloomery + escala antes de Roma.'
    },
    {
      x: 48, scale: [1.7, 2.3], tint: 0xc9a84c,
      img: 'assets/world2-2/escriba-meroe.jpg', avatar: '🧑🏿‍🎨', emoji: '🧑🏿‍🎨',
      name: 'Escriba Meroítico', diff: 'difícil', unlock: 2,
      role: 'Escrevo numa língua que poucos hoje sabem ler.',
      scene: 'Grava símbolos próprios numa estela — não são hieróglifos egípcios.',
      q: 'O que tem a escrita meroítica que a torna especial?',
      o: ['É igual ao alfabeto romano',
          'É sistema próprio, africano, parcialmente decifrado hoje',
          'Era apenas hieróglifo copiado',
          'Não existia escrita lá'],
      c: 1,
      r: 'abrir passagem',
      rfn: function(S){ S.passageOpen = true; },
      ok: 'Meroítico = alfabeto + silabário próprios. Decifragem ainda em curso. Escrita africana, não derivada da grega ou egípcia.'
    }
  ],

  enigmas: [
    { diff: 'fácil', type: 'observação',
      scene: 'Lucinha vê uma fila de pirâmides menores, com lados mais íngremes que as egípcias.',
      q: 'O que essa observação diz sobre Meroé?',
      o: ['Era cópia exata do Egipto',
          'Tinha tradição própria — pirâmides numerosas, formato distinto',
          'Não era civilização',
          'Foi construída por europeus'],
      c: 1,
      reward: 'cauris',
      e: 'Pirâmides de Meroé são >200, menores, mais íngremes, com câmaras abobadadas. Estilo arquitectónico kushita próprio.' },
    { diff: 'médio', type: 'comparação',
      scene: 'Strabo descreve Amanirenas como "mulher masculina, com um olho destruído". Ela lidera batalha contra Roma.',
      q: 'O que essa descrição nos diz sobre as Kandakes?',
      o: ['Eram apenas decorativas',
          'Tinham papel guerreiro e diplomático real, reconhecido até por inimigos',
          'Não existiram historicamente',
          'Foram inventadas pelos europeus'],
      c: 1,
      reward: 'vida',
      e: 'Kandakes lideravam exércitos. Amanirenas (séc. I a.C.), Amanishakheto, Amanitore — várias rainhas guerreiras documentadas.' },
    { diff: 'difícil', type: 'inferência',
      scene: 'Fornos bloomery em Meroé produziam toneladas de ferro 800 a.C. – 600 d.C. Ferro chegava ao Mediterrâneo.',
      q: 'O que essa indústria sugere sobre a África Antiga?',
      o: ['África só recebia tecnologia europeia',
          'África tinha indústria pesada própria, exportava — não só importava',
          'O ferro foi inventado em Roma',
          'Não havia comércio'],
      c: 1,
      reward: 'ferramenta',
      e: 'Meroé era nó industrial antigo. Ferro africano alimentava comércio mediterrânico — fluxo inverso do que a narrativa colonial sugere.' },
    { diff: 'difícil', type: 'inferência',
      scene: 'A escrita meroítica usa símbolos próprios, parecidos com hieróglifos mas sons diferentes.',
      q: 'O que isso indica sobre a cultura kushita?',
      o: ['Era subordinada ao Egipto',
          'Tinha identidade cultural autónoma — sistema escrita próprio',
          'Não tinha cultura',
          'Não escrevia'],
      c: 1,
      reward: 'passagem',
      e: 'Meroítico = sistema misto alfabeto-silabário africano. Decifragem ainda parcial — testemunho de civilização literária autónoma.' }
  ],

  tutorial: [
    { delay: 1500, ms: 6000, html: 'Entras na <b>pirâmide de Meroé</b> · As <b>tochas</b> 🔥 iluminam o caminho.' },
    { delay: 8000, ms: 6000, html: 'Tochas apagam em 8s · <b>B</b> reacende. Cuidado com a <b>Sombra do Ferro</b>.' },
    { delay: 14500, ms: 6500, html: 'Encontra blocos de pedra · Segura <b>← →</b> para empurrar.' },
    { delay: 21500, ms: 6000, html: 'Sombras no chão avisam <b>1s antes</b> da pedra cair · move-te!' }
  ],

  progress: {
    memsTotal: 3,
    msg1: '1ª memória de Meroé! Faltam <b>{left}</b>',
    msg2: 'Quase lá! Falta <b>1 memória do Kush</b>',
    msg3: '🌟 As pirâmides de Meroé foram lembradas!'
  },

  win: {
    base:    { mems: 3, npcs: 2 },
    perfect: { mems: 3, npcs: 3, allCauris: true, allTorchesLit: true, code: 'KUSH2300' }
  },

  strings: {
    titleCard: 'Pirâmides de Meroé · Acende tochas · Empurra blocos · Foge da Sombra do Ferro',
    winTitle: '🌟 Meroé lembrado!',
    winMsg: 'Lucinha viu o Reino de Kush — pirâmides, rainhas guerreiras, ferro industrial.',
    winMsgPerfect: 'Sem perder uma vida. Kandake do Sankofa.',
    stageWin: '🌟 <b>Pirâmides de Meroé</b> — memórias do Kush recuperadas',
    stageWinPerfect: '🌟 <b>PERFEIÇÃO</b> — Rainha guerreira do Sankofa'
  },

  parallax: [
    { sprite: 'assets/world2-2/piramide-bg.png',
      positions: [[3,-5,1.4],[12,-6,1.2],[26,-5,1.5],[44,-6,1.3]] }
  ]
};

})();
