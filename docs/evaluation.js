// Groupe « Évaluation »: planification des rendez-vous d'auto-évaluation (lecture de « Contacts évaluations »).
// Service: ae_planif_lire (Direction et Gestionnaires). Aucune donnée de salaire, de courriel ni de téléphone.
var AEP = {filtre: "tous"};
function aepChamp(e, noms){ for(var i = 0; i < noms.length; i++){ var v = e[noms[i]]; if(v !== undefined && v !== null && v !== "") return String(v); } return ""; }
function aepJour(s){ var p = /^(\d{4})-(\d\d)-(\d\d)/.exec(s || ""); return p ? p[1] + "-" + p[2] + "-" + p[3] : ""; }
function aepNormaliser(e){
  var r1 = e.r1 || {}, r2 = e.r2 || {};
  return {nom: aepChamp(e, ["nom"]), cat: aepChamp(e, ["categorie"]), resp: aepChamp(e, ["responsable"]),
    d1: aepJour(r1.date), h1: r1.heure || "", d2: aepJour(r2.date), h2: r2.heure || "", statut: aepChamp(e, ["statut"])};
}
// Prochaine rencontre à venir (ou la dernière passée à défaut); {num, j, h, passee}
function aepProchaine(x, auj){
  var l = []; if(x.d1) l.push({num: 1, j: x.d1, h: x.h1}); if(x.d2) l.push({num: 2, j: x.d2, h: x.h2});
  if(!l.length) return null;
  var futur = l.filter(function(r){ return r.j >= auj; });
  if(futur.length) return {num: futur[0].num, j: futur[0].j, h: futur[0].h, passee: false};
  var d = l[l.length - 1]; return {num: d.num, j: d.j, h: d.h, passee: true};
}
function aepHeure(h){ var p = /^(\d{1,2}):(\d\d)/.exec(h || ""); return p && !(+p[1] === 0 && +p[2] === 0) ? (+p[1]) + " h" + (p[2] === "00" ? "" : " " + p[2]) : ""; }
function aepPlanification(){
  app.innerHTML = '<div class="page sans-instant"><a class="retour" href="#" id="retour">Retour</a><h1>Planification des rendez-vous d’auto-évaluation</h1><div class="aepf" id="aepf"></div><div id="aepz"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  var donnees = null;
  function afficher(){
    var z = document.getElementById("aepz"), f = document.getElementById("aepf"); if(!z || !donnees) return;
    var n = new Date(), auj = n.getFullYear() + "-" + ("0" + (n.getMonth() + 1)).slice(-2) + "-" + ("0" + n.getDate()).slice(-2);
    var fin = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 7), finJ = fin.getFullYear() + "-" + ("0" + (fin.getMonth() + 1)).slice(-2) + "-" + ("0" + fin.getDate()).slice(-2);
    var liste = (donnees.lignes || []).map(aepNormaliser).filter(function(x){ return x.nom; });
    liste.forEach(function(x){ x.p = aepProchaine(x, auj); x.sansDate = !!x.statut && (!x.d1 || !x.d2); x.verif = /vérifier/i.test(x.statut); });
    var filtres = [
      {k: "tous", t: "Tous", ok: function(){ return true; }},
      {k: "planifier", t: "À planifier", ok: function(x){ return x.sansDate; }},
      {k: "semaine", t: "Cette semaine", ok: function(x){ return x.p && !x.p.passee && x.p.j <= finJ; }},
      {k: "verifier", t: "À vérifier", ok: function(x){ return x.verif; }}
    ];
    f.innerHTML = filtres.map(function(q){ var c = liste.filter(q.ok).length; return '<button type="button" class="aepb'+(AEP.filtre === q.k ? ' on' : '')+'" data-k="'+q.k+'">'+q.t+' · '+c+'</button>'; }).join("");
    Array.prototype.forEach.call(f.querySelectorAll("button"), function(b){ b.onclick = function(){ AEP.filtre = b.getAttribute("data-k"); afficher(); }; });
    var ok = filtres.filter(function(q){ return q.k === AEP.filtre; })[0].ok;
    var v = liste.filter(ok);
    v.sort(function(a, b){ var ja = a.p ? a.p.j : "9999", jb = b.p ? b.p.j : "9999"; return ja < jb ? -1 : ja > jb ? 1 : a.nom < b.nom ? -1 : 1; });
    if(!v.length){ z.innerHTML = '<div class="aevide">Aucun employé dans cette liste.</div>'; return; }
    var h = "", mois = "";
    v.forEach(function(x){
      var mk = x.p ? x.p.j.slice(0, 7) : "sans";
      if(mk !== mois){ mois = mk; h += '<div class="emois">'+(mk === "sans" ? "Sans rencontre planifiée" : esc(MOIS_LONGS[+mk.slice(5, 7) - 1])+' '+mk.slice(0, 4))+'</div>'; }
      var q = x.p ? x.p.j.split("-") : null, jl = q ? JOURS_COURTS_E[new Date(+q[0], +q[1] - 1, +q[2]).getDay()] + " " + (+q[2]) : "";
      var etat = x.statut || (x.sansDate ? "À planifier" : "");
      h += '<div class="aepl'+(x.p && x.p.passee ? ' pas' : '')+(x.sansDate ? ' sd' : '')+'"><span class="aepn">'+esc(x.nom)+'<small>'+esc([x.resp, x.p ? 'rencontre '+x.p.num : '', etat].filter(Boolean).join(" · "))+'</small></span><span class="aepd">'+esc(jl)+(aepHeure(x.p && x.p.h) ? '<br>'+esc(aepHeure(x.p.h)) : '')+'</span></div>';
    });
    z.innerHTML = h;
  }
  function erreur(){ var z = document.getElementById("aepz"); if(z){ z.innerHTML = '<div class="bandeau">Planification indisponible pour le moment.</div><button type="button" class="bouton" id="aere">Réessayer</button>'; document.getElementById("aere").onclick = aepPlanification; } }
  obtenir("ae_planif", {action: "ae_planif_lire"}, function(r){ donnees = r; afficher(); }, erreur, true);
}
