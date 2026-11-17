// Orvane 0.7.25 · PocketBase oturumu (POCKETBASE_BAGLANTI.md 1. aşama)
// Giriş ekranı: kayıtlı oturum yoksa ya da sunucu oturumu reddederse (401) açılır. İnternet yokken AÇILMAZ (çevrimdışı mod).
// Bu aşamada veriler hâlâ durum.json'dan okunur; giriş yalnız kapıdır. Smoke testlerinde giriş ekranı hiç açılmaz.
var PB={st:null,acik:false,mesaj:'',bekle:false,adresAcik:false};

function pbDurumAl(){if(!API||!API.pb)return Promise.resolve(null);return call(API.pb.durum()).then(function(s){PB.st=s;return s},function(){return null})}
function pbKisaUrl(u){return String(u||'').replace(/^https?:\/\//,'')}

// ---------- Giriş ekranı ----------
function pbGirisHtml(){var s=PB.st||{},u=s.url||'https://veri.orinorvane.com',fark=s.varsayilanUrl&&u!=s.varsayilanUrl;
return '<div class="pbg-drag"></div><div class="pbg-kart" role="dialog" aria-label="Orvane giriş">'+
'<div class="pbg-logo"><img src="../assets/logo.png" alt=""><span>ORVANE</span></div>'+
'<div class="pbg-alt">Devam etmek için hesabınla giriş yap</div>'+
(PB.mesaj?'<div class="pbg-msj" id="pbgMsj">'+esc(PB.mesaj)+'</div>':'<div class="pbg-msj" id="pbgMsj" style="display:none"></div>')+
'<input id="pbgE" class="ti2" type="email" placeholder="E-posta" autocomplete="username" value="'+esc(s.eposta||'')+'" onkeydown="if(event.key==\'Enter\')document.getElementById(\'pbgS\').focus()">'+
'<div class="pbg-sifre"><input id="pbgS" class="ti2" type="password" placeholder="Şifre" autocomplete="current-password" onkeydown="if(event.key==\'Enter\')pbGirisYap()"><span class="pbg-goz" title="Şifreyi göster" onclick="pbSifreGoster()"><i class="ti ti-eye" id="pbgGoz"></i></span></div>'+
'<label class="pbg-hat"><input type="checkbox" id="pbgH" checked> Beni hatırla</label>'+
'<button class="bt p pbg-btn" id="pbgB" onclick="pbGirisYap()">Giriş yap</button>'+
'<div class="pbg-sun" onclick="pbAdresAc()"><i class="ti ti-server-2"></i> Sunucu: '+esc(pbKisaUrl(u))+(fark?' <b>(değiştirildi)</b>':'')+' <i class="ti ti-chevron-'+(PB.adresAcik?'up':'down')+'"></i></div>'+
(PB.adresAcik?'<div class="pbg-adres"><input id="pbgU" class="ti2" placeholder="https://veri.orinorvane.com" value="'+esc(u)+'" onkeydown="if(event.key==\'Enter\')pbAdresKaydet(\'pbgU\')"><div style="display:flex;gap:8px"><button class="bt" onclick="pbAdresKaydet(\'pbgU\')">Kaydet</button><button class="bt" onclick="pbAdresKaydet(null)">Varsayılana dön</button></div><div class="hn">Yalnız sunucu taşındığında değiştir. Acil durumda bilgisayardaki sunucu: http://127.0.0.1:8090</div></div>':'')+
(s.sifreleme===false?'<div class="hn" style="margin-top:10px;color:#f1c88a">Windows şifrelemesi kullanılamıyor: “Beni hatırla” çalışmaz, her açılışta giriş istenir.</div>':'')+
'</div>'}

function pbGirisGoster(mesaj){if(INFO.smoke&&!window.__pbTestModu)return;PB.mesaj=mesaj||PB.mesaj||'';PB.acik=true;
var o=document.getElementById('pbg');if(!o){o=document.createElement('div');o.id='pbg';o.className='pbg';document.body.appendChild(o)}
o.innerHTML=pbGirisHtml();o.style.display='flex';setTimeout(function(){var e=document.getElementById('pbgE'),s=document.getElementById('pbgS');if(e&&!e.value)e.focus();else if(s)s.focus()},30)}
function pbGirisKapat(){PB.acik=false;PB.mesaj='';PB.adresAcik=false;var o=document.getElementById('pbg');if(o){o.style.display='none';o.innerHTML=''}}
function pbMesaj(m){PB.mesaj=m;var e=document.getElementById('pbgMsj');if(e){e.textContent=m;e.style.display=m?'block':'none'}}
function pbSifreGoster(){var s=document.getElementById('pbgS'),g=document.getElementById('pbgGoz');if(!s)return;var ac=s.type=='password';s.type=ac?'text':'password';if(g)g.className='ti '+(ac?'ti-eye-off':'ti-eye')}
function pbAdresAc(){PB.adresAcik=!PB.adresAcik;var e=document.getElementById('pbgE'),ev=e?e.value:'';pbGirisGoster();var e2=document.getElementById('pbgE');if(e2)e2.value=ev}

function pbGirisYap(){if(PB.bekle)return;var e=document.getElementById('pbgE'),s=document.getElementById('pbgS'),h=document.getElementById('pbgH'),b=document.getElementById('pbgB');
var ep=(e&&e.value||'').trim(),sf=s&&s.value||'';if(!ep||!sf){pbMesaj('E-posta ve şifreyi yaz');return}
PB.bekle=true;if(b){b.disabled=true;b.textContent='Giriş yapılıyor…'}
call(API.pb.giris({eposta:ep,sifre:sf,hatirla:!!(h&&h.checked)})).then(function(st){PB.st=st;pbGirisKapat();toast('Giriş yapıldı');if(area=='set'&&pg=='oturum')render()},
function(er){pbMesaj(er.message);if(s){s.value='';s.focus()}}).then(function(){PB.bekle=false;var b2=document.getElementById('pbgB');if(b2){b2.disabled=false;b2.textContent='Giriş yap'}})}

// Sunucu adresi (giriş ekranından ya da Ayarlar'dan). id null → varsayılana dön
function pbAdresKaydet(id){var u=id?(document.getElementById(id)||{}).value:'';
var uyg=function(){call(API.pb.config({url:(u||'').trim()})).then(function(st){PB.st=st;PB.adresAcik=false;toast('Sunucu adresi kaydedildi');if(PB.acik)pbGirisGoster();else if(!st.girisli)pbGirisGoster('Sunucu değişti, yeniden giriş yap');else render()},function(er){toast(er.message)})};
if(PB.st&&PB.st.girisli&&!PB.acik)confirmBox('Sunucu adresi değişirse oturum kapanır ve yeniden giriş istenir. Devam edilsin mi?',uyg,'Değiştir');else uyg()}

// Ana süreçten gelen durum değişiklikleri: 401 ile kapanan oturum giriş ekranını açar
if(API&&API.pb)API.pb.degisti(function(st){var once=PB.st;PB.st=st;if(INFO.smoke&&!window.__pbTestModu)return;
if(!st.girisli&&!PB.acik)pbGirisGoster(once&&once.girisli?(st.sonHata||'Oturum kapandı, yeniden giriş yap'):'');
if(area=='set'&&pg=='oturum'&&!PB.acik)render()});

// Açılış kapısı
if(API&&API.pb&&!INFO.smoke)pbDurumAl().then(function(st){if(st&&!st.girisli)pbGirisGoster()});

// ---------- Ayarlar › Sunucu oturumu ----------
function pbYenileSimdi(){call(API.pb.yenile()).then(function(st){PB.st=st;toast(st.girisli?(st.cevrimdisi?'Sunucuya ulaşılamadı, çevrimdışı devam ediliyor':'Oturum yenilendi'):'Oturum kapandı');render()},function(er){toast(er.message)})}
function pbCikis(){confirmBox('Sunucu oturumu kapatılsın mı? Programı kullanmak için yeniden giriş gerekir. Bu bilgisayardaki kayıtlara dokunulmaz.',function(){call(API.pb.cikis()).then(function(st){PB.st=st;pbGirisGoster()})},'Çıkış yap')}
P.oturum=function(){var s=PB.st;if(!s&&!PB.denendi&&API&&API.pb){PB.denendi=1;setTimeout(function(){PB.denendi=0},30000);pbDurumAl().then(function(){if(pg=='oturum'&&PB.st)render()})}s=s||{};
var nokta=!s.girisli?['#8a8a90','Giriş yapılmadı']:s.cevrimdisi?['#8a8a90','Çevrimdışı · kayıtlı oturumla çalışıyor']:['#3fbf6a','Bağlı'];
return '<p class="h">Sunucu oturumu</p><p class="s">Orvane verileri PocketBase sunucusuna taşınıyor. Program bu hesapla girer; yönetici hesabı kullanılmaz.</p>'+
'<div class="card"><div class="ch"><i class="ti ti-cloud-lock"></i>Durum</div>'+
'<div class="kr"><span>Bağlantı</span><span class="hn"><span class="pb-nokta" style="background:'+nokta[0]+'"></span>'+nokta[1]+'</span></div>'+
'<div class="kr"><span>Kullanıcı</span><span class="hn">'+(s.eposta?esc(s.eposta):'—')+'</span></div>'+
'<div class="kr"><span>Sunucu</span><span class="hn">'+esc(pbKisaUrl(s.url||''))+'</span></div>'+
'<div class="kr"><span>Son yenileme</span><span class="hn">'+(s.sonYenileme?new Date(s.sonYenileme).toLocaleString('tr-TR'):'—')+'</span></div>'+
'<div class="kr"><span>Beni hatırla</span><span class="hn">'+(s.hatirla?'Açık (Windows şifrelemesiyle saklanıyor)':s.sifreleme===false?'Kullanılamıyor (Windows şifrelemesi yok)':'Kapalı')+'</span></div>'+
(s.sonHata&&s.girisli?'<div class="kr"><span style="color:#f1c88a">'+esc(s.sonHata)+'</span></div>':'')+
'<div style="display:flex;gap:8px;margin-top:10px">'+(s.girisli?'<button class="bt p" onclick="pbYenileSimdi()"><i class="ti ti-refresh"></i> Şimdi yenile</button><button class="bt" onclick="pbCikis()">Çıkış yap</button>':'<button class="bt p" onclick="pbGirisGoster()">Giriş yap</button>')+'</div></div>'+
'<div class="card"><div class="ch"><i class="ti ti-server-2"></i>Sunucu adresi</div><div class="hn" style="margin-bottom:8px">Varsayılan: '+esc(s.varsayilanUrl||'https://veri.orinorvane.com')+'. Yalnız sunucu taşındığında ya da acil durumda bilgisayardaki sunucuya (http://127.0.0.1:8090) geçerken değiştir. Değişince oturum kapanır.</div>'+
'<input id="pbAyU" class="ti2" value="'+esc(s.url||'')+'" placeholder="https://veri.orinorvane.com"><div style="display:flex;gap:8px"><button class="bt" onclick="pbAdresKaydet(\'pbAyU\')">Kaydet</button><button class="bt" onclick="pbAdresKaydet(null)">Varsayılana dön</button></div></div>'+
'<div class="ft">Oturum açılışta, 24 saatte bir ve bilgisayar uykudan uyanınca kendiliğinden yenilenir. İnternet yokken program kayıtlı oturumla açılır; giriş ekranı yalnız sunucu oturumu reddederse çıkar.</div>'};
var _pbTo=titleOf;titleOf=function(){if(area=='set'&&pg=='oturum')return 'Ayarlar › Sunucu oturumu';return _pbTo()};
var _pbSb=sbH;sbH=function(){var h=_pbSb();if(area=='set'&&op('set'))h+=si('set','oturum','','Sunucu oturumu','l2','ti-cloud-lock');return h};
