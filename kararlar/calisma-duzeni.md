# Çalışma düzeni

- Kullanıcıyla her zaman Türkçe konuşulur; kod adları ve dosya adları olduğu gibi kalır.
- Orvane'nin konuşulduğu oturum **Ana sekme**dir; kod yazmaz, dosya düzenlemez.
- Ana sekme yalnız: istenen iş için en kısa öneri + gerekli sorular. Bağlam en küçük tutulur.
- Her iş ayrı **alt sekmede** (yeni oturum, kendi dalı/worktree'si) yapılır.
- Raporlar **"Orvane · Raporlar"** alt sekmesinde toplanır; ana sekmeye yalnız tek satırlık sonuç gelir.
- Ana sekme alt sekmeleri denetler. İşi biten alt sekme, raporu Raporlar sekmesine alınıp dalı birleştikten sonra sıkıştırılır veya silinir (kullanıcının kalıcı izni). Rapor alınmadan silinmez; Raporlar sekmesi silinmez.
- Karar dosyaları: `KARARLAR.md` (genel kurallar + dizin) ve `kararlar/*.md` (konu başına). Yeni karar ilgili konu dosyasına eklenir.
- Dal adları: `ozellik/…`, `duzeltme/…`, `surum/x.y.z`, `claude/…`; birleştirme `main`'e PR ile.
- Sürüm notu: her sürümde `surum-notlari/<sürüm>.md`; kısa, Türkçe, "Masaüstü / Telefon" başlıkları, telefonda değişiklik yoksa "Değişiklik yok".
- Bilgi notları kısa: yalnız kimin ne yaptığı.
- PR'lar kullanıcı onaylamadan birleştirilmez.
