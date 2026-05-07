/*
  Sankofa — Compartilhamento social.
  WhatsApp deeplink + Web Share API fallback.
*/
(function () {
  var APP_URL = "https://sankofa-eosin.vercel.app";

  function buildMessage(p) {
    p = p || {};
    var name = p.name || "Griô";
    var house = p.house ? " da Casa " + p.house : "";
    var cauris = p.cauris != null ? p.cauris : 0;
    var fragsCount = (p.solved && p.solved.length) || 0;
    var ref = p.id ? "?ref=" + encodeURIComponent(p.id) : "";
    return "🌍 *Sou " + name + house + " em Sankofa — Fragmentos da África.*\n\n" +
      "🐚 " + cauris + " cauris · " + fragsCount + "/71 fragmentos da História Geral da África (UNESCO).\n\n" +
      "Te desafio a vir resolver os enigmas comigo:\n" +
      APP_URL + "/" + ref;
  }

  function encodeForWhatsApp(text) {
    return encodeURIComponent(text);
  }

  function whatsapp(profile) {
    var msg = buildMessage(profile);
    var url = "https://wa.me/?text=" + encodeForWhatsApp(msg);
    window.open(url, "_blank", "noopener");
  }

  function generic(profile) {
    var msg = buildMessage(profile);
    var url = APP_URL + (profile && profile.id ? "/?ref=" + encodeURIComponent(profile.id) : "/");
    if (navigator.share) {
      return navigator.share({
        title: "Sankofa — Fragmentos da África",
        text: msg,
        url: url
      }).then(function () { return true; }, function () { return false; });
    }
    return Promise.resolve(false);
  }

  function copyLink(profile) {
    var url = APP_URL + (profile && profile.id ? "/?ref=" + encodeURIComponent(profile.id) : "/");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(url).then(function () { return true; }, function () { return false; });
    }
    return Promise.resolve(false);
  }

  window.SankofaShare = {
    whatsapp: whatsapp,
    generic: generic,
    copyLink: copyLink,
    buildMessage: buildMessage,
    APP_URL: APP_URL
  };
})();
