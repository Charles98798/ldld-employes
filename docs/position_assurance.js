// Position et assurance (annuel, Direction) — ancien « Position employé ». Trois bandes : 1 Position, 2 Assurance, 3 Envoi.
// Données : domaine « pa_ » du Service (pa_donnees / pa_enregistrer) -> journal du classeur DIRECTION. Jamais gardées sur l'appareil (mémoire seulement).
// Règles : l'assurance est UN montant unique, seulement ici ; l'OTPAD par catégorie est seulement dans l'Échelle salariale.
// « Confirmer l'envoi » reste grisé tant que la position ET l'assurance ne sont pas confirmées ; toute modification après coup le fait tomber (calculé par le Service).
var PA = {d: null, enCours: false};
function paEsc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function paMontant(v){ if(v == null) return "—"; var n = Math.round(v*100)/100, e = Math.round(n) === n ? String(n) : n.toFixed(2).replace(".", ","); return e.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " $"; }
function paNum(t){ t = String(t == null ? "" : t).replace(/\s/g, "").replace("$", "").replace(",", "."); if(t === "") return null; var n = Number(t); return isNaN(n) ? null : n; }
var PA_MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
function paQuand(q){ var m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(String(q || "")); return m ? ((+m[3]) === 1 ? "1er" : (+m[3])) + " " + PA_MOIS[+m[2]-1] + " " + m[1] + " à " + (+m[4]) + " h " + m[5] : String(q || ""); }
function paHeure(q){ var m = /[T ](\d{2}):(\d{2})/.exec(String(q || "")); return m ? (+m[1]) + " h " + m[2] : ""; }
function paAppel(champ, valeur, id){
  var c = {action: "pa_enregistrer", champ: champ, session: sessionGardee()}; if(valeur !== undefined && valeur !== null) c.valeur = valeur; if(id) c.id = id;
  return Promise.race([appelService(c), new Promise(function(_, non){ setTimeout(function(){ non(new Error("Enregistrement trop long : vérifiez la connexion et réessayez.")); }, 30000); })]).then(function(r){ if(r && r.ok){ PA.d = paNorm(r.r); return r.r; } throw new Error((r && r.erreur) || "Échec de l'enregistrement."); });
}
function paLire(){ return Promise.race([appelService({action: "pa_donnees", session: sessionGardee()}), new Promise(function(_, non){ setTimeout(function(){ non(new Error("Lecture trop longue")); }, 25000); })]).then(function(r){ if(r && r.ok){ PA.d = paNorm(r.r); return r.r; } throw new Error((r && r.erreur) || "Échec."); }); }

