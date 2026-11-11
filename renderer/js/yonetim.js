// Orvane 0.7.8 · Şirket yönetimi: İK onayını İK Müdürü Nika kendisi verir (gerekçeli, Claude aboneliğinde).
// CEO onayı şimdilik Çağlar'da; Orin her talep için gerekçeli öneri sunar (Çağlar'ın kararı: "şimdilik sadece CEO onayını bana sun").
var YON={calisiyor:false,zam:null,cagir:function(o){return ABN.cagir(o)}};
function yonAyar(){S.yonetim=S.yonetim||{nikaOto:true,orinOneri:true};return S.yonetim}
var YON_IK_OLCUT='Ölçütler: (1) Talep çalışanın görev alanıyla ilgili ve işine yarar mı? (2) Doğru, açık ve uydurma değil mi? (3) Kişisel ya da gizli bilgi (şifre, anahtar, kimlik, sağlık, adres) içeriyor mu — içeriyorsa REDDET. (4) Çalışanın mevcut becerisinin/hafızasının tekrarı mı — tekrarsa reddet. (5) Orvane kurallarına uygun mu (veri güvenliği, yayın onayı, sade görünüm, abonelik öncelikli düşük maliyet)?';
function yonListe(L){return L.map(function(g){var c=tm(g.kim)||{ad:g.kim,gorev:''};return {id:g.id,calisan:c.ad+' ('+c.gorev+')',tur:GT[g.tur]||g.tur,ad:g.ad||'',metin:String(g.metin||'').slice(0,400),kaynak:g.kimden||''}})}
function yonJson(t){var m=String(t||'').match(/\[[\s\S]*\]/);if(!m)return [];try{var a=JSON.parse(m[0]);return Array.isArray(a)?a:[]}catch(e){return []}}
function yonModel(id){var c=tm(id);return c&&typeof ABN_MODEL!='undefined'&&ABN_MODEL[tmModel(c)]||'haiku'}

// Nika: İK incelemesi (en fazla 20 talep tek çağrıda)
function nikaIncele(){var L=TMS().gel.filter(function(g){return g.asama=='ik'}).slice(0,20),n=tm('nika');
if(YON.calisiyor||!yonAyar().nikaOto||!L.length||!n||!abnSohbetHazir())return Promise.resolve(0);YON.calisiyor=true;
return YON.cagir({kim:'nika',tur:'sohbet',sistemTam:true,araclar:'',maxTur:1,model:yonModel('nika'),zamanAsimiMs:180000,
sistem:zekaSistem(n)+'\nŞu an İK Müdürü olarak gelişim taleplerini kendin onaylıyorsun; onayladıkların CEO onayına (Çağlar) gider. '+YON_IK_OLCUT+'\nYalnız JSON dizi yaz: [{"id":"talep id","ok":true|false,"neden":"en fazla 15 kelime"}]',
istem:'İncelenecek gelişim talepleri:\n'+JSON.stringify(yonListe(L),null,1)})
.then(function(r){if(!r.ok)throw new Error(r.err);var K=yonJson(r.v.metin),on=0,red=0;
K.forEach(function(k){var g=L.filter(function(x){return x.id==k.id})[0];if(!g||g.asama!='ik'||typeof k.ok!='boolean')return;g.ik={ts:Date.now(),ok:k.ok?1:0,neden:String(k.neden||'').slice(0,160),kim:'nika',oto:1};g.asama=k.ok?'ceo':'red';if(k.ok)on++;else red++});
if(on||red){tmPush('nika',{r:'sys',t:'Nika '+(on+red)+' gelişim talebini inceledi: '+on+' onay (CEO onayına gitti)'+(red?', '+red+' red':'')+'.'});save();if(area=='team')render()}return on+red},
function(e){ZK.hata='Nika İK incelemesi: '+String(e&&e.message||e);return 0})
.then(function(x){YON.calisiyor=false;return orinOner().then(function(){return x})})}

