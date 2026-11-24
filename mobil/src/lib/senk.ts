// Orvane Mobil · Supabase eşitlemesi
// Telefon olaylarını orvane_olay'a yazar; masaüstünün yayınladığı özeti orvane_durum'dan okur.
// Adres ve "publishable" anahtar herkese açık olacak şekilde tasarlanmıştır; güvenlik RLS kurallarıyla sağlanır.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Storage from 'expo-sqlite/kv-store';
import { AppState, Platform } from 'react-native';
import { durum, guncelle, Ozet } from '@/lib/depo';

// Masaüstüyle aynı Supabase projesi. Ayarlar ekranından değiştirilebilir.
export const VARSAYILAN = { url: 'https://fhoakoxqvhmqvvovsbfo.supabase.co', anahtar: 'sb_publishable_MlUnQDC2yHt2xMVITQyDFA_f0J1MLj0' };

let _c: SupabaseClient | null = null, _ck = '';
export function istemci(): SupabaseClient | null {
  const a = durum().ayar, url = a.url || VARSAYILAN.url, key = a.anahtar || VARSAYILAN.anahtar;
  if (!url || !key) return null;
  if (_c && _ck === url + key) return _c;
  _ck = url + key;
  _c = createClient(url, key, { auth: { storage: Storage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } });
  return _c;
}
/** Uygulama önde değilse eşitleme yapılmaz (arka planda mobil veri harcamaz) */
export function onde() { return Platform.OS === 'web' || AppState.currentState === 'active'; }
if (Platform.OS !== 'web') AppState.addEventListener('change', (s) => { const c = istemci(); if (!c) return; if (s === 'active') { c.auth.startAutoRefresh(); esitle(); } else c.auth.stopAutoRefresh(); });

export function hataMetni(e: any): string {
  const m = String((e && (e.message || e.error_description)) || e || '');
  if (/Invalid login/i.test(m)) return 'E-posta ya da şifre yanlış';
  if (/Email not confirmed/i.test(m)) return 'E-postanı onayla: gelen kutundaki bağlantıya dokun';
  if (/already registered/i.test(m)) return 'Bu e-posta zaten kayıtlı, giriş yap';
  if (/Password should be/i.test(m)) return 'Şifre en az 6 karakter olmalı';
  if (/fetch|network/i.test(m)) return 'İnternet bağlantısı yok';
  return m || 'Bilinmeyen hata';
}

export async function oturum() { const c = istemci(); if (!c) return null; const { data } = await c.auth.getSession(); return data.session; }
export async function girisYap(eposta: string, sifre: string) { const c = istemci(); if (!c) throw new Error('Önce eşitleme adresini gir'); const { error } = await c.auth.signInWithPassword({ email: eposta.trim(), password: sifre }); if (error) throw error; await esitle(); }
export async function kayitOl(eposta: string, sifre: string) { const c = istemci(); if (!c) throw new Error('Önce eşitleme adresini gir'); const { data, error } = await c.auth.signUp({ email: eposta.trim(), password: sifre }); if (error) throw error; return !!data.session; }
export async function cikis() { const c = istemci(); if (c) await c.auth.signOut(); _ozTs = ''; guncelle((d) => ({ ...d, ozet: null, ayar: { ...d.ayar, rol: undefined, sahip: undefined } })); }

