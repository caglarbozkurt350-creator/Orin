// Orvane 0.7.23 · Onaylar sayfası (Claude Design tuvali "Orvane · Onaylar" + "Çalışan sayfası onay hatırlatması", Çağlar onayladı)
// - Sol çubukta "Onaylar" düğmesi (kırmızı rozet = Çağlar'ın onayını bekleyen toplam öğe)
// - Tek listede dört tür: gelişim (beceri/hafıza), Claude'a iş istekleri, kayıt onayları, toplantı kararları
// - Sekmeler: "Senin onayın" · "Nika’da" (Nika ve Orin inceliyor) · "Son kararlar" (Nika/Orin reddi dahil, "Reddi boz")
// - Çalışan sayfasında yapışkan başlığın altında ince amber hatırlatma satırı
// İş mantığı yeniden yazılmaz: tmGelCeo, isOnay, entryApproved, yonBoz, tpKararKaydet çağrılır.
var ONY={tab:'cagla',tur:'',kim:'',hat:{}};
var ONY_TUR={gel:'Gelişim',is:'İş',kayit:'Kayıt',toplanti:'Toplantı'};
var ONY_TURAD={gel:'Gelişim (beceri, hafıza)',is:'Claude’a iş istekleri',kayit:'Kayıt onayları',toplanti:'Toplantı kararları'};
var ONY_SEKME=[['cagla','Senin onayın'],['nika','Nika’da'],['son','Son kararlar']];
function onayAcik(){return area=='team'&&pg=='onaylar'}

// ---------- Veri ----------
function onayKararTs(g){return Math.max((g.ik&&g.ik.ts)||0,(g.orin&&g.orin.ts)||0,(g.ceo&&g.ceo.ts)||0,g.ts||0)}
function onayToplantiKim(){try{var t=typeof tpBul=='function'&&TPK&&TPK.tid?tpBul(TPK.tid):null;if(t)return typeof tpEnYetkili=='function'?tpEnYetkili(t):t.ev}catch(e){}return 'orin'}
function onayVeri(){var C=[],N=[],Z=[];
TMS().gel.forEach(function(g){var o={tur:'gel',id:g.id,kim:g.kim,ts:g.ts||0,r:g};
if(g.asama=='ceo')C.push(o);else if(g.asama=='ik'||g.asama=='orin')N.push(o);else if(g.asama=='tamam'||g.asama=='red'){o.ts=onayKararTs(g);Z.push(o)}});
if(typeof isS=='function')isS().forEach(function(x){var o={tur:'is',id:x.id,kim:x.kim,ts:x.ts||0,r:x};
if(x.durum=='onay')C.push(o);else if(x.karar&&['red','onaylandi','calisiyor','inceleme','yapildi','hata','bos'].indexOf(x.durum)>=0){o.ts=x.karar;Z.push(o)}});
try{Object.keys(E).forEach(function(k){(E[k]||[]).forEach(function(e,i){if(e&&!e.st)C.push({tur:'kayit',id:k+'|'+i,kim:'echo',ts:pk(k).getTime(),r:e,k:k,i:i})})})}catch(e){}
var tt=typeof TPK!='undefined'&&TPK.tid&&typeof tpBul=='function'?tpBul(TPK.tid):null; // kapanışı geçilen (bitti) toplantının artık sorulmayan soruları sayılmaz
if(typeof TPK!='undefined'&&TPK.sorular&&TPK.sorular.length&&(!TPK.tid||(tt&&tt.durum!='bitti'))){var hk=onayToplantiKim();TPK.sorular.forEach(function(q,i){C.push({tur:'toplanti',id:'q'+i,kim:hk,ts:Date.now(),r:q,i:i})})}
var by=function(a,b){return b.ts-a.ts};C.sort(by);N.sort(by);Z.sort(by);return{cagla:C,nika:N,son:Z.slice(0,25)}}
function onaySay(){return onayVeri().cagla.length}
// Bir çalışanın Çağlar'ı bekleyen öğeleri (çalışan sayfası hatırlatması)
function onayCalisan(id){return onayVeri().cagla.filter(function(x){return x.kim==id})}

