// Orvane · PocketBase bağlantısı (POCKETBASE_BAGLANTI.md · 1. aşama: giriş, beni hatırla, oturum yenileme)
// - Tek PocketBase örneği ana süreçte yaşar; token renderer'a hiç gitmez, log'a yazılmaz.
// - Yalnız `users` koleksiyonuyla girilir; superuser (yönetici) hesabı KULLANILMAZ.
// - "Beni hatırla": token + kullanıcı kaydı Windows şifrelemesiyle (safeStorage) pb-oturum.bin'e yazılır; şifre hiçbir yere yazılmaz.
// - Giriş ekranı yalnız sunucu oturumu açıkça reddederse (401) açılır; internet yokken kayıtlı oturumla "çevrimdışı" devam edilir.
const { app, safeStorage } = require('electron');
const fs = require('fs');
const path = require('path');
const PBmod = require('pocketbase');
const PocketBase = PBmod.default || PBmod;
const { BaseAuthStore } = PBmod;

const VARSAYILAN_URL = 'https://veri.orinorvane.com';
const KOLEKSIYON = 'users';
const ZAMAN_ASIMI = 15000;          // tek istek için en uzun bekleme (ms)
const GUN = 24 * 3600e3;            // günlük oturum yenileme
const CFG = () => path.join(app.getPath('userData'), 'pb.json');          // yalnız sunucu adresi
const SES = () => path.join(app.getPath('userData'), 'pb-oturum.bin');    // şifreli oturum

let pb = null, zamanlayici = null;
let hatirla = true;                                   // açık oturum kalıcı mı (giriş anındaki seçim)
const D = { cevrimdisi: false, sonYenileme: 0, sonHata: '' };
const dinleyiciler = [];

// ---------- Ayar (sunucu adresi) ----------
function urlTemizle(u) { return String(u || '').trim().replace(/\/+$/, ''); }
function urlGecerli(u) { return /^https:\/\/[^\s/]+/i.test(u) || /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(u); } // http yalnız bilgisayardaki yerel PocketBase için (acil durum)
function cfg() { try { const c = JSON.parse(fs.readFileSync(CFG(), 'utf8')); const u = urlTemizle(c.url); return { url: urlGecerli(u) ? u : VARSAYILAN_URL }; } catch (e) { return { url: VARSAYILAN_URL }; } }

// ---------- Oturum dosyası ----------
function sifrelemeVar() { try { return safeStorage.isEncryptionAvailable(); } catch (e) { return false; } }
function oturumOku() { try { const s = JSON.parse(safeStorage.decryptString(fs.readFileSync(SES()))); return s && s.token ? s : null; } catch (e) { return null; } }
function oturumSil() { try { fs.unlinkSync(SES()); } catch (e) {} }
function oturumYaz() {
  const a = pb && pb.authStore;
  if (!a || !a.token || !hatirla || !sifrelemeVar()) { oturumSil(); return; }
  const tmp = SES() + '.tmp';
  fs.writeFileSync(tmp, safeStorage.encryptString(JSON.stringify({ url: pb.baseURL, token: a.token, record: a.record, ts: Date.now() })));
  fs.renameSync(tmp, SES());
}

// ---------- İstemci ----------
function istemciKur() {
  if (pb) pb.authStore.clear();
  pb = new PocketBase(cfg().url, new BaseAuthStore());
  pb.autoCancellation(false);                         // ana süreçte aynı anda gelen istekler birbirini iptal etmesin
  pb.beforeSend = (url, options) => { if (!options.signal) options.signal = AbortSignal.timeout(ZAMAN_ASIMI); return { url, options }; };
  const s = oturumOku();
  if (s && urlTemizle(s.url) === urlTemizle(pb.baseURL) && s.record && s.record.collectionName === KOLEKSIYON) { hatirla = true; pb.authStore.save(s.token, s.record); }
  else if (s) oturumSil();                            // başka sunucuya ait ya da bozuk oturum
}
function istemci() { if (!pb) istemciKur(); return pb; }

// ---------- Hata çevirisi ----------
function agHatasi(e) { return !e || !e.status || e.isAbort; } // status 0: sunucuya hiç ulaşılamadı / zaman aşımı
function hataMetni(e) {
  if (agHatasi(e)) return 'Sunucuya ulaşılamıyor';
  if (e.status === 400) return 'E-posta ya da şifre yanlış';
  if (e.status === 401) return 'Oturum süresi doldu, yeniden giriş yap';
  if (e.status === 403) return 'Bu hesabın erişim izni yok';
  if (e.status === 429) return 'Çok fazla deneme yapıldı, biraz bekleyip tekrar dene';
  if (e.status >= 500) return 'Sunucu şu an yanıt veremiyor (' + e.status + ')';
  return (e.response && e.response.message) || ('Sunucu hatası (' + e.status + ')');
}

