// Sağ çalışan menüsü (eski sol menünün yerine). Üstteki kişi simgesi ya da sağ kenardaki okla açılır.
// Yuvarlak profiller departman başlıklarıyla alt alta; çalışana dokununca Görev ver / Mesaj / Not.
// Gönderince yeşil bildirim, çalışan başına açılır-kapanır Geçmiş. 1,2 sn dokunulmazsa kapanır (yazarken kapanmaz).
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Ikon } from '@/bilesen/ortak';
import { olayEkle, uid } from '@/lib/depo';
import { Calisan, echoCevap } from '@/lib/ekip';
import { depAdi, SIRA, unvan } from '@/lib/ekipMeta';
import { Kip, menuKapat, menuKip, menuSec, useGezinti } from '@/lib/gezinti';
import { useKlavye } from '@/lib/klavye';
import { saatYazi, useEkip } from '@/lib/kullan';
import { esitleSonra, hizliBekle } from '@/lib/senk';
import { R, saydam } from '@/lib/tema';

const GIZLEME_MS = 1200;
const KIPLER: [Kip, string, string][] = [['gorev', 'Görev ver', 'artiDaire'], ['mesaj', 'Mesaj', 'mesaj'], ['not', 'Not', 'not']];
const BASLIK: Record<Kip, string> = { gorev: 'Görev ver', mesaj: 'Mesaj gönder', not: 'Not yaz' };
const YER: Record<Kip, string> = { gorev: 'Görevi yaz: ne, ne zamana kadar…', mesaj: 'Mesajını yaz…', not: 'Notunu yaz; çevrimdışıyken de kaydedilir…' };
const SONUC: Record<Kip, string> = { gorev: 'Görev iletildi', mesaj: 'Mesaj gönderildi', not: 'Not kaydedildi' };

type Gecmis = { tur: string; txt: string; ts: number };

