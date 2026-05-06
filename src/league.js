/*
  Liga dos Griôs — cliente Supabase mínimo (opt-in).
  Não bloqueia o jogo se offline ou não configurado.

  Setup do projeto:
    SUPABASE_URL e SUPABASE_ANON_KEY aparecem em window.SANKOFA_LEAGUE_CONFIG.
    Para desativar liga global, deixar window.SANKOFA_LEAGUE_CONFIG = null.

  Tabela esperada (Supabase):
    create table league_scores (
      handle text primary key,
      cauris int not null default 0,
      title  text,
      house  text,
      week_start date not null,
      updated_at timestamptz not null default now()
    );
    create index league_scores_week_idx on league_scores(week_start, cauris desc);

  RLS recomendada:
    enable RLS; policy "read all" using (true);
    policy "upsert own" with check (true);
*/
(function () {
  var cfg = window.SANKOFA_LEAGUE_CONFIG || null;
  var enabled = !!(cfg && cfg.url && cfg.anonKey);
  var cache = { rows: [], activeCount: 0, fetchedAt: 0 };

  function endpoint(path) { return cfg.url + "/rest/v1/" + path; }

  function headers(extra) {
    var h = {
      "apikey": cfg.anonKey,
      "Authorization": "Bearer " + cfg.anonKey,
      "Content-Type": "application/json"
    };
    for (var k in extra) if (extra.hasOwnProperty(k)) h[k] = extra[k];
    return h;
  }

  function isOnline() { return enabled && navigator.onLine; }

  function week() { return window.SANKOFA_LEAGUE_WEEK_START(); }

  function submit(payload) {
    if (!isOnline()) return Promise.resolve({ ok: false, reason: "offline" });
    var row = {
      handle: payload.handle,
      cauris: payload.cauris | 0,
      title: payload.title || "",
      house: payload.house || "",
      week_start: week(),
      updated_at: new Date().toISOString()
    };
    return fetch(endpoint("league_scores?on_conflict=handle"), {
      method: "POST",
      headers: headers({ "Prefer": "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify(row)
    }).then(function (r) {
      return { ok: r.ok, status: r.status };
    }).catch(function (e) {
      return { ok: false, error: String(e) };
    });
  }

  function topRows(limit) {
    if (!isOnline()) return Promise.resolve([]);
    var url = endpoint("league_scores?select=handle,cauris,title,house,week_start") +
      "&week_start=eq." + week() +
      "&order=cauris.desc&limit=" + (limit || 50);
    return fetch(url, { headers: headers() })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; });
  }

  function activeCount() {
    if (!isOnline()) return Promise.resolve(0);
    var url = endpoint("league_scores?select=handle&week_start=eq." + week());
    return fetch(url, { headers: headers({ "Prefer": "count=exact", "Range-Unit": "items", "Range": "0-0" }) })
      .then(function (r) {
        var range = r.headers.get("content-range") || "";
        var m = range.match(/\/(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      }).catch(function () { return 0; });
  }

  function refresh() {
    if (!isOnline()) return Promise.resolve(cache);
    return Promise.all([topRows(50), activeCount()]).then(function (res) {
      cache.rows = res[0];
      cache.activeCount = res[1];
      cache.fetchedAt = Date.now();
      return cache;
    });
  }

  function tier(rank, total) {
    var leagues = window.SANKOFA_LEAGUES || [];
    if (!total || rank < 1) return leagues[0];
    var pct = ((total - rank) / total) * 100;
    var current = leagues[0];
    for (var i = 0; i < leagues.length; i++) if (pct >= leagues[i].minPct) current = leagues[i];
    return current;
  }

  function findRank(handle) {
    for (var i = 0; i < cache.rows.length; i++) if (cache.rows[i].handle === handle) return i + 1;
    return -1;
  }

  window.SankofaLeague = {
    enabled: enabled,
    isOnline: isOnline,
    submit: submit,
    refresh: refresh,
    cache: cache,
    tier: tier,
    findRank: findRank,
    week: week
  };
})();
