// ========================================================================
// Orvane 0.9.11 · "Geliştirme fikri iste" düğmesi (Anasayfa) ve telefondan gelen istek.
// Düğme: ana süreçteki fikir-tasarim.js prompt'u yazar ve Claude Code'u aboneliğinde "tasarim" kipinde çalıştırır;
// Claude son düzenlemelere bakıp 5 fikir çıkarır, tasarımlarını Claude Design tuvaline yayınlar. Sonuç (tuval linki, fikirler) kartta görünür.
// Yapay zekâ kapalıysa ya da Claude Code çalışamazsa prompt dosyası yine yazılır; "Promptu kopyala" onu panoya alır ve claude.ai'yi açar.
// Telefondan gelen olay: fikir_tasarim {id}. Telefona giden özete fikirTasarim {durum, ts, link, hata, fikirler[başlık]} eklenir.
// Telefondaki karşılığı: mobil/src/ekran/Anasayfa.tsx → FikirTasarimKart. Birini değiştirirken ötekini de güncelle.
// ========================================================================
var FT={mesgul:false,DUR:{calisiyor:'Hazırlanıyor · Claude son düzenlemelere bakıp fikir ve tasarım çıkarıyor',hazir:'Hazır',tasarimsiz:'Fikirler hazır · tasarım yayınlanamadı',hata:'Yapılamadı',istem:'Prompt hazır'}};
FT.st=function(){S.fikirTasarim=S.fikirTasarim||{olay:[]};S.fikirTasarim.olay=S.fikirTasarim.olay||[];return S.fikirTasarim};
FT.yenile=function(){if(typeof area!='undefined'&&area=='orv'&&typeof pg!='undefined'&&pg=='anasayfa'&&typeof ORV!='undefined')ORV.yenile();if(typeof bulutTick=='function'&&!INFO.smoke)bulutTick()};
FT.kaydet=function(v){var s=FT.st();s.son=Object.assign({ts:Date.now()},v||{});save();FT.yenile();return s.son};
// Düğme: yapay zekâ açıksa Claude Code çalışır; kapalıysa yalnız prompt hazırlanır ve panoya kopyalanır
FT.baslat=function(kaynak){if(FT.mesgul||!API||!API.fikirTasarim)return Promise.resolve(null);kaynak=kaynak||'masaustu';
 if(typeof yzKapali=='function'&&yzKapali())return FT.hazirla(kaynak);
 FT.mesgul=true;FT.kaydet({durum:'calisiyor',kaynak:kaynak});if(!INFO.smoke)toast('Geliştirme fikirleri hazırlanıyor (Claude Code, ~15–30 dk)');
 return API.fikirTasarim.baslat({kaynak:kaynak}).then(function(r){var v=r.ok?r.v:{durum:'hata',hata:r.err};
  FT.kaydet({durum:v.durum,kaynak:kaynak,ad:v.ad,link:v.link||'',hata:v.hata||'',fikirler:(v.fikirler||[]).map(function(f){return{baslik:f.baslik,aciklama:f.aciklama}}),metin:String(v.metin||'').slice(0,1500)});
  if(!INFO.smoke)toast(v.durum=='hazir'?'Geliştirme fikirleri ve tasarımlar hazır':v.durum=='tasarimsiz'?'Fikirler hazır; tasarım yayınlanamadı':'Geliştirme fikirleri hazırlanamadı: '+(v.hata||''));return v})
 .then(function(v){FT.mesgul=false;return v},function(e){FT.mesgul=false;FT.kaydet({durum:'hata',kaynak:kaynak,hata:String(e&&e.message||e)});return null})};
FT.hazirla=function(kaynak){return API.fikirTasarim.hazirla({kaynak:kaynak}).then(function(r){if(!r.ok){FT.kaydet({durum:'hata',kaynak:kaynak,hata:r.err});return null}
 FT.kaydet({durum:'istem',kaynak:kaynak,ad:r.v.ad,hata:'Yapay zekâ kapalı: prompt yazıldı (Belgeler\\Orin\\Giden). Kopyalayıp Claude’a yapıştır.'});if(kaynak=='masaustu')FT.kopyala();return r.v})};
