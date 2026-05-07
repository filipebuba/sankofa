/*
  Sankofa Profiles — Liga local. Vários perfis no mesmo dispositivo.
  Cada perfil é uma cópia isolada do estado, salva sob chave própria.

  API:
    SankofaProfiles.list()                 -> [{id, name, cauris, ...}]
    SankofaProfiles.create(name)
    SankofaProfiles.switchTo(id)
    SankofaProfiles.delete(id)
    SankofaProfiles.activeId()
    SankofaProfiles.STORAGE_KEY (current)  -> dynamic key for active profile

  Active profile = whichever id is in `sankofa_active_profile`.
  Each profile state goes into `sankofa_v5_<id>`.
*/
(function () {
  var INDEX_KEY = "sankofa_profiles_index";
  var ACTIVE_KEY = "sankofa_active_profile";
  var BASE = "sankofa_v5";

  function readIndex() {
    try { return JSON.parse(localStorage.getItem(INDEX_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeIndex(arr) { localStorage.setItem(INDEX_KEY, JSON.stringify(arr)); }

  function activeId() { return localStorage.getItem(ACTIVE_KEY) || "default"; }
  function setActiveId(id) { localStorage.setItem(ACTIVE_KEY, id); }

  function storageKeyFor(id) { return BASE + "_" + id; }

  function readProfileState(id) {
    try { return JSON.parse(localStorage.getItem(storageKeyFor(id))) || {}; }
    catch (e) { return {}; }
  }

  function ensureDefault() {
    var idx = readIndex();
    if (idx.length === 0) {
      // Migração: se chave antiga sankofa_v5 existe, vira o "default".
      var legacy = localStorage.getItem(BASE);
      if (legacy) {
        localStorage.setItem(storageKeyFor("default"), legacy);
      }
      idx.push({ id: "default", createdAt: new Date().toISOString() });
      writeIndex(idx);
      setActiveId("default");
    }
    if (!localStorage.getItem(ACTIVE_KEY)) setActiveId(idx[0].id);
  }

  function list() {
    ensureDefault();
    var idx = readIndex();
    var out = [];
    for (var i = 0; i < idx.length; i++) {
      var s = readProfileState(idx[i].id);
      out.push({
        id: idx[i].id,
        name: s.name || "(sem nome)",
        cauris: s.cauris || 0,
        solved: (s.solved || []).length,
        streak: s.streak || 0,
        title: s.lastTitleRank || 1,
        tag: s.tag || "",
        ageBand: s.ageBand || "skip",
        hgaName: s.hgaName || null,
        house: s.house || null
      });
    }
    return out;
  }

  function create(name) {
    return createRich({ name: name });
  }

  function createRich(opts) {
    opts = opts || {};
    var id = "p" + Date.now().toString(36);
    var idx = readIndex();
    idx.push({ id: id, createdAt: new Date().toISOString() });
    writeIndex(idx);
    var freshState = {
      name:     (opts.name || "Viajante").toString().trim().slice(0, 24),
      hgaName:  opts.hgaName || null,
      ageBand:  opts.ageBand || "skip",
      tag:      opts.tag ? normalizeTag(opts.tag) : "",
      house:    opts.house || null,
      consent:  !!opts.consent,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(storageKeyFor(id), JSON.stringify(freshState));
    setActiveId(id);
    return id;
  }

  function normalizeTag(raw) {
    if (!raw) return "";
    var t = raw.toString()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9#-]/g, "")
      .slice(0, 24);
    if (t && t[0] !== "#") t = "#" + t;
    return t;
  }

  function isFresh() {
    ensureDefault();
    var idx = readIndex();
    if (idx.length !== 1) return false;
    var s = readProfileState(idx[0].id);
    return !s.consent;
  }

  function switchTo(id) {
    var idx = readIndex();
    for (var i = 0; i < idx.length; i++) if (idx[i].id === id) { setActiveId(id); return true; }
    return false;
  }

  function deleteProfile(id) {
    var idx = readIndex().filter(function (p) { return p.id !== id; });
    writeIndex(idx);
    localStorage.removeItem(storageKeyFor(id));
    if (activeId() === id) {
      if (idx.length > 0) setActiveId(idx[0].id);
      else { setActiveId("default"); ensureDefault(); }
    }
  }

  function localLeaderboard() {
    var arr = list().slice();
    arr.sort(function (a, b) { return b.cauris - a.cauris; });
    return arr;
  }

  ensureDefault();

  window.SankofaProfiles = {
    list: list,
    create: create,
    createRich: createRich,
    normalizeTag: normalizeTag,
    isFresh: isFresh,
    switchTo: switchTo,
    delete: deleteProfile,
    activeId: activeId,
    storageKey: function () { return storageKeyFor(activeId()); },
    localLeaderboard: localLeaderboard
  };
})();
