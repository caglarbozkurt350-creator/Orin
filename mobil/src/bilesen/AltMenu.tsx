// Alt menü: 5 sekme, çentikli çubuk. Aktif simge yeşil yuvarlağa çıkar, çubukta altında yumuşak çukur açılır,
// yuvarlak yaylanarak kayar (tasarım: AndroidNav.dc.html). React Native Animated; ek paket gerekmez.
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { Ikon } from '@/bilesen/ortak';
import { R } from '@/lib/tema';

const SEKMELER: [string, string][] = [['ev', 'Anasayfa'], ['kalp', 'Ailem'], ['artiDaire', 'İş günü kaydı ve izin girişi'], ['kisi', 'Ekip ve hiyerarşi'], ['zil', 'Merkez: iş günü, bildirimler, eşitleme, ayarlar']];
const H = 68, RR = 26, ARALIK = 62;

function yol(W: number, cx: number) {
  const a = Math.max(cx - 44, RR), b = Math.min(cx + 44, W - RR);
  return `M ${RR} 0 L ${a} 0 C ${cx - 26} 0 ${cx - 30} 34 ${cx} 34 C ${cx + 30} 34 ${cx + 26} 0 ${b} 0 L ${W - RR} 0 A ${RR} ${RR} 0 0 1 ${W} ${RR} L ${W} ${H - RR} A ${RR} ${RR} 0 0 1 ${W - RR} ${H} L ${RR} ${H} A ${RR} ${RR} 0 0 1 0 ${H - RR} L 0 ${RR} A ${RR} ${RR} 0 0 1 ${RR} 0 Z`;
}

/** Çentiksiz çubuk: alt menüde olmayan bir sayfa (Görevler ve onaylar) açıkken */
function duzYol(W: number) {
  return `M ${RR} 0 L ${W - RR} 0 A ${RR} ${RR} 0 0 1 ${W} ${RR} L ${W} ${H - RR} A ${RR} ${RR} 0 0 1 ${W - RR} ${H} L ${RR} ${H} A ${RR} ${RR} 0 0 1 0 ${H - RR} L 0 ${RR} A ${RR} ${RR} 0 0 1 ${RR} 0 Z`;
}

export function AltMenu({ sekme, git, bildirim }: { sekme: number; git: (i: number) => void; bildirim: boolean }) {
  const W = Math.min(useWindowDimensions().width - 32, 420), alt = useSafeAreaInsets().bottom;
  const cxs = [0, 1, 2, 3, 4].map((i) => W / 2 + (i - 2) * ARALIK);
  const menude = sekme >= 0 && sekme <= 4;
  const x = useRef(new Animated.Value(cxs[menude ? sekme : 2])).current;
  const [cx, setCx] = useState(cxs[menude ? sekme : 2]);
  useEffect(() => { const id = x.addListener(({ value }) => setCx(value)); return () => x.removeListener(id); }, [x]);
  useEffect(() => { if (menude) Animated.spring(x, { toValue: W / 2 + (sekme - 2) * ARALIK, friction: 6, tension: 80, useNativeDriver: false }).start(); }, [sekme, menude, W, x]);
  const d = menude ? yol(W, cx) : duzYol(W);
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(alt, 8) + 12, alignItems: 'center', zIndex: 4 }}>
      <View accessibilityRole="tablist" style={{ width: W, height: H }}>
        <Svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <Path d={d} fill="rgba(40,40,44,0.96)" stroke="rgba(255,255,255,0.16)" strokeWidth={1.2} />
        </Svg>
        {SEKMELER.map(([ik, ad], i) => (
          <Pressable key={ik} onPress={() => git(i)} accessibilityRole="tab" accessibilityState={{ selected: i === sekme }} accessibilityLabel={ad}
            style={{ position: 'absolute', left: cxs[i] - 26, top: 14, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', opacity: i === sekme ? 0 : 1 }}>
            <Ikon ad={ik} boy={i === 2 ? 26 : 22} renk={i === 2 ? R.ana2 : '#d2d2d7'} kalin={2} />
          </Pressable>
        ))}
        <View pointerEvents="none" style={{ position: 'absolute', left: W / 2 - 36, bottom: 9, width: 72, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.45)' }} />
        {bildirim && sekme !== 4 && <View pointerEvents="none" style={{ position: 'absolute', left: cxs[4] - 10, top: 22, width: 10, height: 10, borderRadius: 5, backgroundColor: R.ana, borderWidth: 2, borderColor: '#2c2c30' }} />}
        {menude && <Pressable onPress={() => git(sekme)} accessibilityLabel={SEKMELER[sekme][1]} style={{ position: 'absolute', left: cx - 27, top: -25, width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', shadowColor: '#4fb98f', shadowOpacity: 0.55, shadowRadius: 13, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}>
          <Svg width={54} height={54} style={{ position: 'absolute' }}>
            <Defs><LinearGradient id="bub" x1="0" y1="0" x2="0.4" y2="1"><Stop offset="0" stopColor="#92e6c8" /><Stop offset="1" stopColor="#4fb98f" /></LinearGradient></Defs>
            <Circle cx={27} cy={27} r={27} fill="url(#bub)" />
            <Circle cx={27} cy={27} r={26.5} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
          </Svg>
          <Ikon ad={SEKMELER[sekme][0]} boy={24} renk="#fff" kalin={2.2} />
        </Pressable>}
      </View>
    </View>
  );
}
