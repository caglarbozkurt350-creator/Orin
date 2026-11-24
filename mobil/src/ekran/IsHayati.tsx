// İş Hayatı (0.9.0 · alt menü ortadaki +): 4 haftaya kadar geriye kayıtlar, kalemle düzelt/sil, durum etiketi
// (Başlanacak · Devam · Bitti · Beklemede), Günü doldur, Dünü tekrarla, ay takvimi, proje koduna göre arama, aylık PDF,
// İzin girişi ve kayıtlı izinleri düzeltme/kaldırma. Olaylar: kayit, kayit_duzelt, kayit_sil, izin, izin_sil (masaüstü bulut.js + orv-telefon.js).
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { AltPencere, Bos } from '@/bilesen/formlar';
import { Dugme, Ikon, KartK, SayfaBasligi, s } from '@/bilesen/ortak';
import { PdfDugme } from '@/bilesen/Pdf';
import { IZIN_AD, IzinAraligi, IzinGirisi } from '@/ekran/IzinGirisi';
import { Kalem, olayEkle, useDurum } from '@/lib/depo';
import { gunAnahtari, useGorunum } from '@/lib/ekip';
import { etiketOku } from '@/lib/etiket';
import { AD, useRol } from '@/lib/rol';
import { esitleSonra } from '@/lib/senk';
import { R, saydam } from '@/lib/tema';
import { AY, GK, gunEkle, haftaBasi, kisaTarih, tarihOf, uzunTarih } from '@/lib/zaman';

export const DURUM: [string, string, string, string][] = [
  ['baslanacak', 'Başlanacak', 'rgba(255,255,255,0.10)', '#d4d4da'], ['devam', 'Devam', 'rgba(245,165,36,0.18)', '#f7bd55'],
  ['bitti', 'Bitti', 'rgba(62,207,90,0.18)', '#6be585'], ['beklemede', 'Beklemede', 'rgba(95,224,245,0.16)', '#7fe7f7'],
];
const durumOf = (k?: string) => DURUM.find((d) => d[0] === k);
const IZIN_RENK = '#5fe0f5';

function Etiket({ du }: { du?: string }) {
  const d = durumOf(du); if (!d) return null;
  return <View style={{ height: 22, paddingHorizontal: 8, borderRadius: 11, backgroundColor: d[2], justifyContent: 'center' }}><Text style={{ color: d[3], fontSize: 11, fontWeight: '600' }}>{d[1]}</Text></View>;
}
const Yuvarlak = ({ ikon, ad, onPress, kapali }: { ikon: string; ad: string; onPress: () => void; kapali?: boolean }) => (
  <Pressable onPress={onPress} disabled={kapali} accessibilityRole="button" accessibilityLabel={ad} hitSlop={4}
    style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)', opacity: kapali ? 0.35 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] })}>
    <Ikon ad={ikon} boy={18} renk={R.yazi} kalin={2.2} />
  </Pressable>
);

/** Ardışık aynı türdeki izin günlerini aralığa toplar (hafta sonları aradaki boşluğu bozmaz) */
function izinAraliklari(gun: Record<string, { D?: string }>): IzinAraligi[] {
  const g = Object.keys(gun).filter((k) => gun[k].D).sort((a, b) => tarihOf(a).getTime() - tarihOf(b).getTime()), r: IzinAraligi[] = [];
  g.forEach((k) => {
    const t = gun[k].D as string, son = r[r.length - 1], ayni = son && (son.t === t || (son.t.startsWith('rapor') && t.startsWith('rapor')));
    if (ayni && (tarihOf(k).getTime() - tarihOf(son.s).getTime()) / 86400000 <= 3) son.s = k; else r.push({ t, b: k, s: k });
  });
  return r;
}

/** Profil seçimi: eşte salt okunur izin görünümü, Çağlar’da kayıt ekranı */
export function IsHayati() { return useRol() === 'es' ? <IsHayatiEs /> : <IsHayatiBen />; }

