// Orvane Mobil · ana kabuk: üst çubuk, 5 sekmeli çentikli alt menü, sağ çalışan menüsü, açılış ekranı.
// Sekmeler (0.9.0): Anasayfa · Ailem · İş Hayatı (+) · Bana Özel · Bildirim. Alt menü dışında: Görevler, Ayarlar (profil düğmesi), Ekip.
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
import { AyarlarSayfasi } from '@/ekran/Ayarlar';
import { BanaOzel } from '@/ekran/BanaOzel';
import { BildirimSekmesi } from '@/ekran/Bildirim';
import { GorevlerSekmesi } from '@/ekran/Gorevler';
import { IsHayati } from '@/ekran/IsHayati';
import { useBildirimler } from '@/lib/bildirim';
import { menuAc, menuKapat, SEKME_AYAR, sekmeGit, useGezinti } from '@/lib/gezinti';
import { useEkip } from '@/lib/kullan';
import { useRol } from '@/lib/rol';
import { R, useGorunumAyari } from '@/lib/tema';

/** Alt menüde olmayan sayfalar (Görevler, Ayarlar, Ekip): üstte geri bağlantısı */
function GeriSayfa({ don, ad, children }: { don: number; ad: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Pressable onPress={() => sekmeGit(don)} accessibilityRole="button" accessibilityLabel={ad + ' sayfasına dön'} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, alignSelf: 'flex-start', paddingRight: 12 }}>
        <Ikon ad="sol" boy={20} renk={R.yazi} kalin={2.2} /><Text style={{ color: R.yazi, fontSize: 14, fontWeight: '600' }}>{ad}</Text>
      </Pressable>
      {children}
    </View>
  );
}

let ACILDI = false; // açılış ekranı uygulama başına bir kez

function Ust({ pasif, cevrim }: { pasif: boolean; cevrim: boolean }) {
  const ust = useSafeAreaInsets().top, es = useRol() === 'es';
  return (
    <View style={{ position: 'absolute', left: 12, right: 12, top: ust + 8, height: 60, borderRadius: 22, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 14, paddingRight: 8, backgroundColor: 'rgba(40,40,44,0.94)', borderWidth: 1, borderColor: R.camKenar, zIndex: 3 }}>
      <Logo boy={32} />
      <Text style={{ flex: 1, color: R.yazi, fontSize: 16, fontWeight: '700', letterSpacing: 5 }}>ORVANE</Text>
      {!pasif && <Pressable onPress={() => menuAc()} accessibilityRole="button" accessibilityLabel="Çalışanlar menüsünü aç" style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.93 : 1 }] })}>
        <Ikon ad="ekip" boy={20} renk="#e9e9ec" kalin={2} />
      </Pressable>}
      <Pressable onPress={() => sekmeGit(SEKME_AYAR)} accessibilityRole="button" accessibilityLabel="Profil ve ayarlar" style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, padding: 2, backgroundColor: R.ana, transform: [{ scale: pressed ? 0.93 : 1 }] })}>
        <View style={{ flex: 1, borderRadius: 22, backgroundColor: '#26262a', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: R.ana2, fontSize: 17, fontWeight: '800' }}>{es ? 'K' : 'Ç'}</Text></View>
        <View style={{ position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: cevrim ? R.yesil : R.bosta, borderWidth: 2, borderColor: '#28282c' }} />
      </Pressable>
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
  const sekme = useGezinti((d) => d.sekme), yon = useGezinti((d) => d.yon), onizle = useGezinti((d) => d.onizle), menuAcik = useGezinti((d) => d.menu.acik);
  const g = useGorunumAyari(), { pasif, cevrim } = useEkip(), { okunmamis } = useBildirimler(), ins = useSafeAreaInsets();
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
      if (sekme === 7) { sekmeGit(4); return true; }
      if (sekme !== 0) { sekmeGit(0); return true; }
      return false;
    });
    return () => b.remove();
  }, [menuAcik, sekme]);

  const stil = g.gecis === 'yok' ? {} : {
    opacity: giris,
    transform: g.gecis === 'kaydir' ? [{ translateX: giris.interpolate({ inputRange: [0, 1], outputRange: [yon === 'r' ? 40 : -40, 0] }) }]
      : g.gecis === 'yakinlas' ? [{ scale: giris.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }]
      : g.gecis === 'akiskan' ? [{ translateY: giris.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }, { scale: giris.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] : [],
  };
  const SEKMELER = [<Anasayfa key="0" />, <Ailem key="1" />, <IsHayati key="2" />, <BanaOzel key="3" />, <BildirimSekmesi key="4" />,
    <GeriSayfa key="5" don={0} ad="Anasayfa"><GorevlerSekmesi /></GeriSayfa>, <GeriSayfa key="6" don={0} ad="Anasayfa"><AyarlarSayfasi /></GeriSayfa>, <GeriSayfa key="7" don={4} ad="Bildirim"><EkipSekmesi /></GeriSayfa>];
  return (
    <View style={{ flex: 1, backgroundColor: R.zemin }}>
      {/* tema değişince bütün görünüm yeni vurgu rengiyle yeniden kurulur; sekme ve menü durumu gezinti deposunda korunur */}
      <View key={g.tema} style={{ flex: 1 }}>
        <View pointerEvents="none" style={{ position: 'absolute', left: -140, top: -120, width: 420, height: 420, borderRadius: 210, backgroundColor: 'rgba(110,90,80,0.14)' }} />
        <View pointerEvents="none" style={{ position: 'absolute', right: -160, bottom: -140, width: 420, height: 420, borderRadius: 210, backgroundColor: 'rgba(70,90,115,0.14)' }} />
        <Animated.View style={[{ flex: 1 }, stil]}>
          <ScrollView key={sekme} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: ins.top + 8 + 60 + 14, paddingHorizontal: 16, paddingBottom: 130 + ins.bottom }}>
            {SEKMELER[sekme]}
          </ScrollView>
        </Animated.View>
        <Ust pasif={pasif} cevrim={cevrim} />
        {pasif ? null : sekme === 1 ? <AileRayi /> : <KenarOku />}
        <AltMenu sekme={sekme} git={(i) => sekmeGit(i)} bildirim={okunmamis > 0} stil={g.cubuk} />
        <CalisanMenusu />
      </View>
      {splash && <Acilis bitti={() => { ACILDI = true; setSplash(false); }} />}
    </View>
  );
}
