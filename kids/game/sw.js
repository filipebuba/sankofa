const CACHE='sankofa-rift-v2';
const ASSETS=[
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/favicon.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/lucinha.png',
  'assets/vovo.png',
  'assets/bg-music.mp3',
  'assets/intro-clip.mp4',
  'assets/vovo-perfect.mp3',
  'assets/griot/fossil.mp3',
  'assets/griot/chopper.mp3',
  'assets/griot/rupestre.mp3',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(hit=>{
      if(hit)return hit;
      return fetch(e.request).then(res=>{
        if(!res||res.status!==200||(res.type!=='basic'&&res.type!=='cors'))return res;
        const clone=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone)).catch(()=>{});
        return res;
      }).catch(()=>caches.match('index.html'));
    })
  );
});
