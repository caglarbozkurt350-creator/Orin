// Orvane 0.7.2 · Claude aboneliğine iş yönlendirme
// Akış: (1) çalışan, ucuz API (Haiku) ile görevi Claude Code'a net bir talimata çevirir
//       (2) asıl iş aylık abonelikte Claude Code ile yapılır (claude -p, API kredisi harcanmaz)
//       (3) sonuçtan öğrenilenler Haiku ile çıkarılır → gelişim talebi olarak Nika (İK) → Orin (CEO) onayına gider
var ABN={st:null,bekle:0,isaret:null,cagir:function(o){return API.abonelik.calistir(o)},sor:function(o){return API.zeka.sor(o)}};
function abnDurum(){if(!API||!API.abonelik)return Promise.resolve(null);return API.abonelik.status().then(function(r){ABN.st=r.ok?r.v:null;return ABN.st})}
function abnAcik(){var s=ABN.st;return !!(s&&s.kurulu&&s.acik)}
function abnHazir(){var s=ABN.st;return abnAcik()&&s.bugun<s.gunluk&&!(s.test&&s.test.ok===false&&s.test.kod=='giris')&&Date.now()>=ABN.bekle&&tmOnline()}
function abnUygun(g){return !!g&&(g.abn===true||(g.abn==null&&abnAcik()&&(g.sureDk||g.tokenLimit)))}
var _abnZh=zekaHazir;function abnApiVar(){return _abnZh()}
// Sohbet cevapları da abonelikten (Çağlar: API tüketimi en az). API yalnız abonelik kullanılamazsa yedek.
function abnSohbetHazir(){var s=ABN.st;return abnAcik()&&(s.sohbetBugun||0)<(s.gunlukSohbet||0)&&Date.now()>=ABN.bekle&&tmOnline()}
zekaHazir=function(){return abnSohbetHazir()||_abnZh()};
var ABN_MODEL={'claude-sonnet-5-5':'sonnet','claude-haiku-5-5':'haiku','claude-opus-5-5':'opus'};
function abnCevapla(id){var c=tm(id);if(!c||ZK.yaz[id])return Promise.resolve();var msgs=zekaGecmis(id);if(!msgs.length||msgs[msgs.length-1].role!='user')return Promise.resolve();
ZK.yaz[id]=1;TMSCR=true;if(area=='team')render();
var son=msgs.slice(-12).map(function(m){return (m.role=='user'?'Çağlar':c.ad)+': '+(typeof m.content=='string'?m.content:JSON.stringify(m.content))}).join('\n\n');
return ABN.cagir({kim:id,tur:'sohbet',sistemTam:true,araclar:'',maxTur:1,model:ABN_MODEL[tmModel(c)]||'haiku',zamanAsimiMs:120000,
sistem:zekaSistem(c)+'\n\n'+zekaBaglam(c)+'\nAşağıda Çağlar’la sohbetin son kısmı var. Yalnız '+c.ad+' olarak son mesaja cevap yaz; başına adını yazma.',istem:son})
.then(function(r){if(!r.ok)throw new Error(r.err);tmChat(id).forEach(function(m){if(m.bek)delete m.bek});tmPush(id,{r:'o',t:r.v.metin,model:'abonelik · '+(r.v.model||'claude')});if(ABN.st)ABN.st.sohbetBugun=(ABN.st.sohbetBugun||0)+1;ZK.hata='';save()},
function(e){var m=String(e&&e.message||e);if(/limit/i.test(m))ABN.bekle=Date.now()+30*60000;ZK.hata='Abonelik: '+m;
if(_abnZh()){delete ZK.yaz[id];return _abnZc(id)}})
.then(function(){delete ZK.yaz[id];if(area=='team')render()})}
var _abnZc=zekaCevapla;zekaCevapla=function(id){if(abnSohbetHazir())return abnCevapla(id);return _abnZc(id)};
function abnJson(t){var m=String(t||'').match(/\[[\s\S]*\]/);if(!m)return [];try{var a=JSON.parse(m[0]);return Array.isArray(a)?a:[]}catch(e){return []}}

