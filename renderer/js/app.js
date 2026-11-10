// Orin · durum, hesaplar, gezinme, menüler
var API=window.api||null,INFO=API?API.info():{version:'dev',smoke:false},APPNAME='Orin';
var CONNECTED=false; // Aşama 2'de Google Sheets bağlanınca true
function mk(y,m,d){return y+'-'+m+'-'+d}
function pk(s){var a=s.split('-');return new Date(+a[0],+a[1]-1,+a[2])}
function key(d){return mk(d.getFullYear(),d.getMonth()+1,d.getDate())}
var TODAY=key(new Date());
var S,E,D,OT,PR,UP,UM,PS,PT,PL,PA,CL,V,WS,RG,res,selP='A';
var N=[],nid=1,IM=[],UN=[],RE=[],EDIT=null,PRE='',EP=null,CFN=null,CXI=[],TB=[];
var area='home',pg='gun',arg='',hist=[],hp=-1,zoom=1,sbOn=true,railOn=true,dirty=false,mo='',sel=TODAY,calY,calM;

// ---------- Kalıcı durum ----------
function loadState(){var st=null;try{st=API?API.load():JSON.parse(localStorage.getItem('orin')||'null')}catch(e){}
st=st||{};S=Object.assign({},S0,st.S||{});E=st.E||{};D=st.D||{};OT=st.OT||{};PR=st.PR||JSON.parse(JSON.stringify(PR0));UP=st.UP||{};UM=st.UM||{};PS=st.PS||{};PT=st.PT||[];PL=st.PL||{};PA=st.PA||'';CL=st.CL||{};V=st.V||{};WS=st.WS&&st.WS.length?st.WS:WS0.map(function(x){return x.slice()});RG=st.RG||[];res=st.res||2;
sbOn=st.sbOn!==false;railOn=st.railOn!==false;zoom=st.zoom||1;
if(!st.gecmis)importGecmis();
Q=st.Q||[];DR=st.DR||{};
Object.keys(PS).forEach(function(c){if(PS[c]=='Tamamlandı')PS[c]='Bitti'}); // eski adlandırma
var t=pk(TODAY);calY=t.getFullYear();calM=t.getMonth()}
var _sv=null;
function save(){clearTimeout(_sv);_sv=setTimeout(saveNow,250)}
function saveNow(){var st={v:1,gecmis:1,Q:Q,DR:DR,S:S,E:E,D:D,OT:OT,PR:PR,UP:UP,UM:UM,PS:PS,PT:PT,PL:PL,PA:PA,CL:CL,V:V,WS:WS,RG:RG,res:res,sbOn:sbOn,railOn:railOn,zoom:zoom};
try{if(API)API.save(st);else localStorage.setItem('orin',JSON.stringify(st))}catch(e){toast('Kaydedilemedi: '+e.message)}}
// Geçmiş raporları (Mayıs–Ağustos 2026) bir kez içe aktarır; mevcut kayıtların üzerine yazmaz
function importGecmis(){WS=WS0.map(function(x){return x.slice()});if(!window.GECMIS)return;var G=GECMIS;RG=G.ranges.map(function(x){return x.slice()});
G.projeler.forEach(function(p){if(!pexists(p[0])){var m=pmodel(p[0]);if(!PR[m]){PR[m]=[];UM[m]=true}PR[m].push([p[0],p[1]]);UP[p[0]]=true}PS[p[0]]=p[2]});
PT=G.pt.map(function(x){return x.slice()});
G.gunler.forEach(function(g){var k=g[0];if(E[k]&&E[k].length)return;if(g[1].length)E[k]=g[1].map(function(r){return{k:r[0],i:r[1],d:r[2],st:1,src:'rapor'}});if(g[2])OT[k]=g[2];if(g[3])D[k]=g[3]})}

