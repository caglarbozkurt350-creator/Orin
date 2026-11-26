// Orvane 0.9.11 · Geliştirme fikirleri + Claude Design tasarımları (tek düğme: masaüstü Anasayfa ya da telefon)
// Düğmeye basılınca Orvane kaynak klasöründen güncel bağlamı toplar (sürüm notları, git geçmişi, önerilmiş ve onaylanmış fikirler, tema),
// bundan bir görev prompt'u yazar (Belgeler\Orin\Giden\gelistirme-fikirleri-<zaman>.md) ve Claude Code'u aboneliğinde "tasarim" kipinde çalıştırır:
// Claude kaynağı yalnız okur, fikirleri çıkarır ve tasarımlarını Artifact aracıyla Claude Design tuvaline yayınlar. Kodda değişiklik yapmaz.
// Claude Code çalışamazsa (kurulu değil, giriş yok, araç yok) prompt dosyası yine durur; Çağlar onu panoya kopyalayıp Claude'a yapıştırabilir.
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

let DOCS = null, AB = null, KORU = () => [], MESGUL = null;
function init(docs, abonelik, koru) { DOCS = docs; AB = abonelik; if (koru) KORU = koru; }
const GIDEN = () => path.join(DOCS, 'Orin', 'Giden');
const p2 = n => String(n).padStart(2, '0');
function zaman(d) { d = d || new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + '-' + p2(d.getHours()) + '-' + p2(d.getMinutes()) + '-' + p2(d.getSeconds()); }
const AD = /^gelistirme-fikirleri-\d{4}(-\d\d){5}$/;
const LINK = /https:\/\/claude\.ai\/(?:code\/)?artifact\/[A-Za-z0-9_-]+/;

function oku(f) { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return ''; } }
function json(f) { try { return JSON.parse(oku(f)); } catch (e) { return null; } }
function semver(a, b) { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); return 0; }
function kisalt(t, n) { t = String(t || '').trim(); return t.length > n ? t.slice(0, n) + '…' : t; }
function gitLog(kay) {
  return new Promise(res => execFile('git', ['log', '--no-merges', '--format=%h %ad %s', '--date=short', '-40'], { cwd: kay, windowsHide: true, timeout: 20000, encoding: 'utf8', env: AB && AB.temizEnv ? AB.temizEnv() : process.env },
    (e, out) => res(e ? '' : String(out).trim())));
}

// Kaynak klasörden bağlam: sürüm, son sürüm notları, git geçmişi, fikirler, onaylananlar, tema, çalışan adları (tasarımda yasak)
async function baglam(kay) {
  const pk = json(path.join(kay, 'package.json')) || {}, dir = path.join(kay, 'surum-notlari');
  let notlar = [];
  try { notlar = fs.readdirSync(dir).filter(f => /^\d+\.\d+\.\d+\.md$/.test(f)).map(f => f.slice(0, -3)).sort(semver).slice(-8).reverse(); } catch (e) {}
  const fk = json(path.join(kay, 'fikirler.json')) || { fikirler: [] }, on = json(path.join(kay, 'tasarim', 'onaylanan-fikirler.json')) || { fikirler: [] };
  const tema = json(path.join(kay, 'tasarim', 'tema.json')) || {}, cl = json(path.join(kay, 'calisanlar.json')) || { calisanlar: [] };
  return {
    surum: pk.version || '?',
    notlar: notlar.map(v => ({ v, metin: kisalt(oku(path.join(dir, v + '.md')), 1600) })),
    git: kisalt(await gitLog(kay), 4000),
    onerilen: (fk.fikirler || []).map(f => f.baslik).filter(Boolean),
    onaylanan: (on.fikirler || []).map(f => f.baslik + (f.aciklama ? ' — ' + f.aciklama : '')).filter(Boolean),
    reddedilen: (on.reddedilen || []).map(f => f.baslik + (f.aciklama ? ' — ' + f.aciklama : '')).filter(Boolean),
    temalar: Object.keys(tema.temalar || {}).map(k => tema.temalar[k].ad + ' ' + tema.temalar[k].acc).join(', '),
    adlar: (cl.calisanlar || []).map(c => c.ad).filter(Boolean)
  };
}

