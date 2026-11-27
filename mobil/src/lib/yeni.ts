// 0.9.14 · "Yeni" etiketi: kutucuk ilk görüldükten 14 gün sonra ya da sayfa bir kez açılınca kaybolur.
// Yalnız bu cihazda saklanır (masaüstüyle eşitlenmez), tema ayarları gibi ayrı anahtarda.
import Storage from 'expo-sqlite/kv-store';
import { useEffect, useState, useSyncExternalStore } from 'react';

type Kayit = Record<string, { ilk?: number; acildi?: 1 }>;
const ANAHTAR = 'orvane-yeni-v1', SURE = 14 * 864e5;
function yukle(): Kayit { try { const s = Storage.getItemSync(ANAHTAR); const d = s ? JSON.parse(s) : {}; return d && typeof d === 'object' ? d : {}; } catch { return {}; } }
let K = yukle();
const dinleyen = new Set<() => void>();
function yaz(y: Kayit) { K = y; try { Storage.setItemSync(ANAHTAR, JSON.stringify(K)); } catch {} dinleyen.forEach((f) => f()); }

/** Sayfa açıldı: etiket bir daha görünmez */
export function yeniGoruldu(id: string) { if (!K[id]?.acildi) yaz({ ...K, [id]: { ...K[id], ilk: K[id]?.ilk || Date.now(), acildi: 1 } }); }

/** Kutucukta "Yeni" gösterilsin mi; ilk görüldüğü an kaydedilir */
export function useYeni(id: string) {
  const k = useSyncExternalStore((cb) => { dinleyen.add(cb); return () => { dinleyen.delete(cb); }; }, () => K);
  useEffect(() => { if (!K[id]?.ilk) yaz({ ...K, [id]: { ...K[id], ilk: Date.now() } }); }, [id]);
  const [simdi] = useState(Date.now), x = k[id];
  return !x?.acildi && (!x?.ilk || simdi - x.ilk < SURE);
}
