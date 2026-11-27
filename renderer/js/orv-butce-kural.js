// ========================================================================
// Orvane 0.9.12 · Aile Bütçesi kural katmanı (orv-butce.js'ten sonra yüklenir).
// Var olan işlevler sarmalanır; hiçbir eski özellik silinmez. Kurallar KARARLAR.md › 6:
//  • Aylık gelir ≤ Net Ödenen + SGK Rapor Ödeneği (maaş ertesi ayın 5'inde yatar: A ayının sınırı A−1 bordrosundan).
//    Elle girilen gelir (Aylık Bütçe, Gelir/gider ekle) sınırı aşıyorsa kaydedilmez. Maaş avansı ve BES çıkışı gelirdir, sınır dışıdır.
//  • Kayıt dışı GELİR olamaz (kullanıcı kararı 2026-11-27): gelir bellidir. Bildirilen bakiye beklenenden fazlaysa hesap hatasıdır; bildirim kaydedilmez.
//  • Ay devri: BKD.DEVIR (2026-11) ve sonrasında ayın kalanı sonraki aya devreder; net 0 dengesi yalnız önceki (banka dökümüyle kapanmış) aylarda.
//    (eski not) Bakiye bildiriminin "Kayıt dışı gelir"i
//    mevcut kuraldır, engellenmez; sınırı aşarsa Dashboard ve denetim uyarır.
//  • Her yeni kişisel kayıt (Gelir/gider ekle, Kübra harcaması, beklenen ödeme ödendi, Çağlar'ın telefonu) girildiği anda kasasına
//    işlenir (bakDus). Silinince etkisi geri alınır. Böylece Aile Bütçesi = iki cep + kalan her an doğru kalır.
//  • İçe aktarılan banka kayıtları ve geçmiş ay kayıtları bakiye bildiriminde sayılmaz (bakiye anlık durumdur; geçmiş ay net 0).
//  • Kapanmış geçmiş ay (net 0) için ekle/düzelt/sil: bakiye değişmez, ayın Kayıt dışı harcaması farkı karşılar (net 0 kalır).
// ========================================================================
var BKR=window.BKR||{};
(function(){
var r2=function(n){return Math.round((+n||0)*100)/100};
var ayK=function(t){return String(t||'').slice(0,7)};
var tl=function(n){return (Math.round((+n||0)*100)/100).toLocaleString('tr-TR',{maximumFractionDigits:2})};
var isr=function(r){return r.tur=='gelir'?1:-1};
BKR.st=function(){return {finans:typeof fnS=='function'?fnS():{kayit:[]},orvA:OA.st(),bordro:typeof BR!='undefined'&&BR.st?BR.st():{aylar:[]}}};

// ---------- 1) Gelir üst sınırı ----------
BKR.sinir=function(ay){return BKD.sinir(BKR.st(),ay)};
BKR.gelir=function(ay,haric){return r2(GG.kayitlar().filter(function(k){return k.tur=='gelir'&&ayK(k.tarih)==ay&&k.id!=haric&&!BKD.sinirDisi(k)}).reduce(function(n,k){return n+(+k.tutar||0)},0))};
// ek: eklenecek gelir; haric: düzenlenen kaydın kimliği (eski tutarı sayılmaz)
BKR.gelirOk=function(ay,ek,haric,kalem){var s=BKR.sinir(ay);if(!s||BKD.sinirDisiKalem(kalem))return{ok:true,s:s};var g=r2(BKR.gelir(ay,haric)+(+ek||0));return{ok:g<=s.sinir+0.005,gelir:g,s:s,asim:r2(g-s.sinir)}};
BKR.asimYazi=function(c){return 'Aylık gelir Bordro sınırını geçemez: '+GG.ayAd(c.s.ay)+' sınırı '+tl(c.s.sinir)+' ₺ (Net Ödenen '+tl(c.s.net)+(c.s.sgk?' + SGK ödeneği '+tl(c.s.sgk):'')+'). Bu kayıtla '+tl(c.gelir)+' ₺ olurdu.'};

// ---------- 2) Kapanmış geçmiş ay ve net 0 dengesi ----------
BKR.ayNet=function(ay,haric){return r2(GG.kayitlar().filter(function(k){return ayK(k.tarih)==ay&&k.id!=haric}).reduce(function(n,k){return n+isr(k)*(+k.tutar||0)},0))};
// Kapalı ay: içinde bulunulan aydan önce, en az bir kaydı olan ve net 0 olan ay (banka dökümüyle eşitlenmiş)
BKR.kapali=function(ay,haric){return /^\d{4}-\d{2}$/.test(ay||'')&&ay<GG.buAy()&&ay<BKD.DEVIR&&GG.kayitlar().some(function(k){return ayK(k.tarih)==ay&&k.id!=haric})&&Math.abs(BKR.ayNet(ay,haric))<0.01};
// dNet: ayın (gelir − gider) değişimi. Kayıt dışı harcama dNet kadar artar/azalır; karşılanamayan kısım döner (0 = net 0 korundu).
BKR.dengele=function(ay,dNet){dNet=r2(dNet);if(!dNet)return 0;var L=GG.kayitlar().filter(function(k){return ayK(k.tarih)==ay&&GG.kd(k)}).sort(function(x,y){return (+y.tutar||0)-(+x.tutar||0)});
 if(dNet>0){if(L.length){L[0].tutar=r2((+L[0].tutar||0)+dNet);return 0}
  var son=ay+'-'+String(new Date(+ay.slice(0,4),+ay.slice(5,7),0).getDate()).padStart(2,'0'),k=fnKaydet({tur:'gider',kim:'cagla',tutar:String(dNet),kalem:GG.KD,tarih:son,not:'Geçmiş ay net 0 dengesi',kaynak:'bakiye'});
  if(k){k.kd='aile';k.bakEk='gecmis';return 0}return dNet}
 var kal=-dNet;L.forEach(function(k){if(kal<=0)return;var t=+k.tutar||0,d=Math.min(t,kal);kal=r2(kal-d);if(r2(t-d)<0.01)fnS().kayit=fnS().kayit.filter(function(x){return x.id!=k.id});else k.tutar=r2(t-d)});
 return kal>0?-kal:0};

// ---------- 3) Yeni kaydı kasasına işleme ----------
// Döner: işlenen kasa | 'gecmis' | null. Şirket, kayıt dışı, zaten işlenmiş ve içe aktarılmış kayıtlara dokunmaz.
BKR.isle=function(r){if(!r||r.kim=='sirket'||r.bakDus||r.bakEk||GG.kdHer(r))return null;var ay=ayK(r.tarih);
 if(BKR.kapali(ay,r.id)){r.bakEk='gecmis';var kal=BKR.dengele(ay,isr(r)*(+r.tutar||0));if(kal)toast('Uyarı: '+GG.ayAd(ay)+' net 0 tutturulamadı ('+tl(kal)+' ₺)');return 'gecmis'}
 var k=OA.kayitKasa(r);if(k&&OA.bakIsle(k,isr(r)*(+r.tutar||0)).length){r.bakDus=k;return k}return null};
var idler=function(){var o={};(typeof fnS=='function'?fnS().kayit:[]).forEach(function(x){o[x.id]=1});return o};
var yeniler=function(once){return fnS().kayit.filter(function(x){return !once[x.id]})};

// Bakiye bildiriminde sayılmayanlar: içe aktarılan banka kayıtları (bakiye anlık durumdur) ve geçmiş ay kayıtları (kapanmış, net 0)
var _kk=OA.kayitKasa;OA.kayitKasa=function(r){if(r&&(r.kaynak=='banka'||(/^\d{4}-\d{2}/.test(r.tarih||'')&&ayK(r.tarih)<GG.buAy()&&ayK(r.tarih)<BKD.DEVIR)))return null;return _kk(r)};

// ---------- Sarmalanan giriş noktaları ----------
// Aylık Bütçe › ekle / düzelt / sil
var _ekle=GG.ekle;GG.ekle=function(o){var t=GG.tutarOku(o&&o.tutar),ay=/^\d{4}-\d{2}-\d{2}$/.test(o&&o.tarih||'')?ayK(o.tarih):GG.buAy();
 if(t&&o.tur=='gelir'){var c=BKR.gelirOk(ay,t,null,o.kalem);if(!c.ok){toast(BKR.asimYazi(c));return null}}
 var kap=BKR.kapali(ay),r=_ekle(o);if(!r||!kap)return r;
 if(r.bakDus){OA.bakIsle(r.bakDus,-isr(r)*r.tutar);delete r.bakDus}r.bakEk='gecmis';BKR.dengele(ay,isr(r)*r.tutar);save();return r};
var _guncelle=GG.guncelle;GG.guncelle=function(id,o){var r=GG.bul(id);if(!r||GG.kilit(r)||GG.kdHer(r))return _guncelle(id,o);
 var t=GG.tutarOku(o&&o.tutar),ay1=/^\d{4}-\d{2}-\d{2}$/.test(o&&o.tarih||'')?ayK(o.tarih):ayK(r.tarih),ay0=ayK(r.tarih);
 if(t&&o.tur=='gelir'){var c=BKR.gelirOk(ay1,t,id,o.kalem);if(!c.ok){toast(BKR.asimYazi(c));return null}}
 var kap0=BKR.kapali(ay0),kap1=ay1==ay0?kap0:BKR.kapali(ay1),e0=isr(r)*(+r.tutar||0);if(!kap0&&!kap1)return _guncelle(id,o);
 // Kapanmış ay: bakiye değişmez; işaretler geçici kaldırılır, sonra ay(lar)ın kayıt dışı harcaması farkı karşılar
 var bd=r.bakDus,be=r.bakEk;delete r.bakDus;delete r.bakEk;var y=_guncelle(id,o);
 if(!y){if(bd)r.bakDus=bd;if(be)r.bakEk=be;return y}
 if(kap0)BKR.dengele(ay0,-e0);if(kap1){BKR.dengele(ay1,isr(y)*(+y.tutar||0));y.bakEk='gecmis'}else if(bd){y.bakDus=bd}else if(be)y.bakEk=be;save();return y};
var _sil=GG.silKayit;GG.silKayit=function(id){var r=GG.bul(id);if(!r||GG.kilit(r)||GG.kdHer(r))return _sil(id);var ay=ayK(r.tarih);if(!BKR.kapali(ay))return _sil(id);
 var e=isr(r)*(+r.tutar||0);delete r.bakDus;delete r.bakEk;var ok=_sil(id);if(ok){BKR.dengele(ay,-e);save()}return ok};

// Ailem › Bütçe ve Şirketim › "Gelir / gider ekle" penceresi: kişisel kayıt kasasına işlenir; gelir sınırı denetlenir
if(typeof fnKaydetDlg=='function'){var _fkd=fnKaydetDlg;fnKaydetDlg=function(){var g=function(id){var e=document.getElementById(id);return e?e.value:''},tr=document.querySelector('input[name=fnt]:checked'),tur=tr?tr.value:'gider',kim=g('fnk');
 if(kim!='sirket'&&tur=='gelir'){var tarih=/^\d{4}-\d{2}-\d{2}$/.test(g('fnd'))?g('fnd'):OA.bugunKey(),t=GG.tutarOku(g('fnu')),c=t?BKR.gelirOk(ayK(tarih),t,null,g('fnl')):{ok:true};if(!c.ok){toast(BKR.asimYazi(c));return}}
 var once=idler();_fkd();var y=yeniler(once);if(y.length){y.forEach(BKR.isle);save()}}}
// Kayıt silme (Şirketim listesi): bakiyeye işlenmiş etkisi geri alınır; bordro maaşı silinirse bordro bağlantısı da kalkar
BKR.silHer=function(id){var r=GG.bul(id);if(!r)return false;
 if(GG.kilit(r)){var m=typeof BR!='undefined'?(BR.st().aylar||[]).filter(function(x){return x.butce&&x.butce.id==id})[0]:null;
  if(m&&m.butce.bak&&OA.KASA_AD[m.butce.k])OA.bakIsle(m.butce.k,-(+m.butce.t||0)).length;if(m)delete m.butce;fnS().kayit=fnS().kayit.filter(function(x){return x.id!=id});save();return true}
 return GG.silKayit(id)};
if(typeof fnSil=='function')fnSil=function(id){confirmBox('Bu kayıt silinsin mi?',function(){BKR.silHer(id);render()},'Sil')};

// Ailem › Bütçe › Kübra harcaması: artık gelir/gider kaydı da olur (aylık gider, cep kullanımı, Aylık Bütçe görür); bakiye bir kez düşer
OA.kubraKaydet=function(){var t=r2(+String(document.getElementById('oaKt').value).replace(',','.')||0),n=document.getElementById('oaKa').value.trim()||'Harcama';if(!(t>0)){toast('Tutarı yaz');return}
 var ail=OA.aileden('e'),r=fnKaydet({tur:'gider',kim:'cagla',tutar:String(t),kalem:ail?'Aile Bütçesi · Kübra':'Cep harçlığı · Eşi',not:n.slice(0,60),kaynak:'masaustu'});if(!r)return;r.hk='e';r.kisi='kubra';
 var k=ail?'aile':'kubra',L=OA.bakIsle(k,-t);if(L.length)r.bakDus=k;OA.kaydet();OA.dlgKapat();
 toast('Kübra harcaması kaydedildi'+(L.length?' · '+L.map(function(x){return OA.KASA_AD[x]}).join(' ve ')+' bakiyesinden düşüldü':' (bakiye bildirilmedi)'));ORV.yenile()};
// Beklenen ödeme "ödendi": gider kaydı Aile Bütçesinden düşer (önceden yalnız kayıt olurdu; ödedikten sonra "kalan" yükseliyordu)
OA.odendi=function(id){var o=OA.st().odeme.filter(function(x){return x.id==id})[0];if(!o||o.odendi)return;var r=typeof fnKaydet=='function'?fnKaydet({tur:'gider',kim:'cagla',tutar:o.tutar,kalem:o.ad,tarih:OA.bugunKey(),not:'Beklenen ödeme'}):null;
 o.odendi=true;var k=r?BKR.isle(r):null;OA.kaydet();toast(o.ad+' ödendi olarak işaretlendi · gidere yazıldı'+(k&&k!='gecmis'?' · '+OA.KASA_AD[k]+' bakiyesinden düşüldü':''));ORV.yenile()};
// Cep harcaması: hangi kasaya işlendiği kayda yazılır (önceden yalnız 1 yazılıyordu; Kübra %0 ayarı sonradan değişince düzeltme yanlış kasaya giderdi)
if(OA.harcamaKaydet){var _hk=OA.harcamaKaydet;OA.harcamaKaydet=function(k){var kasa=OA.aileden(k)?'aile':k=='c'?'cagla':'kubra',once=idler();_hk(k);yeniler(once).forEach(function(r){if(r.bakDus===1||r.bakDus===true)r.bakDus=kasa});save()}}
// Çağlar'ın telefonundan gelen kişisel kayıt bir kez işlenir (aynı olay iki kez gelirse fnKaydet zaten reddeder)
if(typeof bulutUygula=='function'){var _bu=bulutUygula;bulutUygula=function(e){var yeni=e&&e.tur=='finans_kayit'&&!GG.bul(e.id),r=_bu(e);
 if(yeni){var k=GG.bul(e.id);if(k&&!k.bakDus&&!k.bakEk){if(e.veri&&e.veri.hk=='c'&&k.tur=='gider')k.hk='c';if(BKR.isle(k))save()}}return r}}
// İçe Aktar: dosyadaki bakiyeler anlık durumdur; kayıtlar bakiyeye ayrıca işlenmez ve bildirimde sayılmaz
var _ice=OA.iceUygula;OA.iceUygula=function(o){var once=idler(),n=_ice(o);yeniler(once).forEach(function(r){if(r.kim!='sirket'&&!r.bakDus&&!r.bakEk)r.bakEk='banka'});OA.kaydet();return n};

// ---------- Kayıt dışı gelir yok (kullanıcı kararı 2026-11-27) ----------
// Gelir bellidir (maaş, SGK, avans, BES… kayıtlıdır). Bildirilen bakiye beklenenden fazlaysa hesap hatası vardır (çift girilmiş gider,
// yanlış tutar, girilmemiş gelir kaydı). Fark gelir yazılmaz, bakiye değişmez; kullanıcı kayıtları düzeltip yeniden bildirir.
// Düşükse fark eskisi gibi Kayıt dışı harcama olur.
BKR.fazlaYazi=function(k,bek,t){return OA.KASA_AD[k]+' için bildirilen '+tl(t)+' ₺, beklenen '+tl(bek)+' ₺: '+tl(t-bek)+' ₺ fazla. Kayıt dışı gelir olamaz; gelir bellidir. Hesap hatası var: çift girilmiş ya da fazla yazılmış bir gider, yanlış tutar veya girilmemiş bir gelir kaydı olabilir. Kayıtları düzeltip yeniden bildir.'};
var _bb=OA.bakBildir;OA.bakBildir=function(k,t,kim){var bek=OA.bakBeklenen(k);if(bek!=null&&r2(t-bek)>=0.01)return{bek:bek,fark:r2(t-bek),kayit:null,red:true,mesaj:BKR.fazlaYazi(k,bek,t)};return _bb(k,t,kim)};
if(OA.bakKaydet){var _bk=OA.bakKaydet;OA.bakKaydet=function(k,onay){var e=document.getElementById('oaBt'),t=e?OA.okuTL(e.value):NaN,bek=OA.bakBeklenen(k);
 if(e&&e.value!==''&&isFinite(t)&&bek!=null&&r2(t-bek)>=0.01){var u=document.getElementById('oaBu'),m=BKR.fazlaYazi(k,bek,t);if(u)u.innerHTML='<span style="color:#fca5a5" role="alert">'+m+'</span>';else toast(m);return}
 return _bk(k,onay)}}

// ---------- Ay devri ----------
BKR.devreden=function(ay){return BKD.devreden(BKR.st(),ay)};
// Aile Bütçesi üst sınırı: devir döneminde önceki aylardan devreden (artıysa) + bu ayın geliri
if(OA.aileUst){var _au=OA.aileUst;OA.aileUst=function(){var ay=OA.bugunKey().slice(0,7);if(ay<=BKD.DEVIR)return _au();return r2(Math.max(0,BKR.devreden(ay))+OA.ayToplam(ay).gelir)}}

// ---------- Denetim (salt okunur) ----------
BKR.denetle=function(){return BKD.denetle(BKR.st(),GG.buAy())};
})();
