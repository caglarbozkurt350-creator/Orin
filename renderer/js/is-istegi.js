// Orvane 0.7.14
// 1) Tüm çalışanlar Claude'dan (Claude Code) iş isteyebilir → Çağlar'ın onay kartı → Belgeler\Orin\Giden iş emri
//    → tam otomatik: Claude Code aboneliğinde AYRI git dalında yapar, Orvane test edip commit'ler → "inceleme bekliyor"
//    → kod incelemesi + Çağlar onayıyla birleştirme/yayın (etkileşimli Claude Code) → gelen kutusu is_sonuc → çalışan "yapıldı" işaretler
// 2) Ada'nın güncelleme listesi (hata: mesajları, inceleme bulguları, "Evet" denen fikirler) + onay kartlı sürüm önerisi
// 3) Demirbaş: calisanlar.json'daki 15 çalışan silinemez
// 4) Gelen kutusu: talimat / gorev / is_sonuc türleri (Jarvis yalnız CEO'ya, Çağlar'ın komutuyla)
// 5) Sohbet silme: tek mesaj + "Sohbeti temizle" (masaüstü ve telefon, eşitlemeli)
// 6) Şirket hiyerarşisi (sürüklenebilir kartlar) + Jarvis sayfası ("Promptu Şirkete Gönder")
var ISG={mesgul:null,cagir:function(o){return API.isEmri.gelistir(o)},yaz:function(o){return API.isEmri.yaz(o)}};
var IS_TUR={hata:'Hata',guncelleme:'Güncelleme',is:'İş isteği',inceleme:'İnceleme bulgusu',fikir:'Fikir',surum:'Sürüm önerisi'};
var IS_ONC={yuksek:'Yüksek',orta:'Orta',dusuk:'Düşük'},IS_ONC_SIRA=['yuksek','orta','dusuk'];
var IS_DURUM={liste:'Listede',onay:'Onayını bekliyor',onaylandi:'Onaylandı · Claude Code’a iletildi',calisiyor:'Claude Code yapıyor',inceleme:'Kod incelemesi bekliyor',yapildi:'Yapıldı',red:'Reddedildi',hata:'Yapılamadı',bos:'Değişiklik yapılmadı',surumde:'Sürüm önerisinde'};
function isS(){S.isler=S.isler||[];return S.isler}
function isAyar(){S.isAyar=S.isAyar||{oto:true};return S.isAyar}
function isBul(id){return isS().filter(function(x){return x.id==id})[0]}
function isRr(){if(area=='team')render()}
function isEkle(o){var it=Object.assign({id:'is'+uid(),ts:Date.now(),durum:'liste',onc:o.tur=='hata'||o.tur=='inceleme'?'yuksek':'orta'},o);it.baslik=String(it.baslik||it.metin||'').replace(/\s+/g,' ').slice(0,90);it.metin=String(it.metin||'').slice(0,4000);isS().push(it);save();return it}
function isSonuc(it){if(it.sonuc&&(it.sonuc.evet||it.sonuc.hayir))return it.sonuc;
if(it.tur=='surum')return{evet:(it.maddeler||[]).length+' madde ayrı dalda yapılır; testten ve kod incelemesinden sonra senin onayınla yayınlanır.',hayir:'Maddeler listede bekler; hatalar ve eksikler sürer.'};
return{evet:'Claude Code bu işi ayrı dalda yapar, test eder; incelemeden sonra senin onayınla programa girer.',hayir:'İş yapılmaz; '+((tm(it.kim)||{}).ad||'çalışan')+' bu ihtiyaçla devam eder.'}}
// Çalışan iş ister → Çağlar'ın onayına
function isIste(kim,o){var c=tm(kim);if(!c)return null;var it=isEkle(Object.assign({kim:kim,tur:'is',kaynak:'sohbet'},o,{durum:'onay'}));
tmPush(kim,{r:'sys',t:c.ad+' Claude’dan iş istedi: “'+it.baslik+'” · Çağlar’ın onayında (Orin’in sayfası › İş istekleri).'});if(!INFO.smoke)toast(c.ad+' Claude’dan iş istedi; onayını bekliyor');return it}
// Çağlar'ın kararı
function isOnay(id,ok){var it=isBul(id);if(!it||it.durum!='onay')return Promise.resolve();var c=tm(it.kim)||{ad:it.kim};
if(!ok){it.durum='red';it.karar=Date.now();(it.alt||[]).forEach(function(a){var x=isBul(a);if(x&&x.durum=='surumde'){x.durum='liste';delete x.ust}});tmPush(it.kim,{r:'sys',t:'Çağlar iş isteğini onaylamadı: '+it.baslik});save();isRr();return Promise.resolve()}
it.durum='onaylandi';it.karar=Date.now();save();
return ISG.yaz({id:it.id,kim:it.kim,kimAd:c.ad,baslik:it.baslik,metin:it.metin,tur:it.tur,maddeler:it.maddeler,onaylanirsa:isSonuc(it).evet,onaylanmazsa:isSonuc(it).hayir}).then(function(r){if(!r.ok)throw new Error(r.err);it.emri=r.v.dosya;it.md=r.v.md;
var oto=isAyar().oto&&abnAcik();tmPush(it.kim,{r:'sys',t:'Çağlar onayladı · iş emri yazıldı (Belgeler\\Orin\\Giden\\'+it.emri+'.md). '+(oto?'Claude Code ayrı dalda başlıyor.':'Claude Code bir sonraki oturumda yapacak.')});save();isRr();if(oto)return isGelistir(it)},
function(e){it.durum='onay';toast('İş emri yazılamadı: '+e.message);save();isRr()})}
function isTestYazi(t){if(!t)return '—';if(!t.toplam)return t.ok?'geçti':'çalışmadı';if(t.yeniHata)return t.gecen+'/'+t.toplam+(t.ok?' · yeni hata yok':' · '+t.yeniHata.length+' yeni hata')+(t.kisiselEksik?' (kişisel veri olmadan)':'');return t.gecen+'/'+t.toplam+(t.ok?' geçti':' · hata var')}
function isKisa(t,n){t=String(t||'').trim();return t.length>(n||700)?t.slice(0,n||700)+'…':t}
// Tam otomatik: Claude Code ayrı dalda yapar (aynı anda tek iş; günlük abonelik sınırına sayılır)
function isGelistir(it){if(ISG.mesgul||!it||!it.emri||(it.durum!='onaylandi'))return Promise.resolve();
ISG.mesgul=it.id;it.durum='calisiyor';it.deneme=(it.deneme||0)+1;it.basla=Date.now();delete it.not;save();isRr();
tmPush(it.kim,{r:'sys',t:'Claude Code işe başladı (ayrı git dalında, en fazla ~20 dk): '+it.baslik});
return ISG.cagir({dosya:it.emri}).then(function(r){if(!r.ok)throw new Error(r.err);var s=r.v;['dal','yol','degisen','test','commit'].forEach(function(k){it[k]=s[k]});it.rapor=isKisa(s.metin,3000);it.bitis=Date.now();
if(s.durum=='inceleme'){it.durum='inceleme';tmPush(it.kim,{r:'o',t:'Claude Code “'+it.baslik+'” işini yaptı; kod incelemesi bekliyor.\nDal: '+s.dal+' · '+s.degisen.length+' dosya · test '+isTestYazi(s.test)+'\n\n'+isKisa(s.metin),model:'Claude Code'});toast('İş emri hazır, kod incelemesi bekliyor: '+it.baslik)}
else if(s.durum=='degisiklik-yok'){it.durum='bos';tmPush(it.kim,{r:'o',t:'Claude Code “'+it.baslik+'” için değişiklik yapmadı.\n\n'+isKisa(s.metin),model:'Claude Code'})}
else if(/limit|gunluk|sure/.test(s.kod||'')&&!(s.degisen||[]).length){it.durum='onaylandi';it.sonraki=Date.now()+60*60000;it.not=s.hata}
else{it.durum='hata';it.hata=s.hata;tmPush(it.kim,{r:'sys',t:'Claude Code işi bitiremedi: '+s.hata+(s.dal?' · dal: '+s.dal:'')})}})
.catch(function(e){var m=String(e&&e.message||e);if(/sınırı doldu|limit|başka bir iş/i.test(m)){it.durum='onaylandi';it.sonraki=Date.now()+30*60000;it.not=m}else{it.durum='hata';it.hata=m;tmPush(it.kim,{r:'sys',t:'İş emri yapılamadı: '+m})}})
.then(function(){ISG.mesgul=null;save();isRr()})}
function isTara(){if(ISG.mesgul||!isAyar().oto||typeof abnHazir!='function')return;var L=isS();
L.forEach(function(it){if(it.durum=='calisiyor'){it.durum=(it.deneme||0)<2?'onaylandi':'hata';if(it.durum=='hata')it.hata='Program kapandığı için yarıda kaldı'}});
if(!abnHazir())return;var it=L.filter(function(x){return x.durum=='onaylandi'&&x.emri&&!x.otoYok&&(!x.sonraki||Date.now()>x.sonraki)&&(x.deneme||0)<3})[0];if(it)isGelistir(it)}

