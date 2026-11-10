// Otomatik kontrol (yalnız `npm run smoke` ile çalışır; normal kullanımda etkisizdir)
window.__smokeRoutes=function(){return[['home','gun',TODAY],['home','gun','2026-6-4'],['home','gun','2026-8-7'],['home','proje','118.11'],['home','proje','88.34.14.43'],['home','yil',''],['home','maz',''],['home','ref',''],['home','yeni',''],['cal','takvim','2026-6'],['cal','takvim',''],['msg','haber','gel'],['msg','haber','bil'],['msg','haber','sir'],['img','gorsel',''],['plan','notlar',''],['set','huk',''],['set','kur',''],['set','ice',''],['set','baglanti',''],['set','sorun',''],['set','kisa',''],['set','yenilik',''],['menu','Dosya','']]};
window.__smokeGo=function(r){try{closeM();if(r[0]=='menu'){menu(r[1]);return{}}
if(r[0]=='cal'&&r[2]){var a=r[2].split('-');nav('cal','takvim');calY=+a[0];calM=+a[1]-1;render();return{}}
nav(r[0],r[1],r[2]);if(!document.getElementById('ct').innerHTML.trim())return{error:'boş sayfa'};return{}}catch(e){return{error:e.message}}};
window.__selfTest=function(){var R=[];function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':(m||'beklenmeyen sonuç')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
t('Haziran Cuma 485',lim('2026-6-5')==485,lim('2026-6-5'));t('Temmuz Cuma 465',lim('2026-7-10')==465,lim('2026-7-10'));t('Ağustos Cuma 390',lim('2026-8-14')==390,lim('2026-8-14'));
t('Kasım Cuma ayardan',lim('2026-11-6')==S.w2);t('Kasım Pazartesi ayardan',lim('2026-11-9')==S.w1);t('Haziran Pzt 510',lim('2026-6-1')==510);t('Arife iş süresi yok',lim('2026-5-26')===null);
t('04.06 mesai',typ('2026-6-4')=='mesai',typ('2026-6-4'));t('21.05 girdi hatası',typ('2026-5-21')=='girdi',typ('2026-5-21'));t('07.05 veri hatası',typ('2026-5-7')=='hata');t('07.08 veri hatası',typ('2026-8-7')=='hata');
t('12.06 mazeret',typ('2026-6-12')=='mazeret');t('01.05 tatilde mesai',typ('2026-5-1')=='mesai');t('17.08 tamam',typ('2026-8-17')=='tam',typ('2026-8-17'));t('11.07 cumartesi mesai',typ('2026-7-11')=='mesai');
var M=[['Mayıs',0,8230],['Haziran',1,11175],['Temmuz',2,6050],['Ağustos',3,7860]];M.forEach(function(m){var r=RG[m[1]];if(!r){t(m[0]+' toplamı',false,'aralık yok');return}var x=rangeStats(r[0],r[1]);t(m[0]+' toplamı '+m[2],x.s==m[2],'bulunan '+x.s)});
t('Ağustos mesaisi 645',rangeStats(RG[3][0],RG[3][1]).ot==645,'bulunan '+rangeStats(RG[3][0],RG[3][1]).ot);t('Mayıs mesaisi 2505',rangeStats(RG[0][0],RG[0][1]).ot==2505,'bulunan '+rangeStats(RG[0][0],RG[0][1]).ot);t('Pazartesi kısaltması',short('2026-11-9')=='9 Kas Pzt',short('2026-11-9'));
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
var mock={add:function(rec){var n=rows.length+1;put(n,rec);return ok({row:n})},
upd:function(o){var cur=rows[o.row-1]||[];if(!o.force&&fpRow(cur)!==o.fp)return ok({conflict:true,current:cur.slice()});put(o.row,o.rec);return ok({row:o.row})},
del:function(o){var cur=rows[o.row-1]||[];if(!o.force&&fpRow(cur)!==o.fp)return ok({conflict:true,current:cur.slice()});var b={};F.forEach(function(f){b[f]=''});put(o.row,b);return ok({row:o.row})},
upsert:function(o){if(!tabs[o.tab]){tabs[o.tab]=[o.header].concat(o.seed||[]);if(o.tab=='Projeler')return ok({created:true})}var T=tabs[o.tab],i=T.findIndex(function(x){return x[0]==o.key});if(i<0)T.push([o.key].concat(o.values));else T[i]=[o.key].concat(o.values);return ok({})},
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
.then(function(){var r=rows[2]||[];t('İzin günü satırı yazılır',r[1]=='Standart dışı'&&r[4]=='?'&&r[8]=='Yıllık izin'&&DR[k]&&DR[k].row==3,JSON.stringify(rows));
setT('');return idle()})
.then(function(){t('İzin kaldırılınca satırı temizlenir',(rows[2]||[])[8]===''&&!DR[k],JSON.stringify(rows[2]));
S.onay=false;form('78.26.03.19','Hızlı kayıt',100);add();var e=E[k][E[k].length-1];var a=E[k].indexOf(e);E[k].splice(a,1);entryRemoved(e);return idle()})
.then(function(){t('Gönderilmeden silinen kayıt Sheets’e gitmez',rows.length==3,JSON.stringify(rows));
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
