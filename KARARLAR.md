# Orvane · Alınan Kararlar

Her oturumun başında okunur. Yeni karar alındıkça ilgili bölüme eklenir (tarih ve sürümle).
Son güncelleme: 2026-11-27 · Sürüm 0.9.12

---

## 1. Çalışma düzeni (Claude ile)

- **Dil:** Kullanıcıyla her zaman Türkçe konuşulur; kod adları ve dosya adları olduğu gibi kalır.
- **Ana sekme / alt sekmeler (2026-11-27):**
  - Orvane'nin konuşulduğu oturum **Ana sekme**dir. Ana sekme kod yazmaz, dosya düzenlemez.
  - Ana sekme yalnız: istenen iş için **en kısa öneri** + gerekli **sorular**. Bağlam en küçük tutulur.
  - Her iş ayrı bir **alt sekmede** (yeni oturum, kendi dalı/worktree'si) yapılır.
  - Raporlar ayrı bir **"Orvane · Raporlar"** alt sekmesinde toplanır; ana sekmeye yalnız tek satırlık sonuç gelir.
  - Ana sekme alt sekmeleri **denetler**. İşi biten alt sekme, raporu Raporlar sekmesine alınıp dalı birleştikten sonra **sıkıştırılır veya silinir** (kullanıcının kalıcı izni, 2026-11-27). Rapor alınmadan silinmez; Raporlar sekmesi silinmez.
- **Kararlar dosyası:** Bu dosya (`KARARLAR.md`). Yeni karar → buraya eklenir.
- **Dal adları:** `ozellik/…`, `duzeltme/…`, `surum/x.y.z`, `claude/…`; birleştirme `main`'e PR ile.
- **Sürüm notu:** Her sürümde `surum-notlari/<sürüm>.md`; kısa, Türkçe, "Masaüstü / Telefon" başlıkları, telefonda değişiklik yoksa "Değişiklik yok".
- **Bilgi notları kısa:** yalnız kimin ne yaptığı.

## 2. Yayın ve sürüm

- Masaüstü yayını: GitHub › Actions › "Orvane sürümünü yayınla" (tek tuş, telefondan da olur). Önce testler (`npm run smoke`); biri düşerse yayın yok.
- GitHub'da kalan sürümler: **en yeni 2 + en yeni onaylı sürüm**; gerisi silinir.
- Onaylı sürüm listesi: `onayli-surumler.json` (şu an 0.7.23). Yeni sürüm onaylanınca başa eklenir. Ayarlar › Sorun giderme › "Önceki onaylı sürüme dön".
- Güncelleme öncesi yedek alınır. Kurulum dosyaları arşivlenir: `Belgeler\Orin\Kurulum Dosyaları PC\Sürüm X` ve `APK\Sürüm X`.
- Telefon: Expo/EAS; yerel modül eklenmedikçe **uygulama içi güncelleme** (yeni APK gerekmez). Yeni modül gerekiyorsa APK + `mobil/apk.json`.
- Testler kişisel veri olmadan da geçer; testlerde örnek bakiyeler uydurma değerlerdir.

## 3. Veri ve güvenlik

- Ana veri: bilgisayardaki `durum.json` (veri klasörü; `konum.json` yedeği LocalAppData'da). Kayıtlar diske zorla yazılır (fsync).
- `durum.json`'a dışarıdan yazmadan önce **Orvane kapalı mı bakılır** ve **Yedekler'e yedek alınır**.
- Bordro verisi yalnız bu bilgisayarda; buluta ve telefona gitmez.
- Gizli klasörler: `Belgelerim\Finans` yalnız Finans Uzmanı, `Belgelerim\Sağlık` yalnız Sağlıklı Yaşam Koçu.
- Şirket hesabındaki kayıtlar telefona gönderilmez.
- PocketBase oturumu (0.7.25): Windows şifrelemesiyle saklanır, şifre yazılmaz, çevrimdışı açılış. Görevler ve zamanlanmış işler PocketBase'e yazılır.
- Telefon eşitlemesi Supabase ile; 60 sn'de bir, yalnız uygulama öndeyken; özet yalnız değişince indirilir.

## 4. Yapay zekâ çalışanları

- **0.8.1'den beri varsayılan KAPALI (manuel mod).** Veri girişi manuel. Ayarlar › Yapay zekâ anahtarıyla açılır; kod silinmedi.
- Kapalıyken: çalışan adları/avatarları yerine işlev simgeleri, Ekip sade tablo, yapay zekâ kanalları ana süreçte de reddedilir.
- Açıkken: öncelik Claude aboneliği (Claude Code), API yalnız yedek. Kai ve Ada yalnız abonelikle çalışır.
- API aylık sınırı varsayılan 15 $.
- Onay zinciri: Nika (İK) → Orin (öneri) → Çağlar (CEO). Onaya sunulan her konuda "onaylanırsa / onaylanmazsa" kutuları.
- Toplantılar kaldırıldı (0.8.2); kendiliğinden başlamaz.
- Telegram tamamen kaldırıldı (0.9.2).
- Altın/gümüşte Kapalıçarşı fiyatı tercih edilir; gram altın Truncgil (ücretsiz, yapay zekâ kapalıyken de). Kur: TCMB, ulaşılamazsa ECB (Frankfurter).

## 5. Arayüz (masaüstü)

- 0.8.0 tasarımı: cam paneller, Inter, 6 tema rengi (Turuncu, Nane, Okyanus, Lavanta, Gül, Altın); tema yalnız vurgu rengini değiştirir.
- **Hiçbir eski özellik silinmez**; yeni menüde yer bulur ya da "Diğer sayfalar"a gider.
- Sol menü sırası: Anasayfa · Ailem · İş Günleri (altında Görseller, İzinler en sonda) · Bordro · Merkez · Ekip (altında Görevler, Onaylar; onay rozeti Ekip simgesinde) · Zamanlanmış işler.
- Ailem sekmelerinde çalışan adı yok: Bütçe, Aylık Bütçe, Altın Hesabım, Sağlık, İlaç Planı, Menü & Market, Satın Alma, Ev İşleri.
- Animasyonlar "Hareketi azalt" ayarına uyar.
- Değişim gösterimi: ▲ / ▼; yeşil lehine, kırmızı aleyhine (kesintide artış kırmızı).

## 6. Bütçe kuralları

- "Şirket bakiyesi" adı → **Aile Bütçesi**. Banka adları kartlarda gösterilmez.
- **Aile Bütçesi = iki cep harçlığı + kalan toplamı** (0.9.10). Cep harçlığı harcaması, Kübra harcaması ve eşin telefonundan gelen hareket hem kendi bakiyesine hem Aile Bütçesine işlenir.
- Çağlar'ın cep harçlığı = kendi güncel bakiyesi ("bakiye" düzeni). Kübra'nın cebi %0 iken harcamaları Aile Bütçesinden düşer.
- **Bakiye bildir:** beklenen = son bildirilen + gelirler − giderler. Fark → "Kayıt dışı harcama" / "Kayıt dışı gelir". Zaten işlenmiş hareketler iki kez sayılmaz. Kayıt dışı satırını düzenlemek bakiyeyi değiştirmez.
- Bordro Net Ödenen → Aile Bütçesine "Maaş · Ay Yıl" geliri; otomatik yalnız bu ay ve geçen ay, eski aylar düğmeyle; aynı ay iki kez eklenmez. Maaş satırında yalnız açıklama ve kişi değişir.
- **Banka dökümü içe aktarma:** iç transferler (kendi hesapları, Kübra Bozkurt / Kübra Söğüt, QR para yatırma, "Bakiye yükleme 6587…4973") kaydedilmez. FAST/EFT ücreti + BSMV → Banka ücreti; başka kişiye FAST → Havale; ATM → Nakit çekim; faturalar → Fatura. **Geçmiş aylar net 0**; ayın "Kayıt dışı harcama" = gelir − bilinen gider. **İçinde bulunulan aya istenmedikçe ekleme yapılmaz.**
- İçe Aktar klasörü: `Belgeler\Orin\İçe Aktar` → açılışta bir kez işlenir, `İşlendi`'ye taşınır.
- **Gelir üst sınırı (2026-11-27 · 0.9.12):** Bir ayın geliri, Bordrodaki Net Ödenen'i geçemez. Tek istisna SGK Rapor Ödeneği: üst sınır = Net Ödenen + SGK ödeneği. Maaş ertesi ayın 5'inde yatar. Bu yüzden A ayının sınırı A−1 bordrosundan gelir. Maaş kaydı da o tarihe yazılır. Elle girilen gelir sınırı aşıyorsa kaydedilmez. Bordrosu olmayan ayda sınır yoktur.
- **Bakiye bildir (0.9.12 netleşti):** Bildirilen tutar gelire eklenmez. Yalnız beklenenle farkı kayıt dışı olarak yazılır. "Kayıt dışı gelir" mevcut kuraldır ve engellenmez. Gelir sınırını aşarsa Dashboard ve denetim uyarır; karar kullanıcınındır.
- **Kasaya işleme (0.9.12):** Her yeni kişisel kayıt girildiği anda kasasına ve Aile Bütçesine işlenir. Kapsam: Aylık Bütçe, "+ Gelir / + Gider", Kübra harcaması, ödenen beklenen ödeme ve Çağlar'ın telefonu. Silinince etkisi geri alınır. Kübra harcaması da gider kaydı olur. İçe aktarılan banka kayıtları ve geçmiş ay kayıtları bakiye bildiriminde sayılmaz.
- **Geçmiş aylar (0.9.12):** Net 0 olan kapanmış aya kayıt eklenir, düzeltilir ya da silinirse bakiye değişmez. Ayın kayıt dışı harcaması farkı karşılar, ay net 0 kalır.
- **Denetim (0.9.12):** Bütçe denetimi salt okunurdur. Kurala aykırı kayıtları listeler ama veriyi kendiliğinden düzeltmez. Veriyi düzeltmek kullanıcının kararıdır.
- **Altın Hesabım (0.9.12):** Ailem altında ayrı sekme. Gram türleri gramla, adetli altınlar adetle girilir. Birim fiyat satış fiyatıdır; bozdurma değeri ayrıca gösterilir. Fiyat Truncgil'den gelir. Otto'nun günlük verisi Kapalıçarşı kaynaklıysa gram ve çeyrek fiyatı ondan alınır. Veri `durum.json`'da (`S.orvA.altin`) tutulur; Aile Bütçesine işlenmez, telefona gönderilmez.

## 7. Sağlık

- İlaç: yalnız Alındı / Alınmadı (gecikme işareti yok). "Alındı" yerel 00:00'a kadar kalır. Plan tanı koymaz, doz önermez.
- Telefonda ilaçlar saate göre numaralı, kayar düğmeli. Açlık şekeri yazıldığı saatle saklanır.

## 8. Aile profili (eşin telefonu)

- Eşe yalnız aile verisi gider: ortak bütçe, cep harçlıkları, kendi ilaçları, şeker, izin günleri, aile takvimi, özel günler. İş kayıtları, ekip, sohbet gitmez.
- **Çağlar'ın ilaçları eşe gönderilmez** (0.9.9). Günlük ilaç listesi herkeste yalnız kendi ilaçları.
- Herkes yalnız kendi eklediğini düzeltir/siler; eş Çağlar'ın kayıtlarını değiştiremez (bulut kuralı + masaüstü denetimi).
- Bana Özel: "Ben" / "Eşim" sekmeleri. Eş profilinde oyun kartları ve "Bu Hafta" yok, görevler yok, Ekip şeridi yok.

## 9. Telefon düzeni

- 5 sekme: Anasayfa · Ailem · İş Hayatı (ortadaki +) · Bana Özel · Bildirim. Ayarlar üstteki profil düğmesinde.
- Yazı kutusu klavyenin üstünde kalır.
- PDF'ler A4: aylık iş günü, ilaç (şeker çizelgesi + ölçüm listesi), bütçe (kayıt dışı ayrı satır).
- Bildirim: sessiz saat 22:00–08:00.

## 10. İş Günleri / İzinler

- İzin kuralları: hafta sonu, resmî tatil, dolu gün atlanır; refakat hakkı sınırı; raporun 4.+ günleri ayrı işaretlenir.
- Telefondan girilen iş kaydı/izin masaüstüne aynı kurallarla işlenir.
