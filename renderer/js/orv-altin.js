// ========================================================================
// Orvane 0.9.12 · Ailem › Altın Hesabım. Tasarım 0.8.0 dili ve Aylık Bütçe sayfasının kart/tablo sınıfları (orv-butce.css: gg-*).
// Veri: S.orvA.altin = {kalem:[{id,tur,miktar,alis,tarih,not,ts}], fiyat:{t:{tur:{satis,alis,deg,kaynak}},kaynak,tarih,ts}} (durum.json).
//  • miktar: gram türlerinde gram (3 basamağa kadar), adetli türlerde tam sayı adet. alis: toplam alış tutarı (TL, isteğe bağlı).
//  • Birim fiyat = satış fiyatı (Anasayfa'daki gram altın kartı gibi); "bozdurursan" değeri alış fiyatıyla ayrıca gösterilir.
//  • Fiyat: Truncgil v4 (ücretsiz; ana süreç 'piyasa:altin'). KARARLAR › 4: Kapalıçarşı tercih edilir → Otto'nun bugünkü piyasa verisi
//    Kapalıçarşı kaynaklıysa gram ve çeyrek satış fiyatı ondan alınır. Günlük değişim Truncgil'in günlük % değişiminden (▲ / ▼).
//  • Altın Aile Bütçesine işlenmez, telefona gönderilmez (şimdilik).
// ========================================================================
var AH=window.AH||{};
(function(){
var E=function(s){return typeof esc=='function'?esc(s):String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')};
var r2=function(n){return Math.round((+n||0)*100)/100};
var tl=function(n){return Math.round(+n||0).toLocaleString('tr-TR')};
var sayi=function(n,b){return (+n||0).toLocaleString('tr-TR',{maximumFractionDigits:b==null?3:b})};
var SMOKE=function(){return typeof INFO!='undefined'&&INFO&&INFO.smoke};
AH.TUR=[['gram','Gram altın','gram','GRA'],['has','Has altın (24 ayar)','gram','HAS'],['bilezik22','22 ayar bilezik','gram','YIA'],['ayar18','18 ayar altın','gram','18AYARALTIN'],['ayar14','14 ayar altın','gram','14AYARALTIN'],
 ['ceyrek','Çeyrek altın','adet','CEYREKALTIN'],['yarim','Yarım altın','adet','YARIMALTIN'],['tam','Tam altın','adet','TAMALTIN'],['cumhuriyet','Cumhuriyet altını','adet','CUMHURIYETALTINI'],['ata','Ata altın','adet','ATAALTIN'],
 ['resat','Reşat altın','adet','RESATALTIN'],['gremse','Gremse altın','adet','GREMSEALTIN'],['ikibucuk','İkibuçuk altın','adet','IKIBUCUKALTIN'],['besli','Beşli altın','adet','BESLIALTIN']];
AH.tur=function(id){return AH.TUR.filter(function(x){return x[0]==id})[0]||null};
AH.ui={edit:null,yeni:false};
AH.st=function(){var a=OA.st();if(!a.altin||typeof a.altin!='object')a.altin={};if(!Array.isArray(a.altin.kalem))a.altin.kalem=[];return a.altin};
AH.miktarOku=function(x,birim){var s=String(x==null?'':x).trim().replace(/\s/g,'');if(s.indexOf(',')>=0)s=s.replace(/\./g,'').replace(',','.');var n=+s;if(!isFinite(n)||n<=0)return 0;return birim=='adet'?(Math.round(n)==n&&n<=100000?n:0):(n<=100000?Math.round(n*1000)/1000:0)};

// ---------- Fiyat ----------
// raw: ana süreçten {ham:{GRA:{Buying,Selling,Change},…},kaynak,tarih}. Döner {t:{tur:{satis,alis,deg,kaynak}},kaynak,tarih,ts} ya da null
AH.fiyatOku=function(raw){if(!raw||!raw.ham)return null;var t={};AH.TUR.forEach(function(x){var h=raw.ham[x[3]];if(!h)return;var s=+h.Selling||0,a=+h.Buying||0;if(!(s>0||a>0))return;t[x[0]]={satis:r2(s||a),alis:r2(a||s),deg:Math.round((+h.Change||0)*100)/100,kaynak:raw.kaynak||'Truncgil'}});
 if(!t.gram)return null;var f={t:t,kaynak:raw.kaynak||'Truncgil',tarih:String(raw.tarih||''),ts:+raw.alindi||Date.now()};if(raw.eski)f.eski=true;return AH.kapali(f)};
// Kapalıçarşı tercihi: Otto'nun bugünkü verisi Kapalıçarşı kaynaklıysa gram/çeyrek satış fiyatı ondan
AH.kapali=function(f){try{var p=fnS().piyasa||{},o=p.otto,v=o&&o.veri;if(!v||o.gun!=OA.bugunKey()||!/kapal/i.test(String(v.kaynak||'')))return f;
  [['gram','gram_altin'],['ceyrek','ceyrek_altin']].forEach(function(x){var n=+v[x[1]];if(n>0&&f.t[x[0]]){f.t[x[0]].satis=r2(n);f.t[x[0]].kaynak='Kapalıçarşı'}})}catch(e){}return f};
AH.fiyat=function(){return AH.st().fiyat||null};
AH.yenile=function(zorla){if(typeof API=='undefined'||!API||!API.piyasa||!API.piyasa.altin||SMOKE())return Promise.resolve(null);AH._yuk=true;
 return call(API.piyasa.altin(!!zorla)).then(function(raw){var f=AH.fiyatOku(raw);AH._yuk=false;if(f){AH.st().fiyat=f;OA.kaydet()}else toast('Altın fiyatı okunamadı');if(typeof pg!='undefined'&&pg=='altin')ORV.yenile();return f},
  function(e){AH._yuk=false;if(zorla)toast('Altın fiyatı alınamadı: '+(e&&e.message||e));if(typeof pg!='undefined'&&pg=='altin')ORV.yenile();return null})};
AH.cek=function(){var f=AH.fiyat();if(AH._yuk||SMOKE())return;if(!f||Date.now()-(+f.ts||0)>15*60e3)AH.yenile(false)};

// ---------- Hesap ----------
// Satır: değer = miktar × satış; bozdurma = miktar × alış; kâr/zarar = değer − alış tutarı (girildiyse); günlük = değer × d/(100+d)
AH.hesap=function(f){f=f===undefined?AH.fiyat():f;var L=AH.st().kalem.map(function(k){var d=AH.tur(k.tur)||['?',k.tur,'adet',''],p=f&&f.t&&f.t[k.tur],m=+k.miktar||0;
  var r={id:k.id,k:k,ad:d[1],birim:d[2],miktar:m,fiyat:p||null,deger:p?r2(m*p.satis):null,bozdur:p?r2(m*p.alis):null,alis:+k.alis>0?r2(k.alis):null,deg:p?p.deg:null};
  r.kar=r.deger!=null&&r.alis!=null?r2(r.deger-r.alis):null;r.gunluk=r.deger!=null&&p?r2(r.deger*p.deg/(100+p.deg)):null;return r});
 var T={satir:L,deger:0,bozdur:0,alis:0,karDeger:0,gunluk:0,gram:0,adet:0,eksik:0};
 L.forEach(function(r){if(r.birim=='gram')T.gram+=r.miktar;else T.adet+=r.miktar;if(r.deger==null){T.eksik++;return}T.deger+=r.deger;T.bozdur+=r.bozdur;T.gunluk+=r.gunluk;if(r.alis!=null){T.alis+=r.alis;T.karDeger+=r.deger}});
 ['deger','bozdur','alis','karDeger','gunluk'].forEach(function(k){T[k]=r2(T[k])});T.gram=Math.round(T.gram*1000)/1000;T.kar=T.alis?r2(T.karDeger-T.alis):null;T.karP=T.alis?Math.round((T.karDeger-T.alis)/T.alis*1000)/10:null;
 T.gunlukP=T.deger&&T.deger-T.gunluk?Math.round(T.gunluk/(T.deger-T.gunluk)*10000)/100:0;return T};

// ---------- Ekle / düzelt / sil ----------
AH.dogrula=function(o){var d=AH.tur(o&&o.tur);if(!d)return{hata:'Altın türünü seç'};var m=AH.miktarOku(o.miktar,d[2]);if(!m)return{hata:d[2]=='adet'?'Adedi tam sayı olarak yaz':'Gramı yaz (ör. 12,5)'};
 var a=String(o.alis==null?'':o.alis).trim(),al=a===''?null:GG.tutarOku(a);if(a!==''&&!al)return{hata:'Alış tutarını TL olarak yaz ya da boş bırak'};
 return{tur:d[0],miktar:m,alis:al,tarih:/^\d{4}-\d{2}-\d{2}$/.test(o.tarih||'')?o.tarih:'',not:String(o.not||'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,80)}};
AH.ekle=function(o){var v=AH.dogrula(o);if(v.hata){toast(v.hata);return null}var k={id:'au'+(typeof uid=='function'?uid():Date.now().toString(36)),tur:v.tur,miktar:v.miktar,tarih:v.tarih,not:v.not,ts:Date.now()};if(v.alis)k.alis=v.alis;
 AH.st().kalem.push(k);OA.kaydet();return k};
AH.guncelle=function(id,o){var k=AH.st().kalem.filter(function(x){return x.id==id})[0];if(!k)return null;var v=AH.dogrula(o);if(v.hata){toast(v.hata);return null}
 k.tur=v.tur;k.miktar=v.miktar;k.tarih=v.tarih;k.not=v.not;if(v.alis)k.alis=v.alis;else delete k.alis;k.ts=Date.now();OA.kaydet();return k};
AH.silKayit=function(id){var x=AH.st(),n=x.kalem.length;x.kalem=x.kalem.filter(function(k){return k.id!=id});if(x.kalem.length==n)return false;OA.kaydet();return true};

// ---------- Görünüm ----------
var gec=function(s){return 'animation-delay:'+s.toFixed(3)+'s'};
var kart=function(ic,d,sinif){return '<section class="gg-k'+(sinif?' '+sinif:'')+'" style="'+gec(d)+'">'+ic+'</section>'};
var ok=function(d){return d>0?'▲':d<0?'▼':''};
var renk=function(d){return d>0?'#7ee2a0':d<0?'#ff9a85':'var(--yazi2)'};
var degY=function(tlD,p){if(tlD==null)return '<span class="soluk">—</span>';return '<span class="ah-dg" style="color:'+renk(tlD)+'">'+ok(tlD)+' '+tl(Math.abs(tlD))+' ₺'+(p!=null?' <small>%'+sayi(Math.abs(p),2)+'</small>':'')+'</span>'};
AH.sayfa=function(){AH.cek();var f=AH.fiyat(),T=AH.hesap(f),say=function(v,fm,d){return GG.say(v,fm,d)};
 var kyn=f?'<span class="gg-pil g ah-kyn" title="Fiyat zamanı">'+E((f.eski?'Son bilinen · ':'')+(f.t.gram&&f.t.gram.kaynak=='Kapalıçarşı'?'Kapalıçarşı + Truncgil':f.kaynak||'Truncgil')+(f.tarih?' · '+f.tarih.slice(0,16):''))+'</span>':'<span class="gg-pil ah-kyn">Fiyat bekleniyor</span>';
 var ust='<header class="gg-ust"><div class="gg-mk"><span class="gg-lg ah-lg" aria-hidden="true">Au</span><div><b>Altın Hesabım</b><small>Ailem · altın birikimi ve güncel değer</small></div></div><div class="gg-sag">'+kyn+'<button type="button" class="gg-btn ikinci kucuk" onclick="AH.yenile(true)"'+(AH._yuk?' disabled':'')+'>↻ Fiyatları yenile</button></div></header>';
 var bos=!T.satir.length;
 var k1='<div class="gg-r"><span class="gg-et"><span class="gg-nok" style="background:#e0a32e"></span>Toplam değer · satış fiyatıyla</span>'+(T.satir.length?'<span class="gg-pil">'+(T.gram?sayi(T.gram)+' gr':'')+(T.gram&&T.adet?' · ':'')+(T.adet?sayi(T.adet,0)+' adet':'')+'</span>':'')+'</div>'+
  (bos?'<div class="gg-buyuk soluk"><span>—</span></div><div class="gg-alt">Henüz altın yok. Aşağıdan “+ Altın ekle” ile türünü ve miktarını gir.</div>'
   :f?'<div class="gg-buyuk"><span>'+say(T.deger,'tl')+'</span><i>₺</i></div><div class="gg-alt">Bugün '+degY(T.gunluk,T.gunlukP)+' · bozdurursan ≈ <b>'+say(T.bozdur,'tl',.15)+' ₺</b>'+(T.eksik?' · '+T.eksik+' türün fiyatı yok':'')+'</div>'
   :'<div class="gg-buyuk soluk"><span>—</span></div><div class="gg-alt">Fiyat bekleniyor · “Fiyatları yenile”ye bas (internet gerekir).</div>')+
  '<div class="gg-dz"><button type="button" class="gg-btn" onclick="AH.yeniAc()">+ Altın ekle</button></div>';
 var k2='<div class="gg-r gg-et"><span>Kâr / zarar</span><span>alış tutarına göre</span></div>'+(T.kar!=null?'<div class="gg-orta" style="color:'+renk(T.kar)+'">'+ok(T.kar)+' '+say(Math.abs(T.kar),'tl',.25)+' ₺</div><div class="gg-alt">Alış '+tl(T.alis)+' ₺ → bugün '+tl(T.karDeger)+' ₺ · <b style="color:'+renk(T.kar)+'">%'+sayi(Math.abs(T.karP),1)+'</b>'+(T.karDeger<T.deger?' <span class="soluk">(alış tutarı girilen satırlar)</span>':'')+'</div>'
  :'<div class="gg-orta soluk">—</div><div class="gg-alt">Satırlara alış tutarı girersen kâr/zarar burada hesaplanır.</div>');
 var fl=['gram','ceyrek','yarim','tam','cumhuriyet'].map(function(id){var p=f&&f.t[id],d=AH.tur(id);return '<div class="ah-fs"><span>'+E(d[1])+(p&&p.kaynak=='Kapalıçarşı'?' <small class="soluk">Kapalıçarşı</small>':'')+'</span><b>'+(p?tl(p.satis)+' ₺':'—')+'</b><span class="ah-dg" style="color:'+renk(p?p.deg:0)+'">'+(p?ok(p.deg)+' %'+sayi(Math.abs(p.deg),2):'')+'</span></div>'}).join('');
 var k3='<div class="gg-r gg-et"><span>Güncel fiyatlar · satış</span><span>günlük</span></div><div class="ah-fl">'+fl+'</div>';
 return '<div class="gg ah" id="ahKok">'+ust+'<div id="ahGovde"'+(AH._sessiz?' class="gg-sessiz"':'')+'><div class="gg-sut"><div class="gg-g3">'+kart(k1,.12)+kart(k2,.21)+kart(k3,.3)+'</div>'+kart('<div class="gg-r"><b class="gg-bas">Altınlarım</b><button type="button" class="gg-btn kucuk" onclick="AH.yeniAc()">+ Altın ekle</button></div><div id="ahTablo">'+AH.tablo(T)+'</div>',.39,'tablo')+'</div></div></div>'};
AH.tablo=function(T){T=T||AH.hesap();var u=AH.ui;
 var th='<thead><tr><th scope="col" style="text-align:left">Tür</th><th scope="col" style="text-align:right">Miktar</th><th scope="col" style="text-align:right">Birim fiyat</th><th scope="col" style="text-align:right">Değer</th><th scope="col" style="text-align:right">Alış</th><th scope="col" style="text-align:right">Kâr / zarar</th><th scope="col" style="text-align:right">Günlük</th><th scope="col" style="width:48px"><span class="gg-gz">İşlem</span></th></tr></thead>';
 var s=T.satir.map(function(r){if(u.edit==r.id)return AH.duzenSatir(r.k);
  return '<tr class="gg-tr"><td><span class="gg-kal"><span class="gg-kr ah-kr" aria-hidden="true"></span><b>'+E(r.ad)+'</b>'+(r.k.not?'<span class="soluk ah-not">'+E(r.k.not)+'</span>':'')+'</span></td><td class="nw" style="text-align:right">'+sayi(r.miktar,r.birim=='adet'?0:3)+' '+(r.birim=='gram'?'gr':'adet')+'</td>'+
   '<td class="nw" style="text-align:right">'+(r.fiyat?tl(r.fiyat.satis)+' ₺<small class="soluk"> · alış '+tl(r.fiyat.alis)+'</small>':'<span class="soluk">—</span>')+'</td><td class="gg-tt nw" style="text-align:right">'+(r.deger!=null?tl(r.deger)+' ₺':'—')+'</td>'+
   '<td class="nw soluk" style="text-align:right">'+(r.alis!=null?tl(r.alis)+' ₺':'—')+'</td><td class="nw" style="text-align:right">'+(r.kar!=null?'<span style="color:'+renk(r.kar)+'">'+ok(r.kar)+' '+tl(Math.abs(r.kar))+' ₺</span>':'<span class="soluk">—</span>')+'</td>'+
   '<td class="nw" style="text-align:right">'+degY(r.gunluk,null)+'</td><td class="gg-is"><button type="button" class="gg-kalem" aria-label="'+E(r.ad+' satırını düzenle')+'" onclick="AH.duzenle(\''+E(r.id)+'\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button></td></tr>'}).join('');
 if(u.yeni)s=AH.duzenSatir(null)+s;if(!s)s='<tr><td colspan="8" class="gg-bos">Henüz altın yok. “+ Altın ekle” ile başla.</td></tr>';
 return '<div class="gg-ts"><table class="gg-tab ah-tab"><caption class="gg-gz">Altınlarım</caption>'+th+'<tbody>'+s+'</tbody></table></div>'+(T.satir.length?'<div class="gg-top">'+T.satir.length+' satır · değer '+tl(T.deger)+' ₺'+(T.alis?' · alış '+tl(T.alis)+' ₺':'')+'</div>':'')};
AH.duzenSatir=function(k){var o=k||{tur:'gram',miktar:'',alis:'',tarih:'',not:''};
 var opt=AH.TUR.map(function(x){return '<option value="'+x[0]+'"'+(x[0]==o.tur?' selected':'')+'>'+E(x[1])+' ('+x[2]+')</option>'}).join('');
 return '<tr class="gg-ed" id="ahEd" data-id="'+E(k?k.id:'')+'"><td><select id="ahETu" aria-label="Altın türü">'+opt+'</select></td><td><input type="text" id="ahEMi" inputmode="decimal" aria-label="Miktar (gram ya da adet)" value="'+E(o.miktar===''?'':String(o.miktar).replace('.',','))+'" placeholder="Miktar" class="gg-tin"></td>'+
  '<td colspan="2"><input type="text" id="ahENo" aria-label="Not" value="'+E(o.not||'')+'" maxlength="80" placeholder="Not (ör. düğün takısı)"></td><td><input type="text" id="ahEAl" inputmode="decimal" aria-label="Toplam alış tutarı (TL, isteğe bağlı)" value="'+E(o.alis?String(o.alis).replace('.',','):'')+'" placeholder="Alış ₺" class="gg-tin"></td>'+
  '<td colspan="2"><input type="date" id="ahETa" aria-label="Alış tarihi (isteğe bağlı)" value="'+E(o.tarih||'')+'"></td><td></td></tr>'+
  '<tr class="gg-ed2"><td colspan="8"><div class="gg-edd"><span class="gg-edn">Gram türlerinde gram, adetli altınlarda adet yaz. Alış tutarı girersen kâr/zarar hesaplanır.</span>'+(k?'<button type="button" class="gg-btn sil kucuk" onclick="AH.sil()">Sil</button>':'')+'<button type="button" class="gg-btn cerceve kucuk" onclick="AH.vazgec()">Vazgeç</button><button type="button" class="gg-btn kucuk" onclick="AH.kaydet()">Kaydet</button></div></td></tr>'};
AH.cizYenile=function(){if(typeof pg!='undefined'&&pg=='altin'){AH._sessiz=true;ORV.yenile();AH._sessiz=false}};
AH.yeniAc=function(){AH.ui.yeni=true;AH.ui.edit=null;AH.cizYenile();var e=document.getElementById('ahEMi');if(e)e.focus()};
AH.duzenle=function(id){AH.ui.edit=id;AH.ui.yeni=false;AH.cizYenile();var e=document.getElementById('ahEMi');if(e)e.focus()};
AH.vazgec=function(){AH.ui.edit=null;AH.ui.yeni=false;AH.cizYenile()};
AH.oku=function(){var g=function(id){var e=document.getElementById(id);return e?e.value:''};return{tur:g('ahETu'),miktar:g('ahEMi'),alis:g('ahEAl'),tarih:g('ahETa'),not:g('ahENo')}};
AH.kaydet=function(){var ed=document.getElementById('ahEd'),id=ed&&ed.getAttribute('data-id'),o=AH.oku(),k=id?AH.guncelle(id,o):AH.ekle(o);if(!k)return;
 var d=AH.tur(k.tur);toast((id?'Güncellendi: ':'Eklendi: ')+d[1]+' · '+sayi(k.miktar,d[2]=='adet'?0:3)+' '+(d[2]=='gram'?'gr':'adet'));AH.ui.edit=null;AH.ui.yeni=false;AH.cizYenile()};
AH.sil=function(){var ed=document.getElementById('ahEd'),id=ed&&ed.getAttribute('data-id'),k=AH.st().kalem.filter(function(x){return x.id==id})[0];if(!k)return;var d=AH.tur(k.tur)||['','Altın'];
 confirmBox('“'+E(d[1])+' · '+sayi(k.miktar)+'” silinsin mi?',function(){if(AH.silKayit(id))toast('Silindi');AH.ui.edit=null;AH.cizYenile()},'Sil')};
ORV.sayfa('altin',{ciz:AH.sayfa,sonra:function(){var k=document.getElementById('ahKok');if(k&&GG.sayAnim)GG.sayAnim(k)},baslik:'Ailem › Altın Hesabım'});
})();
