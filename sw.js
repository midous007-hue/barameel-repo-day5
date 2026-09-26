const CACHE='barameel-run-shell-v2';
const SHELL=['./','./index.html','./screen02.html','./screen03.html','./screen04.html','./screen05.html','./screen06.html','./styles.css','./app.js','./register-sw.js','./assets/screen01-start.webp','./assets/screen05-scanner.webp','./assets/screen06-puzzle.webp','./audio/tap.wav','./audio/select.wav','./audio/confirm.wav','./audio/back.wav','./audio/scan.wav','./audio/error.wav','./audio/reward-levelup.mp3'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('barameel-run-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);if(u.origin!==location.origin||e.request.method!=='GET')return;
  if(u.pathname.endsWith('/collection.json')){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));return}
  if(['.html','.js','.css'].some(ext=>u.pathname.endsWith(ext))){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));return}
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>cached)));
});
