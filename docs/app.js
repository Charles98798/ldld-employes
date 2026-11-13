// Défilement: selon l'appareil, c'est la fenêtre ou le corps de la page qui défile; on lit et on règle les deux.
function lireY(){ return Math.max(window.scrollY || 0, document.body ? document.body.scrollTop : 0, document.documentElement.scrollTop || 0); }
(function(){ var st = window.scrollTo.bind(window); window.scrollTo = function(x, y){ try{ st(x, y); }catch(e){} if(typeof y === "number" && document.body){ document.body.scrollTop = y; document.documentElement.scrollTop = y; } }; })();
// Pictogrammes de l'accueil : blocs carrés pleins sur une grille de 24, couleur du texte.
var PICTOS = {
 "Mes heures": "M2 2h20v20h-20zM5 5h14v14h-14zM11 6 L13 6 L13 11 L17 11 L17 13 L11 13z",
 "Messages": "M2 3h20v3h-20zM2 6h3v12h-3zM19 6h3v12h-3zM2 18h20v3h-20zM5 6h3v3h-3zM8 9h3v3h-3zM11 9h2v3h-2zM13 9h3v3h-3zM16 6h3v3h-3z",
 "Tableau de bord": "M2 3h20v18h-20zM5 8h14v10h-14zM7 13h3v5h-3zM11 10h3v8h-3zM15 12h2v6h-2z",
 "Calendrier": "M2 5h20v5h-20zM2 12h3v7h-3zM19 12h3v7h-3zM2 19h20v3h-20zM6 2h3v3h-3zM15 2h3v3h-3zM13 13h4v4h-4z",
 "Rencontre": "M3 3h6v6h-6zM2 11h8v10h-8zM14 7h6v6h-6zM13 15h8v6h-8z",
 "Autoévaluation": "M2 5h12v2h-12zM18 5h4v2h-4zM14 2h4v8h-4zM2 11h4v2h-4zM10 11h12v2h-12zM6 8h4v8h-4zM2 17h13v2h-13zM19 17h3v2h-3zM15 14h4v8h-4z",
 "Rémunération": "M10 0h4v3h-4zM5 3h14v3h-14zM5 6h4v4h-4zM5 10h14v4h-14zM15 14h4v4h-4zM5 18h14v3h-14zM10 21h4v3h-4z",
 "Manuel": "M6 2h16v20h-16zM2 5h6v3h-6zM2 11h6v3h-6zM2 17h6v3h-6zM11 6h8v2h-8zM11 11h8v2h-8z",
 "Plan d'incendie": "M12 2 L18 9 L18 16 L14 22 L8 22 L5 17 L5 12 L8 9 L9 12 L12 8zM10 15h4v4h-4z",
 "Mon profil": "M8 2h8v8h-8zM4 12h16v10h-16z",
 "Nouveau message": "M2 3h20v3h-20zM2 6h3v9h-3zM19 6h3v9h-3zM2 15h20v3h-20zM5 18h4v4h-4zM8 8h8v2h-8zM8 11h5v2h-5z",
 "Contacts": "M7 1h10v22h-10zM9 4h6v13h-6zM10.5 19h3v2h-3z",
 "Messages envoyés": "M4 4h18v3h-18zM4 7h3v9h-3zM19 7h3v9h-3zM4 16h18v3h-18zM7 7h3v3h-3zM10 10h3v3h-3zM13 10h3v3h-3zM16 7h3v3h-3zM0 5h3v3h-3zM0 10h3v3h-3zM0 15h3v3h-3z",
 "Rencontres demandées": "M9 5h6v6h-6zM7 12h10v10h-10zM18 2h3v10h-3z",
 "Entretien machinerie": "M2 19h20v3h-20zM3 9h4v10h-4zM9 9h6v10h-6zM17 4h4v15h-4zM4 3h3v6h-3zM15 9h2v3h-2z",
 "Positionnement employé": "M4 4h16v3h-16zM4 17h16v3h-16zM4 7h3v10h-3zM17 7h3v10h-3zM10 0h4v4h-4zM10 20h4v4h-4zM0 10h4v4h-4zM20 10h4v4h-4zM10 10h4v4h-4z",
 "Échelle salariale": "M2 3h20v4h-20zM2 9h4v3h-4zM8 9h4v3h-4zM14 9h4v3h-4zM19 9h3v12h-3zM2 14h4v3h-4zM8 14h4v3h-4zM14 14h4v3h-4zM2 19h4v2h-4zM8 19h4v2h-4zM14 19h4v2h-4z",
 "Indicateurs": "M3 12h5v9h-5zM10 6h5v15h-5zM17 2h5v19h-5z",
 "Ratios par catégorie": "M2 5h16v5h-16zM2 14h11v5h-11zM20 3h2v18h-2z",
 "Ventes vs an passé": "M2 12h4v9h-4zM7 8h4v13h-4zM13 14h4v7h-4zM18 4h4v17h-4z",
 "Trésorerie": "M4 3h16v4h-16zM2 10h16v4h-16zM6 17h16v4h-16z",
 "Comptes clients": "M3 3h18v18h-18zM7 8h10v2h-10zM7 12h10v2h-10zM7 16h5v2h-5z",
 "Production": "M2 4h6v6h-6zM9 4h6v6h-6zM16 4h6v6h-6zM2 13h20v3h-20zM4 18h4v4h-4zM16 18h4v4h-4z",
 "Contrôle": "M2 2h20v20h-20zM5 5h14v14h-14zM7 12h3v3h-3zM10 15h3v3h-3zM13 9h3v6h-3z",
 "Finances": "M4 1h16v22h-16zM7 4h10v5h-10zM7 12h3v3h-3zM11 12h2v3h-2zM14 12h3v3h-3zM7 17h3v3h-3zM11 17h2v3h-2zM14 17h3v3h-3z",
 "Conseil d'administration": "M5 9h14v6h-14zM6 4h4v3h-4zM14 4h4v3h-4zM6 17h4v3h-4zM14 17h4v3h-4zM2 10h2v4h-2zM20 10h2v4h-2z",
 "Employés": "M3 4h6v6h-6zM15 4h6v6h-6zM3 13h18v8h-18z",
 "Employé actuel": "M8 2h8v8h-8zM4 12h16v10h-16zM10 15h4v4h-4z",
 "Réunion production": "M2 2h20v11h-20zM5 5h14v5h-14zM2 15h20v3h-20zM4 18h3v4h-3zM17 18h3v4h-3z",
 "Retirer un employé": "M2 2h8v8h-8zM1 12h11v10h-11zM14 8.5h9v3h-9z",
 "Nouvel employé": "M2 2h8v8h-8zM1 12h11v10h-11zM17 5h3v3.5h-3zM17 11.5h3v3.5h-3zM14 8.5h9v3h-9z",
 "Envoi salarial": "M2 3h8v8h-8zM14 13h8v8h-8zM17 2h3v3h-3zM14 6h3v3h-3zM11 10h3v3h-3zM8 14h3v3h-3zM5 18h3v3h-3z",
 "Utilisation": "M7 4h10v3h-10zM3 7h4v3h-4zM17 7h4v3h-4zM1 10h3v4h-3zM20 10h3v4h-3zM3 14h4v3h-4zM17 14h4v3h-4zM7 17h10v3h-10zM9 9h6v6h-6z",
 "Direction": "M2 3h11v9h-11zM14 9h8v9h-8z",
 "Gestionnaire": "M2 3h11v9h-11zM14 9h8v9h-8z",
 "Suivi de charge": "M11 2h2v18h-2zM3 5h18v2h-18zM2 8h7v5h-7zM15 8h7v5h-7zM6 20h12v2h-12z",
 "Stationnement": "M2 2h20v20h-20zM5 5h14v14h-14zM11 5h2v14h-2z",
 "Casier": "M2 2h20v20h-20zM4 4h7v7h-7zM13 4h7v7h-7zM4 13h7v7h-7zM13 13h7v7h-7z",
 "États financiers": "M2 3h20v5h-20zM2 10h13v5h-13zM17 10h5v5h-5zM2 17h20v4h-20z",
 "Finance": "M2 2h2v20h-2zM2 20h20v2h-20zM6 16 L10 11 L14 14 L21 5 L21 9 L14 18 L10 15 L6 19z",
 "Portrait d’un employé": "M2 2h20v20h-20zM5 5h14v14h-14zM9 7h6v5h-6zM7 14h10v3h-10z",
 "Positionnement": "M2 17h5v5h-5zM7 12h5v10h-5zM12 7h5v15h-5zM17 2h5v20h-5z",
 "Position d’embauche": "M0 9h12v3h-12zM0 18h12v3h-12zM0 12h3v6h-3zM9 12h3v6h-3zM4 13h4v4h-4zM17 5h3v3.5h-3zM17 11.5h3v3.5h-3zM14 8.5h9v3h-9z",
};
function picto(n){ return PICTOS[n] ? '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="'+PICTOS[n]+'"/></svg>' : '▪ '; }
// Étape 1 : démarrage, connexion et menu. Aucune donnée réelle : la connexion et les sections sont des gabarits.
var SECTIONS = ["Messages", "Manuel d'employé", "Autoévaluation", "Rémunération", "Tableau de bord", "Plan d'incendie", "Calendrier", "Rencontre", "Mon profil", "Mes heures"];
var app = document.getElementById("app");
// Pictogramme à gauche du titre de chaque page de section (même jeu que le menu de l'accueil).
var PICTO_TITRES = {"mes heures":"Mes heures","messages":"Messages","tableau de bord":"Tableau de bord","calendrier":"Calendrier","rencontre":"Rencontre","autoévaluation":"Autoévaluation","rémunération":"Rémunération","manuel d'employé":"Manuel","plan d'incendie":"Plan d'incendie","mon profil":"Mon profil","mes entretiens":"Entretien machinerie","direction":"Direction","gestionnaire":"Gestionnaire","suivi de charge":"Suivi de charge","stationnement":"Stationnement","casier":"Casier","finance":"Finance","états financiers":"États financiers","portrait d'un employé":"Portrait d’un employé","positionnement embauche":"Positionnement"};
var dernierTitre = "";
// Retour: on revient à la même place dans la page précédente (position mémorisée par page), pas en haut de l'écran.
var POS_PAGE = {}, RETOUR_T = 0, ARRET_POS = null;
function clePos(){ return app.querySelector(".menu") ? "__menu" : dernierTitre; }
function retourRecent(){ return Date.now() - RETOUR_T < 2000; }
function reprendrePos(cle){
  var y = POS_PAGE[cle]; if(!retourRecent() || !y){ return false; }
  // Le contenu de la page précédente peut arriver après coup (listes, bandeaux): on réessaie jusqu'à 3 s, sauf si la personne fait défiler elle-même.
  var stop = false, t0 = Date.now(), ar = function(){ stop = true; }; ARRET_POS = ar;
  window.addEventListener("touchstart", ar, {once:true, passive:true}); window.addEventListener("wheel", ar, {once:true, passive:true});
  var f = function(){ if(stop) return; if(Math.abs(lireY() - y) > 2) window.scrollTo(0, y); if(Date.now() - t0 < 3000) setTimeout(f, 100); };
  f(); requestAnimationFrame(f);
  return true;
}
document.addEventListener("click", function(e){
  var t = e.target; if(!t || !t.closest) return;
  if(ARRET_POS){ ARRET_POS(); ARRET_POS = null; }
  if(t.closest("a.retour, a.rt")){ RETOUR_T = Date.now(); return; }
  // Toute autre ouverture (onglet de l'accueil, bouton, lien) s'ouvre en haut: on annule le « retour récent ».
  if(t.closest("a, button") && !t.closest(".bl")){ RETOUR_T = 0; POS_PAGE[clePos()] = lireY(); }
}, true);
function decorerTitres(){
  Array.prototype.forEach.call(app.querySelectorAll(".page:not(.vue) > h1:not([data-pt]), .page:not(.vue) > .pph > h1:not([data-pt]), .page:not(.vue) #pe > h1:not([data-pt]), .page:not(.vue) #ea_app > h1:not([data-pt]), .page:not(.vue) #pt > h1:not([data-pt])"), function(h){
    h.setAttribute("data-pt", "1");
    // Nouvelle page (titre différent): on repart en haut, sinon le titre reste caché sous l'heure du téléphone
    if(h.textContent !== dernierTitre){ dernierTitre = h.textContent; if(!reprendrePos(dernierTitre)){ window.scrollTo(0, 0); requestAnimationFrame(function(){ window.scrollTo(0, 0); }); setTimeout(function(){ if(lireY() < 140) window.scrollTo(0, 0); }, 350); } }
    var page = h.closest(".page"), retour = page.querySelector("a.retour");
    var bl = document.createElement("div"); bl.className = "bl" + (h.parentNode === page ? "" : " sa");
    var fl = document.createElement("a"); fl.className = "rt"; fl.href = "#"; fl.textContent = "←"; fl.setAttribute("aria-label", "Retour");
    fl.onclick = function(e){ e.preventDefault(); if(retour) retour.click(); };
    h.parentNode.insertBefore(bl, h); bl.appendChild(fl); h.classList.add("ti"); bl.appendChild(h);
    page.classList.add("bl-ok");
    if(/^manuel/i.test(h.textContent.trim())) page.classList.add("p-manuel");
    if(retour) page.appendChild(retour);
  });
}
function majRetour(){
  Array.prototype.forEach.call(app.querySelectorAll(".page.bl-ok > a.retour"), function(r){
    var bl = r.parentNode.querySelector(".bl");
    var vu = !bl || bl.getBoundingClientRect().bottom > 0;
    r.style.display = vu ? "none" : "";
  });
}
new MutationObserver(function(){ decorerTitres(); majRetour(); }).observe(app, {childList: true, subtree: true});
window.addEventListener("scroll", majRetour, {passive: true});
document.addEventListener("scroll", majRetour, {passive: true, capture: true});   // le défilement peut venir de body: il ne remonte pas à window
setInterval(majRetour, 400);
// Filet général: jamais une page avec seulement son titre. Si rien d'autre n'est affiché, « Un instant » apparaît; il disparaît dès qu'il y a du contenu.
function filetVide(){
  var pg = app.querySelector(".page"); if(!pg) return;
  var c = pg.cloneNode(true); Array.prototype.forEach.call(c.querySelectorAll(".bl, a.retour, .auto-instant, h1, .vub, .pph, script, style"), function(x){ x.remove(); });
  var plein = c.innerText.replace(/\s+/g, "").length > 0 || !!c.querySelector("input,select,textarea,button,img,svg,canvas,a");
  var m = pg.querySelector(".auto-instant");
  if(plein){ if(m) m.remove(); return; }
  if(!m){ m = document.createElement("div"); m.className = "bandeau auto-instant"; m.textContent = "▪ UN INSTANT"; var r = pg.querySelector("a.retour"); pg.insertBefore(m, r || null); }
}
setInterval(filetVide, 300);
window.addEventListener("resize", majRetour);

// Ordre d'affichage de l'accueil (choisi par la direction) : numéros de SECTIONS. Messages 0, Manuel 1, Autoévaluation 2, Rémunération 3, Tableau de bord 4, Plan d'incendie 5, Calendrier 6, Rencontre 7, Mon profil 8.
var PICTO_DE = ["Messages", "Manuel", "Autoévaluation", "Rémunération", "Tableau de bord", "Plan d'incendie", "Calendrier", "Rencontre", "Mon profil", "Mes heures"];
var ORDRE_MENU = [9, 0, 4, 6, 7, 2, 3, 1, 5, 8];

