// Görevler sekmesi: Görevler · Onaylar · Görseller. Önceki Görevler ve Onaylar ekranlarının içeriği korunur.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AltPencere, Bos, GelisimFormu, GorevFormu, GorevSinir } from '@/bilesen/formlar';
import { GelisimSatiri } from '@/bilesen/gelisim';
import { Bolumler, Dugme, Foto, Ikon, Rozet, SayfaBasligi, s } from '@/bilesen/ortak';
import { olayEkle } from '@/lib/depo';
import { cagladaBekleyen, Calisan, incelemedeBekleyen } from '@/lib/ekip';
import { gorevBolumu, useGezinti } from '@/lib/gezinti';
import { useEkip } from '@/lib/kullan';
import { esitleSonra } from '@/lib/senk';
import { R } from '@/lib/tema';

export function GorevlerSekmesi() {
  const bolum = useGezinti((d) => d.gorevBolum), { o } = useEkip(), onay = cagladaBekleyen(o).length;
  return (
    <View style={{ gap: 14 }}>
      <SayfaBasligi ust="İş takibi" baslik={bolum === 'gorev' ? 'Görevler' : bolum === 'onay' ? 'Onaylar' : 'Görseller'} />
      <Bolumler secenek={[['gorev', 'Görevler'], ['onay', 'Onaylar · ' + onay], ['gorsel', 'Görseller']]} deger={bolum} sec={gorevBolumu} />
      {bolum === 'gorev' && <GorevListesi />}
      {bolum === 'onay' && <Onaylar />}
      {bolum === 'gorsel' && <Gorseller />}
    </View>
  );
}

function GorevListesi() {
  const { o, hepsi } = useEkip();
  const [kim, setKim] = useState<Calisan | null>(null), [sec, setSec] = useState(false);
  const g = o.ekip.gorev.slice().sort((a, b) => Number(a.durum === 'bitti') - Number(b.durum === 'bitti') || b.ts - a.ts);
  return (
    <View style={{ gap: 10 }}>
      <Dugme yazi="Yeni görev" ikon="arti" tur="ikinci" onPress={() => setSec(true)} />
      {g.length ? g.map((x) => {
        const c = hepsi.find((y) => y.id === x.kim);
        return (
          <View key={x.id} style={[s.cam, { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 20, opacity: x.durum === 'bitti' ? 0.6 : 1 }]}>
            <Pressable onPress={() => { olayEkle('gorev_durum', { id: x.id, durum: x.durum === 'bitti' ? 'acik' : 'bitti' }); esitleSonra(); }} accessibilityRole="checkbox" accessibilityState={{ checked: x.durum === 'bitti' }} accessibilityLabel="Bitti" hitSlop={10}
              style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: x.durum === 'bitti' ? R.yesil : '#5a5a62', backgroundColor: x.durum === 'bitti' ? R.yesil : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {x.durum === 'bitti' && <Ikon ad="tik" boy={14} renk="#fff" kalin={2.4} />}
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => c && router.push(('/calisan/' + c.id) as any)}>
              <Text style={{ color: R.yazi, fontSize: 14.5, lineHeight: 21 }}>{x.metin}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}><Foto c={c} boy={18} halka={false} /><Text style={{ color: R.soluk, fontSize: 12 }}>{c?.ad} · doğrudan görev{x.son ? ' · ' + x.son : ''}</Text></View>
              <GorevSinir g={x} />
            </Pressable>
            {x.onc === 'acil' && <Rozet yazi="Acil" renk={R.acil} />}
          </View>
        );
      }) : <Bos yazi="Henüz görev yok. Yukarıdaki düğmeyle bir çalışana doğrudan görev verebilirsin." ikon="gorev" />}
      <AltPencere acik={sec || !!kim} kapat={() => { setSec(false); setKim(null); }}>
        {kim ? <GorevFormu c={kim} kapat={() => setKim(null)} /> : (
          <View style={{ gap: 6 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 6 }}>Kime görev verilsin?</Text>
            {hepsi.map((c) => (
              <Pressable key={c.id} onPress={() => { setSec(false); setKim(c); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, minHeight: 48 }}>
                <Foto c={c} boy={36} /><View style={{ flex: 1 }}><Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{c.ad}</Text><Text style={{ color: R.soluk, fontSize: 12.5 }}>{c.gorev}</Text></View>
              </Pressable>
            ))}
          </View>
        )}
      </AltPencere>
    </View>
  );
}

