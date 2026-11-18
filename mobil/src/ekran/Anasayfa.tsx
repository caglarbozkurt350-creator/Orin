// Anasayfa (dashboard): 4 gösterge kartı, halka ve sütun grafik, bu haftanın iş günü, bugünkü görevler.
// Hepsi gerçek veriden (masaüstü özeti + yerel olaylar) hesaplanır; veri yoksa boş durum gösterilir.
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Bos } from '@/bilesen/formlar';
import { Avatar, Dugme, Foto, Hap, KartK, SayfaBasligi, s } from '@/bilesen/ortak';
import { cagladaBekleyen, gunAnahtari } from '@/lib/ekip';
import { depAdi } from '@/lib/ekipMeta';
import { sekmeGit } from '@/lib/gezinti';
import { bugunYazi, useEkip } from '@/lib/kullan';
import { R, saydam } from '@/lib/tema';

function Sutun({ h, renk, gec }: { h: number; renk: string; gec: number }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(a, { toValue: 1, duration: 700, delay: gec, easing: Easing.out(Easing.back(1.3)), useNativeDriver: false }).start(); }, [a, gec]);
  return <Animated.View style={{ width: '100%', maxWidth: 34, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, backgroundColor: renk, height: a.interpolate({ inputRange: [0, 1], outputRange: [0, h] }) }} />;
}

function Gosterge({ etiket, deger, kucuk, hap, onPress }: { etiket: string; deger: string; kucuk?: string; hap: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={etiket + ' ' + deger + (kucuk || '')}
      style={({ pressed }) => [s.cam, { flex: 1, minHeight: 112, borderRadius: 20, padding: 14, gap: 6, alignItems: 'flex-start', transform: [{ scale: pressed ? 0.95 : 1 }] }]}>
      <Text style={{ color: '#c9c9cf', fontSize: 12.5, fontWeight: '500' }}>{etiket}</Text>
      <Text style={{ color: R.yazi, fontSize: 30, lineHeight: 34, fontWeight: '700', letterSpacing: -0.5 }}>{deger}{!!kucuk && <Text style={{ fontSize: 14, fontWeight: '500', color: R.yazi2, letterSpacing: 0 }}>{kucuk}</Text>}</Text>
      {hap}
    </Pressable>
  );
}

const KISA_DEP: Record<string, string> = { 'YÖNETİM': 'Yönetim', 'AİLE': 'Aile', 'İŞ': 'İş', 'PLAN & İLETİŞİM': 'Plan', 'TEKNİK': 'Teknik', 'ORTAK SERVİS': 'Servis', DİĞER: 'Diğer' };

