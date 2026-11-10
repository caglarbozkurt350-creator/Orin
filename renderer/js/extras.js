// Orin · Aşama 4: arama, tema, belgeler, yedek, hatırlatma, gelişim önerileri, dışa aktarma, haberler
function trl(s){return String(s||'').toLocaleLowerCase('tr')}

// ---------- Ctrl+K arama ----------
var PAL={items:[],sel:0};
function palItems(){var r=[];
[['İş Günleri · Bugün',function(){nav('home','gun',TODAY)}],['Takvim',function(){nav('cal','takvim')}],['Yıllık İzinler',function(){nav('home','yil','')}],['Mazeret İzinleri',function(){nav('home','maz','')}],['Refakat İzinleri',function(){nav('home','ref','')}],['Yeni proje',function(){nav('home','yeni','')}],['Hukuki Sorumluluk',function(){nav('set','huk','')}],['Uygulama Kuralları',function(){nav('set','kur','')}],['Google Sheets bağlantısı',function(){nav('set','baglanti','')}],['Geçmiş raporlar',function(){nav('set','ice','')}],['Dışa aktar (Excel / PDF)',function(){nav('set','aktar','')}],['Haberler · Uygulama Geliştirme',function(){nav('msg','haber','gel')}],['Haberler · Şirket Haberleri',function(){nav('msg','haber','sir')}],['Planlar',function(){nav('plan','notlar','')}],['Görseller',function(){nav('img','gorsel','')}],['Belgeler',function(){nav('set','belge','')}],['Klavye kısayolları',function(){nav('set','kisa','')}]].forEach(function(x){r.push({t:x[0],s:'Sayfa',ic:'ti-layout-2',f:x[1]})});
allP().forEach(function(p){r.push({t:p[0]+' · '+p[1],s:'Proje'+(PS[p[0]]?' · '+PS[p[0]]:''),ic:'ti-box',f:function(){nav('home','proje',p[0])}})});
Object.keys(E).sort(function(a,b){return pk(b)-pk(a)}).forEach(function(k){(E[k]||[]).forEach(function(e){r.push({t:short(k)+' · '+e.k+' · '+e.i,s:dk(e.d)+' dk',ic:'ti-clock',f:function(){nav('home','gun',k)}})})});
N.forEach(function(n){r.push({t:ntitle(n),s:'Not',ic:'ti-note',f:function(){nav('plan','notlar',n.id)}})});
Object.keys(MA).forEach(function(m){MA[m].forEach(function(x){if(x)r.push({t:x[0],s:m+' menüsü'+(x[2]?' · '+x[2]:''),ic:'ti-command',f:x[1]})})});return r}
function openPal(){closeM();var o=document.getElementById('ov');o.innerHTML='<div class="dl" style="max-width:560px;width:560px;align-self:flex-start;margin-top:70px;padding:10px"><input id="palq" class="ti2" style="margin:0 0 6px" placeholder="Kayıt, proje, sayfa veya komut ara…" oninput="palRun()" onkeydown="palKey(event)"><div id="palr" style="max-height:380px;overflow:auto"></div><div class="hn" style="padding:6px 4px 0">↑ ↓ seç · Enter aç · Esc kapat</div></div>';o.style.display='flex';o.onclick=function(e){if(e.target===o)cfNo()};PAL.all=palItems();palRun();setTimeout(function(){document.getElementById('palq').focus()},20)}
function palRun(){var q=trl(document.getElementById('palq').value).split(/\s+/).filter(String);PAL.items=PAL.all.filter(function(x){var h=trl(x.t+' '+x.s);return q.every(function(w){return h.indexOf(w)>=0})}).slice(0,40);PAL.sel=0;palDraw()}
function palDraw(){document.getElementById('palr').innerHTML=PAL.items.length?PAL.items.map(function(x,i){return '<div class="cxi" style="'+(i==PAL.sel?'background:#34343a':'')+'" onmousedown="event.preventDefault()" onclick="palGo('+i+')"><i class="ti '+x.ic+'"></i><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(x.t)+'</span><span class="hn">'+esc(x.s)+'</span></div>'}).join(''):'<div class="hn" style="padding:8px">Sonuç yok</div>'}
function palKey(e){if(e.key=='ArrowDown'){PAL.sel=Math.min(PAL.items.length-1,PAL.sel+1);palDraw();e.preventDefault()}else if(e.key=='ArrowUp'){PAL.sel=Math.max(0,PAL.sel-1);palDraw();e.preventDefault()}else if(e.key=='Enter'){palGo(PAL.sel)}else if(e.key=='Escape')cfNo()}
function palGo(i){var x=PAL.items[i];document.getElementById('ov').onclick=null;cfNo();if(x)x.f()}
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&trl(e.key)=='k'){e.preventDefault();openPal()}});

