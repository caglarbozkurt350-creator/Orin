// Orvane Mobil · ortak bileşenler: simge, fotoğraf, halkalı avatar, durum noktası, açılır kart, başlık, düğme
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Calisan } from '@/lib/ekip';
import { DEP, GRAD } from '@/lib/ekipMeta';
import { R, saydam } from '@/lib/tema';
import { GORSEL } from '@/veri/gorseller';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

export const P: Record<string, string> = {
  ekip: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7M22 21v-1a6 6 0 0 0-4-5.6',
  gorev: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2',
  onay: 'M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2 8 12.7 4 8.8 9.5 8z',
  gun: 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 3v4M16 3v4M4 11h16',
  ayar: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
  ara: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5',
  geri: 'M15 5l-7 7 7 7',
  gonder: 'M12 19V5M6 11l6-6 6 6',
  ucak: 'M21 4L3 11l6 2 2 6 3-4 5 4z',
  kaydet: 'M5 4h11l3 3v13H5zM8 4v5h7M8 20v-6h8v6',
  mikrofon: 'M9 6a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v3',
  arti: 'M12 5v14M5 12h14',
  artiDaire: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v8M8 12h8',
  simsek: 'M13 2L4 14h7l-1 8 9-12h-7z',
  not: 'M5 4h10l4 4v12H5zM14 4v5h5',
  mesaj: 'M4 5h16v11H8l-4 4z',
  bilgi: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  kart: 'M4 6h16v14H4zM9 6V4h6v2M9 13h6M9 16h4',
  kapat: 'M6 6l12 12M18 6L6 18',
  tik: 'M5 12l5 5L20 7',
  cop: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  wifi: 'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.4M12 20h.01M19 12.5a10 10 0 0 0-3.2-2',
  beyin: 'M12 4a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 1 5 3 3 0 0 0 5 2 3 3 0 0 0 5-2 3 3 0 0 0 1-5 3 3 0 0 0-3-3 3 3 0 0 0-3-3zM12 4v16',
  yildiz: 'M12 3l2.2 5.6L20 9.5l-4.5 3.9L17 20l-5-3.2L7 20l1.5-6.6L4 9.5l5.8-.9z',
  kamera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  // alt menü
  ev: 'M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  kalp: 'M12 20.5s-7.5-4.4-9.2-9.1C1.6 8 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.8 1.3-1.7 2.9-2.8 4.9-2.8 3.5 0 5.5 3.5 4.3 6.9-1.7 4.7-9.2 9.1-9.2 9.1z',
  kisi: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8',
  zil: 'M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7zM10 20a2 2 0 0 0 4 0',
  asagi: 'M6 9l6 6 6-6',
  sag: 'M9 6l6 6-6 6',
  sol: 'M15 6l-6 6 6 6',
  izin: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  gorsel: 'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 17l-5-5-9 8',
  yenile: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  // 0.9.0
  kalem: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  pdf: 'M6 3h9l4 4v14H6zM14 3v5h5M12 11v6M9.5 14.5L12 17l2.5-2.5',
  damla: 'M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z',
  oyun: 'M7 9h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.4 1.8L14.5 14h-5l-1.1 1.8A3 3 0 0 1 3 14v-1a4 4 0 0 1 4-4zM8 11v3M6.5 12.5h3M15.5 12h.01M17.5 13.5h.01',
  ilac: 'M10.5 20.5a5 5 0 0 1-7-7l6-6a5 5 0 0 1 7 7zM7 10l7 7',
  alarm: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2M4 4l3-2M20 4l-3-2',
  link: 'M14 4h6v6M20 4l-9 9M18 14v5H5V6h5',
  grafik: 'M4 20V4M4 20h16M7 15l4-4 3 3 5-6',
  sessiz: 'M6 9a6 6 0 0 1 9.4-4.9M18 11c.2 4 2 5 2 5H8M10 20a2 2 0 0 0 4 0M3 3l18 18',
  // 0.9.14
  uyari: 'M12 4l9 16H3zM12 10v4M12 17v.01',
  altin: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v5c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 10v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5M4 15v4c0 1.7 3.6 3 8 3s8-1.3 8-3v-4',
  goz: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  adim: 'M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0zM20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0zM16 17h4M4 13h4',
};
export function Ikon({ ad, boy = 22, renk = R.yazi2, kalin = 1.8 }: { ad: string; boy?: number; renk?: string; kalin?: number }) {
  return (
    <Svg width={boy} height={boy} viewBox="0 0 24 24" fill="none" stroke={renk} strokeWidth={kalin} strokeLinecap="round" strokeLinejoin="round">
      <Path d={P[ad] || P.bilgi} />
    </Svg>
  );
}

