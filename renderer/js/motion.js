// Orin · hareketli yapay zeka temaları. Yalnız arka planda çizilir; içerik sabit kalır.
// Pencere gizliyken durur, sistemde "animasyonları azalt" açıksa kapanır, en fazla 30 kare/sn.
var MT=[['kapali','Kapalı','Hareket yok'],['sinir','Sinir ağı','Süzülen düğümler, akan sinyaller'],['devre','Neon devre','Devre izlerinde ilerleyen ışık'],['veri','Veri akışı','Süzülen veri parçacıkları'],['dalga','Dalga formu','Dinleyen asistanın ses dalgası'],['aurora','Aurora','Yavaş kayan ışık bulutları'],['kuantum','Kuantum yörünge','Çekirdek etrafında dönen parçacıklar'],['izgara','Holo ızgara','Ufka akan perspektif ızgara'],['cekirdek','Yapay zeka çekirdeği','Nefes alan halkalar'],['yildiz','Takımyıldız','Yıldızlar birleşip ayrılıyor']];
var MO={cv:null,x:null,W:0,H:0,run:false,last:0,st:{},reduced:false};
function mInit(){var app=document.getElementById('app');if(!app||MO.cv)return;var c=document.createElement('canvas');c.id='mcv';c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:0';app.insertBefore(c,app.firstChild);MO.cv=c;MO.x=c.getContext('2d');
try{var mq=window.matchMedia('(prefers-reduced-motion: reduce)');MO.reduced=mq.matches;mq.addEventListener('change',function(e){MO.reduced=e.matches;mApply()})}catch(e){}
window.addEventListener('resize',mSize);document.addEventListener('visibilitychange',function(){if(!document.hidden)mStart()});mSize()}
function mSize(){if(!MO.cv)return;var r=window.devicePixelRatio>1.5?1.5:1;MO.W=MO.cv.offsetWidth;MO.H=MO.cv.offsetHeight;MO.cv.width=MO.W*r;MO.cv.height=MO.H*r;MO.x.setTransform(r,0,0,r,0,0);MO.st={}}
function mOn(){return S.motion&&S.motion!='kapali'&&!MO.reduced&&(!INFO.smoke||window.__motionTest)}
function mApply(){mInit();var on=mOn();document.documentElement.classList.toggle('motion',on);if(MO.cv)MO.cv.style.display=on?'block':'none';if(on)mStart();else if(MO.x)MO.x.clearRect(0,0,MO.W,MO.H)}
function mStart(){if(MO.run||!mOn())return;MO.run=true;requestAnimationFrame(mFrame)}
function mSet(k){S.motion=k;S.st=null;MO.st={};save();mApply();render()}
function rnd(a,b){return a+Math.random()*(b-a)}
function A(a){return Math.max(0,Math.min(1,a*(S.mdens=='belirgin'?1.6:1)))}
function mSeed(k){var W=MO.W,H=MO.H,s={};
if(k=='sinir'||k=='yildiz'){s.n=[];for(var i=0;i<(k=='yildiz'?70:44);i++)s.n.push({x:rnd(0,W),y:rnd(0,H),vx:rnd(-.2,.2),vy:rnd(-.2,.2),p:rnd(0,7)})}
if(k=='devre'){s.t=[];for(var j=0;j<18;j++){var p=[[rnd(0,W),rnd(0,H)]];for(var q=0;q<5;q++){var l=p[p.length-1];p.push(q%2?[l[0],l[1]+rnd(-160,160)]:[l[0]+rnd(-280,280),l[1]])}s.t.push({p:p,o:Math.random(),v:rnd(.06,.14)})}}
if(k=='veri'){s.d=[];for(var m=0;m<60;m++)s.d.push({x:rnd(0,W),y:rnd(0,H),v:rnd(.3,.9),c:Math.random()<.5})}
if(k=='kuantum'){s.o=[];for(var z=0;z<5;z++)s.o.push({rx:rnd(90,Math.min(W,H)*.48),ry:rnd(30,140),a:rnd(0,3),v:rnd(.15,.4)*(z%2?1:-1),n:3+z})}
return s}
function lerpP(p,u){var L=0,sg=[];for(var i=1;i<p.length;i++){var d=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);sg.push(d);L+=d}var g=u*L;for(var i=0;i<sg.length;i++){if(g<=sg[i]){var r=g/(sg[i]||1);return[p[i][0]+(p[i+1][0]-p[i][0])*r,p[i][1]+(p[i+1][1]-p[i][1])*r]}g-=sg[i]}return p[p.length-1]}
function mdot(x,X,Y,r,c){x.fillStyle=c;x.beginPath();x.arc(X,Y,r,0,7);x.fill()}
function mFrame(ts){if(!mOn()||document.hidden){MO.run=false;return}requestAnimationFrame(mFrame);if(ts-MO.last<33)return;MO.last=ts;
var k=S.motion,x=MO.x,W=MO.W,H=MO.H,t=ts/1000*(S.mspeed=='yavas'?.5:1);if(!MO.st[k])MO.st[k]=mSeed(k);var s=MO.st[k],sp=S.mspeed=='yavas'?.5:1;x.clearRect(0,0,W,H);
if(k=='sinir'||k=='yildiz'){var R=k=='yildiz'?95:130;s.n.forEach(function(n){n.x+=n.vx*sp;n.y+=n.vy*sp;if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1});
for(var i=0;i<s.n.length;i++)for(var j=i+1;j<s.n.length;j++){var a=s.n[i],b=s.n[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<R){var f=1-d/R;if(k=='yildiz')f*=.5+.5*Math.sin(t*.6+i);x.strokeStyle='rgba(110,130,255,'+A(.2*f)+')';x.lineWidth=1;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();if(k=='sinir'&&(i+j)%6==0){var u=(t*.35+((i*7+j)%10)/10)%1;mdot(x,a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u,1.6,'rgba(160,120,255,'+A(.55*f)+')')}}}
s.n.forEach(function(n,i){mdot(x,n.x,n.y,k=='yildiz'?1.3+Math.sin(t*1.3+n.p):2,'rgba(130,150,255,'+A(.35+.25*Math.sin(t+n.p))+')')})}
if(k=='devre')s.t.forEach(function(r,i){x.strokeStyle='rgba(90,120,230,'+A(.14)+')';x.lineWidth=1.2;x.beginPath();r.p.forEach(function(q,m){m?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1])});x.stroke();var e=r.p[r.p.length-1];x.strokeStyle='rgba(150,110,255,'+A(.28)+')';x.beginPath();x.arc(e[0],e[1],3,0,7);x.stroke();
var u=(t*r.v+r.o)%1;for(var m=0;m<7;m++){var q=lerpP(r.p,Math.max(0,u-m*.007));mdot(x,q[0],q[1],m?1.6:2.3,(i%2?'rgba(130,160,255,':'rgba(170,120,255,')+A(m?.13*(7-m)/7:.75)+')')}});
if(k=='veri')s.d.forEach(function(d){d.y+=d.v*sp;if(d.y>H+60){d.y=-20;d.x=rnd(0,W)}for(var m=0;m<7;m++){x.fillStyle=(d.c?'rgba(110,140,255,':'rgba(160,120,255,')+A(.3*(1-m/7))+')';x.fillRect(d.x,d.y-m*9,2,5)}});
if(k=='dalga'){for(var w=0;w<3;w++){x.strokeStyle=['rgba(100,130,255,','rgba(150,110,255,','rgba(90,170,255,'][w]+A([.33,.24,.17][w])+')';x.lineWidth=1.5;x.beginPath();for(var px=0;px<=W;px+=5){var am=(18+10*Math.sin(t*.5+w))*Math.sin(px/W*Math.PI),y=H-70+am*Math.sin(px*.018*(1+w*.3)+t*(.8+w*.3));px?x.lineTo(px,y):x.moveTo(px,y)}x.stroke()}
for(var b=0;b<56;b++){var hh=4+16*Math.abs(Math.sin(t*1.2+b*.45))*Math.sin(b/56*Math.PI);x.fillStyle='rgba(120,140,255,'+A(.2)+')';x.fillRect(W/2-224+b*8,H-28-hh/2,3,hh)}}
if(k=='aurora'){x.globalCompositeOperation='lighter';[[.18,.25,'70,90,230'],[.78,.2,'140,80,230'],[.6,.85,'60,140,230']].forEach(function(o,i){var cx=W*(o[0]+.08*Math.sin(t*.15+i*2)),cy=H*(o[1]+.08*Math.cos(t*.12+i));for(var r=40;r<300;r+=24)mdot(x,cx,cy,r,'rgba('+o[2]+','+A(.045)+')')});x.globalCompositeOperation='source-over'}
if(k=='kuantum'){var cx=W*.62,cy=H*.5;mdot(x,cx,cy,5+1.5*Math.sin(t*2),'rgba(150,130,255,'+A(.5)+')');s.o.forEach(function(o,i){x.save();x.translate(cx,cy);x.rotate(o.a);x.strokeStyle='rgba(110,130,255,'+A(.12)+')';x.lineWidth=1;x.beginPath();x.ellipse(0,0,o.rx,o.ry,0,0,7);x.stroke();for(var n=0;n<o.n;n++){var g=t*o.v+n*6.283/o.n;mdot(x,Math.cos(g)*o.rx,Math.sin(g)*o.ry,2,(i%2?'rgba(170,120,255,':'rgba(120,160,255,')+A(.6)+')')}x.restore()})}
if(k=='izgara'){var hz=H*.42,vp=W/2;x.lineWidth=1;for(var c=-14;c<=14;c++){x.strokeStyle='rgba(110,120,255,'+A(.11)+')';x.beginPath();x.moveTo(vp+c*12,hz);x.lineTo(vp+c*W*.16,H);x.stroke()}
for(var r=0;r<16;r++){var z=((r+(t*.35)%1)/16),y=hz+(H-hz)*z*z;x.strokeStyle='rgba(150,110,255,'+A(.05+.18*z)+')';x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke()}
x.strokeStyle='rgba(130,140,255,'+A(.18)+')';x.beginPath();x.moveTo(0,hz);x.lineTo(W,hz);x.stroke()}
if(k=='cekirdek'){var cx=W*.6,cy=H*.48,br=.5+.5*Math.sin(t*.9);for(var r=0;r<7;r++){var rr=30+r*42+br*8,ph=(t*.25+r*.15)%1;x.strokeStyle='rgba('+(r%2?'150,110,255':'100,140,255')+','+A(.05+.13*(1-r/7))+')';x.lineWidth=1.2;x.beginPath();x.arc(cx,cy,rr,ph*6.283,ph*6.283+4.4);x.stroke()}
var pr=((t*.3)%1)*320;x.strokeStyle='rgba(140,140,255,'+A(.16*(1-pr/320))+')';x.beginPath();x.arc(cx,cy,pr,0,7);x.stroke();mdot(x,cx,cy,8+3*br,'rgba(140,130,255,'+A(.35)+')')}
}
// Ayarlar › Görünüm sayfası
P.tema=function(){var h='<p class="h">Görünüm</p><p class="s">Tema ve hareketli arka planlar · içerik ve yazılar sabit kalır</p>';
h+='<div class="card"><div class="kr"><div>Tema<div class="hn">Koyu veya açık zemin</div></div><span style="display:flex;gap:6px"><button class="bt'+(S.theme!='light'?' on':'')+'" onclick="if(S.theme==\'light\')togTheme();render()">Koyu</button><button class="bt'+(S.theme=='light'?' on':'')+'" onclick="if(S.theme!=\'light\')togTheme();render()">Açık</button></span></div>'+
'<div class="kr"><div>Hız</div><span style="display:flex;gap:6px"><button class="bt'+(S.mspeed=='yavas'?' on':'')+'" onclick="S.mspeed=\'yavas\';save();render()">Yavaş</button><button class="bt'+(S.mspeed!='yavas'?' on':'')+'" onclick="S.mspeed=\'normal\';save();render()">Normal</button></span></div>'+
'<div class="kr"><div>Yoğunluk</div><span style="display:flex;gap:6px"><button class="bt'+(S.mdens!='belirgin'?' on':'')+'" onclick="S.mdens=\'hafif\';save();render()">Hafif</button><button class="bt'+(S.mdens=='belirgin'?' on':'')+'" onclick="S.mdens=\'belirgin\';save();render()">Belirgin</button></span></div>'+(MO.reduced?'<div class="hn" style="margin-top:6px;color:#f6d28a">Windows’ta “animasyonları azalt” açık olduğu için hareket kapalı.</div>':'')+'</div>';
h+='<p class="h" style="margin-top:14px">Hareketli tema</p><p class="s">Seçince hemen uygulanır · pencere arkadayken durur</p><div class="gr" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">'+MT.map(function(m){var on=(S.motion||'kapali')==m[0];return '<div class="pc'+(on?' on':'')+'" onclick="mSet(\''+m[0]+'\')"><div class="ch" style="margin:0 0 2px"><i class="ti '+({kapali:'ti-circle-off',sinir:'ti-affiliate',devre:'ti-cpu',veri:'ti-database',dalga:'ti-wave-sine',aurora:'ti-sparkles',kuantum:'ti-atom',izgara:'ti-grid-dots',cekirdek:'ti-brain',yildiz:'ti-stars'}[m[0]])+'"></i>'+m[1]+'</div><div class="hn">'+m[2]+'</div></div>'}).join('')+'</div>';return h};
setTimeout(mApply,50);