// ---------- Tema ----------
function applyTheme(){var l=S.theme=='light';document.documentElement.classList.toggle('light',l);if(API)API.win('theme',l?'light':'dark')}
function togTheme(){S.theme=S.theme=='light'?'dark':'light';applyTheme();save();toast(S.theme=='light'?'Açık tema':'Koyu tema')}

// ---------- Belgeler ----------
P.belge=function(){return '<p class="h">Belgeler</p><p class="s">'+APPNAME+' kısa kullanım kılavuzu</p>'+
cat('Günlük kayıt','ti-clock',[['Kayıt girmek',li(['İş Günleri’nde günü seç; Proje kodu, Yapılan iş ve Dakika’yı yaz, Kaydet’e bas.','Günü doldur: günün iş süresinden (varsa fazla mesai dahil) girilmiş süreyi çıkarır, kalanı yazar.','Önce onayla açıksa kayıt Onayla’ya basınca Sheets’e gider. Etiketler: Sheets’te · Sırada · Çakışma · Yerel.'])],['Düzeltmek',li(['Kayda tıkla veya sağ tıkla: Kopyala, Çoğalt, Düzenle, Sil.','Silinen kaydın Sheets’teki satırı temizlenir; satır silinmez, özet bozulmaz.'])]])+
cat('Projeler ve izinler','ti-box',[['Projeler',li(['Yeni proje: 118.26.01.01 gibi kod yaz; model grubu (SY118) kendiliğinden açılır.','Durum: Başlandı, Devam ediyor, Bitti, Teslim edildi. Kayıtta Durum = Bitti seçmek projeyi de günceller.'])],['İzinler',li(['Gün türü ata’dan izin ve rapor günlerini işaretle; Sheets’e “İşe gidilmedi” satırı yazılır.','Yıllık İzinler’de köprü günlerine göre önerilen planlar var; plan durumları Planlandı → Dilekçe verildi → Onaylandı.'])]])+
cat('Eşitleme ve veriler','ti-refresh',[['Google Sheets',li(['Ctrl+R: önce bekleyenleri gönderir, sonra Sheets’i okur.','İnternet yokken girilenler kuyrukta bekler; sağ üstte durum görünür.','Çakışma çıkarsa Ayarlar › Google Sheets’te “Sheets’tekini al” veya “Benimkini yaz”.'])],['Dosyalar',li(['Veri klasörü, görsel ve not klasörü Ayarlar › Uygulama Kuralları’nda.','Her hafta veri klasöründeki Yedekler’e otomatik yedek alınır (son 8 yedek).'])]])+
cat('Kısayollar','ti-keyboard',[['En çok kullanılanlar',li(['Ctrl+K arama · Ctrl+N yeni kayıt · Ctrl+R eşitle · Ctrl+S notu kaydet','Tüm liste: Yardım › Klavye kısayolları (Ctrl+/)'])]])};

// ---------- Haftalık yedek ----------
function backupNow(manual){if(!API||!API.data||!API.data.backup)return;saveNow();setTimeout(function(){API.data.backup().then(function(r){if(r&&r.ok){S.lastBackup=Date.now();save();if(manual)toast('Yedek alındı: '+r.file)}else if(manual)toast('Yedeklenemedi: '+(r&&r.err))})},300)}
function autoBackup(){if(INFO.smoke)return;if(!S.lastBackup||Date.now()-S.lastBackup>7*864e5)backupNow(false)}

