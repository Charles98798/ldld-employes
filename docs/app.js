// Étape 1 : démarrage, connexion et menu. Aucune donnée réelle : la connexion et les sections sont des gabarits.
var SECTIONS = ["Messages", "Manuel d'employé", "Autoévaluation", "Rémunération", "Tableau de bord", "Plan d'incendie", "Calendrier", "Rencontre", "Mon profil"];
var app = document.getElementById("app");

function demarrage(){
  app.innerHTML = '<div class="demarrage"><img src="assets/LDLD_logo_complet_blanc_transparent.png" alt="Lafond Desjardins laboratoire dentaire"></div>';
  setTimeout(ouvrirSession, 1500);
}
// Service LDLD (Google Apps Script) : connexion par code envoyé au courriel LDLD; il ne répond qu'avec les données de l'employé connecté.
var URL_SERVICE = "https://script.google.com/macros/s/AKfycbwq9SXysg5GHL6GsPFBSTmoKZzm9_wGr4E3W0e-RzXcHeknz5_DMBFIxBarHHczgpwnZw/exec";
var MOI = null;   // {nom, poste, responsable} après connexion
function appelService(corps){
  var ctl = window.AbortController ? new AbortController() : null, t = ctl ? setTimeout(function(){ ctl.abort(); }, 30000) : 0;   // jamais de « CHARGEMENT… » sans fin
  return fetch(URL_SERVICE, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body: JSON.stringify(corps), signal: ctl ? ctl.signal : undefined})
    .then(function(r){ clearTimeout(t); return r.json(); }, function(e){ clearTimeout(t); throw e; });
}