// ---------- Ada'nın güncelleme listesi ----------
function isAdaEsitle(){var L=isS(),var_=function(id){return L.some(function(x){return x.id==id})};
if(typeof adaSiradaki=='function')adaSiradaki().forEach(function(f){if(!var_('f-'+f.id))isEkle({id:'f-'+f.id,kim:'ada',tur:'fikir',kaynak:'fikir',baslik:f.baslik,metin:f.aciklama,sonuc:f.onaylanirsa||f.onaylanmazsa?{evet:f.onaylanirsa||'',hayir:f.onaylanmazsa||''}:null})});
var a=typeof adaS=='function'?adaS():{},I=(a.incelemeler||[]).slice(-1)[0];
if(I&&a.incSync!=I.ts){a.incSync=I.ts;isIncMaddeler(I.ozet).forEach(function(m,i){isEkle({id:'inc-'+I.ts+'-'+i,kim:'ada',tur:'inceleme',kaynak:'inceleme',baslik:m,metin:m+(I.dosya?' (rapor: '+I.dosya+')':'')})});save()}}
function isIncMaddeler(oz){return String(oz||'').replace(/^.*?İlk yapılacak 5 iş\s*:?/i,'').split(/\s(?=\d{1,2}[.)]\s)/).map(function(x){return x.replace(/^\d{1,2}[.)]\s*/,'').trim()}).filter(function(x){return x.length>4}).slice(0,5)}
function isAdaListe(){isAdaEsitle();return isS().filter(function(x){return x.durum=='liste'}).sort(function(a,b){return IS_ONC_SIRA.indexOf(a.onc)-IS_ONC_SIRA.indexOf(b.onc)||a.ts-b.ts})}
function isSonrakiSurum(){var v=String(INFO.version||'0.0.0').split('.').map(Number);v[2]=(v[2]||0)+1;return v.join('.')}
function isSurumOner(){var L=isAdaListe().slice(0,10);if(!L.length){toast('Listede madde yok');return null}var v=isSonrakiSurum();
var it=isEkle({kim:'ada',tur:'surum',kaynak:'ada',durum:'onay',baslik:'Orvane '+v+' güncellemesi ('+L.length+' madde)',metin:'Ada’nın sürüm önerisi: Orvane '+v+'. Aşağıdaki maddeleri öncelik sırasıyla yap; her biri için test ekle.',maddeler:L.map(function(x){return '['+IS_TUR[x.tur]+' · '+IS_ONC[x.onc]+'] '+x.baslik+(x.metin&&x.metin!=x.baslik?' — '+isKisa(x.metin,300):'')}),alt:L.map(function(x){return x.id})});
L.forEach(function(x){x.durum='surumde';x.ust=it.id});tmPush('ada',{r:'o',t:'Sürüm önerisi hazır: Orvane '+v+' · '+L.length+' madde. Onayın Orin’in sayfasında (İş istekleri); onaylarsan Claude Code ayrı dalda yapar, kod incelemesinden sonra senin onayınla yayınlanır.'});save();isRr();return it}
function isOncDegis(id){var it=isBul(id);if(!it)return;it.onc=IS_ONC_SIRA[(IS_ONC_SIRA.indexOf(it.onc)+1)%3];save();render()}
function isCikar(id){var it=isBul(id);if(!it)return;it.durum='red';if(/^f-/.test(id)&&typeof adaS=='function')adaS().cevap[id.slice(2)]={c:'hayir',ts:Date.now()};save();render()}
// "hata: …" / "güncelleme: …" (her sohbetten) → Ada'nın listesi · "iş iste: …" / "claude: …" → o çalışanın iş isteği (Çağlar onayına)
var IS_KOMUT=/^\s*(hata|güncelleme|guncelleme|öneri|oneri|iş iste|is iste|claude)\s*:\s*([\s\S]+)$/i;
tmPushKanca(40,'is-istegi',function(id,m,_isPush){
if(m&&!m.id)m.id=uid();
if(m&&m.r=='ben'&&m.tur!='not'&&!m.komut&&!m.fikirCevap){var k=String(m.t||'').match(IS_KOMUT);if(k&&tm(id)){var t=k[1].toLocaleLowerCase('tr'),metin=k[2].trim();m.komut=1;delete m.bek;var r=_isPush(id,m);
setTimeout(function(){tmChat(id).forEach(function(x){if(x.komut)delete x.bek});
if(/^(iş iste|is iste|claude)$/.test(t))isIste(id,{baslik:metin,metin:metin,kaynak:'sohbet'});
else{var it=isEkle({kim:id,tur:/^hata/.test(t)?'hata':'guncelleme',kaynak:'sohbet:'+id,baslik:metin,metin:metin}),n=isS().filter(function(x){return x.durum=='liste'}).length;
_isPush('ada',{r:'o',t:'Not aldım: “'+it.baslik+'” güncelleme listeme eklendi ('+IS_TUR[it.tur]+' · öncelik '+IS_ONC[it.onc]+' · listede '+n+' madde).'});if(id!='ada')_isPush(id,{r:'sys',t:'Ada’nın güncelleme listesine eklendi: '+it.baslik})}
save();isRr()},30);return r}}
// Çalışanın cevabındaki "İŞ İSTEĞİ: {...}" satırı → iş isteği (satır sohbette gizlenir)
if(m&&m.r=='o'&&typeof m.t=='string'&&/İŞ İSTEĞİ\s*:/i.test(m.t)&&tm(id)){var a=isIstekAyikla(m.t);m.t=a.metin;var res=_isPush(id,m);a.liste.forEach(function(o){isIste(id,{baslik:o.baslik||o.metin,metin:o.metin||o.baslik,sonuc:o.onaylanirsa||o.onaylanmazsa?{evet:String(o.onaylanirsa||'').slice(0,220),hayir:String(o.onaylanmazsa||'').slice(0,220)}:null,kaynak:m.model&&/abonelik/.test(m.model)?'gorev':'sohbet'})});return res}
return _isPush(id,m)});
function isJsonNesne(s){var i=s.indexOf('{');if(i<0)return null;var d=0,q=false,e=false;for(var j=i;j<s.length;j++){var ch=s[j];if(q){if(e)e=false;else if(ch=='\\')e=true;else if(ch=='"')q=false;continue}if(ch=='"')q=true;else if(ch=='{')d++;else if(ch=='}'){d--;if(!d){try{return{o:JSON.parse(s.slice(i,j+1)),son:j+1}}catch(er){return null}}}}return null}
function isIstekAyikla(t){var liste=[],out=String(t),rx=/İŞ İSTEĞİ\s*:/i,g=0,mm;while((mm=out.match(rx))&&g++<3){var bas=mm.index,j=isJsonNesne(out.slice(bas));if(!j){out=out.slice(0,bas)+out.slice(bas+mm[0].length);continue}
if(j.o&&(j.o.metin||j.o.baslik))liste.push(j.o);out=(out.slice(0,bas)+out.slice(bas+j.son)).replace(/\n{3,}/g,'\n\n')}return{metin:out.trim(),liste:liste.slice(0,2)}}
// Komut mesajı yazı kutusundan gönderilince Echo'nun yerel cevabı ya da "cevap bekliyor" işareti olmasın
var _isSend=tmSend;tmSend=function(id,txt,tur){var e=document.getElementById('tmi'),t=String(txt!=null?txt:(e?e.value:'')).trim(),md=tur||(tmOnline()?(TMMODE[id]||'mesaj'):'not');
if(t&&md!='not'&&IS_KOMUT.test(t)){if(txt==null){TMD[id]='';if(e)e.value=''}tmPush(id,{r:'ben',t:t,tur:'mesaj'});render();return null}return _isSend(id,txt,tur)};
// Komut mesajlarını yapay zekâ ayrıca cevaplamasın
// 0.7.20: kontrol team.js komutMu() içinde; zekaCevapla ve abnCevapla başında çağrılır
// Çalışanlara kural: Claude'dan iş isteyebilir
var IS_KURAL='\nClaude’dan iş isteme: Senin yapamadığın, Claude Code’un (Orvane’nin geliştirici yapay zekâsı) yapabileceği bir iş gerekiyorsa (program hatası düzeltme, özellik ekleme, araç/dosya hazırlama) ve gerçekten gerekliyse, cevabının sonunda (ÖĞRENİLENLER satırından önce) ayrı bir satıra şunu yaz: İŞ İSTEĞİ: {"baslik":"kısa başlık","metin":"ne yapılsın ve neden","onaylanirsa":"en fazla 20 kelime","onaylanmazsa":"en fazla 20 kelime"} — Çağlar onaylarsa yapılır. Gereksiz isteme; yalnız JSON istenen işlerde bunu yazma.';
var _isZs=zekaSistem;zekaSistem=function(c){return _isZs(c)+IS_KURAL};

