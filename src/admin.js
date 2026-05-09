/*
  Sankofa — Painel Admin (autenticado via Supabase Auth).

  Acesso: /?admin=1 ou /#admin
  Login: email + senha (criar usuário em Studio → Authentication → Users).
  Token JWT em sessionStorage (some ao fechar a aba).

  Segurança:
    - Tabela enigma_events: INSERT-only para anon (telemetria), SELECT bloqueado.
    - Views agregadas (v_*): SELECT só para role 'authenticated'.
    - Self-signup deve estar desativado em Studio para impedir conta livre.

  Pra adicionar novo admin: Studio → Authentication → Users → Invite/Create.
*/
(function () {
  var cfg = window.SANKOFA_LEAGUE_CONFIG || null;
  var enabled = !!(cfg && cfg.url && cfg.anonKey);
  var TOKEN_KEY = "sankofa.adminToken";
  var REFRESH_KEY = "sankofa.adminRefresh";
  var EXPIRES_KEY = "sankofa.adminExpires";

  function authEndpoint(path) { return cfg.url + "/auth/v1/" + path; }
  function restEndpoint(path) { return cfg.url + "/rest/v1/" + path; }

  function authHeaders() {
    return {
      "apikey": cfg.anonKey,
      "Content-Type": "application/json"
    };
  }

  function getToken() {
    try { return sessionStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
  }
  function getRefresh() {
    try { return sessionStorage.getItem(REFRESH_KEY); } catch (_) { return null; }
  }
  function getExpires() {
    try { return parseInt(sessionStorage.getItem(EXPIRES_KEY) || "0", 10); } catch (_) { return 0; }
  }
  function setSession(s) {
    if (!s) {
      try {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_KEY);
        sessionStorage.removeItem(EXPIRES_KEY);
      } catch (_) {}
      return;
    }
    try {
      sessionStorage.setItem(TOKEN_KEY, s.access_token);
      if (s.refresh_token) sessionStorage.setItem(REFRESH_KEY, s.refresh_token);
      var expires = Date.now() + ((s.expires_in || 3600) * 1000);
      sessionStorage.setItem(EXPIRES_KEY, String(expires));
    } catch (_) {}
  }

  function isLoggedIn() {
    var tok = getToken();
    if (!tok) return false;
    return getExpires() > Date.now() + 5000; // 5s de margem
  }

  function login(email, password) {
    if (!enabled) return Promise.reject(new Error("Supabase não configurado"));
    return fetch(authEndpoint("token?grant_type=password"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email: email, password: password })
    }).then(function (r) {
      return r.json().then(function (body) {
        if (!r.ok) throw new Error(body.error_description || body.msg || ("HTTP " + r.status));
        setSession(body);
        return body;
      });
    });
  }

  function refreshSession() {
    var rt = getRefresh();
    if (!rt) return Promise.reject(new Error("sem refresh token"));
    return fetch(authEndpoint("token?grant_type=refresh_token"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ refresh_token: rt })
    }).then(function (r) {
      return r.json().then(function (body) {
        if (!r.ok) { setSession(null); throw new Error(body.error_description || "refresh failed"); }
        setSession(body);
        return body;
      });
    });
  }

  function logout() {
    var tok = getToken();
    setSession(null);
    if (!tok) return Promise.resolve();
    return fetch(authEndpoint("logout"), {
      method: "POST",
      headers: { "apikey": cfg.anonKey, "Authorization": "Bearer " + tok }
    }).catch(function () {});
  }

  function ensureValidToken() {
    if (isLoggedIn()) return Promise.resolve(getToken());
    if (getRefresh()) return refreshSession().then(function () { return getToken(); });
    return Promise.reject(new Error("não autenticado"));
  }

  function fetchView(view, query) {
    return ensureValidToken().then(function (tok) {
      var url = restEndpoint(view) + (query || "");
      return fetch(url, {
        headers: {
          "apikey": cfg.anonKey,
          "Authorization": "Bearer " + tok
        }
      }).then(function (r) {
        if (r.status === 401) {
          // Token rejeitado — força logout
          setSession(null);
          throw new Error("sessão expirada");
        }
        return r.ok ? r.json() : [];
      });
    }).catch(function () { return []; });
  }

  // ---------- CSV ----------
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

  // ---------- Render ----------
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

  function loginScreen(errorMsg) {
    return '<div class="admin-page">' +
      '<h2>Painel Admin · Sankofa</h2>' +
      '<div class="admin-login">' +
        '<p style="font-size:.85rem;color:var(--text-dim);margin:0 0 12px">Acesso restrito. Entra com a tua conta de mantenedor (Supabase Auth).</p>' +
        (errorMsg ? '<div style="color:var(--danger,#c33);font-size:.8rem;margin-bottom:8px">' + errorMsg + '</div>' : '') +
        '<input id="admin-email" type="email" placeholder="E-mail" autocomplete="email" style="margin-bottom:8px" />' +
        '<input id="admin-password" type="password" placeholder="Senha" autocomplete="current-password" />' +
        '<button class="btn btn-gold btn-block" id="admin-submit" style="margin-top:10px">Entrar</button>' +
        '<small style="display:block;margin-top:10px;color:var(--text-muted);font-size:.7rem">Esqueci senha? Studio Supabase → Authentication → Users → reset.</small>' +
      '</div>' +
      '</div>';
  }

  function dashboardShell(userEmail) {
    return '<div class="admin-page">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">' +
        '<h2>Painel Admin · Sankofa</h2>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          (userEmail ? '<span style="font-size:.78rem;color:var(--text-muted)">' + userEmail + '</span>' : '') +
          '<button class="btn btn-ghost btn-sm" id="admin-logout">Sair</button>' +
        '</div>' +
      '</div>' +
      '<p style="font-size:.78rem;color:var(--text-muted);margin:-6px 0 14px">Dados anônimos agregados. Sem identificação pessoal.</p>' +
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
        logout().then(function () { renderRoot(); });
        return;
      }
      var exportName = t.getAttribute && t.getAttribute("data-export");
      if (exportName) {
        var fileMap = {
          daily:      ["sankofa-engajamento-diario.csv",  dataCache.daily],
          difficulty: ["sankofa-dificuldade-enigmas.csv", dataCache.difficulty],
          timing:     ["sankofa-tempo-enigmas.csv",       dataCache.timing],
          emotion:    ["sankofa-emocao-enigmas.csv",      dataCache.emotion],
          clarity:    ["sankofa-clareza-enigmas.csv",     dataCache.clarity],
          hints:      ["sankofa-dicas-funil.csv",         dataCache.hints],
          age:        ["sankofa-faixa-etaria.csv",        dataCache.age]
        };
        var f = fileMap[exportName];
        if (f) downloadCSV(f[0], f[1]);
      }
    });
  }

  function attachLoginEvents(root) {
    var emailEl = root.querySelector("#admin-email");
    var passEl = root.querySelector("#admin-password");
    var btn = root.querySelector("#admin-submit");
    if (!emailEl || !passEl || !btn) return;
    emailEl.focus();
    function trySubmit() {
      var email = emailEl.value.trim();
      var pw = passEl.value;
      if (!email || !pw) return;
      btn.disabled = true;
      btn.textContent = "Autenticando...";
      login(email, pw)
        .then(function () { renderRoot(); })
        .catch(function (err) {
          var msg = (err && err.message) || "Falha de autenticação";
          var root = document.getElementById("app");
          if (root) {
            root.innerHTML = loginScreen(msg);
            attachLoginEvents(root);
          }
        });
    }
    btn.addEventListener("click", trySubmit);
    function onKey(ev) { if (ev.key === "Enter") trySubmit(); }
    emailEl.addEventListener("keydown", onKey);
    passEl.addEventListener("keydown", onKey);
  }

  function decodeJWTEmail(token) {
    try {
      var parts = token.split(".");
      if (parts.length !== 3) return null;
      var payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload.email || null;
    } catch (_) { return null; }
  }

  function renderRoot() {
    var root = document.getElementById("app");
    if (!root) return;
    if (!enabled) {
      root.innerHTML = '<div class="admin-page"><h2>Painel Admin</h2><p style="color:var(--text-muted)">Supabase não configurado. Defina window.SANKOFA_LEAGUE_CONFIG.</p></div>';
      return;
    }
    if (!isLoggedIn()) {
      // tenta refresh silencioso primeiro
      if (getRefresh()) {
        refreshSession().then(function () { renderRoot(); }).catch(function () {
          root.innerHTML = loginScreen();
          attachLoginEvents(root);
        });
        return;
      }
      root.innerHTML = loginScreen();
      attachLoginEvents(root);
      return;
    }
    var email = decodeJWTEmail(getToken());
    root.innerHTML = dashboardShell(email);
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
    logout: logout,
    isLoggedIn: isLoggedIn
  };

  // Render é chamado pelo app.js init quando detecta URL admin.
  // Não precisamos de DOMContentLoaded auto-render aqui.
})();
