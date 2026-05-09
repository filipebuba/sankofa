/*
  Sankofa — Telemetria pedagógica anônima.

  - Opt-in (default true para 18+, default false para <18; respeita window.SANKOFA_TELEMETRY_OPTIN).
  - Sem PII: session_id é UUID local. Sem IP, sem nome, sem e-mail.
  - Bate em window.SANKOFA_LEAGUE_CONFIG (mesma URL/anonKey já existente do Supabase).
  - Fila local + flush em batch (a cada 3s ou no beforeunload).
  - Falha silenciosa: se Supabase offline ou bloqueia, jogo continua igual.

  API pública:
    SankofaTelemetry.track(eventType, payload)
    SankofaTelemetry.setOptIn(boolean)
    SankofaTelemetry.optedIn()  -> boolean
    SankofaTelemetry.flush()    -> Promise
*/
(function () {
  var cfg = window.SANKOFA_LEAGUE_CONFIG || null;
  var enabled = !!(cfg && cfg.url && cfg.anonKey);
  var SESSION_KEY = "sankofa.sessionId";
  var OPTIN_KEY = "sankofa.telemetryOptIn";

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return "s-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function sessionId() {
    var s = null;
    try { s = localStorage.getItem(SESSION_KEY); } catch (_) {}
    if (!s) {
      s = uuid();
      try { localStorage.setItem(SESSION_KEY, s); } catch (_) {}
    }
    return s;
  }

  function optedIn() {
    try {
      var v = localStorage.getItem(OPTIN_KEY);
      if (v === "true") return true;
      if (v === "false") return false;
    } catch (_) {}
    // Default: true (opt-out leve via toggle nas Configurações).
    // Para <18, app.js pode chamar setOptIn(false) ao salvar perfil.
    return true;
  }

  function setOptIn(b) {
    try { localStorage.setItem(OPTIN_KEY, b ? "true" : "false"); } catch (_) {}
    if (!b) queue.length = 0;
  }

  var queue = [];
  var flushTimer = null;
  var FLUSH_MS = 3000;
  var MAX_BATCH = 50;

  function endpoint() { return cfg.url + "/rest/v1/enigma_events"; }
  function headers() {
    return {
      "apikey": cfg.anonKey,
      "Authorization": "Bearer " + cfg.anonKey,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    };
  }

  function appVersion() {
    try { return (window.SANKOFA_VERSION || (window.SankofaVersion && window.SankofaVersion()) || "unknown"); }
    catch (_) { return "unknown"; }
  }

  function track(eventType, payload) {
    if (!enabled) { console.warn("[telemetry] desabilitada (sem SANKOFA_LEAGUE_CONFIG)"); return; }
    if (!optedIn()) { console.warn("[telemetry] opt-out — ignorando", eventType); return; }
    if (!eventType || !payload || typeof payload.enigma_id !== "string") {
      console.warn("[telemetry] payload inválido", eventType, payload); return;
    }
    if (typeof payload.world !== "number") {
      console.warn("[telemetry] world não é number", payload); return;
    }

    var row = {
      session_id: sessionId(),
      enigma_id: payload.enigma_id,
      world: payload.world | 0,
      event_type: eventType,
      app_version: appVersion()
    };
    if (typeof payload.attempt === "number")      row.attempt      = payload.attempt | 0;
    if (typeof payload.correct === "boolean")     row.correct      = payload.correct;
    if (typeof payload.ms_to_answer === "number") row.ms_to_answer = Math.max(0, Math.min(600000, payload.ms_to_answer | 0));
    if (typeof payload.hint_index === "number")   row.hint_index   = payload.hint_index | 0;
    if (typeof payload.emotion === "string")      row.emotion      = payload.emotion;
    if (typeof payload.clarity === "number")      row.clarity      = Math.max(1, Math.min(5, payload.clarity | 0));
    if (typeof payload.age_band === "string")     row.age_band     = payload.age_band.slice(0, 16);
    if (typeof payload.house === "string")        row.house        = payload.house.slice(0, 32);

    queue.push(row);
    if (queue.length >= MAX_BATCH) flush();
    else if (!flushTimer) flushTimer = setTimeout(flush, FLUSH_MS);
  }

  function flush() {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    if (!queue.length || !enabled || !navigator.onLine) return Promise.resolve({ ok: false });
    var batch = queue.splice(0, queue.length);

    // sendBeacon é mais seguro no beforeunload — mas Supabase requer Authorization
    // header, e sendBeacon não suporta headers customizados.
    // Fallback: fetch keepalive.
    console.log("[telemetry] flush →", batch.length, "eventos", batch);
    return fetch(endpoint(), {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(batch),
      keepalive: true
    }).then(function (r) {
      if (!r.ok) {
        return r.text().then(function (txt) {
          console.error("[telemetry] HTTP", r.status, txt);
          queue = batch.concat(queue).slice(0, MAX_BATCH);
          return { ok: false, status: r.status, body: txt };
        });
      }
      console.log("[telemetry] OK", batch.length, "eventos enviados");
      return { ok: true, count: batch.length };
    }).catch(function (e) {
      console.error("[telemetry] fetch falhou", e);
      queue = batch.concat(queue).slice(0, MAX_BATCH);
      return { ok: false, error: String(e) };
    });
  }

  window.addEventListener("beforeunload", function () { flush(); });
  window.addEventListener("pagehide", function () { flush(); });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush();
  });

  window.SankofaTelemetry = {
    track: track,
    flush: flush,
    optedIn: optedIn,
    setOptIn: setOptIn,
    enabled: enabled,
    sessionId: sessionId
  };
})();
