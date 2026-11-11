// Orvane · onaylı sürümler listesi ve önceki onaylı sürüme dönüş (ana süreç)
// Liste: depodaki onayli-surumler.json (GitHub main'den güncel hali, olmazsa uygulamayla gelen kopya).
// Kurulum dosyası o sürümün GitHub release'indeki latest.yml'den bulunur ve sha512 ile doğrulanır.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Readable, Transform } = require('stream');
const { pipeline } = require('stream/promises');

const REPO = 'caglarbozkurt350-creator/Orin';
const LISTE_URL = 'https://raw.githubusercontent.com/' + REPO + '/main/onayli-surumler.json';
const SURUM_RE = /^\d+\.\d+\.\d+$/;

function karsilastir(a, b) {
  const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
}
// Şu ankinden eski onaylı sürümler, yeniden eskiye
function oncekiler(liste, cur) {
  return ((liste && liste.surumler) || []).filter(s => s && SURUM_RE.test(s.v) && karsilastir(s.v, cur) < 0).sort((a, b) => karsilastir(b.v, a.v));
}
// electron-builder latest.yml: path + sha512 (base64)
function ymlOku(t) {
  const p = /^path:\s*(.+)$/m.exec(t || ''), s = /^sha512:\s*(.+)$/m.exec(t || '');
  return p && s ? { path: p[1].trim().replace(/^['"]|['"]$/g, ''), sha512: s[1].trim().replace(/^['"]|['"]$/g, '') } : null;
}
async function liste(cur, yerel, cevrimdisi) {
  let l = null, kaynak = 'github';
  if (!cevrimdisi) { try { const r = await fetch(LISTE_URL + '?t=' + Date.now(), { cache: 'no-store' }); if (r.ok) l = await r.json(); } catch (e) {} }
  if (!l || !Array.isArray(l.surumler)) { l = yerel; kaynak = 'yerel'; }
  return { kaynak, surumler: oncekiler(l, cur) };
}
async function indir(v, dir, ilerle) {
  if (!SURUM_RE.test(v)) throw new Error('Geçersiz sürüm');
  const base = 'https://github.com/' + REPO + '/releases/download/v' + v + '/';
  const yr = await fetch(base + 'latest.yml');
  if (!yr.ok) throw new Error('Sürüm bilgisi alınamadı (' + yr.status + ')');
  const y = ymlOku(await yr.text());
  if (!y || /[\\/]/.test(y.path) || !/\.exe$/i.test(y.path)) throw new Error('Sürüm bilgisi okunamadı');
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, y.path), part = f + '.part';
  const r = await fetch(base + encodeURIComponent(y.path));
  if (!r.ok || !r.body) throw new Error('Kurulum dosyası indirilemedi (' + r.status + ')');
  const top = +r.headers.get('content-length') || 0, h = crypto.createHash('sha512');
  let n = 0, son = 0;
  const say = new Transform({ transform(c, enc, cb) { h.update(c); n += c.length; if (ilerle && Date.now() - son > 300) { son = Date.now(); ilerle(n, top); } cb(null, c); } });
  await pipeline(Readable.fromWeb(r.body), say, fs.createWriteStream(part));
  if (h.digest('base64') !== y.sha512) { try { fs.unlinkSync(part); } catch (e) {} throw new Error('Kurulum dosyası doğrulanamadı (sha512 uyuşmadı)'); }
  try { fs.unlinkSync(f); } catch (e) {}
  fs.renameSync(part, f);
  if (ilerle) ilerle(n, top || n);
  return f;
}

module.exports = { karsilastir, oncekiler, ymlOku, liste, indir, REPO };