// ---------- Görünüm: iş istekleri kartları ----------
function isAkis(it){var a=['onay','onaylandi','calisiyor','inceleme','yapildi'],i=a.indexOf(it.durum),s=function(t,k){var n=a.indexOf(k);return '<span class="bdg'+(it.durum=='red'||it.durum=='hata'?(n==Math.max(i,2)?' red':''):n<i?' ok':n==i?' ceo':'')+'">'+t+'</span>'};
return '<div class="flw">'+s('Çağlar onayı','onay')+'<i class="ti ti-chevron-right"></i>'+s('İş emri','onaylandi')+'<i class="ti ti-chevron-right"></i>'+s('Claude Code (ayrı dal)','calisiyor')+'<i class="ti ti-chevron-right"></i>'+s('Kod incelemesi','inceleme')+'<i class="ti ti-chevron-right"></i>'+s('Yapıldı','yapildi')+'</div>'}
function isSatir(it,act){var c=tm(it.kim)||{ad:it.kim,renk:'#888'},renk=it.durum=='red'||it.durum=='hata'?'#f4a3a3':it.durum=='yapildi'?'#8fe0b3':it.durum=='inceleme'?'#f6d28a':'#9ec5ff';
return '<div class="ti3 isr">'+av(c,30,false)+'<div class="tx" style="flex:1;min-width:0"><div style="color:#fff">'+esc(it.baslik)+' <span class="bdg">'+IS_TUR[it.tur]+'</span></div>'+
'<div class="hn">'+esc(c.ad)+' · '+tmTime(it.ts)+' · <span style="color:'+renk+'">'+IS_DURUM[it.durum]+'</span>'+(it.not?' · '+esc(it.not):'')+(it.hata?' · '+esc(it.hata):'')+'</div>'+
(it.metin&&it.metin!=it.baslik?'<div class="hn" style="margin-top:3px;white-space:pre-wrap">'+esc(isKisa(it.metin,400))+'</div>':'')+
(it.maddeler&&it.maddeler.length?'<ol class="ism">'+it.maddeler.map(function(m){return '<li>'+esc(isKisa(m,220))+'</li>'}).join('')+'</ol>':'')+
(it.durum=='onay'?sonucKutu(isSonuc(it)):'')+(it.durum!='onay'&&it.durum!='red'?isAkis(it):'')+
(it.dal?'<div class="hn" style="margin-top:4px">Dal: <code>'+esc(it.dal)+'</code> · '+(it.degisen||[]).length+' dosya · test '+isTestYazi(it.test)+(it.commit?' · '+esc(it.commit):'')+'</div>':'')+
(it.durum=='inceleme'?'<div class="hn" style="margin-top:2px">Kodu Claude Code (etkileşimli oturum) inceler; sorun yoksa senin onayınla birleştirip yayınlar.</div>':'')+
(act&&it.durum=='onay'?'<div class="ap"><button class="bt p" data-id="'+esc(it.id)+'" onclick="isOnay(this.dataset.id,1)"><i class="ti ti-check"></i> Onayla, Claude’a ilet</button><button class="bt" data-id="'+esc(it.id)+'" onclick="isOnay(this.dataset.id,0)">Reddet</button></div>':'')+
(it.yol&&(it.durum=='inceleme'||it.durum=='hata'||it.durum=='bos')?'<div class="ap"><button class="bt" data-p="'+esc(it.yol)+'" onclick="API.openPath(this.dataset.p)"><i class="ti ti-folder"></i> Çalışma klasörü</button></div>':'')+
(act&&it.durum=='hata'&&it.emri?'<div class="ap"><button class="bt" data-id="'+esc(it.id)+'" onclick="isYeniden(this.dataset.id)"><i class="ti ti-refresh"></i> Yeniden dene</button></div>':'')+'</div></div>'}
function isYeniden(id){var it=isBul(id);if(!it)return;it.durum='onaylandi';it.deneme=0;delete it.hata;delete it.sonraki;save();render();isGelistir(it)}
function isKart(L,baslik,act,bos){return '<div class="card" style="margin-top:14px"><div class="ch"><i class="ti ti-code"></i>'+baslik+'<span class="hn" style="margin-left:6px">'+L.filter(function(x){return x.durum=='onay'}).length+' onay bekliyor</span>'+
'<span style="margin-left:auto;display:flex;align-items:center;gap:6px" class="hn" title="Onaylanınca Claude Code işi kendisi, ayrı git dalında yapar (aboneliğinde)">Tam otomatik<span class="tg2'+(isAyar().oto?' on':'')+'" onclick="isAyar().oto=!isAyar().oto;save();render()"></span></span></div>'+
(L.length?L.map(function(x){return isSatir(x,act)}).join(''):'<div class="hn">'+bos+'</div>')+'</div>'}
function isAktif(x){return ['onay','onaylandi','calisiyor','inceleme','hata','bos'].indexOf(x.durum)>=0||(x.durum=='yapildi'&&Date.now()-(x.bitis||x.ts)<3*864e5)}
// CEO onayı Çağlar'da: Orin'in sayfasında tüm iş istekleri
var _isAp=tmApprovals;tmApprovals=function(c){var h=_isAp(c);if(c.id!='orin')return h;var L=isS().filter(function(x){return x.tur!='fikir'&&x.tur!='inceleme'&&isAktif(x)}).sort(function(a,b){return (a.durum=='onay'?0:1)-(b.durum=='onay'?0:1)||b.ts-a.ts});
return isKart(L,'İş istekleri (Claude’a)',true,'Çalışanların Claude’dan iş isteği yok. Bir çalışan iş isteyince burada onay kartı çıkar.')+h};
// Ada'nın sayfası: güncelleme listesi (eski "Sıradaki güncellemede eklenecekler" kartının yerine)
adaKart=function(){var L=isAdaListe(),S2=isS().filter(function(x){return x.kim=='ada'&&x.tur=='surum'&&isAktif(x)});
return '<div class="card" style="margin-top:14px"><div class="ch"><i class="ti ti-list-check"></i>Güncelleme listesi <span class="hn" style="margin-left:6px">Sıradaki güncellemede eklenecekler · '+L.length+' madde · hata, inceleme, fikir</span>'+
(L.length?'<button class="bt p" style="margin-left:auto;min-height:30px;padding:4px 12px" onclick="isSurumOner()"><i class="ti ti-rocket"></i> Sürüm önerisi hazırla</button>':'')+'</div>'+
(typeof adaSoruKutu=='function'?adaSoruKutu():'')+
(L.length?L.map(function(x){return '<div class="kr"><div style="min-width:0">'+esc(x.baslik)+'<div class="hn">'+IS_TUR[x.tur]+' · '+esc(String(x.kaynak||'').replace(/^sohbet:(.*)$/,function(a,k){return 'sohbet ('+((tm(k)||{}).ad||k)+')'}))+' · '+tmTime(x.ts)+'</div></div><span style="display:flex;gap:6px;align-items:center"><span class="bdg isonc '+x.onc+'" title="Önceliği değiştir" data-id="'+esc(x.id)+'" onclick="isOncDegis(this.dataset.id)">'+IS_ONC[x.onc]+'</span><button class="bt" style="min-height:30px;padding:4px 10px" title="Listeden çıkar" data-id="'+esc(x.id)+'" onclick="isCikar(this.dataset.id)"><i class="ti ti-x"></i></button></span></div>'}).join(''):'<div class="hn">Liste boş. Herhangi bir sohbette “hata: …” ya da “güncelleme: …” yaz; Ada’nın inceleme bulguları ve “Evet” dediğin fikirler de buraya gelir.</div>')+
(S2.length?'<div class="hn" style="margin:10px 0 4px">Sürüm önerileri</div>'+S2.map(function(x){return isSatir(x,true)}).join(''):'')+'</div>'};
// Diğer çalışanların sayfasında kendi iş istekleri
var _isCh=tmCharts;tmCharts=function(c){var h=_isCh(c);if(c.id=='orin'||c.id=='ada')return h;var L=isS().filter(function(x){return x.kim==c.id&&x.tur=='is'&&isAktif(x)});return L.length?isKart(L,'Claude’dan iş istekleri',true,'')+h:h};

