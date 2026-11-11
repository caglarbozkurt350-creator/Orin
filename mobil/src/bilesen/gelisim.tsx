// Gelişim talebi satırı: kim istedi › İK incelemesi › CEO onayı
import { Text, View } from 'react-native';
import { Rozet, s } from '@/bilesen/ortak';
import { Gelisim } from '@/lib/depo';
import { GT } from '@/lib/ekip';
import { R } from '@/lib/tema';

export function GelisimSatiri({ g, eylem, ust }: { ust?: React.ReactNode; g: Gelisim; eylem?: React.ReactNode }) {
  const ik = g.ik ? (g.ik.ok ? ['İK onayı ✓', R.yesil] : ['İK reddetti', R.kirmizi]) : ['İK incelemesi', R.turuncu];
  const ceo = g.ceo ? (g.ceo.ok ? ['CEO onayı ✓', R.yesil] : ['CEO reddetti', R.kirmizi]) : ['CEO onayı', g.asama === 'ceo' ? '#a9b4ff' : R.solukk];
  return (
    <View style={s.kart}>
      {ust}
      <Text style={{ color: '#fff', fontSize: 14.5, fontWeight: '600' }}>{GT[g.tur]}{g.ad ? ' · ' + g.ad : ''}</Text>
      {!!g.metin && <Text style={{ color: '#d4d4da', fontSize: 13.5, marginTop: 3 }}>{g.metin}</Text>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <Rozet yazi={g.kimden === 'nika' ? 'Nika önerdi' : 'Çağlar istedi'} /><Text style={{ color: '#5a5a62' }}>›</Text><Rozet yazi={ik[0]} renk={ik[1]} /><Text style={{ color: '#5a5a62' }}>›</Text><Rozet yazi={ceo[0]} renk={ceo[1]} />
      </View>
      {eylem}
    </View>
  );
}

