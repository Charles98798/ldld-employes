// Rencontre de département, étape 1: points de discussion (lecture pour tous, planification pour Gestionnaire + Direction) et capsules communes.
// Services: rd_points_lire (tous), rd_planif_lire / rd_point_ecrire / rd_point_retirer / rd_points_publier (Gestionnaire + Direction),
// rd_capsules_lire / rd_capsule_modifier / rd_capsule_presenter (Gestionnaire + Direction). Le service refuse aussi l'accès (catégorie Gestionnaire ou Direction, jamais Expert technique).
var RD = {dep: "", choisi: false, vue: "discussion"};
var RD_DEPS = ["Acrylique", "Fixe", "Pièce"];
// DONNÉES FICTIVES (à retirer dès les vraies données de Trak): mettre RD_DEMO à false pour tout enlever d'un geste. Les vraies données remplacent le fictif automatiquement.
var RD_DEMO = true;
var RD_DEMO_PTS = [{n:1, texte:"Charge de travail du mois passé"}, {n:2, texte:"Répartition du travail entre les équipes"}, {n:3, texte:"Formation et accompagnement"}, {n:4, texte:"Questions de l’équipe"}];
var RD_DEMO_CAPS = {titre:"Capsule du mois · Charge et fonctionnement", points:["Balancement de la charge deux fois par jour, à 8 h et à 13 h", "Consulter le tableau de charge avant de commencer", "Signaler tout écart à son responsable"]};
function rdDemoSection(cle){
  var mois = ["DÉC.","JANV.","FÉVR.","MARS","AVR.","MAI","JUIN","JUIL.","AOÛT","SEPT.","OCT.","NOV."];
  function serie(v){ return mois.map(function(m, i){ return {m:m, v:v[i]}; }); }
  if(cle === "charge") return {ok:true, equipes:[{equipe:"Montage", moyenne:82, an_passe:79, jours:[58,72,85,97,64]}, {equipe:"Injection", moyenne:74, an_passe:77, jours:[45,66,78,92,60]}, {equipe:"Finition", moyenne:88, an_passe:84, jours:[92,96,99,70,55]}]};
  if(cle === "nc") return {ok:true, serie:serie([5,4,6,3,7,4,6,4,7,3,5,2]), serie_an_passe:serie([6,5,5,4,8,5,7,5,6,4,6,4]), lignes:[["3 nov.","Montage","24790","Assemblage","Dimension hors tolérance","Reprise sur place"],["6 nov.","Finition","24855","Polissage","Défaut de surface","Rebut, refait"]]};
  if(cle === "escomptes") return {ok:true, serie:serie([1,2,0,3,1,2,2,1,3,0,2,1]), serie_an_passe:serie([2,2,1,2,3,2,3,2,2,1,4,2]), lignes:[["5 nov.","Dossier 24817","350 $"],["8 nov.","Dossier 24902","120 $"]]};
  return {ok:true, serie:serie([7,8,6,9,7,10,9,7,11,6,8,5]), serie_an_passe:serie([8,9,7,8,9,9,10,8,10,8,9,7]), lignes:[["Dossier 24790","Étape finition"],["Dossier 24855","Étape montage"]]};
}
function rdCapHtml(c){ return c ? '<div class="rdp"><b>'+rdE(c.titre || "")+'</b>'+(c.points || []).map(function(p){ return '<div>'+rdE(p)+'</div>'; }).join("")+'</div>' : rdMsg("Capsule non disponible"); }
function rdInit(cle){ return RD_DEMO ? rdRendreSection(cle, rdDemoSection(cle)) : rdMsg("Un instant"); }
function rdDemoMarque(){ return RD_DEMO ? '<div class="rdp"><small>▪ Données fictives pour essai</small></div>' : ""; }
// Menu unique (même composant sur Présentation, Planification discussion, Planification capsule): bouton taupe pâli + liste à 3 choix, choix actif en vert.
var RD_CHOIX = [["pres","Présentation"],["disc","Planification discussion"],["cap","Planification capsule"]];
function rdMenuHtml(actif){
  var lib = ""; RD_CHOIX.forEach(function(c){ if(c[0] === actif) lib = c[1]; });
  return '<div class="rdbtn"><button type="button" class="rdplan" id="rdmenu" aria-expanded="false">'+rdE(lib)+'</button><div id="rdml" style="display:none;background:#E3DFD3;border:2px solid #0d1117;margin-top:4px">'+RD_CHOIX.map(function(c){ return '<a href="#" data-c="'+c[0]+'" style="display:block;padding:14px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#1D1D1B;text-decoration:none;'+(c[0] === actif ? "background:#8EFF60;" : "")+'">'+rdE(c[1])+'</a>'; }).join("")+'</div></div>';
}
function rdMenuLier(actif){
  var bm = document.getElementById("rdmenu"), lm = document.getElementById("rdml"); if(!bm || !lm) return;
  bm.onclick = function(){ var ouvert = lm.style.display !== "none"; lm.style.display = ouvert ? "none" : "block"; bm.setAttribute("aria-expanded", ouvert ? "false" : "true"); };
  Array.prototype.forEach.call(lm.querySelectorAll("a"), function(a){ a.onclick = function(e){ e.preventDefault(); var c = a.getAttribute("data-c");
    if(c === actif){ lm.style.display = "none"; bm.setAttribute("aria-expanded", "false"); return; }
    if(c === "pres") rdPresentation(); else { RD.vue = c === "cap" ? "capsule" : "discussion"; rdPlanif(); } }; });
}
function rdPointsHtml(r){
  var pts = (r && r.points) || [], fict = RD_DEMO && !pts.length; if(fict) pts = RD_DEMO_PTS;
  var h = "";
  if(r && r.date) h += '<div class="rddate">'+rdE(r.date)+'</div>'; else if(fict) h += '<div class="rddate">Mardi 17 novembre · 9 h 30</div>';
  h += '<div class="rdt">01 <span>Points de discussion</span></div>';
  h += pts.length ? pts.map(function(p){ return '<div class="rdp"><small>Point '+rdE(p.n)+'</small><div>'+rdE(p.texte)+'</div></div>'; }).join("") : rdMsg("Aucun point publié pour le moment");
  return h;
}
function rdPubCle(){ return "ldld-rd-pub-" + RD.dep; }
function rdPubTexte(d){
  try { var j = new Intl.DateTimeFormat("fr-CA", {weekday:"long", day:"numeric", month:"long", timeZone:"America/Toronto"}).format(d), p = new Intl.DateTimeFormat("fr-CA", {hour:"numeric", minute:"2-digit", hourCycle:"h23", timeZone:"America/Toronto"}).formatToParts(d), h = "", m = "";
    p.forEach(function(x){ if(x.type === "hour") h = String(+x.value); if(x.type === "minute") m = x.value; });
    return j + " à " + h + " h " + m; } catch(e){ return d.toLocaleString("fr-CA"); }
}
function rdPubNoter(){ try { localStorage.setItem(rdPubCle(), rdPubTexte(new Date())); } catch(e){} }
function rdPubLue(){ try { return localStorage.getItem(rdPubCle()) || ""; } catch(e){ return ""; } }
function rdPeutPlanifier(){ return !!(MOI && (MOI.role === "direction" || MOI.role === "responsable")); }
function rdE(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function rdMsg(txt){ return '<div class="bandeau">▪ '+rdE(String(txt).toUpperCase())+'</div>'; }
function rdErreur(r){ var e = r && r.erreur ? String(r.erreur) : ""; return rdMsg(e || "Indisponible · réessayez"); }
function rdTitreDep(){ return "Réunion production"; }   // le département est indiqué par les pastilles

// Choix du département (pendant les tests: l'employé choisit, l'application mémorise). Une réunion séparée par département.
function rencontreDept(){
  var m = ""; try { m = localStorage.getItem("ldld-rd-dep") || ""; } catch(e){}
  RD.dep = RD_DEPS.indexOf(m) >= 0 ? m : "";
  RD.choisi = RD.dep !== "";
  rdPoints();
}

// Vue des points publiés. Version finale: le département de l'employé vient du fichier Trak (réponse du service, champ « departement »).
// Gestionnaire et Direction peuvent changer de département avec les pastilles; si le service ne donne pas de département, tout le monde choisit.
function rdPoints(){
  if(rdPeutPlanifier()){ if(!RD.dep) RD.dep = RD_DEPS[0]; rdPresentation(); return; }   // Gestionnaire et Direction: la page complète s'affiche tout de suite, chaque bloc arrive à son tour
  if(!document.querySelector("#rdz")){ app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+rdE(RD.dep ? rdTitreDep() : "Réunion production")+'</h1></div>'; document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); }; }   // la page s'ouvre tout de suite, même si le service est lent
  appelService({action: "rd_points_lire", session: sessionGardee(), departement: RD.choisi ? RD.dep : ""}).then(function(r){
    if(!r || !r.ok){ app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Réunion production</h1>'+rdErreur(r)+'</div>'; document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); }; return; }
    if(r.departement && RD_DEPS.indexOf(r.departement) >= 0) RD.dep = r.departement; else if(!RD.dep) RD.dep = RD_DEPS[0];
    var planif = r.planif !== undefined ? r.planif : rdPeutPlanifier(), choix = planif || !r.departement;
    if(planif && rdPeutPlanifier()){ rdPresentation(); return; }   // Gestionnaire et Direction: la réunion complète (01 à 04)
    var h = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+rdE(rdTitreDep())+'</h1>';
    if(planif) h += rdMenuHtml("pres");
    if(choix) h += '<div class="chx" id="rdch">'+RD_DEPS.map(function(d){ return '<button type="button" data-d="'+rdE(d)+'" aria-pressed="'+(d === RD.dep ? "true" : "false")+'">'+rdE(d)+'</button>'; }).join("")+'</div>';
    h += '<div id="rdz">';
    var pts = r.points || [], fict = RD_DEMO && !pts.length; if(fict) pts = RD_DEMO_PTS;
    if(r.date) h += '<div class="rddate">'+rdE(r.date)+'</div>'; else if(fict) h += '<div class="rddate">Mardi 17 novembre · 9 h 30</div>';
    h += '<div class="rdt">01 <span>Points de discussion</span></div>';
    if(fict) h += rdDemoMarque();
    h += (pts.length ? pts.map(function(p){ return '<div class="rdp"><small>Point '+rdE(p.n)+'</small><div>'+rdE(p.texte)+'</div></div>'; }).join("") : rdMsg("Aucun point publié pour le moment")) + '</div></div>';
    app.innerHTML = h;
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
    Array.prototype.forEach.call(app.querySelectorAll("#rdch button"), function(bt){ bt.onclick = function(){ RD.dep = bt.getAttribute("data-d"); RD.choisi = true; try { localStorage.setItem("ldld-rd-dep", RD.dep); } catch(e){} rdPoints(); }; });
    if(planif) rdMenuLier("pres");
  }).catch(function(){ app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Réunion production</h1>'+rdMsg("Réseau indisponible")+'</div>'; document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); }; });
}

// Planification: barre noire avec liste déroulante Discussion / Capsule.
function rdBarre(){ return rdMenuHtml(RD.vue === "capsule" ? "cap" : "disc"); }
function rdPlanif(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+rdE(rdTitreDep())+'</h1>'+rdBarre()+'<div id="rdz"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); rdPoints(); };
  rdMenuLier(RD.vue === "capsule" ? "cap" : "disc");
  if(RD.vue === "capsule") return rdCapsules();
  rdDiscussion();
}
var RD_PLAN = null;
function rdDiscussion(donnees, edition){
  var z = document.getElementById("rdz"); if(!z) return;
  if(!donnees){
    appelService({action: "rd_planif_lire", session: sessionGardee(), departement: RD.dep}).then(function(r){ if(!document.getElementById("rdz")) return; if(!r || !r.ok){ document.getElementById("rdz").innerHTML = rdErreur(r); return; } RD_PLAN = r; rdDiscussion(r); }).catch(function(){ var q = document.getElementById("rdz"); if(q) q.innerHTML = rdMsg("Réseau indisponible"); });
    return;
  }
  var pts = donnees.points || [], h = "", fictif = RD_DEMO && !pts.length;
  if(fictif) pts = RD_DEMO_PTS.map(function(p){ return {id: "demo-"+p.n, n: p.n, texte: p.texte, etat: "brouillon", demo: true}; });
  var estDemo = function(id){ return String(id).indexOf("demo-") === 0; };
  if(fictif && !donnees.date) h += '<div class="rddate">Mardi 17 novembre · 9 h 30</div>';
  if(fictif) h += rdDemoMarque();
  if(donnees.date) h += '<div class="rddate">'+rdE(donnees.date)+'</div>';
  h += pts.map(function(p){
    var enEdit = edition === p.id;
    return '<div class="rdp">'+'<small>Point '+rdE(p.n)+(p.etat === "brouillon" && !p.demo ? ' · brouillon' : '')+'</small>' + (enEdit
      ? '<textarea class="rdzone" id="rdtx" maxlength="400" rows="3">'+rdE(p.texte)+'</textarea><div class="rdact"><a href="#" id="rdok">Enregistrer</a><a href="#" id="rdno">Annuler</a></div>'
      : '<div class="rdl2"><div class="rdtx">'+rdE(p.texte)+'</div><div class="rdact"><a href="#" data-m="'+rdE(p.id)+'">Modifier</a><a href="#" data-r="'+rdE(p.id)+'">Retirer</a></div></div>') + '</div>';
  }).join("");
  if(!pts.length && edition !== "nouveau") h += rdMsg("Aucun point pour la prochaine rencontre");
  if(edition === "nouveau") h += '<div class="rdp"><small>Nouveau point</small><textarea class="rdzone" id="rdtx" maxlength="400" rows="3" placeholder="Écrire le point"></textarea><div class="rdact"><a href="#" id="rdok">Enregistrer</a><a href="#" id="rdno">Annuler</a></div></div>';
  h += '<div class="rdstack"><button type="button" class="rdsoft" id="rdadd">Ajouter un point</button><button type="button" class="rdsoft" id="rdpub">Publier aux employés</button></div>';
  h += '<div class="rdp" style="margin-top:12px"><small>'+rdE("Dernière publication : " + (donnees.derniere_publication || rdPubLue() || "jamais"))+'</small></div>';
  if(MOI && MOI.role === "direction") h += '<div class="rdstack"><button type="button" class="rdsoft" id="rdbase">Modifier les points de base</button></div>';
  h += '<div class="rdp"><small style="text-transform:none;letter-spacing:0;font-size:13px;line-height:1.4">Chaque réunion repart des points de base. Vos modifications ci-dessus ne touchent que cette réunion.</small></div>';
  h += '<div class="rdstack"><button type="button" class="rdline" id="rdhist">Historique</button></div><div id="rdm"></div>';
  z.innerHTML = h;
  var dire = function(t){ var m = document.getElementById("rdm"); if(m) m.innerHTML = rdMsg(t); };
  function appliquer(r){ if(r && r.ok){ RD_PLAN = r; rdDiscussion(r); } else dire((r && r.erreur) || "Non enregistré · réessayez"); }
  function ecrire(corps){ appelService(corps).then(appliquer).catch(function(){ dire("Réseau indisponible"); }); }
  // Les points fictifs deviennent de vrais points écrits au service au premier enregistrement (modifier, retirer, ajouter ou publier).
  function materialiser(exclure, remplace, texteNouveau, apres){
    var liste = RD_DEMO_PTS.filter(function(p){ return "demo-"+p.n !== exclure; }).map(function(p){ return "demo-"+p.n === remplace.id ? remplace.texte : p.texte; });
    if(texteNouveau) liste.push(texteNouveau);
    var suite = Promise.resolve(null);
    liste.forEach(function(t){ suite = suite.then(function(){ return appelService({action: "rd_point_ecrire", session: sessionGardee(), departement: RD.dep, id: "", texte: t}); }); });
    suite.then(function(r){ if(apres && r && r.ok) return apres(r); appliquer(r); }).catch(function(){ dire("Réseau indisponible"); });
  }
  Array.prototype.forEach.call(z.querySelectorAll("[data-m]"), function(a){ a.onclick = function(e){ e.preventDefault(); rdDiscussion(RD_PLAN, a.getAttribute("data-m")); }; });
  Array.prototype.forEach.call(z.querySelectorAll("[data-r]"), function(a){ a.onclick = function(e){ e.preventDefault(); dire("Retrait en cours"); if(fictif){ materialiser(a.getAttribute("data-r"), {}, ""); return; } ecrire({action: "rd_point_retirer", session: sessionGardee(), departement: RD.dep, id: a.getAttribute("data-r")}); }; });
  var ok = document.getElementById("rdok"), no = document.getElementById("rdno");
  if(no) no.onclick = function(e){ e.preventDefault(); rdDiscussion(RD_PLAN); };
  if(ok) ok.onclick = function(e){ e.preventDefault(); var t = document.getElementById("rdtx").value.trim(); if(!t){ dire("Écrivez le point"); return; } dire("Enregistrement en cours"); if(fictif){ if(edition === "nouveau") materialiser("", {}, t); else materialiser("", {id: edition, texte: t}, ""); return; } ecrire({action: "rd_point_ecrire", session: sessionGardee(), departement: RD.dep, id: edition === "nouveau" ? "" : edition, texte: t}); };
  document.getElementById("rdadd").onclick = function(){ rdDiscussion(RD_PLAN, "nouveau"); };
  document.getElementById("rdpub").onclick = function(){ dire("Publication en cours"); if(fictif){ materialiser("", {}, "", function(){ return appelService({action: "rd_points_publier", session: sessionGardee(), departement: RD.dep}).then(function(r){ if(r && r.ok){ rdPubNoter(); RD_PLAN = r; rdDiscussion(r); var m = document.getElementById("rdm"); if(m) m.innerHTML = rdMsg("Publié aux employés · " + rdPubTexte(new Date())); } else dire((r && r.erreur) || "Non publié · réessayez"); }); }); return; } appelService({action: "rd_points_publier", session: sessionGardee(), departement: RD.dep}).then(function(r){ if(r && r.ok){ rdPubNoter(); RD_PLAN = r; rdDiscussion(r); var m = document.getElementById("rdm"); if(m) m.innerHTML = rdMsg("Publié aux employés · " + rdPubTexte(new Date())); } else dire((r && r.erreur) || "Non publié · réessayez"); }).catch(function(){ dire("Réseau indisponible"); }); };
  document.getElementById("rdhist").onclick = function(){ rdHistorique(); };
  var bb = document.getElementById("rdbase"); if(bb) bb.onclick = function(){ rdBase(); };
}

// Points de base du département (Direction seulement): chaque nouvelle réunion repart d'une copie. Modifier ici ne change que les réunions futures.
function rdBase(donnees, edition){
  if(!(MOI && MOI.role === "direction")){ rdPlanif(); return; }
  if(!donnees){
    app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+rdE(rdTitreDep())+'</h1>'+rdMenuHtml("disc")+'<div id="rdz"></div></div>';
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); RD.vue = "discussion"; rdPlanif(); };
    rdMenuLier("disc");
    appelService({action: "rd_base_lire", session: sessionGardee(), departement: RD.dep}).then(function(r){ if(!document.getElementById("rdz")) return; rdBase((r && r.ok) ? r : {ok: true, points: []}); }).catch(function(){ if(document.getElementById("rdz")) rdBase({ok: true, points: []}); });
    return;
  }
  var z = document.getElementById("rdz"); if(!z) return;
  var pts = donnees.points || [], fictif = RD_DEMO && !pts.length;
  if(fictif) pts = RD_DEMO_PTS.map(function(p){ return {id: "demo-"+p.n, n: p.n, texte: p.texte, demo: true}; });
  var h = '<div class="rdsm">Points de base · '+rdE(RD.dep)+'</div>';
  if(fictif) h += rdDemoMarque();
  h += pts.map(function(p, i){ var enEdit = edition === p.id;
    return '<div class="rdp"><small>Point '+(i + 1)+'</small>'+(enEdit
      ? '<textarea class="rdzone" id="rdtx" maxlength="400" rows="3">'+rdE(p.texte)+'</textarea><div class="rdact"><a href="#" id="rdok">Enregistrer</a><a href="#" id="rdno">Annuler</a></div>'
      : '<div class="rdl2"><div class="rdtx">'+rdE(p.texte)+'</div><div class="rdact"><a href="#" data-m="'+rdE(p.id)+'">Modifier</a><a href="#" data-r="'+rdE(p.id)+'">Retirer</a></div></div>')+'</div>'; }).join("");
  if(edition === "nouveau") h += '<div class="rdp"><small>Nouveau point de base</small><textarea class="rdzone" id="rdtx" maxlength="400" rows="3" placeholder="Écrire le point"></textarea><div class="rdact"><a href="#" id="rdok">Enregistrer</a><a href="#" id="rdno">Annuler</a></div></div>';
  h += '<div class="rdstack"><button type="button" class="rdsoft" id="rdadd">Ajouter un point de base</button><button type="button" class="rdline" id="rdfin">Retour aux points de la réunion</button></div>';
  h += '<div class="rdp"><small style="text-transform:none;letter-spacing:0;font-size:13px;line-height:1.4">Ces points de base servent de départ à chaque nouvelle réunion. Ils ne changent pas la réunion en cours.</small></div><div id="rdm"></div>';
  z.innerHTML = h;
  var dire = function(t){ var m = document.getElementById("rdm"); if(m) m.innerHTML = rdMsg(t); };
  function appliquer(r){ if(r && r.ok){ rdBase(r); } else dire((r && r.erreur) || "Non enregistré · réessayez"); }
  function materialiser(exclure, remplace, texteNouveau){
    var liste = RD_DEMO_PTS.filter(function(p){ return "demo-"+p.n !== exclure; }).map(function(p){ return "demo-"+p.n === remplace.id ? remplace.texte : p.texte; });
    if(texteNouveau) liste.push(texteNouveau);
    var suite = Promise.resolve(null);
    liste.forEach(function(t){ suite = suite.then(function(){ return appelService({action: "rd_base_ecrire", session: sessionGardee(), departement: RD.dep, id: "", texte: t}); }); });
    suite.then(appliquer).catch(function(){ dire("Réseau indisponible"); });
  }
  Array.prototype.forEach.call(z.querySelectorAll("[data-m]"), function(a){ a.onclick = function(e){ e.preventDefault(); rdBase(donnees, a.getAttribute("data-m")); }; });
  Array.prototype.forEach.call(z.querySelectorAll("[data-r]"), function(a){ a.onclick = function(e){ e.preventDefault(); dire("Retrait en cours"); if(fictif){ materialiser(a.getAttribute("data-r"), {}, ""); return; } appelService({action: "rd_base_retirer", session: sessionGardee(), departement: RD.dep, id: a.getAttribute("data-r")}).then(appliquer).catch(function(){ dire("Réseau indisponible"); }); }; });
  var ok = document.getElementById("rdok"), no = document.getElementById("rdno");
  if(no) no.onclick = function(e){ e.preventDefault(); rdBase(donnees); };
  if(ok) ok.onclick = function(e){ e.preventDefault(); var t = document.getElementById("rdtx").value.trim(); if(!t){ dire("Écrivez le point"); return; } dire("Enregistrement en cours");
    if(fictif){ if(edition === "nouveau") materialiser("", {}, t); else materialiser("", {id: edition, texte: t}, ""); return; }
    appelService({action: "rd_base_ecrire", session: sessionGardee(), departement: RD.dep, id: edition === "nouveau" ? "" : edition, texte: t}).then(appliquer).catch(function(){ dire("Réseau indisponible"); }); };
  document.getElementById("rdadd").onclick = function(){ rdBase(donnees, "nouveau"); };
  document.getElementById("rdfin").onclick = function(){ RD.vue = "discussion"; rdPlanif(); };
}
function rdHistorique(){
  var h = RD_PLAN && RD_PLAN.historique || [];
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Réunion production</h1><div class="rddate">'+rdE("Département " + RD.dep)+'</div>' +
    (h.length ? h.map(function(p){ return '<div class="rdp"><small>Point '+rdE(p.n)+' · '+rdE(p.etat || "")+(p.modifie ? ' · '+rdE(p.modifie) : '')+(p.par ? ' · '+rdE(p.par) : '')+'</small><div>'+rdE(p.texte)+'</div></div>'; }).join("") : rdMsg("Aucun ancien point")) + '</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); RD.vue = "discussion"; rdPlanif(); };
}

