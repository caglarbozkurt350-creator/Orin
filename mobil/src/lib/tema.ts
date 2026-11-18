// Orvane Mobil · tema (Bölüm 1 tasarım dili). Telefonun görünüm ayarları (tema rengi, sekme geçişi, açılış ekranı)
// masaüstüyle EŞİTLENMEZ: yalnız bu cihazda, ayrı anahtarda saklanır. `npm run paylas` bu dosyaya dokunmaz.
import Storage from 'expo-sqlite/kv-store';
import { useSyncExternalStore } from 'react';

export const TEMALAR = {
  turuncu: { ad: 'Turuncu', acc: '#ff5b37', acc2: '#ffb020' },
  nane: { ad: 'Nane', acc: '#2fbf8a', acc2: '#9be7c4' },
  okyanus: { ad: 'Okyanus', acc: '#3b82f6', acc2: '#5fe0f5' },
  lavanta: { ad: 'Lavanta', acc: '#8b5cf6', acc2: '#c4b0ff' },
  gul: { ad: 'Gül', acc: '#e1488f', acc2: '#ff9ad4' },
  altin: { ad: 'Altın', acc: '#d4921c', acc2: '#fde68a' },
} as const;
export type TemaAnahtari = keyof typeof TEMALAR;
export const GECISLER = { akiskan: 'Akışkan', kaydir: 'Kaydır', yakinlas: 'Yakınlaş', sol: 'Solma', yok: 'Kapalı' } as const;
export type GecisAnahtari = keyof typeof GECISLER;

/** Renkler. `ana` / `ana2` / `bilgi` tema rengine göre değişir (uygulaTema), gerisi sabittir. */
export const R = {
  zemin: '#19191b', panel: '#1c1c1f', kenar: '#202023', kart: '#242427', kart2: '#2b2b2f', giris: '#2c2c30', secili: '#3a3a40',
  yazi: '#f2f2f3', yazi2: '#a9a9b0', soluk: '#8e8e95', solukk: '#8e8e95', cizgi: 'rgba(255,255,255,0.10)',
  ana: '#ff5b37', ana2: '#ffb020', bilgi: '#ffb020',
  yesil: '#3ecf5a', turuncu: '#f5a524', notTuruncu: '#e0952f', kirmizi: '#e0443a', acil: '#e0705b', bosta: '#6b6b73',
  ikBas: '#ff8a5b', ikSon: '#ffc35b',
  cam: 'rgba(255,255,255,0.06)', camKenar: 'rgba(255,255,255,0.10)',
  nane: '#4fb98f', nane2: '#92e6c8',
};
export const Y = { kart: 22, giris: 16, menu: 14, hap: 999, yazma: 26 };

/** "#3fb6ff" + saydamlık → "#3fb6ff66" gibi */
export function saydam(hex: string, a: number) {
  const h = Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
  return hex.length === 7 ? hex + h : hex;
}

type Gorunum = { tema: TemaAnahtari; gecis: GecisAnahtari; acilis: boolean };
const ANAHTAR = 'orvane-gorunum-v1';
function yukle(): Gorunum {
  const v: Gorunum = { tema: 'turuncu', gecis: 'akiskan', acilis: true };
  try {
    const s = Storage.getItemSync(ANAHTAR);
    if (s) { const d = JSON.parse(s); if (d.tema in TEMALAR) v.tema = d.tema; if (d.gecis in GECISLER) v.gecis = d.gecis; if (typeof d.acilis === 'boolean') v.acilis = d.acilis; }
  } catch {}
  return v;
}
let G = yukle();
const dinleyenler = new Set<() => void>();
export function uygulaTema(k: TemaAnahtari) { const t = TEMALAR[k]; R.ana = t.acc; R.ana2 = t.acc2; R.bilgi = t.acc2; }
uygulaTema(G.tema);
function degistir(y: Partial<Gorunum>) {
  G = { ...G, ...y }; uygulaTema(G.tema);
  try { Storage.setItemSync(ANAHTAR, JSON.stringify(G)); } catch {}
  dinleyenler.forEach((f) => f());
}
export const temaSec = (k: TemaAnahtari) => degistir({ tema: k });
export const gecisSec = (k: GecisAnahtari) => degistir({ gecis: k });
export const acilisSec = (b: boolean) => degistir({ acilis: b });
export const gorunum = () => G;
export function useGorunumAyari() { return useSyncExternalStore((cb) => { dinleyenler.add(cb); return () => { dinleyenler.delete(cb); }; }, () => G); }
