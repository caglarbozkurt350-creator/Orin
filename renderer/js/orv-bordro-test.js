// Orvane 0.8.3 · Bordro ve İlaç Planı smoke testleri (yalnız `electron . --smoke`). Uydurma örnek veriyle çalışır; durum geri alınır.
window.__bordroTest=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
 var b0=S.bordro,u0=JSON.stringify(BR.ui),a=OA.st(),il0=a.ilac.slice(),al0=Object.assign({},a.ilacAl),ip0=JSON.stringify(IP.ui);
 try{
  t('Bordro: sayı biçimi 1.234,56 / 0,14 / gün tam sayı',BR.fmt(1234.5)=='1.234,50'&&BR.fmt(0.14)=='0,14'&&BR.fmt(30,0)=='30'&&BR.fmt(-5)=='−5,00',BR.fmt(1234.5));
  t('Bordro: girdi okuma (1.234,56 · 1234.56 · 1.234 · boş)',BR.oku('1.234,56')==1234.56&&BR.oku('1234.56')==1234.56&&BR.oku('1.234')==1234&&BR.oku('')===null&&isNaN(BR.oku('abc')));
  S.bordro={aylar:[]};BR.ui={ay:'',duz:'',bas:false,er:'',ok:''};
  t('Bordro: boşken içe aktarma/yeni ay yönlendirmesi',/Bordro kaydı yok/.test(BR.sayfa())&&/İçe aktar/.test(BR.sayfa()));
  var ornek={aylar:[{ay:'2030-02',h:{tip:'NORMAL',ad:'Örnek Kişi',birim:100},v:{gun:[30,30],normal:[100,1000],top:2000,ssk:140,net:1500,gvOI:[10.5,2.25],kesTop:500}},
   {ay:'2030-01',h:{tip:'NORMAL',ad:'Örnek Kişi',birim:100},v:{gun:[28,28],normal:[90,900],top:2100,ssk:150,net:1500,gvOI:[9.5,2.25],kesTop:600}}]};
  t('Bordro: içe aktarma 2 ay, sıralı',BR.yukle(ornek)==2&&S.bordro.aylar[0].ay=='2030-01'&&BR.ui.ay=='2030-02');
  var h=BR.sayfa();
  t('Bordro: üç sütun birebir (KAZANÇLAR · YASAL KESİNTİLER · ÖZEL KESİNTİLER)',/KAZANÇLAR/.test(h)&&/YASAL KESİNTİLER/.test(h)&&/ÖZEL KESİNTİLER/.test(h)&&/İŞVEREN/.test(h)&&/ÇALIŞAN/.test(h));
  t('Bordro: kâğıttaki tüm satırlar',['T. Çalışma Günü','Fazla Çalışma %150','Yemek+Tahsil Yardımı','TİS Avans','Isv.Pay-Damga Vergisi B','Topl. Gelir Vergisi Matrahı','Asgari Ücret Kmltf. Matrah','Gelir Vrg. Orj./İstisna','Sigorta Matrahı Bakiye','İcra Bakiyesi','Düşülen Sigorta','BES Otomatik Katılım','A.G.İ','Net Ödenen','Aylık Bordro Bilgileri','Birim Ücreti'].every(function(x){return h.indexOf(esc(x))>=0}));
  t('Bordro: değerler Türkçe biçimde',/1\.000,00/.test(h)&&/2\.000,00/.test(h));
  t('Bordro: artış ▲ / azalış ▼ önceki aya göre (kazanç artışı yeşil, kesinti azalışı yeşil)',/br-fk iyi[^>]*>▲ 100,00/.test(h)&&/br-fk kotu[^>]*>▼ 100,00/.test(h)&&/br-fk iyi[^>]*>▼ 10,00/.test(h)&&/br-fk iyi[^>]*>▼ 100,00/.test(h));
  t('Bordro: değişmeyen satırda fark yazmaz (Net 1.500)',function(){var i=h.indexOf('data-id="net"'),k=h.slice(i,h.indexOf('</div>',i));return i>0&&k.indexOf('br-fk')<0});
  t('Bordro: Orj./İstisna tek ondalık',/10,5</.test(h));
  BR.ui.ay='2030-01';var h1=BR.sayfa();
  t('Bordro: ilk ayda karşılaştırma yok',h1.indexOf('br-fk')<0&&/İlk kayıtlı ay/.test(h1));
  BR.ui.ay='2030-02';
  t('Bordro: her satırda düzeltme düğmesi',(h.match(/aria-label="[^"]* satırını düzelt"/g)||[]).length>=60);
  BR.ui.duz='normal';var hd=BR.sayfa();
  t('Bordro: düzeltmede iki kutu (birim + tutar)',/id="brIn0"/.test(hd)&&/id="brIn1"/.test(hd)&&/BR.kaydet\(\)/.test(hd));
  var c=document.createElement('div');c.style.display='none';c.innerHTML=hd;document.body.appendChild(c);
  var bk=ORV.yenile;try{ORV.yenile=function(){};c.querySelector('#brIn0').value='110';c.querySelector('#brIn1').value='1.250,75';var ok=BR.kaydet()}finally{ORV.yenile=bk;c.remove()}
  var m=S.bordro.aylar[1];
  t('Bordro: düzeltme kaydedilir ve işaretlenir',ok&&m.v.normal[0]==110&&m.v.normal[1]==1250.75&&!!m.duz.normal&&BR.ui.duz=='');
  t('Bordro: düzeltilen satır • işaretli, fark yeniden hesaplanır',function(){var x=BR.sayfa();return /br-dz/.test(x)&&/▲ 350,75/.test(x)});
  BR.yukle({aylar:[{ay:'2030-02',h:{tip:'NORMAL',ad:'Örnek Kişi',birim:120},v:{gun:[30,30],normal:[1,1],top:1}}]});
  t('Bordro: yeniden içe aktarma elle düzeltilen satırı korur',S.bordro.aylar[1].v.normal[1]==1250.75&&S.bordro.aylar[1].v.top==1);
  BR.yeniAy();
  t('Bordro: Yeni ay bir sonraki ayı açar, bilgileri kopyalar',S.bordro.aylar.length==3&&S.bordro.aylar[2].ay=='2030-03'&&S.bordro.aylar[2].h.ad=='Örnek Kişi'&&S.bordro.aylar[2].h.birim==120&&!Object.keys(S.bordro.aylar[2].v).length);
  t('Bordro: hatalı dosya reddedilir',function(){try{BR.yukle({x:1});return false}catch(e){return /tanınmadı/.test(e.message)}});
  t('Bordro: menüde sayfa kayıtlı',!!ORV.sayfalar.bordro&&!!ORV.altBul('bordro')&&!!ORV.IKON.bordro);
  // İlaç Planı
  a.ilac=[{id:'tA',eklendi:Date.now()-3*864e5,ad:'Örnek A',miktar:'1 tablet',saat:'08:00',tekrar:'gun'},{id:'tB',ad:'Örnek B',miktar:'5 ml',saat:'20:00',tekrar:'gun',actok:'tok'},{id:'tC',ad:'Örnek C',miktar:'1',saat:'13:00',tekrar:'haftasonu'}];
  a.ilacAl={};a.ilacAl[OA.bugunKey()+'|tA']=Date.now();IP.ui={duz:'',er:'',ok:''};
  var ip=IP.sayfa(),gs=new Date().getDay(),hs=gs==0||gs==6;
  t('İlaç: sayfa ve menü (Ailem › İlaç Planı)',!!ORV.sayfalar.ilac&&ORV.altKat('ilac').id=='aile'&&/İlaç Planı/.test(ip));
  t('İlaç: bugün sayacı (hafta sonu ilacı yalnız hafta sonu)',IP.sayac().top==(hs?3:2)&&IP.sayac().al==1,JSON.stringify(IP.sayac()));
  t('İlaç: saat dilimleri ve Alındı işareti',/Sabah/.test(ip)&&/Akşam/.test(ip)&&/Alındı \d\d:\d\d/.test(ip)&&/Tok karnına/.test(ip));
  t('İlaç: son 7 gün uyum tablosu',/Son 7 gün/.test(ip)&&/ip-7c al/.test(ip)&&/% ?\d+ uyum|%\d+ uyum/.test(ip));
  t('İlaç: planda düzelt / kaldır düğmeleri',/IP.duzenle\('tA'\)/.test(ip)&&/OA.ilacSil\('tA'\)/.test(ip));
  IP.ui.duz='tB';var ipd=IP.sayfa();
  t('İlaç: düzeltme formu dolu gelir',/İlacı düzelt/.test(ipd)&&/value="Örnek B"/.test(ipd)&&/value="tok" selected/.test(ipd));
  t('İlaç: ekip üyesi adı geçmez',!/Iris/.test(ip));
  // Pasif ekip (yapay zekâ kapalı): aynı adımda kurulur ve geri alınır
  var yz0=S.yzAcik,ar0=arg,P={};
  try{S.yzAcik=false;['anasayfa','butce','saglik','market','satinalma','evisleri','ekip'].forEach(function(id){try{P[id]=ORV.sayfalar[id].ciz('')}catch(e){P[id]='HATA '+e.message}});
   S.yzAcik=true;P.butceAcik=ORV.sayfalar.butce.ciz('')}finally{arg=ar0;if(yz0===undefined)delete S.yzAcik;else S.yzAcik=yz0}
  t('Pasif: Ailem sayfaları hatasız ve persona adı yok',['butce','saglik','market','satinalma','evisleri'].every(function(id){return P[id].indexOf('HATA')!==0&&!/b(Otto|Iris|Marco|Nerya|Mia|Remy|Sage)b/.test(P[id].replace(/<[^>]+>/g,' '))}),JSON.stringify(['butce','saglik','market','satinalma','evisleri'].map(function(id){var m=P[id].replace(/<[^>]+>/g,' ').match(/.{0,30}b(Otto|Iris|Marco|Nerya|Mia|Remy|Sage)b.{0,30}/);return id+':'+(m?m[0]:'')})));
  t('Pasif: Anasayfa persona adı yok, "Ay özeti" var',P.anasayfa.indexOf('HATA')!==0&&/Ay özeti/.test(P.anasayfa)&&!/b(Otto|Sage)b/.test(P.anasayfa.replace(/<[^>]+>/g,' ')),(P.anasayfa.replace(/<[^>]+>/g,' ').match(/.{0,30}b(Otto|Sage)b.{0,30}/)||[''])[0]);
  t('Pasif: avatar yerine işlev simgesi, yapay zekâ düğmeleri yok',!/<img class="oa-av/.test(P.butce)&&/oa-isl/.test(P.butce)&&(P.butce+P.saglik+P.market+P.satinalma+P.evisleri).indexOf('OA.hyAc(')<0&&String(P.butce+P.saglik+P.market+P.satinalma+P.evisleri));
  t('Pasif: Ailem eylemleri nötr (Takvime ekle; Sağlık›İlaç Planı)',/Takvime ekle/.test(P.butce)&&P.saglik.indexOf("ORV.git0('ilac')")>=0&&!/’ya yaz/.test(P.butce));
  t('Pasif: Ekip sade tablo, durum Kapalı, Hiyerarşi kalır',/oa-trow/.test(P.ekip)&&/Kapalı/.test(P.ekip)&&/Hiyerarşi/.test(P.ekip)&&!/oa-id /.test(P.ekip)&&!/Sesli sohbet/.test(P.ekip));
  t('Pasif: yapay zekâ açıkken eski görünüm aynen döner',/Mia’ya yaz/.test(P.butceAcik)&&/Son hareketler · Otto/.test(P.butceAcik));
 }finally{S.bordro=b0;BR.ui=JSON.parse(u0);a.ilac=il0;a.ilacAl=al0;IP.ui=JSON.parse(ip0);if(!b0)delete S.bordro}
 return Promise.resolve(R)};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__bordroTest()}catch(e){y=Promise.resolve([{n:'Bordro: test çöktü',ok:false,m:String(e&&e.message||e)}])}return y.then(function(y){return x.concat(y)})})}})();
