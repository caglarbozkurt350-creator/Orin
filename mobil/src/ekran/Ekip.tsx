// Ekip sekmesi: Ekip (kimlik ızgarası, arama, İnsan Kaynakları, son yazışmalar) · Hiyerarşi (şirket ağacı).
// Çalışana dokununca sağ çalışan menüsünde o çalışan açılır.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Avatar, Bolumler, Foto, Hap, Ikon, Nokta, SayfaBasligi, s } from '@/bilesen/ortak';
import { cagladaBekleyen } from '@/lib/ekip';
import { KISA } from '@/lib/ekipMeta';
import { ekipBolumu, menuAc, sekmeGit, useGezinti } from '@/lib/gezinti';
import { saatYazi, useEkip } from '@/lib/kullan';
import { R, saydam } from '@/lib/tema';

export function EkipSekmesi() {
  const bolum = useGezinti((d) => d.ekipBolum), { hepsi } = useEkip();
  return (
    <View style={{ gap: 14 }}>
      <SayfaBasligi ust={hepsi.length + ' yapay zekâ çalışanı'} baslik={bolum === 'ekip' ? 'Ekip' : 'Hiyerarşi'} />
      <Bolumler secenek={[['ekip', 'Ekip'], ['hiyer', 'Hiyerarşi']]} deger={bolum} sec={ekipBolumu} />
      {bolum === 'ekip' ? <EkipIzgara /> : <Hiyerarsi />}
    </View>
  );
}

