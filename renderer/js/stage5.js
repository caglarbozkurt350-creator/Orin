// Orin · Aşama 5: hafta görünümü, ay sonu özeti, proje grafiği, süre tahmini, kayıt şablonları, bildirimler
// ---------- Takvim: Ay / Hafta ----------
var calW=null;
function monday(k){var d=pk(k);d.setDate(d.getDate()-((d.getDay()+6)%7));return key(d)}
function wkNav(n){if(n==0)calW=monday(TODAY);else{var d=pk(calW||monday(TODAY));d.setDate(d.getDate()+7*n);calW=key(d)}render()}
function calTab(){return '<div style="display:flex;gap:6px;margin-bottom:10px"><button class="bt'+(S.calView!='hafta'?' on':'')+'" onclick="S.calView=\'ay\';save();render()">Ay</button><button class="bt'+(S.calView=='hafta'?' on':'')+'" onclick="S.calView=\'hafta\';if(!calW)calW=monday(sel);save();render()">Hafta</button></div>'}
function aySonu(){var a=mk(calY,calM+1,1),b=mk(calY,calM+1,new Date(calY,calM+1,0).getDate()),x=rangeStats(a,b),iz=0,tm=0,d=pk(a),e=pk(b);
while(d<=e){var t=typ(key(d));if(['yillik','mazeret','refakat','rapor13','rapor4','sevk','ucretsiz','plan'].indexOf(t)>=0)iz++;if(t=='tam'||t=='mesai')tm++;d.setDate(d.getDate()+1)}
return '<div class="kpi" style="margin-top:12px"><div><small>Ay toplamı</small><b>'+dk(x.s)+' dk</b><small>'+sa(x.s)+'</small></div><div><small>Tamam / mesaili gün</small><b>'+tm+'</b></div><div><small>İzin ve rapor</small><b>'+iz+'</b></div><div><small>Hatalı gün</small><b style="color:'+(x.er.length?RED:GRN)+'">'+x.er.length+'</b>'+(x.ot?'<small>mesai '+dk(x.ot)+' dk</small>':'')+'</div></div>'}
function haftaView(){var m=calW||monday(sel),d0=pk(m),days=[],mx=0,tt=0,cap0=0;
for(var i=0;i<7;i++){var d=new Date(d0);d.setDate(d0.getDate()+i);var k=key(d),s=tot(k),L=lim(k),o=OT[k]||0,w=d.getDay();if((w==0||w==6)&&!s&&!D[k])continue;days.push(k);mx=Math.max(mx,s,(L||0)+o);tt+=s;cap0+=(L||0)+o}
mx=Math.max(mx,1);var e=new Date(d0);e.setDate(d0.getDate()+6);
var h='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><div class="h" style="margin:0">'+d0.getDate()+' '+AY[d0.getMonth()]+' – '+e.getDate()+' '+AY[e.getMonth()]+' '+e.getFullYear()+'</div><div style="display:flex;gap:6px"><button class="bt" onclick="wkNav(-1)">‹</button><button class="bt" onclick="wkNav(0)">Bu hafta</button><button class="bt" onclick="wkNav(1)">›</button></div></div><div class="card">';
days.forEach(function(k){var s=tot(k),L=lim(k)||0,o=OT[k]||0,t=typ(k),lbl;if(L&&o&&s)lbl=L+'+'+Math.min(o,Math.max(0,s-L));else if(s)lbl=dk(s)+' dk';else lbl=TN[t];
var bar;if(!s&&!L)bar='<div class="bar" style="height:14px"><i style="width:100%;'+cs(t)+'"></i></div>';else if(!s)bar='<div class="bar" style="height:14px"><i style="width:'+(L/mx*100)+'%;'+cs(t)+'"></i></div>';else{var n1=Math.min(s,L||s),n2=L?Math.min(Math.max(0,s-L),o):0,n3=Math.max(0,s-(L?L+o:s));bar='<div class="bar" style="height:14px">'+(n1?'<i style="width:'+(n1/mx*100)+'%;background:'+(t=='hata'?RED:BLU)+'"></i>':'')+(n2?'<i class="ot" style="width:'+(n2/mx*100)+'%"></i>':'')+(n3?'<i style="width:'+(n3/mx*100)+'%;background:'+RED+'"></i>':'')+'</div>'}
h+='<div class="sr" style="grid-template-columns:120px 1fr 110px;cursor:pointer" onclick="nav(\'home\',\'gun\',\''+k+'\')"><span>'+dot(t)+' '+short(k)+'</span>'+bar+'<span style="color:#8a8a90;text-align:right">'+esc(lbl)+'</span></div>'});
return h+'</div><p class="ft">Haftalık toplam '+dk(tt)+' dk · iş süresi '+dk(cap0)+' dk. Cumartesi ve Pazar yalnız çalışma varsa görünür; mesai kısmı kesik çizgili.</p>'}
var _takvimAy=P.takvim;
P.takvim=function(){return calTab()+(S.calView=='hafta'?haftaView():_takvimAy().replace('<p class="ft">',aySonu()+'<p class="ft">'))};

