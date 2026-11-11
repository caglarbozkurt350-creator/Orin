// Orvane Mobil · yerel durum (expo-sqlite kv-store) ve olay modeli
// Masaüstü ile eşitleme: masaüstü "özet" yayınlar (orvane_durum), telefon "olay" yazar (orvane_olay).
// Ekranda görünen = özet + henüz özete girmemiş olaylar (iyimser uygulama).
import Storage from 'expo-sqlite/kv-store';
import { useSyncExternalStore } from 'react';

export type Mesaj = { id: string; r: 'ben' | 'o' | 'sys'; t: string; ts: number; tur?: 'mesaj' | 'not' | 'ses'; bek?: 1; qr?: string[]; kaynak?: string; ilt?: 1 };
export type Gorev = { id: string; kim: string; metin: string; onc: 'normal' | 'acil'; son: string; durum: 'acik' | 'bitti'; bilgi: boolean; yol?: string; ts: number; bts?: number | null };
export type Karar = { ts: number; ok: 0 | 1 };
export type Gelisim = { id: string; kim: string; tur: 'beceri' | 'seviye' | 'hafiza'; ad: string; metin: string; asama: 'ik' | 'ceo' | 'tamam' | 'red'; kimden: 'cagla' | 'nika'; ts: number; ik?: Karar; ceo?: Karar };
export type Beceri = { ad: string; sv: number; not?: string };
export type Hafiza = { id: string; metin: string; kaynak: string; ts: number };
export type Uye = { ad?: string; gorev?: string; renk?: string; aciklama?: string; hikaye?: string; grup?: string; bagli?: string; yeni?: 1; sil?: 1; bec?: Beceri[]; haf?: Hafiza[] };
export type Gun = { L: number | null; T: number; OT: number; D?: string; e: [string, string, number][] };
export type Ozet = {
  v: 1; ts: number; olaySira: number;
  ekip: { m: Record<string, Uye>; gorev: Gorev[]; gel: Gelisim[]; sohbet: Record<string, Mesaj[]> };
  gun: Record<string, Gun>; proj: string[]; ayar: { w1: number; w2: number }; bugun?: string;
  zeka?: { bagli: boolean; usd: number; butce: number };
};
export type Olay = { id: string; tur: string; veri: any; ts: number; sira?: number; gitti?: boolean };
export type Durum = {
  ozet: Ozet | null;
  olaylar: Olay[];
  ayar: { url: string; anahtar: string };
  senk: { son?: number; hata?: string; calisiyor?: boolean };
};

const ANAHTAR = 'orvane-durum-v1';
let D: Durum = yukle();
const dinleyenler = new Set<() => void>();

function yukle(): Durum {
  try {
    const s = Storage.getItemSync(ANAHTAR);
    if (s) {
      const d = JSON.parse(s) as Durum;
      return { ozet: d.ozet ?? null, olaylar: d.olaylar ?? [], ayar: d.ayar ?? { url: '', anahtar: '' }, senk: { son: d.senk?.son } };
    }
  } catch {}
  return { ozet: null, olaylar: [], ayar: { url: '', anahtar: '' }, senk: {} };
}

let _t: ReturnType<typeof setTimeout> | null = null;
function kaydet() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(() => {
    try { Storage.setItemSync(ANAHTAR, JSON.stringify({ ...D, senk: { son: D.senk.son } })); } catch {}
  }, 200);
}

export function durum() { return D; }
export function guncelle(f: (d: Durum) => Durum) { D = f(D); kaydet(); dinleyenler.forEach((x) => x()); }
export function useDurum<T>(sec: (d: Durum) => T): T {
  return useSyncExternalStore((cb) => { dinleyenler.add(cb); return () => dinleyenler.delete(cb); }, () => sec(D));
}

export function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

/** Yeni olay: yerelde hemen uygulanır, eşitlemede gönderilir */
export function olayEkle(tur: string, veri: any) {
  const o: Olay = { id: uid(), tur, veri, ts: Date.now() };
  guncelle((d) => ({ ...d, olaylar: [...d.olaylar, o] }));
  return o;
}
