// İnsan Kaynakları: kimlik kartları, kart ayrıntısı, doğrudan görev
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AltPencere, GorevFormu } from '@/bilesen/formlar';
import { Dugme, Ekran, Foto, Kart, s } from '@/bilesen/ortak';
import { acikGorevler, Calisan, calisanlar, useGorunum, zincir } from '@/lib/ekip';
import { R } from '@/lib/tema';

export default function InsanKaynaklari() {
  const o = useGorunum(), hepsi = useMemo(() => calisanlar(o), [o]);
  const [ac, setAc] = useState<Calisan | null>(null), [gorev, setGorev] = useState(false);
  const grup = (b: string, l: Calisan[]) => (
    <View key={b}>
      <Text style={[s.bolum, { paddingHorizontal: 0 }]}>{b} · {l.length}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {l.map((c) => <Pressable key={c.id} onPress={() => setAc(c)} accessibilityLabel={c.ad + ' kartı'} style={{ width: '47%' }}><Kart c={c} /></Pressable>)}
      </View>
    </View>
  );
  return (
    <Ekran geri baslik={<Text style={{ color: R.yazi, fontSize: 17, fontWeight: '600' }}>İnsan Kaynakları</Text>} sag={<Foto c={hepsi.find((c) => c.id === 'nika')} boy={34} />}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 6, paddingBottom: 30 }}>
        <Text style={s.soluk}>Departman müdürü Nika · {hepsi.length} çalışan kartı · karta dokun, ayrıntıyı gör</Text>
        {grup('Yönetim', hepsi.filter((c) => c.grup === 'yonetim'))}
        {grup('Ekip', hepsi.filter((c) => c.grup !== 'yonetim'))}
      </ScrollView>
      <AltPencere acik={!!ac} kapat={() => { setAc(null); setGorev(false); }}>
        {ac && (gorev ? <GorevFormu c={ac} kapat={() => { setGorev(false); setAc(null); }} /> : (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Foto c={ac} boy={40} /><Text style={{ color: '#fff', fontSize: 22, fontWeight: '600' }}>{ac.ad}</Text></View>
            <View style={{ width: '62%', alignSelf: 'center' }}><Kart c={ac} /></View>
            <View style={s.kart}><Text style={{ color: '#8e8e96', fontSize: 12, marginBottom: 4 }}>Bağlı olduğu</Text><Text style={{ color: '#d4d4da', fontSize: 14 }}>{zincir(ac, hepsi).join('  ›  ')}</Text></View>
            <View style={s.kart}><Text style={{ color: '#8e8e96', fontSize: 12, marginBottom: 4 }}>Hayat hikâyesi</Text><Text style={{ color: ac.hikaye ? '#d4d4da' : R.soluk, fontSize: 13.5, lineHeight: 20 }}>{ac.hikaye || 'Hikâye henüz yazılmadı. Masaüstünde Profil › Hayat hikâyesi’nden yazılabilir.'}</Text></View>
            <View style={s.kart}><Text style={{ color: '#8e8e96', fontSize: 12, marginBottom: 4 }}>Bu hafta</Text><Text style={{ color: '#d4d4da', fontSize: 14 }}>{acikGorevler(o, ac.id).length} açık görev · token: yapay zekâ bağlı değil</Text></View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Dugme yazi="Sayfasına git" onPress={() => { const id = ac.id; setAc(null); router.push(('/calisan/' + id) as any); }} stil={{ flex: 1 }} />
              <Dugme yazi="Doğrudan görev" tur="ikinci" ikon="simsek" onPress={() => setGorev(true)} />
            </View>
          </View>
        ))}
      </AltPencere>
    </Ekran>
  );
}
