// Onaylar: gelişim talepleri Nika (İK) › Orin (CEO) › Çağlar (son onay). "Senin onayın" yalnız ikisinden geçenleri listeler.
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AltPencere, Bos, GelisimFormu } from '@/bilesen/formlar';
import { GelisimSatiri } from '@/bilesen/gelisim';
import { Dugme, Ekran, Foto, s } from '@/bilesen/ortak';
import { olayEkle } from '@/lib/depo';
import { cagladaBekleyen, calisanlar, incelemedeBekleyen, useGorunum } from '@/lib/ekip';
import { esitleSonra } from '@/lib/senk';
import { R } from '@/lib/tema';

export default function Onaylar() {
  const o = useGorunum(), hepsi = useMemo(() => calisanlar(o), [o]);
  const cag = cagladaBekleyen(o), inc = incelemedeBekleyen(o);
  const [sek, setSek] = useState<'cag' | 'inc'>(!cag.length && inc.length ? 'inc' : 'cag'), [form, setForm] = useState(false);
  const liste = sek === 'cag' ? cag : inc;
  // Çağlar yalnız son aşamada (ceo) karar verir; Nika ve Orin kendi aşamalarını masaüstünde otomatik inceler
  const karar = (id: string, ok: boolean) => { olayEkle('gelisim_karar', { id, asama: 'ceo', ok }); esitleSonra(); };
  const son = o.ekip.gel.filter((g) => g.asama === 'tamam' || g.asama === 'red').slice(-8).reverse();
  const redKim = (g: (typeof son)[number]) => (g.asama !== 'red' ? '' : g.ceo ? ' · Çağlar reddetti' : g.orin && !g.orin.ok ? ' · Orin reddetti' : g.ik && !g.ik.ok ? ' · Nika reddetti' : '');
  return (
    <Ekran baslik={<Text style={s.baslik}>Onaylar</Text>} sag={<Foto c={hepsi.find((c) => c.id === (sek === 'cag' ? 'orin' : 'nika'))} boy={36} />} altMenu rozet={{ '/onaylar': cag.length }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 30 }}>
        <Text style={s.soluk}>Beceri ve hafıza önce İK Müdürü Nika, sonra CEO Orin tarafından incelenir. İkisinden geçenler son onay için sana gelir; reddedilenler sana gelmez (masaüstünde “Son kararlar”dan bozulabilir).</Text>
        <View style={{ flexDirection: 'row', gap: 6, padding: 4, borderRadius: 999, backgroundColor: R.kart, borderWidth: 1, borderColor: R.cizgi }}>
          {([['cag', 'Senin onayın · ' + cag.length], ['inc', 'Nika / Orin’de · ' + inc.length]] as const).map(([k, y]) => (
            <Pressable key={k} onPress={() => setSek(k)} accessibilityRole="tab" accessibilityState={{ selected: sek === k }} style={{ flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 999, backgroundColor: sek === k ? R.secili : 'transparent' }}>
              <Text style={{ color: sek === k ? '#fff' : '#a4a4ab', fontSize: 13.5, fontWeight: '600' }}>{y}</Text>
            </Pressable>
          ))}
        </View>
        {sek === 'inc' && <Dugme yazi="Nika olarak çalışan geliştir" tur="ikinci" ikon="yildiz" onPress={() => setForm(true)} />}
        {liste.length ? liste.map((g) => {
          const c = hepsi.find((x) => x.id === g.kim);
          return (
            <GelisimSatiri key={g.id} g={g}
              ust={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}><Foto c={c} boy={36} halka={false} /><Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{c?.ad || g.kim}</Text></View>}
              eylem={sek === 'cag' ? <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Dugme yazi="Onayla ve uygula" ikon="tik" onPress={() => karar(g.id, true)} stil={{ flex: 1 }} />
                <Dugme yazi="Reddet" tur="ikinci" onPress={() => karar(g.id, false)} />
              </View> : <Text style={{ color: R.soluk, fontSize: 12.5, marginTop: 10 }}>{g.asama === 'ik' ? 'Nika inceliyor' : 'Orin inceliyor'} · sana ikisinden geçince gelir</Text>} />
          );
        }) : <Bos yazi={sek === 'cag' ? 'Senin onayını bekleyen yok. Nika ve Orin’in geçirdikleri burada görünür.' : 'Nika ya da Orin’de bekleyen talep yok.'} ikon="onay" />}
        {son.length > 0 && <Text style={s.bolum}>Son kararlar</Text>}
        {son.map((g) => <GelisimSatiri key={g.id} g={g} ust={<Text style={{ color: R.soluk, fontSize: 12.5, marginBottom: 4 }}>{hepsi.find((x) => x.id === g.kim)?.ad}{redKim(g)}</Text>} />)}
      </ScrollView>
      <AltPencere acik={form} kapat={() => setForm(false)}><GelisimFormu o={o} hepsi={hepsi} kimden="nika" tur0="beceri" kapat={() => setForm(false)} /></AltPencere>
    </Ekran>
  );
}
