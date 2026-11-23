// Orvane 0.8.4 · Menü Planlayıcı smoke testleri (yalnız `electron . --smoke`). Durum geri alınır.
window.__menuPlanTest=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
 var a=OA.st(),mp0=a.mplan?JSON.parse(JSON.stringify(a.mplan)):undefined,menu0=JSON.stringify(a.menu),mk0=JSON.stringify(a.market),ui0=JSON.stringify(MP.ui),yen=ORV.yenile;
 ORV.yenile=function(){};
 try{
  delete a.mplan;var m=MP.st();
  t('Menü: varsayılan 2 kişi, 2.000 kcal, kahvaltı+akşam, ekonomik, klasik',m.kisi==2&&m.kcal==2000&&m.og.k&&m.og.a&&!m.og.o&&m.butce==1&&m.tarz=='klasik');
  t('Menü: tarif listesi (≥50) her öğün için dolu',MP.TARIF.length>=50&&['k','o','s','a'].every(function(o){return MP.TARIF.some(function(r){return r.og.indexOf(o)>=0&&r.b==1})}));
  MP.ui.tab='liste';var h0=ORV.sayfalar.market.ciz('');
  t('Menü & Market: alt sekmeler (Menü & Liste · Menü Planlayıcı), mevcut liste duruyor',/Menü Planlayıcı/.test(h0)&&/Market listesi/.test(h0)&&/MP\.sekme/.test(h0));
  MP.ui.tab='plan';var h=ORV.sayfalar.market.ciz('');
  t('Planlayıcı: tüm bölümler (kişi, kalori, öğün, bütçe, tarz, dolap)',['KAÇ KİŞİLİK?','GÜNLÜK KALORİ HEDEFİ','HANGİ ÖĞÜNLERİ İSTİYORSUNUZ?','BÜTÇE SEGMENTİ','BESLENME TARZI','DOLABIMDA NE VAR?','Haftalık Planımı Oluştur'].every(function(x){return h.indexOf(x)>=0}));
  t('Planlayıcı: kalori dağılımı seçili öğünlere bölünür',function(){var p=MP.pay();return p.k+p.a==2000&&p.k<p.a&&!p.o});
  t('Planlayıcı: kalori kipi (Diyet / Dengeli / Aktif)',MP.kip(1500)[0]=='Diyet'&&MP.kip(2000)[0]=='Dengeli'&&MP.kip(2800)[0]=='Aktif');
  MP.sec('og','o');MP.sec('dolap','Tavuk Göğsü');MP.sec('kisi',3);
  t('Planlayıcı: seçimler kaydedilir',m.og.o==1&&m.dolap['Tavuk Göğsü']==1&&m.kisi==3);
  t('Planlayıcı: plan oluşur (7 gün × 3 öğün)',MP.olustur()&&Object.keys(m.plan).length==21);
  t('Planlayıcı: ekonomik bütçede pahalı tarif yok',Object.keys(m.plan).every(function(k){return MP.TARIF[m.plan[k]].b==1}));
  t('Planlayıcı: dolaptaki tavuk öne çıkar',Object.keys(m.plan).some(function(k){return MP.TARIF[m.plan[k]].mz.some(function(z){return z.ad=='Tavuk Göğsü'})}));
  t('Planlayıcı: aynı yemek haftada en çok 2 kez (öğün başına)',function(){var c={};Object.keys(m.plan).forEach(function(k){var x=k.split('-')[1]+m.plan[k];c[x]=(c[x]||0)+1});return Object.keys(c).every(function(x){return c[x]<=2})});
  MP.sec('tarz','vejetaryen');MP.olustur();
  t('Planlayıcı: vejetaryende et/balık yok',Object.keys(m.plan).every(function(k){return MP.TARIF[m.plan[k]].et.indexOf('v')>=0}));
  var L=MP.liste();
  t('Alışveriş: kişi sayısıyla çarpılır, gruplanır',L.length>5&&L.every(function(x){return x.m>0&&x.grup})&&L.some(function(x){return x.grup=='Sebze ve meyve'}));
  t('Alışveriş: miktar biçimi (g/kg, adet)',MP.miktar({m:1250,b:'g'})=='1,3 kg'&&MP.miktar({m:333,b:'g'})=='340 g'&&MP.miktar({m:2.5,b:'adet'})=='3 adet');
  var k0=Object.keys(m.plan)[0],e0=m.plan[k0];MP.degistir(k0);
  t('Planlayıcı: ↻ ile tek öğün değişir',m.plan[k0]!=e0&&MP.TARIF[m.plan[k0]].og.indexOf(k0.split('-')[1])>=0);
  var hs=MP.sayfa();
  t('Sonuç: 7 günlük tablo, toplam kcal, alışveriş listesi',/7 Günlük Menü/.test(hs)&&/Pazar/.test(hs)&&/Alışveriş Listesi/.test(hs)&&/MP\.degistir/.test(hs)&&/MP\.tik/.test(hs));
  var dl=L.filter(function(x){return x.dolap});MP.tik(L.filter(function(x){return !x.dolap})[0].id);
  var n0=a.market.length,n=MP.marketeEkle();
  var tik=L.filter(function(x){return !x.dolap})[0];t('Market listesine ekle: işaretlenen ve dolaptakiler hariç',n>0&&a.market.length==n0+n&&!a.market.slice(n0).some(function(x){return x.ad.indexOf(tik.ad+' · ')===0||dl.some(function(d){return x.ad.indexOf(d.ad+' · ')===0})}),n+' / '+L.length);
  t('Market listesine ekle: ikinci kez eklemez',MP.marketeEkle()===0);
  t('Haftalık menüye aktar: öğle ve akşam',MP.menuyeAktar()==14&&!!a.menu['0-ogle']&&!!a.menu['6-aksam']);
 }finally{ORV.yenile=yen;if(mp0===undefined)delete a.mplan;else a.mplan=mp0;a.menu=JSON.parse(menu0);a.market=JSON.parse(mk0);MP.ui=JSON.parse(ui0)}
 return Promise.resolve(R)};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__menuPlanTest()}catch(e){y=Promise.resolve([{n:'Menü: test çöktü',ok:false,m:String(e&&e.message||e)}])}return y.then(function(y){return x.concat(y)})})}})();
// Ekran görüntüsü: orvmp_plan.png (ORV_SMOKE_BOYUT ile), uydurma ayarlarla
(function(){var sr=window.__smokeRoutes,sg=window.__smokeGo;window.__smokeRoutes=function(){var L=sr(),i=L.findIndex(function(r){return r[0]=='orvpas'});var ek=[['orvmp','form',''],['orvmp','plan','']];return i<0?L.concat(ek):L.slice(0,i).concat(ek,L.slice(i))};
 window.__smokeGo=function(r){if(r[0]!='orvmp')return sg(r);try{try{ORV.zpTog(false)}catch(e){}var a=OA.st();a.mplan={kisi:2,kcal:2000,og:{k:1,o:1,a:1},butce:2,tarz:'klasik',dolap:{'Tavuk Göğsü':1,'Yumurta':1,'Domates':1},plan:null,tohum:3,alindi:{}};MP.ui.tab='plan';
  if(r[1]=='plan'){var y=ORV.yenile;ORV.yenile=function(){};try{MP.olustur()}finally{ORV.yenile=y}}ORV.git0('market');if(r[1]=='plan')setTimeout(function(){var e=document.getElementById('mpSonuc');if(e)e.scrollIntoView()},50);return new Promise(function(res){setTimeout(function(){res({})},400)})}catch(e){return {error:e.message}}}})();