/** Eş profili: Çağlar’ın izin günleri ay takviminde ve listede. Giriş, düzeltme, silme yok (yalnız Çağlar yapar). */
function IsHayatiEs() {
  const o = useGorunum(), bugunK = gunAnahtari(new Date()), [ay, setAy] = useState(0);
  const izinler = useMemo(() => izinAraliklari(o.gun), [o.gun]);
  const b0 = new Date(), bas = new Date(b0.getFullYear(), b0.getMonth() + ay, 1), son = new Date(bas.getFullYear(), bas.getMonth() + 1, 0);
  const hucre: (Date | null)[] = []; for (let i = 0; i < (bas.getDay() + 6) % 7; i++) hucre.push(null); for (let d = 1; d <= son.getDate(); d++) hucre.push(new Date(bas.getFullYear(), bas.getMonth(), d));
  const ayIzin = hucre.filter((d) => d && o.gun[gunAnahtari(d)]?.D).length;
  const bugun = new Date(new Date().setHours(0, 0, 0, 0)), yak = izinler.filter((z) => tarihOf(z.s) >= bugun), gec = izinler.filter((z) => tarihOf(z.s) < bugun).reverse().slice(0, 4);
  const Satir = ({ z, soluk }: { z: IzinAraligi; soluk?: boolean }) => { const n = Math.round((tarihOf(z.s).getTime() - tarihOf(z.b).getTime()) / 86400000) + 1; return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', opacity: soluk ? 0.6 : 1 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: IZIN_RENK }} />
      <Text style={{ flex: 1, color: R.yazi, fontSize: 13.5 }}>{IZIN_AD[z.t] || 'İzin'} · {kisaTarih(z.b)}{z.s !== z.b ? ' – ' + kisaTarih(z.s) : ''}</Text>
      <Text style={s.sub}>{n > 1 ? n + ' gün' : '1 gün'}</Text>
    </View>); };
  return (
    <View style={{ gap: 12 }}>
      <SayfaBasligi ust={AD.cagla + '’ın izin ve tatil günleri'} baslik="İş Hayatı" />
      <View style={[s.cam, { gap: 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Yuvarlak ikon="sol" ad="Önceki ay" onPress={() => setAy((x) => x - 1)} kapali={ay <= -1} />
          <View style={{ flex: 1, alignItems: 'center' }}><Text style={{ color: R.yazi, fontSize: 16, fontWeight: '700' }}>{AY[bas.getMonth()]} {bas.getFullYear()}</Text><Text style={s.sub}>{ayIzin ? ayIzin + ' izin günü' : 'izin yok'}</Text></View>
          <Yuvarlak ikon="sag" ad="Sonraki ay" onPress={() => setAy((x) => x + 1)} kapali={ay >= 3} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((x) => <Text key={x} style={[s.sub, { width: '14.28%', textAlign: 'center', fontSize: 11 }]}>{x}</Text>)}
          {hucre.map((d, i) => { if (!d) return <View key={'b' + i} style={{ width: '14.28%', height: 46 }} />; const k = gunAnahtari(d), iz = o.gun[k]?.D; return (
            <View key={k} style={{ width: '14.28%', padding: 2 }} accessible accessibilityLabel={uzunTarih(k) + (iz ? ', ' + (IZIN_AD[iz] || 'izin') : '')}>
              <View style={{ height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 3, backgroundColor: iz ? saydam(IZIN_RENK, 0.18) : 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: k === bugunK ? R.ana : 'transparent' }}>
                <Text style={{ color: d.getDay() % 6 === 0 ? R.yazi2 : R.yazi, fontSize: 13, fontWeight: '600' }}>{d.getDate()}</Text>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: iz ? IZIN_RENK : 'transparent' }} />
              </View>
            </View>); })}
        </View>
        {!o.ts && <Bos yazi="Eşitlenince izin günleri burada görünür." ikon="izin" />}
      </View>
      <KartK ad="izinEs" baslik="İZİNLER" ozet={yak.length ? yak.length + ' yaklaşan' : 'yaklaşan yok'}>
        {yak.length ? yak.map((z) => <Satir key={z.b + z.t} z={z} />) : <Text style={s.soluk}>Yaklaşan izin günü yok.</Text>}
        {gec.length > 0 && <><Text style={s.sub}>Geçen 30 gün</Text>{gec.map((z) => <Satir key={z.b + z.t} z={z} soluk />)}</>}
        <Text style={[s.sub, { fontSize: 11.5 }]}>İzinleri yalnız {AD.cagla} girer ve düzeltir; burada görüntülenir. Randevu ve etkinlikleri Ailem › Aile takvimi’ne ekleyebilirsin.</Text>
      </KartK>
    </View>
  );
}