// ---------- Gelen kutusu: talimat / gorev / is_sonuc ----------
var JARVIS_ON='Çağlar’dan (Jarvis aracılığıyla): ';
function isJarvisMi(x){return x.kaynak=='jarvis'||/^jarvis-/i.test(x._dosya||'')}
function isTalimat(kim,metin,kaynak){var t=String(metin||'').trim();if(!t)return false;if(kaynak=='jarvis'&&t.indexOf('Çağlar’dan (Jarvis')!==0)t=JARVIS_ON+t;
tmPush(kim,{r:'ben',t:t,tur:'mesaj',kaynak:kaynak||'gelen'});var a=tmChat(kim);if(typeof zekaHazir=='function'&&zekaHazir()){a[a.length-1].bek=1;zekaCevapla(kim)}else a[a.length-1].bek=1;return true}
// Jarvis şirket hiyerarşisi dışında: yalnız CEO'ya (Orin) ve yalnız talimat iletir
GELEN_TUR.talimat=function(x){return isTalimat(isJarvisMi(x)?'orin':x.kim,x.metin,isJarvisMi(x)?'jarvis':'claude')};
GELEN_TUR.gorev=function(x){if(isJarvisMi(x))return isTalimat('orin','Görev önerisi'+(x.kim&&x.kim!='orin'?' ('+((tm(x.kim)||{}).ad||x.kim)+' için)':'')+': '+x.metin,'jarvis');
if(!String(x.metin||'').trim())return false;var g=tmTaskNew(x.kim,String(x.metin).slice(0,1000),x.onc=='acil'?'acil':'normal',x.son||'',false,{});if(g){g.kaynak='claude';save()}return !!g};
GELEN_TUR.is_sonuc=function(x){var it=isBul(x.id);if(!it)return false;var d=['yapildi','inceleme','red'].indexOf(x.durum)>=0?x.durum:'yapildi';it.durum=d;it.bitis=Date.now();if(x.metin)it.rapor=String(x.metin).slice(0,3000);
var c=tm(it.kim)||{ad:it.kim};
if(d=='yapildi'){(it.alt||[]).forEach(function(a){var y=isBul(a);if(y)y.durum='yapildi'});tmPush(it.kim,{r:'o',t:'✓ Yapıldı: “'+it.baslik+'”. Listemde tamamlandı olarak işaretledim.'+(x.metin?'\n\n'+isKisa(x.metin,600):''),model:'Claude Code'});isAdaSonHal('birlesti')}
else if(d=='red')tmPush(it.kim,{r:'sys',t:'Claude Code iş emrini yapmadı: '+it.baslik+(x.metin?' · '+x.metin:'')});
else tmPush(it.kim,{r:'sys',t:'İş emri hazır, kod incelemesi bekliyor: '+it.baslik});return true};

// ---------- Ada son hali inceler (birleştirme/yayın sonrası) ----------
function isAdaSonHal(neden){if(INFO.smoke||typeof adaInceleme!='function')return false;var a=adaS(),L=(a.incelemeler||[]).slice(-1)[0];if(L&&Date.now()-L.ts<30*60000)return false;if(neden=='surum'&&a.sonIncSurum==INFO.version)return false;
a.sonIncSurum=INFO.version;save();tmPush('ada',{r:'sys',t:(neden=='surum'?'Orvane '+INFO.version+' kuruldu':'Bir iş emri programa birleştirildi')+'; son hali inceleyip öğreniyorum (öğrendiklerim Nika’nın ve senin onayına gider).'});setTimeout(function(){adaInceleme().then(function(){isAdaEsitle()})},500);return true}
if(!INFO.smoke){setTimeout(function(){abnDurum().then(function(){var a=adaS();if(a.sonIncSurum!=INFO.version&&abnAcik())isAdaSonHal('surum')})},90000);setTimeout(isTara,20000);setInterval(isTara,2*60000)}

// ---------- Demirbaş: calisanlar.json'daki 15 çalışan silinemez ----------
function isDemirbas(id){return (TEAM0.calisanlar||[]).some(function(c){return c.id==id})}
tmAll=function(){var T=TMS(),r=[],ids={};(TEAM0.calisanlar||[]).forEach(function(c){ids[c.id]=1;var m=Object.assign({},T.m[c.id]||{});delete m.sil;r.push(Object.assign({},c,m))});
Object.keys(T.m).forEach(function(id){if(!ids[id]&&T.m[id].yeni&&!T.m[id].sil)r.push(Object.assign({id:id,grup:'ekip',bagli:'Orla',renk:'#8f9bb3',grafikler:[]},T.m[id]))});return r};
var _isDel=tmDelMember;tmDelMember=function(id){if(isDemirbas(id)){toast('Şirketin demirbaş çalışanları silinemez');return}return _isDel(id)};
var _isPf=tmProfile;tmProfile=function(c){var h=_isPf(c);return isDemirbas(c.id)?h.replace('<i class="ti ti-device-floppy"></i> Kaydet</button>','<i class="ti ti-device-floppy"></i> Kaydet</button><span class="hn" style="align-self:center"><i class="ti ti-lock"></i> Demirbaş çalışan · silinemez</span>'):h};

