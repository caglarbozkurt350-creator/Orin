// Orvane 0.8.0 · Kabuk (Aşama 3): üst çubuk, sol dock/panel, sayfa kayıt sistemi, açılış ekranı
// En son yüklenir (render/nav/titleOf/sbH/palItems sarmalayıcıları zincirin sonuna eklenir).
//
// SAYFA AJANLARI İÇİN API
//   ORV.sayfa(id, {ciz:function(arg){return html}, sonra:function(arg){}, baslik:'..'|fn, sb:false|fn, sinif:'..'})
//       id = menü öğesi kimliği (aşağıdaki ORV.KAT içindeki alt[].id: anasayfa, butce, saglik, market, satinalma, evisleri,
//            gorevler, onaylar, gorseller, ekip, hiyerarsi, bildirimler, esitleme, guncellemeler, ayarlar, gunluk, projeler, ozet, izinler)
//       Kayıtlı sayfa varsa menü o sayfayı açar (nav('orv', id, arg)); yoksa eski sayfaya (hedef) gider.
//       Sayfa içeriği #ct kapsayıcısına yazılır (sınıf .orvc eklenir); eski kenar çubuğu (#sb) orv sayfalarında varsayılan gizlidir (sb:fn ile içerik verilirse görünür).
//   ORV.git(id[,arg]) : geçişli gezinme (gecis() ile). ORV.git0(id,arg): geçişsiz.
//   ORV.yenile()      : orv sayfasını yeniden çizer (render()).
(function(){
var trl2=function(s){return String(s==null?'':s).toLocaleLowerCase('tr')};
var E2=function(s){return typeof esc=='function'?esc(s):String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')};

// ---------- Menü: sıra ve alt menüler Bölüm 3.2'deki gibi ----------
// hedef = yeni sayfa henüz yazılmadıysa açılacak ESKİ sayfa (area,pg,arg) ya da fonksiyon
function gHiy(){HRV='hiy';nav('team','ik','')}
function gEkip(){HRV='kart';nav('team','ik','')}
function gGorev(){nav('team','calisan',TM_SEL());TMTAB='gorev';render()}
ORV.KAT=[
 {id:'home',ad:'Anasayfa',bolum:'fav',ikon:'ev',renk:['#ffc24a','#ff7a2f'],sinif:'ic-home',alt:[
  {id:'anasayfa',ad:'Anasayfa',renk:'#ffb020',hedef:function(){nav('home','gun',sel)}}]},
 {id:'aile',ad:'Ailem',bolum:'fav',ikon:'kalp',renk:['#ff9ad4','#e14fa0'],sinif:'ic-aile',alt:[
  {id:'butce',ad:'Bütçe',kisa:'Bütçe',renk:'#ff9ad4',hedef:['team','calisan','otto']},
  {id:'saglik',ad:'Sağlık',kisa:'Sağlık',renk:'#c4b5fd',hedef:['team','calisan','iris']},
  {id:'market',ad:'Menü & Market',kisa:'Menü & Market',renk:'#fda4af',hedef:['team','calisan','marco']},
  {id:'satinalma',ad:'Satın Alma',kisa:'Satın Alma',renk:'#f9a8d4',hedef:['team','calisan','nerya']},
  {id:'evisleri',ad:'Ev İşleri',kisa:'Ev İşleri',renk:'#e9d5ff',hedef:['cal','takvim','']},
  {id:'ilac',ad:'İlaç Planı',kisa:'İlaç Planı',renk:'#a5f3fc',hedef:['home','gun','']}]},
 {id:'gorev',ad:'Görevler',bolum:'fav',ikon:'arti',renk:['#7cf096','#16a34a'],sinif:'ic-gorev',alt:[
  {id:'gorevler',ad:'Görevler',renk:'#7cf096',hedef:gGorev},
  {id:'onaylar',ad:'Onaylar',renk:'#ffc24a',hedef:['team','onaylar','']},
  {id:'gorseller',ad:'Görseller',renk:'#8ff3cf',hedef:['img','gorsel','']}]},
 {id:'ekip',ad:'Ekip',bolum:'alt',ikon:'kisi',renk:['#5fe0f5','#3b82f6'],sinif:'ic-ekip',meta:'Hiyerarşi',alt:[
  {id:'ekip',ad:'Ekip',renk:'#5fe0f5',hedef:gEkip},
  {id:'hiyerarsi',ad:'Hiyerarşi',renk:'var(--acc)',hedef:gHiy}]},
 {id:'merkez',ad:'Merkez',bolum:'fav',ikon:'zil',renk:['#c4b0ff','#7c3aed'],sinif:'ic-merkez',alt:[
  {id:'bildirimler',ad:'Bildirimler',renk:'#c4b0ff',hedef:['msg','haber','bil']},
  {id:'esitleme',ad:'Eşitleme',renk:'#5fe0f5',hedef:['set','baglanti','']},
  {id:'guncellemeler',ad:'Güncellemeler',renk:'#7cf096',hedef:['set','sorun','']},
  {id:'ayarlar',ad:'Ayarlar',renk:'#d4d4d8',hedef:['set','huk','']}]},
 {id:'isgunu',ad:'İş Günleri',bolum:'fav',tarih:true,giris:'ozet',meta:'18:20',alt:[
  {id:'gunluk',ad:'Günlük',renk:'#5fe0f5',hedef:function(){nav('home','gun',sel)}},
  {id:'projeler',ad:'Projeler',renk:'#ffc24a',hedef:['home','yeni','']},
  {id:'ozet',ad:'Özet',renk:'#7cf096',hedef:['cal','takvim','']}]},
 {id:'izin',ad:'İzinler',bolum:'calisma',ikon:'gunes',renk:['#fde68a','#f59e0b'],sinif:'ic-izin',alt:[
  {id:'izinler',ad:'İzinler',renk:'#fde68a',hedef:['home','yil','']}]},
 {id:'bordro',ad:'Bordro',bolum:'calisma',ikon:'bordro',renk:['#7cf096','#16a34a'],sinif:'ic-bordro',alt:[
  {id:'bordro',ad:'Bordro',renk:'#7cf096',hedef:['home','gun','']}]}
];
var KEYS=ORV.KAT.map(function(k){return k.id});
ORV.katBul=function(id){return ORV.KAT.filter(function(k){return k.id==id})[0]||null};
ORV.altBul=function(id){var r=null;ORV.KAT.forEach(function(k){k.alt.forEach(function(a){if(a.id==id)r=a})});return r};
ORV.altKat=function(id){var r=null;ORV.KAT.forEach(function(k){k.alt.forEach(function(a){if(a.id==id)r=k})});return r};

// Yeni menüde yeri olmayan ESKİ sayfalar: "Diğer sayfalar" (yalnız panel + Ctrl K). Sayfa ajanları taşıdıkça buradan çıkarılır. Hiçbir özellik silinmez.
function ad(a,p,g){return function(){nav(a,p,g||'')}}
ORV.ESKI=[
 ['Çalışanlarım (liste)',function(){nav('team','calisan',TM_SEL())}],
 ['Jarvis · kişisel asistan',ad('team','jarvis')],
 ['Şirketim · Genel bakış',ad('team','sirket')],
 ['Toplantı Odası',function(){var t=typeof tpAktif=='function'&&tpAktif();nav('team','toplanti',t?t.id:'')}],
 ['Arka plan işleri',ad('team','arkaplan')],
 ['Haftalık rapor',ad('team','haftalik')],
 ['Planlar · Notlar',ad('plan','notlar')],
 ['Takvim (iş günü ay/hafta)',ad('cal','takvim')],
 ['Yeni proje',ad('home','yeni')],
 ['Mazeret İzinleri',ad('home','maz')],
 ['Refakat İzinleri',ad('home','ref')],
 ['Haberler · Uygulama Geliştirme',ad('msg','haber','gel')],
 ['Haberler · Şirket Haberleri',ad('msg','haber','sir')],
 ['Ayarlar · Uygulama Kuralları',ad('set','kur')],
 ['Ayarlar · Google Sheets',ad('set','baglanti')],
 ['Ayarlar · Geçmiş raporlar',ad('set','ice')],
 ['Ayarlar · Dışa aktar',ad('set','aktar')],
 ['Ayarlar · Görünüm (tema, arka plan)',ad('set','tema')],
 ['Ayarlar · Telefon eşitleme',ad('set','telefon')],
 ['Ayarlar · Sunucu oturumu',ad('set','oturum')],
 ['Ayarlar · Yapay zekâ',ad('set','zeka')],
 ['Belgeler',ad('set','belge')],
 ['Klavye kısayolları',ad('set','kisa')],
 ['Yenilikler',ad('set','yenilik')],
 ['Sorun giderme',ad('set','sorun')]
];

// ---------- Sayfa kayıt sistemi ----------
ORV.sayfalar={};
ORV.sayfa=function(id,def){ORV.sayfalar[id]=def||{};return ORV.sayfalar[id]};
window.orvPage=function(){var d=ORV.sayfalar[pg];if(!d||typeof d.ciz!='function')return '<p class="h">Sayfa bulunamadı</p><p class="s">'+E2(pg)+'</p>';return d.ciz(arg)};
window.orvBaslik=function(){var d=ORV.sayfalar[pg],a=ORV.altBul(pg),k=ORV.altKat(pg);if(d&&d.baslik)return typeof d.baslik=='function'?d.baslik(arg):d.baslik;return a?(k&&k.alt.length>1?k.ad+' › '+(a.kisa||a.ad):a.ad):'Orvane'};
ORV.yenile=function(){render()};
ORV.git0=function(id,ar){var a=ORV.altBul(id);if(!a)return;ORV._g0=true;ORV.son=id;ORV.sonKonum=null;
 try{if(ORV.sayfalar[id])nav('orv',id,ar||'');else if(typeof a.hedef=='function')a.hedef();else nav(a.hedef[0],a.hedef[1],a.hedef[2]||'')}finally{ORV._g0=false}
 ORV.son=id;ORV.sonKonum=area+'|'+pg+'|'+arg;ORV.ustGuncelle();ORV.navGuncelle()};
ORV.git=function(id,ar,o){if(!ORV.altBul(id))return;gecis(function(){ORV.git0(id,ar)},o)};
ORV.gitEski=function(i){var x=ORV.ESKI[i];if(!x)return;ORV.son=null;gecis(function(){ORV._g0=true;try{x[1]()}finally{ORV._g0=false}ORV.ustGuncelle();ORV.navGuncelle()})};

// ---------- Aktif öğe ve "Bölüm / Sayfa" yolu ----------
var AILE={otto:'butce',iris:'saglik',marco:'market',nerya:'satinalma',mia:'evisleri'};
function ters(){var a=area,p=pg,g=arg;
 if(a=='orv')return p;
 if(a=='home'){if(p=='proje'||p=='yeni')return 'projeler';if(p=='yil'||p=='maz'||p=='ref')return 'izinler';return 'anasayfa'}
 if(a=='cal')return 'ozet';
 if(a=='msg')return 'bildirimler';
 if(a=='img')return 'gorseller';
 if(a=='set'){if(p=='baglanti'||p=='telefon'||p=='oturum')return 'esitleme';if(p=='sorun'||p=='yenilik')return 'guncellemeler';return 'ayarlar'}
 if(a=='team'){if(p=='onaylar')return 'onaylar';if(p=='ik')return typeof HRV!='undefined'&&HRV=='hiy'?'hiyerarsi':'ekip';if(p=='calisan')return AILE[g]||'ekip';return 'ekip'}
 return null}
ORV.aktif=function(){if(area=='orv')return pg;if(ORV.son&&(ORV._g0||ORV.sonKonum==area+'|'+pg+'|'+arg))return ORV.son;return ters()};
ORV.yol=function(){var id=ORV.aktif(),k=id?ORV.altKat(id):null,a=id?ORV.altBul(id):null,ust,alt;
 if(k&&a){if(k.alt.length==1){ust='Orvane';alt=a.kisa||a.ad}else{ust=k.ad;alt=a.kisa||a.ad}}
 else{var t='';try{t=titleOf()}catch(e){}var p=String(t).split(' › ');ust=p.length>1?p[0]:'Orvane';alt=p.length>1?p[1]:(p[0]||'Orvane')}
 return [ust,alt]};

// ---------- Durum ----------
var d=ORV.d={mod:'dock',acc:null,hov:null,zp:false,q:'',hover:false};
var nav8=null,fan=null,zpEl=null,edge=null,tCol=null,tHov=null,imza='';
function html(){return document.documentElement}
function auto(){return ORV.ayarAl('orvAuto',true)!==false}
function katAktif(){var id=ORV.aktif(),k=id?ORV.altKat(id):null;return k?k.id:null}

// ---------- Sayaçlar ----------
function durumSay(){var h=0,c=0,k=0;try{tmAll().forEach(function(x){var s=tmStat(x);if(s=='bz')c++;else if(s=='ok')h++;else k++})}catch(e){}return{h:h,c:c,k:k}}
function foto(id){var c=null;try{c=tm(id)}catch(e){}return c&&c.foto?'../'+c.foto:''}
ORV.apiDurum=function(){var s=(typeof ZK!='undefined'&&ZK.st)?ZK.st:null,lim=s&&s.butce>0?s.butce:ORV.ayarAl('orvApiLimit',15),kul=s&&s.harcama&&typeof s.harcama.usd=='number'?s.harcama.usd:null,y=kul==null?0:Math.min(100,Math.round(kul/lim*100));return{lim:lim,kul:kul,yuzde:y,uyari:kul!=null&&kul/lim>=.9}};
ORV.zpAktif=function(){return 0}; // Zamanlanmış işler paneli (sonraki aşama) bu fonksiyonu aktif iş sayısıyla değiştirir
var _ob={t:0,v:0};function onayBekleyen(){var n=Date.now();if(n-_ob.t<1500)return _ob.v;_ob.t=n;try{_ob.v=typeof skBekleyen=='function'?skBekleyen().top:0}catch(e){_ob.v=0}return _ob.v}
function usd(v){return v==null?'—':v.toLocaleString('tr-TR',{maximumFractionDigits:2})+' $'}

// ---------- Panel/dock çizimi ----------
function chev(k){return '<svg class="orv-lbl" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e95" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" style="flex:none;margin-left:4px;transition:transform .3s;transform:rotate('+(d.mod=='open'&&d.acc==k?180:0)+'deg)"><path d="m6 9 6 6 6-6"/></svg>'}
function altMatch(a){return !d.q||trl2(a.ad).indexOf(d.q)>=0}
function katMatch(k){return !d.q||trl2(k.ad).indexOf(d.q)>=0||k.alt.some(altMatch)}
function katH(k){var acik=d.mod=='open',tekli=k.alt.length<=1,acc=acik&&(d.acc==k.id||(d.q&&k.alt.some(altMatch)))&&!tekli,act=katAktif()==k.id,aid=ORV.aktif();
 if(!katMatch(k))return '';
 var pas=k.id=='ekip'&&ORV.pasif&&ORV.pasif(),sq=k.tarih?ORV.tarihKutu():ORV.ikon(k.ikon,{renk:pas?['#6b6b72','#3f3f45']:k.renk,sinif:k.sinif+(pas?' pasif':'')}),bd='',meta='';
 if(k.id=='gorev'){var n=onayBekleyen();if(n>0){bd='<span class="orv-bdg">'+n+'</span>';meta='<span class="orv-rb">'+n+'</span>'}}
 if(k.id=='ekip')meta=pas?'<span style="font-size:11px;color:var(--yazi3);font-weight:600">'+(typeof tmAll=='function'?tmAll().length+' · ':'')+'kapalı</span>':'<span style="font-size:11px;color:#ff9a7f;font-weight:600">Hiyerarşi</span>';
 if(k.id=='isgunu')meta='<span class="orv-sw" style="background:#f5a524"></span>'+k.meta;
 if(bd)sq=sq.replace('</svg></span>','</svg>'+bd+'</span>');
 return '<div class="orv-ig" data-k="'+k.id+'"><button type="button" class="orv-it'+(act?' act':'')+'" data-k="'+k.id+'" aria-label="'+E2(k.ad)+'"'+(tekli?'':' aria-expanded="'+(acc?'true':'false')+'"')+'>'+sq+
  '<span class="orv-lbl">'+E2(k.ad)+'</span><span class="orv-lbl orv-meta">'+meta+(tekli?'':chev(k.id))+'</span></button>'+
  (acc?'<div class="orv-accw">'+k.alt.filter(altMatch).map(function(a){return '<button type="button" class="orv-sub'+(aid==a.id?' on':'')+'" data-id="'+a.id+'"><span class="orv-sw" style="background:'+a.renk+'"></span>'+E2(a.ad)+'</button>'}).join('')+'</div>':'')+'</div>'}
function eskiH(){if(d.mod!='open'||!ORV.ESKI.length)return '';var acc=d.acc=='eski'||(d.q&&ORV.ESKI.some(function(x){return trl2(x[0]).indexOf(d.q)>=0}));
 if(d.q&&!ORV.ESKI.some(function(x){return trl2(x[0]).indexOf(d.q)>=0}))return '';
 return '<div class="orv-ig orv-onlyopen" data-k="eski"><button type="button" class="orv-it" data-k="eski" aria-label="Diğer sayfalar" aria-expanded="'+(acc?'true':'false')+'">'+ORV.ikon('liste',{renk:['#d4d4d8','#71717a']})+'<span class="orv-lbl">Diğer sayfalar</span><span class="orv-lbl orv-meta">'+ORV.ESKI.length+'<svg class="orv-lbl" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e95" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" style="flex:none;margin-left:4px;transition:transform .3s;transform:rotate('+(acc?180:0)+'deg)"><path d="m6 9 6 6 6-6"/></svg></span></button>'+
  (acc?'<div class="orv-accw">'+ORV.ESKI.map(function(x,i){return !d.q||trl2(x[0]).indexOf(d.q)>=0?'<button type="button" class="orv-sub eski" data-eski="'+i+'">'+E2(x[0])+'</button>':''}).join('')+'</div>':'')+'</div>'}
function altH(){var s=durumSay(),api=ORV.apiDurum(),zpn=ORV.zpAktif();
 var f1=foto('orin'),f2=foto('orla'),f3=foto('echo'),im=function(u){return u?'<img class="stk" src="'+E2(u)+'" alt="">':'<span class="stk"></span>'};
 return ORV.KAT.filter(function(k){return k.bolum=='alt'}).map(katH).join('')+
  '<button type="button" class="orv-it'+(d.zp?' act':'')+'" data-act="zp" aria-label="Zamanlanmış işler" aria-expanded="'+(d.zp?'true':'false')+'">'+ORV.ikon('kronometre',{renk:['#9fdcff','#38bdf8'],sinif:'ic-zp'}).replace('</svg></span>','</svg>'+(zpn>0?'<span class="orv-bdg" style="background:#38bdf8">'+zpn+'</span>':'')+'</span>')+'<span class="orv-lbl">Zamanlanmış işler</span><span class="orv-lbl orv-meta">'+zpn+' aktif</span></button>'+
  '<div class="orv-onlyopen orv-auto"><span>Otomatik daralt</span><button type="button" class="orv-tg'+(auto()?' on':'')+'" data-act="auto" role="switch" aria-checked="'+(auto()?'true':'false')+'" aria-label="Otomatik daraltmayı aç / kapat"><span></span></button></div>'+
  '<div class="orv-prow"><span class="orv-sq yuvarlak" style="--a:#ffc24a;--b:#ff7a2f"><span class="orv-mono"><i>Ç</i></span><span class="orv-on"></span></span><span class="orv-lbl t"><b>Çağlar</b><small>Sahip · Orvane</small></span></div></div>'}
function navH(){var fav='',cal='';ORV.KAT.forEach(function(k){if(k.bolum=='fav')fav+=katH(k);else if(k.bolum!='alt')cal+=katH(k)});
 return '<button type="button" class="orv-chev orv-cam" data-act="chev" aria-label="Sekmeyi genişlet / daralt">'+ORV.svg('sag',14,2.4)+'</button>'+
  '<label class="orv-srch" data-act="srch"><span style="display:flex;flex:none">'+ORV.svg('ara',18,2.2)+'</span><input class="orv-lbl" type="search" placeholder="Ara" aria-label="Kategorilerde ara" value="'+E2(d.qr||'')+'" autocomplete="off"><span class="orv-lbl" style="font-size:11px;color:#8e8e95;flex:none">Ctrl K</span></label>'+
  '<div class="orv-scr">'+(fav?'<span class="orv-sec">FAVORİLER</span>'+fav:'')+(cal?'<span class="orv-sec">ÇALIŞMA</span>'+cal:'')+eskiH()+'</div>'+
  '<div class="orv-alt">'+altH()+'</div>'}
function sinifUygula(){if(!nav8)return;nav8.className='orv-nav orv-cam r28 '+d.mod;var h=html();h.classList.toggle('orv-gizli',d.mod=='gizli');h.classList.toggle('orv-acik-sabit',d.mod=='open'&&!auto());
 if(zpEl)zpEl.style.left=(d.mod=='open'?324:d.mod=='gizli'?24:108)+'px'}
function navCiz(){if(!nav8)return;var ae=document.activeElement,odak=ae&&ae.tagName=='INPUT'&&nav8.contains(ae),pos=odak?ae.selectionStart:0,sc=nav8.querySelector('.orv-scr'),st=sc?sc.scrollTop:0;
 sinifUygula();nav8.innerHTML=navH();sc=nav8.querySelector('.orv-scr');if(sc)sc.scrollTop=st;
 if(odak){var i=nav8.querySelector('.orv-srch input');if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch(e){}}}
 imza=imzaYap();imzaAk=ORV.aktif();navHov(d.hov,true)}
function imzaYap(){var a=ORV.apiDurum();return [d.mod,d.acc,d.q,d.zp,auto(),onayBekleyen(),a.yuzde,a.kul,ORV.zpAktif(),new Date().getDate()].join('|')}
// yalnız aktif öğe değiştiyse DOM'da sınıfları değiştir (tam yeniden çizim yok); yapı değiştiyse navCiz
function aktifUygula(){var id=ORV.aktif(),kt=id?ORV.altKat(id):null,kid=kt?kt.id:null;
 [].forEach.call(nav8.querySelectorAll('.orv-it[data-k]'),function(e){e.classList.toggle('act',e.getAttribute('data-k')==kid)});
 [].forEach.call(nav8.querySelectorAll('.orv-sub[data-id]'),function(e){e.classList.toggle('on',e.getAttribute('data-id')==id)});
 imzaAk=id}
var imzaAk=null;
ORV.navGuncelle=function(){if(!nav8)return;if(imzaYap()!==imza){navCiz();return}var id=ORV.aktif();if(id!==imzaAk)aktifUygula()};
ORV.navCiz=navCiz;

// ---------- Dock: macOS büyümesi, yelpaze ----------
function navHov(k,sessiz){d.hov=k;if(!nav8)return;var dock=d.mod=='dock',hi=k?KEYS.indexOf(k):-99;
 [].forEach.call(nav8.querySelectorAll('.orv-ig'),function(el){var i=KEYS.indexOf(el.getAttribute('data-k'));if(i<0)return;var dd=Math.abs(i-hi),dock=d.mod=='dock'&&!ORV.azalt(),m=dock?(dd==0?1.34:dd==1?1.14:dd==2?1.04:1):1,mg=dock?(dd==0?8:dd==1?3:0):0,sq=el.querySelector('.orv-sq');el.style.margin=mg+'px 0';if(sq)sq.style.transform=m!=1?'scale('+m+')':''});
 if(!sessiz)fanGoster(dock?k:null);else if(!dock)fanGoster(null)}
function fanGoster(k){if(!fan)return;if(!k){fan.style.display='none';fan.innerHTML='';fan._k=null;return}
 if(fan._k==k&&fan.style.display=='flex')return;var kat=ORV.katBul(k),ig=nav8.querySelector('.orv-ig[data-k="'+k+'"] .orv-sq');if(!kat||!ig)return;
 var multi=kat.alt.length>1,aid=ORV.aktif();fan._k=k;
 fan.innerHTML=multi?kat.alt.map(function(a,j){return '<button type="button" class="orv-fc'+(aid==a.id?' on':'')+'" data-id="'+a.id+'" style="animation-delay:'+(j*.06)+'s"><span class="mq" style="background:'+a.renk+'"></span>'+E2(a.ad)+'</button>'}).join(''):'<span class="orv-tipl">'+E2(kat.ad)+'</span>';
 var nr=nav8.getBoundingClientRect(),r=ig.getBoundingClientRect();fan.style.pointerEvents=multi?'auto':'none';fan.style.display='flex';
 var h=fan.getBoundingClientRect().height,top=Math.max(h/2+8,Math.min(window.innerHeight-h/2-8,r.top+r.height/2));fan.style.left=(nr.right-2)+'px';fan.style.top=top+'px'}

// ---------- Aç / daral ----------
function planla(ms){clearTimeout(tCol);if(d.mod!='open'||!auto()||d.zp||d.hover)return;tCol=setTimeout(function(){if(d.mod=='open'&&auto()&&!d.zp&&!d.hover){d.acc=null;setMod('dock')}},ms==null?1000:ms)}
function setMod(m,acc){clearTimeout(tCol);d.mod=m;if(m!='open')d.acc=null;if(acc!==undefined)d.acc=acc;fanGoster(null);d.hov=null;navCiz();
 if(m=='gizli')ORV.ayar('orvGizli',true);else if(ORV.ayarAl('orvGizli',false))ORV.ayar('orvGizli',false);
 var mb=document.getElementById('orvMenuBtn');if(mb)mb.setAttribute('aria-pressed',m=='gizli'?'true':'false')}
ORV.mod=function(m){setMod(m)};
ORV.menuTog=function(){setMod(d.mod=='gizli'?'dock':'gizli')};
ORV.panelAc=function(acc){setMod('open',acc)};
function navEnter(){d.hover=true;clearTimeout(tCol);clearTimeout(tHov)}
function navLeave(){d.hover=false;clearTimeout(tHov);tHov=setTimeout(function(){if(!d.hover)navHov(null)},140);planla(1000)}
ORV.navEnter=navEnter;ORV.navLeave=navLeave; // testler için

function kat(k){var kt=ORV.katBul(k);if(!kt)return;
 if(d.mod!='open')setMod('open',kt.alt.length>1?k:null);
 else{d.acc=d.acc==k?null:k;navCiz()}
 ORV.git(kt.giris||kt.alt[0].id)}
function altTik(id){ORV.git(id);if(d.mod=='dock'){fanGoster(null)}}
function navClick(e){var t=e.target,b;
 if((b=t.closest('.orv-sub'))){if(b.hasAttribute('data-eski'))ORV.gitEski(+b.getAttribute('data-eski'));else ORV.git(b.getAttribute('data-id'));return}
 if((b=t.closest('.orv-it'))){var a=b.getAttribute('data-act'),k=b.getAttribute('data-k');
  if(a=='zp'){ORV.zpTog();return}
  if(k=='eski'){d.acc=d.acc=='eski'?null:'eski';navCiz();return}
  if(k)kat(k);return}
 if((b=t.closest('[data-act]'))){var a2=b.getAttribute('data-act');
  if(a2=='chev'){setMod(d.mod=='open'?'dock':'open')}
  else if(a2=='auto'){ORV.ayar('orvAuto',!auto());navCiz();if(auto())planla(1000)}
  else if(a2=='srch'){if(d.mod!='open'){setMod('open');var i=nav8.querySelector('.orv-srch input');if(i)i.focus()}else{var i2=nav8.querySelector('.orv-srch input');if(i2&&t!==i2)i2.focus()}}}}
function srchKey(e){if(e.key=='Enter'){var q=e.target.value.trim();if(!q){if(typeof openPal=='function')openPal();return}
  var m=null;ORV.KAT.some(function(k){return k.alt.some(function(a){if(altMatch(a)&&(trl2(a.ad).indexOf(d.q)>=0)){m=a.id;return true}return false})||(trl2(k.ad).indexOf(d.q)>=0&&(m=k.alt[0].id,true))});
  if(m){ORV.git(m)}else{var i=ORV.ESKI.map(function(x){return trl2(x[0])}).findIndex(function(s){return s.indexOf(d.q)>=0});if(i>=0)ORV.gitEski(i);else if(typeof openPal=='function')openPal()}}
 else if(e.key=='Escape'){e.target.value='';d.q='';d.qr='';navCiz();e.stopPropagation()}}

// ---------- Zamanlanmış işler paneli (yer tutucu; içerik sonraki aşamada) ----------
ORV.zpIcerik=function(){return '<div class="orv-bos-kutu">'+ORV.svg('kronometre',34,1.8)+'<b>Zamanlanmış işler</b>Bu panel sonraki aşamada bağlanacak (liste, Şimdi çalıştır, Beklet/Sürdür, Kaldır, yeni iş formu).</div>'};
function zpCiz(){if(!zpEl)return;zpEl.classList.toggle('ac',d.zp);if(!d.zp)return;
 zpEl.innerHTML='<div class="zh">'+ORV.ikon('kronometre',{renk:['#9fdcff','#38bdf8']})+'<span class="t"><b>Zamanlanmış işler</b><small>'+ORV.zpAktif()+' aktif · İstanbul saati</small></span><button type="button" class="orv-ib" data-act="zpk" aria-label="Kapat">'+ORV.svg('kapat',18,2)+'</button></div><div id="orvZpIc">'+ORV.zpIcerik()+'</div>';
 zpEl.style.left=(d.mod=='open'?324:d.mod=='gizli'?24:108)+'px'}
ORV.zpTog=function(v){d.zp=v===undefined?!d.zp:!!v;clearTimeout(tCol);zpCiz();navCiz();if(!d.zp)planla(1000)};

// ---------- Üst çubuk ----------
ORV.popAc=function(v){var p=document.getElementById('orvPop'),b=document.getElementById('orvProfil');if(!p)return;var ac=v===undefined?!p.classList.contains('ac'):v;p.classList.toggle('ac',ac);if(b)b.setAttribute('aria-expanded',ac?'true':'false');if(!ac&&typeof closeM=='function')closeM()};
ORV.popKapat=function(){ORV.popAc(false)};
ORV.ustGuncelle=function(){var y=document.getElementById('orvYol');if(y){var p=ORV.yol();y.innerHTML=E2(p[0])+'<i>/</i><b>'+E2(p[1])+'</b>'}
 var zb=document.getElementById('orvZilB');if(zb){var n=ORV.okunmamis?ORV.okunmamis():onayBekleyen();zb.textContent=n>9?'9+':String(n);zb.style.display=n>0?'flex':'none'}};
ORV.ara=function(){if(typeof openPal=='function')openPal()};

// ---------- Açılış ekranı (~2,5 sn; Ayarlar'dan kapatılabilir: S.orvAcilis=false) ----------
ORV.acilis=function(zorla){if(document.getElementById('orvSpl'))return null;
 if(!zorla&&(INFO.smoke||ORV.ayarAl('orvAcilis',true)===false||ORV.azalt()))return null;
 var e=document.createElement('div');e.id='orvSpl';e.className='orv-spl';e.setAttribute('aria-label','ORVANE açılıyor');e.setAttribute('role','img');e.style.setProperty('--fs','min(120px,13vw)');
 e.innerHTML='<div class="orv-spl-in"><span class="orv-sp-o"><span class="orv-sp-sq"></span><svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="orvSpG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" style="stop-color:var(--acc2,#ffc24a)"/></linearGradient></defs><circle cx="50" cy="50" r="33" fill="none" stroke="url(#orvSpG)" stroke-width="15"/><circle r="6" fill="#fff"><animateMotion dur="2.2s" repeatCount="indefinite" path="M 96 50 A 46 46 0 1 1 4 50 A 46 46 0 1 1 96 50"/></circle></svg></span><span class="orv-sp-w">'+
  ['R','V','A','N','E'].map(function(c,i){return '<span class="orv-sp-l" style="--i:'+(i+1)+'">'+c+'</span>'}).join('')+'</span></div><span class="orv-sp-t">KİŞİSEL ASİSTAN EKİBİN</span>';
 document.body.appendChild(e);setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e)},3300);return e};

