/*
  Sankofa — Cliente do Torneio Assíncrono Semanal (Fase 1.5).

  Requer Supabase configurado em window.SANKOFA_LEAGUE_CONFIG (.url + .anonKey).
  Sem config, retorna { enabled: false } e UI esconde a feature.

  API:
    SankofaTournament.enabled        -> bool
    SankofaTournament.fetchWeek()    -> Promise<{week_iso, enigma_ids, starts_at, ends_at}>
    SankofaTournament.submit({...})  -> Promise<{ok, correct, score}>
    SankofaTournament.fetchRanking(weekId, opts?) -> Promise<row[]>
    SankofaTournament.localBest(enigmaId) -> int (best score local)
    SankofaTournament.recordAttempt(enigmaId, attempt, score, correct)
    SankofaTournament.attemptsUsed(enigmaId) -> 0..3
*/
(function () {
  var cfg = window.SANKOFA_LEAGUE_CONFIG || null;
  var enabled = !!(cfg && cfg.url && cfg.anonKey);
  var LS_KEY = "sankofa_tournament_local_v1";
  var cachedWeek = null;

  function endpoint(path) { return cfg.url + "/rest/v1/" + path; }
  function fnUrl(name)    { return cfg.url + "/functions/v1/" + name; }

  function headers(extra) {
    var h = {
      "apikey": cfg.anonKey,
      "Authorization": "Bearer " + cfg.anonKey,
      "Content-Type": "application/json"
    };
    for (var k in extra) if (extra.hasOwnProperty(k)) h[k] = extra[k];
    return h;
  }

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function writeLocal(o) { localStorage.setItem(LS_KEY, JSON.stringify(o)); }

  function localKey(weekIso, enigmaId) {
    return weekIso + "::" + enigmaId;
  }

  function attemptsUsed(weekIso, enigmaId) {
    var s = readLocal();
    var k = localKey(weekIso, enigmaId);
    return (s[k] && s[k].attempts) || 0;
  }

  function localBest(weekIso, enigmaId) {
    var s = readLocal();
    var k = localKey(weekIso, enigmaId);
    return (s[k] && s[k].best) || 0;
  }

  function recordAttempt(weekIso, enigmaId, attempt, score, correct) {
    var s = readLocal();
    var k = localKey(weekIso, enigmaId);
    var cur = s[k] || { attempts: 0, best: 0, correct: false };
    cur.attempts = Math.max(cur.attempts, attempt);
    cur.best = Math.max(cur.best, score);
    cur.correct = cur.correct || !!correct;
    cur.lastAt = new Date().toISOString();
    s[k] = cur;
    writeLocal(s);
  }

  function fetchWeek() {
    if (!enabled) return Promise.resolve(null);
    var url = endpoint("rpc/current_tournament_week");
    return fetch(url, { method: "POST", headers: headers(), body: "{}" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return null;
        if (Array.isArray(data)) return data[0] || null;
        return data;
      })
      .catch(function () { return null; });
  }

  function loadWeek() {
    return fetchWeek().then(function (w) { cachedWeek = w; return w; });
  }

  function getWeek() { return cachedWeek; }

  function isInCurrentWeek(enigmaId) {
    if (!cachedWeek || !cachedWeek.enigma_ids) return false;
    return cachedWeek.enigma_ids.indexOf(enigmaId) !== -1;
  }

  function submit(payload) {
    if (!enabled) return Promise.resolve({ ok: false, error: "tournament disabled" });
    return fetch(fnUrl("submit_tournament_answer"), {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().then(function (j) { return Object.assign({ status: r.status }, j); });
    }).catch(function (e) {
      return { ok: false, error: String(e) };
    });
  }

  function fetchRanking(weekId, opts) {
    opts = opts || {};
    if (!enabled || !weekId) return Promise.resolve([]);
    var qs = "week_id=eq." + weekId + "&order=total_score.desc&limit=" + (opts.limit || 50);
    if (opts.tag) qs += "&tag=eq." + encodeURIComponent(opts.tag);
    return fetch(endpoint("sankofa_tournament_ranking?" + qs), { headers: headers() })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; });
  }

  function totalLocalScore(weekIso, enigmaIds) {
    var sum = 0;
    for (var i = 0; i < enigmaIds.length; i++) sum += localBest(weekIso, enigmaIds[i]);
    return sum;
  }

  window.SankofaTournament = {
    enabled: enabled,
    fetchWeek: fetchWeek,
    loadWeek: loadWeek,
    getWeek: getWeek,
    isInCurrentWeek: isInCurrentWeek,
    submit: submit,
    fetchRanking: fetchRanking,
    localBest: localBest,
    attemptsUsed: attemptsUsed,
    recordAttempt: recordAttempt,
    totalLocalScore: totalLocalScore
  };
})();
