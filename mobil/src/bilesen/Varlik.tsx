// 0.9.14 · Ailem › Altın Hesabım ve FuzulEv (salt okunur). Veri masaüstünden gelir (renderer/js/orv-varlik-tel.js → aile.altin / aile.fuzulev);
// yalnız Çağlar'ın telefonuna gelir, eşin özetinde yoktur. Telefon değiştirmez; kayıt ekleme/düzeltme masaüstündedir.
// Tasarım: masaüstündeki Claude Design "Orvane · FuzulEv ve Altın Hesabım" dili (altın tonları, taksit türü renkleri, ▲ / ▼).
// FuzulEv gecikmesi telefonda bugünün tarihine göre yeniden hesaplanır (masaüstü kapalıyken de uyarı güncel kalır).
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Bos } from '@/bilesen/formlar';
import { Bolumler, Ekran, Hap, Ikon, s } from '@/bilesen/ortak';
import type { Altin, FeDurum, FuzulEv, Ozet } from '@/lib/depo';
import { useGorunum } from '@/lib/ekip';
import { useRol } from '@/lib/rol';
import { yeniGoruldu } from '@/lib/yeni';
import { R, saydam } from '@/lib/tema';
import { AY, tamAnahtar, tarihOf } from '@/lib/zaman';

const YESIL = '#7ee2a0', KIRMIZI = '#ff9a85', ALTIN = '#e0a32e';
const ok = (d: number | null | undefined) => (d == null || d === 0 ? '' : d > 0 ? '▲ ' : '▼ ');
const renk = (d: number | null | undefined) => (d == null || d === 0 ? R.yazi2 : d > 0 ? YESIL : KIRMIZI);
// Türkçe sayı biçimi elle (cihazın Intl verisine bağlı kalmasın): binlik nokta, ondalık virgül. k: en çok ondalık, sondaki sıfırlar atılır.
export function sayiTr(n: number, k = 0) {
  const neg = n < 0, [t, o = ''] = Math.abs(n).toFixed(k).split('.'), ond = o.replace(/0+$/, '');
  return (neg ? '−' : '') + t.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (ond ? ',' + ond : '');
}
export const tl = (n: number) => sayiTr(Math.round(n)) + ' ₺';
const yuzde = (p: number, k = 1) => '%' + sayiTr(Math.abs(p), k);
const miktar = (n: number, b: 'gr' | 'adet') => sayiTr(n, b === 'gr' ? 3 : 0) + ' ' + b;
const tarihY = (t: string) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return '—'; const d = tarihOf(t); return d.getDate() + ' ' + AY[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); };
const ayY = (a: string) => (/^\d{4}-\d{2}/.test(a) ? AY[+a.slice(5, 7) - 1].slice(0, 3) + ' ' + a.slice(0, 4) : '—');
const gunFark = (a: string, b: string) => Math.round((tarihOf(b).getTime() - tarihOf(a).getTime()) / 864e5);

/** Küçük gösterge kutusu (tasarım: stat kartı) */
function Gosterge({ et, deger, birim, alt, altRenk, vurgu }: { et: string; deger: string; birim?: string; alt?: string; altRenk?: string; vurgu?: string }) {
  return (
    <View style={{ width: '48%', flexGrow: 1, padding: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', gap: 3 }}>
      <Text style={[s.sub, { fontSize: 11.5 }]}>{et}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: vurgu || R.yazi, fontSize: 20, fontWeight: '700', flexShrink: 1 }}>{deger}</Text>
        {!!birim && <Text style={{ color: R.yazi2, fontSize: 12, fontWeight: '600' }}>{birim}</Text>}
      </View>
      {!!alt && <Text numberOfLines={2} style={[s.sub, { fontSize: 11, color: altRenk || R.yazi2 }]}>{alt}</Text>}
    </View>
  );
}
/** Veri yoksa değer üretilmez: "veri yok" ve nedeni (masaüstü kuralı) */
const VeriYok = ({ neden }: { neden: string }) => <View style={{ gap: 2 }}><Text style={{ color: R.soluk, fontSize: 15, fontWeight: '700' }}>veri yok</Text><Text style={[s.sub, { color: '#f7bd55' }]}>{neden}</Text></View>;
const SaltOkunur = ({ yazi }: { yazi: string }) => <Text style={[s.sub, { fontSize: 11, color: R.soluk }]}>{yazi}</Text>;

