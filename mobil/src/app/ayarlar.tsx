// Ayarlar: eşitleme bağlantısı, giriş, durum, sürüm
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Dugme, Ekran, Ikon, Nokta, s } from '@/bilesen/ortak';
import { guncelle, useDurum } from '@/lib/depo';
import { bekleyenGelisim, useGorunum } from '@/lib/ekip';
import { cikis, esitle, girisYap, hataMetni, kayitOl, oturum, VARSAYILAN } from '@/lib/senk';
import { R } from '@/lib/tema';
import { SURUM } from '@/veri/surum';
import * as Updates from 'expo-updates';
import { guncellemeDenetle, yenidenBaslat } from '@/lib/guncelle';

export default function Ayarlar() {
  const d = useDurum((x) => x), o = useGorunum();
  const [url, setUrl] = useState(d.ayar.url), [anahtar, setAnahtar] = useState(d.ayar.anahtar);
  const [eposta, setEposta] = useState(''), [sifre, setSifre] = useState(''), [kim, setKim] = useState<string | null>(null), [mesaj, setMesaj] = useState(''), [bekle, setBekle] = useState(false), [guncel, setGuncel] = useState(false);
  const yenile = () => oturum().then((x) => setKim(x?.user?.email || null)).catch(() => setKim(null));
  useEffect(() => { yenile(); }, [d.ayar]);
  const varsayilan = !!VARSAYILAN.url;
  const adresKaydet = () => { guncelle((x) => ({ ...x, ayar: { url: url.trim(), anahtar: anahtar.trim() } })); setMesaj('Bağlantı adresi kaydedildi'); };
  const calis = async (f: () => Promise<any>, ok: string) => { setBekle(true); setMesaj(''); try { await f(); setMesaj(ok); await yenile(); } catch (e) { setMesaj(hataMetni(e)); } finally { setBekle(false); } };
  const bekleyen = d.olaylar.filter((e) => !e.gitti).length;
  return (
    <Ekran baslik={<Text style={s.baslik}>Ayarlar</Text>} altMenu rozet={{ '/onaylar': bekleyenGelisim(o, 'nika').length + bekleyenGelisim(o, 'orin').length }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={s.kart}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}><Ikon ad="ekip" boy={18} /><Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 }}>Masaüstüyle eşitleme</Text><Nokta d={kim && !d.senk.hata ? 'ok' : d.senk.hata ? 'bz' : 'id'} /></View>
          <Text style={s.soluk}>{kim ? 'Giriş: ' + kim : 'Giriş yapılmadı'}{d.senk.son ? ' · son eşitleme ' + new Date(d.senk.son).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}{bekleyen ? ' · ' + bekleyen + ' işlem gönderilecek' : ''}{o.ts ? ' · masaüstü verisi ' + new Date(o.ts).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</Text>
          {!!d.senk.hata && <Text style={{ color: '#f1c88a', fontSize: 13, marginTop: 6 }}>{d.senk.hata}</Text>}
          {kim && <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}><Dugme yazi={d.senk.calisiyor ? 'Eşitleniyor…' : 'Şimdi eşitle'} onPress={() => esitle()} stil={{ flex: 1 }} kapali={!!d.senk.calisiyor} /><Dugme yazi="Çıkış" tur="ikinci" onPress={() => calis(cikis, 'Çıkış yapıldı')} /></View>}
        </View>
        {!varsayilan && (
          <View style={[s.kart, { gap: 8 }]}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Bağlantı adresi</Text>
            <Text style={s.soluk}>Supabase proje adresi ve “publishable” anahtarı. Masaüstü Orvane’da da aynısı kullanılır.</Text>
            <View style={s.giris}><Text style={s.girisEt}>Proje adresi</Text><TextInput value={url} onChangeText={setUrl} placeholder="https://xxxx.supabase.co" placeholderTextColor={R.solukk} autoCapitalize="none" style={s.girisY} /></View>
            <View style={s.giris}><Text style={s.girisEt}>Publishable anahtar</Text><TextInput value={anahtar} onChangeText={setAnahtar} placeholder="sb_publishable_…" placeholderTextColor={R.solukk} autoCapitalize="none" style={s.girisY} /></View>
            <Dugme yazi="Kaydet" tur="ikinci" onPress={adresKaydet} />
          </View>
        )}
        {!kim && (
          <View style={[s.kart, { gap: 8 }]}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Giriş</Text>
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
        <View style={[s.kart, { gap: 8 }]}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Uygulama güncellemesi</Text>
          <Text style={s.soluk}>Düzeltmeler APK kurmadan gelir: uygulama açılınca ve öne gelince denetlenir. {Updates.isEmbeddedLaunch ? 'Şu an APK ile gelen ilk sürüm çalışıyor.' : Updates.createdAt ? 'Çalışan güncelleme: ' + Updates.createdAt.toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '.' : ''}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Dugme yazi="Güncellemeleri denetle" tur="ikinci" stil={{ flex: 1 }} onPress={() => calis(async () => { const r = await guncellemeDenetle(true); if (r === 'indirildi') { setGuncel(true); return; } throw new Error(r === 'gelistirme' ? 'Geliştirme sürümünde güncelleme denetlenmez' : r === 'hata' ? 'Güncelleme sunucusuna ulaşılamadı' : 'Uygulama güncel'); }, 'Güncelleme indirildi')} />
            {guncel && <Dugme yazi="Yeniden başlat" onPress={() => yenidenBaslat()} />}
          </View>
        </View>
        <View style={s.kart}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 6 }}>Yapay zekâ</Text>
          <Text style={s.soluk}>Claude API henüz bağlı değil. Echo kayıtlardan cevap verir; diğer çalışanlara yazılanlar bağlantı kurulunca cevaplanır.</Text>
        </View>
        <Text style={[s.soluk, { textAlign: 'center', marginTop: 8 }]}>ORVANE · sürüm {SURUM} · masaüstüyle aynı sürüm</Text>
      </ScrollView>
    </Ekran>
  );
}
