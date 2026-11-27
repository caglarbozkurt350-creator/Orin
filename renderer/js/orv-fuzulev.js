// ========================================================================
// Orvane 0.9.13 · Ailem › FuzulEv (birikim / finansman hesabı).
// Tasarım: Claude Design "Orvane · FuzulEv ve Altın Hesabım" (Main.dc.html, OdendiDialog.dc.html). Kart, tablo, düğmeler orv-butce.css (gg-*).
// Veri: S.orvA.fuzulev (durum.json) = {
//   soz:{plan, planKod, sozNo, tarih, kampanya, finTur, bedel, orgUcret, pesinat, taksitSay, teslimat (taksit no), durum},
//   taksit:[{id, no, tur:'Tasarruf'|'Tahsisat'|'Finansman', vade:'YYYY-AA-GG', tutar|null, odendi, odenen|null, odemeTarih, butceId, butceBag}] }
//  • tutar null = bilinmiyor (uydurulmaz, "Tutar girilmedi" gösterilir). Ödenen boşsa ödenmiş taksitte tutar sayılır.
//  • Ödendi işaretlenirken istenirse Aile Bütçesine "FuzulEv taksiti" gideri yazılır (kayıt id 'fe'+taksit id → aynı taksit iki kez yazılmaz).
//    Bankadan içe aktarılmış aynı ödeme (±7 gün, aynı tutar, "fuzul" geçen) varsa yeni kayıt yazılmaz, ona bağlanır (butceBag:true).
//    Yazılan kayıt GG.ekle kuralıyla kasasına hemen işlenir (bakDus). İşaret kaldırılınca yalnız FuzulEv'in yazdığı kayıt GG.silKayit ile geri alınır.
//    Ay devri (BKD.DEVIR, Kasım 2026) öncesi kapanmış aylara varsayılan yazılmaz; yazılırsa 0.9.12 kuralı gibi bakiyeye işlenmez, ay dengelenir (bakEk 'gecmis').
//  • Telefona gönderilmez (şimdilik). İçe Aktar dosyasında "fuzulev" anahtarı varsa FE.iceUygula ile alınır.
// ========================================================================
var FE=window.FE||{};
(function(){
var E=function(s){return typeof esc=='function'?esc(s):String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')};
var p2=function(n){return String(n).padStart(2,'0')};
var r2=function(n){return Math.round((+n||0)*100)/100};
var tl=function(n){return Math.round(+n||0).toLocaleString('tr-TR')};
var AY=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
FE.KALEM='FuzulEv taksiti';
FE.TUR=['Tasarruf','Tahsisat','Finansman'];
FE.RENK={Tasarruf:'#5fe0f5',Tahsisat:'#fde68a',Finansman:'#c4b0ff'};
FE.SOZ=[['plan','Plan adı','metin'],['planKod','Plan kodu','metin'],['sozNo','Sözleşme no','metin'],['tarih','Sözleşme tarihi','tarih'],['kampanya','Kampanya','metin'],['finTur','Finansman türü','metin'],
 ['bedel','Finansman bedeli (₺)','tl'],['orgUcret','Organizasyon ücreti (₺)','tl'],['pesinat','Peşinat (₺)','tl'],['taksitSay','Toplam taksit sayısı','sayi'],['teslimat','Teslimat (kaçıncı taksit)','sayi'],['durum','Sözleşme durumu','metin']];
FE.ui={suz:'tum',edit:null,yeni:false};

// ---------- Durum ----------
FE.st=function(){var a=OA.st();if(!a.fuzulev||typeof a.fuzulev!='object')a.fuzulev={};var f=a.fuzulev;if(!f.soz||typeof f.soz!='object')f.soz={};if(!Array.isArray(f.taksit))f.taksit=[];return f};
FE.bugun=function(){return OA.bugunKey()};
FE.tarihOk=function(s){return /^\d{4}-\d{2}-\d{2}$/.test(s||'')};
// Tarih: 'YYYY-AA-GG' ya da 'GG/AA/YYYY' / 'GG.AA.YYYY'
FE.tarihOku=function(s){s=String(s==null?'':s).trim();if(FE.tarihOk(s))return s;var m=s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);return m?m[3]+'-'+p2(m[2])+'-'+p2(m[1]):''};
FE.gun=function(a,b){var x=new Date(+a.slice(0,4),+a.slice(5,7)-1,+a.slice(8,10)),y=new Date(+b.slice(0,4),+b.slice(5,7)-1,+b.slice(8,10));return Math.round((y-x)/864e5)};
FE.tarihYaz=function(s){return FE.tarihOk(s)?(+s.slice(8,10))+' '+AY[+s.slice(5,7)-1]+' '+s.slice(0,4):'—'};
FE.tarihKisa=function(s){return FE.tarihOk(s)?s.slice(8,10)+'.'+s.slice(5,7)+'.'+s.slice(0,4):'—'};
FE.tutarOku=function(x){var s=String(x==null?'':x).trim();if(s==='')return null;if(typeof GG!='undefined'&&GG.tutarOku){var t=GG.tutarOku(s);return t>0?t:(/^0+([.,]0+)?\s*₺?$/.test(s)?0:NaN)}var n=+s.replace(/\s|₺/g,'').replace(/\./g,'').replace(',','.');return isFinite(n)&&n>=0?r2(n):NaN};
FE.sirala=function(){FE.st().taksit.sort(function(a,b){return (a.no-b.no)||String(a.vade).localeCompare(String(b.vade))})};
FE.bul=function(id){return FE.st().taksit.filter(function(t){return t.id==id})[0]||null};
FE.yeniId=function(){return 'ft'+(typeof uid=='function'?uid():Date.now().toString(36)+Math.random().toString(36).slice(2,6))};
FE.temizTaksit=function(x,i){if(!x||typeof x!='object')return null;var no=Math.round(+x.no||(i+1));if(!(no>=1&&no<=600))return null;
 var tur=FE.TUR.indexOf(x.tur)>=0?x.tur:'Finansman',tutar=x.tutar==null||x.tutar===''?null:FE.tutarOku(x.tutar),od=x.odenen==null||x.odenen===''?null:FE.tutarOku(x.odenen);
 return{id:x.id&&/^[\w-]{1,40}$/.test(x.id)?x.id:FE.yeniId(),no:no,tur:tur,vade:FE.tarihOku(x.vade),tutar:tutar==null||isNaN(tutar)?null:tutar,odendi:!!x.odendi,odenen:od==null||isNaN(od)?null:od,odemeTarih:FE.tarihOku(x.odemeTarih)}};
FE.temizSoz=function(o){var s={};o=o||{};FE.SOZ.forEach(function(d){var v=o[d[0]];if(v==null||v==='')return;if(d[2]=='tl'){var t=FE.tutarOku(v);if(t!=null&&!isNaN(t))s[d[0]]=t}else if(d[2]=='sayi'){var n=Math.round(+v);if(n>=0&&n<=600)s[d[0]]=n}else if(d[2]=='tarih'){var tr=FE.tarihOku(v);if(tr)s[d[0]]=tr}else s[d[0]]=String(v).replace(/[\u0000-\u001f]/g,' ').trim().slice(0,80)});return s};

// ---------- İçe aktarma ----------
// o: {soz:{…}, taksit:[…]}. Aynı taksit no varsa ödendi işareti, bütçe bağı ve elle girilen tutar korunur; dosyadaki dolu alanlar boş olanları doldurur.
// Taksitte "butce":true ise ödenmiş taksit Aile Bütçesine "FuzulEv taksiti" gideri olarak yazılır (FE.butceYaz kurallarıyla: aynı taksit bir kez,
// banka kaydı varsa ona bağlanır, kapanmış geçmiş ayda bakiye değişmez ve ay dengelenir). Kasa: "kasa":"cagla" değilse Aile Bütçesi.
FE.iceUygula=function(o){if(!o||typeof o!='object')throw new Error('FuzulEv verisi tanınmadı');var f=FE.st(),n={yeni:0,guncel:0,butce:0},yaz=[];
 var s=FE.temizSoz(o.soz);Object.keys(s).forEach(function(k){f.soz[k]=s[k]});
 (Array.isArray(o.taksit)?o.taksit:[]).forEach(function(x,i){var t=FE.temizTaksit(x,i);if(!t)return;var v=f.taksit.filter(function(y){return y.no==t.no})[0];
  if(!v){delete t.butceId;f.taksit.push(t);n.yeni++;v=t}
  else{if(!v.vade&&t.vade)v.vade=t.vade;v.tur=t.tur;if(v.tutar==null&&t.tutar!=null)v.tutar=t.tutar;if(t.odendi&&!v.odendi){v.odendi=true;v.odemeTarih=v.odemeTarih||t.odemeTarih}
   if(v.odendi&&v.odenen==null&&t.odenen!=null)v.odenen=t.odenen;if(v.odendi&&!v.odemeTarih&&t.odemeTarih)v.odemeTarih=t.odemeTarih;n.guncel++}
  if(x.butce===true&&v.odendi)yaz.push([v,x.kasa=='cagla'?'cagla':'aile'])});
 FE.sirala();yaz.sort(function(a,b){return a[0].no-b[0].no}).forEach(function(z){var r=FE.butceYaz(z[0],z[1]);if(r.durum=='yazildi'||r.durum=='bagli')n.butce++});
 f.ts=Date.now();OA.kaydet();return n};
// İçe Aktar klasörü: OA.iceUygula'yı sarar; dosyada "fuzulev" anahtarı varsa ayrıca uygulanır
(function(){var es=OA.iceUygula;if(!es||es.__fe)return;OA.iceUygula=function(o){var fe=o&&typeof o=='object'&&o.fuzulev?o.fuzulev:null,g=o;if(fe){g=Object.assign({},o);delete g.fuzulev}
 var n=es.call(this,g);if(fe){n.fe=FE.iceUygula(fe);try{toast('FuzulEv içe aktarıldı: '+(n.fe.yeni+n.fe.guncel)+' taksit'+(n.fe.butce?' · '+n.fe.butce+' taksit Aile Bütçesine yazıldı':''))}catch(e){}}return n};OA.iceUygula.__fe=true})();

// ---------- Hesap ----------
FE.satir=function(t,bugun){var tutar=t.tutar==null?null:+t.tutar,od=t.odendi?(t.odenen!=null?+t.odenen:tutar):(t.odenen!=null?+t.odenen:0);
 var kalan=t.odendi?0:(tutar==null?null:Math.max(0,r2(tutar-(od||0))));var gec=!t.odendi&&FE.tarihOk(t.vade)&&t.vade<bugun;
 return{t:t,tutar:tutar,odenen:od,kalan:kalan,gecikme:gec?FE.gun(t.vade,bugun):0,durum:t.odendi?(od==null?'girilmedi':'odendi'):gec?'gecikti':'bekliyor'}};
FE.hesap=function(bugun){bugun=bugun||FE.bugun();var f=FE.st(),L=f.taksit.slice().sort(function(a,b){return a.no-b.no}).map(function(t){return FE.satir(t,bugun)});
 var H={satir:L,say:L.length,odenenSay:0,odenen:0,odenenEksik:0,kalan:0,kalanEksik:0,kalanSay:0,toplam:0,toplamEksik:0,geciken:[],sonraki:null,son:null,teslim:null};
 L.forEach(function(r){if(r.tutar==null)H.toplamEksik++;else H.toplam+=r.tutar;
  if(r.t.odendi){H.odenenSay++;if(r.odenen==null)H.odenenEksik++;else H.odenen+=r.odenen}
  else{H.kalanSay++;if(r.kalan==null)H.kalanEksik++;else H.kalan+=r.kalan;if(r.odenen)H.odenen+=r.odenen;if(r.gecikme>0)H.geciken.push(r);else if(!H.sonraki&&FE.tarihOk(r.t.vade))H.sonraki=r;if(!H.son||r.t.vade>H.son.t.vade)H.son=r}});
 ['odenen','kalan','toplam'].forEach(function(k){H[k]=r2(H[k])});
 var tn=+f.soz.teslimat||0,ts=tn?L.filter(function(r){return r.t.no==tn})[0]:null;
 if(ts){var once=L.filter(function(r){return !r.t.odendi&&r.t.no<=tn});H.teslim={r:ts,taksit:once.length,gun:FE.tarihOk(ts.t.vade)?FE.gun(bugun,ts.t.vade):null,tamam:!once.length}}
 if(H.sonraki)H.sonraki.kalanGun=FE.gun(bugun,H.sonraki.t.vade);
 H.ilerleme=H.say?Math.round(H.odenenSay/H.say*100):0;return H};

// ---------- Aile Bütçesi bağlantısı ----------
FE.kayitBul=function(id){return id&&typeof fnS=='function'?fnS().kayit.filter(function(k){return k.id==id})[0]||null:null};
FE.butceAdi=function(t){return 'FuzulEv · '+t.no+'. taksit ('+t.tur+')'};
// Aynı ödeme bankadan içe aktarılmış mı: gider, aynı tutar, ±7 gün, kalem ya da açıklamada "fuzul"; başka taksite bağlı değil
FE.bankaEsi=function(t,tutar,tarih){if(typeof fnS!='function')return null;var bagli={};FE.st().taksit.forEach(function(x){if(x.butceId&&x.id!=t.id)bagli[x.butceId]=1});
 return fnS().kayit.filter(function(k){return k.tur=='gider'&&k.kim!='sirket'&&!bagli[k.id]&&!/^fe/.test(k.id)&&Math.abs((+k.tutar||0)-tutar)<0.01&&FE.tarihOk(k.tarih)&&Math.abs(FE.gun(k.tarih,tarih))<=7&&/fuzul/i.test((k.kalem||'')+' '+(k.not||''))})[0]||null};
// Kapanmış (net 0) geçmiş ay mı: 0.9.12 kuralı BKR.kapali (Ay devri BKD.DEVIR öncesi). Yoksa yalnız bu ay açık sayılır.
FE.kapali=function(tarih){var ay=String(tarih||'').slice(0,7);return typeof BKR!='undefined'&&BKR.kapali?!!BKR.kapali(ay):false};
FE.varsayilanYaz=function(tarih){var ay=String(tarih||'').slice(0,7),bu=FE.bugun().slice(0,7);if(ay>bu)return false;if(typeof BKD!='undefined'&&BKD.DEVIR)return ay>=BKD.DEVIR||ay==bu;return ay==bu};
// Taksidi bütçeye yaz. Döner {durum:'yazildi'|'bagli'|'zaten'|'yok', kayit}
FE.butceYaz=function(t,kasa){var tutar=t.odenen!=null?+t.odenen:+t.tutar;if(!(tutar>0))return{durum:'yok'};var tarih=FE.tarihOk(t.odemeTarih)?t.odemeTarih:FE.bugun();
 var var0=FE.kayitBul(t.butceId)||FE.kayitBul('fe'+t.id);if(var0){t.butceId=var0.id;return{durum:'zaten',kayit:var0}}
 var es=FE.bankaEsi(t,tutar,tarih);if(es){t.butceId=es.id;t.butceBag=true;return{durum:'bagli',kayit:es}}
 if(typeof fnKaydet!='function')return{durum:'yok'};var kap=FE.kapali(tarih),r=fnKaydet({tur:'gider',kim:'cagla',tutar:String(tutar),kalem:FE.KALEM,tarih:tarih,not:FE.butceAdi(t),kaynak:'masaustu'},'fe'+t.id);if(!r)return{durum:'yok'};
 r.kisi='ortak';if(kasa=='cagla')r.hk='c';
 if(kap){r.bakEk='gecmis';BKR.dengele(tarih.slice(0,7),-tutar);save()}else{var k=typeof GG!='undefined'&&GG.bakAnahtar?GG.bakAnahtar(kasa=='cagla'?'cagla':'aile'):(kasa=='cagla'?'cagla':'aile');if(OA.bakIsle(k,-tutar).length)r.bakDus=k}
 t.butceId=r.id;delete t.butceBag;return{durum:'yazildi',kayit:r}};
// FuzulEv'in yazdığı kaydı geri al (banka kaydına yalnız bağ kaldırılır)
FE.butceGeriAl=function(t){var r=FE.kayitBul(t.butceId),sil=false;if(r&&!t.butceBag&&/^fe/.test(r.id)){if(typeof GG!='undefined'&&GG.silKayit)sil=GG.silKayit(r.id);else{fnS().kayit=fnS().kayit.filter(function(x){return x.id!=r.id});sil=true}}delete t.butceId;delete t.butceBag;return sil};
// Tutar ya da tarih değişince FuzulEv'in yazdığı kaydı güncelle (bakiye etkisi GG.guncelle ile düzeltilir)
FE.butceGuncelle=function(t){var r=FE.kayitBul(t.butceId);if(!r||t.butceBag||!/^fe/.test(r.id)||typeof GG=='undefined'||!GG.guncelle)return;var tutar=t.odenen!=null?+t.odenen:+t.tutar;if(!(tutar>0))return;
 if(Math.abs((+r.tutar||0)-tutar)<0.01&&(!FE.tarihOk(t.odemeTarih)||r.tarih==t.odemeTarih))return;GG.guncelle(r.id,{tur:'gider',tutar:String(tutar),kalem:r.kalem,tarih:FE.tarihOk(t.odemeTarih)?t.odemeTarih:r.tarih,not:FE.butceAdi(t),kisi:r.kisi,kasa:GG.kasa(r)})};

// ---------- İşlemler ----------
// o: {tutar, odemeTarih, butce:bool, kasa}
FE.odendi=function(id,o){var t=FE.bul(id);if(!t)return null;o=o||{};var tut=o.tutar==null||o.tutar===''?null:FE.tutarOku(o.tutar);if(tut!=null&&isNaN(tut)){toast('Tutarı 30.000 gibi yaz');return null}
 t.odendi=true;if(tut!=null){t.odenen=tut;if(t.tutar==null)t.tutar=tut}t.odemeTarih=FE.tarihOku(o.odemeTarih)||FE.bugun();
 var b=o.butce?FE.butceYaz(t,o.kasa):{durum:'yok'};FE.st().ts=Date.now();OA.kaydet();return{t:t,butce:b}};
FE.odenmedi=function(id){var t=FE.bul(id);if(!t)return null;var sil=t.butceId?FE.butceGeriAl(t):false;t.odendi=false;delete t.odemeTarih;t.odenen=null;FE.st().ts=Date.now();OA.kaydet();return{t:t,silindi:sil}};
FE.dogrula=function(o){var no=Math.round(+o.no);if(!(no>=1&&no<=600))return{hata:'Taksit numarasını yaz'};var tutar=o.tutar==null||String(o.tutar).trim()===''?null:FE.tutarOku(o.tutar);if(tutar!=null&&isNaN(tutar))return{hata:'Tutarı 25.000 gibi yaz ya da boş bırak'};
 var od=o.odenen==null||String(o.odenen).trim()===''?null:FE.tutarOku(o.odenen);if(od!=null&&isNaN(od))return{hata:'Ödeneni 25.000 gibi yaz ya da boş bırak'};var vade=FE.tarihOku(o.vade);if(String(o.vade||'').trim()&&!vade)return{hata:'Vadeyi GG.AA.YYYY olarak yaz'};
 return{no:no,tur:FE.TUR.indexOf(o.tur)>=0?o.tur:'Finansman',vade:vade,tutar:tutar,odendi:!!o.odendi,odenen:od,odemeTarih:FE.tarihOku(o.odemeTarih)}};
FE.ekle=function(o){var v=FE.dogrula(o);if(v.hata){toast(v.hata);return null}if(FE.st().taksit.some(function(t){return t.no==v.no})){toast(v.no+'. taksit zaten var');return null}
 var t=Object.assign({id:FE.yeniId()},v);FE.st().taksit.push(t);FE.sirala();FE.st().ts=Date.now();OA.kaydet();return t};
FE.guncelle=function(id,o){var t=FE.bul(id);if(!t)return null;var v=FE.dogrula(o);if(v.hata){toast(v.hata);return null}if(FE.st().taksit.some(function(x){return x.no==v.no&&x.id!=id})){toast(v.no+'. taksit zaten var');return null}
 var sil=false;if(t.odendi&&!v.odendi&&t.butceId)sil=FE.butceGeriAl(t);
 t.no=v.no;t.tur=v.tur;t.vade=v.vade;t.tutar=v.tutar;t.odendi=v.odendi;t.odenen=v.odenen;if(v.odendi)t.odemeTarih=v.odemeTarih||t.odemeTarih||'';else delete t.odemeTarih;
 if(t.odendi&&t.butceId)FE.butceGuncelle(t);FE.sirala();FE.st().ts=Date.now();OA.kaydet();t._sil=sil;return t};
// Taksit silinir; bütçeye yazılmış gider kalır (para ödendi), yalnız bağ kalkar
FE.silTaksit=function(id){var f=FE.st(),n=f.taksit.length;f.taksit=f.taksit.filter(function(t){return t.id!=id});if(f.taksit.length==n)return false;f.ts=Date.now();OA.kaydet();return true};
FE.sozKaydet=function(o){var f=FE.st(),s=FE.temizSoz(o);FE.SOZ.forEach(function(d){if(s[d[0]]!=null)f.soz[d[0]]=s[d[0]];else delete f.soz[d[0]]});f.ts=Date.now();OA.kaydet();return f.soz};
// Taksit sayısı kadar boş satır üret (vade: sözleşme tarihinden itibaren her ay aynı gün). Var olan numaralara dokunmaz.
FE.planUret=function(){var f=FE.st(),n=+f.soz.taksitSay||0,t0=f.soz.tarih;if(!n||!FE.tarihOk(t0))return 0;var y=0,tn=+f.soz.teslimat||0;
 for(var i=1;i<=n;i++){if(f.taksit.some(function(t){return t.no==i}))continue;var d=new Date(+t0.slice(0,4),+t0.slice(5,7)-1+(i-1),1),gun=Math.min(+t0.slice(8,10),new Date(d.getFullYear(),d.getMonth()+1,0).getDate());
  f.taksit.push({id:FE.yeniId(),no:i,tur:tn&&i<tn?'Tasarruf':tn&&i==tn?'Tahsisat':'Finansman',vade:d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(gun),tutar:null,odendi:false,odenen:null});y++}
 FE.sirala();OA.kaydet();return y};

// ---------- Görünüm ----------
var gec=function(s){return 'animation-delay:'+s.toFixed(3)+'s'};
var kart=function(ic,d,sinif){return '<section class="gg-k'+(sinif?' '+sinif:'')+'" style="'+gec(d)+'">'+ic+'</section>'};
var KALEM_SVG='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
var DURUM={odendi:['Ödendi','fe-d ok'],girilmedi:['Tutar girilmedi','fe-d uy'],gecikti:['Gecikti','fe-d gec'],bekliyor:['Bekliyor','fe-d']};
FE.durumHtml=function(r,tn){var d=DURUM[r.durum],ad=r.durum=='gecikti'?r.gecikme+' gün gecikti':(r.durum=='bekliyor'&&tn&&r.t.no==tn?'Teslimat':d[0]);return '<span class="'+d[1]+(r.durum=='bekliyor'&&tn&&r.t.no==tn?' tes':'')+'">'+E(ad)+'</span>'};
FE.kpi=function(bas,deger,birim,alt,d,sinif){return kart('<div class="gg-et">'+bas+'</div><div class="fe-kd">'+deger+(birim?' <i>'+birim+'</i>':'')+'</div><div class="gg-alt2">'+alt+'</div>',d,'fe-kp'+(sinif?' '+sinif:''))};
FE.sayfa=function(){var f=FE.st(),s=f.soz,H=FE.hesap(),bos=!f.taksit.length&&!Object.keys(s).length,tn=+s.teslimat||0;
 var ust='<header class="gg-ust"><div class="gg-mk"><span class="gg-lg fe-lg" aria-hidden="true">FE</span><div><b>FuzulEv</b><small>Ailem · birikim ve finansman</small></div>'+(s.durum?'<span class="gg-pil g">'+E(s.durum)+'</span>':'')+'</div>'+
  '<div class="gg-sag"><button type="button" class="gg-btn cerceve kucuk" onclick="FE.sozDlg()">Sözleşmeyi düzenle</button><button type="button" class="gg-btn kucuk" onclick="FE.yeniAc()">+ Taksit ekle</button></div></header>';
 if(bos)return '<div class="gg fe" id="feKok">'+ust+'<div id="feGovde">'+kart('<b class="gg-bas">Henüz FuzulEv sözleşmesi yok</b><div class="gg-alt">“Sözleşmeyi düzenle” ile plan, tutar, taksit sayısı ve teslimat ayını gir; sonra “Taksit planını oluştur” ile satırlar açılır. Ya da <b>Belgeler\\Orin\\İçe Aktar</b> klasörüne "fuzulev" anahtarlı bir JSON koy: açılışta bir kez işlenir.</div><div class="gg-dz"><button type="button" class="gg-btn" onclick="FE.sozDlg()">Sözleşmeyi gir</button></div>',.12,'tam')+'</div></div>';
 var gk=H.geciken.map(function(r){return '<div class="fe-gec" role="alert"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff9a85" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>'+
  '<div class="fe-gm"><b>'+r.t.no+'. taksit '+r.gecikme+' gün gecikti</b><span>'+E(r.t.tur)+' taksiti · '+(r.kalan!=null?tl(r.kalan)+' ₺':'tutar girilmedi')+' · vade '+FE.tarihYaz(r.t.vade)+'</span></div><button type="button" class="gg-btn kucuk fe-gb" onclick="FE.odeDlg(\''+E(r.t.id)+'\')">✓ Ödendi işaretle</button></div>'}).join('');
 var k1=FE.kpi('Kalan borç',H.kalanSay?tl(H.kalan):'0','₺',H.kalanSay?H.kalanSay+' taksit'+(H.son?' · son vade '+AY[+H.son.t.vade.slice(5,7)-1]+' '+H.son.t.vade.slice(0,4):'')+(H.kalanEksik?' · '+H.kalanEksik+' tutarı girilmedi':''):'Tüm taksitler ödendi',.12);
 var k2=FE.kpi('Toplam ödenen',H.odenenEksik&&!H.odenen?'—':tl(H.odenen),H.odenenEksik&&!H.odenen?'':'₺',H.odenenEksik?'<span class="fe-uy">'+H.odenenEksik+' ödenmiş taksitin tutarı girilmedi</span>':H.odenenSay+' / '+H.say+' taksit ödendi',.18);
 var te=H.teslim,k3=FE.kpi('Teslimata kalan',te?(te.tamam?'✓':te.gun!=null?String(Math.max(0,te.gun)):'—'):'—',te&&!te.tamam&&te.gun!=null?'gün':'',te?(te.tamam?'Teslimat taksitine kadar ödendi':te.taksit+' taksit · '+tn+'. taksit ('+E(te.r.t.tur)+') · '+FE.tarihYaz(te.r.t.vade)):'Teslimat taksitini sözleşmede gir',.24,'koyu');
 var so=H.sonraki,k4=FE.kpi('Sonraki ödeme',so?(so.kalan!=null?tl(so.kalan):'—'):'—',so&&so.kalan!=null?'₺':'',so?so.t.no+'. taksit · '+FE.tarihYaz(so.t.vade)+' · '+(so.kalanGun?so.kalanGun+' gün sonra':'bugün'):'Bekleyen ödeme yok',.3);
 var sb=[['plan','Plan'],['bedel','Finansman bedeli'],['orgUcret','Organizasyon ücreti'],['pesinat','Peşinat'],['taksitSay','Taksit sayısı'],['tarih','Sözleşme tarihi'],['finTur','Finansman türü'],['kampanya','Kampanya'],['teslimat','Teslimat']].filter(function(x){return x[0]!='plan'}).map(function(x){var v=s[x[0]];
  var y=v==null||v===''?'<span class="soluk">—</span>':x[0]=='tarih'?FE.tarihKisa(v):/bedel|orgUcret|pesinat/.test(x[0])?tl(v)+' ₺':x[0]=='teslimat'?E(v)+'. taksit':E(v);return '<div><span>'+x[1]+'</span><b>'+y+'</b></div>'}).join('');
 var soz=kart('<div class="gg-r"><b class="gg-bas">Sözleşme</b><button type="button" class="gg-kalem" aria-label="Sözleşmeyi düzenle" onclick="FE.sozDlg()">'+KALEM_SVG+'</button></div><div><div class="fe-pl">'+E(s.plan||'Plan adı girilmedi')+'</div><div class="gg-alt2">'+(s.planKod?'Plan '+E(s.planKod):'')+(s.planKod&&s.sozNo?' · ':'')+(s.sozNo?'Sözleşme No '+E(s.sozNo):'')+'</div></div><div class="fe-sg">'+sb+'</div>',.36,'fe-soz');
 var yolS=H.satir.map(function(r){var h=r.tutar?Math.round(18+Math.min(1,r.tutar/Math.max.apply(null,H.satir.map(function(x){return x.tutar||1})))*46):30;
  return '<div class="fe-yi'+(r.t.odendi?' on':'')+(r.t.no==tn?' tes':'')+(r.durum=='gecikti'?' gec':'')+'" title="'+E(r.t.no+'. '+r.t.tur+' · '+FE.tarihKisa(r.t.vade)+(r.tutar!=null?' · '+tl(r.tutar)+' ₺':''))+'"><i style="height:'+h+'px;background:'+FE.RENK[r.t.tur]+'"></i><span>'+r.t.no+'</span></div>'}).join('');
 var ilk=H.satir[0],son=H.satir[H.satir.length-1],ayY=function(v){return FE.tarihOk(v)?AY[+v.slice(5,7)-1]+' '+v.slice(0,4):''};
 var yol=kart('<div class="gg-r"><b class="gg-bas">Ödeme yolu</b><div class="fe-lj">'+FE.TUR.map(function(t){return '<span><i style="background:'+FE.RENK[t]+'"></i>'+t+'</span>'}).join('')+'</div></div>'+
  (H.say?'<div class="fe-yol" style="grid-template-columns:repeat('+H.say+',minmax(0,1fr))">'+yolS+'</div><div class="fe-yl"><span>'+E(ayY(ilk.t.vade))+'</span>'+(te?'<span class="fe-ty">▼ Teslimat · '+E(ayY(te.r.t.vade))+'</span>':'')+'<span>'+E(ayY(son.t.vade))+'</span></div>':'<div class="gg-alt">Taksit yok. '+(s.taksitSay&&s.tarih?'<button type="button" class="gg-btn kucuk" onclick="FE.planOlustur()">Taksit planını oluştur</button>':'Sözleşmeye taksit sayısını ve tarihini gir.')+'</div>')+
  '<div class="fe-bar" role="progressbar" aria-label="Ödenen taksit" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+H.ilerleme+'"><i style="width:'+H.ilerleme+'%"></i></div><div class="gg-alt2">'+H.odenenSay+' / '+H.say+' taksit ödendi'+(H.odenenEksik?' · ödenen tutar, '+H.odenenEksik+' taksitin tutarı girilince tamamlanır':'')+'</div>',.42,'fe-yolk');
 var suz=[['tum','Tümü'],['odenmedi','Ödenmemiş'],['odendi','Ödenmiş']].map(function(x){return '<button type="button" class="gg-cb fe-sz'+(FE.ui.suz==x[0]?' on':'')+'" aria-pressed="'+(FE.ui.suz==x[0])+'" onclick="FE.suzgec(\''+x[0]+'\')">'+x[1]+'</button>'}).join('');
 var tab=kart('<div class="gg-r"><b class="gg-bas">Taksitler</b><div class="fe-szg" role="group" aria-label="Taksit süzgeci">'+suz+'</div></div><div id="feTablo">'+FE.tablo(H)+'</div>',.48,'tablo');
 return '<div class="gg fe" id="feKok">'+ust+'<div id="feGovde"'+(FE._sessiz?' class="gg-sessiz"':'')+'><div class="gg-sut">'+gk+'<div class="gg-kpi">'+k1+k2+k3+k4+'</div><div class="fe-iki">'+soz+yol+'</div>'+tab+'</div></div></div>'};
FE.tablo=function(H){H=H||FE.hesap();var u=FE.ui,tn=+FE.st().soz.teslimat||0;
 var th='<thead><tr><th scope="col" style="text-align:left">#</th><th scope="col" style="text-align:left">Tür</th><th scope="col" style="text-align:left">Vade</th><th scope="col" style="text-align:right">Tutar</th><th scope="col" style="text-align:right">Ödenen</th><th scope="col" style="text-align:right">Kalan</th><th scope="col" style="text-align:left">Durum</th><th scope="col" style="text-align:right">İşlem</th></tr></thead>';
 var L=H.satir.filter(function(r){return u.suz=='tum'||(u.suz=='odendi'?r.t.odendi:!r.t.odendi)});
 var s=L.map(function(r){if(u.edit==r.t.id)return FE.duzenSatir(r.t);var t=r.t;
  return '<tr class="gg-tr'+(r.durum=='gecikti'?' fe-trg':'')+'"><td><b>'+t.no+'</b></td><td><span class="fe-tur"><i style="background:'+FE.RENK[t.tur]+'"></i>'+E(t.tur)+'</span></td><td class="nw">'+FE.tarihKisa(t.vade)+'</td>'+
   '<td class="nw gg-tt" style="text-align:right">'+(r.tutar!=null?tl(r.tutar)+' ₺':'<span class="soluk">—</span>')+'</td><td class="nw soluk" style="text-align:right">'+(r.odenen!=null?tl(r.odenen)+' ₺':'—')+(t.butceId?' <span class="fe-bt" title="Aile Bütçesine işlendi">₺</span>':'')+'</td>'+
   '<td class="nw" style="text-align:right">'+(r.kalan!=null?tl(r.kalan)+' ₺':'<span class="soluk">—</span>')+'</td><td>'+FE.durumHtml(r,tn)+'</td>'+
   '<td class="gg-is nw" style="text-align:right">'+(t.odendi?'<button type="button" class="gg-btn cerceve kucuk fe-ob" onclick="FE.geriAl(\''+E(t.id)+'\')">Geri al</button>':'<button type="button" class="gg-btn cerceve kucuk fe-ob" onclick="FE.odeDlg(\''+E(t.id)+'\')">✓ Ödendi</button>')+
   ' <button type="button" class="gg-kalem" aria-label="'+t.no+'. taksiti düzenle" onclick="FE.duzenle(\''+E(t.id)+'\')">'+KALEM_SVG+'</button></td></tr>'}).join('');
 if(u.yeni)s=FE.duzenSatir(null)+s;if(!s)s='<tr><td colspan="8" class="gg-bos">'+(H.say?'Bu süzgeçte taksit yok.':'Henüz taksit yok. “+ Taksit ekle” ile başla.')+'</td></tr>';
 return '<div class="gg-ts"><table class="gg-tab fe-tab"><caption class="gg-gz">FuzulEv taksitleri</caption>'+th+'<tbody>'+s+'</tbody></table></div>'+
  (H.say?'<div class="gg-top">'+H.say+' taksit · toplam '+(H.toplamEksik?'(1 ya da daha fazla tutar girilmedi) ':'')+tl(H.toplam)+' ₺ · kalan '+tl(H.kalan)+' ₺ · “Ödendi” işaretlenince istersen Aile Bütçesine “'+FE.KALEM+'” gideri yazılır.</div>':'')};
FE.duzenSatir=function(t){var son=FE.st().taksit.reduce(function(m,x){return Math.max(m,x.no)},0),o=t||{no:son+1,tur:'Finansman',vade:'',tutar:null,odendi:false,odenen:null,odemeTarih:''};
 var tv=function(v){return v==null?'':String(v).replace('.',',')};
 return '<tr class="gg-ed" id="feEd" data-id="'+E(t?t.id:'')+'"><td><input type="number" id="feENo" min="1" max="600" aria-label="Taksit no" value="'+E(o.no)+'" style="width:64px"></td><td><select id="feETu" aria-label="Taksit türü">'+FE.TUR.map(function(x){return '<option'+(x==o.tur?' selected':'')+'>'+x+'</option>'}).join('')+'</select></td>'+
  '<td><input type="date" id="feEVa" aria-label="Vade" value="'+E(o.vade||'')+'"></td><td><input type="text" id="feETt" inputmode="decimal" class="gg-tin" aria-label="Tutar (₺, bilinmiyorsa boş)" placeholder="Tutar ₺" value="'+E(tv(o.tutar))+'"></td>'+
  '<td><input type="text" id="feEOd" inputmode="decimal" class="gg-tin" aria-label="Ödenen (₺)" placeholder="Ödenen ₺" value="'+E(tv(o.odenen))+'"></td><td><input type="date" id="feEOt" aria-label="Ödeme tarihi" value="'+E(o.odemeTarih||'')+'"></td>'+
  '<td colspan="2"><label class="fe-chk"><input type="checkbox" id="feEOk"'+(o.odendi?' checked':'')+'> Ödendi</label></td></tr>'+
  '<tr class="gg-ed2"><td colspan="8"><div class="gg-edd"><span class="gg-edn">Bilinmeyen tutarı boş bırak. Ödenen boşsa ödenmiş taksitte tutar sayılır. Bütçeye yazmak için satırdaki “✓ Ödendi” düğmesini kullan; burada değişen tutar bütçedeki kayda da yansır.</span>'+
  (t?'<button type="button" class="gg-btn sil kucuk" onclick="FE.sil()">Sil</button>':'')+'<button type="button" class="gg-btn cerceve kucuk" onclick="FE.vazgec()">Vazgeç</button><button type="button" class="gg-btn kucuk" onclick="FE.kaydet()">Kaydet</button></div></td></tr>'};
FE.cizYenile=function(){if(typeof pg!='undefined'&&pg=='fuzulev'){FE._sessiz=true;ORV.yenile();FE._sessiz=false}};
FE.suzgec=function(s){FE.ui.suz=s;FE.ui.edit=null;FE.ui.yeni=false;FE.cizYenile()};
FE.yeniAc=function(){FE.ui.yeni=true;FE.ui.edit=null;FE.ui.suz='tum';FE.cizYenile();var e=document.getElementById('feETt');if(e)e.focus()};
FE.duzenle=function(id){FE.ui.edit=id;FE.ui.yeni=false;FE.cizYenile();var e=document.getElementById('feETt');if(e)e.focus()};
FE.vazgec=function(){FE.ui.edit=null;FE.ui.yeni=false;FE.cizYenile()};
FE.oku=function(){var g=function(id){var e=document.getElementById(id);return e?(e.type=='checkbox'?e.checked:e.value):''};return{no:g('feENo'),tur:g('feETu'),vade:g('feEVa'),tutar:g('feETt'),odenen:g('feEOd'),odemeTarih:g('feEOt'),odendi:g('feEOk')}};
FE.kaydet=function(){var ed=document.getElementById('feEd'),id=ed&&ed.getAttribute('data-id'),t=id?FE.guncelle(id,FE.oku()):FE.ekle(FE.oku());if(!t)return;toast((id?'Güncellendi: ':'Eklendi: ')+t.no+'. taksit'+(t._sil?' · bütçedeki gider geri alındı':''));delete t._sil;FE.ui.edit=null;FE.ui.yeni=false;FE.cizYenile()};
FE.sil=function(){var ed=document.getElementById('feEd'),id=ed&&ed.getAttribute('data-id'),t=FE.bul(id);if(!t)return;confirmBox(t.no+'. taksit silinsin mi?'+(t.butceId?' Aile Bütçesindeki gider kaydı kalır.':''),function(){if(FE.silTaksit(id))toast('Silindi');FE.ui.edit=null;FE.cizYenile()},'Sil')};
FE.planOlustur=function(){var n=FE.planUret();toast(n?n+' taksit satırı açıldı · tutarları gir':'Sözleşmeye taksit sayısını ve tarihini gir');FE.cizYenile()};
FE.geriAl=function(id){var t=FE.bul(id);if(!t)return;confirmBox(t.no+'. taksit “ödenmedi” yapılsın mı?'+(t.butceId&&!t.butceBag?' Aile Bütçesine yazılan gider de geri alınır.':''),function(){var s=FE.odenmedi(id);toast(t.no+'. taksit ödenmedi'+(s&&s.silindi?' · bütçe gideri geri alındı':''));FE.cizYenile()},'Evet, geri al')};
// Ödendi penceresi (tasarım: OdendiDialog). Geçmiş aya ait ödemede bütçe kutusu varsayılan kapalı (kapanmış ay net 0).
FE.odeDlg=function(id){var t=FE.bul(id);if(!t)return;var bugun=FE.bugun(),tarih=t.odemeTarih||bugun,tutar=t.odenen!=null?t.odenen:t.tutar,yazili=!!FE.kayitBul(t.butceId);
 var buAy=FE.varsayilanYaz(tarih);
 OA.dlg('<h3>'+t.no+'. taksit ödendi</h3><span class="oa-sub">'+E(t.tur)+' · vade '+FE.tarihYaz(t.vade)+'</span>'+
  '<label class="oa-zl">Ödenen tutar (₺)<input class="oa-in" id="feOt" inputmode="decimal" value="'+(tutar!=null?E(tl(tutar)):'')+'" placeholder="ör. 30.000"></label>'+
  '<label class="oa-zl">Ödeme tarihi<input class="oa-in" id="feOd" type="date" value="'+E(tarih)+'" onchange="FE.odeTarihDegis()"></label>'+
  (yazili?'<span class="oa-sub">Bu taksit Aile Bütçesine zaten yazılı; ikinci kez yazılmaz.</span>':
  '<label class="fe-bk"><input type="checkbox" id="feOb"'+(buAy?' checked':'')+'><span><b>Aile Bütçesine gider olarak yaz</b><small>“'+FE.KALEM+'” · seçilen kasadan düşer. Bankadan içe aktarılan aynı ödeme varsa ikinci kez yazılmaz, ona bağlanır.<span id="feOn">'+(buAy?'':' Ödeme kapanmış (net 0) bir aya ait: varsayılan kapalı; yazılırsa ayın kayıt dışı harcaması dengeler, bakiye değişmez.')+'</span></small></span></label>'+
  '<label class="oa-zl">Kasa<select class="oa-in" id="feOk"><option value="aile">Aile Bütçesi</option><option value="cagla">Çağlar cep</option></select></label>')+
  '<div class="acts"><button type="button" class="oa-btn ghost" onclick="OA.dlgKapat()">Vazgeç</button><button type="button" class="oa-btn" onclick="FE.odeKaydet(\''+E(id)+'\')">Ödendi olarak kaydet</button></div>')};
FE.odeTarihDegis=function(){var d=document.getElementById('feOd'),b=document.getElementById('feOb'),n=document.getElementById('feOn');if(!d||!b)return;var bu=FE.tarihOk(d.value)&&FE.varsayilanYaz(d.value);b.checked=bu;if(n)n.textContent=bu?'':' Ödeme kapanmış (net 0) bir aya ait: varsayılan kapalı; yazılırsa ayın kayıt dışı harcaması dengeler, bakiye değişmez.'};
FE.odeKaydet=function(id){var g=function(x){var e=document.getElementById(x);return e?(e.type=='checkbox'?e.checked:e.value):''};var tt=g('feOt');if(String(tt).trim()===''&&FE.bul(id)&&FE.bul(id).tutar==null){toast('Ödenen tutarı yaz');return}
 var s=FE.odendi(id,{tutar:tt,odemeTarih:g('feOd'),butce:!!g('feOb'),kasa:g('feOk')||'aile'});if(!s)return;OA.dlgKapat();
 var b=s.butce.durum;toast(s.t.no+'. taksit ödendi'+(b=='yazildi'?' · Aile Bütçesine yazıldı':b=='bagli'?' · bankadan gelen kayda bağlandı (ikinci kez yazılmadı)':b=='zaten'?' · bütçede zaten vardı':''));FE.cizYenile()};
FE.sozDlg=function(){var s=FE.st().soz;OA.dlg('<h3>FuzulEv sözleşmesi</h3><div class="fe-sd">'+FE.SOZ.map(function(d){var v=s[d[0]];v=v==null?'':d[2]=='tl'?tl(v):String(v);
  return '<label class="oa-zl">'+d[1]+'<input class="oa-in" id="feS_'+d[0]+'"'+(d[2]=='tarih'?' type="date"':d[2]=='sayi'?' type="number" min="0" max="600"':d[2]=='tl'?' inputmode="decimal"':'')+' value="'+E(v)+'"></label>'}).join('')+'</div>'+
  '<span class="oa-sub">Bilmediğin alanı boş bırak. Gerçek sözleşme bilgileri yalnız bu bilgisayarda (durum.json) tutulur.</span><div class="acts"><button type="button" class="oa-btn ghost" onclick="OA.dlgKapat()">Vazgeç</button><button type="button" class="oa-btn" onclick="FE.sozDlgKaydet()">Kaydet</button></div>')};
FE.sozDlgKaydet=function(){var o={};FE.SOZ.forEach(function(d){var e=document.getElementById('feS_'+d[0]);if(e)o[d[0]]=e.value});FE.sozKaydet(o);OA.dlgKapat();toast('Sözleşme kaydedildi');FE.cizYenile();if(typeof pg!='undefined'&&pg=='fuzulev')ORV.yenile()};

// ---------- Menü: Ailem altında, Altın Hesabım (yoksa Aylık Bütçe) sonrasına ----------
(function(){var k=ORV.katBul&&ORV.katBul('aile');if(!k||k.alt.some(function(a){return a.id=='fuzulev'}))return;var yer=function(id){return k.alt.map(function(a){return a.id}).indexOf(id)};
 var i=yer('altin')>=0?yer('altin'):yer('aylikbutce');k.alt.splice(i+1,0,{id:'fuzulev',ad:'FuzulEv',kisa:'FuzulEv',renk:'#5fe0f5',hedef:['team','calisan','otto']})})();
ORV.sayfa('fuzulev',{ciz:FE.sayfa,sonra:function(){},baslik:'Ailem › FuzulEv'});
})();
