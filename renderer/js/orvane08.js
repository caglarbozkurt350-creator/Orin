// Orvane 0.8.0 · Tasarım temeli (Aşama 2) + çekirdek yardımcılar
// cam.js'ten ÖNCE yüklenir (eski cam arayüz ve eski açılış efekti 0.8.0'da varsayılan kapalıdır; Ayarlar'dan açılabilir).
// Sonraki sayfa ajanlarının kullanacağı API: ORV.ikon / ORV.svg / ORV.logo / ORV.tema / ORV.gecisAl / ORV.ayar / ORV.sayfa (orvane08-kabuk.js) / gecis()
// Ayar anahtarları (S üzerinde, durum.json içinde kalıcı; masaüstüne özgü, telefona eşitlenmez):
//   S.orvTema   : 'turuncu'|'nane'|'okyanus'|'lavanta'|'gul'|'altin'   (varsayılan turuncu)
//   S.orvGecis  : 'akiskan'|'kaydir'|'yakinlas'|'sol'|'yok'            (varsayılan akiskan)
//   S.orvAcilis : false ise açılış ekranı gösterilmez                   (varsayılan açık)
//   S.orvAuto   : false ise panel işaretçi çıkınca daralmaz            (varsayılan açık)
//   S.orvGizli  : true ise kategori sekmesi tamamen gizli
var ORV=window.ORV||{};
ORV.surum='0.8.0';

// ---------- Ayar yardımcıları ----------
ORV.ayarAl=function(k,v){return (typeof S!='undefined'&&S&&S[k]!==undefined)?S[k]:v};
ORV.ayar=function(k,v){S[k]=v;if(typeof save=='function')save();return v};
ORV.azalt=function(){try{return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){return false}};

// ---------- Eski cam arayüz: yeni tasarım varsayılan olarak onun yerine geçer (bir kez) ----------
(function(){var h=document.documentElement;h.classList.add('orv');if(typeof INFO!='undefined'&&INFO.smoke)h.classList.add('orv-smoke'); // gizli smoke penceresinde geçişler ilerlemez; görüntüler kararlı olsun
 
 if(typeof S!='undefined'&&S&&!S.orv08){S.orv08=1;if(S.cam!==false)S.cam=false;if(typeof save=='function')save()}})();

// ---------- Temalar (yalnız vurgu rengi; yerleşim aynı) ----------
ORV.TEMA={
 turuncu:{ad:'Turuncu',acc:'#ff5b37',acc2:'#ffb020'},
 nane:{ad:'Nane',acc:'#2fbf8a',acc2:'#9be7c4'},
 okyanus:{ad:'Okyanus',acc:'#3b82f6',acc2:'#5fe0f5'},
 lavanta:{ad:'Lavanta',acc:'#8b5cf6',acc2:'#c4b0ff'},
 gul:{ad:'Gül',acc:'#e1488f',acc2:'#ff9ad4'},
 altin:{ad:'Altın',acc:'#d4921c',acc2:'#fde68a'}
};
ORV.temaAl=function(){var k=ORV.ayarAl('orvTema','turuncu');return ORV.TEMA[k]?k:'turuncu'};
// k: tema anahtarı. data-tema hem <html> hem <body> üzerinde durur; renkler CSS değişkeni olarak (--acc, --acc2) gelir.
ORV.tema=function(k,kaydetme){if(!ORV.TEMA[k])k='turuncu';
 document.documentElement.setAttribute('data-tema',k);if(document.body)document.body.setAttribute('data-tema',k);
 if(!kaydetme&&S.orvTema!==k)ORV.ayar('orvTema',k);
 try{window.dispatchEvent(new CustomEvent('orv-tema',{detail:k}))}catch(e){}
 return k};

