// ========================================================================
// Orvane 0.9.1 · Aile paylaşımı (eşin telefonu).
// Bütçe modeli (masaüstündeki Cep harçlığı ile aynı): gelirler ortak bütçeye girer; market, ev, fatura gibi giderler ORTAK
// bütçeden; kişisel harcamalar herkesin kendi CEP HARÇLIĞINDAN (S.finans.kayit hk:'c' Çağlar, hk:'e' eşi) düşer.
// • Ortak blok (oz.aile.ortak): 6 aylık gelir/gider, bu ay kasa dağılımı (ortak / Çağlar cep / eş cep), cep harçlığı durumu,
//   kategori, son hareketler, bekleyen ödemeler, aile takvimi + hastane randevuları (S.orvA.takvim), özel günler (S.orvA.ozel),
//   Çağlar'ın izin günleri. Hem Çağlar'ın özetine hem eşin özetine gider.
// • Eşin özeti Supabase orvane_aile tablosuna yayınlanır; okuma izni yalnız Ayarlar › Telefon'daki e-postaya verilir (RLS).
// • Eşin telefonu yalnız ES_TUR olaylarını yazabilir. Eşin eklediği ilaç / etkinlik / özel gün "kubra" olarak işaretlenir;
//   eş yalnız kendi eklediklerini değiştirir/siler. Çağlar'ın iş kayıtlarını, izinlerini, ilaçlarını eş değiştiremez.
// Telefondaki karşılığı: mobil/src/lib/ekip.ts → uygula(), mobil/src/lib/senk.ts (rol: 'es').
// ========================================================================
var OAI={ES:'kubra',BEN:'cagla',AD:{cagla:'Çağlar',kubra:'Kübra'},
 ES_TUR:{es_harcama:1,es_gelir:1,es_cep_iste:1,es_ilac_kaydet:1,es_ilac_sil:1,es_ilac_al:1,etkinlik:1,etkinlik_sil:1,ozel_gun:1,ozel_gun_sil:1},
 ORTAK_KAT:['Market','Ev','Fatura','Çocuk','Sağlık','Ulaşım','Diğer']};
OAI.st=function(){var a=OA.st();a.takvim=a.takvim||[];a.ozel=a.ozel||[];return a};
OAI.ayar=function(){var b=BLS();b.aile=b.aile||{eposta:'',sira:0,yayin:'',hata:''};return b.aile};
OAI.tarihOk=function(t){return /^\d{4}-\d{2}-\d{2}$/.test(t||'')&&!isNaN(new Date(t+'T12:00'))};
OAI.metin=function(x,n){return String(x==null?'':x).replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n)};
OAI.tutar=function(x){var t=Math.round((+String(x==null?'':x).replace(',','.')||0)*100)/100;return t>0&&t<=1e7?t:0};

