// Anasayfa (0.9.0): İş günü göstergesi (hafta günü · ayın haftası · ay dakikası), bu ay gelir–gider (kalan bakiye çizgisi /
// kategoriler, geçen aya göre uyarı), bugünkü görevler (2), günlük ilaç takibi ve sabah açlık şekeri.
// Kaynak: masaüstü özeti (o.gun, o.aile, o.ekip.gorev) + telefondaki bekleyen olaylar.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import { Bos } from '@/bilesen/formlar';
import { Hap, Ikon, KartK, SayfaBasligi, s } from '@/bilesen/ortak';
import { bugunIlac, alindiMi, IlacSatiri, SekerSatiri } from '@/bilesen/Saglik';
import { useBugun } from '@/lib/bugun';
import type { ButceAy, Ozet } from '@/lib/depo';
import { KISA } from '@/lib/ekipMeta';
import { SEKME_GOREV, sekmeGit } from '@/lib/gezinti';
import { bugunYazi, useEkip } from '@/lib/kullan';
import { IZIN_AD } from '@/ekran/IzinGirisi';
import { AD, useRol } from '@/lib/rol';
import { R, saydam } from '@/lib/tema';
import { AY, ayaGore, ayin, ayinHaftalari, GK, gunAnahtari, gunEkle, haftaBasi, kisaTarih, tarihOf, tl } from '@/lib/zaman';

const Tumu = ({ git, yazi = 'Tümü' }: { git: () => void; yazi?: string }) => (
  <Pressable onPress={git} accessibilityRole="button" hitSlop={4} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: saydam(R.ana, 0.16), justifyContent: 'center' }}><Text style={{ color: R.ana2, fontSize: 12, fontWeight: '600' }}>{yazi}</Text></Pressable>
);