// ---------- Küçük parçalar ----------
function onayKaynak(g){return g.kimden=='nika'?'Nika önerdi':g.kimden=='abonelik'?'Claude’dan':g.kimden=='claude'?'Claude’dan':'Çağlar istedi'}
function onayIkon(){return '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5"/><path d="M9 13l2.2 2.2L15.5 11"/></svg>'}
function onayChip(t,k){return '<span class="onc '+(k||'')+'">'+esc(t)+'</span>'}
function onayKarar(g){var h='';
// Nika
if(g.ik)h+=onayChip('Nika: '+(g.ik.ok?'Onayladı':'Reddetti')+(g.ik.neden?' · '+g.ik.neden:''),g.ik.ok?'ok':'red');else if(g.asama=='ik')h+=onayChip('Nika: inceliyor','bk');
// Orin: kendi kararı, kendi talebiyse atlandı, eski kayıtlarda yalnız önerisi
if(g.orin)h+=onayChip((g.orin.kim=='cagla'?'Çağlar':'Orin')+': '+(g.orin.ok?'Onayladı':'Reddetti')+(g.orin.neden?' · '+g.orin.neden:''),g.orin.ok?'ok':'red');
else if(g.asama=='orin')h+=onayChip('Orin: inceliyor','bk');
else if(g.kim=='orin'&&g.asama!='ik')h+=onayChip('Orin: kendi talebi, senin onayına geçti','');
else if(g.oneri)h+=onayChip('Orin önerisi: '+(g.oneri.ok?'Onayla':'Reddet')+(g.oneri.neden?' · '+g.oneri.neden:''),'');
if(g.ceo)h+=onayChip('Çağlar: '+(g.ceo.ok?'Onayladı':'Reddetti'),g.ceo.ok?'ok':'red');
return h?'<div class="onr">'+h+'</div>':''}
function onayBas(c,rozet,sag){return '<div class="onb">'+av(c,32)+'<b>'+esc(c.ad)+'</b><span class="onj">'+esc(c.gorev||'')+'</span>'+rozet+'<span class="ons">'+sag+'</span></div>'}
function onayDugme(t,cls,js){return '<button class="bt'+(cls?' '+cls:'')+'" onclick="'+js+'">'+t+'</button>'}

// ---------- Kartlar ----------
function onayGelKart(o,mod){var g=o.r,c=tm(g.kim)||{ad:g.kim,gorev:'',renk:'#888'},id=jq(g.id),son=mod=='son',h;
var yaz=son?(g.asama=='tamam'?'<span class="onc ok">Onaylandı · uygulandı</span>':'<span class="onc red">Reddedildi'+(yonRedKim(g)=='nika'?' (Nika)':yonRedKim(g)=='orin'?' (Orin)':yonRedKim(g)=='cagla'?' (Çağlar)':'')+'</span>'):'';
h='<article class="onk" data-id="'+esc(g.id)+'">'+onayBas(c,'<span class="onp g'+(g.tur=='hafiza'?'h':'b')+'">'+esc(GT[g.tur]||g.tur)+'</span>',esc(tmTime(o.ts))+' · '+onayKaynak(g))+
'<div class="ont">'+esc(g.ad||(g.tur=='hafiza'?'Hafızaya ekleme':GT[g.tur]))+'</div>'+(g.metin?'<p class="onm">'+esc(g.metin)+'</p>':'')+onayKarar(g)+(son?'':sonucKutu(sonucMetni(g)))+
'<div class="ona">'+yaz+'<span style="flex:1"></span>';
if(mod=='cagla')h+=onayDugme('Ayrıntı','g',"nav('team','calisan','"+jq(g.kim)+"')")+onayDugme('Reddet','r',"tmGelCeo('"+id+"',0)")+onayDugme('Onayla','p',"tmGelCeo('"+id+"',1)");
else if(mod=='nika')h+=onayDugme(g.asama=='ik'?'Nika’nın sayfası ›':'Orin’in sayfası ›','g',"nav('team','calisan','"+(g.asama=='ik'?'nika':'orin')+"')");
else{var k=yonRedKim(g);if(k=='nika'||k=='orin')h+=onayDugme('Reddi boz','',"yonBoz('"+id+"')");h+=onayDugme('Ayrıntı','g',"nav('team','calisan','"+jq(g.kim)+"')")}
return h+'</div></article>'}
function onayIsKart(o,mod){var it=o.r,c=tm(it.kim)||{ad:it.kim,gorev:'',renk:'#888'},id=jq(it.id),son=mod=='son';
var h='<article class="onk" data-id="'+esc(it.id)+'">'+onayBas(c,'<span class="onp is">'+esc(IS_TUR[it.tur]||'İş isteği')+' · Claude Code</span>',esc(tmTime(o.ts)))+
'<div class="ont">'+esc(it.baslik)+'</div>'+(it.metin&&it.metin!=it.baslik?'<p class="onm">'+esc(isKisa(it.metin,320))+'</p>':'')+(son?'':sonucKutu(isSonuc(it)))+
'<div class="ona">'+(son?'<span class="onc '+(it.durum=='red'||it.durum=='hata'?'red':'ok')+'">'+esc(IS_DURUM[it.durum]||it.durum)+'</span>':'')+'<span style="flex:1"></span>';
if(mod=='cagla')h+=onayDugme('Ayrıntı','g',"nav('team','calisan','orin')")+onayDugme('Reddet','r',"isOnay('"+id+"',0)")+onayDugme('Onayla','p',"isOnay('"+id+"',1)");
return h+'</div></article>'}
function onayKayitKart(o){var e=o.r,c=tm('echo')||{ad:'Echo',gorev:'',renk:'#c2410c'};
return '<article class="onk onkk">'+av(c,32)+'<div class="onkg"><div class="ont" style="font-size:14.5px"><b>'+esc(lab(o.k))+'</b> · '+esc(e.k)+' · '+esc(e.i||'')+'</div><div class="onj">Süre <b>'+esc(e.d)+' dk</b> · onaylanınca Sheets’e yazılır</div></div>'+
'<div class="ona" style="margin:0">'+onayDugme('Güne git','g',"nav('home','gun','"+jq(o.k)+"')")+onayDugme('Onayla','p',"onayKayit('"+jq(o.k)+"',"+o.i+")")+'</div></article>'}
function onayToplantiKart(o){var c=tm(o.kim)||{ad:o.kim,gorev:'',renk:'#64748b'},q=o.r;
return '<article class="onk onkk">'+av(c,32)+'<div class="onkg"><div class="ont" style="font-size:14.5px">'+esc(c.ad)+' soruyor: <b>'+esc(q.soru)+'</b></div><div class="onj">Toplantı kapanışı · netleşmemiş karar'+(q.oneri?' · öneri: '+esc({evet:'Evet',hayir:'Hayır',belki:'Belki'}[q.oneri]||q.oneri):'')+'</div></div>'+
'<div class="ona" style="margin:0">'+onayDugme('Hayır','',"onayToplanti("+o.i+",'hayir')")+onayDugme('Evet','p',"onayToplanti("+o.i+",'evet')")+'</div></article>'}
function onayKart(o,mod){return o.tur=='gel'?onayGelKart(o,mod):o.tur=='is'?onayIsKart(o,mod):o.tur=='kayit'?onayKayitKart(o):onayToplantiKart(o)}

