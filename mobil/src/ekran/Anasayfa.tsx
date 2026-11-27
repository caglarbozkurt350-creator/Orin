// Anasayfa (0.9.0): İş günü göstergesi (hafta günü · ayın haftası · ay dakikası: ayın bütün iş günleri, izin düşülür, gün gün dilimli; 0.9.16: Bu hafta gün gün, Ayın haftası hafta hafta dilimli), bu ay gelir–gider (kalan bakiye çizgisi /
// kategoriler, geçen aya göre uyarı), günlük ilaç takibi, sabah açlık şekeri ve şeker grafiği.
// Bugünkü görevler kartı kaldırıldı (görevler Ekip › Görevler'de).
// Kaynak: masaüstü özeti (o.gun, o.aile) + telefondaki bekleyen olaylar.
import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polyline } from 'react-native-svg';
import { Bos } from '@/bilesen/formlar';
import { Dugme, Hap, Ikon, KartK, SayfaBasligi, s } from '@/bilesen/ortak';
import { bugunIlac, alindiMi, IlacSatiri, SekerSatiri } from '@/bilesen/Saglik';
import { useBugun } from '@/lib/bugun';
import { olayEkle, useDurum } from '@/lib/depo';
import type { ButceAy, Ozet } from '@/lib/depo';
import { esitleSonra, hizliBekle } from '@/lib/senk';
import { sekmeGit } from '@/lib/gezinti';
import { bugunYazi, useEkip } from '@/lib/kullan';
import { IZIN_AD } from '@/ekran/IzinGirisi';
import { AD, useRol } from '@/lib/rol';
import { R, saydam } from '@/lib/tema';
import { AY, ayaGore, ayin, ayinHaftalari, GK, gunAnahtari, gunEkle, haftaBasi, kisaTarih, tarihOf, tl } from '@/lib/zaman';

const Tumu = ({ git, yazi = 'Tümü' }: { git: () => void; yazi?: string }) => (
  <Pressable onPress={git} accessibilityRole="button" hitSlop={4} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: saydam(R.ana, 0.16), justifyContent: 'center' }}><Text style={{ color: R.ana2, fontSize: 12, fontWeight: '600' }}>{yazi}</Text></Pressable>
);

type AyDilim = { oran: number; gecti: boolean; bugun: boolean };
const EKSIK = '#f59e0b';
/** Ayın iş günlerine bölünmüş halka: her dilim bir iş günü. Girilen kısım dolu renkte; geçmiş günlerde eksik kalan kısım turuncu;
 *  bugün ve ileri günlerin kalanı soluk. Saat 12'den başlar, saat yönünde gider. */
function DilimHalka({ dilim, renk, boy = 58 }: { dilim: AyDilim[]; renk: string; boy?: number }) {
  const c = boy / 2, r = boy / 2 - 5, n = dilim.length || 1, bosluk = n > 1 ? Math.min(0.06, 0.5 / n) : 0, pay = (2 * Math.PI) / n;
  const nokta = (a: number) => [c + r * Math.sin(a), c - r * Math.cos(a)];
  const yay = (a0: number, a1: number) => { const [x0, y0] = nokta(a0), [x1, y1] = nokta(a1); return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };
  return (
    <Svg width={boy} height={boy}>
      {!dilim.length && <Circle cx={c} cy={c} r={r} stroke="rgba(255,255,255,0.10)" strokeWidth={6} fill="none" />}
      {dilim.map((x, i) => {
        const a0 = i * pay + bosluk / 2, a1 = (i + 1) * pay - bosluk / 2, am = a0 + (a1 - a0) * x.oran;
        return (
          <G key={i}>
            <Path d={yay(a0, a1)} stroke={x.gecti && x.oran < 1 ? EKSIK : 'rgba(255,255,255,0.10)'} strokeWidth={6} fill="none" />
            {x.oran > 0.01 && <Path d={yay(a0, am)} stroke={renk} strokeWidth={6} fill="none" />}
            {x.bugun && <Path d={yay(a0, a1)} stroke="#fff" strokeOpacity={0.35} strokeWidth={1.2} fill="none" transform={`translate(${c} ${c}) scale(1.17) translate(${-c} ${-c})`} />}
          </G>
        );
      })}
    </Svg>
  );
}