// ---------- Çizgi simgeler (24x24, çizgi) ve squircle bileşeni ----------
ORV.IKON={
 ev:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 kalp:'<path d="M12 20.5s-7.5-4.4-9.2-9.1C1.6 8 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.8 1.3-1.7 2.9-2.8 4.9-2.8 3.5 0 5.5 3.5 4.3 6.9-1.7 4.7-9.2 9.1-9.2 9.1z"/>',
 arti:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
 kisi:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
 kisiler:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14c2.2.7 3.5 3 3.5 6"/>',
 zil:'<path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 0 0 4 0"/>',
 gunes:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 kronometre:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
 ara:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 kapat:'<path d="M6 6l12 12M18 6 6 18"/>',
 sag:'<path d="m9 6 6 6-6 6"/>',
 sol:'<path d="m15 6-6 6 6 6"/>',
 asagi:'<path d="m6 9 6 6 6-6"/>',
 yukari:'<path d="m6 15 6-6 6 6"/>',
 ayrik:'<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>',
 simsek:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
 cop:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 ekle:'<path d="M12 5v14M5 12h14"/>',
 tik:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 yenile:'<path d="M20 11a8 8 0 0 0-14-4.5L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4.5L20 15M20 20v-5h-5"/>',
 disli:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 para:'<path d="M12 2.5v19M16.5 7c-.9-1.5-2.6-2.3-4.5-2.3-2.6 0-4.5 1.3-4.5 3.2 0 4.6 9 2 9 6.6 0 1.9-1.9 3.2-4.5 3.2-2 0-3.8-.9-4.7-2.4"/>',
 nabiz:'<path d="M3 12h4l2-6 4 12 2-6h6"/>',
 sepet:'<path d="M3 4h2l2.4 11h10.2L20 8H6.2"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>',
 canta:'<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>',
 liste:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"/>',
 resim:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.7"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
 agac:'<rect x="9" y="3" width="6" height="5" rx="1.5"/><rect x="3" y="16" width="6" height="5" rx="1.5"/><rect x="15" y="16" width="6" height="5" rx="1.5"/><path d="M12 8v4M6 16v-4h12v4"/>',
 indir:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
 takvim:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 defter:'<path d="M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z"/><path d="M6 3v18M10 8h5M10 12h5"/>',
 klasor:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 grafik:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 durdur:'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
 oynat:'<path d="M7 5v14l12-7z"/>',
 gonder:'<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
 not:'<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8 12h8M8 16h5"/>',
 kilit:'<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 uyari:'<path d="M12 3 2.5 20h19z"/><path d="M12 10v5M12 18v.1"/>',
 gorev:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
 onay:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 13l2.2 2.2L15.5 11"/>',
 mesaj:'<path d="M4 5h16v11H9l-5 4z"/>',
 gecmis:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 8v4l3 2"/>',
 bina:'<path d="M3 21h18"/><path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21"/><path d="M9 7h1.5M13.5 7H15M9 10.5h1.5M13.5 10.5H15M9 14h1.5M13.5 14H15"/><path d="M10.5 21v-3.5h3V21"/>',
 mikrofon:'<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'
};
// Düz çizgi simge (SVG metni)
ORV.svg=function(ad,boyut,kalinlik){boyut=boyut||20;return '<svg width="'+boyut+'" height="'+boyut+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(kalinlik||2.2)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ORV.IKON[ad]||'')+'</svg>'};
// Squircle simge kutucuğu. o: {boyut:34, renk:['#a','#b'] (verilmezse tema rengi), sinif:'ic-ev', yuvarlak:true}
ORV.ikon=function(ad,o){o=o||{};var r=o.renk,st=(o.boyut?'--bs:'+o.boyut+'px;':'')+(r?'--a:'+r[0]+';--b:'+r[1]+';':''),
 c='orv-sq'+(r?'':' tema')+(o.yuvarlak?' yuvarlak':'')+(o.sinif?' '+o.sinif:'');
 return '<span class="'+c+'" style="'+st+(o.stil||'')+'">'+ORV.svg(ad,20,2.2)+'</span>'};
