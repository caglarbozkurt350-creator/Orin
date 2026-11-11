// Orvane 0.7.14 · İş emirleri: çalışanların Claude'dan iş istekleri (Çağlar onaylar)
// Onaylanınca Belgeler\Orin\Giden\is-emri-<kim>-<zaman>.md (+ .json) yazılır.
// Tam otomatik kip: Claude Code aboneliğinde, kaynak klasörün AYRI bir git dalındaki çalışma kopyasında (git worktree) işi yapar.
// main dalına dokunulmaz; commit'i Orvane yapar; birleştirme ve yayın yalnız kod incelemesinden sonra Çağlar'ın onayıyla (etkileşimli Claude Code).
const fs = require('fs');
const path = require('path');
const { execFile, spawn } = require('child_process');

let DOCS = null, AB = null, KORU = () => [], MESGUL = null;
function init(docs, abonelik, koru) { DOCS = docs; AB = abonelik; if (koru) KORU = koru; }
const GIDEN = () => path.join(DOCS, 'Orin', 'Giden');
const p2 = n => String(n).padStart(2, '0');
function zaman(d) { d = d || new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + '-' + p2(d.getHours()) + '-' + p2(d.getMinutes()) + '-' + p2(d.getSeconds()); }
function adGuvenli(s) { return String(s || 'genel').toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'genel'; }
const DOSYA_AD = /^is-emri-[a-z0-9-]+-\d{4}(-\d\d){5}$/;

// İş emri metni: etkileşimli Claude Code oturumu da, otomatik kip de bunu okur
function emirMetni(j) {
  return '# İş emri · ' + j.baslik + '\n\n' +
    '- Kimlik: ' + j.id + '\n- İsteyen: ' + j.kimAd + ' (' + j.kim + ')\n- Tür: ' + j.tur + '\n- Onay: Çağlar, ' + new Date(j.onay).toLocaleString('tr-TR') + '\n\n' +
    '## Yapılacak iş\n' + j.metin + '\n' + (j.maddeler && j.maddeler.length ? '\n## Maddeler\n' + j.maddeler.map((m, i) => (i + 1) + '. ' + m).join('\n') + '\n' : '') +
    (j.onaylanirsa ? '\n**Onaylanırsa:** ' + j.onaylanirsa + '\n' : '') +
    '\n## Kurallar\n' +
    '- İş Orvane kaynak klasöründe AYRI bir git dalında yapılır (is-emri/…); main dalına dokunma, birleştirme (merge), push, GitHub release, EAS/OTA YOK.\n' +
    '- Gerçek veriye (Belgeler\\Orin\\Veriler, %APPDATA%\\Orin) ve kişisel dosyaya (renderer/js/kisisel.js) dokunma, okuma.\n' +
    '- Python yok; betikler Node. Yeni sürüm kalıbı: önceki fonksiyonu sarmalayarak ayrı dosyada ekle; index.html betik sırasına dikkat.\n' +
    '- Yeni testleri renderer/js/v071.js sonundaki __asyncTest zincirine ekle; `npx electron . --smoke` geçmeli.\n' +
    '- Bitince sonuç (değişen dosyalar, test sonucu, dal) isteyen çalışana bildirilir; kod incelemesi ve Çağlar onayı olmadan main\'e birleştirilmez.\n' +
    '\n## Bittiğinde (etkileşimli oturumda yapıldıysa)\n' +
    'Belgeler\\Orin\\Gelen\\is-sonuc-' + j.id + '.json dosyasına yaz: `[{"tur":"is_sonuc","id":"' + j.id + '","kim":"' + j.kim + '","durum":"yapildi","metin":"kısa sonuç"}]`\n' +
    '(durum: "inceleme" = dal hazır, inceleme bekliyor · "yapildi" = birleştirildi/yayınlandı · "red" = yapılmadı, nedeni metinde)\n';
}
function emirYaz(o) {
  o = o || {}; if (!o.id || !o.kim || !String(o.metin || '').trim()) throw new Error('İş emri eksik (kimlik, çalışan, metin)');
  fs.mkdirSync(GIDEN(), { recursive: true });
  const ad = 'is-emri-' + adGuvenli(o.kim) + '-' + zaman();
  const j = { id: String(o.id), kim: String(o.kim), kimAd: String(o.kimAd || o.kim), baslik: String(o.baslik || 'İş isteği').slice(0, 120), metin: String(o.metin).slice(0, 8000), tur: String(o.tur || 'is'),
    maddeler: Array.isArray(o.maddeler) ? o.maddeler.map(x => String(x).slice(0, 400)).slice(0, 20) : [], onaylanirsa: String(o.onaylanirsa || '').slice(0, 300), onaylanmazsa: String(o.onaylanmazsa || '').slice(0, 300),
    durum: 'onaylandi', onay: new Date().toISOString(), dosya: ad };
  fs.writeFileSync(path.join(GIDEN(), ad + '.md'), emirMetni(j), 'utf8');
  fs.writeFileSync(path.join(GIDEN(), ad + '.json'), JSON.stringify(j, null, 1), 'utf8');
  return { dosya: ad, md: path.join(GIDEN(), ad + '.md') };
}
function emirOku(ad) { if (!DOSYA_AD.test(ad || '')) throw new Error('Geçersiz iş emri adı'); return JSON.parse(fs.readFileSync(path.join(GIDEN(), ad + '.json'), 'utf8')); }
function emirGuncelle(ad, a) { const j = Object.assign(emirOku(ad), a, { guncel: new Date().toISOString() }); fs.writeFileSync(path.join(GIDEN(), ad + '.json'), JSON.stringify(j, null, 1), 'utf8'); return j; }
function emirler() { try { return fs.readdirSync(GIDEN()).filter(f => /^is-emri-.*\.json$/.test(f)).sort().map(f => { try { return JSON.parse(fs.readFileSync(path.join(GIDEN(), f), 'utf8')); } catch (e) { return null; } }).filter(Boolean); } catch (e) { return []; } }

