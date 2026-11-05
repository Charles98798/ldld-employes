// Étape 1 : démarrage, connexion et menu. Aucune donnée réelle : la connexion et les sections sont des gabarits.
var SECTIONS = ["Messages", "Manuel d'employé", "Évaluations", "Salaire et documents", "Tableau de bord", "Mon profil"];
var app = document.getElementById("app");

function demarrage(){
  app.innerHTML = '<div class="demarrage"><img src="assets/LDLD_logo_complet_blanc_transparent.png" alt="Lafond Desjardins laboratoire dentaire"></div>';
  setTimeout(connexion, 1500);
}
// Service LDLD (Google Apps Script) : il vérifie le jeton Google et ne répond qu'avec les données de l'employé connecté.
var URL_SERVICE = "https://script.google.com/macros/s/AKfycbwq9SXysg5GHL6GsPFBSTmoKZzm9_wGr4E3W0e-RzXcHeknz5_DMBFIxBarHHczgpwnZw/exec";
var MOI = null;   // {nom, poste, responsable} après connexion
function appelService(action, jeton){
  return fetch(URL_SERVICE, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body: JSON.stringify({action:action, jeton:jeton})})
    .then(function(r){ return r.json(); });
}
function connexion(){
  var natif = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.GoogleAuth;
  app.innerHTML = '<div class="connexion"><img class="logo" src="assets/LDLD_logo_complet_noir_transparent.png" alt="Lafond Desjardins">' +
    '<button class="bouton" id="google" style="margin-top:140px">Se connecter avec Google →</button>' +
    '<p class="aide" id="msg">'+(natif ? "Utilisez votre compte lafonddesjardins.com." : "Mode essai (navigateur) : la connexion Google réelle fonctionne dans l'application installée.")+'</p></div>';
  document.getElementById("google").onclick = function(){
    var msg = document.getElementById("msg");
    if(!natif){ MOI = {nom:"Marie Exemple", poste:"Technologue", responsable:"Élise Desjardins"}; return menu(); }
    msg.textContent = "Connexion en cours…";
    natif.signIn().then(function(u){ return appelService("moi", u.authentication.idToken); })
      .then(function(r){ if(r && r.ok){ MOI = r; menu(); } else { msg.textContent = "Accès refusé. Votre compte n'est pas autorisé."; } })
      .catch(function(){ msg.textContent = "Connexion impossible. Réessayez."; });
  };
}
function menu(){
  app.innerHTML = '<div class="menu"><div class="nom">'+esc((MOI && MOI.nom) || "")+'</div>' +
    SECTIONS.map(function(n, i){ return '<a href="#" data-i="'+i+'">▪ '+n+'</a>'; }).join("") +
    '<img class="symbole" src="assets/LDLD_symbole_blanc_transparent.png" alt="">' +
    '<a class="sortie" href="#" id="sortie">Déconnexion →</a></div>';
  Array.prototype.forEach.call(app.querySelectorAll("a[data-i]"), function(a){
    a.onclick = function(e){ e.preventDefault(); section(+a.getAttribute("data-i")); };
  });
  document.getElementById("sortie").onclick = function(e){ e.preventDefault(); connexion(); };
}
// Étape 2 : messages. Données de démonstration; plus tard les messages viendront du service Google Apps Script, filtrés par compte.
var DIRECTION = true;   // démonstration : la page de rédaction n'apparaît que pour les comptes de la direction
var MESSAGES = [
  {id:1, titre:"Horaire des fêtes", date:"5 NOV. 2026", texte:"Bonjour à tous,\n\nLe laboratoire sera fermé du 24 décembre au 3 janvier. Les urgences seront assurées par l'équipe de garde.\n\nMerci pour votre excellent travail cette année."},
  {id:2, titre:"Rappel évaluations 2027", date:"2 NOV. 2026", texte:"Pensez à remplir votre autoévaluation avant votre rencontre."},
  {id:3, titre:"Bienvenue dans l'application", date:"1 NOV. 2026", texte:"Cette application regroupe vos documents et les messages de la direction."}
];
function lus(){ try { return JSON.parse(localStorage.getItem("ldld-lus") || "[]"); } catch(e){ return []; } }
function noterLu(id){ var l = lus(); if(l.indexOf(id) < 0){ l.push(id); try { localStorage.setItem("ldld-lus", JSON.stringify(l)); } catch(e){} } }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function messages(){
  var l = lus();
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1>Messages</h1>' +
    MESSAGES.map(function(m){ return '<a class="rang" href="#" data-id="'+m.id+'"><span class="pl">+</span>'+esc(m.titre)+(l.indexOf(m.id) < 0 ? '<span class="neuf">NOUVEAU</span>' : '')+'<small>Direction · '+m.date+'</small></a>'; }).join("") +
    (DIRECTION ? '<a class="rang" href="#" id="ecrire">▪ Écrire un message</a>' : '') + '</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  Array.prototype.forEach.call(app.querySelectorAll("a[data-id]"), function(a){
    a.onclick = function(e){ e.preventDefault(); detail(+a.getAttribute("data-id")); };
  });
  var w = document.getElementById("ecrire"); if(w) w.onclick = function(e){ e.preventDefault(); rediger(); };
}
function detail(id){
  var m = MESSAGES.filter(function(x){ return x.id === id; })[0]; noterLu(id);
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Messages</a><h1>'+esc(m.titre)+'</h1><div class="date">Direction · '+m.date+'</div><div class="corps">'+esc(m.texte).replace(/\n/g,"<br>")+'</div><div class="bandeau">▪ LU · confirmé</div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); messages(); };
}
function rediger(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Messages</a><h1>Nouveau message</h1>' +
    '<input class="champ" id="titre" placeholder="Titre"><textarea class="champ zone" id="texte" placeholder="Texte du message…"></textarea>' +
    '<div class="etiq">▪ DESTINATAIRES</div>' +
    '<label class="coche"><input type="radio" name="d" checked> Tous les employés</label>' +
    '<label class="coche"><input type="radio" name="d"> Par équipe ou poste</label>' +
    '<label class="coche"><input type="radio" name="d"> Choisir des employés</label>' +
    '<label class="coche"><input type="checkbox" id="notif" checked> Envoyer une notification</label>' +
    '<button class="bouton" id="envoyer">Envoyer →</button><div class="bandeau" id="etat" style="display:none"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); messages(); };
  // Mode démonstration : rien n'est envoyé. Plus tard : envoi par le service Google Apps Script, qui vérifie le droit d'écrire.
  document.getElementById("envoyer").onclick = function(){ var s = document.getElementById("etat"); s.style.display = "block"; s.textContent = "▪ MODE ESSAI · RIEN N'EST ENVOYÉ"; };
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
function manuel(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1>Manuel d\'employé</h1>' +
    '<div class="bandeau">▪ DISPONIBLE HORS LIGNE</div><div id="liste"></div>' +
    '<p class="aide">Vos documents sont personnalisés à votre nom et à votre poste. Ils se téléchargent seuls et restent lisibles sans Internet.</p></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
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
  function synchroniser(docs){
    Promise.all(docs.filter(function(d){ return etat(d) !== "ok"; }).map(function(d){ return telecharger(d).catch(function(){}); }))
      .then(function(){ dessiner(docs); });
  }
  fetch("demo/_manifeste.json").then(function(r){ return r.json(); }).then(function(m){
    try { localStorage.setItem("ldld-manifeste", JSON.stringify(m)); } catch(e){}
    dessiner(m.documents); synchroniser(m.documents); })
  .catch(function(){ var m; try { m = JSON.parse(localStorage.getItem("ldld-manifeste")); } catch(e){} if(m) dessiner(m.documents); });
}
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
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1>Évaluations</h1>' +
    '<div class="etiq">▪ PROCHAINE RENCONTRE</div><div class="gros">12 JANV. 2027</div>' +
    '<div class="bandeau">▪ AUTOÉVALUATION À REMPLIR AVANT LA RENCONTRE</div>' +
    '<a class="rang" href="autoevaluation.html">▪ Remplir mon autoévaluation <span style="float:right">→</span></a>' +
    '<div class="rang">▪ Mon résumé de rencontre <span class="etiq" style="float:right">APRÈS LA RENCONTRE</span></div>' +
    '<div class="rang">▪ Mes rencontres passées <span style="float:right">→</span></div>' +
    '<p class="aide">Les rencontres recommencent en 2027.</p></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
}
// Étape 6 : tableau de bord (Charges de travail) et profil. Chiffres d'essai; les vrais viendront d'un fichier de Gestion fourni par Michel.
var CHARGES_ESSAI = {mois:"SEPTEMBRE", annee:2026, cartes:[
  {nom:"CHARGE EFFECTUÉE", val:70, cible:70, sens:"plus", cumul:32, libelle:"Cible 70 % et +"},
  {nom:"CHARGE NON TERMINÉE", val:2, cible:5, sens:"moins", cumul:3, libelle:"Cible 5 % et −"},
  {nom:"OBJECTIFS ATTEINTS", val:71, cible:80, sens:"plus", cumul:81, libelle:"Cible 80 % et +"}],
  jours:[["MAR 01",66,64,4,108],["MER 02",54,54,0,79],["JEU 03",61,61,0,95],["VEN 04",39,39,0,39],["MAR 08",61,58,6,135],["MER 09",54,45,19,129],["JEU 10",59,50,12,101],["VEN 11",78,78,0,98],["LUN 14",80,80,0,104],["MAR 15",68,66,3,113]]};   // [jour, valeur affichée, effectuée, non terminée, hauteur totale (bande pâle = disponible)]
