// Orvane Mobil · alttan açılan formlar: doğrudan görev, gelişim isteği
import { useEffect, useState } from 'react';
import { Keyboard, Modal, Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dugme, Foto, Ikon, s } from '@/bilesen/ortak';
import { olayEkle, uid } from '@/lib/depo';
import { beceriler, Calisan, GT, LVL } from '@/lib/ekip';
import { Ozet } from '@/lib/depo';
import { esitleSonra } from '@/lib/senk';
import { R, saydam } from '@/lib/tema';

// Alttan açılan pencere. Android'de Modal penceresi klavyeyle küçülmediği için klavye yüksekliği kadar elle yukarı kaydırılır.
export function AltPencere({ acik, kapat, children }: { acik: boolean; kapat: () => void; children: React.ReactNode }) {
  const alt = useSafeAreaInsets().bottom, { height: H } = useWindowDimensions();
  const [kb, setKb] = useState(0);
  useEffect(() => {
    const g = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setKb(e.endCoordinates.height));
    const k = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKb(0));
    return () => { g.remove(); k.remove(); };
  }, []);
  return (
    <Modal visible={acik} transparent animationType="slide" onRequestClose={kapat}>
      <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: kb }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} onPress={() => { Keyboard.dismiss(); kapat(); }} accessibilityLabel="Kapat" />
        <View style={{ backgroundColor: '#1f1f22', borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 18, paddingTop: 10, paddingBottom: kb ? 14 : Math.max(alt, 16) + 10, maxHeight: Math.max(260, H - kb - 60) }}>
          <View style={{ width: 40, height: 5, borderRadius: 99, backgroundColor: '#4a4a50', alignSelf: 'center', marginBottom: 12 }} />
          <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function Secim({ secenek, deger, sec }: { secenek: [string, string][]; deger: string; sec: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
      {secenek.map(([v, y]) => {
        const on = v === deger, ac = v === 'acil';
        return (
          <Pressable key={v} onPress={() => sec(v)} accessibilityRole="button" accessibilityState={{ selected: on }}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: on ? (ac ? R.acil : 'transparent') : 'rgba(255,255,255,0.12)', backgroundColor: on ? (ac ? saydam(R.acil, 0.2) : R.secili) : 'transparent' }}>
            <Text style={{ color: on ? (ac ? '#ffb0a0' : '#fff') : R.soluk, fontSize: 13.5, fontWeight: on ? '600' : '400' }}>{y}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function GorevFormu({ c, kapat }: { c: Calisan; kapat: () => void }) {
  const [metin, setMetin] = useState(''), [onc, setOnc] = useState('normal'), [bilgi, setBilgi] = useState(true), [son, setSon] = useState('');
  const gonder = () => {
    if (!metin.trim()) return;
    olayEkle('gorev', { id: uid(), kim: c.id, ad: c.ad, metin: metin.trim(), onc, son: son.trim(), bilgi: c.id !== 'orin' && bilgi });
    esitleSonra(); kapat();
  };
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Foto c={c} boy={36} halka={false} />
        <Text style={{ flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' }}>{c.ad}’ya doğrudan görev</Text>
        {c.grup !== 'yonetim' && <View style={{ borderWidth: 1, borderColor: 'rgba(255,179,91,0.45)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}><Text style={{ color: R.turuncu, fontSize: 11, fontWeight: '600' }}>Orin ve Orla atlanır</Text></View>}
      </View>
      <TextInput autoFocus value={metin} onChangeText={setMetin} multiline placeholder="Görevi yaz…" placeholderTextColor={R.solukk} accessibilityLabel="Görev"
        style={{ minHeight: 84, backgroundColor: '#18181b', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', borderRadius: 14, color: '#e4e4e8', fontSize: 14.5, padding: 12, textAlignVertical: 'top' }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={{ color: R.yazi2, fontSize: 13.5, flex: 1 }}>Öncelik</Text><Secim secenek={[['normal', 'Normal'], ['acil', 'Acil']]} deger={onc} sec={setOnc} /></View>
      {c.id !== 'orin' && (
        <Pressable onPress={() => setBilgi(!bilgi)} accessibilityRole="switch" accessibilityState={{ checked: bilgi }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 40, height: 24, borderRadius: 99, backgroundColor: bilgi ? R.ana : '#4a4a50', justifyContent: 'center', paddingHorizontal: 3 }}><View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', alignSelf: bilgi ? 'flex-end' : 'flex-start' }} /></View>
          <Text style={{ flex: 1, color: R.yazi2, fontSize: 13.5 }}>Orin’e bilgi notu düş <Text style={{ color: '#8e8e96' }}>· karışmaz, haberi olur</Text></Text>
        </Pressable>
      )}
      <View style={s.giris}><Text style={s.girisEt}>Son tarih (isteğe bağlı)</Text><TextInput value={son} onChangeText={setSon} placeholder="ör. Bugün 17:00" placeholderTextColor={R.solukk} style={s.girisY} /></View>
      <Dugme yazi={'Görevi ' + c.ad + '’ya gönder'} ikon="simsek" onPress={gonder} kapali={!metin.trim()} />
    </View>
  );
}

export function GelisimFormu({ c, o, hepsi, kimden, tur0, kapat }: { c?: Calisan; o: Ozet; hepsi: Calisan[]; kimden: 'cagla' | 'nika'; tur0: string; kapat: () => void }) {
  const [kim, setKim] = useState(c?.id || hepsi[0]?.id || ''), [tur, setTur] = useState(tur0), [ad, setAd] = useState(''), [metin, setMetin] = useState('');
  const bec = beceriler(kim, o);
  const tamam = tur === 'hafiza' ? !!metin.trim() : tur === 'seviye' ? !!ad : !!ad.trim();
  const gonder = () => { if (!tamam) return; olayEkle('gelisim', { id: uid(), kim, gtur: tur, ad: ad.trim(), metin: metin.trim(), kimden }); esitleSonra(); kapat(); };
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{kimden === 'nika' ? 'Nika olarak gelişim öner' : 'Gelişim iste'}</Text>
      <Text style={s.soluk}>{kimden === 'nika' ? 'İK önerisi doğrudan CEO Orin’in onayına gider.' : 'Talep önce İK Müdürü Nika’ya, onaylanırsa CEO Orin’e gider.'}</Text>
      {!c && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {hepsi.map((x) => (
            <Pressable key={x.id} onPress={() => setKim(x.id)} style={{ alignItems: 'center', gap: 4, opacity: kim === x.id ? 1 : 0.55 }} accessibilityLabel={x.ad}>
              <Foto c={x} boy={44} halka={kim === x.id} /><Text style={{ color: '#fff', fontSize: 11.5 }}>{x.ad}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <Secim secenek={Object.keys(GT).map((k) => [k, GT[k]] as [string, string])} deger={tur} sec={(v) => { setTur(v); setAd(''); }} />
      {tur === 'beceri' && <View style={s.giris}><Text style={s.girisEt}>Beceri adı</Text><TextInput value={ad} onChangeText={setAd} placeholder="ör. Haftalık PDF raporu" placeholderTextColor={R.solukk} style={s.girisY} /></View>}
      {tur === 'seviye' && <Secim secenek={bec.map((b) => [b.ad, b.ad + ' · ' + LVL[b.sv]] as [string, string])} deger={ad} sec={setAd} />}
      <View style={s.giris}><Text style={s.girisEt}>Açıklama</Text><TextInput value={metin} onChangeText={setMetin} multiline placeholder="Ne öğrensin ya da neyi hatırlasın?" placeholderTextColor={R.solukk} style={[s.girisY, { minHeight: 60, textAlignVertical: 'top' }]} /></View>
      <Dugme yazi="Gönder" ikon="yildiz" onPress={gonder} kapali={!tamam} />
    </View>
  );
}

export function Bos({ yazi, ikon = 'bilgi' }: { yazi: string; ikon?: string }) {
  return <View style={{ alignItems: 'center', gap: 8, padding: 24 }}><Ikon ad={ikon} boy={26} renk={R.solukk} /><Text style={[s.soluk, { textAlign: 'center' }]}>{yazi}</Text></View>;
}
