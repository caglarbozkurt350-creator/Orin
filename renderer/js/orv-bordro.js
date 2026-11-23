// ========================================================================
// BORDRO (0.8.3) — aylık bordro, kâğıttaki düzenle birebir: Kazançlar · Yasal Kesintiler · Özel Kesintiler.
// Her değerin yanında yalnız önceki aya göre artış/azalış; her satırda düzeltme düğmesi.
// Veri yalnız yerel durum dosyasında (S.bordro); buluta/telefona gönderilmez.
// ========================================================================
var BR={};
// Alan tanımları: [kimlik, etiket, tür, yön, ondalık]
// tür: 'bt' birim+tutar · 't' tutar · 'oi' orjinal/istisna · '-' ayraç · '#' ara başlık · 'bos' boş kutu
// yön: '+' artış iyi (kazanç, net) · '-' artış kötü (kesinti) · '' nötr (matrah, oran)
BR.KAZ=[['gun','T. Çalışma Günü','bt','+'],['normal','Normal Saat Ücreti','bt','+'],['hgt','H.G. Tatil','bt','+'],['ucretli','Ücretli','bt','+'],['sosyal','Sosyal','bt','+'],['fc50','Fazla Çalışma %50','bt','+'],['fc100','Fazla Çalışma %100','bt','+'],['fc150','Fazla Çalışma %150','bt','+'],['gece','Gece','bt','+'],['kisa','Kısa Çalışma','bt','+'],['-'],
 ['ts','Ts Hastalık','bt','+'],['ikramiye','İkramiye','t','+'],['cocuk','Çocuk Yardımı','t','+'],['aile','Aile Yardımı','t','+'],['yakacak','Yakacak Yardımı','t','+'],['bayram','Bayram Harçlığı','t','+'],['izin','İzin Yardımı','t','+'],['yakit','Yakıt Yardımı','t','+'],['ayni','Ayni Yardımı','t','+'],['yemek','Yemek+Tahsil Yardımı','t','+'],['sendIst','Sendika İstinai Ödeme','t','+'],['yasam','Yaşam Sigortası','t','+'],['-'],
 ['ekIzin','Ek Gelir İzin','t','+'],['ekPrim','Ek Gelir Prim','t','+'],['ekDiger','Ek Gelir Diğer','t','+'],['tis','TİS Avans','t','+'],['-'],
 ['top','Kazanç Toplamı','t','+',2,'k'],['isvIndB','Isv.Pay-İndirilemeyen B','t',''],['isvDvB','Isv.Pay-Damga Vergisi B','t','']];
BR.YAS=[['smDevir','Sigorta Matrahı Devir','t',''],['sm','Sigorta Matrahı','t',''],['sgk','Sigorta %','t',''],['gvm','Gelir Vergisi Matrahı','t',''],['dvm','Damga Vergisi Matrahı','t',''],['tgvm','Topl. Gelir Vergisi Matrahı','t',''],['tgv','Toplam Gelir Vergisi','t','-'],['tesvik','Teşvik Tutarı','t','+'],['-'],
 ['#','İŞVEREN'],['isvSsk','SSK İşveren Primi','t',''],['isvIssiz','İşsizlik İşveren','t',''],['isvDv','İşv. Pay- Damga Vergisi','t',''],['-'],
 ['#','ÇALIŞAN'],['ssk','SSK Çalışan Primi','t','-'],['issiz','İşsizlik Çalışan','t','-'],['gv','Gelir Vergisi','t','-'],['dv','Damga Vergisi','t','-'],['asgari','Asgari Ücret Kmltf. Matrah','t',''],['gvOI','Gelir Vrg. Orj./İstisna','oi',''],['dvOI','Damga Vrg. Orj./İstisna','oi',''],['-'],
 ['yTop','Yasal Kesinti Toplamı','t','-',2,'k'],['-'],['ilkNet','İlk Net','t','+',2,'k'],['-'],['smBakiye','Sigorta Matrahı Bakiye','t','',0]];
