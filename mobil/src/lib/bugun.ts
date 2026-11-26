// Bugünün yerel tarih anahtarı ("YYYY-AA-GG", telefonun saatine göre; UTC değil) ve gece yarısı yenilemesi.
// İlaç işaretleri günlüktür: yerel 00:00'da ekranlar kendiliğinden yeni güne geçer, dünkü işaretler boş görünür.
// Uygulama önde değilken zamanlayıcılar durur; öne gelince gün yeniden denetlenir.
import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

/** Şu anın yerel gün anahtarı (lib/zaman tamAnahtar ile aynı biçim; ekip ↔ zaman döngüsüne girmemek için burada).
 *  İşaret yazılırken her seferinde yeniden hesaplanır (ekranın çizildiği an değil). */
export const bugunAnahtari = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
/** Yerel gece yarısına kalan süre (ms) */
export const geceYarisinaMs = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - d.getTime();

let _k = bugunAnahtari(), _t: ReturnType<typeof setTimeout> | null = null;
const dinleyen = new Set<() => void>();
function denetle() {
  const k = bugunAnahtari();
  if (k !== _k) { _k = k; dinleyen.forEach((f) => f()); }
  planla();
}
// Uzun zamanlayıcı yerine en fazla 5 dk'da bir bakılır (saat elle değişse de yakalanır)
function planla() {
  if (_t) clearTimeout(_t);
  _t = dinleyen.size ? setTimeout(denetle, Math.min(geceYarisinaMs() + 500, 5 * 60 * 1000)) : null;
}
AppState.addEventListener('change', (s) => { if (s === 'active') denetle(); });

/** Bugünün anahtarı; gün değişince (00:00) bileşeni yeniden çizer */
export function useBugun(): string {
  return useSyncExternalStore((cb) => {
    dinleyen.add(cb); denetle();
    return () => { dinleyen.delete(cb); planla(); };
  }, () => _k);
}
/** Bugün atılmış kendi ilaç işareti mi (gece yarısına kadar telefonda tutulur) */
export const bugunIsareti = (o: { tur: string; veri: any }, k = bugunAnahtari()) => (o.tur === 'ilac_al' || o.tur === 'es_ilac_al') && o.veri?.k === k;
/** Şeker ölçümleri telefonda 62 gün tutulur (masaüstü özeti de 62 gün yayınlar). */
export const SEKER_GUN = 62;
export const sekerSiniri = (d = new Date()) => bugunAnahtari(new Date(d.getFullYear(), d.getMonth(), d.getDate() - SEKER_GUN));
/** Bu telefonda girilmiş, son 62 günün şeker ölçümü mü. Eşitlemede silinmez ve masaüstü özetinin üstüne yeniden uygulanır:
 *  özet bir günü içermese bile (eski özet, masaüstünde işlenmemiş olay) aylık PDF çizelgesi ve şeker grafiği o ölçümü gösterir.
 *  Önceden olay özete girer girmez telefondan siliniyordu; özette olmayan günler kayboluyordu. */
export const yerelSeker = (o: { tur: string; veri: any }, sinir = sekerSiniri()) => o.tur === 'seker' && typeof o.veri?.k === 'string' && o.veri.k >= sinir;
