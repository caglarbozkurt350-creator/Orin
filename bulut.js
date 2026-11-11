// Orvane · telefon eşitlemesi (Supabase REST, ek kütüphane yok)
// Telefon olay yazar (orvane_olay); masaüstü olayları okur, işler ve güncel özeti yayınlar (orvane_durum).
// Oturum Windows şifrelemesiyle saklanır; adres ve "publishable" anahtar herkese açık olacak şekilde tasarlanmıştır.
const { app, safeStorage } = require('electron');
const fs = require('fs');
const path = require('path');

const CFG = () => path.join(app.getPath('userData'), 'bulut.json');
const SES = () => path.join(app.getPath('userData'), 'bulut-oturum.bin');
const VARSAYILAN = { url: '', anahtar: '' }; // Orvane Supabase projesi bağlanınca doldurulur

function cfg() { try { const c = JSON.parse(fs.readFileSync(CFG(), 'utf8')); return { url: c.url || VARSAYILAN.url, anahtar: c.anahtar || VARSAYILAN.anahtar }; } catch (e) { return { ...VARSAYILAN }; } }
function setCfg(c) { fs.writeFileSync(CFG(), JSON.stringify({ url: String(c.url || '').trim().replace(/\/+$/, ''), anahtar: String(c.anahtar || '').trim() })); return status(); }
function loadSes() { try { return JSON.parse(safeStorage.decryptString(fs.readFileSync(SES()))); } catch (e) { return null; } }
function saveSes(s) { if (!s) { try { fs.unlinkSync(SES()); } catch (e) {} return; } if (!safeStorage.isEncryptionAvailable()) throw new Error('Windows şifreleme kullanılamıyor'); fs.writeFileSync(SES(), safeStorage.encryptString(JSON.stringify(s))); }

function status() { const c = cfg(), s = loadSes(); return { ayarli: !!(c.url && c.anahtar), url: c.url, anahtar: c.anahtar, varsayilan: !!VARSAYILAN.url, eposta: s ? s.eposta : null }; }

function hata(j, st) {
  const m = (j && (j.msg || j.message || j.error_description || j.error)) || ('HTTP ' + st);
  if (/Invalid login/i.test(m)) return 'E-posta ya da şifre yanlış';
  if (/Email not confirmed/i.test(m)) return 'E-postanı onayla: gelen kutundaki bağlantıya tıkla';
  if (/already registered/i.test(m)) return 'Bu e-posta zaten kayıtlı, giriş yap';
  if (/Password should be/i.test(m)) return 'Şifre en az 6 karakter olmalı';
  if (/relation .* does not exist|orvane_/i.test(m)) return 'Supabase’de Orvane tabloları yok: orvane.sql’i SQL Editor’da çalıştır';
  return m;
}
async function istek(yol, o = {}) {
  const c = cfg(); if (!c.url || !c.anahtar) throw new Error('Önce eşitleme adresini gir');
  let r;
  try { r = await fetch(c.url + yol, { method: o.method || 'GET', headers: Object.assign({ apikey: c.anahtar, 'Content-Type': 'application/json' }, o.headers || {}), body: o.body ? JSON.stringify(o.body) : undefined }); }
  catch (e) { const er = new Error('İnternet bağlantısı yok'); er.offline = true; throw er; }
  const t = await r.text(); let j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
  if (!r.ok) { const er = new Error(hata(j, r.status)); er.status = r.status; throw er; }
  return j;
}
function oturumKaydet(j, eposta) { const s = { access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, uid: j.user && j.user.id, eposta: (j.user && j.user.email) || eposta }; saveSes(s); return s; }
async function login({ eposta, sifre }) { const j = await istek('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: eposta, password: sifre } }); oturumKaydet(j, eposta); return status(); }
async function signup({ eposta, sifre }) { const j = await istek('/auth/v1/signup', { method: 'POST', body: { email: eposta, password: sifre } }); if (j && j.access_token) { oturumKaydet(j, eposta); return { ...status(), hemen: true }; } return { ...status(), hemen: false }; }
function logout() { saveSes(null); return status(); }
async function erisim() {
  let s = loadSes(); if (!s) throw new Error('Giriş yapılmadı');
  if (Date.now() > s.exp - 60000) {
    try { const j = await istek('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: s.refresh } }); s = oturumKaydet(j, s.eposta); }
    catch (e) { if (!e.offline) saveSes(null); throw e.offline ? e : new Error('Oturum süresi doldu, yeniden giriş yap'); }
  }
  return s;
}
// Telefondan gelen, özete henüz işlenmemiş olaylar
async function pull(sira) { const s = await erisim(); return istek('/rest/v1/orvane_olay?select=id,tur,veri,ts,sira,kaynak&sira=gt.' + (Number(sira) || 0) + '&order=sira.asc&limit=500', { headers: { Authorization: 'Bearer ' + s.access } }); }
// Güncel özeti yayınla (kullanıcı başına tek satır)
async function push(veri) { const s = await erisim(); await istek('/rest/v1/orvane_durum?on_conflict=user_id', { method: 'POST', headers: { Authorization: 'Bearer ' + s.access, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: { user_id: s.uid, veri, ts: new Date().toISOString() } }); return true; }

module.exports = { status, setCfg, login, signup, logout, pull, push };