// Görev prompt'u: Claude Code (otomatik) da, elle yapıştırılan Claude oturumu da bunu okur
function istem(b, o) {
  o = o || {};
  const tarih = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  return '# Görev · Orvane geliştirme fikirleri ve Claude Design tasarımları\n\n' +
    'Orvane, Çağlar’ın masaüstü (Electron) ve telefon (Expo) uygulaması: iş raporu ve iş günleri, Ailem (bütçe, sağlık/ilaç, market, ev işleri, menü), bordro, piyasa (altın, döviz). ' +
    'Şu anki sürüm: **' + b.surum + '** · Tarih: ' + tarih + (o.kaynak === 'telefon' ? ' · İstek telefondan geldi.' : '') + '\n\n' +
    '## Ne yapacaksın\n' +
    '1. Aşağıdaki son sürüm notlarını ve git geçmişini oku; gerekirse kaynak kodu da oku (yalnız okuma: renderer/, mobil/src/, main.js). Programın bugün NE yaptığını ve son düzenlemelerin hangi yöne gittiğini anla.\n' +
    '2. Bunlara dayanarak **5 geliştirme fikri** çıkar. Her fikir son düzenlemelerden birinin üzerine kurulsun (hangisi olduğunu yaz), günlük kullanımda gerçek bir sorunu çözsün ve bugünkü veriyle yapılabilsin.\n' +
    '   - Aşağıda “Önerilmiş”, “Onaylanmış” ve “İptal edilmiş” listelerindekileri TEKRAR ÖNERME (iptal edilenlerin benzerini de); onaylanmışların üzerine kurabilirsin.\n' +
    '   - Yapay zekâ çalışanları/ekip özelliği büyütülmeyecek; fikirler doğrudan kullanıcıya hizmet etsin.\n' +
    '3. Fikirlerin tasarımlarını **Claude Design** ile yap: Artifact aracında `action: "quickstart"`, `intent: "design"` ile başla, Design tipinden YENİ bir tuval aç ' +
    '(başlık: “Orvane geliştirme fikirleri · ' + tarih + '”) ve tipin talimatlarına uyarak her fikir için bir artboard çiz. Dosyaları yalnız bu çalışma klasörüne yaz.\n' +
    '   - Masaüstü ekranları 1440 genişlikte sayfa (expand fill), telefon ekranları 390×844. En az bir telefon ekranı olsun.\n' +
    '   - Tasarımı bitirdikten sonra kontrol, ekran görüntüsü ya da tarayıcı açma YOK.\n\n' +
    '## Tasarım kuralları\n' +
    '- **Tasarımlarda ekip YOK:** çalışan adları (' + (b.adlar.length ? b.adlar.join(', ') : 'Orin, Orla, Echo, Otto…') + '), çalışan avatarları, “Ekip” menüsü ve onay kartları görünmez. Kartlar konuyla adlanır: “Sabah brifingi”, “Yaklaşanlar”, “Kalan ödemeler”.\n' +
    '- Orvane’nin görünümü: koyu zemin #19191b, metin #f2f2f3 / #a9a9b0, cam kart rgba(255,255,255,.06) + kenar rgba(255,255,255,.10), kart yarıçapı 22px, düğme 22px (hap), ' +
    'vurgu turuncu #ff5b37 / #ffb020' + (b.temalar ? ' (öteki temalar: ' + b.temalar + ')' : '') + ', durum yeşil #3ecf5a, uyarı #f5a524. Yazı: Inter (gövde), Space Grotesk (başlık ve rakam).\n' +
    '- Türkçe metin; gerçek kişisel veri yok: tutarlar ve saatler örnek, ekranda “Tutarlar örnektir.” notu.\n' +
    '- Dokunma hedefleri ≥44px, metin kontrastı ≥4.5:1, simgeler ince çizgili SVG (emoji yok).\n\n' +
    '## Yasaklar\n' +
    '- Orvane kaynak dosyalarını DEĞİŞTİRME (yalnız oku). git commit/push, yayın, EAS/OTA yok.\n' +
    '- Gerçek veri (Belgeler\\Orin\\Veriler, Belgelerim, %APPDATA%\\Orin) ve renderer/js/kisisel.js okunmaz.\n\n' +
    '## Bitince cevabın (Türkçe, bu biçimde)\n' +
    'İlk satır: `TASARIM: <Claude Design tuvalinin linki>` (tuval açılamadıysa `TASARIM: yok — <neden>`).\n' +
    'Sonra her fikir için: `1. <başlık> — <bir cümle ne getirir> · Dayandığı düzenleme: <sürüm/özellik> · Zorluk: kolay|orta|zor`.\n' +
    'En sonda şu JSON bloğu (Orvane okuyup fikir listesine ekler):\n' +
    '```json\n{"fikirler":[{"id":"kisa-kimlik","baslik":"…","aciklama":"…","onaylanirsa":"…","onaylanmazsa":"…"}]}\n```\n\n' +
    '## Bağlam\n\n### Önerilmiş (tekrar önerme)\n' + (b.onerilen.length ? b.onerilen.map(x => '- ' + x).join('\n') : '- (yok)') + '\n\n' +
    '### Onaylanmış, sırada (tekrar önerme)\n' + (b.onaylanan.length ? b.onaylanan.map(x => '- ' + x).join('\n') : '- (yok)') + '\n\n' +
    '### İptal edilmiş (Çağlar istemedi; benzerini de önerme)\n' + ((b.reddedilen || []).length ? b.reddedilen.map(x => '- ' + x).join('\n') : '- (yok)') + '\n\n' +
    '### Son sürüm notları (yeniden eskiye)\n' + (b.notlar.length ? b.notlar.map(n => n.metin).join('\n\n') : '(okunamadı)') + '\n\n' +
    '### Git geçmişi (son 40)\n```\n' + (b.git || '(okunamadı)') + '\n```\n';
}
const SISTEM = 'Orvane tasarım kipi (geliştirme fikirleri + Claude Design). Çalışma klasörün kendi klasörüdür; Orvane kaynak klasörü yalnız okunur (--add-dir). ' +
  'YASAK: kaynak dosyalarda düzenleme, Bash, git, web araması, gerçek veri (Belgeler\\Orin\\Veriler, Belgelerim, %APPDATA%\\Orin) ve renderer/js/kisisel.js. ' +
  'Tasarımı yalnız Artifact aracıyla (Claude Design) yayınla. Kişisel/gizli bilgiyi tasarıma ve rapora yazma.';

