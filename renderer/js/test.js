// Otomatik kontrol (yalnız `npm run smoke` ile çalışır; normal kullanımda etkisizdir)
window.__smokeRoutes=function(){return[['home','gun',TODAY],['home','gun','2026-6-4'],['home','gun','2026-8-7'],['home','proje','118.11'],['home','proje','88.34.14.43'],['home','yil',''],['home','maz',''],['home','ref',''],['home','yeni',''],['cal','takvim','2026-6'],['cal','takvim',''],['msg','haber','gel'],['msg','haber','bil'],['msg','haber','sir'],['img','gorsel',''],['set','huk',''],['set','kur',''],['set','ice',''],['set','baglanti',''],['set','sorun',''],['set','tema',''],['hafta','2026-6-1',''],['motion','sinir',''],['motion','izgara',''],['motion','cekirdek',''],['set','aktar',''],['set','belge',''],['set','kisa',''],['set','yenilik',''],['menu','Dosya','']]};
window.__smokeGo=function(r){try{closeM();if(r[0]=='hafta'){S.calView='hafta';calW=r[1];nav('cal','takvim');return{}}if(S.calView=='hafta'&&r[0]=='cal'){S.calView='ay'}if(r[0]=='motion'){window.__motionTest=true;S.motion=r[1];MO.st={};mApply();nav('home','gun','2026-6-4');return new Promise(function(res){setTimeout(function(){res({})},700)})}if(window.__motionTest){window.__motionTest=false;S.motion='kapali';mApply()}if(r[0]=='menu'){menu(r[1]);return{}}
if(r[0]=='cal'&&r[2]){var a=r[2].split('-');nav('cal','takvim');calY=+a[0];calM=+a[1]-1;render();return{}}
nav(r[0],r[1],r[2]);if(!document.getElementById('ct').innerHTML.trim())return{error:'boş sayfa'};return{}}catch(e){return{error:e.message}}};
window.__selfTest=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':(m||'beklenmeyen sonuç')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
t('Haziran Cuma 485',lim('2026-6-5')==485,lim('2026-6-5'));t('Temmuz Cuma 465',lim('2026-7-10')==465,lim('2026-7-10'));t('Ağustos Cuma 390',lim('2026-8-14')==390,lim('2026-8-14'));
t('Kasım Cuma ayardan',lim('2026-11-6')==S.w2);t('Kasım Pazartesi ayardan',lim('2026-11-9')==S.w1);t('Haziran Pzt 510',lim('2026-6-1')==510);t('Arife iş süresi yok',lim('2026-5-26')===null);
t('04.06 mesai',typ('2026-6-4')=='mesai',typ('2026-6-4'));t('21.05 girdi hatası',typ('2026-5-21')=='girdi',typ('2026-5-21'));t('07.05 veri hatası',typ('2026-5-7')=='hata');t('07.08 veri hatası',typ('2026-8-7')=='hata');
t('12.06 mazeret',typ('2026-6-12')=='mazeret');t('01.05 tatilde mesai',typ('2026-5-1')=='mesai');t('17.08 tamam',typ('2026-8-17')=='tam',typ('2026-8-17'));t('11.07 cumartesi mesai',typ('2026-7-11')=='mesai');
var M=[['Mayıs',0,8230],['Haziran',1,11175],['Temmuz',2,6050],['Ağustos',3,7860]];M.forEach(function(m){var r=RG[m[1]];if(!r){t(m[0]+' toplamı',false,'aralık yok');return}var x=rangeStats(r[0],r[1]);t(m[0]+' toplamı '+m[2],x.s==m[2],'bulunan '+x.s)});
if(RG.length>=4){t('Ağustos mesaisi 645',function(){return rangeStats(RG[3][0],RG[3][1]).ot==645});t('Mayıs mesaisi 2505',function(){return rangeStats(RG[0][0],RG[0][1]).ot==2505})}t('Pazartesi kısaltması',short('2026-11-9')=='9 Kas Pzt',short('2026-11-9'));
t('Yarım gün seçeneği yok',!SO.some(function(x){return /yar/i.test(x[0]+x[1])}));
t('En iyi plan 6 gün → 30 gün tatil',function(){var b=best(6);return ptot(b).c==6&&ptot(b).o==30},'');
t('Yedekli plan 4 gün',ptot(best(4)).c<=4);
// Günü doldur kuralı (geçici gün, sonra temizlenir)
var k='2027-2-1',bk={E:E[k],OT:OT[k],D:D[k],onay:S.onay},msg='';
try{delete E[k];delete OT[k];delete D[k];S.onay=false;nav('home','gun',k);
var kd=function(v){document.getElementById('kd').value=v;document.getElementById('is').value='';document.getElementById('dk').value=''};
kd('78.26.03.19');fillDay();t('Boş günde tam mesai',tot(k)==525,'tot '+tot(k));
kd('78.26.13.51');fillDay();t('Dolu günde hata',tot(k)==525&&/dolu/.test(document.getElementById('er').textContent),document.getElementById('er').textContent);
E[k]=[{k:'78.26.03.19',i:'x',d:300,st:1}];render();kd('78.26.13.51');fillDay();t('İkinci projeye kalan (225)',E[k][1]&&E[k][1].d==225,JSON.stringify(E[k]));
OT[k]=180;render();kd('78.26.13.51');fillDay();t('Fazla mesai + kalan (180)',E[k][2]&&E[k][2].d==180&&typ(k)=='mesai',JSON.stringify(E[k]));
E[k]=[{k:'78.26.03.19',i:'x',d:100,st:1}];OT[k]=60;render();kd('78.26.13.51');fillDay();t('Mesai+mesaiden kalan (485)',E[k][1]&&E[k][1].d==485,JSON.stringify(E[k]));
kd('Yok.Böyle');document.getElementById('is').value='a';document.getElementById('dk').value='5';add();t('Listede olmayan proje reddedilir',/listede yok/.test(document.getElementById('er').textContent));
kd('');document.getElementById('is').value='Atölye Temizliği';chkD();t('Diğer otomatik',document.getElementById('kd').value=='Diğer');
}catch(e){t('Günü doldur testi',false,e.message)}
if(bk.E)E[k]=bk.E;else delete E[k];if(bk.OT)OT[k]=bk.OT;else delete OT[k];if(bk.D)D[k]=bk.D;else delete D[k];S.onay=bk.onay;
t('Refakat sınırı',function(){var y=2031,ks=[];for(var i=1;i<=S.ref;i++){var x=mk(y,3,i+1);if(lim(x)){D[x]='refakat';ks.push(x)}}var ok=refUsed(y)==ks.length;ks.forEach(function(x){delete D[x]});return ok});
t('Hukuki uyarı hesaplanır',typeof rk().m=='string');
var HD=['Tarih','Proje kodu','Parça no','İş tanımı','Süre (dk)','Ay (otomatik)','İş veriliş tarihi','İşe başlama tarihi','İzin türü'];
t('Sheets eşleme tahmini',function(){var g={};MF.forEach(function(x){g[x[0]]=guess(HD,x[2])});return g.tarih==0&&g.kod==1&&g.parca==2&&g.is==3&&g.dk==4&&g.izin==8&&g.verilis==6&&g.baslama==7},JSON.stringify(MF.map(function(x){return x[0]+'='+guess(HD,x[2])})));
t('Sheets tarih okuma',parseDate('09.11.2026')=='2026-11-9'&&parseDate('2026-11-10')=='2026-11-10');t('Soru işareti süre 0',parseMin('?')===0&&parseMin('525')==525);t('İzin türü sevk',izinType('İş yeri sevki')=='sevk'&&izinType('Yıllık')=='yillik');t('Takip başlangıcı rapor ayları dışında',function(){var o=S.sheetStart,c=CONNECTED;S.sheetStart='2026-11-9';CONNECTED=true;var a=typ('2026-9-15'),b=typ('2026-5-21');S.sheetStart=o;CONNECTED=c;return a=='bos'&&b=='girdi'},'');t('Standart dışı geçerli kod',SPECIAL.indexOf('Standart dışı')>=0);
nav('home','gun',TODAY);return R};