// ---------- Proje: günlere dağılım grafiği ve süre tahmini ----------
var STOP=['crew','kamara','misafir','iskele','sancak','güverte','lobby','duvar','panelleri','paneller','raporda','genel','devam','destek','revizyon','çalışma'];
function pTotal(c){var t=0;Object.keys(E).forEach(function(k){E[k].forEach(function(e){if(e.k==c)t+=e.d})});PT.forEach(function(x){if(x[0]==c)t+=x[2]});return t}
function isDone(c){return /Bitti|Teslim|Tamam/i.test(PS[c]||'')}
function words(n){return trl(n).split(/[^a-zçğıöşü0-9]+/).filter(function(w){return w.length>=4&&STOP.indexOf(w)<0})}
function estimate(c){if(DG.indexOf(c)>=0||SPECIAL.indexOf(c)>=0)return '';var ws=words(pname(c));if(!ws.length)return '';var sim=allP().filter(function(p){return p[0]!=c&&isDone(p[0])&&pTotal(p[0])>0&&words(p[1]).some(function(w){return ws.indexOf(w)>=0})});
if(!sim.length)return '';var av=sim.reduce(function(a,p){return a+pTotal(p[0])},0)/sim.length,me=pTotal(c),key2=ws.filter(function(w){return sim.some(function(p){return words(p[1]).indexOf(w)>=0})})[0];
return '<div class="card"><div class="ch"><i class="ti ti-chart-dots"></i>Süre tahmini</div><div>Benzer bitmiş '+sim.length+' proje (“'+esc(key2)+'”) ortalama <b style="font-weight:500;color:#fff">'+sa(av)+'</b> sürdü.'+(isDone(c)?'':' Bu projede şu ana kadar '+sa(me)+(me<av?', tahmini kalan ~'+sa(av-me):', ortalamayı geçti')+'.')+'</div><div class="hn" style="margin-top:4px">'+sim.slice(0,5).map(function(p){return esc(p[0])+' · '+sa(pTotal(p[0]))}).join(' · ')+'</div></div>'}
function pChart(c){var dg=DG.indexOf(c)>=0,by=[];Object.keys(E).forEach(function(k){var s=0;E[k].forEach(function(e){if(dg?(e.k=='Diğer'&&e.i==c):e.k==c)s+=e.d});if(s)by.push([k,s])});if(by.length<2)return '';
by.sort(function(a,b){return pk(a[0])-pk(b[0])});by=by.slice(-40);var mx=Math.max.apply(null,by.map(function(x){return x[1]}));
return '<div class="card"><div class="ch"><i class="ti ti-chart-bar"></i>Günlere dağılım</div><div style="display:flex;align-items:flex-end;gap:3px;height:70px">'+by.map(function(x){return '<div title="'+esc(lab(x[0]))+' · '+dk(x[1])+' dk" onclick="nav(\'home\',\'gun\',\''+x[0]+'\')" style="flex:1;min-width:4px;max-width:22px;cursor:pointer;background:'+BLU+';opacity:.85;border-radius:3px 3px 0 0;height:'+Math.max(4,x[1]/mx*100)+'%"></div>'}).join('')+'</div><div class="hn" style="display:flex;justify-content:space-between;margin-top:4px"><span>'+short(by[0][0])+'</span><span>'+by.length+' gün</span><span>'+short(by[by.length-1][0])+'</span></div></div>'}
var _proje=P.proje;
P.proje=function(){var h=_proje(),c=arg,ex=pChart(c)+estimate(c),i=h.indexOf('<div class="card"><div class="ch"><i class="ti ti-photo">');return i>=0?h.slice(0,i)+ex+h.slice(i):h+ex};

