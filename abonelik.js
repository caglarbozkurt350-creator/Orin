// Orvane · Claude aboneliği: ağır işler Claude Code CLI (headless, `claude -p`) ile aylık abonelikte yapılır.
// API anahtarı ve oturum değişkenleri alt sürece GEÇMEZ → CLI, bilgisayardaki abonelik girişini kullanır (API kredisi harcanmaz).
// Araçlar yalnız okuma/araştırma; çalışma klasörü Belgeler\Orin\Calisma\<çalışan>. Günlük görev sınırı abonelik limitini korur.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execFileSync } = require('child_process');

let DIR = null, DOCS = null, CFG = null, EXE;
const VARS = { acik: false, gunluk: 5, gunlukSohbet: 60, model: 'sonnet', maxTur: 12, sureDk: 15, gun: '', sayi: 0, sohbet: 0, toplam: 0 };
const MODELLER = ['sonnet', 'haiku', 'opus'];
const ARACLAR = 'Read,Glob,Grep,WebSearch,WebFetch';

function init(userData, documents) { DIR = userData; DOCS = documents; }
const CFGF = () => path.join(DIR, 'abonelik.json');
function cfg() { if (!CFG) { try { CFG = Object.assign({}, VARS, JSON.parse(fs.readFileSync(CFGF(), 'utf8'))); } catch (e) { CFG = Object.assign({}, VARS); } } return CFG; }
function kaydet() { try { fs.writeFileSync(CFGF(), JSON.stringify(CFG, null, 1)); } catch (e) {} }
function bugun() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function sayac() { const c = cfg(); if (c.gun !== bugun()) { c.gun = bugun(); c.sayi = 0; c.sohbet = 0; } return c; }