// ---------- Yardımcılar ----------
function f(x){return String(x).replace('.',',')}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function jq(s){return esc(String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"))}
function lab(k){var d=pk(k);return d.getDate()+' '+AY[d.getMonth()]+' '+d.getFullYear()+' '+GN[d.getDay()]}
function short(k){var d=pk(k);return d.getDate()+' '+AY[d.getMonth()].slice(0,3)+' '+GK[d.getDay()]}
function sa(m){m=Math.round(m);var h=Math.floor(m/60),r=m%60;return h?h+' sa '+r+' dk':r+' dk'}
function dk(m){return (Math.round(m*10)/10).toLocaleString('tr-TR')}
function wsFor(k){var d=pk(k),r=null,last=WS.length-1;WS.forEach(function(w,i){if(pk(w[0])<=d)r=i});if(r===null||r==last)return[S.w1,S.w2];return[WS[r][1],WS[r][2]]}
function lim(k){var d=pk(k),w=d.getDay();if(HO[k]||w==0||w==6)return null;var p=wsFor(k);return w==5?p[1]:p[0]}
function tot(k,skip){var s=0;(E[k]||[]).forEach(function(e,i){if(i!==skip)s+=e.d});return s}
function inRange(k){var d=pk(k);return RG.some(function(r){return d>=pk(r[0])&&d<=pk(r[1])})}
function hireD(){var a=S.hire.split('.');return new Date(+a[2],+a[1]-1,+a[0])}
function hireOk(v){return /^\d{2}\.\d{2}\.\d{4}$/.test(v)}
function typ(k){if(D[k])return D[k];if(PL[k])return PL[k].s==2?'yillik':'plan';
var d=pk(k),w=d.getDay(),h=HO[k],t=tot(k),L=lim(k),o=OT[k]||0;
if(h)return t>0?'mesai':(h[1]==1?'tatil':'tatily');
if(w==0||w==6)return t>0?'mesai':'hafta';
if(t>0)return t==L+o?(o?'mesai':'tam'):'hata';
if(d>pk(TODAY))return 'gel';if(k==TODAY)return 'bugun';if(d<hireD())return 'hafta';
return ((CONNECTED&&S.sheetStart&&d>=pk(S.sheetStart))||inRange(k))?'girdi':'bos'}
function cs(t){var m={tam:BLU,hata:RED,girdi:RED,yillik:GRN,refakat:GRN,mazeret:ORG,sevk:ORG,rapor13:ORG,rapor4:GRN,ucretsiz:RED,tatil:HOL,hafta:'#2b2b30',gel:'#242428',bugun:'#242428'};
if(t=='tatily')return 'background:linear-gradient(90deg,'+HOL+' 50%,#3a3a3f 50%);color:#fff';
if(t=='mesai')return 'background:repeating-linear-gradient(135deg,'+BLU+' 0 5px,#2f4aa8 5px 10px);color:#fff';
if(t=='plan')return 'background:transparent;border:1.5px dashed '+GRN+';color:#8fe0b3';
if(t=='bos')return 'background:transparent;border:1px dashed #4a4a50;color:#9a9aa0';
var gr=(t=='hafta'||t=='gel'||t=='bugun');return 'background:'+m[t]+';color:'+(gr?'#9a9aa0':'#fff')}
function dot(t){var c={tam:BLU,hata:RED,girdi:RED,yillik:GRN,refakat:GRN,rapor4:GRN,mazeret:ORG,sevk:ORG,rapor13:ORG,ucretsiz:RED,tatil:HOL,tatily:HOL,mesai:BLU,plan:GRN}[t]||'#4a4a50';return '<span class="sq" style="width:8px;height:8px;border-radius:50%;background:'+c+'"></span>'}
function kidem(){var h=hireD(),t=pk(TODAY),m=(t.getFullYear()-h.getFullYear())*12+t.getMonth()-h.getMonth()-(t.getDate()<h.getDate()?1:0);return{m:m,t:Math.floor(m/12)+' yıl '+(m%12)+' ay',ok:m>=12}}
function anniv(){var h=hireD();return (h.getDate()<10?'0':'')+h.getDate()+'.'+(h.getMonth()+1<10?'0':'')+(h.getMonth()+1)+'.'+(h.getFullYear()+1)}
function izy(){var h=hireD();return h.getDate()+' '+AY[h.getMonth()]}
function kal(){return S.hak+S.dev-S.kul}
function best(b){var bm=0,bo=-1,n=IT.length;for(var m=0;m<(1<<n);m++){var c=0,o=0;for(var i=0;i<n;i++)if(m>>i&1){c+=IT[i].c;o+=IT[i].o}if(c<=b+1e-9&&(o>bo||(o==bo&&c<ptot(bm).c))){bo=o;bm=m}}return bm}
function ptot(m){var c=0,o=0;IT.forEach(function(x,i){if(m>>i&1){c+=x.c;o+=x.o}});return{c:c,o:o}}
function pick(m){return IT.filter(function(x,i){return m>>i&1}).sort(function(a,b){return a.t-b.t})}
function strip(s){var C={W:'#3a3a3f',H:HOL,L:GRN};return s.split('').map(function(c){var bg=c=='S'?'linear-gradient(90deg,#3a3a3f 50%,'+HOL+' 50%)':C[c];return '<span class="sq" style="background:'+bg+'"></span>'}).join('')}
function row(a,c,w,t){return '<div class="sr"><span>'+a+'</span><div class="bar"><i style="width:'+w+'%;background:'+c+'"></i></div><span style="color:#8a8a90">'+t+'</span></div>'}
function nn(a){return a.map(function(x,k){return '<div class="n'+(k==0?' f':'')+'"><b>'+(k+1)+'</b><span>'+x+'</span></div>'}).join('')}
function allP(){var r=[];Object.keys(PR).forEach(function(m){PR[m].forEach(function(p){r.push(p)})});return r}
function pexists(c){return allP().some(function(p){return p[0]==c})}
function pname(c){if(c=='?')return 'Proje belirtilmemiş';if(c=='Standart dışı')return 'Revir, toplantı gibi standart dışı süreler';var p=allP().filter(function(p){return p[0]==c})[0];return p?p[1]:''}
function pmodel(c){var s=String(c).split('.')[0];return /^\d+$/.test(s)?'SY'+s:'Diğer işler'}
function models(){return Object.keys(PR).sort(function(a,b){return +b.slice(2)-+a.slice(2)})}
function kname(c){return c=='?'?'<span style="color:#f6d28a">Proje belirtilmemiş</span>':esc(c)}
// Yıl içindeki refakat günleri
function refUsed(y){return Object.keys(D).filter(function(k){return D[k]=='refakat'&&pk(k).getFullYear()==y}).length}
// Hukuki risk: Günlük kayıttan mazeretsiz devamsızlık (Girdi hatası günleri) bu ay
function absences(){var t=pk(TODAY),y=t.getFullYear(),m=t.getMonth(),a=[];for(var d=1;d<t.getDate();d++){var k=mk(y,m+1,d);if(typ(k)=='girdi')a.push(k)}return a}
function afterHoliday(k){var d=pk(k);d.setDate(d.getDate()-1);var p=key(d);return !lim(p)&&!(E[p]&&E[p].length)}
function unap(){var b=null;Object.keys(PL).forEach(function(k){if(PL[k].s<2){var d=Math.round((pk(k)-pk(TODAY))/864e5);if(d<=14&&(!b||d<b.d))b={k:k,d:d}}});return b}
function rk(){var a=absences(),g=a.length,t=a.filter(afterHoliday).length,cons=false;
for(var i=1;i<a.length;i++){var p=pk(a[i]),q=pk(a[i-1]),gap=0,x=new Date(q);x.setDate(x.getDate()+1);while(x<p){if(lim(key(x)))gap++;x.setDate(x.getDate()+1)}if(!gap)cons=true}
if(g>=3)return{l:2,m:'Bu ay 3 iş günü kaydın yok: tazminatsız fesih eşiği aşıldı. Kayıt eksikse hemen düzelt.'};
if(cons)return{l:2,m:'Üst üste 2 iş günü kaydın yok: tazminatsız fesih eşiği aşıldı. Kayıt eksikse hemen düzelt.'};
if(t>=2)return{l:2,m:'Ayda 2 kez tatil sonrası iş günü kaydın yok: tazminatsız fesih eşiği aşıldı.'};
if(g==2)return{l:1,m:'Bu ay 2 iş günü kaydın yok: bir gün daha olursa eşik aşılır.'};
if(t==1)return{l:1,m:'Tatil sonrası iş gününe 1 kez kayıt yok: ikincisi eşiği aşar.'};
if(g==1)return{l:1,m:lab(a[0])+' için kayıt yok. Mazeretsiz gitmediysen: yarın da gitmezsen üst üste 2 gün olur ve tazminatsız fesih sebebi doğar.'};
var u=unap();if(u)return u.d<=0?{l:2,m:'Onaysız izin günü: '+lab(u.k)+'. Onay gelmeden işe gitmezsen devamsızlık sayılır.'}:{l:1,m:lab(u.k)+' tarihli izin henüz onaylanmadı ('+u.d+' gün kaldı).'};
return{l:0,m:'Risk yok: mazeretsiz devamsızlık görünmüyor.'}}
function banner(){var r=rk(),b=document.getElementById('bn');if(r.l==0){b.innerHTML='';return}
var c=r.l==2?['#4a1f1f','#f4a3a3','#d23b3b']:['#4a3a14','#f6d28a','#f0a030'];
b.innerHTML='<div class="bn" onclick="nav(\'set\',\'huk\')" style="background:'+c[0]+';color:'+c[1]+';border:0.5px solid '+c[2]+'"><i class="ti ti-alert-triangle" style="font-size:20px"></i><span><b style="font-weight:500">Hukuki uyarı · </b>'+r.m+'</span></div>'}
function toast(m){var t=document.getElementById('ts');t.textContent=m;t.style.opacity=1;clearTimeout(window._tt);window._tt=setTimeout(function(){t.style.opacity=0},2600)}
function syncLabel(){var y=document.getElementById('sy');if(!y)return;var nq=(typeof Q!='undefined')?Q.length:0,cf=nq?Q.filter(function(o){return o.conflict}).length:0,t,c;
if(!CONNECTED){t='Sheets bağlı değil · yerel kayıt';c='#8a8a90'}else if(cf){t='Çakışma · '+cf;c=ORG}else if(!navigator.onLine){t='Çevrimdışı'+(nq?' · '+nq+' bekliyor':'');c=ORG}else if(SYN.busy){t='Eşitleniyor…';c='#8a8a90'}else if(nq){t=nq+' kayıt gönderilecek';c=ORG}else{t='Senkron açık'+(SYN.last?' · '+SYN.last.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}):'');c=GRN}
y.textContent=t;y.style.color=c;y.title='Ayarlar › Google Sheets';y.onclick=function(){nav('set','baglanti')}}

