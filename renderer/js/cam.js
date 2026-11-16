// Orvane 0.7.24 · Cam arayüz: duvar kağıdı seçimi, genişleyen gezinme paneli, açılış efekti D.
// Stiller renderer/cam.css'te. Yalnız koyu temada görünür; açık temada eski görünüm aynen kalır.
// Ayarlar: S.cam (aç/kapa), S.camDuv (duvar kağıdı), S.camHafif (bulanıklık kapalı), S.camGen (gezinme paneli geniş).
var CAM_DUV=[
 ['gece','Gece mavisi','radial-gradient(900px 600px at 20% 15%,#4b6bff 0%,transparent 60%),radial-gradient(800px 600px at 85% 90%,#9b4dff 0%,transparent 60%),linear-gradient(135deg,#141a3d,#2a1559)'],
 ['okyanus','Okyanus','radial-gradient(900px 640px at 15% 20%,#1fa3c9 0%,transparent 62%),radial-gradient(760px 600px at 90% 85%,#2f5bd8 0%,transparent 60%),linear-gradient(140deg,#071c2e,#0d2f52)'],
 ['gunbatimi','Gün batımı','radial-gradient(900px 620px at 18% 18%,#ff7a59 0%,transparent 60%),radial-gradient(820px 620px at 88% 88%,#b2459c 0%,transparent 60%),linear-gradient(135deg,#2a1230,#3d1a3f)'],
 ['orman','Orman','radial-gradient(900px 620px at 20% 20%,#2fb37e 0%,transparent 60%),radial-gradient(780px 600px at 85% 85%,#1d7a8c 0%,transparent 60%),linear-gradient(135deg,#0c2420,#123534)'],
 ['aurora','Aurora','radial-gradient(800px 560px at 25% 10%,#4fe3c1 0%,transparent 58%),radial-gradient(760px 600px at 75% 60%,#7b5cff 0%,transparent 60%),radial-gradient(700px 500px at 10% 95%,#2f7bf5 0%,transparent 60%),linear-gradient(160deg,#0b1030,#1b1446)'],
 ['grafit','Grafit','radial-gradient(900px 620px at 20% 15%,#4a4f63 0%,transparent 62%),radial-gradient(800px 600px at 85% 90%,#2c3044 0%,transparent 60%),linear-gradient(135deg,#141518,#1f2129)']
];
function camDuv(k){for(var i=0;i<CAM_DUV.length;i++)if(CAM_DUV[i][0]==k)return CAM_DUV[i];return CAM_DUV[0]}
function camAcik(){return S.cam!==false}
function camUygula(){var h=document.documentElement,on=camAcik();
 h.classList.toggle('cam',on);h.classList.toggle('cam-hafif',on&&!!S.camHafif);h.classList.toggle('cam-gen',on&&!!S.camGen);
 var bg=document.getElementById('camBg');if(!bg){bg=document.createElement('div');bg.id='camBg';bg.setAttribute('aria-hidden','true');document.body.insertBefore(bg,document.body.firstChild)}
 bg.style.backgroundImage=camDuv(S.camDuv)[2];
 var g=document.getElementById('r_gen');if(g){g.title=S.camGen?'Paneli daralt':'Paneli genişlet';g.setAttribute('data-l',S.camGen?'Daralt':'Genişlet');g.innerHTML='<i class="ti '+(S.camGen?'ti-layout-sidebar-left-collapse':'ti-layout-sidebar-left-expand')+'"></i>'}}
function camSet(k,v){S[k]=v;save();camUygula();if(pg=='tema')render()}
function camGen(){camSet('camGen',!S.camGen)}
// Gezinme düğmelerine yazı etiketi (genişleyince görünür) ve en üste genişlet/daralt düğmesi
function camRail(){var r=document.getElementById('rail');if(!r)return;
 [].forEach.call(r.querySelectorAll('.rb'),function(b){if(!b.getAttribute('data-l')&&b.title)b.setAttribute('data-l',b.title)});
 if(!document.getElementById('r_gen')){var g=document.createElement('div');g.className='rb';g.id='r_gen';g.onclick=camGen;r.insertBefore(g,r.firstChild)}}
// Açılış efekti D: cam panel yükselir, ORVANE, "Ekip hazırlanıyor", ilerleme çubuğu. Testte ve kapalıyken gösterilmez.
function camAcilis(){if(INFO.smoke||!camAcik()||S.theme=='light'||document.getElementById('acilis'))return;
 var a=document.createElement('div');a.id='acilis';if(S.camHafif)a.className='hafif';a.setAttribute('aria-hidden','true');
 a.innerHTML='<div class="ap"><div class="ad">ORVANE</div><div class="as">Ekip hazırlanıyor</div><div class="ab"><i></i></div></div>';
 document.body.appendChild(a);var kapat=function(){if(!a.parentNode)return;a.classList.add('git');setTimeout(function(){if(a.parentNode)a.parentNode.removeChild(a)},500)};
 a.onclick=kapat;setTimeout(kapat,1900)}
