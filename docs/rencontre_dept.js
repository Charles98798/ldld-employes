// Rencontre de département, étape 1: points de discussion (lecture pour tous, planification pour Gestionnaire + Direction) et capsules communes.
// Services: rd_points_lire (tous), rd_planif_lire / rd_point_ecrire / rd_point_retirer / rd_points_publier (Gestionnaire + Direction),
// rd_capsules_lire / rd_capsule_modifier / rd_capsule_presenter (Gestionnaire + Direction). Le service refuse aussi l'accès (catégorie Gestionnaire ou Direction, jamais Expert technique).
var RD = {dep: "", choisi: false, vue: "discussion"};
var RD_DEPS = ["Acrylique", "Fixe", "Pièce"];
// DONNÉES FICTIVES (à retirer dès les vraies données de Trak): mettre RD_DEMO à false pour tout enlever d'un geste. Les vraies données remplacent le fictif automatiquement.
var RD_DEMO = true;
var RD_DEMO_PTS = [{n:1, texte:"Charge de travail du mois passé et des 5 prochains jours"}, {n:2, texte:"Répartition du travail entre les équipes"}, {n:3, texte:"Formation du mois : horaire et inscriptions"}, {n:4, texte:"Questions de l’équipe"}];
var RD_DEMO_CAPS = {titre:"Capsule du mois · Charge et fonctionnement", points:["Balancement de la charge deux fois par jour, à 8 h et à 13 h", "Consulter le tableau de charge avant de commencer", "Signaler tout écart à son responsable"]};
function rdDemoSection(cle){
  var mois = ["DÉC.","JANV.","FÉVR.","MARS","AVR.","MAI","JUIN","JUIL.","AOÛT","SEPT.","OCT.","NOV."];
  function serie(v){ return mois.map(function(m, i){ return {m:m, v:v[i]}; }); }
  if(cle === "charge") return {ok:true, equipes:[{equipe:"Montage", moyenne:82, an_passe:79, jours:[58,72,85,97,64]}, {equipe:"Injection", moyenne:74, an_passe:77, jours:[45,66,78,92,60]}, {equipe:"Finition", moyenne:88, an_passe:84, jours:[92,96,99,70,55]}]};
  if(cle === "nc") return {ok:true, serie:serie([5,4,6,3,7,4,6,4,7,3,5,2]), serie_an_passe:serie([6,5,5,4,8,5,7,5,6,4,6,4]), lignes:[["3 nov.","Montage","24790","Assemblage","Dimension hors tolérance","Reprise sur place"],["6 nov.","Finition","24855","Polissage","Défaut de surface","Rebut, refait"]]};
  if(cle === "escomptes") return {ok:true, serie:serie([1,2,0,3,1,2,2,1,3,0,2,1]), serie_an_passe:serie([2,2,1,2,3,2,3,2,2,1,4,2]), lignes:[["5 nov.","Dossier 24817","350 $"],["8 nov.","Dossier 24902","120 $"]]};
  return {ok:true, serie:serie([7,8,6,9,7,10,9,7,11,6,8,5]), serie_an_passe:serie([8,9,7,8,9,9,10,8,10,8,9,7]), lignes:[["Dossier 24790","Étape finition"],["Dossier 24855","Étape montage"]]};
}
function rdCapHtml(c){ return c ? '<div class="rdp"><b>'+rdE(c.titre || "")+'</b>'+(c.points || []).map(function(p){ return rdPuces(p); }).join("")+'</div>' : rdMsg("Capsule non disponible"); }
// Cache par appareil des dernières vraies données (département, section, période): jamais de fictif au départ.
function rdCacheCle(cle){ var p = RD.periode || {t:"mois"}; return "ldld-rdc-"+RD.dep+"-"+cle+"-"+(p.t === "mois" ? "m" : (p.du || "")+(p.au || "")); }
function rdCacheLire(k){ try { return JSON.parse(localStorage.getItem(k) || "null"); } catch(e){ return null; } }
function rdCacheEcrire(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
function rdInit(cle){ var c = rdCacheLire(rdCacheCle(cle)); return c && c.ok && !c.attente ? rdRendreSection(cle, c) : rdMsg("Un instant"); }
function rdDemoMarque(){ return RD_DEMO ? '<div class="rdp"><small>▪ Données fictives pour essai</small></div>' : ""; }
// Menu unique (même composant sur Présentation, Planification discussion, Planification capsule): bouton taupe pâli + liste à 3 choix, choix actif en vert.
var RD_CHOIX = [["pres","Présentation"],["disc","Planification discussion"],["cap","Planification capsule"],["com","Planification commentaire"]];
function rdMenuHtml(actif){
  var lib = ""; RD_CHOIX.forEach(function(c){ if(c[0] === actif) lib = c[1]; });
  return '<div class="rdbtn"><button type="button" class="rdplan" id="rdmenu" aria-expanded="false">'+rdE(lib)+'</button><div id="rdml" style="display:none;background:#E3DFD3;border:2px solid #0d1117;margin-top:4px">'+RD_CHOIX.map(function(c){ return '<a href="#" data-c="'+c[0]+'" style="display:block;padding:14px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#1D1D1B;text-decoration:none;'+(c[0] === actif ? "background:#8EFF60;" : "")+'">'+rdE(c[1])+'</a>'; }).join("")+'</div></div>';
}
function rdMenuLier(actif){
  var bm = document.getElementById("rdmenu"), lm = document.getElementById("rdml"); if(!bm || !lm) return;
  bm.onclick = function(){ var ouvert = lm.style.display !== "none"; lm.style.display = ouvert ? "none" : "block"; bm.setAttribute("aria-expanded", ouvert ? "false" : "true"); };
  Array.prototype.forEach.call(lm.querySelectorAll("a"), function(a){ a.onclick = function(e){ e.preventDefault(); var c = a.getAttribute("data-c");
    if(c === actif){ lm.style.display = "none"; bm.setAttribute("aria-expanded", "false"); return; }
    if(c === "pres") rdPresentation(); else { RD.vue = c === "cap" ? "capsule" : (c === "com" ? "commentaire" : "discussion"); rdPlanif(); } }; });
}
function rdPointsHtml(r){
  var pts = (r && r.points) || [], fict = RD_DEMO && !pts.length; if(fict) pts = RD_DEMO_PTS;
  var h = "";
  h += '<div class="rdt">01 <span>Points de discussion</span></div>';
  h += pts.length ? pts.map(function(p){ return '<div class="rdp"><small>Point '+rdE(p.n)+'</small><div>'+rdPuces(p.texte)+'</div></div>'; }).join("") : rdMsg("Aucun point publié pour le moment");
  return h;
}
function rdCapPresCle(n){ return "ldld-rd-cap-" + n; }
function rdCapPresNoter(n){ try { localStorage.setItem(rdCapPresCle(n), rdPubTexte(new Date())); } catch(e){} }
function rdCapPresLue(n){ try { return localStorage.getItem(rdCapPresCle(n)) || ""; } catch(e){ return ""; } }
function rdPubCle(){ return "ldld-rd-pub-" + RD.dep; }
function rdPubTexte(d){
  try { var j = new Intl.DateTimeFormat("fr-CA", {weekday:"long", day:"numeric", month:"long", timeZone:"America/Toronto"}).format(d), p = new Intl.DateTimeFormat("fr-CA", {hour:"numeric", minute:"2-digit", hourCycle:"h23", timeZone:"America/Toronto"}).formatToParts(d), h = "", m = "";
    p.forEach(function(x){ if(x.type === "hour") h = String(+x.value); if(x.type === "minute") m = x.value; });
    return j + " à " + h + " h " + m; } catch(e){ return d.toLocaleString("fr-CA"); }
}
function rdPubNoter(){ try { localStorage.setItem(rdPubCle(), rdPubTexte(new Date())); } catch(e){} }
function rdPubLue(){ try { return localStorage.getItem(rdPubCle()) || ""; } catch(e){ return ""; } }
function rdPeutPlanifier(){ return !!(MOI && (MOI.role === "direction" || MOI.role === "responsable")); }
function rdIcones(attrM, valM, attrX, valX){
  var pm='M16 1h6v6h-6zM10 7h6v6h-6zM4 13h6v6h-6zM2 20h20v3h-20z', px='M3 3h6v6h-6zM15 3h6v6h-6zM9 9h6v6h-6zM3 15h6v6h-6zM15 15h6v6h-6z';
  return '<div class="rdact"><a href="#" class="rdic" '+attrM+'="'+valM+'" aria-label="Modifier"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="'+pm+'"/></svg></a><a href="#" class="rdic" '+attrX+'="'+valX+'" aria-label="Retirer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+px+'"/></svg></a></div>';
}
function rdHeureEnreg(){ var d = new Date(); return "Enregistré à " + d.getHours() + " h " + ("0"+d.getMinutes()).slice(-2); }
function rdMois18(){
  var N = ["JANVIER","FÉVRIER","MARS","AVRIL","MAI","JUIN","JUILLET","AOÛT","SEPTEMBRE","OCTOBRE","NOVEMBRE","DÉCEMBRE"], p2 = function(n){ return ("0"+n).slice(-2); }, t = new Date(), r = [];
  for(var k = 1; k <= 18; k++){ var d = new Date(t.getFullYear(), t.getMonth() - k, 1), y = d.getFullYear(), m = d.getMonth(), der = new Date(y, m + 1, 0).getDate();
    r.push({cle: y+"-"+p2(m+1), lib: N[m]+" "+y, du: y+"-"+p2(m+1)+"-01", au: y+"-"+p2(m+1)+"-"+p2(der)}); }
  return r;
}
function rdAujourdhui(){ try { return new Intl.DateTimeFormat("fr-CA", {timeZone: "America/Toronto", weekday: "long", day: "numeric", month: "long", year: "numeric"}).format(new Date()).replace(/^(\S+) 1 /, "$1 1er ").toUpperCase(); } catch(e){ return ""; } }
function rdE(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
// RÈGLE UNIVERSELLE: une ligne à puce qui se prolonge s'aligne sous la première lettre (retrait suspendu), jamais sous la puce.
function rdPuces(t){
  return String(t == null ? "" : t).split("\n").map(function(l){
    var m = /^\s*([•▪\-–])\s+(.*)$/.exec(l);
    return m ? '<div class="pu"><span>'+rdE(m[1] === "-" || m[1] === "–" ? "•" : m[1])+'</span><span>'+rdE(m[2])+'</span></div>' : '<div>'+rdE(l)+'</div>'; }).join("");
}
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
    h += (pts.length ? pts.map(function(p){ return '<div class="rdp"><small>Point '+rdE(p.n)+'</small><div>'+rdPuces(p.texte)+'</div></div>'; }).join("") : rdMsg("Aucun point publié pour le moment")) + '</div></div>';
    app.innerHTML = h;
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
    Array.prototype.forEach.call(app.querySelectorAll("#rdch button"), function(bt){ bt.onclick = function(){ RD.dep = bt.getAttribute("data-d"); RD.choisi = true; try { localStorage.setItem("ldld-rd-dep", RD.dep); } catch(e){} rdPoints(); }; });
    if(planif) rdMenuLier("pres");
  }).catch(function(){ app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Réunion production</h1>'+rdMsg("Réseau indisponible")+'</div>'; document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); }; });
}

// Planification: barre noire avec liste déroulante Discussion / Capsule.
function rdBarre(){ return rdMenuHtml(RD.vue === "capsule" ? "cap" : (RD.vue === "commentaire" ? "com" : "disc")); }
function rdPlanif(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+rdE(rdTitreDep())+'</h1>'+rdBarre()+'<div id="rdz"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); rdPoints(); };
  rdMenuLier(RD.vue === "capsule" ? "cap" : (RD.vue === "commentaire" ? "com" : "disc"));
  if(RD.vue === "capsule") return rdCapsules();
  if(RD.vue === "commentaire") return rdCommentairesPage();
  rdDiscussion();
}
// Planification commentaire: ajout, modification et retrait des commentaires clients du département (sauvegarde automatique dans le formulaire).
function rdCommentairesPage(){
  var z = document.getElementById("rdz"); if(!z) return;
  z.innerHTML = '<div class="rdgrid" style="margin-top:12px"><button type="button" class="rdsoft" id="ccadd">Ajouter un commentaire client</button></div><div id="cclist"></div>';
  if(typeof ccFormulaire === "function"){ document.getElementById("ccadd").onclick = function(){ ccFormulaire(); }; ccListePlanif(); }
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
  var separe = pts.some(function(p){ return p.prochaine === true; }) && pts.some(function(p){ return p.prochaine === false; }), lastG = null;
  h += pts.map(function(p){
    var enEdit = edition === p.id, ent = "";
    if(separe && lastG !== !!p.prochaine){ lastG = !!p.prochaine; ent = '<div class="rdsm">'+(lastG ? "Prochaine réunion · brouillon" : "Réunion en cours · publiée")+'</div>'; }
    return ent + (function(){
    return '<div class="rdp">'+'<small>Point '+rdE(p.n)+(p.etat === "brouillon" && !p.demo ? ' · brouillon' : '')+'</small>' + (enEdit
      ? '<textarea class="rdzone" id="rdtx" maxlength="400" rows="3">'+rdE(p.texte)+'</textarea><div class="rdact"><a href="#" id="rdok">Enregistrer</a><a href="#" id="rdno">Annuler</a></div>'
      : '<div class="rdl2"><div class="rdtx">'+rdPuces(p.texte)+'</div>'+rdIcones("data-m",rdE(p.id),"data-r",rdE(p.id))+'</div>') + '</div>';
    })();
  }).join("");
  if(!pts.length && edition !== "nouveau") h += rdMsg("Aucun point pour la prochaine rencontre");
  if(edition === "nouveau") h += '<div class="rdp"><small>Nouveau point</small><textarea class="rdzone" id="rdtx" maxlength="400" rows="3" placeholder="Écrire le point"></textarea><div class="rdact"><a href="#" id="rdok">Enregistrer</a><a href="#" id="rdno">Annuler</a></div></div>';
  h += '<div class="rdgrid"><button type="button" class="rdsoft" id="rdadd">Ajouter un point</button>'+((MOI && MOI.role === "direction") ? '<button type="button" class="rdsoft" id="rdbase">Modifier les points de base</button>' : '<span></span>')+'<button type="button" class="rdsoft rdpubb" id="rdpub">Publier aux employés</button><button type="button" class="rdsoft" id="rdhist">Historique</button></div>';
  h += '<div class="rdp" style="margin-top:12px"><small>'+rdE("Dernière publication : " + (donnees.derniere_publication || rdPubLue() || "jamais"))+'</small></div>';
  h += '<div class="rdp"><small style="text-transform:none;letter-spacing:0;font-size:13px;line-height:1.4">Chaque réunion repart des points de base. Vos modifications ci-dessus ne touchent que cette réunion.</small></div><div id="rdm"></div>';
  z.innerHTML = h;
  var dire = function(t){ var m = document.getElementById("rdm"); if(m) m.innerHTML = rdMsg(t); };
  function appliquer(r){ if(r && r.ok){ RD_PLAN = r; rdDiscussion(r); dire(rdHeureEnreg()); } else dire((r && r.erreur) || "Non enregistré · réessayez"); }
  function ecrire(corps){ appelService(corps).then(appliquer).catch(function(){ dire("Réseau indisponible"); }); }
  // Les points fictifs deviennent de vrais points écrits au service au premier enregistrement (modifier, retirer, ajouter ou publier).
  function materialiser(exclure, remplace, texteNouveau, apres){
    if(RD.mat) return; RD.mat = true;   // un seul enregistrement à la fois: jamais de points écrits en double
    var liste = RD_DEMO_PTS.filter(function(p){ return "demo-"+p.n !== exclure; }).map(function(p){ return "demo-"+p.n === remplace.id ? remplace.texte : p.texte; });
    if(texteNouveau) liste.push(texteNouveau);
    var suite = Promise.resolve(null);
    liste.forEach(function(t){ suite = suite.then(function(){ return appelService({action: "rd_point_ecrire", session: sessionGardee(), departement: RD.dep, id: "", texte: t}); }); });
    suite.then(function(r){ RD.mat = false; if(apres && r && r.ok) return apres(r); appliquer(r); }).catch(function(){ RD.mat = false; dire("Réseau indisponible"); });
  }
  Array.prototype.forEach.call(z.querySelectorAll("[data-m]"), function(a){ a.onclick = function(e){ e.preventDefault(); rdDiscussion(RD_PLAN, a.getAttribute("data-m")); }; });
  Array.prototype.forEach.call(z.querySelectorAll("[data-r]"), function(a){ a.onclick = function(e){ e.preventDefault(); confirmerOuiNon("Retirer ce point ?", function(){ dire("Retrait en cours"); if(fictif){ materialiser(a.getAttribute("data-r"), {}, ""); return; } ecrire({action: "rd_point_retirer", session: sessionGardee(), departement: RD.dep, id: a.getAttribute("data-r")}); }, false); }; });
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
      : '<div class="rdl2"><div class="rdtx">'+rdPuces(p.texte)+'</div>'+rdIcones("data-m",rdE(p.id),"data-r",rdE(p.id))+'</div>')+'</div>'; }).join("");
  if(edition === "nouveau") h += '<div class="rdp"><small>Nouveau point de base</small><textarea class="rdzone" id="rdtx" maxlength="400" rows="3" placeholder="Écrire le point"></textarea><div class="rdact"><a href="#" id="rdok">Enregistrer</a><a href="#" id="rdno">Annuler</a></div></div>';
  h += '<div class="rdgrid"><button type="button" class="rdsoft" id="rdadd">Ajouter un point de base</button><button type="button" class="rdsoft" id="rdfin">Retour aux points de la réunion</button></div>';
  h += '<div class="rdp"><small style="text-transform:none;letter-spacing:0;font-size:13px;line-height:1.4">Ces points de base servent de départ à chaque nouvelle réunion. Ils ne changent pas la réunion en cours.</small></div><div id="rdm"></div>';
  z.innerHTML = h;
  var dire = function(t){ var m = document.getElementById("rdm"); if(m) m.innerHTML = rdMsg(t); };
  function appliquer(r){ if(r && r.ok){ rdBase(r); dire(rdHeureEnreg()); } else dire((r && r.erreur) || "Non enregistré · réessayez"); }
  function materialiser(exclure, remplace, texteNouveau){
    if(RD.mat) return; RD.mat = true;
    var liste = RD_DEMO_PTS.filter(function(p){ return "demo-"+p.n !== exclure; }).map(function(p){ return "demo-"+p.n === remplace.id ? remplace.texte : p.texte; });
    if(texteNouveau) liste.push(texteNouveau);
    var suite = Promise.resolve(null);
    liste.forEach(function(t){ suite = suite.then(function(){ return appelService({action: "rd_base_ecrire", session: sessionGardee(), departement: RD.dep, id: "", texte: t}); }); });
    suite.then(function(r){ RD.mat = false; appliquer(r); }).catch(function(){ RD.mat = false; dire("Réseau indisponible"); });
  }
  Array.prototype.forEach.call(z.querySelectorAll("[data-m]"), function(a){ a.onclick = function(e){ e.preventDefault(); rdBase(donnees, a.getAttribute("data-m")); }; });
  Array.prototype.forEach.call(z.querySelectorAll("[data-r]"), function(a){ a.onclick = function(e){ e.preventDefault(); confirmerOuiNon("Retirer ce point ?", function(){ dire("Retrait en cours"); if(fictif){ materialiser(a.getAttribute("data-r"), {}, ""); return; } appelService({action: "rd_base_retirer", session: sessionGardee(), departement: RD.dep, id: a.getAttribute("data-r")}).then(appliquer).catch(function(){ dire("Réseau indisponible"); }); }, false); }; });
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
    (h.length ? h.map(function(p){ return '<div class="rdp"><small>Point '+rdE(p.n)+' · '+rdE(p.etat || "")+(p.modifie ? ' · '+rdE(p.modifie) : '')+(p.par ? ' · '+rdE(p.par) : '')+'</small><div>'+rdPuces(p.texte)+'</div></div>'; }).join("") : rdMsg("Aucun ancien point")) + '</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); RD.vue = "discussion"; rdPlanif(); };
}