// ---------- Mevcut sarmalayıcılar ----------
var _titleOf=titleOf;titleOf=function(){if(area=='orv')return orvBaslik();return _titleOf()};
var _sbH=sbH;sbH=function(){if(area=='orv'){var df=ORV.sayfalar[pg];return df&&typeof df.sb=='function'?df.sb():''}return _sbH()};
// ---------- Erişilebilirlik: tıklanır ama düğme olmayan öğelere rol + klavye, etiketsiz alanlara ad (eski sayfa içerikleri dahil) ----------
ORV.erisim=function(kok){kok=kok||document.getElementById('ct');if(!kok)return;
 [].forEach.call(kok.querySelectorAll('[onclick]'),function(e){if(/^(BUTTON|A|INPUT|SELECT|TEXTAREA|SUMMARY|LABEL|OPTION)$/.test(e.tagName))return;if(!e.getAttribute('role'))e.setAttribute('role','button');if(e.getAttribute('tabindex')==null)e.setAttribute('tabindex','0');
  if(!e.getAttribute('aria-label')&&!(e.textContent||'').trim()&&e.getAttribute('title'))e.setAttribute('aria-label',e.getAttribute('title'))});
 [].forEach.call(kok.querySelectorAll('select,input,textarea'),function(e){if(e.type=='hidden'||e.type=='button'||e.type=='submit'||e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.getAttribute('title')||e.getAttribute('placeholder')||e.closest('label')||(e.id&&kok.querySelector('label[for="'+e.id+'"]')))return;
  var p=e.previousElementSibling,tx=p&&p!=e?(p.textContent||'').trim():'';if(!tx||tx.length>40)tx=(e.getAttribute('name')||e.getAttribute('data-k')||e.id||'').replace(/[-_]+/g,' ').trim();e.setAttribute('aria-label',tx||(e.tagName=='SELECT'?'Seçim':'Giriş'))})};
