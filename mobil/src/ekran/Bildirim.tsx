// Bildirim (0.9.0): Piyasa (gram altın, dolar, euro; ▲ yeşil ▼ kırmızı, dokun → fiyat alarmı), sessiz saat,
// Ekip şeridi (→ Ekip sayfası), GÖZDEN KAÇANLAR (görev/onay/mesaj/eşitleme), TAKİP EDİLEN HABERLER (Google Haberler,
// anahtar kelimeyle), oyun haberleri (takip ettiğin oyunların çıkışı yaklaşınca). Dış veriler lib/dis.ts.
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { AltPencere, Bos } from '@/bilesen/formlar';
import { Dugme, Ikon, KartK, SayfaBasligi, s } from '@/bilesen/ortak';
import { okunduYap, useBildirimler } from '@/lib/bildirim';
import { Alarm, alarmKur, haberOku, haberYenile, kalanGun, kelimeEkle, kelimeSil, piyasaYenile, sessizDegis, sessizMi, tetiklenen, useDis, useDisYenile } from '@/lib/dis';
import { acikGorevler, cagladaBekleyen } from '@/lib/ekip';
import { SEKME_EKIP, SEKME_GOREV, sekmeGit } from '@/lib/gezinti';
import { useEkip } from '@/lib/kullan';
import { R, saydam } from '@/lib/tema';
import { sayi } from '@/lib/zaman';

type Kod = 'GRA' | 'USD' | 'EUR';
const YESIL = '#6be585', KIRMIZI = '#f47a7a';
const once = (ts: number) => { const d = Math.round((Date.now() - ts) / 60000); return d < 1 ? 'şimdi' : d < 60 ? d + ' dk önce' : d < 1440 ? Math.round(d / 60) + ' sa önce' : Math.round(d / 1440) + ' gün önce'; };
const KANAL_IKON: Record<string, string> = { Görev: 'gorev', Onay: 'onay', Mesaj: 'mesaj', Sistem: 'wifi' };

function AlarmFormu({ kod, ad, fiyat, kapat }: { kod: Kod; ad: string; fiyat: number; kapat: () => void }) {
  const mevcut = useDis((d) => d.tercih.alarm[kod]);
  const [yon, setYon] = useState<Alarm['yon']>(mevcut?.yon || 'ust'), [sinir, setSinir] = useState(String(mevcut?.sinir ?? Math.round(fiyat * (mevcut?.yon === 'alt' ? 0.98 : 1.02) * 100) / 100).replace('.', ','));
  const n = parseFloat(sinir.replace(/\./g, '').replace(',', '.')), ok = n > 0;
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: R.yazi, fontSize: 17, fontWeight: '700' }}>{ad} · fiyat alarmı</Text>
      <Text style={s.sub}>Şu an {sayi(fiyat, 2)} ₺. Sınır geçilince Bildirim sekmesinin üstünde uyarı çıkar (sessiz saatte gösterilmez).</Text>
      <View style={[s.seg, { height: 38 }]}>
        {([['ust', 'Üstüne çıkınca'], ['alt', 'Altına inince']] as const).map(([k, y]) => (
          <Pressable key={k} onPress={() => setYon(k)} accessibilityRole="tab" accessibilityState={{ selected: yon === k }} style={[s.segb, yon === k && { backgroundColor: R.ana }]}><Text style={{ color: yon === k ? '#fff' : '#cfcfd4', fontSize: 13, fontWeight: '600' }}>{y}</Text></Pressable>
        ))}
      </View>
      <View style={s.giris}><Text style={s.girisEt}>Sınır (₺)</Text><TextInput value={sinir} onChangeText={setSinir} keyboardType="decimal-pad" style={s.girisY} accessibilityLabel="Alarm sınırı" /></View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {mevcut && <Dugme yazi="Kaldır" tur="tehlike" onPress={() => { alarmKur(kod, null); kapat(); }} />}
        <Dugme yazi="Vazgeç" tur="ikinci" onPress={kapat} stil={{ flex: 1 }} />
        <Dugme yazi="Kur" onPress={() => { if (ok) { alarmKur(kod, { yon, sinir: n }); kapat(); } }} kapali={!ok} stil={{ flex: 1 }} />
      </View>
    </View>
  );
}

