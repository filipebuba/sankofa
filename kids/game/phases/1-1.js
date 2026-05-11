/*
  Sankofa Kids — Phase 1.1: Rift Memories
  HGA Vol. I — Origens (Pré-história).
*/
(function(){
'use strict';

window.PHASE_1_1 = {
  id: '1.1',
  name: 'Rift Memories',
  period: '~3.2 milhões de anos',
  vol: 'Vol. I',
  prevDone: null,

  palette: {
    sh: 0x0c0a06,
    dk: 0x2a1f14,
    ea: 0x5c3d28,
    sk: 0x8b5e3c,
    tr: 0xb85a3a,
    gd: 0xc9a84c,
    sa: 0xd4b896,
    lt: 0xe8d5b7,
    wh: 0xf5efe0,
    gn: 0x4a7a50,
    lf: 0x6b8f3a,
    nt: 0x2a4570,
    dp: 0x7a3520
  },

  audio: {
    bg: 'assets/bg-music.mp3',
    sfx: {},
    griot: {
      fossil:   'assets/griot/fossil.mp3',
      chopper:  'assets/griot/chopper.mp3',
      rupestre: 'assets/griot/rupestre.mp3'
    }
  },

  // [cx, cy, w, h, type?]
  plats: [
    [ 2,   0, 14, 1],
    [14,   0,  6, 1],
    [24.5, 0,  9, 1],
    [34,   0,  8, 1],
    [10,   2.0, 2.8, 0.35, 'float'],
    [19.5, 2.5, 2.5, 0.35, 'float'],
    [22.5, 4.2, 2.5, 0.35, 'float'],
    [27,   5.8, 2.2, 0.35, 'float'],
    [31.5, 3.2, 3.0, 0.35, 'float']
  ],

  cauris: [
    [1, 1.2], [3, 1.2], [5.5, 1.2], [10, 3.5], [13, 1.2], [15, 1.2],
    [19.5, 4], [22.5, 5.7], [25, 1.2], [27, 7.3], [31.5, 4.7], [35, 1.2], [37, 1.2]
  ],

  // type chooses geometry: 'fossil' | 'chopper' | 'rupestre' (built-in)
  mems: [
    { pos: [27,   7.3], type: 'fossil',
      label: 'Fóssil de Lúcia',
      griot: 'A Lúcia caminhou aqui há 3 milhões de anos. Seus ossos contam a história dos primeiros que andaram em pé.' },
    { pos: [31.5, 4.7], type: 'chopper',
      label: 'Pedra-ferramenta (Chopper)',
      griot: 'Pedra contra pedra. Esta foi a primeira tecnologia da humanidade. Lascar pedra para cortar, raspar, criar.' },
    { pos: [37,   1.2], type: 'rupestre',
      label: 'Pintura rupestre',
      griot: 'Os ancestrais desenhavam nas paredes. Mãos sopradas com ocre. Histórias antes da escrita.' }
  ],

  npcs: [
    {
      x: 18, scale: [1.8, 2.4],
      emoji: '🧙🏿', avatar: '🧙🏿',
      name: 'Velho Griot', diff: 'difícil', unlock: 0,
      role: 'Guardião das memórias antigas do Sankofa',
      scene: 'Ele aponta para uma pintura de hipopótamos onde hoje existe deserto.',
      q: 'Que segredo essa pintura guarda sobre o Saara?',
      o: ['Nunca houve vida no Saara', 'O Saara já teve lagos e animais antes de secar', 'Os hipopótamos vieram de navio', 'A pintura é apenas imaginação'], c: 1,
      r: '+1 vida', rfn: function(S){ if (S.hp < 3) S.hp++; },
      ok: 'Exato! Tassili n\'Ajjer mostra pinturas de hipopótamos no Saara.'
    }
  ],

  enigmas: [
    { diff: 'fácil', type: 'observação',
      scene: 'Lucinha encontra ossos antigos. O quadril e os pés parecem contar como esse ser caminhava.',
      q: 'Que pista esses ossos dão?',
      o: ['Que ela já caminhava sobre duas pernas', 'Que ela voava', 'Que vivia no mar', 'Que usava ferro'], c: 0,
      e: 'A Lúcia é famosa porque seus ossos ajudam a entender o bipedalismo: caminhar sobre duas pernas.' },
    { diff: 'fácil', type: 'observação',
      scene: 'A memória mostra um vale profundo no leste da África, como uma cicatriz aberta na terra.',
      q: 'Onde foi encontrada a Lúcia, a hominínea bípede mais famosa de África?',
      o: ['Monte Kilimanjaro, Tanzânia', 'Vale do Rift, Etiópia', 'Deserto do Saara', 'Ilha de Gorée'], c: 1,
      e: 'O Vale do Rift é uma cicatriz geográfica no leste de África — Etiópia, Quénia, Tanzânia. Os ossos da Lúcia foram encontrados em Hadar (Etiópia) em 1974.' },
    { diff: 'médio', type: 'comparação',
      scene: 'Vovó mostra duas pegadas: uma humana antiga e uma pegada moderna. As duas seguem em pé pela savana.',
      q: 'Há quantos milhões de anos a Lúcia caminhou na savana?',
      o: ['30 mil anos', '3,2 milhões de anos', '800 anos', '11 mil anos'], c: 1,
      e: 'A Lúcia viveu há 3,2 milhões de anos. Mas antes dela houve outros bípedes ainda mais antigos: Sahelanthropus, Orrorin, Ardipithecus.' },
    { diff: 'médio', type: 'comparação',
      scene: 'A parede mostra nadadores e hipopótamos. Do lado de fora, só há areia e vento.',
      q: 'O que essa contradição revela?',
      o: ['O clima do Saara mudou: antes houve lagos e vida abundante', 'Os artistas nunca viram animais', 'O deserto sempre foi igual', 'As pinturas foram feitas ontem'], c: 0,
      e: 'Entre 11.000 e 5.000 anos atrás o Saara era verde. As pinturas de Tassili n\'Ajjer mostram nadadores e hipopótamos onde hoje só há areia.' },
    { diff: 'médio', type: 'inferência',
      scene: 'Lucinha acha uma pedra com lascas afiadas. Ela não parece enfeite; parece ferramenta.',
      q: 'O que essa pedra permitia fazer?',
      o: ['Cortar, raspar e transformar matéria', 'Enviar mensagens por rádio', 'Construir pirâmides de ferro', 'Navegar em canoa'], c: 0,
      e: 'O chopper — pedra lascada com pancadas — foi a primeira tecnologia, há mais de 2,5 milhões de anos. O fogo veio bem depois.' },
    { diff: 'difícil', type: 'inferência',
      scene: 'Não há livros na caverna. Há mãos pintadas, figuras de animais e a voz do griot.',
      q: 'Como os ancestrais guardavam histórias antes da escrita?',
      o: ['Apenas escrevendo em pedra', 'Pinturas rupestres + tradição oral', 'Digitando em computadores', 'Moedas e mapas impressos'], c: 1,
      e: 'Tradição oral (griot) + pinturas nas paredes (mãos sopradas com ocre) — assim os ancestrais guardavam a memória.' }
  ],

  tutorial: [
    { delay: 1500,  ms: 5000, html: 'Tens <b>3 vidas ❤❤❤</b> · Cuidado com o vácuo!' },
    { delay: 7000,  ms: 6000, html: 'Usa o cajado <b>(B)</b> para revelar memórias do Rift' },
    { delay: 13500, ms: 6000, html: 'Encontra o <b>Velho Griot</b> 🧙🏿 à direita — ele dá dicas e recompensas!' }
  ],

  progress: {
    memsTotal: 3,
    msg1: '1ª memória encontrada! Faltam <b>{left}</b>',
    msg2: 'Quase lá! Só falta <b>1 memória</b>',
    msg3: '🌟 Todas as memórias do Rift recuperadas!'
  },

  win: {
    base:    { mems: 3, npcs: 0 },
    perfect: { mems: 3, npcs: 1, allCauris: true, noDamage: true, code: 'RIFT2026' }
  },

  strings: {
    titleCard: 'Usa o cajado (B) para revelar memórias escondidas no Rift',
    winTitle: '🌟 Parabéns!',
    winMsg: 'Lucinha descobriu os segredos do vale do Rift!',
    winMsgPerfect: 'Sem perder uma vida. És uma verdadeira arqueóloga do Sankofa.',
    stageWin: '🌟 <b>Volta. E. Busca.</b> — Memórias do Rift recuperadas',
    stageWinPerfect: '🌟 <b>PERFEIÇÃO</b> — Tu és arqueóloga do Sankofa'
  }
};

})();
