// Açlık şekeri çizgi grafiği: son 14 / 30 / 60 gün, hedef aralık bandı (80–130 mg/dL), hedef dışı noktalar turuncu.
// Yeni yerel modül yok: react-native-svg (APK'da zaten var). Veri: o.aile.seker ("YYYY-AA-GG" → mg/dL; masaüstü son 62 günü yayınlar).
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { s } from '@/bilesen/ortak';
import { SEKER_RENK } from '@/bilesen/Saglik';
import type { Ozet } from '@/lib/depo';
import { R } from '@/lib/tema';
import { AY, gunEkle, tamAnahtar } from '@/lib/zaman';

export const HEDEF_ALT = 80, HEDEF_UST = 130;
const SURE: [number, string][] = [[14, '14 gün'], [30, '30 gün'], [60, '60 gün']];
const disarida = (v: number) => v > HEDEF_UST || v < HEDEF_ALT;

/** Son n günün ölçümleri (bugün dahil, eskiden yeniye); ölçülmeyen gün null */
export function sekerSerisi(seker: Record<string, number> | undefined, n: number, bugun = new Date()) {
  const r: { k: string; d: Date; v: number | null }[] = [];
  for (let i = n - 1; i >= 0; i--) { const d = gunEkle(bugun, -i), k = tamAnahtar(d); r.push({ k, d, v: seker?.[k] ?? null }); }
  return r;
}