export function BildirimSekmesi() {
  useDisYenile(['piyasa', 'haber']);
  const { o, hepsi, durum, pasif } = useEkip();
  const piyasa = useDis((d) => d.piyasa), haber = useDis((d) => d.haber), tercih = useDis((d) => d.tercih);
  const { liste, okundu, okunmamis } = useBildirimler();
  const [alarm, setAlarm] = useState<{ kod: Kod; ad: string; fiyat: number } | null>(null), [kel, setKel] = useState(''), [tum, setTum] = useState(false);
  const sessiz = sessizMi(), uyar = sessiz ? [] : tetiklenen(piyasa.liste, tercih.alarm);
  const yaklasan = Object.entries(tercih.takip).map(([id, t]) => ({ id, ...t, kg: kalanGun(t.ts) })).filter((t) => t.kg != null && t.kg <= 14).sort((a, b) => (a.kg as number) - (b.kg as number));
  const yeniHaber = haber.liste.filter((h) => !tercih.okunan[h.id]).length;
  const onay = cagladaBekleyen(o).length, acik = acikGorevler(o).length, aktif = hepsi.filter((c) => durum(c) !== 'id').length;
  const ac = (h: { id: string; link: string }) => { haberOku(h.id); if (h.link) Linking.openURL(h.link).catch(() => {}); };
  const gorunen = tum ? liste : liste.slice(0, 5);
  return (
    <View style={{ gap: 14 }}>
      <SayfaBasligi ust={okunmamis + yeniHaber ? okunmamis + ' bildirim · ' + yeniHaber + ' yeni haber' : 'Hepsi okundu'} baslik="Bildirim" />

      {uyar.map((p) => { const a = tercih.alarm[p.kod]!; return (
        <View key={'al' + p.kod} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16, backgroundColor: saydam(R.ana, 0.16), borderWidth: 1, borderColor: saydam(R.ana, 0.4) }}>
          <Ikon ad="alarm" boy={20} renk={R.ana2} kalin={2.1} />
          <Text style={{ flex: 1, color: R.yazi, fontSize: 13.5 }}>{p.ad} {a.yon === 'ust' ? 'üstüne çıktı' : 'altına indi'}: {sayi(p.fiyat, 2)} ₺ (sınır {sayi(a.sinir, 2)})</Text>
          <Pressable onPress={() => alarmKur(p.kod, null)} accessibilityRole="button" hitSlop={6}><Text style={{ color: R.ana2, fontSize: 13, fontWeight: '700' }}>Tamam</Text></Pressable>
        </View>); })}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {piyasa.liste.length ? piyasa.liste.map((p) => { const up = p.degisim >= 0, a = tercih.alarm[p.kod]; return (
          <Pressable key={p.kod} onPress={() => setAlarm({ kod: p.kod, ad: p.ad, fiyat: p.fiyat })} accessibilityRole="button" accessibilityLabel={p.ad + ' ' + sayi(p.fiyat, 2) + ' lira, ' + (up ? 'artış' : 'düşüş') + ' yüzde ' + sayi(Math.abs(p.degisim), 2) + '. Alarm kur'}
            style={({ pressed }) => [s.cam, { flex: 1, padding: 12, gap: 4, borderRadius: 18, transform: [{ scale: pressed ? 0.95 : 1 }] }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={[s.sub, { fontSize: 11.5 }]}>{p.ad}</Text>{a && <Ikon ad="alarm" boy={13} renk={R.ana2} kalin={2.2} />}</View>
            <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: R.yazi, fontSize: 17, fontWeight: '700' }}>{sayi(p.fiyat, p.kod === 'GRA' ? 0 : 2)}</Text>
            <Text style={{ color: up ? YESIL : KIRMIZI, fontSize: 12, fontWeight: '700' }}>{up ? '▲' : '▼'} %{sayi(Math.abs(p.degisim), 2)}</Text>
          </Pressable>); })
          : <View style={[s.cam, { flex: 1, alignItems: 'center', padding: 16 }]}>{piyasa.hata ? <Text style={{ color: '#f4a3a3', fontSize: 12.5, textAlign: 'center' }}>{piyasa.hata}</Text> : <ActivityIndicator color={R.ana2} />}</View>}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 }}>
        <Text style={[s.sub, { flex: 1, fontSize: 11.5 }]}>{piyasa.ts ? 'Truncgil · ' + once(piyasa.ts) + ' · dokun: alarm kur' : 'Fiyatlar yükleniyor'}</Text>
        <Pressable onPress={() => piyasaYenile(true)} accessibilityRole="button" accessibilityLabel="Fiyatları yenile" hitSlop={8}><Ikon ad="yenile" boy={16} renk={R.yazi2} kalin={2.1} /></Pressable>
      </View>

      <View style={[s.cam, { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }]}>
        <Ikon ad={tercih.sessiz ? 'sessiz' : 'zil'} boy={20} renk={tercih.sessiz ? R.ana2 : R.yazi2} kalin={2} />
        <View style={{ flex: 1 }}><Text style={{ color: R.yazi, fontSize: 14, fontWeight: '600' }}>Sessiz saat</Text><Text style={s.sub}>22:00–08:00 arası alarm ve uyarı şeridi gösterilmez{sessiz ? ' · şu an sessiz' : ''}</Text></View>
        <Switch value={tercih.sessiz} onValueChange={sessizDegis} trackColor={{ true: R.ana, false: '#3a3a40' }} thumbColor="#fff" accessibilityLabel="Sessiz saat" />
      </View>

      <Pressable onPress={() => sekmeGit(SEKME_EKIP)} accessibilityRole="button" accessibilityLabel="Ekip sayfasını aç"
        style={({ pressed }) => [s.cam, { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
        <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: saydam(R.ana, 0.16) }}><Ikon ad="ekip" boy={20} renk={R.ana2} kalin={2} /></View>
        <View style={{ flex: 1 }}><Text style={{ color: R.yazi, fontSize: 14, fontWeight: '600' }}>Ekip{pasif ? ' · pasif' : ''}</Text><Text style={s.sub}>{pasif ? 'Yapay zekâ kapalı · ' : aktif + ' aktif · '}{acik} açık görev{onay ? ' · ' + onay + ' onay bekliyor' : ''}</Text></View>
        <Ikon ad="sag" boy={18} renk={R.yazi2} kalin={2} />
      </Pressable>

      <KartK ad="kacan" baslik="GÖZDEN KAÇANLAR" ozet={okunmamis ? okunmamis + ' okunmamış' : 'hepsi okundu'} sag={okunmamis ? <Pressable onPress={() => okunduYap(liste.map((b) => b.id))} accessibilityRole="button" hitSlop={4} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: saydam(R.ana, 0.16), justifyContent: 'center' }}><Text style={{ color: R.ana2, fontSize: 12, fontWeight: '600' }}>Okundu</Text></Pressable> : undefined}>
        {gorunen.length ? gorunen.map((b) => { const yeni = !okundu[b.id]; return (
          <Pressable key={b.id} onPress={() => { okunduYap([b.id]); if (b.kanal === 'Onay') sekmeGit(SEKME_GOREV, { gorev: 'onay' }); else if (b.kanal === 'Görev') sekmeGit(SEKME_GOREV, { gorev: 'gorev' }); else if (b.kanal === 'Mesaj') sekmeGit(SEKME_EKIP); }}
            accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 10, borderRadius: 14, backgroundColor: yeni ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
            <View style={{ width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)' }}><Ikon ad={KANAL_IKON[b.kanal] || 'bilgi'} boy={17} renk={yeni ? R.ana2 : R.yazi2} kalin={2} /></View>
            <View style={{ flex: 1, gap: 1 }}><Text numberOfLines={1} style={{ color: R.yazi, fontSize: 13.5, fontWeight: yeni ? '700' : '500' }}>{b.baslik}</Text><Text numberOfLines={1} style={s.sub}>{b.alt}</Text></View>
            <Text style={[s.sub, { fontSize: 11 }]}>{once(b.ts)}</Text>
          </Pressable>); }) : <Bos yazi="Kaçırdığın bir şey yok." ikon="tik" />}
        {liste.length > 5 && <Pressable onPress={() => setTum(!tum)} accessibilityRole="button"><Text style={{ color: R.ana2, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>{tum ? 'Daha az' : 'Tümünü göster (' + liste.length + ')'}</Text></Pressable>}
      </KartK>

      <KartK ad="haber" baslik="TAKİP EDİLEN HABERLER" ozet={yeniHaber + ' yeni · ' + tercih.kelime.length + ' kelime'}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {tercih.kelime.map((k) => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 32, paddingLeft: 12, paddingRight: 6, borderRadius: 16, backgroundColor: saydam(R.ana, 0.16) }}>
              <Text style={{ color: R.ana2, fontSize: 12.5, fontWeight: '600' }}>{k}</Text>
              <Pressable onPress={() => kelimeSil(k)} accessibilityRole="button" accessibilityLabel={k + ' kelimesini kaldır'} hitSlop={8} style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}><Ikon ad="kapat" boy={12} renk={R.ana2} kalin={2.4} /></Pressable>
            </View>
          ))}
        </View>
        {tercih.kelime.length < 5 && <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={[s.giris, { flex: 1, minHeight: 44, justifyContent: 'center' }]}><TextInput value={kel} onChangeText={setKel} onSubmitEditing={() => { kelimeEkle(kel); setKel(''); }} placeholder="Kelime ekle (ör. Menemen konut)" placeholderTextColor={R.solukk} style={s.girisY} returnKeyType="done" accessibilityLabel="Haber anahtar kelimesi" /></View>
          <Dugme yazi="Ekle" onPress={() => { kelimeEkle(kel); setKel(''); }} kapali={!kel.trim()} />
        </View>}
        {haber.liste.slice(0, 8).map((h) => { const yeni = !tercih.okunan[h.id]; return (
          <Pressable key={h.id} onPress={() => ac(h)} accessibilityRole="link" style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, marginTop: 6, backgroundColor: yeni ? R.ana : 'transparent' }} />
            <View style={{ flex: 1, gap: 2 }}><Text numberOfLines={3} style={{ color: yeni ? R.yazi : R.yazi2, fontSize: 13.5, fontWeight: yeni ? '600' : '400' }}>{h.baslik}</Text><Text style={[s.sub, { fontSize: 11 }]}>{h.kaynak || 'Haber'} · {once(h.ts)} · {h.kelime}</Text></View>
            <Ikon ad="link" boy={14} renk={R.yazi2} kalin={2} />
          </Pressable>); })}
        {!haber.liste.length && (haber.hata ? <Text style={{ color: '#f4a3a3', fontSize: 13 }}>{haber.hata}</Text> : tercih.kelime.length ? <ActivityIndicator color={R.ana2} /> : <Text style={s.soluk}>Takip etmek istediğin konuyu kelime olarak ekle.</Text>)}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[s.sub, { flex: 1, fontSize: 11 }]}>Google Haberler{haber.ts ? ' · ' + once(haber.ts) : ''}</Text>
          <Pressable onPress={() => haberYenile(true)} accessibilityRole="button" accessibilityLabel="Haberleri yenile" hitSlop={8}><Ikon ad="yenile" boy={16} renk={R.yazi2} kalin={2.1} /></Pressable>
        </View>
      </KartK>

      <KartK ad="oyunhaber" baslik="OYUN" ozet={yaklasan.length ? yaklasan.length + ' oyun yaklaşıyor' : 'yaklaşan yok'} sag={<Pressable onPress={() => sekmeGit(3)} accessibilityRole="button" hitSlop={4} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: saydam(R.ana, 0.16), justifyContent: 'center' }}><Text style={{ color: R.ana2, fontSize: 12, fontWeight: '600' }}>Oyunlar</Text></Pressable>}>
        {yaklasan.length ? yaklasan.map((t) => (
          <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 12, borderRadius: 14, backgroundColor: t.kg === 0 ? saydam(R.ana, 0.14) : 'rgba(255,255,255,0.05)' }}>
            <Ikon ad={t.zil ? 'zil' : 'oyun'} boy={17} renk={R.ana2} kalin={2} />
            <Text numberOfLines={1} style={{ flex: 1, color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{t.ad}</Text>
            <Text style={{ color: R.ana2, fontSize: 12.5, fontWeight: '700' }}>{t.kg === 0 ? 'bugün çıkıyor' : t.kg + ' gün kaldı'}</Text>
          </View>
        )) : <Text style={s.soluk}>Takip ettiğin oyunlardan 14 gün içinde çıkan yok. Bana Özel › Yeni çıkacak oyunlar’dan takip et.</Text>}
      </KartK>

      <AltPencere acik={!!alarm} kapat={() => setAlarm(null)}>{alarm && <AlarmFormu {...alarm} kapat={() => setAlarm(null)} />}</AltPencere>
    </View>
  );
}
