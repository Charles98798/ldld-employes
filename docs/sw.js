// Garde le «squelette» de l'application pour qu'elle s'ouvre vite et hors réseau. Les données (messages, documents) ne sont jamais gardées ici.
var V = "ldld-app-v437";
var FICHIERS = ["./", "index.html", "style.css", "app.js", "embauche.js", "positionnement.js", "finance.js", "production.js", "etatsfin.js", "echelle.js", "employe_actuel.js", "rencontre_dept.js", "commentaires.js", "manifest.webmanifest", "vendor/pdf.min.js", "vendor/pdf.worker.min.js",
  "plans/plan1.png", "plans/plan2.png", "plans/plan3.png", "plans/plan_stationnement.png", "fonts/Archivo-200.woff2", "fonts/Archivo-300.woff2", "fonts/Archivo-400.woff2", "fonts/Archivo-500.woff2", "fonts/Inter.woff2",
  "assets/LDLD_logo_complet_blanc_transparent.png", "assets/LDLD_logo_complet_noir_transparent.png", "assets/LDLD_symbole_blanc_transparent.png"];
// cache "reload": jamais une vieille copie du cache HTTP du navigateur (GitHub Pages: 10 min)
self.addEventListener("install", function(e){ e.waitUntil(caches.open(V).then(function(c){ return Promise.all(FICHIERS.map(function(f){ return c.add(new Request(f, {cache: "reload"})); })); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k.indexOf("ldld-app-") === 0 && k !== V; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var r = e.request;
  if(r.method !== "GET" || new URL(r.url).origin !== location.origin) return;   // le service Google n'est jamais mis en cache
  e.respondWith(fetch(r).then(function(rep){ var cp = rep.clone(); caches.open(V).then(function(c){ c.put(r, cp); }); return rep; }).catch(function(){ return caches.match(r); }));
});

// Notifications : le service envoie un signal sans contenu; on affiche un texte général (aucun détail confidentiel).
self.addEventListener("push", function(e){
  e.waitUntil(self.registration.showNotification("Lafond Desjardins", {body:"Un message, un document ou un rappel vous attend dans l'application.", icon:"icons/icon-512-v6.png", badge:"icons/icon-512-v6.png", tag:"ldld-nouveau"}));
});
self.addEventListener("notificationclick", function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window", includeUncontrolled:true}).then(function(l){ if(l.length) return l[0].focus(); return self.clients.openWindow("./"); }));
});
