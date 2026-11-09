// Pictogrammes de l'accueil : blocs carrés pleins sur une grille de 24, couleur du texte.
var PICTOS = {
 "Mes heures": "M2 2h20v20h-20zM5 5h14v14h-14zM11 6 L13 6 L13 11 L17 11 L17 13 L11 13z",
 "Messages": "M2 3h20v14h-20zM5 6h14v8h-14zM2 17 L7 17 L2 22z",
 "Tableau de bord": "M2 20h20v2h-20zM3 12h5v7h-5zM10 5h5v14h-5zM17 9h5v10h-5z",
 "Calendrier": "M2 5h20v5h-20zM2 12h3v7h-3zM19 12h3v7h-3zM2 19h20v3h-20zM6 2h3v3h-3zM15 2h3v3h-3zM13 13h4v4h-4z",
 "Rencontre": "M3 3h6v6h-6zM2 11h8v10h-8zM14 7h6v6h-6zM13 15h8v6h-8z",
 "Autoévaluation": "M2 5h12v2h-12zM18 5h4v2h-4zM14 2h4v8h-4zM2 11h4v2h-4zM10 11h12v2h-12zM6 8h4v8h-4zM2 17h13v2h-13zM19 17h3v2h-3zM15 14h4v8h-4z",
 "Rémunération": "M6 2h16v5h-16zM2 9h16v5h-16zM6 16h16v5h-16z",
 "Manuel": "M2 6h9v16h-9zM13 2h9v16h-9z",
 "Plan d'incendie": "M12 2 L18 9 L18 16 L14 22 L8 22 L5 17 L5 12 L8 9 L9 12 L12 8zM10 15h4v4h-4z",
 "Mon profil": "M8 2h8v8h-8zM4 12h16v10h-16z",
 "Mes entretiens": "M4 2 L15 2 L20 7 L20 22 L4 22zM8 10h8v2h-8zM8 14h8v2h-8zM8 18h5v2h-5z",
 "Direction": "M2 3h11v9h-11zM14 9h8v9h-8z",
 "Gestionnaire": "M2 3h11v9h-11zM14 9h8v9h-8z",
 "Suivi de charge": "M2 3h16v4h-16zM2 10h10v4h-10zM2 17h20v4h-20z",
 "Stationnement": "M2 2h20v20h-20zM5 5h14v14h-14z",
 "Casier": "M2 2h20v20h-20zM4 4h7v7h-7zM13 4h7v7h-7zM4 13h7v7h-7zM13 13h7v7h-7z",
 "Finance": "M2 2h2v20h-2zM2 20h20v2h-20zM6 16 L10 11 L14 14 L21 5 L21 9 L14 18 L10 15 L6 19z",
 "Portrait d’un employé": "M2 2h20v20h-20zM5 5h14v14h-14zM9 7h6v5h-6zM7 14h10v3h-10z",
 "Positionnement": "M2 17h5v5h-5zM7 12h5v10h-5zM12 7h5v15h-5zM17 2h5v20h-5z"
};
function picto(n){ return PICTOS[n] ? '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="'+PICTOS[n]+'"/></svg>' : '▪ '; }
// Étape 1 : démarrage, connexion et menu. Aucune donnée réelle : la connexion et les sections sont des gabarits.
var SECTIONS = ["Messages", "Manuel d'employé", "Autoévaluation", "Rémunération", "Tableau de bord", "Plan d'incendie", "Calendrier", "Rencontre", "Mon profil", "Mes heures"];
var app = document.getElementById("app");
// Pictogramme à gauche du titre de chaque page de section (même jeu que le menu de l'accueil).
var PICTO_TITRES = {"mes heures":"Mes heures","messages":"Messages","tableau de bord":"Tableau de bord","calendrier":"Calendrier","rencontre":"Rencontre","autoévaluation":"Autoévaluation","rémunération":"Rémunération","manuel d'employé":"Manuel","plan d'incendie":"Plan d'incendie","mon profil":"Mon profil","mes entretiens":"Mes entretiens","direction":"Direction","gestionnaire":"Gestionnaire","suivi de charge":"Suivi de charge","stationnement":"Stationnement","casier":"Casier","finance":"Finance","portrait d'un employé":"Portrait d’un employé","positionnement embauche":"Positionnement"};
function decorerTitres(){
  Array.prototype.forEach.call(app.querySelectorAll(".page:not(.vue) > h1:not([data-pt])"), function(h){
    h.setAttribute("data-pt", "1");
    var page = h.parentNode, retour = page.querySelector("a.retour");
    var bl = document.createElement("div"); bl.className = "bl";
    var fl = document.createElement("a"); fl.className = "rt"; fl.href = "#"; fl.textContent = "←"; fl.setAttribute("aria-label", "Retour");
    fl.onclick = function(e){ e.preventDefault(); if(retour) retour.click(); };
    page.insertBefore(bl, h); bl.appendChild(fl); h.classList.add("ti"); bl.appendChild(h);
    page.classList.add("bl-ok");
    if(/^manuel/i.test(h.textContent.trim())) page.classList.add("p-manuel");
    if(retour) page.appendChild(retour);
  });
}
function majRetour(){
  Array.prototype.forEach.call(app.querySelectorAll(".page.bl-ok > a.retour"), function(r){
    var bl = r.parentNode.querySelector(".bl");
    var vu = !bl || bl.getBoundingClientRect().bottom > 0;
    r.style.display = vu ? "none" : "";
  });
}
new MutationObserver(function(){ decorerTitres(); majRetour(); }).observe(app, {childList: true, subtree: true});
window.addEventListener("scroll", majRetour, {passive: true});
window.addEventListener("resize", majRetour);