// Capsules communes aux trois départements: capsule du mois en haut, puis les prochaines.
var RD_CAP = null, RD_CAP_MSG = {};
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
  h += '<div id="rdcd"></div>';
  z.innerHTML = h;
  Array.prototype.forEach.call(z.querySelectorAll("[data-s]"), function(a){ a.onclick = function(e){ e.preventDefault(); RD.capSel = Number(a.getAttribute("data-s")); rdCapsules(donnees); }; });
  if(d) rdCapsuleEdit(d.n, "rdcd");
  Array.prototype.forEach.call(z.querySelectorAll("[data-c]"), function(a){ a.onclick = function(e){ e.preventDefault(); rdCapsuleEdit(Number(a.getAttribute("data-c"))); }; });
}
function rdCapsuleEdit(n, zone){
  var cap = (RD_CAP && RD_CAP.liste || []).filter(function(x){ return x.n === n; })[0] || (RD_CAP && RD_CAP.courante && RD_CAP.courante.n === n ? RD_CAP.courante : null);
  if(!cap) return;
  var pts = (cap.points || []).map(function(p){ return {t: p.t, statut: p.statut}; });
  var editT = "";
  var edit = -1;   // même mode de modification que Planification discussion: Modifier / Retirer à droite de chaque point, grille 2×2
  function sauver(){ dire("Enregistrement en cours"); appelService({action: "rd_capsule_modifier", session: sessionGardee(), n: n, titre: cap.titre, theme: cap.theme, points: pts.filter(function(p){ return String(p.t).trim(); })}).then(function(r){ if(r && r.ok){ RD_CAP = r; RD_CAP_MSG[n] = rdHeureEnreg(); dire(RD_CAP_MSG[n]); } else dire((r && r.erreur) || "Non enregistré · réessayez"); }).catch(function(){ dire("Réseau indisponible"); }); }
  function dire(t){ var m = document.getElementById("rdm"); if(m) m.innerHTML = rdMsg(t); }
  function dessiner(){
    function entete(champ, cls, st){ var v = cap[champ] || "";
      if(editT === champ) return '<div class="rdp"><textarea class="rdzone" id="rdtt" maxlength="120" rows="2">'+rdE(v)+'</textarea><div class="rdact"><a href="#" id="rdtok">Enregistrer</a><a href="#" id="rdtno">Annuler</a></div></div>';
      return '<div class="rdl2" style="'+st+'"><div class="'+cls+'">'+(champ === "theme" ? 'Capsule '+rdE(n)+' sur 11 · ' : '')+rdE(v)+'</div><div class="rdact"><a href="#" class="rdic" data-t="'+champ+'" aria-label="Modifier"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M16 1h6v6h-6zM10 7h6v6h-6zM4 13h6v6h-6zM2 20h20v3h-20z"/></svg></a></div></div>'; }
    var h = '<div style="margin-top:22px"></div>' + entete("theme", "rdsm", "margin-bottom:6px") + entete("titre", "rdcapt", "margin-bottom:12px");
    h += pts.map(function(p, i){
      return '<div class="rdp"><small>Point '+(i + 1)+(p.statut === "à valider" ? ' · <span style="white-space:nowrap">à valider</span>' : '')+'</small>' + (edit === i
        ? '<textarea class="rdzone" id="rdtx" maxlength="300" rows="3">'+rdE(p.t)+'</textarea><div class="rdact"><a href="#" id="rdok">Enregistrer</a><a href="#" id="rdno">Annuler</a></div>'
        : '<div class="rdl2"><div class="rdtx">'+rdPuces(p.t)+'</div>'+rdIcones("data-m",i,"data-x",i)+'</div>' + (p.statut === "à valider" ? '<div class="rdact"><a href="#" data-v="'+i+'">Valider</a></div>' : '')) + '</div>';
    }).join("");
    if(edit === pts.length) h += '<div class="rdp"><small>Nouveau point</small><textarea class="rdzone" id="rdtx" maxlength="300" rows="3" placeholder="Écrire le point"></textarea><div class="rdact"><a href="#" id="rdok">Enregistrer</a><a href="#" id="rdno">Annuler</a></div></div>';
    h += '<div class="rdgrid">' + (pts.length < 5 ? '<button type="button" class="rdsoft" id="rdca">Ajouter un point</button>' : '<span></span>') + '<span></span></div><div id="rdm"></div>';
    document.getElementById(zone || "rdz").innerHTML = h;
    Array.prototype.forEach.call(document.querySelectorAll("#"+(zone || "rdz")+" [data-m]"), function(a){ a.onclick = function(e){ e.preventDefault(); edit = Number(a.getAttribute("data-m")); dessiner(); }; });
    Array.prototype.forEach.call(document.querySelectorAll("#"+(zone || "rdz")+" [data-x]"), function(a){ a.onclick = function(e){ e.preventDefault(); confirmerOuiNon("Retirer ce point ?", function(){ pts.splice(Number(a.getAttribute("data-x")), 1); edit = -1; dessiner(); sauver(); }, false); }; });
    Array.prototype.forEach.call(document.querySelectorAll("#"+(zone || "rdz")+" [data-v]"), function(a){ a.onclick = function(e){ e.preventDefault(); pts[Number(a.getAttribute("data-v"))].statut = "valide"; dessiner(); sauver(); }; });
    Array.prototype.forEach.call(document.querySelectorAll("#"+(zone || "rdz")+" [data-t]"), function(a){ a.onclick = function(e){ e.preventDefault(); editT = a.getAttribute("data-t"); edit = -1; dessiner(); }; });
    var tok = document.getElementById("rdtok"), tno = document.getElementById("rdtno");
    if(tno) tno.onclick = function(e){ e.preventDefault(); editT = ""; dessiner(); };
    if(tok) tok.onclick = function(e){ e.preventDefault(); var v = document.getElementById("rdtt").value.trim(); if(!v){ dire("Écrivez le titre"); return; } cap[editT] = v; editT = ""; dessiner(); sauver(); };
    var ok = document.getElementById("rdok"), no = document.getElementById("rdno");
    if(no) no.onclick = function(e){ e.preventDefault(); edit = -1; dessiner(); };
    if(ok) ok.onclick = function(e){ e.preventDefault(); var t = document.getElementById("rdtx").value.trim(); if(!t){ dire("Écrivez le point"); return; } if(edit === pts.length) pts.push({t: t, statut: "valide"}); else pts[edit].t = t; edit = -1; dessiner(); sauver(); };
    var ca = document.getElementById("rdca"); if(ca) ca.onclick = function(){ edit = pts.length; dessiner(); };
    if(RD_CAP_MSG[n]) dire(RD_CAP_MSG[n]);
  }
  if(!zone){
    app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+rdE(rdTitreDep())+'</h1>'+rdBarre()+'<div id="rdz"></div></div>';
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); RD.vue = "capsule"; rdPlanif(); };
    rdMenuLier("cap");
  }
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
// RÈGLE UNIVERSELLE: une liste qui porte une date l'affiche en colonnes Date | Cas (description dessous) | Étape.
function rdEstDate(t){ return /^\d{4}-\d{2}-\d{2}/.test(String(t || "")); }
function rdListeDates(L, descs, col3, col2){
  var g = "display:grid;grid-template-columns:26% 44% 30%;gap:0 8px;";
  return '<div class="rdp" style="'+g+'font-size:10px;letter-spacing:.14em;color:#6E6350;text-transform:uppercase"><span>Date</span><span>'+(col2 || "Cas")+'</span><span>'+(col3 || "Étape")+'</span></div>'+L.map(function(c, i){
    var d = c[0], cas = c[1], etape = c.length > 3 ? c[3] : (c.length > 2 ? c[2] : ""), desc = c.length > 3 ? c[2] : "";
    return '<div class="rdp" style="'+g+'font-size:13px'+(descs && i > 0 && descs[i-1] ? ';margin-top:18px' : '')+'"><span>'+rdE(String(d).slice(0, 10))+'</span><span>'+rdE(col3 === "Montant" ? String(cas).replace(/^\s*dossier\s*/i, "") : cas)+(desc ? '<div style="color:#6E6350">'+rdE(desc)+'</div>' : "")+'</span><span>'+rdE(etape)+'</span></div>'+rdDescLigne(descs && descs[i]); }).join("");
}
// Escomptes prévisibles: description d'analyse (colonne « description » de credits.csv), petit texte sous le cas; cachée si vide, jamais de nom de patient.
function rdDescLigne(d){
  if(d == null || d === "") return "";
  var nett = function(t){ return String(t == null ? "" : t).replace(/\s+/g, " ").trim(); };
  var l = [];
  if(typeof d === "string"){
    d.split("|").forEach(function(p){ p = nett(p); if(!p) return; var m = /^(analyse|travail effectu[ée])\s*:\s*(.*)$/i.exec(p); l.push(m ? [/^a/i.test(m[1]) ? "Analyse" : "Travail effectué", m[2]] : ["", p]); });
  } else { l = [["Analyse", nett(d.analyse)], ["Travail effectué", nett(d.travail)]]; }
  return l.filter(function(x){ return x[1]; }).map(function(x){ return '<div class="rdp" style="font-size:12px;color:#6E6350;padding-top:0;overflow-wrap:anywhere">'+(x[0] ? '<span style="letter-spacing:.08em;text-transform:uppercase;font-size:10px">'+x[0]+'</span><br>' : "")+rdE(x[1])+'</div>'; }).join("");
}
function rdLigne(cols){ return '<div class="rdp" style="display:flex;gap:10px;flex-wrap:wrap"><span>'+cols.map(rdE).join('</span><span>')+'</span></div>'; }
function rdCourbe(a, b){
  // Courbe SVG: trait noir = année en cours, pointillé = an passé. Valeurs en chiffres, jamais de noms. Un mois sans donnée (null) n'est pas dessiné: la courbe s'interrompt, jamais de zéro inventé.
  var W = 320, H = 110, px = 14, py = 14, n = a.length, max = 1;
  var nul = function(x){ return x == null || x.v == null; };
  a.forEach(function(x){ max = Math.max(max, +x.v || 0); }); (b || []).forEach(function(x){ max = Math.max(max, +x.v || 0); });
  function xy(arr, k){ return [(px + (n > 1 ? k*(W-2*px)/(n-1) : 0)).toFixed(1), (H-py-((+arr[k].v || 0)/max)*(H-2*py)).toFixed(1)]; }
  function segments(arr){ var out = [], cur = []; for(var k = 0; k < n; k++){ if(!arr[k] || nul(arr[k])){ if(cur.length) out.push(cur); cur = []; } else cur.push(xy(arr, k).join(",")); } if(cur.length) out.push(cur); return out; }
  function lignes(arr, attr){ return segments(arr).map(function(sg){ return sg.length > 1 ? '<polyline points="'+sg.join(" ")+'" fill="none" '+attr+'/>' : ""; }).join(""); }
  var avecB = b && b.length >= n && b.some(function(x){ return !nul(x); });
  var lab = a.map(function(x, k){ return (n <= 12 || (n - 1 - k) % 2 === 0) ? '<text x="'+(px + (n > 1 ? k*(W-2*px)/(n-1) : 0)).toFixed(1)+'" y="'+(H-2)+'" font-size="7" text-anchor="middle" fill="#6E6350">'+rdE(x.m)+'</text>' : ""; }).join("");
  var pts = a.map(function(x, k){ if(nul(x)) return ""; var p = xy(a, k); return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2" fill="#1D1D1B"/>'; }).join("");
  var kd = -1; for(var q = n - 1; q >= 0; q--){ if(!nul(a[q])){ kd = q; break; } }
  var dern = kd >= 0 ? xy(a, kd) : null;
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Courbe" style="display:block;margin:6px 0 10px"><line x1="'+px+'" y1="'+(H-py)+'" x2="'+(W-px)+'" y2="'+(H-py)+'" stroke="#B4AB9B" stroke-width="1"/>'
    + (avecB ? lignes(b, 'stroke="#1D1D1B" stroke-width="1.5" stroke-dasharray="3 3" opacity=".55"') : "")
    + lignes(a, 'stroke="#1D1D1B" stroke-width="2"') + pts
    + (dern ? '<text x="'+dern[0]+'" y="'+(parseFloat(dern[1])-6)+'" font-size="9" text-anchor="end" fill="#1D1D1B">'+rdE(a[kd].v)+'</text>' : "") + lab + '</svg>'
    + (avecB ? '<div class="rdp"><small>Trait plein · cette année · pointillé · an passé</small></div>' : "");
}
function rdSerie(titre, a, b){
  if(!a || !a.length) return "";
  return '<small>'+rdE(titre)+'</small>' + rdCourbe(a, b);
}
// Ordre fixe des équipes (règle permanente): communes d'abord; une équipe sans donnée garde sa ligne.
var RD_ORDRE = {"Acrylique": ["Modèle", "Numérisation", "Montage", "Injection", "Finition"], "Fixe": ["Modèle", "Numérisation", "Modélisation", "Céramique"], "Pièce": ["Modèle", "Analyse", "Numérisation", "Modélisation", "Finition"]};
function rdNorm(t){ return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
function rdOrdreEquipes(eq){
  var ordre = RD_ORDRE[RD.dep]; if(!ordre) return eq;
  var out = ordre.map(function(n){ var f = null; eq.forEach(function(e){ if(!f && rdNorm(e.equipe) === rdNorm(n)) f = e; }); return f || {equipe: n, jours: [], vide: true}; });
  eq.forEach(function(e){ if(!ordre.some(function(n){ return rdNorm(n) === rdNorm(e.equipe); })) out.push(e); });
  return out;
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
    eq = rdOrdreEquipes(eq);
    var avecAn = eq.some(function(e){ return e.an_passe != null; });
    var jl = (r.etiquettes && r.etiquettes.length === 5) ? r.etiquettes.map(function(t){ return String(t).toLowerCase() === "aujourd’hui" || String(t).toLowerCase() === "aujourd'hui" ? "Aujourd’hui" : String(t).toLowerCase(); }) : (function(){ var o = [], d = new Date(); while(o.length < 5){ var w = d.getDay(); if(!o.length || (w !== 0 && w !== 6)) { try { o.push(o.length ? new Intl.DateTimeFormat("fr-CA", {timeZone: "America/Toronto", weekday: "long"}).format(d) : "Aujourd’hui"); } catch(x){ o.push("Jour "+(o.length + 1)); } } d = new Date(d.getTime() + 864e5); } return o; })();
    h += '<div class="rdp"><small>Pourcentage de charge · 5 prochains jours'+(avecAn ? ' · même mois de l’an passé' : '')+'</small></div>';
    var cel = function(j){ if(j === "—" || j == null || j === "") return '<span style="flex:1;text-align:center;font-size:13px;padding:10px 0;box-sizing:border-box">—</span>'; var rouge = j > 95, vert = !rouge && j >= 65; return '<span style="flex:1;text-align:center;font-size:13px;padding:10px 0;box-sizing:border-box;white-space:nowrap;'+(rouge ? "background:#B8473A;color:#fff" : (vert ? "background:#8EFF60;color:#1D1D1B" : "")) +'">'+rdE(j)+' %</span>'; };
    h += '<div class="rdp" style="display:flex;font-size:9px;letter-spacing:.04em;color:#6E6350"><span style="width:26%"></span><span style="flex:1;display:flex">'+jl.map(function(t){ return '<span style="flex:1;text-align:center">'+rdE(t)+'</span>'; }).join("")+'</span></div>';
    h += eq.map(function(e){ var js = e.vide ? ["—","—","—","—","—"] : (e.jours || []); return '<div class="rdp" style="display:flex;align-items:center;padding-top:0;padding-bottom:0"><span style="width:26%;font-size:13px">'+rdE(e.equipe)+'</span><span style="flex:1;display:flex">'+[0,1,2,3,4].map(function(k){ return cel(js[k]); }).join("")+'</span></div>'; }).join("");
    h += '<div class="rdp"><small>Vert 65 à 95 % · Brique plus de 95 %</small></div>';
    return h;
  }
  h += rdSerie(cle === "cas" ? "Cas non complétés par mois" : (cle === "nc" ? "Non-conformités par mois" : "Nombre de crédits par mois"), r.serie, r.serie_an_passe);
  var L = r.lignes || [];
  h += L.length ? (L.every(function(l){ return l && l.length > 1 && rdEstDate(l[0]); }) ? rdListeDates(L, cle === "escomptes" ? r.descriptions : null, cle === "escomptes" ? "Montant" : "", cle === "escomptes" ? "Dossier" : "") : L.map(function(l){ return rdLigne(l); }).join("")) : (h ? "" : rdMsg("Aucune donnée pour cette période"));
  return h;
}
function rdPresentation(){
  if(!rdPeutPlanifier()){ rdPoints(); return; }
  var h = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+rdE(rdTitreDep())+'</h1>';
  h += rdMenuHtml("pres");
  h += '<div class="chx" id="rdch">'+RD_DEPS.map(function(d){ return '<button type="button" data-d="'+rdE(d)+'" aria-pressed="'+(d === RD.dep ? "true" : "false")+'">'+rdE(d)+'</button>'; }).join("")+'</div>';
  h += '<div class="rddate">'+rdE(rdAujourdhui())+'</div>';
  h += rdDemoMarque();
  var mois18 = rdMois18(); if(!RD.moisSel) RD.moisSel = mois18[0].cle;
  var moisLib = ""; mois18.forEach(function(m){ if(m.cle === RD.moisSel) moisLib = m.lib; });
  h += '<div class="rdp"><small style="color:#6f6a5f">Période des chiffres</small><div class="rdbtn"><button type="button" class="rdplan" id="rdper" aria-expanded="false">'+rdE(moisLib)+'</button><div id="rdpl" style="display:none;background:#E3DFD3;border:2px solid #0d1117;margin-top:4px;max-height:280px;overflow-y:auto">'+mois18.map(function(m){ return '<a href="#" data-mo="'+m.cle+'" style="display:block;padding:14px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#1D1D1B;text-decoration:none;'+(m.cle === RD.moisSel ? "background:#8EFF60;" : "")+'">'+rdE(m.lib)+'</a>'; }).join("")+'</div></div></div>';
  var blk = 0;
  function bloc(inner){ return '<div class="rdblk">'+inner+'</div>'; }
  h += bloc('<div id="rds-pts">'+(rdCacheLire("ldld-rdp-"+RD.dep) ? rdPointsHtml(rdCacheLire("ldld-rdp-"+RD.dep)) : rdMsg("Un instant"))+'</div>');
  h += RD_SECTIONS.map(function(s){ return bloc('<div class="rdt">'+rdE(s[1].slice(0, 2))+' <span>'+rdE(s[1].slice(3))+'</span></div><div id="rds-'+s[0]+'">'+rdInit(s[0])+'</div>') + (s[0] === "cas" && typeof ccBlocPresentation === "function" ? ccBlocPresentation() : ""); }).join("");
  h += bloc('<div class="rdt">04 <span>Capsule du mois</span></div><div id="rds-cap">'+(function(){ var c = rdCacheLire("ldld-rdp-"+RD.dep); return c && c.capsule ? rdCapHtml(c.capsule) : rdMsg("Un instant"); })()+'</div>') + '</div>';
  app.innerHTML = h;
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  rdMenuLier("pres");
  Array.prototype.forEach.call(app.querySelectorAll("#rdch button"), function(bt){ bt.onclick = function(){ RD.dep = bt.getAttribute("data-d"); try { localStorage.setItem("ldld-rd-dep", RD.dep); } catch(e){} rdPresentation(); }; });
  if(typeof ccPresentation === "function") ccPresentation();
  function chargerChiffres(){
    var per = RD.periode || {t:"mois"};
    RD_SECTIONS.forEach(function(s){
      var z0 = document.getElementById("rds-"+s[0]); if(z0) z0.innerHTML = rdInit(s[0]);
      appelService({action: "rd_chiffres", session: sessionGardee(), section: s[0], departement: RD.dep, periode: per.t, du: per.du || "", au: per.au || ""}).then(function(r){ var z = document.getElementById("rds-"+s[0]), ck = rdCacheCle(s[0]); if(r && r.ok && !r.attente && !(s[0] === "charge" && !(r.equipes || []).length)) rdCacheEcrire(ck, r); else { var c = rdCacheLire(ck); if(c && c.ok) r = c; } if(z) z.innerHTML = rdRendreSection(s[0], r); }).catch(function(){ var z = document.getElementById("rds-"+s[0]); if(z && !RD_DEMO) z.innerHTML = rdMsg("Réseau indisponible"); });
    });
  }
  var sp = document.getElementById("rdper"), sl = document.getElementById("rdpl");
  if(sp && sl){
    sp.onclick = function(){ var ouv = sl.style.display !== "none"; sl.style.display = ouv ? "none" : "block"; sp.setAttribute("aria-expanded", ouv ? "false" : "true"); };
    Array.prototype.forEach.call(sl.querySelectorAll("a"), function(x){ x.onclick = function(e){ e.preventDefault(); var c = x.getAttribute("data-mo"); sl.style.display = "none"; sp.setAttribute("aria-expanded", "false"); if(c === RD.moisSel) return; RD.moisSel = c; mois18.forEach(function(m){ if(m.cle === c){ sp.textContent = m.lib; RD.periode = {t: m === mois18[0] ? "mois" : "dates", du: m.du, au: m.au}; } }); Array.prototype.forEach.call(sl.querySelectorAll("a"), function(y){ y.style.background = y.getAttribute("data-mo") === c ? "#8EFF60" : ""; }); chargerChiffres(); }; });
    var m0 = mois18[0]; if(!RD.periode || RD.periode.t === "an") RD.periode = {t: "mois", du: m0.du, au: m0.au};
    mois18.forEach(function(m){ if(m.cle === RD.moisSel) RD.periode = {t: m === m0 ? "mois" : "dates", du: m.du, au: m.au}; });
  }
  chargerChiffres();
  appelService({action: "rd_points_lire", session: sessionGardee(), departement: RD.dep}).then(function(r){ if(r && r.ok !== false && (r.points || r.capsule)) rdCacheEcrire("ldld-rdp-"+RD.dep, r); var zp = document.getElementById("rds-pts"); if(zp) zp.innerHTML = rdPointsHtml(r); var z = document.getElementById("rds-cap"); if(!z) return; var c = (r && r.capsule) || (RD_DEMO ? RD_DEMO_CAPS : null); z.innerHTML = c ? '<div class="rdp"><b>'+rdE(c.titre || "")+'</b>'+(c.points || []).map(function(p){ return rdPuces(p); }).join("")+'</div>' : rdMsg("Capsule non disponible"); }).catch(function(){ var zp = document.getElementById("rds-pts"), zc = document.getElementById("rds-cap"); if(zp && !RD_DEMO) zp.innerHTML = rdMsg("Réseau indisponible"); if(zc && !RD_DEMO) zc.innerHTML = rdMsg("Réseau indisponible"); });
}
