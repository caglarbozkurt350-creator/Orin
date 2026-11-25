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
export type Ilac = { id: string; ad: string; miktar: string; saat: string; tekrar: 'gun' | 'haftaici' | 'haftasonu'; actok?: string; not?: string; stok?: number | null; stokTs?: number; eklendi?: number; /** kimin ilacı: cagla (varsayılan) | kubra (eşi) */ kim?: 'cagla' | 'kubra' };
/** Masaüstünden gelen aile verisi: bütçe (bu ay + geçen ay), ilaç planı, alındı işaretleri ("YYYY-MM-DD|id"), sabah açlık şekeri */
export type Aile = {
  fin: { bu: ButceAy; once: ButceAy; islem: [string, string, string, 0 | 1, number][] };
  ilac: Ilac[]; al: Record<string, 1>; seker: Record<string, number>; /** şekerin yazıldığı saat (gün → "HH:MM") */ sekerSaat?: Record<string, string>;
  tcmb?: { tarih: string; usd: number; eur: number | null } | null;
  ortak?: Ortak;
};
export type Kisi = 'cagla' | 'kubra';
/** Takvim etkinliği ya da hastane randevusu. kim: ekleyen; kisi: kimin için (aile = herkes) */
export type Etkinlik = { id: string; ad: string; tarih: string; saat?: string; tur?: 'etkinlik' | 'randevu'; yer?: string; not?: string; kim: Kisi; kisi?: Kisi | 'aile'; ts?: number };
export type OzelGun = { id: string; ad: string; tarih: string; tur: 'dogum' | 'yildonumu' | 'diger'; kim: Kisi };
export type CepDurum = { oran: number; har: number | null; harcanan: number; kal: number | null; gunluk: number | null };
/** Ortak aile verisi (masaüstü orv-aile.js → OAI.ortak). Gelir ortak bütçeye girer; market/ev ortak bütçeden, kişisel harcama cep harçlığından.
 *  hareket: [tarih, gelir?1:0, kategori, not, tutar, kasa o|c|e, ekleyen] · trend: [ay, gelir, gider] (6 ay) · izin: Çağlar'ın izin günleri */
export type Ortak = {
  ad: Record<Kisi, string>;
  trend: [string, number, number][];
  kasa: { ortak: number; c: number; e: number };
  kat: Record<string, number>;
  cep: { c?: CepDurum; e?: CepDurum; kalanGun?: number; bek?: number };
  hareket: [string, 0 | 1, string, string, number, 'o' | 'c' | 'e', Kisi][];
  odeme: { ad: string; tutar: number; tarih: string }[];
  takvim: Etkinlik[]; ozel: OzelGun[]; izin: Record<string, string>;
};
export type Ozet = {
  v: 1; ts: number; olaySira: number;
  ekip: { m: Record<string, Uye>; gorev: Gorev[]; gel: Gelisim[]; sohbet: Record<string, Mesaj[]> };
  gun: Record<string, Gun>; proj: string[]; ayar: { w1: number; w2: number }; bugun?: string;
  /** yz: masaüstünde yapay zekâ çalışanları açık mı (manuel mod varsayılan; alan yoksa kapalı sayılır) */
  zeka?: { bagli: boolean; usd: number; butce: number; yz?: boolean };
  aile?: Aile;
  /** 'es': eşin telefonu (masaüstünün orvane_aile özeti; iş/ekip verisi yok, Çağlar'ın verileri salt okunur) */
  rol?: 'es';
};
export type Olay = { id: string; tur: string; veri: any; ts: number; sira?: number; gitti?: boolean };
export type Durum = {
  ozet: Ozet | null;
  olaylar: Olay[];
  /** rol: bu telefonun profili (ben = Çağlar, es = eşi; eşitlemede kendiliğinden bulunur) · sahip: eşin bağlı olduğu hesap */
  ayar: { url: string; anahtar: string; rol?: 'ben' | 'es'; sahip?: string };
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
