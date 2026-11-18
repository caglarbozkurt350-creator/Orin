// İzinler (Merkez › İzinler): masaüstü özetindeki izin günlerinden türetilir. Hak ediş ve planlar masaüstünde yönetilir.
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Bos } from '@/bilesen/formlar';
import { Hap, s } from '@/bilesen/ortak';
import { useGorunum } from '@/lib/ekip';
import { R } from '@/lib/tema';

const IZ: Record<string, [string, string, 'g' | 'o' | 'r']> = {
  yillik: ['Yıllık izin', R.yesil, 'g'], refakat: ['Refakat izni', R.yesil, 'g'], rapor4: ['Rapor · 4. günden sonra', R.yesil, 'g'],
  mazeret: ['Mazeret izni', R.turuncu, 'o'], rapor13: ['Rapor · ilk 3 gün', R.turuncu, 'o'],
  ucretsiz: ['Ücretsiz izin', R.kirmizi, 'r'], sevk: ['İş yeri sevki', R.yesil, 'g'],
};
const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export function Izinler() {
  const o = useGorunum(), yil = new Date().getFullYear();
  const gruplar = useMemo(() => {
    const g: Record<string, Date[]> = {};
    Object.keys(o.gun).forEach((k) => {
      const x = o.gun[k]; if (!x.D) return;
      const a = k.split('-').map(Number); if (a[0] !== yil) return;
      (g[x.D] = g[x.D] || []).push(new Date(a[0], a[1] - 1, a[2]));
    });
    Object.keys(g).forEach((k) => g[k].sort((a, b) => a.getTime() - b.getTime()));
    return g;
  }, [o.gun, yil]);
  const anahtarlar = Object.keys(gruplar), toplam = anahtarlar.reduce((n, k) => n + gruplar[k].length, 0);
  return (
    <View style={{ gap: 10 }}>
      <View style={[s.cam, { gap: 6 }]}>
        <Text style={s.ct}>{yil} · İZİN GÜNLERİ</Text>
        <Text style={{ color: R.yazi, fontSize: 26, fontWeight: '700' }}>{toplam}<Text style={{ fontSize: 14, fontWeight: '500', color: R.yazi2 }}> gün kullanıldı</Text></Text>
        <Text style={s.sub}>Hak ediş tarihi, yıllık izin planı ve refakat sayacı masaüstü Orvane’de tutulur; burada eşitlenen izin günleri listelenir.</Text>
      </View>
      {anahtarlar.length ? anahtarlar.map((k) => {
        const m = IZ[k] || [k, R.soluk, 'o' as const];
        return (
          <View key={k} style={[s.cam, { gap: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: R.yazi, fontSize: 14.5, fontWeight: '600' }}>{m[0]}</Text><Hap yazi={gruplar[k].length + ' gün'} t={m[2]} /></View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {gruplar[k].map((d) => <View key={d.getTime()} style={{ paddingHorizontal: 11, paddingVertical: 7, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', borderLeftWidth: 3, borderLeftColor: m[1] }}><Text style={{ color: '#d4d4da', fontSize: 12.5 }}>{d.getDate()} {AY[d.getMonth()]}</Text></View>)}
            </View>
          </View>
        );
      }) : <Bos yazi={o.ts ? 'Bu yıl izin günü kaydı yok.' : 'Masaüstü Orvane ile eşitlenince izin günlerin burada görünür.'} ikon="izin" />}
      <Text style={[s.soluk, { fontSize: 12 }]}>Renkler: yeşil = yıllık, refakat, 4. günden sonra rapor; turuncu = mazeret, ilk 3 gün rapor; kırmızı = ücretsiz.</Text>
    </View>
  );
}