// ---------- Sohbet silme (tek mesaj + temizle), telefonla eşitlemeli ----------
(function(){var T=TMS(),d=0;Object.keys(T.sohbet).forEach(function(k){(T.sohbet[k]||[]).forEach(function(m,i){if(!m.id){m.id='m'+(m.ts||0)+'_'+i;d++}})});if(d)save()})();
tmSilSar=function(id,m,x){if(!m||!m.id)return x;return '<div class="msil">'+x+'<span class="mdel" title="Mesajı sil" data-k="'+esc(id)+'" data-m="'+esc(m.id)+'" onclick="tmMsgSil(this.dataset.k,this.dataset.m)"><i class="ti ti-trash"></i></span></div>'};
function tmMsgSilUygula(kim,mid,ts){var a=TMS().sohbet[kim];if(!a)return 0;var n=a.length;TMS().sohbet[kim]=a.filter(function(m){return !(m.id==mid||(ts&&!a.some(function(z){return z.id==mid})&&m.ts==ts))});return n-TMS().sohbet[kim].length}
function tmTemizleUygula(kim,ts){var a=TMS().sohbet[kim];if(!a)return 0;var n=a.length;TMS().sohbet[kim]=a.filter(function(m){return ts&&m.ts>ts});if(kim=='ada'&&S.ada)S.ada.soru=null;return n-TMS().sohbet[kim].length}
function tmMsgSil(kim,mid){confirmBox('Bu mesaj silinsin mi? Telefondan da kalkar.',function(){if(tmMsgSilUygula(kim,mid)){save();render();if(typeof bulutTick=='function')bulutTick()}},'Sil')}
function tmSohbetTemizle(kim){var c=tm(kim)||{ad:kim};confirmBox(esc(c.ad)+' ile sohbetin tamamı silinsin mi? Telefondan da kalkar; görevler, beceriler ve hafıza silinmez.',function(){tmTemizleUygula(kim,Date.now()+1);save();render();toast('Sohbet temizlendi');if(typeof bulutTick=='function')bulutTick()},'Temizle')}
var _isMs=tmMsgs;tmMsgs=function(c){var h=_isMs(c);return h.replace('<div class="cv" id="tmcv">','<div class="cv" id="tmcv"><div class="sct">'+(tmChat(c.id).length?'<span onclick="tmSohbetTemizle(\''+jq(c.id)+'\')"><i class="ti ti-eraser"></i> Sohbeti temizle</span>':'')+'</div>')};
var _isBu=bulutUygula;bulutUygula=function(e){var v=e.veri||{};if(e.tur=='mesaj_sil'){tmMsgSilUygula(v.kim,v.id,v.ts);return}if(e.tur=='sohbet_temizle'){tmTemizleUygula(v.kim,e.ts);return}return _isBu(e)};

// ---------- Şirket hiyerarşisi (sürüklenebilir kartlar) ----------
var HY={sur:null};
function hyCocuk(ad){return tmAll().filter(function(c){return (c.bagli||'Orla')==ad})}
function hyAlt(id){var c=tm(id),r={};if(!c)return r;(function g(ad){hyCocuk(ad).forEach(function(x){if(!r[x.id]){r[x.id]=1;g(x.ad)}})})(c.ad);return r}
function hyKart(c,kok){return '<div class="hyk'+(kok?' kok':'')+'" '+(kok?'':'draggable="true" ondragstart="hySurBasla(event,\''+jq(c.id)+'\')" ondragend="hySurBit()" ')+'ondragover="hyUst(event,\''+jq(kok?'':c.id)+'\')" ondragleave="this.classList.remove(\'hov\')" ondrop="hyBirak(event,\''+jq(kok?'':c.id)+'\')" '+(kok?'':'onclick="nav(\'team\',\'calisan\',\''+jq(c.id)+'\')" ')+'title="'+esc(kok?'Şirketin sahibi':(c.ad+' · '+c.gorev+' · sürükleyip başka bir kartın üstüne bırak: bağlılığı değişir'))+'">'+
(kok?'<span class="hya"><i class="ti ti-crown"></i></span>':av(c,34,false))+'<div style="min-width:0"><b>'+esc(kok?'Çağlar':c.ad)+'</b><small>'+esc(kok?'Şirketin sahibi':c.gorev)+'</small></div>'+(!kok&&isDemirbas(c.id)?'':'')+'</div>'}
function hyDal(ad,g){if(g>8)return '';var L=hyCocuk(ad);if(!L.length)return '';var yap=L.length>2&&L.every(function(c){return !hyCocuk(c.ad).length});return '<ul'+(yap?' class="yap"':'')+'>'+L.map(function(c){return '<li>'+hyKart(c)+hyDal(c.ad,g+1)+'</li>'}).join('')+'</ul>'}
function hyYetim(){var A=tmAll(),adlar={'Çağlar':1};A.forEach(function(c){adlar[c.ad]=1});return A.filter(function(c){return !adlar[c.bagli||'Orla']})}
// İnsan Kaynakları sayfasında "Kartlar | Hiyerarşi" görünümü (Çağlar: hiyerarşi İK sayfasında)
var HRV='kart';
function hrSeg(){return '<div class="seg" style="margin-top:14px;display:inline-flex"><span class="'+(HRV!='hiy'?'on':'')+'" onclick="HRV=\'kart\';render()"><i class="ti ti-id-badge-2"></i> Kartlar</span><span class="'+(HRV=='hiy'?'on':'')+'" onclick="HRV=\'hiy\';render()"><i class="ti ti-hierarchy-2"></i> Hiyerarşi</span></div>'}
var _isHr=hrPage;hrPage=function(){var h=_isHr(),i=h.indexOf('<div class="gs">');if(i<0)return h;return h.slice(0,i)+hrSeg()+(HRV=='hiy'?hiyerarsiIc():h.slice(i))};
function hiyerarsiIc(){var y=hyYetim();
return '<div class="hn" style="margin-top:10px">Kartı sürükleyip başka bir kartın üstüne bırak: o kişiye bağlanır. Yeni çalışanı “Yeni çalışan” ile ekleyip buradan yerleştir.</div>'+
'<div class="hyw"><div class="hyt"><ul><li><div class="hyr">'+hyKart(null,true)+'<span class="hyj-cizgi"></span>'+
'<div class="hyk hyj" onclick="nav(\'team\',\'jarvis\',\'\')" title="Kişisel asistan: yalnız Çağlar ile konuşur, şirket hiyerarşisinin dışında"><span class="hya" style="background:#2a2140;color:#c9b6ff"><i class="ti ti-sparkles"></i></span><div style="min-width:0"><b>Jarvis</b><small>Kişisel asistan · yalnız Çağlar</small></div></div></div>'+
hyDal('Çağlar',0)+'</li></ul></div></div>'+
(y.length?'<div class="hn" style="margin-top:10px">Bağlısı bulunamayan: '+y.map(function(c){return '<span class="hyk mini" draggable="true" ondragstart="hySurBasla(event,\''+jq(c.id)+'\')" ondragend="hySurBit()">'+esc(c.ad)+'</span>'}).join(' ')+'</div>':'')+
'<div class="hn" style="margin-top:12px">Jarvis şirketin parçası değildir: çalışanlar Jarvis’e yazamaz; Jarvis yalnız senin komutunla CEO Orin’e prompt iletir. Bağlılık değişikliği telefona da eşitlenir.</div>'}
function hySurBasla(e,id){HY.sur=id;try{e.dataTransfer.setData('text/plain',id);e.dataTransfer.effectAllowed='move'}catch(er){}var el=e.target.closest?e.target.closest('.hyk'):null;if(el)el.classList.add('sur')}
function hySurBit(){HY.sur=null;document.querySelectorAll('.hyk.sur,.hyk.hov').forEach(function(x){x.classList.remove('sur','hov')})}
function hyUygun(id,hedef){if(!id||id==hedef)return false;if(hedef&&hyAlt(id)[hedef])return false;return true}
function hyUst(e,hedef){if(!hyUygun(HY.sur,hedef))return;e.preventDefault();var el=e.currentTarget;if(el)el.classList.add('hov')}
function hyBirak(e,hedef){e.preventDefault();var id=HY.sur||(e.dataTransfer&&e.dataTransfer.getData('text/plain'));hySurBit();hyBagla(id,hedef,true)}
function hyBagla(id,hedef,sor){var c=tm(id),h=hedef?tm(hedef):null,ad=h?h.ad:'Çağlar';if(!c||!hyUygun(id,hedef)){if(c&&hedef)toast('Bir çalışan kendi altındakine bağlanamaz');return false}if((c.bagli||'Orla')==ad)return false;
var yap=function(){tmSet(id,{bagli:ad});tmPush(id,{r:'sys',t:'Hiyerarşi değişti: '+c.ad+' artık '+ad+'’a bağlı.'});if(area=='team')render();if(!INFO.smoke)toast(c.ad+' → '+ad);if(typeof bulutTick=='function'&&!INFO.smoke)bulutTick()};
if(sor)confirmBox(esc(c.ad)+' artık <b>'+esc(ad)+'</b>’a bağlı olsun mu?',yap,'Bağla');else yap();return true}

