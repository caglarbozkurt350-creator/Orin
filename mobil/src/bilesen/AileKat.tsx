// Ailem kategorileri (0.9.4): kutucuğa dokununca altta o kategorinin gerçek içeriği açılır.
// • Bütçe: bu ayın kişisel gelir/gideri, kategoriler, son işlemler · Gelir / gider ekle (finans_kayit)
// • Sağlık: bugünkü ilaçlar (ilac_al), sabah açlık şekeri (seker), spor (spor: adım, yürüyüş dk, başka aktivite)
// • Menü & Market: haftalık menü (menu_yaz {k, v}) · market listesi (market_ekle / market_tik / market_temizle)
// • Satın Alma: öneriler ve karar (oneri_ekle / oneri_karar)
// • Ev İşleri: yapılacaklar (ev_ekle / ev_tik / ev_temizle)
// • Aile Takvimi: yaklaşan etkinlik ve randevular (etkinlik)
// • 0.9.14 Altın Hesabım, FuzulEv: burada değil, tam sayfa açılır (app/altin.tsx, app/fuzulev.tsx → bilesen/Varlik.tsx)
// Veri masaüstünden gelir (orv-telefon.js → OT9.aile); olayları masaüstü OT9.aileOlay uygular, telefonda lib/ekip.ts → katUygula.
import { ReactElement, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { EtkinlikFormu } from '@/bilesen/AileOrtak';
import { AltPencere, Bos, FinansFormu } from '@/bilesen/formlar';
import { Dugme, Hap, Ikon, KartK, s } from '@/bilesen/ortak';
import { bugunIlac, IlacSatiri, SekerSatiri, SporKarti } from '@/bilesen/Saglik';
import { useBugun } from '@/lib/bugun';
import type { Etkinlik, Kisi, Oneri, Ozet } from '@/lib/depo';
import { olayEkle, uid } from '@/lib/depo';
import { useGorunum } from '@/lib/ekip';
import { sekmeGit } from '@/lib/gezinti';
import { AD, duzenler, useRol } from '@/lib/rol';
import { esitleSonra } from '@/lib/senk';
import { R, saydam } from '@/lib/tema';
import { AY, GK, kisaTarih, tarihOf, tl } from '@/lib/zaman';

const GUN = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const GUN_TAM = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const gonder = (tur: string, veri: any) => { olayEkle(tur, veri); esitleSonra(); };
const bugunGun = () => (new Date().getDay() + 6) % 7; // 0 = Pazartesi

/** İşaret kutulu satır (market maddesi, ev işi) */
function Isaret({ ad, alt, on, degis }: { ad: string; alt?: string; on: boolean; degis: () => void }) {
  return (
    <Pressable onPress={degis} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={ad + (alt ? ', ' + alt : '')}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 46, paddingHorizontal: 10, borderRadius: 14, backgroundColor: on ? 'rgba(62,207,90,0.08)' : 'rgba(255,255,255,0.04)', transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: on ? R.yesil : 'rgba(255,255,255,0.3)', backgroundColor: on ? R.yesil : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{on && <Ikon ad="tik" boy={13} renk="#fff" kalin={3.2} />}</View>
      <Text numberOfLines={2} style={{ flex: 1, color: on ? R.yazi2 : R.yazi, fontSize: 14, textDecorationLine: on ? 'line-through' : 'none' }}>{ad}</Text>
      {!!alt && <Text style={[s.sub, { fontSize: 11.5 }]}>{alt}</Text>}
    </Pressable>
  );
}
/** Tek satırlık ekleme kutusu: yaz + Enter ya da + düğmesi */
function Ekle({ ph, ekle, et }: { ph: string; ekle: (t: string) => void; et: string }) {
  const [v, setV] = useState('');
  const git = () => { const t = v.trim(); if (!t) return; ekle(t); setV(''); };
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <View style={[s.giris, { flex: 1, paddingVertical: 4 }]}><TextInput value={v} onChangeText={setV} onSubmitEditing={git} placeholder={ph} placeholderTextColor={R.solukk} returnKeyType="done" blurOnSubmit={false} maxLength={80} accessibilityLabel={et} style={[s.girisY, { paddingVertical: 8 }]} /></View>
      <Pressable onPress={git} accessibilityRole="button" accessibilityLabel={et + ' ekle'} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, backgroundColor: R.ana, alignItems: 'center', justifyContent: 'center', opacity: v.trim() ? 1 : 0.5, transform: [{ scale: pressed ? 0.92 : 1 }] })}><Ikon ad="arti" boy={20} renk="#fff" kalin={2.4} /></Pressable>
    </View>
  );
}
function Secim<T extends string>({ l, v, d }: { l: T[]; v: T; d: (x: T) => void }) {
  return <View style={{ flexDirection: 'row', gap: 6 }}>{l.map((k) => <Pressable key={k} onPress={() => d(k)} accessibilityRole="radio" accessibilityState={{ selected: v === k }} style={{ minHeight: 34, paddingHorizontal: 12, borderRadius: 17, justifyContent: 'center', backgroundColor: v === k ? saydam(R.ana, 0.2) : 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: v === k ? R.ana : 'rgba(255,255,255,0.1)' }}><Text style={{ color: v === k ? '#fff' : '#c9c9cf', fontSize: 12.5, fontWeight: '600' }}>{k}</Text></Pressable>)}</View>;
}
const Alan = ({ et, v, d, ph }: { et: string; v: string; d: (x: string) => void; ph?: string }) => (
  <View style={s.giris}><Text style={s.girisEt}>{et}</Text><TextInput value={v} onChangeText={d} placeholder={ph} placeholderTextColor={R.solukk} style={s.girisY} accessibilityLabel={et} maxLength={200} /></View>
);