// ---------- Gezinme ----------
function nav(a,p,g,noh){EDIT=null;closeCx();if(!noh){hist=hist.slice(0,hp+1);hist.push([a,p,g]);hp=hist.length-1;V[a+':'+p]=(V[a+':'+p]||0)+1}area=a;pg=p;arg=g||'';if(a=='home'&&p=='gun'){if(g)sel=g;else arg=sel}
if(a=='plan')loadNotes();if(a=='img'||(a=='home'&&p=='proje'))loadImages();render();save()}
function back(){if(hp>0){hp--;var h=hist[hp];nav(h[0],h[1],h[2],true)}}
function fwd(){if(hp<hist.length-1){hp++;var h=hist[hp];nav(h[0],h[1],h[2],true)}}
function openArea(a){if(a=='home')nav('home','gun',sel);else if(a=='msg')nav('msg','haber','gel');else if(a=='cal')nav('cal','takvim');else if(a=='img')nav('img','gorsel','');else if(a=='plan')nav('plan','notlar','');else nav('set','huk')}
function stepTab(d){openArea(AREAS[(AREAS.indexOf(area)+d+AREAS.length)%AREAS.length])}
function stepSb(d){var a=[].slice.call(document.querySelectorAll('#sb .si[data-nav]')),i=a.findIndex(function(x){return x.classList.contains('on')});if(!a.length)return;a[(i+d+a.length)%a.length].click()}
function togSb(){sbOn=!sbOn;render();save()}
function togRail(){railOn=!railOn;render();save()}
function zoomSet(z){zoom=Math.min(1.5,Math.max(.7,Math.round(z*10)/10));if(API)API.win('zoom',zoom);else document.getElementById('app').style.zoom=zoom;save()}
function openFind(){var b=document.getElementById('fb');b.style.display='flex';document.getElementById('fi').focus()}
function closeFind(){document.getElementById('fb').style.display='none'}
function doFind(){var v=document.getElementById('fi').value;if(v&&!window.find(v,false,false,true))toast('Bulunamadı')}
function ex(c){var ok=false;try{ok=document.execCommand(c)}catch(e){}if(!ok)toast('Bu komut için klavye kısayolunu kullan')}

