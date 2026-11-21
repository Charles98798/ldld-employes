// Position et assurance (annuel, Direction) — ancien « Position employé ». Trois bandes : 1 Position, 2 Assurance, 3 Envoi.
// Données : domaine « pa_ » du Service (pa_donnees / pa_enregistrer) -> journal du classeur DIRECTION. Jamais gardées sur l'appareil (mémoire seulement).
// Règles : l'assurance est UN montant unique, seulement ici ; l'OTPAD par catégorie est seulement dans l'Échelle salariale.
// « Confirmer l'envoi » reste grisé tant que la position ET l'assurance ne sont pas confirmées ; toute modification après coup le fait tomber (calculé par le Service).
var PA = {d: null, enCours: false};
function paEsc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function paMontant(v){ if(v == null) return "—"; var n = Math.round(v*100)/100, e = Math.round(n) === n ? String(n) : n.toFixed(2).replace(".", ","); return e.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " $"; }
function paNum(t){ t = String(t == null ? "" : t).replace(/\s/g, "").replace("$", "").replace(",", "."); if(t === "") return null; var n = Number(t); return isNaN(n) ? null : n; }
var PA_MOIS = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
function paQuand(q){ var m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(String(q || "")); return m ? (+m[3]) + " " + PA_MOIS[+m[2]-1] + " " + m[1] + " à " + (+m[4]) + " h " + m[5] : String(q || ""); }
function paHeure(q){ var m = /[T ](\d{2}):(\d{2})/.exec(String(q || "")); return m ? (+m[1]) + " h " + m[2] : ""; }
function paAppel(champ, valeur, id){
  var c = {action: "pa_enregistrer", champ: champ, session: sessionGardee()}; if(valeur !== undefined && valeur !== null) c.valeur = valeur; if(id) c.id = id;
  return appelService(c).then(function(r){ if(r && r.ok){ PA.d = r.r; return r.r; } throw new Error((r && r.erreur) || "Échec de l'enregistrement."); });
}
function paLire(){ return Promise.race([appelService({action: "pa_donnees", session: sessionGardee()}), new Promise(function(_, non){ setTimeout(function(){ non(new Error("Lecture trop longue")); }, 25000); })]).then(function(r){ if(r && r.ok){ PA.d = r.r; return r.r; } throw new Error((r && r.erreur) || "Échec."); }); }

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
  document.getElementById("pa_ass_conf").onclick = function(){ paAction("ass_conf", null, "Assurance confirmée."); };
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
    var c = document.getElementById("pa_pos_conf"); if(c) c.onclick = function(){ if(PA.enCours) return; PA.enCours = true; paAppel("pos_conf").then(function(){ PA.enCours = false; paPosBas(); }).catch(function(e){ PA.enCours = false; var t = document.getElementById("pa_etat"); if(t) t.textContent = String(e.message || e); }); };
    var m = document.getElementById("pa_pos_mod"); if(m) m.onclick = function(e){ e.preventDefault(); paAppel("pos_modif").then(function(){ paPosBas(); }).catch(function(x){ var t = document.getElementById("pa_etat"); if(t) t.textContent = String(x.message || x); }); };
  };
  if(PA.d) go(); else paLire().then(go).catch(function(){});
}
