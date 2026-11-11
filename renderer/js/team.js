// Orvane · Çalışanlarım: veri, kenar çubuğu, çalışan sayfası, gelişim akışı (İK → CEO), sohbet ve notlar
var TEAM0=(API&&API.teamSeed&&API.teamSeed())||{sirket:'Orvane',calisanlar:[]};
var TMTAB='genel',TMMODE={},TMD={},TMQ='',TMSCR=false;
var LVL=['','Başlangıç','Gelişiyor','Yetkin','Usta','Uzman'];
// Başlangıç becerileri (Nika ve Orin'in onayıyla gelişir)
var BEC0={orin:[['Görev dağıtımı',2,'İşi doğru çalışana yönlendirir'],['Önceliklendirme',1,'Acil ve önemli işleri ayırır'],['Gelişim onayı',2,'Nika’nın önerdiği gelişimleri son kez değerlendirir']],
orla:[['Koordinasyon',2,'Ekip arasındaki işleri sıraya koyar'],['Görev takibi',1,'Açık görevleri izler, gecikeni bildirir']],
nika:[['Çalışan kartları',2,'Kimlik kartlarını ve profilleri hazırlar'],['Beceri geliştirme',2,'Çalışanlar için gelişim önerir'],['Hafıza düzenleme',1,'Çalışan hafızalarını derler ve sadeleştirir']],
echo:[['İş günü kaydı',3,'Günlük kayıtları tutar, Günü doldur kuralını uygular'],['Sheets eşitleme',3,'Kayıtları Google Sheets ile eşitler'],['Haftalık özet',2,'Hafta ve ay özetini çıkarır, eksik günleri bulur']],
otto:[['Gelir-gider kaydı',1,''],['Ödeme hatırlatma',1,'']],iris:[['Sağlık takibi',1,''],['Alışkanlık önerileri',1,'']],marco:[['Haftalık menü',1,''],['Market listesi',1,'']],
luca:[['Proje arama',1,''],['Çizim arama',1,'']],vera:[['Standart kontrolü',1,''],['Kalite raporu',1,'']],ada:[['Kod yazma',1,''],['Hata ayıklama',1,'']],
remy:[['Takvim düzeni',1,''],['Hatırlatma',1,'']],sage:[['Araştırma',1,''],['Özetleme',1,'']],mia:[['Ev işleri planı',1,''],['Aile takvimi',1,'']],
kai:[['Teknik bakım',1,''],['Arıza teşhisi',1,'']],cleo:[['Mesaj taslağı',1,''],['Resmi yazışma',1,'']]};
var DESC0={orin:'şirketi yönetir, görevleri dağıtır, gelişimleri onaylar',orla:'ekibi koordine eder, işleri sıraya koyar',nika:'çalışan kartlarını hazırlar, beceri ve hafızaları geliştirir',echo:'iş günü kayıtlarını toplar ve raporlar',otto:'gelir-gider kaydını tutar, yaklaşan ödemeleri hatırlatır'};

// ---------- Veri ----------
function TMS(){if(!S.team||!S.team.v)S.team={v:1,m:{},gorev:[],gel:[],not:[],sohbet:{}};var T=S.team;['gorev','gel','not'].forEach(function(k){T[k]=T[k]||[]});T.m=T.m||{};T.sohbet=T.sohbet||{};return T}
function tmAll(){var T=TMS(),r=[],ids={};(TEAM0.calisanlar||[]).forEach(function(c){ids[c.id]=1;r.push(Object.assign({},c,T.m[c.id]||{}))});
Object.keys(T.m).forEach(function(id){if(!ids[id]&&T.m[id].yeni)r.push(Object.assign({id:id,grup:'ekip',bagli:'Orla',renk:'#8f9bb3',grafikler:[]},T.m[id]))});return r.filter(function(c){return !c.sil})}
function tm(id){return tmAll().filter(function(c){return c.id==id})[0]||null}
function tmSet(id,o){var T=TMS();T.m[id]=Object.assign(T.m[id]||{},o);save()}
function TM_SEL(){return (S.teamSel&&tm(S.teamSel))?S.teamSel:'echo'}
function tmChat(id){var T=TMS();return T.sohbet[id]||(T.sohbet[id]=[])}
function tmPush(id,m){var a=tmChat(id);m.ts=m.ts||Date.now();a.push(m);if(a.length>300)a.splice(0,a.length-300);TMSCR=true;save()}
function tmSkills(id){var c=TMS().m[id];return (c&&c.bec)||(BEC0[id]||[]).map(function(x){return{ad:x[0],sv:x[1],not:x[2]}})}
function tmMem(id){var c=TMS().m[id];return (c&&c.haf)||[]}
function tmDesc(c){return c.aciklama||DESC0[c.id]||c.gorev}
function tmChain(c){var r=[],x=c,g=0;while(x&&g++<6){r.unshift(x.ad);var b=x.bagli;if(!b||b=='Çağlar'){r.unshift('Çağlar');break}x=tmAll().filter(function(y){return y.ad==b})[0];if(!x){r.unshift(b);break}}return r}
function tmByName(n){return tmAll().filter(function(c){return c.ad==n})[0]||null}
function wkStart(){var d=pk(TODAY),w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);d.setHours(0,0,0,0);return d}
function tmOpen(id){return TMS().gorev.filter(function(g){return g.durum!='bitti'&&(!id||g.kim==id)})}
function tmDoneWeek(id){var w=+wkStart();return TMS().gorev.filter(function(g){return g.durum=='bitti'&&g.bts>=w&&(!id||g.kim==id)})}
function tmStat(c){if(c.grup=='yonetim'||c.id=='echo')return 'ok';var o=tmOpen(c.id);if(o.some(function(g){return g.onc=='acil'}))return 'bz';return o.length?'ok':'id'}
function tmOnline(){if(window.__off)return false;return navigator.onLine!==false}
function tmPending(id){return TMS().not.filter(function(n){return n.durum=='bekliyor'&&(!id||n.kim==id)})}
function tmGelFor(c){var g=TMS().gel;if(c.id=='nika')return g.filter(function(x){return x.asama=='ik'});if(c.id=='orin')return g.filter(function(x){return x.asama=='ceo'});return g.filter(function(x){return x.kim==c.id&&(x.asama=='ik'||x.asama=='ceo')})}
function av(c,s,ring){if(!c)return '';if(c.foto)return '<img class="avp" src="../'+esc(c.foto)+'" alt="" style="width:'+s+'px;height:'+s+'px'+(ring===false?'':';box-shadow:0 0 0 2px '+c.renk+'66')+'">';
return '<span class="av" style="width:'+s+'px;height:'+s+'px;font-size:'+Math.round(s*.42)+'px;background:linear-gradient(135deg,'+c.renk+','+c.renk+'88)">'+esc((c.ad||'?')[0])+'</span>'}
function tmTime(ts){var d=new Date(ts),t=d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});return key(d)==TODAY?t:short(key(d))+' '+t}

