// Finance (Conseil: pourcentages seulement; Finances, Direction: avec montants). Les chiffres viennent de QuickBooks par le service (finance_mensuel), aucun montant dans ce code.
var FIN_MOIS = ["JANV.","FÉVR.","MARS","AVR.","MAI","JUIN","JUIL.","AOÛT","SEPT.","OCT.","NOV.","DÉC."];
var FIN_MOIS_LONG = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
var FIN_TITRE = "Indicateurs", FIN_R = null, FIN_DERNIER = 0, FIN_PERIODE = "A", FIN_TOK = 0, FIN_S = null;
function finCharger(ok){
  var tok = ++FIN_TOK, vu = false;
  var tm = setTimeout(function(){ if(tok !== FIN_TOK) return; vu = true;
    app.innerHTML = '<div class="page ppx fin"><div class="pph"><h1>' + FIN_TITRE + '</h1></div><a class="retour" href="#" id="retour">Retour</a></div>';
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); FIN_TOK++; finRetour(); }; }, 250);
  function echec(m){ clearTimeout(tm); if(tok !== FIN_TOK) return;
    app.innerHTML = '<div class="page ppx fin"><div class="pph"><h1>' + FIN_TITRE + '</h1></div><div class="bandeau">▪ ' + m + ' · RÉESSAYEZ</div><a class="retour" href="#" id="retour">Retour</a></div>';
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); FIN_TOK++; finRetour(); }; }
  var fini = false;
  function recu(r){
    if(fini || tok !== FIN_TOK) return;
    if(r && r.ok && r.mois && r.mois.length){ fini = true; clearTimeout(tm); if(typeof efNettoyer === "function") efNettoyer(r); FIN_R = r; finPreparer(r); ok(r); }
    else if(r && r.erreur){ fini = true; echec(String(r.erreur).toUpperCase()); }
  }
  appelService({action: "finance_mensuel", session: sessionGardee()}).then(recu).catch(function(){});
  // Si la lecture préchargée traîne dans la file, un appel direct (clic) part après 5 s; au bout de 40 s: message d'erreur
  setTimeout(function(){ if(!fini && tok === FIN_TOK) appelBrut({action: "finance_mensuel", session: sessionGardee()}).then(recu).catch(function(){}); }, 5000);
  setTimeout(function(){ if(!fini && tok === FIN_TOK){ fini = true; echec("INDISPONIBLE"); } }, 40000);
}
function finCodes(r, a, b){ var o = []; Object.keys(r.comptes).forEach(function(k){ if(+k >= a && +k <= b) o.push(r.comptes[k]); }); return o; }
function finSomme(n, listes){ var t = [], i; for(i=0;i<n;i++){ t[i] = 0; listes.forEach(function(l){ t[i] += (l && l[i]) || 0; }); } return t; }
function finPreparer(r){
  var n = r.mois.length, o = r.objectifs || {}, T = r.totaux || {};
  FIN_DERNIER = n - 1;
  var ventes = (T["Total des revenus"] || finSomme(n, finCodes(r, 4000, 4999))).slice(0, n);
  var cout = (T["Total du coût des marchandises vendues"] || finSomme(n, finCodes(r, 5000, 7199)));
  var marge = ventes.map(function(v, i){ return v - (cout[i] || 0); });
  var achat = finSomme(n, finCodes(r, 6110, 6200));
  var cats = [["Fixe", finSomme(n, finCodes(r, 5105, 5290))], ["Acrylique", finSomme(n, finCodes(r, 5405, 5490))], ["Pièce", finSomme(n, finCodes(r, 5305, 5390))], ["Gestion", finSomme(n, finCodes(r, 5705, 5790))]];
  var sal = finSomme(n, cats.map(function(c){ return c[1]; }));
  var rep = [["Fixe", finSomme(n, [].concat(finCodes(r, 4100, 4210)))], ["Acrylique", finSomme(n, finCodes(r, 4400, 4410))], ["Pièces", finSomme(n, finCodes(r, 4300, 4300))], ["Ortho", finSomme(n, finCodes(r, 4430, 4430))]];
  var repTot = finSomme(n, rep.map(function(c){ return c[1]; }));
  function L(nom, num, den, obj){ return {n: nom, num: num, den: den, obj: (obj === undefined ? null : obj)}; }
  FIN_S = {ventes: ventes, marge: marge, achat: achat, sal: sal,
    sections: [
      {t: "Principaux indicateurs", l: [L("Achat", achat, ventes, o.achat), L("Marge brute", marge, ventes, o.marge), L("Salaires totaux", sal, ventes, o.salaires)]},
      {t: "Salaire", l: cats.map(function(c){ return L(c[0], c[1], ventes); }).concat([L("Total", sal, ventes, o.salaires)])},
      {t: "Répartition des ventes", l: rep.map(function(c){ return L(c[0], c[1], repTot); })}]};
}
function finSom(a, ms){ var t = 0; ms.forEach(function(m){ t += (a[m] || 0); }); return t; }
function finRatio(l, ms){ var d = finSom(l.den, ms); return d ? finSom(l.num, ms) / d * 100 : 0; }
function finMois(p){
  var r=[], i, a, b;
  if(p === "A"){ a=0; b=FIN_DERNIER; }
  else if(p.charAt(0) === "T"){ var q = +p.charAt(1)-1; a = q*3; b = Math.min(q*3+2, FIN_DERNIER); }
  else { a = b = +p.slice(1); }
  if(a > FIN_DERNIER) return [];
  for(i=a;i<=b;i++) r.push(i);
  return r;
}
function finPct(v){ return (Math.round(v) === 0 ? 0 : Math.round(v)) + " %"; }
function finEcart(v){ var n = Math.round(v); return n > 0 ? "+" + n : String(n); }
function finMontant(v){ return Math.round(v).toLocaleString("fr-CA").replace(/ /g, " ") + " $"; }
function finDate(){ var d = new Date(FIN_R && FIN_R.maj); if(isNaN(d.getTime())) d = new Date(); return d.getDate() + " " + FIN_MOIS_LONG[d.getMonth()]; }
function finRendu(){
  var ms = finMois(FIN_PERIODE), h = "";
  var der = ms.length ? ms[ms.length-1] : null;
  var cols = '<div class="fincols"><span></span><span>MOY.</span><span>' + (der === null ? "" : FIN_MOIS[der]) + '</span><span>OBJ.</span><span>ÉCART</span></div>';
  FIN_S.sections.forEach(function(s, i){
    h += '<div class="sect"><span class="num">0' + (i+1) + '</span><span class="lab">' + s.t + '</span></div>' + (i === 0 ? cols : '');
    s.l.forEach(function(l){
      var moy = ms.length ? finRatio(l, ms) : null, dv = der === null ? null : finRatio(l, [der]);
      h += '<div class="finl"><span class="n">▪ ' + l.n + '</span><span>' + (moy === null ? "—" : finPct(moy)) + '</span><span>' + (dv === null ? "—" : finPct(dv)) + '</span>' +
        '<span class="obj">' + (l.obj === null ? "" : l.obj + " %") + '</span><span>' + (l.obj === null || moy === null ? "" : finEcart(Math.round(moy) - l.obj)) + '</span></div>';
      if(l.n === "Achat" && FIN_R && FIN_R.achatsFourn && FIN_R.achatsFourn.top && FIN_R.achatsFourn.top.length){
        var af = FIN_R.achatsFourn;
        h += '<a class="fglnk" href="#" data-k="achat">Voir les 15 plus gros fournisseurs</a><div class="fgtop" id="fgtop_achat" hidden>';
        af.top.forEach(function(x, i){ h += '<div class="fgtl fgtl3"><span>' + (i+1) + '. ' + String(x[0]).replace(/[<>&]/g, "") + '</span><span>' + finMontant(x[1]) + '</span><span>' + (af.total ? finPct(x[1] / af.total * 100) : "") + '</span></div>'; });
        h += '</div>';
      }
    });
  });
  h += '<div class="finnote">Données au ' + finDate() + ' · Écart en points</div>';
  document.getElementById("fin_corps").innerHTML = h;
  finLiens();
}
function finLiens(){   // boutons « Voir les … comptes » (lien souligné vert): ouvre ou referme la liste qui suit
  Array.prototype.forEach.call(document.querySelectorAll(".fglnk"), function(a){
    var n = a.getAttribute("data-k") === "achat" ? 15 : 10;
    a.onclick = function(e){ e.preventDefault(); var d = document.getElementById("fgtop_" + a.getAttribute("data-k")), ouvre = d.hidden; d.hidden = !ouvre; a.textContent = ouvre ? (n === 15 ? "Masquer les fournisseurs" : "Masquer les comptes") : (n === 15 ? "Voir les 15 plus gros fournisseurs" : "Voir les 10 comptes"); }; });
}
function financeOuvrir(){
  FIN_TITRE = "Indicateurs";
  finCharger(function(){
    var o = '<option value="A">Année ' + FIN_R.annee + '</option>', i;
    for(i=1;i<=4;i++) if((i-1)*3 <= FIN_DERNIER) o += '<option value="T' + i + '">Trimestre ' + i + '</option>';
    for(i=0;i<=FIN_DERNIER;i++) o += '<option value="M' + i + '">' + FIN_MOIS_LONG[i].charAt(0).toUpperCase() + FIN_MOIS_LONG[i].slice(1) + ' ' + FIN_R.annee + '</option>';
    app.innerHTML = '<div class="page ppx fin"><div class="pph"><h1>' + FIN_TITRE + '</h1></div>' +
      '<div class="finsous">' + (FIN_ORIGINE === "finances" ? "Finances" : "Conseil d\'administration") + '</div>' +
      '<select class="finsel" id="fin_sel">' + o + '</select><div id="fin_corps"></div>' +
      '<a class="retour" href="#" id="retour">Retour</a></div>';
    FIN_PERIODE = "A"; finRendu();
    document.getElementById("fin_sel").onchange = function(){ FIN_PERIODE = this.value; finRendu(); };
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); finRetour(); };
  });
}