// ---------- Jarvis sayfası ----------
var JV={taslak:null,metin:''};
function jvS(){S.jarvis=S.jarvis||{gonderilen:[]};return S.jarvis}
function jvTaslakYukle(){if(!API||!API.jarvis)return;API.jarvis.taslaklar().then(function(r){JV.taslak=r.ok?r.v:[];if(area=='team'&&pg=='jarvis')render()})}
function jarvisPage(){if(JV.taslak===null){JV.taslak=[];setTimeout(jvTaslakYukle,0)}var G=jvS().gonderilen.slice(-5).reverse(),o=tm('orin');
return '<div class="hrh"><span class="hya" style="width:52px;height:52px;font-size:24px;background:#2a2140;color:#c9b6ff"><i class="ti ti-sparkles"></i></span><div style="flex:1;min-width:0"><div class="en">Jarvis <span class="pill" style="background:#7c5cff2e;color:#c9b6ff">Kişisel asistan</span></div><div class="es">Yalnız seninle konuşur · şirket hiyerarşisinin dışında · çalışanlar Jarvis’e ulaşamaz</div></div></div>'+
'<div class="card" style="margin-top:14px"><div class="ch"><i class="ti ti-send"></i>Promptu şirkete gönder <span class="hn" style="margin-left:6px">yalnız CEO '+esc(o?o.ad:'Orin')+'’e gider</span></div>'+
'<div class="hn" style="margin-bottom:8px">Jarvis’in hazırladığı promptu buraya yapıştır ya da aşağıdaki taslaklardan seç. Gönderince Orin’in sohbetine “Çağlar’dan (Jarvis aracılığıyla)” olarak düşer ve Orin cevaplar.</div>'+
'<textarea id="jvm" class="in" style="width:100%;box-sizing:border-box;min-height:140px" placeholder="Promptu yapıştır…" oninput="JV.metin=this.value">'+esc(JV.metin)+'</textarea>'+
'<div style="display:flex;gap:8px;margin-top:8px;align-items:center"><button class="bt p" onclick="jvGonder()"><i class="ti ti-send"></i> Promptu Şirkete Gönder</button><span class="hn">Gönderim yalnız bu düğmeyle olur.</span></div></div>'+
'<div class="card" style="margin-top:14px"><div class="ch"><i class="ti ti-file-text"></i>Jarvis’in taslakları <span class="hn" style="margin-left:6px">Jarvis\\giden</span><button class="bt" style="margin-left:auto;min-height:30px;padding:4px 10px" onclick="JV.taslak=null;render()"><i class="ti ti-refresh"></i></button></div>'+
(JV.taslak.length?JV.taslak.map(function(t,i){return '<div class="kr"><div style="min-width:0">'+esc(t.ad)+'<div class="hn">'+new Date(t.ts).toLocaleString('tr-TR')+' · '+esc(isKisa(t.metin.replace(/\s+/g,' '),120))+'</div></div><button class="bt" style="min-height:30px;padding:4px 10px" onclick="jvSec('+i+')">Seç</button></div>'}).join(''):'<div class="hn">Taslak yok. Jarvis’le konuşurken taslaklar Jarvis\\giden klasörüne kaydedilir.</div>')+'</div>'+
(G.length?'<div class="card" style="margin-top:14px"><div class="ch"><i class="ti ti-history"></i>Son gönderilenler</div>'+G.map(function(g){return '<div class="kr"><div style="min-width:0">'+esc(isKisa(g.metin,140))+'<div class="hn">'+new Date(g.ts).toLocaleString('tr-TR')+' · Orin’e</div></div></div>'}).join('')+'</div>':'')}
function jvSec(i){var t=JV.taslak[i];if(!t)return;JV.metin=t.metin;render()}
function jvGonder(){var e=document.getElementById('jvm'),t=String(e?e.value:JV.metin).trim();if(!t){toast('Önce promptu yapıştır');return}
confirmBox('Prompt CEO Orin’e gönderilsin mi?<div class="hn" style="margin-top:6px">'+esc(isKisa(t,200))+'</div>',function(){jvIlet(t);JV.metin='';toast('Orin’e gönderildi');nav('team','calisan','orin')},'Gönder')}
function jvIlet(t){isTalimat('orin',t,'jarvis');jvS().gonderilen.push({ts:Date.now(),metin:t.slice(0,2000)});jvS().gonderilen=jvS().gonderilen.slice(-20);save()}

// Kenar çubuğu ve başlıklar
var _isSb=teamSb;teamSb=function(){var h=_isSb(),ek='<div class="si'+(pg=='jarvis'?' on':'')+'" data-nav="1" onclick="nav(\'team\',\'jarvis\',\'\')"><span class="hri" style="background:#2a2140;color:#c9b6ff"><i class="ti ti-sparkles"></i></span><div style="flex:1;min-width:0"><div>Jarvis</div><div class="rl">Kişisel asistan · yalnız Çağlar</div></div></div>',i=h.indexOf('<div class="g">Yönetim</div>');return i>=0?h.slice(0,i)+ek+h.slice(i):h+ek};
var _isTp=teamPage;teamPage=function(){if(pg=='jarvis')return jarvisPage();return _isTp()};
var _isTt=teamTitle;teamTitle=function(){if(pg=='ik'&&HRV=='hiy')return 'Çalışanlarım › İnsan Kaynakları › Hiyerarşi';if(pg=='jarvis')return 'Jarvis · kişisel asistan';return _isTt()};

