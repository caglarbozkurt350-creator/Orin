// Orvane 0.7.15
// 1) Jarvis planlama sohbeti: Jarvis sayfasında Çağlar ↔ Jarvis (abonelikte, Jarvis klasöründe, yalnız okuma)
//    "Prompt oluştur" → kararlaştırılan konu iş promptuna çevrilir, alttaki gönderme alanına yapışır → "Promptu Şirkete Gönder"
//    → Jarvis\giden\…md iş dosyası + yalnız CEO Orin'in sohbetine
// 2) Toplantı odası: Çağlar toplantı planlar (şimdi ya da ileri saat) → saati gelince bildirim + "Odaya geç"
//    → davetli çalışanlar aynı oturumda sırayla konuşur (söyleyecek yoksa PAS) → toplantı sırasında yeni davet → bitince özet

// ---------- 1) Jarvis planlama sohbeti ----------
var JVS={sor:function(o){return API.jarvis.sor(o)},kaydet:function(o){return API.jarvis.kaydet(o)},yaz:false};
function jvSohbet(){var s=jvS();s.sohbet=s.sohbet||[];return s.sohbet}
function jvAv(){return '<span class="hya" style="width:32px;height:32px;font-size:16px;background:#2a2140;color:#c9b6ff"><i class="ti ti-sparkles"></i></span>'}
function jvSohbetKart(){var L=jvSohbet(),s=ABN.st||{};
var h=L.map(function(m){if(m.r=='ben')return '<div class="mr"><div class="bme">'+esc(m.t)+'<small>'+tmTime(m.ts)+'</small></div></div>';
if(m.r=='sys')return '<div class="inf"><i class="ti ti-info-circle"></i><div>'+esc(m.t)+'</div></div>';
return '<div class="mr l">'+jvAv()+'<div style="flex:1;min-width:0"><div class="who">Jarvis <span>· '+tmTime(m.ts)+'</span></div><div class="bo">'+tmFmt(m.t)+'</div></div></div>'}).join('');
if(!L.length)h='<div class="mr l">'+jvAv()+'<div style="flex:1;min-width:0"><div class="who">Jarvis</div><div class="bo">Merhaba Çağlar. Ne planlıyoruz? Fikrini kabaca yaz; eksikleri tek tek sorup netleştireyim. Karar verince “Prompt oluştur”a bas, şirkete gidecek metni hazırlayayım.</div></div></div>';
if(JVS.yaz)h+='<div class="hn" style="margin:6px 0 0 42px">Jarvis yazıyor…</div>';
return '<div class="card" style="margin-top:14px"><div class="ch"><i class="ti ti-messages"></i>Planlama sohbeti <span class="hn" style="margin-left:6px">abonelikte · bugün '+(s.sohbetBugun||0)+' / '+(s.gunlukSohbet||0)+' cevap</span>'+(L.length?'<span class="hn" style="margin-left:auto;cursor:pointer" onclick="jvTemizle()"><i class="ti ti-eraser"></i> Temizle</span>':'')+'</div>'+
'<div class="cv jvcv" id="jvcv">'+h+'</div>'+
'<div class="cmp" style="margin-top:10px"><textarea id="jvq" rows="1" placeholder="Jarvis’e yaz… (Enter gönderir, Alt+Enter alt satır)" oninput="tmGrow(this)" onkeydown="jvKey(event)"'+(JVS.yaz?' disabled':'')+'></textarea>'+
'<div class="cbt"><span style="flex:1"></span><button class="bt" onclick="jvPrompt()"'+(JVS.yaz||!L.length?' disabled':'')+' title="Kararlaştırılan konuyu şirkete gidecek iş promptuna çevirir"><i class="ti ti-wand"></i> Prompt oluştur</button><button class="snd" title="Gönder" onclick="jvSor()"'+(JVS.yaz?' disabled':'')+'><i class="ti ti-arrow-up"></i></button></div></div></div>'}
function jvKey(ev){if(ev.key!='Enter')return;if(ev.altKey||ev.shiftKey){if(ev.altKey){ev.preventDefault();var e=ev.target,a=e.selectionStart;e.value=e.value.slice(0,a)+'\n'+e.value.slice(e.selectionEnd);e.selectionStart=e.selectionEnd=a+1}return}ev.preventDefault();jvSor()}
function jvHazir(){return typeof abnSohbetHazir=='function'&&abnSohbetHazir()}
function jvSor(metin){var e=document.getElementById('jvq'),t=String(metin!=null?metin:(e?e.value:'')).trim();if(!t||JVS.yaz)return Promise.resolve();
if(!jvHazir()){toast(abnAcik()?'Bugünkü abonelik sohbet sınırı doldu':'Jarvis için Claude aboneliği açık olmalı (Ayarlar › Yapay zekâ)');return Promise.resolve()}
var L=jvSohbet(),gecmis=L.slice();L.push({r:'ben',t:t,ts:Date.now()});if(e)e.value='';JVS.yaz=true;save();jvCiz();
return JVS.sor({gecmis:gecmis,mesaj:t}).then(function(r){if(!r.ok)throw new Error(r.err);L.push({r:'j',t:String(r.v.metin||'').trim(),ts:Date.now()});if(ABN.st)ABN.st.sohbetBugun=(ABN.st.sohbetBugun||0)+1},
function(er){L.push({r:'sys',t:'Jarvis cevap veremedi: '+String(er&&er.message||er),ts:Date.now()})}).then(function(){jvS().sohbet=L.slice(-120);JVS.yaz=false;save();jvCiz()})}
function jvPrompt(){var L=jvSohbet();if(!L.length||JVS.yaz){toast('Önce Jarvis’le konuyu konuşun');return Promise.resolve()}if(!jvHazir()){toast('Claude aboneliği şu an hazır değil');return Promise.resolve()}
JVS.yaz=true;jvCiz();toast('Jarvis promptu hazırlıyor…');
return JVS.sor({gecmis:L.slice(),mod:'prompt'}).then(function(r){if(!r.ok)throw new Error(r.err);JV.metin=String(r.v.metin||'').trim();var jm=document.getElementById('jvm');if(jm)jm.value=JV.metin;if(ABN.st)ABN.st.sohbetBugun=(ABN.st.sohbetBugun||0)+1;
L.push({r:'sys',t:'Prompt hazırlandı ve aşağıdaki gönderme alanına yapıştırıldı. Kontrol et, gerekirse düzelt, sonra “Promptu Şirkete Gönder”.',ts:Date.now()})},function(er){toast('Prompt oluşturulamadı: '+String(er&&er.message||er))})
.then(function(){JVS.yaz=false;save();jvCiz();setTimeout(function(){var m=document.getElementById('jvm');if(m&&JV.metin){m.scrollIntoView({behavior:'smooth',block:'center'});m.focus()}},60)})}
function jvTemizle(){confirmBox('Jarvis ile planlama sohbeti temizlensin mi? Gönderilen iş dosyaları silinmez.',function(){jvS().sohbet=[];save();render()},'Temizle')}
function jvCiz(){if(area=='team'&&pg=='jarvis'){var m=document.getElementById('jvm');if(m)JV.metin=m.value;render();var c=document.getElementById('jvcv');if(c)c.scrollTop=c.scrollHeight;var q=document.getElementById('jvq');if(q&&!JVS.yaz)q.focus()}}
// Sayfa: başlığın altına planlama sohbeti; gönderme kartı "iş dosyası" olarak
var _tpJp=jarvisPage;jarvisPage=function(){var h=_tpJp(),i=h.indexOf('<div class="card"');h=i>=0?h.slice(0,i)+jvSohbetKart()+h.slice(i):h+jvSohbetKart();
return h.replace('Promptu şirkete gönder <span','Şirkete iş dosyası gönder <span').replace('Jarvis’in hazırladığı promptu buraya yapıştır ya da aşağıdaki taslaklardan seç.','“Prompt oluştur” buraya yapıştırır; istersen düzelt ya da aşağıdaki taslaklardan seç. Gönderince Jarvis\\giden klasörüne iş dosyası olarak kaydedilir.')};
// Gönderim: iş dosyası olarak da kaydedilir
var _tpIlet=jvIlet;jvIlet=function(t){_tpIlet(t);var g=jvS().gonderilen,son=g[g.length-1];return JVS.kaydet({metin:t}).then(function(r){if(r&&r.ok){son.dosya=r.v;save();if(!INFO.smoke)toast('İş dosyası kaydedildi: '+String(r.v).split(/[\\/]/).pop())}return r},function(){return null})};

