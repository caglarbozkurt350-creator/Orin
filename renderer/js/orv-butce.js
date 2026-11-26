// ========================================================================
// Orvane 0.9.11 · Ailem › Aylık Bütçe: Dashboard, Detaylar, Analiz (sekmeli).
// Tasarım: Claude Design "Ekran 9 · Bütçe sekmeleri" (GelirGiderSekmeli.dc.html). Düzen, hesaplar ve zamanlamalar oradaki renderVals'tan.
// GERÇEK VERİ: gelir/gider S.finans.kayit (fnS/fnKaydet, sirketim.js; Şirket kayıtları hariç), bakiyeler S.orvA.bak (OA.st().bak),
// cep harçlığı OA.cep(OA.fin()), bekleyen ödemeler OA.odemeler(). Bu sayfaya özgü kalıcı değer: S.orvA.giderHedef (aylık gider hedefi).
// Kayıt kuralları (orv-aile.js / orv-sayfa-a3.js ile aynı):
//  • Yeni kayıt fnKaydet ile yazılır, seçilen kasanın bakiyesine OA.bakIsle ile hemen işlenir (bakDus = kasa). Cep kasası Aile Bütçesine de işlenir.
//  • Düzenleme / silme: bakiyeye işlenmiş kayıtların (bakDus, ya da bakEk) eski etkisi geri alınır, yenisi işlenir.
//    İşlenmemiş kayıtlar (bakBeklenen'in saydıkları) yalnız alan olarak değişir.
//  • Kayıt dışı harcama/gelir bakiye bildirimi farkından otomatik oluşur; bildirilen bakiyenin içindedir, bu yüzden düzenlemek/silmek bakiyeyi değiştirmez.
//  • Bordrodan gelen maaş (id br YYYY-AA) Bordro sayfasıyla bağlıdır: burada yalnız açıklama ve kişi değişir.
// Değişiklikler save() ile durum.json'a yazılır; bulutOzet / OAI.esOzet bir sonraki eşitlemede iki telefona da gider.
// ========================================================================
var GG=window.GG||{};
(function(){
var AY=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],GK=['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
var E=function(s){return typeof esc=='function'?esc(s):String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')};
var p2=function(n){return String(n).padStart(2,'0')};
var tl=function(n){return Math.round(+n||0).toLocaleString('tr-TR')};
var imz=function(n){return (n<0?'−':'+')+tl(Math.abs(n))};
var SMOKE=function(){return typeof INFO!='undefined'&&INFO&&INFO.smoke};
GG.KD='Kayıt dışı harcama';GG.KDG='Kayıt dışı gelir';
GG.SEK=[['pano','Dashboard'],['detay','Detaylar'],['analiz','Analiz']];
GG.ui={sek:'pano',ay:null,q:'',tur:'Tümü',kisi:'Tümü',kalem:'Tümü',sk:'tarih',yon:-1,edit:null,yeni:false,hov:null};
GG.KISI={cagla:['Çağlar','#3b82f6'],kubra:['Kübra','#db2777'],ortak:['Ortak','#8b5cf6']};
GG.KASA={aile:'Aile Bütçesi',cagla:'Çağlar cep',kubra:'Kübra cep'};
GG.KAYNAK={masaustu:['Masaüstü','#a9a9b0'],telefon:['Telefon','#3b82f6'],'es-telefon':['Kübra telefon','#db2777'],banka:['İçe aktar','#06b6d4'],bakiye:['Bakiye bildirimi','#f59e0b'],bordro:['Bordro','#16a34a'],duzeltme:['Elle düzeltme','#a78bfa']};
GG.GRAD={'Maaş':'linear-gradient(160deg,#86efac,#16a34a)','Ek gelir':'linear-gradient(160deg,#bbf7d0,#22c55e)','Kira':'linear-gradient(160deg,#c4b0ff,#7c3aed)','Market':'linear-gradient(160deg,#ffc24a,#ff7a2f)','Fatura':'linear-gradient(160deg,#a5f3fc,#06b6d4)','Ev':'linear-gradient(160deg,#fbcfe8,#db2777)','Çocuk':'linear-gradient(160deg,#fde68a,#eab308)','Sağlık':'linear-gradient(160deg,#fecaca,#ef4444)','Ulaşım':'linear-gradient(160deg,#bfdbfe,#3b82f6)','Dışarıda yemek':'linear-gradient(160deg,#fed7aa,#ea580c)','Kayıt dışı harcama':'linear-gradient(160deg,#fde68a,#d97706)','Kayıt dışı gelir':'linear-gradient(160deg,#fde68a,#d97706)','Diğer':'linear-gradient(160deg,#d4d4d8,#71717a)'};
GG.DUZ=['var(--acc)','#7c3aed','#06b6d4','#eab308','#3b82f6','#71717a'];
GG.HUNI=['#3b82f6','#4f8ff7','#6aa1f8','#86b3fa','#a3c5fb'];
GG.grad=function(k){k=String(k||'');return GG.GRAD[k]||GG.GRAD[k.split(' · ')[0]]||(/^Maaş/.test(k)?GG.GRAD['Maaş']:/^Cep harçlığı|^Aile Bütçesi ·/.test(k)?'linear-gradient(160deg,#ffd27a,#ff7a2f)':GG.GRAD['Diğer'])};
GG.kalemler=function(ek){var L=['Maaş','Ek gelir','Kira'].concat(typeof OAI!='undefined'?OAI.ORTAK_KAT:['Market','Ev','Fatura','Çocuk','Sağlık','Ulaşım','Diğer']);L.splice(L.length-1,0,'Dışarıda yemek');if(ek&&L.indexOf(ek)<0)L.unshift(ek);return L};

// ---------- Kayıt modeli ----------
GG.buAy=function(){return OA.bugunKey().slice(0,7)};
GG.ay=function(){return GG.ui.ay||GG.buAy()};
GG.ayKay=function(ay,d){var x=new Date(+ay.slice(0,4),+ay.slice(5,7)-1+d,1);return x.getFullYear()+'-'+p2(x.getMonth()+1)};
GG.ayAd=function(ay){return AY[+ay.slice(5,7)-1]+' '+ay.slice(0,4)};
GG.kayitlar=function(){return (typeof fnS=='function'?fnS().kayit:[]).filter(function(k){return k&&k.kim!='sirket'})};
GG.kd=function(k){return k.tur=='gider'&&(k.kalem==GG.KD||(!!k.kd&&k.kaynak=='bakiye'&&/^Kayıt dışı/.test(k.kalem||'')))};
GG.kdHer=function(k){return k.kaynak=='bakiye'||!!k.kd||k.kalem==GG.KD||k.kalem==GG.KDG};
GG.kisi=function(k){if(GG.KISI[k.kisi])return k.kisi;if(/^es-/.test(k.kaynak||'')||k.hk=='e')return 'kubra';if(k.hk=='c'||k.tur=='gelir'||k.kaynak=='telefon')return 'cagla';return 'ortak'};
GG.kasa=function(k){return k.hk=='c'?'cagla':k.hk=='e'?'kubra':'aile'};
GG.kaynak=function(k){if(/^br\d{4}-\d{2}$/.test(k.id||''))return 'bordro';if(k.bakEk=='duzeltme')return 'duzeltme';return GG.KAYNAK[k.kaynak]?k.kaynak:'masaustu'};
GG.kilit=function(k){return /^br\d{4}-\d{2}$/.test(k.id||'')};
GG.isaret=function(tur){return tur=='gelir'?1:-1};
GG.bul=function(id){return (typeof fnS=='function'?fnS().kayit:[]).filter(function(x){return x.id==id})[0]||null};
// Kasa → bakiye anahtarı (Kübra cep harçlığı %0 iken harcamaları Aile Bütçesinden düşer)
GG.bakAnahtar=function(kasa){return kasa=='cagla'?'cagla':kasa=='kubra'?(OA.aileden&&OA.aileden('e')?'aile':'kubra'):'aile'};
// Kaydın bakiyeye işlenmiş etkisi: {alan:'bakDus'|'bakEk', k}. Kayıt dışı ve işlenmemiş kayıtlarda null.
GG.islenen=function(r){if(!r||GG.kdHer(r))return null;
 if(r.bakDus)return{alan:'bakDus',k:OA.KASA_AD[r.bakDus]?r.bakDus:(r.hk=='c'?'cagla':r.hk=='e'?GG.bakAnahtar('kubra'):'aile')};
 if(r.bakEk&&OA.KASA_AD[r.bakEk])return{alan:'bakEk',k:r.bakEk};return null};
GG.tutarOku=function(x){var s=String(x==null?'':x).trim().replace(/\s|₺/g,'');if(s.indexOf(',')>=0)s=s.replace(/\./g,'').replace(',','.');else if(/^\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');var t=Math.round((+s||0)*100)/100;return t>0&&t<=1e8?t:0};

// Yeni kayıt: fnKaydet + kasaya işleme. o: {tur, kalem, tarih, not, kisi, kasa, tutar}
GG.ekle=function(o){var t=GG.tutarOku(o.tutar);if(!t){toast('Tutarı yaz');return null}
 var r=fnKaydet({tur:o.tur=='gelir'?'gelir':'gider',kim:'cagla',tutar:String(t),kalem:o.kalem||'Diğer',tarih:o.tarih,not:o.not||'',kaynak:'masaustu'});if(!r)return null;
 if(GG.KISI[o.kisi])r.kisi=o.kisi;if(o.kasa=='cagla')r.hk='c';else if(o.kasa=='kubra')r.hk='e';
 var k=GG.bakAnahtar(o.kasa);if(OA.bakIsle(k,GG.isaret(r.tur)*r.tutar).length)r.bakDus=k;
 save();return r};
// Düzenleme: eski bakiye etkisi geri alınır, yeni değer işlenir
GG.guncelle=function(id,o){var r=GG.bul(id);if(!r)return null;
 if(GG.kilit(r)){r.not=String(o.not||'').slice(0,200);if(GG.KISI[o.kisi])r.kisi=o.kisi;save();return r}
 var t=GG.tutarOku(o.tutar);if(!t){toast('Tutarı yaz');return null}
 var tarih=/^\d{4}-\d{2}-\d{2}$/.test(o.tarih||'')?o.tarih:r.tarih,eski=GG.islenen(r),eTur=r.tur,eT=+r.tutar||0;
 r.tur=o.tur=='gelir'?'gelir':'gider';r.tutar=t;r.kalem=String(o.kalem||'Diğer').slice(0,40);r.tarih=tarih;r.not=String(o.not||'').slice(0,200);
 if(GG.KISI[o.kisi])r.kisi=o.kisi;if(o.kasa=='cagla')r.hk='c';else if(o.kasa=='kubra')r.hk='e';else delete r.hk;
 // Kayıt dışı harcama başka kaleme taşındıysa (ör. fiş bulundu → Market) artık kayıt dışı sayılmaz; bildirilen bakiyenin içinde kalır (bakEk)
 if(r.kd&&r.kalem!=GG.KD&&r.kalem!=GG.KDG)delete r.kd;
 if(eski){OA.bakIsle(eski.k,-GG.isaret(eTur)*eT);var k=GG.bakAnahtar(GG.kasa(r));if(OA.bakIsle(k,GG.isaret(r.tur)*t).length)r[eski.alan]=k;else delete r[eski.alan]}
 save();return r};
GG.silKayit=function(id){var r=GG.bul(id);if(!r||GG.kilit(r))return false;var eski=GG.islenen(r);if(eski)OA.bakIsle(eski.k,-GG.isaret(r.tur)*(+r.tutar||0));
 fnS().kayit=fnS().kayit.filter(function(x){return x.id!=id});save();return true};

// ---------- Hesaplar (seçili ay) ----------
GG.hedef=function(){var a=OA.st();return +a.giderHedef>0?+a.giderHedef:0};
GG.veri=function(ay){var K=GG.kayitlar(),onc=GG.ayKay(ay,-1),bu=GG.buAy();
 var ayR=K.filter(function(k){return String(k.tarih||'').slice(0,7)==ay}),oR=K.filter(function(k){return String(k.tarih||'').slice(0,7)==onc});
 var top=function(L,tr){return L.filter(function(r){return r.tur==tr}).reduce(function(n,r){return n+(+r.tutar||0)},0)};
 var v={ay:ay,onc:onc,ayR:ayR,gl:top(ayR,'gelir'),gd:top(ayR,'gider'),og:top(oR,'gelir'),od:top(oR,'gider')};
 v.kd=ayR.filter(GG.kd).reduce(function(n,r){return n+(+r.tutar||0)},0);
 v.gunSay=new Date(+ay.slice(0,4),+ay.slice(5,7),0).getDate();
 v.sonG=ay==bu?new Date().getDate():ay<bu?v.gunSay:0;
 // Günlük gider (Kira hariç: tek büyük ödeme eğriyi düzleştirmesin) ve birikmiş gider (hepsi)
 v.gunluk=[];v.bir=[];for(var i=0;i<=v.gunSay;i++){v.gunluk.push(0);v.bir.push(0)}
 ayR.forEach(function(r){if(r.tur!='gider')return;var g=+String(r.tarih).slice(8,10)||1;if(r.kalem!='Kira')v.gunluk[g]+=+r.tutar||0;v.bir[g]+=+r.tutar||0});
 for(i=1;i<=v.gunSay;i++)v.bir[i]+=v.bir[i-1];
 // Son 7 gün (seçili ay bu aysa bugünle biter, geçmiş aysa ayın son günüyle)
 var son=ay==bu?new Date():new Date(+ay.slice(0,4),+ay.slice(5,7),0);v.son7=[];
 for(i=6;i>=0;i--){var d=new Date(son.getFullYear(),son.getMonth(),son.getDate()-i),gk=OA.gunKey(d);v.son7.push({ad:GK[d.getDay()],gun:d.getDate(),v:K.filter(function(r){return r.tur=='gider'&&r.tarih==gk&&r.kalem!='Kira'}).reduce(function(n,r){return n+(+r.tutar||0)},0),bugun:i==0})}
 v.kat={};ayR.forEach(function(r){if(r.tur=='gider')v.kat[r.kalem||'Diğer']=(v.kat[r.kalem||'Diğer']||0)+(+r.tutar||0)});
 v.kl=Object.keys(v.kat).sort(function(x,y){return v.kat[y]-v.kat[x]});
 v.kisiT={};ayR.forEach(function(r){if(r.tur=='gider'){var k=GG.kisi(r);v.kisiT[k]=(v.kisiT[k]||0)+(+r.tutar||0)}});
 return v};
GG.fark=function(x,y,ters){if(!y)return{yazi:'—',renk:'var(--yazi2)'};var p=Math.round((x-y)/y*100);return{yazi:(p>0?'▲ ':p<0?'▼ ':'')+Math.abs(p)+'%',renk:p===0?'var(--yazi2)':((p>0)!==!!ters?'#7ee2a0':'#ff9a85')}};

// ---------- Sayaç ve animasyon yardımcıları ----------
// <span class="gg-say" data-v data-f="tl|imz|pct|int|pct1">: 0'dan son değere sayar (hareketi azalt / smoke: doğrudan son değer)
GG.fmt=function(v,f){return f=='imz'?imz(v):f=='pct'?'%'+Math.round(v):f=='pct1'?'%'+(Math.round(v*10)/10).toLocaleString('tr-TR'):f=='int'?String(Math.round(v)):tl(v)};
GG.say=function(v,f,gec){return '<span class="gg-say" data-v="'+(+v||0)+'" data-f="'+(f||'tl')+'" data-d="'+(gec||0)+'">'+GG.fmt(+v||0,f||'tl')+'</span>'};
GG.sayAnim=function(kok){if(!kok)return;var hizli=SMOKE()||(ORV.azalt&&ORV.azalt());if(hizli)return;
 [].forEach.call(kok.querySelectorAll('.gg-say'),function(e){var v=+e.getAttribute('data-v'),f=e.getAttribute('data-f'),gec=+e.getAttribute('data-d')||0,son=e.textContent;if(!isFinite(v)||!v||e._say||e.closest('.gg-sessiz'))return;e._say=1;e.textContent=GG.fmt(0,f);var t0=null;
  function adim(t){if(t0==null)t0=t;var x=Math.min(1,Math.max(0,(t-t0-gec*1000)/1400)),k=1-Math.pow(1-x,3);e.textContent=x>=1?son:GG.fmt(v*k,f);if(x<1&&document.body.contains(e))requestAnimationFrame(adim)}
  requestAnimationFrame(adim)})};
var gec=function(s){return 'animation-delay:'+s.toFixed(3)+'s'};
var kart=function(ic,d,sinif,st){return '<section class="gg-k'+(sinif?' '+sinif:'')+'" style="'+gec(d)+(st?';'+st:'')+'">'+ic+'</section>'};
// Tasarımdaki sıra: k1..k9 = 0,12 + i·0,09 sn
var K=function(i){return .12+i*.09};

// ---------- Kabuk ----------
GG.sayfa=function(){var u=GG.ui,ay=GG.ay(),i=GG.SEK.map(function(x){return x[0]}).indexOf(u.sek);
 var nav='<nav class="gg-sek" aria-label="Bütçe sekmeleri" style="--i:'+i+'"><span class="gg-hap" aria-hidden="true"></span>'+GG.SEK.map(function(x){var on=x[0]==u.sek;return '<button type="button" class="gg-sb'+(on?' on':'')+'" data-s="'+x[0]+'" aria-current="'+(on?'page':'false')+'" onclick="GG.sekme(\''+x[0]+'\')"><span class="gg-nk"></span>'+x[1]+'</button>'}).join('')+'</nav>';
 var ayS='<div class="gg-ays"><button type="button" class="gg-ab" aria-label="Önceki ay" onclick="GG.ayDegis(-1)">‹</button><b>'+E(GG.ayAd(ay))+'</b><button type="button" class="gg-ab" aria-label="Sonraki ay" onclick="GG.ayDegis(1)"'+(ay>=GG.buAy()?' disabled':'')+'>›</button></div>';
 return '<div class="gg" id="ggKok"><header class="gg-ust"><div class="gg-mk"><span class="gg-lg" aria-hidden="true">O</span><div><b>Aylık Bütçe</b><small>Aile Bütçesi · gelir ve gider</small></div></div>'+nav+'<div class="gg-sag">'+ayS+'<span class="gg-av" aria-label="Çağlar">Ç</span></div></header><div id="ggGovde"'+(GG._sessiz?' class="gg-sessiz"':'')+'>'+GG.govde()+'</div></div>'};
GG.govde=function(){var u=GG.ui,v=GG.veri(GG.ay());return u.sek=='detay'?GG.detay(v):u.sek=='analiz'?GG.analiz(v):GG.pano(v)};
GG.sonra=function(){var k=document.getElementById('ggKok');if(k){GG.sayAnim(k);GG.czBagla()}GG._sessiz=false};
// Sekme değişimi: kabuk yerinde kalır, hap gösterge kayar, yalnız gövde yeniden çizilir
GG.sekme=function(s,koru){if(GG.ui.sek==s)return;GG.ui.sek=s;if(!koru){GG.ui.edit=null;GG.ui.yeni=false}GG.ui.hov=null;var n=document.querySelector('#ggKok .gg-sek');
 if(!n){ORV.yenile();return}n.style.setProperty('--i',GG.SEK.map(function(x){return x[0]}).indexOf(s));[].forEach.call(n.querySelectorAll('.gg-sb'),function(b){var on=b.getAttribute('data-s')==s;b.classList.toggle('on',on);b.setAttribute('aria-current',on?'page':'false')});GG.govdeYenile(true)};
GG.govdeYenile=function(anim){var g=document.getElementById('ggGovde');if(!g){ORV.yenile();return}g.classList.toggle('gg-sessiz',!anim);g.innerHTML=GG.govde();GG.sonra()};
GG.ayDegis=function(d){var y=GG.ayKay(GG.ay(),d);if(y>GG.buAy())return;GG.ui.ay=y==GG.buAy()?null:y;GG.ui.edit=null;GG.ui.yeni=false;GG.ui.hov=null;GG.ui.kalem='Tümü';ORV.yenile()};

// ---------- DASHBOARD ----------
GG.pano=function(v){var a=OA.st(),B=a.bak||{},ab=B.aile,bu=v.ay==GG.buAy(),hedef=GG.hedef();
 var bek=bu?OA.odemeler().reduce(function(s,o){return s+(+o.tutar||0)},0):0,C=null;try{C=OA.cep(OA.fin())}catch(e){}
 // 1) Aile Bütçesi bakiyesi
 var k1='<div class="gg-r"><span class="gg-et"><span class="gg-nok" style="background:var(--acc)"></span>Aile Bütçesi · güncel bakiye</span>'+(ab?'<span class="gg-pil g">'+E(OA.tarihSaat(ab.ts))+'</span>':'')+'</div>'+
  (ab?'<div class="gg-buyuk"><span>'+GG.say(ab.t,'tl')+'</span><i>₺</i></div><div class="gg-alt">'+(bek?'Bekleyen ödemelerden ('+tl(bek)+' ₺) sonra <b>'+GG.say(Math.max(0,ab.t-bek),'tl',.18)+' ₺</b> kalır':'Bekleyen ödeme yok')+'</div>'
   :'<div class="gg-buyuk soluk"><span>—</span></div><div class="gg-alt">Veri bekleniyor · Aile Bütçesi bakiyesi bildirilince görünür</div>')+
  '<div class="gg-dz"><button type="button" class="gg-btn" onclick="GG.yeniKayit(\'gider\')">+ Gider ekle</button><button type="button" class="gg-btn ikinci" onclick="OA.bakDlg(\'aile\')">↑ Bakiye bildir</button></div>';
 // 2) Son 7 gün: kare bloklar
 var m7=Math.max.apply(null,v.son7.map(function(c){return c.v})),birim=Math.max(250,Math.ceil(m7/6/50)*50),top7=v.son7.reduce(function(n,c){return n+c.v},0);
 var bl=v.son7.map(function(c,ci){var dolu=Math.min(6,Math.ceil(c.v/birim));return '<div class="gg-bs"><div class="gg-kareler">'+[0,1,2,3,4,5].map(function(ri){var on=ri<dolu,r=on?(c.bugun?'var(--acc)':(ri>=dolu-1?'#60a5fa':'#3b82f6')):'rgba(255,255,255,.07)';return '<span class="gg-kare'+(on?' on':'')+'" style="background:'+r+';'+gec(.3+ci*.07+ri*.055)+'"></span>'}).join('')+'</div><span class="gg-bg'+(c.bugun?' on':'')+'" title="'+c.gun+' · '+tl(c.v)+' ₺">'+c.ad+'</span></div>'}).join('');
 var k2='<div class="gg-r gg-et"><span>Son 7 gün harcama'+(bu?'':' · '+E(AY[+v.ay.slice(5,7)-1])+' sonu')+'</span><b class="gg-b">'+GG.say(top7,'tl',.3)+' ₺</b></div><div class="gg-bloklar" role="img" aria-label="'+E('Son yedi günün harcaması: '+v.son7.map(function(c){return c.ad+' '+tl(c.v)+' lira'}).join(', ')+'. Bir kare '+tl(birim)+' lira; kira hariç.')+'">'+bl+'</div>';
 // 3-5) gelir, gider, hedef
 var fg=GG.fark(v.gl,v.og),fd=GG.fark(v.gd,v.od,true),hO=hedef?Math.min(1,v.gd/hedef):0;
 var k3='<span class="gg-yu" style="background:#16a34a" aria-hidden="true">↓</span><div class="gg-et">Bu ay gelir</div><div class="gg-orta">'+GG.say(v.gl,'tl',.35)+' ₺</div><span class="gg-fk" style="color:'+fg.renk+'">'+fg.yazi+' geçen aya göre</span>';
 // 0.9.12: gelir üst sınırı = önceki ayın bordrosu Net Ödenen + SGK ödeneği (BKR, orv-butce-kural.js)
 var sn=typeof BKR!='undefined'&&BKR.sinir?BKR.sinir(v.ay):null;
 if(sn)k3+='<span class="gg-sn'+(v.gl>sn.sinir+0.005?' asim':'')+'" data-sinir="'+sn.sinir+'">'+(v.gl>sn.sinir+0.005?'▲ Bordro sınırını '+tl(v.gl-sn.sinir)+' ₺ aşıyor':'Sınır '+tl(sn.sinir)+' ₺')+' · Net Ödenen'+(sn.sgk?' + SGK ödeneği':'')+'</span>';
 var k4='<span class="gg-yu" style="background:var(--acc)" aria-hidden="true">↑</span><div class="gg-et">Bu ay gider</div><div class="gg-orta">'+GG.say(v.gd,'tl',.4)+' ₺</div><span class="gg-fk" style="color:'+fd.renk+'">'+fd.yazi+' geçen aya göre</span>';
 var k5=hedef?'<div class="gg-r gg-et"><span>Aylık gider hedefi · '+tl(hedef)+' ₺ <button type="button" class="gg-lnk" onclick="GG.hedefDlg()">değiştir</button></span><span>'+GG.say(hO*100,'pct',.45)+'</span></div><div class="gg-hdf" role="img" aria-label="'+E('Gider '+tl(v.gd)+' lira, hedefin yüzde '+Math.round(hO*100)+'’i')+'"><div class="gg-hz"></div><div class="gg-hd" style="width:'+(hO*100).toFixed(1)+'%"></div><span class="gg-hb'+(hO>.8?' sag':'')+'" style="left:'+(hO*100).toFixed(1)+'%">'+tl(v.gd)+' ₺</span><span class="gg-hn" style="left:'+(hO*100).toFixed(1)+'%"></span></div>'
  :'<div class="gg-r gg-et"><span>Aylık gider hedefi</span></div><div class="gg-alt">Hedef yok. Belirlersen gider çubuğu ve “Ay sonuna kalan” buna göre hesaplanır.</div><div><button type="button" class="gg-btn ikinci kucuk" onclick="GG.hedefDlg()">Hedef belirle</button></div>';
 // 6) Ay sonuna kalan (yay): hedef varsa hedeften, yoksa bu ayın gelirinden
 var taban=hedef||v.gl,kalan=Math.max(0,taban-v.gd),kO=taban?kalan/taban:0,aci=(151.04+kO*237.92)*Math.PI/180;
 var k6='<div class="gg-r"><b class="gg-bas">Ay sonuna kalan</b><span class="gg-hal" aria-hidden="true"></span></div><div class="gg-yay"><svg viewBox="0 0 200 150" aria-hidden="true"><defs><linearGradient id="ggYay" x1="0" x2="1"><stop offset="0" stop-color="var(--acc2)"/><stop offset="1" stop-color="var(--acc)"/></linearGradient></defs><path d="M 30 130 A 80 80 0 1 1 170 130" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="12" stroke-linecap="round" pathLength="1"/>'+
  (kO>0?'<path class="gg-ciz" d="M 30 130 A 80 80 0 1 1 170 130" fill="none" stroke="url(#ggYay)" stroke-width="12" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="'+(1-kO).toFixed(4)+'" style="'+gec(.5)+';animation-duration:1.5s"/>':'')+
  '<circle class="gg-sol" cx="'+(100+80*Math.cos(aci)).toFixed(1)+'" cy="'+(91.27+80*Math.sin(aci)).toFixed(1)+'" r="7" fill="#fff" stroke="var(--acc)" stroke-width="3" style="'+gec(1.7)+'"/></svg><div class="gg-yi"><span>Kalan</span><b>'+GG.say(kalan,'tl',.5)+' ₺</b><small>'+(taban?'/ '+tl(taban)+' ₺ '+(hedef?'hedef':'gelir'):'gelir ya da hedef girilince')+'</small></div></div><span class="gg-ok" aria-hidden="true">↗</span>';
 // 7) Cep harçlığı (silindir + bilgi kutusu)
 var k7;if(C&&bu){var hc=C.c.harcanan||0,he=C.e.harcanan||0,lim=(C.c.har||0)+(C.e.aile?0:(C.e.har||0)),cO=lim?Math.min(1,(hc+(C.e.aile?0:he))/lim):0;
  k7='<div class="gg-r gg-et"><span>Cep harçlığı kullanımı</span><span>bu ay</span></div>'+(lim?'<div class="gg-cep"><div class="gg-sil" role="img" aria-label="'+E('Cep harçlığının yüzde '+Math.round(cO*100)+'’i harcandı')+'"><span class="gg-sd" style="height:'+(cO*100).toFixed(1)+'%;'+gec(.6)+'"></span><span class="gg-su" style="bottom:'+(cO*100).toFixed(1)+'%;'+gec(1.6)+'"></span></div>'+
   '<div class="gg-ip" style="'+gec(1.3)+'"><b>'+GG.say(cO*100,'pct',.7)+' harcandı</b><span><span><i style="background:#3b82f6"></i>Çağlar</span><b>'+GG.say(hc,'tl',.9)+' ₺</b></span><span><span><i style="background:#db2777"></i>Kübra'+(C.e.aile?' <small>(Aile Bütçesinden)</small>':'')+'</span><b>'+GG.say(he,'tl',.9)+' ₺</b></span><span class="gg-sk">Toplam harçlık '+tl(lim)+' ₺ · günlük '+tl(C.c.limit||0)+' ₺</span></div></div>'
   :OA.bos('para','Veri bekleniyor',a.cep&&a.cep.mod=='bakiye'?'Cep bakiyeleri bildirilince görünür.':'Gelir ve gider girilince harçlık hesaplanır.',150))}
 else k7='<div class="gg-r gg-et"><span>Cep harçlığı kullanımı</span></div><div class="gg-alt">Cep harçlığı yalnız içinde bulunulan ay için hesaplanır. Bu ay: '+E(GG.ayAd(GG.buAy()))+'.</div>';
 // 8) Ay sonu raporu
 var kg=C?C.kalanGun:0,k8='<div class="gg-r"><span class="gg-mavi">'+(bu?kg+' gün sonra':'Ay kapandı')+'</span><button type="button" class="gg-btn ikinci kucuk" onclick="GG.sekme(\'analiz\')">Analize git</button></div><div class="gg-bas2">Ay sonu raporu</div><div class="gg-alt">Gelir, gider, kalemler ve kayıt dışı harcama tek PDF’te. Kayıt dışı '+(bu?'bu ay':'bu ayda')+' <b class="gg-kdt">'+GG.say(v.kd,'tl',.8)+' ₺</b>.</div><div class="gg-r gg-dip"><span class="gg-alt"><b class="gg-adet">'+GG.say(v.ayR.length,'int',.8)+'</b> kayıt</span><button type="button" class="gg-btn cerceve" onclick="GG.pdf()"><span class="gg-ind" aria-hidden="true">↓</span>PDF indir</button></div>';
 return '<div class="gg-sut"><div class="gg-g3">'+kart(k1,K(0))+kart(k2,K(1))+'<div class="gg-g2">'+kart(k3,K(2),'kc')+kart(k4,K(3),'kc')+kart(k5,K(4),'kc tam')+'</div></div>'+
  '<div class="gg-g3">'+kart(k6,K(5),'koyu')+kart(k7,K(6))+kart(k8,K(7))+'</div></div>'};
GG.hedefDlg=function(){var h=GG.hedef(),v=GG.veri(GG.ayKay(GG.buAy(),-1)),on=v.gd?Math.ceil(v.gd/1000)*1000:0;
 OA.dlg('<h3>Aylık gider hedefi</h3><label class="oa-zl">Tutar (₺)<input class="oa-in" id="ggHd" inputmode="decimal" value="'+(h||on||'')+'" placeholder="ör. 30.000"></label><span class="oa-sub">'+(on?'Geçen ayın gideri '+tl(v.gd)+' ₺. ':'')+'Boş bırakırsan hedef kalkar.</span><div class="acts"><button type="button" class="oa-btn ghost" onclick="OA.dlgKapat()">Vazgeç</button><button type="button" class="oa-btn" onclick="GG.hedefKaydet()">Kaydet</button></div>')};
GG.hedefKaydet=function(){var el=document.getElementById('ggHd'),t=GG.tutarOku(el&&el.value),a=OA.st();if(t)a.giderHedef=t;else delete a.giderHedef;OA.kaydet();OA.dlgKapat();toast(t?'Aylık gider hedefi '+tl(t)+' ₺':'Gider hedefi kaldırıldı');ORV.yenile()};

// ---------- DETAYLAR ----------
GG.satirlar=function(v){var u=GG.ui,q=String(u.q||'').trim().toLocaleLowerCase('tr');
 var L=v.ayR.map(function(k){var ki=GG.kisi(k),ka=GG.kasa(k),ky=GG.kaynak(k);return{id:k.id,k:k,tarih:k.tarih,tur:k.tur,kalem:k.kalem||'Diğer',not:k.not||'',kisi:ki,kisiAd:GG.KISI[ki][0],kasa:ka,kasaAd:GG.KASA[ka],kaynak:ky,kaynakAd:GG.KAYNAK[ky][0],tutar:+k.tutar||0,ts:k.ts||0}});
 var f=L.filter(function(r){return (u.tur=='Tümü'||(u.tur=='Gelir')==(r.tur=='gelir'))&&(u.kalem=='Tümü'||r.kalem==u.kalem)&&(u.kisi=='Tümü'||r.kisi==u.kisi)&&(!q||(r.not+' '+r.kalem+' '+r.kisiAd+' '+r.kasaAd+' '+r.kaynakAd).toLocaleLowerCase('tr').indexOf(q)>=0)});
 var alan={kalem:'kalem',tarih:'tarih',not:'not',kisi:'kisiAd',kasa:'kasaAd',kaynak:'kaynakAd'}[u.sk];
 f.sort(function(x,y){var p=u.sk=='tutar'?GG.isaret(x.tur)*x.tutar-GG.isaret(y.tur)*y.tutar:String(x[alan]).localeCompare(String(y[alan]),'tr');return (p||(x.ts-y.ts))*u.yon});
 return{tum:L,f:f}};
GG.KOL=[['kalem','Kalem','left'],['tarih','Tarih','left'],['not','Açıklama','left'],['kisi','Kişi','left'],['kasa','Kasa','left'],['kaynak','Kaynak','left'],['tutar','Tutar','right']];
GG.detay=function(v){var u=GG.ui,S=GG.satirlar(v);
 var ust='<div class="gg-dbas gg-gir" style="'+gec(K(0))+'"><h1>Detaylar</h1><div class="gg-grp" role="group" aria-label="Tür">'+['Tümü','Gelir','Gider'].map(function(x){return '<button type="button" class="gg-cb'+(u.tur==x?' on':'')+'" aria-pressed="'+(u.tur==x)+'" onclick="GG.suz(\'tur\',\''+x+'\')">'+x+'</button>'}).join('')+'</div><button type="button" class="gg-btn kucuk" onclick="GG.yeniKayit(\'gider\')">+ Kayıt ekle</button></div>';
 var kpi=[['Kayıt',GG.say(v.ayR.length,'int',.2),'linear-gradient(160deg,#bfdbfe,#3b82f6)'],['Gider kalemi',GG.say(v.kl.length,'int',.25),'linear-gradient(160deg,#c4b0ff,#7c3aed)'],['Toplam gider',GG.say(v.gd,'tl',.3)+' ₺','linear-gradient(160deg,var(--acc2),var(--acc))'],['Kayıt dışı',GG.say(v.kd,'tl',.35)+' ₺','linear-gradient(160deg,#fde68a,#d97706)']];
 var kp='<div class="gg-kpi">'+kpi.map(function(x,i){return kart('<span class="gg-ky" style="background:'+x[2]+'" aria-hidden="true"></span><span class="gg-et">'+x[0]+'</span><b class="gg-kd'+(i==3&&v.kd?' kdr':'')+'">'+x[1]+'</b>',.15+i*.08,'kpi')}).join('')+'</div>';
 var kalemS=['Tümü'].concat(Array.from(new Set(S.tum.map(function(r){return r.kalem}))).sort(function(x,y){return x.localeCompare(y,'tr')}));
 var cip=['Tümü','cagla','kubra','ortak'].map(function(x){var ad=x=='Tümü'?'Tümü':GG.KISI[x][0],n=x=='Tümü'?S.tum.length:S.tum.filter(function(r){return r.kisi==x}).length;return '<button type="button" class="gg-cip'+(u.kisi==x?' on':'')+'" aria-pressed="'+(u.kisi==x)+'" onclick="GG.suz(\'kisi\',\''+x+'\')">'+ad+' <span>'+n+'</span></button>'}).join('');
 var arac='<div class="gg-arac"><label class="gg-ara"><span class="gg-gz">Ara</span><input type="search" id="ggAra" value="'+E(u.q)+'" placeholder="Ara: açıklama, kalem, kişi" oninput="GG.ara(this.value)"></label><div class="gg-cips">'+cip+'</div><label class="gg-kls">Kalem<select id="ggKalem" onchange="GG.suz(\'kalem\',this.value)">'+kalemS.map(function(o){return '<option'+(o==u.kalem?' selected':'')+'>'+E(o)+'</option>'}).join('')+'</select></label></div>';
 return '<div class="gg-sut">'+ust+kp+kart(arac+'<div class="gg-tk" id="ggTablo">'+GG.tablo(v,S,true)+'</div>',K(2),'tablo')+'</div>'};
GG.tablo=function(v,S,anim){var u=GG.ui;S=S||GG.satirlar(v);
 var th='<thead><tr>'+GG.KOL.map(function(k){var on=u.sk==k[0];return '<th scope="col" style="text-align:'+k[2]+'" aria-sort="'+(on?(u.yon<0?'descending':'ascending'):'none')+'"><button type="button" class="gg-th'+(on?' on':'')+'" style="text-align:'+k[2]+'" onclick="GG.sirala(\''+k[0]+'\')">'+k[1]+' '+(on?(u.yon<0?'↓':'↑'):'')+'</button></th>'}).join('')+'<th scope="col" style="width:48px"><span class="gg-gz">İşlem</span></th></tr></thead>';
 var satir=S.f.map(function(r,i){if(u.edit==r.id)return GG.duzenSatir(r.k);var kd=GG.kdHer(r.k);
  return '<tr class="gg-tr'+(kd?' kd':'')+(anim&&i<24?' gg-gir':'')+'" style="'+(anim&&i<24?gec(.38+i*.045):'')+'"><td><span class="gg-kal"><span class="gg-kr" style="background:'+GG.grad(r.kalem)+'" aria-hidden="true"></span><b>'+E(r.kalem)+'</b>'+(kd?'<span class="gg-kdp" title="Bakiye bildirimi farkından otomatik oluştu">otomatik</span>':'')+'</span></td><td class="soluk nw">'+(+r.tarih.slice(8,10))+' '+AY[+r.tarih.slice(5,7)-1].slice(0,3)+'</td><td class="not">'+E(r.not)+'</td><td><span class="gg-ks"><span class="gg-kh" style="background:'+GG.KISI[r.kisi][1]+'" aria-hidden="true">'+r.kisiAd.charAt(0)+'</span>'+r.kisiAd+'</span></td><td class="soluk">'+r.kasaAd+'</td><td><span class="gg-kyn"><span style="background:'+GG.KAYNAK[r.kaynak][1]+'"></span>'+r.kaynakAd+'</span></td><td class="gg-tt '+(r.tur=='gelir'?'gelir':'')+'">'+(r.tur=='gelir'?'+':'−')+tl(r.tutar)+' ₺</td><td class="gg-is"><button type="button" class="gg-kalem" aria-label="'+E(r.kalem+' kaydını düzenle')+'" onclick="GG.duzenle(\''+E(r.id)+'\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button></td></tr>'}).join('');
 if(u.yeni)satir=GG.duzenSatir(null)+satir;
 if(!satir)satir='<tr><td colspan="8" class="gg-bos">'+(v.ayR.length?'Bu süzgece uyan kayıt yok.':'Bu ay kayıt yok. “+ Kayıt ekle” ile başla.')+'</td></tr>';
 var fg=S.f.filter(function(r){return r.tur=='gelir'}).reduce(function(n,r){return n+r.tutar},0),fd=S.f.filter(function(r){return r.tur=='gider'}).reduce(function(n,r){return n+r.tutar},0);
 return '<div class="gg-ts"><table class="gg-tab"><caption class="gg-gz">'+E(GG.ayAd(v.ay))+' gelir ve gider kayıtları</caption>'+th+'<tbody>'+satir+'</tbody></table></div><div class="gg-top">'+S.f.length+' kayıt · gelir '+tl(fg)+' ₺ · gider '+tl(fd)+' ₺ · net <b style="color:'+(fg-fd<0?'#ff9a85':'#7ee2a0')+'">'+imz(fg-fd)+' ₺</b>'+(v.kd?' · <span class="gg-kdt">kayıt dışı '+tl(v.kd)+' ₺</span>':'')+'</div>'};
// Yerinde düzenleme satırı (r null ise yeni kayıt)
GG.duzenSatir=function(r){var yeni=!r,kil=r&&GG.kilit(r),kd=r&&GG.kdHer(r),ay=GG.ay(),bugun=OA.bugunKey(),tarih=r?r.tarih:(ay==GG.buAy()?bugun:ay+'-'+p2(new Date(+ay.slice(0,4),+ay.slice(5,7),0).getDate()));
 var o=r?{tur:r.tur,kalem:r.kalem||'Diğer',not:r.not||'',kisi:GG.kisi(r),kasa:GG.kasa(r),tutar:String(r.tutar).replace('.',',')}:{tur:GG.ui.yeniTur||'gider',kalem:GG.ui.yeniTur=='gelir'?'Ek gelir':'Market',not:'',kisi:'ortak',kasa:'aile',tutar:''};
 var dis=kil?' disabled':'',sel=function(id,lbl,L,deg){return '<select id="'+id+'" aria-label="'+lbl+'"'+dis+'>'+L.map(function(x){return '<option value="'+E(x[0])+'"'+(x[0]==deg?' selected':'')+'>'+E(x[1])+'</option>'}).join('')+'</select>'};
 var not=kil?'Bordrodan gelen maaş: tutar, tarih ve kasa Bordro sayfasından değişir.':kd?'Bakiye bildirimi farkından otomatik oluştu. Bildirilen bakiyenin içinde olduğu için değiştirmek ya da silmek bakiyeyi değiştirmez; kalemi değiştirirsen artık kayıt dışı sayılmaz.':yeni?'Kayıt seçilen kasanın bakiyesine hemen işlenir.':GG.islenen(r)?'Kayıt kasaya işlenmiş; değişiklik bakiyeye fark olarak yansır.':'Kayıt bakiyeye işlenmemiş (sonraki bakiye bildiriminde hesaba katılır).';
 return '<tr class="gg-ed" id="ggEd" data-id="'+E(r?r.id:'')+'"><td>'+sel('ggEKa','Kalem',GG.kalemler(o.kalem).map(function(x){return[x,x]}),o.kalem)+'</td><td><input type="date" id="ggETa" aria-label="Tarih" value="'+E(tarih)+'"'+dis+'></td><td><input type="text" id="ggENo" aria-label="Açıklama" value="'+E(o.not)+'" maxlength="200" placeholder="Açıklama"></td>'+
  '<td><select id="ggEKi" aria-label="Kişi">'+Object.keys(GG.KISI).map(function(x){return '<option value="'+x+'"'+(x==o.kisi?' selected':'')+'>'+GG.KISI[x][0]+'</option>'}).join('')+'</select></td><td>'+sel('ggEKs','Kasa',Object.keys(GG.KASA).map(function(x){return[x,GG.KASA[x]]}),o.kasa)+'</td><td>'+sel('ggETu','Tür',[['gider','Gider'],['gelir','Gelir']],o.tur)+'</td><td><input type="text" id="ggETt" inputmode="decimal" aria-label="Tutar" value="'+E(o.tutar)+'" placeholder="0"'+dis+' class="gg-tin"></td><td></td></tr>'+
  '<tr class="gg-ed2"><td colspan="8"><div class="gg-edd"><span class="gg-edn">'+E(not)+'</span>'+(yeni||kil?'':'<button type="button" class="gg-btn sil kucuk" onclick="GG.sil()">Sil</button>')+'<button type="button" class="gg-btn cerceve kucuk" onclick="GG.vazgec()">Vazgeç</button><button type="button" class="gg-btn kucuk" onclick="GG.kaydet()">Kaydet</button></div></td></tr>'};
GG.tabloYenile=function(){var t=document.getElementById('ggTablo');if(!t)return GG.govdeYenile(false);t.innerHTML=GG.tablo(GG.veri(GG.ay()),null,false)};
GG.suz=function(k,x){GG.ui[k]=x;GG.ui.edit=null;GG.ui.yeni=false;GG.govdeYenile(false)};
GG.ara=function(q){GG.ui.q=q;GG.tabloYenile()};
GG.sirala=function(k){var u=GG.ui;u.yon=u.sk==k?-u.yon:(k=='tarih'||k=='tutar'?-1:1);u.sk=k;GG.tabloYenile()};
GG.duzenle=function(id){GG.ui.edit=id;GG.ui.yeni=false;GG.tabloYenile();var e=document.getElementById('ggETt');if(e&&!e.disabled)e.focus();else{e=document.getElementById('ggENo');if(e)e.focus()}};
GG.yeniKayit=function(tur){var u=GG.ui,ilk=u.sek!='detay';u.yeni=true;u.yeniTur=tur||'gider';u.edit=null;u.q='';u.tur='Tümü';u.kisi='Tümü';u.kalem='Tümü';u.sk='tarih';u.yon=-1;
 if(ilk)GG.sekme('detay',true);else GG.govdeYenile(false);var e=document.getElementById('ggETt');if(e)e.focus()};
GG.oku=function(){var g=function(id){var e=document.getElementById(id);return e?e.value:''};return{kalem:g('ggEKa'),tarih:g('ggETa'),not:g('ggENo').trim(),kisi:g('ggEKi'),kasa:g('ggEKs'),tur:g('ggETu'),tutar:g('ggETt')}};
GG.kaydet=function(){var o=GG.oku(),ed=document.getElementById('ggEd'),id=ed&&ed.getAttribute('data-id'),r;
 if(GG.ui.yeni){r=GG.ekle(o);if(!r)return;toast((r.tur=='gelir'?'Gelir':'Gider')+' eklendi: '+tl(r.tutar)+' ₺'+(r.bakDus?' · '+OA.KASA_AD[r.bakDus]+' bakiyesine işlendi':''))}
 else{r=GG.guncelle(id,o);if(!r)return;toast('Kayıt güncellendi')}
 var ayDegisti=String(r.tarih).slice(0,7)!=GG.ay();if(ayDegisti){GG.ui.ay=String(r.tarih).slice(0,7)==GG.buAy()?null:String(r.tarih).slice(0,7)}
 GG.ui.edit=null;GG.ui.yeni=false;if(ayDegisti)GG.yenileHepsi();else GG.govdeYenile(false)};
GG.vazgec=function(){GG.ui.edit=null;GG.ui.yeni=false;GG.tabloYenile()};
GG.sil=function(){var ed=document.getElementById('ggEd'),id=ed&&ed.getAttribute('data-id'),r=GG.bul(id);if(!r)return;
 confirmBox('“'+E(r.kalem)+' · '+tl(r.tutar)+' ₺” silinsin mi?'+(GG.islenen(r)?' Bakiyeye işlenmiş etkisi geri alınır.':''),function(){if(GG.silKayit(id))toast('Kayıt silindi');GG.ui.edit=null;GG.govdeYenile(false)},'Sil')};
// Kayıt değişince sayfa sessizce yeniden çizilir (ay başlığı ve özet kartları da güncellensin)
GG.yenileHepsi=function(){GG._sessiz=true;ORV.yenile();GG._sessiz=false};

// ---------- ANALİZ ----------
GG.egri=function(P){if(!P.length)return '';var d='M'+P[0][0].toFixed(1)+' '+P[0][1].toFixed(1);for(var i=1;i<P.length;i++){var a=P[i-1],b=P[i],mx=(a[0]+b[0])/2;d+=' C'+mx.toFixed(1)+' '+a[1].toFixed(1)+' '+mx.toFixed(1)+' '+b[1].toFixed(1)+' '+b[0].toFixed(1)+' '+b[1].toFixed(1)}return d};
GG.izg=function(tp,Yf){return [0,1,2,3].map(function(k){var v=tp/1.15*k/3,y=Yf(v);return '<line x1="44" x2="590" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="rgba(255,255,255,0.06)"/><text x="38" y="'+(y+4).toFixed(1)+'" fill="#8e8e95" font-size="11" text-anchor="end">'+(v>=1000?(v/1000).toFixed(v>=10000?0:1).replace('.',',')+' bin':tl(v))+'</text>'}).join('')};
GG.analiz=function(v){var hedef=GG.hedef(),ayK=AY[+v.ay.slice(5,7)-1],fg=GG.fark(v.gl,v.og),fd=GG.fark(v.gd,v.od,true),fn=GG.fark(v.gl-v.gd,v.og-v.od);
 var bas='<div class="gg-dbas an gg-gir" style="'+gec(K(0))+'"><h1>Analiz</h1><span class="gg-i" aria-hidden="true">i</span><span class="gg-alt">'+E(GG.ayAd(v.ay))+' · Şirket kayıtları hariç</span></div>';
 var net=kart('<div class="gg-r"><span class="gg-ky beyaz" aria-hidden="true"></span><span class="gg-pil beyaz">'+fn.yazi+'</span></div><b class="gg-netb">'+GG.say(v.gl-v.gd,'imz',.15)+' ₺</b><span class="gg-nets">Bu ay net</span><span class="gg-cub" aria-hidden="true"></span><span class="gg-ny" aria-hidden="true"></span>',K(0),'net');
 var kp=[['Bu ay gelir',GG.say(v.gl,'tl',.2)+' ₺',fg,'linear-gradient(160deg,#86efac,#16a34a)'],['Gelirin harcanan kısmı',GG.say(v.gl?v.gd/v.gl*100:0,'pct1',.25),fd,'linear-gradient(160deg,#c4b0ff,#7c3aed)'],['Kayıt dışı harcama',GG.say(v.kd,'tl',.3)+' ₺',{yazi:v.gd?'%'+Math.round(v.kd/v.gd*100)+' pay':'',renk:'#ffd27a'},'linear-gradient(160deg,#fde68a,#d97706)']];
 var ust='<div class="gg-g4">'+net+kp.map(function(x,i){return kart('<div class="gg-r"><span class="gg-ky" style="background:'+x[3]+'" aria-hidden="true"></span><span class="gg-fk" style="color:'+x[2].renk+'">'+x[2].yazi+'</span></div><b class="gg-kd2'+(i==2&&v.kd?' kdr':'')+'">'+x[1]+'</b><div class="gg-r gg-et"><span>'+x[0]+'</span><span class="gg-mn" aria-hidden="true"></span></div>',K(i+1))}).join('')+'</div>';
 // Günlük gider eğrisi
 var gS=v.gunSay,sonG=v.sonG,tepe1=Math.max(500,Math.max.apply(null,v.gunluk))*1.15,X=function(i){return 44+(i-1)/(gS-1)*546},Y1=function(x){return 205-x/tepe1*180};
 var nk=[];for(var i=1;i<=sonG;i++)nk.push([X(i),Y1(v.gunluk[i])]);var yol=GG.egri(nk),tepeI=1;for(i=1;i<=sonG;i++)if(v.gunluk[i]>v.gunluk[tepeI])tepeI=i;
 GG._cz={X:X,Y1:Y1,gunluk:v.gunluk,sonG:sonG,gS:gS,ayK:ayK,tepeI:tepeI};
 var cz='<div class="gg-r"><b class="gg-bas">Günlük gider</b><span class="gg-et"><span class="gg-nok" style="background:var(--acc)"></span>'+E(GG.ayAd(v.ay))+' · kira hariç</span></div><div class="gg-cz" id="ggCz"><svg viewBox="0 0 600 230" role="img" aria-label="'+E(sonG?'Günlük gider çizgisi; en yüksek gün '+tepeI+' '+ayK+', '+tl(v.gunluk[tepeI])+' lira':'Bu ay için henüz gün yok')+'"><defs><linearGradient id="ggAlan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--acc)" stop-opacity="0.35"/><stop offset="1" stop-color="var(--acc)" stop-opacity="0"/></linearGradient></defs>'+GG.izg(tepe1,Y1)+
  [1,8,15,22,gS].map(function(d){return '<text x="'+X(d).toFixed(1)+'" y="226" fill="#8e8e95" font-size="11" text-anchor="'+(d==1?'start':d==gS?'end':'middle')+'">'+d+' '+ayK.slice(0,3)+'</text>'}).join('')+
  (yol?'<path class="gg-sol" d="'+yol+' L'+X(sonG).toFixed(1)+' 205 L44 205 Z" fill="url(#ggAlan)" style="'+gec(1.5)+'"/><path class="gg-ciz" d="'+yol+'" fill="none" stroke="var(--acc)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="0" style="'+gec(.7)+';animation-duration:1.4s"/>'+
   '<g id="ggCzIp" class="gg-sol" style="'+gec(1.9)+'"><line id="ggCzL" x1="'+X(tepeI).toFixed(1)+'" x2="'+X(tepeI).toFixed(1)+'" y1="20" y2="205" stroke="rgba(255,255,255,0.18)" stroke-dasharray="3 4"/><circle id="ggCzN" cx="'+X(tepeI).toFixed(1)+'" cy="'+Y1(v.gunluk[tepeI]).toFixed(1)+'" r="6" fill="#fff" stroke="var(--acc)" stroke-width="3"/></g>':'')+
  '<rect id="ggCzA" x="30" y="10" width="570" height="200" fill="transparent"/></svg>'+(yol?'<div class="gg-czip gg-sol" id="ggCzB" style="left:'+(X(tepeI)/600*100).toFixed(2)+'%;top:'+(Y1(v.gunluk[tepeI])/230*100).toFixed(2)+'%;'+gec(1.9)+'"><b>'+tl(v.gunluk[tepeI])+' ₺</b><div>'+tepeI+' '+ayK+'</div></div>':'')+'</div>';
 // Birikmiş gider ve hedef
 var ref=hedef||v.gl,tepe2=Math.max(ref,v.bir[gS])*1.15||1000,Y2=function(x){return 205-x/tepe2*180},nk2=[];for(i=1;i<=sonG;i++)nk2.push([X(i),Y2(v.bir[i])]);
 var bh='<div class="gg-r"><b class="gg-bas">Birikmiş gider ve '+(hedef?'hedef':'gelir')+'</b><span class="gg-lj"><span><i style="background:#60a5fa"></i>Gider</span><span><i style="background:#f2f2f3"></i>'+(hedef?'Hedef':'Gelir')+'</span></span></div><svg viewBox="0 0 600 230" role="img" aria-label="'+E('Birikmiş gider '+tl(v.bir[sonG]||0)+' lira'+(ref?', aylık '+(hedef?'hedef ':'gelir ')+tl(ref)+' lira':''))+'">'+GG.izg(tepe2,Y2)+
  (ref?'<path class="gg-ciz" d="M44 '+Y2(ref).toFixed(1)+' L590 '+Y2(ref).toFixed(1)+'" fill="none" stroke="#f2f2f3" stroke-width="2" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="0" style="'+gec(.6)+';animation-duration:.9s"/><text class="gg-sol" x="590" y="'+(Y2(ref)-8).toFixed(1)+'" fill="#f2f2f3" font-size="11" text-anchor="end" style="'+gec(2.1)+'">'+(hedef?'Hedef ':'Gelir ')+tl(ref)+' ₺</text>':'')+
  (nk2.length?'<path class="gg-ciz" d="'+GG.egri(nk2)+'" fill="none" stroke="#60a5fa" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="0" style="'+gec(.8)+';animation-duration:1.5s"/><circle class="gg-sol" cx="'+X(sonG).toFixed(1)+'" cy="'+Y2(v.bir[sonG]).toFixed(1)+'" r="5" fill="#141416" stroke="#60a5fa" stroke-width="3" style="'+gec(2.1)+'"/>':'')+'</svg>';
 // Halka (kaleme göre)
 var dil=v.kl.slice(0,5).map(function(k){return[k,v.kat[k]]}),dg=v.kl.slice(5).reduce(function(n,k){return n+v.kat[k]},0);if(dg)dil.push(['Diğer',dg]);var ofs=0;
 var dilim=dil.map(function(x,i){var pay=v.gd?x[1]/v.gd*100:0,o={ad:x[0],pay:pay,renk:x[0]==GG.KD?'#d97706':GG.DUZ[i%GG.DUZ.length],ofs:-ofs};ofs+=pay;return o});
 var halka='<div><b class="gg-bas">Kaleme göre</b><div class="gg-alt2">Giderin dağılımı</div></div>'+(dilim.length?'<div class="gg-hlk"><div class="gg-hlkc"><svg viewBox="0 0 42 42" role="img" aria-label="'+E('Kaleme göre gider dağılımı: '+dilim.map(function(h){return h.ad+' yüzde '+Math.round(h.pay)}).join(', '))+'"><circle cx="21" cy="21" r="15.915" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="5"/>'+
  dilim.map(function(h){return '<circle class="gg-dil" cx="21" cy="21" r="15.915" fill="none" stroke="'+h.renk+'" stroke-width="5" stroke-dasharray="'+h.pay.toFixed(2)+' '+(100-h.pay).toFixed(2)+'" stroke-dashoffset="'+h.ofs.toFixed(2)+'" style="'+gec(.9)+'"/>'}).join('')+'</svg><div class="gg-hlki"><b>'+GG.say(dilim[0].pay,'pct',.9)+'</b><span>'+E(dilim[0].ad)+'</span></div></div><div class="gg-hlkl">'+dilim.map(function(h,i){return '<div class="gg-sol'+(h.ad==GG.KD?' kdr':'')+'" style="'+gec(1+i*.09)+'"><i style="background:'+h.renk+'"></i><span>'+E(h.ad)+'</span><b>%'+Math.round(h.pay)+'</b></div>'}).join('')+'</div></div>':OA.bos('grafik','Gider yok','Bu ay gider girilince dağılım çizilir.',140));
 // Huni
 var kmax=v.kl.length?v.kat[v.kl[0]]:1,huni='<div class="gg-r"><div><b class="gg-bas">Harcama hunisi</b><div class="gg-alt2">Büyükten küçüğe kalemler</div></div><b class="gg-et">'+GG.say(v.kl.length,'int',.9)+' kalem</b></div>'+(v.kl.length?v.kl.slice(0,5).map(function(k,i){return '<div class="gg-hn2'+(k==GG.KD?' kdr':'')+'"><span class="gg-hna">'+E(k)+'</span><div class="gg-hnc">'+(function(){var w=Math.max(4,v.kat[k]/kmax*100),ic=w>=38;return '<span class="gg-dx" style="width:'+w.toFixed(1)+'%;background:'+(k==GG.KD?'#d97706':GG.HUNI[i])+';'+gec(.9+i*.11)+'">'+(ic?tl(v.kat[k])+' ₺':'')+'</span>'+(ic?'':'<b class="gg-hnd gg-sol" style="'+gec(1.5+i*.11)+'">'+tl(v.kat[k])+' ₺</b>')})()+'</div><span class="gg-hnp">%'+(v.gd?Math.round(v.kat[k]/v.gd*100):0)+'</span></div>'}).join(''):'<div class="gg-alt">Bu ay gider yok.</div>');
 // Kim ne harcadı
 var kk=Object.keys(v.kisiT).sort(function(x,y){return v.kisiT[y]-v.kisiT[x]}),kpm=Math.max.apply(null,[1].concat(kk.map(function(k){return v.kisiT[k]})));
 var kim='<div><b class="gg-bas">Kim ne harcadı</b><div class="gg-alt2">Bu ayın giderleri</div></div>'+(kk.length?kk.map(function(k,i){var Ki=GG.KISI[k];return '<div class="gg-kim"><div class="gg-r"><span class="gg-kh b" style="background:'+Ki[1]+'" aria-hidden="true">'+Ki[0].charAt(0)+'</span><b class="gg-f1">'+Ki[0]+'</b><span class="gg-num">'+GG.say(v.kisiT[k],'tl',1+i*.1)+' ₺</span></div><div class="gg-kc"><span class="gg-dx" style="width:'+(v.kisiT[k]/kpm*100).toFixed(1)+'%;background:'+Ki[1]+';'+gec(1+i*.12)+'"></span></div></div>'}).join(''):'<div class="gg-alt">Bu ay gider yok.</div>');
 return '<div class="gg-sut">'+bas+ust+'<div class="gg-g2b">'+kart(cz,K(4))+kart(bh,K(5))+'</div><div class="gg-g3">'+kart(halka,K(6))+kart(huni,K(7))+kart(kim,K(8))+'</div></div>'};
// Günlük gider grafiği: fareyle gün seçilir, bilgi kutusu o günü gösterir
GG.czBagla=function(){var a=document.getElementById('ggCzA'),z=GG._cz;if(!a||!z||!z.sonG)return;var svg=a.ownerSVGElement;
 a.addEventListener('mousemove',function(e){var r=svg.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*600,g=Math.round((x-44)/546*(z.gS-1))+1;g=Math.max(1,Math.min(z.sonG,g));if(GG.ui.hov===g)return;GG.ui.hov=g;GG.czGoster(g)});
 a.addEventListener('mouseleave',function(){GG.ui.hov=null;GG.czGoster(z.tepeI)})};
GG.czGoster=function(g){var z=GG._cz,x=z.X(g),y=z.Y1(z.gunluk[g]),L=document.getElementById('ggCzL'),N=document.getElementById('ggCzN'),B=document.getElementById('ggCzB'),ip=document.getElementById('ggCzIp');if(!L||!N||!B)return;
 L.setAttribute('x1',x.toFixed(1));L.setAttribute('x2',x.toFixed(1));N.setAttribute('cx',x.toFixed(1));N.setAttribute('cy',y.toFixed(1));B.style.left=(x/600*100).toFixed(2)+'%';B.style.top=(y/230*100).toFixed(2)+'%';
 B.innerHTML='<b>'+tl(z.gunluk[g])+' ₺</b><div>'+g+' '+z.ayK+'</div>';if(ip)ip.style.animation='none';B.style.animation='none';B.style.opacity=1};

// ---------- Ay sonu raporu (PDF) ----------
GG.raporHtml=function(ay){var v=GG.veri(ay),S=v.ayR.slice().sort(function(x,y){return x.tarih<y.tarih?-1:x.tarih>y.tarih?1:0}),ab=(OA.st().bak||{}).aile;
 var kdL=v.ayR.filter(GG.kd);
 return '<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:"Segoe UI",sans-serif;font-size:10.5px;color:#222;margin:28px}h1{font-size:18px;margin:0 0 2px}h2{font-size:13px;margin:18px 0 6px}.s{color:#666;margin-bottom:12px}.k{display:flex;gap:10px;flex-wrap:wrap}.k div{border:1px solid #ddd;border-radius:6px;padding:6px 10px}.k b{display:block;font-size:15px}.k .kd{border-color:#d97706;background:#fff7e6}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #e3e3e3;padding:4px 5px;text-align:left}th{background:#f3f4f7}td.n{text-align:right;white-space:nowrap}tr.kd td{background:#fff7e6}.not{color:#8a5a00}</style></head><body>'+
  '<h1>Orvane · Ay sonu raporu</h1><div class="s">'+E(GG.ayAd(ay))+' · Aile Bütçesi · oluşturma '+new Date().toLocaleString('tr-TR')+'</div>'+
  '<div class="k"><div>Gelir<b>'+tl(v.gl)+' ₺</b></div><div>Gider<b>'+tl(v.gd)+' ₺</b></div><div>Net<b>'+imz(v.gl-v.gd)+' ₺</b></div><div class="kd">Kayıt dışı harcama<b>'+tl(v.kd)+' ₺</b></div>'+(ab?'<div>Aile Bütçesi bakiyesi<b>'+tl(ab.t)+' ₺</b></div>':'')+(GG.hedef()?'<div>Gider hedefi<b>'+tl(GG.hedef())+' ₺</b></div>':'')+'</div>'+
  (kdL.length?'<h2>Kayıt dışı harcama</h2><p class="not">Bildirilen bakiye beklenenden düşük çıktığında fark otomatik olarak “Kayıt dışı harcama” yazılır.</p><table><tr><th>Tarih</th><th>Açıklama</th><th>Tutar</th></tr>'+kdL.map(function(r){return '<tr class="kd"><td>'+E(r.tarih)+'</td><td>'+E(r.not)+'</td><td class="n">'+tl(r.tutar)+' ₺</td></tr>'}).join('')+'</table>':'')+
  '<h2>Kalemler</h2><table><tr><th>Kalem</th><th>Tutar</th><th>Pay</th></tr>'+v.kl.map(function(k){return '<tr'+(k==GG.KD?' class="kd"':'')+'><td>'+E(k)+'</td><td class="n">'+tl(v.kat[k])+' ₺</td><td class="n">%'+(v.gd?Math.round(v.kat[k]/v.gd*100):0)+'</td></tr>'}).join('')+'</table>'+
  '<h2>Kim ne harcadı</h2><table><tr><th>Kişi</th><th>Gider</th></tr>'+Object.keys(v.kisiT).map(function(k){return '<tr><td>'+GG.KISI[k][0]+'</td><td class="n">'+tl(v.kisiT[k])+' ₺</td></tr>'}).join('')+'</table>'+
  '<h2>Kayıtlar ('+S.length+')</h2><table><tr><th>Tarih</th><th>Tür</th><th>Kalem</th><th>Açıklama</th><th>Kişi</th><th>Kasa</th><th>Kaynak</th><th>Tutar</th></tr>'+S.map(function(r){return '<tr'+(GG.kdHer(r)?' class="kd"':'')+'><td>'+E(r.tarih)+'</td><td>'+(r.tur=='gelir'?'Gelir':'Gider')+'</td><td>'+E(r.kalem)+'</td><td>'+E(r.not)+'</td><td>'+GG.KISI[GG.kisi(r)][0]+'</td><td>'+GG.KASA[GG.kasa(r)]+'</td><td>'+GG.KAYNAK[GG.kaynak(r)][0]+'</td><td class="n">'+(r.tur=='gelir'?'+':'−')+tl(r.tutar)+' ₺</td></tr>'}).join('')+'</table></body></html>'};
GG.pdf=function(){var ay=GG.ay();if(typeof API=='undefined'||!API||!API.exp||!API.exp.pdf){toast('PDF bu ortamda kullanılamıyor');return}
 API.exp.pdf({name:'Orvane ay sonu raporu '+ay+'.pdf',html:GG.raporHtml(ay)}).then(function(r){if(r&&r.ok)toast('PDF kaydedildi');else if(r&&r.err)toast('PDF hatası: '+r.err)},function(e){toast('PDF hatası: '+(e&&e.message||e))})};

ORV.sayfa('aylikbutce',{ciz:GG.sayfa,sonra:GG.sonra,baslik:'Ailem › Aylık Bütçe'});
})();
