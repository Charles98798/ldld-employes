// Rencontre de département, étape 1: points de discussion (lecture pour tous, planification pour Gestionnaire + Direction) et capsules communes.
// Services: rd_points_lire (tous), rd_planif_lire / rd_point_ecrire / rd_point_retirer / rd_points_publier (Gestionnaire + Direction),
// rd_capsules_lire / rd_capsule_modifier / rd_capsule_presenter (Gestionnaire + Direction). Le service refuse aussi l'accès (catégorie Gestionnaire ou Direction, jamais Expert technique).
var RD = {dep: "", planif: false, vue: "discussion"};
var RD_DEPS = ["Acrylique", "Fixe", "Pièce"];
function rdPeutPlanifier(){ return !!(MOI && (MOI.role === "direction" || MOI.role === "responsable")); }
function rdE(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function rdMsg(txt){ return '<div class="bandeau">▪ '+rdE(String(txt).toUpperCase())+'</div>'; }
function rdErreur(r){ var e = r && r.erreur ? String(r.erreur) : ""; return rdMsg(e || "Indisponible · réessayez"); }
function rdTitreDep(){ return "Département " + RD.dep; }

// Choix du département (une réunion séparée par département).
function rencontreDept(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Rencontre de département</h1><div class="rdl">' +
    RD_DEPS.map(function(d){ return '<a href="#" class="rdd" data-d="'+rdE(d)+'">'+rdE(d)+'</a>'; }).join("") + '</div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  Array.prototype.forEach.call(app.querySelectorAll(".rdd"), function(a){ a.onclick = function(e){ e.preventDefault(); RD.dep = a.getAttribute("data-d"); rdPoints(); }; });
}

// Vue des points publiés (tous les employés connectés).
function rdPoints(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+rdE(rdTitreDep())+'</h1><div id="rdz"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); rencontreDept(); };
  appelService({action: "rd_points_lire", session: sessionGardee(), departement: RD.dep}).then(function(r){
    var z = document.getElementById("rdz"); if(!z) return;
    if(!r || !r.ok){ z.innerHTML = rdErreur(r); return; }
    var h = "";
    if(r.planif !== undefined ? r.planif : rdPeutPlanifier()) h += '<div class="rdbtn"><button type="button" class="rdplan" id="rdplan">Planification</button></div>';
    if(r.date) h += '<div class="rddate">'+rdE(r.date)+'</div>';
    h += '<div class="rdt">01 <span>Points de discussion</span></div>';
    var pts = r.points || [];
    h += pts.length ? pts.map(function(p){ return '<div class="rdp"><small>Point '+rdE(p.n)+'</small><div>'+rdE(p.texte)+'</div></div>'; }).join("") : rdMsg("Aucun point publié pour le moment");
    z.innerHTML = h;
    var b = document.getElementById("rdplan"); if(b) b.onclick = function(){ RD.vue = "discussion"; rdPlanif(); };
  }).catch(function(){ var z = document.getElementById("rdz"); if(z) z.innerHTML = rdMsg("Réseau indisponible"); });
}

// Planification: barre noire avec liste déroulante Discussion / Capsule.
function rdBarre(){
  return '<div class="rdbar"><span>Planification</span><select id="rdsel" aria-label="Discussion ou capsule"><option value="discussion"'+(RD.vue === "discussion" ? " selected" : "")+'>Discussion</option><option value="capsule"'+(RD.vue === "capsule" ? " selected" : "")+'>Capsule</option></select></div>';
}
function rdPlanif(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+rdE(rdTitreDep())+'</h1>'+rdBarre()+'<div id="rdz"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); rdPoints(); };
  document.getElementById("rdsel").onchange = function(){ RD.vue = this.value; if(RD.vue === "capsule") rdCapsules(); else rdPlanif(); };
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
  var pts = donnees.points || [], h = "";
  if(donnees.date) h += '<div class="rddate">'+rdE(donnees.date)+'</div>';
  h += pts.map(function(p){
    var enEdit = edition === p.id;
    return '<div class="rdp">'+'<small>Point '+rdE(p.n)+(p.etat === "brouillon" ? ' · brouillon' : '')+'</small>' + (enEdit
      ? '<textarea class="rdzone" id="rdtx" maxlength="400" rows="3">'+rdE(p.texte)+'</textarea><div class="rdact"><a href="#" id="rdok">Enregistrer</a><a href="#" id="rdno">Annuler</a></div>'
      : '<div class="rdl2"><div class="rdtx">'+rdE(p.texte)+'</div><div class="rdact"><a href="#" data-m="'+rdE(p.id)+'">Modifier</a><a href="#" data-r="'+rdE(p.id)+'">Retirer</a></div></div>') + '</div>';
  }).join("");
  if(!pts.length && edition !== "nouveau") h += rdMsg("Aucun point pour la prochaine rencontre");
  if(edition === "nouveau") h += '<div class="rdp"><small>Nouveau point</small><textarea class="rdzone" id="rdtx" maxlength="400" rows="3" placeholder="Écrire le point"></textarea><div class="rdact"><a href="#" id="rdok">Enregistrer</a><a href="#" id="rdno">Annuler</a></div></div>';
  h += '<div class="rdstack"><button type="button" class="rdsoft" id="rdadd">Ajouter un point</button><button type="button" class="rdsoft" id="rdpub">Publier aux employés</button><button type="button" class="rdline" id="rdhist">Historique</button></div><div id="rdm"></div>';
  z.innerHTML = h;
  var dire = function(t){ var m = document.getElementById("rdm"); if(m) m.innerHTML = rdMsg(t); };
  function appliquer(r){ if(r && r.ok){ RD_PLAN = r; rdDiscussion(r); } else dire((r && r.erreur) || "Non enregistré · réessayez"); }
  function ecrire(corps){ appelService(corps).then(appliquer).catch(function(){ dire("Réseau indisponible"); }); }
  Array.prototype.forEach.call(z.querySelectorAll("[data-m]"), function(a){ a.onclick = function(e){ e.preventDefault(); rdDiscussion(RD_PLAN, a.getAttribute("data-m")); }; });
  Array.prototype.forEach.call(z.querySelectorAll("[data-r]"), function(a){ a.onclick = function(e){ e.preventDefault(); dire("Retrait en cours"); ecrire({action: "rd_point_retirer", session: sessionGardee(), departement: RD.dep, id: a.getAttribute("data-r")}); }; });
  var ok = document.getElementById("rdok"), no = document.getElementById("rdno");
  if(no) no.onclick = function(e){ e.preventDefault(); rdDiscussion(RD_PLAN); };
  if(ok) ok.onclick = function(e){ e.preventDefault(); var t = document.getElementById("rdtx").value.trim(); if(!t){ dire("Écrivez le point"); return; } dire("Enregistrement en cours"); ecrire({action: "rd_point_ecrire", session: sessionGardee(), departement: RD.dep, id: edition === "nouveau" ? "" : edition, texte: t}); };
  document.getElementById("rdadd").onclick = function(){ rdDiscussion(RD_PLAN, "nouveau"); };
  document.getElementById("rdpub").onclick = function(){ dire("Publication en cours"); appelService({action: "rd_points_publier", session: sessionGardee(), departement: RD.dep}).then(function(r){ if(r && r.ok){ RD_PLAN = r; rdDiscussion(r); var m = document.getElementById("rdm"); if(m) m.innerHTML = rdMsg("Publié aux employés"); } else dire((r && r.erreur) || "Non publié · réessayez"); }).catch(function(){ dire("Réseau indisponible"); }); };
  document.getElementById("rdhist").onclick = function(){ rdHistorique(); };
}
function rdHistorique(){
  var h = RD_PLAN && RD_PLAN.historique || [];
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Historique</h1><div class="rddate">'+rdE(rdTitreDep())+'</div>' +
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
  if(c){
    h += '<div class="rdsm">Réunion du mois · capsule '+rdE(c.n)+' sur 11 · '+rdE(c.theme || "")+'</div><div class="rdcap"><div class="rdcapt">'+rdE(c.titre)+'</div>' +
      (c.points || []).map(function(p, i){ return '<div class="rdcl"><small>0'+(i + 1)+'</small> '+rdE(p.t)+(p.statut === "à valider" ? ' <em>à valider</em>' : '')+'</div>'; }).join("") +
      '<div class="rdact"><a href="#" data-c="'+rdE(c.n)+'">Modifier</a></div></div>';
  }
  h += '<div class="rdsm">Prochaines capsules</div>' + (donnees.liste || []).filter(function(x){ return !c || x.n !== c.n; }).map(function(x){
    return '<div class="rdln"><span><small>'+(x.n < 10 ? "0" : "")+rdE(x.n)+'</small> '+rdE(x.titre)+(x.pret === false ? ' <em>en préparation</em>' : '')+'</span><a href="#" data-c="'+rdE(x.n)+'">Modifier</a></div>';
  }).join("");
  z.innerHTML = h;
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
  document.getElementById("rdsel").onchange = function(){ RD.vue = this.value; rdPlanif(); };
  dessiner();
}