BR.OZL=[['avans','Ücret Avansı','t','-'],['sendika','Sendika Aidatı','t','-'],['yemekB','Yemek Bedeli','t','-'],['personel','Personel Borcu','t','-'],['borcT','Borç Taksidi','t','-'],['borcK','Borç Kes.','t','-'],['nafaka','Nafaka','t','-'],['icra','İcra','t','-'],['icraB','İcra Bakiyesi','t',''],['ceza','Ceza','t','-'],['ozelSig','Özel Sigorta','t','-'],['kes1','Kesinti 1','t','-'],['kes2','Kesinti 2','t','-'],['indBes','İndirilen Isv. Payı BES','t',''],['indSag','İndirilen Isv. Payı Sağlık','t',''],['isvInd','Isv. Pay. İndirilemeyen','t',''],['dusulen','Düşülen Sigorta','t',''],['bes','BES Otomatik Katılım','t','-'],['oYasam','Yaşam Sigortası','t','-'],['oAyni','Ayni Yardım','t','-'],['-'],
 ['oTop','Özel Kesinti Top.','t','-',2,'k'],['agi','A.G.İ','t','+'],['-'],['kesTop','Kesinti Top.','t','-',2,'k'],['-'],['net','Net Ödenen','t','+',2,'n']];
BR.BAS=[['tip','Bordro Tipi'],['lokasyon','Lokasyon'],['engel','Engel Derecesi'],['sicil','Sicil No'],['ad','Adı Soyadı'],['lider','Ekip Lideri'],['pozisyon','Pozisyon'],['medeni','Medeni Durum'],['cocuk','Çocuk Adedi'],['gorev','Görevi'],['birim','Birim Ücreti']];
BR.AYLAR=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
BR.ui={ay:'',duz:'',bas:false,er:'',ok:''};
BR.st=function(){if(!S.bordro||!Array.isArray(S.bordro.aylar))S.bordro={aylar:[]};return S.bordro};
BR.sirala=function(){BR.st().aylar.sort(function(a,b){return a.ay<b.ay?-1:a.ay>b.ay?1:0})};
BR.ayAd=function(a){var p=String(a||'').split('-');return (BR.AYLAR[(+p[1]||1)-1]||'')+' '+(p[0]||'')};
BR.bul=function(a){var L=BR.st().aylar;for(var i=0;i<L.length;i++)if(L[i].ay==a)return i;return -1};
BR.secili=function(){var L=BR.st().aylar;if(!L.length)return -1;var i=BR.bul(BR.ui.ay);if(i<0){i=L.length-1;BR.ui.ay=L[i].ay}return i};
// Sayı biçimi (Türkçe): 1.234,56
BR.fmt=function(x,d){if(x===null||x===undefined||x==='')return '';var n=+x;if(!isFinite(n))return '';d=d===undefined?2:d;var s=Math.abs(n).toFixed(d).split('.'),t=s[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.');return (n<0?'−':'')+t+(d?','+s[1]:'')};
// Girdi: "1.234,56", "1234,56", "1234.56", "0,14"
BR.oku=function(s){s=String(s==null?'':s).trim().replace(/\s/g,'').replace('−','-');if(s==='')return null;if(s.indexOf(',')>=0)s=s.replace(/\./g,'').replace(',','.');else if(/^-?\d+\.\d{3}(\.\d{3})*$/.test(s))s=s.replace(/\./g,'');var n=+s;return isFinite(n)?Math.round(n*1e6)/1e6:NaN};
BR.ond=function(f,parca){if(f[4]!==undefined)return f[4];if(f[0]=='gun'&&parca==1)return 0;if(f[2]=='oi'&&parca==0)return 1;return 2};
// Değer: 'bt' ve 'oi' için [a,b]; diğerleri sayı
BR.deg=function(m,id,p){var v=m&&m.v?m.v[id]:undefined;if(Array.isArray(v))return v[p||0];return p?undefined:v};
BR.fark=function(f,m,o,p){if(!o)return '';var a=BR.deg(m,f[0],p),b=BR.deg(o,f[0],p);a=+a||0;b=+b||0;var d=Math.round((a-b)*100)/100;if(!d)return '';
 var yon=f[3],sinif=yon=='+'?(d>0?'iyi':'kotu'):yon=='-'?(d>0?'kotu':'iyi'):'notr';
 return '<span class="br-fk '+sinif+'" title="Önceki aya göre ('+BR.ayAd(o.ay)+')">'+(d>0?'▲':'▼')+' '+BR.fmt(Math.abs(d),BR.ond(f,p))+'</span>'};
BR.kutu=function(f,m,o,p){var v=BR.deg(m,f[0],p);return '<span class="br-kt'+(f[5]?' '+f[5]:'')+'">'+(v===undefined||v===null?'':BR.fmt(v,BR.ond(f,p)))+'</span>'+BR.fark(f,m,o,p)};
BR.satir=function(f,m,o){if(f[0]=='-')return '<div class="br-ay"></div>';if(f[0]=='#')return '<div class="br-ab">'+esc(f[1])+'</div>';
 var id=f[0],duz=BR.ui.duz==id,dz=m.duz&&m.duz[id],h='<div class="br-sr'+(f[5]?' '+f[5]:'')+(duz?' duz':'')+'" data-id="'+id+'"><span class="br-et">'+esc(f[1])+(dz?' <i class="br-dz" title="Elle düzeltildi"></i>':'')+'</span>';
 if(duz){var inp=function(p){var v=BR.deg(m,id,p);return '<input class="oa-in br-in" id="brIn'+p+'" inputmode="decimal" value="'+esc(v===undefined||v===null?'':BR.fmt(v,BR.ond(f,p)))+'" onkeydown="if(event.key==\'Enter\')BR.kaydet();if(event.key==\'Escape\')BR.vazgec()">'};
  h+='<span class="br-dg">'+(f[2]=='t'?inp(0):inp(0)+inp(1))+'</span><span class="br-bt"><button type="button" class="br-ib ok" onclick="BR.kaydet()" aria-label="Kaydet">✓</button><button type="button" class="br-ib" onclick="BR.vazgec()" aria-label="Vazgeç">✕</button></span>'}
 else h+='<span class="br-dg">'+(f[2]=='t'?'<span class="br-c">'+BR.kutu(f,m,o,0)+'</span>':'<span class="br-c">'+BR.kutu(f,m,o,0)+'</span><span class="br-c">'+BR.kutu(f,m,o,1)+'</span>')+'</span><span class="br-bt"><button type="button" class="br-ib" onclick="BR.duzenle(\''+id+'\')" aria-label="'+esc(f[1])+' satırını düzelt" title="Satırı düzelt">✎</button></span>';
 return h+'</div>'};
BR.sutun=function(bas,L,m,o,ust){return '<section class="br-su"><div class="br-sb">'+bas+'</div>'+(ust||'')+L.map(function(f){return BR.satir(f,m,o)}).join('')+'</section>'};
BR.basBlok=function(m){var H=m.h||{},p=String(m.ay).split('-'),e=BR.ui.bas,
 alan=function(k,ad){var v=k=='birim'?BR.fmt(H.birim):H[k];return '<span class="br-hb"><span class="oa-sub">'+ad+':</span> '+(e?'<input class="oa-in br-hin" data-k="'+k+'" value="'+esc(v==null?'':v)+'">':'<b>'+esc(v==null?'':String(v))+'</b>')+'</span>'};
 return '<section class="br-bas"><div class="br-sb">Aylık Bordro Bilgileri<span class="sag">'+(e?'<button type="button" class="br-ib ok" onclick="BR.basKaydet()" aria-label="Kaydet">✓</button><button type="button" class="br-ib" onclick="BR.ui.bas=false;ORV.yenile()" aria-label="Vazgeç">✕</button>':'<button type="button" class="br-ib" onclick="BR.ui.bas=true;ORV.yenile()" aria-label="Bordro bilgilerini düzelt" title="Bilgileri düzelt">✎</button>')+'</span></div>'+
  '<div class="br-hs">'+BR.BAS.slice(0,5).map(function(x){return alan(x[0],x[1])}).join('')+'<span class="br-hb"><span class="oa-sub">Ay:</span> <b>'+(+p[1]||'')+'</b></span><span class="br-hb"><span class="oa-sub">Yıl:</span> <b>'+(p[0]||'')+'</b></span></div>'+
  '<div class="br-hs">'+BR.BAS.slice(5).map(function(x){return alan(x[0],x[1])}).join('')+'</div></section>'};
BR.sayfa=function(){var L=BR.st().aylar,i=BR.secili(),U=BR.ui;
 var sec=L.length?'<span class="br-ust"><button type="button" class="br-ib" onclick="BR.git(-1)" aria-label="Önceki ay"'+(i<=0?' disabled':'')+'>‹</button><select class="oa-in br-sel" aria-label="Ay" onchange="BR.ui.ay=this.value;BR.ui.duz=\'\';BR.ui.bas=false;ORV.yenile()">'+L.map(function(m){return '<option value="'+esc(m.ay)+'"'+(m.ay==U.ay?' selected':'')+'>'+esc(BR.ayAd(m.ay))+'</option>'}).join('')+'</select><button type="button" class="br-ib" onclick="BR.git(1)" aria-label="Sonraki ay"'+(i>=L.length-1?' disabled':'')+'>›</button></span>':'';
 var arac='<span class="br-ust">'+sec+'<button type="button" class="oa-btn sm ghost" onclick="BR.yeniAy()">Yeni ay</button><button type="button" class="oa-btn sm ghost" onclick="BR.iceAl()">İçe aktar</button></span><input type="file" id="brDosya" accept=".json,application/json" style="display:none" onchange="BR.dosya(this)">';
 var m=L[i],o=i>0?L[i-1]:null,alt=m?(o?'Değişimler '+BR.ayAd(o.ay)+' bordrosuna göre · ▲ artış ▼ azalış':'İlk kayıtlı ay · karşılaştırma bir sonraki aydan itibaren'):'Henüz bordro yok';
 var h='<div class="ob-pg br-pg" id="obBordro">'+OA.baslik('Bordro',alt,arac);
 if(U.er)h+='<div class="ob-uy" role="alert">'+esc(U.er)+'</div>';if(U.ok)h+='<span class="ob-ok" role="status">'+esc(U.ok)+'</span>';
 if(!m)return h+OA.kart('','<div class="oa-hd"><span class="oa-tl">Bordro kaydı yok</span></div><span class="oa-sub">Bordroyu "İçe aktar" ile bir JSON dosyasından yükleyebilir ya da "Yeni ay" ile boş bir ay açıp satırları ✎ ile doldurabilirsin. Veriler yalnız bu bilgisayarda tutulur.</span>',0)+'</div>';
 h+=BR.basBlok(m)+'<div class="br-grid">'+
  BR.sutun('KAZANÇLAR',BR.KAZ,m,o,'<div class="br-sr br-kb"><span class="br-et"></span><span class="br-dg"><span class="br-c oa-sub">Birim</span><span class="br-c oa-sub">Tutar</span></span><span class="br-bt"></span></div>')+
  BR.sutun('YASAL KESİNTİLER',BR.YAS,m,o)+BR.sutun('ÖZEL KESİNTİLER',BR.OZL,m,o)+'</div>'+
  '<div class="br-alt"><span class="oa-sub">Veriler yalnız bu bilgisayarda (durum dosyası) tutulur; buluta ve telefona gönderilmez. ✎ ile düzeltilen satırlar • işaretiyle gösterilir. Toplamlar bordrodaki gibi saklanır, otomatik yeniden hesaplanmaz.</span><button type="button" class="oa-btn sm ghost br-sil" onclick="BR.sil()">'+(U.silOnay==m.ay?'Emin misin? '+esc(BR.ayAd(m.ay))+' silinsin':'Bu ayı sil')+'</button></div>';
 return h+'</div>'};
BR.git=function(d){var L=BR.st().aylar,i=BR.secili()+d;if(i<0||i>=L.length)return;BR.ui.ay=L[i].ay;BR.ui.duz='';BR.ui.bas=false;BR.ui.silOnay='';ORV.yenile()};
BR.alan=function(id){var r=null;[BR.KAZ,BR.YAS,BR.OZL].forEach(function(L){L.forEach(function(f){if(f[0]==id)r=f})});return r};
BR.duzenle=function(id){BR.ui.duz=id;BR.ui.er='';BR.ui.ok='';ORV.yenile();setTimeout(function(){var e=document.getElementById('brIn0');if(e){e.focus();e.select()}},30)};
BR.vazgec=function(){BR.ui.duz='';BR.ui.er='';ORV.yenile()};
BR.kaydet=function(){var id=BR.ui.duz,f=BR.alan(id),L=BR.st().aylar,m=L[BR.secili()];if(!f||!m)return false;
 var a=BR.oku((document.getElementById('brIn0')||{}).value),b=f[2]=='t'?null:BR.oku((document.getElementById('brIn1')||{}).value);
 if((a!==null&&isNaN(a))||(b!==null&&isNaN(b))){BR.ui.er='Geçerli bir sayı yaz (ör. 1.234,56)';ORV.yenile();return false}
 m.v=m.v||{};if(f[2]=='t'){if(a===null)delete m.v[id];else m.v[id]=a}else{if(a===null&&b===null)delete m.v[id];else m.v[id]=[a||0,b||0]}
 m.duz=m.duz||{};m.duz[id]=Date.now();BR.ui.duz='';BR.ui.er='';BR.ui.ok=f[1]+' düzeltildi';save();ORV.yenile();return true};
BR.basKaydet=function(){var m=BR.st().aylar[BR.secili()];if(!m)return;m.h=m.h||{};Array.prototype.forEach.call(document.querySelectorAll('.br-hin'),function(e){var k=e.getAttribute('data-k'),v=e.value.trim();if(k=='birim'){var n=BR.oku(v);m.h.birim=n===null||isNaN(n)?m.h.birim:n}else if(k=='cocuk')m.h.cocuk=v===''?'':(+v||0);else m.h[k]=v});BR.ui.bas=false;BR.ui.ok='Bordro bilgileri güncellendi';save();ORV.yenile()};
BR.yeniAy=function(){var L=BR.st().aylar,son=L[L.length-1],ay;if(son){var p=son.ay.split('-'),y=+p[0],a=+p[1]+1;if(a>12){a=1;y++}ay=y+'-'+(a<10?'0':'')+a}else{var t=pk(TODAY);ay=t.getFullYear()+'-'+(t.getMonth()<9?'0':'')+(t.getMonth()+1)}
 L.push({ay:ay,h:son?JSON.parse(JSON.stringify(son.h||{})):{tip:'NORMAL'},v:{},duz:{}});BR.sirala();BR.ui.ay=ay;BR.ui.ok=BR.ayAd(ay)+' açıldı · satırları ✎ ile doldur';BR.ui.er='';save();ORV.yenile()};
BR.sil=function(){var L=BR.st().aylar,i=BR.secili();if(i<0)return;var m=L[i];if(BR.ui.silOnay!=m.ay){BR.ui.silOnay=m.ay;ORV.yenile();return}L.splice(i,1);BR.ui.silOnay='';BR.ui.ay=L.length?L[Math.max(0,i-1)].ay:'';BR.ui.ok=BR.ayAd(m.ay)+' silindi';save();ORV.yenile()};
// İçe aktarma: {aylar:[{ay:'2026-09',h:{...},v:{...}}]} · aynı ay varsa üzerine yazar, elle düzeltilmiş satırları korur
BR.yukle=function(o){if(!o||!Array.isArray(o.aylar))throw new Error('Bordro dosyası tanınmadı');var L=BR.st().aylar,n=0;
 o.aylar.forEach(function(x){if(!x||!/^\d{4}-\d{2}$/.test(x.ay)||!x.v)return;var i=BR.bul(x.ay),y={ay:x.ay,h:x.h||{},v:x.v,duz:{}};if(i>=0){var e=L[i];Object.keys(e.duz||{}).forEach(function(k){y.v[k]=e.v[k];y.duz[k]=e.duz[k]});L[i]=y}else L.push(y);n++});
 if(!n)throw new Error('Dosyada geçerli ay yok');BR.sirala();BR.ui.ay=L[L.length-1].ay;save();return n};
BR.iceAl=function(){var e=document.getElementById('brDosya');if(e){e.value='';e.click()}};
BR.dosya=function(inp){var f=inp.files&&inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var n=BR.yukle(JSON.parse(r.result));BR.ui.er='';BR.ui.ok=n+' ay içe aktarıldı'}catch(e){BR.ui.ok='';BR.ui.er='İçe aktarılamadı: '+e.message}ORV.yenile()};r.readAsText(f,'utf-8')};
// İlk açılışta Belgeler\Orin\Bordro-gecici\bordro.json varsa bir kez kendiliğinden içe aktar
BR.otoDene=function(){if(BR._oto||!window.API||!API.bordro||BR.st().aylar.length)return;BR._oto=true;API.bordro.oku().then(function(o){if(!o)return;try{var n=BR.yukle(o);BR.ui.ok=n+' ay bordrodan içe aktarıldı (Belgeler › Orin › Bordro-gecici). Bu klasörü artık silebilirsin.';if(typeof pg!='undefined'&&pg=='bordro')ORV.yenile()}catch(e){}},function(){})};
ORV.IKON.bordro=ORV.IKON.bordro||'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>';
ORV.sayfa('bordro',{ciz:function(){BR.otoDene();return BR.sayfa()},baslik:'Bordro'});
