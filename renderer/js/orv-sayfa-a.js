// Orvane 0.8.0 · Aşama 4A: Anasayfa, Hiyerarşi, Ekip, Ailem (Bütçe, Sağlık, Menü & Market, Satın Alma, Ev İşleri)
// Tasarım: Program kurulum\Tasarim\Main.dc.html (pAna, pAgac, pEk, pAi). Sayfalar ORV.sayfa(...) ile kaydolur.
// GERÇEK VERİ: finans S.finans (sirketim.js), piyasa S.finans.piyasa (TCMB / Otto), çalışanlar TMS()/tm(), görev/mesaj tmTaskNew/tmSend.
// Bu sayfalara özgü kalıcı durum S.orvA içinde (durum.json): cep oranları, bakiyeler, ilaç planı, menü, market, öneriler, ev işleri, kur geçmişi.
// Ortak yardımcılar (sonraki sayfa ajanları): OA.kart/OA.hd/OA.ico/OA.bos/OA.sekmeler/OA.foto/OA.yazKutusu/OA.dlg/OA.say* ve grafik: OA.yol, OA.seri, OA.gauge...
var OA=window.OA||{};
(function(){
var AYK=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],AYU=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
var SMOKE=function(){return typeof INFO!='undefined'&&INFO.smoke};
var fix=function(n,d){return (+n).toFixed(d==null?1:d)};

// ---------- Kalıcı durum ----------
OA.st=function(){if(!S.orvA)S.orvA={};var a=S.orvA;
 a.cep=a.cep||{c:30,e:20};if(a.cep.c==null)a.cep.c=30;if(a.cep.e==null)a.cep.e=20;
 a.bak=a.bak||{};a.hareket=a.hareket||[];a.odeme=a.odeme||[];a.ilac=a.ilac||[];a.menu=a.menu||{};a.market=a.market||[];a.oneri=a.oneri||[];a.ev=a.ev||[];delete a.tg;a.kur=a.kur||{};a.ilacAl=a.ilacAl||{};
 return a};
OA.kaydet=function(){if(typeof save=='function')save()};
OA.saat=function(ts){var d=new Date(ts||Date.now());return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
OA.bugunKey=function(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
OA.tl=function(n){return (Math.round(+n||0)).toLocaleString('tr-TR')+' ₺'};
OA.sayi=function(n,d){return (+n).toLocaleString('tr-TR',{maximumFractionDigits:d==null?2:d,minimumFractionDigits:d==null?0:d})};
OA.tarihSaat=function(ts){var d=new Date(ts||Date.now()),b=new Date();return (d.toDateString()==b.toDateString()?'bugün':d.getDate()+' '+AYK[d.getMonth()])+' '+OA.saat(ts)};
OA.gunKisa=function(t){var p=String(t||'').split('-');return p.length==3?(+p[2])+' '+AYK[+p[1]-1]:String(t||'')};
OA.yuzde=function(n){return (n>0?'+':'')+(Math.round(n*10)/10).toLocaleString('tr-TR')+'%'};

// ---------- Çalışan bilgisi (tasarımdaki tablo; calisanlar.json değişmez) ----------
var GR={yonetim:'linear-gradient(135deg,#ff8a3d,#ffc24a)',aile:'linear-gradient(135deg,#ff7ac6,#a855f7)',is:'linear-gradient(135deg,#38d6f0,#3b82f6)',plan:'linear-gradient(135deg,#6ee7b7,#16a34a)',teknik:'linear-gradient(135deg,#fde68a,#f59e0b)',servis:'linear-gradient(135deg,#e5e7eb,#6b7280)',diger:'linear-gradient(135deg,#8f9bb3,#5b6578)'};
OA.DEPAD={yonetim:'Yönetim',aile:'Aile',is:'İş',plan:'Plan & İletişim',teknik:'Teknik',servis:'Ortak servis',diger:'Diğer'};
OA.DEPRENK={yonetim:'#ff8a3d',aile:'#ff7ac6',is:'#38d6f0',plan:'#6ee7b7',teknik:'#fbbf24',servis:'#9ca3af',diger:'#8f9bb3'};
OA.P={
 orin:{g:'yonetim',un:'CEO',bag:'Çağlar',ajan:'Yönetim',is:'Herkesi denetler, işi Orla’ya verir, başarılı ve başarısız işleri Çağlar’a raporlar; çok önemli kararları sorar.'},
 orla:{g:'yonetim',un:'Koordinatör',bag:'Orin',ajan:'Yönetim',is:'İşi dağıtır, ekibi denetler, hatalı işi düzeltmeden yukarı geçirmez.'},
 nika:{g:'yonetim',un:'İK Müdürü',bag:'Orla',ajan:'Yönetim',is:'Yeni çalışan profillerini ve gereken yetenekleri hazırlar.'},
 sage:{g:'servis',un:'Araştırmacı',bag:'Orla (ortak servis)',ajan:'Çağıran ajan',is:'Herkes için araştırma yapar; maliyeti çağıran ajana yazılır.'},
 mia:{g:'aile',un:'Aile Yöneticisi',bag:'Orla',ajan:'Ev',is:'Aile işlerinde tek muhatap; Çağlar ve Kübra’ya yanıt verir.'},
 otto:{g:'aile',un:'Finans U.',bag:'Mia',ajan:'Ev',is:'Gelir-gider kaydı; Çağlar ve Kübra bakiyelerini ayrı tutar.'},
 iris:{g:'aile',un:'Sağlık Y.K.',bag:'Mia',ajan:'Ev',is:'Sağlık takibi ve günlük ilaç planı. Tanı koymaz, doz önermez.'},
 marco:{g:'aile',un:'Aşçı',bag:'Mia',ajan:'Ev',is:'Yemek menüsü ve market listesi.'},
 nerya:{g:'aile',un:'Satın Alma U.',bag:'Mia · Otto',ajan:'Ev',is:'Alışveriş araştırır, yalnızca öneri sunar; kararı Çağlar verir.'},
 echo:{g:'is',un:'İş Raporu',bag:'Orla',ajan:'İş',is:'Günlük iş raporu ve kayıtlar.'},
 vera:{g:'is',un:'Kalite Kontrol',bag:'Orla',ajan:'İş',is:'İş standartları ve kalite kontrol.'},
 luca:{g:'is',un:'Proje Arama',bag:'Orla',ajan:'İş',is:'Çağlar’ın kendi notlarında proje ve çizim arar.'},
 remy:{g:'plan',un:'Takvim',bag:'Orla',ajan:'Plan ve iletişim',is:'Takvim ve hatırlatmalar.'},
 cleo:{g:'plan',un:'Yazışma',bag:'Orla',ajan:'Plan ve iletişim',is:'Yazışma ve mesaj taslakları.'},
 ada:{g:'teknik',un:'Kod · Geliştirme',bag:'Orla',ajan:'Teknik',is:'Program ve kod yazımı, güncellemeler.'},
 kai:{g:'teknik',un:'Bakım Onarım',bag:'Orla',ajan:'Teknik',is:'Hata ayıklama ve optimizasyon; Ada ile birlikte çalışır.'}};
OA.bilgi=function(c){var p=OA.P[c.id]||{};return{g:p.g||'diger',un:p.un||c.gorev||'',bag:p.bag||c.bagli||'Orla',ajan:p.ajan||'—',is:(typeof tmDesc=='function'?(p.is||tmDesc(c)):p.is)||''}};
OA.grad=function(g){return GR[g]||GR.diger};
OA.foto=function(id){var c=typeof tm=='function'?tm(id):null;return c&&c.foto?'../'+c.foto:''};
OA.imgAv=function(id,cls,st){var u=OA.foto(id);return u?'<img class="'+(cls||'oa-av')+'" src="'+esc(u)+'" alt=""'+(st?' style="'+st+'"':'')+'>':'<span class="'+(cls||'oa-av')+'" style="display:inline-flex;align-items:center;justify-content:center;background:#26262a;font-weight:700;'+(st||'')+'">'+esc((id||'?').charAt(0).toUpperCase())+'</span>'};
// durum: 'hz' hazır, 'cl' görevde, '' çevrimdışı (tmStat: ok/bz/id)
OA.durum=function(c){var s=typeof tmStat=='function'?tmStat(c):'id';return s=='bz'?'cl':s=='ok'?'hz':''};
OA.durumYazi=function(c){var d=OA.durum(c);return d=='cl'?'Görev üzerinde':d=='hz'?'Bağlı ve hazır':'Çevrimdışı'};

// ---------- Ortak parçalar ----------
OA.ico=function(grad,ikon,boyut,st){return '<span class="oa-ico" style="background:'+grad+(st||'')+'">'+ORV.svg(ikon,boyut||20,2.1)+'</span>'};
OA.hd=function(ic,baslik,sag){return '<div class="oa-hd">'+ic+'<span class="oa-tl">'+baslik+'</span>'+(sag||'')+'</div>'};
OA.kp=function(t,k){return '<span class="oa-kp '+(k||'n')+'">'+esc(t)+'</span>'};
OA.kart=function(ic,html,gec,ekstra){return '<section class="oa-card'+(ekstra?' '+ekstra:'')+'" style="animation-delay:'+(gec||0)+'s">'+(ic||'')+html+'</section>'};
OA.bos=function(ikon,baslik,alt,yukseklik){return '<div class="oa-empty"'+(yukseklik?' style="min-height:'+yukseklik+'px"':'')+'>'+ORV.svg(ikon||'grafik',40,1.6)+'<b>'+esc(baslik||'Veri bekleniyor')+'</b>'+(alt?'<span>'+esc(alt)+'</span>':'')+'</div>'};
OA.sekmeler=function(liste,aktif,fn){return '<div class="oa-tabs" role="tablist">'+liste.map(function(x){return '<button type="button" role="tab" aria-selected="'+(x[0]==aktif)+'" class="oa-tab'+(x[0]==aktif?' on':'')+'" onclick="'+fn+'(\''+x[0]+'\')">'+esc(x[1])+'</button>'}).join('')+'</div>'};
OA.baslik=function(h,alt,sag,solSimge){return '<div class="oa-top"><div style="display:flex;align-items:center;gap:14px;min-width:0">'+(solSimge||'')+'<div class="oa-ttl"><h1>'+esc(h)+'</h1><span class="oa-s">'+alt+'</span></div></div>'+(sag||'')+'</div>'};
OA.yok=function(a){return !a||!a.length};
// Küçük pencere (eski #ov kutusu üzerinde)
OA.dlg=function(html){var o=document.getElementById('ov');if(!o)return;o.innerHTML='<div class="dl"><div class="oa-dlg">'+html+'</div></div>';o.style.display='flex';setTimeout(function(){var e=o.querySelector('input,textarea');if(e)e.focus()},30)};
OA.dlgKapat=function(){if(typeof cfNo=='function')cfNo()};
OA.gec=function(i,s){return ((i||0)*(s||.06)).toFixed(2)};

// ---------- Sayarak artan rakamlar ----------
// <span class="oa-say" data-v="1234" data-f="tl|int|pct|dec2">metin</span>
OA.sayFmt=function(v,f){return f=='tl'?OA.tl(v):f=='pct'?'%'+Math.round(v):f=='dec2'?OA.sayi(v,2):f=='usd'?OA.sayi(v,2)+' $':String(Math.round(v))};
OA.say=function(v,f,metin){return '<span class="oa-say" data-v="'+(+v||0)+'" data-f="'+f+'">'+(metin!=null?metin:OA.sayFmt(v,f))+'</span>'};
OA.sayAnim=function(root){if(!root)return;var L=root.querySelectorAll('.oa-say');if(!L.length)return;var hizli=SMOKE()||(ORV.azalt&&ORV.azalt());
 [].forEach.call(L,function(e){var v=+e.getAttribute('data-v'),f=e.getAttribute('data-f'),txt=e.textContent;if(hizli||!isFinite(v)||v==0||e._say)return;e._say=1;var t0=null,dur=1000;
  function adim(t){if(t0==null)t0=t;var p=Math.min(1,(t-t0)/dur),k=1-Math.pow(1-p,3);e.textContent=p>=1?txt:OA.sayFmt(v*k,f);if(p<1&&document.body.contains(e))requestAnimationFrame(adim)}
  e.textContent=OA.sayFmt(0,f);requestAnimationFrame(adim)})};

// ---------- SVG grafik yardımcıları (CDN yok) ----------
OA.seri=function(v,W,H,mn,mx){var n=v.length;mn=mn==null?Math.min.apply(null,v):mn;mx=mx==null?Math.max.apply(null,v):mx;var r=(mx-mn)||1;return v.map(function(x,i){return[n>1?i*W/(n-1):W/2,H-4-((x-mn)/r)*(H-8)]})};
OA.yol=function(p){return p.length?'M'+p.map(function(a){return fix(a[0],1)+' '+fix(a[1],1)}).join(' L'):''};
OA.alan=function(p,W,H){return p.length?OA.yol(p)+' L'+fix(p[p.length-1][0],1)+' '+H+' L'+fix(p[0][0],1)+' '+H+' Z':''};
// Gruplu çubuk yolları (iki seri): [{d:...,}]
OA.cubuk=function(v,W,H,mx,x0,gen,taban){var n=v.length,s=W/n,b=gen*s,out='';taban=taban==null?H-10:taban;v.forEach(function(x,i){if(!(x>0))return;var h=Math.max(2,x/mx*(taban-6)),x1=i*s+x0*s;out+='M'+fix(x1,1)+' '+taban+' V'+fix(taban-h,1)+' H'+fix(x1+b,1)+' V'+taban+' Z '});return out};
OA.gauge=function(oran){oran=Math.max(0,Math.min(1,oran||0));return{dash:fix(oran*201,1),ibre:fix(-90+oran*180,0)}};

// ---------- Yazma kutusu (Hiyerarşi kartı ve Ekip çalışan sayfası ortak) ----------
// OA.yazKutusu(kimlik, kip, kuyruk): kip 'gorev'|'mesaj'|'not'; gönderme işlevleri mevcut sistemdekilerdir.
OA.KIPLER={gorev:{ad:'Görev ver',alt:'Doğrudan görev · Orin/Orla’yı atlar',yer:'Görevi yaz…',ikon:'arti'},mesaj:{ad:'Mesaj',alt:'Çalışana mesaj',yer:'Mesajını yaz…',ikon:'mesaj'},not:{ad:'Not',alt:'Çevrimdışıyken de saklanır',yer:'Notunu yaz…',ikon:'not'}};
OA.gonder=function(id,kip,metin){var c=tm(id);if(!c)return{ok:false,m:'Çalışan bulunamadı'};metin=String(metin||'').trim();if(!metin)return{ok:false,m:'Önce bir şey yaz'};
 var on=typeof tmOnline=='function'?tmOnline():true;
 if(kip=='gorev'){tmTaskNew(id,metin,'normal','',id!='orin');return{ok:true,m:c.ad+'’ya görev verildi'}}
 if(kip=='mesaj'){tmSend(id,metin,on?'mesaj':'not');return{ok:true,m:on?'Mesaj gönderildi':'Çevrimdışı · not olarak saklandı, bağlanınca iletilir'}}
 if(kip=='not'){tmSend(id,metin,'not');return{ok:true,m:on?'Not kaydedildi':'Not saklandı · bağlanınca iletilir'}}
 return{ok:false,m:'Bilinmeyen tür'}};
// Çalışanın geçmişi: görev, mesaj, not (en yeni üstte)
OA.gecmis=function(id,n){var L=[];if(typeof TMS!='function')return L;var T=TMS();
 T.gorev.filter(function(g){return g.kim==id&&g.yol=='dogrudan'}).forEach(function(g){L.push({tur:'Görev',t:g.metin,ts:g.ts})});
 (T.sohbet[id]||[]).forEach(function(m){if(m.r=='ben')L.push({tur:m.tur=='not'?'Not':m.tur=='ses'?'Sesli':'Mesaj',t:m.t,ts:m.ts})});
 T.not.filter(function(x){return x.kim==id&&x.durum=='bekliyor'}).forEach(function(x){L.push({tur:'Not',t:x.metin+' (bekliyor)',ts:x.ts})});
 L.sort(function(a,b){return (b.ts||0)-(a.ts||0)});return L.slice(0,n||8)};
OA.tarihKisa=function(ts){if(!ts)return '';var d=new Date(ts),b=new Date();return d.toDateString()==b.toDateString()?OA.saat(ts):d.getDate()+' '+AYK[d.getMonth()]};
OA.gecmisHtml=function(id){var L=OA.gecmis(id);return L.length?L.map(function(h){return '<div class="oa-rdh"><span class="oa-rdht">'+esc(h.tur)+'</span><span style="flex:1;min-width:0;font-size:12.5px;line-height:17px;color:#d8d8dc;overflow-wrap:anywhere">'+esc(String(h.t).slice(0,140))+'</span><span class="oa-sub" style="flex:none">'+OA.tarihKisa(h.ts)+'</span></div>'}).join(''):'<span class="oa-sub" style="padding:4px 2px 6px">Henüz gönderilen bir şey yok.</span>'};

// ========================================================================
// ANASAYFA
// ========================================================================
var KATR=['#ff8a3d','#a78bfa','#38d6f0','#3ecf5a','#f472b6','#fbbf24','#9ca3af'];
OA.aylar=function(n){var d=new Date(),r=[];for(var i=n-1;i>=0;i--){var x=new Date(d.getFullYear(),d.getMonth()-i,1);r.push(x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0'))}return r};
OA.fin=function(){var f=typeof fnS=='function'?fnS():{kayit:[],katki:[],ayar:{},piyasa:{}},A=OA.aylar(6),T=A.map(function(ay){try{return fnAyToplam(ay)}catch(e){return{gelir:0,gider:0,net:0,isletme:0,abonelik:0,token:0}}});
 var bu=T[5],once=T[4],var0=T.some(function(x){return x.gelir>0||x.gider>0});
 // kategori: bu ayın giderleri (kalem) + abonelik + token
 var g={};f.kayit.forEach(function(k){if(fnAy(k.tarih)==A[5]&&k.tur=='gider')g[k.kalem]=(g[k.kalem]||0)+(+k.tutar||0)});if(bu.abonelik)g['Claude aboneliği']=(g['Claude aboneliği']||0)+bu.abonelik;if(bu.token)g['API token']=(g['API token']||0)+bu.token;
 var top=Object.keys(g).map(function(k){return[k,g[k]]}).sort(function(a,b){return b[1]-a[1]}),sum=top.reduce(function(s,x){return s+x[1]},0),kat=top.slice(0,6).map(function(x,i){return{ad:x[0],tutar:x[1],p:sum?Math.round(x[1]/sum*100):0,renk:KATR[i]}});if(top.length>6){var r=top.slice(6).reduce(function(s,x){return s+x[1]},0);kat.push({ad:'Diğer',tutar:r,p:sum?Math.round(r/sum*100):0,renk:KATR[6]})}
 var hk=function(kim,ay){return f.kayit.filter(function(k){return k.hk==kim&&k.tur=='gider'&&(!ay||fnAy(k.tarih)==ay)}).reduce(function(s,k){return s+(+k.tutar||0)},0)};
 return{A:A,T:T,bu:bu,once:once,var0:var0,kat:kat,katTop:sum,hk:hk,f:f}};
OA.odemeler=function(){var a=OA.st(),ay=OA.bugunKey().slice(0,7);return a.odeme.filter(function(o){return !o.odendi&&String(o.tarih).slice(0,7)<=ay}).sort(function(x,y){return String(x.tarih).localeCompare(String(y.tarih))})};
OA.cep=function(F){var a=OA.st(),d=new Date(),ayGun=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(),kalanGun=Math.max(1,ayGun-d.getDate()+1),bek=OA.odemeler().reduce(function(s,o){return s+(+o.tutar||0)},0),ay=OA.bugunKey().slice(0,7),bugun=OA.bugunKey();
 var hkTop=F.hk('c',ay)+F.hk('e',ay),kalan=F.var0?F.bu.gelir-(F.bu.gider-hkTop)-bek:null;
 function kisi(k,oran){var harcanan=F.hk(k,ay),bkK=a.bak&&a.bak[k=='c'?'cagla':'kubra'],har=a.cep.mod=='bakiye'?(k=='e'&&!oran?null:(bkK?Math.max(0,bkK.t)+harcanan:null)):(kalan==null?null:Math.max(0,kalan)*oran/100),bugunH=F.f.kayit.filter(function(x){return x.hk==k&&x.tur=='gider'&&x.tarih==bugun}).reduce(function(s,x){return s+(+x.tutar||0)},0),kal=har==null?null:har-harcanan,limit=kal==null?null:Math.max(0,kal)/kalanGun;
  return{aile:a.cep.mod=='bakiye'&&k=='e'&&!oran,oran:oran,har:har,harcanan:harcanan,kal:kal,limit:limit,bugunKal:limit==null?null:limit-bugunH,kalanP:har?Math.max(0,Math.min(100,kal/har*100)):0,harcananP:har?Math.max(0,Math.min(100,harcanan/har*100)):0}}
 return{kalan:kalan,bek:bek,c:kisi('c',a.cep.c),e:kisi('e',a.cep.e),toplam:a.cep.c+a.cep.e,kalanGun:kalanGun}};
OA.cepUyari=function(k,oran){var a=OA.st(),r=k=='c'?[20,35]:[15,30],ad=k=='c'?'Çağlar':'Eşi',m=[];
 if(!(oran>=0&&oran<=100))m.push('Hatalı değer: yüzde 0–100 arasında olmalı.');else if(oran<r[0]||oran>r[1])m.push(ad+' için öneri aralığı %'+r[0]+'–'+r[1]+'. Bu değer aralığın dışında.');
 if(a.cep.c+a.cep.e>50)m.push('Toplam %'+(a.cep.c+a.cep.e)+' oldu; en fazla %50 önerilir.');return m.join(' ')};
OA.cepAdim=function(k,yon){var a=OA.st(),v=(k=='c'?a.cep.c:a.cep.e)+yon*5;v=Math.max(0,Math.min(100,v));if(k=='c')a.cep.c=v;else a.cep.e=v;a.cep[k=='c'?'kc':'ke']=Date.now();OA.kaydet();
 try{if(typeof tm=='function'&&tm('otto'))tmPush('otto',{r:'sys',t:'Cep harçlığı oranı güncellendi: Çağlar %'+a.cep.c+', eşi %'+a.cep.e+' (kalan paranın yüzdesi).'})}catch(e){}
 ORV.yenile()};
// kur geçmişi: her gün görülen son değer birikir (grafikler gerçek veriden çizilir)
OA.kurDeger=function(){var f=typeof fnS=='function'?fnS():{piyasa:{}},p=f.piyasa||{},t=p.tcmb&&p.tcmb.kur,o=p.otto&&p.otto.veri||{},n=function(x){x=+x;return isFinite(x)&&x>0?x:null};
 return{usd:n(t&&t.usd&&t.usd.satis)||n(o.usd),eur:n(t&&t.eur&&t.eur.satis)||n(o.eur),au:n(p.tcmb&&p.tcmb.altin&&p.tcmb.altin.gram)||n(o.gram_altin),tarih:p.tcmb&&p.tcmb.tarih||'',otto:p.otto&&p.otto.ts||0}};
OA.kurKaydet=function(){var a=OA.st(),v=OA.kurDeger(),k=OA.bugunKey(),e=a.kur[k]||{},ch=false;['usd','eur','au'].forEach(function(x){if(v[x]!=null&&e[x]!==v[x]){e[x]=v[x];ch=true}});if(ch){a.kur[k]=e;var ks=Object.keys(a.kur).sort();while(ks.length>400){delete a.kur[ks.shift()]}OA.kaydet()}return v};
OA.kurSeri=function(x,n){var a=OA.st(),ks=Object.keys(a.kur).sort(),r=[];ks.forEach(function(k){if(a.kur[k][x]!=null)r.push(a.kur[k][x])});return r.slice(-n)};
var _kurDeneme=0;
OA.kurGecmis=function(){var a=OA.st();if(SMOKE()||!window.API||!API.piyasa||!API.piyasa.gecmis||a.kurGecmisGun==OA.bugunKey())return;
 API.piyasa.gecmis().then(function(r){if(!r||!r.ok||!r.v||!r.v.gun)return;var g=r.v.gun,n=0;Object.keys(g).forEach(function(d){var e=a.kur[d]||{};['usd','eur'].forEach(function(x){if(e[x]==null&&g[d][x]>0){e[x]=g[d][x];n++}});a.kur[d]=e});
  var ks=Object.keys(a.kur).sort();while(ks.length>400){delete a.kur[ks.shift()]}a.kurGecmisGun=OA.bugunKey();OA.kaydet();if(n&&area=='orv'&&pg=='anasayfa')ORV.yenile()},function(){})};
OA.kurCek=function(){OA.kurGecmis();if(SMOKE()||typeof fnTcmb!='function')return;var p=fnS().piyasa;if(Date.now()-_kurDeneme<10*60e3)return;_kurDeneme=Date.now();try{var pr=fnTcmb(false);if(pr&&pr.then)pr.then(function(){if(area=='orv'&&pg=='anasayfa'&&!OA._yen){OA._yen=1;ORV.yenile();setTimeout(function(){OA._yen=0},3000)}},function(){})}catch(e){}};
// 0.9.3: Hafta / Ay / Yıl — değişim, aralığın başındaki son kayıtlı günle bugünkü değer arasında; grafik o aralığı çizer
OA.KAR=[['h','Hafta',7],['a','Ay',30],['y','Yıl',365]];
OA.gunKey=function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
OA.kurAr=function(x){var a=OA.st();return (a.kurAr&&a.kurAr[x])||'a'};
OA.kurArSec=function(x,k){var a=OA.st();a.kurAr=a.kurAr||{};a.kurAr[x]=k;OA.kaydet();ORV.yenile()};
OA.kurDegisim=function(x,gun){var a=OA.st(),ks=Object.keys(a.kur).filter(function(k){return a.kur[k][x]!=null}).sort();if(ks.length<2)return{yok:true,n:ks.length};
 var d=new Date();d.setDate(d.getDate()-gun);var hedef=OA.gunKey(d),bas=null;ks.forEach(function(k){if(k<=hedef)bas=k});
 var son=a.kur[ks[ks.length-1]][x];if(!bas)return{yok:true,n:ks.length,ilk:ks[0]};var v0=a.kur[bas][x];return{p:(son-v0)/v0*100,bas:bas,v0:v0}};
OA.kurSeriGun=function(x,gun){var a=OA.st(),d=new Date();d.setDate(d.getDate()-gun);var h=OA.gunKey(d),ks=Object.keys(a.kur).sort(),r=[];ks.forEach(function(k){if(k>=h&&a.kur[k][x]!=null)r.push(a.kur[k][x])});return r};
OA.kurCizgi=function(s,renk,id){var p=OA.seri(s,300,130);return '<svg class="oa-chart" viewBox="0 0 300 130" preserveAspectRatio="none" aria-hidden="true" style="height:130px"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+renk+'" stop-opacity=".35"/><stop offset="1" stop-color="'+renk+'" stop-opacity="0"/></linearGradient></defs><path class="oa-afill" d="'+OA.alan(p,300,130)+'" fill="url(#'+id+')"/><path class="oa-draw" d="'+OA.yol(p)+'" fill="none" stroke="'+renk+'" stroke-width="2.2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>'};
OA.kurKarti=function(k,gec){var v=OA.kurKaydet(),son=v[k.x],ar=OA.kurAr(k.x),A=OA.KAR.filter(function(z){return z[0]==ar})[0]||OA.KAR[1],S1=OA.kurSeriGun(k.x,A[2]),dg=OA.kurDegisim(k.x,A[2]);
 var ic=OA.ico(k.grad,k.ikon,20,k.ist||''),kpl=dg.yok?OA.kp('—','n'):OA.kp(OA.yuzde(dg.p),dg.p>=0?'g':'r');
 var fiyat=son!=null?'<b class="oa-num">'+OA.say(son,'dec2',OA.sayi(son,2)+' ₺')+'</b>':'<b class="oa-num" style="color:var(--yazi3)">—</b>',ch;
 var seg='<div class="oa-kseg" role="group" aria-label="'+esc(k.ad)+' değişim aralığı">'+OA.KAR.map(function(z){var d=OA.kurDegisim(k.x,z[2]),on=z[0]==ar;return '<button type="button" class="oa-ksb'+(on?' on':'')+'" aria-pressed="'+on+'" onclick="OA.kurArSec(\''+k.x+'\',\''+z[0]+'\')"><span>'+z[1]+'</span><b class="'+(d.yok?'n':d.p>=0?'g':'r')+'">'+(d.yok?'—':OA.yuzde(d.p))+'</b></button>'}).join('')+'</div>';
 if(S1.length<2)ch=OA.bos('grafik','Veri bekleniyor','Geçmiş her gün birikir ('+S1.length+'/2 gün). '+(son==null?'Kaynak bağlanınca değer burada görünür.':''),110);
 else ch=S1.length>60&&k.cizUzun?k.cizUzun(S1):k.ciz(S1);
 var not=dg.yok?'<span class="oa-sub">'+A[1]+'lık değişim için geçmiş birikiyor'+(dg.ilk?' (ilk kayıt '+esc(OA.gunKisa?OA.gunKisa(dg.ilk):dg.ilk)+')':'')+'.</span>':'<span class="oa-sub">'+esc(OA.gunKisa?OA.gunKisa(dg.bas):dg.bas)+' · '+OA.sayi(dg.v0,2)+' ₺ → bugün '+OA.sayi(son!=null?son:dg.v0,2)+' ₺</span>';
 var tah='<div class="oa-fc"><span>Tahmin · 7 gün</span><span class="oa-pbar" title="Otto tahmin üretince görünür"></span><span class="oa-pr" style="white-space:nowrap;color:var(--yazi3)">Otto bekleniyor</span></div>';
 return OA.kart(OA.hd(ic,k.ad,kpl),'<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">'+fiyat+'<span class="oa-sub">'+A[1]+' · '+k.tip+'</span></div>'+seg+ch+not+tah+
  '<div class="oa-src"><span>Kaynak: '+k.kaynak+' (ücretsiz)</span><span class="oa-srcai">'+OA.imgAv('sage','oa-av','width:20px;height:20px')+OA.imgAv('otto','oa-av','width:20px;height:20px')+'Sage araştırır · Otto tahmin eder</span></div>'+
  '<span class="oa-isb"><span class="oa-isbd"></span>İsabet oranı: veri yok · günde 1 kez, 00:00</span>',gec)};
OA.kurNot='Kaynak: TCMB / Truncgil (ücretsiz) · Sage araştırır · Otto tahmin eder';
OA.anasayfa=function(){
 var F=OA.fin(),C=OA.cep(F),a=OA.st(),d=new Date(),gec=0,bos0=!F.var0,mAd=AYU[d.getMonth()]+' '+d.getFullYear(),kv=OA.kurDeger();
 var h='<div class="oa-pg" id="oaAna">';
 h+=OA.baslik('Anasayfa',mAd+' · aylık özet <span class="oa-pill '+(bos0?'o':'g')+'"><span class="oa-sw" style="background:'+(bos0?'#f5a524':'#3ecf5a')+'"></span>'+(bos0?'Veri bekleniyor · Otto’ya kayıt girilince dolar':'Gerçek veri · Otto kayıtları')+'</span>',
  '<span style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--yazi2)"><span class="oa-live"></span>Piyasa: '+(kv.tarih?'TCMB '+esc(kv.tarih):'veri bekleniyor')+'</span>');
 // --- Satır 1 ---
 h+='<div class="oa-grid5 oa-grid6">';
 // Aylık gelir
 var gv=F.T.map(function(x){return x.gelir}),gel;
 if(bos0)gel=OA.bos('grafik','Veri bekleniyor','Gelir kaydı girilince 6 aylık grafik çizilir.',120);
 else{var gp=OA.seri(gv,240,70,0,Math.max.apply(null,gv)||1);gel='<svg class="oa-chart" viewBox="0 0 240 70" preserveAspectRatio="none" aria-hidden="true" style="height:70px"><defs><linearGradient id="oaGGel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3ecf5a" stop-opacity=".45"/><stop offset="1" stop-color="#3ecf5a" stop-opacity="0"/></linearGradient></defs><path class="oa-afill" d="'+OA.alan(gp,240,70)+'" fill="url(#oaGGel)"/><path class="oa-draw" d="'+OA.yol(gp)+'" fill="none" stroke="#5ee07a" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="oa-ax">'+F.A.map(function(x){return '<span>'+AYK[+x.slice(5)-1]+'</span>'}).join('')+'</span>'}
 var dG=F.once.gelir>0?(F.bu.gelir-F.once.gelir)/F.once.gelir*100:null;
 h+=OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#7cf096,#16a34a)','indir'),'Aylık Gelir',dG==null?OA.kp('—','n'):OA.kp(OA.yuzde(dG),dG>=0?'g':'r')),'<b class="oa-num">'+OA.say(F.bu.gelir,'tl')+'</b><span class="oa-sub">Önceki ay '+OA.tl(F.once.gelir)+'</span>'+gel+'<button type="button" class="oa-btn ghost sm" onclick="OA.fnEkle(\'gelir\')" style="margin-top:auto">+ Gelir ekle</button>',gec+=.02);
 // Aylık gider
 var kat;
 if(!F.kat.length)kat=OA.bos('grafik','Veri bekleniyor','Gider kaydı girilince kategoriler görünür.',120);
 else kat='<div class="oa-stack">'+F.kat.map(function(k,i){return '<span class="oa-stk" style="width:'+k.p+'%;background:'+k.renk+';animation-delay:'+(i*.08)+'s" title="'+esc(k.ad)+'"></span>'}).join('')+'</div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 10px;font-size:11.5px;color:#c9c9cf">'+F.kat.map(function(k){return '<span style="display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden"><span class="oa-sw" style="background:'+k.renk+'"></span><span style="flex:1;overflow:hidden;text-overflow:ellipsis">'+esc(k.ad)+'</span><b style="font-weight:600">%'+k.p+'</b></span>'}).join('')+'</div>';
 var dGi=F.once.gider>0?(F.bu.gider-F.once.gider)/F.once.gider*100:null;
 h+=OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#ffb27a,#ef4444)','yukari'),'Aylık Gider',dGi==null?OA.kp('—','n'):OA.kp(OA.yuzde(dGi),dGi<=0?'g':'r')),'<b class="oa-num">'+OA.say(F.bu.gider,'tl')+'</b><span class="oa-sub">Kategoriye göre dağılım</span>'+kat+'<button type="button" class="oa-btn ghost sm" onclick="OA.fnEkle(\'gider\')" style="margin-top:auto">+ Gider ekle</button>',gec+=.06);
 // Beklenen gider
 var od=OA.odemeler(),bek=C.bek,oran=F.var0&&F.bu.gelir>0?Math.min(1,bek/F.bu.gelir):(bek>0?1:0),G=OA.gauge(oran);
 h+=OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#c4b0ff,#7c3aed)','takvim'),'Beklenen Gider','<button type="button" class="oa-ib" aria-label="Beklenen ödeme ekle" style="width:36px;height:36px" onclick="OA.odemeEkle()">'+ORV.svg('ekle',16,2.4)+'</button>'),
  '<div style="position:relative;height:92px;display:flex;justify-content:center"><svg viewBox="0 0 160 92" aria-hidden="true" style="width:160px;height:92px;overflow:visible"><defs><linearGradient id="oaGBek" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#f472b6"/></linearGradient></defs><path d="M 16 84 A 64 64 0 0 1 144 84" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="14" stroke-linecap="round"/><path class="oa-gauge" d="M 16 84 A 64 64 0 0 1 144 84" fill="none" stroke="url(#oaGBek)" stroke-width="14" stroke-linecap="round" style="stroke-dasharray:'+G.dash+' 202"/><g style="transform:rotate('+G.ibre+'deg);transform-origin:80px 84px;transition:transform 1.2s cubic-bezier(.2,.8,.2,1)"><path d="M 80 84 L 80 32" stroke="#f2f2f3" stroke-width="3" stroke-linecap="round"/></g><circle cx="80" cy="84" r="6" fill="#f2f2f3"/></svg></div>'+
  '<b class="oa-num" style="text-align:center">'+OA.say(bek,'tl')+'</b>'+
  (od.length?'<div style="display:flex;flex-direction:column;gap:4px;font-size:12px">'+od.slice(0,3).map(function(o){var dd=new Date(o.tarih+'T00:00:00');return '<span style="display:flex;align-items:center;gap:8px"><span class="oa-dday">'+(isNaN(dd)?'—':dd.getDate()+' '+AYK[dd.getMonth()])+'</span><span style="flex:1;color:#c9c9cf;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(o.ad)+'</span><b style="font-weight:600">'+OA.tl(o.tutar)+'</b><button type="button" class="oa-ib" aria-label="Ödendi olarak işaretle" style="width:28px;height:28px" onclick="OA.odendi(\''+jq(o.id)+'\')">'+ORV.svg('tik',14,2.6)+'</button></span>'}).join('')+'</div>':'<span class="oa-sub" style="text-align:center">Beklenen ödeme yok. + ile ekle (kira, fatura, taksit…).</span>'),gec+=.1);
 // Cep harçlığı kartları
 function cepKart(k,c,ad,grad,ikon,ring){var oranK=k=='c'?a.cep.c:a.cep.e,uy=OA.cepUyari(k,oranK),kayit=a.cep[k=='c'?'kc':'ke'],ic;
  if(c.aile){var ab=a.bak.aile;ic='<div style="display:flex;flex-direction:column;gap:6px"><span class="oa-sub">Şimdilik cep harçlığı yok; harcamaları Aile Bütçesinden düşer.</span><b class="oa-num">'+(ab?OA.say(ab.t,'tl'):'—')+'</b><span class="oa-sub">Aile Bütçesi kalan · bu ay harcanan '+OA.tl(c.harcanan)+'</span></div>'}
  else if(c.har==null)ic=OA.bos('para','Veri bekleniyor',a.cep.mod=='bakiye'?'Bütçe › Bakiye bildir ile cep harçlığını gir.':'Gelir ve gider kaydı girilince harçlık hesaplanır.',96);
  else if(ring)ic='<div style="display:flex;align-items:center;gap:14px"><div style="position:relative;width:96px;height:96px;flex:none"><svg viewBox="0 0 96 96" aria-hidden="true" style="width:96px;height:96px;transform:rotate(-90deg)"><defs><linearGradient id="oaGCep" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff7a2f"/></linearGradient></defs><circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/><circle class="oa-ring" cx="48" cy="48" r="38" fill="none" stroke="url(#oaGCep)" stroke-width="10" stroke-linecap="round" style="stroke-dasharray:'+fix(c.harcananP/100*239,1)+' 239"/></svg><span style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1"><b style="font-size:20px;font-weight:700">'+OA.say(c.harcananP,'pct')+'</b><span style="font-size:10.5px;color:var(--yazi2);margin-top:3px">harcandı</span></span></div><div style="display:flex;flex-direction:column;gap:4px;min-width:0"><b class="oa-num" style="font-size:22px;line-height:26px">'+OA.say(c.har,'tl')+'</b><span class="oa-sub">Kalan: '+OA.tl(c.kal)+'</span></div></div>';
  else{var ty=Math.round(4+(1-c.kalanP/100)*84);ic='<div style="display:flex;align-items:center;gap:14px"><div class="oa-tank"><svg viewBox="0 0 64 96" aria-hidden="true" style="width:64px;height:96px"><defs><clipPath id="oaClT"><rect x="2" y="2" width="60" height="92" rx="16"/></clipPath><linearGradient id="oaGT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9ad4"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs><rect x="2" y="2" width="60" height="92" rx="16" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/><g clip-path="url(#oaClT)"><g style="transform:translateY('+ty+'px);transition:transform 1.2s cubic-bezier(.2,.8,.2,1)"><path class="oa-wave" d="M0 6 Q 16 0 32 6 T 64 6 T 96 6 T 128 6 V 120 H 0 Z" fill="url(#oaGT)" opacity=".95"/></g></g></svg></div><div style="display:flex;flex-direction:column;gap:4px;min-width:0"><b class="oa-num" style="font-size:22px;line-height:26px">'+OA.say(c.har,'tl')+'</b><span class="oa-sub">Kalan: '+OA.tl(c.kal)+' (%'+Math.round(c.kalanP)+')</span></div></div>'}
  var glim=c.har==null||c.aile?'':'<div class="oa-glim"><span>Günlük limit <b>'+OA.tl(c.limit)+'</b></span><span>Bugün kalan <b style="color:#6be585">'+OA.tl(c.bugunKal)+'</b></span></div>';
  return OA.kart(OA.hd(OA.ico(grad,ikon),'Cep Harçlığı · '+ad,'<button type="button" class="oa-ib" aria-label="'+ad+' harçlık harcaması ekle" style="width:36px;height:36px" onclick="OA.harcamaEkle(\''+k+'\')" title="Harcama ekle">'+ORV.svg('ekle',16,2.4)+'</button>'),ic+glim+
   (a.cep.mod=='bakiye'?'':'<div class="oa-stepr"><span>Kalanın</span><button type="button" class="oa-stb" aria-label="Yüzdeyi azalt" onclick="OA.cepAdim(\''+k+'\',-1)">−</button><b>%'+oranK+'</b><button type="button" class="oa-stb" aria-label="Yüzdeyi artır" onclick="OA.cepAdim(\''+k+'\',1)">+</button>'+(kayit?'<span class="oa-okyt">Otto’ya kaydedildi · '+OA.saat(kayit)+'</span>':'')+'</div>')+
   (uy&&a.cep.mod!='bakiye'?'<div class="oa-uy">'+OA.imgAv('otto','oa-av','width:22px;height:22px')+'<span>'+esc(uy)+'</span></div>':''),gec+=.06)}
 h+=cepKart('c',C.c,'Çağlar','linear-gradient(160deg,#ffd27a,#ff7a2f)','para',true);
 h+=cepKart('e',C.e,'Eşim','linear-gradient(160deg,#ff9ad4,#e14fa0)','kalp',false);
 // Ay özeti (0.9.3): Beklenen Gider'in altında, cep harçlıklarının yanında
 var ozet=[];
 if(bos0)ozet.push('Veri bekleniyor: gelir ve gider kayıtları girilince özetim burada olur.');
 else{ozet.push('Giderler geçen aya göre <b style="color:'+(dGi!=null&&dGi<=0?'#6be585':'#fca5a5')+'">'+(dGi==null?'karşılaştırılamıyor':(dGi<=0?'%'+Math.abs(Math.round(dGi))+' azaldı':'%'+Math.round(dGi)+' arttı'))+'</b>.');
  var dg=d.getDate(),ayGun=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(),tahmin=dg>0?F.bu.gider/dg*ayGun:0;ozet.push('Ay sonu tahmini toplam gider <b>'+OA.tl(Math.max(tahmin,F.bu.gider+C.bek))+'</b>.');
  ozet.push('Beklenen ödemelerden sonra kalan: <b>'+OA.tl(C.kalan)+'</b>.');
  var kdA=typeof OT9!='undefined'&&OT9.butceAy?OT9.butceAy(OA.bugunKey().slice(0,7)):null;if(kdA&&kdA.kd)ozet.push('Bu ay kayıt dışı harcama <b style="color:#fca5a5">'+OA.tl(kdA.kd)+'</b> (bakiye bildirimlerinden).');
  ozet.push('Cep harçlıkları kalanın <b>%'+C.toplam+'</b>’i; birikime <b>%'+Math.max(0,100-C.toplam)+'</b> kalıyor.')}
 ozet.push('Kur tahminlerim günde 1 kez (00:00) yenilenir, 6 ay saklanır; gerçekleşenle karşılaştırıp kendimi düzeltirim.');
 h+=OA.kart(OA.hd(OA.imgAv('otto','oa-av'),'Otto’nun özeti',OA.kp('Finans U.','n')),'<ul class="oa-lis">'+ozet.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul><span style="font-size:11px;color:var(--yazi3);margin-top:auto">Kur tahminleri bilgi amaçlıdır, yatırım tavsiyesi değildir.</span>',gec+=.06);
 h+='</div>';
 // --- Satır 2: kurlar ---
 h+='<div class="oa-grid3">';
 h+=OA.kurKarti({x:'au',ad:'Gram Altın',tip:'mum grafik',cizUzun:function(s){return OA.kurCizgi(s,'#f5c542','oaGAu')},kaynak:'Truncgil',grad:'linear-gradient(160deg,#fff1b8,#e0a32e)',ikon:'para',
  ciz:function(s){var W=300,H=130,mn=Math.min.apply(null,s),mx=Math.max.apply(null,s),r=(mx-mn)||1,y=function(v){return H-6-((v-mn)/r)*(H-12)},n=s.length-1,sw=W/n,bw=Math.min(14,sw*.55),fi='',up='',dn='';
   for(var i=1;i<s.length;i++){var o=s[i-1],c=s[i],hi=Math.max(o,c),lo=Math.min(o,c),x=(i-1)*sw+sw/2;fi+='M'+fix(x,1)+' '+fix(y(hi)-3,1)+' V'+fix(y(lo)+3,1)+' ';var y1=y(hi),y2=Math.max(y(lo),y1+2),rc='M'+fix(x-bw/2,1)+' '+fix(y1,1)+' H'+fix(x+bw/2,1)+' V'+fix(y2,1)+' H'+fix(x-bw/2,1)+' Z ';if(c>=o)up+=rc;else dn+=rc}
   return '<svg class="oa-chart" viewBox="0 0 300 130" preserveAspectRatio="none" aria-hidden="true" style="height:130px"><g class="oa-bars"><path d="'+fi+'" stroke="rgba(255,255,255,.45)" stroke-width="1.2" vector-effect="non-scaling-stroke" fill="none"/><path d="'+up+'" fill="#5ee07a"/><path d="'+dn+'" fill="#f87171"/></g></svg>'}},.32);
 h+=OA.kurKarti({x:'usd',ad:'Dolar · USD/TRY',tip:'çizgi',kaynak:'TCMB',grad:'linear-gradient(160deg,#9be7b6,#15803d)',ikon:'para',
  ciz:function(s){var p=OA.seri(s,300,130);return '<svg class="oa-chart" viewBox="0 0 300 130" preserveAspectRatio="none" aria-hidden="true" style="height:130px"><defs><linearGradient id="oaGUsd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38d6f0" stop-opacity=".35"/><stop offset="1" stop-color="#38d6f0" stop-opacity="0"/></linearGradient></defs><path class="oa-afill" d="'+OA.alan(p,300,130)+'" fill="url(#oaGUsd)"/><path class="oa-draw" d="'+OA.yol(p)+'" fill="none" stroke="#5fe0f5" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>'}},.38);
 h+=OA.kurKarti({x:'eur',ad:'Euro · EUR/TRY',tip:'çizgi',kaynak:'TCMB',grad:'linear-gradient(160deg,#a5b4fc,#4338ca)',ikon:'para',
  ciz:function(s){var W=300,H=130,mn=Math.min.apply(null,s),mx=Math.max.apply(null,s),p=OA.seri(s,W,H),son=p[p.length-1];
   return '<svg class="oa-chart" viewBox="0 0 300 130" preserveAspectRatio="none" aria-hidden="true" style="height:130px"><defs><linearGradient id="oaGEur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#818cf8" stop-opacity=".38"/><stop offset="1" stop-color="#818cf8" stop-opacity="0"/></linearGradient></defs><path class="oa-afill" d="'+OA.alan(p,W,H)+'" fill="url(#oaGEur)"/><path class="oa-draw" d="'+OA.yol(p)+'" fill="none" stroke="#a5b4fc" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/></svg>'+
    '<span class="oa-ax"><span>En düşük '+OA.sayi(mn,2)+' ₺</span><span>En yüksek '+OA.sayi(mx,2)+' ₺</span></span>'}},.44);
 h+='</div>';
 // --- Satır 3 ---
 var mx=Math.max.apply(null,F.T.map(function(x){return Math.max(x.gelir,x.gider)}))||1,nv=F.T.map(function(x){return Math.max(0,x.net)}),sc;
 if(bos0)sc=OA.bos('grafik','Veri bekleniyor','Gelir ve gider kaydı girilince 6 aylık sütunlar çizilir.',150);
 else{var cg=OA.cubuk(F.T.map(function(x){return x.gelir}),600,150,mx,.1,.34),cb=OA.cubuk(F.T.map(function(x){return x.gider}),600,150,mx,.5,.34),np=F.T.map(function(x,i){return[i*100+50,140-6-Math.max(0,x.net)/mx*128]});
  sc='<svg class="oa-chart" viewBox="0 0 600 150" preserveAspectRatio="none" aria-hidden="true" style="height:150px"><path d="M 0 140 H 600" stroke="rgba(255,255,255,.12)" stroke-width="1" vector-effect="non-scaling-stroke"/><g class="oa-bars"><path d="'+cg+'" fill="#3ecf5a"/><path d="'+cb+'" fill="#ff8a3d"/></g><path class="oa-draw" d="'+OA.yol(np)+'" fill="none" stroke="#f2f2f3" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg><span class="oa-ax" style="padding:0 4%">'+F.A.map(function(x){return '<span>'+AYK[+x.slice(5)-1]+'</span>'}).join('')+'</span>'}
 var sw=function(r,t){return '<span style="display:flex;align-items:center;gap:6px"><span class="oa-sw" style="background:'+r+'"></span>'+t+'</span>'};
 h+=OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#5fe0f5,#3b82f6)','grafik'),'Gelir · Gider · Net (6 ay)','<span style="display:flex;gap:12px;font-size:11.5px;color:#c9c9cf">'+sw('#3ecf5a','Gelir')+sw('#ff8a3d','Gider')+sw('#f2f2f3','Net')+'</span>'),sc,.5);
 h+='</div>';return h};
OA.fnEkle=function(t){if(typeof fnDlg=='function')fnDlg(t);else toast('Finans kaydı bu sürümde kullanılamıyor')};
OA.odemeEkle=function(){var b=OA.bugunKey();OA.dlg('<h3>Beklenen ödeme ekle</h3><label class="oa-zl">Ödeme adı<input class="oa-in" id="oaOa" placeholder="ör. Kira"></label><label class="oa-zl">Tutar (₺)<input class="oa-in" id="oaOt" type="number" min="0" step="0.01"></label><label class="oa-zl">Tarih<input class="oa-in" id="oaOd" type="date" value="'+b+'"></label><div class="acts"><button type="button" class="oa-btn ghost" onclick="OA.dlgKapat()">Vazgeç</button><button type="button" class="oa-btn" onclick="OA.odemeKaydet()">Ekle</button></div>')};
OA.odemeKaydet=function(){var ad=document.getElementById('oaOa').value.trim(),t=Math.round((+String(document.getElementById('oaOt').value).replace(',','.')||0)*100)/100,tr=document.getElementById('oaOd').value;if(!ad||!(t>0)){toast('Ad ve tutarı yaz');return}OA.st().odeme.push({id:uid(),ad:ad.slice(0,40),tutar:t,tarih:/^\d{4}-\d{2}-\d{2}$/.test(tr)?tr:OA.bugunKey(),odendi:false});OA.kaydet();OA.dlgKapat();toast('Beklenen ödeme eklendi');ORV.yenile()};
OA.odendi=function(id){var o=OA.st().odeme.filter(function(x){return x.id==id})[0];if(!o||o.odendi)return;o.odendi=true;if(typeof fnKaydet=='function')fnKaydet({tur:'gider',kim:'cagla',tutar:o.tutar,kalem:o.ad,tarih:OA.bugunKey(),not:'Beklenen ödeme'});OA.kaydet();toast(o.ad+' ödendi olarak işaretlendi · gidere yazıldı');ORV.yenile()};
OA.aileden=function(k){var a=OA.st();return k=='e'&&a.cep.e===0&&!!(a.bak&&a.bak.aile)};
OA.harcamaEkle=function(k){var ad=k=='c'?'Çağlar':'Eşi';OA.dlg('<h3>'+(OA.aileden(k)?'Kübra harcaması · Aile Bütçesinden':'Cep harçlığı harcaması · '+ad)+'</h3><label class="oa-zl">Tutar (₺)<input class="oa-in" id="oaHt" type="number" min="0" step="0.01"></label><label class="oa-zl">Açıklama<input class="oa-in" id="oaHa" placeholder="isteğe bağlı"></label><div class="acts"><button type="button" class="oa-btn ghost" onclick="OA.dlgKapat()">Vazgeç</button><button type="button" class="oa-btn" onclick="OA.harcamaKaydet(\''+k+'\')">Kaydet</button></div>')};
OA.harcamaKaydet=function(k){var t=document.getElementById('oaHt').value,n=document.getElementById('oaHa').value.trim();var r=typeof fnKaydet=='function'?fnKaydet({tur:'gider',kim:'cagla',tutar:t,kalem:OA.aileden(k)?'Aile Bütçesi · Kübra':'Cep harçlığı · '+(k=='c'?'Çağlar':'Eşi'),not:n}):null;if(!r)return;r.hk=k;var a=OA.st(),bk=a.bak&&a.bak[OA.aileden(k)?'aile':k=='c'?'cagla':'kubra'];if(bk){bk.t=Math.round((bk.t-r.tutar)*100)/100;bk.ts=Date.now();r.bakDus=1}
 OA.kaydet();OA.dlgKapat();toast('Harcama kaydedildi: '+OA.tl(r.tutar)+(bk?' · güncel bakiyeden düşüldü':' · güncel bakiye bildirilmedi'));ORV.yenile()};
ORV.sayfa('anasayfa',{ciz:function(){OA.kurCek();return OA.anasayfa()},sonra:function(){OA.sayAnim(document.getElementById('oaAna'))},baslik:'Anasayfa'});
})();