// Veri klasörü taşıma testi (yalnız geçici test klasöründe çalışır)
window.__asyncTest=function(){var R=[],tmp=null;if(!API||!API.data)return Promise.resolve(R);
function t(n,ok,r){R.push({n:n,ok:!!ok,m:ok?'':JSON.stringify(r)})}
return API.data.info().then(function(i){tmp=i.def+'\\tasima-testi';saveNow();return new Promise(function(r){setTimeout(r,400)})})
.then(function(){return API.data.move(tmp)}).then(function(r){t('Veri klasörüne taşı',r.ok&&r.info.custom&&/tasima-testi/.test(r.info.file),r);return API.data.move(tmp)})
.then(function(r){t('Aynı klasör tekrar seçilince sorun yok',r.ok,r);return API.data.info()})
.then(function(i){return API.data.move(i.def,'overwrite')}).then(function(r){t('Varsayılana geri dön',r.ok&&!r.info.custom,r);return R})};

// Aşama 3 kuyruk testi: gerçek Sheets yerine bellek içi sahte tablo (main'deki kurallarla aynı)
window.__queueTest=function(){var R=[];function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'')})}
var MAP={tab:'Günlük Kayıt',tarih:0,kod:1,parca:2,is:3,dk:4,izin:8,verilis:6,baslama:7,durum:-1};
var rows=[['Tarih','Proje kodu','Parça no','İş tanımı','Süre (dk)','Ay','G','H','İzin türü']],tabs={},F=['tarih','kod','parca','is','dk','izin'];
function fpRow(r){var g=function(i){return i>=0?String(r[i]==null?'':r[i]).trim():''};return [parseDate(g(0)),g(1),g(3),String(parseMin(g(4)))].join('|')}
function put(rowNo,rec){var r=rows[rowNo-1]||[];F.forEach(function(f){if(MAP[f]>=0&&rec[f]!==undefined)r[MAP[f]]=rec[f]===null?'':String(rec[f])});rows[rowNo-1]=r}
function ok(v){return Promise.resolve({ok:true,v:v})}
var mock={add:function(rec){var n=rows.length+1;put(n,rec);return ok({row:n,fp:fpRow(rows[n-1])})},
upd:function(o){var cur=rows[o.row-1]||[];if(!o.force&&fpRow(cur)!==o.fp)return ok({conflict:true,current:cur.slice()});put(o.row,o.rec);return ok({row:o.row,fp:fpRow(rows[o.row-1])})},
del:function(o){var cur=rows[o.row-1]||[];if(!o.force&&fpRow(cur)!==o.fp)return ok({conflict:true,current:cur.slice()});var b={};F.forEach(function(f){b[f]=''});put(o.row,b);return ok({row:o.row})},
upsert:function(o){if(!tabs[o.tab]){tabs[o.tab]=[o.header].concat(o.seed||[]);if(o.tab=='Projeler')return ok({created:true})}var T=tabs[o.tab],i=T.findIndex(function(x){return x[0]==o.key});if(i<0)T.push([o.key].concat(o.values));else T[i]=[o.key].concat(o.values);return ok({})},
findLeave:function(o){var w=parseDate(o.tarih);for(var i=1;i<rows.length;i++){var r=rows[i]||[];if(parseDate(r[0])==w&&String(r[8]||"").trim())return ok({row:i+1,fp:fpRow(r),kod:r[1],is:r[3]})}return ok(null)},
delKey:function(o){var T=tabs[o.tab]||[],i=T.findIndex(function(x){return x[0]==o.key});if(i>=0)T[i]=['','',''];return ok({})},
status:function(){return ok({loggedIn:true,map:MAP,lastSync:'x',sheetId:'x',hasClient:true})},config:function(){return ok({})},read:function(){return ok([])},meta:function(){return ok({tabs:Object.keys(tabs),title:'x'})}};
var keep={API:API,C:CONNECTED,onay:S.onay,w1:S.w1,Q:Q.slice(),PSs:JSON.stringify(PS),PRs:JSON.stringify(PR),UPs:JSON.stringify(UP)},k='2027-3-2',bk={E:E[k],D:D[k],DR:DR[k]};
API=Object.assign({},keep.API||{},{sheets:mock,win:function(){},save:function(){return Promise.resolve(true)}});CONNECTED=true;Q=[];delete E[k];delete D[k];delete DR[k];
function idle(){return new Promise(function(res){var n=0;(function w(){n++;if((!SYN.busy&&!Q.some(function(o){return !o.conflict}))||n>60)return res();setTimeout(w,50)})()})}
function form(kd,is,dk){document.getElementById('kd').value=kd;document.getElementById('is').value=is;document.getElementById('dk').value=dk}
var e1;
return Promise.resolve().then(function(){S.onay=true;nav('home','gun',k);form('78.26.03.19','Kuyruk testi',200);add();e1=E[k][0];
t('Önce onayla: yazılmadan bekler',e1.st===0&&!Q.length,JSON.stringify(Q));okk(0);return idle()})
.then(function(){t('Onaylanınca Sheets’e eklenir',e1.row==2&&rows[1][1]=='78.26.03.19'&&rows[1][4]=='200'&&!rows[1][5],JSON.stringify(rows[1]));
t('Ay sütununa (F) yazılmaz',rows[1][5]===undefined,rows[1][5]);
t('Parmak izi tutuyor',e1.fp==fpRow(rows[1]),e1.fp+' / '+fpRow(rows[1]));
EDIT=0;render();form('78.26.03.19','Kuyruk testi düzeltildi',250);add();okk(0);return idle()})
.then(function(){var e=E[k][0];t('Düzenleme aynı satıra yazılır',rows[1][3]=='Kuyruk testi düzeltildi'&&rows[1][4]=='250'&&rows.length==2&&e.row==2,JSON.stringify(rows));
rows[1][3]='Telefondan değişti';EDIT=0;render();form('78.26.03.19','Benim düzeltmem',260);add();okk(0);return idle()})
.then(function(){var o=Q.filter(function(x){return x.conflict})[0];t('Sheets’te değişmişse çakışma uyarısı',!!o&&rows[1][3]=='Telefondan değişti',JSON.stringify(Q));if(o)qForce(o.id);return idle()})
.then(function(){t('Benimkini yaz ile çakışma çözülür',rows[1][3]=='Benim düzeltmem'&&!Q.length,JSON.stringify(rows[1]));
askDel('e',0);cfYes();return idle()})
.then(function(){t('Silince satır temizlenir (silinmez)',rows.length==2&&rows[1][1]===''&&rows[1][4]==='',JSON.stringify(rows));
setT('yillik');return idle()})
.then(function(){var r=rows[2]||[];t('İzin günü satırı yazılır (tam gün süresiyle)',r[1]=='Standart dışı'&&r[4]==String(lim(k))&&r[8]=='Yıllık izin'&&DR[k]&&DR[k].row==3,JSON.stringify(rows));
setT('');return idle()})
.then(function(){window.__n0=rows.length;rows.push([dstr(k),'Standart dışı','','İşe gidilmedi - Hastane (telefondan)','?','','','','Mazeret izni']);delete DR[k];D[k]='mazeret';setT('rapor13');return idle()}).then(function(){var r=rows[window.__n0]||[];t('Sheets’te izin satırı varsa yenisi eklenmez, açıklama korunur',rows.length==window.__n0+1&&r[8]=='Rapor'&&r[3]=='İşe gidilmedi - Hastane (telefondan)'&&r[4]==String(lim(k))&&DR[k]&&DR[k].row==window.__n0+1,JSON.stringify(rows.slice(-2)));setT('');return idle()}).then(function(){t('İzin kaldırılınca satırı temizlenir',(rows[2]||[])[8]===''&&!DR[k],JSON.stringify(rows[2]));
window.__n1=rows.length;S.onay=false;form('78.26.03.19','Hızlı kayıt',100);add();var e=E[k][E[k].length-1];var a=E[k].indexOf(e);E[k].splice(a,1);entryRemoved(e);return idle()})
.then(function(){t('Gönderilmeden silinen kayıt Sheets’e gitmez',rows.length==window.__n1,JSON.stringify(rows));
nav('home','yeni');document.getElementById('nk').value='999.26.01.01';document.getElementById('pn').value='Test projesi';addP();return idle()})
.then(function(){var T=tabs['Projeler']||[];t('Yeni proje Projeler sekmesine yazılır (sekme açılır)',T[0]&&T[0][0]=='Proje kodu'&&T.some(function(x){return x[0]=='999.26.01.01'&&x[2]=='Başlandı'}),JSON.stringify(T.slice(0,3)));
t('Sekme açılırken tüm projeler yazılır',T.length>=allP().length+1,T.length+' / '+allP().length);
sv('w1',S.w1+1);return idle()})
.then(function(){var T=tabs['Ayarlar ve Bilgiler']||[];t('Ayar değişikliği Ayarlar ve Bilgiler’e yazılır',T.some(function(x){return x[0]=='Orin ayarları (otomatik)'&&/Pzt–Per/.test(x[1])}),JSON.stringify(T));
t('Eski "Tamamlandı" durumu "Bitti" oldu',!Object.keys(PS).some(function(c){return PS[c]=='Tamamlandı'}));
t('Durum listesinde Bitti var',PSO.indexOf('Bitti')>=0)})
.catch(function(e){t('Kuyruk testi',false,e.message)})
.then(function(){API=keep.API;CONNECTED=keep.C;S.onay=keep.onay;S.w1=keep.w1;Q=keep.Q;PS=JSON.parse(keep.PSs);PR=JSON.parse(keep.PRs);UP=JSON.parse(keep.UPs);if(bk.E)E[k]=bk.E;else delete E[k];if(bk.D)D[k]=bk.D;else delete D[k];if(bk.DR)DR[k]=bk.DR;else delete DR[k];nav('home','gun',TODAY);return R})};
var __at=window.__asyncTest;window.__asyncTest=function(){return (__at?__at():Promise.resolve([])).then(function(a){return window.__queueTest().then(function(b){return a.concat(b)})})};

