/*
  Sankofa I18n — leve, sem dependências.

  API:
    SankofaI18n.t(key)              → string traduzida no idioma ativo
    SankofaI18n.t(key, "en")        → força idioma específico
    SankofaI18n.getLang()           → "pt-BR" | "en" | "es"
    SankofaI18n.setLang(code)       → muda idioma + salva + dispara evento
    SankofaI18n.available()         → ["pt-BR", "en", "es"]

  Persistência: localStorage["sankofa_lang"].
  Detecção inicial: localStorage > navigator.language > "pt-BR".
  Fallback automático: chave faltando no idioma X → tenta "pt-BR" → retorna a chave nua.
*/
(function () {
  var STORAGE_KEY = "sankofa_lang";
  var DEFAULT = "pt-BR";
  var data = window.SANKOFA_I18N || {};

  function detectInitial() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && data[saved]) return saved;
    } catch (e) {}
    var nav = (navigator.language || navigator.userLanguage || "").toLowerCase();
    if (nav.indexOf("pt") === 0) return "pt-BR";
    if (nav.indexOf("es") === 0 && data["es"]) return "es";
    if (nav.indexOf("en") === 0 && data["en"]) return "en";
    return DEFAULT;
  }

  var current = detectInitial();
  document.documentElement.setAttribute("lang", current);

  function interpolate(str, vars) {
    if (!vars) return str;
    return String(str).replace(/\{([a-zA-Z0-9_]+)\}/g, function (_, name) {
      return vars[name] != null ? String(vars[name]) : "{" + name + "}";
    });
  }

  function t(key, lang, vars) {
    if (lang && typeof lang === "object") {
      vars = lang;
      lang = null;
    }
    var L = lang || current;
    var bag = data[L] || {};
    if (bag[key] != null) return interpolate(bag[key], vars);
    // Fallback PT
    var fallback = data[DEFAULT] || {};
    if (fallback[key] != null) return interpolate(fallback[key], vars);
    // Última instância: chave nua, ajuda no debug
    return key;
  }

  function getLang() { return current; }

  function setLang(code) {
    if (!data[code]) return false;
    current = code;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
    document.documentElement.setAttribute("lang", code);
    if (typeof window.CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent("sankofa:langchange", { detail: { lang: code } }));
    }
    return true;
  }

  function cycle() {
    var langs = available();
    var idx = langs.indexOf(current);
    var next = langs[(idx + 1) % langs.length];
    setLang(next);
    return next;
  }

  function available() {
    return Object.keys(data);
  }

  window.SankofaI18n = {
    t: t,
    getLang: getLang,
    setLang: setLang,
    cycle: cycle,
    available: available
  };
})();