// ---------- Bütçe ----------
function Butce({ o }: { o: Ozet }) {
  const [form, setForm] = useState(false), f = o.aile?.fin, bu = f?.bu, once = f?.once;
  const kalan = (bu?.gelir || 0) - (bu?.gider || 0), kat = Object.entries(bu?.kat || {}).sort((a, b) => b[1] - a[1]).slice(0, 5), kmax = kat.length ? kat[0][1] : 1;
  const fark = once && once.gider ? Math.round((((bu?.gider || 0) - once.gider) / once.gider) * 100) : null;
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {([['Gelir', bu?.gelir || 0, '#6be585'], ['Gider', bu?.gider || 0, '#ff8a6b'], ['Kalan', kalan, kalan >= 0 ? R.yazi : '#f4a3a3']] as [string, number, string][]).map(([y, v, r]) => (
          <View key={y} style={{ flex: 1, padding: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', gap: 2 }}><Text style={[s.sub, { fontSize: 11.5 }]}>{y}</Text><Text adjustsFontSizeToFit numberOfLines={1} style={{ color: r, fontSize: 16, fontWeight: '700' }}>{tl(v)}</Text></View>
        ))}
      </View>
      {fark != null && fark !== 0 && <Text style={[s.sub, { color: fark > 0 ? '#f47a7a' : '#6be585' }]}>Gider geçen aya göre {fark > 0 ? '▲' : '▼'} %{Math.abs(fark)}</Text>}
      {kat.length > 0 && <View style={{ gap: 7 }}>
        <Text style={s.sub}>Bu ay en çok harcanan</Text>
        {kat.map(([k, v]) => (
          <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text numberOfLines={1} style={{ width: 82, color: R.yazi, fontSize: 12.5 }}>{k}</Text>
            <View style={{ flex: 1, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.07)' }}><View style={{ width: (v / kmax) * 100 + '%', height: '100%', borderRadius: 4, backgroundColor: '#ff8a6b' }} /></View>
            <Text style={{ width: 74, textAlign: 'right', color: R.yazi, fontSize: 12.5, fontWeight: '600' }}>{tl(v)}</Text>
          </View>
        ))}
      </View>}
      <View style={{ gap: 2 }}>
        <Text style={s.sub}>Son işlemler</Text>
        {(f?.islem || []).slice(0, 6).map((x, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 38, borderBottomWidth: i < 5 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
            <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: R.yazi, fontSize: 13 }}>{x[2] || x[1]}</Text><Text style={[s.sub, { fontSize: 11 }]}>{kisaTarih(x[0])} · {x[1]}</Text></View>
            <Text style={{ color: x[3] ? '#6be585' : R.yazi, fontSize: 13, fontWeight: '700' }}>{x[3] ? '+' : '−'}{tl(x[4])}</Text>
          </View>
        ))}
        {!(f?.islem || []).length && <Text style={s.soluk}>{o.ts ? 'Bu ay ve geçen ay kayıt yok.' : 'Bilgisayarla eşitlenince bütçe burada görünür.'}</Text>}
      </View>
      <Dugme yazi="Gelir / gider ekle" ikon="kaydet" onPress={() => setForm(true)} />
      <AltPencere acik={form} kapat={() => setForm(false)}>{form ? <FinansFormu kapat={() => setForm(false)} /> : null}</AltPencere>
    </>
  );
}