// Orin: CEO önerisi (karar Çağlar'ın)
function orinOner(){var L=TMS().gel.filter(function(g){return g.asama=='ceo'&&!g.oneri}).slice(0,20),o=tm('orin');
if(!yonAyar().orinOneri||!L.length||!o||!abnSohbetHazir())return Promise.resolve(0);
return YON.cagir({kim:'orin',tur:'sohbet',sistemTam:true,araclar:'',maxTur:1,model:yonModel('orin'),zamanAsimiMs:180000,
sistem:zekaSistem(o)+'\nCEO olarak İK’nin onayladığı gelişim taleplerine öneri yazıyorsun; son kararı şimdilik Çağlar veriyor. Şirket öncelikleri: veri güvenliği, düşük maliyet (abonelik öncelikli), sade görünüm, önceki sürümü koruma, çalışanların alanında en iyi olması. Yalnız JSON dizi yaz: [{"id":"talep id","ok":true|false,"neden":"en fazla 15 kelime"}]',
istem:'CEO onayı bekleyen talepler:\n'+JSON.stringify(yonListe(L),null,1)})
.then(function(r){if(!r.ok)return 0;var n=0;yonJson(r.v.metin).forEach(function(k){var g=L.filter(function(x){return x.id==k.id})[0];if(!g||typeof k.ok!='boolean')return;g.oneri={ok:k.ok?1:0,neden:String(k.neden||'').slice(0,160),ts:Date.now()};n++});if(n){save();if(area=='team')render()}return n},function(){return 0})}
function yonPlanla(ms){clearTimeout(YON.zam);YON.zam=setTimeout(nikaIncele,ms||3000)}

// Yeni talepler ve gelen kutusu sonrası inceleme
var _yonGel=tmGelNew;tmGelNew=function(){var g=_yonGel.apply(this,arguments);if(!INFO.smoke)yonPlanla(4000);return g};

// Görünüm: talep kartında Nika'nın gerekçesi ve Orin'in önerisi
var _yonRow=tmGelRow;tmGelRow=function(g,act){var h=_yonRow(g,act),n='';
if(g.ik&&g.ik.neden)n+='<small style="color:'+(g.ik.ok?'#8fe0b3':'#f4a3a3')+'">Nika: '+(g.ik.ok?'onayladı':'reddetti')+' — '+esc(g.ik.neden)+'</small>';
if(g.oneri&&g.asama=='ceo')n+='<small style="color:#9ec5ff">Orin’in önerisi: '+(g.oneri.ok?'onayla':'reddet')+' — '+esc(g.oneri.neden)+'</small>';
return n?h.replace('<div class="flw">',n+'<div class="flw">'):h};
// Nika'nın sayfası: otomatik İK onayı ayarı ve son kararları (Çağlar denetler, reddi bozabilir)
function yonKart(){var a=yonAyar(),D=TMS().gel.filter(function(g){return g.ik&&g.ik.oto}).sort(function(x,y){return y.ik.ts-x.ik.ts}).slice(0,8);
return '<div class="card" style="margin-top:14px"><div class="ch"><i class="ti ti-shield-check"></i>İK onayı Nika’da <span class="hn" style="margin-left:6px">CEO onayı Çağlar’da · Orin öneri sunar</span>'+(TMS().gel.some(function(g){return g.asama=='ik'})?'<button class="bt" style="margin-left:auto;min-height:30px;padding:4px 12px" onclick="nikaIncele().then(function(){render()})"'+(YON.calisiyor?' disabled':'')+'>'+(YON.calisiyor?'İnceleniyor…':'Şimdi incele')+'</button>':'')+'</div>'+
'<div class="kr"><span>İK onayını Nika versin<div class="hn">Talepleri ölçütlere göre gerekçeli onaylar ya da reddeder (abonelikte)</div></span><span class="tg2'+(a.nikaOto?' on':'')+'" onclick="yonDegis(\'nikaOto\')"></span></div>'+
'<div class="kr"><span>Orin CEO önerisi sunsun<div class="hn">Son kararı sen verirsin</div></span><span class="tg2'+(a.orinOneri?' on':'')+'" onclick="yonDegis(\'orinOneri\')"></span></div>'+
(D.length?'<div class="hn" style="margin:8px 0 4px">Nika’nın son kararları</div>'+D.map(function(g){var c=tm(g.kim)||{ad:g.kim};return '<div class="kr"><div>'+esc(c.ad)+' · '+esc(tmGelLabel(g))+'<div class="hn" style="color:'+(g.ik.ok?'#8fe0b3':'#f4a3a3')+'">'+(g.ik.ok?'Onay':'Red')+' — '+esc(g.ik.neden||'')+'</div></div>'+(g.asama=='red'&&!g.ceo?'<button class="bt" style="min-height:30px;padding:4px 10px" data-id="'+esc(g.id)+'" onclick="yonBoz(this.dataset.id)">Reddi boz, CEO’ya gönder</button>':'')+'</div>'}).join(''):'')+'</div>'}
function yonDegis(k){var a=yonAyar();a[k]=!a[k];save();render();if(a[k])yonPlanla(500)}
function yonBoz(id){var g=TMS().gel.filter(function(x){return x.id==id})[0];if(!g||g.asama!='red')return;g.ik={ts:Date.now(),ok:1,neden:'Çağlar Nika’nın reddini bozdu',kim:'cagla'};g.asama='ceo';delete g.oneri;save();render();toast('CEO onayına gönderildi');orinOner()}
var _yonAp=tmApprovals;tmApprovals=function(c){var h=_yonAp(c);return c.id=='nika'?yonKart()+h:h};
if(!INFO.smoke){setTimeout(function(){nikaIncele()},9000);setInterval(function(){if(!document.hidden)nikaIncele()},5*60000)}

