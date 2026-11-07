// Étape 1 : démarrage, connexion et menu. Aucune donnée réelle : la connexion et les sections sont des gabarits.
var SECTIONS = ["Messages", "Manuel d'employé", "Évaluations", "Salaire et documents", "Tableau de bord", "Plan d'incendie", "Mon profil"];
var app = document.getElementById("app");

function demarrage(){
  app.innerHTML = '<div class="demarrage"><img src="assets/LDLD_logo_complet_blanc_transparent.png" alt="Lafond Desjardins laboratoire dentaire"></div>';
  setTimeout(ouvrirSession, 1500);
}
// Service LDLD (Google Apps Script) : connexion par code envoyé au courriel LDLD; il ne répond qu'avec les données de l'employé connecté.
var URL_SERVICE = "https://script.google.com/macros/s/AKfycbwq9SXysg5GHL6GsPFBSTmoKZzm9_wGr4E3W0e-RzXcHeknz5_DMBFIxBarHHczgpwnZw/exec";
var MOI = null;   // {nom, poste, responsable} après connexion
function appelService(corps){
  return fetch(URL_SERVICE, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body: JSON.stringify(corps)})
    .then(function(r){ return r.json(); });
}
function sessionGardee(){ try { return localStorage.getItem("ldld-session"); } catch(e){ return null; } }
function garderSession(s){ try { if(s) localStorage.setItem("ldld-session", s); else localStorage.removeItem("ldld-session"); } catch(e){} }
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
    '<div style="margin-top:110px"><input class="champ" id="courriel" type="email" inputmode="email" autocomplete="email" placeholder="Votre courriel">' +
    '<button class="bouton" id="envoi">Recevoir mon code →</button></div>' +
    '<p class="aide" id="msg">'+(message||"Un code à 6 chiffres sera envoyé à votre courriel.")+'</p></div>';
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
    '<div style="margin-top:110px"><input class="champ" id="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="Code à 6 chiffres" style="letter-spacing:6px;font-size:24px">' +
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
  app.innerHTML = '<div class="menu"><img class="logo" width="120" height="100" src="assets/LDLD_logo_complet_blanc_transparent.png" alt="Lafond Desjardins"><div class="nom">'+esc((MOI && MOI.nom) || "")+'</div>' +
    SECTIONS.map(function(n, i){ return '<a href="#" data-i="'+i+'">▪ '+n+'</a>'; }).join("") +
    '<img class="symbole" src="assets/LDLD_symbole_blanc_transparent.png" alt="">' +
    '<a class="sortie" href="#" id="sortie">Déconnexion →</a></div>';
  Array.prototype.forEach.call(app.querySelectorAll("a[data-i]"), function(a){
    a.onclick = function(e){ e.preventDefault(); section(+a.getAttribute("data-i")); };
  });
  document.getElementById("sortie").onclick = function(e){ e.preventDefault(); deconnecter(); };
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
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1>Messages</h1><div id="liste"><div class="bandeau">▪ CHARGEMENT…</div></div>' +
    (peutEcrire() ? '<a class="rang" href="#" id="ecrire">▪ Écrire un message</a>' : '') + '</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  var w = document.getElementById("ecrire"); if(w) w.onclick = function(e){ e.preventDefault(); rediger(); };
  appelService({action:"messages", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0;
    MESSAGES = r.messages; var l = lus();
    document.getElementById("liste").innerHTML = MESSAGES.length ? MESSAGES.map(function(m){
      return '<a class="rang" href="#" data-id="'+esc(m.id)+'"><span class="pl">+</span>'+esc(m.titre)+(!m.envoye && l.indexOf(m.id) < 0 ? '<span class="neuf">NOUVEAU</span>' : '')+
        '<small>'+(m.envoye ? 'Envoyé à '+m.nb+' personne'+(m.nb > 1 ? 's' : '') : esc(m.de))+' · '+dateCourte(m.date)+'</small></a>'; }).join("") : '<div class="bandeau">▪ AUCUN MESSAGE</div>';
    Array.prototype.forEach.call(app.querySelectorAll("a[data-id]"), function(a){
      a.onclick = function(e){ e.preventDefault(); detail(a.getAttribute("data-id")); };
    });
  }).catch(function(){ document.getElementById("liste").innerHTML = '<div class="bandeau">▪ MESSAGES INDISPONIBLES · RÉESSAYEZ</div>'; });
}
function detail(id){
  var m = MESSAGES.filter(function(x){ return x.id === id; })[0]; noterLu(id);
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Messages</a><h1>'+esc(m.titre)+'</h1><div class="date">'+esc(m.de)+' · '+dateCourte(m.date)+'</div><div class="corps">'+esc(m.texte).replace(/\n/g,"<br>")+'</div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); messages(); };
}
function rediger(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Messages</a><h1>Nouveau message</h1>' +
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
document.addEventListener("visibilitychange", function(){ if(document.visibilityState === "visible" && sessionGardee() && MOI) prechargerDocs(); });
function sectionDocs(p, titre, aide){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1>'+titre+'</h1>' +
    '<div class="bandeau">▪ DISPONIBLE HORS LIGNE</div><div id="liste"></div><p class="aide">'+aide+'</p></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  var liste = document.getElementById("liste");
  function ouvrir(d){
    (self.caches ? caches.open(CACHE).then(function(c){ return c.match(cleDoc(d)); }) : Promise.resolve(null)).then(function(r){
      if(!r) throw 0; return r.blob(); }).then(function(b){ window.open(URL.createObjectURL(b), "_blank"); }).catch(function(){});
  }
  function dessinerD(docs){
    liste.innerHTML = docs.map(function(d){ var e = etat(d);
      return '<a class="doc" href="#" data-id="'+d.id+'"><span>▪ '+esc(d.nom)+'</span><em class="'+e+'">'+(e === "ok" ? "✓" : e === "maj" ? "MISE À JOUR" : "À TÉLÉCHARGER")+'</em></a>'; }).join("");
    Array.prototype.forEach.call(liste.querySelectorAll("a.doc"), function(a){
      a.onclick = function(ev){ ev.preventDefault(); var d = docs.filter(function(x){ return x.id === a.getAttribute("data-id"); })[0];
        if(etat(d) === "ok") return ouvrir(d);
        a.querySelector("em").textContent = "TÉLÉCHARGEMENT…"; telechargerDoc(p, d).then(function(){ dessinerD(docs); ouvrir(d); }).catch(function(){ a.querySelector("em").textContent = "ÉCHEC · RÉESSAYEZ"; }); };
    });
  }
  appelService({action:p+"_liste", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0;
    try { localStorage.setItem("ldld-liste-"+p, JSON.stringify(r.documents)); } catch(e){}
    dessinerD(r.documents);
    r.documents.filter(function(d){ return etat(d) === "maj"; }).forEach(function(d){ telechargerDoc(p, d).then(function(){ dessinerD(r.documents); }).catch(function(){}); });
  }).catch(function(){ var l; try { l = JSON.parse(localStorage.getItem("ldld-liste-"+p)); } catch(e){} if(l) dessinerD(l); else liste.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function manuel(){ sectionDocs("manuel", "Manuel d'employé", "Votre manuel est à votre nom (féminin ou masculin). Il se télécharge seul et reste lisible sans Internet."); }
function incendie(){ sectionDocs("incendie", "Plan d'incendie", "Le plan à jour se télécharge seul et reste lisible sans Internet."); }
// Étape 4 : salaire. Chiffres d'essai. Règle de sécurité : l'application ne calcule rien; elle affiche seulement les valeurs déjà calculées par les portails.
var SALAIRE_ESSAI = {total:71250, position:84, detail:[["Salaire de base",58400],["Vacances, fériés et maladie",5800],["Boni",2000],["Assurances collectives",3900],["Cotisation OTPADQ",1150]]};
function dollars(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0") + "\u00a0$"; }
function salaire(){
  var s = SALAIRE_ESSAI;
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1>Salaire et documents</h1>' +
    '<div class="etiq">▪ RÉMUNÉRATION GLOBALE 2027</div><div class="gros">'+dollars(s.total)+'</div>' +
    '<div class="etiq">▪ VOTRE POSITION</div><div class="jauge"><i style="width:'+Math.round(s.position)+'%"></i></div><div class="etiq">'+Math.round(s.position)+' % · sommet de l\'échelle = 100 %</div>' +
    '<div style="margin-top:14px">'+s.detail.map(function(d){ return '<div class="ligne"><span>'+d[0]+'</span><span>'+dollars(d[1])+'</span></div>'; }).join("")+'</div>' +
    '<a class="doc" href="#" id="docs" style="margin-top:14px"><span>▪ Vos documents de salaire</span><em>→</em></a>' +
    '<p class="aide">Tous les chiffres viennent de votre dossier salarial. Ils ne se modifient pas dans l\'application.</p></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  document.getElementById("docs").onclick = function(e){ e.preventDefault(); documentsSalaire(); };
}
function documentsSalaire(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Salaire et documents</a><h1>Vos documents</h1>' +
    '<div class="bandeau">▪ DISPONIBLE HORS LIGNE</div><div id="liste"></div><p class="aide">Seuls vos propres documents apparaissent ici.</p></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); salaire(); };
  var liste = document.getElementById("liste");
  function dessiner(docs){
    liste.innerHTML = docs.map(function(d){ var e = etat(d);
      return '<a class="doc" href="#" data-id="'+d.id+'"><span>▪ '+esc(d.nom)+'</span><em class="'+e+'">'+(e === "ok" ? "✓" : e === "maj" ? "MISE À JOUR" : "À TÉLÉCHARGER")+'</em></a>'; }).join("");
    Array.prototype.forEach.call(liste.querySelectorAll("a.doc"), function(a){
      a.onclick = function(ev){ ev.preventDefault(); var d = docs.filter(function(x){ return x.id === a.getAttribute("data-id"); })[0];
        (self.caches ? caches.open(CACHE).then(function(c){ return c.match(d.fichier); }) : Promise.resolve(null)).then(function(r){
          return r ? r.blob().then(function(b){ return URL.createObjectURL(b); }) : d.fichier; }).then(function(u){ window.open(u, "_blank"); }); };
    });
  }
  fetch("demo/_salaire.json").then(function(r){ return r.json(); }).then(function(m){
    try { localStorage.setItem("ldld-manifeste-salaire", JSON.stringify(m)); } catch(e){}
    dessiner(m.documents);
    Promise.all(m.documents.filter(function(d){ return etat(d) !== "ok"; }).map(function(d){ return telecharger(d).catch(function(){}); })).then(function(){ dessiner(m.documents); }); })
  .catch(function(){ var m; try { m = JSON.parse(localStorage.getItem("ldld-manifeste-salaire")); } catch(e){} if(m) dessiner(m.documents); });
}
// Étape 5 : évaluations. L'autoévaluation reproduit la page du portail (mêmes 8 onglets, mêmes questions); en essai elle ne lit ni n'enregistre rien.
function evaluations(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1>Évaluations</h1><div id="ev"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  appelService({action:"ae_lire", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0;
    var el = document.getElementById("ev");
    if(!r.rencontres.length){ el.innerHTML = '<div class="bandeau">▪ AUCUNE AUTOÉVALUATION POUR LE MOMENT</div>'; return; }
    el.innerHTML = r.rencontres.map(function(m){
      return '<a class="rang" href="#" data-r="'+m.rencontre+'">▪ Autoévaluation · rencontre '+m.rencontre+'<small>'+(m.terminee ? 'Terminée' : 'À remplir')+'</small></a>'; }).join("");
    Array.prototype.forEach.call(el.querySelectorAll("a[data-r]"), function(a){ a.onclick = function(e){ e.preventDefault(); autoeval(+a.getAttribute("data-r")); }; });
  }).catch(function(){ document.getElementById("ev").innerHTML = '<div class="bandeau">▪ AUTOÉVALUATION INDISPONIBLE · RÉESSAYEZ</div>'; });
}
// Autoévaluation : même fiche et mêmes règles que la page envoyée par courriel (6 étapes). Les réponses vont dans la fiche de l'employé.
var AE_ETAPES = ["Évaluation des compétences","Valeurs humaines","Connaissances et développement","Rythme et charge de travail","Priorités et engagements","Commentaires de l’employé","Mon expérience au laboratoire","Pour préparer notre rencontre"];
var AE_NIVEAUX_RH = ["Pas du tout d’accord","Peu d’accord","Moyennement d’accord","Plutôt d’accord","Tout à fait d’accord"];
function aeSection(f){ var n = +f.cell.slice(1); if(f.cell === "A68" || f.cell === "A70") return 7; if(n >= 59) return 6; if(f.cell === "B44") return 5; if(f.cell === "B42" || f.cell === "B43") return 4; return n >= 35 ? 2 : n >= 28 ? 1 : 0; }
function autoeval(rencontre){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Évaluations</a><h1>Autoévaluation</h1><div id="ae"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); evaluations(); };
  appelService({action:"ae_lire", session:sessionGardee(), rencontre:rencontre}).then(function(d){
    if(!d || !d.ok) throw 0; aeAfficher(d);
  }).catch(function(){ document.getElementById("ae").innerHTML = '<div class="bandeau">▪ FICHE INDISPONIBLE · RÉESSAYEZ</div>'; });
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
      if(r && r.ok){ d.revision = r.revision; if(r.terminee){ d.terminee = true; zone.innerHTML = '<div class="bandeau">▪ MERCI POUR VOTRE AUTOÉVALUATION</div><p class="aide">Vos réponses sont enregistrées pour cette rencontre. Elles prépareront notre discussion.</p>'; } else { dire("▪ RÉPONSES ENREGISTRÉES"); if(suite) suite(); } }
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
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1 class="vert">Charges de travail</h1><div id="tb"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  appelService({action:"tableau", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0;
    var el = document.getElementById("tb");
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
  }).catch(function(){ document.getElementById("tb").innerHTML = '<div class="bandeau">▪ TABLEAU DE BORD INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function profil(){
  var m = MOI || {};
  var lignes = [["Nom", m.nom || ""], ["Poste", m.poste || ""], ["Responsable", m.responsable || ""]];
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1>Mon profil</h1>' +
    lignes.map(function(l){ return '<div class="ligne"><span>'+esc(l[0])+'</span><span>'+esc(l[1])+'</span></div>'; }).join("") +
    '<div class="etiq" style="margin-top:20px">▪ NOTIFICATIONS</div><div id="notifs"></div>' +
    '<a class="doc" href="#" id="sortir" style="margin-top:20px"><span>Déconnexion</span><em>→</em></a></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  document.getElementById("sortir").onclick = function(e){ e.preventDefault(); deconnecter(); };
  var zone = document.getElementById("notifs");
  if(!notifPossible()){ zone.innerHTML = '<p class="aide">Pour recevoir les notifications sur iPhone, ajoutez l\'application à l\'écran d\'accueil (Partager > Sur l\'écran d\'accueil).</p>'; return; }
  if(Notification.permission === "denied"){ zone.innerHTML = '<p class="aide">Les notifications sont bloquées dans les réglages de votre appareil. Autorisez-les dans les réglages pour les recevoir.</p>'; return; }
  navigator.serviceWorker.ready.then(function(reg){ return reg.pushManager.getSubscription(); }).then(function(s){
    zone.innerHTML = '<label class="ligne"><span>Messages et documents mis à jour</span><input type="checkbox" id="notifCase"'+(s && Notification.permission === "granted" ? " checked" : "")+'></label>';
    document.getElementById("notifCase").onchange = function(){ var c = this; (c.checked ? demanderNotifs() : couperNotifs()).then(function(ok){ if(c.checked && !ok) c.checked = false; }).catch(function(){}); };
  });
}
function section(i){
  if(i === 0) return messages();
  if(i === 4) return tableau();
  if(i === 5) return incendie();
  if(i === 6) return profil();
  if(i === 2) return evaluations();
  if(i === 3) return salaire();
  if(i === 1) return manuel();
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1>'+SECTIONS[i]+'</h1>' +
    '<div class="bandeau">▪ ÉTAPE À VENIR</div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
}
if(location.hash === "#evaluations") evaluations(); else demarrage();

if("serviceWorker" in navigator){ window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); }); }