// ---------- 2) Toplantı odası ----------
var TP={cagir:function(o){return ABN.cagir(o)},yaz:{},bildir:function(t){tpBildirim(t)}};
function tpS(){S.toplanti=S.toplanti||[];return S.toplanti}
function tpBul(id){return tpS().filter(function(x){return x.id==id})[0]}
function tpAd(id){var c=tm(id);return c?c.ad:id}
function tpYeni(o){var kim=[o.ev].concat(o.kim||[]).filter(function(x,i,a){return x&&tm(x)&&a.indexOf(x)==i});if(!kim.length)return null;var simdi=Date.now(),z=o.zaman&&o.zaman>simdi+30000?o.zaman:simdi;
var t={id:'tp'+uid(),ev:kim[0],kim:kim,konu:String(o.konu||'Toplantı').slice(0,140),zaman:z,durum:'planli',mes:[],ts:simdi};tpS().push(t);
kim.forEach(function(k){tmPush(k,{r:'sys',t:'Çağlar seni toplantıya davet etti: “'+t.konu+'” · '+(z>simdi?new Date(z).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):'şimdi')+' · katılımcılar: '+kim.map(tpAd).join(', ')})});
save();if(z<=simdi)tpBasla(t);return t}
function tpBasla(t){if(!t||t.durum!='planli')return;t.durum='acik';t.basla=Date.now();t.mes.push({r:'sys',t:'Toplantı başladı: '+t.konu+' · katılımcılar: '+t.kim.map(tpAd).join(', ')+'. Sen yaz; her çalışan kendi alanından sırayla cevaplar.',ts:Date.now()});save();TP.bildir(t)}
// Bildirim: Windows bildirimi + uygulama içinde "Odaya geç" penceresi
function tpBildirim(t){if(INFO.smoke)return;try{if(window.Notification){var n=new Notification('Toplantı başladı: '+t.konu,{body:'Katılımcılar: '+t.kim.map(tpAd).join(', ')+' · Odaya geçmek için tıkla',silent:false});n.onclick=function(){try{API.win&&API.win('show')}catch(e){}tpGit(t.id)}}}catch(e){}
var o=document.getElementById('ov');if(!o)return;o.innerHTML='<div class="dl" style="max-width:420px"><div style="color:#fff;font-size:16px;font-weight:600;margin-bottom:6px"><i class="ti ti-users-group"></i> Toplantı başladı</div><div style="color:#ddd;margin-bottom:6px">'+esc(t.konu)+'</div><div class="hn" style="margin-bottom:14px">Katılımcılar: '+esc(t.kim.map(tpAd).join(', '))+'</div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="bt" onclick="cfNo()">Sonra</button><button class="bt p" data-id="'+esc(t.id)+'" onclick="cfNo();tpGit(this.dataset.id)"><i class="ti ti-door-enter"></i> Odaya geç</button></div></div>';o.style.display='flex'}
function tpGit(id){nav('team','toplanti',id)}
function tpTara(){var n=Date.now();tpS().forEach(function(t){if(t.durum=='planli'&&t.zaman<=n)tpBasla(t)})}
if(!INFO.smoke){setInterval(tpTara,20000);setTimeout(tpTara,4000)}
// Konuşma: Çağlar yazar → katılımcılar sırayla (toplantıyı açan önce); söyleyecek yoksa PAS
function tpKural(t,c){return '\n\nŞU AN TOPLANTIDASIN. Konu: '+t.konu+'. Toplantıyı Çağlar açtı; katılımcılar: '+t.kim.map(function(k){var x=tm(k)||{ad:k,gorev:''};return x.ad+' ('+x.gorev+')'}).join(', ')+'.\nKurallar: Yalnız kendi alanından ('+c.gorev+') konuş; en fazla 4 cümle; başkasının söylediğini tekrarlama; gerekirse diğer katılımcıya adıyla seslen. Söyleyecek bir şeyin yoksa yalnız PAS yaz. Başına adını yazma. Toplantı önerme, İŞ İSTEĞİ yazma.'}
function tpGecmis(t,c){return t.mes.slice(-24).map(function(m){return m.r=='ben'?'Çağlar: '+m.t:m.r=='sys'?'[Bilgi] '+m.t:tpAd(m.kim)+': '+m.t}).join('\n\n')+'\n\nŞimdi sıra sende ('+c.ad+').'}
function tpTekCevap(t,k,ek){var c=tm(k);if(!c||t.durum!='acik')return Promise.resolve(null);TP.yaz[t.id]=k;tpCiz(t.id);
return TP.cagir({kim:k,tur:'sohbet',sistemTam:true,araclar:'',maxTur:1,model:typeof ABN_MODEL!='undefined'&&ABN_MODEL[tmModel(c)]||'haiku',zamanAsimiMs:120000,sistem:zekaSistem(c)+'\n\n'+zekaBaglam(c)+tpKural(t,c)+(ek||''),istem:tpGecmis(t,c)})
.then(function(r){if(!r.ok)throw new Error(r.err);var m=String(r.v.metin||'').trim();if(ABN.st)ABN.st.sohbetBugun=(ABN.st.sohbetBugun||0)+1;if(!m||/^PAS\b[.!]?$/i.test(m)||/^PAS\s*$/i.test(m))return null;t.mes.push({r:'o',kim:k,t:m.replace(/^PAS\b[.!]?\s*/i,''),ts:Date.now()});save();return m},
function(e){t.mes.push({r:'sys',t:tpAd(k)+' cevap veremedi: '+String(e&&e.message||e),ts:Date.now()});save();return null})}
function tpTur(t){if(TP.yaz[t.id])return Promise.resolve();var L=t.kim.slice(),p=Promise.resolve();
L.forEach(function(k){p=p.then(function(){if(typeof abnSohbetHazir=='function'&&!abnSohbetHazir()){if(!t._uyar){t._uyar=1;t.mes.push({r:'sys',t:'Claude aboneliği şu an hazır değil (sınır ya da bağlantı); çalışanlar cevaplayamıyor.',ts:Date.now()})}return}return tpTekCevap(t,k)})});
return p.then(function(){delete TP.yaz[t.id];delete t._uyar;save();tpCiz(t.id)})}
function tpGonder(id,metin){var t=tpBul(id),e=document.getElementById('tpi'),x=String(metin!=null?metin:(e?e.value:'')).trim();if(!t||!x||t.durum!='acik')return Promise.resolve();if(e)e.value='';
t.mes.push({r:'ben',t:x,ts:Date.now()});save();tpCiz(id);return tpTur(t)}
// Toplantı sırasında davet
function tpDavetEt(id,ekler){var t=tpBul(id);if(!t||t.durum=='bitti')return Promise.resolve([]);var yeni=(ekler||[]).filter(function(k){return tm(k)&&t.kim.indexOf(k)<0});if(!yeni.length)return Promise.resolve([]);
yeni.forEach(function(k){t.kim.push(k);t.mes.push({r:'sys',t:tpAd(k)+' toplantıya katıldı.',ts:Date.now()});tmPush(k,{r:'sys',t:'Çağlar seni süren toplantıya davet etti: “'+t.konu+'”.'})});save();tpCiz(id);
if(t.durum!='acik'||!t.mes.some(function(m){return m.r=='ben'}))return Promise.resolve(yeni);
var p=Promise.resolve();yeni.forEach(function(k){p=p.then(function(){if(typeof abnSohbetHazir=='function'&&!abnSohbetHazir())return;return tpTekCevap(t,k,'\nToplantıya şimdi katıldın; konuşulanlara kendi alanından kısaca katkı ver ya da PAS yaz.')})});return p.then(function(){delete TP.yaz[t.id];save();tpCiz(id);return yeni})}
function tpCikar(id,k){var t=tpBul(id);if(!t||k==t.ev)return;t.kim=t.kim.filter(function(x){return x!=k});t.mes.push({r:'sys',t:tpAd(k)+' toplantıdan ayrıldı.',ts:Date.now()});save();render()}
// Bitir: toplantıyı açan çalışan özet çıkarır (kararlar, yapılacaklar); özet onun sohbetine de düşer
function tpBitir(id,sorma){var t=tpBul(id);if(!t||t.durum=='bitti')return Promise.resolve();var yap=function(){t.durum='bitti';t.bitis=Date.now();save();render();
if(!t.mes.some(function(m){return m.r=='ben'})||(typeof abnSohbetHazir=='function'&&!abnSohbetHazir())){t.mes.push({r:'sys',t:'Toplantı bitti.',ts:Date.now()});save();render();return Promise.resolve()}
var c=tm(t.ev);t.durum='acik';TP.yaz[t.id]=t.ev;return TP.cagir({kim:t.ev,tur:'sohbet',sistemTam:true,araclar:'',maxTur:1,model:typeof ABN_MODEL!='undefined'&&ABN_MODEL[tmModel(c)]||'haiku',zamanAsimiMs:120000,sistem:zekaSistem(c)+'\nToplantıyı sen açtın; şimdi kısa tutanak yaz: Kararlar · Yapılacaklar (kim, ne) · Açık sorular. En fazla 8 madde.',istem:'Toplantı: '+t.konu+'\n\n'+tpGecmis(t,c).replace(/\n\nŞimdi sıra sende.*$/,'')})
.then(function(r){t.durum='bitti';delete TP.yaz[t.id];if(r.ok){t.ozet=String(r.v.metin||'').trim();t.mes.push({r:'o',kim:t.ev,t:'Toplantı özeti:\n'+t.ozet,ts:Date.now()});tmPush(t.ev,{r:'o',t:'“'+t.konu+'” toplantısının özeti:\n'+t.ozet});t.kim.forEach(function(k){if(k!=t.ev)tmPush(k,{r:'sys',t:'“'+t.konu+'” toplantısı bitti; özet '+tpAd(t.ev)+'’nın sohbetinde.'})})}save();render()},function(){t.durum='bitti';delete TP.yaz[t.id];save();render()})};
if(sorma)return yap();confirmBox('“'+esc(t.konu)+'” toplantısı bitirilsin mi? '+esc(tpAd(t.ev))+' kısa bir özet çıkarır.',yap,'Bitir');return Promise.resolve()}
// Planlama penceresi
function tpPlanDlg(ev,secili){var A=tmAll(),o=document.getElementById('ov'),c=tm(ev)||A[0];secili=secili||[];
var d=new Date(Date.now()+60*60000);d.setMinutes(0,0,0);var dv=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'T'+String(d.getHours()).padStart(2,'0')+':00';
o.innerHTML='<div class="dl" style="max-width:480px;width:480px"><div style="color:#fff;font-size:16px;font-weight:600">Toplantı planla</div><div class="hn" style="margin-bottom:8px">Toplantıyı '+esc(c.ad)+' açar; davetliler aynı odada konuşur. Saati gelince bildirim gelir.</div><div class="pf" style="display:block;margin:0">'+
'<label>Konu</label><input type="text" id="tpk" placeholder="ör. Yaz tatili bütçesi ve takvimi">'+
'<label>Davetliler</label><div class="tpsec">'+A.filter(function(x){return x.id!=c.id}).map(function(x){return '<label class="tpc"><input type="checkbox" value="'+esc(x.id)+'"'+(secili.indexOf(x.id)>=0?' checked':'')+'>'+av(x,22,false)+esc(x.ad)+'<small>'+esc(x.gorev)+'</small></label>'}).join('')+'</div>'+
'<label>Zaman</label><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><label class="tpc" style="width:auto"><input type="radio" name="tpz" value="simdi" checked onchange="document.getElementById(\'tpt\').disabled=true"> Şimdi</label><label class="tpc" style="width:auto"><input type="radio" name="tpz" value="ileri" onchange="document.getElementById(\'tpt\').disabled=false"> İleri saat</label><input type="datetime-local" id="tpt" value="'+dv+'" disabled></div></div>'+
'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="bt" onclick="cfNo()">Vazgeç</button><button class="bt p" data-ev="'+esc(c.id)+'" onclick="tpPlanOk(this.dataset.ev)"><i class="ti ti-calendar-plus"></i> Planla</button></div></div>';o.style.display='flex';setTimeout(function(){var e=document.getElementById('tpk');if(e)e.focus()},30)}
function tpPlanOk(ev){var k=document.getElementById('tpk').value.trim(),sec=[].slice.call(document.querySelectorAll('.tpsec input:checked')).map(function(x){return x.value}),ileri=document.querySelector('input[name=tpz]:checked').value=='ileri',z=ileri?new Date(document.getElementById('tpt').value).getTime():0;
if(!k){toast('Konuyu yaz');return}if(!sec.length){toast('En az bir çalışan davet et');return}if(ileri&&!(z>Date.now())){toast('İleri bir saat seç');return}
cfNo();var t=tpYeni({ev:ev,kim:sec,konu:k,zaman:z});if(!t)return;if(t.durum=='planli'){toast('Toplantı planlandı: '+new Date(t.zaman).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}));render()}}
function tpDavetDlg(id){var t=tpBul(id);if(!t)return;var A=tmAll().filter(function(x){return t.kim.indexOf(x.id)<0}),o=document.getElementById('ov');if(!A.length){toast('Davet edilecek başka çalışan yok');return}
o.innerHTML='<div class="dl" style="max-width:440px;width:440px"><div style="color:#fff;font-size:16px;font-weight:600;margin-bottom:8px">Toplantıya davet et</div><div class="tpsec">'+A.map(function(x){return '<label class="tpc"><input type="checkbox" value="'+esc(x.id)+'">'+av(x,22,false)+esc(x.ad)+'<small>'+esc(x.gorev)+'</small></label>'}).join('')+'</div>'+
'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="bt" onclick="cfNo()">Vazgeç</button><button class="bt p" data-id="'+esc(id)+'" onclick="var s=[].slice.call(document.querySelectorAll(\'.tpsec input:checked\')).map(function(x){return x.value});cfNo();tpDavetEt(this.dataset.id,s)"><i class="ti ti-user-plus"></i> Davet et</button></div></div>';o.style.display='flex'}
// Oda ve liste sayfaları
function tpCiz(id){if(area=='team'&&pg=='toplanti'&&(!id||arg==id)){var e=document.getElementById('tpi'),v=e?e.value:'';render();var e2=document.getElementById('tpi');if(e2&&v)e2.value=v;var c=document.getElementById('tpcv');if(c)c.scrollTop=c.scrollHeight}}
function tpOda(t){var yz=TP.yaz[t.id],acik=t.durum=='acik';
var h=t.mes.map(function(m){if(m.r=='ben')return '<div class="mr"><div class="bme">'+esc(m.t)+'<small>'+tmTime(m.ts)+'</small></div></div>';if(m.r=='sys')return '<div class="inf"><i class="ti ti-info-circle"></i><div>'+esc(m.t)+'<div class="nm">'+tmTime(m.ts)+'</div></div></div>';var c=tm(m.kim)||{ad:m.kim,renk:'#888'};return tmBot(c,m.t,m.ts)}).join('');
if(yz)h+='<div class="hn" style="margin:6px 0 0 42px">'+esc(tpAd(yz))+' yazıyor…</div>';
return '<div class="hrh"><span class="hya" style="width:52px;height:52px;font-size:24px;background:#1d3045;color:#9ec5ff"><i class="ti ti-users-group"></i></span><div style="flex:1;min-width:0"><div class="en">'+esc(t.konu)+' <span class="pill" style="background:'+(acik?'#2ea0432e;color:#8ee6a9':t.durum=='planli'?'#5b8cff2e;color:#9ec5ff':'#ffffff14;color:#a4a4ab')+'">'+(acik?'Toplantı sürüyor':t.durum=='planli'?'Planlandı · '+new Date(t.zaman).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):'Bitti')+'</span></div><div class="es">Toplantı odası · açan '+esc(tpAd(t.ev))+'</div></div>'+
(t.durum!='bitti'?'<button class="bt" data-id="'+esc(t.id)+'" onclick="tpDavetDlg(this.dataset.id)"><i class="ti ti-user-plus"></i> Davet et</button>':'')+(t.durum=='planli'?'<button class="bt p" data-id="'+esc(t.id)+'" onclick="tpBasla(tpBul(this.dataset.id));render()"><i class="ti ti-player-play"></i> Şimdi başlat</button>':'')+(acik?'<button class="bt" data-id="'+esc(t.id)+'" onclick="tpBitir(this.dataset.id)"'+(yz?' disabled':'')+'><i class="ti ti-door-exit"></i> Bitir</button>':'')+'</div>'+
'<div class="tpk">'+t.kim.map(function(k){var c=tm(k);if(!c)return '';return '<span class="tpkk'+(yz==k?' yz':'')+'">'+av(c,22,false)+esc(c.ad)+(k==t.ev?' <small>açan</small>':t.durum!='bitti'?'<i class="ti ti-x" title="Toplantıdan çıkar" data-id="'+esc(t.id)+'" data-k="'+esc(k)+'" onclick="tpCikar(this.dataset.id,this.dataset.k)"></i>':'')+'</span>'}).join('')+'</div>'+
'<div class="cv" id="tpcv" style="margin-top:10px">'+(h||'<div class="hn">Toplantı '+(t.durum=='planli'?'saati gelince başlayacak.':'başladı.')+'</div>')+'</div>'+
(acik?'<div class="cmp"><textarea id="tpi" rows="1" placeholder="Toplantıya yaz… (Enter gönderir)" oninput="tmGrow(this)" onkeydown="if(event.key==\'Enter\'&&!event.shiftKey&&!event.altKey){event.preventDefault();tpGonder(\''+jq(t.id)+'\')}"></textarea><div class="cbt"><span class="hn">Her çalışan kendi alanından sırayla cevaplar · söyleyecek yoksa sessiz kalır</span><span style="flex:1"></span><button class="snd" title="Gönder" onclick="tpGonder(\''+jq(t.id)+'\')"><i class="ti ti-arrow-up"></i></button></div></div>':'')}
function tpListe(){var L=tpS().slice().sort(function(a,b){var s={acik:0,planli:1,bitti:2};return s[a.durum]-s[b.durum]||(a.durum=='bitti'?b.ts-a.ts:a.zaman-b.zaman)});
var sat=function(t){return '<div class="kr" style="cursor:pointer" data-id="'+esc(t.id)+'" onclick="tpGit(this.dataset.id)"><div style="min-width:0">'+esc(t.konu)+'<div class="hn">'+(t.durum=='acik'?'Sürüyor':t.durum=='planli'?'Planlandı · '+new Date(t.zaman).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):'Bitti · '+new Date(t.bitis||t.ts).toLocaleDateString('tr-TR'))+' · '+esc(t.kim.map(tpAd).join(', '))+'</div></div><i class="ti ti-chevron-right"></i></div>'};
return '<div class="hrh"><span class="hya" style="width:52px;height:52px;font-size:24px;background:#1d3045;color:#9ec5ff"><i class="ti ti-users-group"></i></span><div style="flex:1;min-width:0"><div class="en">Toplantılar</div><div class="es">Çalışanları aynı odada toplayıp konuş · planlananlar için saati gelince bildirim</div></div><button class="bt p" onclick="tpPlanDlg(\'orin\')"><i class="ti ti-calendar-plus"></i> Yeni toplantı</button></div>'+
'<div class="card" style="margin-top:14px">'+(L.length?L.map(sat).join(''):'<div class="hn">Henüz toplantı yok. Bir çalışanın sohbetinde “Toplantı planla”ya ya da buradan “Yeni toplantı”ya bas.</div>')+'</div>'}
// Çalışan sohbetinden: "Toplantı planla" + çalışanın önerisi ("TOPLANTI ÖNER: Sage, Kai" satırı → düğme)
var _tpMs=tmMsgs;tmMsgs=function(c){return _tpMs(c).replace('<div class="sct">','<div class="sct"><span onclick="tpPlanDlg(\''+jq(c.id)+'\')"><i class="ti ti-users-group"></i> Toplantı planla</span>')};
var TP_KURAL='\nKonu senin alanının dışına çıkıp başka çalışanları da ilgilendiriyorsa Çağlar’a toplantı önerebilirsin: cevabının sonuna ayrı bir satırda “TOPLANTI ÖNER: Ad1, Ad2” yaz (yalnız gerçekten gerekiyorsa; yalnız JSON istenen işlerde yazma).';
var _tpZs=zekaSistem;zekaSistem=function(c){return _tpZs(c)+TP_KURAL};
tmPushKanca(30,'toplanti-oner',function(id,m,_tpPush){if(m&&m.r=='o'&&typeof m.t=='string'&&/TOPLANTI ÖNER\s*:/i.test(m.t)&&tm(id)){var mm=m.t.match(/TOPLANTI ÖNER\s*:\s*([^\n]+)/i),adlar=mm[1].split(/[,;]| ve /).map(function(x){return x.replace(/[.*_]/g,'').trim()}).filter(function(x){var c=tmByName(x);return c&&c.id!=id});
m.t=m.t.replace(/\n?[^\n]*TOPLANTI ÖNER\s*:[^\n]*/i,'').trim();if(adlar.length){m.qr=(m.qr||[]).concat(['Toplantı aç: '+adlar.join(', ')])}}return _tpPush(id,m)});
var _tpSend=tmSend;tmSend=function(id,txt,tur){var t=String(txt||'').trim(),mm=t.match(/^Toplantı aç:\s*(.+)$/);if(mm&&tm(id)){tpPlanDlg(id,mm[1].split(',').map(function(x){var c=tmByName(x.trim());return c&&c.id}).filter(Boolean));return null}return _tpSend(id,txt,tur)};
// Kenar çubuğu, sayfa, başlık
var _tpSb=teamSb;teamSb=function(){var h=_tpSb(),n=tpS().filter(function(t){return t.durum!='bitti'}).length,ek='<div class="si'+(pg=='toplanti'?' on':'')+'" data-nav="1" onclick="nav(\'team\',\'toplanti\',\'\')"><span class="hri" style="background:#1d3045;color:#9ec5ff"><i class="ti ti-users-group"></i></span><div style="flex:1;min-width:0"><div>Toplantılar</div><div class="rl">Çalışanlarla ortak oda</div></div>'+(n?'<span class="cnt">'+n+'</span>':'')+'</div>',i=h.indexOf('<div class="g">Yönetim</div>');return i>=0?h.slice(0,i)+ek+h.slice(i):h+ek};
var _tpTp=teamPage;teamPage=function(){if(pg=='toplanti'){var t=arg&&tpBul(arg);return t?tpOda(t):tpListe()}return _tpTp()};
var _tpTt=teamTitle;teamTitle=function(){if(pg=='toplanti'){var t=arg&&tpBul(arg);return 'Çalışanlarım › Toplantılar'+(t?' › '+t.konu:'')}return _tpTt()};
var _tpAf=teamAfter;teamAfter=function(){_tpAf();if(pg=='toplanti'){var c=document.getElementById('tpcv');if(c)c.scrollTop=c.scrollHeight}if(pg=='jarvis'){var j=document.getElementById('jvcv');if(j)j.scrollTop=j.scrollHeight}};

