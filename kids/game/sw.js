const CACHE='sankofa-rift-v16';
const ASSETS=[
  './',
  'index.html',
  'styles.css',
  'game.js',
  'phases/1-1.js',
  'phases/1-2.js',
  'phases/1-3.js',
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
  'assets/world1-2/bg-music.mp3',
  'assets/world1-3/bg-music.mp3',
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
      keys.filter(k=>k.startsWith('sankofa-rift-')&&k!==CACHE).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  const isHTML=(e.request.mode==='navigate')||
               (e.request.headers.get('accept')||'').indexOf('text/html')!==-1;
  e.respondWith(
    caches.match(e.request).then(hit=>{
      if(hit)return hit;
      return fetch(e.request).then(res=>{
        if(!res||res.status!==200||(res.type!=='basic'&&res.type!=='cors'))return res;
        const clone=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone)).catch(()=>{});
        return res;
      }).catch(()=>{
        // Only fallback to index.html for HTML requests — otherwise return
        // a 504 so non-HTML resources (audio, images, JS) fail explicitly
        // instead of being silently replaced by the HTML shell.
        if(isHTML)return caches.match('index.html');
        return new Response('',{status:504,statusText:'Network error'});
      });
    })
  );
});
