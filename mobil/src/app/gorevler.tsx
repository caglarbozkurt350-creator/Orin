// Görevler: şirketteki bütün görevler, doğrudan görev verme
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AltPencere, Bos, GorevFormu, GorevSinir } from '@/bilesen/formlar';
import { Ekran, Foto, Ikon, Rozet, s } from '@/bilesen/ortak';
import { olayEkle } from '@/lib/depo';
import { bekleyenGelisim, Calisan, calisanlar, useGorunum } from '@/lib/ekip';
import { esitleSonra } from '@/lib/senk';
import { R } from '@/lib/tema';

export default function Gorevler() {
  const o = useGorunum(), hepsi = useMemo(() => calisanlar(o), [o]);
  const [kim, setKim] = useState<Calisan | null>(null), [sec, setSec] = useState(false);
  const g = o.ekip.gorev.slice().sort((a, b) => Number(a.durum === 'bitti') - Number(b.durum === 'bitti') || b.ts - a.ts);
  return (
    <Ekran baslik={<Text style={s.baslik}>Görevler</Text>} altMenu rozet={{ '/onaylar': bekleyenGelisim(o, 'nika').length + bekleyenGelisim(o, 'orin').length }}
      sag={<Pressable onPress={() => setSec(true)} accessibilityLabel="Doğrudan görev ver" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: R.ana, alignItems: 'center', justifyContent: 'center' }}><Ikon ad="arti" renk="#fff" kalin={2.2} /></Pressable>}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 30 }}>
        {g.length ? g.map((x) => {
          const c = hepsi.find((y) => y.id === x.kim);
          return (
            <View key={x.id} style={[s.kart, { flexDirection: 'row', gap: 12, opacity: x.durum === 'bitti' ? 0.6 : 1 }]}>
              <Pressable onPress={() => { olayEkle('gorev_durum', { id: x.id, durum: x.durum === 'bitti' ? 'acik' : 'bitti' }); esitleSonra(); }} accessibilityRole="checkbox" accessibilityState={{ checked: x.durum === 'bitti' }} accessibilityLabel="Bitti"
                style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: x.durum === 'bitti' ? R.yesil : '#5a5a62', backgroundColor: x.durum === 'bitti' ? R.yesil : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {x.durum === 'bitti' && <Ikon ad="tik" boy={14} renk="#fff" kalin={2.4} />}
              </Pressable>
              <Pressable style={{ flex: 1 }} onPress={() => c && router.push(('/calisan/' + c.id) as any)}>
                <Text style={{ color: '#e4e4e8', fontSize: 14.5, lineHeight: 21 }}>{x.metin}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}><Foto c={c} boy={18} halka={false} /><Text style={{ color: R.solukk, fontSize: 12 }}>{c?.ad} · doğrudan görev{x.son ? ' · ' + x.son : ''}</Text></View>
                <GorevSinir g={x} />
              </Pressable>
              {x.onc === 'acil' && <Rozet yazi="Acil" renk={R.acil} />}
            </View>
          );
        }) : <Bos yazi="Henüz görev yok. Sağ üstteki + ile bir çalışana doğrudan görev verebilirsin." ikon="gorev" />}
      </ScrollView>
      <AltPencere acik={sec || !!kim} kapat={() => { setSec(false); setKim(null); }}>
        {kim ? <GorevFormu c={kim} kapat={() => setKim(null)} /> : (
          <View style={{ gap: 6 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 6 }}>Kime görev verilsin?</Text>
            {hepsi.map((c) => (
              <Pressable key={c.id} onPress={() => { setSec(false); setKim(c); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
                <Foto c={c} boy={36} /><View style={{ flex: 1 }}><Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{c.ad}</Text><Text style={{ color: R.soluk, fontSize: 12.5 }}>{c.gorev}</Text></View>
              </Pressable>
            ))}
          </View>
        )}
      </AltPencere>
    </Ekran>
  );
}