document.addEventListener('keydown',function(ev){if((ev.key=='Enter'||ev.key==' ')&&ev.target&&ev.target.getAttribute&&ev.target.getAttribute('role')=='button'&&ev.target.hasAttribute('onclick')&&!/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(ev.target.tagName)){ev.preventDefault();ev.target.click()}});
var _render=render;render=function(){_render();
 var ct=document.getElementById('ct'),sb=document.getElementById('sb'),df=area=='orv'?ORV.sayfalar[pg]:null;
 if(ct){ct.classList.toggle('orvc',area=='orv');if(ORV._sn){ct.classList.remove(ORV._sn);ORV._sn=null}if(df&&df.sinif){ct.classList.add(df.sinif);ORV._sn=df.sinif}} // sayfa sınıfı bir sonraki sayfaya sızmasın
 if(area=='orv'&&sb)sb.style.display=(df&&typeof df.sb=='function')?'block':'none';
 if(df&&typeof df.sonra=='function'){try{df.sonra(arg)}catch(e){console.error(e)}}
 try{ORV.erisim();ORV.erisim(document.getElementById('mb'))}catch(e){}
 ORV.navGuncelle();ORV.ustGuncelle()};
var _nav=nav;nav=function(a,p,g,noh){var ch=(a!=area||p!=pg);_nav(a,p,g,noh);if(ch&&!ORV._g0&&!_gcBusyFlag())gecisGiris()};
function _gcBusyFlag(){return ORV.gecisMesgul()}
var _menu=menu;menu=function(n){_menu(n);var dd=document.getElementById('dd'),m=document.getElementById('m_'+n),w=document.getElementById('app');
 if(dd&&m&&dd.style.display=='block'){var r=m.getBoundingClientRect(),wr=w.getBoundingClientRect();dd.style.left=Math.max(8,r.left-wr.left-dd.offsetWidth-8)+'px';dd.style.top=Math.max(8,r.top-wr.top)+'px'}};