// Ekran görüntüleri: orvbr_bordro.png, orvbr_ilac.png (ORV_SMOKE_BOYUT ile) — uydurma örnek veri
(function(){var sr=window.__smokeRoutes,sg=window.__smokeGo;window.__smokeRoutes=function(){return sr().concat([['orvbr','bordro',''],['orvbr','ilac','']])};
 window.__smokeGo=function(r){if(r[0]!='orvbr')return sg(r);try{
  if(r[1]=='bordro'){var v1={gun:[30,30],normal:[180,40000],hgt:[30,8000],fc50:[20,6000],ikramiye:15000,aile:200,yasam:30,top:69230,sm:68000,sgk:0.14,gvm:55000,dvm:69230,tgvm:300000,tgv:40000,isvSsk:14000,isvIssiz:1300,ssk:9500,issiz:680,gv:8200,dv:400,asgari:120000,gvOI:[12000.5,3800.5],dvOI:[650.2,250.2],yTop:18780,ilkNet:50450,sendika:1500,bes:2000,oYasam:25,oTop:3525,kesTop:22305,net:46925},
   v2=JSON.parse(JSON.stringify(v1));v2.normal=[170,38000];v2.fc50=[28,8400];v2.top=69630;v2.gv=9100;v2.yTop=19680;v2.ilkNet=49950;v2.bes=0;v2.oTop=1525;v2.kesTop=21205;v2.net=48425;
   S.bordro={aylar:[{ay:'2030-01',h:{tip:'NORMAL',lokasyon:'Örnek Fabrika',sicil:'X000',ad:'Örnek Kişi',pozisyon:'100',medeni:'Evli',cocuk:0,gorev:'Operatör',birim:250},v:v1,duz:{}},{ay:'2030-02',h:{tip:'NORMAL',lokasyon:'Örnek Fabrika',sicil:'X000',ad:'Örnek Kişi',pozisyon:'100',medeni:'Evli',cocuk:0,gorev:'Operatör',birim:250},v:v2,duz:{bes:1}}]};BR.ui={ay:'2030-02',duz:'',bas:false,er:'',ok:''}}
  else{var a=OA.st();a.ilac=[{id:'s1',eklendi:Date.now()-5*864e5,ad:'Örnek vitamin',miktar:'1 tablet',saat:'08:00',tekrar:'gun',actok:'tok'},{id:'s2',ad:'Örnek şurup',miktar:'5 ml',saat:'13:00',tekrar:'gun'},{id:'s3',ad:'Örnek damla',miktar:'2 damla',saat:'21:30',tekrar:'gun'}];a.ilacAl[OA.bugunKey()+'|s1']=Date.now()}
  try{ORV.zpTog(false)}catch(e){}ORV.git0(r[1]);return {}}catch(e){return {error:e.message}}}})();
// Ekran görüntüleri: pasif ekip (yapay zekâ kapalı) — sonda 'geri' ayarı eski hâline getirir
(function(){var sr=window.__smokeRoutes,sg=window.__smokeGo,yz0;window.__smokeRoutes=function(){return sr().concat([['orvpas','anasayfa',''],['orvpas','butce',''],['orvpas','ekip',''],['orvpas','geri','']])};
 window.__smokeGo=function(r){if(r[0]!='orvpas')return sg(r);try{if(r[1]=='geri'){if(yz0===undefined)delete S.yzAcik;else S.yzAcik=yz0;ORV.git0('anasayfa');return {}}
  if(!('_y' in window.__smokeGo)){window.__smokeGo._y=1;yz0=S.yzAcik}S.yzAcik=false;try{ORV.zpTog(false)}catch(e){}ORV.git0(r[1]);return {}}catch(e){return {error:e.message}}}})();