export function SekerGrafik({ o }: { o: Ozet }) {
  const [n, setN] = useState(30), [W, setW] = useState(0), [sec, setSec] = useState<number | null>(null);
  const seri = sekerSerisi(o.aile?.seker, n), olc = seri.filter((x): x is { k: string; d: Date; v: number } => x.v != null), v = olc.map((x) => x.v);
  const ort = v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null, dis = olc.filter((x) => disarida(x.v)).length;
  const H = 150, SOL = 30, SAG = 8, UST = 10, ALT = 20;
  const ust = Math.max(160, ...v.map((x) => Math.ceil(x / 10) * 10 + 10)), alt = Math.min(60, ...v.map((x) => Math.floor(x / 10) * 10 - 10));
  const px = (i: number) => SOL + (i * (W - SOL - SAG)) / Math.max(1, n - 1), py = (x: number) => UST + ((ust - x) / (ust - alt)) * (H - UST - ALT);
  // Ardışık olmayan ölçümler de çizgiyle bağlanır (boş gün çizgiyi kesmez); tek ölçümde yalnız nokta
  const yol = seri.map((x, i) => (x.v == null ? '' : `${px(i).toFixed(1)} ${py(x.v).toFixed(1)}`)).filter(Boolean).map((p, i) => (i ? 'L' : 'M') + p).join(' ');
  const izgara = [alt, HEDEF_ALT, HEDEF_UST, ust].filter((x, i, a) => a.indexOf(x) === i);
  const etiketAdim = n <= 14 ? 2 : n <= 30 ? 7 : 14;
  const secili = sec != null ? seri[sec] : null;
  const dokun = (x: number) => { if (!W) return; const i = Math.round(((x - SOL) / (W - SOL - SAG)) * (n - 1)); if (i < 0 || i >= n) return; // en yakın ölçümlü gün
    let en = -1; seri.forEach((y, j) => { if (y.v != null && (en < 0 || Math.abs(j - i) < Math.abs(en - i))) en = j; }); setSec(en < 0 ? null : en); };
  return (
    <View style={{ gap: 10 }}>
      <View style={[s.seg, { padding: 3 }]} accessibilityRole="tablist">
        {SURE.map(([g, y]) => (
          <Pressable key={g} onPress={() => { setN(g); setSec(null); }} accessibilityRole="tab" accessibilityState={{ selected: n === g }} style={[s.segb, { height: 30 }, n === g && { backgroundColor: R.ana }]}>
            <Text style={{ color: n === g ? '#fff' : '#cfcfd4', fontSize: 12.5, fontWeight: '600' }}>{y}</Text>
          </Pressable>
        ))}
      </View>
      {/* Dokunma: Pressable (kaydırmayı engellemez); en yakın ölçümlü günün değeri alttaki satırda yazar */}
      <Pressable onLayout={(e) => setW(e.nativeEvent.layout.width)} onPress={(e) => dokun(e.nativeEvent.locationX)}
        accessible accessibilityLabel={'Açlık şekeri, son ' + n + ' gün: ' + (v.length ? v.length + ' ölçüm, ortalama ' + ort + ', en düşük ' + Math.min(...v) + ', en yüksek ' + Math.max(...v) : 'ölçüm yok')} style={{ height: H }}>
        {W > 0 && <Svg width={W} height={H}>
          <Rect x={SOL} y={py(HEDEF_UST)} width={W - SOL - SAG} height={py(HEDEF_ALT) - py(HEDEF_UST)} fill="rgba(62,207,90,0.10)" />
          {izgara.map((g) => { const h = g === HEDEF_ALT || g === HEDEF_UST; return (
            <Line key={'g' + g} x1={SOL} x2={W - SAG} y1={py(g)} y2={py(g)} stroke={h ? 'rgba(107,229,133,0.45)' : 'rgba(255,255,255,0.07)'} strokeDasharray={h ? '3 4' : undefined} />); })}
          {izgara.map((g) => <SvgText key={'t' + g} x={SOL - 5} y={py(g) + 3.5} fontSize={9.5} fill={R.yazi2} textAnchor="end">{g}</SvgText>)}
          {seri.map((x, i) => (i % etiketAdim === (n - 1) % etiketAdim ? <SvgText key={'d' + i} x={px(i)} y={H - 5} fontSize={9.5} fill={i === n - 1 ? R.ana2 : R.yazi2} textAnchor="middle">{i === n - 1 ? 'bugün' : x.d.getDate() + ' ' + AY[x.d.getMonth()].slice(0, 3)}</SvgText> : null))}
          {secili && <Line x1={px(sec!)} x2={px(sec!)} y1={UST} y2={H - ALT} stroke="rgba(255,255,255,0.25)" />}
          {olc.length > 1 && <Path d={yol} fill="none" stroke={SEKER_RENK} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
          {seri.map((x, i) => (x.v == null ? null : <Circle key={'c' + i} cx={px(i)} cy={py(x.v)} r={i === sec ? 5 : n > 30 ? 2.5 : 3.2} fill={disarida(x.v) ? '#f5a524' : SEKER_RENK} stroke="#1c1c1f" strokeWidth={1.2} />))}
        </Svg>}
        {W > 0 && !v.length && <View style={{ position: 'absolute', left: SOL, right: SAG, top: 0, bottom: ALT, alignItems: 'center', justifyContent: 'center' }}><Text style={s.soluk}>Bu aralıkta ölçüm yok</Text></View>}
      </Pressable>
      <Text style={[s.sub, { minHeight: 16 }]}>
        {secili?.v != null ? `${secili.d.getDate()} ${AY[secili.d.getMonth()]} · ${secili.v} mg/dL${o.aile?.sekerSaat?.[secili.k] ? ' · saat ' + o.aile.sekerSaat[secili.k] : ''}${disarida(secili.v) ? ' · hedef dışı' : ''}`
          : v.length ? `${v.length} ölçüm · ort. ${ort} · en düşük ${Math.min(...v)} · en yüksek ${Math.max(...v)}${dis ? ' · ' + dis + ' hedef dışı' : ''}` : 'Ölçüm girildikçe grafik dolar.'}
      </Text>
      <View style={{ flexDirection: 'row', columnGap: 14, rowGap: 4, flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 14, height: 8, borderRadius: 2, backgroundColor: 'rgba(62,207,90,0.18)' }} /><Text style={[s.sub, { fontSize: 11 }]}>hedef {HEDEF_ALT}–{HEDEF_UST}</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#f5a524' }} /><Text style={[s.sub, { fontSize: 11 }]}>hedef dışı</Text></View>
        <Text style={[s.sub, { fontSize: 11 }]}>noktaya dokun: o günün değeri</Text>
      </View>
    </View>
  );
}