// Tout est préchargé avant l'arrivée sur la page : copie locale affichée tout de suite, vérification silencieuse ensuite.
var CACHE = {};
function lireCache(cle){ if(CACHE[cle]) return CACHE[cle]; try { var v = JSON.parse(localStorage.getItem("ldld-c-"+cle)); if(v) CACHE[cle] = v; return v; } catch(e){ return null; } }
function chercher(cle, corps){
  corps.session = sessionGardee();
  return appelService(corps).then(function(r){ if(r && r.ok){ CACHE[cle] = r; try { localStorage.setItem("ldld-c-"+cle, JSON.stringify(r)); } catch(e){} } return r; });
}
function viderCache(){ CACHE = {}; try { Object.keys(localStorage).forEach(function(k){ if(k.indexOf("ldld-c-") === 0) localStorage.removeItem(k); }); } catch(e){} }
/** Affiche la copie locale (sans écran de chargement) puis remplace en silence si la version a changé. */
function obtenir(cle, corps, afficher, erreur, majSilencieuse){
  var local = lireCache(cle);
  if(local){ afficher(local);
    if(majSilencieuse) chercher(cle, corps).then(function(r){ if(r && r.ok && JSON.stringify(r) !== JSON.stringify(local)) afficher(r); }).catch(function(){});
    return; }
  chercher(cle, corps).then(function(r){ if(!r || !r.ok){ var e = new Error("service"); e.reponse = r; throw e; } afficher(r); }).catch(erreur);
}
function pastilleMessages(){
  var a = app.querySelector('a[data-i="0"]'); if(!a) return;
  var m = lireCache("messages"), l = lus(), n = m && m.messages ? m.messages.filter(function(x){ return !x.envoye && l.indexOf(x.id) < 0; }).length : 0;
  var p = a.querySelector(".nombre"); if(p) p.remove();
  if(n){ p = document.createElement("span"); p.className = "nombre"; p.textContent = n + " NOUVEAU" + (n > 1 ? "X" : ""); a.appendChild(p); }
}
function pastilleAuto(){
  var a = app.querySelector('a[data-i="2"]'); if(!a) return;
  var ae = lireCache("ae"), reste = ae && ae.rencontres && ae.rencontres.some(function(m){ return !m.terminee; });
  var p = a.querySelector(".pastille"); if(p) p.remove();
  if(reste){ p = document.createElement("span"); p.className = "pastille"; p.setAttribute("aria-label","À remplir"); a.appendChild(p); }
}
function precharger(){
  chercher("messages", {action:"messages"}).then(pastilleMessages).catch(function(){});
  chercher("tableau", {action:"tableau"}).catch(function(){});
  chercher("incendie_texte", {action:"incendie_texte"}).then(function(r){ if(r && r.nbImages){ for(var i = 0; i < r.nbImages; i++){ (function(i){ var cle = "incimg"+(r.version || "")+"_"+i; if(!lireCache(cle)) chercher(cle, {action:"incendie_image", i:i}).catch(function(){}); })(i); } } }).catch(function(){});
  chercher("manuel_texte", {action:"manuel_texte"}).catch(function(){});
  chercher("calendrier", {action:"calendrier"}).catch(function(){});
  chercher("ae", {action:"ae_lire"}).then(function(r){
    pastilleAuto();
    if(r && r.ok && r.rencontres) r.rencontres.forEach(function(m){ chercher("ae"+m.rencontre, {action:"ae_lire", rencontre:m.rencontre}).catch(function(){}); });
  }).catch(function(){});
}
function sessionGardee(){ try { return localStorage.getItem("ldld-session"); } catch(e){ return null; } }
function garderSession(s){ if(!s) viderCache(); try { if(s) localStorage.setItem("ldld-session", s); else localStorage.removeItem("ldld-session"); } catch(e){} }
function ouvrirSession(){
  var s = sessionGardee();
  if(!s) return connexion();
  appelService({action:"moi", session:s}).then(function(r){
    if(r && r.ok){ MOI = r; menu(); } else { garderSession(null); connexion(); }
  }).catch(function(){ connexion("Pas de réseau. Réessayez."); });
}
function deconnecter(){
  var s = sessionGardee(); garderSession(null); MOI = null;
  if(s) appelService({action:"sortie", session:s}).catch(function(){});
  connexion();
}
function connexion(message){
  app.innerHTML = '<div class="connexion"><img class="logo" width="120" height="100" src="assets/LDLD_logo_complet_blanc_transparent.png" alt="Lafond Desjardins">' +
    '<div class="formc"><label class="etq" for="courriel">▪ COURRIEL</label><input class="champ ligne3" id="courriel" type="email" inputmode="email" autocomplete="email" placeholder="nom@exemple.com">' +
    '<button class="bouton" id="envoi">Recevoir mon code →</button></div>' +
    '<p class="aide" id="msg">'+(message||"")+'</p><div class="pied-connexion"><span class="ldld"><b>L</b><b>D</b><b>L</b><b>D</b></span><span class="emp"><b>E</b><b>M</b><b>P</b><b>L</b><b>O</b><b>Y</b><b>É</b><b>S</b></span></div></div>';
  document.getElementById("envoi").onclick = function(){
    var c = document.getElementById("courriel").value.trim().toLowerCase(), msg = document.getElementById("msg");
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c)){ msg.textContent = "Entrez votre courriel."; return; }
    msg.textContent = "Envoi du code…";
    appelService({action:"code", courriel:c}).then(function(){ saisieCode(c); })
      .catch(function(){ msg.textContent = "Envoi impossible. Vérifiez le réseau et réessayez."; });
  };
}
function saisieCode(c){
  app.innerHTML = '<div class="connexion"><img class="logo" width="120" height="100" src="assets/LDLD_logo_complet_blanc_transparent.png" alt="Lafond Desjardins">' +
    '<div class="formc"><label class="etq" for="code">▪ CODE À 6 CHIFFRES</label><input class="champ ligne3" id="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" style="letter-spacing:6px;font-size:24px">' +
    '<button class="bouton" id="valider">Se connecter →</button></div>' +
    '<p class="aide" id="msg">Code envoyé à '+esc(c)+'. Il est valide 10 minutes. Vérifiez aussi les indésirables.</p>' +
    '<p class="aide"><a href="#" id="autre">← Changer de courriel</a></p></div>';
  document.getElementById("autre").onclick = function(e){ e.preventDefault(); connexion(); };
  document.getElementById("valider").onclick = function(){
    var code = document.getElementById("code").value.replace(/\D/g,""), msg = document.getElementById("msg");
    if(code.length !== 6){ msg.textContent = "Entrez les 6 chiffres du code."; return; }
    msg.textContent = "Vérification…";
    appelService({action:"verifier", courriel:c, code:code}).then(function(r){
      if(r && r.ok){ garderSession(r.session); MOI = r; menu(); } else { msg.textContent = "Code invalide ou expiré. Demandez-en un nouveau."; }
    }).catch(function(){ msg.textContent = "Connexion impossible. Réessayez."; });
  };
}
// Notifications (Web Push). Actives par défaut : la demande s'affiche à la première connexion; l'employé peut les couper dans Mon profil.
var VAPID_PUBLIC = "BGiQdAGk_BJzz2lA1osvltqAXV9h01dUGPH1ByDqgo9loCXi-VnLLxzmlCrd0XHdQNck0wHax2SWw0g0kcccIbg";
function notifPossible(){ return ("serviceWorker" in navigator) && ("PushManager" in window) && ("Notification" in window); }
function cleBinaire(b64){ var p = "=".repeat((4 - b64.length % 4) % 4), r = atob((b64 + p).replace(/-/g, "+").replace(/_/g, "/")), o = new Uint8Array(r.length); for(var i = 0; i < r.length; i++) o[i] = r.charCodeAt(i); return o; }
function abonnerNotifs(){
  return navigator.serviceWorker.ready.then(function(reg){
    return reg.pushManager.getSubscription().then(function(s){ return s || reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey: cleBinaire(VAPID_PUBLIC)}); });
  }).then(function(s){ return appelService({action:"abonner", session:sessionGardee(), endpoint:s.endpoint}); });
}
function demanderNotifs(){
  if(!notifPossible()) return Promise.resolve(false);
  return Notification.requestPermission().then(function(p){ return p === "granted" ? abonnerNotifs().then(function(){ return true; }) : false; });
}
function couperNotifs(){
  return navigator.serviceWorker.ready.then(function(reg){ return reg.pushManager.getSubscription(); }).then(function(s){
    if(!s) return; var ep = s.endpoint; return s.unsubscribe().then(function(){ return appelService({action:"desabonner", session:sessionGardee(), endpoint:ep}); });
  });
}
function ecranNotifs(){
  app.innerHTML = '<div class="menu"><img class="logo" width="120" height="100" src="assets/LDLD_logo_complet_blanc_transparent.png" alt="Lafond Desjardins"><div class="nom">Notifications</div>' +
    '<p class="aide" style="padding:0 24px">Soyez avisé dès qu\'un message arrive ou qu\'un document est mis à jour. Aucun détail confidentiel n\'est affiché. Vous pouvez les couper à tout moment dans Mon profil.</p>' +
    '<a href="#" id="notifOui">▪ Activer les notifications</a><a href="#" id="notifPlus" style="opacity:.6">Plus tard</a></div>';
  function fini(){ try { localStorage.setItem("ldld-notif-demande", "1"); } catch(e){} menu(); }
  document.getElementById("notifOui").onclick = function(e){ e.preventDefault(); demanderNotifs().then(fini).catch(fini); };
  document.getElementById("notifPlus").onclick = function(e){ e.preventDefault(); fini(); };
}
function menu(){
  var dejaDemande = false; try { dejaDemande = localStorage.getItem("ldld-notif-demande") === "1"; } catch(e){}
  if(notifPossible() && !dejaDemande && Notification.permission === "default") return ecranNotifs();
  if(notifPossible() && Notification.permission === "granted" && !menu.abonne){ menu.abonne = true; abonnerNotifs().catch(function(){}); }
  if(!menu.precharge){ menu.precharge = true; prechargerDocs(); }
  precharger();
  app.innerHTML = '<div class="menu"><img class="logo" width="120" height="100" src="assets/LDLD_logo_complet_blanc_transparent.png" alt="Lafond Desjardins"><div class="nom">'+esc((MOI && MOI.nom) || "")+'</div>' +
    SECTIONS.map(function(n, i){ return '<a href="#" data-i="'+i+'">▪ '+n+'</a>'; }).join("") +
    '<img class="symbole" src="assets/LDLD_symbole_blanc_transparent.png" alt="">' +
    '<a class="sortie" href="#" id="sortie">Déconnexion →</a></div>';
  Array.prototype.forEach.call(app.querySelectorAll("a[data-i]"), function(a){
    a.onclick = function(e){ e.preventDefault(); section(+a.getAttribute("data-i")); };
  });
  document.getElementById("sortie").onclick = function(e){ e.preventDefault(); deconnecter(); };
  pastilleAuto(); pastilleMessages();
}
// Étape 2 : messages, lus et écrits par le service Google Apps Script (chaque employé ne reçoit que les siens).
var MESSAGES = [];
function lus(){ try { return JSON.parse(localStorage.getItem("ldld-lus") || "[]"); } catch(e){ return []; } }
function noterLu(id){ var l = lus(); if(l.indexOf(id) < 0){ l.push(id); try { localStorage.setItem("ldld-lus", JSON.stringify(l)); } catch(e){} } }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
var MOIS = ["JANV.","FÉVR.","MARS","AVR.","MAI","JUIN","JUIL.","AOÛT","SEPT.","OCT.","NOV.","DÉC."];
function dateCourte(t){ var d = new Date(t); return d.getDate()+" "+MOIS[d.getMonth()]+" "+d.getFullYear(); }
function peutEcrire(){ return MOI && (MOI.role === "direction" || MOI.role === "responsable"); }
function messages(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Messages</h1><div id="liste"><div class="bandeau">▪ CHARGEMENT…</div></div>' +
    (peutEcrire() ? '<a class="rang" href="#" id="ecrire">▪ Écrire un message</a>' : '') + '</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  var w = document.getElementById("ecrire"); if(w) w.onclick = function(e){ e.preventDefault(); rediger(); };
  obtenir("messages", {action:"messages"}, function(r){
    if(!document.getElementById("liste")) return;
    MESSAGES = r.messages; var l = lus();
    document.getElementById("liste").innerHTML = MESSAGES.length ? MESSAGES.map(function(m){
      return '<a class="rang" href="#" data-id="'+esc(m.id)+'"><span class="pl">+</span>'+esc(m.titre)+(!m.envoye && l.indexOf(m.id) < 0 ? '<span class="neuf">NOUVEAU</span>' : '')+
        '<small>'+(m.envoye ? 'Envoyé à '+m.nb+' personne'+(m.nb > 1 ? 's' : '') : esc(m.de))+' · '+dateCourte(m.date)+'</small></a>'; }).join("") : '<div class="bandeau">▪ AUCUN MESSAGE</div>';
    Array.prototype.forEach.call(app.querySelectorAll("a[data-id]"), function(a){
      a.onclick = function(e){ e.preventDefault(); detail(a.getAttribute("data-id")); };
    });
  }, function(){ document.getElementById("liste").innerHTML = '<div class="bandeau">▪ MESSAGES INDISPONIBLES · RÉESSAYEZ</div>'; }, true);
}
function detail(id){
  var m = MESSAGES.filter(function(x){ return x.id === id; })[0]; noterLu(id);
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>'+esc(m.titre)+'</h1><div class="date">'+esc(m.de)+' · '+dateCourte(m.date)+'</div><div class="corps">'+esc(m.texte).replace(/\n/g,"<br>")+'</div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); messages(); };
  if(!m.envoye && /^Demande de rencontre/.test(m.titre) && peutEcrire()){
    app.querySelector(".page").insertAdjacentHTML("beforeend", '<div class="etiq">▪ DATE ET HEURE</div><div class="dh"><input class="champ" id="rdate" type="date"><input class="champ" id="rheure" type="time" step="900"></div>' +
      '<button class="bouton" id="rplan">Planifier →</button><div class="bandeau" id="rep" style="display:none"></div>');
    var rep = document.getElementById("rep"); function dire(t){ rep.style.display = "block"; rep.textContent = t; }
    document.getElementById("rplan").onclick = function(){
      var d = document.getElementById("rdate").value, h = document.getElementById("rheure").value;
      if(!d || !h){ dire("▪ DATE ET HEURE REQUISES"); return; }
      var bt = this; bt.disabled = true; dire("▪ ENVOI…");
      appelService({action:"rencontre_planifier", session:sessionGardee(), id:id, date:d, heure:h}).then(function(r){
        if(r && r.ok){ dire("▪ RENCONTRE PLANIFIÉE · L'EMPLOYÉ EST AVISÉ"); }
        else { bt.disabled = false; dire("▪ NON PLANIFIÉE · "+((r && r.erreur) || "RÉESSAYEZ")); }
      }).catch(function(){ bt.disabled = false; dire("▪ NON PLANIFIÉE · RÉSEAU"); });
    };
  }
}
function rediger(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Nouveau message</h1>' +
    '<input class="champ" id="titre" placeholder="Titre" maxlength="120"><textarea class="champ zone" id="texte" placeholder="Texte du message…"></textarea>' +
    '<div class="etiq">▪ DESTINATAIRES</div><div id="dest"><div class="bandeau">▪ CHARGEMENT…</div></div>' +
    '<button class="bouton" id="envoyer">Envoyer →</button><div class="bandeau" id="etat" style="display:none"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); messages(); };
  var gens = [], etat = document.getElementById("etat");
  function dire(t){ etat.style.display = "block"; etat.textContent = t; }
  appelService({action:"equipe", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0; gens = r.personnes;
    document.getElementById("dest").innerHTML = '<label class="coche"><input type="checkbox" id="tous" checked> Toute mon équipe ('+gens.length+')</label>' +
      gens.map(function(p, i){ return '<label class="coche"><input type="checkbox" class="un" data-c="'+esc(p.c)+'"> '+esc(p.nom)+'</label>'; }).join("");
  }).catch(function(){ dire("▪ LISTE INDISPONIBLE · RÉESSAYEZ"); });
  document.getElementById("envoyer").onclick = function(){
    var titre = document.getElementById("titre").value.trim(), texte = document.getElementById("texte").value.trim();
    if(!titre || !texte){ dire("▪ TITRE ET TEXTE REQUIS"); return; }
    var choisis = Array.prototype.filter.call(app.querySelectorAll(".un"), function(x){ return x.checked; }).map(function(x){ return x.getAttribute("data-c"); });
    var tous = document.getElementById("tous"), dest = (tous && tous.checked) ? "tous" : choisis;
    if(dest !== "tous" && !dest.length){ dire("▪ CHOISISSEZ AU MOINS UNE PERSONNE"); return; }
    var bt = document.getElementById("envoyer"); bt.disabled = true; dire("▪ ENVOI…");
    appelService({action:"envoyer", session:sessionGardee(), titre:titre, texte:texte, destinataires:dest}).then(function(r){
      if(r && r.ok){ dire("▪ ENVOYÉ À "+r.nb+" PERSONNE"+(r.nb > 1 ? "S" : "")); setTimeout(messages, 1200); }
      else { bt.disabled = false; dire("▪ NON ENVOYÉ · "+((r && r.erreur) || "RÉESSAYEZ")); }
    }).catch(function(){ bt.disabled = false; dire("▪ NON ENVOYÉ · RÉSEAU"); });
  };
}
// Étape 3 : manuel. Documents d'essai; plus tard : le PDF personnel de chaque employé, listé par le service Google Apps Script.
var CACHE = "ldld-docs";
function versions(){ try { return JSON.parse(localStorage.getItem("ldld-versions") || "{}"); } catch(e){ return {}; } }
function noterVersion(id, v){ var x = versions(); x[id] = v; try { localStorage.setItem("ldld-versions", JSON.stringify(x)); } catch(e){} }
function etat(d){ var v = versions()[d.id]; return !v ? "non" : (v === d.version ? "ok" : "maj"); }
function telecharger(d){
  return fetch(d.fichier).then(function(r){
    if(!r.ok) throw 0;
    return self.caches ? caches.open(CACHE).then(function(c){ return c.put(d.fichier, r.clone()); }) : 0;
  }).then(function(){ noterVersion(d.id, d.version); });
}
// Préchargement : dès l'ouverture de l'application (menu) et à chaque retour, chaque document est téléchargé ou mis à jour en arrière-plan, avant que l'employé ouvre la section.
var DOCS_SERVICE = ["manuel", "incendie"];   // chaque nom = actions « nom_liste » et « nom_fichier » du service
function cleDoc(d){ return "doc/"+d.id+".pdf"; }
function telechargerDoc(p, d){
  return appelService({action:p+"_fichier", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0;
    var bin = atob(r.pdf), oct = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) oct[i] = bin.charCodeAt(i);
    var rep = new Response(new Blob([oct], {type:"application/pdf"}));
    return (self.caches ? caches.open(CACHE).then(function(c){ return c.put(cleDoc(d), rep); }) : 0).then(function(){ d.version = r.version; noterVersion(d.id, r.version); });
  });
}
function prechargerDocs(){
  return Promise.all(DOCS_SERVICE.map(function(p){
    return appelService({action:p+"_liste", session:sessionGardee()}).then(function(r){
      if(!r || !r.ok) return;
      try { localStorage.setItem("ldld-liste-"+p, JSON.stringify(r.documents)); } catch(e){}
      return Promise.all(r.documents.filter(function(d){ return etat(d) !== "ok"; }).map(function(d){ return telechargerDoc(p, d).catch(function(){}); }));
    }).catch(function(){});
  }));
}
document.addEventListener("visibilitychange", function(){ if(document.visibilityState === "visible" && sessionGardee() && MOI){ prechargerDocs(); precharger(); } });
// Visionneuse intégrée (consultation seulement) : le PDF est dessiné page par page dans l'application, sans barre ni bouton d'enregistrement.
function chargerScript(src){ return new Promise(function(ok, ko){ var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
function visionneuse(titre, blob, retour){
  app.innerHTML = '<div class="page vue"><a class="retour" href="#" id="retour">← Retour</a><h1>'+esc(titre)+'</h1><div id="pages"><div class="bandeau">▪ OUVERTURE…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); retour(); };
  var zone = document.getElementById("pages");
  zone.oncontextmenu = function(e){ e.preventDefault(); };
  (window.pdfjsLib ? Promise.resolve() : chargerScript("vendor/pdf.min.js")).then(function(){
    pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdf.worker.min.js";
    return blob.arrayBuffer();
  }).then(function(buf){ return pdfjsLib.getDocument({data: buf}).promise; }).then(function(pdf){
    zone.innerHTML = "";
    var largeur = zone.clientWidth || 340, ratio = Math.min(window.devicePixelRatio || 1, 2);
    var suite = Promise.resolve();
    for(var n = 1; n <= pdf.numPages; n++){ (function(n){ suite = suite.then(function(){ return pdf.getPage(n).then(function(page){
      var v1 = page.getViewport({scale: 1}), sc = largeur / v1.width, v = page.getViewport({scale: sc * ratio});
      var c = document.createElement("canvas"); c.width = v.width; c.height = v.height; c.style.width = largeur + "px"; c.style.height = (v.height / ratio) + "px";
      zone.appendChild(c); return page.render({canvasContext: c.getContext("2d"), viewport: v}).promise; }); }); })(n); }
    return suite;
  }).catch(function(){ zone.innerHTML = '<div class="bandeau">▪ DOCUMENT INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function sectionDocs(p, titre, aide){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>'+titre+'</h1>' +
    '<div id="liste"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  var liste = document.getElementById("liste"), unique = false;
  function ouvrir(d, reprise){
    (self.caches ? caches.open(CACHE).then(function(c){ return c.match(cleDoc(d)); }) : Promise.resolve(null)).then(function(r){
      if(!r) throw 0; return r.blob(); }).then(function(b){ visionneuse(d.nom, b, function(){ if(unique) menu(); else sectionDocs(p, titre, aide); }); }).catch(function(){
      // copie locale absente : on la télécharge de nouveau une fois, sinon message visible
      if(!reprise) return telechargerDoc(p, d).then(function(){ ouvrir(d, true); }).catch(function(){ liste.insertAdjacentHTML("beforeend", '<div class="bandeau">▪ DOCUMENT INDISPONIBLE · RÉESSAYEZ</div>'); });
      liste.insertAdjacentHTML("beforeend", '<div class="bandeau">▪ DOCUMENT INDISPONIBLE · RÉESSAYEZ</div>');
    });
  }
  function dessinerD(docs){
    if(docs.length === 1){ unique = true; var d1 = docs[0];   // un seul document : on l'ouvre directement
      if(etat(d1) === "ok" || etat(d1) === "maj") return ouvrir(d1);
      liste.innerHTML = '<div class="bandeau">▪ OUVERTURE…</div>';
      return telechargerDoc(p, d1).then(function(){ ouvrir(d1); }).catch(function(){ liste.innerHTML = '<div class="bandeau">▪ DOCUMENT INDISPONIBLE · RÉESSAYEZ</div>'; }); }
    liste.innerHTML = docs.map(function(d){ var e = etat(d);
      return '<a class="doc" href="#" data-id="'+d.id+'"><span>▪ '+esc(d.nom)+'</span><em class="'+e+'">'+(e === "ok" || e === "maj" ? "→" : "…")+'</em></a>'; }).join("");
    Array.prototype.forEach.call(liste.querySelectorAll("a.doc"), function(a){
      a.onclick = function(ev){ ev.preventDefault(); var d = docs.filter(function(x){ return x.id === a.getAttribute("data-id"); })[0];
        if(etat(d) === "ok" || etat(d) === "maj") return ouvrir(d);
        a.querySelector("em").textContent = "OUVERTURE…"; telechargerDoc(p, d).then(function(){ dessinerD(docs); ouvrir(d); }).catch(function(){ a.querySelector("em").textContent = "RÉESSAYEZ"; }); };
    });
  }
  var avant = null; try { avant = JSON.parse(localStorage.getItem("ldld-liste-"+p)); } catch(e){}
  if(avant && avant.length) dessinerD(avant);
  appelService({action:p+"_liste", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0;
    try { localStorage.setItem("ldld-liste-"+p, JSON.stringify(r.documents)); } catch(e){}
    if(avant && avant.length && JSON.stringify(avant) === JSON.stringify(r.documents)) return;
    if(unique && r.documents.length === 1 && avant && avant.length === 1 && avant[0].id === r.documents[0].id && etat(r.documents[0]) === "ok") return;
    dessinerD(r.documents);
    r.documents.filter(function(d){ return etat(d) !== "ok"; }).forEach(function(d){ telechargerDoc(p, d).then(function(){ dessinerD(r.documents); }).catch(function(){}); });
  }).catch(function(){ var l; try { l = JSON.parse(localStorage.getItem("ldld-liste-"+p)); } catch(e){} if(l) dessinerD(l); else liste.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function numTitre(t){ var m = /^(\d\d)\s+(.*)$/.exec(t); return m ? '<span class="nm">'+esc(m[1])+'</span><span class="tt">'+esc(m[2])+'</span>' : esc(t); }
function blocsHtml(blocs){
  return blocs.map(function(b){
    if(b.t === "h") return '<h2 class="txh">'+numTitre(b.v)+'</h2>';
    if(b.t === "s") return '<div class="txs">'+esc(b.v)+'</div>';
    if(b.t === "p") return '<p class="txp">'+esc(b.v)+'</p>';
    if(b.t === "u") return '<div class="txu"><b>'+esc(b.titre||"")+'</b>'+esc(b.v)+'</div>';
    if(b.t === "li") return '<ul class="txl">'+b.v.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ul>';
    if(b.t === "ol") return '<ol class="txl">'+b.v.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ol>';
    if(b.t === "kv") return '<dl class="txk">'+b.v.map(function(x){ return '<dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd>'; }).join("")+'</dl>';
    if(b.t === "tab") return '<div class="txtab"><table>'+b.v.map(function(l,i){ return '<tr>'+l.map(function(c){ return (i?'<td>':'<th>')+esc(c)+(i?'</td>':'</th>'); }).join("")+'</tr>'; }).join("")+'</table></div>';
    if(b.t === "img") return b.i !== undefined ? '<img class="txi vide" alt="" data-i="'+b.i+'">' : '<img class="txi" alt="" src="'+b.v+'">';
    return "";
  }).join("");
}
function sansAccent(t){ return String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
// Manuel en texte : recherche par mot (sans accents ni majuscules), table des matières; sans réponse du service, l'ancien affichage PDF reste en place.
function manuel(){
  var repli = function(){ var e = document.getElementById("mn"); if(e) e.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; };
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Manuel d\'employé</h1><div id="mn"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  obtenir("manuel_texte", {action:"manuel_texte"}, function(r){
    var el = document.getElementById("mn"); if(!el) return;
    if(!r.blocs){ return repli(); }
    var secs = [], cur = {titre:"", blocs:[]};
    r.blocs.forEach(function(b){ if(b.t === "h"){ if(cur.blocs.length || cur.titre) secs.push(cur); cur = {titre:b.v, blocs:[b]}; } else cur.blocs.push(b); });
    secs.push(cur);
    secs.forEach(function(x){ x.texte = sansAccent(JSON.stringify(x.blocs.map(function(b){ return b.v; }))); });
    var q0 = "";
    el.innerHTML = '<input class="rech" id="rech" type="search" placeholder="Rechercher un mot" autocomplete="off" aria-label="Rechercher un mot"><div id="res"></div><div id="corps"></div>';
    var rech = document.getElementById("rech"), res = document.getElementById("res"), corps = document.getElementById("corps");
    function toc(){
      res.innerHTML = '<div class="txs">TABLE DES MATIÈRES</div><ol class="toc">'+secs.map(function(x,i){ return x.titre ? '<li><a href="#" data-s="'+i+'">'+numTitre(x.titre)+'</a></li>' : ""; }).join("")+'</ol>';
    }
    function ouvrir(i, mot){
      res.innerHTML = ""; rech.value = mot || ""; corps.innerHTML = blocsHtml(secs[i].blocs);
      if(mot) surligner(corps, mot);
      var m = corps.querySelector("mark"); window.scrollTo(0, 0); if(m) m.scrollIntoView({block:"center"});
      corps.insertAdjacentHTML("afterbegin", '<a class="retour" href="#" id="toc">← Table des matières</a>');
      document.getElementById("toc").onclick = function(e){ e.preventDefault(); corps.innerHTML = ""; rech.value = ""; toc(); };
    }
    function surligner(racine, mot){
      var n = sansAccent(mot), w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT), noeuds = [], t;
      while((t = w.nextNode())) noeuds.push(t);
      noeuds.forEach(function(nd){
        var txt = nd.nodeValue, bas = sansAccent(txt), k = bas.indexOf(n); if(k < 0 || bas.length !== txt.length) return;
        var f = document.createDocumentFragment(), d = 0;
        while(k >= 0){ f.appendChild(document.createTextNode(txt.slice(d, k))); var m = document.createElement("mark"); m.textContent = txt.slice(k, k+n.length); f.appendChild(m); d = k+n.length; k = bas.indexOf(n, d); }
        f.appendChild(document.createTextNode(txt.slice(d))); nd.parentNode.replaceChild(f, nd);
      });
    }
    function chercherMot(){
      var mot = rech.value.trim(); corps.innerHTML = "";
      if(mot.length < 2){ toc(); return; }
      var n = sansAccent(mot), out = [];
      secs.forEach(function(x,i){
        var plats = x.blocs.reduce(function(a,b){ return a.concat(b.t === "li" || b.t === "ol" ? b.v : b.t === "kv" ? [].concat.apply([], b.v) : b.t === "tab" ? [].concat.apply([], b.v) : typeof b.v === "string" ? [b.v] : []); }, []);
        plats.forEach(function(p){ var k = sansAccent(p).indexOf(n); if(k >= 0 && sansAccent(p).length === p.length) out.push({i:i, p:p, k:k}); });
      });
      res.innerHTML = '<div class="txs">'+out.length+' RÉSULTAT'+(out.length > 1 ? "S" : "")+'</div>' + out.slice(0, 60).map(function(o){
        var a = Math.max(0, o.k-40), ext = o.p.slice(a, o.k+n.length+80);
        var h = esc(ext).replace(new RegExp("("+esc(o.p.slice(o.k, o.k+n.length)).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")+")", "i"), "<mark>$1</mark>");
        return '<a href="#" class="rs" data-s="'+o.i+'"><b>'+esc(secs[o.i].titre || "Introduction")+'</b>'+(a ? "… " : "")+h+'</a>';
      }).join("");
    }
    res.onclick = function(e){ var a = e.target.closest("a[data-s]"); if(!a) return; e.preventDefault(); ouvrir(+a.getAttribute("data-s"), rech.value.trim().length >= 2 ? rech.value.trim() : ""); };
    rech.oninput = chercherMot;
    toc();
  }, repli, true);
}
// Plan d'incendie en texte (blocs lus dans le document Google par le service); sans réponse du service, l'ancien affichage PDF reste en place.
function incendie(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Plan d\'incendie</h1><div id="txt"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  obtenir("incendie_texte", {action:"incendie_texte"}, function(r){
    var el = document.getElementById("txt"); if(!el) return;
    if(!r.blocs){ el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; return; }
    el.innerHTML = blocsHtml(r.blocs);
    // images allégées : chargées à part, gardées dans l'application (clé liée à la version du plan)
    Array.prototype.forEach.call(el.querySelectorAll("img[data-i]"), function(im){
      var i = +im.getAttribute("data-i"), cle = "incimg"+(r.version || "")+"_"+i, loc = lireCache(cle);
      function poser(x){ if(x && x.v){ im.src = x.v; im.classList.remove("vide"); } }
      if(loc) return poser(loc);
      chercher(cle, {action:"incendie_image", i:i}).then(poser).catch(function(){});
    });
  }, function(){ var e = document.getElementById("txt"); if(e) e.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; }, true);
}
// Salaire : protégé par un code envoyé au courriel (valable 10 minutes, session salaire de 15 minutes d'inactivité).
// Règle de sécurité : l'application ne calcule rien et ne garde aucun montant sur le téléphone; elle affiche les valeurs du dossier salarial, lues à chaque ouverture.
function dollars(n){ return n === null || n === undefined || n === "" ? "—" : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " $"; }
function taux(n){ var x = parseFloat(String(n).replace(",", ".")); return isNaN(x) ? "—" : x.toFixed(2).replace(".", ","); }
function pctTxt(p){ var x = parseFloat(String(p).replace("%", "").replace(",", ".")); if(isNaN(x)) return String(p); if(x <= 1.5) x = x * 100; return Math.round(x) + " %"; }
function salaire(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Rémunération</h1><div id="sa"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  appelService({action:"salaire_lire", session:sessionGardee()}).then(function(r){
    if(r && r.ok) return salaireEcran(r, 0);
    if(r && r.code) return salaireCode(true);
    document.getElementById("sa").innerHTML = '<div class="bandeau">▪ '+esc((r && r.erreur) || "SALAIRE INDISPONIBLE")+'</div>';
  }).catch(function(){ document.getElementById("sa").innerHTML = '<div class="bandeau">▪ SALAIRE INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function salaireCode(envoyer){
  var zone = document.getElementById("sa");
  zone.innerHTML = '<div class="etiq">▪ CODE DE SÉCURITÉ</div><p class="aide" id="samsg" style="font-size:15px">Pour protéger votre salaire, entrez le code de 6 chiffres envoyé à votre courriel. Il est valable 10 minutes.</p>' +
    '<div class="cases" id="cases">'+[0,1,2,3,4,5].map(function(i){ return '<input inputmode="numeric" maxlength="1" autocomplete="'+(i ? 'off' : 'one-time-code')+'" aria-label="Chiffre '+(i+1)+'">'; }).join("")+'</div>' +
    '<a class="doc" href="#" id="nouveau" style="margin-top:18px"><span>▪ Envoyer un nouveau code</span><em>→</em></a><p class="aide">Aucun montant n\'est gardé sur votre téléphone.</p>';
  var msg = document.getElementById("samsg"), champs = Array.prototype.slice.call(document.querySelectorAll("#cases input"));
  function envoi(){ msg.textContent = "Envoi du code…"; appelService({action:"salaire_code", session:sessionGardee()}).then(function(r){
    msg.textContent = r && r.ok ? "Code envoyé à votre courriel. Il est valable 10 minutes. Vérifiez aussi les indésirables." : ((r && r.erreur) || "Envoi impossible."); }).catch(function(){ msg.textContent = "Envoi impossible. Réessayez."; }); }
  function valider(){
    var code = champs.map(function(c){ return c.value; }).join("");
    if(code.length !== 6) return;
    msg.textContent = "Vérification…";
    appelService({action:"salaire_verifier", session:sessionGardee(), code:code}).then(function(r){
      if(r && r.ok) return salaire();
      champs.forEach(function(c){ c.value = ""; }); champs[0].focus(); msg.textContent = (r && r.erreur) || "Code invalide ou expiré.";
    }).catch(function(){ msg.textContent = "Vérification impossible. Réessayez."; });
  }
  champs.forEach(function(c, i){
    c.oninput = function(){
      var v = c.value.replace(/\D/g, "");
      if(v.length > 1){ v.split("").slice(0, 6 - i).forEach(function(ch, k){ champs[i + k].value = ch; }); (champs[Math.min(5, i + v.length)]).focus(); }
      else { c.value = v; if(v && i < 5) champs[i + 1].focus(); }
      valider();
    };
    c.onkeydown = function(e){ if(e.key === "Backspace" && !c.value && i > 0){ champs[i - 1].focus(); champs[i - 1].value = ""; } };
  });
  champs[0].focus();
  document.getElementById("nouveau").onclick = function(e){ e.preventDefault(); envoi(); };
  if(envoyer) envoi();
}
function salaireDetail(r, k){
  var a = r.annees[k], zone = document.getElementById("sa"), t = (a.repartition || {});
  var h = document.querySelector(".page h1"); h.textContent = "Rémunération globale"; h.className = "sa1";
  var onglets = r.annees.length > 1 ? '<span class="saan">'+r.annees.map(function(x, i){ return '<a href="#" data-k="'+i+'" class="'+(i === k ? 'on' : '')+'">'+x.annee+'</a>'; }).join("")+'</span>' : "";
  var pos = pctTxt(a.position);
  var l = function(lib, v, fort){ return '<div class="sl'+(fort ? ' fort' : '')+'"><span>'+lib+'</span><span>'+v+'</span></div>'; };
  var sec = function(n, titre){ return '<div class="sh"><b>'+n+'</b><span>'+titre+'</span></div>'; };
  zone.innerHTML = '<div class="saeti">ANNÉE '+a.annee+(a.annee === 2026 ? ' · EN VIGUEUR' : ' · À VENIR')+onglets+'</div>' +
    '<div class="said"><div><strong>'+esc(MOI && MOI.nom || "")+'</strong><small>'+esc(MOI && MOI.poste || "")+'</small></div><div class="saht">'+taux(a.horaire)+' $/h</div></div>' +
    '<div class="saech">'+(a.echelle || []).map(function(e){ var on = pctTxt(e.p) === pos; return '<span class="'+(on ? 'on' : '')+'">'+pctTxt(e.p)+'<br>'+taux(e.t)+'</span>'; }).join("")+'</div>' +
    sec("01", "SALAIRE ET TEMPS DE TRAVAIL") + l("Salaire horaire retenu", taux(a.horaire) + " $") + l("Heures de travail (par semaine)", esc(a.heures === null || a.heures === undefined ? "—" : a.heures)) + l("Salaire de base annuel ("+esc(a.semaines || 46)+" semaines)", dollars(a.base), true) +
    sec("02", "CONGÉS RÉMUNÉRÉS") + l("Vacances rémunérées", dollars(a.vacances)) + l("Jours fériés rémunérés", dollars(a.feries)) + l("Maladie rémunérée", dollars(a.maladie)) + l("Total des congés rémunérés", dollars(a.conges), true) +
    sec("03", "AUTRES AVANTAGES") + l("Boni annuel pouvant atteindre", dollars(a.boni)) + l("Cotisation OTPADQ", dollars(a.otpadq)) + l("Assurances 50 % de la prime (approx.)", dollars(a.assurances)) +
    '<div class="satot"><span>TOTAL DE LA RÉMUNÉRATION GLOBALE</span><b>'+dollars(a.total)+'</b></div>' +
    '<div class="sabar"><i style="width:'+(t.base || 0)+'%"></i><i class="b" style="width:'+(t.conges || 0)+'%"></i><i class="c" style="width:'+(t.autres || 0)+'%"></i></div>' +
    '<p class="sale">Salaire de base '+dollars(a.base)+' · '+(t.base === null || t.base === undefined ? "—" : t.base)+' %&nbsp; Congés rémunérés '+dollars(a.conges)+' · '+(t.conges === null || t.conges === undefined ? "—" : t.conges)+' %&nbsp; Autres avantages '+dollars((a.boni || 0) + (a.otpadq || 0) + (a.assurances || 0))+' · '+(t.autres === null || t.autres === undefined ? "—" : t.autres)+' %&nbsp; Salaire annualisé sur 52 semaines : '+dollars(a.annualise)+'</p>' +
    sec("04", "PROGRAMME DE RECONNAISSANCE") + '<div class="sarec">'+(a.paliers || []).map(function(p){ return '<div><b>'+dollars(p.montant)+'</b><small>'+esc(p.lib)+'</small></div>'; }).join("")+'</div>' +
    '<a class="doc" href="#" id="notes" style="margin-top:10px"><span>▪ Notes et conditions</span><em>→</em></a>';
  Array.prototype.forEach.call(zone.querySelectorAll(".saan a"), function(x){ x.onclick = function(e){ e.preventDefault(); salaireDetail(r, +x.getAttribute("data-k")); }; });
  document.getElementById("notes").onclick = function(e){ e.preventDefault(); salaireNotes(r, k); };
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); salaireEcran(r, k); };
}
// Écran principal épuré (choix S1 de l'utilisateur) : le total, quatre lignes, le détail sur demande.
function salaireEcran(r, k){
  var a = r.annees[k], zone = document.getElementById("sa"), t = (a.repartition || {});
  var h = document.querySelector(".page h1"); h.textContent = "Rémunération globale"; h.className = "sa1";
  document.getElementById("retour").textContent = "← Retour"; document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  var onglets = r.annees.length > 1 ? '<span class="saan">'+r.annees.map(function(x, i){ return '<a href="#" data-k="'+i+'" class="'+(i === k ? 'on' : '')+'">'+x.annee+'</a>'; }).join("")+'</span>' : "";
  var autres = (a.boni || 0) + (a.otpadq || 0) + (a.assurances || 0), pc = function(x){ return x === null || x === undefined ? "" : " · " + x + " %"; };
  var montants = (a.paliers || []).map(function(p){ return p.montant; }).filter(function(x){ return x !== null && x !== undefined; });
  var reco = montants.length ? (Math.min.apply(null, montants) === Math.max.apply(null, montants) ? dollars(montants[0]) : dollars(Math.min.apply(null, montants)) + " à " + dollars(Math.max.apply(null, montants))) : "—";
  var l = function(lib, sous, v){ return '<div class="sx"><span>'+lib+'<small>'+sous+'</small></span><b>'+v+'</b></div>'; };
  zone.innerHTML = '<div class="saeti">▪ ANNÉE '+a.annee+(a.annee === 2026 ? ' · EN VIGUEUR' : ' · À VENIR')+onglets+'</div>' +
    '<div class="sanom">'+esc(MOI && MOI.nom || "")+' · '+esc(MOI && MOI.poste || "")+(a.position ? ' · '+pctTxt(a.position) : '')+'</div>' +
    '<div class="sabig">'+dollars(a.total)+'</div><div class="sub">Salaire horaire '+taux(a.horaire)+'\u00a0$ · '+esc(a.heures === null || a.heures === undefined ? "—" : a.heures)+' h par semaine</div>' +
    '<div class="sabar"><i style="width:'+(t.base || 0)+'%"></i><i class="b" style="width:'+(t.conges || 0)+'%"></i><i class="c" style="width:'+(t.autres || 0)+'%"></i></div>' +
    '<div class="sub" style="margin-bottom:10px">Salaire annualisé sur 52 semaines : '+dollars(a.annualise)+'</div>' +
    l("Salaire de base", esc(a.semaines || 46)+' semaines'+pc(t.base), dollars(a.base)) +
    l("Congés rémunérés", 'Vacances, fériés, maladie'+pc(t.conges), dollars(a.conges)) +
    l("Autres avantages", 'Boni, OTPADQ, assurances'+pc(t.autres), dollars(autres)) +
    l("Programme de reconnaissance", 'Par mois, selon vos objectifs atteints', reco) +
    '<a class="doc" href="#" id="detail" style="margin-top:6px"><span>▪ Voir le détail et les notes</span><em>→</em></a>';
  Array.prototype.forEach.call(zone.querySelectorAll(".saan a"), function(x){ x.onclick = function(e){ e.preventDefault(); salaireEcran(r, +x.getAttribute("data-k")); }; });
  document.getElementById("detail").onclick = function(e){ e.preventDefault(); salaireDetail(r, k); };
}
function salaireNotes(r, k){
  var n = r.annees[k].notes || {}, c = r.communes || {};
  var bloc = function(t, x){ return x ? '<div class="nb"><div class="etiq">'+t+'</div><p>'+esc(x)+'</p></div>' : ""; };
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Notes et conditions</h1>' +
    bloc("VACANCES", n.vacances) + bloc("MALADIE", n.maladie) + bloc("BONI", [n.boni1, n.boni2].filter(Boolean).join(" ")) + bloc("HEURES DE TRAVAIL", c.heures) + bloc("AVIS", c.avis) + '</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); salaire(); };
}
// Étape 5 : évaluations. L'autoévaluation reproduit la page du portail (mêmes 8 onglets, mêmes questions); en essai elle ne lit ni n'enregistre rien.
function evaluations(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Autoévaluation</h1><div id="ev"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  obtenir("ae", {action:"ae_lire"}, function(r){
    var el = document.getElementById("ev"); if(!el) return;
    if(!r.rencontres.length){ el.innerHTML = '<div class="bandeau">▪ AUCUNE AUTOÉVALUATION POUR LE MOMENT</div>'; return; }
    if(r.rencontres.length === 1){ autoeval(r.rencontres[0].rencontre, true); return; }   // une seule : on l'ouvre directement
    el.innerHTML = r.rencontres.map(function(m){
      return '<a class="rang" href="#" data-r="'+m.rencontre+'">▪ Autoévaluation · rencontre '+m.rencontre+'<small>'+(m.terminee ? 'Terminée' : 'À remplir')+'</small></a>'; }).join("");
    Array.prototype.forEach.call(el.querySelectorAll("a[data-r]"), function(a){ a.onclick = function(e){ e.preventDefault(); autoeval(+a.getAttribute("data-r")); }; });
  }, function(){ document.getElementById("ev").innerHTML = '<div class="bandeau">▪ AUTOÉVALUATION INDISPONIBLE · RÉESSAYEZ</div>'; }, true);
}
// Autoévaluation : même fiche et mêmes règles que la page envoyée par courriel (6 étapes). Les réponses vont dans la fiche de l'employé.
var AE_ETAPES = ["Évaluation des compétences","Valeurs humaines","Connaissances et développement","Rythme et charge de travail","Priorités et engagements","Commentaires de l’employé","Mon expérience au laboratoire","Pour préparer notre rencontre"];
var AE_NIVEAUX_RH = ["Pas du tout d’accord","Peu d’accord","Moyennement d’accord","Plutôt d’accord","Tout à fait d’accord"];
function aeSection(f){ var n = +f.cell.slice(1); if(f.cell === "A68" || f.cell === "A70") return 7; if(n >= 59) return 6; if(f.cell === "B44") return 5; if(f.cell === "B42" || f.cell === "B43") return 4; return n >= 35 ? 2 : n >= 28 ? 1 : 0; }
function autoeval(rencontre, direct){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">'+(direct ? "← Retour" : "← Retour")+'</a><h1>Autoévaluation</h1><div id="ae"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); if(direct) menu(); else evaluations(); };
  obtenir("ae"+rencontre, {action:"ae_lire", rencontre:rencontre}, aeAfficher,
    function(){ document.getElementById("ae").innerHTML = '<div class="bandeau">▪ FICHE INDISPONIBLE · RÉESSAYEZ</div>'; }, false);
}
function aeNum(v){ var n = Number(String(v).replace(/[^0-9,.-]/g,"").replace(",",".")); return isNaN(n) ? null : n; }
function aeRythmeHtml(d){
  if(!d.rythme || !d.rythme.length) return '<p class="aide">Heures travaillées par semaine, charge effectuée, charge non terminée et objectifs atteints : ces points seront examinés dans cet ordre avec votre responsable pendant la rencontre.</p>';
  var h = (d.rythmePeriode ? '<div class="etiq">▪ '+esc(d.rythmePeriode).toUpperCase()+'</div>' : '') + '<p class="aide">À titre indicatif, pour la discussion lors de la rencontre.</p>';
  d.rythme.forEach(function(r){
    var c = aeNum(r.seuil), n = aeNum(r.realise), barre = "", ok = null;
    if(c !== null && n !== null){
      var M = r.auto ? Math.max(c, n) : Math.max(100, c, n); ok = r.inverse ? n <= c : n >= c;
      barre = '<div class="rb"><i style="width:'+Math.max(0,Math.min(100,n/M*100))+'%"></i><u style="left:'+Math.max(0,Math.min(99,c/M*100))+'%"></u></div><div class="rt'+(ok ? ' ok' : '')+'">'+(ok ? 'Dans la cible' : (r.inverse ? 'Au-dessus de la cible' : 'Sous la cible'))+'</div>';
    }
    h += '<div class="rl"><div class="rn">'+esc(r.label)+'</div><div class="rv"><span>Réalisé<b>'+esc(r.realise)+'</b></span><span>Cible<b>'+esc(r.cible)+'</b></span></div>'+barre+'</div>';
  });
  return h;
}
function aeAfficher(d){
  var vals = {}, page = 0, occupe = false;
  d.champs.forEach(function(f){ vals[f.cell] = f.value; });
  var zone = document.getElementById("ae");
  function dire(t){ var e = document.getElementById("aeetat"); if(e){ e.style.display = t ? "block" : "none"; e.textContent = t; } }
  function texteNote(f){ var v = vals[f.cell]; if(v === "" || v == null) return "Choisissez une note."; if(v === "Non applicable") return "Non applicable"; return f.scale === "experience" ? AE_NIVEAUX_RH[+v-1] : (d.bareme[+v-1] || ""); }
  function dessiner(){
    var fs = d.champs.filter(function(f){ return aeSection(f) === page; });
    var h = '<div class="etiq">▪ '+(page+1)+' SUR 8 · '+esc(AE_ETAPES[page]).toUpperCase()+'</div>' + (d.terminee ? '<div class="bandeau">▪ TERMINÉE · CONSULTATION SEULEMENT</div>' : '') + (page === 3 ? aeRythmeHtml(d) : '');
    fs.forEach(function(f){
      if(f.kind === "score"){
        h += '<div class="aeq"><div class="aet">'+esc(f.label)+'</div><div class="aen">';
        for(var n = 1; n <= f.max; n++) h += '<button type="button" class="aeb'+(+vals[f.cell] === n ? ' on' : '')+'" data-c="'+f.cell+'" data-n="'+n+'"'+(d.terminee ? ' disabled' : '')+'>'+n+'</button>';
        h += '</div>' + (f.scale === "experience" && !d.terminee ? '<button type="button" class="aeb na'+(vals[f.cell] === "Non applicable" ? ' on' : '')+'" data-c="'+f.cell+'" data-n="Non applicable">Non applicable</button>' : '') + '<div class="etiq" id="t'+f.cell+'">'+esc(texteNote(f))+'</div></div>';
      } else {
        h += '<div class="aeq"><div class="aet">'+esc(f.label)+'</div><textarea class="champ zone" data-t="'+f.cell+'" maxlength="5000"'+(d.terminee ? ' disabled' : '')+'>'+esc(vals[f.cell] || "")+'</textarea></div>';
      }
    });
    h += '<div class="bandeau" id="aeetat" style="display:none"></div><div class="aeact">' +
      (page > 0 ? '<button class="bouton" id="aeprec" type="button">← Retour</button>' : '') +
      (d.terminee ? '' : '<button class="bouton" id="aebrouillon" type="button">Enregistrer le brouillon</button>') +
      '<button class="bouton" id="aesuiv" type="button"'+(d.terminee && page === 7 ? ' disabled' : '')+'>'+(page === 7 ? (d.terminee ? 'Terminée' : 'Terminer →') : 'Continuer →')+'</button></div>';
    zone.innerHTML = h;
    Array.prototype.forEach.call(zone.querySelectorAll(".aeb"), function(b){
      b.onclick = function(){ var c = b.getAttribute("data-c"), n = b.getAttribute("data-n"); vals[c] = n === "Non applicable" ? n : +n; dessiner(); };
    });
    Array.prototype.forEach.call(zone.querySelectorAll("textarea[data-t]"), function(t){ t.oninput = function(){ vals[t.getAttribute("data-t")] = t.value; }; });
    var p = document.getElementById("aeprec"); if(p) p.onclick = function(){ page--; dessiner(); window.scrollTo(0, 0); };
    var bd = document.getElementById("aebrouillon"); if(bd) bd.onclick = function(){ enregistrer(false); };
    document.getElementById("aesuiv").onclick = function(){
      if(d.terminee){ if(page < 7){ page++; dessiner(); window.scrollTo(0, 0); } return; }
      if(page < 7){ if(!valider(page)) return; enregistrer(false, function(){ page++; dessiner(); window.scrollTo(0, 0); }); }
      else { if(!toutValide()) return; enregistrer(true); }
    };
  }
  function manque(f){ var v = vals[f.cell]; return !(v !== "" && v != null && isFinite(+v) && +v >= 1 && +v <= f.max); }
  function valider(sec){ var m = d.champs.filter(function(f){ return f.required && aeSection(f) === sec && manque(f); })[0]; if(m){ dire("▪ CHOISISSEZ UNE NOTE POUR « "+m.label+" »"); return false; } return true; }
  function toutValide(){ var m = d.champs.filter(function(f){ return f.required && manque(f); })[0]; if(m){ dire("▪ COMPLÉTEZ LES NOTES DE COMPÉTENCES ET DE VALEURS AVANT DE TERMINER"); return false; } return true; }
  function enregistrer(terminer, suite){
    if(occupe) return; occupe = true; dire("▪ ENREGISTREMENT…");
    appelService({action:"ae_enregistrer", session:sessionGardee(), rencontre:d.rencontre, revision:d.revision, terminer:terminer, valeurs:vals}).then(function(r){
      occupe = false;
      if(r && r.ok){ d.revision = r.revision; precharger(); if(r.terminee){ d.terminee = true; zone.innerHTML = '<div class="bandeau">▪ MERCI POUR VOTRE AUTOÉVALUATION</div><p class="aide">Vos réponses sont enregistrées pour cette rencontre. Elles prépareront notre discussion.</p>'; } else { dire("▪ RÉPONSES ENREGISTRÉES"); if(suite) suite(); } }
      else dire("▪ NON ENREGISTRÉ · "+((r && r.erreur) || "RÉESSAYEZ"));
    }).catch(function(){ occupe = false; dire("▪ NON ENREGISTRÉ · RÉSEAU. VOS RÉPONSES RESTENT À L'ÉCRAN"); });
  }
  dessiner();
}
// Étape 6 : tableau de bord (Charges de travail) et profil. Chiffres d'essai; les vrais viendront d'un fichier de Gestion fourni par Michel.
// Tableau de bord : les 12 derniers mois, un par un (aucune moyenne). Données du service (mêmes fichiers de Gestion que le portail).
// Graphique par jour: s'affiche seulement si le service fournit m.jours = [{j,ce,cn,dispo}] (en %, pas encore disponible).
function graphJours(m){
  if(!m.jours || !m.jours.length) return "";
  var haut = 160, cible = m.cibleCe || 80;
  return '<div class="gj"><div class="gjl"><span class="gc">▬</span> Cible <span class="ge">▪</span> Effectuée <span class="gn">▪</span> Non terminée <span class="gd">▪</span> Disponible</div><div class="gjb">' +
    m.jours.map(function(d){
      var tot = (d.ce||0)+(d.cn||0), dp = Math.max(0,(d.dispo||0));
      return '<div class="gjj"><div class="gjv">'+Math.round(tot)+'</div><div class="gjc" style="height:'+Math.min(100,(tot+dp)/160*100)+'%"><i class="d" style="height:'+(dp/(tot+dp||1)*100)+'%"></i><i class="n" style="height:'+((d.cn||0)/(tot+dp||1)*100)+'%"></i><i class="e" style="height:'+((d.ce||0)/(tot+dp||1)*100)+'%"></i></div><div class="gjd">'+esc(String(d.j).split(' ').pop())+'</div></div>';
    }).join("") + '<u style="bottom:calc(18px + '+(cible/160)+' * (100% - 34px))"></u></div></div>';
}
function tableau(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1 class="vert">Charges de travail</h1><div id="tb"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  obtenir("tableau", {action:"tableau"}, function(r){
    var el = document.getElementById("tb"); if(!el) return;
    if(!r.mois){ el.innerHTML = '<div class="bandeau">▪ PAS DE TABLEAU DE BORD POUR VOTRE POSTE</div>'; return; }
    var ms = r.mois, i = 0;
    function annee(m){ return String(m.label).split(" ").pop(); }
    function cumul(m, cle){
      var t = 0, n = 0;
      ms.forEach(function(x){ if(!x.absent && annee(x) === annee(m) && x[cle] !== null && x[cle] !== undefined){ t += x[cle]; n++; } });
      return n ? Math.round(t / n) + " %" : "—";
    }
    function carte(nom, val, cible, sens, m, cle, ct){
      var vide = val === null || val === undefined, ok = vide ? null : (sens === "plus" ? val >= cible : val <= cible);
      var pastille = vide ? "" : '<span class="pas '+(ok ? "dans" : "sous")+'">'+(ok ? "Dans la cible" : "Sous la cible")+'</span>';
      var larg = vide ? 0 : Math.min(100, val), pc = Math.min(100, cible);
      return '<div class="tcarte"><div class="tct"><span>'+nom+'</span>'+pastille+'</div>' +
        '<div class="tgros">'+(vide ? "—" : val)+'<small>%</small></div><div class="tcib">Cible '+cible+' % '+(sens === "plus" ? "et +" : "et −")+'</div>' +
        '<div class="tbarre"><i style="width:'+larg+'%"></i><u style="left:'+pc+'%"></u></div>' +
        '<div class="tcum"><span>Cumul de l\'année</span><b>'+cumul(m, cle)+'</b></div></div>';
    }
    function dessiner(){
      var m = ms[i], h = '<div class="tnav"><button id="tp" '+(i >= ms.length - 1 ? "disabled" : "")+'>‹</button><div class="tmois">'+esc(m.label).toUpperCase()+'</div><button id="ts" '+(i <= 0 ? "disabled" : "")+'>›</button></div>' +
        '<div class="etiq">▪ '+esc((MOI && MOI.nom) || "").toUpperCase()+'</div>';
      if(m.absent) h += '<div class="bandeau">▪ AUCUN TRAVAIL CE MOIS-LÀ</div>';
      else h += carte("CHARGE EFFECTUÉE", m.ce, m.cibleCe, "plus", m, "ce") + carte("CHARGE NON TERMINÉE", m.cn, 5, "moins", m, "cn") + carte("OBJECTIFS ATTEINTS", m.obj, 80, "plus", m, "obj") +
        graphJours(m) + '<p class="aide">Heures par semaine : '+(m.heures === null ? "—" : String(m.heures).replace(".", ","))+(m.cibleHeures ? ' · cible '+m.cibleHeures : "")+'</p>';
      el.innerHTML = h;
      document.getElementById("tp").onclick = function(){ i++; dessiner(); };
      document.getElementById("ts").onclick = function(){ i--; dessiner(); };
    }
    dessiner();
  }, function(e){ var rep = e && e.reponse, el = document.getElementById("tb"); if(!el) return;
    el.innerHTML = '<div class="bandeau">▪ '+(rep && rep.erreur ? esc(String(rep.erreur).toUpperCase()) : (MOI && MOI.role === "direction" ? "PAS DE TABLEAU DE BORD POUR CE COMPTE" : "TABLEAU DE BORD INDISPONIBLE · RÉESSAYEZ"))+'</div>'; }, true);
}
function profil(){
  var m = MOI || {};
  var lignes = [["Nom", m.nom || ""], ["Poste", m.poste || ""], ["Responsable", m.responsable || ""]];
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Mon profil</h1>' +
    lignes.map(function(l){ return '<div class="ligne"><span>'+esc(l[0])+'</span><span>'+esc(l[1])+'</span></div>'; }).join("") +
    '<div class="etiq" style="margin-top:20px">▪ NOTIFICATIONS</div><div id="notifs"></div>' +
    '<a class="doc" href="#" id="sortir" style="margin-top:20px"><span>Déconnexion</span><em>→</em></a>' +
    '<a class="doc" href="#" id="partout"><span>Se déconnecter partout</span><em>→</em></a></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  document.getElementById("sortir").onclick = function(e){ e.preventDefault(); deconnecter(); };
  document.getElementById("partout").onclick = function(e){ e.preventDefault(); var el = this, sp = el.querySelector("span");
    if(!el.getAttribute("data-ok")){ el.setAttribute("data-ok", "1"); sp.textContent = "Confirmer : fermer toutes mes sessions"; return; }
    appelService({action:"deconnecter_partout", session:sessionGardee()}).catch(function(){}).then(function(){ garderSession(null); MOI = null; connexion(); }); };
  var zone = document.getElementById("notifs");
  if(!notifPossible()){ zone.innerHTML = '<p class="aide">Pour recevoir les notifications sur iPhone, ajoutez l\'application à l\'écran d\'accueil (Partager > Sur l\'écran d\'accueil).</p>'; return; }
  if(Notification.permission === "denied"){ zone.innerHTML = '<p class="aide">Les notifications sont bloquées dans les réglages de votre appareil. Autorisez-les dans les réglages pour les recevoir.</p>'; return; }
  navigator.serviceWorker.ready.then(function(reg){ return reg.pushManager.getSubscription(); }).then(function(s){
    zone.innerHTML = '<label class="ligne"><span>Messages et documents mis à jour</span><input type="checkbox" id="notifCase"'+(s && Notification.permission === "granted" ? " checked" : "")+'></label>';
    document.getElementById("notifCase").onchange = function(){ var c = this; (c.checked ? demanderNotifs() : couperNotifs()).then(function(ok){ if(c.checked && !ok) c.checked = false; }).catch(function(){}); };
  });
}
// Calendrier : congés de l'entreprise (fériés en noir, fermetures en vert) et réunions de l'employé (jour encadré); un mois à la fois.
var MOIS_LONGS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
function calendrier(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Calendrier</h1><div id="cal"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  obtenir("calendrier", {action:"calendrier"}, function(r){
    var el = document.getElementById("cal"); if(!el) return;
    if(!r || !r.jours) throw 0;
    var jours = r.jours, m = new Date(); m.setDate(1);
    el.innerHTML = '<div class="moisbar"><button type="button" id="cp" aria-label="Mois précédent">←</button><b id="ct"></b><button type="button" id="cn" aria-label="Mois suivant">→</button></div><div class="cg" id="cg"></div>' +
      '<div class="leg"><span><i class="sq" style="background:var(--tx)"></i>Férié</span><span><i class="sq" style="background:#8EFF60"></i>Fermeture</span><span><i class="sq" style="border:1.5px solid var(--tx)"></i>Réunion</span></div>' +
      '<div class="etiq" style="margin-top:24px">▪ À VENIR</div><div id="cl"></div>';
    function iso(y, mo, d){ return y+"-"+("0"+(mo+1)).slice(-2)+"-"+("0"+d).slice(-2); }
    function dessiner(){
      var y = m.getFullYear(), mo = m.getMonth(), nb = new Date(y, mo+1, 0).getDate(), prem = (new Date(y, mo, 1).getDay()+6)%7;
      document.getElementById("ct").textContent = MOIS_LONGS[mo].toUpperCase()+" "+y;
      var g = ["L","M","M","J","V","S","D"].map(function(x){ return '<div class="cj">'+x+'</div>'; }).join("");
      for(var i = 0; i < prem; i++) g += '<div class="cd"></div>';
      for(var d = 1; d <= nb; d++){
        var j = iso(y, mo, d), ev = jours.filter(function(x){ return x.d === j; }), cl = "cd";
        if(ev.some(function(x){ return x.t === "f"; })) cl += " cf"; else if(ev.some(function(x){ return x.t === "c"; })) cl += " cc";
        if(ev.some(function(x){ return x.t === "r"; })) cl += " cr";
        g += '<div class="'+cl+'">'+d+'</div>';
      }
      document.getElementById("cg").innerHTML = g;
      var auj = new Date(); auj.setHours(0,0,0,0); var deb = iso(auj.getFullYear(), auj.getMonth(), auj.getDate());
      var li = jours.filter(function(x){ return x.d >= deb; }).slice(0, 8);
      document.getElementById("cl").innerHTML = li.length ? li.map(function(x){ var a = x.d.split("-");
        return '<div class="cli"><span class="cdt">'+(+a[2])+" "+MOIS_LONGS[+a[1]-1].slice(0,4).toUpperCase()+".</span><span>"+esc(x.n)+'</span>'+(x.h ? '<span class="chh">'+esc(x.h)+'</span>' : '')+'</div>'; }).join("") : '<div class="bandeau">▪ AUCUN ÉVÉNEMENT À VENIR</div>';
    }
    document.getElementById("cp").onclick = function(){ m.setMonth(m.getMonth()-1); dessiner(); };
    document.getElementById("cn").onclick = function(){ m.setMonth(m.getMonth()+1); dessiner(); };
    dessiner();
  }, function(){ var el = document.getElementById("cal"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; }, true);
}
// Rencontre : l'employé choisit son responsable et un sujet; la demande arrive dans les Messages du responsable.
function rencontre(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Rencontre</h1><div id="rc"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  appelService({action:"rencontre_liste", session:sessionGardee()}).then(function(r){
    var el = document.getElementById("rc"); if(!el) return;
    if(!r || !r.ok) throw 0;
    if(!r.responsables.length){ el.innerHTML = '<div class="bandeau">▪ AUCUN RESPONSABLE</div>'; return; }
    var choix = {resp: r.responsables.length === 1 ? r.responsables[0].c : "", sujet: ""};
    function pastilles(id, liste, cle, valeur){
      return '<div class="chx" id="'+id+'">'+liste.map(function(x){ var v = valeur(x), t = typeof x === "string" ? x : x.nom; return '<button type="button" data-v="'+esc(v)+'" aria-pressed="'+(choix[cle] === v ? "true" : "false")+'">'+esc(t)+'</button>'; }).join("")+'</div>';
    }
    el.innerHTML = '<div class="etiq">▪ AVEC QUI</div>'+pastilles("pr", r.responsables, "resp", function(x){ return x.c; })+
      '<div class="etiq">▪ SUJET</div>'+pastilles("ps", r.sujets, "sujet", function(x){ return x; })+
      '<div class="etiq">▪ MESSAGE (FACULTATIF)</div><textarea class="champ zone" id="rt" maxlength="1000" placeholder="Quelques mots…"></textarea>'+
      '<button class="bouton" id="renv">Envoyer →</button><div class="bandeau" id="retat" style="display:none"></div>';
    function lier(id, cle){
      var bs = el.querySelectorAll("#"+id+" button");
      Array.prototype.forEach.call(bs, function(b){ b.onclick = function(){ choix[cle] = b.getAttribute("data-v"); Array.prototype.forEach.call(bs, function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); }; });
    }
    lier("pr", "resp"); lier("ps", "sujet");
    var etat = document.getElementById("retat");
    function dire(t){ etat.style.display = "block"; etat.textContent = t; }
    document.getElementById("renv").onclick = function(){
      if(!choix.resp){ dire("▪ CHOISISSEZ UNE PERSONNE"); return; }
      if(!choix.sujet){ dire("▪ CHOISISSEZ UN SUJET"); return; }
      var bt = this; bt.disabled = true; dire("▪ ENVOI…");
      appelService({action:"rencontre_demande", session:sessionGardee(), responsable:choix.resp, sujet:choix.sujet, texte:document.getElementById("rt").value.trim()}).then(function(x){
        if(x && x.ok){ dire("▪ DEMANDE ENVOYÉE"); setTimeout(menu, 1400); }
        else { bt.disabled = false; dire("▪ NON ENVOYÉE · "+((x && x.erreur) || "RÉESSAYEZ")); }
      }).catch(function(){ bt.disabled = false; dire("▪ NON ENVOYÉE · RÉSEAU"); });
    };
  }).catch(function(){ var el = document.getElementById("rc"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function section(i){
  if(i === 0) return messages();
  if(i === 4) return tableau();
  if(i === 5) return incendie();
  if(i === 6) return calendrier();
  if(i === 7) return rencontre();
  if(i === 8) return profil();
  if(i === 2) return evaluations();
  if(i === 3) return salaire();
  if(i === 1) return manuel();
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>'+SECTIONS[i]+'</h1>' +
    '<div class="bandeau">▪ ÉTAPE À VENIR</div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
}
if(location.hash === "#evaluations") evaluations(); else demarrage();

if("serviceWorker" in navigator){
  // Nouvelle version : si une autre prend le relais, on recharge une seule fois (hors connexion et saisie en cours)
  var avaitControleur = !!navigator.serviceWorker.controller, rechargee = false;
  navigator.serviceWorker.addEventListener("controllerchange", function(){ if(!avaitControleur || rechargee) return; rechargee = true; var a = document.activeElement; if(a && /INPUT|TEXTAREA/.test(a.tagName)) return; location.reload(); });
  window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").then(function(r){ try { r.update(); } catch(e){} }).catch(function(){}); });
}
