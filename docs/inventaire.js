// Inventaire (tous les employés). DONNÉES FICTIVES POUR ESSAI: tant que la vue de Michel (trak.app_inventaire) et sa fonction d'écriture n'existent pas,
// la liste vient de INV_FICTIF et AUCUNE écriture réelle n'est faite. Pour brancher le vrai: (1) remplacer invLire() par l'appel au Service (lecture seule, vue SQL),
// (2) mettre INV_ECRITURE = true et compléter invEcrire() (point unique pour « déduire » et « commander »). Rien d'autre à changer.
var INV_ECRITURE = false;   // désactivé en attendant la fonction d'écriture de Michel
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
var INV = {cat: "", debut: "", sorties: []};
function invE(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function invNorm(t){ return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim(); }
// Lecture: pour l'instant les produits fictifs (copie, pour que les essais ne modifient pas la liste d'origine).
function invLire(){ return Promise.resolve({ok: true, fictif: true, produits: INV_FICTIF}); }
// Point unique d'écriture. Désactivé: aucune écriture réelle, la réponse simule un succès clairement marqué comme essai.
function invEcrire(action, corps){
  if(!INV_ECRITURE) return Promise.resolve({ok: true, essai: true});
  return appelService({action: action, session: sessionGardee(), f: corps});   // À brancher sur la fonction de Michel (inv_deduire / inv_commander)
}
function invPage(corps){
  app.innerHTML = '<div class="page"><h1>Inventaire</h1><a class="retour" href="#" id="retour">Retour</a>'+corps+'</div>';
}
function invOuvrir(){
  invPage('<div id="invapp"><div class="bandeau" id="invatt">▪ UN INSTANT</div></div>');
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  invLire().then(function(r){
    if(!document.getElementById("invapp")) return;
    if(!(r && r.ok)){ var a = document.getElementById("invatt"); if(a){ a.textContent = "▪ " + String((r && r.erreur) || "Échec").toUpperCase() + " · TOUCHEZ POUR RÉESSAYER"; a.onclick = invOuvrir; } return; }
    INV.d = r; if(!INV.cat) INV.cat = (r.produits[0] || {}).categorie || ""; invListe();
  }).catch(function(){ var a = document.getElementById("invatt"); if(a){ a.textContent = "▪ RÉSEAU INDISPONIBLE · TOUCHEZ POUR RÉESSAYER"; a.onclick = invOuvrir; } });
}
function invCategories(){ var v = {}, o = []; (INV.d.produits || []).forEach(function(p){ if(!v[p.categorie]){ v[p.categorie] = 1; o.push(p.categorie); } }); return o.sort(function(a, b){ return invNorm(a) < invNorm(b) ? -1 : 1; }); }
function invListe(){
  var cats = invCategories(), z = document.getElementById("invapp"); if(!z) return;
  var h = (INV.d.fictif ? '<div style="font-size:12px;color:#6E6350;margin:0 0 6px">Données fictives pour essai</div>' : "");
  h += '<span class="lbl">Catégorie</span><select class="bx" id="invcat" style="background:#8D806A;color:#fff;border-color:#8D806A">'+cats.map(function(c){ return '<option value="'+invE(c)+'"'+(c === INV.cat ? " selected" : "")+'>'+invE(c)+'</option>'; }).join("")+'</select>';
  h += '<span class="lbl">Commence par</span><input class="bx" id="invdeb" autocomplete="off" placeholder="Premières lettres" value="'+invE(INV.debut)+'">';
  h += '<span class="lbl">Produit</span><div id="invprod"></div>';
  z.innerHTML = h;
  document.getElementById("invcat").onchange = function(){ INV.cat = this.value; invProduits(); };
  document.getElementById("invdeb").oninput = function(){ INV.debut = this.value; invProduits(); };
  invProduits();
}
function invProduits(){
  var z = document.getElementById("invprod"); if(!z) return;
  var d = invNorm(INV.debut), L = (INV.d.produits || []).filter(function(p){ return p.categorie === INV.cat && (!d || invNorm(p.description).indexOf(d) === 0); });
  z.innerHTML = L.length ? L.map(function(p){ return '<div class="invp" data-i="'+invE(p.id)+'" style="display:flex;justify-content:space-between;align-items:center;gap:10px;background:#DDD9CD;padding:14px;margin:0 0 6px;cursor:pointer"><span style="min-width:0;overflow-wrap:anywhere">'+invE(p.description)+'</span><span style="font-size:12px;color:#6E6350">'+invE(p.stock)+'</span></div>'; }).join("") : '<div class="bandeau">▪ AUCUN PRODUIT</div>';
  Array.prototype.forEach.call(z.querySelectorAll(".invp"), function(x){ x.onclick = function(){ var p = (INV.d.produits || []).filter(function(q){ return q.id === x.getAttribute("data-i"); })[0]; if(p) invProduit(p); }; });
}
function invProduit(p){
  var qte = 1, deduire = p.mode !== "commander";
  invPage('<div id="invapp"></div>');
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); invOuvrir(); };
  var z = document.getElementById("invapp");
  function dessiner(msg){
    var reste = p.stock - qte, h = (INV.d.fictif ? '<div style="font-size:12px;color:#6E6350;margin:0 0 6px">Données fictives pour essai</div>' : "");
    h += '<span class="lbl">Produit</span><div style="font-size:20px;font-weight:700;overflow-wrap:anywhere">'+invE(p.description)+'</div><div style="font-size:12px;color:#6E6350;margin:4px 0 10px">'+invE(p.categorie)+' · '+invE(p.fournisseur)+(p.par > 1 || p.unite ? ' · '+invE(p.par)+' / '+invE(p.unite) : "")+'</div>';
    h += '<div style="display:flex;gap:6px"><div style="flex:1;background:#DDD9CD;padding:12px"><div style="font-size:12px;color:#6E6350">En stock</div><div style="font-size:22px;font-weight:700">'+invE(p.stock)+'</div></div><div style="flex:1;background:#DDD9CD;padding:12px"><div style="font-size:12px;color:#6E6350">Minimum</div><div style="font-size:22px;font-weight:700">'+invE(p.minimum)+'</div></div></div>';
    if(deduire){
      h += '<span class="lbl" style="margin-top:18px">Quantité utilisée</span><div style="display:flex;align-items:center;gap:14px"><button type="button" class="bouton" id="invmoins" style="width:46px;height:46px;padding:0;margin:0">−</button><span style="font-size:34px;min-width:50px;text-align:center">'+qte+'</span><button type="button" class="bouton" id="invplus" style="width:46px;height:46px;padding:0;margin:0">+</button><span style="font-size:14px;color:#6E6350;text-transform:uppercase">'+invE(p.unite)+'</span></div>';
      h += '<div style="font-size:13px;color:#6E6350;margin:10px 0">'+(reste < 0 ? "Il n’y en a pas assez en stock." : reste < p.minimum ? "Il restera "+reste+" en stock, sous le minimum de "+invE(p.minimum)+"." : reste === p.minimum ? "Il restera "+reste+" en stock, soit le minimum." : "Il restera "+reste+" en stock.")+'</div>';
      h += '<button type="button" class="bouton" id="invok" style="height:46px;padding:0;margin:8px 0"'+(reste < 0 || qte < 1 ? " disabled" : "")+'>Enregistrer</button>';
    } else {
      h += '<div style="font-size:13px;color:#6E6350;margin:18px 0 10px">Ce produit se commande. Aucune quantité n’est déduite du stock.</div><button type="button" class="bouton" id="invcmd" style="height:46px;padding:0;margin:8px 0">Commander le produit</button>';
    }
    h += '<div class="bandeau" id="invmsg" style="'+(msg ? "" : "display:none;")+'margin-top:8px">'+invE(msg || "")+'</div>';
    var rec = INV.sorties.slice(0, 5);
    if(rec.length) h += '<span class="lbl" style="margin-top:18px">Vos dernières sorties</span>'+rec.map(function(s){ return '<div style="display:flex;justify-content:space-between;gap:10px;background:#DDD9CD;padding:12px 14px;margin:0 0 6px"><span style="overflow-wrap:anywhere">'+invE(s.nom)+'</span><span style="font-size:12px;color:#6E6350;white-space:nowrap">'+invE(s.q)+' · '+invE(s.h)+'</span></div>'; }).join("");
    z.innerHTML = h;
    var m = document.getElementById("invmoins"), pl = document.getElementById("invplus");
    if(m) m.onclick = function(){ if(qte > 1){ qte--; dessiner(); } };
    if(pl) pl.onclick = function(){ if(qte < 999){ qte++; dessiner(); } };
    var ok = document.getElementById("invok");
    if(ok) ok.onclick = function(){
      ok.disabled = true; ok.textContent = "Enregistrement…";
      invEcrire("inv_deduire", {id_produit: p.id, quantite: qte}).then(function(r){
        if(r && r.ok){ var t = new Date(); INV.sorties.unshift({nom: p.description, q: qte, h: t.getHours()+" h "+("0"+t.getMinutes()).slice(-2)}); if(r.essai) p.stock = p.stock - qte; var mm = r.essai ? "▪ ESSAI · RIEN N’EST ENREGISTRÉ DANS TRAK" : "▪ ENREGISTRÉ"; qte = 1; dessiner(mm); }
        else dessiner("▪ NON ENREGISTRÉ · " + String((r && r.erreur) || "RÉESSAYEZ").toUpperCase());
      }).catch(function(){ dessiner("▪ NON ENREGISTRÉ · RÉSEAU INDISPONIBLE"); });
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
