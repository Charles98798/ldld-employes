// Suivi des commentaires des employés (Direction + gestionnaires) et « Suivi de mes commentaires » (employé).
// Service: suivi_lire / suivi_maj / suivi_compte / suivi_mes. Aucun courriel, jamais. Statuts: A_TRAITER, EN_COURS, REGLE, PRIS_EN_NOTE.
["suivi_lire", "suivi_maj", "suivi_compte", "suivi_mes"].forEach(function(a){ NEUTRE[a] = 1; });
var SUIVI_LIB = {A_TRAITER: "À traiter", EN_COURS: "En cours", REGLE: "Réglé", PRIS_EN_NOTE: "Pris en note"};
var SUIVI_EMP = {A_TRAITER: "Reçu", EN_COURS: "En cours", REGLE: "Réglé", PRIS_EN_NOTE: "Pris en note"};
var SUIVI = {lignes: [], resp: [], ouvert: null};
function suiviDate(d){ var p = String(d || "").slice(0, 10).split("-"); if(p.length < 3) return String(d || ""); return +p[2]+" "+MOIS_LONGS[+p[1]-1].slice(0, 4).toLowerCase()+". "+p[0]; }
function suiviMin(t){ return typeof rdMin === "function" ? rdMin(t) : String(t || "").toLowerCase(); }
function suiviPastille(a, n){
  if(!a) return; var p = a.querySelector(".nombre"); if(p) p.remove();
  if(n){ p = document.createElement("span"); p.className = "nombre"; p.textContent = n; a.appendChild(p); }
}
// Pastille de l'Accueil: nombre de commentaires « À traiter » (Direction et gestionnaires) / nombre de réponses non lues (employé)
function suiviPastilles(){
  var a = app.querySelector('a[data-k="suivi_commentaires"]');
  if(a) appelService({action: "suivi_compte", session: sessionGardee()}).then(function(r){ if(!r || !r.ok) return; var t = app.querySelector('a[data-k="suivi_commentaires"]'); if(!t) return;
    Array.prototype.forEach.call(t.querySelectorAll(".sv-nv, .sv-tot"), function(e){ e.remove(); });
    if(r.nouveaux){ var v = document.createElement("span"); v.className = "nombre sv-nv"; v.textContent = r.nouveaux; t.appendChild(v); }   // vert: jamais vus
    if(r.a_traiter){ var k = document.createElement("span"); k.className = "nombre sv-tot"; k.textContent = r.a_traiter; k.style.cssText = "background:#000000;color:#ffffff"; t.appendChild(k); }   // noir: total « À traiter »
  }).catch(function(){});
  var b = app.querySelector('a[data-k="mes_commentaires"]');
  if(b) appelService({action: "suivi_mes", session: sessionGardee()}).then(function(r){ if(r && r.ok) suiviPastille(app.querySelector('a[data-k="mes_commentaires"]'), r.nouveaux); }).catch(function(){});
}
function suiviOuvrir(){
  app.innerHTML = '<div class="page" style="padding-bottom:90px"><a class="retour" href="#" id="retour">Retour</a><h1>Suivi des commentaires et changements</h1><div id="sv"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  appelService({action: "suivi_lire", session: sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0;
    SUIVI.lignes = r.lignes || []; SUIVI.resp = r.responsables || []; suiviDessiner();
  }).catch(function(){ var el = document.getElementById("sv"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function suiviDessiner(){
  var el = document.getElementById("sv"); if(!el) return;
  var n = SUIVI.lignes.filter(function(x){ return x.statut === "A_TRAITER"; }).length;
  if(!SUIVI.lignes.length){ el.innerHTML = '<div class="bandeau">▪ AUCUN COMMENTAIRE EN CE MOMENT</div>'; return; }
  el.innerHTML = '<div class="etq">▪ DU PLUS RÉCENT AU PLUS ANCIEN · '+SUIVI.lignes.length+' · À TRAITER '+n+'</div>' + SUIVI.lignes.map(function(x, i){
    return '<div class="carte" style="margin:10px 0;padding:12px 14px" data-i="'+i+'"><div class="etq" style="margin:0">'+(x.nouveau ? '<b class="nombre" style="margin-right:8px">Nouveau</b>' : "")+esc(x.nom || "—")+' · '+esc(suiviDate(x.date))+' · '+esc(x.section)+'</div>' +
      '<div style="margin:6px 0 8px;font-size:14px;line-height:1.35">'+esc(suiviMin(x.texte))+'</div>' +
      '<span class="lbl">En charge</span><select class="bx sv-ch" data-i="'+i+'" style="max-width:220px;margin-bottom:8px"><option value="">—</option>'+SUIVI.resp.concat(x.charge && SUIVI.resp.indexOf(x.charge) < 0 ? [x.charge] : []).map(function(n){ return '<option value="'+esc(n)+'"'+(n === x.charge ? " selected" : "")+'>'+esc(n)+'</option>'; }).join("")+'</select>' +
      '<span class="lbl">Statut</span><select class="bx sv-st" data-i="'+i+'" style="max-width:220px">'+Object.keys(SUIVI_LIB).map(function(k){ return '<option value="'+k+'"'+(k === x.statut ? " selected" : "")+'>'+SUIVI_LIB[k]+'</option>'; }).join("")+'</select>' +
      '<div class="sv-det" id="svd'+i+'"></div></div>';
  }).join("");
  Array.prototype.forEach.call(el.querySelectorAll(".sv-st"), function(s){ s.onchange = function(){ suiviChoisir(+s.getAttribute("data-i"), s.value); }; });
  Array.prototype.forEach.call(el.querySelectorAll(".sv-ch"), function(s){ s.onchange = function(){ var x = SUIVI.lignes[+s.getAttribute("data-i")]; x.charge = s.value; suiviEnvoyer(+s.getAttribute("data-i"), x.statut, x.action, x.echeance, x.reponse); }; });
  SUIVI.lignes.forEach(function(x, i){ if(x.statut !== "A_TRAITER" && x.statut !== "PRIS_EN_NOTE") suiviDetail(i, x.statut); else suiviResume(i); });
}
function suiviResume(i){ var x = SUIVI.lignes[i], d = document.getElementById("svd"+i); if(d) d.innerHTML = x.reponse ? '<div style="font-size:12px;color:#6E6350;margin-top:6px">'+esc(suiviMin(x.reponse))+'</div>' : ""; }
// Détail d'un commentaire: action et échéance (En cours), réponse d'une phrase (obligatoire seulement pour Réglé). Enregistrement automatique.
function suiviDetail(i, statut){
  var x = SUIVI.lignes[i], d = document.getElementById("svd"+i); if(!d) return;
  var h = "";
  if(statut === "EN_COURS" || statut === "REGLE") h += '<span class="lbl">Action prévue</span><input class="champ" id="sva'+i+'" maxlength="300" value="'+esc(x.action || "")+'" style="width:100%;box-sizing:border-box;margin:4px 0 8px">' +
    '<span class="lbl">Échéance</span><input class="champ" id="sve'+i+'" type="date" value="'+esc(x.echeance || "")+'" style="width:100%;box-sizing:border-box;margin:4px 0 8px">';
  if(statut === "REGLE") h += '<span class="lbl">Réponse à l\'employé (une phrase)</span><input class="champ'+(x.reponse ? "" : " oblig")+'" id="svr'+i+'" maxlength="300" value="'+esc(x.reponse || "")+'" style="width:100%;box-sizing:border-box;margin:4px 0 8px">';
  h += '<button type="button" class="bouton" id="svb'+i+'" style="margin:4px 0 0">Enregistrer</button><div class="etq" id="svm'+i+'" style="margin-top:6px"></div>';
  d.innerHTML = h;
  document.getElementById("svb"+i).onclick = function(){ suiviEnregistrer(i, statut); };
}
function suiviChoisir(i, statut){
  var x = SUIVI.lignes[i];
  if(statut === "A_TRAITER" || statut === "PRIS_EN_NOTE"){ suiviEnvoyer(i, statut, x.action, x.echeance, statut === "PRIS_EN_NOTE" ? "" : x.reponse); document.getElementById("svd"+i).innerHTML = ""; return; }
  suiviDetail(i, statut);
}
function suiviEnregistrer(i, statut){
  var g = function(p){ var e = document.getElementById(p+i); return e ? e.value : ""; }, rep = g("svr"), m = document.getElementById("svm"+i);
  if(statut === "REGLE" && !rep.trim()){ if(m) m.textContent = "Écrivez une réponse d’une phrase pour marquer Réglé."; return; }
  suiviEnvoyer(i, statut, g("sva"), g("sve"), rep);
}
function suiviEnvoyer(i, statut, action, echeance, reponse){
  var x = SUIVI.lignes[i], av = {s: x.statut, a: x.action, e: x.echeance, r: x.reponse};
  x.statut = statut; x.action = action || ""; x.echeance = echeance || ""; x.reponse = reponse || "";   // l'écran est à jour tout de suite, l'enregistrement se fait en arrière-plan
  var m = document.getElementById("svm"+i); if(m) m.textContent = "Enregistré à "+new Date().toLocaleTimeString("fr-CA", {hour: "2-digit", minute: "2-digit"});
  appelService({action: "suivi_maj", session: sessionGardee(), id: x.id, statut: statut, action: action || "", echeance: echeance || "", reponse: reponse || "", charge: x.charge || ""}).then(function(r){
    if(!r || !r.ok) throw r;
  }).catch(function(r){ x.statut = av.s; x.action = av.a; x.echeance = av.e; x.reponse = av.r; suiviDessiner(); var mm = document.getElementById("svm"+i); if(mm) mm.textContent = (r && r.erreur) || "Non enregistré. Réessayez."; });
}
// Vue employé: statut du commentaire et réponse de la Direction, sans nom, sans courriel.
function suiviMesOuvrir(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Mes commentaires et changements</h1><div id="sm"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  appelService({action: "suivi_mes", session: sessionGardee(), lu: true}).then(function(r){
    var el = document.getElementById("sm"); if(!el) return;
    if(!r || !r.ok) throw 0;
    if(!r.lignes.length){ el.innerHTML = '<div class="bandeau">▪ AUCUN COMMENTAIRE EN CE MOMENT</div>'; return; }
    el.innerHTML = r.lignes.map(function(x){
      return '<div class="carte" style="margin:10px 0;padding:12px 14px"><div class="etq" style="margin:0">Rencontre du '+esc(suiviDate(x.date))+' · '+esc(x.section)+'</div>' +
        '<div style="margin:6px 0 8px;font-size:14px;line-height:1.35">'+esc(suiviMin(x.texte))+'</div><b class="etq" style="font-weight:600;color:#000000">'+SUIVI_EMP[x.statut]+'</b>' +
        (x.reponse ? '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #B4AB9B;font-size:14px">'+esc(suiviMin(x.reponse))+'</div>' : "") + '</div>';
    }).join("");
  }).catch(function(){ var el = document.getElementById("sm"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
