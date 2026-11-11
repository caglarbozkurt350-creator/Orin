// Orvane 0.6.0 · Telefon eşitlemesi: telefondan gelen olayları işler, güncel özeti telefona yayınlar.
// Olay kuralları telefondaki mobil/src/lib/ekip.ts → uygula() ile aynıdır; birini değiştirirken ötekini de güncelle.
var BL={st:null,busy:false,yayin:''};
function BLS(){if(!S.bulut)S.bulut={olaySira:0};return S.bulut}

// ---------- Olayı uygula ----------
function bulutUygula(e){var v=e.veri||{},T=TMS();
function psh(kim,m){var a=tmChat(kim);if(a.some(function(x){return x.id==m.id}))return;tmPush(kim,m)}
if(e.tur=='mesaj')psh(v.kim,{id:e.id,r:'ben',t:v.t,ts:e.ts,tur:v.mod=='not'?'not':v.mod=='ses'?'ses':'mesaj',bek:v.bek?1:undefined,kaynak:'telefon'});
else if(e.tur=='cevap')psh(v.kim,{id:e.id,r:'o',t:v.t,ts:e.ts,qr:v.qr,kaynak:'telefon'});
else if(e.tur=='gorev'){if(T.gorev.some(function(g){return g.id==v.id}))return;var c=tm(v.kim)||{ad:v.ad||v.kim};
T.gorev.push({id:v.id,kim:v.kim,metin:v.metin,onc:v.onc||'normal',son:v.son||'',durum:'acik',bilgi:!!v.bilgi,yol:'dogrudan',ts:e.ts,kaynak:'telefon'});
psh(v.kim,{id:e.id+'s',r:'sys',t:'Çağlar doğrudan görev verdi'+(v.onc=='acil'?' (acil)':'')+': '+v.metin+(v.son?' · son tarih '+v.son:''),ts:e.ts});
if(v.bilgi&&v.kim!='orin')psh('orin',{id:e.id+'b',r:'sys',t:bilgiNotu(c.ad),ts:e.ts})}
else if(e.tur=='gorev_durum'){var g=T.gorev.filter(function(x){return x.id==v.id})[0];if(g){g.durum=v.durum;g.bts=v.durum=='bitti'?e.ts:null}}
else if(e.tur=='gelisim'){if(T.gel.some(function(x){return x.id==v.id}))return;var o={id:v.id,kim:v.kim,tur:v.gtur,ad:v.ad||'',metin:v.metin||'',asama:v.kimden=='nika'?'ceo':'ik',kimden:v.kimden||'cagla',ts:e.ts};if(v.kimden=='nika')o.ik={ts:e.ts,ok:1};T.gel.push(o)}
else if(e.tur=='gelisim_karar'){var x=T.gel.filter(function(y){return y.id==v.id})[0];if(!x||x.asama!=v.asama)return;
if(v.asama=='ik'){x.ik={ts:e.ts,ok:v.ok?1:0};x.asama=v.ok?'ceo':'red'}else{x.ceo={ts:e.ts,ok:v.ok?1:0};x.asama=v.ok?'tamam':'red';if(v.ok)tmGelApply(x)}}
else if(e.tur=='kayit'){var k=v.k;if(!k||!v.kod||!v.dk)return;var en={k:String(v.kod),i:String(v.is||''),d:+v.dk,st:1,u:uid(),src:'telefon',pid:e.id};
if((E[k]||[]).some(function(z){return z.pid==e.id}))return;(E[k]=E[k]||[]).push(en);entryAdded(k,en)}}