/** Küçük ilerleme halkası */
function Halka({ oran, renk, boy = 58 }: { oran: number; renk: string; boy?: number }) {
  const r = boy / 2 - 5, C = 2 * Math.PI * r;
  return (
    <Svg width={boy} height={boy} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={boy / 2} cy={boy / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
      {oran > 0 && <Circle cx={boy / 2} cy={boy / 2} r={r} fill="none" stroke={renk} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${Math.max(0.01, Math.min(1, oran)) * C} ${C}`} />}
    </Svg>
  );
}
function Olcu({ ust, deger, alt, oran, renk }: { ust: string; deger: string; alt: string; oran: number; renk: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 6 }} accessible accessibilityLabel={ust + ' ' + deger + ' ' + alt}>
      <View style={{ width: 58, height: 58 }}>
        <Halka oran={oran} renk={renk} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: R.yazi, fontSize: 14, fontWeight: '700' }}>{deger}</Text></View>
      </View>
      <Text style={{ color: R.yazi, fontSize: 12.5, fontWeight: '600', textAlign: 'center' }}>{ust}</Text>
      <Text style={[s.sub, { fontSize: 11, textAlign: 'center' }]}>{alt}</Text>
    </View>
  );
}

function isGunuOlcu(o: Ozet) {
  const b = new Date(), bk = gunAnahtari(b), hb = haftaBasi(b);
  // 1) Bu hafta: dolu gün / iş günü (izin günleri sayılmaz)
  let dolu = 0, isg = 0;
  [0, 1, 2, 3, 4].forEach((i) => { const g = o.gun[gunAnahtari(gunEkle(hb, i))]; if (g?.D) return; if (!g || g.L) isg++; if (g && g.L && g.T >= g.L + (g.OT || 0)) dolu++; });
  // 2) Ayın kaçıncı haftası
  const hl = ayinHaftalari(b), hi = Math.max(1, hl.findIndex((h) => h.getTime() === hb.getTime()) + 1);
  // 3) Ay: girilen dk / bugüne kadarki iş süresi
  let girilen = 0, toplam = 0, eksik = 0;
  for (let d = 1; d <= b.getDate(); d++) { const k = gunAnahtari(new Date(b.getFullYear(), b.getMonth(), d)), g = o.gun[k]; if (!g || g.D) continue; girilen += g.T || 0; toplam += (g.L || 0) + (g.OT || 0); if (k !== bk && g.L && (g.T || 0) < g.L) eksik++; }
  const bg = o.gun[bk];
  return { dolu, isg: isg || 5, hi, hn: hl.length, girilen, toplam, eksik, bg };
}

/** Kalan bakiye çizgisi: ay başı gelir, her hafta gider düşülür. Kesikli çizgi geçen ay. */
function BakiyeCizgi({ bu, once }: { bu: ButceAy; once: ButceAy }) {
  const [W, setW] = useState(0), H = 120;
  const birik = (x: ButceAy) => { const r = [x.gelir]; x.hc.forEach((g) => r.push(r[r.length - 1] - g)); return r; };
  const hafta = Math.min(5, Math.ceil(new Date().getDate() / 7)), KB = birik(bu).slice(0, hafta + 1), KO = once.gelir || once.gider ? birik(once) : null;
  const hepsi = [...KB, ...(KO || []), 0], mx = Math.max(...hepsi) || 1, mn = Math.min(...hepsi);
  const px = (i: number) => 8 + (i * (W - 16)) / 5, py = (v: number) => 14 + (1 - (v - mn) / (mx - mn || 1)) * (H - 28);
  const nk = (l: number[]) => l.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: H + 18 }}>
      {W > 0 && <Svg width={W} height={H}>
        <Line x1={0} x2={W} y1={py(0)} y2={py(0)} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 4" />
        <Path d={`M${px(0)} ${py(Math.max(0, mn))} ${KB.map((v, i) => `L${px(i)} ${py(v)}`).join(' ')} L${px(KB.length - 1)} ${py(Math.max(0, mn))} Z`} fill={saydam(R.ana, 0.14)} />
        {KO && <Polyline points={nk(KO)} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="5 4" />}
        <Polyline points={nk(KB)} fill="none" stroke={R.ana} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {KB.map((v, i) => <Circle key={i} cx={px(i)} cy={py(v)} r={i === KB.length - 1 ? 4.5 : 3} fill={i === KB.length - 1 ? R.ana2 : R.ana} stroke="#1c1c1f" strokeWidth={1.5} />)}
      </Svg>}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {['Başı', '1.h', '2.h', '3.h', '4.h', 'Sonu'].map((x, i) => <Text key={x} style={[s.sub, { fontSize: 10.5, color: i === hafta ? R.ana2 : R.yazi2 }]}>{x}</Text>)}
      </View>
    </View>
  );
}

function ButceKart({ o }: { o: Ozet }) {
  const [gor, setGor] = useState<'hafta' | 'kat'>('hafta');
  const f = o.aile?.fin, bu = f?.bu, once = f?.once;
  if (!bu || (!bu.gelir && !bu.gider && !once?.gider)) return (
    <KartK ad="butce" baslik="BU AY GELİR · GİDER" ozet="kayıt yok" sag={<Tumu git={() => sekmeGit(1)} yazi="Ailem" />}>
      <Bos yazi={o.ts ? 'Bu ay gelir ya da gider kaydı yok. Masaüstünde Ailem › Finans’a girilen kayıtlar burada görünür.' : 'Masaüstü Orvane ile eşitlenince bütçe burada görünür.'} ikon="grafik" />
    </KartK>
  );
  const kalan = bu.gelir - bu.gider, ay = AY[new Date().getMonth()], onAd = AY[(new Date().getMonth() + 11) % 12];
  const kat = Object.entries(bu.kat).sort((a, b) => b[1] - a[1]), kmax = kat.length ? kat[0][1] : 1;
  // Uyarı: geçen aya göre en çok artan kategori (sınır yok; kıyas geçen ay)
  const artis = kat.map(([k, v]) => [k, v, once?.kat[k] || 0] as [string, number, number]).filter((x) => x[2] > 0 && x[1] > x[2] * 1.1).sort((a, b) => b[1] - b[2] - (a[1] - a[2]))[0];
  const gun = new Date().getDate(), onceAyniGun = once ? once.hc.slice(0, Math.ceil(gun / 7)).reduce((a, b) => a + b, 0) : 0;
  return (
    <KartK ad="butce" baslik="BU AY GELİR · GİDER" ozet={'Kalan ' + tl(kalan)} sag={<Tumu git={() => sekmeGit(1)} yazi="Ailem" />}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[['Gelir', bu.gelir, R.yesil], ['Gider', bu.gider, '#f4a3a3'], ['Kalan', kalan, kalan >= 0 ? R.yazi : '#f4a3a3']].map(([y, v, r]) => (
          <View key={y as string} style={{ flex: 1, padding: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', gap: 2 }}>
            <Text style={[s.sub, { fontSize: 11.5 }]}>{y as string}</Text>
            <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: r as string, fontSize: 17, fontWeight: '700' }}>{tl(v as number)}</Text>
          </View>
        ))}
      </View>
      <View style={[s.seg, { height: 36 }]} accessibilityRole="tablist">
        {([['hafta', 'Kalan bakiye'], ['kat', 'Kategori']] as const).map(([k, y]) => (
          <Pressable key={k} onPress={() => setGor(k)} accessibilityRole="tab" accessibilityState={{ selected: gor === k }} style={[s.segb, gor === k && { backgroundColor: R.ana }]}>
            <Text style={{ color: gor === k ? '#fff' : '#cfcfd4', fontSize: 13, fontWeight: '600' }}>{y}</Text>
          </Pressable>
        ))}
      </View>
      {gor === 'hafta' ? <>
        <BakiyeCizgi bu={bu} once={once || bu} />
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: R.ana }} /><Text style={s.sub}>{ay}: gelir − haftalık gider</Text></View>
          {!!once?.gider && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 14, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.45)' }} /><Text style={s.sub}>{onAd}</Text></View>}
        </View>
      </> : (
        <View style={{ gap: 8 }}>
          {kat.slice(0, 6).map(([k, v]) => { const p = once?.kat[k] || 0, up = p && v > p; return (
            <View key={k} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ flex: 1, color: R.yazi, fontSize: 13 }}>{k}</Text>
                {!!p && <Text style={{ color: up ? '#f4a3a3' : '#6be585', fontSize: 11.5, fontWeight: '700' }}>{up ? '▲' : '▼'} %{Math.abs(Math.round(((v - p) / p) * 100))}</Text>}
                <Text style={{ color: R.yazi, fontSize: 13, fontWeight: '600' }}>{tl(v)}</Text>
              </View>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)' }}><View style={{ width: (v / kmax) * 100 + '%', height: '100%', borderRadius: 3, backgroundColor: up ? R.ana : saydam(R.ana2, 0.7) }} /></View>
            </View>); })}
          {!kat.length && <Text style={s.soluk}>Bu ay gider yok.</Text>}
        </View>
      )}
      {artis ? (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: 'rgba(245,165,36,0.12)' }}>
          <Ikon ad="bilgi" boy={16} renk="#f7bd55" kalin={2.1} />
          <Text style={{ flex: 1, color: '#f7bd55', fontSize: 12.5 }}>{artis[0]} {ayaGore(onAd)} göre ▲ %{Math.round(((artis[1] - artis[2]) / artis[2]) * 100)} ({tl(artis[1] - artis[2])} fazla)</Text>
        </View>
      ) : !!onceAyniGun && bu.gider < onceAyniGun ? <Text style={{ color: '#9fd8b8', fontSize: 12.5 }}>Harcama {ayin(onAd)} aynı dönemine göre daha düşük.</Text> : null}
    </KartK>
  );
}

// 0.9.9: Eş profilinde Anasayfa üst kartı (BU HAFTA) kaldırıldı; aile takvimi Ailem sekmesinde.

export function Anasayfa() {
  const { o, hepsi, cevrim, senk, pasif } = useEkip(), es = useRol() === 'es';
  const g = isGunuOlcu(o), bH = (g.bg?.L || 0) + (g.bg?.OT || 0);
  const acik = o.ekip.gorev.filter((x) => x.durum !== 'bitti');
  const gorevler = acik.slice().sort((a, b) => Number(b.onc === 'acil') - Number(a.onc === 'acil') || b.ts - a.ts).slice(0, 2);
  const bugun = useBugun(), ilac = bugunIlac(o, bugun, es ? 'kubra' : 'cagla'), alinan = ilac.filter((i) => alindiMi(o, i, bugun)).length; // 00:00'da yeni güne geçer
  const bugunYazisi = !o.ts ? 'Masaüstü Orvane ile eşitlenince iş günü kayıtların burada görünür.' : g.bg?.D ? 'Bugün izin günü, tam gün sayılır.' : bH ? 'Bugün ' + (g.bg?.T || 0) + ' / ' + bH + ' dk girildi' + (g.eksik ? ' · bu ay ' + g.eksik + ' eksik gün' : '') : 'Bugün için iş süresi yok.';
  return (
    <View style={{ gap: 14 }}>
      <SayfaBasligi ust={bugunYazi()} baslik={'Merhaba ' + (es ? AD.kubra : AD.cagla)} sag={<View style={{ marginBottom: 4 }}><Hap yazi={senk.calisiyor ? 'Eşitleniyor' : cevrim ? 'Çevrimiçi' : 'Çevrimdışı'} t={cevrim ? 'g' : 'o'} /></View>} />

      {!es && <KartK ad="isgunu" baslik="İŞ GÜNÜ" ozet={g.dolu + '/' + g.isg + ' gün · ' + g.hi + '/' + g.hn + '. hafta'} sag={<Tumu git={() => sekmeGit(2)} yazi="Kayıt gir" />}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Olcu ust="Bu hafta" deger={g.dolu + '/' + g.isg} alt="dolu iş günü" oran={g.dolu / g.isg} renk={R.yesil} />
          <Olcu ust="Ayın haftası" deger={g.hi + '/' + g.hn} alt={AY[new Date().getMonth()]} oran={g.hi / g.hn} renk={R.ana2} />
          <Olcu ust="Bu ay" deger={g.toplam ? '%' + Math.round((g.girilen / g.toplam) * 100) : '—'} alt={g.girilen.toLocaleString('tr-TR') + ' / ' + g.toplam.toLocaleString('tr-TR') + ' dk'} oran={g.toplam ? g.girilen / g.toplam : 0} renk={R.ana} />
        </View>
        <Text style={s.sub}>{bugunYazisi}</Text>
      </KartK>}

      <ButceKart o={o} />

      {!es && <KartK ad="gorev" baslik="BUGÜNKÜ GÖREVLER" ozet={acik.length + ' açık görev'} sag={<Tumu git={() => sekmeGit(SEKME_GOREV, { gorev: 'gorev' })} />}>
        {gorevler.length ? gorevler.map((x) => (
          <View key={x.id} style={s.satir}>
            <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' }}><Ikon ad="gorev" boy={18} renk={R.yazi2} kalin={2} /></View>
            <View style={{ flex: 1, gap: 2 }}><Text numberOfLines={2} style={{ color: R.yazi, fontSize: 14, fontWeight: '600' }}>{x.metin}</Text><Text style={s.sub}>{pasif ? KISA[x.kim] || 'Görev' : hepsi.find((c) => c.id === x.kim)?.ad}{x.son ? ' · ' + x.son : ''}</Text></View>
            <Hap yazi={x.onc === 'acil' ? 'Acil' : x.durum === 'calisiyor' ? 'Çalışıyor' : 'Bekliyor'} t={x.onc === 'acil' ? 'r' : x.durum === 'calisiyor' ? 'g' : 'o'} />
          </View>
        )) : <Bos yazi="Açık görev yok." ikon="gorev" />}
        {acik.length > 2 && <Text style={s.sub}>+{acik.length - 2} görev daha · Tümü’nde</Text>}
      </KartK>}

      <KartK ad="ilac" baslik="GÜNLÜK İLAÇ TAKİBİ" ozet={ilac.length ? alinan + '/' + ilac.length + ' alındı' : 'ilaç yok'} sag={<Tumu git={() => sekmeGit(3)} yazi={es ? 'Sağlık' : 'İlaçlarım'} />}>
        {ilac.length ? ilac.map((i, n) => <IlacSatiri key={i.id} o={o} i={i} no={n + 1} />) : <Text style={s.soluk}>Bugün alınacak ilaç yok. Bana Özel › İlaçlar’dan eklenir.</Text>}
        <SekerSatiri key={o.ts + '|' + (o.aile?.seker[Object.keys(o.aile?.seker || {}).sort().pop() || ''] ?? '')} o={o} />
      </KartK>
      {!o.ts && <Text style={[s.sub, { textAlign: 'center' }]}>Son eşitleme yok · veriler masaüstünden gelir · Ayarlar › Eşitleme</Text>}
    </View>
  );
}
