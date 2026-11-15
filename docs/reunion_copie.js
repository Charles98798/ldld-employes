// Lecture de la copie CHIFFRÉE de la Réunion (Supabase), déchiffrée sur l'appareil. INERTE: aucun écran ne l'appelle encore.
// Pas de vraies données avant l'EFVP mise à jour et l'accord écrit de Charles: l'interrupteur « ae_reunion_lire » reste à « google » et l'essai ne contient que LDLD-901 à 903 (fictifs).
// La clé de domaine reste EN MÉMOIRE seulement (jusqu'à duree_s), jamais stockée. Au moindre doute: null (l'appelant lit Google, jamais de chiffre faux).
var RCOPIE = {cles: null, exp: 0, enCours: null};
function rcleDomaine(){
  if(RCOPIE.cles && RCOPIE.exp - Date.now() > 10000) return Promise.resolve(RCOPIE.cles);
  if(RCOPIE.enCours) return RCOPIE.enCours;
  var p = appelService({action: "cle_domaine", domaine: "ae_reunion", session: sessionGardee()}).then(function(r){
    if(r && r.code){ var e = new Error("code"); e.code = true; throw e; }   // second code requis: l'appelant ouvre la même saisie du code que le salaire
    if(!r || !r.ok || !r.cles || !r.cles.length) throw new Error("cle");
    RCOPIE.cles = r.cles; RCOPIE.exp = Date.now() + (Number(r.duree_s) || 300) * 1000; return RCOPIE.cles;
  });
  RCOPIE.enCours = p; var fin = function(){ RCOPIE.enCours = null; }; p.then(fin, fin); return p;
}
function rcopieOubli(){ RCOPIE.cles = null; RCOPIE.exp = 0; }   // à appeler à la déconnexion et à la sortie de l'écran
// cle = « LDLD-901_2026_1 ». Résout l'instantané déchiffré (objet) ou null.
function reunionCopieLire(cle){
  var C = copieEtat(sessionGardee());
  return Promise.all([copiePreparer({session: sessionGardee()}), rcleDomaine()]).then(function(){
    return guichetCopie({action: "lire", domaine: "ae_reunion_lire", cle: cle}, C);
  }).then(function(d){
    // Le texte source_t sert de donnée authentifiée: repris TEL QUEL, sans reformatage.
    return Promise.all([d, rcleDomaine()]);
  }).then(function(a){
    var d = a[0], cles = a[1];
    if(!d || !d.ok || d.vide || !d.reponse) return null;
    var rec = d.reponse, k = null; cles.forEach(function(x){ if(x.v === rec.v) k = x.kd; });
    if(!k) return null;
    return scDechiffrerAppareil(k, cle, "ae_reunion", rec);
  }).catch(function(e){ if(e && e.code) throw e; return null; });
}
// Essai fictif (console, Direction seulement): reunionCopieEssai("LDLD-901_2026_1").then(console.log)
function reunionCopieEssai(cle){ return reunionCopieLire(cle || "LDLD-901_2026_1"); }
