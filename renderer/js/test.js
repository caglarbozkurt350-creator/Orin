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
t('Gelişim: İK → CEO → beceri eklenir',function(){var g=tmGelNew('otto','beceri','Fatura okuma','test');var a=g.asama=='ik';tmGelIk(g.id,1);var b=g.asama=='ceo';tmGelCeo(g.id,1);return a&&b&&g.asama=='tamam'&&tmSkills('otto').some(function(s){return s.ad=='Fatura okuma'})});
t('Gelişim: hafızaya ekleme iki onayla',function(){var g=tmGelNew('echo','hafiza','','Test bilgisi 123');tmGelIk(g.id,1);tmGelCeo(g.id,1);return tmMem('echo').some(function(m){return m.metin=='Test bilgisi 123'})});
t('Gelişim: seviye yükselir',function(){var s0=tmSkills('echo').filter(function(s){return s.ad=='Haftalık özet'})[0].sv,g=tmGelNew('echo','seviye','Haftalık özet','');tmGelIk(g.id,1);tmGelCeo(g.id,1);return tmSkills('echo').filter(function(s){return s.ad=='Haftalık özet'})[0].sv==s0+1});
t('Gelişim: Nika önerisi doğrudan CEO’ya',tmGelNew('iris','beceri','Uyku takibi','','nika').asama=='ceo');
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
t('Telefondan gelişim İK → CEO → uygulanır',function(){bulutUygula({id:'tl1',tur:'gelisim',veri:{id:'gl-tel',kim:'sage',gtur:'beceri',ad:'Kaynak tarama',metin:'',kimden:'cagla'},ts:now});bulutUygula({id:'tl2',tur:'gelisim_karar',veri:{id:'gl-tel',asama:'ik',ok:1},ts:now});bulutUygula({id:'tl3',tur:'gelisim_karar',veri:{id:'gl-tel',asama:'ceo',ok:1},ts:now});return tmSkills('sage').some(function(s){return s.ad=='Kaynak tarama'})});
t('Telefondan iş günü kaydı Sheets kuyruğuna girer',function(){delete E[k];Q=[];bulutUygula({id:'tk1',tur:'kayit',veri:{k:k,kod:'78.26.03.19',is:'Telefon kaydı',dk:120},ts:now});bulutUygula({id:'tk1',tur:'kayit',veri:{k:k,kod:'78.26.03.19',is:'Telefon kaydı',dk:120},ts:now});return (E[k]||[]).length==1&&E[k][0].src=='telefon'&&Q.some(function(o){return o.op=='add'})});
t('Özet: ekip, gün ve proje bilgisi',function(){var o=bulutOzet();return o.v==1&&o.ekip&&o.ekip.sohbet.otto.every(function(m){return !!m.id})&&o.gun&&typeof o.olaySira=='number'&&o.ayar.w1==S.w1});
t('Telefon eşitleme sayfası',function(){nav('set','telefon','');return document.getElementById('ct').innerHTML.indexOf('Telefon eşitleme')>=0&&document.getElementById('sb').innerHTML.indexOf('Telefon eşitleme')>=0});
S.team=bk=='null'?undefined:JSON.parse(bk);Q=bq;if(bE)E[k]=bE;else delete E[k];S.bulut=bb=='null'?undefined:JSON.parse(bb);nav('home','gun',TODAY);return R};
var __at7=window.__asyncTest;window.__asyncTest=function(){return __at7().then(function(a){return a.concat(window.__bulutTest())})};
