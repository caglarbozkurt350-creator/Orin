// Orvane 0.7.2 · Ada: Claude Code'un geliştirme fikirlerini Çağlar'a soru-cevapla sorar,
// "Evet" denenleri "Sıradaki güncellemede eklenecekler" listesinde tutar (masaüstü ve telefon sohbetinden cevaplanabilir)
var FIKIR=null,ADA_QR=['Evet, ekle','Hayır','Sonra sor'];
function adaS(){S.ada=S.ada||{cevap:{},soru:null};S.ada.cevap=S.ada.cevap||{};return S.ada}
function fikirYukle(){if(!API||!API.fikirler)return Promise.resolve([]);return API.fikirler().then(function(r){FIKIR=r.ok?r.v.fikirler:[];return FIKIR},function(){FIKIR=FIKIR||[];return FIKIR})}
function fikirBul(id){return (FIKIR||[]).filter(function(f){return f.id==id})[0]}
function adaSiradaki(){var a=adaS();return (FIKIR||[]).filter(function(f){var c=a.cevap[f.id];return c&&c.c=='evet'})}
function adaSonrakiFikir(){var a=adaS(),L=FIKIR||[],yeni=L.filter(function(f){return !a.cevap[f.id]});if(yeni.length)return yeni[0];
var gun=24*3600e3;return L.filter(function(f){var c=a.cevap[f.id];return c&&c.c=='sonra'&&Date.now()-c.ts>gun})[0]||null}
function adaSor(){if(!FIKIR||!tm('ada'))return null;var a=adaS();if(a.soru&&fikirBul(a.soru))return null;var f=adaSonrakiFikir();if(!f){a.soru=null;return null}
a.soru=f.id;var L=FIKIR.length,sira=FIKIR.indexOf(f)+1;
tmPush('ada',{r:'o',t:'Claude’dan bir geliştirme fikri ('+sira+'/'+L+'): '+f.baslik+'\n'+f.aciklama+'\n\nSıradaki güncellemeye ekleyelim mi?',qr:ADA_QR.slice(),fikir:f.id});save();return f}
function adaCevapTuru(t){t=String(t||'').trim().toLocaleLowerCase('tr');return /^evet/.test(t)?'evet':/^(hayır|hayir)/.test(t)?'hayir':/^sonra/.test(t)?'sonra':null}
// Çağlar'ın cevabı (masaüstü sohbeti ya da telefondan gelen mesaj)
var _adaPush=tmPush;tmPush=function(id,m){var a=S.ada,tur=id=='ada'&&m&&m.r=='ben'&&m.tur!='not'&&a&&a.soru?adaCevapTuru(m.t):null;
if(!tur)return _adaPush(id,m);
var f=a.soru;a.cevap[f]={c:tur,ts:Date.now()};a.soru=null;m.fikirCevap=f;delete m.bek;var r=_adaPush(id,m);
setTimeout(function(){tmChat('ada').forEach(function(x){if(x.fikirCevap)delete x.bek});var n=adaSiradaki().length,fk=fikirBul(f);
_adaPush('ada',{r:'o',t:tur=='evet'?'Tamam, “'+(fk?fk.baslik:f)+'” sıradaki güncelleme listesine eklendi ('+n+' madde).':tur=='hayir'?'Anlaşıldı, bu fikri eklemiyoruz.':'Peki, bunu sonra yeniden soracağım.'});
setTimeout(function(){if(!adaSor()){if(!a.bitti){a.bitti=1;_adaPush('ada',{r:'o',t:'Şimdilik sorulacak fikir kalmadı. Sıradaki güncellemede eklenecekler: '+(adaSiradaki().map(function(x){return x.baslik}).join(', ')||'yok')+'.'})}}else a.bitti=0;save();if(area=='team')render()},400)},50);return r};
// Fikir cevabını yapay zekâ ayrıca cevaplamasın
if(typeof zekaCevapla=='function'){var _adaZc=zekaCevapla;zekaCevapla=function(id){if(id=='ada'){var a=tmChat('ada'),s=a[a.length-1];if(s&&s.fikirCevap){delete s.bek;return Promise.resolve()}}return _adaZc(id)}}
// Ada'nın sayfası: sıradaki güncelleme listesi
function adaKart(){var L=adaSiradaki(),a=adaS(),bek=(FIKIR||[]).filter(function(f){var c=a.cevap[f.id];return !c||c.c=='sonra'}).length;
return '<div class="card" style="margin-top:14px"><div class="ch"><i class="ti ti-list-check"></i>Sıradaki güncellemede eklenecekler <span class="hn" style="margin-left:6px">'+L.length+' madde · '+bek+' fikir cevap bekliyor</span>'+(bek&&!a.soru?'<button class="bt" style="margin-left:auto;min-height:30px;padding:4px 12px" onclick="adaSor();render()">Fikir sor</button>':'')+'</div>'+
(L.length?L.map(function(f){return '<div class="kr"><div>'+esc(f.baslik)+'<div class="hn">'+esc(f.aciklama)+'</div></div><button class="bt" style="min-height:30px;padding:4px 10px" title="Listeden çıkar" data-id="'+esc(f.id)+'" onclick="adaCikar(this.dataset.id)"><i class="ti ti-x"></i></button></div>'}).join(''):'<div class="hn">Henüz eklenen yok. Ada, Claude’un fikirlerini sohbette sana soruyor.</div>')+'</div>'}
function adaCikar(id){var a=adaS();a.cevap[id]={c:'hayir',ts:Date.now()};save();render()}
var _adaCh=tmCharts;tmCharts=function(c){var h=_adaCh(c);return c.id=='ada'?adaKart()+h:h};
fikirYukle().then(function(){if(!INFO.smoke)setTimeout(adaSor,8000)});

