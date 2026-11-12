// Orvane · Claude aboneliği: ağır işler Claude Code CLI (headless, `claude -p`) ile aylık abonelikte yapılır.
// API anahtarı ve oturum değişkenleri alt sürece GEÇMEZ → CLI, bilgisayardaki abonelik girişini kullanır (API kredisi harcanmaz).
// Araçlar yalnız okuma/araştırma; çalışma klasörü Belgeler\Orin\Calisma\<çalışan>. Günlük görev sınırı abonelik limitini korur.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execFile, execFileSync } = require('child_process');
let SURUM = null; // claude --version önbelleği (arka planda bir kez okunur)

let DIR = null, DOCS = null, CFG = null, EXE;
const VARS = { acik: false, gunluk: 5, gunlukSohbet: 60, gunlukToplanti: 300, model: 'sonnet', maxTur: 12, sureDk: 15, gun: '', sayi: 0, sohbet: 0, toplanti: 0, toplam: 0 };
const MODELLER = ['sonnet', 'haiku', 'opus'];
const ARACLAR = 'Read,Glob,Grep,WebSearch,WebFetch';
// İnceleme kipi (Ada'nın program incelemesi): kaynak klasörde yalnız okuma + tek izinli komut (smoke testi, geçici klasörde çalışır)
const INCELEME_ARAC = 'Read,Glob,Grep,Bash', INCELEME_IZIN = ['Read', 'Glob', 'Grep', 'Bash(npx electron . --smoke)'];
// Geliştirme kipi (0.7.14, iş emri): ayrı git dalındaki çalışma kopyasında okuma + düzenleme. Düzenleme yalnız çalışma klasöründe
// (--permission-mode acceptEdits), gerçek veri ve kişisel dosya yasak (koru), git'te yalnız okuma; commit'i Orvane kendisi yapar, push/merge/yayın yok.
const GELISTIR_ARAC = 'Read,Glob,Grep,Edit,Write,Bash', GELISTIR_IZIN = ['Read', 'Glob', 'Grep', 'Bash(npx electron . --smoke)', 'Bash(git status:*)', 'Bash(git diff:*)', 'Bash(git log:*)'];
const GELISTIR_YASAK = ['Bash(git push:*)', 'Bash(git merge:*)', 'Bash(git checkout:*)', 'Bash(git reset:*)', 'Bash(git commit:*)', 'Bash(git branch:*)', 'Bash(git worktree:*)', 'Bash(npm publish:*)', 'Bash(npx eas-cli:*)', 'Bash(eas:*)', 'Bash(gh:*)', 'Bash(curl:*)', 'WebFetch', 'WebSearch'];
function kuralYolu(p) { const s = String(p || '').replace(/\\/g, '/').replace(/^([A-Za-z]):/, (m, d) => '/' + d.toLowerCase()); return '/' + s.replace(/^\/+/, ''); } // C:\a\b → //c/a/b
function koruKurallari(koru) { const r = []; (koru || []).filter(Boolean).forEach(p => { const k = kuralYolu(p), dosya = /\.\w+$/.test(p); ['Read', 'Edit', 'Write'].forEach(t => r.push(t + '(/' + k + (dosya ? '' : '/**') + ')')); }); return r; }
function kaynakAday() { const c = cfg(); return [c.kaynak, DOCS && path.join(DOCS, 'Cloude Dosyaları', 'is-raporu')].filter(Boolean); }
function kaynakGecerli(d) { try { return !!d && JSON.parse(fs.readFileSync(path.join(d, 'package.json'), 'utf8')).name === 'orin' && fs.existsSync(path.join(d, 'main.js')); } catch (e) { return false; } }
function kaynak() { return kaynakAday().find(kaynakGecerli) || null; }

