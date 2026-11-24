// Sağlık parçaları (0.9.0): bugünkü ilaçlar (Alındı işareti) ve sabah açlık şekeri satırı. Anasayfa ve Bana Özel kullanır.
// Olaylar: ilac_al {k, id, al} · seker {k, v}. k = "YYYY-MM-DD" (masaüstü OA.bugunKey). Masaüstü orv-telefon.js uygular.
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ikon, s } from '@/bilesen/ortak';
import type { Ilac, Ozet } from '@/lib/depo';
import { olayEkle } from '@/lib/depo';
import { AD, duzenler, ilacTur, useRol } from '@/lib/rol';
import { esitleSonra } from '@/lib/senk';
import { R, saydam } from '@/lib/tema';
import { tamAnahtar } from '@/lib/zaman';

export const SEKER_RENK = '#fb7185';
export const bugunIlac = (o: Ozet, d = new Date()) => (o.aile?.ilac || []).filter((i) => (i.tekrar === 'haftaici' ? d.getDay() % 6 !== 0 : i.tekrar === 'haftasonu' ? d.getDay() % 6 === 0 : true)).sort((a, b) => a.saat.localeCompare(b.saat));
export const alindiMi = (o: Ozet, i: Ilac, d = new Date()) => !!o.aile?.al[tamAnahtar(d) + '|' + i.id];

/** İlaç satırı: herkes yalnız kendi ilacını işaretler; diğerininki salt okunur görünür (sahibinin adıyla) */
export function IlacSatiri({ o, i }: { o: Ozet; i: Ilac }) {
  const ok = alindiMi(o, i), k = tamAnahtar(new Date()), rol = useRol(), benim = duzenler(rol, i.kim), iki = (o.aile?.ilac || []).some((x) => x.kim === 'kubra');
  const degis = () => { olayEkle(ilacTur(rol, 'ilac_al'), { k, id: i.id, al: ok ? 0 : 1 }); esitleSonra(); };
  return (
    <Pressable onPress={degis} disabled={!benim} accessibilityRole="checkbox" accessibilityState={{ checked: ok, disabled: !benim }} accessibilityLabel={i.ad + ' ' + i.saat + (benim ? '' : ', ' + AD[i.kim || 'cagla'] + ' işaretler')}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 12, borderRadius: 16, backgroundColor: ok ? 'rgba(62,207,90,0.10)' : 'rgba(255,255,255,0.05)', transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      <View style={{ width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: ok ? R.yesil : 'transparent', borderWidth: ok ? 0 : 2, borderColor: 'rgba(255,255,255,0.3)' }}>
        {ok && <Ikon ad="tik" boy={16} renk="#fff" kalin={3} />}
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ color: ok ? R.yazi2 : R.yazi, fontSize: 14.5, fontWeight: '600', textDecorationLine: ok ? 'line-through' : 'none' }}>{i.ad}</Text>
        <Text style={s.sub}>{[iki ? AD[i.kim || 'cagla'] : '', i.miktar, i.actok === 'ac' ? 'aç karnına' : i.actok === 'tok' ? 'tok karnına' : ''].filter(Boolean).join(' · ')}</Text>
      </View>
      <Text style={{ color: ok ? R.yesil : R.yazi2, fontSize: 13, fontWeight: '600' }}>{ok ? 'Alındı' : i.saat}</Text>
    </Pressable>
  );
}