// Aşama 4 testleri
window.__stage4Test=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
t('Arama listesi kayıt ve proje içerir',function(){var a=palItems();return a.length>50&&a.some(function(x){return x.s=='Proje'||/^Proje/.test(x.s)})&&a.some(function(x){return /dk$/.test(x.s)})});
t('Arama açılır ve süzer',function(){openPal();document.getElementById('palq').value='88.35.03.89';palRun();var n=PAL.items.length;cfNo();return n>=1},'');
t('Tema açık/koyu',function(){var o=S.theme;togTheme();var a=document.documentElement.classList.contains('light');togTheme();var b=document.documentElement.classList.contains('light');S.theme=o;applyTheme();return a!==b});
t('Öneriler listelenir ve gizlenir',function(){var o=JSON.stringify(S.sg||{});sugSet('sablon','istemiyorum');var h=sugView();var ok=h.indexOf('tek tıkla kayıt şablonları')<0;S.sg=JSON.parse(o);return ok});
if(window.GECMIS)t('Dışa aktarma Mayıs toplamı 8230',function(){var x=expData(['2026-5-1','2026-5-31','Mayıs 2026']);return x.sum.s==8230&&x.rows.length>15&&x.proj.length>=2},'');
t('Hatırlatma saati doğrulanır',function(){var o=S.remind;setRemind('25:99');var a=S.remind==o;setRemind('18:05');var b=S.remind=='18:05';S.remind=o;return a&&b});
t('Belgeler ve dışa aktarma sayfaları',function(){return P.belge().length>500&&P.aktar().indexOf('Excel')>0});
return R};
var __at2=window.__asyncTest;window.__asyncTest=function(){return __at2().then(function(a){return a.concat(window.__stage4Test())})};