function init(userData, documents) { DIR = userData; DOCS = documents; }
const CFGF = () => path.join(DIR, 'abonelik.json');
// 0.7.20 (Ada): ayar/sayaç dosyası atomik yazılır; bozuksa sessizce sıfırlanmaz, önce .bozuk-<zaman> yedeği alınır
function cfg() {
  if (!CFG) {
    let t = null; try { t = fs.readFileSync(CFGF(), 'utf8'); } catch (e) {}
    try { CFG = Object.assign({}, VARS, t ? JSON.parse(t) : {}); }
    catch (e) { try { fs.copyFileSync(CFGF(), CFGF() + '.bozuk-' + Date.now()); } catch (er) {} CFG = Object.assign({}, VARS); }
  }
  return CFG;
}
let KAYIT_HATA = '';
function kaydet() { try { const f = CFGF(), t = f + '.tmp'; fs.writeFileSync(t, JSON.stringify(CFG, null, 1)); fs.renameSync(t, f); KAYIT_HATA = ''; } catch (e) { KAYIT_HATA = e.message; } }
function bugun() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function sayac() { const c = cfg(); if (c.gun !== bugun()) { c.gun = bugun(); c.sayi = 0; c.sohbet = 0; c.toplanti = 0; } return c; }

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
  if (!EXE) { try { const w = execFileSync('where', ['claude.exe'], { encoding: 'utf8', windowsHide: true, timeout: 5000 }).split(/\r?\n/)[0].trim(); if (w && fs.existsSync(w)) EXE = w; } catch (er) {} }
  return EXE;
}
// Alt süreç ortamı: yalnız sistem değişkenleri (ANTHROPIC_*, CLAUDE_* geçmez)
const ENV_TUT = /^(SystemRoot|SystemDrive|windir|PATH|PATHEXT|USERPROFILE|HOMEDRIVE|HOMEPATH|APPDATA|LOCALAPPDATA|TEMP|TMP|USERNAME|USERDOMAIN|COMPUTERNAME|ProgramFiles|ProgramFiles\(x86\)|ProgramW6432|ProgramData|CommonProgramFiles|ComSpec|OS|PROCESSOR_ARCHITECTURE|NUMBER_OF_PROCESSORS|LANG|HTTPS?_PROXY|NO_PROXY)$/i;
function temizEnv() { const o = {}; for (const k of Object.keys(process.env)) if (ENV_TUT.test(k)) o[k] = process.env[k]; return o; }
function argsOf(o, sistemDosyasi) {
  const c = cfg();
  if (o.mod === 'gelistir') return ['-p', '--output-format', 'json', '--model', MODELLER.includes(o.model) ? o.model : c.model, '--max-turns', String(Math.max(1, Math.min(60, Number(o.maxTur) || 40))),
    '--strict-mcp-config', '--disable-slash-commands', '--setting-sources', '', '--no-session-persistence', '--permission-mode', 'acceptEdits', '--tools', GELISTIR_ARAC,
    '--allowedTools', ...GELISTIR_IZIN, '--disallowedTools', ...GELISTIR_YASAK, ...koruKurallari(o.koru), '--append-system-prompt-file', sistemDosyasi];
  return ['-p', '--output-format', 'json', '--model', MODELLER.includes(o.model) ? o.model : c.model, '--max-turns', String(Math.max(1, Math.min(40, Number(o.maxTur) || c.maxTur))),
    '--strict-mcp-config', '--disable-slash-commands', '--setting-sources', '', '--no-session-persistence', '--tools', o.mod === 'inceleme' ? INCELEME_ARAC : o.araclar != null ? o.araclar : ARACLAR,
    ...(o.mod === 'inceleme' ? ['--allowedTools', ...INCELEME_IZIN] : o.mod === 'jarvis' ? ['--allowedTools', 'Read', 'Glob', 'Grep', '--disallowedTools', 'Edit', 'Write', 'Bash', 'WebFetch', 'WebSearch'] : []), ...(o.mcpDosya ? ['--mcp-config', o.mcpDosya, '--allowedTools', 'mcp__apify'] : []), ...(o.okuDizin && o.okuDizin.length ? ['--add-dir', ...o.okuDizin, '--allowedTools', ...o.okuDizin.map(p => 'Read(/' + kuralYolu(p) + '/**)'), 'Glob', 'Grep'] : []), ...(o.koruEk && o.koruEk.length ? ['--disallowedTools', ...koruKurallari(o.koruEk)] : []), o.sistemTam ? '--system-prompt-file' : '--append-system-prompt-file', sistemDosyasi]; // sohbet: Claude Code'un kendi istemi yerine yalnız çalışanın istemi (≈700 token)
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
  const toplanti = o.tur === 'toplanti', sohbet = o.tur === 'sohbet' || toplanti; // 0.7.16: toplantı cevapları ayrı sayaçta (sohbet sınırını doldurmaz)
  if (!o.test && !sohbet && c.sayi >= c.gunluk) return Promise.reject(Object.assign(new Error('Bugünkü abonelik görevi sınırı doldu (' + c.gunluk + ')'), { kod: 'gunluk' }));
  if (!o.test && toplanti && (c.toplanti || 0) >= (c.gunlukToplanti || 300)) return Promise.reject(Object.assign(new Error('Bugünkü toplantı cevabı sınırı doldu (' + (c.gunlukToplanti || 300) + ')'), { kod: 'gunluk' }));
  if (!o.test && sohbet && !toplanti && (c.sohbet || 0) >= c.gunlukSohbet) return Promise.reject(Object.assign(new Error('Bugünkü abonelik sohbet sınırı doldu (' + c.gunlukSohbet + ')'), { kod: 'gunluk' }));
  const kim = String(o.kim || 'genel').replace(/[^\w-]/g, '');
  const inc = o.mod === 'inceleme', kay = inc ? kaynak() : null, gel = o.mod === 'gelistir' || o.mod === 'jarvis'; // jarvis (0.7.15): Jarvis klasöründe, yalnız okuma
  if (inc && !kay) return Promise.reject(new Error('Orvane kaynak klasörü bulunamadı (Ayarlar › Yapay zekâ › Claude aboneliği › Kaynak klasörü)'));
  if (gel && !(o.cwd && fs.existsSync(o.cwd))) return Promise.reject(new Error('Geliştirme çalışma klasörü yok'));
  // 0.7.20 (Ada): sayaç iş BAŞLARKEN ayrılır (aynı anda başlayan işler günlük sınırı aşamaz); iş başarısız olursa geri verilir
  const alan = toplanti ? 'toplanti' : sohbet ? 'sohbet' : 'sayi';
  const gun0 = c.gun; if (!o.test) { c[alan] = (c[alan] || 0) + 1; kaydet(); }
  const iade = () => { if (o.test) return; const c2 = sayac(); if (c2.gun === gun0 && c2[alan] > 0) { c2[alan]--; kaydet(); } };
  return sirayaAl(!sohbet, () => calistirSimdi(o, c, exe, kim, inc, kay, gel)).then(r => r, e => { iade(); throw e; });
}
// Aynı anda en çok ES_ZAMAN Claude Code süreci; ağır işler (görev, inceleme, geliştirme) en çok ES_AGIR. Fazlası sırada bekler.
const ES_ZAMAN = 3, ES_AGIR = 2, SIRA = []; let AKTIF = 0, AKTIF_AGIR = 0;
function sirayaAl(agir, fn) { return new Promise((res, rej) => { SIRA.push({ agir, fn, res, rej }); pompa(); }); }
function pompa() {
  for (let i = 0; i < SIRA.length && AKTIF < ES_ZAMAN; i++) {
    const s = SIRA[i]; if (s.agir && AKTIF_AGIR >= ES_AGIR) continue;
    SIRA.splice(i--, 1); AKTIF++; if (s.agir) AKTIF_AGIR++;
    let p; try { p = Promise.resolve(s.fn()); } catch (e) { p = Promise.reject(e); }
    p.then(s.res, s.rej).then(() => { AKTIF--; if (s.agir) AKTIF_AGIR--; pompa(); });
  }
}
function siraDurum() { return { aktif: AKTIF, agir: AKTIF_AGIR, bekleyen: SIRA.length }; }
function calistirSimdi(o, c, exe, kim, inc, kay, gel) {
  let sf = null, mf = null; const sil = () => [sf, mf].forEach(f => { if (f) { try { fs.unlinkSync(f); } catch (e) {} } });
  const cwd = gel ? o.cwd : inc ? kay : path.join(DOCS || os.homedir(), 'Orin', 'Calisma', kim);
  try {
    fs.mkdirSync(cwd, { recursive: true });
    sf = path.join(os.tmpdir(), 'orvane-sistem-' + process.pid + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6) + '.txt'); fs.writeFileSync(sf, String(o.sistem || ''), 'utf8');
    if (o.mcp && typeof o.mcp === 'object') { mf = path.join(os.tmpdir(), 'orvane-mcp-' + process.pid + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6) + '.json'); fs.writeFileSync(mf, JSON.stringify(o.mcp), { mode: 0o600 }); o = Object.assign({}, o, { mcpDosya: mf }); }
  } catch (e) { sil(); return Promise.reject(e); }
  const sure = Math.max(30000, Math.min(60 * 60000, Number(o.zamanAsimiMs) || c.sureDk * 60000));
  return new Promise((res, rej) => {
    let out = '', err = '', bitti = false, p;
    try { p = spawn(exe, argsOf(o, sf), { cwd, env: temizEnv(), windowsHide: true }); } catch (e) { sil(); rej(e); return; } // eşzamanlı spawn hatasında geçici dosya kalmasın
    const zam = setTimeout(() => { if (bitti) return; bitti = true; try { p.kill(); } catch (e) {} temizle(); rej(Object.assign(new Error('Süre doldu (' + Math.round(sure / 60000) + ' dk)'), { kod: 'sure' })); }, sure);
    function temizle() { clearTimeout(zam); try { fs.unlinkSync(sf); } catch (e) {} if (mf) { try { fs.unlinkSync(mf); } catch (e) {} } }
    p.stdout.on('data', d => { out += d; }); p.stderr.on('data', d => { err += d; });
    p.on('error', e => { if (bitti) return; bitti = true; temizle(); rej(e); });
    p.on('close', code => {
      if (bitti) return; bitti = true; temizle();
      try { const r = sonucOku(out); if (inc) r.rapor = raporYaz(r); if (!o.test) { c.toplam++; c.son = new Date().toISOString(); kaydet(); } res(r); }
      catch (e) { if (!out.trim() && err.trim()) e.message = 'Claude Code çalışmadı (' + code + '): ' + err.trim().split(/\r?\n/).pop().slice(0, 200); rej(e); }
    });
    p.stdin.end(String(o.istem || ''), 'utf8');
  });
}
function raporYaz(r) {
  try {
    const d = path.join(DOCS || os.homedir(), 'Orin', 'Ada Raporları'); fs.mkdirSync(d, { recursive: true });
    const t = new Date(), p2 = n => String(n).padStart(2, '0'), ad = 'program-incelemesi-' + t.getFullYear() + '-' + p2(t.getMonth() + 1) + '-' + p2(t.getDate()) + '-' + p2(t.getHours()) + '-' + p2(t.getMinutes()) + '.md';
    const f = path.join(d, ad); fs.writeFileSync(f, '# Ada · Orvane program incelemesi (' + t.toLocaleString('tr-TR') + ', ' + Math.round((r.sureMs || 0) / 6000) / 10 + ' dk, ' + r.tur + ' tur)\n\n' + String(r.metin).replace(/ÖĞRENİLENLER\s*:[\s\S]*$/i, '').trim() + '\n', 'utf8');
    return f;
  } catch (e) { return null; }
}
function status() {
  const c = sayac(), exe = bul();
  if (exe && SURUM === null) { SURUM = ''; execFile(exe, ['--version'], { encoding: 'utf8', windowsHide: true, timeout: 15000, env: temizEnv() }, (e, o) => { SURUM = e ? '' : String(o).trim(); }); }
  const surum = SURUM || null;
  return { sira: siraDurum(), kayitHata: KAYIT_HATA || null, kurulu: !!exe, yol: exe, surum, acik: !!c.acik, gunluk: c.gunluk, model: c.model, maxTur: c.maxTur, sureDk: c.sureDk, kaynak: kaynak(), raporlar: path.join(DOCS || os.homedir(), 'Orin', 'Ada Raporları'), bugun: c.sayi, gunlukSohbet: c.gunlukSohbet, sohbetBugun: c.sohbet || 0, gunlukToplanti: c.gunlukToplanti || 300, toplantiBugun: c.toplanti || 0, toplam: c.toplam, son: c.son || null, test: c.test || null };
}
function setAyar(a) {
  const c = cfg(); a = a || {};
  if (a.acik != null) c.acik = !!a.acik;
  if (a.gunluk != null) c.gunluk = Math.max(0, Math.min(50, Math.round(Number(a.gunluk) || 0)));
  if (a.gunlukSohbet != null) c.gunlukSohbet = Math.max(0, Math.min(500, Math.round(Number(a.gunlukSohbet) || 0)));
  if (a.gunlukToplanti != null) c.gunlukToplanti = Math.max(0, Math.min(1000, Math.round(Number(a.gunlukToplanti) || 0)));
  if (a.kaynak != null) c.kaynak = String(a.kaynak);
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
// Arka plan işleri (0.7.17): Orvane'nin başlattığı her Claude Code işi kaydedilir (çalışan, tür, süre, token, sonuç); Çalışanlarım › Arka plan işleri
const ISLER = [], ISTUR = { sohbet: 'Sohbet cevabı', toplanti: 'Toplantı cevabı', inceleme: 'Program incelemesi', gelistir: 'İş emri (geliştirme)', jarvis: 'Jarvis sohbeti' };
let ISYUK = false;
function islerDosya() { return path.join(DIR, 'arkaplan.json'); }
function islerYukle() { if (ISYUK || !DIR) return; ISYUK = true; try { JSON.parse(fs.readFileSync(islerDosya(), 'utf8')).forEach(x => { if (x.durum === 'calisiyor') { x.durum = 'hata'; x.hata = 'Orvane kapanınca yarıda kaldı'; } ISLER.push(x); }); } catch (e) {} }
function islerKaydet() { try { const f = islerDosya(), t = f + '.tmp'; fs.writeFileSync(t, JSON.stringify(ISLER.slice(-60))); fs.renameSync(t, f); } catch (e) {} }
function calistirIzle(o) {
  o = o || {}; islerYukle();
  const tur = o.mod === 'inceleme' || o.mod === 'gelistir' || o.mod === 'jarvis' ? o.mod : o.tur === 'sohbet' || o.tur === 'toplanti' ? o.tur : 'gorev';
  const j = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), kim: String(o.kim || 'genel'), tur, etiket: String(o.etiket || ISTUR[tur] || String(o.istem || '').split(/\r?\n/).find(x => x.trim()) || 'Görev').slice(0, 90), model: o.model || cfg().model, basla: Date.now(), durum: 'calisiyor' };
  if (!o.test) { ISLER.push(j); if (ISLER.length > 60) ISLER.splice(0, ISLER.length - 60); }
  const bitir = (r, e) => { j.bitis = Date.now(); j.sureMs = j.bitis - j.basla; if (r) { j.durum = 'bitti'; j.token = r.token || 0; j.adim = r.tur || 0; if (r.model) j.model = r.model; } else { j.durum = 'hata'; j.hata = String(e && e.message || e).slice(0, 200); } if (!o.test) islerKaydet(); };
  return calistir(o).then(r => { bitir(r); return r; }, e => { bitir(null, e); throw e; });
}
function isler() { islerYukle(); return ISLER.slice().reverse(); }
module.exports = { _sirayaAl: sirayaAl, siraDurum, isler, calistirIzle, kaynak, koruKurallari, kuralYolu, kaynakGecerli, raporYaz, init, status, setAyar, test, calistir, bul, temizEnv, argsOf, sonucOku, MODELLER };
