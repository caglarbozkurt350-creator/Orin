// Alt menü (0.9.0): 5 sekme — Anasayfa · Ailem · İş Hayatı (+) · Bana Özel · Bildirim. Simgeler 0.8 ile aynı.
// 4 stil Ayarlar’dan seçilir (tema.ts › CUBUKLAR): Çentik (kabarcık), Kemer (ışıklı çizgi seçilinin altında kemer olur),
// Spot (seçiliye üstten ışık), Hap (seçilinin arkasında renkli hap). Seçim yaylanarak kayar; hepsi tema rengini alır.
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { Ikon } from '@/bilesen/ortak';
import { CubukAnahtari, R, saydam } from '@/lib/tema';

const SEKMELER: [string, string][] = [['ev', 'Anasayfa'], ['kalp', 'Ailem'], ['artiDaire', 'İş Hayatı: iş günü kaydı ve izin'], ['kisi', 'Bana Özel'], ['zil', 'Bildirim']];
const H = 68, RR = 26, ARALIK = 62;

const kose = (W: number) => `L ${W - RR} 0 A ${RR} ${RR} 0 0 1 ${W} ${RR} L ${W} ${H - RR} A ${RR} ${RR} 0 0 1 ${W - RR} ${H} L ${RR} ${H} A ${RR} ${RR} 0 0 1 0 ${H - RR} L 0 ${RR} A ${RR} ${RR} 0 0 1 ${RR} 0 Z`;
function centikYol(W: number, cx: number) {
  const a = Math.max(cx - 44, RR), b = Math.min(cx + 44, W - RR);
  return `M ${RR} 0 L ${a} 0 C ${cx - 26} 0 ${cx - 30} 34 ${cx} 34 C ${cx + 30} 34 ${cx + 26} 0 ${b} 0 ` + kose(W);
}
const duzYol = (W: number) => `M ${RR} 0 ` + kose(W);
/** Kemer: üst kenardaki ışıklı çizgi seçilinin altında aşağı kavis yapar */
const kemerCizgi = (W: number, cx: number) => `M ${RR} 1 L ${cx - 34} 1 Q ${cx} 30 ${cx + 34} 1 L ${W - RR} 1`;

export function AltMenu({ sekme, git, bildirim, stil }: { sekme: number; git: (i: number) => void; bildirim: boolean; stil: CubukAnahtari }) {
  const W = Math.min(useWindowDimensions().width - 32, 420), alt = useSafeAreaInsets().bottom;
  const cxs = [0, 1, 2, 3, 4].map((i) => W / 2 + (i - 2) * ARALIK);
  const menude = sekme >= 0 && sekme <= 4;
  const x = useRef(new Animated.Value(cxs[menude ? sekme : 2])).current;
  const [cx, setCx] = useState(cxs[menude ? sekme : 2]);
  useEffect(() => { const id = x.addListener(({ value }) => setCx(value)); return () => x.removeListener(id); }, [x]);
  useEffect(() => { if (menude) Animated.spring(x, { toValue: W / 2 + (sekme - 2) * ARALIK, friction: 6, tension: 80, useNativeDriver: false }).start(); }, [sekme, menude, W, x]);
  const centik = stil === 'centik';
  const d = centik && menude ? centikYol(W, cx) : duzYol(W);
  const secRenk = stil === 'hap' ? R.ana2 : '#fff';
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(alt, 8) + 12, alignItems: 'center', zIndex: 4 }}>
      <View accessibilityRole="tablist" style={{ width: W, height: H }}>
        <Svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <Defs>
            <LinearGradient id="spot" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={R.ana2} stopOpacity={0.55} /><Stop offset="1" stopColor={R.ana} stopOpacity={0} /></LinearGradient>
          </Defs>
          <Path d={d} fill="rgba(40,40,44,0.96)" stroke="rgba(255,255,255,0.16)" strokeWidth={1.2} />
          {stil === 'kemer' && menude && <>
            <Path d={kemerCizgi(W, cx)} fill="none" stroke={R.ana2} strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
            <Path d={kemerCizgi(W, cx)} fill="none" stroke={R.ana2} strokeWidth={2} strokeLinecap="round" />
          </>}
          {stil === 'spot' && menude && <>
            <Path d={`M ${cx - 16} 0 L ${cx + 16} 0 L ${cx + 34} ${H - 8} L ${cx - 34} ${H - 8} Z`} fill="url(#spot)" />
            <Path d={`M ${cx - 18} 1.5 L ${cx + 18} 1.5`} stroke={R.ana2} strokeWidth={3} strokeLinecap="round" />
          </>}
          {stil === 'hap' && menude && <Path d={`M ${cx - 22} 16 A 18 18 0 0 0 ${cx - 22} 52 L ${cx + 22} 52 A 18 18 0 0 0 ${cx + 22} 16 Z`} fill={saydam(R.ana, 0.3)} />}
        </Svg>
        {SEKMELER.map(([ik, ad], i) => {
          const on = i === sekme, gizle = centik && on;
          return (
            <Pressable key={ik} onPress={() => git(i)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={ad}
              style={{ position: 'absolute', left: cxs[i] - 26, top: 8, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', opacity: gizle ? 0 : 1, transform: [{ translateY: on && stil === 'kemer' ? -3 : 0 }] }}>
              <Ikon ad={ik} boy={i === 2 ? 26 : 22} renk={on ? secRenk : i === 2 ? R.ana2 : '#d2d2d7'} kalin={on ? 2.3 : 2} />
            </Pressable>
          );
        })}
        <View pointerEvents="none" style={{ position: 'absolute', left: W / 2 - 36, bottom: 7, width: 72, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' }} />
        {bildirim && sekme !== 4 && <View pointerEvents="none" style={{ position: 'absolute', left: cxs[4] + 4, top: 16, width: 10, height: 10, borderRadius: 5, backgroundColor: R.ana, borderWidth: 2, borderColor: '#2c2c30' }} />}
        {centik && menude && <Pressable onPress={() => git(sekme)} accessibilityLabel={SEKMELER[sekme][1]} style={{ position: 'absolute', left: cx - 27, top: -25, width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', shadowColor: R.ana, shadowOpacity: 0.55, shadowRadius: 13, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}>
          <Svg width={54} height={54} style={{ position: 'absolute' }}>
            <Defs><LinearGradient id="bub" x1="0" y1="0" x2="0.4" y2="1"><Stop offset="0" stopColor={R.ana2} /><Stop offset="1" stopColor={R.ana} /></LinearGradient></Defs>
            <Circle cx={27} cy={27} r={27} fill="url(#bub)" />
            <Circle cx={27} cy={27} r={26.5} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
          </Svg>
          <Ikon ad={SEKMELER[sekme][0]} boy={24} renk="#fff" kalin={2.2} />
        </Pressable>}
      </View>
    </View>
  );
}