/** Sabah açlık şekeri: − / + ile 5'er, yazarak da girilir. Bugün kayıtlıysa değeri gösterir. */
export function SekerSatiri({ o }: { o: Ozet }) {
  const k = tamAnahtar(new Date()), kayitli = o.aile?.seker[k], es = useRol() === 'es';
  const son = Object.keys(o.aile?.seker || {}).sort().reverse().find((x) => x < k);
  const [v, setV] = useState(String(kayitli ?? (son ? o.aile!.seker[son] : 100))), [duz, setDuz] = useState(kayitli == null);
  const n = parseInt(v, 10), gecerli = n >= 20 && n <= 600, dis = gecerli && (n > 130 || n < 80);
  const kaydet = () => { if (!gecerli) return; olayEkle('seker', { k, v: n }); esitleSonra(); setDuz(false); };
  const art = (d: number) => setV(String(Math.max(20, Math.min(600, (gecerli ? n : 100) + d))));
  // Şeker Çağlar’ın ölçümü: eşte yalnız görüntülenir
  if (es) return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 12, borderRadius: 16, backgroundColor: saydam(SEKER_RENK, 0.08) }}>
      <Ikon ad="damla" boy={20} renk={SEKER_RENK} kalin={2.1} />
      <View style={{ flex: 1 }}><Text style={{ color: R.yazi, fontSize: 14.5, fontWeight: '600' }}>{AD.cagla} · açlık şekeri {kayitli != null ? kayitli + ' mg/dL' : ''}</Text><Text style={[s.sub, kayitli != null && (kayitli > 130 || kayitli < 80) && { color: '#f7bd55' }]}>{kayitli == null ? 'Bugün henüz girilmedi' + (son ? ' · son ' + o.aile!.seker[son] + ' mg/dL' : '') : kayitli > 130 ? 'Hedefin üstünde (80–130)' : kayitli < 80 ? 'Hedefin altında (80–130)' : 'Hedef aralıkta'}</Text></View>
    </View>
  );
  if (!duz && kayitli != null) return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 12, borderRadius: 16, backgroundColor: saydam(SEKER_RENK, 0.1) }}>
      <Ikon ad="damla" boy={20} renk={SEKER_RENK} kalin={2.1} />
      <View style={{ flex: 1 }}><Text style={{ color: R.yazi, fontSize: 14.5, fontWeight: '600' }}>Açlık şekeri · {kayitli} mg/dL</Text><Text style={[s.sub, (kayitli > 130 || kayitli < 80) && { color: '#f7bd55' }]}>{kayitli > 130 ? 'Hedefin üstünde (80–130)' : kayitli < 80 ? 'Hedefin altında (80–130)' : 'Hedef aralıkta · bugün kaydedildi'}</Text></View>
      <Pressable onPress={() => { setV(String(kayitli)); setDuz(true); }} accessibilityRole="button" accessibilityLabel="Şeker değerini düzelt" hitSlop={6}><Text style={{ color: R.ana2, fontSize: 13, fontWeight: '600' }}>Düzelt</Text></Pressable>
    </View>
  );
  const Dg = ({ y, d }: { y: string; d: number }) => (
    <Pressable onPress={() => art(d)} accessibilityRole="button" accessibilityLabel={(d > 0 ? 'Artır ' : 'Azalt ') + Math.abs(d)} style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', transform: [{ scale: pressed ? 0.9 : 1 }] })}>
      <Text style={{ color: R.yazi, fontSize: 20, fontWeight: '600', marginTop: -2 }}>{y}</Text>
    </Pressable>
  );
  return (
    <View style={{ gap: 6, padding: 12, borderRadius: 16, backgroundColor: saydam(SEKER_RENK, 0.08), borderWidth: 1, borderColor: saydam(SEKER_RENK, 0.25) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ikon ad="damla" boy={18} renk={SEKER_RENK} kalin={2.1} />
        <Text style={{ flex: 1, color: R.yazi, fontSize: 14, fontWeight: '600' }}>Sabah açlık şekeri</Text>
        <Dg y="−" d={-5} />
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
          <TextInput value={v} onChangeText={(t) => setV(t.replace(/\D/g, '').slice(0, 3))} keyboardType="number-pad" accessibilityLabel="Açlık şekeri mg/dL" style={{ minWidth: 44, color: dis ? '#f7bd55' : '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', padding: 0 }} />
          <Text style={[s.sub, { fontSize: 10.5 }]}>mg/dL</Text>
        </View>
        <Dg y="+" d={5} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={[s.sub, { flex: 1, fontSize: 11.5 }, dis && { color: '#f7bd55' }]}>{!gecerli ? '20–600 arası bir değer yaz' : dis ? 'Hedef aralık dışında (80–130)' : 'Hedef 80–130 · aylık ilaç PDF’inde çizelge olur'}</Text>
        <Pressable onPress={kaydet} disabled={!gecerli} accessibilityRole="button" style={({ pressed }) => ({ height: 34, paddingHorizontal: 16, borderRadius: 17, justifyContent: 'center', backgroundColor: R.ana, opacity: gecerli ? 1 : 0.4, transform: [{ scale: pressed ? 0.95 : 1 }] })}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Kaydet</Text>
        </Pressable>
      </View>
    </View>
  );
}
