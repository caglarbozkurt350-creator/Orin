// Orvane Mobil · ortak bileşenler: simge, fotoğraf, durum noktası, alt menü, başlık, düğme
import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Calisan } from '@/lib/ekip';
import { R, saydam } from '@/lib/tema';
import { GORSEL } from '@/veri/gorseller';

const P: Record<string, string> = {
  ekip: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7M22 21v-1a6 6 0 0 0-4-5.6',
  gorev: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2',
  onay: 'M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2 8 12.7 4 8.8 9.5 8z',
  gun: 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 3v4M16 3v4M4 11h16',
  ayar: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
  ara: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5',
  geri: 'M15 5l-7 7 7 7',
  gonder: 'M12 19V5M6 11l6-6 6 6',
  kaydet: 'M5 4h11l3 3v13H5zM8 4v5h7M8 20v-6h8v6',
  mikrofon: 'M9 6a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v3',
  arti: 'M12 5v14M5 12h14',
  simsek: 'M13 2L4 14h7l-1 8 9-12h-7z',
  not: 'M5 4h10l4 4v12H5zM14 4v5h5',
  bilgi: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  kart: 'M4 6h16v14H4zM9 6V4h6v2M9 13h6M9 16h4',
  kapat: 'M6 6l12 12M18 6L6 18',
  tik: 'M5 12l5 5L20 7',
  cop: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  wifi: 'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.4M12 20h.01M19 12.5a10 10 0 0 0-3.2-2',
  beyin: 'M12 4a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 1 5 3 3 0 0 0 5 2 3 3 0 0 0 5-2 3 3 0 0 0 1-5 3 3 0 0 0-3-3 3 3 0 0 0-3-3zM12 4v16',
  yildiz: 'M12 3l2.2 5.6L20 9.5l-4.5 3.9L17 20l-5-3.2L7 20l1.5-6.6L4 9.5l5.8-.9z',
  kamera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};
export function Ikon({ ad, boy = 22, renk = R.yazi2, kalin = 1.8 }: { ad: string; boy?: number; renk?: string; kalin?: number }) {
  return (
    <Svg width={boy} height={boy} viewBox="0 0 24 24" fill="none" stroke={renk} strokeWidth={kalin} strokeLinecap="round" strokeLinejoin="round">
      <Path d={P[ad] || P.bilgi} />
    </Svg>
  );
}

export const NOKTA = { ok: R.yesil, bz: R.turuncu, id: R.bosta } as const;
export function Nokta({ d, boy = 8 }: { d: 'ok' | 'bz' | 'id'; boy?: number }) {
  return <View style={{ width: boy, height: boy, borderRadius: boy / 2, backgroundColor: NOKTA[d] }} />;
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

const SEKME: [string, string, string][] = [['/', 'Ekip', 'ekip'], ['/gorevler', 'Görevler', 'gorev'], ['/onaylar', 'Onaylar', 'onay'], ['/gun', 'İş günü', 'gun'], ['/ayarlar', 'Ayarlar', 'ayar']];
export function AltMenu({ rozet }: { rozet?: Record<string, number> }) {
  const yol = usePathname(), alt = useSafeAreaInsets().bottom;
  return (
    <View style={[s.alt, { paddingBottom: Math.max(alt, 10) }]} accessibilityRole="tablist">
      {SEKME.map(([h, ad, ik]) => {
        const on = yol === h;
        return (
          <Pressable key={h} onPress={() => router.replace(h as any)} style={s.sekme} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={ad}>
            <View style={[s.sekmeIk, on && { backgroundColor: saydam(R.ana, 0.2) }]}>
              <Ikon ad={ik} renk={on ? '#fff' : R.soluk} />
              {!!rozet?.[h] && <View style={s.rozet}><Text style={s.rozetY}>{rozet[h]}</Text></View>}
            </View>
            <Text style={[s.sekmeY, { color: on ? '#fff' : R.soluk }]}>{ad}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Ekran({ children, baslik, sag, geri, altMenu, rozet }: { children: ReactNode; baslik?: ReactNode; sag?: ReactNode; geri?: boolean; altMenu?: boolean; rozet?: Record<string, number> }) {
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
      {altMenu && <AltMenu rozet={rozet} />}
    </View>
  );
}

export function Dugme({ yazi, onPress, tur = 'ana', stil, ikon, kapali }: { yazi: string; onPress: () => void; tur?: 'ana' | 'ikinci' | 'tehlike'; stil?: ViewStyle; ikon?: string; kapali?: boolean }) {
  const bg = tur === 'ana' ? R.ana : tur === 'tehlike' ? '#4a1f1f' : R.giris;
  return (
    <Pressable onPress={onPress} disabled={kapali} accessibilityRole="button" style={({ pressed }) => [s.dug, { backgroundColor: bg, opacity: kapali ? 0.5 : pressed ? 0.85 : 1, borderWidth: tur === 'ana' ? 0 : 1 }, stil]}>
      {ikon && <Ikon ad={ikon} boy={18} renk="#fff" />}
      <Text style={[s.dugY, tur === 'tehlike' && { color: '#f4a3a3' }]}>{yazi}</Text>
    </Pressable>
  );
}

export function Rozet({ yazi, renk = R.soluk }: { yazi: string; renk?: string }) {
  return <View style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: saydam(renk, 0.45), borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}><Text style={{ color: renk, fontSize: 11.5 }}>{yazi}</Text></View>;
}

export const s = StyleSheet.create({
  ust: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8 },
  marka: { color: R.yazi, fontSize: 17, fontWeight: '600', letterSpacing: 17 * 0.32, paddingLeft: 17 * 0.32 },
  ikDug: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  alt: { flexDirection: 'row', paddingTop: 8, paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: R.cizgi, backgroundColor: '#1d1d20' },
  sekme: { flex: 1, alignItems: 'center', gap: 4, minHeight: 48 },
  sekmeIk: { width: 52, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  sekmeY: { fontSize: 11, fontWeight: '600' },
  rozet: { position: 'absolute', top: -2, right: 6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: R.turuncu, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  rozetY: { color: '#1b1b1d', fontSize: 10.5, fontWeight: '700' },
  dug: { minHeight: 46, borderRadius: 999, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderColor: 'rgba(255,255,255,0.12)' },
  dugY: { color: '#fff', fontSize: 14.5, fontWeight: '600' },
  kart: { backgroundColor: '#222225', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 14 },
  bolum: { color: '#8e8e96', fontSize: 12.5, fontWeight: '600', paddingHorizontal: 10, paddingTop: 12, paddingBottom: 4 },
  baslik: { color: R.yazi, fontSize: 24, fontWeight: '700' },
  soluk: { color: R.soluk, fontSize: 13, lineHeight: 19 },
  giris: { backgroundColor: R.kart2, borderWidth: 1, borderColor: R.cizgi, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9 },
  girisEt: { color: R.soluk, fontSize: 11.5 },
  girisY: { color: '#fff', fontSize: 15, paddingVertical: 2 },
});