// claude.exe: önce resmi npm kurulumu, sonra yerel kurulum, en son PATH
function bul() {
  if (EXE !== undefined && (!EXE || fs.existsSync(EXE))) return EXE;
  const e = process.env, aday = [
    e.ORVANE_CLAUDE,
    e.APPDATA && path.join(e.APPDATA, 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe'),
    e.USERPROFILE && path.join(e.USERPROFILE, '.local', 'bin', 'claude.exe'),
    e.LOCALAPPDATA && path.join(e.LOCALAPPDATA, 'Programs', 'claude', 'claude.exe')
  ].filter(Boolean);
  EXE = aday.find(f => { try { return fs.statSync(f).isFile(); } catch (er) { return false; } }) || null;
  if (!EXE) { try { const w = execFileSync('where', ['claude.exe'], { encoding: 'utf8', windowsHide: true }).split(/\r?\n/)[0].trim(); if (w && fs.existsSync(w)) EXE = w; } catch (er) {} }
  return EXE;
}
// Alt süreç ortamı: yalnız sistem değişkenleri (ANTHROPIC_*, CLAUDE_* geçmez)
const ENV_TUT = /^(SystemRoot|SystemDrive|windir|PATH|PATHEXT|USERPROFILE|HOMEDRIVE|HOMEPATH|APPDATA|LOCALAPPDATA|TEMP|TMP|USERNAME|USERDOMAIN|COMPUTERNAME|ProgramFiles|ProgramFiles\(x86\)|ProgramW6432|ProgramData|CommonProgramFiles|ComSpec|OS|PROCESSOR_ARCHITECTURE|NUMBER_OF_PROCESSORS|LANG|HTTPS?_PROXY|NO_PROXY)$/i;
function temizEnv() { const o = {}; for (const k of Object.keys(process.env)) if (ENV_TUT.test(k)) o[k] = process.env[k]; return o; }
function argsOf(o, sistemDosyasi) {
  const c = cfg();
  return ['-p', '--output-format', 'json', '--model', MODELLER.includes(o.model) ? o.model : c.model, '--max-turns', String(Math.max(1, Math.min(40, Number(o.maxTur) || c.maxTur))),
    '--strict-mcp-config', '--disable-slash-commands', '--setting-sources', '', '--no-session-persistence', '--tools', o.araclar != null ? o.araclar : ARACLAR,
    o.sistemTam ? '--system-prompt-file' : '--append-system-prompt-file', sistemDosyasi]; // sohbet: Claude Code'un kendi istemi yerine yalnız çalışanın istemi (≈700 token)
}
function sonucOku(out) {
  let j = null; try { j = JSON.parse(out.trim().split(/\r?\n/).filter(Boolean).pop()); } catch (e) {}
  if (!j || typeof j !== 'object') throw new Error('Claude Code cevabı okunamadı: ' + String(out).slice(0, 160));
  const metin = String(j.result || '');
  if (j.is_error || (j.subtype && j.subtype !== 'success')) {
    const e = new Error(/limit/i.test(metin) ? 'Abonelik kullanım limiti doldu; sıfırlanınca tekrar denenecek' : /login|auth|api key|oturum/i.test(metin) ? 'Claude Code girişi yok: bir kez terminalde `claude` yazıp abonelik hesabınla giriş yap' : j.subtype === 'error_max_turns' ? 'İş, tur sınırına ulaştı (' + j.num_turns + ')' : (metin || j.subtype || 'Claude Code hatası').slice(0, 300));
    e.kod = /limit/i.test(metin) ? 'limit' : /login|auth|api key/i.test(metin) ? 'giris' : j.subtype || 'hata'; e.metin = metin; throw e;
  }
  const u = j.usage || {};
  return { metin, tur: j.num_turns || 0, sureMs: j.duration_ms || 0, token: (u.input_tokens || 0) + (u.output_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0), apiKarsiligiUsd: j.total_cost_usd || 0, model: Object.keys(j.modelUsage || {})[0] || '' };
}
function calistir(o) {
  o = o || {};
  const exe = bul(); if (!exe) return Promise.reject(new Error('Claude Code bu bilgisayarda kurulu değil'));
  const c = sayac();
  const sohbet = o.tur === 'sohbet';
  if (!o.test && !sohbet && c.sayi >= c.gunluk) return Promise.reject(Object.assign(new Error('Bugünkü abonelik görevi sınırı doldu (' + c.gunluk + ')'), { kod: 'gunluk' }));
  if (!o.test && sohbet && (c.sohbet || 0) >= c.gunlukSohbet) return Promise.reject(Object.assign(new Error('Bugünkü abonelik sohbet sınırı doldu (' + c.gunlukSohbet + ')'), { kod: 'gunluk' }));
  const kim = String(o.kim || 'genel').replace(/[^\w-]/g, '');
  const cwd = path.join(DOCS || os.homedir(), 'Orin', 'Calisma', kim); fs.mkdirSync(cwd, { recursive: true });
  const sf = path.join(os.tmpdir(), 'orvane-sistem-' + process.pid + '-' + Date.now() + '.txt'); fs.writeFileSync(sf, String(o.sistem || ''), 'utf8');
  const sure = Math.max(30000, Math.min(60 * 60000, Number(o.zamanAsimiMs) || c.sureDk * 60000));
  return new Promise((res, rej) => {
    let out = '', err = '', bitti = false;
    const p = spawn(exe, argsOf(o, sf), { cwd, env: temizEnv(), windowsHide: true });
    const zam = setTimeout(() => { if (bitti) return; bitti = true; try { p.kill(); } catch (e) {} temizle(); rej(Object.assign(new Error('Süre doldu (' + Math.round(sure / 60000) + ' dk)'), { kod: 'sure' })); }, sure);
    function temizle() { clearTimeout(zam); try { fs.unlinkSync(sf); } catch (e) {} }
    p.stdout.on('data', d => { out += d; }); p.stderr.on('data', d => { err += d; });
    p.on('error', e => { if (bitti) return; bitti = true; temizle(); rej(e); });
    p.on('close', code => {
      if (bitti) return; bitti = true; temizle();
      try { const r = sonucOku(out); if (!o.test) { if (sohbet) c.sohbet = (c.sohbet || 0) + 1; else c.sayi++; c.toplam++; c.son = new Date().toISOString(); kaydet(); } res(r); }
      catch (e) { if (!out.trim() && err.trim()) e.message = 'Claude Code çalışmadı (' + code + '): ' + err.trim().split(/\r?\n/).pop().slice(0, 200); rej(e); }
    });
    p.stdin.end(String(o.istem || ''), 'utf8');
  });
}
function status() {
  const c = sayac(), exe = bul(); let surum = null;
  if (exe) { try { surum = execFileSync(exe, ['--version'], { encoding: 'utf8', windowsHide: true, timeout: 15000, env: temizEnv() }).trim(); } catch (e) {} }
  return { kurulu: !!exe, yol: exe, surum, acik: !!c.acik, gunluk: c.gunluk, model: c.model, maxTur: c.maxTur, sureDk: c.sureDk, bugun: c.sayi, gunlukSohbet: c.gunlukSohbet, sohbetBugun: c.sohbet || 0, toplam: c.toplam, son: c.son || null, test: c.test || null };
}
function setAyar(a) {
  const c = cfg(); a = a || {};
  if (a.acik != null) c.acik = !!a.acik;
  if (a.gunluk != null) c.gunluk = Math.max(0, Math.min(50, Math.round(Number(a.gunluk) || 0)));
  if (a.gunlukSohbet != null) c.gunlukSohbet = Math.max(0, Math.min(500, Math.round(Number(a.gunlukSohbet) || 0)));
  if (a.model && MODELLER.includes(a.model)) c.model = a.model;
  if (a.maxTur != null) c.maxTur = Math.max(1, Math.min(40, Math.round(Number(a.maxTur) || 12)));
  if (a.sureDk != null) c.sureDk = Math.max(1, Math.min(60, Math.round(Number(a.sureDk) || 15)));
  kaydet(); return status();
}
async function test() {
  const c = cfg();
  try { const r = await calistir({ test: true, istem: 'Yalnız "tamam" yaz.', sistem: 'Orvane bağlantı denemesi. Tek kelime yaz.', model: 'haiku', maxTur: 1, araclar: '', zamanAsimiMs: 90000 }); c.test = { ok: true, ts: Date.now(), model: r.model }; }
  catch (e) { c.test = { ok: false, ts: Date.now(), hata: e.message, kod: e.kod || null }; }
  kaydet(); return status();
}
module.exports = { init, status, setAyar, test, calistir, bul, temizEnv, argsOf, sonucOku, MODELLER };
