/*
  Sankofa — Modal de criação/edição de perfil.

  Substitui o prompt() simples. Coleta:
    - Nome (livre OU gerado da HGA com mini-card educativo)
    - Faixa etária (LGPD: nunca data exata)
    - Tag de grupo opcional (ex: #Turma7A)
    - Casa Real opcional (vinculada ao perfil)
    - Aceite de termos curto (1 linha)

  API:
    SankofaProfileModal.open({ mode: "create"|"edit", onSubmit, onCancel, defaults })
*/
(function () {
  var AGE_BANDS = [
    { id: "8-12",  label: "8-12 anos" },
    { id: "13-17", label: "13-17 anos" },
    { id: "18+",   label: "18+ anos" },
    { id: "skip",  label: "Prefiro não dizer" }
  ];

  var HOUSE_CHOICES = [
    { id: "kemet",    label: "Faraó(ona) de Kemet" },
    { id: "kush",     label: "Kandake de Kush" },
    { id: "mali",     label: "Mansa do Mali" },
    { id: "aksum",    label: "Negus de Aksum" },
    { id: "asante",   label: "Asantehene" },
    { id: "benin",    label: "Oba do Benin" },
    { id: "kongo",    label: "Manikongo" },
    { id: "ruanda",   label: "Mwami do Ruanda" },
    { id: "quilombo", label: "Líder Quilombola" }
  ];

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

  function pickedHGAName(state) {
    return state.hga
      ? '<div class="hga-card">'
        + '<div class="hga-card-head">' + escapeHtml(state.hga.name)
          + ' <span class="hga-period">' + escapeHtml(state.hga.period) + '</span></div>'
        + '<div class="hga-desc">' + escapeHtml(state.hga.desc) + '</div>'
        + '<div class="hga-meta">Casa: ' + escapeHtml(state.hga.casa) + ' · Mundo ' + state.hga.world + '</div>'
      + '</div>'
      : '';
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function build(opts) {
    opts = opts || {};
    var defaults = opts.defaults || {};
    var state = {
      name:    defaults.name || "",
      hga:     null,
      ageBand: defaults.ageBand || "",
      tag:     defaults.tag || "",
      house:   defaults.house || "",
      consent: !!defaults.consent
    };

    var overlay = el("div", { class: "sk-modal-overlay", role: "dialog", "aria-modal": "true", "aria-labelledby": "sk-modal-title" });
    var modal   = el("div", { class: "sk-modal sk-modal-profile" });
    overlay.appendChild(modal);

    var title = opts.mode === "edit" ? "Editar perfil" : "Criar Griô";
    modal.appendChild(el("h2", { id: "sk-modal-title", class: "sk-modal-title" }, title));
    modal.appendChild(el("p", { class: "sk-modal-sub" }, "Toda história começa com um nome. Escolha o seu."));

    // 1. NOME
    var nameWrap = el("div", { class: "sk-field" });
    nameWrap.appendChild(el("label", { for: "sk-name", class: "sk-label" }, "Nome do seu Griô"));
    var nameInput = el("input", {
      type: "text", id: "sk-name", class: "sk-input",
      maxlength: "24", placeholder: "Ex: Sundiata, Nzinga, Asha…",
      autocomplete: "off", "aria-describedby": "sk-name-hint"
    });
    nameInput.value = state.name;
    nameWrap.appendChild(nameInput);

    var btnRow = el("div", { class: "sk-row sk-row-tight" });
    var btnHGA = el("button", { type: "button", class: "btn btn-outline btn-sm" }, "🌍 Gerar Nome Histórico");
    btnRow.appendChild(btnHGA);
    nameWrap.appendChild(btnRow);
    nameWrap.appendChild(el("div", { id: "sk-name-hint", class: "sk-hint" }, "Sem dados pessoais. Sem e-mail."));

    var hgaPreview = el("div", { class: "sk-hga-slot" });
    nameWrap.appendChild(hgaPreview);
    modal.appendChild(nameWrap);

    btnHGA.addEventListener("click", function () {
      if (!window.HGAName || !window.HGAName.random) return;
      var picked = window.HGAName.random();
      state.hga = picked;
      state.name = picked.name;
      nameInput.value = picked.name;
      hgaPreview.innerHTML = pickedHGAName(state);
    });

    // 2. FAIXA ETÁRIA
    var ageWrap = el("div", { class: "sk-field" });
    ageWrap.appendChild(el("label", { class: "sk-label" }, "Faixa etária"));
    ageWrap.appendChild(el("div", { class: "sk-hint" }, "Não pedimos data exata. Só a faixa, para agrupar rankings."));
    var ageRow = el("div", { class: "sk-pills", role: "radiogroup", "aria-label": "Faixa etária" });
    AGE_BANDS.forEach(function (a) {
      var b = el("button", {
        type: "button", class: "sk-pill",
        role: "radio", "aria-checked": state.ageBand === a.id ? "true" : "false",
        "data-age": a.id
      }, a.label);
      if (state.ageBand === a.id) b.classList.add("active");
      ageRow.appendChild(b);
    });
    ageRow.addEventListener("click", function (ev) {
      var t = ev.target.closest(".sk-pill"); if (!t) return;
      state.ageBand = t.getAttribute("data-age");
      ageRow.querySelectorAll(".sk-pill").forEach(function (p) {
        p.classList.toggle("active", p === t);
        p.setAttribute("aria-checked", p === t ? "true" : "false");
      });
    });
    ageWrap.appendChild(ageRow);
    modal.appendChild(ageWrap);

    // 3. CASA REAL (opcional)
    var houseWrap = el("div", { class: "sk-field" });
    houseWrap.appendChild(el("label", { for: "sk-house", class: "sk-label" }, "Casa Real (opcional)"));
    var houseSel = el("select", { id: "sk-house", class: "sk-input" });
    houseSel.appendChild(el("option", { value: "" }, "— Escolho mais tarde no jogo —"));
    HOUSE_CHOICES.forEach(function (h) {
      var o = el("option", { value: h.id }, h.label);
      if (state.house === h.id) o.setAttribute("selected", "selected");
      houseSel.appendChild(o);
    });
    houseSel.addEventListener("change", function () { state.house = houseSel.value; });
    houseWrap.appendChild(houseSel);
    modal.appendChild(houseWrap);

    // 4. TAG DE GRUPO (opcional)
    var tagWrap = el("div", { class: "sk-field" });
    tagWrap.appendChild(el("label", { for: "sk-tag", class: "sk-label" }, "Grupo (opcional)"));
    tagWrap.appendChild(el("div", { class: "sk-hint" }, "Ex: #Turma7A, #Escola-XYZ, #Familia. Aparece num placar próprio."));
    var tagInput = el("input", {
      type: "text", id: "sk-tag", class: "sk-input",
      maxlength: "24", placeholder: "#Turma7A", autocomplete: "off"
    });
    tagInput.value = state.tag;
    tagInput.addEventListener("input", function () { state.tag = tagInput.value; });
    tagWrap.appendChild(tagInput);
    modal.appendChild(tagWrap);

    // 5. LGPD CONSENT
    var consentWrap = el("label", { class: "sk-consent" });
    var cb = el("input", { type: "checkbox", id: "sk-consent" });
    if (state.consent) cb.setAttribute("checked", "checked");
    cb.addEventListener("change", function () { state.consent = cb.checked; });
    consentWrap.appendChild(cb);
    consentWrap.appendChild(el("span", {}, "Concordo. Sankofa guarda só meu apelido e progresso. Sem e-mail, sem foto, sem dados pessoais. Posso apagar tudo quando quiser."));
    modal.appendChild(consentWrap);

    // ACTIONS
    var actions = el("div", { class: "sk-row sk-actions" });
    var btnCancel = el("button", { type: "button", class: "btn btn-ghost" }, "Cancelar");
    var okLabel = opts.mode === "edit" ? "Salvar alterações" : "Começar a contar a história";
    var btnOK     = el("button", { type: "button", class: "btn btn-gold" }, okLabel);
    actions.appendChild(btnCancel);
    actions.appendChild(btnOK);
    modal.appendChild(actions);

    // ERR slot
    var errSlot = el("div", { class: "sk-err", "aria-live": "polite" });
    modal.appendChild(errSlot);

    function close() {
      overlay.classList.add("sk-leaving");
      setTimeout(function () { overlay.remove(); }, 200);
      document.removeEventListener("keydown", esc);
    }
    function esc(e) { if (e.key === "Escape") { close(); if (opts.onCancel) opts.onCancel(); } }
    document.addEventListener("keydown", esc);

    btnCancel.addEventListener("click", function () {
      close();
      if (opts.onCancel) opts.onCancel();
    });

    btnOK.addEventListener("click", function () {
      var nm = nameInput.value.trim();
      errSlot.textContent = "";
      if (!nm || nm.length < 2) { errSlot.textContent = "Nome precisa ter ao menos 2 letras."; return; }
      if (window.sankofaCensor && !window.sankofaCensor(nm)) { errSlot.textContent = "Esse nome não é permitido. Tenta outro."; return; }
      if (state.tag && window.sankofaCensor && !window.sankofaCensor(state.tag)) { errSlot.textContent = "Essa tag não é permitida."; return; }
      if (!state.ageBand) { errSlot.textContent = "Escolhe a faixa etária (ou 'prefiro não dizer')."; return; }
      if (!state.consent) { errSlot.textContent = "Precisa marcar o aceite para criar o perfil."; return; }

      var payload = {
        name: nm,
        hgaName: state.hga ? state.hga.name : null,
        ageBand: state.ageBand,
        tag: state.tag,
        house: state.house,
        consent: true
      };
      close();
      if (opts.onSubmit) opts.onSubmit(payload);
    });

    document.body.appendChild(overlay);
    setTimeout(function () { nameInput.focus(); }, 50);
  }

  window.SankofaProfileModal = { open: build };
})();
