// Çalışan sayfası: Sohbet · Görevler · Beceriler · Hafıza (masaüstü çalışan sayfasının telefon hâli)
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKlavye } from '@/lib/klavye';
import { AltPencere, Bos, GelisimFormu, GorevFormu, GorevSinir } from '@/bilesen/formlar';
import { GelisimSatiri } from '@/bilesen/gelisim';
import { Dugme, Ekran, Foto, Ikon, Nokta, Rozet, s } from '@/bilesen/ortak';
import { olayEkle, useDurum } from '@/lib/depo';
import { aciklama, beceriler, Calisan, calisanlar, durumNoktasi, echoCevap, GT, hafiza, LVL, useGorunum } from '@/lib/ekip';
import { esitleSonra } from '@/lib/senk';
import { R, saydam } from '@/lib/tema';

const saat = (ts: number) => { const d = new Date(ts), b = new Date(); const t = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); return d.toDateString() === b.toDateString() ? t : d.getDate() + '.' + (d.getMonth() + 1) + ' ' + t; };
const kalin = (t: string) => t.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? <Text key={i} style={{ fontWeight: '700' }}>{p}</Text> : p));

export default function CalisanSayfasi() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const o = useGorunum(), senk = useDurum((d) => d.senk);
  const hepsi = useMemo(() => calisanlar(o), [o]), c = hepsi.find((x) => x.id === id);
  const [sek, setSek] = useState<'sohbet' | 'gorev' | 'bec' | 'haf'>('sohbet'), [form, setForm] = useState<'' | 'gorev' | 'beceri' | 'hafiza'>('');
  if (!c) return <Ekran baslik="ORVANE" geri><Bos yazi="Çalışan bulunamadı" /></Ekran>;
  const cevrim = !senk.hata, gorev = o.ekip.gorev.filter((g) => g.kim === c.id);
  const T: [typeof sek, string][] = [['sohbet', 'Sohbet'], ['gorev', 'Görevler' + (gorev.filter((g) => g.durum !== 'bitti').length ? ' · ' + gorev.filter((g) => g.durum !== 'bitti').length : '')], ['bec', 'Beceriler'], ['haf', 'Hafıza']];
  return (
    <Ekran geri baslik={
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch' }}>
        <Foto c={c} boy={40} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={{ color: R.yazi, fontSize: 16, fontWeight: '600' }}>{c.ad}</Text><View style={{ backgroundColor: saydam(c.renk, 0.18), borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, flexShrink: 1 }}><Text numberOfLines={1} style={{ color: c.renk, fontSize: 11, fontWeight: '600' }}>{c.gorev}</Text></View></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}><Nokta d={cevrim ? durumNoktasi(c, o) : 'id'} boy={7} /><Text numberOfLines={1} style={{ color: R.soluk, fontSize: 12, flex: 1 }}>{cevrim ? 'Çevrimiçi' : 'Çevrimdışı'} · {aciklama(c)}</Text></View>
        </View>
      </View>}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
        {T.map(([k, y]) => (
          <Pressable key={k} onPress={() => setSek(k)} accessibilityRole="tab" accessibilityState={{ selected: sek === k }} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: sek === k ? R.secili : 'transparent', borderWidth: 1, borderColor: sek === k ? 'transparent' : 'rgba(255,255,255,0.08)' }}>
            <Text style={{ color: sek === k ? '#fff' : '#a4a4ab', fontSize: 13, fontWeight: '600' }}>{y}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {sek === 'sohbet' && <Sohbet c={c} />}
      {sek !== 'sohbet' && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}>
          {sek === 'gorev' && <>
            <Dugme yazi="Doğrudan görev ver" ikon="simsek" onPress={() => setForm('gorev')} />
            {gorev.length ? gorev.slice().sort((a, b) => Number(a.durum === 'bitti') - Number(b.durum === 'bitti') || b.ts - a.ts).map((g) => (
              <View key={g.id} style={[s.kart, { flexDirection: 'row', gap: 12, opacity: g.durum === 'bitti' ? 0.6 : 1 }]}>
                <Pressable onPress={() => { olayEkle('gorev_durum', { id: g.id, durum: g.durum === 'bitti' ? 'acik' : 'bitti' }); esitleSonra(); }} accessibilityRole="checkbox" accessibilityState={{ checked: g.durum === 'bitti' }} accessibilityLabel="Bitti"
                  style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: g.durum === 'bitti' ? R.yesil : '#5a5a62', backgroundColor: g.durum === 'bitti' ? R.yesil : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {g.durum === 'bitti' && <Ikon ad="tik" boy={14} renk="#fff" kalin={2.4} />}
                </Pressable>
                <View style={{ flex: 1 }}><Text style={{ color: '#e4e4e8', fontSize: 14.5, lineHeight: 21 }}>{g.metin}</Text><Text style={{ color: R.solukk, fontSize: 12, marginTop: 3 }}>Doğrudan görev · {saat(g.ts)}{g.son ? ' · son tarih ' + g.son : ''}</Text><GorevSinir g={g} /></View>
                {g.onc === 'acil' && <Rozet yazi="Acil" renk={R.acil} />}
              </View>
            )) : <Bos yazi="Henüz görev yok. Görevler yapay zekâ bağlanınca Orin › Orla zinciriyle de gelecek." ikon="gorev" />}
          </>}
          {sek === 'bec' && <>
            <Dugme yazi="Geliştirme iste" ikon="yildiz" onPress={() => setForm('beceri')} />
            <Text style={s.soluk}>Beceriler önce İK Müdürü Nika’nın, sonra CEO Orin’in onayıyla gelişir.</Text>
            {beceriler(c.id, o).map((b) => (
              <View key={b.ad} style={s.kart}>
                <View style={{ flexDirection: 'row' }}><Text style={{ color: '#fff', fontSize: 14.5, fontWeight: '600', flex: 1 }}>{b.ad}</Text><Text style={{ color: '#8e8e96', fontSize: 12 }}>{LVL[b.sv]}</Text></View>
                {!!b.not && <Text style={{ color: R.soluk, fontSize: 12.5, marginTop: 4 }}>{b.not}</Text>}
                <View style={{ flexDirection: 'row', gap: 4, marginTop: 10 }}>{[1, 2, 3, 4, 5].map((i) => <View key={i} style={{ flex: 1, height: 5, borderRadius: 9, backgroundColor: i <= b.sv ? c.renk : '#34343a' }} />)}</View>
              </View>
            ))}
            {o.ekip.gel.filter((g) => g.kim === c.id && g.tur !== 'hafiza').slice(-6).reverse().map((g) => <GelisimSatiri key={g.id} g={g} />)}
          </>}
          {sek === 'haf' && <>
            <Dugme yazi="Hafızaya ekle" ikon="beyin" onPress={() => setForm('hafiza')} />
            <Text style={s.soluk}>{c.ad}’nın kalıcı olarak hatırladıkları. Yeni bilgi Nika ve Orin’in onayıyla eklenir.</Text>
            {o.ekip.gel.filter((g) => g.kim === c.id && g.tur === 'hafiza' && (g.asama === 'ik' || g.asama === 'ceo')).map((g) => <GelisimSatiri key={g.id} g={g} />)}
            {hafiza(c.id, o).length ? hafiza(c.id, o).slice().reverse().map((m) => (
              <View key={m.id} style={[s.kart, { flexDirection: 'row', gap: 10 }]}><Ikon ad="yildiz" boy={18} renk={c.renk} /><View style={{ flex: 1 }}><Text style={{ color: '#e4e4e8', fontSize: 14.5 }}>{m.metin}</Text><Text style={{ color: R.solukk, fontSize: 12, marginTop: 3 }}>{m.kaynak}</Text></View></View>
            )) : <Bos yazi="Hafıza henüz boş." ikon="beyin" />}
          </>}
        </ScrollView>
      )}
      <AltPencere acik={!!form} kapat={() => setForm('')}>
        {form === 'gorev' ? <GorevFormu c={c} kapat={() => setForm('')} /> : form ? <GelisimFormu c={c} o={o} hepsi={hepsi} kimden="cagla" tur0={form} kapat={() => setForm('')} /> : null}
      </AltPencere>
    </Ekran>
  );
}

