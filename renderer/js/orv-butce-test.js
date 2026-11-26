// Orvane 0.9.11 · Ailem › Aylık Bütçe smoke testleri (yalnız `electron . --smoke`). Uydurma tutarlar; durum geri alınır.
window.__butce0911Test=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
 var y={fn:S.finans?JSON.stringify(S.finans):null,a:S.orvA?JSON.stringify(S.orvA):null,ui:JSON.stringify(GG.ui),bl:JSON.stringify(BLS())};
 function ct(){return document.getElementById('ct')}
 function bak(k){var b=OA.st().bak[k];return b?b.t:null}
 function kayit(id){return fnS().kayit.filter(function(x){return x.id==id})[0]}
 try{
  var bugun=OA.bugunKey(),ay=bugun.slice(0,7),onc=GG.ayKay(ay,-1),now=Date.now();
  delete S.finans;
  S.orvA={cep:{c:30,e:20},bak:{aile:{t:11111,ts:now-1000,bts:now-1000,kim:'test'},cagla:{t:2222,ts:now-1000,bts:now-1000,kim:'test'},kubra:{t:999,ts:now-1000,bts:now-1000,kim:'test'}},giderHedef:7777};
  Object.assign(GG.ui,{sek:'pano',ay:null,q:'',tur:'Tümü',kisi:'Tümü',kalem:'Tümü',sk:'tarih',yon:-1,edit:null,yeni:false,hov:null});
  // Uydurma geçmiş: geçen ay ve bu ay
  fnKaydet({tur:'gelir',kim:'cagla',tutar:'4321',kalem:'Ek gelir',tarih:onc+'-05',not:'Örnek gelir'});
  fnKaydet({tur:'gider',kim:'cagla',tutar:'1234',kalem:'Fatura',tarih:onc+'-12',not:'Örnek fatura'});
  var g1=fnKaydet({tur:'gelir',kim:'cagla',tutar:'5432',kalem:'Ek gelir',tarih:ay+'-01',not:'Örnek gelir 2'});g1.bakDus='aile';
  fnKaydet({tur:'gider',kim:'sirket',tutar:'888',kalem:'Bakım',tarih:bugun,not:'Şirket gideri'});
  var islenmemis=fnKaydet({tur:'gider',kim:'cagla',tutar:'321',kalem:'Ev',tarih:bugun,not:'İşlenmemiş örnek'});

  t('Menü: Ailem altında “Aylık Bütçe”',ORV.altKat('aylikbutce')&&ORV.altKat('aylikbutce').id=='aile'&&!!ORV.sayfalar.aylikbutce);
  ORV.git0('aylikbutce');var h=ct().innerHTML;
  t('Sayfa açılır: üç sekme (Dashboard, Detaylar, Analiz) ve hap gösterge',document.querySelectorAll('#ggKok .gg-sb').length==3&&!!document.querySelector('#ggKok .gg-hap')&&/Dashboard/.test(h)&&/Analiz/.test(h));
  t('Dashboard: Aile Bütçesi bakiyesi, Gider ekle ve Bakiye bildir düğmeleri',/11\.111/.test(h)&&/Gider ekle/.test(h)&&/Bakiye bildir/.test(h));
  t('Dashboard: son 7 gün kare bloklar (7 sütun × 6 kare)',document.querySelectorAll('#ggKok .gg-bs').length==7&&document.querySelectorAll('#ggKok .gg-kare').length==42);
  t('Dashboard: gelir/gider bu ay, Şirket kaydı sayılmaz',/5\.432/.test(h)&&/321/.test(h)&&!/888/.test(h.replace(/data-v="[^"]*"/g,'')));
  t('Dashboard: gider hedefi çubuğu, ay sonuna kalan yayı, cep silindiri, ay sonu raporu',/7\.777/.test(h)&&!!document.querySelector('#ggKok .gg-hd')&&!!document.querySelector('#ggKok .gg-yay path.gg-ciz[pathLength="1"]')&&!!document.querySelector('#ggKok .gg-sil')&&/PDF indir/.test(h));
  t('Sayılar 0’dan sayar (gg-say, son değer data-v)',document.querySelectorAll('#ggKok .gg-say').length>=8&&[].every.call(document.querySelectorAll('#ggKok .gg-say'),function(e){return isFinite(+e.getAttribute('data-v'))}));
  t('Kartlar sırayla gelir (artan animation-delay)',function(){var d=[].map.call(document.querySelectorAll('#ggGovde .gg-k'),function(e){return parseFloat(e.style.animationDelay)||0});return d.length>=8&&d[1]>d[0]&&d[7]>d[3]});
  // Sekme: kabuk kalır, hap kayar
  var kok=document.getElementById('ggKok');GG.sekme('detay');
  t('Sekme değişimi: kabuk yerinde kalır, hap göstergesi 2. sekmeye kayar',document.getElementById('ggKok')===kok&&document.querySelector('#ggKok .gg-sek').style.getPropertyValue('--i')=='1'&&document.querySelector('.gg-sb.on').getAttribute('data-s')=='detay');
  t('Detaylar: 7 sütun (Kalem, Tarih, Açıklama, Kişi, Kasa, Kaynak, Tutar)',function(){var b=[].map.call(document.querySelectorAll('#ggTablo th .gg-th'),function(x){return x.textContent.trim()});return b.join('|').replace(/ [↓↑]/g,'')=='Kalem|Tarih|Açıklama|Kişi|Kasa|Kaynak|Tutar'});
  t('Detaylar: arama, Tümü/Gelir/Gider, sayılı kişi çipleri, kalem süzgeci',!!document.getElementById('ggAra')&&document.querySelectorAll('#ggGovde .gg-cb').length==3&&document.querySelectorAll('#ggGovde .gg-cip span').length==4&&!!document.getElementById('ggKalem'));

  // Kayıt ekle: Aile Bütçesine işlenir
  var r1=GG.ekle({tur:'gider',kalem:'Market',tarih:bugun,not:'Örnek market',kisi:'kubra',kasa:'aile',tutar:'1.250'});
  t('Ekle: Aile Bütçesi kasası bakiyeden düşer (11.111 − 1.250), bakDus işaretli',r1&&r1.tutar==1250&&bak('aile')==9861&&r1.bakDus=='aile'&&r1.kisi=='kubra',JSON.stringify(r1)+' '+bak('aile'));
  var r2=GG.ekle({tur:'gider',kalem:'Ulaşım',tarih:bugun,not:'Örnek yakıt',kisi:'cagla',kasa:'cagla',tutar:'300'});
  t('Ekle: Çağlar cep kasası hem cep bakiyesinden hem Aile Bütçesinden düşer',r2.hk=='c'&&bak('cagla')==1922&&bak('aile')==9561);
  // Düzenle
  GG.guncelle(r1.id,{tur:'gider',kalem:'Market',tarih:bugun,not:'Örnek market',kisi:'kubra',kasa:'aile',tutar:'1000'});
  t('Düzenle: tutar 1.250 → 1.000, fark Aile Bütçesine geri eklenir',bak('aile')==9811&&kayit(r1.id).tutar==1000,bak('aile'));
  GG.guncelle(r1.id,{tur:'gider',kalem:'Market',tarih:bugun,not:'Örnek market',kisi:'kubra',kasa:'kubra',tutar:'1000'});
  t('Düzenle: kasa Aile Bütçesi → Kübra cep (Kübra düşer, toplam kasa aynı)',bak('kubra')==-1&&bak('aile')==9811&&kayit(r1.id).hk=='e'&&kayit(r1.id).bakDus=='kubra',bak('kubra')+' '+bak('aile'));
  GG.guncelle(r1.id,{tur:'gelir',kalem:'Ek gelir',tarih:bugun,not:'Örnek',kisi:'kubra',kasa:'kubra',tutar:'1000'});
  t('Düzenle: gider → gelir (−1000 yerine +1000)',bak('kubra')==1999&&bak('aile')==11811);
  GG.guncelle(islenmemis.id,{tur:'gider',kalem:'Ev',tarih:bugun,not:'İşlenmemiş örnek',kisi:'ortak',kasa:'aile',tutar:'500'});
  t('Düzenle: bakiyeye işlenmemiş kayıt yalnız alan olarak değişir',kayit(islenmemis.id).tutar==500&&bak('aile')==11811&&!kayit(islenmemis.id).bakDus);
  // Sil
  t('Sil: işlenmiş etkisi geri alınır, kayıt kalkar',GG.silKayit(r1.id)&&!kayit(r1.id)&&bak('kubra')==999&&bak('aile')==10811);

  // Kayıt dışı harcama (bakiye bildirimi farkı) vurgulanır
  var bek=OA.bakBeklenen('aile'),s=OA.bakBildir('aile',bek-640,'test'),kd=s.kayit;
  t('Kayıt dışı: bakiye bildirimi farkı otomatik kayıt olur',kd&&kd.kalem==GG.KD&&kd.tutar==640&&GG.kd(kd));
  GG.govdeYenile(false);var tr=document.querySelector('#ggTablo tr.gg-tr.kd');
  t('Kayıt dışı: tabloda ayrı vurgulu satır ve “otomatik” etiketi',!!tr&&/otomatik/.test(tr.innerHTML)&&/Kayıt dışı harcama/.test(tr.innerHTML)&&/Bakiye bildirimi/.test(tr.innerHTML));
  var b0=bak('aile');GG.guncelle(kd.id,{tur:'gider',kalem:'Market',tarih:kd.tarih,not:'Fiş bulundu',kisi:'ortak',kasa:'aile',tutar:'640'});
  t('Kayıt dışı: başka kaleme taşınınca bakiye değişmez, artık kayıt dışı sayılmaz',bak('aile')==b0&&!GG.kd(kayit(kd.id))&&!kayit(kd.id).kd&&kayit(kd.id).bakEk=='aile');
  GG.guncelle(kd.id,{tur:'gider',kalem:GG.KD,tarih:kd.tarih,not:'Geri',kisi:'ortak',kasa:'aile',tutar:'640'});
  // Bordro kaydı kilitli
  var br=fnKaydet({tur:'gelir',kim:'cagla',tutar:'9999',kalem:'Maaş · Örnek',tarih:ay+'-02',not:'Bordrodan otomatik (Net Ödenen)'},'br'+ay);br.bakEk='aile';var b1=bak('aile');
  GG.guncelle(br.id,{tur:'gider',kalem:'Market',tarih:bugun,not:'Yeni açıklama',kisi:'cagla',kasa:'aile',tutar:'1'});
  t('Bordro maaşı: yalnız açıklama/kişi değişir; tutar ve bakiye aynı, silinemez',kayit(br.id).tutar==9999&&kayit(br.id).tur=='gelir'&&kayit(br.id).not=='Yeni açıklama'&&bak('aile')==b1&&!GG.silKayit(br.id));

  // Arayüz akışı: + Kayıt ekle ve yerinde düzenleme
  GG.sekme('pano');GG.yeniKayit('gider');
  t('“+ Kayıt ekle”: Detaylar sekmesine geçer, boş düzenleme satırı açılır',GG.ui.sek=='detay'&&!!document.getElementById('ggEd')&&document.getElementById('ggEd').getAttribute('data-id')==''&&/Kaydet/.test(document.querySelector('.gg-ed2').innerHTML)&&!/>Sil</.test(document.querySelector('.gg-ed2').innerHTML));
  document.getElementById('ggETt').value='77';document.getElementById('ggENo').value='Formdan örnek';document.getElementById('ggEKa').value='Sağlık';var n0=fnS().kayit.length,a0=bak('aile');GG.kaydet();
  var yk=fnS().kayit.filter(function(x){return x.not=='Formdan örnek'})[0];
  t('Formdan kayıt: fnKaydet ile eklenir, Aile Bütçesinden düşer, satır kapanır',fnS().kayit.length==n0+1&&yk&&yk.tutar==77&&yk.kalem=='Sağlık'&&bak('aile')==a0-77&&!document.getElementById('ggEd'));
  var duz=document.querySelector('#ggTablo .gg-kalem');t('Satırdaki kalem simgesi aria-label taşır',!!duz&&/düzenle$/.test(duz.getAttribute('aria-label')));
  GG.duzenle(yk.id);document.getElementById('ggETt').value='70';GG.kaydet();
  t('Yerinde düzenleme: Kaydet tutarı ve bakiyeyi günceller',kayit(yk.id).tutar==70&&bak('aile')==a0-70);
  GG.duzenle(yk.id);t('Yerinde düzenleme: Kaydet / Vazgeç / Sil düğmeleri',/Vazgeç/.test(document.querySelector('.gg-ed2').innerHTML)&&/>Sil</.test(document.querySelector('.gg-ed2').innerHTML));GG.vazgec();
  t('Vazgeç: satır kapanır, değişiklik yok',!document.getElementById('ggEd')&&kayit(yk.id).tutar==70);
  // Sıralama ve süzgeç
  GG.sirala('tutar');var ilk=document.querySelector('#ggTablo tbody tr.gg-tr .gg-tt');
  t('Başlığa tıklayınca sıralanır (tutar, büyükten küçüğe: en büyük gelir üstte)',GG.ui.sk=='tutar'&&ilk&&/^\+9\.999/.test(ilk.textContent));
  GG.ara('örnek yakıt');t('Arama: yalnız eşleşen satırlar',document.querySelectorAll('#ggTablo tr.gg-tr').length==1);GG.ara('');
  GG.suz('tur','Gelir');t('Tür süzgeci: Gelir',[].every.call(document.querySelectorAll('#ggTablo tr.gg-tr .gg-tt'),function(e){return /^\+/.test(e.textContent)}));GG.suz('tur','Tümü');
  GG.suz('kisi','cagla');t('Kişi çipi: Çağlar',document.querySelectorAll('#ggTablo tr.gg-tr').length>=1&&[].every.call(document.querySelectorAll('#ggTablo tr.gg-tr .gg-ks'),function(e){return /Çağlar/.test(e.textContent)}));GG.suz('kisi','Tümü');

  // Analiz
  GG.sekme('analiz');var an=document.getElementById('ggGovde').innerHTML;
  t('Analiz: net kartı ve üç özet kartı',!!document.querySelector('#ggGovde .gg-k.net')&&document.querySelectorAll('#ggGovde .gg-g4 .gg-k').length==4);
  t('Analiz: çizerek gelen eğriler (pathLength=1), halka dilimleri, huni ve kişi çubukları',document.querySelectorAll('#ggGovde path.gg-ciz[pathLength="1"]').length>=3&&document.querySelectorAll('#ggGovde .gg-dil').length>=1&&document.querySelectorAll('#ggGovde .gg-hn2').length>=1&&document.querySelectorAll('#ggGovde .gg-kim').length>=1);
  var gun=new Date().getDate();GG.czGoster(gun);
  t('Günlük gider: güne gelince bilgi kutusu o günü gösterir',new RegExp('^'+gun+' ').test(document.querySelector('#ggCzB div').textContent));
  t('Analiz: kayıt dışı harcama kartı vurgulu',/Kayıt dışı harcama/.test(an)&&!!document.querySelector('#ggGovde .gg-kd2.kdr'));
  // PDF
  var ph=GG.raporHtml(ay);t('Ay sonu raporu: kayıt dışı harcama bölümü ve vurgulu satır',/<h2>Kayıt dışı harcama<\/h2>/.test(ph)&&/class="kd"/.test(ph)&&/640/.test(ph));
  // Eşitleme
  var oz=bulutOzet(),eo=OAI.esOzet();
  t('Eşitleme: yeni kayıt Çağlar’ın ve Kübra’nın telefon özetine gider',oz.aile.ortak.hareket.some(function(x){return x[3]=='Formdan örnek'})&&eo.aile.ortak.hareket.some(function(x){return x[3]=='Formdan örnek'}));
  // Ay gezintisi
  GG.ayDegis(-1);t('Ay gezintisi: önceki aya geçer, sonraki ay düğmesi bu ayı aşmaz',GG.ay()==onc&&/Ek gelir|4\.321/.test(ct().innerHTML));GG.ayDegis(1);GG.ayDegis(1);t('Gelecek aya geçilmez',GG.ay()==ay);
  // Sayaç: kayıt sonrası sessiz yenilemede 0'dan saymaz, sekme geçişinde sayar (smoke kapalıymış gibi)
  t('Sayaç: sessiz yenilemede son değer hemen görünür, animasyonlu yenilemede 0’dan başlar',function(){var i0=INFO,az=ORV.azalt;try{INFO=Object.assign({},INFO,{smoke:false});ORV.azalt=function(){return false};GG.ui.sek='detay';
    GG.govdeYenile(false);var s=[].every.call(document.querySelectorAll('#ggGovde .gg-say'),function(e){return e.textContent==GG.fmt(+e.getAttribute('data-v'),e.getAttribute('data-f'))});
    GG.govdeYenile(true);var a=[].some.call(document.querySelectorAll('#ggGovde .gg-say'),function(e){return +e.getAttribute('data-v')>0&&e.textContent==GG.fmt(0,e.getAttribute('data-f'))});return s&&a}finally{INFO=i0;ORV.azalt=az}});
  // Hareketi azalt
  t('Hareketi azalt: prefers-reduced-motion kuralı animasyonları kapatır',function(){var ok=false;[].forEach.call(document.styleSheets,function(s){if(!/orv-butce\.css/.test(s.href||''))return;[].forEach.call(s.cssRules,function(r){if(r.media&&/reduce/.test(r.media.mediaText)&&/\.gg/.test(r.cssText)&&/animation/.test(r.cssText)&&/transition/.test(r.cssText))ok=true})});return ok});
  t('Tasarımın örnek tutarları taşınmadı (24.332, 52.000, 17.700)',!/24\.332|52\.000|17\.700/.test(ct().innerHTML));
 }catch(e){t('Aylık Bütçe testi',false,e.stack)}
 finally{if(y.fn)S.finans=JSON.parse(y.fn);else delete S.finans;if(y.a)S.orvA=JSON.parse(y.a);else delete S.orvA;GG.ui=JSON.parse(y.ui);S.bulut=JSON.parse(y.bl);try{cfNo()}catch(e){}}
 return R};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__butce0911Test()}catch(e){y=[{n:'Aylık Bütçe: test çöktü',ok:false,m:e.message}]}return x.concat(y)})}})();
