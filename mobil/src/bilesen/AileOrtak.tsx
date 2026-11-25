// Ortak aile bölümü (0.9.1): Ailem sekmesinde iki profilde de görünür.
// • ORTAK BÜTÇE: 6 aylık gelir–gider grafiği, bu ay kasa dağılımı (ortak / Çağlar cebi / Kübra cebi), cep harçlıkları,
//   ortak giderin kategorileri, son hareketler, bekleyen ödemeler. Harcama: kişisel → kendi cep harçlığından;
//   market, ev, fatura → ortak bütçeden. Gelir ortak bütçeye girer.
// • AİLE TAKVİMİ: etkinlikler, hastane randevuları, Çağlar'ın izin günleri (salt okunur), yaklaşan özel günler.
// • ÖZEL GÜNLER: doğum günü, yıldönümü; kalan gün sayılır.
// Herkes yalnız kendi eklediğini siler/düzeltir (lib/rol.ts → duzenler). Olaylar: masaüstü orv-aile.js.
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { AltPencere, Bos } from '@/bilesen/formlar';
import { Dugme, Hap, Ikon, KartK, s } from '@/bilesen/ortak';
import { IZIN_AD } from '@/ekran/IzinGirisi';
import type { Etkinlik, Kisi, Ortak, OzelGun } from '@/lib/depo';
import { olayEkle, uid } from '@/lib/depo';
import { bosOrtak, useGorunum } from '@/lib/ekip';
import { AD, benKimim, duzenler, Rol, useRol } from '@/lib/rol';
import { esitleSonra } from '@/lib/senk';
import { R, saydam } from '@/lib/tema';
import { AY, GK, gunAnahtari, kisaTarih, tamAnahtar, tarihOf, tl } from '@/lib/zaman';

const KISI_RENK: Record<Kisi, string> = { cagla: '#4ade80', kubra: '#f472b6' };
const ORTAK_RENK = '#60a5fa', GELIR = '#6be585', GIDER = '#ff8a6b', RANDEVU = '#c084fc';
const ORTAK_KAT = ['Market', 'Ev', 'Fatura', 'Çocuk', 'Sağlık', 'Ulaşım', 'Diğer'];
const kisaTl = (n: number) => (Math.abs(n) >= 1000 ? (n / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + 'b' : String(Math.round(n)));

function Secici<T extends string>({ l, v, d }: { l: [T, string][]; v: T; d: (x: T) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {l.map(([k, y]) => <Pressable key={k} onPress={() => d(k)} accessibilityRole="radio" accessibilityState={{ selected: v === k }} style={{ minHeight: 36, paddingHorizontal: 13, borderRadius: 18, justifyContent: 'center', backgroundColor: v === k ? saydam(R.ana, 0.2) : 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: v === k ? R.ana : 'rgba(255,255,255,0.1)' }}><Text style={{ color: v === k ? '#fff' : '#c9c9cf', fontSize: 13, fontWeight: '600' }}>{y}</Text></Pressable>)}
    </View>
  );
}
const Alan = ({ et, v, d, ph, k }: { et: string; v: string; d: (x: string) => void; ph?: string; k?: 'decimal-pad' | 'numbers-and-punctuation' }) => (
  <View style={[s.giris, { flex: 1 }]}><Text style={s.girisEt}>{et}</Text><TextInput value={v} onChangeText={d} placeholder={ph} placeholderTextColor={R.solukk} keyboardType={k} style={s.girisY} accessibilityLabel={et} /></View>
);
const bugunTam = () => tamAnahtar(new Date());
const tarihGecerli = (t: string) => /^\d{4}-\d{2}-\d{2}$/.test(t) && !isNaN(tarihOf(t).getTime());
/** "24.11.2026", "24/11", "2026-11-24" → "2026-11-24" */
function tarihCoz(x: string): string {
  const t = x.trim(); if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(t)) { const a = t.split('-'); return a[0] + '-' + a[1].padStart(2, '0') + '-' + a[2].padStart(2, '0'); }
  const m = t.match(/^(\d{1,2})[./](\d{1,2})(?:[./](\d{4}))?$/); if (!m) return '';
  return (m[3] || String(new Date().getFullYear())) + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
}
const tarihYaz = (k: string) => { const d = tarihOf(k); return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear(); };