function paOuvrir(){
  app.innerHTML = '<div class="page ppx pa"><a class="retour" href="#" id="retour">Retour</a><h1>Position et assurance</h1><div id="pa_app"><div class="att" id="pa_att"><i></i></div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  if(PA.d) paRendu();   // déjà lu pendant cette session : affiché tout de suite, vérifié en silence
  paLire().then(function(){ if(document.getElementById("pa_app") && !(document.activeElement && document.activeElement.tagName === "INPUT")) paRendu(); })
    .catch(function(e){ if(PA.d) return; var a = document.getElementById("pa_att"); if(a){ a.className = "bandeau"; a.textContent = "▪ " + String(e.message || "Échec").toUpperCase() + " · TOUCHEZ POUR RÉESSAYER"; a.onclick = paOuvrir; } });
}
function paEtat(el, txt, mal){ var z = document.getElementById("pa_etat"); if(z){ z.textContent = txt; z.className = "finnote" + (mal ? " mal" : ""); } }
function paAction(champ, valeur, texte){
  if(PA.enCours) return; PA.enCours = true; paEtat(null, "Enregistrement…");
  paAppel(champ, valeur).then(function(){ PA.enCours = false; paRendu(); paEtat(null, texte || "Enregistré à " + paHeure(paMaintenantLocal())); })
    .catch(function(e){ PA.enCours = false; paRendu(); paEtat(null, String(e.message || e), true); });
}
function paMaintenantLocal(){ var d = new Date(), z = function(n){ return (n < 10 ? "0" : "") + n; }; return d.getFullYear() + "-" + z(d.getMonth()+1) + "-" + z(d.getDate()) + "T" + z(d.getHours()) + ":" + z(d.getMinutes()); }
// Les montants repris de l'an passé ne valent que pour 2027 (première année). Dès l'année suivante, les cases partent vides, sont obligatoires, et la confirmation reste grisée tant qu'elles ne sont pas toutes remplies.
function paNorm(d){ if(d && d.annee !== 2027 && d.assurance && d.assurance.employes) d.assurance.employes.forEach(function(e){ if(e.prefill){ e.val = null; e.prefill = false; } }); return d; }
function paBande(num, titre){ return '<div class="sect"><span class="num">' + num + '</span><span class="lab">' + titre + '</span></div>'; }
function paRendu(){
  var d = PA.d, z = document.getElementById("pa_app"); if(!d || !z) return;
  var an = d.annee, h = "";
  // 1 Position
  h += paBarre("ass");
  // 2 Assurance : un montant PAR EMPLOYÉ, repris de l'an passé, à confirmer ou ajuster ("0" s'il n'y en a pas)
  h += '<div id="pa_v_ass">';
  h += '<div class="pa-lst">' + d.assurance.employes.map(function(e, i){
    if(paDirection(e)) return "";
    return '<div class="pa-e"><div class="pa-n"><span>' + paEsc(e.nom) + '</span><small>' + paEsc(e.cat) + '</small></div><div class="pa-c"><input id="pa_a' + i + '" data-id="' + paEsc(e.id) + '" inputmode="decimal" autocomplete="off" aria-label="Assurance ' + paEsc(e.nom) + '" class="' + (e.val == null ? "vide" : "") + '" value="' + paEsc(e.val == null ? "" : String(e.val).replace(".", ",")) + '"><u>$</u></div>' +
      '<small class="pa-p">Montant précédent\u00a0: ' + paEsc(e.precedent == null ? "—" : paMontant(e.precedent)) + '</small><small class="pa-p" id="pa_as' + i + '">' + (e.ajusteQuand && !e.prefill ? "Enregistré à " + paEsc(paHeure(e.ajusteQuand)) : "") + '</small></div>';
  }).join("") + '</div><div id="pa_bas"></div></div>';  h += '<p class="finnote" id="pa_etat"></p>';
  z.innerHTML = h;
  var $ = function(i){ return document.getElementById(i); };
  paBarreLier(z);
  Array.prototype.forEach.call(z.querySelectorAll(".pa-c input"), function(el, i){
    el.oninput = function(){ el.className = el.value.trim() === "" ? "vide" : ""; };
    el.onchange = function(){
      var n = paNum(el.value); if(n == null){ paEtat(null, "Montant requis (0 s’il n’y a pas d’assurance).", true); return; }
      paEtat(null, "Enregistrement…");
      paAppel("ass_val", n, el.getAttribute("data-id")).then(function(){ var e = PA.d.assurance.employes[i], s = $("pa_as" + i); if(s) s.textContent = "Enregistré à " + paHeure(paMaintenantLocal()); if(e) e.prefill = false; paBas(); paEtat(null, "Enregistré à " + paHeure(paMaintenantLocal())); })
        .catch(function(x){ paEtat(null, String(x.message || x), true); });
    };
  });
  paBas();
}
// Bas de page (total, confirmation de l'assurance, bande Envoi) : mis à jour après chaque saisie sans refaire la liste (le curseur reste en place).
function paDirection(e){ return /^direction/i.test(String((e && e.cat) || "").trim()); }   // la Direction n'a pas d'assurance à confirmer ici
function paBas(){
  var d = PA.d, z = document.getElementById("pa_bas"); if(!d || !z) return;
  var A = d.assurance, h = "", E = A.employes.filter(function(e){ return !paDirection(e); });
  var tot = E.reduce(function(t, e){ return t + (e.val == null ? 0 : Number(e.val)); }, 0), totP = E.reduce(function(t, e){ return t + (e.precedent == null ? 0 : Number(e.precedent)); }, 0), complet = E.every(function(e){ return e.val != null; });
  h += '<p class="pa-l">Total ' + d.annee + "\u00a0: <b>" + paEsc(paMontant(tot)) + '</b> · ' + d.anneePrec + "\u00a0: " + paEsc(paMontant(totP)) + '</p>';
  if(A.confirme) h += '<p class="pa-l">Assurance confirmée par ' + paEsc(A.par) + ' · ' + paEsc(paQuand(A.quand)) + '</p>';
  else h += '<p class="pa-l"><b class="pa-rouge">À confirmer</b>' + (E.some(function(e){ return e.prefill; }) ? ' · montants repris de l’an passé' : '') + '</p>';
  h += '<div class="pa-b"><button type="button" class="btn" id="pa_ass_conf"' + ((A.confirme || !complet) ? " disabled" : "") + '>Confirmer l’assurance</button></div>';
  z.innerHTML = h;
  document.getElementById("pa_ass_conf").onclick = function(){ paOui("Voulez-vous confirmer les assurances\u00a0?", function(){ paConfirmerVite("ass_conf", function(d){ var x = d.assurance; x.confirme = true; x.par = paQui(); x.quand = paMaintenantLocal(); }, paRendu); }); };
}
var PA_RETOUR = false;
// Deux boutons seulement : Position (ouvre la liste des positions) et Assurance. Le bouton choisi est noir.
function paBarre(vue){ var an = PA.d ? PA.d.annee : ""; return '<div class="pa-b"><button type="button" class="btn' + (vue === "pos" ? " sel" : "") + '" data-pv="pos">Position ' + an + '</button><button type="button" class="btn' + (vue === "ass" ? " sel" : "") + '" data-pv="ass">Assurance ' + an + '</button></div>'; }
function paBarreLier(z){ Array.prototype.forEach.call(z.querySelectorAll("[data-pv]"), function(b){ b.onclick = function(){ if(b.getAttribute("data-pv") === "pos"){ PA_RETOUR = false; posEmpOuvrir(); } else paOuvrir(); }; }); }
// Bas de la page des positions : confirmation de la position (requiert l'Échelle salariale confirmée).
function paPosBas(){
  var z = document.getElementById("pa_pos_bas"); if(!z) return;
  var go = function(){
    var d = PA.d, ot = d.otpad || {}, otOk = !!ot.confirme, h = "";
    if(d.position.confirme) h += '<p class="pa-l">Position confirmée par ' + paEsc(d.position.par) + ' · ' + paEsc(paQuand(d.position.quand)) + ' · <a href="#" id="pa_pos_mod" class="pa-mod">Modifier</a></p>';
    else h += '<p class="pa-l"><b class="pa-rouge">À confirmer</b></p>';
    h += '<div class="pa-b"><button type="button" class="btn" id="pa_pos_conf"' + ((d.position.confirme || !otOk) ? " disabled" : "") + '>Confirmer la position</button></div>';
    h += '<p class="pa-l">Échelle salariale ' + d.annee + '\u00a0: ' + (otOk ? 'confirmée par ' + paEsc(ot.par) + ' · ' + paEsc(paQuand(ot.quand)) : '<b class="pa-rouge">à confirmer</b> (requis pour confirmer la position)') + '</p><p class="finnote" id="pa_etat"></p>';
    z.innerHTML = h;
    var c = document.getElementById("pa_pos_conf"); if(c) c.onclick = function(){ paConfirmerVite("pos_conf", function(d){ var x = d.position; x.confirme = true; x.par = paQui(); x.quand = paMaintenantLocal(); }, paPosBas); };
    var m = document.getElementById("pa_pos_mod"); if(m) m.onclick = function(e){ e.preventDefault(); paAppel("pos_modif").then(function(){ paPosBas(); }).catch(function(x){ var t = document.getElementById("pa_etat"); if(t) t.textContent = String(x.message || x); }); };
  };
  if(PA.d) go(); else paLire().then(go).catch(function(){});
}