// ---------- Ortak blok ----------
OAI.ortak=function(){var a=OAI.st(),F=OA.fin(),f=F.f,bugun=OT9.pad(new Date()),ay=bugun.slice(0,7),son35=OT9.pad(new Date(Date.now()-35*864e5));
 var kisisel=f.kayit.filter(function(k){return k.kim!='sirket'});
 // 6 ay gelir / gider (kişisel + ortak; Şirket hariç)
 var trend=F.A.map(function(m){var g=0,c=0;kisisel.forEach(function(k){if(String(k.tarih||'').slice(0,7)!=m)return;if(k.tur=='gelir')g+=+k.tutar||0;else c+=+k.tutar||0});return[m,g,c]});
 // Bu ay kasa dağılımı ve ortak kategori
 var kasa={ortak:0,c:0,e:0},kat={};
 kisisel.forEach(function(k){if(k.tur=='gelir'||String(k.tarih||'').slice(0,7)!=ay)return;var t=+k.tutar||0;if(k.hk=='c'||k.hk=='e')kasa[k.hk]+=t;else{kasa.ortak+=t;kat[k.kalem||'Diğer']=(kat[k.kalem||'Diğer']||0)+t}});
 var cp={};try{var C=OA.cep(F);['c','e'].forEach(function(k){var x=C[k];cp[k]={oran:x.oran,har:x.har==null?null:Math.round(x.har),harcanan:Math.round(x.harcanan),kal:x.kal==null?null:Math.round(x.kal),gunluk:x.limit==null?null:Math.round(x.limit)}});cp.kalanGun=C.kalanGun;cp.bek=Math.round(C.bek||0);cp.mod=a.cep&&a.cep.mod=='bakiye'?'bakiye':'yuzde'}catch(e){}
 var hareket=kisisel.filter(function(k){return (k.tarih||'')>=son35}).sort(function(x,y){return x.tarih<y.tarih?1:x.tarih>y.tarih?-1:(y.ts||0)-(x.ts||0)}).slice(0,40)
  .map(function(k){return[k.tarih,k.tur=='gelir'?1:0,OAI.metin(k.kalem||'Diğer',30),OAI.metin(k.not,40),+k.tutar||0,k.hk=='c'?'c':k.hk=='e'?'e':'o',/^es-/.test(k.kaynak||'')?'kubra':'cagla']});
 var izin={},d=new Date();d.setDate(d.getDate()-30);for(var i=0;i<150;i++){var gk=key(d);if(D[gk])izin[gk]=D[gk];d.setDate(d.getDate()+1)}
 var bas=OT9.pad(new Date(Date.now()-30*864e5));
 // 0.9.17: Aile Bütçesi güncel bakiyesi (masaüstü "Aile Bütçesi · güncel bakiye" ile aynı değer). Telefon "Kalan"ı bundan gösterir;
 // önceden yalnız bu ayın gelir − gideri gidiyordu, devreden / bildirilen bakiye telefonda yoktu.
 var ab=null;try{var B=(OA.st().bak||{}).aile;if(B&&isFinite(+B.t))ab={t:Math.round((+B.t)*100)/100,ts:+B.ts||0}}catch(e){}
 return{ad:OAI.AD,trend:trend,kasa:kasa,kat:kat,cep:cp,hareket:hareket,aile:ab,
  odeme:(a.odeme||[]).filter(function(o){return !o.odendi}).map(function(o){return{ad:OAI.metin(o.ad,40),tutar:+o.tutar||0,tarih:o.tarih||''}}).sort(function(x,y){return x.tarih<y.tarih?-1:1}).slice(0,12),
  takvim:a.takvim.filter(function(t){return t.tarih>=bas}).sort(function(x,y){return (x.tarih+(x.saat||''))<(y.tarih+(y.saat||''))?-1:1}).slice(0,80),
  ozel:a.ozel.slice(0,60),izin:izin}};

// Çağlar'ın kendi özetine ortak blok eklenir
var _oaiOz=bulutOzet;bulutOzet=function(){var oz=_oaiOz();try{oz.aile=oz.aile||OT9.aile();oz.aile.ortak=OAI.ortak()}catch(e){if(window.console)console.warn('[aile] ortak blok',e)}return oz};
// Eşin özeti: iş kayıtları, ekip, görev, sohbet YOK. Bütçe, sağlık (iki kişinin ilaçları) ve ortak blok var.
// 0.9.9: Çağlar'ın ilaçları ve alındı işaretleri eşin telefonuna hiç gönderilmez; eş yalnız kendi ilaçlarını görür (kullanıcı isteği).
OAI.esOzet=function(){var al=OT9.aile();delete al.spor;al.ortak=OAI.ortak();al.ilac=(al.ilac||[]).filter(function(i){return i.kim==OAI.ES});var idler={};al.ilac.forEach(function(i){idler[i.id]=1});var al2={};Object.keys(al.al||{}).forEach(function(k){if(idler[k.slice(11)])al2[k]=1});al.al=al2;return{v:1,rol:'es',olaySira:OAI.ayar().sira||0,bugun:TODAY,aile:al}};