// ---------- Kayıt şablonları ----------
function freqTpl(){var m={},lim90=new Date(pk(TODAY));lim90.setDate(lim90.getDate()-90);Object.keys(E).forEach(function(k){if(pk(k)<lim90)return;E[k].forEach(function(e){if(e.k=='?')return;var id=e.k+'|'+e.i+'|'+e.d;m[id]=(m[id]||0)+1})});
return Object.keys(m).filter(function(id){return m[id]>=2}).sort(function(a,b){return m[b]-m[a]}).slice(0,4).map(function(id){var p=id.split('|');return{k:p[0],i:p[1],d:+p[2],auto:1}})}
function tplAll(){return (S.tpl||[]).concat(freqTpl().filter(function(f){return !(S.tpl||[]).some(function(s){return s.k==f.k&&s.i==f.i&&s.d==f.d})}))}
function tplUse(n){var t=tplAll()[n];if(!t)return;document.getElementById('kd').value=t.k;document.getElementById('is').value=t.i;document.getElementById('dk').value=t.d;toast('Şablon dolduruldu · Kaydet’e bas')}
function tplSave(){var k=document.getElementById('kd').value.trim(),i=document.getElementById('is').value.trim(),d=+document.getElementById('dk').value;if(!k||!i||!(d>0)){document.getElementById('er').textContent='Şablon için proje kodu, iş ve dakikayı doldur';return}S.tpl=(S.tpl||[]).concat([{k:k,i:i,d:d}]).slice(-8);save();render();toast('Şablon kaydedildi')}
function tplDel(n){S.tpl=(S.tpl||[]).filter(function(x,i){return i!=n});save();render()}
function tplRow(){var a=tplAll();return '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center"><span class="hn" style="margin-right:2px">Şablonlar:</span>'+a.map(function(t,n){return '<span class="chip" style="margin:0" title="'+(t.auto?'Sık girdiğin kayıt':'Kaydettiğin şablon')+'" onclick="tplUse('+n+')">'+(t.auto?'':'<i class="ti ti-bookmark" style="font-size:11px"></i> ')+esc(t.k)+' · '+esc(t.i)+' · '+dk(t.d)+' dk'+(t.auto?'':' <span onclick="event.stopPropagation();tplDel('+n+')" style="opacity:.6">✕</span>')+'</span>'}).join('')+'<span class="chip" style="margin:0" onclick="tplSave()"><i class="ti ti-plus" style="font-size:11px"></i> Formu şablon yap</span></div>'}
var _gun=P.gun;
P.gun=function(){var h=_gun(),m='<div style="margin-top:8px">',i=h.indexOf(m);return i>=0?h.slice(0,i)+tplRow()+h.slice(i):h};

// ---------- Bildirimler: Cuma haftalık özet, onaysız izin ----------
function notify(title,body,go){try{var n=new Notification(title,{body:body});n.onclick=function(){window.focus();if(go)go()}}catch(e){toast(body)}}
function weeklyTick(){if(INFO.smoke||!S.remind)return;var now=new Date(),k=key(now);
if(now.getDay()==5&&S.weekDay!=k){var hm=S.remind.split(':'),t=new Date(now);t.setHours(+hm[0]||17,(+hm[1]||0)+5,0,0);if(now>=t){S.weekDay=k;save();var m=monday(k),s=0,ok=0,er=0;for(var i=0;i<5;i++){var d=pk(m);d.setDate(d.getDate()+i);var kk=key(d),ty=typ(kk);s+=tot(kk);if(ty=='tam'||ty=='mesai')ok++;if(ty=='hata'||ty=='girdi'||ty=='bos'&&d<=now)er++}
notify(APPNAME+' · haftalık özet','Bu hafta '+dk(s)+' dk ('+sa(s)+') · '+ok+' gün tamam'+(er?' · '+er+' gün eksik':'')+'.',function(){S.calView='hafta';calW=m;nav('cal','takvim')})}}
var u=unap();if(u&&u.d<=3&&S.izinDay!=k){S.izinDay=k;save();notify(APPNAME+' · izin onayı',lab(u.k)+' tarihli izin henüz onaylanmadı ('+(u.d<=0?'bugün':u.d+' gün kaldı')+').',function(){nav('home','yil','')})}}
setInterval(weeklyTick,60000);setTimeout(weeklyTick,6000);

// ---------- Gelişim önerileri: bu sürümde yapılanlar ve yeni fikirler ----------
(function(){S.sg=S.sg||{};if(!S.sg5){['aysonu','projegrafik','tahmin','sablon','haftaozet','izinhatir'].forEach(function(id){S.sg[id]='yapildi'});S.sg5=1}
SUG.push({id:'ses',t:'Sesli kayıt: “78.26.13.51 duvar paneli 300 dakika” deyince form dolsun',k:'Yapısal',v:'0.4.0'},
{id:'notproje',t:'Proje sayfasına yalnız sende kalan hata ve iyileştirme notları',k:'Yapısal',v:'0.4.0'},
{id:'dilekce',t:'Yıllık izin dilekçesi için hazır PDF şablonu (izin planından doldurulur)',k:'Kullanım',v:'0.4.0'},
{id:'temaoto',t:'Tema saatle otomatik değişsin (gündüz açık, akşam koyu)',k:'Görsel',v:'0.4.0'},
{id:'karsilastir',t:'İki ayı yan yana karşılaştıran özet (süre, proje dağılımı)',k:'Görsel',v:'0.4.0'})})();
