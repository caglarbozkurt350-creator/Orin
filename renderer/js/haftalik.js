// Orvane 0.7.23 · Şirketim › Haftalık rapor (Claude Design tuvali "Orvane · Haftalık rapor", Çağlar onayladı)
// - Pazartesi–Pazar haftası; geçmiş haftalara gidilebilir. Altı özet kutusu ve çalışan kartları kayıtlı verilerden hesaplanır, verisi olmayan değer "—" görünür.
// - Orin'in haftalık değerlendirmesi YALNIZ "Haftayı özetle"ye basınca yazılır (tek abonelik çağrısı); sonuç hafta başına saklanır (S.haftalikOzet).
// - Excel ve PDF: Ayarlar › Dışa aktar ile aynı API.exp yolu.
// Veri kaynakları: görevler (TMS().gorev), gelişim talepleri (TMS().gel), sohbetler, toplantılar, iş emirleri (isS), Echo iş günü kayıtları (E), abonelik (ABN.st), API harcaması (ZK.st).
var HFR={off:0,sort:'hier',yuk:{},hata:{}};
var HFR_GUN=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
var HFR_IZIN=['yillik','mazeret','refakat','rapor13','rapor4','ucretsiz','sevk'];
var HFR_SIRA=[['hier','Hiyerarşi'],['aktif','En aktif'],['geciken','Geciken önce']];

// ---------- Hafta ----------
function hfrBas(off){var d=wkStart();d.setDate(d.getDate()+7*off);return d}
function hfrSinir(off){var s=hfrBas(off),a=[+s];for(var i=1;i<=7;i++){var d=new Date(s);d.setDate(d.getDate()+i);a.push(+d)}return a}
function hfrAnahtar(off){return key(hfrBas(off))}
function hfrAd(off){var a=hfrBas(off),b=new Date(a);b.setDate(b.getDate()+6);
if(a.getFullYear()!=b.getFullYear())return a.getDate()+' '+AY[a.getMonth()]+' '+a.getFullYear()+' – '+b.getDate()+' '+AY[b.getMonth()]+' '+b.getFullYear();
if(a.getMonth()!=b.getMonth())return a.getDate()+' '+AY[a.getMonth()]+' – '+b.getDate()+' '+AY[b.getMonth()]+' '+b.getFullYear();
return a.getDate()+'–'+b.getDate()+' '+AY[a.getMonth()]+' '+b.getFullYear()}
function hfrGit(d){var n=HFR.off+d;if(n>0||n<-104)return;HFR.off=n;render()}
function hfrSirala(k){HFR.sort=k;render()}