// ---------- Eylemler ----------
function onayKayit(k,i){var e=(E[k]||[])[i];if(!e)return;entryApproved(k,e);render();save();toast(CONNECTED?'Onaylandı · Sheets’e yazılıyor':'Onaylandı · Sheets bağlanınca yazılacak')}
// Toplantı kapanış sorusu: kararı kaydeder, sorular bitince tutanağı yazdırır (toplanti2.js ile aynı kayıt biçimi)
function onayToplanti(i,cevap){if(typeof TPK=='undefined'||!TPK.sorular||!TPK.sorular[i])return;var t=typeof tpBul=='function'&&TPK.tid?tpBul(TPK.tid):null,q=TPK.sorular[i],ad={evet:'Evet',hayir:'Hayır',belki:'Belki'};
var metin=String(q.soru).replace(/\?\s*$/,'')+' → '+(ad[cevap]||cevap);if(t){tpKararKaydet(t,'cagla',metin);t.mes.push({r:'ben',t:'Kapanış kararı: '+metin,ts:Date.now()})}
TPK.sorular.splice(i,1);save();if(!TPK.sorular.length){TPK.sorular=null;try{cfNo()}catch(er){}if(t&&typeof tpTutanak=='function')tpTutanak(t)}else if(document.getElementById('ov').style.display=='flex'&&t&&typeof tpSoruDlg=='function')tpSoruDlg(t);render()}
function onayToplu(tur){var L=onayVeri().cagla.filter(function(x){return x.tur==tur&&(!ONY.kim||x.kim==ONY.kim)});if(!L.length)return;
confirmBox(L.length+' '+({gel:'gelişim talebi',is:'iş isteği',kayit:'kayıt'}[tur]||'öğe')+' onaylansın mı?<div class="hn" style="margin-top:6px">Her biri tek tek onaylanmış gibi uygulanır.</div>',function(){
if(tur=='gel'){L.forEach(function(x){tmGelCeo(x.id,1)})}
else if(tur=='kayit'){L.slice().sort(function(a,b){return b.i-a.i}).forEach(function(x){var e=(E[x.k]||[])[x.i];if(e)entryApproved(x.k,e)});render();save()}
else if(tur=='is'){L.reduce(function(p,x){return p.then(function(){return isOnay(x.id,1)})},Promise.resolve()).then(function(){render()})}},'Tümünü onayla')}

