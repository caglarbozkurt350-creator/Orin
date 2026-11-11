// Orvane 0.7.1: kayıt koruması uyarısı, önceki onaylı sürüme dönüş, güncelleme öncesi yedek bilgisi
var SURUM=null,SURUM_ILER=null,_svWarnT=0;
// Ana süreç kaydı reddederse (konum.json okunamıyor / klasör yok): bir kez pencere, sonra seyrek uyarı
function saveBlocked(r){var now=Date.now();if(now-_svWarnT<60000)return;_svWarnT=now;toast('Kaydedilmedi: '+(r.err||'veri klasörü güvenli değil'));if(window.dataWarnCheck&&!INFO.smoke)dataWarnCheck()}
function surumYukle(){if(!API||!API.surum)return;API.surum.liste().then(function(r){SURUM=r.ok?r.v:{hata:r.err};if(area=='set'&&pg=='sorun')render()})}
function surumKart(){
var h='<div class="card"><div class="ch"><i class="ti ti-history"></i>Sürüm ve geri dönüş</div><div class="kr"><div>Kurulu sürüm<div class="hn">Güncelleme kurulmadan önce verilerin kendiliğinden Yedekler klasörüne alınır.</div></div><span class="pill">'+esc(INFO.version)+'</span></div>';
if(SURUM&&SURUM.pin)h+='<div class="kr"><div>Otomatik güncelleme duraklatıldı<div class="hn">'+esc(SURUM.pin.from||'')+' sürümünden geri dönüldü. Yeni sürüm hazır olduğunda yeniden açabilirsin.</div></div><button class="bt" onclick="surumDevam()">Güncellemeleri aç</button></div>';
h+='<div style="margin-top:6px"><div style="color:#fff;margin-bottom:4px">Önceki onaylı sürüme dön</div><div class="hn" style="margin-bottom:8px">Yeni sürümde sorun olursa denenmiş bir önceki sürümü GitHub’dan indirip kurar. Önce verilerin yedeklenir; kayıtların silinmez.</div>';
if(!SURUM)h+='<div class="hn">Liste yükleniyor…</div>';
else if(SURUM.hata)h+='<div class="hn">Liste alınamadı: '+esc(SURUM.hata)+'</div>';
else if(!SURUM.surumler.length)h+='<div class="hn">Bu sürümden eski onaylı sürüm yok.</div>';
else h+='<div style="display:flex;gap:8px;flex-wrap:wrap">'+SURUM.surumler.map(function(s){return '<button class="bt" data-v="'+esc(s.v)+'" title="'+esc((s.tarih||'')+(s.not?' · '+s.not:''))+'" onclick="surumSor(this.dataset.v)"'+(SURUM_ILER?' disabled':'')+'><i class="ti ti-arrow-back-up"></i> '+esc(s.v)+'’a dön</button>'}).join('')+'</div>';
if(SURUM_ILER)h+='<div class="hn" style="margin-top:8px">'+esc(SURUM_ILER)+'</div>';
return h+'</div></div>'}
function surumSor(v){var o=document.getElementById('ov'),eski=surumKars(v,'0.7.1')<0;
o.innerHTML='<div class="dl"><div style="color:#fff;margin-bottom:8px;line-height:1.45">Orvane '+esc(v)+' sürümüne dönülsün mü?</div><div class="hn" style="margin-bottom:12px">1) Verilerin Yedekler klasörüne alınır.<br>2) '+esc(v)+' kurulum dosyası GitHub’dan indirilip doğrulanır (~125 MB).<br>3) Orvane kapanır, kurulum sihirbazı açılır; adımları onayla.<br>'+(eski?'<b style="font-weight:500;color:#f6d28a">Dikkat:</b> '+esc(v)+' güncellemeyi duraklatmayı bilmez; kapattığında en yeni sürüm yeniden kurulabilir. Kalıcı dönüş için hatalı sürümün GitHub’dan geri çekilmesini iste.':'Dönüşten sonra otomatik güncelleme sen açana kadar duraklatılır.')+'</div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="bt" onclick="cfNo()">Vazgeç</button><button class="bt p" data-v="'+esc(v)+'" onclick="surumDon(this.dataset.v)">Geri dön</button></div></div>';o.style.display='flex'}
function surumDon(v){cfNo();SURUM_ILER=v+' hazırlanıyor…';render();API.surum.don(v).then(function(r){if(r.ok){SURUM_ILER='Kurulum başlıyor; Orvane kapanacak.'+(r.v.yedek?' Yedek: '+r.v.yedek:'');toast(SURUM_ILER)}else{SURUM_ILER=null;toast('Geri dönülemedi: '+r.err)}if(area=='set'&&pg=='sorun')render()})}
function surumDevam(){API.update.resume().then(function(){toast('Otomatik güncelleme açıldı');SURUM=null;surumYukle()})}
function surumKars(a,b){var x=String(a).split('.').map(Number),y=String(b).split('.').map(Number);for(var i=0;i<3;i++)if((x[i]||0)!=(y[i]||0))return (x[i]||0)-(y[i]||0);return 0}
if(API&&API.surum)API.surum.on(function(s){SURUM_ILER=s.v+' indiriliyor… '+(s.top?Math.round(s.n*100/s.top)+'%':Math.round(s.n/1048576)+' MB');if(area=='set'&&pg=='sorun')render()});
if(API&&API.update)API.update.on(function(s){if(s.s=='durduruldu')toast('Yeni sürüm '+s.v+' var; otomatik güncelleme duraklatıldı (Sorun giderme)')});
var _sorun071=P.sorun;
P.sorun=function(){if(!SURUM)setTimeout(surumYukle,0);var h=_sorun071(),i=h.lastIndexOf('<div class="hn">Sürüm ');return i>=0?h.slice(0,i)+surumKart()+h.slice(i):h+surumKart()};