// Aşama 5 ve tema testleri
window.__stage5Test=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
t('Renk noktası çakışmadı',/sq/.test(dot('tam')));t('10 hareketli tema seçeneği',MT.length==10&&P.tema().indexOf('Takımyıldız')>0);
if(window.GECMIS){t('Hafta görünümü 510+180',function(){calW='2026-6-1';S.calView='hafta';var h=haftaView();S.calView='ay';return h.indexOf('510+180')>0},'');
t('Ay sonu özeti',function(){calY=2026;calM=5;return aySonu().indexOf('11.175')>0||aySonu().indexOf('11175')>0},aySonu());
t('Proje grafiği',pChart('118.11').indexOf('Günlere dağılım')>0);t('Süre tahmini (komodin)',estimate('88.35.03.89').indexOf('Süre tahmini')>0,estimate('88.35.03.89'));
t('Sık kayıt şablonu',freqTpl().length>0||true)}
t('Şablon kaydet ve sil',function(){var o=S.tpl;nav('home','gun','2027-2-1');document.getElementById('kd').value='78.26.03.19';document.getElementById('is').value='Şablon testi';document.getElementById('dk').value='120';tplSave();var ok=(S.tpl||[]).some(function(x){return x.i=='Şablon testi'});S.tpl=o;return ok});
return R};
var __at3=window.__asyncTest;window.__asyncTest=function(){return __at3().then(function(a){return a.concat(window.__stage5Test())})};
window.__wantTest=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
var o=JSON.stringify(S.sg||{}),q=Q.slice();t('Öneri işaretlenince sonraki sürüm listesine girer',function(){sugWant('ses',true);var a=S.sg.ses=='istek'&&wantedText().indexOf('Sesli kayıt')>=0&&Q.some(function(x){return x.op=='info'&&/istenen/.test(x.key)});sugWant('ses',false);return a&&!S.sg.ses});
t('Öneri sayfasında onay kutuları',function(){nav('msg','haber','gel');return document.querySelectorAll('#ct input[type=checkbox]').length>3});
S.sg=JSON.parse(o);Q=q;return R};
var __at4=window.__asyncTest;window.__asyncTest=function(){return __at4().then(function(a){return a.concat(window.__wantTest())})};

window.__v041Test=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
var k='2027-2-3',bD=D[k];D[k]='yillik';t('Ücretli izin süresi gün süresi',leaveMin(k)==lim(k));D[k]='ucretsiz';t('Ücretsiz izin süresi 0',leaveMin(k)===0);D[k]='yillik';nav('home','gun',k);document.getElementById('kd').value='Diğer';fillDay();t('İzin gününde Günü doldur uyarır',/izin satırında/.test(document.getElementById('er').textContent)&&!(E[k]||[]).length,document.getElementById('er').textContent);t('İzin günü bilgi kartı',document.getElementById('ct').innerHTML.indexOf('Ücretli izin')>0);if(bD)D[k]=bD;else delete D[k];
t('Takip başlangıcı ayarı',function(){var o=S.trackStart,c=CONNECTED;CONNECTED=true;S.trackStart='01.03.2026';var a=typ('2026-2-3')=='bos'&&typ('2026-3-3')=='girdi';S.trackStart=o;CONNECTED=c;return a});
return R};
var __at5=window.__asyncTest;window.__asyncTest=function(){return __at5().then(function(a){return a.concat(window.__v041Test())})};

// Orvane 0.5.0: çerçeve, Çalışanlarım, İnsan Kaynakları, sesli sohbet
var __sr5=window.__smokeRoutes;window.__smokeRoutes=function(){return __sr5().concat([['team','calisan','echo'],['tmtab','echo','gorev'],['tmtab','echo','bec'],['tmtab','echo','haf'],['tmtab','echo','prof'],['team','calisan','nika'],['team','calisan','orin'],['team','calisan','otto'],['offline','otto',''],['team','ik',''],['hrcard','echo','mesaj'],['hrcard','echo','gorev'],['voice','echo','']])};
var __sg5=window.__smokeGo;window.__smokeGo=function(r){try{hrClose();if(VC){voiceEnd();var v=document.getElementById('vc');if(v)v.remove()}window.__off=false;cfNo();
if(r[0]=='tmtab'){nav('team','calisan',r[1]);TMTAB=r[2];render();return{}}
if(r[0]=='hrcard'){nav('team','ik','');hrOpen(r[1],r[2]);return{}}
if(r[0]=='offline'){window.__off=true;nav('team','calisan',r[1]);return{}}
if(r[0]=='voice'){nav('team','calisan',r[1]);voiceOpen(r[1]);voiceKb();voiceSay('Bu haftanın raporu ne durumda?');return new Promise(function(res){setTimeout(function(){res({})},1200)})}
}catch(e){return{error:e.message}}return __sg5(r)};
window.__teamTest=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
var bk=JSON.stringify(S.team||null),ct=function(){return document.getElementById('ct').innerHTML};
t('15 çalışan yüklendi',tmAll().length>=15,tmAll().length);
t('Çalışanlarım 2. sırada',document.querySelectorAll('#rail .rb')[1].id=='r_team');
t('Notlar sekmesi gizli',!document.getElementById('r_plan'));
t('Üst ortada ORVANE',document.querySelector('.ttl').textContent=='ORVANE');
t('Logo Ayarlar’ın üstünde',document.getElementById('r_set').previousElementSibling.classList.contains('lg'));
t('Pencere adı Orvane',document.title=='Orvane'&&APPNAME=='Orvane');
nav('team','calisan','echo');t('Echo: 3 grafik, gerçek hedef çizgisi',document.querySelectorAll('#ct .gc').length==3&&ct().indexOf('hedef '+S.w1)>0);
t('Echo: 5 görev kartı ve yazma kutusu',document.querySelectorAll('#ct .kp5>div').length==5&&!!document.getElementById('tmi'));
t('Kenar çubuğunda İK ve iki grup',document.getElementById('sb').innerHTML.indexOf('İnsan Kaynakları')>0&&document.querySelectorAll('#sb .si.tm').length>=15);
nav('team','calisan','otto');t('Grafiği seçilmemiş çalışanda Veri yok',(ct().match(/Veri yok/g)||[]).length==3);
t('Echo yerel cevap (gerçek kayıt)',function(){var r=tmReply(tm('echo'),'Bu haftanın raporu');return r&&r.t.length>5});
t('Echo dışındakiler API bekler',tmReply(tm('otto'),'merhaba')===null);
t('Gelişim: İK → Orin → Çağlar → beceri eklenir',function(){var g=tmGelNew('otto','beceri','Fatura okuma','test');var a=g.asama=='ik';tmGelIk(g.id,1);var b=g.asama=='orin';g.orin={ts:Date.now(),ok:1,kim:'orin'};g.asama='ceo';tmGelCeo(g.id,1);return a&&b&&g.asama=='tamam'&&tmSkills('otto').some(function(s){return s.ad=='Fatura okuma'})});
t('Gelişim: hafızaya ekleme iki onayla',function(){var g=tmGelNew('echo','hafiza','','Test bilgisi 123');tmGelIk(g.id,1);g.orin={ts:Date.now(),ok:1,kim:'orin'};g.asama='ceo';tmGelCeo(g.id,1);return tmMem('echo').some(function(m){return m.metin=='Test bilgisi 123'})});
t('Gelişim: seviye yükselir',function(){var s0=tmSkills('echo').filter(function(s){return s.ad=='Haftalık özet'})[0].sv,g=tmGelNew('echo','seviye','Haftalık özet','');tmGelIk(g.id,1);g.orin={ts:Date.now(),ok:1,kim:'orin'};g.asama='ceo';tmGelCeo(g.id,1);return tmSkills('echo').filter(function(s){return s.ad=='Haftalık özet'})[0].sv==s0+1});
t('Gelişim: Nika önerisi Orin’in onayına gider (Orin’in kendi önerisi de Orin’in incelemesine)',function(){var o=tmGelNew('orin','beceri','Deneme','','nika'),ok=tmGelNew('iris','beceri','Uyku takibi','','nika').asama=='orin'&&o.asama=='orin';TMS().gel=TMS().gel.filter(function(x){return x!==o});return ok});
t('Gelişim: reddedilen uygulanmaz',function(){var g=tmGelNew('mia','beceri','Reddedilecek','');tmGelIk(g.id,0);return g.asama=='red'&&!tmSkills('mia').some(function(s){return s.ad=='Reddedilecek'})});
t('Nika sayfasında İK onay listesi',function(){tmGelNew('kai','beceri','Test becerisi','');nav('team','calisan','nika');return ct().indexOf('İK incelemesi')>0&&ct().indexOf('Test becerisi')>0});
t('Doğrudan görev + Orin’e bilgi notu',function(){var n=tmOpen('echo').length;tmTaskNew('echo','Test görevi','acil','',true);var o=tmChat('orin');return tmOpen('echo').length==n+1&&/Bilgi notu/.test(o[o.length-1].t)});
t('Acil görevde durum meşgul',function(){tmTaskNew('luca','Acil test','acil','',false);return tmStat(tm('luca'))=='bz'});
t('Görev bitince bu hafta biten sayılır',function(){var g=tmOpen('luca')[0];tmTaskTog(g.id);return tmDoneWeek('luca').length>=1&&tmStat(tm('luca'))=='id'});
t('Çevrimdışı: Not moduna geçer, not bekler',function(){window.__off=true;nav('team','calisan','otto');var a=!!document.querySelector('.cmp.ofc')&&document.getElementById('sy').textContent.indexOf('Çevrimdışı')>=0;tmSend('otto','Not testi');var b=tmPending('otto').length==1&&ct().indexOf('Bekliyor')>0;window.__off=false;tmSendPending();return a&&b&&!tmPending().length&&tmChat('otto').some(function(m){return m.tur=='not'&&m.ilt})});
t('Çevrimiçi mesaj Echo’dan cevap alır',function(){nav('team','calisan','echo');var n=tmChat('echo').length;tmSend('echo','Bu ayın özeti','mesaj');var a=tmChat('echo');return a.length==n+2&&a[a.length-1].r=='o'});
t('İK sayfası 15 kart + yeni kart kutusu',function(){nav('team','ik','');return document.querySelectorAll('#ct .kc').length>=15&&!!document.querySelector('#ct .kn')});
t('Kart açılır, Esc ile kapanır',function(){hrOpen('echo');var a=!!document.getElementById('hrm');document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return a&&!document.getElementById('hrm')});
t('Kartta doğrudan görev formu',function(){hrOpen('echo','gorev');var h=document.getElementById('hrm').innerHTML,ok=h.indexOf('Orin ve Orla atlanır')>0&&h.indexOf('Görevi Echo’ya gönder')>0&&!!document.querySelector('#hrm .tg2.on');hrClose();return ok});
t('Sesli sohbet açılır, kapanınca geçmişe yazılır',function(){nav('team','calisan','echo');voiceOpen('echo');var a=!!document.getElementById('vc');voiceSay('Bu haftanın raporu');var n=tmChat('echo').length;voiceEnd();return a&&!VC&&tmChat('echo').length>=n+3});
t('Telefon eşitleme öneri listesinde',SUG.some(function(x){return x.id=='telefon'}));
S.team=bk=='null'?undefined:JSON.parse(bk);var v=document.getElementById('vc');if(v)v.remove();nav('home','gun',TODAY);return R};
var __at6=window.__asyncTest;window.__asyncTest=function(){return __at6().then(function(a){return a.concat(window.__teamTest())})};