// ---------- Harcama / gelir formu ----------
function ParaFormu({ rol, kapat, gelir0 }: { rol: Rol; kapat: () => void; gelir0?: boolean }) {
  const [gelir, setGelir] = useState(!!gelir0), [kasa, setKasa] = useState<'cep' | 'ortak'>('ortak'), [kat, setKat] = useState('Market');
  const [tutar, setTutar] = useState(''), [ad, setAd] = useState(''), [hata, setHata] = useState('');
  const kaydet = () => {
    const t = Math.round((Number(tutar.replace(/\./g, '').replace(',', '.')) || 0) * 100) / 100; if (!(t > 0)) return setHata('Tutarı yaz');
    const tarih = bugunTam();
    if (rol === 'es') olayEkle(gelir ? 'es_gelir' : 'es_harcama', gelir ? { tutar: t, ad: ad.trim(), kat: ad.trim() || 'Gelir', tarih } : { tutar: t, ad: ad.trim(), kasa, kat: kasa === 'ortak' ? kat : 'Cep harçlığı', tarih });
    else olayEkle('finans_kayit', { tur: gelir ? 'gelir' : 'gider', kim: 'cagla', tutar: t, kalem: gelir ? ad.trim() || 'Gelir' : kasa === 'cep' ? 'Cep harçlığı · Çağlar' : kat, not: kasa === 'cep' || gelir ? '' : ad.trim(), tarih, ...(kasa === 'cep' && !gelir ? { hk: 'c' } : {}) });
    esitleSonra(); kapat();
  };
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: R.yazi, fontSize: 17, fontWeight: '700' }}>{gelir ? 'Gelir ekle' : 'Harcama ekle'}</Text>
      <Secici l={[['gider', 'Harcama'], ['gelir', 'Gelir']]} v={gelir ? 'gelir' : 'gider'} d={(x) => setGelir(x === 'gelir')} />
      {!gelir && <>
        <Text style={s.sub}>Nereden?</Text>
        <Secici l={[['ortak', 'Ortak bütçe'], ['cep', 'Cep harçlığım']]} v={kasa} d={setKasa} />
        <Text style={[s.sub, { fontSize: 11.5 }]}>{kasa === 'ortak' ? 'Market, ev, fatura gibi aile giderleri ortak bütçeden düşer.' : 'Kişisel harcaman kendi cep harçlığından düşer.'}</Text>
        {kasa === 'ortak' && <Secici l={ORTAK_KAT.map((k) => [k, k] as [string, string])} v={kat} d={setKat} />}
      </>}
      <View style={{ flexDirection: 'row', gap: 8 }}><Alan et="Tutar (₺)" v={tutar} d={setTutar} ph="0" k="decimal-pad" /></View>
      <View style={{ flexDirection: 'row', gap: 8 }}><Alan et={gelir ? 'Ne geliri?' : 'Açıklama'} v={ad} d={setAd} ph={gelir ? 'Maaş, ek iş…' : 'ör. Haftalık market'} /></View>
      {!!hata && <Text style={{ color: '#f4a3a3', fontSize: 13 }}>{hata}</Text>}
      <View style={{ flexDirection: 'row', gap: 8 }}><Dugme yazi="Vazgeç" tur="ikinci" onPress={kapat} stil={{ flex: 1 }} /><Dugme yazi="Kaydet" onPress={kaydet} stil={{ flex: 1 }} /></View>
    </View>
  );
}

