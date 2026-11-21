// Rencontre d'évaluation: parcours en 12 étapes, reproduction de la page web d'origine (ÉVALUATIONS, rencontreHtmlLDLD_).
// Cellulaire: une étape à la fois, sections l'une sous l'autre. Grand écran: une page par étape, mise à l'échelle sans défilement.
// Couche d'accès isolée (revAcces): lire/écrire une case. Branchée plus tard sur la copie chiffrée; fictive tant que l'EFVP n'est pas acceptée.
var REV_FIN = null;
var revAcces = {
  ecrire: function(adresse, valeur){ return Promise.resolve({ok: true}); }
};
var REV_TITRES = ["Rencontre", "Expérience", "Compétences", "Valeurs", "Développement", "Objectifs et charges", "Non-conformités", "Priorités", "Commentaires", "Mon expérience", "Préparer", "Bilan"];
var REV_NOTES = ["C26", "C27", "C28", "C29", "E38", "E39", "E40", "E41", "E42"];
var REV_MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
// Pointage de la contribution: une seule règle (formule C31 du classeur). Chaque ligne = pointage sur sa pondération.
var REV_POND = {avec: {comp: [15, 15, 15], val: 15, obj: 20, exp: 20}, sans: {comp: [20, 20, 20], val: 15, obj: 0, exp: 25}};
function revPtsNum(x){ if(x === "" || x == null) return null; var n = Number(x); return isNaN(n) ? null : n; }
function revPtsMoy(a){ var v = a.filter(function(x){ return x != null; }); return v.length ? v.reduce(function(s, x){ return s + x; }, 0) / v.length : null; }
function revPtsCalcul(q, expPts, opt){
  var sans = opt.sans, P = opt.pond || (sans ? REV_POND.sans : REV_POND.avec), R = [], e = revPtsNum(expPts);
  R.push(["Expérience", e == null ? null : e / 20 * P.exp, P.exp]);
  [["Connaissances et compétences techniques", q.tech], ["Autonomie et résolution de problèmes", q.auto], ["Qualité et constance du travail", q.qual]].forEach(function(c, i){ var n = revPtsNum(c[1]); R.push([c[0], n == null ? null : n / 10 * P.comp[i], P.comp[i]]); });
  var v = (q.val || []).map(revPtsNum), val = v.length === 5 && v.every(function(x){ return x != null; }) ? revPtsMoy(v) : null;
  R.push(["Valeurs humaines", val == null ? null : val / 10 * P.val, P.val]);
  if(!sans){ var o = revPtsNum(q.obj); o = o != null && o > 1.5 ? o / 100 : o; R.push(["Objectifs (tableau de bord)", o == null ? null : o * P.obj, P.obj]); }
  var sp = R.reduce(function(s, r){ return s + r[2]; }, 0), tot = R.every(function(r){ return r[1] != null; }) && sp ? R.reduce(function(s, r){ return s + r[1]; }, 0) / sp * 100 : null;
  return {rows: R, total: tot};
}