FT.kopyala=function(){var s=FT.st().son;if(!s||!s.ad)return Promise.resolve(false);return API.fikirTasarim.kopyala(s.ad).then(function(r){if(!INFO.smoke)toast(r.ok?'Prompt panoya kopyalandı; açılan Claude sohbetine yapıştır':'Kopyalanamadı: '+r.err);return r.ok})};
FT.ac=function(){var s=FT.st().son;if(s&&s.link&&/^https:\/\/claude\.ai\//.test(s.link))API.external(s.link)};
// Anasayfa şeridi (kart sayısını değiştirmez: oa-card sınıfı kullanılmaz)
FT.serit=function(){var s=FT.st().son,d=s&&s.durum,calis=FT.mesgul||d=='calisiyor';
 var h='<section class="ft-serit" aria-label="Geliştirme fikirleri" style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:0 0 16px;padding:14px 18px;border-radius:22px;background:var(--cam);border:1px solid var(--cam-kenar)">';
 h+='<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" stroke-width="2" stroke-linecap="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg>';
 h+='<div style="flex:1 1 260px;min-width:0"><b style="font-size:14px">Geliştirme fikirleri</b><div style="font-size:12.5px;color:var(--yazi2);margin-top:2px">'+(d?esc(FT.DUR[d]||d)+(s.ts?' · '+new Date(s.ts).toLocaleString('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'')+(s.kaynak=='telefon'?' · telefondan':''):'Son düzenlemelere bakıp yeni fikirler ve Claude Design tasarımları hazırlatır')+'</div>';
 if(s&&s.hata&&d!='calisiyor')h+='<div style="font-size:12px;color:#ffc46b;margin-top:4px">'+esc(String(s.hata).slice(0,200))+'</div>';
 if(s&&s.fikirler&&s.fikirler.length&&!calis)h+='<ol style="margin:8px 0 0;padding-left:18px;font-size:13px;line-height:1.6">'+s.fikirler.slice(0,5).map(function(f){return '<li>'+esc(f.baslik)+'</li>'}).join('')+'</ol>';
 h+='</div><div style="display:flex;flex-wrap:wrap;gap:8px">';
 if(s&&s.link&&!calis)h+='<button type="button" class="oa-btn sm" onclick="FT.ac()">Tasarımları aç</button>';
 if(s&&s.ad&&!calis&&d!='hazir')h+='<button type="button" class="oa-btn ghost sm" onclick="FT.kopyala()">Promptu kopyala</button>';
 h+='<button type="button" class="oa-btn '+(s&&s.link?'ghost ':'')+'sm" onclick="FT.baslat()"'+(calis?' disabled aria-busy="true"':'')+'>'+(calis?'Hazırlanıyor…':'Geliştirme fikri iste')+'</button></div></section>';
 return h};
(function(){if(typeof OA=='undefined'||typeof OA.anasayfa!='function')return;var _a=OA.anasayfa;OA.anasayfa=function(){var h=_a.apply(this,arguments),i=h.indexOf('<div class="oa-grid5');if(i<0)return h;try{return h.slice(0,i)+FT.serit()+h.slice(i)}catch(e){return h}}})();
// Telefon eşitlemesi
(function(){if(typeof bulutOzet!='function')return;var _o=bulutOzet;bulutOzet=function(){var oz=_o.apply(this,arguments);try{var s=FT.st().son;oz.fikirTasarim=s?{durum:FT.mesgul?'calisiyor':s.durum,ts:s.ts,link:s.link||'',hata:s.hata?String(s.hata).slice(0,200):'',kaynak:s.kaynak||'',fikirler:(s.fikirler||[]).slice(0,5).map(function(f){return f.baslik})}:{durum:'',ts:0}}catch(e){}return oz}})();
(function(){if(typeof bulutUygula!='function')return;var _u=bulutUygula;bulutUygula=function(e){if(e&&e.tur=='fikir_tasarim'){var s=FT.st();if(s.olay.indexOf(e.id)>=0)return;s.olay=s.olay.concat([e.id]).slice(-30);save();
 if(e.ts&&Date.now()-e.ts>24*3600e3)return; // bir günden eski istek (bilgisayar kapalıyken) yeniden çalıştırılmaz
 if(!INFO.smoke)FT.baslat('telefon');return}return _u.apply(this,arguments)}})();
// Açılışta son durum ana süreçten (yarıda kalan iş "Yapılamadı" görünür)
setTimeout(function(){if(!API||!API.fikirTasarim||INFO.smoke)return;API.fikirTasarim.durum().then(function(r){if(!r.ok||!r.v||!r.v.son)return;var j=r.v.son,s=FT.st().son;if(s&&s.durum=='calisiyor'&&!r.v.mesgul)FT.kaydet(Object.assign({},s,{durum:'hata',hata:j.hata||'Orvane kapanınca yarıda kaldı'}))})},1500);
