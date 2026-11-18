# Orvane Mobil 0.8.0 · yeni tasarım (Android)

Kaynak: `Program kurulum\Tasarim\AndroidNav.dc.html` ve `Android.dc.html`; talimat Bölüm 1, 2, 5, 6.
Ek paket YOK, yerel modül YOK: `runtimeVersion` "2" kalır, OTA (`eas update`) ile gelir, yeni APK gerekmez.

## Yeni yapı
- `src/app/index.tsx` tek kabuk: üst çubuk (ORVANE simgesi, çalışan menüsü düğmesi, Ç), 5 sekme, sağ kenar oku, açılış ekranı.
- Alt menü `bilesen/AltMenu.tsx`: ev · kalp · artı · kişi · zil, çentikli çubuk (react-native-svg yolu), yeşil yuvarlak yaylanarak kayar (Animated spring). Artı üzerinde onay rozeti, zilde okunmamış noktası.
- Sekmeler (`src/ekran/`): Anasayfa · Ailem · Görevler (Görevler/Onaylar/Görseller) · Ekip (Ekip/Hiyerarşi) · Merkez (İş Günleri, İzinler, Bildirimler, Eşitleme ve Güncellemeler, Ayarlar).
- Kartlar başlığa dokununca küçülür/açılır, kapalıyken başlıkta kısa özet (`KartK`).
- Sağ çalışan menüsü `bilesen/CalisanMenusu.tsx`: yuvarlak profiller departman başlıklarıyla; Görev ver / Mesaj / Not / Telegram; yazma kutusu, yeşil bildirim, çalışan başına açılır-kapanır Geçmiş; 1,2 sn dokunulmazsa kapanır (yazarken, kutu açıkken, arama odaktayken kapanmaz); Ekip ızgarası ve Hiyerarşi ağacında kişiye dokununca o çalışan açılır. Eski sol menü yok.
- Ailem: kategori kutuları + sağda yukarıdan aşağı açılan yuvarlak çalışan rayı (`AileRayi`).
- Açılış ekranı (`Acilis.tsx`, ~2,5 sn; Ayarlar'dan kapatılır, "hareketi azalt" açıksa gösterilmez).

## Tema ve görünüm
- `src/lib/tema.ts` artık bağımsız: zemin #19191b, metin #f2f2f3/#a9a9b0/#8e8e95, 6 tema (Turuncu varsayılan), durum renkleri #3ecf5a/#f5a524/#6b6b73. `src/veri/tema.json` (masaüstü ortak dosyası) artık kullanılmaz; `npm run paylas` onu üzerine yazsa da telefonu etkilemez.
- Tema, sekme geçişi (Akışkan/Kaydır/Yakınlaş/Solma/Kapalı + Önizle) ve açılış ekranı yalnız telefonda saklanır (kv-store `orvane-gorunum-v1`); masaüstüyle eşitlenmez. Bildirim "okundu" bilgisi de yalnız telefonda (`orvane-bildirim-okundu-v1`).

## Korunan özellikler (hiçbiri silinmedi)
- Supabase eşitleme, SQLite/kv-store durum, olaylar, giriş/çıkış/hesap aç, bağlantı adresi, expo-updates denetimi, APK bildirim şeridi, yapay zekâ durumu → Merkez › Eşitleme ve Güncellemeler.
- Görevler listesi + doğrudan görev, Onaylar (Nika › Orin › Çağlar zinciri, Nika olarak geliştirme) → Görevler sekmesi.
- İş günü (kayıt, Günü doldur, etiket fotoğrafı) → Merkez › İş Günleri.
- Ekip listesi/arama, son yazışmalar, İnsan Kaynakları (`/ik`), çalışan sayfası (`/calisan/[id]`: sohbet, görevler, beceriler, hafıza, Otto gelir/gider) → Ekip sekmesi ve çalışan menüsü.
- Eski rota dosyaları `gorevler`, `gun`, `onaylar`, `ayarlar` kabuğa taşındı (iç rota; dış bağlantı yok). Gelir/gider formu `formlar.tsx` içine alındı, Ailem › Bütçe'den de açılır.

## Veri
- "Örnek veri" rakamları taşınmadı. Anasayfa, Ailem, Hiyerarşi, Bildirimler, İzinler mevcut özetten (`useGorunum`) hesaplanır; veri yoksa boş durum yazar.
- Görseller bölümü proje kodlarını gruplar; telefonda görsel klasörü yoktur ("görsel bekleniyor").
- Bildirimler: onay bekleyenler, biten/hatalı görevler, çalışan cevapları, eşitleme hatası.

## Açık kalanlar
- Telegram gönderimi: telefon `telegram` türünde olay yazar (`{kim, ad, bot, t}`); masaüstü bu olayı işleyip bota iletmeli. İşlenene kadar Geçmiş'te görünür, bildirimde "sıraya alındı" yazar.
- Bulanık cam (backdrop blur) yok: yerel modül gerektirdiği için yarı saydam dolgu kullanıldı.
- Sekme çıkış animasyonu yok (yalnız giriş); bulanıklaşma (blur) geçişleri kaldırıldı.
- Ailem kategorilerinin verileri (bakiye, ilaç planı, menü) telefona gelmiyor; ilgili çalışana mesaj/görev/gelir-gider ile ulaşılır.
- Gerçek cihazda görsel doğrulama yapılmadı (yalnız `tsc` ve `expo export --platform android`).