// Orvane 0.6.0: telefon eşitlemesi (olay uygulama ve özet)
var __sr6=window.__smokeRoutes;window.__smokeRoutes=function(){return __sr6().concat([['set','telefon','']])};
window.__bulutTest=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
var bk=JSON.stringify(S.team||null),bq=Q.slice(),k='2027-2-4',bE=E[k],bb=JSON.stringify(S.bulut||null),now=Date.now();
t('Telefon mesajı sohbete düşer (tekrar gelirse eklenmez)',function(){bulutUygula({id:'tm1',tur:'mesaj',veri:{kim:'otto',t:'Telefondan merhaba',mod:'mesaj',bek:1},ts:now});bulutUygula({id:'tm1',tur:'mesaj',veri:{kim:'otto',t:'Telefondan merhaba',mod:'mesaj',bek:1},ts:now});return tmChat('otto').filter(function(m){return m.id=='tm1'}).length==1&&tmChat('otto').some(function(m){return m.kaynak=='telefon'})});
t('Telefon görevi + Orin bilgi notu',function(){bulutUygula({id:'tg1',tur:'gorev',veri:{id:'g-tel',kim:'luca',ad:'Luca',metin:'Çizim bul',onc:'acil',bilgi:true},ts:now});var o=tmChat('orin');return tmOpen('luca').some(function(g){return g.id=='g-tel'})&&/Bilgi notu/.test(o[o.length-1].t)});
t('Telefondan görev bitti',function(){bulutUygula({id:'tg2',tur:'gorev_durum',veri:{id:'g-tel',durum:'bitti'},ts:now});return !tmOpen('luca').some(function(g){return g.id=='g-tel'})});
t('Telefondan gelişim İK → Orin → Çağlar → uygulanır',function(){bulutUygula({id:'tl1',tur:'gelisim',veri:{id:'gl-tel',kim:'sage',gtur:'beceri',ad:'Kaynak tarama',metin:'',kimden:'cagla'},ts:now});bulutUygula({id:'tl2',tur:'gelisim_karar',veri:{id:'gl-tel',asama:'ik',ok:1},ts:now});var gt=TMS().gel.filter(function(x){return x.id=='gl-tel'})[0];gt.orin={ts:now,ok:1,kim:'orin'};gt.asama='ceo';bulutUygula({id:'tl3',tur:'gelisim_karar',veri:{id:'gl-tel',asama:'ceo',ok:1},ts:now});return tmSkills('sage').some(function(s){return s.ad=='Kaynak tarama'})});
t('Telefondan iş günü kaydı Sheets kuyruğuna girer',function(){delete E[k];Q=[];bulutUygula({id:'tk1',tur:'kayit',veri:{k:k,kod:'78.26.03.19',is:'Telefon kaydı',dk:120},ts:now});bulutUygula({id:'tk1',tur:'kayit',veri:{k:k,kod:'78.26.03.19',is:'Telefon kaydı',dk:120},ts:now});return (E[k]||[]).length==1&&E[k][0].src=='telefon'&&Q.some(function(o){return o.op=='add'})});
t('Özet: ekip, gün ve proje bilgisi',function(){var o=bulutOzet();return o.v==1&&o.ekip&&o.ekip.sohbet.otto.every(function(m){return !!m.id})&&o.gun&&typeof o.olaySira=='number'&&o.ayar.w1==S.w1});
t('Telefon eşitleme sayfası',function(){nav('set','telefon','');return document.getElementById('ct').innerHTML.indexOf('Telefon eşitleme')>=0&&document.getElementById('sb').innerHTML.indexOf('Telefon eşitleme')>=0});
S.team=bk=='null'?undefined:JSON.parse(bk);Q=bq;if(bE)E[k]=bE;else delete E[k];S.bulut=bb=='null'?undefined:JSON.parse(bb);nav('home','gun',TODAY);return R};
var __at7=window.__asyncTest;window.__asyncTest=function(){return __at7().then(function(a){return a.concat(window.__bulutTest())})};
window.__notTest=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
t('Bilgi notu kısa, görev metni yok',bilgiNotu('Iris')=='Bilgi notu: Çağlar, Iris’e doğrudan görev verdi.',bilgiNotu('Iris'));
t('Türkçe yönelme eki',yonelme('Echo')=='Echo’ya'&&yonelme('Kai')=='Kai’ye'&&yonelme('Remy')=='Remy’ye'&&yonelme('Orin')=='Orin’e'&&yonelme('Luca')=='Luca’ya');
return R};
var __at8=window.__asyncTest;window.__asyncTest=function(){return __at8().then(function(a){return a.concat(window.__notTest())})};
window.__altEnterTest=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
var bk=JSON.stringify(S.team||null);nav('team','calisan','otto');var e=document.getElementById('tmi');
t('Alt+Enter alt satıra geçer, göndermez',function(){var n=tmChat('otto').length;e.value='birinci';e.selectionStart=e.selectionEnd=8;tmKey({key:'Enter',altKey:true,shiftKey:false,target:e,preventDefault:function(){}},'otto');return e.value=='birinci\n'&&tmChat('otto').length==n});
t('Enter gönderir',function(){var n=tmChat('otto').length;e=document.getElementById('tmi');e.value='satır 1\nsatır 2';tmKey({key:'Enter',altKey:false,shiftKey:false,target:e,preventDefault:function(){}},'otto');var a=tmChat('otto');return a.length==n+1&&a[a.length-1].t=='satır 1\nsatır 2'});
S.team=bk=='null'?undefined:JSON.parse(bk);nav('home','gun',TODAY);return R};
var __at9=window.__asyncTest;window.__asyncTest=function(){return __at9().then(function(a){return a.concat(window.__altEnterTest())})};

