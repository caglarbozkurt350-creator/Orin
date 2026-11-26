# Bütçe

- "Şirket bakiyesi" adı → **Aile Bütçesi**. Banka adları kartlarda gösterilmez.
- Aile Bütçesi = iki cep harçlığı + kalan toplamı (0.9.10). Cep harçlığı harcaması, Kübra harcaması ve eşin telefonundan gelen hareket hem kendi bakiyesine hem Aile Bütçesine işlenir.
- Çağlar'ın cep harçlığı = kendi güncel bakiyesi ("bakiye" düzeni). Kübra'nın cebi %0 iken harcamaları Aile Bütçesinden düşer.
- Bakiye bildir: beklenen = son bildirilen + gelirler − giderler. Fark → "Kayıt dışı harcama" / "Kayıt dışı gelir". Zaten işlenmiş hareketler iki kez sayılmaz. Kayıt dışı satırını düzenlemek bakiyeyi değiştirmez.
- Bordro Net Ödenen → Aile Bütçesine "Maaş · Ay Yıl" geliri; otomatik yalnız bu ay ve geçen ay, eski aylar düğmeyle; aynı ay iki kez eklenmez. Maaş satırında yalnız açıklama ve kişi değişir.
- Aylık gelir ≤ Net Ödenen + SGK ödeneği.
- Bakiye bildirimi gelire eklenmez; fark kayıt dışı harcama olarak yazılır.
- **Gelir üst sınırı (2026-11-27 · 0.9.13):** Bir ayın geliri Bordrodaki Net Ödenen'i geçemez; tek istisna SGK Rapor Ödeneği (sınır = Net Ödenen + SGK ödeneği). Maaş ertesi ayın 5'inde yatar; A ayının sınırı A−1 bordrosundan gelir, maaş kaydı da o tarihe yazılır. Sınırı aşan elle girilen gelir kaydedilmez. Bordrosu olmayan ayda sınır yok.
- **Bakiye bildir (0.9.13):** Bildirilen tutar gelire eklenmez; yalnız beklenenle farkı kayıt dışı olarak yazılır. "Kayıt dışı gelir" mevcut kuraldır, engellenmez; gelir sınırını aşarsa Dashboard ve denetim uyarır, karar kullanıcınındır.
- **Kasaya işleme (0.9.13):** Her yeni kişisel kayıt (Aylık Bütçe, "+ Gelir / + Gider", Kübra harcaması, ödenen beklenen ödeme, Çağlar'ın telefonu) girildiği anda kasasına ve Aile Bütçesine işlenir; silinince geri alınır. Kübra harcaması gider kaydı olur. İçe aktarılan banka kayıtları ve geçmiş ay kayıtları bakiye bildiriminde sayılmaz.
- **Geçmiş aylar (0.9.13):** Net 0 olan kapanmış aya kayıt eklenir/düzeltilir/silinirse bakiye değişmez; ayın kayıt dışı harcaması farkı karşılar.
- **Denetim (0.9.13):** Bütçe denetimi salt okunurdur; kurala aykırı kayıtları listeler, veriyi kendiliğinden düzeltmez. Veriyi düzeltmek kullanıcının kararıdır.

## Banka dökümü içe aktarma

- İç transferler (kendi hesapları, Kübra Bozkurt / Kübra Söğüt, QR para yatırma, "Bakiye yükleme 6587…4973") kaydedilmez.
- FAST/EFT ücreti + BSMV → Banka ücreti; başka kişiye FAST → Havale; ATM → Nakit çekim; faturalar → Fatura.
- Geçmiş aylar net 0: ayın "Kayıt dışı harcama" = gelir − bilinen gider.
- İçinde bulunulan aya istenmedikçe ekleme yapılmaz.
- İçe Aktar klasörü: `Belgeler\Orin\İçe Aktar` → açılışta bir kez işlenir, `İşlendi`'ye taşınır.

## Altın Hesabım

- Ailem altında ayrı sekme (0.9.13). Gram türleri gramla, adetli altınlar adetle girilir; her kaydın düzenlenebilir **İşlem tarihi** (alış tarihi) var, ileri tarih kabul edilmez. Birim fiyat satış fiyatı; bozdurma değeri ayrıca. Fiyat Truncgil; Otto'nun günlük verisi Kapalıçarşı kaynaklıysa gram ve çeyrek ondan. Veri `durum.json`'da (`S.orvA.altin`); Aile Bütçesine işlenmez, telefona gitmez.
- **Alım gücü karşılaştırması (2026-11-27):** İşlem tarihi ve alış tutarı olan her kayıt için, işlem tarihinden bugüne:
  - **Nominal getiri:** bugünkü değer ÷ alış − 1.
  - **Reel getiri (TÜFE):** (bugünkü değer ÷ alış) ÷ (TÜFE son ay ÷ TÜFE işlem ayı) − 1. Kaynak: TÜİK TÜFE endeksi, BIS veri servisi üzerinden (ücretsiz, anahtarsız, güncel). Son yayımlanan ay içinde bulunulan aydan 2 aydan fazla gerideyse reel getiri gösterilmez.
  - **Dolar / euro alınsaydı:** alış tutarı işlem günü kuruyla USD/EUR'a çevrilip bugünkü kurla TL'ye döner. Kaynak: ECB referans kuru (Frankfurter; hafta sonu → önceki iş günü).
  - **Asgari ücret cinsinden:** alış ÷ o günkü net asgari ücret → bugünkü değer ÷ bugünkü net asgari ücret. Kaynak: Resmi Gazete/ÇSGB net tutarları, kod içinde sabit tablo (2023 Temmuz'dan beri doğrulanmış yıllar). Yeni yıl tutarı açıklanınca tabloya eklenir.
  - Seçilmeyenler: TCMB EVDS (API anahtarı ister), OECD (TÜFE ~1 yıl geride), İTO/ENAG (resmî değil, ücretsiz API yok).
  - **Veri yoksa ya da çekilemiyorsa** değer üretilmez; hücrede "veri yok" ve nedeni, kartta uyarı yazılır. Önbellek: TÜFE 24 saat, güncel kur 6 saat, geçmiş kur kalıcı (`alim-gucu.json`).