// Testler (yalnız smoke)
window.__adaTest=function(){var R=[],T=TMS(),bk={ada:S.ada?JSON.stringify(S.ada):null,ch:JSON.stringify(T.sohbet),f:FIKIR};function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
return fikirYukle().then(function(L){t('Fikir listesi yüklenir',L.length>=3&&L.every(function(f){return f.id&&f.baslik}),L.length);
S.ada={cevap:{},soru:null};T.sohbet.ada=[];var f=adaSor(),son=tmChat('ada').slice(-1)[0];
t('Ada fikri cevap düğmeleriyle sorar',f&&son.fikir==f.id&&son.qr&&son.qr.join('|')==ADA_QR.join('|')&&/Sıradaki güncellemeye ekleyelim mi/.test(son.t),JSON.stringify(son));
t('Soru varken yenisi sorulmaz',adaSor()===null);
tmSend('ada','Evet, ekle','mesaj');
return new Promise(function(res){setTimeout(res,700)}).then(function(){var a=S.ada;
t('Evet cevabı listeye eklenir',a.cevap[f.id]&&a.cevap[f.id].c=='evet'&&adaSiradaki().length==1);
var ch=tmChat('ada');t('Cevap yapay zekâya gitmez (bekleyen yok)',!ch.some(function(x){return x.bek}),JSON.stringify(ch.map(function(x){return [x.r,x.bek]})));
t('Ada sıradaki fikri sorar',a.soru&&a.soru!=f.id&&ch.slice(-1)[0].fikir==a.soru);
var f2=a.soru;bulutUygula({id:'tel-ada-1',tur:'mesaj',ts:Date.now(),veri:{kim:'ada',t:'Hayır',mod:'mesaj',bek:1}});
return new Promise(function(res){setTimeout(res,700)})}).then(function(){var a=S.ada;
t('Telefondan Hayır cevabı işlenir',a.cevap[Object.keys(a.cevap)[1]]&&a.cevap[Object.keys(a.cevap)[1]].c=='hayir');
nav('team','calisan','ada');var h=document.getElementById('ct').innerHTML;t('Ada sayfasında sıradaki güncelleme listesi',/Sıradaki güncellemede eklenecekler/.test(h)&&h.indexOf(esc(f.baslik))>=0);
})}).catch(function(e){t('Ada fikir testi',false,e.stack)}).then(function(){if(bk.ada)S.ada=JSON.parse(bk.ada);else delete S.ada;T.sohbet=JSON.parse(bk.ch);FIKIR=bk.f;save();nav('home','gun',TODAY);return R})};