function git(cwd, args, ms) {
  return new Promise((res, rej) => execFile('git', args, { cwd, windowsHide: true, timeout: ms || 60000, encoding: 'utf8', env: AB.temizEnv(), maxBuffer: 8 << 20 }, (e, out, err) => e ? rej(new Error('git ' + args[0] + ': ' + String(err || e.message).trim().split(/\r?\n/).pop())) : res(String(out))));
}
// Testler: çalışma kopyasında `electron . --smoke` (Orvane'nin kendisi çalıştırır, sonucu Claude'un sözüne bırakmaz)
function smoke(kay, yol) {
  const exe = path.join(kay, 'node_modules', 'electron', 'dist', 'electron.exe');
  if (!fs.existsSync(exe)) return Promise.resolve({ ok: false, calismadi: true, hatalar: ['electron bulunamadı (node_modules)'] });
  return new Promise(res => {
    let bitti = false; const p = spawn(exe, ['.', '--smoke'], { cwd: yol, env: AB.temizEnv(), windowsHide: true });
    const z = setTimeout(() => { if (!bitti) { bitti = true; try { p.kill(); } catch (e) {} res({ ok: false, hatalar: ['Test 6 dakikada bitmedi'] }); } }, 6 * 60000);
    p.on('error', e => { if (!bitti) { bitti = true; clearTimeout(z); res({ ok: false, calismadi: true, hatalar: [e.message] }); } });
    p.on('close', code => {
      if (bitti) return; bitti = true; clearTimeout(z);
      let r = {}, a = []; try { r = JSON.parse(fs.readFileSync(path.join(yol, 'test-sonuc', 'rapor.json'), 'utf8')); } catch (e) {} try { a = JSON.parse(fs.readFileSync(path.join(yol, 'test-sonuc', 'async.json'), 'utf8')); } catch (e) {}
      const T = (r.tests || []).concat(a || []);
      res({ ok: code === 0, toplam: T.length, gecen: T.filter(x => x.ok).length, hatalar: (r.errors || []).slice(0, 10) });
    });
  });
}
function istem(j) {
  return 'İş emri (Çağlar onayladı): ' + j.baslik + '\nİsteyen çalışan: ' + j.kimAd + '\n\n' + j.metin + (j.maddeler && j.maddeler.length ? '\n\nMaddeler:\n' + j.maddeler.map((m, i) => (i + 1) + '. ' + m).join('\n') : '') +
    '\n\nYöntem: önce ilgili dosyaları oku, en küçük ve güvenli değişikliği yap, gerekirse test ekle (renderer/js/v071.js sonundaki __asyncTest zinciri), sonra `npx electron . --smoke` çalıştır ve geçtiğini gör. ' +
    'Bitince Türkçe kısa rapor yaz: ne değişti (dosya listesi), neden, test sonucu, dikkat edilecekler.';
}
const SISTEM = 'Orvane geliştirme kipi (otomatik iş emri). Çalışma klasörü Orvane kaynağının AYRI bir git dalıdır; yalnız bu klasörde düzenleme yap. ' +
  'YASAK: main dalı, git commit/push/merge/checkout/reset, GitHub release, EAS/OTA, internet. Gerçek veri (Belgeler\\Orin\\Veriler, %APPDATA%\\Orin) ve renderer/js/kisisel.js okunmaz ve değiştirilmez. ' +
  'Python yok; Node kullan. Commit\'i Orvane yapacak; değişiklikler kod incelemesinden ve Çağlar onayından sonra birleştirilir. Kişisel/gizli bilgiyi rapora yazma.';

