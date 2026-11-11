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
