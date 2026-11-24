// İzin girişi (alt menü + › İzin): tür, başlangıç/bitiş günü, açıklama. Masaüstündeki İzinler › İzin ekle ile aynı kurallar
// (hafta sonu/tatil ve başka türle dolu günler atlanır, en fazla 31 gün). Olay 'izin' olarak masaüstüne gider.
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Dugme, Ikon, s } from '@/bilesen/ortak';
import { olayEkle, useDurum } from '@/lib/depo';
import { gunAnahtari, useGorunum } from '@/lib/ekip';
import { esitleSonra } from '@/lib/senk';
import { R, saydam } from '@/lib/tema';

export const IZIN_TURLERI: [string, string][] = [['yillik', 'Yıllık izin'], ['mazeret', 'Mazeret izni'], ['rapor13', 'Rapor'], ['refakat', 'Refakat izni'], ['ucretsiz', 'Ücretsiz izin'], ['sevk', 'İş yeri sevki']];
const AD: Record<string, string> = { ...Object.fromEntries(IZIN_TURLERI), rapor4: 'Rapor' };
const GN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const tarihOf = (k: string) => { const a = k.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
const kaydir = (k: string, n: number) => { const d = tarihOf(k); d.setDate(d.getDate() + n); return gunAnahtari(d); };
const once = (a: string, b: string) => tarihOf(a).getTime() < tarihOf(b).getTime(); // anahtarlar sıfırsız (2026-11-5): metin olarak karşılaştırılmaz
const yazi = (k: string) => { const d = tarihOf(k); return d.getDate() + ' ' + AY[d.getMonth()] + ' ' + GN[d.getDay()]; };

/** b..s arasındaki günler (iki uç dahil) */
export function izinGunleri(b: string, s2: string) {
  const r: string[] = []; let k = b;
  while (!once(s2, k) && r.length < 32) { r.push(k); k = kaydir(k, 1); }
  return r;
}

function GunSec({ etiket, deger, degis, en }: { etiket: string; deger: string; degis: (k: string) => void; en?: string }) {
  const ok = (y: 'sol' | 'sag', n: number) => {
    const kapali = n < 0 && !!en && !once(en, deger);
    return (
      <Pressable onPress={() => !kapali && degis(kaydir(deger, n))} accessibilityRole="button" accessibilityLabel={etiket + (n < 0 ? ' bir gün önce' : ' bir gün sonra')} accessibilityState={{ disabled: kapali }} hitSlop={6}
        style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)', opacity: kapali ? 0.35 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] })}>
        <Ikon ad={y} boy={18} renk={R.yazi} kalin={2.2} />
      </Pressable>
    );
  };
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.sub}>{etiket}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#252528', borderRadius: 14, padding: 6 }}>
        {ok('sol', -1)}
        <Text style={{ flex: 1, textAlign: 'center', color: R.yazi, fontSize: 15, fontWeight: '600' }}>{yazi(deger)}</Text>
        {ok('sag', 1)}
      </View>
    </View>
  );
}

export function IzinGirisi() {
  const o = useGorunum(), olaylar = useDurum((d) => d.olaylar);
  const bugun = gunAnahtari(new Date());
  const [tur, setTur] = useState('yillik'), [b, setB] = useState(bugun), [son, setSon] = useState(bugun), [not, setNot] = useState('');
  const [hata, setHata] = useState(''), [ok, setOk] = useState('');
  const bit = once(son, b) ? b : son, gunler = izinGunleri(b, bit);
  const isGunu = gunler.filter((k) => { const g = o.gun[k]; if (g) return !!g.L && (!g.D || g.D === tur); const d = tarihOf(k).getDay(); return d !== 0 && d !== 6; });
  const bekleyen = olaylar.filter((e) => e.tur === 'izin' && !e.gitti);

  const basDegis = (k: string) => { setB(k); if (once(son, k)) setSon(k); setHata(''); setOk(''); };
  const kaydet = () => {
    setOk('');
    if (gunler.length > 31) return setHata('En fazla 31 gün girilebilir');
    if (!isGunu.length) return setHata('Bu aralıkta izin yazılacak iş günü yok (hafta sonu, tatil ya da dolu)');
    olayEkle('izin', { t: tur, b, s: bit, a: not.trim() });
    esitleSonra(); setHata(''); setNot('');
    setOk(isGunu.length + ' iş günü ' + AD[tur].toLocaleLowerCase('tr') + ' olarak gönderildi');
  };

  return (
    <View style={{ gap: 14 }}>
      <View style={[s.cam, { padding: 14, borderRadius: 20, gap: 14 }]}>
        <View style={{ gap: 6 }}>
          <Text style={s.sub}>İzin türü</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {IZIN_TURLERI.map(([v, y]) => {
              const sec = v === tur;
              return (
                <Pressable key={v} onPress={() => { setTur(v); setHata(''); setOk(''); }} accessibilityRole="button" accessibilityState={{ selected: sec }}
                  style={({ pressed }) => ({ minHeight: 40, paddingHorizontal: 14, borderRadius: 20, justifyContent: 'center', borderWidth: 1, borderColor: sec ? R.ana : 'rgba(255,255,255,0.12)', backgroundColor: sec ? saydam(R.ana, 0.18) : 'rgba(255,255,255,0.05)', transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                  <Text style={{ color: sec ? R.ana2 : '#cfcfd4', fontSize: 14, fontWeight: '600' }}>{y}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <GunSec etiket="Başlangıç" deger={b} degis={basDegis} />
        <GunSec etiket="Bitiş" deger={bit} degis={(k) => { setSon(k); setHata(''); setOk(''); }} en={b} />
        <Text style={{ color: R.yazi2, fontSize: 13 }}>{gunler.length} gün · {isGunu.length} iş günü işlenecek</Text>
        <TextInput value={not} onChangeText={setNot} placeholder="Açıklama (isteğe bağlı)" placeholderTextColor={R.soluk} accessibilityLabel="Açıklama"
          style={{ color: '#fff', fontSize: 15, backgroundColor: '#252528', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 }} />
        {!!hata && <Text style={{ color: R.kirmizi, fontSize: 13 }}>{hata}</Text>}
        {!!ok && <Text style={{ color: R.yesil, fontSize: 13 }}>{ok}</Text>}
        <Dugme yazi="İzni kaydet" ikon="kaydet" onPress={kaydet} />
        <Text style={{ color: R.soluk, fontSize: 12.5 }}>Hafta sonu, resmî tatil ve başka türle dolu günler atlanır. Bilgisayardaki Orvane’de İzinler’e işlenir.</Text>
      </View>
      {bekleyen.length > 0 && (
        <View style={[s.cam, { padding: 14, borderRadius: 20, gap: 8 }]}>
          <Text style={s.sub}>Gönderilmeyi bekleyen</Text>
          {bekleyen.map((e) => (
            <View key={e.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ikon ad="izin" boy={18} renk={R.turuncu} kalin={2} />
              <Text style={{ flex: 1, color: R.yazi, fontSize: 14 }}>{AD[e.veri.t] || 'İzin'} · {yazi(e.veri.b)}{e.veri.s !== e.veri.b ? ' – ' + yazi(e.veri.s) : ''}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
