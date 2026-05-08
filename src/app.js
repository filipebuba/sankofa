(function () {
  var WORLDS = window.SANKOFA_WORLDS || [];
  var ENIGMAS = window.SANKOFA_ENIGMAS || [];
  var LEVELS = window.SANKOFA_LEVELS || [];
  var ACHIEVEMENTS = window.SANKOFA_ACHIEVEMENTS || [];
  var TITLES = window.SANKOFA_TITLES || [];
  var HOUSES = window.SANKOFA_HOUSES || [];
  var AUDIO = window.SankofaAudio;
  var ROYALTY = window.SankofaRoyalty;
  var PROFILES = window.SankofaProfiles;
  var LEAGUE = window.SankofaLeague;

  var LEGACY_KEYS = ["sankofa_v5", "sankofa_v4", "sankofa_v3", "sankofa_v2", "sankofa", "sankofa-progress-v1"];
  function STORAGE_KEY() { return PROFILES ? PROFILES.storageKey() : "sankofa_v5"; }

  // Pedagogia: avança liberal, recompensa mestria.
  var WORLD_UNLOCK_THRESHOLD = 0.70;        // 70% resolvidos = próximo mundo abre
  var WORLD_PERFECT_FIRST_TRY = 0.80;       // 80%+ em 1ª tentativa = mestria perfeita
  var REWARD_MASTERY = 100;                 // cauris bônus por 100% num mundo
  var REWARD_MASTERY_PERFECT = 250;         // cauris bônus por mestria perfeita

  var S = {
    name: "", points: 0, solved: [], firstTries: 0, noHintSolves: 0, fastSolves: 0,
    hintsUsed: {}, attempts: {}, contextsRead: 0, achievements: [],
    streak: 0, lastPlayDate: null, dailyDone: 0, dailyDate: null,
    screen: "landing", screenData: {}, soundOn: true, ambientOn: false, ctxReadThis: {},
    lastLevel: 1, lastWorldPlayed: null,
    cauris: 0, lastTitleRank: 1, house: null, goods: {},
    // Tracking de toasts e marcos para não dispará-los repetidos
    worldsUnlockToasted: [], worldsMasteryAwarded: [], worldsPerfectAwarded: [],
    // Caderno de Revisão — histórico de erros e mestria
    errored: [],            // ids onde já errou ao menos 1×
    solvedAfterError: [],   // ids que errou e depois acertou
    wrongPicks: {},         // {eid: [picked_idx, picked_idx, ...]} histórico de palpites errados
    lastTryAt: {}           // {eid: ISO date} — para spaced repetition futura
  };

  var enigmaLocked = false;
  var enigmaStartTime = 0;
  var contextOpened = false;

  /* ---------------- PERSISTENCE ---------------- */
  function save() { try { localStorage.setItem(STORAGE_KEY(), JSON.stringify(S)); } catch (e) { } }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY());
      if (!raw) {
        for (var i = 0; i < LEGACY_KEYS.length; i++) {
          raw = localStorage.getItem(LEGACY_KEYS[i]);
          if (raw) break;
        }
      }
      if (!raw) return;
      var d = JSON.parse(raw);
      if (!d) return;
      for (var k in d) if (Object.prototype.hasOwnProperty.call(d, k)) S[k] = d[k];
    } catch (e) { }
  }

  /* ---------------- HELPERS ---------------- */
  function getLevel() {
    for (var i = LEVELS.length - 1; i >= 0; i--) if (S.points >= LEVELS[i].min) return LEVELS[i];
    return LEVELS[0];
  }
  function getNextLevel() {
    var c = getLevel();
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].level === c.level + 1) return LEVELS[i];
    return null;
  }
  function isSolved(id) { return S.solved.indexOf(id) !== -1; }
  function getEnigma(id) {
    for (var i = 0; i < ENIGMAS.length; i++) if (ENIGMAS[i].id === id) return ENIGMAS[i];
    return null;
  }
  function getWorld(id) {
    for (var i = 0; i < WORLDS.length; i++) if (WORLDS[i].id === id) return WORLDS[i];
    return null;
  }
  function getWorldProgress(wid) {
    var total = 0, done = 0, firstTry = 0;
    for (var i = 0; i < ENIGMAS.length; i++) {
      if (ENIGMAS[i].world === wid) {
        total++;
        if (isSolved(ENIGMAS[i].id)) {
          done++;
          if ((S.attempts[ENIGMAS[i].id] || 0) === 1) firstTry++;
        }
      }
    }
    var ratio = total ? done / total : 0;
    var firstTryRatio = total ? firstTry / total : 0;
    return {
      total: total,
      done: done,
      firstTry: firstTry,
      pct: Math.round(ratio * 100),
      ratio: ratio,
      firstTryRatio: firstTryRatio,
      mastered: ratio === 1 && total > 0,
      perfect: ratio === 1 && firstTryRatio >= WORLD_PERFECT_FIRST_TRY && total > 0,
      unlocked: ratio >= WORLD_UNLOCK_THRESHOLD && total > 0
    };
  }

  function worldEnigmas(wid) {
    var out = [];
    for (var i = 0; i < ENIGMAS.length; i++) if (ENIGMAS[i].world === wid) out.push(ENIGMAS[i]);
    return out;
  }

  // Mundo 1 sempre destravado. Demais: previous world ≥ WORLD_UNLOCK_THRESHOLD (default 70%)
  // OR data.unlocked=true.
  function isWorldUnlocked(wid) {
    if (wid <= 1) return true;
    var w = getWorld(wid);
    if (w && w.unlocked) return true;
    var prev = getWorldProgress(wid - 1);
    return prev.unlocked;
  }

  // First unsolved enigma for a given world (in order, gated by predecessor solved).
  function nextInWorld(wid) {
    var we = worldEnigmas(wid);
    for (var i = 0; i < we.length; i++) {
      if (!isSolved(we[i].id)) {
        var prev = (i === 0) || isSolved(we[i - 1].id);
        return prev ? we[i] : null;
      }
    }
    return null;
  }

  // Resume target across the whole game. Prefers lastWorldPlayed, then iterates unlocked worlds.
  function nextResume() {
    var order = [];
    if (S.lastWorldPlayed && isWorldUnlocked(S.lastWorldPlayed)) order.push(S.lastWorldPlayed);
    for (var i = 0; i < WORLDS.length; i++) {
      var w = WORLDS[i];
      if (isWorldUnlocked(w.id) && order.indexOf(w.id) === -1) order.push(w.id);
    }
    for (var j = 0; j < order.length; j++) {
      var n = nextInWorld(order[j]);
      if (n) return { world: order[j], enigma: n };
    }
    return null;
  }

  function hasProgress() {
    return !!(S.name && (S.solved.length > 0 || S.points > 0 || S.streak > 0));
  }

  /* ---------------- ROYALTY / CAURIS ---------------- */
  function totalsCache() {
    var worldsWithContent = 0;
    var worldsCompleted = 0;
    var seen = {};
    for (var i = 0; i < ENIGMAS.length; i++) seen[ENIGMAS[i].world] = true;
    for (var k in seen) {
      worldsWithContent++;
      var p = getWorldProgress(parseInt(k, 10));
      if (p.total > 0 && p.done === p.total) worldsCompleted++;
    }
    var houseWorldComplete = false;
    if (S.house && S.house.worldId) {
      var hp = getWorldProgress(S.house.worldId);
      houseWorldComplete = hp.total > 0 && hp.done === hp.total;
    }
    return {
      totalEnigmas: ENIGMAS.length,
      totalWorlds: WORLDS.length,
      worldsWithContent: worldsWithContent,
      worldsCompleted: worldsCompleted,
      houseWorldComplete: houseWorldComplete
    };
  }

  function getTitle() {
    var t = totalsCache();
    var current = TITLES[0];
    for (var i = 0; i < TITLES.length; i++) {
      try {
        if (TITLES[i].c(S, t)) current = TITLES[i];
      } catch (e) { }
    }
    return current;
  }

  function getNextTitle() {
    var cur = getTitle();
    for (var i = 0; i < TITLES.length; i++) if (TITLES[i].rank === cur.rank + 1) return TITLES[i];
    return null;
  }

  function nameWithTitle() {
    var t = getTitle();
    var prefix = t.short || "";
    if (!S.name) return prefix || "Viajante";
    return (prefix ? prefix + " " : "") + S.name;
  }

  var FRAGMENT_IMAGE_PATTERNS = {
    "fp-arco": true,
    "fp-arte": true,
    "fp-axum": true,
    "fp-bantu": true,
    "fp-border": true,
    "fp-ceramica": true,
    "fp-cruz": true,
    "fp-escrita": true,
    "fp-exodus": true,
    "fp-ferro": true,
    "fp-gado": true,
    "fp-kandake": true,
    "fp-khoisan": true,
    "fp-linguas": true,
    "fp-mansa": true,
    "fp-naqada": true,
    "fp-nilo": true,
    "fp-olduvai": true,
    "fp-piramide": true,
    "fp-rift": true,
    "fp-saara": true,
    "fp-san": true,
    "fp-taharqa": true,
    "fp-toumai": true
  };

  function fragmentImageSrc(pattern) {
    if (!pattern || !FRAGMENT_IMAGE_PATTERNS[pattern]) return "";
    return "assets/frag_" + pattern.replace(/^fp-/, "").replace(/-/g, "_") + ".png";
  }

  function rFragmentImage(pattern, name) {
    var src = fragmentImageSrc(pattern);
    if (!src) return "";
    return '<img class="fragment-img" src="' + src + '" alt="' + escapeAttr(name || "Fragmento") + '" loading="lazy">';
  }

  // Cauris formula: base 5 + bonuses. Visible to player at result screen.
  function caurisForResult(opts) {
    opts = opts || {};
    var base = 5;
    if (opts.firstTry) base += 5;
    if (opts.noHints) base += 5;
    if (opts.fast) base += 5;
    if (opts.daily) base += 25;
    if (opts.worldComplete) base += 50;
    return base;
  }

  function awardCauris(amount) {
    if (amount <= 0) return;
    S.cauris = (S.cauris || 0) + amount;
  }

  function checkTitleUp() {
    var t = getTitle();
    if (S.lastTitleRank && t.rank > S.lastTitleRank) {
      sfx("levelUp");
      showToast(t.icon, "Subiste de patente!", t.title);
    }
    S.lastTitleRank = t.rank;
  }

  /* ---------------- THEME ---------------- */
  var THEME_KEY = "sankofa_theme";
  function getTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    return "dark";
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var b = document.getElementById("theme-toggle");
    if (b) b.textContent = theme === "light" ? "☀" : "🌙";
  }
  function toggleTheme() {
    var next = getTheme() === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  /* ---------------- AUDIO ---------------- */
  function sfx(name) { if (S.soundOn && AUDIO) AUDIO.play(name); }

  function applyAudioState() {
    if (!AUDIO) return;
    AUDIO.setMuted(!S.soundOn);
    if (S.soundOn && S.ambientOn && S.screen === "landing") AUDIO.startAmbient();
    else AUDIO.stopAmbient();
  }

  /* ---------------- UI HELPERS ---------------- */
  function updateSoundBtn() {
    var b = document.getElementById("sound-toggle");
    if (b) {
      b.textContent = S.soundOn ? "🔊" : "🔇";
      b.classList.toggle("muted", !S.soundOn);
    }
    var a = document.getElementById("ambient-toggle");
    if (a) {
      a.textContent = "🥁";
      a.classList.toggle("active", !!S.ambientOn && !!S.soundOn);
    }
  }

  function goTo(screen, data) {
    data = data || {};
    enigmaLocked = false;
    contextOpened = false;
    S.screen = screen;
    S.screenData = data;
    save();
    var a = document.getElementById("app");
    a.classList.add("fade-out");
    setTimeout(function () {
      render();
      a.classList.remove("fade-out");
      window.scrollTo(0, 0);
      applyAudioState();
    }, 280);
  }

  function showToast(icon, title, text) {
    var c = document.getElementById("toast-container");
    if (!c) return;
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML =
      '<span class="toast-icon">' + icon + '</span>' +
      '<span class="toast-text"><strong>' + title + '</strong>' + text + '</span>';
    c.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 350);
    }, 3500);
  }

  function spawnConfetti() {
    var c = document.createElement("div");
    c.className = "confetti-container";
    document.body.appendChild(c);
    var cols = ["#c9a84c", "#b85a3a", "#4a8a50", "#2a4570", "#ede5d5"];
    for (var i = 0; i < 35; i++) {
      var p = document.createElement("div");
      p.className = "confetti";
      p.style.left = Math.random() * 100 + "%";
      p.style.background = cols[Math.floor(Math.random() * cols.length)];
      p.style.animationDelay = Math.random() * 0.6 + "s";
      p.style.animationDuration = (1.5 + Math.random() * 1.2) + "s";
      p.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      c.appendChild(p);
    }
    setTimeout(function () { c.remove(); }, 3500);
  }

  function checkAchievements() {
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var a = ACHIEVEMENTS[i];
      if (S.achievements.indexOf(a.id) === -1 && a.c(S)) {
        S.achievements.push(a.id);
        save();
        sfx("achievement");
        showToast(a.icon, "Conquista Desbloqueada!", a.name);
      }
    }
  }

  function checkLevelUp() {
    var lvl = getLevel();
    if (S.lastLevel && lvl.level > S.lastLevel) {
      sfx("levelUp");
      showToast("✨", "Novo nível!", lvl.title);
    }
    S.lastLevel = lvl.level;
  }

  function getDailyEnigma() {
    var solved = [];
    for (var i = 0; i < ENIGMAS.length; i++) if (isSolved(ENIGMAS[i].id)) solved.push(ENIGMAS[i]);
    if (solved.length === 0) return ENIGMAS[0];
    var d = new Date();
    var seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    return solved[seed % solved.length];
  }

  function isDailyDone() {
    var today = new Date().toISOString().slice(0, 10);
    return S.dailyDate === today;
  }

  function updateStreak() {
    var today = new Date().toISOString().slice(0, 10);
    if (S.lastPlayDate === today) return;
    var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (S.lastPlayDate === yesterday) S.streak++;
    else S.streak = 1;
    S.lastPlayDate = today;
    save();
  }

  /* ---------------- RENDER ---------------- */
  function render() {
    var app = document.getElementById("app");
    var ctx = royaltyCtx();
    switch (S.screen) {
      case "landing": app.innerHTML = rLanding(); break;
      case "register": app.innerHTML = rRegister(); break;
      case "map": app.innerHTML = rMap(); break;
      case "world": app.innerHTML = rWorld(); break;
      case "enigma":
        app.innerHTML = rEnigma();
        enigmaStartTime = Date.now();
        if (window.SankofaTTS && window.SankofaTTS.available() && window.SankofaTTS.enabled()) {
          var _eid = S.screenData.enigma;
          setTimeout(function () { handleSpeakEnigma(_eid); }, 250);
        }
        break;
      case "result": app.innerHTML = rResult(); break;
      case "mosaic": app.innerHTML = rMosaic(); break;
      case "profile": app.innerHTML = rProfile(); break;
      case "achievements": app.innerHTML = rAchievements(); break;
      case "daily": app.innerHTML = ROYALTY ? ROYALTY.rAudience(S, ctx) : rDaily(); break;
      case "throne": app.innerHTML = ROYALTY ? ROYALTY.rThrone(S, ctx) : rProfile(); break;
      case "houses": app.innerHTML = ROYALTY ? ROYALTY.rHousesPicker(S, ctx) : rProfile(); break;
      case "genealogy": app.innerHTML = ROYALTY ? ROYALTY.rGenealogia(S, ctx) : rProfile(); break;
      case "seal": app.innerHTML = ROYALTY ? ROYALTY.rSeal(S, ctx) : rProfile(); break;
      case "league": app.innerHTML = rLeague(); break;
      case "profiles": app.innerHTML = rProfiles(); break;
      case "tournament": app.innerHTML = rTournament(); break;
      case "review": app.innerHTML = rReview(); break;
      default: app.innerHTML = rLanding();
    }
    attachEvents();
    updateSoundBtn();
  }

  function rLanding() {
    var hp = hasProgress();
    var ctaBlock = "";
    if (hp) {
      var resume = nextResume();
      var t = getTitle();
      var greeting = '<p class="resume-greeting">Bem-vindo de volta, <strong>' + t.short + ' ' + S.name + '</strong>.</p>' +
        '<p class="resume-title-line">' + t.icon + ' ' + t.title + ' · ◉ ' + (S.cauris || 0) + ' cauris</p>';
      if (resume) {
        var w = getWorld(resume.world);
        ctaBlock =
          greeting +
          '<button class="btn btn-gold cta" data-act="resume">Continuar Jornada</button>' +
          '<p class="resume-hint">Próximo: <strong>' + resume.enigma.title + '</strong> · Mundo ' + resume.world + (w ? " — " + w.name : "") + '</p>' +
          '<button class="btn btn-outline cta" data-act="go-map">Mapa de Mundos</button>';
      } else {
        ctaBlock =
          greeting +
          '<button class="btn btn-gold cta" data-act="go-map">Mapa de Mundos</button>' +
          '<p class="resume-hint">Recolheste todos os fragmentos disponíveis.</p>';
      }
      ctaBlock += '<button class="btn btn-ghost cta btn-sm" data-act="reset" style="font-size:.78rem;color:var(--text-muted);margin-top:4px">Recomeçar do Zero</button>';
    } else {
      ctaBlock = '<button class="btn btn-gold cta" data-act="start">Começar a Jornada</button>';
    }
    return '<div class="landing">' +
      '<img class="bird logo-img" src="assets/logo.png" alt="Símbolo Sankofa" />' +
      '<h1>SANKOFA</h1>' +
      '<p class="subtitle">Fragmentos da África</p>' +
      '<p class="tagline">"Volte e busque. Não é errado voltar pelo que esqueceste."</p>' +
      ctaBlock +
      '<p style="font-size:.72rem;color:var(--text-muted);margin-top:4px;opacity:0;animation:fadeUp .6s ease 1.4s forwards">Baseado na História Geral da África — UNESCO</p>' +
      '<p class="version-stamp">v' + (window.SANKOFA_VERSION || "0.0.0") + (window.SANKOFA_BUILD_DATE ? " · " + window.SANKOFA_BUILD_DATE : "") + '</p>' +
      '</div>';
  }

  function rRegister() {
    return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:68dvh;gap:20px;text-align:center">' +
      '<h2 style="font-size:1.5rem">Como te chamas, viajante?</h2>' +
      '<p style="color:var(--text-dim);font-size:.92rem">O teu nome será gravado nos fragmentos.</p>' +
      '<input type="text" id="name-input" placeholder="O teu nome..." maxlength="30" ' +
      'style="width:100%;max-width:300px;padding:14px 18px;background:var(--surface);border:1.5px solid var(--surface3);border-radius:var(--radius);color:var(--text);font-size:1.1rem;text-align:center;outline:none;transition:border-color .2s">' +
      '<button class="btn btn-gold" data-act="register">Entrar</button>' +
      '</div>';
  }

  function rMap() {
    var t = getTitle();
    var html = '<div class="section-header" style="margin-bottom:14px">' +
      '<h2 style="font-size:1.2rem">Mundos</h2>' +
      '<div class="header-balances">' +
      '<span class="badge badge-gold">' + S.points + ' pts</span>' +
      '<span class="badge badge-cauri">◉ ' + (S.cauris || 0) + '</span>' +
      '</div></div>' +
      '<p class="map-greeting">' +
      '<span class="title-prefix">' + t.icon + ' ' + t.short + '</span> <strong style="color:var(--gold)">' + S.name + '</strong>' +
      (S.streak > 0 ? ' <span style="color:var(--terra)">🔥 ' + S.streak + ' dia' + (S.streak !== 1 ? "s" : "") + '</span>' : "") +
      '</p>';

    var resume = nextResume();
    if (resume) {
      var rw = getWorld(resume.world);
      html += '<div class="resume-banner" data-act="resume" role="button" tabindex="0">' +
        '<div class="resume-banner-text">' +
        '<div class="resume-banner-eyebrow">Continuar onde paraste</div>' +
        '<div class="resume-banner-title">' + resume.enigma.title + '</div>' +
        '<div class="resume-banner-meta">Mundo ' + resume.world + (rw ? " · " + rw.name : "") + '</div>' +
        '</div>' +
        '<div class="resume-banner-arrow">→</div>' +
        '</div>';
    }

    // Caderno de Revisão — banner se há erros pendentes
    var pendingReview = (S.errored || []).length;
    if (pendingReview > 0) {
      html += '<div class="review-banner" data-act="go-review" role="button" tabindex="0">' +
        '<div class="review-banner-text">' +
        '<div class="review-banner-eyebrow">📓 Caderno de Revisão</div>' +
        '<div class="review-banner-title">' + pendingReview + ' enigma' + (pendingReview !== 1 ? "s" : "") + ' para rever</div>' +
        '<div class="review-banner-meta">Volte quando quiser. Sem pressa.</div>' +
        '</div>' +
        '<div class="resume-banner-arrow">→</div>' +
        '</div>';
    }

    // Banner do Torneio Semanal (se Liga global ativa e semana carregada)
    if (window.SankofaTournament && window.SankofaTournament.enabled) {
      var tw = window.SankofaTournament.getWeek();
      if (tw && tw.enigma_ids && tw.enigma_ids.length) {
        var doneCount = 0;
        for (var ti = 0; ti < tw.enigma_ids.length; ti++) {
          if (window.SankofaTournament.attemptsUsed(tw.week_iso, tw.enigma_ids[ti]) > 0) doneCount++;
        }
        var totalScore = window.SankofaTournament.totalLocalScore(tw.week_iso, tw.enigma_ids);
        html += '<div class="tournament-banner" data-act="go-tournament" role="button" tabindex="0">' +
          '<div class="tournament-banner-text">' +
          '<div class="tournament-banner-eyebrow">🏆 Torneio · Semana ' + (tw.week_iso || "") + '</div>' +
          '<div class="tournament-banner-title">' + doneCount + '/' + tw.enigma_ids.length + ' enigmas resolvidos · ' + totalScore + ' pts</div>' +
          '<div class="tournament-banner-meta">5 enigmas · até 3 tentativas · até domingo 23:59 UTC</div>' +
          '</div>' +
          '<div class="resume-banner-arrow">→</div>' +
          '</div>';
      }
    }

    html += '<div class="world-map">';

    for (var i = 0; i < WORLDS.length; i++) {
      var w = WORLDS[i];
      var p = getWorldProgress(w.id);
      var artStyle = w.art ? ' style="background-image:url(' + w.art + ')"' : "";
      var unlocked = isWorldUnlocked(w.id);
      if (unlocked) {
        var badge = "";
        var extraClass = "";
        if (p.perfect)      { badge = '<span class="world-badge perfect" title="Mestre Perfeito">🏛️</span>'; extraClass = " perfect"; }
        else if (p.mastered) { badge = '<span class="world-badge mastered" title="Mestre">👑</span>'; extraClass = " mastered"; }

        var label;
        if (p.mastered)       label = '<div class="world-status mastered">' + (p.perfect ? "Mestre Perfeito" : "Mestre · " + p.done + "/" + p.total) + '</div>';
        else if (p.unlocked)  label = '<div class="world-status partial">' + p.done + '/' + p.total + ' · próximo aberto</div>';
        else                  label = '<div class="world-status">' + p.done + '/' + p.total + ' fragmentos</div>';

        html += '<div class="world-card unlocked' + extraClass + '" data-act="open-world" data-w="' + w.id + '">' +
          '<div class="world-art"' + artStyle + '></div>' +
          badge +
          '<div class="world-num">' + w.id + '</div>' +
          '<div class="world-name">' + w.name + '</div>' +
          '<div class="world-period">' + w.period + '</div>' +
          '<div style="margin-top:8px"><div class="progress-bar"><div class="progress-fill" style="width:' + p.pct + '%"></div></div>' +
          label + '</div></div>';
      } else {
        var prevP = getWorldProgress(w.id - 1);
        var threshold = Math.ceil(prevP.total * WORLD_UNLOCK_THRESHOLD);
        var hint = prevP.total
          ? "Resolva " + threshold + "/" + prevP.total + " do Mundo " + (w.id - 1) + " (" + prevP.done + " feitos)"
          : "Em breve";
        html += '<div class="world-card locked" title="' + hint + '">' +
          '<div class="world-art"' + artStyle + '></div>' +
          '<span class="lock-icon">🔒</span>' +
          '<div class="world-num">' + w.id + '</div>' +
          '<div class="world-name">' + w.name + '</div>' +
          '<div class="world-period">' + w.period + '</div>' +
          '<div style="margin-top:6px;font-size:.66rem;color:var(--text-muted);font-weight:600">' + hint + '</div></div>';
      }
    }
    html += '</div>';
    html += '<div style="display:flex;gap:8px;margin-top:18px;justify-content:center;flex-wrap:wrap">';
    html += '<button class="btn btn-gold btn-sm" data-act="go-throne">♛ Trono</button>';
    html += '<button class="btn btn-outline btn-sm" data-act="go-daily">⭐ Audiência</button>';
    html += '<button class="btn btn-outline btn-sm" data-act="go-league">🏆 Liga</button>';
    if (window.SankofaTournament && window.SankofaTournament.enabled) {
      html += '<button class="btn btn-outline btn-sm" data-act="go-tournament">🥇 Torneio</button>';
    }
    var pr = (S.errored || []).length;
    if (pr > 0) {
      html += '<button class="btn btn-outline btn-sm" data-act="go-review">📓 Caderno (' + pr + ')</button>';
    }
    html += '<button class="btn btn-ghost btn-sm" data-act="go-profile">Perfil</button>';
    html += '</div>';
    return html;
  }

  function rWorld() {
    var wid = S.screenData.world || 1;
    var w = getWorld(wid);
    var p = getWorldProgress(wid);
    var we = [];
    for (var i = 0; i < ENIGMAS.length; i++) if (ENIGMAS[i].world === wid) we.push(ENIGMAS[i]);

    var html = '<button class="btn btn-ghost btn-sm" data-act="go-map" style="margin-bottom:14px">← Voltar ao Mapa</button>';
    if (w.art) {
      html += '<div class="world-hero" style="background-image:url(' + w.art + ')"></div>';
    }
    html += '<div style="text-align:center;margin-bottom:16px">';
    html += '<div style="font-size:.78rem;color:var(--text-muted)">Mundo ' + w.id + ' · ' + w.vol + '</div>';
    html += '<h2 style="font-size:1.6rem;margin:3px 0">' + w.name + '</h2>';
    html += '<div style="color:var(--text-dim);font-size:.88rem">' + w.period + '</div>';
    html += '<div style="margin-top:10px"><div class="progress-bar" style="max-width:220px;margin:0 auto"><div class="progress-fill" style="width:' + p.pct + '%"></div></div>';
    html += '<div style="font-size:.78rem;color:var(--text-dim);margin-top:3px">' + p.done + '/' + p.total + ' · ' + p.pct + '%</div></div></div>';

    var nxtW = nextInWorld(wid);
    if (p.done === p.total && p.total > 0) {
      html += '<div style="text-align:center;margin-bottom:14px"><button class="btn btn-gold btn-sm" data-act="open-mosaic" data-w="' + wid + '">Ver Mosaico Completo</button></div>';
    } else if (nxtW) {
      html += '<button class="btn btn-gold btn-block" data-act="continue-next" data-w="' + wid + '" style="margin-bottom:14px">' +
        (p.done === 0 ? "Começar" : "Continuar") + ' → ' + nxtW.title +
        '</button>';
    }

    html += '<div class="enigma-list">';
    for (var j = 0; j < we.length; j++) {
      var e = we[j];
      var s = isSolved(e.id);
      var prev = (j === 0) || isSolved(we[j - 1].id);
      var av = !s && prev;
      var pts = S.attempts[e.id] === 1 ? 100 : (S.attempts[e.id] === 2 ? 50 : 25);
      pts = Math.max(0, pts - (S.hintsUsed[e.id] || 0) * 10);
      html += '<div class="enigma-item"' + (av || s ? ' data-act="open-enigma" data-e="' + e.id + '"' : '') +
        ' style="' + (av || s ? '' : 'opacity:.5;cursor:default') + '">';
      html += '<div class="en-num ' + (s ? 'solved' : (av ? 'available' : 'locked')) + '">' + (s ? '✓' : (j + 1)) + '</div>';
      html += '<div class="en-info"><div class="en-title">' + e.title + '</div>';
      html += '<div class="en-sub">' + (s ? 'Recolhido' : (av ? 'Disponível' : 'Resolve o anterior')) + '</div></div>';
      if (s) html += '<span class="en-pts">+' + pts + '</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function rEnigma() {
    var eid = S.screenData.enigma;
    var e = getEnigma(eid);
    if (!e) return rMap();
    var hu = S.hintsUsed[eid] || 0;
    var at = S.attempts[eid] || 0;
    var basePts = at === 0 ? 100 : (at === 1 ? 50 : 25);

    var enIdx = 0;
    var worldEnigmas = [];
    for (var i = 0; i < ENIGMAS.length; i++) if (ENIGMAS[i].world === e.world) worldEnigmas.push(ENIGMAS[i]);
    for (var j = 0; j < worldEnigmas.length; j++) if (worldEnigmas[j].id === eid) { enIdx = j + 1; break; }

    var html = '<button class="btn btn-ghost btn-sm" data-act="open-world" data-w="' + e.world + '" style="margin-bottom:14px">← Mundo ' + e.world + '</button>';
    html += '<div style="text-align:center;margin-bottom:8px"><span class="badge badge-gold">Enigma ' + enIdx + ' · Mundo ' + e.world + '</span></div>';
    html += '<div style="text-align:center;margin-bottom:4px"><h2 style="font-size:1.4rem">' + e.title + '</h2></div>';
    html += '<div class="intro-line">' + e.intro + '</div>';
    html += '<div class="context-area">';
    html += '<button class="context-toggle" data-act="toggle-context" id="ctx-btn">📖 Queres saber mais?</button>';
    html += '<div class="context-panel" id="ctx-panel"><div class="context-content">' + e.context + '</div></div>';
    html += '</div>';
    var ttsAvail = window.SankofaTTS && window.SankofaTTS.available();
    html += '<div class="question-row">' +
      '<div class="question">' + e.question + '</div>' +
      (ttsAvail ? '<button type="button" class="speak-btn" data-act="speak-enigma" data-e="' + eid + '" aria-label="Ler em voz alta" title="Ler em voz alta">🔊</button>' : "") +
      '</div>';
    html += '<div id="opts" class="options">';
    for (var k = 0; k < e.options.length; k++) {
      html += '<div class="option" data-act="pick" data-i="' + k + '"><span class="opt-letter">' + String.fromCharCode(65 + k) + '</span>' + e.options[k] + '</div>';
    }
    html += '</div>';
    html += '<div id="hints" class="hints-area">';
    if (hu >= 1) html += '<div class="hint-box">💡 ' + e.hints[0] + '</div>';
    if (hu >= 2) html += '<div class="hint-box">💡 ' + e.hints[1] + '</div>';
    if (hu >= 3) html += '<div class="hint-box">💡 ' + e.hints[2] + '</div>';
    if (hu < 3) html += '<button class="hint-btn" data-act="hint" data-e="' + eid + '">🗝️ Pedir Dica ' + (hu + 1) + (hu > 0 ? ' (-10 pts)' : '') + '</button>';
    html += '</div>';
    html += '<div id="fb"></div>';
    var attemptHistory = "";
    var prevWrongs = (S.wrongPicks && S.wrongPicks[eid]) || [];
    if (prevWrongs.length > 0 && !isSolved(eid)) {
      attemptHistory = '<div class="prev-wrongs">📓 Já errou ' + prevWrongs.length + ' vez' + (prevWrongs.length !== 1 ? "es" : "") + '. Tente novamente.</div>';
    } else if (S.solvedAfterError && S.solvedAfterError.indexOf(eid) !== -1) {
      attemptHistory = '<div class="prev-wrongs prev-solved">✓ Acertou após errar. Pode rever.</div>';
    }
    html += attemptHistory;
    html += '<div style="text-align:center;font-size:.82rem;color:var(--text-muted);margin-top:8px">Pontos: <strong style="color:var(--gold)">' + Math.max(0, basePts - hu * 10) + '</strong> · Tentativa ' + (at + 1) + '</div>';
    return html;
  }

  function rResult() {
    var eid = S.screenData.enigma;
    var e = getEnigma(eid);
    var pts = S.screenData.points || 0;
    if (!e) return rMap();

    var nxt = nextInWorld(e.world);
    var primary;
    if (nxt) {
      primary = '<button class="btn btn-gold btn-block" data-act="continue-next" data-w="' + e.world + '">Próximo Enigma →</button>' +
        '<p style="font-size:.78rem;color:var(--text-muted);margin-top:-4px;text-align:center">' + nxt.title + '</p>';
    } else {
      var p = getWorldProgress(e.world);
      if (p.done === p.total) {
        primary = '<button class="btn btn-gold btn-block" data-act="open-mosaic" data-w="' + e.world + '">Ver Mosaico do Mundo</button>';
      } else {
        primary = '<button class="btn btn-gold btn-block" data-act="open-world" data-w="' + e.world + '">Voltar ao Mundo</button>';
      }
    }

    var caurisChip = "";
    var cg = S.screenData._caurisGained || 0;
    if (cg > 0) {
      caurisChip = '<div class="cauris-chip">+' + cg + ' <span class="cauris-icon">◉</span> cauris</div>';
    }

    return '<div class="result">' +
      '<h2 style="color:var(--green)">Fragmento Recolhido!</h2>' +
      '<div class="points-earned">+' + pts + ' pts</div>' +
      caurisChip +
      '<div class="fragment-preview ' + e.fragment.pattern + '">' + rFragmentImage(e.fragment.pattern, e.fragment.name) + '</div>' +
      '<h3 style="margin-top:4px">' + e.fragment.name + '</h3>' +
      '<div class="explanation">' + e.explanation + '</div>' +
      '<div style="background:var(--surface2);padding:14px;border-radius:var(--radius);width:100%;text-align:left;font-size:.88rem;color:var(--text-dim);border-left:3px solid var(--terra)">' +
      '<strong style="color:var(--terra)">Curiosidade:</strong> ' + e.curiosity + '</div>' +
      (e.source ? '<div style="font-size:.72rem;color:var(--text-muted)">' + e.source + '</div>' : '') +
      '<div style="display:flex;flex-direction:column;gap:8px;width:100%;margin-top:6px">' +
      primary +
      '<button class="btn btn-ghost btn-block btn-sm" data-act="open-world" data-w="' + e.world + '">Ver lista do Mundo</button>' +
      '</div>' +
      '</div>';
  }

  function rMosaic() {
    var wid = S.screenData.world || 1;
    var we = [];
    for (var i = 0; i < ENIGMAS.length; i++) if (ENIGMAS[i].world === wid) we.push(ENIGMAS[i]);
    var p = getWorldProgress(wid);
    var w = getWorld(wid);
    var wName = w ? w.name : "";

    var html = '<button class="btn btn-ghost btn-sm" data-act="open-world" data-w="' + wid + '" style="margin-bottom:14px">← Mundo ' + wid + '</button>';
    html += '<div style="text-align:center;margin-bottom:16px"><h2 style="font-size:1.4rem">Mosaico: ' + wName + '</h2>';
    html += '<p style="color:var(--text-dim);font-size:.88rem;margin-top:3px">' + p.done + '/' + p.total + ' · ' + p.pct + '%</p></div>';
    html += '<div class="fragment-grid">';
    for (var j = 0; j < we.length; j++) {
      var e = we[j];
      var s = isSolved(e.id);
      html += '<div class="fragment ' + (s ? 'unlocked ' + e.fragment.pattern : 'locked') + '" style="' + (s ? 'animation-delay:' + (j * 0.15) + 's' : '') + '">';
      if (s) html += rFragmentImage(e.fragment.pattern, e.fragment.name);
      if (s) html += '<span class="frag-label">' + e.fragment.name + '</span>';
      html += '</div>';
    }
    html += '</div>';
    if (p.done === p.total && p.total > 0) {
      html += '<div style="text-align:center;margin-top:20px;padding:18px;background:linear-gradient(135deg,var(--gold-glow),var(--surface));border:1px solid var(--gold-dim);border-radius:var(--radius-lg)">';
      html += '<h3 style="color:var(--gold)">Mosaico Completo!</h3>';
      html += '<p style="color:var(--text-dim);font-size:.88rem;margin-top:4px">A história foi restaurada.</p></div>';
    }
    return html;
  }

  function rProfile() {
    var lvl = getLevel();
    var next = getNextLevel();
    var pct = next ? Math.round((S.points - lvl.min) / (next.min - lvl.min) * 100) : 100;

    var t = getTitle();
    var nt = getNextTitle();
    var html = '<button class="btn btn-ghost btn-sm" data-act="go-map" style="margin-bottom:14px">← Mapa</button>';
    html += '<div class="profile-header"><div class="avatar">' + (S.name ? S.name.charAt(0).toUpperCase() : "?") + '</div>';
    html += '<h2>' + t.short + ' ' + (S.name || "Viajante") + '</h2>';
    html += '<div class="title">' + t.icon + ' ' + t.title + '</div>';
    html += '<p style="font-size:.84rem;color:var(--text-dim);max-width:340px;margin:6px auto 0">' + t.desc + '</p>';
    if (nt) {
      html += '<p style="font-size:.78rem;color:var(--text-muted);margin-top:6px">Próxima patente: <strong style="color:var(--gold)">' + nt.title + '</strong></p>';
    }
    html += '</div>';
    html += '<div class="level-section"><div style="display:flex;justify-content:space-between;align-items:center">';
    html += '<span style="font-size:.82rem;color:var(--text-dim)">Nível ' + lvl.level + '</span>';
    html += next ? '<span style="font-size:.78rem;color:var(--text-muted)">Próximo: ' + next.title + '</span>' : '<span style="font-size:.78rem;color:var(--gold)">Máximo!</span>';
    html += '</div><div class="level-bar"><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
    html += '<span class="level-text">' + S.points + ' pts</span></div></div>';
    html += '<div class="stats-grid">';
    html += '<div class="stat-card"><div class="stat-val">' + S.points + '</div><div class="stat-label">Pontos</div></div>';
    html += '<div class="stat-card"><div class="stat-val" style="color:var(--terra)">◉ ' + (S.cauris || 0) + '</div><div class="stat-label">Cauris</div></div>';
    html += '<div class="stat-card"><div class="stat-val">' + S.solved.length + '</div><div class="stat-label">Enigmas</div></div>';
    html += '<div class="stat-card"><div class="stat-val">' + S.firstTries + '</div><div class="stat-label">1ª Tentativa</div></div>';
    html += '<div class="stat-card"><div class="stat-val">' + S.streak + '</div><div class="stat-label">Sequência</div></div>';
    html += '<div class="stat-card"><div class="stat-val">' + S.achievements.length + '/' + ACHIEVEMENTS.length + '</div><div class="stat-label">Conquistas</div></div>';
    html += '<div class="stat-card"><div class="stat-val">' + S.contextsRead + '</div><div class="stat-label">Contextos Lidos</div></div>';
    html += '</div>';
    html += '<button class="btn btn-gold btn-block" data-act="go-throne" style="margin-bottom:8px">♛ Sala do Trono</button>';
    html += '<button class="btn btn-outline btn-block" data-act="go-ach">Ver Conquistas</button>';
    var prCount = (S.errored || []).length;
    var saeCount = (S.solvedAfterError || []).length;
    html += '<button class="btn btn-outline btn-block" data-act="go-review" style="margin-top:8px">📓 Caderno de Revisão' + (prCount > 0 ? ' (' + prCount + ')' : (saeCount > 0 ? ' (' + saeCount + ' superados)' : '')) + '</button>';
    html += '<button class="btn btn-outline btn-block" data-act="go-profiles" style="margin-top:8px">Liga Local (perfis)</button>';

    // Compartilhar (WhatsApp + link)
    html += '<div class="share-row" style="margin-top:14px">';
    html += '<button class="btn btn-gold btn-block" data-act="share-wa">📲 Desafiar no WhatsApp</button>';
    html += '<button class="btn btn-ghost btn-block btn-sm" data-act="share-link" style="margin-top:6px">🔗 Copiar link de convite</button>';
    html += '</div>';

    // Acessibilidade
    var ttsAvail = window.SankofaTTS && window.SankofaTTS.available();
    if (ttsAvail) {
      var ttsOn = window.SankofaTTS.enabled();
      html += '<button class="btn btn-ghost btn-block btn-sm" data-act="tts-toggle" style="margin-top:8px">'
        + (ttsOn ? "🔊 Voz: Ligada" : "🔇 Voz: Desligada") + '</button>';
    }

    html += '<button class="btn btn-ghost btn-block" data-act="reset" style="margin-top:8px;font-size:.8rem;color:var(--text-muted)">Recomeçar do Zero</button>';
    html += '<p class="version-stamp" style="text-align:center;margin-top:14px">Sankofa v' + (window.SANKOFA_VERSION || "?") + '</p>';
    return html;
  }

  function rAchievements() {
    var html = '<button class="btn btn-ghost btn-sm" data-act="go-profile" style="margin-bottom:14px">← Perfil</button>';
    html += '<div class="section-header"><h2 style="font-size:1.2rem">Conquistas</h2><span class="badge badge-gold">' + S.achievements.length + '/' + ACHIEVEMENTS.length + '</span></div>';
    html += '<div class="achievements-grid">';
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var a = ACHIEVEMENTS[i];
      var u = S.achievements.indexOf(a.id) !== -1;
      html += '<div class="achievement-card ' + (u ? 'unlocked' : 'locked') + '">';
      html += '<div class="ach-icon">' + a.icon + '</div>';
      html += '<div class="ach-name">' + a.name + '</div>';
      html += '<div class="ach-desc">' + a.desc + '</div>';
      html += u ? '<div style="font-size:.68rem;color:var(--green);margin-top:5px">✓ Desbloqueada</div>' : '<div style="font-size:.68rem;color:var(--text-muted);margin-top:5px">🔒</div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function royaltyCtx() {
    return {
      sfx: sfx, save: save,
      getWorldProgress: getWorldProgress, getEnigma: getEnigma, getWorld: getWorld,
      getTitle: getTitle, getDailyEnigma: getDailyEnigma, isDailyDone: isDailyDone,
      isSolved: isSolved, showToast: showToast,
      ENIGMAS: ENIGMAS, WORLDS: WORLDS, HOUSES: HOUSES
    };
  }

  function rLeague() {
    var html = '<button class="btn btn-ghost btn-sm" data-act="go-map" style="margin-bottom:14px">← Mapa</button>';
    var weekLabel = LEAGUE ? LEAGUE.week() : "—";
    html += '<div class="league-hero">';
    html += '<div class="league-kicker">Temporada semanal</div>';
    html += '<h2>Liga dos Griôs</h2>';
    html += '<p>Reset domingo · Semana de ' + weekLabel + '</p>';
    html += '</div>';

    if (!LEAGUE || !LEAGUE.enabled) {
      html += '<div class="league-offline">';
      html += '<h3>Liga global indisponível</h3>';
      html += '<p>Quando o Supabase estiver configurado, os cauris entram no placar semanal automaticamente.</p>';
      html += '<p class="league-note">A Liga Local entre perfis deste dispositivo continua disponível.</p>';
      html += '<button class="btn btn-outline btn-block" data-act="go-profiles" style="margin-top:10px">Ver Liga Local</button>';
      html += '</div>';
      return html;
    }

    if (!S.leagueOptIn) {
      html += '<div class="league-optin">';
      html += '<h3>Entrar na Liga Global</h3>';
      html += '<p>Apenas nome de jogador, cauris da semana, título, casa e grupo opcional. Sem email, sem foto.</p>';
      html += '<div class="league-rules"><span>◉ Cauris contam pontos</span><span>Domingo zera</span><span>Grupo cria placar de turma</span></div>';
      html += '<button class="btn btn-gold btn-block" data-act="league-optin" style="margin-top:14px">Aceito participar</button>';
      html += '</div>';
      return html;
    }

    var globalRows = (LEAGUE.cache && LEAGUE.cache.rows) || [];
    var groupRows  = (LEAGUE.cache && LEAGUE.cache.groupRows) || [];
    var active     = (LEAGUE.cache && LEAGUE.cache.activeCount) || 0;
    var myRank     = LEAGUE.findRank(S.leagueHandle || "");
    var tier       = myRank > 0 ? LEAGUE.tier(myRank, globalRows.length || 1) : null;
    var myScore    = S.cauris || 0;
    var leader     = globalRows[0] || null;
    var leaderGap  = leader ? Math.max(0, (leader.cauris | 0) - myScore) : 0;
    var fetchedAt  = LEAGUE.cache && LEAGUE.cache.fetchedAt ? new Date(LEAGUE.cache.fetchedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

    html += '<div class="league-me-card">';
    html += '<div><div class="league-me-label">Tua campanha</div><div class="league-me-name">' + escapeAttr(S.leagueHandle || S.name || "Viajante") + '</div></div>';
    html += '<div class="league-me-score">◉ ' + myScore + '</div>';
    html += '<div class="league-me-meta">';
    html += '<span>' + (myRank > 0 ? "#" + myRank + " no global" : "aguardando ranking") + '</span>';
    html += '<span>' + (tier ? tier.name : "Sem tier ainda") + '</span>';
    html += '</div>';
    if (leader && leader.handle !== S.leagueHandle) {
      html += '<div class="league-progress"><div class="league-progress-fill" style="width:' + Math.min(100, Math.round((myScore / Math.max(leader.cauris || 1, 1)) * 100)) + '%"></div></div>';
      html += '<div class="league-tip">Faltam ' + leaderGap + ' cauris para alcançar ' + escapeAttr(leader.handle) + '.</div>';
    } else if (leader && leader.handle === S.leagueHandle) {
      html += '<div class="league-tip good">Você lidera a semana. Mantém o ritmo.</div>';
    } else {
      html += '<div class="league-tip">Resolva enigmas para publicar teus cauris no placar.</div>';
    }
    html += '</div>';

    html += '<div class="league-stats">';
    html += '<div class="lstat"><div class="lstat-val">' + active + '</div><div class="lstat-lbl">jogadores ativos</div></div>';
    html += '<div class="lstat"><div class="lstat-val">' + (myRank > 0 ? "#" + myRank : "—") + '</div><div class="lstat-lbl">tua posição</div></div>';
    html += '<div class="lstat"><div class="lstat-val" style="color:' + (tier ? tier.color : "#8a8071") + '">' + (tier ? tier.name : "—") + '</div><div class="lstat-lbl">teu tier</div></div>';
    html += '</div>';

    // Tabs Global / Meu Grupo
    var leagueTab = (S.screenData && S.screenData.leagueTab) || "global";
    var hasGroup  = !!S.tag && LEAGUE.hasTagColumn && LEAGUE.hasTagColumn();
    html += '<div class="tabs league-tabs" role="tablist">';
    html += '<button class="tab' + (leagueTab === "global" ? " active" : "") + '" role="tab" data-act="tab-league" data-tab="global">🌍 Global (' + globalRows.length + ')</button>';
    if (hasGroup) {
      html += '<button class="tab' + (leagueTab === "group" ? " active" : "") + '" role="tab" data-act="tab-league" data-tab="group">' + escapeAttr(S.tag) + ' (' + groupRows.length + ')</button>';
    } else if (S.tag) {
      html += '<span class="tab tab-disabled" title="Liga global ainda sem coluna tag">' + escapeAttr(S.tag) + ' em breve</span>';
    } else {
      html += '<span class="tab tab-disabled" title="Defina uma tag de grupo no perfil">+ Grupo</span>';
    }
    html += '</div>';

    var rows = (leagueTab === "group") ? groupRows : globalRows;
    var title = leagueTab === "group" && S.tag ? "Placar do grupo " + S.tag : "Placar global";
    html += '<div class="league-board-head"><strong>' + escapeAttr(title) + '</strong><span>' + (fetchedAt ? "Atualizado " + fetchedAt : "Sincronizando...") + '</span></div>';

    if (rows.length > 0) {
      html += '<div class="league-podium">';
      for (var pi = 0; pi < Math.min(rows.length, 3); pi++) {
        var pr = rows[pi];
        var medal = pi === 0 ? "♛" : (pi === 1 ? "◆" : "◈");
        html += '<div class="podium-card p' + (pi + 1) + '">';
        html += '<div class="podium-medal">' + medal + '</div>';
        html += '<div class="podium-name">' + escapeAttr(pr.handle) + '</div>';
        html += '<div class="podium-score">◉ ' + (pr.cauris | 0) + '</div>';
        html += '</div>';
      }
      html += '</div>';
    }

    html += '<div class="leaderboard">';
    if (rows.length === 0) {
      var emptyMsg = (leagueTab === "group")
        ? "Ninguém com a tag " + (S.tag || "") + " apareceu nesta semana."
        : "Ainda não há jogadores nesta semana.";
      html += '<div class="league-empty"><p>' + escapeAttr(emptyMsg) + '</p><span>Toque em Atualizar ou resolva um enigma para enviar tua pontuação.</span></div>';
    } else {
      for (var i = 0; i < Math.min(rows.length, 20); i++) {
        var r = rows[i];
        var isMe = r.handle === S.leagueHandle;
        var tagBadge = r.tag ? ' <span class="tag-chip">' + escapeAttr(r.tag) + '</span>' : '';
        var rowTier = LEAGUE.tier(i + 1, rows.length || 1);
        var medalIcon = i === 0 ? "♛" : (i === 1 ? "◆" : (i === 2 ? "◈" : "#" + (i + 1)));
        html += '<div class="lb-row' + (isMe ? " me" : "") + '">' +
          '<span class="lb-rank">' + medalIcon + '</span>' +
          '<span class="lb-name">' + escapeAttr(r.handle) + (isMe ? " <em>(você)</em>" : "") + tagBadge + '<small>' + escapeAttr((r.title || rowTier.name || "Griô")) + '</small></span>' +
          '<span class="lb-house">' + escapeAttr(r.house || "—") + '</span>' +
          '<span class="lb-cauris">◉ ' + (r.cauris | 0) + '</span>' +
          '</div>';
      }
    }
    html += '</div>';
    if (leagueTab === "group" && hasGroup) {
      html += '<button class="btn btn-gold btn-block btn-sm" data-act="share-wa" style="margin-top:10px">📲 Convidar com ' + escapeAttr(S.tag) + '</button>';
    } else if (!S.tag) {
      html += '<button class="btn btn-outline btn-block btn-sm" data-act="go-profile" style="margin-top:10px">Adicionar grupo no perfil</button>';
    }
    html += '<div class="league-actions"><button class="btn btn-ghost btn-block btn-sm" data-act="league-refresh">Atualizar placar</button></div>';
    return html;
  }

  function rProfiles() {
    var lb = PROFILES ? PROFILES.localLeaderboard() : [];
    var active = PROFILES ? PROFILES.activeId() : "default";
    var myTag = S.tag || "";
    var tab = S.screenData.tab || "all";
    var hasGroup = !!myTag;

    var rows = lb;
    if (tab === "group" && hasGroup) {
      rows = lb.filter(function (p) { return (p.tag || "").toLowerCase() === myTag.toLowerCase(); });
    }

    var html = '<button class="btn btn-ghost btn-sm" data-act="go-map" style="margin-bottom:14px">← Mapa</button>';
    html += '<h2 style="text-align:center;font-size:1.4rem">Liga Local</h2>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:.86rem;margin-bottom:14px">Vários perfis neste dispositivo (sala de aula, família).</p>';

    // Tabs
    html += '<div class="tabs" role="tablist" style="margin-bottom:12px">';
    html += '<button class="tab' + (tab === "all" ? " active" : "") + '" role="tab" data-act="tab-profiles" data-tab="all">Todos (' + lb.length + ')</button>';
    if (hasGroup) {
      var groupCount = lb.filter(function (p) { return (p.tag || "").toLowerCase() === myTag.toLowerCase(); }).length;
      html += '<button class="tab' + (tab === "group" ? " active" : "") + '" role="tab" data-act="tab-profiles" data-tab="group">' + escapeAttr(myTag) + ' (' + groupCount + ')</button>';
    } else {
      html += '<span class="tab tab-disabled" title="Defina uma tag de grupo no perfil">+ Grupo</span>';
    }
    html += '</div>';

    if (tab === "group" && rows.length <= 1) {
      html += '<div class="group-empty"><p>Só você nesse grupo por enquanto.</p>';
      html += '<p style="font-size:.84rem;color:var(--text-dim);margin-top:6px">Convide colegas com a tag <strong>' + escapeAttr(myTag) + '</strong>.</p>';
      html += '<button class="btn btn-gold btn-block btn-sm" data-act="share-wa" style="margin-top:10px">📲 Convidar no WhatsApp</button>';
      html += '</div>';
    }

    html += '<div class="leaderboard">';
    for (var i = 0; i < rows.length; i++) {
      var p = rows[i];
      var medal = i === 0 ? "♛" : (i === 1 ? "◆" : (i === 2 ? "◈" : "·"));
      var tagChip = p.tag ? '<span class="tag-chip">' + escapeAttr(p.tag) + '</span>' : "";
      html += '<div class="lb-row' + (p.id === active ? " me" : "") + '" data-act="switch-profile" data-p="' + p.id + '">' +
        '<span class="lb-rank">' + medal + ' #' + (i + 1) + '</span>' +
        '<span class="lb-name">' + p.name + (p.id === active ? " <em>(ativo)</em>" : "") + ' ' + tagChip + '</span>' +
        '<span class="lb-cauris">◉ ' + p.cauris + '</span>' +
        '</div>';
    }
    html += '</div>';
    html += '<button class="btn btn-gold btn-block" data-act="new-profile" style="margin-top:14px">+ Novo perfil</button>';
    return html;
  }

  function escapeAttr(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function rReview() {
    var errored = (S.errored || []).slice();
    var solvedAfterError = (S.solvedAfterError || []).slice();
    var tab = (S.screenData && S.screenData.reviewTab) || "todo";

    var html = '<button class="btn btn-ghost btn-sm" data-act="go-map" style="margin-bottom:14px">← Mapa</button>';
    html += '<h2 style="text-align:center;font-size:1.4rem">📓 Caderno de Revisão</h2>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:.86rem;margin-bottom:14px">Onde tropeçou. O griô que erra hoje conta a história amanhã.</p>';

    html += '<div class="tabs" style="margin-bottom:12px">';
    html += '<button class="tab' + (tab === "todo" ? " active" : "") + '" data-act="tab-review" data-tab="todo">🔴 A Revisar (' + errored.length + ')</button>';
    html += '<button class="tab' + (tab === "done" ? " active" : "") + '" data-act="tab-review" data-tab="done">✓ Superados (' + solvedAfterError.length + ')</button>';
    html += '</div>';

    var ids = (tab === "todo") ? errored : solvedAfterError;

    if (ids.length === 0) {
      var msg = (tab === "todo")
        ? "Nenhum erro para revisar — vamos manter assim. 👑"
        : "Ainda não acertou nenhum que tinha errado. Volta na aba ao lado.";
      html += '<div class="review-empty"><p>' + msg + '</p></div>';
      return html;
    }

    // Ordenar por mundo + lastTryAt desc
    ids.sort(function (a, b) {
      var ea = getEnigma(a), eb = getEnigma(b);
      if (!ea || !eb) return 0;
      if (ea.world !== eb.world) return ea.world - eb.world;
      var la = (S.lastTryAt && S.lastTryAt[a]) || "";
      var lb = (S.lastTryAt && S.lastTryAt[b]) || "";
      return lb.localeCompare(la);
    });

    html += '<div class="review-list">';
    for (var i = 0; i < ids.length; i++) {
      var eid = ids[i];
      var en = getEnigma(eid);
      if (!en) continue;
      var attempts = S.attempts[eid] || 0;
      var wrongs = (S.wrongPicks && S.wrongPicks[eid]) || [];
      var lastTry = S.lastTryAt && S.lastTryAt[eid] ? new Date(S.lastTryAt[eid]).toLocaleDateString("pt-BR") : "—";

      var stClass = (tab === "done") ? "solved" : "todo";
      html += '<div class="review-item ' + stClass + '" data-act="replay-enigma" data-e="' + eid + '">';
      html += '<div class="review-info">';
      html += '<div class="review-meta">Mundo ' + en.world + ' · ' + lastTry + '</div>';
      html += '<div class="review-title">' + en.title + '</div>';
      html += '<div class="review-stats">';
      html += '<span>' + attempts + ' tentativa' + (attempts !== 1 ? "s" : "") + '</span>';
      if (wrongs.length) html += '<span>· ' + wrongs.length + ' erro' + (wrongs.length !== 1 ? "s" : "") + '</span>';
      html += '</div>';
      html += '</div>';
      html += '<div class="review-action">' + (tab === "todo" ? "🔁 Tentar de novo" : "🔁 Rever") + ' →</div>';
      html += '</div>';
    }
    html += '</div>';

    html += '<p style="text-align:center;font-size:.78rem;color:var(--text-muted);margin-top:14px">Acertar aqui não dá cauris extra (já tinha contado). Mas dá conhecimento.</p>';
    return html;
  }

  function rTournament() {
    var html = '<button class="btn btn-ghost btn-sm" data-act="go-map" style="margin-bottom:14px">← Mapa</button>';
    html += '<h2 style="text-align:center;font-size:1.4rem">🥇 Torneio Semanal</h2>';

    if (!window.SankofaTournament || !window.SankofaTournament.enabled) {
      html += '<p style="text-align:center;color:var(--text-dim);margin-top:14px">Liga global não configurada. Defina <code>window.SANKOFA_LEAGUE_CONFIG</code> com Supabase URL + chave anônima para ativar.</p>';
      return html;
    }

    var w = window.SankofaTournament.getWeek();
    if (!w) {
      html += '<p style="text-align:center;color:var(--text-dim);margin-top:14px">A carregar a semana atual...</p>';
      html += '<button class="btn btn-ghost btn-block btn-sm" data-act="go-tournament" style="margin-top:10px">Atualizar</button>';
      return html;
    }

    var tournamentIds = Array.isArray(w.enigma_ids) ? w.enigma_ids : [];
    if (!tournamentIds.length) {
      html += '<div class="card" style="margin-top:16px;text-align:center">';
      html += '<p style="color:var(--text-dim);margin-bottom:12px">A semana atual do torneio ainda nao tem enigmas configurados.</p>';
      html += '<p style="color:var(--text-muted);font-size:.82rem">Rode a rotacao semanal no Supabase apos preencher o gabarito dos enigmas, ou toque em atualizar depois que a semana for criada.</p>';
      html += '<button class="btn btn-gold btn-block btn-sm" data-act="go-tournament" style="margin-top:14px">Atualizar</button>';
      html += '</div>';
      return html;
    }

    var maxAtt = (window.SANKOFA_TOURNAMENT && window.SANKOFA_TOURNAMENT.MAX_ATTEMPTS) || 3;
    var endsAt = new Date(w.ends_at);
    var msLeft = endsAt.getTime() - Date.now();
    var daysLeft = Math.max(0, Math.ceil(msLeft / 86400000));

    html += '<p style="text-align:center;color:var(--text-dim);font-size:.86rem;margin-bottom:14px">' +
      'Semana ' + w.week_iso + ' · ' + (daysLeft > 0 ? daysLeft + ' dia' + (daysLeft !== 1 ? "s" : "") + " restante" + (daysLeft !== 1 ? "s" : "") : "encerrando hoje") + '</p>';

    var totalScore = window.SankofaTournament.totalLocalScore(w.week_iso, tournamentIds);
    html += '<div class="league-stats">';
    html += '<div class="lstat"><div class="lstat-val">' + tournamentIds.length + '</div><div class="lstat-lbl">enigmas</div></div>';
    html += '<div class="lstat"><div class="lstat-val">' + maxAtt + '</div><div class="lstat-lbl">tentativas</div></div>';
    html += '<div class="lstat"><div class="lstat-val">' + totalScore + '</div><div class="lstat-lbl">teu total</div></div>';
    html += '</div>';

    html += '<div class="tournament-list">';
    for (var i = 0; i < tournamentIds.length; i++) {
      var id = tournamentIds[i];
      var en = getEnigma(id);
      if (!en) continue;
      var used = window.SankofaTournament.attemptsUsed(w.week_iso, id);
      var best = window.SankofaTournament.localBest(w.week_iso, id);
      var status, stClass;
      if (best > 0) { status = "✓ " + best + " pts"; stClass = "done"; }
      else if (used >= maxAtt) { status = "✗ esgotado"; stClass = "exhausted"; }
      else if (used > 0) { status = used + "/" + maxAtt + " tentativas"; stClass = "wip"; }
      else { status = "novo"; stClass = "new"; }

      var canPlay = used < maxAtt && best === 0;
      html += '<div class="tournament-item ' + stClass + '"' + (canPlay ? ' data-act="open-tournament-enigma" data-e="' + id + '"' : "") + '>';
      html += '<div class="tour-idx">' + (i + 1) + '</div>';
      html += '<div class="tour-info">';
      html += '<div class="tour-title">' + en.title + '</div>';
      html += '<div class="tour-meta">Mundo ' + en.world + '</div>';
      html += '</div>';
      html += '<div class="tour-status">' + status + '</div>';
      html += '</div>';
    }
    html += '</div>';

    html += '<p style="text-align:center;font-size:.78rem;color:var(--text-muted);margin-top:14px">Pontuação calculada server-side. Anti-cheat ativo.</p>';
    return html;
  }

  function rDaily() {
    var daily = getDailyEnigma();
    var done = isDailyDone();
    var has = false;
    for (var i = 0; i < ENIGMAS.length; i++) if (isSolved(ENIGMAS[i].id)) { has = true; break; }
    var w = getWorld(daily.world);
    var wName = w ? w.name : "";

    var html = '<button class="btn btn-ghost btn-sm" data-act="go-map" style="margin-bottom:14px">← Mapa</button>';
    html += '<div class="section-header" style="margin-bottom:14px"><h2 style="font-size:1.2rem">Desafio Diário</h2></div>';
    html += '<div class="daily-card"><h3>⭐ Desafio de Hoje</h3>';
    html += '<div style="font-size:.88rem;color:var(--text-dim);margin-bottom:12px">Sequência: ' + S.streak + ' dia' + (S.streak !== 1 ? "s" : "") + '</div>';

    if (done) {
      html += '<div style="padding:16px;text-align:center"><div style="font-size:2.2rem;margin-bottom:6px">✓</div>';
      html += '<p style="color:var(--green);font-weight:600">Completaste o desafio de hoje!</p>';
      html += '<p style="color:var(--text-dim);font-size:.88rem;margin-top:4px">Volta amanhã.</p></div>';
    } else if (!has) {
      html += '<div style="padding:16px;text-align:center"><p style="color:var(--terra);font-size:.92rem">Resolve um enigma primeiro para desbloquear.</p></div>';
    } else {
      html += '<div style="text-align:left;margin-top:12px">';
      html += '<div style="font-size:.82rem;color:var(--text-muted);margin-bottom:4px">Mundo ' + daily.world + ' · ' + wName + '</div>';
      html += '<h4 style="font-size:1.05rem;margin-bottom:10px">' + daily.title + '</h4>';
      html += '<p style="font-size:.88rem;color:var(--text-dim);line-height:1.6;margin-bottom:14px">' + daily.intro + '</p>';
      html += '<button class="btn btn-gold btn-block" data-act="start-daily" data-e="' + daily.id + '">Aceitar o Desafio (+150 pts)</button></div>';
    }
    html += '</div>';
    return html;
  }

  /* ---------------- EVENTS ---------------- */
  function attachEvents() {
    var els = document.querySelectorAll("[data-act]");
    for (var i = 0; i < els.length; i++) els[i].addEventListener("click", handleAction);
    var ni = document.getElementById("name-input");
    if (ni) {
      ni.addEventListener("keydown", function (e) { if (e.key === "Enter") handleRegister(); });
      if (S.name) ni.value = S.name;
      setTimeout(function () { ni.focus(); }, 350);
    }
  }

  function handleKey(e) {
    if (S.screen !== "enigma" || enigmaLocked) return;
    var map = { a: 0, b: 1, c: 2, d: 3 };
    var idx = map[e.key.toLowerCase()];
    if (idx !== undefined) {
      var opts = document.querySelectorAll("#opts .option");
      if (opts[idx]) handlePick(idx);
    }
  }

  function handleAction(e) {
    var el = e.currentTarget;
    var act = el.getAttribute("data-act");
    if (AUDIO) AUDIO.unlock();

    switch (act) {
      case "start": sfx("navigate"); goTo("register"); break;
      case "register": handleRegister(); break;
      case "resume": handleResume(); break;
      case "continue-next":
        var nw = parseInt(el.getAttribute("data-w"), 10);
        if (!isWorldUnlocked(nw)) { sfx("wrong"); showToast("🔒", "Mundo bloqueado", "Resolva 70% do mundo anterior."); break; }
        var nxt = nextInWorld(nw);
        if (nxt) { sfx("select"); enigmaLocked = false; S.lastWorldPlayed = nw; save(); goTo("enigma", { enigma: nxt.id }); }
        else { sfx("fragment"); goTo("mosaic", { world: nw }); }
        break;
      case "go-map": sfx("navigate"); goTo("map"); break;
      case "go-profile": sfx("click"); goTo("profile"); break;
      case "go-ach": sfx("click"); goTo("achievements"); break;
      case "go-daily": sfx("dailyOpen"); goTo("daily"); break;
      case "open-world":
        var wId = parseInt(el.getAttribute("data-w"), 10);
        if (!isWorldUnlocked(wId)) {
          var prevPx = getWorldProgress(wId - 1);
          var needX = Math.ceil(prevPx.total * WORLD_UNLOCK_THRESHOLD);
          sfx("wrong");
          showToast("🔒", "Mundo bloqueado", "Resolva " + needX + "/" + prevPx.total + " do Mundo " + (wId - 1) + " (faltam " + Math.max(0, needX - prevPx.done) + ").");
          break;
        }
        sfx("navigate"); S.lastWorldPlayed = wId; save();
        goTo("world", { world: wId });
        break;
      case "open-enigma":
        var eId = el.getAttribute("data-e");
        var en2 = getEnigma(eId);
        if (en2 && !isWorldUnlocked(en2.world)) { sfx("wrong"); showToast("🔒", "Bloqueado", "Mundo ainda não destravado."); break; }
        if (en2) { S.lastWorldPlayed = en2.world; save(); }
        sfx("select"); enigmaLocked = false;
        goTo("enigma", { enigma: eId });
        break;
      case "open-mosaic": sfx("fragment"); goTo("mosaic", { world: parseInt(el.getAttribute("data-w"), 10) }); break;
      case "pick": handlePick(parseInt(el.getAttribute("data-i"), 10)); break;
      case "hint": handleHint(el.getAttribute("data-e")); break;
      case "toggle-context": toggleContext(); break;
      case "start-daily":
        sfx("select");
        enigmaLocked = false;
        goTo("enigma", { enigma: el.getAttribute("data-e"), isDaily: true });
        break;
      case "reset":
        if (confirm("Tens a certeza? Todo o progresso deste perfil será apagado.")) {
          localStorage.removeItem(STORAGE_KEY());
          location.reload();
        }
        break;
      case "go-throne": sfx("levelUp"); goTo("throne"); break;
      case "go-houses": sfx("navigate"); goTo("houses"); break;
      case "go-genealogy": sfx("navigate"); goTo("genealogy"); break;
      case "go-seal": sfx("achievement"); goTo("seal"); break;
      case "go-league": sfx("navigate"); goTo("league"); if (LEAGUE && LEAGUE.enabled) {
        LEAGUE.refresh().then(function () {
          if (S.tag && LEAGUE.hasTagColumn && LEAGUE.hasTagColumn()) return LEAGUE.refreshGroup(S.tag);
        }).then(function () { if (S.screen === "league") render(); });
      } break;
      case "go-profiles": sfx("navigate"); goTo("profiles"); break;
      case "pick-house": handlePickHouse(el.getAttribute("data-h")); break;
      case "league-optin": handleLeagueOptIn(); break;
      case "league-refresh": if (LEAGUE) {
        sfx("click");
        LEAGUE.refresh().then(function () {
          if (S.tag && LEAGUE.hasTagColumn && LEAGUE.hasTagColumn()) return LEAGUE.refreshGroup(S.tag);
        }).then(function () {
          if (S.screen === "league") render();
          showToast("🏆", "Liga atualizada", "Placar sincronizado.");
        });
      } break;
      case "switch-profile": handleSwitchProfile(el.getAttribute("data-p")); break;
      case "new-profile": handleNewProfile(); break;
      case "share-wa": handleShareWhatsApp(); break;
      case "share-link": handleShareLink(); break;
      case "tts-toggle": handleTTSToggle(); break;
      case "speak-enigma": handleSpeakEnigma(el.getAttribute("data-e")); break;
      case "tab-profiles": {
        var t = el.getAttribute("data-tab") || "all";
        S.screenData = S.screenData || {};
        S.screenData.tab = t;
        sfx("click");
        render();
        break;
      }
      case "go-review": sfx("navigate"); goTo("review"); break;
      case "replay-enigma": {
        var reid = el.getAttribute("data-e");
        var ren = getEnigma(reid);
        if (!ren) break;
        if (!isWorldUnlocked(ren.world)) { showToast("🔒", "Mundo bloqueado", "Não dá pra revisar agora."); break; }
        sfx("select"); enigmaLocked = false;
        S.lastWorldPlayed = ren.world; save();
        goTo("enigma", { enigma: reid, fromReview: true });
        break;
      }
      case "go-tournament": sfx("achievement"); goTo("tournament"); if (window.SankofaTournament) window.SankofaTournament.loadWeek().then(function(){ if (S.screen === "tournament") render(); }).catch(function(){ if (S.screen === "tournament") render(); }); break;
      case "open-tournament-enigma": {
        var teid = el.getAttribute("data-e");
        var ten = getEnigma(teid);
        if (!ten) break;
        if (!isWorldUnlocked(ten.world)) {
          showToast("🔒", "Mundo bloqueado", "Resolva 70% do Mundo " + (ten.world - 1) + " primeiro.");
          break;
        }
        sfx("select"); enigmaLocked = false;
        S.lastWorldPlayed = ten.world; save();
        goTo("enigma", { enigma: teid, fromTournament: true });
        break;
      }
      case "tab-review": {
        var rt = el.getAttribute("data-tab") || "todo";
        S.screenData = S.screenData || {};
        S.screenData.reviewTab = rt;
        sfx("click");
        render();
        break;
      }
      case "tab-league": {
        var lt = el.getAttribute("data-tab") || "global";
        S.screenData = S.screenData || {};
        S.screenData.leagueTab = lt;
        sfx("click");
        if (LEAGUE && LEAGUE.enabled) {
          if (lt === "group" && S.tag) {
            LEAGUE.refreshGroup(S.tag).then(function () { if (S.screen === "league") render(); });
          } else {
            LEAGUE.refresh().then(function () { if (S.screen === "league") render(); });
          }
        }
        render();
        break;
      }
    }
  }

  function profilePayloadForShare() {
    return {
      id: PROFILES ? PROFILES.activeId() : "default",
      name: S.name || "Viajante",
      house: (S.house && HOUSES) ? (HOUSES.find(function (h) { return h.id === S.house.id; }) || {}).name || "" : "",
      cauris: S.cauris || 0,
      solved: S.solved || []
    };
  }

  function handleShareWhatsApp() {
    if (!window.SankofaShare) return;
    sfx("click");
    window.SankofaShare.whatsapp(profilePayloadForShare());
  }

  function handleShareLink() {
    if (!window.SankofaShare) return;
    sfx("click");
    window.SankofaShare.copyLink(profilePayloadForShare()).then(function (ok) {
      if (ok) showToast("🔗", "Link copiado", "Cole onde quiser.");
      else showToast("⚠️", "Não copiou", "Browser sem suporte. Tente compartilhar.");
    });
  }

  function handleTTSToggle() {
    if (!window.SankofaTTS || !window.SankofaTTS.available()) {
      showToast("⚠️", "Sem voz", "Este browser não suporta leitura.");
      return;
    }
    var on = window.SankofaTTS.toggle();
    sfx("click");
    showToast(on ? "🔊" : "🔇", on ? "Voz ligada" : "Voz desligada", on ? "Lerá enigmas em voz alta." : "Leitura desativada.");
    render();
  }

  function handleSpeakEnigma(eid) {
    if (!window.SankofaTTS || !window.SankofaTTS.available()) return;
    var en = getEnigma(eid);
    if (!en) return;
    var optsTxt = en.options.map(function (o, i) {
      return String.fromCharCode(65 + i) + ". " + o;
    }).join(". ");
    var full = en.question + ". Opções: " + optsTxt;
    window.SankofaTTS.speak(full);
  }

  function handlePickHouse(houseId) {
    if (!houseId) return;
    var house = null;
    for (var i = 0; i < HOUSES.length; i++) if (HOUSES[i].id === houseId) { house = HOUSES[i]; break; }
    if (!house) return;
    if (S.house && S.house.id !== houseId && (S.cauris || 0) < 500) {
      showToast("◉", "Cauris insuficientes", "Trocar de Casa custa 500 cauris.");
      return;
    }
    if (S.house && S.house.id !== houseId) {
      S.cauris = (S.cauris || 0) - 500;
    }
    S.house = { id: house.id, worldId: house.worldId, chosenAt: new Date().toISOString() };
    save();
    sfx("achievement");
    showToast(house.emblem, "Casa Real adotada!", house.title + " — " + house.name);
    goTo("throne");
  }

  function handleLeagueOptIn() {
    if (!LEAGUE || !LEAGUE.enabled) return;
    var handle = (S.name || "Viajante").trim().slice(0, 20);
    S.leagueOptIn = true;
    S.leagueHandle = handle;
    save();
    var t = getTitle();
    var house = ROYALTY ? ROYALTY.getHouse(S) : null;
    LEAGUE.submit({
      handle: handle, cauris: S.cauris || 0,
      title: t.short, house: house ? house.id : "",
      tag: S.tag || ""
    }).then(function () {
      LEAGUE.refresh().then(function () {
        if (S.tag && LEAGUE.hasTagColumn && LEAGUE.hasTagColumn()) return LEAGUE.refreshGroup(S.tag);
      }).then(function () {
        if (S.screen === "league") render();
        showToast("🏆", "Entraste na Liga", "Teus cauris já contam nesta semana.");
      });
    });
    sfx("achievement");
  }

  function handleSwitchProfile(id) {
    if (!PROFILES || !id) return;
    PROFILES.switchTo(id);
    location.reload();
  }

  function handleNewProfile() {
    if (!PROFILES) return;
    if (window.SankofaProfileModal) {
      window.SankofaProfileModal.open({
        mode: "create",
        onSubmit: function (data) {
          PROFILES.createRich(data);
          location.reload();
        }
      });
    } else {
      var name = prompt("Nome do novo griô:");
      if (!name) return;
      PROFILES.create(name.trim().slice(0, 20));
      location.reload();
    }
  }

  function handleResume() {
    var resume = nextResume();
    if (resume) {
      sfx("select");
      enigmaLocked = false;
      S.lastWorldPlayed = resume.world;
      save();
      goTo("enigma", { enigma: resume.enigma.id });
    } else {
      sfx("navigate");
      goTo("map");
    }
  }

  function handleRegister() {
    if (window.SankofaProfileModal) {
      window.SankofaProfileModal.open({
        mode: "create",
        defaults: { name: S.name || "" },
        onSubmit: function (data) {
          S.name = data.name;
          S.hgaName = data.hgaName;
          S.ageBand = data.ageBand;
          S.tag = data.tag;
          S.house = data.house || S.house;
          S.consent = true;
          updateStreak();
          save();
          sfx("levelUp");
          goTo("map");
        }
      });
      return;
    }
    var input = document.getElementById("name-input");
    var name = input ? input.value.trim() : "";
    if (!name) { if (input) input.style.borderColor = "var(--danger)"; return; }
    S.name = name;
    updateStreak();
    save();
    sfx("levelUp");
    goTo("map");
  }

  function toggleContext() {
    var btn = document.getElementById("ctx-btn");
    var panel = document.getElementById("ctx-panel");
    if (!btn || !panel) return;
    contextOpened = !contextOpened;
    sfx("click");
    btn.classList.toggle("open", contextOpened);
    panel.classList.toggle("open", contextOpened);
    btn.innerHTML = contextOpened ? "📖 Fechar contexto" : "📖 Queres saber mais?";
    if (contextOpened) {
      var eid = S.screenData.enigma;
      if (!S.ctxReadThis[eid]) {
        S.ctxReadThis[eid] = true;
        S.contextsRead = (S.contextsRead || 0) + 1;
        save();
        checkAchievements();
      }
    }
  }

  function handlePick(idx) {
    if (enigmaLocked) return;
    enigmaLocked = true;

    var eid = S.screenData.enigma;
    var e = getEnigma(eid);
    if (!e) return;

    var elapsed = Math.round((Date.now() - enigmaStartTime) / 1000);
    var opts = document.querySelectorAll("#opts .option");
    for (var i = 0; i < opts.length; i++) opts[i].classList.remove("selected");
    opts[idx].classList.add("selected");

    var correct = (idx === e.correct);
    var attempts = (S.attempts[eid] || 0) + 1;
    S.attempts[eid] = attempts;

    if (correct) {
      var hu = S.hintsUsed[eid] || 0;
      var pts = attempts === 1 ? 100 : (attempts === 2 ? 50 : 25);
      pts = Math.max(0, pts - hu * 10);
      if (S.screenData.isDaily && !isDailyDone()) {
        pts += 150;
        S.dailyDone = (S.dailyDone || 0) + 1;
        S.dailyDate = new Date().toISOString().slice(0, 10);
      }
      S.points += pts;
      var newSolved = S.solved.indexOf(eid) === -1;
      if (newSolved) S.solved.push(eid);
      if (attempts === 1) S.firstTries++;
      if (hu === 0) S.noHintSolves++;
      if (elapsed < 10) S.fastSolves = (S.fastSolves || 0) + 1;
      S.lastTryAt = S.lastTryAt || {};
      S.lastTryAt[eid] = new Date().toISOString();

      // Caderno: se estava errado e acertou agora, move para "solvedAfterError"
      S.errored = S.errored || [];
      S.solvedAfterError = S.solvedAfterError || [];
      var wasErrored = S.errored.indexOf(eid);
      if (wasErrored !== -1) {
        S.errored.splice(wasErrored, 1);
        if (S.solvedAfterError.indexOf(eid) === -1) S.solvedAfterError.push(eid);
      }

      // Cauris: only on first solve of an enigma.
      var caurisGained = 0;
      var goodsGained = null;
      if (newSolved) {
        var wp = getWorldProgress(e.world);
        var worldDoneNow = wp.done === wp.total && wp.total > 0;
        caurisGained = caurisForResult({
          firstTry: attempts === 1,
          noHints: hu === 0,
          fast: elapsed < 10,
          daily: !!S.screenData.isDaily && !isDailyDone(),
          worldComplete: worldDoneNow
        });

        // House perk + festival multiplier
        if (ROYALTY) {
          var perked = ROYALTY.applyHousePerk(S, { cauris: caurisGained, goods: {} }, {
            enigma: e, firstTry: attempts === 1, contextRead: !!S.ctxReadThis[eid]
          });
          caurisGained = perked.cauris;
          goodsGained = perked.goods;
          var mult = ROYALTY.festivalMultiplier();
          if (mult > 1) caurisGained = Math.round(caurisGained * mult);
        }

        awardCauris(caurisGained);

        if (goodsGained) {
          S.goods = S.goods || {};
          for (var gk in goodsGained) {
            S.goods[gk] = (S.goods[gk] || 0) + goodsGained[gk];
          }
        }
      }
      S.screenData = S.screenData || {};
      S.screenData._caurisGained = caurisGained;
      S.screenData._goodsGained = goodsGained;

      opts[idx].classList.add("correct");
      for (var j = 0; j < opts.length; j++) if (j !== idx) opts[j].classList.add("locked");
      sfx("correct");
      spawnConfetti();

      var fb = document.getElementById("fb");
      if (fb) fb.innerHTML = '<div class="feedback correct">✓ Correto! +' + pts + ' pontos' + (elapsed < 10 ? " ⚡" : "") + '</div>';

      checkAchievements();
      checkLevelUp();
      checkTitleUp();

      // Marcos pedagógicos no mundo atual:
      //   1. Atingiu 70% → desbloqueia próximo mundo (toast 1×)
      //   2. Atingiu 100% → mestria + 100 cauris (toast 1×)
      //   3. Mestria perfeita → +250 cauris + título (toast 1×)
      if (newSolved) {
        var wpAfter = getWorldProgress(e.world);
        S.worldsUnlockToasted = S.worldsUnlockToasted || [];
        S.worldsMasteryAwarded = S.worldsMasteryAwarded || [];
        S.worldsPerfectAwarded = S.worldsPerfectAwarded || [];

        // Threshold de desbloqueio
        if (wpAfter.unlocked && S.worldsUnlockToasted.indexOf(e.world) === -1) {
          S.worldsUnlockToasted.push(e.world);
          var nextW = getWorld(e.world + 1);
          if (nextW) {
            sfx("achievement");
            (function (nw, pct) {
              setTimeout(function () {
                showToast("🗝️", "Mundo " + nw.id + " aberto!", nw.name + " · " + pct + "% no anterior");
              }, 600);
            })(nextW, wpAfter.pct);
          }
        }

        // Mestria 100%
        if (wpAfter.mastered && S.worldsMasteryAwarded.indexOf(e.world) === -1) {
          S.worldsMasteryAwarded.push(e.world);
          S.cauris = (S.cauris || 0) + REWARD_MASTERY;
          (function (wid, w) {
            setTimeout(function () {
              showToast("👑", "Mestre do Mundo " + wid + "!", "+" + REWARD_MASTERY + " cauris · " + (w ? w.name : ""));
              sfx("levelUp");
            }, 1200);
          })(e.world, getWorld(e.world));
        }

        // Mestria Perfeita (100% + 80%+ em 1ª tentativa)
        if (wpAfter.perfect && S.worldsPerfectAwarded.indexOf(e.world) === -1) {
          S.worldsPerfectAwarded.push(e.world);
          S.cauris = (S.cauris || 0) + REWARD_MASTERY_PERFECT;
          (function (wid) {
            setTimeout(function () {
              showToast("🏛️", "Mestre Perfeito do Mundo " + wid + "!", "+" + REWARD_MASTERY_PERFECT + " cauris · domínio quase total na 1ª tentativa");
              sfx("achievement");
            }, 1800);
          })(e.world);
        }
      }

      save();

      // Sync to global league (opt-in, fire-and-forget)
      if (LEAGUE && LEAGUE.enabled && S.leagueOptIn && S.leagueHandle) {
        var tt = getTitle();
        var hh = ROYALTY ? ROYALTY.getHouse(S) : null;
        LEAGUE.submit({
          handle: S.leagueHandle, cauris: S.cauris || 0,
          title: tt.short, house: hh ? hh.id : "",
          tag: S.tag || ""
        });
      }

      // Sync to weekly tournament (opt-in via league config; fire-and-forget)
      submitToTournamentIfApplicable(eid, idx, attempts, hu, Date.now() - enigmaStartTime, true);

      setTimeout(function () {
        sfx("fragment");
        enigmaLocked = false;
        goTo("result", { enigma: eid, points: pts });
      }, 1800);
    } else {
      opts[idx].classList.add("wrong");
      sfx("wrong");
      var fb2 = document.getElementById("fb");
      if (fb2) fb2.innerHTML = '<div class="feedback wrong">✗ Não é esta. Tenta de novo!</div>';

      // Caderno de Revisão — registra erro persistente
      S.errored = S.errored || [];
      S.wrongPicks = S.wrongPicks || {};
      S.lastTryAt = S.lastTryAt || {};
      var firstErrorOnThis = S.errored.indexOf(eid) === -1;
      if (firstErrorOnThis) S.errored.push(eid);
      S.wrongPicks[eid] = (S.wrongPicks[eid] || []).concat([idx]);
      S.lastTryAt[eid] = new Date().toISOString();

      if (firstErrorOnThis) {
        setTimeout(function () {
          showToast("📓", "Adicionado ao Caderno", "Vamos voltar a este depois.");
        }, 700);
      }

      // Tournament: registra também a tentativa errada (até MAX_ATTEMPTS)
      submitToTournamentIfApplicable(eid, idx, attempts, S.hintsUsed[eid] || 0, Date.now() - enigmaStartTime, false);
      save();
      setTimeout(function () {
        opts[idx].classList.remove("wrong", "selected");
        enigmaLocked = false;
      }, 1000);
    }
  }

  function submitToTournamentIfApplicable(eid, idx, attempt, hintsUsed, msTotal, correct) {
    if (!window.SankofaTournament || !window.SankofaTournament.enabled) return;
    if (!window.SankofaTournament.isInCurrentWeek(eid)) return;
    var w = window.SankofaTournament.getWeek();
    if (!w) return;
    var maxAttempts = (window.SANKOFA_TOURNAMENT && window.SANKOFA_TOURNAMENT.MAX_ATTEMPTS) || 3;
    if (attempt > maxAttempts) return;
    var minMs = (window.SANKOFA_TOURNAMENT && window.SANKOFA_TOURNAMENT.MIN_MS) || 1500;
    var ms = Math.max(minMs, msTotal | 0);
    var profileUid = (PROFILES && PROFILES.activeId()) || "default";
    window.SankofaTournament.submit({
      week_iso: w.week_iso,
      profile_uid: profileUid,
      nick: (S.name || "Viajante").slice(0, 32),
      tag: S.tag || null,
      age_band: S.ageBand || null,
      house: (S.house && S.house.id) || null,
      enigma_id: eid,
      picked: idx,
      ms_to_answer: ms,
      hints_used: hintsUsed | 0,
      attempt: attempt
    }).then(function (res) {
      if (res && res.ok) {
        window.SankofaTournament.recordAttempt(w.week_iso, eid, attempt, res.score | 0, !!res.correct);
        if (correct) showToast("🏆", "Torneio: +" + res.score, "Pontuação registrada na semana.");
      }
    });
  }

  function handleHint(eid) {
    var used = S.hintsUsed[eid] || 0;
    if (used >= 3) return;
    S.hintsUsed[eid] = used + 1;
    if (used > 0) S.points = Math.max(0, S.points - 10);
    save();
    sfx("hint");
    goTo("enigma", S.screenData);
  }

  /* ---------------- INIT ---------------- */
  function init() {
    load();
    S.lastLevel = getLevel().level;
    applyTheme(getTheme());
    updateSoundBtn();

    var tb = document.getElementById("theme-toggle");
    if (tb) tb.addEventListener("click", function () { toggleTheme(); sfx("click"); });

    var ib = document.getElementById("install-btn");
    if (ib) ib.addEventListener("click", function () {
      sfx("achievement");
      if (window.__sankofaInstall) {
        window.__sankofaInstall.prompt();
        window.__sankofaInstall.userChoice.then(function () {
          window.__sankofaInstall = null;
          ib.style.display = "none";
        });
      }
    });

    // ?action= shortcuts (ícones do PWA)
    try {
      var params = new URLSearchParams(location.search);
      var act = params.get("action");
      if (act === "resume") setTimeout(function () { handleResume(); }, 200);
      else if (act === "daily") setTimeout(function () { goTo("daily"); }, 200);
      if (act) history.replaceState({}, "", location.pathname);
    } catch (e) {}

    var sb = document.getElementById("sound-toggle");
    if (sb) sb.addEventListener("click", function () {
      S.soundOn = !S.soundOn;
      if (!S.soundOn) S.ambientOn = false;
      save();
      applyAudioState();
      updateSoundBtn();
      if (S.soundOn) sfx("click");
    });

    var ab = document.getElementById("ambient-toggle");
    if (ab) ab.addEventListener("click", function () {
      if (!S.soundOn) return;
      S.ambientOn = !S.ambientOn;
      save();
      applyAudioState();
      updateSoundBtn();
      if (AUDIO) AUDIO.unlock();
    });

    document.addEventListener("keydown", handleKey);
    document.addEventListener("click", function unlockOnce() {
      if (AUDIO) AUDIO.unlock();
      document.removeEventListener("click", unlockOnce);
    }, { once: true });

    // Pre-load weekly tournament (não bloqueante; UI mostra banner depois)
    if (window.SankofaTournament && window.SankofaTournament.enabled) {
      window.SankofaTournament.loadWeek().then(function () {
        if (S.screen === "landing" || S.screen === "map" || S.screen === "tournament") render();
      }).catch(function () {});
    }

    if (S.name) {
      updateStreak();
      enigmaStartTime = Date.now();
      // Always start on landing so the player sees Continuar/Recomeçar — no surprise warps.
      S.screen = "landing"; S.screenData = {};
      save();
      render();
      applyAudioState();
    } else {
      render();
      applyAudioState();
      // Onboarding 30s — só na 1ª visita ever, sem perfil ainda criado.
      if (window.SankofaOnboarding && window.SankofaOnboarding.shouldShow()) {
        setTimeout(function () { window.SankofaOnboarding.show(); }, 600);
      }
    }
  }

  init();
})();