// ---------- Hesap ----------
function hfrBitti(s,e,id){return TMS().gorev.filter(function(g){return g.durum=='bitti'&&g.bts>=s&&g.bts<e&&(!id||g.kim==id)})}
function hfrAcik(e,id){return TMS().gorev.filter(function(g){return (g.ts||0)<e&&!(g.durum=='bitti'&&(!g.bts||g.bts<e))&&(!id||g.kim==id)})}
function hfrSon(g){var s=String(g.son||'');if(!s)return null;var m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(m)return +new Date(+m[1],+m[2]-1,+m[3],23,59,59);var t=Date.parse(s);return isNaN(t)?null:t}
function hfrGeciken(L,e){var lim=Math.min(Date.now(),e);return L.filter(function(g){var t=hfrSon(g);return t!=null&&t<lim})}
function hfrGelBekleyen(e){return TMS().gel.filter(function(g){return (g.ts||0)<e&&(['ik','orin','ceo'].indexOf(g.asama)>=0||((g.asama=='tamam'||g.asama=='red')&&onayKararTs(g)>=e))})}
function hfrGelOnay(s,e){return TMS().gel.filter(function(g){if(g.asama!='tamam')return false;var t=onayKararTs(g);return t>=s&&t<e})}
function hfrGun(ts,B){for(var i=0;i<7;i++)if(ts>=B[i]&&ts<B[i+1])return i;return -1}
function hfrTpAbn(s,e){var n=0;(typeof tpS=='function'?tpS():[]).forEach(function(t){(t.mes||[]).forEach(function(m){if(m.r=='o'&&m.ts>=s&&m.ts<e)n++})});return n}
// Abonelik çağrıları kayıtlardan: görev, sohbet cevabı (görev bitiş mesajı çift sayılmaz), toplantı cevabı
function hfrAbn(s,e){var T=TMS(),g=T.gorev.filter(function(x){return x.bts>=s&&x.bts<e&&(x.yol2=='abonelik'||x.abnTur!=null)}).length,sh=0;
Object.keys(T.sohbet).forEach(function(id){(T.sohbet[id]||[]).forEach(function(m){if(m.r=='o'&&m.ts>=s&&m.ts<e&&/^abonelik/.test(m.model||'')&&!/^Görev tamamlandı \(Claude aboneliğinde\)/.test(m.t||''))sh++})});
return{gorev:g,sohbet:sh,toplanti:hfrTpAbn(s,e)}}
function hfrKayitUsd(s,e){var u=0,T=TMS();Object.keys(T.sohbet).forEach(function(id){(T.sohbet[id]||[]).forEach(function(m){if(m.usd&&m.ts>=s&&m.ts<e)u+=m.usd})});T.gorev.forEach(function(g){if(g.usd&&g.bts>=s&&g.bts<e)u+=g.usd});return u}
// API harcaması: güncel ayın günlük defteri; başka aya düşen günler yalnız sohbet/görev kayıtlarındaki dolar tutarından (yoksa bilinmiyor)
function hfrUsd(B){var z=ZK.st;if(!z||!z.anahtar||!z.harcama)return{usd:null};var h=z.harcama,top=0,bil=false,kis=false;
for(var i=0;i<7;i++){var d=new Date(B[i]),ym=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
if(h.ay==ym){top+=(h.gun||{})[d.getDate()]||0;bil=true}else{var u=hfrKayitUsd(B[i],B[i+1]);if(u>0){top+=u;bil=true;kis=true}}}
return{usd:bil?top:null,kismi:kis}}
function hfrButce(){var z=ZK.st;return z&&z.butce?'$'+String(z.butce).replace('.',','):'—'}
// Çalışanın 7 günlük etkinliği: biten görev + yazdığı mesaj/toplantı cevabı + açtığı gelişim talebi; Echo için iş günü dakikası
function hfrFaal(id,B){var v=[0,0,0,0,0,0,0],T=TMS(),i;
hfrBitti(B[0],B[7],id).forEach(function(g){i=hfrGun(g.bts,B);if(i>=0)v[i]++});
(T.sohbet[id]||[]).forEach(function(m){if(m.r=='o'){i=hfrGun(m.ts,B);if(i>=0)v[i]++}});
(typeof tpS=='function'?tpS():[]).forEach(function(t){(t.mes||[]).forEach(function(m){if(m.r=='o'&&m.kim==id){i=hfrGun(m.ts,B);if(i>=0)v[i]++}})});
T.gel.forEach(function(g){if(g.kim==id){i=hfrGun(g.ts,B);if(i>=0)v[i]++}});
var puan=v.reduce(function(a,b){return a+b},0);
if(id=='echo'){var m2=[0,0,0,0,0,0,0],say=0;for(var j=0;j<7;j++){var k=key(new Date(B[j]));m2[j]=tot(k);say+=(E[k]||[]).length}return{v:m2,puan:say+puan,dk:1}}
return{v:v,puan:puan}}
function hfrN(x,bos){return bos?'—':String(x)}
function hfrNot(c,B,V){var s=B[0],e=B[7],T=TMS(),id=c.id,gB=T.gel.length==0,gz=T.gorev.length==0;
if(id=='orin'){var tp=typeof tpS=='function'?tpS():[],kar=0,top=0;tp.forEach(function(t){(t.kararlar||[]).forEach(function(k){if(k.ts>=s&&k.ts<e)kar++});var z=t.basla||t.zaman||t.ts||0;if(z>=s&&z<e)top++});
var on=T.gel.filter(function(g){return g.orin&&g.orin.kim=='orin'&&g.orin.ts>=s&&g.orin.ts<e}),ok=on.filter(function(g){return g.orin.ok}).length;
return 'Kararlar: '+hfrN(kar,!tp.length)+' · toplantı: '+hfrN(top,!tp.length)+' · Orin onayı: '+hfrN(ok,gB)+(on.length-ok?' ('+(on.length-ok)+' ret)':'')}
if(id=='orla')return 'Takip edilen görev: '+hfrN(V.acik,gz)+' · geciken: '+hfrN(V.geciken,gz)+' (Orla hatırlatır)';
if(id=='nika'){var ik=T.gel.filter(function(g){return g.ik&&g.ik.ts>=s&&g.ik.ts<e}),iok=ik.filter(function(g){return g.ik.ok}).length,bk=T.gel.filter(function(g){return (g.ts||0)<e&&(!g.ik||g.ik.ts>=e)}).length;
return 'İK onayı: '+hfrN(iok,gB)+' · ret: '+hfrN(ik.length-iok,gB)+' · bekleyen: '+hfrN(bk,gB)}
if(id=='echo'){var tam=0,eks=0,iz=0,pt={};for(var j=0;j<7;j++){var d=new Date(B[j]);if(+d>Date.now())break;var k=key(d),ty=typ(k);if(ty=='tam'||ty=='mesai')tam++;else if(ty=='hata'||ty=='girdi')eks++;else if(HFR_IZIN.indexOf(ty)>=0)iz++;(E[k]||[]).forEach(function(x){pt[x.k]=(pt[x.k]||0)+x.d})}
var en=Object.keys(pt).sort(function(a,b){return pt[b]-pt[a]})[0];
return Object.keys(E).length?'İş günü: '+tam+' tam, '+eks+' eksik · en çok: '+(en||'—')+' · izin: '+iz+' gün':'İş günü: — · en çok: — · izin: —'}
if(id=='otto')return 'Piyasa bölümü yakında';
if(id=='ada'){var A=typeof isS=='function'?isS():[],L=A.filter(function(x){return x.emri&&x.karar>=s&&x.karar<e}),yap=L.filter(function(x){return x.durum=='yapildi'}).length,inc=A.filter(function(x){return x.durum=='inceleme'}).length;
return 'İş emri: '+L.length+' · yapılan: '+yap+' · inceleme bekleyen: '+inc}
var d2=V.k[id];return d2.biten+' görev bitirdi · '+d2.acik+' açık görev · '+d2.mesaj+' mesaj yazdı'}
function hfrVeri(off){var B=hfrSinir(off),s=B[0],e=B[7],T=TMS(),Gn=T.gorev.length,r={off:off,B:B,ad:hfrAd(off),anahtar:hfrAnahtar(off)};
var acik=hfrAcik(e);
r.biten=Gn?hfrBitti(s,e).length:null;r.once=Gn?hfrBitti(+hfrBas(off-1),s).length:null;r.acik=Gn?acik.length:null;r.acil=acik.filter(function(g){return g.onc=='acil'}).length;r.geciken=Gn?hfrGeciken(acik,e).length:null;
r.onay=T.gel.length?hfrGelOnay(s,e).length:null;r.bekleyen=hfrGelBekleyen(e).length;
r.abn=hfrAbn(s,e);r.abnTop=r.abn.gorev+r.abn.sohbet+r.abn.toplanti;r.abnAcik=typeof abnAcik=='function'&&abnAcik();
var u=hfrUsd(B);r.usd=u.usd;r.kismi=!!u.kismi;r.butce=hfrButce();
r.k={};tmAll().forEach(function(c){var f=hfrFaal(c.id,B),b=hfrBitti(s,e,c.id),a=hfrAcik(e,c.id),tk=b.reduce(function(x,y){return x+(y.token||y.abnToken||0)},0),ms=0;
(T.sohbet[c.id]||[]).forEach(function(m){if(m.r=='o'&&m.ts>=s&&m.ts<e)ms++});
r.k[c.id]={f:f,biten:b.length,acik:a.length,geciken:hfrGeciken(a,e).length,token:tk,mesaj:ms,puan:f.puan}});
tmAll().forEach(function(c){r.k[c.id].not=hfrNot(c,B,r)});return r}
function hfrSiraliste(V){var L=tmAll().map(function(c,i){return[c,i]});
if(HFR.sort=='aktif')L.sort(function(a,b){return V.k[b[0].id].puan-V.k[a[0].id].puan||a[1]-b[1]});
else if(HFR.sort=='geciken')L.sort(function(a,b){return V.k[b[0].id].geciken-V.k[a[0].id].geciken||V.k[b[0].id].acik-V.k[a[0].id].acik||a[1]-b[1]});
return L.map(function(x){return x[0]})}

