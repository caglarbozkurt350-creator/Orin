// Orvane 0.7.16 · Toplantı kararları (Çağlar'ın "Şirketin Genel Durumu" toplantısı) + gizlilik dereceleri
// - Toplantıda caveman tarzı: önce cevap, tören yok, kısa (Ai Hazır Repo-Yetenekler/caveman → Türkçe kurala çevrildi)
// - Her cevap kime yanıt verdiğini yazar (@Ad:), @Ad etiket (mavi), +Ad davet (mavi), soru başında sarı "?", karar kırmızı "!"
// - Kararı yalnız en yetkili çalışan kaydeder ("Şu kuralı notlarıma ekledim!") → hafızasına girer; Çağlar "karar: …" yazabilir
// - Kapanışta netleşmemiş kararlar önem sırasıyla, Evet/Hayır/Belki/Sen öner seçenekleriyle
// - Bitir düğmesi yazı alanında, Alt+Enter alt satır, "Toplantı Odası" adı, bilgi paneli (kim kimi çağırdı, kim kime kaç cevap)
// - Toplantı cevapları ayrı sayaçta, odaya geri dönüş, toplantılar Belgeler\Orin\Toplantılar\*.md dosyasına da yazılır
// - Gizlilik dereceleri (Nika belirler): Açık / Hassas / Gizli / Çok gizli (tek el); Orin ve Orla görev listesini değiştirebilir
var YONETIM=['orin','orla','nika'],GOREV_YETKI=['orin','orla'];

// ---------- Gizlilik dereceleri ----------
var GZ_AD=['Açık','Hassas','Gizli','Çok gizli'],GZ_ACIK=['Herkes görür','Yalnız yönetim (Orin, Orla, Nika) görür','Diğerleri yalnız “açık/kapalı” durumunu görür','Tek el: içeriği yalnız kendisi işler; Orin dahil kimse görmez, yalnız amaca ulaşılıp ulaşılmadığı sorulur'];
var GZ={cagir:function(o){return ABN.cagir(o)}};
function gzS(){S.gizlilik=S.gizlilik||{d:{iris:3},neden:{iris:'Çağlar’ın kararı: Iris’e verilen görevler gizli, içeriği kimse görmez'},kilit:{iris:1},ts:0};var g=S.gizlilik;g.d=g.d||{};g.neden=g.neden||{};g.kilit=g.kilit||{};return g}
function gzDerece(id){var d=gzS().d[id];return d==null?0:+d}
function gzGorur(izleyen,sahip){if(!sahip||izleyen==sahip||izleyen=='cagla')return true;var d=gzDerece(sahip);return d==0||(d==1&&YONETIM.indexOf(izleyen)>=0)}
function gzAyarla(id,d,neden,kilit){var g=gzS();g.d[id]=Math.max(0,Math.min(3,+d||0));if(neden!=null)g.neden[id]=String(neden).slice(0,160);if(kilit)g.kilit[id]=1;save()}
// Nika her çalışan için derece belirler (Çağlar'ın kilitlediklerine dokunmaz)
function gzNikaBelirle(){var n=tm('nika');if(!n||typeof abnSohbetHazir!='function'||!abnSohbetHazir())return Promise.resolve(0);var L=tmAll().filter(function(c){return !gzS().kilit[c.id]});if(!L.length)return Promise.resolve(0);
return GZ.cagir({kim:'nika',tur:'sohbet',sistemTam:true,araclar:'',maxTur:1,model:'haiku',zamanAsimiMs:120000,sistem:zekaSistem(n)+'\nİK Müdürü olarak her çalışan için gizlilik derecesi belirliyorsun. 0=Açık (herkes görür), 1=Hassas (yalnız yönetim), 2=Gizli (diğerleri yalnız açık/kapalı durumu görür), 3=Çok gizli (tek el: içeriği yalnız kendisi işler). Sağlık, aile, para ve kimlik gibi kişisel konular yüksek derece alır. Yalnız JSON dizi yaz: [{"id":"çalışan id","derece":0-3,"neden":"en fazla 12 kelime"}]',
istem:JSON.stringify(L.map(function(c){return{id:c.id,ad:c.ad,gorev:c.gorev,aciklama:tmDesc(c)}}))})
.then(function(r){if(!r.ok)throw new Error(r.err);var n2=0;yonJson(r.v.metin).forEach(function(x){if(!x||!tm(x.id)||gzS().kilit[x.id])return;var d=Math.round(+x.derece);if(!(d>=0&&d<=3))return;gzAyarla(x.id,d,x.neden);n2++});gzS().ts=Date.now();save();if(n2)tmPush('nika',{r:'sys',t:'Nika '+n2+' çalışanın gizlilik derecesini belirledi.'});if(area=='team')render();return n2},function(e){ZK.hata='Gizlilik: '+String(e&&e.message||e);return 0})}
function gzKart(){var A=tmAll(),g=gzS();return '<div class="card" style="margin-top:14px"><div class="ch"><i class="ti ti-lock"></i>Gizlilik dereceleri <span class="hn" style="margin-left:6px">Nika belirler · en gizli bilgi tek elden geçer</span><button class="bt" style="margin-left:auto;min-height:30px;padding:4px 12px" onclick="gzNikaBelirle().then(function(){render()})">Nika belirlesin</button></div>'+
'<div class="hn" style="margin-bottom:6px">'+GZ_AD.map(function(a,i){return '<b style="color:#ddd;font-weight:500">'+a+'</b>: '+GZ_ACIK[i]}).join(' · ')+'</div>'+
A.map(function(c){var d=gzDerece(c.id);return '<div class="kr"><div style="min-width:0">'+av(c,22,false)+' '+esc(c.ad)+'<div class="hn">'+esc(g.neden[c.id]||'—')+(g.kilit[c.id]?' · <i class="ti ti-lock"></i> Çağlar belirledi':'')+'</div></div><select class="in gzd'+d+'" style="width:auto" data-id="'+esc(c.id)+'" onchange="gzAyarla(this.dataset.id,this.value,\'Çağlar belirledi\',1);render()">'+GZ_AD.map(function(a,i){return '<option value="'+i+'"'+(i==d?' selected':'')+'>'+a+'</option>'}).join('')+'</select></div>'}).join('')+'</div>'}
var _gzAp=tmApprovals;tmApprovals=function(c){var h=_gzAp(c);return c.id=='nika'?h+gzKart():h};
// Bağlam: gizli görev içerikleri başkasına gitmez; yönetim görev kimliklerini görür
zekaBaglam=function(c){var a=[];a.push('Bugün '+lab(TODAY)+'.');
if(c.id=='echo'){a.push('İş günü kayıtları (Orvane’dan, gerçek veri): '+echoWeek().t+' '+echoMonth().t+' '+echoMissing().t);tmFacts(c).forEach(function(x){a.push(x)})}
var yet=GOREV_YETKI.indexOf(c.id)>=0,g=tmOpen(yet?null:c.id);
if(g.length)a.push('Açık görevler: '+g.slice(0,12).map(function(x){var ad=(tm(x.kim)||{}).ad||x.kim;if(!gzGorur(c.id,x.kim))return ad+': gizli görev (açık; içeriği '+(gzDerece(x.kim)>=3?'yalnız '+ad+'’da, tek el':'gizli')+')';return (yet?'[#'+x.id+'] ':'')+ad+': '+x.metin+(x.onc=='acil'?' (acil)':'')}).join(' | '));
var p=tmGelFor(c);if(p.length)a.push('Onay bekleyen gelişim talepleri: '+p.map(function(x){return (tm(x.kim)||{}).ad+' · '+tmGelLabel(x)}).join(' | '));
return a.join('\n')};
var GOREV_KURAL='\nGörev listesini sen değiştirebilirsin (Çağlar’ın kararı). Gerekirse cevabının sonunda ayrı satırlara yaz: GÖREV EKLE: {"kim":"çalışan adı","metin":"görev","onc":"normal|acil"} · GÖREV KAPAT: #görevkimliği. Gizli görevleri kapatamazsın. Yaptığını tek cümleyle söyle.';
var _gzZs=zekaSistem;zekaSistem=function(c){var d=gzDerece(c.id),h=_gzZs(c);
if(d>=2)h+='\nGizlilik derecen: '+GZ_AD[d]+'. Görevlerinin ve konuşmalarının içeriğini başka çalışana (Orin dahil) söyleme, toplantıda tekrarlama; yalnız amaca ulaşıldı mı (ulaşıldı / ulaşılmadı / sürüyor) bildir.'+(d>=3?' Bu bilgiler tek elden, yalnız senden geçer.':'');
h+='\nGizli derecedeki çalışanların görev içeriğini sorma, tahmin etme, tekrarlama.';if(GOREV_YETKI.indexOf(c.id)>=0)h+=GOREV_KURAL;return h};
// Orin ve Orla'nın görev eylemleri
function eylemAyikla(kim,metin){var log=[],t=String(metin||'');if(GOREV_YETKI.indexOf(kim)<0)return{metin:t,log:log};var ad=(tm(kim)||{}).ad||kim;
t=t.replace(/^[ \t]*GÖREV EKLE\s*:\s*(\{[^\n]*\})[ \t]*$/gim,function(m,j){try{var o=JSON.parse(j),c=tm(o.kim)||tmByName(String(o.kim||'').trim());if(!c||!String(o.metin||'').trim()){log.push('Görev açılamadı (çalışan ya da metin yok)');return ''}
var g=tmTaskNew(c.id,String(o.metin).slice(0,500),o.onc=='acil'?'acil':'normal','',false,{});if(g){g.yol=kim;g.veren=kim;var ch=tmChat(c.id);for(var i=ch.length-1;i>=0;i--){if(ch[i].r=='sys'&&/^Çağlar doğrudan görev verdi/.test(ch[i].t)){ch[i].t=ch[i].t.replace('Çağlar doğrudan görev verdi',ad+' görev verdi');break}}log.push('Görev açıldı: '+c.ad+' — '+g.metin)}}catch(e){log.push('Görev satırı okunamadı')}return ''});
t=t.replace(/^[ \t]*GÖREV KAPAT\s*:\s*#?([\w-]+)[ \t]*$/gim,function(m,id){var g=TMS().gorev.filter(function(x){return x.id==id})[0];if(!g){log.push('Görev bulunamadı: #'+id);return ''}if(!gzGorur(kim,g.kim)){log.push('Gizli görev kapatılamaz ('+((tm(g.kim)||{}).ad||g.kim)+')');return ''}
if(g.durum!='bitti'){g.durum='bitti';g.bts=Date.now();g.kapatan=kim;tmPush(g.kim,{r:'sys',t:ad+' görevi kapattı: '+g.metin});log.push('Görev kapatıldı: '+((tm(g.kim)||{}).ad||g.kim)+' — '+g.metin)}return ''});
if(log.length)save();return{metin:t.replace(/\n{3,}/g,'\n\n').trim(),log:log}}

