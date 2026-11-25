// Bana Özel (0.9.0): Sağlık özeti (şeker 7 gün, ilaç uyumu), İLAÇLARIM (ekle/düzelt/sil, stok uyarısı, aylık PDF),
// Hobi: takip edilen oyunlar ve YENİ ÇIKACAK OYUNLAR (Steam; takip et → kalan gün, zil → çıkış günü hatırlatması).
// İlaç olayları: ilac_kaydet / ilac_sil (masaüstü orv-telefon.js). Oyun takibi yalnız bu telefonda (lib/dis).
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Polyline, Rect } from 'react-native-svg';
import { AltPencere, Bos } from '@/bilesen/formlar';
import { Bolumler, Dugme, Hap, Ikon, KartK, SayfaBasligi, s } from '@/bilesen/ortak';
import { PdfDugme } from '@/bilesen/Pdf';
import { alindiMi, IlacSatiri, SEKER_RENK, SekerSatiri } from '@/bilesen/Saglik';
import { Ilac, olayEkle, Ozet, uid } from '@/lib/depo';
import { kalanGun, oyunYenile, takipDegis, useDis, useDisYenile, zilDegis } from '@/lib/dis';
import { useBugun } from '@/lib/bugun';
import { useGorunum } from '@/lib/ekip';
import { kalanStok } from '@/lib/pdf';
import { AD, benKimim, ilacTur, Rol, useRol } from '@/lib/rol';
import { esitleSonra } from '@/lib/senk';
import { R, saydam } from '@/lib/tema';
import { gunEkle, tamAnahtar } from '@/lib/zaman';

const TEKRAR: [Ilac['tekrar'], string][] = [['gun', 'Her gün'], ['haftaici', 'Hafta içi'], ['haftasonu', 'Hafta sonu']];
const ACTOK: [string, string][] = [['', 'Fark etmez'], ['ac', 'Aç karnına'], ['tok', 'Tok karnına']];
const gecerli = (t: string, d: Date) => (t === 'haftaici' ? d.getDay() % 6 !== 0 : t === 'haftasonu' ? d.getDay() % 6 === 0 : true);

function saglikOzet(o: Ozet, liste: Ilac[]) {
  const b = new Date(), sk: (number | null)[] = [], a = o.aile;
  let ger = 0, al = 0;
  for (let i = 6; i >= 0; i--) {
    const d = gunEkle(b, -i), k = tamAnahtar(d); sk.push(a?.seker[k] ?? null);
    if (i === 0) continue; // bugün henüz bitmedi
    liste.forEach((m) => { if (m.eklendi && new Date(m.eklendi).setHours(0, 0, 0, 0) > d.getTime()) return; if (!gecerli(m.tekrar, d)) return; ger++; if (a?.al[k + '|' + m.id]) al++; });
  }
  const v = sk.filter((x): x is number => x != null);
  return { sk, ort: v.length ? Math.round(v.reduce((x, y) => x + y, 0) / v.length) : null, olcum: v.length, uyum: ger ? Math.round((al / ger) * 100) : null, al, ger };
}

function SekerMini({ sk }: { sk: (number | null)[] }) {
  const W = 132, H = 44, v = sk.filter((x): x is number => x != null), mx = Math.max(150, ...v), mn = Math.min(70, ...v);
  const px = (i: number) => 6 + (i * (W - 12)) / 6, py = (x: number) => 4 + ((mx - x) / (mx - mn)) * (H - 8);
  const nk = sk.map((x, i) => (x == null ? null : `${px(i)},${py(x)}`)).filter(Boolean).join(' ');
  return (
    <Svg width={W} height={H}>
      <Rect x={0} y={py(130)} width={W} height={py(80) - py(130)} fill="rgba(62,207,90,0.10)" rx={4} />
      {v.length > 1 && <Polyline points={nk} fill="none" stroke={SEKER_RENK} strokeWidth={2} strokeLinejoin="round" />}
      {sk.map((x, i) => (x == null ? null : <Circle key={i} cx={px(i)} cy={py(x)} r={i === 6 ? 3.5 : 2.5} fill={x > 130 || x < 80 ? '#f5a524' : SEKER_RENK} />))}
    </Svg>
  );
}