// ===== Graphiques d'analyse (Direction seulement), mêmes sélecteurs Mois | Trimestre | Année =====
var FG = {act:"A", m:0, t:0, a:2026};
var FG_MM = ["J","F","M","A","M","J","J","A","S","O","N","D"];
function fgPlage(){   // [début, fin] des mois affichés (0 = janvier)
  if(FG.act === "M") return [0, Math.min(FG.m, FIN_DERNIER)];
  if(FG.act === "T") return [0, Math.min(FG.t*3+2, FIN_DERNIER)];
  return [0, FIN_DERNIER];
}
function fgSel(){
  var mois = "", tr = "", i;
  for(i=0;i<=FIN_DERNIER;i++) mois += '<option value="'+i+'"'+(FG.m===i?' selected':'')+'>'+FIN_MOIS_LONG[i].charAt(0).toUpperCase()+FIN_MOIS_LONG[i].slice(1)+' '+FIN_R.annee+'</option>';
  var TN = ["1er","2e","3e","4e"];
  for(i=0;i<4;i++) if(i*3 <= FIN_DERNIER) tr += '<option value="'+i+'"'+(FG.t===i?' selected':'')+'>'+TN[i]+' trim. '+FIN_R.annee+'</option>';
  var an = '<option value="'+FIN_R.annee+'" selected>'+FIN_R.annee+'</option>';
  function bloc(cle, lib, opts){ return '<label class="fgb'+(FG.act===cle?' on':'')+'"><span>'+lib+'</span><select data-k="'+cle+'">'+opts+'</select></label>'; }
  return '<div class="fgsel">'+bloc("M","Mois",mois)+bloc("T","Trimestre",tr)+bloc("A","Année",an)+'</div>';
}
function fgLigne(vals, x0, dx, y, dash, w){
  var d = vals.map(function(v,i){ return (i?"L":"M")+(x0+i*dx).toFixed(1)+" "+y(v).toFixed(1); }).join(" ");
  return '<path d="'+d+'" fill="none" stroke="#0D1319" stroke-width="'+(w||1.6)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
}
function fgAxeY(vals, y, W, unite){
  return vals.map(function(v){ return '<line x1="34" x2="'+W+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#bdb9ae" stroke-width="1"/><text x="0" y="'+(y(v)+3)+'">'+v+unite+'</text>'; }).join("");
}
function fgGraphique(type){
  var p = fgPlage(), W = 340, s = "", n, i, R = FIN_R;
  if(type === "ratios"){
    var H = 200, y = function(v){ return 10+(60-v)/60*(H-20); };
    var nq = Math.floor(p[1]/3)+1, idx = []; for(i=0;i<nq;i++) idx.push(i);
    function ser(num){ return idx.map(function(k){ var ms = [], m; for(m=k*3;m<=Math.min(k*3+2,p[1]);m++) ms.push(m); var d = finSom(FIN_S.ventes, ms); return d ? Math.max(0, finSom(num, ms)/d*100) : 0; }); }
    n = idx.length; var dx = n > 1 ? (W-110-34)/(n-1) : 0, x0 = 40, o = R.objectifs || {};
    s += fgAxeY([0,20,40,60], y, W-70, " %");
    [["marge","marge"],["sal","salaires"],["ach","achat"]].forEach(function(k){ if(o[k[1]] != null) s += '<line x1="34" x2="'+(W-70)+'" y1="'+y(o[k[1]])+'" y2="'+y(o[k[1]])+'" stroke="#9a8c7e" stroke-width="1" stroke-dasharray="1 3"/>'; });
    var ms2 = ser(FIN_S.marge), ss = ser(FIN_S.sal), as = ser(FIN_S.achat);
    s += fgLigne(ms2,x0,dx,y,"",1.8)+fgLigne(ss,x0,dx,y,"5 3",1.8)+fgLigne(as,x0,dx,y,"1.5 2",2.2);
    s += '<text x="'+(W-72)+'" y="'+(y(ms2[n-1])+3)+'" class="fgl">Marge brute</text><text x="'+(W-72)+'" y="'+(y(ss[n-1])+3+(Math.abs(y(ss[n-1])-y(ms2[n-1]))<12?12:0))+'" class="fgl">Salaires</text><text x="'+(W-72)+'" y="'+(y(as[n-1])+3)+'" class="fgl">Achats</text>';
    for(i=0;i<n;i++) s += '<text x="'+(x0+i*dx)+'" y="'+(H+10)+'" text-anchor="middle">T'+(i+1)+'</text>';
    return '<svg class="finsvg" viewBox="0 0 '+W+' '+(H+16)+'">'+s+'</svg><div class="finnote">Plein : marge brute · Tirets : salaires · Points : achats<br>Pointillé gris : objectif de chaque ratio · Données au ' + finDate() + '</div>';
  }
  if(type === "ventes"){
    return '<div class="finnote">La comparaison avec l\'an passé sera disponible en 2027. QuickBooks est utilisé depuis le 1er janvier 2026.</div>';
  }
  if(type === "tres"){
    var cn = p[1]-p[0]+1, sol = (R.tresorerie || []).slice(p[0], p[1]+1).map(function(v){ return v/1000; }), fl = (R.flux || []).slice(p[0], p[1]+1).map(function(v){ return v/1000; });
    if(!sol.length) return '<div class="finnote">Aucune donnée de trésorerie pour cette période.</div>';
    var ve = FIN_S.ventes.slice(p[0], p[1]+1).map(function(v){ return v/1000; }), so = ve.map(function(v, k){ return Math.max(0, v-(fl[k] || 0)); });
    var mxv = Math.max.apply(null, ve.concat(so).concat([1])), pas = [5,10,25,50,100,250,500].filter(function(q){ return mxv/q <= 4; })[0] || 500, hi = Math.ceil(mxv/pas)*pas;
    var L0 = 44, base = 190, yy = function(v){ return base-v/hi*170; }, gw = (W-L0)/cn, bw = Math.min(14, gw/2-2), k;
    for(k=0;k<=hi;k+=pas) s += '<line x1="'+L0+'" x2="'+W+'" y1="'+yy(k)+'" y2="'+yy(k)+'" stroke="#bdb9ae" stroke-width="1"/><text x="0" y="'+(yy(k)+3)+'">'+k+' k$</text>';
    for(i=0;i<cn;i++){ var xc = L0+i*gw+gw/2, he = ve[i]/hi*170, hs = so[i]/hi*170;
      s += '<rect x="'+(xc-bw-.5)+'" y="'+(base-he)+'" width="'+bw+'" height="'+he+'" fill="#0D1319"/><rect x="'+(xc+1)+'" y="'+(base-hs)+'" width="'+(bw-1.5)+'" height="'+hs+'" fill="none" stroke="#0D1319" stroke-width="1.5"/>';
      s += '<text x="'+xc+'" y="206" text-anchor="middle">'+FG_MM[p[0]+i]+'</text>'; }
    s += '<line x1="'+L0+'" x2="'+W+'" y1="'+base+'" y2="'+base+'" stroke="#0D1319"/>';
    var z = cn-1, mc = (R.margeCredit || [])[p[1]], note = (mc || mc === 0) ? '<br>Marge de crédit utilisée : ' + finMontant(Math.abs(mc)) : '';
    var cartes = '<div class="fgcards"><div><small>ENTRÉES</small><b>'+finMontant(ve[z]*1000)+'</b></div><div><small>SORTIES</small><b>'+finMontant(so[z]*1000)+'</b></div><div class="g"><small>RESTE</small><b>'+finMontant((fl[z] || 0)*1000)+'</b></div></div>';
    return cartes + '<svg class="finsvg" viewBox="0 0 '+W+' 214">'+s+'</svg><div class="finnote">Plein : entrées (argent encaissé) · Vide : sorties (argent payé)<br>Solde en banque : ' + finMontant(sol[z]*1000) + note + '</div>';
  }
  var c = R.clients, h = "";
  if(!c) return '<div class="finnote">Aucune donnée de comptes clients.</div>';
  var tot = c.total || 0, tp = c.top || {}, bk = [["Courant et 1-30 jours", c.courant + c.t30, ""], ["31-60 jours", c.t60, "t60"], ["61-90 jours", c.t90, "t90"], ["Plus de 90 jours", c.plus, "plus"]];
  bk.forEach(function(b){
    h += '<div class="fgcl"><div class="fgcn"><span>▪ '+b[0]+'</span><span>'+finMontant(b[1])+'</span></div><div class="fgbar"><i style="width:'+(tot ? Math.max(0, Math.round(b[1]/tot*100)) : 0)+'%"></i></div>';
    var l = b[2] && tp[b[2]];
    if(l && l.length){
      h += '<a class="fglnk" href="#" data-k="'+b[2]+'">Voir les 10 comptes</a><div class="fgtop" id="fgtop_'+b[2]+'" hidden>';
      l.forEach(function(x, i){ h += '<div class="fgtl"><span>'+(i+1)+'. '+String(x[0]).replace(/[<>&]/g, "")+'</span><span>'+finMontant(x[1])+'</span></div>'; });
      h += '</div>';
    }
    h += '</div>';
  });
  return h + '<div class="finnote">Total à recevoir : '+finMontant(tot)+' · '+(tot ? Math.round(c.plus/tot*100) : 0)+' % depuis plus de 90 jours</div>';
}
var FG_PAGES = {ratios:["01","Ratios vs objectifs","Marge brute, salaires et achats, en % des ventes"], ventes:["02","Ventes vs an passé","Disponible en 2027"], tres:["03","Trésorerie","Ce qui est entré, ce qui est sorti, chaque mois"], cli:["04","Comptes clients","À recevoir selon l'ancienneté de la facture"]};
function financeGraphique(type){
  var pg = FG_PAGES[type];
  FIN_TITRE = {ratios: "Ratios par catégorie", ventes: "Ventes vs an passé", tres: "Trésorerie", cli: "Comptes clients"}[type];
  finCharger(function(){
    var sel = (type === "ventes" || type === "cli") ? "" : fgSel();
    app.innerHTML = '<div class="page ppx fin"><div class="pph"><h1>' + FIN_TITRE + '</h1></div><div class="finsous">' + (FIN_ORIGINE === "finances" ? "Finances" : "Conseil d\'administration") + '</div>' +
      '<div class="sect"><span class="num">'+pg[0]+'</span><span class="lab">'+pg[1]+'</span></div><div class="fgdesc">'+pg[2]+'</div>' + sel + fgGraphique(type) +
      '<a class="retour" href="#" id="retour">Retour</a></div>';
    Array.prototype.forEach.call(document.querySelectorAll(".fgsel select"), function(el){
      el.onchange = function(){ var k = el.getAttribute("data-k"), v = +el.value; FG.act = k;
        if(k === "M"){ FG.m = v; FG.t = Math.floor(v/3); } else if(k === "T"){ FG.t = v; FG.m = Math.min(v*3+2, FIN_DERNIER); }
        financeGraphique(type); }; });
    finLiens();
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); finRetour(); };
  });
}
var FIN_ORIGINE = "conseil";
function finRetour(){ if(FIN_ORIGINE === "finances") financesMenu(); else financeMenu(); }
// Conseil d'administration: Production, Indicateurs et ratios par catégorie (sans montants)
function finOk(id){ var pid = /^conseil_/.test(id) ? "conseil" : (/^finances_/.test(id) ? "finances" : id); return typeof entreeOk === "function" && ENT_PAR_ID[pid] ? entreeOk(ENT_PAR_ID[pid]) : true; }   // une sous-page suit le droit de son onglet d'accueil
function financeMenu(){
  FIN_ORIGINE = "conseil";
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Conseil d\'administration</h1>' +
    (finOk("conseil_production") ? '<a class="doc" href="#" id="fm5"><span>'+picto("Production")+'Production</span></a>' : '')+(finOk("conseil_indicateurs") ? '<a class="doc" href="#" id="fm0"><span>'+picto("Indicateurs")+'Indicateurs</span></a>' : '')+(finOk("conseil_ratios") ? '<a class="doc" href="#" id="fm1"><span>'+picto("Ratios par catégorie")+'Ratios en %</span></a>' : '')+'</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  var f5 = document.getElementById("fm5"); if(f5) f5.onclick = function(e){ e.preventDefault(); productionOuvrir(); };
  var f0 = document.getElementById("fm0"); if(f0) f0.onclick = function(e){ e.preventDefault(); financeOuvrir(); };
  var f1 = document.getElementById("fm1"); if(f1) f1.onclick = function(e){ e.preventDefault(); financeGraphique("ratios"); };
}
// Finances (Direction): tout le financier, y compris la copie des ratios par catégorie avec montants
function financesMenu(){
  FIN_ORIGINE = "finances";
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Finances</h1>' +
    '<a class="doc" href="#" id="fi5"><span>'+picto("États financiers")+'États financiers</span></a><a class="doc" href="#" id="fi0"><span>'+picto("Indicateurs")+'Indicateurs</span></a><a class="doc" href="#" id="fi1"><span>'+picto("Ratios par catégorie")+'Ratios en $</span></a><a class="doc" href="#" id="fi2"><span>'+picto("Ventes vs an passé")+'Ventes vs an passé</span></a><a class="doc" href="#" id="fi3"><span>'+picto("Trésorerie")+'Trésorerie</span></a><a class="doc" href="#" id="fi4"><span>'+picto("Comptes clients")+'Comptes clients</span></a><a class="doc" href="#" id="fi6"><span>'+picto("Top 10 clients")+'Top 10 clients</span></a></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  document.getElementById("fi0").onclick = function(e){ e.preventDefault(); FIN_ORIGINE = "finances"; financeOuvrir(); };
  document.getElementById("fi1").onclick = function(e){ e.preventDefault(); financesRatios(); };
  [["fi2","ventes"],["fi3","tres"],["fi4","cli"]].forEach(function(a){ document.getElementById(a[0]).onclick = function(e){ e.preventDefault(); FIN_ORIGINE = "finances"; financeGraphique(a[1]); }; });
  document.getElementById("fi5").onclick = function(e){ e.preventDefault(); efOuvrir(); };
  document.getElementById("fi6").onclick = function(e){ e.preventDefault(); FIN_ORIGINE = "finances"; financeTop10(); };
}
// Top 10 clients (Direction): les 10 clients aux ventes les plus élevées depuis le 1er janvier, avec leur part des ventes
function financeTop10(){
  FIN_TITRE = "Top 10 clients"; FIN_ORIGINE = "finances";
  finCharger(function(r){
    var vc = r.ventesClients, h = '<div class="page ppx fin"><div class="pph"><h1>Top 10 clients</h1></div><div class="finsous">Finances</div>' +
      '<div class="sect"><span class="num">01</span><span class="lab">Meilleurs clients</span></div>';
    if(vc && vc.top && vc.top.length){
      var tot = finSom(FIN_S.ventes, finMois("A")) || vc.total;
      h += '<div class="fgdesc">Ventes du 1er janvier au ' + finDate() + '</div><div class="fgtl fgtl3 fgth"><span></span><span>VENTES</span><span>PART</span></div>';
      vc.top.forEach(function(x, i){ h += '<div class="fgtl fgtl3 fgtv"><span>' + (i+1) + '. ' + String(x[0]).replace(/[<>&]/g, "") + '</span><span>' + finMontant(x[1]) + '</span><span>' + (tot ? finPct(x[1] / tot * 100) : "") + '</span></div>'; });
    } else h += '<div class="finnote">Les ventes par client arrivent dès que QuickBooks les fournit à l\'application.</div>';
    h += '<a class="retour" href="#" id="retour">Retour</a></div>';
    app.innerHTML = h;
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); finRetour(); };
  });
}
// Copie des ratios par catégorie avec les montants (Direction seulement), de janvier à la date des données
function financesRatios(){
  FIN_ORIGINE = "finances"; FIN_TITRE = "Ratios par catégorie";
  finCharger(function(){
    var ms = finMois("A");
    var h = '<div class="page ppx fin"><a class="retour" href="#" id="retour">Retour</a><h1>Ratios par catégorie</h1><div class="finnote">Pourcentage des ventes et montant, du 1er janvier au ' + finDate() + '</div>';
    FIN_S.sections.forEach(function(sec, i){
      h += '<div class="sect"><span class="num">0'+(i+1)+'</span><span class="lab">'+sec.t+'</span></div><div class="fincols m"><span></span><span>%</span><span>MONTANT</span></div>';
      sec.l.forEach(function(l){ h += '<div class="finl m"><span class="n">▪ '+l.n+'</span><span>'+finPct(finRatio(l, ms))+'</span><span>'+finMontant(finSom(l.num, ms))+'</span></div>'; });
    });
    h += '<a class="retour" href="#" id="retour2">Retour</a></div>';
    app.innerHTML = h;
    document.getElementById("retour").onclick = document.getElementById("retour2").onclick = function(e){ e.preventDefault(); financesMenu(); };
  });
}
