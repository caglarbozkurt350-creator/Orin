# Görev · Orvane geliştirme fikirleri ve Claude Design tasarımları

Orvane, Çağlar’ın masaüstü (Electron) ve telefon (Expo) uygulaması: iş raporu ve iş günleri, Ailem (bütçe, sağlık/ilaç, market, ev işleri, menü), bordro, piyasa (altın, döviz). Şu anki sürüm: **0.9.11** · Tarih: 27 Kasım 2026

## Ne yapacaksın
1. Aşağıdaki son sürüm notlarını ve git geçmişini oku; gerekirse kaynak kodu da oku (yalnız okuma: renderer/, mobil/src/, main.js). Programın bugün NE yaptığını ve son düzenlemelerin hangi yöne gittiğini anla.
2. Bunlara dayanarak **5 geliştirme fikri** çıkar. Her fikir son düzenlemelerden birinin üzerine kurulsun (hangisi olduğunu yaz), günlük kullanımda gerçek bir sorunu çözsün ve bugünkü veriyle yapılabilsin.
   - Aşağıda “Önerilmiş”, “Onaylanmış” ve “İptal edilmiş” listelerindekileri TEKRAR ÖNERME (iptal edilenlerin benzerini de); onaylanmışların üzerine kurabilirsin.
   - Yapay zekâ çalışanları/ekip özelliği büyütülmeyecek; fikirler doğrudan kullanıcıya hizmet etsin.
3. Fikirlerin tasarımlarını **Claude Design** ile yap: Artifact aracında `action: "quickstart"`, `intent: "design"` ile başla, Design tipinden YENİ bir tuval aç (başlık: “Orvane geliştirme fikirleri · 27 Kasım 2026”) ve tipin talimatlarına uyarak her fikir için bir artboard çiz. Dosyaları yalnız bu çalışma klasörüne yaz.
   - Masaüstü ekranları 1440 genişlikte sayfa (expand fill), telefon ekranları 390×844. En az bir telefon ekranı olsun.
   - Tasarımı bitirdikten sonra kontrol, ekran görüntüsü ya da tarayıcı açma YOK.

## Tasarım kuralları
- **Tasarımlarda ekip YOK:** çalışan adları (Orin, Orla, Nika, Echo, Otto, Iris, Marco, Luca, Vera, Ada, Remy, Sage, Mia, Kai, Cleo, Nerya), çalışan avatarları, “Ekip” menüsü ve onay kartları görünmez. Kartlar konuyla adlanır: “Sabah brifingi”, “Yaklaşanlar”, “Kalan ödemeler”.
- Orvane’nin görünümü: koyu zemin #19191b, metin #f2f2f3 / #a9a9b0, cam kart rgba(255,255,255,.06) + kenar rgba(255,255,255,.10), kart yarıçapı 22px, düğme 22px (hap), vurgu turuncu #ff5b37 / #ffb020 (öteki temalar: Turuncu #ff5b37, Nane #2fbf8a, Okyanus #3b82f6, Lavanta #8b5cf6, Gül #e1488f, Altın #d4921c), durum yeşil #3ecf5a, uyarı #f5a524. Yazı: Inter (gövde), Space Grotesk (başlık ve rakam).
- Türkçe metin; gerçek kişisel veri yok: tutarlar ve saatler örnek, ekranda “Tutarlar örnektir.” notu.
- Dokunma hedefleri ≥44px, metin kontrastı ≥4.5:1, simgeler ince çizgili SVG (emoji yok).

## Yasaklar
- Orvane kaynak dosyalarını DEĞİŞTİRME (yalnız oku). git commit/push, yayın, EAS/OTA yok.
- Gerçek veri (Belgeler\Orin\Veriler, Belgelerim, %APPDATA%\Orin) ve renderer/js/kisisel.js okunmaz.

