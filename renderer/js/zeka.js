// Orvane 0.7.0 · Yapay zekâ çalışanları: Claude ile cevap, çalışan başına model, aylık bütçe, canlı harcama grafiği
var ZK={st:null,yaz:{},hata:''};
var MODEL_AD={'claude-opus-5-5':'Opus 5.5','claude-sonnet-5-5':'Sonnet 5.5','claude-haiku-5-5':'Haiku 5.5'};
function zekaDurum(){if(!API||!API.zeka)return Promise.resolve(null);return call(API.zeka.status()).then(function(s){ZK.st=s;return s},function(){return null})}
function zekaHazir(){var s=ZK.st;return !!(s&&s.anahtar&&s.harcama.usd<s.butce&&tmOnline())}
function tmModel(c){var m=(TMS().m[c.id]||{}).model;return m||(c.id=='orin'||c.id=='orla'?'claude-sonnet-5-5':'claude-haiku-5-5')}

// ---------- Sistem istemi (sabit kısım önbelleğe alınır, değişen bilgiler ayrı blokta) ----------
function zekaSistem(c){var b=tmSkills(c.id).map(function(s){return s.ad+' ('+LVL[s.sv]+')'}).join(', '),h=tmMem(c.id).map(function(m){return '- '+m.metin}).join('\n');
return 'Sen '+c.ad+'’sın. Orvane adlı küçük bir yapay zekâ şirketinde çalışıyorsun. Görevin: '+c.gorev+' ('+tmDesc(c)+'). Bağlılık zinciri: '+tmChain(c).join(' › ')+'.\n'+
'Şirketin sahibi Çağlar; seninle o konuşuyor. Ekip: '+tmAll().map(function(x){return x.ad+' ('+x.gorev+')'}).join(', ')+'.\n'+
'Kurallar: Türkçe yaz. Kısa, net ve samimi ama profesyonel ol; gereksiz giriş yapma. Bilmediğin bilgiyi uydurma. Bu sürümde dosyaya yazma, takvime ekleme ya da internete erişme gibi işlemleri kendin yapamazsın; böyle bir şey istenirse bunu açıkça söyle ve Çağlar’ın ne yapabileceğini öner.\n'+
(b?'Becerilerin: '+b+'.\n':'')+(h?'Hafızan (kalıcı bildiklerin):\n'+h+'\n':'')}
function zekaBaglam(c){var a=[];a.push('Bugün '+lab(TODAY)+'.');
if(c.id=='echo'){a.push('İş günü kayıtları (Orvane’dan, gerçek veri): '+echoWeek().t+' '+echoMonth().t+' '+echoMissing().t);tmFacts(c).forEach(function(x){a.push(x)})}
var g=tmOpen(c.id=='orin'?null:c.id);if(g.length)a.push('Açık görevler: '+g.slice(0,8).map(function(x){return (tm(x.kim)||{}).ad+': '+x.metin+(x.onc=='acil'?' (acil)':'')}).join(' | '));
var p=tmGelFor(c);if(p.length)a.push('Onay bekleyen gelişim talepleri: '+p.map(function(x){return (tm(x.kim)||{}).ad+' · '+tmGelLabel(x)}).join(' | '));
return a.join('\n')}
function zekaGecmis(id){var a=tmChat(id).slice(-24),m=[];a.forEach(function(x){var role=x.r=='o'?'assistant':'user',t=x.r=='sys'?'[Bilgi] '+x.t:x.tur=='not'?'(Not) '+x.t:x.t;if(!t)return;var l=m[m.length-1];if(l&&l.role==role)l.content+='\n\n'+t;else m.push({role:role,content:t})});
while(m.length&&m[0].role!='user')m.shift();return m}