/** Dilimli halka + başlık: Bu hafta (dilim = iş günü), Ayın haftası (dilim = hafta), Bu ay (dilim = iş günü). Renk ve lejant ortak. */
function DilimOlcu({ ust, deger, alt, dilim, etiket, eksikDk = 0, bos = false }: { ust: string; deger: string; alt: string; dilim: AyDilim[]; etiket: string; eksikDk?: number; bos?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 6 }} accessible accessibilityLabel={etiket + (bos ? ', kayıt yok' : '')}>
      <View style={{ width: 58, height: 58 }}>
        <DilimHalka dilim={dilim} renk={R.yesil} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: R.yazi, fontSize: 14, fontWeight: '700' }}>{deger}</Text></View>
      </View>
      <Text style={{ color: R.yazi, fontSize: 12.5, fontWeight: '600', textAlign: 'center' }}>{ust}</Text>
      <Text style={[s.sub, { fontSize: 11, textAlign: 'center' }]}>{alt}</Text>
      {bos && <Text style={[s.sub, { fontSize: 11, textAlign: 'center', marginTop: -4 }]}>kayıt yok</Text>}
      {eksikDk > 0 && <Text style={{ color: EKSIK, fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: -4 }}>{bin(eksikDk)} dk eksik</Text>}
    </View>
  );
}
const bin = (n: number) => n.toLocaleString('tr-TR');
const dkYazi = (girilen: number, toplam: number, eksikDk: number) => girilen + ' / ' + toplam + ' dakika' + (eksikDk ? ', ' + eksikDk + ' dakika eksik' : '');

/** Bir günün iş süresi (dk) ve girilen dk. İzin günü null. Süre masaüstü özetinden (L + fazla mesai); özetin kapsamadığı
 *  günler için hafta içi / Cuma ayarı; hafta sonu ve resmî tatil 0. */
function gunSure(o: Ozet, t0: Date): { h: number; T: number } | null {
  const g = o.gun[gunAnahtari(t0)], w1 = o.ayar?.w1 || 525, w2 = o.ayar?.w2 || 435;
  if (g?.D) return null;
  const h = g ? (g.L ? g.L + (g.OT || 0) : 0) : t0.getDay() % 6 === 0 ? 0 : t0.getDay() === 5 ? w2 : w1;
  return { h, T: g?.T || 0 };
}

function isGunuOlcu(o: Ozet) {
  const b = new Date(), bk = gunAnahtari(b), hb = haftaBasi(b);
  // 1) Bu hafta: dolu gün / iş günü (izin günleri sayılmaz)
  let dolu = 0, isg = 0;
  [0, 1, 2, 3, 4].forEach((i) => { const g = o.gun[gunAnahtari(gunEkle(hb, i))]; if (g?.D) return; if (!g || g.L) isg++; if (g && g.L && g.T >= g.L + (g.OT || 0)) dolu++; });
  // 2) Ayın kaçıncı haftası
  const hl = ayinHaftalari(b), hi = Math.max(1, hl.findIndex((h) => h.getTime() === hb.getTime()) + 1);
  // 3) Ay: ayın bütün iş günlerinin süresi (izin günleri düşülür) ve girilen dk. Gün süresi masaüstü özetinden (L + fazla mesai);
  //    özetin kapsamadığı ileri günler için hafta içi / Cuma ayarı. Her iş günü halkada bir dilim.
  const son = new Date(b.getFullYear(), b.getMonth() + 1, 0).getDate(), bugun = b.getDate(), bugun0 = new Date(b.getFullYear(), b.getMonth(), bugun);
  let girilen = 0, toplam = 0, eksik = 0, eksikDk = 0, izin = 0;
  const dilim: AyDilim[] = [];
  for (let d = 1; d <= son; d++) {
    const t0 = new Date(b.getFullYear(), b.getMonth(), d), x = gunSure(o, t0);
    if (!x) { if (t0.getDay() % 6 !== 0) izin++; continue; }
    const { h, T } = x;
    if (!h) continue; // hafta sonu / resmî tatil
    toplam += h; girilen += Math.min(T, h);
    if (o.ts && d < bugun && T < h) { eksik++; eksikDk += h - T; }
    dilim.push({ oran: Math.min(1, T / h), gecti: !!o.ts && d < bugun, bugun: d === bugun });
  }
  // 4) Bu hafta: Pzt–Cum, her iş günü bir dilim (izin ve tatil günleri dilim değil). Ay sınırını aşan günler de sayılır.
  const hafta: AyDilim[] = [];
  let hGir = 0, hTop = 0, hEksikDk = 0;
  [0, 1, 2, 3, 4].forEach((i) => {
    const t0 = gunEkle(hb, i), x = gunSure(o, t0);
    if (!x || !x.h) return;
    const gecti = !!o.ts && t0 < bugun0;
    hTop += x.h; hGir += Math.min(x.T, x.h); if (gecti && x.T < x.h) hEksikDk += x.h - x.T;
    hafta.push({ oran: Math.min(1, x.T / x.h), gecti, bugun: t0.getTime() === bugun0.getTime() });
  });
  // 5) Ayın haftaları: her hafta bir dilim; doluluk = o haftanın bu aya düşen iş günlerinde girilen / toplam dk.
  //    Bitmiş haftada eksik kalan kısım turuncu, bu hafta beyaz çerçeveli. İş günü olmayan hafta (hepsi izin/tatil) dolu sayılır.
  const haftalar: AyDilim[] = hl.map((h0) => {
    let gr = 0, tp = 0;
    [0, 1, 2, 3, 4].forEach((i) => { const t0 = gunEkle(h0, i); if (t0.getMonth() !== b.getMonth()) return; const x = gunSure(o, t0); if (x && x.h) { tp += x.h; gr += Math.min(x.T, x.h); } });
    return { oran: tp ? gr / tp : 1, gecti: !!o.ts && gunEkle(h0, 4) < bugun0, bugun: h0.getTime() === hb.getTime() };
  });
  const bg = o.gun[bk];
  return { dolu, isg: isg || 5, hi, hn: hl.length, girilen, toplam, eksik, eksikDk, izin, dilim, hafta, hGir, hTop, hEksikDk, haftalar, bg };
}

