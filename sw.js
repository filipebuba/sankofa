/*
  Sankofa Service Worker
  ----------------------
  Precache do app shell + estratégias por tipo:
    - HTML  : network-first (apanha updates), fallback cache
    - JS/CSS: stale-while-revalidate
    - Img   : cache-first
    - Fonts : cache-first
    - Supabase REST: network-only (nunca cachear, dados ao vivo)
*/
const VERSION = "v1.5.4-dev";
const PRECACHE = "sankofa-precache-" + VERSION;
const RUNTIME = "sankofa-runtime-" + VERSION;

const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css?v=1.5.4-dev",
  "/manifest.webmanifest",

  "/src/audio.js",
  "/src/profiles.js",
  "/src/profile-modal.js",
  "/src/share.js?v=1.5.4-dev",
  "/src/accessibility.js",
  "/src/onboarding.js",
  "/src/royalty.js",
  "/src/league.js?v=1.5.4-dev",
  "/src/tournament.js",
  "/src/app.js?v=1.5.4-dev",

  "/data/worlds.js",
  "/data/enigmas.js",
  "/data/levels.js",
  "/data/achievements.js",
  "/data/titles.js",
  "/data/houses.js",
  "/data/suditos.js",
  "/data/festivals.js",
  "/data/genealogy.js",
  "/data/leagues.js",
  "/data/hga-names.js",
  "/data/blocklist.js",
  "/data/tournament-config.js",

  "/assets/favicon.png",
  "/assets/logo.png",
  "/assets/icon-192.png",
  "/assets/icon-512.png"
];

// Imagens dos mundos pesam 8 MB combinados — são adicionadas por demanda.

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(PRECACHE).then(function (c) { return c.addAll(APP_SHELL); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== PRECACHE && k !== RUNTIME) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isHTML(req) {
  return req.mode === "navigate" || (req.headers.get("accept") || "").indexOf("text/html") !== -1;
}

function isImg(url) {
  return /\.(png|jpg|jpeg|svg|webp|gif|ico)$/i.test(url.pathname);
}

function isFont(url) {
  return /\.(woff2?|ttf|otf)$/i.test(url.pathname) || url.host === "fonts.gstatic.com";
}

function isStatic(url) {
  return /\.(js|css)$/i.test(url.pathname) || url.pathname === "/manifest.webmanifest";
}

function isSupabase(url) {
  return /supabase\.co/.test(url.host);
}

function fetchFresh(req) {
  return fetch(req, { cache: "reload" });
}

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Nunca cachear chamadas Supabase
  if (isSupabase(url)) return;

  // HTML: network-first
  if (isHTML(req)) {
    event.respondWith(
      fetchFresh(req).then(function (res) {
        const copy = res.clone();
        caches.open(RUNTIME).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (m) { return m || caches.match("/index.html"); });
      })
    );
    return;
  }

  // Imagens: cache-first
  if (isImg(url)) {
    event.respondWith(
      caches.match(req).then(function (cached) {
        return cached || fetch(req).then(function (res) {
          const copy = res.clone();
          caches.open(RUNTIME).then(function (c) { c.put(req, copy); });
          return res;
        });
      })
    );
    return;
  }

  // Fonts: cache-first
  if (isFont(url) || url.host === "fonts.googleapis.com") {
    event.respondWith(
      caches.match(req).then(function (cached) {
        return cached || fetch(req).then(function (res) {
          const copy = res.clone();
          caches.open(RUNTIME).then(function (c) { c.put(req, copy); });
          return res;
        });
      })
    );
    return;
  }

  // JS/CSS/manifest: network-first para evitar app shell antigo durante desenvolvimento.
  if (isStatic(url) || url.origin === self.location.origin) {
    event.respondWith(
      fetchFresh(req).then(function (res) {
        const copy = res.clone();
        caches.open(RUNTIME).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (cached) {
          if (cached) return cached;
          return fetch(req).then(function (res) {
            const copy = res.clone();
            caches.open(RUNTIME).then(function (c) { c.put(req, copy); });
            return res;
          });
        });
      })
    );
    return;
  }
});

// Mensagem do app pode forçar update
self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});