function dansCible(c){ return c.sens === "plus" ? c.val >= c.cible : c.val <= c.cible; }
function tableau(){
  var d = CHARGES_ESSAI;
  var cartes = d.cartes.map(function(c){ var ok = dansCible(c);
    return '<div class="carte"><div class="tete"><span>'+c.nom+'</span><span class="etat '+(ok ? "oui" : "non")+'">'+(ok ? "Dans la cible" : "Sous la cible")+'</span></div>' +
      '<div class="gros">'+c.val+' <small>%</small></div><div class="jauge"><i style="width:'+Math.min(100,c.val)+'%"></i><u style="left:'+c.cible+'%"></u></div>' +
      '<div class="cumul"><span>'+c.libelle+'</span><span>Cumul de l\'année <b>'+c.cumul+' %</b></span></div></div>'; }).join("");
  var H = 150, ECH = 160;   // échelle 0 à 160 %, comme dans Gestion
  var barres = d.jours.map(function(j){ var h = function(v){ return Math.round(v / ECH * H); };
    return '<div class="jour"><span class="v">'+j[1]+'</span><div class="b" style="height:'+h(j[4])+'px"><div class="ef" style="height:'+h(j[2])+'px"></div><div class="nt" style="height:'+h(j[3])+'px;bottom:'+h(j[2])+'px"></div></div><span class="d">'+j[0].replace(" ","<br>")+'</span></div>'; }).join("");
  var legende = '<div class="legende"><span><i style="background:#3ee96a"></i>Cible</span><span><i style="background:#b3ab9b"></i>Effectuée</span><span><i style="background:#111"></i>Non terminée</span><span><i style="background:#ece8e0;border:1px solid #bbb"></i>Disponible</span></div>';
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1 class="vert">Charges de travail</h1><div class="etiq">MARIE · ANNÉE '+d.annee+'</div>' +
    '<div class="mois"><b>‹</b><b class="m">'+d.mois+'</b><b>›</b></div>'+cartes+legende+'<div class="graph"><div class="cibleligne" style="bottom:'+(Math.round(d.cartes[0].cible/ECH*H)+36)+'px"></div>'+barres+'</div><p class="aide">Glissez pour voir tous les jours. À titre indicatif.</p></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
}
function profil(){
  var lignes = [["Nom","Marie Exemple"],["Poste","Technologue"],["Responsable","Élise Desjardins"],["Courriel","marie@lafonddesjardins.com"]];
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1>Mon profil</h1>' +
    lignes.map(function(l){ return '<div class="ligne"><span>'+l[0]+'</span><span>'+l[1]+'</span></div>'; }).join("") +
    '<div class="etiq" style="margin-top:20px">▪ NOTIFICATIONS</div>' +
    '<label class="ligne"><span>Messages de la direction</span><input type="checkbox" checked></label>' +
    '<label class="ligne"><span>Rappels d\'évaluation</span><input type="checkbox" checked></label>' +
    '<a class="doc" href="#" id="sortir" style="margin-top:20px"><span>Déconnexion</span><em>→</em></a></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  document.getElementById("sortir").onclick = function(e){ e.preventDefault(); connexion(); };
}
function section(i){
  if(i === 0) return messages();
  if(i === 4) return tableau();
  if(i === 5) return profil();
  if(i === 2) return evaluations();
  if(i === 3) return salaire();
  if(i === 1) return manuel();
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Menu</a><h1>'+SECTIONS[i]+'</h1>' +
    '<div class="bandeau">▪ ÉTAPE À VENIR</div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
}
if(location.hash === "#evaluations") evaluations(); else demarrage();