// ======================= Altın Hesabım =======================
// Tür tonları masaüstündeki AH.TON sırasıyla aynı (tür listesi sırası → ton)
const TURLER = ['gram', 'has', 'bilezik22', 'ayar18', 'ayar14', 'ceyrek', 'yarim', 'tam', 'cumhuriyet', 'ata', 'resat', 'gremse', 'ikibucuk', 'besli', 'bilezik', 'taki'];
const TON = ['#fde68a', '#e0a32e', '#b7791f', '#f5c451', '#8a5a14', '#fff1b8'];
const ton = (tur: string) => TON[Math.max(0, TURLER.indexOf(tur)) % TON.length];
const FIYAT_AD: [string, string][] = [['gram', 'Gram altın'], ['ceyrek', 'Çeyrek altın'], ['yarim', 'Yarım altın'], ['tam', 'Tam altın'], ['cumhuriyet', 'Cumhuriyet altını']];

/** Kutucuğun alt satırı: toplam değer ve günlük değişim */
export function altinOzet(a?: Altin): [string, string] {
  if (!a || !a.kalem.length) return ['Masaüstünde kayıt girilince görünür', R.yazi2];
  if (!a.fiyat) return [a.kalem.length + ' kayıt · fiyat bekleniyor', R.yazi2];
  return [tl(a.top.deger) + (a.top.gunluk ? '  ' + ok(a.top.gunluk) + yuzde(a.top.gunlukP, 2) : ''), renk(a.top.gunluk)];
}