// ---------- Etkinlik / randevu formu ----------
export function EtkinlikFormu({ rol, e, randevu0, kapat }: { rol: Rol; e?: Etkinlik; randevu0?: boolean; kapat: () => void }) {
  const [tur, setTur] = useState<'etkinlik' | 'randevu'>(e?.tur || (randevu0 ? 'randevu' : 'etkinlik')), [ad, setAd] = useState(e?.ad || ''), [tarih, setTarih] = useState(e ? tarihYaz(e.tarih) : '');
  const [saat, setSaat] = useState(e?.saat || ''), [yer, setYer] = useState(e?.yer || ''), [kisi, setKisi] = useState<Kisi | 'aile'>(e?.kisi || benKimim(rol)), [hata, setHata] = useState(''), [sil, setSil] = useState(false);
  const kaydet = () => {
    const t = tarihCoz(tarih); if (!ad.trim()) return setHata(tur === 'randevu' ? 'Bölümü ya da doktoru yaz' : 'Etkinlik adını yaz'); if (!tarihGecerli(t)) return setHata('Tarihi 24.11.2026 gibi yaz');
    if (saat && !/^\d{1,2}[:.]\d{2}$/.test(saat.trim())) return setHata('Saati 10:30 gibi yaz');
    olayEkle('etkinlik', { id: e?.id || 'tk' + uid(), ad: ad.trim(), tarih: t, saat: saat.trim().replace('.', ':'), tur, yer: yer.trim(), kisi }); esitleSonra(); kapat();
  };
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: R.yazi, fontSize: 17, fontWeight: '700' }}>{e ? 'Düzelt' : tur === 'randevu' ? 'Hastane randevusu' : 'Takvime ekle'}</Text>
      <Secici l={[['randevu', 'Hastane randevusu'], ['etkinlik', 'Etkinlik']]} v={tur} d={setTur} />
      <View style={{ flexDirection: 'row', gap: 8 }}><Alan et={tur === 'randevu' ? 'Bölüm / doktor' : 'Ne?'} v={ad} d={setAd} ph={tur === 'randevu' ? 'ör. Dahiliye' : 'ör. Veli toplantısı'} /></View>
      <View style={{ flexDirection: 'row', gap: 8 }}><Alan et="Tarih" v={tarih} d={setTarih} ph="24.11.2026" k="numbers-and-punctuation" /><Alan et="Saat" v={saat} d={setSaat} ph="10:30" k="numbers-and-punctuation" /></View>
      <View style={{ flexDirection: 'row', gap: 8 }}><Alan et={tur === 'randevu' ? 'Hastane' : 'Yer'} v={yer} d={setYer} ph={tur === 'randevu' ? 'ör. Devlet Hastanesi' : 'isteğe bağlı'} /></View>
      <Text style={s.sub}>Kimin için?</Text>
      <Secici l={[['cagla', AD.cagla], ['kubra', AD.kubra], ['aile', 'Aile']]} v={kisi} d={setKisi} />
      {!!hata && <Text style={{ color: '#f4a3a3', fontSize: 13 }}>{hata}</Text>}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {e && <Dugme yazi={sil ? 'Emin misin? Sil' : 'Sil'} tur="tehlike" onPress={() => { if (!sil) return setSil(true); olayEkle('etkinlik_sil', { id: e.id }); esitleSonra(); kapat(); }} />}
        <Dugme yazi="Vazgeç" tur="ikinci" onPress={kapat} stil={{ flex: 1 }} /><Dugme yazi="Kaydet" onPress={kaydet} stil={{ flex: 1 }} />
      </View>
    </View>
  );
}

/** 0.9.9: Özel günün bakana göre adı: kendi doğum günü "Doğum günüm", eşininki "Eşimin doğum günü" */
export function ozelAd(g: OzelGun, rol: Rol) {
  if (!g.kisi || g.tur === 'diger') return g.ad;
  const benim = g.kisi === benKimim(rol);
  return g.tur === 'dogum' ? (benim ? 'Doğum günüm' : 'Eşimin doğum günü') : (benim ? g.ad : 'Eşim · ' + g.ad);
}

