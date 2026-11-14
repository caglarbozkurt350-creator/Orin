// Orvane 0.7.18 · Şirketim (Claude Design tuvali "Orvane · Şirketim", Çağlar onayladı)
// - Sol çubukta "Şirketim" (şirket binası): Genel bakış, İnsan Kaynakları, Toplantı Odası, Arka plan işleri
//   Çalışanlarım kenar çubuğunda yalnız Jarvis ve çalışanlar kalır
// - Aylık gelir ve gider: gelir = Çağlar'ın geliri + şirket katkıları (çalışanların birikim/kazanç katkısı, Çağlar onaylar)
//   gider = Çağlar'ın gideri + şirket işletme (Claude aboneliği, API token = TCMB dolar kuruyla TL)
// - Piyasa: TCMB günlük resmî kurlar (otomatik) + Finans Uzmanı Otto'nun günlük takibi (altın, gümüş, borsa; abonelikte internetten)
var SIRKET_PG=['sirket','ik','toplanti','arkaplan','haftalik'];
function skAcik(){return area=='team'&&SIRKET_PG.indexOf(pg)>=0}
var AYK=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],AYU=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
var FN={aralik:6,tablo:false,tcmb:function(z){return API&&API.piyasa?API.piyasa.tcmb(z):Promise.resolve({ok:false,err:'yok'})}};
var SK_IKON={bina:'<path d="M3 21h18"/><path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21"/><path d="M9 7h1.5M13.5 7H15M9 10.5h1.5M13.5 10.5H15M9 14h1.5M13.5 14H15"/><path d="M10.5 21v-3.5h3V21"/>',
ik:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="10" r="2.5"/><path d="M8 17c.6-2 2.2-3 4-3s3.4 1 4 3"/>',
toplanti:'<ellipse cx="12" cy="15.5" rx="7" ry="2.6"/><circle cx="6" cy="8.5" r="1.9"/><circle cx="12" cy="6.5" r="1.9"/><circle cx="18" cy="8.5" r="1.9"/><path d="M12 18.1V21"/>',
arkaplan:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M6 12h3l2-4 2 8 2-4h3"/>',grafik:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'};
var SK_RENK={ik:'linear-gradient(135deg,#ff8a5b,#ffc35b)',toplanti:'linear-gradient(135deg,#3b82f6,#5ec8f2)',arkaplan:'linear-gradient(135deg,#14b8a6,#7ee0c3)',grafik:'linear-gradient(135deg,#4fc38a,#9be3b8)',bina:'#2e2e33'};
function skSvg(k,b){return '<svg width="'+(b||20)+'" height="'+(b||20)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+SK_IKON[k]+'</svg>'}
function skKutu(k,b){b=b||34;return '<span class="skt" style="width:'+b+'px;height:'+b+'px;background:'+SK_RENK[k]+'">'+skSvg(k,Math.round(b*0.58))+'</span>'}

// ---------- Veri ----------
function fnS(){S.finans=S.finans||{};var f=S.finans;f.kayit=f.kayit||[];f.katki=f.katki||[];f.ayar=f.ayar||{};f.piyasa=f.piyasa||{};if(f.ayar.ottoTakip==null)f.ayar.ottoTakip=true;return f}
function fnBugun(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function fnBuAy(){return fnBugun().slice(0,7)}
function fnAy(t){return String(t||'').slice(0,7)}
function fnTL(x){return (Math.round(+x||0)).toLocaleString('tr-TR')+' ₺'}
function fnKur(){var p=fnS().piyasa;return p.tcmb&&p.tcmb.kur&&p.tcmb.kur.usd?p.tcmb.kur.usd.satis:(p.otto&&p.otto.veri&&+p.otto.veri.usd)||null}
function fnAyToplam(ay){var f=fnS(),r={ay:ay,benimGelir:0,sirketGelir:0,benimGider:0,isletme:0,token:0,abonelik:0,usd:0,kurYok:false};
f.kayit.forEach(function(k){if(fnAy(k.tarih)!=ay)return;var t=+k.tutar||0;if(k.tur=='gelir'){if(k.kim=='sirket')r.sirketGelir+=t;else r.benimGelir+=t}else{if(k.kim=='sirket')r.isletme+=t;else r.benimGider+=t}});
f.katki.forEach(function(k){if(k.durum=='onay'&&fnAy(k.tarih)==ay)r.sirketGelir+=+k.tutar||0});
var ab=+f.ayar.abonelikTL||0;if(ab&&(!f.ayar.abonelikBas||ay>=f.ayar.abonelikBas)&&ay<=fnBuAy()){r.abonelik=ab;r.isletme+=ab}
var usd=ZK.st&&ZK.st.aylar&&+ZK.st.aylar[ay]||0,kur=fnKur();r.usd=usd;if(usd){if(kur){r.token=usd*kur;r.isletme+=r.token}else r.kurYok=true}
r.gelir=r.benimGelir+r.sirketGelir;r.gider=r.benimGider+r.isletme;r.net=r.gelir-r.gider;r.sirketNet=r.sirketGelir-r.isletme;return r}
function fnAylar(){var d=new Date(),n=FN.aralik=='yil'?d.getMonth()+1:+FN.aralik||6,r=[];for(var i=n-1;i>=0;i--){var x=new Date(d.getFullYear(),d.getMonth()-i,1);r.push(x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0'))}return r}
function fnAyAd(ay,uzun){var p=ay.split('-');return (uzun?AYU:AYK)[+p[1]-1]+(uzun?' '+p[0]:'')}
// Kayıt formu
var FN_KALEM=['Maaş','Ek gelir','Kira','Market','Fatura','Ulaşım','Sağlık','Eğitim','Giyim','Abonelik','Token','Bakım','Diğer'];
function fnDlg(tur){var o=document.getElementById('ov');tur=tur||'gider';
o.innerHTML='<div class="dl" style="max-width:440px;width:440px"><div style="color:#fff;font-size:16px;font-weight:600;margin-bottom:8px">Gelir / gider ekle</div><div class="pf" style="display:block;margin:0">'+
'<label>Tür</label><div style="display:flex;gap:14px;margin-bottom:6px"><label class="tpc" style="width:auto"><input type="radio" name="fnt" value="gelir"'+(tur=='gelir'?' checked':'')+'> Gelir</label><label class="tpc" style="width:auto"><input type="radio" name="fnt" value="gider"'+(tur=='gider'?' checked':'')+'> Gider</label></div>'+
'<label>Kimin</label><select id="fnk"><option value="cagla">Benim</option><option value="sirket">Şirketin (katkı ya da işletme)</option></select>'+
'<label>Tutar (₺)</label><input type="number" id="fnu" min="0" step="0.01" placeholder="ör. 1250">'+
'<label>Kalem</label><input type="text" id="fnl" list="fnll" placeholder="ör. Market"><datalist id="fnll">'+FN_KALEM.map(function(k){return '<option value="'+k+'">'}).join('')+'</datalist>'+
'<label>Tarih</label><input type="date" id="fnd" value="'+fnBugun()+'"><label>Not</label><input type="text" id="fnn" placeholder="isteğe bağlı"></div>'+
'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="bt" onclick="cfNo()">Vazgeç</button><button class="bt p" onclick="fnKaydetDlg()">Kaydet</button></div></div>';o.style.display='flex';setTimeout(function(){var e=document.getElementById('fnu');if(e)e.focus()},30)}
function fnKaydetDlg(){var t=document.querySelector('input[name=fnt]:checked').value,k=fnKaydet({tur:t,kim:document.getElementById('fnk').value,tutar:document.getElementById('fnu').value,kalem:document.getElementById('fnl').value,tarih:document.getElementById('fnd').value,not:document.getElementById('fnn').value});if(!k)return;cfNo();toast((t=='gelir'?'Gelir':'Gider')+' kaydedildi: '+fnTL(k.tutar));render()}
function fnKaydet(o,id){var tutar=Math.round((+String(o.tutar||'').replace(',','.')||0)*100)/100;if(!(tutar>0)){toast('Tutarı yaz');return null}var tarih=/^\d{4}-\d{2}-\d{2}$/.test(o.tarih||'')?o.tarih:fnBugun();
if(id&&fnS().kayit.some(function(x){return x.id==id}))return null;var k={id:id||'fn'+uid(),tur:o.tur=='gelir'?'gelir':'gider',kim:o.kim=='sirket'?'sirket':'cagla',tutar:tutar,kalem:String(o.kalem||'Diğer').slice(0,40)||'Diğer',tarih:tarih,not:String(o.not||'').slice(0,200),ts:Date.now(),kaynak:o.kaynak||'masaustu'};fnS().kayit.push(k);save();return k}
function fnSil(id){confirmBox('Bu kayıt silinsin mi?',function(){fnS().kayit=fnS().kayit.filter(function(x){return x.id!=id});save();render()},'Sil')}
function fnAyarDlg(){var a=fnS().ayar,o=document.getElementById('ov');o.innerHTML='<div class="dl" style="max-width:420px;width:420px"><div style="color:#fff;font-size:16px;font-weight:600;margin-bottom:8px">İşletme giderleri</div><div class="pf" style="display:block;margin:0">'+
'<label>Claude aboneliği, aylık (₺)</label><input type="number" id="fnab" min="0" step="1" value="'+(a.abonelikTL||'')+'" placeholder="ör. aylık ödediğin tutar">'+
'<div class="hn" style="margin:6px 0">API token harcaması programdan kendiliğinden gelir; TCMB dolar kuruyla TL’ye çevrilir.</div>'+
'<label class="tpc" style="width:auto"><input type="checkbox" id="fnot"'+(a.ottoTakip?' checked':'')+'> Otto her gün piyasayı takip etsin (altın, gümüş, borsa; günlük görev sınırından 1 görev)</label></div>'+
'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="bt" onclick="cfNo()">Vazgeç</button><button class="bt p" onclick="fnAyarKaydet()">Kaydet</button></div></div>';o.style.display='flex'}
function fnAyarKaydet(){var a=fnS().ayar,v=+document.getElementById('fnab').value||0;a.abonelikTL=v>0?v:null;if(v>0&&!a.abonelikBas)a.abonelikBas=fnBuAy();a.ottoTakip=document.getElementById('fnot').checked;save();cfNo();toast('Kaydedildi');render()}
// Katkılar: çalışan "KATKI: {...}" satırıyla önerir, Çağlar onaylar
var FN_KATKI_KURAL='\nŞirkete somut bir birikim (tasarruf) ya da kazanç sağladığında, cevabının sonuna ayrı satırda yaz: KATKI: {"tur":"birikim|kazanc","aciklama":"kısa","tutar":TL sayı} — yalnız gerçek ve hesaplanabilir katkı için; Çağlar onaylarsa şirket gelirine eklenir.';
var _fnZs=zekaSistem;zekaSistem=function(c){return _fnZs(c)+FN_KATKI_KURAL};
function fnKatkiAyikla(id,metin){var L=[],t=String(metin||'').replace(/^[ \t]*KATKI\s*:\s*(\{[^\n]*\})[ \t]*$/gim,function(m,j){try{var o=JSON.parse(j),tu=Math.round((+o.tutar||0)*100)/100;if(tu>0&&tu<1e9)L.push({tur:o.tur=='kazanc'?'kazanc':'birikim',aciklama:String(o.aciklama||'').slice(0,160),tutar:tu})}catch(e){}return ''}).replace(/\n{3,}/g,'\n\n').trim();
return{metin:t,liste:L}}
function fnKatkiEkle(kim,o){var k={id:'kt'+uid(),kim:kim,tur:o.tur,aciklama:o.aciklama,tutar:o.tutar,durum:'oneri',tarih:fnBugun(),ts:Date.now()};fnS().katki.push(k);save();return k}
function fnKatkiKarar(id,ok){var k=fnS().katki.filter(function(x){return x.id==id})[0];if(!k||k.durum!='oneri')return;k.durum=ok?'onay':'red';k.karar=Date.now();if(ok)k.tarih=fnBugun();if(tm(k.kim))tmPush(k.kim,{r:'sys',t:'Çağlar katkını '+(ok?'onayladı, şirket gelirine eklendi':'onaylamadı')+': '+k.aciklama+' · '+fnTL(k.tutar)});save();render()}
tmPushKanca(10,'finans-katki',function(id,m,_fnPush){if(m&&m.r=='o'&&typeof m.t=='string'&&tm(id)){var log=[];
if(/KATKI\s*:/i.test(m.t)){var a=fnKatkiAyikla(id,m.t);m.t=a.metin;a.liste.forEach(function(o){var k=fnKatkiEkle(id,o);log.push('Katkı önerisi: '+k.aciklama+' · '+fnTL(k.tutar)+' — Çağlar’ın onayında (Şirketim)')})}
if(id=='otto'&&/PİYASA\s*:/i.test(m.t)){var p=fnPiyasaAyikla(m.t);m.t=p.metin;if(p.veri){fnS().piyasa.otto={ts:Date.now(),gun:fnBugun(),veri:p.veri};save();log.push('Piyasa verileri güncellendi (Şirketim › Aylık gelir ve gider)')}}
var r=_fnPush(id,m);log.forEach(function(x){_fnPush(id,{r:'sys',t:x})});return r}return _fnPush(id,m)});
var _fnIsle=tpIsle;tpIsle=function(t,k,m){var a=fnKatkiAyikla(k,m),r=_fnIsle(t,k,a.metin);a.liste.forEach(function(o){var kt=fnKatkiEkle(k,o);t.mes.push({r:'sys',t:'Katkı önerisi ('+tpAdi(k)+'): '+kt.aciklama+' · '+fnTL(kt.tutar)+' — onayın Şirketim’de',ts:Date.now()})});if(a.liste.length)save();return r};
// Piyasa: TCMB + Otto'nun günlük takibi
function fnPiyasaAyikla(t){var veri=null,m=String(t).replace(/^[ \t]*PİYASA\s*:\s*(\{[^\n]*\})[ \t]*$/gim,function(a,j){try{var o=JSON.parse(j);if(o&&typeof o=='object')veri=o}catch(e){}return ''}).replace(/\n{3,}/g,'\n\n').trim();return{metin:m,veri:veri}}
function fnTcmb(z){return FN.tcmb(z).then(function(r){if(r&&r.ok&&r.v&&r.v.kur){fnS().piyasa.tcmb=r.v;save();if(skAcik())render()}return r},function(){return null})}
var OTTO_PIYASA='Günlük piyasa takibi (otomatik): Bugünün güncel verilerini internetten araştır, her biri için kaynak ve saat belirt: gram altın (TL, satış), çeyrek altın (TL), ons altın ($), gram gümüş (TL), BIST 100 endeksi, USD/TRY, EUR/TRY. Altın ve gümüşte öncelikli kaynak Kapalıçarşı fiyatları olsun (Çağlar’ın tercihi); bulamazsan başka güvenilir kaynağı kullan ve adını yaz. 2–3 cümlelik kısa yorum yaz (bugünkü yön, Çağlar için dikkat edilecek nokta). En sonda tek satır yaz: PİYASA: {"gram_altin":sayı,"ceyrek_altin":sayı,"ons_altin":sayı,"gram_gumus":sayı,"bist100":sayı,"usd":sayı,"eur":sayı,"kaynak":"kısa kaynak adları","saat":"SS:DD"} — bilmediğin değeri null yaz, uydurma.';
function fnOttoPiyasa(zorla){var f=fnS(),p=f.piyasa;if(!tm('otto'))return null;if(!zorla&&(!f.ayar.ottoTakip||(p.otto&&p.otto.gun==fnBugun())))return null;
if(typeof abnAcik=='function'&&!abnAcik()){if(zorla)toast('Otto’nun internetten takip edebilmesi için Claude aboneliği açık olmalı');return null}
if(TMS().gorev.some(function(g){return g.piyasa&&g.durum!='bitti'&&!g.hata}))return null;if(!zorla&&p.denendi==fnBugun())return null;p.denendi=fnBugun();
var g=tmTaskNew('otto',OTTO_PIYASA,'normal','',false,{});if(g){g.piyasa=1;var ch=tmChat('otto');for(var i=ch.length-1;i>=0;i--){if(ch[i].r=='sys'&&/^Çağlar doğrudan görev verdi/.test(ch[i].t)){ch[i].t='Günlük piyasa takibi başladı (otomatik, internetten).';break}}save()}if(zorla)toast('Otto piyasayı araştırıyor…');return g}
if(!INFO.smoke){setTimeout(function(){fnTcmb()},5000);setInterval(function(){fnTcmb()},6*3600e3);setInterval(function(){if(new Date().getHours()>=9)fnOttoPiyasa()},30*60000);setTimeout(function(){if(new Date().getHours()>=9)fnOttoPiyasa()},90000)}
// Otto finans özetini ve piyasayı görür
var _fnZb=zekaBaglam;zekaBaglam=function(c){var h=_fnZb(c);if(!c||c.id!='otto')return h;var b=fnAyToplam(fnBuAy()),p=fnS().piyasa,o=p.otto&&p.otto.veri,ks=fnS().katki.filter(function(k){return k.durum=='oneri'});
var son=fnAylar().slice(-3).map(function(a){var x=fnAyToplam(a);return fnAyAd(a)+': gelir '+fnTL(x.gelir)+', gider '+fnTL(x.gider)}).join(' | ');
return h+'\nFinans özeti (Şirketim): bu ay gelir '+fnTL(b.gelir)+' (Çağlar '+fnTL(b.benimGelir)+' + şirket katkısı '+fnTL(b.sirketGelir)+'), gider '+fnTL(b.gider)+' (Çağlar '+fnTL(b.benimGider)+' + işletme '+fnTL(b.isletme)+'), net '+fnTL(b.net)+'. Son aylar: '+son+'.'+(ks.length?' Onay bekleyen katkı: '+ks.length+'.':'')+
(p.tcmb?'\nTCMB ('+p.tcmb.tarih+'): USD '+p.tcmb.kur.usd.satis+(p.tcmb.kur.eur?', EUR '+p.tcmb.kur.eur.satis:'')+'.':'')+(o?'\nSon piyasa takibin ('+new Date(p.otto.ts).toLocaleString('tr-TR')+'): '+JSON.stringify(o):'')};

// ---------- Görünüm: gelir-gider kartı ----------
var FN_DOKU={gelir:'repeating-linear-gradient(45deg,#3b8eea 0 3px,#23324a 3px 6px)',gider:'repeating-linear-gradient(45deg,#d0692a 0 3px,#3a2a20 3px 6px)'};
function fnSw(renk,doku){return '<span class="fnsw" style="background:'+(doku||renk)+(doku?';outline:1px solid '+renk:'')+'"></span>'}
function fnGrafik(M,D){var max=Math.max.apply(null,D.map(function(d){return Math.max(d.gelir,d.gider)}).concat([0]));if(!(max>0))return '<div class="fnbos">Henüz kayıt yok. <button class="bt" onclick="fnDlg()">+ Gelir / gider ekle</button></div>';
var H=190,y=function(v){return Math.round(v/max*H)};
return '<div class="fng"><div class="fngy"><span>'+fnTL(max)+'</span><span>'+fnTL(max/2)+'</span><span>0</span></div><div class="fngl" style="top:0"></div><div class="fngl" style="top:50%"></div>'+
D.map(function(d,i){var bu=M[i]==fnBuAy();return '<div class="fnk'+(bu?' bu':'')+'" tabindex="0" aria-label="'+esc(fnAyAd(M[i],1)+': gelir '+fnTL(d.gelir)+', gider '+fnTL(d.gider))+'"><div class="fnc"><span class="fns" style="height:'+y(d.sirketGelir)+'px;background:'+FN_DOKU.gelir+'"></span><span class="fns" style="height:'+y(d.benimGelir)+'px;background:#3b8eea"></span></div><div class="fnc"><span class="fns" style="height:'+y(d.isletme)+'px;background:'+FN_DOKU.gider+'"></span><span class="fns" style="height:'+y(d.benimGider)+'px;background:#d0692a"></span></div>'+
'<div class="fntt"><b>'+fnAyAd(M[i],1)+'</b><span>Gelir '+fnTL(d.gelir)+' · senin '+fnTL(d.benimGelir)+' + şirket '+fnTL(d.sirketGelir)+'</span><span>Gider '+fnTL(d.gider)+' · senin '+fnTL(d.benimGider)+' + işletme '+fnTL(d.isletme)+'</span><span class="hn">Net '+fnTL(d.net)+(d.kurYok?' · token kuru yok':'')+'</span></div></div>'}).join('')+'</div>'+
'<div class="fnx">'+M.map(function(a){return '<span'+(a==fnBuAy()?' class="bu"':'')+'>'+fnAyAd(a)+'</span>'}).join('')+'</div>'}
function fnTablo(M,D){return '<table class="apt"><tr><th>Ay</th><th>Senin gelirin</th><th>Şirket katkısı</th><th>Senin giderin</th><th>İşletme</th><th>Net</th></tr>'+D.map(function(d,i){return '<tr><td>'+fnAyAd(M[i],1)+'</td><td>'+fnTL(d.benimGelir)+'</td><td>'+fnTL(d.sirketGelir)+'</td><td>'+fnTL(d.benimGider)+'</td><td>'+fnTL(d.isletme)+(d.kurYok?' *':'')+'</td><td>'+fnTL(d.net)+'</td></tr>'}).join('')+'</table>'+
(D.some(function(d){return d.kurYok})?'<div class="hn">* Token gideri dolar kuru alınamadığı için eklenmedi.</div>':'')}
function fnPiyasa(){var p=fnS().piyasa,t=p.tcmb,o=p.otto,v=o&&o.veri||{},n=function(x,ek){return x==null||x===''||isNaN(+x)?'—':(+x).toLocaleString('tr-TR',{maximumFractionDigits:2})+(ek||'')};
return '<div class="fnp"><div class="fnpk"><div class="fnph">Resmî kurlar <span class="hn">'+(t?esc((t.kaynak||'TCMB')+' · '+t.tarih):'alınamadı')+'</span></div>'+(t?['usd','eur','gbp'].filter(function(k){return t.kur[k]}).map(function(k){return '<div class="kr"><span>'+k.toUpperCase()+'/TRY</span><span>'+n(t.kur[k].satis,' ₺')+'</span></div>'}).join(''):'<div class="hn">İnternet bağlantısı gelince alınır.</div>')+'</div>'+
'<div class="fnpk"><div class="fnph">Otto’nun piyasa takibi <span class="hn">'+(o?new Date(o.ts).toLocaleString('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+(v.kaynak?' · '+esc(String(v.kaynak).slice(0,40)):''):'henüz yok')+'</span><button class="bt" style="margin-left:auto;min-height:26px;padding:2px 10px" onclick="fnOttoPiyasa(true);render()">Otto güncellesin</button></div>'+
[['Gram altın',v.gram_altin,' ₺'],['Çeyrek altın',v.ceyrek_altin,' ₺'],['Ons altın',v.ons_altin,' $'],['Gram gümüş',v.gram_gumus,' ₺'],['BIST 100',v.bist100,'']].map(function(x){return '<div class="kr"><span>'+x[0]+'</span><span>'+n(x[1],x[2])+'</span></div>'}).join('')+'</div></div>'}
function fnKart(){var M=fnAylar(),D=M.map(fnAyToplam),b=fnAyToplam(fnBuAy()),f=fnS(),K=f.katki.filter(function(k){return fnAy(k.tarih)==fnBuAy()||k.durum=='oneri'}).slice(-6).reverse(),son=f.kayit.slice().sort(function(a,c){return (c.tarih+c.ts)>(a.tarih+a.ts)?1:-1}).slice(0,6);
var seg=[[6,'6 ay'],[12,'12 ay'],['yil','Bu yıl']].map(function(x){return '<button class="'+(String(FN.aralik)==String(x[0])?'on':'')+'" onclick="FN.aralik='+(x[0]=='yil'?'\'yil\'':x[0])+';render()">'+x[1]+'</button>'}).join('');
return '<section class="card fnkart" aria-label="Aylık gelir ve gider"><div class="fnh">'+skKutu('grafik',36)+'<div style="flex:1;min-width:0"><div style="font-size:16px;font-weight:600;color:#fff">Aylık gelir ve gider</div><div class="hn">Senin gelir-giderin + şirketin katkıları ve işletme giderleri · Finans Uzmanı Otto izler</div></div>'+
'<button class="bt" onclick="fnDlg()">+ Gelir / gider ekle</button><button class="bt" title="İşletme giderleri ve piyasa takibi" onclick="fnAyarDlg()"><i class="ti ti-settings"></i></button><div class="fnseg">'+seg+'</div></div>'+
'<div class="fnoz"><div><div class="hn">Bu ay gelir</div><b>'+fnTL(b.gelir)+'</b><div class="fnoz2">'+fnSw('#3b8eea')+'Senin gelirin '+fnTL(b.benimGelir)+'</div><div class="fnoz2">'+fnSw('#3b8eea',FN_DOKU.gelir)+'Şirket katkısı '+fnTL(b.sirketGelir)+'</div></div>'+
'<div><div class="hn">Bu ay gider</div><b>'+fnTL(b.gider)+'</b><div class="fnoz2">'+fnSw('#d0692a')+'Senin giderin '+fnTL(b.benimGider)+'</div><div class="fnoz2">'+fnSw('#d0692a',FN_DOKU.gider)+'Şirket işletme '+fnTL(b.isletme)+(b.kurYok?' (token kuru yok)':'')+'</div></div>'+
'<div><div class="hn">Bu ay net</div><b>'+fnTL(b.net)+'</b><div class="fnoz2">gelir − gider</div><div class="fnoz2">şirketin kendi neti: '+fnTL(b.sirketNet)+'</div></div></div>'+
'<div class="fnlj"><span>'+fnSw('#3b8eea')+'Senin gelirin</span><span>'+fnSw('#3b8eea',FN_DOKU.gelir)+'Şirket katkısı</span><span>'+fnSw('#d0692a')+'Senin giderin</span><span>'+fnSw('#d0692a',FN_DOKU.gider)+'Şirket işletme</span><span style="flex:1"></span><a href="#" onclick="FN.tablo=!FN.tablo;render();return false">'+(FN.tablo?'Grafik görünümü':'Tablo görünümü')+'</a></div>'+
(FN.tablo?fnTablo(M,D):fnGrafik(M,D))+
'<div class="fnalt"><div class="fnpk"><div class="fnph">Şirket katkıları</div>'+(K.length?K.map(function(k){return '<div class="kr"><span>'+esc((tm(k.kim)||{}).ad||k.kim)+' · '+(k.tur=='kazanc'?'kazanç':'birikim')+': '+esc(k.aciklama)+'</span><span>'+fnTL(k.tutar)+' '+(k.durum=='onay'?'<span style="color:#8ee6a9">onaylı</span>':k.durum=='red'?'<span style="color:#f4a3a3">red</span>':'<button class="bt p fnkb" data-id="'+esc(k.id)+'" onclick="fnKatkiKarar(this.dataset.id,1)">Onayla</button><button class="bt fnkb" data-id="'+esc(k.id)+'" onclick="fnKatkiKarar(this.dataset.id,0)">Reddet</button>')+'</span></div>'}).join(''):'<div class="hn">Bu ay katkı yok. Çalışan katkıyı önerir, sen onaylayınca gelire eklenir.</div>')+'</div>'+
'<div class="fnpk"><div class="fnph">Bu ayın işletme giderleri</div><div class="kr"><span>Claude aboneliği (aylık)</span><span>'+(b.abonelik?fnTL(b.abonelik):'<a href="#" onclick="fnAyarDlg();return false">tutarı gir</a>')+'</span></div><div class="kr"><span>API token harcaması'+(b.usd?' ($'+b.usd.toFixed(2).replace('.',',')+')':'')+'</span><span>'+(b.kurYok?'kur yok':fnTL(b.token))+'</span></div><div class="hn">Token gideri programdan kendiliğinden gelir.</div></div></div>'+
fnPiyasa()+(son.length?'<details class="tpbil"><summary>Son kayıtlar · '+f.kayit.length+'</summary>'+son.map(function(k){return '<div class="kr"><span>'+esc(k.tarih)+' · '+(k.tur=='gelir'?'Gelir':'Gider')+' · '+(k.kim=='sirket'?'Şirket':'Benim')+' · '+esc(k.kalem)+(k.not?' <span class="hn">'+esc(k.not)+'</span>':'')+'</span><span>'+fnTL(k.tutar)+' <i class="ti ti-x fnsil" title="Sil" data-id="'+esc(k.id)+'" onclick="fnSil(this.dataset.id)"></i></span></div>'}).join('')+'</details>':'')+'</section>'}

// ---------- Şirketim: genel bakış, kenar çubuğu, sol çubuk ----------
function skBekleyen(){var g=TMS().gel.filter(function(x){return x.asama=='ceo'}).length,is=(typeof isS=='function'?isS():[]).filter(function(x){return x.durum=='onay'}).length,k=fnS().katki.filter(function(x){return x.durum=='oneri'}).length;return{ceo:g,is:is,katki:k,top:g+is+k}}
function sirketGenel(){var t=typeof tpAktif=='function'&&tpAktif(),P=(typeof tpS=='function'?tpS():[]).filter(function(x){return x.durum=='planli'}).length,L=(typeof AP!='undefined'&&AP.liste)||[],cal=L.filter(function(j){return j.durum=='calisiyor'}),bg=L.filter(function(j){return new Date(j.basla).toDateString()==new Date().toDateString()}).length,E=(typeof isS=='function'?isS():[]).filter(function(x){return x.emri&&['onaylandi','calisiyor','inceleme'].indexOf(x.durum)>=0}).length,b=skBekleyen();
if(typeof AP!='undefined'&&AP.liste===null&&typeof apYukle=='function'){AP.liste=[];setTimeout(function(){apYukle().then(function(){if(area=='team'&&pg=='sirket')render()})},0)}
var kart=function(k,ad,ozet,ek,git,canli){return '<a href="#" class="skk'+(canli?' canli':'')+'" onclick="'+git+';return false"><span class="skkh">'+skKutu(k,40)+'<span style="font-size:16px;font-weight:600">'+ad+'</span>'+(canli?'<span class="skcanli"><span class="dt ok"></span>Sürüyor</span>':'')+'</span><span class="skko">'+ozet+'</span>'+ek+'</a>'};
return '<div class="hrh">'+skKutu('bina',52)+'<div style="flex:1;min-width:0"><div class="en">Şirketim</div><div class="es">Orvane’nin insan kaynakları, toplantıları, arka plan işleri ve finansı tek yerde</div></div></div>'+
'<div class="skg">'+kart('ik','İnsan Kaynakları',tmAll().length+' çalışan · '+b.ceo+' gelişim onayı bekliyor · gizlilik dereceleri Nika’da','<span class="skch"><span>Kartlar</span><span>Hiyerarşi</span></span>',"nav('team','ik','')")+
kart('toplanti','Toplantı Odası',t?esc(t.konu)+' · '+t.kim.length+' katılımcı · '+(t.kararlar||[]).length+' karar':(P?P+' planlı toplantı':'Şu an toplantı yok'),t&&ABN.st?'<span class="tpgb" style="margin:0"><span style="width:'+Math.min(100,Math.round((ABN.st.toplantiBugun||0)*100/(ABN.st.gunlukToplanti||300)))+'%;background:#3fb950"></span></span>':'',t?"tpGit('"+jq(t.id)+"')":"nav('team','toplanti','')",!!t)+
kart('arkaplan','Arka plan işleri',cal.length+' iş çalışıyor · bugün '+bg+' iş · '+E+' iş emri Claude Code’da',cal.length?'<span class="skch" style="color:#8ee6a9"><span class="dt ok"></span> '+esc(((tm(cal[0].kim)||{}).ad||cal[0].kim)+' · '+cal[0].etiket)+'</span>':'',"nav('team','arkaplan','')")+'</div>'+
fnKart()+
'<div class="card" style="margin-top:14px"><div class="ch">Senden bekleyenler</div>'+(b.top?
(b.katki?'<div class="kr" style="cursor:pointer" onclick="document.querySelector(\'.fnkart\').scrollIntoView({behavior:\'smooth\'})"><span>'+b.katki+' katkı önerisi</span><span style="color:#ffb454">Katkı onayı</span></div>':'')+
TMS().gel.filter(function(x){return x.asama=='ceo'}).map(skCeoSatir).join('')+
(b.is?'<div class="kr" style="cursor:pointer" onclick="nav(\'team\',\'calisan\',\'orin\')"><span>'+b.is+' iş isteği (Claude’a)</span><span style="color:#ffb454">İş isteği onayı</span></div>':''):'<div class="hn">Bekleyen onay yok.</div>')+'</div>'}
// CEO onayı bekleyen gelişim talebi: ne olduğu, Nika'nın gerekçesi ve doğrudan Onayla / Reddet (Claude Design sürüm 8)
function skCeoSatir(g){var c=tm(g.kim)||{ad:g.kim};return '<div class="skceo"><div class="skceo1"><span>'+esc(c.ad)+' · '+esc((GT[g.tur]||g.tur).toLocaleLowerCase('tr'))+(g.ad?': <b>'+esc(g.ad)+'</b>':'')+'</span><span style="color:#ffb454">Senin onayın</span></div>'+
(g.metin?'<div class="hn">'+esc(String(g.metin).slice(0,220))+(String(g.metin).length>220?'…':'')+'</div>':'')+(g.ik&&g.ik.neden?'<div class="skceon">Nika onayladı: '+esc(g.ik.neden)+'</div>':'')+(g.orin&&g.orin.ok&&g.orin.neden?'<div class="skceon">Orin onayladı: '+esc(g.orin.neden)+'</div>':'')+(g.oneri&&!g.orin?'<div class="hn" style="color:#9ec5ff">Orin’in önerisi: '+(g.oneri.ok?'onayla':'reddet')+' — '+esc(g.oneri.neden||'')+'</div>':'')+
'<div class="skceob"><button class="bt p" data-id="'+esc(g.id)+'" onclick="tmGelCeo(this.dataset.id,1)"><i class="ti ti-check"></i> Onayla ve uygula</button><button class="bt" data-id="'+esc(g.id)+'" onclick="tmGelCeo(this.dataset.id,0)">Reddet</button><a href="#" onclick="nav(\'team\',\'calisan\',\'orin\');return false">Ayrıntı</a></div></div>'}
function skCikar(h,key){var i=h.indexOf("onclick=\"nav('team','"+key+"'");if(i<0)return h;var s=h.lastIndexOf('<div class="si',i);if(s<0)return h;var rx=/<div\b|<\/div>/g,d=0,m;rx.lastIndex=s;while((m=rx.exec(h))){d+=m[0]=='</div>'?-1:1;if(!d)return h.slice(0,s)+h.slice(rx.lastIndex)}return h}
function sirketSb(){var t=typeof tpAktif=='function'&&tpAktif(),P=(typeof tpS=='function'?tpS():[]).filter(function(x){return x.durum=='planli'}).length,cal=typeof apCalisan=='function'?apCalisan():0,b=skBekleyen();
var it=function(p,k,ad,alt,ek,altRenk){return '<div class="si ski'+(pg==p?' on':'')+'" data-nav="1" onclick="nav(\'team\',\''+p+'\',\'\')">'+skKutu(k,32)+'<div style="flex:1;min-width:0"><div>'+ad+'</div><div class="rl"'+(altRenk?' style="color:'+altRenk+'"':'')+'>'+alt+'</div></div>'+(ek||'')+'</div>'};
return '<div class="skbas">ŞİRKETİM</div>'+it('sirket','bina','Genel bakış','Finans · bekleyenler',b.top?'<span class="cnt sko">'+b.top+'</span>':'')+
it('ik','ik','İnsan Kaynakları',(function(){var G=TMS().gel.filter(function(x){return x.asama=='ceo'});if(!G.length)return 'Kartlar · hiyerarşi · Nika';var g=G[0],c=tm(g.kim)||{ad:g.kim};return G.length+' onayın bekliyor: '+esc(c.ad)+(g.ad?' · '+esc(g.ad):'')})(),b.ceo?'<span class="cnt sko" title="CEO onayın bekleyen">'+b.ceo+'</span>':'<span class="cnt">'+tmAll().length+'</span>',b.ceo?'#ffb454':'')+
it('toplanti','toplanti','Toplantı Odası',t?esc(t.konu)+' sürüyor':P?P+' planlı':'Çalışanlarla ortak oda',t?'<span class="dt ok" title="Toplantı sürüyor"></span>':'',t?'#8ee6a9':'')+
it('arkaplan','arkaplan','Arka plan işleri','Claude Code işleri',cal?'<span class="cnt">'+cal+'</span>':'')+
it('haftalik','grafik','Haftalık rapor','Tüm çalışanların haftası')+
(t?'<div class="tpser skser" data-id="'+esc(t.id)+'" onclick="tpGit(this.dataset.id)"><span class="dt ok"></span><span style="flex:1;min-width:0">Toplantı sürüyor: <b>'+esc(t.konu)+'</b><br><span style="text-decoration:underline">Odaya dön</span></span></div>':'')}
var _skSb=teamSb;teamSb=function(){if(skAcik())return sirketSb();var h=_skSb();['ik','toplanti','arkaplan'].forEach(function(k){h=skCikar(h,k)});return h};
var _skTp=teamPage;teamPage=function(){if(pg=='sirket')return sirketGenel();return _skTp()};
var _skTt=teamTitle;teamTitle=function(){if(pg=='sirket')return 'Şirketim';var t=_skTt();return skAcik()?t.replace(/^Çalışanlarım ›/,'Şirketim ›'):t};
var _skOa=openArea;openArea=function(a){if(a=='sirket'){var t=typeof tpAktif=='function'&&tpAktif();if(t&&S.tpSon==t.id)return nav('team','toplanti',t.id);return nav('team',SIRKET_PG.indexOf(S.sirketPg)>=0?S.sirketPg:'sirket','')}if(a=='team')return nav('team','calisan',TM_SEL());return _skOa(a)};
var _skR=render;render=function(){_skR();var on=skAcik(),rt=document.getElementById('r_team'),rs=document.getElementById('r_sirket');if(on){S.sirketPg=pg;if(rt)rt.className='rb'}if(rs){rs.className='rb'+(on?' on':'');var n=document.getElementById('r_sirket_n'),t=typeof tpAktif=='function'&&tpAktif(),b=skBekleyen();if(n){n.className='rbn'+(t?' canli':b.top?' sayi':'');n.textContent=t?'':b.top?String(b.top):''}}};
// Telefondan gelir/gider kaydı
var _fnBu=bulutUygula;bulutUygula=function(e){if(e.tur=='finans_kayit'){var v=e.veri||{};fnKaydet({tur:v.tur,kim:v.kim,tutar:v.tutar,kalem:v.kalem,tarih:v.tarih,not:v.not,kaynak:'telefon'},e.id);return}return _fnBu(e)};

// ---------- Testler (yalnız smoke) ----------
window.__v0718Test=function(){var R=[],T=TMS(),bk={fn:S.finans?JSON.stringify(S.finans):null,zk:ZK.st,ch:JSON.stringify(T.sohbet),gor:T.gorev.slice(),st:ABN.st,cg:ABN.cagir,tc:FN.tcmb,sp:S.sirketPg};function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
delete S.finans;var ay=fnBuAy();ZK.st=Object.assign({},ZK.st||{},{aylar:{}});ZK.st.aylar[ay]=2;
FN.tcmb=function(){return Promise.resolve({ok:true,v:{tarih:'12.11.2026',kur:{usd:{alis:41,satis:41.5},eur:{alis:47,satis:47.5}},kaynak:'TCMB'}})};
return fnTcmb().then(function(){
delete S.sirketPg;delete S.tpSon;openArea('sirket');t('Sol çubukta Şirketim: genel bakışa gider, düğme seçili, Çalışanlarım seçili değil',pg=='sirket'&&document.getElementById('r_sirket').className=='rb on'&&document.getElementById('r_team').className=='rb',pg+' '+document.getElementById('r_sirket').className);
var sb=document.getElementById('sb').innerHTML;t('Şirketim kenar çubuğu: Genel bakış, İK, Toplantı Odası, Arka plan işleri',/ŞİRKETİM/.test(sb)&&/Genel bakış/.test(sb)&&/İnsan Kaynakları/.test(sb)&&/Toplantı Odası/.test(sb)&&/Arka plan işleri/.test(sb));
t('Şirketim başlığı',document.getElementById('tl').textContent=='Şirketim');
nav('team','ik');t('İK Şirketim altında (başlık ve seçili düğme)',/^Şirketim › /.test(document.getElementById('tl').textContent)&&document.getElementById('r_sirket').className=='rb on',document.getElementById('tl').textContent);
openArea('team');var sb2=document.getElementById('sb').innerHTML;t('Çalışanlarım’da yalnız Jarvis ve çalışanlar (İK, toplantı, arka plan yok)',pg=='calisan'&&/Jarvis/.test(sb2)&&sb2.indexOf("nav('team','ik'")<0&&sb2.indexOf("nav('team','toplanti'")<0&&sb2.indexOf("nav('team','arkaplan'")<0&&/Yönetim/.test(sb2)&&document.getElementById('r_team').className=='rb on',sb2.slice(0,300));
nav('team','arkaplan');openArea('team');openArea('sirket');t('Şirketim son açılan sayfayı hatırlar',pg=='arkaplan',pg);
// Finans
fnKaydet({tur:'gelir',kim:'cagla',tutar:'30000',kalem:'Maaş',tarih:ay+'-05'});fnKaydet({tur:'gider',kim:'cagla',tutar:'12000,50',kalem:'Kira',tarih:ay+'-03'});fnKaydet({tur:'gider',kim:'sirket',tutar:500,kalem:'Bakım',tarih:ay+'-04'});
t('Geçersiz tutar kaydedilmez',fnKaydet({tur:'gider',tutar:'abc'})===null);
fnS().ayar.abonelikTL=800;fnS().ayar.abonelikBas=ay;
T.sohbet.otto=[];tmPush('otto',{r:'o',t:'Sigortayı değiştirince yılda tasarruf var.\nKATKI: {"tur":"birikim","aciklama":"Sigorta değişikliği","tutar":1500}'});var k=fnS().katki[0],so=tmChat('otto').filter(function(m){return m.r=='o'}).slice(-1)[0];
t('Çalışan KATKI satırıyla katkı önerir (sohbette gizlenir, onaya düşer)',k&&k.kim=='otto'&&k.tutar==1500&&k.durum=='oneri'&&!/KATKI/.test(so.t)&&/Katkı önerisi/.test(tmChat('otto').slice(-1)[0].t),JSON.stringify(k));
var b0=fnAyToplam(ay);t('Onaylanmamış katkı gelire girmez',b0.sirketGelir==0);
fnKatkiKarar(k.id,1);var b=fnAyToplam(ay);
t('Aylık toplam: gelir = senin + şirket katkısı, gider = senin + işletme (abonelik + token × TCMB kuru)',b.benimGelir==30000&&b.sirketGelir==1500&&b.benimGider==12000.5&&b.abonelik==800&&Math.abs(b.token-83)<0.01&&Math.abs(b.isletme-(500+800+83))<0.01&&Math.abs(b.net-(31500-12000.5-1383))<0.01,JSON.stringify(b));
t('Şirketin kendi neti = katkı − işletme',Math.abs(b.sirketNet-(1500-1383))<0.01);
nav('team','sirket');var h=document.getElementById('ct').innerHTML;
t('Genel bakış: üç kart, gelir-gider kartı, piyasa, bekleyenler',/class="skk/.test(h)&&/Aylık gelir ve gider/.test(h)&&/Resmî kurlar/.test(h)&&/Otto’nun piyasa takibi/.test(h)&&/Senden bekleyenler/.test(h));
t('Grafik: her ay iki katmanlı gelir ve gider çubuğu, bu ay vurgulu',(h.match(/class="fnk/g)||[]).length==6&&/class="fnk bu"/.test(h)&&/class="fntt"/.test(h)&&/30\.000 ₺/.test(h),'');
t('TCMB kuru görünür',/41,5 ₺/.test(h));
FN.tablo=true;render();t('Tablo görünümü',/<th>Şirket katkısı<\/th>/.test(document.getElementById('ct').innerHTML));FN.tablo=false;FN.aralik=12;render();t('12 ay görünümü',(document.getElementById('ct').innerHTML.match(/class="fnk/g)||[]).length==12);FN.aralik=6;
t('Otto’nun bağlamında finans özeti ve kur',/Finans özeti \(Şirketim\): bu ay gelir 31\.500 ₺/.test(zekaBaglam(tm('otto')))&&/TCMB \(12\.11\.2026\): USD 41\.5/.test(zekaBaglam(tm('otto'))),zekaBaglam(tm('otto')).slice(-300));
t('Çalışan sistem isteminde katkı kuralı',/KATKI:/.test(zekaSistem(tm('sage'))));
// Otto günlük piyasa takibi (abonelikte, internetten)
ABN.st={kurulu:true,acik:true,gunluk:5,bugun:0,toplam:0,gunlukSohbet:60,sohbetBugun:0,test:{ok:true}};var cg=[];ABN.cagir=function(o){cg.push(o);return Promise.resolve({ok:true,v:{metin:'Altın yükselişte.\nPİYASA: {"gram_altin":4100.5,"ceyrek_altin":6700,"ons_altin":2650,"gram_gumus":48.2,"bist100":10500,"usd":41.5,"eur":47.6,"kaynak":"Kapalıçarşı, Borsa İstanbul","saat":"10:15"}\nÖĞRENİLENLER: []',tur:3,token:9000,model:'claude-sonnet-5-5'}})};
fnS().ayar.ottoTakip=true;var g=fnOttoPiyasa();return new Promise(function(r){setTimeout(r,300)}).then(function(){var p=fnS().piyasa.otto;
t('Otto günlük piyasa görevini abonelikte (internet araçlarıyla) yapar',g&&g.piyasa&&cg.length==1&&cg[0].kim=='otto'&&/Günlük piyasa takibi/.test(cg[0].istem)&&!cg[0].araclar,JSON.stringify(cg.map(function(x){return x.kim})));
t('Otto’nun piyasa verisi kaydedilir (satır sohbette gizlenir)',p&&p.veri.gram_altin==4100.5&&p.gun==fnBugun()&&!tmChat('otto').some(function(m){return m.r=='o'&&/"gram_altin":4100/.test(m.t)}),JSON.stringify(p));
t('Aynı gün ikinci kez otomatik başlamaz',fnOttoPiyasa()===null);
nav('team','sirket');t('Piyasa kartında altın ve borsa',/4\.100,5 ₺/.test(document.getElementById('ct').innerHTML)&&/10\.500/.test(document.getElementById('ct').innerHTML));
// Telefondan kayıt
bulutUygula({id:'tel-fn-1',tur:'finans_kayit',ts:Date.now(),veri:{tur:'gider',kim:'cagla',tutar:250,kalem:'Market',tarih:ay+'-10'}});bulutUygula({id:'tel-fn-1',tur:'finans_kayit',ts:Date.now(),veri:{tur:'gider',kim:'cagla',tutar:250,kalem:'Market',tarih:ay+'-10'}});
t('Telefondan gelir/gider kaydı bir kez eklenir',fnS().kayit.filter(function(x){return x.kaynak=='telefon'}).length==1);
var n=document.getElementById('r_sirket_n');t('Şirketim düğmesinde bekleyen/canlı işareti alanı',!!n);return R})}).catch(function(e){t('0.7.18 testi',false,e.stack)}).then(function(){if(bk.fn)S.finans=JSON.parse(bk.fn);else delete S.finans;ZK.st=bk.zk;T.sohbet=JSON.parse(bk.ch);T.gorev=bk.gor;ABN.st=bk.st;ABN.cagir=bk.cg;FN.tcmb=bk.tc;if(bk.sp)S.sirketPg=bk.sp;else delete S.sirketPg;FN.tablo=false;FN.aralik=6;try{cfNo()}catch(e){}save();nav('home','gun',TODAY);return R})};

// ---------- Apify (Sage'in sosyal medya araştırması) ----------
// Anahtar Ayarlar › Yapay zekâ'da girilir, ana süreçte Windows şifrelemesiyle saklanır; arayüz anahtarı hiç görmez
var APF={st:null,dene:false,api:function(){return API&&API.apify}};
function apfYukle(){if(!APF.api())return Promise.resolve(null);return API.apify.durum().then(function(r){APF.st=r.ok?r.v:null;return APF.st},function(){return null})}
function apfKart(){if(!APF.api())return '';var s=APF.st;if(!s){if(!APF.yk){APF.yk=1;apfYukle().then(function(){APF.yk=0;if(area=='set'&&pg=='zeka')render()})}return '<div class="card"><div class="ch"><i class="ti ti-world-search"></i>Apify · sosyal medya araştırması</div><div class="hn">Yükleniyor…</div></div>'}
var t=s.test,L=s.calisanlar||[];
return '<div class="card apf"><div class="ch"><i class="ti ti-world-search"></i>Apify · sosyal medya araştırması</div>'+
'<div class="hn" style="margin-bottom:8px">Seçili çalışanlar görevlerinde Instagram, YouTube, TikTok gibi platformlardan herkese açık veriyi Apify ile çeker. Anahtar bu bilgisayarda şifreli saklanır. Apify kullanımı ücretli ya da kredilidir; Apify’da aylık harcama sınırı koy.</div>'+
(s.var?'<div class="kr"><span>Anahtar<div class="hn">Kayıtlı '+esc(s.ipucu)+'</div></span><button class="bt" onclick="apfSil()">Anahtarı sil</button></div>':
'<div class="kr" style="gap:8px"><input id="apfk" type="password" class="in" autocomplete="off" placeholder="apify_api_… (Apify › Settings › API & Integrations)" style="flex:1"><button class="bt p" onclick="apfKaydet()">Kaydet</button></div>')+
'<div class="kr"><span>Kullanan çalışanlar</span><span class="apfc">'+tmAll().filter(function(c){return ['sage','otto','luca','cleo','ada'].indexOf(c.id)>=0}).map(function(c){var on=L.indexOf(c.id)>=0;return '<label class="tpc" style="width:auto"><input type="checkbox" data-id="'+esc(c.id)+'"'+(on?' checked':'')+' onchange="apfCal(this.dataset.id,this.checked)"> '+esc(c.ad)+'</label>'}).join('')+'</span></div>'+
'<div class="kr"><span>Bağlantı<div class="hn">'+(APF.dene?'Deneniyor…':t?(t.ok?'<span style="color:#8ee6a9">Bağlı</span> · '+esc(new Date(t.ts).toLocaleString('tr-TR'))+(t.metin?' · '+esc(t.metin.slice(0,120)):''):'<span style="color:#f4a3a3">Bağlanamadı</span> · '+esc(t.hata||'')):'Henüz denenmedi')+'</div></span><button class="bt" onclick="apfTest()"'+(s.var&&!APF.dene?'':' disabled')+'>Bağlantıyı dene</button></div></div>'}
function apfKaydet(){var e=document.getElementById('apfk'),v=e?e.value:'';if(e)e.value='';API.apify.kaydet(v).then(function(r){if(r.ok){APF.st=r.v;toast('Apify anahtarı kaydedildi; şimdi “Bağlantıyı dene”');render()}else toast(r.err)})}
function apfSil(){confirmBox('Apify anahtarı silinsin mi? Çalışanlar Apify’ı kullanamaz.',function(){API.apify.sil().then(function(r){if(r.ok)APF.st=r.v;render()})},'Sil')}
function apfCal(id,on){var L=((APF.st&&APF.st.calisanlar)||[]).filter(function(x){return x!=id});if(on)L.push(id);API.apify.calisanlar(L).then(function(r){if(r.ok)APF.st=r.v;render()})}
function apfTest(){APF.dene=true;render();toast('Apify bağlantısı deneniyor (en fazla ~2 dk)…');API.apify.test().then(function(r){APF.dene=false;if(r.ok){APF.st=r.v;var t=r.v.test||{};toast(t.ok?'Apify bağlı':'Apify bağlanamadı: '+(t.hata||''));if(t.ok)apfBaglandi()}else toast(r.err);render()})}
function apfBaglandi(){var L=(APF.st&&APF.st.calisanlar)||[];L.forEach(function(k){if(tm(k))tmPush(k,{r:'sys',t:'Apify bağlantısı kuruldu: görevlerinde sosyal medyadan (Instagram, YouTube, TikTok) herkese açık veri çekebilirsin.'})});var it=typeof isBul=='function'&&isBul('k717-apify');if(it&&it.durum=='liste'){it.durum='yapildi';it.bitis=Date.now()}save()}
var _apfPz=P.zeka;P.zeka=function(){return _apfPz()+apfKart()};
var APIFY_KURAL='\nGörevlerinde Apify araçların var (mcp__apify__…): Instagram, YouTube, TikTok gibi platformlardan veri gerektiğinde önce uygun Apify aktörünü ara, sonra çalıştır. Maliyeti düşük tut: en fazla 2 aktör çalıştırma, sonuç sayısını 20 ile sınırla. Yalnız herkese açık içerik; kişisel veri toplama. Kaynağı ve tarihi belirt. Sohbette bu araçlar yok; gerekiyorsa görev olarak verilmesini iste.';
var _apfZs=zekaSistem;zekaSistem=function(c){var h=_apfZs(c),s=APF.st;return s&&s.var&&(s.calisanlar||[]).indexOf(c.id)>=0?h+APIFY_KURAL:h};
apfYukle();
window.__apfTest=function(){var R=[],bk=APF.st;function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
APF.st={var:false,ipucu:'',calisanlar:['sage'],test:null};nav('set','zeka');var h=document.getElementById('ct').innerHTML;
t('Ayarlar › Yapay zekâ’da Apify kartı (şifre alanı, kullanan çalışanlar, bağlantı denemesi)',/Apify · sosyal medya araştırması/.test(h)&&/id="apfk" type="password"/.test(h)&&/Kullanan çalışanlar/.test(h)&&/Bağlantıyı dene/.test(h));
t('Anahtar yokken Sage’e Apify kuralı eklenmez',!/mcp__apify/.test(zekaSistem(tm('sage'))));
APF.st={var:true,ipucu:'…abcd',calisanlar:['sage'],test:{ok:true,ts:Date.now(),metin:'Instagram Scraper'}};render();h=document.getElementById('ct').innerHTML;
t('Anahtar kayıtlıyken yalnız son 4 hane görünür, bağlantı durumu',/Kayıtlı …abcd/.test(h)&&!/id="apfk"/.test(h)&&/Bağlı/.test(h));
t('Apify yalnız seçili çalışanın kuralında',/mcp__apify/.test(zekaSistem(tm('sage')))&&!/mcp__apify/.test(zekaSistem(tm('echo'))));
APF.st=bk;nav('home','gun',TODAY);return R};

// ---------- Gizli klasörler (Çağlar'ın kararı, 0.7.19) ----------
// Belgelerim\Finans → yalnız Finans Uzmanı (Otto) · Belgelerim\Sağlık → yalnız Sağlıklı Yaşam Koçu (Iris)
// Okuma yalnız ana süreçte, sahibin görevinde ve internetsiz; sonuç gizli işaretlenir: telefona, toplantıya, Nika onay zincirine gitmez
var GZK={st:null,min:{otto:2,iris:3},yukle:function(){return API&&API.gizli?API.gizli.klasorler():Promise.resolve({ok:false})}};
function gzkYukle(){return GZK.yukle().then(function(r){if(r&&r.ok)GZK.st=r.v;return GZK.st},function(){return null})}
gzkYukle();
var _gzkD=gzDerece;gzDerece=function(id){return Math.max(_gzkD(id),GZK.min[id]||0)};
var _gzkZs=zekaSistem;zekaSistem=function(c){var h=_gzkZs(c),K=GZK.st||{finans:{kim:'otto'},saglik:{kim:'iris'}},k=Object.keys(K).filter(function(x){return K[x].kim==c.id})[0];if(!k)return h;var ad=k=='finans'?'Finans':'Sağlık';
return h+'\nGizli klasörün: Belgelerim/'+ad+' (yalnız sen ulaşırsın). Okuyabilmen için Çağlar’ın görevinde “Belgelerim” ya da “'+ad+' klasörü” geçmeli; o görevde internet yoktur. İçeriğini yalnız Çağlar’a, kendi sohbetinde ve özet olarak ver; toplantıda, başka çalışana, KATKI / İŞ İSTEĞİ / ÖĞRENİLENLER satırlarında içerik verme; dosyaları aynen aktarma, arşivleme, kopyalama.'};
// Telefona giden özet: gizli mesajlar ve gizli görev sonuçları çıkarılır
var _gzkOz=bulutOzet;bulutOzet=function(){var o=_gzkOz(),E=o&&o.ekip;if(!E)return o;Object.keys(E.sohbet||{}).forEach(function(k){E.sohbet[k]=E.sohbet[k].filter(function(m){return !m.gizli})});
E.gorev=(E.gorev||[]).map(function(g){return g.gizli?Object.assign({},g,{sonuc:'Gizli · yalnız bilgisayardaki Orvane’de',komut:undefined}):g});return o};
window.__gizliTest=function(){var R=[],T=TMS(),bk={ch:JSON.stringify(T.sohbet),gor:T.gorev.slice(),cg:ABN.cagir,st:ABN.st,gel:T.gel.slice()};function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
t('Finans Uzmanı ve Sağlıklı Yaşam Koçu’na gizli klasör kuralı; başkasına yok',/Belgelerim\/Finans \(yalnız sen/.test(zekaSistem(tm('otto')))&&/Belgelerim\/Sağlık/.test(zekaSistem(tm('iris')))&&!/Gizli klasörün/.test(zekaSistem(tm('sage'))));
t('Otto’nun görevleri en az Gizli, Iris Çok gizli',gzDerece('otto')>=2&&gzDerece('iris')==3);
ABN.st={kurulu:true,acik:true,gunluk:5,bugun:0,toplam:0,gunlukSohbet:60,sohbetBugun:0,test:{ok:true}};ABN.cagir=function(){return Promise.resolve({ok:true,v:{metin:'Faturalar: elektrik 900 TL.\nÖĞRENİLENLER: [{"tur":"hafiza","ad":"Fatura","metin":"Elektrik 900 TL"}]',tur:2,token:3000,model:'claude-haiku-5-5',gizli:true}})};
T.sohbet.otto=[];var gn=T.gel.length,g=tmTaskNew('otto','Belgelerim Finans klasöründeki faturaları özetle','normal','',false,{});
return new Promise(function(r){setTimeout(r,300)}).then(function(){var m=tmChat('otto').filter(function(x){return x.r=='o'}).slice(-1)[0];
t('Gizli klasör sonucu gizli işaretlenir, öğrenme zincirine (Nika) gitmez',g.gizli&&m&&m.gizli&&T.gel.length==gn,JSON.stringify({g:g.gizli,m:m&&m.gizli,gel:T.gel.length-gn}));
var oz=bulutOzet(),sm=(oz.ekip.sohbet.otto||[]),og=oz.ekip.gorev.filter(function(x){return x.id==g.id})[0];
t('Telefona giden özette gizli mesaj ve sonuç yok',!sm.some(function(x){return /900 TL/.test(x.t)})&&og&&!/900/.test(og.sonuc||'')&&/yalnız bilgisayardaki/.test(og.sonuc),JSON.stringify(og));
return R}).catch(function(e){t('Gizli klasör testi',false,e.stack)}).then(function(){T.sohbet=JSON.parse(bk.ch);T.gorev=bk.gor;T.gel=bk.gel;ABN.cagir=bk.cg;ABN.st=bk.st;save();return R})};
