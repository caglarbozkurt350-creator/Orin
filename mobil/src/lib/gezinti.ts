// Orvane Mobil · gezinti durumu: alt menü sekmesi, sekme içi bölümler ve sağ çalışan menüsü.
// Ekranlar arası (ör. Anasayfa kartı → Onaylar, Ağaç → çalışan menüsü) geçiş buradan yapılır.
import { useSyncExternalStore } from 'react';

export type Kip = 'gorev' | 'mesaj' | 'not' | 'tg';
type Durum = {
  sekme: number; yon: 'r' | 'l';
  gorevBolum: 'gorev' | 'onay' | 'gorsel'; ekipBolum: 'ekip' | 'hiyer'; merkezAlt: '' | 'gun' | 'izin';
  menu: { acik: boolean; sec: string | null; kip: Kip | null; artir: number };
  aile: { fam: string | null; ray: boolean };
  onizle: number;
};
let D: Durum = { sekme: 0, yon: 'r', gorevBolum: 'gorev', ekipBolum: 'ekip', merkezAlt: '', menu: { acik: false, sec: null, kip: null, artir: 0 }, aile: { fam: 'mia', ray: true }, onizle: 0 };
const dn = new Set<() => void>();
const yay = () => dn.forEach((f) => f());
export const gezinti = () => D;
export function useGezinti<T>(sec: (d: Durum) => T): T { return useSyncExternalStore((cb) => { dn.add(cb); return () => { dn.delete(cb); }; }, () => sec(D)); }
function koy(y: Partial<Durum>) { D = { ...D, ...y }; yay(); }

export function sekmeGit(i: number, o?: { gorev?: Durum['gorevBolum']; ekip?: Durum['ekipBolum']; merkez?: Durum['merkezAlt'] }) {
  koy({ sekme: i, yon: i >= D.sekme ? 'r' : 'l', ...(o?.gorev ? { gorevBolum: o.gorev } : {}), ...(o?.ekip ? { ekipBolum: o.ekip } : {}), ...(o?.merkez !== undefined ? { merkezAlt: o.merkez } : {}) });
}
export const gorevBolumu = (b: Durum['gorevBolum']) => koy({ gorevBolum: b });
export const ekipBolumu = (b: Durum['ekipBolum']) => koy({ ekipBolum: b });
export const merkezAlt = (b: Durum['merkezAlt']) => koy({ merkezAlt: b });

/** Sağ çalışan menüsünü açar; id verilirse o çalışan açık gelir (Ağaç, Ekip ızgarası, Ailem rayı) */
export function menuAc(id?: string | null, kip: Kip | null = null) { koy({ menu: { acik: true, sec: id === undefined ? D.menu.sec : id, kip, artir: D.menu.artir + 1 } }); }
export function menuKapat() { if (D.menu.acik) koy({ menu: { ...D.menu, acik: false, kip: null } }); }
export function menuSec(id: string | null, kip: Kip | null = null) { koy({ menu: { ...D.menu, sec: id, kip } }); }
export function menuKip(kip: Kip | null) { koy({ menu: { ...D.menu, kip } }); }

/** Ailem sekmesi: seçili çalışan ve sağ rayın açık/kapalı durumu */
export const aileSec = (id: string | null) => koy({ aile: { ...D.aile, fam: id } });
export const rayDegis = () => koy({ aile: { ...D.aile, ray: !D.aile.ray } });
/** Ayarlar › Sekmeler arası geçiş › Önizle: sayfa giriş animasyonunu yeniden oynatır */
export const gecisOnizle = () => koy({ onizle: D.onizle + 1 });
