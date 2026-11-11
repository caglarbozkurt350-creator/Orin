import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ikon } from '@/bilesen/ortak';
import { apkIndir, useGuncelleme, yenidenBaslat } from '@/lib/guncelle';
import { esitle } from '@/lib/senk';
import { R } from '@/lib/tema';

const tema = { ...DarkTheme, colors: { ...DarkTheme.colors, background: R.zemin, card: R.zemin, primary: R.ana, text: R.yazi, border: R.cizgi } };

/** Güncelleme hazırsa ekranın üstünde küçük bir şerit: "Yeniden başlat" ya da "Yeni sürümü indir" */
function GuncellemeSeridi() {
  const g = useGuncelleme(), ust = useSafeAreaInsets().top, [gizle, setGizle] = useState('');
  const apk = g.apk && gizle !== 'apk-' + g.apk.runtime ? g.apk : null, ota = g.bekliyor && gizle !== 'ota';
  if (!apk && !ota) return null;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: ust + 6, left: 12, right: 12, zIndex: 50 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#24324d', borderWidth: 1, borderColor: 'rgba(47,123,245,0.5)', borderRadius: 16, paddingVertical: 8, paddingLeft: 12, paddingRight: 6, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}>
        <Ikon ad={apk ? 'gonder' : 'yildiz'} boy={18} renk={R.bilgi} />
        <Text style={{ flex: 1, color: '#e4ecff', fontSize: 13.5 }}>{apk ? 'Yeni Orvane sürümü (' + apk.surum + ') var' + (apk.not ? ' · ' + apk.not : '') : 'Güncelleme indirildi'}</Text>
        <Pressable onPress={() => (apk ? apkIndir(apk) : yenidenBaslat())} accessibilityRole="button" style={{ backgroundColor: R.ana, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{apk ? 'İndir' : 'Yeniden başlat'}</Text>
        </Pressable>
        <Pressable onPress={() => setGizle(apk ? 'apk-' + apk.runtime : 'ota')} accessibilityLabel="Sonra" hitSlop={8} style={{ padding: 6 }}><Ikon ad="kapat" boy={16} renk={R.soluk} /></Pressable>
      </View>
    </View>
  );
}

export default function KokDuzen() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(R.zemin).catch(() => {});
    esitle();
    const t = setInterval(esitle, 20000); // 20 sn'de bir masaüstüyle eşitle (mesaj gönderince 3 sn'de bir)
    return () => clearInterval(t);
  }, []);
  return (
    <ThemeProvider value={tema}>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: R.zemin }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: R.zemin }, animation: 'fade' }} />
        <GuncellemeSeridi />
      </View>
    </ThemeProvider>
  );
}
