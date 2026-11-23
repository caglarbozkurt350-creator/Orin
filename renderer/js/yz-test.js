// Orvane · Manuel mod smoke testleri (yalnız `electron . --smoke`).
// Diğer testler arka planda paralel ilerlediği için "kapalı" durumu tek bir eşzamanlı adımda kurulur ve aynı adımda geri alınır;
// ana süreç koruması da 'yz:dene' ile (bayrak yalnız o çağrı boyunca kapalı) sınanır. Böylece başka hiçbir teste sızmaz.
window.__manuelModTest=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
 var bk=S.yzAcik,a0=arg;
 try{
  delete S.yzAcik;
  t('YZ: smoke\'ta varsayılan açık (eski testler)',!yzKapali());
  S.yzAcik=false;
  t('YZ: kapalıyken yzKapali()',yzKapali());
  t('YZ: kapalıyken zekaHazir() false',zekaHazir()===false);
  t('YZ: kapalıyken abnAcik/abnHazir/abnSohbetHazir false',!abnAcik()&&!abnHazir()&&!abnSohbetHazir());
  t('YZ: kapalıyken durum yazısı manuel mod',/manuel mod/.test(yzDurum('orin')),yzDurum('orin'));
  t('YZ: kapalıyken Otto piyasa yorumu yok',fnOttoPiyasa(true)===null);
  t('YZ: kapalıyken toplantı taraması bir şey başlatmaz',tpTara()===undefined);
  t('YZ: kapalıyken nikaIncele söz döndürür',function(){var p=nikaIncele();return p&&typeof p.then=='function'});
  t('YZ: kapalıyken sohbet cevabı söz döndürür',function(){var p=abnCevapla('orin');return p&&typeof p.then=='function'});
  var h='';arg='zeka';h=OB.ayarlar();var i=h.indexOf('id="yz-ayar"'),k=i<0?'':h.slice(i,i+1200);
  t('YZ: Ayarlar › Yapay zekâ kartında anahtar var',i>0&&/role="switch"/.test(k),'kart bulunamadı');
  t('YZ: kapalıyken anahtar kapalı görünür',/aria-checked="false"/.test(k));
  S.yzAcik=true;h=OB.ayarlar();i=h.indexOf('id="yz-ayar"');k=i<0?'':h.slice(i,i+1200);
  t('YZ: açıkken anahtar açık görünür',/aria-checked="true"/.test(k));
 }finally{arg=a0;if(bk===undefined)delete S.yzAcik;else S.yzAcik=bk}
 t('YZ: test sonrası ayar geri alındı',!yzKapali());
 t('İş Günleri: Kayıt gir kartında gün türü listesi (Mazeret izni dahil)',function(){var h=OB.ozet();return /id="obKtur"/.test(h)&&/value="mazeret"/.test(h)&&typeof OB.turAta=='function'});
 var ad=['zeka:sor','isemri:gelistir','jarvis:sor','abonelik:calistir','apify:calisanlar'];
 return Promise.all(ad.map(function(c){return API.yz.dene(c)})).then(function(L){
  L.forEach(function(r,j){t('YZ: ana süreç '+ad[j]+' kapalıyken reddeder',r&&!r.ok&&/kapalı/.test(r.err),r&&r.err)});
  return API.yz.durum()}).then(function(r){t('YZ: ana süreç bayrağı geri alındı (smoke: açık)',r.ok&&r.v.acik===true,JSON.stringify(r));return R},
  function(e){R.push({n:'YZ: ana süreç sınaması çöktü',ok:false,m:String(e&&e.message||e)});return R})};
// Takımın sonunda çalışır. (Ad __manuelModTest: v071.js zaten __yzTest kullanıyor.)
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__manuelModTest()}catch(e){y=Promise.resolve([{n:'YZ: test çöktü',ok:false,m:String(e&&e.message||e)}])}return y.then(function(y){return x.concat(y)})})}})();
