/**
 * LDLD — Service application employés (connexion par code courriel, version application installable).
 * Ce fichier est un brouillon dans le dossier du projet; rien n'a été envoyé à Google.
 * Rôle : vérifier le jeton Google de l'employé, retrouver son courriel dans l'onglet Employés,
 * et répondre seulement avec SES données. Jamais de données d'un autre employé.
 */
var CONFIG = {
  CLASSEUR_ID: '11vL_jmBued_zH5Y0kzNSVNHyTMFJBcCfJ2rhWEliL3o',   // classeur « Direction » (ancien SALAIRE), lu en lecture seule
  ONGLET_CONTACTS: 'Contacts évaluations — actuelle',   // les courriels des employés y sont (colonne C); l'onglet Employés n'a pas de courriel
  ONGLET_EMPLOYES: 'Employés — actuelle',                // source de vérité : ID (A), Nom (B), Catégorie (C), ligne d'en-tête 6
  LIGNE_ENTETE_CONTACTS: 6,                              // Catégorie | Employé | Courriel | Téléphone | Responsable | ...
  COL_CATEGORIE: 0, COL_NOM: 1, COL_COURRIEL: 2, COL_RESPONSABLE: 4,
  CLIENT_ID_GOOGLE: '119628465733-bj1vpk49ofto8391c16qpnctl9jo2n1b.apps.googleusercontent.com',                         // identifiant OAuth à créer dans Google Cloud (compte de l'entreprise)
  DOMAINE: 'lafonddesjardins.com'
};

/** Point d'entrée : l'application envoie {action, ...}. Connexion par code courriel; aucune donnée sans session valide. */
function doPost(e) {
  try {
    var q = JSON.parse(e.postData.contents);
    if (q.action === 'code') return json_(demanderCode_(String(q.courriel || '')));
    if (q.action === 'verifier') return json_(verifierCode_(String(q.courriel || ''), String(q.code || '')));
    var courriel = courrielSession_(q.session);
    var emp = employe_(courriel);
    if (!emp) return json_({ok: false, erreur: 'Accès refusé.'});
    if (q.action === 'moi') return json_({ok: true, nom: emp.nom, poste: emp.poste, responsable: emp.responsable});
    if (q.action === 'sortie') { supprimerSession_(q.session); return json_({ok: true}); }
    return json_({ok: false, erreur: 'Action inconnue.'});
  } catch (err) {
    return json_({ok: false, erreur: 'Accès refusé.'});   // aucun détail technique renvoyé
  }
}

