# Veri ve güvenlik

- Ana veri: bilgisayardaki `durum.json` (veri klasörü; `konum.json` yedeği LocalAppData'da). Kayıtlar diske zorla yazılır (fsync).
- `durum.json`'a dışarıdan yazmadan önce Orvane kapalı mı bakılır ve Yedekler'e yedek alınır.
- Bordro verisi yalnız bu bilgisayarda; buluta ve telefona gitmez.
- Gizli klasörler: `Belgelerim\Finans` yalnız Finans Uzmanı, `Belgelerim\Sağlık` yalnız Sağlıklı Yaşam Koçu.
- Şirket hesabındaki kayıtlar telefona gönderilmez.
- PocketBase oturumu (0.7.25): Windows şifrelemesiyle saklanır, şifre yazılmaz, çevrimdışı açılış. Görevler ve zamanlanmış işler PocketBase'e yazılır.
- Telefon eşitlemesi Supabase ile; 60 sn'de bir, yalnız uygulama öndeyken; özet yalnız değişince indirilir.

## Girilen veri kaybolmaz (kullanıcı kararı, 2026-11-27)

- **Veri girişleri doğrudur; hata hesapta ve kuralda aranır.** Kullanıcının girdiği kayıtlar gerçek veride değiştirilmez ve silinmez: gelir, gider, bakiye bildirimi, bordro, altın, FuzulEv, ilaç vb. Hata kodun hesaplarında aranır: toplamlar, maaş + SGK sınırı, ay devri, otomatik kayıtlar, çift sayma, bakiye hesabı.
- **Programın kendi ürettiği kayıtlar düzeltilebilir.** Bunlar otomatik maaş, kayıt dışı harcama/gelir, devir, geçmiş ay dengesi gibi kayıtlardır. Önce yedek alınır, eski değer kayıtta kalır (`eski: [{t, ts}]` ya da not) ve düzeltme raporda listelenir.
- Hatalı görünen bir kullanıcı kaydı silinmez; işaretlenir (ör. "sınır dışı") ya da raporda sorulur. Silmek gerekiyorsa önce kullanıcıya sorulur.
- Her yazmadan önce `Yedekler`'e yedek alınır. Kurulumda ve içe aktarmada mevcut kayıtlar aynen kalır. Kurulumdan önce ve sonra kayıt sayıları karşılaştırılıp raporda yazılır.
- Kod: düzenleme ekranları kaydederken düzenlenmeyen alanları korur. Bu ekranlar gelir/gider, altın, FuzulEv taksiti ve sözleşmesi, bakiye bildir. Gelmeyen alan eski değerinde kalır; yalnız bilerek boşaltılan alan silinir. Reddedilen kayıtta formdaki değerler kalır. Sınırı aşan telefon geliri bütçeye yazılmaz ama olduğu gibi saklanır (`S.orvA.gelirRed`). Testler `orv-butce-koruma-test.js`'te.