export const NOKTA = { ok: R.yesil, bz: R.turuncu, id: R.bosta } as const;
/** Durum noktası. Hazır (yeşil) ve görevde (turuncu) olanın etrafında halka şeklinde atım var. */
export function Nokta({ d, boy = 8, atim = true, kenar }: { d: 'ok' | 'bz' | 'id'; boy?: number; atim?: boolean; kenar?: string }) {
  const a = useRef(new Animated.Value(0)).current, canli = atim && d !== 'id';
  useEffect(() => {
    if (!canli) return;
    const l = Animated.loop(Animated.timing(a, { toValue: 1, duration: d === 'bz' ? 1100 : 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    l.start();
    return () => l.stop();
  }, [canli, d, a]);
  const renk = NOKTA[d];
  return (
    <View style={{ width: boy, height: boy }}>
      <View style={{ width: boy, height: boy, borderRadius: boy / 2, backgroundColor: renk, borderWidth: kenar ? 2.5 : 0, borderColor: kenar }} />
      {canli && <Animated.View pointerEvents="none" style={{ position: 'absolute', left: -2, top: -2, right: -2, bottom: -2, borderRadius: boy, borderWidth: 2, borderColor: renk, opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.95, 0] }), transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.7, 2.1] }) }] }} />}
    </View>
  );
}

