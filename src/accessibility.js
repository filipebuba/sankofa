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

  function speak(text, opts) {
    if (!available()) return false;
    opts = opts || {};
    stop();
    var clean = stripHTML(text);
    if (!clean) return false;
    var utter = new SpeechSynthesisUtterance(clean);
    utter.lang  = opts.lang  || "pt-BR";
    utter.rate  = opts.rate  != null ? opts.rate  : 0.95;
    utter.pitch = opts.pitch != null ? opts.pitch : 1.0;
    var v = pickVoice(utter.lang);
    if (v) utter.voice = v;
    window.speechSynthesis.speak(utter);
    return true;
  }

  function stop() {
    if (available()) window.speechSynthesis.cancel();
  }

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
    stop: stop
  };
})();
