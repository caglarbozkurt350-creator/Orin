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
function konum() { try { return JSON.parse(fs.readFileSync(LOC(), 'utf8').replace(/^\uFEFF/, '')).dir || null; } catch (e) { return fs.existsSync(LOC()) ? '!okunamadı' : null; } }
function dataDir() { const d = konum(); if (d && d !== '!okunamadı' && fs.existsSync(d)) return d; if (d) DWARN = { kind: 'missing', dir: d }; return DATA(); }
function bootLog() {
  try {
    const d = dataDir(), k = konum(), def = path.join(DATA(), 'durum.json'), cus = d !== DATA() ? path.join(d, 'durum.json') : null;
    if (cus && fs.existsSync(def) && fs.existsSync(cus) && fs.statSync(def).mtimeMs > fs.statSync(cus).mtimeMs + 60000) DWARN = { kind: 'newerDefault', dir: d, defTime: fs.statSync(def).mtimeMs, cusTime: fs.statSync(cus).mtimeMs };
    const line = JSON.stringify({ t: new Date().toISOString(), v: app.getVersion(), packaged: app.isPackaged, exe: process.execPath, userData: DATA(), konum: k, dataDir: d, exists: k ? fs.existsSync(k) : null, warn: DWARN && DWARN.kind });
    const f = path.join(DATA(), 'orin-baslangic.log'); let old = []; try { old = fs.readFileSync(f, 'utf8').trim().split('\n'); } catch (e) {}
    fs.writeFileSync(f, old.concat([line]).slice(-50).join('\n') + '\n');
  } catch (e) {}
}
const STATE_FILE = () => path.join(dataDir(), 'durum.json');
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
  fs.renameSync(tmp, f);
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
      t.forEach(x => { if (!x.ok) errors.push('TEST ' + x.n + ': ' + x.m); });
      fs.writeFileSync(path.join(out, 'rapor.json'), JSON.stringify({ errors, tests: t }, null, 1));
    } catch (e) { errors.push('smoke ' + e.message); fs.writeFileSync(path.join(out, 'rapor.json'), JSON.stringify({ errors }, null, 1)); }
    try { fs.rmSync(DATA(), { recursive: true, force: true }); } catch (e) {}
    console.log(errors.length ? 'SMOKE HATA\n' + errors.join('\n') : 'SMOKE TAMAM');
    app.exit(errors.length ? 1 : 0);
  });
}

// ---- IPC ----
ipcMain.on('state:load', e => { e.returnValue = readJSON(STATE_FILE(), null); });
ipcMain.handle('state:save', (e, v) => { writeJSON(STATE_FILE(), v); return true; });
// Veri klasörü: bilgi, taşıma, varsayılana dönüş
function dataInfo() { const d = dataDir(); return { dir: d, def: DATA(), custom: d !== DATA(), file: path.join(d, 'durum.json'), warn: DWARN }; }
// Varsayılandaki daha yeni veriyi seçili klasöre al (seçili klasördeki yedeklenir)
ipcMain.handle('data:adopt', () => { try { const d = dataDir(), def = path.join(DATA(), 'durum.json'), cus = path.join(d, 'durum.json'), st = '.yedek-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '.json'; if (d === DATA() || !fs.existsSync(def)) return { ok: false, err: 'Taşınacak veri yok' }; if (fs.existsSync(cus)) fs.copyFileSync(cus, cus.replace(/\.json$/, st)); fs.copyFileSync(def, cus); fs.renameSync(def, def.replace(/\.json$/, st)); DWARN = null; return { ok: true }; } catch (e) { return { ok: false, err: e.message }; } });
ipcMain.handle('data:dismiss', () => { DWARN = null; return true; });
ipcMain.handle('data:info', () => dataInfo());
ipcMain.handle('data:move', (e, { dir, mode }) => {
  try {
    if (!dir) throw new Error('Klasör seçilmedi');
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    const src = STATE_FILE(), dst = path.join(dir, 'durum.json');
    if (path.resolve(src) === path.resolve(dst)) return { ok: true, info: dataInfo() };
    if (fs.existsSync(dst) && !mode) return { ok: false, exists: true };
    if (mode !== 'use' && fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      fs.renameSync(src, src.replace(/\.json$/, '.yedek-' + new Date().toISOString().slice(0, 10) + '.json'));
    }
    if (path.resolve(dir) === path.resolve(DATA())) { try { fs.unlinkSync(LOC()); } catch (er) {} } else fs.writeFileSync(LOC(), JSON.stringify({ dir }));
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
    const src = STATE_FILE(); if (!fs.existsSync(src)) return { ok: false, err: 'Veri dosyası yok' };
    const dir = path.join(dataDir(), 'Yedekler'); fs.mkdirSync(dir, { recursive: true });
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
function updSend(s) { BrowserWindow.getAllWindows().forEach(w => w.webContents.send('upd', s)); }
if (updater) {
  updater.autoDownload = true;
  updater.on('update-available', i => updSend({ s: 'indiriliyor', v: i.version }));
  updater.on('update-not-available', () => updSend({ s: 'guncel' }));
  updater.on('update-downloaded', i => updSend({ s: 'hazir', v: i.version }));
  updater.on('error', er => updSend({ s: 'hata', m: String(er && er.message || er).slice(0, 200) }));
}
ipcMain.handle('update:check', async () => { if (!app.isPackaged || !updater) return { s: 'gelistirme' }; try { await updater.checkForUpdates(); return { s: 'denetleniyor' }; } catch (er) { return { s: 'hata', m: er.message }; } });
ipcMain.handle('update:install', () => { if (updater) updater.quitAndInstall(); });

// ---- Google Sheets ----
const sheets = require('./sheets');
const wrap = fn => async (e, a) => { try { return { ok: true, v: await fn(a, e) }; } catch (err) { return { ok: false, err: err.message }; } };
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
