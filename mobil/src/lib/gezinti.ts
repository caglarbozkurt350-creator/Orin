// Orvane Mobil · gezinti durumu: alt menü sekmesi, sekme içi bölümler ve sağ çalışan menüsü.
// Ekranlar arası (ör. Anasayfa kartı → Görevler, Bildirim › Ekip şeridi → Ekip) geçiş buradan yapılır.
import { useSyncExternalStore } from 'react';

export type Kip = 'gorev' | 'mesaj' | 'not';
type Durum = {
  sekme: number; yon: 'r' | 'l';
  gorevBolum: 'gorev' | 'onay' | 'gorsel'; kayitBolum: 'gun' | 'izin'; ekipBolum: 'ekip' | 'hiyer';
  menu: { acik: boolean; sec: string | null; kip: Kip | null; artir: number };
  aile: { fam: string | null; ray: boolean };
  onizle: number;
};
let D: Durum = { sekme: 0, yon: 'r', gorevBolum: 'gorev', kayitBolum: 'gun', ekipBolum: 'ekip', menu: { acik: false, sec: null, kip: null, artir: 0 }, aile: { fam: 'mia', ray: true }, onizle: 0 };
const dn = new Set<() => void>();
const yay = () => dn.forEach((f) => f());
export const gezinti = () => D;
export function useGezinti<T>(sec: (d: Durum) => T): T { return useSyncExternalStore((cb) => { dn.add(cb); return () => { dn.delete(cb); }; }, () => sec(D)); }
function koy(y: Partial<Durum>) { D = { ...D, ...y }; yay(); }

/** Alt menü (0.9.0): 0 Anasayfa · 1 Ailem · 2 İş Hayatı (ortadaki +) · 3 Bana Özel · 4 Bildirim.
 *  Alt menüde olmayan sayfalar: 5 Görevler ve onaylar (Anasayfa › Tümü) · 6 Ayarlar (üstteki profil düğmesi) · 7 Ekip (Bildirim › Ekip şeridi) */
export const SEKME_GOREV = 5, SEKME_AYAR = 6, SEKME_EKIP = 7;
export function sekmeGit(i: number, o?: { gorev?: Durum['gorevBolum']; kayit?: Durum['kayitBolum']; ekip?: Durum['ekipBolum'] }) {
  koy({ sekme: i, yon: i >= D.sekme ? 'r' : 'l', ...(o?.gorev ? { gorevBolum: o.gorev } : {}), ...(o?.kayit ? { kayitBolum: o.kayit } : {}), ...(o?.ekip ? { ekipBolum: o.ekip } : {}) });
}
export const gorevBolumu = (b: Durum['gorevBolum']) => koy({ gorevBolum: b });
export const kayitBolumu = (b: Durum['kayitBolum']) => koy({ kayitBolum: b });
export const ekipBolumu = (b: Durum['ekipBolum']) => koy({ ekipBolum: b });

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
