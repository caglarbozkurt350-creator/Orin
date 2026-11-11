// İş günü: haftanın günleri, girilen kayıtlar, telefondan kayıt (masaüstü Sheets'e yazar)
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Bos } from '@/bilesen/formlar';
import { Dugme, Ekran, Rozet, s } from '@/bilesen/ortak';
import { olayEkle, useDurum } from '@/lib/depo';
import { bekleyenGelisim, gunAnahtari, useGorunum } from '@/lib/ekip';
import { esitleSonra } from '@/lib/senk';
import { R, saydam } from '@/lib/tema';

const GK = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const GN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const IZ: Record<string, string> = { yillik: 'Yıllık izin', ucretsiz: 'Ücretsiz izin', rapor13: 'Rapor', rapor4: 'Rapor', mazeret: 'Mazeret izni', refakat: 'Refakat izni', sevk: 'İş yeri sevki' };

export default function IsGunu() {
  const o = useGorunum(), olaylar = useDurum((d) => d.olaylar);
  const hafta = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return [0, 1, 2, 3, 4].map((i) => { const x = new Date(d); x.setDate(d.getDate() + i); return x; }); }, []);
  const [sec, setSec] = useState(gunAnahtari(new Date()));
  const [kod, setKod] = useState(''), [is, setIs] = useState(''), [dk, setDk] = useState(''), [hata, setHata] = useState('');
  const g = o.gun[sec], L = g?.L ?? null, H = (L || 0) + (g?.OT || 0), T = g?.T || 0;
  const a = sec.split('-').map(Number), tarih = new Date(a[0], a[1] - 1, a[2]), bugun = sec === gunAnahtari(new Date());
  const bekleyen = new Set(olaylar.filter((e) => e.tur === 'kayit' && !e.gitti && e.veri.k === sec).map((e) => e.veri.kod + '|' + e.veri.is + '|' + e.veri.dk));
  const renk = (k: string) => { const x = o.gun[k]; if (!x) return '#4a4a50'; if (x.D) return R.yesil; if (!x.L) return x.T ? R.ana : '#4a4a50'; return x.T >= x.L + (x.OT || 0) ? R.ana : x.T ? R.turuncu : k < gunAnahtari(new Date()) ? R.kirmizi : '#4a4a50'; };
  const kaydet = (dakika?: number) => {
    setHata(''); const d = dakika ?? parseInt(dk, 10), k = kod.trim() || (/(tezgah|atölye|yarı mamül|diğer)/i.test(is) ? 'Diğer' : '');
    if (!k) return setHata('Proje kodunu yaz'); if (!is.trim()) return setHata('Yapılan işi yaz'); if (!d || d <= 0) return setHata('Dakikayı yaz');
    if (g?.D) return setHata('Bu gün izin günü; ayrıca kayıt gerekmez');
    olayEkle('kayit', { k: sec, kod: k, is: is.trim(), dk: d }); esitleSonra(); setDk(''); setIs('');
  };
  const doldur = () => { if (!L) return setHata('Bu gün için iş süresi yok'); const kalan = H - T; if (kalan <= 0) return setHata('Gün zaten dolu'); kaydet(kalan); };
  return (
    <Ekran baslik={<Text style={s.baslik}>İş günü</Text>} altMenu rozet={{ '/onaylar': bekleyenGelisim(o, 'nika').length + bekleyenGelisim(o, 'orin').length }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={{ color: R.yazi, fontSize: 20, fontWeight: '700' }}>{tarih.getDate()} {AY[tarih.getMonth()]} {GN[tarih.getDay()]}</Text>
          <Text style={[s.soluk, { marginTop: 4 }]}>{bugun ? 'Bugün · ' : ''}{g?.D ? (IZ[g.D] || 'İzin') + ' · tam gün sayılır' : L ? 'iş süresi ' + L + (g?.OT ? ' + ' + g.OT + ' mesai' : '') + ' · yazılan ' + T + ' · kalan ' + Math.max(0, H - T) + ' dk' : 'Bu gün için iş süresi yok'}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {hafta.map((d) => { const k = gunAnahtari(d), on = k === sec; return (
            <Pressable key={k} onPress={() => setSec(k)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={GN[d.getDay()]}
              style={{ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 8, borderRadius: 14, backgroundColor: on ? saydam(R.ana, 0.2) : '#222225', borderWidth: 1, borderColor: on ? R.ana : 'rgba(255,255,255,0.06)' }}>
              <Text style={{ color: R.yazi2, fontSize: 11.5 }}>{GK[d.getDay()]}</Text><Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{d.getDate()}</Text><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: renk(k) }} />
            </Pressable>); })}
        </View>
        {!!L && <View style={{ height: 10, borderRadius: 99, backgroundColor: R.giris, overflow: 'hidden' }}><View style={{ width: Math.min(100, (T / (H || 1)) * 100) + '%', height: '100%', backgroundColor: R.ana, borderRadius: 99 }} /></View>}
        {!o.ts && <Bos yazi="Masaüstü Orvane ile eşitlenince kayıtların burada görünür. Telefondan girdiğin kayıtlar bekler ve eşitlenince Sheets’e yazılır." ikon="gun" />}
        {(g?.e || []).map(([k, i, m], n) => (
          <View key={n} style={[s.kart, { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }]}>
            <View style={{ flex: 1 }}><Text style={{ color: '#fff', fontSize: 14.5, fontWeight: '600' }}>{k}</Text><Text style={{ color: R.soluk, fontSize: 13, marginTop: 2 }}>{i}</Text></View>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{m} dk</Text>
            <Rozet yazi={bekleyen.has(k + '|' + i + '|' + m) ? 'Sırada' : 'Kayıtlı'} renk={bekleyen.has(k + '|' + i + '|' + m) ? R.notTuruncu : R.yesil} />
          </View>
        ))}
        {!g?.D && <>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
            <View style={[s.giris, { flex: 1 }]}><Text style={s.girisEt}>Proje kodu</Text><TextInput value={kod} onChangeText={setKod} placeholder="78.26.03.19" placeholderTextColor={R.solukk} style={s.girisY} autoCapitalize="none" /></View>
            <View style={[s.giris, { width: 110 }]}><Text style={s.girisEt}>Dakika</Text><TextInput value={dk} onChangeText={setDk} keyboardType="number-pad" placeholder="120" placeholderTextColor={R.solukk} style={s.girisY} /></View>
          </View>
          <View style={s.giris}><Text style={s.girisEt}>Yapılan iş</Text><TextInput value={is} onChangeText={setIs} placeholder="Sancak GC montajı" placeholderTextColor={R.solukk} style={s.girisY} /></View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {(o.proj.length ? o.proj.slice(0, 6) : []).concat(['Standart dışı', 'Diğer']).map((p) => (
              <Pressable key={p} onPress={() => setKod(p)} style={{ paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, backgroundColor: kod === p ? R.secili : '#2e2e33' }}><Text style={{ color: '#d4d4da', fontSize: 13 }}>{p}</Text></Pressable>
            ))}
          </View>
          {!!hata && <Text style={{ color: '#f4a3a3', fontSize: 13 }}>{hata}</Text>}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Dugme yazi="Günü doldur" tur="ikinci" onPress={doldur} stil={{ flex: 1 }} />
            <Dugme yazi="Kaydet" onPress={() => kaydet()} stil={{ flex: 1 }} />
          </View>
          <Text style={[s.soluk, { fontSize: 12 }]}>Kayıt önce eşitlemeye gider; bilgisayardaki Orvane alır ve Sheets’e yazar. İnternet yokken sırada bekler. Günü doldur: günün hedefinden girilmiş süre çıkarılır, kalan eklenir.</Text>
        </>}
      </ScrollView>
    </Ekran>
  );
}