// ---------- Etiket (@ / +) ve soru biçimi ----------
var ETK_RX=/([@+])([A-Za-zÇĞİÖŞÜçğıöşüÂâ]{2,})((?:['’][a-zçğıöşü]+)?)/g;
function tpAdBul(ad){var a=String(ad||'').split(/['’]/)[0].trim().toLocaleLowerCase('tr');if(!a)return null;if(a=='çağlar'||a=='caglar')return 'cagla';var c=tmAll().filter(function(x){return x.ad.toLocaleLowerCase('tr')==a})[0];return c?c.id:null}
function tpAdi(id){return id=='cagla'?'Çağlar':((tm(id)||{}).ad||id)}
function tpEtiketler(t,isaret){var r=[];String(t||'').replace(ETK_RX,function(m,s,ad){if(s==isaret){var id=tpAdBul(ad);if(id&&r.indexOf(id)<0)r.push(id)}return m});return r}
function tpBicim(html){html=String(html).replace(ETK_RX,function(m,s,ad,ek){return tpAdBul(ad)?'<span class="etk">'+s+ad+'</span>'+ek:m});
return html.replace(/(^|[.!…]\s+|\?\s+|\n)((?:[^.!?…\n]|\.(?=\S))*?\?)/g,function(m,a,b){return b.replace(/<[^>]*>/g,'').trim().length<3?m:a+'<span class="sru">?</span>'+b.replace(/^\s+/,'')})}
var _tpFmt=tmFmt;tmFmt=function(t){return tpBicim(_tpFmt(t))};

// ---------- Toplantı: sayaç, yetki, kurallar ----------
function tpHazir(){var s=ABN.st;return !!(typeof abnAcik=='function'&&abnAcik()&&s&&(s.toplantiBugun||0)<(s.gunlukToplanti||300)&&Date.now()>=(ABN.bekle||0)&&tmOnline())}
function tpEnYetkili(t){var L=t.kim.filter(function(k){return tm(k)}),sira=(TEAM0.calisanlar||[]).map(function(c){return c.id});return L.sort(function(a,b){return tmChain(tm(a)).length-tmChain(tm(b)).length||(sira.indexOf(a)<0?99:sira.indexOf(a))-(sira.indexOf(b)<0?99:sira.indexOf(b))})[0]}
var TP_CAVEMAN='Konuşma kuralları (Çağlar’ın kararı, caveman tarzı):\n1) İlk kelimen kime cevap verdiğin: “@Çağlar:” ya da “@Orla:” gibi.\n2) Önce cevap. Selam, teşekkür, onaylama, tekrar, özet, kapanış yok. En fazla 3 kısa cümle; cümle başına tek fikir, en fazla 20 kelime. Olumsuzluk, sayı ve adlar aynen kalır. Başkasının ve kendi önceki sözünü tekrarlama.\n3) Birini anarken @Ad yaz.\n4) Soru soracaksan karakterine uygun hitapla, tam cümleyle sor (ör. “Çağlar Bey, bir sorum var: …?”).\n5) Konu odada olmayan birinin alanına giriyorsa kendi üslubunla öner ve +Ad yaz (ör. “Görüşü için +Marco’yu çağıralım.”); her seferinde karakterine uygun, farklı cümle kur.\n';
tpKural=function(t,c){var y=tpEnYetkili(t),ya=tpAdi(y);return '\n\nŞU AN TOPLANTIDASIN. Konu: '+t.konu+'. Toplantıyı Çağlar açtı; katılımcılar: '+t.kim.map(function(k){var x=tm(k)||{ad:k,gorev:''};return x.ad+' ('+x.gorev+')'}).join(', ')+'. En yetkili çalışan: '+ya+'.\n'+TP_CAVEMAN+
(c.id==y?'6) Bir karar netleşirse ayrı satıra “KARAR: <kısa kural>” yaz; kararı yalnız sen kaydedersin.\n':'6) KARAR yazma; kararları '+ya+' kaydeder.\n')+
'7) Gizli derecedeki çalışanların görev içeriğini sorma, söyleme.\n'+(t.kararlar&&t.kararlar.length?'Alınan kararlar: '+t.kararlar.map(function(k){return k.metin}).join(' | ')+'\n':'')+
'Söyleyecek yeni bir şeyin yoksa yalnız PAS yaz. Başına adını yazma. TOPLANTI ÖNER yazma.'};
tpGecmis=function(t,c){return t.mes.slice(-24).map(function(m){if(m.r=='ben')return 'Çağlar: '+m.t;if(m.r=='sys')return '[Bilgi] '+m.t;if(m.r=='karar')return '[KARAR · '+tpAdi(m.kim)+' kaydetti] '+m.t;return tpAdi(m.kim)+(m.kime?' → '+tpAdi(m.kime):'')+': '+m.t}).join('\n\n')+'\n\nŞimdi sıra sende ('+c.ad+').'};
function tpSay(t,kim,kime){t.sayac=t.sayac||{};var s=t.sayac[kim]=t.sayac[kim]||{};var k=kime||'genel';s[k]=(s[k]||0)+1}
// Karar: yalnız en yetkili çalışan (ya da Çağlar) kaydeder; kaydedenin hafızasına girer
function tpKararKaydet(t,kim,metin){metin=String(metin||'').trim().slice(0,300);if(!metin)return null;t.kararlar=t.kararlar||[];var k={kim:kim,metin:metin,ts:Date.now()};t.kararlar.push(k);t.mes.push({r:'karar',kim:kim,t:metin,ts:k.ts});
var sahip=kim=='cagla'?tpEnYetkili(t):kim;if(sahip&&tm(sahip)){var h=tmMem(sahip).slice();h.push({id:uid(),metin:'Toplantı kararı ('+t.konu+'): '+metin,kaynak:(kim=='cagla'?'Çağlar karar verdi':'Toplantıda kendisi kaydetti')+' · '+new Date().toLocaleDateString('tr-TR'),ts:k.ts});tmSet(sahip,{haf:h})}save();return k}
// Cevabı işle: kime, karar, eylem, davet önerisi, sayaç
function tpIsle(t,k,m){var e=eylemAyikla(k,m),log=e.log,kar=[],y=tpEnYetkili(t);m=e.metin;
m=m.replace(/^[ \t]*KARAR\s*:\s*(.+)$/gim,function(a,b){if(k==y)kar.push(b.trim());return ''}).replace(/\n{3,}/g,'\n\n').trim();
var kime=null,mm=m.match(/^\s*@?([A-Za-zÇĞİÖŞÜçğıöşü]+)(?:['’][a-zçğıöşü]+)?\s*:\s*/);if(mm){var id=tpAdBul(mm[1]);if(id){kime=id;m=m.slice(mm[0].length).trim()}}
var dv=tpEtiketler(m,'+').filter(function(x){return x!='cagla'&&t.kim.indexOf(x)<0});
if(m)t.mes.push({r:'o',kim:k,t:m,ts:Date.now(),kime:kime,davet:dv.length&&YONETIM.indexOf(k)<0?dv:undefined});
if(m)tpSay(t,k,kime);kar.forEach(function(x){tpKararKaydet(t,k,x)});log.forEach(function(x){t.mes.push({r:'sys',t:'✓ '+tpAdi(k)+': '+x,ts:Date.now()})});
if(dv.length&&YONETIM.indexOf(k)>=0){t._davet=(t._davet||[]).concat(dv.map(function(x){return{kim:x,kimden:k}}))}save();return m}
tpTekCevap=function(t,k,ek){var c=tm(k);if(!c||t.durum!='acik')return Promise.resolve(null);TP.yaz[t.id]=k;tpCiz(t.id);
return TP.cagir({kim:k,tur:'toplanti',sistemTam:true,araclar:'',maxTur:1,model:typeof ABN_MODEL!='undefined'&&ABN_MODEL[tmModel(c)]||'haiku',zamanAsimiMs:120000,sistem:zekaSistem(c)+'\n\n'+zekaBaglam(c)+tpKural(t,c)+(ek||''),istem:tpGecmis(t,c)})
.then(function(r){if(!r.ok)throw new Error(r.err);var m=String(r.v.metin||'').trim();if(ABN.st)ABN.st.toplantiBugun=(ABN.st.toplantiBugun||0)+1;if(!m||/^PAS\W*$/i.test(m))return null;return tpIsle(t,k,m.replace(/^PAS\W+(?=\S)/i,''))},
function(e){t.mes.push({r:'sys',t:tpAdi(k)+' cevap veremedi: '+String(e&&e.message||e),ts:Date.now()});save();return null})};
tpTur=function(t,hedef){if(TP.yaz[t.id])return Promise.resolve();var L=(hedef&&hedef.length?hedef:t.kim).filter(function(k){return t.kim.indexOf(k)>=0}),p=Promise.resolve();
L.forEach(function(k){p=p.then(function(){if(!tpHazir()){if(!t._uyar){t._uyar=1;t.mes.push({r:'sys',t:'Toplantı cevabı verilemiyor: Claude aboneliği hazır değil ya da bugünkü toplantı sınırı ('+((ABN.st&&ABN.st.gunlukToplanti)||300)+') doldu.',ts:Date.now()})}return}return tpTekCevap(t,k)})});
return p.then(function(){delete TP.yaz[t.id];delete t._uyar;var d=t._davet||[];delete t._davet;var q=Promise.resolve();d.forEach(function(x){q=q.then(function(){return tpDavetEt(t.id,[x.kim],x.kimden,true)})});return q}).then(function(){save();tpDosya(t);tpCiz(t.id)})};
// Çağlar yazar: "+Ad" davet eder, "@Ad" yalnız o kişiyi konuşturur, "karar: …" kararı kaydeder
tpGonder=function(id,metin){var t=tpBul(id),e=document.getElementById('tpi'),x=String(metin!=null?metin:(e?e.value:'')).trim();if(!t||!x||t.durum!='acik')return Promise.resolve();if(e)e.value='';tpOneriKapat();
var kr=x.match(/^\s*karar\s*:\s*([\s\S]+)$/i);if(kr){t.mes.push({r:'ben',t:x,ts:Date.now()});tpKararKaydet(t,'cagla',kr[1]);tpDosya(t);tpCiz(id);return Promise.resolve()}
var yeni=tpEtiketler(x,'+').filter(function(k){return k!='cagla'&&t.kim.indexOf(k)<0}),hedef=tpEtiketler(x,'@').filter(function(k){return k!='cagla'&&t.kim.indexOf(k)>=0}),govde=x.replace(/\+[A-Za-zÇĞİÖŞÜçğıöşü]+(?:['’][a-zçğıöşü]+)?/g,'').trim();
t.mes.push({r:'ben',t:x,ts:Date.now(),kime:hedef[0]||undefined});tpSay(t,'cagla',hedef[0]);save();tpCiz(id);
return tpDavetEt(id,yeni,'cagla',!govde.replace(/[\s,.!]/g,'').length).then(function(){if(!govde.replace(/[\s,.!]/g,'').length)return;return tpTur(t,hedef.concat(yeni))})};
// Davet: kim kimi çağırdı kaydı; "konus" ise yeni gelen hemen katkı verir
tpDavetEt=function(id,ekler,kimden,konus){var t=tpBul(id);if(!t||t.durum=='bitti')return Promise.resolve([]);if(typeof kimden!='string'){kimden='cagla';konus=true}
var yeni=(ekler||[]).filter(function(k){return tm(k)&&t.kim.indexOf(k)<0});if(!yeni.length)return Promise.resolve([]);t.cagri=t.cagri||[];
yeni.forEach(function(k){t.kim.push(k);t.cagri.push({kim:kimden,kimi:k,ts:Date.now()});t.mes.push({r:'sys',t:tpAdi(kimden)+' +'+tpAdi(k)+'’yı toplantıya çağırdı.',ts:Date.now()});tmPush(k,{r:'sys',t:tpAdi(kimden)+' seni süren toplantıya davet etti: “'+t.konu+'”.'})});save();tpDosya(t);tpCiz(id);
if(!konus||t.durum!='acik'||!t.mes.some(function(m){return m.r=='ben'}))return Promise.resolve(yeni);
var p=Promise.resolve();yeni.forEach(function(k){p=p.then(function(){if(!tpHazir())return;return tpTekCevap(t,k,'\nToplantıya şimdi katıldın; konuşulanlara kendi alanından kısaca katkı ver ya da PAS yaz.')})});return p.then(function(){delete TP.yaz[t.id];save();tpDosya(t);tpCiz(id);return yeni})};
function tpDavetKabul(id,k){return tpDavetEt(id,[k],'cagla',true)}

// ---------- Kapanış: netleşmemiş kararlar (Evet / Hayır / Belki / Sen öner) → tutanak ----------
var TPK={sorular:null};
function tpBitirIste(id){var t=tpBul(id);if(!t||t.durum!='acik')return Promise.resolve();
if(!t.mes.some(function(m){return m.r=='ben'})||!tpHazir())return tpTutanak(t);
var y=tpEnYetkili(t),c=tm(y);TP.yaz[t.id]=y;tpCiz(id);toast(tpAdi(y)+' netleşmemiş kararları sıralıyor…');
return TP.cagir({kim:y,tur:'toplanti',sistemTam:true,araclar:'',maxTur:1,model:'haiku',zamanAsimiMs:120000,sistem:zekaSistem(c)+'\nToplantı kapanıyor. Netleşmemiş kararları önem sırasına göre çıkar. Her biri evet/hayır ile cevaplanabilen kısa bir soru olsun. Yalnız JSON dizi yaz: [{"soru":"…?","oneri":"evet|hayir|belki"}] — en fazla 6. Netleşmemiş karar yoksa [] yaz.',istem:tpGecmis(t,c).replace(/\n\nŞimdi sıra sende.*$/,'')})
.then(function(r){delete TP.yaz[t.id];if(ABN.st)ABN.st.toplantiBugun=(ABN.st.toplantiBugun||0)+1;var L=r.ok?yonJson(r.v.metin).filter(function(x){return x&&x.soru}).slice(0,6):[];if(!L.length)return tpTutanak(t);TPK.sorular=L;tpSoruDlg(t)},function(){delete TP.yaz[t.id];return tpTutanak(t)})}
function tpSoruDlg(t){var L=TPK.sorular||[],o=document.getElementById('ov'),sec=[['evet','Evet'],['hayir','Hayır'],['belki','Belki'],['oner','Sen öner']];
o.innerHTML='<div class="dl" style="max-width:620px;width:620px"><div style="color:#fff;font-size:16px;font-weight:600;margin-bottom:4px">Toplantıyı kapatmadan: netleşmemiş kararlar</div><div class="hn" style="margin-bottom:10px">Önem sırasına göre. Her satırda seç; boş bırakılan karar açık kalır. Seçtiklerin karar olarak kaydedilir.</div>'+
L.map(function(q,i){return '<div class="tpq"><div style="color:#ddd;margin-bottom:4px"><b>'+(i+1)+'.</b> <span class="sru">?</span>'+esc(q.soru)+'</div><div class="tpqs">'+sec.map(function(s){return '<label><input type="radio" name="tpq'+i+'" value="'+s[0]+'"> '+s[1]+(s[0]=='oner'&&q.oneri?' <small>('+esc({evet:'Evet',hayir:'Hayır',belki:'Belki'}[q.oneri]||q.oneri)+')</small>':'')+'</label>'}).join('')+'</div></div>'}).join('')+
'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="bt" onclick="cfNo()">Vazgeç</button><button class="bt" data-id="'+esc(t.id)+'" onclick="cfNo();tpTutanak(tpBul(this.dataset.id))">Seçmeden bitir</button><button class="bt p" data-id="'+esc(t.id)+'" onclick="tpSoruOk(this.dataset.id)"><i class="ti ti-check"></i> Kararları kaydet ve bitir</button></div></div>';o.style.display='flex'}
function tpSoruOk(id,cevap){var t=tpBul(id),L=TPK.sorular||[];if(!t)return Promise.resolve();var ad={evet:'Evet',hayir:'Hayır',belki:'Belki'},sat=[];
L.forEach(function(q,i){var v=cevap?cevap[i]:(function(){var e=document.querySelector('input[name=tpq'+i+']:checked');return e?e.value:''})();if(!v)return;var oner=v=='oner',son=oner?(q.oneri||'belki'):v;
var metin=String(q.soru).replace(/\?\s*$/,'')+' → '+(ad[son]||son)+(oner?' (öneriyle)':'');sat.push((i+1)+'. '+metin);tpKararKaydet(t,'cagla',metin)});
if(sat.length)t.mes.splice(t.mes.length-sat.length,0,{r:'ben',t:'Kapanış kararları:\n'+sat.join('\n'),ts:Date.now()});TPK.sorular=null;try{cfNo()}catch(e){}save();return tpTutanak(t)}
function tpTutanak(t){if(!t||t.durum=='bitti')return Promise.resolve();var c=tm(t.ev);
if(!t.mes.some(function(m){return m.r=='ben'})||!tpHazir()||!c){t.durum='bitti';t.bitis=Date.now();t.mes.push({r:'sys',t:'Toplantı bitti.',ts:Date.now()});if(S.tpSon==t.id)delete S.tpSon;save();tpDosya(t);render();return Promise.resolve()}
TP.yaz[t.id]=t.ev;tpCiz(t.id);
return TP.cagir({kim:t.ev,tur:'toplanti',sistemTam:true,araclar:'',maxTur:1,model:typeof ABN_MODEL!='undefined'&&ABN_MODEL[tmModel(c)]||'haiku',zamanAsimiMs:120000,sistem:zekaSistem(c)+'\nToplantıyı sen açtın; şimdi kısa tutanak yaz (caveman tarzı, tören yok): Kararlar · Yapılacaklar (kim, ne) · Açık sorular. En fazla 8 madde.',istem:'Toplantı: '+t.konu+'\n'+((t.kararlar||[]).length?'Kayıtlı kararlar: '+t.kararlar.map(function(k){return k.metin}).join(' | ')+'\n':'')+'\n'+tpGecmis(t,c).replace(/\n\nŞimdi sıra sende.*$/,'')})
.then(function(r){t.durum='bitti';t.bitis=Date.now();delete TP.yaz[t.id];if(S.tpSon==t.id)delete S.tpSon;if(r.ok){t.ozet=String(r.v.metin||'').trim();t.mes.push({r:'o',kim:t.ev,t:'Toplantı özeti:\n'+t.ozet,ts:Date.now()});tmPush(t.ev,{r:'o',t:'“'+t.konu+'” toplantısının özeti:\n'+t.ozet});t.kim.forEach(function(k){if(k!=t.ev)tmPush(k,{r:'sys',t:'“'+t.konu+'” toplantısı bitti; özet '+tpAdi(t.ev)+'’nın sohbetinde.'})})}save();tpDosya(t);render()},
function(){t.durum='bitti';t.bitis=Date.now();delete TP.yaz[t.id];save();tpDosya(t);render()})}
tpBitir=function(id,sorma){var t=tpBul(id);if(!t||t.durum=='bitti')return Promise.resolve();if(sorma)return tpTutanak(t);
confirmBox('“'+esc(t.konu)+'” toplantısı bitirilsin mi?<div class="hn" style="margin-top:6px">Önce netleşmemiş kararlar seçenekli sorulur, sonra '+esc(tpAdi(t.ev))+' tutanak yazar.</div>',function(){tpBitirIste(id)},'Bitir');return Promise.resolve()};

// ---------- Dosya kaydı: Belgeler\Orin\Toplantılar\<tarih>-<konu>.md ----------
var TPD={zam:{},kaydet:function(o){return API&&API.toplanti?API.toplanti.kaydet(o):Promise.resolve({ok:false})}};
function tpSlug(s){return String(s||'toplanti').toLocaleLowerCase('tr').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50)||'toplanti'}
function tpDosyaAdi(t){if(!t.dosya){var d=new Date(t.ts||Date.now()),p=function(n){return String(n).padStart(2,'0')};t.dosya=d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+'-'+tpSlug(t.konu)+'.md'}return t.dosya}
function tpMd(t){var d=function(ts){return new Date(ts).toLocaleString('tr-TR')};return '# Toplantı: '+t.konu+'\n\n- Durum: '+({acik:'sürüyor',planli:'planlandı',bitti:'bitti'}[t.durum]||t.durum)+'\n- Açan: '+tpAdi(t.ev)+' · Başlangıç: '+d(t.basla||t.zaman||t.ts)+(t.bitis?' · Bitiş: '+d(t.bitis):'')+'\n- Katılımcılar: '+t.kim.map(tpAdi).join(', ')+'\n'+
((t.kararlar||[]).length?'\n## Kararlar\n'+t.kararlar.map(function(k,i){return (i+1)+'. '+k.metin+' ('+tpAdi(k.kim)+' kaydetti)'}).join('\n')+'\n':'')+(t.ozet?'\n## Tutanak\n'+t.ozet+'\n':'')+
'\n## Konuşma\n'+t.mes.map(function(m){var s=new Date(m.ts).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});return '- '+s+' · '+(m.r=='ben'?'**Çağlar**':m.r=='sys'?'_bilgi_':m.r=='karar'?'❗ **KARAR** ('+tpAdi(m.kim)+')':'**'+tpAdi(m.kim)+'**'+(m.kime?' → '+tpAdi(m.kime):''))+': '+String(m.t).replace(/\n/g,'\n  ')}).join('\n')+'\n'}
function tpDosya(t,hemen){if(!t)return;var f=function(){delete TPD.zam[t.id];TPD.kaydet({ad:tpDosyaAdi(t),md:tpMd(t)}).then(function(r){if(r&&r.ok&&t.yol!=r.v){t.yol=r.v;save()}})};clearTimeout(TPD.zam[t.id]);if(hemen||INFO.smoke)return f();TPD.zam[t.id]=setTimeout(f,INFO.smoke?0:1200)}
var _tpBas2=tpBasla;tpBasla=function(t){_tpBas2(t);tpDosya(t)};

// ---------- Oda görünümü ----------
function tpBot(m){var c=tm(m.kim)||{ad:m.kim,renk:'#888'};return '<div class="mr l">'+av(c,32)+'<div style="flex:1;min-width:0"><div class="who">'+esc(c.ad)+(m.kime?' <span class="etk" style="font-weight:500">→ '+esc(tpAdi(m.kime))+'</span>':'')+' <span>· '+tmTime(m.ts)+'</span></div><div class="bo">'+tmFmt(m.t)+'</div>'+
(m.davet&&m.davet.length?'<div class="qr">'+m.davet.map(function(k){return '<span data-k="'+esc(k)+'" onclick="tpDavetKabul(arg,this.dataset.k)"><i class="ti ti-user-plus"></i> +'+esc(tpAdi(k))+'’yı davet et</span>'}).join('')+'</div>':'')+'</div></div>'}
// İlerleme çubuğu (kalan toplantı cevabı) + konuşma gantt çizelgesi: odanın üstünde sabit, her mesajda güncellenir
function tpGantt(t){var s=ABN.st||{},lim=s.gunlukToplanti||300,kul=Math.min(lim,s.toplantiBugun||0),kal=Math.max(0,lim-kul),yuz=lim?Math.round(kul*100/lim):100,n=Math.max(1,t.kim.length),renk=yuz>=90?'#f85149':yuz>=70?'#e3a33b':'#3fb950';
var M=t.mes.filter(function(m){return m.r=='ben'||m.r=='o'||m.r=='karar'}),bas=t.basla||t.ts,son=Math.max(Date.now(),M.length?M[M.length-1].ts:bas),aralik=Math.max(60000,son-bas);
var kisiler=['cagla'].concat(t.kim),satir=kisiler.map(function(k){var c=k=='cagla'?{ad:'Çağlar',renk:'#f6d28a'}:(tm(k)||{ad:k,renk:'#888'}),L=M.filter(function(m){return (m.r=='ben'?'cagla':m.kim)==k});
return '<div class="tpgr"><span class="tpga">'+esc(c.ad)+' <small>'+L.length+'</small></span><span class="tpgt">'+L.map(function(m){var x=Math.min(98.5,(m.ts-bas)*100/aralik);return '<i style="left:'+x.toFixed(1)+'%;background:'+(m.r=='karar'?'#f85149':c.renk)+'" title="'+esc(c.ad+' · '+new Date(m.ts).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})+(m.r=='karar'?' · KARAR':''))+'"></i>'}).join('')+'</span></div>'}).join('');
var dk=Math.round(aralik/60000);
return '<div class="tpust"><div class="tpgb-b"><span><i class="ti ti-progress"></i> Kalan toplantı cevabı: <b>'+kal+'</b> / '+lim+' <small>(≈'+Math.floor(kal/n)+' tur, '+n+' katılımcı)</small></span><span class="hn">'+dk+' dk · '+M.length+' mesaj · '+(t.kararlar||[]).length+' karar</span></div>'+
'<div class="tpgb"><span style="width:'+yuz+'%;background:'+renk+'"></span></div><div class="tpg">'+satir+'<div class="tpgx"><span>'+new Date(bas).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})+'</span><span>'+new Date(son).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})+'</span></div></div></div>'}
function tpBilgi(t){var C=t.cagri||[],S2=t.sayac||{},ks=Object.keys(S2);
return '<details class="tpbil"><summary><i class="ti ti-info-circle"></i> Bilgi · '+C.length+' çağrı · '+ks.reduce(function(a,k){return a+Object.keys(S2[k]).reduce(function(b,x){return b+S2[k][x]},0)},0)+' konuşma</summary>'+
'<div class="hn" style="margin:6px 0 2px">Kim kimi çağırdı</div>'+(C.length?C.map(function(x){return '<div class="tpbs">'+esc(tpAdi(x.kim))+' → <span class="etk">+'+esc(tpAdi(x.kimi))+'</span> <small>'+tmTime(x.ts)+'</small></div>'}).join(''):'<div class="hn">Henüz çağrı yok</div>')+
'<div class="hn" style="margin:8px 0 2px">Kim kime kaç kez cevap verdi</div>'+(ks.length?'<table class="tpbt">'+ks.map(function(k){return Object.keys(S2[k]).map(function(x){return '<tr><td>'+esc(tpAdi(k))+'</td><td>→ '+(x=='genel'?'herkese':'<span class="etk">@'+esc(tpAdi(x))+'</span>')+'</td><td>'+S2[k][x]+'</td></tr>'}).join('')}).join('')+'</table>':'<div class="hn">Henüz yok</div>')+'</details>'}
tpOda=function(t){var yz=TP.yaz[t.id],acik=t.durum=='acik',K=t.kararlar||[];if(acik)S.tpSon=t.id;
var h=t.mes.map(function(m){if(m.r=='ben')return '<div class="mr"><div class="bme">'+tpBicim(esc(m.t)).replace(/\n/g,'<br>')+'<small>'+tmTime(m.ts)+'</small></div></div>';
if(m.r=='sys')return '<div class="inf"><i class="ti ti-info-circle"></i><div>'+tpBicim(esc(m.t))+'<div class="nm">'+tmTime(m.ts)+'</div></div></div>';
if(m.r=='karar')return '<div class="tpkarar"><span class="krr">!</span><div><b>'+esc(tpAdi(m.kim))+'</b>: '+(m.kim=='cagla'?'Karar verildi; ':'Şu kuralı notlarıma ekledim! ')+'<b>“'+esc(m.t)+'”</b><div class="nm">'+tmTime(m.ts)+'</div></div></div>';
return tpBot(m)}).join('');
if(yz)h+='<div class="hn" style="margin:6px 0 0 42px">'+esc(tpAdi(yz))+' yazıyor…</div>';
return '<div class="hrh"><span class="hya" style="width:52px;height:52px;font-size:24px;background:#1d3045;color:#9ec5ff"><i class="ti ti-users-group"></i></span><div style="flex:1;min-width:0"><div class="en">'+esc(t.konu)+' <span class="pill" style="background:'+(acik?'#2ea0432e;color:#8ee6a9':t.durum=='planli'?'#5b8cff2e;color:#9ec5ff':'#ffffff14;color:#a4a4ab')+'">'+(acik?'Toplantı sürüyor':t.durum=='planli'?'Planlandı · '+new Date(t.zaman).toLocaleString('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):'Bitti')+'</span></div><div class="es">Toplantı Odası · açan '+esc(tpAdi(t.ev))+' · kararları '+esc(tpAdi(tpEnYetkili(t)))+' kaydeder'+(t.yol?' · <span style="cursor:pointer;text-decoration:underline" data-p="'+esc(t.yol)+'" onclick="API.openPath(this.dataset.p)">dosya</span>':'')+'</div></div>'+
(t.durum!='bitti'?'<button class="bt" data-id="'+esc(t.id)+'" onclick="tpDavetDlg(this.dataset.id)"><i class="ti ti-user-plus"></i> Davet et</button>':'')+(t.durum=='planli'?'<button class="bt p" data-id="'+esc(t.id)+'" onclick="tpBasla(tpBul(this.dataset.id));render()"><i class="ti ti-player-play"></i> Şimdi başlat</button>':'')+'</div>'+
tpGantt(t)+'<div class="tpk">'+t.kim.map(function(k){var c=tm(k);if(!c)return '';return '<span class="tpkk'+(yz==k?' yz':'')+'">'+av(c,22,false)+esc(c.ad)+(k==t.ev?' <small>açan</small>':'')+(k==tpEnYetkili(t)?' <small style="color:#ff8a80">karar</small>':'')+(k!=t.ev&&t.durum!='bitti'?'<i class="ti ti-x" title="Toplantıdan çıkar" data-id="'+esc(t.id)+'" data-k="'+esc(k)+'" onclick="tpCikar(this.dataset.id,this.dataset.k)"></i>':'')+'</span>'}).join('')+'</div>'+
(K.length?'<details class="tpbil" open><summary><span class="krr" style="width:16px;height:16px;font-size:11px">!</span> Kararlar · '+K.length+'</summary>'+K.map(function(k,i){return '<div class="tpbs">'+(i+1)+'. '+esc(k.metin)+' <small>'+esc(tpAdi(k.kim))+'</small></div>'}).join('')+'</details>':'')+tpBilgi(t)+
'<div class="cv" id="tpcv" style="margin-top:10px">'+(h||'<div class="hn">Toplantı '+(t.durum=='planli'?'saati gelince başlayacak.':'başladı.')+'</div>')+'</div>'+
(acik?'<div class="cmp"><div id="tpon" class="tpon"></div><textarea id="tpi" rows="1" placeholder="Toplantıya yaz… @Ad yalnız onu konuşturur · +Ad çağırır · karar: … kaydeder (Enter gönderir, Alt+Enter alt satır)" oninput="tmGrow(this);tpOneri(this)" onkeydown="tpKey(event,\''+jq(t.id)+'\')"></textarea>'+
'<div class="cbt"><button class="bt tpbit" onclick="tpBitir(\''+jq(t.id)+'\')"'+(yz?' disabled':'')+'><i class="ti ti-door-exit"></i> Toplantıyı bitir</button><span class="hn" style="margin-left:8px">Kısa ve öz konuşulur · söyleyecek yoksa sessiz kalınır</span><span style="flex:1"></span><button class="snd" title="Gönder" onclick="tpGonder(\''+jq(t.id)+'\')"><i class="ti ti-arrow-up"></i></button></div></div>':'')};
// Enter gönderir; Alt+Enter (ya da Shift+Enter) alt satır
function tpKey(ev,id){if(ev.key!='Enter')return;if(ev.altKey||ev.shiftKey){if(ev.altKey){ev.preventDefault();var e=ev.target,a=e.selectionStart;e.value=e.value.slice(0,a)+'\n'+e.value.slice(e.selectionEnd);e.selectionStart=e.selectionEnd=a+1;tmGrow(e)}return}ev.preventDefault();var on=document.querySelector('#tpon span');if(on&&TPO.acik){on.click();return}tpGonder(id)}
// @ / + yazarken ad önerisi
var TPO={acik:false};
function tpOneri(e){var d=document.getElementById('tpon');if(!d)return;var m=e.value.slice(0,e.selectionStart).match(/([@+])([A-Za-zÇĞİÖŞÜçğıöşü]*)$/);if(!m){tpOneriKapat();return}var t=tpBul(arg),q=m[2].toLocaleLowerCase('tr');
var L=(m[1]=='@'?[{id:'cagla',ad:'Çağlar'}].concat(t.kim.map(function(k){return tm(k)}).filter(Boolean)):tmAll().filter(function(c){return t.kim.indexOf(c.id)<0})).filter(function(c){return c.ad.toLocaleLowerCase('tr').indexOf(q)==0}).slice(0,6);
if(!L.length){tpOneriKapat();return}TPO.acik=true;d.innerHTML=L.map(function(c){return '<span data-s="'+m[1]+'" data-ad="'+esc(c.ad)+'" onmousedown="event.preventDefault();tpOneriSec(this.dataset.s,this.dataset.ad)">'+m[1]+esc(c.ad)+'</span>'}).join('');d.style.display='flex'}
function tpOneriSec(s,ad){var e=document.getElementById('tpi');if(!e)return;var a=e.selectionStart,on=e.value.slice(0,a).replace(/([@+])([A-Za-zÇĞİÖŞÜçğıöşü]*)$/,s+ad+' ');e.value=on+e.value.slice(a);e.selectionStart=e.selectionEnd=on.length;e.focus();tpOneriKapat()}
function tpOneriKapat(){TPO.acik=false;var d=document.getElementById('tpon');if(d){d.innerHTML='';d.style.display='none'}}
// Liste: "Toplantı Odası"
var _tpL2=tpListe;tpListe=function(){return _tpL2().replace('<div class="en">Toplantılar</div>','<div class="en">Toplantı Odası</div>')};
var _tpSb2=teamSb;teamSb=function(){return _tpSb2().replace('<div>Toplantılar</div>','<div>Toplantı Odası</div>')};
var _tpTt2=teamTitle;teamTitle=function(){return _tpTt2().replace('Çalışanlarım › Toplantılar','Çalışanlarım › Toplantı Odası')};
// Odaya geri dönüş: sürerken başka yere gidip "Çalışanlarım"a dönünce oda açılır; her ekip sayfasında "Odaya dön" şeridi
function tpAktif(){var s=S.tpSon&&tpBul(S.tpSon);if(s&&s.durum=='acik')return s;return tpS().filter(function(t){return t.durum=='acik'})[0]||null}
var _tpOa=openArea;openArea=function(a){var t=a=='team'&&tpAktif();if(t&&S.tpSon==t.id){nav('team','toplanti',t.id);return}return _tpOa(a)};
var _tpTp2=teamPage;teamPage=function(){var h=_tpTp2(),t=tpAktif();if(pg!='toplanti'&&t)h='<div class="tpser" data-id="'+esc(t.id)+'" onclick="tpGit(this.dataset.id)"><span class="dt ok"></span> Toplantı sürüyor: <b>'+esc(t.konu)+'</b> <span style="margin-left:auto">Odaya dön <i class="ti ti-arrow-right"></i></span></div>'+h;return h};
// Normal sohbette çalışanın kendi üslubuyla toplantı önerisi (+Ad) → "Toplantı aç" düğmesi
TP_KURAL='\nKonu senin alanının dışına çıkıp başka bir çalışanı da ilgilendiriyorsa, kendi üslubunla toplantı öner ve adını +Ad diye yaz (ör. “İsterseniz bu konuda görüşlerini almak için +Marco’yu toplantıya davet edelim.”). Her seferinde karakterine uygun, farklı bir cümle kur; yalnız gerçekten gerekiyorsa.';
tmPushKanca(20,'toplanti-eylem',function(id,m,_tpPush2){if(m&&m.r=='o'&&typeof m.t=='string'&&tm(id)){var e=eylemAyikla(id,m.t);m.t=e.metin;
var dv=tpEtiketler(m.t,'+').filter(function(k){return k!='cagla'&&k!=id});if(dv.length&&!(m.qr||[]).some(function(q){return /^Toplantı aç:/.test(q)}))m.qr=(m.qr||[]).concat(['Toplantı aç: '+dv.map(tpAdi).join(', ')]);
var r=_tpPush2(id,m);e.log.forEach(function(x){_tpPush2(id,{r:'sys',t:'✓ '+x})});return r}return _tpPush2(id,m)});
// Toplantıdaki eksikler Ada'nın listesine (bir kez)
function tpEksiklerAda(){if(S.k716||typeof isEkle!='function')return;S.k716=1;[['k716-takvim','Google Takvim bağlantısı','Çalışanlar (Remy, Orin) Google Takvim’e etkinlik ekleyebilsin; hatırlatıcılar Çağlar’a kalmasın. (Toplantı kararı)'],
['k716-kalici','Çalışanlar kalıcı not tutabilsin','Takip ve kararlar sohbet dışında kalıcı kaydedilebilsin (toplantı kararları hafızaya giriyor; genel not defteri eksik). (Toplantı kararı)'],
['k716-internet','Çalışanlara internet araması','Sohbette gerektiğinde web araması (abonelikte WebSearch), maliyet sınırıyla. (Toplantı kararı)']].forEach(function(x){if(!isBul(x[0]))isEkle({id:x[0],kim:'ada',tur:'guncelleme',kaynak:'toplanti',baslik:x[1],metin:x[2]})});save()}
tpEksiklerAda();
if(!INFO.smoke)setTimeout(function(){if(!gzS().ts&&typeof abnSohbetHazir=='function'&&abnSohbetHazir())gzNikaBelirle()},70000);
// Ayarlar › Yapay zekâ: toplantı sınırı
var _tpAk=abnKart;abnKart=function(){var h=_tpAk(),s=ABN.st;if(!s)return h;var r='<div class="kr"><span>Günlük toplantı cevabı sınırı<div class="hn">Bugün '+(s.toplantiBugun||0)+' / '+(s.gunlukToplanti||300)+' · sohbet sınırından ayrı</div></span><select class="in" style="width:auto" onchange="abnAyar({gunlukToplanti:this.value})">'+[[100,'100'],[200,'200'],[300,'300'],[500,'500']].map(function(x){return '<option value="'+x[0]+'"'+(String(s.gunlukToplanti||300)==String(x[0])?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></div>',i=h.indexOf('<div class="kr"><span>Model');return i>=0?h.slice(0,i)+r+h.slice(i):h};

// ---------- Testler (yalnız smoke) ----------
window.__v0716Test=function(){var R=[],T=TMS(),bk={tp:S.toplanti?JSON.stringify(S.toplanti):null,gz:S.gizlilik?JSON.stringify(S.gizlilik):null,ch:JSON.stringify(T.sohbet),gor:T.gorev.slice(),m:JSON.stringify(T.m),st:ABN.st,cg:TP.cagir,bl:TP.bildir,gc:GZ.cagir,dk:TPD.kaydet,son:S.tpSon,zh:window.zekaHazir};
function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
ABN.st={kurulu:true,acik:true,gunluk:5,bugun:0,toplam:0,gunlukSohbet:60,sohbetBugun:60,gunlukToplanti:300,toplantiBugun:0};window.zekaHazir=function(){return false};S.toplanti=[];TP.bildir=function(){};
var dk=[];TPD.kaydet=function(o){dk.push(o);return Promise.resolve({ok:true,v:'C:/Orin/Toplantılar/'+o.ad})};
var cg=[],cev={};TP.cagir=function(o){cg.push(o);var f=cev[o.kim];return Promise.resolve({ok:true,v:{metin:typeof f=='function'?f(o):f||'PAS'}})};
t('Toplantı sohbet sınırından ayrı sayılır (sohbet 60/60 iken toplantı hazır)',tpHazir()&&!abnSohbetHazir());
var tp=tpYeni({ev:'orin',kim:['orla','iris'],konu:'Genel durum'});
cev.orin='@Çağlar: Bütçe hazır. Orla, bir sorum var: takvim ne durumda?\nKARAR: Toplantılarda kısa konuşulur.';cev.orla='@Orin: Takvim hazır değil.\nKARAR: Bu kaydedilmemeli.';cev.iris='PAS';
return tpGonder(tp.id,'Durum nedir?').then(function(){var o=tp.mes.filter(function(m){return m.r=='o'}),k=tp.kararlar||[];
t('Toplantıda caveman kuralı ve kime cevap kuralı',/caveman/.test(cg[0].sistem)&&/İlk kelimen kime cevap/.test(cg[0].sistem)&&cg[0].tur=='toplanti',cg[0].tur);
t('Cevap kime verildiği ayrılır (→ Çağlar, → Orin)',o[0].kime=='cagla'&&o[1].kime=='orin'&&!/^@/.test(o[0].t),JSON.stringify(o.map(function(x){return [x.kim,x.kime,x.t]})));
t('Kararı yalnız en yetkili (Orin) kaydeder; Orla’nın KARAR satırı yok sayılır',k.length==1&&k[0].kim=='orin'&&/kısa konuşulur/.test(k[0].metin)&&!o[1].t.match(/KARAR/),JSON.stringify(k));
t('Karar en yetkilinin hafızasına girer',tmMem('orin').some(function(h){return /Toplantı kararı \(Genel durum\): Toplantılarda kısa konuşulur/.test(h.metin)}));
t('Kim kime kaç kez cevap verdi sayılır',tp.sayac&&tp.sayac.orin.cagla==1&&tp.sayac.orla.orin==1,JSON.stringify(tp.sayac));
tpGit(tp.id);var h=document.getElementById('ct').innerHTML;
t('Odada kırmızı ünlemli karar, sarı soru işareti, mavi etiket',/class="tpkarar"><span class="krr">!<\/span>/.test(h)&&/Şu kuralı notlarıma ekledim!/.test(h)&&/class="sru">\?<\/span>/.test(h)&&/class="etk"[^>]*>→ Çağlar/.test(h),h.slice(0,200));
t('Bitir düğmesi yazı alanında, Alt+Enter ipucu, Toplantı Odası adı, bilgi paneli',/class="bt tpbit"/.test(h)&&/Alt\+Enter alt satır/.test(h)&&/Toplantı Odası/.test(h)&&/Kim kimi çağırdı/.test(h)&&/Toplantı Odası/.test(document.getElementById('sb').innerHTML));
t('Odanın üstünde ilerleme çubuğu (kalan cevap) ve konuşma gantt çizelgesi',/Kalan toplantı cevabı: <b>\d+<\/b> \/ 300/.test(h)&&/class="tpgb"><span style="width:/.test(h)&&(h.match(/class="tpgr"/g)||[]).length==4,h.slice(0,300));
var e=document.getElementById('tpi');e.value='satır';e.selectionStart=e.selectionEnd=5;var ev=new KeyboardEvent('keydown',{key:'Enter',altKey:true,bubbles:true,cancelable:true});e.dispatchEvent(ev);t('Alt+Enter alt satıra geçer',e.value=='satır\n',JSON.stringify(e.value));
e.value='+Ma';e.selectionStart=e.selectionEnd=3;tpOneri(e);t('+ yazarken ad önerisi çıkar',/\+Marco/.test(document.getElementById('tpon').innerHTML));tpOneriKapat();e.value='';
t('Toplantı dosyası Belgeler\\Orin\\Toplantılar’a yazılır',dk.length>0&&/-genel-durum\.md$/.test(dk.slice(-1)[0].ad)&&/## Kararlar\n1\. Toplantılarda kısa konuşulur/.test(dk.slice(-1)[0].md)&&/\*\*Orin\*\* → Çağlar/.test(dk.slice(-1)[0].md),dk.length&&dk.slice(-1)[0].md.slice(0,300));
// @ hedefleme ve + davet
cg=[];cev.orla='@Çağlar: Takvim için +Remy’yi çağıralım.';return tpGonder(tp.id,'@Orla takvim ne zaman?')}).then(function(){
t('@Ad yalnız o kişiyi konuşturur',cg[0].kim=='orla'&&!cg.some(function(x){return x.kim=='orin'||x.kim=='iris'}),JSON.stringify(cg.map(function(x){return x.kim})));
var o=tp.mes.filter(function(m){return m.r=='o'}).slice(-1)[0];t('Çalışanın +Ad önerisi davet düğmesi olur (yönetim değilse Çağlar onaylar; Orla yönetim → doğrudan çağırır)',tp.kim.indexOf('remy')>=0&&tp.cagri.some(function(x){return x.kim=='orla'&&x.kimi=='remy'}),JSON.stringify(tp.cagri));
cg=[];cev.marco='@Çağlar: Menü bütçesi 2 bin.';return tpGonder(tp.id,'+Marco menü bütçesi ne?')}).then(function(){
t('Çağlar +Ad ile doğrudan çağırır, çağrılan cevaplar',tp.kim.indexOf('marco')>=0&&tp.cagri.some(function(x){return x.kim=='cagla'&&x.kimi=='marco'})&&cg.some(function(x){return x.kim=='marco'}),JSON.stringify(cg.map(function(x){return x.kim})));
var n=cg.length;return tpGonder(tp.id,'karar: Hatırlatıcılar Remy’de')}).then(function(){t('Çağlar “karar:” yazınca karar kaydedilir (yapay zekâ çağrılmaz)',tp.kararlar.some(function(k){return k.kim=='cagla'&&/Remy’de/.test(k.metin)}));
// Kapanış soruları
TPK.sorular=[{soru:'Soru işareti sarı mı olsun?',oneri:'evet'},{soru:'Bitir düğmesi Gönder yanında mı?',oneri:'hayir'},{soru:'Haftalık toplantı olsun mu?',oneri:'belki'}];
tpSoruDlg(tp);var d=document.getElementById('ov').innerHTML;t('Kapanışta netleşmemiş kararlar Evet/Hayır/Belki/Sen öner seçenekleriyle',/Evet/.test(d)&&/Hayır/.test(d)&&/Belki/.test(d)&&/Sen öner/.test(d)&&/name="tpq2"/.test(d));
cev.orin='Kararlar: kısa konuşma. Yapılacaklar: Remy hatırlatıcı.';return tpSoruOk(tp.id,['evet','oner',''])}).then(function(){
t('Seçilen kapanış kararları kaydedilir, boş olan açık kalır',tp.kararlar.some(function(k){return /sarı mı olsun → Evet/.test(k.metin)})&&tp.kararlar.some(function(k){return /Gönder yanında mı → Hayır \(öneriyle\)/.test(k.metin)})&&!tp.kararlar.some(function(k){return /Haftalık/.test(k.metin)}),JSON.stringify(tp.kararlar.map(function(k){return k.metin})));
t('Tutanak yazılır, toplantı biter',tp.durum=='bitti'&&/Remy hatırlatıcı/.test(tp.ozet||''),tp.durum);
// Odaya dönüş
var t2=tpYeni({ev:'orin',kim:['otto'],konu:'Dönüş'});tpGit(t2.id);nav('home','gun',TODAY);openArea(typeof sirketGenel=='function'?'sirket':'team');t('Toplantı sürerken Şirketim’e dönünce oda açılır',pg=='toplanti'&&arg==t2.id,pg+' '+arg);
nav('team','calisan','otto');t('Ekip sayfalarında “Odaya dön” şeridi',/Toplantı sürüyor: <b>Dönüş<\/b>/.test(document.getElementById('ct').innerHTML));
// Normal sohbette kendi üslubuyla +Ad önerisi
T.sohbet.otto=[];tmPush('otto',{r:'o',t:'İsterseniz bu konuda görüşlerini almak için +Marco’yu toplantıya davet edelim.'});var so=tmChat('otto').slice(-1)[0];
t('Sohbette çalışanın kendi cümlesi kalır, “Toplantı aç” düğmesi eklenir',/İsterseniz bu konuda/.test(so.t)&&so.qr&&so.qr.indexOf('Toplantı aç: Marco')>=0,JSON.stringify(so));
nav('team','calisan','otto');t('Sohbette +Marco mavi görünür',/class="etk">\+Marco<\/span>’yu/.test(document.getElementById('ct').innerHTML));
t('Sohbet istemi kendi üslubuyla öneri kuralını içerir',/kendi üslubunla toplantı öner/.test(zekaSistem(tm('otto'))));
// Gizlilik
S.gizlilik=null;var ig=tmTaskNew('iris','Gizli sağlık işi','normal','',false,{});var lg=tmTaskNew('luca','Deneme testi','normal','',false,{});
var bo=zekaBaglam(tm('orin'));t('Iris çok gizli: Orin’in bağlamında içerik yok, yalnız durum',gzDerece('iris')==3&&!/Gizli sağlık işi/.test(bo)&&/Iris: gizli görev \(açık; içeriği yalnız Iris’da, tek el\)/.test(bo)&&/\[#/.test(bo),bo);
t('Iris kendi görevini görür ve gizlilik kuralını alır',/Gizli sağlık işi/.test(zekaBaglam(tm('iris')))&&/Gizlilik derecen: Çok gizli/.test(zekaSistem(tm('iris'))));
gzAyarla('kai',1,'test');t('Hassas: yönetim görür, ekip görmez',gzGorur('orla','kai')&&!gzGorur('sage','kai'));
GZ.cagir=function(o){return Promise.resolve({ok:true,v:{metin:JSON.stringify(JSON.parse(o.istem).map(function(c){return{id:c.id,derece:c.id=='mia'?2:0,neden:c.id=='mia'?'Aile bilgisi':'İş bilgisi'}}).concat([{id:'iris',derece:0,neden:'deneme'}]))}})};
ABN.st.sohbetBugun=0;return gzNikaBelirle().then(function(n){t('Nika gizlilik derecelerini belirler (Çağlar’ın kilitlediğine dokunmaz)',n>=10&&gzDerece('mia')==2&&gzDerece('iris')==3&&gzS().neden.mia=='Aile bilgisi',JSON.stringify(gzS().d));
nav('team','calisan','nika');var hn=document.getElementById('ct').innerHTML;t('Nika sayfasında gizlilik dereceleri kartı',/Gizlilik dereceleri/.test(hn)&&/Nika belirlesin/.test(hn)&&/Çok gizli/.test(hn));
// Orin görev listesini değiştirir
T.sohbet.orin=[];T.sohbet.luca=[];tmPush('orin',{r:'o',t:'Luca’nın testi bitti, kapatıyorum.\nGÖREV KAPAT: #'+lg.id+'\nGÖREV EKLE: {"kim":"Remy","metin":"Cuma raporunu hatırlat","onc":"normal"}\nGÖREV KAPAT: #'+ig.id});
var so2=tmChat('orin').filter(function(m){return m.r=='o'}).slice(-1)[0],sys=tmChat('orin').filter(function(m){return m.r=='sys'}).map(function(m){return m.t}).join(' | ');
t('Orin görev kapatır ve açar (satırlar sohbette gizlenir)',lg.durum=='bitti'&&T.gorev.some(function(g){return g.kim=='remy'&&/Cuma raporu/.test(g.metin)&&g.veren=='orin'})&&!/GÖREV/.test(so2.t)&&/Görev kapatıldı: Luca/.test(sys)&&/Görev açıldı: Remy/.test(sys),sys);
t('Orin gizli görevi kapatamaz',ig.durum!='bitti'&&/Gizli görev kapatılamaz/.test(sys));
t('Remy’nin sohbetinde “Orin görev verdi”',/^Orin görev verdi/.test((tmChat('remy').filter(function(m){return m.r=='sys'}).slice(-1)[0]||{}).t||''));
t('Echo görev satırı yazsa da uygulanmaz (yetki yok)',eylemAyikla('echo','GÖREV KAPAT: #'+ig.id).log.length==0);
t('Toplantıdaki eksikler Ada’nın listesinde',isBul('k716-takvim')&&isBul('k716-kalici')&&isBul('k716-internet'));
return R})}).catch(function(e){t('0.7.16 testi',false,e.stack)}).then(function(){if(bk.tp)S.toplanti=JSON.parse(bk.tp);else delete S.toplanti;if(bk.gz)S.gizlilik=JSON.parse(bk.gz);else delete S.gizlilik;T.sohbet=JSON.parse(bk.ch);T.gorev=bk.gor;T.m=JSON.parse(bk.m);
ABN.st=bk.st;TP.cagir=bk.cg;TP.bildir=bk.bl;GZ.cagir=bk.gc;TPD.kaydet=bk.dk;if(bk.son)S.tpSon=bk.son;else delete S.tpSon;window.zekaHazir=bk.zh;try{cfNo()}catch(e){}save();nav('home','gun',TODAY);return R})};