// ---------- Telefona gidecek özet ----------
function bulutOzet(){var T=TMS(),so={},gun={},sy={};
Object.keys(T.sohbet).forEach(function(id){so[id]=T.sohbet[id].slice(-60).map(function(m,i){return Object.assign({id:m.id||('m'+m.ts+'_'+i)},m)})});
var d=pk(TODAY);for(var i=0;i<45;i++){var k=key(d);d.setDate(d.getDate()-1);var a=E[k]||[];if(!a.length&&!lim(k)&&!D[k])continue;gun[k]={L:lim(k),T:tot(k),OT:OT[k]||0,e:a.map(function(x){return[x.k,x.i,x.d]})};if(D[k])gun[k].D=D[k];a.forEach(function(x){if(SPECIAL.indexOf(x.k)<0&&x.k!='?')sy[x.k]=(sy[x.k]||0)+1})}
// Önümüzdeki 14 gün de gider: telefonda ileri tarihli kayıt ve Günü doldur iş süresini bilsin
var f=pk(TODAY);for(var j=0;j<14;j++){f.setDate(f.getDate()+1);var k2=key(f),a2=E[k2]||[];if(!a2.length&&!lim(k2)&&!D[k2])continue;gun[k2]={L:lim(k2),T:tot(k2),OT:OT[k2]||0,e:a2.map(function(x){return[x.k,x.i,x.d]})};if(D[k2])gun[k2].D=D[k2]}
return{v:1,ts:Date.now(),olaySira:BLS().olaySira,bugun:TODAY,ekip:{m:T.m,gorev:T.gorev,gel:T.gel,sohbet:so},gun:gun,proj:Object.keys(sy).sort(function(a,b){return sy[b]-sy[a]}).slice(0,8),ayar:{w1:S.w1,w2:S.w2}}}

// ---------- Eşitleme ----------
function bulutDurum(){if(!API||!API.bulut)return Promise.resolve(null);return call(API.bulut.status()).then(function(s){BL.st=s;return s},function(){return null})}
function bulutTick(zorla){if(BL.busy){BL.tekrar=1;return Promise.resolve()}if(!API||!API.bulut||(INFO.smoke&&!zorla))return Promise.resolve();if(!BL.st||!BL.st.eposta||!navigator.onLine)return Promise.resolve();
BL.busy=true;var gelen=0;
return call(API.bulut.pull(BLS().olaySira)).then(function(rows){(rows||[]).forEach(function(r){if(r.kaynak=='telefon'){bulutUygula({id:r.id,tur:r.tur,veri:r.veri,ts:Date.parse(r.ts)});gelen++}BLS().olaySira=Math.max(BLS().olaySira,+r.sira||0)});
if(gelen){save();toast(gelen+' işlem telefondan geldi');if(area=='team'||area=='home')render()}
var oz=bulutOzet(),k=JSON.stringify(Object.assign({},oz,{ts:0}));if(!zorla&&k==BL.yayin)return;return call(API.bulut.push(oz)).then(function(){BL.yayin=k})})
.then(function(){BLS().son=Date.now();BLS().hata='';save()},function(e){BLS().hata=e.message;if(/giriş|Oturum/i.test(e.message))bulutDurum()})
.then(function(){BL.busy=false;if(BL.tekrar){BL.tekrar=0;setTimeout(bulutTick,300)}if(area=='set'&&pg=='telefon')render()})}
function bulutSimdi(){if(!BL.st||!BL.st.eposta){toast('Önce giriş yap');return}bulutTick(true).then(function(){toast(BLS().hata?'Eşitlenemedi: '+BLS().hata:'Telefonla eşitlendi')})}
// 0.7.13: telefon mesajları 10 sn'de bir alınır (yalnız küçük bir okuma; özet değişmediyse gönderilmez); cevap yazılınca hemen gönderilir
bulutDurum().then(function(){bulutTick()});setInterval(function(){bulutTick()},10000);
var _blPush=tmPush,_blZam=null;tmPush=function(id,m){var r=_blPush(id,m);if(m&&(m.r=='o'||m.r=='sys')&&!INFO.smoke){clearTimeout(_blZam);_blZam=setTimeout(function(){bulutTick()},800)}return r};window.addEventListener('online',function(){bulutTick()});

