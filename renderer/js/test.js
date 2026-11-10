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
t('Sheets tarih okuma',parseDate('09.11.2026')=='2026-11-9'&&parseDate('2026-11-10')=='2026-11-10');t('Soru işareti süre 0',parseMin('?')===0&&parseMin('525')==525);t('İzin türü sevk',izinType('İş yeri sevki')=='sevk'&&izinType('Yıllık')=='yillik');t('Standart dışı geçerli kod',SPECIAL.indexOf('Standart dışı')>=0);
nav('home','gun',TODAY);return R};
