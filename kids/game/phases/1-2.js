/*
  Sankofa Kids — Phase 1.2: Saara Verde
  Spec: kids/docs/world-1-rift/PHASES-1-2-1-3.md
  Status: scaffold — data layer only, game.js consumer pending.
*/
(function(){
'use strict';

window.PHASE_1_2 = {
  id: '1.2',
  name: 'Saara Verde',
  period: '11k–5k anos atrás',
  vol: 'Vol. I',
  prevDone: '1.1',

  palette: {
    sh: 0x0c0a06,
    dk: 0x2a1f14,
    ea: 0xc4a26a,
    sk: 0xb89a6a,
    tr: 0x8a6a3a,
    gd: 0xc9a84c,
    sa: 0xe8d5a0,
    lt: 0x7eb4d4,
    wh: 0xf5efe0,
    gn: 0x4a6b3a,
    lf: 0x6b8f3a,
    nt: 0x2a5570,
    dp: 0x3a6a7a,
    wt: 0x3a6a7a,
    pl: 0x4a6b3a
  },

  audio: {
    bg: 'assets/world1-2/bg-music.mp3',
    sfx: {
      blow: 'assets/world1-2/soprar.mp3',
      water: 'assets/world1-2/agua-passo.mp3'
    },
    griot: {
      bovino: 'assets/world1-2/griot/bovino.mp3',
      mao:    'assets/world1-2/griot/mao.mp3',
      caca:   'assets/world1-2/griot/caca.mp3'
    }
  },

  // [cx, cy, w, h, type?] — type: 'ground' (default) | 'float'
  plats: [
    [ 2,   0, 8,   1],
    [12,   0, 6,   1],
    [21,   0, 5,   1],
    [29,   0, 6,   1],
    [38,   0, 7,   1],
    [ 8,   2.4, 2.5, 0.35, 'float'],
    [16,   3.2, 2.5, 0.35, 'float'],
    [20,   4.5, 2.2, 0.35, 'float'],
    [25,   5.0, 2.2, 0.35, 'float'],
    [33,   3.8, 2.5, 0.35, 'float']
  ],

  // Water gaps spawn between ground segments — derived from plats.
  // Cair em x dentro de gap = hazard (-1 vida, respawn).
  waterGaps: [
    [6,   9],
    [15, 18],
    [23.5, 26.5],
    [32, 34.5]
  ],

  // [x, y]
  cauris: [
    [0, 1.2], [4, 1.2], [8, 3.0], [12, 1.2],
    [16, 3.8], [20, 5.1], [25, 5.6], [29, 1.2],
    [33, 4.4], [36, 1.2], [40, 1.2], [44, 1.2]
  ],

  // Paredes com areia — soprar revela pintura. [x, y, type]
  // Posições alinhadas com mems do mesmo type para fade sincronizado.
  sandWalls: [
    [13, 3.0, 'bovino'],
    [24, 5.0, 'mao'],
    [38, 6.5, 'caca']
  ],

  hazards: [
    { type: 'hippo',     x: 22, range: [22, 22], cycle: 4000, blocking: true },
    { type: 'crocodile', x: 28, range: [26, 31], speed: 1.5,  damage: 1 }
  ],

  // [x, y, type, label, griot]
  mems: [
    { pos: [13,  3.0], type: 'bovino', label: 'Boi do Saara',          griot: 'Vacas no deserto — clima muda, memória fica.' },
    { pos: [24,  5.0], type: 'mao',    label: 'Mão soprada com ocre',  griot: 'Sopro de ocre — assinatura ancestral.' },
    { pos: [38,  6.5], type: 'caca',   label: 'Cena de caça Tassili',  griot: 'Não eram selvagens — eram peritos do bioma.' }
  ],

  npcs: [
    {
      x: 10, scale: [1.7, 2.2], tint: 0x2a4570,
      img: 'assets/world1-2/pastor.jpg', avatar: '🧔🏾',
      name: 'Pastor Saariano', diff: 'fácil', unlock: 0,
      role: 'Levei vacas onde hoje é só areia.',
      scene: 'Ele segura uma corda de pastoreio e aponta para uma pintura de bois.',
      q: 'Se havia pastores e bois, como era esse Saara antigo?',
      o: ['Só dunas secas', 'Lagos, gado e pinturas', 'Uma cidade de arranha-céus'], c: 1,
      r: '+5 cauris', rfn: function(S){ S.cc += 5; },
      ok: 'Verde! Pastores criavam gado antes do clima secar.'
    },
    {
      x: 30, scale: [1.7, 2.3], tint: 0xb85a3a,
      img: 'assets/world1-2/pintora.png', avatar: '👩🏿‍🎨',
      name: 'Pintora Tassili', diff: 'médio', unlock: 1,
      role: 'Mãos no ocre, histórias na pedra.',
      scene: 'Ela sopra ocre sobre a mão e deixa uma marca na rocha.',
      q: 'O que essa mão pintada está fazendo?',
      o: ['Apagando a memória', 'Assinando uma presença e guardando uma história', 'Mostrando que já existiam computadores', 'Chamando navios europeus'], c: 1,
      r: '+1 vida', rfn: function(S){ if (S.hp < 3) S.hp++; },
      ok: 'Tassili n\'Ajjer — UNESCO desde 1982.'
    }
  ],

  enigmas: [
    { diff: 'fácil', type: 'observação',
      scene: 'Lucinha limpa areia de uma parede. Aparecem bois, gente e água.',
      q: 'Que pista essa pintura dá sobre o Saara Verde?',
      o: ['Havia vida, água e pastoreio', 'O Saara sempre foi vazio', 'As pessoas só desenhavam monstros', 'A água veio de máquinas modernas'], c: 0,
      reward: 'cauris',
      e: 'No período úmido africano, partes do Saara tiveram lagos, animais e comunidades humanas.' },
    { diff: 'médio', type: 'comparação',
      scene: 'Hoje há deserto. Na memória há hipopótamos e nadadores.',
      q: 'Qual conclusão ajuda Lucinha a atravessar essa passagem?',
      o: ['O clima pode mudar profundamente ao longo do tempo', 'Hipopótamos vivem em areia seca', 'Nada muda na natureza', 'As pinturas são mapas de tesouro europeu'], c: 0,
      e: 'As pinturas de Tassili ajudam a lembrar que o Saara nem sempre foi árido como hoje.' },
    { diff: 'médio', type: 'comparação',
      scene: 'O Pastor Saariano perde água a cada passo. A manada precisa escolher novo caminho.',
      q: 'Quando o Saara começou a secar, o que muitos grupos humanos precisaram fazer?',
      o: ['Parar de falar', 'Migrar para regiões com água e pasto', 'Construir computadores', 'Viver só dentro de cavernas'], c: 1,
      reward: 'passagem',
      e: 'A aridificação empurrou populações para áreas com rios, savanas e melhores condições de vida.' },
    { diff: 'difícil', type: 'inferência',
      scene: 'Três pistas brilham juntas: boi, mão pintada e cena de caça.',
      q: 'O que essas pistas dizem sobre as pessoas de Tassili?',
      o: ['Eram comunidades com arte, técnica e conhecimento do ambiente', 'Não sabiam observar animais', 'Viviam sem cultura', 'Eram viajantes modernos fantasiados'], c: 0,
      e: 'As imagens mostram sociedades complexas, capazes de observar, narrar e adaptar-se ao ambiente.' }
  ],

  tutorial: [
    { delay: 1500, ms: 5000, html: 'Tens <b>3 vidas ❤❤❤</b> · Não caias na água!' },
    { delay: 7000, ms: 6000, html: 'Usa <b>B</b> para soprar areia das paredes — revela pinturas Tassili.' },
    { delay: 13500, ms: 6000, html: 'Encontra o <b>Pastor Saariano</b> 🧔🏾 e a <b>Pintora</b> 👩🏿‍🎨 à direita.' }
  ],

  win: {
    base:    { mems: 3, npcs: 1 },
    perfect: { mems: 3, npcs: 2, allCauris: true, noDamage: true, code: 'SAARA8000' }
  },

  strings: {
    titleCard: 'Sopra a areia (B) e descobre as pinturas Tassili escondidas',
    winTitle: '🌟 Saara Verde lembrado!',
    winMsg: 'Lucinha trouxe de volta as memórias do Saara antes do deserto.',
    winMsgPerfect: 'Sem perder uma vida. As águas antigas voltaram a falar contigo.',
    stageWin: '🌟 <b>Saara Verde</b> — pinturas reveladas',
    stageWinPerfect: '🌟 <b>PERFEIÇÃO</b> — Guardiã das águas antigas'
  },

  progress: {
    memsTotal: 3,
    msg1: '1ª memória do Saara Verde! Faltam <b>{left}</b>',
    msg2: 'Quase lá! Falta <b>1 pintura-memória</b>',
    msg3: '🌟 As águas antigas do Saara foram lembradas!'
  },

  // Decor parallax — [x, y, scale, sprite]
  parallax: [
    { sprite: 'assets/world1-2/palmeira.png', positions: [[-2,-4,1.0],[6,-5,1.2],[14,-4,.9],[22,-5,1.1],[30,-4,1.0],[40,-5,1.2]] }
  ]
};

})();