// Görevi abonelikte yap
function abnGorev(g){var c=tm(g.kim);if(!c||g.durum!='acik'||g.sonuc||ZK.yaz['g'+g.id])return Promise.resolve();
if(!abnHazir()){g.abnNot=abnAcik()?(ABN.st.bugun>=ABN.st.gunluk?'Bugünkü abonelik sınırı doldu; yarın yapılacak':'Abonelik şu an hazır değil; bekliyor'):'';save();return Promise.resolve()}
ZK.yaz['g'+g.id]=1;g.durum='calisiyor';g.yol2='abonelik';delete g.hata;delete g.abnNot;save();if(area=='team')render();
// API'siz: görev doğrudan abonelikteki Claude Code'a gider; öğrenilenler aynı cevabın sonunda JSON olarak istenir
var komut='Doğrudan görev (Çağlar’dan): '+g.metin+(g.son?'\nSon tarih: '+tmSon(g.son):'')+'\n\nBağlam: '+zekaBaglam(c);g.komut=komut;
return ABN.cagir({kim:g.kim,istem:komut,model:ABN_MODEL[tmModel(c)]||undefined,sistem:zekaSistem(c)+'\nBu iş Orvane’den otomatik geliyor; Çağlar şu an seni izlemiyor. Sonucu Türkçe, kısa başlıklarla ve doğrudan yaz. Dosya oluşturma ya da değiştirme; yalnız oku ve araştır.\n'+ABN_OGREN,zamanAsimiMs:g.bitis?Math.max(60000,g.bitis-Date.now()):0})
.then(function(r){if(!r.ok){var e=new Error(r.err);throw e}var v=r.v,ay=abnOgrenAyikla(v.metin);g.sonuc=ay.metin;g.durum='bitti';g.bts=Date.now();g.abnTur=v.tur;g.abnToken=v.token;g.abnUsd=v.apiKarsiligiUsd;
tmPush(g.kim,{r:'o',t:'Görev tamamlandı (Claude aboneliğinde): '+g.metin+'\n\n'+ay.metin,model:'abonelik · '+(v.model||'claude')});
if(ABN.st){ABN.st.bugun++;ABN.st.toplam++}save();return abnOgrenEkle(g,ay.liste)})
.catch(function(e){var m=String(e&&e.message||e);g.durum='acik';if(/limit/i.test(m)){ABN.bekle=Date.now()+30*60000;g.abnNot='Abonelik limiti doldu; sıfırlanınca yeniden denenecek'}else if(/sınırı doldu/.test(m)){g.abnNot=m}else g.hata='Abonelik: '+m;
// Gerektiğinde API: abonelik limit/sınır yüzünden yapamadıysa ve API hazırsa görev API ile yapılır
if(g.abnNot&&ABN.apiVar()){g.abn=false;g.abnNot='Abonelik kullanılamadı; API ile yapılıyor';save();delete ZK.yaz['g'+g.id];return _abnZg(g)}save()})
.then(function(){delete ZK.yaz['g'+g.id];if(area=='team')render()})}

// Öğrenilenler: aynı abonelik cevabının sonundaki "ÖĞRENİLENLER: [...]" satırından → gelişim talebi (Nika → Orin onayı)
var ABN_OGREN='İşin sonunda, cevabının EN SONUNA ayrı bir satırda, bu işten ileride işine yarayacak kalıcı bilgi/becerileri (en fazla 3) şu biçimde yaz: ÖĞRENİLENLER: [{"tur":"hafiza"|"beceri","ad":"kısa ad","metin":"tek cümle"}] — önemli bir şey yoksa ÖĞRENİLENLER: [] yaz. Kişisel/gizli bilgi yazma.';
function abnOgrenAyikla(t){t=String(t||'');var i=t.search(/ÖĞRENİLENLER\s*:/i);if(i<0)return{metin:t.trim(),liste:[]};
var liste=abnJson(t.slice(i)).filter(function(x){return x&&(x.tur=='hafiza'||x.tur=='beceri')&&(x.metin||x.ad)}).slice(0,3);return{metin:t.slice(0,i).trim(),liste:liste}}
function abnOgrenEkle(g,a){a.forEach(function(x){tmGelNew(g.kim,x.tur,String(x.ad||'').slice(0,60),String(x.metin||x.ad).slice(0,300),'abonelik')});g.ogrenilen=a.length;
if(a.length)tmPush(g.kim,{r:'sys',t:'Bu işten '+a.length+' yeni bilgi/beceri öğrendim; Nika’nın ve Orin’in onayına gönderildi.'});save();return a}

