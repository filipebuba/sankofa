/*
  Sankofa Royalty — Sprints 2-5: Trono, Casas, Audiência, Súditos, Quests,
  Festivais, Genealogia, Selo Real (PNG). Exposto em window.SankofaRoyalty.

  Não conhece DOM diretamente — recebe (S, ctx) onde ctx tem helpers do app.
  ctx: { sfx, save, getWorldProgress, getEnigma, getWorld, getTitle,
         showToast, isSolved, ENIGMAS, WORLDS, HOUSES, SUDITOS, FESTIVALS,
         GENEALOGY, LEAGUES }
*/
(function () {
  function activeFestival() {
    var FESTIVALS = window.SANKOFA_FESTIVALS || [];
    var now = new Date();
    var m = now.getMonth() + 1, d = now.getDate();
    for (var i = 0; i < FESTIVALS.length; i++) {
      var f = FESTIVALS[i];
      if (f.month && f.day) {
        var endDay = f.day + (f.durationDays || 1) - 1;
        if (m === f.month && d >= f.day && d <= endDay) return f;
      }
    }
    return null;
  }

  function festivalMultiplier() {
    var f = activeFestival();
    return f ? (f.bonusCauris || 1) : 1;
  }

  // 5 fases visuais da coroa.
  function crownStage(S) {
    var c = S.cauris || 0;
    if (c >= 1500) return { stage: 5, name: "Coroa de Ouro Real", emblem: "♛" };
    if (c >= 800)  return { stage: 4, name: "Diadema de Ouro",    emblem: "♔" };
    if (c >= 400)  return { stage: 3, name: "Diadema de Cobre",   emblem: "◆" };
    if (c >= 150)  return { stage: 2, name: "Cordão de Cauris",   emblem: "◈" };
    return { stage: 1, name: "Cocar Trançado", emblem: "◦" };
  }

  function getHouse(S) {
    if (!S.house || !S.house.id) return null;
    var HOUSES = window.SANKOFA_HOUSES || [];
    for (var i = 0; i < HOUSES.length; i++) if (HOUSES[i].id === S.house.id) return HOUSES[i];
    return null;
  }

  function applyHousePerk(S, gained, ctx) {
    var h = getHouse(S);
    if (!h || !h.perk) return gained;
    var enigma = ctx.enigma;
    var perk = h.perk;
    if (perk.cauris && enigma && perk.world === enigma.world) {
      gained.cauris += perk.cauris;
    }
    if (perk.firstTryBonus && ctx.firstTry) gained.cauris += perk.firstTryBonus;
    if (perk.contextBonus && ctx.contextRead) gained.cauris += perk.contextBonus;
    if (perk.good && perk.amount && enigma && perk.world === enigma.world) {
      gained.goods = gained.goods || {};
      gained.goods[perk.good] = (gained.goods[perk.good] || 0) + perk.amount;
    }
    return gained;
  }

  function suditosUnlocked(S, ctx) {
    var SUDITOS = window.SANKOFA_SUDITOS || [];
    var out = [];
    for (var i = 0; i < SUDITOS.length; i++) {
      var s = SUDITOS[i];
      var ok = false;
      if (s.unlockSolved && S.solved.length >= s.unlockSolved) ok = true;
      if (s.unlockWorld) {
        var p = ctx.getWorldProgress(s.unlockWorld);
        if (p.done >= 1) ok = true;
      }
      if (s.unlockHouse && S.house && S.house.id === s.unlockHouse) ok = true;
      if (ok) out.push(s);
    }
    return out;
  }

  /* ---------------- SCREENS (HTML strings) ---------------- */

  function rThrone(S, ctx) {
    var c = crownStage(S);
    var h = getHouse(S);
    var t = ctx.getTitle();
    var goods = S.goods || {};
    var goodKeys = Object.keys(goods);

    var bgStyle = h ? 'background: linear-gradient(160deg, ' + h.color2 + ' 0%, #0c0a06 70%);' : "";
    var html = '<button class="btn btn-ghost btn-sm" data-act="go-profile" style="margin-bottom:14px">← Perfil</button>';
    html += '<div class="throne-room" style="' + bgStyle + '">';
    html += '<div class="throne-header">';
    html += '<div class="crown-emblem">' + c.emblem + '</div>';
    html += '<h2 class="throne-title">' + t.short + ' ' + S.name + '</h2>';
    html += '<div class="throne-sub">' + (h ? h.title + " · " + h.name : t.title) + '</div>';
    if (h) html += '<div class="house-emblem" style="color:' + h.color + '">' + h.emblem + ' ' + h.motto + '</div>';
    html += '<div class="crown-stage">' + c.name + ' · Fase ' + c.stage + '/5</div>';
    html += '</div>';

    // Tesouro
    html += '<div class="treasury">';
    html += '<h3>Tesouro Real</h3>';
    html += '<div class="treasure-grid">';
    html += '<div class="treasure-item"><div class="treasure-val">◉ ' + (S.cauris || 0) + '</div><div class="treasure-lbl">Cauris</div></div>';
    if (goodKeys.length === 0) {
      html += '<div class="treasure-empty">Bens raros surgem ao resolver enigmas em mundos especiais.</div>';
    } else {
      var icons = { ouro: "◉", sal: "◇", cobre: "✦", marfim: "◆", manilha: "◯", kola: "◐" };
      for (var i = 0; i < goodKeys.length; i++) {
        var k = goodKeys[i];
        html += '<div class="treasure-item"><div class="treasure-val">' + (icons[k] || "◇") + ' ' + goods[k] + '</div><div class="treasure-lbl">' + k + '</div></div>';
      }
    }
    html += '</div></div>';

    // Súditos
    var sud = suditosUnlocked(S, ctx);
    html += '<div class="court">';
    html += '<h3>Corte (' + sud.length + ')</h3>';
    if (sud.length === 0) {
      html += '<p class="court-empty">Resolve enigmas e súditos virão prestar vassalagem.</p>';
    } else {
      html += '<div class="court-grid">';
      for (var j = 0; j < sud.length; j++) {
        var npc = sud[j];
        html += '<div class="sudito"><div class="sudito-em">' + npc.emblem + '</div>' +
          '<div class="sudito-nm">' + npc.name + '</div>' +
          '<div class="sudito-rl">' + npc.role + '</div></div>';
      }
      html += '</div>';
    }
    html += '</div>';

    // Casa Real
    if (!h) {
      html += '<div class="house-cta"><button class="btn btn-gold btn-block" data-act="go-houses">Escolher Casa Real</button></div>';
    } else {
      html += '<div class="house-cta"><button class="btn btn-outline btn-sm" data-act="go-genealogy">Ver Linhagem</button>';
      html += '<button class="btn btn-ghost btn-sm" data-act="go-houses" style="margin-left:8px">Trocar Casa (500 ◉)</button></div>';
    }

    html += '<div class="seal-cta"><button class="btn btn-outline btn-block" data-act="go-seal">Selo Real (partilhar)</button></div>';
    html += '</div>';
    return html;
  }

  function rHousesPicker(S, ctx) {
    var HOUSES = window.SANKOFA_HOUSES || [];
    var html = '<button class="btn btn-ghost btn-sm" data-act="go-throne" style="margin-bottom:14px">← Trono</button>';
    html += '<h2 style="text-align:center;font-size:1.4rem">Casas Reais Africanas</h2>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:.88rem;margin-bottom:14px">Escolha uma. Cada casa carrega cores, perks leves e linhagens próprias.</p>';
    html += '<div class="house-list">';
    for (var i = 0; i < HOUSES.length; i++) {
      var h = HOUSES[i];
      var current = S.house && S.house.id === h.id;
      html += '<div class="house-card' + (current ? " current" : "") + '" data-act="pick-house" data-h="' + h.id + '" ' +
        'style="border-color:' + h.color + '">' +
        '<div class="house-emblem-big" style="color:' + h.color + '">' + h.emblem + '</div>' +
        '<div class="house-info">' +
          '<div class="house-name">' + h.name + '</div>' +
          '<div class="house-origin">' + h.origin + ' · ' + h.vol + '</div>' +
          '<div class="house-motto">"' + h.motto + '"</div>' +
          '<div class="house-perk">⚡ ' + h.perk.label + '</div>' +
        '</div>' +
      '</div>';
    }
    html += '</div>';
    return html;
  }

  function rGenealogia(S, ctx) {
    var GENEALOGY = window.SANKOFA_GENEALOGY || {};
    var h = getHouse(S);
    var html = '<button class="btn btn-ghost btn-sm" data-act="go-throne" style="margin-bottom:14px">← Trono</button>';
    if (!h) {
      html += '<p style="text-align:center;color:var(--text-dim)">Escolha uma casa real para ver linhagem.</p>';
      return html;
    }
    var ancestors = GENEALOGY[h.id] || [];
    html += '<h2 style="text-align:center;font-size:1.4rem;color:' + h.color + '">' + h.emblem + ' Linhagem da ' + h.name + '</h2>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:.84rem;margin:6px 0 16px">' + h.origin + '</p>';
    html += '<div class="genealogy">';
    for (var i = 0; i < ancestors.length; i++) {
      var a = ancestors[i];
      html += '<div class="ancestor">' +
        '<div class="ancestor-era">' + a.era + '</div>' +
        '<div class="ancestor-name">' + a.name + '</div>' +
        '<div class="ancestor-note">' + a.note + '</div>' +
      '</div>';
    }
    html += '</div>';
    return html;
  }

  function rAudience(S, ctx) {
    // Substitui rDaily com narrativa de audiência real.
    var SUDITOS = window.SANKOFA_SUDITOS || [];
    var available = suditosUnlocked(S, ctx);
    var has = false;
    for (var i = 0; i < (window.SANKOFA_ENIGMAS || []).length; i++) {
      if (ctx.isSolved((window.SANKOFA_ENIGMAS)[i].id)) { has = true; break; }
    }

    // Daily enigma random pick from solved.
    var daily = ctx.getDailyEnigma();
    var done = ctx.isDailyDone();
    var w = ctx.getWorld(daily.world);

    // Súdito do dia (rotativo, baseado em data).
    var suditoOfDay = available.length ? available[(new Date().getDate()) % available.length] : null;

    var html = '<button class="btn btn-ghost btn-sm" data-act="go-map" style="margin-bottom:14px">← Mapa</button>';
    html += '<div class="section-header" style="margin-bottom:14px"><h2 style="font-size:1.2rem">Audiência Real</h2></div>';
    html += '<div class="audience-card">';

    if (suditoOfDay) {
      html += '<div class="petitioner">' +
        '<div class="petitioner-em">' + suditoOfDay.emblem + '</div>' +
        '<div class="petitioner-name">' + suditoOfDay.name + '</div>' +
        '<div class="petitioner-role">' + suditoOfDay.role + '</div>' +
        '<div class="petitioner-line">"' + suditoOfDay.line + '"</div>' +
      '</div>';
    }

    html += '<h3>⭐ Petição de Hoje</h3>';
    html += '<div style="font-size:.84rem;color:var(--text-dim);margin-bottom:12px">Sequência: ' + S.streak + ' dia' + (S.streak !== 1 ? "s" : "") + '</div>';

    if (done) {
      html += '<div style="padding:14px;text-align:center"><div style="font-size:2rem">✓</div>' +
        '<p style="color:var(--green);font-weight:600">Já atendeste a corte hoje.</p>' +
        '<p style="color:var(--text-dim);font-size:.86rem;margin-top:4px">Volta amanhã.</p></div>';
    } else if (!has) {
      html += '<div style="padding:14px;text-align:center"><p style="color:var(--terra);font-size:.92rem">Resolve um enigma primeiro para abrir audiência.</p></div>';
    } else {
      html += '<div style="text-align:left;margin-top:8px">' +
        '<div style="font-size:.78rem;color:var(--text-muted);margin-bottom:4px">Mundo ' + daily.world + (w ? " · " + w.name : "") + '</div>' +
        '<h4 style="font-size:1.05rem;margin-bottom:10px">' + daily.title + '</h4>' +
        '<p style="font-size:.88rem;color:var(--text-dim);line-height:1.6;margin-bottom:14px">' + daily.intro + '</p>' +
        '<button class="btn btn-gold btn-block" data-act="start-daily" data-e="' + daily.id + '">Atender (+150 pts, +25 ◉)</button>' +
      '</div>';
    }
    html += '</div>';

    // Festival ativo
    var fest = activeFestival();
    if (fest) {
      html += '<div class="festival-banner">' +
        '<span class="fest-icon">' + fest.icon + '</span>' +
        '<div><strong>' + fest.name + '</strong>' +
        '<div style="font-size:.78rem;color:var(--text-dim)">' + fest.lore + ' · cauris ×' + fest.bonusCauris + '</div></div>' +
      '</div>';
    }

    return html;
  }

  /* ---------------- SELO REAL — PNG via Canvas ---------------- */

  function exportSeal(S, ctx) {
    var canvas = document.createElement("canvas");
    canvas.width = 1080; canvas.height = 1080;
    var g = canvas.getContext("2d");
    var t = ctx.getTitle();
    var h = getHouse(S);
    var c = crownStage(S);

    // Fundo
    var grad = g.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, h ? h.color2 : "#0c0a06");
    grad.addColorStop(1, "#0c0a06");
    g.fillStyle = grad; g.fillRect(0, 0, 1080, 1080);

    // Moldura
    g.strokeStyle = h ? h.color : "#c9a84c";
    g.lineWidth = 12; g.strokeRect(40, 40, 1000, 1000);

    // Coroa
    g.fillStyle = h ? h.color : "#c9a84c";
    g.font = "bold 200px Georgia, serif";
    g.textAlign = "center";
    g.fillText(c.emblem, 540, 280);

    // Casa emblem
    if (h) {
      g.font = "120px Georgia, serif";
      g.fillText(h.emblem, 540, 420);
    }

    // Título
    g.fillStyle = "#ede5d5";
    g.font = "bold 64px Georgia, serif";
    g.fillText(t.title, 540, 560);

    // Nome
    g.font = "bold 96px Georgia, serif";
    g.fillStyle = h ? h.color : "#c9a84c";
    g.fillText(S.name || "Viajante", 540, 690);

    // Stats
    g.fillStyle = "#b3a692";
    g.font = "36px Georgia, serif";
    g.fillText("◉ " + (S.cauris || 0) + " cauris  ·  " + S.solved.length + " fragmentos", 540, 770);

    // Frase
    if (h) {
      g.fillStyle = "#ede5d5";
      g.font = "italic 40px Georgia, serif";
      g.fillText('"' + h.motto + '"', 540, 870);
    }

    // Footer
    g.fillStyle = "#8a8071";
    g.font = "28px Georgia, serif";
    g.fillText("SANKOFA · Fragmentos da África", 540, 980);
    g.font = "22px Georgia, serif";
    g.fillText("Baseado na História Geral da África — UNESCO", 540, 1020);

    return canvas.toDataURL("image/png");
  }

  function rSeal(S, ctx) {
    var dataUrl = exportSeal(S, ctx);
    var html = '<button class="btn btn-ghost btn-sm" data-act="go-throne" style="margin-bottom:14px">← Trono</button>';
    html += '<h2 style="text-align:center;font-size:1.4rem">Selo Real</h2>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:.86rem;margin-bottom:14px">Partilha tua patente.</p>';
    html += '<div class="seal-preview"><img src="' + dataUrl + '" alt="Selo Real" /></div>';
    html += '<a class="btn btn-gold btn-block" href="' + dataUrl + '" download="sankofa-selo-' + (S.name || "viajante") + '.png" style="margin-top:14px">⬇ Descarregar PNG</a>';
    return html;
  }

  window.SankofaRoyalty = {
    activeFestival: activeFestival,
    festivalMultiplier: festivalMultiplier,
    crownStage: crownStage,
    getHouse: getHouse,
    applyHousePerk: applyHousePerk,
    suditosUnlocked: suditosUnlocked,
    rThrone: rThrone,
    rHousesPicker: rHousesPicker,
    rGenealogia: rGenealogia,
    rAudience: rAudience,
    rSeal: rSeal,
    exportSeal: exportSeal
  };
})();
