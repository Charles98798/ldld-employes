// Étape 1 : démarrage, connexion et menu. Aucune donnée réelle : la connexion et les sections sont des gabarits.
var SECTIONS = ["Messages", "Manuel d'employé", "Évaluations", "Salaire et documents", "Tableau de bord", "Mon profil"];
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
function menu(){
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
var AE_ETAPES = ["Évaluation des compétences","Valeurs humaines","Connaissances et développement","Commentaires","Mon expérience au laboratoire","Pour préparer notre rencontre"];
var AE_NIVEAUX_RH = ["Pas du tout d’accord","Peu d’accord","Moyennement d’accord","Plutôt d’accord","Tout à fait d’accord"];
function aeSection(f){ var n = +f.cell.slice(1); if(f.cell === "A68" || f.cell === "A70") return 5; if(n >= 59) return 4; if(f.cell === "B44") return 3; return n >= 35 ? 2 : n >= 28 ? 1 : 0; }
function autoeval(rencontre){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">← Évaluations</a><h1>Autoévaluation</h1><div id="ae"><div class="bandeau">▪ CHARGEMENT…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); evaluations(); };
  appelService({action:"ae_lire", session:sessionGardee(), rencontre:rencontre}).then(function(d){
    if(!d || !d.ok) throw 0; aeAfficher(d);
  }).catch(function(){ document.getElementById("ae").innerHTML = '<div class="bandeau">▪ FICHE INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function aeAfficher(d){
  var vals = {}, page = 0, occupe = false;
  d.champs.forEach(function(f){ vals[f.cell] = f.value; });
  var zone = document.getElementById("ae");
  function dire(t){ var e = document.getElementById("aeetat"); if(e){ e.style.display = t ? "block" : "none"; e.textContent = t; } }
  function texteNote(f){ var v = vals[f.cell]; if(v === "" || v == null) return "Choisissez une note."; if(v === "Non applicable") return "Non applicable"; return f.scale === "experience" ? AE_NIVEAUX_RH[+v-1] : (d.bareme[+v-1] || ""); }
  function dessiner(){
    var fs = d.champs.filter(function(f){ return aeSection(f) === page; });
    var h = '<div class="etiq">▪ '+(page+1)+' SUR 6 · '+esc(AE_ETAPES[page]).toUpperCase()+'</div>' + (d.terminee ? '<div class="bandeau">▪ TERMINÉE · CONSULTATION SEULEMENT</div>' : '');
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
      '<button class="bouton" id="aesuiv" type="button"'+(d.terminee && page === 5 ? ' disabled' : '')+'>'+(page === 5 ? (d.terminee ? 'Terminée' : 'Terminer →') : 'Continuer →')+'</button></div>';
    zone.innerHTML = h;
    Array.prototype.forEach.call(zone.querySelectorAll(".aeb"), function(b){
      b.onclick = function(){ var c = b.getAttribute("data-c"), n = b.getAttribute("data-n"); vals[c] = n === "Non applicable" ? n : +n; dessiner(); };
    });
    Array.prototype.forEach.call(zone.querySelectorAll("textarea[data-t]"), function(t){ t.oninput = function(){ vals[t.getAttribute("data-t")] = t.value; }; });
    var p = document.getElementById("aeprec"); if(p) p.onclick = function(){ page--; dessiner(); window.scrollTo(0, 0); };
    var bd = document.getElementById("aebrouillon"); if(bd) bd.onclick = function(){ enregistrer(false); };
    document.getElementById("aesuiv").onclick = function(){
      if(d.terminee){ if(page < 5){ page++; dessiner(); window.scrollTo(0, 0); } return; }
      if(page < 5){ if(!valider(page)) return; enregistrer(false, function(){ page++; dessiner(); window.scrollTo(0, 0); }); }
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
  document.getElementById("sortir").onclick = function(e){ e.preventDefault(); deconnecter(); };
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

if("serviceWorker" in navigator){ window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); }); }