// ---------- Gün sonu hatırlatması ----------
var _rem=null;
function remindTick(){if(!S.remind||INFO.smoke)return;var now=new Date(),k=key(now),L=lim(k);if(!L||D[k]||S.remindDay==k)return;var hm=S.remind.split(':'),t=new Date(now);t.setHours(+hm[0]||17,+hm[1]||0,0,0);if(now<t)return;var s=tot(k);if(s>=L+(OT[k]||0))return;
S.remindDay=k;save();try{var n=new Notification(APPNAME+' · gün sonu',{body:(s?'Bugün '+dk(s)+' dk girildi, '+dk(L-s)+' dk eksik.':'Bugünün kaydı henüz girilmedi.')+' Kaydetmek için tıkla.',silent:false});n.onclick=function(){window.focus();nav('home','gun',k)}}catch(e){toast('Bugünün kaydı eksik')}}
_rem=setInterval(remindTick,60000);

// ---------- Gelişim önerileri (büyüyen liste) ----------
// Her güncellemede bu listeye yeni fikirler eklenir (v: eklendiği sürüm). Durumlar: yapildi · istemiyorum · sonra
var SUG=[
{id:'aysonu',t:'Takvimin altında ay sonu özeti: toplam dakika, izin ve hatalı gün sayısı',k:'Görsel',v:'0.3.0'},
{id:'projegrafik',t:'Proje sayfasında süreyi günlere dağıtan küçük çubuk grafik',k:'Görsel',v:'0.3.0'},
{id:'tahmin',t:'Benzer projelerin geçmiş sürelerine göre yeni proje için süre tahmini',k:'Yapısal',v:'0.3.0'},
{id:'sablon',t:'Sık girilen işler için tek tıkla kayıt şablonları (ör. Montaj destek 525 dk)',k:'Yapısal',v:'0.3.0'},
{id:'telefon',t:'Telefondan hızlı kayıt: aynı Sheets’e yazan basit bir mobil sayfa',k:'Yapısal',v:'0.3.0'},
{id:'haftaozet',t:'Cuma akşamı haftalık özet bildirimi',k:'Kullanım',v:'0.3.0'},
{id:'izinhatir',t:'Onaysız planlı izin yaklaşınca masaüstü bildirimi',k:'Kullanım',v:'0.3.0'}];
function dynSug(){var r=[],top='',tn=0,dig=0,tt=0,hata=0;Object.keys(V).forEach(function(k){if(V[k]>tn){tn=V[k];top=VN[k]||k}});
Object.keys(E).forEach(function(k){E[k].forEach(function(e){tt+=e.d;if(SPECIAL.indexOf(e.k)>=0)dig+=e.d})});
RG.forEach(function(g){hata+=rangeStats(g[0],g[1]).er.length});
if(top&&tn>5)r.push({id:'d-acilis-'+top,t:'En çok açtığın ekran: '+top+' ('+tn+' kez). Açılış ekranı yapılabilir.',k:'Kullanımına göre'});
if(tt&&dig/tt>.08)r.push({id:'d-diger',t:'Diğer ve standart dışı işler sürenin %'+Math.round(dig/tt*100)+'’i. Proje/diğer dağılım grafiği önerilir.',k:'Kullanımına göre'});
if(hata>3)r.push({id:'d-hata',t:'Geçmiş raporlarda '+hata+' hatalı gün var. Gün sonu hatırlatmasını açık tutmak işe yarar.',k:'Kullanımına göre'});
var q=Q.filter(function(o){return o.conflict}).length;if(q)r.push({id:'d-cakisma',t:q+' çakışma bekliyor: Ayarlar › Google Sheets’ten çöz.',k:'Kullanımına göre'});return r}
var WANT_KEY='Orin istenen özellikler (otomatik)';
function sugSet(id,v){S.sg=S.sg||{};if(v)S.sg[id]=v;else delete S.sg[id];if(typeof infoChanged=='function')infoChanged(WANT_KEY);save();render()}
function sugWant(id,on){sugSet(id,on?'istek':null);if(on)toast('Sonraki sürüm listesine eklendi')}
function wantedText(){var sg=S.sg||{},all=SUG.concat(S.mysug||[]),w=all.filter(function(x){return sg[x.id]=='istek'});return w.length?w.map(function(x,i){return (i+1)+') '+x.t}).join(' · ')+' · Son güncelleme '+new Date().toLocaleString('tr-TR'):'Seçili istek yok'}
function sugAdd(){var i=document.getElementById('sgnew'),v=i.value.trim();if(!v)return;S.mysug=S.mysug||[];var id='u'+Date.now();S.mysug.push({id:id,t:v,k:'Senin fikrin',v:INFO.version});S.sg=S.sg||{};S.sg[id]='istek';if(typeof infoChanged=='function')infoChanged(WANT_KEY);save();render();toast('Fikir eklendi ve sonraki sürüm için seçildi')}
function sugView(){var sg=S.sg||{},all=dynSug().concat(SUG,S.mysug||[]),done=all.filter(function(x){return sg[x.id]=='yapildi'}),want=all.filter(function(x){return sg[x.id]=='istek'}),open=all.filter(function(x){return !sg[x.id]||sg[x.id]=='istek'||sg[x.id]=='sonra'}),hid=all.filter(function(x){return sg[x.id]=='istemiyorum'}),groups={};
open.forEach(function(x){(groups[x.k]=groups[x.k]||[]).push(x)});
var h='<div class="card"><div class="ch" style="justify-content:space-between"><span><i class="ti ti-bulb"></i>'+HN.gel+'</span><span class="hn">Sonraki sürüm için seçtiğin: <b style="font-weight:500;color:'+(want.length?'#9db6ff':'#8a8a90')+'">'+want.length+'</b></span></div><div class="hn" style="margin:-2px 0 6px">Kutuyu işaretle: o özellik bir sonraki sürümde yapılsın. Seçimlerin Sheets’teki Ayarlar ve Bilgiler sekmesine de yazılır.</div>';
Object.keys(groups).forEach(function(g,gi){h+='<div style="padding:8px 0;'+(gi?'border-top:0.5px solid #2f2f34':'')+'"><div style="font-size:12px;color:#8a8a90;margin-bottom:4px">'+esc(g)+'</div>';groups[g].forEach(function(x){var st=sg[x.id],dyn=/^d-/.test(x.id);
h+='<label style="display:flex;gap:10px;align-items:center;padding:4px 0;cursor:'+(dyn?'default':'pointer')+'">'+(dyn?'<i class="ti ti-info-circle" style="color:#8a8a90;width:16px"></i>':'<input type="checkbox" '+(st=='istek'?'checked':'')+' onchange="sugWant(\''+x.id+'\',this.checked)">')+'<span style="flex:1'+(st=='istek'?';color:#fff':'')+'">'+esc(x.t)+(x.v==INFO.version&&!st?' <span class="pill" style="background:#1e2a4a;color:#9db6ff">yeni</span>':'')+'</span>'+(dyn?'':'<span class="mo" title="Gizle" onclick="event.preventDefault();sugSet(\''+x.id+'\',\'istemiyorum\')">✕</span>')+'</label>'});h+='</div>'});
if(done.length)h+='<div style="padding:8px 0;border-top:0.5px solid #2f2f34"><div style="font-size:12px;color:#8a8a90;margin-bottom:4px">Eklenenler</div>'+done.map(function(x){return '<div style="display:flex;gap:10px;padding:3px 0;color:#8a8a90"><i class="ti ti-circle-check" style="color:'+GRN+'"></i><span style="flex:1">'+esc(x.t)+'</span></div>'}).join('')+'</div>';
if(hid.length)h+='<div class="hn" style="padding-top:6px">'+hid.length+' gizli öneri · <a style="cursor:pointer;text-decoration:underline" onclick="hid0()">geri getir</a></div>';
return h+'<div style="display:flex;gap:8px;margin-top:8px"><input id="sgnew" class="in" style="flex:1;width:auto;text-align:left" placeholder="Kendi fikrini ekle…" onkeydown="if(event.key==\'Enter\')sugAdd()"><button class="bt p" onclick="sugAdd()">Ekle</button></div><div class="ft">Liste her güncellemeyle büyür. Eklediğin fikir de seçilebilir; işaretlediklerin bir sonraki sürümde ele alınır.</div></div>'}
function hid0(){var sg=S.sg||{};Object.keys(sg).forEach(function(k){if(sg[k]=='istemiyorum')delete sg[k]});save();render()}
// ---------- Dışa aktarma ----------
var EXP={from:'',to:''};
function monthsWithData(){var m={};Object.keys(E).forEach(function(k){var d=pk(k);m[d.getFullYear()+'-'+(d.getMonth()+1)]=1});return Object.keys(m).sort(function(a,b){var x=a.split('-'),y=b.split('-');return (y[0]*12+ +y[1])-(x[0]*12+ +x[1])})}
function expRange(){var v=(document.getElementById('exm')||{}).value||'';if(v&&v!='ozel'){var a=v.split('-');return[mk(+a[0],+a[1],1),mk(+a[0],+a[1],new Date(+a[0],+a[1],0).getDate()),AY[+a[1]-1]+' '+a[0]]}
var f=parseDate(document.getElementById('exf').value),t=parseDate(document.getElementById('ext').value);return f&&t?[f,t,dstr(f)+' – '+dstr(t)]:null}
function expData(r){var rows=[['Tarih','Gün','Proje kodu','Proje adı','Yapılan iş','Parça no','Süre (dk)','Gün türü']],days=[['Tarih','Gün','İş süresi (dk)','Yazılan (dk)','Mesai (dk)','Gün türü']],pt={},sum={s:0,ot:0,wd:0,er:0},d=pk(r[0]),e=pk(r[1]);
while(d<=e){var k=key(d),t=typ(k),s=tot(k),L=lim(k);(E[k]||[]).forEach(function(x){rows.push([dstr(k),GN[d.getDay()],x.k,pname(x.k),x.i,x.pn||'',x.d,TN[t]]);pt[x.k]=(pt[x.k]||0)+x.d});
var ot=L?Math.min(OT[k]||0,s):s;if(s||D[k]||L){days.push([dstr(k),GN[d.getDay()],L||0,s,ot,TN[t]])}sum.s+=s;sum.ot+=ot;if(s)sum.wd++;if(t=='hata'||t=='girdi')sum.er++;d.setDate(d.getDate()+1)}
var proj=[['Proje kodu','Proje adı','Durum','Toplam (dk)','Saat']].concat(Object.keys(pt).sort(function(a,b){return pt[b]-pt[a]}).map(function(c){return[c,pname(c),PS[c]||'',pt[c],sa(pt[c])]}));
return{rows:rows,days:days,proj:proj,sum:sum,title:r[2]}}
function expXlsx(){var r=expRange();if(!r){toast('Tarih aralığını seç');return}var x=expData(r);API.exp.xlsx({name:'Orin rapor '+r[2]+'.xlsx',sheets:[{name:'Kayıtlar',rows:x.rows},{name:'Günler',rows:x.days},{name:'Projeler',rows:x.proj}]}).then(expDone)}
function expPdf(){var r=expRange();if(!r){toast('Tarih aralığını seç');return}var x=expData(r);
function tb(a,num){return '<table><tr>'+a[0].map(function(c){return '<th>'+esc(c)+'</th>'}).join('')+'</tr>'+a.slice(1).map(function(rw){return '<tr>'+rw.map(function(c,i){return '<td'+(num.indexOf(i)>=0?' class="n"':'')+'>'+esc(typeof c=='number'?dk(c):c)+'</td>'}).join('')+'</tr>'}).join('')+'</table>'}
var html='<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:"Segoe UI",sans-serif;font-size:10.5px;color:#222;margin:28px}h1{font-size:18px;margin:0 0 2px}h2{font-size:13px;margin:18px 0 6px}.s{color:#666;margin-bottom:12px}.k{display:flex;gap:10px}.k div{border:1px solid #ddd;border-radius:6px;padding:6px 10px}.k b{display:block;font-size:15px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #e3e3e3;padding:4px 5px;text-align:left}th{background:#f3f4f7}td.n{text-align:right}</style></head><body><h1>'+esc(APPNAME)+' · İş raporu</h1><div class="s">'+esc(x.title)+' · oluşturma '+new Date().toLocaleString('tr-TR')+'</div><div class="k"><div>Toplam çalışma<b>'+dk(x.sum.s)+' dk</b>'+sa(x.sum.s)+'</div><div>Mesai<b>'+dk(x.sum.ot)+' dk</b>'+sa(x.sum.ot)+'</div><div>Kayıtlı gün<b>'+x.sum.wd+'</b></div><div>Hatalı gün<b>'+x.sum.er+'</b></div></div><h2>Projeler</h2>'+tb(x.proj,[3])+'<h2>Kayıtlar</h2>'+tb(x.rows,[6])+'</body></html>';
API.exp.pdf({name:'Orin rapor '+r[2]+'.pdf',html:html}).then(expDone)}
function expDone(r){if(!r||r.canceled)return;if(!r.ok){toast('Aktarılamadı: '+r.err);return}EXP.last=r.file;render();toast('Kaydedildi: '+r.file)}
P.aktar=function(){var ms=monthsWithData(),t=pk(TODAY);return '<p class="h">Excel ve PDF olarak aktar</p><p class="s">Seçtiğin dönemin kayıtları, gün özetleri ve proje toplamları · gelir/ücret bilgisi içermez</p><div class="card"><div class="kr"><div>Dönem</div><select id="exm" onchange="document.getElementById(\'exo\').style.display=this.value==\'ozel\'?\'flex\':\'none\'">'+ms.map(function(m){var a=m.split('-');return '<option value="'+m+'">'+AY[+a[1]-1]+' '+a[0]+'</option>'}).join('')+'<option value="ozel">Özel aralık…</option></select></div><div class="kr" id="exo" style="display:none"><div>Tarih aralığı<div class="hn">gg.aa.yyyy</div></div><span style="display:flex;gap:6px"><input id="exf" class="in" style="width:110px;text-align:left" value="01.'+('0'+(t.getMonth()+1)).slice(-2)+'.'+t.getFullYear()+'"><input id="ext" class="in" style="width:110px;text-align:left" value="'+dstr(TODAY)+'"></span></div><div style="display:flex;gap:8px;margin-top:10px"><button class="bt p" onclick="expXlsx()"><i class="ti ti-file-spreadsheet"></i> Excel (.xlsx)</button><button class="bt" onclick="expPdf()"><i class="ti ti-file-type-pdf"></i> PDF</button>'+(EXP.last?'<button class="bt" onclick="API.openPath(EXP.last)">Son dosyayı aç</button>':'')+'</div></div>'};