async function gelistir(o) {
  if (MESGUL) throw new Error('Şu an başka bir iş emri yapılıyor; bitince başlar');
  const j = emirOku(o && o.dosya), kay = AB.kaynak();
  if (!kay) throw new Error('Orvane kaynak klasörü bulunamadı');
  MESGUL = j.id; const t0 = Date.now();
  try {
    const dal = 'is-emri/' + adGuvenli(j.kim) + '-' + zaman().slice(0, 16), yol = path.join(DOCS, 'Orin', 'Calisma', 'gelistir', dal.replace('/', '-'));
    await git(kay, ['worktree', 'add', '-b', dal, yol, 'main'], 120000);
    try { fs.symlinkSync(path.join(kay, 'node_modules'), path.join(yol, 'node_modules'), 'junction'); } catch (e) {}
    emirGuncelle(j.dosya, { durum: 'calisiyor', dal, yol, basla: new Date().toISOString() });
    let r = null, hata = null;
    try { r = await AB.calistir({ kim: j.kim, mod: 'gelistir', cwd: yol, model: o.model || 'sonnet', maxTur: o.maxTur || 40, zamanAsimiMs: (o.sureDk || 20) * 60000, istem: istem(j), sistem: SISTEM, koru: KORU(kay) }); }
    catch (e) { hata = e; }
    const test = await smoke(kay, yol);
    await git(yol, ['add', '-A']);
    const degisen = (await git(yol, ['diff', '--cached', '--name-only'])).split(/\r?\n/).filter(Boolean);
    if (degisen.some(f => /kisisel\.js$/i.test(f))) { await git(yol, ['reset', '-q']); throw new Error('Kişisel dosyaya dokunulmuş; iş emri durduruldu, değişiklik kaydedilmedi'); }
    let commit = null;
    if (degisen.length) { await git(yol, ['commit', '-q', '-m', 'İş emri ' + j.id + ': ' + j.baslik + ' (Orvane otomatik · Claude Code · inceleme bekliyor)']); commit = (await git(yol, ['rev-parse', '--short', 'HEAD'])).trim(); }
    const s = { durum: hata ? 'hata' : degisen.length ? 'inceleme' : 'degisiklik-yok', dal, yol, degisen, commit, test, metin: r ? String(r.metin).slice(0, 6000) : '', hata: hata ? hata.message : '', kod: hata ? hata.kod || null : null,
      tur: r ? r.tur : 0, token: r ? r.token : 0, sureMs: Date.now() - t0, bitis: new Date().toISOString() };
    emirGuncelle(j.dosya, s); return s;
  } catch (e) { try { emirGuncelle(j.dosya, { durum: 'hata', hata: e.message }); } catch (er) {} throw e; }
  finally { MESGUL = null; }
}
function durum() { return { mesgul: MESGUL }; }
module.exports = { init, emirYaz, emirOku, emirGuncelle, emirler, emirMetni, gelistir, durum, smoke, adGuvenli, istem, SISTEM };
