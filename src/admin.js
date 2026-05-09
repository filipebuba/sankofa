/*
  Sankofa — Painel Admin (cliente).

  Lê VIEWS agregadas (sem PII) via REST do Supabase.
  "Senha" é gate cosmético no client (não autenticação real).
  As views já são públicas-seguras: só agregados, sem session_id ou linha individual.

  Acesso: /?admin=1 ou link interno (route "admin").

  Configuração: adiciona ao final de src/league-config.js:
    window.SANKOFA_ADMIN_PIN = "<seu-pin-de-4-a-12-chars>";

  Sem PIN: painel exige qualquer string >= 4 chars (apenas para ocultar da UI).
  Para auth real: criar Supabase Auth + RPC SECURITY DEFINER.
*/
(function () {
  var cfg = window.SANKOFA_LEAGUE_CONFIG || null;
  var enabled = !!(cfg && cfg.url && cfg.anonKey);
  var PIN_KEY = "sankofa.adminPinOk";

  function endpoint(view) { return cfg.url + "/rest/v1/" + view; }
  function headers() {
    return {
      "apikey": cfg.anonKey,
      "Authorization": "Bearer " + cfg.anonKey,
      "Content-Type": "application/json"
    };
  }

  function fetchView(view, query) {
    if (!enabled) return Promise.resolve([]);
    var url = endpoint(view) + (query || "");
    return fetch(url, { headers: headers() })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; });
  }

  function isUnlocked() {
    try { return localStorage.getItem(PIN_KEY) === "1"; } catch (_) { return false; }
  }

  function tryUnlock(input) {
    if (!input || input.length < 4) return false;
    var expected = window.SANKOFA_ADMIN_PIN;
    if (expected && input !== expected) return false;
    try { localStorage.setItem(PIN_KEY, "1"); } catch (_) {}
    return true;
  }

  function lock() {
    try { localStorage.removeItem(PIN_KEY); } catch (_) {}
  }

  // CSV download utility (browser-side, no deps).
  function toCSV(rows) {
    if (!rows || !rows.length) return "";
    var keys = Object.keys(rows[0]);
    var esc = function (v) {
      if (v === null || v === undefined) return "";
      var s = String(v);
      if (s.indexOf(",") !== -1 || s.indexOf("\"") !== -1 || s.indexOf("\n") !== -1) {
        return "\"" + s.replace(/"/g, "\"\"") + "\"";
      }
      return s;
    };
    var lines = [keys.join(",")];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      lines.push(keys.map(function (k) { return esc(r[k]); }).join(","));
    }
    return lines.join("\n");
  }

  function downloadCSV(filename, rows) {
    var csv = toCSV(rows);
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 100);
  }

  function tableHTML(rows, columns) {
    if (!rows || !rows.length) return '<p style="color:var(--text-muted);font-size:.85rem">Sem dados ainda.</p>';
    var cols = columns || Object.keys(rows[0]);
    var html = '<table class="admin-table"><thead><tr>';
    for (var c = 0; c < cols.length; c++) html += '<th>' + cols[c] + '</th>';
    html += '</tr></thead><tbody>';
    for (var i = 0; i < rows.length; i++) {
      html += '<tr>';
      for (var j = 0; j < cols.length; j++) {
        var v = rows[i][cols[j]];
        if (v === null || v === undefined) v = "—";
        else if (typeof v === "number") v = (v % 1 === 0) ? v : Math.round(v * 100) / 100;
        html += '<td>' + v + '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  function kpisHTML(overview) {
    if (!overview) return "";
    function kpi(label, val) {
      return '<div class="admin-kpi"><div class="admin-kpi-value">' + (val == null ? "0" : val) + '</div><div class="admin-kpi-label">' + label + '</div></div>';
    }
    var taxa = overview.respostas_totais
      ? Math.round(100 * overview.acertos_totais / overview.respostas_totais) + "%"
      : "—";
    return '<div class="admin-kpis">' +
      kpi("Sessões únicas", overview.sessoes_unicas_total) +
      kpi("Enigmas abertos", overview.enigmas_abertos) +
      kpi("Respostas", overview.respostas_totais) +
      kpi("Taxa de acerto", taxa) +
      kpi("Dicas pedidas", overview.dicas_pedidas) +
      kpi("Pulos", overview.pulos_totais) +
      kpi("Reações 😀", overview.reacoes_felizes) +
      kpi("Reações 😞", overview.reacoes_tristes) +
      kpi("Clareza média (1-5)", overview.clareza_media_geral) +
      '</div>';
  }

  function loginScreen() {
    return '<div class="admin-page">' +
      '<h2>Painel Admin · Sankofa</h2>' +
      '<div class="admin-login">' +
        '<p style="font-size:.85rem;color:var(--text-dim);margin:0 0 12px">Acesso restrito ao mantenedor do projeto. Métricas anônimas para editais e parceiros.</p>' +
        '<input id="admin-pin-input" type="password" placeholder="PIN" autocomplete="off" />' +
        '<button class="btn btn-gold btn-block" id="admin-pin-submit" style="margin-top:10px">Entrar</button>' +
        '<small style="display:block;margin-top:10px;color:var(--text-muted);font-size:.7rem">Configurar PIN: window.SANKOFA_ADMIN_PIN em src/league-config.js</small>' +
      '</div>' +
      '</div>';
  }

  function dashboardShell() {
    return '<div class="admin-page">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
        '<h2>Painel Admin · Sankofa</h2>' +
        '<button class="btn btn-ghost btn-sm" id="admin-logout">Sair</button>' +
      '</div>' +
      '<p style="font-size:.78rem;color:var(--text-muted);margin:-6px 0 14px">Dados anônimos. Sem identificação pessoal. Atualizado em tempo real.</p>' +
      '<div class="admin-section">' +
        '<h3>Visão geral</h3>' +
        '<div id="admin-overview"><p style="color:var(--text-muted)">Carregando...</p></div>' +
      '</div>' +
      '<div class="admin-section">' +
        '<h3>Engajamento diário (30d) <button class="admin-export" data-export="daily">⇩ CSV</button></h3>' +
        '<div id="admin-daily"></div>' +
      '</div>' +
      '<div class="admin-section">' +
        '<h3>Dificuldade por enigma <button class="admin-export" data-export="difficulty">⇩ CSV</button></h3>' +
        '<div id="admin-difficulty"></div>' +
      '</div>' +
      '<div class="admin-section">' +
        '<h3>Tempo por enigma (1ª tent.) <button class="admin-export" data-export="timing">⇩ CSV</button></h3>' +
        '<div id="admin-timing"></div>' +
      '</div>' +
      '<div class="admin-section">' +
        '<h3>Emoção por enigma <button class="admin-export" data-export="emotion">⇩ CSV</button></h3>' +
        '<div id="admin-emotion"></div>' +
      '</div>' +
      '<div class="admin-section">' +
        '<h3>Clareza percebida <button class="admin-export" data-export="clarity">⇩ CSV</button></h3>' +
        '<div id="admin-clarity"></div>' +
      '</div>' +
      '<div class="admin-section">' +
        '<h3>Funil de dicas por mundo <button class="admin-export" data-export="hints">⇩ CSV</button></h3>' +
        '<div id="admin-hints"></div>' +
      '</div>' +
      '<div class="admin-section">' +
        '<h3>Faixa etária <button class="admin-export" data-export="age">⇩ CSV</button></h3>' +
        '<div id="admin-age"></div>' +
      '</div>' +
      '</div>';
  }

  var dataCache = {};

  function loadAll() {
    Promise.all([
      fetchView("v_overview", "?limit=1"),
      fetchView("v_daily_engagement", "?order=dia.desc&limit=30"),
      fetchView("v_enigma_difficulty", "?order=acerto_1tent.asc.nullslast&limit=200"),
      fetchView("v_enigma_timing", "?order=seg_medio.desc.nullslast&limit=200"),
      fetchView("v_enigma_emotion", "?order=triste.desc.nullslast&limit=200"),
      fetchView("v_enigma_clarity", "?order=clareza_media.asc.nullslast&limit=200"),
      fetchView("v_hints_funnel", "?order=world.asc"),
      fetchView("v_age_breakdown", "?order=sessoes_unicas.desc")
    ]).then(function (results) {
      dataCache.overview   = results[0][0] || null;
      dataCache.daily      = results[1] || [];
      dataCache.difficulty = results[2] || [];
      dataCache.timing     = results[3] || [];
      dataCache.emotion    = results[4] || [];
      dataCache.clarity    = results[5] || [];
      dataCache.hints      = results[6] || [];
      dataCache.age        = results[7] || [];
      renderData();
    });
  }

  function renderData() {
    var ov = document.getElementById("admin-overview");
    if (ov) ov.innerHTML = kpisHTML(dataCache.overview) || '<p style="color:var(--text-muted)">Sem dados.</p>';

    var sections = {
      "admin-daily":      ["dia","sessoes","enigmas_abertos","acertos"],
      "admin-difficulty": ["enigma_id","world","tentativas","acerto_1tent","acerto_total","sessoes_unicas"],
      "admin-timing":     ["enigma_id","world","n","seg_medio","seg_mediana","seg_p95"],
      "admin-emotion":    ["enigma_id","world","feliz","neutro","triste","total_respostas"],
      "admin-clarity":    ["enigma_id","world","clareza_media","n"],
      "admin-hints":      ["world","dica_1","dica_2","dica_3"],
      "admin-age":        ["faixa","sessoes_unicas","respostas","taxa_acerto_pct"]
    };
    var keyMap = {
      "admin-daily": "daily",
      "admin-difficulty": "difficulty",
      "admin-timing": "timing",
      "admin-emotion": "emotion",
      "admin-clarity": "clarity",
      "admin-hints": "hints",
      "admin-age": "age"
    };
    Object.keys(sections).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = tableHTML(dataCache[keyMap[id]], sections[id]);
    });
  }

  function attachDashboardEvents(root) {
    root.addEventListener("click", function (ev) {
      var t = ev.target;
      if (t.id === "admin-logout") {
        lock();
        renderRoot();
        return;
      }
      var exportName = t.getAttribute && t.getAttribute("data-export");
      if (exportName) {
        var fileMap = {
          daily:      ["sankofa-engajamento-diario.csv",  dataCache.daily],
          difficulty: ["sankofa-dificuldade-enigmas.csv", dataCache.difficulty],
          timing:     ["sankofa-tempo-enigmas.csv",      dataCache.timing],
          emotion:    ["sankofa-emocao-enigmas.csv",     dataCache.emotion],
          clarity:    ["sankofa-clareza-enigmas.csv",    dataCache.clarity],
          hints:      ["sankofa-dicas-funil.csv",        dataCache.hints],
          age:        ["sankofa-faixa-etaria.csv",       dataCache.age]
        };
        var f = fileMap[exportName];
        if (f) downloadCSV(f[0], f[1]);
      }
    });
  }

  function attachLoginEvents(root) {
    var input = root.querySelector("#admin-pin-input");
    var btn = root.querySelector("#admin-pin-submit");
    if (!input || !btn) return;
    input.focus();
    function trySubmit() {
      if (tryUnlock(input.value)) renderRoot();
      else { input.value = ""; input.placeholder = "PIN incorreto"; }
    }
    btn.addEventListener("click", trySubmit);
    input.addEventListener("keydown", function (ev) { if (ev.key === "Enter") trySubmit(); });
  }

  function renderRoot() {
    var root = document.getElementById("app");
    if (!root) return;
    if (!enabled) {
      root.innerHTML = '<div class="admin-page"><h2>Painel Admin</h2><p style="color:var(--text-muted)">Supabase não configurado. Defina window.SANKOFA_LEAGUE_CONFIG.</p></div>';
      return;
    }
    if (!isUnlocked()) {
      root.innerHTML = loginScreen();
      attachLoginEvents(root);
      return;
    }
    root.innerHTML = dashboardShell();
    attachDashboardEvents(root);
    loadAll();
  }

  // Exposição
  window.SankofaAdmin = {
    render: renderRoot,
    isAdminURL: function () {
      var p = new URLSearchParams(location.search);
      return p.get("admin") === "1" || location.hash === "#admin";
    },
    lock: lock,
    unlock: tryUnlock
  };

  // Auto-render se URL pedir
  document.addEventListener("DOMContentLoaded", function () {
    if (window.SankofaAdmin.isAdminURL()) {
      // Aguarda um tick para o app principal terminar a inicialização
      setTimeout(renderRoot, 50);
    }
  });
})();