// ---------- Olaylar ----------
// kaynak 'es': eşin telefonu (yalnız ES_TUR; kayıtlar 'kubra'); kaynak 'ben': Çağlar'ın telefonu
OAI.uygula=function(e,kaynak){var v=e.veri||{},a=OAI.st(),es=kaynak=='es',kim=es?OAI.ES:OAI.BEN;
 if(es&&!OAI.ES_TUR[e.tur])return false;
 if(e.tur=='etkinlik'){if(!v.id||!OAI.tarihOk(v.tarih)||!OAI.metin(v.ad,1))return false;var m=a.takvim.filter(function(x){return x.id==v.id})[0];
  if(m&&es&&m.kim!=OAI.ES)return false;
  var o={ad:OAI.metin(v.ad,60),tarih:v.tarih,saat:/^\d{1,2}:\d{2}$/.test(v.saat||'')?v.saat:'',tur:v.tur=='randevu'?'randevu':'etkinlik',yer:OAI.metin(v.yer,60),not:OAI.metin(v.not,80),kisi:v.kisi=='cagla'||v.kisi=='kubra'||v.kisi=='aile'?v.kisi:kim};
  if(m)Object.assign(m,o);else{o.id=String(v.id).slice(0,40);o.kim=kim;o.ts=e.ts||Date.now();a.takvim.push(o)}
  if(a.takvim.length>300)a.takvim.splice(0,a.takvim.length-300);OA.kaydet();return true}
 if(e.tur=='etkinlik_sil'){var n0=a.takvim.length;a.takvim=a.takvim.filter(function(x){return x.id!=v.id||(es&&x.kim!=OAI.ES)});OA.kaydet();return a.takvim.length<n0}
 if(e.tur=='ozel_gun'){if(!v.id||!OAI.tarihOk(v.tarih)||!OAI.metin(v.ad,1))return false;var z=a.ozel.filter(function(x){return x.id==v.id})[0];
  if(z&&es&&z.kim!=OAI.ES)return false;
  var p={ad:OAI.metin(v.ad,50),tarih:v.tarih,tur:['dogum','yildonumu','diger'].indexOf(v.tur)>=0?v.tur:'diger'};
  // 0.9.9: kimin günü (cagla|kubra); telefon bakana göre "Doğum günüm" / "Eşimin doğum günü" yazar
  if(['cagla','kubra'].indexOf(v.kisi)>=0)p.kisi=v.kisi;else if(z)delete z.kisi;
  if(z)Object.assign(z,p);else{p.id=String(v.id).slice(0,40);p.kim=kim;a.ozel.push(p)}
  if(a.ozel.length>100)a.ozel.splice(0,a.ozel.length-100);OA.kaydet();return true}
 if(e.tur=='ozel_gun_sil'){var n1=a.ozel.length;a.ozel=a.ozel.filter(function(x){return x.id!=v.id||(es&&x.kim!=OAI.ES)});OA.kaydet();return a.ozel.length<n1}
 // Harcama: kasa 'cep' → harcayanın cep harçlığından (hk e/c), 'ortak' → ortak bütçeden (kategori: Market, Ev…)
 // 0.9.11: eş cep harçlığı ister → doğrudan Kübra'nın cep bakiyesine (Aile Bütçesi ve gelir değişmez)
 if(e.tur=='es_cep_iste'){var tc=OAI.tutar(v.tutar);if(!tc||typeof OA=='undefined'||!OA.cepIste)return false;return !!OA.cepIste('e',tc,'Kübra telefondan istedi',e.id)}
 if(e.tur=='es_harcama'||e.tur=='es_gelir'){var t=OAI.tutar(v.tutar);if(!t)return false;var gelir=e.tur=='es_gelir',cep=!gelir&&v.kasa=='cep';
  var kat=gelir?(OAI.metin(v.kat,30)||'Gelir'):cep?'Cep harçlığı · Eşi':(OAI.ORTAK_KAT.indexOf(v.kat)>=0?v.kat:'Diğer');
  var r=fnKaydet({tur:gelir?'gelir':'gider',kim:'cagla',tutar:t,kalem:kat,tarih:OAI.tarihOk(v.tarih)?v.tarih:OT9.pad(new Date(e.ts||Date.now())),not:OAI.metin(v.ad,60),kaynak:'es-telefon'},'fn'+e.id);
  if(r&&cep)r.hk='e';
  // 0.9.7: Kübra'nın cep harçlığı %0 iken bütün harcamaları Aile Bütçesinden düşer
  // 0.9.10: Aile Bütçesi toplam kasa: eşin cep harcaması kendi bakiyesinden ve Aile Bütçesinden, ortak harcama/gelir Aile Bütçesinden işlenir
  if(r&&typeof OA!='undefined'&&OA.bakIsle){var hk2=cep&&!OA.aileden('e')?'kubra':OA.st().bak.aile?'aile':null;if(hk2&&OA.bakIsle(hk2,gelir?t:-t).length)r.bakDus=hk2}
  if(r)save();return !!r}
 if(e.tur=='es_ilac_kaydet'){if(!v.id||!OAI.metin(v.ad,1))return false;var il=(a.ilac||[]).filter(function(x){return x.id==v.id})[0];if(il&&il.kim!=OAI.ES)return false;
  var o2={ad:OAI.metin(v.ad,40),miktar:OAI.metin(v.miktar,40),saat:/^\d{1,2}:\d{2}$/.test(v.saat||'')?v.saat:'08:00',tekrar:['gun','haftaici','haftasonu'].indexOf(v.tekrar)>=0?v.tekrar:'gun',actok:['ac','tok'].indexOf(v.actok)>=0?v.actok:'',not:OAI.metin(v.not,80)};
  if(v.stok!=null&&v.stok!==''){o2.stok=Math.max(0,Math.round(+v.stok)||0);o2.stokTs=e.ts||Date.now()}
  if(il)Object.assign(il,o2);else{o2.id=String(v.id).slice(0,40);o2.kim=OAI.ES;o2.eklendi=e.ts||Date.now();a.ilac.push(o2)}OA.kaydet();return true}
 if(e.tur=='es_ilac_sil'){var n2=a.ilac.length;a.ilac=a.ilac.filter(function(x){return x.id!=v.id||x.kim!=OAI.ES});OA.kaydet();return a.ilac.length<n2}
 if(e.tur=='es_ilac_al'){if(!/^\d{4}-\d{2}-\d{2}$/.test(v.k||''))return false;var hed=(a.ilac||[]).filter(function(x){return x.id==v.id})[0];if(!hed||hed.kim!=OAI.ES)return false;
  var ak=v.k+'|'+v.id;if(v.al)a.ilacAl[ak]=a.ilacAl[ak]||e.ts||Date.now();else delete a.ilacAl[ak];OA.kaydet();return true}
 return false};
