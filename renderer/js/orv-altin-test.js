// Orvane 0.9.12 · Ailem › Altın Hesabım smoke testleri. Uydurma fiyat ve miktarlar; ağ yok; durum sonunda geri alınır.
window.__altinTest=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:'Altın Hesabım: '+n,ok:!!ok,m:ok?'':String(typeof m=='function'?m():m||'beklenmeyen sonuç')})}catch(e){R.push({n:'Altın Hesabım: '+n,ok:false,m:e.message})}}
 var y={a:S.orvA?JSON.stringify(S.orvA):null,fn:S.finans?JSON.stringify(S.finans):null,ui:JSON.stringify(AH.ui),ag:AH._ag},toast0=window.toast,tl=[];
 function ct(){return document.getElementById('ct')}
 // Truncgil v4 biçiminde uydurma ham veri (ana süreç bunu döndürür)
 var HAM={ham:{GRA:{Buying:1000,Selling:1010,Change:1.5},CEYREKALTIN:{Buying:1600,Selling:1650,Change:-0.5},CUMHURIYETALTINI:{Buying:6500,Selling:6600,Change:0},YARIMALTIN:{Buying:0,Selling:0,Change:0}},kaynak:'Truncgil',tarih:'2030-01-02 10:00:00',alindi:Date.now()};
 try{
  window.toast=function(m){tl.push(String(m))};
  var a=OA.st();delete a.altin;delete S.finans;
  t('Menü: Ailem altında “Altın Hesabım”',function(){var k=ORV.altKat('altin');return k&&k.id=='aile'&&!!ORV.sayfalar.altin&&k.alt.some(function(x){return x.id=='altin'&&x.ad=='Altın Hesabım'})});
  ORV.git0('altin');
  t('Boş sayfa: başlık, “+ Altın ekle”, fiyat bekleniyor, uydurma tutar yok',function(){var h=ct().innerHTML;return /Altın Hesabım/.test(h)&&/\+ Altın ekle/.test(h)&&/Fiyat bekleniyor/.test(h)&&/Henüz altın yok/.test(h)});
  var f=AH.fiyatOku(HAM);
  t('Fiyat ayrıştırma: tür başına satış/alış/günlük %, sıfır fiyat atlanır',f&&f.t.gram.satis==1010&&f.t.gram.alis==1000&&f.t.gram.deg==1.5&&f.t.ceyrek.deg==-0.5&&f.t.cumhuriyet.satis==6600&&!f.t.yarim&&f.kaynak=='Truncgil');
  t('Fiyat ayrıştırma: gram altın yoksa geçersiz',AH.fiyatOku({ham:{CEYREKALTIN:{Buying:1,Selling:2}}})===null&&AH.fiyatOku(null)===null);
  t('Kapalıçarşı tercihi: Otto’nun bugünkü Kapalıçarşı verisi gram ve çeyrek satışını belirler',function(){fnS().piyasa.otto={gun:OA.bugunKey(),ts:Date.now(),veri:{gram_altin:1020,ceyrek_altin:1666,kaynak:'Kapalıçarşı'}};var g=AH.fiyatOku(HAM);fnS().piyasa.otto.veri.kaynak='Başka site';var h=AH.fiyatOku(HAM);delete fnS().piyasa.otto;
   return g.t.gram.satis==1020&&g.t.gram.kaynak=='Kapalıçarşı'&&g.t.ceyrek.satis==1666&&g.t.cumhuriyet.kaynak=='Truncgil'&&h.t.gram.satis==1010});
  AH.st().fiyat=f;
  // Ekle
  var k1=AH.ekle({tur:'gram',miktar:'12,5',alis:'11.000',tarih:'2025-05-01',not:'Örnek gram'}),k2=AH.ekle({tur:'ceyrek',miktar:'3',alis:'',not:'Örnek çeyrek'});
  t('Ekle: gram (ondalıklı) ve adet; veri durum.json’daki S.orvA.altin’de',k1&&k1.miktar==12.5&&k1.alis==11000&&k2&&k2.miktar==3&&!k2.alis&&S.orvA.altin.kalem.length==2);
  t('Ekle: adetli altında küsurat, eksik tür ve sıfır miktar reddedilir',function(){var n=AH.st().kalem.length;var x=AH.ekle({tur:'ceyrek',miktar:'1,5'}),z=AH.ekle({tur:'yok',miktar:'1'}),w=AH.ekle({tur:'gram',miktar:'0'});return !x&&!z&&!w&&AH.st().kalem.length==n&&tl.some(function(m){return /tam sayı/.test(m)})});
  var T=AH.hesap();
  t('Hesap: değer = miktar × satış (12,5×1.010 + 3×1.650 = 17.575)',T.deger==17575&&T.satir[0].deger==12625&&T.satir[1].deger==4950,function(){return JSON.stringify(T)});
  t('Hesap: bozdurma değeri alış fiyatıyla (12,5×1.000 + 3×1.600 = 17.300)',T.bozdur==17300);
  t('Hesap: kâr/zarar yalnız alış tutarı girilen satırda (12.625 − 11.000 = ▲1.625)',T.kar==1625&&T.alis==11000&&T.satir[0].kar==1625&&T.satir[1].kar===null);
  t('Hesap: günlük değişim TL (gram ▲, çeyrek ▼) ve toplam',function(){var g=T.satir[0].gunluk,c=T.satir[1].gunluk;return g>0&&c<0&&Math.abs(g-12625*1.5/101.5)<0.01&&Math.abs(T.gunluk-Math.round((g+c)*100)/100)<0.011});
  t('Hesap: toplam gram ve adet',T.gram==12.5&&T.adet==3);
  ORV.git0('altin');var h=ct().innerHTML;
  t('Sayfa: toplam değer, ▲/▼ günlük, kâr/zarar, fiyat listesi ve tablo',/17\.575/.test(h)&&/▲/.test(h)&&/▼/.test(h)&&/1\.625/.test(h)&&document.querySelectorAll('#ahKok .ah-fs').length==5&&document.querySelectorAll('#ahTablo tbody tr.gg-tr').length==2);
  t('Sayfa: 0.8.0 / Aylık Bütçe dilinde (gg kartları, sırayla gelir, sayaç)',document.querySelectorAll('#ahKok .gg-k').length>=4&&document.querySelectorAll('#ahKok .gg-say').length>=3&&!!document.querySelector('#ahKok .gg-tab'));
  // Düzelt
  AH.duzenle(k2.id);
  t('Düzelt: satır yerinde düzenleme alanına döner',!!document.getElementById('ahEd')&&document.getElementById('ahEd').getAttribute('data-id')==k2.id&&document.getElementById('ahEMi').value=='3');
  document.getElementById('ahEMi').value='4';document.getElementById('ahEAl').value='6.000';AH.kaydet();
  t('Düzelt: miktar ve alış güncellenir, toplam yeniden hesaplanır',function(){var k=AH.st().kalem.filter(function(x){return x.id==k2.id})[0],T2=AH.hesap();return k.miktar==4&&k.alis==6000&&T2.deger==12625+6600&&T2.alis==17000&&!document.getElementById('ahEd')});
  // Yeni satır arayüzden
  AH.yeniAc();document.getElementById('ahETu').value='cumhuriyet';document.getElementById('ahEMi').value='1';AH.kaydet();
  t('Arayüzden ekle: Cumhuriyet altını 1 adet',AH.st().kalem.length==3&&AH.hesap().deger==12625+6600+6600);
  // Fiyatı olmayan tür
  AH.ekle({tur:'yarim',miktar:'1'});
  t('Fiyatı gelmeyen tür toplamı bozmaz, “fiyatı yok” diye belirtilir',function(){var T3=AH.hesap();ORV.git0('altin');return T3.eksik==1&&T3.deger==12625+6600+6600&&/1 türün fiyatı yok/.test(ct().textContent)});
  // Sil
  t('Sil: satır kaldırılır, toplam düşer',function(){var id=AH.st().kalem.filter(function(x){return x.tur=='yarim'})[0].id;return AH.silKayit(id)&&AH.st().kalem.length==3&&!AH.silKayit(id)});
  t('Altın Aile Bütçesine ve gelir/gidere işlenmez',!S.finans||!(S.finans.kayit||[]).length);
  t('Eski fiyat (ağ yok) “Son bilinen” diye işaretlenir',function(){var g=AH.fiyatOku(Object.assign({},HAM,{eski:true}));AH.st().fiyat=g;ORV.git0('altin');return g.eski&&/Son bilinen/.test(ct().innerHTML)});
  t('Testte ağa çıkılmaz (yenile boş döner)',function(){var p=AH.yenile(true);return p&&typeof p.then=='function'});
  t('Tasarım: altın CSS yüklü ve dar ekran kuralı var',function(){var ok=false;[].forEach.call(document.styleSheets,function(s){if(/orv-altin\.css/.test(s.href||''))[].forEach.call(s.cssRules,function(r){if(r.media&&/720px/.test(r.media.mediaText))ok=true})});return ok});
  // İşlem tarihi + alım gücü
  t('İşlem tarihi: ileri tarih, geçersiz tarih ve 1950 öncesi reddedilir; boş olabilir',function(){return !!AH.dogrula({tur:'gram',miktar:'1',tarih:'2099-01-01'}).hata&&!!AH.dogrula({tur:'gram',miktar:'1',tarih:'2025-13-40'}).hata&&!!AH.dogrula({tur:'gram',miktar:'1',tarih:'1940-01-01'}).hata&&!AH.dogrula({tur:'gram',miktar:'1',tarih:''}).hata&&!AH.dogrula({tur:'gram',miktar:'1',tarih:'2025-05-01'}).hata});
  t('İşlem tarihi: tabloda sütun olarak görünür',function(){ORV.git0('altin');return /İşlem tarihi/.test(document.querySelector('#ahTablo thead').textContent)&&/1 May 2025/.test(document.getElementById('ahTablo').textContent)});
  t('İşlem tarihi: satır düzenlemede değiştirilebilir',function(){AH.duzenle(k1.id);var e=document.getElementById('ahETa');if(!e||e.value!='2025-05-01')return false;e.value='2025-06-02';AH.kaydet();var k=AH.st().kalem.filter(function(x){return x.id==k1.id})[0];var ok=k.tarih=='2025-06-02';AH.guncelle(k1.id,{tur:'gram',miktar:'12,5',alis:'11.000',tarih:'2025-05-01',not:k.not});return ok&&AH.st().kalem.filter(function(x){return x.id==k1.id})[0].tarih=='2025-05-01'});
  t('Asgari ücret tablosu: yıl başına net tutar, tablo dışı tarih null',AH.asgari('2025-05-01')==22104.67&&AH.asgari('2026-11-27')==28075.5&&AH.asgari('2023-08-15')==11402.32&&AH.asgari('2024-12-31')==17002.12&&AH.asgari('2023-06-30')===null&&AH.asgari('2027-01-01')===null);
  var AGH={tufe:{'2025-05':100,'2026-10':130},tufeKaynak:'TÜİK (BIS veri servisi)',kur:{'2025-05-01':{usd:38,eur:43,d:'2025-05-01'}},bugun:{usd:42,eur:49,d:'2026-11-27'},kurKaynak:'ECB (Frankfurter)'};
  var AG=AH.agOku(AGH),A=AH.alimGucu(AH.hesap(),AG,'2026-11-27'),o1=A.satir.filter(function(o){return o.id==k1.id})[0];
  t('Alım gücü: nominal getiri (12.625 / 11.000 → %14,77)',o1&&o1.nominal==14.77,function(){return JSON.stringify(o1)});
  t('Alım gücü: TÜFE değişimi ve reel getiri (×1,30 → reel %−11,71)',o1.enf==30&&o1.reel==-11.71&&o1.tufeAlis==14300);
  t('Alım gücü: aynı tutarla dolar/euro alınsaydı (11.000/38×42, 11.000/43×49)',o1.usd==12157.89&&o1.eur==12534.88);
  t('Alım gücü: asgari ücret cinsinden (0,5 → 0,45 ay)',o1.asAlis==0.5&&o1.asBugun==0.45);
  t('Alım gücü: tarihi ya da alışı olmayan satır hesaplanmaz, sebebi yazılır',A.satir.filter(function(o){return o.id==k2.id})[0].nominal==null&&/İşlem tarihi/.test(A.satir.filter(function(o){return o.id==k2.id})[0].neden));
  t('Alım gücü: veri yoksa değer üretilmez',function(){var B=AH.alimGucu(AH.hesap(),null,'2026-11-27'),o=B.satir.filter(function(x){return x.id==k1.id})[0];return o.nominal==14.77&&o.enf==null&&o.reel==null&&o.usd==null&&o.eur==null&&/TÜFE verisi yok/.test(o.tufeNeden)&&/Kur verisi yok/.test(o.kurNeden)&&B.top.reel==null});
  t('Alım gücü: eski TÜFE (son yayın 5 ay önce) reel getiri göstermez',function(){var B=AH.alimGucu(AH.hesap(),AH.agOku({tufe:{'2025-05':100,'2026-06':120}}),'2026-11-27'),o=B.satir.filter(function(x){return x.id==k1.id})[0];return !B.guncel&&o.reel==null&&/güncel değil/.test(o.tufeNeden)});
  t('Alım gücü: çekme hatası nedeniyle yazılır',function(){var B=AH.alimGucu(AH.hesap(),AH.agOku({tufeHata:'zaman aşımı',kurHata:'zaman aşımı'}),'2026-11-27'),o=B.satir.filter(function(x){return x.id==k1.id})[0];return /TÜFE alınamadı: zaman aşımı/.test(o.tufeNeden)&&/Kur alınamadı/.test(o.kurNeden)});
  t('Alım gücü: işlem ayının TÜFE’si yoksa gösterilmez; tablo dışı tarihte asgari ücret yok',function(){AH.guncelle(k1.id,{tur:'gram',miktar:'12,5',alis:'11.000',tarih:'2023-03-01',not:''});var B=AH.alimGucu(AH.hesap(),AG,'2026-11-27'),o=B.satir.filter(function(x){return x.id==k1.id})[0];AH.guncelle(k1.id,{tur:'gram',miktar:'12,5',alis:'11.000',tarih:'2025-05-01',not:'Örnek gram'});return o.reel==null&&/TÜFE/.test(o.tufeNeden)&&o.usd==null&&o.asAlis==null&&/2023/.test(o.asNeden)});
  t('Sayfa: ağ yokken alım gücü kartı “alınmadı” der, uydurma oran göstermez',function(){AH._ag=null;ORV.git0('altin');var x=ct().textContent;return /Alım gücü/.test(x)&&/TÜFE ve kur alınmadı/.test(x)&&/veri yok/.test(x)&&(function(){var c=document.querySelector('.ah-ag tbody tr').cells;return c[3].textContent=='veri yok'&&c[4].textContent=='veri yok'&&c[5].textContent=='veri yok'&&c[6].textContent=='veri yok'})()});
  t('Sayfa: veri gelince nominal, TÜFE, reel, dolar/euro ve asgari ücret sütunları dolar',function(){var d=new Date(),x=new Date(d.getFullYear(),d.getMonth()-1,1),son=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0'),tf={'2025-05':100};tf[son]=130;AH._ag=AH.agOku(Object.assign({},AGH,{tufe:tf}));ORV.git0('altin');var h=document.querySelector('.ah-ag').textContent;return /Dolar alınsaydı/.test(h)&&/%30/.test(h)&&/12.158/.test(h)&&/12.535/.test(h)&&/0,45/.test(h)&&/TÜİK/.test(ct().textContent)&&/ECB/.test(ct().textContent)});
  // 0.9.15 · Gram ve ayar
  t('Gram: gramı olmayan eski adetli kayıt standart ağırlıkla gösterilir, veriye yazılmaz (4 çeyrek ≈ 7 gr)',function(){var once=JSON.stringify(AH.st().kalem);var T=AH.hesap(),r=T.satir.filter(function(x){return x.id==k2.id})[0];ORV.git0('altin');
   var k=AH.st().kalem.filter(function(x){return x.id==k2.id})[0];return r.gram==7&&r.gramStd&&r.ayar==22&&r.has==6.412&&k.gram===undefined&&JSON.stringify(AH.st().kalem)==once},function(){return JSON.stringify(AH.hesap().satir)});
  t('Gram: gram türünde miktar = gram, ayar ve has karşılığı (12,5 gr × 0,995 = 12,438)',function(){var r=AH.hesap().satir.filter(function(x){return x.id==k1.id})[0];return r.gram==12.5&&!r.gramStd&&r.ayar==24&&r.has==12.438});
  t('Gram: toplam gram ve has (12,5 + 7 + 7,216; has 12,438 + 6,412 + 6,61)',function(){var T=AH.hesap();return T.gramTop==26.716&&T.has==25.46&&T.gramStd==2&&T.gram==12.5&&T.adet==5},function(){var T=AH.hesap();return T.gramTop+' / '+T.has+' / '+T.gramStd});
  var kg=AH.ekle({tur:'ceyrek',miktar:'2',gram:'3,6',not:'Ağır çeyrek'}),ks=AH.ekle({tur:'ceyrek',miktar:'2',gram:'3,5'});
  t('Gram: girilen gram saklanır; standarda eşit gram yazılmaz (aynı sonuç)',kg&&kg.gram==3.6&&ks&&ks.gram===undefined&&AH.hesap().satir.filter(function(x){return x.id==kg.id})[0].gram==3.6&&!AH.hesap().satir.filter(function(x){return x.id==kg.id})[0].gramStd);
  t('Gram: geçersiz gram reddedilir, kayıt eklenmez',function(){var n=AH.st().kalem.length;return !AH.ekle({tur:'ceyrek',miktar:'1',gram:'abc'})&&AH.st().kalem.length==n&&tl.some(function(m){return /Gramı yaz/.test(m)})});
  t('Gram: düzeltmede gelmeyen gram korunur (koruma kuralı), boşaltılan gram standart ağırlığa döner',function(){var a=AH.guncelle(kg.id,{miktar:'3'}),k=AH.st().kalem.filter(function(x){return x.id==kg.id})[0];var ok1=a&&k.miktar==3&&k.gram==3.6&&k.not=='Ağır çeyrek';AH.guncelle(kg.id,{gram:''});var ok2=k.gram===undefined&&AH.hesap().satir.filter(function(x){return x.id==kg.id})[0].gram==5.25;return ok1&&ok2});
  AH.silKayit(kg.id);AH.silKayit(ks.id);
  // Bilezik / takı: ayara göre gram fiyatı, işçilik yok
  AH.st().fiyat.t.ayar18={satis:800,alis:780,deg:0,kaynak:'Truncgil'};AH.st().fiyat.t.bilezik22={satis:950,alis:930,deg:0.5,kaynak:'Truncgil'};
  var kb=AH.ekle({tur:'bilezik',miktar:'20',ayar:'22',alis:'25.000'}),kt=AH.ekle({tur:'taki',miktar:'5,5',ayar:'18',not:'Kolye'});
  t('Bilezik/takı: tür, ayar, gram; değer ayarın gram fiyatıyla (20×950, 5,5×800), işçilik girmez',function(){var T=AH.hesap(),b=T.satir.filter(function(x){return x.id==kb.id})[0],c=T.satir.filter(function(x){return x.id==kt.id})[0];
   return kb.ayar==22&&kt.ayar==18&&b.deger==19000&&b.bozdur==18600&&b.kar==-6000&&c.deger==4400&&b.has==18.32&&c.has==4.125&&b.gram==20},function(){return JSON.stringify(AH.hesap().satir.slice(-2))});
  t('Bilezik/takı: geçersiz ayar reddedilir; ayar verilmezse 22',function(){return !!AH.dogrula({tur:'bilezik',miktar:'5',ayar:'20'}).hata&&AH.dogrula({tur:'taki',miktar:'5'}).ayar==22&&AH.dogrula({tur:'gram',miktar:'5',ayar:'18'}).ayar===null});
  t('Bilezik/takı: ayarın fiyatı yoksa değer uydurulmaz (14 ayar)',function(){AH.guncelle(kt.id,{ayar:'14'});var c=AH.hesap().satir.filter(function(x){return x.id==kt.id})[0],ok=c.deger==null&&c.ayar==14&&c.has==3.218;AH.guncelle(kt.id,{ayar:'18'});return ok});
  t('Sayfa: Gram · ayar sütunu, ≈ standart ağırlık, toplam gram ve has altın karşılığı',function(){ORV.git0('altin');var h=document.getElementById('ahTablo').textContent,x=ct().textContent;return /Gram · ayar/.test(h)&&/≈ 7 gr/.test(h)&&/22 ayar · has 6,412 gr/.test(h)&&/18 ayar/.test(h)&&/has altın karşılığı/.test(x)&&/standart ağırlıkla/.test(x)&&document.querySelectorAll('#ahTablo thead th').length==10});
  t('Form: adetli üründe Gram kutusu standart ağırlıkla ön dolu; adet değişince adet başı ağırlıkla ölçeklenir',function(){AH.duzenle(k2.id);var g=document.getElementById('ahEGr'),m=document.getElementById('ahEMi');if(!g||g.hidden||g.value!='7')return false;m.value='2';AH.formMiktar();var a=g.value=='3,5'&&g.getAttribute('data-el')=='0';g.value='4';g.dispatchEvent(new Event('input'));m.value='4';AH.formMiktar();return a&&g.value=='8'&&/22 ayar/.test(document.getElementById('ahEAn').textContent)});
  t('Form: kaydedilen gram saklanır; gram türünde kutu gizli, bilezikte ayar seçilir',function(){AH.kaydet();var k=AH.st().kalem.filter(function(x){return x.id==k2.id})[0];if(k.gram!=8||k.miktar!=4)return false;AH.duzenle(k2.id);var tu=document.getElementById('ahETu');tu.value='gram';AH.formTur();var gz=document.getElementById('ahEGr').hidden&&document.getElementById('ahEAy').hidden&&/24 ayar/.test(document.getElementById('ahEAn').textContent);
   tu.value='bilezik';AH.formTur();var bz=document.getElementById('ahEGr').hidden&&!document.getElementById('ahEAy').hidden;AH.vazgec();return gz&&bz&&AH.st().kalem.filter(function(x){return x.id==k2.id})[0].tur=='ceyrek'});
  t('Form: dokunulmamış ön dolu gram veriye yazılmaz',function(){AH.guncelle(k2.id,{gram:''});AH.duzenle(k2.id);document.getElementById('ahEMi').value='5';AH.formMiktar();AH.kaydet();var k=AH.st().kalem.filter(function(x){return x.id==k2.id})[0],ok=k.miktar==5&&k.gram===undefined;AH.guncelle(k2.id,{miktar:'4'});return ok});
  t('Form: bilezik düzenlemesinde kayıtlı ayar seçili gelir',function(){AH.duzenle(kt.id);var v=document.getElementById('ahEAy').value,h=document.getElementById('ahEAy').hidden;AH.vazgec();return v=='18'&&!h});
  t('Form: tür listesinde Bilezik ve Takı gram türlerinin yanında',function(){AH.yeniAc();var o=[].map.call(document.getElementById('ahETu').options,function(x){return x.value});AH.vazgec();return o.indexOf('bilezik')==5&&o.indexOf('taki')==6&&o.length==AH.TUR.length});
 }catch(e){t('test çöktü',false,e.stack)}
 finally{window.toast=toast0;if(y.a)S.orvA=JSON.parse(y.a);else delete S.orvA;if(y.fn)S.finans=JSON.parse(y.fn);else delete S.finans;AH.ui=JSON.parse(y.ui);AH._ag=y.ag;try{cfNo()}catch(e){}}
 return R};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__altinTest()}catch(e){y=[{n:'Altın Hesabım: test çöktü',ok:false,m:e.message}]}return x.concat(y)})}})();
