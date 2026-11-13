// Conseil d'administration > Production (Direction seulement). Données: service « production_lire » (onglet PRODUCTION du classeur Conseil + statuts des rencontres).
var PR_MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
var PR_MC = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
var PR_REDUCTION = 0.20;   // objectif: −20 % par rapport à l'an passé (réglable ici pour l'instant)
var PR = {a: null, m: null};
function prCapital(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function prValeurs(t, mois){ return (t || []).map(function(v, i){ return mois.indexOf(i) >= 0 && v !== null && v !== undefined ? v : null; }); }
function prSomme(l){ var s = null; l.forEach(function(v){ if(v !== null && v !== undefined) s = (s || 0) + v; }); return s; }
function prMoyenne(l){ var n = 0, s = 0; l.forEach(function(v){ if(v !== null && v !== undefined){ s += v; n++; } }); return n ? s / n : null; }
// Mois saisis (dernier mois non vide de l'année) pour « Tous les mois »
function prDernier(an){
  var d = -1; if(!an) return d;
  ["fixe","piece","acrylique","total"].forEach(function(k){ (an.nc[k] || []).forEach(function(v, i){ if(v !== null && i > d) d = i; }); });
  ["fixe","piece","acrylique"].forEach(function(k){ (an.retard[k] || []).forEach(function(v, i){ if(v !== null && i > d) d = i; }); });
  return d;
}
function prTotalNC(an, mois){
  if(!an) return null;
  var t = prSomme(prValeurs(an.nc.total, mois));
  return t !== null ? t : prSomme(["fixe","piece","acrylique"].map(function(k){ return prSomme(prValeurs(an.nc[k], mois)); }));
}
function prCarte(nom, val, ref, libRef, agreg, couleur){
  var vide = val === null || val === undefined;
  var obj = ref === null || ref === undefined ? null : Math.round(Math.round(ref) * (1 - PR_REDUCTION));
  var ok = vide || obj === null ? null : val <= obj;
  var ecart = vide || !ref ? null : Math.round((val - ref) / ref * 100);
  var ech = Math.max(val || 0, ref || 0, 1);
  var past = vide || ok === null ? "" : '<span class="pas '+(ok ? "dans" : "sous")+'">'+(ok ? "Dans la cible" : "Sous la cible")+'</span>';
  return '<div class="tcarte tk prc'+(vide ? " prv" : "")+'"><div class="tct"><span><b class="tq" style="background:'+(couleur || "#8D806A")+'"></b>'+nom+'</span>'+past+'</div>' +
    '<div class="tl"><div class="tgros">'+(vide ? "—" : Math.round(val))+'</div><div class="tcib">'+(obj === null ? "" : 'Objectif '+obj+' · −'+Math.round(PR_REDUCTION*100)+' % vs '+libRef)+'</div></div>' +
    '<div class="tbarre"><i style="width:'+(vide ? 0 : val/ech*100)+'%"></i>'+(obj === null || vide ? "" : '<u style="left:'+Math.min(100, obj/ech*100)+'%"></u>')+'</div>' +
    '<div class="prb"><span>'+libRef+' : <b>'+(ref === null || ref === undefined ? "—" : Math.round(ref))+'</b></span><span>'+(ecart === null ? "" : (ecart > 0 ? "+" : ecart < 0 ? "−" : "")+Math.abs(ecart)+" %")+'</span></div></div>';
}
function prRendu(d){
  var ans = d.annees || {}, cles = Object.keys(ans).sort().reverse(), a = PR.a, an = ans[String(a)], pa = ans[String(a-1)];
  var tous = PR.m === -1, dern = prDernier(an);
  var mois = tous ? (function(){ var r = [], i; for(i = 0; i <= dern; i++) r.push(i); return r; })() : [PR.m];
  var lib = tous ? 'Janv. à '+PR_MC[Math.max(dern,0)]+' '+(a-1) : prCapital(PR_MC[PR.m])+' '+(a-1);
  var libM = tous ? "Moyenne mensuelle "+(a-1) : prCapital(PR_MC[PR.m])+' '+(a-1);
  var h = '<div class="prsel"><label><select id="pra">'+cles.map(function(k){ return '<option value="'+k+'"'+(+k === a ? " selected" : "")+'>'+k+'</option>'; }).join("")+'</select></label>' +
    '<label><select id="prm"><option value="-1"'+(tous ? " selected" : "")+'>Tous les mois</option>'+PR_MOIS.map(function(n, i){ return '<option value="'+i+'"'+(PR.m === i ? " selected" : "")+'>'+prCapital(n)+'</option>'; }).join("")+'</select></label></div>';
  // 01 Non conformité (somme)
  h += '<div class="prs"><span class="num">01</span><span class="lab">Non conformité</span></div>' + (tous ? '<div class="prsub">Cumul de janvier à '+(dern >= 0 ? PR_MOIS[dern] : "—")+'</div>' : "");
  [["Fixe","fixe"],["Pièce","piece"],["Acrylique","acrylique"],["Total","total"]].forEach(function(t){
    var v = t[1] === "total" ? prTotalNC(an, mois) : (an ? prSomme(prValeurs(an.nc[t[1]], mois)) : null);
    var r = t[1] === "total" ? prTotalNC(pa, mois) : (pa ? prSomme(prValeurs(pa.nc[t[1]], mois)) : null);
    h += prCarte(t[0], v, r, lib);
  });
  // 02 Cas en retard (moyenne mensuelle en « Tous les mois »; état du mois sinon)
  h += '<div class="prs"><span class="num">02</span><span class="lab">Cas en retard</span></div>' + (tous ? '<div class="prsub">Moyenne mensuelle</div>' : "");
  function retard(a1, k){ return a1 ? (tous ? prMoyenne(prValeurs(a1.retard[k], mois)) : prSomme(prValeurs(a1.retard[k], mois))) : null; }
  var tv = 0, tr = 0, okv = true, okr = true;
  [["Fixe","fixe"],["Pièce","piece"],["Acrylique","acrylique"]].forEach(function(t){
    var v = retard(an, t[1]), r = retard(pa, t[1]);
    if(v === null) okv = false; else tv += v; if(r === null) okr = false; else tr += r;
    h += prCarte(t[0], v, r, libM);
  });
  h += prCarte("Total", okv ? tv : null, okr ? tr : null, libM);
  // 03 Employés inactifs (absentéisme seulement; poste vacante retiré le 13 nov.)
  var ina = (an ? an.absent : []).map(function(v){ return v === null || v === undefined ? null : v; });
  var iv = tous ? prMoyenne(prValeurs(ina, mois)) : prSomme(prValeurs(ina, mois));
  h += '<div class="prs"><span class="num">03</span><span class="lab">Employés inactifs</span></div>' +
    '<div class="prl"><span>'+(tous ? "Moyenne mensuelle" : prCapital(PR_MOIS[PR.m]))+'</span><b>'+(iv === null ? "—" : Math.round(iv))+'</b></div>';
  // 04 Rencontre d'évaluation
  var rc = d.rencontres || {points: 0, sur: 0}, pc = rc.sur ? Math.round(rc.points / rc.sur * 100) : null, ok4 = pc === null ? null : pc >= 80;
  h += '<div class="prs"><span class="num">04</span><span class="lab">Rencontre d\'évaluation</span></div>' +
    '<div class="tcarte tk prc"><div class="tct"><span><b class="tq" style="background:#8D806A"></b>Rencontres</span>'+(ok4 === null ? "" : '<span class="pas '+(ok4 ? "dans" : "sous")+'">'+(ok4 ? "Dans la cible" : "Sous la cible")+'</span>')+'</div>' +
    '<div class="tl"><div class="tgros">'+(pc === null ? "—" : pc)+'<small>%</small></div><div class="tcib">cible 80 % et +</div></div>' +
    '<div class="tbarre"><i style="width:'+(pc || 0)+'%"></i><u style="left:80%"></u></div><div class="prb"><span>Depuis le 1er janvier · '+rc.points+' sur '+rc.sur+'</span></div></div>';
  return h;
}
function productionOuvrir(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Production</h1><div id="pr"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); financeMenu(); };
  obtenir("production", {action:"production_lire"}, function(d){
    var el = document.getElementById("pr"); if(!el) return;
    if(PR.a === null){ var n = new Date(), m = n.getMonth() - 1, a = n.getFullYear(); if(m < 0){ m = 11; a--; } PR.a = a; PR.m = m; }   // à l'ouverture: toujours le mois dernier
    function dessiner(){
      el.innerHTML = prRendu(d);
      document.getElementById("pra").onchange = function(){ PR.a = +this.value; dessiner(); };
      document.getElementById("prm").onchange = function(){ PR.m = +this.value; dessiner(); };
    }
    dessiner();
  }, function(){ var el = document.getElementById("pr"); if(el) el.innerHTML = '<div class="bandeau">▪ DONNÉES INDISPONIBLES</div>'; }, true);
}
