# Orvane

Bu kurallar her oturumda kendiliğinden yüklenir. Alt sekmeler `kararlar/` klasörünü okumaz; işe özel kurallar ana sekmenin brief'inde gelir.

## Temel kurallar

1. Kullanıcıyla Türkçe konuş.
2. Hiçbir özellik silinmez (kullanıcı açıkça istemedikçe).
3. Kullanıcının girdiği veriler değiştirilmez, silinmez. Veri doğrudur; hata hesapta ve kuralda aranır. Yalnız programın ürettiği kayıtlar (otomatik maaş, kayıt dışı, devir) düzeltilebilir; eski değer nota yazılır.
4. `durum.json`'a yazmadan önce Orvane kapalı olmalı ve `Veriler\Yedekler`'e yedek alınmalı.
5. PR birleştirme, yayın, kurulum ve telefon OTA yalnız ana sekmede. Alt sekme PR açar; birleştirmez, yayınlamaz.
6. Bütçe: aylık gelir ≤ Bordro Net Ödenen + SGK ödeneği. Gelir eklenmeden gelir artmaz. Bakiye bildirimi gelire eklenmez; aradaki fark kayıt dışı harcamadır.
7. Testler kişisel veri olmadan, uydurma değerlerle. Masaüstü `npm run smoke`, telefon `cd mobil && npx tsc --noEmit`.
8. Her değişikliğe kısa Türkçe sürüm notu: `surum-notlari/<sürüm>.md`.
9. Yeni ekran önce Claude Design'da tasarlanır; ana sekme onaylamadan kodlanmaz.
10. Bordro ve şirket verisi buluta gitmez; eşe yalnız aile verisi gider; yapay zekâ varsayılan kapalı.

## Çalışma düzeni

- Ana sekme yalnız kısa öneri ve soru sorar; işleri alt sekmelere verir, denetler, birleştirir, yayınlar.
- `KARARLAR.md` ve `kararlar/*.md` kayıt içindir. Yalnız ana sekme, büyük güncellemelerde (yeni sürüm hattı, mimari değişiklik) okur.
- Yeni karar ilgili `kararlar/` dosyasına eklenir; her işe dokunan büyük bir kuralsa buraya da eklenir.