// ---------- Görünüm ----------
function hfrKutu(ad,deg,alt,renk){return '<div class="hfb"><div class="hfba">'+ad+'</div><div class="hfbd"'+(renk?' style="color:'+renk+'"':'')+'>'+deg+'</div><div class="hfba s">'+alt+'</div></div>'}
function hfrUsdMetin(x){return x==null?'—':usd(x)}
function hfrKart(c,V){var d=V.k[c.id],f=d.f,mx=Math.max.apply(null,f.v.concat([1]));
var bars=f.v.map(function(x,i){return '<div class="hfgg" title="'+HFR_GUN[i]+': '+(f.dk?dk(x)+' dk':x+' işlem')+'"><span class="hfgb'+(x?'':' bos')+'" style="height:'+(x?Math.max(6,Math.round(x*100/mx))+'%':'3px')+';background:'+esc(c.renk||'#888')+'"></span><span class="hfge">'+HFR_GUN[i]+'</span></div>'}).join('');
return '<article class="hfk" data-id="'+esc(c.id)+'"><div class="hfk1">'+av(c,34)+'<div style="flex:1;min-width:0"><div class="hfkn">'+esc(c.ad)+'</div><div class="hfs">'+esc(c.gorev||'')+'</div></div><a href="#" onclick="nav(\'team\',\'calisan\',\''+jq(c.id)+'\');return false">Sayfası ›</a></div>'+
'<div class="hfg" role="img" aria-label="7 günlük '+(f.dk?'iş günü dakikası':'etkinlik')+' grafiği">'+bars+'</div>'+
'<div class="hf4"><div><b style="color:#8fe0b3">'+d.biten+'</b><span>biten</span></div><div><b>'+d.acik+'</b><span>açık</span></div><div><b style="color:#f4a3a3">'+d.geciken+'</b><span>geciken</span></div><div><b>'+(d.token?fmtTok(d.token):'—')+'</b><span>token</span></div></div>'+
'<div class="hfn">'+esc(d.not)+'</div></article>'}
function hfrDeger(V){var k=V.anahtar,o=(S.haftalikOzet||{})[k],o2=tm('orin')||{ad:'Orin',renk:'#5b6cff'},yuk=HFR.yuk[k],hata=HFR.hata[k];
var metin=o?'<p class="hfdm hfdy">'+esc(o.metin)+'</p>':'<p class="hfdm">'+(yuk?'Orin haftayı değerlendiriyor…':'Henüz yazılmadı. “Haftayı özetle”ye basınca Orin bu sayfadaki verilerden üç satırlık değerlendirme ve gelecek hafta için öncelik önerisi yazar (1 abonelik çağrısı).')+'</p>';
return '<section class="hfd">'+av(o2,40)+'<div style="flex:1 1 420px;min-width:0"><h2>Orin’in haftalık değerlendirmesi</h2>'+metin+(hata?'<p class="hfdm hfdh">'+esc(hata)+'</p>':'')+(o?'<div class="hfs" style="margin-top:6px">'+esc(tmTime(o.ts))+'</div>':'')+'</div>'+
'<button class="bt p" id="hfoz" onclick="hfrOzet()"'+(yuk?' disabled':'')+'>'+(yuk?'Yazılıyor…':o?'Yeniden özetle':'Haftayı özetle')+'</button></section>'}
function hfrPage(){var V=hfrVeri(HFR.off),ok=function(d,ad,dis){return '<button class="hfw1" aria-label="'+ad+'"'+(dis?' disabled':'')+' onclick="hfrGit('+d+')">'+(d<0?'‹':'›')+'</button>'},ab=!V.abnTop&&!V.abnAcik;
var kutu=hfrKutu('Biten görev',hfrN(V.biten,V.biten==null),'geçen hafta '+hfrN(V.once,V.once==null),'#8fe0b3')+
hfrKutu('Açık görev',hfrN(V.acik,V.acik==null),V.acik==null?'—':V.acil+' acil','')+
hfrKutu('Geciken',hfrN(V.geciken,V.geciken==null),'Orla takipte','#f4a3a3')+
hfrKutu('Onaylanan gelişim',hfrN(V.onay,V.onay==null),V.onay==null?'—':V.bekleyen+' onay bekliyor','#9cc2ff')+
hfrKutu('Abonelik çağrısı',ab?'—':String(V.abnTop),ab?'abonelik kapalı':'görev '+V.abn.gorev+' · sohbet '+V.abn.sohbet+' · toplantı '+V.abn.toplanti,'')+
hfrKutu('API harcaması',hfrUsdMetin(V.usd),'bütçe '+V.butce+' / ay'+(V.kismi?' · kısmi':''),'');
var tabs=HFR_SIRA.map(function(x){return '<span role="tab" aria-selected="'+(HFR.sort==x[0])+'" class="'+(HFR.sort==x[0]?'on':'')+'" onclick="hfrSirala(\''+x[0]+'\')">'+x[1]+'</span>'}).join('');
return '<div class="hfr"><div class="hfh0"><div style="flex:1 1 300px"><h1>Haftalık rapor</h1><p>Tüm çalışanların haftası tek sayfada</p></div>'+
'<div class="hfw">'+ok(-1,'Önceki hafta',HFR.off<=-104)+'<span class="hfwa">'+esc(V.ad)+'</span>'+ok(1,'Sonraki hafta',HFR.off>=0)+'</div>'+
'<button class="bt" onclick="hfrDisa(\'xlsx\')"><i class="ti ti-file-spreadsheet"></i> Excel</button><button class="bt" onclick="hfrDisa(\'pdf\')"><i class="ti ti-file-type-pdf"></i> PDF</button></div>'+
'<div class="hfbg">'+kutu+'</div>'+hfrDeger(V)+
'<div class="ong"><h2>Çalışanlar</h2><span class="onl"></span><div class="seg" role="tablist" aria-label="Sıralama">'+tabs+'</div></div>'+
'<div class="hfkg">'+hfrSiraliste(V).map(function(c){return hfrKart(c,V)}).join('')+'</div></div>'}