// Gelişim talepleri Nika (İK) › Orin (CEO) › Çağlar (son onay). "Senin onayın" yalnız ikisinden geçenleri listeler.
function Onaylar() {
  const { o, hepsi } = useEkip();
  const cag = cagladaBekleyen(o), inc = incelemedeBekleyen(o);
  const [sek, setSek] = useState<'cag' | 'inc'>(!cag.length && inc.length ? 'inc' : 'cag'), [form, setForm] = useState(false);
  const liste = sek === 'cag' ? cag : inc;
  // Çağlar yalnız son aşamada (ceo) karar verir; Nika ve Orin kendi aşamalarını masaüstünde otomatik inceler
  const karar = (id: string, ok: boolean) => { olayEkle('gelisim_karar', { id, asama: 'ceo', ok }); esitleSonra(); };
  const son = useMemo(() => o.ekip.gel.filter((g) => g.asama === 'tamam' || g.asama === 'red').slice(-8).reverse(), [o]);
  const redKim = (g: (typeof son)[number]) => (g.asama !== 'red' ? '' : g.ceo ? ' · Çağlar reddetti' : g.orin && !g.orin.ok ? ' · Orin reddetti' : g.ik && !g.ik.ok ? ' · Nika reddetti' : '');
  return (
    <View style={{ gap: 10 }}>
      <Text style={s.soluk}>Beceri ve hafıza önce İK Müdürü Nika, sonra CEO Orin tarafından incelenir. İkisinden geçenler son onay için sana gelir; reddedilenler sana gelmez (masaüstünde “Son kararlar”dan bozulabilir).</Text>
      <Bolumler secenek={[['cag', 'Senin onayın · ' + cag.length], ['inc', 'Nika / Orin’de · ' + inc.length]]} deger={sek} sec={setSek} />
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
      {son.length > 0 && <Text style={s.bolum}>SON KARARLAR</Text>}
      {son.map((g) => <GelisimSatiri key={g.id} g={g} ust={<Text style={{ color: R.soluk, fontSize: 12.5, marginBottom: 4 }}>{hepsi.find((x) => x.id === g.kim)?.ad}{redKim(g)}</Text>} />)}
      <AltPencere acik={form} kapat={() => setForm(false)}><GelisimFormu o={o} hepsi={hepsi} kimden="nika" tur0="beceri" kapat={() => setForm(false)} /></AltPencere>
    </View>
  );
}

// Görseller: masaüstünde yerel klasörden proje koduna göre eşleşir. Telefonda görsel kaynağı yok; proje kodları gruplanır.
function Gorseller() {
  const { o } = useEkip();
  const gruplar = useMemo(() => {
    const g: Record<string, string[]> = {};
    o.proj.forEach((k) => { const m = /^(\d+)\./.exec(k.trim()), ad = m ? 'SY' + m[1] : 'Diğer'; (g[ad] = g[ad] || []).push(k); });
    return Object.keys(g).sort().map((k) => [k, g[k]] as [string, string[]]);
  }, [o.proj]);
  return (
    <View style={{ gap: 10 }}>
      <View style={[s.cam, { gap: 6 }]}><Text style={s.sub}>Görseller proje koduna göre eşleşir. Klasör masaüstü Orvane’nin Ayarlar bölümünden seçilir; telefon görselleri henüz göstermez.</Text></View>
      {gruplar.length ? gruplar.map(([k, l]) => (
        <View key={k} style={[s.cam, { gap: 10 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={s.ct}>{k}</Text><Text style={s.sub}>{l.length} proje · görsel bekleniyor</Text></View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{l.slice(0, 12).map((p) => <View key={p} style={{ paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' }}><Text style={{ color: '#d4d4da', fontSize: 12.5 }}>{p}</Text></View>)}</View>
        </View>
      )) : <Bos yazi="Henüz proje kodu yok. Masaüstü Orvane ile eşitlenince projeler burada gruplanır." ikon="gorsel" />}
    </View>
  );
}