function OzelGunFormu({ g, rol, kapat }: { g?: OzelGun; rol: Rol; kapat: () => void }) {
  const ben = benKimim(rol), es: Kisi = ben === 'cagla' ? 'kubra' : 'cagla';
  const [ad, setAd] = useState(g?.ad || ''), [tarih, setTarih] = useState(g ? tarihYaz(g.tarih) : ''), [tur, setTur] = useState<OzelGun['tur']>(g?.tur || 'dogum'), [kimin, setKimin] = useState<'ben' | 'es' | 'diger'>(g?.kisi ? (g.kisi === ben ? 'ben' : 'es') : g ? 'diger' : 'ben'), [hata, setHata] = useState(''), [sil, setSil] = useState(false);
  const kisiVar = tur === 'dogum' && kimin !== 'diger', kisi = kisiVar ? (kimin === 'ben' ? ben : es) : undefined;
  const kaydet = () => { const t = tarihCoz(tarih); const ad2 = ad.trim() || (kisi ? AD[kisi] + '’ın doğum günü' : ''); if (!ad2) return setHata('Adını yaz'); if (!tarihGecerli(t)) return setHata('Tarihi 14.06.2020 gibi yaz'); olayEkle('ozel_gun', { id: g?.id || 'og' + uid(), ad: ad2, tarih: t, tur, kisi }); esitleSonra(); kapat(); };
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: R.yazi, fontSize: 17, fontWeight: '700' }}>{g ? 'Özel günü düzelt' : 'Özel gün ekle'}</Text>
      <Secici l={[['dogum', 'Doğum günü'], ['yildonumu', 'Yıldönümü'], ['diger', 'Diğer']]} v={tur} d={setTur} />
      {tur === 'dogum' && <Secici l={[['ben', 'Benim'], ['es', 'Eşimin'], ['diger', 'Başkası']]} v={kimin} d={setKimin} />}
      {!kisiVar && <View style={{ flexDirection: 'row', gap: 8 }}><Alan et="Ne?" v={ad} d={setAd} ph={tur === 'dogum' ? 'ör. Annemin doğum günü' : 'ör. Evlilik yıldönümü'} /></View>}
      <View style={{ flexDirection: 'row', gap: 8 }}><Alan et="Tarih (ilk yıl)" v={tarih} d={setTarih} ph="14.06.2020" k="numbers-and-punctuation" /></View>
      <Text style={[s.sub, { fontSize: 11.5 }]}>{kisiVar ? 'Sende ve eşinde kendi açısından görünür: “Doğum günüm” / “Eşimin doğum günü”. ' : ''}Her yıl aynı gün hatırlatılır; yıldönümünde kaçıncı yıl olduğu yazar.</Text>
      {!!hata && <Text style={{ color: '#f4a3a3', fontSize: 13 }}>{hata}</Text>}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {g && <Dugme yazi={sil ? 'Emin misin? Sil' : 'Sil'} tur="tehlike" onPress={() => { if (!sil) return setSil(true); olayEkle('ozel_gun_sil', { id: g.id }); esitleSonra(); kapat(); }} />}
        <Dugme yazi="Vazgeç" tur="ikinci" onPress={kapat} stil={{ flex: 1 }} /><Dugme yazi="Kaydet" onPress={kaydet} stil={{ flex: 1 }} />
      </View>
    </View>
  );
}

/** Özel günün bir sonraki tekrarı ve kalan gün */
export function ozelSonraki(g: OzelGun) {
  const b = new Date(); b.setHours(0, 0, 0, 0); const t = tarihOf(g.tarih);
  let d = new Date(b.getFullYear(), t.getMonth(), t.getDate()); if (d < b) d = new Date(b.getFullYear() + 1, t.getMonth(), t.getDate());
  return { d, kalan: Math.round((d.getTime() - b.getTime()) / 86400000), yil: d.getFullYear() - t.getFullYear() };
}
/** İzin günlerini aralığa toplar (yaklaşanlar) */
function izinAraliklari(iz: Record<string, string>) {
  const b = new Date(); b.setHours(0, 0, 0, 0);
  const g = Object.keys(iz).filter((k) => tarihOf(k) >= b).sort((x, y) => tarihOf(x).getTime() - tarihOf(y).getTime()), r: { t: string; b: string; s: string }[] = [];
  g.forEach((k) => { const son = r[r.length - 1]; if (son && son.t === iz[k] && (tarihOf(k).getTime() - tarihOf(son.s).getTime()) / 86400000 <= 3) son.s = k; else r.push({ t: iz[k], b: k, s: k }); });
  return r;
}

