// Tarih yardımcıları. İki anahtar biçimi var:
// • gunAnahtari (lib/ekip): "2026-11-5" — iş günü kayıtları (masaüstü key() ile aynı, sıfırsız)
// • tamAnahtar: "2026-11-05" — ilaç işaretleri ve şeker (masaüstü OA.bugunKey ile aynı)
import { gunAnahtari } from '@/lib/ekip';

export const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const GN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
export const GK = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const tamAnahtar = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export const tarihOf = (k: string) => { const a = k.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
export const ayAnahtari = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
export function haftaBasi(d = new Date()) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
export const gunEkle = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const kisaTarih = (k: string) => { const d = tarihOf(k); return d.getDate() + ' ' + AY[d.getMonth()].slice(0, 3); };
export const uzunTarih = (k: string) => { const d = tarihOf(k); return d.getDate() + ' ' + AY[d.getMonth()] + ' ' + GN[d.getDay()]; };
export const tl = (n: number) => Math.round(n).toLocaleString('tr-TR') + ' ₺';
export const sayi = (n: number, k = 0) => n.toLocaleString('tr-TR', { minimumFractionDigits: k, maximumFractionDigits: k });
/** Ayın iş haftaları: pazartesi başlangıçlı, içinde en az bir hafta içi günü olan haftalar */
export function ayinHaftalari(d = new Date()) {
  const bas = new Date(d.getFullYear(), d.getMonth(), 1), son = new Date(d.getFullYear(), d.getMonth() + 1, 0), r: Date[] = [];
  for (let h = haftaBasi(bas); h <= son; h = gunEkle(h, 7)) { if ([0, 1, 2, 3, 4].some((i) => { const g = gunEkle(h, i); return g >= bas && g <= son; })) r.push(h); }
  return r;
}
/** Ay adına ek: ayaGore('Ekim') → "Ekim’e", ayin('Ekim') → "Ekim’in" (son ünlüye göre) */
const sonUnlu = (s: string) => (s.toLocaleLowerCase('tr').match(/[aıoueiöü]/g) || ['a']).pop() as string;
export const ayaGore = (ay: string) => ay + '’' + (/[aıou]/.test(sonUnlu(ay)) ? 'a' : 'e');
export const ayin = (ay: string) => { const u = sonUnlu(ay); return ay + '’' + ({ a: 'ın', ı: 'ın', o: 'un', u: 'un', e: 'in', i: 'in', ö: 'ün', ü: 'ün' } as Record<string, string>)[u]; };
export { gunAnahtari };