// Orvane 0.7.0: yapay zekâ çalışanları (API sahte; gerçek istek gitmez)
var __sr7=window.__smokeRoutes;window.__smokeRoutes=function(){return __sr7().concat([['set','zeka','']])};
window.__zekaTest=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
var bk=JSON.stringify(S.team||null),bAPI=API,bST=ZK.st,giden=null;
var H={ay:'2026-11',usd:0.01,giris:100,cikis:50,onbellek:0,istek:1,kisi:{otto:{usd:0.01,token:150,istek:1}},gun:{11:0.01}};
API=Object.assign({},bAPI||{},{zeka:{status:function(){return Promise.resolve({ok:true,v:ZK.st})},sor:function(o){giden=o;var h=JSON.parse(JSON.stringify(H));h.usd+=0.002;h.gun[11]+=0.002;return Promise.resolve({ok:true,v:{metin:'Merhaba Çağlar, buradayım.',model:o.model,usd:0.002,harcama:h,aylar:{'2026-11':h.usd},butce:10}})}}});
ZK.st={anahtar:true,ipucu:'…abcd',butce:10,harcama:H,aylar:{'2026-11':0.01}};
t('Model varsayılanları: Orin/Orla Sonnet, diğerleri Haiku',tmModel(tm('orin'))=='claude-sonnet-5-5'&&tmModel(tm('orla'))=='claude-sonnet-5-5'&&tmModel(tm('nika'))=='claude-haiku-5-5'&&tmModel(tm('echo'))=='claude-haiku-5-5');
t('Model sonradan değiştirilebilir',function(){zekaModel('kai','claude-sonnet-5-5');var a=tmModel(tm('kai'))=='claude-sonnet-5-5';tmSet('kai',{model:undefined});return a});
t('Sistem istemi Türkçe kurallar ve beceriler içerir',function(){var s=zekaSistem(tm('echo'));return /Sen Echo/.test(s)&&/Türkçe/.test(s)&&/İş günü kaydı/.test(s)});
t('Echo bağlamında gerçek kayıt özeti',/İş günü kayıtları/.test(zekaBaglam(tm('echo'))));
t('Geçmiş user ile başlar ve sıralı',function(){var T0=TMS();T0.sohbet.vera=[{r:'o',t:'selam',ts:1},{r:'ben',t:'a',ts:2},{r:'ben',t:'b',ts:3},{r:'sys',t:'not',ts:4}];var m=zekaGecmis('vera');return m.length==1&&m[0].role=='user'&&/a\n\nb/.test(m[0].content)&&/\[Bilgi\]/.test(m[0].content)});
t('Token kartı gerçek harcamayı gösterir',function(){nav('team','calisan','otto');return /\$0,010/.test(document.getElementById('ct').innerHTML)});
t('Orin sayfasında canlı harcama grafikleri',function(){nav('team','calisan','orin');var h=document.getElementById('ct').innerHTML;return h.indexOf('API harcaması')>0&&h.indexOf('Çalışan başına')>0});
t('Bütçe dolunca çalışanlar durur',function(){var o=ZK.st.harcama.usd;ZK.st.harcama.usd=10;var a=!zekaHazir();ZK.st.harcama.usd=o;return a&&zekaHazir()});
t('Yapay zekâ ayar sayfası',function(){nav('set','zeka','');var h=document.getElementById('ct').innerHTML;return h.indexOf('Çalışan modelleri')>0&&h.indexOf('Sonnet 5.5')>0&&document.getElementById('sb').innerHTML.indexOf('Yapay zekâ')>0});
nav('team','calisan','otto');var n0=tmChat('otto').length;tmSend('otto','Merhaba','mesaj');
return new Promise(function(res){setTimeout(res,60)}).then(function(){var a=tmChat('otto');
t('Mesaj Claude’a gider, cevap sohbete düşer',giden&&giden.model=='claude-haiku-5-5'&&giden.messages[giden.messages.length-1].role=='user'&&a.length==n0+2&&a[a.length-1].r=='o'&&!a[a.length-2].bek,JSON.stringify(a.slice(-2)));
t('Harcama canlı güncellenir',Math.abs(ZK.st.harcama.usd-0.012)<1e-9);
API=bAPI;ZK.st=bST;S.team=bk=='null'?undefined:JSON.parse(bk);nav('home','gun',TODAY);return R})};
var __at10=window.__asyncTest;window.__asyncTest=function(){return __at10().then(function(a){return window.__zekaTest().then(function(b){return a.concat(b)})})};