// Le pont SALAIRE envoie la zone A1:L105 en tableaux (lignes × colonnes); la page lit par adresse (« C26 »). On convertit une seule fois.
function revAdresses(D){
  function conv(t){
    if(!Array.isArray(t)) return t;
    var o = {};
    t.forEach(function(ligne, i){ (ligne || []).forEach(function(v, j){ if(v !== "" && v !== null && v !== undefined) o[String.fromCharCode(65 + j) + (i + 1)] = v; }); });
    return o;
  }
  var c = {}; for(var k in D) c[k] = D[k];
  c.g = conv(D.g); c.r = conv(D.r);
  return c;
}
function revOuvrir(D, acces){
  D = revAdresses(D);
  var A = acces || revAcces, S = {}, etape = 2, file = [], enCours = false, dernier = "", fenetre = null;
  var NOTES = REV_NOTES;
  function g(a){ var v = D.g && D.g[a]; return v === undefined || v === null ? "" : String(v); }
  function r(a){ if(S.hasOwnProperty(a)) return S[a]; var v = D.r && D.r[a]; return v === undefined || v === null ? "" : v; }
  function papier(){ return D.papier === false ? " verrou" : ""; }   // autoévaluation reçue en ligne: réponses de l'employé en lecture seule
  function ro(){ return D.papier === false; }
  function vide(a){ var v = r(a); return v === "" || v === null || v === undefined; }
  function estRose(a){ if(a === "C29" && !Number(r("B29"))) return false; return vide(a); }
  function nombre(a){ var v = parseFloat(String(r(a)).replace(",", ".")); return isNaN(v) ? null : v; }
  function emp(a){ var n = D.notes && D.notes[a]; return n ? n.em : null; }
  function envoyer(){
    if(enCours || !file.length) return; enCours = true; var q = file.shift();
    A.ecrire(q.a, q.v).then(function(){ var n = new Date(); dernier = ""; }).catch(function(err){ dernier = q.s ? "" : "Enregistrement impossible : " + ((err && err.message) || "refusé") + ". Réessaie."; }).then(function(){ enCours = false; var e = document.getElementById("revs"); if(e) e.textContent = dernier; envoyer(); });
  }
  function ecrire(a, v, sil){ S[a] = v; file.push({a: a, v: v, s: sil}); var e = document.getElementById("revs"); if(e && !sil) e.textContent = "Enregistrement…"; envoyer(); }

  // ---- composants ----
  function puces(a, max, o){
    o = o || {}; var v = String(r(a)), em = o.emp == null ? "" : String(o.emp), h = '<div class="puces' + (o.rose ? " rose" : "") + '">';
    for(var i = 1; i <= max; i++) h += '<button type="button" class="puce' + (v === String(i) ? " choisie" : "") + (em === String(i) && v !== String(i) ? " employe" : "") + '"' + (o.lecture ? " disabled" : ' data-a="' + a + '" data-v="' + i + '"') + ">" + i + "</button>";
    if(o.na) h += '<button type="button" class="puce mot' + (v === "Non applicable" ? " choisie" : "") + '"' + (o.lecture ? " disabled" : ' data-a="' + a + '" data-v="Non applicable"') + ">Non applicable</button>";
    return h + "</div>";
  }
  function champ(a, lignes, ph, lecture, cls){
    var v = r(a); cls = cls || "";
    if(lignes > 1 || !cls) return '<textarea rows="' + lignes + '" data-a="' + a + '" class="' + cls + '" placeholder="' + esc(ph || "") + '"' + (lecture ? " disabled" : "") + ">" + esc(v) + "</textarea>";
    return '<input type="text" data-a="' + a + '" class="' + cls + '" value="' + esc(v) + '" placeholder="' + esc(ph || "") + '"' + (lecture ? " disabled" : "") + ">";
  }
  function date(a, rose){ var v = r(a); return '<span class="' + (rose && !v ? "rose" : "") + '"><input type="date" data-a="' + a + '" value="' + esc(v) + '"></span>'; }
  function btnBareme(k){ return '<button type="button" class="btn-bareme" data-bareme="' + k + '">Voir le barème</button>'; }
  function valDef(t){ var m = String(t || "").split(/\s*Au quotidien\s*:\s*/); return [m[0], m[1] || ""]; }

  // ---- pointage ----
  function obj(){ return Number(r("B29")) > 0; }
  function ptsLive(){
    var bw = [26, 27, 28, 29, 30].map(function(w){ return Number(r("B" + w)) || 0; }), o = obj();
    return revPtsCalcul({tech: r("C26"), auto: r("C27"), qual: r("C28"), obj: o ? r("C29") : null, val: [r("E38"), r("E39"), r("E40"), r("E41"), r("E42")]}, r("C30") === "" ? null : (Number(r("C30")) || 0), {sans: !o, pond: {comp: [bw[0] * 100, bw[1] * 100, bw[2] * 100], obj: bw[3] * 100, exp: bw[4] * 100, val: 15}});
  }
  function ptsSous(k){
    var c = ptsLive(), R = c.rows, v = null, m = 0, lib = "pondération ";
    if(k === "xp"){ v = R[0][1]; m = R[0][2]; }
    else if(k === "comp"){ m = R[1][2] + R[2][2] + R[3][2]; v = (R[1][1] == null || R[2][1] == null || R[3][1] == null) ? null : R[1][1] + R[2][1] + R[3][1]; }
    else if(k === "val"){ v = R[4][1]; m = R[4][2]; }
    else { if(R.length < 6) return ""; v = R[5][1]; m = R[5][2]; lib = "pondération "; }
    var t = lib + (v == null ? "—" : Math.round(v)) + " / " + m;
    return v == null ? '<span class="rosef">' + t + "</span>" : t;
  }
  function fmtScore(){ var t = ptsLive().total; return t == null ? "—" : Math.round(t) + " %"; }

  // ---- barème (consultation) ----
  function niveaux(k){
    if(k !== "exp"){ var l = []; for(var row = 11; row <= 20; row++) if(g("A" + row)) l.push({n: g("A" + row), q: g("B" + row), d: g("E" + row)}); return l; }
    var t = String(g("A91")).replace(/^[^:]*:\s*/, "").split(/\s*·\s*/);
    return t.map(function(x){ var m = x.match(/^(\d+)\s*=\s*(.*)$/); return m ? {n: m[1], q: m[2].charAt(0).toUpperCase() + m[2].slice(1), d: ""} : {n: "", q: x, d: ""}; });
  }
  function ouvrirBareme(k){
    var titre = {comp: "Barème — Évaluation des compétences", val: "Barème — Valeurs humaines", exp: "Barème — Mon expérience"}[k];
    var h = '<div class="revfen"><h2><span>' + titre + '</span><button type="button" class="rvb" id="revfermer">Fermer</button></h2>' + niveaux(k).map(function(n){ return '<div class="niv"><b>' + esc(n.n) + "</b><div>" + esc(n.q) + "</div><div>" + esc(n.d) + "</div></div>"; }).join("") + (k === "comp" && g("A22") ? '<div class="bas">' + esc(g("A22")) + "</div>" : "") + "</div>";
    var v = document.createElement("div"); v.className = "revvoile"; v.innerHTML = h; document.body.appendChild(v); fenetre = v;
    v.onclick = function(e){ if(e.target === v) fermerBareme(); }; document.getElementById("revfermer").onclick = fermerBareme;
  }
  function fermerBareme(){ if(fenetre){ fenetre.remove(); fenetre = null; } }

  // ---- période (Objectifs et charges) ----
  function ryLire(t){ t = String(t || ""); if(t.indexOf("du ") !== 0 || t.indexOf(" au ") < 0) return null; var p = t.slice(3).split(" au "), o = []; if(p.length !== 2) return null; for(var i = 0; i < 2; i++){ var k = p[i].trim().split(" "), j = parseInt(k[0], 10), mo = REV_MOIS.indexOf(k[1]), y = parseInt(k[2], 10); if(!j || mo < 0 || !y) return null; o.push(y + "-" + ("0" + (mo + 1)).slice(-2) + "-" + ("0" + j).slice(-2)); } return o; }
  function ryTxt(iso){ var q = iso.split("-"); return (+q[2] === 1 ? "1er" : +q[2]) + " " + REV_MOIS[+q[1] - 1] + " " + q[0]; }
  function cibleNum(t){ var m = /(\d+(?:[.,]\d+)?)/.exec(String(t || "")); return m ? parseFloat(m[1].replace(",", ".")) : null; }
  function valNum(row, v){ var t = String(v == null ? "" : v), pc = t.indexOf("%") >= 0; t = t.split("%").join("").split("h").join("").split(",").join(".").split(" ").join(""); if(t === "") return null; var n = Number(t); if(isNaN(n)) return null; if(row >= 60 && !pc && n <= 1) n = n * 100; return n; }

  // Chiffres de Gestion (règle du 2 novembre): 6 mois avant la rencontre, sans les 14 derniers jours. Période, réalisé et objectifs atteints viennent du serveur (D.gx), comme dans le classeur.
  function gxTxt(rw){ var x = D.gx; if(!x || !x.ok) return null; var f1 = function(v){ return Math.round(v) + " %"; }; return rw === 59 ? String(Math.round(x.heures * 100) / 100).split(".").join(",") : rw === 60 ? f1(x.ce) : rw === 61 ? f1(x.cn) : f1(x.obj); }
  function gxEcrire(){
    var x = D.gx; if(!x || !x.ok) return;
    var iso = function(t){ var q = String(t || "").split("-"); return q.length === 3 ? ryTxt(q[0] + "-" + q[1] + "-" + q[2]) : ""; };
    if(x.du && x.au){ var per = "du " + iso(x.du) + " au " + iso(x.au); if(String(r("C56")) !== per) ecrire("C56", per, true); }
    [59, 60, 61].forEach(function(rw){ var t = gxTxt(rw); if(t !== null && String(r("E" + rw)) !== t) ecrire("E" + rw, t, true); });
    var o = Math.round(x.obj * 10) / 10, c = Number(r("C29")); if(isFinite(o) && (isNaN(c) || Math.abs(c - o / 100) > 1e-9)) ecrire("C29", o / 100, true);
  }

  // Mise en page du Portrait d'employé (« 05 Objectifs et charges »): valeur, cible, barre avec repère vert, pastille, détail mensuel, notes sur la période de Gestion.
  function revPortrait(X){
    var nb = function(v, d){ return v == null || isNaN(v) ? "—" : (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d).replace(".", ","); };
    var jour = function(t){ var q = String(t || "").slice(0, 10).split("-"); return q.length === 3 ? ryTxt(q.join("-")) : ""; };
    var pct = function(v){ return v == null || isNaN(v) ? "—" : Math.round(v) + " %"; };
    function lig(n, t, cibTxt, cib, real, realTxt, plus, det){
      var ok = real != null && cib != null && (plus ? real >= cib - 1e-9 : real <= cib + 1e-9), mx = Math.max(cib == null ? 0 : cib, real == null ? 0 : real) || 1;
      var ch = S.hasOwnProperty("R" + n) ? S["R" + n] : ((D.rythme && D.rythme[n - 59]) || "");
      var btn = ["Augmentation", "Réduction", "Maintien"].map(function(o){ return '<button type="button" class="puce mot' + (ch === o ? " choisie" : "") + '" data-ry="' + n + '" data-c="' + ({Augmentation: "G", "Réduction": "I", Maintien: "K"})[o] + '" data-o="' + o + '">' + o + "</button>"; }).join("");
      return '<div class="poir"><div class="t">' + t + '</div><div class="v"><span' + (real == null ? ' class="vide"' : "") + ">" + realTxt + "</span><em>Cible : " + cibTxt + '</em></div><div><div class="bar"><i style="width:' + (real == null ? 0 : real / mx * 100) + '%"></i>' + (cib == null ? "" : '<u style="left:' + (cib / mx * 100) + '%"></u>') + "</div>" + (real == null ? '<span class="bg nd">Pas de donnée</span>' : cib == null ? '<span class="bg nd">Cible à confirmer</span>' : '<span class="bg' + (ok ? " ok" : "") + '">' + (ok ? "Dans la cible" : "Sous la cible") + "</span>") + '</div><div class="dt">' + esc(det || "") + '</div><div class="puces rvob" data-l="Objectif">' + btn + "</div></div>";
    }
    var j = function(a){ return a ? [].concat(a).join(" · ") : ""; };
    var h = '<div class="po rvpo"><div class="poind">' +
      lig(59, esc(g("A59")), nb(X.ch, 2).replace(/,00$/, ""), X.ch, X.heures, nb(X.heures, 2), true, X.semaines != null ? X.semaines + " semaines comptées" : "") +
      lig(60, esc(g("A60")), X.cce == null ? "—" : pct(X.cce) + " et +", X.cce, X.ce, pct(X.ce), true, X.dCE) +
      lig(61, esc(g("A61")), "5 % et −", 5, X.cn, pct(X.cn), false, X.dCN) +
      lig(62, esc(g("A62")), "80 % et +", 80, X.obj, pct(X.obj), true, X.dObj) + "</div>";
    h += '<div class="poinfo rvnote">▪ Chiffres de Gestion : les 6 derniers mois travaillés (complets), qui se terminent au moins 2 semaines avant la rencontre' + (X.du && X.au ? ", du " + esc(jour(X.du)) + " au " + esc(jour(X.au)) : "") + ".<br>▪ Période exportée par Gestion LDLD" + (X.du && X.au ? " : du " + esc(jour(X.du)) + " au " + esc(jour(X.au)) : "") + ".</div></div>";
    return h;
  }

  // ---- étapes ----
  var ET = {
    1: function(){
      return '<p class="note">' + esc(g("A7")) + '</p><div class="carte"><div class="grand">' + esc(D.employe || "—") + "</div><div>Rencontre " + esc(D.rencontre) + " · Année " + esc(D.annee) + (D.categorie ? " · " + esc(D.categorie) : "") + '</div><div class="petit">' + esc(g("A33")) + "</div></div>" +
        '<div class="deux"><div><div class="bloc-lab">Date de la rencontre</div><div class="ev">' + esc(revAujourdhui()) + '</div></div><div><div class="bloc-lab">Évaluateur</div><div class="ev">' + esc(D.evaluateur || "—") + "</div></div></div>" +
        '<p class="note" style="margin-top:12px">Cliquez sur une note pour l’enregistrer. Une case soulignée en vert reste à remplir. Le contour noir montre la note que l’employé s’est donnée.</p>';
    },
    2: function(){
      var kPond = (Number(r("B30")) * 100) / 20, T = g("D30").split(/\n/).map(function(x){ return x.trim(); }).filter(Boolean), L = [], ok = false;
      T.forEach(function(t){
        t = t.replace(/^[▪\s]+/, ""); var tot = /total/i.test(t), mx = tot ? 20 : /dipl/i.test(t) ? 4 : /hors/i.test(t) ? 6 : /m[ée]tier|labo/i.test(t) ? 20 : 0;
        var s = t.replace(/\(?\s*max(imum)?\s*:?\s*\d+(?:[.,]\d+)?\s*%\s*\)?/i, ""), m = s.match(/([+-]?\s*\d+(?:[.,]\d+)?)\s*%/), p = m ? Number(m[1].replace(/\s/g, "").replace(",", ".")) : null, i = s.indexOf(":");
        var lab = i > 0 ? s.slice(0, i).trim() : s.replace(m ? m[0] : "", "").trim(), val = i > 0 ? s.slice(i + 1).replace(m ? m[0] : "", "").replace(/[()+]/g, " ").replace(/\s+/g, " ").trim() : "";
        if(p !== null) ok = true; L.push({lab: lab, val: val, p: p, mx: mx, tot: tot});
      });
      var h = '<p class="note" id="st">' + ptsSous("xp") + "</p>";
      if(!ok) return h + '<div class="vide">Détail de l’expérience en cours de mise à jour pour cet employé.</div>';
      h += '<div class="xp">';
      L.forEach(function(x){
        var w = x.mx && x.p !== null ? Math.max(0, Math.min(100, Math.round(x.p * 100 / x.mx))) : 0;
        h += '<div class="xpl' + (x.tot ? " tot" : "") + '"><div><div class="xpe">' + esc(x.lab) + "</div>" + (x.val ? '<div class="xpv">' + esc(x.val) + "</div>" : "") + '</div><div class="xpb"><div style="width:' + w + '%"></div><u></u></div><div class="xpp"><div class="xpn">' + (x.p === null ? "" : Math.round(x.p * kPond)) + "</div>" + ((x.mx && x.tot) ? '<div class="xpm">maximum ' + Math.round(x.mx * kPond) + "</div>" : "") + "</div></div>";
      });
      return h + "</div>";
    },
    3: function(){
      var h = '<div class="titre-b">' + btnBareme("comp") + '</div><p class="note">' + ptsSous("comp") + '</p><p class="note" style="margin-top:12px">Notes de 1 à 10 selon le barème.</p>';
      ["C26", "C27", "C28"].forEach(function(a, i){ var row = 26 + i; h += '<div class="rang rg3"><div class="lab">' + esc(g("A" + row)) + "</div>" + puces(a, 10, {emp: emp(a), rose: estRose(a)}) + champ("D" + row, 2, "Observations") + "</div>"; });
      return h;
    },
    4: function(){
      var h = '<div class="titre-b">' + btnBareme("val") + '</div><p class="note">' + ptsSous("val") + "</p>";
      for(var row = 38; row <= 42; row++){ var a = "E" + row, d = valDef(g("C" + row));
        h += '<div class="rang rg3v"><div class="lab">' + esc(g("A" + row)) + '<div class="desc">' + esc(d[0]) + "</div></div>" + puces(a, 10, {emp: emp(a), rose: estRose(a)}) + '<div class="' + papier() + '">' + champ("I" + row, 1, "Observations de l’employé", false) + "</div>" + (d[1] ? '<div class="quot"><b>Au quotidien :</b> ' + esc(d[1]) + "</div>" : "") + "</div>"; }
      return h;
    },
    5: function(){
      var h = '<div class="deux"><div><div class="bloc-lab">' + esc(g("A45")) + "</div>" + champ("C45", Math.max(4, String(r("C45")).split("\n").length + 1)) + '</div><div><div class="bloc-lab">' + esc(g("A47")) + "</div>" + champ("C47", Math.max(4, String(r("C47")).split("\n").length + 1)) + "</div></div>";
      h += '<div class="bloc-lab" style="margin-top:12px">' + esc(g("A49")) + '</div><div class="entete-tab t4a"><div>' + esc(g("A50")) + "</div><div>" + esc(g("C50")) + "</div><div>" + esc(g("E50")) + "</div><div>" + esc(g("G50")) + "</div><div>Acquis</div></div>";
      for(var row = 51; row <= 53; row++) h += '<div class="ligne-tab t4a"><div data-l="' + esc(g("A50")) + '">' + champ("A" + row, 1) + '</div><div data-l="' + esc(g("C50")) + '">' + champ("C" + row, 1) + '</div><div data-l="' + esc(g("E50")) + '">' + champ("E" + row, 1) + '</div><div data-l="' + esc(g("G50")) + '">' + champ("G" + row, 1) + '</div><div class="acq-c"><button type="button" class="acq" data-acq="' + row + '"' + (String(r("C" + row)).trim() ? "" : " disabled") + ' aria-label="Acquis : ajouter aux tâches acquises">Acquis</button></div></div>';
      return h;
    },
    6: function(){
      if(/^(administratif|gestionnaire)/i.test(D.categorie || "")) return '<p class="note">Pas de tableau de bord pour ce poste.</p>';
      var GX = D.gx && D.gx.ok ? D.gx : null; gxEcrire(); var h = '<p class="note" id="st">' + ptsSous("obj") + "</p>";
      var cur = String(r("C56") || ""), iso = ryLire(cur) || ["", ""], rose = cur === "" ? " rose" : "";
      h += '<div class="rang rg2"><div class="lab">' + esc(g("A56")) + '</div><div class="ry-per">Du <span class="' + rose + '"><input type="date" data-ry="D" value="' + iso[0] + '"' + (GX ? " disabled" : "") + '></span> au <span class="' + rose + '"><input type="date" data-ry="F" value="' + iso[1] + '"' + (GX ? " disabled" : "") + "></span></div></div>";
      if(!GX) h += '<p class="note">Chiffres de Gestion indisponibles : ' + esc(D.gx ? (D.gx.raison || "?") : "aucune donnée reçue du serveur") + "</p>";
      if(GX) h += revPortrait(GX); else {
      h += '<div class="entete-tab t6"><div>' + esc(g("A58")) + "</div><div>" + esc(g("E58") || "Réalisé") + "</div><div>" + esc(g("C58") || "Cible") + "</div><div>Réalisé vs cible</div><div>Détail</div><div>" + esc(g("H58") || "Objectifs") + "</div></div>";
      [59, 60, 61, 62].forEach(function(n, k){
        var ch = S.hasOwnProperty("R" + n) ? S["R" + n] : ((D.rythme && D.rythme[k]) || ""), det = GX ? (n === 59 ? (GX.semaines != null ? GX.semaines + " semaines comptées" : "") : n === 60 ? GX.dCE : n === 61 ? GX.dCN : GX.dObj) : "";
        var cib = n === 59 && GX && GX.ch != null ? GX.ch : cibleNum(g("C" + n)), val = n === 62 ? (nombre("C29") === null ? null : (nombre("C29") <= 1 ? nombre("C29") * 100 : nombre("C29"))) : valNum(n, r("E" + n));
        var cibTxt = n === 59 ? (cib === null ? "" : String(cib).replace(".", ",")) : (n === 61 ? "5 et −" : "80 et +"), barre = '<div class="ry-b"></div>';
        if(cib !== null && val !== null){
          var M = n === 59 ? Math.max(cib, val) : Math.max(100, cib, val), f = Math.max(0, Math.min(100, val / M * 100)), t = Math.max(0, Math.min(100, cib / M * 100)), ok = n === 61 ? val <= cib : val >= cib;
          barre = '<div class="ry-b"><i style="width:' + f + '%"></i><u style="left:' + t + '%"></u></div><div class="ry-n"><span class="ry-t' + (ok ? " ok" : "") + '">' + (ok ? "Dans la cible" : (n === 61 ? "Au-dessus de la cible" : "Sous la cible")) + "</span></div>";
        }
        h += '<div class="ligne-tab t6"><div class="lab">' + esc(g("A" + n)) + '</div><div data-l="Réalisé">' + (n < 62 ? champ("E" + n, 1, "", !!GX, "oblig" + (vide("E" + n) ? " rose-c" : "")) : '<input type="text" value="' + (val === null ? "" : Math.round(val) + " %") + '" disabled>') + '</div><div data-l="Cible">' + esc(cibTxt) + '</div><div data-l="Réalisé vs cible">' + barre + '</div><div class="ry-d" data-l="Détail">' + esc(det) + '</div><div class="puces" data-l="Objectif">' + ["Augmentation", "Réduction", "Maintien"].map(function(o){ return '<button type="button" class="puce mot' + (ch === o ? " choisie" : "") + '" data-ry="' + n + '" data-c="' + ({Augmentation: "G", "Réduction": "I", Maintien: "K"})[o] + '" data-o="' + o + '">' + o + "</button>"; }).join("") + "</div></div>";
      });
      }
      if(Number(r("B29"))){
        var ev = nombre("C29"), em = (D.notes && D.notes.C29) ? D.notes.C29.em : null, pv = ev === null ? "" : Math.round(ev <= 1 ? ev * 100 : ev), pe = em == null || em === "" ? "" : Math.round(em * 100), pc = "";
        if(!GX){ for(var k2 = 50; k2 <= 100; k2 += 5) pc += '<button type="button" class="puce' + (pv === k2 ? " choisie" : "") + (pe === k2 && pv !== k2 ? " employe" : "") + '" data-p="' + k2 + '">' + k2 + "</button>";
          h += '<div class="rang rg2"><div class="lab">Note pour la pondération</div><div class="puces' + (estRose("C29") ? " rose" : "") + '">' + pc + '<span class="autre">Autre</span><input type="text" data-pa="1" class="pctautre" value="' + (pv !== "" && (pv < 50 || pv % 5) ? pv : "") + '"></div></div>'; }
        h += '<div class="rang rg2"><div class="lab">Observations sur les objectifs</div>' + champ("D29", 2, "Observations") + "</div>";
      }
      return h;
    },
    7: function(){
      var N = D.nc;
      if(N && N.ok && !Number(N.n6)) return '<p class="note">Aucune non-conformité signalée au cours des 6 derniers mois. Félicitations!</p>';
      if(!N || !N.ok) return '<p class="note">Les non-conformités ne sont pas disponibles' + (N && N.raison ? " : " + esc(N.raison) : "") + ".</p>";
      // Même courbe et même liste en colonnes (Date | Cas | Étape) que la Réunion de production, pour cet employé seulement.
      var serie = (N.mois || []).map(function(m){ return {m: m.label, v: m.n}; }), lignes = (N.detail || []).slice(0, 6).map(function(d){ var m = function(t){ return typeof rdMin === "function" ? rdMin(t) : t; }; return [d.d, m(d.cat), d.dos, m(d.etape), m(d.type), m(d.com), d.dossier || ""]; });
      var courbe = typeof rdCourbe === "function" ? rdCourbe(serie) : "";
      var liste = typeof rdIsoDate === "function" ? (lignes.length ? ncTable(lignes) : '<div class="nc-plus">Aucune non-conformité sur les 6 derniers mois.</div>') : "";
      return '<div class="nc"><div class="nc-k"><div class="carte"><div class="nc-lab">6 derniers mois</div><div class="grand">' + esc(N.n6) + '</div></div><div class="carte"><div class="nc-lab">12 derniers mois</div><div class="grand">' + esc(N.n12) + '</div></div><div class="carte"><div class="nc-lab">Type le plus fréquent</div><div class="grand t">' + esc(N.typeTop || "—") + '</div></div></div><div class="nc-ch"><div class="nc-lab">Non-conformités par mois</div>' + courbe + '</div><div class="nc-det"><div class="bloc-lab">Détail des 6 derniers mois</div>' + liste + ((N.detail || []).length > 6 ? '<div class="nc-plus">+ ' + ((N.detail || []).length - 6) + " autres non-conformités sur les 6 derniers mois</div>" : "") + "</div></div>";
    },
    8: function(){
      var h = '<div class="deux"><div><div class="bloc-lab">' + esc(g("A65")) + "</div>" + champ("C65", 4) + '</div><div><div class="bloc-lab">' + esc(g("A67")) + "</div>" + champ("C67", 4) + "</div></div>";
      h += '<div class="bloc-lab" style="margin-top:12px">' + esc(g("A69")) + '</div><div class="entete-tab t3"><div>' + esc(g("A70")) + "</div><div>" + esc(g("C70")) + "</div><div>" + esc(g("E70")) + "</div></div>";
      for(var row = 71; row <= 73; row++) h += '<div class="ligne-tab t3"><div class="lab">' + esc(g("A" + row)) + '</div><div data-l="' + esc(g("C70")) + '">' + date("C" + row) + '</div><div data-l="' + esc(g("E70")) + '">' + champ("E" + row, 1) + "</div></div>";
      return h;
    },
    9: function(){ return champ("A76", 6) + encSuivi(); },
    10: function(){
      var h = '<div class="titre-b">' + btnBareme("exp") + '</div><p class="note">' + esc(g("A91")) + (D.papier === false ? "<br><b>Autoévaluation reçue en ligne : notes de l’employé modifiables (le texte que vous écrivez remplace sa réponse).</b>" : "") + "</p>";
      for(var row = 93; row <= 98; row++) h += '<div class="rang rg3e' + papier() + '"><div class="lab">' + esc(g("A" + row)) + "</div>" + puces("E" + row, 5, {na: true, rose: vide("E" + row), lecture: ro()}) + champ("G" + row, 1, "Commentaire facultatif", false) + "</div>";
      return h;
    },
    11: function(){ return '<div class="' + papier() + '"><div class="bloc-lab">' + esc(g("A101")) + "</div>" + champ("A102", 4, "", false) + '<div class="bloc-lab" style="margin-top:12px">' + esc(g("A104")) + "</div>" + champ("A105", 4, "", false) + encSuivi(true) + "</div>"; },
    12: function(){
      var manque = NOTES.filter(estRose), o = obj(), CR = ["C26", "C27", "C28"], VA = ["E38", "E39", "E40", "E41", "E42"];
      function lib(a){ return g("A" + a.slice(1)); }
      var app = NOTES.filter(function(a){ return !(a === "C29" && !o); }), comp = Math.round((app.length - manque.length) / app.length * 100);
      var T = CR.concat(VA).filter(function(a){ return !vide(a); }).map(function(a){ return {l: lib(a), n: Number(r(a))}; });
      var f = T.filter(function(x){ return x.n >= 8; }).sort(function(x, y){ return y.n - x.n; }).slice(0, 3).map(function(x){ return x.l; }), w = T.filter(function(x){ return x.n <= 6; }).sort(function(x, y){ return x.n - y.n; }).slice(0, 2).map(function(x){ return x.l; }), c29 = Number(r("C29"));
      if(o && !vide("C29") && c29 < 0.8) w.push("Atteinte des objectifs (" + Math.round(80 - c29 * 100) + " points sous la cible)");
      var np = 0; [71, 72, 73].forEach(function(rw){ if(String(r("E" + rw) || "").trim()) np++; });
      var gaps = CR.concat(VA).map(function(a){ var em = Number(emp(a)), ev = Number(r(a)); return (vide(a) || !(em >= 1)) ? null : Math.abs(ev - em); }).filter(function(x){ return x !== null; }), ec = gaps.length ? gaps.reduce(function(x, y){ return x + y; }, 0) / gaps.length : null;
      var bw = [26, 27, 28, 29, 30].map(function(x){ return Number(r("B" + x)) || 0; }), c = ptsLive();
      var pts = c.rows.map(function(q){ return "<div><span>▪ " + esc(q[0]) + "</span><b" + (q[1] == null ? ' class="manque"' : "") + ">" + (q[1] == null ? "—" : Math.round(q[1])) + " / " + q[2] + "</b></div>"; }).join("") + '<div class="tot"><span>▪ Total</span><b>' + (c.total == null ? "—" : Math.round(c.total) + " %") + "</b></div>";
      return '<div class="bg"><div class="bk bscore"><h2>Pointage indicatif</h2><div class="bgrand"><span>' + fmtScore() + '</span></div><div class="bsep"></div><div class="bnote">Il aide à décider le positionnement, ce n’est pas un résultat direct.</div><div class="bcomp">COMPLET À <b>' + comp + " %</b>" + (manque.length ? "<br><small>Manque : " + manque.length + " critère" + (manque.length > 1 ? "s" : "") + "</small>" : "<br><small>Toutes les notes sont enregistrées.</small>") + '</div></div><div class="bk"><h2>En un coup d’œil</h2><div class="bpts">' + pts + '</div></div><div class="bk"><h2>Ce qu’on retient</h2>' +
        (f.length ? '<p class="bf">▪ <b>Forces :</b> ' + f.map(esc).join(", ") + "</p>" : "") + (w.length ? '<p class="bf">▪ <b>À travailler :</b> ' + w.map(esc).join(", ") + "</p>" : "") + (np ? '<p class="bf">▪ <b>Priorités :</b> ' + np + " convenue" + (np > 1 ? "s" : "") + "</p>" : "") + (ec != null ? '<p class="bf">▪ <b>Écart avec l’employé :</b> ' + (ec < 1 ? "faible" : (ec < 2 ? "moyen" : "important")) + "</p>" : "") + "</div></div>";
    }
  };
  function faite(n){
    var id = ["rencontre", "xp", "comp", "val", "dev", "rythme", "nc", "prio", "comm", "exp", "prep", "bilan"][n - 1];
    if(id === "comp") return ["C26", "C27", "C28"].every(function(a){ return !estRose(a); });
    if(id === "val") return ["E38", "E39", "E40", "E41", "E42"].every(function(a){ return !estRose(a); });
    if(id === "rythme" && Number(r("B29"))) return !estRose("C29") && vus[n];
    if(id === "rencontre") return true;
    if(id === "bilan") return NOTES.every(function(a){ return !estRose(a); });
    return !!vus[n];
  }
  var vus = {};

  function squelette(){
    app.innerHTML = '<div class="page sans-instant rvpage"><a class="retour" href="#" id="retour">Retour</a><h1>Rencontre d’évaluation</h1><div class="revw rvo" id="revw"><header><div class="haut"><div class="qui"><div class="nom">' + esc(D.employe) + '</div><div class="sous">Rencontre ' + esc(D.rencontre) + " · " + esc(D.annee) + (D.categorie ? " · " + esc(D.categorie) : "") + (g("A33") ? " · " + esc(g("A33").split(" (")[0]) : "") + " · Évaluateur : " + esc(D.evaluateur || "") + ' · Portail rencontre évaluation</div></div><div class="score"><div><div class="lib">Pointage indicatif</div><div class="jauge"><div id="revj"></div></div></div><div class="val" id="revv">—</div></div></div><div class="etapes" id="revp"></div></header><main id="revx"></main><footer><div class="msg" id="revs"></div><button type="button" class="rvb" id="revpre">Précédent</button><button type="button" class="rvb noir" id="revsui">Suivant</button></footer></div></div>';
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); revFermer(); };
    document.getElementById("revpre").onclick = function(){ aller(etape - 1); };
    document.getElementById("revsui").onclick = function(){ if(etape === 12) confirmerFin(); else aller(etape + 1); };
    var w = document.getElementById("revw");
    w.addEventListener("click", function(e){
      var b = e.target.closest ? e.target.closest("button") : null; if(!b || b.disabled) return;
      if(b.hasAttribute("data-bareme")){ ouvrirBareme(b.getAttribute("data-bareme")); return; }
      if(b.hasAttribute("data-acq")){ acquis(+b.getAttribute("data-acq")); return; }
      if(b.hasAttribute("data-a") && b.hasAttribute("data-v")){ var v = b.getAttribute("data-v"); ecrire(b.getAttribute("data-a"), /^\d+$/.test(v) ? +v : v); majEtape(true); }
      else if(b.hasAttribute("data-ry")){ var n = b.getAttribute("data-ry"); S["R" + n] = b.getAttribute("data-o"); ecrire(b.getAttribute("data-c") + n, true); majEtape(true); }
      else if(b.hasAttribute("data-p")){ ecrire("C29", +b.getAttribute("data-p") / 100); majEtape(true); }
      else if(b.hasAttribute("data-n")) aller(+b.getAttribute("data-n"));
    });
    w.addEventListener("input", function(e){ var t = e.target; if(t && t.tagName === "TEXTAREA"){ t.style.height = "auto"; t.style.height = t.scrollHeight + 2 + "px"; ajuster(); } });
    w.addEventListener("change", function(e){
      var t = e.target; if(!t || t.disabled) return;
      if(t.hasAttribute("data-a")) ecrire(t.getAttribute("data-a"), t.value);
      else if(t.hasAttribute("data-pa")){ var k = Math.max(0, Math.min(100, +t.value || 0)); ecrire("C29", k / 100); majEtape(true); }
      else if(t.hasAttribute("data-ry")){ var d = w.querySelector('[data-ry="D"]'), f = w.querySelector('[data-ry="F"]'); if(d && f && d.value && f.value) ecrire("C56", "du " + ryTxt(d.value) + " au " + ryTxt(f.value)); }
    });
    addEventListener("keydown", function(e){ if(e.key === "Escape") fermerBareme(); });
    addEventListener("resize", ajuster);
  }
  function pastilles(){
    var h = ""; for(var i = 2; i <= 12; i++) h += '<button type="button" class="pastille' + (i === etape ? " active" : "") + (faite(i) ? " faite" : "") + '" data-n="' + i + '" aria-label="Étape ' + (i - 1) + ", " + esc(REV_TITRES[i - 1]) + '"><span class="rond">' + (i - 1) + '</span><span class="lb">' + esc(REV_TITRES[i - 1]) + "</span></button>";
    document.getElementById("revp").innerHTML = h;
    var t = ptsLive().total; document.getElementById("revv").textContent = fmtScore(); document.getElementById("revj").style.width = (t == null ? 0 : Math.max(0, Math.min(100, t))) + "%";
    document.getElementById("revpre").disabled = etape === 2; var sui = document.getElementById("revsui"), fin = etape === 12; sui.textContent = fin ? "Terminer la rencontre" : "Suivant"; sui.disabled = fin && NOTES.some(function(a){ return estRose(a); });
  }
  var SANS_TITRE = {3: 1, 4: 1, 10: 1};   // ces étapes affichent le titre avec le bouton « Voir le barème »
  function titreEtape(){
    var t = etape === 5 ? (g("A43") || "Connaissances et développement") : etape === 8 ? (g("A64") || "Priorités et engagements") : etape === 9 ? g("A75") : etape === 10 ? g("A90") : etape === 11 ? g("A100") : etape === 12 ? "Bilan de la rencontre" : etape === 3 ? "Évaluation des compétences" : etape === 4 ? "Valeurs humaines" : REV_TITRES[etape - 1];
    return t;
  }
  function majEtape(garde){
    var x = document.getElementById("revx"); if(!x) return;
    var foc = garde && document.activeElement && document.activeElement.getAttribute ? document.activeElement.getAttribute("data-a") : null;
    vus[etape] = true;
    var corps = ET[etape](), titre = esc(titreEtape());
    if(SANS_TITRE[etape]) corps = corps.replace('<div class="titre-b">', '<div class="titre-b"><h1>' + titre + "</h1>");
    else corps = "<h1>" + titre + "</h1>" + corps;
    x.innerHTML = corps; pastilles();
    if(foc){ var q = x.querySelector('[data-a="' + foc + '"]'); if(q && q.tagName !== "BUTTON") q.focus(); }
    fitAll(); ajuster();
  }
  // Aucun texte caché: tout champ texte grandit selon son contenu (plusieurs lignes au besoin).
  function fitAll(){ var w = document.getElementById("revw"); if(!w) return; var L = w.querySelectorAll("textarea"); for(var i = 0; i < L.length; i++){ L[i].style.height = "auto"; if(L[i].scrollHeight) L[i].style.height = L[i].scrollHeight + 2 + "px"; } }
  function aller(n){ if(n < 2 || n > 12) return; vus[etape] = true; etape = n; majEtape(false); window.scrollTo(0, 0); }
  function confirmerFin(){
    if(fenetre) return;
    var v = document.createElement("div"); v.className = "revvoile";
    v.innerHTML = '<div class="revfen"><h2><span>Terminer la rencontre</span></h2><p class="note">Je confirme que toutes les données de la rencontre sont exactes.</p><div style="display:flex;gap:12px;justify-content:flex-end;margin-top:16px"><button type="button" class="rvb" id="revnon">Non</button><button type="button" class="rvb noir" id="revoui">Oui</button></div></div>';
    document.body.appendChild(v); fenetre = v;
    document.getElementById("revnon").onclick = fermerBareme;
    document.getElementById("revoui").onclick = function(){ fermerBareme(); terminer(); };
  }
  // Oui: l'écran se ferme tout de suite; les dernières saisies partent en arrière-plan, puis la rencontre est libérée.
  // Détail des non-conformités: Date | Dossier | Étape | Travail | Non-conformité (colonnes propres à la rencontre; la Réunion garde la sienne).
  function ncTable(L){
    var gr = "display:grid;grid-template-columns:100px 90px 200px 330px 1fr;gap:0 12px;", E = esc, m = function(t){ return typeof rdMin === "function" ? rdMin(t) : t; };
    var h = '<div style="' + gr + 'margin-top:20px;font-size:10px;letter-spacing:.14em;color:#6E6350;text-transform:uppercase"><span>Date</span><span>Dossier</span><span>Étape</span><span>Travail</span><span>Non-conformité</span></div>';
    return h + L.map(function(l){ var tr = [l[2], l[1]].filter(Boolean).join(" · "), det = [l[4], l[5]].filter(Boolean).join(" · ");
      return '<div style="' + gr + 'font-size:13px;margin-top:14px"><span>' + E(rdIsoDate(l[0])) + "</span><span>" + E(l[6] || "—") + "</span><span>" + E(l[3] || "") + "</span><span>" + E(tr) + "</span><span>" + E(det) + "</span></div>"; }).join("");
  }
  // « Acquis »: la compétence du plan s'ajoute à Tâches acquises (C45) et la ligne quitte le plan; « Annuler » pendant 8 secondes remet tout.
  function acquis(row){
    var cols = ["A", "C", "E", "G"], av = cols.map(function(c){ return String(r(c + row)); }), comp = av[1].trim(); if(!comp) return;
    var c45 = String(r("C45")), ligne = "- " + comp.replace(/^\s*[-–]\s*/, "");
    ecrire("C45", (c45.trim() ? c45.replace(/\s+$/, "") + "\n" : "") + ligne); cols.forEach(function(c){ ecrire(c + row, ""); }); majEtape(false);
    var t = document.createElement("div"); t.setAttribute("role", "status"); t.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#000;color:#fff;padding:12px 20px;font-size:14px;z-index:9999";
    t.appendChild(document.createTextNode("Ajouté aux tâches acquises  ")); var u = document.createElement("button"); u.type = "button"; u.textContent = "Annuler"; u.style.cssText = "background:none;border:0;color:#3BEC65;font:inherit;text-decoration:underline;cursor:pointer;padding:0 0 0 8px";
    u.onclick = function(){ ecrire("C45", c45); cols.forEach(function(c, i){ ecrire(c + row, av[i]); }); t.remove(); majEtape(false); };
    t.appendChild(u); document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 8000);
  }
  // Encadré d'information sur le suivi des commentaires: pictogramme de bulle dessiné comme ceux de l'accueil (blocs carrés pleins sur une grille de 24), fond taupe, bordure noire.
  function encSuivi(ch){ return '<div class="encsuivi"><div class="eic">' + '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M2 3h20v3h-20zM2 6h3v9h-3zM19 6h3v9h-3zM2 15h20v3h-20zM5 18h3v3h-3zM8 8h8v2h-8zM8 11h5v2h-5z"/></svg>' + '</div><div class="etx"><div class="et">On fait le suivi de tes ' + (ch ? "changements" : "commentaires") + '</div><p>' + (ch ? "Chaque changement proposé est noté." : "Chaque commentaire est noté.") + ' Consulte « Mes commentaires et changements » dans l’application TEAM pour voir où il en est et notre réponse.</p></div></div>'; }
  function terminer(){
    removeEventListener("resize", ajuster); var f = REV_FIN; REV_FIN = null; menu();
    var t = document.createElement("div"); t.setAttribute("role", "status"); t.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#000;color:#fff;padding:12px 20px;font-size:14px;z-index:9999";
    t.textContent = "Rencontre terminée"; document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 3500);
    var n = 0, iv = setInterval(function(){ n++; if((!enCours && !file.length) || n > 200){ clearInterval(iv); if(typeof f === "function") f(); } }, 300);
  }
  function revFermer(){ removeEventListener("resize", ajuster); fermerBareme(); if(typeof REV_FIN === "function"){ var f = REV_FIN; REV_FIN = null; f(); } menu(); }
  // Grand écran: une page par étape, mise à l'échelle pour tenir dans la fenêtre sans défilement.
  function ajuster(){ var el = document.getElementById("revw"); if(!el){ removeEventListener("resize", ajuster); return; }
    el.style.zoom = 1; el.style.width = ""; if(innerWidth < 1000){ fitAll(); return; }
    el.style.width = "1500px"; fitAll(); var h = el.offsetHeight, haut = el.getBoundingClientRect().top + (window.scrollY || 0), z = Math.min((innerWidth - 64) / 1500, Math.max(1, (innerHeight - haut - 8) / h));   // jamais rapetissé pour la hauteur: une page longue défile
    if(z > 1.8) z = 1.8; if(z < .5) z = 1; el.style.zoom = z; }
  // La date de la rencontre est toujours celle du jour: enregistrée une seule fois si la case est vide.
  // Report d'une rencontre à l'autre: le pont envoie D.report (texte validé à la rencontre précédente) pour les cases encore vides; on les inscrit une fois, sans bruit.
  if(!D.apercu && D.report && typeof D.report === "object"){ Object.keys(D.report).forEach(function(a){ if(D.report[a] && vide(a)) ecrire(a, String(D.report[a]), true); }); }
  if(!D.apercu && vide("B6")){ var q = new Date(); ecrire("B6", q.getFullYear() + "-" + ("0" + (q.getMonth() + 1)).slice(-2) + "-" + ("0" + q.getDate()).slice(-2), true); }
  squelette(); majEtape(false);
  return {aller: aller};
}

