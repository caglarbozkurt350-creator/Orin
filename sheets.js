// Orin · Google Sheets bağlantısı (OAuth 2.0 masaüstü, loopback + PKCE). Token Windows kimlik deposuyla şifrelenir.
const { app, safeStorage, shell } = require('electron');
const http = require('http'), crypto = require('crypto'), path = require('path'), fs = require('fs');

const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const CFG = () => path.join(app.getPath('userData'), 'sheets.json');
const TOK = () => path.join(app.getPath('userData'), 'google-token.bin');
let access = null; // { token, exp }
let pending = null; // süren giriş: { srv, url, reject }
function cancel() { if (pending) { try { pending.srv.close(); } catch (e) {} const r = pending.reject; pending = null; r(new Error('Giriş iptal edildi')); } return true; }
function authUrl() { return pending ? pending.url : null; }
function reopen() { if (pending) shell.openExternal(pending.url); return !!pending; }

function readCfg() { try { return JSON.parse(fs.readFileSync(CFG(), 'utf8')); } catch (e) { return {}; } }
function writeCfg(c) { fs.writeFileSync(CFG(), JSON.stringify(c, null, 1)); }
function saveToken(t) {
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Windows şifreleme kullanılamıyor; token kaydedilmedi');
  fs.writeFileSync(TOK(), safeStorage.encryptString(JSON.stringify(t)));
}
function loadToken() { try { return JSON.parse(safeStorage.decryptString(fs.readFileSync(TOK()))); } catch (e) { return null; } }

function sheetIdFrom(s) { const m = /\/d\/([a-zA-Z0-9_-]{20,})/.exec(s || ''); return m ? m[1] : (/^[a-zA-Z0-9_-]{20,}$/.test(s || '') ? s : null); }

// Google Cloud'dan indirilen "masaüstü uygulaması" istemci JSON'unu okur
function parseClient(txt) {
  const j = JSON.parse(txt), c = j.installed || j.web || j;
  if (!c.client_id || !c.client_secret) throw new Error('Dosyada client_id / client_secret bulunamadı');
  return { clientId: c.client_id, clientSecret: c.client_secret };
}

function status() {
  const c = readCfg(), t = loadToken();
  return { sheetId: c.sheetId || '', hasClient: !!(c.clientId && c.clientSecret), loggedIn: !!(t && t.refresh_token), map: c.map || null, tabs: c.tabs || null, lastSync: c.lastSync || null, email: c.email || '' };
}
function setConfig(p) {
  const c = readCfg();
  if (p.sheet !== undefined) { const id = sheetIdFrom(p.sheet); if (!id) throw new Error('Sheet bağlantısı tanınmadı'); c.sheetId = id; }
  if (p.clientJson) Object.assign(c, parseClient(p.clientJson));
  if (p.map !== undefined) c.map = p.map;
  if (p.tabs !== undefined) c.tabs = p.tabs;
  if (p.lastSync !== undefined) c.lastSync = p.lastSync;
  writeCfg(c); return status();
}

function login() {
  const c = readCfg();
  if (!c.clientId) return Promise.reject(new Error('Önce OAuth istemci dosyasını seç'));
  const verifier = crypto.randomBytes(48).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  const state = crypto.randomBytes(16).toString('hex');
  if (pending) cancel();
  return new Promise((resolve, reject) => {
    const srv = http.createServer(async (req, res) => {
      const u = new URL(req.url, 'http://127.0.0.1');
      if (u.pathname !== '/cb') { res.writeHead(404); res.end(); return; }
      const done = (ok, msg) => { pending = null; res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end('<html><body style="font-family:Segoe UI;background:#181818;color:#ececec;padding:40px"><h2>' + (ok ? 'Orin bağlandı ✓' : 'Bağlantı kurulamadı') + '</h2><p>' + msg + '</p><p>Bu sekmeyi kapatabilirsin.</p></body></html>'); srv.close(); };
      if (u.searchParams.get('state') !== state) { done(false, 'Güvenlik kontrolü tutmadı.'); return reject(new Error('state uyuşmadı')); }
      if (u.searchParams.get('error')) { done(false, u.searchParams.get('error')); return reject(new Error('Google: ' + u.searchParams.get('error'))); }
      try {
        const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: u.searchParams.get('code'), client_id: c.clientId, client_secret: c.clientSecret, code_verifier: verifier, grant_type: 'authorization_code', redirect_uri: redirect }) });
        const t = await r.json(); if (!t.refresh_token) throw new Error(t.error_description || t.error || 'refresh_token gelmedi');
        saveToken({ refresh_token: t.refresh_token }); access = { token: t.access_token, exp: Date.now() + (t.expires_in - 60) * 1000 };
        done(true, 'Orin uygulamasına dönebilirsin.'); resolve(status());
      } catch (e) { done(false, e.message); reject(e); }
    });
    let redirect;
    srv.listen(0, '127.0.0.1', () => {
      redirect = 'http://127.0.0.1:' + srv.address().port + '/cb';
      const q = new URLSearchParams({ client_id: c.clientId, redirect_uri: redirect, response_type: 'code', scope: SCOPE, access_type: 'offline', prompt: 'consent', code_challenge: challenge, code_challenge_method: 'S256', state });
      const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + q;
      pending = { srv, url, reject };
      shell.openExternal(url);
    });
    setTimeout(() => { if (pending && pending.srv === srv) pending = null; try { srv.close(); } catch (e) {} reject(new Error('Zaman aşımı: 5 dakika içinde giriş yapılmadı')); }, 300000).unref();
  });
}
function logout() { access = null; try { fs.unlinkSync(TOK()); } catch (e) {} return status(); }

