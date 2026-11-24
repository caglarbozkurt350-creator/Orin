// Ekranların ortak veri kancası: masaüstü özeti + yerel olaylar, çalışan listesi, bağlantı durumu
import { useMemo } from 'react';
import { useDurum } from '@/lib/depo';
import { Calisan, calisanlar, durumNoktasi, useGorunum } from '@/lib/ekip';

export function useEkip() {
  const o = useGorunum(), senk = useDurum((d) => d.senk);
  const hepsi = useMemo(() => calisanlar(o), [o]);
  const cevrim = !senk.hata;
  const durum = (c: Calisan): 'ok' | 'bz' | 'id' => (cevrim ? durumNoktasi(c, o) : 'id');
  const bul = (id: string) => hepsi.find((c) => c.id === id);
  // Pasif ekip: yapay zekâ kapalıyken (manuel mod) persona isim/avatarları ana akışta görünmez
  const pasif = o.zeka?.yz !== true;
  return { o, hepsi, senk, cevrim, durum, bul, pasif };
}

/** "18 Kasım Çarşamba" gibi */
export function bugunYazi(d = new Date()) {
  const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const GN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return GN[d.getDay()] + ', ' + d.getDate() + ' ' + AY[d.getMonth()];
}
export const saatYazi = (ts: number) => { const d = new Date(ts), b = new Date(); const t = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); return d.toDateString() === b.toDateString() ? t : d.getDate() + '.' + (d.getMonth() + 1) + ' ' + t; };