// ---------- Orin'in değerlendirmesi (yalnız düğmeye basınca, tek abonelik çağrısı) ----------
function hfrMetin(V){var s=function(x){return x==null?'veri yok':x},L=['Hafta: '+V.ad+' (Pazartesi–Pazar)',
'Biten görev: '+s(V.biten)+' (geçen hafta '+s(V.once)+') · açık görev: '+s(V.acik)+' ('+V.acil+' acil) · geciken: '+s(V.geciken),
'Onaylanan gelişim: '+s(V.onay)+' · onay bekleyen: '+V.bekleyen,
'Abonelik çağrısı: görev '+V.abn.gorev+', sohbet '+V.abn.sohbet+', toplantı '+V.abn.toplanti+' · API harcaması: '+hfrUsdMetin(V.usd)+' (bütçe '+V.butce+'/ay)','Çalışanlar (biten/açık/geciken):'];
tmAll().forEach(function(c){var d=V.k[c.id];L.push('- '+c.ad+' ('+c.gorev+'): '+d.biten+'/'+d.acik+'/'+d.geciken+' · '+d.not)});return L.join('\n')}
function hfrOzet(){var k=hfrAnahtar(HFR.off);if(HFR.yuk[k])return Promise.resolve();
if(typeof abnSohbetHazir!='function'||!abnSohbetHazir()){HFR.hata[k]='Claude aboneliği şu an kullanılamıyor (kapalı, sınır dolu ya da bağlantı yok); değerlendirme yazılamadı.';render();return Promise.resolve()}
var o=tm('orin'),V=hfrVeri(HFR.off);HFR.yuk[k]=1;delete HFR.hata[k];render();
return ABN.cagir({kim:'orin',tur:'sohbet',sistemTam:true,araclar:'',maxTur:1,model:typeof yonModel=='function'?yonModel('orin'):'sonnet',zamanAsimiMs:120000,
sistem:zekaSistem(o)+'\nSen şirketin Genel Müdürü Orin’sin. Aşağıda bir haftanın özet sayıları var. Çağlar için Türkçe, tam 3 satırlık haftalık değerlendirme yaz (ne iyi gitti, neresi sorunlu, dikkat edilecek nokta), ardından “Öncelik:” ile başlayan tek satırda gelecek hafta için öncelik öner. Yalnız verilen sayılara dayan; sayı uydurma. Başlık ve madde işareti kullanma.',istem:V.ad+'\n\n'+hfrMetin(V)})
.then(function(r){if(!r.ok)throw new Error(r.err||'Cevap alınamadı');var m=String(r.v.metin||'').trim();if(!m)throw new Error('Boş cevap geldi');S.haftalikOzet=S.haftalikOzet||{};S.haftalikOzet[k]={metin:m.slice(0,1500),ts:Date.now()};if(ABN.st)ABN.st.sohbetBugun=(ABN.st.sohbetBugun||0)+1;save()})
.catch(function(e){HFR.hata[k]='Değerlendirme yazılamadı: '+String(e&&e.message||e)})
.then(function(){delete HFR.yuk[k];if(area=='team'&&pg=='haftalik')render()})}