// ---------- Şirket haberleri (gerçek kaynaklar) ----------
var NEWS=null,_nb=false;
function loadNews(force){if(!API||!API.news||_nb||INFO.smoke)return;var c=S.news;if(!force&&c&&Date.now()-c.at<6*36e5){NEWS=c;return}_nb=true;if(area=='msg')render();API.news().then(function(r){_nb=false;if(r&&r.ok){NEWS={at:Date.now(),items:r.items};S.news=NEWS;save()}else toast('Haberler alınamadı: '+(r&&r.err||'bağlantı yok'));if(area=='msg')render()})}
function newsView(){if(!NEWS&&S.news)NEWS=S.news;if(!NEWS){loadNews();return '<div class="card hn">'+(_nb?'Haberler getiriliyor…':'Haberler yüklenmedi. İnternet bağlantısını kontrol et.')+'</div>'}
var G={};NEWS.items.forEach(function(x){(G[x.g]=G[x.g]||[]).push(x)});var order=['İşçileri doğrudan ilgilendirenler','Yat satışı ve siparişler (dolaylı)','Diğer haberler'];
var h='<div class="card"><div class="ch" style="justify-content:space-between"><span><i class="ti ti-ship"></i>'+HN.sir+'</span><span class="hn">'+NEWS.items.length+' haber · '+new Date(NEWS.at).toLocaleString('tr-TR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})+' · <a style="cursor:pointer;text-decoration:underline" onclick="loadNews(true)">'+(_nb?'yenileniyor…':'yenile')+'</a></span></div>';
order.forEach(function(g,gi){if(!G[g])return;h+='<div style="padding:8px 0;'+(gi?'border-top:0.5px solid #2f2f34':'')+'"><div style="font-size:12px;color:#8a8a90;margin-bottom:4px">'+g+'</div>'+G[g].slice(0,12).map(function(x){return '<div style="padding:3px 0"><a style="color:#fff;cursor:pointer" onclick="API.external(\''+jq(x.link)+'\')">'+esc(x.title)+'</a><div class="hn">'+esc(x.src)+' · '+(x.date?new Date(x.date).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'}):'tarih yok')+'</div></div>'}).join('')+'</div>'});
return h+'<div class="ft">Haberler Google Haberler üzerinden yayıncılardan alınır; başlığa tıklayınca haberin kaynağı açılır. Başlık ve tarih yayıncınındır; içerik Orin tarafından değiştirilmez. Instagram paylaşımları ancak haber sitelerinde alıntılanırsa görünür.</div></div>'}

// ---------- Başlangıç ----------
applyTheme();setTimeout(autoBackup,8000);setTimeout(function(){if(!INFO.smoke)loadNews(false)},4000);