// Ordre d'affichage de l'accueil (choisi par la direction) : numéros de SECTIONS. Messages 0, Manuel 1, Autoévaluation 2, Rémunération 3, Tableau de bord 4, Plan d'incendie 5, Calendrier 6, Rencontre 7, Mon profil 8.
var PICTO_DE = ["Messages", "Manuel", "Autoévaluation", "Rémunération", "Tableau de bord", "Plan d'incendie", "Calendrier", "Rencontre", "Mon profil", "Mes heures"];
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
// Accueil « Aujourd'hui »: rencontres du jour (agenda principal), carré vert devant chaque ligne; rien d'affiché s'il n'y en a pas.
var AUJ = null;
function heureFr(d){ var h = d.getHours(), m = d.getMinutes(); return h+" h"+(m ? " "+("0"+m).slice(-2) : ""); }
function dessinerAujourdhui(){
  var z = document.getElementById("auj"); if(!z) return; var t = new Date(), iso = isoJour(t);
  var l = (AUJ || []).filter(function(e){ return isoJour(new Date(e.debut)) === iso; });
  if(!l.length){ z.innerHTML = ""; return; }
  z.innerHTML = '<div class="aujb"><b></b><b></b></div><div class="aujl">'+l.map(function(e){ var d = new Date(e.debut), fait = new Date(e.fin || e.debut) < t;
    return '<div'+(fait ? ' class="fait"' : "")+'>'+heureFr(d)+' · '+esc(e.titre || "")+'</div>'; }).join("")+'</div>';
}
function chargerAujourdhui(){
  var t = new Date(); t.setHours(0, 0, 0, 0); dessinerAujourdhui();
  appelService({action:"agenda_semaine", session:sessionGardee(), debut:isoJour(lundiDe(t)), agenda:"primary"}).then(function(r){
    if(r && r.ok){ AUJ = r.evenements; dessinerAujourdhui(); } }).catch(function(){});
}
function menu(){
  var dejaDemande = false; try { dejaDemande = localStorage.getItem("ldld-notif-demande") === "1"; } catch(e){}
  if(notifPossible() && !dejaDemande && Notification.permission === "default") return ecranNotifs();
  if(notifPossible() && Notification.permission === "granted" && !menu.abonne){ menu.abonne = true; abonnerNotifs().catch(function(){}); }
  if(!menu.precharge){ menu.precharge = true; prechargerDocs(); }
  precharger();
  var animer = !menu.anime; menu.anime = true;
  app.innerHTML = '<div class="menu accueil'+(animer ? ' anim' : '')+'"><img class="logo sym" width="110" src="assets/LDLD_symbole_blanc_transparent.png" alt="Lafond Desjardins"><div id="auj"></div>' +
    (peutEcrire() ? '<a href="#" id="resp">'+picto(MOI.role === "direction" ? "Direction" : "Gestionnaire")+(MOI.role === "direction" ? "Direction" : "Gestionnaire")+'</a>' : '') +
    ORDRE_MENU.filter(function(i){ return !peutEcrire() || (i !== 9 && i !== 4); }).map(function(i){ return '<a href="#" data-i="'+i+'"><span>'+picto(PICTO_DE[i])+SECTIONS[i]+'</span></a>'; }).join("") +
    (peutEcrire() ? '' : '<a href="#" id="entr">'+picto("Mes entretiens")+'Mes entretiens</a>') +
    '<a class="sortie" href="#" id="sortie">Déconnexion →</a></div>';
  if(animer) Array.prototype.forEach.call(app.querySelectorAll(".menu a:not(.sortie)"), function(a, k){ a.style.animationDelay = (0.7 + k * 0.09) + "s"; var ic = a.querySelector(".ic"); if(ic) ic.style.animationDelay = (0.7 + k * 0.09) + "s"; });
  Array.prototype.forEach.call(app.querySelectorAll("a[data-i]"), function(a){
    a.onclick = function(e){ e.preventDefault(); section(+a.getAttribute("data-i")); };
  });
  var en = document.getElementById("entr"); if(en) en.onclick = function(e){ e.preventDefault(); entretien(); };
  var rp = document.getElementById("resp"); if(rp) rp.onclick = function(e){ e.preventDefault(); responsable(); };
  document.getElementById("sortie").onclick = function(e){ e.preventDefault(); deconnecter(); };
  pastilleAuto(); pastilleMessages(); chargerAujourdhui();
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
  var w = document.getElementById("ecrire"); if(w) w.onclick = function(e){ e.preventDefault(); nouveau("message"); };
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
    app.querySelector(".page").insertAdjacentHTML("beforeend", '<div id="rdh"></div>' +
      '<button class="bouton" id="rplan">Planifier →</button><div class="bandeau" id="rep" style="display:none"></div>');
    var rep = document.getElementById("rep"); function dire(t){ rep.style.display = "block"; rep.textContent = t; }
    var dhr = dateHeure({agenda:false}); dhr.monter(document.getElementById("rdh"));
    document.getElementById("rplan").onclick = function(){
      var q = dhr.lire(); if(!q){ dhr.valider(); dire("▪ DATE ET HEURE REQUISES"); return; }
      var d = q.date, h = q.heure;
      var bt = this; bt.disabled = true; dire("▪ ENVOI…");
      appelService({action:"rencontre_planifier", session:sessionGardee(), id:id, date:d, heure:h}).then(function(r){
        if(r && r.ok){ dire("▪ RENCONTRE PLANIFIÉE · L'EMPLOYÉ EST AVISÉ"); }
        else { bt.disabled = false; dire("▪ NON PLANIFIÉE · "+((r && r.erreur) || "RÉESSAYEZ")); }
      }).catch(function(){ bt.disabled = false; dire("▪ NON PLANIFIÉE · RÉSEAU"); });
    };
  }
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
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>'+(MOI && MOI.role === "direction" ? "Direction" : "Gestionnaire")+'</h1><a class="doc" href="#" id="rn"><span>▪ Nouveau message</span><em>→</em></a><a class="doc" href="#" id="rsc"><span>▪ Suivi de charge</span><em>→</em></a><a class="doc" href="#" id="rc"><span>▪ Contacts</span><em>→</em></a><a class="doc" href="#" id="rs"><span>▪ Stationnement</span><em>→</em></a><a class="doc" href="#" id="rk"><span>▪ Casier</span><em>→</em></a><a class="doc" href="#" id="rme"><span>▪ Messages envoyés</span><em>→</em></a><a class="doc" href="#" id="rrd"><span>▪ Rencontres demandées</span><em>→</em></a><a class="doc" href="#" id="re"><span>▪ Entretien machinerie</span><em>→</em></a>'+(MOI && MOI.role === "direction" ? '<a class="doc" href="#" id="rpo"><span>▪ Portrait d\'un employé</span><em>→</em></a><a class="doc" href="#" id="rpe"><span>▪ Positionnement embauche</span><em>→</em></a><a class="doc" href="#" id="rpm"><span>▪ Positionnement employé</span><em>→</em></a><a class="doc" href="#" id="rec"><span>▪ Échelle salariale</span><em>→</em></a><a class="doc" href="#" id="rcf"><span>▪ Conseil d\'administration</span><em>→</em></a><a class="doc" href="#" id="rem"><span>▪ Employés</span><em>→</em></a><a class="doc" href="#" id="rea"><span>▪ Employé actuel</span><em>→</em></a><a class="doc" href="#" id="rut"><span>▪ Utilisation de l\'application</span><em>→</em></a>' : "")+'</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  document.getElementById("rn").onclick = function(e){ e.preventDefault(); nouveau("message"); };
  document.getElementById("rsc").onclick = function(e){ e.preventDefault(); suiviCharge(); };
  document.getElementById("rc").onclick = function(e){ e.preventDefault(); contactsResp(); };
  document.getElementById("rs").onclick = function(e){ e.preventDefault(); attributionPage("place"); };
  document.getElementById("rk").onclick = function(e){ e.preventDefault(); attributionPage("casier"); };
  document.getElementById("re").onclick = function(e){ e.preventDefault(); entretien(); };
  var rpo = document.getElementById("rpo"); if(rpo) rpo.onclick = function(e){ e.preventDefault(); portrait(); };
  var rec = document.getElementById("rec"); if(rec) rec.onclick = function(e){ e.preventDefault(); echOuvrir(); };
  var rcf = document.getElementById("rcf"); if(rcf) rcf.onclick = function(e){ e.preventDefault(); financeMenu(); };
  var rpm = document.getElementById("rpm"); if(rpm){ rpm.onclick = function(e){ e.preventDefault(); posEmpOuvrir(); }; posEmpPrecharger(); }
  var rpe = document.getElementById("rpe"); if(rpe){ rpe.onclick = function(e){ e.preventDefault(); embauchePos(); }; embPrecharger(); }
  var rem = document.getElementById("rem"); if(rem) rem.onclick = function(e){ e.preventDefault(); gestionEmployes(); };
  var rea = document.getElementById("rea"); if(rea) rea.onclick = function(e){ e.preventDefault(); eaOuvrir(); };
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
// ---- Composants communs: participants (groupes et employés) et agenda · calendrier · date · heure ----
var DH_CACHE = {agendas: null, conges: null};
var JOURS_ABR = ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."];
function nomTitre(n){ n = String(n || ""); return n === n.toUpperCase() ? n.toLowerCase().replace(/(^|[\s\-'’])([a-zàâäçéèêëîïôöùûüÿœ])/g, function(m, a, b){ return a+b.toUpperCase(); }) : n; }
function jourTxt(d){ var j = JOURS_ABR[d.getDay()]; return j.charAt(0).toUpperCase()+j.slice(1)+" "+d.getDate()+" "+MOIS_LONGS[d.getMonth()]; }
function pad2(n){ return ("0"+n).slice(-2); }
function boutonBas(texte, actif, action){
  var b = document.getElementById("btnbas");
  if(!b){ b = document.createElement("button"); b.type = "button"; b.id = "btnbas"; b.className = "bouton btnbas"; document.body.appendChild(b); }
  b.textContent = texte; b.disabled = !actif; b.onclick = action;
}
function retirerBoutonBas(){ var b = document.getElementById("btnbas"); if(b) b.remove(); }
// Participants: liste « Groupes » et liste « Employés » (choix multiples). Les membres d'un groupe choisi sont en gris pâle dans la liste Employés.
function participants(personnes, groupes, surChangement, init){
  var S = {grp: (init && init.grp) || [], emp: (init && init.emp) || [], ouvert: "", err: false, zone: null};
  var pers = personnes.map(function(p){ return {c: p.c, nom: nomTitre(p.nom)}; });
  function membresChoisis(){ var m = {}; groupes.forEach(function(g){ if(S.grp.indexOf(g.nom) >= 0) g.membres.forEach(function(c){ m[c] = (m[c] || []).concat(g.nom); }); }); return m; }
  function tous(){ var m = membresChoisis(), r = Object.keys(m); S.emp.forEach(function(c){ if(r.indexOf(c) < 0) r.push(c); }); return r; }
  function nomDe(c){ var p = pers.filter(function(x){ return x.c === c; })[0]; return p ? p.nom : c; }
  function noms(){ return S.grp.concat(S.emp.map(nomDe)); }
  function chips(liste, type){ return liste.map(function(x){ return '<span class="chip">'+esc(type === "g" ? x : nomDe(x))+' <span data-r="'+type+'" data-v="'+esc(x)+'" style="cursor:pointer">✕</span></span>'; }).join(""); }
  function rendre(){
    var z = S.zone; if(!z) return;
    var vide = tous().length === 0, via = membresChoisis(), h = "";
    var cl = function(o){ return "ms"+(vide ? " rose" : "")+(S.err && vide ? " err" : ""); };
    if(groupes.length){
      h += '<span class="lbl">Groupes · obligatoire</span><div class="'+cl()+'" id="pg"><div>'+(S.grp.length ? chips(S.grp, "g") : '<span class="vide">Choisir un ou plusieurs groupes</span>')+'</div><span style="padding:2px 4px">'+(S.ouvert === "g" ? "▴" : "▾")+'</span></div>';
      if(S.ouvert === "g") h += '<div class="msl">'+groupes.map(function(g){ var on = S.grp.indexOf(g.nom) >= 0; return '<div data-g="'+esc(g.nom)+'"><span class="cb'+(on ? " on" : "")+'">'+(on ? "✓" : "")+'</span>'+esc(g.nom)+'</div>'; }).join("")+'</div>';
    }
    h += '<span class="lbl">Employés · obligatoire</span><div class="'+cl()+'" id="pe"><div>'+(S.emp.length ? chips(S.emp, "e") : '<span class="vide">'+(vide ? "Choisir un ou plusieurs employés" : "Aucun employé en plus")+'</span>')+'</div><span style="padding:2px 4px">'+(S.ouvert === "e" ? "▴" : "▾")+'</span></div>';
    if(S.ouvert === "e"){
      var toutes = pers.length && pers.every(function(p){ return S.emp.indexOf(p.c) >= 0 || via[p.c]; });
      h += '<div class="msl"><div data-tous="1"><span class="cb'+(toutes ? " on" : "")+'">'+(toutes ? "✓" : "")+'</span>Toute mon équipe ('+pers.length+')</div>' + pers.map(function(p){
        if(via[p.c]) return '<div class="via"><span class="cb on">✓</span>'+esc(p.nom)+'<small>via '+esc(via[p.c].join(", "))+'</small></div>';
        var on = S.emp.indexOf(p.c) >= 0; return '<div data-e="'+esc(p.c)+'"><span class="cb'+(on ? " on" : "")+'">'+(on ? "✓" : "")+'</span>'+esc(p.nom)+'</div>'; }).join("")+'</div>';
    }
    var n = tous().length;
    if(n) h += '<div class="resume">'+n+' participant'+(n > 1 ? "s" : "")+' · '+esc(noms().slice(0, 3).join(", ")+(noms().length > 3 ? "…" : ""))+'</div>';
    z.innerHTML = h;
    var pg = document.getElementById("pg"); if(pg) pg.onclick = function(){ S.ouvert = S.ouvert === "g" ? "" : "g"; rendre(); };
    document.getElementById("pe").onclick = function(){ S.ouvert = S.ouvert === "e" ? "" : "e"; rendre(); };
    Array.prototype.forEach.call(z.querySelectorAll("[data-r]"), function(x){ x.onclick = function(ev){ ev.stopPropagation();
      var t = x.getAttribute("data-r"), v = x.getAttribute("data-v"), a = t === "g" ? S.grp : S.emp; a.splice(a.indexOf(v), 1); changer(); }; });
    Array.prototype.forEach.call(z.querySelectorAll("[data-g]"), function(x){ x.onclick = function(){ var v = x.getAttribute("data-g"), i = S.grp.indexOf(v); if(i < 0) S.grp.push(v); else S.grp.splice(i, 1); changer(); }; });
    Array.prototype.forEach.call(z.querySelectorAll("[data-e]"), function(x){ x.onclick = function(){ var v = x.getAttribute("data-e"), i = S.emp.indexOf(v); if(i < 0) S.emp.push(v); else S.emp.splice(i, 1); changer(); }; });
    var tt = z.querySelector("[data-tous]"); if(tt) tt.onclick = function(){ var m = membresChoisis(); var toutes = pers.every(function(p){ return S.emp.indexOf(p.c) >= 0 || m[p.c]; });
      S.emp = toutes ? [] : pers.filter(function(p){ return !m[p.c]; }).map(function(p){ return p.c; }); changer(); };
  }
  function changer(){ S.err = false; rendre(); if(surChangement) surChangement(); }
  return {
    monter: function(zone){ S.zone = zone; rendre(); },
    courriels: tous, noms: noms,
    valider: function(){ if(tous().length) return true; S.err = true; rendre(); return false; }
  };
}
// Agenda · calendrier de la semaine · détail du jour · Date | Heure (listes), identiques partout où l'on retrouve le calendrier.
// opts.agenda === false: pas de choix d'agenda (agenda principal). Le calendrier suit la date, et la date suit le calendrier.
function dateHeure(opts, surChangement){
  opts = opts || {};
  var auj = new Date(); auj.setHours(0, 0, 0, 0);
  var S = {lundi: lundiDe(auj), jour: "", heure: "", agenda: "primary", evs: [], err: false, zone: null, confirme: false, ed: null};
  if(opts.init && opts.init.jour){ var pi = opts.init.jour.split("-"); S.jour = opts.init.jour; S.heure = opts.init.heure || ""; S.lundi = lundiDe(new Date(+pi[0], +pi[1]-1, +pi[2])); }
  function isoDe(d){ return isoJour(d); }
  function depuis(iso){ var p = iso.split("-"); return new Date(+p[0], +p[1]-1, +p[2]); }
  function charger(){
    appelService({action:"agenda_semaine", session:sessionGardee(), debut:isoJour(S.lundi), agenda:S.agenda}).then(function(r){ S.evs = (r && r.ok) ? r.evenements : []; rendre(); }).catch(function(){ S.evs = []; rendre(); });
  }
  function conge(iso){ return DH_CACHE.conges && DH_CACHE.conges[iso]; }
  function optJours(sel){ var r = "", dd2 = new Date(auj), tr = false;
    for(var i2 = 0; i2 < 56; i2++){ var iso2 = isoJour(dd2); if(iso2 === sel) tr = true; r += '<option value="'+iso2+'"'+(iso2 === sel ? " selected" : "")+'>'+(i2 === 0 ? "Aujourd'hui \u00b7 " : i2 === 1 ? "Demain \u00b7 " : "")+jourTxt(dd2)+'</option>'; dd2.setDate(dd2.getDate()+1); }
    if(sel && !tr) r += '<option value="'+sel+'" selected>'+jourTxt(depuis(sel))+'</option>'; return r; }
  // Heures libres d'un jour pour une durée (minutes), sans compter l'événement ignoré; retourne {html, masquees}.
  function optHeures(jour, sel, minutes, ignorer){ var r = "", masq = 0, jd2 = jour ? depuis(jour) : null;
    for(var h2 = 7; h2 <= 18; h2++) [0,15,30,45].forEach(function(m){
      var conf = false; if(jd2){ var a1 = new Date(jd2.getFullYear(), jd2.getMonth(), jd2.getDate(), h2, m), a2 = new Date(a1.getTime()+minutes*60000);
        conf = S.evs.some(function(e){ return e.id !== ignorer && new Date(e.debut) < a2 && new Date(e.fin) > a1; }); }
      if(conf){ masq++; return; } var v = h2+":"+m; r += '<option value="'+v+'"'+(v === sel ? " selected" : "")+'>'+heureTxt(h2, m)+'</option>'; });
    return {html: r, masquees: masq}; }
  function panneau(e){
    var ed = S.ed, dur = Math.max(15, Math.round((new Date(e.fin) - new Date(e.debut))/60000)), hs = optHeures(ed.jour, ed.heure, dur, e.id);
    var ps = ed.choix ? '<div class="etq" style="margin-top:10px">ENREGISTRER POUR</div><div class="aeact" style="margin:6px 0 0"><button type="button" class="bouton" id="ep1" style="margin:0">Cette date seulement</button><button type="button" class="bouton" id="ep2" style="margin:0">Cette date et toutes les suivantes</button></div>' : ed.confirm ? '<div style="margin:8px 0"><div style="font-size:13px;margin-bottom:6px">Supprimer cet \u00e9v\u00e9nement ?</div><div class="aeact" style="margin:0"><button type="button" class="bouton" id="edn" style="margin:0">Non</button><button type="button" class="bouton" id="edo" style="margin:0;background:#a32d2d;color:#fff">Oui</button></div></div>'
      : '<div class="aeact" style="margin:8px 0 0"><button type="button" class="bouton" id="eds" style="margin:0">Enregistrer</button><button type="button" class="bouton" id="edx" style="margin:0;background:transparent;color:var(--tx);border:1.5px solid var(--tx)">Supprimer</button><button type="button" class="bouton" id="edf" style="margin:0;background:transparent;color:var(--tx);border:1.5px solid var(--tx)">Fermer</button></div>';
    return '<div style="border:1.5px solid var(--tx);padding:10px;margin:4px 0 10px"><div style="display:flex;gap:8px"><div style="flex:1"><span class="lbl">Date</span><select class="bx" id="edd">'+optJours(ed.jour)+'</select></div><div style="flex:1"><span class="lbl">Heure</span><select class="bx" id="edh">'+hs.html+'</select></div></div>'+ps+(ed.msg ? '<div class="bandeau">'+esc(ed.msg)+'</div>' : '')+'</div>';
  }
  function rendre(){
    var z = S.zone; if(!z) return;
    var fin = new Date(S.lundi); fin.setDate(fin.getDate()+6), aujIso = isoJour(auj), h = "";
    if(opts.agenda !== false){
      var ag = (DH_CACHE.agendas || []).map(function(a){ var v = a.principal ? "primary" : a.id; return '<option value="'+esc(v)+'"'+(v === S.agenda ? " selected" : "")+'>'+esc(a.principal ? "Mon agenda" : a.nom)+'</option>'; }).join("") || '<option value="primary">Mon agenda</option>';
      h += '<span class="lbl">Agenda</span><select class="bx" id="dhag">'+ag+'</select>';
    }
    h += '<span class="lbl">Calendrier · semaine du '+S.lundi.getDate()+" "+MOIS_LONGS[S.lundi.getMonth()]+'</span><div class="moisbar" style="margin-top:0"><button type="button" id="dhp" aria-label="Semaine précédente">←</button><b>'+S.lundi.getDate()+" "+MOIS_LONGS[S.lundi.getMonth()].toUpperCase()+" — "+fin.getDate()+" "+MOIS_LONGS[fin.getMonth()].toUpperCase()+'</b><button type="button" id="dhn" aria-label="Semaine suivante">→</button></div>';
    var g = '<div class="gs"><div class="d"></div>';
    for(var k = 0; k < 7; k++){ var dj = new Date(S.lundi); dj.setDate(dj.getDate()+k); var ij = isoJour(dj), passe = ij < aujIso;
      var avec = S.evs.some(function(e){ return isoJour(new Date(e.debut)) === ij; });
      g += '<div class="d'+(ij === S.jour ? " on" : "")+(passe ? " past" : "")+(ij === aujIso ? " auj" : "")+(conge(ij) ? " "+conge(ij) : "")+'"'+(passe ? "" : ' data-j="'+ij+'"')+'>'+JOURS_C[k]+" "+dj.getDate()+(avec ? " •" : "")+'</div>'; }
    for(var hh = 7; hh <= 18; hh++){
      g += '<div class="h">'+hh+' h</div>';
      for(k = 0; k < 7; k++){ dj = new Date(S.lundi); dj.setDate(dj.getDate()+k); ij = isoJour(dj); var pj = ij < aujIso;
        var occ = S.evs.some(function(e){ var d0 = new Date(e.debut); return isoJour(d0) === ij && d0.getHours() <= hh && new Date(e.fin) > new Date(dj.getFullYear(), dj.getMonth(), dj.getDate(), hh, 0); });
        var choisi = ij === S.jour && S.heure && +S.heure.split(":")[0] === hh;
        g += '<div class="'+(choisi ? "n" : occ ? "e" : conge(ij) ? "cl"+conge(ij) : "")+(pj ? " past" : "")+'"'+(pj ? "" : ' data-j="'+ij+'" data-h="'+hh+'"')+'></div>'; }
    }
    h += g + '</div>';
    if(S.jour){
      var d0j = depuis(S.jour), duJour = S.evs.filter(function(e){ return isoJour(new Date(e.debut)) === S.jour && e.id !== opts.exclure; });
      h += '<span class="lbl">'+jourTxt(d0j)+(conge(S.jour) ? " \u00b7 labo ferm\u00e9" : "")+'</span>' + (duJour.length ? duJour.map(function(e){ var d0 = new Date(e.debut), mod = e.ldld && opts.modifier !== false;
        return '<div class="ligne"><span>'+heureTxt(d0.getHours(), d0.getMinutes())+'</span><span style="flex:1;margin-left:12px">'+esc(e.titre)+'</span>'+(mod ? '<span class="crayon" data-ed="'+esc(e.id)+'" style="cursor:pointer;padding:0 6px" aria-label="Modifier">\u270e</span>' : '')+'</div>'+(S.ed && S.ed.id === e.id ? panneau(e) : ''); }).join("") : '<div class="bandeau">\u25aa AUCUN \u00c9V\u00c9NEMENT CE JOUR</div>');
    }
    var jours = optJours(S.jour), jd = S.jour ? depuis(S.jour) : null;
    var hl = optHeures(S.jour, S.heure, 30, opts.exclure);
    if(S.heure && hl.html.indexOf('value="'+S.heure+'"') < 0) S.heure = "";
    var heures = hl.html;
    var cD = "bx"+(S.jour ? "" : " rose")+(S.err && !S.jour ? " err" : ""), cH = "bx"+(S.heure ? "" : " rose")+(S.err && !S.heure ? " err" : "");
    h += '<div style="display:flex;gap:8px"><div style="flex:1"><span class="lbl">Date · obligatoire</span><select class="'+cD+'" id="dhd"><option value="">Choisir une date</option>'+jours+'</select></div>' +
      '<div style="flex:1"><span class="lbl">Heure · obligatoire</span><select class="'+cH+'" id="dhh"><option value="">Choisir</option>'+heures+'</select>'+(hl.masquees ? '<div style="font-size:11px;margin-top:4px;color:var(--tx2)">'+hl.masquees+" heure"+(hl.masquees > 1 ? "s" : "")+" masqu\u00e9e"+(hl.masquees > 1 ? "s" : "")+'</div>' : "")+'</div></div>';
    z.innerHTML = h;
    var ag2 = document.getElementById("dhag"); if(ag2) ag2.onchange = function(){ S.agenda = this.value; charger(); };
    document.getElementById("dhp").onclick = function(){ S.lundi.setDate(S.lundi.getDate()-7); charger(); };
    document.getElementById("dhn").onclick = function(){ S.lundi.setDate(S.lundi.getDate()+7); charger(); };
    document.getElementById("dhd").onchange = function(){ S.jour = this.value; S.confirme = false; S.err = false; if(S.jour){ var l = lundiDe(depuis(S.jour)); if(isoJour(l) !== isoJour(S.lundi)){ S.lundi = l; changer(); charger(); return; } } changer(); };
    document.getElementById("dhh").onchange = function(){ S.heure = this.value; S.err = false; changer(); };
    Array.prototype.forEach.call(z.querySelectorAll("[data-ed]"), function(c){ c.onclick = function(){ var id = c.getAttribute("data-ed"), e = S.evs.filter(function(x){ return x.id === id; })[0]; if(!e) return;
      if(S.ed && S.ed.id === id){ S.ed = null; } else { var d0 = new Date(e.debut); S.ed = {id: id, jour: isoJour(d0), heure: d0.getHours()+":"+d0.getMinutes(), confirm: false, msg: ""}; } rendre(); }; });
    if(S.ed){
      var e0 = S.evs.filter(function(x){ return x.id === S.ed.id; })[0], g1 = function(i){ return document.getElementById(i); };
      if(!e0){ S.ed = null; }
      else {
        if(g1("edd")) g1("edd").onchange = function(){ S.ed.jour = this.value; S.ed.msg = ""; rendre(); };
        if(g1("edh")) g1("edh").onchange = function(){ S.ed.heure = this.value; S.ed.msg = ""; };
        if(g1("edf")) g1("edf").onclick = function(){ S.ed = null; rendre(); };
        if(g1("edx")) g1("edx").onclick = function(){ S.ed.confirm = true; rendre(); };
        if(g1("edn")) g1("edn").onclick = function(){ S.ed.confirm = false; rendre(); };
        if(g1("edo")) g1("edo").onclick = function(){ S.ed.msg = "\u25aa SUPPRESSION\u2026"; rendre(); appelService({action:"agenda_supprimer", session:sessionGardee(), agenda:S.agenda, id:e0.id, serie:false}).then(function(r){
          if(r && r.ok){ S.ed = null; charger(); if(surChangement) surChangement(); } else { S.ed.confirm = false; S.ed.msg = "\u25aa "+String((r && r.erreur) || "\u00c9CHEC").toUpperCase(); rendre(); } }).catch(function(){ S.ed.confirm = false; S.ed.msg = "\u25aa \u00c9CHEC \u00b7 R\u00c9SEAU"; rendre(); }); };
        if(g1("ep1")) g1("ep1").onclick = function(){ S.ed.choix = false; sauver("un"); };
        if(g1("ep2")) g1("ep2").onclick = function(){ S.ed.choix = false; sauver("suivants"); };
        if(g1("eds")) g1("eds").onclick = function(){ var hv = g1("edh").value; if(!hv){ S.ed.msg = "\u25aa CHOISISSEZ UNE HEURE"; rendre(); return; } if(e0.serie){ S.ed.choix = true; rendre(); return; } sauver("un"); };
        function sauver(portee){ var hv = g1("edh").value, ph2 = hv.split(":"), dur = Math.max(15, Math.round((new Date(e0.fin) - new Date(e0.debut))/60000));
          S.ed.msg = "\u25aa ENREGISTREMENT\u2026"; rendre();
          appelService({action:"agenda_modifier", session:sessionGardee(), agenda:S.agenda, id:e0.id, portee:portee, titre:e0.titre, texte:e0.texte || "", a:e0.a || "", debut:S.ed.jour+"T"+pad2(ph2[0])+":"+pad2(ph2[1]), minutes:dur}).then(function(r){
            if(r && r.ok){ S.jour = S.ed.jour; S.lundi = lundiDe(depuis(S.jour)); S.ed = null; charger(); if(surChangement) surChangement(); } else { S.ed.msg = "\u25aa "+String((r && r.erreur) || "\u00c9CHEC").toUpperCase(); rendre(); } }).catch(function(){ S.ed.msg = "\u25aa \u00c9CHEC \u00b7 R\u00c9SEAU"; rendre(); }); };
      }
    }
    Array.prototype.forEach.call(z.querySelectorAll(".gs [data-j]"), function(c){ c.onclick = function(){
      S.jour = c.getAttribute("data-j"); S.confirme = false; S.err = false; var hv = c.getAttribute("data-h"); if(hv) S.heure = hv+":0"; changer(); }; });
  }
  function changer(){ rendre(); if(surChangement) surChangement(); }
  return {
    monter: function(zone){ S.zone = zone; rendre(); if(!DH_CACHE.agendas || !DH_CACHE.conges) chargerCaches(function(){ rendre(); }); charger(); },
    lire: function(){ return S.jour && S.heure ? {date: S.jour, heure: pad2(S.heure.split(":")[0])+":"+pad2(S.heure.split(":")[1]), agenda: S.agenda, conge: !!conge(S.jour)} : null; },
    valider: function(){ if(S.jour && S.heure) return true; S.err = true; rendre(); return false; },
    confirme: function(v){ if(v === undefined) return S.confirme; S.confirme = v; }
  };
}
function chargerCaches(fin){
  var reste = 2; function un(){ if(--reste === 0 && fin) fin(); }
  if(DH_CACHE.agendas) un(); else appelService({action:"agenda_liste", session:sessionGardee()}).then(function(r){ DH_CACHE.agendas = (r && r.ok && r.agendas) ? r.agendas.filter(function(a){ return a.ecriture; }) : []; un(); }).catch(function(){ DH_CACHE.agendas = []; un(); });
  if(DH_CACHE.conges) un(); else obtenir("calendrier", {action:"calendrier"}, function(r){ var c = {}; (r.jours || []).forEach(function(x){ if(x.t === "f") c[x.d] = "f"; else if(x.t === "c" && !c[x.d]) c[x.d] = "c"; }); DH_CACHE.conges = c; un(); }, function(){ DH_CACHE.conges = {}; un(); }, true);
}
// Nouveau message: onglets Message et Réunion, mêmes participants.
function nouveau(onglet){
  onglet = onglet === "reunion" ? "reunion" : "message";
  app.innerHTML = '<div class="page" style="padding-bottom:90px"><a class="retour" href="#" id="retour">← Retour</a><h1>Nouveau message</h1>' +
    '<div class="aeact" style="margin:0 0 6px"><button type="button" class="bouton" id="ongM" style="margin:0;flex:1;'+(onglet === "message" ? "" : "background:transparent;color:var(--tx);border:1.5px solid var(--tx)")+'">Message</button><button type="button" class="bouton" id="ongR" style="margin:0;flex:1;'+(onglet === "reunion" ? "" : "background:transparent;color:var(--tx);border:1.5px solid var(--tx)")+'">Réunion</button></div>' +
    '<div id="npart"><div class="bandeau">▪ CHARGEMENT…</div></div><div id="nreste"></div><div class="bandeau" id="ne" style="display:none"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); retirerBoutonBas(); responsable(); };
  var dire = function(t){ var e = document.getElementById("ne"); if(e){ e.style.display = "block"; e.textContent = t; } };
  var part = null, dh = dateHeure({}, function(){ majBouton(); }), brouillon = {titre: "", texte: "", sujet: "", repeter: "aucune"};
  function lireChamps(){ var t = document.getElementById("ntit"), x = document.getElementById("ntxt"), s = document.getElementById("nsuj"), r = document.getElementById("nrep");
    if(t) brouillon.titre = t.value; if(x) brouillon.texte = x.value; if(s) brouillon.sujet = s.value; if(r) brouillon.repeter = r.value; }
  function valide(){ lireChamps(); if(!part || !part.courriels().length) return false;
    return onglet === "message" ? !!(brouillon.titre.trim() && brouillon.texte.trim()) : !!(brouillon.sujet.trim() && dh.lire()); }
  function majBouton(){ var ok = valide(); boutonBas(onglet === "message" ? "Envoyer →" : "Planifier →", ok, envoyer);
    [["ntit", brouillon.titre], ["ntxt", brouillon.texte], ["nsuj", brouillon.sujet]].forEach(function(c){ var el = document.getElementById(c[0]); if(el) el.className = "bx"+(c[1].trim() ? "" : " rose"); }); }
  function dessinerReste(){
    var h;
    if(onglet === "message") h = '<span class="lbl">Titre · obligatoire</span><input class="bx rose" id="ntit" maxlength="120" value="'+esc(brouillon.titre)+'"><span class="lbl">Message · obligatoire</span><textarea class="bx rose" id="ntxt" rows="5" maxlength="4000">'+esc(brouillon.texte)+'</textarea>';
    else h = '<div id="ndh"></div><span class="lbl">Répéter</span><select class="bx" id="nrep"><option value="aucune">Une seule fois</option><option value="jour">Chaque jour ouvrable</option><option value="semaine">Chaque semaine</option><option value="deux">Aux deux semaines</option><option value="mois">Chaque mois</option></select>' +
      '<span class="lbl">Sujet · obligatoire</span><input class="bx rose" id="nsuj" maxlength="120" value="'+esc(brouillon.sujet)+'">' +
      '<a class="doc" href="#" id="nmes" style="margin-top:14px"><span>▪ Mes événements</span><em>→</em></a>';
    document.getElementById("nreste").innerHTML = h;
    ["ntit", "ntxt", "nsuj"].forEach(function(id){ var el = document.getElementById(id); if(el) el.oninput = majBouton; });
    var r = document.getElementById("nrep"); if(r){ r.value = brouillon.repeter; r.onchange = majBouton; }
    var m = document.getElementById("nmes"); if(m) m.onclick = function(e){ e.preventDefault(); retirerBoutonBas(); mesEvenements(); };
    if(onglet === "reunion") dh.monter(document.getElementById("ndh"));
    majBouton();
  }
  function envoyer(){
    if(!valide()) return;
    var bt = document.getElementById("btnbas"); bt.disabled = true; dire("▪ ENVOI…");
    if(onglet === "message"){
      appelService({action:"envoyer", session:sessionGardee(), titre:brouillon.titre.trim(), texte:brouillon.texte.trim(), destinataires:part.courriels()}).then(function(r){
        if(r && r.ok){ dire("▪ ENVOYÉ À "+r.nb+" PERSONNE"+(r.nb > 1 ? "S" : "")); setTimeout(function(){ retirerBoutonBas(); messages(); }, 1200); }
        else { bt.disabled = false; dire("▪ NON ENVOYÉ · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase()); }
      }).catch(function(){ bt.disabled = false; dire("▪ NON ENVOYÉ · RÉSEAU"); });
    } else {
      var q = dh.lire();
      if(q.conge && !dh.confirme()){ dh.confirme(true); bt.disabled = false; dire("▪ LE LABO EST FERMÉ CE JOUR · TOUCHEZ PLANIFIER POUR CONFIRMER"); return; }
      appelService({action:"agenda_creer", session:sessionGardee(), agenda:q.agenda, titre:brouillon.sujet.trim(), texte:"", a:part.noms().join(", ").slice(0, 190),
        debut:q.date+"T"+q.heure, minutes:30, repeter:brouillon.repeter}).then(function(r){
        if(r && r.ok){ dire("▪ RÉUNION PLANIFIÉE"); setTimeout(function(){ bt.disabled = false; }, 800); }
        else { bt.disabled = false; dire("▪ NON PLANIFIÉE · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase()); }
      }).catch(function(){ bt.disabled = false; dire("▪ NON PLANIFIÉE · RÉSEAU"); });
    }
  }
  function aller(o){ lireChamps(); onglet = o; nouveau.derniere = o; nouveau(o); }
  document.getElementById("ongM").onclick = function(){ if(onglet !== "message") nouveau("message"); };
  document.getElementById("ongR").onclick = function(){ if(onglet !== "reunion") nouveau("reunion"); };
  appelService({action:"equipe_groupes", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0;
    part = participants(r.personnes, r.groupes || [], majBouton);
    part.monter(document.getElementById("npart")); dessinerReste();
  }).catch(function(){ document.getElementById("npart").innerHTML = '<div class="bandeau">▪ LISTE INDISPONIBLE · RÉESSAYEZ</div>'; });
}
// Modifier une réunion créée dans l'application: même formulaire que « Nouveau message · Réunion », déjà rempli.
function modifierReunion(e){
  app.innerHTML = '<div class="page" style="padding-bottom:90px"><a class="retour" href="#" id="retour">← Retour</a><h1>Modifier la réunion</h1><div id="npart"><div class="bandeau">▪ CHARGEMENT…</div></div><div id="nreste"></div><div class="bandeau" id="ne" style="display:none"></div></div>';
  var retour = function(){ retirerBoutonBas(); mesEvenements(); };
  document.getElementById("retour").onclick = function(ev){ ev.preventDefault(); retour(); };
  var dire = function(t){ var x = document.getElementById("ne"); if(x){ x.style.display = "block"; x.textContent = t; } };
  var d0 = new Date(e.debut), dur = Math.max(15, Math.round((new Date(e.fin) - d0)/60000)), part = null, sujet = e.titre;
  var dh = dateHeure({agenda: false, modifier: false, exclure: e.id, init: {jour: isoJour(d0), heure: d0.getHours()+":"+d0.getMinutes()}}, function(){ maj(); });
  function lire(){ var s2 = document.getElementById("nsuj"); if(s2) sujet = s2.value; }
  function maj(){ lire(); boutonBas("Enregistrer →", !!(part && part.courriels().length && sujet.trim() && dh.lire()), enregistrer);
    var s2 = document.getElementById("nsuj"); if(s2) s2.className = "bx"+(sujet.trim() ? "" : " rose"); }
  function enregistrer(){
    lire(); var q = dh.lire(); if(!q || !sujet.trim() || !part.courriels().length) return;
    if(e.serie){ var z2 = document.getElementById("nport"); if(!z2){ z2 = document.createElement("div"); z2.id = "nport"; document.getElementById("nreste").appendChild(z2); }
      z2.innerHTML = '<div class="etq" style="margin-top:14px">ENREGISTRER POUR</div><div class="aeact"><button type="button" class="bouton" id="p1">Cette date seulement</button><button type="button" class="bouton" id="p2">Cette date et toutes les suivantes</button></div>';
      document.getElementById("p1").onclick = function(){ z2.remove(); envoyerMod("un"); }; document.getElementById("p2").onclick = function(){ z2.remove(); envoyerMod("suivants"); }; return; }
    envoyerMod("un");
  }
  function envoyerMod(portee){
    var q = dh.lire(); var bt = document.getElementById("btnbas"); bt.disabled = true; dire("▪ ENREGISTREMENT…");
    appelService({action:"agenda_modifier", session:sessionGardee(), id:e.id, portee:portee, titre:sujet.trim(), texte:e.texte || "", a:part.noms().join(", ").slice(0, 190), debut:q.date+"T"+q.heure, minutes:dur}).then(function(r){
      if(r && r.ok){ dire("▪ RÉUNION MODIFIÉE"); setTimeout(retour, 1000); } else { bt.disabled = false; dire("▪ NON MODIFIÉE · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase()); }
    }).catch(function(){ bt.disabled = false; dire("▪ NON MODIFIÉE · RÉSEAU"); });
  }
  function supprimer(){ confirmerOuiNon("Supprimer cette réunion ?", function(){
    dire("▪ SUPPRESSION…"); appelService({action:"agenda_supprimer", session:sessionGardee(), id:e.id, serie:false}).then(function(r){
      if(r && r.ok) retour(); else dire("▪ NON SUPPRIMÉE · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase()); }).catch(function(){ dire("▪ NON SUPPRIMÉE · RÉSEAU"); }); }, true); }
  appelService({action:"equipe_groupes", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0;
    var noms = String(e.a || "").split(", "), init = {grp: [], emp: []};
    (r.groupes || []).forEach(function(g){ if(noms.indexOf(g.nom) >= 0) init.grp.push(g.nom); });
    r.personnes.forEach(function(p){ if(noms.indexOf(nomTitre(p.nom)) >= 0) init.emp.push(p.c); });
    part = participants(r.personnes, r.groupes || [], maj, init);
    part.monter(document.getElementById("npart"));
    document.getElementById("nreste").innerHTML = '<div id="ndh"></div><span class="lbl">Sujet · obligatoire</span><input class="bx" id="nsuj" maxlength="120" value="'+esc(sujet)+'">' +
      '<a class="doc" href="#" id="nsup" style="margin-top:14px"><span>▪ Supprimer cette réunion</span><em>→</em></a>';
    document.getElementById("nsuj").oninput = maj; document.getElementById("nsup").onclick = function(ev){ ev.preventDefault(); supprimer(); };
    dh.monter(document.getElementById("ndh")); maj();
  }).catch(function(){ document.getElementById("npart").innerHTML = '<div class="bandeau">▪ LISTE INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function mesEvenements(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Retour</a><h1>Mes événements</h1><div id="me"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); nouveau("reunion"); };
  var liste = [], choisi = null, msg = "", mode = "";
  function dessiner(){
    var el = document.getElementById("me"); if(!el) return;
    var h = liste.length ? liste.map(function(e, i){ var d0 = new Date(e.debut);
      return '<a href="#" class="ligne" data-i="'+i+'" style="color:inherit;text-decoration:none'+(choisi === i ? ';background:var(--tx);color:var(--noir)' : '')+'"><span>'+esc(e.titre)+'</span><span>'+d0.getDate()+" "+MOIS_LONGS[d0.getMonth()].slice(0,4)+". · "+heureTxt(d0.getHours(), d0.getMinutes())+(e.serie ? " · série" : "")+'</span></a>'; }).join("") : '<div class="bandeau">▪ AUCUN ÉVÉNEMENT À VENIR</div>';
    if(choisi !== null && !mode) h += '<div class="aeact"><button type="button" class="bouton" id="mm">Modifier</button><button type="button" class="bouton" id="ms">Supprimer</button></div>';
    if(choisi !== null && mode){ h += '<div class="etq" style="margin-top:12px">SUPPRIMER</div><div class="aeact"><button type="button" class="bouton" id="m1">Cet événement</button>'+(liste[choisi].serie ? '<button type="button" class="bouton" id="m2">Toute la série</button>' : '')+'</div>'; }
    if(msg) h += '<div class="bandeau">'+esc(msg)+'</div>';
    el.innerHTML = h;
    Array.prototype.forEach.call(el.querySelectorAll("[data-i]"), function(a){ a.onclick = function(e){ e.preventDefault(); choisi = +a.getAttribute("data-i"); mode = ""; msg = ""; dessiner(); }; });
    var bm = document.getElementById("mm"); if(bm) bm.onclick = function(){ modifierReunion(liste[choisi]); };
    var bs = document.getElementById("ms"); if(bs) bs.onclick = function(){ mode = "sup"; dessiner(); };
    function sup(serie){ var e = liste[choisi]; msg = "▪ SUPPRESSION…"; dessiner();
      appelService({action:"agenda_supprimer", session:sessionGardee(), id:e.id, serie:serie}).then(function(r){ if(r && r.ok){ choisi = null; mode = ""; msg = ""; charger(); } else { msg = "▪ "+String((r && r.erreur) || "ÉCHEC").toUpperCase(); dessiner(); } }).catch(function(){ msg = "▪ ÉCHEC · RÉSEAU"; dessiner(); }); }
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
  var dh = null;
  var ETATS = ["Tout va bien", "À surveiller", "Intervention requise"];
  function pc(x){ return x == null ? "—" : Math.round(x*100)+" %"; }
  function tuile(v, lib, cible, max){
    var ok = v != null && (max ? v <= cible : v >= cible), w = v == null ? 0 : Math.min(100, Math.round(v*100));
    return '<div style="margin:10px 0 0"><div class="ligne" style="border:0;padding:0"><span>'+lib+'</span><span>'+pc(v)+'</span></div>' +
      '<div style="position:relative;height:10px;background:#E9E4DA;margin-top:4px"><i style="display:block;height:100%;width:'+w+'%;background:#111"></i><u style="position:absolute;top:-3px;bottom:-3px;left:'+Math.round(cible*100)+'%;width:2px;background:#2fd04a"></u></div>' +
      (v == null ? "" : '<span style="display:inline-block;margin-top:6px;padding:4px 8px;font-size:12px;font-weight:600;'+(ok ? "background:#8EFF60;color:#1D1D1B" : "border:1.5px solid #111")+'">'+(ok ? "Dans la cible" : "Sous la cible")+'</span>')+'</div>'; }
  function dateCourte(d){ var p = String(d).split("-"); return +p[2]+" "+MOIS_LONGS[+p[1]-1].slice(0,4)+"."; }
  function bouton(txt, on, rose, id){ return '<button type="button" id="'+id+'" class="bouton" style="margin:0;flex:1;font-size:11px;padding:12px 2px;'+(on ? "" : "background:"+(rose ? "#f4b3c4" : "transparent")+";color:#111;")+'border:1.5px solid var(--tx)">'+txt+'</button>'; }
  function dessiner(){
    var el = document.getElementById("sc"); if(!el) return;
    var p = liste[i], d = p.dernier;
    var h = '<div class="etq">'+(i+1)+' SUR '+liste.length+'</div><div style="font-size:22px;margin:2px 0 10px">'+esc(p.nom)+'</div>' +
      '<div class="etq" style="margin-top:4px">RÉALISÉ VS CIBLE</div>'+tuile(p.effectuee, "Effectuée · cible 80 %", 0.8, false)+tuile(p.nonTerminee, "Non terminée · max 5 %", 0.05, true)+tuile(p.objectifs, "Objectifs · cible 80 %", 0.8, false) +
      '<div style="border-left:4px solid var(--tx);padding:8px 10px;margin:10px 0;font-size:13px;line-height:1.5"><b class="etq" style="font-weight:500;text-transform:uppercase">Suivi de la réunion précédente</b>'+(d ? '<div style="margin-bottom:4px">'+dateCourte(d.date)+' · État choisi : <span style="font-weight:600">'+esc(d.etat)+'</span></div>' : "")+(d && d.note ? esc(d.note) : '<span style="opacity:.7">'+(d ? "Aucune note." : "Aucun suivi précédent.")+'</span>')+'</div>' +
      '<div class="etq" style="margin-top:12px">ÉTAT · OBLIGATOIRE</div><div style="display:flex;gap:6px;margin-top:4px">'+ETATS.map(function(x, k){ return bouton(x, etat === x, !etat, "se"+k); }).join("")+'</div>' +
      '<div class="etq" style="margin-top:14px">OPTIONNEL</div>' +
      (noteOn ? '<div style="display:flex;gap:6px;margin-top:4px;align-items:flex-start"><textarea class="champ" id="snt" rows="4" maxlength="2000" placeholder="Note du suivi…" style="flex:1;margin:0">'+esc(sauvNote)+'</textarea><button type="button" id="snx" class="bouton" aria-label="Fermer la note" style="margin:0;width:40px;flex:none;padding:10px 0;font-size:16px">✕</button></div>'
        : '<div style="display:flex;gap:6px;margin-top:4px">'+bouton("Inscrire une note", false, false, "sn")+bouton("Planifier une rencontre", planOn, false, "sp")+'</div>') +
      (planOn ? '<div id="scp"><div id="scdh"></div><span class="lbl">Sujet</span><div class="bx">Suivi de charge · '+esc(p.nom)+'</div></div>' : "") +
      (msg ? '<div class="bandeau" style="margin-top:10px">'+esc(msg)+'</div>' : "");
    el.innerHTML = h;
    ETATS.forEach(function(x, k){ document.getElementById("se"+k).onclick = function(){ lireNote(); etat = x; msg = ""; dessiner(); }; });
    var bn = document.getElementById("sn"); if(bn) bn.onclick = function(){ noteOn = true; dessiner(); document.getElementById("snt").focus(); };
    var bx = document.getElementById("snx"); if(bx) bx.onclick = function(){ lireNote(); noteOn = false; dessiner(); };
    var bp = document.getElementById("sp"); if(bp) bp.onclick = function(){ planOn = !planOn; dh = planOn ? dateHeure({}) : null; dessiner(); };
    if(planOn) dh.monter(document.getElementById("scdh"));
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
  function suivant(){
    nettoyer();
    if(i >= liste.length-1){ responsable(); return; }
    i++; etat = ""; noteOn = false; planOn = false; dh = null; sauvNote = ""; msg = ""; occupe = false; window.scrollTo(0, 0); dessiner();
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
      var q = dh.lire();
      if(!q){ dh.valider(); occupe = false; msg = "▪ CHOISISSEZ LA DATE ET L'HEURE"; dessiner(); return; }
      if(q.conge && !dh.confirme()){ dh.confirme(true); occupe = false; msg = "▪ LE LABO EST FERMÉ CE JOUR · TOUCHEZ ENREGISTRER POUR CONFIRMER"; dessiner(); return; }
      appelService({action:"agenda_creer", session:sessionGardee(), agenda:q.agenda, titre:"Suivi de charge · "+p.nom, texte:"", a:p.brut,
        debut:q.date+"T"+q.heure, minutes:30, repeter:"aucune"}).then(function(r){
        if(r && r.ok) sauver(); else { occupe = false; msg = "▪ RENCONTRE NON PLANIFIÉE · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase(); dessiner(); }
      }).catch(function(){ occupe = false; msg = "▪ RENCONTRE NON PLANIFIÉE · RÉSEAU"; dessiner(); });
    } else sauver();
  }
  chargerCaches();
  appelService({action:"charge_equipe", session:sessionGardee()}).then(function(r){
    var el = document.getElementById("sc"); if(!el) return;
    if(!r || !r.ok) throw 0;
    liste = r.employes; if(!liste.length){ el.innerHTML = '<div class="bandeau">▪ AUCUN EMPLOYÉ À SUIVRE</div>'; return; }
    dessiner();
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
