// Guarda la app en el móvil para que funcione sin conexión
const CACHE = "londres-v8";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js", "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"];
const LIVE = ["api.open-meteo.com", "api.frankfurter.app"];   // primero red, luego copia guardada
const PASS = ["en.wikipedia.org"];                              // directo a la red (la app guarda la respuesta)
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {}))))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (PASS.includes(url.hostname)) return;
  const put = res => { const copy = res.clone(); if (res.ok || res.type === "opaque") caches.open(CACHE).then(c => c.put(e.request, copy)); return res; };
  if (LIVE.includes(url.hostname) || url.pathname.endsWith("index.html") || url.pathname.endsWith("/")) {
    e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(put).catch(() => caches.match(e.request.mode === "navigate" ? "./index.html" : "__none__"))));
});