// ---------- Excel ve PDF ----------
function hfrTablo(V){var s=function(x){return x==null?'—':x},o=(S.haftalikOzet||{})[V.anahtar],
oz=[['Ölçü','Değer','Ayrıntı'],['Hafta',V.ad,''],['Biten görev',s(V.biten),'geçen hafta '+s(V.once)],['Açık görev',s(V.acik),V.acik==null?'—':V.acil+' acil'],['Geciken',s(V.geciken),'Orla takipte'],
['Onaylanan gelişim',s(V.onay),V.bekleyen+' onay bekliyor'],['Abonelik çağrısı',V.abnTop,'görev '+V.abn.gorev+' · sohbet '+V.abn.sohbet+' · toplantı '+V.abn.toplanti],['API harcaması',hfrUsdMetin(V.usd),'bütçe '+V.butce+' / ay']];
if(o)oz.push(['Orin’in değerlendirmesi',o.metin,'']);
var ks=[['Çalışan','Unvan','Biten','Açık','Geciken','Token'].concat(HFR_GUN).concat(['Not'])];
tmAll().forEach(function(c){var d=V.k[c.id];ks.push([c.ad,c.gorev||'',d.biten,d.acik,d.geciken,d.token?d.token:'—'].concat(d.f.v.map(function(x){return d.f.dk?Math.round(x)+' dk':x})).concat([d.not]))});return{ozet:oz,kisi:ks}}
function hfrHtml(V,T){function tb(a){return '<table><tr>'+a[0].map(function(c){return '<th>'+esc(c)+'</th>'}).join('')+'</tr>'+a.slice(1).map(function(r){return '<tr>'+r.map(function(c){return '<td>'+esc(c)+'</td>'}).join('')+'</tr>'}).join('')+'</table>'}
return '<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:"Segoe UI",sans-serif;font-size:10.5px;color:#222;margin:28px}h1{font-size:18px;margin:0 0 2px}h2{font-size:13px;margin:18px 0 6px}.s{color:#666;margin-bottom:12px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #e3e3e3;padding:4px 5px;text-align:left;vertical-align:top}th{background:#f3f4f7}</style></head><body><h1>'+esc(APPNAME)+' · Haftalık rapor</h1><div class="s">'+esc(V.ad)+' · oluşturma '+new Date().toLocaleString('tr-TR')+'</div><h2>Özet</h2>'+tb(T.ozet)+'<h2>Çalışanlar</h2>'+tb(T.kisi)+'</body></html>'}
function hfrDisa(tur){var V=hfrVeri(HFR.off),T=hfrTablo(V),ad='Orvane haftalık rapor '+V.ad,p;
if(!API||!API.exp){toast('Dışa aktarma kullanılamıyor');return Promise.resolve()}
p=tur=='pdf'?API.exp.pdf({name:ad+'.pdf',html:hfrHtml(V,T)}):API.exp.xlsx({name:ad+'.xlsx',sheets:[{name:'Özet',rows:T.ozet},{name:'Çalışanlar',rows:T.kisi}]});
return p.then(function(r){if(!r||r.canceled)return;if(!r.ok){toast('Aktarılamadı: '+r.err);return}EXP.last=r.file;toast('Kaydedildi: '+r.file)})}

