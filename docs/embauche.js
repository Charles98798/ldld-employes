// Positionnement embauche (Direction, Charles et Ly): reprend la page web du classeur (?v=embauche), même calcul, même vérification.
// Tout s'affiche et se calcule instantanément dans l'application (formules identiques à la page web); la vérification officielle,
// l'enregistrement et l'envoi du courriel se font en arrière-plan par le pont du classeur, qui refuse tout écart.
var EMB = {D: null, AV: null, erreur: "", enCours: false, S: null, surD: null};
var EMB_COLS = [76, 79, 82, 85, 88, 91, 94, 97, 100];
var EMB_ELEM = ["Connaissances et compétences techniques", "Autonomie et résolution de problèmes", "Qualité et constance du travail", "Valeurs humaines"];
function embVierge(){ return {page: 1, annee: "", prenom: "", famille: "", adresse: "", ville: "", cp: "", naissance: "", poste: "", exp: "", dip: "", hors: "", heures: "", pos: null, posEdit: false}; }
// Préchargement: les données arrivent pendant que vous êtes encore sur la page Direction.
function embPrecharger(){
  if(EMB.D || EMB.enCours) return; EMB.enCours = true; EMB.erreur = "";
  appelService({action: "embauche_donnees", session: sessionGardee()}).then(function(r){
    EMB.enCours = false;
    if(r && r.ok && r.r){ EMB.D = r.r; if(EMB.surD) EMB.surD(); embAvantages(); }
    else { EMB.erreur = (r && r.erreur) || "Données indisponibles."; if(EMB.surD) EMB.surD(); }
  }).catch(function(){ EMB.enCours = false; EMB.erreur = "Réseau indisponible."; if(EMB.surD) EMB.surD(); });
}
function embAvantages(){
  if(EMB.AV || EMB.avEnCours) return; EMB.avEnCours = true;
  appelService({action: "embauche_avantages", session: sessionGardee()}).then(function(r){
    EMB.avEnCours = false; if(r && r.ok){ EMB.AV = r.r || {}; if(EMB.surD) EMB.surD(); }
  }).catch(function(){ EMB.avEnCours = false; });
}
// ---- Calcul: copie exacte de la page web du classeur ----
function embHorsB(a){ return a >= 20 ? 6 : a >= 10 ? 4 : a >= 5 ? 2 : 0; }
function embTaux(E, poste, p){ var t = E.cats[poste]; if(p <= E.echelons[0]) return t[0]; if(p >= E.echelons[8]) return t[8];
  var i = Math.min(7, Math.floor((p - E.echelons[0]) / 3)); return t[i] + (t[i+1] - t[i]) * (p - E.echelons[i]) / (E.echelons[i+1] - E.echelons[i]); }
function embCalcul(E, S){
  var poste = S.poste, e = +S.exp, d = +S.dip, h = +S.hors, hb = embHorsB(h), el = [17, 17, 17, 17], base = el[0] + el[1] + el[2] + el[3],
    brut = e + d + hb, plaf = Math.min(20, brut), dep = Math.max(76, base + plaf), mx = Math.min(100, dep + 8);
  return {poste: poste, e: e, d: d, h: h, hb: hb, el: el, base: base, brut: brut, plaf: plaf, dep: dep, mx: mx,
    td: Math.round(embTaux(E, poste, dep) * 100 + 1e-7) / 100, tm: Math.round(embTaux(E, poste, mx) * 100 + 1e-7) / 100};
}
function embRemun(td, h, av){ function r2(v){ return Math.round(v * 100 + 1e-7) / 100; }
  var base = td * h * 46, vac = td * h * av.semainesVacances, fer = td * (h / 5) * av.joursFeries, mal = td * (h / 5) * av.joursMaladie, cong = vac + fer + mal,
    autres = av.assurance + av.otpadq, boni = av.boni;
  return {base: r2(base), conges: r2(cong), boni: r2(boni), autres: r2(autres), otpadq: r2(av.otpadq), assurance: r2(av.assurance), total: r2(base + cong + autres + boni)}; }
