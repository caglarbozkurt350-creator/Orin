// Açılış ekranı (bir kez, yaklaşık 2,5 sn): tema renginde parlayan kutucuk → ORVANE harfleri netleşerek açılır → "KİŞİSEL ASİSTAN EKİBİN" → ekran kaybolur.
// Ayarlar › Açılış ekranı ile kapatılabilir; "hareketi azalt" açıksa gösterilmez.
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Logo } from '@/bilesen/ortak';
import { R, saydam } from '@/lib/tema';

const HARF = ['O', 'R', 'V', 'A', 'N', 'E'];

export function Acilis({ bitti }: { bitti: () => void }) {
  const kutu = useRef(new Animated.Value(0)).current, kay = useRef(new Animated.Value(0)).current, harf = useRef(HARF.map(() => new Animated.Value(0))).current, alt = useRef(new Animated.Value(0)).current, cik = useRef(new Animated.Value(0)).current;
  const [goster, setGoster] = useState(true), bt = useRef(bitti);
  bt.current = bitti;
  useEffect(() => {
    let iptal = false;
    AccessibilityInfo.isReduceMotionEnabled().then((azalt) => {
      if (iptal) return;
      if (azalt) { setGoster(false); bt.current(); return; }
      Animated.parallel([
        Animated.timing(kutu, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.sequence([Animated.delay(650), Animated.timing(kay, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.cubic), useNativeDriver: true })]),
        ...harf.map((h, i) => Animated.sequence([Animated.delay(900 + i * 90), Animated.timing(h, { toValue: 1, duration: 650, easing: Easing.out(Easing.exp), useNativeDriver: true })])),
        Animated.sequence([Animated.delay(1550), Animated.timing(alt, { toValue: 1, duration: 800, easing: Easing.out(Easing.exp), useNativeDriver: true })]),
        Animated.sequence([Animated.delay(2500), Animated.timing(cik, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.cubic), useNativeDriver: true })]),
      ]).start(({ finished }) => { if (finished) { setGoster(false); bt.current(); } });
    });
    return () => { iptal = true; };
  }, [kutu, kay, harf, alt, cik]);
  if (!goster) return null;
  return (
    <Animated.View accessibilityLabel="ORVANE açılıyor" style={[StyleSheet.absoluteFill, { zIndex: 60, backgroundColor: R.zemin, alignItems: 'center', justifyContent: 'center', gap: 14, opacity: cik.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ scale: cik.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }] }]}>
      <View pointerEvents="none" style={{ position: 'absolute', width: 420, height: 420, borderRadius: 210, backgroundColor: saydam(R.ana, 0.1) }} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View style={{ opacity: kutu, transform: [{ scale: kutu.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }, { translateX: kay.interpolate({ inputRange: [0, 1], outputRange: [82, 0] }) }] }}><Logo boy={54} /></Animated.View>
        <View style={{ flexDirection: 'row', marginLeft: 6 }}>
          {HARF.slice(1).map((l, i) => (
            <Animated.Text key={l + i} style={{ color: R.yazi, fontSize: 46, fontWeight: '700', letterSpacing: 3, opacity: harf[i + 1], transform: [{ translateX: harf[i + 1].interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }, { scale: harf[i + 1].interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}>{l}</Animated.Text>
          ))}
        </View>
      </View>
      <Animated.View style={{ opacity: alt, transform: [{ translateY: alt.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}><Text style={{ color: '#c9c9cf', fontSize: 11, fontWeight: '600', letterSpacing: 5 }}>KİŞİSEL ASİSTAN EKİBİN</Text></Animated.View>
    </Animated.View>
  );
}