// Testler (yalnız smoke)
window.__v071Test=function(){var R=[];function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
t('Sürüm karşılaştırma',surumKars('0.7.1','0.7.0')>0&&surumKars('0.6.1','0.7.0')<0&&surumKars('0.10.0','0.9.9')>0);
if(!API||!API.surum)return Promise.resolve(R);
return API.surum.liste().then(function(r){t('Onaylı sürüm listesi okunur',r.ok&&Array.isArray(r.v.surumler),JSON.stringify(r));
if(r.ok){t('Listede yalnız eski sürümler',r.v.surumler.every(function(s){return surumKars(s.v,INFO.version)<0}),JSON.stringify(r.v.surumler));t('Liste yeniden eskiye',r.v.surumler.every(function(s,i,a){return !i||surumKars(a[i-1].v,s.v)>0}));t('Smoke’ta yerel liste (ağ yok)',r.v.kaynak=='yerel',r.v.kaynak)}
SURUM=r.ok?r.v:null;nav('set','sorun');var ht=document.getElementById('ct').innerHTML;t('Sorun giderme: geri dönüş kartı',/Önceki onaylı sürüme dön/.test(ht)&&/Sürüm ve geri dönüş/.test(ht));t('Geri dönüş düğmeleri',!r.ok||!r.v.surumler.length||/’a dön/.test(ht));
return API.surum.don('9.9.9')}).then(function(r){t('Listede olmayan sürüme dönülmez',!r.ok&&/listesinde yok/.test(r.err),JSON.stringify(r));
return API.surum.don(SURUM&&SURUM.surumler[0]?SURUM.surumler[0].v:'0.7.0')}).then(function(r){t('Geliştirmede geri dönüş çalışmaz (kurulu değil)',!r.ok&&/kurulu uygulamada/.test(r.err),JSON.stringify(r));
var bk=_svWarnT;_svWarnT=0;var tt=document.getElementById('toast');saveBlocked({ok:false,err:'deneme reddi'});t('Kayıt reddi uyarısı',_svWarnT>0);_svWarnT=bk;
return API.data.backup()}).then(function(r){t('Elle yedek hâlâ çalışır',r.ok,JSON.stringify(r));nav('home','gun',TODAY);return R})};
var __at13=window.__asyncTest;window.__asyncTest=function(){return __at13().then(function(a){return window.__v071Test().then(function(b){return a.concat(b)})})};
// İK grafikleri testleri (0.7.2)
var __at14=window.__asyncTest;window.__asyncTest=function(){return __at14().then(function(a){return a.concat(window.__ikTest?window.__ikTest():[])})};
// Abonelik ve Ada fikir testleri (0.7.2)
var __at15=window.__asyncTest;window.__asyncTest=function(){return __at15().then(function(a){return (window.__abnTest?window.__abnTest():Promise.resolve([])).then(function(b){return a.concat(b)})}).then(function(a){return (window.__adaTest?window.__adaTest():Promise.resolve([])).then(function(b){return a.concat(b)})})};
// Gelen kutusu testi (0.7.5)
var __at16=window.__asyncTest;window.__asyncTest=function(){return __at16().then(function(a){return (window.__gelenTest?window.__gelenTest():Promise.resolve([])).then(function(b){return a.concat(b)})})};