// Capsules communes aux trois départements: capsule du mois en haut, puis les prochaines.
var RD_CAP = null;
function rdCapsules(donnees){
  var z = document.getElementById("rdz"); if(!z) return;
  if(!donnees){
    appelService({action: "rd_capsules_lire", session: sessionGardee()}).then(function(r){ if(!document.getElementById("rdz")) return; if(!r || !r.ok){ document.getElementById("rdz").innerHTML = rdErreur(r); return; } RD_CAP = r; rdCapsules(r); }).catch(function(){ var q = document.getElementById("rdz"); if(q) q.innerHTML = rdMsg("Réseau indisponible"); });
    return;
  }
  var c = donnees.courante, h = "";
  // Liste complète des 11 capsules d'abord (la capsule du mois repérée), puis le détail de la capsule choisie (par défaut celle du mois).
  var toutes = (donnees.liste || []).slice(); if(c && !toutes.some(function(x){ return x.n === c.n; })) toutes.push(c);
  toutes.sort(function(x, y){ return x.n - y.n; });
  var choisie = RD.capSel && toutes.some(function(x){ return x.n === RD.capSel; }) ? RD.capSel : (c ? c.n : (toutes[0] && toutes[0].n));
  h += '<div class="rdsm">Les 11 capsules</div>' + toutes.map(function(x){
    var surM = c && x.n === c.n, sel = x.n === choisie;
    return '<a href="#" class="rdln" data-s="'+rdE(x.n)+'" style="text-decoration:none;color:inherit;'+(sel ? "background:#8EFF60;" : "")+'padding:10px 8px"><span><small>'+(x.n < 10 ? "0" : "")+rdE(x.n)+'</small> '+rdE(x.titre)+(surM ? ' <em>capsule du mois</em>' : '')+(x.pret === false ? ' <em>en préparation</em>' : '')+'</span></a>';
  }).join("");
  var d = toutes.filter(function(x){ return x.n === choisie; })[0];
  if(d){
    var pointsD = (c && c.n === d.n && c.points) ? c.points : (d.points || []);
    h += '<div class="rdsm" style="margin-top:22px">Capsule '+rdE(d.n)+' sur 11'+(d.theme ? ' · '+rdE(d.theme) : '')+(c && c.n === d.n ? ' · capsule du mois' : '')+'</div><div class="rdcap"><div class="rdcapt" style="margin-bottom:18px">'+rdE(d.titre)+'</div>' +
      pointsD.map(function(p, i){ return '<div class="rdcl" style="margin-top:18px"><small>0'+(i + 1)+'</small> '+rdE(p.t)+(p.statut === "à valider" ? ' <em style="white-space:nowrap">à valider</em>' : '')+'</div>'; }).join("") +
      '<div class="rdact" style="margin-top:18px"><a href="#" data-c="'+rdE(d.n)+'">Modifier</a></div></div>';
  }
  z.innerHTML = h;
  Array.prototype.forEach.call(z.querySelectorAll("[data-s]"), function(a){ a.onclick = function(e){ e.preventDefault(); RD.capSel = Number(a.getAttribute("data-s")); rdCapsules(donnees); }; });
  Array.prototype.forEach.call(z.querySelectorAll("[data-c]"), function(a){ a.onclick = function(e){ e.preventDefault(); rdCapsuleEdit(Number(a.getAttribute("data-c"))); }; });
}
function rdCapsuleEdit(n){
  var cap = (RD_CAP && RD_CAP.liste || []).filter(function(x){ return x.n === n; })[0] || (RD_CAP && RD_CAP.courante && RD_CAP.courante.n === n ? RD_CAP.courante : null);
  if(!cap) return;
  var pts = (cap.points || []).map(function(p){ return {t: p.t, statut: p.statut}; });
  function dessiner(){
    var h = '<div class="rdsm">Capsule '+rdE(n)+' sur 11 · '+rdE(cap.theme || "")+'</div><div class="rdcapt" style="margin-bottom:12px">'+rdE(cap.titre)+'</div>' +
      pts.map(function(p, i){ return '<small class="rdlb">Point '+(i + 1)+(p.statut === "à valider" ? ' · à valider' : '')+'</small><textarea class="rdzone" data-i="'+i+'" maxlength="300" rows="2">'+rdE(p.t)+'</textarea><div class="rdact"><a href="#" data-v="'+i+'">'+(p.statut === "à valider" ? "Valider" : "Marquer à valider")+'</a><a href="#" data-x="'+i+'">Retirer</a></div>'; }).join("");
    h += '<div class="rdstack">' + (pts.length < 5 ? '<button type="button" class="rdsoft" id="rdca">Ajouter un point</button>' : '') + '<button type="button" class="rdline" id="rdcp">Présenter à la prochaine rencontre</button><button type="button" class="rdsoft" id="rdcs">Enregistrer</button></div><div id="rdm"></div>';
    document.getElementById("rdz").innerHTML = h;
    function lire(){ Array.prototype.forEach.call(document.querySelectorAll("#rdz textarea[data-i]"), function(t){ pts[Number(t.getAttribute("data-i"))].t = t.value; }); }
    var dire = function(t){ var m = document.getElementById("rdm"); if(m) m.innerHTML = rdMsg(t); };
    Array.prototype.forEach.call(document.querySelectorAll("#rdz [data-v]"), function(a){ a.onclick = function(e){ e.preventDefault(); lire(); var p = pts[Number(a.getAttribute("data-v"))]; p.statut = p.statut === "à valider" ? "valide" : "à valider"; dessiner(); }; });
    Array.prototype.forEach.call(document.querySelectorAll("#rdz [data-x]"), function(a){ a.onclick = function(e){ e.preventDefault(); lire(); pts.splice(Number(a.getAttribute("data-x")), 1); dessiner(); }; });
    var ca = document.getElementById("rdca"); if(ca) ca.onclick = function(){ lire(); pts.push({t: "", statut: "à valider"}); dessiner(); };
    function fin(r){ if(r && r.ok){ RD_CAP = r; RD.vue = "capsule"; rdPlanif(); } else dire((r && r.erreur) || "Non enregistré · réessayez"); }
    document.getElementById("rdcs").onclick = function(){ lire(); dire("Enregistrement en cours"); appelService({action: "rd_capsule_modifier", session: sessionGardee(), n: n, titre: cap.titre, points: pts.filter(function(p){ return String(p.t).trim(); })}).then(fin).catch(function(){ dire("Réseau indisponible"); }); };
    document.getElementById("rdcp").onclick = function(){ dire("Un instant"); appelService({action: "rd_capsule_presenter", session: sessionGardee(), n: n}).then(fin).catch(function(){ dire("Réseau indisponible"); }); };
  }
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+rdE(rdTitreDep())+'</h1>'+rdBarre()+'<div id="rdz"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); RD.vue = "capsule"; rdPlanif(); };
  rdMenuLier("cap");
  dessiner();
}


