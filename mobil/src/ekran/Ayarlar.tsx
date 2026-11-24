// Ayarlar (0.9.0 · üstteki “Ç” profil düğmesi): alt çubuk stili, tema, sekme geçişi, açılış ekranı,
// masaüstüyle eşitleme, uygulama güncellemesi ve sürüm. Önceki Merkez sekmesinin ayar ve eşitleme bölümleri buraya taşındı.
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Animated, Pressable, Switch, Text, TextInput, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Dugme, Hap, Ikon, KartK, SayfaBasligi, s } from '@/bilesen/ortak';
import { guncelle, useDurum } from '@/lib/depo';
import { gecisOnizle } from '@/lib/gezinti';
import { guncellemeDenetle, yenidenBaslat } from '@/lib/guncelle';
import { useEkip } from '@/lib/kullan';
import { cikis, esitle, girisYap, hataMetni, kayitOl, oturum, VARSAYILAN } from '@/lib/senk';
import { acilisSec, CUBUKLAR, CubukAnahtari, cubukSec, GECISLER, gecisSec, R, saydam, TEMALAR, temaSec, useGorunumAyari } from '@/lib/tema';
import { SURUM } from '@/veri/surum';

/** Alt çubuk stilinin küçük çizimi (Ayarlar kartı) */
const ORNEK: Record<CubukAnahtari, string> = {
  centik: 'M0 8 H44 C50 8 50 22 60 22 C70 22 70 8 76 8 H120 V26 H0 Z',
  kemer: 'M0 10 H44 Q60 22 76 10 H120',
  spot: 'M44 2 H76 L92 26 H28 Z',
  hap: 'M40 13 a9 9 0 0 1 9 -9 H71 a9 9 0 0 1 0 18 H49 a9 9 0 0 1 -9 -9 Z',
};
function CubukSecimi() {
  const g = useGorunumAyari();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {(Object.keys(CUBUKLAR) as CubukAnahtari[]).map((k) => {
        const on = k === g.cubuk, [ad, acik] = CUBUKLAR[k];
        return (
          <Pressable key={k} onPress={() => cubukSec(k)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={ad + ' alt çubuk, ' + acik}
            style={({ pressed }) => ({ width: '48.5%', gap: 6, padding: 12, borderRadius: 16, borderWidth: 1.5, borderColor: on ? R.ana : 'rgba(255,255,255,0.1)', backgroundColor: on ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
            <Svg width="100%" height={26} viewBox="0 0 120 26" preserveAspectRatio="none">
              <Path d={ORNEK[k]} fill={k === 'kemer' ? 'none' : k === 'spot' ? saydam(R.ana, 0.2) : k === 'hap' ? saydam(R.ana, 0.33) : 'rgba(255,255,255,0.08)'} stroke={k === 'kemer' ? R.ana : k === 'centik' ? 'rgba(255,255,255,0.2)' : 'none'} strokeWidth={1.6} />
            </Svg>
            <Text style={{ color: R.yazi, fontSize: 14, fontWeight: '700' }}>{ad}</Text>
            <Text style={[s.sub, { fontSize: 11.5 }]}>{acik}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function AyarlarSayfasi() {
  const g = useGorunumAyari(), { o } = useEkip(), senk = useDurum((d) => d.senk);
  return (
    <View style={{ gap: 14 }}>
      <SayfaBasligi ust="Profil · görünüm · eşitleme" baslik="Ayarlar" />
      <KartK ad="cubuk" baslik="ALT ÇUBUK" ozet={CUBUKLAR[g.cubuk][0]}>
        <CubukSecimi />
        <Text style={[s.sub, { fontSize: 11.5 }]}>Seçim hemen uygulanır; yalnız bu telefonda saklanır.</Text>
      </KartK>
      <KartK ad="ayar" baslik="TEMA VE GEÇİŞ" ozet={TEMALAR[g.tema].ad + ' · ' + GECISLER[g.gecis]}>
        <Text style={s.sub}>Tema rengi · görünüm aynı kalır</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {(Object.keys(TEMALAR) as (keyof typeof TEMALAR)[]).map((k) => {
            const t = TEMALAR[k], on = k === g.tema;
            return (
              <Pressable key={k} onPress={() => temaSec(k)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={t.ad + ' teması'}
                style={{ flex: 1, minHeight: 64, paddingVertical: 8, borderRadius: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: on ? t.acc : 'rgba(255,255,255,0.1)', backgroundColor: on ? saydam(t.acc, 0.12) : 'rgba(255,255,255,0.04)' }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                  <Svg width={30} height={30} style={{ position: 'absolute' }}><Defs><LinearGradient id={'t' + k} x1="0" y1="0" x2="0.4" y2="1"><Stop offset="0" stopColor={t.acc2} /><Stop offset="1" stopColor={t.acc} /></LinearGradient></Defs><Rect width={30} height={30} fill={`url(#t${k})`} /></Svg>
                  {on && <Ikon ad="tik" boy={16} renk="#fff" kalin={3.2} />}
                </View>
                <Text style={{ color: R.yazi, fontSize: 10.5 }}>{t.ad}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[s.sub, { paddingTop: 4 }]}>Sekmeler arası geçiş</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {(Object.keys(GECISLER) as (keyof typeof GECISLER)[]).map((k) => {
            const on = k === g.gecis;
            return (
              <Pressable key={k} onPress={() => { gecisSec(k); gecisOnizle(); }} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={GECISLER[k] + ' geçişi'}
                style={{ flex: 1, minHeight: 64, paddingVertical: 8, borderRadius: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: on ? R.ana : 'rgba(255,255,255,0.1)', backgroundColor: on ? saydam(R.ana, 0.12) : 'rgba(255,255,255,0.04)' }}>
                <MiniGecis k={k} />
                <Text style={{ color: R.yazi, fontSize: 10.5 }}>{GECISLER[k]}</Text>
              </Pressable>
            );
          })}
        </View>
        <Dugme yazi="Önizle" tur="ikinci" ikon="yenile" onPress={gecisOnizle} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }}>
          <View style={{ flex: 1 }}><Text style={{ color: R.yazi, fontSize: 14.5 }}>Açılış ekranı</Text><Text style={s.sub}>Uygulama açılırken ORVANE animasyonu</Text></View>
          <Switch value={g.acilis} onValueChange={acilisSec} trackColor={{ false: '#4a4a50', true: saydam(R.ana, 0.6) }} thumbColor={g.acilis ? R.ana : '#c9c9cf'} accessibilityLabel="Açılış ekranı" />
        </View>
        <Text style={[s.sub, { fontSize: 11.5 }]}>Tema ve geçiş yalnız bu telefonda saklanır; masaüstüyle eşitlenmez.</Text>
      </KartK>
      <KartK ad="esit" baslik="EŞİTLEME VE GÜNCELLEMELER" ozet={senk.hata ? 'Bağlantı yok' : senk.son ? 'Eşitlendi' : o.ts ? 'Bağlı' : 'Giriş gerekli'}>
        <Esitleme />
      </KartK>
      <Text style={[s.soluk, { textAlign: 'center', marginTop: 4 }]}>ORVANE · sürüm {SURUM} · masaüstüyle aynı sürüm</Text>
    </View>
  );
}

/** Geçiş seçeneğinin küçük önizlemesi: üç çubuk, seçeneğe göre farklı giriş */
function MiniGecis({ k }: { k: keyof typeof GECISLER }) {
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: true }), Animated.delay(900), Animated.timing(a, { toValue: 0, duration: 400, useNativeDriver: true }), Animated.delay(300)]));
    l.start();
    return () => l.stop();
  }, [a]);
  const st = k === 'yok' ? {} : { opacity: a, transform: k === 'kaydir' ? [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] : k === 'yakinlas' ? [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] : k === 'akiskan' ? [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] : [] };
  return (
    <Animated.View style={[{ flexDirection: 'row', alignItems: 'flex-end', height: 24, gap: 3 }, st]}>
      {[13, 22, 17].map((h, i) => <View key={i} style={{ width: 8, height: h, borderRadius: 3, backgroundColor: i % 2 ? R.ana : R.ana2 }} />)}
    </Animated.View>
  );
}

function Esitleme() {
  const d = useDurum((x) => x), { o } = useEkip();
  const [url, setUrl] = useState(d.ayar.url), [anahtar, setAnahtar] = useState(d.ayar.anahtar);
  const [eposta, setEposta] = useState(''), [sifre, setSifre] = useState(''), [kim, setKim] = useState<string | null>(null), [mesaj, setMesaj] = useState(''), [bekle, setBekle] = useState(false), [guncel, setGuncel] = useState(false);
  const yenile = () => oturum().then((x) => setKim(x?.user?.email || null)).catch(() => setKim(null));
  useEffect(() => { yenile(); }, [d.ayar]);
  const varsayilan = !!VARSAYILAN.url;
  const adresKaydet = () => { guncelle((x) => ({ ...x, ayar: { url: url.trim(), anahtar: anahtar.trim() } })); setMesaj('Bağlantı adresi kaydedildi'); };
  const calis = async (f: () => Promise<any>, ok: string) => { setBekle(true); setMesaj(''); try { await f(); setMesaj(ok); await yenile(); } catch (e) { setMesaj(hataMetni(e)); } finally { setBekle(false); } };
  const bekleyen = d.olaylar.filter((e) => !e.gitti).length;
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flex: 1, gap: 2 }}><Text style={{ color: R.yazi, fontSize: 14, fontWeight: '600' }}>Masaüstüyle eşitleme</Text><Text style={s.sub}>Ana veri kaynağı · Supabase</Text></View>
          <Hap yazi={kim && !d.senk.hata ? 'Bağlı' : d.senk.hata ? 'Sorun var' : 'Bağlı değil'} t={kim && !d.senk.hata ? 'g' : d.senk.hata ? 'o' : 'n'} />
        </View>
        <Text style={s.soluk}>{kim ? 'Giriş: ' + kim : 'Giriş yapılmadı'}{d.senk.son ? ' · son eşitleme ' + new Date(d.senk.son).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}{bekleyen ? ' · ' + bekleyen + ' işlem gönderilecek' : ''}{o.ts ? ' · masaüstü verisi ' + new Date(o.ts).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</Text>
        {!!d.senk.hata && <Text style={{ color: '#f1c88a', fontSize: 13 }}>{d.senk.hata}</Text>}
        {kim && <View style={{ flexDirection: 'row', gap: 8 }}><Dugme yazi={d.senk.calisiyor ? 'Eşitleniyor…' : 'Şimdi eşitle'} onPress={() => esitle()} stil={{ flex: 1 }} kapali={!!d.senk.calisiyor} /><Dugme yazi="Çıkış" tur="ikinci" onPress={() => calis(cikis, 'Çıkış yapıldı')} /></View>}
      </View>
      {!varsayilan && (
        <View style={{ gap: 8 }}>
          <Text style={{ color: R.yazi, fontSize: 14, fontWeight: '600' }}>Bağlantı adresi</Text>
          <Text style={s.soluk}>Supabase proje adresi ve “publishable” anahtarı. Masaüstü Orvane’da da aynısı kullanılır.</Text>
          <View style={s.giris}><Text style={s.girisEt}>Proje adresi</Text><TextInput value={url} onChangeText={setUrl} placeholder="https://xxxx.supabase.co" placeholderTextColor={R.solukk} autoCapitalize="none" style={s.girisY} /></View>
          <View style={s.giris}><Text style={s.girisEt}>Publishable anahtar</Text><TextInput value={anahtar} onChangeText={setAnahtar} placeholder="sb_publishable_…" placeholderTextColor={R.solukk} autoCapitalize="none" style={s.girisY} /></View>
          <Dugme yazi="Kaydet" tur="ikinci" onPress={adresKaydet} />
        </View>
      )}
      {!kim && (
        <View style={{ gap: 8 }}>
          <Text style={{ color: R.yazi, fontSize: 14, fontWeight: '600' }}>Giriş</Text>
          <Text style={s.soluk}>Masaüstü Orvane’da kullandığın e-posta ile gir. İlk kez kullanıyorsan “Hesap aç”a dokun; gelen onay e-postasındaki bağlantıya dokunduktan sonra giriş yap.</Text>
          <View style={s.giris}><Text style={s.girisEt}>E-posta</Text><TextInput value={eposta} onChangeText={setEposta} keyboardType="email-address" autoCapitalize="none" autoComplete="email" style={s.girisY} /></View>
          <View style={s.giris}><Text style={s.girisEt}>Şifre</Text><TextInput value={sifre} onChangeText={setSifre} secureTextEntry autoComplete="password" style={s.girisY} /></View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Dugme yazi="Giriş yap" onPress={() => calis(() => girisYap(eposta, sifre), 'Giriş yapıldı')} stil={{ flex: 1 }} kapali={bekle || !eposta || !sifre} />
            <Dugme yazi="Hesap aç" tur="ikinci" onPress={() => calis(async () => { const hemen = await kayitOl(eposta, sifre); if (!hemen) throw new Error('Onay e-postası gönderildi. Bağlantıya dokunup sonra giriş yap.'); }, 'Hesap açıldı')} kapali={bekle || !eposta || !sifre} />
          </View>
        </View>
      )}
      {!!mesaj && <Text style={{ color: R.bilgi, fontSize: 13 }}>{mesaj}</Text>}
      <View style={{ gap: 8 }}>
        <Text style={{ color: R.yazi, fontSize: 14, fontWeight: '600' }}>Uygulama güncellemesi</Text>
        <Text style={s.soluk}>Düzeltmeler APK kurmadan gelir: uygulama açılınca ve öne gelince denetlenir. {Updates.isEmbeddedLaunch ? 'Şu an APK ile gelen ilk sürüm çalışıyor.' : Updates.createdAt ? 'Çalışan güncelleme: ' + Updates.createdAt.toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '.' : ''}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Dugme yazi="Güncellemeleri denetle" tur="ikinci" stil={{ flex: 1 }} onPress={() => calis(async () => { const r = await guncellemeDenetle(true); if (r === 'indirildi') { setGuncel(true); return; } throw new Error(r === 'gelistirme' ? 'Geliştirme sürümünde güncelleme denetlenmez' : r === 'hata' ? 'Güncelleme sunucusuna ulaşılamadı' : 'Uygulama güncel'); }, 'Güncelleme indirildi')} />
          {guncel && <Dugme yazi="Yeniden başlat" onPress={() => yenidenBaslat()} />}
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <Text style={{ color: R.yazi, fontSize: 14, fontWeight: '600' }}>Yapay zekâ</Text>
        <Text style={s.soluk}>{o.zeka?.bagli ? 'Claude bağlı · bu ay $' + o.zeka.usd.toFixed(3).replace('.', ',') + ' / $' + o.zeka.butce + '. Telefondan yazdıkların, bilgisayardaki Orvane açıkken cevaplanır.' : 'Claude API henüz bağlı değil. Echo kayıtlardan cevap verir; diğer çalışanlara yazılanlar bağlantı kurulunca cevaplanır.'}</Text>
      </View>
    </View>
  );
}
