// PDF düğmesi + alt pencere (0.9.0): ay seçimi (bu ay / geçen ay), Paylaş (PDF dosyası) ve Yazdır / Kaydet.
// İş Hayatı başlığı, Bana Özel › İlaçlarım ve Ailem › bütçe kartında kullanılır.
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { AltPencere } from '@/bilesen/formlar';
import { Dugme, Ikon, s } from '@/bilesen/ortak';
import { useGorunum } from '@/lib/ekip';
import { PDF_AD, PdfTur, pdfPaylas, pdfYazdir } from '@/lib/pdf';
import { R, saydam } from '@/lib/tema';
import { AY } from '@/lib/zaman';

const ICERIK: Record<PdfTur, string> = {
  is: 'Günlük döküm (proje kodu, iş, dakika, durum) · izinler · proje özeti · imza alanı',
  ilac: 'Gün gün alındı işaretleri · sabah açlık şekeri çizelgesi · uyum · stok ve tahmini bitiş',
  butce: 'Gelir, gider, kalan · kategoriler · geçen aya göre ▲▼ · kalan bakiye çizgisi · son işlemler',
};

export function PdfDugme({ tur, yazi }: { tur: PdfTur; yazi?: string }) {
  const [acik, setAcik] = useState(false);
  return (
    <>
      {yazi ? (
        <Pressable onPress={() => setAcik(true)} accessibilityRole="button" accessibilityLabel={PDF_AD[tur] + ' PDF'} hitSlop={4}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 12, borderRadius: 17, backgroundColor: saydam(R.ana, 0.16), transform: [{ scale: pressed ? 0.95 : 1 }] })}>
          <Ikon ad="pdf" boy={15} renk={R.ana2} kalin={2.1} /><Text style={{ color: R.ana2, fontSize: 12.5, fontWeight: '700' }}>{yazi}</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => setAcik(true)} accessibilityRole="button" accessibilityLabel={PDF_AD[tur] + ' PDF'} hitSlop={4}
          style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: saydam(R.ana, 0.16), transform: [{ scale: pressed ? 0.92 : 1 }] })}>
          <Ikon ad="pdf" boy={18} renk={R.ana2} kalin={2.1} />
        </Pressable>
      )}
      <AltPencere acik={acik} kapat={() => setAcik(false)}>{acik && <PdfPencere tur={tur} kapat={() => setAcik(false)} />}</AltPencere>
    </>
  );
}

function PdfPencere({ tur, kapat }: { tur: PdfTur; kapat: () => void }) {
  const o = useGorunum(), [gecen, setGecen] = useState(false), [is, setIs] = useState<'' | 'pay' | 'yaz'>(''), [hata, setHata] = useState('');
  const d = new Date(), bu = AY[d.getMonth()], once = AY[(d.getMonth() + 11) % 12];
  const calis = async (ne: 'pay' | 'yaz') => {
    setHata(''); setIs(ne);
    try { if (ne === 'pay') await pdfPaylas(tur, o, gecen); else await pdfYazdir(tur, o, gecen); kapat(); }
    catch (e: any) { setHata('PDF hazırlanamadı: ' + (e?.message || e)); } finally { setIs(''); }
  };
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: saydam(R.ana, 0.18) }}><Ikon ad="pdf" boy={20} renk={R.ana2} kalin={2.1} /></View>
        <View style={{ flex: 1 }}><Text style={{ color: R.yazi, fontSize: 17, fontWeight: '700' }}>{PDF_AD[tur]}</Text><Text style={s.sub}>A4 · tek dosya</Text></View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[[false, bu + ' (bu ay)'], [true, once + ' (geçen ay)']].map(([g, y]) => { const on = gecen === g; return (
          <Pressable key={String(g)} onPress={() => setGecen(g as boolean)} accessibilityRole="radio" accessibilityState={{ selected: on }}
            style={{ flex: 1, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? saydam(R.ana, 0.2) : 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: on ? R.ana : 'rgba(255,255,255,0.1)' }}>
            <Text style={{ color: on ? '#fff' : '#c9c9cf', fontSize: 13.5, fontWeight: '600' }}>{y as string}</Text>
          </Pressable>); })}
      </View>
      <Text style={[s.soluk, { fontSize: 12.5 }]}>{ICERIK[tur]}</Text>
      {!o.ts && <Text style={{ color: '#f7bd55', fontSize: 12.5 }}>Masaüstüyle henüz eşitlenmedi; rapor boş çıkabilir.</Text>}
      {tur === 'is' && gecen && <Text style={[s.sub, { fontSize: 11.5 }]}>Telefon son 45 günü tutar; geçen ayın başı eksik olabilir.</Text>}
      {!!hata && <Text style={{ color: '#f4a3a3', fontSize: 13 }}>{hata}</Text>}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Dugme yazi={is === 'yaz' ? 'Hazırlanıyor…' : 'Yazdır / Kaydet'} tur="ikinci" onPress={() => calis('yaz')} kapali={!!is} stil={{ flex: 1 }} />
        <Dugme yazi={is === 'pay' ? 'Hazırlanıyor…' : 'Paylaş'} ikon={is === 'pay' ? undefined : 'gonder'} onPress={() => calis('pay')} kapali={!!is} stil={{ flex: 1 }} />
      </View>
      {!!is && <ActivityIndicator color={R.ana2} />}
    </View>
  );
}
