// Gelişim talebi satırı: kim istedi › Nika (İK) › Orin (CEO) › Çağlar (son onay)
import { Text, View } from 'react-native';
import { Rozet, s } from '@/bilesen/ortak';
import { Gelisim } from '@/lib/depo';
import { GT } from '@/lib/ekip';
import { R } from '@/lib/tema';

export function GelisimSatiri({ g, eylem, ust }: { ust?: React.ReactNode; g: Gelisim; eylem?: React.ReactNode }) {
  const ik = g.ik ? (g.ik.ok ? ['Nika onayladı ✓', R.yesil] : ['Nika reddetti', R.kirmizi]) : [g.asama === 'ik' ? 'Nika’da' : 'Nika', g.asama === 'ik' ? R.turuncu : R.solukk];
  // Orin: kendi kararı; kendi talebiyse atlanır; eski kayıtlarda (Orin incelemesinden geçmeden Çağlar'a gelenler) nötr
  const orin = g.orin ? (g.orin.ok ? [(g.orin.kim === 'cagla' ? 'Çağlar bozdu, ' : '') + 'Orin onayladı ✓', R.yesil] : ['Orin reddetti', R.kirmizi]) : g.asama === 'orin' ? ['Orin’de', R.turuncu] : g.kim === 'orin' && g.asama !== 'ik' ? ['Orin (kendi talebi)', R.solukk] : ['Orin', R.solukk];
  const cag = g.ceo ? (g.ceo.ok ? ['Çağlar onayladı ✓', R.yesil] : ['Çağlar reddetti', R.kirmizi]) : ['Senin onayın', g.asama === 'ceo' ? '#a9b4ff' : R.solukk];
  const nedenler: [string, string, string][] = [];
  if (g.ik?.neden) nedenler.push(['Nika', g.ik.neden, g.ik.ok ? R.yesil : R.kirmizi]);
  if (g.orin?.neden) nedenler.push([g.orin.kim === 'cagla' ? 'Çağlar' : 'Orin', g.orin.neden, g.orin.ok ? R.yesil : R.kirmizi]);
  else if (g.oneri?.neden && g.asama === 'ceo') nedenler.push(['Orin önerisi', g.oneri.neden, '#9ec5ff']);
  const sonuc = g.sonuc && (g.sonuc.evet || g.sonuc.hayir) && (g.asama === 'ik' || g.asama === 'orin' || g.asama === 'ceo') ? g.sonuc : null;
  return (
    <View style={s.kart}>
      {ust}
      <Text style={{ color: '#fff', fontSize: 14.5, fontWeight: '600' }}>{GT[g.tur]}{g.ad ? ' · ' + g.ad : ''}</Text>
      {!!g.metin && <Text style={{ color: '#d4d4da', fontSize: 13.5, marginTop: 3 }}>{g.metin}</Text>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <Rozet yazi={g.kimden === 'nika' ? 'Nika önerdi' : g.kimden === 'cagla' ? 'Çağlar istedi' : 'Claude’dan'} /><Text style={{ color: '#5a5a62' }}>›</Text><Rozet yazi={ik[0]} renk={ik[1]} /><Text style={{ color: '#5a5a62' }}>›</Text><Rozet yazi={orin[0]} renk={orin[1]} /><Text style={{ color: '#5a5a62' }}>›</Text><Rozet yazi={cag[0]} renk={cag[1]} />
      </View>
      {nedenler.map(([k, n, r]) => <Text key={k} style={{ color: r, fontSize: 12.5, marginTop: 5 }}>{k}: {n}</Text>)}
      {sonuc && (
        <View style={{ gap: 4, marginTop: 8 }}>
          {!!sonuc.evet && <Text style={{ color: '#8ee6a9', fontSize: 12, backgroundColor: 'rgba(46,160,67,0.13)', borderWidth: 1, borderColor: 'rgba(63,185,80,0.45)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>Onaylanırsa: {sonuc.evet}</Text>}
          {!!sonuc.hayir && <Text style={{ color: '#ffa4a0', fontSize: 12, backgroundColor: 'rgba(248,81,73,0.12)', borderWidth: 1, borderColor: 'rgba(248,81,73,0.45)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>Onaylanmazsa: {sonuc.hayir}</Text>}
        </View>
      )}
      {eylem}
    </View>
  );
}