// ---------- Kenar çubuğu ----------
function teamSb(){var A=tmAll(),on=tmOnline();function it(c){var st=on?tmStat(c):'id';return '<div class="si tm'+(pg=='calisan'&&arg==c.id?' on':'')+'" data-nav="1" data-q="'+esc((c.ad+' '+c.gorev).toLocaleLowerCase('tr'))+'" onclick="nav(\'team\',\'calisan\',\''+jq(c.id)+'\')">'+av(c,30)+'<div style="min-width:0;flex:1"><div style="display:flex;align-items:center;gap:6px">'+esc(c.ad)+'<span class="dt '+st+'"></span></div><div class="rl">'+esc(c.gorev)+'</div></div></div>'}
return '<div class="tsr"><i class="ti ti-search"></i><input id="tq" placeholder="Çalışan ara" value="'+esc(TMQ)+'" oninput="tmFilter(this.value)"></div>'+
'<div class="si'+(pg=='ik'?' on':'')+'" data-nav="1" onclick="nav(\'team\',\'ik\',\'\')"><span class="hri"><i class="ti ti-id-badge-2"></i></span><div style="flex:1;min-width:0"><div>İnsan Kaynakları</div><div class="rl">Çalışan kartları · Nika</div></div><span class="cnt">'+A.length+'</span></div>'+
'<div class="g">Yönetim</div>'+A.filter(function(c){return c.grup=='yonetim'}).map(it).join('')+'<div class="g">Ekip</div>'+A.filter(function(c){return c.grup!='yonetim'}).map(it).join('')}
function tmFilter(v){TMQ=v;var q=v.toLocaleLowerCase('tr').trim();document.querySelectorAll('#sb .si.tm').forEach(function(e){e.style.display=!q||e.getAttribute('data-q').indexOf(q)>=0?'':'none'})}
function teamTitle(){if(pg=='ik')return 'Çalışanlarım › İnsan Kaynakları';var c=tm(arg);return 'Çalışanlarım › '+(c?(c.grup=='yonetim'?'Yönetim':'Ekip')+' › '+c.ad:'')}

