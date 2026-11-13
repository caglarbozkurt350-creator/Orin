// Orvane · Ofis oyunu (Unity) özeti → Belgeler\Orin\Veriler\ofis-ozet.json
// Oyun YALNIZ bu dosyayı okur (durum.json'u değil). Kurallar (Çağlar onayı, 2026-11-13):
// - Finans: yalnız şirket geliri, işletme gideri (abonelik+token dahil) ve net. Çağlar'ın kişisel gelir/gideri YAZILMAZ.
// - Gizlilik: "Gizli" (2) ve "Çok gizli" (3) çalışanların görev başlıkları yazılmaz, yalnız sayıları.
// - sonTamamlanan son 10 görevi tutar; oyun her görev için efekti bir kez oynatır.
// - Her kayıttan ~3 sn sonra (içerik değiştiyse) atomik yazılır.
var OF={son:null,z:null,SURUM:1};
function ofS(){S.ofis=S.ofis||{};var o=S.ofis;o.mesai=o.mesai||{gelis:'09:00',ogle:'12:30',ogleBitis:'13:30',cikis:'18:00',gunler:[1,2,3,4,5]};return o}
function ofGizli(id){try{return typeof gzDerece=='function'&&gzDerece(id)>=2}catch(e){return false}}
function ofKisa(t,n){t=String(t||'').replace(/\s+/g,' ').trim();return t.length>n?t.slice(0,n-1)+'…':t}
function ofisOzet(){var T=TMS(),o=ofS(),G=T.gorev||[];
var cal=tmAll().filter(function(c){return c&&!c.sil&&c.id}).map(function(c){var ac=G.filter(function(g){return g.kim==c.id&&g.durum!='bitti'}),gz=ofGizli(c.id),
calis=ac.filter(function(g){return g.durum=='acik'||g.durum=='calisiyor'});
return{id:c.id,durum:calis.length?'calisiyor':'bosta',acikGorev:ac.length,aktifGorev:gz||!calis.length?null:ofKisa(calis[0].metin,80)}});
var son=G.filter(function(g){return g.durum=='bitti'&&g.bts}).sort(function(a,b){return b.bts-a.bts}).slice(0,10).map(function(g){
return{id:String(g.id),kim:g.kim,baslik:ofGizli(g.kim)?null:ofKisa(g.metin,80),zaman:new Date(g.bts).toISOString()}});
var IS=typeof isS=='function'?isS():[],TPL=typeof tpS=='function'?tpS():[];
var kar=IS.filter(function(x){return x.durum=='onay'&&x.toplanti}).map(function(x){var t=TPL.filter(function(y){return y.id==x.toplanti})[0],gz=ofGizli(x.kim);
return{id:x.id,kim:x.kim,baslik:gz?'Gizli konu':ofKisa(x.baslik,90),ozet:gz?null:ofKisa(x.metin,300),toplanti:t?ofKisa(t.konu,60):''}});
var fin={ay:'',gelir:0,gider:0,net:0};try{var r=fnAyToplam(fnBuAy());fin={ay:r.ay,gelir:Math.round(r.sirketGelir),gider:Math.round(r.isletme),net:Math.round(r.sirketNet)}}catch(e){}
return{surum:OF.SURUM,mesai:JSON.parse(JSON.stringify(o.mesai)),calisanlar:cal,sonTamamlanan:son,
bekleyenOnay:{isIstegi:IS.filter(function(x){return x.durum=='onay'}).length,gelisim:(T.gel||[]).filter(function(x){return x.asama=='ik'||x.asama=='ceo'}).length},
kararlar:kar,finans:fin}}
function ofisYaz(zorla){if(!API||!API.ofisYaz)return Promise.resolve(null);var o;try{o=ofisOzet()}catch(e){return Promise.resolve(null)}
var j=JSON.stringify(o);if(!zorla&&j==OF.son)return Promise.resolve(null);OF.son=j;o.guncelleme=new Date().toISOString();
return API.ofisYaz(o).then(function(r){if(!r||!r.ok)OF.son=null;return r},function(){OF.son=null;return null})}
function ofisZamanla(){clearTimeout(OF.z);OF.z=setTimeout(ofisYaz,3000)}
(function(){var _s=window.save;window.save=function(){var r=_s.apply(this,arguments);ofisZamanla();return r}})();
setTimeout(function(){ofisYaz()},4000);
// Ofis oyunundan karar: toplantı odası laptopunda Kabul/Reddet → BelgelerOrinGelenoyun-karar-*.json
// {tur:'karar', kim, id (iş isteği), sonuc:'kabul'|'red', kaynak:'ofis-oyunu'} → isOnay (Orvane'deki Onayla/Reddet ile aynı akış)
GELEN_TUR.karar=function(x){var it=typeof isBul=='function'?isBul(x.id):null;if(!it||it.durum!='onay')return false;var ok=x.sonuc=='kabul';
tmPush(it.kim,{r:'sys',t:'Çağlar ofis oyununda (toplantı odası laptopu) iş isteğini '+(ok?'kabul etti':'reddetti')+': '+it.baslik});isOnay(it.id,ok?1:0);return true};
// Test (smoke): gizlilik, kişisel finans ayrımı, dosyaya yazım
window.__ofisTest=function(){var R=[],T=TMS();function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
var bk={gor:T.gorev.slice(),gz:S.gizlilik?JSON.stringify(S.gizlilik):null,fn:S.finans?JSON.stringify(S.finans):null,of:S.ofis?JSON.stringify(S.ofis):null};
return Promise.resolve().then(function(){var now=Date.now();
T.gorev.push({id:'oft1',kim:'sage',metin:'Ofis özeti deneme görevi',durum:'acik',ts:now},{id:'oft2',kim:'iris',metin:'GİZLİ İÇERİK',durum:'acik',ts:now},{id:'oft3',kim:'luca',metin:'Cuma raporu (ofis testi)',durum:'bitti',ts:now-5000,bts:now+999999},{id:'oft4',kim:'iris',metin:'GİZLİ BİTEN',durum:'bitti',ts:now,bts:now+999998});
gzS().d.iris=3;var f=fnS();f.kayit.push({tur:'gelir',kim:'cagla',tutar:12345,tarih:fnBugun()},{tur:'gelir',kim:'sirket',tutar:500,tarih:fnBugun()},{tur:'gider',kim:'cagla',tutar:777,tarih:fnBugun()});
var o=ofisOzet(),js=JSON.stringify(o),sg=o.calisanlar.filter(function(c){return c.id=='sage'})[0],ir=o.calisanlar.filter(function(c){return c.id=='iris'})[0];
t('Ofis özeti: alanlar',o.surum==1&&o.mesai&&o.mesai.gelis&&Array.isArray(o.calisanlar)&&o.bekleyenOnay&&Array.isArray(o.kararlar)&&o.finans,js.slice(0,200));
t('Ofis özeti: çalışan durumu ve aktif görev',sg&&sg.durum=='calisiyor'&&/deneme görevi/.test(sg.aktifGorev),JSON.stringify(sg));
t('Ofis özeti: gizli çalışanın görev içeriği yazılmaz',ir&&ir.aktifGorev===null&&ir.acikGorev>=1&&!/GİZLİ/.test(js),JSON.stringify(ir));
t('Ofis özeti: son tamamlanan (en yeni önde, gizli başlıksız)',o.sonTamamlanan[0].id=='oft3'&&o.sonTamamlanan[1].id=='oft4'&&o.sonTamamlanan[1].baslik===null,JSON.stringify(o.sonTamamlanan.slice(0,2)));
t('Ofis özeti: kişisel gelir/gider yazılmaz',o.finans.gelir>=500&&o.finans.gelir<12345&&!/12345|777|benim/.test(js),JSON.stringify(o.finans));
var bkIs=JSON.stringify(S.isler||[]);S.isler=S.isler||[];S.isler.push({id:'isOFT',kim:'ada',baslik:'Ofis karar testi',metin:'deneme',durum:'onay',toplanti:'tpOFT',tur:'is',ts:now});
var o2=ofisOzet();t('Ofis özeti: toplantı kararı listede',o2.kararlar.some(function(k){return k.id=='isOFT'&&k.kim=='ada'}),JSON.stringify(o2.kararlar));
var r1=GELEN_TUR.karar({tur:'karar',kim:'ada',id:'isOFT',sonuc:'red'}),itx=isBul('isOFT');
t('Oyundan gelen karar (red) uygulanır',r1===true&&itx&&itx.durum=='red',JSON.stringify(itx&&itx.durum));
t('Aynı karar ikinci kez uygulanmaz',GELEN_TUR.karar({tur:'karar',kim:'ada',id:'isOFT',sonuc:'kabul'})===false&&isBul('isOFT').durum=='red');
t('Bilinmeyen karar yok sayılır',GELEN_TUR.karar({tur:'karar',kim:'ada',id:'yokYok',sonuc:'kabul'})===false);
t('Karar sonrası özetten düşer',!ofisOzet().kararlar.some(function(k){return k.id=='isOFT'}));
S.isler=JSON.parse(bkIs);
OF.son=null;return ofisYaz(true).then(function(r){t('Ofis özeti dosyaya yazılır',r&&r.ok&&/ofis-ozet\.json$/.test(r.v),JSON.stringify(r));return API.ofisOku()}).then(function(r){
t('Ofis özeti dosyadan geri okunur',r&&r.ok&&r.v&&r.v.surum==1&&r.v.guncelleme&&r.v.calisanlar.length==o.calisanlar.length,JSON.stringify(r).slice(0,200))})})
.catch(function(e){t('Ofis özeti testi',false,e.stack)}).then(function(){T.gorev=bk.gor;if(bk.gz)S.gizlilik=JSON.parse(bk.gz);else delete S.gizlilik;if(bk.fn)S.finans=JSON.parse(bk.fn);else delete S.finans;if(bk.of)S.ofis=JSON.parse(bk.of);else delete S.ofis;OF.son=null;save();return R})};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){return window.__ofisTest().then(function(y){return x.concat(y)})})}})();
