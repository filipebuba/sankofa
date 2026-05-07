/*
  Sankofa — Onboarding de 30 segundos.
  4 slides na primeira abertura. Skip a qualquer momento.

  API:
    SankofaOnboarding.show()        -> mostra modal de 4 slides
    SankofaOnboarding.shouldShow()  -> bool (1ª vez + perfil sem consent)
    SankofaOnboarding.markSeen()    -> registra visualização
*/
(function () {
  var SEEN_KEY = "sankofa_onboarding_seen_v1";

  var SLIDES = [
    {
      icon: "🪶",
      title: "Sou Sankofa.",
      body: "Conto a história que apagaram. Mil anos de África sob seus pés."
    },
    {
      icon: "🧩",
      title: "Resolva enigmas. Recolha fragmentos.",
      body: "Cada acerto monta um pedaço do mosaico. 71 fragmentos. 8 mundos. Volume I-VIII da HGA UNESCO."
    },
    {
      icon: "🐚",
      title: "Cauris compram coroas.",
      body: "Cada vitória rende cauris. Use-os em casas reais, festivais, audiências reais."
    },
    {
      icon: "🌍",
      title: "Pronto para começar?",
      body: "Toda história começa com um nome. Vamos criar o seu."
    }
  ];

  function shouldShow() {
    if (localStorage.getItem(SEEN_KEY)) return false;
    return true;
  }

  function markSeen() {
    localStorage.setItem(SEEN_KEY, new Date().toISOString());
  }

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "style") n.style.cssText = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (html != null) n.innerHTML = html;
    return n;
  }

  function show(opts) {
    opts = opts || {};
    var overlay = el("div", { class: "sk-modal-overlay sk-onb-overlay", role: "dialog", "aria-modal": "true" });
    var modal   = el("div", { class: "sk-modal sk-onb" });
    overlay.appendChild(modal);

    var idx = 0;
    var slideArea = el("div", { class: "sk-onb-slide-area" });
    modal.appendChild(slideArea);

    var dots = el("div", { class: "sk-onb-dots" });
    SLIDES.forEach(function (_, i) {
      var d = el("span", { class: "sk-onb-dot", "data-i": i, role: "button", "aria-label": "Slide " + (i + 1) });
      dots.appendChild(d);
    });
    modal.appendChild(dots);

    var actions = el("div", { class: "sk-row sk-onb-actions" });
    var btnSkip = el("button", { type: "button", class: "btn btn-ghost btn-sm" }, "Pular");
    var btnNext = el("button", { type: "button", class: "btn btn-gold" }, "Avançar →");
    actions.appendChild(btnSkip);
    actions.appendChild(btnNext);
    modal.appendChild(actions);

    function render() {
      var s = SLIDES[idx];
      slideArea.innerHTML = ""
        + '<div class="sk-onb-icon" aria-hidden="true">' + s.icon + '</div>'
        + '<h2 class="sk-onb-title">' + s.title + '</h2>'
        + '<p class="sk-onb-body">' + s.body + '</p>';
      Array.prototype.forEach.call(dots.children, function (d, i) {
        d.classList.toggle("active", i === idx);
      });
      btnNext.textContent = (idx === SLIDES.length - 1) ? "Começar →" : "Avançar →";
    }

    function close() {
      markSeen();
      overlay.classList.add("sk-leaving");
      setTimeout(function () { overlay.remove(); }, 200);
      document.removeEventListener("keydown", esc);
      if (opts.onClose) opts.onClose();
    }

    function esc(e) {
      if (e.key === "Escape" || e.key === "Enter") {
        if (e.key === "Enter") advance();
        else close();
      } else if (e.key === "ArrowRight") advance();
      else if (e.key === "ArrowLeft" && idx > 0) { idx--; render(); }
    }

    function advance() {
      if (idx < SLIDES.length - 1) { idx++; render(); }
      else close();
    }

    btnSkip.addEventListener("click", close);
    btnNext.addEventListener("click", advance);
    dots.addEventListener("click", function (ev) {
      var t = ev.target.closest(".sk-onb-dot"); if (!t) return;
      idx = parseInt(t.getAttribute("data-i"), 10) || 0;
      render();
    });
    document.addEventListener("keydown", esc);

    document.body.appendChild(overlay);
    render();
  }

  window.SankofaOnboarding = {
    show: show,
    shouldShow: shouldShow,
    markSeen: markSeen,
    SLIDES: SLIDES
  };
})();