// ---------- Grafikler (kütüphanesiz SVG) ----------
function gBar(v,l,mx,tg,col){var W=260,H=120,bw=W/v.length,s='<svg viewBox="0 0 '+W+' '+(H+18)+'" class="ch">';
if(tg){var y=H-tg/mx*H;s+='<line x1="0" x2="'+W+'" y1="'+y+'" y2="'+y+'" stroke="#8e8e95" stroke-dasharray="4 4" stroke-width="1"/>'}
v.forEach(function(x,i){var h=Math.max(0,x/mx*H);s+='<rect x="'+(i*bw+bw*.2)+'" y="'+(H-h)+'" width="'+(bw*.6-2)+'" height="'+h+'" rx="4" fill="'+col+'"><title>'+dk(x)+' dk</title></rect>'});
l.forEach(function(t,i){s+='<text x="'+(i*bw+bw/2)+'" y="'+(H+14)+'" text-anchor="middle">'+t+'</text>'});return s+'</svg>'}
function gDonut(p){var tot=p.reduce(function(a,b){return a+b[1]},0),a=-Math.PI/2,s='<div class="dn"><svg viewBox="0 0 120 120" width="118" height="118">';
if(p.length==1)s+='<circle cx="60" cy="60" r="48" stroke="'+p[0][2]+'" stroke-width="16" fill="none"/>';
else p.forEach(function(x){var b=a+x[1]/tot*2*Math.PI,lg=b-a>Math.PI?1:0;s+='<path d="M'+(60+48*Math.cos(a))+' '+(60+48*Math.sin(a))+' A48 48 0 '+lg+' 1 '+(60+48*Math.cos(b-.04))+' '+(60+48*Math.sin(b-.04))+'" stroke="'+x[2]+'" stroke-width="16" fill="none"/>';a=b});
return s+'</svg><div class="lgd">'+p.map(function(x){return '<div><i style="background:'+x[2]+'"></i>'+esc(x[0])+'<b>'+Math.round(x[1]/tot*100)+'%</b></div>'}).join('')+'</div></div>'}
function gLine(v,l,mx,col,gid){var W=260,H=110,st=W/(v.length-1),pts=v.map(function(x,i){return[i*st,H-x/mx*H+5]}),d='M'+pts.map(function(p){return p.join(' ')}).join(' L');
var s='<svg viewBox="0 0 '+W+' '+(H+22)+'" class="ch"><defs><linearGradient id="'+gid+'" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".35"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs><path d="'+d+' L'+W+' '+(H+5)+' L0 '+(H+5)+'Z" fill="url(#'+gid+')"/><path d="'+d+'" stroke="'+col+'" stroke-width="2.5" fill="none"/>';
pts.forEach(function(p,i){s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3" fill="'+col+'"><title>'+dk(v[i])+'</title></circle>'});l.forEach(function(t,i){s+='<text x="'+Math.min(Math.max(i*st,10),W-10)+'" y="'+(H+20)+'" text-anchor="middle">'+t+'</text>'});return s+'</svg>'}
// Gerçek veriden gelen grafikler (iş günü kayıtları)
var GRF={
hafta:function(c){var d=wkStart(),v=[],l=['Pzt','Sal','Çar','Per','Cum'];for(var i=0;i<5;i++){var k=key(d);v.push(tot(k));d.setDate(d.getDate()+1)}var mx=Math.max(600,Math.max.apply(null,v)+60);return{t:'Bu hafta',s:'günlük dk · hedef '+S.w1,h:gBar(v,l,mx,S.w1,c.renk)}},
proje:function(c){var t=pk(TODAY),y=t.getFullYear(),m=t.getMonth(),g={};Object.keys(E).forEach(function(k){var d=pk(k);if(d.getFullYear()==y&&d.getMonth()==m)(E[k]||[]).forEach(function(e){var n=SPECIAL.indexOf(e.k)>=0||e.k=='?'?'Diğer':pmodel(e.k);if(n=='Diğer işler')n='Diğer';g[n]=(g[n]||0)+e.d})});
var a=Object.keys(g).map(function(n){return[n,g[n]]}).sort(function(p,q){return q[1]-p[1]});if(!a.length)return{t:'Proje dağılımı',s:AY[m],none:'Bu ay kayıt yok'};
var top=a.filter(function(x){return x[0]!='Diğer'}).slice(0,2),rest=a.filter(function(x){return top.indexOf(x)<0}).reduce(function(s,x){return s+x[1]},0),col=[c.renk,'#7a8cff'],p=top.map(function(x,i){return[x[0],x[1],col[i]]});if(rest)p.push(['Diğer',rest,'#5a5a62']);return{t:'Proje dağılımı',s:AY[m],h:gDonut(p)}},
mesai:function(c){var t=pk(TODAY),v=[],l=[];for(var i=5;i>=0;i--){var d=new Date(t.getFullYear(),t.getMonth()-i,1),y=d.getFullYear(),m=d.getMonth(),s=0;Object.keys(OT).forEach(function(k){var x=pk(k);if(x.getFullYear()==y&&x.getMonth()==m)s+=OT[k]||0});v.push(Math.round(s/6)/10);l.push(AY[m].slice(0,3))}
return{t:'Fazla mesai',s:'son 6 ay · saat',h:gLine(v,l,Math.max(2,Math.max.apply(null,v)*1.2),c.renk,'gm'+c.id)}}};
function tmCharts(c){var g=(c.grafikler&&c.grafikler.length)?c.grafikler:[{t:'Alan grafiği',s:'tasarım bekleniyor'},{t:'Alan grafiği',s:'tasarım bekleniyor'},{t:'Alan grafiği',s:'tasarım bekleniyor'}];
return '<div class="gr3">'+g.slice(0,4).map(function(x){var r=typeof x=='string'&&GRF[x]?GRF[x](c):{t:x.t||x,s:x.s||'',none:'Veri yok'};return '<div class="gc"><div class="gt">'+esc(r.t)+'<span>'+esc(r.s)+'</span></div>'+(r.h||'<div class="gx"><i class="ti ti-chart-dots-3"></i>'+esc(r.none||'Veri yok')+'</div>')+'</div>'}).join('')+'</div>'}

// ---------- Görev kartları ----------
function tmKpi(c){var co=c.id=='orin',A=tmAll(),on=tmOnline(),act=A.filter(function(x){return on&&tmStat(x)!='id'}).length;
return '<div class="kp5"><div><small><i class="ti ti-list-check"></i> Açık görev'+(co?'<span>şirket</span>':'')+'</small><b>'+tmOpen(co?null:c.id).length+'</b></div>'+
'<div><small><i class="ti ti-circle-check"></i> Biten görev</small><b>'+tmDoneWeek(co?null:c.id).length+'</b><em>bu hafta</em></div>'+
'<div><small><i class="ti ti-hourglass"></i> Bekleyen onay</small><b style="color:#ffb35b">'+tmGelFor(c).length+'</b></div>'+
'<div><small><i class="ti ti-users"></i> Ekip durumu</small><b><span style="color:#4fd18b">'+act+'</span> <span class="sm">aktif · '+(A.length-act)+' boşta</span></b></div>'+
(typeof zekaKart=='function'?zekaKart(c,co):'')+'</div>'}

// ---------- Sohbet ----------
function tmMsgs(c){var a=tmChat(c.id),on=tmOnline(),h='';
if(!a.length)h+=tmBot(c,'Merhaba, ben '+c.ad+'. '+c.gorev+' işlerine bakıyorum.'+(c.id=='echo'?' Kayıtlarına bakıp hemen özet çıkarabilirim.':' Yapay zekâ bağlantısı kurulunca sohbet edebileceğiz; şimdiden mesaj ya da not bırakabilirsin.'),null,c.id=='echo'?['Bu haftanın raporu','Eksik günler','Bu ayın özeti']:null);
a.forEach(function(m){if(m.r=='ben'){if(m.tur=='not')h+='<div class="nt"><i class="ti ti-note"></i><div style="flex:1">'+esc(m.t)+'<div class="nm">'+tmTime(m.ts)+' · not olarak kaydedildi</div></div><span class="qb ok"><i class="ti ti-check"></i> '+(m.ilt?'İletildi':'Kaydedildi')+'</span></div>';
else h+='<div class="mr"><div class="bme">'+esc(m.t)+'<small>'+(m.tur=='ses'?'<i class="ti ti-microphone"></i> sesli · ':'')+tmTime(m.ts)+(m.bek?' · cevap bekliyor':'')+'</small></div></div>'}
else if(m.r=='sys')h+='<div class="inf"><i class="ti ti-info-circle"></i><div>'+esc(m.t)+'<div class="nm">'+tmTime(m.ts)+'</div></div></div>';
else h+=tmBot(c,m.t,m.ts,m.qr,m.zn)});
var bk=a.filter(function(m){return m.bek}).length;
if(!on){var p=tmPending(c.id);h+='<div class="ofl"><i class="ti ti-wifi-off"></i><div><b>Çevrimdışısın.</b> Yazdıkların not olarak saklanır, bağlantı gelince '+esc(c.ad)+'’ya iletilir.</div></div>'+p.map(function(n){return '<div class="nt"><i class="ti ti-note"></i><div style="flex:1">'+esc(n.metin)+'<div class="nm">'+tmTime(n.ts)+' · not olarak kaydedildi</div></div><span class="qb"><i class="ti ti-clock"></i> Bekliyor</span></div>'}).join('')}
else if(bk)h+='<div class="inf"><i class="ti ti-plug-connected-x"></i><div>Yapay zekâ bağlı değil · '+bk+' mesaj cevap bekliyor. Bağlantı kurulunca '+esc(c.ad)+' cevaplayacak.</div></div>';
return '<div class="cv" id="tmcv">'+h+'</div>'}
function tmBot(c,t,ts,qr,zn){return '<div class="mr l">'+av(c,32)+'<div style="flex:1;min-width:0"><div class="who">'+esc(c.ad)+(ts?' <span>· '+tmTime(ts)+'</span>':'')+'</div><div class="bo">'+tmFmt(t)+'</div>'+(zn?tmZincir(zn):'')+(qr&&qr.length?'<div class="qr">'+qr.map(function(q){return '<span onclick="tmQuick(\''+jq(c.id)+'\',\''+jq(q)+'\')">'+esc(q)+'</span>'}).join('')+'</div>':'')+'</div></div>'}
function tmFmt(t){return esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')}
function tmZincir(z){return '<div class="tr">'+z.map(function(n,i){var c=tmByName(n);return (i?'<i class="ti ti-chevron-right"></i>':'')+'<span>'+(c?av(c,18,false):'')+esc(n)+'</span>'}).join('')+'<em>✓</em></div>'}
function tmComposer(c){var on=tmOnline(),md=on?(TMMODE[c.id]||'mesaj'):'not';
return '<div class="cmp'+(on?(md=='not'?' nt2':''):' ofc')+'"><textarea id="tmi" rows="1" placeholder="'+esc(md=='not'?c.ad+'’ya not bırak'+(on?'…':', bağlantı gelince iletilir…'):c.ad+'’ya mesaj yaz…')+'" oninput="tmGrow(this)" onkeydown="tmKey(event,\''+jq(c.id)+'\')"></textarea>'+
'<div class="cbt"><span class="ib" title="Ekle" onclick="toast(\'Dosya ekleme sonraki sürümde\')"><i class="ti ti-plus"></i></span><span class="ib" title="Dosya iliştir" onclick="toast(\'Dosya ekleme sonraki sürümde\')"><i class="ti ti-paperclip"></i></span>'+
'<span class="md"><span class="'+(md=='mesaj'?'on':'')+'" onclick="tmMode(\''+jq(c.id)+'\',\'mesaj\')"><i class="ti ti-message-circle"></i> Mesaj</span><span class="'+(md=='not'?'on':'')+'" onclick="tmMode(\''+jq(c.id)+'\',\'not\')"><i class="ti ti-note"></i> Not</span></span><span style="flex:1"></span>'+
'<span class="ib" id="tmmic" title="Sesli sohbet" onclick="voiceOpen(\''+jq(c.id)+'\')"><i class="ti ti-microphone"></i></span><button class="snd" title="'+(md=='not'?'Notu kaydet':'Gönder')+'" onclick="tmSend(\''+jq(c.id)+'\')"><i class="ti ti-'+(md=='not'?'device-floppy':'arrow-up')+'"></i></button></div></div>'}
function tmGrow(e){TMD[arg]=e.value;e.style.height='auto';e.style.height=Math.min(160,e.scrollHeight)+'px'}
// Enter gönderir; Alt+Enter ya da Shift+Enter alt satıra geçer
function tmKey(ev,id){if(ev.key!='Enter')return;if(ev.altKey||ev.shiftKey){if(ev.altKey){ev.preventDefault();var e=ev.target,a=e.selectionStart,b=e.selectionEnd;e.value=e.value.slice(0,a)+'\n'+e.value.slice(b);e.selectionStart=e.selectionEnd=a+1;tmGrow(e)}return}ev.preventDefault();tmSend(id)}
function tmMode(id,m){if(m=='mesaj'&&!tmOnline()){toast('Çevrimdışıyken yalnız not bırakılabilir');return}TMMODE[id]=m;render()}
function tmSend(id,txt,tur){var e=document.getElementById('tmi'),t=(txt!=null?txt:(e?e.value:'')).trim();if(!t)return;var c=tm(id),on=tmOnline(),md=tur||(on?(TMMODE[id]||'mesaj'):'not');
if(txt==null){TMD[id]='';if(e)e.value=''}
if(md=='not'){if(on)tmPush(id,{r:'ben',t:t,tur:'not'});else{TMS().not.push({id:uid(),kim:id,metin:t,ts:Date.now(),durum:'bekliyor'});save()}toast(on?'Not kaydedildi':'Not kaydedildi · bağlantı gelince sorulacak')}
else{tmPush(id,{r:'ben',t:t,tur:md=='ses'?'ses':'mesaj'});var r=null;if(typeof zekaHazir=='function'&&zekaHazir()){tmChat(id)[tmChat(id).length-1].bek=1;zekaCevapla(id)}else{r=tmReply(c,t);if(r)tmPush(id,{r:'o',t:r.t,qr:r.qr});else tmChat(id)[tmChat(id).length-1].bek=1}}
render();return r}
function tmQuick(id,q){tmSend(id,q,'mesaj')}
// Yapay zekâ bağlı değilken yerel cevaplar: yalnız Echo, gerçek kayıtlardan
function tmReply(c,t){if(!c||c.id!='echo')return null;var q=t.toLocaleLowerCase('tr');
if(/eksik|hata|boş/.test(q))return echoMissing();if(/\bay\b|ayın|aylık|bu ay/.test(q))return echoMonth();if(/hafta|rapor|özet|durum/.test(q))return echoWeek();return null}
function echoWeek(){var d=wkStart(),tam=0,iz=0,ek=[],bug=null,g={},sum=0;for(var i=0;i<5;i++){var k=key(d);d.setDate(d.getDate()+1);if(pk(k)>pk(TODAY))break;var L=lim(k);(E[k]||[]).forEach(function(e){var n=SPECIAL.indexOf(e.k)>=0||e.k=='?'?'Diğer':pmodel(e.k);g[n]=(g[n]||0)+e.d;sum+=e.d});
if(!L)continue;if(D[k]){iz++;continue}var T=tot(k),H=L+(OT[k]||0);if(T>=H)tam++;else if(k==TODAY)bug=[T,H-T];else ek.push([k,H-T])}
var p=[];if(tam)p.push(tam+' gün tam');if(iz)p.push(iz+' gün izin');var s=p.length?p.join(', '):'Bu hafta henüz tamamlanan gün yok';
if(ek.length)s+=', '+ek.map(function(x){return '**'+GN[pk(x[0]).getDay()]+'’da '+dk(x[1])+' dk eksik**'}).join(', ')+' var';s+='.';
if(bug)s+=' Bugün '+dk(bug[0])+' dk girildi, '+dk(bug[1])+' dk kaldı.';
var top=Object.keys(g).filter(function(n){return n!='Diğer'}).sort(function(a,b){return g[b]-g[a]})[0];if(top&&sum)s+=' En çok süre '+top+'’de (%'+Math.round(g[top]/sum*100)+').';
return{t:s,qr:ek.length?['Eksik günler','Bu ayın özeti']:['Bu ayın özeti']}}
function echoMonth(){var t=pk(TODAY),y=t.getFullYear(),m=t.getMonth(),n=0,s=0,ot=0,er=0;for(var dd=1;dd<=t.getDate();dd++){var k=mk(y,m+1,dd);if(tot(k)>0){n++;s+=tot(k)}ot+=OT[k]||0;var ty=typ(k);if(ty=='hata'||ty=='girdi')er++}
return{t:AY[m]+': '+n+' gün kayıt, toplam '+sa(s)+'.'+(er?' **'+er+' günde eksik ya da hatalı kayıt** var.':' Eksik gün yok.')+(ot?' Fazla mesai '+sa(ot)+'.':''),qr:er?['Eksik günler']:[]}}
function echoMissing(){var t=pk(TODAY),y=t.getFullYear(),m=t.getMonth(),a=[];for(var dd=1;dd<t.getDate();dd++){var k=mk(y,m+1,dd),ty=typ(k);if(ty=='hata'||ty=='girdi')a.push(short(k)+(ty=='girdi'?' (kayıt yok)':' ('+dk((lim(k)||0)+(OT[k]||0)-tot(k))+' dk fark)'))}
return{t:a.length?'Bu ay düzeltilmesi gereken günler: '+a.join(', ')+'. İş Günleri’nden ilgili güne girip düzeltebilirsin.':'Bu ay eksik ya da hatalı gün yok.',qr:[]}}

// ---------- Gelişim: önce İK Müdürü (Nika), sonra CEO (Orin) ----------
var GT={beceri:'Yeni beceri',seviye:'Seviye yükseltme',hafiza:'Hafızaya ekleme'};
function tmGelNew(kim,tur,ad,metin,kimden){var o={id:uid(),kim:kim,tur:tur,ad:ad||'',metin:metin||'',asama:kimden=='nika'?'ceo':'ik',kimden:kimden||'cagla',ts:Date.now()};if(kimden=='nika')o.ik={ts:Date.now(),ok:1};TMS().gel.push(o);save();return o}
function tmGelIk(id,ok){var g=TMS().gel.filter(function(x){return x.id==id})[0];if(!g||g.asama!='ik')return;g.ik={ts:Date.now(),ok:ok?1:0};g.asama=ok?'ceo':'red';save();toast(ok?'Nika onayladı · Orin’in onayına gitti':'Talep reddedildi');render()}
function tmGelCeo(id,ok){var g=TMS().gel.filter(function(x){return x.id==id})[0];if(!g||g.asama!='ceo')return;g.ceo={ts:Date.now(),ok:ok?1:0};g.asama=ok?'tamam':'red';if(ok)tmGelApply(g);save();toast(ok?'Orin onayladı · '+(tm(g.kim)||{}).ad+' gelişti':'Talep reddedildi');render()}
function tmGelApply(g){var b=tmSkills(g.kim).map(function(x){return Object.assign({},x)});
if(g.tur=='beceri'){var ex=b.filter(function(x){return x.ad.toLocaleLowerCase('tr')==g.ad.toLocaleLowerCase('tr')})[0];if(ex)ex.sv=Math.min(5,ex.sv+1);else b.push({ad:g.ad,sv:1,not:g.metin});tmSet(g.kim,{bec:b})}
else if(g.tur=='seviye'){b.forEach(function(x){if(x.ad==g.ad)x.sv=Math.min(5,x.sv+1)});tmSet(g.kim,{bec:b})}
else{var h=tmMem(g.kim).slice();h.push({id:uid(),metin:g.metin,kaynak:(g.kimden=='nika'?'Nika önerdi':g.kimden=='abonelik'?'Abonelik işinden öğrendi':'Çağlar istedi')+' · Nika ve Orin onayladı',ts:Date.now()});tmSet(g.kim,{haf:h})}}
function tmGelLabel(g){return GT[g.tur]+(g.ad?' · '+g.ad:'')}
function tmFlow(g){var s=function(t,on,c){return '<span class="bdg '+(on?c:'')+'">'+t+'</span>'};
return '<div class="flw">'+s(g.kimden=='nika'?'Nika önerdi':'Çağlar istedi','',1)+'<i class="ti ti-chevron-right"></i>'+s(g.ik?(g.ik.ok?'İK onayı ✓':'İK reddetti'):'İK incelemesi',1,g.ik?(g.ik.ok?'ok':'red'):'ik')+'<i class="ti ti-chevron-right"></i>'+s(g.ceo?(g.ceo.ok?'CEO onayı ✓':'CEO reddetti'):'CEO onayı',1,g.ceo?(g.ceo.ok?'ok':'red'):g.asama=='ceo'?'ceo':'')+'</div>'}
function tmGelRow(g,act){var c=tm(g.kim)||{ad:g.kim,renk:'#888'};return '<div class="ti3">'+av(c,30)+'<div class="tx"><b style="color:#fff">'+esc(c.ad)+'</b> · '+esc(tmGelLabel(g))+(g.metin?'<small>'+esc(g.metin)+'</small>':'')+tmFlow(g)+'</div>'+
(act=='ik'?'<div class="ap"><button class="bt p" onclick="tmGelIk(\''+g.id+'\',1)"><i class="ti ti-check"></i> Onayla, Orin’e gönder</button><button class="bt" onclick="tmGelIk(\''+g.id+'\',0)">Reddet</button></div>':act=='ceo'?'<div class="ap"><button class="bt p" onclick="tmGelCeo(\''+g.id+'\',1)"><i class="ti ti-check"></i> Onayla ve uygula</button><button class="bt" onclick="tmGelCeo(\''+g.id+'\',0)">Reddet</button></div>':'')+'</div>'}
function tmApprovals(c){if(c.id!='nika'&&c.id!='orin')return '';var g=tmGelFor(c),ik=c.id=='nika';
return '<div class="sh"><h4>'+(ik?'Gelişim talepleri · İK incelemesi':'CEO onayı bekleyen gelişimler')+'</h4>'+(ik?'<button class="bt" onclick="tmGelDlg(null,\'beceri\',\'nika\')"><i class="ti ti-sparkles"></i> Çalışan geliştir</button>':'')+'</div>'+
'<div class="tl" style="margin-top:8px">'+(g.length?g.map(function(x){return tmGelRow(x,ik?'ik':'ceo')}).join(''):'<div class="hn">'+(ik?'İncelenecek talep yok. Bir çalışanın sayfasından ya da buradan gelişim önerebilirsin.':'Onay bekleyen gelişim yok.')+'</div>')+'</div>'+
'<div class="hn" style="margin-top:6px">'+(ik?'İK onayını Nika kendisi veriyor (gerekçeli); beğenmediğin reddi bozabilirsin.':'Orin her talebe öneri ve sonuçlarını yazıyor; CEO onayını sen veriyorsun.')+'</div>'}
function tmGelDlg(kim,tur,kimden){var A=tmAll(),c=kim?tm(kim):null;
var o=document.getElementById('ov');o.innerHTML='<div class="dl" style="max-width:460px;width:460px"><div style="color:#fff;font-size:16px;font-weight:600;margin-bottom:4px">'+(kimden=='nika'?'Nika olarak gelişim öner':'Gelişim iste')+'</div><div class="hn" style="margin-bottom:12px">'+(kimden=='nika'?'İK önerisi doğrudan CEO Orin’in onayına gider.':'Talep önce İK Müdürü Nika’ya, onaylanırsa CEO Orin’e gider.')+'</div>'+
'<div class="pf" style="display:block;margin:0">'+(c?'':'<label>Çalışan</label><select id="gk">'+A.map(function(x){return '<option value="'+esc(x.id)+'">'+esc(x.ad+' · '+x.gorev)+'</option>'}).join('')+'</select>')+
'<label>Tür</label><select id="gt" onchange="tmGelDlgTur()">'+Object.keys(GT).map(function(k){return '<option value="'+k+'"'+(k==tur?' selected':'')+'>'+GT[k]+'</option>'}).join('')+'</select>'+
'<div id="gad"></div><label>Açıklama</label><textarea id="gm" style="min-height:80px" placeholder="Ne öğrensin ya da neyi hatırlasın?"></textarea></div>'+
'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="bt" onclick="cfNo()">Vazgeç</button><button class="bt p" onclick="tmGelDlgOk(\''+jq(kim||'')+'\',\''+(kimden||'cagla')+'\')">Gönder</button></div></div>';o.style.display='flex';tmGelDlgTur()}
function tmGelDlgTur(){var t=document.getElementById('gt').value,kk=document.getElementById('gk'),kim=kk?kk.value:(pg=='calisan'?arg:''),b=tmSkills(kim),x=document.getElementById('gad');
if(kk)kk.onchange=tmGelDlgTur;x.innerHTML=t=='beceri'?'<label>Beceri adı</label><input type="text" id="ga" placeholder="ör. Haftalık PDF raporu">':t=='seviye'?'<label>Beceri</label><select id="ga">'+b.map(function(s){return '<option value="'+esc(s.ad)+'">'+esc(s.ad)+' · '+LVL[s.sv]+'</option>'}).join('')+'</select>':''}
function tmGelDlgOk(kim,kimden){var kk=document.getElementById('gk');kim=kim||(kk&&kk.value);var t=document.getElementById('gt').value,a=document.getElementById('ga'),ad=a?a.value.trim():'',m=document.getElementById('gm').value.trim();
if(t=='beceri'&&!ad){toast('Beceri adını yaz');return}if(t=='hafiza'&&!m){toast('Hafızaya eklenecek bilgiyi yaz');return}if(t=='seviye'&&!ad){toast('Önce beceri ekle');return}
tmGelNew(kim,t,ad,m,kimden);cfNo();toast(kimden=='nika'?'Orin’in onayına gönderildi':'Nika’nın incelemesine gönderildi');render()}

// ---------- Görevler ----------
function tmTaskNew(kim,metin,onc,son,bilgi,lim){lim=lim||{};var c=tm(kim),g={id:uid(),kim:kim,metin:metin,onc:onc||'normal',son:son||'',durum:'acik',bilgi:!!bilgi,yol:'dogrudan',ts:Date.now()};if(lim.sureDk){g.sureDk=+lim.sureDk;g.bitis=g.ts+g.sureDk*60000}if(lim.tokenLimit)g.tokenLimit=+lim.tokenLimit;TMS().gorev.push(g);
tmPush(kim,{r:'sys',t:'Çağlar doğrudan görev verdi'+(g.onc=='acil'?' (acil)':'')+': '+metin+(son?' · son tarih '+tmSon(son):'')});
if(bilgi&&kim!='orin')tmPush('orin',{r:'sys',t:bilgiNotu(c.ad)});save();if(typeof zekaGorev=='function')zekaGorev(g);return g}
// Süre ve token sınırı gösterimi
function tmLimit(g){var a=[];if(g.sureDk){var k=g.bitis-Date.now(),dol=g.durum!='bitti'&&k<=0;a.push('<span class="bdg'+(dol?' red':'')+'"><i class="ti ti-clock"></i> '+tmSureAd(g.sureDk)+(g.durum=='bitti'?'':dol?' · süre doldu':' · kalan '+tmSureAd(Math.ceil(k/60000)))+'</span>')}
if(g.tokenLimit||g.token)a.push('<span class="bdg'+(g.token&&g.tokenLimit&&g.token>=g.tokenLimit?' ik':'')+'"><i class="ti ti-coins"></i> '+(g.token?fmtTk(g.token)+(g.tokenLimit?' / ':''):'')+(g.tokenLimit?fmtTk(g.tokenLimit)+' token':' token')+(g.usd?' · $'+g.usd.toFixed(4).replace('.',','):'')+'</span>');
if(g.durum=='calisiyor')a.push('<span class="bdg ceo">çalışıyor…</span>');if(g.hata)a.push('<span class="bdg red">'+esc(g.hata)+'</span>');return a.length?'<div class="flw">'+a.join('')+'</div>':''}
function tmSureAd(dk){return dk>=1440?Math.round(dk/1440)+' gün':dk>=60?Math.round(dk/60*10)/10+' sa':dk+' dk'}
function fmtTk(n){return n>=1000?(Math.round(n/100)/10+'K').replace('.',','):String(n)}
function tmSon(s){if(!s)return '';var d=new Date(s);if(isNaN(d))return s;var k=key(d),t=d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});return (k==TODAY?'Bugün':short(k))+' '+t}
function tmTaskTog(id){var g=TMS().gorev.filter(function(x){return x.id==id})[0];if(!g)return;g.durum=g.durum=='bitti'?'acik':'bitti';g.bts=g.durum=='bitti'?Date.now():null;save();render()}
function tmTaskDel(id){confirmBox('Bu görev silinsin mi?',function(){S.team.gorev=TMS().gorev.filter(function(x){return x.id!=id});save();render()},'Sil')}
function tmTasks(c){var co=c.id=='orin',a=TMS().gorev.filter(function(g){return co||g.kim==c.id}).sort(function(x,y){return (x.durum=='bitti')-(y.durum=='bitti')||y.ts-x.ts});
return '<div class="sh"><h4>'+(co?'Şirketteki görevler':'Görevler')+'</h4><button class="bt p" onclick="tmTaskDlg(\''+jq(c.id)+'\')"><i class="ti ti-bolt"></i> Doğrudan görev ver</button></div><div class="tl">'+(a.length?a.map(function(g){var k=tm(g.kim)||{ad:g.kim};
return '<div class="ti3'+(g.durum=='bitti'?' dn2':'')+'"><span class="cb'+(g.durum=='bitti'?' on':'')+'" title="'+(g.durum=='bitti'?'Geri aç':'Bitti')+'" onclick="tmTaskTog(\''+g.id+'\')">'+(g.durum=='bitti'?'<i class="ti ti-check"></i>':'')+'</span><div class="tx">'+esc(g.metin)+'<small>'+(co?esc(k.ad)+' · ':'')+'Doğrudan görev · '+tmTime(g.ts)+(g.son?' · son tarih '+tmSon(g.son):'')+(g.bilgi?' · Orin’e bilgi verildi':'')+(g.bts?' · bitti '+tmTime(g.bts):'')+'</small>'+tmLimit(g)+(g.sonuc?'<details style="margin-top:8px"><summary style="cursor:pointer;color:#a9c8ff;font-size:13px">Sonuç</summary><div class="bo" style="margin-top:6px;font-size:13.5px">'+tmFmt(g.sonuc)+'</div></details>':'')+tmZincir(['Çağlar',k.ad])+'</div>'+(g.onc=='acil'?'<span class="bdg ac">Acil</span>':'')+'<span class="ib" title="Sil" onclick="tmTaskDel(\''+g.id+'\')"><i class="ti ti-trash"></i></span></div>'}).join(''):'<div class="hn">Henüz görev yok. Görevler yapay zekâ bağlanınca Orin › Orla zinciriyle de gelecek; şimdilik doğrudan görev verebilirsin.</div>')+'</div>'}
function tmTaskDlg(kim){var c=tm(kim),o=document.getElementById('ov');o.innerHTML='<div class="dl" style="max-width:420px;width:420px">'+tmTaskForm(c)+'<div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="bt" onclick="cfNo()">Vazgeç</button></div></div>';o.style.display='flex'}
var TF={onc:'normal',bilgi:true,sure:0,token:0};
var SURE_SEC=[[0,'Yok'],[15,'15 dk'],[30,'30 dk'],[60,'1 sa'],[240,'4 sa'],[1440,'1 gün']],TOKEN_SEC=[[0,'Yok'],[2000,'2K'],[5000,'5K'],[10000,'10K'],[25000,'25K'],[50000,'50K']];
function tfSec(e,k,v){TF[k]=v;e.parentNode.querySelectorAll('span').forEach(function(s){s.classList.toggle('on',s==e)})}
function tfSecim(k,l){return '<span class="pri">'+l.map(function(x){return '<span class="'+(TF[k]==x[0]?'on':'')+'" onclick="tfSec(this,\''+k+'\','+x[0]+')">'+x[1]+'</span>'}).join('')+'</span>'}
function tmTaskForm(c){return '<div class="dm"><div class="dmt"><i class="ti ti-bolt" style="color:#ffb35b"></i>'+esc(c.ad)+'’ya doğrudan görev'+(c.grup!='yonetim'?'<span class="wb">Orin ve Orla atlanır</span>':'')+'</div><textarea class="dmi" id="tfm" placeholder="Görevi yaz…"></textarea>'+
'<div class="dmr">Öncelik<span class="pri"><span class="'+(TF.onc=='normal'?'on':'')+'" onclick="tfOnc(this,\'normal\')">Normal</span><span class="ac '+(TF.onc=='acil'?'on':'')+'" onclick="tfOnc(this,\'acil\')">Acil</span></span></div>'+
(c.id!='orin'?'<div class="dmr"><span class="tg2'+(TF.bilgi?' on':'')+'" onclick="this.classList.toggle(\'on\');TF.bilgi=this.classList.contains(\'on\')"></span>Orin’e bilgi notu düş <span class="hn">(karışmaz, sadece haberi olur)</span></div>':'')+
'<div class="dmr"><i class="ti ti-clock"></i> Süre sınırı'+tfSecim('sure',SURE_SEC)+'</div><div class="dmr"><i class="ti ti-coins"></i> Token sınırı'+tfSecim('token',TOKEN_SEC)+'</div>'+
'<div class="dmr"><i class="ti ti-calendar"></i> Son tarih <input type="datetime-local" id="tfs"></div><button class="bt p" style="width:100%" onclick="tfSend(\''+jq(c.id)+'\')"><i class="ti ti-send"></i> Görevi '+esc(c.ad)+'’ya gönder</button></div>'}
function tfOnc(e,v){TF.onc=v;e.parentNode.querySelectorAll('span').forEach(function(s){s.classList.toggle('on',s==e)})}
function tfSend(kim){var m=document.getElementById('tfm').value.trim();if(!m){toast('Görevi yaz');return}var s=document.getElementById('tfs').value;tmTaskNew(kim,m,TF.onc,s,kim!='orin'&&TF.bilgi,{sureDk:TF.sure,tokenLimit:TF.token});TF.onc='normal';TF.sure=0;TF.token=0;cfNo();if(typeof hrClose=='function')hrClose(true);toast('Görev '+(tm(kim)||{}).ad+'’ya gönderildi');render()}

// ---------- Beceriler, hafıza, profil ----------
function tmSkillsTab(c){var b=tmSkills(c.id),p=TMS().gel.filter(function(g){return g.kim==c.id&&g.tur!='hafiza'}).slice(-8).reverse();
return '<div class="sh"><h4>Beceriler</h4><button class="bt p" onclick="tmGelDlg(\''+jq(c.id)+'\',\'beceri\')"><i class="ti ti-sparkles"></i> Geliştirme iste</button></div><div class="hn" style="margin-top:4px">Beceriler önce İK Müdürü Nika’nın, sonra CEO Orin’in onayıyla gelişir.</div>'+
'<div class="skl">'+(b.length?b.map(function(s){var l='';for(var i=1;i<=5;i++)l+='<i class="'+(i<=s.sv?'on':'')+'"></i>';return '<div class="sk" style="--c:'+c.renk+'"><b>'+esc(s.ad)+'<span>'+LVL[s.sv]+'</span></b>'+(s.not?'<p>'+esc(s.not)+'</p>':'')+'<div class="lv">'+l+'</div></div>'}).join(''):'<div class="hn">Henüz beceri yok.</div>')+'</div>'+
(p.length?'<div class="sh"><h4>Gelişim talepleri</h4></div><div class="tl" style="margin-top:8px">'+p.map(function(g){return tmGelRow(g)}).join('')+'</div>':'')}
function tmFacts(c){if(c.id!='echo')return [];return ['Mesai: Pazartesi–Perşembe '+S.w1+' dk, Cuma '+S.w2+' dk','Ücretli izin ve rapor günü tam gün sayılır, ücretsiz izin 0 dk','Günü doldur: günün hedefinden o gün girilmiş süre çıkarılır, kalan eklenir','Kayıtlar Google Sheets “İş Günü Raporu” ile eşitlenir'+(CONNECTED?' (bağlı)':' (şu an bağlı değil)')]}
function tmMemTab(c){var h=tmMem(c.id),f=tmFacts(c),p=TMS().gel.filter(function(g){return g.kim==c.id&&g.tur=='hafiza'&&(g.asama=='ik'||g.asama=='ceo')});
return '<div class="sh"><h4>Hafıza</h4><button class="bt p" onclick="tmGelDlg(\''+jq(c.id)+'\',\'hafiza\')"><i class="ti ti-brain"></i> Hafızaya ekle</button></div><div class="hn" style="margin-top:4px">'+esc(c.ad)+'’nın kalıcı olarak hatırladıkları. Yeni bilgi Nika ve Orin’in onayıyla eklenir.</div>'+
(f.length?'<div class="card" style="margin-top:14px"><div class="ch"><i class="ti ti-settings-automation"></i>Programdan gelen bilgiler <span class="hn">(otomatik, ayarlar değişince güncellenir)</span></div>'+f.map(function(x){return '<div class="kr"><span>'+esc(x)+'</span></div>'}).join('')+'</div>':'')+
(p.length?'<div class="tl">'+p.map(function(g){return tmGelRow(g)}).join('')+'</div>':'')+
'<div class="tl">'+(h.length?h.slice().reverse().map(function(m){return '<div class="ti3"><i class="ti ti-bookmark" style="color:'+c.renk+';font-size:18px;margin-top:1px"></i><div class="tx">'+esc(m.metin)+'<small>'+esc(m.kaynak||'')+' · '+tmTime(m.ts)+'</small></div><span class="ib" title="Unut" onclick="tmForget(\''+jq(c.id)+'\',\''+m.id+'\')"><i class="ti ti-trash"></i></span></div>'}).join(''):'<div class="hn">Hafıza henüz boş.</div>')+'</div>'}
function tmForget(kim,id){confirmBox('Bu bilgi '+esc((tm(kim)||{}).ad)+'’nın hafızasından silinsin mi?',function(){tmSet(kim,{haf:tmMem(kim).filter(function(m){return m.id!=id})});render()},'Unut')}
function tmProfile(c){return '<div class="pf"><div class="card"><div class="ch"><i class="ti ti-id"></i>Profil</div>'+
'<label>Ad</label><input type="text" id="pfa" value="'+esc(c.ad)+'"'+(c.yeni?'':' disabled title="Kayıtlı çalışanların adı değişmez"')+'>'+
'<label>Görev</label><input type="text" id="pfg" value="'+esc(c.gorev)+'">'+
'<label>Kısa açıklama</label><input type="text" id="pfd" value="'+esc(tmDesc(c))+'">'+
'<label>Renk</label><input type="color" id="pfr" value="'+esc(c.renk)+'">'+
'<label>Bağlı olduğu</label><div class="chn" style="font-size:13.5px">'+tmChain(c).map(function(n,i){var x=tmByName(n);return (i?'<i class="ti ti-chevron-right"></i>':'')+(x?av(x,20,false)+' ':'')+esc(n)}).join(' ')+'</div>'+
'<label>Hayat hikâyesi</label><textarea id="pfh" placeholder="Birinci ağızdan kısa bir otobiyografi…">'+esc(c.hikaye||'')+'</textarea>'+
'<div style="display:flex;gap:8px;margin-top:12px"><button class="bt p" onclick="tmProfSave(\''+jq(c.id)+'\')"><i class="ti ti-device-floppy"></i> Kaydet</button>'+(c.yeni?'<button class="bt d" onclick="tmDelMember(\''+jq(c.id)+'\')">Çalışanı sil</button>':'')+'</div></div>'+
'<div>'+(c.kart?'<img class="kart" src="../'+esc(c.kart)+'" alt="">':'<div class="kn" style="cursor:default"><i class="ti ti-id-badge-2"></i>Kart yok</div>')+'<div class="hn" style="margin-top:8px">Kartı programın kendisinin çizmesi sonraki sürümde. Şimdilik hazır kart görseli gösteriliyor.</div></div></div>'}
function tmProfSave(id){var c=tm(id),o={gorev:document.getElementById('pfg').value.trim()||c.gorev,aciklama:document.getElementById('pfd').value.trim(),renk:document.getElementById('pfr').value,hikaye:document.getElementById('pfh').value.trim()};if(c.yeni)o.ad=document.getElementById('pfa').value.trim()||c.ad;tmSet(id,o);toast('Profil kaydedildi');render()}
function tmDelMember(id){confirmBox(esc((tm(id)||{}).ad)+' silinsin mi? Sohbet ve görevleri de kaldırılır.',function(){var T=TMS();T.m[id]={sil:1,yeni:1};delete T.sohbet[id];T.gorev=T.gorev.filter(function(g){return g.kim!=id});save();nav('team','ik','')},'Sil')}

// ---------- Sayfa ----------
function teamPage(){if(pg=='ik')return typeof hrPage=='function'?hrPage():'';var c=tm(arg);if(!c)return '<p class="h">Çalışan bulunamadı</p>';S.teamSel=c.id;var on=tmOnline(),T=[['genel','Genel'],['gorev','Görevler'],['bec','Beceriler'],['haf','Hafıza'],['prof','Profil']];
var h='<div class="eh">'+av(c,52)+'<div style="flex:1;min-width:0"><div class="en">'+esc(c.ad)+' <span class="pill" style="background:'+c.renk+'2e;color:'+c.renk+'">'+esc(c.gorev)+'</span></div><div class="es"><span class="dt '+(on?tmStat(c):'id')+'"></span> '+(on?'Çevrimiçi':'Çevrimdışı')+' · '+esc(tmDesc(c))+'</div></div><div class="seg">'+T.map(function(t){return '<span class="'+(TMTAB==t[0]?'on':'')+'" onclick="TMTAB=\''+t[0]+'\';render()">'+t[1]+'</span>'}).join('')+'</div></div>';
if(TMTAB=='gorev')return h+tmTasks(c);if(TMTAB=='bec')return h+tmSkillsTab(c);if(TMTAB=='haf')return h+tmMemTab(c);if(TMTAB=='prof')return h+tmProfile(c);
return h+tmCharts(c)+tmKpi(c)+tmApprovals(c)+tmMsgs(c)+tmComposer(c)}
function teamAfter(){var e=document.getElementById('tmi');if(e){e.value=TMD[arg]||'';if(e.value)tmGrow(e)}var ct=document.getElementById('ct');if(TMSCR&&e){ct.scrollTop=ct.scrollHeight;TMSCR=false}if(TMQ)tmFilter(TMQ)}
var _tmNav=nav;nav=function(a,p,g,noh){if(a=='team'&&p=='calisan'&&g!==arg)TMTAB='genel',TMSCR=true;_tmNav(a,p,g,noh)};

// ---------- Çevrimiçi / çevrimdışı ----------
var _tmSL=syncLabel;syncLabel=function(){_tmSL();if(area!='team')return;var y=document.getElementById('sy');if(!y)return;var on=tmOnline(),n=tmPending().length;
y.innerHTML='<span class="dt '+(on?'ok':'wo')+'"></span> '+(on?'Çevrimiçi':'Çevrimdışı'+(n?' · '+n+' not bekliyor':''));y.style.color=on?'#c9c9ce':'#f1c88a'};
function tmAskSend(){var p=tmPending();if(!p.length||!tmOnline())return;var o=document.getElementById('ov');o.innerHTML='<div class="dl"><div style="color:#fff;margin-bottom:12px;line-height:1.45">Bağlantı geldi. Çevrimdışıyken bıraktığın '+p.length+' not gönderilsin mi?</div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="bt" onclick="cfNo()">Sonra</button><button class="bt p" onclick="tmSendPending()">Gönder</button></div></div>';o.style.display='flex'}
function tmSendPending(){cfNo();var p=tmPending();p.forEach(function(n){n.durum='iletildi';tmPush(n.kim,{r:'ben',t:n.metin,tur:'not',ilt:1,ts:n.ts})});TMS().not=TMS().not.filter(function(n){return n.durum=='bekliyor'});save();toast(p.length+' not iletildi');render()}
window.addEventListener('online',function(){if(area=='team')render();setTimeout(tmAskSend,400)});window.addEventListener('offline',function(){if(area=='team')render()});
setTimeout(function(){if(tmOnline()&&tmPending().length&&!INFO.smoke)tmAskSend()},3000);
// 0.5.0 öneri listesine yeni fikirler (her sürümde eklenir)
if(typeof SUG!='undefined')SUG.push({id:'telefon',t:'Telefonla eşitleme: kayıtlar ve çalışan sohbetleri telefondan da görülsün, yazılsın',k:'Yapısal',v:'0.5.0'},
{id:'kartciz',t:'Çalışan kimlik kartlarını program kendisi çizsin (ORVANE şeridiyle, düzenlenebilir)',k:'Görsel',v:'0.5.0'},
{id:'profsheets',t:'Çalışan profilleri, beceri ve hafızaları Google Sheets’e yedeklensin',k:'Yapısal',v:'0.5.0'},
{id:'gorevzincir',t:'Görevler Orin › Orla zinciriyle dağıtılsın, her adım sohbet çipinde görünsün',k:'Yapısal',v:'0.5.0'});

// Bilgi notu: yalnız kimin ne yaptığı (görev metni çalışanın kendi sohbetinde durur)
function yonelme(ad){ad=String(ad||'');var s=ad.toLocaleLowerCase('tr').replace(/y$/,'i'),v=(s.match(/[aıoueiöü]/g)||['a']).pop(),k=/[aıou]/.test(v),son=/[aıoueiöü]$/.test(s);return ad+'’'+(son?'y':'')+(k?'a':'e')}
function bilgiNotu(ad){return 'Bilgi notu: Çağlar, '+yonelme(ad)+' doğrudan görev verdi.'}
// Eski uzun bilgi notlarını kısalt (bir kez)
try{var _bt=TMS();Object.keys(_bt.sohbet).forEach(function(id){_bt.sohbet[id].forEach(function(m){var x=m.r=='sys'&&/^Bilgi notu: Çağlar, (.+?)’ya doğrudan görev verdi \(Orin ve Orla atlandı\):/.exec(m.t);if(x)m.t=bilgiNotu(x[1])})})}catch(e){}
