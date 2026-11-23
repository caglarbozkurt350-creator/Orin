// Orvane · Manuel mod (1. aşama): yapay zekâ çalışanları varsayılan KAPALI.
// Veri girişi manuel; kapalıyken hiçbir yapay zekâ çağrısı, arka plan taraması ya da otomatik cevap yapılmaz.
// Kod silinmez: Ayarlar › Yapay zekâ'dan açılınca eski davranış döner. Smoke'ta varsayılan açık (eski testler değişmesin).
var YZ_SMOKE=!!(INFO&&INFO.smoke); // açılıştaki değer: testler INFO'yu geçici değiştirse de sabit kalır
function yzKapali(){return S.yzAcik===false||(S.yzAcik!==true&&!YZ_SMOKE)}
function yzBildir(){try{if(window.API&&API.yz)API.yz.ayar({acik:!yzKapali()})}catch(e){}}
function yzAyarla(acik){S.yzAcik=!!acik;save();yzBildir();if(window.ORV&&ORV.navGuncelle)ORV.navGuncelle();toast(acik?'Yapay zekâ açıldı':'Yapay zekâ kapatıldı · manuel mod')}
yzBildir();
