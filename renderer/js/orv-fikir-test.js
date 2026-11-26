// Orvane 0.9.11 · "Geliştirme fikri iste" smoke testleri (yalnız `electron . --smoke`). Durum geri alınır; Claude Code çalıştırılmaz.
window.__fikirTasarimTest=function(){var R=[];
 function t(n,c,m){try{var ok=typeof c=='function'?c():c;R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}catch(e){R.push({n:n,ok:false,m:e.message})}}
 var y=S.fikirTasarim?JSON.stringify(S.fikirTasarim):null,yen=ORV.yenile;
 try{
  ORV.yenile=function(){};delete S.fikirTasarim;
  t('Anasayfa: Geliştirme fikirleri şeridi ve düğmesi var; kart sayısı değişmez',function(){var h=OA.anasayfa();return /ft-serit/.test(h)&&/Geliştirme fikri iste/.test(h)&&h.indexOf('ft-serit')<h.indexOf('oa-grid5')&&!/ft-serit[^"]*oa-card/.test(h)});
  FT.st().son={durum:'hazir',ts:Date.now(),ad:'gelistirme-fikirleri-2026-11-26-10-00-00',link:'https://claude.ai/artifact/abc123',kaynak:'telefon',fikirler:[{baslik:'Fikir <bir>'},{baslik:'Fikir iki'}]};
  t('Hazır sonuç: fikir başlıkları (kaçışlı), “Tasarımları aç”, telefondan işareti',function(){var h=FT.serit();return /Tasarımları aç/.test(h)&&/Fikir &lt;bir&gt;/.test(h)&&/telefondan/.test(h)&&!/Promptu kopyala/.test(h)});
  FT.st().son={durum:'hata',ts:Date.now(),ad:'gelistirme-fikirleri-2026-11-26-10-00-00',hata:'Claude Code girişi yok'};
  t('Hata: neden ve “Promptu kopyala” görünür',function(){var h=FT.serit();return /Claude Code girişi yok/.test(h)&&/Promptu kopyala/.test(h)&&/Yapılamadı/.test(h)});
  FT.st().son={durum:'calisiyor',ts:Date.now()};
  t('Çalışırken düğme kapalı',function(){var h=FT.serit();return /disabled/.test(h)&&/Hazırlanıyor…/.test(h)});
  FT.st().son={durum:'hazir',ts:1,link:'https://claude.ai/artifact/x',fikirler:[{baslik:'A'},{baslik:'B'}]};
  t('Telefon özeti: fikirTasarim bloğu (durum, link, başlıklar)',function(){var o=bulutOzet().fikirTasarim;return o&&o.durum=='hazir'&&o.link=='https://claude.ai/artifact/x'&&o.fikirler.join()=='A,B'});
  var b0=FT.baslat,n=0;FT.baslat=function(){n++;return Promise.resolve(null)};
  try{bulutUygula({id:'ft-e1',tur:'fikir_tasarim',ts:Date.now(),veri:{}});bulutUygula({id:'ft-e1',tur:'fikir_tasarim',ts:Date.now(),veri:{}})}finally{FT.baslat=b0}
  t('Telefondan gelen fikir_tasarim olayı kaydedilir, aynı olay iki kez işlenmez (testte Claude çalışmaz)',FT.st().olay.filter(function(x){return x=='ft-e1'}).length==1&&n==0);
 }finally{ORV.yenile=yen;if(y)S.fikirTasarim=JSON.parse(y);else delete S.fikirTasarim}
 return R};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){var y;try{y=window.__fikirTasarimTest()}catch(e){y=[{n:'Geliştirme fikirleri: test çöktü',ok:false,m:e.message}]}
 // Ana süreç: prompt kaynak klasörden bağlam toplar (sürüm notu, onaylananlar, ekip yasağı)
 if(!API||!API.fikirTasarim)return x.concat(y);
 return API.fikirTasarim.hazirla({kaynak:'test'}).then(function(r){
  if(!r.ok){y.push({n:'Prompt hazırlanır (kaynak klasör yoksa atlanır)',ok:/kaynak klasörü/.test(r.err),m:r.err});return x.concat(y)}
  y.push({n:'Prompt Giden klasörüne yazılır',ok:/gelistirme-fikirleri-\d{4}/.test(r.v.ad)&&/Giden/.test(r.v.md),m:r.v.md});
  return x.concat(y)})})}})();