// Fenêtre de confirmation maison (Oui / Non), sans boîte du navigateur.
function paOui(question, oui){
  var v = document.createElement("div"); v.className = "pa-voile";
  v.innerHTML = '<div class="pa-boite" role="dialog" aria-modal="true"><p>' + paEsc(question) + '</p><div class="pa-b"><button type="button" class="btn" id="pa_non">Non</button><button type="button" class="btn sel" data-pv="oui" id="pa_oui">Oui</button></div></div>';
  document.body.appendChild(v);
  var f = function(){ if(v.parentNode) v.parentNode.removeChild(v); };
  document.getElementById("pa_non").onclick = f;
  document.getElementById("pa_oui").onclick = function(){ f(); oui(); };
}

// Règle de l'application : au « Oui », c'est terminé à l'écran tout de suite; l'enregistrement se fait en arrière-plan,
// avec trois essais. Si tout échoue, on le dit discrètement et on relit l'état réel (rien n'est faussement « confirmé »).
function paQui(){ return (typeof MOI !== "undefined" && MOI && MOI.nom) ? MOI.nom : "vous"; }
function paConfirmerVite(champ, appliquer, rendu){
  PA.fond = PA.fond || {}; if(PA.fond[champ]) return; PA.fond[champ] = true;
  appliquer(PA.d); rendu();
  var essai = function(n){
    paAppel(champ).then(function(){ PA.fond[champ] = false; rendu(); })
      .catch(function(e){
        if(n < 3){ setTimeout(function(){ essai(n + 1); }, 2500 * n); return; }
        PA.fond[champ] = false;
        paLire().then(function(){ rendu(); paEtat(null, "La confirmation n’a pas pu être enregistrée (" + String((e && e.message) || e) + "). Touchez Confirmer pour réessayer.", true); })
          .catch(function(){ paEtat(null, "La confirmation n’a pas pu être enregistrée. Touchez Confirmer pour réessayer.", true); });
      });
  };
  essai(1);
}

// Accueil (Direction) : petit carré vert avec crochet à côté du numéro 1-2-3 quand l'étape de l'année est confirmée.
function paCoches(){
  if(typeof MOI === "undefined" || !MOI || MOI.role !== "direction") return;
  var dessiner = function(){
    var d = PA.d; if(!d) return;
    var ok = {echelle_salariale: !!(d.otpad && d.otpad.confirme), positionnement_employe: !!(d.position && d.position.confirme && d.assurance && d.assurance.confirme), envoi_salarial: !!(d.envoi && d.envoi.confirme)};
    Object.keys(ok).forEach(function(k){
      var a = document.querySelector('.menu a[data-k="' + k + '"] > span'); if(!a) return;
      var o = a.querySelector("b.okc"); if(o) o.remove();
      var b = document.createElement("b"); b.className = "okc" + (ok[k] ? " on" : ""); b.textContent = ok[k] ? "\u2713" : ""; b.setAttribute("aria-label", ok[k] ? "Confirmé" : "À confirmer"); var nc = a.querySelector("b.nc"); if(nc) a.insertBefore(b, nc); else a.appendChild(b);
    });
  };
  dessiner();
  paLire().then(dessiner).catch(function(){});
}