function IsHayatiBen() {
  const o = useGorunum(), olaylar = useDurum((d) => d.olaylar), bugunK = gunAnahtari(new Date());
  const [hof, setHof] = useState(0), [sec, setSec] = useState(bugunK);
  const [kod, setKod] = useState(''), [is, setIs] = useState(''), [dk, setDk] = useState(''), [du, setDu] = useState('devam');
  const [duz, setDuz] = useState<{ n: number; eski: Kalem } | null>(null);
  const [hata, setHata] = useState(''), [ok, setOk] = useState(''), [pen, setPen] = useState<'' | 'ay' | 'ara'>(''), [ara, setAra] = useState('');
  const [izinDuz, setIzinDuz] = useState<IzinAraligi | null>(null), [izinKey, setIzinKey] = useState(0);
  const hafta = useMemo(() => { const b = gunEkle(haftaBasi(), hof * 7); return [0, 1, 2, 3, 4].map((i) => gunEkle(b, i)); }, [hof]);
  const g = o.gun[sec], L = g?.L ?? null, H = (L || 0) + (g?.OT || 0), T = g?.T || 0;
  const bekleyen = new Set(olaylar.filter((e) => e.tur === 'kayit' && !e.gitti && e.veri.k === sec).map((e) => e.veri.kod + '|' + e.veri.is + '|' + e.veri.dk));
  const renk = (k: string) => { const x = o.gun[k]; if (!x) return '#4a4a50'; if (x.D) return IZIN_RENK; if (!x.L) return x.T ? R.ana : '#4a4a50'; return x.T >= x.L + (x.OT || 0) ? R.yesil : x.T ? R.turuncu : tarihOf(k) < tarihOf(bugunK) ? R.kirmizi : '#4a4a50'; };
  const temizle = () => { setDuz(null); setDk(''); setIs(''); setHata(''); };
  const gunSec = (k: string) => { setSec(k); temizle(); setOk(''); };
  const haftaGit = (n: number) => { const y = Math.max(-3, Math.min(0, hof + n)); setHof(y); const b = gunEkle(haftaBasi(), y * 7); gunSec(y === 0 ? bugunK : gunAnahtari(b)); };

  const kaydet = (dakika?: number) => {
    setHata(''); setOk(''); const d = dakika ?? parseInt(dk, 10), k = kod.trim() || (/(tezgah|atölye|yarı mamül|diğer)/i.test(is) ? 'Diğer' : '');
    if (!k) return setHata('Proje kodunu yaz'); if (!is.trim()) return setHata('Yapılan işi yaz'); if (!d || d <= 0) return setHata('Dakikayı yaz');
    if (g?.D) return setHata('Bu gün izin günü; ayrıca kayıt gerekmez');
    if (duz) { olayEkle('kayit_duzelt', { k: sec, n: duz.n, eski: duz.eski.slice(0, 3), yeni: { kod: k, is: is.trim(), dk: d, du } }); setOk('Kayıt güncellendi'); }
    else { olayEkle('kayit', { k: sec, kod: k, is: is.trim(), dk: d, du }); setOk('Kaydedildi · ' + d + ' dk'); }
    esitleSonra(); temizle();
  };
  const sil = () => { if (!duz) return; olayEkle('kayit_sil', { k: sec, n: duz.n, eski: duz.eski.slice(0, 3) }); esitleSonra(); temizle(); setOk('Kayıt silindi'); };
  const duzenle = (x: Kalem, n: number) => { setDuz({ n, eski: x }); setKod(x[0]); setIs(x[1]); setDk(String(x[2])); setDu(x[3] || 'devam'); setHata(''); setOk(''); };
  const doldur = () => { if (!L) return setHata('Bu gün için iş süresi yok'); const kalan = H - T; if (kalan <= 0) return setHata('Gün zaten dolu'); kaydet(kalan); };
  // Dünü tekrarla: seçili günden önceki ilk dolu iş günündeki kayıtları bu güne kopyalar
  const dunuTekrarla = () => {
    setHata(''); setOk(''); if (g?.D) return setHata('Bu gün izin günü');
    let k = ''; for (let i = 1; i <= 7 && !k; i++) { const x = gunAnahtari(gunEkle(tarihOf(sec), -i)); if (o.gun[x]?.e?.length && !o.gun[x].D) k = x; }
    if (!k) return setHata('Önceki 7 günde kopyalanacak kayıt yok');
    o.gun[k].e.forEach((x) => olayEkle('kayit', { k: sec, kod: x[0], is: x[1], dk: x[2], du: x[3] === 'bitti' ? 'bitti' : 'devam' }));
    esitleSonra(); setOk(kisaTarih(k) + ' günündeki ' + o.gun[k].e.length + ' kayıt kopyalandı');
  };
  const [okuyor, setOkuyor] = useState(false);
  const etiket = async () => {
    setHata(''); setOk(''); setOkuyor(true);
    try {
      const r = await etiketOku(); if (!r) return;
      if (!r.kod && !r.is) return setHata('Etiket okunamadı; daha yakından ve düz çekip tekrar dene');
      if (r.kod) setKod(r.kod); if (r.is) setIs(r.is);
      setOk('Okundu: ' + (r.kod || '—') + (r.is ? ' · ' + r.is : '') + (r.guven < 0.6 ? ' · emin değil, kontrol et' : '') + '. Dakikayı yaz.');
    } catch (e: any) { setHata('Etiket okunamadı: ' + (e?.message || e)); } finally { setOkuyor(false); }
  };
  // Ay takvimi ve arama
  const ayGunleri = useMemo(() => {
    const b = new Date(), bas = new Date(b.getFullYear(), b.getMonth(), 1), son = new Date(b.getFullYear(), b.getMonth() + 1, 0), r: (Date | null)[] = [];
    for (let i = 0; i < (bas.getDay() + 6) % 7; i++) r.push(null); for (let d = 1; d <= son.getDate(); d++) r.push(new Date(b.getFullYear(), b.getMonth(), d));
    return r;
  }, []);
  const ayaGit = (d: Date) => { const h = Math.round((haftaBasi(d).getTime() - haftaBasi().getTime()) / (7 * 86400000)); setHof(Math.max(-3, Math.min(0, h))); gunSec(gunAnahtari(d)); setPen(''); };
  const sonuc = useMemo(() => {
    const q = ara.trim().toLocaleLowerCase('tr'); if (!q) return [] as [string, Kalem][];
    const r: [string, Kalem][] = []; Object.keys(o.gun).forEach((k) => (o.gun[k].e || []).forEach((x) => { if ((x[0] + ' ' + x[1]).toLocaleLowerCase('tr').includes(q)) r.push([k, x]); }));
    return r.sort((a, b) => tarihOf(b[0]).getTime() - tarihOf(a[0]).getTime()).slice(0, 30);
  }, [ara, o.gun]);
  const izinler = useMemo(() => izinAraliklari(o.gun), [o.gun]);
  const projeler = (o.proj.length ? o.proj.slice(0, 6) : []).concat(['Standart dışı', 'Diğer']);
  const haftaAd = hafta[0].getDate() + '–' + hafta[4].getDate() + ' ' + AY[hafta[4].getMonth()] + (hof === 0 ? ' · bu hafta' : hof === -1 ? ' · geçen hafta' : ' · ' + -hof + ' hafta önce');

  return (
    <View style={{ gap: 12 }}>
      <SayfaBasligi ust={haftaAd} baslik="İş Hayatı" sag={<View style={{ flexDirection: 'row', gap: 6, marginBottom: 2 }}>
        <Yuvarlak ikon="gun" ad="Ay takvimi" onPress={() => setPen('ay')} />
        <Yuvarlak ikon="ara" ad="Proje koduna göre ara" onPress={() => setPen('ara')} />
        <PdfDugme tur="is" />
      </View>} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <Yuvarlak ikon="sol" ad="Önceki hafta" onPress={() => haftaGit(-1)} kapali={hof <= -3} />
        {hafta.map((d) => { const k = gunAnahtari(d), on = k === sec; return (
          <Pressable key={k} onPress={() => gunSec(k)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={uzunTarih(k)}
            style={{ flex: 1, alignItems: 'center', gap: 5, paddingVertical: 8, borderRadius: 14, backgroundColor: on ? saydam(R.ana, 0.2) : '#222225', borderWidth: 1, borderColor: on ? R.ana : k === bugunK ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.06)' }}>
            <Text style={{ color: R.yazi2, fontSize: 11 }}>{GK[d.getDay()]}</Text><Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{d.getDate()}</Text><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: renk(k) }} />
          </Pressable>); })}
        <Yuvarlak ikon="sag" ad="Sonraki hafta" onPress={() => haftaGit(1)} kapali={hof >= 0} />
      </View>

      <View style={[s.cam, { gap: 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ color: R.yazi, fontSize: 17, fontWeight: '700' }}>{uzunTarih(sec)}{sec === bugunK ? ' · bugün' : ''}</Text>
          <Text style={s.sub}>{g?.D ? (IZIN_AD[g.D] || 'İzin') + ' · tam gün' : L ? T + ' / ' + H + ' dk' : 'iş süresi yok'}</Text>
        </View>
        {!!L && !g?.D && <View style={{ height: 8, borderRadius: 99, backgroundColor: R.giris, overflow: 'hidden' }}><View style={{ width: Math.min(100, (T / (H || 1)) * 100) + '%', height: '100%', backgroundColor: T >= H ? R.yesil : R.ana, borderRadius: 99 }} /></View>}
        {!o.ts && <Bos yazi="Masaüstü Orvane ile eşitlenince geçmiş kayıtların burada görünür. Telefondan girdiğin kayıtlar sırada bekler." ikon="gun" />}
        {(g?.e || []).map((x, n) => { const bek = bekleyen.has(x[0] + '|' + x[1] + '|' + x[2]), sd = duz?.n === n; return (
          <View key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: sd ? R.ana : 'transparent' }}>
            <View style={{ flex: 1, gap: 2 }}><Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{x[0]}</Text><Text numberOfLines={2} style={{ color: R.soluk, fontSize: 12.5 }}>{x[1]}{bek ? ' · sırada' : ''}</Text></View>
            <Etiket du={x[3]} />
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{x[2]} dk</Text>
            <Pressable onPress={() => duzenle(x, n)} accessibilityRole="button" accessibilityLabel={x[0] + ' kaydını düzelt'} hitSlop={6} style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)' }}>
              <Ikon ad="kalem" boy={15} renk={R.yazi} kalin={2.1} />
            </Pressable>
          </View>); })}
        {g?.D && (() => { const ar = izinler.find((z) => tarihOf(z.b) <= tarihOf(sec) && tarihOf(sec) <= tarihOf(z.s)); return ar ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14, backgroundColor: saydam(IZIN_RENK, 0.1) }}>
            <Ikon ad="izin" boy={18} renk={IZIN_RENK} kalin={2} />
            <Text style={{ flex: 1, color: R.yazi, fontSize: 13.5 }}>{IZIN_AD[ar.t] || 'İzin'} · {kisaTarih(ar.b)}{ar.s !== ar.b ? ' – ' + kisaTarih(ar.s) : ''}</Text>
            <Pressable onPress={() => { setIzinDuz(ar); setIzinKey((x) => x + 1); }} accessibilityRole="button" hitSlop={6}><Text style={{ color: R.ana2, fontSize: 13, fontWeight: '600' }}>Düzelt</Text></Pressable>
          </View>) : null; })()}
        {!g?.e?.length && !g?.D && !!o.ts && <Text style={s.soluk}>Bu güne kayıt girilmemiş.</Text>}
      </View>

      {!g?.D && <View style={[s.cam, { gap: 10 }]}>
        {duz && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, backgroundColor: saydam(R.ana, 0.12) }}><Ikon ad="kalem" boy={16} renk={R.ana2} kalin={2.1} /><Text style={{ flex: 1, color: R.ana2, fontSize: 13 }}>Kaydı düzeltiyorsun: {duz.eski[0]} · {duz.eski[2]} dk</Text></View>}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={[s.giris, { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
            <View style={{ flex: 1 }}><Text style={s.girisEt}>Proje kodu</Text><TextInput value={kod} onChangeText={setKod} placeholder="78.26.03.19" placeholderTextColor={R.solukk} style={s.girisY} autoCapitalize="none" /></View>
            <Pressable onPress={etiket} disabled={okuyor} accessibilityRole="button" accessibilityLabel="Etiketi fotoğrafla oku" hitSlop={8} style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: okuyor ? saydam(R.ana, 0.25) : '#2e2e33' }}>
              {okuyor ? <ActivityIndicator color="#fff" /> : <Ikon ad="kamera" boy={20} renk="#e4e4e8" />}
            </Pressable>
          </View>
          <View style={[s.giris, { width: 96 }]}><Text style={s.girisEt}>Dakika</Text><TextInput value={dk} onChangeText={setDk} keyboardType="number-pad" placeholder="120" placeholderTextColor={R.solukk} style={s.girisY} /></View>
        </View>
        <View style={s.giris}><Text style={s.girisEt}>Yapılan iş</Text><TextInput value={is} onChangeText={setIs} placeholder="Montaj" placeholderTextColor={R.solukk} style={s.girisY} /></View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {projeler.map((p) => <Pressable key={p} onPress={() => setKod(p)} accessibilityRole="button" accessibilityState={{ selected: kod === p }} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: kod === p ? R.secili : '#2e2e33' }}><Text style={{ color: '#d4d4da', fontSize: 12.5 }}>{p}</Text></Pressable>)}
        </View>
        <Text style={s.sub}>Durum</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {DURUM.map((d) => { const on = du === d[0]; return (
            <Pressable key={d[0]} onPress={() => setDu(d[0])} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ height: 34, paddingHorizontal: 12, borderRadius: 17, justifyContent: 'center', backgroundColor: on ? d[2] : 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: on ? d[3] : 'rgba(255,255,255,0.1)' }}>
              <Text style={{ color: on ? d[3] : '#c9c9cf', fontSize: 12.5, fontWeight: '600' }}>{d[1]}</Text>
            </Pressable>); })}
        </View>
        {!!ok && !hata && <Text style={{ color: '#9fd8b8', fontSize: 13 }}>{ok}</Text>}
        {!!hata && <Text style={{ color: '#f4a3a3', fontSize: 13 }}>{hata}</Text>}
        {duz ? <View style={{ flexDirection: 'row', gap: 8 }}>
          <Dugme yazi="Sil" tur="tehlike" onPress={sil} />
          <Dugme yazi="Vazgeç" tur="ikinci" onPress={temizle} stil={{ flex: 1 }} />
          <Dugme yazi="Güncelle" onPress={() => kaydet()} stil={{ flex: 1 }} />
        </View> : <>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Dugme yazi="Günü doldur" tur="ikinci" onPress={doldur} stil={{ flex: 1 }} />
            <Dugme yazi="↻ Dünü tekrarla" tur="ikinci" onPress={dunuTekrarla} stil={{ flex: 1 }} />
          </View>
          <Dugme yazi="Kaydet" onPress={() => kaydet()} />
        </>}
        <Text style={[s.soluk, { fontSize: 12 }]}>Kayıt, düzeltme ve silme önce eşitlemeye gider; bilgisayardaki Orvane alır ve Sheets’e işler. İnternet yokken sırada bekler.</Text>
      </View>}

      <KartK ad="izin" baslik={izinDuz ? 'İZNİ DÜZELT' : 'İZİN GİRİŞİ'} ozet={izinler.length + ' kayıtlı izin'}>
        <IzinGirisi key={izinKey} duzelt={izinDuz} bitti={izinDuz ? () => { setIzinDuz(null); setIzinKey((x) => x + 1); } : undefined} />
        {izinler.length > 0 && <View style={{ gap: 6 }}>
          <Text style={s.sub}>Kayıtlı</Text>
          {izinler.map((z) => (
            <View key={z.b + z.t} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 12, borderRadius: 14, backgroundColor: izinDuz?.b === z.b ? saydam(R.ana, 0.12) : 'rgba(255,255,255,0.05)' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: IZIN_RENK }} />
              <Text style={{ flex: 1, color: R.yazi, fontSize: 13.5 }}>{IZIN_AD[z.t] || 'İzin'} · {kisaTarih(z.b)}{z.s !== z.b ? ' – ' + kisaTarih(z.s) : ''}</Text>
              <Pressable onPress={() => { setIzinDuz(z); setIzinKey((x) => x + 1); }} accessibilityRole="button" accessibilityLabel="İzni düzelt" hitSlop={6}><Text style={{ color: R.ana2, fontSize: 13, fontWeight: '600' }}>Düzelt</Text></Pressable>
              <Pressable onPress={() => { olayEkle('izin_sil', z); esitleSonra(); if (izinDuz?.b === z.b) { setIzinDuz(null); setIzinKey((x) => x + 1); } }} accessibilityRole="button" accessibilityLabel="İzni kaldır" hitSlop={6}><Text style={{ color: '#f4a3a3', fontSize: 13, fontWeight: '600' }}>Kaldır</Text></Pressable>
            </View>
          ))}
        </View>}
      </KartK>

      <AltPencere acik={pen === 'ay'} kapat={() => setPen('')}>
        <View style={{ gap: 10 }}>
          <Text style={{ color: R.yazi, fontSize: 17, fontWeight: '700' }}>{AY[new Date().getMonth()]} {new Date().getFullYear()}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((x) => <Text key={x} style={[s.sub, { width: '14.28%', textAlign: 'center', fontSize: 11 }]}>{x}</Text>)}
            {ayGunleri.map((d, i) => { if (!d) return <View key={'b' + i} style={{ width: '14.28%', height: 46 }} />; const k = gunAnahtari(d), uzak = haftaBasi(d) < gunEkle(haftaBasi(), -21) || d > new Date();
              return (
                <View key={k} style={{ width: '14.28%', padding: 2 }}>
                  <Pressable onPress={() => ayaGit(d)} disabled={uzak} accessibilityRole="button" accessibilityLabel={uzunTarih(k)} style={{ height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 3, opacity: uzak ? 0.4 : 1, backgroundColor: k === sec ? saydam(R.ana, 0.2) : 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: k === bugunK ? R.ana : 'transparent' }}>
                    <Text style={{ color: R.yazi, fontSize: 13, fontWeight: '600' }}>{d.getDate()}</Text>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: d.getDay() % 6 === 0 ? 'transparent' : renk(k) }} />
                  </Pressable>
                </View>); })}
          </View>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            {[[R.yesil, 'Tam'], [R.turuncu, 'Eksik'], [R.kirmizi, 'Boş'], [IZIN_RENK, 'İzin']].map(([r, y]) => <View key={y} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: r }} /><Text style={s.sub}>{y}</Text></View>)}
          </View>
          <Text style={[s.sub, { fontSize: 11.5 }]}>Güne dokun: o haftaya gider. Son 4 hafta açılabilir.</Text>
        </View>
      </AltPencere>

      <AltPencere acik={pen === 'ara'} kapat={() => setPen('')}>
        <View style={{ gap: 10 }}>
          <Text style={{ color: R.yazi, fontSize: 17, fontWeight: '700' }}>Proje koduna göre</Text>
          <View style={[s.giris, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}><Ikon ad="ara" boy={16} renk={R.soluk} /><TextInput value={ara} onChangeText={setAra} placeholder="Kod ya da iş" placeholderTextColor={R.solukk} style={[s.girisY, { flex: 1 }]} autoCapitalize="none" accessibilityLabel="Proje kodu ara" /></View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{o.proj.slice(0, 5).map((p) => <Pressable key={p} onPress={() => setAra(p)} style={{ paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: ara === p ? R.secili : '#2e2e33' }}><Text style={{ color: '#d4d4da', fontSize: 12.5 }}>{p}</Text></Pressable>)}</View>
          {sonuc.map(([k, x], i) => (
            <Pressable key={k + i} onPress={() => ayaGit(tarihOf(k))} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <Text style={{ width: 52, color: R.yazi2, fontSize: 12 }}>{kisaTarih(k)}</Text>
              <Text numberOfLines={1} style={{ flex: 1, color: R.yazi, fontSize: 13 }}>{x[0]} · {x[1]}</Text>
              <Text style={{ color: R.yazi, fontSize: 12.5, fontWeight: '700' }}>{x[2]} dk</Text>
            </Pressable>
          ))}
          <Text style={s.sub}>{ara.trim() ? sonuc.length + ' kayıt · toplam ' + sonuc.reduce((a, [, x]) => a + x[2], 0).toLocaleString('tr-TR') + ' dk (son 45 gün)' : 'Son 45 günün kayıtlarında arar.'}</Text>
        </View>
      </AltPencere>
    </View>
  );
}
