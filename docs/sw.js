// Garde le «squelette» de l'application pour qu'elle s'ouvre vite et hors réseau. Les données (messages, documents) ne sont jamais gardées ici.
var V = "ldld-app-v1";
var FICHIERS = ["./", "index.html", "style.css", "app.js", "manifest.webmanifest",
  "assets/LDLD_logo_complet_blanc_transparent.png", "assets/LDLD_logo_complet_noir_transparent.png", "assets/LDLD_symbole_blanc_transparent.png"];
self.addEventListener("install", function(e){ e.waitUntil(caches.open(V).then(function(c){ return c.addAll(FICHIERS); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k.indexOf("ldld-app-") === 0 && k !== V; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var r = e.request;
  if(r.method !== "GET" || new URL(r.url).origin !== location.origin) return;   // le service Google n'est jamais mis en cache
  e.respondWith(fetch(r).then(function(rep){ var cp = rep.clone(); caches.open(V).then(function(c){ c.put(r, cp); }); return rep; }).catch(function(){ return caches.match(r); }));
});