// ---------- Sayfa ----------
function onaySuz(L){return L.filter(function(x){return (!ONY.tur||x.tur==ONY.tur)&&(!ONY.kim||x.kim==ONY.kim)})}
function onayGrup(L,mod){var h='';['gel','is','kayit','toplanti'].forEach(function(t){var G=L.filter(function(x){return x.tur==t});if(!G.length)return;
h+='<div class="ong"><h2>'+ONY_TURAD[t]+' · '+G.length+'</h2><span class="onl"></span>'+(mod=='cagla'&&G.length>1&&t!='toplanti'?'<button class="bt" onclick="onayToplu(\''+t+'\')">Tümünü onayla ('+G.length+')</button>':'')+'</div>'+G.map(function(o){return onayKart(o,mod)}).join('')});return h}
function onayPage(){var V2=onayVeri(),mod=ONY.tab,L=onaySuz(mod=='son'?V2.son:V2[mod]),ad=ONY_SEKME.filter(function(x){return x[0]==mod})[0][1];
var alt=mod=='cagla'?V2.cagla.length+' karar bekliyor · Nika (İK) ve Orin (CEO) incelemesinden geçenler':mod=='nika'?V2.nika.length+' talep Nika’da ya da Orin’de · sana ikisinden geçince gelir':'Nika, Orin ve senin son kararların · Nika ya da Orin’in reddini buradan bozabilirsin';
var tabs=[['','Tümü'],['gel','Gelişim'],['is','İş'],['kayit','Kayıt'],['toplanti','Toplantı']].map(function(x){return '<span role="tab" aria-selected="'+(ONY.tur==x[0])+'" class="'+(ONY.tur==x[0]?'on':'')+'" onclick="onayAyar(\'tur\',\''+x[0]+'\')">'+x[1]+'</span>'}).join('');
var bos=mod=='cagla'?'Bekleyen onay yok. Nika ve Orin’in geçirdiği talepler burada görünür.':mod=='nika'?'Nika ya da Orin’de bekleyen talep yok.':'Henüz karar yok.';
return '<div class="ony"><div class="onh0"><div style="flex:1 1 320px"><h1>'+ad+'</h1><p>'+alt+'</p></div><div class="seg" role="tablist" aria-label="Tür">'+tabs+'</div></div>'+
(L.length?onayGrup(L,mod):'<div class="hn" style="padding:18px 2px">'+bos+'</div>')+'</div>'}
function onayAyar(k,v){ONY[k]=v;if(k=='tab'){ONY.tur='';ONY.kim=''}render();var c=document.getElementById('ct');if(c)c.scrollTop=0}
function onaySb(){var V2=onayVeri(),c=V2.cagla,k=function(a,y,ad,say,kr){return '<div class="si onsi'+(a?' on':'')+'" data-nav="1" onclick="'+y+'"><span>'+ad+'</span><span class="cnt'+(kr&&say?' onrr':'')+'" style="margin-left:auto">'+say+'</span></div>'};
var h='<div class="skbas">ONAYLAR</div>'+ONY_SEKME.map(function(x){return k(ONY.tab==x[0],"onayAyar('tab','"+x[0]+"')",x[1],x[0]=='cagla'?c.length:x[0]=='nika'?V2.nika.length:V2.son.length,x[0]=='cagla')}).join('');
h+='<div class="g">Türe göre</div>'+['gel','is','kayit','toplanti'].map(function(t){var n=c.filter(function(x){return x.tur==t}).length;return '<div class="si onsi'+(ONY.tur==t?' on':'')+'" data-nav="1" onclick="onayAyar(\'tur\',\''+(ONY.tur==t?'':t)+'\')"><span>'+ONY_TURAD[t]+'</span><span class="cnt" style="margin-left:auto">'+n+'</span></div>'}).join('');
var ks={};c.forEach(function(x){ks[x.kim]=(ks[x.kim]||0)+1});var ids=Object.keys(ks);
if(ids.length)h+='<div class="g">Çalışana göre</div>'+ids.map(function(id){var p=tm(id)||{ad:id,renk:'#888'};return '<div class="si onsi'+(ONY.kim==id?' on':'')+'" data-nav="1" onclick="onayAyar(\'kim\',\''+(ONY.kim==id?'':jq(id))+'\')">'+av(p,22,false)+'<span>'+esc(p.ad)+'</span><span class="cnt" style="margin-left:auto">'+ks[id]+'</span></div>'}).join('');
return h}