// ---------- Kenar çubuğu ----------
function si(a,p,g,t,lv,ic,pre){var on=area==a&&pg==p&&(g===undefined||g===''||arg==g);return '<div class="si '+lv+(on?' on':'')+'" data-nav="1" onclick="nav(\''+a+'\',\''+p+'\',\''+jq(g||'')+'\')">'+(ic?'<i class="ti '+ic+'"></i>':'')+(pre||'')+'<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(t)+'</span></div>'}
function siX(a,p,g,t,lv,ic,ty,id){var on=area==a&&pg==p&&arg==g;return '<div class="si '+lv+(on?' on':'')+'" data-nav="1" onclick="nav(\''+a+'\',\''+p+'\',\''+jq(g)+'\')" oncontextmenu="ctx(event,\''+ty+'\',\''+jq(id)+'\')">'+(ic?'<i class="ti '+ic+'"></i>':'')+'<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(t)+'</span><span class="mo" title="Seçenekler" onclick="ctx(event,\''+ty+'\',\''+jq(id)+'\')">⋯</span></div>'}
function op(k){return !CL[k]}
function tgl(k){CL[k]=!CL[k];document.getElementById('sb').innerHTML=sbH();save()}
function gh(k,t,sub,mt){var c='<i class="ti ti-chevron-'+(op(k)?'down':'right')+'" style="font-size:12px"></i>',m=mt?'<span class="mo" title="Seçenekler" onclick="ctx(event,\'g\',\''+mt+'\')">⋯</span>':'',oc=mt?' oncontextmenu="ctx(event,\'g\',\''+mt+'\')"':'';
if(sub)return '<div class="si '+(sub==2?'l3':'l2')+' gh" style="color:#8a8a90" onclick="tgl(\''+jq(k)+'\')"'+oc+'>'+c+esc(t)+m+'</div>';
return '<div class="g gh" onclick="tgl(\''+jq(k)+'\')">'+c+esc(t)+'</div>'}
// İş günleri: bugünden geçmişe, aylara göre gruplu
function dayMonths(){var r=[],t=pk(TODAY),h=hireD(),y=t.getFullYear(),m=t.getMonth();while(y>h.getFullYear()||(y==h.getFullYear()&&m>=h.getMonth())){r.push([y,m]);m--;if(m<0){m=11;y--}}return r}
function monthDays(y,m){var t=pk(TODAY),last=(y==t.getFullYear()&&m==t.getMonth())?t.getDate():new Date(y,m+1,0).getDate(),r=[];for(var d=last;d>=1;d--){var k=mk(y,m+1,d),w=pk(k).getDay();if(pk(k)<hireD())break;if(lim(k)||tot(k)>0||D[k]||PL[k])r.push(k)}return r}
function sbH(){var h='';
if(area=='home'){h+=gh('ir','İş Raporu');if(op('ir')){
h+=gh('gun','İş Günleri',1);if(op('gun')){h+=si('home','gun',TODAY,'Bugün · '+short(TODAY),'l3','ti-calendar-event');
dayMonths().forEach(function(ym,i){var gk='gm'+ym[0]+'-'+ym[1];if(CL[gk]===undefined&&i>0)CL[gk]=true;h+=gh(gk,AY[ym[1]]+' '+ym[0],2);if(op(gk))monthDays(ym[0],ym[1]).forEach(function(k){if(k!=TODAY)h+='<div style="margin-left:12px">'+si('home','gun',k,short(k),'l3','',dot(typ(k)))+'</div>'})})}
h+=gh('prj','Projeler',1);if(op('prj')){h+=si('home','yeni','','Yeni proje','l3','ti-plus');
models().forEach(function(m){h+=gh('m'+m,m,2,UM[m]?m:'');if(op('m'+m)){if(!PR[m].length)h+='<div class="si l3" style="color:#6a6a70;cursor:default;margin-left:36px">proje yok</div>';PR[m].slice().sort(function(a,b){return a[0]<b[0]?-1:1}).forEach(function(p){h+='<div style="margin-left:12px">'+(UP[p[0]]?siX('home','proje',p[0],p[0],'l3','','p',p[0]):si('home','proje',p[0],p[0],'l3'))+'</div>'})}});
h+=gh('mDiger','Diğer',2);if(op('mDiger'))DG.concat(['Standart dışı']).forEach(function(n){h+='<div style="margin-left:12px">'+si('home','proje',n,n,'l3')+'</div>'})}
h+=gh('izn','İzinler',1);if(op('izn'))h+=si('home','yil','','Yıllık İzinler','l3')+si('home','maz','','Mazeret İzinleri','l3')+si('home','ref','','Refakat İzinleri','l3')}}
else if(area=='set'){h+=gh('set','Ayarlar');if(op('set'))h+=si('set','huk','','Hukuki Sorumluluk','l2','ti-scale')+si('set','kur','','Uygulama Kuralları','l2','ti-adjustments')+si('set','baglanti','','Google Sheets','l2','ti-table')+si('set','ice','','Geçmiş raporlar','l2','ti-file-import')+si('set','aktar','','Dışa aktar','l2','ti-file-export')}
else if(area=='msg'){h+=gh('msg','Haberler');if(op('msg'))h+=si('msg','haber','gel',HN.gel,'l2','ti-bulb')+si('msg','haber','bil',HN.bil,'l2','ti-bell')+si('msg','haber','sir',HN.sir,'l2','ti-ship')}
else if(area=='cal'){h+=gh('cal','Takvim');if(op('cal'))h+=si('cal','takvim','','Ay takvimi','l2','ti-calendar-month')+'<div class="si l2" onclick="cm(0)"><i class="ti ti-calendar-event"></i>Bugüne git</div>'}
else if(area=='plan'){h+=gh('plan','Planlar');if(op('plan')){h+='<div class="si l2" onclick="newNote()"><i class="ti ti-plus"></i>Yeni not</div>'+gh('notl','Notlar',1);
if(op('notl')){if(!N.length)h+='<div class="hn" style="padding:4px 8px 4px 32px">Henüz not yok</div>';N.slice().reverse().forEach(function(n){h+=siX('plan','notlar',n.id,ntitle(n)+(n.sv?'':' •'),'l3','ti-note','n',n.id)})}
h+='<div class="hn" style="padding:10px 8px">'+(S.npath?'Not klasörü ayarlı':'Not klasörü ayarlanmadı')+'</div>'}}
else{h+=gh('img','Görseller');if(op('img')){h+=si('img','gorsel','','Tüm projeler','l2','ti-photo');models().forEach(function(m){h+=gh('i'+m,m,1);if(op('i'+m))PR[m].forEach(function(p){h+=si('img','gorsel',p[0],p[0],'l3')})});
h+='<div class="hn" style="padding:10px 8px">'+(S.path?'Klasör ayarlı':'Klasör ayarlanmadı')+'</div>'}}
return h}
function titleOf(){var m={gun:'İş Raporu › İş Günleri › '+lab(arg||sel),proje:'İş Raporu › Projeler › '+arg,yeni:'İş Raporu › Projeler › Yeni proje',yil:'İş Raporu › İzinler › Yıllık İzinler',maz:'İş Raporu › İzinler › Mazeret İzinleri',ref:'İş Raporu › İzinler › Refakat İzinleri',huk:'Ayarlar › Hukuki Sorumluluk',kur:'Ayarlar › Uygulama Kuralları',ice:'Ayarlar › Geçmiş raporlar',baglanti:'Ayarlar › Google Sheets bağlantısı',aktar:'Dosya › Excel ve PDF olarak aktar',belge:'Yardım › Belgeler',kisa:'Yardım › Klavye kısayolları',yenilik:'Yardım › Yenilikler',sorun:'Yardım › Sorun giderme ve sistem durumu'};
if(area=='msg')return 'Haberler › '+HN[arg||'gel'];if(area=='cal')return 'Takvim › '+AY[calM]+' '+calY;if(area=='img')return 'Görseller'+(arg?' › '+arg:'');if(area=='plan'){var n=arg?nobj(arg):null;return 'Planlar'+(n?' › '+ntitle(n):'')}return m[pg]}
function render(){AREAS.forEach(function(x){document.getElementById('r_'+x).className='rb'+(x==area?' on':'')});
document.getElementById('rail').style.display=railOn?'flex':'none';
document.getElementById('nsb').setAttribute('data-tip','Kenar çubuğunu '+(sbOn?'gizle':'göster')+'  Ctrl+Shift+S');
var sb=document.getElementById('sb'),st=sb.scrollTop;sb.innerHTML=sbH();sb.style.display=sbOn?'block':'none';sb.scrollTop=st;
document.getElementById('tl').textContent=titleOf();document.getElementById('tr').textContent='Sürüm '+INFO.version;
var P2=(area=='home'||area=='set')?P[pg]:area=='msg'?P.haber:area=='cal'?P.takvim:area=='plan'?P.notlar:P.gorsel;document.getElementById('ct').innerHTML=P2?P2():'';
document.getElementById('nbk').className='nb'+(hp>0?'':' off');document.getElementById('nfw').className='nb'+(hp<hist.length-1?'':' off');banner();syncLabel()}

// ---------- Notlar (.txt dosyaları) ----------
function nobj(id){return N.filter(function(n){return n.id==id})[0]||null}
function ntitle(n){return n.t.trim()||'Adsız not'}
function nfile(n){return ntitle(n).replace(/[\\\/:*?"<>|]/g,'-')+'.txt'}
var _nl=false;
function loadNotes(){if(!API||!S.npath||_nl)return;_nl=true;API.notes.list(S.npath).then(function(r){_nl=false;if(!r.ok)return;var keep=N.filter(function(n){return !n.sv});
var old={};N.forEach(function(n){if(n.file)old[n.file]=n.id});N=r.items.map(function(x){return{id:old[x.file]||('n'+(nid++)),file:x.file,t:x.title,b:x.body,sv:true}}).filter(function(x){return !keep.some(function(k){return k.file==x.file})}).concat(keep);
if(area=='plan')render()},function(){_nl=false})}
function newNote(){var n={id:'n'+(nid++),t:'',b:'',sv:false,cd:false};N.push(n);CL.plan=false;CL.notl=false;nav('plan','notlar',n.id);setTimeout(function(){var e=document.getElementById('nt');if(e)e.focus()},50)}
function saveNote(){if(area!='plan'||!arg)return;var n=nobj(arg);if(!n)return;if(!S.npath){toast('Önce Not klasörünü ayarla · Ayarlar › Uygulama Kuralları');return}
if(!API){n.sv=true;render();toast('Kaydedildi (tarayıcı önizlemesi: dosya yazılmaz)');return}
API.notes.save({dir:S.npath,oldFile:n.file||null,title:ntitle(n),body:n.b}).then(function(file){n.file=file;n.t=file.replace(/\.txt$/i,'');n.sv=true;render();toast('Kaydedildi: '+file)},function(e){toast('Kaydedilemedi: '+e.message)})}
function noteEdit(w,v){var n=nobj(arg);if(!n)return;n[w]=v;n.sv=false;if(w=='t')document.getElementById('tl').textContent=titleOf();document.getElementById('sb').innerHTML=sbH();var s=document.getElementById('nst');if(s)s.innerHTML='<span style="color:'+ORG+'">Kaydedilmemiş değişiklik</span>'}
function delNote(id){id=id||arg;var n=nobj(id);if(n&&n.file&&API)API.notes.del({dir:S.npath,file:n.file});N=N.filter(function(x){return x.id!=id});toast('Not silindi (Geri Dönüşüm Kutusu’na taşındı)');nav('plan','notlar','')}
function dupNote(id){var n=nobj(id),m={id:'n'+(nid++),t:ntitle(n)+' (kopya)',b:n.b,sv:false,cd:false};N.push(m);nav('plan','notlar',m.id);toast('Not çoğaltıldı · kaydetmeyi unutma')}

// ---------- Görseller (yerel klasör) ----------
var _il=false;
function loadImages(){if(!API||!S.path||_il)return;_il=true;API.images(S.path).then(function(r){_il=false;var ch=JSON.stringify(r.items)!=JSON.stringify(IM);IM=r.items;if(ch&&(area=='img'||pg=='proje'))render()},function(){_il=false})}
function imgsFor(c){var esc2=c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),re=new RegExp('^'+esc2+'(?![0-9]|\\.[0-9])','i');return IM.filter(function(x){return re.test(x.name)})}

// ---------- İşlem menüsü (sonradan eklenenler) ----------
function itemText(ty,id){if(ty=='n'){var n=nobj(id);return n?ntitle(n)+'\n\n'+n.b:''}
if(ty=='p')return id+' · '+pname(id)+' · '+pmodel(id);
if(ty=='g')return id+':\n'+(PR[id]||[]).map(function(p){return p[0]+' · '+p[1]}).join('\n');
var e=(E[sel]||[])[id];return e?lab(sel)+' · '+e.k+' · '+e.i+' · '+e.d+' dk':''}
function cp(t){if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast('Panoya kopyalandı')},function(){toast('Panoya kopyalanamadı')});else toast('Panoya kopyalanamadı')}
function edE(i){EDIT=i;render();var e=E[sel][i];document.getElementById('kd').value=e.k=='?'?'':e.k;document.getElementById('is').value=e.i;document.getElementById('dk').value=e.d;if(document.getElementById('pn2'))document.getElementById('pn2').value=e.pn||'';if(document.getElementById('ds2'))document.getElementById('ds2').value=e.ds||'';document.getElementById('er').innerHTML='<span style="color:#f6d28a">Kayıt düzenleniyor · </span><a onclick="EDIT=null;render()" style="cursor:pointer;text-decoration:underline">Vazgeç</a>'}
function cap(k){var L=lim(k),o=OT[k]||0;return L?L+o:(o||null)}
function dupE(i){var k=sel,e=E[k][i],c=cap(k);if(c&&S.cak&&tot(k)+e.d>c){toast('Gün süresi aşılır, çoğaltılamadı');return}var n={k:e.k,i:e.i,d:e.d,pn:e.pn,st:S.onay?0:1};E[k].splice(i+1,0,n);entryAdded(k,n);UN=[];RE=[];render();save();toast('Kayıt çoğaltıldı')}
function delProj(id){Object.keys(PR).forEach(function(m){PR[m]=PR[m].filter(function(p){return p[0]!=id});if(!PR[m].length&&UM[m]){delete PR[m];delete UM[m]}});Object.keys(E).forEach(function(k){E[k]=E[k].filter(function(e){if(e.k==id){entryRemoved(e);return false}return true});if(!E[k].length)delete E[k]});PT=PT.filter(function(x){return x[0]!=id});delete UP[id];delete PS[id];projRemoved(id);UN=[];RE=[];save();toast('Proje silindi');nav('home','gun',sel)}
function delGrp(m){(PR[m]||[]).forEach(function(p){delete UP[p[0]];delete PS[p[0]];PT=PT.filter(function(x){return x[0]!=p[0]});Object.keys(E).forEach(function(k){E[k]=E[k].filter(function(e){if(e.k==p[0]){entryRemoved(e);return false}return true});if(!E[k].length)delete E[k]});projRemoved(p[0])});delete PR[m];delete UM[m];UN=[];RE=[];save();toast(m+' grubu silindi');nav('home','gun',sel)}
function confirmBox(msg,fn,yes){CFN=fn;var o=document.getElementById('ov');o.innerHTML='<div class="dl"><div style="color:#fff;margin-bottom:12px;line-height:1.45">'+msg+'</div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="bt" onclick="cfNo()">Vazgeç</button><button class="bt d" onclick="cfYes()">'+(yes||'Evet, sil')+'</button></div></div>';o.style.display='flex'}
function cfNo(){CFN=null;document.getElementById('ov').style.display='none'}
function cfYes(){var f=CFN;cfNo();if(f)f()}
function askDel(ty,id){
if(ty=='n'){var n=nobj(id);if(n)confirmBox('“'+esc(ntitle(n))+'” notu silinsin mi?'+(n.file?' Dosya Geri Dönüşüm Kutusu’na taşınır.':''),function(){delNote(id)})}
else if(ty=='p'){var c=0;Object.keys(E).forEach(function(k){E[k].forEach(function(e){if(e.k==id)c++})});confirmBox(esc(id)+' projesi silinsin mi? Bu projeye girilmiş '+c+' kayıt da silinir.',function(){delProj(id)})}
else if(ty=='g')confirmBox(esc(id)+' grubu ve içindeki tüm projeler silinsin mi? Bu projelere girilmiş kayıtlar da silinir.',function(){delGrp(id)});
else confirmBox('Bu kayıt silinsin mi?'+(CONNECTED&&E[sel][id]&&E[sel][id].row?' Sheets’teki satırı da temizlenir.':''),function(){var e=E[sel].splice(id,1)[0];entryRemoved(e);if(!E[sel].length)delete E[sel];UN=[];RE=[];EDIT=null;render();save();toast('Kayıt silindi')})}
function CA(ty,id){var a=[['Kopyala',function(){cp(itemText(ty,id))},'ti-copy']];
if(ty=='n')a.push(['Çoğalt',function(){dupNote(id)},'ti-copy-plus'],['Düzenle',function(){nav('plan','notlar',id);setTimeout(function(){var e=document.getElementById('nt');if(e)e.focus()},50)},'ti-pencil']);
if(ty=='p')a.push(['Çoğalt',function(){PRE=pname(id);nav('home','yeni');toast('Ad hazır, yeni proje kodunu yaz')},'ti-copy-plus'],['Düzenle',function(){EP=id;nav('home','proje',id)},'ti-pencil']);
if(ty=='e')a.push(['Çoğalt',function(){dupE(id)},'ti-copy-plus'],['Düzenle',function(){edE(id)},'ti-pencil']);
a.push(['Sil',function(){askDel(ty,id)},'ti-trash']);return a}
function ctx(ev,ty,id){ev.preventDefault();ev.stopPropagation();if(ty=='e')id=+id;var it=CA(ty,id),c=document.getElementById('cx'),w=document.getElementById('app').getBoundingClientRect();CXI=it;
c.innerHTML=it.map(function(x,i){return '<div class="cxi" onmousedown="event.preventDefault()" onclick="cxa('+i+')"'+(x[0]=='Sil'?' style="color:#f4a3a3"':'')+'><i class="ti '+x[2]+'"></i>'+x[0]+'</div>'}).join('');
c.style.display='block';var x=ev.clientX-w.left,y=ev.clientY-w.top;c.style.left=Math.max(4,Math.min(x,w.width-c.offsetWidth-6))+'px';c.style.top=Math.max(4,Math.min(y,w.height-c.offsetHeight-8))+'px'}
function closeCx(){var c=document.getElementById('cx');if(c)c.style.display='none'}
function cxa(i){var f=CXI[i][1];closeCx();f()}
function tbar(ty,id){TB=CA(ty,id);return '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px">'+TB.map(function(x,i){return '<button class="bt" onclick="tba('+i+')"'+(x[0]=='Sil'?' style="color:#f4a3a3"':'')+'><i class="ti '+x[2]+'"></i> '+x[0]+'</button>'}).join('')+'</div>'}
function tba(i){TB[i][1]()}

// ---------- Menüler ----------
function T(m){return function(){toast(m)}}
function syncNow(){if(CONNECTED&&typeof shReadAll=='function')shReadAll();else nav('set','baglanti')}
function openPath(){if(!S.path){toast('Görsel klasörü ayarlanmadı');nav('set','kur');return}if(API)API.openPath(S.path).then(function(r){if(r)toast(r)})}
function allCl(v){var ks=['ir','gun','prj','izn','mDiger','set','msg','cal','plan','notl','img'].concat(models().map(function(m){return 'm'+m}),models().map(function(m){return 'i'+m}),dayMonths().map(function(x){return 'gm'+x[0]+'-'+x[1]}));ks.forEach(function(k){CL[k]=v});document.getElementById('sb').innerHTML=sbH();save()}
function winCmd(c,m){if(API)API.win(c);else toast(m)}
var MA={
'Dosya':[['Yeni pencere',function(){winCmd('new','Tarayıcıda tek pencere var')}],['Yeni kayıt',newRec,'Ctrl+N'],['Yeni not',newNote],['Yeni proje…',function(){nav('home','yeni')},'Ctrl+Shift+N'],null,['Notu kaydet',saveNote,'Ctrl+S'],['Görsel klasörünü aç',openPath,'Ctrl+O'],['Google Sheets\'i aç',T('Sheets bağlantısı Aşama 2’de kurulacak')],['Senkronize et',syncNow,'Ctrl+R'],['Geçmiş raporlar…',function(){nav('set','ice')}],['Excel ve PDF olarak aktar…',function(){nav('set','aktar')}],['Şimdi yedekle',function(){backupNow(true)}],null,['Kapat',function(){winCmd('close','Tarayıcıda pencere kapanmaz')},'Ctrl+W'],['Oturumu kapat',function(){if(API&&window.shLogout)shLogout();else toast('Google oturumu yok')}]],
'Düzenle':[['Geri al',function(){undo()},'Ctrl+Z'],['Yinele',function(){redo()},'Ctrl+Y'],null,['Kes',function(){ex('cut')},'Ctrl+X'],['Kopyala',function(){ex('copy')},'Ctrl+C'],['Yapıştır',function(){ex('paste')},'Ctrl+V'],['Sil',function(){ex('delete')}],null,['Tümünü seç',function(){ex('selectAll')},'Ctrl+A'],null,['Ayarlar',function(){nav('set','kur')},'Ctrl+,']],
'Görünüm':[['Kenar çubuğunu değiştir',togSb,'Ctrl+Shift+S'],['Gezinme panelini aç/kapat',togRail,'Ctrl+Shift+E'],['Tüm kategorileri kapat',function(){allCl(true)}],['Tüm kategorileri aç',function(){allCl(false)}],null,['Ara (kayıt, proje, komut)',function(){openPal()},'Ctrl+K'],['Bul',openFind,'Ctrl+F'],null,['Geri',back,'Ctrl+['],['İleri',fwd,'Alt+→'],null,['Önceki kenar çubuğu öğesi',function(){stepSb(-1)},'Alt+Ctrl+['],['Sonraki kenar çubuğu öğesi',function(){stepSb(1)},'Alt+Ctrl+]'],null,['Önceki sekme',function(){stepTab(-1)},'Ctrl+Shift+['],['Sonraki sekme',function(){stepTab(1)},'Ctrl+Shift+]'],null,['Yakınlaştır',function(){zoomSet(zoom+.1)},'Ctrl+Shift++'],['Uzaklaştır',function(){zoomSet(zoom-.1)},'Ctrl+-'],['Gerçek boyut',function(){zoomSet(1)},'Ctrl+0'],null,['Açık / koyu tema',function(){togTheme()}],null,['Tam ekranı aç/kapat',function(){winCmd('fullscreen','Tarayıcıda F11 kullan')},'F11']],
'Yardım':[['Belgeler',function(){nav('set','belge')}],['Klavye kısayollarını göster',function(){nav('set','kisa')},'Ctrl+/'],['Yenilikler',function(){nav('set','yenilik')}],null,['Sorun giderme',function(){nav('set','sorun')}],['Sistem durumu',function(){nav('set','sorun')}],['Geri bildirim',T('Geri bildirimini Claude’a yazabilirsin')],null,['Güncellemeleri denetle…',function(){checkUpdate(true)}],[APPNAME+' hakkında',function(){toast(APPNAME+' · sürüm '+INFO.version)}]]};
function menu(n){var d=document.getElementById('dd');if(mo==n){closeM();return}closeM();mo=n;document.getElementById('m_'+n).className='mi on';
d.style.left=document.getElementById('m_'+n).offsetLeft+'px';d.style.display='block';d.innerHTML=MA[n].map(function(x,i){if(!x)return '<div style="height:0.5px;background:#3a3a40;margin:5px 4px"></div>';return '<div class="ddi" onmousedown="event.preventDefault()" onclick="mact(\''+n+'\','+i+')"><span>'+x[0]+'</span><span class="sc">'+(x[2]||'')+'</span></div>'}).join('')}
function closeM(){mo='';document.getElementById('dd').style.display='none';['Dosya','Düzenle','Görünüm','Yardım'].forEach(function(x){document.getElementById('m_'+x).className='mi'})}
function mact(n,i){closeM();MA[n][i][1]()}
document.addEventListener('click',function(e){if(!e.target.closest('.mi')&&!e.target.closest('.dd'))closeM();if(!e.target.closest('.cx'))closeCx()});
document.addEventListener('keydown',function(e){var k=e.key,c=e.ctrlKey||e.metaKey,fl=e.target&&(e.target.tagName=='INPUT'||e.target.tagName=='TEXTAREA');
if(k=='Escape'){closeFind();closeCx();cfNo();closeM();return}
if(k=='F11'){e.preventDefault();winCmd('fullscreen','Tarayıcıda F11 kullan');return}
if(e.altKey&&!c){if(k=='ArrowLeft')back();else if(k=='ArrowRight')fwd();return}
if(!c)return;
if(e.altKey){if(k=='[')stepSb(-1);else if(k==']')stepSb(1);return}
if(e.shiftKey){var K=k.toLowerCase();if(K=='s'){e.preventDefault();togSb()}else if(K=='e'){e.preventDefault();togRail()}else if(K=='n'){e.preventDefault();nav('home','yeni')}else if(K=='i'){if(API)API.win('devtools')}else if(k=='{'||k=='[')stepTab(-1);else if(k=='}'||k==']')stepTab(1);else if(k=='+'||k=='=')zoomSet(zoom+.1);return}
var K=k.toLowerCase();
if(K=='s'){e.preventDefault();saveNote()}else if(K=='f'){e.preventDefault();openFind()}else if(K=='n'){e.preventDefault();newRec()}else if(K=='o'){e.preventDefault();openPath()}else if(K=='r'){e.preventDefault();syncNow()}else if(K=='w'){e.preventDefault();winCmd('close','')}
else if(k=='/'){e.preventDefault();nav('set','kisa')}else if(k==','){e.preventDefault();nav('set','kur')}else if(k=='0'){e.preventDefault();zoomSet(1)}else if(k=='-'){e.preventDefault();zoomSet(zoom-.1)}else if(k=='+'||k=='='){e.preventDefault();zoomSet(zoom+.1)}else if(k=='[')back();else if(!fl&&K=='z')undo();else if(!fl&&K=='y')redo()});
function undo(){var u=UN.pop();if(!u){toast('Geri alınacak işlem yok');return}var a=E[u.k]||[],i=a.indexOf(u.e);if(i>=0){a.splice(i,1);entryRemoved(u.e)}if(!a.length)delete E[u.k];RE.push(u);render();save();toast('Son kayıt geri alındı')}
function redo(){var u=RE.pop();if(!u){toast('Yinelenecek işlem yok');return}var e={k:u.e.k,i:u.e.i,d:u.e.d,pn:u.e.pn,st:u.e.st};(E[u.k]=E[u.k]||[]).push(e);entryAdded(u.k,e);u.e=e;UN.push(u);render();save()}
function newRec(){nav('home','gun',TODAY);setTimeout(function(){var e=document.getElementById('kd');if(e)e.focus()},50)}

// Otomatik güncelleme durumu
var UPD={s:''};
function checkUpdate(manual){if(!API||!API.update){toast('Güncelleme yalnız masaüstü uygulamasında');return}API.update.check().then(function(r){if(r.s=='gelistirme'){if(manual)toast('Geliştirme sürümü: güncelleme yalnız kurulu uygulamada çalışır')}else if(manual)toast('Güncellemeler denetleniyor…')})}
if(API&&API.update)API.update.on(function(s){UPD=s;if(s.s=='hazir'){var o=document.getElementById('ov');o.innerHTML='<div class="dl"><div style="color:#fff;margin-bottom:12px;line-height:1.45">'+APPNAME+' '+esc(s.v)+' indirildi. Şimdi yeniden başlatıp kurulsun mu? Kayıtların korunur.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="bt" onclick="cfNo()">Sonra</button><button class="bt p" onclick="API.update.install()">Yeniden başlat</button></div></div>';o.style.display='flex'}else if(s.s=='indiriliyor')toast('Yeni sürüm '+s.v+' indiriliyor…');else if(s.s=='guncel')toast(APPNAME+' güncel');else if(s.s=='hata')toast('Güncelleme denetlenemedi')});
