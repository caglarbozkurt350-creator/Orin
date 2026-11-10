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
async function api(p) {
  const c = readCfg(); if (!c.sheetId) throw new Error('Sheet bağlanmadı');
  const r = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + c.sheetId + p, { headers: { Authorization: 'Bearer ' + await token() } });
  const j = await r.json(); if (j.error) throw new Error('Sheets: ' + j.error.message); return j;
}
async function meta() { const j = await api('?fields=properties.title,sheets.properties(title,gridProperties.rowCount)'); return { title: j.properties.title, tabs: j.sheets.map(s => s.properties.title) }; }
async function read(range) { const j = await api('/values/' + encodeURIComponent(range) + '?valueRenderOption=FORMATTED_VALUE'); return j.values || []; }

module.exports = { cancel, authUrl, reopen, status, setConfig, login, logout, meta, read, sheetIdFrom, parseClient };