// ---------- Durum (renderer'a giden; token içermez) ----------
function durum() {
  const p = istemci(), r = p.authStore.record || null;
  return {
    girisli: !!p.authStore.token,
    eposta: r ? (r.email || r.username || '') : '',
    ad: r ? (r.name || r.ad || '') : '',
    url: p.baseURL, varsayilanUrl: VARSAYILAN_URL,
    hatirla: !!(p.authStore.token && hatirla && sifrelemeVar()),
    sifreleme: sifrelemeVar(),
    cevrimdisi: D.cevrimdisi, sonYenileme: D.sonYenileme, sonHata: D.sonHata
  };
}
function bildir() { const d = durum(); dinleyiciler.forEach(fn => { try { fn(d); } catch (e) {} }); return d; }
function degisti(fn) { dinleyiciler.push(fn); }

// ---------- İşlemler ----------
async function giris({ eposta, sifre, hatirla: h } = {}) {
  eposta = String(eposta || '').trim();
  if (!eposta || !sifre) throw new Error('E-posta ve şifreyi yaz');
  const p = istemci();
  try { await p.collection(KOLEKSIYON).authWithPassword(eposta, String(sifre)); }
  catch (e) { if (agHatasi(e)) D.cevrimdisi = true; throw new Error(hataMetni(e)); }
  if (!p.authStore.record || p.authStore.record.collectionName !== KOLEKSIYON || p.authStore.isSuperuser) { p.authStore.clear(); oturumSil(); throw new Error('Yalnız Orvane kullanıcı hesabıyla girilebilir'); }
  hatirla = h !== false;
  oturumYaz();
  Object.assign(D, { cevrimdisi: false, sonYenileme: Date.now(), sonHata: '' });
  return bildir();
}

// Açılışta, 24 saatte bir ve uykudan uyanınca çağrılır. Yalnız 401 oturumu kapatır; ağ hatasında oturum korunur.
let yenileniyor = null;
function yenile() {
  if (yenileniyor) return yenileniyor;
  const p = istemci();
  if (!p.authStore.token) return Promise.resolve(durum());
  yenileniyor = p.collection(KOLEKSIYON).authRefresh()
    .then(() => { oturumYaz(); Object.assign(D, { cevrimdisi: false, sonYenileme: Date.now(), sonHata: '' }); })
    .catch(e => {
      if (e && e.status === 401) { p.authStore.clear(); oturumSil(); Object.assign(D, { cevrimdisi: false, sonHata: hataMetni(e) }); }
      else Object.assign(D, { cevrimdisi: agHatasi(e), sonHata: hataMetni(e) });
    })
    .then(() => { yenileniyor = null; return bildir(); });
  return yenileniyor;
}

function cikis() { istemci().authStore.clear(); oturumSil(); Object.assign(D, { cevrimdisi: false, sonHata: '' }); return bildir(); }

// Sunucu adresi değişirse eski oturum o sunucuya ait olduğu için kapanır
function setCfg({ url } = {}) {
  const u = urlTemizle(url) || VARSAYILAN_URL;
  if (!urlGecerli(u)) throw new Error('Adres https:// ile başlamalı (yerel sunucu için http://127.0.0.1:8090)');
  const eski = istemci().baseURL;
  fs.writeFileSync(CFG(), JSON.stringify({ url: u }));
  if (urlTemizle(eski) !== u) { oturumSil(); istemciKur(); Object.assign(D, { cevrimdisi: false, sonHata: '' }); }
  return bildir();
}

// Sunucu ayakta mı (yedek mod algılaması 7. aşamada bunu kullanacak)
async function saglik() { try { await istemci().health.check(); return true; } catch (e) { return false; } }

function baslat({ otomatik = true } = {}) {
  istemciKur();
  if (!otomatik) return;
  yenile();
  clearInterval(zamanlayici);
  zamanlayici = setInterval(yenile, GUN);
}

module.exports = { baslat, durum, giris, yenile, cikis, setCfg, saglik, degisti, VARSAYILAN_URL, _test: { istemciKur, SES, CFG } };