var _togRail=togRail;togRail=function(){ORV.menuTog()};
var _palItems=palItems;palItems=function(){var r=_palItems(),n=[];
 ORV.KAT.forEach(function(k){k.alt.forEach(function(a){n.push({t:(k.alt.length>1?k.ad+' › ':'')+(a.kisa||a.ad),s:'Orvane menüsü',ic:'ti-layout-2',f:function(){ORV.git(a.id)}})})});
 ORV.ESKI.forEach(function(x,i){n.push({t:x[0],s:'Diğer sayfalar',ic:'ti-layout-2',f:function(){ORV.gitEski(i)}})});
 return n.concat(r)};

// ---------- Başlat ----------
ORV.baslat=function(){
 var bd=document.getElementById('bd'),app=document.getElementById('app');if(!bd||nav8)return;
 d.mod=ORV.ayarAl('orvGizli',false)?'gizli':'dock';
 nav8=document.createElement('nav');nav8.id='orvNav';nav8.setAttribute('aria-label','Kategoriler');bd.insertBefore(nav8,bd.firstChild);
 fan=document.createElement('div');fan.id='orvFan';fan.style.display='none';document.body.appendChild(fan);
 zpEl=document.createElement('section');zpEl.id='orvZp';zpEl.className='orv-cam';zpEl.setAttribute('aria-label','Zamanlanmış işler');bd.appendChild(zpEl);
 edge=document.createElement('button');edge.id='orvEdge';edge.type='button';edge.setAttribute('aria-label','Kategori sekmesini göster');edge.innerHTML=ORV.svg('sag',16,2.4);edge.onclick=function(){setMod('dock')};bd.appendChild(edge);
 nav8.addEventListener('click',navClick);
 nav8.addEventListener('mouseenter',navEnter);nav8.addEventListener('mouseleave',navLeave);
 nav8.addEventListener('mouseover',function(e){var g=e.target.closest&&e.target.closest('.orv-ig');if(g&&d.mod=='dock'&&d.hov!=g.getAttribute('data-k'))navHov(g.getAttribute('data-k'))});
 nav8.addEventListener('input',function(e){if(e.target.tagName=='INPUT'){d.qr=e.target.value;d.q=trl2(e.target.value).trim();navCiz()}});
 nav8.addEventListener('keydown',function(e){if(e.target.tagName=='INPUT')srchKey(e)});
 fan.addEventListener('mouseenter',navEnter);fan.addEventListener('mouseleave',navLeave);
 fan.addEventListener('click',function(e){var b=e.target.closest('.orv-fc');if(b)altTik(b.getAttribute('data-id'))});
 zpEl.addEventListener('mouseenter',navEnter);zpEl.addEventListener('mouseleave',navLeave);
 zpEl.addEventListener('click',function(e){if(e.target.closest('[data-act="zpk"]'))ORV.zpTog(false)});
 document.addEventListener('click',function(e){if(!e.target.closest('.orv-pw'))ORV.popAc(false)});
 document.addEventListener('keydown',function(e){if(e.key=='Escape'){ORV.popAc(false);if(d.zp)ORV.zpTog(false)}});
 var lg=document.getElementById('orvLogo');if(lg)lg.innerHTML=ORV.logo(30);
 var mb=document.getElementById('orvMenuBtn');if(mb)mb.setAttribute('aria-pressed',d.mod=='gizli'?'true':'false');
 ORV.tema(ORV.temaAl(),true);
 navCiz();render();ORV.acilis()};
// pages.js başlangıçta render() çağırmıştı; DOM hazır olduğundan kabuk şimdi kurulur
ORV.apiYukle=function(){if(typeof zekaDurum=='function'&&API&&API.zeka&&!INFO.smoke)zekaDurum().then(function(){ORV.navGuncelle()})};
setTimeout(ORV.apiYukle,1500);
// ekip durumu kartı (hazır/çalışıyor) zamanla değişir: smoke dışında 4 sn'de bir yenile
if(!INFO.smoke)setInterval(function(){if(!document.hidden&&d.mod!='gizli')navCiz()},4000);
ORV.navHov=navHov;
ORV.baslat();
})();
