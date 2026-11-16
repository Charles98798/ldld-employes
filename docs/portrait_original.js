// Portrait d'un employé, identique à l'original Google (page web de SALAIRE). Données: action Service « portrait_original » (Direction seulement, lecture seule).
// Aucune valeur salariale n'est gardée en cache ni sur l'appareil: la réponse reste en mémoire le temps de la page.
function portraitOriginal(idDepart){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Portrait d’un employé</h1><div class="po" id="po"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  var D = null, i = -1, LIBN = "";
  var MOIS = ['JANV.','FÉVR.','MARS','AVR.','MAI','JUIN','JUIL.','AOÛT','SEPT.','OCT.','NOV.','DÉC.'];
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function cle(s){ return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim(); }
  function pc(v){ return v == null ? "—" : Math.round(v * 100); }
  function largeur(v){ return Math.max(0, Math.min(100, Math.round((v || 0) * 100))) + "%"; }
  function argent(v){ return v == null ? "—" : (Math.round(v * 100) / 100).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " $"; }
  function heuresTxt(v){ return v == null ? "—" : String(Math.round(v * 100) / 100).replace(".", ","); }
  function periodeAttendue(){ var t = new Date(), j = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 12), m = j.getMonth() - 6, dm = new Date(j.getFullYear(), m + 1, 0, 12).getDate(); return [new Date(j.getFullYear(), m, Math.min(j.getDate(), dm), 12), new Date(j.getFullYear(), j.getMonth(), j.getDate() - 14, 12)]; }
  function jourD(d){ return d.getDate() + " " + MOIS[d.getMonth()] + " " + d.getFullYear(); }
  function jour(s){ var m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? (+m[3]) + " " + MOIS[+m[2] - 1] : ""; }
  function dateLongue(s){ var m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? (+m[3]) + " " + ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"][+m[2] - 1] + " " + m[1] : ""; }
  // Règle de pointage (formule C31 du classeur « Contribution individuelle »), reprise telle quelle.
  var PTS_POND = {avec:{comp:[15,15,15],val:15,obj:20,exp:20}, sans:{comp:[20,20,20],val:15,obj:0,exp:25}};
  function ptsSans(cat){ return /^(administratif|gestionnaire|expert)/.test(String(cat || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase()); }
  function ptsNum(x){ if(x === "" || x == null) return null; var n = Number(x); return isNaN(n) ? null : n; }
  function ptsMoy(a){ var v = a.filter(function(x){ return x != null; }); return v.length ? v.reduce(function(s, x){ return s + x; }, 0) / v.length : null; }
  function ptsCalcul(cat, liste, expPts){
    var sans = ptsSans(cat), P = sans ? PTS_POND.sans : PTS_POND.avec, L = (liste || []).slice(0, 2);
    function note(k){ return ptsMoy(L.map(function(q){ return ptsNum(q[k]); })); }
    var val = ptsMoy(L.map(function(q){ var v = (q.val || []).map(ptsNum); return v.length === 5 && v.every(function(x){ return x != null; }) ? ptsMoy(v) : null; }));
    var e = ptsNum(expPts), R = [["Expérience", e == null ? null : e / 20 * P.exp, P.exp]];
    [["Connaissances et compétences techniques","tech"],["Autonomie et résolution de problèmes","auto"],["Qualité et constance du travail","qual"]].forEach(function(c, k){ var n = note(c[1]); R.push([c[0], n == null ? null : n / 10 * P.comp[k], P.comp[k]]); });
    R.push(["Valeurs humaines", val == null ? null : val / 10 * P.val, P.val]);
    if(!sans){ var o = ptsMoy(L.map(function(q){ var x = ptsNum(q.obj); return x != null && x > 1.5 ? x / 100 : x; })); R.push(["Objectifs (tableau de bord)", o == null ? null : o * P.obj, P.obj]); }
    var sp = R.reduce(function(s, r){ return s + r[2]; }, 0), tot = R.every(function(r){ return r[1] != null; }) && sp ? R.reduce(function(s, r){ return s + r[1]; }, 0) / sp * 100 : null;
    return {rows: R, total: tot, n: L.length};
  }
  function ptsHtml(cat, liste, expPts){ var c = ptsCalcul(cat, liste, expPts);
    return c.rows.map(function(r){ return '<div><span>'+esc(r[0])+'</span><b'+(r[1] == null ? ' class="manque"' : '')+'>'+(r[1] == null ? "—" : Math.round(r[1]))+' / '+r[2]+'</b></div>'; }).join("") + '<div class="tot"><span>Total</span><b>'+(c.total == null ? "—" : Math.round(c.total)+" %")+'</b></div>'; }
  function optionsListe(){ return '<option value="" disabled>Choisir un employé…</option>' + D.employes.map(function(e, k){ return '<option value="'+k+'">'+esc(e.nom)+'</option>'; }).join(""); }
  function vue(e){ return {pos: e.pos, total: e.total, det: e.det, X: D.echelle, an: D.annee, suiv: false}; }   // photo d'aujourd'hui: aucune année à venir, aucune notion de confirmé
  // Grand écran: une seule page à 3 colonnes, mise à l'échelle pour tenir dans la fenêtre sans défilement (comme la page web d'origine).
  function ajuster(){ var el = $("po"); if(!el){ removeEventListener("resize", ajuster); return; }
    el.style.zoom = 1; el.style.width = ""; if(innerWidth < 1000) return;
    el.style.width = "1500px"; var h = el.offsetHeight, haut = el.getBoundingClientRect().top + (window.scrollY || 0), z = Math.min((innerWidth - 24) / 1500, (innerHeight - haut - 8) / h);
    if(z > 1.8) z = 1.8; if(z < .6) z = 1; el.style.zoom = z; }
  function squelette(){
    $("po").innerHTML = ''+
      '<div class="pohead"><div class="pohd"><img class="pologo" src="icons/icon-192-v7.png" alt="" width="48" height="48"><div class="potitre"><div class="ponom" id="poNom"></div><div class="posous" id="poSous"></div></div></div>' +
      '<div class="ponav"><select class="champ" id="poListe"></select><div class="ponb"><button type="button" class="pobtn" id="poPrec">Précédent</button><button type="button" class="pobtn noir" id="poSuiv">Suivant</button></div></div></div>' +
      '<div class="potri"><div><div class="pos"><span class="n">01</span><span class="l">Position dans l’échelle</span></div><div id="poEch"></div><div id="poEvo"></div></div>' +
      '<div><div class="pos"><span class="n">02</span><span class="l">Rémunération globale</span></div><div id="poRem"></div><div class="poinfo" id="poRemInfo"></div></div>' +
      '<div><div class="pos"><span class="n">03</span><span class="l">Contribution</span><span class="moy" id="poPtsTag"></span></div><div class="pofx" id="poPts"></div>' +
      '<div class="pos"><span class="n">04</span><span class="l">Pour notre discussion</span></div><div class="poparoles" id="poParoles"></div></div></div>' +
      '<div class="pos"><span class="n">05</span><span class="l">Objectifs et charges</span></div><div id="poCharge"></div><div class="poinfo" id="poChargeInfo"></div>';
    $("poListe").innerHTML = optionsListe();
    $("poListe").onchange = function(){ i = +this.value; afficher(); };
    $("poPrec").onclick = function(){ i = i < 0 ? D.employes.length - 1 : (i - 1 + D.employes.length) % D.employes.length; afficher(); };
    $("poSuiv").onclick = function(){ i = (i + 1) % D.employes.length; afficher(); };
  }
  function afficher(){
    var e = D.employes[i]; $("poListe").value = i; $("poNom").textContent = e.nom; $("poSous").textContent = e.cat + " · Portrait " + D.annee;
    var V = vue(e), c = e.contribution;
    var Lc = c && c.liste ? c.liste : (c ? [c] : []);
    $("poPts").innerHTML = ptsHtml(e.cat, Lc, e.expPts); $("poPtsTag").textContent = Lc.length > 1 ? "moyenne de 2 évaluations" : "";
    var X = V.X, E = X && X.cats[cle(e.cat)], hh = "";
    if(E){
      hh = '<div class="pok">L’échelle · '+esc(e.cat)+' · '+V.an+'</div><div class="poquoi">'+(V.pos == null ? "" : "Vous êtes à "+pc(V.pos)+" %"+(V.pos > 1 + 1e-9 ? " : au-delà du sommet" : ""))+'</div>';
      var P0 = X.positions[0], P1 = X.positions[X.positions.length - 1], n0 = Math.round(P0 * 100), n1 = Math.round(P1 * 100), R0 = E[0], R1 = E[E.length - 1];
      var xx = function(p){ return Math.max(0, Math.min(100, (p - P0) / (P1 - P0) * 100)) + "%"; };
      hh += '<div class="porl"><div class="rail"></div>'+(V.pos != null ? '<div class="plage" style="left:0;width:'+xx(V.pos)+'"></div>' : "")+'<div class="tick" style="left:0"></div><div class="tick" style="left:100%"></div>'+(V.pos != null ? '<div class="nv2" style="left:'+xx(V.pos)+'"><i></i></div>' : "")+'</div>';
      hh += '<div class="poqa"><div><div class="p">Bas de l’échelle</div><div class="t">'+n0+' %</div><div class="d">'+R0.toFixed(2).replace(".", ",")+' $ / h</div></div>' +
        '<div class="ici"><div class="p">Votre position</div><div class="t">'+(V.pos == null ? "—" : pc(V.pos)+" %")+'</div><div class="d">'+(V.det ? argent(V.det.taux)+" / h" : "—")+'</div></div>' +
        '<div><div class="p">Sommet de l’échelle</div><div class="t">'+n1+' %</div><div class="d">'+R1.toFixed(2).replace(".", ",")+' $ / h</div></div></div>';
    }
    $("poEch").innerHTML = hh;
    function evoChart(t, pts, fmt, an, conf){ var W = 230, H = 112, x0 = 20, x1 = W - 20, yrs = [];
      for(var q = an - 4; q <= an; q++) yrs.push(q);
      var vals = pts.map(function(p){ return p.v; }), mn = vals.length ? Math.min.apply(null, vals) : 0, mx = vals.length ? Math.max.apply(null, vals) : 1; if(mx - mn < 1e-9){ mn -= mn * .03 || .5; mx += mx * .03 || .5; }
      var g = '<svg viewBox="0 0 '+W+' '+(H+12)+'"><line x1="'+x0+'" x2="'+x1+'" y1="'+(H-20)+'" y2="'+(H-20)+'" stroke="#e6e1d8"/>', xy = [];
      yrs.forEach(function(y, k){ var x = x0 + (x1 - x0) * k / 4; g += '<text x="'+x.toFixed(1)+'" y="'+(H-5)+'" text-anchor="middle" font-size="10" fill="#8D806A">'+y+'</text>' + (conf && y === an ? '<text x="'+x.toFixed(1)+'" y="'+(H+5)+'" text-anchor="middle" font-size="8.5" fill="#8D806A">'+LIBN+'</text>' : ""); });
      pts.forEach(function(p){ var k = p.an - (an - 4), x = x0 + (x1 - x0) * k / 4, y = 22 + (H - 52) * (1 - (p.v - mn) / (mx - mn)); xy.push([x, y, p]); });
      var reel = conf ? xy.filter(function(a){ return a[2].an < an; }) : xy;
      if(reel.length > 1) g += '<polyline points="'+reel.map(function(a){ return a[0].toFixed(1)+","+a[1].toFixed(1); }).join(" ")+'" fill="none" stroke="#000000" stroke-width="1.6"/>';
      if(conf && xy.length > 1 && xy[xy.length - 1][2].an === an){ var a1 = xy[xy.length - 2], a2 = xy[xy.length - 1]; g += '<line x1="'+a1[0].toFixed(1)+'" y1="'+a1[1].toFixed(1)+'" x2="'+a2[0].toFixed(1)+'" y2="'+a2[1].toFixed(1)+'" stroke="#000000" stroke-width="1.6" stroke-dasharray="4 3"/>'; }
      xy.forEach(function(a){ var last = a[2].an === (conf ? an - 1 : an); g += '<rect x="'+(a[0]-3.5).toFixed(1)+'" y="'+(a[1]-3.5).toFixed(1)+'" width="7" height="7" fill="'+(last ? "#000000" : "#fff")+'" stroke="#000000"/><text x="'+a[0].toFixed(1)+'" y="'+(a[1]-9).toFixed(1)+'" text-anchor="middle" font-size="11" fill="#000000">'+fmt(a[2].v)+'</text>'; });
      return '<div><div class="pok">'+t+'</div>'+g+'</svg></div>'; }
    var an0 = D.annee;
    var PH = (e.historique || []).filter(function(q){ return q.an >= an0 - 4 && q.an < an0; }).map(function(q){ return {an: q.an, v: q.pos}; }).concat(e.pos != null ? [{an: an0, v: e.pos}] : []),
      SH = (e.histSalaire || []).map(function(q){ return {an: q.an, v: q.taux}; });
    if(e.det && e.det.taux != null && !SH.some(function(q){ return q.an === an0; })) SH.push({an: an0, v: e.det.taux});
    $("poEvo").innerHTML = '<div class="poevo"><div class="pok">Évolution sur 5 ans</div><div class="g2">' + evoChart("Position dans l’échelle", PH, function(v){ return pc(v)+" %"; }, an0, false) + evoChart("Salaire horaire", SH, function(v){ return v.toFixed(2).replace(".", ",")+" $"; }, an0, false) + '</div></div>';
    var d = V.det, R = [["Salaire horaire retenu", d && argent(d.taux)], ["Heures de travail (par semaine)", d && heuresTxt(d.heures)], ["Salaire de base annuel (46 semaines)", d && argent(d.base)], ["Congés rémunérés (vacances, jours fériés, maladie)", d && argent(d.conges)], ["Boni annuel maximum", d && argent(d.boni)]];
    if(!d || d.otpadq > 0) R.push(["Cotisation OTPADQ", d && argent(d.otpadq)]); if(!d || d.assurance > 0) R.push(["Assurances collectives", d && argent(d.assurance)]);
    var T = '<table class="port"><tr><th>Annuelle</th><th>'+"Aujourd’hui"+(V.pos == null ? "" : " ("+pc(V.pos)+" %)")+'</th></tr>';
    R.forEach(function(r){ T += '<tr><td>'+r[0]+'</td><td>'+(r[1] == null ? "—" : r[1])+'</td></tr>'; });
    T += '<tr class="tot"><td>Total de la rémunération globale</td><td>'+(d ? argent(d.total) : "—")+'</td></tr></table>';
    if(d && d.total > 0){ var bs = d.base || 0, cg = d.conges || 0, av = Math.max(0, d.total - bs - cg), pp = [["Salaire de base", bs, "#B4AB9B"], ["Congés rémunérés", cg, "#d9cfba"], ["Autres avantages", av, "#f0ece6"]].filter(function(x){ return x[1] > 0; });
      T += '<div class="porep"><div class="pok">Répartition de votre rémunération globale</div><div class="rbar">'+pp.map(function(x){ return '<i style="width:'+(100*x[1]/d.total)+'%;background:'+x[2]+'"></i>'; }).join("")+'</div><div class="rleg">'+pp.map(function(x){ return '<div><b style="background:'+x[2]+'"></b>'+x[0]+" "+String(Math.round(x[1])).replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" $ · "+Math.round(100*x[1]/d.total)+" %</div>"; }).join("")+'</div></div>'; }
    $("poRem").innerHTML = T;
    $("poRemInfo").textContent = (d && d.ecart) ? "Attention : les lignes ne donnent pas exactement le total de la feuille. À vérifier dans le classeur." : "Chiffres de la feuille « Employés » de l’année "+V.an+".";
    var g = e.charge, C = D.cibles;
    function nb(v, dec){ return v == null ? "—" : (Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec)).toFixed(dec).replace(".", ","); }
    function nb2(x){ return x == null ? "—" : (Math.round(x * 100) / 100 === Math.round(x) ? String(Math.round(x)) : nb(x, 2)); }
    function lig(t, cibTxt, cib, real, realTxt, plus, det){ var ok = real != null && cib != null && (plus ? real >= cib - 1e-9 : real <= cib + 1e-9), mx = Math.max(cib == null ? 0 : cib, real == null ? 0 : real) || 1;
      return '<div class="poir"><div class="t">'+t+'</div><div class="v"><span'+(real == null ? ' class="vide"' : "")+'>'+realTxt+'</span><em>Cible : '+cibTxt+'</em></div><div><div class="bar"><i style="width:'+(real == null ? 0 : real / mx * 100)+'%"></i>'+(cib == null ? "" : '<u style="left:'+(cib / mx * 100)+'%"></u>')+'</div>'+(real == null ? '<span class="bg nd">Pas de donnée</span>' : cib == null ? '<span class="bg nd">Cible à confirmer</span>' : '<span class="bg'+(ok ? " ok" : "")+'">'+(ok ? "Dans la cible" : "Sous la cible")+'</span>')+'</div><div class="dt">'+(det || "")+'</div></div>'; }
    var hc = g && g.ch != null ? g.ch : null, hr = g && g.heures != null ? g.heures : null, cc = g && g.cce != null ? g.cce / 100 : null;
    function p1(v){ return v == null ? "—" : nb(v * 100, 0) + " %"; }
    function dj(a){ return a ? a.join(" · ") : ""; }
    $("poCharge").innerHTML = '<div class="poind">' +
      lig("Heures travaillées par semaine", nb2(hc), hc, hr, hr == null ? "—" : nb(hr, 2), true, g ? g.semaines + " semaines comptées" : "") +
      lig("Charge effectuée", cc == null ? "—" : p1(cc) + " et +", cc, g && g.effectuee, p1(g && g.effectuee), true, g ? dj(g.detCE) : "") +
      lig("Charge non terminée", p1(C.nonTerminee) + " et −", C.nonTerminee, g && g.nonTerminee, p1(g && g.nonTerminee), false, g ? dj(g.detCN) : "") +
      lig("Objectifs atteints", p1(C.objectifs) + " et +", C.objectifs, g && g.objectifs, p1(g && g.objectifs), true, g ? dj(g.detObj) : "") + '</div>';
    var pa = periodeAttendue(), regle = g && g.ok && g.du && g.au ? "Chiffres de Gestion : les 6 derniers mois travaillés (complets), qui se terminent au moins 2 semaines avant la rencontre, du "+jour(g.du)+" au "+jour(g.au)+"." : "Chiffres des 6 derniers mois, sans les 2 dernières semaines, comme dans l’évaluation : du "+jourD(pa[0])+" au "+jourD(pa[1])+".", inf = "", al = "";
    if(D.gestion.absent) inf = D.gestion.erreur || "Les chiffres arriveront avec l’export quotidien de Gestion LDLD."; else if(!g) inf = "Aucune donnée dans Gestion LDLD pour cet employé.";
    else { inf = (g.du && g.au ? "Période exportée par Gestion LDLD : du "+jour(g.du)+" au "+jour(g.au) : "Gestion LDLD.");
      if(g.du && g.au){ var d1 = new Date(g.du.slice(0, 10) + "T12:00:00"), d2 = new Date(g.au.slice(0, 10) + "T12:00:00"); if(!g.ok && (Math.abs(d1 - pa[0]) > 3 * 864e5 || Math.abs(d2 - pa[1]) > 3 * 864e5)) al = "La période exportée ne suit pas la règle des 6 mois moins 2 semaines : les chiffres ci-dessus sont à vérifier avec Gestion LDLD."; } }
    $("poChargeInfo").innerHTML = "▪ " + esc(regle) + (inf ? "<br>▪ " + esc(inf) : "") + (al ? '<br><span style="background:#fff;padding:2px 6px;color:#000000">'+esc(al)+'</span>' : "");
    if(/^(administratif|gestionnaire|expert)/i.test(e.cat || "")){ $("poCharge").innerHTML = '<div class="poinfo">Pas de tableau de bord pour ce poste.</div>'; $("poChargeInfo").innerHTML = ""; }
    var p = e.paroles || {};
    function ligne(t, v){ return '<div><span class="pok">'+t+'</span><span class="t'+(v ? "" : " vide")+'">'+(v ? "« "+esc(v)+" »" : "—")+'</span></div>'; }
    $("poParoles").innerHTML = ligne("Ce qui va bien", p.bien) + ligne("À développer", p.developper) + ligne("À aborder", p.aborder);
    setTimeout(ajuster, 0);
  }
  appelService({action: "portrait_original", session: sessionGardee()}).then(function(r){
    if(!$("po")) return;
    if(!r || !r.ok || !r.d) throw 0;
    D = r.d; if(!D.employes || !D.employes.length){ $("po").innerHTML = '<div class="bandeau">▪ AUCUN EMPLOYÉ ACTIF</div>'; return; }
    var k = -1; if(idDepart) D.employes.forEach(function(x, j){ if(x.id === idDepart) k = j; });
    i = k >= 0 ? k : 0; squelette(); afficher(); ajuster(); addEventListener("resize", ajuster);
  }).catch(function(){ if($("po")) portrait(idDepart); });   // Service sans portrait_original: ancien portrait
}