// ---------- Sağlık ----------
function Saglik({ o }: { o: Ozet }) {
  const es = useRol() === 'es', L = bugunIlac(o, useBugun(), es ? 'kubra' : 'cagla');
  return (
    <>
      <Text style={s.sub}>Bugünkü ilaçlar · içtiğinde düğmeyi aç</Text>
      {L.length ? L.map((i, n) => <IlacSatiri key={i.id} o={o} i={i} no={n + 1} />) : <Bos yazi={(o.aile?.ilac || []).length ? 'Bugün için ilaç yok.' : 'İlaç planı boş. Bana Özel › Sağlık’tan ilaç ekleyebilirsin.'} ikon="ilac" />}
      {!es && <SekerSatiri o={o} />}
      {!es && <SporKarti key={'sp' + o.ts} o={o} />}
      <Dugme yazi="İlaç planını düzenle" ikon="ilac" tur="ikinci" onPress={() => sekmeGit(3)} />
    </>
  );
}

// ---------- Menü & Market ----------
function Menu({ o }: { o: Ozet }) {
  const menu = o.aile?.menu || {}, market = o.aile?.market || [], kalan = market.filter((m) => !m.al).length, bg = bugunGun();
  const [duz, setDuz] = useState<null | { k: string; v: string }>(null);
  const yaz = () => { if (!duz) return; gonder('menu_yaz', { k: duz.k, v: duz.v.trim() }); setDuz(null); };
  return (
    <>
      <Text style={s.sub}>Haftalık menü · güne dokunup yaz</Text>
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 6, paddingLeft: 44 }}><Text style={[s.sub, { flex: 1, fontSize: 11 }]}>Öğle</Text><Text style={[s.sub, { flex: 1, fontSize: 11 }]}>Akşam</Text></View>
        {GUN.map((g, i) => (
          <View key={g} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ width: 38, color: i === bg ? R.ana2 : R.yazi2, fontSize: 12.5, fontWeight: i === bg ? '700' : '500' }}>{g}</Text>
            {(['ogle', 'aksam'] as const).map((og) => { const k = i + '-' + og, v = menu[k]; return (
              <Pressable key={og} onPress={() => setDuz({ k, v: v || '' })} accessibilityRole="button" accessibilityLabel={GUN_TAM[i] + ' ' + (og === 'ogle' ? 'öğle' : 'akşam') + ': ' + (v || 'boş')}
                style={({ pressed }) => ({ flex: 1, minHeight: 40, justifyContent: 'center', paddingHorizontal: 9, borderRadius: 11, backgroundColor: v ? 'rgba(253,164,175,0.10)' : 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: i === bg ? saydam(R.ana, 0.45) : 'transparent', transform: [{ scale: pressed ? 0.96 : 1 }] })}>
                <Text numberOfLines={2} style={{ color: v ? R.yazi : R.solukk, fontSize: 12.5 }}>{v || '+'}</Text>
              </Pressable>); })}
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}><Text style={[s.sub, { flex: 1 }]}>Market listesi</Text><Hap yazi={kalan + ' kaldı'} t={kalan ? 'o' : 'n'} /></View>
      {market.length ? market.map((m) => <Isaret key={m.id} ad={m.ad} on={m.al} degis={() => gonder('market_tik', { id: m.id, al: m.al ? 0 : 1 })} />) : <Text style={s.soluk}>Liste boş. Aşağıdan madde ekle; alınca işaretle.</Text>}
      <Ekle ph="Madde ekle (ör. Süt)" et="Market maddesi" ekle={(t) => gonder('market_ekle', { id: 'mk' + uid(), ad: t })} />
      {market.some((m) => m.al) && <Dugme yazi="Alınanları kaldır" tur="ikinci" onPress={() => gonder('market_temizle', {})} />}
      <AltPencere acik={!!duz} kapat={() => setDuz(null)}>
        {duz && <View style={{ gap: 12 }}>
          <Text style={{ color: R.yazi, fontSize: 17, fontWeight: '700' }}>{GUN_TAM[+duz.k[0]]} · {duz.k.endsWith('ogle') ? 'Öğle' : 'Akşam'} menüsü</Text>
          <Alan et="Yemek" v={duz.v} d={(v) => setDuz({ ...duz, v })} ph="ör. Mercimek çorbası" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {!!menu[duz.k] && <Dugme yazi="Boşalt" tur="tehlike" onPress={() => { gonder('menu_yaz', { k: duz.k, v: '' }); setDuz(null); }} />}
            <Dugme yazi="Vazgeç" tur="ikinci" onPress={() => setDuz(null)} stil={{ flex: 1 }} /><Dugme yazi="Kaydet" onPress={yaz} stil={{ flex: 1 }} />
          </View>
        </View>}
      </AltPencere>
    </>
  );
}

