// Onaylar: gelişim talepleri önce İK (Nika), sonra CEO (Orin)
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AltPencere, Bos, GelisimFormu } from '@/bilesen/formlar';
import { GelisimSatiri } from '@/bilesen/gelisim';
import { Dugme, Ekran, Foto, s } from '@/bilesen/ortak';
import { olayEkle } from '@/lib/depo';
import { bekleyenGelisim, calisanlar, useGorunum } from '@/lib/ekip';
import { esitleSonra } from '@/lib/senk';
import { R } from '@/lib/tema';

export default function Onaylar() {
  const o = useGorunum(), hepsi = useMemo(() => calisanlar(o), [o]);
  const [sek, setSek] = useState<'ik' | 'ceo'>('ik'), [form, setForm] = useState(false);
  const ik = bekleyenGelisim(o, 'nika'), ceo = bekleyenGelisim(o, 'orin'), liste = sek === 'ik' ? ik : ceo;
  const karar = (id: string, ok: boolean) => { olayEkle('gelisim_karar', { id, asama: sek, ok }); esitleSonra(); };
  const son = o.ekip.gel.filter((g) => g.asama === 'tamam' || g.asama === 'red').slice(-5).reverse();
  return (
    <Ekran baslik={<Text style={s.baslik}>Onaylar</Text>} sag={<Foto c={hepsi.find((c) => c.id === (sek === 'ik' ? 'nika' : 'orin'))} boy={36} />} altMenu rozet={{ '/onaylar': ik.length + ceo.length }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 30 }}>
        <Text style={s.soluk}>Beceri ve hafıza önce İK Müdürü Nika, sonra CEO Orin onayıyla gelişir. Yapay zekâ bağlanınca ikisi kendileri değerlendirecek; şimdilik onayı sen veriyorsun.</Text>
        <View style={{ flexDirection: 'row', gap: 6, padding: 4, borderRadius: 999, backgroundColor: R.kart, borderWidth: 1, borderColor: R.cizgi }}>
          {([['ik', 'İK incelemesi · ' + ik.length], ['ceo', 'CEO onayı · ' + ceo.length]] as const).map(([k, y]) => (
            <Pressable key={k} onPress={() => setSek(k)} accessibilityRole="tab" accessibilityState={{ selected: sek === k }} style={{ flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 999, backgroundColor: sek === k ? R.secili : 'transparent' }}>
              <Text style={{ color: sek === k ? '#fff' : '#a4a4ab', fontSize: 13.5, fontWeight: '600' }}>{y}</Text>
            </Pressable>
          ))}
        </View>
        {sek === 'ik' && <Dugme yazi="Nika olarak çalışan geliştir" tur="ikinci" ikon="yildiz" onPress={() => setForm(true)} />}
        {liste.length ? liste.map((g) => {
          const c = hepsi.find((x) => x.id === g.kim);
          return (
            <GelisimSatiri key={g.id} g={g}
              ust={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}><Foto c={c} boy={36} halka={false} /><Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{c?.ad || g.kim}</Text></View>}
              eylem={<View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Dugme yazi={sek === 'ik' ? 'Onayla, Orin’e gönder' : 'Onayla ve uygula'} ikon="tik" onPress={() => karar(g.id, true)} stil={{ flex: 1 }} />
                <Dugme yazi="Reddet" tur="ikinci" onPress={() => karar(g.id, false)} />
              </View>} />
          );
        }) : <Bos yazi={sek === 'ik' ? 'İncelenecek talep yok.' : 'Onay bekleyen gelişim yok.'} ikon="onay" />}
        {son.length > 0 && <Text style={s.bolum}>Son kararlar</Text>}
        {son.map((g) => <GelisimSatiri key={g.id} g={g} ust={<Text style={{ color: R.soluk, fontSize: 12.5, marginBottom: 4 }}>{hepsi.find((x) => x.id === g.kim)?.ad}</Text>} />)}
      </ScrollView>
      <AltPencere acik={form} kapat={() => setForm(false)}><GelisimFormu o={o} hepsi={hepsi} kimden="nika" tur0="beceri" kapat={() => setForm(false)} /></AltPencere>
    </Ekran>
  );
}
