// Étape 1 : démarrage, connexion et menu. Aucune donnée réelle : la connexion et les sections sont des gabarits.
var SECTIONS = ["Messages", "Manuel d'employé", "Autoévaluation", "Rémunération", "Tableau de bord", "Plan d'incendie", "Calendrier", "Rencontre", "Mon profil", "Mes heures"];
var app = document.getElementById("app");
// Ordre d'affichage de l'accueil (choisi par la direction) : numéros de SECTIONS. Messages 0, Manuel 1, Autoévaluation 2, Rémunération 3, Tableau de bord 4, Plan d'incendie 5, Calendrier 6, Rencontre 7, Mon profil 8.
var ORDRE_MENU = [9, 0, 4, 6, 7, 2, 3, 1, 5, 8];

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
  if(n){ p = document.createElement("span"); p.className = "nombre"; p.textContent = pastilleTexte(n); a.appendChild(p); }
  pastilleDirection();
}
function nbDemandesNeuves(){
  var m = lireCache("messages"), l = lus();
  return m && m.messages ? m.messages.filter(function(x){ return !x.envoye && /^Demande de rencontre/.test(x.titre) && l.indexOf(x.id) < 0; }).length : 0;
}
function pastilleTexte(n){ return n + (n > 1 ? " nouveaux" : " nouveau"); }
function pastilleDirection(){
  var a = document.getElementById("resp"); if(!a) return;
  var p = a.querySelector(".nombre"); if(p) p.remove();
  var n = nbDemandesNeuves();
  if(n){ p = document.createElement("span"); p.className = "nombre"; p.textContent = pastilleTexte(n); a.appendChild(p); }
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
  chercher("incendie_texte", {action:"incendie_texte"}).catch(function(){});
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
    // L'écran de saisie s'ouvre tout de suite (le courriel peut arriver avant la réponse du service); une erreur renvoie au courriel avec le message.
    var ouvert = false;
    var arrive = setTimeout(function(){ ouvert = true; saisieCode(c); }, 2500);
    appelService({action:"code", courriel:c}).then(function(r){
      clearTimeout(arrive);
      if(r && r.ok === false && !ouvert){ connexion((r.erreur || "Envoi impossible. Réessayez.")); return; }
      if(!ouvert) saisieCode(c);
    }).catch(function(){
      clearTimeout(arrive);
      if(!ouvert) msg.textContent = "Envoi impossible. Vérifiez le réseau et réessayez.";
    });
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
  app.innerHTML = '<div class="menu"><img class="logo" width="120" height="100" src="assets/LDLD_logo_complet_blanc_transparent.png" alt="Lafond Desjardins">' +
    (peutEcrire() ? '<a href="#" id="resp">▪ '+(MOI.role === "direction" ? "Direction" : "Responsable")+'</a>' : '') +
    ORDRE_MENU.filter(function(i){ return !peutEcrire() || (i !== 9 && i !== 4); }).map(function(i){ return '<a href="#" data-i="'+i+'">▪ '+SECTIONS[i]+'</a>'; }).join("") +
    (peutEcrire() ? '' : '<a href="#" id="entr">▪ Mes entretiens</a>') +
    '<img class="symbole" src="assets/LDLD_symbole_blanc_transparent.png" alt="">' +
    '<a class="sortie" href="#" id="sortie">Déconnexion →</a></div>';
  Array.prototype.forEach.call(app.querySelectorAll("a[data-i]"), function(a){
    a.onclick = function(e){ e.preventDefault(); section(+a.getAttribute("data-i")); };
  });
  var en = document.getElementById("entr"); if(en) en.onclick = function(e){ e.preventDefault(); entretien(); };
  var rp = document.getElementById("resp"); if(rp) rp.onclick = function(e){ e.preventDefault(); responsable(); };
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
var FILTRE_MSG = "";
function messages(filtre){
  if(typeof filtre === "string") FILTRE_MSG = filtre;
  var titreMsg = FILTRE_MSG === "envoyes" ? "Messages envoyés" : FILTRE_MSG === "rencontres" ? "Rencontres demandées" : "Messages";
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>'+titreMsg+'</h1><div id="liste"><div class="bandeau">▪ CHARGEMENT…</div></div>' +
    (peutEcrire() && !FILTRE_MSG ? '<a class="rang" href="#" id="ecrire">▪ Écrire un message</a>' : '') + '</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); if(FILTRE_MSG){ FILTRE_MSG = ""; responsable(); } else menu(); };
  var w = document.getElementById("ecrire"); if(w) w.onclick = function(e){ e.preventDefault(); rediger(); };
  obtenir("messages", {action:"messages"}, function(r){
    if(!document.getElementById("liste")) return;
    MESSAGES = r.messages; var l = lus();
    var vus = MESSAGES.filter(function(m){ return FILTRE_MSG === "envoyes" ? m.envoye : FILTRE_MSG === "rencontres" ? (!m.envoye && /^Demande de rencontre/.test(m.titre)) : true; });
    document.getElementById("liste").innerHTML = vus.length ? vus.map(function(m){
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
  var nImg = 0;   // les plans d'incendie sont des images de l'application (plans/plan1.png…), dans l'ordre du document
  return blocs.map(function(b){
    if(b.t === "h") return '<h2 class="txh">'+numTitre(b.v)+'</h2>';
    if(b.t === "s") return '<div class="txs">'+esc(b.v)+'</div>';
    if(b.t === "p") return '<p class="txp">'+esc(b.v)+'</p>';
    if(b.t === "u") return '<div class="txu"><b>'+esc(b.titre||"")+'</b>'+esc(b.v)+'</div>';
    if(b.t === "li") return '<ul class="txl">'+b.v.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ul>';
    if(b.t === "ol") return '<ol class="txl">'+b.v.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ol>';
    if(b.t === "kv") return '<dl class="txk">'+b.v.map(function(x){ return '<dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd>'; }).join("")+'</dl>';
    if(b.t === "tab") return '<div class="txtab"><table>'+b.v.map(function(l,i){ return '<tr>'+l.map(function(c){ return (i?'<td>':'<th>')+esc(c)+(i?'</td>':'</th>'); }).join("")+'</tr>'; }).join("")+'</table></div>';
    if(b.t === "img"){ nImg++; return '<img class="txi" alt="" src="plans/plan'+nImg+'.png">'; }
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
// Plan du stationnement : cadre de chaque place, en pixels du plan d'origine (2000 x 1416).
var PLACES = {};
(function(){
  for(var i = 0; i < 8; i++) PLACES[15 + i] = [395 + 66 * i, 140, 461 + 66 * i, 302];
  var h2 = [970, 1037, 1105, 1173, 1241, 1309, 1377, 1445];
  for(var j = 0; j < 7; j++) PLACES[23 + j] = [h2[j], 140, h2[j + 1], 302];
  PLACES[30] = [1480, 140, 1561, 302]; PLACES[31] = [1561, 140, 1641, 302];
  var h3 = [456, 519, 583, 647, 710];
  for(var k = 0; k < 4; k++) PLACES[14 - k] = [h3[k], 428, h3[k + 1], 566];
  for(var m = 0; m < 3; m++) PLACES[10 - m] = [565, 597 + 54 * m, 738, 651 + 54 * m];
  for(var n = 0; n < 7; n++) PLACES[7 - n] = [808, 434 + 65 * n, 993, 499 + 65 * n];
})();
function planPlace(num){
  var p = PLACES[num]; if(!p) return "";
  var W = 2000, H = 1416, g = 100 * (p[0] + p[2]) / 2 / W;
  return '<div class="plan"><div class="vp" style="left:'+g.toFixed(2)+'%">VOTRE PLACE<i></i></div><div class="pi"><img src="plans/plan_stationnement.png" alt="Plan du stationnement">' +
    '<b style="left:'+(100 * p[0] / W).toFixed(2)+'%;top:'+(100 * p[1] / H).toFixed(2)+'%;width:'+(100 * (p[2] - p[0]) / W).toFixed(2)+'%;height:'+(100 * (p[3] - p[1]) / H).toFixed(2)+'%"></b></div></div>';
}
function profil(){
  var m = MOI || {};
  var lignes = [["Nom", m.nom || ""], ["Poste", m.poste || ""], ["Responsable", m.responsable || ""]];
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Mon profil</h1>' +
    lignes.map(function(l){ return '<div class="ligne"><span>'+esc(l[0])+'</span><span>'+esc(l[1])+'</span></div>'; }).join("") +
    '<div id="stat"></div>' +
    '<a class="doc" href="#" id="vnotif"><span>Notifications</span><em>→</em></a><div id="planz"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  // Stationnement et casier de l'employé (jamais ceux des autres), lus dans le classeur du conseil par le service.
  obtenir("stationnement", {action:"stationnement"}, function(r){
    var st = document.getElementById("stat"), pz = document.getElementById("planz"); if(!st || !r || !r.ok) return;
    var place = String(r.place || "").trim(), cas = (r.casiers || []).join(" et "), h = "";
    if(place) h += '<div class="ligne"><span>Stationnement</span><span>'+esc(place)+'</span></div>';
    if(cas) h += '<div class="ligne"><span>'+((r.casiers || []).length > 1 ? "Casiers" : "Casier")+'</span><span>'+esc(cas)+'</span></div>';
    st.innerHTML = h;
    if(/^\d+$/.test(place) && PLACES[+place]) pz.innerHTML = planPlace(+place);
    else if(/^rue$/i.test(place)) pz.innerHTML = '<p class="aide" style="margin-top:14px">Le stationnement est plein pour l\'instant. Vous pouvez vous stationner sur le boulevard Saint-Martin, au nord de la rue Salaberry. Nous vous aviserons dès qu\'une place se libérera.</p>';
  }, function(){}, true);
  document.getElementById("vnotif").onclick = function(e){ e.preventDefault(); prefsNotifs(); };
}
// Centre de contrôle des notifications : chaque employé choisit ses propres alertes (enregistrées par le service, par courriel).
var PREFS_NOTIFS = [["courriel", "Courriel"], ["reunion_veille", "Réunions : la veille à 16 h"], ["reunion_1h", "Réunions : 1 heure avant"], ["rencontres", "Rencontres planifiées"], ["autoeval", "Autoévaluation à remplir"]];
function prefsNotifs(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Notifications</h1><div id="notifs"></div><div id="prefs"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); profil(); };
  var zone = document.getElementById("notifs");
  if(!notifPossible()){ zone.innerHTML = '<p class="aide">Pour recevoir les notifications sur iPhone, ajoutez l\'application à l\'écran d\'accueil (Partager > Sur l\'écran d\'accueil).</p>'; }
  else if(Notification.permission === "denied"){ zone.innerHTML = '<p class="aide">Les notifications sont bloquées dans les réglages de votre appareil. Autorisez-les dans les réglages pour les recevoir.</p>'; }
  else navigator.serviceWorker.ready.then(function(reg){ return reg.pushManager.getSubscription(); }).then(function(sub){
    zone.innerHTML = '<label class="ligne"><span>Alerte dans l\'app</span><input type="checkbox" id="notifCase"'+(sub && Notification.permission === "granted" ? " checked" : "")+'></label>';
    document.getElementById("notifCase").onchange = function(){ var c = this; (c.checked ? demanderNotifs() : couperNotifs()).then(function(ok){ if(c.checked && !ok) c.checked = false; }).catch(function(){}); };
  });
  var etat = {courriel: false};
  function dessiner(){
    document.getElementById("prefs").innerHTML = PREFS_NOTIFS.map(function(p){ return '<label class="ligne"><span>'+p[1]+'</span><input type="checkbox" data-k="'+p[0]+'"'+(etat[p[0]] !== false ? " checked" : "")+'></label>'; }).join("");
    Array.prototype.forEach.call(document.querySelectorAll("#prefs input"), function(c){
      c.onchange = function(){ var k = c.getAttribute("data-k"), v = c.checked; etat[k] = v;
        appelService({action:"prefs_ecrire", session:sessionGardee(), cle:k, valeur:v}).catch(function(){}); };
    });
  }
  dessiner();
  appelService({action:"prefs_lire", session:sessionGardee()}).then(function(r){ if(r && r.ok && r.prefs && document.getElementById("prefs")){ etat = r.prefs; dessiner(); } }).catch(function(){});
}
// Page Responsable (responsables et direction seulement; le service refuse les autres) : Contacts cliquables (appel, texto, courriel).
function responsable(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>'+(MOI && MOI.role === "direction" ? "Direction" : "Responsable")+'</h1><a class="doc" href="#" id="rn"><span>▪ Nouveau message</span><em>→</em></a><a class="doc" href="#" id="rsc"><span>▪ Suivi de charge</span><em>→</em></a><a class="doc" href="#" id="rc"><span>▪ Contacts</span><em>→</em></a><a class="doc" href="#" id="rs"><span>▪ Stationnement</span><em>→</em></a><a class="doc" href="#" id="rk"><span>▪ Casier</span><em>→</em></a><a class="doc" href="#" id="rme"><span>▪ Messages envoyés</span><em>→</em></a><a class="doc" href="#" id="rrd"><span>▪ Rencontres demandées</span><em>→</em></a><a class="doc" href="#" id="re"><span>▪ Entretien machinerie</span><em>→</em></a>'+(MOI && MOI.role === "direction" ? '<a class="doc" href="#" id="rpo"><span>▪ Portrait d\'un employé</span><em>→</em></a><a class="doc" href="#" id="rem"><span>▪ Employés</span><em>→</em></a><a class="doc" href="#" id="rut"><span>▪ Utilisation de l\'application</span><em>→</em></a>' : "")+'</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  document.getElementById("rn").onclick = function(e){ e.preventDefault(); nouveau("reunion"); };
  document.getElementById("rsc").onclick = function(e){ e.preventDefault(); suiviCharge(); };
  document.getElementById("rc").onclick = function(e){ e.preventDefault(); contactsResp(); };
  document.getElementById("rs").onclick = function(e){ e.preventDefault(); attributionPage("place"); };
  document.getElementById("rk").onclick = function(e){ e.preventDefault(); attributionPage("casier"); };
  document.getElementById("re").onclick = function(e){ e.preventDefault(); entretien(); };
  var rpo = document.getElementById("rpo"); if(rpo) rpo.onclick = function(e){ e.preventDefault(); portrait(); };
  var rem = document.getElementById("rem"); if(rem) rem.onclick = function(e){ e.preventDefault(); gestionEmployes(); };
  var rut = document.getElementById("rut"); if(rut) rut.onclick = function(e){ e.preventDefault(); utilisationApp(); };
  document.getElementById("rme").onclick = function(e){ e.preventDefault(); messages("envoyes"); };
  document.getElementById("rrd").onclick = function(e){ e.preventDefault(); messages("rencontres"); };
  var nd = nbDemandesNeuves(); if(nd){ var sp = document.createElement("span"); sp.className = "nombre"; sp.style.marginLeft = "10px"; sp.textContent = pastilleTexte(nd); document.getElementById("rrd").firstChild.appendChild(sp); }
}
// Stationnement et Casier : choisir un employé, voir son numéro, le libérer (✕, avec confirmation) ou lui en attribuer un libre.
function attributionPage(genre){
  var estPlace = genre === "place", titre = estPlace ? "Stationnement" : "Casier";
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>'+titre+'</h1><div id="ap"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  var d = null, choisi = "", msg = "", confirmer = null;
  function champsDe(e){ return estPlace ? [["place","Place"]] : [["casier1","Casier"]].concat(e.casier2 ? [["casier2","Casier 2"]] : []); }
  function dessiner(){
    var el = document.getElementById("ap"); if(!el) return;
    var h = '<select class="champ" id="aps"><option value="">Choisir un employé</option>' + d.employes.map(function(e){ return '<option value="'+e.ligne+'"'+(String(e.ligne) === choisi ? " selected" : "")+'>'+esc(e.nom)+'</option>'; }).join("") + '</select>';
    var e = d.employes.filter(function(x){ return String(x.ligne) === choisi; })[0];
    if(e){
      champsDe(e).forEach(function(c){ var v = e[c[0]];
        if(v){
          h += '<div class="ligne" data-t="'+c[0]+'"><span>'+(estPlace ? "Place " : c[1]+" ")+esc(v)+'</span>'+(confirmer === c[0] ? '<span><button type="button" class="ib" data-oui="'+c[0]+'">OUI</button> <button type="button" class="ib" data-non="1">NON</button></span>' : '<button type="button" class="ib" data-x="'+c[0]+'" aria-label="Libérer">✕</button>')+'</div>';
          if(confirmer === c[0]) h += '<div class="bandeau">▪ LIBÉRER ?</div>';
        } else {
          var libres = estPlace ? d.placesLibres : d.casiersLibres;
          h += '<div class="ligne"><span>'+(estPlace ? "Aucune place" : "Aucun "+c[1].toLowerCase())+'</span></div><select class="champ" id="apn-'+c[0]+'"><option value="">'+(libres.length ? "Numéros libres" : "Aucun numéro libre")+'</option>' + libres.map(function(n){ return '<option value="'+n+'">'+n+'</option>'; }).join("") + '</select><button type="button" class="bouton" data-att="'+c[0]+'">Attribuer</button>';
        }
      });
      if(!estPlace && !e.casier2 && e.casier1 === "") h += "";
    }
    if(msg) h += '<div class="bandeau">'+esc(msg)+'</div>';
    el.innerHTML = h;
    document.getElementById("aps").onchange = function(){ choisi = this.value; confirmer = null; msg = ""; dessiner(); };
    Array.prototype.forEach.call(el.querySelectorAll("[data-x]"), function(b){ b.onclick = function(){ confirmer = b.getAttribute("data-x"); dessiner(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-non]"), function(b){ b.onclick = function(){ confirmer = null; dessiner(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-oui]"), function(b){ b.onclick = function(){ ecrire(b.getAttribute("data-oui"), ""); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-att]"), function(b){ b.onclick = function(){ var t = b.getAttribute("data-att"), v = document.getElementById("apn-"+t).value; if(!v){ msg = "▪ CHOISISSEZ UN NUMÉRO"; dessiner(); return; } ecrire(t, v); }; });
  }
  function ecrire(type, valeur){
    msg = "▪ ENREGISTREMENT…"; confirmer = null; dessiner();
    appelService({action:"parking_ecrire", session:sessionGardee(), type:type, ligne:Number(choisi), valeur:valeur}).then(function(r){
      if(r && r.ok){ d = r; msg = "▪ ENREGISTRÉ"; } else msg = "▪ " + String((r && r.erreur) || "ÉCHEC").toUpperCase();
      dessiner();
    }).catch(function(){ msg = "▪ ÉCHEC · RÉESSAYEZ"; dessiner(); });
  }
  appelService({action:"parking_lire", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0; d = r; dessiner();
  }).catch(function(){ var el = document.getElementById("ap"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
// Entretien machinerie : responsables et direction consultent et modifient; l'employé voit seulement ses machines (« Mes entretiens »).
function entretien(){
  var tous = peutEcrire(), d = null, vue = "secteur", sel = "non", msg = "", mode = "liste", fiche = null, pick = false, supprime = false;
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>'+(tous ? "Entretien machinerie" : "Mes entretiens")+'</h1><div id="en"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); if(tous && mode !== "liste"){ mode = "liste"; pick = false; dessiner(); } else if(tous) responsable(); else menu(); };
  function nomsLignes(t){ return String(t).split("\n").map(function(x){ return x.replace(/^\s*[▪•]\s*/, ""); }); }
  function nomHtml(t){ return nomsLignes(t).map(function(x, i, a){ return (a.length > 1 ? "▪ " : "") + esc(x); }).join("<br>"); }
  function secteurs(){ var s = []; d.machines.forEach(function(m){ if(s.indexOf(m.zone) < 0) s.push(m.zone); }); return s; }
  function machinesVue(){
    if(sel === "non") return d.machines.filter(function(m){ return !m.resp; });
    if(vue === "secteur") return d.machines.filter(function(m){ return m.zone === sel; });
    var e = d.employes.filter(function(x){ return String(x.id) === sel; })[0];
    return e ? d.machines.filter(function(m){ return m.resp === e.nom; }) : [];
  }
  function ecrire(corps){
    msg = "▪ ENREGISTREMENT…"; dessiner();
    corps.action = "entretien_ecrire"; corps.session = sessionGardee();
    return appelService(corps).then(function(r){ if(r && r.ok){ d = r; msg = ""; return true; } msg = "▪ " + String((r && r.erreur) || "ÉCHEC").toUpperCase(); return false; })
      .catch(function(){ msg = "▪ ÉCHEC · RÉESSAYEZ"; return false; }).then(function(ok){ dessiner(); return ok; });
  }
  function dessiner(){
    var el = document.getElementById("en"); if(!el) return;
    if(mode === "fiche" || mode === "edition") return dessinerFiche(el);
    var h = "";
    if(tous){
      h += '<div class="tg"><button type="button" class="ib" style="width:auto;padding:0 12px" data-v="secteur"'+(vue === "secteur" ? ' aria-pressed="true"' : "")+'>'+(vue === "secteur" ? "▪ " : "")+'PAR SECTEUR</button> <button type="button" class="ib" style="width:auto;padding:0 12px" data-v="employe">'+(vue === "employe" ? "▪ " : "")+'PAR EMPLOYÉ</button></div>';
      h += '<select class="champ" id="ens"><option value="non"'+(sel === "non" ? " selected" : "")+'>Machines non attribuées</option>' +
        (vue === "secteur" ? secteurs().map(function(z){ return '<option value="'+esc(z)+'"'+(sel === z ? " selected" : "")+'>'+esc(z)+'</option>'; }) : d.employes.map(function(e){ return '<option value="'+e.id+'"'+(sel === String(e.id) ? " selected" : "")+'>'+esc(e.nom)+'</option>'; })).join("") + '</select>';
    }
    var ms = tous ? machinesVue() : d.machines;
    if(!ms.length) h += '<div class="bandeau">▪ AUCUNE MACHINE</div>';
    var zone = "";
    ms.forEach(function(m){
      if(!tous && m.zone !== zone || tous && vue === "employe" && sel !== "non" && m.zone !== zone){ zone = m.zone; h += '<div class="etiq" style="margin-top:14px">▪ '+esc(zone.toUpperCase())+'</div>'; }
      var fin = "";
      if(tous){
        if(supprime) fin = '<button type="button" class="ib" data-del="'+m.ligne+'" aria-label="Supprimer">✕</button>';
        else if(sel === "non") fin = '<button type="button" class="ib" data-att="'+m.ligne+'">+</button>';
        else if(vue === "secteur") fin = m.resp ? '<button type="button" class="ib" data-moins="'+m.ligne+'" aria-label="Enlever">−</button>' : '<button type="button" class="ib" data-att="'+m.ligne+'">+</button>';
        else fin = '<button type="button" class="ib" data-moins="'+m.ligne+'" aria-label="Enlever">−</button>';
      }
      var col2 = tous ? (sel === "non" ? esc(m.zone) : (vue === "secteur" ? esc(m.resp) : "")) : "";
      h += '<div class="ligne"><a href="#" data-f="'+m.ligne+'" style="flex:1;color:inherit;text-decoration:none">'+nomHtml(m.machine)+'</a>'+(col2 ? '<span style="flex:1">'+col2+'</span>' : "")+fin+'</div>';
    });
    if(tous && pick){
      h += '<div class="etiq" style="margin-top:18px">▪ ATTRIBUER À</div>' + d.employes.map(function(e){
        return '<a href="#" class="ligne" data-emp="'+e.id+'" style="color:inherit;text-decoration:none"><span style="flex:2">'+esc(e.nom)+'</span><span style="flex:1">'+e.nb+'</span><span style="flex:1">'+esc(e.niveau)+'</span></a>'; }).join("");
    }
    if(tous && sel !== "non" && vue === "employe") h += '';
    if(msg) h += '<div class="bandeau">'+esc(msg)+'</div>';
    if(tous && vue === "secteur" && sel !== "non") h += '<div class="aeact"><button type="button" class="bouton" id="ena">Ajouter</button><button type="button" class="bouton" id="ens2">'+(supprime ? "Terminer" : "Supprimer")+'</button></div>';
    el.innerHTML = h;
    Array.prototype.forEach.call(el.querySelectorAll("[data-v]"), function(b){ b.onclick = function(){ vue = b.getAttribute("data-v"); sel = "non"; pick = false; supprime = false; dessiner(); }; });
    var s = document.getElementById("ens"); if(s) s.onchange = function(){ sel = this.value; pick = false; supprime = false; dessiner(); };
    Array.prototype.forEach.call(el.querySelectorAll("[data-f]"), function(a){ a.onclick = function(e){ e.preventDefault(); fiche = d.machines.filter(function(m){ return String(m.ligne) === a.getAttribute("data-f"); })[0]; mode = "fiche"; dessiner(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-moins]"), function(b){ b.onclick = function(){ ecrire({op:"attribuer", ligne:Number(b.getAttribute("data-moins")), employe:""}); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-att]"), function(b){ b.onclick = function(){ pick = Number(b.getAttribute("data-att")); dessiner(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-emp]"), function(a){ a.onclick = function(e){ e.preventDefault(); var l = pick; pick = false; ecrire({op:"attribuer", ligne:l, employe:Number(a.getAttribute("data-emp"))}); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-del]"), function(b){ b.onclick = function(){ if(b.getAttribute("data-ok")){ ecrire({op:"supprimer", ligne:Number(b.getAttribute("data-del"))}); } else { b.setAttribute("data-ok","1"); b.textContent = "OUI ?"; b.style.width = "auto"; b.style.padding = "0 8px"; } }; });
    var a1 = document.getElementById("ena"); if(a1) a1.onclick = function(){ fiche = {ligne:0, zone:sel, machine:"", resp:"", taches:[]}; mode = "edition"; dessiner(); };
    var a2 = document.getElementById("ens2"); if(a2) a2.onclick = function(){ supprime = !supprime; dessiner(); };
  }
  function dessinerFiche(el){
    var m = fiche, h;
    if(mode === "fiche"){
      h = '<div class="etiq">▪ '+esc(m.zone.toUpperCase())+'</div><div class="ligne" style="display:block">'+nomHtml(m.machine)+'</div>' +
        (m.resp ? '<div class="etiq" style="margin-top:14px">▪ RESPONSABLE</div><div class="ligne">'+esc(m.resp)+'</div>' : "") +
        '<div class="etiq" style="margin-top:14px">▪ ENTRETIEN À FAIRE</div>' + m.taches.map(function(t){ return '<div class="ligne">▪ '+esc(t)+'</div>'; }).join("") +
        (tous ? '<div class="aeact"><button type="button" class="bouton" id="enm">Modifier</button></div>' : "");
    } else {
      h = '<div class="etiq">▪ '+esc(m.zone.toUpperCase())+'</div><textarea class="champ" id="enn" rows="2" placeholder="Nom de la machine (une machine par ligne)">'+esc(nomsLignes(m.machine).join("\n"))+'</textarea>' +
        '<div class="etiq">▪ ENTRETIEN À FAIRE · UNE TÂCHE PAR LIGNE</div><textarea class="champ" id="ent" rows="7">'+esc(m.taches.join("\n"))+'</textarea>' +
        (msg ? '<div class="bandeau">'+esc(msg)+'</div>' : "") +
        '<div class="aeact"><button type="button" class="bouton" id="enok">Enregistrer</button><button type="button" class="bouton" id="enx">Annuler</button></div>';
    }
    el.innerHTML = h;
    var b = document.getElementById("enm"); if(b) b.onclick = function(){ mode = "edition"; dessiner(); };
    var x = document.getElementById("enx"); if(x) x.onclick = function(){ mode = m.ligne ? "fiche" : "liste"; msg = ""; dessiner(); };
    var ok = document.getElementById("enok"); if(ok) ok.onclick = function(){
      var corps = m.ligne ? {op:"modifier", ligne:m.ligne} : {op:"ajouter", zone:m.zone};
      corps.machine = document.getElementById("enn").value; corps.taches = document.getElementById("ent").value;
      ecrire(corps).then(function(bon){ if(bon){ mode = "liste"; dessiner(); } });
    };
  }
  appelService({action:"entretien_lire", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0; d = r;
    if(tous){ var s = secteurs(); if(!d.machines.some(function(m){ return !m.resp; })) sel = s[0] || "non"; }
    dessiner();
  }).catch(function(){ var el = document.getElementById("en"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
// Nouveau message / Nouvelle réunion (agendas Google de la personne connectée) et Mes événements.
var JOURS_C = ["L","M","M","J","V","S","D"];
function lundiDe(d){ var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay()+6)%7)); return x; }
function isoJour(d){ return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); }
function heureTxt(h, m){ return h+" h"+(m ? " "+("0"+m).slice(-2) : ""); }
function nouveau(onglet){
  if(onglet === "message") return rediger();
  var lundi = lundiDe(new Date()), jour = new Date(), agendas = [], evs = [], agenda = "primary", hr = 9, mn = 0, conges = {};
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Nouvelle réunion</h1>' +
    '<div class="aeact" style="margin:0 0 10px"><button type="button" class="bouton" id="ongM" style="margin:0;opacity:.6">Message</button><button type="button" class="bouton" id="ongR" style="margin:0">Réunion</button></div>' +
    '<div class="etiq">▪ AGENDA</div><select class="champ" id="nag"><option value="primary">Mon agenda</option></select>' +
    '<div class="moisbar"><button type="button" id="sp" aria-label="Semaine précédente">←</button><b id="st"></b><button type="button" id="sn" aria-label="Semaine suivante">→</button></div><div id="grille"></div>' +
    '<div class="etiq" id="jt" style="margin-top:14px"></div><div id="jl"></div>' +
    '<div class="dh"><select class="champ" id="nh"></select><select class="champ" id="nr"><option value="aucune">Une seule fois</option><option value="jour">Chaque jour ouvrable</option><option value="semaine" selected>Chaque semaine</option><option value="deux">Aux deux semaines</option><option value="mois">Chaque mois</option></select></div>' +
    '<select class="champ" id="na"><option>Toute l\'équipe</option></select><input class="champ" id="ns" placeholder="Sujet" maxlength="120"><textarea class="champ" id="nt" rows="2" placeholder="Message"></textarea>' +
    '<div class="bandeau" id="ne" style="display:none"></div><button class="bouton" id="nok">Envoyer</button>' +
    '<a class="doc" href="#" id="nmes" style="margin-top:14px"><span>▪ Mes événements</span><em>→</em></a></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  document.getElementById("ongM").onclick = function(){ rediger(); };
  document.getElementById("nmes").onclick = function(e){ e.preventDefault(); mesEvenements(); };
  var hs = ""; for(var h = 7; h <= 18; h++){ hs += '<option value="'+h+':0">'+heureTxt(h,0)+'</option><option value="'+h+':30">'+heureTxt(h,30)+'</option>'; }
  var nh = document.getElementById("nh"); nh.innerHTML = hs; nh.value = "9:0";
  nh.onchange = function(){ var p = this.value.split(":"); hr = +p[0]; mn = +p[1]; dessiner(); };
  function dire(t){ var e = document.getElementById("ne"); e.style.display = "block"; e.textContent = t; }
  function dessiner(){
    var fin = new Date(lundi); fin.setDate(fin.getDate()+6);
    document.getElementById("st").textContent = lundi.getDate()+" "+MOIS_LONGS[lundi.getMonth()].toUpperCase()+" — "+fin.getDate()+" "+MOIS_LONGS[fin.getMonth()].toUpperCase();
    var g = '<div class="gs"><div class="d"></div>';
    for(var i = 0; i < 7; i++){ var dj = new Date(lundi); dj.setDate(dj.getDate()+i); g += '<div class="d'+(isoJour(dj) === isoJour(jour) ? " on" : "")+(conges[isoJour(dj)] ? " "+conges[isoJour(dj)] : "")+'" data-j="'+isoJour(dj)+'">'+JOURS_C[i]+" "+dj.getDate()+'</div>'; }
    for(var h = 7; h <= 18; h++){
      g += '<div class="h">'+h+' h</div>';
      for(i = 0; i < 7; i++){ dj = new Date(lundi); dj.setDate(dj.getDate()+i); var ij = isoJour(dj);
        var occ = evs.some(function(e){ var d0 = new Date(e.debut); return isoJour(d0) === ij && d0.getHours() <= h && new Date(e.fin) > new Date(dj.getFullYear(), dj.getMonth(), dj.getDate(), h, 0); });
        var nv = ij === isoJour(jour) && h === hr;
        g += '<div class="'+(nv ? "n" : occ ? "e" : conges[ij] ? "cl"+conges[ij] : "")+'" data-j="'+ij+'" data-h="'+h+'"></div>'; }
    }
    document.getElementById("grille").innerHTML = g + '</div>';
    Array.prototype.forEach.call(document.querySelectorAll("#grille [data-j]"), function(c){ c.onclick = function(){
      var p = c.getAttribute("data-j").split("-"); jour = new Date(+p[0], +p[1]-1, +p[2]); var h = c.getAttribute("data-h"); if(h){ hr = +h; mn = 0; nh.value = hr+":0"; } dessiner(); }; });
    var ij2 = isoJour(jour), duJour = evs.filter(function(e){ return isoJour(new Date(e.debut)) === ij2; });
    document.getElementById("jt").textContent = "▪ "+jour.getDate()+" "+MOIS_LONGS[jour.getMonth()].toUpperCase()+(conges[ij2] ? " · LABO FERMÉ" : "");
    document.getElementById("jl").innerHTML = duJour.length ? duJour.map(function(e){ var d0 = new Date(e.debut); return '<div class="ligne"><span>'+heureTxt(d0.getHours(), d0.getMinutes())+'</span><span style="flex:1;margin-left:12px">'+esc(e.titre)+'</span></div>'; }).join("") : '<div class="bandeau">▪ AUCUN ÉVÉNEMENT CE JOUR</div>';
  }
  function chargerSemaine(){
    appelService({action:"agenda_semaine", session:sessionGardee(), debut:isoJour(lundi), agenda:agenda}).then(function(r){ evs = (r && r.ok) ? r.evenements : []; if(r && !r.ok) dire("▪ AGENDA INDISPONIBLE · "+String(r.erreur || "").toUpperCase()); dessiner(); }).catch(function(){ evs = []; dessiner(); });
  }
  document.getElementById("sp").onclick = function(){ lundi.setDate(lundi.getDate()-7); chargerSemaine(); };
  document.getElementById("sn").onclick = function(){ lundi.setDate(lundi.getDate()+7); chargerSemaine(); };
  document.getElementById("nag").onchange = function(){ agenda = this.value; chargerSemaine(); };
  appelService({action:"agenda_liste", session:sessionGardee()}).then(function(r){
    if(r && r.ok && r.agendas){ agendas = r.agendas.filter(function(a){ return a.ecriture; });
      document.getElementById("nag").innerHTML = agendas.map(function(a){ return '<option value="'+(a.principal ? "primary" : esc(a.id))+'">'+esc(a.principal ? "Mon agenda" : a.nom)+'</option>'; }).join("") || '<option value="primary">Mon agenda</option>'; }
  }).catch(function(){});
  appelService({action:"equipe", session:sessionGardee()}).then(function(r){
    if(r && r.ok) document.getElementById("na").innerHTML = '<option>Toute l\'équipe</option>' + r.personnes.map(function(p){ return '<option>'+esc(p.nom)+'</option>'; }).join("");
  }).catch(function(){});
  document.getElementById("nok").onclick = function(){
    var sujet = document.getElementById("ns").value.trim(); if(!sujet){ dire("▪ SUJET REQUIS"); return; }
    if(conges[isoJour(jour)] && !nouveau.confirme){ nouveau.confirme = true; dire("▪ LE LABO EST FERMÉ CE JOUR · TOUCHEZ ENVOYER POUR CONFIRMER"); return; } nouveau.confirme = false;
    var bt = this; bt.disabled = true; dire("▪ ENVOI…");
    appelService({action:"agenda_creer", session:sessionGardee(), agenda:agenda, titre:sujet, texte:document.getElementById("nt").value, a:document.getElementById("na").value,
      debut:isoJour(jour)+"T"+("0"+hr).slice(-2)+":"+("0"+mn).slice(-2), minutes:30, repeter:document.getElementById("nr").value}).then(function(r){
      if(r && r.ok){ dire("▪ RÉUNION PLANIFIÉE"); chargerSemaine(); setTimeout(function(){ bt.disabled = false; }, 800); }
      else { bt.disabled = false; dire("▪ NON PLANIFIÉE · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase()); }
    }).catch(function(){ bt.disabled = false; dire("▪ NON PLANIFIÉE · RÉSEAU"); });
  };
  obtenir("calendrier", {action:"calendrier"}, function(r){ (r.jours || []).forEach(function(x){ if(x.t === "f") conges[x.d] = "f"; else if(x.t === "c" && !conges[x.d]) conges[x.d] = "c"; }); dessiner(); }, function(){}, true);
  dessiner(); chargerSemaine();
}
function mesEvenements(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Mes événements</h1><div id="me"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); nouveau("reunion"); };
  var liste = [], choisi = null, msg = "";
  function dessiner(){
    var el = document.getElementById("me"); if(!el) return;
    var h = liste.length ? liste.map(function(e, i){ var d0 = new Date(e.debut);
      return '<a href="#" class="ligne" data-i="'+i+'" style="color:inherit;text-decoration:none'+(choisi === i ? ';background:var(--tx);color:var(--noir)' : '')+'"><span>'+esc(e.titre)+'</span><span>'+d0.getDate()+" "+MOIS_LONGS[d0.getMonth()].slice(0,4)+". · "+heureTxt(d0.getHours(), d0.getMinutes())+(e.serie ? " · série" : "")+'</span></a>'; }).join("") : '<div class="bandeau">▪ AUCUN ÉVÉNEMENT À VENIR</div>';
    if(choisi !== null) h += '<div class="aeact"><button type="button" class="bouton" id="m1">Cet événement</button>'+(liste[choisi].serie ? '<button type="button" class="bouton" id="m2">Toute la série</button>' : '')+'</div>';
    if(msg) h += '<div class="bandeau">'+esc(msg)+'</div>';
    el.innerHTML = h;
    Array.prototype.forEach.call(el.querySelectorAll("[data-i]"), function(a){ a.onclick = function(e){ e.preventDefault(); choisi = +a.getAttribute("data-i"); dessiner(); }; });
    function sup(serie){ var e = liste[choisi]; msg = "▪ SUPPRESSION…"; dessiner();
      appelService({action:"agenda_supprimer", session:sessionGardee(), id:e.id, serie:serie}).then(function(r){ if(r && r.ok){ choisi = null; msg = ""; charger(); } else { msg = "▪ "+String((r && r.erreur) || "ÉCHEC").toUpperCase(); dessiner(); } }).catch(function(){ msg = "▪ ÉCHEC · RÉSEAU"; dessiner(); }); }
    var b1 = document.getElementById("m1"); if(b1) b1.onclick = function(){ sup(false); };
    var b2 = document.getElementById("m2"); if(b2) b2.onclick = function(){ sup(true); };
  }
  function charger(){ appelService({action:"agenda_mes", session:sessionGardee()}).then(function(r){ liste = (r && r.ok) ? r.evenements : []; dessiner(); }).catch(function(){ var el = document.getElementById("me"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; }); }
  charger();
}
// Portrait d'un employé (direction seulement): chiffres de la section 01 et échelle salariale, lus en direct par le service.
// Fenêtre de confirmation Non / Oui (aucune page de plus).
function confirmerOuiNon(question, oui, rouge){
  var f = document.createElement("div");
  f.style.cssText = "position:fixed;inset:0;background:rgba(15,20,32,.55);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50";
  f.innerHTML = '<div style="background:#e3dfd3;color:#111;border:1.5px solid #111;padding:20px;width:100%;max-width:340px"><div style="font-size:15px;line-height:1.5;margin-bottom:16px">'+esc(question)+'</div><div class="aeact" style="margin:0"><button type="button" class="bouton" id="cno" style="margin:0">Non</button><button type="button" class="bouton" id="coui" style="margin:0'+(rouge ? ";background:#a32d2d;color:#fff" : "")+'">Oui</button></div></div>';
  document.body.appendChild(f);
  document.getElementById("cno").onclick = function(){ f.remove(); };
  document.getElementById("coui").onclick = function(){ f.remove(); oui(); };
}
function utilisationApp(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Utilisation</h1><div id="ut"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  function pc(x){ return Math.round(x*100)+" %"; }
  function barre(x){ return '<div style="height:10px;border:1px solid var(--tx2);margin:4px 0 10px"><i style="display:block;height:100%;width:'+Math.round(x*100)+'%;background:var(--tx)"></i></div>'; }
  appelService({action:"utilisation", session:sessionGardee()}).then(function(r){
    var el = document.getElementById("ut"); if(!el) return;
    if(!r || !r.ok) throw 0;
    if(!r.employes.length){ el.innerHTML = '<div class="bandeau">▪ LE SUIVI COMMENCE AUJOURD\'HUI · REVENEZ DEMAIN</div>'; return; }
    el.innerHTML = '<div class="etq">JOURS OUVRABLES OÙ L\'EMPLOYÉ A OUVERT L\'APPLICATION · 6 DERNIERS MOIS · DEPUIS LE '+esc(r.depuis)+'</div>' +
      '<div class="etq" style="margin-top:14px">MOYENNE DE L\'ÉQUIPE · '+pc(r.moyenne || 0)+'</div>'+barre(r.moyenne || 0) +
      '<div class="etiq" style="margin-top:14px">▪ EMPLOYÉS</div>' +
      r.employes.map(function(x){ return '<div class="ligne"><span>'+esc(x.nom)+'</span><span>'+pc(x.taux)+'</span></div>'+barre(x.taux); }).join("");
  }).catch(function(){ var el = document.getElementById("ut"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
// Suivi de charge (responsables et direction): un employé à la fois, du premier au dernier, avec le bouton du bas.
var SC_AGENDAS = null;
function suiviCharge(){
  app.innerHTML = '<div class="page" style="padding-bottom:90px"><a class="retour" href="#" id="retour">← Retour</a><h1>Suivi de charge</h1><div id="sc"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  var liste = [], i = 0, etat = "", noteOn = false, planOn = false, msg = "", occupe = false;
  var lundi, jour, hr, mn, evs, agenda, conges = {};
  var ETATS = ["Tout va bien", "À surveiller", "Intervention requise"];
  function pc(x){ return x == null ? "—" : Math.round(x*100)+" %"; }
  function tuile(v, lib, hors){ return '<div style="flex:1;border:'+(hors ? "3px" : "1px")+' solid var(--tx);padding:8px 4px;text-align:center"><b style="display:block;font-weight:400;font-size:20px">'+pc(v)+'</b><small style="display:block;font-size:9px;letter-spacing:.08em;text-transform:uppercase;opacity:.8;margin-top:2px">'+lib+'</small></div>'; }
  function dateCourte(d){ var p = String(d).split("-"); return +p[2]+" "+MOIS_LONGS[+p[1]-1].slice(0,4)+"."; }
  function initPlan(){ lundi = lundiDe(new Date()); jour = new Date(); hr = 9; mn = 0; evs = []; agenda = "primary"; }
  function bouton(txt, on, rose, id){ return '<button type="button" id="'+id+'" class="bouton" style="margin:0;flex:1;font-size:11px;padding:12px 2px;'+(on ? "" : "background:"+(rose ? "#f4b3c4" : "transparent")+";color:#111;")+'border:1.5px solid var(--tx)">'+txt+'</button>'; }
  function dessiner(){
    var el = document.getElementById("sc"); if(!el) return;
    var p = liste[i], d = p.dernier;
    var h = '<div class="etq">'+(i+1)+' SUR '+liste.length+'</div><div style="font-size:22px;margin:2px 0 10px">'+esc(p.nom)+'</div>' +
      '<div style="display:flex;gap:6px">'+tuile(p.effectuee, "Effectuée · cible 80 %", p.effectuee != null && p.effectuee < 0.8)+tuile(p.nonTerminee, "Non terminée · max 5 %", p.nonTerminee != null && p.nonTerminee > 0.05)+tuile(p.objectifs, "Objectifs · cible 80 %", p.objectifs != null && p.objectifs < 0.8)+'</div>' +
      '<div class="etq" style="margin-top:4px">CADRE ÉPAIS = HORS CIBLE</div>' +
      '<div style="border-left:4px solid var(--tx);padding:8px 10px;margin:10px 0;font-size:13px;line-height:1.5"><b class="etq" style="font-weight:500;text-transform:uppercase">Suivi de la réunion précédente'+(d ? " · "+dateCourte(d.date) : "")+'</b>'+(d && d.note ? esc(d.note) : '<span style="opacity:.7">Aucune note.</span>')+'</div>' +
      '<div class="etq" style="margin-top:12px">ÉTAT · OBLIGATOIRE</div><div style="display:flex;gap:6px;margin-top:4px">'+ETATS.map(function(x, k){ return bouton(x, etat === x, true, "se"+k); }).join("")+'</div>' +
      '<div class="etq" style="margin-top:14px">OPTIONNEL</div><div style="display:flex;gap:6px;margin-top:4px">'+bouton("Inscrire une note", noteOn, false, "sn")+bouton("Planifier une rencontre", planOn, false, "sp")+'</div>' +
      (noteOn ? '<textarea class="champ" id="snt" rows="3" maxlength="2000" placeholder="Note du suivi…" style="margin-top:8px">'+esc(sauvNote)+'</textarea>' : "") +
      (planOn ? '<div id="scp"></div>' : "") +
      (msg ? '<div class="bandeau" style="margin-top:10px">'+esc(msg)+'</div>' : "");
    el.innerHTML = h;
    ETATS.forEach(function(x, k){ document.getElementById("se"+k).onclick = function(){ lireNote(); etat = x; msg = ""; dessiner(); }; });
    document.getElementById("sn").onclick = function(){ lireNote(); noteOn = !noteOn; dessiner(); };
    document.getElementById("sp").onclick = function(){ lireNote(); planOn = !planOn; if(planOn) initPlan(); dessiner(); if(planOn) chargerSemaine(); };
    if(planOn) dessinerPlan();
    barre();
  }
  var sauvNote = "";
  function lireNote(){ var t = document.getElementById("snt"); if(t) sauvNote = t.value; }
  function barre(){
    var b = document.getElementById("scb");
    if(!b){ b = document.createElement("button"); b.type = "button"; b.id = "scb"; b.className = "bouton"; document.body.appendChild(b); }
    b.style.cssText = "position:fixed;z-index:20;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(max(env(safe-area-inset-bottom,0px),12px) + 10px);width:auto;margin:0;font-size:13px;padding:13px 18px;" + (etat ? "" : "opacity:.5");
    b.textContent = i === liste.length-1 ? "Enregistrer et terminer →" : "Enregistrer et suivant →";
    b.onclick = enregistrer;
  }
  function nettoyer(){ var b = document.getElementById("scb"); if(b) b.remove(); }
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); nettoyer(); responsable(); };
  function dessinerPlan(){
    var z = document.getElementById("scp"); if(!z) return;
    var fin = new Date(lundi); fin.setDate(fin.getDate()+6);
    var hs = ""; for(var h = 7; h <= 18; h++){ hs += '<option value="'+h+':0">'+heureTxt(h,0)+'</option><option value="'+h+':30">'+heureTxt(h,30)+'</option>'; }
    var ag = (SC_AGENDAS || []).map(function(a){ return '<option value="'+(a.principal ? "primary" : esc(a.id))+'"'+((a.principal ? "primary" : a.id) === agenda ? " selected" : "")+'>'+esc(a.principal ? "Mon agenda" : a.nom)+'</option>'; }).join("") || '<option value="primary">Mon agenda</option>';
    var g = '<div class="gs"><div class="d"></div>';
    for(var k = 0; k < 7; k++){ var dj = new Date(lundi); dj.setDate(dj.getDate()+k); g += '<div class="d'+(isoJour(dj) === isoJour(jour) ? " on" : "")+(conges[isoJour(dj)] ? " "+conges[isoJour(dj)] : "")+'" data-j="'+isoJour(dj)+'">'+JOURS_C[k]+" "+dj.getDate()+'</div>'; }
    for(h = 7; h <= 18; h++){
      g += '<div class="h">'+h+' h</div>';
      for(k = 0; k < 7; k++){ dj = new Date(lundi); dj.setDate(dj.getDate()+k); var ij = isoJour(dj);
        var occ = evs.some(function(e){ var d0 = new Date(e.debut); return isoJour(d0) === ij && d0.getHours() <= h && new Date(e.fin) > new Date(dj.getFullYear(), dj.getMonth(), dj.getDate(), h, 0); });
        g += '<div class="'+(ij === isoJour(jour) && h === hr ? "n" : occ ? "e" : conges[ij] ? "cl"+conges[ij] : "")+'" data-j="'+ij+'" data-h="'+h+'"></div>'; }
    }
    var duJour = evs.filter(function(e){ return isoJour(new Date(e.debut)) === isoJour(jour); });
    z.innerHTML = '<div class="etiq" style="margin-top:12px">▪ AGENDA</div><select class="champ" id="spag">'+ag+'</select>' +
      '<div class="moisbar"><button type="button" id="spp" aria-label="Semaine précédente">←</button><b>'+lundi.getDate()+" "+MOIS_LONGS[lundi.getMonth()].toUpperCase()+" — "+fin.getDate()+" "+MOIS_LONGS[fin.getMonth()].toUpperCase()+'</b><button type="button" id="spn" aria-label="Semaine suivante">→</button></div>' + g + '</div>' +
      '<div class="etiq" style="margin-top:14px">▪ '+jour.getDate()+" "+MOIS_LONGS[jour.getMonth()].toUpperCase()+(conges[isoJour(jour)] ? " · LABO FERMÉ" : "")+'</div>' +
      (duJour.length ? duJour.map(function(e){ var d0 = new Date(e.debut); return '<div class="ligne"><span>'+heureTxt(d0.getHours(), d0.getMinutes())+'</span><span style="flex:1;margin-left:12px">'+esc(e.titre)+'</span></div>'; }).join("") : '<div class="bandeau">▪ AUCUN ÉVÉNEMENT CE JOUR</div>') +
      '<div class="dh"><select class="champ" id="sph">'+hs+'</select><select class="champ" id="spr"><option value="aucune">Une seule fois</option><option value="jour">Chaque jour ouvrable</option><option value="semaine" selected>Chaque semaine</option><option value="deux">Aux deux semaines</option><option value="mois">Chaque mois</option></select></div>' +
      '<div class="etq" style="margin-top:8px">À</div><div class="champ" style="padding:12px 0">'+esc(liste[i].nom)+'</div><div class="etq">SUJET</div><div class="champ" style="padding:12px 0">Suivi de charge · '+esc(liste[i].nom)+'</div>';
    document.getElementById("sph").value = hr+":"+mn;
    document.getElementById("sph").onchange = function(){ var q = this.value.split(":"); hr = +q[0]; mn = +q[1]; dessinerPlan(); };
    document.getElementById("spag").onchange = function(){ agenda = this.value; chargerSemaine(); };
    document.getElementById("spp").onclick = function(){ lundi.setDate(lundi.getDate()-7); chargerSemaine(); };
    document.getElementById("spn").onclick = function(){ lundi.setDate(lundi.getDate()+7); chargerSemaine(); };
    Array.prototype.forEach.call(z.querySelectorAll(".gs [data-j]"), function(c){ c.onclick = function(){
      var q = c.getAttribute("data-j").split("-"); jour = new Date(+q[0], +q[1]-1, +q[2]); var hh = c.getAttribute("data-h"); if(hh){ hr = +hh; mn = 0; } dessinerPlan(); }; });
  }
  function chargerSemaine(){
    appelService({action:"agenda_semaine", session:sessionGardee(), debut:isoJour(lundi), agenda:agenda}).then(function(r){ evs = (r && r.ok) ? r.evenements : []; dessinerPlan(); }).catch(function(){ evs = []; dessinerPlan(); });
  }
  function suivant(){
    nettoyer();
    if(i >= liste.length-1){ responsable(); return; }
    i++; etat = ""; noteOn = false; planOn = false; sauvNote = ""; msg = ""; occupe = false; window.scrollTo(0, 0); dessiner();
  }
  function enregistrer(){
    if(occupe) return;
    lireNote();
    if(!etat){ msg = "▪ CHOISISSEZ UN ÉTAT AVANT DE CONTINUER"; dessiner(); return; }
    var p = liste[i];
    function sauver(){
      appelService({action:"charge_suivi", session:sessionGardee(), nom:p.brut, etat:etat, note:noteOn ? sauvNote : ""}).then(function(r){
        if(r && r.ok){ p.dernier = {date: isoJour(new Date()), etat: etat, note: noteOn ? sauvNote.trim() : ""}; suivant(); }
        else { occupe = false; msg = "▪ NON ENREGISTRÉ · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase(); dessiner(); }
      }).catch(function(){ occupe = false; msg = "▪ NON ENREGISTRÉ · RÉSEAU"; dessiner(); });
    }
    occupe = true; msg = "▪ ENREGISTREMENT…"; dessiner();
    if(planOn){
      appelService({action:"agenda_creer", session:sessionGardee(), agenda:agenda, titre:"Suivi de charge · "+p.nom, texte:"", a:p.brut,
        debut:isoJour(jour)+"T"+("0"+hr).slice(-2)+":"+("0"+mn).slice(-2), minutes:30, repeter:document.getElementById("spr") ? document.getElementById("spr").value : "semaine"}).then(function(r){
        if(r && r.ok) sauver(); else { occupe = false; msg = "▪ RENCONTRE NON PLANIFIÉE · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase(); dessiner(); }
      }).catch(function(){ occupe = false; msg = "▪ RENCONTRE NON PLANIFIÉE · RÉSEAU"; dessiner(); });
    } else sauver();
  }
  obtenir("calendrier", {action:"calendrier"}, function(r){ (r.jours || []).forEach(function(x){ if(x.t === "f") conges[x.d] = "f"; else if(x.t === "c" && !conges[x.d]) conges[x.d] = "c"; }); }, function(){}, true);
  appelService({action:"agenda_liste", session:sessionGardee()}).then(function(r){ if(r && r.ok && r.agendas) SC_AGENDAS = r.agendas.filter(function(a){ return a.ecriture; }); }).catch(function(){});
  appelService({action:"charge_equipe", session:sessionGardee()}).then(function(r){
    var el = document.getElementById("sc"); if(!el) return;
    if(!r || !r.ok) throw 0;
    liste = r.employes; if(!liste.length){ el.innerHTML = '<div class="bandeau">▪ AUCUN EMPLOYÉ À SUIVRE</div>'; return; }
    initPlan(); dessiner();
  }).catch(function(){ var el = document.getElementById("sc"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function gestionEmployes(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Employés</h1><div id="ge"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  function agir(id, nom, actif){
    confirmerOuiNon((actif ? "Réactiver " : "Désactiver ")+nom+"?", function(){
      var el = document.getElementById("ge"); if(el) el.innerHTML = '<div class="bandeau">▪ EN COURS…</div>';
      appelService({action:"employe_actif", session:sessionGardee(), id:id, actif:actif}).then(function(r){
        if(!r || !r.ok) throw 0; gestionEmployes();
      }).catch(function(){ var e2 = document.getElementById("ge"); if(e2) e2.innerHTML = '<div class="bandeau">▪ ÉCHEC · RÉESSAYEZ</div>'; setTimeout(gestionEmployes, 1800); });
    });
  }
  function supprimer(id, nom){
    confirmerOuiNon("Supprimer "+nom+"? Ses archives sont gardées 4 ans.", function(){
      var el = document.getElementById("ge"); if(el) el.innerHTML = '<div class="bandeau">▪ SUPPRESSION EN COURS…</div>';
      appelService({action:"employe_supprimer", session:sessionGardee(), id:id}).then(function(r){
        if(!r || !r.ok) throw 0; gestionEmployes();
      }).catch(function(){ var e2 = document.getElementById("ge"); if(e2) e2.innerHTML = '<div class="bandeau">▪ ÉCHEC · VÉRIFIEZ LE CLASSEUR</div>'; setTimeout(gestionEmployes, 2500); });
    }, true);
  }
  appelService({action:"employes_etat", session:sessionGardee()}).then(function(r){
    var el = document.getElementById("ge"); if(!el) return;
    if(!r || !r.ok) throw 0;
    el.innerHTML = '<div class="etq">CHOISIR UN EMPLOYÉ</div><select class="champ" id="gs">'+r.actifs.map(function(x){ return '<option value="'+esc(x.id)+'">'+esc(x.nom)+'</option>'; }).join("")+'</select>' +
      '<div class="aeact" style="margin:0 0 22px"><button type="button" class="bouton" id="gsup" style="margin:0">Supprimer</button><button type="button" class="bouton" id="gdes" style="margin:0">Désactiver</button></div>' +
      '<div class="etiq">▪ INACTIFS</div>' +
      (r.inactifs.length ? r.inactifs.map(function(x, k){ return '<div class="ligne"><span>'+esc(x.nom)+'</span><span style="display:flex;gap:6px"><button type="button" class="bouton" data-s="'+k+'" style="margin:0;width:auto;padding:6px 14px">Supprimer</button><button type="button" class="bouton" data-k="'+k+'" style="margin:0;width:auto;padding:6px 14px">Réactiver</button></span></div>'; }).join("") : '<div class="bandeau">▪ AUCUN</div>');
    document.getElementById("gdes").onclick = function(){ var s = document.getElementById("gs"); if(s.value) agir(s.value, s.options[s.selectedIndex].text, false); };
    document.getElementById("gsup").onclick = function(){ var s = document.getElementById("gs"); if(s.value) supprimer(s.value, s.options[s.selectedIndex].text); };
    Array.prototype.forEach.call(el.querySelectorAll("button[data-s]"), function(b){ b.onclick = function(){ var x = r.inactifs[+b.getAttribute("data-s")]; supprimer(x.id, x.nom); }; });
    Array.prototype.forEach.call(el.querySelectorAll("button[data-k]"), function(b){ b.onclick = function(){ var x = r.inactifs[+b.getAttribute("data-k")]; agir(x.id, x.nom, true); }; });
  }).catch(function(){ var el = document.getElementById("ge"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function sectionsPortrait(p){
  function pct(x){ return x === null || x === undefined ? "—" : Math.round(x*100)+" %"; }
  var c = p.contribution, ch = p.charge, pa = p.paroles, ci = p.cibles || {}, h = "";
  h += '<div class="etq" style="margin-top:14px">CONTRIBUTION</div>';
  h += c ? '<div style="font-size:28px">'+pct(c.resultat)+'</div>' +
      [["Technique", c.tech], ["Autonomie", c.auto], ["Qualité", c.qual]].filter(function(l){ return l[1] !== null && l[1] !== undefined; })
        .map(function(l){ return '<div class="ligne"><span>▪ '+l[0]+'</span><span>'+esc(String(l[1]).replace(".", ","))+'</span></div>'; }).join("") +
      (c.obj !== null && c.obj !== undefined ? '<div class="ligne"><span>▪ Objectifs</span><span>'+pct(c.obj)+'</span></div>' : "")
    : '<div class="bandeau">▪ AUCUNE APPRÉCIATION CETTE ANNÉE</div>';
  h += '<div class="etiq" style="margin-top:18px">▪ 02 CHARGE DE TRAVAIL</div>';
  h += ch ? [["Charge effectuée", ch.effectuee, "cible "+pct(ci.effectuee)], ["Charge non terminée", ch.nonTerminee, "cible "+pct(ci.nonTerminee)], ["Objectifs atteints", ch.objectifs, "cible "+pct(ci.objectifs)]]
      .map(function(l){ return '<div class="ligne"><span>▪ '+l[0]+' <small>'+l[2]+'</small></span><span>'+pct(l[1])+'</span></div>'; }).join("")
    : '<div class="bandeau">▪ DONNÉES À VENIR</div>';
  h += '<div class="etiq" style="margin-top:18px">▪ 03 POUR NOTRE DISCUSSION</div>';
  h += pa ? [["CE QUI VA BIEN", pa.bien], ["À DÉVELOPPER", pa.developper], ["À ABORDER", pa.aborder]].filter(function(l){ return l[1]; })
      .map(function(l){ return '<div class="etq" style="margin-top:10px">'+l[0]+'</div><div>'+esc(l[1])+'</div>'; }).join("")
    : '<div class="bandeau">▪ AUTOÉVALUATION NON REMPLIE</div>';
  return h;
}
function portrait(id){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><div id="pt"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  function dollars(n){ return n === null || n === undefined ? "—" : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" $"; }
  appelService({action:"portrait", session:sessionGardee(), id:id || ""}).then(function(r){
    var el = document.getElementById("pt"); if(!el) return;
    if(!r || !r.ok) throw 0;
    var p = r.portrait, liste = r.employes, i = liste.map(function(x){ return x.id; }).indexOf(p.id);
    var posNum = parseFloat(String(p.position).replace(",", ".")), ech = p.echelle || [];
    var lignes = [["Salaire de base", p.base], ["Vacances, fériés et maladie", p.conges], ["Boni", p.boni], ["Assurances collectives", p.assurances], ["Cotisation OTPADQ", p.otpadq]];
    el.innerHTML = '<h1>'+esc(p.nom)+'</h1><div class="etiq">'+esc(String(p.categorie).toUpperCase())+' · PORTRAIT '+(new Date().getFullYear())+'</div>' +
      '<select class="champ" id="ps">'+liste.map(function(x){ return '<option value="'+esc(x.id)+'"'+(x.id === p.id ? " selected" : "")+'>'+esc(x.nom)+'</option>'; }).join("")+'</select>' +
      '<div class="aeact" style="margin:0 0 14px"><button type="button" class="bouton" id="pp" style="margin:0"'+(i <= 0 ? " disabled" : "")+'>Précédent</button><button type="button" class="bouton" id="psv" style="margin:0"'+(i >= liste.length-1 ? " disabled" : "")+'>Suivant</button></div>' +
      '<div class="etiq">▪ 01 OÙ VOUS EN ÊTES</div>' +
      '<div class="dh"><div style="flex:1"><div class="etq">EXPÉRIENCE</div><div style="font-size:28px">'+(p.experience === null ? "—" : esc(String(p.experience).replace(".", ","))+' <small>ans</small>')+'</div></div><div style="flex:1"><div class="etq">POSITION DANS L\'ÉCHELLE</div><div style="font-size:28px">'+esc(String(p.position).replace("%", "").trim())+' <small>%</small></div></div></div>' +
      '<div class="etq" style="margin-top:14px">RÉMUNÉRATION GLOBALE</div><div style="font-size:28px">'+dollars(p.total)+'</div>' +
      lignes.map(function(l){ return '<div class="ligne"><span>▪ '+l[0]+'</span><span>'+dollars(l[1])+'</span></div>'; }).join("") +
      (ech.length ? '<div class="etiq" style="margin-top:18px">▪ ÉCHELLE SALARIALE — '+esc(String(p.categorie).toUpperCase())+'</div><div style="overflow-x:auto"><table class="gs-t" style="border-collapse:collapse;font-size:12px;width:100%"><tr>'+ech.map(function(c){ var act = parseFloat(String(c.p).replace(",", ".")) === posNum; return '<td style="padding:6px 4px;text-align:center;border:1px solid var(--tx2)'+(act ? ';background:var(--tx);color:var(--noir)' : '')+'">'+esc(String(c.p).replace("%", ""))+'</td>'; }).join("")+'</tr><tr>'+ech.map(function(c){ var act = parseFloat(String(c.p).replace(",", ".")) === posNum; return '<td style="padding:6px 4px;text-align:center;border:1px solid var(--tx2)'+(act ? ';background:var(--tx);color:var(--noir)' : '')+'">'+esc(String(c.t))+'</td>'; }).join("")+'</tr></table></div>' : "") + sectionsPortrait(p);
    document.getElementById("ps").onchange = function(){ portrait(this.value); };
    var pp = document.getElementById("pp"), sv = document.getElementById("psv");
    if(pp) pp.onclick = function(){ if(i > 0) portrait(liste[i-1].id); };
    if(sv) sv.onclick = function(){ if(i < liste.length-1) portrait(liste[i+1].id); };
  }).catch(function(){ var el = document.getElementById("pt"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function chiffresTel(t){ var d = String(t || "").replace(/\D/g, ""); return d.length === 10 ? "+1"+d : (d.length === 11 && d[0] === "1" ? "+"+d : d); }
function contactsResp(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Contacts</h1><input class="champ" id="cq" placeholder="Rechercher" autocomplete="off"><div class="ctl" id="ctl"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  var liste = [];
  function dessiner(){
    var q = (document.getElementById("cq").value || "").toLowerCase(), el = document.getElementById("ctl"); if(!el) return;
    var v = liste.filter(function(c){ return !q || (c.nom+" "+c.groupes).toLowerCase().indexOf(q) >= 0; });
    el.innerHTML = v.map(function(c){ var t = chiffresTel(c.tel);
      return '<div class="cr"><div class="cn">'+esc(c.nom)+'<small>'+esc(c.groupes)+(c.groupes && c.tel ? ' · ' : '')+esc(c.tel)+'</small></div>' +
        (t ? '<a class="ib" href="tel:'+t+'">TÉL</a><a class="ib" href="sms:'+t+'">SMS</a>' : '<span class="ib vide"></span><span class="ib vide"></span>') +
        '<a class="ib" href="mailto:'+esc(c.courriel)+'">@</a></div>'; }).join("") || '<div class="bandeau">▪ AUCUN RÉSULTAT</div>';
  }
  document.getElementById("cq").oninput = dessiner;
  obtenir("contacts", {action:"contacts"}, function(r){ liste = r.contacts || []; dessiner(); },
    function(){ var el = document.getElementById("ctl"); if(el) el.innerHTML = '<div class="bandeau">▪ CONTACTS INDISPONIBLES · RÉESSAYEZ</div>'; }, true);
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
function heures(){
  // Données fictives en attendant les vraies heures du logiciel de gestion : aucun appel au service. Tout tient sur un écran.
  var cette = [["Lun 2","8 h 00"],["Mar 3","7 h 53"],["Mer 4","8 h 11"],["Jeu 5","8 h 04"],["Ven 6","7 h 57"],["Sam 7","6 h 39"],["Dim 8","—"]];
  var passee = [["Lun 26","8 h 06"],["Mar 27","7 h 48"],["Mer 28","8 h 18"],["Jeu 29","7 h 54"],["Ven 30","8 h 06"],["Sam 31","—"],["Dim 1","—"]];
  function col(t, r, tot){ return '<div><h2 class="h2">'+t+'</h2>'+r.map(function(x){ return '<div class="hc"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>'; }).join("")+'<div class="htot"><span>Total</span><b>'+tot+'</b></div></div>'; }
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Mes heures</h1>' +
    '<div class="hgros" style="margin-top:18px">6 h 39</div><div class="hsous">Faites depuis le début de la journée</div>' +
    '<h2 class="h2" style="margin-top:22px">Aujourd\'hui</h2>' +
    '<div class="hl"><span class="t">7 h 58</span><span>Arrivée</span></div><div class="hl"><span class="t">12 h 02</span><span>Pause</span></div><div class="hl"><span class="t">13 h 06</span><span>Retour</span></div>' +
    '<div class="hcols">'+col("Cette semaine", cette, "38 h 47")+col("Semaine passée", passee, "40 h 12")+'</div>' +
    '<p class="hnote">Heures d\'exemple.</p></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
}
function section(i){
  if(i === 0) return messages("");
  if(i === 4) return tableau();
  if(i === 5) return incendie();
  if(i === 6) return calendrier();
  if(i === 7) return rencontre();
  if(i === 8) return profil();
  if(i === 9) return heures();
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