## Bitince cevabın (Türkçe, bu biçimde)
İlk satır: `TASARIM: <Claude Design tuvalinin linki>` (tuval açılamadıysa `TASARIM: yok — <neden>`).
Sonra her fikir için: `1. <başlık> — <bir cümle ne getirir> · Dayandığı düzenleme: <sürüm/özellik> · Zorluk: kolay|orta|zor`.
En sonda şu JSON bloğu (Orvane okuyup fikir listesine ekler):
```json
{"fikirler":[{"id":"kisa-kimlik","baslik":"…","aciklama":"…","onaylanirsa":"…","onaylanmazsa":"…"}]}
```

## Bağlam

### Önerilmiş (tekrar önerme)
- Echo izin ve rapor gününü işlesin
- Telefonda Nika'nın grafikleri
- Gün sonu eksik süre hatırlatması
- Cuma haftalık özet bildirimi
- Google ile giriş
- v1.0 güvenlik çalışmasına başlama

### Onaylanmış, sırada (tekrar önerme)
- Günlük harcama hızı — Ayın başından bugüne günlük ortalama harcama ve geçen ayın aynı günlerine göre değişim (Ailem › Bütçe ve Anasayfa).
- Ay sonu tahmini — Kasa bakiyesi, kalan ödemeler ve harcama hızından ayın son günü tahmini; olası aralıkla birlikte.
- Kalan ödemeler — Ay sonuna kadar ödenecek kalemler, tarih ve tutarlarıyla liste; bugün son günü olan vurgulu.
- Kalan sabit ödemeler — Ay sonuna kadar kalan sabit ödemelerin toplamı ve sayısı.
- Sabah brifingi — Anasayfa'nın üstünde tek paragraflık günlük özet (eksik süre, ilaç, son günü gelen ödeme, ay sonu durumu) ve tek dokunuşla işlem düğmeleri; çalışan adı geçmez.
- Yaklaşanlar — Önümüzdeki günlerin fatura son günleri, özel günler ve maaş/bordro hatırlatmaları tek kartta.