// ---------- Satın Alma ----------
const KARAR: Record<Oneri['karar'], [string, 'g' | 'o' | 'n' | 'r']> = { bekliyor: ['Karar bekliyor', 'n'], onay: ['Onaylandı', 'g'], ertele: ['Ertelendi', 'o'], red: ['Reddedildi', 'r'] };
function SatinAlma({ o }: { o: Ozet }) {
  const L = [...(o.aile?.oneri || [])].sort((a, b) => (a.karar === 'bekliyor' ? 0 : 1) - (b.karar === 'bekliyor' ? 0 : 1) || b.ts - a.ts);
  const [form, setForm] = useState(false), [ad, setAd] = useState(''), [fiyat, setFiyat] = useState(''), [alt, setAlt] = useState('');
  const kaydet = () => { if (!ad.trim()) return; gonder('oneri_ekle', { id: 'on' + uid(), ad: ad.trim(), fiyat: fiyat.trim(), alt: alt.trim() }); setAd(''); setFiyat(''); setAlt(''); setForm(false); };
  return (
    <>
      {L.length ? L.map((x) => (
        <View key={x.id} style={{ gap: 8, padding: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1 }}><Text style={{ color: R.yazi, fontSize: 14.5, fontWeight: '600' }}>{x.ad}</Text>{!!x.fiyat && <Text style={s.sub}>{x.fiyat}</Text>}</View>
            <Hap yazi={KARAR[x.karar][0]} t={KARAR[x.karar][1]} />
          </View>
          {!!x.alt && <Text style={{ color: '#d2d2d7', fontSize: 12.5, lineHeight: 18 }}>Nerya: {x.alt}</Text>}
          {!!x.otto && <Text style={{ color: '#d2d2d7', fontSize: 12.5, lineHeight: 18 }}>Otto: {x.otto}</Text>}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['onay', 'ertele', 'red'] as const).map((k) => <Dugme key={k} yazi={k === 'onay' ? 'Onayla' : k === 'ertele' ? 'Ertele' : 'Reddet'} tur={k === 'onay' && x.karar !== 'onay' ? 'ana' : 'ikinci'} kapali={x.karar === k} stil={{ flex: 1, minHeight: 38, paddingHorizontal: 6 }} onPress={() => gonder('oneri_karar', { id: x.id, karar: k })} />)}
          </View>
        </View>
      )) : <Bos yazi="Henüz öneri yok. Almak istediğin bir şeyi kaydet; karar verince Nerya’ya iletilir." ikon="ara" />}
      {form ? <View style={{ gap: 8 }}>
        <Alan et="Ürün" v={ad} d={setAd} ph="ör. Robot süpürge" />
        <Alan et="Fiyat" v={fiyat} d={setFiyat} ph="ör. 15.000 ₺" />
        <Alan et="Not" v={alt} d={setAlt} ph="isteğe bağlı" />
        <View style={{ flexDirection: 'row', gap: 8 }}><Dugme yazi="Vazgeç" tur="ikinci" onPress={() => setForm(false)} stil={{ flex: 1 }} /><Dugme yazi="Kaydet" onPress={kaydet} kapali={!ad.trim()} stil={{ flex: 1 }} /></View>
      </View> : <Dugme yazi="Öneri ekle" ikon="arti" tur="ikinci" onPress={() => setForm(true)} />}
    </>
  );
}