// Prompt'u yaz (Claude Code çalışmasa da elle kullanılabilsin)
async function hazirla(o) {
  const kay = AB.kaynak(); if (!kay) throw new Error('Orvane kaynak klasörü bulunamadı (Ayarlar › Yapay zekâ › Claude aboneliği › Kaynak klasörü)');
  const ad = 'gelistirme-fikirleri-' + zaman(), metin = istem(await baglam(kay), o);
  fs.mkdirSync(GIDEN(), { recursive: true });
  const md = path.join(GIDEN(), ad + '.md'); fs.writeFileSync(md, metin, 'utf8');
  return { ad, md, metin, kay };
}
function sonucYaz(ad, j) { j = Object.assign({ ad, guncel: new Date().toISOString() }, j); fs.writeFileSync(path.join(GIDEN(), ad + '.json'), JSON.stringify(j, null, 1), 'utf8'); return j; }
// Claude'un cevabından tasarım linki ve fikir listesi
function ayikla(t) {
  t = String(t || ''); const m = t.match(LINK); let fikirler = [];
  const bl = t.match(/```json\s*([\s\S]*?)```/);
  if (bl) { try { const j = JSON.parse(bl[1]); fikirler = (j.fikirler || []).filter(f => f && f.baslik).slice(0, 10).map(f => ({ id: String(f.id || '').slice(0, 40), baslik: String(f.baslik).slice(0, 120), aciklama: String(f.aciklama || '').slice(0, 400), onaylanirsa: String(f.onaylanirsa || '').slice(0, 300), onaylanmazsa: String(f.onaylanmazsa || '').slice(0, 300) })); } catch (e) {} }
  return { link: m ? m[0] : '', fikirler, ozet: kisalt(t.replace(/```json[\s\S]*?```/g, '').trim(), 3000) };
}
async function calistir(o) {
  o = o || {};
  if (MESGUL) throw new Error('Geliştirme fikirleri zaten hazırlanıyor');
  MESGUL = Date.now();
  let h = null;
  try {
    h = await hazirla(o);
    const cwd = path.join(DOCS, 'Orin', 'Calisma', 'fikir-tasarim', h.ad); fs.mkdirSync(cwd, { recursive: true });
    sonucYaz(h.ad, { durum: 'calisiyor', kaynak: o.kaynak || 'masaustu', basla: new Date().toISOString(), md: h.md });
    const r = await (AB.calistirIzle || AB.calistir)({ etiket: 'Geliştirme fikirleri ve tasarım', kim: 'genel', mod: 'tasarim', cwd, kaynak: h.kay, koru: KORU(h.kay),
      model: o.model || 'sonnet', maxTur: o.maxTur || 60, zamanAsimiMs: (o.sureDk || 30) * 60000, istem: h.metin, sistem: SISTEM });
    const a = ayikla(r.metin);
    return sonucYaz(h.ad, { durum: a.link ? 'hazir' : 'tasarimsiz', kaynak: o.kaynak || 'masaustu', md: h.md, link: a.link, fikirler: a.fikirler, metin: a.ozet, token: r.token || 0, bitis: new Date().toISOString() });
  } catch (e) {
    if (h) { try { return sonucYaz(h.ad, { durum: 'hata', kaynak: o.kaynak || 'masaustu', md: h.md, hata: e.message, bitis: new Date().toISOString() }); } catch (er) {} }
    throw e;
  } finally { MESGUL = null; }
}
function son() {
  try {
    const f = fs.readdirSync(GIDEN()).filter(x => /^gelistirme-fikirleri-.*\.json$/.test(x)).sort().pop(); if (!f) return null;
    const j = JSON.parse(fs.readFileSync(path.join(GIDEN(), f), 'utf8'));
    if (j.durum === 'calisiyor' && !MESGUL) j.durum = 'hata', j.hata = j.hata || 'Orvane kapanınca yarıda kaldı';
    return j;
  } catch (e) { return null; }
}
function istemOku(ad) { if (!AD.test(ad || '')) throw new Error('Geçersiz prompt adı'); return fs.readFileSync(path.join(GIDEN(), ad + '.md'), 'utf8'); }
function durum() { return { mesgul: !!MESGUL, basla: MESGUL, son: son() }; }
module.exports = { init, baglam, istem, hazirla, calistir, ayikla, son, istemOku, durum, SISTEM };
