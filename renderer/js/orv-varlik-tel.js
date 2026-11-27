// ========================================================================
// Orvane 0.9.14 · Altın Hesabım ve FuzulEv → Çağlar'ın telefonu (salt okunur).
// Özete (bulutOzet) aile.altin ve aile.fuzulev blokları eklenir. Eşin özetine (OAI.esOzet) GİTMEZ; aile profili kuralı.
// Veri yalnız okunur: S.orvA.altin ve S.orvA.fuzulev değiştirilmez (fiyat önbelleği AH'nin kendi alanıdır).
// Veri tasarrufu: özet bulut.js'te yalnız değişince gönderilir; burada zaman damgası yok, tutarlar kuruşa yuvarlanır.
//  • aile.altin  = {fiyat:{t:{tur:[satis,alis,deg%,kapali?1:0]},kaynak,tarih,eski}, kalem:[{id,tur,ad,birim,miktar,tarih,alis,not,deger,kar,gunluk}],
//                   (0.9.15 kalem: gram, gramStd (1 = standart ağırlıkla), ayar, has)
//                   top:{deger,bozdur,alis,karDeger,kar,karP,gunluk,gunlukP,gram,adet,eksik,gramTop,has,gramStd}, ag:{guncel,tufeSon,kurTarih,uyari,top,satir}|null}
//  • aile.fuzulev = {soz:{plan,tarih,kampanya,finTur,bedel,orgUcret,pesinat,taksitSay,teslimat,durum}, bugun, ozet:{…}, sonraki, geciken:[…], teslim, son,
//                   taksit:[[no,tur,vade,tutar,odenen,kalan,durum,gecikmeGun,odemeTarih]]}
// Telefondaki karşılığı: mobil/src/bilesen/Varlik.tsx (tipler lib/depo.ts → Altin, FuzulEv). Birini değiştirirken ötekini de güncelle.
// ========================================================================
var OVT=window.OVT||{};
(function(){
var r2=function(n){return n==null||!isFinite(+n)?null:Math.round(+n*100)/100};
var SMOKE=function(){return typeof INFO!='undefined'&&INFO&&INFO.smoke};
OVT.ANA=['gram','ceyrek','yarim','tam','cumhuriyet'];
OVT.SOZ=['plan','tarih','kampanya','finTur','bedel','orgUcret','pesinat','taksitSay','teslimat','durum'];

// Telefon özeti açıkken fiyat bayatsa (60 dk) sessizce yenilenir; alım gücü verisi uygulama başına bir kez istenir.
// Ağ isteği yalnız masaüstünde; telefona giden veri yine yalnız değişince gider.
OVT.tazele=function(){if(SMOKE()||typeof AH=='undefined'||typeof API=='undefined'||!API||!API.piyasa)return;var st=AH.st();if(!st.kalem.length)return;
 var f=AH.fiyat();if(API.piyasa.altin&&!AH._yuk&&(!f||Date.now()-(+f.ts||0)>60*60e3)&&Date.now()-(OVT._fts||0)>60*60e3){OVT._fts=Date.now();
  call(API.piyasa.altin(false)).then(function(raw){var y=AH.fiyatOku(raw);if(y){AH.st().fiyat=y;OA.kaydet()}},function(){})}
 if(!AH._ag&&!AH._agYuk&&!OVT._agDen&&st.kalem.some(function(k){return k.tarih&&+k.alis>0})){OVT._agDen=1;try{AH.agCek(false)}catch(e){}}};

// ---------- Altın ----------
OVT.altin=function(){if(typeof AH=='undefined')return null;var st=AH.st();if(!st.kalem.length)return null;var f=AH.fiyat(),T=AH.hesap(f),fy=null;
 if(f&&f.t){var t={},ist={};OVT.ANA.forEach(function(id){ist[id]=1});st.kalem.forEach(function(k){ist[k.tur]=1});
  Object.keys(ist).forEach(function(id){var p=f.t[id];if(p)t[id]=[r2(p.satis),r2(p.alis),r2(p.deg),p.kaynak=='Kapalıçarşı'?1:0]});
  fy={t:t,kaynak:String(f.kaynak||'Truncgil'),tarih:String(f.tarih||'').slice(0,16),eski:f.eski?1:0}}
 var kalem=T.satir.map(function(r){return{id:r.id,tur:r.k.tur,ad:r.ad,birim:r.birim=='gram'?'gr':'adet',miktar:r.miktar,tarih:r.k.tarih||'',alis:r2(r.alis),not:String(r.k.not||'').slice(0,80),deger:r2(r.deger),kar:r2(r.kar),gunluk:r2(r.gunluk),gram:r.gram,gramStd:r.gramStd?1:0,ayar:r.ayar,has:r.has}});
 var top={};['deger','bozdur','alis','karDeger','kar','karP','gunluk','gunlukP','gram','adet','eksik','gramTop','has','gramStd'].forEach(function(k){top[k]=T[k]==null?null:k=='gram'||k=='gramTop'||k=='has'?Math.round(T[k]*1000)/1000:r2(T[k])});
 return{fiyat:fy,kalem:kalem,top:top,ag:OVT.ag(T)}};
// Alım gücü: masaüstündeki AH.alimGucu sonucunun özeti; veri yoksa null (telefon "masaüstünde henüz alınmadı" yazar)
OVT.ag=function(T){var ag=AH._ag;if(!ag)return null;var A=AH.alimGucu(T,ag),t=A.top,uy=[];
 if(!ag.tufe||!A.guncel)uy.push(ag.tufe?'TÜFE güncel değil; reel getiri gösterilmiyor.':'TÜFE alınamadı; reel getiri gösterilmiyor.');if(!ag.bugun)uy.push('Kur alınamadı; dolar/euro karşılaştırması yok.');
 var satir=A.satir.filter(function(o){return o.nominal!=null}).map(function(o){var x={id:o.id,nominal:o.nominal};
  if(o.enf!=null){x.enf=o.enf;x.reel=o.reel}else x.tufeNeden=o.tufeNeden||'';if(o.usd!=null){x.usd=o.usd;if(o.eur!=null)x.eur=o.eur}else x.kurNeden=o.kurNeden||'';
  if(o.asAlis!=null){x.asAlis=o.asAlis;x.asBugun=o.asBugun}else x.asNeden=o.asNeden||'';return x});
 return{guncel:A.guncel?1:0,tufeSon:ag.tufeSon||'',kurTarih:ag.bugun&&ag.bugun.d||'',uyari:uy.join(' '),satir:satir,
  top:{n:t.n,alis:t.alis,deger:t.deger,nominal:t.nominal==null?null:t.nominal,reel:t.reel!=null&&A.guncel?t.reel:null,usd:t.usdTam&&t.n?t.usd:null,eur:t.eurTam&&t.n?t.eur:null}}};

// ---------- FuzulEv ----------
OVT.fuzulev=function(){if(typeof FE=='undefined')return null;var f=FE.st();if(!f.taksit.length&&!Object.keys(f.soz).length)return null;var b=FE.bugun(),H=FE.hesap(b),soz={};
 OVT.SOZ.forEach(function(k){if(f.soz[k]!=null&&f.soz[k]!=='')soz[k]=f.soz[k]});
 var kis=function(r){return{no:r.t.no,tur:r.t.tur,vade:r.t.vade||'',tutar:r2(r.tutar),kalan:r2(r.kalan)}};
 var ozet={};['say','odenenSay','odenen','odenenEksik','kalan','kalanEksik','kalanSay','toplam','toplamEksik','ilerleme'].forEach(function(k){ozet[k]=H[k]});
 return{soz:soz,bugun:b,ozet:ozet,
  sonraki:H.sonraki?Object.assign(kis(H.sonraki),{gun:H.sonraki.kalanGun}):null,
  geciken:H.geciken.map(function(r){return Object.assign(kis(r),{gun:r.gecikme})}),
  teslim:H.teslim?{no:H.teslim.r.t.no,vade:H.teslim.r.t.vade||'',taksit:H.teslim.taksit,gun:H.teslim.gun,tamam:H.teslim.tamam?1:0}:null,
  son:H.son?{no:H.son.t.no,vade:H.son.t.vade||''}:null,
  taksit:H.satir.map(function(r){return[r.t.no,r.t.tur,r.t.vade||'',r2(r.tutar),r2(r.odenen),r2(r.kalan),r.durum,r.gecikme||0,r.t.odemeTarih||'']})}};

// ---------- Özet: yalnız Çağlar'ın telefonu ----------
var _ovtOz=bulutOzet;bulutOzet=function(){var oz=_ovtOz();try{OVT.tazele();oz.aile=oz.aile||OT9.aile();var al=OVT.altin(),fe=OVT.fuzulev();
 if(al)oz.aile.altin=al;else delete oz.aile.altin;if(fe)oz.aile.fuzulev=fe;else delete oz.aile.fuzulev}catch(e){if(window.console)console.warn('[telefon] altın/FuzulEv özeti',e)}return oz};
// Eşin özeti: güvence olarak iki blok da silinir (OT9.aile zaten içermez)
if(typeof OAI!='undefined'&&OAI.esOzet){var _ovtEs=OAI.esOzet;OAI.esOzet=function(){var o=_ovtEs.apply(this,arguments);if(o&&o.aile){delete o.aile.altin;delete o.aile.fuzulev}return o}}
})();
