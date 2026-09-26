/* BARAMEEL RUN — service worker intentionally disabled in v7. */
self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
// No fetch interception.