export function Anasayfa() {
  const { o, hepsi, durum, cevrim, senk } = useEkip();
  const onay = cagladaBekleyen(o).length;
  const say = { ok: 0, bz: 0, id: 0 };
  hepsi.forEach((c) => { say[durum(c)]++; });
  const T = hepsi.length || 1;
  const acik = o.ekip.gorev.filter((g) => g.durum !== 'bitti'), acil = acik.filter((g) => g.onc === 'acil').length;
  const aktifler = hepsi.filter((c) => durum(c) !== 'id').slice(0, 7);
  // Donut: yarıçap 48, çevre C
  const C = 2 * Math.PI * 48, dilim = (n: number, bas: number) => ({ d: Math.max(0, (n / T) * C - (n ? 4 : 0)), o: -(bas / T) * C });
  const dh = dilim(say.ok, 0), dc = dilim(say.bz, say.ok), dk = dilim(say.id, say.ok + say.bz);
  const yuzde = (n: number) => Math.round((n / T) * 100);
  // Departmanlar
  const dep: Record<string, number> = {};
  hepsi.forEach((c) => { const k = KISA_DEP[depAdi(c.id)] || 'Diğer'; dep[k] = (dep[k] || 0) + 1; });
  const depL = Object.keys(dep).map((k) => [k, dep[k]] as [string, number]), enCok = Math.max(1, ...depL.map((x) => x[1]));
  // Bu haftanın iş günü
  const d0 = new Date(); d0.setHours(0, 0, 0, 0); d0.setDate(d0.getDate() - ((d0.getDay() + 6) % 7));
  const hafta = [0, 1, 2, 3, 4].map((i) => { const d = new Date(d0); d.setDate(d0.getDate() + i); return d; });
  const bk = gunAnahtari(new Date()), bg = o.gun[bk], bH = (bg?.L || 0) + (bg?.OT || 0);
  const GK = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const gunOzet = !o.ts ? 'Eşitlenmedi' : bg?.D ? 'Bugün izinli' : bH ? 'Bugün ' + (bg?.T || 0) + ' / ' + bH + ' dk' : 'Bugün iş süresi yok';
  const gorevler = acik.slice().sort((a, b) => Number(b.onc === 'acil') - Number(a.onc === 'acil') || b.ts - a.ts).slice(0, 4);
  return (
    <View style={{ gap: 14 }}>
      <SayfaBasligi ust={bugunYazi()} baslik="Merhaba Çağlar" sag={<View style={{ marginBottom: 4 }}><Hap yazi={senk.calisiyor ? 'Eşitleniyor' : cevrim ? 'Çevrimiçi' : 'Çevrimdışı'} t={cevrim ? 'g' : 'o'} /></View>} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Gosterge etiket="Hazır çalışan" deger={String(say.ok)} kucuk={'/' + hepsi.length} hap={<Hap yazi={say.bz + ' görevde'} t="g" />} onPress={() => sekmeGit(3, { ekip: 'ekip' })} />
        <Gosterge etiket="Bekleyen onay" deger={String(onay)} hap={<Hap yazi={onay ? 'Onayla →' : 'Bekleyen yok'} t={onay ? 'o' : 'n'} />} onPress={() => sekmeGit(2, { gorev: 'onay' })} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Gosterge etiket="Açık görev" deger={String(acik.length)} hap={<Hap yazi={acil ? acil + ' acil' : 'acil yok'} t={acil ? 'o' : 'n'} />} onPress={() => sekmeGit(2, { gorev: 'gorev' })} />
        <Gosterge etiket="API · bu ay" deger={o.zeka?.bagli ? '$' + o.zeka.usd.toFixed(2).replace('.', ',') : '—'} kucuk={o.zeka?.bagli ? ' / ' + o.zeka.butce + ' $' : undefined} hap={<Hap yazi={o.zeka?.bagli ? '%90’da Echo’ya ayrılır' : 'Claude bağlı değil'} t="n" />} onPress={() => sekmeGit(4, { merkez: '' })} />
      </View>

      <KartK ad="donut" baslik="EKİP DURUMU" ozet={say.ok + ' hazır · ' + say.bz + ' görevde'}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <View style={{ width: 132, height: 132 }}>
            <Svg width={132} height={132} viewBox="0 0 132 132" style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle cx={66} cy={66} r={48} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={16} />
              {say.ok > 0 && <Circle cx={66} cy={66} r={48} fill="none" stroke="#3ecf5a" strokeWidth={16} strokeLinecap="round" strokeDasharray={`${dh.d} ${C}`} strokeDashoffset={dh.o} />}
              {say.bz > 0 && <Circle cx={66} cy={66} r={48} fill="none" stroke="#f5a524" strokeWidth={16} strokeLinecap="round" strokeDasharray={`${dc.d} ${C}`} strokeDashoffset={dc.o} />}
              {say.id > 0 && <Circle cx={66} cy={66} r={48} fill="none" stroke="#6b6b73" strokeWidth={16} strokeLinecap="round" strokeDasharray={`${dk.d} ${C}`} strokeDashoffset={dk.o} />}
            </Svg>
            <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: R.yazi, fontSize: 26, fontWeight: '700' }}>{yuzde(say.ok + say.bz)}%</Text><Text style={{ color: R.yazi2, fontSize: 11, marginTop: 4 }}>aktif</Text></View>
          </View>
          <View style={{ flex: 1, gap: 10 }}>
            {([['Hazır', '#3ecf5a', say.ok], ['Görevde', '#f5a524', say.bz], ['Çevrimdışı', '#6b6b73', say.id]] as const).map(([y, r, n]) => (
              <View key={y} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: r }} /><Text style={{ flex: 1, color: R.yazi, fontSize: 13 }}>{y}</Text><Text style={{ color: R.yazi, fontSize: 13, fontWeight: '600' }}>{yuzde(n)}%</Text></View>
            ))}
          </View>
        </View>
        {aktifler.length ? <View style={{ flexDirection: 'row', gap: 6 }}>{aktifler.map((c) => <Avatar key={c.id} c={c} boy={40} durum={durum(c)} />)}</View>
          : <Text style={s.soluk}>Şu an hazır ya da görevde çalışan yok. Çalışanlar bilgisayardaki Orvane görev verdiğinde burada görünür.</Text>}
      </KartK>

      <KartK ad="dep" baslik="DEPARTMANLAR" ozet={depL.length + ' departman · ' + hepsi.length + ' çalışan'}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 150, paddingTop: 8, gap: 8 }}>
          {depL.map(([k, n], i) => (
            <View key={k} style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
              <Text style={{ color: n === enCok ? '#6be585' : '#c9c9cf', fontSize: 12, fontWeight: '600' }}>{n}</Text>
              <Sutun h={Math.round((n / enCok) * 100)} renk={n === enCok ? '#3ecf5a' : 'rgba(255,255,255,0.14)'} gec={i * 60} />
              <Text numberOfLines={1} style={{ color: R.yazi2, fontSize: 10.5 }}>{k}</Text>
            </View>
          ))}
        </View>
      </KartK>

      <KartK ad="gorev" baslik="BUGÜNKÜ GÖREVLER" ozet={acik.length + ' açık görev'} sag={<Pressable onPress={() => sekmeGit(2, { gorev: 'gorev' })} accessibilityRole="button" style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: saydam(R.ana, 0.16), justifyContent: 'center' }}><Text style={{ color: R.ana2, fontSize: 12, fontWeight: '600' }}>Tümü</Text></Pressable>}>
        {gorevler.length ? gorevler.map((g) => {
          const c = hepsi.find((x) => x.id === g.kim);
          return (
            <View key={g.id} style={s.satir}>
              <Foto c={c} boy={36} halka={false} />
              <View style={{ flex: 1, gap: 2 }}><Text numberOfLines={2} style={{ color: R.yazi, fontSize: 14, fontWeight: '600' }}>{g.metin}</Text><Text style={s.sub}>{c?.ad}{g.son ? ' · ' + g.son : ''}</Text></View>
              <Hap yazi={g.onc === 'acil' ? 'Acil' : g.durum === 'calisiyor' ? 'Çalışıyor' : 'Bekliyor'} t={g.onc === 'acil' ? 'r' : g.durum === 'calisiyor' ? 'g' : 'o'} />
            </View>
          );
        }) : <Bos yazi="Açık görev yok. Görevler sekmesinden ya da çalışan menüsünden görev verebilirsin." ikon="gorev" />}
      </KartK>

      <KartK ad="isgunu" baslik="İŞ GÜNÜ · BU HAFTA" ozet={gunOzet}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {hafta.map((d) => {
            const k = gunAnahtari(d), g = o.gun[k], H = (g?.L || 0) + (g?.OT || 0), oran = g?.D ? 1 : H ? Math.min(1, (g?.T || 0) / H) : 0, bugun = k === bk, gecmis = k < bk && !!g?.L && !g.D && (g.T || 0) < H;
            const renk = g?.D ? R.yesil : oran >= 1 ? R.ana : gecmis ? R.kirmizi : R.turuncu;
            return (
              <View key={k} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <View style={{ width: '100%', height: 56, borderRadius: 10, overflow: 'hidden', backgroundColor: H || g?.D ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)', borderWidth: bugun ? 1 : 0, borderColor: saydam(R.ana, 0.6), justifyContent: 'flex-end' }}>
                  {oran > 0 && <View style={{ height: oran * 56, backgroundColor: saydam(renk, 0.55) }} />}
                </View>
                <Text style={{ color: bugun ? '#fff' : R.yazi2, fontSize: 12, fontWeight: bugun ? '600' : '400' }}>{GK[d.getDay()]}</Text>
              </View>
            );
          })}
        </View>
        <Text style={s.sub}>{o.ts ? (bH ? 'Bugün ' + (bg?.T || 0) + ' dk girildi, ' + Math.max(0, bH - (bg?.T || 0)) + ' dk kaldı.' : bg?.D ? 'Bugün izin günü, tam gün sayılır.' : 'Bugün için iş süresi yok.') : 'Masaüstü Orvane ile eşitlenince bu haftanın kayıtları burada görünür.'}</Text>
        <Dugme yazi="İş günü gir" onPress={() => sekmeGit(4, { merkez: 'gun' })} />
      </KartK>
    </View>
  );
}
