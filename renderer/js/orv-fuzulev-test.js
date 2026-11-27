// Orvane 0.9.13 · Ailem › FuzulEv smoke testleri (yalnız `electron . --smoke`). Uydurma sözleşme ve tutarlar; gerçek veri kullanılmaz; durum geri alınır.
window.__fuzulevTest=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:'FuzulEv: '+n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}catch(e){R.push({n:'FuzulEv: '+n,ok:false,m:e.message})}}
 var y={fn:S.finans?JSON.stringify(S.finans):null,a:S.orvA?JSON.stringify(S.orvA):null,ui:JSON.stringify(FE.ui)};
 function ct(){return document.getElementById('ct')}
 function bak(k){var b=OA.st().bak[k];return b?b.t:null}
 function kay(id){return fnS().kayit.filter(function(x){return x.id==id})[0]}
 var p2=function(n){return String(n).padStart(2,'0')};
 function gunEk(s,d){var x=new Date(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10)+d);return x.getFullYear()+'-'+p2(x.getMonth()+1)+'-'+p2(x.getDate())}
 try{
  var bugun=OA.bugunKey(),now=Date.now();
  delete S.finans;S.orvA={cep:{c:30,e:20},bak:{aile:{t:50000,ts:now-1000,bts:now-1000,kim:'test'},cagla:{t:6000,ts:now-1000,bts:now-1000,kim:'test'}}};FE.ui={suz:'tum',edit:null,yeni:false};

  t('Menü: Ailem altında “FuzulEv”, sayfa kayıtlı',ORV.altKat('fuzulev')&&ORV.altKat('fuzulev').id=='aile'&&!!ORV.sayfalar.fuzulev&&ORV.katBul('aile').alt.map(function(a){return a.id}).indexOf('fuzulev')==ORV.katBul('aile').alt.map(function(a){return a.id}).indexOf(ORV.altBul('altin')?'altin':'aylikbutce')+1);
  ORV.git0('fuzulev');
  t('Boş durum: sözleşme girme çağrısı ve İçe Aktar yolu',/Henüz FuzulEv sözleşmesi yok/.test(ct().textContent)&&/İçe Aktar/.test(ct().textContent));

  // Uydurma sözleşme: 6 taksit, 3. taksit teslimat; 1–2 ödenmiş (tutar bilinmiyor), 3. gecikmiş
  var veri={soz:{plan:'Örnek Esnek Plan',planKod:'ORN-01',sozNo:'000-TEST',tarih:gunEk(bugun,-60),kampanya:'Örnek kampanya',finTur:'Konut',bedel:'120.000',orgUcret:'9.000',pesinat:0,taksitSay:6,teslimat:4,durum:'Kesin Kayıt'},
   taksit:[{no:1,tur:'Tasarruf',vade:gunEk(bugun,-60),tutar:null,odendi:true},{no:2,tur:'Tasarruf',vade:gunEk(bugun,-30),tutar:null,odendi:true},{no:3,tur:'Tasarruf',vade:gunEk(bugun,-3),tutar:'11.000'},
    {no:4,tur:'Tahsisat',vade:gunEk(bugun,27),tutar:'13.000'},{no:5,tur:'Finansman',vade:gunEk(bugun,57),tutar:7000},{no:6,tur:'Finansman',vade:gunEk(bugun,87),tutar:'7.000'}]};
  var n=OA.iceUygula({bak:{cagla:6000},fuzulev:veri});
  var f=FE.st();
  t('İçe Aktar: "fuzulev" anahtarı uygulanır, diğer anahtarlar eskisi gibi işlenir',n.fe&&n.fe.yeni==6&&f.taksit.length==6&&f.soz.bedel==120000&&f.soz.orgUcret==9000&&f.soz.pesinat===0&&f.soz.teslimat==4&&n.b==1&&bak('cagla')==6000,JSON.stringify(n));
  t('İçe Aktar: bilinmeyen tutar uydurulmaz (null kalır)',f.taksit[0].tutar===null&&f.taksit[1].tutar===null&&f.taksit[0].odendi&&f.taksit[2].tutar==11000);
  FE.st().taksit[0].tutar=4000;FE.st().taksit[0].odenen=4000;
  var n2=FE.iceUygula(veri);
  t('İçe Aktar ikinci kez: taksit çoğalmaz, elle girilen tutar ve ödendi korunur',n2.yeni==0&&n2.guncel==6&&FE.st().taksit.length==6&&FE.st().taksit[0].tutar==4000&&FE.st().taksit[0].odendi);
  FE.st().taksit[0].tutar=null;FE.st().taksit[0].odenen=null;

  var H=FE.hesap(bugun);
  t('Hesap: kalan borç 38.000, 4 taksit; toplam ödenen eksik (2 tutar girilmedi)',H.kalan==38000&&H.kalanSay==4&&H.odenenEksik==2&&H.odenen==0,JSON.stringify({k:H.kalan,s:H.kalanSay,e:H.odenenEksik}));
  t('Hesap: 3. taksit 3 gün gecikmiş; sonraki ödeme 4. taksit (27 gün)',H.geciken.length==1&&H.geciken[0].t.no==3&&H.geciken[0].gecikme==3&&H.sonraki&&H.sonraki.t.no==4&&H.sonraki.kalanGun==27);
  t('Hesap: teslimata 2 taksit ve 27 gün',H.teslim&&H.teslim.taksit==2&&H.teslim.gun==27&&!H.teslim.tamam);

  ORV.git0('fuzulev');var h=ct().innerHTML,x=ct().textContent;
  t('Sayfa: gecikme uyarısı (role=alert) ve “Ödendi işaretle”',!!ct().querySelector('.fe-gec[role=alert]')&&/3\. taksit 3 gün gecikti/.test(x)&&/Ödendi işaretle/.test(x));
  t('Sayfa: dört gösterge (Kalan borç, Toplam ödenen, Teslimata kalan, Sonraki ödeme)',ct().querySelectorAll('.gg-kpi .gg-k').length==4&&/Kalan borç/.test(x)&&/38\.000/.test(x)&&/Teslimata kalan/.test(x)&&/Sonraki ödeme/.test(x)&&/2 ödenmiş taksitin tutarı girilmedi/.test(x));
  t('Sayfa: sözleşme kartı ve ödeme yolu (6 sütun, teslimat işaretli)',/Örnek Esnek Plan/.test(x)&&/120\.000 ₺/.test(x)&&/9\.000 ₺/.test(x)&&ct().querySelectorAll('.fe-yi').length==6&&!!ct().querySelector('.fe-yi.tes')&&!!ct().querySelector('.fe-yi.gec'));
  t('Tablo: 6 satır, tür/vade/tutar/ödenen/kalan/durum; “Tutar girilmedi” ve “Teslimat”',ct().querySelectorAll('#feTablo tbody tr.gg-tr').length==6&&/Tutar girilmedi/.test(x)&&/Teslimat/.test(ct().querySelector('#feTablo').textContent)&&ct().querySelectorAll('#feTablo th').length==8);
  FE.suzgec('odenmedi');
  t('Süzgeç: Ödenmemiş 4 satır, Ödenmiş 2 satır',ct().querySelectorAll('#feTablo tbody tr.gg-tr').length==4&&(FE.suzgec('odendi'),ct().querySelectorAll('#feTablo tbody tr.gg-tr').length==2));
  FE.suzgec('tum');

  // Ödendi + Aile Bütçesi
  var t3=FE.st().taksit.filter(function(q){return q.no==3})[0];
  FE.odeDlg(t3.id);
  t('Ödendi penceresi: tutar dolu, bu ayın ödemesinde bütçe kutusu işaretli, kasa seçimi',document.getElementById('feOt').value=='11.000'&&document.getElementById('feOb').checked&&!!document.getElementById('feOk'));
  document.getElementById('feOd').value=bugun;FE.odeKaydet(t3.id);
  var r3=kay('fe'+t3.id);
  t('Ödendi + bütçe: “FuzulEv taksiti” gideri yazılır, Aile Bütçesinden düşer (50.000 − 11.000)',t3.odendi&&r3&&r3.kalem=='FuzulEv taksiti'&&r3.tur=='gider'&&r3.tutar==11000&&r3.bakDus=='aile'&&bak('aile')==39000&&t3.butceId==r3.id,JSON.stringify(r3)+' '+bak('aile'));
  var say0=fnS().kayit.length,b2=FE.butceYaz(t3,'aile');FE.odendi(t3.id,{tutar:'11.000',odemeTarih:bugun,butce:true});
  t('Çift sayma yok: aynı taksit ikinci kez yazılmaz, bakiye değişmez',b2.durum=='zaten'&&fnS().kayit.length==say0&&bak('aile')==39000);
  FE.guncelle(t3.id,{no:3,tur:'Tasarruf',vade:t3.vade,tutar:'11.000',odendi:true,odenen:'12.000',odemeTarih:bugun});
  t('Ödenen düzeltilince bütçe kaydı ve bakiye fark kadar güncellenir',kay('fe'+t3.id).tutar==12000&&bak('aile')==38000,kay('fe'+t3.id).tutar+' '+bak('aile'));
  var g=FE.odenmedi(t3.id);
  t('Geri al: FuzulEv’in yazdığı gider silinir, bakiye geri gelir',g.silindi&&!kay('fe'+t3.id)&&bak('aile')==50000&&!t3.odendi&&!t3.butceId);

  // Bankadan içe aktarılmış aynı ödeme
  var bk=fnKaydet({tur:'gider',kim:'cagla',tutar:'11000',kalem:'Diğer',tarih:gunEk(bugun,-1),not:'FUZULEV TASARRUF ODEME',kaynak:'banka'},'bnTEST1');bk.bakEk='banka';var say1=fnS().kayit.length;
  var s4=FE.odendi(t3.id,{tutar:'11.000',odemeTarih:bugun,butce:true,kasa:'aile'});
  t('Banka kaydı varsa: ona bağlanır, yeni gider yazılmaz, bakiye değişmez',s4.butce.durum=='bagli'&&t3.butceId=='bnTEST1'&&t3.butceBag&&fnS().kayit.length==say1&&bak('aile')==50000);
  FE.odenmedi(t3.id);
  t('Banka kaydına bağlı taksit geri alınınca banka kaydı kalır',!!kay('bnTEST1')&&!t3.butceId&&bak('aile')==50000);

  // Bütçesiz ödeme ve Çağlar cep kasası
  var t4=FE.st().taksit.filter(function(q){return q.no==4})[0];FE.odendi(t4.id,{odemeTarih:bugun,butce:false});
  t('Bütçeye yazmadan ödendi: kayıt yok, bakiye aynı',t4.odendi&&!t4.butceId&&!kay('fe'+t4.id)&&bak('aile')==50000);
  FE.odenmedi(t4.id);FE.odendi(t4.id,{odemeTarih:bugun,butce:true,kasa:'cagla'});
  t('Çağlar cep kasasından: cepten ve Aile Bütçesinden düşer',kay('fe'+t4.id).hk=='c'&&bak('cagla')==-7000&&bak('aile')==37000,bak('cagla')+' '+bak('aile'));
  FE.odenmedi(t4.id);
  t('Geçmiş aya ait ödemede bütçe kutusu varsayılan kapalı',function(){var t5=FE.st().taksit.filter(function(q){return q.no==5})[0];FE.odeDlg(t5.id);var d=document.getElementById('feOd');d.value=gunEk(bugun.slice(0,7)+'-01',-1);FE.odeTarihDegis();var k=document.getElementById('feOb').checked;OA.dlgKapat();return !k});

  // Düzenleme
  t('Doğrulama: aynı taksit no ve hatalı vade reddedilir',!FE.ekle({no:3,tur:'Finansman',vade:'',tutar:'1000'})&&FE.dogrula({no:9,vade:'31-31-31'}).hata);
  var t7=FE.ekle({no:7,tur:'Finansman',vade:gunEk(bugun,117),tutar:'7.000'});
  t('Taksit eklenir ve sıralanır; silinir',t7&&FE.st().taksit[6].no==7&&FE.silTaksit(t7.id)&&FE.st().taksit.length==6);
  FE.duzenle(FE.st().taksit[0].id);
  t('Satır düzenleme: tutar boş bırakılabilir, Kaydet ile yazılır',function(){if(!document.getElementById('feEd'))return false;document.getElementById('feETt').value='4.500';FE.kaydet();return FE.st().taksit[0].tutar==4500&&FE.st().taksit[0].odendi&&FE.hesap(bugun).odenen==4500&&FE.hesap(bugun).odenenEksik==1});
  FE.sozDlg();document.getElementById('feS_durum').value='Teslim edildi';document.getElementById('feS_bedel').value='125.000';FE.sozDlgKaydet();
  t('Sözleşme düzenlenir (her alan)',FE.st().soz.durum=='Teslim edildi'&&FE.st().soz.bedel==125000&&/Teslim edildi/.test(ct().textContent));
  FE.st().taksit=FE.st().taksit.filter(function(q){return q.no<=2});var yeni=FE.planUret();
  t('Taksit planı: eksik numaralar sözleşme tarihinden aylık vadeyle açılır, var olanlara dokunmaz',yeni==4&&FE.st().taksit.length==6&&FE.st().taksit[3].tur=='Tahsisat'&&FE.st().taksit[3].tutar===null&&FE.st().taksit[0].tutar==4500&&function(){var s=FE.st().soz.tarih,d=new Date(+s.slice(0,4),+s.slice(5,7)-1+2,1);return FE.st().taksit[2].vade.slice(0,7)==d.getFullYear()+'-'+p2(d.getMonth()+1)}());
  t('Hareketi azalt: prefers-reduced-motion kuralı',function(){var ok=false;[].forEach.call(document.styleSheets,function(s){if(!/orv-fuzulev\.css/.test(s.href||''))return;[].forEach.call(s.cssRules,function(r){if(r.media&&/reduce/.test(r.media.mediaText)&&/fe-gec/.test(r.cssText))ok=true})});return ok});
  t('Telefon özetine FuzulEv gitmez',function(){try{var o=typeof OAI!='undefined'&&OAI.esOzet?JSON.stringify(OAI.esOzet()):'';return !/fuzulev|FuzulEv/.test(o)}catch(e){return true}});
 }catch(e){t('test',false,e.stack)}
 finally{try{OA.dlgKapat()}catch(e){}if(y.fn)S.finans=JSON.parse(y.fn);else delete S.finans;if(y.a)S.orvA=JSON.parse(y.a);else delete S.orvA;FE.ui=JSON.parse(y.ui)}
 return R};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__fuzulevTest()}catch(e){y=[{n:'FuzulEv: test çöktü',ok:false,m:e.message}]}return x.concat(y)})}})();
