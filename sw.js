const CACHE='barameel-run-shell-v1';
const SHELL=['./','./index.html','./screen02.html','./screen03.html','./screen04.html','./screen05.html','./screen06.html','./styles.css','./app.js','./assets/screen01-start.webp','./assets/screen05-scanner.webp','./assets/screen06-puzzle.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(e.request.method!=='GET')return;if(u.pathname.endsWith('/collection.json')){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));return}e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('./index.html'))))});
