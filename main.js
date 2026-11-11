// Orvane · ana süreç
const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const SMOKE = process.argv.includes('--smoke');
const SEED = process.argv.includes('--seed'); // gizli açılış: kişisel geçmişi yerel veriye yazar ve kapanır
if (SMOKE) app.setPath('userData', path.join(app.getPath('temp'), 'orin-smoke-' + process.pid)); // testler gerçek veriye dokunmaz
else app.setPath('userData', path.join(app.getPath('appData'), 'Orin')); // ad Orvane oldu ama ayar, token ve konum.json eski klasörde kalır
const DATA = () => app.getPath('userData');
const LOC = () => path.join(DATA(), 'konum.json'); // seçilen veri klasörü (yalnız yol)
let DWARN = null; // veri klasörü uyarısı (renderer'a gösterilir)
// 0.7.1: konum.json varken veri ASLA varsayılan klasöre yazılmaz. Okuma kısa aralıklarla yeniden denenir,
// son başarılı okunan yol bellekte tutulur; hiç okunamazsa veya klasör yoksa kayıt reddedilir (dataDir() null).
let KONUM_OK; // undefined: henüz okunmadı · null: konum.json yok (varsayılan) · metin: seçili klasör
function bekle(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function konum() {
  for (let i = 0; i < 5; i++) {
    if (!fs.existsSync(LOC())) { if (KONUM_OK) return KONUM_OK; KONUM_OK = null; return null; } // bilinen seçim varken dosya kaybolursa seçime sadık kal
    try { const d = JSON.parse(fs.readFileSync(LOC(), 'utf8').replace(/^\uFEFF/, '')).dir || null; KONUM_OK = d; return d; } catch (e) { bekle(80); }
  }
  return KONUM_OK || '!okunamadı';
}
function dataDir() {
  const d = konum();
  if (d === '!okunamadı') { DWARN = { kind: 'unreadable', file: LOC() }; return null; }
  if (d && fs.existsSync(d)) return d;
  if (d) { DWARN = { kind: 'missing', dir: d }; return null; }
  return DATA();
}
function bootLog() {
  try {
    const d = dataDir(), k = konum(), def = path.join(DATA(), 'durum.json'), cus = d && d !== DATA() ? path.join(d, 'durum.json') : null;
    if (cus && fs.existsSync(def) && fs.existsSync(cus) && fs.statSync(def).mtimeMs > fs.statSync(cus).mtimeMs + 60000) DWARN = { kind: 'newerDefault', dir: d, defTime: fs.statSync(def).mtimeMs, cusTime: fs.statSync(cus).mtimeMs };
    const line = JSON.stringify({ t: new Date().toISOString(), v: app.getVersion(), packaged: app.isPackaged, exe: process.execPath, userData: DATA(), konum: k, dataDir: d, blocked: !d, exists: k && k !== '!okunamadı' ? fs.existsSync(k) : null, warn: DWARN && DWARN.kind });
    const f = path.join(DATA(), 'orin-baslangic.log'); let old = []; try { old = fs.readFileSync(f, 'utf8').trim().split('\n'); } catch (e) {}
    fs.writeFileSync(f, old.concat([line]).slice(-50).join('\n') + '\n');
  } catch (e) {}
}
const STATE_FILE = () => { const d = dataDir(); return d ? path.join(d, 'durum.json') : null; };
const BLOCK_MSG = () => DWARN && DWARN.kind === 'missing' ? 'Seçili veri klasörü bulunamadı: ' + DWARN.dir : 'Veri klasörü bilgisi (konum.json) okunamadı';
const IMG_EXT = /\.(jpe?g|png|webp|gif|bmp)$/i;

if (!SMOKE && !SEED && !app.requestSingleInstanceLock()) app.quit();
app.setAppUserModelId('com.caglar.orin'); // Windows bildirimleri için
const exp = require('./export');
let updater = null; try { updater = require('electron-updater').autoUpdater; } catch (e) {}

function readJSON(f, def) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return def; } }
function writeJSON(f, v) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = f + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(v, null, 1), 'utf8');
  for (let i = 0; ; i++) { try { fs.renameSync(tmp, f); return; } catch (e) { if (i >= 3 || !/EPERM|EBUSY|EACCES/.test(e.code || '')) throw e; bekle(120); } }
}
function safeName(t) { return (String(t || '').trim() || 'Adsız not').replace(/[\\/:*?"<>|]/g, '-').replace(/[. ]+$/, '').slice(0, 120) || 'Adsız not'; }

function createWindow() {
  const IS_WIN = process.platform === 'win32';
  const win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 900, minHeight: 560,
    // Windows 11: yerel yuvarlak köşe + buzlu cam (acrylic). Diğer sistemlerde düz koyu zemin.
    backgroundColor: IS_WIN ? '#00000000' : '#181818',
    ...(IS_WIN ? { backgroundMaterial: 'acrylic', roundedCorners: true } : {}),
    title: 'Orvane', show: !SMOKE && !SEED,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#00000000', symbolColor: '#d6d6db', height: 58 },
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false, spellcheck: false }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); shell.openExternal(url); } });
  if (SMOKE) smoke(win);
  if (SEED) win.webContents.on('did-finish-load', () => setTimeout(() => win.close(), 2500));
  return win;
}

