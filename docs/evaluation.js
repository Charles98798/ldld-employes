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
function aepEtq(j, prochaine, auj){ if(!j) return ""; return '<span class="aepe' + (j < auj ? '' : (prochaine ? ' v' : '')) + '">' + (j < auj ? 'Passée' : (prochaine ? 'Prochaine' : 'À venir')) + '</span>'; }
function aepStatut(x){ return x.d1 && x.d2 ? "2 rencontres" : x.d1 ? "1 rencontre" : "Aucune rencontre"; }
function aepFmt(j, h){ if(!j) return '<span class="aepv">—</span>'; var q = j.split("-"); return (+q[2]) + " " + MOIS_COURTS_E[+q[1] - 1] + " " + q[0] + (aepHeure(h) ? '<small>' + esc(aepHeure(h)) + '</small>' : ''); }
var MOIS_COURTS_E = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
function aepPlanification(){
  app.innerHTML = '<div class="page sans-instant"><a class="retour" href="#" id="retour">Retour</a><h1>Planification évaluation</h1><div class="aepf" id="aepf"></div><div class="aepent"><span>Employé</span><span>RDV 1</span><span>RDV 2</span><span>Rencontres</span></div><div id="aepz"></div><div id="aepm" class="aeretat"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  var donnees = null, ouvert = null;
  function auj(){ var n = new Date(); return n.getFullYear() + "-" + ("0" + (n.getMonth() + 1)).slice(-2) + "-" + ("0" + n.getDate()).slice(-2); }
  function msg(t){ var m = document.getElementById("aepm"); if(m) m.textContent = t || ""; }
  function liste(){
    return (donnees.lignes || []).map(function(e){ var x = aepNormaliser(e); x.id = e.id; x.env1 = !!e.envoi1; x.env2 = !!e.envoi2; return x; }).filter(function(x){ return x.nom && !/^direction$/i.test(x.cat.trim()); })
      .sort(function(a, b){ return a.nom.localeCompare(b.nom, "fr"); });
  }
  function afficher(){
    var z = document.getElementById("aepz"), f = document.getElementById("aepf"); if(!z || !donnees) return;
    var t = auj(), fin = new Date(); fin.setDate(fin.getDate() + 7); var finJ = fin.getFullYear() + "-" + ("0" + (fin.getMonth() + 1)).slice(-2) + "-" + ("0" + fin.getDate()).slice(-2);
    var L = liste();
    L.forEach(function(x){ x.verif = /vérifier/i.test(x.statut); x.futur = [x.d1, x.d2].filter(function(j){ return j && j >= t; }).sort(); });
    var filtres = [
      {k: "tous", t: "Tous", ok: function(){ return true; }},
      {k: "planifier", t: "À planifier", ok: function(x){ return !x.d1; }},
      {k: "semaine", t: "Cette semaine", ok: function(x){ return x.futur.length && x.futur[0] <= finJ; }},
      {k: "verifier", t: "À vérifier", ok: function(x){ return x.verif; }}
    ];
    f.innerHTML = filtres.map(function(q){ var c = L.filter(q.ok).length; return '<button type="button" class="aepb' + (AEP.filtre === q.k ? ' on' : '') + '" data-k="' + q.k + '">' + q.t + ' · ' + c + '</button>'; }).join("");
    Array.prototype.forEach.call(f.querySelectorAll("button"), function(b){ b.onclick = function(){ AEP.filtre = b.getAttribute("data-k"); ouvert = null; afficher(); }; });
    var ok = filtres.filter(function(q){ return q.k === AEP.filtre; })[0].ok, v = L.filter(ok);
    if(!v.length){ z.innerHTML = '<div class="aevide">Aucun employé dans cette liste.</div>'; return; }
    z.innerHTML = v.map(function(x){
      var pro = x.futur[0], p1 = x.d1 && x.d1 < t, p2 = x.d2 && x.d2 < t;
      var h = '<div class="aepl aepr"><span class="aepn">' + esc(x.nom) + '<small>' + esc(x.resp) + '</small></span>' +
        '<button type="button" class="aepc' + (p1 ? ' pas' : '') + '" data-id="' + esc(x.id) + '" data-n="1">' + aepFmt(x.d1, x.h1) + aepEtq(x.d1, x.d1 === pro && !p1, t) + '</button>' +
        '<button type="button" class="aepc' + (p2 ? ' pas' : '') + '" data-id="' + esc(x.id) + '" data-n="2">' + aepFmt(x.d2, x.h2) + aepEtq(x.d2, x.d2 === pro && !p2 && x.d1 !== pro, t) + '</button>' +
        '<span class="aeps aeplst"><select class="aepsel" data-id="' + esc(x.id) + '" aria-label="Rencontres de ' + esc(x.nom) + '">' + [["1", "1 rencontre"], ["2", "2 rencontres"], ["0", "Aucune rencontre"]].map(function(q){ var n = x.d1 && x.d2 ? "2" : x.d1 ? "1" : "0"; return '<option value="' + q[0] + '"' + (n === q[0] ? ' selected' : '') + '>' + q[1] + '</option>'; }).join("") + '</select></span>';
      if(ouvert && ouvert.id === x.id){
        var d = ouvert.n === 1 ? x.d1 : x.d2, hh = ouvert.n === 1 ? x.h1 : x.h2;
        h += '<div class="aepedit"><b>Rencontre ' + ouvert.n + '</b><label>Date<input type="date" id="aepd" min="' + t + '" value="' + esc(d) + '"></label><label>Heure<input type="time" id="aeph" value="' + esc(hh || "") + '"></label>' +
          '<div class="aepbts"><button type="button" class="bouton" id="aeps">Enregistrer</button>' + (d ? '<button type="button" class="bouton aepsup" id="aepr">Retirer</button>' : '') + '<button type="button" class="bouton" id="aepa">Annuler</button></div><div class="aepavis" id="aepav"></div></div>';
      }
      return h + '</div>';
    }).join("");
    Array.prototype.forEach.call(z.querySelectorAll("button.aepc"), function(b){ b.onclick = function(){ ouvert = {id: b.getAttribute("data-id"), n: +b.getAttribute("data-n")}; msg(""); afficher(); }; });
    Array.prototype.forEach.call(z.querySelectorAll("select.aepsel"), function(b){ b.onchange = function(){
      var id = b.getAttribute("data-id"), q = b.value, x = liste().filter(function(y){ return y.id === id; })[0]; if(!x) return;
      var n = x.d1 && x.d2 ? "2" : x.d1 ? "1" : "0"; if(n === q) return;
      if(q === "2") ouvert = {id: id, n: x.d1 ? 2 : 1}; else if(q === "1") ouvert = x.d1 ? {id: id, n: 2, retrait: true} : {id: id, n: 1};
      else ouvert = x.d2 ? {id: id, n: 2, retrait: true, puis: x.d1 ? 0 : -1} : {id: id, n: 1, retrait: true};
      msg(""); afficher();
      if(ouvert.retrait) enregistrer(true, false);
    }; });
    if(ouvert){
      document.getElementById("aepa").onclick = function(){ ouvert = null; afficher(); };
      document.getElementById("aeps").onclick = function(){ enregistrer(false, false); };
      var r = document.getElementById("aepr"); if(r) r.onclick = function(){ enregistrer(true, false); };
    }
  }
  function enregistrer(retrait, confirmer){
    var o = ouvert, d = retrait ? "" : document.getElementById("aepd").value, h = retrait ? "" : document.getElementById("aeph").value, av = document.getElementById("aepav");
    if(!retrait && (!d || !h)){ av.textContent = "Choisis la date et l’heure."; return; }
    if(!retrait && d < auj()){ av.textContent = "Cette date est passée."; return; }
    msg("Enregistrement…");
    aerAppel({action: "ae_planif_ecrire", id: o.id, rencontre: o.n, date: d, heure: h, confirmer: !!confirmer}).then(function(r){
      if(r && r.ok){
        (donnees.lignes || []).forEach(function(l, i){ if(l.id === o.id && r.ligne) donnees.lignes[i] = r.ligne; });
        msg("Enregistré à " + aerHeure()); if(o.puis === 0){ ouvert = {id: o.id, n: 1, retrait: true}; afficher(); enregistrer(true, false); return; } ouvert = null; afficher(); return;
      }
      msg("");
      if(r && r.confirmation){
        av.innerHTML = esc(r.message || (r.confirmation === "envoi" ? "Un courriel d’autoévaluation partira dans les 5 minutes." : "Cette rencontre sera retirée de l’agenda.")) + '<div class="aepbts"><button type="button" class="bouton" id="aepok">Confirmer</button></div>';
        document.getElementById("aepok").onclick = function(){ enregistrer(retrait, true); };
        return;
      }
      av.textContent = (r && (r.erreur || r.message)) || "Enregistrement impossible. Réessaie.";
    }).catch(function(){ msg(""); av.textContent = "Enregistrement impossible. Réessaie."; });
  }
  function erreur(){ var z = document.getElementById("aepz"); if(z){ z.innerHTML = '<div class="bandeau">Planification indisponible pour le moment.</div><button type="button" class="bouton" id="aere">Réessayer</button>'; document.getElementById("aere").onclick = aepPlanification; } }
  obtenir("ae_planif", {action: "ae_planif_lire"}, function(r){ if(ouvert) return; donnees = r; afficher(); }, erreur, true);
}