// Görev yönlendirme: abonelik uygunsa API yerine abonelik
var _abnZg=zekaGorev;zekaGorev=function(g){if(g&&g.abn==null&&ABN.isaret!=null)g.abn=ABN.isaret;if(abnUygun(g))return abnGorev(g);return _abnZg(g)};
var _abnTn=tmTaskNew;tmTaskNew=function(kim,metin,onc,son,bilgi,lim){ABN.isaret=(typeof TF!='undefined'&&TF.abn===false)?false:(abnAcik()?true:null);try{var g=_abnTn(kim,metin,onc,son,bilgi,lim);if(g&&g.abn==null&&ABN.isaret!=null){g.abn=ABN.isaret;if(abnUygun(g))abnGorev(g)}return g}finally{ABN.isaret=null;if(typeof TF!='undefined')delete TF.abn}};
function abnTara(){if(!abnHazir())return;TMS().gorev.forEach(function(g){if(g.durum=='calisiyor'&&!ZK.yaz['g'+g.id])g.durum='acik';if(g.durum=='acik'&&!g.sonuc&&!g.hata&&abnUygun(g)&&!g.bilgiOnly)abnGorev(g)})}
var _abnTf=tmTaskForm;tmTaskForm=function(c){var h=_abnTf(c);if(!abnAcik())return h;var on=TF.abn!==false,row='<div class="dmr"><span class="tg2'+(on?' on':'')+'" onclick="this.classList.toggle(\'on\');TF.abn=this.classList.contains(\'on\')"></span>Claude aboneliğinde yap <span class="hn">(API kredisi harcamaz; kapatırsan API ile yapılır)</span></div>',i=h.indexOf('<div class="dmr"><i class="ti ti-calendar">');return i>=0?h.slice(0,i)+row+h.slice(i):h};
if(typeof bulutUygula=='function'){var _abnBu=bulutUygula;bulutUygula=function(e){_abnBu(e);if(e.tur=='gorev')setTimeout(abnTara,1500)}}