// Otomatik kontrol: sayfaları gezer, hataları toplar, ekran görüntüsü alır, kapanır
function smoke(win) {
  // Gelen kutusu deneme dosyası (renderer testi okur)
  try { const gd = GELEN(); fs.mkdirSync(gd, { recursive: true }); fs.writeFileSync(path.join(gd, 'bozuk.json'), '{yarım'); fs.writeFileSync(path.join(gd, 'deneme.json'), JSON.stringify([{ tur: 'gelisim', kim: 'ada', gtur: 'hafiza', ad: 'Mimari', metin: 'Orvane Electron + Expo.' }, { tur: 'gelisim', kim: 'ada', gtur: 'beceri', ad: 'Smoke testi', metin: 'npx electron . --smoke' }, { tur: 'mesaj', kim: 'ada', metin: 'Rapor hazır. ÖĞRENİLENLER: [] ' }])); const eski = new Date(Date.now() - 60000); ['bozuk.json', 'deneme.json'].forEach(x => fs.utimesSync(path.join(gd, x), eski, eski)); } catch (e) {}
  const errors = [];
  win.webContents.on('console-message', (e, level, msg) => { if (level >= 3) errors.push(msg); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('render-gone ' + d.reason));
  win.webContents.on('did-finish-load', async () => {
    const out = app.isPackaged ? path.join(app.getPath('temp'), 'orin-test-sonuc') : path.join(__dirname, 'test-sonuc');
    try { const a = await win.webContents.executeJavaScript('window.__asyncTest ? window.__asyncTest() : []'); a.forEach(x => { if (!x.ok) errors.push('TEST ' + x.n + ': ' + x.m); }); fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, 'async.json'), JSON.stringify(a, null, 1)); } catch (e) { errors.push('async ' + e.message); }
    fs.mkdirSync(out, { recursive: true });
    try {
      const shots = await win.webContents.executeJavaScript('window.__smokeRoutes ? window.__smokeRoutes() : []');
      for (const r of shots) {
        const res = await win.webContents.executeJavaScript('window.__smokeGo(' + JSON.stringify(r) + ')');
        if (res && res.error) errors.push(r.join('/') + ': ' + res.error);
        await new Promise(s => setTimeout(s, 150));
        const img = await win.webContents.capturePage();
        fs.writeFileSync(path.join(out, r.join('_').replace(/[^\w.-]/g, '-') + '.png'), img.toPNG());
      }
      const t = await win.webContents.executeJavaScript('window.__selfTest ? window.__selfTest() : []');
      mainTests().forEach(x => t.push(x));
      t.forEach(x => { if (!x.ok) errors.push('TEST ' + x.n + ': ' + x.m); });
      fs.writeFileSync(path.join(out, 'rapor.json'), JSON.stringify({ errors, tests: t }, null, 1));
    } catch (e) { errors.push('smoke ' + e.message); fs.writeFileSync(path.join(out, 'rapor.json'), JSON.stringify({ errors }, null, 1)); }
    try { fs.rmSync(DATA(), { recursive: true, force: true }); } catch (e) {}
    console.log(errors.length ? 'SMOKE HATA\n' + errors.join('\n') : 'SMOKE TAMAM');
    app.exit(errors.length ? 1 : 0);
  });
}