let _calisiyor = false, _ozTs = '';
/** Eşin telefonu yalnız bu olayları yazabilir (Supabase orvane_aile_olay ve masaüstü orv-aile.js aynı listeyi uygular) */
export const ES_TUR = ['es_harcama', 'es_gelir', 'es_ilac_kaydet', 'es_ilac_sil', 'es_ilac_al', 'etkinlik', 'etkinlik_sil', 'ozel_gun', 'ozel_gun_sil'];
/** Eşin özetini (orvane_aile.veri) ekranların kullandığı Özet biçimine çevirir: iş kaydı yok, izin günleri takvimden */
function esOzeti(v: any, ts: string): Ozet {
  const gun: Ozet['gun'] = {}; const iz = v?.aile?.ortak?.izin || {};
  Object.keys(iz).forEach((k) => { gun[k] = { L: null, T: 0, OT: 0, D: iz[k], e: [] }; });
  return { v: 1, ts: Date.parse(ts) || Date.now(), olaySira: v?.olaySira || 0, ekip: { m: {}, gorev: [], gel: [], sohbet: {} }, gun, proj: [], ayar: { w1: 0, w2: 0 }, aile: v?.aile, rol: 'es' };
}
/** Profil: kendi masaüstü özeti olan hesap 'ben'; yoksa ve bir aile paylaşımının üyesiyse 'es' */
async function rolBul(c: SupabaseClient): Promise<{ rol: 'ben' | 'es'; sahip?: string } | null> {
  const { data: zt, error: e0 } = await c.from('orvane_durum').select('ts').maybeSingle(); if (e0) throw e0;
  if (zt?.ts) return { rol: 'ben' };
  const { data: al, error: e1 } = await c.from('orvane_aile').select('sahip').limit(1);
  if (e1 && !/does not exist|orvane_aile/i.test(e1.message)) throw e1;
  return al && al[0] ? { rol: 'es', sahip: al[0].sahip } : null;
}
/** Bekleyen olayları gönderir, masaüstü özetini ve diğer cihazların olaylarını alır */
export async function esitle(): Promise<void> {
  const c = istemci(); if (!c || _calisiyor) return;
  const s = await oturum(); if (!s) return;
  _calisiyor = true; guncelle((d) => ({ ...d, senk: { ...d.senk, calisiyor: true, hata: undefined } }));
  try {
    // 0) profil (bir kez bulunur; eşin hesabı hiçbir zaman 'ben' olmaz çünkü orvane_durum satırı yok)
    let A = durum().ayar;
    if (!A.rol || (A.rol === 'es' && !A.sahip)) {
      const r = await rolBul(c);
      if (r) { guncelle((d) => ({ ...d, ayar: { ...d.ayar, rol: r.rol, sahip: r.sahip }, ozet: d.ayar.rol !== r.rol ? null : d.ozet })); A = durum().ayar; }
    }
    if (A.rol === 'es') return await esitleEs(c, A.sahip as string);
    // 1) gönder
    const gid = durum().olaylar.filter((o) => !o.gitti);
    if (gid.length) {
      const { data, error } = await c.from('orvane_olay').upsert(gid.map((o) => ({ id: o.id, kaynak: 'telefon', tur: o.tur, veri: o.veri, ts: new Date(o.ts).toISOString() })), { onConflict: 'id' }).select('id,sira');
      if (error) throw error;
      const m = new Map((data || []).map((r: any) => [r.id, r.sira]));
      guncelle((d) => ({ ...d, olaylar: d.olaylar.map((o) => (m.has(o.id) ? { ...o, gitti: true, sira: m.get(o.id) } : o)) }));
    }
    // 2) masaüstü özeti — veri tasarrufu: önce yalnız zaman damgası (birkaç bayt); özet yalnız değiştiyse indirilir
    const { data: zt, error: e0 } = await c.from('orvane_durum').select('ts').maybeSingle();
    if (e0) throw e0;
    let ozet = durum().ozet;
    if (zt?.ts && (zt.ts !== _ozTs || !ozet)) {
      const { data: oz, error: e2 } = await c.from('orvane_durum').select('veri,ts').maybeSingle();
      if (e2) throw e2;
      if (oz?.veri) { ozet = oz.veri as Ozet; _ozTs = oz.ts; }
    }
    // 3) özete henüz girmemiş olaylar (başka cihazlardan da)
    const bas = ozet?.olaySira || 0;
    const { data: ol, error: e3 } = await c.from('orvane_olay').select('id,tur,veri,ts,sira').gt('sira', bas).order('sira').limit(500);
    if (e3) throw e3;
    guncelle((d) => {
      const yer = new Map(d.olaylar.map((o) => [o.id, o]));
      (ol || []).forEach((r: any) => { if (!yer.has(r.id)) yer.set(r.id, { id: r.id, tur: r.tur, veri: r.veri, ts: Date.parse(r.ts), sira: r.sira, gitti: true }); });
      const olaylar = [...yer.values()].filter((o) => !o.gitti || !o.sira || o.sira > bas);
      return { ...d, ozet: ozet || d.ozet, olaylar, senk: { son: Date.now(), calisiyor: false } };
    });
  } catch (e) {
    guncelle((d) => ({ ...d, senk: { ...d.senk, calisiyor: false, hata: hataMetni(e) } }));
  } finally { _calisiyor = false; }
}
/** Eşin telefonu: olaylar orvane_aile_olay'a (yalnız ES_TUR), özet orvane_aile'den */
async function esitleEs(c: SupabaseClient, sahip: string) {
  // izin verilmeyen tür sırada kalmasın (ör. profil değişmeden önce girilmiş iş kaydı): atılır
  guncelle((d) => ({ ...d, olaylar: d.olaylar.filter((o) => o.gitti || ES_TUR.includes(o.tur)) }));
  const gid = durum().olaylar.filter((o) => !o.gitti);
  if (gid.length) {
    const { data, error } = await c.from('orvane_aile_olay').upsert(gid.map((o) => ({ id: o.id, sahip, tur: o.tur, veri: o.veri, ts: new Date(o.ts).toISOString() })), { onConflict: 'id' }).select('id,sira');
    if (error) throw error;
    const m = new Map((data || []).map((r: any) => [r.id, r.sira]));
    guncelle((d) => ({ ...d, olaylar: d.olaylar.map((o) => (m.has(o.id) ? { ...o, gitti: true, sira: m.get(o.id) } : o)) }));
  }
  const { data: zt, error: e0 } = await c.from('orvane_aile').select('ts').eq('sahip', sahip).maybeSingle(); if (e0) throw e0;
  if (!zt) { guncelle((d) => ({ ...d, ayar: { ...d.ayar, rol: undefined, sahip: undefined } })); throw new Error('Aile paylaşımı kapatılmış ya da e-posta değişmiş'); }
  let ozet = durum().ozet;
  if (zt.ts !== _ozTs || !ozet || ozet.rol !== 'es') {
    const { data: oz, error: e2 } = await c.from('orvane_aile').select('veri,ts').eq('sahip', sahip).maybeSingle(); if (e2) throw e2;
    if (oz?.veri) { ozet = esOzeti(oz.veri, oz.ts); _ozTs = oz.ts; }
  }
  const bas = ozet?.olaySira || 0;
  const { data: ol, error: e3 } = await c.from('orvane_aile_olay').select('id,tur,veri,ts,sira').eq('sahip', sahip).gt('sira', bas).order('sira').limit(500); if (e3) throw e3;
  guncelle((d) => {
    const yer = new Map(d.olaylar.map((o) => [o.id, o]));
    (ol || []).forEach((r: any) => { if (!yer.has(r.id)) yer.set(r.id, { id: r.id, tur: r.tur, veri: r.veri, ts: Date.parse(r.ts), sira: r.sira, gitti: true }); });
    const olaylar = [...yer.values()].filter((o) => !o.gitti || !o.sira || o.sira > bas);
    return { ...d, ozet: ozet || d.ozet, olaylar, senk: { son: Date.now(), calisiyor: false } };
  });
}
let _p: ReturnType<typeof setTimeout> | null = null;
export function esitleSonra(ms = 400) { if (_p) clearTimeout(_p); _p = setTimeout(esitle, ms); }
// Mesaj gönderince cevap gelene kadar 6 sn'de bir eşitle (en fazla 60 sn); veri tasarrufu için eskiden 3 sn / 90 sn idi
let _h: ReturnType<typeof setInterval> | null = null, _hBit = 0;
export function hizliBekle(sn = 60) { _hBit = Date.now() + sn * 1000; if (_h) return; _h = setInterval(() => { if (Date.now() > _hBit) { if (_h) clearInterval(_h); _h = null; return; } esitle(); }, 6000); }