// ---------- Ayarlar › Telefon eşitleme ----------
function bulutAdres(){var u=document.getElementById('bu').value.trim(),a=document.getElementById('ba').value.trim();if(!/^https:\/\/.+/.test(u)||!a){toast('Proje adresini ve publishable anahtarı yaz');return}if(/secret|service_role/i.test(a)){toast('Gizli anahtar değil, publishable anahtarı yaz');return}
call(API.bulut.config({url:u,anahtar:a})).then(function(s){BL.st=s;toast('Adres kaydedildi');render()},function(e){toast(e.message)})}
function bulutGiris(yeni){var ep=document.getElementById('be').value.trim(),sf=document.getElementById('bs').value;if(!ep||!sf){toast('E-posta ve şifreyi yaz');return}
call(API.bulut[yeni?'signup':'login']({eposta:ep,sifre:sf})).then(function(s){BL.st=s;if(yeni&&!s.hemen){toast('Onay e-postası gönderildi; bağlantıya tıklayıp giriş yap');return}toast('Giriş yapıldı');BL.yayin='';bulutTick(true);render()},function(e){toast(e.message)})}
function bulutCikis(){confirmBox('Telefon eşitlemesinden çıkılsın mı? Kayıtların bu bilgisayarda kalır.',function(){call(API.bulut.logout()).then(function(s){BL.st=s;render()})},'Çıkış')}
P.telefon=function(){var s=BL.st||{},b=BLS();if(!BL.st&&!BL.denendi&&API&&API.bulut){BL.denendi=1;setTimeout(function(){BL.denendi=0},30000);bulutDurum().then(function(){if(pg=='telefon'&&BL.st)render()})}
return '<p class="h">Telefon eşitleme</p><p class="s">Orvane Mobil ile görevler, sohbetler, onaylar ve iş günü kayıtları eşitlenir. Telefondan girilen kayıtları bu bilgisayar Sheets’e yazar.</p>'+
'<div class="card"><div class="ch"><i class="ti ti-device-mobile"></i>Durum</div><div class="kr"><span>Giriş</span><span class="hn">'+(s.eposta?esc(s.eposta):'yapılmadı')+'</span></div>'+
'<div class="kr"><span>Son eşitleme</span><span class="hn">'+(b.son?new Date(b.son).toLocaleString('tr-TR'):'—')+'</span></div>'+(b.hata?'<div class="kr"><span style="color:#f1c88a">'+esc(b.hata)+'</span></div>':'')+
(s.eposta?'<div style="display:flex;gap:8px;margin-top:10px"><button class="bt p" onclick="bulutSimdi()"><i class="ti ti-refresh"></i> Şimdi eşitle</button><button class="bt" onclick="bulutCikis()">Çıkış</button></div>':'')+'</div>'+
(s.varsayilan?'':'<div class="card"><div class="ch"><i class="ti ti-link"></i>Bağlantı adresi</div><div class="hn" style="margin-bottom:8px">Supabase proje adresi ve “publishable” anahtarı. Telefonda da aynısı kullanılır.</div>'+
'<div style="display:flex;flex-direction:column;gap:8px"><input id="bu" placeholder="https://xxxx.supabase.co" value="'+esc(s.url||'')+'" style="width:100%;box-sizing:border-box" class="ti2"><input id="ba" placeholder="sb_publishable_…" value="'+esc(s.anahtar||'')+'" style="width:100%;box-sizing:border-box" class="ti2"></div><button class="bt" onclick="bulutAdres()">Kaydet</button></div>')+
(s.eposta||!s.ayarli?'':'<div class="card"><div class="ch"><i class="ti ti-login"></i>Giriş</div><div class="hn" style="margin-bottom:8px">Telefonda da aynı e-posta ile gir. İlk kez kullanıyorsan “Hesap aç”; gelen onay e-postasındaki bağlantıya tıkladıktan sonra giriş yap.</div>'+
'<input id="be" type="email" placeholder="E-posta" class="ti2" style="width:100%;box-sizing:border-box"><input id="bs" type="password" placeholder="Şifre" class="ti2" style="width:100%;box-sizing:border-box" onkeydown="if(event.key==\'Enter\')bulutGiris()">'+
'<div style="display:flex;gap:8px"><button class="bt p" onclick="bulutGiris()">Giriş yap</button><button class="bt" onclick="bulutGiris(true)">Hesap aç</button></div></div>')+
'<div class="ft">Bu bilgisayar açıkken telefondan gelenler 45 saniyede bir işlenir. Bilgisayar kapalıyken telefondaki işlemler bekler, açılınca gelir.</div>'};
var _blTo=titleOf;titleOf=function(){if(area=='set'&&pg=='telefon')return 'Ayarlar › Telefon eşitleme';return _blTo()};
var _blSb=sbH;sbH=function(){var h=_blSb();if(area=='set'&&op('set'))h+=si('set','telefon','','Telefon eşitleme','l2','ti-device-mobile');return h};