// ---- Réunion d'auto-évaluation (Service: ae_reunion_lire / ae_reunion_verrou / ae_reunion_ecrire / ae_reunion_actualiser) ----
// Données par identifiant d'employé (LDLD-###_année_rencontre), sans nom: le nom vient de la planification. Aucun salaire.
var AER = {cle: "", verrou: null, bat: null, file: [], envoi: false, lectureSeule: true};
function aerAppel(corps){ corps.session = sessionGardee(); return appelService(corps); }
function aerArreter(){ if(AER.bat){ clearInterval(AER.bat); AER.bat = null; } }
function aerLiberer(){ aerArreter(); if(AER.cle && !AER.lectureSeule){ var c = AER.cle; AER.cle = ""; aerAppel({action: "ae_reunion_verrou", op: "liberer", cle: c}).catch(function(){}); } else AER.cle = ""; AER.lectureSeule = true; AER.file = []; }
function aerHeure(){ var d = new Date(); return d.getHours() + " h " + ("0" + d.getMinutes()).slice(-2); }
function aerEnvoyer(){
  if(AER.envoi || !AER.file.length) return; AER.envoi = true;
  var it = AER.file.shift(), etat = document.getElementById("aeretat");
  aerAppel({action: "ae_reunion_ecrire", cle: it.cle, addr: it.addr, valeur: it.valeur}).then(function(r){
    AER.envoi = false;
    if(!r || !r.ok){ AER.file.unshift(it); if(etat) etat.textContent = "Enregistrement en attente"; setTimeout(aerEnvoyer, 4000); return; }
    if(etat) etat.textContent = AER.file.length ? "Enregistrement…" : "Enregistré à " + aerHeure();
    aerEnvoyer();
  }).catch(function(){ AER.envoi = false; AER.file.unshift(it); if(etat) etat.textContent = "Enregistrement en attente"; setTimeout(aerEnvoyer, 4000); });
}
function aerSaisir(addr, valeur){ AER.file.push({cle: AER.cle, addr: addr, valeur: valeur}); var e = document.getElementById("aeretat"); if(e) e.textContent = "Enregistrement…"; aerEnvoyer(); }
function aerPremier(){
  app.innerHTML = '<div class="page sans-instant"><a class="retour" href="#" id="retour">Retour</a><h1>Rencontre d’évaluation</h1><div id="aerz"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); aerLiberer(); menu(); };
  var noms = {}, z = document.getElementById("aerz");
  function liste(planif, reun){
    (planif.lignes || []).forEach(function(l){ if(l.id) noms[l.id] = l.nom; });
    var v = (reun.rencontres || []).map(function(r){ var p = String(r.cle).split("_"); return {cle: r.cle, id: p[0], annee: p[1], num: p[2], nom: noms[p[0]] || ""}; }).filter(function(x){ return x.nom; });
    v.sort(function(a, b){ return a.nom < b.nom ? -1 : a.nom > b.nom ? 1 : a.num - b.num; });
    var bandeau = reun.verrou && reun.verrou.libre === false && !reun.verrou.mien ? '<div class="bandeau">En cours par ' + esc(reun.verrou.par || "un évaluateur") + '. Consultation seulement.</div>' : "";
    z.innerHTML = bandeau + (v.length ? v.map(function(x){ return '<a href="#" class="aepl" data-c="' + esc(x.cle) + '"><span class="aepn">' + esc(x.nom) + '<small>Rencontre ' + esc(x.num) + ' · ' + esc(x.annee) + '</small></span><span class="aepd">Ouvrir</span></a>'; }).join("") : '<div class="aevide">Aucune rencontre préparée.</div>');
    Array.prototype.forEach.call(z.querySelectorAll("a[data-c]"), function(a){ a.onclick = function(e){ e.preventDefault(); aerOuvrir(a.getAttribute("data-c"), noms); }; });
  }
  function erreur(){ z.innerHTML = '<div class="bandeau">Réunion indisponible pour le moment.</div><button type="button" class="bouton" id="aere">Réessayer</button>'; document.getElementById("aere").onclick = aerPremier; }
  Promise.all([aerAppel({action: "ae_planif_lire"}), aerAppel({action: "ae_reunion_lire"})]).then(function(a){ if(!a[0] || !a[0].ok || !a[1] || !a[1].ok) throw 0; liste(a[0], a[1]); }).catch(erreur);
}
function aerNote(addr, val, ro){ return '<input type="number" inputmode="decimal" class="aein" data-a="' + addr + '" value="' + esc(val === undefined || val === null ? "" : val) + '"' + (ro ? ' disabled' : '') + '>'; }
function aerTexte(addr, val, ro){ return '<textarea class="aeta" rows="2" data-a="' + addr + '"' + (ro ? ' disabled' : '') + '>' + esc(val || "") + '</textarea>'; }
function aerOuvrir(cle, noms){
  aerLiberer();
  app.innerHTML = '<div class="page sans-instant"><a class="retour" href="#" id="retour">Retour</a><h1>Rencontre d’évaluation</h1><div id="aerz"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); aerLiberer(); aerPremier(); };
  var z = document.getElementById("aerz");
  function erreur(){ z.innerHTML = '<div class="bandeau">Rencontre indisponible pour le moment.</div>'; }
  aerAppel({action: "ae_reunion_verrou", op: "prendre", cle: cle}).then(function(v){
    var mien = !!(v && v.ok && v.verrou && v.verrou.mien);
    AER.cle = cle; AER.lectureSeule = !mien;
    return aerAppel({action: "ae_reunion_lire", cle: cle}).then(function(r){ if(!r || !r.ok) throw 0; afficher(r, mien, v && v.verrou); });
  }).catch(erreur);
  function afficher(r, mien, verrou){
    var s = r.instantane || {}, ro = !mien, p = String(cle).split("_"), nom = (noms && noms[p[0]]) || "";
    var h = '<div class="aerh"><b>' + esc(nom) + '</b><small>Rencontre ' + esc(s.rencontre || p[2]) + ' · ' + esc(s.annee || p[1]) + '</small></div>';
    var par = (r.verrou && r.verrou.par) || (verrou && verrou.par) || "un évaluateur";
    h += ro ? '<div class="bandeau">En cours par ' + esc(par) + '. Consultation seulement.</div>' : '<div class="aeretat" id="aeretat">Prêt</div>';
    h += '<div class="emois">Compétences</div>';
    (s.competences || []).forEach(function(c, i){ var n = 26 + i; h += '<div class="aepl aerb"><span class="aepn">' + esc(c.libelle) + '<small>Évaluateur ' + aerNote("C" + n, c.note_evaluateur, ro) + ' · Employé ' + esc(c.note_employe === undefined || c.note_employe === null ? "" : c.note_employe) + '</small>' + aerTexte("D" + n, c.observation, ro) + '</span></div>'; });
    h += '<div class="emois">Valeurs</div>';
    (s.valeurs || []).forEach(function(c, i){ var n = 38 + i; h += '<div class="aepl aerb"><span class="aepn">' + esc(c.libelle) + '<small>Évaluateur ' + aerNote("E" + n, c.note_evaluateur, ro) + '</small>' + aerTexte("I" + n, c.observation, ro) + '</span></div>'; });
    var ry = s.rythme || {};
    h += '<div class="emois">Objectifs et charges' + (ry.periode ? ' · ' + esc(ry.periode) : '') + '</div>';
    (ry.indicateurs || []).forEach(function(c){
      var ch = c.choix || {}, l = c.ligne, cols = [["G", "Augmentation"], ["I", "Réduction"], ["K", "Maintien"]];
      h += '<div class="aepl aerb"><span class="aepn">' + esc(c.libelle) + '<small>Cible ' + esc(c.cible === undefined ? "" : c.cible) + ' · Réalisé ' + esc(c.realise === undefined ? "" : c.realise) + '</small><span class="aerch">' +
        cols.map(function(k){ return '<button type="button" class="aepb' + (ch[k[1].toLowerCase()] || ch[k[0]] ? ' on' : '') + '" data-a="' + k[0] + l + '"' + (ro ? ' disabled' : '') + '>' + k[1] + '</button>'; }).join("") + '</span></span></div>';
    });
    var nc = s.nc || {};
    h += '<div class="emois">Non-conformités</div><div class="aepl"><span class="aepn">' + esc(nc.mois === undefined ? "" : nc.mois) + ' ce mois · ' + esc(nc.n6 === undefined ? "" : nc.n6) + ' sur 6 mois · ' + esc(nc.n12 === undefined ? "" : nc.n12) + ' sur 12 mois<small>' + esc(nc.typeTop || "") + '</small></span></div>';
    z.innerHTML = h;
    if(ro) return;
    Array.prototype.forEach.call(z.querySelectorAll("input[data-a],textarea[data-a]"), function(el){
      var t; el.oninput = function(){ clearTimeout(t); t = setTimeout(function(){ var v = el.value; aerSaisir(el.getAttribute("data-a"), el.type === "number" ? (v === "" ? "" : +v) : v); }, 700); };
      el.onblur = function(){ clearTimeout(t); };
    });
    Array.prototype.forEach.call(z.querySelectorAll("button[data-a]"), function(b){ b.onclick = function(){ var on = !b.classList.contains("on"); b.classList.toggle("on", on); aerSaisir(b.getAttribute("data-a"), on); }; });
    AER.bat = setInterval(function(){ aerAppel({action: "ae_reunion_verrou", op: "battre", cle: cle}).then(function(x){ if(x && x.verrou && x.verrou.libre === false && !x.verrou.mien){ aerArreter(); AER.lectureSeule = true; var e = document.getElementById("aeretat"); if(e) e.textContent = "Verrou perdu: consultation seulement"; } }).catch(function(){}); }, 30000);
  }
}
window.addEventListener("pagehide", function(){ if(AER.cle && !AER.lectureSeule) aerLiberer(); });

