// Orvane Mobil · dış kaynaklar ve bu telefona özel tercihler (masaüstüyle eşitlenmez).
// • Piyasa: gram altın, dolar, euro (finans.truncgil.com, anahtarsız). 15 dk önbellek.
// • Haber: Google Haberler RSS, takip edilen anahtar kelimelerle. 1 saat önbellek.
// • Oyun: Steam "yakında çıkacak popüler" listesi + çıkış tarihleri. 12 saat önbellek.
// Tercihler: takip edilen oyunlar (zil = çıkış günü hatırlatması), haber anahtar kelimeleri, fiyat alarmları, sessiz saat.
import Storage from 'expo-sqlite/kv-store';
import { useEffect, useSyncExternalStore } from 'react';

// ---------- Küçük kalıcı depo ----------
type Oyun = { id: string; ad: string; tur: string; tarih: string; ts: number | null; gorsel: string };
type Haber = { id: string; baslik: string; kaynak: string; ts: number; link: string; kelime: string };
type Piyasa = { kod: 'GRA' | 'USD' | 'EUR'; ad: string; fiyat: number; degisim: number };
export type Alarm = { yon: 'ust' | 'alt'; sinir: number };
type Tercih = {
  takip: Record<string, { ad: string; ts: number | null; zil: boolean }>;
  kelime: string[]; alarm: Partial<Record<Piyasa['kod'], Alarm>>; sessiz: boolean; okunan: Record<string, 1>;
};
type Dis = {
  piyasa: { ts: number; liste: Piyasa[]; hata?: string };
  haber: { ts: number; anahtar: string; liste: Haber[]; hata?: string };
  oyun: { ts: number; liste: Oyun[]; hata?: string };
  tercih: Tercih;
};
const ANAHTAR = 'orvane-dis-v1';
const BOS: Dis = { piyasa: { ts: 0, liste: [] }, haber: { ts: 0, anahtar: '', liste: [] }, oyun: { ts: 0, liste: [] }, tercih: { takip: {}, kelime: ['Menemen konut'], alarm: {}, sessiz: true, okunan: {} } };
let D: Dis = (() => { try { const s = Storage.getItemSync(ANAHTAR); if (s) { const d = JSON.parse(s); return { ...BOS, ...d, tercih: { ...BOS.tercih, ...(d.tercih || {}) } }; } } catch {} return BOS; })();
const dn = new Set<() => void>();
function koy(f: (d: Dis) => Dis) { D = f(D); try { Storage.setItemSync(ANAHTAR, JSON.stringify(D)); } catch {} dn.forEach((x) => x()); }
export function useDis<T>(sec: (d: Dis) => T): T { return useSyncExternalStore((cb) => { dn.add(cb); return () => { dn.delete(cb); }; }, () => sec(D)); }
export const disDurum = () => D;
const tercih = (y: Partial<Tercih>) => koy((d) => ({ ...d, tercih: { ...d.tercih, ...y } }));

