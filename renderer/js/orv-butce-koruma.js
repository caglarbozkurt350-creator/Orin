// ========================================================================
// Orvane 0.9.13 · Aile Bütçesi koruması (orv-butce-kural.js ve orv-fuzulev.js'ten sonra yüklenir).
// Kullanıcı kararı (2026-11-27): "Gelir eklemeden gelir artmasın; maaş + SGK ödemesini geçmesin."
// Kullanıcı (ya da eşi) gelir eklemedikçe aylık gelir ve Aile Bütçesi bakiyesi ARTMAZ. 0.9.12 kurallarına ek olarak kapatılan yollar:
//  1. Silinen banka / telefon / eş kaydı, aynı olay yeniden eşitlenince ya da aynı dosya yeniden içe aktarılınca geri gelmez (fnS().silinen).
//  2. Telefondan (Çağlar) ve eşin telefonundan gelen gelir de Bordro sınırına (Net Ödenen + SGK ödeneği) uyar; aşan kaydedilmez.
//  3. Aylık tablo "Elle düzeltme": ekranda yuvarlanmış gösterilen gelir (91.112,33 → 91.112) yalnız gider değiştirilip kaydedilince
//     kuruş farkı gelir yazılmaz; elle gelir artışı da sınıra uyar.
//  4. Cep harçlığı isteği (telefon olayı) yeniden gelirse ikinci kez eklenmez (kalıcı olay listesi; hareket listesi 200'de kırpılıyordu).
//  5. İçe Aktar dosyasındaki bakiye, beklenenden (son bildirilen ± işlenmemiş kayıtlar + dosyadaki yeni gelirler) yüksekse uygulanmaz.
//  6. Çift maaş: aynı ayda maaş geliri varken bankadan gelen "Maaş" kaydı ya da Bordro'nun otomatik maaşı ikinci kez yazılmaz.
// Hiçbir eski özellik silinmez; işlevler sarmalanır.
// ========================================================================
var BKK=window.BKK||{};
(function(){
var r2=function(n){return Math.round((+n||0)*100)/100};
var ayK=function(t){return String(t||'').slice(0,7)};
var tl=function(n){return (Math.round((+n||0)*100)/100).toLocaleString('tr-TR',{maximumFractionDigits:2})};
var tutarOku=function(x){var t=Math.round((+String(x==null?'':x).replace(',','.')||0)*100)/100;return t>0?t:0};
var bugun=function(){return OA.bugunKey()};
var ayAd=function(ay){return typeof GG!='undefined'&&GG.ayAd?GG.ayAd(ay):ay};
var kaydet=function(){try{if(typeof save=='function')save()}catch(e){}};

// ---------- Kalıcı olay izi (cep isteği, reddedilen telefon geliri) ----------
BKK.iz=function(){var a=OA.st();if(!Array.isArray(a.olayIz))a.olayIz=[];return a.olayIz};
BKK.izVar=function(id){return !!id&&BKK.iz().indexOf(String(id))>=0};
BKK.izEkle=function(id){if(!id||BKK.izVar(id))return;var L=BKK.iz();L.push(String(id));if(L.length>1000)L.splice(0,L.length-1000)};
BKK.not=function(id,ad,alt,tutar){var a=OA.st();if(!Array.isArray(a.hareket))a.hareket=[];if(id&&a.hareket.some(function(x){return x.id==id}))return;
 a.hareket.push({id:id||uid(),tur:'bilgi',ad:ad,alt:alt,tutar:tutar||0,ts:Date.now()});if(a.hareket.length>200)a.hareket.splice(0,a.hareket.length-200)};

// ---------- 1) Silinen dış kayıtlar geri gelmez ----------
BKK.DIS={banka:1,telefon:1,'es-telefon':1};
BKK.silinen=function(){var f=fnS();if(!Array.isArray(f.silinen))f.silinen=[];return f.silinen};
BKK.silindi=function(id){return !!id&&BKK.silinen().indexOf(String(id))>=0};
BKK.isaretle=function(r){if(!r||!r.id||!BKK.DIS[r.kaynak]||BKK.silindi(r.id))return;var L=BKK.silinen();L.push(String(r.id));if(L.length>2000)L.splice(0,L.length-2000)};
if(typeof fnKaydet=='function'){var _fk=fnKaydet;fnKaydet=function(o,id){if(id&&BKK.silindi(id))return null;return _fk(o,id)}}
if(typeof GG!='undefined'&&GG.silKayit){var _gs=GG.silKayit;GG.silKayit=function(id){var r=GG.bul(id),c=r?{id:r.id,kaynak:r.kaynak}:null,ok=_gs(id);if(ok&&c){BKK.isaretle(c);kaydet()}return ok}}

// ---------- 2) Telefondan gelen gelir de Bordro sınırına uyar ----------
// Döner: null (uygun) | sınır yazısı (kaydedilmez)
BKK.telefonGelir=function(tarih,tutar,kalem){if(typeof BKR=='undefined'||!BKR.gelirOk||!(tutar>0))return null;var ay=/^\d{4}-\d{2}-\d{2}$/.test(tarih||'')?ayK(tarih):ayK(bugun()),c=BKR.gelirOk(ay,tutar,null,kalem);return c.ok?null:BKR.asimYazi(c)};
// Kullanıcı girişi kaybolmaz: sınırı aşan telefon geliri bütçeye yazılmaz ama olduğu gibi saklanır (S.orvA.gelirRed); kural düzelirse elle eklenebilir
BKK.gelirRed=function(){var a=OA.st();if(!Array.isArray(a.gelirRed))a.gelirRed=[];return a.gelirRed};
BKK.telefonRed=function(id,kim,tutar,yazi,veri){var ilk=!BKK.izVar('sr'+id);BKK.izEkle('sr'+id);if(ilk){var L=BKK.gelirRed();if(!L.some(function(x){return x.id==id})){L.push({id:String(id),kim:kim,tutar:tutar,veri:veri?JSON.parse(JSON.stringify(veri)):null,neden:yazi,ts:Date.now()});if(L.length>200)L.splice(0,L.length-200)}BKK.not('sr'+id,kim+' telefonundan gelen gelir kaydedilmedi',yazi,tutar);try{toast(kim+' telefonundan gelen '+tl(tutar)+' ₺ gelir kaydedilmedi: Bordro sınırı')}catch(e){}}kaydet()};
if(typeof bulutUygula=='function'){var _bu=bulutUygula;bulutUygula=function(e){var v=e&&e.veri||{};
 if(e&&e.tur=='finans_kayit'&&v.tur=='gelir'&&v.kim!='sirket'&&!(typeof GG!='undefined'&&GG.bul(e.id))){
  if(BKK.silindi(e.id)||BKK.izVar('sr'+e.id))return;var t=tutarOku(v.tutar),y=BKK.telefonGelir(v.tarih,t,v.kalem);if(y){BKK.telefonRed(e.id,'Çağlar’ın',t,y,v);return}}
 return _bu(e)}}
if(typeof OAI!='undefined'&&OAI.uygula){var _ou=OAI.uygula;OAI.uygula=function(e,kim){var v=e&&e.veri||{};
 if(e&&e.tur=='es_gelir'&&!(typeof GG!='undefined'&&GG.bul('fn'+e.id))){if(BKK.silindi('fn'+e.id)||BKK.izVar('sr'+e.id))return false;
  var t=OAI.tutar(v.tutar),y=BKK.telefonGelir(OAI.tarihOk&&OAI.tarihOk(v.tarih)?v.tarih:'',t,v.kat);if(y){BKK.telefonRed(e.id,'Eşinin',t,y,v);return false}}
 return _ou.apply(this,arguments)}}

// ---------- 3) Aylık tablo "Elle düzeltme" ----------
if(OA.ayDuzelt){var _ad=OA.ayDuzelt;OA.ayDuzelt=function(ay,tur,yeni){var T=OA.ayToplam(ay),eski=tur=='gelir'?T.gelir:T.gider;
 // Tablo tutarı tam liraya yuvarlayarak gösterir: değiştirilmemiş satır kuruş farkı yazmaz
 if(isFinite(yeni)&&Math.round(eski)==r2(yeni)&&Math.abs(r2(yeni)-eski)<1)return 0;
 if(tur=='gelir'&&isFinite(yeni)&&yeni>eski+0.005&&typeof BKR!='undefined'&&BKR.gelirOk){var c=BKR.gelirOk(ay,r2(yeni-eski));if(!c.ok){try{toast(BKR.asimYazi(c))}catch(e){}return 0}}
 return _ad(ay,tur,yeni)}}

// ---------- 4) Cep harçlığı isteği bir kez ----------
if(OA.cepIste){var _ci=OA.cepIste;OA.cepIste=function(k,t,kim,olay){if(olay&&BKK.izVar('ci'+olay))return null;var b=_ci(k,t,kim,olay);if(olay){BKK.izEkle('ci'+olay);if(b)kaydet()}return b}}

// ---------- 4b) Cep harçlığı bakiye bildirimiyle eklenmez ----------
// 0.9.10–0.9.11: cebi yüksek bildirmek (cep harçlığı eklemek) farkı "Kayıt dışı gelir" yazıp Aile Bütçesine de ekliyordu.
// Şimdi yüksek bildirim reddedilir; Çağlar/Kübra cebinde fark tek tuşla "cep harçlığı" olarak eklenir: cep artar, Aile Bütçesi ve gelir değişmez.
BKK.cepFark=function(k,t){if(k!='cagla'&&k!='kubra')return null;var bek=OA.bakBeklenen(k);if(bek==null||!(t>bek+0.005))return null;var fark=r2(t-bek);
 var b=OA.cepIste(k=='cagla'?'c':'e',fark,'bakiye bildiriminden · gelir değil');if(!b)return null;var s=OA.bakBildir(k,t,k=='kubra'?'Çağlar bildirdi':'uygulamadan');return {fark:fark,s:s}};
BKK.cepFarkKaydet=function(k){var e=document.getElementById('oaBt'),t=e?OA.okuTL(e.value):NaN;if(!isFinite(t))return;var r=BKK.cepFark(k,t);if(!r)return;
 try{OA.dlgKapat()}catch(x){}try{toast(OA.KASA_AD[k]+' cebine '+tl(r.fark)+' ₺ cep harçlığı eklendi · Aile Bütçesi ve gelir değişmedi')}catch(x){}try{ORV.yenile()}catch(x){}};
if(OA.bakKaydet){var _bk=OA.bakKaydet;OA.bakKaydet=function(k,onay){var r=_bk.apply(this,arguments);
 if(k=='cagla'||k=='kubra'){var e=document.getElementById('oaBt'),u=document.getElementById('oaBu'),t=e?OA.okuTL(e.value):NaN,bek=OA.bakBeklenen(k);
  if(u&&e&&isFinite(t)&&bek!=null&&t>bek+0.005&&!u.querySelector('.bkk-cep'))u.insertAdjacentHTML('beforeend',' <button type="button" class="oa-btn ghost sm bkk-cep" onclick="BKK.cepFarkKaydet(\''+k+'\')">Farkı ('+tl(t-bek)+' ₺) cep harçlığı olarak ekle · gelir sayılmaz</button>')}
 return r}}

// ---------- 6) Çift maaş ----------
BKK.maasVar=function(ay,haric){return (typeof GG!='undefined'?GG.kayitlar():[]).filter(function(k){return k.id!=haric&&ayK(k.tarih)==ay&&BKD.maas(k)})[0]||null};
if(typeof BR!='undefined'&&BR.butceEkle){var _be=BR.butceEkle;BR.butceEkle=function(m,zorla){
 if(m&&m.v&&!m.butce&&!(typeof GG!='undefined'&&GG.bul('br'+m.ay))&&+m.v.net>0&&BR.odemeTarih){var es=BKK.maasVar(ayK(BR.odemeTarih(m.ay)),'br'+m.ay);
  if(es){if(zorla&&BR.ui)BR.ui.er=ayAd(ayK(es.tarih))+' ayında zaten maaş geliri var ('+tl(es.tutar)+' ₺ · '+(es.kalem||'Maaş')+'). İkinci kez eklenmedi.';return false}}
 return _be(m,zorla)}}

// ---------- 5) İçe Aktar: bakiye artışı yalnız dosyadaki yeni gelirle ----------
BKK.iceSuz=function(o){if(!o||typeof o!='object')return {o:o,red:[],cift:0};var red=[],cift=0,g=Object.assign({},o),var0={};
 (typeof fnS=='function'?fnS().kayit:[]).forEach(function(x){var0[x.id]=1});
 // Çift maaş: ayda maaş geliri varken bankadan gelen "Maaş" kaydı yazılmaz
 if(Array.isArray(o.kayit))g.kayit=o.kayit.filter(function(x){if(!x||x.tur!='gelir'||x.kim=='sirket'||!x.id||var0[x.id])return true;var tarih=/^\d{4}-\d{2}-\d{2}$/.test(x.tarih||'')?x.tarih:'';
  if(tarih&&BKD.maas({tur:'gelir',id:String(x.id),kalem:x.kalem})&&BKK.maasVar(ayK(tarih))){cift++;return false}return true});
 // Dosyadaki yeni gelirler (kullanıcının eklediği gelir): bakiye en çok bu kadar artabilir
 var yeniGelir=r2((g.kayit||[]).filter(function(x){return x&&x.tur=='gelir'&&x.kim!='sirket'&&x.id&&!var0[x.id]&&!BKK.silindi(x.id)}).reduce(function(n,x){return n+tutarOku(x.tutar)},0));
 if(o.bak&&typeof o.bak=='object'){var b={};Object.keys(o.bak).forEach(function(k){var t=r2(o.bak[k]),bek=OA.KASA_AD[k]&&OA.bakBeklenen?OA.bakBeklenen(k):null;
  if(bek!=null&&isFinite(t)&&t>r2(bek+yeniGelir)+0.005)red.push({k:k,t:t,bek:bek});else b[k]=o.bak[k]});g.bak=b}
 return {o:g,red:red,cift:cift}};
if(OA.iceUygula){var _iu=OA.iceUygula;OA.iceUygula=function(o){var s=BKK.iceSuz(o),n=_iu.call(this,s.o);
 if(n&&typeof n=='object'){n.bakRed=s.red;n.ciftMaas=s.cift}
 s.red.forEach(function(x){var m=OA.KASA_AD[x.k]+' bakiyesi içe aktarılmadı: dosyada '+tl(x.t)+' ₺, beklenen '+tl(x.bek)+' ₺. Gelir eklenmeden bakiye artamaz.';BKK.not(null,m,'İçe Aktar',x.t);try{toast(m)}catch(e){}});
 if(s.cift){try{toast(s.cift+' maaş kaydı içe aktarılmadı: o ayın maaşı zaten kayıtlı')}catch(e){}}
 if(s.red.length||s.cift)OA.kaydet();return n};OA.iceUygula.__fe=true}
// ---------- 7) Düzenlerken girilen veri kaybolmaz (kullanıcı kuralı 2026-11-27) ----------
// Düzenleme işlevine gelmeyen (undefined) alan var olan değeriyle korunur; boş bırakılan ('') alan bilerek silinmiş sayılır.
BKK.doldur=function(o,eski){var y={};Object.keys(eski).forEach(function(k){if(eski[k]!==undefined)y[k]=eski[k]});Object.keys(o||{}).forEach(function(k){if(o[k]!==undefined)y[k]=o[k]});return y};
if(typeof GG!='undefined'&&GG.guncelle){var _gg=GG.guncelle;GG.guncelle=function(id,o){var r=GG.bul(id);if(!r)return _gg(id,o);
 return _gg(id,BKK.doldur(o,{tur:r.tur,tutar:String(r.tutar),kalem:r.kalem,tarih:r.tarih,not:r.not,kisi:r.kisi,kasa:GG.kasa(r)}))}}
if(typeof AH!='undefined'&&AH.guncelle){var _ag=AH.guncelle;AH.guncelle=function(id,o){var k=AH.st().kalem.filter(function(x){return x.id==id})[0];if(!k)return _ag(id,o);
 return _ag(id,BKK.doldur(o,{tur:k.tur,miktar:k.miktar,alis:k.alis,tarih:k.tarih,not:k.not}))}}
if(typeof FE!='undefined'&&FE.guncelle){var _fg=FE.guncelle;FE.guncelle=function(id,o){var t=FE.bul(id);if(!t)return _fg(id,o);
 return _fg(id,BKK.doldur(o,{no:t.no,tur:t.tur,vade:t.vade,tutar:t.tutar,odendi:t.odendi,odenen:t.odenen,odemeTarih:t.odemeTarih}))}}
// Sözleşme: dosyada / pencerede gelmeyen alan silinmez (eskiden FE.SOZ'daki her eksik alan silinirdi)
if(typeof FE!='undefined'&&FE.sozKaydet){var _fs=FE.sozKaydet;FE.sozKaydet=function(o){var s=FE.st().soz||{},y={};(FE.SOZ||[]).forEach(function(d){var k=d[0];y[k]=o&&o[k]!==undefined?o[k]:s[k]});return _fs(y)}}
// Bakiye bildirimi: bakiye nesnesindeki diğer alanlar korunur
if(OA.bakBildir){var _bb2=OA.bakBildir;OA.bakBildir=function(k){var b0=OA.st().bak&&OA.st().bak[k],ek=b0?JSON.parse(JSON.stringify(b0)):null,r=_bb2.apply(this,arguments),b1=OA.st().bak&&OA.st().bak[k];
 if(ek&&b1&&b1!==b0)Object.keys(ek).forEach(function(x){if(b1[x]===undefined)b1[x]=ek[x]});return r}}
})();