// Çağlar'ın telefonu: takvim / özel gün; finans_kayit'te kasa 'cep' ise Çağlar'ın cep harçlığına (hk:'c') yazılır
var _oaiBu=bulutUygula;bulutUygula=function(e){
 if(/^(etkinlik|etkinlik_sil|ozel_gun|ozel_gun_sil)$/.test(e.tur)){OAI.uygula(e,'ben');return}
 if(e.tur=='cep_iste'){var tc=OAI.tutar((e.veri||{}).tutar);if(tc&&typeof OA!='undefined'&&OA.cepIste)OA.cepIste('c',tc,'Çağlar telefondan istedi',e.id);return}
 var r=_oaiBu(e);if(e.tur=='finans_kayit'&&e.veri&&e.veri.hk=='c'){var k=(fnS().kayit||[]).filter(function(x){return x.id==e.id})[0];if(k&&k.tur=='gider'&&!k.bakDus){k.hk='c';if(OA.bakIsle&&OA.bakIsle('cagla',-(+k.tutar||0)).length)k.bakDus=1;save()}}return r};

// ---------- Eşitleme: eşin özeti + eşin olayları ----------
OAI.tick=function(){var A=OAI.ayar();if(!A.eposta||!API||!API.bulut||!API.bulut.aileYayin||(INFO&&INFO.smoke))return Promise.resolve();
 var gelen=0;
 return call(API.bulut.ailePull(A.sira||0)).then(function(rows){(rows||[]).forEach(function(r){try{if(OAI.uygula({id:r.id,tur:r.tur,veri:r.veri,ts:Date.parse(r.ts)},'es'))gelen++}catch(e){if(window.console)console.warn('[aile] olay',r.tur,e)}A.sira=Math.max(A.sira||0,+r.sira||0)});
  if(gelen){toast(gelen+' işlem eşinin telefonundan geldi');try{if(typeof ORV!='undefined'&&ORV.yenile)ORV.yenile()}catch(e){}}
  var oz=OAI.esOzet(),k=JSON.stringify(oz)+'|'+A.eposta;if(k==A.yayin)return;
  return call(API.bulut.aileYayin({veri:Object.assign(oz,{ts:Date.now()}),uyeler:[A.eposta]})).then(function(){A.yayin=k})})
 .then(function(){if(A.hata){A.hata='';save()}else if(gelen)save()},function(e){A.hata=String(e&&e.message||e);if(/does not exist|orvane_aile/i.test(A.hata))A.hata='Supabase’de aile tabloları yok: güncel orvane.sql’i SQL Editor’da çalıştır'})};
