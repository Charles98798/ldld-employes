// Inventaire (tous les employés). DONNÉES FICTIVES POUR ESSAI: tant que la vue de Michel (trak.app_inventaire) et sa fonction d'écriture n'existent pas,
// la liste vient de INV_FICTIF et AUCUNE écriture réelle n'est faite. Pour brancher le vrai: (1) remplacer invLire() par l'appel au Service (lecture seule, vue SQL),
// (2) mettre INV_ECRITURE = true et compléter invEcrire() (point unique pour « déduire » et « commander »). Rien d'autre à changer.
var INV_COMPTER = true;     // comptage seul actif (déduire, commander, réception encore désactivés)
var INV_COMMANDER = false;  // « Commander le produit » reste désactivé jusqu'à la décision de Charles sur le courriel (Michel recommandé)
var INV_ECRITURE = true;    // déduire/commander: désactivés (message clair) jusqu'à la confirmation de Michel; mettre true ensuite
var INV_PHASE2 = true;      // onglets Gestion des stocks et Réception visibles (Gestionnaires, Direction), mais actions désactivées avec message tant que INV_ECRITURE est false   // désactivé en attendant la fonction d'écriture de Michel
var INV_FICTIF = [
  {id: "f01", description: "ACRYLIQUE VITA DENTINE A1", categorie: "Acrylique", fournisseur: "VIDENT", unite: "BOÎTE", par: 3, stock: 4, minimum: 1, mode: "deduire"},
  {id: "f02", description: "ACRYLIQUE VITA DENTINE A2", categorie: "Acrylique", fournisseur: "VIDENT", unite: "BOÎTE", par: 3, stock: 2, minimum: 1, mode: "deduire"},
  {id: "f03", description: "ACRYLIQUE VITA DENTINE A3", categorie: "Acrylique", fournisseur: "VIDENT", unite: "BOÎTE", par: 3, stock: 3, minimum: 1, mode: "deduire"},
  {id: "f04", description: "ACRYLIQUE VITA DENTINE A4", categorie: "Acrylique", fournisseur: "VIDENT", unite: "BOÎTE", par: 3, stock: 1, minimum: 1, mode: "deduire"},
  {id: "f05", description: "ACÉTAL 25MM LARGE - A2", categorie: "Fixe", fournisseur: "DISQUES PLUS", unite: "DISQUE", par: 1, stock: 12, minimum: 4, mode: "deduire"},
  {id: "f06", description: "ACÉTAL 20MM MINCE - B1", categorie: "Fixe", fournisseur: "DISQUES PLUS", unite: "DISQUE", par: 1, stock: 6, minimum: 3, mode: "deduire"},
  {id: "f07", description: "FRAISE CARBURE 2MM", categorie: "Pièce", fournisseur: "OUTILPRO", unite: "UNITÉ", par: 1, stock: 8, minimum: 2, mode: "deduire"},
  {id: "f08", description: "PÂTE À POLIR ROSE", categorie: "Pièce", fournisseur: "OUTILPRO", unite: "POT", par: 1, stock: 3, minimum: 1, mode: "commander"},
  {id: "f09", description: "PAPIER D'IMPRIMANTE LETTRE", categorie: "Administration", fournisseur: "BUREAU+", unite: "PAQUET", par: 500, stock: 5, minimum: 2, mode: "deduire"},
  {id: "f10", description: "SAVON À MAINS", categorie: "Entretien ménager", fournisseur: "NETTOPRO", unite: "BOUTEILLE", par: 1, stock: 7, minimum: 2, mode: "deduire"},
  {id: "f11", description: "COURROIE DE POLISSEUSE", categorie: "Pièces de machinerie", fournisseur: "OUTILPRO", unite: "UNITÉ", par: 1, stock: 2, minimum: 1, mode: "deduire"}
];
// Réception (Gestionnaires et Direction): lignes de commande en attente, par fournisseur et date. DONNÉES FICTIVES POUR ESSAI (à remplacer par la vue de Michel trak.app_reception).
var INV_RECEPTION_FICTIF = [
  {id: "r01", fournisseur: "CENTRAL DENTAL", date: "2026-11-12", code: "2019020", description: "POUDRE ABRASIVE RÉSILIENCE", commande: 4, prix: ""},
  {id: "r02", fournisseur: "ZIRKONZAHN", date: "2026-11-12", code: "MEAR9514", description: "MÉTAL COCRONIT / 14", commande: 2, prix: ""},
  {id: "r03", fournisseur: "ZIRKONZAHN", date: "2026-11-12", code: "ZRKC8031A01", description: "ZIRCONE DISPERSIVE 2 - A1 / 16", commande: 2, prix: "390"},
  {id: "r04", fournisseur: "K DENTAL", date: "2026-11-11", code: "00-65037", description: "FILTRE SARATOGA", commande: 2, prix: ""}
];
var INV = {cat: "", debut: "", sorties: [], vue: "sortie", recu: {}, ouv: {}};
function invDroitReception(){ return typeof roleIdx === "function" && roleIdx() >= 1; }
function invMoisFr(iso){ var m = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"], p = String(iso).split("-"); return p.length === 3 ? (+p[2]) + " " + m[+p[1] - 1] + " " + p[0] : String(iso); }
function invOnglets(){
  if(!INV_PHASE2 || !invDroitReception()) return '<div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin:0 0 10px">Retrait</div>';
  var v = INV.vue, t = function(id, on, lib){ return '<button type="button" class="invt'+(on ? " on" : "")+'" id="'+id+'">'+lib+'</button>'; };
  return '<div class="invts">'+t("invtsor", v !== "reception" && v !== "stocks", "Retrait")+t("invtsto", v === "stocks", "Comptage")+t("invtrec", v === "reception", "Réception")+'</div>';
}
function invLierOnglets(){
  var a = document.getElementById("invtsor"), b = document.getElementById("invtrec"), c = document.getElementById("invtsto");
  if(a) a.onclick = function(){ INV.vue = "sortie"; invListe(); };
  if(b) b.onclick = function(){ INV.vue = "reception"; invReception(); };
  if(c) c.onclick = function(){ INV.vue = "stocks"; invListe(); };
}
function invT(t){ return typeof rdMin === "function" ? rdMin(t) : String(t == null ? "" : t); }   // règle: détails en minuscules (affichage)
function invE(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function invNorm(t){ return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim(); }
// Lecture: pour l'instant les produits fictifs (copie, pour que les essais ne modifient pas la liste d'origine).
// INV_LECTURE: quand le Service saura répondre à « inv_lire » (copie Supabase alimentée par les vues Trak de Michel, domaine « inv_lire »), passer à true.
// Forme de la réponse: {ok:true, maj_t, produits:[{id, description, categorie, fournisseur, unite, par, stock, ideal, minimum, mode:"deduire"|"commander"}], reception:[{id, fournisseur, date, code, description, commande, prix}]}. Jamais de prix de vente ni de coût dans produits.
var INV_LECTURE = true;   // vrais produits (Service inv_lire, copie Supabase inventaire_produits)
function invLire(){
  if(!INV_LECTURE) return Promise.resolve({ok: true, fictif: true, produits: INV_FICTIF});
  return appelService({action: "inv_lire", session: sessionGardee()}).then(function(r){
    if(r && r.ok && Array.isArray(r.produits)){ r.produits.forEach(function(p){ p.id = String(p.id); p.stock = Number(p.stock) || 0; invPendAppliquer(p); p.minimum = Number(p.minimum) || 0; p.par = Number(p.par) || 1; }); INV.rec = (r.reception || []).map(function(x){ return Object.assign({}, x, {prix: x.prix == null ? "" : String(x.prix)}); }); }
    return r;
  });
}
// Quantités enregistrées mais pas encore revenues dans la lecture (copie en retard): la liste montre la nouvelle valeur tout de suite; retirée quand la lecture la rattrape (ou après 10 minutes) ou si Gestion refuse.
INV.pend = INV.pend || {};
function invPend(p, v){ INV.pend[p.id] = {v: v, t: Date.now()}; }
function invPendRetirer(p){ delete INV.pend[p.id]; }
function invPendAppliquer(p){ var e = INV.pend[p.id]; if(!e) return; if(Date.now() - e.t > 600000 || p.stock === e.v){ delete INV.pend[p.id]; return; } p.stock = e.v; }
// Point unique d'écriture. Désactivé: aucune écriture réelle, la réponse simule un succès clairement marqué comme essai.
function invUuid(){
  var c = window.crypto; if(c && c.randomUUID) return c.randomUUID();
  var b = new Uint8Array(16); if(c && c.getRandomValues) c.getRandomValues(b); else for(var i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  var h = Array.prototype.map.call(b, function(x){ return ("0" + x.toString(16)).slice(-2); }).join("");
  return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
}
// Écriture: champs à plat, id_demande (uuid v4) généré ici (même demande renvoyée = même id, sans doublon). Le Service répond tout de suite « en_attente »; le résultat de Michel se lit avec inv_demande_lire (toutes les 6 s, 2 minutes au plus).
// Résultat: {ok:true, stock_apres} accepté, {ok:false, erreur} refusé (message_refus de Michel), {ok:true, attente:true} sans réponse dans les 2 minutes (la demande reste enregistrée).
function invEcrire(action, corps){
  if(action === "inv_commander" && !INV_COMMANDER) return Promise.resolve({ok: false, erreur: "Commande non activée"});
  if(!INV_ECRITURE && !(action === "inv_compter" && INV_COMPTER)) return Promise.resolve({ok: true, essai: true});
  var id = (corps && corps.id_demande) || invUuid(), c = {action: action, session: sessionGardee(), id_demande: id};
  Object.keys(corps || {}).forEach(function(k){ c[k === "quantite" && action === "inv_compter" ? "qte_exacte" : k] = corps[k]; });
  var essais = 0;
  function lire(){
    return new Promise(function(ok){ setTimeout(ok, 6000); }).then(function(){ return appelService({action: "inv_demande_lire", session: sessionGardee(), id_demande: id}); }).then(function(d){
      if(d && d.ok === false) return {ok: false, erreur: d.erreur || "Réessayez"};
      if(d && d.statut === "refuse") return {ok: false, erreur: d.message_refus || "Refusé"};
      if(d && d.statut === "accepte") return {ok: true, stock_apres: d.stock_apres};   // tout autre statut ou réponse inattendue: toujours en attente
      if(++essais >= 20) return {ok: true, attente: true};
      return lire();
    }, function(){ if(++essais >= 20) return {ok: true, attente: true}; return lire(); });
  }
  return appelService(c).then(function(r){
    if(!(r && r.ok)) return r;
    if(r.statut === "accepte") return {ok: true, stock_apres: r.stock_apres};
    if(r.statut === "refuse") return {ok: false, erreur: r.message_refus || "Refusé"};
    return lire();
  });
}
// Avis bref sur la page affichée (refus qui arrive après le retour à la liste): disparaît seul.
function invAvis(t){
  var pg = document.querySelector("#app .page, .page"); if(!pg) return;
  var b = document.createElement("div"); b.className = "bandeau"; b.style.margin = "8px 0"; b.textContent = t; pg.insertBefore(b, pg.children[2] || null);
  setTimeout(function(){ if(b.parentNode) b.parentNode.removeChild(b); }, 8000);
}
function invPage(corps){
  app.innerHTML = '<div class="page"><h1>Inventaire</h1><a class="retour" href="#" id="retour">Retour</a>'+corps+'</div>';
}
function invOuvrir(){
  invPage('<div id="invapp"><div class="att" id="invatt"><i></i></div></div>');
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  invLire().then(function(r){
    if(!document.getElementById("invapp")) return;
    if(!(r && r.ok)){ var a = document.getElementById("invatt"); if(a){ a.className = "bandeau"; a.textContent = /non disponible/i.test(String(r && r.erreur)) ? "▪ INVENTAIRE PAS ENCORE ACTIVÉ" : "▪ " + String((r && r.erreur) || "Échec").toUpperCase() + " · TOUCHEZ POUR RÉESSAYER"; a.onclick = invOuvrir; } return; }
    INV.d = r; if(!INV.cat) INV.cat = (r.produits[0] || {}).categorie || ""; if(INV_PHASE2 && INV.vue === "reception" && invDroitReception()) invReception(); else { if(!INV_PHASE2 || (INV.vue === "stocks" && !invDroitReception())) INV.vue = "sortie"; invListe(); }
  }).catch(function(){ var a = document.getElementById("invatt"); if(a){ a.className = "bandeau"; a.textContent = "▪ RÉSEAU INDISPONIBLE · TOUCHEZ POUR RÉESSAYER"; a.onclick = invOuvrir; } });
}
function invMaj(d){
  d = d || INV.d; var t = d && d.maj_t ? new Date(d.maj_t) : null; if(!t || isNaN(t)) return '<div style="font-size:12px;color:#6E6350;margin:0 0 6px">Aucune donnée reçue pour le moment</div>';
  var h = t.toLocaleTimeString("fr-CA", {timeZone: "America/Toronto", hour: "2-digit", minute: "2-digit"}).replace(":", " h "), vieux = Date.now() - t.getTime() > 30 * 60000;
  return '<div style="font-size:12px;color:#6E6350;margin:0 0 6px">'+(vieux ? "Données de " : "Mis à jour à ")+invE(h)+(vieux ? " · elles ne sont peut-être pas à jour" : "")+'</div>';
}
function invChamp(){ return INV.vue === "stocks" && INV.tri === "fournisseur" ? "fournisseur" : "categorie"; }   // Comptage d'inventaire: regrouper par catégorie ou par fournisseur
function invCategories(){ var v = {}, o = [], f = invChamp(); (INV.d.produits || []).forEach(function(p){ if(!v[p[f]]){ v[p[f]] = 1; o.push(p[f]); } }); return o.sort(function(a, b){ return invNorm(a) < invNorm(b) ? -1 : 1; }); }
function invListe(){
  var cats = invCategories(), z = document.getElementById("invapp"); if(!z) return;
  var h = invOnglets() + (INV.d.fictif ? '<div style="font-size:12px;color:#6E6350;margin:0 0 6px">Données fictives pour essai</div>' : invMaj());
  if(INV.vue === "stocks") h += '<div style="font-size:12px;color:#6E6350;margin:0 0 6px">Comptage : choisissez un produit pour inscrire la quantité exacte comptée.</div>';
  var champ = invChamp(); if(!cats.length || cats.indexOf(INV.cat) < 0) INV.cat = cats[0] || "";
  if(INV.vue === "stocks") h += '<div style="display:flex;gap:6px;margin:6px 0 4px"><button type="button" class="bouton invtri" data-t="categorie" style="flex:1;height:46px;padding:0;margin:0;font-size:12px;'+(champ === "categorie" ? "border-bottom:3px solid var(--vert)" : "opacity:.6")+'">Par catégorie</button><button type="button" class="bouton invtri" data-t="fournisseur" style="flex:1;height:46px;padding:0;margin:0;font-size:12px;'+(champ === "fournisseur" ? "border-bottom:3px solid var(--vert)" : "opacity:.6")+'">Par fournisseur</button></div>';
  h += '<span class="lbl">'+(champ === "fournisseur" ? "Fournisseur" : "Catégorie")+'</span><select class="bx" id="invcat">'+cats.map(function(c){ return '<option value="'+invE(c)+'"'+(c === INV.cat ? " selected" : "")+'>'+invE(champ === "fournisseur" ? (invT(c) || "Sans fournisseur") : c)+'</option>'; }).join("")+'</select>';
  h += '<span class="lbl">Commence par</span><input class="bx" id="invdeb" autocomplete="off" placeholder="Premières lettres" value="'+invE(INV.debut)+'">';
  h += '<span class="lbl">Produit</span><div id="invprod"></div>';
  z.innerHTML = h; invLierOnglets();
  Array.prototype.forEach.call(z.querySelectorAll(".invtri"), function(b){ b.onclick = function(){ INV.tri = b.getAttribute("data-t"); INV.cat = ""; invListe(); }; });
  document.getElementById("invcat").onchange = function(){ INV.cat = this.value; invProduits(); };
  document.getElementById("invdeb").oninput = function(){ INV.debut = this.value; invProduits(); };
  invProduits();
}
function invProduits(){
  var z = document.getElementById("invprod"); if(!z) return;
  var d = invNorm(INV.debut), L = (INV.d.produits || []).filter(function(p){ return p[invChamp()] === INV.cat && (!d || invNorm(p.description).indexOf(d) === 0); });
  z.innerHTML = L.length ? L.map(function(p){ return '<div class="invp" data-i="'+invE(p.id)+'" style="display:flex;justify-content:space-between;align-items:center;gap:10px;background:#E3DFD3;padding:14px;margin:0 0 6px;cursor:pointer"><span style="min-width:0;overflow-wrap:anywhere">'+invE(invT(p.description))+'</span><span style="font-size:12px;color:#6E6350">'+invE(p.stock)+'</span></div>'; }).join("") : '<div class="bandeau">▪ AUCUN PRODUIT</div>';
  Array.prototype.forEach.call(z.querySelectorAll(".invp"), function(x){ x.onclick = function(){ var p = (INV.d.produits || []).filter(function(q){ return q.id === x.getAttribute("data-i"); })[0]; if(p){ if(INV.vue === "stocks" && invDroitReception()) invCompte(p); else invProduit(p); } }; });
}
function invProduit(p){
  var qte = 1, deduire = p.mode !== "commander";
  invPage('<div id="invapp"></div>');
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); invOuvrir(); };
  var z = document.getElementById("invapp");
  function dessiner(msg){
    var reste = p.stock - qte, h = (INV.d.fictif ? '<div style="font-size:12px;color:#6E6350;margin:0 0 6px">Données fictives pour essai</div>' : "");
    h += '<span class="lbl">Produit</span><div style="font-size:20px;font-weight:700;overflow-wrap:anywhere">'+invE(invT(p.description))+'</div><div style="font-size:12px;color:#6E6350;margin:4px 0 10px">'+invE(invT(p.categorie))+' · '+invE(invT(p.fournisseur))+(p.par > 1 || p.unite ? ' · '+invE(p.par)+' / '+invE(invT(p.unite)) : "")+'</div>';
    h += '<div style="display:flex;gap:6px"><div style="flex:1;background:#E3DFD3;padding:12px"><div style="font-size:12px;color:#6E6350">En stock</div><div style="font-size:22px;font-weight:700">'+invE(p.stock)+'</div></div><div style="flex:1;background:#E3DFD3;padding:12px"><div style="font-size:12px;color:#6E6350">Minimum</div><div style="font-size:22px;font-weight:700">'+invE(p.minimum)+'</div></div></div>';
    if(deduire){
      h += '<span class="lbl" style="margin-top:18px">Quantité utilisée</span><div style="display:flex;align-items:center;gap:14px"><button type="button" class="bouton" id="invmoins" style="width:46px;height:46px;padding:0;margin:0">−</button><span style="font-size:34px;min-width:50px;text-align:center">'+qte+'</span><button type="button" class="bouton" id="invplus" style="width:46px;height:46px;padding:0;margin:0">+</button><span style="font-size:14px;color:#6E6350;text-transform:uppercase">'+invE(p.unite)+'</span></div>';
      h += '<div style="font-size:13px;color:#6E6350;margin:10px 0">'+(reste < 0 ? "Il n’y en a pas assez en stock." : reste < p.minimum ? "Il restera "+reste+" en stock, sous le minimum de "+invE(p.minimum)+"." : reste === p.minimum ? "Il restera "+reste+" en stock, soit le minimum." : "Il restera "+reste+" en stock.")+'</div>';
      if(p.stock <= 0) h += '<div style="font-size:13px;color:#6E6350;margin:8px 0">Il n’y en a plus en stock.</div>'; else h += '<button type="button" class="bouton" id="invok" style="height:46px;padding:0;margin:8px 0"'+(reste < 0 || qte < 1 || !INV_ECRITURE ? " disabled" : "")+'>Enregistrer</button>';
    } else {
      h += '<div style="font-size:13px;color:#6E6350;margin:18px 0 10px">Ce produit se commande. Aucune quantité n’est déduite du stock.</div><button type="button" class="bouton" id="invcmd" style="height:46px;padding:0;margin:8px 0"'+(INV_ECRITURE && INV_COMMANDER ? "" : " disabled")+'>Commander le produit</button>'+(INV_COMMANDER ? "" : '<div style="font-size:13px;color:#6E6350;margin:8px 0">La commande sera activée bientôt.</div>');
    }
    if(!INV_ECRITURE) h += '<div style="font-size:13px;color:#6E6350;margin:8px 0">Les sorties et les commandes seront activées bientôt. Pour le moment, rien n’est enregistré.</div>';
    h += '<div class="bandeau" id="invmsg" style="'+(msg ? "" : "display:none;")+'margin-top:8px">'+invE(msg || "")+'</div>';
    var rec = INV.sorties.slice(0, 5);
    if(rec.length) h += '<span class="lbl" style="margin-top:18px">Vos dernières sorties</span>'+rec.map(function(s){ return '<div style="display:flex;justify-content:space-between;gap:10px;background:#E3DFD3;padding:12px 14px;margin:0 0 6px"><span style="overflow-wrap:anywhere">'+invE(s.nom)+'</span><span style="font-size:12px;color:#6E6350;white-space:nowrap">'+invE(s.q)+' · '+invE(s.h)+'</span></div>'; }).join("");
    z.innerHTML = h;
    var m = document.getElementById("invmoins"), pl = document.getElementById("invplus");
    if(m) m.onclick = function(){ if(qte > 1){ qte--; dessiner(); } };
    if(pl) pl.onclick = function(){ if(qte < 999){ qte++; dessiner(); } };
    var ok = document.getElementById("invok");
    if(ok) ok.onclick = function(){
      ok.disabled = true; ok.textContent = "Enregistrement…";
      var q0 = qte, t0 = new Date(), ligne = {nom: p.description, q: q0, h: t0.getHours()+" h "+("0"+t0.getMinutes()).slice(-2)}, parti = false, flash = null;
      if(!INV_ECRITURE){ dessiner("▪ ESSAI · RIEN N’EST ENREGISTRÉ DANS GESTION"); return; }
      INV.sorties.unshift(ligne); p.stock = p.stock - q0; invPend(p, p.stock); qte = 1; dessiner("▪ ENREGISTRÉ");   // l'écran se met à jour tout de suite, puis retour à la liste après 1 seconde
      flash = setTimeout(function(){ parti = true; invOuvrir(); }, 1000);
      function annule(t){ clearTimeout(flash); var k = INV.sorties.indexOf(ligne); if(k >= 0) INV.sorties.splice(k, 1); p.stock = p.stock + q0; invPendRetirer(p); if(parti) invAvis(t + " · " + String(p.description || "").toUpperCase()); else dessiner(t); }
      invEcrire("inv_deduire", {id_produit: p.id, quantite: q0}).then(function(r){
        if(!(r && r.ok)) annule("▪ NON ENREGISTRÉ · " + String((r && r.erreur) || "RÉESSAYEZ").toUpperCase());
        else if(r.attente){ if(parti) invAvis("▪ EN ATTENTE DE TRAITEMENT · " + String(p.description || "").toUpperCase()); else { clearTimeout(flash); dessiner("▪ EN ATTENTE DE TRAITEMENT"); } }
      }).catch(function(){ annule("▪ NON ENREGISTRÉ · RÉSEAU INDISPONIBLE"); });
    };
    var cm = document.getElementById("invcmd");
    if(cm) cm.onclick = function(){
      cm.outerHTML = '<div id="invconf" style="margin:8px 0"><div style="font-size:14px;margin-bottom:8px">Commander ce produit?</div><div style="display:flex;gap:8px"><button type="button" class="bouton" id="invnon" style="flex:1;height:46px;padding:0;margin:0">Non</button><button type="button" class="bouton" id="invoui" style="flex:1;height:46px;padding:0;margin:0">Oui, commander</button></div></div>';
      document.getElementById("invnon").onclick = function(){ dessiner(); };
      document.getElementById("invoui").onclick = function(){
        this.disabled = true;
        invEcrire("inv_commander", {id_produit: p.id}).then(function(r){ dessiner(r && r.ok ? (r.essai ? "▪ ESSAI · RIEN N’EST COMMANDÉ" : "▪ COMMANDE ENVOYÉE") : "▪ NON COMMANDÉ · " + String((r && r.erreur) || "RÉESSAYEZ").toUpperCase()); }).catch(function(){ dessiner("▪ NON COMMANDÉ · RÉSEAU INDISPONIBLE"); });
      };
    };
  }
  dessiner();
}

// Réception (vrai): style des pages de l'app. Une bande taupe numérotée par fournisseur et date, lignes sur le fond, trois colonnes (Commandé ou Reste, Nombre reçu, Prix unitaire).
// Confirmer: aucune deuxième confirmation ni message de traitement; l'écran se met à jour tout de suite et la demande part en arrière-plan (inv_recevoir). Écriture désactivée tant que INV_ECRITURE est false.
function invMoisCourt(iso){ var m = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."], p = String(iso).split("-"); return p.length === 3 ? (+p[2]) + " " + m[+p[1] - 1] : String(iso); }
function invPrixTxt(n){ return String(n).replace(".", ","); }
function invReception(){
  if(!INV_LECTURE) return invReceptionAncien();
  var z = document.getElementById("invapp"); if(!z) return;
  z.innerHTML = invOnglets() + '<div class="att" id="invatt"><i></i></div>'; invLierOnglets();
  var panne = function(t){ var a = document.getElementById("invatt"); if(a){ a.className = "bandeau"; a.textContent = t; a.onclick = invReception; } };
  appelService({action: "inv_reception_lire", session: sessionGardee()}).then(function(r){
    if(!document.getElementById("invatt")) return;
    if(!(r && r.ok && Array.isArray(r.lignes))){ panne(/non disponible/i.test(String(r && r.erreur)) ? "▪ RÉCEPTION PAS ENCORE ACTIVÉE" : "▪ " + String((r && r.erreur) || "Échec").toUpperCase() + " · TOUCHEZ POUR RÉESSAYER"); return; }
    INV.rl = r.lignes.map(function(x){ return {id: String(x.id), fournisseur: x.fournisseur, date: x.date, code: x.code, description: x.description, commande: Number(x.commande) || 0, recu: Number(x.recu) || 0, prix: Number(x.prix) || 0}; });
    INV.rmaj = r.maj_t; INV.rsaisie = {}; invReceptionDessiner();
  }).catch(function(){ panne("▪ RÉSEAU INDISPONIBLE · TOUCHEZ POUR RÉESSAYER"); });
}
function invReceptionDessiner(msg){
  var z = document.getElementById("invapp"); if(!z) return;
  var L = (INV.rl || []).filter(function(x){ return x.recu < x.commande; }), groupes = [], idx = {};
  L.forEach(function(x){ var k = x.fournisseur + "|" + x.date; if(idx[k] === undefined){ idx[k] = groupes.length; groupes.push({k: k, f: x.fournisseur, d: x.date, l: []}); } groupes[idx[k]].l.push(x); });
  groupes.sort(function(a, b){ return a.d < b.d ? 1 : a.d > b.d ? -1 : (a.f < b.f ? -1 : 1); });
  var h = invOnglets() + invMaj({maj_t: INV.rmaj}) + (INV_ECRITURE ? "" : '<div style="font-size:13px;color:#6E6350;margin:0 0 10px">La réception sera activée bientôt. Pour le moment, vous pouvez consulter les commandes : rien n’est enregistré.</div>');
  h += '<div class="bandeau" id="invrmsg" style="'+(msg ? "" : "display:none;")+'margin:0 0 10px">'+invE(msg || "")+'</div>';
  if(!groupes.length) h += '<div class="bandeau">▪ AUCUNE COMMANDE EN ATTENTE</div>';
  groupes.forEach(function(g, gi){
    h += '<div class="invband"><b>'+(gi < 9 ? "0" : "")+(gi + 1)+'</b><span>'+invE(invT(g.f))+' · '+invE(invMoisCourt(g.d))+'</span></div>';
    g.l.forEach(function(x){
      var sa = INV.rsaisie[x.id] || {}, q = sa.q != null ? sa.q : "", pr = sa.p != null ? sa.p : (x.prix > 0 ? invPrixTxt(x.prix.toFixed(2)) : "");
      var qv = /^\d+$/.test(q) && +q > 0, pv = /^\d+([.,]\d{1,2})?$/.test(String(pr).trim());
      h += '<div class="invlig" data-i="'+invE(x.id)+'"><div class="invnom">'+invE(invT(x.description))+'</div><div class="invnom">'+invE(x.code)+'</div>'
        + '<div class="invcols"><div><div class="etq">▪ '+(x.recu > 0 ? "Reste" : "Commandé")+'</div><div class="invnb">'+(x.commande - x.recu)+'</div></div>'
        + '<div><div class="etq">▪ Nombre reçu</div><input class="invf invq'+(qv ? "" : " rose")+'" data-i="'+invE(x.id)+'" inputmode="numeric" autocomplete="off" placeholder="Quantité" value="'+invE(q)+'"></div>'
        + '<div><div class="etq">▪ Prix unitaire</div><input class="invf invp'+(pv ? "" : " rose")+'" data-i="'+invE(x.id)+'" inputmode="decimal" autocomplete="off" placeholder="0,00 $" value="'+invE(pr)+'"></div></div>'
        + '<div class="invact"><button type="button" class="bouton invc" data-i="'+invE(x.id)+'"'+(qv && pv && INV_ECRITURE ? "" : " disabled")+'>Confirmer</button><a href="#" class="bouton inva" data-i="'+invE(x.id)+'" style="'+(INV_ECRITURE ? "" : "pointer-events:none")+'">Annuler</a></div><div class="invconf" data-i="'+invE(x.id)+'"></div></div>';
    });
  });
  z.innerHTML = h; invLierOnglets();
  var ligne = function(id){ return INV.rl.filter(function(q){ return q.id === id; })[0]; };
  var maj = function(e){ var i = e.getAttribute("data-i"), sa = INV.rsaisie[i] = INV.rsaisie[i] || {}; if(e.classList.contains("invq")) sa.q = e.value.trim(); else sa.p = e.value.trim();
    var c = document.querySelector('.invlig[data-i="'+i+'"]'), q = c.querySelector(".invq"), p = c.querySelector(".invp"), x = ligne(i);
    var qv = /^\d+$/.test(q.value.trim()) && +q.value.trim() > 0, pv = /^\d+([.,]\d{1,2})?$/.test(p.value.trim());
    q.classList.toggle("rose", !qv); p.classList.toggle("rose", !pv); c.querySelector(".invc").disabled = !(qv && pv && INV_ECRITURE); };
  Array.prototype.forEach.call(z.querySelectorAll(".invf"), function(e){ e.oninput = function(){ maj(e); }; });
  Array.prototype.forEach.call(z.querySelectorAll(".invc"), function(b){ b.onclick = function(){ paOui("Voulez-vous confirmer cette réception\u00a0?", function(){
    var i = b.getAttribute("data-i"), x = ligne(i), c = document.querySelector('.invlig[data-i="'+i+'"]'); if(!x || !c) return;
    var q = +c.querySelector(".invq").value.trim(), p = c.querySelector(".invp").value.trim().replace(",", "."), avant = {recu: x.recu, prix: x.prix};
    x.recu = x.recu + q; x.prix = +p; delete INV.rsaisie[i]; invReceptionDessiner();   // l'écran se met à jour tout de suite
    invEcrire("inv_recevoir", {id_ligne: i, qte_recue: x.recu, prix: +p}).then(function(r){
      if(!(r && r.ok)){ x.recu = avant.recu; x.prix = avant.prix; invReceptionDessiner("▪ RÉCEPTION REFUSÉE · " + String((r && r.erreur) || "RÉESSAYEZ").toUpperCase()); }
    }).catch(function(){ x.recu = avant.recu; x.prix = avant.prix; invReceptionDessiner("▪ RÉCEPTION NON ENVOYÉE · RÉSEAU INDISPONIBLE"); });
  }); }; });
  Array.prototype.forEach.call(z.querySelectorAll(".inva"), function(a){ a.onclick = function(ev){ ev.preventDefault();
    var i = a.getAttribute("data-i"), m = document.querySelector('.invconf[data-i="'+i+'"]'); if(!m) return;
    m.innerHTML = '<div style="margin:10px 0 8px">Annuler cette ligne de commande?</div><div style="display:flex;gap:8px"><button type="button" class="bouton lg invan" style="flex:1;height:46px;padding:0;margin:0">Non</button><button type="button" class="bouton invao" style="flex:1;height:46px;padding:0;margin:0;background:#A33A2B;color:#fff">Oui, annuler</button></div>';
    m.querySelector(".invan").onclick = function(){ m.innerHTML = ""; };
    m.querySelector(".invao").onclick = function(){ var x = ligne(i), idx = INV.rl.indexOf(x); INV.rl.splice(idx, 1); invReceptionDessiner();
      invEcrire("inv_annuler_ligne", {id_ligne: i}).then(function(r){ if(!(r && r.ok)){ INV.rl.splice(idx, 0, x); invReceptionDessiner("▪ NON ANNULÉE · " + String((r && r.erreur) || "RÉESSAYEZ").toUpperCase()); } }).catch(function(){ INV.rl.splice(idx, 0, x); invReceptionDessiner("▪ NON ANNULÉE · RÉSEAU INDISPONIBLE"); }); };
  }; });
}
// Réception (ancien écran d'essai): une section par fournisseur et date de commande (repliable), puis une ligne par produit: code, description, commandé, reçu, prix (obligatoire), Confirmer et Annuler.
function invReceptionAncien(){
  var z = document.getElementById("invapp"); if(!z) return;
  if(!INV.rec) INV.rec = INV_LECTURE ? [] : INV_RECEPTION_FICTIF.map(function(x){ return Object.assign({}, x); });
  var L = INV.rec, groupes = [], idx = {};
  L.forEach(function(x){ var k = x.fournisseur + "|" + x.date; if(idx[k] === undefined){ idx[k] = groupes.length; groupes.push({k: k, f: x.fournisseur, d: x.date, l: []}); } groupes[idx[k]].l.push(x); });
  groupes.sort(function(a, b){ return a.d < b.d ? 1 : a.d > b.d ? -1 : (a.f < b.f ? -1 : 1); });
  var h = invOnglets() + (INV_LECTURE ? '<div style="font-size:13px;color:#6E6350;margin:0 0 10px">La réception des commandes sera activée bientôt. Pour le moment, rien n’est enregistré.</div>' : '<div style="font-size:12px;color:#6E6350;margin:0 0 8px">Données fictives pour essai</div>');
  if(!groupes.length) h += '<div class="bandeau">▪ AUCUNE COMMANDE EN ATTENTE</div>';
  groupes.forEach(function(g){
    var ouvert = INV.ouv[g.k] !== false;
    h += '<div class="invg" data-k="'+invE(g.k)+'" style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin:30px 0 10px;cursor:pointer"><b style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;overflow-wrap:anywhere">'+invE(g.f)+'</b><span style="font-size:12px;color:#6E6350;white-space:nowrap">'+invE(invMoisFr(g.d))+'</span></div>';
    if(!ouvert) return;
    g.l.forEach(function(x){
      var rc = INV.recu[x.id] || 0, vide = !String(x.prix).trim(), ok = rc > 0 && !vide;
      h += '<div style="background:#E3DFD3;padding:14px 14px 16px;margin:0 0 14px"><div style="overflow-wrap:anywhere">'+invE(x.description)+'</div><div style="font-size:12px;color:#6E6350;margin:2px 0 8px">'+invE(x.code)+' · Commandé : '+invE(x.commande)+'</div>'
        + '<div style="display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap"><div><span class="lbl" style="margin-top:0">Reçu</span><div style="display:flex;align-items:center;gap:8px"><button type="button" class="bouton invm" data-i="'+invE(x.id)+'" style="width:46px;height:46px;padding:0;margin:0">−</button><span style="font-size:22px;min-width:30px;text-align:center">'+rc+'</span><button type="button" class="bouton invpl" data-i="'+invE(x.id)+'" style="width:46px;height:46px;padding:0;margin:0">+</button></div></div>'
        + '<div style="flex:1;min-width:110px"><span class="lbl" style="margin-top:0">Prix · obligatoire</span><input class="bx invprix'+(vide ? " rose" : "")+'" data-i="'+invE(x.id)+'" inputmode="decimal" autocomplete="off" value="'+invE(x.prix)+'" style="margin:0;height:46px"></div></div>'
        + '<div style="display:flex;align-items:center;gap:18px;margin-top:10px"><button type="button" class="bouton invc" data-i="'+invE(x.id)+'" style="width:auto;height:46px;padding:0 22px;margin:0"'+(ok ? "" : " disabled")+'>Confirmer</button><a href="#" class="inva" data-i="'+invE(x.id)+'" style="color:#000000;text-decoration:underline;text-decoration-color:var(--vert);text-decoration-thickness:3px;text-underline-offset:4px">Annuler</a></div>'
        + '<div class="bandeau invmsg" data-i="'+invE(x.id)+'" style="display:none;margin-top:8px"></div></div>';
    });
  });
  z.innerHTML = h; invLierOnglets();
  var ligne = function(id){ return INV.rec.filter(function(q){ return q.id === id; })[0]; };
  var enr = function(id){ var f = document.querySelector('.invprix[data-i="'+id+'"]'); if(f){ var q = ligne(id); if(q) q.prix = f.value; } };
  Array.prototype.forEach.call(z.querySelectorAll(".invg"), function(e){ e.onclick = function(){ var k = e.getAttribute("data-k"); INV.ouv[k] = INV.ouv[k] === false; invReception(); }; });
  Array.prototype.forEach.call(z.querySelectorAll(".invm"), function(e){ e.onclick = function(){ var i = e.getAttribute("data-i"); enr(i); if((INV.recu[i] || 0) > 0) INV.recu[i]--; invReception(); }; });
  Array.prototype.forEach.call(z.querySelectorAll(".invpl"), function(e){ e.onclick = function(){ var i = e.getAttribute("data-i"); enr(i); INV.recu[i] = (INV.recu[i] || 0) + 1; invReception(); }; });
  Array.prototype.forEach.call(z.querySelectorAll(".invprix"), function(e){ e.oninput = function(){ var i = e.getAttribute("data-i"), q = ligne(i); if(q) q.prix = e.value; e.className = "bx invprix" + (String(e.value).trim() ? "" : " rose"); var c = z.querySelector('.invc[data-i="'+i+'"]'); if(c) c.disabled = !((INV.recu[i] || 0) > 0 && String(e.value).trim()); }; });
  Array.prototype.forEach.call(z.querySelectorAll(".invc"), function(e){ e.onclick = function(){ paOui("Voulez-vous confirmer cette réception\u00a0?", function(){
    var i = e.getAttribute("data-i"), q = ligne(i); if(!q) return; e.disabled = true;
    invEcrire("inv_recevoir", {id_ligne: i, qte_recue: INV.recu[i] || 0, prix: q.prix}).then(function(r){
      if(r && r.ok){ INV.rec = INV.rec.filter(function(w){ return w.id !== i; }); delete INV.recu[i]; invReception(); var b = document.createElement("div"); b.className = "bandeau"; b.style.marginTop = "8px"; b.textContent = r.essai ? "▪ ESSAI · RIEN N’EST ENREGISTRÉ DANS GESTION" : "▪ RÉCEPTION CONFIRMÉE"; var zz = document.getElementById("invapp"); if(zz) zz.insertBefore(b, zz.firstChild.nextSibling); }
      else { var m = z.querySelector('.invmsg[data-i="'+i+'"]'); if(m){ m.style.display = "block"; m.textContent = "▪ NON ENREGISTRÉ · " + String((r && r.erreur) || "RÉESSAYEZ").toUpperCase(); } e.disabled = false; }
    }).catch(function(){ var m = z.querySelector('.invmsg[data-i="'+i+'"]'); if(m){ m.style.display = "block"; m.textContent = "▪ NON ENREGISTRÉ · RÉSEAU INDISPONIBLE"; } e.disabled = false; });
  }); }; });
  Array.prototype.forEach.call(z.querySelectorAll(".inva"), function(e){ e.onclick = function(ev){ ev.preventDefault();
    var i = e.getAttribute("data-i"), m = z.querySelector('.invmsg[data-i="'+i+'"]'); if(!m) return;
    m.style.display = "block"; m.innerHTML = '<div style="margin-bottom:8px">Annuler cette ligne de commande?</div><div style="display:flex;gap:8px"><button type="button" class="bouton" id="invan" style="flex:1;height:46px;padding:0;margin:0">Non</button><button type="button" class="bouton" id="invao" style="flex:1;height:46px;padding:0;margin:0;background:#A33A2B;color:#fff">Oui, annuler</button></div>';
    document.getElementById("invan").onclick = function(){ m.style.display = "none"; };
    document.getElementById("invao").onclick = function(){ this.disabled = true; invEcrire("inv_annuler_ligne", {id_ligne: i}).then(function(r){ if(r && r.ok){ INV.rec = INV.rec.filter(function(w){ return w.id !== i; }); delete INV.recu[i]; invReception(); } else { m.textContent = "▪ NON ANNULÉE · " + String((r && r.erreur) || "RÉESSAYEZ").toUpperCase(); } }).catch(function(){ m.textContent = "▪ NON ANNULÉE · RÉSEAU INDISPONIBLE"; }); };
  }; });
}

// Gestion des stocks (Gestionnaires et Direction): inscrire la quantité exacte comptée à la main (2 ou 3 fois par année).
function invCompte(p){
  var q = p.stock;
  invPage('<div id="invapp"></div>');
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); invListe2(); };
  var z = document.getElementById("invapp");
  function dessiner(msg){
    var d = q - p.stock, h = (INV.d.fictif ? '<div style="font-size:12px;color:#6E6350;margin:0 0 6px">Données fictives pour essai</div>' : "");
    h += '<span class="lbl">Produit</span><div style="font-size:20px;font-weight:700;overflow-wrap:anywhere">'+invE(invT(p.description))+'</div><div style="font-size:12px;color:#6E6350;margin:4px 0 10px">'+invE(invT(p.categorie))+' · '+invE(invT(p.fournisseur))+'</div>';
    h += '<div style="background:#E3DFD3;padding:12px"><div style="font-size:12px;color:#6E6350">Stock actuel dans Gestion</div><div style="font-size:22px;font-weight:700">'+invE(p.stock)+'</div></div>';
    h += '<span class="lbl" style="margin-top:18px">Quantité exacte comptée</span><div style="display:flex;align-items:center;gap:14px"><button type="button" class="bouton" id="invmoins" style="width:46px;height:46px;padding:0;margin:0">−</button><span style="font-size:28px;min-width:48px;text-align:center">'+q+'</span><button type="button" class="bouton" id="invplus" style="width:46px;height:46px;padding:0;margin:0">+</button></div>';
    h += '<div style="font-size:13px;color:#6E6350;margin:10px 0">'+(d === 0 ? "Identique au stock actuel." : "Différence : "+(d > 0 ? "+" : "−")+Math.abs(d)+".")+'</div>';
    h += '<button type="button" class="bouton" id="invok" style="height:46px;padding:0;margin:8px 0"'+(d === 0 || !(INV_ECRITURE || INV_COMPTER) ? " disabled" : "")+'>Enregistrer la quantité</button>'+((INV_ECRITURE || INV_COMPTER) ? "" : '<div style="font-size:13px;color:#6E6350;margin:8px 0">L’inscription des quantités sera activée bientôt. Pour le moment, rien n’est enregistré.</div>');
    h += '<div class="bandeau" id="invmsg" style="'+(msg ? "" : "display:none;")+'margin-top:8px">'+invE(msg || "")+'</div>';
    z.innerHTML = h;
    document.getElementById("invmoins").onclick = function(){ if(q > 0){ q--; dessiner(); } };
    document.getElementById("invplus").onclick = function(){ if(q < 99999){ q++; dessiner(); } };
    var ok = document.getElementById("invok");
    ok.onclick = function(){
      var avant = p.stock, qs = q;   // l'écran se met à jour tout de suite; la valeur d'avant revient si Michel refuse
      var actif = INV_ECRITURE || INV_COMPTER, flash = null, parti = false;
      p.stock = qs; if(actif) invPend(p, qs); dessiner(actif ? "▪ ENREGISTRÉ" : "");
      if(actif) flash = setTimeout(function(){ parti = true; invOuvrir(); }, 1000);   // « Enregistré » 1 seconde, puis retour à la liste; la confirmation de Gestion se fait en arrière-plan
      function refus(t){ clearTimeout(flash); invPendRetirer(p); p.stock = avant; q = avant; if(parti) invAvis(t); else dessiner(t); }
      invEcrire("inv_compter", {id_produit: p.id, quantite: qs}).then(function(r){
        if(r && r.ok){
          if(r.attente){ if(parti) invAvis("▪ EN ATTENTE DE TRAITEMENT · " + String(p.description || "").toLowerCase()); else { clearTimeout(flash); dessiner("▪ EN ATTENTE DE TRAITEMENT"); } return; }
          if(r.stock_apres !== undefined && r.stock_apres !== null && +r.stock_apres !== p.stock){ p.stock = +r.stock_apres; q = p.stock; invPend(p, p.stock); }
        } else refus("▪ NON ENREGISTRÉ · " + String((r && r.erreur) || "RÉESSAYEZ").toUpperCase() + (parti ? " · " + String(p.description || "").toUpperCase() : ""));
      }).catch(function(){ refus("▪ NON ENREGISTRÉ · RÉSEAU INDISPONIBLE" + (parti ? " · " + String(p.description || "").toUpperCase() : "")); });
    };
  }
  dessiner();
}
function invListe2(){ invOuvrir(); }
