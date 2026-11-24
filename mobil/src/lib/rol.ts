// Profil (0.9.1): 'ben' = Çağlar (tam yetki), 'es' = eşi (aile görünümü).
// Eş; ortak bütçeyi, sağlık verisini, izin günlerini, aile takvimini ve özel günleri görür. Kendi harcamasını (cep / ortak),
// gelirini, ilaçlarını, randevularını, etkinliklerini ve özel günlerini ekler. Çağlar'ın kayıtlarını değiştiremez.
// Profil eşitlemede kendiliğinden bulunur (lib/senk.ts → rolBul); sekmeler, tema ve alt çubuk iki profilde aynıdır.
import { useDurum } from '@/lib/depo';
import type { Kisi } from '@/lib/depo';

export type Rol = 'ben' | 'es';
export function useRol(): Rol { return useDurum((d) => (d.ayar.rol === 'es' || d.ozet?.rol === 'es' ? 'es' : 'ben')); }
export const benKimim = (r: Rol): Kisi => (r === 'es' ? 'kubra' : 'cagla');
export const AD: Record<Kisi, string> = { cagla: 'Çağlar', kubra: 'Kübra' };
/** Bu kaydı bu profil değiştirebilir mi: herkes yalnız kendi eklediğini (kim yoksa kayıt Çağlar’ındır) */
export const duzenler = (r: Rol, kim?: Kisi) => (kim || 'cagla') === benKimim(r);
/** Olay türünün profile göre adı: eşin ilaç işlemleri es_ önekiyle gider (masaüstü yalnız eşin kendi ilacına uygular) */
export const ilacTur = (r: Rol, t: 'ilac_al' | 'ilac_kaydet' | 'ilac_sil') => (r === 'es' ? 'es_' + t : t);
