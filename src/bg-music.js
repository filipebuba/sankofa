/*
  Sankofa Background Music
  ------------------------
  HTMLAudioElement loop with fade in/out. Lazy-load (no precache).
  Independent from SankofaAudio (synth engine). When both enabled,
  app.js should disable synth ambient to avoid mix clutter.

  Public API
    SankofaBgMusic.enable()       create+play (fades in)
    SankofaBgMusic.disable()      fade out + pause
    SankofaBgMusic.setVolume(v)   0..1
    SankofaBgMusic.getVolume()
    SankofaBgMusic.isEnabled()
    SankofaBgMusic.isPlaying()
    SankofaBgMusic.unlock()       call on user gesture (resumes if needed)
*/
(function () {
  var SRC = "assets/audio/bg-loop.mp3";
  var KEY_ON = "sankofa_bg_music";
  var KEY_VOL = "sankofa_bg_vol";
  var DEFAULT_VOL = 0.35;
  var FADE_MS = 1200;

  var el = null;
  var enabled = false;
  var targetVol = DEFAULT_VOL;
  var fadeTimer = null;

  function readVol() {
    var raw = parseFloat(localStorage.getItem(KEY_VOL));
    return (isFinite(raw) && raw >= 0 && raw <= 1) ? raw : DEFAULT_VOL;
  }

  function ensureEl() {
    if (el) return el;
    el = new Audio();
    el.src = SRC;
    el.loop = true;
    el.preload = "none";
    el.volume = 0;
    el.crossOrigin = "anonymous";
    return el;
  }

  function clearFade() {
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
  }

  function fadeTo(target, after) {
    clearFade();
    if (!el) return;
    var start = el.volume;
    var t0 = Date.now();
    fadeTimer = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / FADE_MS);
      el.volume = start + (target - start) * p;
      if (p >= 1) {
        clearFade();
        if (after) after();
      }
    }, 40);
  }

  function enable() {
    targetVol = readVol();
    ensureEl();
    enabled = true;
    localStorage.setItem(KEY_ON, "on");
    var p = el.play();
    if (p && typeof p.catch === "function") {
      p.catch(function () { /* autoplay blocked — will retry on next user gesture */ });
    }
    fadeTo(targetVol);
  }

  function disable() {
    enabled = false;
    localStorage.setItem(KEY_ON, "off");
    if (!el) return;
    fadeTo(0, function () { try { el.pause(); } catch (e) {} });
  }

  function setVolume(v) {
    v = Math.max(0, Math.min(1, +v || 0));
    targetVol = v;
    localStorage.setItem(KEY_VOL, String(v));
    if (el && enabled) {
      clearFade();
      el.volume = v;
    }
  }

  function unlock() {
    if (!enabled || !el) return;
    if (el.paused) {
      var p = el.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    }
  }

  // Restore state on load — but do NOT autoplay; needs user gesture.
  // Caller (app.js) re-invokes enable() once a gesture happens.
  function bootFromStorage() {
    if (localStorage.getItem(KEY_ON) === "on") enabled = true;
    targetVol = readVol();
  }

  bootFromStorage();

  window.SankofaBgMusic = {
    enable: enable,
    disable: disable,
    setVolume: setVolume,
    getVolume: function () { return targetVol; },
    isEnabled: function () { return enabled; },
    isPlaying: function () { return !!(el && !el.paused); },
    unlock: unlock
  };
})();
