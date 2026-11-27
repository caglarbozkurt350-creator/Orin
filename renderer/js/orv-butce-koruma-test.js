// Orvane 0.9.13 · "Gelir eklemeden gelir artmaz" testleri (yalnız `electron . --smoke`). Uydurma tutarlar, kişisel veri yok; durum sonunda geri alınır.
// Kapsam: aç/kapa + eşitleme + ay değişimi, telefon ve eş geliri (sınır), silinen kaydın geri gelmemesi, Elle düzeltme yuvarlaması,
// cep isteği tekrarı, İçe Aktar bakiyesi, çift maaş, SGK alanı, FuzulEv, 0.9.11'in bakiye bildirimi hatası.
window.__butceKorumaTest=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:'Gelir koruması: '+n,ok:!!ok,m:ok?'':String(typeof m=='function'?m():m||'beklenmeyen sonuç')})}catch(e){R.push({n:'Gelir koruması: '+n,ok:false,m:e.message})}}
 var y={fn:S.finans?JSON.stringify(S.finans):null,a:S.orvA?JSON.stringify(S.orvA):null,br:S.bordro?JSON.stringify(S.bordro):null,ui:JSON.stringify(GG.ui),bui:JSON.stringify(BR.ui),dv:BKD.DEVIR,bk:OA.bugunKey};
 var toast0=window.toast,toastlar=[];
 var p2=function(n){return String(n).padStart(2,'0')},r2t=function(n){return Math.round(n*100)/100};
 function bak(k){var b=OA.st().bak[k];return b?b.t:null}
 function kay(id){return fnS().kayit.filter(function(x){return x.id==id})[0]}
 function yeni(){var now=Date.now()-5000;delete S.finans;S.bordro={aylar:[]};
  S.orvA={cep:{c:20,e:20,mod:'bakiye'},bak:{aile:{t:10000,ts:now,bts:now,kim:'test'},cagla:{t:1000,ts:now,bts:now,kim:'test'},kubra:{t:500,ts:now,bts:now,kim:'test'}},odeme:[],hareket:[]};OA.st();fnS()}
 function durum(ay){var T=OA.ayToplam(ay);return {aile:bak('aile'),cagla:bak('cagla'),kubra:bak('kubra'),gelir:T.gelir,gider:T.gider,n:GG.kayitlar().length}}
 function ayni(a,b){return JSON.stringify(a)==JSON.stringify(b)}
 function sayfalar(){['aylikbutce','butce','bordro','fuzulev'].forEach(function(id){if(ORV.altBul(id))ORV.git0(id)})}
 try{
  window.toast=function(m){toastlar.push(String(m))};BKD.DEVIR='2999-01';yeni();
  var bugun=OA.bugunKey(),ay=bugun.slice(0,7),onc=GG.ayKay(ay,-1),son=GG.ayKay(ay,1);

  // ---------- Örnek ay: önceki ayın bordrosu Net 30.000 + SGK 5.000 → bu ayın sınırı 35.000 ----------
  var m=({ay:onc,h:{},v:{net:30000,sgkOdenek:5000},duz:{}});S.bordro.aylar=[m];
  BR.butceEkle(m,true);
  var sgk=GG.ekle({tur:'gelir',kalem:'SGK rapor ödeneği',tarih:bugun,not:'Örnek',kisi:'cagla',kasa:'aile',tutar:'5000'});
  GG.ekle({tur:'gider',kalem:'Market',tarih:bugun,not:'Örnek',kisi:'ortak',kasa:'aile',tutar:'1200'});
  t('Hazırlık: maaş 30.000 + SGK 5.000 eklendi, gelir = sınır = 35.000',function(){return BKR.gelir(ay)==35000&&BKR.sinir(ay).sinir==35000&&!!sgk&&bak('aile')==43800},function(){return JSON.stringify(durum(ay))});

  // Telefon olayları (Çağlar ve eşi): bir kez uygulanır
  var olaylar=[
   {f:'bulut',e:{id:'kor-tel-1',tur:'finans_kayit',ts:Date.now(),veri:{tur:'gider',kim:'cagla',tutar:150,kalem:'Market',tarih:bugun}}},
   {f:'bulut',e:{id:'kor-tel-2',tur:'finans_kayit',ts:Date.now(),veri:{tur:'gider',kim:'cagla',tutar:40,kalem:'Kahve',tarih:bugun,hk:'c'}}},
   {f:'es',e:{id:'kor-es-1',tur:'es_harcama',ts:Date.now(),veri:{tutar:60,kasa:'cep',kat:'Market',ad:'Örnek',tarih:bugun}}},
   {f:'es',e:{id:'kor-es-2',tur:'es_cep_iste',ts:Date.now(),veri:{tutar:300}}},
   {f:'bulut',e:{id:'kor-tel-3',tur:'cep_iste',ts:Date.now(),veri:{tutar:200}}}];
  function esitle(){olaylar.forEach(function(o){if(o.f=='es')OAI.uygula(o.e,'es');else bulutUygula(o.e)})}
  esitle();
  var d0=durum(ay);
  t('Telefon olayları bir kez işlenir; gelir değişmez',function(){return d0.gelir==35000&&d0.aile==43800-150-40-60&&d0.cagla==1000-40+200&&d0.kubra==500-60+300},function(){return JSON.stringify(d0)});

  // ---------- 1) Aç / kapa + eşitle + ay değiştir: gelir ve bakiye değişmez ----------
  t('Uygulamayı kapat/aç (durum diskten yeniden okunur), sayfaları gez, yeniden eşitle → gelir ve bakiye değişmez',function(){
   for(var i=0;i<3;i++){S.finans=JSON.parse(JSON.stringify(S.finans));S.orvA=JSON.parse(JSON.stringify(S.orvA));S.bordro=JSON.parse(JSON.stringify(S.bordro));
    sayfalar();esitle();BR.st().aylar.forEach(function(x){BR.butceEkle(x)});OA.iceUygula({});BKR.denetle()}
   return ayni(durum(ay),d0)},function(){return JSON.stringify(durum(ay))+' ≠ '+JSON.stringify(d0)});
  t('Bordro: “Aile Bütçesine ekle” düğmesine yeniden basmak ve ayı yeniden içe aktarmak maaşı ikinci kez eklemez',function(){var x=BR.st().aylar[0];BR.butceEkle(x,true);delete x.butce;BR.butceEkle(x,true);
   BR.yukle({aylar:[{ay:onc,h:{},v:{net:30000}}]});return ayni(durum(ay),d0)&&BKR.gelir(ay)==35000},function(){return JSON.stringify(durum(ay))});
  t('SGK ödeneği alanını düzeltmek geliri artırmaz, yalnız sınırı değiştirir',function(){BR.ui.ay=onc;ORV.git0('bordro');BR.duzenle('sgkOdenek');var e=document.getElementById('brIn0');if(!e)return false;e.value='6000';BR.kaydet();
   var ok=ayni(durum(ay),d0)&&BKR.sinir(ay).sinir==36000;BR.ui.ay=onc;BR.duzenle('sgkOdenek');document.getElementById('brIn0').value='5000';BR.kaydet();return ok&&BKR.sinir(ay).sinir==35000},function(){return JSON.stringify(durum(ay))+' sınır '+JSON.stringify(BKR.sinir(ay))});
  t('Ay değişir (devir açık): eski ayın gelir ve bakiyesi değişmez; yeni ayın geliri 0; devreden gelir sayılmaz',function(){var kal=OA.ayToplam(ay).kalan;BKD.DEVIR=ay;
   OA.bugunKey=function(){return son+'-01'};try{sayfalar();esitle();BR.st().aylar.forEach(function(x){BR.butceEkle(x)});
    S.finans=JSON.parse(JSON.stringify(S.finans));S.orvA=JSON.parse(JSON.stringify(S.orvA));sayfalar();esitle();
    var ok=ayni(durum(ay),d0)&&OA.ayToplam(son).gelir==0&&BKR.gelir(son)==0&&BKR.devreden(son)==kal&&OA.aileUst()==Math.max(0,kal);
    GG.ui.ay=null;GG.ui.sek='pano';ORV.git0('aylikbutce');var dv=document.querySelector('#ggKok .gg-dv'),k3=document.querySelector('#ggKok .gg-orta');
    return ok&&dv&&+dv.getAttribute('data-devreden')==kal&&k3&&/^0\b/.test(k3.textContent.trim())}finally{OA.bugunKey=y.bk;BKD.DEVIR='2999-01'}},function(){return JSON.stringify(durum(ay))});

  // ---------- 2) Telefondan gelen gelir de sınıra uyar ----------
  t('Çağlar’ın telefonu: sınırı aşan gelir kaydedilmez, bakiye değişmez, nedeni hareketlerde yazar; tekrar gelse de kaydedilmez',function(){var e={id:'kor-tel-g1',tur:'finans_kayit',ts:Date.now(),veri:{tur:'gelir',kim:'cagla',tutar:2500,kalem:'Ek gelir',tarih:bugun}};
   bulutUygula(e);bulutUygula(e);return !kay('kor-tel-g1')&&ayni(durum(ay),d0)&&OA.st().hareket.filter(function(h){return h.id=='srkor-tel-g1'}).length==1&&toastlar.some(function(m){return /Çağlar’ın telefonundan gelen 2\.500 ₺ gelir kaydedilmedi/.test(m)})},function(){return JSON.stringify(durum(ay))});
  t('Eşin telefonu: sınırı aşan gelir kaydedilmez (es_gelir)',function(){var e={id:'kor-es-g1',tur:'es_gelir',ts:Date.now(),veri:{tutar:900,kat:'Ek gelir',ad:'Örnek',tarih:bugun}};return OAI.uygula(e,'es')===false&&OAI.uygula(e,'es')===false&&!kay('fnkor-es-g1')&&ayni(durum(ay),d0)});
  t('Şirket geliri ve bordrosu olmayan aydaki telefon geliri eskisi gibi yazılır',function(){var e={id:'kor-tel-g2',tur:'finans_kayit',ts:Date.now(),veri:{tur:'gelir',kim:'sirket',tutar:700,kalem:'Şirket',tarih:bugun}},e2={id:'kor-tel-g3',tur:'finans_kayit',ts:Date.now(),veri:{tur:'gelir',kim:'cagla',tutar:100,kalem:'Ek gelir',tarih:GG.ayKay(ay,-3)+'-10'}};
   bulutUygula(e);bulutUygula(e2);var ok=!!kay('kor-tel-g2')&&!!kay('kor-tel-g3');fnS().kayit=fnS().kayit.filter(function(x){return x.id!='kor-tel-g2'&&x.id!='kor-tel-g3'});return ok&&ayni(durum(ay),d0)});

  // ---------- 3) Silinen kayıt geri gelmez ----------
  t('Silinen telefon kaydı yeniden eşitlenince geri gelmez',function(){var a0=bak('aile');GG.silKayit('kor-tel-1');var a1=bak('aile');esitle();var ok=!kay('kor-tel-1')&&a1==a0+150&&bak('aile')==a1;
   d0=durum(ay);return ok},function(){return JSON.stringify(durum(ay))});
  t('Silinen banka kaydı aynı dosya yeniden içe aktarılınca geri gelmez',function(){var o={kayit:[{id:'kor-ice-1',tur:'gelir',kalem:'Ek gelir',tutar:800,tarih:GG.ayKay(ay,-3)+'-03'}]};OA.iceUygula(o);var var1=!!kay('kor-ice-1');GG.silKayit('kor-ice-1');var n=OA.iceUygula(o);
   return var1&&!kay('kor-ice-1')&&n.k==0&&BKK.silindi('kor-ice-1')});
  t('Masaüstünde silinen kayıt (ör. FuzulEv taksiti) aynı kimlikle yeniden yazılabilir',function(){var r=fnKaydet({tur:'gider',kim:'cagla',tutar:'10',kalem:'Diğer',tarih:bugun,not:'x'},'kor-m-1');GG.silKayit('kor-m-1');var r2=fnKaydet({tur:'gider',kim:'cagla',tutar:'10',kalem:'Diğer',tarih:bugun,not:'x'},'kor-m-1');
   fnS().kayit=fnS().kayit.filter(function(x){return x.id!='kor-m-1'});return !!r&&!!r2});

  // ---------- 4) Aylık tablo Elle düzeltme ----------
  t('Elle düzeltme: yuvarlanmış gösterilen gelir (35.000,40 → 35.000) gider kaydedilirken kuruş farkı gelir yazmaz',function(){var r=fnKaydet({tur:'gider',kim:'cagla',tutar:'0.40',kalem:'Diğer',tarih:bugun},'kor-kurus');r.bakEk='duzeltme';
   var g=fnKaydet({tur:'gelir',kim:'cagla',tutar:'0.40',kalem:'BES çıkışı',tarih:bugun},'kor-kurus-g');g.bakEk='duzeltme';var T=OA.ayToplam(ay),gor=Math.round(T.gelir);
   var f=OA.ayDuzelt(ay,'gelir',gor),ok=f===0&&OA.ayToplam(ay).gelir==T.gelir;fnS().kayit=fnS().kayit.filter(function(x){return x.id!='kor-kurus'&&x.id!='kor-kurus-g'});return ok},function(){return JSON.stringify(OA.ayToplam(ay))});
  t('Elle düzeltme: sınırı aşan gelir artışı yazılmaz; gider düzeltmesi yazılır',function(){var g=OA.ayDuzelt(ay,'gelir',36000),T=OA.ayToplam(ay),c=OA.ayDuzelt(ay,'gider',T.gider+10);var ok=g===0&&BKR.gelir(ay)==35000&&c==10;
   fnS().kayit=fnS().kayit.filter(function(x){return !(x.kalem=='Elle düzeltme'&&String(x.tarih).slice(0,7)==ay)});return ok&&ayni(durum(ay),d0)},function(){return JSON.stringify(durum(ay))});

  // ---------- 5) Cep isteği tekrarı ----------
  t('Cep harçlığı isteği: hareket listesi kırpıldıktan sonra aynı olay yeniden gelse de ikinci kez eklenmez',function(){OA.st().hareket=[];esitle();return ayni(durum(ay),d0)},function(){return JSON.stringify(durum(ay))});

  // ---------- 6) İçe Aktar bakiyesi ----------
  t('İçe Aktar: beklenenden yüksek bakiye uygulanmaz (gelir yok), düşük olan uygulanır',function(){var bk=OA.bakBeklenen('kubra');var n=OA.iceUygula({bak:{aile:bak('aile')+5000,kubra:bk-100}});
   var ok=n.bakRed.length==1&&n.bakRed[0].k=='aile'&&bak('aile')==d0.aile&&bak('kubra')==bk-100;OA.st().bak.kubra.t=d0.kubra;return ok},function(){return JSON.stringify(durum(ay))});
  t('İçe Aktar: dosyadaki yeni gelir kadar artış kabul edilir',function(){var a0=bak('aile'),n=OA.iceUygula({bak:{aile:a0+300},kayit:[{id:'kor-ice-g',tur:'gelir',kalem:'BES çıkışı',tutar:300,tarih:GG.ayKay(ay,-4)+'-02'}]});
   var ok=!n.bakRed.length&&bak('aile')==a0+300;OA.st().bak.aile.t=a0;fnS().kayit=fnS().kayit.filter(function(x){return x.id!='kor-ice-g'});return ok});

  // ---------- 7) Çift maaş ----------
  t('Çift maaş: maaşı olan aya bankadan gelen “Maaş” kaydı yazılmaz',function(){var n=OA.iceUygula({kayit:[{id:'kor-ice-m',tur:'gelir',kalem:'Maaş',tutar:30000,tarih:bugun}]});return n.ciftMaas==1&&!kay('kor-ice-m')&&ayni(durum(ay),d0)});
  t('Çift maaş: ayda banka maaşı varken Bordro maaşı ikinci kez eklenmez',function(){var a2=GG.ayKay(ay,-3),bA=GG.ayKay(a2,-1);fnS().kayit.push({id:'kor-bm',tur:'gelir',kim:'cagla',tutar:25000,kalem:'Maaş',tarih:a2+'-05',ts:Date.now(),kaynak:'banka',bakEk:'banka'});
   var mm={ay:bA,h:{},v:{net:25000},duz:{}};var r=BR.butceEkle(mm,true);var ok=r===false&&!kay('br'+bA)&&/zaten maaş geliri var/.test(BR.ui.er||'');fnS().kayit=fnS().kayit.filter(function(x){return x.id!='kor-bm'});BR.ui.er='';return ok&&ayni(durum(ay),d0)});

  // ---------- 8) FuzulEv ----------
  t('FuzulEv: ödenmiş taksit bütçeye gider yazılır; gelir artmaz, bakiye yalnız taksit kadar düşer',function(){var a0=bak('aile');OA.st().fuzulev={};
   var n=FE.iceUygula({soz:{plan:'Örnek',taksitSay:2,teslimat:2},taksit:[{no:1,tur:'Tasarruf',vade:bugun,tutar:700,odendi:true,odenen:700,odemeTarih:bugun,butce:true,kasa:'aile'},{no:2,tur:'Tasarruf',vade:GG.ayKay(ay,1)+'-10',tutar:700}]});
   var ok=n.butce==1&&OA.ayToplam(ay).gelir==d0.gelir&&bak('aile')==a0-700;FE.iceUygula({taksit:[{no:1,tur:'Tasarruf',odendi:true,odenen:700,odemeTarih:bugun,butce:true}]});ok=ok&&bak('aile')==a0-700&&OA.ayToplam(ay).gelir==d0.gelir;
   var tk=FE.st().taksit[0];FE.butceGeriAl(tk);delete OA.st().fuzulev;return ok&&bak('aile')==a0},function(){return JSON.stringify(durum(ay))});

  // ---------- 5b) Cep harçlığı eklemek gelir değildir ----------
  t('Cep harçlığı: cebi yüksek bildirmek gelir yazmaz; “Farkı cep harçlığı olarak ekle” cebi artırır, Aile Bütçesi ve gelir değişmez',function(){var c0=bak('cagla'),bek=OA.bakBeklenen('cagla');
   OA.bakDlg('cagla');document.getElementById('oaBt').value=String(bek+500);OA.bakKaydet('cagla');var red=bak('cagla')==c0&&!!document.querySelector('#oaBu .bkk-cep');
   document.querySelector('#oaBu .bkk-cep').click();var d=durum(ay),ok=red&&d.cagla==r2t(bek+500)&&d.aile==d0.aile&&d.gelir==d0.gelir&&d.n==d0.n&&!GG.kayitlar().some(function(k){return k.tur=='gelir'&&/Kayıt dışı/.test(k.kalem||'')});
   OA.st().bak.cagla.t=d0.cagla;try{OA.dlgKapat()}catch(e){}return ok},function(){return JSON.stringify(durum(ay))});
  t('Cep harçlığı iste (masaüstü, Çağlar ve eşin telefonu): gelir ve Aile Bütçesi değişmez',function(){var b=OA.cepIste('e',250,'test');var e1={id:'kor-ci-x',tur:'cep_iste',ts:Date.now(),veri:{tutar:120}},e2={id:'kor-ci-y',tur:'es_cep_iste',ts:Date.now(),veri:{tutar:80}};bulutUygula(e1);OAI.uygula(e2,'es');
   var d=durum(ay),ok=!!b&&d.aile==d0.aile&&d.gelir==d0.gelir&&d.n==d0.n&&d.kubra==d0.kubra+330&&d.cagla==d0.cagla+120;OA.st().bak.kubra.t=d0.kubra;OA.st().bak.cagla.t=d0.cagla;return ok},function(){return JSON.stringify(durum(ay))});

  // ---------- 9) 0.9.11 hatası: bakiye bildirimi gelir yazmaz ----------
  t('Bakiye bildir: ekrandaki bakiye, işlenmemiş banka/geçmiş kayıtlar varken aynen bildirilince gelir yazılmaz (0.9.11 48 bin ₺ “Kayıt dışı gelir” yazıyordu)',function(){
   var now=Date.now();fnS().kayit.push({id:'kor-eski-1',tur:'gider',kim:'cagla',tutar:4000,kalem:'Market',tarih:GG.ayKay(ay,-2)+'-10',ts:now,kaynak:'banka'});
   var g0=OA.ayToplam(ay).gelir,s=OA.bakBildir('aile',bak('aile'),'test');var ok=!(s&&s.kayit&&s.kayit.tur=='gelir')&&OA.ayToplam(ay).gelir==g0&&!GG.kayitlar().some(function(k){return k.tur=='gelir'&&k.kalem=='Kayıt dışı gelir'});
   fnS().kayit=fnS().kayit.filter(function(x){return x.id!='kor-eski-1'});return ok});
 }catch(e){R.push({n:'Gelir koruması: test çöktü',ok:false,m:e.stack||e.message})}
 finally{window.toast=toast0;OA.bugunKey=y.bk;BKD.DEVIR=y.dv;if(y.fn)S.finans=JSON.parse(y.fn);else delete S.finans;if(y.a)S.orvA=JSON.parse(y.a);else delete S.orvA;if(y.br)S.bordro=JSON.parse(y.br);else delete S.bordro;GG.ui=JSON.parse(y.ui);BR.ui=JSON.parse(y.bui);try{if(typeof save=='function')save()}catch(e){}}
 return R};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__butceKorumaTest()}catch(e){y=[{n:'Gelir koruması: test çöktü',ok:false,m:e.message}]}return x.concat(y)})}})();
