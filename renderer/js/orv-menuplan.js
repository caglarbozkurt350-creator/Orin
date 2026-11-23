// ========================================================================
// MENÜ PLANLAYICI (0.8.4) — Ailem › Menü & Market › Menü Planlayıcı
// Kişi sayısı, günlük kalori hedefi, öğünler, bütçe, beslenme tarzı ve dolaptaki malzemelere göre 7 günlük menü
// ve otomatik alışveriş listesi. İnternet ve yapay zekâ gerektirmez: yerel tarif listesiyle çalışır.
// Veri: S.orvA.mplan (ayarlar + plan). Menüye aktar → S.orvA.menu; Market listesine ekle → S.orvA.market.
// ========================================================================
var MP={};
// Tarif: ad|öğün(k kahvaltı, o öğle, s ara, a akşam)|kcal/porsiyon|bütçe(1-3)|etiket(v vejetaryen, p protein/sporcu, h sağlıklı)|malzeme:miktar:birim;… (kişi başı)
MP.TARIF=[
 'Menemen|k|380|1|v|Yumurta:2:adet;Domates:1:adet;Yeşil Biber:1:adet;Zeytinyağı:1:yk;Ekmek:2:dilim',
 'Peynirli omlet|k|420|1|vp|Yumurta:3:adet;Beyaz Peynir:40:g;Ekmek:1:dilim;Tereyağı:10:g',
 'Muzlu yulaf lapası|ks|350|1|vh|Yulaf Ezmesi:50:g;Süt:200:ml;Muz:1:adet;Bal:1:yk',
 'Avokadolu yumurtalı tost|k|450|3|vh|Avokado:0.5:adet;Yumurta:2:adet;Tam buğday ekmeği:2:dilim',
 'Serpme kahvaltı tabağı|k|520|2|v|Beyaz Peynir:60:g;Zeytin:50:g;Domates:1:adet;Salatalık:1:adet;Yumurta:1:adet;Ekmek:2:dilim;Bal:1:yk',
 'Yoğurtlu yulaf kasesi|ks|330|1|vhp|Yoğurt:200:g;Yulaf Ezmesi:40:g;Ceviz:15:g;Muz:0.5:adet',
 'Mantarlı omlet|k|360|2|vph|Yumurta:3:adet;Mantar:100:g;Yeşil Biber:0.5:adet;Zeytinyağı:1:yk',
 'Sucuklu kaşarlı yumurta|k|560|2|p|Yumurta:2:adet;Sucuk:50:g;Kaşar:30:g;Ekmek:1:dilim',
 'Çılbır|k|400|1|v|Yumurta:2:adet;Yoğurt:150:g;Tereyağı:15:g;Sarımsak:1:diş;Ekmek:1:dilim',
 'Somonlu avokado tost|k|520|3|ph|Somon Fileto:80:g;Avokado:0.5:adet;Tam buğday ekmeği:2:dilim',
 'Peynirli kabak mücveri|koa|380|1|vh|Kabak:2:adet;Yumurta:2:adet;Beyaz Peynir:50:g;Un:2:yk;Dereotu:0.25:demet',
 'Yulaflı muzlu pankek|k|420|2|vp|Yulaf Ezmesi:50:g;Yumurta:2:adet;Muz:1:adet;Yoğurt:100:g',
 'Ispanaklı yumurta|koa|330|1|vhp|Ispanak:250:g;Yumurta:2:adet;Soğan:0.5:adet;Yoğurt:80:g',
 'Muzlu yoğurt|s|220|1|vh|Yoğurt:150:g;Muz:1:adet',
 'Meyve tabağı ve ceviz|s|200|1|vh|Elma:1:adet;Mandalina:1:adet;Ceviz:15:g',
 'Haşlanmış yumurta ve salatalık|s|180|1|vph|Yumurta:2:adet;Salatalık:1:adet',
 'Avokado ezmeli kraker|s|260|3|vh|Avokado:0.5:adet;Tam buğday kraker:30:g;Domates:0.5:adet',
 'Ayran ve badem|s|240|2|vp|Yoğurt:150:g;Badem:25:g',
 'Muzlu protein smoothie|s|300|2|vp|Süt:250:ml;Muz:1:adet;Yulaf Ezmesi:30:g;Fıstık ezmesi:1:yk',
 'Fırında tavuk ve bulgur pilavı|oa|560|2|ph|Tavuk Göğsü:180:g;Bulgur:70:g;Domates:1:adet;Yeşil Biber:1:adet;Zeytinyağı:1:yk',
 'Tavuk sote|oa|480|2|p|Tavuk Göğsü:170:g;Yeşil Biber:1:adet;Domates:1:adet;Mantar:80:g;Soğan:0.5:adet',
 'Izgara tavuk salata|oa|420|2|ph|Tavuk Göğsü:150:g;Marul:0.25:adet;Domates:1:adet;Salatalık:0.5:adet;Zeytinyağı:1:yk',
 'Tavuklu sebzeli makarna|oa|620|2|p|Tavuk Göğsü:120:g;Makarna:90:g;Kabak:0.5:adet;Mantar:60:g;Krema:30:ml',
 'Tavuk şiş ve közlenmiş biber|a|520|2|ph|Tavuk Göğsü:180:g;Yeşil Biber:2:adet;Domates:1:adet;Soğan:0.5:adet',
 'Tavuk çorbası|oa|380|1|ph|Tavuk Göğsü:100:g;Şehriye:30:g;Havuç:0.5:adet;Limon:0.25:adet;Ekmek:1:dilim',
 'Karnıyarık|oa|520|2||Patlıcan:2:adet;Kıyma:90:g;Domates:1:adet;Yeşil Biber:1:adet;Soğan:0.5:adet',
 'Izgara köfte ve piyaz|oa|640|2|p|Kıyma:150:g;Soğan:0.5:adet;Kuru fasulye:60:g;Domates:1:adet;Maydanoz:0.25:demet',
 'Kıymalı ıspanak ve yoğurt|oa|380|1|h|Ispanak:300:g;Kıyma:60:g;Soğan:0.5:adet;Yoğurt:100:g;Pirinç:15:g',
 'Kıymalı makarna|oa|610|1||Makarna:100:g;Kıyma:80:g;Domates:1:adet;Soğan:0.5:adet',
 'Kıymalı kabak dolması|oa|430|2|h|Kabak:2:adet;Kıyma:70:g;Pirinç:30:g;Domates:1:adet;Yoğurt:100:g',
 'Fırında köfte patates|a|700|2||Kıyma:140:g;Patates:2:adet;Domates:1:adet;Yeşil Biber:1:adet',
 'Etli kuru fasulye ve pilav|oa|650|2|p|Kuru fasulye:80:g;Kuşbaşı Et:60:g;Pirinç:60:g;Domates salçası:1:yk;Soğan:0.5:adet',
 'Et sote ve pirinç pilavı|oa|680|3|p|Kuşbaşı Et:160:g;Yeşil Biber:1:adet;Domates:1:adet;Pirinç:70:g;Soğan:0.5:adet',
 'Tas kebabı|oa|590|3|p|Kuşbaşı Et:150:g;Patates:1:adet;Havuç:0.5:adet;Soğan:0.5:adet;Domates salçası:1:yk',
 'Mantarlı et sote|oa|520|3|ph|Kuşbaşı Et:150:g;Mantar:150:g;Yeşil Biber:1:adet;Soğan:0.5:adet',
 'Biftek ve fırın patates|a|780|3|p|Dana bonfile:200:g;Patates:2:adet;Tereyağı:10:g;Roka:0.25:demet',
 'Fırında somon ve sebze|oa|560|3|ph|Somon Fileto:180:g;Kabak:1:adet;Havuç:1:adet;Limon:0.5:adet;Zeytinyağı:1:yk',
 'Somonlu kinoa salatası|oa|540|3|ph|Somon Fileto:150:g;Kinoa:60:g;Avokado:0.5:adet;Domates:1:adet;Roka:0.25:demet',
 'Somonlu makarna|oa|680|3|p|Somon Fileto:120:g;Makarna:90:g;Krema:50:ml;Dereotu:0.25:demet',
 'Levrek ızgara ve roka|a|480|3|ph|Levrek:1:adet;Roka:0.5:demet;Limon:0.5:adet;Zeytinyağı:1:yk',
 'Ton balıklı salata|o|400|2|ph|Ton balığı:1:kutu;Marul:0.25:adet;Mısır:50:g;Domates:1:adet;Zeytinyağı:1:yk',
 'Mercimek çorbası ve salata|oa|380|1|vh|Kırmızı mercimek:70:g;Soğan:0.5:adet;Havuç:0.5:adet;Limon:0.25:adet;Marul:0.2:adet',
 'Zeytinyağlı taze fasulye|oa|320|2|vh|Taze fasulye:250:g;Domates:1:adet;Soğan:0.5:adet;Zeytinyağı:2:yk;Yoğurt:100:g',
 'Nohut yemeği ve bulgur|oa|560|1|vp|Nohut:80:g;Bulgur:60:g;Domates salçası:1:yk;Soğan:0.5:adet',
 'Mantar sote ve bulgur|oa|450|1|v|Mantar:200:g;Bulgur:70:g;Yeşil Biber:1:adet;Soğan:0.5:adet',
 'Fırın sebze ve yoğurt|oa|360|1|vh|Kabak:1:adet;Patlıcan:1:adet;Patates:1:adet;Yeşil Biber:1:adet;Yoğurt:120:g',
 'İmam bayıldı|oa|390|2|vh|Patlıcan:2:adet;Domates:1:adet;Soğan:1:adet;Zeytinyağı:2:yk;Sarımsak:2:diş',
 'Sebzeli omlet ve salata|oa|410|1|vph|Yumurta:3:adet;Kabak:0.5:adet;Yeşil Biber:1:adet;Domates:1:adet;Marul:0.2:adet',
 'Yeşil mercimek salatası|o|420|1|vhp|Yeşil mercimek:70:g;Domates:1:adet;Yeşil Biber:1:adet;Maydanoz:0.25:demet;Limon:0.5:adet',
 'Avokadolu kinoa kasesi|oa|520|3|vh|Kinoa:70:g;Avokado:0.5:adet;Nohut:40:g;Domates:1:adet;Mısır:40:g',
 'Kaşarlı mantar graten|oa|450|2|vp|Mantar:200:g;Kaşar:60:g;Yumurta:1:adet;Süt:100:ml',
 'Sebzeli bulgur pilavı ve cacık|oa|480|1|v|Bulgur:80:g;Yeşil Biber:1:adet;Domates:1:adet;Yoğurt:150:g;Salatalık:0.5:adet',
 'Zeytinyağlı kuru fasulye ve pilav|oa|590|1|v|Kuru fasulye:80:g;Pirinç:60:g;Domates salçası:1:yk;Soğan:0.5:adet'
].map(function(s,i){var p=s.split('|');return{i:i,ad:p[0],og:p[1],kcal:+p[2],b:+p[3],et:p[4],mz:p[5].split(';').map(function(m){var q=m.split(':');return{ad:q[0],m:+q[1],b:q[2]}})}});
MP.DOLAP=[['Tavuk Göğsü','🍗'],['Kıyma','🥩'],['Kuşbaşı Et','🥩'],['Somon Fileto','🐟'],['Yumurta','🥚'],['Yoğurt','🥛'],['Beyaz Peynir','🧀'],['Domates','🍅'],['Yeşil Biber','🫑'],['Kabak','🥒'],['Mantar','🍄'],['Yulaf Ezmesi','🥣'],['Avokado','🥑'],['Muz','🍌']];
MP.OGUN=[['k','Kahvaltı','🍳',25],['o','Öğle Yemeği','☀️',35],['s','Ara Öğün','🍒',10],['a','Akşam Yemeği','🌙',30]];
MP.BUTCE=[[1,'Ekonomik','🌱'],[2,'Standart / Orta','💥'],[3,'Premium','💎']];
MP.TARZ=[['klasik','Klasik Menü','🌾'],['sporcu','Sporcu Menüsü','💪'],['saglikli','Sağlıklı Beslenme','🥑'],['vejetaryen','Vejetaryen Menü','🥦']];
MP.GUN=['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
MP.GRUP=[['Et, tavuk ve balık',/Tavuk|Kıyma|Kuşbaşı|Somon|Levrek|Ton balığı|bonfile|Sucuk/],['Süt ürünleri ve yumurta',/Yumurta|Yoğurt|Peynir|Kaşar|Süt|Tereyağı|Krema/],['Sebze ve meyve',/Domates|Biber|Kabak|Mantar|Avokado|Muz|Patlıcan|Patates|Havuç|Soğan|Sarımsak|Ispanak|Marul|Roka|Salatalık|Limon|Elma|Mandalina|Maydanoz|Dereotu|Taze fasulye/],['Bakliyat ve kuru gıda',/Yulaf|Bulgur|Pirinç|Makarna|Şehriye|Mercimek|mercimek|Nohut|Kuru fasulye|Kinoa|Un|Ceviz|Badem|Mısır/]];
MP.st=function(){var a=OA.st();if(!a.mplan)a.mplan={kisi:2,kcal:2000,og:{k:1,a:1},butce:1,tarz:'klasik',dolap:{},plan:null,tohum:1,alindi:{}};var m=a.mplan;m.og=m.og||{};m.dolap=m.dolap||{};m.alindi=m.alindi||{};return m};
MP.ui={tab:'liste',ok:'',er:''};
MP.kip=function(k){return k<1700?['Diyet','🥗']:k<2500?['Dengeli','🏃']:k<3200?['Aktif','🚴']:['Yüksek enerji','🏋️']};
MP.ogunler=function(){var m=MP.st();return MP.OGUN.filter(function(o){return m.og[o[0]]})};
MP.pay=function(){var L=MP.ogunler(),t=L.reduce(function(s,o){return s+o[3]},0)||1,m=MP.st(),r={};L.forEach(function(o){r[o[0]]=Math.round(m.kcal*o[3]/t)});return r};
MP.rng=function(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
MP.uygun=function(r,og){var m=MP.st();if(r.og.indexOf(og)<0||r.b>m.butce)return false;if(m.tarz=='vejetaryen'&&r.et.indexOf('v')<0)return false;return true};
MP.puan=function(r,og,hedef,kul,rnd){var m=MP.st(),p=0;r.mz.forEach(function(z){if(m.dolap[z.ad])p+=3});
 if(m.tarz=='sporcu'&&r.et.indexOf('p')>=0)p+=3;if(m.tarz=='saglikli'&&r.et.indexOf('h')>=0)p+=3;
 return p-(kul[r.i]||0)*6-Math.abs(r.kcal-hedef)/120+rnd()*3};
MP.olustur=function(){var m=MP.st(),L=MP.ogunler();if(!L.length){MP.ui.er='En az bir öğün seç';MP.ui.ok='';ORV.yenile();return false}
 m.tohum=(m.tohum||1)+1;var rnd=MP.rng(m.tohum*7919),pay=MP.pay(),kul={},plan={};
 for(var g=0;g<7;g++)L.forEach(function(o){var A=MP.TARIF.filter(function(r){return MP.uygun(r,o[0])});if(!A.length)return;var en=null,ep=-1e9;A.forEach(function(r){var p=MP.puan(r,o[0],pay[o[0]],kul,rnd);if(p>ep){ep=p;en=r}});plan[g+'-'+o[0]]=en.i;kul[en.i]=(kul[en.i]||0)+1});
 m.plan=plan;m.alindi={};MP.ui.er='';MP.ui.ok='7 günlük menü hazır · alışveriş listesi aşağıda';OA.kaydet();ORV.yenile();
 setTimeout(function(){var e=document.getElementById('mpSonuc');if(e&&e.scrollIntoView)e.scrollIntoView({behavior:'smooth',block:'start'})},60);return true};
MP.degistir=function(k){var m=MP.st();if(!m.plan||m.plan[k]==null)return;var og=k.split('-')[1],su=m.plan[k],kul={};Object.keys(m.plan).forEach(function(x){kul[m.plan[x]]=(kul[m.plan[x]]||0)+1});
 var rnd=MP.rng((m.tohum||1)*31+Date.now()%9973),A=MP.TARIF.filter(function(r){return MP.uygun(r,og)&&r.i!=su});if(!A.length)return;
 var en=null,ep=-1e9;A.forEach(function(r){var p=MP.puan(r,og,MP.pay()[og]||r.kcal,kul,rnd);if(p>ep){ep=p;en=r}});m.plan[k]=en.i;OA.kaydet();ORV.yenile()};
// Alışveriş listesi: kişi sayısıyla çarpılır, birim bazında toplanır; dolaptakiler ayrı gösterilir
MP.liste=function(){var m=MP.st(),T={};if(!m.plan)return [];Object.keys(m.plan).forEach(function(k){var r=MP.TARIF[m.plan[k]];if(!r)return;r.mz.forEach(function(z){var id=z.ad+'|'+z.b;T[id]=T[id]||{ad:z.ad,b:z.b,m:0};T[id].m+=z.m*m.kisi})});
 return Object.keys(T).map(function(id){var x=T[id];x.id=id;x.dolap=!!m.dolap[x.ad];x.grup=(MP.GRUP.filter(function(g){return g[1].test(x.ad)})[0]||['Diğer'])[0];return x}).sort(function(a,b){return a.ad.localeCompare(b.ad,'tr')})};
MP.miktar=function(x){var v=x.m;if(x.b=='g')return v>=1000?(Math.round(v/100)/10).toString().replace('.',',')+' kg':Math.ceil(v/10)*10+' g';if(x.b=='ml')return v>=1000?(Math.round(v/100)/10).toString().replace('.',',')+' L':Math.ceil(v/10)*10+' ml';return Math.ceil(v-1e-9)+' '+x.b};
MP.sec=function(alan,v){var m=MP.st();if(alan=='og')m.og[v]=m.og[v]?0:1;else if(alan=='dolap'){if(m.dolap[v])delete m.dolap[v];else m.dolap[v]=1}else m[alan]=v;MP.ui.er='';OA.kaydet();ORV.yenile()};
MP.kcal=function(v){var m=MP.st();m.kcal=Math.max(1200,Math.min(4000,Math.round(+v/50)*50));var e=document.getElementById('mpKcalV');if(e)e.textContent=BR.fmt(m.kcal,0)+' kcal';var k=document.getElementById('mpKip');if(k){var p=MP.kip(m.kcal);k.textContent=p[1]+' '+p[0]}var d=document.getElementById('mpDag');if(d)d.innerHTML=MP.dagilim();clearTimeout(MP._kt);MP._kt=setTimeout(function(){OA.kaydet()},300)};
MP.dagilim=function(){var p=MP.pay();return MP.ogunler().map(function(o){return '<span class="mp-dg"><span>'+o[1]+'</span><b>~'+p[o[0]]+' kcal</b></span>'}).join('')||'<span class="oa-sub">Öğün seçilmedi</span>'};
MP.tik=function(id){var m=MP.st();if(m.alindi[id])delete m.alindi[id];else m.alindi[id]=1;OA.kaydet();ORV.yenile()};
MP.marketeEkle=function(){var a=OA.st(),m=MP.st(),var0=a.market.map(function(x){return x.ad.toLocaleLowerCase('tr')}),n=0;
 MP.liste().forEach(function(x){if(x.dolap||m.alindi[x.id])return;var ad=x.ad+' · '+MP.miktar(x);if(var0.some(function(v){return v.indexOf(x.ad.toLocaleLowerCase('tr'))===0}))return;a.market.push({id:uid(),ad:ad.slice(0,60),al:false});n++});
 OA.kaydet();MP.ui.er='';MP.ui.ok=n?n+' madde market listesine eklendi':'Eklenecek yeni madde yok (zaten listede ya da dolapta)';ORV.yenile();return n};
MP.menuyeAktar=function(){var a=OA.st(),m=MP.st(),n=0;if(!m.plan)return 0;for(var g=0;g<7;g++){[['o','ogle'],['a','aksam']].forEach(function(x){var r=MP.TARIF[m.plan[g+'-'+x[0]]];if(r){a.menu[g+'-'+x[1]]=r.ad.slice(0,60);n++}})}
 OA.kaydet();MP.ui.er='';MP.ui.ok=n?'Haftalık menüye '+n+' öğün aktarıldı (Menü & Liste sekmesi)':'Aktarılacak öğle/akşam yemeği yok';ORV.yenile();return n};
MP.tabH=function(){return '<div class="mp-tabs"><div class="oa-tabs" role="tablist" aria-label="Menü & Market">'+[['liste','Menü & Liste'],['plan','🪄 Menü Planlayıcı']].map(function(x){var on=MP.ui.tab==x[0];return '<button type="button" role="tab" aria-selected="'+on+'" class="mp-tab'+(on?' on':'')+'" onclick="MP.sekme(\''+x[0]+'\')">'+esc(x[1])+'</button>'}).join('')+'</div></div>'};
MP.sekme=function(t){MP.ui.tab=t;MP.ui.ok='';MP.ui.er='';ORV.yenile()};
MP.bolum=function(ikon,baslik,ic){return '<div class="mp-bl"><div class="mp-bh"><span aria-hidden="true">'+ikon+'</span>'+baslik+'</div>'+ic+'</div>'};
MP.secim=function(alan,deger,aktif,ic,sinif){return '<button type="button" class="mp-sc'+(sinif?' '+sinif:'')+(aktif?' on':'')+'" aria-pressed="'+(aktif?'true':'false')+'" onclick="MP.sec(\''+alan+'\','+(typeof deger=='number'?deger:'\''+jq(deger)+'\'')+')">'+ic+'</button>'};
MP.form=function(){var m=MP.st(),kp=MP.kip(m.kcal),y=(m.kcal-1200)/28;
 return '<section class="mp-form">'+
  MP.bolum('👤','KAÇ KİŞİLİK?','<div class="mp-r4">'+[1,2,3,4].map(function(n){return MP.secim('kisi',n,m.kisi==n,n+' Kişilik')}).join('')+'</div>')+
  MP.bolum('🔥','GÜNLÜK KALORİ HEDEFİ','<div class="mp-kc"><div class="mp-kh"><span id="mpKip">'+kp[1]+' '+kp[0]+'</span><b id="mpKcalV">'+BR.fmt(m.kcal,0)+' kcal</b></div><input type="range" class="mp-rng" min="1200" max="4000" step="50" value="'+m.kcal+'" aria-label="Günlük kalori hedefi" oninput="MP.kcal(this.value)" style="--y:'+y+'%"><div class="mp-ol"><span>1.200</span><span>2.000</span><span>3.000</span><span>4.000</span></div><div class="mp-dgs" id="mpDag">'+MP.dagilim()+'</div></div>')+
  MP.bolum('🍽️','HANGİ ÖĞÜNLERİ İSTİYORSUNUZ?','<div class="mp-r2">'+MP.OGUN.map(function(o){return MP.secim('og',o[0],!!m.og[o[0]],'<span>'+o[2]+' '+o[1]+'</span>'+(m.og[o[0]]?'<i>✓</i>':''),'g')}).join('')+'</div>')+
  MP.bolum('💳','BÜTÇE SEGMENTİ','<div class="mp-r3">'+MP.BUTCE.map(function(b){return MP.secim('butce',b[0],m.butce==b[0],b[2]+' '+b[1],'k')}).join('')+'</div>')+
  MP.bolum('🥗','BESLENME TARZI','<div class="mp-r2">'+MP.TARZ.map(function(t){return MP.secim('tarz',t[0],m.tarz==t[0],t[2]+' '+t[1],'g')}).join('')+'</div>')+
  MP.bolum('🍏','DOLABIMDA NE VAR?','<div class="mp-chips">'+MP.DOLAP.map(function(d){return MP.secim('dolap',d[0],!!m.dolap[d[0]],d[1]+' '+d[0],'c')}).join('')+'</div><span class="oa-sub">Seçtiğin malzemeleri kullanan tarifler öne çıkar; bunlar alışveriş listesine eklenmez.</span>')+
  (MP.ui.er?'<div class="ob-uy" role="alert">'+esc(MP.ui.er)+'</div>':'')+
  '<button type="button" class="mp-go" onclick="MP.olustur()">🪄 Haftalık Planımı Oluştur</button></section>'};
MP.sonuc=function(){var m=MP.st();if(!m.plan)return '';var L=MP.ogunler().filter(function(o){return Object.keys(m.plan).some(function(k){return k.split('-')[1]==o[0]})}),pay=m.kcal,lst=MP.liste();
 if(!L.length)L=MP.OGUN.filter(function(o){return Object.keys(m.plan).some(function(k){return k.split('-')[1]==o[0]})});
 var tablo='<div class="mp-plan" style="grid-template-columns:110px repeat('+L.length+',minmax(150px,1fr)) 92px"><span></span>'+L.map(function(o){return '<span class="mp-ph">'+o[2]+' '+o[1]+'</span>'}).join('')+'<span class="mp-ph">Toplam</span>';
 for(var g=0;g<7;g++){var top=0;tablo+='<span class="mp-gn">'+MP.GUN[g]+'</span>'+L.map(function(o){var k=g+'-'+o[0],r=MP.TARIF[m.plan[k]];if(!r)return '<span class="mp-hc bos">—</span>';top+=r.kcal;var dl=r.mz.filter(function(z){return m.dolap[z.ad]}).length;
   return '<span class="mp-hc"><b>'+esc(r.ad)+'</b><span class="oa-sub">'+r.kcal+' kcal · '+'₺₺₺'.slice(0,r.b)+(dl?' · <span class="mp-dl">dolaptan '+dl+'</span>':'')+'</span><button type="button" class="br-ib mp-sw" onclick="MP.degistir(\''+k+'\')" aria-label="'+MP.GUN[g]+' '+o[1]+' yemeğini değiştir" title="Değiştir">↻</button></span>'}).join('');
  var fark=top-pay,renk=Math.abs(fark)<=pay*0.12?'#6be585':fark<0?'#f5a524':'#f87171';tablo+='<span class="mp-tp" style="color:'+renk+'"><b>'+BR.fmt(top,0)+'</b><span class="oa-sub">/ '+BR.fmt(pay,0)+'</span></span>'}
 tablo+='</div>';
 var gruplar={};lst.forEach(function(x){(gruplar[x.grup]=gruplar[x.grup]||[]).push(x)});var sira=MP.GRUP.map(function(g){return g[0]}).concat(['Diğer']),kalan=lst.filter(function(x){return !x.dolap&&!m.alindi[x.id]}).length;
 var liste=sira.filter(function(g){return gruplar[g]}).map(function(g){return '<div class="mp-lg"><div class="mp-lgh">'+esc(g)+'</div>'+gruplar[g].map(function(x){var al=!!m.alindi[x.id];return x.dolap?'<div class="mp-li dolap"><span class="mp-ck">🏠</span><span class="mp-lt">'+esc(x.ad)+'</span><span class="oa-sub">dolapta var</span></div>':
   '<button type="button" class="mp-li'+(al?' al':'')+'" onclick="MP.tik(\''+jq(x.id)+'\')" aria-pressed="'+(al?'true':'false')+'"><span class="mp-ck">'+(al?'✓':'')+'</span><span class="mp-lt">'+esc(x.ad)+'</span><b>'+esc(MP.miktar(x))+'</b></button>'}).join('')+'</div>'}).join('');
 return '<div id="mpSonuc" class="mp-sonuc">'+OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#7cf096,#16a34a)','takvim'),'7 Günlük Menü',OA.kp(m.kisi+' kişilik · '+BR.fmt(m.kcal,0)+' kcal/gün','n')),
   '<div class="mp-pw">'+tablo+'</div><div class="ob-satir" style="flex-wrap:wrap;gap:8px"><button type="button" class="oa-btn sm" onclick="MP.menuyeAktar()">Haftalık menüye aktar</button><button type="button" class="oa-btn ghost sm" onclick="MP.olustur()">↻ Yeniden oluştur</button><span class="oa-sub">Kalori değerleri yaklaşıktır; kişi başı bir porsiyon içindir.</span></div>',0)+
  OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#ffc24a,#ff7a2f)','sepet'),'Alışveriş Listesi',OA.kp(kalan+' kaldı','n')),'<div class="mp-lw">'+liste+'</div><div class="ob-satir" style="flex-wrap:wrap;gap:8px"><button type="button" class="oa-btn sm" onclick="MP.marketeEkle()">Market listesine ekle</button><span class="oa-sub">'+m.kisi+' kişi için 7 günün toplamı. Dolaptakiler ve işaretlenenler eklenmez.</span></div>',.06)+'</div>'};
MP.sayfa=function(){return '<div class="mp-pg">'+(MP.ui.ok?'<span class="ob-ok" role="status">'+esc(MP.ui.ok)+'</span>':'')+'<div class="mp-hero"><b>Haftalık planın, akıllı alışverişin.</b><span class="oa-sub">Kişi sayısına, bütçene ve beslenme tarzına uygun 7 günlük menü; otomatik alışveriş listesi. İnternet gerekmez.</span></div>'+MP.form()+MP.sonuc()+
 '<div class="mp-ozellik">'+[['📅','7 Günlük Plan'],['🛒','Otomatik Alışveriş Listesi'],['🔥','Kalori Takibi'],['💰','Bütçeye Göre Menü']].map(function(x){return '<span><i aria-hidden="true">'+x[0]+'</i>'+x[1]+'</span>'}).join('')+'</div></div>'};
// Menü & Market sayfasına alt sekme olarak bağlanır (görünümü ve mevcut listeyi bozmadan)
(function(){var d=ORV.sayfalar.market;if(!d||d._mp)return;var c=d.ciz;d._mp=1;d.ciz=function(a){var h=c.apply(this,arguments),bas=OA.aiBas('market',true),bas2=OA.aiBas('market',false),i=h.indexOf(bas),j=i<0?h.indexOf(bas2):-1,b=i>=0?bas:bas2,k=i>=0?i:j;
 if(MP.ui.tab=='plan')return '<div class="oa-pg" id="oaAi_market">'+(k>=0?h.slice(k,k+b.length):'')+MP.tabH()+MP.sayfa()+'</div>';
 return k>=0?h.slice(0,k+b.length)+MP.tabH()+h.slice(k+b.length):MP.tabH()+h}})();
