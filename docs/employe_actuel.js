// Employé actuel (Direction): un employé à la fois, toutes les colonnes de la feuille « Employés — actuelle » (sauf colonnes cachées), dans l'ordre de la feuille.
// Version 1: LECTURE SEULE (décision 11-09): les changements passent par la fiche « Modifier un employé ». Pont: action emp_donnees. L'enregistrement des colonnes M (emp_actuel_enregistrer) est prêt mais désactivé.
// Liste des employés: classement par catégorie (Direction, Gestionnaire, Expert technique, Administratif, Technologue, Professionnel en informatique, Auxiliaire), puis ordre alphabétique (prénom nom).
var EA = {d: null, i: 0};
var EA_ORDRE = ["direction", "gestionnaire", "expert technique", "administratif", "technologue", "professionnel en informatique", "auxiliaire"];
function eaEsc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function eaRang(c){ var k = EA_ORDRE.indexOf(String(c || "").toLowerCase()); return k < 0 ? EA_ORDRE.length : k; }
function eaTrier(l){
  return l.slice().sort(function(a, b){
    var d = eaRang(a.categorie) - eaRang(b.categorie);
    return d !== 0 ? d : String(a.nom).localeCompare(String(b.nom), "fr", {sensitivity: "base"});
  });
}
function eaOuvrir(nomDebut){
  app.innerHTML = '<div class="page ppx ea"><a class="retour" href="#" id="retour">Retour</a><div id="ea_app"><h1>Employé actuel</h1><div class="bandeau" id="ea_att">▪ UN INSTANT</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  appelService({action: "emp_donnees", session: sessionGardee()}).then(function(r){
    if(r && r.ok){ EA.d = {employes: eaTrier(r.r.employes || [])}; EA.i = 0; if(nomDebut){ EA.d.employes.forEach(function(e, k){ if(String(e.nom).toLowerCase().indexOf(nomDebut) === 0 && EA.i === 0) EA.i = k; }); } eaRendu(); }
    else { var a = document.getElementById("ea_att"); if(a) a.textContent = "▪ " + String((r && r.erreur) || "Échec").toUpperCase() + " · RÉESSAYEZ"; }
  }).catch(function(){ var a = document.getElementById("ea_att"); if(a) a.textContent = "▪ RÉSEAU INDISPONIBLE · RÉESSAYEZ"; });
}
function eaSauver(id, cle, valeur){
  var et = document.getElementById("ea_etat"); if(et) et.textContent = "Enregistrement…";
  appelService({action: "emp_actuel_enregistrer", id: id, champ: cle, valeur: valeur, session: sessionGardee()}).then(function(r){
    if(et) et.textContent = (r && r.ok) ? "Enregistré" : ((r && r.erreur) || "Échec de l'enregistrement.");
    if(r && r.ok && r.r && r.r.employe){ EA.d.employes[EA.i] = r.r.employe; eaChamps(); }
  }).catch(function(){ if(et) et.textContent = "Réseau indisponible."; });
}
function eaChamps(){
  var e = EA.d.employes[EA.i], h = "";
  e.champs.forEach(function(c){
    h += '<div class="lab">' + eaEsc(c.titre) + '</div>';
    if(false && c.mod) h += '<div class="fld"><input id="ea_' + eaEsc(c.cle) + '" autocomplete="off" class="' + (c.valeur === "" || c.valeur == null ? "vide" : "") + '" value="' + eaEsc(c.valeur) + '"></div>';
    else h += '<div class="ro"><span>' + (c.valeur === "" || c.valeur == null ? "&nbsp;" : eaEsc(c.valeur)) + '</span></div>';
  });
  document.getElementById("ea_champs").innerHTML = h;
  e.champs.forEach(function(c){
    return;
    var el = document.getElementById("ea_" + c.cle); if(!el) return;
    el.oninput = function(){ el.className = el.value.trim() === "" ? "vide" : ""; };
    el.onchange = function(){ eaSauver(e.id, c.cle, el.value); };
  });
}
function eaRendu(){
  var l = EA.d.employes;
  var h = '<h1>Employé actuel</h1><div class="lab">Employé</div><div class="fld"><select id="ea_sel">' +
    l.map(function(e, i){ return '<option value="' + i + '"' + (i === EA.i ? " selected" : "") + '>' + eaEsc(e.nom) + '</option>'; }).join("") +
    '</select></div><div id="ea_champs"></div><p class="finnote" id="ea_etat"></p>' +
    '<p class="finnote">Expérience, diplôme et années hors poste se modifient par la fiche « Modifier un employé ».</p>';
  document.getElementById("ea_app").innerHTML = h;
  document.getElementById("ea_sel").onchange = function(){ EA.i = Number(this.value); eaChamps(); };
  eaChamps();
}
