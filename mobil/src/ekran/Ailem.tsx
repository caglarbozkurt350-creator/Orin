// Ailem: tek sayfada kategoriler ve çalışanlar. Çalışanlar en sağda yuvarlak, yukarıdan aşağı açılır (AileRayi).
// Kategori verileri (bütçe, ilaç planı, menü...) masaüstünde tutulur; telefonda ilgili çalışana ulaşılır:
// Mesaj (çalışan sayfası), Görev ver, Otto'ya gelir/gider ekle (mevcut finans_kayit olayı).
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AltPencere, FinansFormu, GorevFormu } from '@/bilesen/formlar';
import { Avatar, Dugme, Foto, Ikon, KartK, SayfaBasligi, s } from '@/bilesen/ortak';
import { aciklama } from '@/lib/ekip';
import { KISA } from '@/lib/ekipMeta';
import { aileSec, rayDegis, sekmeGit, useGezinti } from '@/lib/gezinti';
import { useEkip } from '@/lib/kullan';
import { R, saydam } from '@/lib/tema';

const KAT: [string, string, string, string, string][] = [
  ['otto', 'Bütçe', 'Çağlar ve Kübra bakiyeleri ayrı', 'B', '#ffb3d9'],
  ['iris', 'Sağlık', 'Günlük ilaç planı · 21:30 kontrol', 'S', '#c4b5fd'],
  ['marco', 'Menü & Market', 'Haftalık menü ve market listesi', 'M', '#fda4af'],
  ['nerya', 'Satın Alma', 'Araştırır, yalnızca öneri sunar', 'A', '#f9a8d4'],
  ['mia', 'Ev İşleri', 'Aile işlerinde tek muhatap', 'E', '#e9d5ff'],
  ['remy', 'Aile Takvimi', 'Bozkurt Ailesi takvimi', 'T', '#a7f3d0'],
];
const ISLER: Record<string, string> = {
  mia: 'Aile işlerinde muhatap; Çağlar ve Kübra’ya yanıt verir. Otto, Iris, Marco ve Nerya ona bağlı.',
  otto: 'Gelir-gider kaydı; Çağlar ve Kübra bakiyelerini ayrı tutar, aradaki transferi gelir/gider saymaz.',
  iris: 'Sağlık takibi ve günlük ilaç planı; akşam 21:30’da kontrol eder.',
  marco: 'Yemek menüsü ve market listesi hazırlar.',
  nerya: 'Alışveriş araştırır, yalnızca öneri sunar; Otto finansal onay verir.',
  remy: 'Takvim ve hatırlatmalar; Bozkurt Ailesi takvimine etkinlik ekler.',
};
const AILE = ['mia', 'otto', 'iris', 'marco', 'nerya'];
// Pasif (manuel mod): isim/avatar yerine işlev simgesi ve işlev açıklaması
const SIMGE: Record<string, string> = { otto: 'kart', iris: 'kalp', marco: 'not', nerya: 'ara', mia: 'ev', remy: 'izin' };
const PASIF_IS: Record<string, string> = {
  otto: 'Gelir-gider kaydı; iki kişinin bakiyesi ayrı tutulur, aradaki transfer gelir/gider sayılmaz.',
  iris: 'Sağlık takibi ve günlük ilaç planı.',
  marco: 'Haftalık yemek menüsü ve market listesi.',
  nerya: 'Alışveriş listesi ve karşılaştırma notları.',
  mia: 'Ev işleri ve aile yapılacakları.',
  remy: 'Aile takvimi ve hatırlatmalar.',
};

export function Ailem() {
  const { o, hepsi, durum, bul, pasif } = useEkip();
  const fam = useGezinti((d) => d.aile.fam), famId = fam || 'mia', c = bul(famId);
  const [form, setForm] = useState<'' | 'gorev' | 'finans'>('');
  if (pasif) return <AilemPasif />;
  return (
    <View style={{ gap: 14, paddingRight: 76 }}>
      <SayfaBasligi ust="Kategoriler ve çalışanlar" baslik="Ailem" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {KAT.map(([id, ad, alt, harf, renk]) => {
          const k = bul(id), on = famId === id;
          return (
            <Pressable key={id} onPress={() => aileSec(on && fam ? null : id)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={ad + ', ' + alt}
              style={({ pressed }) => ({ width: '48%', flexGrow: 1, minHeight: 132, borderRadius: 20, padding: 14, gap: 8, borderWidth: 1, borderColor: on ? saydam(R.ana, 0.7) : 'rgba(255,255,255,0.10)', backgroundColor: on ? saydam(R.ana, 0.1) : 'rgba(255,255,255,0.05)', opacity: fam && !on ? 0.45 : 1, transform: [{ translateY: on ? -2 : 0 }, { scale: pressed ? 0.95 : 1 }] })}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: renk, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#1c1c1e', fontWeight: '700', fontSize: 15 }}>{harf}</Text></View>
              <Text style={{ color: R.yazi, fontSize: 14, lineHeight: 18, fontWeight: '600' }}>{ad}</Text>
              <Text style={s.sub}>{alt}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 'auto' }}><Foto c={k} boy={20} halka={false} /><Text numberOfLines={1} style={{ flex: 1, color: '#c9c9cf', fontSize: 11.5 }}>{k ? k.ad + ' · ' + (KISA[id] || k.gorev) : ''}</Text></View>
            </Pressable>
          );
        })}
      </View>
      {c && (
        <KartK ad="aileSecili" baslik="SEÇİLİ ÇALIŞAN" ozet={c.ad + ' · ' + (KISA[c.id] || c.gorev)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar c={c} boy={52} durum={durum(c)} />
            <View style={{ flex: 1, gap: 2 }}><Text style={{ color: R.yazi, fontSize: 16, fontWeight: '600' }}>{c.ad}</Text><Text style={s.sub}>{c.gorev}</Text></View>
          </View>
          <Text style={{ color: '#d2d2d7', fontSize: 13, lineHeight: 19 }}>{ISLER[c.id] || aciklama(c)}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Dugme yazi="Mesaj" stil={{ flex: 1 }} onPress={() => router.push(('/calisan/' + c.id) as any)} />
            <Dugme yazi="Görev ver" tur="ikinci" stil={{ flex: 1 }} onPress={() => setForm('gorev')} />
          </View>
          {c.id === 'otto' && <Dugme yazi="Gelir / gider ekle" ikon="kaydet" tur="ikinci" onPress={() => setForm('finans')} />}
        </KartK>
      )}
      <AltPencere acik={!!form} kapat={() => setForm('')}>
        {form === 'gorev' && c ? <GorevFormu c={c} kapat={() => setForm('')} /> : form === 'finans' ? <FinansFormu kapat={() => setForm('')} /> : null}
      </AltPencere>
    </View>
  );
}

