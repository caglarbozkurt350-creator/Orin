// Orvane 0.8.0 · Aşama 4B: Görevler (Görevler, Onaylar, Görseller), İş Günleri (Özet, Günlük, Projeler), İzinler
// Tasarım: Program kurulum\Tasarim\Main.dc.html (pGr, pIs, pIz). Sayfalar ORV.sayfa(...) ile kaydolur. Ortak yardımcılar OA.* (orv-sayfa-a.js).
// ESKİ işlevler korunur: iş günü kaydı (add/fillDay/fixOver/setT/Sheets yazma/şablonlar) Günlük sayfasına gömülü P.gun() ile çalışır;
// onaylar.js, görseller (P.gorsel/gv), proje sayfası (P.proje), izin planları (applyPlan/cyc) mevcut işlevlerle kullanılır.
// Kalıcı durum S.orvB (ok: okundu işaretleri, bil: uygulama bildirimleri). Ayar anahtarları S.orvTema vb. orvane08.js'te.
var OB=window.OB||{};
(function(){
var SMOKE=function(){return typeof INFO!='undefined'&&INFO.smoke};
var AYK=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
var ZG=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
var p2=function(n){return String(n).padStart(2,'0')};
OB.st=function(){if(!S.orvB)S.orvB={};var b=S.orvB;b.ok=b.ok||{};b.bil=b.bil||[];return b};
// Eski (string üreten) sayfa işlevini yeni sayfa içine gömer. arg geçici değiştirilir.
OB.eski=function(fn,a){var sa=arg;try{if(a!==undefined)arg=a;return fn()}catch(e){return OA.bos('uyari','Bölüm açılamadı',String(e.message||e))}finally{arg=sa}};
OB.kutu=function(h){return '<div class="ob-eski">'+h+'</div>'};
OB.ymd=function(k){var d=pk(k);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
OB.keyOf=function(v){var a=String(v||'').split('-');return a.length==3?mk(+a[0],+a[1],+a[2]):null};
OB.tarihTR=function(k){var d=pk(k);return p2(d.getDate())+'.'+p2(d.getMonth()+1)+'.'+d.getFullYear()};
function kim(id){return (typeof tm=='function'&&tm(id))||{ad:id,gorev:''}}
function yenile(){if(typeof ORV!='undefined')ORV.yenile()}
OB.yenile=yenile;
function sekmeIc(liste,aktif,fn){return OA.sekmeler(liste,aktif,fn)}
function ustAlt(h,alt,sag){return OA.baslik(h,alt,sag)}
function toastKisa(m){if(typeof toast=='function')toast(m)}

// ========================================================================
// GÖREVLER
// ========================================================================
var GSEK=[['ekip','Ekip'],['hiyerarsi','Hiyerarşi'],['gorevler','Görevler'],['onaylar','Onaylar']];
var ISEK=[['gunluk','Günlük'],['ozet','Özet'],['projeler','Projeler'],['gorseller','Görseller'],['izinler','İzinler']];
OB.gGit=function(id){ORV.git(id)};
function gorevSon(g){var s=String(g.son||'');if(!s)return null;var t=typeof hfrSon=='function'?hfrSon(g):Date.parse(s);return t&&!isNaN(t)?t:null}
OB.gorevSut=function(){var G=TMS().gorev.slice().sort(function(a,b){return (b.ts||0)-(a.ts||0)}),r={bek:[],sur:[],plan:[],bit:[]},now=Date.now();
 G.forEach(function(g){if(g.durum=='bitti')r.bit.push(g);else if(g.durum=='calisiyor')r.sur.push(g);else{var s=gorevSon(g);if(s&&s>now)r.plan.push(g);else r.bek.push(g)}});
 return r};
OB.gKart=function(g,bitti){var c=kim(g.kim),dg=g.yol=='dogrudan',et=dg?'<span class="ob-et d">Doğrudan</span>':'<span class="ob-et o">Orin üzerinden</span>',s=gorevSon(g);
 return '<div class="ob-kc" data-g="'+esc(g.id)+'"><div class="ob-r">'+OA.imgAv(g.kim,'oa-av','width:32px;height:32px')+'<span class="ob-ad"><b>'+esc(c.ad)+'</b><span class="oa-sub">'+esc(c.gorev||'')+'</span></span>'+et+'</div>'+
 '<p>'+esc(String(g.metin||g.baslik||'').slice(0,180))+'</p><div class="ob-satir"><span class="oa-sub">'+esc(typeof tmTime=='function'?tmTime(g.ts):'')+(s?' · son '+esc(typeof tmSon=='function'?tmSon(g.son):g.son):'')+(g.onc=='acil'?' · acil':'')+'</span>'+
 '<span class="sag">'+(bitti?'<button type="button" class="oa-ib" style="width:34px;height:34px" aria-label="Geri aç" onclick="tmTaskTog(\''+jq(g.id)+'\')">'+ORV.svg('yenile',16,2.2)+'</button>':'<button type="button" class="oa-btn sm" onclick="tmTaskTog(\''+jq(g.id)+'\')">Bitti</button>')+
 '<button type="button" class="oa-ib" style="width:34px;height:34px" aria-label="Görevi sil" onclick="tmTaskDel(\''+jq(g.id)+'\')">'+ORV.svg('cop',16,2.1)+'</button></span></div>'+(g.sonuc?'<details><summary class="oa-sub" style="cursor:pointer">Sonuç</summary><div style="font-size:12.5px;line-height:17px;margin-top:4px;overflow-wrap:anywhere">'+esc(String(g.sonuc).slice(0,600))+'</div></details>':'')+'</div>'};
OB.zKart=function(j){var c=kim(j.kim);return '<div class="ob-kc"><div class="ob-r">'+OA.imgAv(j.kim,'oa-av','width:32px;height:32px')+'<span class="ob-ad"><b>'+esc(j.ad)+'</b><span class="oa-sub">'+esc(c.ad)+'</span></span><span class="ob-et g">Tekrarlı</span></div><div class="ob-satir"><span class="oa-sub">'+esc(OB.zTekrarMetin(j))+' · '+esc(j.saat)+(j.durum=='beklet'?' · bekletildi':'')+'</span></div></div>'};
OB.gSutun=function(ad,renk,L,gec,bos,ek){var lim=10,h=L.slice(0,lim).map(function(g){return OB.gKart(g)}).join('')+(ek||'');
 return '<section class="oa-card ob-kcol" style="animation-delay:'+gec+'s"><div class="oa-hd"><span class="ob-sw" style="background:'+renk+';width:10px;height:10px"></span><span class="oa-tl">'+ad+'</span>'+OA.kp(String(L.length+(ek?(OB.zIsler().length):0)),'n')+'</div>'+(h||OA.bos('gorev',bos,'',120))+(L.length>lim?'<span class="oa-sub">+ '+(L.length-lim)+' görev daha</span>':'')+'</section>'};
OB.gorevler=function(){var r=OB.gorevSut(),zj=OB.zIsler().filter(function(j){return j.durum=='aktif'}).map(OB.zKart).join(''),
 sag='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'+sekmeIc(GSEK,'gorevler','OB.gGit')+'<button type="button" class="oa-btn" onclick="OB.gYeni()">+ Yeni görev</button></div>',
 top=ustAlt('Görevler','Görevler normalde Orin üzerinden dağıtılır; basit işler doğrudan ilgili çalışana gider',sag);
 var bit=r.bit.slice(0,8);
 return '<div class="ob-pg" id="obGorev">'+top+'<div class="ob-kan">'+OB.gSutun('Bekliyor','#f5a524',r.bek,0,'Bekleyen görev yok')+OB.gSutun('Sürüyor','#38d6f0',r.sur,.06,'Şu an çalışan görev yok')+OB.gSutun('Tekrarlı / Planlı','#3ecf5a',r.plan,.12,'Planlı görev yok',zj)+'</div>'+
 OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#7cf096,#16a34a)','tik'),'Tamamlananlar',OA.kp(String(r.bit.length),'g')),bit.length?'<div class="ob-kan">'+bit.map(function(g){return OB.gKart(g,true)}).join('')+'</div>':OA.bos('gorev','Henüz biten görev yok','',100),.18)+(OB.pbGorevKart?OB.pbGorevKart():'')+'</div>'};
OB.gYeni=function(){var ls=(typeof tmAll=='function'?tmAll():[]).filter(function(c){return !c.sil});
 OA.dlg('<div class="oa-form"><b style="font-size:16px">Yeni görev</b><label class="oa-zl">Çalışan<select id="obGk" class="oa-in" aria-label="Çalışan">'+ls.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.ad)+(c.gorev?' · '+esc(c.gorev):'')+'</option>'}).join('')+'</select></label><label class="oa-zl">Görev<textarea id="obGm" class="oa-ta" style="border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:8px 10px" placeholder="Görevi yaz…" aria-label="Görev metni"></textarea></label><label class="oa-zl">Öncelik<select id="obGo" class="oa-in" aria-label="Öncelik"><option value="normal">Normal</option><option value="acil">Acil</option></select></label><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="oa-btn ghost" onclick="OA.dlgKapat()">Vazgeç</button><button type="button" class="oa-btn" onclick="OB.gKaydet()">Gönder</button></div></div>')};
OB.gKaydet=function(){var k=(document.getElementById('obGk')||{}).value,m=((document.getElementById('obGm')||{}).value||'').trim(),o=(document.getElementById('obGo')||{}).value||'normal';if(!k||!m){toastKisa('Görevi yaz');return false}
 tmTaskNew(k,m,o,'',k!='orin');OA.dlgKapat();toastKisa('Görev '+kim(k).ad+'’ya gönderildi');yenile();return true};

// ---- Onaylar: mevcut onaylar.js işlevleri (onayPage, onaySb, onayla/reddet) korunur ----
(function(){if(typeof onayAcik=='function'){var _oa=onayAcik;onayAcik=function(){return _oa()||(area=='orv'&&pg=='onaylar')}}})();
OB.onaylar=function(){var sag='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'+sekmeIc(GSEK,'onaylar','OB.gGit')+'</div>';
 var n=typeof onaySay=='function'?onaySay():0;
 return '<div class="ob-pg">'+ustAlt('Onaylar',n?n+' onay senin kararını bekliyor':'Bekleyen onay yok · Nika ve Orin’den gelenler burada toplanır',sag)+OA.kart('',OB.kutu(typeof onayPage=='function'?OB.eski(onayPage):''),0)+'</div>'};

// ---- Görseller: yerel klasör (Ayarlar), proje koduna göre eşleme, kodla arama ----
OB.gq='';
// 0.9.3: klasör ayarlanmadıysa varsayılan Belgeler\Orin\Görseller\Biten Projeler
if(typeof S!='undefined'&&!S.path&&typeof INFO!='undefined'&&INFO&&INFO.belgeler&&!INFO.smoke)S.path=INFO.belgeler+'\\Orin\\Görseller\\Biten Projeler';
OB.gTile=function(x){return '<button type="button" class="ob-gt" title="'+esc((x.klasor?x.klasor+' / ':'')+x.name)+'" onclick="API&&API.openPath(decodeURI(\''+jq(x.url)+'\').replace(\'file:///\',\'\'))"><span class="ob-gi"><img src="'+esc(x.url)+'" loading="lazy" alt=""></span><span class="oa-sub" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc((x.klasor?x.klasor+' / ':'')+x.name)+'</span></button>'};
// Proje koduyla eşlenmeyen görseller (telefon adlı dosyalar, alt klasörler) de görünsün
OB.gTumKart=function(q){var es={};allP().forEach(function(p){imgsFor(p[0]).forEach(function(x){es[x.url]=1})});
 var R=IM.filter(function(x){return !es[x.url]&&(!q||trl(x.name).indexOf(q)>=0||trl(x.klasor||'').indexOf(q)>=0)}),lim=OB.gTum?R.length:48;
 return OA.kart(OA.hd('','Klasördeki görseller',OA.kp(R.length+' görsel','n')),(R.length?'<div class="ob-gor">'+R.slice(0,lim).map(OB.gTile).join('')+'</div>'+(R.length>lim?'<button type="button" class="oa-btn ghost sm" style="align-self:flex-start" onclick="OB.gTum=1;OB.yenile()">Tümünü göster ('+R.length+')</button>':''):OA.bos('resim','Görsel yok',q?'Aramaya uyan görsel yok':'Klasörde görsel bulunamadı',100))+
  '<span class="oa-sub">Proje koduyla eşlenmeyen görseller. Dosya adı proje koduyla başlarsa (ör. 88.34.01.51 Komodin.jpg) o projenin altında da görünür.</span>',.06)};
OB.gAra=function(v){OB.gq=String(v||'');yenile();setTimeout(function(){var e=document.getElementById('obGq');if(e){e.focus();try{e.setSelectionRange(OB.gq.length,OB.gq.length)}catch(x){}}},0)};
OB.gKlasor=function(){if(API&&API.pickFolder)API.pickFolder(S.path).then(function(p){if(p){sx('path',p);OB.gYukle(true)}});else toastKisa('Klasör seçimi yalnız masaüstü uygulamasında')};
OB.gYukle=function(zorla){if(!API||!API.images||!S.path)return;if(OB._gy&&!zorla)return;OB._gy=true;API.images(S.path).then(function(r){OB._gy=false;var ch=JSON.stringify(r.items)!=JSON.stringify(IM);IM=r.items;if(ch&&area=='orv'&&(pg=='gorseller'))yenile()},function(){OB._gy=false})};
OB.gorseller=function(){var sag='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'+sekmeIc(ISEK,'gorseller','OB.isGit')+'</div>',h='<div class="ob-pg">';
 if(arg){var c=arg,im=imgsFor(c);h+=ustAlt(esc(c),esc(pname(c))||'Proje görselleri',sag)+OA.kart('','<div class="ob-satir"><button type="button" class="oa-btn ghost sm" onclick="ORV.git0(\'gorseller\',\'\')">‹ Tüm projeler</button><span class="oa-sub">Klasör: '+esc(S.path||'—')+' · '+im.length+' görsel</span></div>'+(im.length?'<div class="ob-gor">'+im.map(function(x){return '<button type="button" class="ob-gt" title="'+esc(x.name)+'" onclick="API&&API.openPath(decodeURI(\''+jq(x.url)+'\').replace(\'file:///\',\'\'))"><span class="ob-gi"><img src="'+esc(x.url)+'" loading="lazy" alt=""></span><span class="oa-sub" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(x.name)+'</span></button>'}).join('')+'</div>':OA.bos('resim','Bu proje için görsel bulunamadı','Dosya adını proje koduyla başlat (ör. '+c+' montaj 1.jpg)',140)),0)+'</div>';return h};
 h+=ustAlt('Görseller','Tamamlanan işlerin görselleri proje koduyla eşlenir',sag);
 if(!S.path)return h+OA.kart('',OA.bos('resim','Görsel klasörü ayarlanmadı','Klasör yalnız bu bilgisayarda geçerlidir; dosya adı proje koduyla başlamalıdır.',160)+'<div style="display:flex;justify-content:center;gap:10px"><button type="button" class="oa-btn" onclick="OB.gKlasor()">Klasör seç</button><button type="button" class="oa-btn ghost" onclick="ORV.git(\'ayarlar\',\'kural\')">Ayarlar</button></div>',0)+'</div>';
 var q=trl(OB.gq),L=allP().filter(function(p){return q?(trl(p[0]).indexOf(q)>=0||trl(p[1]).indexOf(q)>=0):imgsFor(p[0]).length>0}).sort(function(a,b){return imgsFor(b[0]).length-imgsFor(a[0]).length});
 return h+OA.kart('','<div class="ob-satir"><input id="obGq" class="oa-in" style="flex:1;min-width:200px" type="search" placeholder="Proje kodu ya da dosya adıyla ara (ör. 78.26)" aria-label="Kodla ara" value="'+esc(OB.gq)+'" oninput="OB.gAra(this.value)"><span class="oa-sub">Klasör: '+esc(S.path)+' · '+IM.length+' görsel</span><button type="button" class="oa-btn ghost sm" onclick="OB.gYukle(true)">Yenile</button></span></div>'+
  (L.length?'<div class="ob-gor">'+L.map(function(p){var im=imgsFor(p[0]);return '<button type="button" class="ob-gt" onclick="ORV.git0(\'gorseller\',\''+jq(p[0])+'\')"><span class="ob-gi">'+(im.length?'<img src="'+esc(im[0].url)+'" loading="lazy" alt="">':ORV.svg('resim',26,1.6))+'</span><span style="font-size:13px;font-weight:600">'+esc(p[0])+(im.length?' <span class="oa-sub">· '+im.length+'</span>':'')+'</span><span class="oa-sub" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(p[1])+'</span></button>'}).join('')+'</div>':(q?OA.bos('ara','Eşleşen proje yok','Kodu kontrol et',120):'<span class="oa-sub">Adı proje koduyla başlayan görsel yok; klasördeki tüm görseller aşağıda.</span>')),0)+OB.gTumKart(q)+'</div>'};
function trl(s){return String(s==null?'':s).toLocaleLowerCase('tr')}
OB.trl=trl;
ORV.sayfa('gorevler',{ciz:OB.gorevler,baslik:'Ekip › Görevler'});
ORV.sayfa('onaylar',{ciz:OB.onaylar,baslik:'Ekip › Onaylar',sb:function(){return typeof onaySb=='function'?onaySb():''}});
ORV.sayfa('gorseller',{ciz:OB.gorseller,baslik:'İş Günleri › Görseller',sonra:function(){OB.gYukle()}});

// ========================================================================
// İŞ GÜNLERİ · ÖZET
// ========================================================================
var IZR={yillik:'#3ecf5a',refakat:'#3ecf5a',rapor4:'#3ecf5a',mazeret:'#f5a524',sevk:'#f5a524',rapor13:'#f5a524',ucretsiz:'#f87171',tatil:'#8b7cf6',tatily:'#8b7cf6',plan:'#3ecf5a'};
OB.hf=0;OB.kf={t:'',kd:'',is:'',d:'',er:'',ok:''};
function pazartesi(off){var d=pk(TODAY),w=(d.getDay()+6)%7;d.setDate(d.getDate()-w+7*off);return d}
OB.haftaGunler=function(off){var m=pazartesi(off),r=[];for(var i=0;i<7;i++){var d=new Date(m);d.setDate(m.getDate()+i);r.push(key(d))}return r};
OB.haftaBaslik=function(off){var g=OB.haftaGunler(off),per=pk(g[3]),ay=per.getMonth(),n=0;for(var d=1;d<=per.getDate();d++){if(new Date(per.getFullYear(),ay,d).getDay()==4)n++}
 return {ad:AY[ay]+' Ayı · '+n+'. Hafta',ilk:g[0],son:g[4]}};
OB.gunSatir=function(k,M){var d=pk(k),w=d.getDay(),L=lim(k),s=tot(k),c=cap(k),t=typ(k),o=OT[k]||0,gel=d>pk(TODAY),bugun=k==TODAY,iz=IZL[t]||t=='plan'||t=='tatil'||t=='tatily';
 var r={k:k,ad:ZG[w],bugun:bugun,t:t,parcalar:[],cls:'',deger:'',red:false,muted:false,iz:false,track:Math.max(8,(c||L||525)/M*100)};
 if(gel&&!s&&!D[k]&&!PL[k]&&!HO[k]){r.muted=true;r.deger='Henüz gelmedi';r.track=Math.max(8,(L||525)/M*100);return r}
 if(iz&&!s){r.iz=true;r.color=IZR[t]||'#3ecf5a';r.parcalar=[{w:100}];r.track=Math.max(8,(L||525)/M*100);r.deger=t=='plan'?'Planlı izin':t=='tatil'||t=='tatily'?(HO[k]?HO[k][0]:'Resmî tatil'):IZL[t];return r}
 if(t=='girdi'){r.red=true;r.deger='Süre girin';r.parcalar=[{w:100}];return r}
 if(t=='hata'){var fz=c&&s>c;r.red=true;r.deger=fz?'Veri hatası · +'+dk(s-c)+' dk':'Girdi hatası · '+dk(c-s)+' dk eksik';r.parcalar=[{w:100}];r.track=Math.max(8,Math.max(c||0,s)/M*100);return r}
 if(bugun&&!s){r.muted=true;r.deger='Bugün · henüz kayıt yok';r.track=Math.max(8,(L||525)/M*100);return r}
 if(!s){r.muted=true;r.deger=t=='bos'?'Kayıt yok':'';r.track=Math.max(8,(L||525)/M*100);return r}
 var tt=Math.max(c||0,s),temel=L?Math.min(s,L):0,fazla=s-temel;r.track=Math.max(8,tt/M*100);
 if(temel)r.parcalar.push({w:temel/tt*100});if(fazla>0)r.parcalar.push({w:fazla/tt*100,mesai:true});
 r.deger=L&&fazla>0?dk(temel)+'+'+dk(fazla)+' dk':dk(s)+' dk'+(L?'':' mesai');return r};
OB.ozetVeri=function(off){var g=OB.haftaGunler(off),H=OB.haftaBaslik(off),goster=g.slice(0,5);if(tot(g[5])>0)goster.push(g[5]);if(tot(g[6])>0)goster.push(g[6]);
 var M=525;goster.forEach(function(k){var c=cap(k)||0;if(c>M)M=c;if(tot(k)>M)M=tot(k)});
 var S1=goster.map(function(k){return OB.gunSatir(k,M)}),top=0,bek=0;goster.forEach(function(k){top+=tot(k)});g.slice(0,5).forEach(function(k){bek+=lim(k)||0});
 var ay=pk(g[3]),ayT=0,ayK=0,ayI=0,ayE=0,bug=pk(TODAY);for(var d=1;d<=new Date(ay.getFullYear(),ay.getMonth()+1,0).getDate();d++){var k=mk(ay.getFullYear(),ay.getMonth()+1,d);ayT+=tot(k);var dd=pk(k);if(dd<=bug&&lim(k)&&!D[k]&&!HO[k]&&dd>=hireD()){ayI++;if(tot(k)>0)ayK++}var ty=typ(k);if(dd<=bug&&(ty=='hata'||ty=='girdi'))ayE++}
 return{g:g,H:H,satirlar:S1,toplam:top,beklenen:bek,ayT:ayT,ayK:ayK,ayI:ayI,ayE:ayE}};
OB.hafta=function(d){var n=OB.hf+d;if(n>0||n<-104)return;OB.hf=n;yenile()};
OB.hafta0=function(){OB.hf=0;yenile()};
OB.kfSet=function(w,v){OB.kf[w]=v;OB.kf.er='';OB.kf.ok='';if(w=='is'&&DG.indexOf(String(v).trim())>=0)OB.kf.kd='Diğer';OB.kfUyari()};
OB.kfHizli=function(n){OB.kf.kd='Diğer';OB.kf.is=n;OB.kf.er='';yenile()};
OB.kfCheck=function(){var k=OB.keyOf(OB.kf.t||OB.ymd(TODAY)),d=+OB.kf.d,er='';if(!k)return 'Tarihi seç';var w=pk(k).getDay(),c=cap(k),s=tot(k);
 if(!OB.kf.kd||!String(OB.kf.is).trim())er='Proje kodunu ve yapılan işi girin';else if(DG.indexOf(String(OB.kf.is).trim())<0&&!pexists(OB.kf.kd)&&SPECIAL.indexOf(OB.kf.kd)<0)er='Bu proje listede yok · İş Günleri › Projeler';else if(!(d>0))er='Süre girin';else if((w==0||w==6)&&!S.cts)er='Hafta sonu çalışması kapalı · Ayarlar';else if(c&&S.cak&&s+d>c)er='Veri hatası · '+dk(s+d-c)+' dk fazla (günlük en fazla '+dk(c)+' dk)';
 return er};
OB.kfUyari=function(){var e=document.getElementById('obKfUy');if(!e)return;var d=+OB.kf.d,k=OB.keyOf(OB.kf.t||OB.ymd(TODAY)),c=k?cap(k):null,s=k?tot(k):0,er=(d>0&&c&&S.cak&&s+d>c)?'Günlük sınır aşılıyor · '+dk(s+d-c)+' dk fazla (en fazla '+dk(c)+' dk)':'';e.style.display=er?'block':'none';e.textContent=er};
OB.kayit=function(){var er=OB.kfCheck();if(er){OB.kf.er=er;OB.kf.ok='';yenile();return false}
 var k=OB.keyOf(OB.kf.t||OB.ymd(TODAY)),kd=OB.kf.kd,is=String(OB.kf.is).trim(),d=+OB.kf.d;if(DG.indexOf(is)>=0)kd='Diğer';
 var e={k:kd,i:is,d:d,pn:'',ds:'',st:S.onay?0:1};(E[k]=E[k]||[]).push(e);entryAdded(k,e);UN.push({k:k,e:e});RE=[];
 OB.kf.ok=lab(k)+' · '+dk(d)+' dk kaydedildi'+(S.onay?' (onay bekliyor)':'');OB.kf.er='';OB.kf.kd='';OB.kf.is='';OB.kf.d='';sel=k;save();toastKisa('Kayıt eklendi');yenile();return true};
OB.ozet=function(){var V=OB.ozetVeri(OB.hf),kf=OB.kf,tk=kf.t||OB.ymd(TODAY),son=V.g[6],sonK=tot(V.g[6])>0?V.g[6]:tot(V.g[5])>0?V.g[5]:V.g[4];
 var rows=V.satirlar.map(function(r,i){var fill=r.red?'<span class="ob-wf red" style="width:100%;animation-delay:'+(.1+i*.07)+'s"></span>':r.parcalar.length?'<span class="ob-wf'+(r.iz?' iz':'')+'" style="width:100%;animation-delay:'+(.1+i*.07)+'s;'+(r.iz?'--izr:'+r.color+';':'')+'">'+r.parcalar.map(function(p){return '<i'+(p.mesai?' class="mesai"':'')+' style="width:'+p.w+'%"></i>'}).join('')+'</span>':'';
  return '<div class="ob-w" data-gun="'+r.k+'"><button type="button" class="ob-wl'+(r.bugun?' bugun':'')+'" onclick="OB.gunAc(\''+r.k+'\')" aria-label="'+esc(r.ad)+' ayrıntısı">'+r.ad+'</button><span class="ob-wt" style="width:'+r.track+'%">'+fill+'</span><span class="ob-wv'+(r.red?' red':r.muted?' muted':r.iz?' iz':'')+'">'+esc(r.deger)+'</span></div>'}).join('');
 var haftaK='<div class="oa-hd"><button type="button" class="oa-ib" style="width:36px;height:36px" aria-label="Önceki hafta" onclick="OB.hafta(-1)">'+ORV.svg('sol',16,2.4)+'</button><span style="flex:1;display:flex;flex-direction:column;align-items:center;line-height:20px"><b style="font-size:16px;font-weight:600">'+esc(V.H.ad)+'</b><span class="oa-sub">'+OB.tarihTR(V.H.ilk)+' – '+OB.tarihTR(sonK)+' '+GK[pk(sonK).getDay()]+'</span></span><button type="button" class="oa-ib" style="width:36px;height:36px" aria-label="Sonraki hafta" onclick="OB.hafta(1)"'+(OB.hf>=0?' disabled':'')+'>'+ORV.svg('sag',16,2.4)+'</button></div>'+
  '<div style="display:flex;flex-direction:column;gap:12px;padding:6px 0" id="obHafta">'+rows+'</div><div class="ob-satir" style="padding-top:10px;border-top:1px solid rgba(255,255,255,.08);justify-content:space-between"><span style="font-size:13px;color:#c9c9cf">Haftalık toplam</span><b style="font-size:18px">'+OA.sayi(V.toplam)+' <span class="oa-sub" style="font-weight:500">/ '+OA.sayi(V.beklenen)+' dk</span></b></div>'+(OB.hf?'<button type="button" class="oa-btn ghost sm" onclick="OB.hafta0()">Bu haftaya dön</button>':'')+
  '<span class="oa-sub">Fazla mesai <b style="color:#f7bd55;font-weight:600">askıda</b> · 10 Kasım 2026’dan beri. Çizgili bölüm 525 dk’dan sonrasıdır (ör. 525+180).</span>';
 var secili=OB.ymd(OB.kf.t?OB.keyOf(OB.kf.t):TODAY),projeSec=allP().slice().sort(function(a,b){return a[0]<b[0]?1:-1}).map(function(p){return '<option value="'+esc(p[0])+'"'+(kf.kd==p[0]?' selected':'')+'>'+esc(p[0])+' · '+esc(p[1])+'</option>'}).join('');
 var form='<div class="oa-hd">'+OA.ico('linear-gradient(160deg,#5fe0f5,#3b82f6)','ekle')+'<span class="oa-tl">Kayıt gir</span></div><div class="ob-form">'+
  '<label class="oa-zl">Tarih<input id="obKt" class="oa-in" type="date" value="'+secili+'" onchange="OB.kfSet(\'t\',this.value)"></label>'+
  '<label class="oa-zl">Gün türü<select id="obKtur" class="oa-in" onchange="OB.turAta(this.value)"><option value="">Otomatik (iş günü)</option>'+SO.map(function(x){var gk=OB.keyOf(secili);return '<option value="'+x[0]+'"'+(gk&&D[gk]==x[0]?' selected':'')+'>'+esc(x[1])+'</option>'}).join('')+'</select></label>'+
  '<label class="oa-zl">Proje kodu<select id="obKk" class="oa-in" onchange="OB.kfSet(\'kd\',this.value)"><option value="">Seç…</option>'+projeSec+'<option value="Diğer"'+(kf.kd=='Diğer'?' selected':'')+'>Diğer (proje dışı)</option><option value="Standart dışı"'+(kf.kd=='Standart dışı'?' selected':'')+'>Standart dışı</option></select></label>'+
  '<label class="oa-zl">İş<input id="obKi" class="oa-in" type="text" list="obDl" placeholder="Örn. ön montaj" value="'+esc(kf.is)+'" oninput="OB.kfSet(\'is\',this.value)"><datalist id="obDl">'+DG.map(function(n){return '<option value="'+n+'">'}).join('')+'</datalist></label>'+
  '<label class="oa-zl">Süre (dk)<input id="obKd" class="oa-in" type="number" min="0" step="any" placeholder="0–525" value="'+esc(kf.d)+'" oninput="OB.kfSet(\'d\',this.value)"></label>'+
  '<div style="display:flex;flex-wrap:wrap;gap:6px">'+DG.map(function(n){return '<button type="button" class="oa-chip" style="height:34px;padding:0 12px;font-size:12px" onclick="OB.kfHizli(\''+jq(n)+'\')">'+esc(n)+'</button>'}).join('')+'</div>'+
  '<div class="ob-uy" id="obKfUy" role="alert" style="display:'+(kf.er?'block':'none')+'">'+esc(kf.er)+'</div><button type="button" class="oa-btn" id="obKaydet" onclick="OB.kayit()" style="justify-content:center">Kaydet</button>'+(kf.ok?'<span class="ob-ok" role="status">'+esc(kf.ok)+'</span>':'')+
  '<button type="button" class="oa-btn ghost sm" onclick="OB.gunAc(OB.keyOf(document.getElementById(\'obKt\').value)||TODAY)">Gün ayrıntısı · Günü doldur, düzenle ›</button></div>';
 var stat=function(ad,deger,renk,gec,altm){return OA.kart('','<span class="oa-sub">'+ad+'</span><b class="oa-num"'+(renk?' style="color:'+renk+'"':'')+'>'+deger+'</b>'+(altm?'<span class="oa-sub">'+altm+'</span>':''),gec)};
 var ayAd=AY[pk(V.g[3]).getMonth()];
 var stats='<div class="oa-grid2" style="grid-template-columns:repeat(4,minmax(0,1fr))">'+stat(ayAd+' toplam',OA.sayi(V.ayT)+' <span class="oa-sub" style="font-weight:500">dk</span>','',.12)+stat('Kayıtlı gün',V.ayK+' <span class="oa-sub" style="font-weight:500">/ '+V.ayI+'</span>','',.16)+stat('Eksik gün',String(V.ayE),V.ayE?'#fca5a5':'',.2)+stat('Fazla mesai','Askıda','#f7bd55',.24,'10 Kas’tan beri')+'</div>';
 return '<div class="ob-pg" id="obOzet">'+ISsekme('ozet')+'<div class="oa-grid21">'+OA.kart('',haftaK,0)+OA.kart('',form,.08)+'</div>'+stats+'<div class="oa-grid2">'+OA.kart('',OB.takvimKart(),.14)+OA.kart('',OB.kuralKart(),.18)+'</div></div>'};
function ISsekme(a){return ustAlt('İş Günleri','Kaynak: İş Günü Raporu · Echo Pzt–Cum 18:20’de kontrol eder',sekmeIc(ISEK,a,'OB.isGit'))}
OB.isGit=function(id){ORV.git(id)};
OB.gunAc=function(k){sel=k;ORV.git('gunluk',k)};
OB.takvimKart=function(){var m=pk(OB.haftaGunler(OB.hf)[3]),y=m.getFullYear(),ay=m.getMonth(),dim=new Date(y,ay+1,0).getDate(),off=(new Date(y,ay,1).getDay()+6)%7,h='<div class="oa-hd">'+OA.ico('linear-gradient(160deg,#ffc24a,#ff7a2f)','takvim')+'<span class="oa-tl">'+AY[ay]+' '+y+'</span><button type="button" class="oa-btn ghost sm" onclick="nav(\'cal\',\'takvim\',\'\')">Ay / hafta takvimi · ay sonu özeti ›</button></div><div class="ob-takv">';
 ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].forEach(function(x){h+='<span class="ob-tk th">'+x+'</span>'});for(var i=0;i<off;i++)h+='<span class="ob-tk bos"></span>';
 for(var d=1;d<=dim;d++){var k=mk(y,ay+1,d),t=typ(k),st=cs(t);h+='<button type="button" class="ob-tk" style="'+st+'" title="'+esc(lab(k)+' · '+(TN[t]||''))+'" onclick="OB.gunAc(\''+k+'\')">'+d+'</button>'}
 return h+'</div><span class="oa-sub">Mavi tamam · kırmızı hata/ücretsiz · yeşil izin · turuncu mazeret/rapor · mor tatil. Güne dokununca ayrıntısı açılır.</span>'};
OB.kuralKart=function(){return '<div class="oa-hd">'+OA.ico('linear-gradient(160deg,#c4b0ff,#7c3aed)','liste')+'<span class="oa-tl">Kurallar</span></div><div class="ob-liste">'+
 [['Pazartesi–Perşembe','günlük toplam en fazla '+dk(S.w1)+' dk'],['Cuma','günlük toplam en fazla '+dk(S.w2)+' dk'],['Form','Süre günlük sınırı aşarsa uyarır'+(S.cak?'':' (şu an kapalı)')],['Fazla mesai','10.11.2026’dan beri askıda'],['Hafta sonu',S.cts?'Cumartesi/Pazar çalışılırsa mesai sayılır':'Hafta sonu çalışması kapalı']].map(function(x){return '<div class="ob-gr"><b style="font-size:13px;width:130px;flex:none">'+x[0]+'</b><span class="oa-sub" style="font-size:12.5px">'+x[1]+'</span></div>'}).join('')+'</div><button type="button" class="oa-btn ghost sm" onclick="ORV.git(\'ayarlar\',\'kural\')">Kuralları düzenle ›</button>'};
ORV.sayfa('ozet',{ciz:OB.ozet,baslik:'İş Günleri › Özet'});

// ========================================================================
// İŞ GÜNLERİ · GÜNLÜK (kayıt listesi + gün ayrıntısı: eski P.gun ile tüm işlevler)
// ========================================================================
// Kayıt gir kartından gün türü (izin, rapor, mesai…) atama: Gün ayrıntısındaki setT ile aynı kurallar (refakat hakkı vb.)
OB.turAta=function(v){var k=OB.keyOf((document.getElementById('obKt')||{}).value)||TODAY;sel=k;setT(v)};
OB.gunler=function(){var ks={};Object.keys(E).forEach(function(k){if(E[k]&&E[k].length)ks[k]=1});Object.keys(D).forEach(function(k){ks[k]=1});Object.keys(PL).forEach(function(k){ks[k]=1});ks[TODAY]=1;
 return Object.keys(ks).filter(function(k){return pk(k)<=pk(TODAY)}).sort(function(a,b){return pk(b)-pk(a)}).slice(0,60)};
OB.durumAd=function(e){return e.st?(e.row?'Sheets’te':e.u&&typeof qOf=='function'&&qOf(e.u)?'Sırada':'Yerel'):'Onay bekliyor'};
OB.gunluk=function(){var sk=(arg&&OB.keyOf(arg)?arg:sel)||TODAY;sel=sk;
 var L=OB.gunler(),sol=L.map(function(k,i){var ent=E[k]||[],t=typ(k),d=pk(k);
  return '<section class="oa-card ob-gr tik'+(k==sk?' sec':'')+'" style="flex-direction:column;align-items:stretch;gap:8px;animation-delay:'+Math.min(i,10)*.04+'s;cursor:pointer" data-k="'+k+'" onclick="OB.gunAc(\''+k+'\')"><div class="oa-hd"><span class="oa-dday" style="min-width:76px">'+d.getDate()+' '+AYK[d.getMonth()]+'</span><span class="oa-tl" style="font-size:14px">'+ZG[d.getDay()]+' <span class="oa-sub">· '+esc(TN[t]||'')+'</span></span><b style="font-size:14px">'+(tot(k)?dk(tot(k))+' dk':'')+'</b></div>'+
  (ent.length?'<div class="ob-liste">'+ent.map(function(e){return '<div class="ob-gr"><span class="ob-kod">'+esc(e.k=='?'?'?':e.k)+'</span><span style="flex:1;min-width:0;font-size:13.5px;color:#e9e9ec;overflow-wrap:anywhere">'+esc(e.i||'?')+'</span><span class="ob-et'+(e.st?(e.row?' g':''):' o')+'">'+esc(OB.durumAd(e))+'</span><b style="width:60px;text-align:right;font-size:13.5px">'+(e.d==null?'?':dk(e.d))+'</b></div>'}).join('')+'</div>':'<span class="oa-sub">Bu gün için kayıt yok</span>')+'</section>'}).join('');
 return '<div class="ob-pg" id="obGunluk">'+ISsekme('gunluk')+'<div class="ob-g2"><div class="ob-liste" style="gap:12px" id="obGunListe">'+sol+'</div><div class="ob-det"><section class="oa-card" id="obGunDet"><div class="oa-hd">'+OA.ico('linear-gradient(160deg,#5fe0f5,#3b82f6)','takvim')+'<span class="oa-tl">'+esc(lab(sk))+'</span><button type="button" class="oa-btn ghost sm" onclick="ORV.git(\'ozet\')">Özet ›</button></div>'+OB.kutu(OB.eski(P.gun,''))+'</section></div></div></div>'};
ORV.sayfa('gunluk',{ciz:OB.gunluk,baslik:'İş Günleri › Günlük'});

// ========================================================================
// İŞ GÜNLERİ · PROJELER (model ön ekine göre gruplar; yeni kod güncelleme gerektirmez)
// ========================================================================
OB.pf={kd:'',ad:'',er:''};
OB.projeSure=function(c){var t=0;Object.keys(E).forEach(function(k){E[k].forEach(function(e){if(e.k==c)t+=e.d})});return t};
OB.projeler=function(){if(arg&&(pexists(arg)||DG.indexOf(arg)>=0||arg=='Standart dışı'))return '<div class="ob-pg">'+ISsekme('projeler')+OA.kart('','<div class="ob-satir"><button type="button" class="oa-btn ghost sm" onclick="ORV.git0(\'projeler\',\'\')">‹ Tüm projeler</button></div>'+OB.kutu(OB.eski(P.proje)),0)+'</div>';
 var gr=models().map(function(m){return{ad:m,L:PR[m].slice().sort(function(a,b){return a[0]<b[0]?-1:1})}}),renk=['linear-gradient(160deg,#5fe0f5,#3b82f6)','linear-gradient(160deg,#ffc24a,#ff7a2f)','linear-gradient(160deg,#7cf096,#16a34a)','linear-gradient(160deg,#c4b0ff,#7c3aed)'];
 gr.push({ad:'Diğer',L:DG.concat(['Standart dışı']).map(function(n){return [n,'']}),dg:true});
 var kart=gr.map(function(g,i){return '<section class="oa-card" style="animation-delay:'+(i*.06)+'s" data-model="'+esc(g.ad)+'"><div class="oa-hd">'+OA.ico(renk[i%4],'klasor')+'<span class="oa-tl">'+esc(g.ad)+'</span>'+OA.kp(String(g.L.length),'n')+'</div>'+(g.L.length?'<div class="ob-liste">'+g.L.map(function(p){var t=g.dg?0:OB.projeSure(p[0]);return '<button type="button" class="ob-gr tik" style="border:1px solid rgba(255,255,255,.06);color:inherit;font-family:inherit;text-align:left" onclick="ORV.git0(\'projeler\',\''+jq(p[0])+'\')"><span class="ob-kod">'+esc(p[0])+'</span><span style="flex:1;min-width:0;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(p[1])+'</span>'+(PS[p[0]]?'<span class="ob-et">'+esc(PS[p[0]])+'</span>':'')+(t?'<span class="oa-sub">'+dk(t)+' dk</span>':'')+'</button>'}).join('')+'</div>':'<span class="oa-sub">Henüz kayıt yok.</span>')+'</section>'}).join('');
 var pf=OB.pf,yeni=OA.kart('','<div class="oa-hd"><span class="oa-tl">Yeni proje ekle</span><span class="oa-sub">Uygulama güncellemesi gerekmez</span></div><div style="display:grid;grid-template-columns:200px 1fr auto;gap:8px"><input id="obPk" class="oa-in" type="text" placeholder="Örn. 118.26.01.02" aria-label="Yeni proje kodu" value="'+esc(pf.kd)+'" oninput="OB.pf.kd=this.value"><input id="obPn" class="oa-in" type="text" placeholder="Proje adı" aria-label="Proje adı" value="'+esc(pf.ad)+'" oninput="OB.pf.ad=this.value"><button type="button" class="oa-btn" onclick="OB.projeEkle()">Ekle</button></div>'+(pf.er?'<div class="ob-uy" role="alert">'+esc(pf.er)+'</div>':'')+'<span class="oa-sub">118.26.01.02 yazarsan SY118 grubu kendiliğinden açılır.</span>',.3,'');
 return '<div class="ob-pg" id="obProjeler">'+ISsekme('projeler')+'<div class="oa-grid3">'+kart+'</div>'+yeni+'</div>'};
OB.projeEkle=function(){var c=String(OB.pf.kd).trim(),n=String(OB.pf.ad).trim(),er='';
 if(!/^\d+(\.\d+)+$/.test(c))er='Proje kodunu 118.26.01.01 gibi yaz';else if(!n)er='Proje adını yaz';else if(pexists(c))er='Bu proje kodu zaten var';
 if(er){OB.pf.er=er;yenile();return false}
 var m=pmodel(c);if(!PR[m]){PR[m]=[];UM[m]=true}PR[m].push([c,n]);UP[c]=true;PS[c]='Başlandı';projChanged(c);CL.prj=false;CL['m'+m]=false;save();OB.pf={kd:'',ad:'',er:''};toastKisa(m+' altına eklendi');ORV.git0('projeler',c);return true};
ORV.sayfa('projeler',{ciz:OB.projeler,baslik:'İş Günleri › Projeler'});

// ========================================================================
// İZİNLER
// ========================================================================
OB.iz={tab:'yillik',plan:'A'};
OB.izTab=function(t){OB.iz.tab=t;yenile()};
OB.izPlan=function(p){selP=p;yenile()};
OB.izYedek=function(n){res=n;if(PA=='B')applyPlan('B');else{yenile();save()}};
var PSAD=['Taslak','Onay bekliyor','Onaylandı'];
OB.izSayilar=function(){var y=pk(TODAY).getFullYear(),h={};['mazeret','ucretsiz','refakat','rapor13','rapor4','yillik'].forEach(function(t){h[t]=daysOf(t)});return{y:y,h:h,refK:refUsed(y)}};
OB.izinler=function(){var t=OB.iz.tab,tab=sekmeIc([['yillik','Yıllık'],['mazeret','Mazeret']],t,'OB.izTab');
 var top=ustAlt('İzinler','Hak ediş tarihi '+anniv()+' · kullanılmayan yıllık izin devreder','<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">'+sekmeIc(ISEK,'izinler','OB.isGit')+tab+'</div>'),h='<div class="ob-pg" id="obIzin">'+top;
 if(t=='yillik'){var k=kal(),tt=S.hak+S.dev,kul=tt-k,pcs=kul>0?Math.min(100,kul/tt*100):0,mA=best(k),mB=best(Math.max(0,k-res)),sp=selP,m=sp=='A'?mA:mB,x=ptot(m),ap=PA==sp,boxes='';
  for(var i=0;i<tt;i++)boxes+='<span class="ob-izg '+(i<kul?'k':'b')+'" style="animation-delay:'+(.3+i*.04)+'s"></span>';
  var sol='<div class="oa-hd">'+OA.ico('linear-gradient(160deg,#7cf096,#16a34a)','gunes')+'<span class="oa-tl">Yıllık İzin</span>'+OA.kp(f(k)+' kalan / '+tt+' toplam','g')+'</div><div class="ob-ibar"><span class="ob-ibu" style="width:'+(tt?kul/tt*100:0)+'%"></span><span class="ob-ibk" style="width:'+(tt?k/tt*100:0)+'%"></span></div><div class="ob-satir" style="justify-content:space-between"><span class="oa-sub"><span class="ob-sw" style="background:var(--acc)"></span> '+f(kul)+' gün kullanıldı</span><span class="oa-sub"><span class="ob-sw" style="background:#3ecf5a"></span> '+f(k)+' gün kalan</span></div><div class="ob-izs" style="grid-template-columns:repeat('+Math.min(14,Math.max(1,tt))+',minmax(0,1fr))">'+boxes+'</div>'+
   '<div class="oa-grid2" style="grid-template-columns:repeat(4,minmax(0,1fr));gap:8px"><div><span class="oa-sub">Hak</span><br><b>'+S.hak+'</b></div><div><span class="oa-sub">Avans kullanılan</span><br><b>'+S.kul+'</b></div><div><span class="oa-sub">Devreden</span><br><b>'+S.dev+'</b></div><div><span class="oa-sub">Kalan</span><br><b style="color:#6be585">'+f(k)+'</b></div></div>'+(S.kul>0?'<span class="oa-sub">Kullanılan '+S.kul+' gün, hak doğmadan önce avans izin olarak kullanıldı ve hakkından düşüldü.</span>':'');
  var planlar=pick(m),satirlar=planlar.map(function(it){return '<div class="ob-gr" style="flex-direction:column;align-items:stretch;gap:6px"><div class="ob-satir"><b style="font-size:13.5px">'+esc(it.n)+'</b><span class="oa-sub">'+esc(it.r)+'</span><span class="ob-et g sag">'+f(it.c)+' gün izin → '+it.o+' gün tatil</span></div><div style="display:flex;gap:3px">'+strip(it.st)+'</div>'+it.L.map(function(l){var p=PL[l[3]];return '<div class="ob-satir"><span class="oa-dday" style="min-width:70px">'+esc(l[0])+'</span><span style="flex:1;font-size:13px">'+esc(l[1])+'</span>'+(ap&&p?'<button type="button" class="ob-pst s'+p.s+'" onclick="cyc(\''+jq(l[3])+'\')" aria-label="Plan durumu: '+PSAD[p.s]+'">'+PSAD[p.s]+'</button>':'<span class="ob-et">1 gün</span>')+'</div>'}).join('')+'</div>'}).join('');
  var sag='<div class="oa-hd">'+OA.ico('linear-gradient(160deg,#c4b0ff,#7c3aed)','tik')+'<span class="oa-tl">İzin planları</span>'+sekmeIc([['A','En iyi plan'],['B','Yedekli plan']],sp,'OB.izPlan')+'</div>'+
   '<div class="ob-satir"><span class="oa-sub">Yedekli plan için saklanacak gün:</span><button type="button" class="oa-chip'+(res==2?' on':'')+'" style="height:32px;padding:0 12px" onclick="OB.izYedek(2)">2 gün</button><button type="button" class="oa-chip'+(res==3?' on':'')+'" style="height:32px;padding:0 12px" onclick="OB.izYedek(3)">3 gün</button><span class="sag">'+(ap?'<span class="ob-et g">Uygulandı</span>':'<button type="button" class="oa-btn sm" onclick="applyPlan(selP)">Bu planı uygula</button>')+'</span></div>'+
   (planlar.length?'<div class="ob-liste">'+satirlar+'</div>':'<span class="oa-sub">Bu plan için yeterli izin günü yok.</span>')+'<span class="oa-sub">Toplam '+f(x.c)+' gün izin · plan sonrası kalan '+f(Math.max(0,k-x.c))+' gün · köprü önerileri hafta sonu ve resmî tatilleri birleştirir. Durum etiketine dokununca Taslak → Onay bekliyor → Onaylandı değişir. Bayram tarihleri resmî takvim yayınlanınca eklenir. İzin işveren onayı olmadan kullanılamaz.</span>';
  h+='<div class="oa-grid2">'+OA.kart('',sol,0)+OA.kart('',sag,.08)+'</div>'}
 else{var Z=OB.izSayilar(),mz=Z.h.mazeret.length,uc=Z.h.ucretsiz.length,ref=Z.refK,r13=Z.h.rapor13.length,r4=Z.h.rapor4.length,kapali=ref>=S.ref,
  satir=function(ad,renk,deger,w,not){return '<div class="ob-mz"><span class="t"><span><span class="ob-sw" style="background:'+renk+'"></span>'+ad+'</span><b style="font-weight:600">'+deger+'</b></span><span class="ob-mzb"><i style="width:'+w+'%;background:'+renk+'"></i></span><span class="oa-sub">'+not+'</span></div>'};
  var sol2='<div class="oa-hd"><span class="oa-tl">Mazeret ve diğer izinler · '+Z.y+'</span></div>'+
   satir('Mazeret izni','#f5a524',mz+' gün',mz?100:0,'Turuncu · yasal ücretli mazeret hakları Ayarlar › Hukuki Sorumluluk’ta')+
   satir('Ücretsiz izin','#f87171',uc+' gün',uc?100:0,'Kırmızı · maaştan düşer')+
   satir('Refakat izni','#3ecf5a',ref+' / '+S.ref+' gün',S.ref?ref/S.ref*100:0,'Yılbaşında sıfırlanır; kullanılmayan gün Ocak maaşına eklenir. '+S.ref+' dolunca yeni giriş kapanır.')+
   satir('Raporlu · 1–3. gün (ilk 3 ardışık gün)','#f5a524',r13+' gün',Math.min(100,r13*33),'Turuncu · yalnız iş günleri sayılır; sayım haftalar arası devam eder')+
   satir('Raporlu · 4. günden itibaren (ücretli)','#3ecf5a',r4+' gün',Math.min(100,r4*20),'Yeşil · '+S.rap+'. günden itibaren ücretli')+
   '<div class="ob-liste">'+['mazeret','ucretsiz','refakat','rapor13','rapor4'].reduce(function(a,t){return a.concat(Z.h[t].slice(0,4).map(function(k){return '<button type="button" class="ob-gr tik" style="border:1px solid rgba(255,255,255,.06);color:inherit;font-family:inherit;text-align:left" onclick="OB.gunAc(\''+k+'\')"><span class="ob-sw" style="background:'+IZR[t]+'"></span><span style="flex:1;font-size:13px">'+esc(lab(k))+'</span><span class="oa-sub">'+esc(TN[t])+'</span></button>'}))},[]).join('')+'</div>';
  var dts=OB.izf,sag2='<div class="oa-hd"><span class="oa-tl">İzin kaydı</span></div><div class="ob-form"><label class="oa-zl">İzin türü<select id="obIt" class="oa-in" onchange="OB.izf.t=this.value">'+[['mazeret','Mazeret izni'],['ucretsiz','Ücretsiz izin'],['refakat','Refakat izni'+(kapali?' (hak doldu)':'')],['rapor13','Raporlu'],['yillik','Yıllık izin']].map(function(x){return '<option value="'+x[0]+'"'+(dts.t==x[0]?' selected':'')+(x[0]=='refakat'&&kapali?' disabled':'')+'>'+x[1]+'</option>'}).join('')+'</select></label>'+
   '<div class="oa-grid2" style="gap:8px"><label class="oa-zl">Başlangıç<input id="obIb" class="oa-in" type="date" value="'+esc(dts.b)+'" onchange="OB.izf.b=this.value"></label><label class="oa-zl">Bitiş<input id="obIs" class="oa-in" type="date" value="'+esc(dts.s)+'" onchange="OB.izf.s=this.value"></label></div><label class="oa-zl">Açıklama<input id="obIa" class="oa-in" type="text" placeholder="Kısa not" value="'+esc(dts.a)+'" oninput="OB.izf.a=this.value"></label>'+
   (dts.er?'<div class="ob-uy" role="alert">'+esc(dts.er)+'</div>':'')+'<button type="button" class="oa-btn" onclick="OB.izKaydet()" style="justify-content:center">Kaydet</button>'+(dts.ok?'<span class="ob-ok" role="status">'+esc(dts.ok)+'</span>':'')+'<span class="oa-sub">'+(kapali?'Refakat '+S.ref+' günü doldu; yeni refakat girişi kapalı.':'Raporlu: yalnız iş günleri işlenir; ilk 3 ardışık gün turuncu, 4. günden itibaren yeşil. Dolu günler atlanır.')+'</span></div>';
  h+='<div class="oa-grid2">'+OA.kart('',sol2,0)+OA.kart('',sag2,.08)+'</div>'}
 return h+'</div>'};
OB.izf={t:'mazeret',b:'',s:'',a:'',er:'',ok:''};
OB.izKaydet=function(){var F=OB.izf,b=OB.keyOf(F.b),s=OB.keyOf(F.s||F.b);F.ok='';if(!b){F.er='Başlangıç tarihini seç';yenile();return false}if(pk(s)<pk(b)){F.er='Bitiş tarihi başlangıçtan önce olamaz';yenile();return false}
 var gunler=[],d=pk(b),e=pk(s);while(d<=e){gunler.push(key(d));d.setDate(d.getDate()+1)}if(gunler.length>31){F.er='En fazla 31 gün girilebilir';yenile();return false}
 var sk=sel,say=0,atla=0,tur=F.t,yilM=pk(TODAY).getFullYear();F.er='';
 if(tur=='refakat'&&refUsed(yilM)>=S.ref){F.er='Refakat izni hakkı bitti ('+S.ref+' gün). Bu yıl başka refakat izni girilemez.';yenile();return false}
 gunler.forEach(function(k){if(!lim(k)){atla++;return}if(D[k]&&D[k]!=tur){atla++;return}if(tur=='refakat'&&refUsed(pk(k).getFullYear())>=S.ref){atla++;return}
  var was=D[k];sel=k;var v=tur;if(v=='rapor13'){var n=0,p=k;while((p=prevWork(p))&&(D[p]=='rapor13'||D[p]=='rapor4'))n++;if(n>=S.rap-1)v='rapor4'}
  D[k]=v;if((IZL[was]||IZL[v])&&was!==v)dayTypeChanged(k);say++;if(F.a){var b2=OB.st();b2.izinNot=b2.izinNot||{};b2.izinNot[k]=F.a}});
 sel=sk;save();F.ok=say+' gün işlendi'+(atla?' · '+atla+' gün atlandı (hafta sonu/tatil/dolu)':'');if(say){F.b='';F.s='';F.a=''}yenile();return say>0};
ORV.sayfa('izinler',{ciz:OB.izinler,baslik:'İş Günleri › İzinler'});
})();
