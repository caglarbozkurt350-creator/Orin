// Orvane · kurulum dosyalarını arşivler: Belgeler\Orin\Kurulum Dosyaları PC\Sürüm X.Y.Z\ (masaüstü) ve ...\APK\Sürüm X.Y.Z\ (telefon)
// - Masaüstü kurulum dosyası (dist\Orvane-Kurulum-X.Y.Z.exe) kopyalanır
// - Aynı sürümün telefon APK'sı (mobil/apk.json) indirilir
// Kullanım: npm run arsivle  (npm run dist sonunda kendiliğinden çalışır)
const fs = require('fs');
const os = require('os');
const path = require('path');

const KOK = path.join(__dirname, '..');
const v = JSON.parse(fs.readFileSync(path.join(KOK, 'package.json'), 'utf8')).version;
const ANA = path.join(os.homedir(), 'Documents', 'Orin', 'Kurulum Dosyaları PC');
const HEDEF = path.join(ANA, 'Sürüm ' + v), APKD = path.join(ANA, 'APK');

async function main() {
  fs.mkdirSync(HEDEF, { recursive: true });
  const yaz = [];
  const exe = path.join(KOK, 'dist', 'Orvane-Kurulum-' + v + '.exe');
  if (fs.existsSync(exe)) { fs.copyFileSync(exe, path.join(HEDEF, path.basename(exe))); yaz.push('Masaüstü: ' + path.basename(exe)); }
  else yaz.push('Masaüstü kurulum dosyası bulunamadı (önce derle): ' + exe);

  let apk = null; try { apk = JSON.parse(fs.readFileSync(path.join(KOK, 'mobil', 'apk.json'), 'utf8')); } catch (e) {}
  if (apk && apk.url) {
    const asv = apk.surum || v, ad2 = path.join(APKD, 'Sürüm ' + asv); fs.mkdirSync(ad2, { recursive: true });
    const ad = 'Orvane-Mobil-' + asv + '.apk', yol = path.join(ad2, ad);
    if (!fs.existsSync(yol)) {
      const r = await fetch(apk.url);
      if (!r.ok) throw new Error('APK indirilemedi: HTTP ' + r.status);
      fs.writeFileSync(yol, Buffer.from(await r.arrayBuffer()));
    }
    yaz.push('Telefon: ' + path.join('APK', 'Sürüm ' + asv, ad) + (apk.surum && apk.surum !== v ? ' (son APK; ' + v + ' telefona uzaktan güncellemeyle gelir)' : ''));
  }
  fs.writeFileSync(path.join(HEDEF, 'OKU.txt'),
    'Orvane ' + v + '\r\n\r\n' + yaz.join('\r\n') + '\r\n\r\n' +
    'Masaüstü sürüm sayfası: https://github.com/caglarbozkurt350-creator/Orin/releases/tag/v' + v + '\r\n' +
    'Kurulu Orvane güncellemeyi kendisi bulur; bu klasör yedek ve elle kurulum içindir.\r\n' +
    'Telefon: APK yalnız ilk kurulumda ya da "Yeni sürüm var" uyarısında gerekir; diğer düzeltmeler uzaktan gelir.\r\n');
  console.log('Arşivlendi: ' + HEDEF + '\n  ' + yaz.join('\n  '));
}
main().catch((e) => { console.error('Arşiv hatası: ' + e.message); process.exit(1); });