// ---------- Ev İşleri ----------
function EvIsleri({ o }: { o: Ozet }) {
  const L = o.aile?.ev || [], kalan = L.filter((m) => !m.bitti).length, [kim, setKim] = useState<'Ortak' | 'Çağlar' | 'Kübra'>('Ortak');
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={[s.sub, { flex: 1 }]}>Yapılacaklar</Text><Hap yazi={kalan + ' açık'} t={kalan ? 'o' : 'g'} /></View>
      {L.length ? L.map((m) => <Isaret key={m.id} ad={m.ad} alt={m.kim} on={m.bitti} degis={() => gonder('ev_tik', { id: m.id, bitti: m.bitti ? 0 : 1 })} />) : <Text style={s.soluk}>Yapılacak yok. Aşağıdan ev işi ekle.</Text>}
      <Text style={s.sub}>Kim yapacak?</Text>
      <Secim l={['Ortak', 'Çağlar', 'Kübra']} v={kim} d={setKim} />
      <Ekle ph="Yeni ev işi (ör. Çamaşır)" et="Ev işi" ekle={(t) => gonder('ev_ekle', { id: 'ev' + uid(), ad: t, kim })} />
      {L.some((m) => m.bitti) && <Dugme yazi="Bitenleri kaldır" tur="ikinci" onPress={() => gonder('ev_temizle', {})} />}
    </>
  );
}

// ---------- Aile Takvimi ----------
function Takvim({ o }: { o: Ozet }) {
  const rol = useRol(), [pen, setPen] = useState<null | { e?: Etkinlik; randevu?: boolean; n: number }>(null);
  const b = new Date(); b.setHours(0, 0, 0, 0);
  const L = (o.aile?.ortak?.takvim || []).filter((e) => tarihOf(e.tarih) >= b).sort((x, y) => (x.tarih + (x.saat || '')).localeCompare(y.tarih + (y.saat || ''))).slice(0, 12);
  return (
    <>
      {L.length ? L.map((e) => { const d = tarihOf(e.tarih), sahip = duzenler(rol, e.kim), rd = e.tur === 'randevu'; return (
        <Pressable key={e.id} disabled={!sahip} onPress={() => setPen({ e, n: Date.now() })} accessibilityRole={sahip ? 'button' : undefined} accessibilityLabel={e.ad + ', ' + d.getDate() + ' ' + AY[d.getMonth()] + (sahip ? ', düzelt' : '')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 50, paddingHorizontal: 10, borderRadius: 14, backgroundColor: rd ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.04)' }}>
          <View style={{ width: 44, alignItems: 'center' }}><Text style={{ color: R.yazi, fontSize: 15, fontWeight: '700' }}>{d.getDate()}</Text><Text style={[s.sub, { fontSize: 10 }]}>{AY[d.getMonth()].slice(0, 3)} {GK[d.getDay()]}</Text></View>
          <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{(rd ? 'Randevu · ' : '') + e.ad}</Text><Text numberOfLines={1} style={[s.sub, { fontSize: 11.5 }]}>{[e.saat, e.yer, e.kisi === 'aile' ? 'Aile' : AD[(e.kisi || e.kim) as Kisi]].filter(Boolean).join(' · ')}</Text></View>
          {sahip && <Ikon ad="kalem" boy={14} renk={R.yazi2} kalin={2} />}
        </Pressable>); }) : <Bos yazi="Yaklaşan etkinlik ya da randevu yok." ikon="gun" />}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Dugme yazi="Etkinlik" ikon="arti" onPress={() => setPen({ n: Date.now() })} stil={{ flex: 1 }} />
        <Dugme yazi="Randevu" ikon="arti" tur="ikinci" onPress={() => setPen({ randevu: true, n: Date.now() })} stil={{ flex: 1 }} />
      </View>
      <Dugme yazi="İzin girişi" ikon="izin" tur="ikinci" onPress={() => sekmeGit(2, { kayit: 'izin' })} />
      <AltPencere acik={!!pen} kapat={() => setPen(null)}>{pen && <EtkinlikFormu key={pen.n} rol={rol} e={pen.e} randevu0={pen.randevu} kapat={() => setPen(null)} />}</AltPencere>
    </>
  );
}

const PANEL: Record<string, [string, (p: { o: Ozet }) => ReactElement]> = {
  otto: ['BÜTÇE', Butce], iris: ['SAĞLIK', Saglik], marco: ['MENÜ & MARKET', Menu], nerya: ['SATIN ALMA', SatinAlma], mia: ['EV İŞLERİ', EvIsleri], remy: ['AİLE TAKVİMİ', Takvim],
};
/** Seçili kategorinin içerik kartı */
export function KatPanel({ id }: { id: string }) {
  const o = useGorunum(), p = PANEL[id];
  if (!p) return null;
  const [baslik, Govde] = p;
  return <KartK ad={'aileKat-' + id} baslik={baslik}><Govde o={o} /></KartK>;
}