export function AltinPanel({ o }: { o: Ozet }) {
  const a = o.aile?.altin;
  if (!a || !a.kalem.length) return <Bos yazi={o.ts ? 'Henüz altın kaydı yok. Masaüstünde Ailem › Altın Hesabım’dan ekleyince burada görünür.' : 'Bilgisayarla eşitlenince Altın Hesabım burada görünür.'} ikon="altin" />;
  const T = a.top, f = a.fiyat;
  // Türlere göre dağılım
  const G: Record<string, { ad: string; v: number; tur: string }> = {};
  a.kalem.forEach((k) => { if (!(k.deger && k.deger > 0)) return; (G[k.tur] = G[k.tur] || { ad: k.ad, v: 0, tur: k.tur }).v += k.deger; });
  const dag = Object.values(G).sort((x, y) => y.v - x.v);
  // 0.9.15: toplam gram (adetliler dahil) ve has karşılığı; eski masaüstü özetinde gramTop yoksa eski gösterim
  const yak = T.gramStd ? '≈ ' : '';
  const birimler = T.gramTop != null ? [T.adet ? miktar(T.adet, 'adet') : '', yak + miktar(T.gramTop, 'gr')].filter(Boolean).join(' · ')
    : [T.gram ? miktar(T.gram, 'gr') : '', T.adet ? miktar(T.adet, 'adet') : ''].filter(Boolean).join(' · ');
  const gramYaz = (k: Altin['kalem'][number]) => k.gram == null ? '' : (k.birim === 'adet' ? ' · ' + (k.gramStd ? '≈ ' : '') + miktar(k.gram, 'gr') : '') + (k.ayar ? ' · ' + k.ayar + ' ayar' : '') + (k.has != null ? ' · has ' + miktar(k.has, 'gr') : '');
  const agMap: Record<string, NonNullable<Altin['ag']>['satir'][number]> = {};
  (a.ag?.satir || []).forEach((x) => { agMap[x.id] = x; });
  return (
    <>
      {/* Toplam değer (hero) */}
      <View style={{ padding: 16, borderRadius: 20, backgroundColor: 'rgba(224,163,46,0.09)', borderWidth: 1, borderColor: 'rgba(224,163,46,0.28)', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ALTIN }} />
          <Text style={[s.sub, { flex: 1 }]}>Toplam değer · satış fiyatıyla</Text>
          {!!birimler && <Text style={{ color: R.yazi, fontSize: 12, fontWeight: '700' }}>{birimler}</Text>}
        </View>
        {f ? (
          <>
            <Text adjustsFontSizeToFit numberOfLines={1} accessibilityLabel={'Toplam değer ' + tl(T.deger)} style={{ color: '#fff', fontSize: 34, fontWeight: '800', letterSpacing: -0.5 }}>{tl(T.deger)}</Text>
            <Text style={[s.sub, { color: '#e6dcc4' }]}>
              Bugün <Text style={{ color: renk(T.gunluk), fontWeight: '700' }}>{ok(T.gunluk)}{tl(Math.abs(T.gunluk))} {yuzde(T.gunlukP, 2)}</Text> · bozdurursan ≈ <Text style={{ color: R.yazi, fontWeight: '700' }}>{tl(T.bozdur)}</Text>
              {T.eksik ? ' · ' + T.eksik + ' türün fiyatı yok' : ''}
            </Text>
          </>
        ) : <Text style={s.soluk}>Fiyat bekleniyor · masaüstünde Altın Hesabım açılınca gelir.</Text>}
        {T.gramTop != null && T.has != null && (
          <Text accessibilityLabel={'Toplam ' + sayiTr(T.gramTop, 3) + ' gram, has altın karşılığı ' + sayiTr(T.has, 3) + ' gram'} style={[s.sub, { color: '#e6dcc4' }]}>
            Toplam <Text style={{ color: R.yazi, fontWeight: '700' }}>{yak}{miktar(T.gramTop, 'gr')}</Text> · has altın karşılığı <Text style={{ color: R.yazi, fontWeight: '700' }}>{yak}{miktar(T.has, 'gr')}</Text>
            {T.gramStd ? ' (' + T.gramStd + ' kayıt standart ağırlıkla)' : ''}
          </Text>
        )}
        {dag.length > 0 && T.deger > 0 && (
          <>
            <View accessibilityLabel="Türlere göre dağılım" style={{ flexDirection: 'row', height: 9, borderRadius: 5, overflow: 'hidden', gap: 2, marginTop: 2 }}>
              {dag.map((x) => <View key={x.tur} style={{ flex: x.v, backgroundColor: ton(x.tur) }} />)}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 4 }}>
              {dag.map((x) => (
                <View key={x.tur} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: ton(x.tur) }} />
                  <Text style={{ color: '#d8d8dc', fontSize: 11.5 }}>{x.ad} <Text style={{ fontWeight: '700', color: R.yazi }}>%{Math.round((x.v / T.deger) * 100)}</Text></Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Kâr / zarar */}
      <View style={{ padding: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', gap: 4 }}>
        <View style={{ flexDirection: 'row' }}><Text style={[s.sub, { flex: 1 }]}>Kâr / zarar</Text><Text style={[s.sub, { fontSize: 11 }]}>alış tutarına göre</Text></View>
        {T.kar != null ? (
          <>
            <Text accessibilityLabel={(T.kar >= 0 ? 'Kâr ' : 'Zarar ') + tl(Math.abs(T.kar))} style={{ color: renk(T.kar), fontSize: 24, fontWeight: '800' }}>{ok(T.kar)}{tl(Math.abs(T.kar))}</Text>
            <Text style={s.sub}>Alış {tl(T.alis)} → bugün {tl(T.karDeger)} · <Text style={{ color: renk(T.kar), fontWeight: '700' }}>{T.karP != null ? yuzde(T.karP) : ''}</Text></Text>
            {T.karDeger < T.deger && <SaltOkunur yazi="Alış tutarı girilmeyen satırlar kâr/zarara katılmaz." />}
          </>
        ) : <Text style={s.soluk}>Masaüstünde satırlara alış tutarı girilince hesaplanır.</Text>}
      </View>

      {/* Güncel fiyatlar */}
      {f && (
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: 'row', marginBottom: 2 }}><Text style={[s.sub, { flex: 1 }]}>Güncel fiyatlar · satış</Text><Text style={[s.sub, { fontSize: 11 }]}>günlük</Text></View>
          {FIYAT_AD.filter(([id]) => f.t[id]).map(([id, ad], i, l) => { const p = f.t[id]; return (
            <View key={id} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 36, borderBottomWidth: i < l.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
              <Text style={{ flex: 1, color: R.yazi, fontSize: 13 }}>{ad}{p[3] ? <Text style={{ color: R.soluk, fontSize: 11 }}>  Kapalıçarşı</Text> : null}</Text>
              <Text style={{ color: R.yazi, fontSize: 13, fontWeight: '700', width: 92, textAlign: 'right' }}>{tl(p[0])}</Text>
              <Text style={{ color: renk(p[2]), fontSize: 12, fontWeight: '600', width: 66, textAlign: 'right' }}>{ok(p[2])}{yuzde(p[2], 2)}</Text>
            </View>); })}
        </View>
      )}

      {/* Altınlarım */}
      <View style={{ gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}><Text style={[s.sub, { flex: 1 }]}>Altınlarım</Text><Hap yazi={a.kalem.length + ' kayıt'} /></View>
        {a.kalem.map((k, i) => (
          <View key={k.id} accessible accessibilityLabel={k.ad + ', ' + miktar(k.miktar, k.birim) + gramYaz(k).replace(/ · /g, ', ') + (k.deger != null ? ', değer ' + tl(k.deger) : '')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 54, paddingVertical: 6, borderBottomWidth: i < a.kalem.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: ton(k.tur), borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }} />
            <View style={{ flex: 1, gap: 1 }}>
              <Text numberOfLines={1} style={{ color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{k.ad}{k.not ? <Text style={{ color: R.soluk, fontWeight: '400', fontSize: 12 }}>  {k.not}</Text> : null}</Text>
              <Text style={[s.sub, { fontSize: 11.5 }]}>{miktar(k.miktar, k.birim)}{gramYaz(k)} · {k.tarih ? tarihY(k.tarih) : 'işlem tarihi yok'}{k.alis != null ? ' · alış ' + tl(k.alis) : ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 1 }}>
              <Text style={{ color: R.yazi, fontSize: 13.5, fontWeight: '700' }}>{k.deger != null ? tl(k.deger) : '—'}</Text>
              {k.kar != null ? <Text style={{ color: renk(k.kar), fontSize: 11.5, fontWeight: '600' }}>{ok(k.kar)}{tl(Math.abs(k.kar))}</Text>
                : k.gunluk ? <Text style={{ color: renk(k.gunluk), fontSize: 11.5 }}>{ok(k.gunluk)}{tl(Math.abs(k.gunluk))} bugün</Text> : null}
            </View>
          </View>
        ))}
      </View>

      {/* Alım gücü */}
      <View style={{ padding: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', gap: 8 }}>
        <Text style={[s.sub, { color: R.yazi, fontWeight: '600', fontSize: 13 }]}>Alım gücü · işlem tarihinden bugüne</Text>
        {!a.ag ? <VeriYok neden="TÜFE ve kur verisi masaüstünde henüz alınmadı (bilgisayarda Orvane açılınca ya da Altın Hesabım açılınca alınır)." />
          : !a.ag.satir.length ? <Text style={s.soluk}>Masaüstünde satırlara işlem tarihi ve alış tutarı girilince her kaydın getirisi burada görünür.</Text>
          : (() => { const ag = a.ag, ilk = (alan: 'tufeNeden' | 'kurNeden') => ag.satir.map((x) => x[alan]).find(Boolean) || ''; return (
            <>
              {!!ag.uyari && <Text style={[s.sub, { color: '#f7bd55' }]}>{ag.uyari}</Text>}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Gosterge et="Nominal getiri" deger={ag.top.nominal != null ? ok(ag.top.nominal) + yuzde(ag.top.nominal) : 'veri yok'} vurgu={ag.top.nominal != null ? renk(ag.top.nominal) : R.soluk} alt={tl(ag.top.alis) + ' → ' + tl(ag.top.deger)} />
                <Gosterge et="Reel getiri (TÜFE)" deger={ag.top.reel != null ? ok(ag.top.reel) + yuzde(ag.top.reel) : 'veri yok'} vurgu={ag.top.reel != null ? renk(ag.top.reel) : R.soluk}
                  alt={ag.top.reel != null ? 'TÜFE son ay: ' + ayY(ag.tufeSon) : ilk('tufeNeden') || (ag.guncel ? 'Bazı satırların TÜFE’si yok' : 'TÜFE güncel değil')} altRenk={ag.top.reel != null ? undefined : '#f7bd55'} />
                <Gosterge et="Dolar alınsaydı" deger={ag.top.usd != null ? tl(ag.top.usd) : 'veri yok'} vurgu={ag.top.usd != null ? renk(ag.top.deger - ag.top.usd) : R.soluk}
                  alt={ag.top.usd != null ? (ag.top.deger >= ag.top.usd ? '▲ altın önde' : '▼ dolar önde') : ilk('kurNeden') || 'Bazı satırların kuru yok'} altRenk={ag.top.usd != null ? renk(ag.top.deger - ag.top.usd) : '#f7bd55'} />
                <Gosterge et="Euro alınsaydı" deger={ag.top.eur != null ? tl(ag.top.eur) : 'veri yok'} vurgu={ag.top.eur != null ? renk(ag.top.deger - ag.top.eur) : R.soluk}
                  alt={ag.top.eur != null ? (ag.top.deger >= ag.top.eur ? '▲ altın önde' : '▼ euro önde') : ilk('kurNeden') || 'Bazı satırların kuru yok'} altRenk={ag.top.eur != null ? renk(ag.top.deger - ag.top.eur) : '#f7bd55'} />
              </View>
              {a.kalem.filter((k) => agMap[k.id]).map((k) => { const x = agMap[k.id]; return (
                <View key={k.id} style={{ gap: 2, paddingTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                  <Text style={{ color: R.yazi, fontSize: 12.5, fontWeight: '600' }}>{k.ad} <Text style={{ color: R.soluk, fontWeight: '400' }}>· {tarihY(k.tarih)}</Text></Text>
                  <Text style={[s.sub, { fontSize: 11.5 }]}>
                    Nominal <Text style={{ color: renk(x.nominal), fontWeight: '700' }}>{ok(x.nominal)}{yuzde(x.nominal)}</Text>
                    {'  ·  '}Reel {x.reel != null ? <Text style={{ color: renk(x.reel), fontWeight: '700' }}>{ok(x.reel)}{yuzde(x.reel)}</Text> : <Text style={{ color: R.soluk }}>veri yok</Text>}
                    {x.enf != null ? '  ·  TÜFE ' + yuzde(x.enf) : ''}
                    {x.usd != null ? '  ·  dolar ' + tl(x.usd) : ''}
                  </Text>
                  <Text style={[s.sub, { fontSize: 11.5 }]}>Asgari ücret: {x.asAlis != null ? sayiTr(x.asAlis, 2) + ' → ' + sayiTr(x.asBugun || 0, 2) + ' ay' : 'veri yok'}</Text>
                  {[x.reel == null && x.tufeNeden ? 'TÜFE: ' + x.tufeNeden : '', x.usd == null && x.kurNeden ? 'Kur: ' + x.kurNeden : '', x.asAlis == null && x.asNeden ? 'Asgari ücret: ' + x.asNeden : ''].filter(Boolean).map((n) => <Text key={n} style={[s.sub, { fontSize: 11, color: '#f7bd55' }]}>{n}</Text>)}
                </View>); })}
            </>); })()}
      </View>
      <SaltOkunur yazi={(f ? (f.eski ? 'Son bilinen fiyat · ' : '') + f.kaynak + (f.tarih ? ' · ' + f.tarih : '') + ' · ' : '') + 'Salt okunur · kayıtlar masaüstünde düzenlenir · ▲ / ▼ değişim'} />
    </>
  );
}

// ======================= FuzulEv =======================
const FE_RENK: Record<string, string> = { Tasarruf: '#5fe0f5', Tahsisat: '#fde68a', Finansman: '#c4b0ff' };
type Satir = { no: number; tur: string; vade: string; tutar: number | null; odenen: number | null; kalan: number | null; durum: FeDurum; gecikme: number; odemeTarih: string };
/** Taksitler; gecikme telefonun bugününe göre yeniden hesaplanır */
function satirlar(fe: FuzulEv, bugun: string): Satir[] {
  return fe.taksit.map(([no, tur, vade, tutar, odenen, kalan, durum, , odemeTarih]) => {
    const odenmis = durum === 'odendi' || durum === 'girilmedi', gec = !odenmis && /^\d{4}-\d{2}-\d{2}$/.test(vade) && vade < bugun;
    return { no, tur, vade, tutar, odenen, kalan, odemeTarih, durum: odenmis ? durum : gec ? 'gecikti' : 'bekliyor', gecikme: gec ? gunFark(vade, bugun) : 0 };
  });
}
function feHesap(fe: FuzulEv) {
  const bugun = tamAnahtar(new Date()), L = satirlar(fe, bugun), acik = L.filter((r) => r.durum === 'gecikti' || r.durum === 'bekliyor');
  const geciken = acik.filter((r) => r.durum === 'gecikti'), sonraki = acik.find((r) => r.durum === 'bekliyor' && !!r.vade) || null;
  const tn = fe.soz.teslimat || 0, ts = tn ? L.find((r) => r.no === tn) : undefined;
  const teslim = ts ? { r: ts, taksit: acik.filter((r) => r.no <= tn).length, gun: ts.vade ? gunFark(bugun, ts.vade) : null } : null;
  const son = acik.reduce<Satir | null>((m, r) => (!m || r.vade > m.vade ? r : m), null);
  return { bugun, L, geciken, sonraki, teslim, son };
}

/** Kutucuğun alt satırı: gecikme varsa kırmızı uyarı, yoksa sonraki ödeme */
export function fuzulevOzet(fe?: FuzulEv): [string, string] {
  if (!fe || (!fe.taksit.length && !Object.keys(fe.soz).length)) return ['Masaüstünde sözleşme girilince görünür', R.yazi2];
  const H = feHesap(fe);
  if (H.geciken.length) return ['⚠ ' + (H.geciken.length === 1 ? H.geciken[0].no + '. taksit ' + H.geciken[0].gecikme + ' gün gecikti' : H.geciken.length + ' taksit gecikti'), KIRMIZI];
  if (H.sonraki) return ['Sonraki: ' + (H.sonraki.tutar != null ? tl(H.sonraki.tutar) + ' · ' : '') + tarihY(H.sonraki.vade), R.yazi2];
  return [fe.ozet.odenenSay + ' / ' + fe.ozet.say + ' taksit ödendi', YESIL];
}
export const fuzulevGecikti = (fe?: FuzulEv) => !!fe && feHesap(fe).geciken.length > 0;

function DurumHap({ r }: { r: Satir }) {
  const m: Record<FeDurum, [string, string, string]> = {
    odendi: ['Ödendi', 'rgba(62,207,90,0.16)', '#6be585'], girilmedi: ['Tutar girilmedi', 'rgba(245,165,36,0.16)', '#f7bd55'],
    gecikti: [r.gecikme + ' gün gecikti', 'rgba(255,107,90,0.16)', KIRMIZI], bekliyor: ['Bekliyor', 'rgba(255,255,255,0.08)', '#c4c4c9'],
  };
  const [y, bg, c] = m[r.durum];
  return <View style={{ height: 22, paddingHorizontal: 8, borderRadius: 11, backgroundColor: bg, justifyContent: 'center' }}><Text style={{ color: c, fontSize: 11, fontWeight: '600' }}>{y}</Text></View>;
}

export function FuzulEvPanel({ o }: { o: Ozet }) {
  const fe = o.aile?.fuzulev, [suz, setSuz] = useState<'tum' | 'acik' | 'odendi'>('acik'), [hepsi, setHepsi] = useState(false);
  if (!fe || (!fe.taksit.length && !Object.keys(fe.soz).length)) return <Bos yazi={o.ts ? 'Henüz FuzulEv sözleşmesi yok. Masaüstünde Ailem › FuzulEv’den girince burada görünür.' : 'Bilgisayarla eşitlenince FuzulEv burada görünür.'} ikon="ev" />;
  const H = feHesap(fe), Z = fe.ozet, S = fe.soz, n = H.L.length;
  const liste = H.L.filter((r) => (suz === 'tum' ? true : suz === 'odendi' ? r.durum === 'odendi' || r.durum === 'girilmedi' : r.durum === 'gecikti' || r.durum === 'bekliyor'));
  const gorunen = hepsi ? liste : liste.slice(0, 8);
  const sozAlan: [string, string | undefined][] = [
    ['Finansman bedeli', S.bedel != null ? tl(S.bedel) : undefined], ['Organizasyon ücreti', S.orgUcret != null ? tl(S.orgUcret) : undefined],
    ['Peşinat', S.pesinat != null ? tl(S.pesinat) : undefined], ['Taksit sayısı', S.taksitSay != null ? String(S.taksitSay) : undefined],
    ['Sözleşme tarihi', S.tarih ? tarihY(S.tarih) : undefined], ['Finansman türü', S.finTur], ['Kampanya', S.kampanya], ['Teslimat', S.teslimat ? S.teslimat + '. taksit' : undefined],
  ];
  return (
    <>
      {(!!S.plan || !!S.durum) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text numberOfLines={1} style={{ flex: 1, color: R.yazi, fontSize: 15, fontWeight: '700' }}>{S.plan || 'FuzulEv sözleşmesi'}</Text>
          {!!S.durum && <Hap yazi={S.durum} t="g" />}
        </View>
      )}

      {/* Gecikme uyarıları */}
      {H.geciken.map((r) => (
        <View key={r.no} accessibilityRole="alert" accessibilityLabel={r.no + '. taksit ' + r.gecikme + ' gün gecikti'}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, backgroundColor: 'rgba(255,107,90,0.12)', borderWidth: 1, borderColor: 'rgba(255,107,90,0.38)' }}>
          <Ikon ad="uyari" boy={22} renk={KIRMIZI} kalin={2} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: KIRMIZI, fontSize: 14, fontWeight: '700' }}>{r.no}. taksit {r.gecikme} gün gecikti</Text>
            <Text style={[s.sub, { color: '#e9d6d2' }]}>{r.tur} taksiti · {r.kalan != null ? tl(r.kalan) : 'tutar girilmedi'} · vade {tarihY(r.vade)}</Text>
          </View>
        </View>
      ))}

      {/* Göstergeler */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Gosterge et="Kalan borç" deger={Z.kalanEksik && !Z.kalan ? '—' : tl(Z.kalan)} alt={Z.kalanSay + ' taksit' + (H.son ? ' · son vade ' + tarihY(H.son.vade) : '') + (Z.kalanEksik ? ' · ' + Z.kalanEksik + ' tutarı yok' : '')} altRenk={Z.kalanEksik ? '#f7bd55' : undefined} />
        <Gosterge et="Toplam ödenen" deger={Z.odenenEksik && !Z.odenen ? '—' : tl(Z.odenen)} alt={Z.odenenEksik ? Z.odenenEksik + ' ödenmiş taksitin tutarı girilmedi' : Z.odenenSay + ' taksit ödendi'} altRenk={Z.odenenEksik ? '#f7bd55' : undefined} />
        <Gosterge et="Teslimata kalan" deger={H.teslim ? (H.teslim.taksit === 0 ? 'Tamam' : H.teslim.gun != null ? String(Math.max(0, H.teslim.gun)) : String(H.teslim.taksit)) : '—'} birim={H.teslim && H.teslim.taksit !== 0 ? (H.teslim.gun != null ? 'gün' : 'taksit') : undefined}
          vurgu={H.teslim && H.teslim.taksit === 0 ? YESIL : undefined} alt={H.teslim ? (H.teslim.taksit ? H.teslim.taksit + ' taksit · ' : '') + H.teslim.r.no + '. taksit (' + H.teslim.r.tur + ')' + (H.teslim.r.vade ? ' · ' + tarihY(H.teslim.r.vade) : '') : 'Teslimat taksiti girilmedi'} />
        <Gosterge et="Sonraki ödeme" deger={H.sonraki ? (H.sonraki.kalan != null ? tl(H.sonraki.kalan) : '—') : '—'} alt={H.sonraki ? H.sonraki.no + '. taksit · ' + tarihY(H.sonraki.vade) + ' · ' + (gunFark(H.bugun, H.sonraki.vade) === 0 ? 'bugün' : gunFark(H.bugun, H.sonraki.vade) + ' gün sonra') : H.geciken.length ? 'Önce geciken taksit' : 'Bekleyen taksit yok'} />
      </View>

      {/* Ödeme yolu */}
      {n > 0 && (
        <View style={{ padding: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[s.sub, { flex: 1, color: R.yazi, fontWeight: '600', fontSize: 13 }]}>Ödeme yolu</Text>
            {Object.keys(FE_RENK).filter((t) => H.L.some((r) => r.tur === t)).map((t) => (
              <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 }}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: FE_RENK[t] }} /><Text style={{ color: R.yazi2, fontSize: 10.5 }}>{t}</Text></View>
            ))}
          </View>
          <View accessibilityLabel={Z.odenenSay + ' / ' + n + ' taksit ödendi'} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: n > 40 ? 1 : 3, height: 34 }}>
            {H.L.map((r) => { const odendi = r.durum === 'odendi' || r.durum === 'girilmedi', tes = r.no === fe.soz.teslimat, c = FE_RENK[r.tur] || '#c4b0ff';
              return <View key={r.no} style={{ flex: 1, height: tes ? 34 : odendi ? 18 : 24, borderRadius: n > 24 ? 2 : 5, backgroundColor: odendi ? c : saydam(c, r.durum === 'gecikti' ? 0.32 : 0.28), borderWidth: r.durum === 'gecikti' || tes ? 1.5 : 0, borderColor: r.durum === 'gecikti' ? KIRMIZI : '#fde68a' }} />; })}
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={[s.sub, { fontSize: 11, flex: 1 }]}>{H.L[0]?.vade ? ayY(H.L[0].vade) : ''}</Text>
            {H.teslim && <Text style={{ color: '#fde68a', fontSize: 11, fontWeight: '700' }}>▼ Teslimat · {ayY(H.teslim.r.vade)}</Text>}
            <Text style={[s.sub, { fontSize: 11, flex: 1, textAlign: 'right' }]}>{H.L[n - 1]?.vade ? ayY(H.L[n - 1].vade) : ''}</Text>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}><View style={{ width: Z.ilerleme + '%', height: '100%', borderRadius: 3, backgroundColor: R.ana }} /></View>
          <Text style={[s.sub, { fontSize: 11 }]}>{Z.odenenSay} / {n} taksit ödendi{Z.odenenEksik ? ' · ' + Z.odenenEksik + ' taksitin tutarı girilince ödenen tutar tamamlanır' : ''}</Text>
        </View>
      )}

      {/* Sözleşme */}
      {sozAlan.some((x) => x[1]) && (
        <View style={{ padding: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', gap: 10 }}>
          <Text style={[s.sub, { color: R.yazi, fontWeight: '600', fontSize: 13 }]}>Sözleşme</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 }}>
            {sozAlan.filter((x) => x[1]).map(([et, v]) => (
              <View key={et} style={{ width: '50%', gap: 1, paddingRight: 8 }}><Text style={[s.sub, { fontSize: 11 }]}>{et}</Text><Text style={{ color: R.yazi, fontSize: 13.5, fontWeight: '700' }}>{v}</Text></View>
            ))}
          </View>
        </View>
      )}

      {/* Taksitler */}
      {n > 0 && (
        <View style={{ gap: 6 }}>
          <Bolumler secenek={[['acik', 'Ödenmemiş'], ['odendi', 'Ödenmiş'], ['tum', 'Tümü']]} deger={suz} sec={(v) => { setSuz(v); setHepsi(false); }} />
          {gorunen.length ? gorunen.map((r, i) => (
            <View key={r.no} accessible accessibilityLabel={r.no + '. taksit, ' + r.tur + ', vade ' + tarihY(r.vade)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 4, borderBottomWidth: i < gorunen.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: r.durum === 'gecikti' ? 'rgba(255,107,90,0.06)' : 'transparent', borderRadius: r.durum === 'gecikti' ? 10 : 0 }}>
              <Text style={{ width: 24, color: R.yazi2, fontSize: 13, fontWeight: '700', textAlign: 'center' }}>{r.no}</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: FE_RENK[r.tur] || '#c4b0ff' }} /><Text style={{ color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{r.tur}</Text></View>
                <Text style={[s.sub, { fontSize: 11.5 }]}>vade {tarihY(r.vade)}{r.odemeTarih ? ' · ödendi ' + tarihY(r.odemeTarih) : ''}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 3 }}>
                <Text style={{ color: R.yazi, fontSize: 13.5, fontWeight: '700' }}>{r.durum === 'odendi' ? tl(r.odenen || 0) : r.tutar != null ? tl(r.tutar) : '—'}</Text>
                <DurumHap r={r} />
              </View>
            </View>
          )) : <Text style={s.soluk}>{suz === 'acik' ? 'Ödenmemiş taksit yok.' : 'Bu süzgeçte taksit yok.'}</Text>}
          {liste.length > gorunen.length && (
            <Pressable onPress={() => setHepsi(true)} accessibilityRole="button" style={({ pressed }) => ({ minHeight: 40, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
              <Text style={{ color: R.ana2, fontSize: 13, fontWeight: '600' }}>Tümünü göster ({liste.length})</Text>
            </Pressable>
          )}
        </View>
      )}
      <SaltOkunur yazi="Salt okunur · ödendi işareti ve düzenleme masaüstünde · gecikme bugüne göre hesaplanır" />
    </>
  );
}

