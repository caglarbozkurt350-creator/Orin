// Masaüstü Orvane ile ortak dosyaları telefona kopyalar: çalışanlar, fotoğraflar, kartlar, tema, simge.
// Kullanım: npm run paylas (mobil klasöründe). Kaynak her zaman üst klasördeki masaüstü projesidir.
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..', '..'), M = path.join(__dirname, '..');
const cp = (a, b) => { fs.mkdirSync(path.dirname(b), { recursive: true }); fs.copyFileSync(a, b); };
cp(path.join(R, 'calisanlar.json'), path.join(M, 'src/veri/calisanlar.json'));
cp(path.join(R, 'tasarim/tema.json'), path.join(M, 'src/veri/tema.json'));
cp(path.join(R, 'assets/icon.png'), path.join(M, 'assets/icon.png'));
cp(path.join(R, 'assets/logo.png'), path.join(M, 'assets/logo.png'));
const satir = [];
for (const kl of ['foto', 'kartlar']) {
  const d = path.join(R, 'assets/calisanlar', kl);
  for (const f of fs.readdirSync(d)) { cp(path.join(d, f), path.join(M, 'assets/calisanlar', kl, f)); satir.push(`  '${kl}/${f}': require('../../assets/calisanlar/${kl}/${f}'),`); }
}
fs.writeFileSync(path.join(M, 'src/veri/gorseller.ts'), '// Otomatik üretilir (npm run paylas). Elle değiştirme.\nexport const GORSEL: Record<string, number> = {\n' + satir.join('\n') + '\n};\n');
const pj = JSON.parse(fs.readFileSync(path.join(R, 'package.json'), 'utf8'));
fs.writeFileSync(path.join(M, 'src/veri/surum.ts'), `// Otomatik üretilir (npm run paylas): masaüstüyle aynı sürüm\nexport const SURUM = '${pj.version}';\n`);
console.log('paylaşıldı: ' + satir.length + ' görsel, sürüm ' + pj.version);
