// Orvane 0.9.12 · Aile Bütçesi kural testleri (yalnız `electron . --smoke`). Uydurma tutarlar, kişisel veri yok; durum sonunda geri alınır.
// Kapsam: gelir ≤ Net Ödenen + SGK, bakiye bildirimi, kasaya işleme (ekle/düzelt/sil), telefon ve eşten çift sayım, bordro maaşı,
// kayıt dışı satırı, geçmiş ay net 0, içe aktarma, kuruş yuvarlaması, eksi bakiye, Anasayfa/cep/Otto özetleri, salt okunur denetim.
window.__butceKuralTest=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:'Bütçe kuralı: '+n,ok:!!ok,m:ok?'':String(typeof m=='function'?m():m||'beklenmeyen sonuç')})}catch(e){R.push({n:'Bütçe kuralı: '+n,ok:false,m:e.message})}}
 var y={fn:S.finans?JSON.stringify(S.finans):null,a:S.orvA?JSON.stringify(S.orvA):null,br:S.bordro?JSON.stringify(S.bordro):null,ui:JSON.stringify(GG.ui)};
 var toast0=window.toast,toastlar=[];
 function bak(k){var b=OA.st().bak[k];return b?b.t:null}
 function kay(id){return fnS().kayit.filter(function(x){return x.id==id})[0]}
 function yeni(){var bugun=OA.bugunKey(),now=Date.now()-5000;delete S.finans;S.bordro={aylar:[]};
  S.orvA={cep:{c:20,e:20,mod:'bakiye'},bak:{aile:{t:10000,ts:now,bts:now,kim:'test'},cagla:{t:1000,ts:now,bts:now,kim:'test'},kubra:{t:500,ts:now,bts:now,kim:'test'}},odeme:[],hareket:[]};OA.st();return bugun}
 function kalan(){return Math.round((bak('aile')-bak('cagla')-bak('kubra'))*100)/100}
 function dlgKaydet(tur,kim,tutar,tarih){fnDlg(tur);document.getElementById('fnk').value=kim;document.getElementById('fnu').value=String(tutar);document.getElementById('fnl').value=tur=='gelir'?'Ek gelir':'Market';document.getElementById('fnd').value=tarih;fnKaydetDlg();try{cfNo()}catch(e){}}
 try{
  window.toast=function(m){toastlar.push(String(m))};
  var bugun=yeni(),ay=bugun.slice(0,7),onc=GG.ayKay(ay,-1),onc2=GG.ayKay(ay,-2);

  // ---------- 1) Gelir üst sınırı: Net Ödenen + SGK ödeneği ----------
  S.bordro.aylar=[{ay:onc,h:{},v:{net:30000,sgkOdenek:5000},duz:{}}];
  t('Sınır = önceki ayın bordrosu Net Ödenen + SGK ödeneği (30.000 + 5.000)',function(){var s=BKR.sinir(ay);return s&&s.sinir==35000&&s.bordroAy==onc&&!BKR.sinir(onc)});
  var g1=GG.ekle({tur:'gelir',kalem:'Ek gelir',tarih:bugun,not:'Örnek',kisi:'cagla',kasa:'aile',tutar:'34000'});
  t('Sınırın altındaki gelir eklenir',!!g1&&bak('aile')==44000);
  var g2=GG.ekle({tur:'gelir',kalem:'Ek gelir',tarih:bugun,not:'Fazla',kisi:'cagla',kasa:'aile',tutar:'1500,50'});
  t('Sınırı aşan gelir eklenmez, bakiye değişmez, sebep yazılır',!g2&&bak('aile')==44000&&toastlar.some(function(m){return /Bordro sınırını geçemez/.test(m)&&/35\.000/.test(m)}),function(){return toastlar.join(' | ')});
  t('Sınıra tam eşit gelir kabul edilir (1.000 → toplam 35.000)',function(){var r=GG.ekle({tur:'gelir',kalem:'Ek gelir',tarih:bugun,not:'Tam',kisi:'cagla',kasa:'aile',tutar:'1000'});var ok=!!r&&BKR.gelir(ay)==35000;if(r)GG.silKayit(r.id);return ok});
  t('Düzenleme: geliri sınırın üstüne çıkaran düzeltme reddedilir, kayıt aynı kalır',function(){var r=GG.guncelle(g1.id,{tur:'gelir',kalem:'Ek gelir',tarih:bugun,not:'Örnek',kisi:'cagla',kasa:'aile',tutar:'36000'});return !r&&kay(g1.id).tutar==34000&&bak('aile')==44000});
  t('Düzenleme: aynı kaydın tutarı sınır içinde değişebilir (eski tutarı sayılmaz)',function(){var r=GG.guncelle(g1.id,{tur:'gelir',kalem:'Ek gelir',tarih:bugun,not:'Örnek',kisi:'cagla',kasa:'aile',tutar:'35000'});return !!r&&bak('aile')==45000});
  t('Gelir/gider ekle penceresi de sınırı uygular (Şirket geliri hariç)',function(){var n=fnS().kayit.length;dlgKaydet('gelir','cagla',200,bugun);var a=fnS().kayit.length==n;dlgKaydet('gelir','sirket',200,bugun);var b=fnS().kayit.length==n+1;fnS().kayit=fnS().kayit.filter(function(x){return x.kim!='sirket'});return a&&b});
  t('Bordrosu olmayan ayda sınır yok',function(){var r=GG.ekle({tur:'gelir',kalem:'Ek gelir',tarih:onc+'-10',not:'Eski',kisi:'cagla',kasa:'aile',tutar:'99999'});var ok=!!r;if(r)GG.silKayit(r.id);return ok});
  t('Dashboard gelir kartı sınırı gösterir',function(){GG.ui.sek='pano';GG.ui.ay=null;ORV.git0('aylikbutce');var e=document.querySelector('#ggKok .gg-sn');return e&&+e.getAttribute('data-sinir')==35000&&!e.classList.contains('asim')});
  // Kayıt dışı gelir (mevcut kural) sınırı aşabilir: engellenmez, uyarılır
  t('Bakiye bildirimiyle kayıt dışı gelir sınırı aşarsa engellenmez ama Dashboard ve denetim uyarır',function(){var s=OA.bakBildir('aile',bak('aile')+700,'test');GG.govdeYenile(false);var e=document.querySelector('#ggKok .gg-sn.asim'),D=BKR.denetle();
   return s.kayit&&s.kayit.kalem=='Kayıt dışı gelir'&&s.fark==700&&!!e&&/700/.test(e.textContent)&&D.some(function(b){return b.kod=='gelir-siniri'&&b.ay==ay&&b.tutar==700&&b.kayitlar.some(function(k){return k.kalem=='Kayıt dışı gelir'})})&&D.some(function(b){return b.kod=='bildirim-gelir'})});
  t('Denetim çift maaşı bulur (bordro maaşı + içe aktarılan "Maaş" aynı ayda)',function(){var b1=fnKaydet({tur:'gelir',kim:'cagla',tutar:'30000',kalem:'Maaş · Örnek',tarih:onc2+'-05',not:'Bordrodan'},'br'+GG.ayKay(onc2,-1)),b2=fnKaydet({tur:'gelir',kim:'cagla',tutar:'30000',kalem:'Maaş',tarih:onc2+'-06',not:'Banka',kaynak:'banka'});
   var D=BKD.denetle(BKR.st(),ay),ok=D.some(function(b){return b.kod=='cift-maas'&&b.ay==onc2&&b.kayitlar.length==2});fnS().kayit=fnS().kayit.filter(function(x){return x!==b1&&x!==b2});return ok});

  // ---------- 2) Bakiye bildirimi ----------
  bugun=yeni();
  var u1=fnKaydet({tur:'gider',kim:'cagla',tutar:'300',kalem:'Market',tarih:bugun,not:'İşlenmemiş örnek'});
  t('Beklenen = son bildirilen + gelirler − giderler (işlenmemiş kayıt dahil)',OA.bakBeklenen('aile')==9700);
  t('Düşük bildirim: fark Kayıt dışı harcama, bildirilen tutar gelire eklenmez',function(){var g0=BKR.gelir(ay),s=OA.bakBildir('aile',9500,'test');return s.fark==-200&&s.kayit.kalem=='Kayıt dışı harcama'&&s.kayit.tur=='gider'&&BKR.gelir(ay)==g0&&bak('aile')==9500});
  t('Bildirimden sonra aynı hareketler ikinci kez sayılmaz',OA.bakBeklenen('aile')==9500);
  t('Yüksek bildirim: yalnız fark (bildirilenin tamamı değil) Kayıt dışı gelir olur',function(){var g0=BKR.gelir(ay),s=OA.bakBildir('aile',9600,'test');return s.fark==100&&s.kayit.tur=='gelir'&&Math.round((BKR.gelir(ay)-g0)*100)/100==100});
  t('Kayıt dışı satırını düzenlemek ve silmek bakiyeyi değiştirmez',function(){var k=fnS().kayit.filter(function(x){return x.kalem=='Kayıt dışı harcama'})[0],b0=bak('aile');GG.guncelle(k.id,{tur:'gider',kalem:'Kayıt dışı harcama',tarih:k.tarih,not:'düzeltildi',kisi:'ortak',kasa:'aile',tutar:'50'});var a=bak('aile')==b0&&kay(k.id).tutar==50;GG.silKayit(k.id);return a&&bak('aile')==b0&&!kay(k.id)});
  t('Cep bakiyesi bildirimi: fark cebe ve Aile Bütçesine birlikte yansır (Aile Bütçesi = cepler + kalan)',function(){var k0=kalan(),s=OA.bakBildir('cagla',900,'test');return s.fark==-100&&bak('cagla')==900&&kalan()==k0});

  // ---------- 3) Girilen her kayıt kasasına işlenir; silinince geri alınır ----------
  bugun=yeni();
  t('Gelir/gider ekle penceresi: gider Aile Bütçesinden düşer, kayıt işaretli',function(){var n=fnS().kayit.length;dlgKaydet('gider','cagla',250,bugun);var r=fnS().kayit[n];return r&&r.bakDus=='aile'&&bak('aile')==9750&&OA.bakBeklenen('aile')==9750});
  t('Kübra harcaması: kayıt olur, Kübra ve Aile Bütçesi bir kez düşer, kalan değişmez',function(){var k0=kalan();OA.dlg('<input id="oaKt" value="120"><input id="oaKa" value="Kırtasiye">');OA.kubraKaydet();var r=fnS().kayit.filter(function(x){return x.hk=='e'})[0];
   return r&&r.bakDus=='kubra'&&r.kisi=='kubra'&&bak('kubra')==380&&bak('aile')==9630&&kalan()==k0&&OA.hareketler().filter(function(h){return /Kırtasiye/.test(h.alt||'')||/Kübra · Kırtasiye/.test(h.ad||'')}).length==1});
  t('Kübra harcaması cep kullanımına ve Aylık Bütçe gider toplamına girer',function(){var C=OA.cep(OA.fin());return C.e.harcanan==120&&GG.veri(ay).gd==370&&GG.veri(ay).kisiT.kubra==120});
  t('Kübra cebi %0 iken harcaması yalnız Aile Bütçesinden düşer',function(){OA.st().cep.e=0;var kb=bak('kubra'),ab=bak('aile');OA.dlg('<input id="oaKt" value="80"><input id="oaKa" value="Örnek">');OA.kubraKaydet();var r=fnS().kayit.filter(function(x){return x.kalem=='Aile Bütçesi · Kübra'})[0];var ok=r&&r.bakDus=='aile'&&bak('kubra')==kb&&bak('aile')==ab-80;OA.st().cep.e=20;return ok});
  t('Cep harcaması kayda gerçek kasa adıyla işaretlenir (1 değil)',function(){OA.dlg('<input id="oaHt" value="40"><input id="oaHa" value="Kahve">');OA.harcamaKaydet('c');var r=fnS().kayit.filter(function(x){return x.not=='Kahve'})[0];return r&&r.bakDus=='cagla'&&bak('cagla')==960});
  t('Beklenen ödeme "ödendi": Aile Bütçesinden düşer, bekleyen listeden çıkar',function(){var o={id:'od1',ad:'Örnek fatura',tutar:330,tarih:bugun,odendi:false};OA.st().odeme.push(o);var ab=bak('aile');OA.odendi('od1');var r=fnS().kayit.filter(function(x){return x.kalem=='Örnek fatura'})[0];return r&&r.bakDus=='aile'&&bak('aile')==ab-330&&o.odendi&&!OA.odemeler().length});
  t('Şirketim listesinden silme: bakiyeye işlenmiş etkisi geri alınır',function(){var r=fnS().kayit.filter(function(x){return x.kalem=='Örnek fatura'})[0],ab=bak('aile');var ok=BKR.silHer(r.id);return ok&&!kay(r.id)&&bak('aile')==ab+330&&/BKR\.silHer/.test(String(fnSil))});
  t('Kuruş: 10,10 + 20,20 eklenip silinince bakiye tam eski değerine döner',function(){var b0=bak('aile'),a=GG.ekle({tur:'gider',kalem:'Market',tarih:bugun,not:'k1',kisi:'ortak',kasa:'aile',tutar:'10,10'}),b=GG.ekle({tur:'gider',kalem:'Market',tarih:bugun,not:'k2',kisi:'ortak',kasa:'aile',tutar:'20,20'});
   var ara=bak('aile')==Math.round((b0-30.3)*100)/100;GG.silKayit(a.id);GG.silKayit(b.id);return ara&&bak('aile')===b0});
  t('Düzenle: tür, tutar ve kasa değişimi fark olarak işlenir; toplam kasa tutarlı',function(){var k0=kalan(),r=GG.ekle({tur:'gider',kalem:'Ulaşım',tarih:bugun,not:'d',kisi:'cagla',kasa:'cagla',tutar:'100'});var a=kalan()==k0;
   GG.guncelle(r.id,{tur:'gider',kalem:'Ulaşım',tarih:bugun,not:'d',kisi:'kubra',kasa:'kubra',tutar:'100'});var b=kalan()==k0&&kay(r.id).bakDus=='kubra';GG.guncelle(r.id,{tur:'gider',kalem:'Ulaşım',tarih:bugun,not:'d',kisi:'ortak',kasa:'aile',tutar:'60'});var c=kalan()==k0-60;GG.silKayit(r.id);return a&&b&&c&&kalan()==k0});
  t('Eksi bakiye: büyük harcama bakiyeyi eksiye indirir (kırpılmaz), denetim uyarır',function(){var r=GG.ekle({tur:'gider',kalem:'Ev',tarih:bugun,not:'büyük',kisi:'cagla',kasa:'cagla',tutar:'5000'});var ok=bak('cagla')<0&&BKR.denetle().some(function(b){return b.kod=='negatif'});GG.silKayit(r.id);return ok&&bak('cagla')>0});

  // ---------- 4) Telefon ve eş: çift sayım yok ----------
  bugun=yeni();
  t('Çağlar’ın telefonu: aynı kayıt iki kez gelse de bir kez yazılır ve bir kez işlenir',function(){var e={id:'tel-kural-1',tur:'finans_kayit',ts:Date.now(),veri:{tur:'gider',kim:'cagla',tutar:250,kalem:'Market',tarih:bugun}};bulutUygula(e);bulutUygula(e);
   return fnS().kayit.filter(function(x){return x.id=='tel-kural-1'}).length==1&&bak('aile')==9750&&kay('tel-kural-1').bakDus=='aile'&&OA.bakBeklenen('aile')==9750});
  t('Çağlar’ın telefonu, cep: Çağlar cebi ve Aile Bütçesi bir kez düşer',function(){var e={id:'tel-kural-2',tur:'finans_kayit',ts:Date.now(),veri:{tur:'gider',kim:'cagla',tutar:50,kalem:'Kahve',tarih:bugun,hk:'c'}};bulutUygula(e);bulutUygula(e);return bak('cagla')==950&&bak('aile')==9700&&kay('tel-kural-2').hk=='c'});
  t('Eşin telefonu: aynı harcama iki kez gelse de bir kez işlenir',function(){var e={id:'es-kural-1',tur:'es_harcama',ts:Date.now(),veri:{tutar:70,kasa:'cep',kat:'Market',ad:'Örnek',tarih:bugun}};OAI.uygula(e,'es');OAI.uygula(e,'es');
   return fnS().kayit.filter(function(x){return x.id=='fnes-kural-1'}).length==1&&bak('kubra')==430&&bak('aile')==9630&&OA.bakBeklenen('kubra')==430});
  t('Otto/telefon özeti (OT9.butceAy) aynı gideri bir kez sayar',function(){var o=OT9.butceAy(ay);return Math.round(o.gider)==370});

  // ---------- 5) Bordro maaşı ----------
  bugun=yeni();
  t('Maaş, bordro ayının ertesi ayının 5’ine yazılır',BR.odemeTarih('2026-12')=='2027-01-05'&&BR.odemeTarih('2026-03')=='2026-04-05');
  t('Maaş bir kez eklenir; ay silinip yeniden içe aktarılsa da ikinci kez eklenmez; Net düzeltmesinde yalnız fark işlenir',function(){var m={ay:onc,h:{},v:{net:20000},duz:{}};S.bordro.aylar=[m];var e1=BR.butceEkle(m,true),r=kay('br'+onc),ts0=r&&r.ts,a1=bak('aile');
   delete m.butce;BR.butceEkle(m,true);var a2=bak('aile');m.v.net=20500;BR.butceEkle(m);var a3=bak('aile');
   return e1&&r.tarih==BR.odemeTarih(onc)&&a1==30000&&a2==30000&&a3==30500&&kay('br'+onc).tutar==20500&&kay('br'+onc).ts==ts0&&fnS().kayit.filter(function(x){return /^br/.test(x.id)}).length==1});
  t('Maaş satırı Aylık Bütçe’de kilitli; silinemez',function(){return GG.kilit(kay('br'+onc))&&!GG.silKayit('br'+onc)&&!!kay('br'+onc)});
  t('Maaş kaydı başka yerden silinirse bakiye geri alınır ve bordro bağlantısı kalkar',function(){var m=S.bordro.aylar[0],ok=BKR.silHer('br'+onc);return ok&&!kay('br'+onc)&&bak('aile')==10000&&!m.butce});

  // ---------- 6) İçe aktarma ve geçmiş aylar ----------
  bugun=yeni();
  t('İçe aktarılan banka kayıtları bakiyeye işlenmez ve bildirimde sayılmaz (bakiye anlık durumdur)',function(){var n=OA.iceUygula({kayit:[{id:'ice-k1',tur:'gider',kalem:'Market',tutar:400,tarih:bugun},{id:'ice-k2',tur:'gider',kalem:'Fatura',tutar:600,tarih:onc+'-10'}]});
   return n.k==2&&kay('ice-k1').bakEk=='banka'&&bak('aile')==10000&&OA.bakBeklenen('aile')==10000});
  t('Eski sürümde işaretsiz kalmış banka kaydı da bildirimde sayılmaz',function(){var r=fnKaydet({tur:'gider',kim:'cagla',tutar:'999',kalem:'Market',tarih:bugun,kaynak:'banka'},'ice-eski');return r&&!r.bakEk&&OA.bakBeklenen('aile')==10000});
  // Kapanmış geçmiş ay: gelir 5.000, bilinen gider 1.000, kayıt dışı harcama 4.000 → net 0
  fnKaydet({tur:'gelir',kim:'cagla',tutar:'5000',kalem:'Ek gelir',tarih:onc2+'-05',kaynak:'banka'},'gk-g');fnKaydet({tur:'gider',kim:'cagla',tutar:'1000',kalem:'Market',tarih:onc2+'-07',kaynak:'banka'},'gk-c');
  var kd=fnKaydet({tur:'gider',kim:'cagla',tutar:'4000',kalem:'Kayıt dışı harcama',tarih:onc2+'-05',not:'Ay sonu sıfırlama',kaynak:'bakiye'},'gk-kd');kd.kd='aile';kd.bakEk='aile';
  t('Geçmiş ay net 0 ve kapalı sayılır',BKR.ayNet(onc2)==0&&BKR.kapali(onc2)&&!BKR.kapali(ay));
  t('Kapalı aya bulunan fiş eklenir: bakiye değişmez, kayıt dışı harcama azalır, net 0 kalır',function(){var r=GG.ekle({tur:'gider',kalem:'Sağlık',tarih:onc2+'-12',not:'fiş bulundu',kisi:'ortak',kasa:'aile',tutar:'250'});return r&&r.bakEk=='gecmis'&&!r.bakDus&&bak('aile')==10000&&kay('gk-kd').tutar==3750&&BKR.ayNet(onc2)==0});
  t('Kapalı ayda düzeltme ve silme de net 0’ı korur, bakiye değişmez',function(){var r=fnS().kayit.filter(function(x){return x.not=='fiş bulundu'})[0];GG.guncelle(r.id,{tur:'gider',kalem:'Sağlık',tarih:r.tarih,not:'fiş bulundu',kisi:'ortak',kasa:'aile',tutar:'400'});var a=BKR.ayNet(onc2)==0&&kay('gk-kd').tutar==3600;
   GG.silKayit(r.id);return a&&BKR.ayNet(onc2)==0&&kay('gk-kd').tutar==4000&&bak('aile')==10000});
  t('Kapalı aya gelir eklenirse kayıt dışı harcama artar, net 0 kalır',function(){var r=GG.ekle({tur:'gelir',kalem:'Ek gelir',tarih:onc2+'-20',not:'unutulan',kisi:'cagla',kasa:'aile',tutar:'150'});var ok=r&&kay('gk-kd').tutar==4150&&BKR.ayNet(onc2)==0&&bak('aile')==10000;GG.silKayit(r.id);return ok&&kay('gk-kd').tutar==4000});
  t('Denetim: net 0 olmayan geçmiş ayı bildirir, kapalı ayı bildirmez',function(){var x=fnKaydet({tur:'gider',kim:'cagla',tutar:'10',kalem:'Market',tarih:onc+'-03',kaynak:'banka'},'gk-acik');var D=BKR.denetle();fnS().kayit=fnS().kayit.filter(function(k){return k!==x});return D.some(function(b){return b.kod=='gecmis-net'&&b.ay==onc})&&!D.some(function(b){return b.kod=='gecmis-net'&&b.ay==onc2})});
  t('Denetim salt okunur: durumu değiştirmez',function(){var a=JSON.stringify(S.finans)+JSON.stringify(S.orvA)+JSON.stringify(S.bordro);BKR.denetle();return a==JSON.stringify(S.finans)+JSON.stringify(S.orvA)+JSON.stringify(S.bordro)});
 }catch(e){t('test çöktü',false,e.stack)}
 finally{window.toast=toast0;if(y.fn)S.finans=JSON.parse(y.fn);else delete S.finans;if(y.a)S.orvA=JSON.parse(y.a);else delete S.orvA;if(y.br)S.bordro=JSON.parse(y.br);else delete S.bordro;GG.ui=JSON.parse(y.ui);try{cfNo()}catch(e){}}
 return R};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__butceKuralTest()}catch(e){y=[{n:'Bütçe kuralı: test çöktü',ok:false,m:e.message}]}return x.concat(y)})}})();