// ---------- Testler (yalnız smoke) ----------
window.__v0715Test=function(){var R=[],T=TMS(),bk={tp:S.toplanti?JSON.stringify(S.toplanti):null,jv:S.jarvis?JSON.stringify(S.jarvis):null,ch:JSON.stringify(T.sohbet),st:ABN.st,cg:TP.cagir,bl:TP.bildir,js:JVS.sor,jk:JVS.kaydet,zh:window.zekaHazir};
function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
ABN.st={kurulu:true,acik:true,gunluk:5,bugun:0,toplam:0,gunlukSohbet:60,sohbetBugun:0};window.zekaHazir=function(){return false};S.toplanti=[];S.jarvis={gonderilen:[]};
// 1) Jarvis planlama sohbeti
var js=[];JVS.sor=function(o){js.push(o);return Promise.resolve({ok:true,v:{metin:o.mod=='prompt'?'# Yaz tatili planı\nOrin, Otto’ya bütçe çıkarmasını ver.':'Ne zaman gitmeyi düşünüyorsun?'}})};
var jk=[];JVS.kaydet=function(o){jk.push(o);return Promise.resolve({ok:true,v:'C:/Jarvis/giden/2026-11-11-2300-orin-yaz-tatili-plani.md'})};
nav('team','jarvis');var h0=document.getElementById('ct').innerHTML;t('Jarvis sayfasında planlama sohbeti ve “Prompt oluştur”',/Planlama sohbeti/.test(h0)&&/Prompt oluştur/.test(h0)&&/Şirkete iş dosyası gönder/.test(h0)&&/Promptu Şirkete Gönder/.test(h0));
return jvSor('Yaz tatili planlayalım').then(function(){var L=jvSohbet();
t('Jarvis cevap verir (abonelik, geçmişle)',js.length==1&&js[0].mesaj=='Yaz tatili planlayalım'&&L.length==2&&L[1].r=='j'&&/Ne zaman/.test(L[1].t),JSON.stringify(L));
return jvSor('Temmuz sonu, 5 gün')}).then(function(){t('İkinci mesajda önceki sohbet gider',js[1].gecmis.length==2&&js[1].gecmis[0].t=='Yaz tatili planlayalım');
return jvPrompt()}).then(function(){t('“Prompt oluştur” kararlaştırılanı promptlaştırıp gönderme alanına koyar',js[2].mod=='prompt'&&js[2].gecmis.length==4&&/^# Yaz tatili planı/.test(JV.metin),JV.metin);
nav('team','jarvis');t('Prompt alttaki gönderme alanında',/# Yaz tatili planı/.test(document.getElementById('jvm').value));
T.sohbet.orin=[];return jvIlet(JV.metin)}).then(function(){var o=tmChat('orin').slice(-1)[0],g=jvS().gonderilen.slice(-1)[0];
t('Şirkete gönder: iş dosyası kaydedilir ve yalnız Orin’e gider',jk.length==1&&/Yaz tatili/.test(jk[0].metin)&&/Jarvis aracılığıyla\): # Yaz tatili/.test(o.t)&&g.dosya&&/orin-yaz-tatili/.test(g.dosya),JSON.stringify(g));
ABN.st.sohbetBugun=60;var n=js.length;return jvSor('sınır').then(function(){t('Sohbet sınırı dolunca Jarvis çağrılmaz',js.length==n);ABN.st.sohbetBugun=0})}).then(function(){
// 2) Toplantı
var bl=[];TP.bildir=function(x){bl.push(x.id)};var cg=[];TP.cagir=function(o){cg.push(o);return Promise.resolve({ok:true,v:{metin:o.kim=='kai'?'PAS':o.kim=='orin'&&/tutanak/.test(o.sistem)?'Kararlar: Temmuz sonu. Yapılacaklar: Otto bütçe.':o.kim=='orin'?'Bütçeyi Otto netleştirsin.':'Temmuz sonu için 12 bin TL yeterli.'}})};
var ip=tpYeni({ev:'orin',kim:['otto'],konu:'İleri toplantı',zaman:Date.now()+3600e3});t('İleri saatli toplantı planlanır, davetlilere bildirilir',ip.durum=='planli'&&bl.length==0&&/toplantıya davet etti/.test(tmChat('otto').slice(-1)[0].t));
ip.zaman=Date.now()-1000;tpTara();t('Saati gelince toplantı başlar ve Çağlar’a davet bildirimi gelir',ip.durum=='acik'&&bl.indexOf(ip.id)>=0);
var tp=tpYeni({ev:'orin',kim:['otto','kai'],konu:'Yaz tatili'});t('“Şimdi” toplantı hemen başlar',tp.durum=='acik'&&bl.indexOf(tp.id)>=0&&tp.kim.join()=='orin,otto,kai');
tpGit(tp.id);var ho=document.getElementById('ct').innerHTML;t('Toplantı odası: katılımcılar, davet, bitir, yazı alanı',/Toplantı sürüyor/.test(ho)&&/Davet et/.test(ho)&&/Bitir/.test(ho)&&/id="tpi"/.test(ho));
return tpGonder(tp.id,'Tatil bütçesini konuşalım').then(function(){var o=tp.mes.filter(function(m){return m.r=='o'});
t('Davetliler aynı oturumda sırayla cevaplar (açan önce)',cg.length==3&&cg[0].kim=='orin'&&cg[1].kim=='otto'&&o.length==2&&o[0].kim=='orin'&&o[1].kim=='otto',JSON.stringify(cg.map(function(x){return x.kim})));
t('Söyleyecek yoksa PAS → sessiz kalır',!o.some(function(m){return m.kim=='kai'}));
t('Toplantı kuralları ve geçmiş isteme girer',/ŞU AN TOPLANTIDASIN/.test(cg[1].sistem)&&/Orin: Bütçeyi Otto/.test(cg[1].istem)&&/Çağlar: Tatil bütçesini/.test(cg[1].istem));
return tpDavetEt(tp.id,['marco'])}).then(function(y){t('Toplantı sırasında yeni davet; yeni katılan konuşmaya katılır',y.join()=='marco'&&tp.kim.indexOf('marco')>=0&&cg.slice(-1)[0].kim=='marco'&&/şimdi katıldın/.test(cg.slice(-1)[0].sistem)&&/süren toplantıya/.test(tmChat('marco').slice(-1)[0].t));
tpCikar(tp.id,'kai');t('Katılımcı toplantıdan çıkarılabilir (açan çıkarılamaz)',tp.kim.indexOf('kai')<0&&(tpCikar(tp.id,'orin'),tp.kim.indexOf('orin')>=0));
return tpBitir(tp.id,true)}).then(function(){t('Bitirince açan çalışan özet çıkarır, özet sohbetine düşer',tp.durum=='bitti'&&/Otto bütçe/.test(tp.ozet||'')&&/toplantısının özeti/.test(tmChat('orin').slice(-1)[0].t),JSON.stringify(tp.ozet));
nav('team','toplanti','');var hl=document.getElementById('ct').innerHTML;t('Toplantı Odası sayfası ve kenar çubuğu',/Toplantı Odası/.test(hl)&&/Yeni toplantı/.test(hl)&&/Yaz tatili/.test(hl)&&/Toplantı Odası/.test(document.getElementById('sb').innerHTML));
T.sohbet.sage=[];tmPush('sage',{r:'o',t:'Bu bütçe konusu.\nTOPLANTI ÖNER: Otto, Marco'});var s=tmChat('sage').slice(-1)[0];t('Çalışan toplantı önerir → “Toplantı aç” düğmesi',!/TOPLANTI ÖNER/.test(s.t)&&s.qr&&s.qr.indexOf('Toplantı aç: Otto, Marco')>=0,JSON.stringify(s));
tmSend('sage','Toplantı aç: Otto, Marco','mesaj');var dl=document.getElementById('ov').innerHTML;t('Öneri düğmesi planlama penceresini davetlilerle açar',/Toplantı planla/.test(dl)&&/value="otto" checked/.test(dl)&&/value="marco" checked/.test(dl));cfNo();
nav('team','calisan','sage');t('Çalışan sohbetinde “Toplantı planla”',/Toplantı planla/.test(document.getElementById('ct').innerHTML));
t('Çalışan sistem isteminde toplantı önerme kuralı',/toplantı öner/.test(zekaSistem(tm('sage'))));return R})}).catch(function(e){t('0.7.15 testi',false,e.stack)}).then(function(){
if(bk.tp)S.toplanti=JSON.parse(bk.tp);else delete S.toplanti;if(bk.jv)S.jarvis=JSON.parse(bk.jv);else delete S.jarvis;T.sohbet=JSON.parse(bk.ch);ABN.st=bk.st;TP.cagir=bk.cg;TP.bildir=bk.bl;JVS.sor=bk.js;JVS.kaydet=bk.jk;window.zekaHazir=bk.zh;cfNo();save();nav('home','gun',TODAY);return R})};