// Ekran görüntüleri (smoke): uydurma veriyle üç sekme
(function(){var sr=window.__smokeRoutes,sg=window.__smokeGo;window.__smokeRoutes=function(){return sr().concat([['orvgg','pano',''],['orvgg','detay',''],['orvgg','analiz','']])};
 window.__smokeGo=function(r){if(r[0]!='orvgg')return sg(r);try{var g=OA.bugunKey(),ay=g.slice(0,7),onc=GG.ayKay(ay,-1),gun=+g.slice(8,10),now=Date.now();
  if(r[1]=='pano'){delete S.finans;S.orvA=Object.assign(OA.st(),{cep:{c:30,e:20},giderHedef:20000,bak:{aile:{t:15432,ts:now,bts:now,kim:'örnek'},cagla:{t:3100,ts:now,bts:now,kim:'örnek'},kubra:{t:1900,ts:now,bts:now,kim:'örnek'}}});
   var L=[['gelir','Ek gelir',23456,1,'Örnek gelir','cagla'],['gider','Kira',8000,2,'Örnek kira','ortak'],['gider','Market',940,3,'Örnek alışveriş','kubra'],['gider','Fatura',610,4,'Örnek fatura','ortak'],['gider','Ulaşım',700,5,'Örnek yakıt','cagla'],['gider','Market',380,6,'Örnek manav','cagla'],['gider','Sağlık',260,7,'Örnek eczane','kubra'],['gider','Ev',430,8,'Örnek temizlik','kubra'],['gider','Dışarıda yemek',520,9,'Örnek yemek','ortak'],['gider','Çocuk',300,10,'Örnek kırtasiye','kubra']];
   L.forEach(function(x,i){var d=Math.max(1,gun-L.length+i+1);var k=fnKaydet({tur:x[0],kim:'cagla',tutar:String(x[2]),kalem:x[1],tarih:ay+'-'+String(d).padStart(2,'0'),not:x[4]});if(k){k.kisi=x[5];if(x[5]=='kubra'&&i%2)k.kaynak='es-telefon'}});
   fnKaydet({tur:'gelir',kim:'cagla',tutar:'21000',kalem:'Ek gelir',tarih:onc+'-03',not:'Örnek'});fnKaydet({tur:'gider',kim:'cagla',tutar:'12500',kalem:'Kira',tarih:onc+'-04',not:'Örnek'});
   var kd=fnKaydet({tur:'gider',kim:'cagla',tutar:'450',kalem:'Kayıt dışı harcama',tarih:g,not:'Aile Bütçesi bakiye bildirimi · örnek',kaynak:'bakiye'});if(kd){kd.kd='aile';kd.bakEk='aile'}}
  GG.ui.sek=r[1];GG.ui.ay=null;GG.ui.edit=null;GG.ui.yeni=false;try{ORV.zpTog(false)}catch(e){}ORV.git0('aylikbutce');var c=document.getElementById('ct');if(c)c.scrollTop=0;
  return new Promise(function(res){setTimeout(function(){res({})},2600)})}catch(e){return {error:e.message}}}})();
