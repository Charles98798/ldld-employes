// Envoi salarial (Direction seulement): liste des employés prêts, aperçu du courriel et du PDF avec contrôle automatique, envoi avec confirmation.
// Appels au Service (relais vers le pont): env_liste, env_apercu, env_envoyer. JAMAIS de mise en cache ni de copie sur l'appareil (salaires).
// Le mode « Essai » (tout va à la Direction) est le mode par défaut. Le serveur revérifie le mode, le nombre et les droits; aucun envoi ne part sans un appui sur « Oui, envoyer ».
var ENVS = {d: null, mode: "essai", sel: null, msg: "", occupe: false};
function envE(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function envFr(v){ var n = Number(String(v == null ? "" : v).replace(/\s/g, "").replace("$", "").replace(",", ".")); if(v === "" || v == null || isNaN(n)) return ""; return n.toFixed(2).replace(".", ",") + " $"; }
function envPuce(statut){
  var s = String(statut || ""), st = s === "Prêt" ? "background:#8EFF60;color:#1D1D1B" : s === "Envoyé" ? "background:#8D806A;color:#fff" : /^non concern/i.test(s) ? "background:#BDC9B2;color:#6E6350;border:1px solid #8D806A" : "background:#B7B1A5;color:#1D1D1B";
  return '<span style="'+st+';font-size:12px;padding:3px 8px;white-space:nowrap">'+envE(s)+'</span>';
}
function envPage(titre, corps){
  app.innerHTML = '<div class="page"><h1>'+envE(titre)+'</h1><a class="retour" href="#" id="retour">Retour</a>'+corps+'</div>';
}
function envMessage(t){ var z = document.getElementById("envmsg"); if(z){ z.style.display = t ? "block" : "none"; z.textContent = t || ""; } }
function envOuvrir(){
  ENVS.sel = null; ENVS.msg = "";
  envPage("Envoi salarial", '<div id="envapp"><div class="bandeau" id="envatt">▪ UN INSTANT</div></div>');
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); retirerBoutonBas(); responsable(); };
  appelService({action: "env_liste", session: sessionGardee()}).then(function(r){
    if(!document.getElementById("envapp")) return;
    if(r && r.ok && r.r){ ENVS.d = r.r; envListe(); }
    else { var a = document.getElementById("envatt"); if(a){ a.textContent = "▪ " + String((r && r.erreur) || "Échec").toUpperCase() + " · TOUCHEZ POUR RÉESSAYER"; a.onclick = envOuvrir; } }
  }).catch(function(){ var a = document.getElementById("envatt"); if(a){ a.textContent = "▪ RÉSEAU INDISPONIBLE · TOUCHEZ POUR RÉESSAYER"; a.onclick = envOuvrir; } });
}
// Une personne supprimée (introuvable dans la feuille d'envoi) n'est plus affichée.
function envVisibles(){ return ((ENVS.d && ENVS.d.employes) || []).filter(function(e){ return !(e.statut === "Bloqué" && /introuvable/i.test(String(e.raison || ""))); }); }
function envPrets(){ return envVisibles().filter(function(e){ return e.statut === "Prêt"; }); }
function envListe(){
  var d = ENVS.d, L = envVisibles(), prets = envPrets(), essai = ENVS.mode === "essai";
  var h = '<span class="lbl">Mode d’envoi</span><select class="bx" id="envmode"><option value="essai"'+(essai ? " selected" : "")+'>Essai (tout va à Direction)</option><option value="reel"'+(essai ? "" : " selected")+'>Réel (chaque employé)</option></select>';
  if(d.annee) h += '<span class="lbl">Année</span><div class="bx" style="border-color:transparent;padding-left:0">'+envE(d.annee)+'</div>';
  h += '<span class="lbl">Employés</span>';
  if(!L.length) h += '<div class="bandeau">▪ AUCUN EMPLOYÉ À ENVOYER</div>';
  h += L.map(function(e, i){
    var sous = (e.statut === "Bloqué" || /^non concern/i.test(String(e.statut))) ? (e.raison || "") : e.statut === "Envoyé" ? (e.essaiEnvoye ? "essai envoyé" : "envoyé") + (e.raison ? " · " + e.raison : "") : [envFr(e.salaire), e.position != null && e.position !== "" ? "position " + e.position + " %" : ""].filter(Boolean).join(" · ");
    return '<div class="envl" data-i="'+i+'" style="display:flex;justify-content:space-between;align-items:center;gap:10px;background:#BDC9B2;padding:12px 14px;margin:0 0 8px;cursor:pointer"><span style="min-width:0"><span style="display:block;font-size:16px">'+envE(nomTitre(e.nom))+'</span><span style="display:block;font-size:12px;color:#6E6350;overflow-wrap:anywhere">'+envE(sous)+(e.erreur ? " · " + envE(e.erreur) : "")+'</span></span>'+envPuce(e.statut)+'</div>';
  }).join("");
  h += '<div class="bandeau" id="envmsg" style="display:none;margin-top:10px"></div>';
  h += '<button type="button" class="bouton" id="envsend" style="height:46px;padding:0;margin-top:14px"'+(prets.length ? "" : " disabled")+'>Envoyer '+prets.length+' courriel'+(prets.length > 1 ? "s" : "")+(essai ? " d’essai" : "")+'</button>';
  document.getElementById("envapp").innerHTML = h;
  envMessage(ENVS.msg);
  document.getElementById("envmode").onchange = function(){ ENVS.mode = this.value === "reel" ? "reel" : "essai"; ENVS.msg = ""; envListe(); };
  Array.prototype.forEach.call(document.querySelectorAll(".envl"), function(x){ x.onclick = function(){ envApercu(L[+x.getAttribute("data-i")]); }; });
  document.getElementById("envsend").onclick = function(){ if(prets.length) envConfirmer(prets); };
}
function envApercu(e){
  if(!e) return;
  envPage(nomTitre(e.nom), '<div id="envapp"><div class="bandeau" id="envatt">▪ APERÇU EN PRÉPARATION · QUELQUES SECONDES</div></div>');
  document.getElementById("retour").onclick = function(ev){ ev.preventDefault(); envOuvrir(); };
  appelService({action: "env_apercu", session: sessionGardee(), f: {nom: e.nom}}).then(function(r){
    if(!document.getElementById("envapp")) return;
    if(!(r && r.ok && r.r)){ var a = document.getElementById("envatt"); if(a){ a.textContent = "▪ " + String((r && r.erreur) || "Échec").toUpperCase() + " · TOUCHEZ POUR RÉESSAYER"; a.onclick = function(){ envApercu(e); }; } return; }
    var p = r.r, c = p.controle || {}, ligne = function(t, ok, oui){ return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;background:#BDC9B2;padding:12px 14px;margin:0 0 8px"><span>'+envE(t)+'</span><span style="'+(ok ? "background:#8EFF60;color:#1D1D1B" : "background:#B8473A;color:#fff")+';font-size:12px;padding:3px 8px">'+envE(ok ? oui : "Écart")+'</span></div>'; };
    var h = '<span class="lbl">Courriel (aperçu)</span><div style="background:#BDC9B2;padding:12px 14px;margin:0 0 8px"><div style="font-size:15px;overflow-wrap:anywhere">Objet : '+envE(p.objet || "")+'</div><div style="font-size:12px;color:#6E6350;margin-top:6px;white-space:pre-wrap;overflow-wrap:anywhere">'+envE(p.corps || "")+'</div></div>';
    h += '<span class="lbl">Pièce jointe</span><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;background:#BDC9B2;padding:12px 14px;margin:0 0 8px"><span style="overflow-wrap:anywhere">'+envE(p.pdfNom || "")+'</span>'+(p.pdfBase64 ? '<button type="button" class="bouton" id="envpdf" style="width:auto;height:46px;padding:0 14px;margin:0">PDF</button>' : "")+'</div>';
    h += '<span class="lbl">Contrôle automatique</span>'+ligne("Courriel = PDF = échelle", !!c.ok, "Conforme")+ligne("Position confirmée", c.positionOk !== false && !!c.ok, "Oui")+ligne("Salaire confirmé", c.salaireOk !== false && !!c.ok, "Oui");
    document.getElementById("envapp").innerHTML = h;
    var b = document.getElementById("envpdf");
    if(b) b.onclick = function(){ try { var bin = atob(p.pdfBase64), u = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); var url = URL.createObjectURL(new Blob([u], {type: "application/pdf"})); window.open(url, "_blank"); } catch(x){} };
  }).catch(function(){ var a = document.getElementById("envatt"); if(a){ a.textContent = "▪ RÉSEAU INDISPONIBLE · TOUCHEZ POUR RÉESSAYER"; a.onclick = function(){ envApercu(e); }; } });
}
function envConfirmer(prets){
  var essai = ENVS.mode === "essai", n = prets.length, z = document.getElementById("envapp"); if(!z) return;
  var noms = prets.map(function(e){ return nomTitre(e.nom); });
  z.insertAdjacentHTML("beforeend", '<div id="envdlg" style="background:#1D1D1B;color:#fff;padding:18px 16px;margin-top:16px"><div style="font-size:20px">Envoyer '+n+' courriel'+(n > 1 ? "s" : "")+'?</div><div style="font-size:13px;line-height:1.5;margin:10px 0 14px">Mode : <b style="color:#8EFF60">'+(essai ? "Essai" : "Réel")+'</b>. '+(essai ? "Tout est envoyé à la Direction seulement. En mode réel, chaque employé reçoit son courriel et son PDF Rémunération globale." : "Chaque employé reçoit son courriel et son PDF Rémunération globale. Cet envoi ne se reprend pas.")+'<br>'+envE(noms.join(", "))+'</div><button type="button" class="bouton" id="envoui" style="height:46px;padding:0;margin:0 0 10px;border-bottom:3px solid #8EFF60">Oui, envoyer</button><button type="button" class="bouton" id="envnon" style="height:46px;padding:0;margin:0;background:#8D806A;color:#fff">Annuler</button></div>');
  var dlg = document.getElementById("envdlg"); if(dlg && dlg.scrollIntoView) dlg.scrollIntoView({block: "center"});
  document.getElementById("envnon").onclick = function(){ var d = document.getElementById("envdlg"); if(d) d.remove(); };
  document.getElementById("envoui").onclick = function(){
    if(ENVS.occupe) return; ENVS.occupe = true;
    var oui = document.getElementById("envoui"), non = document.getElementById("envnon"); oui.disabled = true; if(non) non.disabled = true;
    // Envoi par lots de 2: l'écran avance lot par lot avec le compte, et ne propose JAMAIS de refaire l'envoi entier (risque de doublons en mode réel).
    var mode = essai ? "essai" : "reel", lots = [], i0 = 0, faits = 0;
    for(; i0 < prets.length; i0 += 2) lots.push(prets.slice(i0, i0 + 2));
    function progres(){ oui.textContent = "Envoi en cours · " + faits + " sur " + n; }
    function arret(raison){
      ENVS.occupe = false; var d = document.getElementById("envdlg"); if(d) d.remove();
      // L'état réel est relu depuis le serveur: les courriels déjà partis y sont marqués.
      appelService({action: "env_liste", session: sessionGardee()}).then(function(r){ if(r && r.ok && r.r) ENVS.d = r.r; }).catch(function(){}).then(function(){
        ENVS.msg = "▪ ENVOI INTERROMPU APRÈS " + faits + " SUR " + n + " · " + raison + " · NE REFAITES PAS L’ENVOI: VÉRIFIEZ LES STATUTS CI-DESSOUS ET ENVOYEZ SEULEMENT CEUX QUI SONT ENCORE PRÊTS";
        if(document.getElementById("envapp")) envListe(); });
    }
    function suite(k){
      if(k >= lots.length){ ENVS.occupe = false; ENVS.msg = "▪ " + (essai ? "ESSAI ENVOYÉ À LA DIRECTION · " : "ENVOYÉ · ") + n + " COURRIEL" + (n > 1 ? "S" : ""); envOuvrir(); return; }
      progres();
      appelService({action: "env_envoyer", session: sessionGardee(), f: {mode: mode, noms: lots[k].map(function(e){ return e.nom; }), nombre: lots[k].length}}).then(function(r){
        if(r && r.ok){ faits += lots[k].length; suite(k + 1); }
        else arret(String((r && r.erreur) || "RÉESSAYEZ").toUpperCase());
      }).catch(function(){ arret("RÉPONSE NON REÇUE"); });
    }
    suite(0);
  };
}
