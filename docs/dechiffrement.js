/** Déchiffrement WebCrypto des enregistrements chiffrés (copie Supabase). Aucune dépendance, aucune clé stockée.
 * kdB64 = clé de domaine remise par « cle_domaine » (en mémoire seulement). Retourne l'objet, ou null à la moindre anomalie. */
async function scDechiffrerAppareil(kdB64, employe, domaine, rec, clesEmploye) {
  try {
    if (!rec || rec.alg !== 'AES-256-CTR+HMAC-SHA256') return null;
    var b64 = function (t) { t = String(t).replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; var s = atob(t), o = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) o[i] = s.charCodeAt(i); return o; };
    var te = new TextEncoder(), sub = crypto.subtle;
    var hm = async function (cle, donnees) {
      var k = await sub.importKey('raw', cle, {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
      return new Uint8Array(await sub.sign('HMAC', k, typeof donnees === 'string' ? te.encode(donnees) : donnees));
    };
    var enc, mac;
    if (clesEmploye) { enc = b64(clesEmploye.enc); mac = b64(clesEmploye.mac); }
    else { var kd = b64(kdB64); enc = await hm(kd, 'enc|' + employe); mac = await hm(kd, 'mac|' + employe); }
    var iv = b64(rec.iv), ct = b64(rec.ct), tag = b64(rec.tag);
    if (iv.length !== 12 || ct.length % 4096 !== 0) return null;
    var aad = te.encode(JSON.stringify([String(employe), String(domaine), Number(rec.v), String(rec.source_t), String(rec.ref || '')]));
    var corps = new Uint8Array(aad.length + iv.length + ct.length); corps.set(aad, 0); corps.set(iv, aad.length); corps.set(ct, aad.length + iv.length);
    var att = await hm(mac, corps), diff = att.length ^ tag.length;
    for (var j = 0; j < att.length && j < tag.length; j++) diff |= att[j] ^ tag[j];
    if (diff !== 0) return null;
    var cle = await sub.importKey('raw', enc, 'AES-CTR', false, ['decrypt']), compteur = new Uint8Array(16); compteur.set(iv, 0);
    var clair = new Uint8Array(await sub.decrypt({name: 'AES-CTR', counter: compteur, length: 32}, cle, ct));
    var n = (clair[0] * 16777216) + (clair[1] << 16) + (clair[2] << 8) + clair[3];
    if (n < 0 || n > clair.length - 4) return null;
    return JSON.parse(new TextDecoder().decode(clair.slice(4, 4 + n)));
  } catch (e) { return null; }
}
