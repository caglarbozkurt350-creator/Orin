// Orvane 0.8.0 · Aşama 5: Zamanlanmış işler paneli (Bölüm 3.3) + PocketBase bağlantıları
// Panel kancaları orvane08-kabuk.js'ten gelir: ORV.zpIcerik() / ORV.zpAktif() / ORV.zpTog(); panel #orvZp. Burada yeniden tanımlanır.
// Kalıcı durum: S.orvZ {isler:[…], gecmis:[…]}. TEK zamanlayıcı (30 sn): aynı işi iki kez çalıştırmaz. Mevcut arkaplan.js Claude Code işleridir, zamanlayıcı içermez; çift zamanlayıcı yoktur.
// PocketBase: mevcut oturum (ana süreçte, token renderer'a gelmez). Yeni koleksiyon/alan YOK: görevler → `gorevler`, zamanlanmış işler → `ayarlar` (anahtar zamanlanmis_isler).
// Sunucu yoksa yazmalar S.orvPb.kuyruk içinde bekler, bağlanınca sırayla gider.
var OB=window.OB||{};
(function(){
var SMOKE=function(){return typeof INFO!='undefined'&&INFO.smoke};
var p2=function(n){return String(n).padStart(2,'0')};
var TEK=[['gun','Her gün'],['hi','Hafta içi (Pzt–Cum)'],['pz','Haftalık · Pazar'],['bir','Bir kez']];
function ymd(d){return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}

// ---------- Bildirim kaydı (Merkez › Bildirimler okur) ----------
OB.bildir=function(o){var b=OB.st();b.bil.unshift({id:'b'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),kanal:o.kanal||'Sistem',baslik:o.baslik||'',alt:o.alt||'',ts:o.ts||Date.now(),git:o.git||''});if(b.bil.length>100)b.bil.length=100;if(typeof save=='function')save();if(typeof ORV!='undefined'){if(ORV.okSifirla)ORV.okSifirla();if(ORV.ustGuncelle)ORV.ustGuncelle()}};

// ---------- İş listesi ----------
OB.zSeed=function(){return [
 {id:'zecho1',ad:'Echo günlük iş günü kontrolü',kim:'echo',saat:'18:20',tekrar:'hi',durum:'aktif',eylem:'echo-gun',son:null},
 {id:'zecho2',ad:'Echo haftalık özet',kim:'echo',saat:'12:00',tekrar:'pz',durum:'aktif',eylem:'echo-hafta',son:null},
 {id:'ziris1',ad:'Iris akşam ilaç kontrolü',kim:'iris',saat:'21:30',tekrar:'gun',durum:'aktif',eylem:'iris-ilac',son:null},
 {id:'zsheets',ad:'Google Sheets gece kopyası',kim:'echo',saat:'00:00',tekrar:'gun',durum:'aktif',eylem:'sheets',son:null}]};
OB.zSt=function(){if(!S.orvZ||!Array.isArray(S.orvZ.isler))S.orvZ={isler:OB.zSeed(),gecmis:[]};S.orvZ.gecmis=S.orvZ.gecmis||[];return S.orvZ};
OB.zIsler=function(){return OB.zSt().isler};
OB.zTekrarMetin=function(j){var t=TEK.filter(function(x){return x[0]==j.tekrar})[0];return t?t[1].replace(' (Pzt–Cum)',' · Pzt–Cum'):j.tekrar};
OB.zBul=function(id){return OB.zIsler().filter(function(j){return j.id==id})[0]};
ORV.zpAktif=function(){return OB.zIsler().filter(function(j){return j.durum=='aktif'}).length};
OB.zKaydet=function(){if(typeof save=='function')save();OB.pbZaman()};

// ---------- Çalıştırma ----------
OB.zEylem=function(j){var k=TODAY,s='',sor=false;
 if(j.eylem=='echo-gun'){var L=lim(k);if(!L)s='Bugün iş günü değil';else{var t=typ(k),top=tot(k);if(!top){s='Bugün için kayıt yok';sor=true}else if(t=='hata'){s='Veri hatası · '+dk(Math.abs(cap(k)-top))+' dk '+(top>cap(k)?'fazla':'eksik');sor=true}else s='Bugün tamam · '+dk(top)+' dk'}
  if(sor)OB.bildir({kanal:'Görev',baslik:'Echo: '+s,alt:'İş Günleri › Günlük',git:'gunluk'})}
 else if(j.eylem=='echo-hafta'){var g=OB.haftaGunler(0),top2=0,ek=0;g.forEach(function(x){top2+=tot(x);var ty=typ(x);if(pk(x)<=pk(TODAY)&&(ty=='hata'||ty=='girdi'))ek++});s='Hafta toplamı '+dk(top2)+' dk'+(ek?' · '+ek+' eksik/hatalı gün':'');OB.bildir({kanal:'Görev',baslik:'Echo haftalık özet',alt:s,git:'ozet'})}
 else if(j.eylem=='iris-ilac'){var a=OA.st(),bk=OA.bugunKey(),al=a.ilac.filter(function(i){return !a.ilacAl[bk+'|'+i.id]}).length;s=a.ilac.length?(al?al+' ilaç henüz alınmadı':'Bugünkü ilaçların hepsi alındı'):'İlaç planı girilmedi';if(al)OB.bildir({kanal:'Görev',baslik:'Iris: '+s,alt:'Ailem › Sağlık',git:'saglik'})}
 else if(j.eylem=='sheets'){if(CONNECTED&&typeof shReadAll=='function'&&typeof SH!='undefined'&&SH.st&&SH.st.map){shReadAll();s='Sheets okunuyor'}else s='Sheets bağlı değil'}
 else{var g2=tmTaskNew(j.kim,j.ad,'normal','',j.kim!='orin');s='Görev verildi'+(g2?'':'')}
 return s};
OB.zCalistir=function(id,oto){var j=OB.zBul(id);if(!j)return false;var s;try{s=OB.zEylem(j)}catch(e){s='Hata: '+e.message}
 j.son=Date.now();j.sonSonuc=s;var S0=OB.zSt();S0.gecmis.unshift({id:j.id,ad:j.ad,ts:j.son,s:s,oto:!!oto});if(S0.gecmis.length>60)S0.gecmis.length=60;
 if(j.tekrar=='bir'&&oto)j.durum='beklet';
 if(!oto)OB.bildir({kanal:'Sistem',baslik:j.ad+' çalıştırıldı',alt:s});
 OB.zKaydet();OB.zYenile();return true};
OB.zVade=function(j,n){n=n||new Date();if(j.durum!='aktif')return false;var hm=String(j.saat||'00:00').split(':'),slot=new Date(n);slot.setHours(+hm[0]||0,+hm[1]||0,0,0);if(n<slot)return false;var w=n.getDay();
 if(j.tekrar=='hi'&&(w==0||w==6))return false;if(j.tekrar=='pz'&&w!=0)return false;
 if(j.tekrar=='bir')return !j.son&&(!j.tarih||j.tarih<=ymd(n));
 return !j.son||new Date(j.son)<slot};
OB.zTick=function(){var n=new Date(),c=0;OB.zIsler().slice().forEach(function(j){if(OB.zVade(j,n)){OB.zCalistir(j.id,true);c++}});return c};
if(!SMOKE()){setInterval(OB.zTick,30000);setTimeout(OB.zTick,6000)}

// ---------- Panel ----------
OB.zp={form:false,geri:null,f:{ad:'',kim:'echo',saat:'00:00',tekrar:'gun'},er:''};
function zSatir(j,i){var c=(typeof tm=='function'&&tm(j.kim))||{ad:j.kim},bek=j.durum!='aktif';
 return '<div class="ob-zi'+(bek?' bek':'')+'" data-z="'+esc(j.id)+'" style="animation-delay:'+(i*.05)+'s"><div class="r">'+OA.imgAv(j.kim,'oa-av','width:34px;height:34px')+'<span class="tx"><b>'+esc(j.ad)+'</b><small>'+esc(c.ad)+' · '+esc(OB.zTekrarMetin(j))+' · '+esc(j.saat)+'</small><small>'+(bek?'Bekletildi':'Aktif')+' · son: '+(j.son?esc(OA.tarihSaat(j.son))+(j.sonSonuc?' · '+esc(j.sonSonuc):''):'—')+'</small></span><span class="oa-kp '+(bek?'o':'g')+'">'+(bek?'Bekletildi':'Aktif')+'</span></div>'+
 '<div class="b"><button type="button" class="ob-zb" onclick="OB.zCal(\''+jq(j.id)+'\')">'+ORV.svg('simsek',14,2.2)+'Şimdi çalıştır</button><button type="button" class="ob-zb" onclick="OB.zTog(\''+jq(j.id)+'\')">'+ORV.svg(bek?'oynat':'durdur',14,2.2)+(bek?'Sürdür':'Beklet')+'</button><button type="button" class="ob-zb r" onclick="OB.zKaldir(\''+jq(j.id)+'\')">'+ORV.svg('cop',14,2.2)+'Kaldır</button></div></div>'}
ORV.zpIcerik=function(){var L=OB.zIsler(),z=OB.zp,f=z.f,ls=(typeof tmAll=='function'?tmAll():[]).filter(function(c){return !c.sil});
 var h='<div class="ob-zp" id="obZp">';
 if(z.geri)h+='<div class="ob-zk" role="status"><span>“'+esc(z.geri.j.ad)+'” kaldırıldı</span><button type="button" class="ob-zb" onclick="OB.zGeriAl()">Geri al</button></div>';
 h+=L.length?L.map(zSatir).join(''):'<div class="orv-bos-kutu">'+ORV.svg('kronometre',34,1.8)+'<b>Zamanlanmış iş yok</b>Aşağıdan yeni iş ekleyebilirsin.</div>';
 h+=z.form?'<div class="ob-zf" id="obZf"><b style="font-size:13px">Yeni zamanlanmış iş</b><label>Ad<input id="obZa" type="text" placeholder="Örn. Sabah kontrolü" value="'+esc(f.ad)+'" oninput="OB.zp.f.ad=this.value"></label><label>Çalışan<select id="obZk" onchange="OB.zp.f.kim=this.value">'+ls.map(function(c){return '<option value="'+esc(c.id)+'"'+(f.kim==c.id?' selected':'')+'>'+esc(c.ad)+'</option>'}).join('')+'</select></label><div class="g2"><label>Saat<input id="obZs" type="time" value="'+esc(f.saat)+'" onchange="OB.zp.f.saat=this.value"></label><label>Tekrar<select id="obZt" onchange="OB.zp.f.tekrar=this.value">'+TEK.map(function(x){return '<option value="'+x[0]+'"'+(f.tekrar==x[0]?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></label></div>'+(z.er?'<span style="color:#fca5a5;font-size:12px" role="alert">'+esc(z.er)+'</span>':'')+'<div style="display:flex;gap:8px"><button type="button" class="ob-zb" onclick="OB.zForm(false)">Vazgeç</button><button type="button" class="ob-zb" style="background:var(--acc);border-color:transparent;color:#fff" onclick="OB.zEkle()">Ekle</button></div></div>':'<button type="button" class="ob-zb" style="align-self:flex-start;height:36px;padding:0 14px" onclick="OB.zForm(true)">'+ORV.svg('ekle',14,2.4)+'Yeni iş</button>';
 return h+'<span class="oa-sub">Saatler İstanbul saatidir. Varsayılan saat 00:00.</span></div>'};
OB.zYenile=function(){var e=document.getElementById('orvZpIc');if(e)e.innerHTML=ORV.zpIcerik();var s=document.querySelector('#orvZp .zh small');if(s)s.textContent=ORV.zpAktif()+' aktif · İstanbul saati';if(typeof ORV.navGuncelle=='function')ORV.navGuncelle()};
OB.zCal=function(id){OB.zCalistir(id,false)};
OB.zTog=function(id){var j=OB.zBul(id);if(!j)return;j.durum=j.durum=='aktif'?'beklet':'aktif';OB.zKaydet();OB.zYenile()};
OB.zKaldir=function(id){var L=OB.zIsler(),i=L.map(function(j){return j.id}).indexOf(id);if(i<0)return;OB.zKesin();var j=L.splice(i,1)[0];OB.zp.geri={j:j,i:i,t:setTimeout(function(){OB.zp.geri=null;OB.zYenile()},4000)};OB.zKaydet();OB.zYenile()};
OB.zKesin=function(){var g=OB.zp.geri;if(g){clearTimeout(g.t);OB.zp.geri=null}};
OB.zGeriAl=function(){var g=OB.zp.geri;if(!g)return;clearTimeout(g.t);OB.zp.geri=null;OB.zIsler().splice(Math.min(g.i,OB.zIsler().length),0,g.j);OB.zKaydet();OB.zYenile()};
OB.zForm=function(v){OB.zp.form=!!v;OB.zp.er='';OB.zYenile()};
OB.zEkle=function(){var f=OB.zp.f,ad=String(f.ad).trim();if(!ad){OB.zp.er='İşe bir ad ver';OB.zYenile();return false}if(!/^([01]?\d|2[0-3]):[0-5]\d$/.test(f.saat||'')){OB.zp.er='Saati 00:00 gibi gir';OB.zYenile();return false}
 var n=new Date(),hm=f.saat.split(':'),slot=new Date(n);slot.setHours(+hm[0],+hm[1],0,0);var tarih=f.tekrar=='bir'?ymd(n<slot?n:new Date(+n+864e5)):undefined;
 var j={id:'z'+Date.now().toString(36),ad:ad,kim:f.kim,saat:(hm[0].length<2?'0':'')+f.saat,tekrar:f.tekrar,durum:'aktif',eylem:'gorev',son:null};if(tarih)j.tarih=tarih;OB.zIsler().push(j);OB.zp.f={ad:'',kim:f.kim,saat:'00:00',tekrar:'gun'};OB.zp.form=false;OB.zp.er='';OB.zKaydet();OB.zYenile();return true};

// ========================================================================
// POCKETBASE (mevcut oturum; ana süreç pb.js liste/yaz) — şema değişmez
// ========================================================================
OB.pbSt=function(){if(!S.orvPb)S.orvPb={};var b=S.orvPb;b.kuyruk=b.kuyruk||[];b.imza=b.imza||{};b.hata=b.hata||[];if(!b.bas)b.bas=Date.now();return b};
OB.pbD={d:null,t:0,gorev:null,gt:0,mesgul:false,son:0};
OB.pbHazir=function(){return !!(window.API&&API.pb&&API.pb.yaz&&API.pb.liste)};
OB.pbDurumAl=function(zorla){if(!window.API||!API.pb)return Promise.resolve(null);if(!zorla&&OB.pbD.d&&Date.now()-OB.pbD.t<20000)return Promise.resolve(OB.pbD.d);
 return API.pb.durum().then(function(r){OB.pbD.d=r&&r.ok?r.v:null;OB.pbD.t=Date.now();return OB.pbD.d},function(){return null})};
OB.pbId=function(x){var s=String(x||'').toLowerCase().replace(/[^a-z0-9]/g,'');while(s.length<15)s+=(s.length*7%36).toString(36);return s.slice(0,15)};
OB.pbEsle={acik:'bekliyor',calisiyor:'yapiliyor',bitti:'bitti'};
OB.pbGorevVeri=function(g){var tr=function(t){return t?new Date(t).toISOString().replace('T',' '):''};return{baslik:String(g.metin||g.baslik||'').slice(0,80),metin:String(g.metin||''),atanan_kod:g.kim,durum:OB.pbEsle[g.durum]||'bekliyor',oncelik:g.onc=='acil'?'acil':'normal',kaynak:'orvane',zaman:tr(g.ts),sonuc:g.sonuc?String(g.sonuc).slice(0,4000):'',eski_id:g.id}};
OB.pbYaz=function(k,id,veri){var b=OB.pbSt(),i=b.kuyruk.map(function(x){return x.k+'|'+x.id}).indexOf(k+'|'+id);var o={k:k,id:id,veri:veri,ts:Date.now()};if(i>=0)b.kuyruk[i]=o;else b.kuyruk.push(o);if(typeof save=='function')save();OB.pbAkit()};
OB.pbZaman=function(){var j=OB.zIsler().map(function(x){return{id:x.id,ad:x.ad,kim:x.kim,saat:x.saat,tekrar:x.tekrar,durum:x.durum,eylem:x.eylem,son:x.son||null,tarih:x.tarih||null}});OB.pbYaz('ayarlar','zamanlanmisisle',{anahtar:'zamanlanmis_isler',deger:{isler:j,guncel:Date.now()}})};
// Yeni (bu sürümden sonraki) ve imzası değişen görevleri kuyruğa alır
OB.pbTara=function(){var b=OB.pbSt(),n=0;TMS().gorev.forEach(function(g){if(!g.id||(g.ts||0)<b.bas&&!b.imza[g.id])return;var im=[g.durum,g.sonuc?String(g.sonuc).length:0,g.bts||0].join('|');if(b.imza[g.id]==im)return;b.imza[g.id]=im;
  var q=b.kuyruk.map(function(x){return x.k+'|'+x.id}).indexOf('gorevler|'+OB.pbId(g.id));var o={k:'gorevler',id:OB.pbId(g.id),veri:OB.pbGorevVeri(g),ts:Date.now()};if(q>=0)b.kuyruk[q]=o;else b.kuyruk.push(o);n++});return n};
OB.pbAkit=function(){if(!OB.pbHazir()||OB.pbD.mesgul||(typeof tmOnline=='function'&&!tmOnline()))return Promise.resolve(0);var b=OB.pbSt();OB.pbTara();if(!b.kuyruk.length)return Promise.resolve(0);
 OB.pbD.mesgul=true;var say=0;
 function sonraki(){var o=b.kuyruk[0];if(!o){OB.pbD.mesgul=false;b.son=Date.now();if(typeof save=='function')save();return say}
  return API.pb.yaz({k:o.k,id:o.id,veri:o.veri}).then(function(r){if(r&&r.ok){b.kuyruk.shift();say++;return sonraki()}
   var m=(r&&r.err)||'hata';if(/ulaşılam|oturum|giriş|401|403/i.test(m)){OB.pbD.mesgul=false;OB.pbD.hata=m;return say}
   b.kuyruk.shift();b.hata.unshift({k:o.k,id:o.id,m:m,ts:Date.now()});if(b.hata.length>20)b.hata.length=20;return sonraki()},function(){OB.pbD.mesgul=false;return say})}
 return sonraki()};
OB.pbBekleyen=function(){return OB.pbSt().kuyruk.length};
OB.pbOku=function(zorla){if(!OB.pbHazir())return Promise.resolve(null);if(!zorla&&OB.pbD.gorev&&Date.now()-OB.pbD.gt<60000)return Promise.resolve(OB.pbD.gorev);
 return API.pb.liste({k:'gorevler',adet:40,sirala:'-zaman'}).then(function(r){if(r&&r.ok){OB.pbD.gorev=r.v;OB.pbD.gt=Date.now()}return OB.pbD.gorev},function(){return null})};
OB.pbGorevKart=function(){var L=OB.pbD.gorev;if(!L||!L.length)return '';var yerel={};TMS().gorev.forEach(function(g){yerel[OB.pbId(g.id)]=1});
 var A=L.filter(function(x){return !yerel[x.id]&&x.durum!='bitti'&&x.durum!='iptal'}).slice(0,8);if(!A.length)return '';
 return OA.kart(OA.hd(OA.ico('linear-gradient(160deg,#5fe0f5,#3b82f6)','bulut'),'Sunucudaki görevler',OA.kp('PocketBase','n')),'<div class="ob-kan">'+A.map(function(x){var c=(typeof tm=='function'&&tm(x.atanan_kod))||{ad:x.atanan_kod};return '<div class="ob-kc"><div class="ob-r">'+OA.imgAv(x.atanan_kod,'oa-av','width:32px;height:32px')+'<span class="ob-ad"><b>'+esc(c.ad)+'</b></span><span class="ob-et">'+esc(x.kaynak||'sunucu')+'</span></div><p>'+esc(String(x.baslik||x.metin||'').slice(0,160))+'</p><span class="oa-sub">'+esc(x.durum||'')+'</span></div>'}).join('')+'</div>',.2)};
if(!SMOKE()){setInterval(function(){OB.pbAkit()},60000);setTimeout(function(){OB.pbDurumAl(true).then(function(){OB.pbAkit()})},8000);if(window.API&&API.pb&&API.pb.degisti)API.pb.degisti(function(d){OB.pbD.d=d;OB.pbD.t=Date.now();if(d&&d.girisli)OB.pbAkit()})}

})();