// ---------- Cevap ----------
function zekaCevapla(id){var c=tm(id);if(!c||ZK.yaz[id]||!zekaHazir())return Promise.resolve();var msgs=zekaGecmis(id);if(!msgs.length||msgs[msgs.length-1].role!='user')return Promise.resolve();
ZK.yaz[id]=1;TMSCR=true;if(area=='team')render();
return call(API.zeka.sor({kim:id,model:tmModel(c),system:zekaSistem(c)+'\n\n'+zekaBaglam(c),messages:msgs})).then(function(r){
tmChat(id).forEach(function(m){if(m.bek)delete m.bek});tmPush(id,{r:'o',t:r.metin,model:r.model,usd:r.usd});
if(ZK.st){ZK.st.harcama=r.harcama;ZK.st.aylar=r.aylar}ZK.hata='';save();if(r.harcama.usd>=r.butce*0.9)toast('Yapay zekâ bütçesinin %'+Math.round(r.harcama.usd/r.butce*100)+'’i kullanıldı')},
function(e){ZK.hata=e.message;toast(e.message);if(/bütçe/.test(e.message))zekaDurum()}).then(function(){delete ZK.yaz[id];if(area=='team'||(area=='set'&&pg=='zeka'))render()})}
function zekaBekleyenler(){var T=TMS(),n=0;Object.keys(T.sohbet).forEach(function(id){var a=T.sohbet[id];if(a.length&&a[a.length-1].bek&&tm(id)){n++;zekaCevapla(id)}});return n}

// ---------- Harcama: kart ve canlı grafikler ----------
function usd(x){return '$'+(x<1?x.toFixed(3):x.toFixed(2)).replace('.',',')}
function zekaKart(c,co){var s=ZK.st;if(!s||!s.anahtar)return '<div class="tk"><small><i class="ti ti-coin"></i> Token / dolar <span>'+(co?'şirket toplamı':AY[pk(TODAY).getMonth()])+'</span></small><div class="tkr"><b>—</b><span class="sm">/ — token</span><b class="usd">$0</b></div><div class="pb"><i style="width:0%"></i></div><em>Yapay zekâ bağlı değil · Ayarlar › Yapay zekâ</em></div>';
var h=s.harcama,k=co?{usd:h.usd,token:h.giris+h.cikis+h.onbellek}:(h.kisi[c.id]||{usd:0,token:0}),yz=Math.min(100,h.usd/s.butce*100);
return '<div class="tk"><small><i class="ti ti-coin"></i> Token / dolar <span>'+(co?'şirket · ':'')+AY[pk(TODAY).getMonth()]+' · '+MODEL_AD[tmModel(c)]+'</span></small><div class="tkr"><b>'+fmtTok(k.token)+'</b><span class="sm">token</span><b class="usd">'+usd(k.usd)+'</b></div><div class="pb"><i style="width:'+yz+'%;'+(yz>=90?'background:#e0705b':'')+'"></i></div><em>Şirket: '+usd(h.usd)+' / '+usd(s.butce)+' · kalan '+usd(Math.max(0,s.butce-h.usd))+'</em></div>'}
function fmtTok(n){n=n||0;return n>=1e6?(n/1e6).toFixed(1).replace('.',',')+'M':n>=1e3?Math.round(n/1e3)+'K':String(n)}
GRF.harcama=function(c){var s=ZK.st;if(!s||!s.anahtar)return{t:'API harcaması',s:'bu ay · günlük $',none:'Yapay zekâ bağlı değil'};var t=pk(TODAY),n=t.getDate(),v=[],l=[];for(var d=Math.max(1,n-9);d<=n;d++){v.push(Math.round(((s.harcama.gun||{})[d]||0)*1000)/1000);l.push(String(d))}
var mx=Math.max(0.01,Math.max.apply(null,v)*1.25);return{t:'API harcaması',s:'son günler · toplam '+usd(s.harcama.usd),h:gBar(v,l,mx,0,c.renk)}};
GRF.harcamaKisi=function(c){var s=ZK.st;if(!s||!s.anahtar)return{t:'Çalışan başına',s:'bu ay',none:'Yapay zekâ bağlı değil'};var k=s.harcama.kisi||{},a=Object.keys(k).filter(function(x){return k[x].usd>0}).sort(function(x,y){return k[y].usd-k[x].usd});if(!a.length)return{t:'Çalışan başına',s:'bu ay',none:'Henüz harcama yok'};
var top=a.slice(0,3),rest=a.slice(3).reduce(function(t,x){return t+k[x].usd},0),p=top.map(function(x){var e=tm(x)||{ad:x,renk:'#888'};return[e.ad,k[x].usd,e.renk]});if(rest)p.push(['Diğer',rest,'#5a5a62']);return{t:'Çalışan başına',s:'bu ay · $',h:gDonut(p)}};
var _zkCh=tmCharts;tmCharts=function(c){if(c.id=='orin'&&!(c.grafikler&&c.grafikler.length))c=Object.assign({},c,{grafikler:['harcama','harcamaKisi',{t:'Alan grafiği',s:'tasarım bekleniyor'}]});return _zkCh(c)};
var _zkMs=tmMsgs;tmMsgs=function(c){var h=_zkMs(c);if(zekaHazir()){h=h.replace(/Yapay zekâ bağlı değil · (\d+) mesaj cevap bekliyor\. Bağlantı kurulunca [^<]+ cevaplayacak\./,'$1 mesaj cevap bekliyor'+(ZK.hata?' · '+esc(ZK.hata):'')+' <button class="bt" style="min-height:30px;padding:4px 12px;margin-left:8px" onclick="zekaCevapla(\''+jq(c.id)+'\')">Şimdi cevapla</button>')}
if(ZK.yaz[c.id])h=h.replace(/<\/div>$/,'<div class="mr l">'+av(c,32)+'<div style="flex:1"><div class="who">'+esc(c.ad)+'</div><div class="bo" style="color:#8e8e95">yazıyor…</div></div></div></div>');return h};
if(typeof bulutOzet=='function'){var _zkOz=bulutOzet;bulutOzet=function(){var o=_zkOz(),s=ZK.st;o.zeka={bagli:!!(s&&s.anahtar),usd:s?Math.round(s.harcama.usd*1000)/1000:0,butce:s?s.butce:0};return o}}
// Telefondan gelen cevap bekleyen mesajlar: bilgisayar açıkken cevaplanır
if(typeof bulutUygula=='function'){var _zkBu=bulutUygula;bulutUygula=function(e){_zkBu(e);if(e.tur=='mesaj'&&e.veri&&e.veri.bek&&e.veri.mod!='not'&&zekaHazir())setTimeout(function(){zekaCevapla(e.veri.kim)},300)}}

