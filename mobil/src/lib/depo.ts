// Orvane Mobil · yerel durum (expo-sqlite kv-store) ve olay modeli
// Masaüstü ile eşitleme: masaüstü "özet" yayınlar (orvane_durum), telefon "olay" yazar (orvane_olay).
// Ekranda görünen = özet + henüz özete girmemiş olaylar (iyimser uygulama).
import Storage from 'expo-sqlite/kv-store';
import { useSyncExternalStore } from 'react';

export type Mesaj = { id: string; r: 'ben' | 'o' | 'sys'; t: string; ts: number; tur?: 'mesaj' | 'not' | 'ses'; bek?: 1; qr?: string[]; kaynak?: string; ilt?: 1 };
export type Gorev = { id: string; kim: string; metin: string; onc: 'normal' | 'acil'; son: string; durum: 'acik' | 'bitti' | 'calisiyor'; bilgi: boolean; yol?: string; ts: number; bts?: number | null; sureDk?: number; bitis?: number; tokenLimit?: number; token?: number; usd?: number; sonuc?: string; hata?: string };
export type Karar = { ts: number; ok: 0 | 1; neden?: string; kim?: string; oto?: 1 };
export type Gelisim = { id: string; kim: string; tur: 'beceri' | 'seviye' | 'hafiza'; ad: string; metin: string; asama: 'ik' | 'orin' | 'ceo' | 'tamam' | 'red'; kimden: 'cagla' | 'nika' | 'claude' | 'abonelik'; ts: number; ik?: Karar; orin?: Karar; ceo?: Karar; oneri?: { ok: 0 | 1; neden?: string }; sonuc?: { evet?: string; hayir?: string } };
export type Beceri = { ad: string; sv: number; not?: string };
export type Hafiza = { id: string; metin: string; kaynak: string; ts: number };
export type Uye = { ad?: string; gorev?: string; renk?: string; aciklama?: string; hikaye?: string; grup?: string; bagli?: string; yeni?: 1; sil?: 1; bec?: Beceri[]; haf?: Hafiza[] };
/** e: [proje kodu, iş, dakika, durum?] · durum: baslanacak | devam | bitti | beklemede */
export type Kalem = [string, string, number, string?];
export type Gun = { L: number | null; T: number; OT: number; D?: string; e: Kalem[] };
/** Kişisel bütçenin bir ayı (masaüstü orv-telefon.js → OT9.butceAy). hg/hc: 5 haftanın gelir/gideri */
export type ButceAy = { ay: string; gelir: number; gider: number; kat: Record<string, number>; hg: number[]; hc: number[] };
export type Ilac = { id: string; ad: string; miktar: string; saat: string; tekrar: 'gun' | 'haftaici' | 'haftasonu'; actok?: string; not?: string; stok?: number | null; stokTs?: number; eklendi?: number };
/** Masaüstünden gelen aile verisi: bütçe (bu ay + geçen ay), ilaç planı, alındı işaretleri ("YYYY-MM-DD|id"), sabah açlık şekeri */
export type Aile = {
  fin: { bu: ButceAy; once: ButceAy; islem: [string, string, string, 0 | 1, number][] };
  ilac: Ilac[]; al: Record<string, 1>; seker: Record<string, number>;
  tcmb?: { tarih: string; usd: number; eur: number | null } | null;
};
export type Ozet = {
  v: 1; ts: number; olaySira: number;
  ekip: { m: Record<string, Uye>; gorev: Gorev[]; gel: Gelisim[]; sohbet: Record<string, Mesaj[]> };
  gun: Record<string, Gun>; proj: string[]; ayar: { w1: number; w2: number }; bugun?: string;
  /** yz: masaüstünde yapay zekâ çalışanları açık mı (manuel mod varsayılan; alan yoksa kapalı sayılır) */
  zeka?: { bagli: boolean; usd: number; butce: number; yz?: boolean };
  aile?: Aile;
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
