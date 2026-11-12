// Orvane · yapay zekâ çalışanları için Claude API bağlantısı (ana süreç)
// Anahtar Windows şifrelemesiyle saklanır, arayüze hiç gönderilmez. Her çağrıdan önce aylık bütçe denetlenir.
const { app, safeStorage } = require('electron');
const fs = require('fs');
const path = require('path');
const mod = require('@anthropic-ai/sdk');
const Anthropic = mod.default || mod;

const KEY = () => path.join(app.getPath('userData'), 'zeka-anahtar.bin');
const CFG = () => path.join(app.getPath('userData'), 'zeka.json');
const LOG = () => path.join(app.getPath('userData'), 'zeka-harcama.json');

// $ / 1M token: giriş, çıkış, önbellek okuma, önbellek yazma (5 dk)
const FIYAT = {
  'claude-opus-5-5': [4, 20, 0.2, 5],
  'claude-sonnet-5-5': [2, 10, 0.1, 2.5],
  'claude-haiku-5-5': [0.1, 0.5, 0.01, 0.125],
};
const MODELLER = Object.keys(FIYAT);

// 0.7.20 (Ada): okunamayan (bozuk) dosya sessizce {} sayılıp üzerine yazılmaz → önce .bozuk-<zaman> yedeği alınır
function okuJ(f, d) {
  let t; try { t = fs.readFileSync(f, 'utf8'); } catch (e) { return d; }
  try { return JSON.parse(t); } catch (e) { try { fs.copyFileSync(f, f + '.bozuk-' + Date.now()); } catch (er) {} return d; }
}
// Atomik yazım: geçici dosya + yeniden adlandırma (yarıda kalan yazım dosyayı bozmaz)
function yazJ(f, v) { const t = f + '.tmp'; fs.writeFileSync(t, JSON.stringify(v, null, 1)); fs.renameSync(t, f); }
function ayAnahtari() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
// Anahtar ve harcama defteri bellekte tutulur (status() her çağrıda diski okuyup şifre çözmesin); yazınca güncellenir
let _anh, _def = null;
function anahtar() { if (_anh === undefined) { try { _anh = safeStorage.decryptString(fs.readFileSync(KEY())); } catch (e) { _anh = null; } } return _anh; }
function cfg() { return Object.assign({ butce: 10 }, okuJ(CFG(), {})); }
// Harcama defteri: aylara göre; her ayın günlük toplamı (canlı grafik için) ve çalışan başına dökümü
function defter() { if (_def) return _def; const d = okuJ(LOG(), null); if (d && d.aylar) return (_def = d); const y = { aylar: {} }; if (d && d.ay) y.aylar[d.ay] = d; return (_def = y); }
function defterYaz(d) { _def = d; yazJ(LOG(), d); }
function bosAy() { return { usd: 0, giris: 0, cikis: 0, onbellek: 0, istek: 0, kisi: {}, gun: {} }; }
function harcama() { const d = defter(), a = ayAnahtari(), m = d.aylar[a] || {}; return Object.assign({ ay: a }, bosAy(), JSON.parse(JSON.stringify(m))); }
// Süren istekler: bütçe kontrolü yalnız biten harcamaya değil, yoldaki isteklere de bakar (aynı anda giden istekler bütçeyi aşmasın)
let _yolda = 0; const YOLDA_TAHMIN = 0.02;
function aylar() { const d = defter(), r = {}; Object.keys(d.aylar).sort().slice(-12).forEach((k) => { r[k] = Math.round((d.aylar[k].usd || 0) * 10000) / 10000; }); return r; }

function status() {
  const k = anahtar(), c = cfg(), h = harcama();
  return { anahtar: !!k, ipucu: k ? '…' + k.slice(-4) : '', butce: c.butce, harcama: h, aylar: aylar(), modeller: MODELLER };
}
function setKey(k) {
  k = String(k || '').trim();
  if (!/^sk-ant-/.test(k)) throw new Error('Bu bir Claude API anahtarı gibi görünmüyor (sk-ant- ile başlamalı)');
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Windows şifreleme kullanılamıyor; anahtar kaydedilmedi');
  fs.writeFileSync(KEY(), safeStorage.encryptString(k)); _c = null; _anh = k; return status();
}
function clearKey() { try { fs.unlinkSync(KEY()); } catch (e) {} _c = null; _anh = null; return status(); }
function setBudget(b) { b = Number(b); if (!(b >= 0 && b <= 1000)) throw new Error('Bütçe 0 ile 1000 $ arasında olmalı'); yazJ(CFG(), Object.assign(cfg(), { butce: b })); return status(); }

let _c = null;
function istemci() { const k = anahtar(); if (!k) throw new Error('Yapay zekâ bağlı değil: Ayarlar › Yapay zekâ’dan API anahtarını gir'); if (!_c) _c = new Anthropic({ apiKey: k, maxRetries: 2, timeout: 120000 }); return _c; }