export function Foto({ c, boy, halka = true }: { c?: Calisan; boy: number; halka?: boolean }) {
  if (!c) return null;
  const src = c.foto ? GORSEL[c.foto.replace('assets/calisanlar/', '')] : undefined;
  const st = { width: boy, height: boy, borderRadius: boy / 2, borderWidth: halka ? 2 : 0, borderColor: saydam(c.renk, 0.45) };
  if (src) return <Image source={src} style={[st, { backgroundColor: R.kart2 }]} contentFit="cover" contentPosition={{ top: '18%', left: '50%' }} />;
  return (
    <View style={[st, { backgroundColor: c.renk, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: boy * 0.42 }}>{c.ad[0]}</Text>
    </View>
  );
}

/** Departman renginde degradeli halka (react-native-svg) */
export function DegHalka({ boy, renkler, kalin = 3 }: { boy: number; renkler: [string, string]; kalin?: number }) {
  const id = 'g' + renkler[0].slice(1) + renkler[1].slice(1), r = (boy - kalin) / 2;
  return (
    <Svg width={boy} height={boy} style={{ position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
      <Defs><LinearGradient id={id} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={renkler[0]} /><Stop offset="1" stopColor={renkler[1]} /></LinearGradient></Defs>
      <Circle cx={boy / 2} cy={boy / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={kalin} />
    </Svg>
  );
}
export function halkaRenkleri(id: string): [string, string] {
  const g = GRAD[DEP[id] || ''] || 'tema';
  return g === 'tema' ? [R.ana2, R.ana] : g;
}
/** Halkalı çalışan avatarı: fotoğraf + departman halkası + isteğe bağlı durum noktası */
export function Avatar({ c, boy, durum, sec }: { c?: Calisan; boy: number; durum?: 'ok' | 'bz' | 'id'; sec?: boolean }) {
  if (!c) return null;
  const ic = boy - 8, nb = Math.max(11, Math.round(boy * 0.27));
  return (
    <View style={{ width: boy, height: boy, alignItems: 'center', justifyContent: 'center' }}>
      <DegHalka boy={boy} renkler={halkaRenkleri(c.id)} />
      {sec && <View pointerEvents="none" style={{ position: 'absolute', left: -5, top: -5, right: -5, bottom: -5, borderRadius: boy, borderWidth: 2, borderColor: R.ana }} />}
      <Foto c={c} boy={ic} halka={false} />
      {durum && <View style={{ position: 'absolute', right: -1, bottom: -1 }}><Nokta d={durum} boy={nb} kenar={R.panel} /></View>}
    </View>
  );
}

/** ORVANE simgesi: tema rengi degradeli kutucuk + beyaz "O" halkası + halkanın çevresinde dönen küçük nokta */
export function Logo({ boy = 32 }: { boy?: number }) {
  const d = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.timing(d, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }));
    l.start();
    return () => l.stop();
  }, [d]);
  const k = boy / 100;
  return (
    <View style={{ width: boy, height: boy }}>
      <Svg width={boy} height={boy} viewBox="0 0 100 100">
        <Defs><LinearGradient id="logoG" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={R.ana2} /><Stop offset="1" stopColor={R.ana} /></LinearGradient></Defs>
        <Rect x="4" y="4" width="92" height="92" rx="26" fill="url(#logoG)" />
        <Path d="M 14 40 Q 14 14 40 14 H 60 Q 86 14 86 40 V 44 Q 50 34 14 50 Z" fill="#fff" opacity={0.18} />
        <Circle cx="50" cy="52" r="21" fill="none" stroke="#fff" strokeWidth="9" />
      </Svg>
      <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 52 * k - boy / 2, width: boy, height: boy, transform: [{ rotate: d.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
        <View style={{ position: 'absolute', left: boy / 2 + 32 * k - 5.5 * k, top: boy / 2 - 5.5 * k, width: 11 * k, height: 11 * k, borderRadius: 6 * k, backgroundColor: '#fff' }} />
      </Animated.View>
    </View>
  );
}

export function Kart({ c }: { c: Calisan }) {
  const src = c.kart ? GORSEL[c.kart.replace('assets/calisanlar/', '')] : undefined;
  if (src) return <Image source={src} style={{ width: '100%', aspectRatio: 800 / 1440, borderRadius: 14 }} contentFit="cover" />;
  return (
    <View style={{ width: '100%', aspectRatio: 800 / 1440, borderRadius: 14, backgroundColor: saydam(c.renk, 0.25), alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Foto c={c} boy={64} />
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>{c.ad}</Text>
      <Text style={{ color: R.soluk, fontSize: 12 }}>Kart görseli yok</Text>
    </View>
  );
}

// ---------- Açılır-kapanır kart (başlığa dokununca küçülür; kapalıyken başlıkta kısa özet) ----------
const KAPALI: Record<string, boolean> = {}; // tema değişince ekran yeniden kurulsa da açık/kapalı durumu korunur
/** kapali: ilk açılışta daraltılmış başlar (kullanıcı açarsa uygulama açık kaldıkça öyle kalır) */
export function KartK({ ad, baslik, ozet, acikOzet, children, sag, duz, kapali }: { ad: string; baslik: string; ozet?: string; acikOzet?: string; children: ReactNode; sag?: ReactNode; duz?: boolean; kapali?: boolean }) {
  const [kap, setKap] = useState(KAPALI[ad] ?? !!kapali);
  const degis = () => { LayoutAnimation.configureNext(LayoutAnimation.create(260, 'easeInEaseOut', 'opacity')); KAPALI[ad] = !kap; setKap(!kap); };
  return (
    <View style={duz ? undefined : s.cam}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable onPress={degis} accessibilityRole="button" accessibilityState={{ expanded: !kap }} accessibilityLabel={baslik + (kap && ozet ? ', ' + ozet : '')} style={({ pressed }) => [s.kartBas, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
          <Text style={s.ct}>{baslik}</Text>
          {(kap ? ozet : acikOzet) ? <Text numberOfLines={1} style={s.cmeta}>{kap ? ozet : acikOzet}</Text> : null}
        </Pressable>
        {sag}
      </View>
      {!kap && <View style={{ gap: 12, marginTop: 12 }}>{children}</View>}
    </View>
  );
}

export function Ekran({ children, baslik, sag, geri }: { children: ReactNode; baslik?: ReactNode; sag?: ReactNode; geri?: boolean }) {
  const ust = useSafeAreaInsets().top;
  return (
    <View style={{ flex: 1, backgroundColor: R.zemin }}>
      {baslik !== undefined && (
        <View style={[s.ust, { paddingTop: ust + 8 }]}>
          {geri ? <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={s.ikDug} accessibilityLabel="Geri"><Ikon ad="geri" /></Pressable> : <View style={{ width: 44 }} />}
          <View style={{ flex: 1, alignItems: 'center' }}>{typeof baslik === 'string' ? <Text style={s.marka}>{baslik}</Text> : baslik}</View>
          <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{sag}</View>
        </View>
      )}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

export function Dugme({ yazi, onPress, tur = 'ana', stil, ikon, kapali }: { yazi: string; onPress: () => void; tur?: 'ana' | 'ikinci' | 'tehlike'; stil?: ViewStyle; ikon?: string; kapali?: boolean }) {
  const bg = tur === 'ana' ? R.ana : tur === 'tehlike' ? '#4a1f1f' : 'transparent';
  return (
    <Pressable onPress={onPress} disabled={kapali} accessibilityRole="button" style={({ pressed }) => [s.dug, { backgroundColor: bg, opacity: kapali ? 0.5 : 1, transform: [{ scale: pressed ? 0.95 : 1 }], borderWidth: tur === 'ana' ? 0 : 1, borderColor: tur === 'tehlike' ? 'rgba(244,163,163,0.3)' : 'rgba(255,255,255,0.22)' }, stil]}>
      {ikon && <Ikon ad={ikon} boy={18} renk="#fff" />}
      <Text style={[s.dugY, tur === 'tehlike' && { color: '#f4a3a3' }]}>{yazi}</Text>
    </Pressable>
  );
}

export function Rozet({ yazi, renk = R.soluk }: { yazi: string; renk?: string }) {
  return <View style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: saydam(renk, 0.45), borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}><Text style={{ color: renk, fontSize: 11.5 }}>{yazi}</Text></View>;
}
/** Dolgulu hap (tasarım .pill): g yeşil, o turuncu, n nötr, r tema rengi */
export function Hap({ yazi, t = 'n' }: { yazi: string; t?: 'g' | 'o' | 'n' | 'r' }) {
  const m = { g: ['rgba(62,207,90,0.16)', '#6be585'], o: ['rgba(245,165,36,0.16)', '#f7bd55'], n: ['rgba(255,255,255,0.08)', '#c4c4c9'], r: [saydam(R.ana, 0.16), R.ana2] }[t];
  return <View style={{ height: 24, paddingHorizontal: 9, borderRadius: 12, backgroundColor: m[0], alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Text style={{ color: m[1], fontSize: 11.5, fontWeight: '600' }}>{yazi}</Text></View>;
}
/** Sayfa başlığı: üstte küçük altyazı, altında büyük başlık */
export function SayfaBasligi({ ust, baslik, sag }: { ust: string; baslik: string; sag?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 4, paddingTop: 4 }}>
      <View style={{ gap: 4, flex: 1 }}><Text style={s.sub}>{ust}</Text><Text style={{ color: R.yazi, fontSize: 26, lineHeight: 32, fontWeight: '600' }}>{baslik}</Text></View>
      {sag}
    </View>
  );
}
/** Parçalı seçici (hap grubu): Görevler / Onaylar / Görseller gibi */
export function Bolumler<T extends string>({ secenek, deger, sec }: { secenek: [T, string][]; deger: T; sec: (v: T) => void }) {
  return (
    <View style={s.seg} accessibilityRole="tablist">
      {secenek.map(([v, y]) => (
        <Pressable key={v} onPress={() => sec(v)} accessibilityRole="tab" accessibilityState={{ selected: v === deger }} style={[s.segb, v === deger && { backgroundColor: R.ana }]}>
          <Text style={{ color: v === deger ? '#fff' : '#cfcfd4', fontSize: 14, fontWeight: '600' }}>{y}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export const s = StyleSheet.create({
  ust: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8 },
  marka: { color: R.yazi, fontSize: 17, fontWeight: '700', letterSpacing: 17 * 0.32, paddingLeft: 17 * 0.32 },
  ikDug: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  dug: { minHeight: 44, borderRadius: 22, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dugY: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cam: { backgroundColor: R.cam, borderWidth: 1, borderColor: R.camKenar, borderRadius: 22, padding: 16 },
  kart: { backgroundColor: R.cam, borderWidth: 1, borderColor: R.camKenar, borderRadius: 18, padding: 14 },
  satir: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)' },
  kartBas: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 44 },
  ct: { color: '#8e8e95', fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.8 },
  cmeta: { color: R.yazi2, fontSize: 12, lineHeight: 16, flexShrink: 1 },
  sub: { color: R.yazi2, fontSize: 12, lineHeight: 16 },
  bolum: { color: '#8e8e95', fontSize: 11, fontWeight: '700', letterSpacing: 1.6, paddingHorizontal: 8, paddingTop: 14, paddingBottom: 6 },
  baslik: { color: R.yazi, fontSize: 24, fontWeight: '700' },
  soluk: { color: R.soluk, fontSize: 13, lineHeight: 19 },
  giris: { backgroundColor: R.kart2, borderWidth: 1, borderColor: R.cizgi, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9 },
  girisEt: { color: R.soluk, fontSize: 11.5 },
  girisY: { color: '#fff', fontSize: 15, paddingVertical: 2 },
  seg: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 24, backgroundColor: R.cam, borderWidth: 1, borderColor: R.camKenar },
  segb: { flex: 1, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