function EkipIzgara() {
  const { o, hepsi, durum, cevrim } = useEkip(), [q, setQ] = useState('');
  const sz = q.trim().toLocaleLowerCase('tr'), gor = hepsi.filter((c) => !sz || (c.ad + ' ' + c.gorev).toLocaleLowerCase('tr').includes(sz));
  const onay = cagladaBekleyen(o).length;
  const yazisma = hepsi.map((c) => { const a = o.ekip.sohbet[c.id] || [], son = [...a].reverse().find((m) => m.r !== 'sys'); return { c, son }; }).filter((x) => x.son).sort((a, b) => (b.son?.ts || 0) - (a.son?.ts || 0)).slice(0, 6);
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, paddingHorizontal: 16, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: R.camKenar }}>
        <Ikon ad="ara" boy={18} renk={R.soluk} />
        <TextInput value={q} onChangeText={setQ} placeholder="Çalışan ara" placeholderTextColor={R.soluk} style={{ flex: 1, color: '#fff', fontSize: 14, paddingVertical: 0 }} accessibilityLabel="Çalışan ara" />
      </View>
      <Pressable onPress={() => router.push('/ik' as any)} accessibilityRole="button" style={({ pressed }) => [s.cam, { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
        <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: R.ikBas, alignItems: 'center', justifyContent: 'center' }}><Ikon ad="kart" boy={20} renk="#fff" kalin={1.9} /></View>
        <View style={{ flex: 1 }}><Text style={{ color: R.yazi, fontSize: 15, fontWeight: '600' }}>İnsan Kaynakları</Text><Text style={s.sub}>Çalışan kartları · Nika</Text></View>
        {onay > 0 ? <Pressable onPress={() => sekmeGit(2, { gorev: 'onay' })} accessibilityLabel={onay + ' onay bekliyor'} hitSlop={8}><Hap yazi={onay + ' onay bekliyor'} t="o" /></Pressable> : <Hap yazi={String(hepsi.length)} />}
      </Pressable>
      {!o.ts && (
        <Pressable onPress={() => sekmeGit(4, { merkez: '' })} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: saydam(R.ana, 0.08), borderWidth: 1, borderColor: saydam(R.ana, 0.3), borderRadius: 14, padding: 12 }}>
          <Ikon ad="bilgi" boy={18} renk={R.bilgi} /><Text style={{ flex: 1, color: R.bilgi, fontSize: 13, lineHeight: 18 }}>Masaüstü Orvane ile henüz eşitlenmedi. Merkez › Eşitleme’den giriş yap; görevler, sohbetler ve iş günü kayıtları buraya gelir.</Text>
        </Pressable>
      )}
      <View style={[s.cam, { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 }]}>
        {gor.map((c) => (
          <Pressable key={c.id} onPress={() => menuAc(c.id)} accessibilityRole="button" accessibilityLabel={c.ad + ', ' + c.gorev} style={({ pressed }) => ({ width: '25%', alignItems: 'center', gap: 6, transform: [{ scale: pressed ? 0.93 : 1 }] })}>
            <Avatar c={c} boy={52} durum={durum(c)} />
            <Text style={{ color: R.yazi, fontSize: 12.5, fontWeight: '600', textAlign: 'center' }}>{c.ad}</Text>
            <Text numberOfLines={1} style={{ color: R.yazi2, fontSize: 11, textAlign: 'center' }}>{KISA[c.id] || c.gorev}</Text>
          </Pressable>
        ))}
        {!gor.length && <Text style={[s.soluk, { padding: 8 }]}>Çalışan bulunamadı</Text>}
      </View>
      {yazisma.length > 0 && (
        <View style={{ gap: 4 }}>
          <Text style={s.bolum}>SON YAZIŞMALAR</Text>
          {yazisma.map(({ c, son }) => (
            <Pressable key={c.id} onPress={() => router.push(('/calisan/' + c.id) as any)} accessibilityRole="button" accessibilityLabel={c.ad + ' sohbeti'} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, paddingVertical: 8, minHeight: 56, borderRadius: 14, backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'transparent' })}>
              <Foto c={c} boy={44} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text style={{ color: R.yazi, fontSize: 15, fontWeight: '600' }}>{c.ad}</Text><Nokta d={cevrim ? durum(c) : 'id'} boy={7} atim={false} /></View>
                <Text numberOfLines={1} style={{ color: son?.r === 'o' ? '#d4d4da' : R.soluk, fontSize: 12.5 }}>{son?.t}</Text>
              </View>
              {son && <Text style={{ color: R.soluk, fontSize: 11.5 }}>{saatYazi(son.ts)}</Text>}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const CizgiD = ({ h = 12 }: { h?: number }) => <View style={{ width: 2, height: h, backgroundColor: 'rgba(255,255,255,0.28)', alignSelf: 'center' }} />;

function Hiyerarsi() {
  const { hepsi, durum } = useEkip();
  const kisi = (id: string, boy: number, ad = false) => {
    const c = hepsi.find((x) => x.id === id);
    if (!c) return null;
    return (
      <Pressable key={id} onPress={() => menuAc(id)} accessibilityRole="button" accessibilityLabel={c.ad + ', ' + c.gorev} style={({ pressed }) => ({ alignItems: 'center', gap: 3, transform: [{ scale: pressed ? 0.94 : 1 }] })}>
        <Avatar c={c} boy={boy} durum={boy >= 40 ? durum(c) : undefined} />
        {ad && <Text style={{ color: '#d2d2d7', fontSize: 10.5 }}>{c.ad}</Text>}
      </Pressable>
    );
  };
  const bilinen = ['orin', 'orla', 'nika', 'sage', 'mia', 'otto', 'iris', 'marco', 'nerya', 'echo', 'vera', 'luca', 'remy', 'cleo', 'ada', 'kai'];
  const digerleri = hepsi.filter((c) => !bilinen.includes(c.id));
  const kutu = (renk: string, yazi: string, baslik: string, ic: React.ReactNode) => (
    <View style={{ flex: 1, borderRadius: 16, borderWidth: 1, borderColor: renk + '4d', backgroundColor: renk + '10', padding: 10, gap: 8, alignItems: 'center' }}>
      <Text style={{ fontSize: 10.5, fontWeight: '700', letterSpacing: 1.5, color: yazi }}>{baslik}</Text>{ic}
    </View>
  );
  const sat = (...l: (string | React.ReactNode)[]) => <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>{l.map((x) => (typeof x === 'string' ? kisi(x, 34, true) : x))}</View>;
  return (
    <View style={[s.cam, { padding: 16, borderRadius: 22 }]}>
      <View style={{ alignItems: 'center' }}>
        <View accessible accessibilityLabel="Çağlar, sahip" style={{ width: 48, height: 48, borderRadius: 24, padding: 2, backgroundColor: R.ana }}>
          <View style={{ flex: 1, borderRadius: 24, backgroundColor: '#26262a', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: R.ana2, fontSize: 20, fontWeight: '800' }}>Ç</Text></View>
        </View>
        <Text style={{ color: R.yazi2, fontSize: 10.5, marginTop: 3 }}>Çağlar</Text>
      </View>
      <CizgiD />
      <View style={{ alignItems: 'center' }}>{kisi('orin', 48, true)}</View>
      <CizgiD />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {kisi('sage', 40, true)}
        <View style={{ width: 22, borderTopWidth: 2, borderColor: 'rgba(255,255,255,0.35)', borderStyle: 'dashed' }} />
        {kisi('orla', 48, true)}
        <View style={{ width: 22, borderTopWidth: 2, borderColor: 'rgba(255,255,255,0.28)' }} />
        {kisi('nika', 40, true)}
      </View>
      <CizgiD />
      <View style={{ width: '56%', height: 12, borderWidth: 2, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.28)', borderTopLeftRadius: 10, borderTopRightRadius: 10, alignSelf: 'center' }} />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        {kutu('#ec4899', '#ff8fd0', 'AİLE · 5', <>{kisi('mia', 40, true)}{sat('otto', 'iris', 'marco')}{sat('nerya')}</>)}
        {kutu('#3b82f6', '#79b3ff', 'ŞİRKET · 7', <>{sat('echo', 'vera', 'luca')}{sat('remy', 'cleo')}{sat('ada', 'kai')}</>)}
      </View>
      {digerleri.length > 0 && <View style={{ marginTop: 12 }}>{kutu('#8e8e95', '#c9c9cf', 'DİĞER · ' + digerleri.length, sat(...digerleri.map((c) => c.id)))}</View>}
      <Text style={[s.sub, { textAlign: 'center', marginTop: 12 }]}>Kişiye dokununca sağ çalışan menüsünde açılır.</Text>
    </View>
  );
}