/** Para yazısı: eksi değerde gerçek eksi işareti (−), tutar ayraçlı */
const para = (n: number) => (Math.round(n) < 0 ? '−' : '') + tl(Math.abs(n));
/** Yüzde değişim: geçen ay değeri çok küçükse dört basamaklı yüzde satırı taşırmasın */
const yuzde = (v: number, p: number) => { const x = Math.abs(Math.round(((v - p) / p) * 100)); return x > 999 ? '999+' : String(x); };
const ETIKET = ['Başı', '1.h', '2.h', '3.h', '4.h', 'Sonu'];

/** Kalan bakiye çizgisi: ay başı gelir, her hafta gider düşülür. Kesikli çizgi geçen ay (yalnız geçen ay verisi varsa). */
function BakiyeCizgi({ bu, once }: { bu: ButceAy; once?: ButceAy }) {
  const [W, setW] = useState(0), H = 120, YAN = 14;
  const birik = (x: ButceAy) => { const r = [x.gelir]; x.hc.forEach((g) => r.push(r[r.length - 1] - g)); return r; };
  const hafta = Math.min(5, Math.ceil(new Date().getDate() / 7)), KB = birik(bu).slice(0, hafta + 1), KO = once && (once.gelir || once.gider) ? birik(once) : null;
  const hepsi = [...KB, ...(KO || []), 0], mx = Math.max(...hepsi), mn = Math.min(...hepsi);
  // Kenarlarda nokta ve etiket yarım kalmasın: yatayda YAN kadar pay
  const px = (i: number) => YAN + (i * (W - 2 * YAN)) / 5, py = (v: number) => 10 + (1 - (v - mn) / (mx - mn || 1)) * (H - 20);
  const nk = (l: number[]) => l.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  const taban = py(Math.min(Math.max(0, mn), mx));
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: H + 18 }}>
      {W > 0 && <>
        <Svg width={W} height={H}>
          <Line x1={0} x2={W} y1={py(0)} y2={py(0)} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 4" />
          <Path d={`M${px(0)} ${taban} ${KB.map((v, i) => `L${px(i)} ${py(v)}`).join(' ')} L${px(KB.length - 1)} ${taban} Z`} fill={saydam(R.ana, 0.14)} />
          {KO && <Polyline points={nk(KO)} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="5 4" />}
          <Polyline points={nk(KB)} fill="none" stroke={R.ana} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {KB.map((v, i) => <Circle key={i} cx={px(i)} cy={py(v)} r={i === KB.length - 1 ? 4.5 : 3} fill={v < 0 ? '#f4a3a3' : i === KB.length - 1 ? R.ana2 : R.ana} stroke="#1c1c1f" strokeWidth={1.5} />)}
        </Svg>
        {/* Etiketler noktaların tam altında (space-between ile noktalardan kayıyordu) */}
        {ETIKET.map((x, i) => <Text key={x} numberOfLines={1} style={[s.sub, { position: 'absolute', top: H + 2, left: px(i) - 20, width: 40, textAlign: 'center', fontSize: 10.5, color: i === hafta ? R.ana2 : R.yazi2 }]}>{x}</Text>)}
      </>}
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
  const kat = Object.entries(bu.kat).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]), kmax = kat.length ? kat[0][1] : 1;
  // Uyarı: geçen aya göre en çok artan kategori (sınır yok; kıyas geçen ay)
  const artis = kat.map(([k, v]) => [k, v, once?.kat[k] || 0] as [string, number, number]).filter((x) => x[2] > 0 && x[1] > x[2] * 1.1).sort((a, b) => b[1] - b[2] - (a[1] - a[2]))[0];
  const gun = new Date().getDate(), onceAyniGun = once ? once.hc.slice(0, Math.ceil(gun / 7)).reduce((a, b) => a + b, 0) : 0;
  return (
    <KartK ad="butce" baslik="BU AY GELİR · GİDER" ozet={'Kalan ' + para(kalan)} sag={<Tumu git={() => sekmeGit(1)} yazi="Ailem" />}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[['Gelir', bu.gelir, R.yesil], ['Gider', bu.gider, '#f4a3a3'], ['Kalan', kalan, kalan >= 0 ? R.yazi : '#f4a3a3']].map(([y, v, r]) => (
          <View key={y as string} style={{ flex: 1, minWidth: 0, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', gap: 2 }} accessible accessibilityLabel={y + ' ' + para(v as number)}>
            <Text style={[s.sub, { fontSize: 11.5 }]}>{y as string}</Text>
            <Text adjustsFontSizeToFit minimumFontScale={0.5} numberOfLines={1} style={{ color: r as string, fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{para(v as number)}</Text>
          </View>
        ))}
      </View>
      {/* s.seg düğmeleri 40 px; kutuya 36 px yükseklik verilince düğmeler taşıp grafiğin üstüne biniyordu */}
      <View style={s.seg} accessibilityRole="tablist">
        {([['hafta', 'Kalan bakiye'], ['kat', 'Kategori']] as const).map(([k, y]) => (
          <Pressable key={k} onPress={() => setGor(k)} accessibilityRole="tab" accessibilityState={{ selected: gor === k }} style={[s.segb, { height: 32 }, gor === k && { backgroundColor: R.ana }]}>
            <Text numberOfLines={1} style={{ color: gor === k ? '#fff' : '#cfcfd4', fontSize: 13, fontWeight: '600' }}>{y}</Text>
          </Pressable>
        ))}
      </View>
      {gor === 'hafta' ? <>
        <BakiyeCizgi bu={bu} once={once} />
        <View style={{ flexDirection: 'row', columnGap: 14, rowGap: 4, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: R.ana }} /><Text style={s.sub}>{ay}: gelir − haftalık gider</Text></View>
          {!!(once?.gelir || once?.gider) && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 14, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.45)' }} /><Text style={s.sub}>{onAd}</Text></View>}
        </View>
      </> : (
        <View style={{ gap: 8 }}>
          {kat.slice(0, 6).map(([k, v]) => { const p = once?.kat[k] || 0, up = p > 0 && v > p; return (
            <View key={k} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text numberOfLines={1} style={{ flex: 1, minWidth: 0, color: R.yazi, fontSize: 13 }}>{k}</Text>
                {p > 0 && v !== p && <Text style={{ color: up ? '#f4a3a3' : '#6be585', fontSize: 11.5, fontWeight: '700' }}>{up ? '▲' : '▼'} %{yuzde(v, p)}</Text>}
                <Text style={{ color: R.yazi, fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{para(v)}</Text>
              </View>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}><View style={{ width: `${Math.max(2, Math.min(100, (v / (kmax || 1)) * 100))}%`, height: '100%', borderRadius: 3, backgroundColor: up ? R.ana : saydam(R.ana2, 0.7) }} /></View>
            </View>); })}
          {kat.length > 6 && <Text style={s.sub}>+{kat.length - 6} kategori daha · Ailem’de</Text>}
          {!kat.length && <Text style={s.soluk}>Bu ay gider yok.</Text>}
        </View>
      )}
      {artis ? (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: 'rgba(245,165,36,0.12)' }}>
          <Ikon ad="bilgi" boy={16} renk="#f7bd55" kalin={2.1} />
          <Text style={{ flex: 1, color: '#f7bd55', fontSize: 12.5 }}>{artis[0]} {ayaGore(onAd)} göre ▲ %{yuzde(artis[1], artis[2])} ({para(artis[1] - artis[2])} fazla)</Text>
        </View>
      ) : !!onceAyniGun && bu.gider < onceAyniGun ? <Text style={{ color: '#9fd8b8', fontSize: 12.5 }}>Harcama {ayin(onAd)} aynı dönemine göre daha düşük.</Text> : null}
    </KartK>
  );
}

// 0.9.9: Eş profilinde Anasayfa üst kartı (BU HAFTA) kaldırıldı; aile takvimi Ailem sekmesinde.

/** 0.9.11 · Geliştirme fikri iste: telefondan masaüstüne fikir_tasarim olayı gider; masaüstü Claude Code ile fikirleri ve
 * Claude Design tasarımlarını hazırlar, sonuç özetle (o.fikirTasarim) geri gelir. Masaüstü karşılığı: renderer/js/orv-fikir.js */
const FT_DUR: Record<string, string> = { calisiyor: 'Bilgisayarda hazırlanıyor (~15–30 dk)', hazir: 'Hazır', tasarimsiz: 'Fikirler hazır · tasarım yayınlanamadı', hata: 'Yapılamadı', istem: 'Prompt hazır · bilgisayardan kopyala' };
function FikirTasarimKart({ o }: { o: Ozet }) {
  const ft = o.fikirTasarim, bekleyen = useDurum((d) => d.olaylar.some((x) => x.tur === 'fikir_tasarim' && !x.gitti));
  const [istendi, setIstendi] = useState(0);
  const sirada = bekleyen || (istendi > (ft?.ts || 0) && Date.now() - istendi < 10 * 60000), calis = ft?.durum === 'calisiyor';
  const iste = () => { olayEkle('fikir_tasarim', { ts: Date.now() }); setIstendi(Date.now()); esitleSonra(); hizliBekle(90); };
  const durum = sirada ? 'İstek gönderildi · bilgisayardaki Orvane açılınca başlar' : ft?.durum ? FT_DUR[ft.durum] || ft.durum : 'Son düzenlemelere göre yeni fikirler ve tasarımlar hazırlatır';
  return (
    <KartK ad="fikir" baslik="GELİŞTİRME FİKİRLERİ" ozet={ft?.durum === 'hazir' ? (ft.fikirler?.length || 0) + ' fikir · tasarım hazır' : sirada || calis ? 'hazırlanıyor' : 'iste'}>
      <Text style={s.sub}>{durum}{ft?.ts && !sirada ? ' · ' + new Date(ft.ts).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</Text>
      {!!ft?.hata && !sirada && !calis && <Text style={{ color: R.turuncu, fontSize: 12.5 }}>{ft.hata}</Text>}
      {!sirada && !calis && (ft?.fikirler || []).slice(0, 5).map((f, i) => <Text key={i} style={{ color: R.yazi, fontSize: 14 }}>{i + 1}. {f}</Text>)}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {!!ft?.link && ft.link.startsWith('https://claude.ai/') &&!sirada && !calis && <Dugme yazi="Tasarımları aç" onPress={() => { Linking.openURL(ft.link!).catch(() => {}); }} />}
        <Dugme yazi={sirada || calis ? 'Hazırlanıyor…' : 'Geliştirme fikri iste'} tur={ft?.link ? 'ikinci' : 'ana'} kapali={sirada || calis || !o.ts} onPress={iste} />
      </View>
    </KartK>
  );
}

export function Anasayfa() {
  const { o, cevrim, senk } = useEkip(), es = useRol() === 'es';
  const g = isGunuOlcu(o), bH = (g.bg?.L || 0) + (g.bg?.OT || 0);
  const bugun = useBugun(), ilac = bugunIlac(o, bugun, es ? 'kubra' : 'cagla'), alinan = ilac.filter((i) => alindiMi(o, i, bugun)).length; // 00:00'da yeni güne geçer
  const bugunYazisi = !o.ts ? 'Masaüstü Orvane ile eşitlenince iş günü kayıtların burada görünür.' : g.bg?.D ? 'Bugün izin günü, tam gün sayılır.' : bH ? 'Bugün ' + (g.bg?.T || 0) + ' / ' + bH + ' dk girildi' + (g.eksik ? ' · bu ay ' + g.eksik + ' eksik gün' : '') : 'Bugün için iş süresi yok.';
  return (
    <View style={{ gap: 14 }}>
      <SayfaBasligi ust={bugunYazi()} baslik={'Merhaba ' + (es ? AD.kubra : AD.cagla)} sag={<View style={{ marginBottom: 4 }}><Hap yazi={senk.calisiyor ? 'Eşitleniyor' : cevrim ? 'Çevrimiçi' : 'Çevrimdışı'} t={cevrim ? 'g' : 'o'} /></View>} />

      {!es && <KartK ad="isgunu" baslik="İŞ GÜNÜ" ozet={g.dolu + '/' + g.isg + ' gün · ' + g.hi + '/' + g.hn + '. hafta'} sag={<Tumu git={() => sekmeGit(2)} yazi="Kayıt gir" />}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <DilimOlcu ust="Bu hafta" deger={g.dolu + '/' + g.isg} alt="dolu iş günü" dilim={g.hafta}
            etiket={'Bu hafta ' + g.dolu + ' / ' + g.isg + ' dolu iş günü, ' + dkYazi(g.hGir, g.hTop, g.hEksikDk)} bos={!g.hGir} />
          <DilimOlcu ust="Ayın haftası" deger={g.hi + '/' + g.hn} alt={AY[new Date().getMonth()]} dilim={g.haftalar}
            etiket={ayin(AY[new Date().getMonth()]) + ' ' + g.hn + ' haftasının ' + g.hi + '. haftası, ' + g.haftalar.filter((x) => x.oran >= 1).length + ' hafta dolu'} bos={!g.girilen} />
          <DilimOlcu ust="Bu ay" deger={g.toplam ? '%' + (Math.round((g.girilen / g.toplam) * 100)) : '—'} alt={bin(g.girilen) + ' / ' + bin(g.toplam) + ' dk'} dilim={g.dilim} eksikDk={g.eksikDk}
            etiket={'Bu ay yüzde ' + (g.toplam ? Math.round((g.girilen / g.toplam) * 100) : 0) + ', ' + dkYazi(g.girilen, g.toplam, g.eksikDk) + (g.izin ? ', ' + g.izin + ' izin günü düşüldü' : '')} bos={!g.girilen} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          {[[R.yesil, 'Girilen'], [EKSIK, 'Eksik (geçen günler)'], ['rgba(255,255,255,0.18)', 'Kalan']].map(([c, y]) => (
            <View key={y} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: c }} /><Text style={[s.sub, { fontSize: 11 }]}>{y}</Text></View>
          ))}
          <Text style={[s.sub, { fontSize: 11 }]}>{g.dilim.length} iş günü{g.izin ? ' · ' + g.izin + ' izin düşüldü' : ''}</Text>
        </View>
        <Text style={s.sub}>{bugunYazisi}</Text>
      </KartK>}

      <ButceKart o={o} />

      <KartK ad="ilac" baslik="GÜNLÜK İLAÇ TAKİBİ" ozet={ilac.length ? alinan + '/' + ilac.length + ' alındı' : 'ilaç yok'} sag={<Tumu git={() => sekmeGit(3)} yazi={es ? 'Sağlık' : 'İlaçlarım'} />}>
        {ilac.length ? ilac.map((i, n) => <IlacSatiri key={i.id} o={o} i={i} no={n + 1} />) : <Text style={s.soluk}>Bugün alınacak ilaç yok. Bana Özel › İlaçlar’dan eklenir.</Text>}
        <SekerSatiri key={o.ts + '|' + (o.aile?.seker[Object.keys(o.aile?.seker || {}).sort().pop() || ''] ?? '')} o={o} />
      </KartK>
      {!es && <FikirTasarimKart o={o} />}
      {!o.ts && <Text style={[s.sub, { textAlign: 'center' }]}>Son eşitleme yok · veriler masaüstünden gelir · Ayarlar › Eşitleme</Text>}
    </View>
  );
}
