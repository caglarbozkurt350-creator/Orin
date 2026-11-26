# Veri ve güvenlik

- Ana veri: bilgisayardaki `durum.json` (veri klasörü; `konum.json` yedeği LocalAppData'da). Kayıtlar diske zorla yazılır (fsync).
- `durum.json`'a dışarıdan yazmadan önce Orvane kapalı mı bakılır ve Yedekler'e yedek alınır.
- Bordro verisi yalnız bu bilgisayarda; buluta ve telefona gitmez.
- Gizli klasörler: `Belgelerim\Finans` yalnız Finans Uzmanı, `Belgelerim\Sağlık` yalnız Sağlıklı Yaşam Koçu.
- Şirket hesabındaki kayıtlar telefona gönderilmez.
- PocketBase oturumu (0.7.25): Windows şifrelemesiyle saklanır, şifre yazılmaz, çevrimdışı açılış. Görevler ve zamanlanmış işler PocketBase'e yazılır.
- Telefon eşitlemesi Supabase ile; 60 sn'de bir, yalnız uygulama öndeyken; özet yalnız değişince indirilir.
