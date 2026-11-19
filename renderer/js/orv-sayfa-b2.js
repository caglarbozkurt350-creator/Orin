// Orvane 0.8.0 · Aşama 4B (2): Merkez (Bildirimler, Eşitleme, Güncellemeler) ve Ayarlar
// Tasarım: Program kurulum\Tasarim\Main.dc.html (pMe, pAyar) + Merkez.dc.html. Mevcut işlevler korunur ve yeni sayfalara gömülür:
//  Bildirimler ← eski Haberler (P.haber bil/gel/sir); Eşitleme ← Sheets (P.baglanti, syncNow/shReadAll), telefon (P.telefon/bulutSimdi), sunucu oturumu (P.oturum);
//  Güncellemeler ← checkUpdate, onayli-surumler (SURUM/surumSor), Yenilikler/Belgeler/Kısayollar/Sorun giderme;
//  Ayarlar ← tema/geçiş/açılış/otomatik daralt (ORV.*), cam arayüz + açık tema (P.tema), Hukuki (P.huk), Kurallar (P.kur), Yapay zekâ (P.zeka), Geçmiş raporlar/Dışa aktar.
var OB=window.OB||{};
(function(){
var SMOKE=function(){return typeof INFO!='undefined'&&INFO.smoke};
var yenile=function(){ORV.yenile()};
var tk=function(m){if(typeof toast=='function')toast(m)};
var ust=function(h,alt,sag){return OA.baslik(h,alt,sag)};
// Eksik simgeler
ORV.IKON.bulut=ORV.IKON.bulut||'<path d="M7 18a4 4 0 0 1-.6-7.96A6 6 0 0 1 18 9.5a4.5 4.5 0 0 1-.5 8.5z"/>';
ORV.IKON.sunucu=ORV.IKON.sunucu||'<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>';
ORV.IKON.gonderTg=ORV.IKON.gonderTg||ORV.IKON.gonder;
OB.tabGit=function(sayfa,t){ORV.git0(sayfa,t)};
function tabSec(a,vars){return vars.some(function(x){return x[0]==a})?a:vars[0][0]}

// ========================================================================
// MERKEZ › BİLDİRİMLER
// ========================================================================
var BT=[['bil','Bildirimler'],['sir','Şirket haberleri'],['gel','Geliştirme']];
function gunBas(){var d=new Date();d.setHours(0,0,0,0);return +d}
OB.bilListe=function(){var L=[],b=OB.st(),gb=gunBas(),ek=function(o){L.push(o)};
 try{if(typeof onayVeri=='function')onayVeri().cagla.slice(0,20).forEach(function(x){var r=x.r||{},c=(typeof tm=='function'&&tm(x.kim))||{ad:x.kim||''},bas=x.tur=='gel'?'Gelişim önerisi: '+(r.ad||r.tur||''):x.tur=='is'?'İş isteği: '+String(r.baslik||r.metin||'').slice(0,60):x.tur=='kayit'?'Kayıt onayı bekliyor':'Toplantı sorusu';
  ek({id:'onay|'+x.tur+'|'+(x.id||r.id||bas),kanal:'Onay',baslik:bas,alt:(c.ad||'')+' · onayını bekliyor',ts:x.ts||gb,git:'onaylar'})})}catch(e){}
 try{TMS().gorev.filter(function(g){return g.durum=='bitti'&&g.bts&&Date.now()-g.bts<3*864e5}).slice(0,10).forEach(function(g){var c=tm(g.kim)||{ad:g.kim};ek({id:'gorev|bitti|'+g.id,kanal:'Görev',baslik:'Görev tamamlandı: '+String(g.metin||'').slice(0,60),alt:c.ad,ts:g.bts,git:'gorevler'})});
  TMS().gorev.filter(function(g){return g.hata&&g.durum!='bitti'}).slice(0,5).forEach(function(g){ek({id:'gorev|hata|'+g.id,kanal:'Görev',baslik:'Görev hatası: '+String(g.metin||'').slice(0,50),alt:String(g.hata).slice(0,90),ts:g.ts||gb,git:'gorevler'})})}catch(e){}
 try{OA.st().tg.slice(-8).forEach(function(x){var c=(typeof tm=='function'&&tm(x.kim))||{ad:x.kim};ek({id:'tg|'+x.id,kanal:'Telegram',baslik:(x.durum=='sirada'?'Telegram sırasında: ':'Telegram: ')+String(x.metin||'').slice(0,60),alt:c.ad+(x.bot?' · '+x.bot:''),ts:x.ts||gb,git:'esitleme'})})}catch(e){}
 b.bil.forEach(function(x){ek({id:'app|'+x.id,kanal:x.kanal||'Sistem',baslik:x.baslik,alt:x.alt,ts:x.ts,git:x.git})});
 try{var th=null;Object.keys(HO).forEach(function(k){if(HO[k][1]==1&&pk(k)>pk(TODAY)&&(!th||pk(k)<pk(th)))th=k});if(th){var dd=Math.round((pk(th)-pk(TODAY))/864e5);if(dd<=21)ek({id:'sis|tatil|'+th,kanal:'Sistem',baslik:'Yaklaşan resmî tatil: '+HO[th][0],alt:lab(th)+' · '+dd+' gün sonra',ts:gb,git:'izinler'})}}catch(e){}
 try{var r=rk();if(r.l>0)ek({id:'sis|huk|'+r.l+'|'+TODAY.slice(0,7),kanal:'Sistem',baslik:'Hukuki uyarı',alt:r.m,ts:gb,git:'ayarlar:huk'})}catch(e){}
 try{var pl=Object.keys(PL).length;if(pl){var ok=0;Object.keys(PL).forEach(function(k){if(PL[k].s==2)ok++});ek({id:'sis|plan|'+pl+'|'+ok,kanal:'Sistem',baslik:'Planlı izin: '+pl+' gün',alt:ok+' gün onaylandı, '+(pl-ok)+' gün onay bekliyor',ts:gb,git:'izinler'})}}catch(e){}
 try{var cf=Q.filter(function(o){return o.conflict}).length;if(cf)ek({id:'sis|cakisma|'+cf,kanal:'Sistem',baslik:'Sheets çakışması: '+cf+' kayıt',alt:'Eşitleme › Google Sheets',ts:gb,git:'esitleme'})}catch(e){}
 try{if(typeof UPD!='undefined'&&UPD.s=='hazir')ek({id:'sis|upd|'+UPD.v,kanal:'Sistem',baslik:'Yeni sürüm hazır: '+UPD.v,alt:'Merkez › Güncellemeler',ts:gb,git:'guncellemeler'})}catch(e){}
 try{var a=ORV.apiDurum();if(a.uyari)ek({id:'sis|api|'+TODAY.slice(0,7),kanal:'Sistem',baslik:'API bütçesinin %'+a.yuzde+'’i kullanıldı',alt:'%90 sonrası yalnızca Echo çalışır',ts:gb,git:'ayarlar:zeka'})}catch(e){}
 L.sort(function(x,y){return (y.ts||0)-(x.ts||0)});return L};
var _okc={t:0,v:0};
ORV.okunmamis=function(){var n=Date.now();if(n-_okc.t<1200)return _okc.v;_okc.t=n;try{var b=OB.st();_okc.v=OB.bilListe().filter(function(x){return !b.ok[x.id]}).length}catch(e){_okc.v=0}return _okc.v};
OB.bilOku=function(id,git){var b=OB.st();b.ok[id]=1;_okc.t=0;save();if(git){var a=String(git).split(':');ORV.git(a[0],a[1]||undefined)}else{yenile()}};
OB.bilHepsi=function(){var b=OB.st();OB.bilListe().forEach(function(x){b.ok[x.id]=1});var ks=Object.keys(b.ok);if(ks.length>600)ks.slice(0,ks.length-600).forEach(function(k){delete b.ok[k]});_okc.t=0;save();yenile()};
var KR={Görev:'g',Onay:'o',Telegram:'d',Sistem:''};
OB.bildirimler=function(){var t=tabSec(arg,BT),b=OB.st(),L=OB.bilListe(),okn=L.filter(function(x){return !b.ok[x.id]}).length,
 tabs=OA.sekmeler(BT,t,'OB.bilTab'),sag='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'+tabs+(t=='bil'?'<button type="button" class="oa-btn ghost sm" onclick="OB.bilHepsi()"'+(okn?'':' disabled')+'>Tümünü okundu say</button>':'')+'</div>',
 h='<div class="ob-pg" id="obBil">'+ust('Bildirimler',t=='bil'?(okn?okn+' okunmamış bildirim':'Hepsi okundu'):t=='sir'?'Şirket haberleri':'Uygulama geliştirme önerileri',sag);
 if(t=='bil'){h+=OA.kart('',L.length?'<div class="ob-liste" id="obBilL">'+L.map(function(x,i){var oku=!!b.ok[x.id];return '<div class="ob-bn '+(oku?'oku':'yeni')+'" role="button" tabindex="0" data-b="'+esc(x.id)+'" style="animation-delay:'+Math.min(i,10)*.03+'s" onclick="OB.bilOku(\''+jq(x.id)+'\',\''+jq(x.git||'')+'\')"><span class="nk" aria-hidden="true"></span><span class="tx"><b>'+esc(x.baslik)+'</b><span class="oa-sub">'+esc(x.alt||'')+(x.ts?' · '+esc(OA.tarihSaat(x.ts)):'')+'</span></span><span class="oa-kp '+(KR[x.kanal]||'n')+'" style="'+(x.kanal=='Telegram'?'background:rgba(56,214,240,.16);color:#7fe8f8':x.kanal=='Onay'?'background:rgba(245,165,36,.18);color:#f7bd55':x.kanal=='Görev'?'background:rgba(62,207,90,.18);color:#6be585':'')+'">'+esc(x.kanal)+'</span></div>'}).join('')+'</div>':OA.bos('zil','Bildirim yok','Görev, onay, Telegram ve sistem bildirimleri burada görünür',160),0)}
 else{if(t=='sir'||t=='gel'){setTimeout(function(){if(typeof loadNews=='function'&&t=='sir'&&!INFO.smoke)loadNews()},0)}
  h+=OA.kart('',(t=='sir'?'<div class="ob-satir"><button type="button" class="oa-btn ghost sm" onclick="if(typeof loadNews==\'function\'){loadNews(true)}setTimeout(ORV.yenile,1500)">Haberleri yenile</button></div>':'')+OB.kutu(OB.eski(P.haber,t)),0)}
 return h+'</div>'};
OB.bilTab=function(t){OB.tabGit('bildirimler',t)};
ORV.sayfa('bildirimler',{ciz:OB.bildirimler,baslik:'Merkez › Bildirimler'});

// ========================================================================
// MERKEZ › EŞİTLEME
// ========================================================================
var ET=[['durum','Durum'],['sheets','Google Sheets'],['telefon','Telefon'],['oturum','Sunucu oturumu']];
OB.es={mesgul:false,son:0};
OB.simdiEsitle=function(){if(OB.es.mesgul)return;OB.es.mesgul=true;yenile();var isl=[];
 try{if(typeof CONNECTED!='undefined'&&CONNECTED&&typeof syncNow=='function')isl.push(Promise.resolve(syncNow()))}catch(e){}
 try{if(typeof bulutSimdi=='function'&&typeof BL!='undefined'&&BL.st&&BL.st.eposta)isl.push(Promise.resolve(bulutSimdi()))}catch(e){}
 isl.push(OB.pbDurumAl(true).then(function(){return OB.pbAkit()}));isl.push(OB.pbOku(true));
 return Promise.all(isl.map(function(p){return p.catch(function(){return 0})})).then(function(){return new Promise(function(r){setTimeout(r,SMOKE()?0:900)})}).then(function(){OB.es.mesgul=false;OB.es.son=Date.now();tk('Eşitleme tamam');if(area=='orv'&&pg=='esitleme')yenile()})};
function esKart(ic,ad,renk,yz,satirlar,btn,gec){return OA.kart(OA.hd(OA.ico(ic,'bulut'),ad,OA.kp(yz,renk)),satirlar+(btn||''),gec)}
function tgSatir(bot,not){var n=OB.tgSirada().filter(function(x){return x.bot==bot}).length;return '<div class="ob-es"><span class="ob-nok '+(OB.tgGonderYolu()?'g':'o')+'"></span><span class="tx"><b>'+bot+'</b><span class="oa-sub">'+not+'</span></span>'+(n?OA.kp('sırada '+n,'o'):'')+'</div>'}
OB.esitleme=function(){var t=tabSec(arg,ET),d=OB.pbD.d,bek=OB.pbBekleyen(),sirada=OB.tgSirada().length,sp=OB.es.mesgul,
 btn='<button type="button" class="oa-btn'+(sp?' ob-spin':'')+'" id="obSimdi" onclick="OB.simdiEsitle()"'+(sp?' disabled':'')+' aria-label="Şimdi eşitle">'+ORV.svg('yenile',18,2.2)+'Şimdi eşitle</button>',
 sag='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'+OA.sekmeler(ET,t,'OB.esTab')+btn+'</div>',h='<div class="ob-pg" id="obEs">'+ust('Eşitleme','Veriler PocketBase’te canlı; Google Sheets gece 00:00’da salt okunur kopyadır'+(OB.es.son?' · son eşitleme '+OA.saat(OB.es.son):''),sag);
 if(t=='durum'){var pbDur=!window.API||!API.pb?['Yalnız masaüstünde','n']:!d?['Okunuyor…','n']:d.girisli?(d.cevrimdisi?['Çevrimdışı','o']:['Bağlı','g']):['Oturum yok','r'],
  zs=OB.zBul('zsheets'),cn=typeof CONNECTED!='undefined'&&CONNECTED,nq=typeof Q!='undefined'?Q.length:0,pbSat=function(a,b){return '<div class="ob-es"><span class="tx"><b>'+a+'</b><span class="oa-sub">'+b+'</span></span></div>'};
  var k1=esKart('linear-gradient(160deg,#5fe0f5,#3b82f6)','PocketBase · canlı',pbDur[1],pbDur[0],'<div class="ob-liste">'+pbSat('Hesap',d&&d.girisli?esc(d.eposta||'—'):'Giriş yapılmadı')+pbSat('Sunucu',esc(d?d.url:'veri.orinorvane.com'))+pbSat('Bekleyen yazma',bek?bek+' değişiklik sunucuya gidecek':'Yok · her şey eşitlendi')+pbSat('Son oturum yenileme',d&&d.sonYenileme?esc(OA.tarihSaat(d.sonYenileme)):'—')+'</div>'+(d&&d.sonHata?'<span class="oa-sub" style="color:#f7bd55">'+esc(d.sonHata)+'</span>':'')+(!d||!d.girisli?'<span class="oa-sub">Sunucu yoksa kayıtlar bu bilgisayarda saklanır; bağlanınca kaldığı yerden sürer.</span>':''),'<button type="button" class="oa-btn ghost sm" onclick="OB.esTab(\'oturum\')">Oturum ve adres ›</button>',0),
  k2=esKart('linear-gradient(160deg,#7cf096,#16a34a)','Google Sheets · gece 00:00',cn?'g':'n',cn?'Bağlı':'Bağlı değil','<div class="ob-liste">'+pbSat('Kopya','Her gece 00:00, salt okunur'+(zs?' · '+(zs.durum=='aktif'?'zamanlanmış iş aktif':'zamanlanmış iş bekletildi'):''))+pbSat('Son okuma',typeof SYN!='undefined'&&SYN.last?esc(OA.tarihSaat(+SYN.last)):'—')+pbSat('Gönderilecek kayıt',nq?nq+' kayıt sırada':'Yok')+'</div>','<button type="button" class="oa-btn ghost sm" onclick="OB.esTab(\'sheets\')">Sheets ayarları ›</button>',.06),
  k3=esKart('linear-gradient(160deg,#c4b0ff,#7c3aed)','Telegram botları',sirada?'o':'n',sirada?'sırada '+sirada+' mesaj':'Sıra boş','<div class="ob-liste">'+tgSatir('@IsraporuEcho_bot','Yalnız Çağlar · iş günü')+tgSatir('@Ceo_Orin_bot','Yalnız Çağlar · CEO Orin')+tgSatir('@Orvanee_bot','Kübra ile ortak · Ev ajanları')+'</div><span class="oa-sub">Masaüstünde bot gönderme yolu yok (bot kimliği eklenmedi). Hiyerarşi/Ekip ve telefondan yazılan Telegram mesajları sırada bekler; sunucudaki bot bağlanınca iletilir.</span>','',.12),
  k4=esKart('linear-gradient(160deg,#fde68a,#f59e0b)','VPS · Hostinger KVM 2',d&&d.girisli&&!d.cevrimdisi?'g':'n',d&&d.girisli?(d.cevrimdisi?'Ulaşılamıyor':'Ulaşılıyor'):'Bilinmiyor','<div class="ob-liste">'+pbSat('Adres',esc(d?d.url:'https://veri.orinorvane.com'))+pbSat('Barındırma','Hostinger KVM 2 · Coolify')+'</div>','',.18),
  k5=esKart('linear-gradient(160deg,#9fdcff,#6366f1)','Yerel yedek',S.lastBackup?'g':'n',S.lastBackup?'Alındı':'Henüz yok','<div class="ob-liste">'+pbSat('Konum','Windows PC · akşamları · şifreli 2. kopya')+pbSat('Son yedek',S.lastBackup?esc(OA.tarihSaat(S.lastBackup)):'—')+'</div>','<button type="button" class="oa-btn ghost sm" onclick="if(typeof backupNow==\'function\')backupNow(true)">Şimdi yedekle</button>',.24),
  k6=esKart('linear-gradient(160deg,#ffc24a,#ff7a2f)','n8n akışları','n','Sunucuda','<div class="ob-liste">'+pbSat('Akışlar','Telegram ve görev akışları sunucuda çalışır')+pbSat('Durum','Programdan okunmuyor (bağlantı yok)')+'</div>','',.3);
  h+='<div class="oa-grid3">'+k1+k2+k3+k4+k5+k6+'</div>'}
 else h+=OA.kart('',OB.kutu(OB.eski(t=='sheets'?P.baglanti:t=='telefon'?P.telefon:P.oturum,'')),0);
 return h+'</div>'};
OB.esTab=function(t){OB.tabGit('esitleme',t)};
ORV.sayfa('esitleme',{ciz:OB.esitleme,baslik:'Merkez › Eşitleme',sonra:function(a){OB.pbDurumAl(true).then(function(){if(area=='orv'&&pg=='esitleme')yenile()});
 if(a=='telefon'&&typeof bulutDurum=='function'&&!BL.st)bulutDurum().then(function(){if(pg=='esitleme')yenile()});if(a=='oturum'&&typeof pbDurumAl=='function'&&!PB.st)pbDurumAl().then(function(){if(pg=='esitleme'&&PB.st)yenile()})}});

// ========================================================================
// MERKEZ › GÜNCELLEMELER
// ========================================================================
var GT=[['surum','Sürümler'],['yenilik','Yenilikler'],['belge','Belgeler'],['kisa','Kısayollar'],['sorun','Sorun giderme']];
OB.gunc={son:'',mesgul:false};
OB.guncDenetle=function(){OB.gunc.mesgul=true;yenile();if(typeof checkUpdate=='function')checkUpdate(true);setTimeout(function(){OB.gunc.mesgul=false;OB.gunc.son=OA.saat(Date.now());if(area=='orv'&&pg=='guncellemeler')yenile()},SMOKE()?0:1500)};
OB.surumYukle=function(){if(!window.API||!API.surum)return;API.surum.liste().then(function(r){SURUM=r.ok?r.v:{hata:r.err};if(area=='orv'&&pg=='guncellemeler')yenile()})};
OB.surumListe=function(){var s=window.SURUM;if(!s||!s.surumler)return[];return s.surumler.slice(0,3)};
OB.guncellemeler=function(){var t=tabSec(arg,GT),sag=OA.sekmeler(GT,t,'OB.gnTab'),h='<div class="ob-pg" id="obGunc">'+ust('Güncellemeler','Yeni sürümü GitHub Actions’ta Run workflow ile Çağlar yayınlar',sag);
 if(t=='surum'){var U=typeof UPD!='undefined'?UPD:{},durum=U.s=='hazir'?'Yeni sürüm '+U.v+' indirildi · kurulmaya hazır':U.s=='indiriliyor'?'Yeni sürüm indiriliyor…':U.s=='durduruldu'?'Yeni sürüm '+U.v+' var · otomatik güncelleme duraklatıldı':U.s=='yok'?'Güncelsin':'Henüz denetlenmedi',L=OB.surumListe(),sv=window.SURUM;
  h+='<div class="oa-grid2">'+OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#7cf096,#16a34a)','indir'),'Yüklü sürüm',OA.kp(INFO.version,'g')),'<b class="oa-num">'+esc(INFO.version)+'</b><span class="oa-sub" id="obGuncDur">'+esc(durum)+(OB.gunc.son?' · denetim '+OB.gunc.son:'')+'</span><div class="ob-satir"><button type="button" class="oa-btn'+(OB.gunc.mesgul?' ob-spin':'')+'" id="obGuncBtn" onclick="OB.guncDenetle()">'+ORV.svg('yenile',18,2.2)+'Güncellemeleri denetle</button>'+(U.s=='hazir'?'<button type="button" class="oa-btn ghost" onclick="API.update.install()">Şimdi kur</button>':'')+(sv&&sv.pin?'<button type="button" class="oa-btn ghost" onclick="surumDevam()">Güncellemeleri aç</button>':'')+'</div><span class="oa-sub">Kurulumdan önce verilerin Yedekler klasörüne alınır.</span>',0)+
  OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#c4b0ff,#7c3aed)','gecmis'),'Sürüm geçmişi',OA.kp('son 2 + son onaylı','n')),'<div class="ob-liste" id="obSurum"><div class="ob-gr"><b style="font-size:13.5px">'+esc(INFO.version)+'</b><span class="oa-sub" style="flex:1">Şu an kurulu</span><span class="ob-et g">Yüklü</span></div>'+(!sv?'<span class="oa-sub">Liste yükleniyor…</span>':sv.hata?'<span class="oa-sub">Liste alınamadı: '+esc(sv.hata)+'</span>':L.length?L.map(function(s,i){return '<div class="ob-gr"><b style="font-size:13.5px">'+esc(s.v)+'</b><span class="oa-sub" style="flex:1;min-width:0">'+esc((s.tarih||'')+(s.not?' · '+s.not:''))+'</span>'+(i==L.length-1||s.onayli?'<span class="ob-et d">Onaylı</span>':'')+'<button type="button" class="oa-btn ghost sm" data-v="'+esc(s.v)+'"'+(window.SURUM_ILER?' disabled':'')+' onclick="surumSor(this.dataset.v)">Geri dön</button></div>'}).join(''):'<span class="oa-sub">Bu sürümden eski onaylı sürüm yok.</span>')+'</div>'+(window.SURUM_ILER?'<span class="oa-sub">'+esc(SURUM_ILER)+'</span>':'')+'<span class="oa-sub">“Geri dön” önce verilerini yedekler, kayıtlar silinmez.</span>',.08)+'</div>'}
 else h+=OA.kart('',OB.kutu(OB.eski(P[t=='yenilik'?'yenilik':t=='belge'?'belge':t=='kisa'?'kisa':'sorun'],'')),0);
 return h+'</div>'};
OB.gnTab=function(t){OB.tabGit('guncellemeler',t)};
ORV.sayfa('guncellemeler',{ciz:OB.guncellemeler,baslik:'Merkez › Güncellemeler',sonra:function(){if(!window.SURUM)OB.surumYukle()}});
if(window.API&&API.surum&&API.surum.on)API.surum.on(function(){if(area=='orv'&&pg=='guncellemeler')yenile()});
if(window.API&&API.update&&API.update.on)API.update.on(function(){if(area=='orv'&&pg=='guncellemeler')yenile()});

// ========================================================================
// AYARLAR
// ========================================================================
var AT=[['gorunum','Görünüm'],['huk','Hukuki Sorumluluk'],['kural','Uygulama Kuralları'],['zeka','Yapay zekâ'],['veri','Veri ve dışa aktar']];
var GA={akiskan:'Eski kartlar bulanıklaşıp kaybolur, yenileri netleşir',kaydir:'Sayfa yana kayarak değişir',yakinlas:'Sayfa küçülüp büyür',sol:'Yumuşak solma',yok:'Geçiş yok'};
OB.temaSec=function(k){ORV.tema(k);yenile()};
OB.gecisSec=function(k){ORV.gecisSet(k);yenile()};
OB.gecisOnizle=function(){ORV.gecis(function(){yenile()},{mod:ORV.gecisAl(),zorla:true})};
OB.acilisTog=function(){ORV.ayar('orvAcilis',ORV.ayarAl('orvAcilis',true)===false);yenile()};
OB.acilisOnizle=function(){ORV.acilis(true)};
OB.autoTog=function(){ORV.ayar('orvAuto',ORV.ayarAl('orvAuto',true)===false);if(ORV.navGuncelle)ORV.navGuncelle();yenile()};
OB.gorselYol=function(v){sx('path',String(v||''));OB.gYukle&&OB.gYukle(true)};
function tog(on,fn,ad){return '<button type="button" class="ob-tg'+(on?' on':'')+'" role="switch" aria-checked="'+(on?'true':'false')+'" aria-label="'+ad+'" onclick="'+fn+'"><span></span></button>'}
OB.ayarlar=function(){var t=tabSec(arg,AT),sag=OA.sekmeler(AT,t,'OB.ayTab'),h='<div class="ob-pg" id="obAyar">'+ust('Ayarlar','Görünüm aynı kalır; yalnızca vurgu rengi değişir',sag);
 if(t=='gorunum'){var tk1=ORV.temaAl(),gk=ORV.gecisAl(),ac=ORV.ayarAl('orvAcilis',true)!==false,au=ORV.ayarAl('orvAuto',true)!==false;
  h+=OA.kart(OA.hd(OA.ico('linear-gradient(160deg,var(--acc2),var(--acc))','gunes'),'Tema rengi',OA.kp(ORV.TEMA[tk1].ad,'n')),'<div class="ob-tem" id="obTema">'+Object.keys(ORV.TEMA).map(function(k){var x=ORV.TEMA[k];return '<button type="button" class="ob-tm" data-tema="'+k+'" aria-pressed="'+(k==tk1)+'" aria-label="'+x.ad+' teması" onclick="OB.temaSec(\''+k+'\')"><span class="ob-tsw" style="background:linear-gradient(160deg,'+x.acc2+','+x.acc+')">'+(k==tk1?ORV.svg('tik',22,3):'')+'</span>'+x.ad+'</button>'}).join('')+'</div>'+
   '<div class="ob-satir" style="padding-top:8px;border-top:1px solid rgba(255,255,255,.08)"><span class="oa-sub">Önizleme</span><button type="button" class="oa-btn sm">Mesaj gönder</button><button type="button" class="oa-chip on" style="height:34px">Tümü</button><span class="oa-ib" style="background:var(--acc);border-color:transparent;color:#fff;width:40px;height:40px">'+ORV.svg('menu',18,2)+'</span><span class="ob-tg on" style="pointer-events:none"><span></span></span></div>',0)+
  OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#9fdcff,#6366f1)','ayrik'),'Sekmeler arası geçiş',OA.kp(ORV.GECIS.filter(function(x){return x[0]==gk})[0][1],'n')+'<button type="button" class="oa-btn ghost sm" onclick="OB.gecisOnizle()">Önizle</button>'),'<div class="ob-gc" id="obGecis">'+ORV.GECIS.map(function(x){return '<button type="button" class="ob-gb" data-gecis="'+x[0]+'" aria-pressed="'+(x[0]==gk)+'" onclick="OB.gecisSec(\''+x[0]+'\')"><span class="ob-mini '+x[0]+'" aria-hidden="true"><i></i><i></i><i></i></span>'+x[1]+'<small>'+GA[x[0]]+'</small></button>'}).join('')+'</div>',.05)+
  '<div class="oa-grid2">'+OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#ffc24a,#ff7a2f)','gunes'),'Açılış ve menü'),'<div class="ob-ay"><div><b>Açılış ekranı</b><span class="oa-sub">Program açılırken ORVANE animasyonu gösterilir</span></div><button type="button" class="oa-btn ghost sm" onclick="OB.acilisOnizle()">Önizle</button>'+tog(ac,'OB.acilisTog()','Açılış ekranını aç veya kapat')+'</div><div class="ob-ay"><div><b>Otomatik daralt</b><span class="oa-sub">Sol menü işaretçi çıkınca 1 sn sonra daralır</span></div>'+tog(au,'OB.autoTog()','Otomatik daraltmayı aç veya kapat')+'</div>',.1)+
  OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#8ff3cf,#16a34a)','resim'),'Görseller klasörü'),'<span class="oa-sub">Yalnız bu bilgisayarda geçerli; dosya adı proje koduyla başlamalı.</span><div class="ob-satir"><input id="obGy" class="oa-in" style="flex:1;min-width:160px" type="text" aria-label="Görseller klasörü yolu" placeholder="C:\\Sirena\\Gorseller" value="'+esc(S.path||'')+'" onchange="OB.gorselYol(this.value)"><button type="button" class="oa-btn ghost" onclick="OB.gKlasor()">Seç</button></div>',.14)+'</div>'+
  OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#d4d4d8,#71717a)','disli'),'Cam arayüz, açık tema ve hareketli arka plan'),'<span class="oa-sub">Yeni tasarımla çakışabilir; seçenek olarak durur.</span>'+OB.kutu(OB.eski(P.tema,'')),.18)}
 else if(t=='huk'){var r;try{r=rk()}catch(e){r={l:0,m:''}}
  h+='<div class="ob-huk k" role="alert">'+ORV.svg('uyari',20,2)+'<span><b>1 gün mazeretsiz devamsızlık:</b> erken uyarı. Yarın da gitmezsen üst üste 2 gün olur ve tazminatsız fesih sebebi doğar.</span></div><div class="ob-huk t">'+ORV.svg('uyari',20,2)+'<span><b>2 ardışık gün</b> mazeretsiz ve izinsiz gelmemek tazminatsız fesih sebebidir. '+esc(r.m||'')+'</span></div>'+OA.kart('',OB.kutu(OB.eski(P.huk,'')),0)}
 else if(t=='kural')h+=OA.kart('',OB.kutu(OB.eski(P.kur,'')),0);
 else if(t=='zeka'){var a=ORV.apiDurum();h+=OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#c4b0ff,#7c3aed)','nabiz'),'API aylık sınırı',OA.kp((a.kul==null?'—':a.kul.toLocaleString('tr-TR',{maximumFractionDigits:2}))+' / '+a.lim+' $','n')),'<div class="ob-ibar"><span class="ob-ibu" style="width:'+a.yuzde+'%;background:'+(a.uyari?'#f5a524':'var(--acc)')+'"></span></div><span class="oa-sub">%90 sonrası kalan yalnızca Echo’ya ayrılır (oran ayarlanabilir). Varsayılan aylık sınır 15 $.'+(a.uyari?' <b style="color:#f7bd55">Uyarı: sınıra yaklaşıldı, yalnızca Echo çalışır.</b>':'')+'</span>',0)+OA.kart('',OB.kutu(OB.eski(P.zeka,'')),.05)}
 else h+=OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#ffc24a,#ff7a2f)','not'),'Notlar'),'<span class="oa-sub">Planlar › Notlar (.txt not klasörü) eski sayfada çalışır.</span><div><button type="button" class="oa-btn ghost" onclick="nav(\'plan\',\'notlar\',\'\')">Notları aç ›</button></div>',0)+OA.kart('',OB.kutu(OB.eski(P.ice,'')+OB.eski(P.aktar,'')),.05);
 return h+'</div>'};
OB.ayTab=function(t){OB.tabGit('ayarlar',t)};
ORV.sayfa('ayarlar',{ciz:OB.ayarlar,baslik:'Merkez › Ayarlar',sonra:function(a){if((a=='kural'||a=='veri')&&window.API&&API.data&&!DI)API.data.info().then(function(i){DI=i;if(area=='orv'&&pg=='ayarlar')yenile()});if(a=='zeka'&&typeof zekaDurum=='function'&&!ZK.st)zekaDurum().then(function(){if(pg=='ayarlar'&&ZK.st)yenile()});if(a=='veri'&&typeof loadNotes=='function'){}}});

// ---- "Diğer sayfalar" listesi: hepsi yeni menüde yer buldu; Ctrl K için kısayollar ----
OB.ESKI_YER={'Takvim (iş günü ay/hafta)':'İş Günleri › Özet (ay takvimi + eski takvim düğmesi)','Yeni proje':'İş Günleri › Projeler','Mazeret İzinleri':'İzinler › Mazeret','Refakat İzinleri':'İzinler › Mazeret','Haberler · Uygulama Geliştirme':'Merkez › Bildirimler › Geliştirme','Haberler · Şirket Haberleri':'Merkez › Bildirimler › Şirket haberleri','Ayarlar · Uygulama Kuralları':'Ayarlar › Uygulama Kuralları','Ayarlar · Google Sheets':'Merkez › Eşitleme › Google Sheets','Ayarlar · Geçmiş raporlar':'Ayarlar › Veri ve dışa aktar','Ayarlar · Dışa aktar':'Ayarlar › Veri ve dışa aktar','Ayarlar · Görünüm (tema, arka plan)':'Ayarlar › Görünüm','Ayarlar · Telefon eşitleme':'Merkez › Eşitleme › Telefon','Ayarlar · Sunucu oturumu':'Merkez › Eşitleme › Sunucu oturumu','Ayarlar · Yapay zekâ':'Ayarlar › Yapay zekâ','Belgeler':'Merkez › Güncellemeler › Belgeler','Klavye kısayolları':'Merkez › Güncellemeler › Kısayollar','Yenilikler':'Merkez › Güncellemeler › Yenilikler','Sorun giderme':'Merkez › Güncellemeler › Sorun giderme','Planlar · Notlar':'Ayarlar › Veri ve dışa aktar › Notları aç'};
if(ORV.ESKI){ORV.TASINAN=(ORV.TASINAN||[]).concat(ORV.ESKI.map(function(x){return x[0]}));ORV.ESKI=[]}
var _pal=palItems;palItems=function(){var r=_pal();r.push({t:'Planlar · Notlar',s:'Ayarlar › Veri',ic:'ti-layout-2',f:function(){nav('plan','notlar','')}},{t:'Takvim (iş günü ay/hafta)',s:'İş Günleri › Özet',ic:'ti-layout-2',f:function(){nav('cal','takvim','')}});return r};
})();