/** ---- Connexion par code à 6 chiffres envoyé au courriel LDLD de l'employé ---- */
var DUREE_CODE_S = 600;            // le code vit 10 minutes
var DUREE_SESSION_MS = 180 * 24 * 3600 * 1000;  // session : 180 jours, prolongée à chaque utilisation
function hash_(txt) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, txt).map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}
/** Répond toujours pareil (ok), qu'il existe ou non, pour ne pas révéler qui est employé. */
function demanderCode_(courriel) {
  courriel = courriel.toLowerCase().trim();
  if (courriel.split('@')[1] !== CONFIG.DOMAINE) return {ok: true};
  var cache = CacheService.getScriptCache();
  var nb = Number(cache.get('n_' + courriel) || 0);
  if (nb >= 5) return {ok: true};                 // 5 demandes par heure au maximum
  cache.put('n_' + courriel, String(nb + 1), 3600);
  if (!employe_(courriel)) return {ok: true};
  var code = ('000000' + Math.floor(Math.random() * 1000000)).slice(-6);
  cache.put('c_' + courriel, hash_(code + courriel), DUREE_CODE_S);
  cache.remove('t_' + courriel);
  MailApp.sendEmail({
    to: courriel,
    subject: 'Votre code de connexion LDLD : ' + code,
    body: 'Bonjour,\n\nVotre code de connexion à l\'application LDLD est : ' + code + '\n\nIl est valide 10 minutes. Si vous n\'avez rien demandé, ignorez ce message.\n\nLafond Desjardins laboratoire dentaire',
    name: 'LDLD — Application employés'
  });
  return {ok: true};
}
function verifierCode_(courriel, code) {
  courriel = courriel.toLowerCase().trim();
  var cache = CacheService.getScriptCache();
  var essais = Number(cache.get('t_' + courriel) || 0);
  var attendu = cache.get('c_' + courriel);
  if (!attendu || essais >= 5) return {ok: false, erreur: 'Code invalide ou expiré.'};
  if (hash_(String(code).trim() + courriel) !== attendu) { cache.put('t_' + courriel, String(essais + 1), DUREE_CODE_S); return {ok: false, erreur: 'Code invalide ou expiré.'}; }
  cache.remove('c_' + courriel);
  var emp = employe_(courriel);
  if (!emp) return {ok: false, erreur: 'Accès refusé.'};
  var session = Utilities.getUuid() + Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty('s_' + hash_(session), JSON.stringify({c: courriel, e: Date.now() + DUREE_SESSION_MS}));
  nettoyerSessions_();
  return {ok: true, session: session, nom: emp.nom, poste: emp.poste, responsable: emp.responsable};
}
function courrielSession_(session) {
  var cle = 's_' + hash_(String(session || ''));
  var pr = PropertiesService.getScriptProperties();
  var v = pr.getProperty(cle);
  if (!v) throw new Error('session');
  var o = JSON.parse(v);
  if (o.e < Date.now()) throw new Error('expirée');
  if (o.e - Date.now() < DUREE_SESSION_MS - 24 * 3600 * 1000) pr.setProperty(cle, JSON.stringify({c: o.c, e: Date.now() + DUREE_SESSION_MS}));   // prolongée au plus une fois par jour
  return o.c;
}
function supprimerSession_(session) { PropertiesService.getScriptProperties().deleteProperty('s_' + hash_(String(session || ''))); }
function nettoyerSessions_() {
  var pr = PropertiesService.getScriptProperties(), tout = pr.getProperties();
  Object.keys(tout).forEach(function (k) { if (k.indexOf('s_') === 0) { try { if (JSON.parse(tout[k]).e < Date.now()) pr.deleteProperty(k); } catch (x) { pr.deleteProperty(k); } } });
}

/** Vérifie le jeton Google auprès de Google et renvoie le courriel confirmé du domaine LDLD. */
function courrielVerifie_(jeton) {
  var r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(jeton), {muteHttpExceptions: true});
  if (r.getResponseCode() !== 200) throw new Error('jeton');
  var t = JSON.parse(r.getContentText());
  if (t.aud !== CONFIG.CLIENT_ID_GOOGLE || t.email_verified !== 'true') throw new Error('jeton');
  var c = String(t.email || '').toLowerCase();
  if (c.split('@')[1] !== CONFIG.DOMAINE) throw new Error('domaine');
  return c;
}

/** Cherche l'employé actuel : courriel dans Contacts évaluations, puis ID dans Employés (même nom). */
function employe_(courriel) {
  var classeur = SpreadsheetApp.openById(CONFIG.CLASSEUR_ID);
  var lc = classeur.getSheetByName(CONFIG.ONGLET_CONTACTS).getDataRange().getValues();
  var trouve = null;
  for (var i = CONFIG.LIGNE_ENTETE_CONTACTS; i < lc.length; i++) {
    if (String(lc[i][CONFIG.COL_COURRIEL]).toLowerCase().trim() === courriel) { trouve = lc[i]; break; }
  }
  if (!trouve) return null;
  var nom = String(trouve[CONFIG.COL_NOM]).trim();
  var le = classeur.getSheetByName(CONFIG.ONGLET_EMPLOYES).getDataRange().getValues();
  for (var j = 6; j < le.length; j++) {
    if (String(le[j][1]).trim().toUpperCase() === nom.toUpperCase())
      return {id: le[j][0], nom: nom, poste: trouve[CONFIG.COL_CATEGORIE], responsable: trouve[CONFIG.COL_RESPONSABLE]};
  }
  return null;   // dans Contacts mais plus dans Employés : accès refusé
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** Page de contrôle : ouvrir l'adresse du service dans un navigateur affiche seulement « actif ». Aucune donnée. */
function doGet() { return ContentService.createTextOutput('LDLD service application employés : actif'); }
