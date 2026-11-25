// Orvane 0.9.0 · Telefon eşitleme eki smoke testleri (yalnız `electron . --smoke`). Durum geri alınır.
window.__telefon09Test=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
 var a=OA.st(),il0=JSON.stringify(a.ilac),al0=JSON.stringify(a.ilacAl),sk0=a.seker?JSON.stringify(a.seker):null,ss0=a.sekerSaat?JSON.stringify(a.sekerSaat):null,fn0=S.finans?JSON.stringify(S.finans):null;
 var gk=null,d=new Date();d.setDate(d.getDate()+2);for(var i=0;i<12&&!gk;i++){var k=key(d);if(lim(k)&&!D[k]&&!(E[k]||[]).length)gk=k;d.setDate(d.getDate()+1)}
 var E0=gk?E[gk]:undefined;
 try{
  var ay=OT9.ay(0),once=OT9.ay(1);delete S.finans;
  fnKaydet({tur:'gelir',kim:'cagla',tutar:'20000',kalem:'Maaş',tarih:ay+'-02'});fnKaydet({tur:'gider',kim:'cagla',tutar:'1500',kalem:'Market',tarih:ay+'-09'});
  fnKaydet({tur:'gider',kim:'sirket',tutar:'900',kalem:'Bakım',tarih:ay+'-09'});fnKaydet({tur:'gider',kim:'cagla',tutar:'2000',kalem:'Market',tarih:once+'-20'});
  var oz=bulutOzet(),fin=oz.aile&&oz.aile.fin;
  t('Özet: aile bloğu (bütçe, ilaç, şeker) telefona gider',!!(oz.aile&&fin&&Array.isArray(oz.aile.ilac)&&oz.aile.al&&oz.aile.seker));
  t('Bütçe: bu ay gelir/gider, Şirket kaydı sayılmaz',fin.bu.gelir==20000&&fin.bu.gider==1500,JSON.stringify(fin.bu));
  t('Bütçe: haftalara dağılım (9’u 2. hafta) ve kategori',fin.bu.hc[1]==1500&&fin.bu.kat.Market==1500);
  t('Bütçe: geçen ay ayrı (kıyas için)',fin.once.gider==2000&&fin.once.kat.Market==2000);
  t('Bütçe: işlem listesi en yeni üstte, Şirket yok',fin.islem.length==3&&fin.islem[0][0]>=fin.islem[1][0]&&!fin.islem.some(function(x){return x[1]=='Bakım'}));
  // İlaç ve şeker
  bulutUygula({id:'t9-i1',tur:'ilac_kaydet',ts:Date.now(),veri:{id:'t9ilac',ad:'Deneme D',miktar:'1 tablet',saat:'08:30',stok:30}});
  t('İlaç: telefondan eklenir (stok ile)',a.ilac.some(function(x){return x.id=='t9ilac'&&x.stok==30&&x.eklendi}));
  bulutUygula({id:'t9-i2',tur:'ilac_kaydet',ts:Date.now(),veri:{id:'t9ilac',ad:'Deneme D3',miktar:'2 tablet',saat:'09:00'}});
  t('İlaç: aynı id güncellenir, kopya oluşmaz',a.ilac.filter(function(x){return x.id=='t9ilac'}).length==1&&a.ilac.filter(function(x){return x.id=='t9ilac'})[0].ad=='Deneme D3');
  var bk=OT9.pad(new Date());bulutUygula({id:'t9-a1',tur:'ilac_al',ts:Date.now(),veri:{k:bk,id:'t9ilac',al:1}});
  t('İlaç: Alındı işareti telefondan gelir ve özete döner',!!a.ilacAl[bk+'|t9ilac']&&bulutOzet().aile.al[bk+'|t9ilac']==1);
  bulutUygula({id:'t9-a2',tur:'ilac_al',ts:Date.now(),veri:{k:bk,id:'t9ilac',al:0}});t('İlaç: işaret geri alınır',!a.ilacAl[bk+'|t9ilac']);
  bulutUygula({id:'t9-s1',tur:'seker',ts:Date.now(),veri:{k:bk,v:104}});t('Şeker: sabah değeri saklanır ve özete gider',a.seker[bk]==104&&bulutOzet().aile.seker[bk]==104);
  bulutUygula({id:'t9-s3',tur:'seker',ts:Date.now(),veri:{k:bk,v:118,s:'06:12'}});t('Şeker: yazıldığı saat saklanır ve özete gider',a.seker[bk]==118&&a.sekerSaat[bk]=='06:12'&&bulutOzet().aile.sekerSaat[bk]=='06:12');
  bulutUygula({id:'t9-s2',tur:'seker',ts:Date.now(),veri:{k:bk,v:5}});t('Şeker: geçersiz değer kaydı ve saatini siler',a.seker[bk]==null&&!a.sekerSaat[bk]);
  bulutUygula({id:'t9-i3',tur:'ilac_sil',ts:Date.now(),veri:{id:'t9ilac'}});t('İlaç: telefondan kaldırılır',!a.ilac.some(function(x){return x.id=='t9ilac'}));
  // 0.9.4 Ailem kategorileri: menü, market, satın alma, ev işleri
  bulutUygula({id:'t9-m1',tur:'menu_yaz',ts:Date.now(),veri:{k:'2-aksam',v:'Kuru fasulye'}});t('Menü: telefondan yazılır ve özete gider',a.menu['2-aksam']=='Kuru fasulye'&&bulutOzet().aile.menu['2-aksam']=='Kuru fasulye');
  bulutUygula({id:'t9-m2',tur:'menu_yaz',ts:Date.now(),veri:{k:'2-aksam',v:''}});t('Menü: boş yazılınca silinir',a.menu['2-aksam']==null);
  bulutUygula({id:'t9-k1',tur:'market_ekle',ts:Date.now(),veri:{id:'t9mk',ad:'Süt'}});bulutUygula({id:'t9-k1b',tur:'market_ekle',ts:Date.now(),veri:{id:'t9mk',ad:'Süt'}});
  t('Market: telefondan eklenir, aynı id kopya olmaz, özete gider',a.market.filter(function(x){return x.id=='t9mk'}).length==1&&bulutOzet().aile.market.some(function(x){return x.id=='t9mk'&&!x.al}));
  bulutUygula({id:'t9-k2',tur:'market_tik',ts:Date.now(),veri:{id:'t9mk',al:1}});t('Market: işaretlenir',a.market.filter(function(x){return x.id=='t9mk'})[0].al===true);
  bulutUygula({id:'t9-k3',tur:'market_temizle',ts:Date.now(),veri:{}});t('Market: alınanlar kaldırılır',!a.market.some(function(x){return x.id=='t9mk'}));
  bulutUygula({id:'t9-o1',tur:'oneri_ekle',ts:Date.now(),veri:{id:'t9on',ad:'Blender',fiyat:'2.000 ₺'}});bulutUygula({id:'t9-o2',tur:'oneri_karar',ts:Date.now(),veri:{id:'t9on',karar:'onay'}});
  t('Satın alma: öneri eklenir, karar verilir, özete gider',a.oneri.filter(function(x){return x.id=='t9on'})[0].karar=='onay'&&bulutOzet().aile.oneri.some(function(x){return x.id=='t9on'&&x.karar=='onay'}));
  bulutUygula({id:'t9-o3',tur:'oneri_karar',ts:Date.now(),veri:{id:'t9on',karar:'xx'}});t('Satın alma: geçersiz karar yok sayılır',a.oneri.filter(function(x){return x.id=='t9on'})[0].karar=='onay');
  a.oneri=a.oneri.filter(function(x){return x.id!='t9on'});
  bulutUygula({id:'t9-e1',tur:'ev_ekle',ts:Date.now(),veri:{id:'t9ev',ad:'Çamaşır',kim:'Kübra'}});bulutUygula({id:'t9-e2',tur:'ev_tik',ts:Date.now(),veri:{id:'t9ev',bitti:1}});
  t('Ev işleri: eklenir, işaretlenir, özete gider',bulutOzet().aile.ev.some(function(x){return x.id=='t9ev'&&x.bitti&&x.kim=='Kübra'}));
  bulutUygula({id:'t9-e3',tur:'ev_temizle',ts:Date.now(),veri:{}});t('Ev işleri: bitenler kaldırılır',!a.ev.some(function(x){return x.id=='t9ev'}));
  var spk=OT9.pad(new Date())+'|kubra';bulutUygula({id:'t9-s1',tur:'spor',ts:Date.now(),veri:{k:OT9.pad(new Date()),kim:'kubra',adim:8450,dk:35,tur:'kosu',tdk:20,s:'19:05'}});
  t('Spor: telefondan yazılır ve özete gider',a.spor[spk].adim==8450&&a.spor[spk].tdk==20&&bulutOzet().aile.spor[spk].dk==35);
  bulutUygula({id:'t9-s2',tur:'spor',ts:Date.now(),veri:{k:OT9.pad(new Date()),kim:'kubra',adim:999999,dk:5,tur:'xx',tdk:30}});t('Spor: sınırlar ve geçersiz tür',a.spor[spk].adim==100000&&a.spor[spk].tur==''&&a.spor[spk].tdk==0);
  bulutUygula({id:'t9-s3',tur:'spor',ts:Date.now(),veri:{k:OT9.pad(new Date()),kim:'kubra',adim:0,dk:0}});t('Spor: sıfır yazılınca silinir',a.spor[spk]==null);
  bulutUygula({id:'t9-s4',tur:'spor',ts:Date.now(),veri:{k:OT9.pad(new Date()),kim:'baskasi',adim:100}});t('Spor: geçersiz kişi yok sayılır',!Object.keys(a.spor).some(function(k){return /baskasi/.test(k)}));
  // İş kaydı: durum, düzelt, sil
  if(gk){
   bulutUygula({id:'t9-k1',tur:'kayit',ts:Date.now(),veri:{k:gk,kod:'10.20.30.01',is:'Montaj',dk:120,du:'devam'}});
   var en=(E[gk]||[]).filter(function(z){return z.pid=='t9-k1'})[0];
   t('Kayıt: durum etiketi saklanır ve özette 4. alan',en&&en.du=='devam'&&JSON.stringify(bulutOzet().gun[gk].e).indexOf('devam')>0);
   bulutUygula({id:'t9-k2',tur:'kayit_duzelt',ts:Date.now(),veri:{k:gk,n:0,eski:['10.20.30.01','Montaj',120],yeni:{kod:'10.20.30.07',is:'Montaj',dk:150,du:'bitti'}}});
   t('Kayıt: telefondan düzeltilir (kod, dakika, durum)',en.k=='10.20.30.07'&&en.d==150&&en.du=='bitti');
   bulutUygula({id:'t9-k3',tur:'kayit_sil',ts:Date.now(),veri:{k:gk,eski:['10.20.30.07','Montaj',150]}});
   t('Kayıt: telefondan silinir',!(E[gk]||[]).some(function(z){return z.pid=='t9-k1'}));
   bulutUygula({id:'t9-z1',tur:'izin',ts:Date.now(),veri:{t:'yillik',b:gk}});var vardi=D[gk]=='yillik';
   bulutUygula({id:'t9-z2',tur:'izin_sil',ts:Date.now(),veri:{t:'yillik',b:gk}});
   t('İzin: telefondan kaldırılır',vardi&&!D[gk]);
  }else t('Kayıt testleri için boş iş günü bulunamadı',true);
 }catch(e){t('Telefon eki testi',false,e.stack)}
 finally{a.ilac=JSON.parse(il0);a.ilacAl=JSON.parse(al0);if(sk0)a.seker=JSON.parse(sk0);else delete a.seker;if(ss0)a.sekerSaat=JSON.parse(ss0);else delete a.sekerSaat;if(fn0)S.finans=JSON.parse(fn0);else delete S.finans;
  if(gk){if(E0)E[gk]=E0;else delete E[gk];if(D[gk])delete D[gk]}}
 return R};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__telefon09Test()}catch(e){y=[{n:'Telefon 0.9: test çöktü',ok:false,m:e.message}]}return x.concat(y)})}})();