// ---------- Piyasa ----------
const PIYASA_AD: [Piyasa['kod'], string][] = [['GRA', 'Gram altın'], ['USD', 'Dolar'], ['EUR', 'Euro']];
let _p = false;
export async function piyasaYenile(zorla = false) {
  if (_p || (!zorla && Date.now() - D.piyasa.ts < 15 * 60000)) return; _p = true;
  try {
    const r = await fetch('https://finans.truncgil.com/v4/today.json'); if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const liste = PIYASA_AD.map(([kod, ad]) => ({ kod, ad, fiyat: +j[kod]?.Selling || 0, degisim: +j[kod]?.Change || 0 })).filter((x) => x.fiyat > 0);
    if (!liste.length) throw new Error('Fiyat bulunamadı');
    koy((d) => ({ ...d, piyasa: { ts: Date.now(), liste } }));
  } catch (e: any) { koy((d) => ({ ...d, piyasa: { ...d.piyasa, hata: 'Fiyatlar alınamadı (' + (e?.message || e) + ')' } })); }
  finally { _p = false; }
}
export const alarmKur = (kod: Piyasa['kod'], a: Alarm | null) => tercih({ alarm: { ...D.tercih.alarm, [kod]: a || undefined } });
/** Kurulu alarmlardan tetiklenenler (fiyat sınırı geçti) */
export function tetiklenen(liste: Piyasa[], alarm: Tercih['alarm']) {
  return liste.filter((p) => { const a = alarm[p.kod]; return a && (a.yon === 'ust' ? p.fiyat >= a.sinir : p.fiyat <= a.sinir); });
}
export const sessizDegis = () => tercih({ sessiz: !D.tercih.sessiz });
/** Sessiz saat 22:00–08:00: bu aralıkta alarm ve haber şeritleri sesli/üstte gösterilmez */
export function sessizMi(d = new Date()) { const h = d.getHours(); return D.tercih.sessiz && (h >= 22 || h < 8); }

// ---------- Haber (Google Haberler RSS) ----------
const ent = (s: string) => s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, '’').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
const etiket = (x: string, t: string) => { const m = x.match(new RegExp('<' + t + '[^>]*>([\\s\\S]*?)</' + t + '>')); return m ? ent(m[1]) : ''; };
let _h = false;
export async function haberYenile(zorla = false) {
  const anahtar = D.tercih.kelime.join('|');
  if (_h || (!zorla && anahtar === D.haber.anahtar && Date.now() - D.haber.ts < 60 * 60000)) return; _h = true;
  try {
    const hepsi: Haber[] = [];
    for (const k of D.tercih.kelime.slice(0, 5)) {
      const r = await fetch('https://news.google.com/rss/search?q=' + encodeURIComponent('"' + k + '"') + '&hl=tr&gl=TR&ceid=TR:tr'); if (!r.ok) throw new Error('HTTP ' + r.status);
      const x = await r.text();
      (x.match(/<item>[\s\S]*?<\/item>/g) || []).slice(0, 8).forEach((it) => {
        const b = etiket(it, 'title'), kaynak = etiket(it, 'source'), link = etiket(it, 'link'), ts = Date.parse(etiket(it, 'pubDate')) || Date.now();
        const baslik = kaynak && b.endsWith(' - ' + kaynak) ? b.slice(0, -kaynak.length - 3) : b;
        if (baslik && !hepsi.some((h) => h.baslik === baslik)) hepsi.push({ id: link || baslik, baslik, kaynak, ts, link, kelime: k });
      });
    }
    koy((d) => ({ ...d, haber: { ts: Date.now(), anahtar, liste: hepsi.sort((a, b) => b.ts - a.ts).slice(0, 20) } }));
  } catch (e: any) { koy((d) => ({ ...d, haber: { ...d.haber, hata: 'Haberler alınamadı (' + (e?.message || e) + ')' } })); }
  finally { _h = false; }
}
export function kelimeEkle(k: string) { const t = k.trim().slice(0, 40); if (!t || D.tercih.kelime.some((x) => x.toLocaleLowerCase('tr') === t.toLocaleLowerCase('tr'))) return; tercih({ kelime: [...D.tercih.kelime, t].slice(-5) }); haberYenile(true); }
export function kelimeSil(k: string) { tercih({ kelime: D.tercih.kelime.filter((x) => x !== k) }); koy((d) => ({ ...d, haber: { ...d.haber, liste: d.haber.liste.filter((h) => h.kelime !== k) } })); }
export const haberOku = (id: string) => tercih({ okunan: { ...Object.fromEntries(Object.entries(D.tercih.okunan).slice(-200)), [id]: 1 } });

