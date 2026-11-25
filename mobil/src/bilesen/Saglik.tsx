// Sağlık parçaları (0.9.0, 0.9.2): bugünkü ilaçlar (kayar düğmeyle içildi işareti) ve sabah açlık şekeri satırı. Anasayfa ve Bana Özel kullanır.
// Olaylar: ilac_al {k, id, al} · seker {k, v, s} (s: yazıldığı saat "HH:MM"). k = "YYYY-MM-DD" (masaüstü OA.bugunKey). Masaüstü orv-telefon.js uygular.
import { useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';
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

/** Günün bölümü: 11:00 öncesi Sabah, 16:00 öncesi Öğlen, sonrası Akşam */
export const donem = (saat: string) => { const h = parseInt(saat, 10); return isNaN(h) ? '' : h < 11 ? 'Sabah' : h < 16 ? 'Öğlen' : 'Akşam'; };
/** "1 · Sabah · Tok" */
export const ilacAlt = (i: Ilac) => [i.miktar, donem(i.saat), i.actok === 'ac' ? 'Aç' : i.actok === 'tok' ? 'Tok' : ''].filter(Boolean).join(' · ');

/** İlaç satırı: sıra no · ad · doz · Sabah/Öğlen/Akşam · Aç/Tok · saat · kayar düğme (içince açılır).
 *  Herkes yalnız kendi ilacını işaretler; diğerininki salt okunur görünür. duzenle verilirse ada dokununca düzeltme açılır. */
export function IlacSatiri({ o, i, no, duzenle, ek }: { o: Ozet; i: Ilac; no?: number; duzenle?: () => void; ek?: string }) {
  const ok = alindiMi(o, i), k = tamAnahtar(new Date()), rol = useRol(), benim = duzenler(rol, i.kim), iki = (o.aile?.ilac || []).some((x) => x.kim === 'kubra');
  const degis = (v: boolean) => { if (v === ok) return; olayEkle(ilacTur(rol, 'ilac_al'), { k, id: i.id, al: v ? 1 : 0 }); esitleSonra(); };
  const alt = [iki ? AD[i.kim || 'cagla'] : '', ilacAlt(i), ek].filter(Boolean).join(' · ');
  const Govde = (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {no != null && <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: ok ? R.yesil : 'rgba(255,255,255,0.08)' }}><Text style={{ color: ok ? '#fff' : R.yazi, fontSize: 12.5, fontWeight: '800' }}>{no}</Text></View>}
      <View style={{ flex: 1, gap: 1 }}>
        <Text numberOfLines={1} style={{ color: ok ? R.yazi2 : R.yazi, fontSize: 14.5, fontWeight: '600' }}>{i.ad}</Text>
        <Text numberOfLines={1} style={s.sub}>{alt}</Text>
      </View>
      <Text style={{ color: ok ? R.yesil : R.yazi, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{i.saat}</Text>
    </View>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingLeft: 10, paddingRight: 6, borderRadius: 16, backgroundColor: ok ? 'rgba(62,207,90,0.10)' : 'rgba(255,255,255,0.05)' }}>
      {duzenle ? <Pressable onPress={duzenle} accessibilityRole="button" accessibilityLabel={i.ad + ' düzelt'} style={{ flex: 1 }}>{Govde}</Pressable> : Govde}
      <Switch value={ok} onValueChange={degis} disabled={!benim} trackColor={{ true: R.yesil, false: '#3a3a40' }} thumbColor="#fff"
        accessibilityLabel={(no != null ? no + '. ' : '') + i.ad + ' ' + i.saat + (ok ? ', içildi' : ', içilmedi') + (benim ? '' : ', ' + AD[i.kim || 'cagla'] + ' işaretler')} />
    </View>
  );
}

/** Sabah açlık şekeri: − / + ile 5'er, yazarak da girilir. Bugün kayıtlıysa değeri gösterir. */
export function SekerSatiri({ o }: { o: Ozet }) {
  const k = tamAnahtar(new Date()), kayitli = o.aile?.seker[k], saat = o.aile?.sekerSaat?.[k], es = useRol() === 'es';
  const son = Object.keys(o.aile?.seker || {}).sort().reverse().find((x) => x < k);
  const [v, setV] = useState(String(kayitli ?? (son ? o.aile!.seker[son] : 100))), [duz, setDuz] = useState(kayitli == null);
  const n = parseInt(v, 10), gecerli = n >= 20 && n <= 600, dis = gecerli && (n > 130 || n < 80);
  const kaydet = () => { if (!gecerli) return; const d = new Date(); olayEkle('seker', { k, v: n, s: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') }); esitleSonra(); setDuz(false); };
  const art = (d: number) => setV(String(Math.max(20, Math.min(600, (gecerli ? n : 100) + d))));
  // Şeker Çağlar’ın ölçümü: eşte yalnız görüntülenir
  if (es) return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 12, borderRadius: 16, backgroundColor: saydam(SEKER_RENK, 0.08) }}>
      <Ikon ad="damla" boy={20} renk={SEKER_RENK} kalin={2.1} />
      <View style={{ flex: 1 }}><Text style={{ color: R.yazi, fontSize: 14.5, fontWeight: '600' }}>{AD.cagla} · açlık şekeri {kayitli != null ? kayitli + ' mg/dL' + (saat ? ' · ' + saat : '') : ''}</Text><Text style={[s.sub, kayitli != null && (kayitli > 130 || kayitli < 80) && { color: '#f7bd55' }]}>{kayitli == null ? 'Bugün henüz girilmedi' + (son ? ' · son ' + o.aile!.seker[son] + ' mg/dL' : '') : kayitli > 130 ? 'Hedefin üstünde (80–130)' : kayitli < 80 ? 'Hedefin altında (80–130)' : 'Hedef aralıkta'}</Text></View>
    </View>
  );
  if (!duz && kayitli != null) return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 12, borderRadius: 16, backgroundColor: saydam(SEKER_RENK, 0.1) }}>
      <Ikon ad="damla" boy={20} renk={SEKER_RENK} kalin={2.1} />
      <View style={{ flex: 1 }}><Text style={{ color: R.yazi, fontSize: 14.5, fontWeight: '600' }}>Açlık şekeri · {kayitli} mg/dL{saat ? ' · ' + saat : ''}</Text><Text style={[s.sub, (kayitli > 130 || kayitli < 80) && { color: '#f7bd55' }]}>{kayitli > 130 ? 'Hedefin üstünde (80–130)' : kayitli < 80 ? 'Hedefin altında (80–130)' : 'Hedef aralıkta · bugün kaydedildi'}</Text></View>
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