function IlacFormu({ i, kapat, rol }: { i: Ilac | null; kapat: () => void; rol: Rol }) {
  const [ad, setAd] = useState(i?.ad || ''), [miktar, setMiktar] = useState(i?.miktar || '1 tablet'), [saat, setSaat] = useState(i?.saat || '08:00');
  const [tekrar, setTekrar] = useState<Ilac['tekrar']>(i?.tekrar || 'gun'), [actok, setActok] = useState(i?.actok || ''), [not, setNot] = useState(i?.not || '');
  const ks = i ? kalanStok(i) : null, [stok, setStok] = useState(ks == null ? '' : String(ks)), [hata, setHata] = useState(''), [silOnay, setSilOnay] = useState(false);
  const kaydet = () => {
    if (!ad.trim()) return setHata('İlaç adını yaz');
    const m = saat.trim().match(/^(\d{1,2})[:.](\d{2})$/); if (!m || +m[1] > 23 || +m[2] > 59) return setHata('Saati 08:30 gibi yaz');
    const st = stok.trim() === '' ? null : parseInt(stok, 10); if (st != null && (isNaN(st) || st < 0)) return setHata('Stok bir sayı olmalı');
    const v: any = { id: i?.id || 'm' + uid(), ad: ad.trim(), miktar: miktar.trim(), saat: m[1].padStart(2, '0') + ':' + m[2], tekrar, actok, not: not.trim() };
    if (st != null && st !== ks) v.stok = st; // stok yalnız değiştiyse gönderilir (stokTs yenilenir)
    olayEkle(ilacTur(rol, 'ilac_kaydet'), v); esitleSonra(); kapat();
  };
  const sil = () => { if (!i) return; if (!silOnay) return setSilOnay(true); olayEkle(ilacTur(rol, 'ilac_sil'), { id: i.id }); esitleSonra(); kapat(); };
  const Alan = ({ et, v, d, ph, k, w }: { et: string; v: string; d: (x: string) => void; ph?: string; k?: 'number-pad' | 'numbers-and-punctuation'; w?: number }) => (
    <View style={[s.giris, w ? { width: w } : { flex: 1 }]}><Text style={s.girisEt}>{et}</Text><TextInput value={v} onChangeText={d} placeholder={ph} placeholderTextColor={R.solukk} keyboardType={k} style={s.girisY} /></View>
  );
  const Cipler = ({ l, v, d }: { l: [string, string][]; v: string; d: (x: any) => void }) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {l.map(([k, y]) => <Pressable key={k} onPress={() => d(k)} accessibilityRole="radio" accessibilityState={{ selected: v === k }} style={{ height: 34, paddingHorizontal: 12, borderRadius: 17, justifyContent: 'center', backgroundColor: v === k ? saydam(R.ana, 0.2) : 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: v === k ? R.ana : 'rgba(255,255,255,0.1)' }}><Text style={{ color: v === k ? '#fff' : '#c9c9cf', fontSize: 12.5, fontWeight: '600' }}>{y}</Text></Pressable>)}
    </View>
  );
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: R.yazi, fontSize: 17, fontWeight: '700' }}>{i ? 'İlacı düzelt' : 'İlaç ekle'}</Text>
      {Alan({ et: 'İlaç adı', v: ad, d: setAd, ph: 'Vitamin D' })}
      <View style={{ flexDirection: 'row', gap: 8 }}>{Alan({ et: 'Doz', v: miktar, d: setMiktar, ph: '1 tablet' })}{Alan({ et: 'Saat', v: saat, d: setSaat, ph: '08:30', k: 'numbers-and-punctuation', w: 96 })}</View>
      {Cipler({ l: TEKRAR, v: tekrar, d: setTekrar })}
      {Cipler({ l: ACTOK, v: actok, d: setActok })}
      <View style={{ flexDirection: 'row', gap: 8 }}>{Alan({ et: 'Stok (kaç günlük)', v: stok, d: (x) => setStok(x.replace(/\D/g, '')), ph: 'boş = takip yok', k: 'number-pad' })}{Alan({ et: 'Not', v: not, d: setNot, ph: 'isteğe bağlı' })}</View>
      <Text style={[s.sub, { fontSize: 11.5 }]}>Stok 7 gün ve altına inince Bana Özel’de uyarı çıkar; her gün 1 azalır.</Text>
      {!!hata && <Text style={{ color: '#f4a3a3', fontSize: 13 }}>{hata}</Text>}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {i && <Dugme yazi={silOnay ? 'Emin misin? Sil' : 'Sil'} tur="tehlike" onPress={sil} />}
        <Dugme yazi="Vazgeç" tur="ikinci" onPress={kapat} stil={{ flex: 1 }} />
        <Dugme yazi={i ? 'Güncelle' : 'Ekle'} onPress={kaydet} stil={{ flex: 1 }} />
      </View>
    </View>
  );
}