// Page 2 « Rencontre d'évaluation »: rencontres des 14 prochains jours avec l'état de l'autoévaluation (rempli ou non, jamais le contenu).
function aerBientot(){
  app.innerHTML = '<div class="page sans-instant"><a class="retour" href="#" id="retour">Retour</a><h1>Rencontre d’évaluation</h1><div class="aepf" id="aerc"></div><div id="aerl"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  function iso(d){ return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function afficher(r){
    if(!(r.lignes || []).some(function(e){ return e.autoeval1 !== undefined || e.autoeval2 !== undefined; })){ document.getElementById("aerl").innerHTML = '<div class="aevide">Bientôt disponible.</div>'; return; }
    var n = new Date(), t = iso(n), f = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 14), fin = iso(f), v = [];
    (r.lignes || []).forEach(function(e){
      var x = aepNormaliser(e); if(!x.nom || /^direction$/i.test(x.cat.trim())) return;
      [[1, x.d1, x.h1, e.autoeval1], [2, x.d2, x.h2, e.autoeval2]].forEach(function(q){ if(q[1] && q[1] >= t && q[1] <= fin) v.push({j: q[1], h: q[2], nom: x.nom, num: q[0], ok: q[3] === true}); });
    });
    v.sort(function(a, b){ return a.j < b.j ? -1 : a.j > b.j ? 1 : (a.h || "") < (b.h || "") ? -1 : (a.h || "") > (b.h || "") ? 1 : a.nom.localeCompare(b.nom, "fr"); });
    var ok = v.filter(function(x){ return x.ok; }).length;
    document.getElementById("aerc").innerHTML = '<span class="aepb">' + v.length + (v.length > 1 ? ' rencontres' : ' rencontre') + '</span><span class="aepb on">' + ok + (ok > 1 ? ' remplies' : ' remplie') + '</span><span class="aepb">' + (v.length - ok) + (v.length - ok > 1 ? ' non remplies' : ' non remplie') + '</span>';
    var z = document.getElementById("aerl");
    if(!v.length){ z.innerHTML = '<div class="aevide">Aucune rencontre dans les 14 prochains jours.</div>'; return; }
    var h = "", c = "";
    v.forEach(function(x){
      if(x.j !== c){ c = x.j; var q = c.split("-"); h += '<div class="emois">' + esc(JOURS_COURTS_E[new Date(+q[0], +q[1] - 1, +q[2]).getDay()] + " " + (+q[2]) + " " + MOIS_COURTS_E[+q[1] - 1]) + '</div>'; }
      h += '<div class="aepl"><span class="aepn">' + esc(x.nom) + '<small>' + esc((aepHeure(x.h) ? aepHeure(x.h) + ' · ' : '') + 'Rencontre ' + x.num) + '</small></span><span class="aere' + (x.ok ? ' ok' : '') + '">Autoévaluation ' + (x.ok ? 'remplie' : 'non remplie') + '</span></div>';
    });
    z.innerHTML = h;
  }
  function erreur(){ var z = document.getElementById("aerl"); if(z){ z.innerHTML = '<div class="bandeau">Rencontres indisponibles pour le moment.</div><button type="button" class="bouton" id="aere">Réessayer</button>'; document.getElementById("aere").onclick = aerBientot; } }
  obtenir("ae_planif", {action: "ae_planif_lire"}, afficher, erreur, true);
}
