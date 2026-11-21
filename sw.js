const V='dfci-v24', TILES='dfci-tiles-v1';
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'].map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==TILES).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
const TILE_HOSTS=['data.geopf.fr','s3.amazonaws.com','tile.opentopomap.org','tile.openstreetmap.org'];
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url); if(e.request.method!=='GET') return;
  if(u.origin===location.origin){ // appli : réseau d'abord, cache si hors ligne
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{ const cl=r.clone(); caches.open(V).then(c=>c.put(e.request,cl)); return r; }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  const isTile=TILE_HOSTS.some(h=>u.hostname.endsWith(h)) && (/wmts|terrarium|\/\d+\/\d+\/\d+\.png/.test(u.href)) && !/geocodage|altimetrie/.test(u.href);
  if(isTile){ // tuiles : cache d'abord
    e.respondWith(caches.open(TILES).then(c=>c.match(e.request.url).then(hit=>hit||fetch(e.request).then(r=>{ if(r.ok) c.put(e.request.url,r.clone()); return r; }))));
  }
});
