// Échelle salariale de l'année suivante (Direction): taux, taux du marché, écart avec le marché, échelle, bonifications.
// Même logique que l'onglet « Échelle salariale — AAAA » du classeur: échelon = maximum de base de l'an passé × (1 + taux) × position. Calcul local instantané, écriture au classeur en arrière-plan (pont: ech_donnees, ech_enregistrer).
var ECH = {d: null, pre: null, preT: 0};
// Préchargement (Direction): la lecture est demandée dès l'accueil; ouverte dans les 3 minutes, la page s'affiche tout de suite.
function echPrecharger(){
  if(ECH.pre && Date.now() - ECH.preT < 180000) return;
  ECH.preT = Date.now();
  ECH.pre = appelService({action: "ech_donnees", session: sessionGardee()}).catch(function(){ ECH.pre = null; return null; });
}
function echEsc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function echArr(v, d){ var f = Math.pow(10, d); return Math.round(v*f + (v >= 0 ? 1e-7 : -1e-7)) / f; }
function echFr(v, d){ return v == null ? "" : echArr(v, d).toFixed(d).replace(".", ","); }
function echNum(t){ t = String(t == null ? "" : t).replace(/\s/g, "").replace("$", "").replace("%", "").replace(",", "."); if(t === "") return null; var n = Number(t); return isNaN(n) ? null : n; }
function echCase(id, v, suf, large){ return '<div class="echc"><input id="' + id + '" inputmode="decimal" autocomplete="off" class="' + (v == null ? "vide" : "") + '" value="' + echEsc(echFr(v, 2).replace(/,00$/, "").replace(/(,\d)0$/, "$1")) + '"><u>' + suf + '</u></div>'; }
function echOuvrir(){
  app.innerHTML = '<div class="page ppx ech"><h1>Échelle salariale \u2191\u00a0taux</h1><a class="retour" href="#" id="retour">Retour</a><div id="ech_app"><div class="bandeau" id="ech_att">▪ UN INSTANT</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  var pre = (ECH.pre && Date.now() - ECH.preT < 180000) ? ECH.pre : null; ECH.pre = null;
  var frais = function(){ return appelService({action: "ech_donnees", session: sessionGardee()}); };
  // Si la lecture préchargée tarde plus de 12 s, on refait une demande neuve (la première continue en arrière-plan).
  var fini = false;
  var base = (pre || frais()).then(function(r){ fini = true; return r; });
  var garde = new Promise(function(ok){ setTimeout(function(){ if(!fini) ok(frais()); }, 12000); });
  Promise.race([base, garde]).then(function(r){
    if(!document.getElementById("ech_app")) return;
    if(r && r.ok){ ECH.d = r.r; echRendu(); }
    else { var a = document.getElementById("ech_att"); if(a){ a.textContent = "▪ " + String((r && r.erreur) || "Échec").toUpperCase() + " · TOUCHEZ POUR RÉESSAYER"; a.onclick = echOuvrir; } }
  }).catch(function(){ var a = document.getElementById("ech_att"); if(a){ a.textContent = "▪ RÉSEAU INDISPONIBLE · TOUCHEZ POUR RÉESSAYER"; a.onclick = echOuvrir; } });
}
function echSauver(champ, valeur){
  var et = document.getElementById("ech_etat"); if(et) et.textContent = "Enregistrement…";
  appelService({action: "ech_enregistrer", champ: champ, valeur: valeur, session: sessionGardee()}).then(function(r){
    if(et) et.textContent = (r && r.ok) ? "Enregistré" : ((r && r.erreur) || "Échec de l'enregistrement.");
  }).catch(function(){ if(et) et.textContent = "Réseau indisponible."; });
}
function echGrille(){
  var d = ECH.d, t = d.taux == null ? 0 : d.taux / 100;
  var n = d.cats.length;
  // Jamais de grille décalée: le nombre de colonnes suit les catégories, et un écart de nombre de valeurs est refusé.
  if(!n || d.maxAvant.length !== n) return '<p class="finnote">Échelle non affichée : les catégories et les valeurs ne correspondent pas. Avisez le support.</p>';
  var np = d.positions.length + 1;
  var h = '<div class="e5" style="grid-template-columns:58px repeat(' + np + ',minmax(0,1fr));font-size:8.5px;letter-spacing:0"><div class="h"></div>' + d.positions.map(function(p){ return '<div class="h" style="padding:0">' + Math.round(p*100) + '&nbsp;%</div>'; }).join("") + '<div class="h" style="padding:0">Max.<br>base</div>';
  d.cats.forEach(function(c, k){
    var m = d.maxAvant[k];
    h += '<div class="l" style="font-size:8.5px;line-height:1.1;text-align:left">' + echEsc(c) + '</div>' + d.positions.map(function(p){ return '<div style="padding:0">' + echFr(echArr(m*(1+t)*p, 2), 2) + '</div>'; }).join("") + '<div class="mx" style="padding:0">' + echFr(m, 2) + '</div>';
  });
  h += '</div>';
  return h;
}
function echEcarts(){
  var d = ECH.d, t = d.taux == null ? 0 : d.taux / 100, h = "";
  d.ecarts.forEach(function(e, i){
    var med = echArr(e.maxAvant*(1+t)*e.posMediane, 2), ref = e.ref != null ? e.ref : e.refPasse, ec = ref ? (med / ref - 1) * 100 : null;
    h += '<div class="lab">' + echEsc(e.nom) + '</div><div class="tr"><span>Médiane de l’échelle</span><b>' + echFr(med, 2) + ' $</b></div>' +
      '<div class="tr"><span>Référence (Guichet-Emplois)</span>' + echCase("ech_ref" + i, e.ref, "$") + '</div>' +
      '<div class="tr"><span>Écart</span><b>' + (ec == null ? "—" : (ec >= 0 ? "+ " : "− ") + echFr(Math.abs(ec), 1) + " %") + '</b></div>';
  });
  return h;
}
function echSel(){
  var v = ECH.vue || "suiv";
  return '<div class="tgm" style="margin-bottom:10px"><button type="button" class="tgb' + (v === "act" ? " on" : "") + '" data-ev="act">Année en cours</button><button type="button" class="tgb' + (v === "suiv" ? " on" : "") + '" data-ev="suiv">Année suivante</button></div>';
}
function echSelLier(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-ev]"), function(b){ b.onclick = function(){ ECH.vue = b.getAttribute("data-ev"); echRendu(); }; });
}
function echActuelle(){
  var z = document.getElementById("ech_app");
  z.innerHTML = echSel() + '<div class="bandeau" id="ech_att">▪ UN INSTANT</div>'; echSelLier();
  var rendre = function(r){
    var E = null; ((r && r.r && r.r.echelles) || (r && r.echelles) || []).forEach(function(e){ if(e.actuelle) E = e; });
    if(!E){ z.innerHTML = echSel() + '<div class="bandeau">▪ ÉCHELLE EN COURS INDISPONIBLE</div>'; echSelLier(); return; }
    var np = E.echelons.length, cats = Object.keys(E.cats);
    var g = '<div class="band">Année en cours — ' + E.annee + '</div><div class="sect"><span class="num">04</span><span class="lab">Échelle salariale</span></div><div id="ech_grille"><div class="e5" style="grid-template-columns:58px repeat(' + np + ',minmax(0,1fr));font-size:8.5px;letter-spacing:0"><div class="h"></div>' +
      E.echelons.map(function(p){ return '<div class="h" style="padding:0">' + Math.round(p > 1 ? p : p*100) + '&nbsp;%</div>'; }).join("");
    cats.forEach(function(c){ g += '<div class="l" style="font-size:8.5px;line-height:1.1;text-align:left">' + echEsc(c) + '</div>' + E.cats[c].map(function(v){ return '<div style="padding:0">' + echFr(v, 2) + '</div>'; }).join(""); });
    z.innerHTML = echSel() + g + '</div></div>'; echSelLier();
  };
  if(ECH.act) rendre(ECH.act);
  else appelService({action: "embauche_donnees", session: sessionGardee()}).then(function(r){ ECH.act = r; rendre(r); }).catch(function(){ z.innerHTML = echSel() + '<div class="bandeau">▪ ÉCHELLE EN COURS INDISPONIBLE</div>'; echSelLier(); });
}
function echRendu(){
  if(ECH.vue === "act") return echActuelle();
  var d = ECH.d, h = echSel() + '<div class="band">Année suivante en préparation — ' + d.annee + '</div>';
  h += '<div class="sect"><span class="num">01</span><span class="lab">Taux d’augmentation applicable</span></div><div class="tr"><span>Taux d’augmentation</span>' + echCase("ech_taux", d.taux, "%") + '</div>';
  h += '<div class="sect"><span class="num">02</span><span class="lab">Taux du marché</span></div>' + d.marche.map(function(m, i){ return '<div class="tr"><span>' + echEsc(m.nom) + '</span>' + echCase("ech_mar" + i, m.val, "%") + '</div>'; }).join("");
  h += '<div class="sect"><span class="num">03</span><span class="lab">Écart de la grille avec le marché</span></div><div id="ech_ecarts">' + echEcarts() + '</div>';
  h += '<div class="sect"><span class="num">04</span><span class="lab">Échelle salariale</span></div><div id="ech_grille">' + echGrille() + '</div>';
  h += '<div class="sect"><span class="num">05</span><span class="lab">Bonification mensuelle — production</span></div><div class="lab" style="text-align:right">Montant mensuel</div>' +
    d.bonusMensuel.map(function(b, i){ return '<div class="tr"><span>' + echEsc(b.lab) + '</span>' + echCase("ech_bm" + i, b.val == null && i === 0 ? 0 : b.val, "$") + '</div>'; }).join("");
  h += '<div class="sect"><span class="num">06</span><span class="lab">Bonification annuelle — gestionnaires</span></div><div class="lab" style="display:flex;justify-content:space-between"><span>Marge brute</span><span>% du salaire annuel</span></div>' +
    d.bonusAnnuel.map(function(b, i){ return '<div class="g6">' + echCase("ech_bam" + i, b.marge, "%") + '<span class="f">' + echEsc(b.mot || "") + '</span><span class="ar"></span>' + echCase("ech_bap" + i, b.pct == null && i === 0 ? 0 : b.pct, "%") + '</div>'; }).join("");
  h += '<p class="finnote" id="ech_etat"></p>';
  document.getElementById("ech_app").innerHTML = h; echSelLier();
  function lier(id, maj, champ, ind){
    var el = document.getElementById(id); if(!el) return;
    el.oninput = function(){ el.className = el.value.trim() === "" ? "vide" : ""; var n = echNum(el.value); if(n != null || el.value.trim() === "") { maj(n); if(ind) { document.getElementById("ech_grille").innerHTML = echGrille(); document.getElementById("ech_ecarts").innerHTML = echEcarts(); echLierRefs(); } } };
    el.onchange = function(){ echSauver(champ, echNum(el.value)); };
  }
  lier("ech_taux", function(n){ d.taux = n; }, "taux", true);
  d.marche.forEach(function(m, i){ lier("ech_mar" + i, function(n){ m.val = n; }, "marche" + i); });
  d.bonusMensuel.forEach(function(b, i){ lier("ech_bm" + i, function(n){ b.val = n; }, "bm" + i); });
  d.bonusAnnuel.forEach(function(b, i){ lier("ech_bam" + i, function(n){ b.marge = n; }, "bam" + i); lier("ech_bap" + i, function(n){ b.pct = n; }, "bap" + i); });
  echLierRefs();
}
function echLierRefs(){
  var d = ECH.d;
  d.ecarts.forEach(function(e, i){
    var el = document.getElementById("ech_ref" + i); if(!el) return;
    el.oninput = function(){ el.className = el.value.trim() === "" ? "vide" : ""; e.ref = echNum(el.value); var z = document.getElementById("ech_ecarts"); var pos = el.id, v = el.value; z.innerHTML = echEcarts(); echLierRefs(); var n = document.getElementById(pos); if(n){ n.focus(); try{ n.setSelectionRange(v.length, v.length); }catch(x){} } };
    el.onchange = function(){ echSauver("ref" + i, echNum(el.value)); };
  });
}