// Ana süreç testleri (yalnız smoke; geçici userData içinde): konum.json koruması, güncelleme öncesi yedek, duraklatma
function mainTests() {
  const R = [], t = (n, ok, m) => R.push({ n, ok: !!ok, m: ok ? '' : String(m || 'beklenmeyen sonuç') });
  const bkK = KONUM_OK, bkW = DWARN, def = path.join(DATA(), 'durum.json'), cus = path.join(DATA(), 'test-secili'), save = st => ipcHandlers['state:save'](null, st);
  try {
    try { fs.unlinkSync(def); } catch (e) {}
    fs.mkdirSync(cus, { recursive: true }); fs.writeFileSync(LOC(), JSON.stringify({ dir: cus }));
    t('konum.json okunur', dataDir() === cus, dataDir());
    fs.writeFileSync(LOC(), '{bozuk');
    t('Bozuk konum.json: bilinen klasöre sadık kalır', dataDir() === cus, dataDir());
    KONUM_OK = undefined;
    t('Bozuk konum.json + bilinmeyen: kayıt yeri yok', dataDir() === null && DWARN && DWARN.kind === 'unreadable', JSON.stringify(DWARN));
    const r1 = save({ v: 1, test: 1 });
    t('Bozuk konum.json: kayıt reddedilir', r1 && r1.ok === false, JSON.stringify(r1));
    t('Bozuk konum.json: varsayılana yazılmaz', !fs.existsSync(def));
    t('Bozuk konum.json: yüklemede boş döner', STATE_FILE() === null);
    t('Bozuk konum.json: yedek alınmaz, hata verir', yedekAl('guncelleme-oncesi-test').ok === false);
    fs.writeFileSync(LOC(), JSON.stringify({ dir: path.join(DATA(), 'yok-klasor') })); KONUM_OK = undefined;
    const r2 = save({ v: 1, test: 2 });
    t('Klasör yok: kayıt reddedilir', r2.ok === false && DWARN.kind === 'missing', JSON.stringify(r2));
    t('Klasör yok: varsayılana yazılmaz', !fs.existsSync(def));
    t('Klasör yok: bilgi kayıt durdu der', dataInfo().blocked === true);
    fs.writeFileSync(LOC(), JSON.stringify({ dir: cus })); KONUM_OK = undefined;
    const r3 = save({ v: 1, test: 3 });
    t('Konum düzelince seçili klasöre yazar', r3.ok && fs.existsSync(path.join(cus, 'durum.json')) && !fs.existsSync(def), JSON.stringify(r3));
    fs.unlinkSync(LOC());
    t('Bilinen seçim varken konum.json kaybolursa seçime sadık kalır', dataDir() === cus, dataDir());
    KONUM_OK = undefined;
    t('konum.json yoksa varsayılan kullanılır', dataDir() === DATA());
    fs.writeFileSync(LOC(), JSON.stringify({ dir: cus })); KONUM_OK = undefined;
    const y = yedekAl('guncelleme-oncesi-9.9.9');
    t('Güncelleme öncesi yedek alınır', y.ok && /Yedekler/.test(y.file) && /durum-guncelleme-oncesi-9\.9\.9-/.test(path.basename(y.file)) && fs.existsSync(y.file), JSON.stringify(y));
    t('Yedek içeriği veriyle aynı', y.ok && fs.readFileSync(y.file, 'utf8') === fs.readFileSync(path.join(cus, 'durum.json'), 'utf8'));
    for (let i = 0; i < 12; i++) { const f = path.join(cus, 'Yedekler', 'durum-guncelleme-oncesi-eski-' + i + '.json'); fs.writeFileSync(f, '{}'); fs.utimesSync(f, new Date(2020, 0, 1 + i), new Date(2020, 0, 1 + i)); }
    yedekAl('guncelleme-oncesi-9.9.10');
    const kalan = fs.readdirSync(path.join(cus, 'Yedekler')).filter(f => /^durum-guncelleme-oncesi-/.test(f));
    t('Güncelleme yedekleri en fazla 10', kalan.length === 10 && kalan.some(f => /9\.9\.10/.test(f)), kalan.length);
    writeJSON(PIN(), { v: app.getVersion(), from: '9.9.9' });
    t('Duraklatma kaydı bu sürümde geçerli', pinOku() && pinOku().v === app.getVersion());
    writeJSON(PIN(), { v: '0.0.1' });
    t('Başka sürümün duraklatma kaydı silinir', pinOku() === null && !fs.existsSync(PIN()));
    t('Güncelleme kurulumu öncesi yedek bağlı', String(ipcHandlers['update:install'] || '').indexOf('yedekAl') >= 0);
    // Abonelik (Claude Code CLI): API anahtarı ve oturum değişkenleri alt sürece geçmez, araçlar kısıtlı, sonuç okunur
    const ab = require('./abonelik'), eskiK = process.env.ANTHROPIC_API_KEY; process.env.ANTHROPIC_API_KEY = 'sk-test'; process.env.CLAUDE_CODE_TEST_X = '1';
    const env = ab.temizEnv(); if (eskiK === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = eskiK; delete process.env.CLAUDE_CODE_TEST_X;
    t('Abonelik: API anahtarı alt sürece geçmez', !env.ANTHROPIC_API_KEY && !env.CLAUDE_CODE_TEST_X && !!env.PATH === !!process.env.PATH);
    const ar = ab.argsOf({}, 'x.txt');
    t('Abonelik: yalnız okuma/araştırma araçları ve MCP kapalı', ar.includes('--strict-mcp-config') && ar[ar.indexOf('--tools') + 1] === 'Read,Glob,Grep,WebSearch,WebFetch' && ar.includes('--no-session-persistence') && !ar.join(' ').includes('Bash'), ar.join(' '));
    t('Abonelik: başarılı sonuç okunur', ab.sonucOku('{"type":"result","subtype":"success","is_error":false,"result":"tamam","num_turns":1,"usage":{"input_tokens":5,"output_tokens":3}}').metin === 'tamam');
    let lim = null; try { ab.sonucOku('{"subtype":"success","is_error":true,"result":"Claude AI usage limit reached|1794410000"}'); } catch (e) { lim = e; }
    t('Abonelik: limit hatası tanınır', lim && lim.kod === 'limit' && /limit/.test(lim.message), lim && lim.message);
    // 0.7.14 geliştirme kipi: düzenleme yalnız çalışma klasöründe, gerçek veri ve kişisel dosya yasak, git push/merge yok
    const ga = ab.argsOf({ mod: 'gelistir', koru: ['C:\\Users\\PC\\Documents\\Orin\\Veriler', 'C:\\k\\renderer\\js\\kisisel.js'] }, 'x.txt'), gj = ga.join(' ');
    t('Geliştirme kipi: düzenleme yalnız çalışma klasöründe (acceptEdits), Edit genel izinli değil', ga[ga.indexOf('--permission-mode') + 1] === 'acceptEdits' && !ga.slice(ga.indexOf('--allowedTools'), ga.indexOf('--disallowedTools')).some(x => /^(Edit|Write)/.test(x)), gj);
    t('Geliştirme kipi: gerçek veri ve kişisel dosya yasak', ga.includes('Read(//c/Users/PC/Documents/Orin/Veriler/**)') && ga.includes('Edit(//c/Users/PC/Documents/Orin/Veriler/**)') && ga.includes('Read(//c/k/renderer/js/kisisel.js)'), gj);
    t('Geliştirme kipi: git push/merge ve yayın yasak, internet yok', ['Bash(git push:*)', 'Bash(git merge:*)', 'Bash(npx eas-cli:*)', 'WebFetch'].every(x => ga.slice(ga.indexOf('--disallowedTools')).includes(x)) && ga.includes('--strict-mcp-config'), gj);
    const gl = require('./gelistir'), e1 = gl.emirYaz({ id: 'test1', kim: 'ada', kimAd: 'Ada', baslik: 'Deneme', metin: 'Bir düğme ekle', maddeler: ['a', 'b'] }), ej = gl.emirOku(e1.dosya), em = fs.readFileSync(e1.md, 'utf8');
    t('İş emri Giden klasörüne .md + .json yazılır', /^is-emri-ada-\d{4}/.test(e1.dosya) && ej.durum === 'onaylandi' && /Giden/.test(e1.md) && /main dalına dokunma/.test(em) && /is_sonuc/.test(em) && /kisisel\.js/.test(em), e1.md);
    let ge = null; try { gl.emirOku('..\\durum'); } catch (e) { ge = e; }
    t('İş emri adı doğrulanır (klasör dışı okunmaz)', ge && /Geçersiz/.test(ge.message));
    const tk1 = gl.testKarsilastir({ dusen: ['A', 'B'], gecen: 8, toplam: 10 }, { dusen: ['A', 'B'], gecen: 9, toplam: 11 }), tk2 = gl.testKarsilastir({ dusen: ['A'] }, { dusen: ['A', 'C'], gecen: 9, toplam: 11, hatalar: ['TEST C: x'] });
    t('İş emri testi: yalnız yeni düşen testler hata sayılır (kişisel veri eksikliği değil)', tk1.ok && tk1.kisiselEksik === 2 && !tk2.ok && tk2.yeniHata.join() === 'C' && tk2.hatalar.length === 1, JSON.stringify([tk1, tk2]));
    t('İş emri durumu güncellenir', gl.emirGuncelle(e1.dosya, { durum: 'inceleme', dal: 'is-emri/ada-x' }).durum === 'inceleme' && gl.emirler().some(x => x.id === 'test1' && x.dal === 'is-emri/ada-x'));
  } catch (e) { t('Ana süreç testleri', false, e.stack); }
  try { fs.unlinkSync(LOC()); } catch (e) {}
  KONUM_OK = bkK; DWARN = bkW;
  return R;
}
// ---- IPC ----
const ipcHandlers = {}; { const h = ipcMain.handle.bind(ipcMain); ipcMain.handle = (ch, fn) => { ipcHandlers[ch] = fn; return h(ch, fn); }; }
const wrap = fn => async (e, a) => { try { return { ok: true, v: await fn(a, e) }; } catch (err) { return { ok: false, err: err.message }; } };
ipcMain.on('state:load', e => { const f = STATE_FILE(); e.returnValue = f ? readJSON(f, null) : null; });
// Kayıt yeri güvenli değilse (konum.json okunamıyor / klasör yok) yazma: varsayılana düşüp veriyi bölmek yerine reddet
function stateKaydet(v) { const f = STATE_FILE(); if (!f) return { ok: false, err: BLOCK_MSG() + '. Veri karışmasın diye kaydedilmedi.', warn: DWARN }; try { writeJSON(f, v); return { ok: true }; } catch (er) { return { ok: false, err: 'Kaydedilemedi: ' + er.message }; } }
ipcMain.handle('state:save', (e, v) => stateKaydet(v));
ipcMain.on('state:saveSync', (e, v) => { e.returnValue = stateKaydet(v); }); // pencere kapanırken bekleyen kayıt kaybolmasın
// Veri klasörü: bilgi, taşıma, varsayılana dönüş
function dataInfo() { const d = dataDir(); if (!d) return { dir: KONUM_OK || (DWARN && DWARN.dir) || '', def: DATA(), custom: true, file: BLOCK_MSG() + ' · kayıt durduruldu', warn: DWARN, blocked: true }; return { dir: d, def: DATA(), custom: d !== DATA(), file: path.join(d, 'durum.json'), warn: DWARN }; }
// Varsayılandaki daha yeni veriyi seçili klasöre al (seçili klasördeki yedeklenir)
ipcMain.handle('data:adopt', () => { try { const d = dataDir(); if (!d) return { ok: false, err: BLOCK_MSG() }; const def = path.join(DATA(), 'durum.json'), cus = path.join(d, 'durum.json'), st = '.yedek-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '.json'; if (d === DATA() || !fs.existsSync(def)) return { ok: false, err: 'Taşınacak veri yok' }; if (fs.existsSync(cus)) fs.copyFileSync(cus, cus.replace(/\.json$/, st)); fs.copyFileSync(def, cus); fs.renameSync(def, def.replace(/\.json$/, st)); DWARN = null; return { ok: true }; } catch (e) { return { ok: false, err: e.message }; } });
ipcMain.handle('data:dismiss', () => { DWARN = null; return true; });
ipcMain.handle('data:info', () => dataInfo());
ipcMain.handle('data:move', (e, { dir, mode }) => {
  try {
    if (!dir) throw new Error('Klasör seçilmedi');
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    const src = STATE_FILE(), dst = path.join(dir, 'durum.json');
    if (src && path.resolve(src) === path.resolve(dst)) return { ok: true, info: dataInfo() };
    if (fs.existsSync(dst) && !mode) return { ok: false, exists: true };
    if (mode !== 'use' && src && fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      fs.renameSync(src, src.replace(/\.json$/, '.yedek-' + new Date().toISOString().slice(0, 10) + '.json'));
    }
    if (path.resolve(dir) === path.resolve(DATA())) { try { fs.unlinkSync(LOC()); } catch (er) {} KONUM_OK = null; } else { fs.writeFileSync(LOC(), JSON.stringify({ dir })); KONUM_OK = dir; }
    DWARN = null;
    return { ok: true, info: dataInfo() };
  } catch (err) { return { ok: false, err: err.message }; }
});
ipcMain.on('app:info', e => { e.returnValue = { version: app.getVersion(), userData: DATA(), smoke: SMOKE }; });

ipcMain.handle('notes:list', (e, dir) => {
  if (!dir || !fs.existsSync(dir)) return { ok: false, items: [] };
  const items = fs.readdirSync(dir).filter(f => /\.txt$/i.test(f)).map(f => {
    const p = path.join(dir, f), st = fs.statSync(p);
    return { file: f, title: f.replace(/\.txt$/i, ''), body: fs.readFileSync(p, 'utf8').replace(/^﻿/, ''), mtime: st.mtimeMs };
  }).sort((a, b) => a.mtime - b.mtime);
  return { ok: true, items };
});
ipcMain.handle('notes:save', (e, { dir, oldFile, title, body }) => {
  if (!dir) throw new Error('Not klasörü ayarlanmadı');
  fs.mkdirSync(dir, { recursive: true });
  let base = safeName(title), file = base + '.txt', i = 2;
  while (file !== oldFile && fs.existsSync(path.join(dir, file))) file = base + ' (' + (i++) + ').txt';
  fs.writeFileSync(path.join(dir, file), body, 'utf8');
  if (oldFile && oldFile !== file && fs.existsSync(path.join(dir, oldFile))) fs.unlinkSync(path.join(dir, oldFile));
  return file;
});
ipcMain.handle('notes:delete', (e, { dir, file }) => { const p = path.join(dir, file); if (fs.existsSync(p)) shell.trashItem(p); return true; });

ipcMain.handle('images:list', (e, dir) => {
  if (!dir || !fs.existsSync(dir)) return { ok: false, items: [] };
  const items = fs.readdirSync(dir).filter(f => IMG_EXT.test(f)).map(f => ({ name: f, url: 'file:///' + path.join(dir, f).replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/').replace(/^([A-Za-z])%3A/, '$1:') }));
  return { ok: true, items };
});

ipcMain.handle('fs:pickFolder', async (e, cur) => {
  const r = await dialog.showOpenDialog(BrowserWindow.fromWebContents(e.sender), { defaultPath: cur || undefined, properties: ['openDirectory', 'createDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('fs:open', (e, p) => fs.existsSync(p) ? shell.openPath(p) : 'Klasör bulunamadı');
ipcMain.handle('shell:external', (e, url) => /^https?:/.test(url) && shell.openExternal(url));

ipcMain.on('win:cmd', (e, cmd, arg) => {
  const w = BrowserWindow.fromWebContents(e.sender); if (!w) return;
  if (cmd === 'close') w.close();
  else if (cmd === 'new') createWindow();
  else if (cmd === 'fullscreen') w.setFullScreen(!w.isFullScreen());
  else if (cmd === 'zoom') w.webContents.setZoomFactor(arg);
  else if (cmd === 'devtools') w.webContents.toggleDevTools();
  else if (cmd === 'theme') { try { w.setTitleBarOverlay(arg === 'light' ? { color: '#00000000', symbolColor: '#333333' } : { color: '#00000000', symbolColor: '#d6d6db' }); } catch (e) {} }
});

// ---- Yedek, dışa aktarma, haberler, güncelleme ----
ipcMain.handle('data:backup', () => {
  try {
    const src = STATE_FILE(); if (!src) return { ok: false, err: BLOCK_MSG() }; if (!fs.existsSync(src)) return { ok: false, err: 'Veri dosyası yok' };
    const dir = path.join(path.dirname(src), 'Yedekler'); fs.mkdirSync(dir, { recursive: true });
    const d = new Date(), name = 'durum-' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + '.json';
    fs.copyFileSync(src, path.join(dir, name));
    fs.readdirSync(dir).filter(f => /^durum-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().reverse().slice(8).forEach(f => fs.unlinkSync(path.join(dir, f)));
    return { ok: true, file: path.join(dir, name), dir };
  } catch (e) { return { ok: false, err: e.message }; }
});
async function saveAs(e, name, ext, label) {
  const r = await dialog.showSaveDialog(BrowserWindow.fromWebContents(e.sender), { defaultPath: path.join(app.getPath('documents'), name.replace(/[\\/:*?"<>|]/g, '-')), filters: [{ name: label, extensions: [ext] }] });
  return r.canceled ? null : r.filePath;
}
ipcMain.handle('exp:xlsx', async (e, o) => { try { const f = await saveAs(e, o.name, 'xlsx', 'Excel'); if (!f) return { canceled: true }; fs.writeFileSync(f, exp.xlsx(o.sheets)); return { ok: true, file: f }; } catch (er) { return { ok: false, err: er.message }; } });
ipcMain.handle('exp:pdf', async (e, o) => { try { const f = await saveAs(e, o.name, 'pdf', 'PDF'); if (!f) return { canceled: true }; await exp.pdf(o.html, f); return { ok: true, file: f }; } catch (er) { return { ok: false, err: er.message }; } });
ipcMain.handle('news', async () => { try { return { ok: true, items: await exp.news() }; } catch (er) { return { ok: false, err: er.message }; } });
// 0.7.1: güncelleme kurulmadan önce otomatik veri yedeği (Yedekler/durum-guncelleme-oncesi-X-zaman.json, son 10 tutulur)
function yedekAl(etiket) {
  try {
    const src = STATE_FILE(); if (!src) return { ok: false, err: BLOCK_MSG() }; if (!fs.existsSync(src)) return { ok: false, err: 'Veri dosyası yok' };
    const dir = path.join(path.dirname(src), 'Yedekler'); fs.mkdirSync(dir, { recursive: true });
    const d = new Date(), p2 = n => String(n).padStart(2, '0'), ts = d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + '-' + p2(d.getHours()) + '-' + p2(d.getMinutes()) + '-' + p2(d.getSeconds());
    const file = path.join(dir, 'durum-' + String(etiket).replace(/[^\w.-]/g, '-') + '-' + ts + '.json');
    fs.copyFileSync(src, file);
    fs.readdirSync(dir).filter(f => /^durum-(guncelleme-oncesi|geri-donus-oncesi)-.*\.json$/.test(f)).map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a, b) => b.t - a.t).slice(10).forEach(x => fs.unlinkSync(path.join(dir, x.f)));
    return { ok: true, file };
  } catch (e) { return { ok: false, err: e.message }; }
}
// Geri dönüşten sonra güncellemeleri duraklat (yalnız 0.7.1 ve sonrası bu dosyayı tanır)
const PIN = () => path.join(DATA(), 'guncelleme-durdur.json');
function pinOku() { const p = readJSON(PIN(), null); if (p && p.v !== app.getVersion()) { try { fs.unlinkSync(PIN()); } catch (e) {} return null; } return p; }
let UPD_HAZIR = null;
function updSend(s) { BrowserWindow.getAllWindows().forEach(w => w.webContents.send('upd', s)); }
if (updater) {
  const pin = SMOKE ? null : pinOku();
  updater.autoDownload = !pin; updater.autoInstallOnAppQuit = !pin;
  updater.on('update-available', i => updSend({ s: updater.autoDownload ? 'indiriliyor' : 'durduruldu', v: i.version }));
  updater.on('update-not-available', () => updSend({ s: 'guncel' }));
  updater.on('update-downloaded', i => { UPD_HAZIR = i.version; const y = yedekAl('guncelleme-oncesi-' + i.version); updSend({ s: 'hazir', v: i.version, yedek: y.ok ? y.file : null }); });
  updater.on('error', er => updSend({ s: 'hata', m: String(er && er.message || er).slice(0, 200) }));
}
app.on('before-quit', () => { if (UPD_HAZIR && updater && updater.autoInstallOnAppQuit) yedekAl('guncelleme-oncesi-' + UPD_HAZIR); });
ipcMain.handle('update:check', async () => { if (!app.isPackaged || !updater) return { s: 'gelistirme' }; try { await updater.checkForUpdates(); return { s: 'denetleniyor' }; } catch (er) { return { s: 'hata', m: er.message }; } });
ipcMain.handle('update:install', () => { if (!updater) return; yedekAl('guncelleme-oncesi-' + (UPD_HAZIR || 'yeni')); UPD_HAZIR = null; updater.quitAndInstall(); });
ipcMain.handle('update:resume', async () => { try { fs.unlinkSync(PIN()); } catch (e) {} if (updater) { updater.autoDownload = true; updater.autoInstallOnAppQuit = true; if (app.isPackaged) updater.checkForUpdates().catch(() => {}); } return { ok: true }; });
// Önceki onaylı sürüme dönüş
const surum = require('./surum');
const YEREL_LISTE = () => readJSON(path.join(__dirname, 'onayli-surumler.json'), { surumler: [] });
ipcMain.handle('surum:liste', wrap(async () => Object.assign(await surum.liste(app.getVersion(), YEREL_LISTE(), SMOKE), { cur: app.getVersion(), pin: pinOku(), paketli: app.isPackaged })));
let DONUS = false;
ipcMain.handle('surum:don', wrap(async (v, e) => {
  if (DONUS) throw new Error('Geri dönüş zaten sürüyor');
  const l = await surum.liste(app.getVersion(), YEREL_LISTE(), SMOKE);
  if (!l.surumler.some(s => s.v === v)) throw new Error(v + ' onaylı önceki sürümler listesinde yok');
  if (!app.isPackaged) throw new Error('Geri dönüş yalnız kurulu uygulamada çalışır');
  DONUS = true;
  try {
    const y = yedekAl('geri-donus-oncesi-' + app.getVersion());
    const exe = await surum.indir(v, path.join(app.getPath('temp'), 'orvane-geri-donus'), (n, top) => { try { e.sender.send('surum:ilerle', { v, n, top }); } catch (er) {} });
    if (surum.karsilastir(v, '0.7.1') >= 0) writeJSON(PIN(), { v, t: new Date().toISOString(), from: app.getVersion() });
    if (updater) { updater.autoDownload = false; updater.autoInstallOnAppQuit = false; } // inen yeni sürüm kapanışta kurulmasın
    require('child_process').spawn(exe, [], { detached: true, stdio: 'ignore' }).unref();
    setTimeout(() => app.quit(), 1200);
    return { exe, yedek: y.ok ? y.file : null, pin: surum.karsilastir(v, '0.7.1') >= 0 };
  } finally { DONUS = false; }
}));

// ---- Google Sheets ----
const sheets = require('./sheets');
ipcMain.handle('sheets:status', wrap(() => sheets.status()));
// Telefon eşitlemesi (Supabase)
const bulut = require('./bulut');
ipcMain.handle('bulut:status', wrap(() => bulut.status()));
ipcMain.handle('bulut:config', wrap(c => bulut.setCfg(c)));
ipcMain.handle('bulut:login', wrap(o => bulut.login(o)));
ipcMain.handle('bulut:signup', wrap(o => bulut.signup(o)));
ipcMain.handle('bulut:logout', wrap(() => bulut.logout()));
ipcMain.handle('bulut:pull', wrap(s => bulut.pull(s)));
ipcMain.handle('bulut:push', wrap(v => bulut.push(v)));
// Yapay zekâ çalışanları (Claude API)
const zeka = require('./zeka');
ipcMain.handle('zeka:status', wrap(() => zeka.status()));
ipcMain.handle('zeka:setKey', wrap(k => zeka.setKey(k)));
ipcMain.handle('zeka:clearKey', wrap(() => zeka.clearKey()));
ipcMain.handle('zeka:setBudget', wrap(b => zeka.setBudget(b)));
ipcMain.handle('zeka:sor', wrap(o => zeka.sor(o)));
// Gelen kutusu: Claude Code Belgeler\Orin\Gelen\*.json bırakır (çalışana mesaj / gelişim talebi); uygulama iletir, dosya İşlenen'e taşınır
const GELEN = () => path.join(SMOKE ? DATA() : app.getPath('documents'), 'Orin', 'Gelen');
ipcMain.handle('gelen:al', wrap(() => {
  const d = GELEN(), out = []; if (!fs.existsSync(d)) return out;
  for (const f of fs.readdirSync(d).filter(x => /\.json$/i.test(x)).sort()) {
    const p = path.join(d, f);
    try { if (Date.now() - fs.statSync(p).mtimeMs < 2000) continue; } catch (e) { continue; } // hâlâ yazılıyor olabilir
    try { const j = JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '')); (Array.isArray(j) ? j : [j]).forEach(x => { if (x && typeof x === 'object') out.push(Object.assign({}, x, { _dosya: f })); }); }
    catch (e) { out.push({ tur: 'hata', dosya: f, hata: e.message }); try { fs.mkdirSync(path.join(d, 'Hatalı'), { recursive: true }); fs.renameSync(p, path.join(d, 'Hatalı', f)); } catch (er) {} }
  }
  return out;
}));
ipcMain.handle('gelen:tamam', wrap(dosyalar => { const d = GELEN(), isl = path.join(d, 'İşlenen'); let n = 0; fs.mkdirSync(isl, { recursive: true }); [...new Set(dosyalar || [])].forEach(f => { if (!/^[^\\/:*?"<>|]+\.json$/i.test(f)) return; try { fs.renameSync(path.join(d, f), path.join(isl, f)); n++; } catch (e) {} }); return n; }));
// Ada'nın soracağı geliştirme fikirleri: GitHub main'deki güncel liste, yoksa uygulamayla gelen
ipcMain.handle('fikir:liste', wrap(async () => { if (!SMOKE) { try { const r = await fetch('https://raw.githubusercontent.com/caglarbozkurt350-creator/Orin/main/fikirler.json?t=' + Date.now(), { cache: 'no-store', signal: AbortSignal.timeout(6000) }); if (r.ok) { const j = await r.json(); if (Array.isArray(j.fikirler)) return { kaynak: 'github', fikirler: j.fikirler }; } } catch (e) {} } return { kaynak: 'yerel', fikirler: readJSON(path.join(__dirname, 'fikirler.json'), { fikirler: [] }).fikirler }; }));
// Claude aboneliği (Claude Code CLI, headless): ağır işler abonelikte
const abonelik = require('./abonelik');
abonelik.init(DATA(), app.getPath('documents'));
ipcMain.handle('abonelik:status', wrap(() => abonelik.status()));
ipcMain.handle('abonelik:ayar', wrap(a => abonelik.setAyar(a)));
ipcMain.handle('abonelik:test', wrap(() => SMOKE ? abonelik.status() : abonelik.test()));
ipcMain.handle('abonelik:calistir', wrap(o => { if (SMOKE) throw new Error('Testte abonelik çalıştırılmaz'); return abonelik.calistir(o); }));
// İş emirleri (0.7.14): onaylı iş isteği → Belgeler\Orin\Giden; tam otomatik kipte Claude Code ayrı git dalında yapar (main'e dokunmaz)
const gelistir = require('./gelistir');
gelistir.init(SMOKE ? DATA() : app.getPath('documents'), abonelik, kay => [dataDir(), DATA(), path.join(app.getPath('documents'), 'Orin', 'Veriler'), kay && path.join(kay, 'renderer', 'js', 'kisisel.js')].filter(Boolean));
ipcMain.handle('isemri:yaz', wrap(o => gelistir.emirYaz(o)));
ipcMain.handle('isemri:liste', wrap(() => gelistir.emirler()));
ipcMain.handle('isemri:durum', wrap(() => gelistir.durum()));
ipcMain.handle('isemri:gelistir', wrap(o => { if (SMOKE) throw new Error('Testte geliştirme çalıştırılmaz'); return gelistir.gelistir(o); }));
// Jarvis (0.7.14): Jarvis projesinin giden/ klasöründeki prompt taslakları (yalnız okuma; şirkete yalnız Çağlar'ın düğmesiyle gider)
const JARVIS = () => path.join(app.getPath('documents'), 'Cloude Dosyaları', 'Jarvis', 'giden');
ipcMain.handle('jarvis:taslaklar', wrap(() => { if (SMOKE) return []; const d = JARVIS(); if (!fs.existsSync(d)) return []; return fs.readdirSync(d).filter(f => /\.md$/i.test(f)).map(f => { const p = path.join(d, f), st = fs.statSync(p); return { ad: f, ts: st.mtimeMs, metin: st.size < 60000 ? fs.readFileSync(p, 'utf8') : '' }; }).sort((a, b) => b.ts - a.ts).slice(0, 15); }));
ipcMain.handle('sheets:config', wrap(p => sheets.setConfig(p)));
ipcMain.handle('sheets:login', wrap(() => sheets.login()));
ipcMain.handle('sheets:cancel', wrap(() => sheets.cancel()));
ipcMain.handle('sheets:reopen', wrap(() => sheets.reopen()));
ipcMain.handle('sheets:authUrl', wrap(() => sheets.authUrl()));
ipcMain.handle('sheets:logout', wrap(() => sheets.logout()));
ipcMain.handle('sheets:meta', wrap(() => sheets.meta()));
ipcMain.handle('sheets:read', wrap(r => sheets.read(r)));
ipcMain.handle('sheets:add', wrap(r => sheets.addRec(r)));
ipcMain.handle('sheets:upd', wrap(o => sheets.updRec(o)));
ipcMain.handle('sheets:del', wrap(o => sheets.delRec(o)));
ipcMain.handle('sheets:findLeave', wrap(o => sheets.findLeave(o)));
ipcMain.handle('sheets:upsert', wrap(o => sheets.upsertKey(o)));
ipcMain.handle('sheets:delKey', wrap(o => sheets.deleteKey(o)));
ipcMain.handle('sheets:pickClient', wrap(async (a, e) => {
  const r = await dialog.showOpenDialog(BrowserWindow.fromWebContents(e.sender), { title: 'OAuth istemci dosyası (client_secret….json)', filters: [{ name: 'JSON', extensions: ['json'] }], properties: ['openFile'] });
  if (r.canceled) return sheets.status();
  return sheets.setConfig({ clientJson: fs.readFileSync(r.filePaths[0], 'utf8') });
}));

app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.whenReady().then(() => { Menu.setApplicationMenu(null); bootLog(); createWindow(); if (app.isPackaged && updater && !SMOKE) { setTimeout(() => updater.checkForUpdates().catch(() => {}), 15000); setInterval(() => updater.checkForUpdates().catch(() => {}), 6 * 3600e3); } });
app.on('window-all-closed', () => app.quit());