/** Ailem · pasif: kategoriler işlev simgeleriyle; çalışan rayı ve "Mesaj / Görev ver" yok */
function AilemPasif() {
  const fam = useGezinti((d) => d.aile.fam), sec = KAT.find((k) => k[0] === (fam || 'otto')) || KAT[0];
  const [finans, setFinans] = useState(false);
  return (
    <View style={{ gap: 14 }}>
      <SayfaBasligi ust="Bütçe, sağlık, menü, takvim" baslik="Ailem" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {KAT.map(([id, ad, , , renk]) => {
          const on = sec[0] === id;
          return (
            <Pressable key={id} onPress={() => aileSec(id)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={ad}
              style={({ pressed }) => ({ width: '48%', flexGrow: 1, minHeight: 112, borderRadius: 20, padding: 14, gap: 8, borderWidth: 1, borderColor: on ? saydam(R.ana, 0.7) : 'rgba(255,255,255,0.10)', backgroundColor: on ? saydam(R.ana, 0.1) : 'rgba(255,255,255,0.05)', transform: [{ translateY: on ? -2 : 0 }, { scale: pressed ? 0.95 : 1 }] })}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: renk, alignItems: 'center', justifyContent: 'center' }}><Ikon ad={SIMGE[id]} boy={19} renk="#1c1c1e" kalin={2.2} /></View>
              <Text style={{ color: R.yazi, fontSize: 14, lineHeight: 18, fontWeight: '600' }}>{ad}</Text>
              <Text numberOfLines={2} style={s.sub}>{PASIF_IS[id]}</Text>
            </Pressable>
          );
        })}
      </View>
      <KartK ad="aileKat" baslik={sec[1].toLocaleUpperCase('tr')} ozet={PASIF_IS[sec[0]]}>
        <Text style={{ color: '#d2d2d7', fontSize: 13, lineHeight: 19 }}>{PASIF_IS[sec[0]]} Ayrıntılar bilgisayardaki Orvane’de Ailem › {sec[1]} sayfasında tutulur.</Text>
        {sec[0] === 'otto' && <Dugme yazi="Gelir / gider ekle" ikon="kaydet" onPress={() => setFinans(true)} />}
        <Dugme yazi="İzin / takvim girişi" ikon="izin" tur="ikinci" onPress={() => sekmeGit(2, { kayit: 'izin' })} />
      </KartK>
      <AltPencere acik={finans} kapat={() => setFinans(false)}>{finans ? <FinansFormu kapat={() => setFinans(false)} /> : null}</AltPencere>
    </View>
  );
}

/** Sağ kenardaki yuvarlak çalışan rayı: ok düğmesiyle açılır/kapanır, profiller yukarıdan aşağı düşer */
export function AileRayi() {
  const { hepsi, durum } = useEkip(), { fam, ray } = useGezinti((d) => d.aile), ust = useSafeAreaInsets().top;
  const liste = AILE.map((id) => hepsi.find((c) => c.id === id)).filter(Boolean) as typeof hepsi;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', right: 12, top: ust + 92, width: 64, alignItems: 'center', gap: 12, zIndex: 2 }}>
      <Pressable onPress={rayDegis} accessibilityRole="button" accessibilityState={{ expanded: ray }} accessibilityLabel="Çalışanları aç / kapat" style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(40,40,44,0.92)', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ transform: [{ rotate: ray ? '180deg' : '0deg' }] }}><Ikon ad="asagi" boy={22} renk="#e9e9ec" kalin={2} /></View>
      </Pressable>
      {ray && liste.map((c, i) => <RayDugme key={c.id} c={c} i={i} on={(fam || 'mia') === c.id} durum={durum(c)} />)}
    </View>
  );
}
function RayDugme({ c, i, on, durum }: { c: (ReturnType<typeof useEkip>['hepsi'])[number]; i: number; on: boolean; durum: 'ok' | 'bz' | 'id' }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(a, { toValue: 1, delay: i * 70, friction: 6, tension: 90, useNativeDriver: true }).start(); }, [a, i]);
  return (
    <Animated.View style={{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-26, 0] }) }, { scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}>
      <Pressable onPress={() => aileSec(c.id)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={c.ad} style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
        <Avatar c={c} boy={56} durum={durum} sec={on} />
      </Pressable>
    </Animated.View>
  );
}