// Ayarlar › Yapay zekâ: abonelik kartı
function abnKart(){var s=ABN.st;if(!API||!API.abonelik)return '';
if(!s)return '<div class="card"><div class="ch"><i class="ti ti-cloud-computing"></i>Claude aboneliği (Claude Code)</div><div class="hn">Yükleniyor…</div></div>';
var t=s.test,sec=function(k,l,v){return '<select class="in" style="width:auto" onchange="abnAyar({'+k+':this.value})">'+l.map(function(x){return '<option value="'+x[0]+'"'+(String(v)==String(x[0])?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>'};
return '<div class="card"><div class="ch"><i class="ti ti-cloud-computing"></i>Claude aboneliği (Claude Code)</div>'+
'<div class="hn" style="margin-bottom:8px">Ağır işler aylık Claude aboneliğinde yapılır; API yalnız kısa komut hazırlamak ve öğrenilenleri çıkarmak için kullanılır. Öğrenilenler Nika’nın ve Orin’in onayıyla eklenir. Bu işler abonelikteki 5 saatlik ve haftalık kullanım limitinden yer.</div>'+
'<div class="kr"><div>Durum<div class="hn">'+(s.kurulu?'Claude Code kurulu'+(s.surum?' · '+esc(s.surum):''):'Claude Code kurulu değil')+(t?' · son deneme: '+(t.ok?'bağlı':'hata: '+esc(t.hata||'')):'')+'</div></div><span style="display:flex;gap:6px;align-items:center"><button class="bt" onclick="abnTest()"'+(s.kurulu?'':' disabled')+'>Bağlantıyı dene</button><span class="tg2'+(s.acik?' on':'')+'" title="Aboneliğe yönlendir" onclick="abnAyar({acik:!this.classList.contains(\'on\')})"></span></span></div>'+
'<div class="kr"><span>Günlük görev sınırı<div class="hn">Bugün '+s.bugun+' / '+s.gunluk+' · toplam '+s.toplam+'</div></span>'+sec('gunluk',[[1,'1'],[3,'3'],[5,'5'],[10,'10'],[20,'20']],s.gunluk)+'</div>'+
'<div class="kr"><span>Günlük sohbet cevabı sınırı<div class="hn">Bugün '+(s.sohbetBugun||0)+' / '+(s.gunlukSohbet||0)+' · her cevap ≈ 1 bin token, birkaç saniye</div></span>'+sec('gunlukSohbet',[[20,'20'],[60,'60'],[150,'150']],s.gunlukSohbet)+'</div>'+
'<div class="kr"><span>Model<div class="hn">Sonnet dengeli; Haiku limitten az yer; Opus en güçlü ama limiti hızlı doldurur</div></span>'+sec('model',[['sonnet','Sonnet'],['haiku','Haiku'],['opus','Opus']],s.model)+'</div>'+
'<div class="kr"><span>İş başına en fazla</span><span style="display:flex;gap:6px">'+sec('maxTur',[[6,'6 tur'],[12,'12 tur'],[20,'20 tur']],s.maxTur)+sec('sureDk',[[5,'5 dk'],[15,'15 dk'],[30,'30 dk']],s.sureDk)+'</span></div>'+
(s.kurulu?'':'<div class="hn" style="margin-top:6px">Kurulum: Claude Code’u kur, sonra bir kez terminalde <b>claude</b> yazıp abonelik hesabınla giriş yap.</div>')+'</div>'}
function abnAyar(a){API.abonelik.ayar(a).then(function(r){if(r.ok)ABN.st=r.v;else toast(r.err);if(a.acik!=null)toast(a.acik?'Ağır işler artık abonelikte yapılacak':'Abonelik yönlendirmesi kapatıldı');if(area=='set')render();if(a.acik)setTimeout(abnTara,500)})}
function abnTest(){toast('Abonelik deneniyor…');API.abonelik.test().then(function(r){if(r.ok){ABN.st=r.v;toast(r.v.test&&r.v.test.ok?'Abonelik bağlı':'Bağlanamadı: '+(r.v.test&&r.v.test.hata||''))}if(area=='set')render()})}
var _abnPz=P.zeka;P.zeka=function(){if(!ABN.st)abnDurum().then(function(){if(pg=='zeka')render()});return _abnPz()+abnKart()};
// Görev kartında abonelik notu
var _abnLim=typeof tmLimRozet=='function'?tmLimRozet:null;
abnDurum().then(function(){if(!INFO.smoke){setTimeout(function(){abnTara();if(abnSohbetHazir()&&typeof zekaBekleyenler=='function')zekaBekleyenler()},6000);setInterval(abnTara,10*60000)}});

// Testler (yalnız smoke): CLI ve API taklitle
window.__abnTest=function(){var R=[],T=TMS(),bk={st:ABN.st,cagir:ABN.cagir,sor:ABN.sor,gor:T.gorev.slice(),gel:T.gel.slice(),zk:ZK.st,ch:JSON.stringify(T.sohbet)};function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
var istek=[];ABN.st={kurulu:true,acik:true,gunluk:5,bugun:0,toplam:0,model:'sonnet',maxTur:12,sureDk:15,test:{ok:true}};
ABN.sor=function(o){istek.push(o);if(/JSON dizi/.test(o.system))return Promise.resolve({ok:true,v:{metin:'[{"tur":"hafiza","ad":"Kaynak","metin":"Çağlar kısa özet ister."},{"tur":"beceri","ad":"Araştırma özeti","metin":"Kaynakları 5 maddede özetler."}]'}});return Promise.resolve({ok:true,v:{metin:'TALİMAT: kısa araştırma yap'}})};
var cagri=[];ABN.cagir=function(o){cagri.push(o);return Promise.resolve({ok:true,v:{metin:'Sonuç: 3 kaynak bulundu.\n\nÖĞRENİLENLER: [{"tur":"hafiza","ad":"Kaynak","metin":"Çağlar kısa özet ister."},{"tur":"beceri","ad":"Araştırma özeti","metin":"Kaynakları 5 maddede özetler."}]',tur:3,token:12000,apiKarsiligiUsd:0.02,model:'claude-sonnet-5-5'}})};
var zh=window.zekaHazir;window.zekaHazir=function(){return true};
var g=tmTaskNew('sage','Yapay zekâ haberlerini özetle','normal','',false,{});
return new Promise(function(res){setTimeout(res,300)}).then(function(){
t('Abonelik açıkken görev aboneliğe gider',g.abn===true&&cagri.length==1&&cagri[0].kim=='sage',JSON.stringify({abn:g.abn,c:cagri.length}));
t('Görevde API kullanılmaz (komut doğrudan abonelikte)',istek.length==0&&cagri[0]&&/Doğrudan görev/.test(cagri[0].istem)&&/ÖĞRENİLENLER/.test(cagri[0].sistem),JSON.stringify({istek:istek.length}));
t('Sonuç görevde ve sohbette (öğrenilenler satırı gizli)',g.durum=='bitti'&&/3 kaynak/.test(g.sonuc)&&!/ÖĞRENİLENLER/.test(g.sonuc)&&/Claude aboneliğinde/.test(tmChat('sage').filter(function(m){return m.r=='o'}).slice(-1)[0].t));
var gl=T.gel.filter(function(x){return x.kim=='sage'&&x.kimden=='abonelik'});
t('Öğrenilenler Nika onayına gider',gl.length==2&&gl.every(function(x){return x.asama=='ik'}),JSON.stringify(gl));
t('Sistem istemi dosya yazmayı yasaklar',/Dosya oluşturma ya da değiştirme/.test(cagri[0].sistem));
TF.abn=false;var g2=tmTaskNew('sage','Kısa not','normal','',false,{});t('Formda kapatılırsa aboneliğe gitmez',g2.abn===false&&cagri.length==1);
ABN.cagir=function(){return Promise.resolve({ok:false,err:'Abonelik kullanım limiti doldu; sıfırlanınca tekrar denenecek'})};
var g3=tmTaskNew('ada','Kod incele','normal','',false,{});return new Promise(function(res){setTimeout(res,300)}).then(function(){
t('Limit dolunca görev açık kalır ve beklenir',g3.durum=='acik'&&/limit/.test(g3.abnNot||'')&&ABN.bekle>Date.now(),JSON.stringify(g3));ABN.bekle=0;
ABN.st.bugun=5;var g4=tmTaskNew('ada','Bir iş daha','normal','',false,{});t('Günlük sınır dolunca başlamaz',g4.durum=='acik'&&/sınırı doldu/.test(g4.abnNot||''),JSON.stringify(g4));
ABN.st.acik=false;var g5=tmTaskNew('ada','Kapalıyken','normal','',false,{});t('Yönlendirme kapalıyken aboneliğe gitmez',!g5.abn);
ABN.st.acik=true;ABN.st.bugun=0;nav('set','zeka');var h=document.getElementById('ct').innerHTML;t('Yapay zekâ ayarında abonelik kartı',/Claude aboneliği \(Claude Code\)/.test(h)&&/Günlük görev sınırı/.test(h)&&/Nika’nın ve Orin’in onayıyla/.test(h));
nav('team','calisan','ada');hrOpen('ada','gorev');var f=document.getElementById('hrm')?document.getElementById('hrm').innerHTML:'';t('Görev formunda abonelik seçeneği',/Claude aboneliğinde yap/.test(f),f.slice(0,200));if(typeof hrClose=='function')hrClose(true);
// Sohbet abonelikten: hafif istem (sistemTam), araç yok, API'ye gitmez
ABN.st.gunlukSohbet=60;ABN.st.sohbetBugun=0;var sc=[];ABN.cagir=function(o){sc.push(o);return Promise.resolve({ok:true,v:{metin:'Merhaba Çağlar, buradayım.',tur:1,token:700,model:'claude-sonnet-5-5'}})};
T.sohbet.orin=[];tmSend('orin','Merhaba Orin','mesaj');return new Promise(function(res){setTimeout(res,300)}).then(function(){var ch=tmChat('orin'),son=ch[ch.length-1];
t('Sohbet cevabı abonelikten gelir',sc.length==1&&sc[0].tur=='sohbet'&&sc[0].sistemTam===true&&sc[0].araclar===''&&son.r=='o'&&/abonelik/.test(son.model),JSON.stringify({sc:sc.length,son:son}));
t('Orin Sonnet ile cevaplar',sc[0]&&sc[0].model=='sonnet');t('Sohbette API isteği yok',istek.length==0);t('Bekleyen mesaj kalmaz',!ch.some(function(m){return m.bek}));
ABN.st.sohbetBugun=60;t('Sohbet sınırı dolunca abonelik kullanılmaz',!abnSohbetHazir());})
})}).catch(function(e){t('Abonelik testi',false,e.stack)}).then(function(){window.zekaHazir=zh;ABN.st=bk.st;ABN.cagir=bk.cagir;ABN.sor=bk.sor;T.gorev=bk.gor;T.gel=bk.gel;ZK.st=bk.zk;T.sohbet=JSON.parse(bk.ch);ABN.bekle=0;save();nav('home','gun',TODAY);return R})};

// Gelen kutusu (0.7.5): Claude Code'un bıraktığı mesajlar ve gelişim talepleri çalışanlara iletilir.
// {tur:'mesaj', kim, metin} → çalışanın sohbetine · {tur:'gelisim', kim, gtur:'hafiza'|'beceri', ad, metin} → Nika → Orin onayı
function gelenIsle(){if(!API||!API.gelen)return Promise.resolve(0);return API.gelen().then(function(r){if(!r.ok||!r.v.length)return 0;var n=0,ozet={};
r.v.forEach(function(x){if(!x||!tm(x.kim))return;if(x.tur=='mesaj'){var a=abnOgrenAyikla(x.metin);tmPush(x.kim,{r:'o',t:a.metin,model:x.model||'Claude Code'});abnOgrenEkle({kim:x.kim},a.liste);n++}
else if(x.tur=='gelisim'&&(x.gtur=='hafiza'||x.gtur=='beceri')){tmGelNew(x.kim,x.gtur,String(x.ad||'').slice(0,60),String(x.metin||'').slice(0,400),'claude');ozet[x.kim]=(ozet[x.kim]||0)+1;n++}});
Object.keys(ozet).forEach(function(k){tmPush(k,{r:'sys',t:'Claude Code '+ozet[k]+' öğrenme maddesi gönderdi; Nika’nın ve Orin’in onayına gitti.'})});
if(n){save();if(area=='team')render();toast('Gelen kutusu: '+n+' öğe çalışanlara iletildi')}return n})}
if(!INFO.smoke){setTimeout(gelenIsle,5000);setInterval(gelenIsle,2*60000)}
ABN.apiVar=function(){return _abnZh()};
window.__gelenTest=function(){var R=[],T=TMS(),bk={gel:T.gel.slice(),ch:JSON.stringify(T.sohbet)};function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
return gelenIsle().then(function(n){var g=T.gel.filter(function(x){return x.kimden=='claude'&&x.kim=='ada'}),son=tmChat('ada').filter(function(m){return m.r=='o'}).slice(-1)[0];
t('Gelen kutusu öğeleri işlenir',n==3,n);t('Gelişim talepleri Nika onayına gider',g.length==2&&g.every(function(x){return x.asama=='ik'}),JSON.stringify(g));
t('Mesaj çalışanın sohbetine düşer (öğrenilenler satırı gizli)',son&&/Rapor/.test(son.t)&&!/ÖĞRENİLENLER/.test(son.t),son&&son.t);
return gelenIsle()}).then(function(n2){t('İşlenen dosya tekrar işlenmez',n2==0,n2)}).catch(function(e){t('Gelen kutusu testi',false,e.stack)})
.then(function(){T.gel=bk.gel;T.sohbet=JSON.parse(bk.ch);save();return R})};
