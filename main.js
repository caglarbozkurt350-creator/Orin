// Orin · ana süreç
const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const SMOKE = process.argv.includes('--smoke');
const SEED = process.argv.includes('--seed'); // gizli açılış: kişisel geçmişi yerel veriye yazar ve kapanır
if (SMOKE) app.setPath('userData', path.join(app.getPath('temp'), 'orin-smoke-' + process.pid)); // testler gerçek veriye dokunmaz
const DATA = () => app.getPath('userData');
const LOC = () => path.join(DATA(), 'konum.json'); // seçilen veri klasörü (yalnız yol)
function dataDir() { try { const d = JSON.parse(fs.readFileSync(LOC(), 'utf8')).dir; if (d && fs.existsSync(d)) return d; } catch (e) {} return DATA(); }
const STATE_FILE = () => path.join(dataDir(), 'durum.json');
const IMG_EXT = /\.(jpe?g|png|webp|gif|bmp)$/i;

if (!SMOKE && !SEED && !app.requestSingleInstanceLock()) app.quit();

function readJSON(f, def) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return def; } }
function writeJSON(f, v) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = f + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(v, null, 1), 'utf8');
  fs.renameSync(tmp, f);
}
function safeName(t) { return (String(t || '').trim() || 'Adsız not').replace(/[\\/:*?"<>|]/g, '-').replace(/[. ]+$/, '').slice(0, 120) || 'Adsız not'; }

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 900, minHeight: 560,
    backgroundColor: '#181818', title: 'Orin', show: !SMOKE && !SEED,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#121214', symbolColor: '#c9c9ce', height: 34 },
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
    const out = path.join(__dirname, 'test-sonuc');
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
function dataInfo() { const d = dataDir(); return { dir: d, def: DATA(), custom: d !== DATA(), file: path.join(d, 'durum.json') }; }
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
});

// ---- Google Sheets ----
const sheets = require('./sheets');
const wrap = fn => async (e, a) => { try { return { ok: true, v: await fn(a, e) }; } catch (err) { return { ok: false, err: err.message }; } };
ipcMain.handle('sheets:status', wrap(() => sheets.status()));
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
ipcMain.handle('sheets:upsert', wrap(o => sheets.upsertKey(o)));
ipcMain.handle('sheets:delKey', wrap(o => sheets.deleteKey(o)));
ipcMain.handle('sheets:pickClient', wrap(async (a, e) => {
  const r = await dialog.showOpenDialog(BrowserWindow.fromWebContents(e.sender), { title: 'OAuth istemci dosyası (client_secret….json)', filters: [{ name: 'JSON', extensions: ['json'] }], properties: ['openFile'] });
  if (r.canceled) return sheets.status();
  return sheets.setConfig({ clientJson: fs.readFileSync(r.filePaths[0], 'utf8') });
}));

app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.whenReady().then(() => { Menu.setApplicationMenu(null); createWindow(); });
app.on('window-all-closed', () => app.quit());
