/*
  Sankofa — Compartilhamento social.
  WhatsApp deeplink + Web Share API fallback.

  Texto plano sem markdown WhatsApp (*bold* / _italic_) porque o
  pré-preenchimento de wa.me mostra os caracteres literais até o user
  enviar. Mensagem clara independentemente do client.
*/
(function () {
  var APP_URL = "https://www.sankofahga.com";

  function buildMessage(p) {
    p = p || {};
    var name = p.name || "Griô";
    var house = p.house ? " da Casa " + p.house : "";
    var cauris = p.cauris != null ? p.cauris : 0;
    var fragsCount = (p.solved && p.solved.length) || 0;
    var ref = p.id ? "?ref=" + encodeURIComponent(p.id) : "";
    var tagRef = p.tag ? "&tag=" + encodeURIComponent(p.tag) : "";
    var msg = "Sou " + name + house + " em Sankofa — Fragmentos da África.\n" +
      "Volte e busque o que ficou para trás.\n\n" +
      cauris + " cauris · " + fragsCount + "/71 fragmentos da História Geral da África (UNESCO).\n\n";
    if (p.tag) {
      msg += "Meu grupo: " + p.tag + "\n" +
        "Para jogar comigo, abre o link e coloca " + p.tag + " no campo \"Grupo\" do teu perfil.\n\n";
    } else {
      msg += "Te desafio a vir resolver os enigmas comigo:\n";
    }
    msg += APP_URL + "/" + ref + tagRef;
    return msg;
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
