// Conseil d'administration > Finance (Direction seulement): reprend l'onglet FINANCE du classeur « Conseil d'administration ».
// Données FICTIVES pour l'instant; la vraie lecture se branchera plus tard (feuille de données, service).
var FIN_MOIS = ["JANV.","FÉVR.","MARS","AVR.","MAI","JUIN","JUIL.","AOÛT","SEPT.","OCT.","NOV.","DÉC."];
var FIN_MOIS_LONG = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
// Sections et lignes: [libellé, MOY. année, dernier mois, objectif ou null]
var FIN_SECTIONS = [
 {t:"Principaux indicateurs", l:[["Achat",14,10,15],["Marge brute",33,44,35],["Salaires totaux",40,34,42],["Ventes vs budget",-6,-17,null],["Ventes vs an passé",5,-14,null]]},
 {t:"Salaire", l:[["Fixe",8,6,null],["Acrylique",14,12,null],["Pièce",14,12,null],["Gestion",5,4,null],["Total",40,34,42]]},
 {t:"Répartition des ventes", l:[["Fixe",25,24,32],["Acrylique",35,36,32],["Pièces",39,37,32],["Ortho",2,3,2]]}];
var FIN_DERNIER = 9;   // dernier mois saisi (octobre), 0 = janvier
var FIN_PAT = [1,-1,2,-2,0,1,-1,2,-2];
var FIN_PERIODE = "A";
function finValeur(ligne, m){   // valeur fictive d'un mois (le dernier mois saisi = la valeur du tableau)
  if(m === FIN_DERNIER) return ligne[2];
  var b = (ligne[1]*(FIN_DERNIER+1) - ligne[2]) / FIN_DERNIER;
  return b + FIN_PAT[m % FIN_PAT.length] * (Math.abs(ligne[1]) > 20 ? 1 : 0.5);
}
function finMois(p){   // liste des mois de la période choisie
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
function finRendu(){
  var ms = finMois(FIN_PERIODE), h = "";
  var der = ms.length ? ms[ms.length-1] : null;
  var cols = '<div class="fincols"><span></span><span>MOY.</span><span>' + (der === null ? "" : FIN_MOIS[der]) + '</span><span>OBJ.</span><span>ÉCART</span></div>';
  FIN_SECTIONS.forEach(function(s, i){
    h += '<div class="sect"><span class="num">0' + (i+1) + '</span><span class="lab">' + s.t + '</span></div>' + (i === 0 ? cols : '');
    s.l.forEach(function(l){
      var moy = 0; ms.forEach(function(m){ moy += finValeur(l, m); }); moy = ms.length ? moy / ms.length : null;
      var dv = der === null ? null : finValeur(l, der);
      h += '<div class="finl"><span class="n">▪ ' + l[0] + '</span><span>' + (moy === null ? "—" : finPct(moy)) + '</span><span>' + (dv === null ? "—" : finPct(dv)) + '</span>' +
        '<span class="obj">' + (l[3] === null ? "" : l[3] + " %") + '</span><span>' + (l[3] === null || moy === null ? "" : finEcart(Math.round(moy) - l[3])) + '</span></div>';
    });
  });
  h += '<div class="finnote">Dernier mois saisi : ' + FIN_MOIS_LONG[FIN_DERNIER] + ' · Écart en points</div>';
  document.getElementById("fin_corps").innerHTML = h;
}
function financeOuvrir(){
  var o = '<option value="A">Année 2026</option>', i;
  for(i=1;i<=4;i++) o += '<option value="T' + i + '">Trimestre ' + i + '</option>';
  for(i=0;i<=FIN_DERNIER;i++) o += '<option value="M' + i + '">' + FIN_MOIS_LONG[i].charAt(0).toUpperCase() + FIN_MOIS_LONG[i].slice(1) + ' 2026</option>';
  app.innerHTML = '<div class="page ppx fin"><div class="pph"><h1>Finance</h1></div>' +
    '<div class="finsous">Conseil d\'administration <span class="b2n">EXEMPLE</span></div>' +
    '<select class="finsel" id="fin_sel">' + o + '</select><div id="fin_corps"></div>' +
    '<a class="retour" href="#" id="retour">Retour</a></div>';
  FIN_PERIODE = "A"; finRendu();
  document.getElementById("fin_sel").onchange = function(){ FIN_PERIODE = this.value; finRendu(); };
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); finRetour(); };
}

