// Sağlık parçaları (0.9.0, 0.9.2, 0.9.4): bugünkü ilaçlar (kayar düğmeyle içildi işareti), sabah açlık şekeri satırı, spor kartı. Anasayfa ve Bana Özel kullanır.
// Olaylar: ilac_al {k, id, al} · seker {k, v, s} (s: yazıldığı saat "HH:MM"). k = "YYYY-MM-DD" (masaüstü OA.bugunKey). Masaüstü orv-telefon.js uygular.
import { useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';
import { Ikon, s } from '@/bilesen/ortak';
import type { Ilac, Kisi, Ozet, Spor } from '@/lib/depo';
import { olayEkle } from '@/lib/depo';
import { SPOR_TUR } from '@/lib/ekip';
import { AD, benKimim, duzenler, ilacTur, useRol } from '@/lib/rol';
import { esitleSonra } from '@/lib/senk';
import { R, saydam } from '@/lib/tema';
import { bugunAnahtari, useBugun } from '@/lib/bugun';
import { gunEkle, tamAnahtar, tarihOf } from '@/lib/zaman';

export const SEKER_RENK = '#fb7185';
/** d: tarih ya da yerel gün anahtarı ("YYYY-AA-GG", useBugun) */
/** kim verilirse yalnız o kişinin ilaçları (0.9.9: herkes Anasayfa/Sağlık’ta kendi ilaçlarını görür) */
export const bugunIlac = (o: Ozet, d: Date | string = new Date(), kim?: Kisi) => {
  const g = (typeof d === 'string' ? tarihOf(d) : d).getDay();
  return (o.aile?.ilac || []).filter((i) => !kim || (i.kim || 'cagla') === kim).filter((i) => (i.tekrar === 'haftaici' ? g % 6 !== 0 : i.tekrar === 'haftasonu' ? g % 6 === 0 : true)).sort((a, b) => a.saat.localeCompare(b.saat));
};
/** k: yerel gün anahtarı. Ekranlar useBugun() verir; böylece 00:00'da işaretler kendiliğinden boş görünür. */
export const alindiMi = (o: Ozet, i: Ilac, k: string = bugunAnahtari()) => !!o.aile?.al[k + '|' + i.id];

/** Günün bölümü: 11:00 öncesi Sabah, 16:00 öncesi Öğlen, sonrası Akşam */
export const donem = (saat: string) => { const h = parseInt(saat, 10); return isNaN(h) ? '' : h < 11 ? 'Sabah' : h < 16 ? 'Öğlen' : 'Akşam'; };
/** "1 · Sabah · Tok" */
export const ilacAlt = (i: Ilac) => [i.miktar, donem(i.saat), i.actok === 'ac' ? 'Aç' : i.actok === 'tok' ? 'Tok' : ''].filter(Boolean).join(' · ');

/** İlaç satırı: sıra no · ad · doz · Sabah/Öğlen/Akşam · Aç/Tok · saat · kayar düğme (içince açılır).
 *  Herkes yalnız kendi ilacını işaretler; diğerininki salt okunur görünür. duzenle verilirse ada dokununca düzeltme açılır. */
export function IlacSatiri({ o, i, no, duzenle, ek }: { o: Ozet; i: Ilac; no?: number; duzenle?: () => void; ek?: string }) {
  const bugun = useBugun(), ok = alindiMi(o, i, bugun), rol = useRol(), benim = duzenler(rol, i.kim), iki = (o.aile?.ilac || []).some((x) => x.kim === 'kubra');
  // Tarih dokunulduğu anda alınır: ekran gece yarısından önce çizilmiş olsa da işaret o günün tarihine yazılır
  const degis = (v: boolean) => { const k = bugunAnahtari(); if (v === alindiMi(o, i, k)) return; olayEkle(ilacTur(rol, 'ilac_al'), { k, id: i.id, al: v ? 1 : 0 }); esitleSonra(); };
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
  const k = useBugun(), kayitli = o.aile?.seker[k], saat = o.aile?.sekerSaat?.[k], es = useRol() === 'es';
  const son = Object.keys(o.aile?.seker || {}).sort().reverse().find((x) => x < k);
  const [v, setV] = useState(String(kayitli ?? (son ? o.aile!.seker[son] : 100))), [duz, setDuz] = useState(kayitli == null);
  const n = parseInt(v, 10), gecerli = n >= 20 && n <= 600, dis = gecerli && (n > 130 || n < 80);
  const kaydet = () => { if (!gecerli) return; const d = new Date(); olayEkle('seker', { k: bugunAnahtari(d), v: n, s: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') }); esitleSonra(); setDuz(false); };
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

// ---------- Spor (0.9.4): günlük adım, yürüyüş dakikası, başka aktivite ----------
// Olay: spor {k, kim, adim, dk, tur, tdk, s}. Herkes kendi gününü yazar; eşininkini görür. Masaüstü OT9.spor uygular.
export const SPOR_RENK = '#38bdf8';
export const ADIM_HEDEF = 8000, DK_HEDEF = 30;
const binlik = (n: number) => n.toLocaleString('tr-TR');
export const sporKaydi = (o: Ozet, k: string, kim: Kisi): Spor | undefined => o.aile?.spor?.[k + '|' + kim];
const toplamDk = (x?: Spor) => (x ? x.dk + x.tdk : 0);
const hedefte = (x?: Spor) => !!x && (x.adim >= ADIM_HEDEF || toplamDk(x) >= DK_HEDEF);
const turAd = (x?: Spor) => (x?.tur && x.tdk ? x.tdk + ' dk ' + (SPOR_TUR[x.tur] || '').toLocaleLowerCase('tr') : '');
const sporAlt = (x: Spor) => [x.adim ? binlik(x.adim) + ' adım' : '', x.dk ? x.dk + ' dk yürüyüş' : '', turAd(x)].filter(Boolean).join(' · ');

/** Son 7 gün (bugün dahil) ve arka arkaya hedefte geçen gün sayısı (bugün henüz hedefte değilse dünden sayar) */
export function sporOzet(o: Ozet, kim: Kisi) {
  const b = new Date(), gun: { k: string; h: string; x?: Spor }[] = [];
  for (let i = 6; i >= 0; i--) { const d = gunEkle(b, -i), k = tamAnahtar(d); gun.push({ k, h: 'PSÇPCCP'[(d.getDay() + 6) % 7], x: sporKaydi(o, k, kim) }); }
  let seri = 0;
  for (let i = 0; i < 400; i++) { if (hedefte(sporKaydi(o, tamAnahtar(gunEkle(b, -i)), kim))) seri++; else if (i > 0) break; }
  const v = gun.filter((g) => g.x), adim = v.reduce((t, g) => t + (g.x!.adim || 0), 0), dk = v.reduce((t, g) => t + toplamDk(g.x), 0);
  return { gun, seri, ortAdim: v.length ? Math.round(adim / v.length) : 0, dk, aktif: v.length };
}

function Cubuk({ v, h, renk }: { v: number; h: number; renk: string }) {
  return (
    <View style={{ height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(100, Math.round((v / h) * 100))}%`, height: '100%', backgroundColor: renk, borderRadius: 4 }} />
    </View>
  );
}

function Sayac({ et, v, setV, adim, en, birim }: { et: string; v: string; setV: (s: string) => void; adim: number; en: number; birim: string }) {
  const n = parseInt(v, 10) || 0, art = (d: number) => setV(String(Math.max(0, Math.min(en, n + d))));
  const Dg = ({ y, d }: { y: string; d: number }) => (
    <Pressable onPress={() => art(d)} accessibilityRole="button" accessibilityLabel={et + (d > 0 ? ' artır ' : ' azalt ') + Math.abs(d)} style={({ pressed }) => ({ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', transform: [{ scale: pressed ? 0.9 : 1 }] })}>
      <Text style={{ color: R.yazi, fontSize: 19, fontWeight: '600', marginTop: -2 }}>{y}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ flex: 1, color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{et}</Text>
      <Dg y="−" d={-adim} />
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3, minWidth: 82, justifyContent: 'center' }}>
        <TextInput value={v} onChangeText={(t) => setV(t.replace(/\D/g, '').slice(0, String(en).length))} keyboardType="number-pad" selectTextOnFocus accessibilityLabel={et}
          style={{ minWidth: 40, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', padding: 0, fontVariant: ['tabular-nums'] }} />
        <Text style={[s.sub, { fontSize: 10.5 }]}>{birim}</Text>
      </View>
      <Dg y="+" d={adim} />
    </View>
  );
}

const TURLER: [string, string][] = [['', 'Yok'], ...Object.entries(SPOR_TUR)];

/** Spor kartı: bugünkü adım / yürüyüş / başka aktivite girişi, hedef çubukları, 7 günlük adım grafiği, eşin bugünü */
export function SporKarti({ o }: { o: Ozet }) {
  const rol = useRol(), ben = benKimim(rol), diger: Kisi = ben === 'cagla' ? 'kubra' : 'cagla';
  const k = useBugun(), x = sporKaydi(o, k, ben), dx = sporKaydi(o, k, diger), oz = sporOzet(o, ben);
  const [duz, setDuz] = useState(!x);
  const [adim, setAdim] = useState(String(x?.adim ?? 0)), [dk, setDk] = useState(String(x?.dk ?? 0)), [tur, setTur] = useState(x?.tur || ''), [tdk, setTdk] = useState(String(x?.tdk ?? 0));
  const ac = () => { setAdim(String(x?.adim ?? 0)); setDk(String(x?.dk ?? 0)); setTur(x?.tur || ''); setTdk(String(x?.tdk ?? 0)); setDuz(true); };
  const kaydet = () => {
    const d = new Date(), tn = tur ? parseInt(tdk, 10) || 0 : 0;
    olayEkle('spor', { k, kim: ben, adim: parseInt(adim, 10) || 0, dk: parseInt(dk, 10) || 0, tur, tdk: tn, s: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') });
    esitleSonra(); setDuz(false);
  };
  const enAdim = Math.max(ADIM_HEDEF, ...oz.gun.map((g) => g.x?.adim || 0));
  return (
    <View style={{ gap: 10, padding: 12, borderRadius: 16, backgroundColor: saydam(SPOR_RENK, 0.07), borderWidth: 1, borderColor: saydam(SPOR_RENK, 0.22) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ikon ad="adim" boy={18} renk={SPOR_RENK} kalin={2} />
        <Text style={{ flex: 1, color: R.yazi, fontSize: 14, fontWeight: '700' }}>Bugün · spor</Text>
        {oz.seri > 1 && <Text style={{ color: SPOR_RENK, fontSize: 12, fontWeight: '700' }}>{oz.seri} gün üst üste</Text>}
        {!duz && <Pressable onPress={ac} accessibilityRole="button" accessibilityLabel="Bugünkü sporu düzelt" hitSlop={6}><Text style={{ color: R.ana2, fontSize: 13, fontWeight: '600' }}>Düzelt</Text></Pressable>}
      </View>

      {duz ? (
        <View style={{ gap: 8 }}>
          <Sayac et="Adım" v={adim} setV={setAdim} adim={500} en={100000} birim="adım" />
          <Sayac et="Yürüyüş" v={dk} setV={setDk} adim={5} en={600} birim="dk" />
          <Text style={[s.sub, { fontSize: 12 }]}>Başka aktivite</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {TURLER.map(([v, y]) => {
              const on = v === tur;
              return (
                <Pressable key={v || 'yok'} onPress={() => setTur(v)} accessibilityRole="button" accessibilityState={{ selected: on }}
                  style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: on ? 'transparent' : 'rgba(255,255,255,0.12)', backgroundColor: on ? saydam(SPOR_RENK, 0.3) : 'transparent' }}>
                  <Text style={{ color: on ? '#fff' : R.soluk, fontSize: 13, fontWeight: on ? '600' : '400' }}>{y}</Text>
                </Pressable>
              );
            })}
          </View>
          {!!tur && <Sayac et={SPOR_TUR[tur]} v={tdk} setV={setTdk} adim={5} en={600} birim="dk" />}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={[s.sub, { flex: 1, fontSize: 11.5 }]}>Hedef {binlik(ADIM_HEDEF)} adım ya da {DK_HEDEF} dk hareket</Text>
            {x && <Pressable onPress={() => setDuz(false)} accessibilityRole="button" hitSlop={6}><Text style={{ color: R.soluk, fontSize: 13 }}>Vazgeç</Text></Pressable>}
            <Pressable onPress={kaydet} accessibilityRole="button" style={({ pressed }) => ({ height: 34, paddingHorizontal: 16, borderRadius: 17, justifyContent: 'center', backgroundColor: R.ana, transform: [{ scale: pressed ? 0.95 : 1 }] })}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Kaydet</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{binlik(x?.adim || 0)} adım</Text><Text style={s.sub}>hedef {binlik(ADIM_HEDEF)}</Text></View>
            <Cubuk v={x?.adim || 0} h={ADIM_HEDEF} renk={SPOR_RENK} />
          </View>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{toplamDk(x)} dk hareket</Text><Text style={s.sub}>{[x?.dk ? x.dk + ' dk yürüyüş' : '', turAd(x)].filter(Boolean).join(' · ') || 'hedef ' + DK_HEDEF + ' dk'}</Text></View>
            <Cubuk v={toplamDk(x)} h={DK_HEDEF} renk={R.yesil} />
          </View>
          {hedefte(x) && <Text style={{ color: R.yesil, fontSize: 12.5, fontWeight: '600' }}>Bugünkü hedef tamam{x?.s ? ' · ' + x.s : ''}</Text>}
        </View>
      )}

      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 64 }} accessible accessibilityLabel={'Son 7 gün adım: ' + oz.gun.map((g) => g.h + ' ' + (g.x?.adim || 0)).join(', ')}>
          {oz.gun.map((g, i) => {
            const a = g.x?.adim || 0, ok = hedefte(g.x);
            return (
              <View key={g.k} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
                <View style={{ width: '70%', height: Math.max(3, Math.round((a / enAdim) * 46)), borderRadius: 4, backgroundColor: ok ? SPOR_RENK : a ? saydam(SPOR_RENK, 0.45) : 'rgba(255,255,255,0.08)' }} />
                <Text style={{ color: i === 6 ? R.yazi : R.solukk, fontSize: 10.5, fontWeight: i === 6 ? '700' : '500' }}>{g.h}</Text>
              </View>
            );
          })}
        </View>
        <Text style={[s.sub, { fontSize: 11.5 }]}>7 gün · ort. {binlik(oz.ortAdim)} adım · toplam {oz.dk} dk · {oz.aktif} gün kayıt</Text>
      </View>

      {!!dx && <Text style={[s.sub, { fontSize: 12 }]}>{AD[diger]} bugün: {sporAlt(dx) || '—'}</Text>}
    </View>
  );
}
