// Orvane 0.9.12 · Ailem › Altın Hesabım smoke testleri. Uydurma fiyat ve miktarlar; ağ yok; durum sonunda geri alınır.
window.__altinTest=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:'Altın Hesabım: '+n,ok:!!ok,m:ok?'':String(typeof m=='function'?m():m||'beklenmeyen sonuç')})}catch(e){R.push({n:'Altın Hesabım: '+n,ok:false,m:e.message})}}
 var y={a:S.orvA?JSON.stringify(S.orvA):null,fn:S.finans?JSON.stringify(S.finans):null,ui:JSON.stringify(AH.ui)},toast0=window.toast,tl=[];
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
  var k1=AH.ekle({tur:'gram',miktar:'12,5',alis:'11.000',tarih:'2029-05-01',not:'Örnek gram'}),k2=AH.ekle({tur:'ceyrek',miktar:'3',alis:'',not:'Örnek çeyrek'});
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
 }catch(e){t('test çöktü',false,e.stack)}
 finally{window.toast=toast0;if(y.a)S.orvA=JSON.parse(y.a);else delete S.orvA;if(y.fn)S.finans=JSON.parse(y.fn);else delete S.finans;AH.ui=JSON.parse(y.ui);try{cfNo()}catch(e){}}
 return R};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__altinTest()}catch(e){y=[{n:'Altın Hesabım: test çöktü',ok:false,m:e.message}]}return x.concat(y)})}})();
// Ekran görüntüsü (smoke): uydurma fiyat ve altınlarla
(function(){var sr=window.__smokeRoutes,sg=window.__smokeGo;window.__smokeRoutes=function(){return sr().concat([['orvaltin','','']])};
 window.__smokeGo=function(r){if(r[0]!='orvaltin')return sg(r);try{var a=OA.st();a.altin={kalem:[{id:'au1',tur:'gram',miktar:25,alis:90000,tarih:'',not:'Örnek',ts:1},{id:'au2',tur:'ceyrek',miktar:6,ts:2},{id:'au3',tur:'cumhuriyet',miktar:2,alis:60000,ts:3},{id:'au4',tur:'bilezik22',miktar:30,ts:4}],
   fiyat:AH.fiyatOku({ham:{GRA:{Buying:4100,Selling:4150,Change:0.8},HAS:{Buying:4080,Selling:4120,Change:0.8},YIA:{Buying:3800,Selling:3950,Change:0.7},CEYREKALTIN:{Buying:6700,Selling:6850,Change:-0.4},YARIMALTIN:{Buying:13400,Selling:13700,Change:-0.4},TAMALTIN:{Buying:26800,Selling:27300,Change:-0.4},CUMHURIYETALTINI:{Buying:27500,Selling:27900,Change:0.2}},kaynak:'Truncgil',tarih:'örnek',alindi:Date.now()})};
  AH.ui={edit:null,yeni:false};try{ORV.zpTog(false)}catch(e){}ORV.git0('altin');return new Promise(function(res){setTimeout(function(){res({})},2600)})}catch(e){return {error:e.message}}}})();