// Takvim yaprağı kutucuğu (İş Günleri): ÇAR / 18
ORV.tarihKutu=function(d,boyut){d=d||new Date();var G=['PAZ','PZT','SAL','ÇAR','PER','CUM','CMT'];
 return '<span class="orv-sq duz ic-date" style="'+(boyut?'--bs:'+boyut+'px;':'')+'flex-direction:column"><span style="font-size:9px;line-height:10px;font-weight:700;letter-spacing:1px;color:#ff6b5a">'+G[d.getDay()]+'</span><span style="font-size:18px;line-height:20px;font-weight:600;color:#f2f2f3">'+d.getDate()+'</span></span>'};
// ORVANE simgesi: tema renginde degradeli kutucuk + beyaz "O" halkası + süzülen nokta
ORV._lg=0;
ORV.logo=function(boyut){var id='orvlg'+(++ORV._lg);boyut=boyut||32;
 return '<svg width="'+boyut+'" height="'+boyut+'" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--acc2,#ffb020)"/><stop offset="1" style="stop-color:var(--acc,#ff5b37)"/></linearGradient></defs><rect x="4" y="4" width="92" height="92" rx="26" fill="url(#'+id+')"/><path d="M 14 40 Q 14 14 40 14 H 60 Q 86 14 86 40 V 44 Q 50 34 14 50 Z" fill="#fff" opacity=".18"/><circle cx="50" cy="52" r="21" fill="none" stroke="#fff" stroke-width="9"/><circle r="5.5" fill="#fff"><animateMotion dur="6s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".45 0 .55 1" path="M 82 52 A 32 32 0 1 1 18 52 A 32 32 0 1 1 82 52"/></circle></svg>'};

// ---------- Sayfa geçişleri ----------
ORV.GECIS=[['akiskan','Akışkan'],['kaydir','Kaydır'],['yakinlas','Yakınlaş'],['sol','Solma'],['yok','Kapalı']];
ORV.gecisAl=function(){var k=ORV.ayarAl('orvGecis','akiskan');return ORV.GECIS.some(function(x){return x[0]==k})?k:'akiskan'};
ORV.gecisSet=function(k){if(!ORV.GECIS.some(function(x){return x[0]==k}))k='akiskan';ORV.ayar('orvGecis',k);return k};
// gecis(fn[,{mod,zorla}]): tek geçiş fonksiyonu. Çıkış (≈0,35 sn: eski kartlar sırayla bulanıklaşıp kaybolur, cam panel solar) → fn() → giriş (yeni kartlar bulanıktan netleşir).
// Hareket azalt açıkken, mod 'yok' iken ve smoke testinde (zorla verilmedikçe) fn hemen çalışır.
var _gcT=null,_gcBusy=false;
function gecisGiris(mod,zorla){var ct=document.getElementById('ct');if(!ct)return;
 mod=mod||ORV.gecisAl();if(mod=='yok'||ORV.azalt()||(typeof INFO!='undefined'&&INFO.smoke&&!zorla))return;
 ct.classList.remove('orv-in');['akiskan','kaydir','yakinlas','sol'].forEach(function(m){ct.classList.remove('tr-'+m)});
 void ct.offsetWidth;ct.classList.add('orv-in','tr-'+mod);clearTimeout(ct._orvT);ct._orvT=setTimeout(function(){ct.classList.remove('orv-in','tr-'+mod)},1500)}
function gecis(fn,o){o=o||{};var mod=o.mod||ORV.gecisAl(),pn=document.querySelector('.pn');
 if(mod=='yok'||ORV.azalt()||(typeof INFO!='undefined'&&INFO.smoke&&!o.zorla)||!pn){fn();return}
 clearTimeout(_gcT);_gcBusy=true;pn.classList.add('orv-out','tr-'+mod);
 _gcT=setTimeout(function(){_gcBusy=false;try{fn()}finally{pn.classList.remove('orv-out','tr-'+mod);gecisGiris(mod,o.zorla)}},mod=='akiskan'?380:300)}
ORV.gecis=gecis;ORV.gecisGiris=gecisGiris;ORV.gecisMesgul=function(){return _gcBusy};

// ---------- Başlangıç: tema uygula ----------
ORV.tema(ORV.temaAl(),true);
document.addEventListener('DOMContentLoaded',function(){document.body.setAttribute('data-tema',ORV.temaAl())});
window.ORV=ORV;