function OyunKarti({ x }: { x: { id: string; ad: string; tur: string; tarih: string; ts: number | null; gorsel: string } }) {
  const t = useDis((d) => d.tercih.takip[x.id]), kg = kalanGun(x.ts);
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 8, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)' }}>
      {x.gorsel ? <Image source={{ uri: x.gorsel }} style={{ width: 92, height: 43, borderRadius: 8 }} contentFit="cover" accessibilityIgnoresInvertColors /> : <View style={{ width: 92, height: 43, borderRadius: 8, backgroundColor: '#2e2e33', alignItems: 'center', justifyContent: 'center' }}><Ikon ad="oyun" boy={20} /></View>}
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={{ color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{x.ad}</Text>
        <Text numberOfLines={1} style={[s.sub, { fontSize: 11 }]}>{x.tarih}{x.tur ? ' · ' + x.tur : ''}</Text>
        {t && <Text style={{ color: R.ana2, fontSize: 11.5, fontWeight: '700' }}>{kg == null ? 'Takipte' : kg === 0 ? 'Bugün çıkıyor' : kg + ' gün kaldı'}</Text>}
      </View>
      {t && <Pressable onPress={() => zilDegis(x.id)} accessibilityRole="switch" accessibilityState={{ checked: t.zil }} accessibilityLabel="Çıkış günü hatırlatması" hitSlop={6} style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: t.zil ? saydam(R.ana, 0.2) : 'rgba(255,255,255,0.06)' }}>
        <Ikon ad={t.zil ? 'zil' : 'sessiz'} boy={16} renk={t.zil ? R.ana2 : R.yazi2} kalin={2.1} />
      </Pressable>}
      <Pressable onPress={() => takipDegis(x)} accessibilityRole="button" accessibilityState={{ selected: !!t }} style={{ height: 32, paddingHorizontal: 11, borderRadius: 16, justifyContent: 'center', backgroundColor: t ? 'rgba(255,255,255,0.06)' : R.ana }}>
        <Text style={{ color: t ? R.yazi2 : '#fff', fontSize: 12, fontWeight: '700' }}>{t ? 'Bırak' : 'Takip et'}</Text>
      </Pressable>
    </View>
  );
}

