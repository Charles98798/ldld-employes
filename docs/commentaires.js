// Commentaires clients de la Réunion production.
// Service: rd_commentaires_lire / rd_commentaire_ecrire / rd_commentaire_retirer / rd_commentaire_photos (Gestionnaire + Direction).
// Les photos ne sont JAMAIS dans le dépôt public: elles sont dans un dossier Drive privé, lues par le service après authentification.
// Les miniatures sont gardées sur l'appareil (cache); l'agrandissement charge la grande version.
var CC = {liste: {}, img: {}, form: null};
["rd_commentaires_lire", "rd_commentaire_ecrire", "rd_commentaire_retirer", "rd_commentaire_photos"].forEach(function(a){ NEUTRE[a] = 1; });
var CC_TYPES = [["positif", "Positif", "#8EFF60"], ["questionnement", "Questionnement", "#6E6350"], ["negatif", "Négatif", "#1D1D1B"]];

function ccType(t){ for(var i = 0; i < CC_TYPES.length; i++) if(CC_TYPES[i][0] === t) return CC_TYPES[i]; return CC_TYPES[2]; }
function ccPastille(t){ var x = ccType(t); return '<span style="display:inline-block;width:11px;height:11px;background:'+x[2]+';margin:0 6px 0 10px;vertical-align:-1px"></span>'+rdE(x[1]); }
function ccAujourdhui(){ try { return new Intl.DateTimeFormat("en-CA", {timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit"}).format(new Date()); } catch(e){ var d = new Date(); return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); } }

// ---- Photos: cache des miniatures sur l'appareil, lecture authentifiée par lots
function ccImgCle(id){ return "ldld-ccm-"+id; }
function ccImgLire(id){ if(CC.img[id]) return CC.img[id]; try { var v = localStorage.getItem(ccImgCle(id)); if(v){ CC.img[id] = v; return v; } } catch(e){} return ""; }
function ccImgGarder(id, url, mini){ CC.img[id] = url; if(mini){ try { localStorage.setItem(ccImgCle(id), url); } catch(e){} } }
function ccPhotos(ids, mini, apres){
  var manque = ids.filter(function(i){ return i && !ccImgLire(i); });
  if(!manque.length){ if(apres) apres(); return; }
  var lots = []; while(manque.length) lots.push(manque.splice(0, 10));
  var suite = Promise.resolve();
  lots.forEach(function(l){ suite = suite.then(function(){
    return appelService({action: "rd_commentaire_photos", session: sessionGardee(), ids: l}).then(function(r){
      if(r && r.ok && r.photos) Object.keys(r.photos).forEach(function(k){ var p = r.photos[k]; if(p && p.b64) ccImgGarder(k, "data:"+(p.mime || "image/jpeg")+";base64,"+p.b64, mini); });
      if(apres) apres();
    }).catch(function(){}); }); });
}
function ccRemplirImgs(racine){
  Array.prototype.forEach.call(racine.querySelectorAll("img[data-ph]"), function(im){ var u = ccImgLire(im.getAttribute("data-ph")); if(u && im.getAttribute("src") !== u) im.src = u; });
}
function ccVignettes(photos, grandes){
  if(!photos || !photos.length) return "";
  var w = "width:min(180px,calc((100% - 32px)/5));aspect-ratio:1/1;object-fit:cover;background:#B7B1A5;display:block;cursor:pointer";
  return '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 4px">'+photos.map(function(p, i){
    return '<img alt="Photo '+(i + 1)+'" data-ph="'+rdE(p.m)+'" data-g="'+rdE(p.g)+'" style="'+w+'" src="'+rdE(ccImgLire(p.m))+'">'; }).join("")+'</div>';
}
function ccLierVignettes(racine){
  Array.prototype.forEach.call(racine.querySelectorAll("img[data-g]"), function(im){ im.onclick = function(){
    var fr = Array.prototype.slice.call(im.parentNode.querySelectorAll("img[data-g]"));
    ccAgrandir(fr.map(function(x){ return {g: x.getAttribute("data-g"), m: x.getAttribute("data-ph")}; }), fr.indexOf(im)); }; });
}
// Visionneuse: flèches précédente/suivante (exception demandée par Charles, limitée à cette visionneuse), glisser gauche/droite, X pour fermer
function ccAgrandir(liste, i){
  var o = document.createElement("div");
  o.style.cssText = "position:fixed;left:0;top:0;right:0;bottom:0;z-index:1000;background:rgba(29,29,27,.94);display:flex;align-items:center;justify-content:center;padding:56px 12px;box-sizing:border-box;touch-action:pan-y";
  var im = document.createElement("img"); im.alt = "Photo agrandie"; im.style.cssText = "max-width:100%;max-height:100%;display:block;object-fit:contain";
  o.appendChild(im);
  var bs = "position:absolute;background:#B7B1A5;color:#1D1D1B;border:0;border-radius:0;width:44px;height:44px;font-size:22px;line-height:44px;text-align:center;cursor:pointer;padding:0;font-family:inherit;";
  function bouton(txt, css, label, f){ var b = document.createElement("button"); b.type = "button"; b.textContent = txt; b.setAttribute("aria-label", label); b.style.cssText = bs + css; b.onclick = function(e){ e.stopPropagation(); f(); }; o.appendChild(b); return b; }
  var fermer = function(){ if(o.parentNode) o.parentNode.removeChild(o); document.removeEventListener("keydown", cle); };
  var prec = bouton("\u2190", "left:12px;top:50%;margin-top:-22px", "Photo précédente", function(){ aller(i - 1); });
  var suiv = bouton("\u2192", "right:12px;top:50%;margin-top:-22px", "Photo suivante", function(){ aller(i + 1); });
  bouton("\u2715", "right:12px;top:calc(12px + env(safe-area-inset-top,0px))", "Fermer", fermer);
  function aller(n){
    if(n < 0 || n >= liste.length) return; i = n;
    var p = liste[i], g = ccImgLire(p.g);
    im.src = g || ccImgLire(p.m) || "";
    prec.style.display = i > 0 ? "" : "none"; suiv.style.display = i < liste.length - 1 ? "" : "none";
    if(!g) ccPhotos([p.g], false, function(){ if(liste[i] === p){ var u = ccImgLire(p.g); if(u) im.src = u; } });
  }
  var cle = function(e){ if(e.key === "Escape") fermer(); else if(e.key === "ArrowLeft") aller(i - 1); else if(e.key === "ArrowRight") aller(i + 1); };
  var x0 = null;
  o.addEventListener("touchstart", function(e){ x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, {passive: true});
  o.addEventListener("touchend", function(e){ if(x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if(Math.abs(dx) > 50) aller(dx < 0 ? i + 1 : i - 1); }, {passive: true});
  o.onclick = fermer;
  document.addEventListener("keydown", cle);
  document.body.appendChild(o);
  aller(i);
}

// ---- Lecture
function ccLire(dep, depuis, apres){
  return appelService({action: "rd_commentaires_lire", session: sessionGardee(), departement: dep, depuis: depuis}).then(function(r){
    if(r && r.ok){ var l = r.commentaires || []; try { localStorage.setItem("ldld-cc-"+depuis+"-"+dep, JSON.stringify(l)); } catch(e){} CC.liste[depuis+"-"+dep] = l; apres(l, r); return l; }
    return null; }).catch(function(){ return null; });
}
function ccCache(dep, depuis){ var k = depuis+"-"+dep; if(CC.liste[k]) return CC.liste[k]; try { var v = JSON.parse(localStorage.getItem("ldld-cc-"+k) || "null"); if(v){ CC.liste[k] = v; return v; } } catch(e){} return null; }

// ---- Présentation (bloc 05, après Cas non complétés; caché s'il n'y a aucun commentaire)
function ccBlocPresentation(){ return '<div class="rdblk" id="rdcc" style="display:none"></div>'; }
function ccPresentation(){
  var dep = RD.dep;
  function dessiner(l){
    var z = document.getElementById("rdcc"); if(!z || RD.dep !== dep) return;
    if(!l || !l.length){ z.style.display = "none"; z.innerHTML = ""; return; }
    z.style.display = "";
    z.innerHTML = '<div class="rdt">05 <span>Commentaires clients</span></div><div class="rdp" style="margin-top:-6px"><small>Depuis la dernière réunion</small></div>' + l.map(function(c, i){
      return '<div class="rdp"'+(i < l.length - 1 ? ' style="margin-bottom:18px"' : '')+'><small>'+rdE(c.date)+ccPastille(c.type)+'</small><div>'+rdPuces(c.texte)+'</div>'+ccVignettes(c.photos)+'</div>'; }).join("");
    ccRemplirImgs(z); ccLierVignettes(z);
    var ids = []; l.forEach(function(c){ (c.photos || []).forEach(function(p){ ids.push(p.m); }); });
    ccPhotos(ids, true, function(){ var zz = document.getElementById("rdcc"); if(zz) ccRemplirImgs(zz); });
  }
  var c0 = ccCache(dep, "derniere"); if(c0) dessiner(c0);
  ccLire(dep, "derniere", function(l){ dessiner(l); });
}

// ---- Planification: liste des commentaires du département (modifier / retirer) + bouton d'ajout
function ccListeHtml(l){
  if(!l || !l.length) return "";
  return '<div class="rdsm">Commentaires clients · '+rdE(RD.dep)+'</div>' + l.map(function(c){
    return '<div class="rdp"><small>'+rdE(c.date)+ccPastille(c.type)+((c.photos || []).length ? ' · '+c.photos.length+(c.photos.length > 1 ? " photos" : " photo") : "")+'</small><div class="rdl2"><div class="rdtx">'+rdPuces(c.texte)+'</div>'+rdIcones("data-cm", rdE(c.id), "data-cr", rdE(c.id))+'</div></div>'; }).join("");
}
function ccListePlanif(){
  var dep = RD.dep;
  function dessiner(l){
    var z = document.getElementById("cclist"); if(!z || RD.dep !== dep) return;
    z.innerHTML = ccListeHtml(l);
    Array.prototype.forEach.call(z.querySelectorAll("[data-cm]"), function(a){ a.onclick = function(e){ e.preventDefault(); var id = a.getAttribute("data-cm"); var c = (l || []).filter(function(x){ return x.id === id; })[0]; if(c) ccFormulaire(c); }; });
    Array.prototype.forEach.call(z.querySelectorAll("[data-cr]"), function(a){ a.onclick = function(e){ e.preventDefault(); var id = a.getAttribute("data-cr");
      confirmerOuiNon("Retirer ce commentaire client ?", function(){
        appelService({action: "rd_commentaire_retirer", session: sessionGardee(), id: id}).then(function(r){
          if(r && r.ok){ ["tout", "derniere"].forEach(function(d){ try { localStorage.removeItem("ldld-cc-"+d+"-"+dep); } catch(e){} delete CC.liste[d+"-"+dep]; }); ccListePlanif(); }
        }).catch(function(){}); }, false); }; });
  }
  var c0 = ccCache(dep, "tout"); if(c0) dessiner(c0);
  ccLire(dep, "tout", dessiner);
}

// ---- Formulaire « Ajouter un commentaire client » (sauvegarde automatique)
function ccReduire(fichier){
  return new Promise(function(ok, ko){
    var fr = new FileReader();
    fr.onerror = function(){ ko(new Error("lecture")); };
    fr.onload = function(){
      var im = new Image();
      im.onerror = function(){ ko(new Error("image")); };
      im.onload = function(){
        try {
          var W = im.naturalWidth || im.width, H = im.naturalHeight || im.height, k = Math.min(1, 1280 / Math.max(W, H));
          var c = document.createElement("canvas"); c.width = Math.round(W * k); c.height = Math.round(H * k);
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          var grand = c.toDataURL("image/jpeg", 0.8);
          var m = document.createElement("canvas"); m.width = 360; m.height = 360;
          var s = Math.min(W, H), sx = (W - s) / 2, sy = (H - s) / 2;
          m.getContext("2d").drawImage(im, sx, sy, s, s, 0, 0, 360, 360);
          var mini = m.toDataURL("image/jpeg", 0.72);
          ok({grandUrl: grand, miniUrl: mini, grand: grand.split(",")[1], mini: mini.split(",")[1]});
        } catch(e){ ko(e); }
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(fichier);
  });
}
function ccFormulaire(existant){
  var F = CC.form = {id: existant ? existant.id : "", date: existant ? existant.date : ccAujourdhui(), type: existant ? existant.type : "negatif", dep: existant ? existant.departement : RD.dep,
    texte: existant ? existant.texte : "", photos: existant ? (existant.photos || []).map(function(p){ return {g: p.g, m: p.m}; }) : [], nouvelles: [], occupe: false, sale: false, t: 0, dernier: ""};
  var h = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+rdE(rdTitreDep())+'</h1>';
  h += '<div class="rdt" style="font-size:16px;letter-spacing:.16em;text-transform:uppercase;font-weight:400">+ <span style="margin-left:6px;font-size:inherit">'+(existant ? "Modifier le commentaire client" : "Ajouter un commentaire client")+'</span></div>';
  h += '<div class="rdp"><small>Date</small><input class="rdzone" id="ccdate" type="date" value="'+rdE(F.date)+'"></div>';
  h += '<div class="rdp"><small>Type</small><div class="chx" id="cctype">'+CC_TYPES.map(function(t){ return '<button type="button" data-t="'+t[0]+'" aria-pressed="'+(t[0] === F.type ? "true" : "false")+'">'+rdE(t[1])+'</button>'; }).join("")+'</div></div>';
  h += '<div class="rdp"><small>Département</small><div class="chx" id="ccdep">'+RD_DEPS.map(function(d){ return '<button type="button" data-d="'+rdE(d)+'" aria-pressed="'+(d === F.dep ? "true" : "false")+'">'+rdE(d)+'</button>'; }).join("")+'</div></div>';
  h += '<div class="rdp"><small>Commentaire</small><textarea class="rdzone" id="cctexte" rows="6" maxlength="4000" placeholder="Écrire le commentaire">'+rdE(F.texte)+'</textarea></div>';
  h += '<div class="rdp"><small>Photos (facultatif, 5 maximum)</small><div id="ccphotos"></div><input type="file" id="ccfichier" accept="image/*" multiple style="display:none"></div>';
  h += '<div id="ccm"></div></div>';
  app.innerHTML = h;
  var dire = function(t){ var m = document.getElementById("ccm"); if(m) m.innerHTML = '<div class="rdp"><small style="text-transform:none;letter-spacing:0;font-size:13px">'+rdE(t)+'</small></div>'; };
  var essais = 0;
  document.getElementById("retour").onclick = function sortir(e){ if(e) e.preventDefault();
    if(F.sale && valide() && !F.occupe){ clearTimeout(F.t); enregistrer(); }
    if((F.occupe || (F.sale && valide())) && essais++ < 30){ dire("Enregistrement en cours"); setTimeout(sortir, 400); return; }
    CC.form = null; ccListeCacheVider(F.dep); rdPlanif(); };
  function tous(){ return F.photos.concat(F.nouvelles); }
  function dessinerPhotos(){
    var z = document.getElementById("ccphotos"); if(!z) return;
    var w = "width:min(180px,calc((100% - 32px)/5));aspect-ratio:1/1";
    var tuile = tous().length < 5 ? '<a href="#" id="cctuile" aria-label="Ajouter des photos" style="'+w+';display:flex;align-items:center;justify-content:center;background:#B7B1A5;color:#1D1D1B;font-size:28px;text-decoration:none">+</a>' : "";
    z.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:8px">'+tous().map(function(p, i){
      var src = p.miniUrl || ccImgLire(p.m);
      return '<div style="position:relative;'+w+'"><img alt="Photo '+(i + 1)+'" data-ph="'+rdE(p.m || "")+'" style="width:100%;height:100%;object-fit:cover;background:#B7B1A5;display:block" src="'+rdE(src)+'"><a href="#" class="rdic" data-px="'+i+'" aria-label="Retirer la photo" style="position:absolute;right:4px;top:4px;background:#B7B1A5;padding:4px;display:block;width:20px;height:20px"><svg viewBox="0 0 24 24" aria-hidden="true" style="width:20px;height:20px"><path d="M3 3h6v6h-6zM15 3h6v6h-6zM9 9h6v6h-6zM3 15h6v6h-6zM15 15h6v6h-6z" fill="#1D1D1B"/></svg></a></div>'; }).join("")+tuile+'</div>';
    var tl = document.getElementById("cctuile"); if(tl) tl.onclick = function(e){ e.preventDefault(); document.getElementById("ccfichier").click(); };
    Array.prototype.forEach.call(z.querySelectorAll("[data-px]"), function(a){ a.onclick = function(e){ e.preventDefault(); var i = Number(a.getAttribute("data-px"));
      confirmerOuiNon("Retirer cette photo ?", function(){ if(i < F.photos.length) F.photos.splice(i, 1); else F.nouvelles.splice(i - F.photos.length, 1); dessinerPhotos(); planifier(); }, false); }; });
    ccPhotos(F.photos.map(function(p){ return p.m; }), true, function(){ var zz = document.getElementById("ccphotos"); if(zz) ccRemplirImgs(zz); });
  }
  function valide(){ return !!(F.texte.trim() && /^\d{4}-\d{2}-\d{2}$/.test(F.date) && F.type && F.dep); }
  function planifier(){ F.sale = true; clearTimeout(F.t); F.t = setTimeout(enregistrer, 700); if(!valide()) dire(F.texte.trim() ? "Date invalide" : "Écrivez le commentaire pour l'enregistrer"); }
  function enregistrer(){
    if(CC.form !== F || !F.sale) return;
    if(!valide()) return;
    if(F.occupe){ F.t = setTimeout(enregistrer, 400); return; }
    F.occupe = true; F.sale = false; dire("Enregistrement en cours");
    var corps = {action: "rd_commentaire_ecrire", session: sessionGardee(), id: F.id, date: F.date, type: F.type, departement: F.dep, texte: F.texte.trim(),
      photos_gardees: F.photos.map(function(p){ return {g: p.g, m: p.m}; }), photos_nouvelles: F.nouvelles.map(function(p){ return {grand: p.grand, mini: p.mini}; })};
    var envoyees = F.nouvelles.slice();
    appelService(corps).then(function(r){
      F.occupe = false;
      if(r && r.ok && r.commentaire){
        F.id = r.commentaire.id;
        var ps = r.commentaire.photos || [];
        // les photos envoyées deviennent des photos gardées (miniatures déjà affichées, gardées en cache)
        F.nouvelles = F.nouvelles.filter(function(n){ return envoyees.indexOf(n) < 0; });
        var nb = F.photos.length; F.photos = ps.map(function(p){ return {g: p.g, m: p.m}; });
        envoyees.forEach(function(n, k){ var p = ps[nb + k]; if(p) ccImgGarder(p.m, n.miniUrl, true); });
        dessinerPhotos();
        dire(rdHeureEnreg());
        ["tout", "derniere"].forEach(function(d){ try { localStorage.removeItem("ldld-cc-"+d+"-"+F.dep); } catch(e){} delete CC.liste[d+"-"+F.dep]; });
      } else { F.sale = true; dire((r && r.erreur) || "Non enregistré · nouvel essai"); F.t = setTimeout(enregistrer, 4000); }
      if(F.sale && CC.form === F && valide()) { clearTimeout(F.t); F.t = setTimeout(enregistrer, 700); }
    }).catch(function(){ F.occupe = false; F.sale = true; dire("Réseau indisponible · nouvel essai"); F.t = setTimeout(enregistrer, 4000); });
  }
  function ccListeCacheVider(dep){ ["tout", "derniere"].forEach(function(d){ delete CC.liste[d+"-"+dep]; try { localStorage.removeItem("ldld-cc-"+d+"-"+dep); } catch(e){} }); }
  document.getElementById("ccdate").oninput = function(){ F.date = this.value; planifier(); };
  document.getElementById("cctexte").oninput = function(){ F.texte = this.value; planifier(); };
  Array.prototype.forEach.call(document.querySelectorAll("#cctype button"), function(b){ b.onclick = function(){ F.type = b.getAttribute("data-t"); Array.prototype.forEach.call(document.querySelectorAll("#cctype button"), function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); planifier(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("#ccdep button"), function(b){ b.onclick = function(){ F.dep = b.getAttribute("data-d"); Array.prototype.forEach.call(document.querySelectorAll("#ccdep button"), function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); planifier(); }; });
  var fi = document.getElementById("ccfichier");
  
  fi.onchange = function(){
    var fs = Array.prototype.slice.call(fi.files || [], 0, Math.max(0, 5 - tous().length)); fi.value = "";
    if(!fs.length) return;
    dire("Préparation des photos");
    var suite = Promise.resolve();
    fs.forEach(function(f){ suite = suite.then(function(){ return ccReduire(f).then(function(p){ if(tous().length < 5) F.nouvelles.push({grand: p.grand, mini: p.mini, miniUrl: p.miniUrl, m: ""}); }, function(){}); }); });
    suite.then(function(){ dessinerPhotos(); planifier(); if(!F.texte.trim()) dire("Écrivez le commentaire pour enregistrer les photos"); });
  };
  dessinerPhotos();
}