// ======================= Tam sayfa (0.9.14) =======================
// Kutucuk → app/altin.tsx, app/fuzulev.tsx. Geri ok ve Android geri tuşu Ailem'e döner (Stack).
// Eşin profilinde açılmaz: Ailem'e geri yönlendirilir (masaüstü de eşin özetine bu veriyi koymaz).
const ESKI = 6 * 36e5;
const saatY = (t: number) => { const d = new Date(t); return d.getDate() + ' ' + AY[d.getMonth()].slice(0, 3) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
/** Masaüstü özeti yalnız değişince gönderilir; 6 saatten eskiyse küçük not (veri tasarrufu kuralı gereği zaman = son değişim) */
export function EskiOzetNotu({ ts, simdi }: { ts?: number; simdi: number }) {
  if (!ts || simdi - ts < ESKI) return null;
  const sa = Math.floor((simdi - ts) / 36e5), sure = sa >= 48 ? Math.floor(sa / 24) + ' gün' : sa + ' saat';
  return <Text style={[s.sub, { fontSize: 11, color: '#f7bd55' }]}>Masaüstü özeti {sure}tir güncellenmedi · son: {saatY(ts)}. Bilgisayar açılınca yenilenir.</Text>;
}

const SAYFA = {
  altin: { ad: 'Altın Hesabım', harf: 'Au', renk: '#fde68a', Govde: AltinPanel },
  fuzulev: { ad: 'FuzulEv', harf: 'FE', renk: '#fdba74', Govde: FuzulEvPanel },
};
export function VarlikSayfa({ id }: { id: 'altin' | 'fuzulev' }) {
  const o = useGorunum(), rol = useRol(), p = SAYFA[id], [simdi] = useState(Date.now);
  useEffect(() => { if (rol !== 'es') yeniGoruldu(id); }, [id, rol]);
  if (rol === 'es') return <Redirect href="/" />;
  const { Govde } = p;
  return (
    <Ekran geri baslik={
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: p.renk, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#1c1c1e', fontWeight: '700', fontSize: 11 }}>{p.harf}</Text></View>
        <Text style={{ color: R.soluk, fontSize: 13 }}>Ailem ›</Text>
        <Text style={{ color: R.yazi, fontSize: 17, fontWeight: '600' }}>{p.ad}</Text>
      </View>
    }>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 36 }}>
        <EskiOzetNotu ts={o.ts} simdi={simdi} />
        <Govde o={o} />
      </ScrollView>
    </Ekran>
  );
}