// ---------- Ayarlar › Yapay zekâ ----------
function zekaAnahtarKaydet(){var e=document.getElementById('zk'),k=e?e.value.trim():'';if(!k){toast('API anahtarını yapıştır');return}call(API.zeka.setKey(k)).then(function(s){ZK.st=s;e.value='';toast('Anahtar kaydedildi (Windows şifrelemesiyle)');render();var n=zekaBekleyenler();if(n)toast(n+' çalışan bekleyen mesajları cevaplıyor')},function(er){toast(er.message)})}
function zekaAnahtarSil(){confirmBox('API anahtarı bu bilgisayardan silinsin mi? Çalışanlar cevap veremez.',function(){call(API.zeka.clearKey()).then(function(s){ZK.st=s;render()})},'Sil')}
function zekaButce(){var v=document.getElementById('zb').value;call(API.zeka.setBudget(v)).then(function(s){ZK.st=s;toast('Aylık bütçe $'+s.butce);render()},function(e){toast(e.message)})}
function zekaModel(id,m){tmSet(id,{model:m});toast((tm(id)||{}).ad+': '+MODEL_AD[m])}
P.zeka=function(){var s=ZK.st;if(!s&&API&&API.zeka)zekaDurum().then(function(){if(pg=='zeka')render()});s=s||{harcama:{usd:0,kisi:{},gun:{}},butce:10,aylar:{}};var h=s.harcama,A=tmAll();
var ch=GRF.harcama({renk:'#2f7bf5'}),ck=GRF.harcamaKisi({}),ay=Object.keys(s.aylar||{});
return '<p class="h">Yapay zekâ</p><p class="s">Çalışanlar Claude API ile cevap verir. Harcama her cevaptan sonra güncellenir.</p>'+
'<div class="card"><div class="ch"><i class="ti ti-key"></i>API anahtarı</div>'+(s.anahtar?'<div class="kr"><span>Kayıtlı anahtar <span class="hn">'+esc(s.ipucu)+' · Windows şifrelemesiyle saklanıyor</span></span><button class="bt" onclick="zekaAnahtarSil()">Sil</button></div>':
'<div class="hn" style="margin-bottom:8px">console.anthropic.com › API Keys’ten oluşturduğun anahtarı yapıştır (sk-ant-…). Anahtar bu bilgisayardan çıkmaz.</div><div style="display:flex;gap:8px"><input id="zk" type="password" class="ti2" placeholder="sk-ant-…" style="flex:1;margin:0" onkeydown="if(event.key==\'Enter\')zekaAnahtarKaydet()"><button class="bt p" onclick="zekaAnahtarKaydet()">Kaydet</button></div>')+'</div>'+
'<div class="card"><div class="ch"><i class="ti ti-chart-bar"></i>Bu ay · '+usd(h.usd)+' / '+usd(s.butce)+'</div><div class="pb" style="height:8px"><i style="width:'+Math.min(100,h.usd/(s.butce||1)*100)+'%"></i></div>'+
'<div class="gr3" style="grid-template-columns:1.4fr 1fr;margin-top:12px"><div class="gc"><div class="gt">'+esc(ch.t)+'<span>'+esc(ch.s)+'</span></div>'+(ch.h||'<div class="gx">'+esc(ch.none)+'</div>')+'</div><div class="gc"><div class="gt">'+esc(ck.t)+'<span>'+esc(ck.s)+'</span></div>'+(ck.h||'<div class="gx">'+esc(ck.none)+'</div>')+'</div></div>'+
'<div class="kr"><span>İstek · token</span><span class="hn">'+(h.istek||0)+' istek · '+fmtTok(h.giris)+' giriş · '+fmtTok(h.cikis)+' çıkış · '+fmtTok(h.onbellek)+' önbellekten</span></div>'+
(ay.length>1?'<div class="kr"><span>Aylar</span><span class="hn">'+ay.map(function(a){return a+': '+usd(s.aylar[a])}).join(' · ')+'</span></div>':'')+
'<div class="kr"><span>Aylık bütçe ($)</span><span style="display:flex;gap:6px"><input id="zb" class="in" type="number" min="0" max="1000" step="1" value="'+s.butce+'"><button class="bt" onclick="zekaButce()">Kaydet</button></span></div><div class="hn">Bütçeye gelince çalışanlar durur; %90’da uyarır. Anthropic Console’da da harcama sınırı koyman önerilir.</div></div>'+
'<div class="card"><div class="ch"><i class="ti ti-cpu"></i>Çalışan modelleri</div>'+A.map(function(c){var m=tmModel(c),k=(h.kisi||{})[c.id];return '<div class="kr"><span style="display:flex;align-items:center;gap:8px">'+av(c,24,false)+esc(c.ad)+' <span class="hn">'+esc(c.gorev)+(k?' · '+usd(k.usd):'')+'</span></span><select onchange="zekaModel(\''+jq(c.id)+'\',this.value)">'+Object.keys(MODEL_AD).map(function(x){return '<option value="'+x+'"'+(x==m?' selected':'')+'>'+MODEL_AD[x]+'</option>'}).join('')+'</select></div>'}).join('')+
'<div class="hn" style="margin-top:6px">Fiyat (1M token, giriş/çıkış): Opus 5.5 $4/$20 · Sonnet 5.5 $2/$10 · Haiku 5.5 $0,10/$0,50.</div></div>'};
var _zkTo=titleOf;titleOf=function(){if(area=='set'&&pg=='zeka')return 'Ayarlar › Yapay zekâ';return _zkTo()};
var _zkSb=sbH;sbH=function(){var h=_zkSb();if(area=='set'&&op('set'))h+=si('set','zeka','','Yapay zekâ','l2','ti-sparkles');return h};
zekaDurum().then(function(s){if(s&&s.anahtar&&!INFO.smoke)setTimeout(function(){zekaBekleyenler();zekaGorevTara()},4000);if(area=='team')render()});

