// İş Raporu · sabitler, tatiller, örnek veri
var RED='#d23b3b',ORG='#f0a030',GRN='#3fb97a',BLU='#4f7dff',HOL='#8b7cf6';
var AY=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
var GK=['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
var GN=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
var AREAS=['home','msg','cal','img','plan','set'];
var DG=['Tezgah Düzenleme','Atölye Temizliği','Yarı Mamül Üretimi','Diğer'];
var HN={gel:'Uygulama Geliştirme',bil:'Uygulama Bildirimleri',sir:'Şirket Haberleri'};
// Gün türü ata listesi (Yarım gün kaldırıldı)
var SO=[['tam','İş Günü'],['mesai','Mesai'],['yillik','Yıllık İzin'],['ucretsiz','Ücretsiz İzin'],['rapor13','Rapor 1–3. Gün'],['rapor4','Rapor 4. Gün ve Sonrası'],['mazeret','Mazeret İzni (ücretli)'],['refakat','Refakat İzni'],['sevk','İş Yeri Sevki']];
var SPECIAL=['Diğer','Standart dışı'];
var ST=['Planlandı','Dilekçe verildi','Onaylandı'],SC=[['#2e2e33','#c9c9ce'],['#4a3a14','#f6d28a'],['#1d3b2b','#8fe0b3']];
var TN={tam:'İş günü tamam',hata:'Veri hatası',yillik:'Yıllık izin',plan:'Planlı izin · onay bekliyor',mazeret:'Mazeret izni',refakat:'Refakat izni',sevk:'İş yeri sevki',rapor13:'Rapor · 1–3. gün',rapor4:'Rapor · 4. gün ve sonrası',ucretsiz:'Ücretsiz izin',mesai:'Mesai',tatil:'Resmi tatil',tatily:'Arife · yarım gün resmi tatil',hafta:'Hafta sonu',gel:'Gelecek gün',bos:'Kayıt yok',bugun:'Bugün · kayıt bekliyor',girdi:'Girdi hatası'};
var SL={plan:'Plan',yillik:'İzin',mazeret:'Mazeret',refakat:'Refakat',sevk:'Sevk',rapor13:'Rapor',rapor4:'Rapor',ucretsiz:'Ücretsiz',mesai:'Mesai',tatil:'Tatil',tatily:'Arife',hata:'Hata',girdi:'Girdi hatası'};
var VN={'home:gun':'İş Günleri','home:proje':'Projeler','home:yil':'Yıllık İzinler','home:yeni':'Yeni proje','cal:takvim':'Takvim','msg:haber':'Haberler','img:gorsel':'Görseller','plan:notlar':'Planlar','set:kur':'Uygulama Kuralları','set:huk':'Hukuki Sorumluluk','set:ice':'Geçmiş raporlar','set:aktar':'Dışa aktar','set:belge':'Belgeler','set:baglanti':'Google Sheets'};

// Resmi tatiller (Kasım 2025 – Aralık 2027). Değer: [ad, 1 tam gün | .5 arife]. Yıllık güncellenir.
var HO={
'2026-1-1':['Yılbaşı',1],'2026-3-19':['Ramazan Bayramı arifesi',.5],'2026-3-20':['Ramazan Bayramı',1],'2026-3-21':['Ramazan Bayramı',1],'2026-3-22':['Ramazan Bayramı',1],
'2026-4-23':['23 Nisan',1],'2026-5-1':['Emek ve Dayanışma Günü',1],'2026-5-19':['19 Mayıs',1],'2026-5-26':['Kurban Bayramı arifesi',.5],'2026-5-27':['Kurban Bayramı',1],'2026-5-28':['Kurban Bayramı',1],'2026-5-29':['Kurban Bayramı',1],'2026-5-30':['Kurban Bayramı',1],
'2026-7-15':['15 Temmuz',1],'2026-8-30':['Zafer Bayramı',1],'2026-10-28':['Cumhuriyet Bayramı arifesi',.5],'2026-10-29':['Cumhuriyet Bayramı',1],
'2027-1-1':['Yılbaşı',1],'2027-3-8':['Ramazan Bayramı arifesi',.5],'2027-3-9':['Ramazan Bayramı',1],'2027-3-10':['Ramazan Bayramı',1],'2027-3-11':['Ramazan Bayramı',1],'2027-4-23':['23 Nisan',1],'2027-5-1':['Emek ve Dayanışma Günü',1],'2027-5-15':['Kurban Bayramı arifesi',.5],'2027-5-16':['Kurban Bayramı',1],'2027-5-17':['Kurban Bayramı',1],'2027-5-18':['Kurban Bayramı',1],'2027-5-19':['Kurban Bayramı ve 19 Mayıs',1],'2027-7-15':['15 Temmuz',1],'2027-8-30':['Zafer Bayramı',1],'2027-10-28':['Cumhuriyet Bayramı arifesi',.5],'2027-10-29':['Cumhuriyet Bayramı',1]};

// Köprü izin fırsatları (yalnız tam gün izin). st: W hafta sonu, H tatil, S arife, L izin
var IT=[
{n:'Ramazan Bayramı',r:'6–14 Mart 2027',c:1,o:9,t:20270306,st:'WWSHHHLWW',L:[['12 Mart 2027','Cuma',1,'2027-3-12']]},
{n:'Kurban Bayramı',r:'15–23 Mayıs 2027',c:2,o:9,t:20270515,st:'SHHHHLLWW',L:[['20 Mayıs 2027','Perşembe',1,'2027-5-20'],['21 Mayıs 2027','Cuma',1,'2027-5-21']]},
{n:'23 Nisan',r:'22–25 Nisan 2027',c:1,o:4,t:20270422,st:'LHWW',L:[['22 Nisan 2027','Perşembe',1,'2027-4-22']]},
{n:'15 Temmuz',r:'15–18 Temmuz 2027',c:1,o:4,t:20270715,st:'HLWW',L:[['16 Temmuz 2027','Cuma',1,'2027-7-16']]},
{n:'Yılbaşı',r:'31 Aralık 2026 – 3 Ocak 2027',c:1,o:4,t:20261231,st:'LHWW',L:[['31 Aralık 2026','Perşembe',1,'2026-12-31']]}];

// Çalışma saati dönemleri: bu tarihten itibaren Pzt–Per (w1) ve Cuma (w2) dakikası. Son dönem Ayarlar'dan değişir.
var WS0=[['2025-11-10',510,485],['2026-7-6',525,465],['2026-8-1',525,390],['2026-9-1',525,435]];

// Hazır projeler (menüsüz)
var PR0={SY88:[],SY78:[['78.26.03.19','Sancak GC'],['78.26.13.51','Fly Dayhead']]};

// Varsayılan ayarlar
var S0={w1:525,w2:435,cts:true,hak:14,kul:8,dev:0,ref:5,rap:4,onay:true,top:true,cak:true,blk:true,hire:'10.11.2025',sgk:'',path:'',npath:'',theme:'dark',remind:'17:50'};

// Örnek veri (Aşama 1). Sheets bağlanınca yerini gerçek kayıtlar alır.
function sampleE(){var E={},a=[
['2026-11-2',[['78.26.03.19','Sancak GC montajı',300],['78.26.13.51','Fly Dayhead kapak',225]]],
['2026-11-3',[['78.26.03.19','Sancak GC montajı',525]]],
['2026-11-4',[['78.26.13.51','Fly Dayhead tavan',405],['Diğer','Atölye Temizliği',120],['78.26.13.51','Akşam mesaisi',180]],180],
['2026-11-5',[['78.26.13.51','Fly Dayhead tavan',465],['Diğer','Tezgah Düzenleme',60]]],
['2026-11-6',[['78.26.03.19','Sancak GC revizyon',435]]],
['2026-11-9',[['78.26.03.19','Sancak GC montajı',525]]],
['2026-11-10',[['78.26.13.51','Fly Dayhead kapak',300],['Diğer','Yarı Mamül Üretimi',225]]]];
var OT={};a.forEach(function(x){E[x[0]]=x[1].map(function(r){return{k:r[0],i:r[1],d:r[2],st:1}});if(x[2])OT[x[0]]=x[2]});return{E:E,OT:OT}}