// Aperçu fictif (aucune donnée réelle, aucune écriture): sert à montrer le parcours tant que la copie chiffrée n'est pas branchée.
var REV_FICTIF = {employe:"Camille Roy",rencontre:1,annee:2026,categorie:"Acrylique",evaluateur:"Reinaldo",papier:false,
g:{A26:"Connaissances et compétences techniques",A27:"Autonomie et résolution de problèmes",A28:"Qualité et constance du travail",A33:"88 %",
A11:"Insuffisant",A12:"À améliorer",A13:"Passable",A14:"Satisfaisant",A15:"Bien",A16:"Très bien",A17:"Excellent",A18:"Remarquable",A19:"Exceptionnel",A20:"Exemplaire",
A38:"Respect",A39:"Ouverture et innovation",A40:"Responsabilisation",A41:"Collaboration",A42:"Intégrité",C38:"Traite les autres avec courtoisie. Au quotidien : salue, écoute, remercie.",C39:"Propose des idées.",C40:"Assume ses actes.",C41:"Aide les collègues.",C42:"Agit avec honnêteté.",
D30:"Diplôme : DEC +2 % (max 4 %)\nHors métier : 3 ans +3 % (max 6 %)\nMétier / labo : 8 ans +8 % (max 20 %)\nTotal : 13 % (max 20 %)",
A43:"Plan de développement",A44:"Quelles formations aimeriez-vous suivre?",A46:"Quels objectifs de carrière?",A49:"Actions de développement",A50:"Action",C50:"Échéance",E50:"Soutien requis",G50:"Résultat visé",
A56:"Période",A59:"Heures par semaine",A60:"Charge effectuée",A61:"Charge non terminée",A62:"Objectifs atteints",C59:"40",C60:"80",C61:"5",C62:"80",
A64:"Priorités",A65:"Priorités à court terme",A67:"Priorités à long terme",A69:"Plan d’action",C70:"Date",E70:"Action",A71:"Priorité 1",A72:"Priorité 2",A73:"Priorité 3",
A75:"Commentaires de l’employé",A90:"Mon expérience",A91:"Évalue chaque énoncé de 1 à 5.",A93:"Je me sens écouté",A94:"Mon horaire me convient",A95:"Mes outils sont adéquats",A96:"Je reçois de la formation",A97:"Mon équipe collabore",A98:"Je recommanderais LDLD",
A100:"Préparer la rencontre",A101:"Ce dont je suis le plus fier",A104:"Ce que j’aimerais changer"},
r:{B6:"2026-11-17",B26:.3,B27:.3,B28:.4,B29:.2,B30:.2,C30:13,C26:8,C27:7,C28:8,C29:.85,E38:9,E39:8,E40:8,E41:9,E42:9,D26:"Très bonne maîtrise des étapes de finition.",D27:"Demande de l’aide au bon moment.",E59:"39",E60:"88",E61:"7",C56:"du 1 mai 2026 au 31 oct. 2026",A76:"Très motivé.",E71:"Formation coloration",E93:5,E94:4,E95:3,E96:5,E97:5,E98:4,A102:"La finition des pièces.",A105:"Plus de formation."},
notes:{C26:{em:7},C27:{em:8},C28:{em:8},E38:{em:9},E39:{em:7},E40:{em:8},E41:{em:9},E42:{em:9}},rythme:["Augmentation","","Maintien","Maintien"],gx:{ok:true,ch:40,semaines:24,dCE:"88 · 90 · 85 · 86 · 92 · 87",dCN:"7 · 6 · 8 · 5 · 9 · 7",dObj:"80 · 78 · 82 · 75 · 79 · 76"},
nc:{ok:true,mois:[2,1,0,3,1,2,1,0,2,1,0,2].map((n,i)=>({label:"JFMAMJJASOND"[i],n})),n6:6,n12:15,typeTop:"Retouche",detail:[{d:"3 nov.",cat:"Acrylique",dos:"D-4521",type:"Retouche",com:"Teinte"},{d:"20 oct.",cat:"Acrylique",dos:"D-4488",type:"Retouche",com:""}]}};
// Écran de départ: page d'accueil de la page web d'origine (rAccueil), reproduite à l'identique.
var REV_EMPLOYES = [["Camille Roy","Acrylique",true,true,"17 nov. 2026",true],["Julien Tremblay","Céramique",false,true,"24 nov. 2026",true],["Sophie Gagnon","Finition",true,false,"2 déc. 2026",true],["Marc Lavoie","Modélisation",false,true,"—",false],["Isabelle Côté","Administratif",false,false,"9 déc. 2026",false],["Nadia Bergeron","Acrylique",true,true,"15 déc. 2026",true]];
// liste: [nom, catégorie, rencontre 1 faite, rencontre 2 prévue, date, autoévaluation complétée]. Tous les employés sont proposés.
function revAujourdhui(){ var d = new Date(); return d.getDate() + (d.getDate() === 1 ? "er " : " ") + REV_MOIS[d.getMonth()] + " " + d.getFullYear(); }
function revChoix(liste, ouvrir, annee, evaluateur){
  liste = liste.filter(function(e){ return e[5]; });   // seulement les employés dont l'autoévaluation est remplie
  var sel = -1, renc = 1;
  app.innerHTML = '<div class="rvacc on" id="rvacc"></div>';
  function dessiner(){
    var ok = sel >= 0, e = ok ? liste[sel] : null, r2 = ok && ((e[2] && e[3]) || e[6] === 2), mots = ok ? e[0].trim().split(/\s+/) : [], prenom = mots.slice(0, -1).join(" ") || mots[0] || "", nom = mots.length > 1 ? mots[mots.length - 1] : "";
    var h = '<div class="haut"><span></span><div style="text-align:right">Appréciation<br>de la contribution<br><span style="color:#B4AB9B">' + esc(annee) + "</span></div></div>";
    if(ok) h += '<div class="centre"><div class="k1">Bienvenue à votre rencontre d’évaluation</div><div class="nom" style="--n:' + Math.max(8, (String(prenom) + " " + String(nom)).length) + '"><span>' + esc(prenom) + "</span> <span>" + esc(nom) + '</span></div><div class="mv" aria-hidden="true"><div class="b1"></div><div class="b2"></div><div class="fen"></div></div><div class="renc">Rencontre ' + renc + (evaluateur ? " avec " + esc(evaluateur.trim().split(/\s+/)[0]) : "") + '</div>' + '<div class="rdate">' + esc(revAujourdhui()) + "</div>" + "</div>";
    h += '<div class="bas"><div><div class="lab">Employé</div><select id="accEmp"' + (ok ? "" : ' class="rose"') + '><option value="" disabled' + (ok ? "" : " selected") + ">" + (liste.length ? "Choisir un employé" : "Aucune autoévaluation remplie") + "</option>" + liste.map(function(x, i){ return "<option value=\"" + i + "\"" + (ok && i === sel ? " selected" : "") + ">" + esc(x[0]) + "</option>"; }).join("") + "</select></div>";
    if(ok) h += '<div><div class="lab">Rencontre</div>' + [1, 2].filter(function(n){ return n === 1 || r2; }).map(function(n){ return '<button type="button" class="lienR' + (renc === n ? " on" : "") + '" data-accr="' + n + '">0' + n + "</button>"; }).join("&nbsp;&nbsp;&nbsp;") + "</div>";
    h += '<button type="button" class="go" id="accGo"' + (ok ? "" : " disabled") + '>Ouvrir la rencontre</button></div><div class="bl accbl"><a href="#" class="rt" id="accRet" aria-label="Retour">←</a><h1 class="ti">Rencontre d’évaluation</h1></div>';
    var a = document.getElementById("rvacc"); a.innerHTML = h;
    document.getElementById("accEmp").onchange = function(){ var v = document.getElementById("accEmp").value; if(v === "") return; sel = +v; renc = liste[sel][6] || 1; dessiner(); };
    Array.prototype.forEach.call(a.querySelectorAll("[data-accr]"), function(b){ b.onclick = function(){ renc = +b.getAttribute("data-accr"); dessiner(); }; });
    document.getElementById("accGo").onclick = function(){
      if(sel < 0) return; var bt = this, t0 = bt.textContent; if(bt.getAttribute("data-occ")) return;
      bt.setAttribute("data-occ", "1"); bt.textContent = "Ouverture en cours"; bt.style.opacity = ".6";   // l'appui se voit tout de suite
      var rendre = function(){ bt.removeAttribute("data-occ"); bt.textContent = t0; bt.style.opacity = ""; };
      var p; try { p = ouvrir(liste[sel][0], renc); } catch(e){ rendre(); throw e; }
      if(p && p.then){ p.then(rendre, rendre); setTimeout(function(){ if(bt.getAttribute("data-occ")){ rendre(); revBandeau("Ouverture trop longue", "Le serveur ne répond pas. Réessaie dans un instant."); } }, 45000); } else setTimeout(rendre, 1500);
    };
    try { ajusterTitre(a.querySelector(".accbl h1.ti")); setTimeout(function(){ try { ajusterTitre(a.querySelector(".accbl h1.ti")); } catch(e){} }, 400); } catch(e){}
    document.getElementById("accRet").onclick = function(){ menu(); };
  }
  dessiner();
}
// Branchement sur le Service (actions rencontre_eval_*): inerte tant que le Service répond « Non disponible. » (aperçu fictif dans ce cas).
function revBandeau(titre, texte){
  var a = document.getElementById("rvacc"); if(!a) return;
  var o = a.querySelector(".rvband"); if(o) o.remove();
  var b = document.createElement("div"); b.className = "rvband"; b.setAttribute("role", "alert");
  b.innerHTML = "<b>" + esc(titre) + "</b>" + esc(texte); a.appendChild(b);
  setTimeout(function(){ if(b.parentNode) b.remove(); }, 12000);
}
function revSvc(corps){ corps.session = sessionGardee(); return appelService(corps); }
function revDemarrer(){
  revSvc({action: "rencontre_eval_liste"}).then(function(r){
    var L = r && r.ok ? (r.liste || r.employes || r.donnees) : null;
    if(!L || !L.length) return revApercu();
    var liste = L.map(function(e){ return [e.nom, e.categorie || "", !!e.r1Faite, e.r2Prevue !== false, e.datePrevue || "—", !!e.autoevalOk]; });
    // Même règle que Planification évaluation: rencontre dans les 14 prochains jours dont l'autoévaluation est remplie (donnée ae_planif_lire)
    return revSvc({action: "ae_planif_lire"}).then(function(p){
      if(!p || !p.ok || p.autoeval_ok === false || !(p.lignes || []).length) return;
      var d = new Date(), f = new Date(); f.setDate(f.getDate() + 14);
      var j = function(x){ return x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-" + ("0" + x.getDate()).slice(-2); }, t = j(d), fin = j(f), m = {};
      p.lignes.forEach(function(e){ var x = aepNormaliser(e), k = String(x.nom || "").trim().toLowerCase();
        [[1, x.d1, e.autoeval1], [2, x.d2, e.autoeval2]].forEach(function(q){ if(q[1] && q[1] >= t && q[1] <= fin && q[2] === true && !m[k]) m[k] = q[0]; }); });
      liste.forEach(function(e){ var n = m[String(e[0]).trim().toLowerCase()]; e[5] = !!n; if(n) e[6] = n; });
    }).catch(function(){}).then(function(){ revMontrer(liste); });
  }).catch(function(){ revApercu(); });
}
function revMontrer(liste){
    revChoix(liste, function(nom, renc){
      return revSvc({action: "rencontre_eval_verrou", op: "prendre", nom: nom, rencontre: renc}).then(function(v){
        if(!v || !v.ok){ revBandeau("Rencontre déjà ouverte", (v && (v.erreur || v.message)) || "Une autre personne a la rencontre ouverte. Une seule personne à la fois. Réessaie dans quelques minutes."); return; }
        return revSvc({action: "rencontre_eval_lire", nom: nom, rencontre: renc}).then(function(d){
          var D = d && d.ok ? (d.D || d.d || d.donnees || d) : null;
          if(!D || !D.g){ revSvc({action: "rencontre_eval_verrou", op: "liberer"}); revBandeau("Chargement impossible", "La rencontre n’a pas pu être lue. Rien n’a été modifié et la rencontre est libérée. Réessaie."); return; }
          var bat = setInterval(function(){ revSvc({action: "rencontre_eval_verrou", op: "battre"}).catch(function(){}); }, 30000);
          REV_FIN = function(){ clearInterval(bat); revSvc({action: "rencontre_eval_verrou", op: "liberer"}).catch(function(){}); };
          revOuvrir(D, {ecrire: function(adresse, valeur){ return revSvc({action: "rencontre_eval_ecrire", nom: nom, rencontre: renc, adresse: adresse, valeur: valeur, cle: D.cle}).then(function(x){ if(!x || !x.ok) throw new Error((x && (x.erreur || x.message)) || "refus"); return x; }); }});
        });
      }).catch(function(){ revBandeau("Connexion impossible", "Réessaie dans quelques instants."); });
    }, new Date().getFullYear(), "");
}
function revApercu(){
  revChoix(REV_EMPLOYES, function(nom, renc){
    var D = JSON.parse(JSON.stringify(REV_FICTIF)); D.employe = nom; D.rencontre = renc; revOuvrir(D);
    var b = document.createElement("div"); b.className = "revbn"; b.textContent = "Aperçu avec des données fictives. Rien n’est enregistré."; var w = document.getElementById("revw"); if(w) w.insertBefore(b, w.firstChild);
  }, 2026, "Reinaldo");
}
