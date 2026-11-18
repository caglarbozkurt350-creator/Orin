// Bildirimler: gerçek veriden türetilir (onay bekleyenler, görev sonuçları, çalışan cevapları, eşitleme durumu).
// "Okundu" bilgisi yalnız bu telefonda tutulur (masaüstüyle eşitlenmez).
import Storage from 'expo-sqlite/kv-store';
import { useMemo, useSyncExternalStore } from 'react';
import { cagladaBekleyen, GT } from '@/lib/ekip';
import { useEkip } from '@/lib/kullan';

export type Bildirim = { id: string; kanal: 'Görev' | 'Onay' | 'Mesaj' | 'Sistem'; baslik: string; alt: string; ts: number; kim?: string };

const ANAHTAR = 'orvane-bildirim-okundu-v1';
let OKUNDU: Record<string, 1> = (() => { try { return JSON.parse(Storage.getItemSync(ANAHTAR) || '{}'); } catch { return {}; } })();
const dn = new Set<() => void>();
const kaydet = () => { try { Storage.setItemSync(ANAHTAR, JSON.stringify(OKUNDU)); } catch {} dn.forEach((f) => f()); };
export function okunduYap(ids: string[]) { const y = { ...OKUNDU }; ids.forEach((i) => { y[i] = 1; }); OKUNDU = y; if (Object.keys(OKUNDU).length > 400) OKUNDU = Object.fromEntries(Object.entries(OKUNDU).slice(-300)); kaydet(); }

export function useBildirimler() {
  const { o, hepsi, senk } = useEkip();
  const okundu = useSyncExternalStore((cb) => { dn.add(cb); return () => { dn.delete(cb); }; }, () => OKUNDU);
  const liste = useMemo(() => {
    const r: Bildirim[] = [], ad = (id: string) => hepsi.find((c) => c.id === id)?.ad || id, gun = Date.now() - 3 * 86400000;
    cagladaBekleyen(o).forEach((g) => r.push({ id: 'onay-' + g.id, kanal: 'Onay', baslik: ad(g.kim) + ' · ' + GT[g.tur], alt: g.ad || g.metin || 'Onayını bekliyor', ts: g.ts, kim: g.kim }));
    o.ekip.gorev.forEach((g) => {
      if (g.hata) r.push({ id: 'gh-' + g.id, kanal: 'Görev', baslik: ad(g.kim) + ' · görev hatası', alt: g.hata, ts: g.bts || g.ts, kim: g.kim });
      else if (g.durum === 'bitti' && (g.bts || g.ts) > gun) r.push({ id: 'gb-' + g.id, kanal: 'Görev', baslik: ad(g.kim) + ' · görev bitti', alt: g.metin, ts: g.bts || g.ts, kim: g.kim });
    });
    Object.keys(o.ekip.sohbet).forEach((k) => {
      const son = [...o.ekip.sohbet[k]].reverse().find((m) => m.r === 'o');
      if (son && son.ts > Date.now() - 86400000) r.push({ id: 'ms-' + son.id, kanal: 'Mesaj', baslik: ad(k) + ' cevap yazdı', alt: son.t.replace(/\*\*/g, ''), ts: son.ts, kim: k });
    });
    if (senk.hata) r.push({ id: 'sh-' + senk.hata, kanal: 'Sistem', baslik: 'Eşitleme çalışmıyor', alt: senk.hata, ts: Date.now() });
    return r.sort((a, b) => b.ts - a.ts).slice(0, 14);
  }, [o, hepsi, senk.hata]);
  return { liste, okundu, okunmamis: liste.filter((b) => !okundu[b.id]).length };
}