// ---------- Kabuk ----------
var _hfTp=teamPage;teamPage=function(){if(pg=='haftalik')return hfrPage();return _hfTp()};
var _hfTt=teamTitle;teamTitle=function(){if(pg=='haftalik')return 'Şirketim › Haftalık rapor';return _hfTt()};

// ---------- Testler (yalnız smoke) ----------
window.__hfrTest=function(){var R=[],T=TMS(),bk={gor:T.gorev,gel:T.gel,ch:JSON.stringify(T.sohbet),tp:S.toplanti,ho:S.haftalikOzet,zk:ZK.st,st:ABN.st,cg:ABN.cagir,api:API,E:E};
function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
function geri(){T.gorev=bk.gor;T.gel=bk.gel;T.sohbet=JSON.parse(bk.ch);if(bk.tp)S.toplanti=bk.tp;else delete S.toplanti;if(bk.ho)S.haftalikOzet=bk.ho;else delete S.haftalikOzet;ZK.st=bk.zk;ABN.st=bk.st;ABN.cagir=bk.cg;API=bk.api;E=bk.E;HFR.off=0;HFR.sort='hier';HFR.yuk={};HFR.hata={};save();nav('home','gun',TODAY)}
var s0=+hfrBas(0),G=864e5,mon=hfrBas(0),ym=mon.getFullYear()+'-'+String(mon.getMonth()+1).padStart(2,'0'),nAy=0,i,p,cagri=[],dos=[];
var tx=function(){return document.getElementById('ct').textContent},kv=function(){return [].map.call(document.querySelectorAll('.hfb'),function(b){return b.querySelector('.hfbd').textContent})},bx=function(n){return document.querySelectorAll('.hfb')[n].textContent};
var kt=function(id){return document.querySelector('.hfk[data-id="'+id+'"]').textContent},ilk=function(){return document.querySelector('.hfk').getAttribute('data-id')};
for(i=0;i<7;i++){var dd=new Date(s0);dd.setDate(dd.getDate()+i);if(dd.getMonth()==mon.getMonth())nAy++}
try{
E={};HFR.off=0;HFR.sort='hier';HFR.yuk={};HFR.hata={};delete S.haftalikOzet;
// 1) Veri yokken "—"
T.gorev=[];T.gel=[];T.sohbet={};S.toplanti=[];ZK.st=null;ABN.st=null;
nav('team','haftalik');
t('Haftalık rapor sayfası açılır: başlık, altı özet kutusu',pg=='haftalik'&&document.querySelectorAll('.hfb').length==6&&/Haftalık rapor/.test(tx())&&document.getElementById('tl').textContent=='Şirketim › Haftalık rapor',document.getElementById('tl').textContent);
t('Veri yokken altı kutu da “—”',kv().every(function(x){return x=='—'}),kv().join('|'));
t('Veri yokken Echo notu “—”, Otto notu “Piyasa bölümü yakında”',/İş günü: — · en çok: —/.test(kt('echo'))&&/Piyasa bölümü yakında/.test(kt('otto')),kt('echo'));
t('Her çalışan için kart, Sayfası bağlantısı ve 7 günlük grafik',document.querySelectorAll('.hfk').length==tmAll().length&&document.querySelectorAll('.hfk .hfgg').length==tmAll().length*7&&document.querySelectorAll('.hfk a[onclick*="calisan"]').length==tmAll().length);
// 2) Tohum veri
var ek=s0+3600e3;
T.gorev=[{id:'h1',kim:'sage',metin:'A',durum:'bitti',bts:ek,ts:s0-2*G,onc:'normal',yol2:'abonelik',abnToken:5000},{id:'h2',kim:'sage',metin:'B',durum:'bitti',bts:ek+7200e3,ts:s0-2*G,onc:'normal',token:1500},
{id:'h3',kim:'ada',metin:'C',durum:'bitti',bts:s0-3*G,ts:s0-9*G,onc:'normal'},{id:'h4',kim:'ada',metin:'D',durum:'acik',ts:s0-9*G,onc:'acil',son:'2020-01-01'},
{id:'h5',kim:'orla',metin:'E',durum:'acik',ts:s0-5*G,onc:'normal'},{id:'h6',kim:'echo',metin:'F',durum:'bitti',bts:ek+3600e3,ts:s0-2*G,onc:'normal'}];
T.gel=[{id:'hg1',kim:'sage',tur:'hafiza',metin:'x',asama:'tamam',ts:s0-G,ik:{ts:ek,ok:1},orin:{ts:ek,ok:1,kim:'orin'},ceo:{ts:ek,ok:1}},{id:'hg2',kim:'mia',tur:'hafiza',metin:'y',asama:'ceo',ts:s0-G,ik:{ts:ek,ok:1},orin:{ts:ek,ok:1,kim:'orin'}},{id:'hg3',kim:'otto',tur:'hafiza',metin:'z',asama:'ik',ts:s0-G}];
T.sohbet={orin:[{r:'o',t:'Merhaba',model:'abonelik · claude',ts:ek},{r:'o',t:'Görev tamamlandı (Claude aboneliğinde): A',model:'abonelik · claude',ts:ek}],sage:[{r:'o',t:'x',model:'claude-haiku-5-5',usd:0.2,ts:ek}]};
S.toplanti=[{id:'tpH',ev:'orin',kim:['orin','sage'],konu:'Hafta',durum:'bitti',zaman:ek,basla:ek,ts:ek,mes:[{r:'o',kim:'orin',t:'a',ts:ek},{r:'o',kim:'sage',t:'b',ts:ek},{r:'sys',t:'c',ts:ek}],kararlar:[{kim:'orin',metin:'k',ts:ek}]}];
var Z={ay:ym,usd:2.5,kisi:{},gun:{}};for(i=0;i<7;i++){var d2=new Date(s0);d2.setDate(d2.getDate()+i);if(d2.getMonth()==mon.getMonth())Z.gun[d2.getDate()]=0.5}
ZK.st={anahtar:true,butce:10,harcama:Z,aylar:{}};ABN.st={kurulu:true,acik:true,gunluk:5,bugun:0,toplam:0,gunlukSohbet:60,sohbetBugun:0};
E={};E[key(mon)]=[{k:'78.26.03.04',i:'Deneme',d:300,st:1}];
render();var v=kv();
t('Biten görev 3, geçen hafta 1 (kayıtlardan)',v[0]=='3'&&/geçen hafta 1/.test(bx(0)),bx(0));
t('Açık görev 2 (1 acil), geciken 1',v[1]=='2'&&/1 acil/.test(bx(1))&&v[2]=='1',v.join('|'));
t('Onaylanan gelişim 1, 2 onay bekliyor (ik + ceo aşaması)',v[3]=='1'&&/2 onay bekliyor/.test(bx(3)),bx(3));
t('Abonelik çağrısı 4: görev 1 · sohbet 1 (görev mesajı çift sayılmaz) · toplantı 2',v[4]=='4'&&/görev 1 · sohbet 1 · toplantı 2/.test(bx(4)),bx(4));
t('API harcaması günlük defterden, bütçe ayardan',v[5]==usd(0.5*nAy)&&/bütçe \$10 \/ ay/.test(bx(5)),v[5]+' / '+bx(5));
ZK.st.butce=25;render();t('Bütçe metni ayarla değişir (sabit değil)',/bütçe \$25 \/ ay/.test(bx(5)));ZK.st.butce=10;render();
t('Sage: 2 biten, token 6,5K → 7K',/2biten/.test(kt('sage').replace(/\s/g,''))&&/7Ktoken/.test(kt('sage').replace(/\s/g,'')),kt('sage'));
t('Orin notu: karar 1 · toplantı 1 · Orin onayı 2',/Kararlar: 1 · toplantı: 1 · Orin onayı: 2/.test(kt('orin')),kt('orin'));
t('Orla notu: takip edilen 2 · geciken 1',/Takip edilen görev: 2 · geciken: 1/.test(kt('orla')),kt('orla'));
t('Nika notu: İK onayı 2 · ret 0 · bekleyen 1',/İK onayı: 2 · ret: 0 · bekleyen: 1/.test(kt('nika')),kt('nika'));
t('Echo notu: en çok proje kodu',/en çok: 78\.26\.03\.04/.test(kt('echo')),kt('echo'));
t('Ada notu: iş emri sayıları',/İş emri: 0 · yapılan: 0 · inceleme bekleyen: 0/.test(kt('ada')),kt('ada'));
t('Otto notu: Piyasa bölümü yakında',/Piyasa bölümü yakında/.test(kt('otto')));
hfrSirala('geciken');t('Geciken önce: Ada ilk',ilk()=='ada',ilk());
hfrSirala('aktif');t('En aktif: Sage ilk (2 görev + mesaj + toplantı cevabı)',ilk()=='sage',ilk());
hfrSirala('hier');t('Hiyerarşi: çalışan listesi sırası',ilk()==tmAll()[0].id,ilk());
// Hafta gezintisi
var ad0=document.querySelector('.hfwa').textContent;
t('Hafta etiketi Pazartesi–Pazar, “sonraki” bu haftada kapalı',/^\d{1,2}[–\u2013 ].*20\d\d$/.test(ad0)&&document.querySelector('.hfw .hfw1:last-child').disabled,ad0);
hfrGit(1);t('Bu haftadan sonrasına gidilmez',HFR.off==0);
hfrGit(-1);var v2=kv(),ad1=document.querySelector('.hfwa').textContent;
t('Önceki haftaya gidince aralık ve değerler değişir (biten 1, açık 5)',ad1!=ad0&&v2[0]=='1'&&v2[1]=='5'&&!document.querySelector('.hfw .hfw1:last-child').disabled,ad1+' '+v2.join('|'));
hfrGit(1);
// 3) Orin değerlendirmesi: yalnız düğmeyle
ABN.cagir=function(o){cagri.push(o);return Promise.resolve({ok:true,v:{metin:'Hafta dengeli geçti.\nGecikme tek görevde.\nMaliyet bütçe içinde.\nÖncelik: gecikeni kapat.',tur:1,token:900,model:'claude-sonnet-5-5'}})};
render();t('Açılışta çağrı yok, “Henüz yazılmadı” ve “Haftayı özetle” görünür',cagri.length==0&&/Henüz yazılmadı/.test(tx())&&/Haftayı özetle/.test(document.getElementById('hfoz').textContent));
render();t('Yeniden çizimde de çağrı yok',cagri.length==0);
p=hfrOzet().then(function(){
t('Düğmeye basınca tam 1 abonelik çağrısı (Orin, sohbet, sayılarla)',cagri.length==1&&cagri[0].kim=='orin'&&cagri[0].tur=='sohbet'&&/Biten görev: 3/.test(cagri[0].istem)&&/3 satırlık/.test(cagri[0].sistem)&&!/Henüz yazılmadı/.test(tx())&&/Öncelik: gecikeni kapat/.test(tx()),JSON.stringify(cagri.map(function(x){return x.kim})));
render();t('Yeniden çizimde sonuç korunur, yeni çağrı yok, hafta başına saklanır',cagri.length==1&&/Hafta dengeli geçti/.test(tx())&&S.haftalikOzet[hfrAnahtar(0)].metin.indexOf('Hafta dengeli')==0&&/Yeniden özetle/.test(document.getElementById('hfoz').textContent));
hfrGit(-1);t('Başka haftada değerlendirme yok, çağrı yok',/Henüz yazılmadı/.test(tx())&&cagri.length==1);
ABN.st.acik=false;return hfrOzet()}).then(function(){
t('Abonelik kapalıyken çağrı yapılmaz, bu söylenir',cagri.length==1&&/kullanılamıyor/.test(tx()),tx().slice(0,200));
ABN.st.acik=true;ABN.cagir=function(o){cagri.push(o);return Promise.resolve({ok:false,err:'limit doldu'})};return hfrOzet()}).then(function(){
t('Hata durumunda mesaj gösterilir, sonuç kaydedilmez',cagri.length==2&&/limit doldu/.test(tx())&&!(S.haftalikOzet||{})[hfrAnahtar(-1)],tx().slice(0,200));
HFR.off=0;
// 4) Dışa aktarma (dosya yazımı taklit)
API=Object.assign({},bk.api||{},{exp:{xlsx:function(o){dos.push(o);return Promise.resolve({ok:true,file:'C:/t/r.xlsx'})},pdf:function(o){dos.push(o);return Promise.resolve({ok:true,file:'C:/t/r.pdf'})}}});
return hfrDisa('xlsx')}).then(function(){return hfrDisa('pdf')}).then(function(){var x=dos[0],q=dos[1];
t('Excel: Özet ve Çalışanlar sayfaları, bu haftanın değerleri',!!x&&/\.xlsx$/.test(x.name)&&x.sheets.length==2&&x.sheets[0].name=='Özet'&&x.sheets[0].rows.some(function(r){return r[0]=='Biten görev'&&r[1]==3})&&x.sheets[1].rows.length==tmAll().length+1&&x.sheets[1].rows.some(function(r){return r[0]=='Otto'&&/Piyasa bölümü yakında/.test(r[r.length-1])}),JSON.stringify(x&&x.sheets.map(function(s){return s.name})));
t('PDF: başlık, özet ve çalışan satırları',!!q&&/\.pdf$/.test(q.name)&&/Haftalık rapor/.test(q.html)&&/Biten görev/.test(q.html)&&/Piyasa bölümü yakında/.test(q.html),q&&q.html.slice(0,120))})
}catch(e){t('Haftalık rapor testi',false,e.stack);p=Promise.resolve()}
return p.catch(function(e){t('Haftalık rapor testi',false,e.stack)}).then(function(){geri();return R})};
(function(){var a=window.__asyncTest;window.__asyncTest=function(){return (a?a():Promise.resolve([])).then(function(x){return window.__hfrTest().then(function(y){return x.concat(y)})})}})();
(function(){var sr=window.__smokeRoutes;window.__smokeRoutes=function(){return sr().concat([['team','haftalik','']])}})();