// Ada'nın program incelemesi (0.7.6): Çağlar istediğinde (düğme ya da sohbette "programı incele") aboneliğinde, Sonnet ile ~5 dk.
// Kod değiştirmez; rapor Belgeler\Orin\Ada Raporları'na ve Ada'nın sohbetine düşer; öğrenilenler Nika → Orin onayına gider.
var ADA_INC={calisiyor:false};
function adaIncelemeIstem(){var a=adaS(),L=(a.incelemeler||[]).slice(-1)[0];
return 'Görev (Çağlar’dan): Orvane programını en fazla 5 dakikada derinlemesine incele. Odak: (1) HIZ — açılış, sayfa çizimi, eşitleme, yapay zekâ çağrıları; (2) OPTİMİZASYON — gereksiz yeniden çizim, büyük döngüler, tekrar eden okuma/yazma, bellek; (3) KARARLILIK — yakalanmayan hatalar, yarış durumları, zaman aşımları, veri kaybı riski; (4) NEDENSELLİK — bir değişikliğin başka yeri bozduğu neden-sonuç hataları (sarmalanan fonksiyon zincirleri, betik sırası).\n'+
'Yöntem: main.js, abonelik.js, zeka.js, bulut.js, renderer/js/*.js ve mobil/src içindeki önemli dosyalara bak; gerekirse `npx electron . --smoke` çalıştır. En fazla 15 araç çağrısı yap, sonra raporu yaz.\n'+
(L?'Önceki incelemenin ilk işleri ('+new Date(L.ts).toLocaleDateString('tr-TR')+'): '+L.ozet+'\nBunların düzelip düzelmediğini de kontrol et ve “Önceki rapordan bu yana” bölümü yaz.\n':'')+
'Rapor biçimi (Türkçe, kısa): HIZ / OPTİMİZASYON / KARARLILIK / NEDENSELLİK; her bulgu: dosya:satır, ne oluyor, önem (yüksek/orta/düşük), önerilen düzeltme; doğrulamadığını açıkça yaz. Sonda “İlk yapılacak 5 iş”.\n'+ABN_OGREN}
function adaInceleme(){if(ADA_INC.calisiyor){toast('Ada zaten inceliyor');return Promise.resolve()}var c=tm('ada');if(!c)return Promise.resolve();
if(!abnAcik()){tmPush('ada',{r:'o',t:'Program incelemesi için Claude aboneliği yönlendirmesinin açık olması gerekiyor (Ayarlar › Yapay zekâ › Claude aboneliği).'});save();return Promise.resolve()}
ADA_INC.calisiyor=true;tmPush('ada',{r:'sys',t:'Ada program incelemesine başladı (Sonnet, en fazla ~5 dk). Kod değiştirilmez; bitince rapor burada olacak.'});save();if(area=='team')render();
return ABN.cagir({kim:'ada',mod:'inceleme',model:'sonnet',maxTur:30,zamanAsimiMs:7*60000,istem:adaIncelemeIstem(),sistem:zekaSistem(c)+'\nKurallar: Hiçbir dosyayı değiştirme, oluşturma ya da silme. Yalnız oku, ara ve izin verilen test komutunu çalıştır. Kişisel veri (renderer/js/kisisel.js) içeriğini rapora yazma.'})
.then(function(r){if(!r.ok)throw new Error(r.err);var v=r.v,ay=abnOgrenAyikla(v.metin),a=adaS(),m=ay.metin.match(/İlk yapılacak 5 iş[\s\S]*/i);
a.incelemeler=(a.incelemeler||[]).concat([{ts:Date.now(),dosya:v.rapor||'',tur:v.tur,ozet:(m?m[0]:ay.metin).replace(/[#*`]/g,'').replace(/\s+/g,' ').slice(0,700)}]).slice(-10);
tmPush('ada',{r:'o',t:'Program incelemesi tamamlandı ('+Math.round((v.sureMs||0)/6000)/10+' dk, '+v.tur+' adım).'+(v.rapor?' Rapor: '+v.rapor:'')+'\n\n'+ay.metin,model:'abonelik · '+(v.model||'sonnet')});abnOgrenEkle({kim:'ada'},ay.liste);if(ABN.st){ABN.st.bugun++;ABN.st.toplam++}save()},
function(e){tmPush('ada',{r:'o',t:'Program incelemesi yapılamadı: '+String(e&&e.message||e)});save()})
.then(function(){ADA_INC.calisiyor=false;if(area=='team')render()})}
var _adaPush2=tmPush;tmPush=function(id,m){if(id=='ada'&&m&&m.r=='ben'&&m.tur!='not'&&/program\S*\s+incele/i.test(m.t||'')){m.komut=1;delete m.bek;var r=_adaPush2(id,m);setTimeout(function(){tmChat('ada').forEach(function(x){if(x.komut)delete x.bek});adaInceleme()},50);return r}return _adaPush2(id,m)};
var _adaZc2=zekaCevapla;zekaCevapla=function(id){if(id=='ada'){var a=tmChat('ada'),s=a[a.length-1];if(s&&s.komut){delete s.bek;return Promise.resolve()}}return _adaZc2(id)};
function adaIncKart(){var a=adaS(),L=(a.incelemeler||[]).slice(-1)[0],k=ABN.st&&ABN.st.kaynak;
return '<div class="card" style="margin-top:14px"><div class="ch"><i class="ti ti-stethoscope"></i>Program incelemesi <span class="hn" style="margin-left:6px">hız · optimizasyon · kararlılık · nedensellik</span>'+
'<button class="bt p" style="margin-left:auto;min-height:30px;padding:4px 12px" onclick="adaInceleme()"'+(ADA_INC.calisiyor?' disabled':'')+'>'+(ADA_INC.calisiyor?'İnceleniyor…':'Şimdi incele (~5 dk)')+'</button></div>'+
'<div class="hn">'+(L?'Son inceleme: '+new Date(L.ts).toLocaleString('tr-TR')+' · '+(a.incelemeler.length)+' rapor':'Henüz inceleme yok')+' · sohbette “programı incele” yazman da yeter. Aboneliğinde Sonnet ile çalışır, kod değiştirmez.</div>'+
(L?'<div class="hn" style="margin-top:6px">'+esc(L.ozet.slice(0,300))+'…</div>':'')+
'<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="bt" onclick="adaRaporlar()"><i class="ti ti-folder"></i> Raporlar klasörü</button><button class="bt" onclick="adaKaynakSec()" title="'+esc(k||'')+'"><i class="ti ti-code"></i> Kaynak klasörü'+(k?'':' (bulunamadı)')+'</button></div></div>'}
function adaRaporlar(){if(ABN.st&&ABN.st.raporlar)API.openPath(ABN.st.raporlar).then(function(r){if(r)toast('Henüz rapor klasörü yok')})}
function adaKaynakSec(){API.pickFolder(ABN.st&&ABN.st.kaynak||'').then(function(d){if(d)abnAyar({kaynak:d})})}
var _adaCh2=tmCharts;tmCharts=function(c){var h=_adaCh2(c);if(c.id=='ada'){abnDurumBir(function(){if(area=='team')render()});return adaIncKart()+h}return h};

window.__adaIncTest=function(){var R=[],T=TMS(),bk={st:ABN.st,cagir:ABN.cagir,ada:S.ada?JSON.stringify(S.ada):null,ch:JSON.stringify(T.sohbet),gel:T.gel.slice()};function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
var cg=[];ABN.st={kurulu:true,acik:true,gunluk:5,bugun:0,toplam:0,gunlukSohbet:60,sohbetBugun:0,kaynak:'C:/kaynak',raporlar:'C:/raporlar'};
ABN.cagir=function(o){cg.push(o);return Promise.resolve({ok:true,v:{metin:'## HIZ\n- x\n## İlk yapılacak 5 iş\n1. gelen kutusu\nÖĞRENİLENLER: [{"tur":"hafiza","ad":"Risk","metin":"Gelen kutusu iki aşamalı olmalı."}]',tur:9,sureMs:80000,rapor:'C:/raporlar/r.md',model:'claude-sonnet-5-5'}})};
T.sohbet.ada=[];tmSend('ada','Programı incele','mesaj');
return new Promise(function(res){setTimeout(res,400)}).then(function(){var ch=tmChat('ada'),son=ch.filter(function(x){return x.r=='o'}).slice(-1)[0]||{},a=adaS();
t('Sohbette “programı incele” incelemeyi başlatır',cg.length==1&&cg[0].mod=='inceleme'&&cg[0].model=='sonnet',JSON.stringify(cg.map(function(x){return x.mod})));
t('İnceleme kod değiştirmeyi yasaklar',cg[0]&&/Hiçbir dosyayı değiştirme/.test(cg[0].sistem));
t('Rapor sohbete düşer, öğrenilenler gizli',son.r=='o'&&/Program incelemesi tamamlandı/.test(son.t)&&/r\.md/.test(son.t)&&!/ÖĞRENİLENLER/.test(son.t),son.t);
t('Öğrenilenler Nika onayına gider',T.gel.some(function(x){return x.kim=='ada'&&x.kimden=='abonelik'&&x.asama=='ik'}));
t('İnceleme geçmişi tutulur (önceki iş özeti)',a.incelemeler&&a.incelemeler.length>=1&&/gelen kutusu/.test(a.incelemeler.slice(-1)[0].ozet));
t('Sonraki incelemede önceki rapor karşılaştırılır',/Önceki incelemenin ilk işleri/.test(adaIncelemeIstem()));
t('Komut mesajı yapay zekâya gitmez',!ch.some(function(x){return x.bek}));
nav('team','calisan','ada');var h=document.getElementById('ct').innerHTML;t('Ada sayfasında inceleme kartı',/Program incelemesi/.test(h)&&/Şimdi incele/.test(h));
}).catch(function(e){t('Ada inceleme testi',false,e.stack)}).then(function(){ABN.st=bk.st;ABN.cagir=bk.cagir;if(bk.ada)S.ada=JSON.parse(bk.ada);else delete S.ada;T.sohbet=JSON.parse(bk.ch);T.gel=bk.gel;save();nav('home','gun',TODAY);return R})};