async function token() {
  if (access && access.exp > Date.now()) return access.token;
  const c = readCfg(), t = loadToken();
  if (!t || !t.refresh_token) throw new Error('Google oturumu yok');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: c.clientId, client_secret: c.clientSecret, refresh_token: t.refresh_token, grant_type: 'refresh_token' }) });
  const j = await r.json(); if (!j.access_token) throw new Error('Oturum yenilenemedi: ' + (j.error_description || j.error));
  access = { token: j.access_token, exp: Date.now() + (j.expires_in - 60) * 1000 }; return access.token;
}
async function api(p, method, body) {
  const c = readCfg(); if (!c.sheetId) throw new Error('Sheet bağlanmadı');
  let r;
  try {
    r = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + c.sheetId + p, { method: method || 'GET', headers: { Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  } catch (e) { const er = new Error('İnternet bağlantısı yok'); er.offline = true; throw er; }
  const j = await r.json(); if (j.error) throw new Error('Sheets: ' + j.error.message); return j;
}
async function meta() { const j = await api('?fields=properties.title,sheets.properties(title,gridProperties.rowCount)'); return { title: j.properties.title, tabs: j.sheets.map(s => s.properties.title) }; }
async function read(range) { const j = await api('/values/' + encodeURIComponent(range) + '?valueRenderOption=FORMATTED_VALUE'); return j.values || []; }

// ---------- Yazma (Aşama 3) ----------
// Kurallar: eşlenmemiş sütunlara (ör. F "Ay" formülü) asla yazılmaz; satır silinmez, içeriği temizlenir;
// düzenleme/silmeden önce satır yeniden okunur ve parmak izi tutmazsa çakışma döner.
const q = t => "'" + String(t).replace(/'/g, "''") + "'";
const col = i => String.fromCharCode(65 + i);
function pDate(s) { s = String(s || '').trim(); let m = /^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/.exec(s); if (m) return +m[3] + '-' + +m[2] + '-' + +m[1]; m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s); return m ? +m[1] + '-' + +m[2] + '-' + +m[3] : ''; }
function pMin(s) { const n = parseFloat(String(s || '').replace(/[^\d,.-]/g, '').replace(',', '.')); return n > 0 ? n : 0; }
function fpOf(row, m) { const g = i => (i >= 0 ? String(row[i] == null ? '' : row[i]).trim() : ''); return [pDate(g(m.tarih)), g(m.kod), g(m.is), String(pMin(g(m.dk)))].join('|'); }
const FIELDS = ['tarih', 'kod', 'parca', 'is', 'dk', 'izin'];
// Kayıt alanlarını eşlenen sütunlara yerleştirir; bitişik sütunları tek aralıkta toplar
function rangesFor(rowNo, rec, m) {
  const cells = FIELDS.filter(f => m[f] >= 0 && rec[f] !== undefined).map(f => [m[f], rec[f] === null ? '' : rec[f]]).sort((a, b) => a[0] - b[0]);
  const out = []; let cur = null;
  cells.forEach(([i, v]) => { if (cur && i === cur.end + 1) { cur.vals.push(v); cur.end = i; } else { cur = { start: i, end: i, vals: [v] }; out.push(cur); } });
  return out.map(r => ({ range: q(m.tab) + '!' + col(r.start) + rowNo + ':' + col(r.end) + rowNo, values: [r.vals] }));
}
function mappedCols(m) { return FIELDS.filter(f => m[f] >= 0).map(f => m[f]).sort((a, b) => a - b); }
async function readRow(m, rowNo) { const v = await read(q(m.tab) + '!A' + rowNo + ':Z' + rowNo); return v[0] || []; }
async function writeRanges(data) { return api('/values:batchUpdate', 'POST', { valueInputOption: 'USER_ENTERED', data }); }
function needMap() { const m = readCfg().map; if (!m) throw new Error('Sütun eşlemesi onaylanmadı'); return m; }

async function addRec(rec) {
  const m = needMap();
  for (let tries = 0; tries < 3; tries++) {
    const a = await read(q(m.tab) + '!' + col(m.tarih) + ':' + col(m.tarih));
    const rowNo = Math.max(2, a.length + 1);
    const cur = await readRow(m, rowNo);
    if (mappedCols(m).some(i => String(cur[i] || '').trim())) continue; // biri araya yazdı: tekrar dene
    await writeRanges(rangesFor(rowNo, rec, m));
    const merged = []; FIELDS.forEach(f => { if (m[f] >= 0 && rec[f] !== undefined) merged[m[f]] = rec[f]; });
    return { row: rowNo, fp: fpOf(merged, m) };
  }
  throw new Error('Boş satır bulunamadı, sonra tekrar denenecek');
}
async function updRec({ row, fp, rec, force }) {
  const m = needMap(); const cur = await readRow(m, row);
  if (!force && fpOf(cur, m) !== fp) return { conflict: true, current: cur };
  await writeRanges(rangesFor(row, rec, m));
  const merged = cur.slice(); FIELDS.forEach(f => { if (m[f] >= 0 && rec[f] !== undefined) merged[m[f]] = rec[f]; });
  return { row, fp: fpOf(merged, m) };
}
// Aynı tarihte izin türü dolu bir satır var mı (çift izin satırını önler)
async function findLeave({ tarih }) {
  const m = needMap(); if (!(m.izin >= 0)) return null; const want = pDate(tarih);
  const v = await read(q(m.tab) + '!A2:Z');
  for (let i = 0; i < v.length; i++) { const r = v[i]; if (pDate(r[m.tarih]) === want && String(r[m.izin] || '').trim()) return { row: i + 2, fp: fpOf(r, m), kod: String(r[m.kod] || '').trim(), is: String(r[m.is] || '').trim() }; }
  return null;
}
async function delRec({ row, fp, force }) {
  const m = needMap(); const cur = await readRow(m, row);
  if (!mappedCols(m).some(i => String(cur[i] || '').trim())) return { row, gone: true }; // zaten boş
  if (!force && fpOf(cur, m) !== fp) return { conflict: true, current: cur };
  const blank = {}; FIELDS.forEach(f => { if (m[f] >= 0) blank[f] = ''; });
  await writeRanges(rangesFor(row, blank, m)); return { row };
}
// Projeler sekmesi: A kod, B ad, C durum. Yoksa açılır ve verilen liste bir kerede yazılır.
async function ensureTab(title, header, seed) {
  const mt = await meta(); if (mt.tabs.includes(title)) return false;
  await api(':batchUpdate', 'POST', { requests: [{ addSheet: { properties: { title } } }] });
  await writeRanges([{ range: q(title) + '!A1', values: [header].concat(seed || []) }]);
  return true;
}
async function upsertKey({ tab, header, key, values, seed }) {
  if (await ensureTab(tab, header, seed)) return { created: true };
  const a = await read(q(tab) + '!A:A'); let r = a.findIndex(x => String(x[0] || '').trim() === key) + 1;
  if (!r) r = a.length + 1;
  await writeRanges([{ range: q(tab) + '!A' + r, values: [[key].concat(values)] }]); return { row: r };
}
async function deleteKey({ tab, key, width }) {
  const mt = await meta(); if (!mt.tabs.includes(tab)) return { gone: true };
  const a = await read(q(tab) + '!A:A'); const r = a.findIndex(x => String(x[0] || '').trim() === key) + 1;
  if (!r) return { gone: true };
  await writeRanges([{ range: q(tab) + '!A' + r + ':' + col((width || 3) - 1) + r, values: [Array(width || 3).fill('')] }]); return { row: r };
}

module.exports = { cancel, authUrl, reopen, status, setConfig, login, logout, meta, read, sheetIdFrom, parseClient, addRec, updRec, delRec, findLeave, upsertKey, deleteKey, fpOf, rangesFor };