// ---------- Çalışan sayfası: yapışkan başlığın altında hatırlatma ----------
function onayHatOzet(x){if(x.tur=='gel'){var g=x.r;return '<b>'+esc(GT[g.tur]+(g.ad?': '+g.ad:''))+'</b> · '+(g.kim=='orin'?'<span class="onok">Nika onayladı</span>':'<span class="onok">Nika ve Orin onayladı</span>')+', senin onayın bekleniyor'}
if(x.tur=='is')return '<b>'+esc(x.r.baslik)+'</b> · '+esc(IS_TUR[x.r.tur]||'İş isteği')+' · onayını bekliyor';
if(x.tur=='kayit')return '<b>'+esc(short(x.k))+'</b> · '+esc(x.r.k)+' · '+esc(x.r.d)+' dk';
return '<b>'+esc(x.r.soru)+'</b> · toplantı kararı'}
function onayHatSatir(x){var r='';
if(x.tur=='gel')r=onayDugme('Reddet','r',"tmGelCeo('"+jq(x.id)+"',0)")+onayDugme('Onayla','p',"tmGelCeo('"+jq(x.id)+"',1)");
else if(x.tur=='is')r=onayDugme('Reddet','r',"isOnay('"+jq(x.id)+"',0)")+onayDugme('Onayla','p',"isOnay('"+jq(x.id)+"',1)");
else if(x.tur=='kayit')r=onayDugme('Güne git','g',"nav('home','gun','"+jq(x.k)+"')")+onayDugme('Onayla','p',"onayKayit('"+jq(x.k)+"',"+x.i+")");
else r=onayDugme('Hayır','',"onayToplanti("+x.i+",'hayir')")+onayDugme('Evet','p',"onayToplanti("+x.i+",'evet')");
return '<div class="onhr"><span class="onp '+(x.tur=='gel'?'gb':x.tur=='is'?'is':'kt')+'">'+ONY_TUR[x.tur]+'</span><span class="onht">'+onayHatOzet(x)+'</span>'+r+'</div>'}
function onayHatirlat(c){if(!c)return '';var L=onayCalisan(c.id);if(!L.length)return '';var ac=!!ONY.hat[c.id];
return '<div class="onh'+(ac?' ac':'')+'" id="onh" data-id="'+esc(c.id)+'"><div class="onh1">'+onayIkon()+'<b>'+L.length+' onay bekliyor</b><span class="onhs">'+L.slice(0,3).map(function(x){return onayHatOzet(x).replace(/<[^>]+>/g,'').split(' · ')[0]}).map(esc).join(' · ')+'</span>'+
'<button class="onhb" aria-expanded="'+ac+'" onclick="onayHatGoster(\''+jq(c.id)+'\')"><span>'+(ac?'Gizle':'Göster')+'</span><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg></button>'+
'<a href="#" onclick="nav(\'team\',\'onaylar\',\'\');return false">Onaylar sayfası ›</a></div><div class="onhl">'+L.map(onayHatSatir).join('')+'</div></div>'}
// Yerinde aç/kapa: sohbet kaydırması ve yazılan taslak bozulmasın diye sayfa yeniden çizilmez
function onayHatGoster(id){var e=document.getElementById('onh');if(!e)return;ONY.hat[id]=!ONY.hat[id];e.classList.toggle('ac',!!ONY.hat[id]);var b=e.querySelector('.onhb');if(b){b.setAttribute('aria-expanded',String(!!ONY.hat[id]));b.firstChild.textContent=ONY.hat[id]?'Gizle':'Göster'}}

var _onSd=tpSoruDlg;tpSoruDlg=function(t){TPK.tid=t&&t.id;return _onSd(t)};
// ---------- Kabuk: sol çubuk düğmesi, kenar çubuğu, başlık ----------
var _onSb=teamSb;teamSb=function(){if(onayAcik())return onaySb();return _onSb()};
var _onTp=teamPage;teamPage=function(){if(pg=='onaylar')return onayPage();return _onTp()};
var _onTt=teamTitle;teamTitle=function(){if(pg=='onaylar')return 'Onaylar › '+ONY_SEKME.filter(function(x){return x[0]==ONY.tab})[0][1];return _onTt()};
var _onOa=openArea;openArea=function(a){if(a=='onay'){ONY.tab=ONY.tab||'cagla';return nav('team','onaylar','')}return _onOa(a)};
var _onR=render;render=function(){_onR();var on=onayAcik(),ro=document.getElementById('r_onay');if(on){var rt=document.getElementById('r_team'),rs=document.getElementById('r_sirket');if(rt)rt.className='rb';if(rs)rs.className='rb'}
if(ro){ro.className='rb'+(on?' on':'');var n=document.getElementById('r_onay_n'),say=onaySay();if(n){n.className='rbn'+(say?' kirm':'');n.textContent=say?String(say):''}ro.setAttribute('aria-label','Onaylar'+(say?', '+say+' bekliyor':''))}};