// ---------- Grafikler ----------
function TrendGrafik({ trend }: { trend: Ortak['trend'] }) {
  const [W, setW] = useState(0), H = 110, mx = Math.max(1, ...trend.flatMap((x) => [x[1], x[2]]));
  const bw = W / Math.max(1, trend.length);
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} accessible accessibilityLabel={'Son ' + trend.length + ' ay gelir ve gider: ' + trend.map((x) => AY[+x[0].slice(5) - 1] + ' gelir ' + tl(x[1]) + ', gider ' + tl(x[2])).join('; ')}>
      {W > 0 && <Svg width={W} height={H}>
        {trend.map((x, i) => { const hg = (x[1] / mx) * (H - 8), hc = (x[2] / mx) * (H - 8), son = i === trend.length - 1, cx = i * bw + bw / 2;
          return [<Rect key={'g' + i} x={cx - 13} y={H - hg} width={12} height={Math.max(1, hg)} rx={4} fill={GELIR} opacity={son ? 1 : 0.55} />,
            <Rect key={'c' + i} x={cx + 1} y={H - hc} width={12} height={Math.max(1, hc)} rx={4} fill={GIDER} opacity={son ? 1 : 0.55} />]; })}
      </Svg>}
      <View style={{ flexDirection: 'row' }}>{trend.map((x, i) => <Text key={x[0]} style={[s.sub, { flex: 1, textAlign: 'center', fontSize: 10.5, color: i === trend.length - 1 ? R.yazi : R.yazi2 }]}>{AY[+x[0].slice(5) - 1].slice(0, 3)}</Text>)}</View>
    </View>
  );
}
function KasaCubuk({ kasa, ad }: { kasa: Ortak['kasa']; ad: Ortak['ad'] }) {
  const top = kasa.ortak + kasa.c + kasa.e || 1, P = [['Ortak bütçe', kasa.ortak, ORTAK_RENK], [ad.cagla + ' cebi', kasa.c, KISI_RENK.cagla], [ad.kubra + ' cebi', kasa.e, KISI_RENK.kubra]] as [string, number, string][];
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.07)' }}>{P.map(([y, v, r]) => v > 0 && <View key={y} style={{ width: (v / top) * 100 + '%', backgroundColor: r }} />)}</View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{P.map(([y, v, r]) => <View key={y} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: r }} /><Text style={[s.sub, { fontSize: 11.5 }]}>{y} <Text style={{ color: R.yazi, fontWeight: '700' }}>{tl(v)}</Text></Text></View>)}</View>
    </View>
  );
}
function CepSatir({ ad, c, renk, ben }: { ad: string; c?: Ortak['cep']['c']; renk: string; ben: boolean }) {
  if (!c) return null; const p = c.har ? Math.max(0, Math.min(100, (c.harcanan / c.har) * 100)) : 0, asti = c.kal != null && c.kal < 0;
  return (
    <View style={{ gap: 5, padding: 10, borderRadius: 14, backgroundColor: ben ? saydam(renk, 0.08) : 'rgba(255,255,255,0.04)' }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: renk }} />
        <Text style={{ flex: 1, color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{ad} · cep harçlığı %{c.oran}{ben ? ' (sen)' : ''}</Text>
        <Text style={{ color: asti ? '#f4a3a3' : R.yazi, fontSize: 13, fontWeight: '700' }}>{c.kal == null ? '—' : tl(c.kal)}</Text>
      </View>
      <View style={{ height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}><View style={{ width: p + '%', height: '100%', backgroundColor: asti ? '#f47a7a' : renk, borderRadius: 4 }} /></View>
      <Text style={[s.sub, { fontSize: 11 }]}>{c.har == null ? 'Gelir girilince hesaplanır' : tl(c.harcanan) + ' / ' + tl(c.har) + ' harcandı' + (c.gunluk != null && c.kal != null && c.kal > 0 ? ' · günde ' + tl(c.gunluk) : asti ? ' · harçlık aşıldı' : '')}</Text>
    </View>
  );
}

// ---------- Ana bölüm ----------
export function OrtakBolum() {
  const o = useGorunum(), rol = useRol(), ben = benKimim(rol);
  const O: Ortak = o.aile?.ortak || bosOrtak(), ad = O.ad || AD;
  const [pen, setPen] = useState<null | { t: 'para'; gelir?: boolean } | { t: 'etk'; e?: Etkinlik; randevu?: boolean } | { t: 'ozel'; g?: OzelGun }>(null), [n, setN] = useState(0);
  const ac = (p: NonNullable<typeof pen>) => { setPen(p); setN((x) => x + 1); };
  const tr = O.trend[O.trend.length - 1] || ['', o.aile?.fin.bu.gelir || 0, o.aile?.fin.bu.gider || 0], once = O.trend[O.trend.length - 2];
  const kalan = tr[1] - tr[2], kat = Object.entries(O.kat).sort((a, b) => b[1] - a[1]), kmax = kat.length ? kat[0][1] : 1;
  // Yaklaşan 30 gün: takvim + izin + özel gün
  const yak = useMemo(() => {
    const b = new Date(); b.setHours(0, 0, 0, 0); const son = new Date(b.getTime() + 30 * 86400000), r: { k: string; tip: 'etk' | 'izin' | 'ozel'; e?: Etkinlik; g?: OzelGun; baslik: string; alt: string; renk: string; ikon: string }[] = [];
    O.takvim.forEach((e) => { const d = tarihOf(e.tarih); if (d < b || d > son) return; r.push({ k: e.tarih + (e.saat || '') + e.id, tip: 'etk', e, baslik: (e.tur === 'randevu' ? 'Randevu · ' : '') + e.ad, alt: [e.saat, e.yer, e.kisi === 'aile' ? 'Aile' : AD[(e.kisi || e.kim) as Kisi]].filter(Boolean).join(' · '), renk: e.tur === 'randevu' ? RANDEVU : KISI_RENK[e.kim], ikon: e.tur === 'randevu' ? 'ilac' : 'gun' }); });
    izinAraliklari(O.izin).forEach((z) => { if (tarihOf(z.b) > son) return; r.push({ k: tamAnahtar(tarihOf(z.b)) + 'z', tip: 'izin', baslik: ad.cagla + ' · ' + (IZIN_AD[z.t] || 'İzin'), alt: kisaTarih(z.b) + (z.s !== z.b ? ' – ' + kisaTarih(z.s) : ''), renk: '#5fe0f5', ikon: 'izin' }); });
    O.ozel.forEach((g) => { const x = ozelSonraki(g); if (x.kalan > 30) return; r.push({ k: tamAnahtar(x.d) + 'o' + g.id, tip: 'ozel', g, baslik: ozelAd(g, rol) + (g.tur === 'yildonumu' && x.yil > 0 ? ' · ' + x.yil + '. yıl' : ''), alt: x.kalan === 0 ? 'bugün' : x.kalan + ' gün sonra', renk: '#fbbf24', ikon: 'yildiz' }); });
    return r.sort((a, z) => a.k.localeCompare(z.k));
  }, [O.takvim, O.izin, O.ozel, rol]);
  const randevular = O.takvim.filter((e) => e.tur === 'randevu' && tarihOf(e.tarih) >= new Date(new Date().setHours(0, 0, 0, 0)));
  const ozeller = O.ozel.map((g) => ({ g, ...ozelSonraki(g) })).sort((a, b) => a.kalan - b.kalan);
  const tarihEt = (k: string) => { const d = tarihOf(k.slice(0, 10)); return d.getDate() + ' ' + AY[d.getMonth()].slice(0, 3) + ' ' + GK[d.getDay()]; };
  return (
    <>
      <KartK ad="ortakButce" baslik="ORTAK BÜTÇE" ozet={'Kalan ' + tl(kalan)} sag={<Pressable onPress={() => ac({ t: 'para' })} accessibilityRole="button" accessibilityLabel="Harcama ekle" hitSlop={4} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: R.ana, justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>+ Harcama</Text></Pressable>}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[['Gelir', tr[1], GELIR, once?.[1]], ['Gider', tr[2], GIDER, once?.[2]], ['Kalan', kalan, kalan >= 0 ? R.yazi : '#f4a3a3', undefined]].map(([y, v, r, p]) => {
            const fark = p != null && p ? Math.round((((v as number) - (p as number)) / Math.abs(p as number)) * 100) : null, kotu = y === 'Gider' ? (fark || 0) > 0 : (fark || 0) < 0;
            return (
              <View key={y as string} style={{ flex: 1, padding: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', gap: 2 }}>
                <Text style={[s.sub, { fontSize: 11.5 }]}>{y as string}</Text>
                <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: r as string, fontSize: 17, fontWeight: '700' }}>{tl(v as number)}</Text>
                {fark != null && fark !== 0 && <Text style={{ color: kotu ? '#f47a7a' : GELIR, fontSize: 11, fontWeight: '700' }}>{fark > 0 ? '▲' : '▼'} %{Math.abs(fark)}</Text>}
              </View>); })}
        </View>
        {O.trend.length > 1 && <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={[s.sub, { flex: 1 }]}>Son {O.trend.length} ay</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: GELIR }} /><Text style={[s.sub, { fontSize: 11 }]}>Gelir</Text></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: GIDER }} /><Text style={[s.sub, { fontSize: 11 }]}>Gider</Text></View>
          </View>
          <TrendGrafik trend={O.trend} />
        </>}
        <Text style={s.sub}>Bu ay giderler nereden çıktı?</Text>
        <KasaCubuk kasa={O.kasa} ad={ad} />
        <CepSatir ad={ad.cagla} c={O.cep.c} renk={KISI_RENK.cagla} ben={ben === 'cagla'} />
        <CepSatir ad={ad.kubra} c={O.cep.e} renk={KISI_RENK.kubra} ben={ben === 'kubra'} />
        {kat.length > 0 && <View style={{ gap: 7 }}>
          <Text style={s.sub}>Ortak giderler</Text>
          {kat.slice(0, 6).map(([k, v]) => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ width: 70, color: R.yazi, fontSize: 12.5 }} numberOfLines={1}>{k}</Text>
              <View style={{ flex: 1, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.07)' }}><View style={{ width: (v / kmax) * 100 + '%', height: '100%', borderRadius: 4, backgroundColor: ORTAK_RENK }} /></View>
              <Text style={{ width: 62, textAlign: 'right', color: R.yazi, fontSize: 12.5, fontWeight: '600' }}>{kisaTl(v)} ₺</Text>
            </View>
          ))}
        </View>}
        {O.odeme.length > 0 && <View style={{ gap: 6 }}>
          <Text style={s.sub}>Bekleyen ödemeler</Text>
          {O.odeme.slice(0, 4).map((x, i) => <View key={i} style={{ flexDirection: 'row', gap: 8 }}><Text style={{ flex: 1, color: R.yazi, fontSize: 13 }}>{x.ad}</Text><Text style={s.sub}>{x.tarih ? kisaTarih(x.tarih) : ''}</Text><Text style={{ color: GIDER, fontSize: 13, fontWeight: '700' }}>{tl(x.tutar)}</Text></View>)}
        </View>}
        <View style={{ gap: 2 }}>
          <Text style={s.sub}>Son hareketler</Text>
          {O.hareket.slice(0, 6).map((h, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40, borderBottomWidth: i < 5 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: KISI_RENK[h[6]] }} />
              <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: R.yazi, fontSize: 13 }}>{h[3] || h[2]}</Text><Text style={[s.sub, { fontSize: 11 }]}>{kisaTarih(h[0])} · {h[1] ? 'gelir' : h[5] === 'o' ? 'ortak · ' + h[2] : (h[5] === 'c' ? ad.cagla : ad.kubra) + ' cebi'} · {ad[h[6]]}</Text></View>
              <Text style={{ color: h[1] ? GELIR : R.yazi, fontSize: 13, fontWeight: '700' }}>{h[1] ? '+' : '−'}{tl(h[4])}</Text>
            </View>
          ))}
          {!O.hareket.length && <Text style={s.soluk}>{o.ts ? 'Bu ay hareket yok.' : 'Eşitlenince ortak bütçe burada görünür.'}</Text>}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Dugme yazi="Harcama" ikon="arti" onPress={() => ac({ t: 'para' })} stil={{ flex: 1 }} />
          <Dugme yazi="Gelir" tur="ikinci" onPress={() => ac({ t: 'para', gelir: true })} stil={{ flex: 1 }} />
        </View>
      </KartK>

      <KartK ad="aileTakvim" baslik="AİLE TAKVİMİ" ozet={yak.length + ' yaklaşan · ' + randevular.length + ' randevu'} sag={<Pressable onPress={() => ac({ t: 'etk', randevu: true })} accessibilityRole="button" accessibilityLabel="Randevu ekle" hitSlop={4} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: saydam(RANDEVU, 0.2), justifyContent: 'center' }}><Text style={{ color: RANDEVU, fontSize: 12.5, fontWeight: '700' }}>+ Randevu</Text></Pressable>}>
        {yak.length ? yak.map((x) => { const sahip = x.tip === 'etk' ? duzenler(rol, x.e!.kim) : x.tip === 'ozel' ? duzenler(rol, x.g!.kim) : false; return (
          <Pressable key={x.k} disabled={!sahip} onPress={() => (x.tip === 'etk' ? ac({ t: 'etk', e: x.e }) : x.tip === 'ozel' ? ac({ t: 'ozel', g: x.g }) : null)} accessibilityRole={sahip ? 'button' : undefined} accessibilityLabel={x.baslik + ', ' + x.alt + (sahip ? ', düzelt' : '')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 10, borderRadius: 14, backgroundColor: x.tip === 'etk' && x.e?.tur === 'randevu' ? saydam(RANDEVU, 0.1) : 'rgba(255,255,255,0.04)' }}>
            <View style={{ width: 44, alignItems: 'center' }}><Text style={{ color: R.yazi, fontSize: 15, fontWeight: '700' }}>{tarihOf(x.k.slice(0, 10)).getDate()}</Text><Text style={[s.sub, { fontSize: 10 }]}>{tarihEt(x.k).split(' ').slice(1).join(' ')}</Text></View>
            <View style={{ width: 3, alignSelf: 'stretch', marginVertical: 8, borderRadius: 2, backgroundColor: x.renk }} />
            <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{x.baslik}</Text><Text numberOfLines={1} style={[s.sub, { fontSize: 11.5 }]}>{x.alt}</Text></View>
            {sahip ? <Ikon ad="kalem" boy={14} renk={R.yazi2} kalin={2} /> : <Ikon ad={x.ikon} boy={15} renk={x.renk} kalin={2} />}
          </Pressable>); }) : <Bos yazi="Önümüzdeki 30 günde etkinlik, randevu, izin ya da özel gün yok." ikon="gun" />}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Dugme yazi="Etkinlik" ikon="arti" tur="ikinci" onPress={() => ac({ t: 'etk' })} stil={{ flex: 1 }} />
          <Dugme yazi="Randevu" ikon="arti" tur="ikinci" onPress={() => ac({ t: 'etk', randevu: true })} stil={{ flex: 1 }} />
        </View>
        <Text style={[s.sub, { fontSize: 11 }]}>{rol === 'es' ? ad.cagla + '’ın izinleri yalnız görüntülenir. Kendi eklediklerine dokunup düzeltebilirsin.' : 'Eşinin eklediği randevular burada görünür; yalnız o düzeltebilir.'}</Text>
      </KartK>

      <KartK ad="ozelGun" baslik="ÖZEL GÜNLER" ozet={ozeller.length ? ozelAd(ozeller[0].g, rol) + ' · ' + (ozeller[0].kalan ? ozeller[0].kalan + ' gün' : 'bugün') : 'kayıt yok'} sag={<Pressable onPress={() => ac({ t: 'ozel' })} accessibilityRole="button" accessibilityLabel="Özel gün ekle" hitSlop={4} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: 'rgba(251,191,36,0.18)', justifyContent: 'center' }}><Text style={{ color: '#fbbf24', fontSize: 12.5, fontWeight: '700' }}>+ Ekle</Text></Pressable>}>
        {ozeller.length ? ozeller.map(({ g, kalan, yil, d }) => { const sahip = duzenler(rol, g.kim); return (
          <Pressable key={g.id} disabled={!sahip} onPress={() => ac({ t: 'ozel', g })} accessibilityRole={sahip ? 'button' : undefined} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingHorizontal: 10, borderRadius: 14, backgroundColor: kalan <= 7 ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)' }}>
            <Ikon ad={g.tur === 'dogum' ? 'yildiz' : g.tur === 'yildonumu' ? 'kalp' : 'gun'} boy={17} renk="#fbbf24" kalin={2} />
            <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: R.yazi, fontSize: 13.5, fontWeight: '600' }}>{ozelAd(g, rol)}{g.tur === 'yildonumu' && yil > 0 ? ' · ' + yil + '. yıl' : ''}</Text><Text style={[s.sub, { fontSize: 11 }]}>{d.getDate()} {AY[d.getMonth()]} · ekleyen {AD[g.kim]}</Text></View>
            <Hap yazi={kalan === 0 ? 'Bugün' : kalan + ' gün'} t={kalan <= 7 ? 'o' : 'n'} />
          </Pressable>); }) : <Text style={s.soluk}>Doğum günü, yıldönümü gibi günleri ekle; yaklaşınca Aile takviminde görünür.</Text>}
      </KartK>

      <AltPencere acik={!!pen} kapat={() => setPen(null)}>
        {pen?.t === 'para' && <ParaFormu key={n} rol={rol} gelir0={pen.gelir} kapat={() => setPen(null)} />}
        {pen?.t === 'etk' && <EtkinlikFormu key={n} rol={rol} e={pen.e} randevu0={pen.randevu} kapat={() => setPen(null)} />}
        {pen?.t === 'ozel' && <OzelGunFormu key={n} g={pen.g} rol={rol} kapat={() => setPen(null)} />}
      </AltPencere>
    </>
  );
}
