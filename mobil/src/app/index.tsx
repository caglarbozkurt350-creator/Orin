// Ekip: arama, İnsan Kaynakları girişi, Yönetim ve Ekip listeleri (masaüstü Çalışanlarım kenar çubuğunun telefon hâli)
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ekran, Foto, Ikon, Nokta, s } from '@/bilesen/ortak';
import { useDurum } from '@/lib/depo';
import { cagladaBekleyen, Calisan, calisanlar, durumNoktasi, useGorunum } from '@/lib/ekip';
import { R } from '@/lib/tema';

function saat(ts: number) { const d = new Date(ts), b = new Date(); return d.toDateString() === b.toDateString() ? d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : d.getDate() + '.' + (d.getMonth() + 1); }

export default function Ekip() {
  const o = useGorunum(), senk = useDurum((d) => d.senk), [q, setQ] = useState('');
  const hepsi = useMemo(() => calisanlar(o), [o]);
  const sz = q.trim().toLocaleLowerCase('tr'), gor = hepsi.filter((c) => !sz || (c.ad + ' ' + c.gorev).toLocaleLowerCase('tr').includes(sz));
  const onay = cagladaBekleyen(o).length;
  const cevrim = !senk.hata;
  const satir = (c: Calisan) => {
    const a = o.ekip.sohbet[c.id] || [], son = a[a.length - 1];
    return (
      <Pressable key={c.id} onPress={() => router.push(('/calisan/' + c.id) as any)} accessibilityRole="button" accessibilityLabel={c.ad + ', ' + c.gorev}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 14, backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'transparent' })}>
        <Foto c={c} boy={44} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text style={{ color: R.yazi, fontSize: 15, fontWeight: '600' }}>{c.ad}</Text><Nokta d={cevrim ? durumNoktasi(c, o) : 'id'} boy={7} /></View>
          <Text numberOfLines={1} style={{ color: son && son.r === 'o' ? '#d4d4da' : R.soluk, fontSize: 12.5 }}>{son && son.r !== 'sys' ? son.t : c.gorev}</Text>
        </View>
        {son && <Text style={{ color: R.solukk, fontSize: 11.5 }}>{saat(son.ts)}</Text>}
      </Pressable>
    );
  };
  return (
    <Ekran baslik="ORVANE" altMenu rozet={{ '/onaylar': onay }}
      sag={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Nokta d={cevrim ? 'ok' : 'bz'} boy={8} /><Text style={{ color: '#b9b9c0', fontSize: 12.5 }}>{senk.calisiyor ? 'Eşitleniyor' : cevrim ? 'Çevrimiçi' : 'Çevrimdışı'}</Text></View>}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, paddingHorizontal: 16, borderRadius: 999, backgroundColor: '#252528', borderWidth: 1, borderColor: R.cizgi }}>
          <Ikon ad="ara" boy={18} renk={R.soluk} />
          <TextInput value={q} onChangeText={setQ} placeholder="Çalışan ara" placeholderTextColor={R.soluk} style={{ flex: 1, color: '#fff', fontSize: 14 }} accessibilityLabel="Çalışan ara" />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}>
        <Pressable onPress={() => (onay > 0 ? router.replace('/onaylar' as any) : router.push('/ik' as any))} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 16, backgroundColor: '#222225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 6 }}>
          <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: R.ikBas, alignItems: 'center', justifyContent: 'center' }}><Ikon ad="kart" boy={20} renk="#fff" kalin={1.9} /></View>
          <View style={{ flex: 1 }}><Text style={{ color: R.yazi, fontSize: 15, fontWeight: '600' }}>İnsan Kaynakları</Text><Text style={{ color: R.soluk, fontSize: 12.5 }}>Çalışan kartları · Nika</Text></View>
          {onay > 0 ? <Pressable onPress={() => router.replace('/onaylar' as any)} accessibilityLabel={onay + ' onay bekliyor'} hitSlop={8} style={{ backgroundColor: R.turuncu, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}><Text style={{ color: '#1b1b1d', fontSize: 12, fontWeight: '600' }}>{onay} onay bekliyor</Text></Pressable>
            : <View style={{ backgroundColor: '#34343a', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}><Text style={{ color: R.yazi2, fontSize: 11.5 }}>{hepsi.length}</Text></View>}
        </Pressable>
        {!o.ts && (
          <Pressable onPress={() => router.replace('/ayarlar' as any)} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: 'rgba(47,123,245,0.08)', borderWidth: 1, borderColor: 'rgba(47,123,245,0.3)', borderRadius: 14, padding: 12, marginBottom: 6 }}>
            <Ikon ad="bilgi" boy={18} renk={R.bilgi} /><Text style={{ flex: 1, color: R.bilgi, fontSize: 13, lineHeight: 18 }}>Masaüstü Orvane ile henüz eşitlenmedi. Ayarlar’dan giriş yap; görevler, sohbetler ve iş günü kayıtları buraya gelir.</Text>
          </Pressable>
        )}
        <Text style={s.bolum}>Yönetim</Text>
        {gor.filter((c) => c.grup === 'yonetim').map(satir)}
        <Text style={s.bolum}>Ekip</Text>
        {gor.filter((c) => c.grup !== 'yonetim').map(satir)}
      </ScrollView>
    </Ekran>
  );
}
