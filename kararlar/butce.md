# Bütçe

- "Şirket bakiyesi" adı → **Aile Bütçesi**. Banka adları kartlarda gösterilmez.
- Aile Bütçesi = iki cep harçlığı + kalan toplamı (0.9.10). Cep harçlığı harcaması, Kübra harcaması ve eşin telefonundan gelen hareket hem kendi bakiyesine hem Aile Bütçesine işlenir.
- Çağlar'ın cep harçlığı = kendi güncel bakiyesi ("bakiye" düzeni). Kübra'nın cebi %0 iken harcamaları Aile Bütçesinden düşer.
- Bakiye bildir: beklenen = son bildirilen + gelirler − giderler. Fark → "Kayıt dışı harcama" / "Kayıt dışı gelir". Zaten işlenmiş hareketler iki kez sayılmaz. Kayıt dışı satırını düzenlemek bakiyeyi değiştirmez.
- Bordro Net Ödenen → Aile Bütçesine "Maaş · Ay Yıl" geliri; otomatik yalnız bu ay ve geçen ay, eski aylar düğmeyle; aynı ay iki kez eklenmez. Maaş satırında yalnız açıklama ve kişi değişir.
- Aylık gelir ≤ Net Ödenen + SGK ödeneği.
- Bakiye bildirimi gelire eklenmez; fark kayıt dışı harcama olarak yazılır.
- Altın Hesabım sekmesi var (altın hesabı ayrı sekmede izlenir).
- FuzulEv sekmesi var (Ailem altında; ayrıntılar aşağıda).

## Banka dökümü içe aktarma

- İç transferler (kendi hesapları, Kübra Bozkurt / Kübra Söğüt, QR para yatırma, "Bakiye yükleme 6587…4973") kaydedilmez.
- FAST/EFT ücreti + BSMV → Banka ücreti; başka kişiye FAST → Havale; ATM → Nakit çekim; faturalar → Fatura.
- Geçmiş aylar net 0: ayın "Kayıt dışı harcama" = gelir − bilinen gider.
- İçinde bulunulan aya istenmedikçe ekleme yapılmaz.
- İçe Aktar klasörü: `Belgeler\Orin\İçe Aktar` → açılışta bir kez işlenir, `İşlendi`'ye taşınır.

## FuzulEv (0.9.13)

- Ailem › FuzulEv: birikim/finansman sözleşmesi ve taksitleri `durum.json`'da (`S.orvA.fuzulev`) tutulur; telefona gönderilmez (şimdilik).
- Bilinmeyen taksit tutarı uydurulmaz: boş kalır, "Tutar girilmedi" gösterilir; kullanıcı düzenler.
- "Ödendi" işaretlenirken istenirse Aile Bütçesine "FuzulEv taksiti" gideri yazılır (kasa: Aile Bütçesi ya da Çağlar cep) ve hemen kasaya işlenir.
- Çift sayma yok: kayıt kimliği taksite bağlı (`fe` + taksit id); bankadan içe aktarılmış aynı ödeme (aynı tutar, ±7 gün, "fuzul" geçen) varsa yeni gider yazılmaz, ona bağlanır.
- Geçmiş aya ait ödemede bütçeye yazma varsayılan kapalı (kapanmış ay net 0 kuralı).
- "Geri al" yalnız FuzulEv'in yazdığı gideri ve bakiye etkisini geri alır; banka kaydı kalır. Taksit silinince bütçedeki gider kalır.
- Teslimata kalan = teslimat taksitine kadar (o dahil) ödenmemiş taksit sayısı ve teslimat vadesine kalan gün.
- Gerçek sözleşme bilgileri koda/testlere girmez; İçe Aktar JSON'undaki "fuzulev" anahtarıyla ya da sayfadan elle girilir.