// ---------- Testler (yalnız smoke) ----------
window.__v0714Test=function(){var R=[],T=TMS(),bk={is:S.isler?JSON.stringify(S.isler):null,ay:S.isAyar?JSON.stringify(S.isAyar):null,ch:JSON.stringify(T.sohbet),gor:T.gorev.slice(),m:JSON.stringify(T.m),ada:S.ada?JSON.stringify(S.ada):null,jv:S.jarvis?JSON.stringify(S.jarvis):null,st:ABN.st,cg:ISG.cagir,yz:ISG.yaz,zh:window.zekaHazir,zc:window.zekaCevapla};
function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}function bekle(ms){return new Promise(function(r){setTimeout(r,ms||80)})}
S.isler=[];S.isAyar={oto:true};ABN.st={kurulu:true,acik:true,gunluk:5,bugun:0,toplam:0,gunlukSohbet:60,sohbetBugun:0};window.zekaHazir=function(){return false};
var yz=[],cg=[];ISG.yaz=function(o){yz.push(o);return Promise.resolve({ok:true,v:{dosya:'is-emri-'+o.kim+'-2026-11-11-12-00-00',md:'C:/Giden/x.md'}})};
ISG.cagir=function(o){cg.push(o);return Promise.resolve({ok:true,v:{durum:'inceleme',dal:'is-emri/sage-2026-11-11-12-00',yol:'C:/w',degisen:['renderer/js/a.js'],test:{ok:true,gecen:250,toplam:250},commit:'abc123',metin:'Düğme eklendi.'}})};
// 1) Çalışanın cevabındaki İŞ İSTEĞİ satırı → onay kartı
T.sohbet.sage=[];tmPush('sage',{r:'o',t:'Araştırmayı yaptım.\nİŞ İSTEĞİ: {"baslik":"PDF dışa aktarma aracı","metin":"Araştırma raporlarını PDF olarak kaydeden araç ekle","onaylanirsa":"Raporlar PDF olur.","onaylanmazsa":"Raporlar elle kopyalanır."}\nÖĞRENİLENLER: []'});
var it=isS()[0],son=tmChat('sage').filter(function(m){return m.r=='o'}).slice(-1)[0];
t('Çalışan Claude’dan iş ister (İŞ İSTEĞİ satırı → onay)',it&&it.kim=='sage'&&it.durum=='onay'&&it.baslik=='PDF dışa aktarma aracı'&&it.sonuc.evet=='Raporlar PDF olur.',JSON.stringify(it));
t('İş isteği satırı sohbette gizlenir',son&&!/İŞ İSTEĞİ/.test(son.t)&&/Araştırmayı yaptım/.test(son.t),son&&son.t);
t('Çalışan sistem isteminde iş isteme kuralı',/İŞ İSTEĞİ:/.test(zekaSistem(tm('sage'))));
nav('team','calisan','orin');var h=document.getElementById('ct').innerHTML;
t('Orin sayfasında onay kartı (yeşil/kırmızı kutu, düğmeler)',/İş istekleri \(Claude’a\)/.test(h)&&/class="ev"><b>Onaylanırsa:<\/b>Raporlar PDF olur/.test(h)&&/Onayla, Claude’a ilet/.test(h),h.slice(0,300));
return isOnay(it.id,1).then(function(){return bekle(50)}).then(function(){
t('Onay → Giden iş emri yazılır',yz.length==1&&yz[0].id==it.id&&yz[0].kimAd=='Sage'&&it.emri&&/^is-emri-sage/.test(it.emri),JSON.stringify(yz));
t('Tam otomatik: Claude Code ayrı dalda yapar → kod incelemesi bekler',cg.length==1&&cg[0].dosya==it.emri&&it.durum=='inceleme'&&it.dal=='is-emri/sage-2026-11-11-12-00'&&it.test.gecen==250,JSON.stringify(it));
var m=tmChat('sage').filter(function(x){return x.r=='o'}).slice(-1)[0];t('Sonuç isteyen çalışanın sohbetinde',m&&/kod incelemesi bekliyor/.test(m.t)&&/is-emri\/sage/.test(m.t),m&&m.t);
nav('team','calisan','orin');var h2=document.getElementById('ct').innerHTML;t('Kartta “Kod incelemesi” adımı ve dal bilgisi',/Kod incelemesi bekliyor/.test(h2)&&/is-emri\/sage-2026/.test(h2)&&/250\/250/.test(h2));
// is_sonuc → yapıldı
var n=GELEN_TUR.is_sonuc({tur:'is_sonuc',id:it.id,kim:'sage',durum:'yapildi',metin:'Birleştirildi, 0.7.15'});var m2=tmChat('sage').filter(function(x){return x.r=='o'}).slice(-1)[0];
t('Gelen is_sonuc → çalışan “yapıldı” işaretler',n&&it.durum=='yapildi'&&/Yapıldı/.test(m2.t),JSON.stringify(it.durum));
// Red
var r2=isIste('kai',{baslik:'Gereksiz',metin:'x'});return isOnay(r2.id,0).then(function(){t('Reddedilen iş isteği iş emrine dönmez',r2.durum=='red'&&yz.length==1)})}).then(function(){
// Otomatik kapalıyken: yalnız iş emri (etkileşimli oturum yapar)
S.isAyar.oto=false;var r3=isIste('cleo',{baslik:'Şablon',metin:'Resmi yazı şablonu ekle'});return isOnay(r3.id,1).then(function(){return bekle(30)}).then(function(){t('Tam otomatik kapalıyken iş emri bekler (Claude Code sonraki oturum)',r3.durum=='onaylandi'&&cg.length==1&&/sonraki oturumda/.test(tmChat('cleo').slice(-1)[0].t))})}).then(function(){S.isAyar.oto=true;
// Limit dolunca beklemeye alınır
ISG.cagir=function(){return Promise.resolve({ok:false,err:'Bugünkü abonelik görevi sınırı doldu (5)'})};var r4=isIste('vera',{baslik:'Rapor',metin:'Kalite raporu şablonu'});return isOnay(r4.id,1).then(function(){return bekle(30)}).then(function(){t('Abonelik sınırı dolunca iş emri sonra yeniden denenir',r4.durum=='onaylandi'&&r4.sonraki>Date.now()&&/sınırı/.test(r4.not||''),JSON.stringify(r4))})}).then(function(){
// 2) Ada'nın güncelleme listesi
T.sohbet.echo=[];tmSend('echo','hata: Günü doldur ikinci projede yanlış hesaplıyor','mesaj');return bekle(120)}).then(function(){var L=isAdaListe(),h3=L.filter(function(x){return x.tur=='hata'})[0];
t('“hata:” mesajı Ada’nın listesine (yüksek öncelik)',h3&&h3.onc=='yuksek'&&/Günü doldur/.test(h3.baslik)&&h3.kaynak=='sohbet:echo',JSON.stringify(L));
t('Komut mesajı yapay zekâya gitmez',!tmChat('echo').some(function(x){return x.bek}));
var a=adaS(),bi=a.incelemeler;a.incelemeler=[{ts:123,ozet:'İlk yapılacak 5 iş 1. gelen kutusu iki aşamalı 2. saveNow hata yönetimi 3. abonelik status async',dosya:'r.md'}];delete a.incSync;
var L2=isAdaListe();t('Ada’nın inceleme bulguları listeye girer',L2.filter(function(x){return x.tur=='inceleme'}).length==3&&L2.some(function(x){return /saveNow/.test(x.baslik)}),JSON.stringify(L2.map(function(x){return x.baslik})));
a.incelemeler=bi;
nav('team','calisan','ada');var h4=document.getElementById('ct').innerHTML;t('Ada sayfasında güncelleme listesi ve sürüm önerisi düğmesi',/Güncelleme listesi/.test(h4)&&/Sürüm önerisi hazırla/.test(h4)&&/Günü doldur/.test(h4));
isOncDegis(h3.id);t('Öncelik değiştirilebilir',h3.onc=='orta');
var sv=isSurumOner();t('Ada sürüm önerisini onay kartıyla sunar',sv&&sv.tur=='surum'&&sv.durum=='onay'&&sv.maddeler.length>=4&&h3.durum=='surumde'&&sv.baslik.indexOf('Orvane '+isSonrakiSurum())==0,JSON.stringify(sv&&sv.baslik));
cg=[];ISG.cagir=function(o){cg.push(o);return Promise.resolve({ok:true,v:{durum:'inceleme',dal:'is-emri/ada-x',yol:'C:/w',degisen:['a.js'],test:{ok:true,gecen:1,toplam:1},metin:'tamam'}})};
return isOnay(sv.id,1).then(function(){return bekle(30)}).then(function(){t('Sürüm onayı → iş emri (maddelerle)',yz.slice(-1)[0].maddeler.length==sv.maddeler.length&&sv.durum=='inceleme');
GELEN_TUR.is_sonuc({tur:'is_sonuc',id:sv.id,kim:'ada',durum:'yapildi'});t('Sürüm yapılınca maddeleri de yapıldı olur',h3.durum=='yapildi')})}).then(function(){
// 3) Demirbaş
var bm=JSON.stringify(T.m);T.m.vera=Object.assign({},T.m.vera||{},{sil:1});t('Demirbaş çalışan silinemez (sil işareti yok sayılır)',!!tm('vera')&&tmAll().length>=15);
cfNo();tmDelMember('echo');t('Demirbaş silme engellenir (onay penceresi bile açılmaz)',!!tm('echo')&&document.getElementById('ov').style.display!='flex');
nav('team','calisan','echo');TMTAB='prof';render();var hp=document.getElementById('ct').innerHTML;t('Demirbaş profilde silme düğmesi yok, kilit notu var',!/Çalışanı sil/.test(hp)&&/Demirbaş çalışan · silinemez/.test(hp));TMTAB='genel';
tmSet('cdeneme',{yeni:1,ad:'Nova',gorev:'Deneme',grup:'ekip',bagli:'Orla',renk:'#5bb8ff'});nav('team','calisan','cdeneme');TMTAB='prof';render();t('Sonradan eklenen çalışan silinebilir',/Çalışanı sil/.test(document.getElementById('ct').innerHTML));TMTAB='genel';
// 6) Hiyerarşi
HRV='hiy';nav('team','ik');var hy=document.getElementById('ct').innerHTML;HRV='kart';t('İK sayfasında Hiyerarşi görünümü: Çağlar, Jarvis (dışarıda), sürüklenebilir kartlar',/class="hyt"/.test(hy)&&/Şirketin sahibi/.test(hy)&&/Jarvis/.test(hy)&&/draggable="true"/.test(hy)&&hy.indexOf('Orin')>0&&/hyj/.test(hy));
t('İK sayfasında Kartlar | Hiyerarşi seçimi, kenar çubuğunda Jarvis',/Hiyerarşi<\/span>/.test(hy)&&/Kartlar<\/span>/.test(hy)&&(nav('team','calisan','orin'),/Kişisel asistan · yalnız Çağlar/.test(document.getElementById('sb').innerHTML)));
t('Kart kendi altındakine bağlanamaz (döngü yok)',hyBagla('orla','echo',false)===false&&tm('orla').bagli!='Echo');
t('Sürükle-bırak bağlılığı değiştirir (yeni çalışan yerleşir)',hyBagla('cdeneme','nika',false)===true&&tm('cdeneme').bagli=='Nika'&&tmChain(tm('cdeneme')).join('>').indexOf('Nika>Nova')>0,tmChain(tm('cdeneme')).join('>'));
t('Jarvis çalışan listesinde yok (çalışanlar Jarvis’e ulaşamaz)',!tmAll().some(function(c){return /jarvis/i.test(c.id+c.ad)})&&!/Jarvis/.test(zekaSistem(tm('sage'))));
T.m=JSON.parse(bm);
// 4) Gelen kutusu talimat/gorev + Jarvis yalnız CEO
T.sohbet.orin=[];T.sohbet.sage=[];GELEN_TUR.talimat({tur:'talimat',kim:'sage',metin:'Haftalık özet yaz',_dosya:'jarvis-2026.json'});
var o1=tmChat('orin').slice(-1)[0];t('Jarvis talimatı yalnız CEO’ya düşer (Çağlar’dan, Jarvis aracılığıyla)',o1&&o1.r=='ben'&&/^Çağlar’dan \(Jarvis aracılığıyla\): Haftalık özet yaz/.test(o1.t)&&o1.bek&&!tmChat('sage').length,JSON.stringify(o1));
GELEN_TUR.talimat({tur:'talimat',kim:'sage',metin:'Kaynakları kontrol et'});t('Claude Code talimatı ilgili çalışana düşer',/Kaynakları kontrol et/.test((tmChat('sage').slice(-1)[0]||{}).t||''));
var gn=T.gorev.length;GELEN_TUR.gorev({tur:'gorev',kim:'sage',metin:'Yapay zekâ haberlerini araştır'});var gg=T.gorev.slice(-1)[0];t('Gelen “gorev” görev açar (Sage’e araştırma)',T.gorev.length==gn+1&&gg.kim=='sage'&&gg.kaynak=='claude'&&/haberlerini/.test(gg.metin),JSON.stringify(gg));
GELEN_TUR.gorev({tur:'gorev',kim:'sage',metin:'X araştır',kaynak:'jarvis'});t('Jarvis görev açamaz; CEO’ya öneri olarak gider',T.gorev.length==gn+1&&/Görev önerisi \(Sage için\): X araştır/.test(tmChat('orin').slice(-1)[0].t));
nav('team','jarvis');var hj=document.getElementById('ct').innerHTML;t('Jarvis sayfasında “Promptu Şirkete Gönder” düğmesi',/Promptu Şirkete Gönder/.test(hj)&&/yalnız CEO/.test(hj));
jvIlet('Deneme promptu');t('Jarvis sayfasından gönderim Orin’e gider ve kaydedilir',/Jarvis aracılığıyla\): Deneme promptu/.test(tmChat('orin').slice(-1)[0].t)&&jvS().gonderilen.slice(-1)[0].metin=='Deneme promptu');
// 5) Sohbet silme
T.sohbet.mia=[];tmPush('mia',{r:'ben',t:'bir',tur:'mesaj'});tmPush('mia',{r:'o',t:'iki'});tmPush('mia',{r:'ben',t:'üç',tur:'mesaj'});var ms=tmChat('mia');
t('Her mesajın kimliği var',ms.every(function(x){return x.id}));
nav('team','calisan','mia');var hs=document.getElementById('ct').innerHTML;t('Sohbette mesaj silme ve “Sohbeti temizle”',/class="mdel"/.test(hs)&&/Sohbeti temizle/.test(hs));
tmMsgSilUygula('mia',ms[1].id);t('Tek mesaj silinir',tmChat('mia').length==2&&!tmChat('mia').some(function(x){return x.t=='iki'}));
var oz=bulutOzet();t('Silinen mesaj telefon özetinde yok',oz.ekip.sohbet.mia.length==2&&oz.ekip.sohbet.mia.every(function(x){return x.id&&x.t!='iki'}));
bulutUygula({id:'tel-sil-1',tur:'mesaj_sil',ts:Date.now(),veri:{kim:'mia',id:tmChat('mia')[0].id}});t('Telefondan tek mesaj silme uygulanır',tmChat('mia').length==1&&tmChat('mia')[0].t=='üç');
var ts=Date.now();tmPush('mia',{r:'o',t:'sonra',ts:ts+5000});bulutUygula({id:'tel-tem-1',tur:'sohbet_temizle',ts:ts,veri:{kim:'mia'}});t('Telefondan “Sohbeti temizle” uygulanır (sonraki mesajlar kalır)',tmChat('mia').length==1&&tmChat('mia')[0].t=='sonra',JSON.stringify(tmChat('mia')));
tmTemizleUygula('mia',Date.now()+10000);t('Masaüstünde sohbet temizlenir',tmChat('mia').length==0);
return R}).catch(function(e){t('0.7.14 testi',false,e.stack)}).then(function(){if(bk.is)S.isler=JSON.parse(bk.is);else delete S.isler;if(bk.ay)S.isAyar=JSON.parse(bk.ay);else delete S.isAyar;T.sohbet=JSON.parse(bk.ch);T.gorev=bk.gor;T.m=JSON.parse(bk.m);if(bk.ada)S.ada=JSON.parse(bk.ada);else delete S.ada;if(bk.jv)S.jarvis=JSON.parse(bk.jv);else delete S.jarvis;
ABN.st=bk.st;ISG.cagir=bk.cg;ISG.yaz=bk.yz;window.zekaHazir=bk.zh;window.zekaCevapla=bk.zc;cfNo&&cfNo();TMTAB='genel';save();nav('home','gun',TODAY);return R})};
