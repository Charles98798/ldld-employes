// Direction > États financiers: année en cours (QuickBooks, via le service, Direction seulement). Comparaison avec l'année précédente à partir de 2027.
// AUCUN montant dans ce fichier (le code est public): la structure ci-dessous ne contient que des numéros de compte; les montants viennent de l'action « ef_donnees » du service.
// Chaque entrée: [numéro de compte, libellé] ou [libellé du groupe de comptes, [numéros], libellé] pour une ligne qui additionne plusieurs comptes.
var EF_SPEC = {
 V: [
  ["Ventes fixe", [["4100","Ventes fixe"],["4200","Ventes zircone"],["4120","Ventes d'attachements"],["4110","Ventes d'alliage"],["4130","Ventes composantes d'implants"],["4210","Ventes céramique"],["4501","Escomptes non prévisibles fixe"],["4502","Escomptes prévisibles fixe"]]],
  ["Ventes amovible", [["4300","Ventes pièce"],["4136","Ventes barres d'implants"],["4400","Ventes acrylique"],["4410","Ventes dents"],["4430","Vente orthodontie"],["4503","Escomptes non prévisibles acrylique"],["4504","Escomptes prévisibles acrylique"],["4505","Escomptes non prévisibles pièce"],["4506","Escomptes prévisibles pièce"]]],
  ["Autres ventes et escomptes", [["4445","Vente d'équipement usagé"],["4500","Escompte 20 % / crédit / location / promotion"],["4507","Escomptes promotion"]]],
  ["Autres revenus", [["4510","Revenu livraison"],["4515","Autres revenus"],["4520","Revenus d'intérêts clients"],["Services","Services"]]]],
 C: [
  ["Salaires fixe", [["5105","Salaires fixe"],["5110 à 5190","Charges et avantages sociaux",["5110","5120","5130","5140","5150","5160","5170","5190"]],["5205","Salaires céramique (inclus dans le fixe)",null,1],["5210 à 5290","Charges céramique (incluses dans le fixe)",["5210","5220","5230","5240","5250","5260","5270","5290"],1]]],
  ["Salaires pièce", [["5305","Salaire pièce"],["5310 à 5390","Charges et avantages sociaux",["5310","5320","5330","5340","5350","5360","5370","5390"]]]],
  ["Salaires acrylique", [["5405","Salaire acrylique"],["5410 à 5490","Charges et avantages sociaux",["5410","5420","5430","5440","5450","5460","5470","5490"]]]],
  ["Salaires gestion de la production", [["5705","Salaire gestion de la production"],["5710 à 5790","Charges et avantages sociaux",["5710","5720","5730","5740","5750","5760","5770","5790"]]]],
  ["Achats", [["6110","Achats fixe"],["6120","Achats d'alliage"],["6130","Achats d'attachements"],["6140","Achats composantes d'implants"],["6145","Achats barres d'implants"],["6150","Achats céramique"],["6160","Achats pièce"],["6170","Achats acrylique"],["6180","Achats de dents"],["7093","Frais de transport reliés aux achats"],["7015","Gaz"],["6200","Escomptes et rabais sur achats"]]],
  ["Frais généraux d'exploitation", [["7005","Loyer production"],["7010","Électricité production"],["7030","Entretien et réparation bâtisse production"],["7035","Entretien et réparation machinerie"],["7037","Entretien et licences informatique"],["7045","Buanderie"],["7100","Amortissement machinerie"],["7125","Amortissement machinerie fabrication et transformation"],["7130","Amortissement logiciel de fabrication et transformation"]]]],
 A: [
  ["Frais d'administration", [["7031","Entretien réparation bâtisse administration"],["7041","Entretien ménager administration"],["7040","Entretien ménager production"],["7095","Cotisations ordres professionnels"],["7201","Taxes et permis administration"],["7200","Taxes et permis production"],["7500","Loyer administration"],["7505","Électricité administration"],["7510","Assurances vie"],["7020","Assurances matériel roulant"],["7025","Assurances bâtiments"],["7515","Téléphone"],["7520","Papeterie et frais de bureau"],["7530","Honoraires juridiques"],["7535","Honoraires comptabilité"],["7540","Honoraires professionnels"],["7545","Amortissement mobilier bureau"],["7550","Amortissement systèmes informatiques"],["7605 à 7650","Salaires et charges administration",["7605","7610","7615","7620","7625","7630","7635","7640","7650"]],["7651","CNT"],["7652","Frais mutuelle CNESST"],["7720","Frais de formation"],["7860","Mauvaises créances (recouvrées)"],["7865","Dépense non déductible"]]]],
 VT: [
  ["Livraisons et déplacements", [["7055","Dépenses autos"],["7075","Location matériel roulant"],["7085","Messagerie"],["7090","Frais d'expédition"]]],
  ["Publicité et promotion", [["7705","Frais de représentation"],["7700","Frais événements spéciaux"],["7710","Frais de congrès"],["7715","Publicité"]]]],
 F: [
  ["Frais financiers", [["7820","Intérêts et frais de banque"],["7825","Frais bancaires fixe"],["7830","Frais sur cartes de crédit"],["7840","Intérêts sur marge de crédit"],["7856","Intérêts sur la dette à long terme"]]]],
 IMP: [
  ["Autres dépenses", [["6100","Stock au début"],["6300","Stock à la fin"],["7875","Divers à reclasser"],["7905","Impôts exigibles"],["7910","Impôts futurs"]]]]
};
var EF_TOT = {V: "Total des revenus", C: "Total du coût des marchandises vendues", D: "Total des dépenses", IMP: "Total des autres dépenses"};
var EF_V, EF_C, EF_A, EF_VT, EF_F, EF_AR = [], EF_IMP;
// Transforme les comptes reçus du service en [[bloc, [[libellé, montant], ...]], ...]; les lignes à zéro sont masquées; tout compte non prévu
// va dans « Autres comptes » pour que les totaux soient toujours ceux de QuickBooks.
function efConstruire(r){
  var cm = r.comptes || {}, tt = r.totaux || {}, vus = {};
  function val(c){ vus[c] = 1; if(c === "Services") return Number(tt.Services) || 0; return Number(cm[c]) || 0; }
  function mk(spec){
    var out = [];
    spec.forEach(function(g){
      var lignes = [];
      g[1].forEach(function(e){
        var n = 0;
        if(e[2] === null){ n = val(e[0]); if(e[3] && !n) return; lignes.push([e[0] + " " + e[1], n]); return; }
        if(e[2]){ e[2].forEach(function(c){ n += val(c); }); if(e[3] && !n) return; lignes.push([e[0] + " " + e[1], n]); return; }
        n = val(e[0]); lignes.push([e[0] + " " + e[1], n]);
      });
      out.push([g[0], lignes]);
    });
    return out;
  }
  function somme(gs){ var t = 0; gs.forEach(function(g){ g[1].forEach(function(x){ t += x[1]; }); }); return t; }
  EF_V = mk(EF_SPEC.V); EF_C = mk(EF_SPEC.C); EF_A = mk(EF_SPEC.A); EF_VT = mk(EF_SPEC.VT); EF_F = mk(EF_SPEC.F); EF_IMP = mk(EF_SPEC.IMP); EF_AR = [];
  // Écart avec les totaux de QuickBooks => « Autres comptes » (jamais un total faux)
  function ecart(gs, voulu, dernier){ if(voulu == null) return; var d = Math.round((voulu - somme(gs)) * 100) / 100; if(Math.abs(d) >= 0.5) dernier[1].push(["Autres comptes", d]); }
  ecart(EF_V, tt[EF_TOT.V], EF_V[EF_V.length - 1]);
  ecart(EF_C, tt[EF_TOT.C], EF_C[EF_C.length - 1]);
  ecart(EF_A.concat(EF_VT, EF_F), tt[EF_TOT.D], EF_A[EF_A.length - 1]);
  ecart(EF_IMP, tt[EF_TOT.IMP], EF_IMP[EF_IMP.length - 1]);
}
function efMontant(n){ var s = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); return n < 0 ? "(" + s + ")" : s; }
function efSomme(sub){ var t = 0; sub.forEach(function(x){ t += Number(x[1]) || 0; }); return t; }
function efTotal(gs){ var t = 0; gs.forEach(function(g){ t += efSomme(g[1]); }); return t; }
var EF_MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juill.", "août", "sept.", "oct.", "nov.", "déc."];
// Correction des cellules que Google Sheets a lues comme des dates (ex. « 1469.05 » = mai 1469): on retrouve le montant d'origine (année + mois/100).
function efNum(x){
  var n = Number(x) || 0;
  if(Math.abs(n) >= 2e9){ var d = new Date(n + 12 * 3600 * 1000); n = Math.round(d.getUTCFullYear() * 100 + (d.getUTCMonth() + 1)) / 100; }
  return n;
}
function efNettoyer(r){ ["comptes", "totaux"].forEach(function(k){ Object.keys(r[k] || {}).forEach(function(c){ if(Array.isArray(r[k][c])) r[k][c] = r[k][c].map(efNum); }); }); ["tresorerie", "margeCredit", "flux"].forEach(function(k){ if(Array.isArray(r[k])) r[k] = r[k].map(efNum); }); return r; }
function efOuvrir(){
  app.innerHTML = '<div class="page ppx fin ef"><h1>États financiers</h1><div class="bandeau"></div><a class="retour" href="#" id="retour">Retour</a></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  var fini = false;
  function recu(m){
    if(fini || !document.querySelector(".ef")) return;
    var r = m;
    if(m && m.ok && m.comptes){ efNettoyer(m);   // cumul de janvier à la date des données, chaque cellule convertie en nombre
      var som = function(a){ var t = 0; (a || []).forEach(function(x){ t += efNum(x); }); return Math.round(t * 100) / 100; };
      r = {ok: true, annee: m.annee, maj: m.maj, comptes: {}, totaux: {}};
      Object.keys(m.comptes).forEach(function(k){ r.comptes[k] = som(m.comptes[k]); });
      Object.keys(m.totaux || {}).forEach(function(k){ r.totaux[k] = som(m.totaux[k]); });
    }
    if(r && r.ok){ fini = true; efDessiner(r); }
    else if(r && r.erreur){ fini = true; app.querySelector(".bandeau").textContent = "▪ " + String(r.erreur).toUpperCase() + " · RÉESSAYEZ"; }
  }
  appelService({action: "finance_mensuel", session: sessionGardee()}).then(recu).catch(function(){});
  setTimeout(function(){ if(!fini && document.querySelector(".ef")) appelBrut({action: "finance_mensuel", session: sessionGardee()}).then(recu).catch(function(){}); }, 5000);   // la lecture préchargée traîne: appel direct
  setTimeout(function(){ var b = document.querySelector(".ef .bandeau"); if(!fini && b){ fini = true; b.textContent = "▪ INDISPONIBLE · RÉESSAYEZ"; } }, 40000);
}
function efDessiner(r){
  efConstruire(r);
  var d = new Date(r.maj); if(isNaN(d.getTime())) d = new Date();
  var dateFin = d.getDate() + " " + EF_MOIS[d.getMonth()];
  var vt = efTotal(EF_V), cout = efTotal(EF_C), brut = vt - cout, adm = efTotal(EF_A), vente = efTotal(EF_VT), fin = efTotal(EF_F);
  var expl = brut - adm - vente - fin, ar = efTotal(EF_AR), avant = expl + ar, imp = efTotal(EF_IMP), net = avant - imp;
  function plage(a, b){ var t = 0; Object.keys(r.comptes || {}).forEach(function(k){ if(+k >= a && +k <= b) t += Number(r.comptes[k]) || 0; }); return t; }
  var sal = plage(5105, 5790), ach = plage(6110, 6200), fgx = cout - sal - ach;
  function pct(n){ return (vt ? Math.round(n / vt * 100) : 0) + " %"; }
  function ligne(lib, n, cl){ return '<div class="efl ' + cl + '"><span class="n">' + lib + '</span><span>' + efMontant(n) + '</span><span>' + pct(n) + '</span></div>'; }
  // Comme le document d'origine: un bloc par titre (ex. Ventes fixe), fermé = titre seulement; ouvert = les comptes, puis le total à la FIN du bloc
  function blocs(gs){
    var h = "";
    gs.forEach(function(g){
      var t = efSomme(g[1]);
      h += '<div class="efb"><div class="efl efr"><span class="n"><i class="efm">+</i>' + g[0] + '</span><span></span><span></span></div><div class="efg">';
      g[1].forEach(function(x){ h += ligne(x[0], x[1], "efd"); });
      h += ligne("Total " + g[0].charAt(0).toLowerCase() + g[0].slice(1), t, "efd eftb") + '</div></div>';
    });
    return h;
  }
  var n = 0;
  function section(t, gs, fins){
    n++;
    return '<div class="sect"><span class="num">0' + n + '</span><span class="lab">' + t + '</span></div>' +
      '<div class="efl efh"><span></span><span>' + r.annee + '</span><span>% des ventes</span></div>' + blocs(gs) + (fins || "");
  }
  var h = '<div class="page ppx fin ef"><h1>États financiers</h1>' +
    '<div class="efsel"><span>' + r.annee + '</span><span>1 janv.</span><span>' + dateFin + '</span></div>' +
    '<div class="efres"><div><small>Ventes</small><b>' + efMontant(vt) + '</b></div><div><small>Bénéfice brut</small><b>' + pct(brut) + '</b></div><div><small>Bénéfice net</small><b>' + pct(net) + '</b></div></div>';
  h += section("Ventes", EF_V, ligne("Ventes totales", vt, "eft"));
  h += section("Coût des ventes", EF_C, ligne("Total du coût des ventes", cout, "eft") + ligne("Bénéfice brut", brut, "eft"));
  h += section("Frais d'administration", EF_A, "");
  h += section("Frais de vente", EF_VT, ligne("Total des frais de vente", vente, "eft"));
  h += section("Frais financiers", EF_F, "");
  h += section("Résultat", EF_AR.concat(EF_IMP), ligne("Bénéfice d'exploitation", expl, "eft") + ligne("Bénéfice avant impôts", avant, "eft") + ligne("Bénéfice net", net, "eft"));
  n++;
  h += '<div class="sect"><span class="num">0' + n + '</span><span class="lab">Ratios</span></div><div class="efl efh"><span></span><span></span><span>% des ventes</span></div>' +
    [["Salaires / ventes", sal],["Achats / ventes", ach],["Frais généraux / ventes", fgx],["Frais d'administration / ventes", adm],["Frais de vente / ventes", vente],["Bénéfice brut / ventes", brut],["Bénéfice net / ventes", net]].map(function(r){
      return '<div class="efl"><span class="n">' + r[0] + '</span><span></span><span>' + pct(Number(r[1]) || 0) + '</span></div>'; }).join("");
  h += '<a class="retour" href="#" id="retour">Retour</a></div>';
  app.innerHTML = h;
  Array.prototype.forEach.call(document.querySelectorAll(".efr"), function(r){
    r.onclick = function(){ var o = r.classList.toggle("o"); r.querySelector(".efm").textContent = o ? "\u2212" : "+"; };
  });
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); financesMenu(); };
}