// ---------- Süre ve token sınırlı görevler: çalışan görevi kendisi yapar ----------
// Token sınırı giriş + çıkışı kapsar (çıkış payı tahmini girişten kalan); süre sınırı isteğin zaman aşımıdır.
function zekaGorev(g){var c=tm(g.kim);if(!c||!zekaHazir()||g.durum!='acik'||g.sonuc)return Promise.resolve();
var sys=zekaSistem(c)+'\n\n'+zekaBaglam(c),soru='Doğrudan görev (Çağlar’dan): '+g.metin+(g.son?'\nSon tarih: '+tmSon(g.son):'')+(g.sureDk?'\nSüre sınırı: '+tmSureAd(g.sureDk):'')+(g.tokenLimit?'\nToken sınırı: '+g.tokenLimit+' (kısa ve öz yaz)':'')+'\nGörevi yap ve sonucu doğrudan yaz. Bu sürümde yapamayacağın bir kısım varsa (dosyaya yazma, takvime ekleme, internet) açıkça belirt ve yapılabilecek olanı hazırla.';
var tahmin=Math.ceil((sys.length+soru.length)/3.2),kalan=g.bitis?g.bitis-Date.now():0;
if(g.bitis&&kalan<=0){g.hata='Süre sınırı doldu';save();return Promise.resolve()}
if(g.tokenLimit&&g.tokenLimit-tahmin<256){g.hata='Token sınırı bu görev için çok düşük';save();if(area=='team')render();return Promise.resolve()}
g.durum='calisiyor';delete g.hata;save();if(area=='team')render();
return call(API.zeka.sor({kim:g.kim,model:tmModel(c),system:sys,messages:[{role:'user',content:soru}],effort:'medium',maxTokens:g.tokenLimit?g.tokenLimit-tahmin:6000,zamanAsimiMs:g.bitis?kalan:180000})).then(function(r){
g.sonuc=r.metin;g.token=r.token;g.usd=r.usd;g.durum='bitti';g.bts=Date.now();if(r.stop=='max_tokens')g.hata='Token sınırına ulaşıldı';
tmPush(g.kim,{r:'o',t:'Görev tamamlandı: '+g.metin+'\n\n'+r.metin,model:r.model,usd:r.usd});if(ZK.st){ZK.st.harcama=r.harcama;ZK.st.aylar=r.aylar}},
function(e){g.durum='acik';g.hata=e.message;toast((c.ad||'')+': '+e.message)}).then(function(){save();if(area=='team'||area=='home')render()})}
// Bilgisayar açılınca ya da bağlantı gelince yarım kalan sınırlı görevleri yeniden dene; süre dolanları işaretle
function zekaGorevTara(){var T=TMS();T.gorev.forEach(function(g){if(g.durum=='calisiyor'&&!ZK.yaz['g'+g.id])g.durum='acik';if(g.durum=='acik'&&!g.sonuc&&(g.tokenLimit||g.sureDk)&&!g.hata)zekaGorev(g)})}
setInterval(function(){if(area=='team'&&TMS().gorev.some(function(g){return g.sureDk&&g.durum!='bitti'}))render()},60000);
if(typeof bulutUygula=='function'){var _zkBu2=bulutUygula;bulutUygula=function(e){_zkBu2(e);if(e.tur=='gorev'&&e.veri){var g=TMS().gorev.filter(function(x){return x.id==e.veri.id})[0];if(g&&(e.veri.sureDk||e.veri.tokenLimit)&&!g.sonuc){if(e.veri.sureDk&&!g.sureDk){g.sureDk=+e.veri.sureDk;g.bitis=g.ts+g.sureDk*60000}if(e.veri.tokenLimit)g.tokenLimit=+e.veri.tokenLimit;setTimeout(function(){zekaGorev(g)},300)}}}}