export function BanaOzel() {
  const o = useGorunum(); useDisYenile(['oyun']);
  const oyun = useDis((d) => d.oyun), takip = useDis((d) => d.tercih.takip);
  const [form, setForm] = useState<{ i: Ilac | null } | null>(null), [n, setN] = useState(0), [sekme, setSekme] = useState<'ben' | 'esim'>('ben');
  const rol = useRol(), ben = benKimim(rol), es = rol === 'es', tum = o.aile?.ilac || [], bugun = useBugun(); // bugun: 00:00'da ekran yeni güne geçer
  const ilac = tum.filter((i) => (i.kim || 'cagla') === ben), diger = tum.filter((i) => (i.kim || 'cagla') !== ben), digerAd = es ? AD.cagla : AD.kubra;
  const so = saglikOzet(o, ilac);
  const azalan = ilac.map((i) => ({ i, k: kalanStok(i) })).filter((x) => x.k != null && x.k <= 7);
  const takipL = Object.entries(takip).map(([id, t]) => ({ id, ...t, kg: kalanGun(t.ts) })).sort((a, b) => (a.kg ?? 9999) - (b.kg ?? 9999));
  // 0.9.9: Ben sekmesinde yalnız kendi veriler; Eşim sekmesinde eşin verileri gösterge olarak.
  // Eş profilinde Çağlar'ın ilaçları hiç gelmez (masaüstü OAI.esOzet); Eşim sekmesinde yalnız şeker göstergesi görünür. Oyunlar yalnız ana profilde.
  const sekerKutu = (baslik: string) => (
    <View style={[s.cam, { flex: 1, gap: 6, padding: 14 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ikon ad="damla" boy={15} renk={SEKER_RENK} kalin={2.2} /><Text style={[s.sub, { fontSize: 12 }]}>{baslik}</Text></View>
      <Text style={{ color: R.yazi, fontSize: 22, fontWeight: '700' }}>{so.ort ?? '—'}<Text style={{ fontSize: 11.5, color: R.yazi2, fontWeight: '500' }}> mg/dL ort.</Text></Text>
      <SekerMini sk={so.sk} />
      <Text style={[s.sub, { fontSize: 11 }]}>{so.olcum} ölçüm · hedef 80–130</Text>
    </View>
  );
  return (
    <View style={{ gap: 14 }}>
      <SayfaBasligi ust={es ? 'Sağlık' : 'Sağlık · hobi'} baslik="Bana Özel" />
      <Bolumler secenek={[['ben', 'Ben'], ['esim', 'Eşim']]} deger={sekme} sec={setSekme} />

      {sekme === 'ben' && <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {!es && sekerKutu('Şeker · 7 gün')}
        <View style={[s.cam, { flex: 1, gap: 6, padding: 14 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ikon ad="ilac" boy={15} renk={R.yesil} kalin={2.2} /><Text style={[s.sub, { fontSize: 12 }]}>İlaç uyumu · 6 gün</Text></View>
          <Text style={{ color: R.yazi, fontSize: 22, fontWeight: '700' }}>{so.uyum == null ? '—' : '%' + so.uyum}</Text>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}><View style={{ width: (so.uyum || 0) + '%', height: '100%', backgroundColor: R.yesil, borderRadius: 4 }} /></View>
          <Text style={[s.sub, { fontSize: 11 }]}>{so.al} / {so.ger} doz alındı</Text>
          {azalan.length > 0 && <Hap yazi={azalan.length + ' stok azaldı'} t="o" />}
        </View>
      </View>

      <KartK ad="ilaclarim" baslik="İLAÇLARIM" ozet={ilac.length + ' ilaç' + (azalan.length ? ' · ' + azalan.length + ' stok uyarısı' : '')} sag={es ? undefined : <PdfDugme tur="ilac" yazi="PDF" />}>
        {azalan.map(({ i, k }) => (
          <View key={'u' + i.id} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: 'rgba(245,165,36,0.12)' }}>
            <Ikon ad="bilgi" boy={16} renk="#f7bd55" kalin={2.1} /><Text style={{ flex: 1, color: '#f7bd55', fontSize: 12.5 }}>{i.ad} {k === 0 ? 'bitti' : 'yaklaşık ' + k + ' gün sonra bitiyor'} · stok ekle</Text>
          </View>
        ))}
        {ilac.length ? ilac.slice().sort((a, b) => a.saat.localeCompare(b.saat)).map((i, n) => { const k = kalanStok(i); return (
          <IlacSatiri key={i.id} o={o} i={i} no={n + 1} ek={k != null ? 'stok ' + k + ' gün' : undefined} duzenle={() => { setForm({ i }); setN((x) => x + 1); }} />); }) : <Bos yazi={o.ts ? (es ? 'Henüz ilacın yok. Ekle ile başla; günlük işaretlerin Anasayfa’da görünür.' : 'Kayıtlı ilaç yok. Ekle ile başla; masaüstündeki İlaç Planı ile eşitlenir.') : 'Masaüstü ile eşitlenince ilaç planın burada görünür.'} ikon="ilac" />}
        <Dugme yazi="İlaç ekle" ikon="arti" tur="ikinci" onPress={() => { setForm({ i: null }); setN((x) => x + 1); }} />
        {!es && <SekerSatiri key={'sk' + o.ts} o={o} />}
      </KartK>

      {!es && <KartK ad="hobi" baslik="TAKİP ETTİĞİM OYUNLAR" ozet={takipL.length + ' oyun'}>
        {takipL.length ? takipL.map((t) => (
          <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <Ikon ad="oyun" boy={18} renk={R.ana2} kalin={2} />
            <Text numberOfLines={1} style={{ flex: 1, color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{t.ad}</Text>
            {t.zil && <Ikon ad="zil" boy={14} renk={R.ana2} kalin={2.2} />}
            <Text style={{ color: t.kg != null && t.kg <= 7 ? R.ana2 : R.yazi2, fontSize: 12.5, fontWeight: '700' }}>{t.kg == null ? 'tarih yok' : t.kg === 0 ? 'bugün' : t.kg + ' gün'}</Text>
          </View>
        )) : <Text style={s.soluk}>Henüz takip ettiğin oyun yok. Aşağıdan Takip et’e dokun; çıkışa kalan gün burada sayılır.</Text>}
      </KartK>}

      {!es && <KartK ad="oyunlar" baslik="YENİ ÇIKACAK OYUNLAR" ozet={oyun.liste.length + ' oyun · Steam'} sag={<Pressable onPress={() => oyunYenile(true)} accessibilityRole="button" accessibilityLabel="Listeyi yenile" hitSlop={6} style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' }}><Ikon ad="yenile" boy={16} renk={R.yazi} kalin={2.1} /></Pressable>}>
        {oyun.liste.length ? oyun.liste.map((x) => <OyunKarti key={x.id} x={x} />)
          : oyun.hata ? <Text style={{ color: '#f4a3a3', fontSize: 13 }}>{oyun.hata}</Text> : <ActivityIndicator color={R.ana2} />}
        {!!oyun.ts && <Text style={[s.sub, { fontSize: 11 }]}>Steam “popüler, yakında” listesi · {new Date(oyun.ts).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} güncellendi</Text>}
      </KartK>}
      </>}

      {sekme === 'esim' && (es ? <>
        <View style={{ flexDirection: 'row' }}>{sekerKutu(AD.cagla + ' · şeker · 7 gün')}</View>
        <Text style={[s.sub, { fontSize: 11.5 }]}>Yalnız görüntülenir; şekeri {AD.cagla} kendi telefonundan yazar.</Text>
      </> : <KartK ad="digerIlac" baslik={digerAd.toLocaleUpperCase('tr') + ' · İLAÇLAR'} ozet={diger.length + ' ilaç · ' + diger.filter((i) => alindiMi(o, i, bugun)).length + ' bugün alındı'}>
        {diger.slice().sort((a, b) => a.saat.localeCompare(b.saat)).map((i) => { const ok = alindiMi(o, i, bugun); return (
          <View key={i.id} accessible accessibilityLabel={i.ad + ' ' + i.saat + (ok ? ', bugün alındı' : '')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50, paddingHorizontal: 12, borderRadius: 16, backgroundColor: ok ? 'rgba(62,207,90,0.08)' : 'rgba(255,255,255,0.04)' }}>
            <Ikon ad="ilac" boy={17} renk={ok ? R.yesil : R.yazi2} kalin={2.1} />
            <View style={{ flex: 1, gap: 1 }}><Text style={{ color: R.yazi, fontSize: 14, fontWeight: '600' }}>{i.ad}</Text><Text style={s.sub}>{[i.miktar, i.saat, TEKRAR.find((t) => t[0] === i.tekrar)?.[1]].filter(Boolean).join(' · ')}</Text></View>
            <Text style={{ color: ok ? R.yesil : R.yazi2, fontSize: 12.5, fontWeight: '600' }}>{ok ? 'Alındı' : 'Bekliyor'}</Text>
          </View>); })}
        {!diger.length && <Text style={s.soluk}>{digerAd} için kayıtlı ilaç yok.</Text>}
        <Text style={[s.sub, { fontSize: 11.5 }]}>Yalnız görüntülenir; bu ilaçları {digerAd} ekler ve işaretler.</Text>
      </KartK>)}

      <AltPencere acik={!!form} kapat={() => setForm(null)}>{form && <IlacFormu key={n} i={form.i} rol={rol} kapat={() => setForm(null)} />}</AltPencere>
    </View>
  );
}