### İptal edilmiş (Çağlar istemedi; benzerini de önerme)
- Ctrl+K komut kutusu — Tek kutuya yazılan cümleyi işlere bölen komut paleti (27 Kasım 2026'da iptal).
- Gün sonu kapanışı — Zaman çizelgesindeki boşluğu önerilerle doldurup günü kapatma ekranı (27 Kasım 2026'da iptal).
- Telefonda Cuma özeti ve hızlı ekle — Cuma haftalık özet ekranı ve sesli/yazılı hızlı ekleme çubuğu (27 Kasım 2026'da iptal).

### Son sürüm notları (yeniden eskiye)
## Orvane 0.9.10 · Aile Bütçesi toplam kasa

**Ailem › Bütçe**
- Aile Bütçesi artık iki cep harçlığının ve kalanın toplamıdır.
- Cep harçlığı harcaması, Kübra harcaması ve eşin telefonundan gelen harcama/gelir hem kendi bakiyesine hem Aile Bütçesine işlenir.
- Cep bakiyesi bildirildiğinde çıkan kayıt dışı fark Aile Bütçesine de yansır.

**Telefon**
- Değişiklik yok.

## Orvane 0.9.9 · Eş profili

**Aile paylaşımı**
- Çağlar'ın ilaçları ve "alındı" işaretleri artık eşin telefonuna gönderilmez; eş yalnız kendi ilaçlarını görür.

**Telefon**
- Bana Özel iki sekmeye ayrıldı: "Ben" sekmesinde yalnız kendi veriler, "Eşim" sekmesinde eşin verisi gösterge olarak (eşte Çağlar'ın şekeri, Çağlar'da Kübra'nın ilaçları).
- Günlük ilaç listesi (Anasayfa, Ailem › Sağlık) herkeste yalnız kendi ilaçlarını gösterir.
- Özel günler: doğum gününde "Benim / Eşimin / Başkası" seçilir; bakana göre "Doğum günüm" ya da "Eşimin doğum günü" yazar.
- Eş profilinde oyun kartları ve Anasayfa'daki "Bu Hafta" kartı kaldırıldı.

## Orvane 0.9.8 · Kayıt dışı harcama

**Ailem › Bütçe**
- "Bakiye bildir" artık beklenen bakiyeyi hesaplar: son bildirilen bakiye + o tarihten beri girilen gelirler − girilen giderler.
- Bildirilen bakiye beklenenden düşükse fark "Kayıt dışı harcama" gideri, yüksekse "Kayıt dışı gelir" geliri olarak kendiliğinden yazılır. Aile Bütçesi, Çağlar ve Kübra kasalarında çalışır.
- Bakiyeye zaten işlenmiş hareketler (maaş, cep harçlığı ve Kübra harcamaları) iki kez sayılmaz.

**Anasayfa › Otto'nun özeti**
- Ayın kayıt dışı harcaması varsa ayrı bir satırda gösterilir.

**Telefon**
- Aylık Bütçe Raporu (PDF) kategori toplamının altında ayın kayıt dışı harcamasını ayrı satırda gösterir (geçen ayla kıyaslı).
- İlaç "alındı" işaretleri yerel saatle 00:00'a kadar kalır.

## Orvane 0.9.7 · Aile Bütçesi ortak kasa, İçe Aktar klasörü

**Ailem › Bütçe**
- Aile Bütçesi artık ayrı bir ortak kasa olabilir (kendi bakiyesi ve "Bakiye bildir" düğmesi). Kasa yoksa eskisi gibi Çağlar + Kübra toplamı gösterilir.
- Bordrodaki Net Ödenen ortak kasa varsa ona eklenir.
- Kübra'nın cep harçlığı %0 iken bütün harcamaları (masaüstünden ya da telefonundan) Aile Bütçesinden düşer.

**Anasayfa › Cep harçlığı**
- Yeni "bakiye" düzeni: Çağlar'ın cep harçlığı kendi güncel bakiyesidir; yüzde düğmeleri gizlenir. Kübra'nın kartı Aile Bütçesinin kalanını gösterir.

**İçe Aktar klasörü**
- Belgeler\Orin\İçe Aktar içine konan .json dosyası açılışta bir kez işlenir: bakiyeler, cep harçlığı ayarı ve banka/harcama kayıtları. İşlenen dosya İşlendi klasörüne taşınır; aynı kayıt iki kez eklenmez.

**Telefon**
- Değişiklik yok.

## Orvane 0.9.6 · Bordro: klasör hatırlama, SGK rapor ödeneği, maaş Aile Bütçesine

**Bordro**
- İçe aktarma penceresi son kullanılan klasörde açılır; ilk seferde Belgeler\Orin\Belgelerim\Finans\Maaş Bordroları.
- Yeni "SGK Rapor Ödeneği" kartı: raporlu gün ve SGK'nın ödediği tutar elle girilir; "Net + SGK Ödeneği" toplamı ve önceki aya göre değişimi görünür.
- Net Ödenen Aile Bütçesine otomatik eklenir: Bütçe'de "Maaş · Ay Yıl" gelir kaydı açılır ve Çağlar güncel bakiyesi artar. Otomatik ekleme yalnız bu ay ve geçen ayın bordrosu için çalışır; eski aylar "Aile Bütçesine ekle" düğmesiyle eklenir. Net sonradan düzeltilirse fark işlenir, aynı ay iki kez eklenmez.

**Telefon**
- Değişiklik yok.

## Orvane 0.9.5 · Üst bar ipuçları, telefonda klavye

**Masaüstü**
- Üst bardaki Geri, İleri ve Kenar çubuğu düğmelerinin açıklamaları artık sol menünün ve sayfaların önünde görünür.

**Telefon (uygulama içi güncelleme, yeni APK gerekmez)**
- Yazarken yazı kutusu klavyenin üstünde kalır: ana sayfadaki kutular ve alttan açılan formlar, kutu klavyenin hemen üstüne kayar.

## Orvane 0.9.4 · Telefonda Ailem kategorileri çalışıyor

**Telefon (uygulama içi güncelleme, yeni APK gerekmez)**
- Ailem sekmesindeki altı kutucuk artık gerçek içerik açar:
  - Bütçe: bu ayın özeti, son işlemler, gelir/gider ekleme
  - Sağlık: bugünkü ilaçlar ve sabah şekeri
  - Menü & Market: haftalık menü, market listesi (ekle, işaretle, alınanları temizle)
  - Satın Alma: öneri ekle; onayla / ertele / reddet
  - Ev İşleri: iş ekle, kişi seç, bitti işaretle
  - Aile Takvimi: etkinlik ve randevular
- Telefonda yapılan değişiklikler bilgisayardaki Orvane'ye aktarılır.

**Masaüstü**
- Menü, market, satın alma önerileri ve ev işleri telefona gönderilir; telefondan gelen değişiklikler uygulanır.
- Bu sürüm kurulmadan telefondaki yeni kategoriler boş görünür.

## Orvane 0.9.3 · Anasayfa düzeni, gram altın, Hafta/Ay/Yıl kur değişimi, yeni menü

**Anasayfa**
- Ay özeti kartı Beklenen Gider'in altına, cep harçlıklarının yanına taşındı; üst bölüm her ekranda 3 sütun.
- Gram altın artık yapay zekâ kapalıyken de gelir (Truncgil, ücretsiz).
- Altın, Dolar ve Euro kartlarında Hafta / Ay / Yıl düğmeleri: her biri o aralıktaki değişimi gösterir, seçilen aralığın grafiği çizilir. Dolar ve Euro için 1 yıllık geçmiş ilk açılışta indirilir (ECB · Frankfurter); altın geçmişi her gün birikir.
- Euro grafiği sadeleşti: çubuk + çizgi üst üste binmiyor, tek alan grafiği.

**Ailem › Bütçe**
- Bakiye kartlarındaki banka adları (Yapı Kredi, Ziraat) kaldırıldı.
- "Şirket bakiyesi" → "Aile Bütçesi".
- Cep harçlığından yapılan harcama harcayanın güncel bakiyesinden düşer.

**İlaç**
- Gecikme işareti kaldırıldı; yalnız Alındı / Alınmadı.
- İlaç işareti telefona hemen gönderilir; telefondan gelen işaret İlaç Planı, Sağlık ve Anasayfa açıkken de ekrana hemen yansır.

**Menü**
- Görseller ve İzinler İş Günleri'nin altında (İzinler en sonda); Görevler ve Onaylar Ekip'in altında. Onay rozeti Ekip simgesinde.

**Görseller**
- Klasördeki tüm görseller (bir alt klasör düzeyi dahil) "Klasördeki görseller" bölümünde görünür; adı proje koduyla başlayanlar projelerinin altında da durur. Arama dosya adında da çalışır.
- Klasör ayarlanmadıysa varsayılan: Belgeler\Orin\Görseller\Biten Projeler.

**Telefon**
- Değişiklik yok.

### Git geçmişi (son 40)
```
6bb19b3 2026-11-26 Geliştirme fikri iste: Claude Code ile fikir ve Claude Design tasarımları
4824a0b 2026-11-26 Sürüm 0.9.10: Aile Bütçesi toplam kasa
e7dbf26 2026-11-26 Aile Bütçesi toplam kasa: cep ve Kübra harcamaları Aile Bütçesinden de düşer
d441e04 2026-11-26 Sürüm 0.9.9: eş profili; package.json geri yüklendi
ad88281 2026-11-26 Telefon: günlük ilaç listesi herkeste yalnız kendi ilaçları
7e7c50d 2026-11-26 Eş profili: Bana Özel Ben/Eşim sekmeleri, özel günler bakana göre, Bu Hafta kaldırıldı
ad7b290 2026-11-26 Aile paylaşımı: Çağlar'ın ilaçları eşin telefonuna gönderilmez
d48bfed 2026-11-26 Telefon 0.9.8: sürüm numarası, rapor tip düzeltmesi
3860777 2026-11-26 Sürüm 0.9.8: kayıt dışı harcama
3c7c533 2026-11-26 Bakiye bildirimi: fark Kayıt dışı harcama / gelir, ay raporunda ayrı satır
1f483ac 2026-11-26 Telefon: ilaç "alındı" işaretleri yerel 00:00'a kadar kalır
2868ba9 2026-11-25 Sürüm 0.9.7: Aile Bütçesi ortak kasa, İçe Aktar klasörü
93ea35e 2026-11-25 Testlerde örnek bakiyeler uydurma değerlerle
b9d82a5 2026-11-25 Aile Bütçesi ortak kasa, cep harçlığı bakiye modu, Kübra harcamaları Aile Bütçesinden, İçe Aktar klasörü
99f5fe7 2026-11-25 Sürüm 0.9.6: bordro klasör hatırlama, SGK rapor ödeneği, maaş Aile Bütçesine
b84ced4 2026-11-25 Bordro: içe aktarma klasörü hatırlanır, SGK rapor ödeneği, Net Ödenen Aile Bütçesine eklenir
66626e7 2026-11-25 Sürüm 0.9.5: üst bar ipuçları, telefonda klavye
fb15903 2026-11-25 Üst bar ipuçları sol menü ve sayfaların önünde görünür
39b27d5 2026-11-25 Telefon: yazı kutusu klavyenin üstünde kalır
c88b806 2026-11-25 Sürüm 0.9.4: telefonda Ailem kategorileri
ceccdb6 2026-11-25 Telefon Ailem: kategoriler gerçek içerik gösterir ve düzenlenir
1ab8936 2026-11-25 0.9.3: anasayfa düzeni, gram altın, Hafta/Ay/Yıl kur değişimi, yeni menü, görsel galerisi
7761c47 2026-11-25 0.9.2: ilaçlarda kayar düğme, şeker ölçüm saati, PDF'te ölçüm kayıtları
d565fc0 2026-11-25 Telegram bağlantısı kaldırıldı
6a12fcb 2026-11-24 Telefon 0.9.1 APK yayında (runtime 3): apk.json
a8afc80 2026-11-24 Sürüm 0.9.1
ee2f323 2026-11-24 0.9.1: eş için aile profili, ortak bütçe grafikleri ve aile takvimi
fb92e4a 2026-11-24 0.9.0: telefonda 5 sekmeli yeni düzen, PDF raporlar, ilaç ve şeker takibi
d07c942 2026-11-24 0.8.5: telefondan izin girişi, telefonda pasif ekip ve + sekmesi
08aefe7 2026-11-24 0.8.4: Menü Planlayıcı (Menü & Market alt sekmesi), simge hareketi
2b19f5c 2026-11-24 0.8.3: Bordro bölümü, İlaç Planı, pasif ekip, telefon veri tasarrufu
dae87f0 2026-11-24 0.8.2: gün türü listesi, Ekip menü altta, toplantılar kaldırıldı
97d9248 2026-11-23 0.8.1: manuel mod sürümü (sürüm notu)
03f17db 2026-11-23 Manuel mod (1. aşama): yapay zekâ çalışanları varsayılan kapalı
68e2da8 2026-11-19 0.8.0: yeni tasarım (Aşama 7 testleri, sürüm notu, sürüm 0.8.0)
920d301 2026-11-19 0.8.0 ara: Görevler, İş Günleri, İzinler, Merkez, Ayarlar, zamanlanmış işler, PocketBase (Aşama 4b+5)
2dd38e8 2026-11-19 0.8.0 ara: Anasayfa, Hiyerarşi, Ekip, Ailem sayfaları (Aşama 4a)
b86a9e9 2026-11-19 0.8.0 ara: tasarım temeli + yeni kabuk (Aşama 1-3) + mobil yeniden giydirme (Aşama 6)
d5a6216 2026-11-17 0.7.25: PocketBase oturumu (1. aşama) + Kai/Ada yalnız abonelik
d6347d7 2026-11-16 Onaylı sürüm 0.7.23 (0.7.2 GitHub'dan silindi); temizlik sahipsiz v* etiketlerini de siler
```
