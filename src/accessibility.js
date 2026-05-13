/*
  Sankofa — Acessibilidade.
  Text-to-Speech via Web Speech API. Zero custo, browser nativo.

  API:
    SankofaTTS.enabled()         -> bool (preference)
    SankofaTTS.toggle()          -> novo estado
    SankofaTTS.speak(text, opts) -> fala texto. opts.lang ('pt-BR' default), opts.rate, opts.pitch
    SankofaTTS.stop()            -> interrompe fala atual
    SankofaTTS.available()       -> bool (browser support)
*/
(function () {
  var KEY = "sankofa_tts";

  function available() {
    return typeof window !== "undefined"
      && "speechSynthesis" in window
      && typeof window.SpeechSynthesisUtterance !== "undefined";
  }

  function enabled() {
    return localStorage.getItem(KEY) === "on";
  }

  function setEnabled(on) {
    localStorage.setItem(KEY, on ? "on" : "off");
  }

  function toggle() {
    var next = !enabled();
    setEnabled(next);
    if (!next) stop();
    return next;
  }

  function pickVoice(lang) {
    if (!available()) return null;
    var voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;
    // Prefere voz pt-BR. Senão pt-PT. Senão qualquer.
    var prefs = [lang, lang.split("-")[0], "pt-BR", "pt"];
    for (var i = 0; i < prefs.length; i++) {
      for (var j = 0; j < voices.length; j++) {
        if (voices[j].lang.toLowerCase().indexOf(prefs[i].toLowerCase()) === 0) return voices[j];
      }
    }
    return voices[0];
  }

  function stripHTML(s) {
    if (!s) return "";
    var d = document.createElement("div");
    d.innerHTML = s;
    return d.textContent || d.innerText || "";
  }

  // Remove emojis e símbolos que viram "smiling face..." ou ruído
  function stripEmoji(s) {
    if (!s) return "";
    return String(s)
      // Faixas Unicode com pictographs/emojis comuns
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, " ")
      .replace(/[\u{1F600}-\u{1F64F}]/gu, " ")
      .replace(/[\u{2600}-\u{27BF}]/gu, " ")
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, " ")
      .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, " ")
      .replace(/[️‍]/g, " ")
      // Símbolos textuais que synth lê como palavras estranhas
      .replace(/[◉◆◈♛♔♕♖♗♘♙△▲▼◀▶★☆]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function clean(s) { return stripEmoji(stripHTML(s)); }

  function _make(text, opts) {
    opts = opts || {};
    var u = new SpeechSynthesisUtterance(clean(text));
    u.lang  = opts.lang  || "pt-BR";
    u.rate  = opts.rate  != null ? opts.rate  : 0.95;
    u.pitch = opts.pitch != null ? opts.pitch : 1.0;
    u.volume = opts.volume != null ? opts.volume : 1.0;
    var v = pickVoice(u.lang);
    if (v) u.voice = v;
    return u;
  }

  function _fallbackWebSpeech(parts, opts) {
    if (!available()) return;
    playSting().then(function () {
      parts.forEach(function (p) {
        window.speechSynthesis.speak(_make(p, opts));
      });
    });
  }

  function speak(text, opts) {
    var t = clean(text);
    if (!t) return false;
    if (available()) window.speechSynthesis.cancel();
    stopPrerendered();
    var eid = opts && opts.enigmaId;
    if (eid) {
      tryPrerendered(eid).then(function (ok) {
        if (!ok) _fallbackWebSpeech([t], opts);
      });
    } else {
      _fallbackWebSpeech([t], opts);
    }
    return true;
  }

  // Lista de strings, lidas em sequência com pausa natural entre elas.
  // Cancela qualquer fala em andamento.
  function speakSequence(parts, opts) {
    if (!Array.isArray(parts)) return false;
    var clean_parts = parts.map(clean).filter(function (p) { return p && p.length; });
    if (!clean_parts.length) return false;
    if (available()) window.speechSynthesis.cancel();
    stopPrerendered();
    var eid = opts && opts.enigmaId;
    if (eid) {
      tryPrerendered(eid).then(function (ok) {
        if (!ok) _fallbackWebSpeech(clean_parts, opts);
      });
    } else {
      _fallbackWebSpeech(clean_parts, opts);
    }
    return true;
  }

  /* ---------------- PRE-RENDERED MP3 (per enigma) ---------------- */
  var prerenderedEl = null;
  var prerenderedMisses = {};

  function ensurePrerenderedEl() {
    if (prerenderedEl) return prerenderedEl;
    prerenderedEl = new Audio();
    prerenderedEl.preload = "auto";
    prerenderedEl.volume = 1.0;
    return prerenderedEl;
  }

  function stopPrerendered() {
    if (prerenderedEl) { try { prerenderedEl.pause(); prerenderedEl.currentTime = 0; } catch (e) {} }
  }

  // Returns Promise<boolean>: true if mp3 played, false if missing/failed.
  function tryPrerendered(enigmaId) {
    if (prerenderedMisses[enigmaId]) return Promise.resolve(false);
    var url = "assets/audio/tts/" + enigmaId + ".mp3";
    var el = ensurePrerenderedEl();
    el.src = url;
    return new Promise(function (resolve) {
      var settled = false;
      function ok() { if (settled) return; settled = true; resolve(true); }
      function fail() {
        if (settled) return; settled = true;
        prerenderedMisses[enigmaId] = true;
        resolve(false);
      }
      el.addEventListener("playing", ok, { once: true });
      el.addEventListener("error", fail, { once: true });
      var p = el.play();
      if (p && typeof p.catch === "function") p.catch(fail);
      setTimeout(function () { if (!settled) fail(); }, 2500);
    });
  }

  function stop() {
    if (available()) window.speechSynthesis.cancel();
    stopSting();
    stopPrerendered();
  }

  /* ---------------- STING (griot intro, every utterance) ---------------- */
  var STING_SRC = "assets/audio/sting-intro.mp3";
  var stingEl = null;

  function ensureSting() {
    if (stingEl) return stingEl;
    stingEl = new Audio();
    stingEl.src = STING_SRC;
    stingEl.preload = "auto";
    stingEl.volume = 0.85;
    return stingEl;
  }

  function stopSting() {
    if (stingEl) { try { stingEl.pause(); stingEl.currentTime = 0; } catch (e) {} }
  }

  // Play sting. Resets to start each call. Returns Promise resolved on end or on safety timeout.
  function playSting() {
    var el = ensureSting();
    try { el.currentTime = 0; } catch (e) {}
    return new Promise(function (resolve) {
      var done = false;
      function finish() { if (done) return; done = true; resolve(); }
      el.addEventListener("ended", finish, { once: true });
      el.addEventListener("error", finish, { once: true });
      var p = el.play();
      if (p && typeof p.catch === "function") p.catch(finish);
      // Safety timeout — sting is ~3.4s, give 6s headroom.
      setTimeout(finish, 6000);
    });
  }

  function resetStingForSession() { stopSting(); }

  // Carrega vozes (alguns browsers populam async)
  if (available() && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = function () { /* warm-up */ };
  }

  window.SankofaTTS = {
    available: available,
    enabled: enabled,
    setEnabled: setEnabled,
    toggle: toggle,
    speak: speak,
    speakSequence: speakSequence,
    stop: stop,
    playSting: playSting,
    resetStingForSession: resetStingForSession
  };
})();
