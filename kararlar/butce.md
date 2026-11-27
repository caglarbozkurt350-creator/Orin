# Bütçe

- "Şirket bakiyesi" adı → **Aile Bütçesi**. Banka adları kartlarda gösterilmez.
- Aile Bütçesi = iki cep harçlığı + kalan toplamı (0.9.10). Cep harçlığı harcaması, Kübra harcaması ve eşin telefonundan gelen hareket hem kendi bakiyesine hem Aile Bütçesine işlenir.
- Çağlar'ın cep harçlığı = kendi güncel bakiyesi ("bakiye" düzeni). Kübra'nın cebi %0 iken harcamaları Aile Bütçesinden düşer.
- Bakiye bildir: beklenen = son bildirilen + gelirler − giderler. Düşükse fark → "Kayıt dışı harcama". Yüksekse kaydedilmez (aşağıda: kayıt dışı gelir olamaz). Zaten işlenmiş hareketler iki kez sayılmaz. Kayıt dışı satırını düzenlemek bakiyeyi değiştirmez.
- Bordro Net Ödenen → Aile Bütçesine "Maaş · Ay Yıl" geliri; otomatik yalnız bu ay ve geçen ay, eski aylar düğmeyle; aynı ay iki kez eklenmez. Maaş satırında yalnız açıklama ve kişi değişir.
- Aylık gelir ≤ Net Ödenen + SGK ödeneği.
- Bakiye bildirimi gelire eklenmez; fark kayıt dışı harcama olarak yazılır.
- **Kayıt dışı gelir olamaz (kullanıcı kararı, 2026-11-27):** Gelir bellidir. Bildirilen bakiye beklenenden fazlaysa hesap hatası vardır (çift ya da fazla yazılmış gider, yanlış tutar, girilmemiş gelir). Bildirim kaydedilmez, bakiye değişmez; pencere nedeni yazar. Kayıt dışı harcama olabilir. Eski kayıt dışı gelir kayıtlarını denetim "kural dışı" diye listeler.
- **Sınır dışı gelirler (2026-11-27):** Maaş avansı ve BES çıkışı gelirdir ama Bordro sınırına sayılmaz (avans sonraki bordrodan düşülür, BES birikimdir). Kalem adı "Maaş avansı" ya da "BES…" olmalı.
- **Ay devri (2026-11-27):** Kasım 2026 ve sonrası: ayın kalanı (gelir − gider) sonraki aylara birikerek devreder; bu aylar net 0'a eşitlenmez, geçmişe girilen kayıt kasaya işlenir. Ekim 2026 ve öncesi banka dökümüyle net 0 kalır. Aile Bütçesi üst sınırı = devreden (artıysa) + bu ayın geliri. Dashboard gelir kartı devredeni gösterir.
- **Gelir üst sınırı (2026-11-27 · 0.9.12):** Bir ayın geliri Bordrodaki Net Ödenen'i geçemez; tek istisna SGK Rapor Ödeneği (sınır = Net Ödenen + SGK ödeneği). Maaş ertesi ayın 5'inde yatar; A ayının sınırı A−1 bordrosundan gelir, maaş kaydı da o tarihe yazılır. Sınırı aşan elle girilen gelir kaydedilmez. Bordrosu olmayan ayda sınır yok.
- **Bakiye bildir (0.9.12):** Bildirilen tutar gelire eklenmez; yalnız beklenenden düşükse fark kayıt dışı harcama olarak yazılır.
- **Kasaya işleme (0.9.12):** Her yeni kişisel kayıt (Aylık Bütçe, "+ Gelir / + Gider", Kübra harcaması, ödenen beklenen ödeme, Çağlar'ın telefonu) girildiği anda kasasına ve Aile Bütçesine işlenir; silinince geri alınır. Kübra harcaması gider kaydı olur. İçe aktarılan banka kayıtları ve geçmiş ay kayıtları bakiye bildiriminde sayılmaz.
- **Geçmiş aylar (0.9.12):** Devir öncesi (Ekim 2026 ve önce), net 0 olan kapanmış aya kayıt eklenir/düzeltilir/silinirse bakiye değişmez; ayın kayıt dışı harcaması farkı karşılar.
- **Denetim (0.9.12):** Bütçe denetimi salt okunurdur; kurala aykırı kayıtları listeler, veriyi kendiliğinden düzeltmez. Veriyi düzeltmek kullanıcının kararıdır.
- **Telefonda Kalan (0.9.17):** Telefondaki Ortak Bütçe ve Anasayfa bütçe kartında "Kalan" = Aile Bütçesi güncel bakiyesi (`bak.aile.t`, özet `aile.ortak.aile`). Bu ayın gelir − gideri değildir; masaüstü bakiye göndermezse ona düşer.
- FuzulEv sekmesi var (Ailem altında; ayrıntılar aşağıda).
- **Gelir eklemeden gelir artmaz (kullanıcı kararı, 2026-11-27 · 0.9.13):** Kullanıcı ya da eşi gelir eklemedikçe aylık gelir ve Aile Bütçesi bakiyesi artmaz. Telefon ve eş geliri de Bordro sınırına uyar (aşan kaydedilmez). Silinen banka/telefon/eş kaydı yeniden içe aktarma ya da eşitlemeyle geri gelmez (`S.finans.silinen`). İçe Aktar bakiyesi beklenenden (+ dosyadaki yeni gelirler) yüksekse uygulanmaz. Aynı ayda ikinci maaş yazılmaz. Cep harçlığı eklemek gelir değildir: cebi yüksek bildirmek reddedilir, fark "cep harçlığı" olarak eklenir (Aile Bütçesi ve gelir değişmez). Aylık tablodaki yuvarlanmış gelir kuruş farkı yazmaz. Kod: `orv-butce-koruma.js`.

## Banka dökümü içe aktarma

- İç transferler (kendi hesapları, Kübra Bozkurt / Kübra Söğüt, QR para yatırma, "Bakiye yükleme 6587…4973") kaydedilmez.
- FAST/EFT ücreti + BSMV → Banka ücreti; başka kişiye FAST → Havale; ATM → Nakit çekim; faturalar → Fatura.
- Geçmiş aylar net 0: ayın "Kayıt dışı harcama" = gelir − bilinen gider.
- İçinde bulunulan aya istenmedikçe ekleme yapılmaz.
- İçe Aktar klasörü: `Belgeler\Orin\İçe Aktar` → açılışta bir kez işlenir, `İşlendi`'ye taşınır.

## Altın Hesabım

- Ailem altında ayrı sekme (0.9.12). Gram türleri gramla, adetli altınlar adetle girilir; her kaydın düzenlenebilir **İşlem tarihi** (alış tarihi) var, ileri tarih kabul edilmez. Birim fiyat satış fiyatı; bozdurma değeri ayrıca. Fiyat Truncgil; Otto'nun günlük verisi Kapalıçarşı kaynaklıysa gram ve çeyrek ondan. Veri `durum.json`'da (`S.orvA.altin`); Aile Bütçesine işlenmez. Telefona salt okunur özet gider, yalnız Çağlar'ın telefonuna (0.9.14).
- **Gram ve ayar (0.9.15):** Adetli üründe isteğe bağlı `gram` = adet başı ağırlık × adet; form standart ağırlıkla ön dolu (çeyrek 1,75 · yarım 3,5 · tam 7 · Cumhuriyet/Ata/Reşat 7,216 · Gremse 17,54 · ikibuçuk 18,04 · beşli 36,08 gr; sikkeler 22 ayar). Gramı olmayan eski kayıt standart ağırlıkla "≈" gösterilir, veriye yazılmaz; standarda eşit girilen gram da yazılmaz. Bilezik ve Takı: gram + `ayar` (24/22/18/14), değer o ayarın gram fiyatıyla, işçilik girmez. Has karşılığı = gram × milyem (24: 0,995 · 22: 0,916 · 18: 0,750 · 14: 0,585). Kart ve listede toplam gram ve has karşılığı; telefona da gider.
- **Alım gücü karşılaştırması (2026-11-27):** İşlem tarihi ve alış tutarı olan her kayıt için, işlem tarihinden bugüne:
  - **Nominal getiri:** bugünkü değer ÷ alış − 1.
  - **Reel getiri (TÜFE):** (bugünkü değer ÷ alış) ÷ (TÜFE son ay ÷ TÜFE işlem ayı) − 1. Kaynak: TÜİK TÜFE endeksi, BIS veri servisi üzerinden (ücretsiz, anahtarsız, güncel). Son yayımlanan ay içinde bulunulan aydan 2 aydan fazla gerideyse reel getiri gösterilmez.
  - **Dolar / euro alınsaydı:** alış tutarı işlem günü kuruyla USD/EUR'a çevrilip bugünkü kurla TL'ye döner. Kaynak: ECB referans kuru (Frankfurter; hafta sonu → önceki iş günü).
  - **Asgari ücret cinsinden:** alış ÷ o günkü net asgari ücret → bugünkü değer ÷ bugünkü net asgari ücret. Kaynak: Resmi Gazete/ÇSGB net tutarları, kod içinde sabit tablo (2023 Temmuz'dan beri doğrulanmış yıllar). Yeni yıl tutarı açıklanınca tabloya eklenir.
  - Seçilmeyenler: TCMB EVDS (API anahtarı ister), OECD (TÜFE ~1 yıl geride), İTO/ENAG (resmî değil, ücretsiz API yok).
  - **Veri yoksa ya da çekilemiyorsa** değer üretilmez; hücrede "veri yok" ve nedeni, kartta uyarı yazılır. Önbellek: TÜFE 24 saat, güncel kur 6 saat, geçmiş kur kalıcı (`alim-gucu.json`).

## FuzulEv (0.9.13)

- Ailem › FuzulEv: birikim/finansman sözleşmesi ve taksitleri `durum.json`'da (`S.orvA.fuzulev`) tutulur. Telefona salt okunur özet gider, yalnız Çağlar'ın telefonuna (0.9.14; sözleşme no ve plan kodu gitmez).
- Bilinmeyen taksit tutarı uydurulmaz: boş kalır, "Tutar girilmedi" gösterilir; kullanıcı düzenler.
- "Ödendi" işaretlenirken istenirse Aile Bütçesine "FuzulEv taksiti" gideri yazılır (kasa: Aile Bütçesi ya da Çağlar cep) ve hemen kasaya işlenir.
- Çift sayma yok: kayıt kimliği taksite bağlı (`fe` + taksit id); bankadan içe aktarılmış aynı ödeme (aynı tutar, ±7 gün, "fuzul" geçen) varsa yeni gider yazılmaz, ona bağlanır.
- Ay devri öncesi (Ekim 2026 ve önce) kapanmış aya ait ödemede bütçeye yazma varsayılan kapalı; yazılırsa bakiye değişmez, ayın kayıt dışı harcaması dengeler. Kasım 2026 ve sonrası açık aylar: varsayılan açık, kasaya işlenir.
- "Geri al" yalnız FuzulEv'in yazdığı gideri ve bakiye etkisini geri alır; banka kaydı kalır. Taksit silinince bütçedeki gider kalır.
- Teslimata kalan = teslimat taksitine kadar (o dahil) ödenmemiş taksit sayısı ve teslimat vadesine kalan gün.
- Ödenmiş taksitler Aile Bütçesine gider olarak yazılır (kullanıcı kararı, 2026-11-27). İçe Aktar JSON'unda taksite `"butce":true` verilirse içe aktarılırken yazılır; aynı kurallar geçerli (bir kez, banka kaydına bağlanma, kapanmış ayda bakiye değişmez).
- Gerçek sözleşme bilgileri koda/testlere girmez; İçe Aktar JSON'undaki "fuzulev" anahtarıyla ya da sayfadan elle girilir.
