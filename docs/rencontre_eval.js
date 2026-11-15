// Rencontre d'évaluation: parcours en 12 étapes (Précédent/Suivant), même contenu sur cellulaire et grand écran.
// Cellulaire: une étape à la fois, sections l'une sous l'autre. Grand écran: une page par étape, en colonnes, mise à l'échelle sans défilement.
// Couche d'accès isolée (revAcces): lire/écrire une case. Branchée plus tard sur la copie chiffrée; fictive tant que l'EFVP n'est pas acceptée.
var revAcces = {
  ecrire: function(adresse, valeur){ return Promise.resolve({ok: true}); }
};
var REV_TITRES = ["Rencontre", "Expérience", "Compétences", "Valeurs", "Développement", "Objectifs et charges", "Non-conformités", "Priorités", "Commentaires", "Mon expérience", "Préparer", "Bilan"];
var REV_NOTES = ["C26", "C27", "C28", "C29", "E38", "E39", "E40", "E41", "E42"];

function revOuvrir(D, acces){
  var A = acces || revAcces, S = {}, etape = 1, file = [], enCours = false, dernier = "";
  var NOTE_OK = ["C26", "C27", "C28", "C29", "E38", "E39", "E40", "E41", "E42"];
  function g(a){ var v = D.g && D.g[a]; return v === undefined || v === null ? "" : String(v); }
  function r(a){ if(S.hasOwnProperty(a)) return S[a]; var v = D.r && D.r[a]; return v === undefined || v === null ? "" : v; }
  function ro(){ return D.papier === false; }   // autoévaluation reçue en ligne: certaines réponses de l'employé ne se modifient pas
  function nvide(a){ var v = r(a); return v === "" || v === null || v === undefined; }
  function rose(a){ return nvide(a) ? " rose" : ""; }
  function envoyer(){
    if(enCours || !file.length) return; enCours = true; var q = file.shift();
    A.ecrire(q.a, q.v).then(function(x){ var n = new Date(); dernier = "Reçu à " + n.getHours() + " h " + ("0" + n.getMinutes()).slice(-2); }).catch(function(){ dernier = "Enregistrement impossible. Réessaie."; }).then(function(){ enCours = false; var e = document.getElementById("revs"); if(e) e.textContent = dernier; envoyer(); });
  }
  function ecrire(a, v){ S[a] = v; file.push({a: a, v: v}); var e = document.getElementById("revs"); if(e) e.textContent = "Enregistrement…"; envoyer(); }
  function nombre(a){ var v = parseFloat(String(r(a)).replace(",", ".")); return isNaN(v) ? null : v; }
  function emp(a){ var n = D.notes && D.notes[a]; return n ? n.em : null; }
  // Note de 1 à 10 (ou 1 à 5): ev = valeur de l'évaluateur, em = valeur de l'employé (lecture seule, contour noir)
  function chips(a, max, lecture){
    var v = nombre(a), e = emp(a), h = '<div class="revn' + (max === 5 ? ' c5' : '') + rose(a) + '">';
    for(var i = 1; i <= max; i++) h += '<button type="button" class="revb' + (v === i ? ' on' : '') + (e === i ? ' em' : '') + '"' + (lecture ? ' disabled' : ' data-a="' + a + '" data-v="' + i + '"') + '>' + i + '</button>';
    return h + '</div>';
  }
  function texte(a, lignes, lecture, ph){ return '<textarea class="revt" rows="' + lignes + '" data-a="' + a + '"' + (lecture ? ' disabled' : '') + ' placeholder="' + esc(ph || "") + '">' + esc(r(a)) + '</textarea>'; }
  function ligneTexte(a, lecture, ph){ return '<input type="text" class="revt un" data-a="' + a + '" value="' + esc(r(a)) + '"' + (lecture ? ' disabled' : '') + ' placeholder="' + esc(ph || "") + '">'; }
  function carte(h){ return '<div class="revc">' + h + '</div>'; }
  function titre(t){ return '<div class="revh">' + esc(t) + '</div>'; }
  function barme(a1, a2){
    var l = ""; for(var i = 11; i <= 20; i++) l += '<div><b>' + (i - 10) + '</b> ' + esc(g("A" + i)) + ' ' + esc(g("B" + i)) + '</div>';
    return '<details class="revbar"><summary>Voir le barème</summary>' + l + '</details>';
  }
  function faite(n){
    var tous = function(l){ return l.every(function(a){ return !nvide(a); }); }, un = function(l){ return l.some(function(a){ return !nvide(a); }); };
    switch(n){
      case 1: return !nvide("B6");
      case 2: case 7: case 12: return true;
      case 3: return tous(["C26", "C27", "C28"]);
      case 4: return tous(["E38", "E39", "E40", "E41", "E42"]);
      case 5: return un(["C45", "C47"]);
      case 6: return un(["E59", "E60", "E61", "C56"]);
      case 8: return un(["C65", "C67"]);
      case 9: return !nvide("A76");
      case 10: return un(["E93", "E94", "E95", "E96", "E97", "E98"]);
      case 11: return un(["A102", "A105"]);
    }
    return false;
  }
  function moy(l){ var v = l.map(nombre).filter(function(x){ return x !== null; }); return v.length ? v.reduce(function(s, x){ return s + x; }, 0) / v.length : null; }

  // ---- Étapes ----
  var ET = {
    1: function(){
      return '<div class="revg g2"><div>' + titre("Employé") + carte('<div class="revl"><b>' + esc(D.employe) + '</b></div><div class="revk">Rencontre ' + esc(D.rencontre) + ' · ' + esc(D.annee) + ' · ' + esc(D.categorie) + '</div><div class="revk">Évaluateur · ' + esc(D.evaluateur || "") + '</div>') +
        (g("A33") ? titre("Position actuelle") + carte('<div class="revl"><b>' + esc(g("A33")) + '</b></div>') : '') + '</div>' +
        '<div>' + titre("Date de la rencontre") + carte('<input type="date" class="revt un' + rose("B6") + '" data-a="B6" value="' + esc(r("B6")) + '">') + '</div></div>';
    },
    2: function(){
      var L = g("D30").split(/\n+/).filter(function(x){ return x.trim(); });
      return '<div class="revg g1">' + titre("Expérience (lecture seule)") + (L.length ? L.map(function(x){ return carte('<div class="revl">' + esc(x) + '</div>'); }).join("") : carte('<div class="revk">Aucune donnée d’expérience.</div>')) + '</div>';
    },
    3: function(){
      var h = '<div class="revg g2">';
      [26, 27, 28].forEach(function(n){ h += '<div>' + carte('<div class="revl"><b>' + esc(g("A" + n)) + '</b></div><div class="revk">Évaluateur · contour noir: note de l’employé</div>' + chips("C" + n, 10) + texte("D" + n, 2, false, "Observations")) + '</div>'; });
      return h + '<div>' + barme() + '</div></div>';
    },
    4: function(){
      var h = '<div class="revg g2">';
      [38, 39, 40, 41, 42].forEach(function(n){
        var d = g("C" + n).split(/Au quotidien\s*:/i);
        h += '<div>' + carte('<div class="revl"><b>' + esc(g("A" + n)) + '</b></div>' + (d[0].trim() ? '<div class="revk">' + esc(d[0].trim()) + '</div>' : '') + (d[1] ? '<div class="revk">Au quotidien: ' + esc(d[1].trim()) + '</div>' : '') + chips("E" + n, 10) + '<div class="revk">Observations de l’employé</div>' + ligneTexte("I" + n, ro())) + '</div>';
      });
      return h + '<div>' + barme() + '</div></div>';
    },
    5: function(){
      var h = '<div class="revg g3"><div>' + titre(g("A43")) + carte('<div class="revl">' + esc(g("A44")) + '</div>' + texte("C45", 4)) + carte('<div class="revl">' + esc(g("A46")) + '</div>' + texte("C47", 4)) + '</div><div class="sp2">' + titre(g("A49")) + '<div class="revdeux">';
      [51, 52, 53].forEach(function(n){ h += carte('<div class="revk">' + esc(g("A50")) + '</div>' + ligneTexte("A" + n) + '<div class="revk">' + esc(g("C50")) + '</div>' + ligneTexte("C" + n) + '<div class="revk">' + esc(g("E50")) + '</div>' + ligneTexte("E" + n) + '<div class="revk">' + esc(g("G50")) + '</div>' + ligneTexte("G" + n)); });
      return h + '</div></div></div>';
    },
    6: function(){
      if(/^(administratif|gestionnaire)/i.test(D.categorie || "")) return '<div class="revg g1">' + carte('<div class="revl">Pas de tableau de bord pour ce poste.</div>') + '</div>';
      var gx = D.gx && D.gx.ok, pond = nombre("B29") > 0 || (D.r && D.r.B29 > 0), h = '<div class="revg g3"><div>' + titre("Période") + carte('<div class="revk">' + esc(g("A56")) + '</div>' + ligneTexte("C56"));
      h += '__POND__</div><div class="sp2">' + titre("Indicateurs") + '<div class="revdeux">';
      [59, 60, 61, 62].forEach(function(n, k){
        var cible = n === 62 ? esc(g("C62")) : esc(g("C" + n)), real = n === 62 ? esc(r("C29")) : '';
        var cur = (D.rythme && D.rythme[k]) || "";
        ["G", "I", "K"].forEach(function(c){ if(S.hasOwnProperty("R" + n)) cur = S["R" + n]; });
        h += carte('<div class="revl"><b>' + esc(g("A" + n)) + '</b><span class="revk">Cible ' + cible + '</span></div>' +
          (n < 62 ? '<div class="revk">Réalisé</div>' + ligneTexte("E" + n, gx) : '') +
          '<div class="revk">Objectif</div><div class="revch">' + [["Augmentation", "G"], ["Réduction", "I"], ["Maintien", "K"]].map(function(o){ return '<button type="button" class="revb2' + (cur === o[0] ? ' on' : '') + '" data-ry="' + n + '" data-c="' + o[1] + '" data-o="' + o[0] + '">' + o[0] + '</button>'; }).join("") + '</div>');
      });
      h += '</div></div>';
      var pd = "";
      if(pond){
        var v = nombre("C29"), p = v === null ? null : Math.round(v <= 1 ? v * 100 : v);
        pd = titre("Note pour la pondération") + carte('<div class="revch">' + [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map(function(k){ return '<button type="button" class="revb2' + (p === k ? ' on' : '') + '" data-p="' + k + '">' + k + '</button>'; }).join("") + '</div><div class="revk">Autre (0 à 100)</div><input type="number" min="0" max="100" class="revt un" data-pa="1" value="' + (p === null ? "" : p) + '"><div class="revk">Observations sur les objectifs</div>' + texte("D29", 2));
      }
      return h.replace("__POND__", pd) + '</div>';
    },
    7: function(){
      var N = D.nc;
      if(!N || !N.ok) return '<div class="revg g1">' + carte('<div class="revl">' + esc((N && N.raison) || "Données indisponibles.") + '</div>') + '</div>';
      var mx = Math.max.apply(null, N.mois.map(function(m){ return m.n; }).concat([1])), bars = '<svg viewBox="0 0 ' + (N.mois.length * 30) + ' 90" class="revsv" role="img" aria-label="Non-conformités sur 12 mois">' + N.mois.map(function(m, i){ var hh = Math.round(m.n / mx * 60); return '<rect x="' + (i * 30 + 5) + '" y="' + (70 - hh) + '" width="20" height="' + hh + '" fill="' + (i < 6 ? "#8D806A" : "#000000") + '"/><text x="' + (i * 30 + 15) + '" y="84" font-size="8" text-anchor="middle" fill="#6E6350">' + esc(m.label) + '</text><text x="' + (i * 30 + 15) + '" y="' + (66 - hh) + '" font-size="9" text-anchor="middle" fill="#000000">' + m.n + '</text>'; }).join("") + '</svg>';
      return '<div class="revg g3"><div>' + titre("6 mois") + carte('<div class="revgr">' + esc(N.n6) + '</div>') + titre("12 mois") + carte('<div class="revgr">' + esc(N.n12) + '</div>') + titre("Type le plus fréquent") + carte('<div class="revl">' + esc(N.typeTop || "—") + '</div>') + '</div><div>' + titre("12 derniers mois") + carte(bars) + '</div><div>' + titre("Détail des 6 derniers mois") +
        (N.detail || []).slice(0, 6).map(function(d){ return carte('<div class="revl"><b>' + esc(d.d) + '</b> · ' + esc(d.type || "") + '</div><div class="revk">' + esc(d.cat || "") + ' · ' + esc(d.dos || "") + '</div>' + (d.com ? '<div class="revk">' + esc(d.com) + '</div>' : '')); }).join("") + ((N.detail || []).length > 6 ? '<div class="revk">+ ' + ((N.detail || []).length - 6) + ' autres</div>' : '') + '</div></div>';
    },
    8: function(){
      var h = '<div class="revg g2"><div>' + titre(g("A64")) + carte('<div class="revl">' + esc(g("A65")) + '</div>' + texte("C65", 4)) + carte('<div class="revl">' + esc(g("A67")) + '</div>' + texte("C67", 4)) + '</div><div>' + titre(g("A69"));
      [71, 72, 73].forEach(function(n){ h += carte('<div class="revl"><b>' + esc(g("A" + n)) + '</b></div><div class="revk">' + esc(g("C70")) + '</div><input type="date" class="revt un" data-a="C' + n + '" value="' + esc(r("C" + n)) + '"><div class="revk">' + esc(g("E70")) + '</div>' + ligneTexte("E" + n)); });
      return h + '</div></div>';
    },
    9: function(){ return '<div class="revg g1">' + titre(g("A75")) + carte(texte("A76", 8)) + '</div>'; },
    10: function(){
      var h = '<div class="revg g3"><div>' + titre(g("A90")) + '<div class="revk">' + esc(g("A91")) + '</div>' + (ro() ? carte('<div class="revk">Autoévaluation reçue en ligne: cette réponse ne peut pas être modifiée.</div>') : "") + '</div><div class="sp2"><div class="revdeux">';
      [93, 94, 95, 96, 97, 98].forEach(function(n){ h += carte('<div class="revl"><b>' + esc(g("A" + n)) + '</b></div>' + chips("E" + n, 5, ro()) + '<div class="revk">Commentaire facultatif</div>' + ligneTexte("G" + n, ro())); });
      return h + '</div></div></div>';
    },
    11: function(){ return '<div class="revg g2"><div>' + titre(g("A100")) + carte('<div class="revl">' + esc(g("A101")) + '</div>' + texte("A102", 5, ro())) + '</div><div>' + titre(g("A103") || "Pour la prochaine rencontre") + carte('<div class="revl">' + esc(g("A104")) + '</div>' + texte("A105", 5, ro())) + '</div></div>'; },
    12: function(){
      var manque = NOTE_OK.filter(function(a){ return (a !== "C29" || nombre("B29") > 0) && nombre(a) === null; }), tot = NOTE_OK.length;
      var P = [["Compétences", moy(["C26", "C27", "C28"]), 2], ["Valeurs humaines", moy(["E38", "E39", "E40", "E41", "E42"]), 3], ["Objectifs et charges", nombre("C29") === null ? null : (nombre("C29") <= 1 ? nombre("C29") * 10 : nombre("C29") / 10), 6], ["Expérience", (function(){ var m = moy(["E93", "E94", "E95", "E96", "E97", "E98"]); return m === null ? null : m * 2; })(), 9]];
      var fortes = [], faibles = [];
      NOTE_OK.forEach(function(a, i){ var v = nombre(a); if(v === null || a === "C29") return; var lib = a < "D" ? g("A" + a.slice(1)) : g("A" + a.slice(1)); if(v >= 8) fortes.push(lib); if(v <= 6) faibles.push(lib); });
      var prio = ["E71", "E72", "E73"].filter(function(a){ return !nvide(a); }).length;
      var ecarts = NOTE_OK.map(function(a){ var e = emp(a), v = nombre(a); return e === null || e === undefined || v === null ? null : Math.abs(v - e); }).filter(function(x){ return x !== null; }), ec = ecarts.length ? ecarts.reduce(function(s, x){ return s + x; }, 0) / ecarts.length : null;
      return '<div class="revg g3"><div>' + titre("État") + carte('<div class="revl"><b>' + (manque.length ? "Il manque " + manque.length + (manque.length > 1 ? " notes" : " note") + " sur " + tot : "Toutes les notes sont saisies") + '</b></div>') + titre("Priorités saisies") + carte('<div class="revgr">' + prio + '</div>') + (ec === null ? "" : titre("Écart moyen évaluateur / employé") + carte('<div class="revgr">' + String(Math.round(ec * 10) / 10).replace(".", ",") + '</div>')) + '</div>' +
        '<div>' + titre("En un coup d’œil") + P.map(function(p){ return carte('<div class="revl"><b>' + p[0] + '</b><span>' + (p[1] === null ? "—" : String(Math.round(p[1] * 10) / 10).replace(".", ",") + " / 10") + '</span></div><div class="revbarre"><i style="width:' + (p[1] === null ? 0 : Math.round(p[1] * 10)) + '%"></i></div><button type="button" class="revlien" data-go="' + p[2] + '">Aller à l’étape</button>'); }).join("") + '</div>' +
        '<div>' + titre("Points forts") + carte(fortes.length ? fortes.slice(0, 3).map(function(x){ return '<div class="revl">' + esc(x) + '</div>'; }).join("") : '<div class="revk">Aucun pour le moment.</div>') + titre("Points à travailler") + carte(faibles.length ? faibles.slice(0, 2).map(function(x){ return '<div class="revl">' + esc(x) + '</div>'; }).join("") : '<div class="revk">Aucun pour le moment.</div>') + '</div></div>';
    }
  };

  function squelette(){
    app.innerHTML = '<div class="page sans-instant"><a class="retour" href="#" id="retour">Retour</a><h1>Rencontre d’évaluation</h1><div class="revw" id="revw"><div class="revs"><span>' + esc(D.employe) + ' · Rencontre ' + esc(D.rencontre) + ' · ' + esc(D.annee) + '</span><span id="revs"></span></div><div class="revp" id="revp"></div><div class="revn1" id="revn1"></div><div id="revx"></div><div class="revnav"><button type="button" class="bouton" id="revpre">Précédent</button><button type="button" class="bouton revsv2" id="revsui">Suivant</button></div></div></div>';
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); revFermer(); };
    document.getElementById("revpre").onclick = function(){ aller(etape - 1); };
    document.getElementById("revsui").onclick = function(){ aller(etape + 1); };
    var w = document.getElementById("revw");
    w.addEventListener("click", function(e){
      var b = e.target.closest ? e.target.closest("button") : null; if(!b) return;
      if(b.hasAttribute("data-a") && b.hasAttribute("data-v")){ ecrire(b.getAttribute("data-a"), +b.getAttribute("data-v")); majEtape(true); }
      else if(b.hasAttribute("data-ry")){ var n = b.getAttribute("data-ry"); S["R" + n] = b.getAttribute("data-o"); ecrire(b.getAttribute("data-c") + n, true); majEtape(true); }
      else if(b.hasAttribute("data-p")){ ecrire("C29", +b.getAttribute("data-p") / 100); majEtape(true); }
      else if(b.hasAttribute("data-go")){ aller(+b.getAttribute("data-go")); }
      else if(b.hasAttribute("data-n")){ aller(+b.getAttribute("data-n")); }
    });
    w.addEventListener("change", function(e){
      var t = e.target; if(!t || t.disabled) return;
      if(t.hasAttribute("data-a")) ecrire(t.getAttribute("data-a"), t.value);
      else if(t.hasAttribute("data-pa")){ var k = Math.max(0, Math.min(100, +t.value || 0)); ecrire("C29", k / 100); majEtape(true); }
    });
    addEventListener("resize", ajuster);
  }
  function pastilles(){
    var h = ""; for(var i = 1; i <= 12; i++) h += '<button type="button" class="revpt' + (i === etape ? ' on' : (faite(i) ? ' f' : '')) + '" data-n="' + i + '" aria-label="Étape ' + i + ', ' + esc(REV_TITRES[i - 1]) + '">' + i + '</button>';
    document.getElementById("revp").innerHTML = h;
    document.getElementById("revn1").innerHTML = '<span>Étape ' + etape + ' sur 12</span><b>' + esc(REV_TITRES[etape - 1]) + '</b>';
    document.getElementById("revpre").disabled = etape === 1; document.getElementById("revsui").disabled = etape === 12;
  }
  function majEtape(garde){
    var x = document.getElementById("revx"); if(!x) return;
    var foc = garde && document.activeElement && document.activeElement.getAttribute ? document.activeElement.getAttribute("data-a") : null;
    x.innerHTML = ET[etape](); pastilles();
    if(foc){ var q = x.querySelector('[data-a="' + foc + '"]'); if(q && q.tagName !== "BUTTON") q.focus(); }
    ajuster();
  }
  function aller(n){ if(n < 1 || n > 12) return; etape = n; majEtape(false); window.scrollTo(0, 0); }
  function revFermer(){ removeEventListener("resize", ajuster); menu(); }
  // Grand écran: une page par étape, mise à l'échelle pour tenir dans la fenêtre sans défilement.
  function ajuster(){ var el = document.getElementById("revw"); if(!el){ removeEventListener("resize", ajuster); return; }
    el.style.zoom = 1; el.style.width = ""; if(innerWidth < 1000) return;
    el.style.width = "1500px"; var h = el.offsetHeight, haut = el.getBoundingClientRect().top + (window.scrollY || 0), z = Math.min((innerWidth - 64) / 1500, (innerHeight - haut - 8) / h);
    if(z > 1.8) z = 1.8; if(z < .6) z = 1; el.style.zoom = z; }
  squelette(); majEtape(false);
  return {aller: aller};
}

