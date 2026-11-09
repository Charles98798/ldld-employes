// Positionnement employé (annuel, Direction: Charles et Ly): le code de la page web du classeur (PositionnementPage.html) est repris tel quel;
// seuls changent la mise en page (téléphone), les identifiants (préfixe pp_) et l'appel au classeur, qui passe par le pont (mêmes fonctions posDonneesLDLD / posEnregistrerLDLD).
var POS_CACHE = {d: null};
var POS_FERMER = null;
function posEmpOuvrir(){
  app.innerHTML = '<div class="page ppx"><a class="retour" href="#" id="retour">Retour</a><div id="pp_app" class="sansemp"></div><div class="voile" id="pp_voile"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); if(POS_FERMER) POS_FERMER(); responsable(); };
  (function(){

  // Pont: les mêmes fonctions du classeur (posDonneesLDLD, posEnregistrerLDLD), appelées par le service de l'application.
  function GS(){ var ok=null,ko=null,o={withSuccessHandler:function(f){ok=f;return o},withFailureHandler:function(f){ko=f;return o},
   posDonneesLDLD:function(){ pont({action:'pos_donnees'}) }, posEnregistrerLDLD:function(id,choix){ pont({action:'pos_enregistrer',id:id,choix:choix}) }};
   function pont(c){ c.session=sessionGardee(); appelService(c).then(function(r){ if(r&&r.ok){ if(c.action==='pos_donnees'){ try{ POS_CACHE.d=r.r }catch(e){} } if(ok) ok(r.r) } else if(ko) ko({message:(r&&r.erreur)||'Échec.'}) }).catch(function(){ if(ko) ko({message:'Réseau indisponible.'}) }) }
   return o }

var PRE={d:POS_CACHE.d,err:'',web:true};
var LOGO='assets/LDLD_logo_complet_noir_transparent.png';
var D=PRE.d,i=0,occupe=false,attente=true;   // à l'ouverture : aucun employé présélectionné
function $(id){return document.getElementById('pp_'+id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
// Arrondi comme le classeur (30,305 → 30,31), sans l'erreur de virgule flottante de toFixed.
function arr(v,d){var f=Math.pow(10,d);return Math.round(v*f+(v>=0?1e-7:-1e-7))/f}
function money(v){return v==null?'—':arr(v,2).toFixed(2).replace('.',',')+' $'}
function pct(v,d){return v==null?'—':(d?arr(v*100,d).toFixed(d).replace('.',','):arr(v*100,0))+' %'}
function pctAuto(v){return pct(v)}
// « Entre 2 positions » : la position stockée a des décimales (le salaire n'est pas exactement sur une position entière). Décimales montrées SEULEMENT dans ce portail.
function posDec(v){return v==null?'—':(Math.round(v*10000)/100).toFixed(2).replace('.',',')+' %'}
function entre2(v){if(v==null)return null;var P=Math.round(v*10000)/100;if(Math.abs(P-Math.round(P))<0.005)return null;
 var lo=Math.floor(P),hi=Math.ceil(P),t=P<76?'sous le bas de l’échelle (76 %)':(P>100?'entre '+lo+' et '+hi+' · au-dessus du sommet':'entre '+lo+' et '+hi);return {P:P,lo:lo,hi:hi,txt:t}}
function posAuto(v){if(v==null)return '—';var P=Math.round(v*10000)/100;return Math.abs(P-Math.round(P))<0.005?Math.round(P)+' %':posDec(v)}
function badge2(v){var q=entre2(v);return q?' <span class="b2">'+esc(q.txt)+'</span>':''}
function maxCat(e){var r=D.cats[e.cat];return r?r[r.length-1]:null}
function options(e){var o=[{v:'C',p:e.conserver,t:'Conserver — '+posAuto(e.conserver)}];if(e.conserver==null)return [];
 for(var n=Math.floor(Math.round(e.conserver*10000)/100+1e-9)+1;n<=100;n++)o.push({v:String(n),p:n/100,t:n+' %'+(D.echelons.some(function(p){return Math.abs(p*100-n)<1e-6})?'  · échelon':'')});return o}
function etatClasseur(e){if(e.propFormule)return 'C';if(e.prop==null)return '';var n=Math.round(e.prop*100);return Math.abs(e.prop*100-n)<1e-6?String(n):''}
function salairePour(e,x){var mx=maxCat(e);if(!x||mx==null)return null;return x.v==='C'?arr(Math.max(e.sal,Math.min(e.sal*(1+D.taux),mx)),2):arr(x.p*mx,2)}
function squelette(){
 $('app').innerHTML='<div class="pph"><h1>Positionnement employé</h1><span id="pp_nom" hidden></span><span id="pp_sous" hidden></span></div>'+
 '<div class="ppnav"><span class="compteur" id="pp_cpt" hidden></span><select class="emp" id="pp_liste"></select></div>'+
 '<div class="sect"><span class="num">01</span><span class="lab">Portrait '+D.anneeActuelle+'</span></div>'+
 '<div class="bas"><div><div class="sect"><span class="lab" id="pp_ptsLab">Contribution</span><span class="moy" id="pp_ptsTag"></span></div><div class="fx pts" id="pp_pts"></div></div>'+
 '<div><div class="sect"><span class="lab">Objectifs et charges</span></div><div id="pp_charge"></div><div class="binfo" id="pp_chargeInfo"></div></div></div>'+
 '<div class="sect"><span class="num">02</span><span class="lab" id="pp_titreGrille"></span></div>'+
 '<div class="grillebox"><table class="grille"><thead><tr id="pp_hExp"></tr></thead><tbody><tr id="pp_rPos"></tr><tr id="pp_r26"></tr><tr id="pp_r27"></tr></tbody></table></div>'+
 '<div class="legende"><span>Taux d’augmentation '+D.annee+' <b>'+pct(D.taux,2)+'</b></span><span><i class="leg" style="outline:2px solid currentColor;outline-offset:-2px"></i>Position actuelle</span><span><i class="leg" style="background:currentColor"></i>Position '+D.annee+' retenue</span></div>'+
 '<div class="sect"><span class="num">03</span><span class="lab">Décision de la direction</span></div>'+
 '<div class="decision"><div><label>Position '+D.annee+'<svg id="pp_cad2" viewBox="0 0 16 20" width="12" height="15" style="display:none;margin-left:8px;vertical-align:-3px" fill="none" stroke="#1d1d1b" stroke-width="2"><rect x="2" y="9" width="12" height="9"/><path d="M4.5 9V6a3.5 3.5 0 0 1 7 0v3"/></svg></label><div style="position:relative"><select id="pp_choix"></select><svg id="pp_cad" viewBox="0 0 16 20" width="22" height="28" style="display:none;position:absolute;right:46px;top:50%;margin-top:-14px;pointer-events:none" fill="none" stroke="#1d1d1b" stroke-width="1.8"><rect x="2" y="9" width="12" height="9"/><path d="M4.5 9V6a3.5 3.5 0 0 1 7 0v3"/></svg></div><div class="note" id="pp_noteChoix">On ne baisse jamais : la liste commence à « Conserver ».</div></div>'+
  '<div><label>Augmentation</label><div class="res" id="pp_aug"></div><div class="note" id="pp_augn"></div></div>'+
 '<div><label>Écart avec « Conserver »</label><div class="res" id="pp_ecart"></div><div class="note">Ce que coûte le changement, par heure</div></div></div>'+
 '<div class="alerte" id="pp_alerte"></div>'+
 '<div class="pied"><span class="etat" id="pp_etat"></span><span id="pp_file"></span></div><div class="ppb"><button class="btn" id="pp_prec" hidden>Précédent</button><button class="btn" id="pp_suiv">Suivant</button><button class="btn noir ppenr" id="pp_enr">Confirmé et suivant</button></div>'+
 '<div class="voile" id="pp_voile"></div>';
 $('liste').innerHTML='<option value="">Choisir un employé…</option>'+D.employes.map(function(e,k){return '<option value="'+k+'">'+esc(e.nom)+'</option>'}).join('');
 $('liste').onchange=function(){if($('liste').value===''){attente=true;afficher();return}attente=false;i=+$('liste').value;afficher()};
 $('prec').onclick=function(){aller(-1)};$('suiv').onclick=function(){aller(1)};
 $('choix').onchange=majChoix;$('enr').onclick=enregistrer;
}

/* Pointage de la contribution : UNE seule règle (formule C31 du classeur « Contribution individuelle »). Chaque ligne = pointage sur sa pondération; total = somme des valeurs exactes. */
var PTS_POND={avec:{comp:[15,15,15],val:15,obj:20,exp:20},sans:{comp:[20,20,20],val:15,obj:0,exp:25}};
function ptsSans(cat){return /^(administratif|gestionnaire)/.test(String(cat||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim().toLowerCase())}
function ptsNum(x){if(x===''||x==null)return null;var n=Number(x);return isNaN(n)?null:n}
function ptsMoy(a){var v=a.filter(function(x){return x!=null});return v.length?v.reduce(function(s,x){return s+x},0)/v.length:null}
function ptsCalcul(cat,liste,expPts,opt){
 opt=opt||{};var sans=opt.sans!=null?opt.sans:ptsSans(cat),P=opt.pond||(sans?PTS_POND.sans:PTS_POND.avec),L=(liste||[]).slice(0,2);
 function note(k){return ptsMoy(L.map(function(q){return ptsNum(q[k])}))}
 var val=ptsMoy(L.map(function(q){var v=(q.val||[]).map(ptsNum);return v.length===5&&v.every(function(x){return x!=null})?ptsMoy(v):null}));
 var e=ptsNum(expPts),R=[['Expérience',e==null?null:e/20*P.exp,P.exp]];
 [['Connaissances et compétences techniques','tech'],['Autonomie et résolution de problèmes','auto'],['Qualité et constance du travail','qual']].forEach(function(c,i){var n=note(c[1]);R.push([c[0],n==null?null:n/10*P.comp[i],P.comp[i]])});
 R.push(['Valeurs humaines',val==null?null:val/10*P.val,P.val]);
 if(!sans){var o=ptsMoy(L.map(function(q){var x=ptsNum(q.obj);return x!=null&&x>1.5?x/100:x}));R.push(['Objectifs (tableau de bord)',o==null?null:o*P.obj,P.obj])}
 var sp=R.reduce(function(s,r){return s+r[2]},0),tot=R.every(function(r){return r[1]!=null})&&sp?R.reduce(function(s,r){return s+r[1]},0)/sp*100:null;
 return{rows:R,total:tot,n:L.length}}
function ptsHtml(cat,liste,expPts,esc,opt){var c=ptsCalcul(cat,liste,expPts,opt);
 var pc=opt&&opt.puce?'▪ ':'';return c.rows.map(function(r){return '<div><span>'+pc+esc(r[0])+'</span><b'+(r[1]==null?' class="manque"':'')+'>'+(r[1]==null?'—':Math.round(r[1]))+' / '+r[2]+'</b></div>'}).join('')+'<div class="tot"><span>'+pc+'Total</span><b>'+(c.total==null?'—':Math.round(c.total)+' %')+'</b></div>'}

function pcI(v){return v==null?'—':Math.round(v*100)}
function largeur(v){return Math.max(0,Math.min(100,Math.round((v||0)*100)))+'%'}
function dateLongue(s){var m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?(+m[3])+' '+['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'][+m[2]-1]+' '+m[1]:''}
function fl(x,y,pts){if(x==null||y==null)return '';var d=Math.round((pts?(x-y)*100:(x-y))*10)/10;return d===0?'':' <span class="dl">'+(d>0?'▲ +':'▼ −')+String(Math.abs(d)).replace('.',',')+(pts?' pt':'')+'</span>'}
function nb(v,dec){return v==null?'—':(Math.round(v*Math.pow(10,dec))/Math.pow(10,dec)).toFixed(dec).replace('.',',')}
function p1(v){return v==null?'—':nb(v*100,0)+' %'}
function nb2(x){return x==null?'—':(Math.round(x*100)/100===Math.round(x)?String(Math.round(x)):nb(x,2))}
function lig(t,cibTxt,cib,real,realTxt,plus,det){var ok=real!=null&&cib!=null&&(plus?real>=cib-1e-9:real<=cib+1e-9),mx=Math.max(cib==null?0:cib,real==null?0:real)||1;
 return '<div class="ir"><div>'+t+'</div><div class="r"><span'+(real==null?' class="vide"':'')+'>'+realTxt+'</span></div><div>'+cibTxt+'</div><div><div class="bar"><i style="width:'+(real==null?0:real/mx*100)+'%"></i>'+(cib==null?'':'<u style="left:'+(cib/mx*100)+'%"></u>')+'</div>'+(real==null?'<span class="bg nd">Pas de donnée</span>':cib==null?'<span class="bg nd">Cible à confirmer</span>':'<span class="bg'+(ok?' ok':'')+'">'+(ok?'Dans la cible':'Sous la cible')+'</span>')+'</div><div class="dt">'+(det||'')+'</div></div>'}
// Section 01 : mêmes blocs que le portrait de l'employé (expérience, 2 dernières évaluations, objectifs et charges).
function detail(e){
  var c=e.contribution,Lc=c&&c.liste?c.liste:(c?[c]:[]);
 $('pts').innerHTML=ptsHtml(e.cat,Lc,e.exp,esc);$('ptsLab').textContent='Contribution (nombre d\u2019\u00e9valuation '+Math.min(Lc.length,2)+')';$('ptsTag').textContent='';
 var g=e.charge,C=D.cibles||{effectuee:.8,nonTerminee:.05,objectifs:.8},hc=g&&g.ch!=null?g.ch:null,hr=g&&g.heures!=null?g.heures:null,cc=g&&g.cce!=null?g.cce/100:null;
 function dj(a){return a?a.join(' · '):''}
 $('charge').innerHTML='<div class="ind"><div class="ir ih"><div>Indicateur</div><div>Réalisé</div><div>Cible</div><div>Réalisé vs cible</div><div>Détail</div></div>'+
  lig('Heures travaillées par semaine',nb2(hc),hc,hr,hr==null?'—':nb(hr,2),true,g?g.semaines+' semaines comptées':'')+
  lig('Charge effectuée',cc==null?'—':p1(cc)+' et +',cc,g&&g.effectuee,p1(g&&g.effectuee),true,g?dj(g.detCE):'')+
  lig('Charge non terminée',p1(C.nonTerminee)+' et −',C.nonTerminee,g&&g.nonTerminee,p1(g&&g.nonTerminee),false,g?dj(g.detCN):'')+
  lig('Objectifs atteints',p1(C.objectifs)+' et +',C.objectifs,g&&g.objectifs,p1(g&&g.objectifs),true,g?dj(g.detObj):'')+'</div>';
 var inf=g&&g.ok&&g.du&&g.au?'▪ Chiffres de Gestion : les 6 derniers mois travaillés (complets), du '+g.du+' au '+g.au+'.':'▪ Chiffres des 6 derniers mois, sans les 2 dernières semaines, comme dans l’évaluation.';
 if(D.gestion&&D.gestion.absent)inf+='<br>▪ '+esc(D.gestion.erreur||'Les chiffres arriveront avec l’export quotidien de Gestion LDLD.');else if(!g)inf+='<br>▪ Aucune donnée dans Gestion LDLD pour cet employé.';
 $('chargeInfo').innerHTML=inf;
 if(/^administratif/i.test(e.cat||'')){$('charge').innerHTML='<div class="binfo">Pas de tableau de bord pour ce poste.</div>';$('chargeInfo').innerHTML=''}else if(/^gestionnaire/i.test(e.cat||'')){$('chargeInfo').innerHTML+='<br>▪ À titre visuel seulement pour ce poste : ces chiffres ne comptent dans aucune note ni dans le pointage.'}
}
function aller(d){try{window.scrollTo(0,0)}catch(x){}if(occupe)return;if(attente){attente=false;i=d>0?0:D.employes.length-1}else i=(i+d+D.employes.length)%D.employes.length;afficher()}
function afficher(){var e=D.employes[i];setTimeout(majFrais,0);
 if(attente){$('app').className='sansemp';$('liste').value='';$('nom').textContent='';$('sous').textContent='Choisissez un employé dans la liste';return}
 $('app').className='';
 $('nom').textContent=e.nom;$('sous').textContent=e.cat+' · '+e.id+' · réunion de direction — positionnement '+D.annee;
 $('cpt').textContent='Employé '+(i+1)+' / '+D.employes.length;$('liste').value=i;
 detail(e);
 $('titreGrille').textContent='Échelle salariale — '+e.cat;
 var o=options(e),cur=etatClasseur(e),sel=$('choix');
 var html='<option value="">Choisir…</option>'+o.map(function(x){return '<option value="'+x.v+'">'+esc(x.t)+'</option>'}).join('');
 sel.innerHTML=html;sel.value=o.some(function(x){return x.v===cur})?cur:'';sel.dataset.classeur=sel.value;
 majChoix();
}
function majChoix(){var e=D.employes[i],sel=$('choix'),o=options(e),x=null;
 var h27=String(e.note||'').indexOf('Embauché sur l’échelle '+D.annee)===0,sup1=h27||(e.conserver!=null&&e.conserver>1.00005),s100=!sup1&&e.conserver!=null&&maxCat(e)!=null&&Math.round(e.conserver*maxCat(e)*100)>=Math.round(maxCat(e)*100),sup=sup1||s100;
 if(sup&&!sel.value&&o.length)sel.value='C';
 sel.disabled=sup;sel.classList.toggle('lock',sup);$('cad').style.display=sup?'block':'none';$('cad2').style.display=sup?'inline':'none';$('noteChoix').textContent=sup?(h27?'Verrouillé : embauché sur l’échelle '+D.annee+', sans augmentation '+D.annee+'.':(s100?'Verrouillé à 100 % : la position actuelle est déjà à 100 %.':'Verrouillé : le salaire dépasse le sommet de l’échelle '+D.annee+'.')):'On ne baisse jamais : la liste commence à « Conserver ».';
 $('sous').textContent=e.cat+' · '+e.id+' · réunion de direction — positionnement '+D.annee+(sup?(s100?' · verrouillé à 100 %':' · sans augmentation '+D.annee):'');
 o.forEach(function(z){if(z.v===sel.value)x=z});
 var confirme=e.confirme&&sel.value&&(sel.value===sel.dataset.classeur||cent(e));
 sel.className=sup?'lock':(confirme?'ok':'');
 var mx=maxCat(e),cols=[];
 var c26=D.catsActuelle&&D.catsActuelle[e.cat];
 if(D.cats[e.cat])D.echelons.forEach(function(p,k){cols.push({p:Math.round(p*1000)/10,r:p,s26:c26?c26[k]:null,s27:D.cats[e.cat][k],x:D.experience[k]})});
 // Colonne déjà présente (échelon ou position actuelle) : on la complète au lieu d'en ajouter une.
 function ajout(r,s26,s27,lab,drapeau){var p=Math.round(r*1000)/10,c=null;cols.forEach(function(z){if(!c&&Math.round(z.r*10000)===Math.round(r*10000))c=z});
  if(!c){c={p:p,r:r,s26:s26,s27:s27,x:lab,perso:true};c[drapeau]=true;cols.push(c);return}
  c[drapeau]=true;
  if(s26!=null)c.s26=s26;if(s27!=null)c.s27=s27;if(c.perso)c.x+=' · '+lab}
 if(e.pos!=null)ajout(e.pos,e.sal,null,'Actuelle '+D.anneeActuelle,'actu');
 var sR=salairePour(e,x),pR=x?Math.round(x.p*1000)/10:null;
 if(x)ajout(x.p,null,sR,'Retenue '+D.annee,'ret');
 cols.sort(function(a,b){return a.p-b.p});
 function cl(c){return (c.actu?'actu ':'')+(c.ret?'prop':'')}
 $('hExp').innerHTML='<th></th>'+cols.map(function(c){return '<th>'+esc(c.x)+'</th>'}).join('');
 $('rPos').innerHTML='<td class="lib">Positionn.</td>'+cols.map(function(c){return '<td class="'+cl(c)+'">'+(c.ret&&sup?'<svg viewBox="0 0 16 20" width="15" height="19" style="vertical-align:-3px;margin-right:8px" fill="none" stroke="#fff" stroke-width="2"><rect x="2" y="9" width="12" height="9"/><path d="M4.5 9V6a3.5 3.5 0 0 1 7 0v3"/></svg>':'')+((c.actu||c.ret)?posAuto(c.r):arr(c.r*100,0)+' %')+'</td>'}).join('');
 $('r26').innerHTML='<td class="lib">Éch. '+D.anneeActuelle+' ($)</td>'+cols.map(function(c){return '<td class="'+cl(c)+'">'+money(c.s26).replace(' $','')+'</td>'}).join('');
 $('r27').innerHTML='<td class="lib">Éch. '+D.annee+' ($)</td>'+cols.map(function(c){return '<td class="'+cl(c)+'">'+money(c.s27).replace(' $','')+'</td>'}).join('');
 var al=[];
 if(!D.cats[e.cat])al.push('Catégorie « '+e.cat+' » absente de l’échelle '+D.annee+'.');
 if(sup&&h27)al.push('Sans augmentation '+D.annee+' : embauché sur l’échelle '+D.annee+', la position fixée à l’embauche est maintenue. Aucun autre choix n’est possible.');
 else if(s100)al.push('Position verrouillée à 100 % : la position actuelle est déjà à 100 %, le salaire '+D.annee+' est '+money(sR)+' (sommet de l’échelle '+D.annee+'). Aucun autre choix n’est possible.');
 else if(sup)al.push('Sans augmentation '+D.annee+' : le salaire de '+money(e.sal)+' dépasse le sommet de l’échelle '+D.annee+' ('+money(maxCat(e))+') et reste maintenu. Aucun autre choix n’est possible.');
 var q2=(!sup&&x)?entre2(x.p):null;if(q2){var P2=q2.P;if(P2>=76&&P2<=100){var sl=arr(q2.lo/100*maxCat(e),2),sh=arr(q2.hi/100*maxCat(e),2);al.push('Position retenue '+D.annee+' : '+posDec(x.p)+', entre 2 positions ('+q2.lo+' % et '+q2.hi+' %). Salaire '+D.annee+' : '+money(sR)+'. Positions entières voisines : '+q2.lo+' % = '+money(sl)+' et '+q2.hi+' % = '+money(sh)+'. Aucun salaire n’est changé.')}else al.push('Position retenue '+D.annee+' : '+posDec(x.p)+(P2<76?', sous le bas de l’échelle (76 %)':', au-dessus du sommet')+'. Salaire '+D.annee+' : '+money(sR)+'. Aucun salaire n’est changé.')}
 if(!sup&&e.pos!=null&&e.pos>1.005)al.push('Au-delà du maximum de l’échelle ('+pctAuto(e.pos)+') : « Conserver » maintient le salaire actuel de '+money(e.sal)+'. La position '+D.annee+' affichée descend à '+pctAuto(e.conserver)+' seulement parce que le maximum augmente; le salaire, lui, ne baisse pas.');
 if(!sel.dataset.classeur&&e.prop!=null&&!e.propFormule)al.push('Valeur actuelle dans le classeur : '+pctAuto(e.prop)+'. Elle n’est pas dans la liste (sous « Conserver » ou non entière) : choisissez la position.');
 if(!$('alerte').dataset.file){$('alerte').style.display=al.length?'block':'none';$('alerte').innerHTML=al.map(esc).join('<br>')}
 if(!x){['aug','ecart'].forEach(function(k){$(k).textContent='—'});$('augn').textContent='';}
 else{
  $('aug').textContent=pct(sR/e.sal-1,1);$('augn').textContent=money(e.sal)+' à '+money(sR)+' (+ '+money(sR-e.sal)+' / h)';
  var sc=salairePour(e,o[0]);$('ecart').textContent=x.v==='C'?'0,00 $':'+ '+money(sR-sc);
 }
 $('etat').innerHTML=(D.confErreur?' <b style="color:#b00">Envoi salarial : '+esc(D.confErreur)+'</b>':'')+' <span class="pastille'+(enAttente(e)?'" style="background:#e8e4da">écriture en cours':(confirme?' ok">confirmé en réunion':'">à confirmer'))+'</span>';
 sel.disabled=enAttente(e)||sup;majFrais();
 try{var gb=document.querySelector('.ppx .grillebox'),tg=gb&&gb.querySelector('td.prop,td.actu');if(gb&&tg)gb.scrollLeft=Math.max(0,tg.offsetLeft-64)}catch(x){}
}
// File d'écriture en arrière-plan : on passe tout de suite au suivant; une écriture à la fois, dans l'ordre.
// Un employé n'est « confirmé » (vert) qu'après la réponse vérifiée du serveur.
var ETAT={},FILE=[],ENCOURS=false;
function enAttente(e){var t=ETAT[e.id];return !!t&&(t.s==='attente'||t.s==='cours')}
function majFile(){var n=FILE.filter(function(t){return t.s==='attente'||t.s==='cours'}).length,ech=FILE.filter(function(t){return t.s==='echec'}).length,el=$('file');if(!el)return;
 el.innerHTML=(n?'<span class="pastille" style="background:#e8e4da">'+n+' écriture'+(n>1?'s':'')+(FILE.some(function(t){return t.n&&(t.s==='attente'||t.s==='cours')})?' en attente du classeur':' en cours')+'</span>':'')+(ech?'<span class="pastille">'+ech+' à reprendre</span>':'')+(!n&&!ech&&FILE.length?'<span class="pastille ok">tout est enregistré</span>':'');
 var echs=FILE.filter(function(t){return t.s==='echec'});
 if(echs.length){var t=echs[0];$('alerte').style.display='block';$('alerte').innerHTML='<b>'+esc(t.nom)+' : non enregistré.</b> '+esc(t.msg)+' Rien n’est confirmé pour cet employé. <button class="btn" id="pp_reessai" style="padding:5px 14px;margin-left:10px">Réessayer</button>';
  $('reessai').onclick=function(){t.s='attente';t.msg='';$('alerte').style.display='none';pompe();majFile();if(!attente)afficher()}}
 else if($('alerte').dataset.file){$('alerte').style.display='none'}
 $('alerte').dataset.file=echs.length?'1':'';
 majFrais()}
function enregistrer(){if(!frais||cent(D.employes[i]))return;var e=D.employes[i],sel=$('choix');
 if(!sel.value){sel.focus();return}
 if(enAttente(e))return;
 var x=null;options(e).forEach(function(z){if(z.v===sel.value)x=z});
 var t={id:e.id,nom:e.nom,choix:sel.value,attendu:salairePour(e,x),s:'attente',msg:''};
 ETAT[e.id]=t;FILE=FILE.filter(function(u){return u.id!==e.id});FILE.push(t);
 majFile();aller(1);pompe();
}
function reprise(t){t.n=(t.n||0)+1;var d=Math.min(5000*t.n,30000);t.s='attente';t.pause=Date.now()+d;setTimeout(pompe,d+100)}
function pompe(){if(ENCOURS)return;var t=null;FILE.forEach(function(u){if(!t&&u.s==='attente'&&(!u.pause||u.pause<=Date.now()))t=u});if(!t){majFile();return}
 ENCOURS=true;t.s='cours';majFile();
 var fini=false,garde=setTimeout(function(){if(fini)return;fini=true;ENCOURS=false;reprise(t);majFile();pompe()},60000);
 GS().withSuccessHandler(function(r){if(fini)return;fini=true;clearTimeout(garde);ENCOURS=false;
   var k=D.employes.findIndex(function(z){return z.id===t.id});
   if(k>=0)D.employes[k]=Object.assign({},D.employes[k],r);
   if(t.attendu!=null&&Math.abs(r.salProp-t.attendu)>0.005){t.s='echec';t.msg='Le classeur indique '+money(r.salProp)+' au lieu de '+money(t.attendu)+'. Vérifiez la ligne.'}
   else{t.s='ok';delete ETAT[t.id]}
   majFile();if(!attente&&D.employes[i]&&D.employes[i].id===t.id)afficher();pompe()})
  .withFailureHandler(function(err){if(fini)return;fini=true;clearTimeout(garde);ENCOURS=false;if(/occup/i.test((err&&err.message)||String(err)))reprise(t);else{t.s='echec';t.msg=(err&&err.message)||String(err)}majFile();pompe()})
  .posEnregistrerLDLD(t.id,t.choix);
}
var AV=function(ev){if(FILE.some(function(t){return t.s==='attente'||t.s==='cours'||t.s==='echec'})){ev.preventDefault();ev.returnValue=''}};window.addEventListener('beforeunload',AV);
function recap(){var v=$('voile');var faits=D.employes.filter(function(e){return e.confirme}).length;
 v.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><div><h2>Récapitulatif '+D.annee+'</h2><div class="sous">'+faits+' / '+D.employes.length+' positions confirmées en réunion · cliquer une ligne pour y aller'+(D.duree?' · données lues en '+String(Math.round(D.duree.total/100)/10).replace('.',',')+' s':'')+'</div></div>'+
 '<span>'+(D.web&&!PRE.web?'<a class="lien" href="'+esc(D.web)+'" target="_blank">Ouvrir en plein écran (page Web)</a> &nbsp; ':'')+'<button class="btn noir" id="pp_ferme">Fermer</button></span></div>'+
 '<div class="boite"><table class="recap"><thead><tr><th>Employé</th><th>Catégorie</th><th>Position '+D.anneeActuelle+'</th><th>Position '+D.annee+'</th><th>Salaire '+D.anneeActuelle+'</th><th>Salaire '+D.annee+'</th><th>Augmentation</th><th>État</th></tr></thead><tbody>'+
 D.employes.map(function(e,k){return '<tr data-k="'+k+'"><td>'+esc(e.nom)+'</td><td>'+esc(e.cat)+'</td><td class="n">'+pctAuto(e.pos)+'</td><td class="n">'+(e.propFormule?'Conserver · ':'')+pctAuto(e.prop)+'</td><td class="n">'+money(e.sal)+'</td><td class="n">'+money(e.salProp)+'</td><td class="n">'+pct(e.taux,1)+'</td><td><span class="pastille'+(e.confirme?' ok">confirmé':'">à confirmer')+'</span></td></tr>'}).join('')+'</tbody></table></div>';
 v.style.display='block';$('ferme').onclick=function(){v.style.display='none'};
 Array.prototype.forEach.call(v.querySelectorAll('tr[data-k]'),function(tr){tr.onclick=function(){attente=false;i=+tr.dataset.k;v.style.display='none';afficher()}});
}
function demarrer(){
 if(!D){$('app').innerHTML='<div class="msg">'+esc(PRE.err||'Données indisponibles.')+'</div>'}
 else if(!D.employes.length){$('app').innerHTML='<div class="msg">Aucun employé actif dans '+esc(D.onglet)+'.</div>'}
 else{squelette();afficher()}
}
var frais=false;
function lireFrais(){
 GS().withSuccessHandler(function(r){
   var id=D&&D.employes[i]?D.employes[i].id:null,sel=$('choix'),choisi=sel?sel.value:'',avant=sel?sel.dataset.classeur:'';
   var deja=!!D;D=r;frais=true;var k=id?D.employes.findIndex(function(e){return e.id===id}):-1;i=k>=0?k:0;
   if(!deja||!$('nom'))demarrer();else{afficher();if(choisi!==avant&&choisi&&[].some.call($('choix').options,function(o){return o.value===choisi})){$('choix').value=choisi;majChoix()}}
   majFrais()})
  .withFailureHandler(function(e){if(!D){PRE.err=e.message||String(e);demarrer()}else{$('alerte').style.display='block';$('alerte').textContent='Mise à jour impossible : '+(e.message||e)+'. Fermez et rouvrez le positionnement.'}})
  .posDonneesLDLD();
}
// Tant que la lecture fraîche n'est pas arrivée, on consulte la copie mais on n'enregistre pas.
function cent(e){if(!e||e.conserver==null||!D)return false;if(String(e.note||'').indexOf('Embauché sur l’échelle '+D.annee)===0)return false;var m=maxCat(e);return e.conserver>1.00005||(m!=null&&Math.round(e.conserver*m*100)>=Math.round(m*100))}
function majFrais(){var b=$('enr');if(!b)return;var c=!!(frais&&D&&D.employes&&cent(D.employes[i]));b.disabled=!frais||c||(D&&D.employes&&D.employes[i]&&!attente&&enAttente(D.employes[i]));b.textContent=!frais?'Mise à jour…':(c?'Confirmé automatiquement':'Confirmé et suivant')}
if(PRE.err&&!D){demarrer()}
else{
if(D){demarrer();majFrais()}
else $('app').innerHTML='<div class="msg"><div><img src="'+LOGO+'" style="height:70px;display:block;margin:0 auto 26px" alt=""><div style="letter-spacing:.22em;text-transform:uppercase;font-size:13px;color:#8D806A">Chargement du positionnement…</div></div></div>';
lireFrais();
}

  POS_FERMER = function(){ window.removeEventListener('beforeunload',AV); };
  })();
}
// Préchargement discret quand la page Direction s'affiche: la copie arrive avant l'ouverture.
function posEmpPrecharger(){ if(POS_CACHE.d || POS_CACHE.enCours) return; POS_CACHE.enCours = true;
  appelService({action:"pos_donnees", session:sessionGardee()}).then(function(r){ POS_CACHE.enCours = false; if(r && r.ok) POS_CACHE.d = r.r; }).catch(function(){ POS_CACHE.enCours = false; }); }