// ---------- Oyun (Steam) ----------
const AYEN: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const AYTR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
/** "12 Jan, 2027" → zaman damgası; "Q1 2027", "Coming soon" → null */
export function steamTarih(s: string): { ts: number | null; yazi: string } {
  const m = s.match(/^(\d{1,2}) (\w{3}),? (\d{4})$/) || s.match(/^(\w{3}) (\d{1,2}),? (\d{4})$/);
  if (m) { const gun = /^\d/.test(m[1]) ? +m[1] : +m[2], ay = AYEN[/^\d/.test(m[1]) ? m[2] : m[1]], yil = +m[3]; if (ay != null) return { ts: new Date(yil, ay, gun).getTime(), yazi: gun + ' ' + AYTR[ay] + ' ' + yil }; }
  const q = s.match(/Q(\d) (\d{4})/); if (q) return { ts: null, yazi: q[2] + ' ' + q[1] + '. çeyrek' };
  const a = s.match(/^(\w+) (\d{4})$/); if (a && AYEN[a[1].slice(0, 3)] != null) return { ts: null, yazi: AYTR[AYEN[a[1].slice(0, 3)]] + ' ' + a[2] };
  return { ts: null, yazi: /coming soon|to be announced/i.test(s) ? 'Tarih açıklanmadı' : s || 'Tarih açıklanmadı' };
}
let _o = false;
export async function oyunYenile(zorla = false) {
  if (_o || (!zorla && Date.now() - D.oyun.ts < 12 * 3600000)) return; _o = true;
  try {
    const r = await fetch('https://store.steampowered.com/search/results/?filter=popularcomingsoon&json=1&count=12&cc=tr&l=english'); if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const ids: string[] = (j.items || []).map((x: any) => (String(x.logo || '').match(/\/apps\/(\d+)\//) || [])[1]).filter(Boolean).slice(0, 10);
    const liste: Oyun[] = [];
    for (const id of ids) {
      try {
        const a = await (await fetch('https://store.steampowered.com/api/appdetails?appids=' + id + '&cc=tr&l=english&filters=basic,release_date,genres,platforms')).json();
        const d = a?.[id]?.data; if (!d || d.release_date?.coming_soon === false) continue;
        const t = steamTarih(String(d.release_date?.date || ''));
        const pl = [d.platforms?.windows && 'PC', d.platforms?.mac && 'Mac', d.platforms?.linux && 'Linux'].filter(Boolean).join(', ');
        liste.push({ id, ad: d.name, tur: [(d.genres || []).slice(0, 2).map((g: any) => g.description).join(', '), pl].filter(Boolean).join(' · '), tarih: t.yazi, ts: t.ts, gorsel: d.header_image || '' });
      } catch {}
    }
    if (!liste.length) throw new Error('Liste boş');
    koy((d) => ({ ...d, oyun: { ts: Date.now(), liste } }));
  } catch (e: any) { koy((d) => ({ ...d, oyun: { ...d.oyun, hata: 'Oyun listesi alınamadı (' + (e?.message || e) + ')' } })); }
  finally { _o = false; }
}
export function takipDegis(o: { id: string; ad: string; ts: number | null }) {
  const t = { ...D.tercih.takip }; if (t[o.id]) delete t[o.id]; else t[o.id] = { ad: o.ad, ts: o.ts, zil: false }; tercih({ takip: t });
}
export function zilDegis(id: string) { const t = { ...D.tercih.takip }; if (t[id]) { t[id] = { ...t[id], zil: !t[id].zil }; tercih({ takip: t }); } }
export const kalanGun = (ts: number | null) => (ts == null ? null : Math.max(0, Math.ceil((ts - new Date().setHours(0, 0, 0, 0)) / 86400000)));

/** Ekran açıldığında kaynakları (önbellek süresi geçtiyse) yeniler */
export function useDisYenile(ne: ('piyasa' | 'haber' | 'oyun')[]) {
  useEffect(() => { if (ne.includes('piyasa')) piyasaYenile(); if (ne.includes('haber')) haberYenile(); if (ne.includes('oyun')) oyunYenile(); }, [ne.join()]);
}
