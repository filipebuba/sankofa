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

  // Karma + Skip
  var SKIP_AFTER_ATTEMPTS = 2;              // mostra "Pular" após 2 erros
  var SKIP_PITY_POINTS = 5;                 // pontos simbólicos por tentar
  var KARMA_WARN_RATIO = 0.20;              // > 20% pendente = aviso anciãos
  var KARMA_BLOCK_RATIO = 0.50;             // > 50% pendente = bloqueia até cair

  var S = {
    name: "", points: 0, solved: [], firstTries: 0, noHintSolves: 0, fastSolves: 0,
    hintsUsed: {}, attempts: {}, contextsRead: 0, achievements: [],
    streak: 0, lastPlayDate: null, dailyDone: 0, dailyDate: null,
    screen: "landing", screenData: {}, soundOn: true, ambientOn: false, ctxReadThis: {},
    lastLevel: 1, lastWorldPlayed: null,
    cauris: 0, lastTitleRank: 1, house: null, goods: {},
    // Tracking de toasts e marcos para não dispará-los repetidos
    worldsUnlockToasted: [], worldsMasteryAwarded: [], worldsPerfectAwarded: [],
    // Karma — enigmas pulados (saiu sem acertar)
    skipped: [],
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
  // Pendências do Caderno num mundo (errored + skipped que ainda não foram resolvidos).
  function getWorldKarma(wid) {
    var pending = 0, total = 0;
    var errored = S.errored || [];
    var skipped = S.skipped || [];
    var solved = S.solved || [];
    for (var i = 0; i < ENIGMAS.length; i++) {
      var e = ENIGMAS[i];
      if (e.world !== wid) continue;
      total++;
      if (solved.indexOf(e.id) !== -1) continue;
      if (errored.indexOf(e.id) !== -1 || skipped.indexOf(e.id) !== -1) pending++;
    }
    var ratio = total ? pending / total : 0;
    return {
      pending: pending,
      total: total,
      ratio: ratio,
      level: ratio > KARMA_BLOCK_RATIO ? "block" : (ratio > KARMA_WARN_RATIO ? "warn" : "ok")
    };
  }

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
    if (b) {
      var icon = b.querySelector(".topbar-icon, .menu-row-icon");
      if (icon) icon.textContent = theme === "light" ? "☀" : "🌙";
    }
    var st = document.getElementById("theme-state");
    if (st) st.textContent = theme === "light" ? t("menu.theme_light") : t("menu.theme_dark");
  }
  function toggleTheme() {
    var next = getTheme() === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  /* ---------------- TEXT SCALE (a11y) ---------------- */
  var TEXT_SCALE_KEY = "sankofa_text_scale";
  var SCALES = [0.9, 1.0, 1.15, 1.3, 1.5];
  var SCALE_LABELS = ["90%", "100%", "115%", "130%", "150%"];

  function getTextScale() {
    var v = parseFloat(localStorage.getItem(TEXT_SCALE_KEY));
    if (!isFinite(v)) return 1;
    // Se valor antigo não bate com o novo array, snap pro mais próximo.
    var best = 1, bestDiff = Infinity;
    for (var i = 0; i < SCALES.length; i++) {
      var d = Math.abs(SCALES[i] - v);
      if (d < bestDiff) { best = SCALES[i]; bestDiff = d; }
    }
    return best;
  }

  function applyTextScale(scale) {
    document.documentElement.style.setProperty("--text-scale", scale);
    var state = document.getElementById("zoom-state");
    var idx = SCALES.indexOf(scale);
    var pct = idx >= 0 ? SCALE_LABELS[idx] : Math.round(scale * 100) + "%";
    if (state) state.textContent = pct;

    var dec = document.getElementById("zoom-decrease");
    var inc = document.getElementById("zoom-increase");
    if (dec) dec.disabled = idx <= 0;
    if (inc) inc.disabled = idx >= SCALES.length - 1;
  }

  function changeTextScale(delta) {
    var current = getTextScale();
    var idx = SCALES.indexOf(current);
    if (idx === -1) idx = 1;
    var nextIdx = Math.max(0, Math.min(SCALES.length - 1, idx + delta));
    if (nextIdx === idx) return false;
    var next = SCALES[nextIdx];
    localStorage.setItem(TEXT_SCALE_KEY, String(next));
    applyTextScale(next);
    showToast("Aa", "Texto " + SCALE_LABELS[nextIdx],
      delta > 0 ? "Aumentado." : "Reduzido.");
    return true;
  }

  function resetTextScale() {
    localStorage.setItem(TEXT_SCALE_KEY, "1");
    applyTextScale(1);
    showToast("Aa", "Texto 100%", "Tamanho padrão restaurado.");
  }

  /* ---------------- I18N HELPERS ---------------- */
  function t(key, vars) {
    return window.SankofaI18n ? window.SankofaI18n.t(key, vars) : key;
  }
  function langDisplayName(code) {
    if (code === "en") return "English";
    if (code === "es") return "Español";
    return "Português (Brasil)";
  }
  function langShortCode(code) {
    if (code === "en") return "EN";
    if (code === "es") return "ES";
    return "PT";
  }
  function tn(oneKey, manyKey, count, vars) {
    vars = vars || {};
    vars.count = count;
    return t(count === 1 ? oneKey : manyKey, vars);
  }
  function updateLangLabels() {
    if (!window.SankofaI18n) return;
    var code = window.SankofaI18n.getLang();
    var langState = document.getElementById("lang-state");
    if (langState) langState.textContent = langShortCode(code);
    var langLabel = document.getElementById("lang-label");
    if (langLabel) langLabel.textContent = t("menu.lang");
    var zoomLabel = document.getElementById("zoom-label");
    if (zoomLabel) zoomLabel.textContent = t("menu.zoom");
    var themeLabel = document.getElementById("theme-label");
    if (themeLabel) themeLabel.textContent = t("menu.theme");
    var ambientLabel = document.getElementById("ambient-label");
    if (ambientLabel) ambientLabel.textContent = t("menu.ambient");
    var soundLabel = document.getElementById("sound-label");
    if (soundLabel) soundLabel.textContent = t("menu.sound");
    var hp = document.getElementById("help-privacy-label");
    if (hp) hp.textContent = t("menu.help_privacy");
    var helpState = hp && hp.parentNode ? hp.parentNode.querySelector(".menu-row-state") : null;
    if (helpState) helpState.textContent = t("menu.open");
    // Atualizar também nomes em ambient/theme/zoom mesmos
    var rows = document.querySelectorAll(".menu-drawer .menu-row .menu-row-text");
    if (rows.length) {
      // Por ID seria mais robusto; aqui só os principais já cobertos via labels acima.
    }
  }

  /* ---------------- INSTALL PROMPT (PWA) ---------------- */
  var INSTALL_DISMISS_KEY = "sankofa_install_dismissed_v1";
  var INSTALL_DONE_KEY = "sankofa_install_done_v1";
  var INSTALL_BANNER_DELAY_MS = 2500; // espera o utilizador respirar antes de sugerir

  function isStandalone() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true;
  }
  function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent || "") && !window.MSStream;
  }
  function installAlreadyHandled() {
    if (localStorage.getItem(INSTALL_DONE_KEY) === "1") return true;
    if (localStorage.getItem(INSTALL_DISMISS_KEY) === "1") return true;
    if (isStandalone()) return true;
    return false;
  }

  function triggerInstallPrompt(onDone) {
    if (!window.__sankofaInstall) return false;
    window.__sankofaInstall.prompt();
    window.__sankofaInstall.userChoice.then(function (res) {
      if (res && res.outcome === "accepted") {
        localStorage.setItem(INSTALL_DONE_KEY, "1");
        showToast("✅", "Instalado!", "Abre Sankofa pela tela de início.");
      }
      window.__sankofaInstall = null;
      if (typeof onDone === "function") onDone();
    });
    return true;
  }

  function setupInstallBanner() {
    var banner = document.getElementById("install-banner");
    var msg = document.getElementById("install-banner-msg");
    var btnYes = document.getElementById("install-banner-yes");
    var btnLater = document.getElementById("install-banner-later");
    var btnClose = document.getElementById("install-banner-close");
    if (!banner) return;

    function hideBanner(persist) {
      banner.hidden = true;
      if (persist) localStorage.setItem(INSTALL_DISMISS_KEY, "1");
    }

    function showForAndroid() {
      if (msg) msg.textContent = "Vira app — abre na tela de início, funciona sem internet, sem app store.";
      if (btnYes) {
        btnYes.style.display = "";
        btnYes.textContent = "⬇ Instalar agora";
      }
      banner.hidden = false;
    }

    function showForIOS() {
      if (msg) {
        msg.innerHTML = "No iPhone/iPad: toque em <strong>Compartilhar</strong> abaixo " +
          "e escolha <strong>“Adicionar à Tela de Início”</strong>.";
      }
      if (btnYes) btnYes.style.display = "none"; // iOS Safari não tem prompt programático
      banner.hidden = false;
    }

    if (btnYes) btnYes.addEventListener("click", function () {
      sfx("achievement");
      if (!triggerInstallPrompt(function () { hideBanner(false); })) {
        // Sem prompt disponível por algum motivo — esconde sem persistir como dismiss.
        hideBanner(false);
      } else {
        hideBanner(false);
      }
    });
    if (btnLater) btnLater.addEventListener("click", function () { sfx("click"); hideBanner(true); });
    if (btnClose) btnClose.addEventListener("click", function () { sfx("click"); hideBanner(true); });

    // Decide se vai mostrar
    if (installAlreadyHandled()) return;

    var android = !!window.__sankofaInstall;
    var ios = isIOSDevice();

    // Android: __sankofaInstall pode chegar tarde — escuta evento global.
    function maybeShow() {
      if (banner.hidden === false) return;
      if (installAlreadyHandled()) return;
      if (window.__sankofaInstall) showForAndroid();
      else if (ios) showForIOS();
    }

    if (android) setTimeout(maybeShow, INSTALL_BANNER_DELAY_MS);
    else if (ios) setTimeout(maybeShow, INSTALL_BANNER_DELAY_MS);
    else {
      // Pode chegar depois — espera evento beforeinstallprompt.
      window.addEventListener("beforeinstallprompt", function () {
        setTimeout(maybeShow, 800);
      });
    }

    // Após "appinstalled" do browser, marca como done e esconde.
    window.addEventListener("appinstalled", function () {
      localStorage.setItem(INSTALL_DONE_KEY, "1");
      hideBanner(false);
    });
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
      var bIcon = b.querySelector(".topbar-icon, .menu-row-icon");
      if (bIcon) bIcon.textContent = S.soundOn ? "🔊" : "🔇";
      b.classList.toggle("muted", !S.soundOn);
    }
    var bState = document.getElementById("sound-state");
    if (bState) bState.textContent = S.soundOn ? t("menu.on") : t("menu.muted");

    var a = document.getElementById("ambient-toggle");
    if (a) {
      var aIcon = a.querySelector(".topbar-icon, .menu-row-icon");
      if (aIcon) aIcon.textContent = "🥁";
      a.classList.toggle("active", !!S.ambientOn && !!S.soundOn);
    }
    var aState = document.getElementById("ambient-state");
    if (aState) aState.textContent = (!!S.ambientOn && !!S.soundOn) ? t("menu.on") : t("menu.off");
  }

  function updateProfileBtn() {
    var pbtn = document.getElementById("profile-btn");
    var avatar = document.getElementById("profile-btn-avatar");
    if (!pbtn || !avatar) return;
    if (S.screen === "register") {
      pbtn.style.display = "none";
      return;
    }
    pbtn.style.display = "";
    if (S.name && S.consent) {
      avatar.textContent = S.name.charAt(0).toUpperCase();
      pbtn.setAttribute("aria-label", "Abrir perfil de " + S.name);
      pbtn.setAttribute("title", "Perfil — " + S.name);
    } else {
      avatar.textContent = "👤";
      pbtn.setAttribute("aria-label", "Criar perfil");
      pbtn.setAttribute("title", "Criar perfil");
    }
  }

  function goTo(screen, data) {
    data = data || {};
    enigmaLocked = false;
    contextOpened = false;
    if (screen === "feedback" && S.screen && S.screen !== "feedback") {
      S.lastScreenBeforeFeedback = S.screen;
    }
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
    updateProfileBtn();
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
      case "karma-gate": app.innerHTML = rKarmaGate(); break;
      case "info-hub": app.innerHTML = rInfoHub(); break;
      case "help": app.innerHTML = rHelp(); break;
      case "privacy": app.innerHTML = rPrivacy(); break;
      case "terms": app.innerHTML = rTerms(); break;
      case "about": app.innerHTML = rAbout(); break;
      case "accessibility": app.innerHTML = rAccessibility(); break;
      case "feedback": app.innerHTML = rFeedback(); break;
      case "contribute": app.innerHTML = rContribute(); break;
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
      var ti = getTitle();
      var greeting = '<p class="resume-greeting">' + t("landing.welcome_back") + ', <strong>' + ti.short + ' ' + S.name + '</strong>.</p>' +
        '<p class="resume-title-line">' + ti.icon + ' ' + ti.title + ' · ◉ ' + (S.cauris || 0) + ' cauris</p>';
      if (resume) {
        var w = getWorld(resume.world);
        ctaBlock =
          greeting +
          '<button class="btn btn-gold cta" data-act="resume">' + t("landing.resume") + '</button>' +
          '<p class="resume-hint">→ <strong>' + resume.enigma.title + '</strong> · Mundo ' + resume.world + (w ? " — " + w.name : "") + '</p>' +
          '<button class="btn btn-outline cta" data-act="go-map">' + t("landing.map") + '</button>';
      } else {
        ctaBlock =
          greeting +
          '<button class="btn btn-gold cta" data-act="go-map">' + t("landing.map") + '</button>' +
          '<p class="resume-hint">Recolheste todos os fragmentos disponíveis.</p>';
      }
      ctaBlock += '<button class="btn btn-ghost cta btn-sm" data-act="reset" style="font-size:.78rem;color:var(--text-muted);margin-top:4px">' + t("landing.reset") + '</button>';
    } else {
      ctaBlock = '<button class="btn btn-gold cta" data-act="start">' + t("landing.start") + '</button>';
    }
    return '<div class="landing">' +
      '<img class="bird logo-img" src="assets/logo.png" alt="Símbolo Sankofa" />' +
      '<h1>' + t("landing.title") + '</h1>' +
      '<p class="subtitle">' + t("landing.subtitle") + '</p>' +
      '<p class="tagline">' + t("landing.tagline") + '</p>' +
      ctaBlock +
      '<p style="font-size:.72rem;color:var(--text-muted);margin-top:4px;opacity:0;animation:fadeUp .6s ease 1.4s forwards">' + t("landing.based_on") + '</p>' +
      '<div class="landing-contrib">' +
        '<p>' + t("landing.contrib_intro") + '</p>' +
        '<div class="landing-contrib-actions">' +
          '<button class="btn btn-ghost btn-sm" data-act="go-feedback">' + t("landing.contrib_feedback") + '</button>' +
          '<button class="btn btn-ghost btn-sm" data-act="go-contribute">' + t("landing.contrib_help") + '</button>' +
        '</div>' +
      '</div>' +
      '<p class="version-stamp">v' + (window.SANKOFA_VERSION || "0.0.0") + (window.SANKOFA_BUILD_DATE ? " · " + window.SANKOFA_BUILD_DATE : "") + '</p>' +
      '</div>';
  }

  function rRegister() {
    return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:68dvh;gap:20px;text-align:center">' +
      '<h2 style="font-size:1.5rem">' + t("register.title") + '</h2>' +
      '<p style="color:var(--text-dim);font-size:.92rem">' + t("register.subtitle") + '</p>' +
      '<input type="text" id="name-input" placeholder="' + t("register.placeholder") + '" maxlength="30" ' +
      'style="width:100%;max-width:300px;padding:14px 18px;background:var(--surface);border:1.5px solid var(--surface3);border-radius:var(--radius);color:var(--text);font-size:1.1rem;text-align:center;outline:none;transition:border-color .2s">' +
      '<button class="btn btn-gold" data-act="register">' + t("register.submit") + '</button>' +
      '</div>';
  }

  function rMap() {
    var titleInfo = getTitle();
    var html = '<div class="section-header" style="margin-bottom:14px">' +
      '<h2 style="font-size:1.2rem">' + t("map.worlds") + '</h2>' +
      '<div class="header-balances">' +
      '<span class="badge badge-gold">' + S.points + ' ' + t("common.points_abbr") + '</span>' +
      '<span class="badge badge-cauri">◉ ' + (S.cauris || 0) + '</span>' +
      '</div></div>' +
      '<p class="map-greeting">' +
      '<span class="title-prefix">' + titleInfo.icon + ' ' + titleInfo.short + '</span> <strong style="color:var(--gold)">' + S.name + '</strong>' +
      (S.streak > 0 ? ' <span style="color:var(--terra)">🔥 ' + tn("common.day_one", "common.day_many", S.streak) + '</span>' : "") +
      '</p>';

    var resume = nextResume();
    if (resume) {
      var rw = getWorld(resume.world);
      html += '<div class="resume-banner" data-act="resume" role="button" tabindex="0">' +
        '<div class="resume-banner-text">' +
        '<div class="resume-banner-eyebrow">' + t("map.continue_where_left") + '</div>' +
        '<div class="resume-banner-title">' + resume.enigma.title + '</div>' +
        '<div class="resume-banner-meta">' + t("common.world") + ' ' + resume.world + (rw ? " · " + rw.name : "") + '</div>' +
        '</div>' +
        '<div class="resume-banner-arrow">→</div>' +
        '</div>';
    }

    // Caderno de Revisão — banner se há erros pendentes
    var pendingReview = (S.errored || []).length;
    if (pendingReview > 0) {
      html += '<div class="review-banner" data-act="go-review" role="button" tabindex="0">' +
        '<div class="review-banner-text">' +
        '<div class="review-banner-eyebrow">📓 ' + t("map.review_notebook") + '</div>' +
        '<div class="review-banner-title">' + tn("map.review_count_one", "map.review_count_many", pendingReview) + '</div>' +
        '<div class="review-banner-meta">' + t("map.review_meta") + '</div>' +
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
        if (p.mastered)       label = '<div class="world-status mastered">' + (p.perfect ? t("map.perfect_master") : t("map.master") + " · " + p.done + "/" + p.total) + '</div>';
        else if (p.unlocked)  label = '<div class="world-status partial">' + p.done + '/' + p.total + ' · ' + t("map.next_open") + '</div>';
        else                  label = '<div class="world-status">' + t("map.fragments", { done: p.done, total: p.total }) + '</div>';

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
        var prevK = w.id > 1 ? getWorldKarma(w.id - 1) : { level: "ok", pending: 0 };
        var karmaHint = "";
        if (prevK.level === "block") karmaHint = " · 🌳 anciãos pedem revisão";
        else if (prevK.level === "warn") karmaHint = " · 🌿 caderno cheio";
        var hint = prevP.total
          ? t("map.lock_hint", { threshold: threshold, total: prevP.total, world: (w.id - 1), done: prevP.done }) + karmaHint
          : t("map.coming_soon");
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
    html += '<button class="btn btn-gold btn-sm" data-act="go-throne">♛ ' + t("map.throne") + '</button>';
    html += '<button class="btn btn-outline btn-sm" data-act="go-daily">⭐ ' + t("map.audience") + '</button>';
    html += '<button class="btn btn-outline btn-sm" data-act="go-league">🏆 ' + t("map.league") + '</button>';
    if (window.SankofaTournament && window.SankofaTournament.enabled) {
      html += '<button class="btn btn-outline btn-sm" data-act="go-tournament">🥇 ' + t("map.tournament") + '</button>';
    }
    var pr = (S.errored || []).length;
    if (pr > 0) {
      html += '<button class="btn btn-outline btn-sm" data-act="go-review">📓 Caderno (' + pr + ')</button>';
    }
    html += '<button class="btn btn-ghost btn-sm" data-act="go-profile">' + t("about.profile") + '</button>';
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
    var enigmaWorld = getWorld(e.world);
    var enigmaArt = enigmaWorld && enigmaWorld.art ? ' style="background-image:url(' + enigmaWorld.art + ')"' : "";
    var fragSrc = fragmentImageSrc(e.fragment && e.fragment.pattern);

    var html = '<button class="btn btn-ghost btn-sm" data-act="open-world" data-w="' + e.world + '" style="margin-bottom:14px">← Mundo ' + e.world + '</button>';
    html += '<div style="text-align:center;margin-bottom:8px"><span class="badge badge-gold">Enigma ' + enIdx + ' · Mundo ' + e.world + '</span></div>';
    html += '<div style="text-align:center;margin-bottom:4px"><h2 style="font-size:1.4rem">' + e.title + '</h2></div>';
    html += '<div class="intro-line">' + e.intro + '</div>';
    html += '<div class="enigma-visual" aria-label="' + escapeAttr(t("enigma.visual_alt")) + '">' +
      '<div class="enigma-visual-bg"' + enigmaArt + '></div>' +
      '<div class="enigma-visual-shade"></div>' +
      '<div class="enigma-visual-fragment ' + (e.fragment && e.fragment.pattern ? e.fragment.pattern : "") + '">' +
        (fragSrc ? '<img class="fragment-img" src="' + fragSrc + '" alt="" loading="lazy">' : "") +
      '</div>' +
      '<div class="enigma-visual-caption">' + t("enigma.visual_hint") + '</div>' +
      '</div>';
    html += '<div class="context-area">';
    html += '<button class="context-toggle" data-act="toggle-context" id="ctx-btn">📖 ' + t("enigma.context_cta") + '</button>';
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
    html += '<div id="enigma-dynamic">' + buildEnigmaDynamic(eid) + '</div>';
    return html;
  }

  // Gera HTML dinâmico do rodapé do enigma (histórico de erros, botão pular, contador)
  function buildEnigmaDynamic(eid) {
    var at = S.attempts[eid] || 0;
    var hu = S.hintsUsed[eid] || 0;
    var basePts = at === 0 ? 100 : (at === 1 ? 50 : 25);
    var out = "";
    var prevWrongs = (S.wrongPicks && S.wrongPicks[eid]) || [];
    if (prevWrongs.length > 0 && !isSolved(eid)) {
      out += '<div class="prev-wrongs">📓 Já errou ' + prevWrongs.length + ' vez' + (prevWrongs.length !== 1 ? "es" : "") + '. Tente novamente.</div>';
    } else if (S.solvedAfterError && S.solvedAfterError.indexOf(eid) !== -1) {
      out += '<div class="prev-wrongs prev-solved">✓ Acertou após errar. Pode rever.</div>';
    }
    // Karma — botão "Pular e ver resposta" após N erros
    if (at >= SKIP_AFTER_ATTEMPTS && !isSolved(eid)) {
      out += '<button class="btn btn-outline btn-block btn-sm skip-btn" data-act="skip-enigma" data-e="' + eid + '" style="margin-top:10px">' +
        '🌿 Pular e ver resposta · 0 cauris</button>' +
        '<div class="skip-hint">Sem julgamento. Vai pro Caderno e pode voltar quando quiser.</div>';
    }
    out += '<div style="text-align:center;font-size:.82rem;color:var(--text-muted);margin-top:8px">Pontos: <strong style="color:var(--gold)">' + Math.max(0, basePts - hu * 10) + '</strong> · Tentativa ' + (at + 1) + '</div>';
    return out;
  }

  function updateEnigmaDynamic(eid) {
    var el = document.getElementById("enigma-dynamic");
    if (el) {
      el.innerHTML = buildEnigmaDynamic(eid);
      attachEvents();
    }
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

    // Modo skipped: mostra resposta correta + explicação, sem fragmento brilhando
    if (S.screenData.skipped) {
      var correctIdx = e.correct;
      var correctText = e.options[correctIdx];
      return '<div class="result skipped-result">' +
        '<h2 style="color:var(--terra)">🌿 Anotado no Caderno</h2>' +
        '<p class="skip-eyebrow">Sem julgamento. A sabedoria é uma volta antes da partida.</p>' +
        '<div class="skip-answer-card">' +
          '<div class="skip-answer-label">A resposta era</div>' +
          '<div class="skip-answer-text">' + correctText + '</div>' +
        '</div>' +
        '<div class="explanation">' + e.explanation + '</div>' +
        '<div style="background:var(--surface2);padding:14px;border-radius:var(--radius);width:100%;text-align:left;font-size:.88rem;color:var(--text-dim);border-left:3px solid var(--terra)">' +
        '<strong style="color:var(--terra)">Curiosidade:</strong> ' + e.curiosity + '</div>' +
        (e.source ? '<div style="font-size:.72rem;color:var(--text-muted)">' + e.source + '</div>' : '') +
        '<div style="display:flex;flex-direction:column;gap:8px;width:100%;margin-top:6px">' +
        primary +
        '<button class="btn btn-outline btn-block btn-sm" data-act="go-review">📓 Ver Caderno</button>' +
        '</div>' +
        '</div>';
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

    // Editar perfil (nome, idade, casa, tag de grupo)
    var tagLabel = S.tag ? S.tag : "sem grupo";
    html += '<button class="btn btn-outline btn-block" data-act="edit-profile" style="margin-top:8px">✏️ Editar perfil <small style="color:var(--text-muted);font-weight:400">(' + escapeAttr(tagLabel) + ')</small></button>';

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

    // Acessibilidade — escala de texto
    var curScale = getTextScale();
    var curIdx = SCALES.indexOf(curScale);
    if (curIdx < 0) curIdx = 1;
    var curPct = SCALE_LABELS[curIdx];
    var atMin = curIdx === 0;
    var atMax = curIdx === SCALES.length - 1;
    html += '<div class="zoom-row" role="group" aria-label="Tamanho do texto" style="display:flex;gap:8px;align-items:center;margin-top:8px">';
    html += '<button class="btn btn-ghost btn-sm" data-act="text-smaller" aria-label="Diminuir texto"' + (atMin ? ' disabled' : '') + ' style="flex:0 0 auto;min-width:48px;font-size:.92rem">A−</button>';
    html += '<div style="flex:1;text-align:center;font-size:.86rem;color:var(--text-dim)">Texto ' + curPct + '</div>';
    html += '<button class="btn btn-ghost btn-sm" data-act="text-larger" aria-label="Aumentar texto"' + (atMax ? ' disabled' : '') + ' style="flex:0 0 auto;min-width:48px;font-size:1.05rem">A+</button>';
    html += '</div>';

    html += '<button class="btn btn-ghost btn-block" data-act="reset" style="margin-top:8px;font-size:.8rem;color:var(--text-muted)">Recomeçar do Zero</button>';
    html += '<div style="text-align:center;margin-top:18px;font-size:.8rem;color:var(--text-muted);display:flex;justify-content:center;gap:14px;flex-wrap:wrap">';
    html += '<button class="link-btn" data-act="go-help" style="background:none;border:none;color:var(--text-muted);cursor:pointer;text-decoration:underline;font:inherit">Ajuda</button>';
    html += '<button class="link-btn" data-act="go-privacy" style="background:none;border:none;color:var(--text-muted);cursor:pointer;text-decoration:underline;font:inherit">Privacidade</button>';
    html += '<button class="link-btn" data-act="go-terms" style="background:none;border:none;color:var(--text-muted);cursor:pointer;text-decoration:underline;font:inherit">Termos</button>';
    html += '<button class="link-btn" data-act="go-about" style="background:none;border:none;color:var(--text-muted);cursor:pointer;text-decoration:underline;font:inherit">Sobre</button>';
    html += '</div>';
    html += '<p class="version-stamp" style="text-align:center;margin-top:8px">Sankofa v' + (window.SANKOFA_VERSION || "?") + '</p>';
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
    html += '<div><div class="league-me-label">Tua campanha</div><div class="league-me-name">' + escapeAttr(displayHandle(S.leagueHandle) || S.name || "Viajante") + '</div></div>';
    html += '<div class="league-me-score">◉ ' + myScore + '</div>';
    html += '<div class="league-me-meta">';
    html += '<span>' + (myRank > 0 ? "#" + myRank + " no global" : "aguardando ranking") + '</span>';
    html += '<span>' + (tier ? tier.name : "Sem tier ainda") + '</span>';
    html += '</div>';
    if (leader && leader.handle !== S.leagueHandle) {
      html += '<div class="league-progress"><div class="league-progress-fill" style="width:' + Math.min(100, Math.round((myScore / Math.max(leader.cauris || 1, 1)) * 100)) + '%"></div></div>';
      html += '<div class="league-tip">Faltam ' + leaderGap + ' cauris para alcançar ' + escapeAttr(displayHandle(leader.handle)) + '.</div>';
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
        html += '<div class="podium-name">' + escapeAttr(displayHandle(pr.handle)) + '</div>';
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
          '<span class="lb-name">' + escapeAttr(displayHandle(r.handle)) + (isMe ? " <em>(você)</em>" : "") + tagBadge + '<small>' + escapeAttr((r.title || rowTier.name || "Griô")) + '</small></span>' +
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

  function rKarmaGate() {
    var wId = S.screenData.world;
    var prevId = S.screenData.prevWorld || (wId - 1);
    var karma = getWorldKarma(prevId);
    var prevW = getWorld(prevId);
    var nextW = getWorld(wId);
    var pct = Math.round(karma.ratio * 100);

    var html = '<div class="karma-gate">';
    html += '<div class="karma-icon">🌳</div>';
    html += '<h2 class="karma-title">Os anciãos te observam.</h2>';
    html += '<p class="karma-poem">' +
      karma.pending + ' enigma' + (karma.pending !== 1 ? "s" : "") + ' do <strong>' + (prevW ? prevW.name : "Mundo " + prevId) + '</strong> ainda sussurram dúvidas no teu Caderno.' +
      '</p>';
    html += '<p class="karma-poem">' +
      '<em>"A sabedoria é uma volta antes da partida.<br>Não se atravessa o rio sem pisar nas pedras."</em>' +
      '</p>';
    html += '<div class="karma-meter">';
    html += '<div class="karma-bar"><div class="karma-fill" style="width:' + pct + '%"></div></div>';
    html += '<div class="karma-meta">' + pct + '% pendente · limite ' + Math.round(KARMA_BLOCK_RATIO * 100) + '%</div>';
    html += '</div>';

    html += '<div class="karma-actions">';
    html += '<button class="btn btn-gold btn-block" data-act="go-review">📓 Voltar e revisar</button>';
    html += '<button class="btn btn-ghost btn-block btn-sm" data-act="karma-insist" data-w="' + wId + '">Insistir mesmo assim · −50 cauris</button>';
    html += '<button class="btn btn-ghost btn-block btn-sm" data-act="go-map">← Mapa</button>';
    html += '</div>';

    if (nextW) {
      html += '<p class="karma-foot">A entrada do <strong>' + nextW.name + '</strong> espera por ti.</p>';
    }
    html += '</div>';
    return html;
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

  /* ---------------- INFO PAGES ---------------- */
  function infoBackBtn() {
    return '<button class="btn btn-ghost btn-sm" data-act="go-info-hub" style="margin-bottom:14px">' + t("info.back_to_hub") + '</button>';
  }

  function rInfoHub() {
    var v = window.SANKOFA_VERSION || "?";
    var html = '<button class="btn btn-ghost btn-sm" data-act="go-map" style="margin-bottom:14px">' + t("common.back_to_map") + '</button>';
    html += '<h2 style="text-align:center;font-size:1.4rem">' + t("info.title") + '</h2>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:.88rem;margin-bottom:6px">' + t("info.subtitle") + '</p>';
    html += '<p style="text-align:center;color:var(--text-dim);font-size:.82rem;line-height:1.45;margin:0 auto 12px;max-width:420px">' + t("info.translation_notice") + '</p>';
    html += '<div class="info-hub-grid">';
    html += hubCard("📖", t("info.help_title"), t("info.help_desc"), "go-help");
    html += hubCard("💬", t("info.feedback_title"), t("info.feedback_desc"), "go-feedback");
    html += hubCard("🤝", t("info.contribute_title"), t("info.contribute_desc"), "go-contribute");
    html += hubCard("🛡️", t("info.privacy_title"), t("info.privacy_desc"), "go-privacy");
    html += hubCard("📜", t("info.terms_title"), t("info.terms_desc"), "go-terms");
    html += hubCard("♿", t("info.accessibility_title"), t("info.accessibility_desc"), "go-accessibility");
    html += hubCard("🌍", t("info.about_title"), t("info.about_desc"), "go-about");
    html += '</div>';
    html += '<p class="version-stamp" style="text-align:center;margin-top:18px;color:var(--text-muted);font-size:.78rem">Sankofa v' + v + ' · MIT (código) · CC BY-SA 4.0 (conteúdo)</p>';
    return html;
  }

  function hubCard(icon, title, desc, act) {
    return '<button class="info-hub-card" data-act="' + act + '" type="button">' +
      '<span class="info-hub-card-icon" aria-hidden="true">' + icon + '</span>' +
      '<span class="info-hub-card-text">' +
        '<span class="info-hub-card-title">' + title + '</span>' +
        '<span class="info-hub-card-desc">' + desc + '</span>' +
      '</span></button>';
  }

  function rHelp() {
    var html = infoBackBtn();
    html += '<div class="info-page">';
    html += '<h2>Como Jogar</h2>';
    html += '<ol>';
    html += '<li>Lê a frase poética e a pergunta do enigma.</li>';
    html += '<li>Escolhe entre 4 opções (A, B, C, D). Pelo teclado: tecla <strong>A/B/C/D</strong>.</li>';
    html += '<li>Se travar, pede até 3 dicas (cada uma custa 10 pts).</li>';
    html += '<li>Acertaste? Recolhes um fragmento. Erraste? Vai para o <strong>Caderno de Revisão</strong> e podes voltar quando quiseres.</li>';
    html += '</ol>';

    html += '<h3>Pontos e cauris</h3>';
    html += '<ul>';
    html += '<li><strong>1ª tentativa:</strong> 100 pts + 5 cauris bônus.</li>';
    html += '<li><strong>2ª tentativa:</strong> 50 pts. <strong>3ª+:</strong> 25 pts.</li>';
    html += '<li>Acertar em <strong>menos de 10s</strong>: +5 cauris bônus.</li>';
    html += '<li><strong>Sem usar dicas:</strong> +5 cauris bônus.</li>';
    html += '<li><strong>Audiência Diária:</strong> +25 cauris.</li>';
    html += '</ul>';

    html += '<h3>Mestria de mundo</h3>';
    html += '<ul>';
    html += '<li>O próximo mundo abre quando resolves <strong>70%</strong> do anterior.</li>';
    html += '<li><strong>100% completo:</strong> +100 cauris (Mestre do Mundo 👑).</li>';
    html += '<li><strong>100% com 80%+ na 1ª tentativa:</strong> +250 cauris (Mestre Perfeito 🏛️).</li>';
    html += '</ul>';

    html += '<h3>Som e tema</h3>';
    html += '<p>O motor sintetiza djembe, kalimba, balafon, talking drum e shaker via Web Audio. Ativa/desativa pelo menu (☰). O tema (papiro/escuro) também está lá.</p>';

    html += '<h3>Acessibilidade</h3>';
    html += '<ul>';
    html += '<li><strong>Tamanho do texto:</strong> menu ☰ → A− / A+. Atalhos: <code>+</code> <code>−</code> <code>0</code>.</li>';
    html += '<li><strong>Voz alta (TTS):</strong> liga em Perfil ou clica 🔊 ao lado da pergunta.</li>';
    html += '<li><strong>Pinch-to-zoom</strong> mobile: dois dedos ampliam o ecrã.</li>';
    html += '<li><strong>Tab</strong> navega botões. <strong>Esc</strong> fecha menu/diálogo.</li>';
    html += '</ul>';

    html += '<h3>Como instalar</h3>';
    html += '<ul>';
    html += '<li><strong>Android Chrome/Edge:</strong> banner de instalação aparece na 1ª visita, ou usa o botão <strong>⬇ Instalar</strong> no canto superior direito.</li>';
    html += '<li><strong>iPhone/iPad (Safari):</strong> toca em <strong>Compartilhar</strong> → <strong>Adicionar à Tela de Início</strong>.</li>';
    html += '</ul>';

    html += '<p class="info-meta">Mais perguntas? Escreve para <a href="mailto:flifnhada@hotmail.com">flifnhada@hotmail.com</a>.</p>';
    html += '</div>';
    return html;
  }

  function rPrivacy() {
    var html = infoBackBtn();
    html += '<div class="info-page">';
    html += '<h2>Política de Privacidade</h2>';
    html += '<p><em>Última atualização: 8 de maio de 2026. Em conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/18) e o GDPR (UE).</em></p>';

    html += '<h3>1. O que guardamos</h3>';
    html += '<p>Sankofa é projetado para guardar o <strong>mínimo absoluto</strong> de dados:</p>';
    html += '<ul>';
    html += '<li><strong>Apelido</strong> (nome de griô, máximo 24 caracteres). Nunca pedimos nome real.</li>';
    html += '<li><strong>Faixa etária</strong> (8-12, 13-17, 18+, ou "prefiro não dizer"). Nunca data de nascimento.</li>';
    html += '<li><strong>Tag de grupo</strong> opcional (ex: <code>#Turma7A</code>) — só se digitares.</li>';
    html += '<li><strong>Progresso do jogo</strong>: enigmas resolvidos, cauris, conquistas, casa real escolhida.</li>';
    html += '</ul>';
    html += '<p><strong>Nunca pedimos:</strong> e-mail, telefone, CPF, endereço, foto, geolocalização, contactos.</p>';

    html += '<h3>2. Onde os dados ficam</h3>';
    html += '<ul>';
    html += '<li><strong>No teu dispositivo</strong> (<code>localStorage</code>): tudo, por padrão. Não sai daí.</li>';
    html += '<li><strong>No servidor (Supabase)</strong>: <em>somente</em> se ativares a Liga Global. Envia apenas o teu apelido, cauris da semana, casa, e tag de grupo. Sem PII.</li>';
    html += '</ul>';

    html += '<h3>3. Cookies</h3>';
    html += '<p>Não usamos cookies. Não rastreamos. Não há analytics, pixels, fingerprinting nem ad-tech.</p>';

    html += '<h3>4. Crianças (menores de 18 anos)</h3>';
    html += '<p>O ranking público <strong>não inclui menores</strong> sem opt-in explícito. A faixa etária <code>8-12</code> e <code>13-17</code> só aparecem em rankings privados de tag (turma). Recomendamos uso com supervisão de responsável.</p>';

    html += '<h3>5. Os teus direitos</h3>';
    html += '<ul>';
    html += '<li><strong>Acesso e portabilidade:</strong> tudo já está no teu dispositivo (<code>localStorage</code>) — podes inspecionar via DevTools.</li>';
    html += '<li><strong>Apagar:</strong> botão "Recomeçar do Zero" no Perfil apaga tudo localmente. Para dados na Liga Global, escreve para o e-mail abaixo.</li>';
    html += '<li><strong>Opt-out da Liga Global:</strong> desativa quando quiseres no menu. Ao apagar localmente, paramos de enviar.</li>';
    html += '</ul>';

    html += '<h3>6. Compartilhamento com terceiros</h3>';
    html += '<p>Nenhum. Os dados anónimos da Liga Global ficam apenas em base própria (Supabase) e não são vendidos, partilhados ou cedidos.</p>';

    html += '<h3>7. Segurança</h3>';
    html += '<p>HTTPS obrigatório. Banco com Row Level Security (RLS). Service Role nunca exposto ao cliente. Anti-cheat server-side no Torneio.</p>';

    html += '<h3>8. Mudanças nesta política</h3>';
    html += '<p>Atualizações entram em vigor com a próxima versão pública. A data acima é a referência.</p>';

    html += '<p class="info-meta">Encarregado de Proteção de Dados (DPO): Filipe Buba N\'hada · <a href="mailto:flifnhada@hotmail.com">flifnhada@hotmail.com</a></p>';
    html += '</div>';
    return html;
  }

  function rTerms() {
    var html = infoBackBtn();
    html += '<div class="info-page">';
    html += '<h2>Termos de Uso</h2>';
    html += '<p><em>Última atualização: 8 de maio de 2026.</em></p>';

    html += '<h3>1. Sobre o serviço</h3>';
    html += '<p>Sankofa — Fragmentos da África é um jogo digital educativo, gratuito e open source, baseado nos 8 volumes da <strong>História Geral da África</strong> (UNESCO). Funciona offline como Progressive Web App.</p>';

    html += '<h3>2. Licenças</h3>';
    html += '<ul>';
    html += '<li><strong>Código-fonte:</strong> licença <strong>MIT</strong> — usa, modifica, distribui livremente, inclusive para fins comerciais. Veja <code>LICENSE</code> no repositório GitHub.</li>';
    html += '<li><strong>Conteúdo educacional</strong> (enigmas, textos, fragmentos): <strong>Creative Commons BY-SA 4.0</strong> — partilha desde que cite a autoria e mantenha a mesma licença.</li>';
    html += '<li><strong>Áudio sintetizado:</strong> original do projeto, livre.</li>';
    html += '</ul>';

    html += '<h3>3. Atribuição UNESCO — História Geral da África</h3>';
    html += '<p>Sankofa é uma <strong>obra derivada</strong> baseada em fatos e narrativas históricas da coleção <em>General History of Africa</em> (Volumes I–VIII), publicada pela UNESCO entre 1981 e 1993, organizada pelo Comitê Científico Internacional para a Redação de uma História Geral da África.</p>';
    html += '<p><strong>Atribuição formal:</strong></p>';
    html += '<blockquote style="border-left:3px solid var(--gold);padding:8px 14px;margin:8px 0;background:var(--surface2);border-radius:0 8px 8px 0;font-size:.88rem">UNESCO &amp; International Scientific Committee for the Drafting of a General History of Africa (1981–1993). <em>General History of Africa</em>, Volumes I–VIII. Paris: UNESCO Publishing. Licenciado sob Creative Commons CC BY-SA IGO 3.0 (texto).</blockquote>';
    html += '<p><strong>Disclaimer obrigatório (UNESCO CC BY-SA IGO):</strong></p>';
    html += '<blockquote style="border-left:3px solid var(--terra);padding:8px 14px;margin:8px 0;background:var(--surface2);border-radius:0 8px 8px 0;font-size:.88rem">The present work is not an official UNESCO publication and shall not be considered as such. <br><em>(Esta obra não é uma publicação oficial da UNESCO e não deve ser considerada como tal.)</em></blockquote>';
    html += '<p>Conformidade adicional com os termos UNESCO IGO:</p>';
    html += '<ul>';
    html += '<li>Sankofa <strong>não usa o logotipo UNESCO</strong>.</li>';
    html += '<li>Sankofa <strong>não usa fotografias</strong> da publicação original (a licença CC BY-SA cobre apenas o texto).</li>';
    html += '<li>Sankofa adota a <strong>mesma família de licença</strong> (CC BY-SA 4.0) para o conteúdo derivado.</li>';
    html += '<li>O autor de Sankofa assume <strong>responsabilidade integral</strong> pelas adaptações, e isenta a UNESCO de qualquer dano resultante deste uso.</li>';
    html += '<li>O conteúdo é apresentado para fins educativos, sem prejuízo à reputação da UNESCO ou dos autores originais.</li>';
    html += '</ul>';

    html += '<h3>4. Idade mínima</h3>';
    html += '<p>Recomendado para 10 anos ou mais. Crianças entre 8-12 podem jogar com supervisão. Para menores de 18, o uso da Liga Global pública requer ciência do responsável.</p>';

    html += '<h3>5. Conduta esperada</h3>';
    html += '<ul>';
    html += '<li>Sem apelidos ou tags ofensivos. Há blocklist automática; reportes manuais podem chegar.</li>';
    html += '<li>Sem tentativas de fraudar o ranking ou a pontuação. Anti-cheat server-side ativo.</li>';
    html += '<li>Sem extração massiva de conteúdo via scraping — usa o repositório aberto.</li>';
    html += '</ul>';

    html += '<h3>6. Disponibilidade</h3>';
    html += '<p>O jogo é fornecido "como está" (<em>as-is</em>). Não garantimos disponibilidade contínua, embora façamos o melhor esforço. Liga Global e Torneio dependem do Supabase; em caso de indisponibilidade, o modo offline solo continua a funcionar.</p>';

    html += '<h3>6.1. Doações financeiras</h3>';
    html += '<p>Sankofa aceita apoio financeiro voluntário em três modalidades:</p>';
    html += '<ul>';
    html += '<li><strong>PIX — Conta empresa:</strong> chave CNPJ <code>62.823.295/0001-53</code> — DATACENTER VISION LTDA. Recibo formal disponível por solicitação.</li>';
    html += '<li><strong>PIX — Conta mantenedor:</strong> chave e-mail <code>flifnhada@hotmail.com</code> — Filipe Buba N\'hada (autor). Sem recibo formal.</li>';
    html += '<li><strong>Wise e PayPal — Internacional:</strong> mesmo e-mail acima — para apoiadores fora do Brasil. Aceita múltiplas moedas (USD, EUR, GBP, etc.).</li>';
    html += '</ul>';
    html += '<p>As doações são <strong>voluntárias</strong>, <strong>não geram obrigação contratual</strong>, <strong>não dão direito a recursos exclusivos</strong> nem alteram acesso ao jogo (que permanece gratuito para todos). Os recursos são alocados em infraestrutura (Vercel, Supabase, registro de domínio sankofahga.com) e tempo de desenvolvimento. Recibos para fins de comprovação na conta empresa podem ser solicitados ao e-mail abaixo, com data e valor da transferência.</p>';

    html += '<h3>7. Limitação de responsabilidade</h3>';
    html += '<p>O Sankofa é um material educativo. Não substitui currículo escolar oficial. Não nos responsabilizamos por usos indevidos ou interpretações fora do contexto histórico apresentado.</p>';

    html += '<h3>8. Conformidade</h3>';
    html += '<ul>';
    html += '<li>Lei <strong>10.639/03</strong> e <strong>11.645/08</strong> (História e Cultura Afro-Brasileira e Indígena).</li>';
    html += '<li>Lei <strong>13.709/18</strong> (LGPD).</li>';
    html += '<li>WCAG <strong>2.1 nível AA</strong> (acessibilidade).</li>';
    html += '</ul>';

    html += '<h3>9. Contacto e foro</h3>';
    html += '<p>Dúvidas: <a href="mailto:flifnhada@hotmail.com">flifnhada@hotmail.com</a>. Foro: comarca de São Paulo / SP, Brasil.</p>';
    html += '</div>';
    return html;
  }

  function rAbout() {
    var html = infoBackBtn();
    html += '<div class="info-page">';
    html += '<h2>Sobre o Sankofa</h2>';
    html += '<p><em>"Sankofa" vem do povo Acano-Axanti (Gana) e significa "volte e busque". O símbolo — um pássaro que olha para trás enquanto voa em frente — guia o tom do projeto: recuperar o que foi apagado, distorcido ou esquecido.</em></p>';

    html += '<h3>O que é</h3>';
    html += '<p>Jogo digital educativo de enigmas baseado nos <strong>8 volumes</strong> da <em>História Geral da África</em> da UNESCO. <strong>71 enigmas</strong> validados, distribuídos em 8 mundos (Origens → Luta e Liberdade), cobrindo Volumes I a VIII.</p>';

    html += '<h3>Por que existe</h3>';
    html += '<p>A Lei 10.639/03 obriga o ensino de História da África há 22 anos. O conteúdo da UNESCO existe há décadas. Mas falta um material lúdico, mobile-first, gratuito e que respeite a perspectiva afrocentrada. Sankofa preenche essa lacuna.</p>';

    html += '<h3>Autor</h3>';
    html += '<p><strong>Filipe Buba N\'hada</strong> · Engenheiro de Software · Bacharel em Humanidades (UNILAB) · Licenciado em Ciências Sociais (UNILAB) · Graduado em Ciência da Computação (Faculdade Impacta).</p>';
    html += '<ul>';
    html += '<li>📧 <a href="mailto:flifnhada@hotmail.com">flifnhada@hotmail.com</a></li>';
    html += '<li>🔗 <a href="https://www.linkedin.com/in/filipe-buba/" target="_blank" rel="noopener">linkedin.com/in/filipe-buba</a></li>';
    html += '<li>🌐 <a href="https://www.sankofahga.com" target="_blank" rel="noopener">www.sankofahga.com</a></li>';
    html += '<li>🐙 <a href="https://github.com/filipebuba/sankofa" target="_blank" rel="noopener">github.com/filipebuba/sankofa</a></li>';
    html += '</ul>';

    html += '<h3>Fontes &amp; Atribuição</h3>';
    html += '<p>Sankofa adapta fatos e narrativas históricas da coleção:</p>';
    html += '<blockquote style="border-left:3px solid var(--gold);padding:8px 14px;margin:8px 0;background:var(--surface2);border-radius:0 8px 8px 0;font-size:.9rem">UNESCO &amp; International Scientific Committee for the Drafting of a General History of Africa. <em>General History of Africa</em>, Volumes I–VIII (1981–1993). Paris: UNESCO Publishing. Texto original sob <strong>Creative Commons CC BY-SA IGO 3.0</strong>.</blockquote>';
    html += '<p>Acesso gratuito ao original: <a href="https://www.unesco.org/en/general-history-africa" target="_blank" rel="noopener">unesco.org/en/general-history-africa</a> · Repositório UNESDOC: <a href="https://unesdoc.unesco.org" target="_blank" rel="noopener">unesdoc.unesco.org</a>.</p>';
    html += '<p style="font-size:.84rem;color:var(--text-muted);font-style:italic;border-top:1px solid var(--surface3);padding-top:10px;margin-top:14px"><strong>Disclaimer:</strong> The present work is not an official UNESCO publication and shall not be considered as such. (Esta obra não é uma publicação oficial da UNESCO e não deve ser considerada como tal.)</p>';

    html += '<h3>Alinhamentos institucionais</h3>';
    html += '<ul>';
    html += '<li>Década Internacional dos Afrodescendentes 2025–2034 (ONU/UNESCO).</li>';
    html += '<li>Lei 10.639/03 e 11.645/08 (Brasil) — História e Cultura Afro-Brasileira e Indígena.</li>';
    html += '<li>ODS 4 (Educação de Qualidade) e ODS 10 (Redução das Desigualdades).</li>';
    html += '</ul>';

    html += '<h3>' + t("about.translations") + '</h3>';
    html += '<p>' + t("about.translations_status") + '</p>';
    html += '<p style="font-size:.84rem;color:var(--text-dim)">' + t("about.translations_note") + '</p>';

    html += '<h3>Stack</h3>';
    html += '<p>Vanilla JS, Web Audio API, PWA Service Worker. Sem framework, sem build step. Backend opt-in via Supabase (RLS + Edge Functions). Hospedado no Vercel.</p>';

    html += '<h3>' + t("about.support") + '</h3>';
    html += '<p>Sankofa é gratuito, sem ads, sem venda de dados. Servidor + domínio + tempo de manutenção saem do bolso do autor. Apoio voluntário em três modalidades:</p>';
    html += '<ul style="font-size:.9rem">';
    html += '<li><strong>PIX (CNPJ):</strong> <code style="font-family:\'Atkinson Hyperlegible\',ui-monospace,monospace;color:var(--gold);user-select:all">62.823.295/0001-53</code> · Datacenter Vision Ltda · com recibo</li>';
    html += '<li><strong>PIX (e-mail):</strong> <code style="font-family:\'Atkinson Hyperlegible\',ui-monospace,monospace;color:var(--gold);user-select:all">flifnhada@hotmail.com</code> · com QR Code</li>';
    html += '<li><strong>Wise / PayPal:</strong> mesmo e-mail acima · para apoiadores fora do Brasil</li>';
    html += '</ul>';
    html += '<p style="font-size:.84rem;color:var(--text-muted)">Mais detalhes na página <button class="link-btn" data-act="go-contribute" style="background:none;border:none;color:var(--gold);cursor:pointer;text-decoration:underline;font:inherit">Contribuir</button>.</p>';

    html += '<p class="info-meta">Versão atual: <strong>v' + (window.SANKOFA_VERSION || "?") + '</strong>.</p>';
    html += '</div>';
    return html;
  }

  function rAccessibility() {
    var html = infoBackBtn();
    html += '<div class="info-page">';
    html += '<h2>Declaração de Acessibilidade</h2>';
    html += '<p>O Sankofa adopta as <strong>Web Content Accessibility Guidelines (WCAG) 2.1 nível AA</strong> como referência mínima. Trabalhamos para chegar a AAA onde for tecnicamente viável.</p>';

    html += '<h3>Recursos disponíveis</h3>';
    html += '<ul>';
    html += '<li><strong>Tamanho do texto regulável</strong> em 5 níveis (90%, 100%, 115%, 130%, 150%) via menu ☰ ou atalhos de teclado <code>+</code> / <code>−</code> / <code>0</code>.</li>';
    html += '<li><strong>Pinch-to-zoom</strong> mobile (até 500%).</li>';
    html += '<li><strong>Síntese de voz (TTS)</strong> em PT-BR via Web Speech API. Lê a pergunta e o contexto a pedido.</li>';
    html += '<li><strong>Tema claro (papiro)</strong> e <strong>escuro</strong>; respeita <code>prefers-color-scheme</code> do sistema.</li>';
    html += '<li>Contraste <strong>AA garantido</strong>: texto principal ≥ 14:1, secundário ≥ 5:1.</li>';
    html += '<li>Fonte <strong>Atkinson Hyperlegible</strong> — desenhada para baixa visão pelo Braille Institute.</li>';
    html += '<li>Alvos de toque ≥ <strong>44×44 px</strong> (WCAG 2.5.5).</li>';
    html += '<li>Navegação completa por <strong>Tab</strong>, com anel de foco dourado visível.</li>';
    html += '<li>Atalhos no enigma: <code>A</code>, <code>B</code>, <code>C</code>, <code>D</code> selecionam respostas.</li>';
    html += '<li><code>Esc</code> fecha menus e diálogos.</li>';
    html += '<li>Feedback visual sempre acompanha o feedback sonoro (toasts, animações).</li>';
    html += '<li><code>aria-live</code> em zonas dinâmicas (toasts, ranking).</li>';
    html += '</ul>';

    html += '<h3>Modo "erro sem punição"</h3>';
    html += '<p>Errar não bloqueia o jogo. Cria-se uma entrada no <strong>Caderno de Revisão</strong> e o jogador volta quando quiser. Pular um enigma após 2 erros é permitido (+5 pts piedade), sem custo.</p>';

    html += '<h3>O que ainda falta</h3>';
    html += '<ul>';
    html += '<li>Validação manual com leitores de tela (NVDA, VoiceOver, TalkBack) — em curso.</li>';
    html += '<li>Tradução para Libras (sinalização em vídeo) — fase futura.</li>';
    html += '<li>Modo "alto contraste extremo" para baixa visão grave — fase futura.</li>';
    html += '</ul>';

    html += '<h3>Reportar barreira</h3>';
    html += '<p>Encontrou uma barreira de acessibilidade? Escreva para <a href="mailto:flifnhada@hotmail.com">flifnhada@hotmail.com</a> com prints, modelo de dispositivo e tecnologia assistiva usada. Respondemos em até 7 dias úteis.</p>';

    html += '<p class="info-meta">Esta declaração refere-se à versão v' + (window.SANKOFA_VERSION || "?") + '. Próxima auditoria prevista: jul/2026.</p>';
    html += '</div>';
    return html;
  }

  function rFeedback() {
    var html = infoBackBtn();
    html += '<div class="info-page">';
    html += '<h2>💬 Enviar Feedback</h2>';
    html += '<p>Sankofa está em construção contínua. <strong>O teu feedback molda o que vem a seguir.</strong> Bug, sugestão, elogio, dúvida — manda. Sem fricção, sem cadastro.</p>';

    html += '<form id="feedback-form" onsubmit="return false" novalidate>';

    // Tipo
    html += '<div class="fb-field">';
    html += '<label class="fb-label">Tipo de mensagem</label>';
    html += '<div class="fb-radios" role="radiogroup" aria-label="Tipo de feedback">';
    var types = [
      { id: "bug", label: "🐛 Bug", desc: "Algo quebrou" },
      { id: "suggestion", label: "💡 Sugestão", desc: "Ideia para melhorar" },
      { id: "praise", label: "🙏 Elogio", desc: "Algo que gostou" },
      { id: "question", label: "❓ Pergunta", desc: "Quero saber" },
      { id: "enigma", label: "📚 Conteúdo", desc: "Sobre um enigma específico" }
    ];
    for (var ti = 0; ti < types.length; ti++) {
      var t = types[ti];
      html += '<label class="fb-radio">';
      html += '<input type="radio" name="fb-type" value="' + t.id + '"' + (ti === 1 ? " checked" : "") + '>';
      html += '<span><strong>' + t.label + '</strong><small>' + t.desc + '</small></span>';
      html += '</label>';
    }
    html += '</div></div>';

    // Mensagem
    html += '<div class="fb-field">';
    html += '<label class="fb-label" for="fb-msg">Mensagem <span style="color:var(--danger)">*</span></label>';
    html += '<textarea id="fb-msg" class="fb-textarea" rows="6" maxlength="4000" minlength="5" required placeholder="Descreve o que aconteceu, o que sugeres, ou o que te tocou. Quanto mais específico, melhor."></textarea>';
    html += '<div class="fb-counter"><span id="fb-counter">0</span>/4000</div>';
    html += '</div>';

    // Contato opcional
    html += '<div class="fb-field">';
    html += '<label class="fb-label" for="fb-contact">Contato <small style="color:var(--text-muted)">(opcional, só se quiseres resposta)</small></label>';
    html += '<input type="text" id="fb-contact" class="fb-input" maxlength="120" placeholder="email ou WhatsApp — em branco = anônimo">';
    html += '<small class="fb-hint">Não partilhamos. Usado só para te responder, se for o caso.</small>';
    html += '</div>';

    // Submit
    html += '<div class="fb-actions">';
    html += '<button id="fb-submit" type="button" class="btn btn-gold btn-block" data-act="submit-feedback">Enviar feedback</button>';
    html += '<small style="display:block;text-align:center;color:var(--text-muted);margin-top:8px">Ou escreve direto: <a href="mailto:flifnhada@hotmail.com?subject=Sankofa%20feedback">flifnhada@hotmail.com</a></small>';
    html += '</div>';

    html += '</form>';

    html += '<p class="info-meta">Os feedbacks anônimos vão para a base privada do projeto. Não são partilhados, vendidos ou indexados. Apenas o autor lê e responde.</p>';
    html += '</div>';
    return html;
  }

  function rContribute() {
    var html = infoBackBtn();
    var v = window.SANKOFA_VERSION || "?";
    html += '<div class="info-page">';
    html += '<h2>🤝 Como contribuir com Sankofa</h2>';
    html += '<p>Sankofa é open source, gratuito e sustentado por entusiasmo. <strong>Cada gesto ajuda.</strong> Escolhe o que cabe em ti hoje:</p>';

    html += '<div style="background:var(--surface2);border:1px solid var(--surface3);border-radius:12px;padding:14px 16px;margin:14px 0;font-size:.86rem;color:var(--text-dim)">';
    html += '<strong style="color:var(--gold)">Sobre o código-fonte</strong><br>';
    html += 'O repositório é público (transparência total: qualquer pessoa pode ler, auditar, baixar). ';
    html += 'Mas Sankofa está em fase de <strong>estabilização inicial</strong>: contribuições externas (Pull Requests, forks colaborativos) <strong>ainda não estão sendo aceitas</strong>. ';
    html += 'Quando a base estiver madura, abriremos o processo. Por enquanto: <strong>feedback estruturado</strong> é o canal certo.';
    html += '</div>';

    html += '<h3>💬 Mandar feedback</h3>';
    html += '<p>O canal principal para sugestões, bugs, ideias de enigmas, críticas. Lido pessoalmente, todo o feedback molda a próxima versão.</p>';
    html += '<button class="btn btn-gold btn-block" data-act="go-feedback" style="margin-top:6px">💬 Abrir formulário</button>';

    html += '<h3>📲 Compartilhar</h3>';
    html += '<p>Manda para uma professora, um aluno, um amigo. O melhor marketing é boca-a-boca.</p>';
    html += '<button class="btn btn-outline btn-block" data-act="share-wa" style="margin-top:6px">📲 Partilhar no WhatsApp</button>';

    html += '<h3>👀 Acompanhar o desenvolvimento</h3>';
    html += '<p>Ver o código, o histórico, as licenças, ou apenas seguir a evolução do projeto.</p>';
    html += '<a class="btn btn-outline btn-block" href="https://github.com/filipebuba/sankofa" target="_blank" rel="noopener" style="margin-top:6px">🐙 Ver repositório (somente leitura)</a>';

    html += '<h3>📚 Validar conteúdo histórico</h3>';
    html += '<p>És professor(a), historiador(a), educador(a) afrocentrado(a)? <strong>Lê 5 enigmas e diz onde melhorar.</strong> Crédito como revisor(a) acadêmico no produto + carta formal de colaboração.</p>';
    html += '<a class="btn btn-outline btn-block" href="mailto:flifnhada@hotmail.com?subject=Sankofa%20%E2%80%94%20valida%C3%A7%C3%A3o%20de%20conte%C3%BAdo%20HGA" style="margin-top:6px">✉ Quero validar enigmas</a>';

    html += '<h3>🏫 Levar Sankofa à tua escola</h3>';
    html += '<p>Pilotos gratuitos de 90 dias para escolas públicas e privadas. Painel do professor + relatórios + capacitação. Cumpre Lei 10.639/03.</p>';
    html += '<a class="btn btn-outline btn-block" href="mailto:flifnhada@hotmail.com?subject=Sankofa%20%E2%80%94%20piloto%20em%20escola" style="margin-top:6px">🏫 Falar sobre piloto escolar</a>';

    html += '<h3>💛 Apoiar com PIX</h3>';
    html += '<p>Sankofa não tem ads, não vende dados, não cobra acesso. Servidor + domínio + tempo de desenvolvimento saem do bolso do autor. Qualquer valor ajuda a manter o jogo gratuito e online.</p>';
    html += '<p style="font-size:.86rem;color:var(--text-dim)">Duas opções — escolhe a que preferires:</p>';

    // OPÇÃO 1 — CNPJ (recomendado para fins fiscais / comprovantes)
    html += '<div class="pix-card">';
    html += '<div class="pix-card-head"><strong>Opção 1 · CNPJ</strong> <span class="pix-tag">Recomendado para empresas, escolas, recibo</span></div>';
    html += '<div class="pix-row"><span class="pix-label">Chave PIX</span><code class="pix-key">62.823.295/0001-53</code></div>';
    html += '<div class="pix-row"><span class="pix-label">Titular</span><span class="pix-val">DATACENTER VISION LTDA</span></div>';
    html += '<button class="btn btn-gold btn-block" data-act="copy-pix-cnpj" style="margin-top:10px">📋 Copiar chave CNPJ</button>';
    html += '<p class="pix-hint">App do banco → PIX → "Copia e cola" → cola a chave → valor → confirma. Recibos para fins fiscais sob solicitação ao e-mail abaixo.</p>';
    html += '</div>';

    // OPÇÃO 2 — Pessoal (QR escaneável)
    html += '<div class="pix-card pix-card-alt" style="margin-top:14px">';
    html += '<div class="pix-card-head"><strong>Opção 2 · E-mail (mantenedor)</strong> <span class="pix-tag">QR Code, mais rápido no celular</span></div>';
    html += '<div class="pix-row"><span class="pix-label">Chave PIX</span><code class="pix-key">flifnhada@hotmail.com</code></div>';
    html += '<div class="pix-row"><span class="pix-label">Titular</span><span class="pix-val">Filipe Buba N\'hada</span></div>';
    html += '<div class="pix-qr-wrap"><img class="pix-qr-img" src="assets/pix-qr-pessoal.jpg" alt="QR Code PIX para a conta do mantenedor (e-mail flifnhada@hotmail.com)" loading="lazy"></div>';
    html += '<button class="btn btn-outline btn-block" data-act="copy-pix-personal" style="margin-top:10px">📋 Copiar chave (e-mail)</button>';
    html += '<p class="pix-hint">App do banco → PIX → escanear QR (apontar a câmera) ou "Copia e cola" da chave acima.</p>';
    html += '</div>';

    // OPÇÃO 3 — Internacional (Wise + PayPal)
    html += '<div class="pix-card pix-card-alt" style="margin-top:14px">';
    html += '<div class="pix-card-head"><strong>Opção 3 · Internacional</strong> <span class="pix-tag">Para apoiadores fora do Brasil</span></div>';
    html += '<div class="pix-row"><span class="pix-label">Wise / PayPal</span><code class="pix-key">flifnhada@hotmail.com</code></div>';
    html += '<div class="pix-row"><span class="pix-label">Titular</span><span class="pix-val">Filipe Buba N\'hada</span></div>';
    html += '<div class="pix-intl-row" style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">';
    html += '<a class="btn btn-outline" href="https://wise.com/send" target="_blank" rel="noopener" style="flex:1;min-width:140px">🌐 Wise</a>';
    html += '<a class="btn btn-outline" href="https://www.paypal.com/donate/?business=flifnhada%40hotmail.com&item_name=Apoio+ao+Sankofa&currency_code=BRL" target="_blank" rel="noopener" style="flex:1;min-width:140px">💳 PayPal</a>';
    html += '</div>';
    html += '<button class="btn btn-ghost btn-sm btn-block" data-act="copy-pix-personal" style="margin-top:8px">📋 Copiar e-mail</button>';
    html += '<p class="pix-hint">Wise: envia em qualquer moeda (USD, EUR, GBP…) com taxa baixa. PayPal: cartão de crédito ou saldo direto. Ambos para a conta do mantenedor.</p>';
    html += '</div>';

    html += '<p style="font-size:.78rem;color:var(--text-muted);margin-top:14px"><strong>Transparência fiscal:</strong> opção CNPJ (PIX) vai para a empresa do mantenedor (Datacenter Vision Ltda) e gera recibo formal. Opções e-mail (PIX, Wise, PayPal) vão para a conta pessoal do mantenedor — úteis para apoios pequenos ou doadores fora do Brasil, sem necessidade de comprovante. Em todos os casos os recursos cobrem infraestrutura (Vercel, Supabase, domínio sankofahga.com) e tempo de manutenção. Doações são voluntárias, sem contrapartida material.</p>';

    html += '<h3>🤝 Patrocínio institucional / ESG</h3>';
    html += '<p>Empresas, ONGs, secretarias: pacotes de R$ 50k a R$ 1M+ com selo "Apresentado por…". Métricas auditáveis para relatórios ESG / GRI / ODS 4 e 10. Década dos Afrodescendentes 2025–2034.</p>';
    html += '<a class="btn btn-outline btn-block" href="mailto:flifnhada@hotmail.com?subject=Sankofa%20%E2%80%94%20patroc%C3%ADnio%20institucional" style="margin-top:6px">🤝 Conversar sobre patrocínio</a>';

    html += '<h3>🌍 Traduzir</h3>';
    html += '<p>Roadmap inclui EN / FR / ES (PALOP francófonos, diáspora EUA, América Latina). Falas outra língua e queres ajudar? Avisa.</p>';
    html += '<a class="btn btn-outline btn-block" href="mailto:flifnhada@hotmail.com?subject=Sankofa%20%E2%80%94%20tradu%C3%A7%C3%A3o" style="margin-top:6px">🌍 Quero traduzir</a>';

    html += '<p class="info-meta">Sankofa v' + v + ' · MIT (código) · CC BY-SA 4.0 (conteúdo) · <a href="https://github.com/filipebuba/sankofa" target="_blank" rel="noopener">github.com/filipebuba/sankofa</a></p>';
    html += '</div>';
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
    // Escopo restrito a #app: elementos fora (drawer, banner) gerenciam próprios listeners
    // e persistem entre renders — query global causaria múltiplos listeners.
    var root = document.getElementById("app");
    var els = (root || document).querySelectorAll("[data-act]");
    for (var i = 0; i < els.length; i++) els[i].addEventListener("click", handleAction);
    var ni = document.getElementById("name-input");
    if (ni) {
      ni.addEventListener("keydown", function (e) { if (e.key === "Enter") handleRegister(); });
      if (S.name) ni.value = S.name;
      setTimeout(function () { ni.focus(); }, 350);
    }
    // Feedback form: contador de caracteres
    var fbMsg = document.getElementById("fb-msg");
    var fbCounter = document.getElementById("fb-counter");
    if (fbMsg && fbCounter) {
      var updateCounter = function () { fbCounter.textContent = String(fbMsg.value.length); };
      fbMsg.addEventListener("input", updateCounter);
      updateCounter();
      // Lembra a tela anterior para anexar ao feedback
      // (S.screenData passou pelo goTo; usamos S.screen como fallback)
    }
  }

  function handleKey(e) {
    // Atalhos globais de zoom — funcionam em qualquer tela. Pulam quando há
    // input/textarea focado para não brigar com digitação.
    var tgt = e.target;
    var inField = tgt && (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA" || tgt.isContentEditable);
    if (!inField && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.key === "+" || e.key === "=") { e.preventDefault(); changeTextScale(+1); return; }
      if (e.key === "-" || e.key === "_") { e.preventDefault(); changeTextScale(-1); return; }
      if (e.key === "0") { e.preventDefault(); resetTextScale(); return; }
    }

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
        // Karma gate: se mundo anterior tem muito pendente no Caderno, mostra tela dos Anciãos
        if (wId > 1) {
          var karma = getWorldKarma(wId - 1);
          if (karma.level === "block" && !S.screenData.karmaWaved) {
            sfx("navigate");
            goTo("karma-gate", { world: wId, prevWorld: wId - 1 });
            break;
          }
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
      case "skip-enigma": handleSkipEnigma(el.getAttribute("data-e")); break;
      case "karma-insist": {
        var iw = parseInt(el.getAttribute("data-w"), 10);
        var cost = 50;
        if ((S.cauris || 0) < cost) {
          showToast("◉", "Cauris insuficientes", "Faltam " + (cost - (S.cauris || 0)) + " cauris pra insistir. Resolva 1 do Caderno.");
          break;
        }
        S.cauris = (S.cauris || 0) - cost;
        sfx("achievement");
        save();
        showToast("🌳", "Os anciãos suspiram", "−" + cost + " cauris. Que a sabedoria te alcance no caminho.");
        // Vai direto pro mundo, ignorando gate desta vez
        S.lastWorldPlayed = iw;
        save();
        S.screenData = { karmaWaved: true };
        goTo("world", { world: iw, karmaWaved: true });
        break;
      }
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
      case "edit-profile": handleEditProfile(); break;
      case "share-wa": handleShareWhatsApp(); break;
      case "share-link": handleShareLink(); break;
      case "tts-toggle": handleTTSToggle(); break;
      case "text-smaller": if (changeTextScale(-1)) { sfx("click"); render(); } break;
      case "text-larger": if (changeTextScale(+1)) { sfx("click"); render(); } break;
      case "go-info-hub": sfx("navigate"); goTo("info-hub"); break;
      case "go-help": sfx("navigate"); goTo("help"); break;
      case "go-privacy": sfx("navigate"); goTo("privacy"); break;
      case "go-terms": sfx("navigate"); goTo("terms"); break;
      case "go-about": sfx("navigate"); goTo("about"); break;
      case "go-accessibility": sfx("navigate"); goTo("accessibility"); break;
      case "go-feedback": sfx("navigate"); goTo("feedback"); break;
      case "go-contribute": sfx("navigate"); goTo("contribute"); break;
      case "submit-feedback": handleSubmitFeedback(); break;
      case "copy-pix": handleCopyPix("62.823.295/0001-53", "Chave CNPJ copiada"); break;
      case "copy-pix-cnpj": handleCopyPix("62.823.295/0001-53", "Chave CNPJ copiada"); break;
      case "copy-pix-personal": handleCopyPix("flifnhada@hotmail.com", "Chave e-mail copiada"); break;
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
      solved: S.solved || [],
      tag: S.tag || ""
    };
  }

  // Liga Global: o `handle` é PK na tabela `league_scores`.
  // Para evitar colisão entre dois jogadores com o mesmo nome (ex: "Maria"
  // em duas turmas), suffixamos com 6 chars do profile_uid local.
  // O sufixo é estável por dispositivo/perfil — re-submits do mesmo jogador
  // continuam fazendo upsert na mesma linha.
  function leagueHandleFor(name) {
    var raw = (name || "Viajante").toString().trim().slice(0, 20);
    var uid = (PROFILES && PROFILES.activeId()) || "default";
    var uid6 = uid.replace(/^p/, "").slice(0, 6) || "anon00";
    return raw + "·" + uid6;
  }

  // Para exibição: tira o sufixo `·xxxxxx` que serve só de tie-breaker.
  function displayHandle(h) {
    if (!h) return "";
    var ix = String(h).lastIndexOf("·");
    return ix > 0 ? String(h).slice(0, ix) : String(h);
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
    var ordinals = ["primeira", "segunda", "terceira", "quarta", "quinta", "sexta"];
    var parts = [];
    if (en.title) parts.push(en.title + ".");
    if (en.intro) parts.push(en.intro);
    // Contexto NÃO entra aqui — só lido se jogador abrir "Queres saber mais?"
    if (en.question) parts.push(en.question);
    parts.push("Opções de resposta.");
    en.options.forEach(function (o, i) {
      var label = ordinals[i] ? "Opção " + ordinals[i] : "Opção " + (i + 1);
      parts.push(label + ". " + o + ".");
    });
    if (window.SankofaTTS.speakSequence) window.SankofaTTS.speakSequence(parts);
    else window.SankofaTTS.speak(parts.join(". "));
  }

  function speakContext(eid) {
    if (!window.SankofaTTS || !window.SankofaTTS.available()) return;
    var en = getEnigma(eid);
    if (!en || !en.context) return;
    window.SankofaTTS.speak(en.context);
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
    var handle = leagueHandleFor(S.name);
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

  function handleCopyPix(key, title) {
    key = key || "62.823.295/0001-53";
    title = title || "Chave copiada";
    function done(ok) {
      if (ok) { sfx("achievement"); showToast("💛", title, "Cola no PIX do teu banco. Obrigado!"); }
      else { sfx("wrong"); showToast("⚠️", "Não copiou", "Copia manualmente: " + key); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(key).then(function () { done(true); }, function () { done(false); });
    } else {
      try {
        var ta = document.createElement("textarea");
        ta.value = key; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); document.body.removeChild(ta);
        done(true);
      } catch (e) { done(false); }
    }
  }

  function handleSubmitFeedback() {
    var msgEl = document.getElementById("fb-msg");
    var contactEl = document.getElementById("fb-contact");
    var btn = document.getElementById("fb-submit");
    if (!msgEl) return;

    var typeRadio = document.querySelector('input[name="fb-type"]:checked');
    var typeVal = typeRadio ? typeRadio.value : "suggestion";
    var msgVal = (msgEl.value || "").trim();
    var contactVal = (contactEl && contactEl.value || "").trim().slice(0, 120);

    if (msgVal.length < 5) {
      showToast("⚠️", "Mensagem curta", "Escreve pelo menos 5 caracteres.");
      msgEl.focus();
      return;
    }
    if (msgVal.length > 4000) {
      showToast("⚠️", "Mensagem longa", "Máximo 4000 caracteres.");
      return;
    }

    var cfg = window.SANKOFA_LEAGUE_CONFIG || null;
    var endpoint = cfg && cfg.url ? (cfg.url + "/rest/v1/feedback") : null;
    var payload = {
      type: typeVal,
      message: msgVal,
      screen: (S.lastScreenBeforeFeedback || S.screen || "feedback"),
      contact: contactVal || null,
      age_band: S.ageBand || null,
      app_version: window.SANKOFA_VERSION || null,
      ua: (navigator.userAgent || "").slice(0, 240),
      url_ref: (function () {
        try { return new URLSearchParams(location.search).get("ref") || null; }
        catch (e) { return null; }
      })()
    };

    if (btn) { btn.disabled = true; btn.textContent = "Enviando..."; }

    function onSuccess() {
      sfx("achievement");
      showToast("💛", "Obrigado!", "Recebido. Cada palavra ajuda Sankofa a crescer.");
      msgEl.value = "";
      if (contactEl) contactEl.value = "";
      var ctr = document.getElementById("fb-counter");
      if (ctr) ctr.textContent = "0";
      if (btn) { btn.disabled = false; btn.textContent = "Enviar feedback"; }
    }

    function onFailure(reason) {
      sfx("wrong");
      var subject = encodeURIComponent("Sankofa feedback (" + typeVal + ")");
      var body = encodeURIComponent(msgVal + (contactVal ? "\n\nContato: " + contactVal : ""));
      showToast("⚠️", "Não enviou online", "Abrindo e-mail como alternativa.");
      window.location.href = "mailto:flifnhada@hotmail.com?subject=" + subject + "&body=" + body;
      if (btn) { btn.disabled = false; btn.textContent = "Enviar feedback"; }
    }

    if (!endpoint || !cfg.anonKey) return onFailure("no-config");

    fetch(endpoint, {
      method: "POST",
      headers: {
        "apikey": cfg.anonKey,
        "Authorization": "Bearer " + cfg.anonKey,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (r.ok) onSuccess();
      else onFailure("status-" + r.status);
    }).catch(function (e) {
      onFailure(String(e));
    });
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

  function handleEditProfile() {
    if (!window.SankofaProfileModal) {
      // Fallback: prompt simples só para tag, melhor que nada.
      var t = prompt("Nova tag de grupo (ex: #Turma7A). Vazio remove.", S.tag || "");
      if (t == null) return;
      S.tag = (PROFILES && PROFILES.normalizeTag) ? PROFILES.normalizeTag(t) : t.trim();
      save();
      resubmitToLeagueIfOptedIn();
      showToast("✏️", "Perfil atualizado", S.tag ? ("Grupo: " + S.tag) : "Sem grupo.");
      render();
      return;
    }
    var houseId = (S.house && S.house.id) || "";
    window.SankofaProfileModal.open({
      mode: "edit",
      defaults: {
        name: S.name || "",
        ageBand: S.ageBand || "",
        tag: S.tag || "",
        house: houseId,
        consent: !!S.consent
      },
      onSubmit: function (data) {
        var prevTag = S.tag || "";
        S.name = data.name;
        S.hgaName = data.hgaName || S.hgaName;
        S.ageBand = data.ageBand;
        S.tag = (PROFILES && PROFILES.normalizeTag) ? PROFILES.normalizeTag(data.tag) : (data.tag || "");
        if (data.house && (!S.house || S.house.id !== data.house)) {
          var picked = null;
          for (var i = 0; i < HOUSES.length; i++) if (HOUSES[i].id === data.house) { picked = HOUSES[i]; break; }
          if (picked) S.house = { id: picked.id, worldId: picked.worldId, chosenAt: new Date().toISOString() };
        }
        S.consent = true;
        save();
        sfx("achievement");
        resubmitToLeagueIfOptedIn();
        var tagMsg = S.tag !== prevTag ? (S.tag ? ("Grupo: " + S.tag) : "Grupo removido.") : "Mudanças salvas.";
        showToast("✏️", "Perfil atualizado", tagMsg);
        render();
      }
    });
  }

  function resubmitToLeagueIfOptedIn() {
    if (!S.leagueOptIn || !LEAGUE || !LEAGUE.enabled) return;
    var newHandle = leagueHandleFor(S.name);
    S.leagueHandle = newHandle;
    save();
    var t = getTitle();
    var house = ROYALTY ? ROYALTY.getHouse(S) : null;
    LEAGUE.submit({
      handle: newHandle, cauris: S.cauris || 0,
      title: t.short, house: house ? house.id : "",
      tag: S.tag || ""
    }).then(function () {
      LEAGUE.refresh().then(function () {
        if (S.tag && LEAGUE.hasTagColumn && LEAGUE.hasTagColumn()) return LEAGUE.refreshGroup(S.tag);
      }).then(function () {
        if (S.screen === "league") render();
      });
    });
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
      // Lê o contexto em voz alta SE TTS estiver ligado.
      if (window.SankofaTTS && window.SankofaTTS.available() && window.SankofaTTS.enabled()) {
        speakContext(eid);
      }
    } else {
      // Fechou contexto — para fala atual se for dele
      if (window.SankofaTTS && window.SankofaTTS.stop) window.SankofaTTS.stop();
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

      // Caderno: se estava errado/skipped e acertou agora, move para "solvedAfterError"
      S.errored = S.errored || [];
      S.skipped = S.skipped || [];
      S.solvedAfterError = S.solvedAfterError || [];
      var wasErrored = S.errored.indexOf(eid);
      if (wasErrored !== -1) S.errored.splice(wasErrored, 1);
      var wasSkipped = S.skipped.indexOf(eid);
      if (wasSkipped !== -1) S.skipped.splice(wasSkipped, 1);
      if ((wasErrored !== -1 || wasSkipped !== -1) && S.solvedAfterError.indexOf(eid) === -1) {
        S.solvedAfterError.push(eid);
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
        // Atualiza rodapé dinâmico (histórico de erros, botão pular, contador)
        updateEnigmaDynamic(eid);
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

  function handleSkipEnigma(eid) {
    var en = getEnigma(eid);
    if (!en) return;
    if (isSolved(eid)) return;
    S.skipped = S.skipped || [];
    if (S.skipped.indexOf(eid) === -1) S.skipped.push(eid);
    // Mantém em errored também — Caderno mostra ambos
    S.errored = S.errored || [];
    if (S.errored.indexOf(eid) === -1) S.errored.push(eid);
    S.points += SKIP_PITY_POINTS;
    S.lastTryAt = S.lastTryAt || {};
    S.lastTryAt[eid] = new Date().toISOString();
    enigmaLocked = false;
    save();
    sfx("navigate");
    showToast("🌿", "Anotado no Caderno", "Volte quando quiser. +" + SKIP_PITY_POINTS + " pts por tentar.");
    goTo("result", { enigma: eid, points: SKIP_PITY_POINTS, skipped: true });
  }

  /* ---------------- INIT ---------------- */
  function init() {
    load();
    S.lastLevel = getLevel().level;
    applyTheme(getTheme());
    updateSoundBtn();

    var tb = document.getElementById("theme-toggle");
    if (tb) tb.addEventListener("click", function () { toggleTheme(); sfx("click"); closeMenuDrawer(); });

    applyTextScale(getTextScale());
    var zDec = document.getElementById("zoom-decrease");
    var zInc = document.getElementById("zoom-increase");
    if (zDec) zDec.addEventListener("click", function (ev) { ev.stopPropagation(); if (changeTextScale(-1)) sfx("click"); });
    if (zInc) zInc.addEventListener("click", function (ev) { ev.stopPropagation(); if (changeTextScale(+1)) sfx("click"); });

    // Hamburger drawer
    var menuBtn = document.getElementById("menu-toggle");
    var menuDrawer = document.getElementById("menu-drawer");
    function openMenuDrawer() {
      if (!menuDrawer || !menuBtn) return;
      menuDrawer.hidden = false;
      menuBtn.setAttribute("aria-expanded", "true");
      menuBtn.classList.add("open");
    }
    function closeMenuDrawer() {
      if (!menuDrawer || !menuBtn) return;
      menuDrawer.hidden = true;
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.classList.remove("open");
    }
    function toggleMenuDrawer() {
      if (menuDrawer && menuDrawer.hidden) openMenuDrawer();
      else closeMenuDrawer();
    }
    if (menuBtn) menuBtn.addEventListener("click", function (ev) {
      ev.stopPropagation();
      toggleMenuDrawer();
      sfx("click");
    });
    // Hub button no drawer (fora do #app, precisa wiring próprio)
    if (menuDrawer) {
      var hubBtn = menuDrawer.querySelector('[data-act="go-info-hub"]');
      if (hubBtn) hubBtn.addEventListener("click", function () {
        sfx("navigate");
        closeMenuDrawer();
        goTo("info-hub");
      });
    }

    // Language toggle — cycle PT-BR → EN → ES → PT-BR
    var langBtn = document.getElementById("lang-toggle");
    if (langBtn && window.SankofaI18n) {
      langBtn.addEventListener("click", function () {
        var next = window.SankofaI18n.cycle();
        sfx("click");
        updateLangLabels();
        showToast("🌐", langDisplayName(next), window.SankofaI18n.t("about.translations_status"));
        // Re-render para aplicar traduções novas
        render();
      });
      updateLangLabels();
    }
    // Click fora fecha
    document.addEventListener("click", function (ev) {
      if (!menuDrawer || menuDrawer.hidden) return;
      if (menuDrawer.contains(ev.target) || (menuBtn && menuBtn.contains(ev.target))) return;
      closeMenuDrawer();
    });
    // Esc fecha
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && menuDrawer && !menuDrawer.hidden) closeMenuDrawer();
    });

    var pb = document.getElementById("profile-btn");
    if (pb) pb.addEventListener("click", function () {
      if (!S.name || !S.consent) {
        // Sem perfil ainda → leva pra registro
        sfx("click");
        goTo("register");
        return;
      }
      sfx("click");
      goTo("profile");
    });
    updateProfileBtn();

    var ib = document.getElementById("install-btn");
    if (ib) ib.addEventListener("click", function () {
      sfx("achievement");
      triggerInstallPrompt(function () { ib.style.display = "none"; });
    });

    setupInstallBanner();

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
      closeMenuDrawer();
    });

    var ab = document.getElementById("ambient-toggle");
    if (ab) ab.addEventListener("click", function () {
      if (!S.soundOn) return;
      S.ambientOn = !S.ambientOn;
      save();
      applyAudioState();
      updateSoundBtn();
      if (AUDIO) AUDIO.unlock();
      closeMenuDrawer();
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