function demarrage(){
  app.innerHTML = '<div class="demarrage"><div class="lgx" role="img" aria-label="Lafond Desjardins laboratoire dentaire">'+'<img class="p1" src="assets/LDLD_logo_complet_blanc_transparent.png" alt="">'+'<img class="p2" src="assets/LDLD_logo_complet_blanc_transparent.png" alt="">'+'<img class="p3" src="assets/LDLD_logo_complet_blanc_transparent.png" alt="">'+'</div></div>';
  MOI_PRE = null; var s0 = sessionGardee();
  if(s0 && !lireMoi(s0)) MOI_PRE = appelService({action:"moi", session:s0});   // demandé pendant l'animation, pas après
  setTimeout(ouvrirSession, 2300);
}
var MOI_PRE = null;
// Identité gardée sur l'appareil (nom, rôle): le menu s'ouvre à la fin de l'animation, la vérification se fait en silence. Effacée à la déconnexion (préfixe ldld-c-).
function lireMoi(s){ if(VUE.on || vueComme()) return null; try { var v = JSON.parse(localStorage.getItem("ldld-c-moi")); return v && v.s === s && v.r && v.r.ok ? v.r : null; } catch(e){ return null; } }
function garderMoi(s, r){ if(VUE.on || vueComme()) return; try { localStorage.setItem("ldld-c-moi", JSON.stringify({s: s, r: r})); } catch(e){} }
// Service LDLD (Google Apps Script) : connexion par code envoyé au courriel LDLD; il ne répond qu'avec les données de l'employé connecté.
var URL_SERVICE = "https://script.google.com/macros/s/AKfycbwq9SXysg5GHL6GsPFBSTmoKZzm9_wGr4E3W0e-RzXcHeknz5_DMBFIxBarHHczgpwnZw/exec";
var MOI = null;   // {nom, poste, responsable} après connexion
var FILE_APPELS = [], APPELS_EN_COURS = 0, APPELS_MAX = 3, ARRIERE = false;   // au plus 5 appels en même temps; les préchargements (arrière-plan) en occupent au plus 4: une place reste toujours libre pour un clic
function enArriere(f){ var a = ARRIERE; ARRIERE = true; try { return f(); } finally { ARRIERE = a; } }
function appelBrut(corps){
  var bg = ARRIERE;
  return new Promise(function(ok, ko){ var x = {c: corps, ok: ok, ko: ko, bg: bg}; if(bg) FILE_APPELS.push(x); else FILE_APPELS.unshift(x); suiteAppels(); });   // un clic passe avant les préchargements
}
var EN_VOL = [];   // appels partis, avec leur heure: si l'appareil les fige (iPhone en arrière-plan), la place est libérée de force
function suiteAppels(){
  var nu = Date.now();
  EN_VOL = EN_VOL.filter(function(v){ if(!v.fini && nu - v.t > 45000){ v.fini = true; APPELS_EN_COURS = Math.max(0, APPELS_EN_COURS - 1); try { if(v.ctl) v.ctl.abort(); } catch(e){} v.ko(new Error("delai")); return false; } return !v.fini; });
  while(APPELS_EN_COURS < APPELS_MAX && FILE_APPELS.length){
    if(FILE_APPELS[0].bg && APPELS_EN_COURS >= APPELS_MAX - 1) break;
    var x = FILE_APPELS.shift(); APPELS_EN_COURS++;
    (function(x){
      var v = {t: Date.now(), fini: false, ko: x.ko, ctl: null}; if(x.c && x.c.action === "docusign_envoyer") v.t += 130000; EN_VOL.push(v);
      appelDirect(x.c, function(c){ v.ctl = c; }).then(function(r){ if(!v.fini){ v.fini = true; APPELS_EN_COURS--; x.ok(r); } }, function(e){ if(!v.fini){ v.fini = true; APPELS_EN_COURS--; x.ko(e); } }).then(suiteAppels);
    })(x);
  }
}
setInterval(suiteAppels, 5000);
document.addEventListener("visibilitychange", function(){ if(!document.hidden) suiteAppels(); });
// Copie de lecture (Supabase, par le « guichet »). Seulement les heures, seulement quand l'interrupteur « heures » indique la copie, jamais en vue « employé au hasard », jamais de salaire. Au moindre doute (jeton, réseau, copie vide, vieille, d'un autre jour), la lecture directe de Google prend le relais: jamais de chiffre faux.
var COPIE = {url:null, jeton:null, exp:0, interr:null, interrT:0, hors:0, prep:null};
function torontoMaintenant(){
  var p = {}; new Intl.DateTimeFormat("en-CA", {timeZone:"America/Toronto", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", weekday:"short", hourCycle:"h23"}).formatToParts(new Date()).forEach(function(x){ p[x.type] = x.value; });
  return {date: p.year + "-" + p.month + "-" + p.day, min: Number(p.hour) * 60 + Number(p.minute), semaine: !/^(Sat|Sun)/.test(p.weekday)};
}
function minutesTexte(t){ var m = /^(\d{1,2}):(\d{2})/.exec(String(t || "")); return m ? Number(m[1]) * 60 + Number(m[2]) : null; }
// Même calcul que le service (total du jour): segments entrée/sortie, segment ouvert jusqu'à maintenant, dîner d'une heure déduit s'il n'y a qu'une entrée et que la fin dépasse 13 h, plus l'ajustement.
function totalJourCopie(pts, aj, now){
  if(!pts.length) return null;
  var p = pts.map(function(x){ return {h: minutesTexte(x.t), s: x.s}; }); if(p.some(function(x){ return x.h === null; })) return undefined;
  p.sort(function(a, b){ return a.h - b.h; });
  var t = 0, debut = null, n = 0;
  p.forEach(function(x){ if(x.s === "entree"){ n++; if(debut === null) debut = x.h; } else if(x.s === "sortie" && debut !== null){ t += x.h - debut; debut = null; } });
  if(debut !== null) t += Math.max(0, now - debut);
  if(n === 1){ var sorties = p.filter(function(x){ return x.s === "sortie"; }).length, fin = sorties ? p[p.length - 1].h : now; if(fin > 780) t = Math.max(0, t - 60); }
  return t + (aj || 0);
}
function guichetCopie(corps){
  var ctl = window.AbortController ? new AbortController() : null, t = ctl ? setTimeout(function(){ ctl.abort(); }, 6000) : 0;
  return fetch(COPIE.url, {method:"POST", headers:{"Content-Type":"application/json", "Authorization":"Bearer " + COPIE.jeton}, body: JSON.stringify(corps), signal: ctl ? ctl.signal : undefined})
    .then(function(r){ clearTimeout(t); if(!r.ok) throw new Error("guichet " + r.status); return r.json(); }, function(e){ clearTimeout(t); throw e; });
}
function copiePreparer(corps){
  if(COPIE.jeton && COPIE.exp - Date.now() > 120000 && COPIE.interr && Date.now() - COPIE.interrT < 240000) return Promise.resolve();   // jeton de 5 min: renouvelé en arrière-plan dès qu'il lui reste moins de 2 min
  if(COPIE.prep) return COPIE.prep;
  var p = appelDirectGoogle({action:"jeton_copie", session: corps && corps.session !== undefined ? corps.session : sessionGardee()}).then(function(r){
    if(!r || !r.ok || !r.jeton || !r.url) throw new Error("jeton");
    COPIE.url = r.url; COPIE.jeton = r.jeton; COPIE.exp = r.exp > 1e12 ? r.exp : r.exp * 1000;
    return guichetCopie({action:"interrupteur"});
  }).then(function(d){ if(!d || !d.ok) throw new Error("interrupteur"); COPIE.interr = {}; (d.interrupteurs || []).forEach(function(x){ COPIE.interr[x.domaine] = x.source; }); COPIE.interrT = Date.now(); });
  COPIE.prep = p; var fin = function(){ COPIE.prep = null; }; p.then(fin, fin); return p;
}
function copiePrete(){ return COPIE.jeton && COPIE.exp - Date.now() > 10000 && COPIE.interr && Date.now() - COPIE.interrT < 290000; }
function copieHeures(corps){
  return guichetCopie({action:"lire", domaine:"heures", cle:""}).then(function(d){
    if(!d || !d.ok || d.vide || !d.reponse) throw new Error("vide");
    var r = d.reponse, nu = torontoMaintenant();
    if(!r.ok || r.auj !== nu.date) throw new Error("jour");                                  // la copie date d'un autre jour: on lit Google
    if(typeof r.calcMin !== "number" || typeof r.ajAuj !== "number") throw new Error("ancienne");   // publiée avant l'ajout du moment de calcul: on lit Google
    if(nu.semaine && nu.min >= 6 * 60 && nu.min <= 19 * 60 && Date.now() - Date.parse(d.maj_t) > 45 * 60000) throw new Error("vieille");   // en journée, la copie est rafraîchie aux 10 à 25 min
    var v = totalJourCopie(r.pointagesAuj || [], r.ajAuj, nu.min); if(v === undefined) throw new Error("format");
    r.minutesAuj = v; (r.cette || []).forEach(function(x){ if(x.date === r.auj) x.min = v; });
    return r;
  });
}
// La copie ne retarde jamais une lecture: tant qu'elle n'est pas prête (jeton + interrupteur), Google répond, et la préparation se fait en arrière-plan.
function appelDirect(corps, vu){
  if(corps && corps.action === "heures" && !VUE.on && !vueComme() && Date.now() > COPIE.hors){
    if(!copiePrete()){ copiePreparer(corps).catch(function(){ COPIE.hors = Date.now() + 600000; }); return appelDirectGoogle(corps, vu); }
    if(COPIE.exp - Date.now() < 120000 || Date.now() - COPIE.interrT > 240000) copiePreparer(corps).catch(function(){});   // renouvellement silencieux: la lecture en cours utilise encore le jeton valide
    if(COPIE.interr.heures === "copie") return copieHeures(corps).catch(function(e){ if(!/^(jour|ancienne|vide)$/.test(String(e && e.message))) COPIE.hors = Date.now() + 60000; return appelDirectGoogle(corps, vu); });
  }
  return appelDirectGoogle(corps, vu);
}
function appelDirectGoogle(corps, vu){
  var ctl = window.AbortController ? new AbortController() : null; if(vu) vu(ctl);
  var  t = ctl ? setTimeout(function(){ ctl.abort(); }, corps && corps.action === "docusign_envoyer" ? 170000 : 60000) : 0;   // jamais de « CHARGEMENT… » sans fin
  return fetch(URL_SERVICE, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body: JSON.stringify(corps), signal: ctl ? ctl.signal : undefined})
    .then(function(r){ clearTimeout(t); return r.json(); }, function(e){ clearTimeout(t); throw e; });
}

// Lectures préchargées en mémoire: la page s'ouvre sans attente. Valide 3 min; toute écriture vide tout; rafraîchi en silence si plus vieux que 20 s.
var RCACHE = {};
var LECT = {rd_points_lire:1, rd_planif_lire:1, rd_capsules_lire:1, production_lire:1, tableau_courant:1, heures:1, charges_jours:1, calendrier_labo:1, ech_donnees:1, emp_donnees:1, embauche_donnees:1, embauche_avantages:1, pos_donnees:1, charge_equipe:1, employes_etat:1, entretien_lire:1, parking_lire:1, rencontre_liste:1, utilisation:1, equipe_groupes:1, agenda_mes:1, agenda_liste:1, prefs_lire:1, portrait:1};
var NEUTRE = {tableau_courant:1, moi:1, sortie:1, code:1, salaire_lire:1, agenda_semaine:1, agenda_semaines:1, messages:1, tableau:1, incendie_texte:1, manuel_texte:1, calendrier:1, ae_lire:1, charges_jours:1, calendrier_labo:1, embauche_attente:1, embauche_brouillon:1, embauche_brouillon_maj:1, embauche_choix:1, embauche_responsabilites:1};
function copie(r){ return JSON.parse(JSON.stringify(r)); }
// Copie gardée sur l'appareil (affichée tout de suite à l'ouverture, remplacée en silence par la version fraîche). JAMAIS de salaire ni de rémunération (Portrait, Échelle, Positionnement, Embauche, Employé actuel restent en mémoire seulement).
// Données de l'employé lui-même: toutes les personnes. Données d'équipe: Direction seulement. Tout est effacé à la déconnexion (préfixe ldld-c-).
var PERSO_PROPRE = {heures:1, agenda_mes:1, rencontre_liste:1, prefs_lire:1, entretien_lire:1, charges_jours:1, calendrier_labo:1};
var PERSO_DIRECTION = {production_lire:1, charge_equipe:1, parking_lire:1, equipe_groupes:1, utilisation:1, agenda_liste:1};
function persoOk(a){ return !VUE.on && !vueComme() && (PERSO_PROPRE[a] || (PERSO_DIRECTION[a] && MOI && MOI.role === "direction")); }
function hachage(t){ var h = 5381; for(var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function clePerso(k){ return "ldld-c-r-" + hachage(k); }
function lirePerso(a, k){ if(!persoOk(a)) return null; try { var v = JSON.parse(localStorage.getItem(clePerso(k))); return v && v.r ? v : null; } catch(e){ return null; } }
function ecrirePerso(a, k, r){ if(!persoOk(a)) return; try { localStorage.setItem(clePerso(k), JSON.stringify({t: Date.now(), r: r})); } catch(e){} }
function viderPerso(){ try { Object.keys(localStorage).forEach(function(k){ if(k.indexOf("ldld-c-r-") === 0) localStorage.removeItem(k); }); } catch(e){} }
// Vue « employé au hasard » (Direction seulement, lecture seule): pendant qu'elle est active, la session de l'employé tiré sert aux appels et rien n'est gardé en cache local.
var VUE = {on:false, reel:null, session:null, nom:"", relancer:null};
function cleLecture(c){ var o = {}; Object.keys(c).forEach(function(k){ if(k !== "session") o[k] = c[k]; }); if(VUE.on) o._v = VUE.session; return JSON.stringify(o); }
var VUE_LECT = {tableau:1, messages:1, ae_lire:1};   // en vue « employé au hasard » seulement: lectures préparées d'avance et gardées 30 min
var RC_GEN = 0;   // monte à chaque vidage du cache: une lecture partie avant une écriture ne peut plus remettre une copie périmée
var RD_FRAIS = /^rd_(points_lire|planif_lire|chiffres|capsules_lire|base_lire|commentaires_lire)$/;   // Réunion production: toujours lu frais (la copie locale instantanée est gérée par la page)
function appelService(corps){
  var a = corps && corps.action;
  if(RD_FRAIS.test(a || "")) return appelBrut(corps);
  if(!LECT[a] && !(VUE.on && VUE_LECT[a])){ if(!NEUTRE[a] && !/_liste$|_fichier$/.test(a || "")){ RCACHE = {}; RC_GEN++; viderPerso(); } return appelBrut(corps); }
  var k = cleLecture(corps), e = RCACHE[k], t = Date.now();
  if(e && t - e.t < 1800000){
    if(t - e.t > 20000 && !e.maj){ e.maj = 1; var g0 = RC_GEN; enArriere(function(){ return appelBrut(corps); }).then(function(r){ if(r && r.ok && g0 === RC_GEN){ RCACHE[k] = {t: Date.now(), p: Promise.resolve(r)}; ecrirePerso(a, k, r); } }).catch(function(){}); }
    return e.p.then(copie);
  }
  var v = lirePerso(a, k);
  if(v){   // copie gardée sur l'appareil: affichée tout de suite, version fraîche chargée en silence
    RCACHE[k] = {t: t, p: Promise.resolve(v.r), maj: 1}; var g1 = RC_GEN;
    enArriere(function(){ return appelBrut(corps); }).then(function(r){ if(r && r.ok && g1 === RC_GEN){ RCACHE[k] = {t: Date.now(), p: Promise.resolve(r)}; ecrirePerso(a, k, r); } }).catch(function(){});
    return Promise.resolve(copie(v.r));
  }
  var p = appelBrut(corps); RCACHE[k] = {t: t, p: p};
  p.then(function(r){ if(r && r.ok) ecrirePerso(a, k, r); if(!(r && r.ok) && RCACHE[k] && RCACHE[k].p === p) delete RCACHE[k]; }, function(){ if(RCACHE[k] && RCACHE[k].p === p) delete RCACHE[k]; });
  return p.then(copie);
}
function prechargerLectures(){
  if(!MOI) return;
  if(prechargerLectures.t && Date.now() - prechargerLectures.t < 600000) return;   // au plus une fois par 10 minutes: le service garde ces lectures 1 h, inutile de les redemander à chaque retour à l'accueil
  prechargerLectures.t = Date.now();
  var l = [{action:"heures"}, {action:"agenda_mes"}, {action:"rencontre_liste"}, {action:"prefs_lire"}, {action:"entretien_lire"}];
  if(MOI.role === "direction" || MOI.role === "responsable") l = l.concat([{action:"charge_equipe"}, {action:"entretien_lire"}, {action:"parking_lire"}, {action:"equipe_groupes"}, {action:"utilisation"}, {action:"agenda_liste"}]);
  if(MOI.role === "direction") l = l.concat([{action:"production_lire"}, {action:"employes_etat"}, {action:"emp_donnees"}, {action:"ech_donnees"}, {action:"embauche_donnees"}, {action:"embauche_avantages"}, {action:"pos_donnees"}, {action:"portrait", id:""}]);
  var i = 0; function suite(){ if(i >= l.length) return; var c = l[i++]; c.session = sessionGardee(); var e = RCACHE[cleLecture(c)]; ((e && Date.now() - e.t < 150000) ? Promise.resolve() : enArriere(function(){ return appelService(c); }).catch(function(){})).then(suite); }
  suite(); setTimeout(suite, 300); setTimeout(suite, 600);
}

// Tout est préchargé avant l'arrivée sur la page : copie locale affichée tout de suite, vérification silencieuse ensuite.
var CACHE = {};
function lireCache(cle){ if(VUE.on) return null; if(CACHE[cle]) return CACHE[cle]; try { var v = JSON.parse(localStorage.getItem("ldld-c-"+cle)); if(v) CACHE[cle] = v; return v; } catch(e){ return null; } }
function chercher(cle, corps){
  corps.session = sessionGardee();
  return appelService(corps).then(function(r){ if(r && r.ok && !VUE.on){ CACHE[cle] = r; try { localStorage.setItem("ldld-c-"+cle, JSON.stringify(r)); } catch(e){} } return r; });
}
function viderCache(){ CACHE = {}; RCACHE = {}; COPIE = {url:null, jeton:null, exp:0, interr:null, interrT:0, hors:0, prep:null}; precharger.t = 0; MOI_PRE = null; VUE_PRE = null; try { Object.keys(localStorage).forEach(function(k){ if(k.indexOf("ldld-c-") === 0) localStorage.removeItem(k); }); } catch(e){} }
/** Affiche la copie locale (sans écran de chargement) puis remplace en silence si la version a changé. */
function obtenir(cle, corps, afficher, erreur, majSilencieuse){
  var local = lireCache(cle);
  if(local){ afficher(local);
    if(majSilencieuse) chercher(cle, corps).then(function(r){ if(r && r.ok && JSON.stringify(r) !== JSON.stringify(local)) afficher(r); }).catch(function(){});
    return; }
  chercher(cle, corps).then(function(r){ if(!r || !r.ok){ var e = new Error("service"); e.reponse = r; throw e; } afficher(r); }).catch(erreur);
}
function pastilleMessages(){
  var a = app.querySelector('a[data-i="0"]'); if(!a) return;
  var m = lireCache("messages"), l = lus(), n = m && m.messages ? m.messages.filter(function(x){ return !x.envoye && l.indexOf(x.id) < 0; }).length : 0;
  var p = a.querySelector(".nombre"); if(p) p.remove();
  if(n){ p = document.createElement("span"); p.className = "nombre"; p.textContent = pastilleTexte(n); a.appendChild(p); }
  pastilleDirection();
}
function nbDemandesNeuves(){
  var m = lireCache("messages"), l = lus();
  return m && m.messages ? m.messages.filter(function(x){ return !x.envoye && /^Demande de rencontre/.test(x.titre) && l.indexOf(x.id) < 0; }).length : 0;
}
function pastilleTexte(n){ return n + (n > 1 ? " nouveaux" : " nouveau"); }
function pastilleDirection(){
  var a = app.querySelector('a[data-k="rencontres_demandees"]'); if(!a) return;
  var p = a.querySelector(".nombre"); if(p) p.remove();
  var t = a.querySelector(".nbtot"); if(t) t.remove();
  var m = lireCache("messages"), tot = m && m.messages ? m.messages.filter(function(x){ return !x.envoye && /^Demande de rencontre/.test(x.titre); }).length : 0;
  t = document.createElement("span"); t.className = "nbtot"; t.textContent = String(tot); a.appendChild(t);
  if(nbDemandesNeuves()) t.className = "nbtot nombre";   // vert seulement s'il y a du nouveau
}
// Une autoévaluation est disponible 14 jours avant la date de la rencontre, jusqu'à ce jour inclus, et seulement si elle n'est pas terminée.
function aeARemplir(m){
  if(m.terminee || !/^\d{4}-\d\d-\d\d$/.test(m.date || "")) return false;
  var p = m.date.split("-"), j = new Date(+p[0], +p[1]-1, +p[2]), t = new Date(); t = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  var diff = Math.round((j - t) / 86400000);
  return diff >= 0 && diff <= 14;
}
function aeDateTxt(iso){ var p = /^(\d{4})-(\d\d)-(\d\d)/.exec(iso || ""); return p ? (+p[3] === 1 ? "1er" : +p[3]) + " " + MOIS_LONGS[+p[2]-1] + " " + p[1] : ""; }
// Toucher la ligne ouvre directement l'autoévaluation disponible; sinon « Non disponible » reste 5 secondes sur la ligne, sans autre page.
// Lignes à programmer plus tard: un toucher affiche « À venir » 5 secondes sur la ligne.
function bientot(x){
  var a = app.querySelector('a[data-k="'+x.id+'"]'); if(!a) return;
  var p = a.querySelector(".pasnon"); if(p) p.remove();
  var n = document.createElement("span"); n.className = "pastille pasnon"; n.textContent = "À venir"; a.appendChild(n);
  setTimeout(function(){ if(n.parentNode) n.remove(); }, 5000);
}
function aeNonDispo(){
  var a = app.querySelector('a[data-i="2"]'); if(!a) return;
  var p = a.querySelector(".pastille"); if(p) p.remove();
  var n = document.createElement("span"); n.className = "pastille pasnon"; n.textContent = "Non disponible"; a.appendChild(n);
  setTimeout(function(){ if(n.parentNode) n.remove(); pastilleAuto(); }, 5000);
}
function aeEntree(){
  var ae = lireCache("ae");
  if(ae && ae.rencontres && !(MOI && MOI.role === "direction" && !vueComme()) && !ae.rencontres.some(aeARemplir)) return aeNonDispo();
  section(2);
}
function pastilleAuto(){
  var a = app.querySelector('a[data-i="2"]'); if(!a) return;
  var ae = lireCache("ae"), reste = ae && ae.rencontres && ae.rencontres.some(aeARemplir);
  var p = a.querySelector(".pastille"); if(p) p.remove();
  if(reste){ p = document.createElement("span"); p.className = "pastille"; p.textContent = "Disponible"; a.appendChild(p); }
}
function precharger(){
  if(precharger.t && Date.now() - precharger.t < 180000) return;   // au plus une fois par 3 minutes, même si on revient souvent au menu
  precharger.t = Date.now();
  enArriere(precharger2);
}
function prechargerAgendas(){
  try {
    var lu = DH_CACHE.agendas ? Promise.resolve() : appelService({action:"agenda_liste", session:sessionGardee()}).then(function(r){ if(r && r.ok && r.agendas) DH_CACHE.agendas = r.agendas.filter(function(a){ return a.ecriture; }); });
    lu.then(function(){
      var sel = []; try { sel = JSON.parse(localStorage.getItem("ldld-agendas") || "[]"); } catch(e){}
      if(!sel.length) sel = ["primary"];
      var deb = isoJour(lundiDe(new Date()));
      sel.forEach(function(id){ appelService({action:"agenda_semaine", session:sessionGardee(), debut:deb, agenda:id}).then(function(r){ if(r && r.ok){ try { localStorage.setItem("ldld-cs-"+id+"-"+deb, JSON.stringify(r.evenements || [])); localStorage.setItem("ldld-cj-"+id+"-"+deb, JSON.stringify((r.journee || []).map(function(e){ return {ag: id, id: e.id, titre: e.titre, d1: e.debut, d2: e.fin || e.debut}; }))); } catch(e){} } }).catch(function(){}); });
    }).catch(function(){});
  } catch(e){}
}
function precharger2(){
  chercher("heures", {action:"heures"}).catch(function(){});   // les heures en premier: page la plus ouverte, lecture la plus lente
  chercher("messages", {action:"messages"}).then(pastilleMessages).catch(function(){});
  chercher("tableau", {action:"tableau"}).catch(function(){});
  chercher("tableau_courant", {action:"tableau_courant"}).catch(function(){});
  chercher("incendie_texte", {action:"incendie_texte"}).catch(function(){});
  chercher("manuel_texte", {action:"manuel_texte"}).catch(function(){});
  chercher("calendrier", {action:"calendrier"}).catch(function(){});
  if(MOI && (MOI.role === "direction" || MOI.role === "responsable")) prechargerAgendas();
  chercher("stationnement", {action:"stationnement"}).catch(function(){});
  if(MOI && (MOI.role === "direction" || MOI.role === "responsable")) chercher("contacts", {action:"contacts"}).catch(function(){});
  chercher("ae", {action:"ae_lire"}).then(function(r){
    pastilleAuto();
    if(r && r.ok && r.rencontres) r.rencontres.forEach(function(m){ chercher("ae"+m.rencontre, {action:"ae_lire", rencontre:m.rencontre}).catch(function(){}); });
  }).catch(function(){});
}
function sessionGardee(){ if(VUE.on) return VUE.session; try { return localStorage.getItem("ldld-session"); } catch(e){ return null; } }
function garderSession(s){ if(!s) viderCache(); try { if(s) localStorage.setItem("ldld-session", s); else localStorage.removeItem("ldld-session"); } catch(e){} }
function ouvrirSession(){
  var s = sessionGardee();
  if(!s) return connexion();
  var local = lireMoi(s);
  if(local){
    MOI = local; menu();
    appelService({action:"moi", session:s}).then(function(r){
      if(r && r.ok){ garderMoi(s, r); if(JSON.stringify(r) !== JSON.stringify(local)){ MOI = r; if(app.querySelector(".menu.accueil")) menu(); } }
      else if(r && r.ok === false){ garderSession(null); MOI = null; connexion(); }
    }).catch(function(){});
    return;
  }
  (MOI_PRE || appelService({action:"moi", session:s})).then(function(r){
    if(r && r.ok){ garderMoi(s, r); MOI = r; menu(); } else { garderSession(null); connexion(); }
  }).catch(function(){ connexion("Pas de réseau. Réessayez."); });
}
// Vue « comme un employé » (Direction seulement, lecture seule, 2 h): le service donne une session lecture seule; la session de la direction reste de côté.
function vueComme(){ try { return !!localStorage.getItem("ldld-session-direction"); } catch(e){ return false; } }
function voirComme(nom){
  appelService({action:"voir_comme", nom:nom, session:sessionGardee()}).then(function(r){
    if(r && r.ok){ try { localStorage.setItem("ldld-session-direction", sessionGardee()); localStorage.setItem("ldld-session", r.session); } catch(e){} viderCache(); location.reload(); }
    else alert((r && r.erreur) || "Indisponible.");
  }).catch(function(){ alert("Réseau indisponible."); });
}
function revenirDeComme(){
  var d = null, c = sessionGardee(); try { d = localStorage.getItem("ldld-session-direction"); localStorage.removeItem("ldld-session-direction"); if(d) localStorage.setItem("ldld-session", d); } catch(e){}
  if(c) appelService({action:"sortie", session:c}).catch(function(){});
  viderCache(); location.reload();
}
function deconnecter(){
  try { localStorage.removeItem("ldld-session-direction"); } catch(e){}
  var s = sessionGardee(); garderSession(null); MOI = null;
  if(s) appelService({action:"sortie", session:s}).catch(function(){});
  connexion();
}
function connexion(message){
  app.innerHTML = '<div class="connexion"><div class="logo lgx" role="img" aria-label="Lafond Desjardins"><img class="p1" src="assets/LDLD_logo_complet_blanc_transparent.png" alt=""><img class="p2" src="assets/LDLD_logo_complet_blanc_transparent.png" alt=""><img class="p3" src="assets/LDLD_logo_complet_blanc_transparent.png" alt=""></div>' +
    '<div class="formc"><label class="etq" for="courriel">▪ COURRIEL</label><input class="champ ligne3" id="courriel" type="email" inputmode="email" autocomplete="email" placeholder="nom@exemple.com">' +
    '<button class="bouton" id="envoi">Recevoir mon code</button></div>' +
    '<p class="aide" id="msg">'+(message||"")+'</p><div class="pied-connexion"><span class="ldld"><b>L</b><b>D</b><b>L</b><b>D</b></span><span class="emp"><b>E</b><b>M</b><b>P</b><b>L</b><b>O</b><b>Y</b><b>É</b><b>S</b></span></div></div>';
  document.getElementById("envoi").onclick = function(){
    var c = document.getElementById("courriel").value.trim().toLowerCase(), msg = document.getElementById("msg");
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c)){ msg.textContent = "Entrez votre courriel."; return; }
    msg.textContent = "Envoi du code…";
    // L'écran de saisie s'ouvre tout de suite (le courriel peut arriver avant la réponse du service); une erreur renvoie au courriel avec le message.
    var ouvert = false;
    var arrive = setTimeout(function(){ ouvert = true; saisieCode(c); }, 2500);
    appelService({action:"code", courriel:c}).then(function(r){
      clearTimeout(arrive);
      if(r && r.ok === false && !ouvert){ connexion((r.erreur || "Envoi impossible. Réessayez.")); return; }
      if(!ouvert) saisieCode(c);
    }).catch(function(){
      clearTimeout(arrive);
      if(!ouvert) msg.textContent = "Envoi impossible. Vérifiez le réseau et réessayez.";
    });
  };
}
function saisieCode(c){
  app.innerHTML = '<div class="connexion"><img class="logo" width="120" height="100" src="assets/LDLD_logo_complet_blanc_transparent.png" alt="Lafond Desjardins">' +
    '<div class="formc"><label class="etq" for="code">▪ CODE À 6 CHIFFRES</label><input class="champ ligne3" id="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" style="letter-spacing:6px;font-size:24px">' +
    '<button class="bouton" id="valider">Se connecter</button></div>' +
    '<p class="aide" id="msg">Code envoyé à '+esc(c)+'. Il est valide 10 minutes. Vérifiez aussi les indésirables.</p>' +
    '<p class="aide"><a href="#" id="autre">Changer de courriel</a></p></div>';
  document.getElementById("autre").onclick = function(e){ e.preventDefault(); connexion(); };
  document.getElementById("valider").onclick = function(){
    var code = document.getElementById("code").value.replace(/\D/g,""), msg = document.getElementById("msg");
    if(code.length !== 6){ msg.textContent = "Entrez les 6 chiffres du code."; return; }
    msg.textContent = "Vérification…";
    appelService({action:"verifier", courriel:c, code:code}).then(function(r){
      if(r && r.ok){ try { localStorage.setItem("ldld-courriel", c); } catch(e){} garderSession(r.session); MOI = r; garderMoi(r.session, r); menu(); } else { msg.textContent = "Code invalide ou expiré. Demandez-en un nouveau."; }
    }).catch(function(){ msg.textContent = "Connexion impossible. Réessayez."; });
  };
}
// Notifications (Web Push). Actives par défaut : la demande s'affiche à la première connexion; l'employé peut les couper dans Mon profil.
var VAPID_PUBLIC = "BGiQdAGk_BJzz2lA1osvltqAXV9h01dUGPH1ByDqgo9loCXi-VnLLxzmlCrd0XHdQNck0wHax2SWw0g0kcccIbg";
function notifPossible(){ return ("serviceWorker" in navigator) && ("PushManager" in window) && ("Notification" in window); }
function cleBinaire(b64){ var p = "=".repeat((4 - b64.length % 4) % 4), r = atob((b64 + p).replace(/-/g, "+").replace(/_/g, "/")), o = new Uint8Array(r.length); for(var i = 0; i < r.length; i++) o[i] = r.charCodeAt(i); return o; }
function abonnerNotifs(){
  return navigator.serviceWorker.ready.then(function(reg){
    return reg.pushManager.getSubscription().then(function(s){ return s || reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey: cleBinaire(VAPID_PUBLIC)}); });
  }).then(function(s){ return appelService({action:"abonner", session:sessionGardee(), endpoint:s.endpoint}); });
}
function demanderNotifs(){
  if(!notifPossible()) return Promise.resolve(false);
  return Notification.requestPermission().then(function(p){ return p === "granted" ? abonnerNotifs().then(function(){ return true; }) : false; });
}
function couperNotifs(){
  return navigator.serviceWorker.ready.then(function(reg){ return reg.pushManager.getSubscription(); }).then(function(s){
    if(!s) return; var ep = s.endpoint; return s.unsubscribe().then(function(){ return appelService({action:"desabonner", session:sessionGardee(), endpoint:ep}); });
  });
}
function ecranNotifs(){
  app.innerHTML = '<div class="menu"><img class="logo" width="120" height="100" src="assets/LDLD_logo_complet_blanc_transparent.png" alt="Lafond Desjardins"><div class="nom">Notifications</div>' +
    '<p class="aide" style="padding:0 24px">Soyez avisé dès qu\'un message arrive ou qu\'un document est mis à jour. Aucun détail confidentiel n\'est affiché. Vous pouvez les couper à tout moment dans Mon profil.</p>' +
    '<a href="#" id="notifOui">▪ Activer les notifications</a><a href="#" id="notifPlus" style="opacity:.85">Plus tard</a></div>';
  function fini(){ try { localStorage.setItem("ldld-notif-demande", "1"); } catch(e){} menu(); }
  document.getElementById("notifOui").onclick = function(e){ e.preventDefault(); demanderNotifs().then(fini).catch(fini); };
  document.getElementById("notifPlus").onclick = function(e){ e.preventDefault(); fini(); };
}
// Accueil « Aujourd'hui »: rencontres du jour (agenda principal), carré vert devant chaque ligne; rien d'affiché s'il n'y en a pas.
var AUJ = null;
function heureFr(d){ var h = d.getHours(), m = d.getMinutes(); return h+" h"+(m ? " "+("0"+m).slice(-2) : ""); }
function dessinerAujourdhui(){
  var z = document.getElementById("auj"); if(!z) return; var t = new Date(), iso = isoJour(t);
  var l = (AUJ || []).filter(function(e){
    if(e.journee){ var d1 = String(e.debut).slice(0, 10), d2 = String(e.fin || e.debut).slice(0, 10); return d1 <= iso && (iso < d2 || d1 === d2 && d1 === iso); }
    return isoJour(new Date(e.debut)) === iso && new Date(e.fin || e.debut) >= t; });
  if(!l.length){ z.innerHTML = ""; return; }
  z.innerHTML = '<div class="aujb"><b></b><b></b></div><div class="aujl">'+l.map(function(e){
    if(e.journee) return '<div>Journée · '+esc(e.titre || "")+'</div>';
    var d = new Date(e.debut), fait = new Date(e.fin || e.debut) < t;
    return '<div'+(fait ? ' class="fait"' : "")+'>'+heureFr(d)+' · '+esc(String(e.titre || "").trim() || "Sans titre")+'</div>'; }).join("")+'</div>';
}
function auj_normalise(liste, jour){
  // Tous les événements du jour, une seule fois chacun: clé = uid Google s'il existe, sinon horaire + titre; on garde la ligne qui a un titre.
  var nomme = {}, vu = {}, r = [];
  liste.forEach(function(e){ if(String(e.titre || "").trim()) nomme[e.debut] = 1; });
  liste.slice().sort(function(x, y){ return new Date(x.debut) - new Date(y.debut); }).forEach(function(e){
    var t = String(e.titre || "").trim(), h = e.debut+"|"+e.fin; if(!t && nomme[e.debut]) return;
    var k = e.uid ? "u|"+e.uid : t.toLowerCase()+"|"+e.debut; if(vu[k]) return; vu[k] = 1; r.push(e); });
  var jj = [], vj = {};
  (jour || []).forEach(function(e){ var t = String(e.titre || "").trim(); if(!t) return; var k = e.uid ? "u|"+e.uid : t.toLowerCase()+"|"+e.debut; if(vj[k]) return; vj[k] = 1; jj.push({titre: t, journee: true, debut: e.debut, fin: e.fin || e.debut}); });
  return jj.concat(r);
}
function chargerAujourdhui(){
  var t = new Date(); t.setHours(0, 0, 0, 0); dessinerAujourdhui();
  var deb = isoJour(lundiDe(t)), plusieurs = roleIdx() >= 1;
  var fin = function(liste, jour){ AUJ = auj_normalise(liste, jour); dessinerAujourdhui(); };
  if(!plusieurs){
    appelService({action:"agenda_semaine", session:sessionGardee(), debut:deb, agenda:"primary"}).then(function(r){ if(r && r.ok) fin(r.evenements || [], r.journee || []); }).catch(function(){});
    return;
  }
  var lu = DH_CACHE.agendas ? Promise.resolve() : appelService({action:"agenda_liste", session:sessionGardee()}).then(function(r){ if(r && r.ok && r.agendas) DH_CACHE.agendas = r.agendas.filter(function(a){ return a.ecriture; }); });
  lu.then(function(){
    var ids = (DH_CACHE.agendas || []).map(function(a){ return a.id; }).slice(0, 8); if(ids.indexOf("primary") < 0) ids.unshift("primary");
    return appelService({action:"agenda_semaines", session:sessionGardee(), agendas:ids, debut:deb, nb:1});
  }).then(function(r){
    if(!(r && r.ok && r.semaines)) return;
    var tous = [], jj = []; r.semaines.forEach(function(w){ (w.evenements || []).forEach(function(e){ tous.push(e); }); (w.journee || []).forEach(function(e){ jj.push(e); }); });
    fin(tous, jj);
  }).catch(function(){});
}
// Accueil unique: chaque entrée a un groupe, un pictogramme et des droits par défaut [employé, responsable, direction].
// La page Contrôle (Direction) peut changer les droits des entrées non verrouillées; le service refuse aussi l'accès.
var ENT = [
 {id:"mes_heures", g:"Mon travail", h:1, l:"Mes heures", p:"Mes heures", d:[1,1,1], i:9, f:function(){ section(9); }},
 {id:"messages", g:"Mon travail", h:1, l:"Message reçu", p:"Messages", d:[1,1,1], i:0, f:function(){ section(0); }},
 {id:"tableau_de_bord", g:"Mon travail", h:1, l:"Tableau de bord", p:"Tableau de bord", d:[1,1,1], i:4, f:function(){ section(4); }},
 {id:"calendrier", g:"Mon travail", l:"Calendrier", p:"Calendrier", d:[1,1,1], i:6, f:function(){ section(6); }},
 {id:"rencontre", g:"Mon travail", l:"Demander rencontre", p:"Rencontres demandées", d:[1,1,1], i:7, f:function(){ section(7); }},
 {id:"autoevaluation", g:"Mon compte", h:1, l:"Autoévaluation", p:"Autoévaluation", d:[1,1,1], i:2, f:function(){ aeEntree(); }},
 {id:"remuneration", g:"Mon compte", l:"Rémunération", p:"Rémunération", d:[1,1,1], i:3, v:1, f:function(){ section(3); }},
 {id:"mon_profil", g:"Mon compte", l:"Mon profil", p:"Mon profil", d:[1,1,1], i:8, f:function(){ section(8); }},
 {id:"contacts", g:"Équipe", l:"Contact", p:"Contacts", d:[0,1,1], f:function(){ contactsResp(); }},
 {id:"nouveau_message", g:"Équipe", l:"Calendrier \u25aa notification", p:"Nouveau message", d:[0,1,1], f:function(){ nouveau("message"); }},
 {id:"messages_envoyes", g:"Équipe", l:"Historique message", p:"Messages envoyés", d:[0,1,1], f:function(){ messages("envoyes"); }},
 {id:"reunion_production", g:"Équipe", l:"Réunion production", p:"Réunion production", d:[1,1,1], f:function(){ rencontreDept(); }},
 {id:"rencontres_demandees", g:"Équipe", l:"Rencontre demandée", p:"Rencontres demandées", d:[0,1,1], f:function(){ messages("rencontres"); }},
 {id:"employe_actuel", g:"Gestion des employés", l:"Employé actuel", p:"Employé actuel", d:[0,0,1], f:function(){ eaOuvrir(); }},
 {id:"positionnement_embauche", g:"Gestion des employés", l:"Position d’embauche", p:"Position d’embauche", n:1, d:[0,0,1], f:function(){ embauchePos(); }},
 {id:"nouvel_employe", g:"Gestion des employés", l:"Contrat d’embauche", p:"Nouvel employé", n:2, d:[0,0,1], v:1, f:function(){ nouvelEmploye(); }},
 {id:"retirer_employe", g:"Gestion des employés", l:"Retirer un employé", p:"Retirer un employé", d:[0,0,1], f:function(){ gestionEmployes(); }},
 {id:"portrait", g:"Gestion des employés", l:"Portrait d’un employé", p:"Portrait d’un employé", d:[0,0,1], f:function(){ portrait(); }},
 {id:"suivi_charge", g:"Gestion des employés", l:"Suivi de charge", p:"Suivi de charge", d:[0,1,1], f:function(){ suiviCharge(); }},
 {id:"echelle_salariale", g:"Gestion des employés", l:"Échelle salariale", p:"Échelle salariale", d:[0,0,1], v:1, f:function(){ echOuvrir(); }},
 {id:"positionnement_employe", g:"Gestion des employés", l:"Position employé", p:"Positionnement employé", d:[0,0,1], f:function(){ posEmpOuvrir(); }},
 {id:"envoi_salarial", g:"Gestion des employés", l:"Envoi salarial", p:"Envoi salarial", d:[0,0,1], v:1, f:function(){ bientot(this); }},
 {id:"stationnement", g:"Installations", l:"Stationnement", p:"Stationnement", d:[0,1,1], f:function(){ attributionPage("place"); }},
 {id:"casier", g:"Installations", l:"Casier", p:"Casier", d:[0,1,1], f:function(){ attributionPage("casier"); }},
 {id:"entretien_machinerie", g:"Installations", l:"Entretien machinerie", p:"Entretien machinerie", d:[1,1,1], f:function(){ entretien(); }},
 {id:"conseil", g:"Finances", l:"Conseil d’admin.", p:"Conseil d'administration", d:[0,0,1], f:function(){ financeMenu(); }},
 {id:"finances", g:"Finances", l:"Finances", p:"Finances", d:[0,0,1], v:1, f:function(){ financesMenu(); }},
 {id:"conseil_production", g:"Finances", l:"Conseil · Production", p:"Production", d:[0,0,1], s:1},
 {id:"conseil_indicateurs", g:"Finances", l:"Conseil · Indicateurs", p:"Indicateurs", d:[0,0,1], s:1},
 {id:"conseil_ratios", g:"Finances", l:"Conseil · Ratios en %", p:"Ratios par catégorie", d:[0,0,1], s:1},
 {id:"finances_indicateurs", g:"Finances", l:"Finances · Indicateurs", p:"Indicateurs", d:[0,0,1], v:1, s:1},
 {id:"finances_ratios", g:"Finances", l:"Finances · Ratios en $", p:"Ratios par catégorie", d:[0,0,1], v:1, s:1},
 {id:"finances_ventes", g:"Finances", l:"Finances · Ventes vs an passé", p:"Ventes vs an passé", d:[0,0,1], v:1, s:1},
 {id:"finances_tresorerie", g:"Finances", l:"Finances · Trésorerie", p:"Trésorerie", d:[0,0,1], v:1, s:1},
 {id:"finances_clients", g:"Finances", l:"Finances · Comptes clients", p:"Comptes clients", d:[0,0,1], v:1, s:1},
 {id:"finances_etats", g:"Finances", l:"Finances · États financiers", p:"États financiers", d:[0,0,1], v:1, s:1},
 {id:"manuel", g:"Documents", l:"Manuel d’employé", p:"Manuel", d:[1,1,1], i:1, f:function(){ section(1); }},
 {id:"plan_incendie", g:"Documents", l:"Plan d’incendie", p:"Plan d'incendie", d:[1,1,1], i:5, f:function(){ section(5); }},
 {id:"utilisation", g:"Contrôle", l:"Utilisation app", p:"Utilisation", d:[0,0,1], f:function(){ utilisationApp(); }},
 {id:"controle", g:"Contrôle", l:"Contrôle", p:"Contrôle", d:[0,0,1], v:1, f:function(){ controleOuvrir(); }}
];
var ENT_PAR_ID = {}; ENT.forEach(function(x){ ENT_PAR_ID[x.id] = x; });
var ORDRE_EMPLOYE = ["mes_heures","messages","tableau_de_bord","calendrier","rencontre","autoevaluation","remuneration","manuel","plan_incendie","mon_profil","entretien_machinerie"];
var DROITS_SERVICE = null;   // {id: true/false} pour mon rôle, lu du service (action onglets_lire); absent = droits par défaut
function roleIdx(){ return MOI && MOI.role === "direction" ? 2 : (MOI && MOI.role === "responsable" ? 1 : 0); }
function entreeOk(x){
  var r = roleIdx();
  if(x.id === "calendrier" && r >= 1) return false;   // Gestionnaire et Direction: le calendrier est dans « Calendrier ▪ notification »
  if(x.v) return !!x.d[r];
  if(DROITS_SERVICE && DROITS_SERVICE.hasOwnProperty(x.id)) return !!DROITS_SERVICE[x.id];
  return !!x.d[r];
}
function entreesVisibles(){
  var l = ENT.filter(function(x){ return !x.s && entreeOk(x); });
  if(!peutEcrire()){ var o = ORDRE_EMPLOYE; l.sort(function(a, b){ var x = o.indexOf(a.id), y = o.indexOf(b.id); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y); }); }
  return l;
}
function menu(){
  vueFin();
  var dejaDemande = false; try { dejaDemande = localStorage.getItem("ldld-notif-demande") === "1"; } catch(e){}
  if(notifPossible() && !dejaDemande && Notification.permission === "default") return ecranNotifs();
  if(notifPossible() && Notification.permission === "granted" && !menu.abonne){ menu.abonne = true; abonnerNotifs().catch(function(){}); }
  if(!menu.precharge){ menu.precharge = true; prechargerDocs(); }
  precharger(); setTimeout(prechargerLectures, 400);
  if(MOI && MOI.role === "direction" && !menu.attPre){ menu.attPre = true; setTimeout(function(){ neAttCharger(true).catch(function(){ menu.attPre = false; }); }, 25000); }
  var animer = !menu.anime; menu.anime = true;
  if(!menu.onglets){ menu.onglets = true; chargerDroits(); }
  var vis = entreesVisibles(), grp = peutEcrire(), h = "", g = "";
  vis.forEach(function(x){
    if(grp && x.g !== g){ g = x.g; h += '<div class="gtit">▪ '+esc(g)+'</div>'; }
    h += '<a href="#" data-k="'+x.id+'"'+(x.i !== undefined ? ' data-i="'+x.i+'"' : "")+'><span>'+picto(x.p)+esc(x.l)+(x.h && MOI.role === "direction" ? '<b class="ast">*</b>' : "")+(x.n ? '<b class="nc">'+x.n+'</b>' : "")+'</span></a>';
  });
  if(MOI.role === "direction" && !menu.prechargeDir){ menu.prechargeDir = true; try { posEmpPrecharger(); embPrecharger(); } catch(e){} }
  app.innerHTML = '<div class="menu accueil'+(animer ? ' anim' : '')+'"><img class="logo sym" width="110" src="assets/LDLD_symbole_blanc_transparent.png" alt="Lafond Desjardins"><div id="envg"></div><div id="auj"></div>' + h +
    (vueComme() ? '<a href="#" id="rcommefin">Revenir à mon compte</a>' : '') +
    '<a class="sortie" href="#" id="sortie">Déconnexion</a></div>';
  dernierTitre = "";
  if(!reprendrePos("__menu")) window.scrollTo(0, 0);   // l'accueil s'ouvre en haut, sauf au retour d'une page (même place qu'avant)
  if(animer) Array.prototype.forEach.call(app.querySelectorAll(".menu a:not(.sortie)"), function(a, k){ var dl = (0.7 + Math.min(k, 12) * 0.09) + "s"; a.style.animationDelay = dl; var ic = a.querySelector(".ic"); if(ic) ic.style.animationDelay = dl; });
  Array.prototype.forEach.call(app.querySelectorAll("a[data-k]"), function(a){
    a.onclick = function(e){ e.preventDefault(); var x = ENT_PAR_ID[a.getAttribute("data-k")]; if(x) x.f(); };
  });
  var rcf = document.getElementById("rcommefin"); if(rcf) rcf.onclick = function(e){ e.preventDefault(); revenirDeComme(); };
  document.getElementById("sortie").onclick = function(e){ e.preventDefault(); deconnecter(); };
  neEnvDessiner(); pastilleAuto(); pastilleMessages(); chargerAujourdhui();
  ajusterMenu();
  vuePreparer(sessionGardee());
}
// Aucun nom sur deux lignes: la taille du texte de l'accueil diminue (pour toutes les lignes à la fois) jusqu'à ce que chaque nom tienne sur une seule ligne.
function ajusterMenu(){
  var m = app.querySelector(".menu.accueil"); if(!m) return;
  var L = Array.prototype.slice.call(m.querySelectorAll("a[data-k]")); if(!L.length) return;
  var t = 21, ok = false;
  while(t >= 12 && !ok){
    m.style.setProperty("--ft", t + "px");
    var mn = Math.min.apply(null, L.map(function(a){ return a.offsetHeight; }));
    ok = L.every(function(a){ return a.offsetHeight <= mn + 6; });
    if(!ok) t -= 0.5;
  }
}
window.addEventListener("resize", function(){ try { ajusterMenu(); } catch(e){} });
// Étape 2 : messages, lus et écrits par le service Google Apps Script (chaque employé ne reçoit que les siens).
var MESSAGES = [];
function lus(){ try { return JSON.parse(localStorage.getItem("ldld-lus") || "[]"); } catch(e){ return []; } }
function noterLu(id){ var l = lus(); if(l.indexOf(id) < 0){ l.push(id); try { localStorage.setItem("ldld-lus", JSON.stringify(l)); } catch(e){} } }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
var MOIS = ["JANV.","FÉVR.","MARS","AVR.","MAI","JUIN","JUIL.","AOÛT","SEPT.","OCT.","NOV.","DÉC."];
function dateCourte(t){ var d = new Date(t); return d.getDate()+" "+MOIS[d.getMonth()]+" "+d.getFullYear(); }
function peutEcrire(){ return MOI && (MOI.role === "direction" || MOI.role === "responsable"); }
var FILTRE_MSG = "";
function messages(filtre){
  if(typeof filtre === "string") FILTRE_MSG = filtre;
  var titreMsg = FILTRE_MSG === "envoyes" ? "Historique message" : FILTRE_MSG === "rencontres" ? "Rencontre demandée" : "Message reçu";
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+titreMsg+'</h1><div id="liste"></div>' +
    (peutEcrire() && !FILTRE_MSG ? '<a class="rang" href="#" id="ecrire">▪ Écrire un message</a>' : '') + '</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); if(FILTRE_MSG){ FILTRE_MSG = ""; responsable(); } else menu(); };
  var w = document.getElementById("ecrire"); if(w) w.onclick = function(e){ e.preventDefault(); nouveau("message"); };
  obtenir("messages", {action:"messages"}, function(r){
    if(!document.getElementById("liste")) return;
    MESSAGES = r.messages; var l = lus();
    var vus = MESSAGES.filter(function(m){ return FILTRE_MSG === "envoyes" ? m.envoye : FILTRE_MSG === "rencontres" ? (!m.envoye && /^Demande de rencontre/.test(m.titre)) : true; });
    document.getElementById("liste").innerHTML = vus.length ? '<div class="lcol lcolh"><span>Date</span><span>Message</span><span>État</span></div>' + vus.map(function(m){
      var neuf = !m.envoye && l.indexOf(m.id) < 0;
      return '<a class="lcol" href="#" data-id="'+esc(m.id)+'"><span>'+dateCourte(m.date)+'</span><span>'+esc(m.titre)+'<small>'+(m.envoye ? 'Envoyé à '+m.nb+' personne'+(m.nb > 1 ? 's' : '') : esc(m.de))+'</small></span><span>'+(m.envoye ? "Envoyé" : (neuf ? "Nouveau" : "Lu"))+'</span></a>'; }).join("") : '<div class="bandeau">▪ AUCUN MESSAGE</div>';
    Array.prototype.forEach.call(app.querySelectorAll("a[data-id]"), function(a){
      a.onclick = function(e){ e.preventDefault(); detail(a.getAttribute("data-id")); };
    });
  }, function(){ document.getElementById("liste").innerHTML = '<div class="bandeau">▪ MESSAGES INDISPONIBLES · RÉESSAYEZ</div>'; }, true);
}
function detail(id){
  var m = MESSAGES.filter(function(x){ return x.id === id; })[0]; noterLu(id);
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+esc(m.titre)+'</h1><div class="date">'+esc(m.de)+' · '+dateCourte(m.date)+'</div><div class="corps">'+esc(m.texte).replace(/\n/g,"<br>")+'</div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); messages(); };
  if(!m.envoye && /^Demande de rencontre/.test(m.titre) && peutEcrire()){
    app.querySelector(".page").insertAdjacentHTML("beforeend", '<div id="rdh"></div>' +
      '<button class="bouton" id="rplan">Planifier</button><div class="bandeau" id="rep" style="display:none"></div>');
    var rep = document.getElementById("rep"); function dire(t){ rep.style.display = "block"; rep.textContent = t; }
    var dhr = dateHeure({agenda:false}); dhr.monter(document.getElementById("rdh"));
    document.getElementById("rplan").onclick = function(){
      var q = dhr.lire(); if(!q){ dhr.valider(); dire("▪ DATE ET HEURE REQUISES"); return; }
      var d = q.date, h = q.heure;
      var bt = this; bt.disabled = true; dire("▪ ENVOI…");
      appelService({action:"rencontre_planifier", session:sessionGardee(), id:id, date:d, heure:h}).then(function(r){
        if(r && r.ok){ dire("▪ RENCONTRE PLANIFIÉE · L'EMPLOYÉ EST AVISÉ"); }
        else { bt.disabled = false; dire("▪ NON PLANIFIÉE · "+((r && r.erreur) || "RÉESSAYEZ")); }
      }).catch(function(){ bt.disabled = false; dire("▪ NON PLANIFIÉE · RÉSEAU"); });
    };
  }
}
// Étape 3 : manuel. Documents d'essai; plus tard : le PDF personnel de chaque employé, listé par le service Google Apps Script.
var CACHE = "ldld-docs";
function versions(){ try { return JSON.parse(localStorage.getItem("ldld-versions") || "{}"); } catch(e){ return {}; } }
function noterVersion(id, v){ var x = versions(); x[id] = v; try { localStorage.setItem("ldld-versions", JSON.stringify(x)); } catch(e){} }
function etat(d){ var v = versions()[d.id]; return !v ? "non" : (v === d.version ? "ok" : "maj"); }
function telecharger(d){
  return fetch(d.fichier).then(function(r){
    if(!r.ok) throw 0;
    return self.caches ? caches.open(CACHE).then(function(c){ return c.put(d.fichier, r.clone()); }) : 0;
  }).then(function(){ noterVersion(d.id, d.version); });
}
// Préchargement : dès l'ouverture de l'application (menu) et à chaque retour, chaque document est téléchargé ou mis à jour en arrière-plan, avant que l'employé ouvre la section.
var DOCS_SERVICE = ["manuel", "incendie"];   // chaque nom = actions « nom_liste » et « nom_fichier » du service
function cleDoc(d){ return "doc/"+d.id+".pdf"; }
function telechargerDoc(p, d){
  return appelService({action:p+"_fichier", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0;
    var bin = atob(r.pdf), oct = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) oct[i] = bin.charCodeAt(i);
    var rep = new Response(new Blob([oct], {type:"application/pdf"}));
    return (self.caches ? caches.open(CACHE).then(function(c){ return c.put(cleDoc(d), rep); }) : 0).then(function(){ d.version = r.version; noterVersion(d.id, r.version); });
  });
}
function prechargerDocs(){
  return Promise.all(DOCS_SERVICE.map(function(p){
    return appelService({action:p+"_liste", session:sessionGardee()}).then(function(r){
      if(!r || !r.ok) return;
      try { localStorage.setItem("ldld-liste-"+p, JSON.stringify(r.documents)); } catch(e){}
      return Promise.all(r.documents.filter(function(d){ return etat(d) !== "ok"; }).map(function(d){ return telechargerDoc(p, d).catch(function(){}); }));
    }).catch(function(){});
  }));
}
document.addEventListener("visibilitychange", function(){ if(document.visibilityState === "visible" && sessionGardee() && MOI){ prechargerDocs(); precharger(); prechargerLectures(); } });
// Accès coupé (employé devenu inactif ou retiré): à chaque retour à l'application, au plus une vérification par 3 minutes; si le Service refuse, la session et toutes les données gardées sur l'appareil sont effacées.
var ACCES_T = 0;
document.addEventListener("visibilitychange", function(){
  if(document.visibilityState !== "visible" || !MOI || VUE.on || vueComme() || Date.now() - ACCES_T < 180000) return;
  var s = sessionGardee(); if(!s) return; ACCES_T = Date.now();
  appelBrut({action:"moi", session:s}).then(function(r){ if(r && r.ok === false && sessionGardee() === s){ garderSession(null); MOI = null; connexion(); } }).catch(function(){});
});
// Visionneuse intégrée (consultation seulement) : le PDF est dessiné page par page dans l'application, sans barre ni bouton d'enregistrement.
function chargerScript(src){ return new Promise(function(ok, ko){ var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
function visionneuse(titre, blob, retour){
  app.innerHTML = '<div class="page vue"><a class="retour" href="#" id="retour">Retour</a><h1>'+esc(titre)+'</h1><div id="pages"><div class="bandeau">▪ OUVERTURE…</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); retour(); };
  var zone = document.getElementById("pages");
  zone.oncontextmenu = function(e){ e.preventDefault(); };
  (window.pdfjsLib ? Promise.resolve() : chargerScript("vendor/pdf.min.js")).then(function(){
    pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdf.worker.min.js";
    return blob.arrayBuffer();
  }).then(function(buf){ return pdfjsLib.getDocument({data: buf}).promise; }).then(function(pdf){
    zone.innerHTML = "";
    var largeur = zone.clientWidth || 340, ratio = Math.min(window.devicePixelRatio || 1, 2);
    var suite = Promise.resolve();
    for(var n = 1; n <= pdf.numPages; n++){ (function(n){ suite = suite.then(function(){ return pdf.getPage(n).then(function(page){
      var v1 = page.getViewport({scale: 1}), sc = largeur / v1.width, v = page.getViewport({scale: sc * ratio});
      var c = document.createElement("canvas"); c.width = v.width; c.height = v.height; c.style.width = largeur + "px"; c.style.height = (v.height / ratio) + "px";
      zone.appendChild(c); return page.render({canvasContext: c.getContext("2d"), viewport: v}).promise; }); }); })(n); }
    return suite;
  }).catch(function(){ zone.innerHTML = '<div class="bandeau">▪ DOCUMENT INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function sectionDocs(p, titre, aide){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+titre+'</h1>' +
    '<div id="liste"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  var liste = document.getElementById("liste"), unique = false;
  function ouvrir(d, reprise){
    (self.caches ? caches.open(CACHE).then(function(c){ return c.match(cleDoc(d)); }) : Promise.resolve(null)).then(function(r){
      if(!r) throw 0; return r.blob(); }).then(function(b){ visionneuse(d.nom, b, function(){ if(unique) menu(); else sectionDocs(p, titre, aide); }); }).catch(function(){
      // copie locale absente : on la télécharge de nouveau une fois, sinon message visible
      if(!reprise) return telechargerDoc(p, d).then(function(){ ouvrir(d, true); }).catch(function(){ liste.insertAdjacentHTML("beforeend", '<div class="bandeau">▪ DOCUMENT INDISPONIBLE · RÉESSAYEZ</div>'); });
      liste.insertAdjacentHTML("beforeend", '<div class="bandeau">▪ DOCUMENT INDISPONIBLE · RÉESSAYEZ</div>');
    });
  }
  function dessinerD(docs){
    if(docs.length === 1){ unique = true; var d1 = docs[0];   // un seul document : on l'ouvre directement
      if(etat(d1) === "ok" || etat(d1) === "maj") return ouvrir(d1);
      liste.innerHTML = '<div class="bandeau">▪ OUVERTURE…</div>';
      return telechargerDoc(p, d1).then(function(){ ouvrir(d1); }).catch(function(){ liste.innerHTML = '<div class="bandeau">▪ DOCUMENT INDISPONIBLE · RÉESSAYEZ</div>'; }); }
    liste.innerHTML = docs.map(function(d){ var e = etat(d);
      return '<a class="doc" href="#" data-id="'+d.id+'"><span>▪ '+esc(d.nom)+'</span><em class="'+e+'">'+(e === "ok" || e === "maj" ? "" : "…")+'</em></a>'; }).join("");
    Array.prototype.forEach.call(liste.querySelectorAll("a.doc"), function(a){
      a.onclick = function(ev){ ev.preventDefault(); var d = docs.filter(function(x){ return x.id === a.getAttribute("data-id"); })[0];
        if(etat(d) === "ok" || etat(d) === "maj") return ouvrir(d);
        a.querySelector("em").textContent = "OUVERTURE…"; telechargerDoc(p, d).then(function(){ dessinerD(docs); ouvrir(d); }).catch(function(){ a.querySelector("em").textContent = "RÉESSAYEZ"; }); };
    });
  }
  var avant = null; try { avant = JSON.parse(localStorage.getItem("ldld-liste-"+p)); } catch(e){}
  if(avant && avant.length) dessinerD(avant);
  appelService({action:p+"_liste", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0;
    try { localStorage.setItem("ldld-liste-"+p, JSON.stringify(r.documents)); } catch(e){}
    if(avant && avant.length && JSON.stringify(avant) === JSON.stringify(r.documents)) return;
    if(unique && r.documents.length === 1 && avant && avant.length === 1 && avant[0].id === r.documents[0].id && etat(r.documents[0]) === "ok") return;
    dessinerD(r.documents);
    r.documents.filter(function(d){ return etat(d) !== "ok"; }).forEach(function(d){ telechargerDoc(p, d).then(function(){ dessinerD(r.documents); }).catch(function(){}); });
  }).catch(function(){ var l; try { l = JSON.parse(localStorage.getItem("ldld-liste-"+p)); } catch(e){} if(l) dessinerD(l); else liste.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function numTitre(t){ var m = /^(\d\d)\s+(.*)$/.exec(t); return m ? '<span class="nm">'+esc(m[1])+'</span><span class="tt">'+esc(m[2])+'</span>' : esc(t); }
// Organigramme du Manuel (l'image du document, refaite en texte): aucun nom d'employé
var ORGANIGRAMME = '<div class="org"><div class="orp">Présidence</div>' +
  '<div class="oc od">Direction de production</div><div class="og4">' +
    ["Pièce","Fixe","Acrylique"].map(function(x){ return '<div class="oc"><i>Expertise technique</i>'+x+'</div>'; }).join("") +
    '<div class="oc on ov"><i>Équipe</i>commune</div>' +
    ["Pièce","Fixe","Acrylique"].map(function(x){ return '<div class="oc on"><i>Équipe</i>'+x+'</div>'; }).join("") +
  '</div>' +
  '<div class="olg">Autres directions</div><div class="og2"><div class="ogr"><div class="ogt">Développement et expérience client</div><div class="oc on"><i>Équipe</i>administrative</div></div>' +
  '<div class="ogr"><div class="ogt">Finances et comptabilité</div></div></div></div>';
function blocsHtml(blocs){
  var nImg = 0;   // les plans d'incendie sont des images de l'application (plans/plan1.png…), dans l'ordre du document
  return blocs.map(function(b){
    if(b.t === "h") return '<h2 class="txh">'+numTitre(b.v)+'</h2>';
    if(b.t === "s") return '<div class="txs">'+esc(b.v)+'</div>';
    if(b.t === "p" && /Image à replacer\s*:\s*organigramme/i.test(String(b.v))) return ORGANIGRAMME;
    if(b.t === "p") return '<p class="txp">'+esc(b.v)+'</p>';
    if(b.t === "u") return '<div class="txu"><b>'+esc(b.titre||"")+'</b>'+esc(b.v)+'</div>';
    if(b.t === "li") return '<ul class="txl">'+b.v.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ul>';
    if(b.t === "ol") return '<ol class="txl">'+b.v.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ol>';
    if(b.t === "kv") return '<dl class="txk">'+b.v.map(function(x){ return '<dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd>'; }).join("")+'</dl>';
    if(b.t === "tab") return '<div class="txtab"><table>'+b.v.map(function(l,i){ return '<tr>'+l.map(function(c){ return (i?'<td>':'<th>')+esc(c)+(i?'</td>':'</th>'); }).join("")+'</tr>'; }).join("")+'</table></div>';
    if(b.t === "img"){ nImg++; return '<img class="txi" alt="" src="plans/plan'+nImg+'.png">'; }
    return "";
  }).join("");
}
function sansAccent(t){ return String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
// Manuel en texte : recherche par mot (sans accents ni majuscules), table des matières; sans réponse du service, l'ancien affichage PDF reste en place.
function manuel(){
  var repli = function(){ var e = document.getElementById("mn"); if(e) e.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; };
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Manuel d\'employé</h1><div id="mn"></div></div>';
  var retourSec = null;   // Retour (bouton vert et bloc ←) remonte d'un seul niveau: d'une section vers la table des matières
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); if(retourSec) retourSec(); else menu(); };
  obtenir("manuel_texte", {action:"manuel_texte"}, function(r){
    var el = document.getElementById("mn"); if(!el) return;
    if(!r.blocs){ return repli(); }
    var secs = [], cur = {titre:"", blocs:[]};
    r.blocs.forEach(function(b){ if(b.t === "h"){ if(cur.blocs.length || cur.titre) secs.push(cur); cur = {titre:b.v, blocs:[b]}; } else cur.blocs.push(b); });
    secs.push(cur);
    var prenom = MOI && MOI.nom ? String(MOI.nom).trim().split(/\s+/)[0] : "";
    if(prenom) secs.forEach(function(x){ if(/mot de la direction/i.test(x.titre || "") && !(x.blocs[1] && /^bonjour/i.test(x.blocs[1].v || ""))) x.blocs.splice(1, 0, {t:"p", v:"Bonjour "+prenom}); });
    secs.forEach(function(x){ x.texte = sansAccent(JSON.stringify(x.blocs.map(function(b){ return b.v; }))); });
    var q0 = "";
    el.innerHTML = '<input class="rech" id="rech" type="search" placeholder="Rechercher un mot" autocomplete="off" aria-label="Rechercher un mot"><div id="res"></div><div id="corps"></div>';
    var rech = document.getElementById("rech"), res = document.getElementById("res"), corps = document.getElementById("corps");
    function toc(){
      res.innerHTML = '<div class="txs">TABLE DES MATIÈRES</div><ol class="toc">'+secs.map(function(x,i){ return x.titre ? '<li><a href="#" data-s="'+i+'">'+numTitre(x.titre)+'</a></li>' : ""; }).join("")+'</ol>';
    }
    function ouvrir(i, mot){
      res.innerHTML = ""; rech.value = mot || ""; corps.innerHTML = blocsHtml(secs[i].blocs);
      if(mot) surligner(corps, mot);
      var m = corps.querySelector("mark"); window.scrollTo(0, 0); if(m) m.scrollIntoView({block:"center"});
      retourSec = function(){ retourSec = null; corps.innerHTML = ""; rech.value = mot || ""; if(mot) chercherMot(); else toc(); window.scrollTo(0, 0); };
    }
    function surligner(racine, mot){
      var n = sansAccent(mot), w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT), noeuds = [], t;
      while((t = w.nextNode())) noeuds.push(t);
      noeuds.forEach(function(nd){
        var txt = nd.nodeValue, bas = sansAccent(txt), k = bas.indexOf(n); if(k < 0 || bas.length !== txt.length) return;
        var f = document.createDocumentFragment(), d = 0;
        while(k >= 0){ f.appendChild(document.createTextNode(txt.slice(d, k))); var m = document.createElement("mark"); m.textContent = txt.slice(k, k+n.length); f.appendChild(m); d = k+n.length; k = bas.indexOf(n, d); }
        f.appendChild(document.createTextNode(txt.slice(d))); nd.parentNode.replaceChild(f, nd);
      });
    }
    function chercherMot(){
      var mot = rech.value.trim(); corps.innerHTML = "";
      if(mot.length < 2){ toc(); return; }
      var n = sansAccent(mot), out = [];
      secs.forEach(function(x,i){
        var plats = x.blocs.reduce(function(a,b){ return a.concat(b.t === "li" || b.t === "ol" ? b.v : b.t === "kv" ? [].concat.apply([], b.v) : b.t === "tab" ? [].concat.apply([], b.v) : typeof b.v === "string" ? [b.v] : []); }, []);
        plats.forEach(function(p){ var k = sansAccent(p).indexOf(n); if(k >= 0 && sansAccent(p).length === p.length) out.push({i:i, p:p, k:k}); });
      });
      res.innerHTML = '<div class="txs">'+out.length+' RÉSULTAT'+(out.length > 1 ? "S" : "")+'</div>' + out.slice(0, 60).map(function(o){
        var a = Math.max(0, o.k-40), ext = o.p.slice(a, o.k+n.length+80);
        var h = esc(ext).replace(new RegExp("("+esc(o.p.slice(o.k, o.k+n.length)).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")+")", "i"), "<mark>$1</mark>");
        return '<a href="#" class="nrs" data-s="'+o.i+'"><b>'+esc(secs[o.i].titre || "Introduction")+'</b>'+(a ? "… " : "")+h+'</a>';
      }).join("");
    }
    res.onclick = function(e){ var a = e.target.closest("a[data-s]"); if(!a) return; e.preventDefault(); ouvrir(+a.getAttribute("data-s"), rech.value.trim().length >= 2 ? rech.value.trim() : ""); };
    rech.oninput = chercherMot;
    toc();
  }, repli, true);
}
// Plan d'incendie en texte (blocs lus dans le document Google par le service); sans réponse du service, l'ancien affichage PDF reste en place.
function incendie(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Plan d\'incendie</h1><div id="txt"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  obtenir("incendie_texte", {action:"incendie_texte"}, function(r){
    var el = document.getElementById("txt"); if(!el) return;
    if(!r.blocs){ el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; return; }
    var blocs = r.blocs.filter(function(b){ return !(typeof b.v === "string" && /laboratoire dentaire lafond desjardins et associ/i.test(b.v) && /dition/i.test(b.v)); }).map(function(b){
      return b.t === "kv" ? {t:b.t, v:b.v.filter(function(x){ return !/^entreprise$/i.test(String(x[0]).trim()); })} : b; });
    el.className = "colonnes"; el.innerHTML = blocsHtml(blocs);
  }, function(){ var e = document.getElementById("txt"); if(e) e.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; }, true);
}
// Salaire : protégé par un code envoyé au courriel (valable 10 minutes, session salaire de 15 minutes d'inactivité).
// Règle de sécurité : l'application ne calcule rien et ne garde aucun montant sur le téléphone; elle affiche les valeurs du dossier salarial, lues à chaque ouverture.
function dollars(n){ return n === null || n === undefined || n === "" ? "—" : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " $"; }
function taux(n){ var x = parseFloat(String(n).replace(",", ".")); return isNaN(x) ? "—" : x.toFixed(2).replace(".", ","); }
function pctTxt(p){ var x = parseFloat(String(p).replace("%", "").replace(",", ".")); if(isNaN(x)) return String(p); if(x <= 1.5) x = x * 100; return Math.round(x) + " %"; }
function salaire(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Rémunération</h1><div id="sa"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  appelService({action:"salaire_lire", session:sessionGardee()}).then(function(r){
    if(r && r.ok) return salaireEcran(r, 0);
    if(r && r.code) return salaireCode(true);
    document.getElementById("sa").innerHTML = '<div class="bandeau">▪ '+esc((r && r.erreur) || "SALAIRE INDISPONIBLE")+'</div>';
  }).catch(function(){ document.getElementById("sa").innerHTML = '<div class="bandeau">▪ SALAIRE INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function salaireCode(envoyer){
  var zone = document.getElementById("sa");
  zone.innerHTML = '<div class="etiq">▪ CODE DE SÉCURITÉ</div><p class="aide" id="samsg" style="font-size:15px">Pour protéger votre salaire, entrez le code de 6 chiffres envoyé à votre courriel. Il est valable 10 minutes.</p>' +
    '<div class="cases" id="cases">'+[0,1,2,3,4,5].map(function(i){ return '<input inputmode="numeric" maxlength="1" autocomplete="'+(i ? 'off' : 'one-time-code')+'" aria-label="Chiffre '+(i+1)+'">'; }).join("")+'</div>' +
    '<a class="doc" href="#" id="nouveau" style="margin-top:18px"><span>▪ Envoyer un nouveau code</span></a><p class="aide">Aucun montant n\'est gardé sur votre téléphone.</p>';
  var msg = document.getElementById("samsg"), champs = Array.prototype.slice.call(document.querySelectorAll("#cases input"));
  function envoi(){ msg.textContent = "Envoi du code…"; appelService({action:"salaire_code", session:sessionGardee()}).then(function(r){
    msg.textContent = r && r.ok ? "Code envoyé à votre courriel. Il est valable 10 minutes. Vérifiez aussi les indésirables." : ((r && r.erreur) || "Envoi impossible."); }).catch(function(){ msg.textContent = "Envoi impossible. Réessayez."; }); }
  function valider(){
    var code = champs.map(function(c){ return c.value; }).join("");
    if(code.length !== 6) return;
    msg.textContent = "Vérification…";
    appelService({action:"salaire_verifier", session:sessionGardee(), code:code}).then(function(r){
      if(r && r.ok) return salaire();
      champs.forEach(function(c){ c.value = ""; }); champs[0].focus(); msg.textContent = (r && r.erreur) || "Code invalide ou expiré.";
    }).catch(function(){ msg.textContent = "Vérification impossible. Réessayez."; });
  }
  champs.forEach(function(c, i){
    c.oninput = function(){
      var v = c.value.replace(/\D/g, "");
      if(v.length > 1){ v.split("").slice(0, 6 - i).forEach(function(ch, k){ champs[i + k].value = ch; }); (champs[Math.min(5, i + v.length)]).focus(); }
      else { c.value = v; if(v && i < 5) champs[i + 1].focus(); }
      valider();
    };
    c.onkeydown = function(e){ if(e.key === "Backspace" && !c.value && i > 0){ champs[i - 1].focus(); champs[i - 1].value = ""; } };
  });
  champs[0].focus();
  document.getElementById("nouveau").onclick = function(e){ e.preventDefault(); envoi(); };
  if(envoyer) envoi();
}
function salaireDetail(r, k){
  var a = r.annees[k], zone = document.getElementById("sa"), t = (a.repartition || {});
  var h = document.querySelector(".page h1"); h.textContent = "Rémunération globale"; h.className = "sa1";
  var onglets = r.annees.length > 1 ? '<span class="saan">'+r.annees.map(function(x, i){ return '<a href="#" data-k="'+i+'" class="'+(i === k ? 'on' : '')+'">'+x.annee+'</a>'; }).join("")+'</span>' : "";
  var pos = pctTxt(a.position);
  var l = function(lib, v, fort){ return '<div class="sl'+(fort ? ' fort' : '')+'"><span>'+lib+'</span><span>'+v+'</span></div>'; };
  var sec = function(n, titre){ return '<div class="sh"><b>'+n+'</b><span>'+titre+'</span></div>'; };
  zone.innerHTML = '<div class="saeti">ANNÉE '+a.annee+(a.annee === 2026 ? ' · EN VIGUEUR' : ' · À VENIR')+onglets+'</div>' +
    '<div class="said"><div><strong>'+esc(MOI && MOI.nom || "")+'</strong><small>'+esc(MOI && MOI.poste || "")+'</small></div><div class="saht">'+taux(a.horaire)+' $/h</div></div>' +
    '<div class="saech">'+(a.echelle || []).map(function(e){ var on = pctTxt(e.p) === pos; return '<span class="'+(on ? 'on' : '')+'">'+pctTxt(e.p)+'<br>'+taux(e.t)+'</span>'; }).join("")+'</div>' +
    sec("01", "SALAIRE ET TEMPS DE TRAVAIL") + l("Salaire horaire retenu", taux(a.horaire) + " $") + l("Heures de travail (par semaine)", esc(a.heures === null || a.heures === undefined ? "—" : a.heures)) + l("Salaire de base annuel ("+esc(a.semaines || 46)+" semaines)", dollars(a.base), true) +
    sec("02", "CONGÉS RÉMUNÉRÉS") + l("Vacances rémunérées", dollars(a.vacances)) + l("Jours fériés rémunérés", dollars(a.feries)) + l("Maladie rémunérée", dollars(a.maladie)) + l("Total des congés rémunérés", dollars(a.conges), true) +
    sec("03", "AUTRES AVANTAGES") + l("Boni annuel pouvant atteindre", dollars(a.boni)) + l("Cotisation OTPADQ", dollars(a.otpadq)) + l("Assurances 50 % de la prime (approx.)", dollars(a.assurances)) +
    '<div class="satot"><span>TOTAL DE LA RÉMUNÉRATION GLOBALE</span><b>'+dollars(a.total)+'</b></div>' +
    '<div class="sabar"><i style="width:'+(t.base || 0)+'%"></i><i class="b" style="width:'+(t.conges || 0)+'%"></i><i class="c" style="width:'+(t.autres || 0)+'%"></i></div>' +
    '<p class="sale">Salaire de base '+dollars(a.base)+' · '+(t.base === null || t.base === undefined ? "—" : t.base)+' %&nbsp; Congés rémunérés '+dollars(a.conges)+' · '+(t.conges === null || t.conges === undefined ? "—" : t.conges)+' %&nbsp; Autres avantages '+dollars((a.boni || 0) + (a.otpadq || 0) + (a.assurances || 0))+' · '+(t.autres === null || t.autres === undefined ? "—" : t.autres)+' %&nbsp; Salaire annualisé sur 52 semaines : '+dollars(a.annualise)+'</p>' +
    sec("04", "PROGRAMME DE RECONNAISSANCE") + '<div class="sarec">'+(a.paliers || []).map(function(p){ return '<div><b>'+dollars(p.montant)+'</b><small>'+esc(p.lib)+'</small></div>'; }).join("")+'</div>' +
    '<a class="doc" href="#" id="notes" style="margin-top:10px"><span>▪ Notes et conditions</span></a>';
  Array.prototype.forEach.call(zone.querySelectorAll(".saan a"), function(x){ x.onclick = function(e){ e.preventDefault(); salaireDetail(r, +x.getAttribute("data-k")); }; });
  document.getElementById("notes").onclick = function(e){ e.preventDefault(); salaireNotes(r, k); };
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); salaireEcran(r, k); };
}
// Écran principal épuré (choix S1 de l'utilisateur) : le total, quatre lignes, le détail sur demande.
function salaireEcran(r, k){
  var a = r.annees[k], zone = document.getElementById("sa"), t = (a.repartition || {});
  var h = document.querySelector(".page h1"); h.textContent = "Rémunération globale"; h.className = "sa1";
  document.getElementById("retour").textContent = "Retour"; document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  var onglets = r.annees.length > 1 ? '<span class="saan">'+r.annees.map(function(x, i){ return '<a href="#" data-k="'+i+'" class="'+(i === k ? 'on' : '')+'">'+x.annee+'</a>'; }).join("")+'</span>' : "";
  var autres = (a.boni || 0) + (a.otpadq || 0) + (a.assurances || 0), pc = function(x){ return x === null || x === undefined ? "" : " · " + x + " %"; };
  var montants = (a.paliers || []).map(function(p){ return p.montant; }).filter(function(x){ return x !== null && x !== undefined; });
  var reco = montants.length ? (Math.min.apply(null, montants) === Math.max.apply(null, montants) ? dollars(montants[0]) : dollars(Math.min.apply(null, montants)) + " à " + dollars(Math.max.apply(null, montants))) : "—";
  var l = function(lib, sous, v){ return '<div class="sx"><span>'+lib+'<small>'+sous+'</small></span><b>'+v+'</b></div>'; };
  zone.innerHTML = '<div class="saeti">▪ ANNÉE '+a.annee+(a.annee === 2026 ? ' · EN VIGUEUR' : ' · À VENIR')+onglets+'</div>' +
    '<div class="sanom">'+esc(MOI && MOI.nom || "")+' · '+esc(MOI && MOI.poste || "")+(a.position ? ' · '+pctTxt(a.position) : '')+'</div>' +
    '<div class="sabig">'+dollars(a.total)+'</div><div class="sub">Salaire horaire '+taux(a.horaire)+'\u00a0$ · '+esc(a.heures === null || a.heures === undefined ? "—" : a.heures)+' h par semaine</div>' +
    '<div class="sabar"><i style="width:'+(t.base || 0)+'%"></i><i class="b" style="width:'+(t.conges || 0)+'%"></i><i class="c" style="width:'+(t.autres || 0)+'%"></i></div>' +
    '<div class="sub" style="margin-bottom:10px">Salaire annualisé sur 52 semaines : '+dollars(a.annualise)+'</div>' +
    l("Salaire de base", esc(a.semaines || 46)+' semaines'+pc(t.base), dollars(a.base)) +
    l("Congés rémunérés", 'Vacances, fériés, maladie'+pc(t.conges), dollars(a.conges)) +
    l("Autres avantages", 'Boni, OTPADQ, assurances'+pc(t.autres), dollars(autres)) +
    l("Programme de reconnaissance", 'Par mois, selon vos objectifs atteints', reco) +
    '<a class="doc" href="#" id="detail" style="margin-top:6px"><span>▪ Voir le détail et les notes</span></a>';
  Array.prototype.forEach.call(zone.querySelectorAll(".saan a"), function(x){ x.onclick = function(e){ e.preventDefault(); salaireEcran(r, +x.getAttribute("data-k")); }; });
  document.getElementById("detail").onclick = function(e){ e.preventDefault(); salaireDetail(r, k); };
}
function salaireNotes(r, k){
  var n = r.annees[k].notes || {}, c = r.communes || {};
  var bloc = function(t, x){ return x ? '<div class="nb"><div class="etiq">'+t+'</div><p>'+esc(x)+'</p></div>' : ""; };
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Autoévaluation</h1>' +
    bloc("VACANCES", n.vacances) + bloc("MALADIE", n.maladie) + bloc("BONI", [n.boni1, n.boni2].filter(Boolean).join(" ")) + bloc("HEURES DE TRAVAIL", c.heures) + bloc("AVIS", c.avis) + '</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); salaire(); };
}
// Étape 5 : évaluations. L'autoévaluation reproduit la page du portail (mêmes 8 onglets, mêmes questions); en essai elle ne lit ni n'enregistre rien.
function evaluations(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Autoévaluation</h1><div id="ev"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  obtenir("ae", {action:"ae_lire"}, function(r){
    var el = document.getElementById("ev"); if(!el) return;
    var dues = r.rencontres.filter(aeARemplir);   // seulement celles à remplir, jamais les anciennes
    if(!dues.length){ menu(); aeNonDispo(); return; }
    if(dues.length === 1){ autoeval(dues[0].rencontre, true, dues[0].date); return; }   // une seule : on l'ouvre directement
    el.innerHTML = dues.map(function(m){
      return '<a class="rang" href="#" data-r="'+m.rencontre+'" data-d="'+esc(m.date || "")+'">▪ Autoévaluation · rencontre '+m.rencontre+'<small>'+'Rencontre du '+esc(aeDateTxt(m.date))+'</small></a>'; }).join("");
    Array.prototype.forEach.call(el.querySelectorAll("a[data-r]"), function(a){ a.onclick = function(e){ e.preventDefault(); autoeval(+a.getAttribute("data-r"), false, a.getAttribute("data-d")); }; });
  }, function(){ document.getElementById("ev").innerHTML = '<div class="bandeau">▪ AUTOÉVALUATION INDISPONIBLE · RÉESSAYEZ</div>'; }, true);
}
// Autoévaluation : même fiche et mêmes règles que la page envoyée par courriel (6 étapes). Les réponses vont dans la fiche de l'employé.
var AE_ETAPES = ["Évaluation des compétences","Valeurs humaines","Connaissances et développement","Rythme et charge de travail","Priorités et engagements","Commentaires de l’employé","Mon expérience au laboratoire","Pour préparer notre rencontre"];
var AE_NIVEAUX_RH = ["Pas du tout d’accord","Peu d’accord","Moyennement d’accord","Plutôt d’accord","Tout à fait d’accord"];
function aeSection(f){ var n = +f.cell.slice(1); if(f.cell === "A68" || f.cell === "A70") return 7; if(n >= 59) return 6; if(f.cell === "B44") return 5; if(f.cell === "B42" || f.cell === "B43") return 4; return n >= 35 ? 2 : n >= 28 ? 1 : 0; }
function autoeval(rencontre, direct, date){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">'+(direct ? "Retour" : "Retour")+'</a><h1>Autoévaluation</h1>'+(date ? '<div class="etiq">▪ RENCONTRE DU '+esc(aeDateTxt(date)).toUpperCase()+'</div>' : '')+'<div id="ae"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); if(direct) menu(); else evaluations(); };
  obtenir("ae"+rencontre, {action:"ae_lire", rencontre:rencontre}, aeAfficher,
    function(){ document.getElementById("ae").innerHTML = '<div class="bandeau">▪ FICHE INDISPONIBLE · RÉESSAYEZ</div>'; }, false);
}
function aeNum(v){ var n = Number(String(v).replace(/[^0-9,.-]/g,"").replace(",",".")); return isNaN(n) ? null : n; }
function aeRythmeHtml(d){
  if(!d.rythme || !d.rythme.length) return '<p class="aide">Heures travaillées par semaine, charge effectuée, charge non terminée et objectifs atteints : ces points seront examinés dans cet ordre avec votre responsable pendant la rencontre.</p>';
  var h = (d.rythmePeriode ? '<div class="etiq">▪ '+esc(d.rythmePeriode).toUpperCase()+'</div>' : '') + '<p class="aide">À titre indicatif, pour la discussion lors de la rencontre.</p>';
  d.rythme.forEach(function(r){
    var c = aeNum(r.seuil), n = aeNum(r.realise), barre = "", ok = null;
    if(c !== null && n !== null){
      var M = r.auto ? Math.max(c, n) : Math.max(100, c, n); ok = r.inverse ? n <= c : n >= c;
      barre = '<div class="rb"><i style="width:'+Math.max(0,Math.min(100,n/M*100))+'%"></i><u style="left:'+Math.max(0,Math.min(99,c/M*100))+'%"></u></div><div class="rt'+(ok ? ' ok' : '')+'">'+(ok ? 'Dans la cible' : (r.inverse ? 'Au-dessus de la cible' : 'Sous la cible'))+'</div>';
    }
    h += '<div class="rl"><div class="rn">'+esc(r.label)+'</div><div class="rv"><span>Réalisé<b>'+esc(r.realise)+'</b></span><span>Cible<b>'+esc(r.cible)+'</b></span></div>'+barre+'</div>';
  });
  return h;
}
function aeAfficher(d){
  var vals = {}, page = 0, occupe = false;
  d.champs.forEach(function(f){ vals[f.cell] = f.value; });
  var zone = document.getElementById("ae");
  function dire(t){ var e = document.getElementById("aeetat"); if(e){ e.style.display = t ? "block" : "none"; e.textContent = t; } }
  function texteNote(f){ var v = vals[f.cell]; if(v === "" || v == null) return "Choisissez une note."; if(v === "Non applicable") return "Non applicable"; return f.scale === "experience" ? AE_NIVEAUX_RH[+v-1] : (d.bareme[+v-1] || ""); }
  function dessiner(){
    var fs = d.champs.filter(function(f){ return aeSection(f) === page; });
    var h = '<div class="etiq">▪ '+(page+1)+' SUR 8 · '+esc(AE_ETAPES[page]).toUpperCase()+'</div>' + (d.terminee ? '<div class="bandeau">▪ TERMINÉE · CONSULTATION SEULEMENT</div>' : '') + (page === 3 ? aeRythmeHtml(d) : '');
    fs.forEach(function(f){
      if(f.kind === "score"){
        h += '<div class="aeq"><div class="aet">'+esc(f.label)+'</div><div class="aen">';
        for(var n = 1; n <= f.max; n++) h += '<button type="button" class="aeb'+(+vals[f.cell] === n ? ' on' : '')+'" data-c="'+f.cell+'" data-n="'+n+'"'+(d.terminee ? ' disabled' : '')+'>'+n+'</button>';
        h += '</div>' + (f.scale === "experience" && !d.terminee ? '<button type="button" class="aeb na'+(vals[f.cell] === "Non applicable" ? ' on' : '')+'" data-c="'+f.cell+'" data-n="Non applicable">Non applicable</button>' : '') + '<div class="etiq" id="t'+f.cell+'">'+esc(texteNote(f))+'</div></div>';
      } else {
        h += '<div class="aeq"><div class="aet">'+esc(f.label)+'</div><textarea class="champ zone" data-t="'+f.cell+'" maxlength="5000"'+(d.terminee ? ' disabled' : '')+'>'+esc(vals[f.cell] || "")+'</textarea></div>';
      }
    });
    h += '<div class="bandeau" id="aeetat" style="display:none"></div><div class="aeact">' +
      (page > 0 ? '<button class="bouton" id="aeprec" type="button">Retour</button>' : '') +
      (d.terminee ? '' : '<button class="bouton" id="aebrouillon" type="button">Enregistrer le brouillon</button>') +
      '<button class="bouton" id="aesuiv" type="button"'+(d.terminee && page === 7 ? ' disabled' : '')+'>'+(page === 7 ? (d.terminee ? 'Terminée' : 'Terminer') : 'Continuer')+'</button></div>';
    zone.innerHTML = h;
    Array.prototype.forEach.call(zone.querySelectorAll(".aeb"), function(b){
      b.onclick = function(){ var c = b.getAttribute("data-c"), n = b.getAttribute("data-n"); vals[c] = n === "Non applicable" ? n : +n; dessiner(); };
    });
    Array.prototype.forEach.call(zone.querySelectorAll("textarea[data-t]"), function(t){ t.oninput = function(){ vals[t.getAttribute("data-t")] = t.value; }; });
    var p = document.getElementById("aeprec"); if(p) p.onclick = function(){ page--; dessiner(); window.scrollTo(0, 0); };
    var bd = document.getElementById("aebrouillon"); if(bd) bd.onclick = function(){ enregistrer(false); };
    document.getElementById("aesuiv").onclick = function(){
      if(d.terminee){ if(page < 7){ page++; dessiner(); window.scrollTo(0, 0); } return; }
      if(page < 7){ if(!valider(page)) return; enregistrer(false, function(){ page++; dessiner(); window.scrollTo(0, 0); }); }
      else { if(!toutValide()) return; enregistrer(true); }
    };
  }
  function manque(f){ var v = vals[f.cell]; return !(v !== "" && v != null && isFinite(+v) && +v >= 1 && +v <= f.max); }
  function valider(sec){ var m = d.champs.filter(function(f){ return f.required && aeSection(f) === sec && manque(f); })[0]; if(m){ dire("▪ CHOISISSEZ UNE NOTE POUR « "+m.label+" »"); return false; } return true; }
  function toutValide(){ var m = d.champs.filter(function(f){ return f.required && manque(f); })[0]; if(m){ dire("▪ COMPLÉTEZ LES NOTES DE COMPÉTENCES ET DE VALEURS AVANT DE TERMINER"); return false; } return true; }
  function enregistrer(terminer, suite){
    if(occupe) return; occupe = true; dire("▪ ENREGISTREMENT…");
    appelService({action:"ae_enregistrer", session:sessionGardee(), rencontre:d.rencontre, revision:d.revision, terminer:terminer, valeurs:vals}).then(function(r){
      occupe = false;
      if(r && r.ok){ d.revision = r.revision; precharger(); if(r.terminee){ d.terminee = true; zone.innerHTML = '<div class="bandeau">▪ MERCI POUR VOTRE AUTOÉVALUATION</div><p class="aide">Vos réponses sont enregistrées pour cette rencontre. Elles prépareront notre discussion.</p>'; } else { dire("▪ RÉPONSES ENREGISTRÉES"); if(suite) suite(); } }
      else dire("▪ NON ENREGISTRÉ · "+((r && r.erreur) || "RÉESSAYEZ"));
    }).catch(function(){ occupe = false; dire("▪ NON ENREGISTRÉ · RÉSEAU. VOS RÉPONSES RESTENT À L'ÉCRAN"); });
  }
  dessiner();
}
// Étape 6 : tableau de bord (Charges de travail) et profil. Chiffres d'essai; les vrais viendront d'un fichier de Gestion fourni par Michel.
// Tableau de bord : les 12 derniers mois, un par un (aucune moyenne). Données du service (mêmes fichiers de Gestion que le portail).
// Graphique par jour: s'affiche seulement si le service fournit m.jours = [{j,ce,cn,dispo}] (en %, pas encore disponible).
function graphJours(m){
  if(!m.jours || !m.jours.length) return "";
  var cible = m.cibleCe || 80, mx = 100; m.jours.forEach(function(d){ mx = Math.max(mx, (d.ce||0)+(d.cn||0)+Math.max(0,(d.dispo||0))); }); mx = Math.ceil(mx / 20) * 20;   // échelle sur la plus haute barre, graduations de 20 %, comme Trak
  var mois = String(m.label).split(" ")[0].toLowerCase(), grad = "", lignes = "";
  for(var v = 0; v <= mx; v += 20){ grad += '<span style="bottom:'+(v/mx*100)+'%">'+v+' %</span>'; if(v > 0) lignes += '<s style="bottom:'+(v/mx*100)+'%"></s>'; }
  var barres = "", nums = "";
  m.jours.forEach(function(d){
    var ce = Math.round(d.ce||0), cn = Math.round(d.cn||0), dp = Math.round(Math.max(0,(d.dispo||0))), t = ce+cn+dp, j = String(d.j).split(' ').pop();
    var txt = j+' '+mois+' · fait '+ce+' % · restant '+cn+' % · disponible '+dp+' %';
    barres += '<div class="gjj" data-t="'+esc(txt)+'" title="'+esc(txt)+'"><div class="gjc" style="height:'+(t/mx*100)+'%"><i class="d" style="height:'+(t ? dp/t*100 : 0)+'%"></i><i class="n" style="height:'+(t ? cn/t*100 : 0)+'%"></i><i class="e" style="height:'+(t ? ce/t*100 : 0)+'%"></i></div></div>';
    nums += '<span>'+esc(j)+'</span>';
  });
  return '<div class="gj"><div class="gjt">&nbsp;</div><div class="gjl"><span class="gc">▬</span> Pourcentage cible <span class="ge">▪</span> % fait <span class="gn">▪</span> % restant <span class="gd">▪</span> % disponible</div>' +
    '<div class="gjw"><div class="gja">'+grad+'</div><div class="gjr"><div class="gjp">'+lignes+barres+'<u style="bottom:'+(cible/mx*100)+'%"></u></div><div class="gjx">'+nums+'</div></div></div></div>';
}
function graphJoursActif(el){
  var t = el.querySelector(".gjt"), bs = el.querySelectorAll(".gjj"); if(!t || !bs.length) return;
  function choisir(b){ bs.forEach(function(x){ x.classList.remove("sel"); }); b.classList.add("sel"); t.textContent = b.getAttribute("data-t"); }
  bs.forEach(function(b){ b.onmouseenter = b.onclick = function(){ choisir(b); }; });
  choisir(bs[bs.length-1]);
}
function tableau(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1 class="vert">Charges de travail</h1><div id="tb"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  obtenir("tableau", {action:"tableau"}, function(r){
    var el = document.getElementById("tb"); if(!el) return;
    if(!r.mois){ el.innerHTML = '<div class="bandeau">▪ PAS DE TABLEAU DE BORD POUR VOTRE POSTE</div>'; return; }
    var ms = r.mois, i = 0;
    // Mois en cours (jusqu'à hier, jamais la journée en cours): la page s'ouvre dessus.
    function avecCourant(c){ if(!(c && c.ok && c.mois && c.mois.courant)) return false; ms = [c.mois].concat(r.mois.filter(function(x){ return x.label !== c.mois.label; })); i = 0; return true; }
    avecCourant(lireCache("tableau_courant"));
    function annee(m){ return String(m.label).split(" ").pop(); }
    function cumul(m, cle){
      var t = 0, n = 0;
      ms.forEach(function(x){ if(!x.absent && annee(x) === annee(m) && x[cle] !== null && x[cle] !== undefined){ t += x[cle]; n++; } });
      return n ? Math.round(t / n) + " %" : "—";
    }
    function carte(nom, val, cible, sens, m, cle, ct){
      var vide = val === null || val === undefined, ok = vide ? null : (sens === "plus" ? val >= cible : val <= cible);
      var pastille = vide ? "" : '<span class="pas '+(ok ? "dans" : "sous")+'">'+(ok ? "Dans la cible" : "Sous la cible")+'</span>';
      var larg = vide ? 0 : Math.min(100, val), pc = Math.min(100, cible);
      var cq = cle === "cn" ? "#1D1D1B" : "#8D806A";
      return '<div class="tcarte tk'+(vide ? ' sans' : '')+'"><div class="tct"><span><b class="tq" style="background:'+cq+'"></b>'+nom+'</span>'+(vide ? '' : '<span class="tind '+(ok ? "dans" : "sous")+'">'+(ok ? "Dans la cible" : "Sous la cible")+'</span>')+'</div>' +
        '<div class="tl">'+(vide ? '' : '<div class="tgros">'+val+'<small>%</small></div>')+'<div class="tcib">Moyenne · cible '+cible+' % '+(sens === "plus" ? "et +" : "et −")+'</div></div>' +
        '<div class="tbarre"><i style="width:'+larg+'%"></i><u style="left:'+pc+'%"></u></div></div>';
    }
    function dessiner(){
      var m = ms[i], h = '<div class="tnav"><button id="tp" '+(i >= ms.length - 1 ? "disabled" : "")+'>Précédent</button><div class="tmois">'+esc(m.label).toUpperCase()+'</div><button id="ts" '+(i <= 0 ? "disabled" : "")+'>Suivant</button></div>' +
        '<div class="etiq">▪ '+esc((MOI && MOI.nom) || "").toUpperCase()+(m.courant && m.jusquAu ? ' · JUSQU\'AU '+esc(m.jusquAu.slice(8)+"/"+m.jusquAu.slice(5,7)) : "")+'</div>';
      if(m.absent) h += '<div class="bandeau">▪ AUCUN TRAVAIL CE MOIS-LÀ</div>';
      else h += carte("CHARGE EFFECTUÉE", m.ce, m.cibleCe || 80, "plus", m, "ce") + carte("CHARGE NON TERMINÉE", m.cn, 5, "moins", m, "cn") + carte("OBJECTIFS ATTEINTS", m.obj, 80, "plus", m, "obj") +
        graphJours(m) + '<p class="aide">Heures par semaine : '+(m.heures === null ? "—" : String(m.heures).replace(".", ","))+(m.cibleHeures ? ' · cible '+m.cibleHeures : "")+'</p>';
      el.innerHTML = h; graphJoursActif(el);
      document.getElementById("tp").onclick = function(){ i++; dessiner(); };
      document.getElementById("ts").onclick = function(){ i--; dessiner(); };
    }
    dessiner();
    if(!ms[0].courant) chercher("tableau_courant", {action:"tableau_courant"}).then(function(c){ if(avecCourant(c) && document.getElementById("tb")) dessiner(); }).catch(function(){});
    // Graphique par jour (fichier séparé de Gestion): ajouté sans attente, la page s'affiche d'abord
    var MG = ["JANV.","FÉVR.","MARS","AVR.","MAI","JUIN","JUIL.","AOÛT","SEPT.","OCT.","NOV.","DÉC."];
    chercher("charges_jours", {action:"charges_jours"}).then(function(c){
      if(!c || !c.ok || !c.mois) return;
      ms.forEach(function(m){ if(m.courant) return; var q = String(m.label).split(" "), k = MG.indexOf(q[0]); if(k < 0) return; var cle = q[1]+"-"+("0"+(k+1)).slice(-2); if(c.mois[cle]) m.jours = c.mois[cle];
        // mois sans valeur mensuelle (pas encore dans le fichier mensuel de Michel): moyenne des jours travaillés, comme Trak
        var mo = c.moyennes && c.moyennes[cle]; if(mo && (m.ce === null || m.ce === undefined)) m.ce = mo.ce; if(mo && (m.cn === null || m.cn === undefined)) m.cn = mo.cn; });
      if(document.getElementById("tb")) dessiner();
    }).catch(function(){});
  }, function(e){ var rep = e && e.reponse, el = document.getElementById("tb"); if(!el) return;
    el.innerHTML = '<div class="bandeau">▪ '+(rep && rep.erreur ? esc(String(rep.erreur).toUpperCase()) : (MOI && MOI.role === "direction" ? "PAS DE TABLEAU DE BORD POUR CE COMPTE" : "TABLEAU DE BORD INDISPONIBLE · RÉESSAYEZ"))+'</div>'; }, true);
}
// Plan du stationnement : cadre de chaque place, en pixels du plan d'origine (2000 x 1416).
var PLACES = {};
(function(){
  for(var i = 0; i < 8; i++) PLACES[15 + i] = [395 + 66 * i, 140, 461 + 66 * i, 302];
  var h2 = [970, 1037, 1105, 1173, 1241, 1309, 1377, 1445];
  for(var j = 0; j < 7; j++) PLACES[23 + j] = [h2[j], 140, h2[j + 1], 302];
  PLACES[30] = [1480, 140, 1561, 302]; PLACES[31] = [1561, 140, 1641, 302];
  var h3 = [456, 519, 583, 647, 710];
  for(var k = 0; k < 4; k++) PLACES[14 - k] = [h3[k], 428, h3[k + 1], 566];
  for(var m = 0; m < 3; m++) PLACES[10 - m] = [565, 597 + 54 * m, 738, 651 + 54 * m];
  for(var n = 0; n < 7; n++) PLACES[7 - n] = [808, 434 + 65 * n, 993, 499 + 65 * n];
})();
function planPlace(num){
  var p = PLACES[num]; if(!p) return "";
  var W = 2000, H = 1416, g = 100 * (p[0] + p[2]) / 2 / W;
  return '<div class="plan"><div class="vp" style="left:'+g.toFixed(2)+'%">VOTRE PLACE<i></i></div><div class="pi"><img src="plans/plan_stationnement.png" alt="Plan du stationnement">' +
    '<b style="left:'+(100 * p[0] / W).toFixed(2)+'%;top:'+(100 * p[1] / H).toFixed(2)+'%;width:'+(100 * (p[2] - p[0]) / W).toFixed(2)+'%;height:'+(100 * (p[3] - p[1]) / H).toFixed(2)+'%"></b></div></div>';
}
function profil(){
  var m = MOI || {};
  var lignes = [["Nom", m.nom || "", 1], ["Titre", m.poste || "", 1], ["Responsable", m.responsable || ""]];
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Mon profil</h1>' +
    lignes.map(function(l){ return l[2] ? '<div class="ligne pfg"><span>'+esc(l[1])+'</span></div>' : '<div class="ligne pfg"><span>'+esc(l[0])+'</span><span>'+esc(l[1])+'</span></div>'; }).join("") +
    '<div id="stat"></div>' +
    '<a class="doc" href="#" id="vnotif" style="display:block;border:2px solid #0d1117;padding:13px 14px;margin:18px 0;text-align:center;text-transform:uppercase;letter-spacing:.16em;font-size:13px"><span>Contrôle des notifications</span></a><div id="planz"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  // Stationnement et casier de l'employé (jamais ceux des autres), lus dans le classeur du conseil par le service.
  obtenir("stationnement", {action:"stationnement"}, function(r){
    var st = document.getElementById("stat"), pz = document.getElementById("planz"); if(!st || !r || !r.ok) return;
    var place = String(r.place || "").trim(), cas = (r.casiers || []).join(" et "), h = "";
    if(place) h += '<div class="ligne pfg"><span>Stationnement</span><span>'+esc(place)+'</span></div>';
    if(cas) h += '<div class="ligne pfg"><span>'+((r.casiers || []).length > 1 ? "Casiers" : "Casier")+'</span><span>'+esc(cas)+'</span></div>';
    st.innerHTML = h;
    if(/^\d+$/.test(place) && PLACES[+place]) pz.innerHTML = planPlace(+place);
    else if(/^rue$/i.test(place)) pz.innerHTML = '<p class="aide" style="margin-top:14px">Le stationnement est plein pour l\'instant. Vous pouvez vous stationner sur le boulevard Saint-Martin, au nord de la rue Salaberry. Nous vous aviserons dès qu\'une place se libérera.</p>';
  }, function(){}, true);
  document.getElementById("vnotif").onclick = function(e){ e.preventDefault(); prefsNotifs(); };
}
// Centre de contrôle des notifications : chaque employé choisit ses propres alertes (enregistrées par le service, par courriel).
var PREFS_NOTIFS = [["courriel", "Courriel"], ["reunion_veille", "Réunions : la veille à 16 h"], ["reunion_1h", "Réunions : 1 heure avant"], ["rencontres", "Rencontres planifiées"], ["autoeval", "Autoévaluation à remplir"]];
function prefsNotifs(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Mon profil</h1><div id="notifs"></div><div id="prefs"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); profil(); };
  var zone = document.getElementById("notifs");
  if(!notifPossible()){ zone.innerHTML = '<p class="aide">Pour recevoir les notifications sur iPhone, ajoutez l\'application à l\'écran d\'accueil (Partager > Sur l\'écran d\'accueil).</p>'; }
  else if(Notification.permission === "denied"){ zone.innerHTML = '<p class="aide">Les notifications sont bloquées dans les réglages de votre appareil. Autorisez-les dans les réglages pour les recevoir.</p>'; }
  else navigator.serviceWorker.ready.then(function(reg){ return reg.pushManager.getSubscription(); }).then(function(sub){
    zone.innerHTML = '<label class="ligne"><span>Alerte dans l\'app</span><input type="checkbox" id="notifCase"'+(sub && Notification.permission === "granted" ? " checked" : "")+'></label>';
    document.getElementById("notifCase").onchange = function(){ var c = this; (c.checked ? demanderNotifs() : couperNotifs()).then(function(ok){ if(c.checked && !ok) c.checked = false; }).catch(function(){}); };
  });
  var etat = {courriel: false};
  function dessiner(){
    document.getElementById("prefs").innerHTML = PREFS_NOTIFS.map(function(p){ return '<label class="ligne"><span>'+p[1]+'</span><input type="checkbox" data-k="'+p[0]+'"'+(etat[p[0]] !== false ? " checked" : "")+'></label>'; }).join("");
    Array.prototype.forEach.call(document.querySelectorAll("#prefs input"), function(c){
      c.onchange = function(){ var k = c.getAttribute("data-k"), v = c.checked; etat[k] = v;
        appelService({action:"prefs_ecrire", session:sessionGardee(), cle:k, valeur:v}).catch(function(){}); };
    });
  }
  dessiner();
  appelService({action:"prefs_lire", session:sessionGardee()}).then(function(r){ if(r && r.ok && r.prefs && document.getElementById("prefs")){ etat = r.prefs; dessiner(); } }).catch(function(){});
}
// Page Responsable (responsables et direction seulement; le service refuse les autres) : Contacts cliquables (appel, texto, courriel).
var PICTO_RESP = {rn:"Nouveau message", rsc:"Suivi de charge", rc:"Contacts", rs:"Stationnement", rk:"Casier", rme:"Messages envoyés", rrd:"Rencontres demandées", re:"Entretien machinerie", rpo:"Portrait d’un employé", rpe:"Positionnement", rpm:"Positionnement", rec:"Échelle salariale", rcf:"Conseil d'administration", rfi:"Finances", rem:"Employés", rea:"Employé actuel", rut:"Utilisation"};
function iconesResp(){
  Object.keys(PICTO_RESP).forEach(function(id){
    var a = document.getElementById(id), sp = a && a.querySelector("span"); if(!sp) return;
    sp.innerHTML = picto(PICTO_RESP[id]) + sp.textContent.replace(/^\s*▪\s*/, "");
  });
}

// Droits des onglets: lus du service pour mon rôle (la Direction voit et modifie le tableau complet dans la page Contrôle).
function chargerDroits(){
  appelService({action:"onglets_lire", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok || !r.onglets) return;
    DROITS_SERVICE = r.onglets;
    if(app.querySelector(".menu.accueil")) menu();
  }).catch(function(){});
}
var CTL_COULEURS = ["#8D806A", "#0D1319", "#8EFF60"];
function controleOuvrir(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Contrôle</h1><div id="ctl"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  var t = {}, msg = "";
  ENT.forEach(function(x){ t[x.id] = [!!x.d[0], !!x.d[1], !!x.d[2]]; });
  function dessiner(){
    var el = document.getElementById("ctl"); if(!el) return;
    var noms = ["Employé", "Gestionnaire", "Direction"];
    var h = '<div class="ctg"><span></span>' + noms.map(function(n, k){ return '<b>'+n+'<i style="background:'+CTL_COULEURS[k]+'"></i></b>'; }).join("");
    var g = "";
    ENT.forEach(function(x){
      if(x.g !== g){ g = x.g; h += '<div class="ctt">▪ '+esc(g === "Contrôle" ? "Contrôle des onglets" : g)+'</div>'; }
      h += '<span class="ctn">'+esc(x.l)+(x.v ? '<small> · verrouillé</small>' : "")+'</span>';
      for(var k = 0; k < 3; k++){
        var on = t[x.id][k], bloque = x.v;
        h += '<button type="button" class="ctc'+(on ? " on" : "")+(bloque ? " bq" : "")+'" data-id="'+x.id+'" data-k="'+k+'" style="'+(on ? 'background:'+CTL_COULEURS[k]+';border-color:'+CTL_COULEURS[k] : "")+'" aria-pressed="'+on+'" aria-label="'+esc(x.l)+' · '+noms[k]+'"'+(bloque ? " disabled" : "")+'></button>';
      }
    });
    el.innerHTML = h + '</div>' + (msg ? '<div class="bandeau">'+esc(msg)+'</div>' : "");
    Array.prototype.forEach.call(el.querySelectorAll("button.ctc:not(.bq)"), function(b){
      b.onclick = function(){
        var id = b.getAttribute("data-id"), k = +b.getAttribute("data-k"), v = !t[id][k];
        var x = ENT_PAR_ID[id], role = ["Employé", "Gestionnaire", "Direction"][k];
        confirmerOuiNon((v ? "Donner" : "Retirer")+" l'accès à « "+(x ? x.l : id)+" » pour : "+role+" ?", function(){ appliquer(id, k, v); });
      };
    });
  }
  function appliquer(id, k, v){
    {
      {
        t[id][k] = v; msg = ""; dessiner();
        appelService({action:"onglets_ecrire", session:sessionGardee(), id:id, role:["employe", "responsable", "direction"][k], valeur:v}).then(function(r){
          if(!r || !r.ok){ t[id][k] = !v; msg = "▪ NON ENREGISTRÉ · " + String((r && r.erreur) || "RÉESSAYEZ").toUpperCase(); dessiner(); }
        }).catch(function(){ t[id][k] = !v; msg = "▪ NON ENREGISTRÉ · RÉSEAU"; dessiner(); });
      }
    }
  }
  dessiner();
  appelService({action:"onglets_lire", session:sessionGardee()}).then(function(r){
    if(r && r.ok && r.tableau){ r.tableau.forEach(function(x){ if(t[x.id]) t[x.id] = [!!x.employe, !!x.responsable, !!x.direction]; }); dessiner(); }
  }).catch(function(){});
}
// La page Direction/Gestionnaire n'existe plus: tout est sur l'accueil, en groupes.
function responsable(){ menu(); }
// Stationnement et Casier : choisir un employé, voir son numéro, le libérer (✕, avec confirmation) ou lui en attribuer un libre.
function planStationnement(plan, libres, emps){
  var l = {}, pris = {};
  (libres || []).forEach(function(n){ l[String(n)] = 1; });
  (emps || []).forEach(function(x){ if(/^\d+$/.test(String(x.place))) pris[String(+x.place)] = 1; });
  var nc = plan.reduce(function(m, r){ return Math.max(m, r.length); }, 0), nr = plan.length;
  var h = '<div class="gpl" style="grid-template-columns:repeat('+nc+',1fr);grid-template-rows:repeat('+nr+',1fr);aspect-ratio:'+nc+' / '+nr+'">';
  if(nc >= 19 && nr >= 10) h += '<div class="bat" style="grid-area:3 / 10 / '+(nr + 1)+' / '+(nc + 1)+'"><span>LAFOND DESJARDINS</span><u class="p1"></u><u class="p2"></u><u class="p3"></u><u class="p4"></u></div>';
  plan.forEach(function(r, i){ for(var j = 0; j < nc; j++){ var t = String(r[j] || "").trim();
    if(/^\d+$/.test(t)) h += '<b style="grid-area:'+(i + 1)+' / '+(j + 1)+'" class="'+(l[String(+t)] && !pris[String(+t)] ? "lib" : "occ")+'">'+(+t)+'</b>'; } });
  return h + '</div>';
}
function grilleNumeros(libres, tous){
  var l = {}, t = {}, h = '<div class="gcas">';
  (libres || []).forEach(function(n){ l[String(n)] = 1; t[+n] = 1; });
  (tous || []).forEach(function(n){ if(/^\d+$/.test(String(n))) t[+n] = 1; });
  Object.keys(t).map(Number).sort(function(x, y){ return x - y; }).forEach(function(n){ h += '<b class="'+(l[String(n)] ? "lib" : "occ")+'">'+n+'</b>'; });
  return h + '</div>';
}
function attributionPage(genre){
  var estPlace = genre === "place", titre = estPlace ? "Stationnement" : "Casier";
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+titre+'</h1><div id="ap"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  var d = null, choisi = "", msg = "", confirmer = null, caseSel = "", transf = null;
  function menuA(k){ return '<span class="actw"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M1 3h6v6h-6zM0 11h8v10h-8zM13 3h6v6h-6zM12 11h8v10h-8z"/></svg><select class="act" data-m="'+k+'" aria-label="Actions"><option value="">Actions</option><option value="attribuer">Attribuer un numéro de '+(estPlace ? "stationnement" : "casier")+'</option></select></span>'; }
  function menuP(k){ return '<span class="actw"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M1 3h6v6h-6zM0 11h8v10h-8zM13 3h6v6h-6zM12 11h8v10h-8z"/></svg><select class="act" data-m="'+k+'" aria-label="Actions"><option value="">Actions</option><option value="transferer">Transférer un numéro de '+(estPlace ? "stationnement" : "casier")+'</option><option value="liberer">Retirer un numéro de '+(estPlace ? "stationnement" : "casier")+'</option></select></span>'; }
  function champsDe(e){ return estPlace ? [["place","Place"]] : [["casier1","Casier"]].concat(e.casier2 ? [["casier2","Casier 2"]] : []); }
  function dessiner(){
    var el = document.getElementById("ap"); if(!el) return;
    var h = estPlace ? (d.plan && d.plan.length ? planStationnement(d.plan, d.placesLibres, d.employes) : grilleNumeros(d.placesLibres, d.employes.map(function(x){ return x.place; }))) : grilleNumeros(d.casiersLibres, Array.apply(null, Array(60)).map(function(_, i){ return i + 1; }));
    h += '<select class="champ" id="aps"><option value="">Choisir un employé</option>' + d.employes.map(function(e){ return '<option value="'+e.ligne+'"'+(String(e.ligne) === choisi ? " selected" : "")+'>'+esc(e.nom)+'</option>'; }).join("") + '</select>';
    var occ = {}, nums = [];
    d.employes.forEach(function(x){ (estPlace ? [["place", x.place]] : [["casier1", x.casier1], ["casier2", x.casier2]]).forEach(function(c){ if(/^\d+$/.test(String(c[1]))) occ[+c[1]] = {e: x, champ: c[0]}; }); });
    var tn = {}; (estPlace ? d.placesLibres : d.casiersLibres).forEach(function(n){ tn[+n] = 1; }); Object.keys(occ).forEach(function(n){ tn[+n] = 1; });
    if(!estPlace) for(var q = 1; q <= 60; q++) tn[q] = 1;
    nums = Object.keys(tn).map(Number).sort(function(x, y){ return x - y; });
    h += '<select class="champ" id="apc"><option value="">Choisir une case</option>' + nums.map(function(n){ return '<option value="'+n+'"'+(String(n) === caseSel ? " selected" : "")+'>'+n+' · '+(occ[n] ? esc(occ[n].e.nom) : "libre")+'</option>'; }).join("") + '</select>';
    var e = d.employes.filter(function(x){ return String(x.ligne) === choisi; })[0];
    if(e){
      champsDe(e).forEach(function(c){ var v = e[c[0]];
        if(v){
          h += '<div class="ligne" data-t="'+c[0]+'"><span>'+(estPlace ? "Place " : c[1]+" ")+esc(v)+'</span>'+(confirmer === c[0] ? '<span><button type="button" class="ib" data-oui="'+c[0]+'">OUI</button> <button type="button" class="ib" data-non="1">NON</button></span>' : menuP(c[0]))+'</div>';
          if(transf === c[0]){ var lb = estPlace ? d.placesLibres : d.casiersLibres; h += '<select class="champ" id="apn-'+c[0]+'"><option value="">'+(lb.length ? "Numéros libres" : "Aucun numéro libre")+'</option>' + lb.map(function(f){ return '<option value="'+f+'">'+f+'</option>'; }).join("") + '</select><button type="button" class="bouton" data-att="'+c[0]+'">Transférer</button>'; }
          if(confirmer === c[0]) h += '<div class="bandeau">▪ LIBÉRER ?</div>';
        } else {
          var libres = estPlace ? d.placesLibres : d.casiersLibres;
          h += '<div class="ligne"><span>'+(estPlace ? "Aucune place" : "Aucun "+c[1].toLowerCase())+'</span>'+menuA(c[0])+'</div>';
          if(transf === c[0]) h += '<select class="champ" id="apn-'+c[0]+'"><option value="">'+(libres.length ? "Numéros libres" : "Aucun numéro libre")+'</option>' + libres.map(function(n){ return '<option value="'+n+'">'+n+'</option>'; }).join("") + '</select><button type="button" class="bouton" data-att="'+c[0]+'">Attribuer</button>';
        }
      });
      if(!estPlace && !e.casier2 && e.casier1 === "") h += "";
    }
    if(caseSel && !e){
      var o = occ[+caseSel], champ = estPlace ? "place" : "casier1";
      if(o){
        h += '<div class="ligne"><span>'+(estPlace ? "Place " : "Casier ")+esc(caseSel)+' · '+esc(o.e.nom)+'</span>'+(confirmer === "case" ? '<span><button type="button" class="ib" data-coui="1">OUI</button> <button type="button" class="ib" data-cnon="1">NON</button></span>' : menuP("case"))+'</div>';
        if(transf === "case"){ var sx = d.employes.filter(function(x){ return !x[champ]; }); h += '<select class="champ" id="ape"><option value="">'+(sx.length ? "Choisir un employé" : "Aucun employé sans numéro")+'</option>' + sx.map(function(x){ return '<option value="'+x.ligne+'">'+esc(x.nom)+'</option>'; }).join("") + '</select><button type="button" class="bouton" data-catt="1">Transférer</button>'; }
        if(confirmer === "case") h += '<div class="bandeau">▪ LIBÉRER ?</div>';
      } else {
        var sans = d.employes.filter(function(x){ return !x[champ]; });
        h += '<div class="ligne"><span>'+(estPlace ? "Place " : "Casier ")+esc(caseSel)+' libre</span></div><select class="champ" id="ape"><option value="">'+(sans.length ? "Choisir un employé" : "Aucun employé sans numéro")+'</option>' + sans.map(function(x){ return '<option value="'+x.ligne+'">'+esc(x.nom)+'</option>'; }).join("") + '</select><button type="button" class="bouton" data-catt="1">Attribuer</button>';
      }
    }
    if(msg) h += '<div class="bandeau">'+esc(msg)+'</div>';
    el.innerHTML = h;
    document.getElementById("aps").onchange = function(){ choisi = this.value; caseSel = ""; confirmer = null; msg = ""; dessiner(); };
    document.getElementById("apc").onchange = function(){ caseSel = this.value; choisi = ""; confirmer = null; msg = ""; dessiner(); };
    Array.prototype.forEach.call(el.querySelectorAll("[data-cx]"), function(b){ b.onclick = function(){ confirmer = "case"; dessiner(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-cnon]"), function(b){ b.onclick = function(){ confirmer = null; dessiner(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-coui]"), function(b){ b.onclick = function(){ var o = occ[+caseSel]; if(o) ecrire(o.champ, "", o.e.ligne); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-catt]"), function(b){ b.onclick = function(){ var v = document.getElementById("ape").value; if(!v){ msg = "▪ CHOISISSEZ UN EMPLOYÉ"; dessiner(); return; } var o2 = occ[+caseSel], nv = Number(v); if(o2) ecrire(o2.champ, "", o2.e.ligne, function(){ ecrire(estPlace ? "place" : "casier1", caseSel, nv); }); else ecrire(estPlace ? "place" : "casier1", caseSel, nv); }; });
    Array.prototype.forEach.call(el.querySelectorAll("select[data-m]"), function(q){ q.onchange = function(){ var k = q.getAttribute("data-m"); if(q.value === "liberer"){ confirmer = k; transf = null; } else if(q.value === "transferer" || q.value === "attribuer"){ transf = k; confirmer = null; } dessiner(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-x]"), function(b){ b.onclick = function(){ confirmer = b.getAttribute("data-x"); dessiner(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-non]"), function(b){ b.onclick = function(){ confirmer = null; dessiner(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-oui]"), function(b){ b.onclick = function(){ ecrire(b.getAttribute("data-oui"), ""); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-att]"), function(b){ b.onclick = function(){ var t = b.getAttribute("data-att"), v = document.getElementById("apn-"+t).value; if(!v){ msg = "▪ CHOISISSEZ UN NUMÉRO"; dessiner(); return; } ecrire(t, v); }; });
  }
  function ecrire(type, valeur, ligne, suite){
    msg = "▪ ENREGISTREMENT…"; confirmer = null; transf = null; dessiner();
    appelService({action:"parking_ecrire", session:sessionGardee(), type:type, ligne:(ligne !== undefined ? ligne : Number(choisi)), valeur:valeur}).then(function(r){
      if(r && r.ok){ d = r; msg = "▪ ENREGISTRÉ"; if(suite){ suite(); return; } } else msg = "▪ " + String((r && r.erreur) || "ÉCHEC").toUpperCase();
      dessiner();
    }).catch(function(){ msg = "▪ ÉCHEC · RÉESSAYEZ"; dessiner(); });
  }
  appelService({action:"parking_lire", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0; d = r; dessiner();
  }).catch(function(){ var el = document.getElementById("ap"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}

// Nouvel employé (Direction): même parcours en 8 étapes que le formulaire du classeur. Rose = obligatoire pour le contrat, beige = facultatif. Rien n'est enregistré tant que le Service n'a pas la fonction de création.
var NE_ETAPES = [
 {t:"Identité", c:[
  {k:"nom", l:"Nom de famille", r:1}, {k:"prenom", l:"Prénom", r:1}, {k:"usuel", l:"Prénom usuel"},
  {k:"accord", l:"Accord dans les documents", r:1, o:["Féminin (employée)","Masculin (employé)"]},
  {k:"naiss", l:"Date de naissance", r:1, ty:"date"},
  {k:"statut", l:"Statut au Canada", r:1, o:["Citoyen canadien","Résident permanent","Permis de travail"]},
  {k:"permis", l:"Expiration du permis de travail", r:1, ty:"date", si:function(v){ return v.statut === "Permis de travail"; }}]},
 {t:"Coordonnées", c:[
  {k:"adresse", l:"Adresse", r:1}, {k:"appt", l:"Appartement"}, {k:"ville", l:"Ville", r:1}, {k:"prov", l:"Province", d:"Québec"},
  {k:"cp", l:"Code postal", r:1, ty:"cp"}, {k:"tel", l:"Téléphone", r:1, ty:"tel"}, {k:"tel2", l:"Autre téléphone", ty:"tel"},
  {k:"courriel", l:"Courriel personnel", r:1, ty:"courriel"}]},
 {t:"Poste", c:[
  {k:"cat", l:"Catégorie", r:1, o:["Administratif","Auxiliaire","Professionnel en informatique","Technologue","Gestionnaire","Expert technique"]},
  {k:"entree", l:"Date d'entrée en fonction", r:1, ty:"date"}, {k:"exp", l:"Expérience dans le métier (années)", r:1, ty:"nombre"},
  {k:"resp", l:"Responsable des évaluations", r:1, dyn:1, d:"CHARLES"}, {k:"prog", l:"Programme de reconnaissance", auto:1, si:function(v){ return !!NE_PROG[v.cat]; }}]},
 {t:"Horaire", c:[{k:"horaire", l:"Horaire", ty:"horaire"}, {k:"heures", l:"Heures par semaine", r:1, ty:"nombre", d:"40"}, {k:"arrivee", l:"Arrivée, première journée", r:1, ty:"heure", d:"08:00"}, {k:"accueil", l:"Personne qui accueille", r:1, dyn:1, d:"Charles Desjardins"}]},
 {t:"Documents", c:[{k:"docs", l:"Documents à apporter", ty:"liste"}]},
 {t:"Avantages", c:[
  {k:"assur", l:"Assurance annuelle", r:1, ty:"nombre"}, {k:"otpadq", l:"Cotisation OTPADQ", r:1, ty:"nombre"}, {k:"boni", l:"Boni", r:1, ty:"nombre"},
  {k:"vac", l:"Semaines de vacances", r:1, ty:"nombre"}, {k:"feries", l:"Jours fériés", r:1, ty:"nombre"}, {k:"maladie", l:"Jours de maladie", r:1, ty:"nombre"}]},
 {t:"Responsabilités", c:[{k:"resps", l:"Responsabilités", ty:"resp"}]},
 {t:"Bilan des responsabilités", c:[{k:"bilan", l:"Bilan", ty:"bilan"}]},
 {t:"Résumé", c:[{k:"comm", l:"Questions ou commentaires", ty:"long"}]}
];
var NE_PROG = {"Gestionnaire":"Gestion", "Expert technique":"Production", "Gestionnaire / Expert":"Gestion", "Auxiliaire":"Production", "Technologue":"Production", "Professionnel en informatique":"Production"};
var NE_JOURS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
var NE_DOCS = ["Votre numéro d'assurance sociale.","Une copie de votre permis de travail, s'il y a lieu.","Un spécimen de chèque, ou une preuve de dépôt direct de votre institution financière.","Une copie de vos diplômes et de votre carte de membre d'un ordre professionnel, s'il y a lieu.","Une preuve d'adresse récente, ainsi que votre courriel, votre numéro de téléphone et votre date de naissance."];
var NE_HOR_ADM = [["08:00","17:00"],["07:30","17:00"],["07:30","17:00"],["07:30","17:00"],["07:30","12:00"]];
var NE_HOR_PROD = [["08:00","17:00"],["07:00","17:00"],["07:00","17:00"],["07:00","17:00"],["07:00","12:00"]];
// Valeurs par défaut du classeur (calculées là-bas depuis les employés actifs; à relire du Service quand il les fournira)
var NE_AVANT = {"Administratif":{assur:1500,otpadq:0,boni:"",vac:2,feries:10,maladie:6},"Auxiliaire":{assur:2300,otpadq:264,boni:4200,vac:2,feries:10,maladie:6},"Professionnel en informatique":{assur:1900,otpadq:264,boni:4200,vac:2,feries:10,maladie:6},"Technologue":{assur:2500,otpadq:680,boni:4200,vac:2,feries:10,maladie:6},"Gestionnaire":{assur:2500,otpadq:680,boni:4200,vac:3,feries:10,maladie:2},"Expert technique":{assur:2500,otpadq:680,boni:4200,vac:3,feries:10,maladie:2},"Gestionnaire / Expert":{assur:2500,otpadq:680,boni:4200,vac:3,feries:10,maladie:2}};
function neHeures(h){
  var t = 0, n = 0;
  for(var i = 0; i < 7; i++){ var d = h[i]; if(d && d.a && d.b && d.b > d.a){ n++; var m = (Number(d.b.slice(0,2)) * 60 + Number(d.b.slice(3))) - (Number(d.a.slice(0,2)) * 60 + Number(d.a.slice(3))); if(m > 360) m -= 60; t += m; } }
  return n ? String(Math.round(t / 60 * 100) / 100) : "";
}
function neValide(ty, v){
  v = String(v || "").trim(); if(!v) return false;
  if(ty === "courriel") return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v);
  if(ty === "tel") return /^1?\d{10}$/.test(v.replace(/\D/g, ""));
  if(ty === "cp") return /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(v);
  if(ty === "nombre") return /^-?\d+([.,]\d+)?$/.test(v.replace(/[\s$]/g, ""));
  if(ty === "date") return /^\d{4}-\d{2}-\d{2}$/.test(v);
  if(ty === "heure") return /^\d{2}:\d{2}$/.test(v);
  return true;
}
// Règle de Charles: un employé s'ajoute toujours par « Position embauche ». Cet onglet ne reprend que les candidats de la liste d'attente (fiches préparées là-bas).
var NE_ENV = null;
function neMonCourriel(){ var c = (MOI && MOI.courriel) || ""; if(!c){ try { c = localStorage.getItem("ldld-courriel") || ""; } catch(e){} } return c || "votre courriel de connexion"; }
function neBarrePage(){
  var z = document.getElementById("gebar"); var E = NE_ENV; if(!z) return;
  if(!E){ z.innerHTML = ""; return; }
  var rouge = E.etat === "non", t = E.etat === "cours" ? E.lib.cours : (E.etat === "ok" ? E.lib.ok : E.lib.non + " · " + (E.err || ""));
  z.innerHTML = '<div style="margin:12px 0 8px"><div style="height:14px;background:var(--beige);border:1px solid var(--tx2);position:relative"><i style="position:absolute;left:0;top:0;bottom:0;width:'+Math.round(E.etat === "non" ? 0 : E.p)+'%;background:#0d1117"></i></div><div style="font-size:30px;font-weight:300;margin-top:6px">'+Math.round(E.etat === "non" ? 0 : E.p)+' %</div></div><div class="bandeau" style="'+(rouge ? "background:#a32d2d;color:#fff" : "background:#8EFF60;color:#1D1D1B")+';padding:10px 12px;font-weight:600">▪ '+esc(t.toUpperCase())+'<br>'+esc(E.nom)+'</div>';
}
function neEnvDessiner(){
  neBarrePage();
  var z = document.getElementById("envg"); if(!z) return;
  var E = NE_ENV; if(!E){ z.innerHTML = ""; return; }
  var L = E.lib, st = "background:#8EFF60;color:#1D1D1B;font-weight:600;font-size:13px;letter-spacing:.14em;text-transform:uppercase;padding:12px 14px;line-height:1.5;margin:0 0 22px;cursor:pointer", h = "";
  if(E.etat === "cours") h = '▪ '+esc(L.cours)+' · '+Math.round(E.p)+' %<br>'+esc(E.nom);
  else if(E.etat === "ok") h = '▪ '+esc(L.ok)+' · 100 %<br>'+esc(E.nom)+(E.ldld ? ' · '+esc(E.ldld) : "");
  else { st = st.replace("#8EFF60", "#a32a2d").replace("#1D1D1B", "#fff"); h = '▪ '+esc(L.non)+'<br>'+esc(E.nom)+' · '+esc(E.err || "")+'<br>Touchez pour réessayer'; }
  z.innerHTML = '<div id="envb" style="'+st+'">'+h+'</div>';
  var b = document.getElementById("envb"); if(b) b.onclick = function(){ if(E.etat === "ok"){ NE_ENV = null; neEnvDessiner(); } else if(E.etat === "non") neTache(E.cfg); };
}
// Tâche en arrière-plan avec bandeau d'état sur l'accueil (vert en cours/terminé, rouge en cas d'échec).
function neTache(cfg){
  var t0 = Date.now(), fin = false;
  var E = NE_ENV = {etat: "cours", p: 0, nom: cfg.nom, lib: cfg.lib, cfg: cfg};
  var tick = setInterval(function(){ if(!fin){ E.p = 92 * (1 - Math.exp(-(Date.now() - t0) / (cfg.duree || 40000))); if(NE_ENV === E) neEnvDessiner(); } }, 500);
  if(cfg.reste){ neBarrePage(); } else { responsable(); neEnvDessiner(); }
  cfg.run().then(function(r){
    fin = true; clearInterval(tick);
    if(r && r.ok){ E.etat = "ok"; E.p = 100; E.ldld = cfg.suite ? cfg.suite(r) : ""; }
    else { E.etat = "non"; E.err = String((r && r.erreur) || "Réessayez"); }
    if(NE_ENV === E) neEnvDessiner();
    if(cfg.fin) cfg.fin(E);
  }).catch(function(){ fin = true; clearInterval(tick); E.etat = "non"; E.err = cfg.reseau || "Réseau, réessayez"; if(NE_ENV === E) neEnvDessiner(); });
}
function neEnvoyer(dem){
  neTache({nom: dem.nom, lib: {cours: "Envoi contrat en cours", ok: "Contrat envoyé", non: "Contrat non envoyé"}, reseau: "Réponse non reçue, vérifiez votre courriel avant de réessayer",
    run: function(){ return appelService({action: "docusign_envoyer", session: sessionGardee(), id: dem.id, courriel: dem.courriel, confirme: true}).then(function(r){ if(r && r.ok){ NE_ATT = null; NE_ATTP = null; menu.attPre = false; } return r; }); },
    suite: function(r){ return (r.r && r.r.ldld) || ""; }});
}
var NE_ATT = (function(){ try { var a = JSON.parse(localStorage.getItem("ldld-ne-att") || "null"); return Array.isArray(a) ? a : null; } catch(e){ return null; } })(), NE_BRP = {}, NE_ATTP = null, NE_ATTT = 0;
function neAttCharger(sansBrouillons){
  if(NE_ATTP) return NE_ATTP;
  var p = NE_ATTP = appelService({action: "embauche_attente", session: sessionGardee()}).then(function(r){
    if(!(r && r.ok)){ NE_ATTP = null; return NE_ATT || []; }
    var l = (r.r && r.r.length) ? r.r : [];
    NE_ATT = l; NE_ATTT = Date.now(); NE_ATTP = null; NE_BRP = {}; try { localStorage.setItem("ldld-ne-att", JSON.stringify(l)); } catch(e){}
    if(!sansBrouillons) l.forEach(function(c){ NE_BRP[c.id] = appelService({action: "embauche_brouillon", session: sessionGardee(), id: c.id}).catch(function(){ return null; }); });
    return l;
  }, function(e){ NE_ATTP = null; throw e; });
  return p;
}
function nouvelEmploye(){
  var MSG = "Veuillez utiliser l’onglet Position d’embauche afin de créer une fiche nouvel employé.";
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Contrat d’embauche</h1><div id="nl"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  function vide(){ var z = document.getElementById("nl"); if(z) z.innerHTML = '<div style="margin:22vh 0 0;background:#8EFF60;color:#1D1D1B;padding:26px 20px;text-align:center;font-size:16px;line-height:1.45;letter-spacing:.06em;text-transform:uppercase;font-weight:500">'+esc(MSG)+'</div>'; }
  function montrer(l){
    var z = document.getElementById("nl"); if(!z) return;
    if(!l.length){ vide(); return; }
    z.innerHTML = '<div class="etq">▪ CANDIDATS EN ATTENTE</div>'+l.map(function(c, i){ return '<a class="doc" href="#" data-i="'+i+'"><span>▪ '+esc(((c.v && c.v.prenom) || "")+" "+((c.v && c.v.nom) || ""))+'</span></a>'; }).join("");
    Array.prototype.forEach.call(z.querySelectorAll("[data-i]"), function(q){ q.onclick = function(e){ e.preventDefault(); var c = l[Number(q.getAttribute("data-i"))]; if(q.getAttribute("data-b")) return; q.setAttribute("data-b", "1");
      var sp = q.querySelector("span"), t0 = sp ? sp.textContent : ""; if(sp) sp.textContent = "▪ OUVERTURE EN COURS";
      var pr = NE_BRP[c.id] || appelService({action: "embauche_brouillon", session: sessionGardee(), id: c.id});
      pr.then(function(rr){
        var v = (rr && rr.ok && rr.r && rr.r.valeurs) || null;
        if(!v){ if(sp) sp.textContent = t0; q.removeAttribute("data-b"); neFormulaire(c); return; }
        var M = {nomFamille:"nom", codePostal:"cp", naissance:"naiss", experience:"exp", categorie:"cat", assurance:"assur", semainesVacances:"vac", joursFeries:"feries", joursMaladie:"maladie"};
        var w = {}, pos = {}; Object.keys(c.v || {}).forEach(function(k){ w[k] = c.v[k]; });
        Object.keys(v).forEach(function(k){ if(["salaire","position","echelleAnnee"].indexOf(k) >= 0){ pos[k] = v[k]; return; } var x = v[k]; if(x === null || x === undefined || x === "") return; w[M[k] || k] = x; });
        var et = null; try{ et = w.appEtat ? JSON.parse(w.appEtat) : null; }catch(x){ et = null; } delete w.appEtat; neFormulaire({id: c.id, v: w, etat: et, pos: pos});
      }).catch(function(){ if(sp) sp.textContent = t0; q.removeAttribute("data-b"); neFormulaire(c); }); }; });
  }
  if(NE_ATT) montrer(NE_ATT);
  else { var z0 = document.getElementById("nl"); if(z0) z0.innerHTML = '<div class="etq">▪ CANDIDATS EN ATTENTE</div>'; }
  if(NE_ATT && Date.now() - NE_ATTT < 90000) return;
  neAttCharger().then(function(l){ if(document.getElementById("nl")) montrer(l); }).catch(function(){ if(!NE_ATT) vide(); });
}
var NE_LISTE = null;
function neBilanResp(S){
  if(!NE_RESP) return "";
  var tot = 0, h = "", vus = {};
  NE_RESP.groupes.forEach(function(g){
    var l = g.items.filter(function(it){ if(it.section || !S.rc[it.k]) return false; var n = String(it.texte).toLowerCase().replace(/\s+/g, " ").trim(); if(vus[n]) return false; vus[n] = 1; return true; });
    if(!l.length) return;
    h += '<div class="nrb"><b>'+esc(String(g.groupe).toUpperCase())+' · '+l.length+' TÂCHE'+(l.length > 1 ? "S" : "")+'</b>'+l.map(function(it){ tot++; return '<div class="nrx"><span>'+tot+'. '+esc(it.texte)+'</span><button type="button" class="nrxb" data-rx="'+it.k+'" aria-label="Retirer cette tâche">×</button></div>'; }).join("")+'</div>';
  });
  return h || '<div class="bandeau">▪ AUCUNE RESPONSABILITÉ CHOISIE</div>';
}
function neAff(c, v){
  v = String(v || "");
  if(c.ty === "date" && /^\d{4}-\d{2}-\d{2}$/.test(v)){ var M = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."]; return Number(v.slice(8)) + " " + M[Number(v.slice(5, 7)) - 1] + " " + v.slice(0, 4); }
  if(c.ty === "tel"){ var d = v.replace(/\D/g, ""); if(d.length === 11 && d[0] === "1") d = d.slice(1); if(d.length === 10) return d.slice(0, 3) + "-" + d.slice(3, 6) + "-" + d.slice(6); }
  return v;
}
var NE_RESP = null, NE_RESP_EN = false;
function neRespCharger(fin){
  if(NE_RESP){ fin(); return; } if(NE_RESP_EN) return; NE_RESP_EN = true;
  appelService({action:"embauche_responsabilites", session:sessionGardee()}).then(function(r){ NE_RESP_EN = false; if(r && r.ok && r.r && r.r.groupes){ NE_RESP = r.r; fin(); } }).catch(function(){ NE_RESP_EN = false; });
}
function neChoix(rafraichir){
  function fin(r, a){ NE_LISTE = {resp: r, accueil: a}; rafraichir(); }
  appelService({action:"embauche_choix", session:sessionGardee()}).then(function(r){
    if(r && r.ok && r.r && r.r.responsables && r.r.accueil) return fin(r.r.responsables, r.r.accueil);
    throw 0;
  }).catch(function(){
    appelService({action:"employes_etat", session:sessionGardee()}).then(function(r){ if(r && r.ok && r.actifs){ var n = r.actifs.map(function(x){ return x.nom; }).filter(Boolean).sort(function(a, b){ return a.localeCompare(b, "fr"); }); fin(n, n); } }).catch(function(){});
  });
}
function neFormulaire(cand){
  if(!NE_LISTE) neChoix(function(){ if(document.getElementById("ne") && window.__neDess) window.__neDess(); });
  var S = {e:0, v:{}, h:{}, docs:NE_DOCS.slice(), id:(cand && cand.id) || "", pos:(cand && cand.pos) || {}};
  window.__neDess = function(){ dessiner(); };
  NE_ETAPES.forEach(function(et){ et.c.forEach(function(c){ if(c.d) S.v[c.k] = c.d; }); });
  var CORR = {responsable:"resp", assurance:"assur", vacances:"vac", appartement:"appt", province:"prov", permisExp:"permis", commentaires:"comm", prenomUsuel:"usuel", naissance:"naiss"};
  if(cand && cand.v) Object.keys(cand.v).forEach(function(k){ var v = cand.v[k]; if(v === null || v === undefined || v === "" || k === "enregistre" || k === "envoye" || k === "programme") return;
    if(k === "exp" && Number(v) > 1900) v = String(new Date().getFullYear() - Number(v));
    S.v[CORR[k] || k] = String(v); });
  if(typeof S.v.horaire === "string" && S.v.horaire){ S.v.horaire.split(";").forEach(function(seg){ var m = seg.trim().match(/^(\S+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/), i = m ? NE_JOURS.indexOf(m[1]) : -1; if(i >= 0) S.h[i] = {a:m[2], b:m[3]}; }); delete S.v.horaire; if(Object.keys(S.h).length && !(cand && cand.v && cand.v.heures)) S.v.heures = neHeures(S.h); }
  if(S.v.cat && !Object.keys(S.h).length){ var hh0 = S.v.cat === "Administratif" ? NE_HOR_ADM : NE_HOR_PROD; hh0.forEach(function(x, i){ S.h[i] = {a:x[0], b:x[1]}; }); if(!(cand && cand.v && cand.v.heures)) S.v.heures = neHeures(S.h); if(!S.v.arrivee) S.v.arrivee = "08:00"; }
  if(cand && cand.etat && cand.etat.v){ Object.keys(cand.etat.v).forEach(function(k){ S.v[k] = String(cand.etat.v[k]); }); if(cand.etat.h) S.h = cand.etat.h; if(cand.etat.docs && cand.etat.docs.length) S.docs = cand.etat.docs; if(typeof cand.etat.e === "number" && cand.etat.e >= 0 && cand.etat.e <= 8) S.e = cand.etat.e; }
  S.rc = {}; S.rs = 0; var rinit = false;
  if(cand && cand.etat && cand.etat.r){ cand.etat.r.forEach(function(k){ S.rc[k] = 1; }); rinit = true; if(typeof cand.etat.rs === "number") S.rs = cand.etat.rs; }
  neRespCharger(function(){ if(!rinit){ (NE_RESP.defauts || []).forEach(function(k){ S.rc[k] = 1; }); rinit = true; } if((S.e === 6 || S.e === 7) && document.getElementById("ne")) dessiner(); });
  var sauvT = null, sauvJ = "";
  function sauver(){
    if(!/^[0-9a-f]{8}$/.test(S.id || "")) return;
    var v = {}; Object.keys(S.v).forEach(function(k){ if(S.v[k] !== "" && S.v[k] !== undefined && S.v[k] !== null) v[k] = S.v[k]; });
    var j = JSON.stringify({v: v, h: S.h, docs: S.docs, e: S.e, r: Object.keys(S.rc), rs: S.rs}); if(j.length > 5900 || j === sauJ()) return; sauvJ = j;
    appelService({action: "embauche_brouillon_maj", session: sessionGardee(), id: S.id, etape: Math.min(7, S.e), etat: j}).catch(function(){});
  }
  function sauJ(){ return sauvJ; }
  function sauverVite(){ clearTimeout(sauvT); sauvT = setTimeout(sauver, 800); }
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Contrat d’embauche</h1><div id="ne"></div></div>';
  function visible(c){ return !c.si || c.si(S.v); }
  function horaireOk(){
    var n = 0; for(var i = 0; i < 7; i++){ var d = S.h[i] || {}; if(d.a || d.b){ if(!neValide("heure", d.a) || !neValide("heure", d.b) || d.b <= d.a) return false; n++; } }
    return n > 0;
  }
  function champOk(c){
    if(!visible(c) || c.auto) return true;
    if(c.ty === "horaire") return horaireOk();
    if(c.ty === "liste") return S.docs.some(function(x){ return x.trim(); });
    if(c.ty === "resp" || c.ty === "long" || c.ty === "bilan") return true;
    if(!c.r) return !String(S.v[c.k] || "").trim() || neValide(c.ty, S.v[c.k]);
    return neValide(c.ty, S.v[c.k]);
  }
  function etapeOk(i){ return NE_ETAPES[i].c.every(champOk); }
  function champ(c){
    if(!visible(c)) return "";
    var v = S.v[c.k] || "", cl = "bx" + (c.r && !champOk(c) ? " rose" : (!c.r ? " beige" : ""));
    if(c.auto) return '<span class="lbl">'+c.l+'</span><div class="bx beige nauto"><b>'+esc(NE_PROG[S.v.cat] || "")+'</b></div>';
    if(c.ty === "horaire") return '<div class="etq">▪ HORAIRE · AU MOINS UNE JOURNÉE</div>' + NE_JOURS.map(function(j, i){ var d = S.h[i] || {}; return '<div class="nhr"><span>'+j+'</span><input class="bx '+(d.a ? "" : "beige")+'" type="time" data-h="'+i+'a" value="'+esc(d.a || "")+'"><input class="bx '+(d.b ? "" : "beige")+'" type="time" data-h="'+i+'b" value="'+esc(d.b || "")+'"></div>'; }).join("");
    if(c.ty === "liste") return '<div class="etq">▪ DOCUMENTS À APPORTER · 8 AU MAXIMUM</div>' + S.docs.map(function(x, i){ return '<input class="bx '+(x.trim() ? "" : (i ? "beige" : "rose"))+'" data-d="'+i+'" placeholder="Document '+(i + 1)+'" value="'+esc(x)+'">'; }).join("") + (S.docs.length < 8 ? '<div class="aeact"><button type="button" class="bouton lg" id="nedoc">Ajouter un document</button></div>' : "");
    if(c.ty === "bilan") return neBilanResp(S);
    if(c.ty === "resp"){
      if(!NE_RESP) return '<div class="bandeau">▪ UN INSTANT</div>';
      var G = NE_RESP.groupes, g = G[S.rs] || G[0], nb = Object.keys(S.rc).length;
      var h2 = '<div class="nrrow"><select class="bx nrsel" id="rsel">'+G.map(function(x, i){ return '<option value="'+i+'"'+(i === S.rs ? " selected" : "")+'>'+(i + 1)+' / '+G.length+' · '+esc(String(x.groupe).toUpperCase())+'</option>'; }).join("")+'</select><button type="button" class="nrnext" id="rnext"'+(S.rs >= G.length - 1 ? " disabled" : "")+'>→</button></div>';
      if(g.description) h2 += '<div class="nrr nrd" data-rkk="'+g.description.k+'"><span>'+esc(g.description.texte)+'</span><i class="nrc'+(S.rc[g.description.k] ? " on" : "")+'"></i></div>';
      h2 += g.items.map(function(it){ return it.section ? '<div class="nrs">'+esc(it.texte)+'</div>' : '<div class="nrr" data-rkk="'+it.k+'"><span>'+esc(it.texte)+'</span><i class="nrc'+(S.rc[it.k] ? " on" : "")+'"></i></div>'; }).join("");
      return h2 + '<div class="etq" style="margin-top:14px">▪ '+nb+' RESPONSABILITÉ'+(nb > 1 ? "S" : "")+' CHOISIE'+(nb > 1 ? "S" : "")+'</div>';
    }
    if(c.ty === "long") return '<span class="lbl">'+c.l+'</span>'+'<textarea class="bx beige" data-k="'+c.k+'" placeholder="'+c.l+'">'+esc(v)+'</textarea>';
    if(c.o) return '<span class="lbl">'+c.l+'</span>'+'<select class="'+cl+'" data-k="'+c.k+'"><option value="">'+c.l+'</option>'+c.o.map(function(o){ return '<option'+(o === v ? " selected" : "")+'>'+esc(o)+'</option>'; }).join("")+'</select>';
    var im = c.ty === "tel" ? ' inputmode="tel"' : (c.ty === "nombre" ? ' inputmode="decimal"' : (c.ty === "courriel" ? ' inputmode="email"' : ""));
    if(c.dyn){ var lo = (NE_LISTE ? (c.k === "resp" ? NE_LISTE.resp : NE_LISTE.accueil) : []).slice(); if(v && lo.indexOf(v) < 0) lo.unshift(v); return '<span class="lbl">'+c.l+'</span>'+'<select class="'+cl+'" data-k="'+c.k+'"><option value="">'+c.l+(NE_LISTE ? "" : " · CHARGEMENT")+'</option>'+lo.map(function(o){ return '<option'+(o === v ? " selected" : "")+'>'+esc(o)+'</option>'; }).join("")+'</select>'; }
    if(c.ty === "date") return '<span class="lbl">'+c.l+'</span><input type="date" class="'+cl+'" data-k="'+c.k+'" value="'+esc(v)+'">';
    return '<span class="lbl">'+c.l+'</span>'+'<input class="'+cl+'" data-k="'+c.k+'"'+im+' placeholder="'+c.l+'" value="'+esc(v)+'">';
  }
  function dessiner(){
    var el = document.getElementById("ne"), et = NE_ETAPES[S.e];
    var h = '<div class="etq">▪ ÉTAPE '+(S.e + 1)+' SUR '+NE_ETAPES.length+' · '+et.t.toUpperCase()+'</div><div class="nbar">'+NE_ETAPES.map(function(x, i){ return '<i class="'+(i <= S.e ? "on" : "")+'"></i>'; }).join("")+'</div>';
    if(S.e === 8){
      var lg = function(a, b){ return '<div class="ligne"><span>'+esc(a)+'</span><span>'+esc(b)+'</span></div>'; };
      h += NE_ETAPES.slice(0, 6).map(function(x){ var ls = x.c.filter(function(c){ return visible(c) && c.ty !== "horaire" && c.ty !== "liste" && c.ty !== "resp" && c.ty !== "bilan"; }).map(function(c){ return lg(c.l, c.auto ? (NE_PROG[S.v.cat] || "—") : (S.v[c.k] ? neAff(c, S.v[c.k]) : "—")); }).join(""); return ls ? '<div class="etq" style="margin-top:14px">▪ '+esc(x.t.toUpperCase())+'</div>'+ls : ""; }).join("");
      // Positionnement (calculé dans Position embauche)
      var P = S.pos || {}, fr = function(n, d){ return Number(n).toLocaleString("fr-CA", {minimumFractionDigits: d, maximumFractionDigits: d}); };
      h += '<div class="etq" style="margin-top:14px">▪ POSITIONNEMENT</div>';
      h += lg("Échelle salariale", P.echelleAnnee ? String(P.echelleAnnee) : "—");
      h += lg("Position", (P.position !== undefined && P.position !== "" && !isNaN(Number(P.position))) ? fr(Number(P.position) <= 1 ? Number(P.position) * 100 : P.position, 0)+" %" : "—");
      h += lg("Salaire horaire", (P.salaire !== undefined && P.salaire !== "" && !isNaN(Number(P.salaire))) ? fr(P.salaire, 2)+" $" : "—");
      // Horaire, documents et responsabilités: chaque section a son titre; les longues listes sont en pleine largeur, une ligne par élément
      var sec = function(t){ return '<div class="etq" style="margin-top:14px">▪ '+esc(t)+'</div>'; };
      var pl = function(t){ return '<div class="ligne" style="display:block"><span>'+esc(t)+'</span></div>'; };
      var hj = NE_JOURS.map(function(j, i){ var d = S.h[i]; return d && d.a && d.b ? [j, d.a+" – "+d.b] : null; }).filter(Boolean);
      h += sec("HORAIRE") + (hj.length ? hj.map(function(x){ return lg(x[0], x[1]); }).join("") : lg("Horaire", "—"));
      var dn = S.docs.filter(function(x){ return String(x).trim(); });
      h += sec("DOCUMENTS À APPORTER · "+dn.length) + (dn.length ? dn.map(pl).join("") : lg("Documents", "—"));
      var rt = []; if(NE_RESP) NE_RESP.groupes.forEach(function(g){ if(g.description && S.rc[g.description.k]) rt.push(g.description.texte); g.items.forEach(function(it){ if(!it.section && S.rc[it.k]) rt.push(it.texte); }); });
      var nbr = Object.keys(S.rc || {}).length;
      h += sec("RESPONSABILITÉS · "+nbr) + (rt.length ? rt.map(pl).join("") : lg("Responsabilités", "—"));
      h += et.c.map(champ).join("");
      h += '<div class="bandeau">▪ ENVOI PAR DOCUSIGN · À VENIR</div>';
    } else h += et.c.map(champ).join("");
    h += '<div class="aeact tro">'+(S.e ? '<button type="button" class="bouton lg" id="nep">Précédent</button>' : "")+(S.e < 8 ? '<button type="button" class="bouton" id="nes"'+(etapeOk(S.e) ? "" : " disabled")+'>Suivant</button>' : '<button type="button" class="bouton" id="neok">Envoyer le contrat</button>')+'</div>';
    if(S.pop) h += '<div class="pop"><div class="popc"><div class="popt">Envoyer le contrat via DocuSign ?</div><div class="popd"><div>'+esc((S.v.prenom || "")+" "+(S.v.nom || ""))+'</div><div>'+esc(S.v.courriel || "")+'</div><div>Signature : l’employé, puis la Société</div><div>Dossier et numéro LDLD créés</div><div>Confirmation d’envoi par courriel :</div><div>'+esc(neMonCourriel())+'</div></div>'+'<div class="aeact"><button type="button" class="bouton" id="neoui">Oui, envoyer</button><button type="button" class="bouton lg" id="nenon">Non</button></div></div></div>';
    el.innerHTML = h;
    Array.prototype.forEach.call(el.querySelectorAll("[data-k]"), function(q){ q.oninput = q.onchange = function(){ S.v[q.getAttribute("data-k")] = q.value; majBtn(q); sauverVite(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-d]"), function(q){ q.oninput = function(){ S.docs[Number(q.getAttribute("data-d"))] = q.value; majBtn(q); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-h]"), function(q){ q.onchange = function(){ var m = q.getAttribute("data-h"), i = Number(m[0]); S.h[i] = S.h[i] || {}; S.h[i][m[1]] = q.value; S.v.heures = neHeures(S.h) || S.v.heures; dessiner(); sauverVite(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-rx]"), function(q){ q.onclick = function(){ delete S.rc[q.getAttribute("data-rx")]; var y = lireY(); dessiner(); window.scrollTo(0, y); sauverVite(); }; });
    var rsel = document.getElementById("rsel"); if(rsel) rsel.onchange = function(){ S.rs = Number(rsel.value); window.scrollTo(0, 0); dessiner(); sauverVite(); };
    var rnx = document.getElementById("rnext"); if(rnx) rnx.onclick = function(){ S.rs = Math.min(NE_RESP.groupes.length - 1, S.rs + 1); window.scrollTo(0, 0); dessiner(); sauverVite(); };
    Array.prototype.forEach.call(el.querySelectorAll("[data-rkk]"), function(q){ q.onclick = function(){
      var k = q.getAttribute("data-rkk"), g = NE_RESP.groupes[S.rs], on = !S.rc[k];
      if(g.description && g.description.k === k){ g.items.forEach(function(it){ if(!it.section){ if(on) S.rc[it.k] = 1; else delete S.rc[it.k]; } }); }
      if(on) S.rc[k] = 1; else { delete S.rc[k]; if(g.description && g.description.k !== k) delete S.rc[g.description.k]; }
      var y = lireY(); dessiner(); window.scrollTo(0, y); sauverVite(); }; });
    var dc = document.getElementById("nedoc"); if(dc) dc.onclick = function(){ S.docs.push(""); dessiner(); };
    var n = document.getElementById("nes"); if(n) n.onclick = function(){ if(etapeOk(S.e)){ S.e++; window.scrollTo(0, 0); dessiner(); sauver(); } };
    var ok = document.getElementById("neok"); if(ok) ok.onclick = function(){ S.pop = 1; dessiner(); };
    var oui = document.getElementById("neoui"); if(oui) oui.onclick = function(){
      if(NE_ENV && NE_ENV.etat === "cours") return;
      S.pop = 0; neEnvoyer({id: S.id, courriel: S.v.courriel || "", nom: ((S.v.prenom || "")+" "+(S.v.nom || "")).trim()});
    };
    var non = document.getElementById("nenon"); if(non) non.onclick = function(){ S.pop = 0; dessiner(); };
    var p = document.getElementById("nep"); if(p) p.onclick = function(){ S.e--; window.scrollTo(0, 0); dessiner(); sauver(); };
  }
  function majBtn(q){
    var et = NE_ETAPES[S.e], k = q.getAttribute("data-k"), c = et.c.filter(function(x){ return x.k === k; })[0];
    if(c && c.r){ q.classList.toggle("rose", !champOk(c)); }
    if(c && c.k === "cat"){
      var hh = S.v.cat === "Administratif" ? NE_HOR_ADM : NE_HOR_PROD; S.h = {};
      hh.forEach(function(x, i){ S.h[i] = {a:x[0], b:x[1]}; }); S.v.heures = neHeures(S.h); S.v.arrivee = "08:00";
      var av = NE_AVANT[S.v.cat] || {}; Object.keys(av).forEach(function(k){ S.v[k] = String(av[k]); });
    }
    if(c && (c.k === "statut" || c.k === "cat")){ S.v.prog = NE_PROG[S.v.cat] || ""; dessiner(); return; }
    var n = document.getElementById("nes"); if(n) n.disabled = !etapeOk(S.e);
  }
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); if(S.e){ S.e--; dessiner(); } else nouvelEmploye(); };
  dessiner();
}
// Fiche d'une machine: les tâches sont regroupées par fréquence (du plus fréquent au moins fréquent). La fréquence est lue à la fin de chaque tâche (« chaque jour », « aux 2 semaines »...); sans fréquence = « À préciser ». Les données de la feuille ne changent pas.
var FREQS = ["Chaque matin", "Chaque jour", "Chaque soir", "Chaque lundi", "Chaque mardi", "Chaque mercredi", "Chaque jeudi", "Chaque vendredi", "Chaque semaine", "Aux 2 semaines", "Chaque mois", "Aux 3 mois", "Au besoin"];
function groupesFrequence(taches){
  var RANG = {"chaque matin":0, "chaque jour":1, "chaque soir":2, "chaque lundi":3, "chaque mardi":3.1, "chaque mercredi":3.2, "chaque jeudi":3.3, "chaque vendredi":3.4, "chaque semaine":3.5, "aux 2 semaines":4, "chaque mois":5, "aux 3 mois":6, "au besoin":8, "à préciser":9};
  var G = {};
  function ajouter(f, t){ t = t.replace(/\s+1x$/, "").replace(/^\s+|[\s.]+$/g, ""); if(!t) return; f = f.toLowerCase(); if(!G[f]) G[f] = []; G[f].push(t.charAt(0).toUpperCase() + t.slice(1) + "."); }
  (taches || []).forEach(function(brut){
    String(brut).replace(/(chaque \S+) et /g, "$1\u0001").split("\u0001").forEach(function(p){
      p = p.replace(/[\s.]+$/, "");
      var m = p.match(/^(.*?)\s*(chaque \S+|aux 2 semaines|aux 3 mois)$/i), d = p.match(/^chaque (\S+) (.+)$/i);
      if(m && m[1]) ajouter(m[2], m[1]);
      else if(d) ajouter("chaque " + d[1], d[2]);
      else if((m = p.match(/^(.*?)\s*le soir$/i)) && m[1]) ajouter("chaque soir", m[1]);
      else if((m = p.match(/^(.*?)\s*si nécessaire$/i)) && m[1]) ajouter("au besoin", m[1]);
      else ajouter("à préciser", p);
    });
  });
  return Object.keys(G).sort(function(a, b){ return (RANG[a] === undefined ? 8 : RANG[a]) - (RANG[b] === undefined ? 8 : RANG[b]); }).map(function(f){ return {f: f.charAt(0).toUpperCase() + f.slice(1), t: G[f]}; });
}
// Entretien machinerie : responsables et direction consultent et modifient; l'employé voit seulement ses machines (« Mes entretiens »).
function entretien(){
  if(!entretien.verifie){ entretien.verifie = true; var s0 = sessionGardee(); appelBrut({action:"moi", session:s0}).then(function(r){ entretien.verifie = false; if(r && r.ok && MOI && r.role !== MOI.role){ MOI = r; try { garderMoi(s0, r); } catch(e){} entretien(); } }).catch(function(){ entretien.verifie = false; }); }
  var tous = peutEcrire(), ecr = !!(MOI && (MOI.role === "direction" || /^gestionnaire/.test(String(MOI.poste || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()))), d = null, vue = "secteur", sel = "non", msg = "", mode = "liste", fiche = null, pick = false, supprime = false;
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+"Entretien machinerie"+'</h1><div id="en"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); if(tous && mode !== "liste"){ mode = "liste"; pick = false; dessiner(); } else if(tous) responsable(); else menu(); };
  function nomsLignes(t){ return String(t).split("\n").map(function(x){ return x.replace(/^\s*[▪•]\s*/, ""); }); }
  function nomHtml(t){ return nomsLignes(t).map(function(x, i, a){ return (a.length > 1 ? "▪ " : "") + esc(x); }).join("<br>"); }
  function secteurs(){ var s = []; d.machines.forEach(function(m){ if(s.indexOf(m.zone) < 0) s.push(m.zone); }); return s; }
  function machinesVue(){
    if(sel === "non") return d.machines.filter(function(m){ return !m.resp; });
    if(vue === "secteur") return d.machines.filter(function(m){ return m.zone === sel; });
    var e = d.employes.filter(function(x){ return String(x.id) === sel; })[0];
    return e ? d.machines.filter(function(m){ return m.resp === e.nom; }) : [];
  }
  function ecrire(corps){
    msg = "▪ ENREGISTREMENT…"; dessiner();
    corps.action = "entretien_ecrire"; corps.session = sessionGardee();
    return appelService(corps).then(function(r){ if(r && r.ok){ d = r; msg = ""; return true; } msg = "▪ " + String((r && r.erreur) || "ÉCHEC").toUpperCase(); return false; })
      .catch(function(){ msg = "▪ ÉCHEC · RÉESSAYEZ"; return false; }).then(function(ok){ dessiner(); return ok; });
  }
  function dessiner(){
    var el = document.getElementById("en"); if(!el) return;
    if(mode === "fiche" || mode === "edition") return dessinerFiche(el);
    var h = "";
    if(tous){
      h += '<div class="tgm"><button type="button" class="tgb'+(vue === "secteur" ? " on" : "")+'" data-v="secteur">Par secteur</button><button type="button" class="tgb'+(vue === "employe" ? " on" : "")+'" data-v="employe">Par employé</button>'+(ecr ? '<button type="button" class="tgb ajm" id="ena"><svg class="plus" viewBox="0 0 14 14" aria-hidden="true"><path d="M5.2 0h3.6v5.2H14v3.6H8.8V14H5.2V8.8H0V5.2h5.2z"/></svg> Machine</button>' : '')+'</div>';
      h += '<select class="champ selr" id="ens"><option value="non"'+(sel === "non" ? " selected" : "")+'>Machines non attribuées</option>' +
        (vue === "secteur" ? secteurs().map(function(z){ return '<option value="'+esc(z)+'"'+(sel === z ? " selected" : "")+'>'+esc(z)+'</option>'; }) : d.employes.map(function(e){ return '<option value="'+e.id+'"'+(sel === String(e.id) ? " selected" : "")+'>'+esc(e.nom)+'</option>'; })).join("") + '</select>';
    }
    var ms = tous ? machinesVue() : d.machines;
    if(!ms.length) h += '<div class="bandeau">▪ AUCUNE MACHINE</div>';
    if(ms.length) h += '<div class="etiq tcol'+(tous ? "" : " un")+'"><span>▪ Machine</span>'+(tous ? '<span>'+(sel === "non" ? "▪ Secteur" : (vue === "secteur" ? "▪ Responsable" : ""))+'</span><span></span>' : "")+'</div>';
    var zone = "";
    ms.forEach(function(m){
      if(!tous && m.zone !== zone || tous && vue === "employe" && sel !== "non" && m.zone !== zone){ zone = m.zone; h += '<div class="etiq" style="margin-top:14px">▪ '+esc(zone.toUpperCase())+'</div>'; }
      var fin = "";
      if(tous && ecr){
        if(supprime) fin = '<button type="button" class="ib" data-del="'+m.ligne+'" aria-label="Supprimer">✕</button>';
        else fin = '<span class="actw"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M1 3h6v6h-6zM0 11h8v10h-8zM13 3h6v6h-6zM12 11h8v10h-8z"/></svg><select class="act" data-act="'+m.ligne+'" aria-label="Responsable"><option value="">Responsable</option>'+(m.resp ? '<option value="retirer">Retirer</option><option value="transferer">Transférer</option>' : '<option value="attribuer">Attribuer</option>')+'</select></span>';
      }
      var col2 = tous ? (sel === "non" ? esc(m.zone) : (vue === "secteur" ? esc(m.resp) : "")) : "";
      h += '<div class="ligne lgm'+(tous ? "" : " un")+'"><a href="#" data-f="'+m.ligne+'" style="color:inherit;text-decoration:none">'+nomHtml(m.machine)+'</a>'+(tous ? '<span>'+col2+'</span><span>'+fin+'</span>' : "")+'</div>';
    });
    if(tous && pick){
      h += '<div class="etiq" style="margin-top:18px">▪ '+((d.machines.filter(function(m){ return m.ligne === pick; })[0] || {}).resp ? "TRANSFÉRER À" : "ATTRIBUER À")+'</div>' + d.employes.map(function(e){
        return '<a href="#" class="ligne" data-emp="'+e.id+'" style="color:inherit;text-decoration:none"><span style="flex:2">'+esc(e.nom)+'</span><span style="flex:1">'+e.nb+'</span><span style="flex:1">'+esc(e.niveau)+'</span></a>'; }).join("");
    }
    if(tous && sel !== "non" && vue === "employe") h += '';
    if(msg) h += '<div class="bandeau">'+esc(msg)+'</div>';
    el.innerHTML = h;
    Array.prototype.forEach.call(el.querySelectorAll("[data-v]"), function(b){ b.onclick = function(){ vue = b.getAttribute("data-v"); sel = "non"; if(!d.machines.some(function(m){ return !m.resp; })){ if(vue === "secteur") sel = secteurs()[0] || "non"; else { var e1 = (d.employes || []).filter(function(x){ return d.machines.some(function(m){ return m.resp === x.nom; }); })[0]; sel = e1 ? String(e1.id) : "non"; } } pick = false; supprime = false; dessiner(); }; });
    var s = document.getElementById("ens"); if(s) s.onchange = function(){ sel = this.value; pick = false; supprime = false; dessiner(); };
    Array.prototype.forEach.call(el.querySelectorAll("[data-f]"), function(a){ a.onclick = function(e){ e.preventDefault(); fiche = d.machines.filter(function(m){ return String(m.ligne) === a.getAttribute("data-f"); })[0]; mode = "fiche"; dessiner(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("select.act"), function(q){ q.onchange = function(){ var l = Number(q.getAttribute("data-act")), v = q.value; if(v === "retirer"){ confirmerOuiNon("Retirer cette attribution ?", function(){ ecrire({op:"attribuer", ligne:l, employe:""}); }, false); q.value = ""; } else if(v){ pick = l; dessiner(); } }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-moins]"), function(b){ b.onclick = function(){ ecrire({op:"attribuer", ligne:Number(b.getAttribute("data-moins")), employe:""}); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-att]"), function(b){ b.onclick = function(){ pick = Number(b.getAttribute("data-att")); dessiner(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-emp]"), function(a){ a.onclick = function(e){ e.preventDefault(); var l = pick; pick = false; ecrire({op:"attribuer", ligne:l, employe:Number(a.getAttribute("data-emp"))}); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-del]"), function(b){ b.onclick = function(){ confirmerOuiNon("Supprimer cette ligne ?", function(){ ecrire({op:"supprimer", ligne:Number(b.getAttribute("data-del"))}); }, false); }; });
    var a1 = document.getElementById("ena"); if(a1) a1.onclick = function(){ fiche = {ligne:0, zone:(vue === "secteur" && sel !== "non" ? sel : (secteurs()[0] || "")), machine:"", resp:"", taches:[]}; mode = "edition"; dessiner(); };
    
  }
  function dessinerFiche(el){
    var m = fiche, h, edition = (mode === "edition");
    function sig(){ return JSON.stringify([m.nomEd, m.respEd, (m.rows || []).filter(function(r){ return r.f || r.t.trim(); }).map(function(r){ return [r.f, r.t.trim()]; })]); }
    if(edition && !m.rows){
      m.rows = []; groupesFrequence(m.taches).forEach(function(g){ g.t.forEach(function(t){ m.rows.push({f: g.f === "À préciser" ? "" : g.f, t: t.replace(/\.$/, "")}); }); }); if(!m.rows.length) m.rows.push({f:"", t:""});
      var re = (d.employes || []).filter(function(x){ return x.nom === m.resp; })[0];
      m.nomEd = nomsLignes(m.machine).join("\n"); m.respEd = re ? String(re.id) : ""; m.sig0 = m.ligne ? sig() : "";
    }
    if(!edition){
      h = '<div class="etiq">▪ '+esc(m.zone.toUpperCase())+'</div><div class="ligne" style="display:block">'+nomHtml(m.machine)+'</div>' +
        (m.resp ? '<div class="etiq" style="margin-top:14px">▪ RESPONSABLE</div><div class="ligne">'+esc(m.resp)+'</div>' : "") +
        '<div class="etiq tfh"><span class="tff">▪ Fréquence</span><span class="tft">▪ Entretien à faire</span></div>' + groupesFrequence(m.taches).map(function(g){ return g.t.map(function(t, i){ return '<div class="ligne tfl"><span class="tff">'+(i ? "" : esc(g.f))+'</span><span class="tft">▪ '+esc(t)+'</span></div>'; }).join(""); }).join("");
    } else {
      h = '<div class="etiq">▪ '+esc(m.zone.toUpperCase())+'</div><span class="lbl">Machine</span><textarea class="champ'+(m.nomEd.trim() ? "" : " rose")+'" id="enn" rows="2" placeholder="Machine">'+esc(m.nomEd)+'</textarea>' +
        '<span class="lbl">Responsable</span><select class="champ'+(m.respEd ? "" : " rose")+'" id="enr"><option value="">Responsable</option>'+(d.employes || []).map(function(x){ return '<option value="'+x.id+'"'+(String(x.id) === m.respEd ? " selected" : "")+'>'+esc(x.nom)+'</option>'; }).join("")+'</select>' +
        '<div class="etiq tfh"><span class="tff">▪ Fréquence</span><span class="tft">▪ Entretien à faire</span></div>' + m.rows.map(function(r, i){
          return '<div class="tl"><select class="tf'+(r.f ? "" : " rose")+'" data-i="'+i+'"><option value="">Fréquence</option>'+FREQS.map(function(f){ return '<option value="'+f+'"'+(r.f === f ? " selected" : "")+'>'+f+'</option>'; }).join("")+'</select><input class="tt'+(r.t.trim() ? "" : " rose")+'" data-i="'+i+'" maxlength="200" placeholder="Entretien à faire" value="'+esc(r.t)+'"></div>'; }).join("") +
        '<div class="aeact"><button type="button" class="bouton lg" id="enp">Ajouter une tâche</button></div>';
    }
    if(msg) h += '<div class="bandeau">'+esc(msg)+'</div>';
    if(tous && ecr) h += '<div class="aeact tro"><button type="button" class="bouton lg" id="enm"'+(edition ? " disabled" : "")+'>Modifier</button>'+(m.ligne ? '<button type="button" class="bouton lg" id="ens3"'+(edition ? " disabled" : "")+'>Supprimer</button>' : "")+'<button type="button" class="bouton" id="enok" disabled>Enregistrer</button></div>';
    if(m.confirmeSup) h += '<div class="pop"><div class="popc"><div class="popt">Supprimer cette machine ?</div><div class="aeact"><button type="button" class="bouton" id="supoui">Oui, supprimer</button><button type="button" class="bouton lg" id="supnon">Non</button></div></div></div>';
    el.innerHTML = h;
    function pleines(){ return m.rows.filter(function(r){ return r.f || r.t.trim(); }); }
    function valide(){ var p = pleines(); return m.nomEd.trim() && m.respEd && p.length && p.every(function(r){ return r.f && r.t.trim(); }); }
    function majBoutons(){ var ok = document.getElementById("enok"); if(ok) ok.disabled = !(edition && valide() && (!m.ligne || sig() !== m.sig0)); }
    majBoutons();
    var n = document.getElementById("enn"); if(n) n.oninput = function(){ m.nomEd = n.value; n.classList.toggle("rose", !n.value.trim()); majBoutons(); };
    var r0 = document.getElementById("enr"); if(r0) r0.onchange = function(){ m.respEd = r0.value; r0.classList.toggle("rose", !r0.value); majBoutons(); };
    Array.prototype.forEach.call(el.querySelectorAll("select.tf"), function(q){ q.onchange = function(){ m.rows[Number(q.getAttribute("data-i"))].f = q.value; q.classList.toggle("rose", !q.value); majBoutons(); }; });
    Array.prototype.forEach.call(el.querySelectorAll("input.tt"), function(q){ q.oninput = function(){ m.rows[Number(q.getAttribute("data-i"))].t = q.value; q.classList.toggle("rose", !q.value.trim()); majBoutons(); }; });
        var pl = document.getElementById("enp"); if(pl) pl.onclick = function(){ m.rows.push({f:"", t:""}); dessiner(); };
    var b = document.getElementById("enm"); if(b) b.onclick = function(){ m.rows = null; mode = "edition"; dessiner(); };
    var sp = document.getElementById("ens3"); if(sp) sp.onclick = function(){ m.confirmeSup = true; dessiner(); };
    var sn = document.getElementById("supnon"); if(sn) sn.onclick = function(){ m.confirmeSup = false; dessiner(); };
    var so = document.getElementById("supoui"); if(so) so.onclick = function(){ m.confirmeSup = false; ecrire({op:"supprimer", ligne:m.ligne}).then(function(bon){ if(bon){ fiche = null; mode = "liste"; dessiner(); } }); };
    var ok = document.getElementById("enok"); if(ok) ok.onclick = function(){
      if(!valide()) return;
      var corps = m.ligne ? {op:"modifier", ligne:m.ligne} : {op:"ajouter", zone:m.zone};
      corps.machine = m.nomEd;
      corps.taches = pleines().map(function(r){ var t = r.t.trim().replace(/[\s.]+$/, ""); return r.f === "Au besoin" ? t + " si nécessaire." : t + " " + r.f.toLowerCase() + "."; }).join("\n");
      ecrire(corps).then(function(bon){
        if(!bon) return;
        var nl = m.ligne || (d.machines.filter(function(x){ return x.zone === m.zone && nomsLignes(x.machine).join("\n") === m.nomEd; })[0] || {}).ligne;
        var changeResp = m.respEd && nl && (d.employes.filter(function(x){ return String(x.id) === m.respEd; })[0] || {}).nom !== (m.ligne ? m.resp : "");
        var fin = function(){ m.rows = null; mode = "liste"; dessiner(); };
        if(changeResp) ecrire({op:"attribuer", ligne:nl, employe:Number(m.respEd)}).then(fin); else fin();
      });
    };
  }
  appelService({action:"entretien_lire", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw new Error((r && r.erreur) || "réponse vide"); d = r;
    if(tous){ var s = secteurs(); if(!d.machines.some(function(m){ return !m.resp; })) sel = s[0] || "non"; }
    dessiner();
  }).catch(function(e){ var el = document.getElementById("en"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>' + (tous && e && e.message ? '<div class="etiq" style="margin-top:10px">'+esc(String(e.message).slice(0,160))+'</div>' : ""); });
}
// Nouveau message / Nouvelle réunion (agendas Google de la personne connectée) et Mes événements.
var JOURS_C = ["L","M","M","J","V","S","D"];
function lundiDe(d){ var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay()+6)%7)); return x; }
function isoJour(d){ return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); }
function heureTxt(h, m){ return h+" h"+(m ? " "+("0"+m).slice(-2) : ""); }
// ---- Composants communs: participants (groupes et employés) et agenda · calendrier · date · heure ----
var DH_CACHE = {agendas: (function(){ try { var a = JSON.parse(localStorage.getItem("ldld-c-agendas") || "null"); return Array.isArray(a) && a.length ? a : null; } catch(e){ return null; } })(), agendasFrais: false, conges: null};
var JOURS_ABR = ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."];
function nomTitre(n){ n = String(n || ""); return n === n.toUpperCase() ? n.toLowerCase().replace(/(^|[\s\-'’])([a-zàâäçéèêëîïôöùûüÿœ])/g, function(m, a, b){ return a+b.toUpperCase(); }) : n; }
function jourTxt(d){ var j = JOURS_ABR[d.getDay()]; return j.charAt(0).toUpperCase()+j.slice(1)+" "+d.getDate()+" "+MOIS_LONGS[d.getMonth()]; }
function pad2(n){ return ("0"+n).slice(-2); }
function boutonBas(texte, actif, action){
  var b = document.getElementById("btnbas");
  if(!b){ b = document.createElement("button"); b.type = "button"; b.id = "btnbas"; b.className = "bouton btnbas"; document.body.appendChild(b); }
  b.textContent = texte; b.disabled = !actif; b.onclick = action;
}
function retirerBoutonBas(){ var b = document.getElementById("btnbas"); if(b) b.remove(); }
// Participants: liste « Groupes » et liste « Employés » (choix multiples). Les membres d'un groupe choisi sont en gris pâle dans la liste Employés.
function participants(personnes, groupes, surChangement, init){
  var S = {grp: (init && init.grp) || [], emp: (init && init.emp) || [], ouvert: "", err: false, zone: null};
  var pers = personnes.map(function(p){ return {c: p.c, nom: nomTitre(p.nom)}; });
  function membresChoisis(){ var m = {}; groupes.forEach(function(g){ if(S.grp.indexOf(g.nom) >= 0) g.membres.forEach(function(c){ m[c] = (m[c] || []).concat(g.nom); }); }); return m; }
  function tous(){ var m = membresChoisis(), r = Object.keys(m); S.emp.forEach(function(c){ if(r.indexOf(c) < 0) r.push(c); }); return r; }
  function nomDe(c){ var p = pers.filter(function(x){ return x.c === c; })[0]; return p ? p.nom : c; }
  function noms(){ return S.grp.concat(S.emp.map(nomDe)); }
  function chips(liste, type){ return liste.map(function(x){ return '<span class="chip">'+esc(type === "g" ? x : nomDe(x))+' <span data-r="'+type+'" data-v="'+esc(x)+'" style="cursor:pointer">✕</span></span>'; }).join(""); }
  function rendre(){
    var z = S.zone; if(!z) return;
    var vide = tous().length === 0, via = membresChoisis(), h = "";
    var cl = function(o){ return "ms"+(vide ? " rose" : "")+(S.err && vide ? " err" : ""); };
    if(groupes.length){
      h += '<span class="lbl">Groupes · obligatoire</span><div class="'+cl()+'" id="pg"><div>'+(S.grp.length ? chips(S.grp, "g") : '<span class="vide">Choisir un ou plusieurs groupes</span>')+'</div><span style="padding:2px 4px">'+(S.ouvert === "g" ? "▴" : "▾")+'</span></div>';
      if(S.ouvert === "g") h += '<div class="msl">'+groupes.map(function(g){ var on = S.grp.indexOf(g.nom) >= 0; return '<div data-g="'+esc(g.nom)+'"><span class="cb'+(on ? " on" : "")+'">'+(on ? "✓" : "")+'</span>'+esc(g.nom)+'</div>'; }).join("")+'</div>';
    }
    h += '<span class="lbl">Employés · obligatoire</span><div class="'+cl()+'" id="pe"><div>'+(S.emp.length ? chips(S.emp, "e") : '<span class="vide">'+(vide ? "Choisir un ou plusieurs employés" : "Aucun employé en plus")+'</span>')+'</div><span style="padding:2px 4px">'+(S.ouvert === "e" ? "▴" : "▾")+'</span></div>';
    if(S.ouvert === "e"){
      var toutes = pers.length && pers.every(function(p){ return S.emp.indexOf(p.c) >= 0 || via[p.c]; });
      h += '<div class="msl"><div data-tous="1"><span class="cb'+(toutes ? " on" : "")+'">'+(toutes ? "✓" : "")+'</span>Toute mon équipe ('+pers.length+')</div>' + pers.map(function(p){
        if(via[p.c]) return '<div class="via"><span class="cb on">✓</span>'+esc(p.nom)+'<small>via '+esc(via[p.c].join(", "))+'</small></div>';
        var on = S.emp.indexOf(p.c) >= 0; return '<div data-e="'+esc(p.c)+'"><span class="cb'+(on ? " on" : "")+'">'+(on ? "✓" : "")+'</span>'+esc(p.nom)+'</div>'; }).join("")+'</div>';
    }
    var n = tous().length;
    if(n) h += '<div class="resume">'+n+' participant'+(n > 1 ? "s" : "")+' · '+esc(noms().slice(0, 3).join(", ")+(noms().length > 3 ? "…" : ""))+'</div>';
    z.innerHTML = h;
    var pg = document.getElementById("pg"); if(pg) pg.onclick = function(){ S.ouvert = S.ouvert === "g" ? "" : "g"; rendre(); };
    document.getElementById("pe").onclick = function(){ S.ouvert = S.ouvert === "e" ? "" : "e"; rendre(); };
    Array.prototype.forEach.call(z.querySelectorAll("[data-r]"), function(x){ x.onclick = function(ev){ ev.stopPropagation();
      var t = x.getAttribute("data-r"), v = x.getAttribute("data-v"), a = t === "g" ? S.grp : S.emp; a.splice(a.indexOf(v), 1); changer(); }; });
    Array.prototype.forEach.call(z.querySelectorAll("[data-g]"), function(x){ x.onclick = function(){ var v = x.getAttribute("data-g"), i = S.grp.indexOf(v); if(i < 0) S.grp.push(v); else S.grp.splice(i, 1); changer(); }; });
    Array.prototype.forEach.call(z.querySelectorAll("[data-e]"), function(x){ x.onclick = function(){ var v = x.getAttribute("data-e"), i = S.emp.indexOf(v); if(i < 0) S.emp.push(v); else S.emp.splice(i, 1); changer(); }; });
    var tt = z.querySelector("[data-tous]"); if(tt) tt.onclick = function(){ var m = membresChoisis(); var toutes = pers.every(function(p){ return S.emp.indexOf(p.c) >= 0 || m[p.c]; });
      S.emp = toutes ? [] : pers.filter(function(p){ return !m[p.c]; }).map(function(p){ return p.c; }); changer(); };
  }
  function changer(){ S.err = false; rendre(); if(surChangement) surChangement(); }
  return {
    monter: function(zone){ S.zone = zone; rendre(); },
    courriels: tous, noms: noms,
    valider: function(){ if(tous().length) return true; S.err = true; rendre(); return false; }
  };
}
// Agenda · calendrier de la semaine · détail du jour · Date | Heure (listes), identiques partout où l'on retrouve le calendrier.
// opts.agenda === false: pas de choix d'agenda (agenda principal). Le calendrier suit la date, et la date suit le calendrier.
function dateHeure(opts, surChangement){
  opts = opts || {};
  var auj = new Date(); auj.setHours(0, 0, 0, 0);
  var S = {lundi: lundiDe(auj), jour: "", heure: "", agenda: "primary", sel: null, agOuvert: false, jj: [], jm: [], vue: (function(){ try { return localStorage.getItem("ldld-cal-vue") === "mois" ? "mois" : "semaine"; } catch(e){ return "semaine"; } })(), mois: new Date(auj.getFullYear(), auj.getMonth(), 1), evm: [],  evs: [], err: false, zone: null, confirme: false, ed: null, jetonSem: 0};
  if(opts.init && opts.init.jour){ var pi = opts.init.jour.split("-"); S.jour = opts.init.jour; S.heure = opts.init.heure || ""; S.lundi = lundiDe(new Date(+pi[0], +pi[1]-1, +pi[2])); }
  if(opts.agenda !== false && !S.jour){ S.jour = isoJour(auj); }
  function isoDe(d){ return isoJour(d); }
  function depuis(iso){ var p = iso.split("-"); return new Date(+p[0], +p[1]-1, +p[2]); }
  var CPAL = [["charles","#1D1D1B","#fff"],["direction","#8D806A","#fff"],["famille","#5C5446","#fff"],["ldld","#8EFF60","#1D1D1B"],["prise","#BDC9B2","#1D1D1B"]], CRES = [["#B4AB9B","#1D1D1B"],["#CFC6B5","#1D1D1B"],["#C9F5B5","#1D1D1B"],["#3F3A30","#fff"]];
  function nomAg(a){ return a.principal ? "Mon agenda" : a.nom; }
  function idAg(a){ return a.principal ? "primary" : a.id; }
  function couleurAg(id){ var L = DH_CACHE.agendas || [], i = 0, a = null; for(; i < L.length; i++){ if(idAg(L[i]) === id || (id === "primary" && L[i].principal)){ a = L[i]; break; } }
    if(a && /^#[0-9a-fA-F]{6}$/.test(a.couleur || "")){ var hx = a.couleur, lum = (parseInt(hx.substr(1,2),16)*299 + parseInt(hx.substr(3,2),16)*587 + parseInt(hx.substr(5,2),16)*114)/1000; return {f: hx, t: lum > 150 ? "#1D1D1B" : "#fff"}; }
    var n = a ? (a.principal ? "charles" : String(nomAg(a)).toLowerCase()) : (id === "primary" ? "charles" : ""), k; for(k = 0; k < CPAL.length; k++){ if(n.indexOf(CPAL[k][0]) >= 0) return {f: CPAL[k][1], t: CPAL[k][2]}; }
    var r = CRES[(a ? i : String(id).length) % CRES.length]; return {f: r[0], t: r[1]}; }
  function selAgendas(){
    if(opts.agenda === false) return [S.agenda];
    if(!S.sel){ var m = []; try { m = JSON.parse(localStorage.getItem("ldld-agendas") || "[]"); } catch(e){}
      S.sel = Array.isArray(m) && m.length ? m : [S.agenda]; S.selAuto = !(Array.isArray(m) && m.length); }
    var L = DH_CACHE.agendas || []; if(L.length && S.selAuto && S.sel.length <= 1){ S.sel = L.slice(0, 8).map(idAg); S.selAuto = false; }
    if(L.length){ var ok = S.sel.filter(function(id){ return L.some(function(a){ return idAg(a) === id; }); }); S.sel = ok.length ? ok : [idAg(L[0])]; }
    S.agenda = S.sel[0]; return S.sel;
  }
  function placerBlocs(){
    if(opts.agenda === false || !S.zone) return;
    var gs = S.zone.querySelector(".gs"); if(!gs) return;
    gs.style.position = "relative";
    Array.prototype.forEach.call(gs.querySelectorAll(".blc"), function(b){ b.parentNode.removeChild(b); });
    var h7 = null, hs = gs.querySelectorAll(".h"); for(var q = 0; q < hs.length; q++){ if(!hs[q].getAttribute("style")){ h7 = hs[q]; break; } }
    var ent = gs.querySelectorAll(".d"); if(!h7 || ent.length < 8) return;
    var y0 = h7.offsetTop, rh = h7.offsetHeight || 24;
    for(var k = 0; k < 7; k++){
      var dj = new Date(S.lundi); dj.setDate(dj.getDate()+k); var iso = isoJour(dj);
      var L = S.evs.filter(function(e){ return isoJour(new Date(e.debut)) === iso; }).map(function(e){ var a = new Date(e.debut), f = new Date(e.fin); return {e: e, a: a.getHours()+a.getMinutes()/60, f: Math.max(a.getHours()+a.getMinutes()/60+0.5, f.getHours()+f.getMinutes()/60 || a.getHours()+1)}; }).sort(function(p, r){ return p.a - r.a; });
      var cl = [], cur = null;
      L.forEach(function(x){ if(!cur || x.a >= cur.fin){ cur = {fin: x.f, lanes: [], evs: []}; cl.push(cur); } var n = 0; while(cur.lanes[n] !== undefined && cur.lanes[n] > x.a) n++; cur.lanes[n] = x.f; x.lane = n; x.cl = cur; cur.evs.push(x); cur.fin = Math.max(cur.fin, x.f); });
      var col = ent[k+1];
      L.forEach(function(x){
        var a0 = Math.max(7, x.a), f0 = Math.min(19, x.f); if(f0 <= a0) return;
        var c = couleurEv(x.e), d = document.createElement("div"); d.className = "blc";
        var nl = x.cl.lanes.length, w = col.offsetWidth/nl;
        d.style.cssText = "display:block;height:auto;position:absolute;pointer-events:none;box-sizing:border-box;overflow:hidden;z-index:2;border:1px solid #cecdc5;padding:1px 2px;font-size:8px;line-height:10px;letter-spacing:0;text-transform:none;text-align:left;overflow-wrap:anywhere;left:"+(col.offsetLeft+w*x.lane)+"px;width:"+w+"px;top:"+(y0+(a0-7)*rh)+"px;height:"+((f0-a0)*rh)+"px;background:"+c.f+";color:"+c.t;
        d.innerHTML = '<div style="font-weight:600">'+esc(x.e.titre || "(Sans titre)")+'</div><div>'+heureTxt(new Date(x.e.debut).getHours(), new Date(x.e.debut).getMinutes())+'</div>';
        gs.appendChild(d);
      });
    }
  }
  function legende(){ return '<div class="glg"><span><i style="background:#B5B0A2"></i>Congé / fermé</span></div>'; }
  function lierVue(){
    var v1 = document.getElementById("dhv1"), v2 = document.getElementById("dhv2");
    function vue(x){ S.vue = x; try { localStorage.setItem("ldld-cal-vue", x); } catch(e){} rendre(); charger(); }
    if(v1) v1.onclick = function(){ vue("semaine"); }; if(v2) v2.onclick = function(){ vue("mois"); };
  }
  function lierAg(){
    var agb = document.getElementById("dhagb"); if(agb) agb.onclick = function(){ S.agOuvert = !S.agOuvert; if(S.agOuvert && !(DH_CACHE.agendas || []).length){ DH_CACHE.agendas = null; chargerCaches(function(){ rendre(); }); } rendre(); };
    var agt = document.getElementById("dhagt"); if(agt) agt.onclick = function(){ S.agOuvert = false; rendre(); charger(); };
    Array.prototype.forEach.call(S.zone.querySelectorAll(".dhagl"), function(l){ l.onclick = function(){ var id = l.getAttribute("data-i"), cur = selAgendas().slice(), p = cur.indexOf(id);
      if(p >= 0){ if(cur.length > 1) cur.splice(p, 1); } else cur.push(id); S.sel = cur; S.agenda = cur[0]; try { localStorage.setItem("ldld-agendas", JSON.stringify(cur)); } catch(e){} rendre(); }; });
  }
  function sansDoublon(liste, cle){
    var ordre = selAgendas(), pri = function(e){ return e.ag === "primary" ? -1 : ordre.indexOf(e.ag); };
    var tri = liste.slice().sort(function(a, b){ return pri(a) - pri(b); }), vu = {};
    return tri.filter(function(e){ var k = cle(e); if(vu[k]) return false; vu[k] = 1; return true; });
  }
  function jjDe(liste, iso){ return liste.filter(function(e){ return e.d1 <= iso && iso < e.d2; }); }
  function jjNorm(r, id){ return ((r && r.journee) || []).map(function(e){ return {ag: id, id: e.id, titre: e.titre, d1: e.debut, d2: e.fin || e.debut, couleur: e.couleur || "", couleurTexte: e.couleurTexte || ""}; }); }
  function couleurEv(e){ if(e && /^#[0-9a-fA-F]{6}$/.test(e.couleur || "")){ var hx = e.couleur, lum = (parseInt(hx.substr(1,2),16)*299 + parseInt(hx.substr(3,2),16)*587 + parseInt(hx.substr(5,2),16)*114)/1000; return {f: hx, t: lum > 150 ? "#1D1D1B" : "#fff"}; } return couleurAg(e && e.ag); }
  function chargerMois(){
    var ids = selAgendas(), d1 = new Date(S.mois), dim0 = new Date(d1.getFullYear(), d1.getMonth(), 1 - d1.getDay()), l0 = isoJour(lundiDe(dim0));
    if(!ids.length || ids.length > 12) return chargerMoisOld();
    appelService({action:"agenda_semaines", session:sessionGardee(), agendas:ids, debut:l0, nb:7}).then(function(r){
      if(!(r && r.ok && r.semaines)) return chargerMoisOld();
      var tous = [], jjm = [], err = "", vu = {}, vj = {};
      r.semaines.forEach(function(w){ if(w.erreur){ err = String(w.erreur); return; } var id = w.agenda; (w.evenements || []).forEach(function(e){ e.ag = id; var k = e.ag+"|"+e.id+"|"+e.debut; if(!vu[k]){ vu[k] = 1; tous.push(e); } }); var jn = jjNorm(w, id); jn.forEach(function(e){ var k = e.ag+"|"+e.id+"|"+e.d1; if(!vj[k]){ vj[k] = 1; jjm.push(e); } }); try { localStorage.setItem("ldld-cs-"+id+"-"+w.debut, JSON.stringify(w.evenements || [])); localStorage.setItem("ldld-cj-"+id+"-"+w.debut, JSON.stringify(jn)); } catch(e){} });
      S.evm = sansDoublon(tous, function(e){ return e.titre+"|"+e.debut+"|"+e.fin; }); S.jm = sansDoublon(jjm, function(e){ return e.titre+"|"+e.d1+"|"+e.d2; }); S.erreurSem = err; rendre();
    }).catch(function(){ chargerMoisOld(); });
  }
  function chargerMoisOld(){
    var ids = selAgendas(), d1 = new Date(S.mois), nb = 7, reste = ids.length * nb, tous = [], jjm = [], err = "", dim0 = new Date(d1.getFullYear(), d1.getMonth(), 1 - d1.getDay()), l0 = lundiDe(dim0);
    var cE = [], cJ = [];
    ids.forEach(function(id){ for(var w2 = 0; w2 < nb; w2++){ var l2 = new Date(l0); l2.setDate(l2.getDate()+7*w2), k2 = isoJour(l2);
      try { var a1 = JSON.parse(localStorage.getItem("ldld-cs-"+id+"-"+k2) || "null"); if(a1) a1.forEach(function(e){ e.ag = id; cE.push(e); }); var a2 = JSON.parse(localStorage.getItem("ldld-cj-"+id+"-"+k2) || "null"); if(a2) a2.forEach(function(e){ cJ.push(e); }); } catch(e){} } });
    if(cE.length || cJ.length){ S.evm = sansDoublon(cE, function(e){ return e.titre+"|"+e.debut+"|"+e.fin; }); S.jm = sansDoublon(cJ, function(e){ return e.titre+"|"+e.d1+"|"+e.d2; }); rendre(); }
    ids.forEach(function(id){ for(var w = 0; w < nb; w++){ let ldd = new Date(l0); ldd.setDate(ldd.getDate()+7*w); let kw = isoJour(ldd);
      appelService({action:"agenda_semaine", session:sessionGardee(), debut:kw, agenda:id}).then(function(r){ if(r && r.ok){ (r.evenements || []).forEach(function(e){ e.ag = id; tous.push(e); }); var jn2 = jjNorm(r, id); jjm = jjm.concat(jn2); try { localStorage.setItem("ldld-cs-"+id+"-"+kw, JSON.stringify(r.evenements || [])); localStorage.setItem("ldld-cj-"+id+"-"+kw, JSON.stringify(jn2)); } catch(e){} } else err = String((r && r.erreur) || "Agenda indisponible"); }).catch(function(){ err = "Réseau indisponible"; }).then(function(){ if(--reste === 0){ var vu = {}; S.evm = sansDoublon(tous.filter(function(e){ var k = e.ag+"|"+e.id+"|"+e.debut; if(vu[k]) return false; vu[k] = 1; return true; }), function(e){ return e.titre+"|"+e.debut+"|"+e.fin; }); var vj = {}; S.jm = sansDoublon(jjm.filter(function(e){ var k = e.ag+"|"+e.id+"|"+e.d1; if(vj[k]) return false; vj[k] = 1; return true; }), function(e){ return e.titre+"|"+e.d1+"|"+e.d2; }); S.erreurSem = err; rendre(); } }); } });
  }
  function charger(){
    if(opts.mois && S.vue === "mois") return chargerMois();
    var ids = selAgendas(), deb = isoJour(S.lundi), vus = [], vusJ = [], trouve = false;
    ids.forEach(function(id){ try { var c = JSON.parse(localStorage.getItem("ldld-cs-"+id+"-"+deb) || "null"); if(c){ trouve = true; c.forEach(function(e){ e.ag = id; vus.push(e); }); } var cj = JSON.parse(localStorage.getItem("ldld-cj-"+id+"-"+deb) || "null"); if(cj){ trouve = true; cj.forEach(function(e){ vusJ.push(e); }); } } catch(e){} });
    S.evs = sansDoublon(vus, function(e){ return e.titre+"|"+e.debut+"|"+e.fin; }); S.jj = sansDoublon(vusJ, function(e){ return e.titre+"|"+e.d1+"|"+e.d2; }); rendre();
    var jeton = ++S.jetonSem;
    function finSem(){
      var d2 = isoJour(S.lundi), t2 = [], j2 = [];
      ids.forEach(function(id){ try { var c = JSON.parse(localStorage.getItem("ldld-cs-"+id+"-"+d2) || "null"); if(c) c.forEach(function(e){ e.ag = id; t2.push(e); }); var cj = JSON.parse(localStorage.getItem("ldld-cj-"+id+"-"+d2) || "null"); if(cj) cj.forEach(function(e){ j2.push(e); }); } catch(e){} });
      S.evs = sansDoublon(t2, function(e){ return e.titre+"|"+e.debut+"|"+e.fin; }); S.jj = sansDoublon(j2, function(e){ return e.titre+"|"+e.d1+"|"+e.d2; }); rendre();
    }
    function ancien(){
      var reste = ids.length, tous = [], jjw = [], err = "";
      ids.forEach(function(id){
        appelService({action:"agenda_semaine", session:sessionGardee(), debut:deb, agenda:id}).then(function(r){ if(r && r.ok){ (r.evenements || []).forEach(function(e){ e.ag = id; tous.push(e); }); var jn = jjNorm(r, id); jjw = jjw.concat(jn); try { localStorage.setItem("ldld-cs-"+id+"-"+deb, JSON.stringify(r.evenements || [])); localStorage.setItem("ldld-cj-"+id+"-"+deb, JSON.stringify(jn)); } catch(e){} } else err = String((r && r.erreur) || "Agenda indisponible"); }).catch(function(){ err = "Réseau indisponible"; }).then(function(){ if(--reste === 0 && jeton === S.jetonSem){ S.evs = sansDoublon(tous, function(e){ return e.titre+"|"+e.debut+"|"+e.fin; }); S.jj = sansDoublon(jjw, function(e){ return e.titre+"|"+e.d1+"|"+e.d2; }); S.erreurSem = err; rendre(); } });
      });
    }
    if(!ids.length || ids.length > 12) return ancien();
    // Une seule demande pour la semaine affichée et ses deux voisines: les flèches Précédente/Suivante répondent alors tout de suite depuis l'appareil.
    var l1 = new Date(S.lundi); l1.setDate(l1.getDate()-7);
    appelService({action:"agenda_semaines", session:sessionGardee(), agendas:ids, debut:isoJour(l1), nb:3}).then(function(r){
      if(!(r && r.ok && r.semaines)) return ancien();
      var err = "";
      r.semaines.forEach(function(w){ if(w.erreur){ err = String(w.erreur); return; } try { localStorage.setItem("ldld-cs-"+w.agenda+"-"+w.debut, JSON.stringify(w.evenements || [])); localStorage.setItem("ldld-cj-"+w.agenda+"-"+w.debut, JSON.stringify(jjNorm(w, w.agenda))); } catch(e){} });
      S.erreurSem = err; if(jeton === S.jetonSem) finSem();
    }).catch(function(){ ancien(); });
  }
  function conge(iso){ return DH_CACHE.conges && DH_CACHE.conges[iso]; }
  function optJours(sel){ var r = "", dd2 = new Date(auj), tr = false;
    for(var i2 = 0; i2 < 56; i2++){ var iso2 = isoJour(dd2); if(iso2 === sel) tr = true; r += '<option value="'+iso2+'"'+(iso2 === sel ? " selected" : "")+'>'+(i2 === 0 ? "Aujourd'hui \u00b7 " : i2 === 1 ? "Demain \u00b7 " : "")+jourTxt(dd2)+'</option>'; dd2.setDate(dd2.getDate()+1); }
    if(sel && !tr) r += '<option value="'+sel+'" selected>'+jourTxt(depuis(sel))+'</option>'; return r; }
  // Heures libres d'un jour pour une durée (minutes), sans compter l'événement ignoré; retourne {html, masquees}.
  function optHeures(jour, sel, minutes, ignorer){ var r = "", masq = 0, jd2 = jour ? depuis(jour) : null;
    for(var h2 = 7; h2 <= 18; h2++) [0,15,30,45].forEach(function(m){
      var conf = false; if(jd2){ var a1 = new Date(jd2.getFullYear(), jd2.getMonth(), jd2.getDate(), h2, m), a2 = new Date(a1.getTime()+minutes*60000);
        conf = S.evs.some(function(e){ return e.id !== ignorer && new Date(e.debut) < a2 && new Date(e.fin) > a1; }); }
      var v = h2+":"+m; if(conf && v !== sel){ masq++; return; } r += '<option value="'+v+'"'+(v === sel ? " selected" : "")+'>'+heureTxt(h2, m)+(conf ? " · occupé" : "")+'</option>'; });
    return {html: r, masquees: masq}; }
  function panneau(e){
    var ed = S.ed, dur = Math.max(15, Math.round((new Date(e.fin) - new Date(e.debut))/60000)), hs = optHeures(ed.jour, ed.heure, dur, e.id);
    var ps = ed.choix ? '<div class="etq" style="margin-top:10px">ENREGISTRER POUR</div><div class="aeact" style="margin:6px 0 0"><button type="button" class="bouton" id="ep1" style="margin:0">Cette date seulement</button><button type="button" class="bouton" id="ep2" style="margin:0">Cette date et toutes les suivantes</button></div>' : ed.confirm ? '<div style="margin:8px 0"><div style="font-size:13px;margin-bottom:6px">Supprimer cet \u00e9v\u00e9nement ?</div><div class="aeact" style="margin:0"><button type="button" class="bouton" id="edn" style="margin:0">Non</button><button type="button" class="bouton" id="edo" style="margin:0;background:#a32d2d;color:#fff">Oui</button></div></div>'
      : '<div class="aeact" style="margin:8px 0 0"><button type="button" class="bouton" id="eds" style="margin:0">Enregistrer</button><button type="button" class="bouton" id="edx" style="margin:0;background:transparent;color:var(--tx);border:1.5px solid var(--tx)">Supprimer</button><button type="button" class="bouton" id="edf" style="margin:0;background:transparent;color:var(--tx);border:1.5px solid var(--tx)">Fermer</button></div>';
    return '<div style="border:1.5px solid var(--tx);padding:10px;margin:4px 0 10px"><div style="display:flex;gap:8px"><div style="flex:1"><span class="lbl">Date</span><select class="bx" id="edd">'+optJours(ed.jour)+'</select></div><div style="flex:1"><span class="lbl">Heure</span><select class="bx" id="edh">'+hs.html+'</select></div></div>'+ps+(ed.msg ? '<div class="bandeau">'+esc(ed.msg)+'</div>' : '')+'</div>';
  }
  function rendre(){
    var z = S.zone; if(!z) return;
    var fin = new Date(S.lundi); fin.setDate(fin.getDate()+6), aujIso = isoJour(auj), h = "";
    if(opts.agenda !== false){
      var Ls = DH_CACHE.agendas || [], sl = selAgendas(), noms = Ls.filter(function(a){ return sl.indexOf(idAg(a)) >= 0; }).map(nomAg);
      h += '<button type="button" class="bx" id="dhagb" style="text-align:left;width:100%;border:2px solid #0d1117;display:flex;justify-content:space-between;margin-top:8px"><span>Agendas affichés ('+(noms.length || 1)+')</span><span>'+(S.agOuvert ? "⌃" : "⌄")+'</span></button>';
      if(S.agOuvert){
        h += '<div style="background:#E3DFD3;border:2px solid #0d1117;margin-top:4px">'+(Ls.length ? "" : '<div style="padding:12px;font-size:13px">▪ AGENDAS INDISPONIBLES · RÉESSAYEZ</div>')+Ls.map(function(a){ var id = idAg(a), on = sl.indexOf(id) >= 0, c = couleurAg(id);
          return '<div class="dhagl" data-i="'+esc(id)+'" style="display:flex;align-items:center;gap:10px;height:44px;padding:0 12px;cursor:pointer"><span style="width:18px;height:18px;border:2px solid #0d1117;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-size:12px;'+(on ? "background:#0d1117;color:#E3DFD3" : "")+'">'+(on ? "✓" : "")+'</span><i style="width:12px;height:12px;border-radius:0;background:'+c.f+'"></i><span>'+esc(nomAg(a))+'</span></div>'; }).join("")+'<button type="button" class="bouton" id="dhagt" style="margin:8px;width:calc(100% - 16px);height:44px;padding:0">Terminé</button></div>';
      }
    }
    if(opts.mois){
      var vm = S.vue === "mois", st = "margin:10px 0 0;flex:1;height:44px;padding:0";
      h += '<div class="aeact" style="margin:10px 0 0"><button type="button" class="bouton" id="dhv1" style="'+st+(vm ? ";opacity:.5" : "")+'">Semaine</button><button type="button" class="bouton" id="dhv2" style="'+st+(vm ? "" : ";opacity:.5")+'">Mois</button></div>';
    }
    if(opts.mois && S.vue === "mois"){
      var m1 = new Date(S.mois), ml = new Date(m1.getFullYear(), m1.getMonth(), 1 - m1.getDay()), jm = "";
      if(S.erreurSem) h += '<div class="bandeau">▪ '+esc(S.erreurSem.toUpperCase())+'</div>';
      h += '<div class="moisbar" style="margin-top:10px"><button type="button" id="dmp">Précédent</button><b>'+MOIS_LONGS[m1.getMonth()].toUpperCase()+' '+m1.getFullYear()+'</b><button type="button" id="dms">Suivant</button></div>';
      jm = '<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border:1px solid #1D1D1B;border-bottom:0;margin-top:6px">'+["D","L","M","M","J","V","S"].map(function(j){ return '<div style="background:#B4AB9B;font-size:11px;text-align:center;padding:4px 0">'+j+'</div>'; }).join("");
      var nbL = Math.ceil((m1.getDay() + new Date(m1.getFullYear(), m1.getMonth()+1, 0).getDate())/7); for(var wk = 0; wk < nbL; wk++) for(var dk = 0; dk < 7; dk++){ var dd = new Date(ml); dd.setDate(dd.getDate()+wk*7+dk); var iso = isoJour(dd), hors = dd.getMonth() !== m1.getMonth();
        var evj = S.evm.filter(function(e){ return isoJour(new Date(e.debut)) === iso; });
        var jjv = jjDe(S.jm, iso); evj.sort(function(a, b){ return new Date(a.debut) - new Date(b.debut); });
        jm += '<div data-jm="'+iso+'" style="'+(conge(iso) ? "background:#B5B0A2;" : "")+'min-height:104px;border-right:1px solid #B4AB9B;border-bottom:1px solid #B4AB9B;padding:2px 1px;box-sizing:border-box;font-size:11px;cursor:pointer;'+(hors ? "opacity:.4;" : "")+'"><span style="'+(iso === aujIso ? "background:#1D1D1B;color:#fff;padding:0 4px" : "")+'">'+dd.getDate()+'</span>'+jjv.concat(evj).slice(0, 4).map(function(e){ var c = couleurEv(e); return '<div style="background:'+c.f+';color:'+c.t+';font-size:10px;line-height:14px;padding:0 3px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:clip">'+esc(e.titre)+'</div>'; }).join("")+(jjv.length+evj.length > 4 ? '<div style="font-size:10px">+'+(jjv.length+evj.length-4)+'</div>' : "")+'</div>'; }
      h += jm+'</div>';
      h += legende();
      z.innerHTML = h; lierAg(); lierVue();
      var mp = document.getElementById("dmp"), ms2 = document.getElementById("dms");
      if(mp) mp.onclick = function(){ S.mois = new Date(S.mois.getFullYear(), S.mois.getMonth()-1, 1); S.evm = []; rendre(); charger(); };
      if(ms2) ms2.onclick = function(){ S.mois = new Date(S.mois.getFullYear(), S.mois.getMonth()+1, 1); S.evm = []; rendre(); charger(); };
      Array.prototype.forEach.call(z.querySelectorAll("[data-jm]"), function(c){ c.onclick = function(){ var p = c.getAttribute("data-jm").split("-"); S.lundi = lundiDe(new Date(+p[0], +p[1]-1, +p[2])); S.jour = c.getAttribute("data-jm"); S.heure = ""; S.vue = "semaine"; try { localStorage.setItem("ldld-cal-vue", "semaine"); } catch(e){} S.evs = []; rendre(); charger(); }; });
      return;
    }
    if(S.erreurSem) h += '<div class="bandeau">▪ '+esc(S.erreurSem.toUpperCase())+'</div>';
    h += '<span class="lbl">Calendrier · semaine du '+S.lundi.getDate()+" "+MOIS_LONGS[S.lundi.getMonth()]+'</span><div class="moisbar" style="margin-top:0"><button type="button" id="dhp" aria-label="Semaine précédente">Précédente</button><b>'+S.lundi.getDate()+" "+MOIS[S.lundi.getMonth()]+" — "+fin.getDate()+" "+MOIS[fin.getMonth()]+'</b><button type="button" id="dhn" aria-label="Semaine suivante">Suivante</button></div>';
    var g = '<div class="gs"><div class="d"></div>';
    for(var k = 0; k < 7; k++){ var dj = new Date(S.lundi); dj.setDate(dj.getDate()+k); var ij = isoJour(dj), passe = ij < aujIso;
      var avec = S.evs.some(function(e){ return isoJour(new Date(e.debut)) === ij; });
      g += '<div class="d'+(ij === S.jour ? " on" : "")+(passe ? " past" : "")+(ij === aujIso ? " auj" : "")+(conge(ij) ? " "+conge(ij) : "")+'"'+(passe ? "" : ' data-j="'+ij+'"')+'>'+JOURS_C[k]+" "+dj.getDate()+(avec ? " •" : "")+'</div>'; }
    if(S.jj.length){
      g += '<div class="h" style="height:auto;min-height:24px">Jour</div>';
      for(k = 0; k < 7; k++){ dj = new Date(S.lundi); dj.setDate(dj.getDate()+k); var lj = jjDe(S.jj, isoJour(dj));
        g += '<div style="min-width:0;height:auto;min-height:24px;flex-direction:column;align-items:stretch;justify-content:flex-start;overflow:visible;gap:2px;padding:2px 1px">'+lj.map(function(e){ var c = couleurEv(e); return '<span style="background:'+c.f+';color:'+c.t+';font-size:8px;line-height:10px;padding:1px 2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;text-align:left">'+esc(e.titre)+'</span>'; }).join("")+'</div>'; }
    }
    for(var hh = 7; hh <= 18; hh++){
      g += '<div class="h">'+hh+' h</div>';
      for(k = 0; k < 7; k++){ dj = new Date(S.lundi); dj.setDate(dj.getDate()+k); ij = isoJour(dj); var pj = ij < aujIso;
        var occE = S.evs.filter(function(e){ var d0 = new Date(e.debut); return isoJour(d0) === ij && d0.getHours() <= hh && new Date(e.fin) > new Date(dj.getFullYear(), dj.getMonth(), dj.getDate(), hh, 0); })[0], occ = !!occE;
        var choisi = ij === S.jour && S.heure && +S.heure.split(":")[0] === hh;
        g += '<div class="'+(choisi ? "n" : occ && opts.agenda === false ? "e" : conge(ij) ? "cl"+conge(ij) : "")+(pj ? " past" : "")+'"'+(pj ? "" : ' data-j="'+ij+'" data-h="'+hh+'"')+'></div>'; }
    }
    h += g + '</div>' + legende();
    if(S.jour){
      var d0j = depuis(S.jour), duJour = S.evs.filter(function(e){ return isoJour(new Date(e.debut)) === S.jour && e.id !== opts.exclure; });
      var jjJour = jjDe(S.jj, S.jour);
      h += '<span class="lbl">'+jourTxt(d0j)+(conge(S.jour) ? " \u00b7 labo ferm\u00e9" : "")+'</span>' + jjJour.map(function(e){ var c = couleurAg(e.ag); return '<div class="ligne"><span style="font-size:10px">TOUTE LA JOURNÉE</span><span style="flex:1;margin-left:12px"><i style="display:inline-block;width:10px;height:10px;background:'+c.f+';margin-right:6px"></i>'+esc(e.titre)+'</span></div>'; }).join("") + ((duJour.length || jjJour.length) ? (duJour.length ? duJour.map(function(e){ var d0 = new Date(e.debut), mod = e.ldld && opts.modifier !== false;
        return '<div class="ligne"><span>'+heureTxt(d0.getHours(), d0.getMinutes())+'</span><span style="flex:1;margin-left:12px">'+esc(e.titre)+'</span>'+(mod ? '<span class="crayon" data-ed="'+esc(e.id)+'" style="cursor:pointer;padding:0 6px" aria-label="Modifier">\u270e</span>' : '')+'</div>'+(S.ed && S.ed.id === e.id ? panneau(e) : ''); }).join("") : "") : '<div class="bandeau">\u25aa AUCUN \u00c9V\u00c9NEMENT CE JOUR</div>');
    }
    var jours = optJours(S.jour), jd = S.jour ? depuis(S.jour) : null;
    var hl = optHeures(S.jour, S.heure, 30, opts.exclure);
    if(S.heure && hl.html.indexOf('value="'+S.heure+'"') < 0) S.heure = "";
    var heures = hl.html;
    var cD = "bx"+(S.jour ? "" : " rose")+(S.err && !S.jour ? " err" : ""), cH = "bx"+(S.heure ? "" : " rose")+(S.err && !S.heure ? " err" : "");
    h += '<div style="display:flex;gap:8px"><div style="flex:1"><span class="lbl">Date · obligatoire</span><select class="'+cD+'" id="dhd"><option value="">Choisir une date</option>'+jours+'</select></div>' +
      '<div style="flex:1"><span class="lbl">Heure · obligatoire</span><select class="'+cH+'" id="dhh"><option value="">Choisir</option>'+heures+'</select>'+(hl.masquees ? '<div style="font-size:11px;margin-top:4px;color:var(--tx2)">'+hl.masquees+" heure"+(hl.masquees > 1 ? "s" : "")+" masqu\u00e9e"+(hl.masquees > 1 ? "s" : "")+'</div>' : "")+'</div></div>';
    if(opts.agenda !== false && !opts.mois){
      var Lc = DH_CACHE.agendas || [];
      if(!S.agCreer){ try { S.agCreer = localStorage.getItem("ldld-ag-creer") || ""; } catch(e){} }
      if(!S.agCreer || !Lc.some(function(x){ return idAg(x) === S.agCreer; })){ var dl = Lc.filter(function(x){ return /ldld/i.test(nomAg(x)); })[0]; if(Lc.length) S.agCreer = dl ? idAg(dl) : idAg(Lc[0]); }
      if(S.agCreer) S.agenda = S.agCreer;
      h += '<span class="lbl">Créer dans l\'agenda · un seul</span><div style="display:flex;align-items:center;gap:10px;border:2px solid #0d1117;padding:0 12px;height:46px;box-sizing:border-box"><i style="width:12px;height:12px;flex:none;background:'+couleurAg(S.agCreer).f+'"></i><select id="dhcr" style="flex:1;border:0;outline:0;-webkit-appearance:none;appearance:none;border-radius:0;background:transparent;font:inherit;height:42px;color:inherit">'+Lc.map(function(x){ return '<option value="'+esc(idAg(x))+'"'+(idAg(x) === S.agCreer ? " selected" : "")+'>'+esc(nomAg(x))+'</option>'; }).join("")+'</select><span style="pointer-events:none">⌄</span></div><div style="font-size:11px;margin-top:6px">Le courriel d\'invitation est envoyé depuis cet agenda.</div>';
    }
    z.innerHTML = h;
    lierAg(); lierVue(); placerBlocs();
    document.getElementById("dhp").onclick = function(){ S.lundi.setDate(S.lundi.getDate()-7); charger(); };
    document.getElementById("dhn").onclick = function(){ S.lundi.setDate(S.lundi.getDate()+7); charger(); };
    document.getElementById("dhd").onchange = function(){ S.jour = this.value; S.confirme = false; S.err = false; if(S.jour){ var l = lundiDe(depuis(S.jour)); if(isoJour(l) !== isoJour(S.lundi)){ S.lundi = l; changer(); charger(); return; } } changer(); };
    var cr = document.getElementById("dhcr"); if(cr) cr.onchange = function(){ S.agCreer = this.value; S.agenda = this.value; try { localStorage.setItem("ldld-ag-creer", this.value); } catch(e){} rendre(); };
    document.getElementById("dhh").onchange = function(){ S.heure = this.value; S.err = false; changer(); };
    Array.prototype.forEach.call(z.querySelectorAll("[data-ed]"), function(c){ c.onclick = function(){ var id = c.getAttribute("data-ed"), e = S.evs.filter(function(x){ return x.id === id; })[0]; if(!e) return;
      if(S.ed && S.ed.id === id){ S.ed = null; } else { var d0 = new Date(e.debut); S.ed = {id: id, jour: isoJour(d0), heure: d0.getHours()+":"+d0.getMinutes(), confirm: false, msg: ""}; } rendre(); }; });
    if(S.ed){
      var e0 = S.evs.filter(function(x){ return x.id === S.ed.id; })[0], g1 = function(i){ return document.getElementById(i); };
      if(!e0){ S.ed = null; }
      else {
        if(g1("edd")) g1("edd").onchange = function(){ S.ed.jour = this.value; S.ed.msg = ""; rendre(); };
        if(g1("edh")) g1("edh").onchange = function(){ S.ed.heure = this.value; S.ed.msg = ""; };
        if(g1("edf")) g1("edf").onclick = function(){ S.ed = null; rendre(); };
        if(g1("edx")) g1("edx").onclick = function(){ S.ed.confirm = true; rendre(); };
        if(g1("edn")) g1("edn").onclick = function(){ S.ed.confirm = false; rendre(); };
        if(g1("edo")) g1("edo").onclick = function(){ S.ed.msg = "\u25aa SUPPRESSION\u2026"; rendre(); appelService({action:"agenda_supprimer", session:sessionGardee(), agenda:(e0.ag || S.agenda), id:e0.id, serie:false}).then(function(r){
          if(r && r.ok){ S.ed = null; charger(); if(surChangement) surChangement(); } else { S.ed.confirm = false; S.ed.msg = "\u25aa "+String((r && r.erreur) || "\u00c9CHEC").toUpperCase(); rendre(); } }).catch(function(){ S.ed.confirm = false; S.ed.msg = "\u25aa \u00c9CHEC \u00b7 R\u00c9SEAU"; rendre(); }); };
        if(g1("ep1")) g1("ep1").onclick = function(){ S.ed.choix = false; sauver("un"); };
        if(g1("ep2")) g1("ep2").onclick = function(){ S.ed.choix = false; sauver("suivants"); };
        if(g1("eds")) g1("eds").onclick = function(){ var hv = g1("edh").value; if(!hv){ S.ed.msg = "\u25aa CHOISISSEZ UNE HEURE"; rendre(); return; } if(e0.serie){ S.ed.choix = true; rendre(); return; } sauver("un"); };
        function sauver(portee){ var hv = g1("edh").value, ph2 = hv.split(":"), dur = Math.max(15, Math.round((new Date(e0.fin) - new Date(e0.debut))/60000));
          S.ed.msg = "\u25aa ENREGISTREMENT\u2026"; rendre();
          appelService({action:"agenda_modifier", session:sessionGardee(), agenda:(e0.ag || S.agenda), id:e0.id, portee:portee, titre:e0.titre, texte:e0.texte || "", a:e0.a || "", debut:S.ed.jour+"T"+pad2(ph2[0])+":"+pad2(ph2[1]), minutes:dur}).then(function(r){
            if(r && r.ok){ S.jour = S.ed.jour; S.lundi = lundiDe(depuis(S.jour)); S.ed = null; charger(); if(surChangement) surChangement(); } else { S.ed.msg = "\u25aa "+String((r && r.erreur) || "\u00c9CHEC").toUpperCase(); rendre(); } }).catch(function(){ S.ed.msg = "\u25aa \u00c9CHEC \u00b7 R\u00c9SEAU"; rendre(); }); };
      }
    }
    Array.prototype.forEach.call(z.querySelectorAll(".gs [data-j]"), function(c){ c.onclick = function(){
      S.jour = c.getAttribute("data-j"); S.confirme = false; S.err = false; var hv = c.getAttribute("data-h"); if(hv) S.heure = hv+":0";
      if(hv && opts.agenda !== false){ var dj2 = depuis(S.jour), t0 = new Date(dj2.getFullYear(), dj2.getMonth(), dj2.getDate(), +hv, 0), t1 = new Date(t0.getTime()+3600000);
        var ev2 = S.evs.filter(function(e){ return new Date(e.debut) < t1 && new Date(e.fin) > t0; })[0]; if(ev2 && ev2.ag) S.agCreer = ev2.ag; }
      changer(); }; });
  }
  function changer(){ rendre(); if(surChangement) surChangement(); }
  return {
    monter: function(zone){ S.zone = zone; rendre(); if(!DH_CACHE.agendas || !DH_CACHE.conges) chargerCaches(function(){ rendre(); }); charger(); },
    lire: function(){ return S.jour && S.heure ? {date: S.jour, heure: pad2(S.heure.split(":")[0])+":"+pad2(S.heure.split(":")[1]), agenda: (S.agCreer || S.agenda), conge: !!conge(S.jour)} : null; },
    valider: function(){ if(S.jour && S.heure) return true; S.err = true; rendre(); return false; },
    confirme: function(v){ if(v === undefined) return S.confirme; S.confirme = v; }
  };
}
function chargerCaches(fin){
  var reste = 2; function un(){ if(--reste === 0 && fin) fin(); }
  if(DH_CACHE.agendas && (DH_CACHE.agendasFrais || true)){ un(); if(!DH_CACHE.agendasFrais){ DH_CACHE.agendasFrais = true; appelService({action:"agenda_liste", session:sessionGardee()}).then(function(r){ if(r && r.ok && r.agendas){ var l = r.agendas.filter(function(a, i, t){ return a.ecriture && t.findIndex(function(b){ return b.id === a.id; }) === i; }); if(l.length){ DH_CACHE.agendas = l; try { localStorage.setItem("ldld-c-agendas", JSON.stringify(l)); } catch(e){} } } }).catch(function(){}); } } else appelService({action:"agenda_liste", session:sessionGardee()}).then(function(r){ DH_CACHE.agendas = (r && r.ok && r.agendas) ? r.agendas.filter(function(a, i, t){ return a.ecriture && t.findIndex(function(b){ return b.id === a.id; }) === i; }) : []; if(DH_CACHE.agendas.length){ try { localStorage.setItem("ldld-c-agendas", JSON.stringify(DH_CACHE.agendas)); } catch(e){} } un(); }).catch(function(){ DH_CACHE.agendas = []; un(); });
  if(DH_CACHE.conges) un(); else obtenir("calendrier", {action:"calendrier"}, function(r){ var c = {}; (r.jours || []).forEach(function(x){ if(x.t === "f") c[x.d] = "f"; else if(x.t === "c" && !c[x.d]) c[x.d] = "c"; }); DH_CACHE.conges = c; un(); }, function(){ DH_CACHE.conges = {}; un(); }, true);
}
// Nouveau message: onglets Message et Réunion, mêmes participants.
// Nouveau message d'un employé: un seul écran, destinataire à choisir (Gestionnaire de production ou Direction), sujet, message.
function nouveauEmploye(){
  app.innerHTML = '<div class="page" style="padding-bottom:90px"><a class="retour" href="#" id="retour">Retour</a><h1>Envoyer notification</h1>' +
    '<span class="lbl">À · obligatoire</span><select class="bx rose" id="nvers"><option value="">Choisir</option><option value="gestionnaire">Gestionnaire de production</option><option value="direction">Direction</option></select>' +
    '<span class="lbl">Sujet · obligatoire</span><input class="bx rose" id="nsuj" maxlength="120">' +
    '<span class="lbl">Message · obligatoire</span><textarea class="bx rose" id="ntxt" rows="6" maxlength="4000"></textarea>' +
    '<div class="bandeau" id="ne" style="display:none"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); retirerBoutonBas(); menu(); };
  var g = function(i){ return document.getElementById(i); };
  var dire = function(t){ var e = g("ne"); if(e){ e.style.display = "block"; e.textContent = t; } };
  function maj(){ var v = g("nvers").value, s = g("nsuj").value, t = g("ntxt").value;
    g("nvers").className = "bx"+(v ? "" : " rose"); g("nsuj").className = "bx"+(s.trim() ? "" : " rose"); g("ntxt").className = "bx"+(t.trim() ? "" : " rose");
    boutonBas("Envoyer", !!(v && s.trim() && t.trim()), envoyer); }
  function envoyer(){
    var bt = g("btnbas"); bt.disabled = true; dire("\u25aa ENVOI\u2026");
    appelService({action:"message_employe", session:sessionGardee(), vers:g("nvers").value, titre:g("nsuj").value.trim(), texte:g("ntxt").value.trim()}).then(function(r){
      if(r && r.ok){ dire("\u25aa ENVOY\u00c9"); setTimeout(function(){ retirerBoutonBas(); messages(); }, 1200); }
      else { bt.disabled = false; dire("\u25aa NON ENVOY\u00c9 \u00b7 "+String((r && r.erreur) || "R\u00c9ESSAYEZ").toUpperCase()); }
    }).catch(function(){ bt.disabled = false; dire("\u25aa NON ENVOY\u00c9 \u00b7 R\u00c9SEAU"); });
  }
  ["nvers", "nsuj", "ntxt"].forEach(function(i){ g(i).oninput = maj; g(i).onchange = maj; }); maj();
}
function nouveau(onglet){
  if(!peutEcrire()) return nouveauEmploye();
  onglet = onglet === "reunion" ? "reunion" : "message";
  app.innerHTML = '<div class="page" style="padding-bottom:90px"><a class="retour" href="#" id="retour">Retour</a><h1>Calendrier \u25aa notification</h1>' +
    '<div class="aeact" style="margin:0 0 6px"><button type="button" class="bouton choixc" id="ongM" aria-pressed="'+(onglet === "message" ? "true" : "false")+'" style="margin:0;flex:1">Sans événement</button><button type="button" class="bouton choixc" id="ongR" aria-pressed="'+(onglet === "reunion" ? "true" : "false")+'" style="margin:0;flex:1">Avec événement</button></div>' +
    '<div id="npart"><div class="bandeau">▪ UN INSTANT</div></div><div id="nreste"></div><div class="bandeau" id="ne" style="display:none"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); retirerBoutonBas(); responsable(); };
  var dire = function(t){ var e = document.getElementById("ne"); if(e){ e.style.display = "block"; e.textContent = t; } };
  var part = null, dh = dateHeure({}, function(){ majBouton(); }), brouillon = {titre: "", texte: "", sujet: "", repeter: "aucune"};
  function lireChamps(){ var t = document.getElementById("ntit"), x = document.getElementById("ntxt"), s = document.getElementById("nsuj"), r = document.getElementById("nrep");
    if(t) brouillon.titre = t.value; if(x) brouillon.texte = x.value; if(s) brouillon.sujet = s.value; if(r) brouillon.repeter = r.value; }
  function valide(){ lireChamps(); if(!part || !part.courriels().length) return false;
    return onglet === "message" ? !!(brouillon.titre.trim() && brouillon.texte.trim()) : !!(brouillon.titre.trim() && brouillon.texte.trim() && dh.lire()); }
  function majBouton(){ var ok = valide(); boutonBas(onglet === "message" ? "Envoyer" : "Planifier", ok, envoyer);
    [["ntit", brouillon.titre], ["ntxt", brouillon.texte], ["nsuj", brouillon.sujet]].forEach(function(c){ var el = document.getElementById(c[0]); if(el) el.className = "bx"+(c[1].trim() ? "" : " rose"); }); }
  function dessinerReste(){
    var h;
    var champs = '<span class="lbl">Titre · obligatoire</span><input class="bx rose" id="ntit" maxlength="120" value="'+esc(brouillon.titre)+'"><span class="lbl">Message · obligatoire</span><textarea class="bx rose" id="ntxt" rows="5" maxlength="4000">'+esc(brouillon.texte)+'</textarea>';
    if(onglet === "message") h = '<span class="lbl">Titre · obligatoire</span><input class="bx rose" id="ntit" maxlength="120" value="'+esc(brouillon.titre)+'"><span class="lbl">Message · obligatoire</span><textarea class="bx rose" id="ntxt" rows="5" maxlength="4000">'+esc(brouillon.texte)+'</textarea>';
    else h = champs + '<div id="ndh"></div><span class="lbl">Répéter</span><select class="bx" id="nrep"><option value="aucune">Une seule fois</option><option value="jour">Chaque jour ouvrable</option><option value="semaine">Chaque semaine</option><option value="deux">Aux deux semaines</option><option value="mois">Chaque mois</option></select>' +
      '<a class="doc" href="#" id="nmes" style="margin-top:14px"><span>▪ Mes événements</span></a>';
    document.getElementById("nreste").innerHTML = h;
    ["ntit", "ntxt", "nsuj"].forEach(function(id){ var el = document.getElementById(id); if(el) el.oninput = majBouton; });
    var r = document.getElementById("nrep"); if(r){ r.value = brouillon.repeter; r.onchange = majBouton; }
    var m = document.getElementById("nmes"); if(m) m.onclick = function(e){ e.preventDefault(); retirerBoutonBas(); mesEvenements(); };
    if(onglet === "reunion") dh.monter(document.getElementById("ndh"));
    majBouton();
  }
  function envoyer(){
    if(!valide()) return;
    var bt = document.getElementById("btnbas"); bt.disabled = true; dire("▪ ENVOI…");
    if(onglet === "message"){
      appelService({action:"envoyer", session:sessionGardee(), titre:brouillon.titre.trim(), texte:brouillon.texte.trim(), destinataires:part.courriels()}).then(function(r){
        if(r && r.ok){ dire("▪ ENVOYÉ À "+r.nb+" PERSONNE"+(r.nb > 1 ? "S" : "")); setTimeout(function(){ retirerBoutonBas(); messages(); }, 1200); }
        else { bt.disabled = false; dire("▪ NON ENVOYÉ · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase()); }
      }).catch(function(){ bt.disabled = false; dire("▪ NON ENVOYÉ · RÉSEAU"); });
    } else {
      var q = dh.lire();
      if(q.conge && !dh.confirme()){ dh.confirme(true); bt.disabled = false; dire("▪ LE LABO EST FERMÉ CE JOUR · TOUCHEZ PLANIFIER POUR CONFIRMER"); return; }
      appelService({action:"agenda_creer", session:sessionGardee(), agenda:q.agenda, titre:brouillon.titre.trim(), texte:brouillon.texte.trim(), a:part.noms().join(", ").slice(0, 190),
        debut:q.date+"T"+q.heure, minutes:30, repeter:brouillon.repeter}).then(function(r){
        if(r && r.ok){ dire("▪ RÉUNION PLANIFIÉE"); setTimeout(function(){ bt.disabled = false; }, 800); }
        else { bt.disabled = false; dire("▪ NON PLANIFIÉE · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase()); }
      }).catch(function(){ bt.disabled = false; dire("▪ NON PLANIFIÉE · RÉSEAU"); });
    }
  }
  function aller(o){ lireChamps(); onglet = o; nouveau.derniere = o; nouveau(o); }
  document.getElementById("ongM").onclick = function(){ if(onglet !== "message") nouveau("message"); };
  document.getElementById("ongR").onclick = function(){ if(onglet !== "reunion") nouveau("reunion"); };
  var locG = lireCache("equipe_groupes"); if(locG) chercher("equipe_groupes", {action:"equipe_groupes"}).catch(function(){});
  (locG ? Promise.resolve(locG) : chercher("equipe_groupes", {action:"equipe_groupes"})).then(function(r){
    if(!r || !r.ok) throw 0;
    part = participants(r.personnes, r.groupes || [], majBouton);
    part.monter(document.getElementById("npart")); dessinerReste();
  }).catch(function(){ document.getElementById("npart").innerHTML = '<div class="bandeau">▪ LISTE INDISPONIBLE · RÉESSAYEZ</div>'; });
}
// Modifier une réunion créée dans l'application: même formulaire que « Nouveau message · Réunion », déjà rempli.
function modifierReunion(e){
  app.innerHTML = '<div class="page" style="padding-bottom:90px"><a class="retour" href="#" id="retour">Retour</a><h1>Calendrier \u25aa notification</h1><div id="npart"></div><div id="nreste"></div><div class="bandeau" id="ne" style="display:none"></div></div>';
  var retour = function(){ retirerBoutonBas(); mesEvenements(); };
  document.getElementById("retour").onclick = function(ev){ ev.preventDefault(); retour(); };
  var dire = function(t){ var x = document.getElementById("ne"); if(x){ x.style.display = "block"; x.textContent = t; } };
  var d0 = new Date(e.debut), dur = Math.max(15, Math.round((new Date(e.fin) - d0)/60000)), part = null, sujet = e.titre;
  var dh = dateHeure({agenda: false, modifier: false, exclure: e.id, init: {jour: isoJour(d0), heure: d0.getHours()+":"+d0.getMinutes()}}, function(){ maj(); });
  function lire(){ var s2 = document.getElementById("nsuj"); if(s2) sujet = s2.value; }
  function maj(){ lire(); boutonBas("Enregistrer", !!(part && part.courriels().length && sujet.trim() && dh.lire()), enregistrer);
    var s2 = document.getElementById("nsuj"); if(s2) s2.className = "bx"+(sujet.trim() ? "" : " rose"); }
  function enregistrer(){
    lire(); var q = dh.lire(); if(!q || !sujet.trim() || !part.courriels().length) return;
    if(e.serie){ var z2 = document.getElementById("nport"); if(!z2){ z2 = document.createElement("div"); z2.id = "nport"; document.getElementById("nreste").appendChild(z2); }
      z2.innerHTML = '<div class="etq" style="margin-top:14px">ENREGISTRER POUR</div><div class="aeact"><button type="button" class="bouton" id="p1">Cette date seulement</button><button type="button" class="bouton" id="p2">Cette date et toutes les suivantes</button></div>';
      document.getElementById("p1").onclick = function(){ z2.remove(); envoyerMod("un"); }; document.getElementById("p2").onclick = function(){ z2.remove(); envoyerMod("suivants"); }; return; }
    envoyerMod("un");
  }
  function envoyerMod(portee){
    var q = dh.lire(); var bt = document.getElementById("btnbas"); bt.disabled = true; dire("▪ ENREGISTREMENT…");
    appelService({action:"agenda_modifier", session:sessionGardee(), id:e.id, portee:portee, titre:sujet.trim(), texte:e.texte || "", a:part.noms().join(", ").slice(0, 190), debut:q.date+"T"+q.heure, minutes:dur}).then(function(r){
      if(r && r.ok){ dire("▪ RÉUNION MODIFIÉE"); setTimeout(retour, 1000); } else { bt.disabled = false; dire("▪ NON MODIFIÉE · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase()); }
    }).catch(function(){ bt.disabled = false; dire("▪ NON MODIFIÉE · RÉSEAU"); });
  }
  function supprimer(){ confirmerOuiNon("Supprimer cette réunion ?", function(){
    dire("▪ SUPPRESSION…"); appelService({action:"agenda_supprimer", session:sessionGardee(), id:e.id, serie:false}).then(function(r){
      if(r && r.ok) retour(); else dire("▪ NON SUPPRIMÉE · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase()); }).catch(function(){ dire("▪ NON SUPPRIMÉE · RÉSEAU"); }); }, true); }
  appelService({action:"equipe_groupes", session:sessionGardee()}).then(function(r){
    if(!r || !r.ok) throw 0;
    var noms = String(e.a || "").split(", "), init = {grp: [], emp: []};
    (r.groupes || []).forEach(function(g){ if(noms.indexOf(g.nom) >= 0) init.grp.push(g.nom); });
    r.personnes.forEach(function(p){ if(noms.indexOf(nomTitre(p.nom)) >= 0) init.emp.push(p.c); });
    part = participants(r.personnes, r.groupes || [], maj, init);
    part.monter(document.getElementById("npart"));
    document.getElementById("nreste").innerHTML = '<div id="ndh"></div><span class="lbl">Sujet · obligatoire</span><input class="bx" id="nsuj" maxlength="120" value="'+esc(sujet)+'">' +
      '<a class="doc" href="#" id="nsup" style="margin-top:14px"><span>▪ Supprimer cette réunion</span></a>';
    document.getElementById("nsuj").oninput = maj; document.getElementById("nsup").onclick = function(ev){ ev.preventDefault(); supprimer(); };
    dh.monter(document.getElementById("ndh")); maj();
  }).catch(function(){ document.getElementById("npart").innerHTML = '<div class="bandeau">▪ LISTE INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function mesEvenements(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Calendrier \u25aa notification</h1><div id="me"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); nouveau("reunion"); };
  var liste = [], choisi = null, msg = "", mode = "";
  function dessiner(){
    var el = document.getElementById("me"); if(!el) return;
    var h = liste.length ? '<div class="lcol lcolh"><span>Date</span><span>Événement</span><span>Heure</span></div>' + liste.map(function(e, i){ var d0 = new Date(e.debut);
      return '<a href="#" class="lcol" data-i="'+i+'" style="color:inherit;text-decoration:none'+(choisi === i ? ';background:var(--tx);color:var(--noir)' : '')+'"><span>'+d0.getDate()+" "+MOIS_LONGS[d0.getMonth()].slice(0,4)+".</span><span>"+esc(e.titre)+(e.serie ? "<small>Série</small>" : "")+"</span><span>"+heureTxt(d0.getHours(), d0.getMinutes())+'</span></a>'; }).join("") : '<div class="bandeau">▪ AUCUN ÉVÉNEMENT CE MOIS</div>';
    if(choisi !== null && !mode) h += '<div class="aeact"><button type="button" class="bouton" id="mm">Modifier</button><button type="button" class="bouton" id="ms">Supprimer</button></div>';
    if(choisi !== null && mode){ h += '<div class="etq" style="margin-top:12px">SUPPRIMER</div><div class="aeact"><button type="button" class="bouton" id="m1">Cet événement</button>'+(liste[choisi].serie ? '<button type="button" class="bouton" id="m2">Toute la série</button>' : '')+'</div>'; }
    if(msg) h += '<div class="bandeau">'+esc(msg)+'</div>';
    el.innerHTML = h;
    Array.prototype.forEach.call(el.querySelectorAll("[data-i]"), function(a){ a.onclick = function(e){ e.preventDefault(); choisi = +a.getAttribute("data-i"); mode = ""; msg = ""; dessiner(); }; });
    var bm = document.getElementById("mm"); if(bm) bm.onclick = function(){ modifierReunion(liste[choisi]); };
    var bs = document.getElementById("ms"); if(bs) bs.onclick = function(){ mode = "sup"; dessiner(); };
    function sup(serie){ var e = liste[choisi]; msg = "▪ SUPPRESSION…"; dessiner();
      appelService({action:"agenda_supprimer", session:sessionGardee(), id:e.id, serie:serie}).then(function(r){ if(r && r.ok){ choisi = null; mode = ""; msg = ""; charger(); } else { msg = "▪ "+String((r && r.erreur) || "ÉCHEC").toUpperCase(); dessiner(); } }).catch(function(){ msg = "▪ ÉCHEC · RÉSEAU"; dessiner(); }); }
    var b1 = document.getElementById("m1"); if(b1) b1.onclick = function(){ confirmerOuiNon("Supprimer cet événement ?", function(){ sup(false); }, false); };
    var b2 = document.getElementById("m2"); if(b2) b2.onclick = function(){ confirmerOuiNon("Supprimer toute la série ?", function(){ sup(true); }, false); };
  }
  function charger(){ appelService({action:"agenda_mes", session:sessionGardee()}).then(function(r){ liste = (r && r.ok) ? r.evenements : []; dessiner(); }).catch(function(){ var el = document.getElementById("me"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; }); }
  charger();
}
// Portrait d'un employé (direction seulement): chiffres de la section 01 et échelle salariale, lus en direct par le service.
// Fenêtre de confirmation Non / Oui (aucune page de plus).
function confirmerOuiNon(question, oui, rouge){
  var f = document.createElement("div");
  f.style.cssText = "position:fixed;inset:0;background:rgba(15,20,32,.55);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50";
  f.innerHTML = '<div style="background:#e3dfd3;color:#111;border:1.5px solid #111;padding:20px;width:100%;max-width:340px"><div style="font-size:15px;line-height:1.5;margin-bottom:16px">'+esc(question)+'</div><div class="aeact" style="margin:0"><button type="button" class="bouton" id="cno" style="margin:0">Non</button><button type="button" class="bouton" id="coui" style="margin:0'+(rouge ? ";background:#a32d2d;color:#fff" : "")+'">Oui</button></div></div>';
  document.body.appendChild(f);
  document.getElementById("cno").onclick = function(){ f.remove(); };
  document.getElementById("coui").onclick = function(){ f.remove(); oui(); };
}
function utilisationApp(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Utilisation app</h1><div id="ut"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  function pc(x){ return Math.round(x*100)+" %"; }
  function barre(x){ return '<div style="height:10px;border:1px solid var(--tx2);margin:4px 0 10px"><i style="display:block;height:100%;width:'+Math.round(x*100)+'%;background:var(--tx)"></i></div>'; }
  appelService({action:"utilisation", session:sessionGardee()}).then(function(r){
    var el = document.getElementById("ut"); if(!el) return;
    if(!r || !r.ok) throw 0;
    if(!r.employes.length){ el.innerHTML = '<div class="bandeau">▪ LE SUIVI COMMENCE AUJOURD\'HUI · REVENEZ DEMAIN</div>'; return; }
    el.innerHTML = '<div class="etq">JOURS OUVRABLES OÙ L\'EMPLOYÉ A OUVERT L\'APPLICATION · 6 DERNIERS MOIS · DEPUIS LE '+esc(r.depuis)+'</div>' +
      '<div class="etq" style="margin-top:14px">MOYENNE DE L\'ÉQUIPE · '+pc(r.moyenne || 0)+'</div>'+barre(r.moyenne || 0) +
      '<div class="etiq" style="margin-top:14px">▪ EMPLOYÉS</div>' +
      r.employes.map(function(x){ return '<div class="ligne"><span>'+esc(x.nom)+'</span><span>'+pc(x.taux)+'</span></div>'+barre(x.taux); }).join("");
  }).catch(function(){ var el = document.getElementById("ut"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
// Suivi de charge (responsables et direction): un employé à la fois, du premier au dernier, avec le bouton du bas.
var SC_AGENDAS = null;
function suiviCharge(){
  app.innerHTML = '<div class="page" id="tb" style="padding-bottom:90px"><a class="retour" href="#" id="retour">Retour</a><h1>Suivi de charge</h1><div id="sc"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  var liste = [], i = 0, etat = "", noteOn = false, planOn = false, msg = "", occupe = false;
  var dh = null;
  var ETATS = ["Tout va bien", "À surveiller", "Intervention requise"];
  function pc(x){ return x == null ? "—" : Math.round(x*100)+" %"; }
  function tuile(v, lib, cible, max, cq){
    var vide = v == null, val = vide ? 0 : Math.round(v*100), c = Math.round(cible*100), ok = !vide && (max ? val <= c : val >= c);
    return '<div class="tcarte tk'+(vide ? ' sans' : '')+'"><div class="tct"><span><b class="tq" style="background:'+cq+'"></b>'+lib+'</span>'+(vide ? '' : '<span class="tind '+(ok ? "dans" : "sous")+'">'+(ok ? "Dans la cible" : "Sous la cible")+'</span>')+'</div>' +
      '<div class="tl">'+(vide ? '<div class="tgros">\u2014</div>' : '<div class="tgros">'+val+'<small>%</small></div>')+'<div class="tcib">Cible '+c+' % '+(max ? "et \u2212" : "et +")+'</div></div>' +
      '<div class="tbarre"><i style="width:'+Math.min(100, val)+'%"></i><u style="left:'+Math.min(100, c)+'%"></u></div></div>'; }
  function dateCourte(d){ var p = String(d).split("-"); return +p[2]+" "+MOIS_LONGS[+p[1]-1].slice(0,4)+"."; }
  function bouton(txt, on, rose, id){ return '<button type="button" id="'+id+'" class="bouton" style="margin:0;flex:1;font-size:11px;padding:12px 2px;'+(on ? "" : "background:"+(rose ? "#f4b3c4" : "transparent")+";color:#111;")+'border:1.5px solid var(--tx)">'+txt+'</button>'; }
  function dessiner(){
    var el = document.getElementById("sc"); if(!el) return;
    var p = liste[i], d = p.dernier;
    var h = '<div class="etiq">\u25aa '+(i+1)+' SUR '+liste.length+'</div><div style="font-size:22px;margin:2px 0 12px">'+esc(p.nom)+'</div>' +
      ''+tuile(p.effectuee, "CHARGE EFFECTUÉE", 0.8, false, "#8D806A")+tuile(p.nonTerminee, "CHARGE NON TERMINÉE", 0.05, true, "#1D1D1B")+tuile(p.objectifs, "OBJECTIFS ATTEINTS", 0.8, false, "#8D806A") +
      '<div style="border-left:4px solid var(--tx);padding:8px 10px;margin:10px 0;font-size:13px;line-height:1.5"><b class="etq" style="font-weight:500;text-transform:uppercase">Suivi de la réunion précédente</b>'+(d ? '<div style="margin-bottom:4px">'+dateCourte(d.date)+' · État choisi : <span style="font-weight:600">'+esc(d.etat)+'</span></div>' : "")+(d && d.note ? esc(d.note) : '<span>'+(d ? "Aucune note." : "Aucun suivi précédent.")+'</span>')+'</div>' +
      '<div class="etq" style="margin-top:12px">ÉTAT · OBLIGATOIRE</div><div style="display:flex;gap:6px;margin-top:4px">'+ETATS.map(function(x, k){ return bouton(x, etat === x, !etat, "se"+k); }).join("")+'</div>' +
      '<div class="etq" style="margin-top:14px">OPTIONNEL</div>' +
      (noteOn ? '<div style="display:flex;gap:6px;margin-top:4px;align-items:flex-start"><textarea class="champ" id="snt" rows="4" maxlength="2000" placeholder="Note du suivi…" style="flex:1;margin:0">'+esc(sauvNote)+'</textarea><button type="button" id="snx" class="bouton" aria-label="Fermer la note" style="margin:0;width:40px;flex:none;padding:10px 0;font-size:16px">✕</button></div>'
        : '<div style="display:flex;gap:6px;margin-top:4px">'+bouton("Inscrire une note", false, false, "sn")+bouton("Planifier une rencontre", planOn, false, "sp")+'</div>') +
      (planOn ? '<div id="scp"><div id="scdh"></div><span class="lbl">Sujet</span><div class="bx">Suivi de charge · '+esc(p.nom)+'</div></div>' : "") +
      (msg ? '<div class="bandeau" style="margin-top:10px">'+esc(msg)+'</div>' : "");
    el.innerHTML = h;
    ETATS.forEach(function(x, k){ document.getElementById("se"+k).onclick = function(){ lireNote(); etat = x; msg = ""; dessiner(); }; });
    var bn = document.getElementById("sn"); if(bn) bn.onclick = function(){ noteOn = true; dessiner(); document.getElementById("snt").focus(); };
    var bx = document.getElementById("snx"); if(bx) bx.onclick = function(){ lireNote(); noteOn = false; dessiner(); };
    var bp = document.getElementById("sp"); if(bp) bp.onclick = function(){ planOn = !planOn; dh = planOn ? dateHeure({}) : null; dessiner(); };
    if(planOn) dh.monter(document.getElementById("scdh"));
    barre();
  }
  var sauvNote = "";
  function lireNote(){ var t = document.getElementById("snt"); if(t) sauvNote = t.value; }
  function barre(){
    var b = document.getElementById("scb");
    if(!b){ b = document.createElement("button"); b.type = "button"; b.id = "scb"; b.className = "bouton"; document.body.appendChild(b); }
    b.style.cssText = "position:fixed;z-index:20;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(max(env(safe-area-inset-bottom,0px),12px) + 10px);width:auto;margin:0;font-size:13px;padding:13px 18px;" + (etat ? "" : "opacity:.5");
    b.textContent = i === liste.length-1 ? "Enregistrer et terminer" : "Enregistrer et suivant";
    b.onclick = enregistrer;
  }
  function nettoyer(){ var b = document.getElementById("scb"); if(b) b.remove(); }
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); nettoyer(); responsable(); };
  function suivant(){
    nettoyer();
    if(i >= liste.length-1){ responsable(); return; }
    i++; etat = ""; noteOn = false; planOn = false; dh = null; sauvNote = ""; msg = ""; occupe = false; window.scrollTo(0, 0); dessiner();
  }
  function enregistrer(){
    if(occupe) return;
    lireNote();
    if(!etat){ msg = "▪ CHOISISSEZ UN ÉTAT AVANT DE CONTINUER"; dessiner(); return; }
    var p = liste[i];
    function sauver(){
      appelService({action:"charge_suivi", session:sessionGardee(), nom:p.brut, etat:etat, note:noteOn ? sauvNote : ""}).then(function(r){
        if(r && r.ok){ p.dernier = {date: isoJour(new Date()), etat: etat, note: noteOn ? sauvNote.trim() : ""}; suivant(); }
        else { occupe = false; msg = "▪ NON ENREGISTRÉ · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase(); dessiner(); }
      }).catch(function(){ occupe = false; msg = "▪ NON ENREGISTRÉ · RÉSEAU"; dessiner(); });
    }
    occupe = true; msg = "▪ ENREGISTREMENT…"; dessiner();
    if(planOn){
      var q = dh.lire();
      if(!q){ dh.valider(); occupe = false; msg = "▪ CHOISISSEZ LA DATE ET L'HEURE"; dessiner(); return; }
      if(q.conge && !dh.confirme()){ dh.confirme(true); occupe = false; msg = "▪ LE LABO EST FERMÉ CE JOUR · TOUCHEZ ENREGISTRER POUR CONFIRMER"; dessiner(); return; }
      appelService({action:"agenda_creer", session:sessionGardee(), agenda:q.agenda, titre:"Suivi de charge · "+p.nom, texte:"", a:p.brut,
        debut:q.date+"T"+q.heure, minutes:30, repeter:"aucune"}).then(function(r){
        if(r && r.ok) sauver(); else { occupe = false; msg = "▪ RENCONTRE NON PLANIFIÉE · "+String((r && r.erreur) || "RÉESSAYEZ").toUpperCase(); dessiner(); }
      }).catch(function(){ occupe = false; msg = "▪ RENCONTRE NON PLANIFIÉE · RÉSEAU"; dessiner(); });
    } else sauver();
  }
  chargerCaches();
  appelService({action:"charge_equipe", session:sessionGardee()}).then(function(r){
    var el = document.getElementById("sc"); if(!el) return;
    if(!r || !r.ok) throw 0;
    liste = r.employes; if(!liste.length){ el.innerHTML = '<div class="bandeau">▪ AUCUN EMPLOYÉ À SUIVRE</div>'; return; }
    dessiner();
  }).catch(function(){ var el = document.getElementById("sc"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function gestionEmployes(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Retirer un employé</h1><div id="gebar"></div><div id="ge"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  function agir(id, nom, actif){
    confirmerOuiNon((actif ? "Réactiver " : "Désactiver ")+nom+"?", function(){
      neTache({nom: nom, duree: 8000, fin: function(E){ if(E.etat === "ok") setTimeout(function(){ if(document.getElementById("ge")) gestionEmployes(); }, 1500); }, lib: actif ? {cours: "Réactivation en cours", ok: "Employé réactivé", non: "Employé non réactivé"} : {cours: "Désactivation en cours", ok: "Employé désactivé", non: "Employé non désactivé"},
        run: function(){ return appelService({action:"employe_actif", session:sessionGardee(), id:id, actif:actif}); }});
    });
  }
  function supprimer(id, nom){
    confirmerOuiNon("Supprimer "+nom+"? Ses archives sont gardées 4 ans.", function(){
      neTache({nom: nom, duree: 20000, fin: function(E){ if(E.etat === "ok") setTimeout(function(){ if(document.getElementById("ge")) gestionEmployes(); }, 1500); }, lib: {cours: "Suppression en cours", ok: "Employé supprimé", non: "Employé non supprimé"}, reseau: "Réponse non reçue, vérifiez le classeur",
        run: function(){ return appelService({action:"employe_supprimer", session:sessionGardee(), id:id}); }});
    }, true);
  }
  appelService({action:"employes_etat", session:sessionGardee()}).then(function(r){
    var el = document.getElementById("ge"); if(!el) return;
    if(!r || !r.ok) throw 0;
    el.innerHTML = '<div class="etq">CHOISIR UN EMPLOYÉ</div><select class="champ" id="gs">'+r.actifs.map(function(x){ return '<option value="'+esc(x.id)+'">'+esc(x.nom)+'</option>'; }).join("")+'</select>' +
      '<div class="aeact" style="margin:0 0 22px"><button type="button" class="bouton" id="gsup" style="margin:0;flex:1;border:2px solid #7a2e2e;background:transparent;color:#7a2e2e;padding:11px 0;font-size:12px">Supprimer</button><button type="button" class="bouton" id="gdes" style="margin:0;flex:1;border:2px solid #0d1117;background:transparent;color:#0d1117;padding:11px 0;font-size:12px">Désactiver</button></div>' +
      '<div style="background:#b8ae9b;color:#0d1117;font-size:14px;letter-spacing:.2em;padding:13px 14px;text-transform:uppercase;margin:64px 0 18px">Inactifs · '+r.inactifs.length+'</div>' +
      (r.inactifs.length ? r.inactifs.map(function(x, k){ return '<div class="ligne"><span>'+esc(x.nom)+'</span><span style="display:flex;gap:6px"><button type="button" class="bouton" data-s="'+k+'" style="margin:0;width:auto;padding:9px 12px;font-size:11px;border:2px solid #7a2e2e;background:transparent;color:#7a2e2e">Supprimer</button><button type="button" class="bouton" data-k="'+k+'" style="margin:0;width:auto;padding:9px 12px;font-size:11px;border:2px solid #0d1117;background:transparent;color:#0d1117">Réactiver</button></span></div>'; }).join("") : '<div class="bandeau">▪ AUCUN</div>');
    function choisi(){ var s = document.getElementById("gs"); return s.value ? {id: s.value, nom: s.options[s.selectedIndex].text} : null; }
    document.getElementById("gdes").onclick = function(){ var c = choisi(); if(c) agir(c.id, c.nom, false); };
    document.getElementById("gsup").onclick = function(){ var c = choisi(); if(c) supprimer(c.id, c.nom); };
    Array.prototype.forEach.call(el.querySelectorAll("button[data-s]"), function(b){ b.onclick = function(){ var x = r.inactifs[+b.getAttribute("data-s")]; supprimer(x.id, x.nom); }; });
    Array.prototype.forEach.call(el.querySelectorAll("button[data-k]"), function(b){ b.onclick = function(){ var x = r.inactifs[+b.getAttribute("data-k")]; agir(x.id, x.nom, true); }; });
  }).catch(function(){ var el = document.getElementById("ge"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function sectionsPortrait(p){
  function pct(x){ return x === null || x === undefined ? "—" : Math.round(x*100)+" %"; }
  var c = p.contribution, ch = p.charge, pa = p.paroles, ci = p.cibles || {}, h = "";
  h += '<div class="etq" style="margin-top:14px">CONTRIBUTION</div>';
  h += c ? '<div style="font-size:28px">'+pct(c.resultat)+'</div>' +
      [["Technique", c.tech], ["Autonomie", c.auto], ["Qualité", c.qual]].filter(function(l){ return l[1] !== null && l[1] !== undefined; })
        .map(function(l){ return '<div class="ligne"><span>▪ '+l[0]+'</span><span>'+esc(String(l[1]).replace(".", ","))+'</span></div>'; }).join("") +
      (c.obj !== null && c.obj !== undefined ? '<div class="ligne"><span>▪ Objectifs</span><span>'+pct(c.obj)+'</span></div>' : "")
    : '<div class="bandeau">▪ AUCUNE APPRÉCIATION CETTE ANNÉE</div>';
  h += '<div class="etiq" style="margin-top:18px">▪ 02 CHARGE DE TRAVAIL</div>';
  h += ch ? [["Charge effectuée", ch.effectuee, "cible "+pct(ci.effectuee)], ["Charge non terminée", ch.nonTerminee, "cible "+pct(ci.nonTerminee)], ["Objectifs atteints", ch.objectifs, "cible "+pct(ci.objectifs)]]
      .map(function(l){ return '<div class="ligne"><span>▪ '+l[0]+' <small>'+l[2]+'</small></span><span>'+pct(l[1])+'</span></div>'; }).join("")
    : '<div class="bandeau">▪ DONNÉES À VENIR</div>';
  h += '<div class="etiq" style="margin-top:18px">▪ 03 POUR NOTRE DISCUSSION</div>';
  h += pa ? [["CE QUI VA BIEN", pa.bien], ["À DÉVELOPPER", pa.developper], ["À ABORDER", pa.aborder]].filter(function(l){ return l[1]; })
      .map(function(l){ return '<div class="etq" style="margin-top:10px">'+l[0]+'</div><div>'+esc(l[1])+'</div>'; }).join("")
    : '<div class="bandeau">▪ AUTOÉVALUATION NON REMPLIE</div>';
  return h;
}
function portrait(id){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><div id="pt"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  function dollars(n){ return n === null || n === undefined ? "—" : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" $"; }
  appelService({action:"portrait", session:sessionGardee(), id:id || ""}).then(function(r){
    var el = document.getElementById("pt"); if(!el) return;
    if(!r || !r.ok) throw 0;
    var p = r.portrait, liste = r.employes, i = liste.map(function(x){ return x.id; }).indexOf(p.id);
    var posNum = parseFloat(String(p.position).replace(",", ".")), ech = p.echelle || [];
    var lignes = [["Salaire de base", p.base], ["Vacances, fériés et maladie", p.conges], ["Boni", p.boni], ["Assurances collectives", p.assurances], ["Cotisation OTPADQ", p.otpadq]];
    el.innerHTML = '<h1>Portrait d’un employé</h1><div class="etiq">'+esc(p.nom)+'</div><div class="etiq">'+esc(String(p.categorie).toUpperCase())+' · PORTRAIT '+(new Date().getFullYear())+'</div>' +
      '<select class="champ" id="ps">'+liste.map(function(x){ return '<option value="'+esc(x.id)+'"'+(x.id === p.id ? " selected" : "")+'>'+esc(x.nom)+'</option>'; }).join("")+'</select>' +
      '<div class="aeact" style="margin:0 0 14px"><button type="button" class="bouton" id="pp" style="margin:0"'+(i <= 0 ? " disabled" : "")+'>Précédent</button><button type="button" class="bouton" id="psv" style="margin:0"'+(i >= liste.length-1 ? " disabled" : "")+'>Suivant</button></div>' +
      '<div class="etiq">▪ 01 OÙ VOUS EN ÊTES</div>' +
      '<div class="dh"><div style="flex:1"><div class="etq">EXPÉRIENCE</div><div style="font-size:28px">'+(p.experience === null ? "—" : esc(String(p.experience).replace(".", ","))+' <small>ans</small>')+'</div></div><div style="flex:1"><div class="etq">POSITION DANS L\'ÉCHELLE</div><div style="font-size:28px">'+esc(String(p.position).replace("%", "").trim())+' <small>%</small></div></div></div>' +
      '<div class="etq" style="margin-top:14px">RÉMUNÉRATION GLOBALE</div><div style="font-size:28px">'+dollars(p.total)+'</div>' +
      lignes.map(function(l){ return '<div class="ligne"><span>▪ '+l[0]+'</span><span>'+dollars(l[1])+'</span></div>'; }).join("") +
      (ech.length ? '<div class="etiq" style="margin-top:18px">▪ ÉCHELLE SALARIALE — '+esc(String(p.categorie).toUpperCase())+'</div><div style="overflow-x:auto"><table class="gs-t" style="border-collapse:collapse;font-size:12px;width:100%"><tr>'+ech.map(function(c){ var act = parseFloat(String(c.p).replace(",", ".")) === posNum; return '<td style="padding:6px 4px;text-align:center;border:1px solid var(--tx2)'+(act ? ';background:var(--tx);color:var(--noir)' : '')+'">'+esc(String(c.p).replace("%", ""))+'</td>'; }).join("")+'</tr><tr>'+ech.map(function(c){ var act = parseFloat(String(c.p).replace(",", ".")) === posNum; return '<td style="padding:6px 4px;text-align:center;border:1px solid var(--tx2)'+(act ? ';background:var(--tx);color:var(--noir)' : '')+'">'+esc(String(c.t))+'</td>'; }).join("")+'</tr></table></div>' : "") + sectionsPortrait(p);
    document.getElementById("ps").onchange = function(){ portrait(this.value); };
    var pp = document.getElementById("pp"), sv = document.getElementById("psv");
    if(pp) pp.onclick = function(){ if(i > 0) portrait(liste[i-1].id); };
    if(sv) sv.onclick = function(){ if(i < liste.length-1) portrait(liste[i+1].id); };
  }).catch(function(){ var el = document.getElementById("pt"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function chiffresTel(t){ var d = String(t || "").replace(/\D/g, ""); return d.length === 10 ? "+1"+d : (d.length === 11 && d[0] === "1" ? "+"+d : d); }
function contactsResp(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Contact</h1><input class="champ" id="cq" placeholder="Rechercher" autocomplete="off"><div class="ctl" id="ctl"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); responsable(); };
  var liste = [];
  function dessiner(){
    var q = (document.getElementById("cq").value || "").toLowerCase(), el = document.getElementById("ctl"); if(!el) return;
    var v = liste.filter(function(c){ return !q || (c.nom+" "+c.groupes).toLowerCase().indexOf(q) >= 0; });
    el.innerHTML = v.map(function(c){ var t = chiffresTel(c.tel);
      return '<div class="cr"><div class="cn">'+esc(c.nom)+'<small>'+esc(c.groupes)+(c.groupes && c.tel ? ' · ' : '')+esc(c.tel)+'</small></div>' +
        (t ? '<a class="ib" aria-label="Téléphone" href="tel:'+t+'"><svg viewBox="0 0 24 24" fill="#1D1D1B"><path fill-rule="evenodd" d="M3 2h7v6h-3v8h3v6h-7z M12 8h9v8h-9z"/></svg></a><a class="ib" aria-label="SMS" href="sms:'+t+'"><svg viewBox="0 0 24 24" fill="#1D1D1B"><path d="M2 3h20v3h-20zM2 6h3v9h-3zM19 6h3v9h-3zM2 15h20v3h-20zM5 18h4v4h-4zM8 8h8v2h-8zM8 11h5v2h-5z"/></svg></a>' : '<span class="ib vide"></span><span class="ib vide"></span>') +
        '<a class="ib" aria-label="Courriel" href="mailto:'+esc(c.courriel)+'"><svg viewBox="0 0 24 24" fill="none" stroke="#1D1D1B" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M21 14V3H3v18h13"/><path d="M8 8h7v7H8z"/><path d="M15 15h6v-1"/></svg></a></div>'; }).join("") || '<div class="bandeau">▪ AUCUN RÉSULTAT</div>';
  }
  document.getElementById("cq").oninput = dessiner;
  obtenir("contacts", {action:"contacts"}, function(r){ liste = r.contacts || []; dessiner(); },
    function(){ var el = document.getElementById("ctl"); if(el) el.innerHTML = '<div class="bandeau">▪ CONTACTS INDISPONIBLES · RÉESSAYEZ</div>'; }, true);
}
// Calendrier : congés de l'entreprise (congé / fermé en noir) et réunions de l'employé (en vert); un mois à la fois.
var MOIS_COURTS = ["JANV.","FÉVR.","MARS","AVR.","MAI","JUIN","JUIL.","AOÛT","SEPT.","OCT.","NOV.","DÉC."];
var MOIS_LONGS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
function calendrier(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Calendrier</h1><div id="cal"'+(peutEcrire() ? ' style="display:none"' : '')+'></div>'+(peutEcrire() ? '<div id="calmod"></div>' : '')+'</div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  if(peutEcrire()){ var dhc = dateHeure({mois: true}); dhc.monter(document.getElementById("calmod")); }
  obtenir("calendrier", {action:"calendrier"}, function(r){
    var el = document.getElementById("cal"); if(!el) return;
    if(!r || !r.jours) throw 0;
    var jours = r.jours, m = new Date(); m.setDate(1);
    el.innerHTML = '<div class="moisbar"><button type="button" id="cp" aria-label="Mois précédent">Précédent</button><b id="ct"></b><button type="button" id="cn" aria-label="Mois suivant">Suivant</button></div><div class="cg" id="cg"></div>' +
      '<div class="leg"><span><i class="sq" style="background:#0d1117"></i>Congé / fermé</span><span><i class="sq" style="background:#8EFF60"></i>Réunion</span></div>' +
      '<div class="etiq" style="margin-top:24px">▪ ÉVÉNEMENTS DU MOIS</div><div id="cl"></div>';
    function iso(y, mo, d){ return y+"-"+("0"+(mo+1)).slice(-2)+"-"+("0"+d).slice(-2); }
    function dessiner(){
      var y = m.getFullYear(), mo = m.getMonth(), nb = new Date(y, mo+1, 0).getDate(), prem = (new Date(y, mo, 1).getDay()+6)%7;
      document.getElementById("ct").textContent = MOIS_LONGS[mo].toUpperCase()+" "+y;
      var g = ["L","M","M","J","V","S","D"].map(function(x){ return '<div class="cj">'+x+'</div>'; }).join("");
      for(var i = 0; i < prem; i++) g += '<div class="cd"></div>';
      for(var d = 1; d <= nb; d++){
        var j = iso(y, mo, d), ev = jours.filter(function(x){ return x.d === j; }), cl = "cd";
        if(ev.some(function(x){ return x.t === "f" || x.t === "c" || x.t === "p"; })) cl += " cf"; else if(ev.some(function(x){ return x.t === "r"; })) cl += " cr";
        g += '<div class="'+cl+'">'+d+'</div>';
      }
      document.getElementById("cg").innerHTML = g;
      var pm = iso(y, mo, 1).slice(0, 7);   // seulement le mois choisi dans le calendrier
      var li = jours.filter(function(x){ return x.d.slice(0, 7) === pm; });
      document.getElementById("cl").innerHTML = li.length ? li.map(function(x){ var a = x.d.split("-");
        return '<div class="cli"><span class="cdt">'+(+a[2])+" "+MOIS_COURTS[+a[1]-1]+"</span><span>"+esc(x.n)+'</span>'+(x.h ? '<span class="chh">'+esc(x.h)+'</span>' : '')+'</div>'; }).join("") : '<div class="bandeau">▪ AUCUN ÉVÉNEMENT À VENIR</div>';
    }
    document.getElementById("cp").onclick = function(){ m.setMonth(m.getMonth()-1); dessiner(); };
    document.getElementById("cn").onclick = function(){ m.setMonth(m.getMonth()+1); dessiner(); };
    dessiner();
    // Congés, fériés et fermetures du laboratoire (fichier séparé de Gestion)
    chercher("calendrier_labo", {action:"calendrier_labo"}).then(function(c){
      if(!c || !c.ok || !c.jours || !document.getElementById("cal")) return;
      jours = jours.filter(function(x){ return x.t === "r"; }).concat(c.jours);
      jours.sort(function(a, b){ return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
      dessiner();
    }).catch(function(){});
  }, function(){ var el = document.getElementById("cal"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; }, true);
}
// Rencontre : l'employé choisit son responsable et un sujet; la demande arrive dans les Messages du responsable.
function rencontre(){
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Demander rencontre</h1><div id="rc"></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  var locR = lireCache("rencontre_liste");
  (locR ? Promise.resolve(locR) : chercher("rencontre_liste", {action:"rencontre_liste"})).then(function(r){
    var el = document.getElementById("rc"); if(!el) return;
    if(!r || !r.ok) throw 0;
    if(!r.responsables.length){ el.innerHTML = '<div class="bandeau">▪ AUCUN RESPONSABLE ASSIGNÉ · CONTACTEZ LA DIRECTION</div>'; return; }
    var choix = {resp: r.responsables.length === 1 ? r.responsables[0].c : "", sujet: ""};
    function pastilles(id, liste, cle, valeur){
      return '<div class="chx" id="'+id+'">'+liste.map(function(x){ var v = valeur(x), t = typeof x === "string" ? x : x.nom; return '<button type="button" data-v="'+esc(v)+'" aria-pressed="'+(choix[cle] === v ? "true" : "false")+'">'+esc(t)+'</button>'; }).join("")+'</div>';
    }
    el.innerHTML = '<div class="etiq">▪ AVEC QUI</div>'+pastilles("pr", r.responsables, "resp", function(x){ return x.c; })+
      '<div class="etiq">▪ SUJET</div>'+pastilles("ps", r.sujets, "sujet", function(x){ return x; })+
      '<div class="etiq">▪ MESSAGE (FACULTATIF)</div><textarea class="champ zone" id="rt" maxlength="1000" placeholder="Quelques mots…"></textarea>'+
      '<button class="bouton" id="renv">Envoyer</button><div class="bandeau" id="retat" style="display:none"></div>';
    function lier(id, cle){
      var bs = el.querySelectorAll("#"+id+" button");
      Array.prototype.forEach.call(bs, function(b){ b.onclick = function(){ choix[cle] = b.getAttribute("data-v"); Array.prototype.forEach.call(bs, function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); }; });
    }
    lier("pr", "resp"); lier("ps", "sujet");
    var etat = document.getElementById("retat");
    function dire(t){ etat.style.display = "block"; etat.textContent = t; }
    document.getElementById("renv").onclick = function(){
      if(!choix.resp){ dire("▪ CHOISISSEZ UNE PERSONNE"); return; }
      if(!choix.sujet){ dire("▪ CHOISISSEZ UN SUJET"); return; }
      var bt = this; bt.disabled = true; dire("▪ ENVOI…");
      appelService({action:"rencontre_demande", session:sessionGardee(), responsable:choix.resp, sujet:choix.sujet, texte:document.getElementById("rt").value.trim()}).then(function(x){
        if(x && x.ok){ dire("▪ DEMANDE ENVOYÉE"); setTimeout(menu, 1400); }
        else { bt.disabled = false; dire("▪ NON ENVOYÉE · "+((x && x.erreur) || "RÉESSAYEZ")); }
      }).catch(function(){ bt.disabled = false; dire("▪ NON ENVOYÉE · RÉSEAU"); });
    };
  }).catch(function(){ var el = document.getElementById("rc"); if(el) el.innerHTML = '<div class="bandeau">▪ INDISPONIBLE · RÉESSAYEZ</div>'; });
}
function carreVert(t){ return '<div style="margin:18vh 0 0;background:#8EFF60;color:#1D1D1B;padding:56px 20px;text-align:center;font-size:17px;line-height:1.5;letter-spacing:.14em;text-transform:uppercase;font-weight:500">'+esc(t)+'</div>'; }
var VUE_ESSAIS_H = 0;
function heures(){
  // Vraies heures du logiciel de gestion (pointages de la borne, mises à jour aux 15 minutes). Tout tient sur un écran.
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Mes heures</h1><div id="hz"><div class="bandeau">'+(MOI && MOI.role === "direction" && !VUE.on ? "▪ VOS HEURES NE SONT PAS ENCORE DISPONIBLES" : "▪ UN INSTANT")+'</div></div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
  function hm(m){ if(m === null || m === undefined) return "—"; var h = Math.floor(m / 60), n = m % 60; return h + " h " + (n < 10 ? "0" : "") + n; }
  var JOURS = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
  function ligne(x){ var d = new Date(x.date + "T12:00:00"); return [JOURS[d.getDay()] + " " + d.getDate(), hm(x.min)]; }
  function col(t, r){ var tot = 0, vu = false; r.forEach(function(x){ if(x.min !== null){ tot += x.min; vu = true; } }); return '<div><h2 class="h2">'+t+'</h2>'+r.map(function(x){ var l = ligne(x); return '<div class="hc"><span>'+l[0]+'</span><b>'+l[1]+'</b></div>'; }).join("")+'<div class="htot"><span>Total</span><b>'+(vu ? hm(tot) : "—")+'</b></div></div>'; }
  function afficherH(r){
    var z = document.getElementById("hz"); if(!z) return;
    if(r && r.ok === false && /donn|num|paie|employ|introuv|inconnu/i.test(String(r.erreur || ""))){ z.innerHTML = '<div class="bandeau">▪ VOS HEURES NE SONT PAS ENCORE DISPONIBLES</div>'; return; }
    if(!r || !r.ok){ z.innerHTML = '<div class="bandeau">▪ HEURES INDISPONIBLES · RÉESSAYEZ</div>'; return; }
    var vide = !(r.pointagesAuj || []).length && (r.minutesAuj === null || r.minutesAuj === undefined) && !(r.cette || []).some(function(x){ return x.min !== null && x.min !== undefined; }) && !(r.passee || []).some(function(x){ return x.min !== null && x.min !== undefined; });
    if(vide){
      if(VUE.on && VUE.relancer && (++VUE_ESSAIS_H) <= 4){ VUE.relancer(); return; }
      z.innerHTML = '<div class="bandeau">▪ VOS HEURES NE SONT PAS ENCORE DISPONIBLES</div>'; return;
    }
    VUE_ESSAIS_H = 0;
    var pts = (r.pointagesAuj || []).map(function(x, i, a){
      var lib = x.s === "entree" ? (i === 0 ? "Arrivée" : "Retour") : (i === a.length - 1 && r.etat === "parti" ? "Départ" : "Pause");
      return '<div class="hl"><span class="t">'+hm(Number(x.t.slice(0,2)) * 60 + Number(x.t.slice(3,5)))+'</span><span>'+lib+'</span></div>';
    }).join("");
    z.innerHTML = '<div class="hgros" style="margin-top:18px">'+(r.minutesAuj === null || r.minutesAuj === undefined ? "—" : hm(r.minutesAuj))+'</div><div class="hsous">Faites depuis le début de la journée</div>' +
      (pts ? '<h2 class="h2" style="margin-top:22px">Aujourd\'hui</h2>'+pts : '') +
      '<div class="hcols">'+col("Cette semaine", r.cette || [])+col("Semaine passée", r.passee || [])+'</div>';
  }
  obtenir("heures", {action:"heures"}, afficherH, function(){ var z = document.getElementById("hz"); if(z) z.innerHTML = '<div class="bandeau">▪ HEURES INDISPONIBLES · RÉESSAYEZ</div>'; }, true);
}
var VUE_ONGLETS = [9, 0, 4, 2];   // Mes heures, Messages, Tableau de bord, Autoévaluation (la Rémunération reste la mienne: son code part par courriel)
function estCharles(){ return !!(MOI && /^\s*charles\b/i.test(String(MOI.nom || ""))); }
function section(i){
  if(i === 9 && MOI && MOI.role === "direction" && !estCharles() && !VUE.on){
    app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>Mes heures</h1>'+carreVert('Données non applicables')+'</div>';
    document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
    return;
  }
  if(MOI && MOI.role === "direction" && !vueComme() && VUE_ONGLETS.indexOf(i) >= 0) return vueEmploye(i);
  sectionBase(i);
}
// Employé au hasard préparé d'avance (Direction): la session lecture seule est demandée au service en arrière-plan dès l'accueil, avec ses heures et son tableau de bord. Le toucher ouvre donc la page tout de suite.
var VUE_PRE = null, VUE_DERNIER = "";
function cleLectureVue(c, sess){ var o = {}; Object.keys(c).forEach(function(k){ if(k !== "session") o[k] = c[k]; }); o._v = sess; return JSON.stringify(o); }
function vuePreparer(reelle){
  if(!reelle || VUE_PRE || !MOI || MOI.role !== "direction" || vueComme()) return;
  var pre = {reelle: reelle, t: Date.now()};
  pre.p = enArriere(function(){ return appelBrut({action:"voir_comme", session:reelle, nom:"hasard", role:"employe", exclure:VUE_DERNIER}); }).then(function(r){
    if(r && r.ok){
      [{action:"heures"}, {action:"tableau_courant"}].forEach(function(c){
        var k = cleLectureVue(c, r.session); c.session = r.session;
        var p = enArriere(function(){ return appelBrut(c); });
        RCACHE[k] = {t: Date.now(), p: p};
        p.then(function(x){ if(!(x && x.ok) && RCACHE[k] && RCACHE[k].p === p) delete RCACHE[k]; }, function(){ if(RCACHE[k] && RCACHE[k].p === p) delete RCACHE[k]; });
      });
    } else if(VUE_PRE === pre) VUE_PRE = null;
    return r;
  }, function(e){ if(VUE_PRE === pre) VUE_PRE = null; throw e; });
  pre.p.catch(function(){});
  VUE_PRE = pre;
}
function vueEmploye(i){
  var reelle = VUE.on ? VUE.reel : sessionGardee(), ancien = VUE.on ? VUE.session : null, prec = VUE.nom;
  VUE.on = false;
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+esc(SECTIONS[i])+'</h1><div class="bandeau">▪ UN INSTANT</div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); VUE.pend = false; VUE.on = false; menu(); };
  VUE.pend = true;
  var vueDel = setTimeout(function(){ if(VUE.pend){ VUE.pend = false; VUE.on = false; sectionBase(i); } }, 15000);
  var pre = VUE_PRE; VUE_PRE = null;
  var pr = (pre && pre.reelle === reelle && Date.now() - pre.t < 3000000) ? pre.p : appelBrut({action:"voir_comme", session:reelle, nom:"hasard", role:"employe", exclure:prec});
  pr.then(function(r){
    clearTimeout(vueDel); if(!VUE.pend) return;
    VUE.pend = false;
    if(!r || !r.ok){ VUE.on = false; app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+esc(SECTIONS[i])+'</h1><div class="bandeau">▪ EMPLOYÉ INTROUVABLE · RÉESSAYEZ</div></div>'; document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); }; return; }
    if(ancien) appelBrut({action:"sortie", session:ancien}).catch(function(){});
    VUE = {on:true, reel:reelle, session:r.session, nom:r.nom || "", relancer:function(){ vueEmploye(i); }};
    VUE_DERNIER = r.nom || "";
    sectionBase(i);
    vuePreparer(reelle);
  }).catch(function(){ VUE.pend = false; VUE.on = false; sectionBase(i); });
}
function vueFin(){
  if(!VUE.on) return;
  var s = VUE.session; VUE = {on:false, reel:null, session:null, nom:"", relancer:null};
  appelBrut({action:"sortie", session:s}).catch(function(){});
}
(function(){
  var cible = document.getElementById("app");
  new MutationObserver(function(){
    if(!VUE.on || !cible.querySelector(".page") || cible.querySelector(".vub")) return;
    var p = cible.querySelector(".page"), d = document.createElement("div"); d.className = "vub";
    var b = document.createElement("button"); b.type = "button"; b.className = "vubb"; b.textContent = "Employé · " + nomTitre(VUE.nom);
    b.onclick = function(){ b.textContent = "Employé · …"; if(VUE.relancer) VUE.relancer(); };
    d.appendChild(b); p.insertBefore(d, p.firstChild);
  }).observe(cible, {childList:true});
})();
function sectionBase(i){
  if(i === 0) return messages("");
  if(i === 4) return tableau();
  if(i === 5) return incendie();
  if(i === 6) return calendrier();
  if(i === 7) return rencontre();
  if(i === 8) return profil();
  if(i === 9) return heures();
  if(i === 2) return evaluations();
  if(i === 3) return salaire();
  if(i === 1) return manuel();
  app.innerHTML = '<div class="page"><a class="retour" href="#" id="retour">Retour</a><h1>'+SECTIONS[i]+'</h1>' +
    '<div class="bandeau">▪ ÉTAPE À VENIR</div></div>';
  document.getElementById("retour").onclick = function(e){ e.preventDefault(); menu(); };
}
if(location.hash === "#evaluations") evaluations(); else demarrage();

if("serviceWorker" in navigator){
  // Nouvelle version : si une autre prend le relais, on recharge une seule fois (hors connexion et saisie en cours)
  var avaitControleur = !!navigator.serviceWorker.controller, rechargee = false;
  navigator.serviceWorker.addEventListener("controllerchange", function(){ if(!avaitControleur || rechargee) return; rechargee = true; var a = document.activeElement; if(a && /INPUT|TEXTAREA/.test(a.tagName)) return; location.reload(); });
  window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").then(function(r){
    try { r.update(); } catch(e){}
    // Mise à jour automatique: vérification à chaque retour dans l'application et toutes les 30 secondes tant qu'elle est ouverte
    function verif(){ try { r.update(); } catch(e){} }
    document.addEventListener("visibilitychange", function(){ if(document.visibilityState === "visible") verif(); });
    window.addEventListener("focus", verif); window.addEventListener("pageshow", verif);
    setInterval(function(){ if(document.visibilityState === "visible") verif(); }, 30000);
  }).catch(function(){}); });
}

// Blocage gauche/droite robuste: l'écran ne bouge que verticalement. Un geste surtout horizontal est annulé, sauf dans une zone qui défile vraiment de côté (tableau, plan); tout décalage résiduel est remis à zéro.
(function(){
  var x0 = 0, y0 = 0, laterale = false;
  function zoneLaterale(el){
    for(; el && el !== document.body && el.nodeType === 1; el = el.parentNode){
      var o = getComputedStyle(el).overflowX;
      if((o === "auto" || o === "scroll") && el.scrollWidth > el.clientWidth + 1) return true;
    }
    return false;
  }
  document.addEventListener("touchstart", function(e){ var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; laterale = zoneLaterale(e.target); }, {passive:true});
  document.addEventListener("touchmove", function(e){
    if(laterale || e.touches.length > 1) return;
    var t = e.touches[0], dx = Math.abs(t.clientX - x0), dy = Math.abs(t.clientY - y0);
    if(dx > dy && dx > 4 && e.cancelable) e.preventDefault();
  }, {passive:false});
  function recaler(){ if(window.scrollX){ window.scrollTo(0, lireY()); } if(document.documentElement.scrollLeft) document.documentElement.scrollLeft = 0; if(document.body.scrollLeft) document.body.scrollLeft = 0; }
  window.addEventListener("scroll", recaler, {passive:true});
  window.addEventListener("resize", recaler);
  ["gesturestart","gesturechange"].forEach(function(n){ document.addEventListener(n, function(e){ e.preventDefault(); }); });
})();

// Largeur réelle de l'écran: sur certains iPhone la page se calcule un peu plus large que l'écran visible (la marge de droite sort de la vue). On impose la largeur visible à toute l'application.
(function(){
  function largeur(){
    var w = window.innerWidth, vv = window.visualViewport;
    if(vv && vv.width) w = Math.min(w, vv.width);
    if(window.matchMedia && window.matchMedia("(orientation: portrait)").matches && window.screen && screen.width) w = Math.min(w, screen.width);
    document.documentElement.style.setProperty("--lw", Math.round(w) + "px");
  }
  largeur();
  window.addEventListener("resize", largeur); window.addEventListener("orientationchange", function(){ setTimeout(largeur, 250); });
  if(window.visualViewport) window.visualViewport.addEventListener("resize", largeur);
})();