var _oaiTick=bulutTick;bulutTick=function(z){var p=_oaiTick(z);return Promise.resolve(p).then(function(){if(BL.st&&BL.st.eposta&&navigator.onLine)return OAI.tick()})};

// ---------- Ayarlar › Telefon: aile paylaşımı kartı ----------
OAI.kaydetEposta=function(){var el=document.getElementById('aiE'),v=(el&&el.value||'').trim().toLowerCase(),A=OAI.ayar();
 if(v&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){toast('Geçerli bir e-posta yaz');return}
 if(v&&BL.st&&BL.st.eposta&&v==String(BL.st.eposta).toLowerCase()){toast('Bu senin hesabın; eşinin e-postasını yaz');return}
 A.eposta=v;A.yayin='';save();toast(v?'Aile paylaşımı açıldı':'Aile paylaşımı kapatıldı');if(v)OAI.tick().then(function(){render()});else render()};
var _oaiTel=P.telefon;P.telefon=function(){var h=_oaiTel(),A=OAI.ayar();
 var kart='<div class="card"><div class="ch"><i class="ti ti-users"></i>Aile paylaşımı (eşinin telefonu)</div>'+
 '<div class="hn" style="margin-bottom:8px">Eşin Orvane Mobil’i kurup <b>kendi e-postasıyla</b> hesap açar; buraya o e-postayı yaz. Eşin ortak bütçeyi ve grafikleri, izin günlerini, aile takvimini ve özel günleri <b>görür</b>. '+
 'Kendi harcamasını (cep harçlığından ya da market/ev için ortak bütçeden), kendi ilaçlarını, hastane randevularını, takvim etkinliklerini ve özel günleri ekler. Senin ilaçlarını <b>görmez</b>; iş kayıtlarını ve izinlerini <b>değiştiremez</b>.</div>'+
 '<input id="aiE" type="email" placeholder="esinin@eposta.com" class="ti2" value="'+esc(A.eposta||'')+'" style="width:100%;box-sizing:border-box">'+
 '<div style="display:flex;gap:8px;margin-top:8px"><button class="bt p" onclick="OAI.kaydetEposta()">Kaydet</button>'+(A.eposta?'<button class="bt" onclick="document.getElementById(\'aiE\').value=\'\';OAI.kaydetEposta()">Paylaşımı kapat</button>':'')+'</div>'+
 (A.hata?'<div class="kr"><span style="color:#f1c88a">'+esc(A.hata)+'</span></div>':A.eposta?'<div class="kr"><span>Durum</span><span class="hn">'+(A.yayin?'yayında':'ilk eşitleme bekleniyor')+'</span></div>':'')+
 '<div class="hn" style="margin-top:8px">İlk kurulumda Supabase SQL Editor’da güncel <code>supabase/orvane.sql</code> bir kez çalıştırılmalı (aile tabloları).</div></div>';
 return h.replace(/<div class="ft">/,kart+'<div class="ft">')};
