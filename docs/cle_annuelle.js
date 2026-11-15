// Page « Clé annuelle » (Direction seulement): rotation de la clé de chiffrement en un bouton, avec garde-fous.
// Service: cle_rotation_etat (lecture), cle_rotation_lancer, cle_rotation_finir, cle_rotation_reessayer (écriture: confirmation OUI + second code).
// Jamais de clé ni de valeur à l'écran. Tant que le Service n'a pas ces actions, la page dit seulement que la rotation n'est pas encore installée.
var CA = {etat: null, minuteur: 0, code: false};
function caArreter(){ if(CA.minuteur){ clearInterval(CA.minuteur); CA.minuteur = 0; } }
function caAppel(corps){ corps.session = sessionGardee(); return appelService(corps); }
function caDate(t){ if(!t) return ""; var d = new Date(t); if(isNaN(d)) return String(t); return d.toLocaleDateString("fr-CA", {day: "numeric", month: "long", year: "numeric"}); }
function caHeure(t){ var d = new Date(t); if(isNaN(d)) return ""; return d.getHours() + " h " + ("0" + d.getMinutes()).slice(-2); }
function cleAnnuelle(){
  caArreter(); CA.code = false;
  app.innerHTML = '<div class="page ca"><a class="retour" href="#" id="retour">Retour</a><h1>Clé annuelle</h1><div id="ca"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); caArreter(); menu(); };
  caCharger();
}
function caCharger(){
  caAppel({action: "cle_rotation_etat"}).then(function(r){
    var z = document.getElementById("ca"); if(!z) return;
    if(!r || !r.ok){ z.innerHTML = '<div class="carte"><p class="etq">Rotation de la clé</p><p>' + esc((r && r.erreur && !/inconnue/i.test(r.erreur)) ? r.erreur : "La rotation n’est pas encore installée.") + '</p></div>'; return; }
    CA.etat = r; caAfficher(r);
    caArreter(); if(r.etat === "en_cours") CA.minuteur = setInterval(function(){ caAppel({action: "cle_rotation_etat"}).then(function(x){ if(x && x.ok && document.getElementById("ca")){ CA.etat = x; if(x.etat !== "en_cours") caArreter(); if(!CA.code) caAfficher(x); } }).catch(function(){}); }, 15000);
  }).catch(function(){ var z = document.getElementById("ca"); if(z) z.innerHTML = '<div class="carte"><p>Lecture impossible. Réessayez dans un instant.</p></div>'; });
}
function caLigne(ok, enCours, titre, aide){ return '<div class="ligne ' + (ok ? "ok" : (enCours ? "en" : "")) + '"><span class="pt">' + (ok ? "✓" : (enCours ? "…" : "")) + '</span><div>' + titre + (aide ? '<div class="aide">' + aide + '</div>' : "") + '</div></div>'; }
function caAfficher(r){
  var z = document.getElementById("ca"), h = "", v = r.verif || {}, e = r.etapes || {};
  if(r.etat === "normal"){
    h = '<div><div class="carte"><p class="etq">Clé actuelle</p><p class="gros">Version ' + esc(r.version) + '</p><p class="aide">Créée le ' + esc(caDate(r.creee_t)) + (r.prochaine_t ? ' · prochaine rotation conseillée en ' + esc(caDate(r.prochaine_t)) : "") + '</p></div>' +
      '<div class="carte"><p class="etq">Dernière vérification de nuit</p><p class="gros">' + esc(v.ecarts || 0) + ' écart' + ((v.ecarts || 0) > 1 ? "s" : "") + '</p><p class="aide">' + (v.t ? esc(caDate(v.t)) + ' à ' + esc(caHeure(v.t)) + ' · ' : "") + 'copies chiffrées identiques à la feuille</p></div></div>' +
      '<div class="carte"><p class="etq">Changer la clé</p><p>La nouvelle clé est créée dans Google. Elle n’est jamais affichée.</p><button class="btn" id="cabtn">Changer la clé maintenant</button></div>';
    z.innerHTML = h; document.getElementById("cabtn").onclick = caConfirmer;
  } else if(r.etat === "en_cours"){
    var c = e.copies || {};
    h = '<div class="carte"><p class="etq">Rotation en cours · version ' + esc(r.version - 1) + ' vers ' + esc(r.version) + '</p>' +
      caLigne(e.cle, !e.cle, "Nouvelle clé créée", "Version " + esc(r.version)) +
      caLigne(!!(c.total && c.faites >= c.total), !!e.cle && !(c.total && c.faites >= c.total), "Copies refaites avec la nouvelle clé", (c.total ? esc(c.faites) + " sur " + esc(c.total) : "")) +
      caLigne(e.verif, false, "Vérification : déchiffré identique à la feuille", "Après les copies") +
      caLigne(e.retrait, false, "Retrait de l’ancienne clé", "") + '</div>' +
      '<div class="carte"><button class="btn sup" disabled>Retirer l’ancienne clé</button><p class="aide">Ce bouton s’active seulement quand la vérification est à 0 écart.</p></div>';
    z.innerHTML = h;
  } else if(r.etat === "pret"){
    h = '<div class="carte"><p class="etq">Vérification</p><p class="gros">0 écart · ' + esc(v.copies_nouvelle) + ' sur ' + esc(v.copies_total) + ' copies à la version ' + esc(r.version) + '</p>' + (v.t ? '<p class="aide">Terminée à ' + esc(caHeure(v.t)) + '</p>' : "") + '</div>' +
      '<div class="carte"><button class="btn sup" id="cabtn">Retirer l’ancienne clé</button><p class="aide">Après le retrait, les copies de la version ' + esc(r.version - 1) + ' n’existent plus. L’historique officiel reste dans Google.</p></div>';
    z.innerHTML = h; document.getElementById("cabtn").onclick = function(){ caEnvoyer("cle_rotation_finir"); };
  } else if(r.etat === "arret"){
    var x = r.ecart || {};
    var quand = (x.t || (r.verif && r.verif.t)) ? caDate(x.t || r.verif.t) + " à " + caHeure(x.t || r.verif.t) : "inconnue";
    var court = "Clé annuelle : l’arrêt de sécurité revient.\nDomaine : " + (x.domaine || "") + ", " + x.nb + " copie" + (x.nb > 1 ? "s" : "") + " sur " + x.total + " encore à la version " + (r.version - 1) + ".\nDernière vérification : " + quand + ". Aucune valeur dans ce message.";
    var complet = court.replace("Aucune valeur dans ce message.", "") + "\n\nContexte : application employés LDLD, chiffrement des copies Supabase, rotation annuelle de la clé (Service Apps Script « LDLD — Service application employés »). Fonctions : scRotationMaintenant, scRotationFinir, scRotationSoupcon ; actions cle_rotation_etat et cle_rotation_reessayer. L’ancienne clé est conservée, rien n’est supprimé. Lis d’abord le Guide de reprise : chiffrement et clé annuelle (Google Drive de Charles, dossier LDLD / Chiffrement et clé annuelle, lien du dossier : https://drive.google.com/drive/folders/1YOhDEPZyonks-0e0U_T49fGurz7BAHt5). Peux-tu vérifier la cause et relancer la vérification ? Aucune clé ni valeur dans ce message ; ne rien modifier en ligne sans la phrase d’autorisation de Charles.";
    h = '<div><div class="carte alerte"><p class="etq" style="color:#a33a2b">Arrêt de sécurité</p><p class="gros">' + esc(x.nb) + ' copie' + (x.nb > 1 ? "s" : "") + ' à la version ' + esc(r.version - 1) + '</p><p style="margin-top:6px">L’ancienne clé est conservée. Rien n’est supprimé ni perdu.</p></div>' +
      '<div class="carte"><p class="etq">Ce qui s’est produit</p>' +
      '<div class="ligne"><div><b>Où :</b> ' + esc(x.domaine || "") + ', ' + esc(x.nb) + ' sur ' + esc(x.total) + ((x.ids && x.ids.length) ? ' (' + esc(x.ids.join(", ")) + ')' : "") + '</div></div>' +
      '<div class="ligne"><div><b>Quoi :</b> ces copies sont encore chiffrées avec l’ancienne clé (version ' + esc(r.version - 1) + ').</div></div>' +
      '<div class="ligne"><div><b>Cause probable :</b> ' + esc(x.cause || "la copie n’a pas encore été refaite (retard de publication ou réseau).") + '</div></div>' +
      '<p class="aide">Aucune valeur n’est affichée. Le même texte est envoyé par courriel.</p></div></div>' +
      '<div><div class="carte"><p class="etq">Que faire</p><p>1. Attendre 30 minutes, puis appuyer sur « Réessayer ». La plupart du temps, une copie était simplement en retard.<br>2. Si l’arrêt revient demain, nous écrire avec le message ci-dessous. Aucune donnée n’est en danger : le Drive reste la source.</p><button class="btn" id="cabtn">Réessayer</button><p class="aide">Un courriel d’alerte est déjà envoyé, sans aucune valeur.</p></div>' +
      '<div class="carte"><p class="etq">Si l’arrêt revient : message tout prêt</p><p class="aide" style="margin:0 0 6px">Message court</p><p class="pret" id="msgcourt">' + esc(court).replace(/\n/g, "<br>") + '</p><p class="aide" style="margin:12px 0 6px">Message complet</p><p class="pret" id="msgcomplet">' + esc(complet) + '</p>' +
      '<div class="cacops"><button class="btn" id="cacop1">Copier le message court</button><button class="btn" id="cacop2">Copier le message complet</button></div><p class="aide" id="copmsg">Rempli automatiquement, sans aucune clé ni valeur.</p></div></div>';
    z.innerHTML = h;
    document.getElementById("cabtn").onclick = function(){ caEnvoyer("cle_rotation_reessayer"); };
    function cop(id, txt){ document.getElementById(id).onclick = function(){ var m = document.getElementById("copmsg"); function sel(){ var rg = document.createRange(); rg.selectNodeContents(document.getElementById(id === "cacop1" ? "msgcourt" : "msgcomplet")); var g = getSelection(); g.removeAllRanges(); g.addRange(rg); m.textContent = "Texte sélectionné : copiez-le."; } try { navigator.clipboard.writeText(txt).then(function(){ m.textContent = "Copié. Collez-le dans le fil du projet."; }, sel); } catch(e){ sel(); } }; }
    cop("cacop1", court); cop("cacop2", complet);
  } else if(r.etat === "termine"){
    h = '<div class="carte"><p class="etq">Clé actuelle</p><p class="gros">Version ' + esc(r.version) + '</p><p class="aide">Ancienne clé retirée le ' + esc(caDate(r.retire_t)) + (r.retire_t ? ' à ' + esc(caHeure(r.retire_t)) : "") + ' · inscrit au journal des clés</p></div>' +
      (r.prochaine_t ? '<div class="carte"><p class="etq">Prochaine rotation conseillée</p><p class="gros">' + esc(caDate(r.prochaine_t)) + '</p></div>' : "");
    z.innerHTML = h;
  } else z.innerHTML = '<div class="carte"><p>État inconnu.</p></div>';
}
function caConfirmer(){
  CA.code = true; var z = document.getElementById("ca");
  z.innerHTML = '<div class="carte cadre"><p class="etq">Confirmer</p><p>Une nouvelle clé sera créée et les copies chiffrées seront refaites. L’ancienne clé reste valide jusqu’à la vérification. Rien n’est perdu.</p><p class="aide">Pour confirmer, écrivez OUI, puis entrez le code reçu par courriel.</p>' +
    '<input class="champ" id="caoui" placeholder="OUI" aria-label="Confirmation" autocomplete="off"><input class="champ" id="cacode" inputmode="numeric" maxlength="6" placeholder="000000" aria-label="Code reçu par courriel" autocomplete="one-time-code">' +
    '<button class="btn" id="caok">Confirmer</button><button class="btn" id="caan">Annuler</button><p class="aide" id="camsg"></p></div>';
  document.getElementById("caan").onclick = function(){ CA.code = false; caAfficher(CA.etat); };
  caAppel({action: "salaire_code"}).then(function(r){ var m = document.getElementById("camsg"); if(m) m.textContent = r && r.ok ? "Code envoyé à votre courriel. Il est valable 10 minutes." : ((r && r.erreur) || "Envoi du code impossible."); }).catch(function(){});
  document.getElementById("caok").onclick = function(){
    var oui = document.getElementById("caoui").value.trim().toUpperCase(), code = document.getElementById("cacode").value.replace(/\D/g, ""), m = document.getElementById("camsg");
    if(oui !== "OUI"){ m.textContent = "Écrivez OUI pour confirmer."; return; }
    if(code.length !== 6){ m.textContent = "Entrez le code de 6 chiffres."; return; }
    m.textContent = "Vérification du code…";
    caAppel({action: "salaire_verifier", code: code}).then(function(r){
      if(!r || !r.ok){ m.textContent = (r && r.erreur) || "Code invalide ou expiré."; return; }
      CA.code = false; caEnvoyer("cle_rotation_lancer");
    }).catch(function(){ m.textContent = "Vérification impossible. Réessayez."; });
  };
}
function caEnvoyer(action){
  var z = document.getElementById("ca");
  caAppel({action: action, confirmation: "OUI"}).then(function(r){
    if(r && r.code){ caConfirmer(); return; }
    if(!r || !r.ok){ z.insertAdjacentHTML("afterbegin", '<div class="carte alerte"><p>' + esc((r && r.erreur) || "Action impossible.") + '</p></div>'); return; }
    caCharger();
  }).catch(function(){ z.insertAdjacentHTML("afterbegin", '<div class="carte alerte"><p>Action impossible. Réessayez dans un instant.</p></div>'); });
}
