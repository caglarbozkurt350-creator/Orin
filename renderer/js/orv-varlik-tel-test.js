// Orvane 0.9.14 · Altın Hesabım + FuzulEv telefon özeti smoke testleri (yalnız `electron . --smoke`). Uydurma veri; ağ yok; durum geri alınır.
window.__varlikTelTest=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:'Telefon özeti (altın/FuzulEv): '+n,ok:!!ok,m:ok?'':String(typeof m=='function'?m():m||'beklenmeyen sonuç')})}catch(e){R.push({n:'Telefon özeti (altın/FuzulEv): '+n,ok:false,m:e.message})}}
 var y={a:S.orvA?JSON.stringify(S.orvA):null,fn:S.finans?JSON.stringify(S.finans):null,ag:AH._ag},toast0=window.toast;
 var p2=function(n){return String(n).padStart(2,'0')};
 function gunEk(s,d){var x=new Date(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10)+d);return x.getFullYear()+'-'+p2(x.getMonth()+1)+'-'+p2(x.getDate())}
 var HAM={ham:{GRA:{Buying:1000,Selling:1010,Change:1.5},CEYREKALTIN:{Buying:1600,Selling:1650,Change:-0.5},CUMHURIYETALTINI:{Buying:6500,Selling:6600,Change:0}},kaynak:'Truncgil',tarih:'2030-01-02 10:00:00',alindi:Date.now()};
 try{
  window.toast=function(){};
  var bugun=OA.bugunKey();delete S.finans;S.orvA={cep:{c:30,e:20}};AH._ag=null;
  var oz=bulutOzet();
  t('Veri yokken bloklar gönderilmez',oz.aile&&oz.aile.altin===undefined&&oz.aile.fuzulev===undefined);

  // Altın: uydurma iki kayıt
  var k1=AH.ekle({tur:'gram',miktar:'10',alis:'9.000',tarih:gunEk(bugun,-200),not:'Deneme'}),k2=AH.ekle({tur:'ceyrek',miktar:'2',alis:'',tarih:''});
  AH.st().fiyat=AH.fiyatOku(HAM);
  var once=JSON.stringify(OA.st().altin.kalem),al=bulutOzet().aile.altin,T=AH.hesap();
  t('Altın: kayıtlar (tür, miktar, işlem tarihi, alış) gider',al&&al.kalem.length==2&&al.kalem[0].tur=='gram'&&al.kalem[0].miktar==10&&al.kalem[0].tarih==k1.tarih&&al.kalem[0].alis==9000&&al.kalem[0].birim=='gr'&&al.kalem[1].birim=='adet'&&al.kalem[1].alis===null,function(){return JSON.stringify(al)});
  t('Altın: toplam değer, bozdurma, kâr/zarar masaüstüyle aynı',al.top.deger==T.deger&&al.top.deger==10*1010+2*1650&&al.top.bozdur==T.bozdur&&al.top.kar==T.kar&&al.top.kar==10100-9000&&al.top.karP==T.karP);
  t('Altın: güncel fiyatlar (satış, alış, günlük %) ve ana türler',al.fiyat&&al.fiyat.t.gram[0]==1010&&al.fiyat.t.gram[1]==1000&&al.fiyat.t.gram[2]==1.5&&al.fiyat.t.ceyrek[2]==-0.5&&al.fiyat.t.cumhuriyet[0]==6600&&!al.fiyat.t.yarim&&al.fiyat.kaynak=='Truncgil');
  t('Altın: alım gücü verisi yokken null (uydurma oran yok)',al.ag===null);
  var tf={};tf[gunEk(bugun,-200).slice(0,7)]=100;var d=new Date(),x=new Date(d.getFullYear(),d.getMonth()-1,1);tf[x.getFullYear()+'-'+p2(x.getMonth()+1)]=120;
  var kur={};kur[k1.tarih]={usd:30,eur:33,d:k1.tarih};AH._ag=AH.agOku({tufe:tf,kur:kur,bugun:{usd:36,eur:39,d:bugun}});
  var ag=bulutOzet().aile.altin.ag,A=AH.alimGucu(AH.hesap(),AH._ag);
  t('Altın: alım gücü özeti (nominal, reel, dolar/euro) masaüstüyle aynı',ag&&ag.satir.length==1&&ag.satir[0].id==k1.id&&ag.satir[0].nominal==A.satir.filter(function(o){return o.id==k1.id})[0].nominal&&ag.top.reel==A.top.reel&&ag.top.usd==10800&&ag.guncel==1,function(){return JSON.stringify(ag)});
  t('Altın: özet kayıtları değiştirmez',JSON.stringify(OA.st().altin.kalem)==once);

  // FuzulEv: uydurma sözleşme (3. taksit 3 gün gecikmiş, 4. teslimat)
  FE.iceUygula({soz:{plan:'Örnek Plan',planKod:'ORN-01',sozNo:'000-TEST',tarih:gunEk(bugun,-60),finTur:'Konut',bedel:'120.000',taksitSay:6,teslimat:4,durum:'Kesin Kayıt'},
   taksit:[{no:1,tur:'Tasarruf',vade:gunEk(bugun,-60),tutar:5000,odendi:true},{no:2,tur:'Tasarruf',vade:gunEk(bugun,-30),tutar:null,odendi:true},{no:3,tur:'Tasarruf',vade:gunEk(bugun,-3),tutar:'11.000'},
    {no:4,tur:'Tahsisat',vade:gunEk(bugun,27),tutar:'13.000'},{no:5,tur:'Finansman',vade:gunEk(bugun,57),tutar:7000},{no:6,tur:'Finansman',vade:gunEk(bugun,87),tutar:null}]});
  var feOnce=JSON.stringify(OA.st().fuzulev),fe=bulutOzet().aile.fuzulev,H=FE.hesap(bugun);
  t('FuzulEv: sözleşme özeti gider; sözleşme no ve plan kodu gitmez',fe&&fe.soz.plan=='Örnek Plan'&&fe.soz.bedel==120000&&fe.soz.teslimat==4&&fe.soz.sozNo===undefined&&fe.soz.planKod===undefined);
  t('FuzulEv: taksitler (no, tür, vade, tutar, ödenen, kalan, durum)',fe.taksit.length==6&&fe.taksit[0][0]==1&&fe.taksit[0][6]=='odendi'&&fe.taksit[1][3]===null&&fe.taksit[1][6]=='girilmedi'&&fe.taksit[2][6]=='gecikti'&&fe.taksit[2][7]==3&&fe.taksit[3][5]==13000&&fe.taksit[5][5]===null,function(){return JSON.stringify(fe.taksit)});
  t('FuzulEv: ödenen, kalan ve eksik tutar sayıları masaüstüyle aynı',fe.ozet.odenen==H.odenen&&fe.ozet.odenen==5000&&fe.ozet.odenenEksik==1&&fe.ozet.kalan==H.kalan&&fe.ozet.kalan==31000&&fe.ozet.kalanEksik==1&&fe.ozet.ilerleme==33);
  t('FuzulEv: gecikme uyarısı verisi (3. taksit, 3 gün)',fe.geciken.length==1&&fe.geciken[0].no==3&&fe.geciken[0].gun==3&&fe.geciken[0].tutar==11000);
  t('FuzulEv: sonraki ödeme ve teslimat',fe.sonraki&&fe.sonraki.no==4&&fe.sonraki.gun==27&&fe.teslim&&fe.teslim.no==4&&fe.teslim.taksit==2&&fe.teslim.gun==27&&fe.son.no==6);
  t('FuzulEv: özet taksitleri değiştirmez',JSON.stringify(OA.st().fuzulev)==feOnce);

  // Aile profili ve veri tasarrufu
  t('Eşin özetine altın ve FuzulEv gitmez',function(){var e=OAI.esOzet(),s=JSON.stringify(e);return e.aile&&e.aile.altin===undefined&&e.aile.fuzulev===undefined&&s.indexOf('Örnek Plan')<0&&s.indexOf(k1.id)<0});
  t('Veri tasarrufu: değişiklik yokken özet aynı kalır (zaman damgası yok)',JSON.stringify(bulutOzet().aile)==JSON.stringify(bulutOzet().aile));
  var a1=JSON.stringify(bulutOzet().aile.altin);AH.guncelle(k2.id,{tur:'ceyrek',miktar:'3',alis:'',tarih:''});
  t('Veri tasarrufu: kayıt değişince özet değişir',JSON.stringify(bulutOzet().aile.altin)!=a1&&bulutOzet().aile.altin.top.deger==10*1010+3*1650);
  AH.silKayit(k1.id);AH.silKayit(k2.id);OA.st().fuzulev={};
  t('Kayıtlar silinince bloklar özetten kalkar',function(){var o=bulutOzet().aile;return o.altin===undefined&&o.fuzulev===undefined});
 }catch(e){t('test',false,e.stack)}
 finally{window.toast=toast0;if(y.a)S.orvA=JSON.parse(y.a);else delete S.orvA;if(y.fn)S.finans=JSON.parse(y.fn);else delete S.finans;AH._ag=y.ag}
 return R};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__varlikTelTest()}catch(e){y=[{n:'Telefon özeti (altın/FuzulEv): test çöktü',ok:false,m:e.message}]}return x.concat(y)})}})();