function Sohbet({ c }: { c: Calisan }) {
  const o = useGorunum(), olaylar = useDurum((d) => d.olaylar), senk = useDurum((d) => d.senk), alt = useSafeAreaInsets().bottom, kl = useKlavye();
  const [t, setT] = useState(''), [mod, setMod] = useState<'mesaj' | 'not'>('mesaj'), sc = useRef<any>(null);
  const a = o.ekip.sohbet[c.id] || [], bek = new Set(olaylar.filter((e) => !e.gitti).map((e) => e.id));
  const cevapsiz = a.filter((m) => m.bek).length;
  const gonder = (metin?: string) => {
    const x = (metin ?? t).trim(); if (!x) return; if (metin == null) setT('');
    const md = metin != null ? 'mesaj' : mod, r = md === 'mesaj' && c.id === 'echo' && (metin != null || !o.zeka?.bagli) ? echoCevap(o, x) : null; // yapay zekâ bağlıysa yazılan mesajı Echo cevaplar
    olayEkle('mesaj', { kim: c.id, t: x, mod: md, bek: md === 'mesaj' && !r ? 1 : 0 });
    if (r) olayEkle('cevap', { kim: c.id, t: r.t, qr: r.qr });
    esitleSonra(); setTimeout(() => sc.current?.scrollToEnd({ animated: true }), 80);
  };
  return (
    <View ref={kl.ref} style={{ flex: 1 }}>
      <ScrollView ref={sc} onContentSizeChange={() => sc.current?.scrollToEnd({ animated: false })} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 14 }}>
        {!a.length && <Bot c={c} t={'Merhaba, ben ' + c.ad + '. ' + c.gorev + ' işlerine bakıyorum.' + (c.id === 'echo' ? ' Kayıtlarına bakıp hemen özet çıkarabilirim.' : ' Yapay zekâ bağlantısı kurulunca sohbet edebileceğiz; şimdiden mesaj ya da not bırakabilirsin.')} qr={c.id === 'echo' ? ['Bu haftanın raporu', 'Eksik günler', 'Bu ayın özeti'] : []} gonder={gonder} />}
        {a.map((m) => m.r === 'sys' ? (
          <View key={m.id} style={{ flexDirection: 'row', gap: 10, backgroundColor: 'rgba(47,123,245,0.08)', borderWidth: 1, borderColor: 'rgba(47,123,245,0.3)', borderRadius: 14, padding: 11 }}><Ikon ad="simsek" boy={18} renk={R.bilgi} /><Text style={{ flex: 1, color: R.bilgi, fontSize: 13, lineHeight: 19 }}>{m.t}</Text></View>
        ) : m.r === 'o' ? <Bot key={m.id} c={c} t={m.t} ts={m.ts} qr={m.qr} gonder={gonder} />
          : m.tur === 'not' ? (
            <View key={m.id} style={[s.kart, { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }]}><Ikon ad="not" boy={18} renk={R.notTuruncu} /><View style={{ flex: 1 }}><Text style={{ color: '#e4e4e8', fontSize: 14 }}>{m.t}</Text><Text style={{ color: R.solukk, fontSize: 11.5, marginTop: 2 }}>{saat(m.ts)} · not</Text></View><Rozet yazi={bek.has(m.id) ? 'Bekliyor' : 'Kaydedildi'} renk={bek.has(m.id) ? R.notTuruncu : R.yesil} /></View>
          ) : (
            <View key={m.id} style={{ alignItems: 'flex-end' }}><View style={{ backgroundColor: '#2f2f34', borderRadius: 20, borderBottomRightRadius: 6, paddingHorizontal: 15, paddingVertical: 10, maxWidth: '80%' }}>
              <Text style={{ color: R.yazi, fontSize: 15, lineHeight: 21 }}>{m.t}</Text>
              <Text style={{ color: '#8e8e96', fontSize: 11, textAlign: 'right', marginTop: 3 }}>{m.tur === 'ses' ? 'sesli · ' : ''}{saat(m.ts)}{m.kaynak === 'telefon' ? ' · telefondan' : ''}{bek.has(m.id) ? ' · gönderilecek' : m.bek ? ' · cevap bekliyor' : ''}</Text>
            </View></View>
          ))}
        {senk.hata ? (
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: 'rgba(224,149,47,0.1)', borderWidth: 1, borderColor: 'rgba(224,149,47,0.35)', borderRadius: 14, padding: 11 }}><Ikon ad="wifi" boy={20} renk="#f1c88a" /><Text style={{ flex: 1, color: '#f1c88a', fontSize: 13.5 }}><Text style={{ fontWeight: '700' }}>Bağlantı yok.</Text> Yazdıkların saklanır, bağlantı gelince {c.ad}’ya iletilir.</Text></View>
        ) : cevapsiz > 0 ? (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: 'rgba(47,123,245,0.08)', borderWidth: 1, borderColor: 'rgba(47,123,245,0.3)', borderRadius: 14, padding: 11 }}><Ikon ad="bilgi" boy={18} renk={R.bilgi} /><Text style={{ flex: 1, color: R.bilgi, fontSize: 13 }}>{o.zeka?.bagli ? cevapsiz + ' mesaj cevap bekliyor · bilgisayardaki Orvane açıkken ' + c.ad + ' birkaç saniyede cevaplar.' : 'Yapay zekâ bağlı değil · ' + cevapsiz + ' mesaj cevap bekliyor. Bağlantı kurulunca ' + c.ad + ' cevaplayacak.'}</Text></View>
        ) : null}
      </ScrollView>
      <View style={{ paddingHorizontal: 12, paddingTop: 6, paddingBottom: kl.ortu > 0 ? kl.ortu + 8 : Math.max(alt, 10) + 6 }}>
        <View style={{ backgroundColor: '#252528', borderWidth: 1, borderColor: mod === 'not' ? 'rgba(224,149,47,0.45)' : 'rgba(255,255,255,0.09)', borderRadius: 26, paddingTop: 10, paddingBottom: 8, paddingHorizontal: 12 }}>
          <TextInput value={t} onChangeText={setT} multiline placeholder={mod === 'not' ? c.ad + '’ya not bırak…' : c.ad + '’ya mesaj yaz…'} placeholderTextColor={R.soluk} accessibilityLabel="Mesaj" style={{ color: '#fff', fontSize: 15, maxHeight: 120, paddingHorizontal: 2, paddingBottom: 8 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ flexDirection: 'row', backgroundColor: '#1c1c1f', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 999, padding: 3 }}>
              {(['mesaj', 'not'] as const).map((k) => (
                <Pressable key={k} onPress={() => setMod(k)} accessibilityRole="button" accessibilityState={{ selected: mod === k }} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: mod === k ? R.secili : 'transparent' }}>
                  <Text style={{ color: mod === k ? '#fff' : R.soluk, fontSize: 13 }}>{k === 'mesaj' ? 'Mesaj' : 'Not'}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ flex: 1 }} />
            <Pressable onPress={() => Alert.alert('Sesli sohbet', 'Ses tanıma servisi henüz seçilmedi. Şimdilik yazarak konuşabilirsin; masaüstüyle birlikte eklenecek.')} accessibilityLabel="Sesli sohbet" style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}><Ikon ad="mikrofon" boy={20} /></Pressable>
            <Pressable onPress={() => gonder()} accessibilityLabel={mod === 'not' ? 'Notu kaydet' : 'Gönder'} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: mod === 'not' ? R.notTuruncu : R.ana, alignItems: 'center', justifyContent: 'center', opacity: t.trim() ? 1 : 0.6 }}>
              <Ikon ad={mod === 'not' ? 'kaydet' : 'gonder'} boy={20} renk="#fff" kalin={2} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function Bot({ c, t, ts, qr, gonder }: { c: Calisan; t: string; ts?: number; qr?: string[]; gonder: (x: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Foto c={c} boy={30} halka={false} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '600', marginBottom: 4 }}>{c.ad}{ts ? <Text style={{ color: R.solukk, fontWeight: '400' }}> · {saat(ts)}</Text> : null}</Text>
        <Text style={{ color: '#e4e4e8', fontSize: 15, lineHeight: 23 }}>{kalin(t)}</Text>
        {!!qr?.length && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>{qr.map((q) => (
          <Pressable key={q} onPress={() => gonder(q)} accessibilityRole="button" style={{ paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}><Text style={{ color: '#d4d4da', fontSize: 13 }}>{q}</Text></Pressable>
        ))}</View>}
      </View>
    </View>
  );
}