// Étapes 2 à 4: mode Présentation (Gestionnaire + Direction), un département à la fois, chiffres sans noms.
// Service: rd_chiffres {section: escomptes|nc|cas|charge, departement} -> {ok, attente:true} tant que les fichiers de Trak manquent (jamais de chiffres inventés).
var RD_SECTIONS = [
  ["escomptes", "02 Escomptes prévisibles"],
  ["nc", "02 Non-conformités"],
  ["cas", "02 Cas non complétés"],
  ["charge", "03 Charge de travail"]
];
function rdLigne(cols){ return '<div class="rdp" style="display:flex;gap:10px;flex-wrap:wrap"><span>'+cols.map(rdE).join('</span><span>')+'</span></div>'; }
function rdCourbe(a, b){
  // Courbe SVG: trait noir = année en cours, pointillé = an passé. Valeurs en chiffres, jamais de noms.
  var W = 320, H = 110, px = 14, py = 14, n = a.length, max = 1, i;
  a.forEach(function(x){ max = Math.max(max, +x.v || 0); }); (b || []).forEach(function(x){ max = Math.max(max, +x.v || 0); });
  function pt(arr, k){ return (px + (n > 1 ? k*(W-2*px)/(n-1) : 0)).toFixed(1)+","+(H-py-((+arr[k].v || 0)/max)*(H-2*py)).toFixed(1); }
  var la = a.map(function(x, k){ return pt(a, k); }).join(" "), lb = (b && b.length >= n) ? a.map(function(x, k){ return pt(b, k); }).join(" ") : "";
  var lab = a.map(function(x, k){ return k % (n > 8 ? 2 : 1) === 0 ? '<text x="'+(px + (n > 1 ? k*(W-2*px)/(n-1) : 0)).toFixed(1)+'" y="'+(H-2)+'" font-size="8" text-anchor="middle" fill="#8D806A">'+rdE(x.m)+'</text>' : ""; }).join("");
  var pts = a.map(function(x, k){ var p = pt(a, k).split(","); return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2" fill="#1D1D1B"/>'; }).join("");
  var dern = pt(a, n-1).split(",");
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Courbe" style="display:block;margin:6px 0 10px"><line x1="'+px+'" y1="'+(H-py)+'" x2="'+(W-px)+'" y2="'+(H-py)+'" stroke="#B4AB9B" stroke-width="1"/>'
    + (lb ? '<polyline points="'+lb+'" fill="none" stroke="#1D1D1B" stroke-width="1.5" stroke-dasharray="3 3" opacity=".55"/>' : "")
    + '<polyline points="'+la+'" fill="none" stroke="#1D1D1B" stroke-width="2"/>'+pts
    + '<text x="'+dern[0]+'" y="'+(parseFloat(dern[1])-6)+'" font-size="9" text-anchor="end" fill="#1D1D1B">'+rdE(a[n-1].v)+'</text>'+lab+'</svg>'
    + (lb ? '<div class="rdp"><small>Trait plein · cette année · pointillé · an passé</small></div>' : "");
}
function rdSerie(titre, a, b){
  if(!a || !a.length) return "";
  return '<small>'+rdE(titre)+'</small>' + rdCourbe(a, b);
}
function rdRendreSection(cle, r){
  if(RD_DEMO && r && r.ok && (r.attente || (cle === "charge" && !(r.equipes || []).length))) r = rdDemoSection(cle);
  if((!r || !r.ok) && RD_DEMO) r = rdDemoSection(cle);
  if(!r || !r.ok) return rdErreur(r);
  if(r.attente) return rdMsg("Données en attente de Trak");
  var h = "";
  if(cle === "charge"){
    var eq = (r.equipes || []).filter(function(e){ return !/informatique/i.test(String(e.equipe || "")); });   // l'équipe Informatique n'est jamais invitée à la Réunion production
    if(!eq.length) return rdMsg("Données en attente de Trak");
    h += '<div class="rdp"><small>Pourcentage de charge · mois passé · même mois de l’an passé · 5 prochains jours</small></div>';
    h += '<div class="rdp" style="display:flex;gap:6px;align-items:center;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#8D806A"><span style="width:20%">Équipe</span><span style="width:13%;text-align:center">Mois</span><span style="width:13%;text-align:center">An passé</span>'+[1,2,3,4,5].map(function(k){ return '<span style="width:10.2%;text-align:center">J+'+k+'</span>'; }).join("")+'</div>';
    h += eq.map(function(e){ return '<div class="rdp" style="display:flex;gap:6px;align-items:center"><span style="width:20%">'+rdE(e.equipe)+'</span><span style="width:13%;text-align:center">'+rdE(e.moyenne)+'</span><span style="width:13%;text-align:center">'+rdE(e.an_passe == null ? "—" : e.an_passe)+'</span>'+(e.jours || []).map(function(j){ var rouge = j > 95, vert = !rouge && j >= 65; return '<span style="width:10.2%;text-align:center;font-size:11px;padding:3px 0;'+(rouge ? "background:#B8473A;color:#fff" : (vert ? "background:#8EFF60;color:#1D1D1B" : "")) +'">'+rdE(j)+'</span>'; }).join("")+'</div>'; }).join("");
    h += '<div class="rdp"><small>Vert 65 à 95 % · Brique plus de 95 %</small></div>';
    return h;
  }
  h += rdSerie(cle === "cas" ? "Cas non complétés par mois" : (cle === "nc" ? "Non-conformités par mois" : "Nombre de crédits par mois"), r.serie, r.serie_an_passe);
  var L = r.lignes || [];
  h += L.length ? L.map(function(l){ return rdLigne(l); }).join("") : (h ? "" : rdMsg("Aucune donnée pour cette période"));
  return h;
}
function rdPresentation(){
  if(!rdPeutPlanifier()){ rdPoints(); return; }
  var h = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+rdE(rdTitreDep())+'</h1>';
  h += rdMenuHtml("pres");
  h += '<div class="chx" id="rdch">'+RD_DEPS.map(function(d){ return '<button type="button" data-d="'+rdE(d)+'" aria-pressed="'+(d === RD.dep ? "true" : "false")+'">'+rdE(d)+'</button>'; }).join("")+'</div>';
  h += rdDemoMarque();
  h += '<div class="rdp" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><small style="width:100%">Période des chiffres</small><select class="bx" id="rdper" style="flex:1;min-width:0"><option value="mois">Mois dernier complet</option><option value="an">Même mois de l’an passé</option><option value="dates">Dates au choix</option></select><span id="rddt" style="display:none;gap:8px;width:100%"><input class="bx" type="date" id="rddu" style="flex:1;min-width:0"><input class="bx" type="date" id="rdau" style="flex:1;min-width:0"></span></div>';
  var blk = 0;
  function bloc(inner){ return '<div class="rdblk">'+inner+'</div>'; }
  h += bloc('<div id="rds-pts">'+(RD_DEMO ? rdPointsHtml(null) : rdMsg("Un instant"))+'</div>');
  h += RD_SECTIONS.map(function(s){ return bloc('<div class="rdt">'+rdE(s[1].slice(0, 2))+' <span>'+rdE(s[1].slice(3))+'</span></div><div id="rds-'+s[0]+'">'+rdInit(s[0])+'</div>'); }).join("");
  h += bloc('<div class="rdt">04 <span>Capsule du mois</span></div><div id="rds-cap">'+(RD_DEMO ? rdCapHtml(RD_DEMO_CAPS) : rdMsg("Un instant"))+'</div>') + '</div>';
  app.innerHTML = h;
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  rdMenuLier("pres");
  Array.prototype.forEach.call(app.querySelectorAll("#rdch button"), function(bt){ bt.onclick = function(){ RD.dep = bt.getAttribute("data-d"); try { localStorage.setItem("ldld-rd-dep", RD.dep); } catch(e){} rdPresentation(); }; });
  function chargerChiffres(){
    var per = RD.periode || {t:"mois"};
    RD_SECTIONS.forEach(function(s){
      var z0 = document.getElementById("rds-"+s[0]); if(z0) z0.innerHTML = rdInit(s[0]);
      appelService({action: "rd_chiffres", session: sessionGardee(), section: s[0], departement: RD.dep, periode: per.t, du: per.du || "", au: per.au || ""}).then(function(r){ var z = document.getElementById("rds-"+s[0]); if(z) z.innerHTML = rdRendreSection(s[0], r); }).catch(function(){ var z = document.getElementById("rds-"+s[0]); if(z && !RD_DEMO) z.innerHTML = rdMsg("Réseau indisponible"); });
    });
  }
  var sp = document.getElementById("rdper"), dt = document.getElementById("rddt"), d1 = document.getElementById("rddu"), d2 = document.getElementById("rdau");
  if(sp){ var pp = RD.periode || {t:"mois"}; sp.value = pp.t; if(pp.t === "dates"){ dt.style.display = "flex"; d1.value = pp.du || ""; d2.value = pp.au || ""; }
    var chg = function(){ RD.periode = {t: sp.value, du: d1.value, au: d2.value}; dt.style.display = sp.value === "dates" ? "flex" : "none"; if(sp.value !== "dates" || (d1.value && d2.value)) chargerChiffres(); };
    sp.onchange = chg; d1.onchange = chg; d2.onchange = chg; }
  chargerChiffres();
  appelService({action: "rd_points_lire", session: sessionGardee(), departement: RD.dep}).then(function(r){ var zp = document.getElementById("rds-pts"); if(zp) zp.innerHTML = rdPointsHtml(r); var z = document.getElementById("rds-cap"); if(!z) return; var c = (r && r.capsule) || (RD_DEMO ? RD_DEMO_CAPS : null); z.innerHTML = c ? '<div class="rdp"><b>'+rdE(c.titre || "")+'</b>'+(c.points || []).map(function(p){ return '<div>'+rdE(p)+'</div>'; }).join("")+'</div>' : rdMsg("Capsule non disponible"); }).catch(function(){ var zp = document.getElementById("rds-pts"), zc = document.getElementById("rds-cap"); if(zp && !RD_DEMO) zp.innerHTML = rdMsg("Réseau indisponible"); if(zc && !RD_DEMO) zc.innerHTML = rdMsg("Réseau indisponible"); });
}