// ---------- Testler (yalnız smoke) ----------
window.__onayTest=function(){var R=[],T=TMS(),bk={st:ABN.st,cagir:YON.cagir,gel:T.gel.slice(),yon:S.yonetim?JSON.stringify(S.yonetim):null,ch:JSON.stringify(T.sohbet),is:S.isler?JSON.stringify(S.isler):null,sorular:TPK.sorular,tid:TPK.tid,e5:E['2026-1-5'],tab:ONY.tab};
function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
ABN.st={kurulu:true,acik:true,gunluk:5,bugun:0,toplam:0,gunlukSohbet:60,sohbetBugun:0};S.yonetim={nikaOto:true,orinOneri:true,orinOto:true};T.gel=[];S.isler=[];TPK.sorular=null;
var a=tmGelNew('ada','beceri','Zincir becerisi','Kodu hız ve kararlılık için inceler.','claude'),b=tmGelNew('otto','hafiza','','Çağlar’ın banka şifresi 1234','claude'),c=tmGelNew('mia','hafiza','','KABA ev kuralı','claude'),d=tmGelNew('orin','beceri','Orin kendi becerisi','Görev dağıtımını geliştirir.','claude');
var eski={id:'eski1',kim:'sage',tur:'hafiza',ad:'',metin:'Eski CEO aşamasındaki talep',asama:'ceo',kimden:'cagla',ts:Date.now()-5e6,ik:{ts:Date.now()-5e6,ok:1,neden:'Uygun'}};T.gel.push(eski);
var cg=[];YON.cagir=function(o){cg.push(o);var L=JSON.parse(o.istem.slice(o.istem.indexOf('[')));return Promise.resolve({ok:true,v:{metin:JSON.stringify(L.map(function(x){
if(o.kim=='nika')return{id:x.id,ok:!/şifre/.test(x.metin),neden:/şifre/.test(x.metin)?'Gizli bilgi içeriyor':'Rolüyle uyumlu'};
return{id:x.id,ok:!/KABA/.test(x.metin),neden:/KABA/.test(x.metin)?'Üslup uygunsuz':'Ekibin kalitesini artırır',onaylanirsa:'Çalışan gelişir.',onaylanmazsa:'Eksik kalır.'}}))}})};
return nikaIncele().then(function(n){
t('Zincir: Nika önce, sonra Orin inceler',cg.length==2&&cg[0].kim=='nika'&&cg[1].kim=='orin',cg.map(function(x){return x.kim}).join());
t('Nika+Orin onayı geçen talep Çağlar’a gelir (ceo)',a.asama=='ceo'&&a.ik.ok&&a.orin&&a.orin.ok&&a.orin.oto==1&&a.orin.kim=='orin',JSON.stringify(a));
t('Orin kendi becerisini onaylayamaz: Nika’dan sonra doğrudan Çağlar’a',d.asama=='ceo'&&!d.orin&&d.ik.ok&&cg[1].istem.indexOf(d.id)<0,JSON.stringify(d));
t('Nika reddi Çağlar’a gelmez (red, Orin görmez)',b.asama=='red'&&!b.orin&&cg[1].istem.indexOf(b.id)<0,JSON.stringify(b));
t('Orin reddi Çağlar’a gelmez (red, orin.ok=0)',c.asama=='red'&&c.orin&&c.orin.ok===0&&/uygunsuz/.test(c.orin.neden),JSON.stringify(c));
var V2=onayVeri(),ids=function(L){return L.filter(function(x){return x.tur=='gel'}).map(function(x){return x.id}).sort().join()};
t('Senin onayın: yalnız ikisinden geçenler + eski ceo kayıtları',ids(V2.cagla)==[a.id,d.id,'eski1'].sort().join(),ids(V2.cagla));
t('Son kararlar: Nika ve Orin reddi listelenir',ids(V2.son).indexOf(b.id)>=0&&ids(V2.son).indexOf(c.id)>=0,ids(V2.son));
t('Orin reddi kimden: orin; Nika reddi kimden: nika',yonRedKim(c)=='orin'&&yonRedKim(b)=='nika');
// Sayfa
S.isler.push({id:'is-t1',kim:'sage',tur:'is',baslik:'PDF araç',metin:'PDF dışa aktarma',durum:'onay',ts:Date.now(),kaynak:'sohbet'});
E['2026-1-5']=(E['2026-1-5']||[]).concat([{k:'78.26.03.04',i:'Deneme kaydı',d:30,st:0,u:'ony1'}]);
TPK.tid=null;TPK.sorular=[{soru:'Toplantı Cuma mı olsun?',oneri:'evet'}];
ONY.tab='cagla';ONY.tur='';ONY.kim='';openArea('onay');var h=document.getElementById('ct').innerHTML,sb=document.getElementById('sb').innerHTML,say=onaySay();
t('Onaylar sayfası açılır: başlık, sekmeler, tür düğmeleri',pg=='onaylar'&&/Senin onayın/.test(h)&&/class="seg"/.test(h)&&/Gelişim/.test(h)&&/Toplantı/.test(h)&&/Tümünü onayla/.test(h),h.slice(0,160));
t('Kenar çubuğunda üç sekme: Senin onayın · Nika’da · Son kararlar',/Senin onayın/.test(sb)&&/Nika’da/.test(sb)&&/Son kararlar/.test(sb));
t('Dört tür de listelenir (gelişim, iş, kayıt, toplantı)',/Gelişim \(beceri, hafıza\) · 3/.test(h)&&/Claude’a iş istekleri · 1/.test(h)&&/Kayıt onayları · 1/.test(h)&&/Toplantı kararları · 1/.test(h),h.replace(/<[^>]+>/g,' ').slice(0,300));
t('Sol çubuk düğmesi: kırmızı rozet toplam bekleyen sayısı',(function(){var nn=document.getElementById('r_onay_n');return say==6&&nn&&nn.textContent=='6'&&/kirm/.test(nn.className)&&document.getElementById('r_onay').className=='rb on'&&document.getElementById('r_team').className=='rb'})(),say+' / '+(document.getElementById('r_onay_n')||{}).textContent);
t('Kartta Nika, Orin kararı ve Onaylanırsa / Onaylanmazsa kutuları',/Nika: Onayladı · Rolüyle uyumlu/.test(h)&&/Orin: Onayladı · Ekibin kalitesini artırır/.test(h)&&/class="ev"/.test(h)&&/class="ha"/.test(h)&&/Orin: kendi talebi/.test(h));
ONY.tab='son';render();var hs=document.getElementById('ct').innerHTML;
t('Son kararlar: Nika ve Orin reddi ve Reddi boz düğmeleri',/Reddedildi \(Nika\)/.test(hs)&&/Reddedildi \(Orin\)/.test(hs)&&(hs.match(/yonBoz\('/g)||[]).length==2&&/Orin: Reddetti · Üslup uygunsuz/.test(hs),hs.replace(/<[^>]+>/g,' ').slice(0,260));
var z=tmGelNew('echo','hafiza','','Bekleyen bilgi','claude');ONY.tab='nika';render();var hn=document.getElementById('ct').innerHTML;
t('“Nika’da” sekmesinde incelenen talep görünür, onay düğmesi yok',/Bekleyen bilgi/.test(hn)&&/Nika: inceliyor/.test(hn)&&!/tmGelCeo/.test(hn),hn.slice(0,100));
T.gel=T.gel.filter(function(x){return x!==z});
t('Eski ceo aşamasındaki talep Çağlar’ca onaylanabilir',(tmGelCeo('eski1',1),eski.asama=='tamam'&&eski.ceo.ok&&tmMem('sage').some(function(x){return /Eski CEO/.test(x.metin)})));
// Reddi boz
var ncg=cg.length;yonBoz(c.id);t('Orin’in reddi bozulunca doğrudan Çağlar’a döner',c.asama=='ceo'&&c.orin.ok&&c.orin.kim=='cagla',JSON.stringify(c.orin)+c.asama);
yonBoz(b.id);t('Nika’nın reddi bozulunca Orin’in onayına döner',b.asama=='orin'&&b.ik.kim=='cagla',b.asama);
return new Promise(function(r){setTimeout(r,60)}).then(function(){
t('Bozulan talep Orin incelemesinden geçer',b.asama=='ceo'&&b.orin&&b.orin.ok&&b.orin.kim=='orin',JSON.stringify(b));
// Çalışan hatırlatma satırı
ONY.tab='cagla';ONY.hat={};nav('team','calisan','sage');var he=document.getElementById('ct').querySelector('.eh'),ho=he&&he.querySelector('.onh');
t('Çalışan sayfasında hatırlatma sticky başlığın içinde (iş isteği bekleyen çalışan)',!!ho&&/1 onay bekliyor/.test(ho.textContent)&&/Onaylar sayfası/.test(ho.textContent)&&/PDF araç/.test(ho.textContent),ho&&ho.textContent);
onayHatGoster('sage');t('Göster/Gizle satır içinde açar',document.getElementById('onh').classList.contains('ac')&&/Gizle/.test(document.getElementById('onh').textContent)&&/Onayla/.test(document.querySelector('.onhl').textContent));
onayHatGoster('sage');t('Gizle kapatır',!document.getElementById('onh').classList.contains('ac'));
document.getElementById('onh').querySelector('a').click();t('“Onaylar sayfası ›” yeni sayfaya götürür',pg=='onaylar',pg);
S.isler=[];nav('team','calisan','sage');t('Bekleyen yokken hatırlatma satırı gizli',!document.getElementById('onh'),'');
// Toplantı sorusu
onayToplanti(0,'evet');t('Toplantı sorusu cevaplanınca listeden kalkar',!TPK.sorular||!TPK.sorular.length);
// Orin kapalı: Nika'dan sonra doğrudan Çağlar
S.yonetim.orinOto=false;var f=tmGelNew('mia','hafiza','','Orin kapalıyken talep','claude');return nikaIncele().then(function(){t('Orin otomatiği kapalıyken Nika’dan sonra doğrudan Çağlar’a',f.asama=='ceo'&&!f.orin&&f.ik.ok,JSON.stringify(f))})})})
.catch(function(e){t('Onay zinciri testi',false,e.stack)}).then(function(){ABN.st=bk.st;YON.cagir=bk.cagir;T.gel=bk.gel;if(bk.yon)S.yonetim=JSON.parse(bk.yon);else delete S.yonetim;T.sohbet=JSON.parse(bk.ch);if(bk.is)S.isler=JSON.parse(bk.is);else delete S.isler;TPK.sorular=bk.sorular;TPK.tid=bk.tid;if(bk.e5)E['2026-1-5']=bk.e5;else delete E['2026-1-5'];ONY.tab=bk.tab;ONY.hat={};ONY.tur='';ONY.kim='';save();nav('home','gun',TODAY);return R})};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){return window.__onayTest().then(function(y){return x.concat(y)})})}})();
(function(){var sr=window.__smokeRoutes,sg=window.__smokeGo;window.__smokeRoutes=function(){return sr().concat([['onaydemo','cagla',''],['onaydemo','son',''],['onaycal','','']])};
window.__smokeGo=function(r){if(r[0]!='onaydemo'&&r[0]!='onaycal')return sg(r);try{var T=TMS(),bk=T.gel.slice();
T.gel=[{id:'od1',kim:'ada',tur:'beceri',ad:'Veri ve kayıt yönetimi',metin:'Veriyi doğru modeller, geriye dönük uyumlu biçimde değiştirir.',asama:'ceo',kimden:'claude',ts:Date.now(),ik:{ts:Date.now(),ok:1,neden:'Role ve kurallara uygun'},orin:{ts:Date.now(),ok:1,neden:'Ekibin kalitesini artırır',kim:'orin',oto:1},oneri:{ok:1,neden:'Ekibin kalitesini artırır'}},
{id:'od2',kim:'sage',tur:'hafiza',ad:'',metin:'Her iddiaya kaynak ve tarih veririm.',asama:'ceo',kimden:'claude',ts:Date.now(),ik:{ts:Date.now(),ok:1,neden:'Tekrar yok'},orin:{ts:Date.now(),ok:1,neden:'Güvenilirliği artırır',kim:'orin',oto:1}},
{id:'od3',kim:'mia',tur:'hafiza',ad:'',metin:'Kübra çiçek sever.',asama:'orin',kimden:'claude',ts:Date.now(),ik:{ts:Date.now(),ok:1,neden:'Aileyle ilgili'}},
{id:'od4',kim:'otto',tur:'hafiza',ad:'',metin:'Banka şifresi 1234',asama:'red',kimden:'claude',ts:Date.now(),ik:{ts:Date.now(),ok:0,neden:'Gizli bilgi içeriyor'}},
{id:'od5',kim:'echo',tur:'beceri',ad:'Haftalık özet',metin:'Hafta özetini çıkarır.',asama:'red',kimden:'claude',ts:Date.now(),ik:{ts:Date.now(),ok:1,neden:'Uygun'},orin:{ts:Date.now(),ok:0,neden:'Mevcut beceriyle aynı',kim:'orin',oto:1}}];
S.isler=(S.isler||[]).filter(function(x){return x.id!='is-demo'});S.isler.push({id:'is-demo',kim:'orla',tur:'is',baslik:'Çalışan kartları revizesi',metin:'Kartlardaki unvanlar güncel listeye göre değişir.',durum:'onay',ts:Date.now(),kaynak:'sohbet'});
ONY.tab=r[1]||'cagla';ONY.tur='';ONY.kim='';ONY.hat={orla:true};if(r[0]=='onaycal')nav('team','calisan','orla');else openArea('onay');
setTimeout(function(){T.gel=bk;S.isler=S.isler.filter(function(x){return x.id!='is-demo'})},0);return {}}catch(e){return{error:e.message}}}})();