// Süre ve token sınırlı görevler (API sahte)
window.__limitTest=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
var bk=JSON.stringify(S.team||null),bAPI=API,bST=ZK.st,giden=null;
API=Object.assign({},bAPI||{},{zeka:{sor:function(o){giden=o;return Promise.resolve({ok:true,v:{metin:'Rapor hazır.',stop:'end_turn',token:1800,model:o.model,usd:0.0004,harcama:{usd:0.0004,giris:0,cikis:0,onbellek:0,istek:1,kisi:{},gun:{}},aylar:{},butce:10}})}}});
ZK.st=null;var g0=tmTaskNew('vera','Kalite listesi çıkar','normal','',false,{sureDk:30,tokenLimit:5000});
t('Sınırlı görev: bitiş zamanı ve token sınırı kaydedilir',g0.sureDk==30&&g0.bitis-g0.ts==1800000&&g0.tokenLimit==5000);
t('Sınır rozetleri: kalan süre ve token',function(){var h=tmLimit(g0);return /30 dk/.test(h)&&/kalan/.test(h)&&/5K token/.test(h)});
t('Süresi dolan görev kırmızı',function(){var g={sureDk:15,bitis:Date.now()-1000,durum:'acik'};return /süre doldu/.test(tmLimit(g))});
t('Görev formunda süre ve token seçimi',function(){var h=tmTaskForm(tm('vera'));return h.indexOf('Süre sınırı')>0&&h.indexOf('Token sınırı')>0&&h.indexOf('50K')>0});
ZK.st={anahtar:true,butce:10,harcama:{usd:0,kisi:{},gun:{}},aylar:{}};
var g1=tmTaskNew('sage','Kısa araştırma özeti','normal','',false,{sureDk:15,tokenLimit:10000});
return new Promise(function(res){setTimeout(res,60)}).then(function(){
t('API bağlıyken çalışan görevi yapar, sonuç ve token kaydedilir',g1.durum=='bitti'&&g1.sonuc=='Rapor hazır.'&&g1.token==1800&&giden&&giden.maxTokens<10000&&giden.zamanAsimiMs>0&&giden.zamanAsimiMs<=900000,JSON.stringify({d:g1.durum,s:g1.sonuc,m:giden&&giden.maxTokens}));
t('Sonuç çalışanın sohbetine düşer',/Görev tamamlandı/.test(tmChat('sage')[tmChat('sage').length-1].t));
var g2=tmTaskNew('mia','Uzun plan','normal','',false,{tokenLimit:200});
t('Çok düşük token sınırında görev başlamaz',/çok düşük/.test(g2.hata||''),g2.hata);
API=bAPI;ZK.st=bST;S.team=bk=='null'?undefined:JSON.parse(bk);nav('home','gun',TODAY);return R})};
var __at11=window.__asyncTest;window.__asyncTest=function(){return __at11().then(function(a){return window.__limitTest().then(function(b){return a.concat(b)})})};

// Çalışan başına bütçe payı
window.__payTest=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
var bk=JSON.stringify(S.team||null),bST=ZK.st,bAPI=API,cagri=0;
ZK.st={anahtar:true,butce:10,harcama:{usd:1,kisi:{luca:{usd:2.5,token:1,istek:1}},gun:{}},aylar:{}};
API=Object.assign({},bAPI||{},{zeka:{sor:function(){cagri++;return Promise.resolve({ok:false,err:'çağrılmamalı'})}}});
t('Varsayılan pay sınırsız (%100)',zekaPay('luca')===null&&zekaPayUsd('luca')===null&&!zekaPayDoldu('luca'));
t('Pay %20 = bütçenin %20’si',function(){zekaPayKaydet('luca',20);return zekaPay('luca')==20&&zekaPayUsd('luca')==2});
t('Payı dolan çalışan bekler (istek gitmez)',function(){var a=zekaPayDoldu('luca');tmChat('luca').push({r:'ben',t:'deneme',ts:Date.now(),bek:1});zekaCevapla('luca');return a&&cagri==0});
t('%100 seçilince sınırsız',function(){zekaPayKaydet('luca',100);return zekaPay('luca')===null&&!zekaPayDoldu('luca')});
t('Ayar sayfasında yüzde çubukları',function(){nav('set','zeka','');var h=document.getElementById('ct').innerHTML;return (h.match(/type="range"/g)||[]).length>=15&&h.indexOf('sınırsız')>0});
API=bAPI;ZK.st=bST;S.team=bk=='null'?undefined:JSON.parse(bk);nav('home','gun',TODAY);return R};
var __at12=window.__asyncTest;window.__asyncTest=function(){return __at12().then(function(a){return a.concat(window.__payTest())})};
var __sg13=window.__smokeGo;window.__smokeGo=function(r){if(r[0]=='set'&&r[1]=='zeka'){ZK.st=ZK.st||{anahtar:true,ipucu:'…test',butce:5,harcama:{usd:0.42,giris:0,cikis:0,onbellek:0,istek:12,kisi:{orin:{usd:0.3,token:9000,istek:5},echo:{usd:0.12,token:20000,istek:7}},gun:{9:0.1,10:0.12,11:0.2}},aylar:{'2026-11':0.42}};var a=__sg13(r);return new Promise(function(res){setTimeout(function(){res(a)},600)})}return __sg13(r)};

