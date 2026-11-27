// Orvane 0.9.1 · Aile paylaşımı smoke testleri (yalnız `electron . --smoke`). Durum geri alınır.
window.__aile091Test=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
 var a=OAI.st(),y={ilac:JSON.stringify(a.ilac),al:JSON.stringify(a.ilacAl),tk:JSON.stringify(a.takvim),oz:JSON.stringify(a.ozel),fn:S.finans?JSON.stringify(S.finans):null,bl:JSON.stringify(BLS())};
 try{
  var bugun=OT9.pad(new Date()),yarin=OT9.pad(new Date(Date.now()+864e5));
  a.ilac.push({id:'t91c',ad:'Benim ilacım',miktar:'1',saat:'08:00',tekrar:'gun',eklendi:Date.now()});
  a.takvim.push({id:'t91tc',ad:'Benim etkinliğim',tarih:yarin,kim:'cagla'});
  // Eşin harcamaları
  OAI.uygula({id:'t91h1',tur:'es_harcama',ts:Date.now(),veri:{tutar:'250',ad:'Kahve',kasa:'cep'}},'es');
  OAI.uygula({id:'t91h2',tur:'es_harcama',ts:Date.now(),veri:{tutar:900,ad:'Haftalık alışveriş',kasa:'ortak',kat:'Market'}},'es');
  var k1=fnS().kayit.filter(function(x){return x.id=='fnt91h1'})[0],k2=fnS().kayit.filter(function(x){return x.id=='fnt91h2'})[0];
  t('Eş: cep harçlığı harcaması kendi cebinden düşer (hk e)',k1&&k1.hk=='e'&&k1.tur=='gider'&&k1.tutar==250);
  t('Eş: market harcaması ortak bütçeden (kategori Market, cep değil)',k2&&!k2.hk&&k2.kalem=='Market');
  OAI.uygula({id:'t91h1',tur:'es_harcama',ts:Date.now(),veri:{tutar:250,kasa:'cep'}},'es');
  t('Eş: aynı olay iki kez işlenmez',fnS().kayit.filter(function(x){return x.id=='fnt91h1'}).length==1);
  var or=OAI.ortak();
  t('Ortak blok: kasa dağılımı (ortak / eş cebi)',or.kasa.e>=250&&or.kasa.ortak>=900&&or.kat.Market>=900);
  (function(){var st=OA.st(),eski=st.bak;st.bak=Object.assign({},eski||{},{aile:{t:12345,ts:5}});var o2=OAI.ortak(),tr=o2.trend[5];st.bak=eski;
   t('Ortak blok: Aile Bütçesi güncel bakiyesi telefona gider (bu ayın gelir − giderinden bağımsız)',o2.aile&&o2.aile.t==12345&&o2.aile.ts==5&&tr[1]-tr[2]!=12345)})();
  t('Ortak blok: 6 aylık gelir-gider trendi',or.trend.length==6&&or.trend[5][0]==bugun.slice(0,7));
  t('Ortak blok: hareketlerde eşin kaydı işaretli',or.hareket.some(function(h){return h[6]=='kubra'&&h[5]=='e'}));
  // Eşin ilaçları
  OAI.uygula({id:'t91i1',tur:'es_ilac_kaydet',ts:Date.now(),veri:{id:'t91k',ad:'Eşin ilacı',miktar:'1 tablet',saat:'09:00'}},'es');
  var ki=a.ilac.filter(function(x){return x.id=='t91k'})[0];
  t('Eş: kendi ilacını ekler (kim kubra)',ki&&ki.kim=='kubra');
  t('Eş: kendi ilacına alındı işareti koyar',OAI.uygula({id:'t91a1',tur:'es_ilac_al',ts:Date.now(),veri:{k:bugun,id:'t91k',al:1}},'es')&&!!a.ilacAl[bugun+'|t91k']);
  t('Eş: Çağlar’ın ilacına işaret koyamaz',!OAI.uygula({id:'t91a2',tur:'es_ilac_al',ts:Date.now(),veri:{k:bugun,id:'t91c',al:1}},'es')&&!a.ilacAl[bugun+'|t91c']);
  t('Eş: Çağlar’ın ilacını değiştiremez / silemez',!OAI.uygula({id:'t91i2',tur:'es_ilac_kaydet',veri:{id:'t91c',ad:'X'}},'es')&&!OAI.uygula({id:'t91i3',tur:'es_ilac_sil',veri:{id:'t91c'}},'es')&&a.ilac.some(function(x){return x.id=='t91c'&&x.ad=='Benim ilacım'}));
  // Randevu ve takvim
  OAI.uygula({id:'t91r',tur:'etkinlik',ts:Date.now(),veri:{id:'t91rv',ad:'Kardiyoloji',tarih:yarin,saat:'10:30',tur:'randevu',yer:'Devlet Hastanesi'}},'es');
  var rv=a.takvim.filter(function(x){return x.id=='t91rv'})[0];
  t('Eş: hastane randevusu ekler, Çağlar’ın özetinde görünür',rv&&rv.tur=='randevu'&&rv.kim=='kubra'&&bulutOzet().aile.ortak.takvim.some(function(x){return x.id=='t91rv'}));
  t('Eş: Çağlar’ın etkinliğini silemez',!OAI.uygula({id:'t91s',tur:'etkinlik_sil',veri:{id:'t91tc'}},'es')&&a.takvim.some(function(x){return x.id=='t91tc'}));
  t('Eş: kendi randevusunu siler',OAI.uygula({id:'t91s2',tur:'etkinlik_sil',veri:{id:'t91rv'}},'es'));
  OAI.uygula({id:'t91o',tur:'ozel_gun',veri:{id:'t91og',ad:'Evlilik yıldönümü',tarih:'2020-06-14',tur:'yildonumu'}},'es');
  t('Eş: özel gün ekler',a.ozel.some(function(x){return x.id=='t91og'&&x.kim=='kubra'}));
  OAI.uygula({id:'t91o2',tur:'ozel_gun',veri:{id:'t91dg',ad:'Çağlar’ın doğum günü',tarih:'1990-01-02',tur:'dogum',kisi:'cagla'}},'es');OAI.uygula({id:'t91o3',tur:'ozel_gun',veri:{id:'t91dg2',ad:'X',tarih:'1990-01-02',tur:'dogum',kisi:'baskasi'}},'es');
  t('Özel gün: kimin günü (kisi) saklanır, geçersiz değer atılır',a.ozel.some(function(x){return x.id=='t91dg'&&x.kisi=='cagla'&&x.kim=='kubra'})&&a.ozel.some(function(x){return x.id=='t91dg2'&&!x.kisi}));
  // Yetki: Çağlar'ın verileri
  var gk=key(new Date(Date.now()+3*864e5)),d0=D[gk];
  t('Eş: izin / iş kaydı olayı reddedilir',!OAI.uygula({id:'t91z',tur:'izin',veri:{t:'yillik',b:gk}},'es')&&!OAI.uygula({id:'t91k2',tur:'kayit',veri:{k:gk,kod:'1',is:'x',dk:10}},'es')&&D[gk]===d0);
  var bk=OA.bugunKey();a.ilacAl[bk+'|t91c']=1;a.ilacAl[bk+'|t91k']=1;
  var eo=OAI.esOzet();
  t('Eşin özeti: iş kaydı, ekip, sohbet ve spor (sağlık) içermez',eo.rol=='es'&&!eo.gun&&!eo.ekip&&eo.aile&&eo.aile.ortak&&Array.isArray(eo.aile.ilac)&&!('spor' in eo.aile));
  t('Eşin özeti: yalnız eşin ilaçları ve işaretleri gider; Çağlar’ın ilaçları gönderilmez',eo.aile.ilac.some(function(x){return x.id=='t91k'&&x.kim=='kubra'})&&!eo.aile.ilac.some(function(x){return x.kim!='kubra'})&&eo.aile.al[bk+'|t91k']&&!eo.aile.al[bk+'|t91c']);
  t('Çağlar’ın kendi özeti: iki kişinin ilaçları da durur',bulutOzet().aile.ilac.some(function(x){return x.id=='t91c'})&&bulutOzet().aile.ilac.some(function(x){return x.id=='t91k'}));
  OAI.ayar().eposta='';t('Ayarlar › Telefon: aile paylaşımı kartı',/Aile paylaşımı/.test(P.telefon())&&/aiE/.test(P.telefon()));
 }catch(e){t('Aile testi',false,e.stack)}
 finally{a.ilac=JSON.parse(y.ilac);a.ilacAl=JSON.parse(y.al);a.takvim=JSON.parse(y.tk);a.ozel=JSON.parse(y.oz);if(y.fn)S.finans=JSON.parse(y.fn);else delete S.finans;S.bulut=JSON.parse(y.bl)}
 return R};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__aile091Test()}catch(e){y=[{n:'Aile 0.9.1: test çöktü',ok:false,m:e.message}]}return x.concat(y)})}})();
