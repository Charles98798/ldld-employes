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
function paLire(){ return appelService({action: "pa_donnees", session: sessionGardee()}).then(function(r){ if(r && r.ok){ PA.d = r.r; return r.r; } throw new Error((r && r.erreur) || "Échec."); }); }

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
  h += paBande("1", "Position " + an);
  if(d.position.confirme) h += '<p class="pa-l">Confirmée par ' + paEsc(d.position.par) + ' · ' + paEsc(paQuand(d.position.quand)) + ' · <a href="#" id="pa_pos_mod" class="pa-mod">Modifier</a></p>';
  else h += '<p class="pa-l"><b class="pa-rouge">À confirmer</b></p>';
  h += '<div class="pa-b"><button type="button" class="btn" id="pa_pos_ouvrir">Ouvrir les positions</button><button type="button" class="btn" id="pa_pos_conf"' + (d.position.confirme ? " disabled" : "") + '>Confirmer la position</button></div>';
  // 2 Assurance : un montant PAR EMPLOYÉ, repris de l'an passé, à confirmer ou ajuster ("0" s'il n'y en a pas)
  h += paBande("2", "Assurance " + an);
  h += '<div class="pa-lst">' + d.assurance.employes.map(function(e, i){
    return '<div class="pa-e"><div class="pa-n"><span>' + paEsc(e.nom) + '</span><small>' + paEsc(e.cat) + '</small></div><div class="pa-c"><input id="pa_a' + i + '" data-id="' + paEsc(e.id) + '" inputmode="decimal" autocomplete="off" aria-label="Assurance ' + paEsc(e.nom) + '" class="' + (e.val == null ? "vide" : "") + '" value="' + paEsc(e.val == null ? "" : String(e.val).replace(".", ",")) + '"><u>$</u></div>' +
      '<small class="pa-p">Montant précédent\u00a0: ' + paEsc(e.precedent == null ? "—" : paMontant(e.precedent)) + '</small><small class="pa-p" id="pa_as' + i + '">' + (e.ajusteQuand && !e.prefill ? "Enregistré à " + paEsc(paHeure(e.ajusteQuand)) : "") + '</small></div>';
  }).join("") + '</div><div id="pa_bas"></div>';  h += '<p class="finnote" id="pa_etat"></p>';
  z.innerHTML = h;
  var $ = function(i){ return document.getElementById(i); };
  $("pa_pos_ouvrir").onclick = function(){ PA_RETOUR = true; posEmpOuvrir(); };
  $("pa_pos_conf").onclick = function(){ paAction("pos_conf", null, "Position confirmée."); };
  if($("pa_pos_mod")) $("pa_pos_mod").onclick = function(e){ e.preventDefault(); PA.enCours = false; paAppel("pos_modif").then(function(){ PA_RETOUR = true; posEmpOuvrir(); }).catch(function(x){ paEtat(null, String(x.message || x), true); }); };
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
function paBas(){
  var d = PA.d, z = document.getElementById("pa_bas"); if(!d || !z) return;
  var A = d.assurance, h = "";
  h += '<p class="pa-l">Total ' + d.annee + "\u00a0: <b>" + paEsc(paMontant(A.total)) + '</b> · ' + d.anneePrec + "\u00a0: " + paEsc(paMontant(A.totalPrec)) + '</p>';
  if(A.confirme) h += '<p class="pa-l">Assurance confirmée par ' + paEsc(A.par) + ' · ' + paEsc(paQuand(A.quand)) + '</p>';
  else h += '<p class="pa-l"><b class="pa-rouge">À confirmer</b>' + (A.employes.some(function(e){ return e.prefill; }) ? ' · montants repris de l’an passé' : '') + '</p>';
  h += '<div class="pa-b"><button type="button" class="btn" id="pa_ass_conf"' + ((A.confirme || !A.complet) ? " disabled" : "") + '>Confirmer l’assurance</button></div>';
  h += paBande("3", "Envoi");
  if(d.envoi.confirme) h += '<p class="pa-l">Envoi confirmé par ' + paEsc(d.envoi.par) + ' · ' + paEsc(paQuand(d.envoi.quand)) + '</p>';
  else h += '<p class="pa-l">' + (d.envoi.pret ? 'Position et assurance confirmées : l’envoi peut être confirmé.' : 'Grisé tant que la position et l’assurance ne sont pas toutes deux confirmées.') + '</p>';
  h += '<div class="pa-b"><button type="button" class="btn noir" id="pa_env_conf"' + ((d.envoi.confirme || !d.envoi.pret) ? " disabled" : "") + '>Confirmer l’envoi</button></div>';
  z.innerHTML = h;
  document.getElementById("pa_ass_conf").onclick = function(){ paAction("ass_conf", null, "Assurance confirmée."); };
  document.getElementById("pa_env_conf").onclick = function(){ paAction("env_conf", null, "Envoi confirmé."); };
}
var PA_RETOUR = false;