// Testler (yalnız smoke)
window.__yonTest=function(){var R=[],T=TMS(),bk={st:ABN.st,cagir:YON.cagir,gel:T.gel.slice(),yon:S.yonetim?JSON.stringify(S.yonetim):null,ch:JSON.stringify(T.sohbet)};function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
ABN.st={kurulu:true,acik:true,gunluk:5,bugun:0,toplam:0,gunlukSohbet:60,sohbetBugun:0};S.yonetim={nikaOto:true,orinOneri:true};T.gel=[];
var a=_yonGel('ada','beceri','Kod inceleme','Kodu hız ve kararlılık için inceler.','claude'),b=_yonGel('otto','hafiza','','Çağlar’ın banka şifresi 1234','claude');
var cg=[];YON.cagir=function(o){cg.push(o);var L=JSON.parse(o.istem.slice(o.istem.indexOf('[')));return Promise.resolve({ok:true,v:{metin:JSON.stringify(L.map(function(x){return o.kim=='nika'?{id:x.id,ok:!/şifre/.test(x.metin),neden:/şifre/.test(x.metin)?'Gizli bilgi içeriyor':'Rolüyle uyumlu'}:{id:x.id,ok:true,neden:'Ekibin kalitesini artırır'}}))}})};
return nikaIncele().then(function(n){
t('Nika talepleri kendisi inceler',n==2&&cg[0]&&cg[0].kim=='nika'&&cg[0].tur=='sohbet',n);
t('Uygun talep CEO onayına gider',a.asama=='ceo'&&a.ik.oto&&/Rolüyle/.test(a.ik.neden),JSON.stringify(a.ik));
t('Gizli bilgi içeren talep reddedilir',b.asama=='red'&&/Gizli/.test(b.ik.neden),JSON.stringify(b.ik));
t('Nika’nın ölçütleri sistem isteminde',/Kişisel ya da gizli bilgi/.test(cg[0].sistem));
t('Orin CEO önerisi yazar, karar Çağlar’da',a.oneri&&a.oneri.ok&&a.asama=='ceo'&&cg.some(function(x){return x.kim=='orin'}),JSON.stringify(a.oneri));
var h=tmGelRow(a,'ceo');t('Talep kartında Nika gerekçesi ve Orin önerisi',/Nika: onayladı/.test(h)&&/Orin’in önerisi: onayla/.test(h));
yonBoz(b.id);t('Çağlar Nika’nın reddini bozabilir',b.asama=='ceo');
tmGelCeo(a.id,1);t('CEO onayı (Çağlar) beceriyi uygular',a.asama=='tamam'&&tmSkills('ada').some(function(s){return s.ad=='Kod inceleme'}));
S.yonetim.nikaOto=false;var c=_yonGel('mia','hafiza','','Test','claude');return nikaIncele().then(function(n2){t('Ayar kapalıyken Nika onaylamaz',n2==0&&c.asama=='ik');
nav('team','calisan','nika');var hh=document.getElementById('ct').innerHTML;t('Nika sayfasında İK onayı kartı',/İK onayı Nika’da/.test(hh)&&/Nika’nın son kararları/.test(hh))})})
.catch(function(e){t('Yönetim testi',false,e.stack)}).then(function(){ABN.st=bk.st;YON.cagir=bk.cagir;T.gel=bk.gel;if(bk.yon)S.yonetim=JSON.parse(bk.yon);else delete S.yonetim;T.sohbet=JSON.parse(bk.ch);save();nav('home','gun',TODAY);return R})};