function embFmt(v){ return v.toFixed(2).replace(".", ","); }
function embMoney(v){ return embFmt(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " $"; }
function embSansObj(poste){ return /^(administratif|gestionnaire)/.test(String(poste || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase()); }
function embEchelle(S){ if(!EMB.D || S.annee === "") return null; return EMB.D.echelles.filter(function(e){ return String(e.annee) === String(S.annee); })[0] || null; }
// Résultat complet (position décidée en rencontre comprise), ou null tant que les 4 choix du poste manquent.
function embResultat(S){
  var E = embEchelle(S); if(!E || ["poste", "exp", "dip", "hors"].some(function(k){ return S[k] === ""; })) return null;
  var r = embCalcul(E, S); r.bareme = r.dep; r.ent = false;
  if(S.posEdit && S.pos != null){ var P = +S.pos;
    if(P !== r.dep && P >= E.echelons[0] && P <= E.echelons[8] && Math.floor(P) === P){ r.ent = true; r.dep = P; r.mx = Math.max(P, r.mx);
      r.td = Math.round(embTaux(E, S.poste, P) * 100 + 1e-7) / 100; r.tm = Math.round(embTaux(E, S.poste, r.mx) * 100 + 1e-7) / 100; } }
  r.E = E; return r;
}
function embRempli(S){ return ["annee", "prenom", "famille", "adresse", "ville", "cp", "naissance", "poste", "exp", "dip", "hors", "heures"].every(function(k){ return String(S[k]).trim() !== ""; }); }
function embChamps(S, r, h, m){ return {prenom: S.prenom, famille: S.famille, adresse: S.adresse, ville: S.ville, codePostal: S.cp, naissance: S.naissance,
  annee: +S.annee, poste: r.poste, exp: r.e, dip: r.d, hors: r.h, e: r.el, dep: r.dep, taux: r.td, heures: h, total: m.a.total, total8: m.b.total}; }
function embRemuns(S, r){
  var av = EMB.AV && EMB.AV[r.poste], h = S.heures === "" ? null : +S.heures; if(!av || h === null) return null;
  return {a: embRemun(r.td, h, av), b: embRemun(r.tm, h, av), h: h};
}

// ---- Pages ----
function embauchePos(){
  if(!EMB.S) EMB.S = embVierge();
  EMB.surD = function(){ if(EMB.page && document.getElementById("pe")) embDessiner(); };
  EMB.page = true;
  app.innerHTML = '<div class="page pe" style="padding-bottom:calc(170px + env(safe-area-inset-bottom,0px))"><a class="retour" href="#" id="retour">Retour</a><div id="pe"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); embSortir(); };
  embPrecharger(); embAvantages(); embDessiner();
}
function embSortir(){ EMB.page = false; EMB.surD = null; retirerBoutonBas(); responsable(); }
function embDessiner(){
  var z = document.getElementById("pe"); if(!z) return; var S = EMB.S;
  if(!EMB.D){ retirerBoutonBas(); z.innerHTML = '<h1>Position d’embauche</h1><div class="bandeau">'+(EMB.erreur ? "▪ "+esc(EMB.erreur.toUpperCase())+" · TOUCHEZ POUR RÉESSAYER" : "▪ UN INSTANT")+'</div>';
    if(EMB.erreur) z.querySelector(".bandeau").onclick = function(){ EMB.erreur = ""; EMB.D = null; embPrecharger(); embDessiner(); }; return; }
  if(S.page === 1) embPage1(z); else if(S.page === 2) embPage2(z); else embPage3(z);
}
function embOpts(liste, val, ph){ return '<option value="">'+esc(ph)+'</option>'+liste.map(function(o){ return '<option value="'+esc(o[0])+'"'+(String(o[0]) === String(val) ? " selected" : "")+'>'+esc(o[1])+'</option>'; }).join(""); }
function embPage1(z){
  var S = EMB.S, D = EMB.D, ans = D.echelles.map(function(e){ return [e.annee, e.annee+(e.actuelle ? " (actuelle)" : "")]; }),
    postes = Object.keys(D.echelles[0].cats).map(function(k){ return [k, k]; }), ann = [], i;
  for(i = 0; i <= 40; i++) ann.push([i, i+(i > 1 ? " ans" : " an")]);
  var exp = ann.map(function(o){ return [o[0], o[1]+" (+ "+o[0]+" %)"]; }), hors = ann.map(function(o){ return [o[0], o[1]+" (+ "+embHorsB(o[0])+" %)"]; }),
    dips = [[0, "Aucun (+ 0 %)"], [2, "DEC (+ 2 %)"], [4, "Baccalauréat (+ 4 %)"]], hres = (D.heures || []).map(function(v){ return [v, String(v).replace(".", ",")+" h"]; });
  function inp(k, ph, max, type){ return '<span class="lbl">'+esc(ph)+'</span><input class="bx pk'+(String(S[k]).trim() ? "" : " rose")+'" data-k="'+k+'" placeholder="'+esc(ph)+'" maxlength="'+max+'" value="'+esc(S[k])+'" autocomplete="off"'+(type ? ' data-t="'+type+'"' : "")+'>'; }
  function sel(k, ph, liste, vide){ return '<span class="lbl">'+esc(ph)+'</span><select class="bx pk'+(String(S[k]) !== "" ? "" : " rose")+'" data-k="'+k+'">'+embOpts(liste, S[k], vide || ph)+'</select>'; }
  z.innerHTML = '<h1>Position d’embauche</h1><div class="lab">01 · Le candidat</div>'+sel("annee", "Échelle · année", ans, String(new Date().getFullYear()))+
    '<div style="display:flex;gap:8px"><div style="flex:1">'+inp("prenom", "Prénom", 40)+'</div><div style="flex:1">'+inp("famille", "Nom", 40)+'</div></div>'+inp("adresse", "Adresse", 80)+
    '<div style="display:flex;gap:8px"><div style="flex:1">'+inp("ville", "Ville", 40)+'</div><div style="flex:1">'+inp("cp", "Code postal", 7)+'</div></div>'+inp("naissance", "Date de naissance", 10, "date")+
    '<div class="lab">02 · Le poste</div>'+sel("poste", "Poste", postes)+sel("exp", "Expérience dans le métier", exp)+sel("dip", "Diplôme relié", dips)+sel("hors", "Expérience hors poste", hors)+sel("heures", "Heures par semaine", hres);
  function maj(){ boutonBas("Suivant", embRempli(S), function(){ S.page = 2; embDessiner(); window.scrollTo(0, 0); }); }
  Array.prototype.forEach.call(z.querySelectorAll(".pk"), function(el){
    var k = el.getAttribute("data-k"), t = el.getAttribute("data-t");
    if(t === "date"){ el.onfocus = function(){ el.type = "date"; }; el.onblur = function(){ if(!el.value) el.type = "text"; }; if(S[k]) el.type = "date"; }
    function lire(){ S[k] = el.value; if(["annee", "poste", "exp", "dip", "hors"].indexOf(k) >= 0) S.posEdit = false;
      el.className = "bx pk"+(String(el.value).trim() !== "" ? "" : " rose"); maj(); }
    el.oninput = lire; el.onchange = lire;
  });
  maj();
}
function embPage2(z){
  var S = EMB.S, r = embResultat(S), E = embEchelle(S);
  if(!r){ S.page = 1; return embDessiner(); }
  var opts = ""; for(var q = E.echelons[0]; q <= E.echelons[8]; q++) opts += '<option value="'+q+'"'+(q === r.dep ? " selected" : "")+'>'+q+'</option>';
  var sans = embSansObj(r.poste), rows = [["Expérience", r.plaf+" / 20"]];
  EMB_ELEM.forEach(function(n, i){ var v = i < 3 ? (sans ? [18, 20] : [13, 15]) : (sans ? [14, 15] : [13, 15]); rows.push([n, v[0]+" / "+v[1]]); });
  if(!sans) rows.push(["Objectifs (tableau de bord)", "16 / 20"]);
  var tot = r.base + r.plaf;
  z.innerHTML = '<h1>Position d’embauche</h1><div class="etiq">'+esc(S.prenom.trim()+" "+S.famille.trim())+'</div><div class="rc">'+
    '<div><span class="lbl" style="margin:0">'+(r.ent ? "Position décidée en rencontre" : "Position de départ")+'</span><div class="pev"><select id="ppos" aria-label="Position de départ">'+opts+'</select><small>%</small></div>'+
      '<div class="rp">'+(r.ent ? '<span class="ent">Entente en rencontre</span> barème : '+r.bareme+' % <a href="#" id="rb">remettre le barème</a>' : (tot < 76 ? "relevé au plancher de "+E.echelons[0]+" %" : "échelle de "+E.echelons[0]+" % à "+E.echelons[8]+" %"))+'</div></div>'+
    '<div><span class="lbl" style="margin:0">Taux horaire départ</span><div class="pev">'+embFmt(r.td)+' <small>$ / h</small></div><div class="rp">'+esc(r.poste)+' · échelle '+esc(E.annee)+(r.ent ? " · calculé d’après la position" : "")+'</div></div>'+
    '<div><span class="lbl" style="margin:0">Avancement possible</span><div class="pev">'+(r.mx > r.dep ? r.mx+' <small>%</small>' : "—")+'</div><div class="rp">'+(r.mx > r.dep ? "≈ "+embFmt(r.tm)+" $ / h · jusqu’à + 8 %" : (r.dep >= E.echelons[8] ? "déjà au sommet" : "le départ atteint ou dépasse le point d’arrivée"))+'</div></div></div>'+
    '<div class="lab">02 · Comment le départ est calculé</div><div class="det">'+rows.map(function(x){ return '<div><span>'+esc(x[0])+'</span><span>'+x[1]+'</span></div>'; }).join("")+'<div class="t"><span>Total</span><span>'+tot+' %</span></div>'+
    (tot < 76 ? '<div class="t"><span>Relevé au plancher de l’échelle</span><span>'+E.echelons[0]+' %</span></div>' : "")+(r.ent ? '<div class="t"><span>Position décidée en rencontre</span><span>'+r.dep+' %</span></div>' : "")+'</div>';
  document.getElementById("ppos").onchange = function(){ S.pos = +this.value; S.posEdit = true; embDessiner(); };
  var rb = document.getElementById("rb"); if(rb) rb.onclick = function(e){ e.preventDefault(); S.posEdit = false; S.pos = null; embDessiner(); };
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); S.page = 1; embDessiner(); };
  boutonBas("Suivant", true, function(){ S.page = 3; embDessiner(); window.scrollTo(0, 0); });
}
function embPage3(z){
  var S = EMB.S, r = embResultat(S), E = embEchelle(S);
  if(!r){ S.page = 1; return embDessiner(); }
  var t = E.cats[r.poste], x = function(p){ return Math.max(0, Math.min(100, (p - E.echelons[0]) / (E.echelons[8] - E.echelons[0]) * 100))+"%"; };
  var m = embRemuns(S, r), av = EMB.AV && EMB.AV[r.poste];
  var ech = '<div class="pel"><div class="rail"></div>'+(r.mx > r.dep ? '<div class="plage" style="left:'+x(r.dep)+';width:calc('+x(r.mx)+' - '+x(r.dep)+')"></div>' : "")+
    '<div class="nv" style="left:'+x(r.dep)+'"></div>'+(r.mx > r.dep ? '<div class="mx" style="left:'+x(r.mx)+'"></div>' : "")+'</div><div class="qa">'+
    '<div><div class="p">Bas de l’échelle</div><div class="t">'+E.echelons[0]+' %</div>'+embFmt(t[0])+' $/h</div>'+
    '<div class="ici"><div class="p">Votre position</div><div class="t">'+r.dep+' %</div>'+embFmt(embTaux(E, r.poste, r.dep))+' $/h</div>'+
    '<div><div class="p">Avancement possible</div><div class="t">'+(r.mx > r.dep ? r.mx+" %" : "—")+'</div>'+(r.mx > r.dep ? embFmt(embTaux(E, r.poste, r.mx))+" $/h" : "")+'</div>'+
    '<div><div class="p">Sommet de l’échelle</div><div class="t">'+E.echelons[8]+' %</div>'+embFmt(t[8])+' $/h</div></div>';
  var dash = "—", L = ["Salaire horaire retenu", "Heures de travail (par semaine)", "Salaire de base annuel (46 semaines)", "Congés rémunérés (vacances, jours fériés, maladie)", "Boni annuel maximum"], tab;
  if(!m){ tab = L.concat(["Cotisation OTPADQ", "Assurances 50 % de la prime (montant approximatif - à déterminer)"]).map(function(l){ return '<tr><td>'+l+'</td><td>'+dash+'</td><td>'+dash+'</td></tr>'; }).join("")+'<tr class="t"><td>Total de la rémunération globale</td><td>'+dash+'</td><td>'+dash+'</td></tr>'; }
  else { var a = m.a, b = m.b, hh = String(m.h).replace(".", ",");
    tab = '<tr><td>'+L[0]+'</td><td>'+embMoney(r.td)+'</td><td>'+embMoney(r.tm)+'</td></tr><tr><td>'+L[1]+'</td><td>'+hh+'</td><td>'+hh+'</td></tr><tr><td>'+L[2]+'</td><td>'+embMoney(a.base)+'</td><td>'+embMoney(b.base)+'</td></tr>'+
      '<tr><td>'+L[3]+'</td><td>'+embMoney(a.conges)+'</td><td>'+embMoney(b.conges)+'</td></tr><tr><td>'+L[4]+'</td><td>'+embMoney(a.boni)+'</td><td>'+embMoney(b.boni)+'</td></tr>'+
      (a.otpadq > 0 || b.otpadq > 0 ? '<tr><td>Cotisation OTPADQ</td><td>'+embMoney(a.otpadq)+'</td><td>'+embMoney(b.otpadq)+'</td></tr>' : "")+
      (a.assurance > 0 || b.assurance > 0 ? '<tr><td>Assurances 50 % de la prime (montant approximatif - à déterminer)</td><td>'+embMoney(a.assurance)+'</td><td>'+embMoney(b.assurance)+'</td></tr>' : "")+
      '<tr class="t"><td>Total de la rémunération globale</td><td>'+embMoney(a.total)+'</td><td>'+embMoney(b.total)+'</td></tr>'; }
  var note = !m ? (EMB.AV ? (av ? "" : "Aucun employé actif dans ce poste : avantages introuvables, rémunération globale non calculée.") : "Lecture des avantages du poste en cours…") : "";
  z.innerHTML = '<h1>Position d’embauche</h1><div class="etiq">'+esc(S.prenom.trim()+" "+S.famille.trim())+'</div><div class="lab">03 · Position dans l’échelle</div>'+ech+'<div class="lab">04 · Rémunération globale</div>'+
    '<table class="tb"><colgroup><col style="width:40%"><col style="width:30%"><col style="width:30%"></colgroup><tr class="th"><td></td><td style="text-align:right">Départ '+r.dep+' %</td><td style="text-align:right">Avancement '+(r.mx > r.dep ? r.mx : r.dep)+' %</td></tr>'+tab+'</table>'+(note ? '<div class="bandeau">▪ '+esc(note.toUpperCase())+'</div>' : "")+
    '<div id="pmsg"></div><div class="pbts" id="pbts"><button type="button" class="bouton" id="peev" style="margin:0"'+(m ? "" : " disabled")+'>Enregistrer et envoyer</button><button type="button" class="bouton" id="penr" style="margin:0;background:transparent;color:var(--tx);border:1.5px solid var(--tx)"'+(m ? "" : " disabled")+'>Enregistrer</button></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); S.page = 2; embDessiner(); };
  retirerBoutonBas();
  document.getElementById("peev").onclick = function(){ embFenetreCourriel(r, m); };
  document.getElementById("penr").onclick = function(){ embLancer(r, m, ""); };
}
// Fenêtre « Enregistrer et envoyer »: une seule case de courriel.
function embFenetreCourriel(r, m){
  var S = EMB.S, f = document.createElement("div");
  f.style.cssText = "position:fixed;inset:0;background:rgba(15,20,32,.55);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50";
  f.innerHTML = '<div style="background:#e3dfd3;color:#111;border:1.5px solid #111;padding:20px;width:100%;max-width:340px"><div style="font-size:15px;letter-spacing:.14em;text-transform:uppercase">Envoyer par courriel</div>'+
    '<div class="etq" style="margin:4px 0 8px">'+esc(S.prenom.trim()+" "+S.famille.trim())+' · départ '+r.dep+' % · '+embFmt(r.td)+' $/h</div>'+
    '<span class="lbl">Courriel du candidat</span><input class="bx rose" id="pcm" placeholder="Courriel du candidat" inputmode="email" autocomplete="off" spellcheck="false" maxlength="120"><div class="aeact" style="margin:12px 0 0"><button type="button" class="bouton" id="pcn" style="margin:0;background:transparent;color:#111;border:1.5px solid #111">Annuler</button><button type="button" class="bouton" id="pco" style="margin:0" disabled>Envoyer</button></div></div>';
  document.body.appendChild(f);
  var c = document.getElementById("pcm"), ok = function(){ return /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/.test(c.value.trim()); };
  c.oninput = function(){ c.className = "bx"+(c.value.trim() ? "" : " rose"); document.getElementById("pco").disabled = !ok(); };
  document.getElementById("pcn").onclick = function(){ f.remove(); };
  document.getElementById("pco").onclick = function(){ if(!ok()) return; var a = c.value.trim().toLowerCase(); f.remove(); embLancer(r, m, a); };
  c.focus();
}
// Enregistrement / envoi en arrière-plan: même bandeau que l'envoi du contrat (neTache); Retour reste actif et ramène à l'accueil sans interrompre la tâche.
function embLancer(r, m, courriel){
  var S = EMB.S, envoi = !!courriel, z = document.getElementById("pmsg"), bts = document.getElementById("pbts"); if(!z || !m) return;
  retirerBoutonBas(); bts.style.display = "none"; z.innerHTML = '<div id="gebar"></div>';
  var rt = document.getElementById("retour"); if(rt){ rt.style.opacity = ""; rt.style.pointerEvents = ""; rt.onclick = function(e){ e.preventDefault(); embSortir(); }; }
  var h = m.h, champs = embChamps(S, r, h, m), nom = (S.prenom.trim()+" "+S.famille.trim()).trim();
  neTache({nom: nom, duree: 12000, reste: true,
    lib: envoi ? {cours: "Enregistrement et envoi en cours", ok: "Fiche préparée et courriel envoyé", non: "Non enregistré · rien n’a été envoyé"} : {cours: "Enregistrement en cours", ok: "Brouillon préparé", non: "Non enregistré"},
    reseau: envoi ? "Réponse non reçue, vérifiez avant de réessayer" : "Réseau, réessayez",
    run: function(){ return appelService(envoi ? {action: "embauche_envoyer", session: sessionGardee(), f: champs, courrielCandidat: courriel} : {action: "embauche_enregistrer", session: sessionGardee(), f: champs}); },
    suite: function(res){ var o = (res && res.r) || {}; return o.dep ? "départ "+o.dep+" % · "+embFmt(o.taux)+" $/h" : ""; },
    fin: function(E){
      if(E.etat === "ok"){ setTimeout(function(){ if(EMB.page && document.getElementById("gebar")){ EMB.S = null; embSortir(); } }, 2200); }
      else if(document.getElementById("pbts")) embRetablir(r, m);
    }});
}
function embRetablir(r, m){
  var bts = document.getElementById("pbts"); if(bts) bts.style.display = "";
  var v = document.getElementById("peev"); if(v) v.onclick = function(){ embFenetreCourriel(r, m); };
  var e = document.getElementById("penr"); if(e) e.onclick = function(){ embLancer(r, m, ""); };
}