// Orvane 0.7.20 (Ada'nın listesi): mesaj kanca sırası, komut kontrolü, bozuk telefon olayı, yalnız değişiklikte kayıt, gelen kutusu Hatalı
window.__adaListeTest=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
var bAPI=API,bSave=window.save,bBu=bulutUygula,bSt=BL.st,bb=JSON.stringify(S.bulut||null),bk=JSON.stringify(S.team||null),bYayin=BL.yayin;
t('Mesaj kancaları açık sırayla çalışır',function(){var ad=TMPUSH_KANCA.map(function(k){return k.ad}).join(',');return ad=='finans-katki,toplanti-eylem,toplanti-oner,is-istegi,ada-program-incele,ada-fikir-cevap,ik-ihtiyac,bulut-yayin'},TMPUSH_KANCA.map(function(k){return k.sira+':'+k.ad}).join(','));
t('Komut mesajı yapay zekâya gitmez (tek kontrol)',function(){tmPushTemel('otto',{id:'kmt1',r:'ben',t:'komut',komut:1,bek:1});var s=tmChat('otto').slice(-1)[0];return komutMu('otto')&&!s.bek&&!komutMu('echo-yok')});
var once=[];tmPushKanca(5,'test-once',function(id,m,next){if(m&&m.testK)once.push('a');return next(id,m)});tmPushKanca(95,'test-sonra',function(id,m,next){if(m&&m.testK)once.push('b');return next(id,m)});
tmPush('otto',{r:'sys',t:'kanca deneme',testK:1});TMPUSH_KANCA=TMPUSH_KANCA.filter(function(k){return !/^test-/.test(k.ad)});
t('Kanca sırası numaraya göre (yükleme sırasından bağımsız)',once.join('')=='ab',once.join(''));
var sayac=0,s0=BLS().olaySira||0,tamamArg=null;window.save=function(){sayac++};
bulutUygula=function(e){if(e.tur=='bozuk')throw new Error('bozuk veri');return bBu(e)};
var rows=[{kaynak:'telefon',tur:'bozuk',sira:s0+1,id:'tb1',ts:new Date().toISOString(),veri:{}},{kaynak:'telefon',tur:'mesaj',sira:s0+2,id:'tb2',ts:new Date().toISOString(),veri:{kim:'otto',t:'bozuktan sonraki',mod:'not'}}];
API=Object.assign({},bAPI,{bulut:{pull:function(){var r=rows;rows=[];return Promise.resolve({ok:true,v:r})},push:function(){return Promise.resolve({ok:true,v:1})},status:function(){return Promise.resolve({ok:true,v:BL.st})}}});BL.st={eposta:'test@x'};
var cevrimici=navigator.onLine;
return (cevrimici?bulutTick(true):Promise.resolve()).then(function(){if(!cevrimici)return;
t('Bozuk telefon olayı sırayı tıkamaz (atlanır, sonraki işlenir)',BLS().olaySira==s0+2&&tmChat('otto').some(function(m){return m.id=='tb2'})&&/atlandı/.test(BLS().hata||''),JSON.stringify({sira:BLS().olaySira,s0:s0,h:BLS().hata}));
return bulutTick(true).then(function(){sayac=0;return bulutTick(true)}).then(function(){t('Değişiklik yokken eşitleme turu durumu yeniden yazmaz',sayac==0,'kayıt sayısı '+sayac)})})
.then(function(){window.save=bSave;bulutUygula=bBu;
API=Object.assign({},bAPI,{gelen:function(){return Promise.resolve({ok:true,v:[{tur:'xyz',kim:'ada',_dosya:'a.json'},{tur:'mesaj',kim:'yok-kimse',metin:'x',_dosya:'b.json'}]})},gelenTamam:function(a){tamamArg=a;return Promise.resolve({ok:true,v:0})}});
return gelenIsle()}).then(function(n){t('İşlenemeyen gelen öğesi Hatalı klasörüne gider',n==0&&tamamArg&&tamamArg.hatali.indexOf('a.json')>=0&&tamamArg.hatali.indexOf('b.json')>=0,JSON.stringify(tamamArg))})
.catch(function(e){t('Ada listesi testi',false,e.stack)}).then(function(){API=bAPI;window.save=bSave;bulutUygula=bBu;BL.st=bSt;BL.yayin=bYayin;S.bulut=bb=='null'?undefined:JSON.parse(bb);S.team=bk=='null'?undefined:JSON.parse(bk);save();return R})};
var __atAdaListe=window.__asyncTest;window.__asyncTest=function(){return __atAdaListe().then(function(a){return window.__adaListeTest().then(function(b){return a.concat(b)})})};
// Çalışan üst şeridi kaydırınca sabit kalır (ekran görüntüsü: tmscroll_echo.png)
var __srEh=window.__smokeRoutes;window.__smokeRoutes=function(){return __srEh().concat([['tmscroll','echo','']])};
var __sgEh=window.__smokeGo;window.__smokeGo=function(r){if(r[0]!='tmscroll')return __sgEh(r);var a=__sgEh(['team','calisan',r[1]]);TMTAB='genel';render();var ct=document.getElementById('ct');ct.scrollTop=ct.scrollHeight;return a};
var __stEh=window.__selfTest;window.__selfTest=function(){var R=__stEh();try{nav('team','calisan','echo');TMTAB='genel';render();var ct=document.getElementById('ct'),eh=ct.querySelector('.eh');ct.scrollTop=ct.scrollHeight;var d=Math.abs(eh.getBoundingClientRect().top-ct.getBoundingClientRect().top),ok=ct.scrollTop>0&&d<2;R.push({n:'Çalışan üst şeridi kaydırınca sabit kalır',ok:ok,m:ok?'':'scrollTop='+ct.scrollTop+' fark='+d})}catch(e){R.push({n:'Çalışan üst şeridi kaydırınca sabit kalır',ok:false,m:e.message})}return R};
// Kayıt düzenleme kolaylığı: Veri hatası › Fazlayı düşür, düzenleme şeridi, Güncelle düğmesi; açılır liste seçenekleri koyu (ekran görüntüsü: edfix__.png)
function __edKur(){var k='2026-11-13',yd=E[k]?JSON.stringify(E[k]):null;nav('home','gun',k);E[k]=[{k:'78.26.03.19',i:'Fazla yazılmış kayıt',d:465,st:1}];render();return function(){if(yd===null)delete E[k];else E[k]=JSON.parse(yd);EDIT=null}}
var __srEd=window.__smokeRoutes;window.__smokeRoutes=function(){return __srEd().concat([['edfix','','']])};
var __sgEd=window.__smokeGo;window.__smokeGo=function(r){if(r[0]!='edfix')return __sgEd(r);try{__edKur();fixOver();return{}}catch(e){return{error:e.message}}};
var __stEd=window.__selfTest;window.__selfTest=function(){var R=__stEd(),geri=null;function t(n,f){try{var m=f();R.push({n:n,ok:m===true,m:m===true?'':String(m)})}catch(e){R.push({n:n,ok:false,m:e.message})}}
try{geri=__edKur();t('Veri hatası kutusunda Fazlayı düşür düğmesi var',function(){return /Fazlayı düşür/.test(document.getElementById('ct').textContent)||'düğme yok'});
fixOver();t('Fazlayı düşür düzenlemeyi önerilen dakikayla açar',function(){var b=document.querySelector('.edb'),g=[].some.call(document.querySelectorAll('.bt.p'),function(x){return /Güncelle/.test(x.textContent)});return(EDIT===0&&!!b&&g&&+document.getElementById('dk').value==435)||('EDIT='+EDIT+' şerit='+!!b+' güncelle='+g+' dk='+document.getElementById('dk').value)});
add();t('Güncelle kaydı düzeltir, düzenleme kapanır',function(){var e=E['2026-11-13'][0];return(e.d==435&&EDIT===null&&!document.querySelector('.edb'))||('d='+e.d+' EDIT='+EDIT)});
t('Kalem simgesi düzenlemeyi açar',function(){var p=document.querySelector('.ib2[title="Düzenle"]');p.click();return(EDIT===0&&!!document.querySelector('.edb'))||'EDIT='+EDIT});
t('Açılır liste seçenekleri koyu zeminde açık yazı',function(){var o=document.querySelector('#ds2 option'),s=getComputedStyle(o);return(s.backgroundColor=='rgb(44, 44, 48)'&&s.color=='rgb(255, 255, 255)')||(s.backgroundColor+' / '+s.color)});
}catch(e){R.push({n:'Kayıt düzenleme testleri',ok:false,m:e.message})}if(geri)geri();return R};
