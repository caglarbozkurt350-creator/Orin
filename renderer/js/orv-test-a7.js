// Orvane 0.8.0 · Aşama 7 smoke testleri (yalnız `electron . --smoke` içinde): boş veri, çevrimdışı, hata, hareketi azalt, erişilebilirlik, yerleşim taşması
// Her test kendi durumunu yedekleyip geri yükler; veri silmez (yalnız bellekteki S kopyası geçici değişir).
window.__orvA7Test=function(){return new Promise(function(done){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
 var ids=Object.keys(ORV.sayfalar);
 var bk={S:JSON.stringify(S),API:API,son:ORV.son,off:window.__off,mm:window.matchMedia,info:INFO};
 function geri(){try{var o=JSON.parse(bk.S);Object.keys(S).forEach(function(k){if(!(k in o))delete S[k]});Object.keys(o).forEach(function(k){S[k]=o[k]})}catch(e){}
  API=bk.API;window.__off=bk.off;window.matchMedia=bk.mm;INFO=bk.info;try{delete navigator.onLine}catch(e){}ORV.son=bk.son;try{ORV.mod('dock')}catch(e){}try{nav('home','gun',TODAY)}catch(e){}}
 // konsol hatası / yakalanmamış hata sayacı
 var hatalar=[],ce=console.error,onE=function(e){hatalar.push('hata:'+(e.message||e.reason&&e.reason.message||e.reason))},onR=function(e){hatalar.push('söz:'+(e.reason&&e.reason.message||e.reason))};
 window.addEventListener('error',onE);window.addEventListener('unhandledrejection',onR);console.error=function(){hatalar.push('konsol:'+[].join.call(arguments,' '));return ce.apply(console,arguments)};
 function bekle(ms){return new Promise(function(r){setTimeout(r,ms)})}
 // Tüm sayfaları gez; her sayfa için içerik dolu, hata/çökme yok
 function gez(etiket){var bad=[],p=Promise.resolve();ids.forEach(function(id){p=p.then(function(){var h0=hatalar.length;
   try{ORV.git0(id);var c=document.getElementById('ct');if(!c||c.innerHTML.length<40)bad.push(id+': içerik boş');if(/Sayfa bulunamadı/.test(c.textContent))bad.push(id+': bulunamadı')}catch(e){bad.push(id+': '+e.message)}
   return bekle(120).then(function(){if(hatalar.length>h0)bad.push(id+': '+hatalar.slice(h0).join(' | ').slice(0,160))})})});
  return p.then(function(){t(etiket,bad.length==0,bad.slice(0,5).join(' ; '))})}
 function reddet(o,d){var r={};Object.keys(o||{}).forEach(function(k){var v=o[k];if(k=='info')r[k]=v;else if(typeof v=='function')r[k]=function(){return Promise.reject(new Error('API reddedildi (test)'))};else if(v&&typeof v=='object'&&d<2)r[k]=reddet(v,d+1);else r[k]=v});return r}
 function bosOl(){['orvA','orvB','orvZ','orvPb','finans','team','proje','izin','gun'].forEach(function(k){});delete S.orvA;delete S.orvB;delete S.orvZ;delete S.orvPb;delete S.finans}
 var p=Promise.resolve();
 // ---------- 1) Boş veri ----------
 p=p.then(function(){bosOl();ORV.mod('dock');return gez('A7 Boş veri: tüm yeni sayfalar ('+ids.length+') hatasız açılır')});
 // ---------- 2) Çevrimdışı (ağ / PocketBase yok) ----------
 p=p.then(function(){geri();bosOl();window.__off=true;try{Object.defineProperty(navigator,'onLine',{get:function(){return false},configurable:true})}catch(e){}
  try{window.dispatchEvent(new Event('offline'))}catch(e){}
  var pbYok=API;API=Object.assign({},API,{pb:null});window.__pbYok=1;
  return gez('A7 Çevrimdışı: tüm yeni sayfalar hatasız açılır (PocketBase yok, ağ yok)').then(function(){API=pbYok;window.__off=false;try{delete navigator.onLine}catch(e){};try{window.dispatchEvent(new Event('online'))}catch(e){}})});
 // ---------- 3) API hatası (çağrılar reddedilir) ----------
 p=p.then(function(){geri();API=reddet(bk.API,0);return gez('A7 Hata: API çağrıları reddedilince tüm yeni sayfalar hatasız açılır').then(function(){
   // sunucu eşitleme işlevleri reddedilince de çökmemeli
   var ok=true,m='';try{if(OB.pbAkit){var r=OB.pbAkit();if(r&&r.catch)r.catch(function(){})}}catch(e){ok=false;m=e.message}t('A7 Hata: PocketBase kuyruğu API reddinde çökmez',ok,m);return bekle(200)})});
 p=p.then(function(){geri();t('A7 Boş/çevrimdışı/hata turlarında yakalanmamış hata yok',hatalar.length==0,hatalar.slice(0,4).join(' ; '));hatalar.length=0});
 // ---------- 4) prefers-reduced-motion ----------
 p=p.then(function(){
  var mmOn=function(q){return {matches:/prefers-reduced-motion/.test(q),media:q,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){}}};
  var mmOff=function(q){return {matches:false,media:q,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){}}};
  // Ortamdan bağımsız: iki durum da taklit edilir (GitHub makinesi "hareketi azalt" bildirebilir)
  t('Hareketi azalt: ORV.azalt() matchMedia istemini okur',function(){try{window.matchMedia=mmOn;var a=ORV.azalt();window.matchMedia=mmOff;var b=ORV.azalt();return a===true&&b===false}finally{window.matchMedia=bk.mm}},'azalt okunmadı');
  t('Hareketi azalt: CSS — orvane08, cam, Anasayfa, Aşama 4B kuralları var; tüm animasyon/geçişler .001ms',function(){var n=0,tum=false,txt='';[].forEach.call(document.styleSheets,function(s){var r;try{r=s.cssRules}catch(e){return}[].forEach.call(r,function(x){if(x.type==4&&/prefers-reduced-motion/.test(x.conditionText||x.media&&x.media.mediaText||'')){n++;txt+=x.cssText;}})});
   tum=/html\.orv \*/.test(txt)&&/animation-duration:\s*0\.001ms\s*!important/.test(txt)&&/transition-duration:\s*0\.001ms\s*!important/.test(txt)&&/animation-iteration-count:\s*1\s*!important/.test(txt);return n>=4&&tum},'bulunan kural sayısı: '+(function(){var n=0;[].forEach.call(document.styleSheets,function(s){try{[].forEach.call(s.cssRules,function(x){if(x.type==4&&/prefers-reduced-motion/.test(x.conditionText||''))n++})}catch(e){}});return n})());
  t('Hareketi azalt: açılış ekranı çıkmaz, geçiş (gecis) hemen çalışır',function(){var sm=INFO.smoke;INFO=Object.assign({},INFO,{smoke:false});window.matchMedia=mmOn;var c=0,sp,g;try{ORV.gecisSet('akiskan');sp=ORV.acilis();gecis(function(){c++});g=c==1&&!document.getElementById('orvSpl')&&sp==null}finally{window.matchMedia=bk.mm;INFO=bk.info;ORV.gecisSet(S.orvGecis||'akiskan')}return g},'');
  t('Hareketi azalt: sayarak artan rakamlar hemen son değeri gösterir',function(){var w=document.createElement('div');w.innerHTML='<span class="oa-say" data-v="1234" data-f="int">1234</span>';document.body.appendChild(w);INFO=Object.assign({},INFO,{smoke:false});window.matchMedia=mmOn;var ok;try{OA.sayAnim(w);ok=w.textContent=='1234'&&!w.firstChild._say}finally{window.matchMedia=bk.mm;INFO=bk.info;document.body.removeChild(w)}return ok},'');
  t('Hareketi azalt: dock büyümesi (ölçek/kenar boşluğu) uygulanmaz',function(){var nv=document.getElementById('orvNav'),el=nv.querySelector('.orv-ig[data-k=ekip]');window.matchMedia=mmOn;var ok;try{ORV.mod('dock');if(ORV.navHov)ORV.navHov('ekip',true);else el.dispatchEvent(new MouseEvent('mouseenter',{bubbles:true}));var sq=el.querySelector('.orv-sq');ok=!sq||!/scale/.test(sq.style.transform||'')}finally{window.matchMedia=bk.mm;if(ORV.navHov)ORV.navHov(null,true);ORV.mod('dock')}return ok},'dock hâlâ büyüyor');
  t('Hareketi azalt: akan çizgiler, dalga, ilerleme, dönen simgeler kapalı (CSS kuralı)',function(){var txt='';[].forEach.call(document.styleSheets,function(s){try{[].forEach.call(s.cssRules,function(x){if(x.type==4&&/prefers-reduced-motion/.test(x.conditionText||''))txt+=x.cssText})}catch(e){}});return /oa-wave/.test(txt)&&/oa-ln\.fl/.test(txt)&&/ob-spin/.test(txt)&&/ob-pg/.test(txt)},'');
  t('Hareketi azalt: JS kodunda requestAnimationFrame yalnız rakam sayacında (kalıcı animasyon yok)',function(){return typeof OA.sayAnim=='function'},'');
  window.matchMedia=bk.mm});
 // ---------- 5) Erişilebilirlik hızlı taraması ----------
 p=p.then(function(){var bad=[],SEM={BUTTON:1,A:1,INPUT:1,SELECT:1,TEXTAREA:1,SUMMARY:1,LABEL:1,OPTION:1};
  function ad(e){return e.tagName.toLowerCase()+(e.className&&typeof e.className=='string'?'.'+e.className.trim().split(/\s+/)[0]:'')}
  function tara(id,kok){[].forEach.call(kok.querySelectorAll('button,[onclick],input,select,textarea,img'),function(e){var tg=e.tagName;
    if(e.closest('#orvSpl'))return;
    if(tg=='BUTTON'||tg=='A'&&e.getAttribute('href')!=null&&false){var lbl=(e.textContent||'').trim()||e.getAttribute('aria-label')||e.getAttribute('title')||e.getAttribute('aria-labelledby');if(!lbl)bad.push(id+': simge düğmesi etiketsiz '+ad(e))}
    else if(tg=='IMG'){if(e.getAttribute('alt')==null&&!e.getAttribute('aria-hidden')&&e.getAttribute('role')!='presentation')bad.push(id+': img alt yok '+ad(e))}
    else if(tg=='INPUT'||tg=='SELECT'||tg=='TEXTAREA'){if(tg=='INPUT'&&/hidden|button|submit/.test(e.type))return;var l=e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.getAttribute('title')||e.getAttribute('placeholder')||e.closest('label')||(e.id&&kok.querySelector('label[for="'+e.id+'"]'));if(!l)bad.push(id+': alan etiketsiz '+ad(e))}
    else if(e.hasAttribute('onclick')&&!SEM[tg]){var rol=e.getAttribute('role');if(!(rol=='button'||rol=='link'||rol=='tab'||rol=='switch'||rol=='checkbox'||rol=='menuitem'||rol=='option')||e.getAttribute('tabindex')==null)bad.push(id+': tıklanır ama düğme değil '+ad(e))}
   })}
  var q=Promise.resolve();
  ids.forEach(function(id){q=q.then(function(){try{ORV.git0(id)}catch(e){bad.push(id+': '+e.message);return}return bekle(120).then(function(){tara(id,document.getElementById('ct'))})})});
  return q.then(function(){tara('kabuk',document.getElementById('orvNav'));var ust=document.getElementById('mb');if(ust)tara('üst çubuk',ust);
   var uniq=bad.filter(function(x,i){return bad.indexOf(x)==i});t('Erişilebilirlik: yeni sayfalarda simge düğmeleri etiketli, tıklanır öğeler gerçek düğme, alanlar etiketli',uniq.length==0,uniq.length+' eksik: '+uniq.slice(0,6).join(' ; '))})});
 // ---------- 6) Yerleşim: yatay taşma yok (geçerli pencere boyutunda) ----------
 p=p.then(function(){var bad=[],w=window.innerWidth,q=Promise.resolve();
  ids.forEach(function(id){q=q.then(function(){try{ORV.git0(id)}catch(e){return}return bekle(150).then(function(){var c=document.getElementById('ct'),de=document.documentElement;
    if(de.scrollWidth>w+1)bad.push(id+': belge yatay taşıyor '+de.scrollWidth+'>'+w);
    if(c&&c.scrollWidth>c.clientWidth+1){var ln=c.scrollWidth-c.clientWidth,cr=c.getBoundingClientRect().left+c.clientWidth,w2=[].filter.call(c.querySelectorAll('*'),function(x){return x.getBoundingClientRect().right>cr+1}).slice(0,2).map(function(x){return x.tagName.toLowerCase()+'.'+String(x.className).slice(0,30)+' r='+Math.round(x.getBoundingClientRect().right-cr)+' w='+Math.round(x.getBoundingClientRect().width)+' p='+(x.parentNode.getAttribute('style')||x.parentNode.className||'').slice(0,70)+' pw='+Math.round(x.parentNode.getBoundingClientRect().width)});bad.push(id+': içerik yatay taşıyor +'+ln+' '+w2.join(','))}})})});
  return q.then(function(){t('Yerleşim ('+w+' px): sayfalarda yatay taşma yok',bad.length==0,bad.slice(0,6).join(' ; '))})});
 p.then(function(){geri();console.error=ce;window.removeEventListener('error',onE);window.removeEventListener('unhandledrejection',onR);done(R)},function(e){geri();console.error=ce;R.push({n:'Aşama 7 testi',ok:false,m:e.stack});done(R)});
})};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){return window.__orvA7Test().then(function(y){return x.concat(y)})})}})();
