# Yayın ve sürüm

- Yayını ana sekme yapar (bkz. calisma-duzeni).
- Masaüstü yayını: GitHub › Actions › "Orvane sürümünü yayınla" (tek tuş, telefondan da olur).
- Önce testler (`npm run smoke`); biri düşerse yayın yok.
- GitHub'da kalan sürümler: en yeni 2 + en yeni onaylı sürüm; gerisi silinir.
- Onaylı sürüm listesi: `onayli-surumler.json` (şu an 0.7.23). Yeni sürüm onaylanınca başa eklenir. Ayarlar › Sorun giderme › "Önceki onaylı sürüme dön".
- Güncelleme öncesi yedek alınır.
- Kurulum dosyaları arşivlenir: `Belgeler\Orin\Kurulum Dosyaları PC\Sürüm X` ve `APK\Sürüm X`.
- Telefon: Expo/EAS; yerel modül eklenmedikçe uygulama içi güncelleme (yeni APK gerekmez). Yeni modül gerekiyorsa APK + `mobil/apk.json`.
- Testler kişisel veri olmadan da geçer; testlerde örnek bakiyeler uydurma değerlerdir.
