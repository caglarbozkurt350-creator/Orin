// Orvane GitHub release (kullanım: node tools/yayin.js 0.7.20 notlar.md — notlar dosyası depoya girmez): yayınsız derlenmiş dosyaları yükler, latest.yml + sha512 + boyut doğrular. Belirteç yazdırılmaz.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process'), crypto = require('crypto');
const V = process.argv[2], NOT = process.argv[3], KAY = 'C:/Users/PC/Documents/Cloude Dosyaları/is-raporu', REPO = 'caglarbozkurt350-creator/Orin';
if (!V || !NOT) { console.log('kullanım: node yayin.js 0.7.15 notlar.md'); process.exit(1); }
const cred = execFileSync('git', ['credential', 'fill'], { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8' });
const TOKEN = (cred.match(/^password=(.*)$/m) || [])[1]; if (!TOKEN) { console.log('GitHub belirteci yok'); process.exit(1); }
const H = { Authorization: 'Bearer ' + TOKEN, Accept: 'application/vnd.github+json', 'User-Agent': 'orvane-yayin' };
const dist = path.join(KAY, 'dist'), exe = 'Orvane-Kurulum-' + V + '.exe', dosyalar = [exe, exe + '.blockmap', 'latest.yml'];
(async () => {
  const yml = fs.readFileSync(path.join(dist, 'latest.yml'), 'utf8');
  if (!yml.includes('version: ' + V)) throw new Error('latest.yml sürümü ' + V + ' değil');
  const sha = crypto.createHash('sha512').update(fs.readFileSync(path.join(dist, exe))).digest('base64'), boy = fs.statSync(path.join(dist, exe)).size;
  if (!yml.includes(sha) || !yml.includes('size: ' + boy)) throw new Error('latest.yml yerel exe ile eşleşmiyor');
  let r = await fetch('https://api.github.com/repos/' + REPO + '/releases/tags/v' + V, { headers: H });
  let rel = r.ok ? await r.json() : null;
  if (!rel) {
    r = await fetch('https://api.github.com/repos/' + REPO + '/releases', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, H), body: JSON.stringify({ tag_name: 'v' + V, target_commitish: 'main', name: 'Orvane ' + V, body: fs.readFileSync(NOT, 'utf8'), draft: false, prerelease: false, make_latest: 'true' }) });
    if (!r.ok) throw new Error('release açılamadı: ' + r.status + ' ' + (await r.text()).slice(0, 300));
    rel = await r.json(); console.log('release açıldı:', rel.html_url);
  } else console.log('release zaten var:', rel.html_url);
  for (const f of dosyalar) {
    if ((rel.assets || []).some(a => a.name === f)) { console.log('zaten yüklü:', f); continue; }
    const buf = fs.readFileSync(path.join(dist, f));
    const u = rel.upload_url.replace(/\{.*$/, '') + '?name=' + encodeURIComponent(f);
    const y = await fetch(u, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/octet-stream', 'Content-Length': String(buf.length) }, H), body: buf });
    if (!y.ok) throw new Error(f + ' yüklenemedi: ' + y.status + ' ' + (await y.text()).slice(0, 200));
    console.log('yüklendi:', f, buf.length);
  }
  // Doğrulama: herkese açık latest/download/latest.yml yerelle aynı mı, exe boyutu doğru mu
  const lt = await fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: H }).then(x => x.json());
  console.log('latest release:', lt.tag_name);
  const ly = lt.assets.find(a => a.name === 'latest.yml'), le = lt.assets.find(a => a.name === exe);
  const uz = await fetch(ly.url, { headers: Object.assign({}, H, { Accept: 'application/octet-stream' }) }).then(x => x.text());
  console.log('latest.yml eşleşiyor:', uz.trim() === yml.trim(), '| sha512 içinde:', uz.includes(sha), '| exe boyutu:', le && le.size === boy);
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
