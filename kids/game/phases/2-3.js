/*
  Sankofa Kids — Phase 2.3: Estelas de Aksum
  HGA Vol. II — Reino de Aksum, Etiópia/Eritreia (séc. I – VII d.C.).
  Spec: kids/docs/world-2-nilo/PHASES-2-1-2-2-2-3.md
  Status: data layer; mechanics consumers (vertical climb anchors, wind pattern,
  aksum coins HUD) pending.
*/
(function(){
'use strict';

window.PHASE_2_3 = {
  id: '2.3',
  name: 'Estelas de Aksum',
  period: 'séc. I – VII d.C.',
  vol: 'Vol. II',
  prevDone: '2.2',
  respawnMode: 'lastSafe',

  palette: {
    sh: 0x080a0c,
    dk: 0x1a2a30,
    ea: 0x5a6a4a,
    sk: 0x8a9a7a,
    tr: 0xb85a3a,
    gd: 0xd4a040,
    sa: 0x9a8a6a,
    lt: 0x3a4a5a,
    wh: 0xe0d8c0,
    gn: 0x3a5a4a,
    lf: 0x4a6a5a,
    nt: 0x2a3a4a,
    dp: 0x0a1a2a,
    st: 0x4a4030
  },

  audio: {
    bg: 'assets/world2-3/bg-music.mp3',
    sfx: {
      wind:       'assets/world2-3/vento.mp3',
      windGust:   'assets/world2-3/vento-rajada.mp3',
      coin:       'assets/world2-3/moeda-aksum.mp3',
      scroll:     'assets/world2-3/pergaminho.mp3'
    },
    griot: {
      estela:      'assets/world2-3/griot/estela.mp3',
      moeda:       'assets/world2-3/griot/moeda.mp3',
      manuscrito:  'assets/world2-3/griot/manuscrito.mp3'
    }
  },

  // Three sectors: Adulis port, vertical stele climb, mountain monastery.
  plats: [
    // Sector 1: port Adulis
    [ 0,  0, 12, 1],
    [14,  0,  4, 1],
    // Sector 2: zigzag vertical climb (y: 0 -> 16)
    [18,  0,  4, 1],
    [22,  2.5, 2.2, 0.35, 'float'],
    [19,  4.5, 2.2, 0.35, 'float'],
    [23,  6.0, 2.2, 0.35, 'float'],
    [20,  8.0, 2.2, 0.35, 'float'],
    [24,  9.8, 2.2, 0.35, 'float'],
    [21, 11.5, 2.2, 0.35, 'float'],
    [25, 13.0, 2.2, 0.35, 'float'],
    [22, 14.5, 2.2, 0.35, 'float'],
    // Sector 3: mountain monastery top
    [38,  0,  6, 1],
    [48,  0,  8, 1],
    [56,  0,  6, 1]
  ],

  // Anchor checkpoints on the vertical stele climb. Reaching one activates;
  // falling resets to highest activated. -1 cauri penalty (softer than -1 life).
  climbAnchors: [
    { y: 4,  activated: false },
    { y: 8,  activated: false },
    { y: 12, activated: false }
  ],

  // Variable wind pattern on the stele (y > 6). Pattern repeats:
  // 2s soft -> 1s pre-gust indicator -> 1s strong gust -> 2s pause -> loop.
  wind: {
    enabled: true,
    activeAboveY: 6,
    cycleMs: 6000,
    pattern: [
      { startMs: 0,    durationMs: 2000, force: 0.3 },  // soft
      { startMs: 2000, durationMs: 1000, force: 0.3, indicator: true },  // pre-gust (visual warning)
      { startMs: 3000, durationMs: 1000, force: 1.6 },  // strong gust
      { startMs: 4000, durationMs: 2000, force: 0 }     // pause
    ],
    holdToResist: 'down'
  },

  // Aksum coins — 3 special collectibles with their own HUD counter.
  // S.aksumCoins (not S.cc); HUD slot .ico-a copper/gold; coin sprite is a
  // flat disc with Coptic cross, not a torus shell.
  aksumCoins: [
    { x: 20,  y: 5.0, label: 'Moeda Ezana 1' },
    { x: 25,  y: 10.0, label: 'Moeda Ezana 2' },
    { x: 22, y: 14.0, label: 'Moeda Ezana 3' }
  ],
  aksumCoinReward: 'ferramenta',

  cauris: [
    [ 1, 1.2], [ 4, 1.2], [ 8, 1.2], [14, 1.2],
    [18, 1.2], [22, 3.7], [23, 7.2], [24, 11.0],
    [38, 1.2], [42, 1.2], [48, 1.2], [50, 1.2], [56, 1.2]
  ],

  mems: [
    { pos: [22, 12.5], type: 'estela',
      label: 'Estela de Aksum',
      griot: 'Estelas de Aksum são monolitos. Maior tem 33 metros — vertical, sem maquinaria moderna.' },
    { pos: [42, 3.5], type: 'moeda',
      label: 'Moeda real',
      griot: 'Aksum cunhou moeda. Economia monetária africana, séc. III. Antes da Europa do Norte.' },
    { pos: [58, 3.0], type: 'manuscrito',
      label: 'Manuscrito Ge\'ez',
      griot: 'Manuscritos Ge\'ez sobrevivem 1700 anos. Memória resistente, escrita viva.' }
  ],

  hazards: [
    // Macaco-gelada patrols Adulis port (sector 1) — not generic monkey.
    { type: 'gelada', x: 6, range: [4, 10], speed: 1.2, damage: 1 }
  ],

  npcs: [
    {
      x: 8, scale: [1.7, 2.3], tint: 0x2a5a9a,
      img: 'assets/world2-3/mercador.jpg', avatar: '🧑🏿‍💼', emoji: '🧑🏿‍💼',
      name: 'Mercador Adulis', diff: 'fácil', unlock: 0,
      role: 'Comercio marfim, ouro e incenso. Navego do Mar Vermelho à Índia.',
      scene: 'Cesto de especiarias + balança de prata. Navio de vela latina ancorado em Adulis.',
      q: 'O que Aksum exportava para Roma que Roma não conseguia obter noutro lugar?',
      o: ['Trigo europeu',
          'Marfim, ouro e incenso africanos',
          'Vinho italiano',
          'Seda chinesa'],
      c: 1,
      r: '+10 cauris',
      rfn: function(S){ S.cc += 10; },
      ok: 'Aksum controlava elefantes do sul (marfim), minas de ouro de Tigray, e era rota do incenso. Comércio global séc. I–VII, Roma–Arábia–Índia.'
    },
    {
      x: 42, scale: [1.7, 2.4], tint: 0xc9a84c,
      img: 'assets/world2-3/ezana.jpg', avatar: '👑', emoji: '👑',
      name: 'Rei Ezana', diff: 'médio', unlock: 1,
      role: 'Sou Ezana. Convertemos Aksum ao cristianismo entre 330 e 340 d.C.',
      scene: 'Coroa em metal + cruz copta. Moeda na palma — primeiras com cruz, antes símbolos pagãos.',
      q: 'O que torna a conversão de Aksum especial entre os reinos do séc. IV?',
      o: ['Foi o último reino a converter-se',
          'Foi contemporânea de Constantino e anterior à maior parte da Europa do Norte',
          'Foi a primeira do mundo',
          'Não houve conversão'],
      c: 1,
      r: '+1 vida',
      rfn: function(S){ if(S.hp < 3) S.hp++; },
      ok: 'Constantino legalizou cristianismo em 313 d.C.; Aksum adoptou ~330-340 d.C. — contemporâneo. Mas Britânia, Germânia, Escandinávia só se cristianizaram séculos depois.'
    },
    {
      x: 56, scale: [1.7, 2.3], tint: 0x6a4a30,
      img: 'assets/world2-3/monge.jpg', avatar: '🧙🏿‍♂️', emoji: '🧙🏿‍♂️',
      name: 'Monge Ge\'ez', diff: 'difícil', unlock: 2,
      role: 'Escrevo em Ge\'ez. Cada símbolo é uma sílaba: consoante + vogal.',
      scene: 'Manuscrito de pele aberto, caneta de junco. Símbolos em colunas, cada consoante com 7 formas modificadas.',
      q: 'O que torna o Ge\'ez diferente do alfabeto romano?',
      o: ['É um silabário (abugida): cada símbolo = consoante + vogal',
          'É extinto',
          'É igual ao árabe',
          'Não é africano'],
      c: 0,
      r: 'abrir passagem',
      rfn: function(S){ S.passageOpen = true; },
      ok: 'Ge\'ez é abugida (silabário): cada consoante tem 7 formas modificadas pela vogal. Ainda usado na liturgia da Igreja Ortodoxa Etíope — ~1700 anos de continuidade.'
    }
  ],

  enigmas: [
    { diff: 'fácil', type: 'observação',
      scene: 'Lucinha vê moedas em Adulis com a cara do rei Ezana e uma cruz copta.',
      q: 'O que essas moedas provam sobre Aksum?',
      o: ['Tinha economia monetária e identidade religiosa próprias',
          'Não tinha cultura',
          'Era colónia romana',
          'Não existia comércio'],
      c: 0,
      reward: 'cauris',
      e: 'Aksum cunhou moedas de ouro, prata, bronze séc. III–VII. Identidade política + religiosa visível em circulação económica.' },
    { diff: 'médio', type: 'comparação',
      scene: 'Aksum era contado entre as 4 grandes potências do mundo no séc. III, com Roma, Pérsia e China.',
      q: 'O que isso desafia na narrativa eurocêntrica?',
      o: ['Que Aksum nunca existiu',
          'Que África só entrou na história "depois" — Aksum era potência global',
          'Que África era inferior',
          'Que não havia comércio'],
      c: 1,
      reward: 'vida',
      e: 'Mani (séc. III) listou as 4 potências: Roma, Pérsia, Sasânida, Aksum, China. África sempre esteve no centro da história mundial.' },
    { diff: 'médio', type: 'comparação',
      scene: 'Ezana converte-se em 330–340 d.C. Britânia só fica cristã séculos depois.',
      q: 'O que isso diz sobre o papel africano na história do cristianismo?',
      o: ['África foi tardia',
          'África foi pioneira do cristianismo antes da Europa do Norte',
          'Não houve cristianismo africano',
          'Foi imposto da Europa'],
      c: 1,
      reward: 'cauris',
      e: 'Aksum, Núbia, Egipto copta — cristianismo africano é dos mais antigos do mundo. Igreja Etíope mantém liturgia Ge\'ez ininterrupta.' },
    { diff: 'difícil', type: 'inferência',
      scene: 'Manuscritos Ge\'ez de 1700 anos sobrevivem em mosteiros etíopes. A língua continua a ser ensinada.',
      q: 'O que essa continuidade demonstra?',
      o: ['Que África não preservava cultura',
          'Que há continuidade civilizacional africana documentada em primeira mão',
          'Que a Europa preservou tudo',
          'Que nada sobrevive'],
      c: 1,
      reward: 'passagem',
      e: 'Mosteiros etíopes preservam manuscritos do séc. IV ao XX em Ge\'ez. Memória escrita africana em continuidade ininterrupta.' }
  ],

  tutorial: [
    { delay: 1500, ms: 6000, html: 'Bem-vinda a <b>Aksum</b> · Porto do Mar Vermelho · Comércio global.' },
    { delay: 8000, ms: 7000, html: 'Sobe a <b>estela</b> 🪨 · 3 âncoras (y:4, 8, 12) marcam progresso.' },
    { delay: 15500, ms: 7000, html: 'Cuidado com o <b>vento forte</b> · Indicador 1s antes · Segura <b>↓</b> para resistir.' },
    { delay: 23000, ms: 6500, html: 'Apanha 3 <b>moedas Aksum</b> 🪙 (HUD à parte) para ganhar selo régio.' }
  ],

  progress: {
    memsTotal: 3,
    msg1: '1ª memória de Aksum! Faltam <b>{left}</b>',
    msg2: 'Quase lá! Falta <b>1 memória da estela</b>',
    msg3: '🌟 As estelas de Aksum foram lembradas!'
  },

  win: {
    base:    { mems: 3, npcs: 2 },
    perfect: { mems: 3, npcs: 3, allCauris: true, allAksumCoins: true, code: 'AKSUM330' }
  },

  strings: {
    titleCard: 'Estelas de Aksum · Sobe a torre vertical · Apanha as moedas reais',
    winTitle: '🌟 Aksum lembrado!',
    winMsg: 'Lucinha viu Aksum — uma das 4 grandes potências do séc. III, antes da Europa.',
    winMsgPerfect: 'Sem perder uma vida. Subiste a estela e completaste o tesouro Ezana.',
    stageWin: '🌟 <b>Estelas de Aksum</b> — memórias da Etiópia antiga recuperadas',
    stageWinPerfect: '🌟 <b>PERFEIÇÃO</b> — Mestra da estela e da palavra Ge\'ez'
  },

  parallax: [
    { sprite: 'assets/world2-3/estela-bg.png',
      positions: [[16,-4,2.0],[24,-5,2.5],[36,-4,1.8]] },
    { sprite: 'assets/world2-3/mosteiro-bg.png',
      positions: [[50,-6,1.6],[58,-7,1.4]] }
  ]
};

})();
