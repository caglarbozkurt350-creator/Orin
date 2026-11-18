// Orvane Mobil · ana kabuk: üst çubuk, 5 sekmeli çentikli alt menü, sağ çalışan menüsü, açılış ekranı.
// Sekmeler: Anasayfa · Ailem · Görevler/Onaylar/Görseller · Ekip/Hiyerarşi · Merkez
import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Acilis } from '@/bilesen/Acilis';
import { AltMenu } from '@/bilesen/AltMenu';
import { CalisanMenusu } from '@/bilesen/CalisanMenusu';
import { Ikon, Logo } from '@/bilesen/ortak';
import { Ailem, AileRayi } from '@/ekran/Ailem';
import { Anasayfa } from '@/ekran/Anasayfa';
import { EkipSekmesi } from '@/ekran/Ekip';
import { GorevlerSekmesi } from '@/ekran/Gorevler';
import { MerkezSekmesi } from '@/ekran/Merkez';
import { useBildirimler } from '@/lib/bildirim';
import { cagladaBekleyen } from '@/lib/ekip';
import { menuAc, menuKapat, merkezAlt, sekmeGit, useGezinti } from '@/lib/gezinti';
import { useEkip } from '@/lib/kullan';
import { R, useGorunumAyari } from '@/lib/tema';

let ACILDI = false; // açılış ekranı uygulama başına bir kez

function Ust() {
  const ust = useSafeAreaInsets().top;
  return (
    <View style={{ position: 'absolute', left: 12, right: 12, top: ust + 8, height: 60, borderRadius: 22, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 14, paddingRight: 8, backgroundColor: 'rgba(40,40,44,0.94)', borderWidth: 1, borderColor: R.camKenar, zIndex: 3 }}>
      <Logo boy={32} />
      <Text style={{ flex: 1, color: R.yazi, fontSize: 16, fontWeight: '700', letterSpacing: 5 }}>ORVANE</Text>
      <Pressable onPress={() => menuAc()} accessibilityRole="button" accessibilityLabel="Çalışanlar menüsünü aç" style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.93 : 1 }] })}>
        <Ikon ad="ekip" boy={20} renk="#e9e9ec" kalin={2} />
      </Pressable>
      <View accessible accessibilityLabel="Çağlar" style={{ width: 44, height: 44, borderRadius: 22, padding: 2, backgroundColor: R.ana }}>
        <View style={{ flex: 1, borderRadius: 22, backgroundColor: '#26262a', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: R.ana2, fontSize: 17, fontWeight: '800' }}>Ç</Text></View>
      </View>
    </View>
  );
}

/** Sağ kenardaki ok: çalışan menüsünü açar (Ailem sekmesinde sağ ray bu yeri kullandığı için gizlenir) */
function KenarOku() {
  const acik = useGezinti((d) => d.menu.acik);
  if (acik) return null;
  return (
    <Pressable onPress={() => menuAc()} accessibilityRole="button" accessibilityLabel="Çalışanlar menüsünü aç" hitSlop={{ left: 12, top: 12, bottom: 12 }}
      style={{ position: 'absolute', right: 0, top: '46%', width: 26, height: 64, borderTopLeftRadius: 16, borderBottomLeftRadius: 16, backgroundColor: 'rgba(52,52,58,0.92)', borderWidth: 1, borderRightWidth: 0, borderColor: R.camKenar, alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
      <Ikon ad="sol" boy={18} renk="#e9e9ec" kalin={2.4} />
    </Pressable>
  );
}

export default function Kabuk() {
  const sekme = useGezinti((d) => d.sekme), yon = useGezinti((d) => d.yon), onizle = useGezinti((d) => d.onizle), menuAcik = useGezinti((d) => d.menu.acik), merkezIc = useGezinti((d) => d.merkezAlt);
  const g = useGorunumAyari(), { o } = useEkip(), { okunmamis } = useBildirimler(), ins = useSafeAreaInsets();
  const [splash, setSplash] = useState(() => g.acilis && !ACILDI);
  const giris = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (g.gecis === 'yok') { giris.setValue(1); return; }
    giris.setValue(0);
    Animated.timing(giris, { toValue: 1, duration: g.gecis === 'akiskan' ? 600 : 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [sekme, onizle, g.gecis, giris]);
  useEffect(() => {
    const b = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuAcik) { menuKapat(); return true; }
      if (sekme === 4 && merkezIc) { merkezAlt(''); return true; }
      if (sekme !== 0) { sekmeGit(0); return true; }
      return false;
    });
    return () => b.remove();
  }, [menuAcik, sekme, merkezIc]);

  const stil = g.gecis === 'yok' ? {} : {
    opacity: giris,
    transform: g.gecis === 'kaydir' ? [{ translateX: giris.interpolate({ inputRange: [0, 1], outputRange: [yon === 'r' ? 40 : -40, 0] }) }]
      : g.gecis === 'yakinlas' ? [{ scale: giris.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }]
      : g.gecis === 'akiskan' ? [{ translateY: giris.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }, { scale: giris.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] : [],
  };
  const SEKMELER = [<Anasayfa key="0" />, <Ailem key="1" />, <GorevlerSekmesi key="2" />, <EkipSekmesi key="3" />, <MerkezSekmesi key="4" />];
  return (
    <View style={{ flex: 1, backgroundColor: R.zemin }}>
      {/* tema değişince bütün görünüm yeni vurgu rengiyle yeniden kurulur; sekme ve menü durumu gezinti deposunda korunur */}
      <View key={g.tema} style={{ flex: 1 }}>
        <View pointerEvents="none" style={{ position: 'absolute', left: -140, top: -120, width: 420, height: 420, borderRadius: 210, backgroundColor: 'rgba(110,90,80,0.14)' }} />
        <View pointerEvents="none" style={{ position: 'absolute', right: -160, bottom: -140, width: 420, height: 420, borderRadius: 210, backgroundColor: 'rgba(70,90,115,0.14)' }} />
        <Animated.View style={[{ flex: 1 }, stil]}>
          <ScrollView key={sekme + ':' + merkezIc} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: ins.top + 8 + 60 + 14, paddingHorizontal: 16, paddingBottom: 130 + ins.bottom }}>
            {SEKMELER[sekme]}
          </ScrollView>
        </Animated.View>
        <Ust />
        {sekme === 1 ? <AileRayi /> : <KenarOku />}
        <AltMenu sekme={sekme} git={(i) => sekmeGit(i, i === 4 ? { merkez: '' } : undefined)} onay={cagladaBekleyen(o).length} bildirim={okunmamis > 0} />
        <CalisanMenusu />
      </View>
      {splash && <Acilis bitti={() => { ACILDI = true; setSplash(false); }} />}
    </View>
  );
}
