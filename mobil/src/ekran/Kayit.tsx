// Alt menü ortadaki + : İş günü kaydı ve İzin girişi tek yerde.
import { View } from 'react-native';
import { Bolumler, SayfaBasligi } from '@/bilesen/ortak';
import { IsGunu } from '@/ekran/IsGunu';
import { IzinGirisi } from '@/ekran/IzinGirisi';
import { kayitBolumu, useGezinti } from '@/lib/gezinti';

export function KayitSekmesi() {
  const b = useGezinti((d) => d.kayitBolum);
  return (
    <View style={{ gap: 14 }}>
      <SayfaBasligi ust={b === 'izin' ? 'Yıllık · mazeret · rapor' : 'Günlük · kayıt · etiket'} baslik={b === 'izin' ? 'İzin girişi' : 'İş günü kaydı'} />
      <Bolumler secenek={[['gun', 'İş günü'], ['izin', 'İzin']]} deger={b} sec={kayitBolumu} />
      {b === 'izin' ? <IzinGirisi /> : <IsGunu />}
    </View>
  );
}