// Ayarlar › Görünüm sayfasının başına cam ayarları
(function(){var eski=P.tema;P.tema=function(){var h=eski?eski():'',on=camAcik(),bt=function(a,y,f){return '<button class="bt'+(a?' on':'')+'" onclick="'+f+'">'+y+'</button>'};
 var c='<p class="h">Cam arayüz</p><p class="s">Yarı saydam paneller ve duvar kağıdı · yalnız koyu temada görünür</p><div class="card camset">'+
 '<div class="kr"><div>Cam arayüz<div class="hn">Kapalıyken eski düz görünüm</div></div><span style="display:flex;gap:6px">'+bt(on,'Açık',"camSet('cam',true)")+bt(!on,'Kapalı',"camSet('cam',false)")+'</span></div>'+
 '<div class="kr"><div>Hafif mod<div class="hn">Bulanıklığı kapatır · yavaş bilgisayarda akıcı olur</div></div><span style="display:flex;gap:6px">'+bt(!S.camHafif,'Kapalı',"camSet('camHafif',false)")+bt(!!S.camHafif,'Açık',"camSet('camHafif',true)")+'</span></div>'+
 '<div class="kr"><div>Gezinme paneli<div class="hn">Genişken simgelerin yanında adları yazar</div></div><span style="display:flex;gap:6px">'+bt(!S.camGen,'Dar',"camSet('camGen',false)")+bt(!!S.camGen,'Geniş',"camSet('camGen',true)")+'</span></div>'+
 '<div class="hn" style="margin:8px 0 6px">Duvar kağıdı</div><div class="gr" style="grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px">'+
 CAM_DUV.map(function(d){return '<div class="duv'+(camDuv(S.camDuv)[0]==d[0]?' on':'')+'" style="background-image:'+d[2]+'" role="button" tabindex="0" aria-label="Duvar kağıdı '+d[1]+'" onclick="camSet(\'camDuv\',\''+d[0]+'\')" onkeydown="if(event.key==\'Enter\')this.click()">'+d[1]+'</div>'}).join('')+
 '</div>'+(S.theme=='light'?'<div class="hn" style="margin-top:8px">Açık temadasın; cam görünüm koyu temaya geçince görünür.</div>':'')+'</div>';
 var i=h.indexOf('</p>',h.indexOf('</p>')+4);return i>0?h.slice(0,i+4)+c+'<p class="h" style="margin-top:14px">Tema</p>'+h.slice(i+4):c+h}})();
// Görünüm menüsüne kısayol: Ctrl+Shift+G paneli genişletir/daraltır
document.addEventListener('keydown',function(e){if(e.ctrlKey&&e.shiftKey&&(e.key=='G'||e.key=='g')){e.preventDefault();if(camAcik())camGen()}});
camRail();camUygula();camAcilis();
window.__camTest=function(){var R=[],bk={cam:S.cam,duv:S.camDuv,haf:S.camHafif,gen:S.camGen,th:S.theme},h=document.documentElement;function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
 try{S.theme='dark';applyTheme();
 camSet('cam',true);t('Cam: html.cam açıldı',h.classList.contains('cam'));
 t('Cam: duvar kağıdı katmanı var',!!document.getElementById('camBg'));
 camSet('camDuv','orman');t('Cam: duvar kağıdı değişti',/rgb\(47, 179, 126\)|#2fb37e/i.test(document.getElementById('camBg').style.backgroundImage));
 camSet('camDuv','yok-boyle');t('Cam: bilinmeyen duvar kağıdı varsayılana döner',camDuv(S.camDuv)[0]=='gece');
 camSet('camGen',true);t('Cam: panel genişledi',h.classList.contains('cam-gen')&&document.getElementById('r_gen').getAttribute('data-l')=='Daralt');
 camSet('camGen',false);t('Cam: panel daraldı',!h.classList.contains('cam-gen'));
 t('Cam: gezinme düğmelerinde etiket var',[].every.call(document.querySelectorAll('#rail .rb'),function(b){return !!b.getAttribute('data-l')}));
 camSet('camHafif',true);t('Cam: hafif mod',h.classList.contains('cam-hafif'));
 camSet('cam',false);t('Cam: kapatınca sınıflar kalkar',!h.classList.contains('cam')&&!h.classList.contains('cam-hafif'));
 var p=P.tema();t('Cam: Görünüm sayfasında 6 duvar kağıdı',(p.match(/class="duv/g)||[]).length==6&&p.indexOf('Hareketli tema')>0);
 t('Cam: testte açılış efekti çıkmaz',!INFO.smoke||!document.getElementById('acilis'));
 }catch(e){t('Cam testi',false,e.stack)}
 S.cam=bk.cam;S.camDuv=bk.duv;S.camHafif=bk.haf;S.camGen=bk.gen;S.theme=bk.th;applyTheme();camUygula();save();return R};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){return x.concat(window.__camTest())})}})();