// Aperçu fictif (aucune donnée réelle, aucune écriture): sert à montrer le parcours tant que la copie chiffrée n'est pas branchée.
var REV_FICTIF = {employe:"Camille Roy",rencontre:1,annee:2026,categorie:"Acrylique",evaluateur:"Reinaldo",papier:false,
g:{A26:"Connaissances et compétences techniques",A27:"Autonomie et résolution de problèmes",A28:"Qualité et constance du travail",A33:"88 %",
A11:"Insuffisant",A12:"À améliorer",A13:"Passable",A14:"Satisfaisant",A15:"Bien",A16:"Très bien",A17:"Excellent",A18:"Remarquable",A19:"Exceptionnel",A20:"Exemplaire",
A38:"Respect",A39:"Ouverture et innovation",A40:"Responsabilisation",A41:"Collaboration",A42:"Intégrité",C38:"Traite les autres avec courtoisie. Au quotidien : salue, écoute, remercie.",C39:"Propose des idées.",C40:"Assume ses actes.",C41:"Aide les collègues.",C42:"Agit avec honnêteté.",
D30:"Diplôme : DEC · 2 / 4\nHors métier : 3 ans · 3 / 6\nMétier / labo : 8 ans · 8 / 20\nTotal : 13 / 20",
A43:"Plan de développement",A44:"Quelles formations aimeriez-vous suivre?",A46:"Quels objectifs de carrière?",A49:"Actions de développement",A50:"Action",C50:"Échéance",E50:"Soutien requis",G50:"Résultat visé",
A56:"Période",A59:"Heures par semaine",A60:"Charge non terminée",A61:"Charge effectuée",A62:"Objectifs atteints",C59:"40",C60:"5 et −",C61:"80 et +",C62:"80 et +",
A64:"Priorités",A65:"Priorités à court terme",A67:"Priorités à long terme",A69:"Plan d’action",C70:"Date",E70:"Action",A71:"Priorité 1",A72:"Priorité 2",A73:"Priorité 3",
A75:"Commentaires de l’employé",A90:"Mon expérience",A91:"Évalue chaque énoncé de 1 à 5.",A93:"Je me sens écouté",A94:"Mon horaire me convient",A95:"Mes outils sont adéquats",A96:"Je reçois de la formation",A97:"Mon équipe collabore",A98:"Je recommanderais LDLD",
A100:"Préparer la rencontre",A101:"Ce dont je suis le plus fier",A104:"Ce que j’aimerais changer"},
r:{B6:"2026-11-17",B26:.3,B27:.3,B28:.4,B29:.2,C26:8,C27:7,C28:8,C29:.85,E38:9,E39:8,E40:8,E41:9,E42:9,D26:"Très bonne maîtrise des étapes de finition.",D27:"Demande de l’aide au bon moment.",E59:"39",E60:"7",E61:"88",C56:"du 1 mai 2026 au 31 oct. 2026",A76:"Très motivé.",E71:"Formation coloration",E93:5,E94:4,E95:3,E96:5,E97:5,E98:4,A102:"La finition des pièces.",A105:"Plus de formation."},
notes:{C26:{em:7},C27:{em:8},C28:{em:8},E38:{em:9},E39:{em:7},E40:{em:8},E41:{em:9},E42:{em:9}},rythme:["Augmentation","","Maintien","Maintien"],gx:{ok:false},
nc:{ok:true,mois:[2,1,0,3,1,2,1,0,2,1,0,2].map((n,i)=>({label:"JFMAMJJASOND"[i],n})),n6:6,n12:15,typeTop:"Retouche",detail:[{d:"3 nov.",cat:"Acrylique",dos:"D-4521",type:"Retouche",com:"Teinte"},{d:"20 oct.",cat:"Acrylique",dos:"D-4488",type:"Retouche",com:""}]}};
function revApercu(){ var D = JSON.parse(JSON.stringify(REV_FICTIF)); revOuvrir(D); var b = document.createElement("div"); b.className = "revbn"; b.textContent = "Aperçu avec des données fictives. Rien n’est enregistré."; var w = document.getElementById("revw"); if(w) w.insertBefore(b, w.firstChild); }
