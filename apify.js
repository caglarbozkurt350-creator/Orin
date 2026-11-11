// Orvane 0.7.18 · Apify (Sage'in sosyal medya araştırması): anahtar Windows şifrelemesiyle (safeStorage) saklanır,
// arayüze asla gönderilmez; yalnız izinli çalışanların abonelik görevlerine Apify MCP bağlantısı (mcp.apify.com) eklenir.
const fs = require('fs');
const path = require('path');
const { safeStorage } = require('electron');

let DIR = null;
function init(d) { DIR = d; }
const F = () => path.join(DIR, 'apify.json'), K = () => path.join(DIR, 'apify.key');
function cfg() { try { return Object.assign({ calisanlar: ['sage'] }, JSON.parse(fs.readFileSync(F(), 'utf8'))); } catch (e) { return { calisanlar: ['sage'] }; } }
function yaz(c) { const t = F() + '.tmp'; fs.writeFileSync(t, JSON.stringify(c, null, 1)); fs.renameSync(t, F()); }
function anahtar() { try { return safeStorage.decryptString(fs.readFileSync(K())); } catch (e) { return null; } }
function durum() { const c = cfg(), a = anahtar(); return { var: !!a, ipucu: a ? '…' + a.slice(-4) : '', calisanlar: c.calisanlar, test: c.test || null }; }
function gecerli(t) { return /^apify_api_[A-Za-z0-9]{20,}$/.test(String(t || '').trim()); }
function kaydet(t) {
  t = String(t || '').trim();
  if (!gecerli(t)) throw new Error('Bu bir Apify API anahtarına benzemiyor (apify_api_ ile başlar)');
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Windows şifreleme kullanılamıyor; anahtar kaydedilmedi');
  fs.writeFileSync(K(), safeStorage.encryptString(t)); const c = cfg(); delete c.test; yaz(c); return durum();
}
function sil() { try { fs.unlinkSync(K()); } catch (e) {} const c = cfg(); delete c.test; yaz(c); return durum(); }
function calisanlar(L) { const c = cfg(); c.calisanlar = (Array.isArray(L) ? L : []).map(String).filter(x => /^[\w-]{1,40}$/.test(x)).slice(0, 20); yaz(c); return durum(); }
function izinli(kim) { return !!anahtar() && cfg().calisanlar.includes(String(kim || '')); }
function mcp() { const a = anahtar(); if (!a) return null; return { mcpServers: { apify: { type: 'http', url: 'https://mcp.apify.com', headers: { Authorization: 'Bearer ' + a } } } }; }
function testKaydet(t) { const c = cfg(); c.test = t; yaz(c); return durum(); }
module.exports = { init, durum, kaydet, sil, calisanlar, izinli, mcp, testKaydet, gecerli };
