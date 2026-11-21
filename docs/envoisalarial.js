// Envoi salarial (Direction seulement): liste des employés prêts, aperçu du courriel et du PDF avec contrôle automatique, envoi avec confirmation.
// Appels au Service (relais vers le pont): env_liste, env_apercu, env_envoyer. JAMAIS de mise en cache ni de copie sur l'appareil (salaires).
// Le mode « Essai » (tout va à la Direction) est le mode par défaut. Le serveur revérifie le mode, le nombre et les droits; aucun envoi ne part sans un appui sur « Oui, envoyer ».
var ENVS = {d: null, mode: "reel", sel: null, msg: "", occupe: false};
function envE(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function envFr(v){ var n = Number(String(v == null ? "" : v).replace(/\s/g, "").replace("$", "").replace(",", ".")); if(v === "" || v == null || isNaN(n)) return ""; return n.toFixed(2).replace(".", ",") + " $"; }
function envPuce(statut, libelle){
  var s = String(statut || "");
  return '<span style="font-size:12px;letter-spacing:.06em;color:#6E6350;white-space:nowrap">'+envE(libelle || (s === "Prêt" ? "Confirmé" : s === "Bloqué" ? "Non confirmé" : s))+'</span>';
}
// Écarts au contrôle automatique, signalés sur la ligne (texte brique, sobre). Le pont les renvoie dans env_liste: e.ecarts = ["raison courte", ...]; une position avec décimale est aussi détectée ici.
function envEcarts(e){
  var L = Array.isArray(e.ecarts) ? e.ecarts.slice() : [];
  if(e.position != null && /[.,]\d/.test(String(e.position))) L.push("position avec décimale");
  return L.length ? '<span style="display:block;font-size:12px;color:#B8473A;margin-top:2px;overflow-wrap:anywhere">Écart · '+envE(L.join(" · "))+'</span>' : "";
}
function envPage(titre, corps){
  app.innerHTML = '<div class="page"><h1>'+envE(titre)+'</h1><a class="retour" href="#" id="retour">Retour</a>'+corps+'</div>';
}
function envMessage(t){ var z = document.getElementById("envmsg"); if(z){ z.style.display = t ? "block" : "none"; z.textContent = t || ""; } }
// Barre d'état au milieu de l'écran (même barre noire et même pourcentage que l'envoi du contrat). Le bouton Fermer reste désactivé tant que le travail n'est pas terminé ou en échec.
var ENVB = null;
function envBarreDessiner(){
  var z = document.getElementById("envbarz"), E = ENVB; if(!z || !E) return;
  var p = Math.round(E.etat === "non" ? 0 : E.p), rouge = E.etat === "non";
  z.innerHTML = '<div style="height:8px;background:var(--beige);border:1px solid var(--tx2);position:relative"><i style="position:absolute;left:0;top:0;bottom:0;width:'+p+'%;background:#000000"></i></div><div style="font-size:20px;font-weight:300;margin:4px 0 8px">'+p+' %</div><div class="bandeau" style="'+(rouge ? "background:#A33A2B;color:#fff" : "background:var(--vert);color:#000000")+';margin:0 0 4px;cursor:default;font-size:11px;padding:8px 10px;letter-spacing:.08em">'+envE(E.texte)+'</div><div class="aeact" style="margin:10px 0 4px">'+'<button type="button" class="bouton lg" id="envbarf"'+(E.etat === "cours" ? " disabled" : "")+'>Fermer</button></div>';
  var f = document.getElementById("envbarf"); if(f) f.onclick = function(){ if(ENVB && ENVB.etat === "cours") return; var cb = ENVB && ENVB.apresFermer; envBarreRetirer(); if(cb) cb(); };
  var r = document.getElementById("envbarre"); if(r) r.onclick = function(){ var fn = ENVB && ENVB.reessayer; envBarreRetirer(); if(fn) fn(); };
}
function envBarreRetirer(){ if(ENVB && ENVB.tick) clearInterval(ENVB.tick); ENVB = null; var d = document.getElementById("envbar"); if(d) d.remove(); }
function envBarreOuvrir(texte, duree, opts){
  envBarreRetirer(); opts = opts || {};
  var t0 = Date.now(), E = ENVB = {etat: "cours", p: 0, texte: texte, reel: false, reessayer: opts.reessayer, apresFermer: opts.apresFermer};
  if(!document.getElementById("envbar")) document.body.insertAdjacentHTML("beforeend", '<div class="pop" id="envbar"><div class="popc" style="max-width:260px;padding:14px 14px 10px"><div id="envbarz"></div></div></div>');
  E.tick = setInterval(function(){ if(ENVB !== E || E.etat !== "cours") return; if(!E.reel) E.p = 92 * (1 - Math.exp(-(Date.now() - t0) / (duree || 30000))); envBarreDessiner(); }, 400);
  envBarreDessiner();
}
function envBarreP(p, texte){ if(!ENVB) return; ENVB.reel = true; ENVB.p = p; if(texte) ENVB.texte = texte; envBarreDessiner(); }
function envBarreFin(ok, texte){ if(!ENVB) return; if(ENVB.tick) clearInterval(ENVB.tick); ENVB.etat = ok ? "ok" : "non"; ENVB.p = ok ? 100 : 0; ENVB.texte = texte; envBarreDessiner(); }
function envOuvrir(){
  ENVS.sel = null; ENVS.msg = ""; ENVS.coches = {};
  envPage("Envoi salarial", '<div id="envapp"></div>');
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); envBarreRetirer(); retirerBoutonBas(); responsable(); };
  envBarreOuvrir("Lecture des salaires…", 30000, {reessayer: envOuvrir, apresFermer: function(){ retirerBoutonBas(); responsable(); }});
  appelService({action: "env_liste", session: sessionGardee(), }).then(function(r){
    if(!document.getElementById("envapp")) return;
    if(r && r.ok && r.r){ ENVS.d = r.r; envBarreRetirer(); envListe(); if(typeof paLire === "function"){ ENVS.paErr = false; paLire().then(function(){ if(document.getElementById("envapp")) envListe(); }).catch(function(){ ENVS.paErr = true; if(document.getElementById("envapp")) envListe(); }); } }
    else envBarreFin(false, String((r && r.erreur) || "Échec"));
  }).catch(function(){ envBarreFin(false, "Réseau indisponible"); });
}
// Une personne supprimée (introuvable dans la feuille d'envoi) n'est plus affichée.
function envVisibles(){ return ((ENVS.d && ENVS.d.employes) || []).filter(function(e){ return !/^direction$/i.test(String(e.categorie || e.role || "")) && !(e.statut === "Bloqué" && /introuvable|inactif|inactive|parti|départ|depart|supprim/i.test(String(e.raison || ""))); }); }
function envPrets(){ return envVisibles().filter(function(e){ return e.statut === "Prêt"; }); }
// Cases à cocher: décochées par défaut (rien ne part sans choix). Clé = nom. Seules les lignes Prêt sont cochables.
function envCoches(){ ENVS.coches = ENVS.coches || {}; return envPrets().filter(function(e){ return ENVS.coches[e.nom]; }); }
// Verrou des confirmations annuelles : l'envoi reste verrouillé tant que l'Échelle salariale, la position et l'assurance ne sont pas toutes confirmées (page Position et assurance). Retourne ce qui manque.
function envManque(){
  if(typeof PA === "undefined" || !PA.d){ return ENVS.paErr ? ["confirmations illisibles"] : ["vérification en cours"]; }
  var m = [], d = PA.d; if(!(d.otpad && d.otpad.confirme)) m.push("Échelle salariale"); if(!(d.position && d.position.confirme)) m.push("position"); if(!(d.assurance && d.assurance.confirme)) m.push("assurance");
  return m;
}
function envListe(){
  var d = ENVS.d, manque = envManque(), L = envVisibles(), ferme = !!(d.fenetre && d.fenetre.ouverte === false) || manque.length > 0, prets = ferme ? [] : envCoches(), tousPrets = envPrets(), essai = d.mode !== "reel";
  var h = '';
  // Note du verrou (message de la fenêtre du pont): encadré au contour vert, à droite, en face de « Employés »; le texte n'inclut jamais « Envoi salarial ».
  var note = d.fenetre ? String(d.fenetre.message || (ferme ? "Verrouillé" : "")).replace(/^\s*envoi salarial\s*[:\-–·]?\s*/i, "").trim() : "";
  if(manque.length) note = "Verrouillé : " + manque.join(", ") + " à confirmer";
  if(note) note = note.charAt(0).toUpperCase() + note.slice(1);
  if(d.annee) h += '<span class="lbl">Année</span><div class="bx" style="border-color:transparent;padding-left:0">'+envE(d.annee)+'</div>';
  h += '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px"><div><span class="lbl">Employés</span>';
  if(tousPrets.length && ferme) h += '<div style="margin:0 0 8px;opacity:.35"><span style="text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:4px">Tout cocher</span></div>';
  else if(tousPrets.length) h += '<div style="margin:0 0 8px"><a href="#" id="envtout" style="color:#000000;text-decoration:underline;text-decoration-color:var(--vert);text-decoration-thickness:3px;text-underline-offset:4px">'+(prets.length === tousPrets.length ? "Tout décocher" : "Tout cocher")+'</a></div>';
  h += '</div>' + (note ? '<div style="flex:0 1 58%;box-sizing:border-box;border:3px solid #3BEC65;padding:10px 14px;margin:0 0 8px;text-align:right;font-weight:700;font-size:15px;line-height:1.25;color:#000">'+envE(note)+'</div>' : '') + '</div>';
  if(!L.length) h += '<div class="bandeau">Aucun employé à envoyer</div>';
  h += L.map(function(e, i){
    var sous = (e.statut === "Bloqué" || /^non concern/i.test(String(e.statut))) ? (e.raison || "") : e.statut === "Envoyé" ? (e.essaiEnvoye ? "essai envoyé" : "envoyé") + (e.raison ? " · " + e.raison : "") : [envFr(e.salaire), e.position != null && e.position !== "" ? "position " + e.position + " %" : ""].filter(Boolean).join(" · ");
    var cochable = e.statut === "Prêt" && !ferme, grise = e.statut === "Prêt" && ferme, coche = cochable && ENVS.coches && ENVS.coches[e.nom];
    var cas = cochable ? '<span class="envcase" data-i="'+i+'" role="checkbox" aria-checked="'+(coche ? "true" : "false")+'" style="flex:none;width:34px;height:34px;box-sizing:border-box;border:2px solid #000000;background:'+(coche ? "var(--vert)" : "transparent")+';display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1;cursor:pointer">'+(coche ? "✓" : "")+'</span>' : grise ? '<span style="flex:none;width:34px;height:34px;box-sizing:border-box;border:2px solid #000000;opacity:.35"></span>' : '';
    return '<div class="envl" data-i="'+i+'" style="display:flex;justify-content:space-between;align-items:center;gap:10px;background:rgba(189,201,178,.5);padding:12px 14px;margin:0 0 10px;cursor:pointer"><span style="min-width:0;flex:1"><span style="display:block;font-size:16px">'+envE(nomTitre(e.nom))+'</span><span style="display:block;font-size:12px;color:#6E6350;overflow-wrap:anywhere">'+envE(sous)+(e.erreur ? " · " + envE(e.erreur) : "")+'</span>'+envEcarts(e)+'<a href="#" class="envapc" data-i="'+i+'" style="display:inline-block;margin-top:6px;font-size:12px;color:#000000;text-decoration:underline;text-decoration-color:var(--vert);text-decoration-thickness:2px;text-underline-offset:3px">Aperçu</a></span>'+'<span style="display:flex;align-items:center;gap:10px;flex:none">'+envPuce(e.statut, e.libelle)+cas+'</span></div>';
  }).join("");
  h += '<div class="bandeau" id="envmsg" style="display:none;margin-top:10px"></div>';
  h += '<button type="button" class="bouton" id="envsend" style="height:46px;padding:0;margin-top:14px"'+(prets.length ? "" : " disabled")+'>Envoyer '+prets.length+' courriel'+(prets.length > 1 ? "s" : "")+'</button>';
  document.getElementById("envapp").innerHTML = h;
  envMessage(ENVS.msg);
  Array.prototype.forEach.call(document.querySelectorAll(".envl"), function(x){ x.onclick = function(){ var e = L[+x.getAttribute("data-i")]; if(!e || e.statut !== "Prêt" || ferme) return; ENVS.coches = ENVS.coches || {}; ENVS.coches[e.nom] = !ENVS.coches[e.nom]; envListe(); }; });   // un appui sur la ligne coche ou décoche seulement: jamais d'aperçu depuis cet écran
  Array.prototype.forEach.call(document.querySelectorAll(".envcase"), function(x){ x.onclick = function(ev){ ev.stopPropagation(); var e = L[+x.getAttribute("data-i")]; ENVS.coches = ENVS.coches || {}; ENVS.coches[e.nom] = !ENVS.coches[e.nom]; envListe(); }; });
  Array.prototype.forEach.call(document.querySelectorAll(".envapc"), function(x){ x.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); envApercu(L[+x.getAttribute("data-i")]); }; });
  var tt = document.getElementById("envtout"); if(tt) tt.onclick = function(ev){ ev.preventDefault(); var tous = prets.length === tousPrets.length; ENVS.coches = {}; if(!tous) tousPrets.forEach(function(e){ ENVS.coches[e.nom] = true; }); envListe(); };
  document.getElementById("envsend").onclick = function(){ if(prets.length) envConfirmer(prets); };
}
// Retour de l'aperçu: la liste réapparaît telle quelle (cases cochées gardées), sans relire le serveur.
function envRetourListe(){
  if(!ENVS.d){ envOuvrir(); return; }
  envPage("Envoi salarial", '<div id="envapp"></div>');
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); envBarreRetirer(); retirerBoutonBas(); responsable(); };
  envListe();
}
function envApercu(e){
  if(!e) return;
  envPage(nomTitre(e.nom), '<div id="envapp"></div>');
  document.getElementById("retour").onclick = function(ev){ ev.preventDefault(); envBarreRetirer(); envRetourListe(); };
  envBarreOuvrir("Préparation de l’aperçu…", 25000, {apresFermer: envRetourListe});
  appelService({action: "env_apercu", session: sessionGardee(), f: {nom: e.nom}}).then(function(r){
    if(!document.getElementById("envapp")) return;
    if(!(r && r.ok && r.r)){ envBarreFin(false, String((r && r.erreur) || "Échec")); return; }
    envBarreRetirer();
    var p = r.r, c = p.controle || {}, ligne = function(t, ok, oui){ return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;background:#BDC9B2;padding:12px 14px;margin:0 0 8px"><span>'+envE(t)+'</span><span style="'+(ok ? "background:var(--vert);color:#000000" : "background:#B8473A;color:#fff")+';font-size:12px;padding:3px 8px">'+envE(ok ? oui : "Écart")+'</span></div>'; };
    var h = '<span class="lbl">Courriel (aperçu)</span><div style="background:#BDC9B2;padding:12px 14px;margin:0 0 8px"><div style="font-size:15px;overflow-wrap:anywhere">Objet : '+envE(p.objet || "")+'</div><div style="font-size:12px;color:#6E6350;margin-top:6px;white-space:pre-wrap;overflow-wrap:anywhere">'+envE(p.corps || "")+'</div></div>';
    h += '<span class="lbl">Pièce jointe</span><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;background:#BDC9B2;padding:12px 14px;margin:0 0 8px"><span style="overflow-wrap:anywhere">'+envE(p.pdfNom || "")+'</span>'+(p.pdfBase64 ? '<button type="button" class="bouton" id="envpdf" style="width:auto;height:46px;padding:0 14px;margin:0">PDF</button>' : "")+'</div>';
    h += '<span class="lbl">Contrôle automatique</span>'+ligne("Courriel = PDF = échelle", !!c.ok, "Conforme")+ligne("Position confirmée", c.positionOk !== false && !!c.ok, "Oui")+ligne("Salaire confirmé", c.salaireOk !== false && !!c.ok, "Oui");
    document.getElementById("envapp").innerHTML = h;
    var b = document.getElementById("envpdf");
    if(b) b.onclick = function(){ try { var bin = atob(p.pdfBase64), u = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); var url = URL.createObjectURL(new Blob([u], {type: "application/pdf"})); window.open(url, "_blank"); } catch(x){} };
  }).catch(function(){ envBarreFin(false, "Réseau indisponible"); });
}
function envConfirmer(prets){
  var essai = !(ENVS.d && ENVS.d.mode === "reel"), n = prets.length, z = document.getElementById("envapp"); if(!z) return;
  var noms = prets.map(function(e){ return nomTitre(e.nom); });
  if(document.getElementById("envdlg")) return;   // un seul appui, une seule fenêtre
  // Même composant que « Envoyer le contrat via DocuSign ? » (superposition, .popc, Oui, envoyer / Non).
  document.body.insertAdjacentHTML("beforeend", '<div class="pop" id="envdlg"><div class="popc"><div class="popt">Envoyer '+n+' courriel'+(n > 1 ? "s" : "")+' ?</div><div class="popd"><div>'+(essai ? "Cet envoi ira à la Direction seulement" : "Chaque employé reçoit son courriel")+'</div><div>Courriel et PDF Rémunération globale</div>'+(essai ? "" : "<div>Cet envoi ne se reprend pas</div>")+'</div><div class="aeact"><button type="button" class="bouton" id="envoui">Oui, envoyer</button><button type="button" class="bouton lg" id="envnon">Non</button></div></div></div>');
  document.getElementById("envnon").onclick = function(){ var d = document.getElementById("envdlg"); if(d) d.remove(); };
  document.getElementById("envoui").onclick = function(){
    if(ENVS.occupe) return; ENVS.occupe = true;
    var dlg0 = document.getElementById("envdlg"); if(dlg0) dlg0.remove();
    // Envoi par lots de 2: l'écran avance lot par lot avec le compte, et ne propose JAMAIS de refaire l'envoi entier (risque de doublons en mode réel).
    var mode = essai ? "essai" : "reel", lots = [], i0 = 0, faits = 0;
    for(; i0 < prets.length; i0 += 2) lots.push(prets.slice(i0, i0 + 2));
    envBarreOuvrir("Envoi en cours · 0 sur " + n, 60000, {apresFermer: envOuvrir});
    function progres(){ envBarreP(Math.round(faits / n * 92), "Envoi en cours · " + faits + " sur " + n); }
    function arret(raison){
      ENVS.occupe = false;
      // L'état réel est relu depuis le serveur: les courriels déjà partis y sont marqués.
      appelService({action: "env_liste", session: sessionGardee(), }).then(function(r){ if(r && r.ok && r.r) ENVS.d = r.r; }).catch(function(){}).then(function(){
        envBarreFin(false, "Envoi interrompu après " + faits + " sur " + n + " · " + raison.toLowerCase() + " · Ne refaites pas l’envoi : vérifiez les statuts dans la liste et envoyez seulement ceux qui sont encore confirmés");
        if(ENVB) ENVB.apresFermer = function(){ if(document.getElementById("envapp")) envListe(); }; });
    }
    function suite(k){
      if(k >= lots.length){ ENVS.occupe = false; envBarreFin(true, (essai ? "Essai envoyé à la Direction · " : "Envoyé · ") + n + " courriel" + (n > 1 ? "s" : "")); return; }
      progres();
      appelService({action: "env_envoyer", session: sessionGardee(), f: {noms: lots[k].map(function(e){ return e.nom; }), nombre: lots[k].length}}).then(function(r){
        if(r && r.ok){ faits += lots[k].length; suite(k + 1); }
        else arret(String((r && r.erreur) || "RÉESSAYEZ").toUpperCase());
      }).catch(function(){ arret("RÉPONSE NON REÇUE"); });
    }
    suite(0);
  };
}
