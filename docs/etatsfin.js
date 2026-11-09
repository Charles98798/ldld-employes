// Direction > États financiers: 2026 seul (QuickBooks), comparaison avec l'année précédente à partir de 2027.
// Montants INVENTÉS (aucun lien avec les vrais chiffres de l'entreprise); la vraie lecture se branchera au pont QuickBooks (feuille de données).
// Même structure que l'état financier de l'entreprise: ventes, coût des ventes, frais, bénéfice net.
var EF_V = [   // [libellé, [[compte, montant], ...]]
 ["Ventes fixe",[["4100 Ventes fixe",242200],["4200 Ventes zircone",413100],["4120 Ventes d'attachements",341900],["4110 Ventes d'alliage",545900],["4130 Ventes composantes d'implants",264900],["4210 Ventes céramique",470400],["4501 Escomptes non prévisibles fixe",-3800],["4502 Escomptes prévisibles fixe",-19200]]],
 ["Ventes amovible",[["4300 Ventes pièce",372500],["4136 Ventes barres d'implants",222000],["4400 Ventes acrylique",395100],["4410 Ventes dents",240400],["4430 Vente orthodontie",254200],["4503 Escomptes non prévisibles acrylique",-11300],["4504 Escomptes prévisibles acrylique",-1600],["4505 Escomptes non prévisibles pièce",-8300],["4506 Escomptes prévisibles pièce",-3200]]],
 ["Autres escomptes",[["4500 Escompte 20 % / crédit / location / promotion",-17500]]]];
var EF_C = [
 ["Salaires fixe",[["5105 Salaires fixe",114100],["5110 à 5190 Charges et avantages sociaux",12800]]],
 ["Salaires céramique",[["5205 Salaires céramique",111600],["5210 à 5290 Charges et avantages sociaux",4400]]],
 ["Salaires pièce",[["5305 Salaires pièce",86600],["5310 à 5390 Charges et avantages sociaux",26000]]],
 ["Salaires acrylique",[["5405 Salaires acrylique",62400],["5410 à 5490 Charges et avantages sociaux",5400]]],
 ["Salaires gestion de la production",[["5705 Salaire gestion de la production",101100],["5710 à 5790 Charges et avantages sociaux",21100]]],
 ["Achats",[["6110 Achats fixe",34600],["6120 Achats d'alliage",22800],["6130 Achats d'attachements",90800],["6140 Achats composantes d'implants",79400],["6145 Achats barres d'implants",105000],["6150 Achats céramique",53700],["6160 Achats pièce",62600],["6170 Achats acrylique",41400],["6180 Achats de dents",40300],["7093 Frais de transport reliés aux achats",118200],["7015 Gaz",29800],["6200 Escomptes et rabais sur achats",-11400]]],
 ["Frais généraux d'exploitation",[["7005 Loyer production",29400],["7010 Électricité production",76800],["7030 Entretien et réparation bâtisse production",84600],["7035 Entretien et réparation machinerie",67800],["7037 Entretien et licences informatique",118600],["7045 Buanderie",19800],["7100 Amortissement machinerie",94800],["7125 Amortissement machinerie fabrication et transformation",31400],["7130 Amortissement logiciel de fabrication et transformation",106500]]]];
var EF_A = [
 ["Frais d'administration",[["7031 Entretien réparation bâtisse administration",27000],["7041 Entretien ménager administration",23500],["7040 Entretien ménager production",18000],["7095 Cotisations ordres professionnels",19900],["7201 Taxes et permis administration",10700],["7200 Taxes et permis production",28100],["7500 Loyer administration",20100],["7505 Électricité administration",8200],["7510 Assurances vie",22200],["7020 Assurances matériel roulant",29400],["7025 Assurances bâtiments",4400],["7515 Téléphone",27900],["7520 Papeterie et département de bureau",35300],["7530 Honoraires juridiques",11200],["7535 Honoraires comptabilité",31200],["7540 Honoraires professionnels",19200],["7545 Amortissement mobilier bureau",7000],["7550 Amortissement systèmes informatiques",2700],["7605 à 7650 Salaires et charges administration",10200],["7652 Frais mutuelle CNESST",36000],["7720 Frais de formation",39100],["Autres frais d'administration",22100]]]];
var EF_VT = [
 ["Livraisons et déplacements",[["7055 Dépenses autos",37600],["7075 Location matériel roulant",39600],["7085 Messagerie",25400],["7090 Frais d'expédition",36600]]],
 ["Publicité et promotion",[["7705 Frais de représentation",19700],["7700 Frais événements spéciaux",26100],["7710 Frais de congrès",16400],["7716 Promotion",29300],["7715 Publicité",20900]]]];
var EF_F = [
 ["Frais financiers",[["7820 Intérêts et frais de banque",1700],["7825 Frais bancaires fixe",14300],["7830 Frais sur cartes de crédit",18400],["7840 Intérêts sur marge de crédit",10700],["7856 Intérêts sur la dette à long terme",14900]]]];
var EF_AR = [["Autres revenus",[["4510 Revenu livraison",1100],["4520 Revenus d'intérêts clients",2100]]]];
var EF_IMP = [["Impôts",[["7910 Impôts futurs",30500]]]];
function efMontant(n){ var s = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); return n < 0 ? "(" + s + ")" : s; }
function efSomme(sub){ var t = 0; sub.forEach(function(x){ t += x[1]; }); return t; }
function efTotal(gs){ var t = 0; gs.forEach(function(g){ t += efSomme(g[1]); }); return t; }
function efOuvrir(){
  var vt = efTotal(EF_V), cout = efTotal(EF_C), brut = vt - cout, adm = efTotal(EF_A), vente = efTotal(EF_VT), fin = efTotal(EF_F);
  var expl = brut - adm - vente - fin, ar = efTotal(EF_AR), avant = expl + ar, imp = efTotal(EF_IMP), net = avant - imp;
  var sal = efTotal(EF_C.slice(0, 5)), ach = efSomme(EF_C[5][1]), fgx = efSomme(EF_C[6][1]);
  function pct(n){ return Math.round(n / vt * 100) + " %"; }
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
      '<div class="efl efh"><span></span><span>2026</span><span>% des ventes</span></div>' + blocs(gs) + (fins || "");
  }
  var h = '<div class="page ppx fin ef"><h1>États financiers</h1>' +
    '<div class="efsel"><span>2026</span><span>1 janv.</span><span>9 nov.</span></div>' +
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
      return '<div class="efl"><span class="n">' + r[0] + '</span><span></span><span>' + pct(r[1]) + '</span></div>'; }).join("");
  h += '<a class="retour" href="#" id="retour">Retour</a></div>';
  app.innerHTML = h;
  Array.prototype.forEach.call(document.querySelectorAll(".efr"), function(r){
    r.onclick = function(){ var o = r.classList.toggle("o"); r.querySelector(".efm").textContent = o ? "\u2212" : "+"; };
  });
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); financesMenu(); };
}