// Ekran görüntüsü (smoke): uydurma fiyat ve altınlarla
(function(){var sr=window.__smokeRoutes,sg=window.__smokeGo;window.__smokeRoutes=function(){return sr().concat([['orvaltin','','']])};
 window.__smokeGo=function(r){if(r[0]!='orvaltin')return sg(r);try{var a=OA.st();a.altin={kalem:[{id:'au1',tur:'gram',miktar:25,alis:90000,tarih:'2025-03-10',not:'Örnek',ts:1},{id:'au2',tur:'ceyrek',miktar:6,ts:2},{id:'au3',tur:'cumhuriyet',miktar:2,alis:60000,tarih:'2024-09-02',ts:3},{id:'au4',tur:'bilezik22',miktar:30,ts:4}],
   fiyat:AH.fiyatOku({ham:{GRA:{Buying:4100,Selling:4150,Change:0.8},HAS:{Buying:4080,Selling:4120,Change:0.8},YIA:{Buying:3800,Selling:3950,Change:0.7},CEYREKALTIN:{Buying:6700,Selling:6850,Change:-0.4},YARIMALTIN:{Buying:13400,Selling:13700,Change:-0.4},TAMALTIN:{Buying:26800,Selling:27300,Change:-0.4},CUMHURIYETALTINI:{Buying:27500,Selling:27900,Change:0.2}},kaynak:'Truncgil',tarih:'örnek',alindi:Date.now()})};
  AH.ui={edit:null,yeni:false};(function(){var d=new Date(),x=new Date(d.getFullYear(),d.getMonth()-1,1),son=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0'),tf={'2025-03':100,'2024-09':88};tf[son]=131;AH._ag=AH.agOku({tufe:tf,kur:{'2025-03-10':{usd:36.5,eur:39.6,d:'2025-03-10'},'2024-09-02':{usd:34,eur:37.6,d:'2024-09-02'}},bugun:{usd:42.4,eur:49.1,d:OA.bugunKey()}})})();try{ORV.zpTog(false)}catch(e){}ORV.git0('altin');return new Promise(function(res){setTimeout(function(){res({})},2600)})}catch(e){return {error:e.message}}}})();