// Ekran görüntüsü (smoke): uydurma sözleşme
(function(){var sr=window.__smokeRoutes,sg=window.__smokeGo;window.__smokeRoutes=function(){return sr().concat([['orvfe','','']])};
 window.__smokeGo=function(r){if(r[0]!='orvfe')return sg(r);try{var b=OA.bugunKey(),p2=function(n){return String(n).padStart(2,'0')},ek=function(m,g){var x=new Date(+b.slice(0,4),+b.slice(5,7)-1+m,g);return x.getFullYear()+'-'+p2(x.getMonth()+1)+'-'+p2(x.getDate())};
  OA.st().fuzulev={};FE.iceUygula({soz:{plan:'Örnek Esnek Plan',planKod:'ORN-01',sozNo:'000-TEST',tarih:ek(-4,10),kampanya:'Örnek',finTur:'Konut',bedel:240000,orgUcret:18000,pesinat:0,taksitSay:10,teslimat:6,durum:'Kesin Kayıt'},
   taksit:[1,2,3,4,5,6,7,8,9,10].map(function(i){return{no:i,tur:i<6?'Tasarruf':i==6?'Tahsisat':'Finansman',vade:ek(i-5,10),tutar:i<4?null:i<6?15000:i==6?30000:20000,odendi:i<4}})});
  FE.ui={suz:'tum',edit:null,yeni:false};try{ORV.zpTog(false)}catch(e){}ORV.git0('fuzulev');var c=document.getElementById('ct');if(c)c.scrollTop=0;return new Promise(function(res){setTimeout(function(){res({})},900)})}catch(e){return {error:e.message}}}})();