function maliyet(model, u) {
  const p = FIYAT[model] || FIYAT['claude-sonnet-5-5'], M = 1e6;
  return ((u.input_tokens || 0) * p[0] + (u.output_tokens || 0) * p[1] + (u.cache_read_input_tokens || 0) * p[2] + (u.cache_creation_input_tokens || 0) * p[3]) / M;
}
function hataMetni(e) {
  if (e instanceof Anthropic.AuthenticationError) return 'API anahtarı geçersiz: Ayarlar › Yapay zekâ’dan yeniden gir';
  if (e instanceof Anthropic.PermissionDeniedError) return 'Bu anahtarın bu modele izni yok';
  if (e instanceof Anthropic.RateLimitError) return 'Çok sık istek: biraz sonra yeniden dene';
  if (e instanceof Anthropic.BadRequestError) return /credit|balance/i.test(e.message) ? 'Anthropic hesabında kredi yok: console.anthropic.com › Billing' : 'İstek reddedildi: ' + e.message;
  if (e instanceof Anthropic.APIConnectionError) return 'İnternet bağlantısı yok';
  if (e instanceof Anthropic.APIError) return 'Claude hatası (' + e.status + '): ' + e.message;
  return e.message || String(e);
}

/** Bir çalışanın cevabı. o = { kim, model, system, messages:[{role,content}] } */
async function sor(o) {
  const c = cfg(), h = harcama();
  if (h.usd + _yolda * YOLDA_TAHMIN >= c.butce) throw new Error('Bu ayın yapay zekâ bütçesi doldu ($' + c.butce + '). Ayarlar › Yapay zekâ’dan artırabilirsin.');
  if (o.payUsd != null && ((h.kisi[o.kim] || {}).usd || 0) >= o.payUsd) throw new Error('PAY: bu ayki payı doldu, bekliyor');
  const model = MODELLER.includes(o.model) ? o.model : 'claude-haiku-5-5', cl = istemci();
  const govde = {
    model, max_tokens: Math.min(16000, Math.max(256, Number(o.maxTokens) || 4000)),
    system: [{ type: 'text', text: String(o.system || ''), cache_control: { type: 'ephemeral' } }],
    output_config: { effort: o.effort === 'medium' ? 'medium' : 'low' }, // sohbet: kısa ve hızlı; görev: orta
    messages: o.messages,
  };
  let r; const sec = { timeout: Math.min(600000, Math.max(5000, Number(o.zamanAsimiMs) || 120000)) };
  _yolda++;
  try {
    // Sonnet 5.5: güvenlik reddinde sunucu tarafı yedek model (fallbacks: "default"); Haiku'da yedek yok
    r = model === 'claude-sonnet-5-5'
      ? await cl.beta.messages.create(Object.assign({}, govde, { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }), sec)
      : await cl.messages.create(govde, sec);
  } catch (e) { if (e instanceof Anthropic.APIConnectionTimeoutError) throw new Error('Süre sınırı doldu'); throw new Error(hataMetni(e)); }
  finally { _yolda--; }
  // await sonrası okuma-değiştirme-yazma tek parça (arada await yok) → aynı anda biten istekler birbirinin kaydını ezmez
  const u = r.usage || {}, usd = maliyet(r.model || model, u);
  const y = harcama(); y.usd += usd; y.giris += u.input_tokens || 0; y.cikis += u.output_tokens || 0; y.onbellek += u.cache_read_input_tokens || 0; y.istek++;
  const k = (y.kisi[o.kim] = y.kisi[o.kim] || { usd: 0, token: 0, istek: 0 }); k.usd += usd; k.token += (u.input_tokens || 0) + (u.output_tokens || 0) + (u.cache_read_input_tokens || 0); k.istek++;
  const g = new Date().getDate(); y.gun[g] = (y.gun[g] || 0) + usd;
  const d = defter(); d.aylar[y.ay] = Object.assign({}, y); delete d.aylar[y.ay].ay; try { defterYaz(d); } catch (e) { /* harcama kaydı yazılamadı; cevap yine döner */ }
  let metin = (r.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  if (r.stop_reason === 'refusal') metin = metin || 'Bu isteğe yardımcı olamıyorum.';
  if (r.stop_reason === 'max_tokens') metin += '\n…(cevap uzun olduğu için kesildi)';
  return { metin, stop: r.stop_reason, token: (u.input_tokens || 0) + (u.output_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0), model: r.model || model, usd, usage: u, harcama: y, aylar: aylar(), butce: c.butce };
}

module.exports = { status, setKey, clearKey, setBudget, sor, MODELLER, _test: { okuJ, yazJ, defterSifirla: () => { _def = null; } } };