export function CalisanMenusu() {
  const { acik, sec, kip, artir } = useGezinti((d) => d.menu);
  const { o, hepsi, durum } = useEkip();
  const { width: GW } = useWindowDimensions(), ust = useSafeAreaInsets().top, kl = useKlavye();
  const PW = Math.min(318, GW - 40);
  const tx = useRef(new Animated.Value(PW + 30)).current, sk = useRef(new Animated.Value(0)).current;
  const [ara, setAra] = useState(''), [txt, setTxt] = useState(''), [bildirim, setBildirim] = useState(''), [gk, setGk] = useState<Record<string, boolean>>({}), [aramaOdak, setAramaOdak] = useState(false);
  const zaman = useRef<ReturnType<typeof setTimeout> | null>(null), bz = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durumRef = useRef({ acik, kip, txt, odak: aramaOdak }); durumRef.current = { acik, kip, txt, odak: aramaOdak };
  const sc = useRef<any>(null), yler = useRef<Record<string, number>>({});

  const planla = useCallback(() => {
    if (zaman.current) clearTimeout(zaman.current);
    zaman.current = setTimeout(function bak() {
      const d = durumRef.current;
      if (!d.acik) return;
      if (d.kip || d.txt.trim() || d.odak) { zaman.current = setTimeout(bak, GIZLEME_MS); return; } // yazarken kapanmaz
      menuKapat();
    }, GIZLEME_MS);
  }, []);
  useEffect(() => () => { if (zaman.current) clearTimeout(zaman.current); if (bz.current) clearTimeout(bz.current); }, []);
  useEffect(() => {
    Animated.spring(tx, { toValue: acik ? 0 : PW + 30, friction: 9, tension: 70, useNativeDriver: true }).start();
    Animated.timing(sk, { toValue: acik ? 1 : 0, duration: 250, useNativeDriver: true }).start();
    if (acik) { planla(); } else if (zaman.current) clearTimeout(zaman.current);
    if (!acik) { setTxt(''); setAra(''); }
  }, [acik, artir, PW, tx, sk, planla]);
  useEffect(() => { if (acik && sec && yler.current[sec] != null) setTimeout(() => sc.current?.scrollTo({ y: Math.max(0, yler.current[sec] - 8), animated: true }), 120); }, [acik, sec, artir]);

  const liste = useMemo(() => {
    const ids = [...SIRA.filter((id) => hepsi.some((c) => c.id === id)), ...hepsi.filter((c) => !SIRA.includes(c.id)).map((c) => c.id)];
    const q = ara.toLocaleLowerCase('tr');
    return ids.map((id) => hepsi.find((c) => c.id === id) as Calisan).filter((c) => !q || c.ad.toLocaleLowerCase('tr').includes(q) || unvan(c.id, c.gorev).toLocaleLowerCase('tr').includes(q));
  }, [hepsi, ara]);
  const kim = sec ? hepsi.find((c) => c.id === sec) : undefined;
  const gonderilir = !!txt.trim() && !!kim;

  const gecmis = (c: Calisan): Gecmis[] => {
    const r: Gecmis[] = [];
    (o.ekip.sohbet[c.id] || []).forEach((m) => { if (m.r === 'ben') r.push({ tur: m.tur === 'not' ? 'Not' : 'Mesaj', txt: m.t, ts: m.ts }); });
    o.ekip.gorev.forEach((g) => { if (g.kim === c.id) r.push({ tur: 'Görev', txt: g.metin, ts: g.ts }); });
    return r.sort((a, b) => b.ts - a.ts).slice(0, 8);
  };
  const gonder = () => {
    if (!gonderilir || !kim || !kip) return;
    const t = txt.trim();
    if (kip === 'gorev') olayEkle('gorev', { id: uid(), kim: kim.id, ad: kim.ad, metin: t, onc: 'normal', son: '', bilgi: kim.id !== 'orin', sureDk: 0, tokenLimit: 0 });
    else {
      const r = kip === 'mesaj' && kim.id === 'echo' && !o.zeka?.bagli ? echoCevap(o, t) : null;
      olayEkle('mesaj', { kim: kim.id, t, mod: kip, bek: kip === 'mesaj' && !r ? 1 : 0 });
      if (r) olayEkle('cevap', { kim: kim.id, t: r.t, qr: r.qr });
      if (kip === 'mesaj' && !r) hizliBekle();
    }
    esitleSonra();
    if (bz.current) clearTimeout(bz.current);
    setBildirim(SONUC[kip] + ' · ' + kim.ad); bz.current = setTimeout(() => setBildirim(''), 2200);
    setTxt(''); menuKip(null); planla();
  };

  return (
    <>
      <Animated.View pointerEvents={acik ? 'auto' : 'none'} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', opacity: sk, zIndex: 8 }}>
        <Pressable style={{ flex: 1 }} onPress={menuKapat} accessibilityLabel="Çalışan menüsünü kapat" />
      </Animated.View>
      <Animated.View ref={kl.ref as any} onTouchStart={planla} pointerEvents={acik ? 'auto' : 'none'} accessibilityViewIsModal={acik} accessibilityLabel="Çalışanlar"
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: PW, zIndex: 9, borderTopLeftRadius: 26, borderBottomLeftRadius: 26, backgroundColor: 'rgba(32,32,36,0.985)', borderWidth: 1, borderRightWidth: 0, borderColor: R.camKenar, paddingTop: ust + 14, paddingHorizontal: 12, paddingBottom: kl.ortu > 0 ? kl.ortu + 8 : 12, transform: [{ translateX: tx }] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4, paddingBottom: 12 }}>
          <View style={{ flex: 1, gap: 2 }}><Text style={{ color: R.yazi, fontSize: 18, lineHeight: 24, fontWeight: '600' }}>Çalışanlar</Text><Text style={{ color: R.yazi2, fontSize: 12 }}>Doğrudan görev, mesaj ve not</Text></View>
          <Pressable onPress={menuKapat} accessibilityLabel="Kapat" style={ikDugme}><Ikon ad="kapat" boy={18} renk="#e9e9ec" /></Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, paddingHorizontal: 14, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: R.camKenar }}>
          <Ikon ad="ara" boy={18} renk="#b9b9bf" />
          <TextInput value={ara} onChangeText={(v) => { setAra(v); planla(); }} onFocus={() => setAramaOdak(true)} onBlur={() => { setAramaOdak(false); planla(); }} placeholder="Çalışan ara…" placeholderTextColor="#9a9aa1" accessibilityLabel="Çalışan ara" style={{ flex: 1, color: '#eee', fontSize: 14, paddingVertical: 0 }} />
        </View>
        <ScrollView ref={sc} onScroll={planla} scrollEventThrottle={64} keyboardShouldPersistTaps="handled" style={{ flex: 1, marginTop: 4 }} showsVerticalScrollIndicator={false}>
          {liste.map((c, i) => {
            const dep = depAdi(c.id), bas = i === 0 || depAdi(liste[i - 1].id) !== dep, ac = sec === c.id, g = ac ? gecmis(c) : [], kapGec = !!gk[c.id];
            return (
              <View key={c.id} onLayout={(e) => { yler.current[c.id] = e.nativeEvent.layout.y; }}>
                {bas && <Text style={{ color: '#8e8e95', fontSize: 11, lineHeight: 14, letterSpacing: 1.6, fontWeight: '700', paddingHorizontal: 8, paddingTop: 14, paddingBottom: 6 }}>{dep}</Text>}
                <Pressable onPress={() => menuSec(ac ? null : c.id, null)} accessibilityRole="button" accessibilityState={{ expanded: ac }} accessibilityLabel={c.ad + ', ' + unvan(c.id, c.gorev)}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: 18, backgroundColor: ac || pressed ? 'rgba(255,255,255,0.08)' : 'transparent' })}>
                  <Avatar c={c} boy={48} durum={durum(c)} />
                  <View style={{ flex: 1, gap: 2, minWidth: 0 }}><Text style={{ color: R.yazi, fontSize: 14, lineHeight: 18, fontWeight: '600' }}>{c.ad}</Text><Text numberOfLines={1} style={{ color: R.yazi2, fontSize: 12, lineHeight: 16 }}>{unvan(c.id, c.gorev)}</Text></View>
                  <View style={{ transform: [{ rotate: ac ? '180deg' : '0deg' }] }}><Ikon ad="asagi" boy={16} renk="#8e8e95" kalin={2.2} /></View>
                </Pressable>
                {ac && (
                  <View>
                    <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 6, paddingTop: 4, paddingBottom: 10 }}>
                      {KIPLER.map(([k, y, ik]) => (
                        <Pressable key={k} onPress={() => { menuKip(k); setTxt(''); }} accessibilityRole="button" accessibilityState={{ selected: kip === k }}
                          style={({ pressed }) => ({ flex: 1, minHeight: 64, paddingVertical: 8, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: kip === k ? saydam(R.ana, 0.6) : 'rgba(255,255,255,0.1)', backgroundColor: kip === k ? saydam(R.ana, 0.16) : 'rgba(255,255,255,0.05)', transform: [{ scale: pressed ? 0.93 : 1 }] })}>
                          <Ikon ad={ik} boy={20} renk="#e9e9ec" kalin={2} /><Text style={{ color: kip === k ? '#fff' : '#e9e9ec', fontSize: 11, fontWeight: '600' }}>{y}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <Pressable onPress={() => { menuKapat(); router.push(('/calisan/' + c.id) as any); }} accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 6, marginBottom: 8, paddingHorizontal: 12, minHeight: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)' }}>
                      <Text style={{ flex: 1, color: R.yazi, fontSize: 13, fontWeight: '600' }}>{c.ad} sayfasını aç</Text><Text style={{ color: R.yazi2, fontSize: 11.5 }}>sohbet · görev · beceri · hafıza</Text><Ikon ad="sag" boy={14} renk="#8e8e95" kalin={2.2} />
                    </Pressable>
                    <View style={{ marginHorizontal: 6, marginBottom: 10, paddingHorizontal: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
                      <Pressable onPress={() => setGk({ ...gk, [c.id]: !kapGec })} accessibilityRole="button" accessibilityState={{ expanded: !kapGec }} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <Text style={{ color: '#8e8e95', fontSize: 11, fontWeight: '700', letterSpacing: 1.6 }}>GEÇMİŞ</Text>
                        <Text style={{ color: R.yazi2, fontSize: 12 }}>{kapGec ? (g.length ? g.length + ' kayıt' : 'boş') : g.length ? 'Son: ' + saatYazi(g[0].ts) : ''}</Text>
                      </Pressable>
                      {!kapGec && (g.length ? g.map((h, n) => (
                        <View key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
                          <View style={{ height: 22, paddingHorizontal: 8, borderRadius: 11, backgroundColor: saydam(R.ana, 0.16), justifyContent: 'center' }}><Text style={{ color: R.ana2, fontSize: 10.5, fontWeight: '700' }}>{h.tur}</Text></View>
                          <Text numberOfLines={1} style={{ flex: 1, color: '#d2d2d7', fontSize: 12.5 }}>{h.txt}</Text><Text style={{ color: '#8e8e95', fontSize: 11 }}>{saatYazi(h.ts)}</Text>
                        </View>
                      )) : <Text style={{ color: '#8e8e95', fontSize: 12.5, paddingBottom: 10 }}>Henüz kayıt yok.</Text>)}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
          {!liste.length && <Text style={{ color: R.yazi2, fontSize: 13, textAlign: 'center', padding: 24 }}>Çalışan bulunamadı</Text>}
        </ScrollView>
        {!!bildirim && (
          <View accessibilityLiveRegion="polite" style={{ marginTop: 8, minHeight: 48, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, backgroundColor: 'rgba(62,207,90,0.18)', borderWidth: 1, borderColor: 'rgba(62,207,90,0.5)', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ikon ad="tik" boy={18} renk="#b5f5c3" kalin={2.4} /><Text style={{ flex: 1, color: '#b5f5c3', fontSize: 13, lineHeight: 18 }}>{bildirim}</Text>
          </View>
        )}
        {!!(kim && kip) && (
          <View style={{ marginTop: 10, padding: 12, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Avatar c={kim} boy={34} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{BASLIK[kip]} · {kim.ad}</Text>
                <Text style={{ color: R.yazi2, fontSize: 11.5 }}>{kip === 'not' ? 'Çalışanın kayıt sayfasına eklenir' : kip === 'gorev' ? 'Orin ve Orla atlanır, doğrudan çalışana gider' : 'Cevap bilgisayardaki Orvane açıkken gelir'}</Text>
              </View>
              <Pressable onPress={() => { menuKip(null); setTxt(''); planla(); }} accessibilityLabel="Vazgeç" style={ikDugme}><Ikon ad="kapat" boy={16} renk="#e9e9ec" /></Pressable>
            </View>
            <TextInput value={txt} onChangeText={(v) => { setTxt(v); planla(); }} multiline placeholder={YER[kip]} placeholderTextColor="#8e8e95" accessibilityLabel={BASLIK[kip]} style={{ minHeight: 66, maxHeight: 120, color: R.yazi, fontSize: 14, lineHeight: 20, padding: 0, textAlignVertical: 'top' }} />
            <Pressable onPress={gonder} disabled={!gonderilir} accessibilityRole="button" style={({ pressed }) => ({ height: 44, borderRadius: 22, backgroundColor: R.ana, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: gonderilir ? 1 : 0.45, transform: [{ scale: pressed ? 0.95 : 1 }] })}>
              <Ikon ad="ucak" boy={18} renk="#fff" kalin={2} /><Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{kip === 'not' ? 'Kaydet' : 'Gönder'}</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </>
  );
}
const ikDugme = { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' } as const;