// ===== Graphiques d'analyse (Direction seulement) — données FICTIVES, même sélecteur Mois | Trimestre | Année =====
var FG = {act:"T", m:9, t:3, a:2026};
var FG_MM = ["J","F","M","A","M","J","J","A","S","O","N","D"];
var FG_D = {   // janvier à octobre 2026 (fictif)
  marge:[30,31,33,29,34,32,36,35,38,44], sal:[41,42,40,43,41,40,38,37,36,34], ach:[16,15,15,14,14,15,13,12,11,10],
  v26:[52,60,82,72,78,66,50,64,84,70], v25:[48,58,76,74,80,88,52,82,80,90],
  solde:[118,124,121,130,126,133,127,122,131,137], flux:[6,6,-3,9,-4,7,-6,-7,9,6],
  cli:[["0-30 jours",62.4],["31-60 jours",21.8],["61-90 jours",9.3],["Plus de 90 jours",4.1]]};
var FG_OBJ = {marge:35, sal:42, ach:15};
function fgPlage(){   // [début, fin] des mois affichés (0 = janvier)
  if(FG.act === "M") return [0, FG.m];
  if(FG.act === "T") return [0, Math.min(FG.t*3+2, 9)];
  return [0, 9];
}
function fgSel(){
  var mois = "", tr = "", an = "", i;
  for(i=0;i<=9;i++) mois += '<option value="'+i+'"'+(FG.m===i?' selected':'')+'>'+FIN_MOIS_LONG[i].charAt(0).toUpperCase()+FIN_MOIS_LONG[i].slice(1)+' 2026</option>';
  var TN = ["1er","2e","3e","4e"];
  for(i=0;i<4;i++) tr += '<option value="'+i+'"'+(FG.t===i?' selected':'')+'>'+TN[i]+' trim. 2026</option>';
  an += '<option value="2026" selected>2026</option><option value="2025">2025</option>';
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
  var p = fgPlage(), W = 340, s = "", n, i;
  if(type === "ratios"){
    var H = 200, y = function(v){ return 10+(60-v)/60*(H-20); }, lab;
    var an = true;
    var idx = []; for(i=0;i<=Math.floor(p[1]/3);i++) idx.push(i);
    function ser(a){ return idx.map(function(k){ if(an){ var q=a.slice(k*3,Math.min(k*3+3,10)); return q.reduce(function(x,z){return x+z},0)/q.length; } return a[k]; }); }
    n = idx.length; var dx = n > 1 ? (W-110-34)/(n-1) : 0, x0 = 40;
    s += fgAxeY([0,20,40,60], y, W-70, " %");
    ["marge","sal","ach"].forEach(function(k){ s += '<line x1="34" x2="'+(W-70)+'" y1="'+y(FG_OBJ[k])+'" y2="'+y(FG_OBJ[k])+'" stroke="#9a8c7e" stroke-width="1" stroke-dasharray="1 3"/>'; });
    var ms = ser(FG_D.marge), ss = ser(FG_D.sal), as = ser(FG_D.ach);
    s += fgLigne(ms,x0,dx,y,"",1.8)+fgLigne(ss,x0,dx,y,"5 3",1.8)+fgLigne(as,x0,dx,y,"1.5 2",2.2);
    s += '<text x="'+(W-72)+'" y="'+(y(ms[n-1])+3)+'" class="fgl">Marge brute</text><text x="'+(W-72)+'" y="'+(y(ss[n-1])+3+(Math.abs(y(ss[n-1])-y(ms[n-1]))<12?12:0))+'" class="fgl">Salaires</text><text x="'+(W-72)+'" y="'+(y(as[n-1])+3)+'" class="fgl">Achats</text>';
    for(i=0;i<n;i++) s += '<text x="'+(x0+i*dx)+'" y="'+(H+10)+'" text-anchor="middle">'+(an?"T"+(i+1):FG_MM[idx[i]])+'</text>';
    return '<svg class="finsvg" viewBox="0 0 '+W+' '+(H+16)+'">'+s+'</svg><div class="finnote">Plein : marge brute · Tirets : salaires · Points : achats<br>Pointillé gris : objectif de chaque ratio</div>';
  }
  if(type === "ventes"){
    var H2 = 200, y2 = function(v){ return 10+(120-v)/80*(H2-20); };
    var cnt = p[1]-p[0]+1, d2 = cnt > 1 ? (W-60)/(cnt-1) : 0;
    s += fgAxeY([40,80,120], y2, W, " k$");
    s += fgLigne(FG_D.v25.slice(p[0],p[1]+1),44,d2,y2,"4 3",1.4)+fgLigne(FG_D.v26.slice(p[0],p[1]+1),44,d2,y2,"",1.8);
    for(i=0;i<cnt;i++) s += '<text x="'+(44+i*d2)+'" y="'+(H2+10)+'" text-anchor="middle">'+FG_MM[p[0]+i]+'</text>';
    return '<svg class="finsvg" viewBox="0 0 '+W+' '+(H2+16)+'">'+s+'</svg><div class="finnote">Plein : 2026 · Tirets gris : 2025</div>';
  }
  if(type === "tres"){
    var cn = p[1]-p[0]+1, d3 = cn > 1 ? (W-60)/(cn-1) : 0, y3 = function(v){ return 10+(140-v)/40*110; };
    s += fgAxeY([100,120,140], y3, W, " k$");
    s += fgLigne(FG_D.solde.slice(p[0],p[1]+1),44,d3,y3,"",1.8);
    s += '<text x="0" y="140" class="fgl">Flux net du mois</text>';
    var z = 185, bw = Math.min(16, cn > 1 ? d3*0.5 : 16);
    for(i=0;i<cn;i++){ var f = FG_D.flux[p[0]+i], h = Math.abs(f)*2.4, x = 44+i*d3-bw/2;
      s += f >= 0 ? '<rect x="'+x+'" y="'+(z-h)+'" width="'+bw+'" height="'+h+'" fill="#0D1319"/>' : '<rect x="'+(x+.75)+'" y="'+z+'" width="'+(bw-1.5)+'" height="'+h+'" fill="none" stroke="#0D1319" stroke-width="1.5"/>';
      s += '<text x="'+(44+i*d3)+'" y="228" text-anchor="middle">'+FG_MM[p[0]+i]+'</text>'; }
    s += '<line x1="34" x2="'+W+'" y1="'+z+'" y2="'+z+'" stroke="#0D1319"/>';
    return '<svg class="finsvg" viewBox="0 0 '+W+' 236">'+s+'</svg><div class="finnote">Ligne : solde de fin de mois · Barre vide : sortie nette<br>Réserve : 4,2 mois de charges</div>';
  }
  var tot = FG_D.cli.reduce(function(a,b){ return a+b[1]; },0), h = "";
  FG_D.cli.forEach(function(c){ h += '<div class="fgcl"><div class="fgcn"><span>▪ '+c[0]+'</span><span>'+c[1].toFixed(1).replace(".",",")+' k$</span></div><div class="fgbar"><i style="width:'+Math.round(c[1]/70*100)+'%"></i></div></div>'; });
  return h + '<div class="finnote">Total à recevoir : '+tot.toFixed(1).replace(".",",")+' k$ · '+Math.round(FG_D.cli[3][1]/tot*100)+' % depuis plus de 90 jours</div>';
}
var FG_PAGES = {ratios:["01","Ratios vs objectifs","Marge brute, salaires et achats, en % des ventes"], ventes:["02","Ventes vs an passé","Ventes mensuelles, 2026 contre 2025"], tres:["03","Trésorerie","Solde de fin de mois et flux net"], cli:["04","Comptes clients","À recevoir selon l'ancienneté de la facture"]};
function financeGraphique(type){
  var pg = FG_PAGES[type];
  function dessiner(){
    app.innerHTML = '<div class="page ppx fin"><div class="pph"><h1>Finance</h1></div><div class="finsous">Conseil d\'administration <span class="b2n">EXEMPLE</span></div>' +
      '<div class="sect"><span class="num">'+pg[0]+'</span><span class="lab">'+pg[1]+'</span></div><div class="fgdesc">'+pg[2]+'</div>' + fgSel() + fgGraphique(type) +
      '<a class="retour" href="#" id="retour">Retour</a></div>';
    Array.prototype.forEach.call(document.querySelectorAll(".fgsel select"), function(el){
      el.onchange = function(){ var k = el.getAttribute("data-k"), v = +el.value; FG.act = k;
        if(k === "M"){ FG.m = v; FG.t = Math.floor(v/3); } else if(k === "T"){ FG.t = v; FG.m = Math.min(v*3+2, 9); } else { FG.a = v; }
        dessiner(); }; });
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); finRetour(); };
  }
  dessiner();
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
    '<a class="doc" href="#" id="fi0"><span>'+picto("Indicateurs")+'Indicateurs</span></a><a class="doc" href="#" id="fi1"><span>'+picto("Ratios par catégorie")+'Ratios en $</span></a><a class="doc" href="#" id="fi2"><span>'+picto("Ventes vs an passé")+'Ventes vs an passé</span></a><a class="doc" href="#" id="fi3"><span>'+picto("Trésorerie")+'Trésorerie</span></a><a class="doc" href="#" id="fi4"><span>'+picto("Comptes clients")+'Comptes clients</span></a><a class="doc" href="#" id="fi5"><span>'+picto("États financiers")+'États financiers</span></a></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  document.getElementById("fi0").onclick = function(e){ e.preventDefault(); FIN_ORIGINE = "finances"; financeOuvrir(); };
  document.getElementById("fi1").onclick = function(e){ e.preventDefault(); financesRatios(); };
  [["fi2","ventes"],["fi3","tres"],["fi4","cli"]].forEach(function(a){ document.getElementById(a[0]).onclick = function(e){ e.preventDefault(); FIN_ORIGINE = "finances"; financeGraphique(a[1]); }; });
  document.getElementById("fi5").onclick = function(e){ e.preventDefault(); efOuvrir(); };
}
// Copie des ratios par catégorie avec les montants (les montants viennent de QuickBooks: « — » en attendant)
function financesRatios(){
  FIN_ORIGINE = "finances";
  var h = '<div class="page ppx fin"><a class="retour" href="#" id="retour">Retour</a><h1>Ratios</h1><div class="finnote">Pourcentage des ventes et montant, ' + FIN_MOIS_LONG[FIN_DERNIER] + '</div>';
  FIN_SECTIONS.slice(1).forEach(function(sec, i){
    h += '<div class="sect"><span class="num">0'+(i+1)+'</span><span class="lab">'+sec.t+'</span></div><div class="fincols m"><span></span><span>%</span><span>MONTANT</span></div>';
    sec.l.forEach(function(l){ h += '<div class="finl m"><span class="n">▪ '+l[0]+'</span><span>'+finPct(l[2])+'</span><span>—</span></div>'; });
  });
  h += '<div class="finnote">Les montants s\'affichent avec QuickBooks</div><a class="retour" href="#" id="retour2">Retour</a></div>';
  app.innerHTML = h;
  document.getElementById("retour").onclick = document.getElementById("retour2").onclick = function(e){ e.preventDefault(); financesMenu(); };
}
