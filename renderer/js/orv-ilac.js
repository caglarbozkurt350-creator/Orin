// ========================================================================
// GÜNLÜK İLAÇ PLANI (0.8.3) — Ailem › İlaç Planı. Veri Sağlık sayfasıyla ortak: S.orvA.ilac / S.orvA.ilacAl.
// Bugünün saat dilimlerine göre listesi, "Alındı" işareti (0.9.3: gecikme işareti yok, yalnız alındı/alınmadı), son 7 gün uyum tablosu, ekle/düzelt/kaldır.
// Tanı koymaz, doz önermez; yalnız kullanıcının girdiği planı izler.
// ========================================================================
var IP={ui:{duz:'',er:'',ok:''}};
IP.DILIM=[['sabah','Sabah','05:00','11:00','linear-gradient(160deg,#fde68a,#f59e0b)','gunes'],['ogle','Öğle','11:00','16:00','linear-gradient(160deg,#ffc24a,#ff7a2f)','gunes'],['aksam','Akşam','16:00','21:00','linear-gradient(160deg,#c4b0ff,#7c3aed)','ay'],['gece','Gece','21:00','05:00','linear-gradient(160deg,#5fe0f5,#3b82f6)','ay']];
IP.TEKRAR=[['gun','Her gün'],['haftaici','Hafta içi'],['haftasonu','Hafta sonu']];
IP.ACTOK=[['','Fark etmez'],['ac','Aç karnına'],['tok','Tok karnına']];
IP.dk=function(s){var p=String(s||'0:0').split(':');return (+p[0]||0)*60+(+p[1]||0)};
IP.dilim=function(s){var m=IP.dk(s);for(var i=0;i<3;i++)if(m>=IP.dk(IP.DILIM[i][2])&&m<IP.dk(IP.DILIM[i][3]))return IP.DILIM[i][0];return 'gece'};
IP.anahtar=function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
IP.gunde=function(i,d){var w=d.getDay(),t=i.tekrar||'gun';return t=='gun'||(t=='haftaici'&&w>0&&w<6)||(t=='haftasonu'&&(w==0||w==6))};
// Plana giriş günü: eklenme zamanı; eskilerde ilk 'Alındı' kaydı; hiçbiri yoksa bugün (geçmiş günler 'alınmadı' sayılmaz)
IP.basla=function(i){var a=OA.st(),en=i.eklendi||0;if(!en)Object.keys(a.ilacAl).forEach(function(k){var p=k.split('|');if(p[1]==i.id&&(!en||p[0]<IP.anahtar(new Date(en))))en=+new Date(p[0]+'T00:00:00')});return IP.anahtar(new Date(en||Date.now()))};
IP.liste=function(){return OA.st().ilac.slice().sort(function(x,y){return IP.dk(x.saat)-IP.dk(y.saat)})};
IP.bugunL=function(){var d=new Date();return IP.liste().filter(function(i){return IP.gunde(i,d)})};
IP.sayac=function(){var a=OA.st(),bk=OA.bugunKey(),L=IP.bugunL(),al=L.filter(function(i){return a.ilacAl[bk+'|'+i.id]}).length;return{top:L.length,al:al}};
IP.sayfa=function(){var a=OA.st(),U=IP.ui,bk=OA.bugunKey(),L=IP.bugunL(),c=IP.sayac(),simdi=new Date(),sdk=simdi.getHours()*60+simdi.getMinutes();
 var sag=c.top?OA.kp(c.al+' / '+c.top+' alındı',c.al==c.top?'g':'n'):'';
 var h='<div class="oa-pg ip-pg" id="oaIlac">'+OA.baslik('İlaç Planı',(c.top?(c.al==c.top?'Bugünkü ilaçların hepsi alındı':(c.top-c.al)+' ilaç bekliyor'):'Bugün için plan yok')+' · '+esc(lab(bk)),sag);
 if(U.er)h+='<div class="ob-uy" role="alert">'+esc(U.er)+'</div>';if(U.ok)h+='<span class="ob-ok" role="status">'+esc(U.ok)+'</span>';
 // Bugün: saat dilimlerine göre
 var gun=IP.DILIM.map(function(D){var dl=L.filter(function(i){return IP.dilim(i.saat)==D[0]});if(!dl.length)return '';
  return '<div class="ip-dl"><div class="ip-dh">'+OA.ico(D[4],D[5],15)+'<b>'+D[1]+'</b><span class="oa-sub">'+D[2]+'–'+D[3]+'</span></div>'+dl.map(function(i){var t=a.ilacAl[bk+'|'+i.id];
   return '<div class="ip-sr'+(t?' ok':'')+'"><span class="ip-st">'+esc(i.saat)+'</span><span class="ip-ad"><b>'+esc(i.ad)+'</b><span class="oa-sub">'+esc(i.miktar)+(i.actok?' · '+esc((IP.ACTOK.filter(function(x){return x[0]==i.actok})[0]||['',''])[1]):'')+(i.not?' · '+esc(i.not):'')+'</span></span>'+
    '<button type="button" class="oa-pst2'+(t?' ok':'')+'" onclick="OA.ilacTik(\''+jq(i.id)+'\')" aria-pressed="'+(t?'true':'false')+'">'+(t?'Alındı '+OA.saat(t):'Alınmadı')+'</button></div>'}).join('')+'</div>'}).join('');
 var sol=OA.hd(OA.ico('linear-gradient(160deg,#c4b5fd,#7c3aed)','nabiz'),'Bugün',c.top?'<span class="ip-bar" aria-hidden="true"><i style="width:'+Math.round(c.al/c.top*100)+'%"></i></span>':'')+(L.length?gun:OA.bos('nabiz',IP.liste().length?'Bugün için ilaç yok':'Henüz ilaç planı yok',IP.liste().length?'Plandaki ilaçlar bugün tekrarlanmıyor.':'Sağdaki formdan ilacı, miktarı ve saati bir kez gir.',150));
 // Form (ekle / düzelt)
 var e=U.duz?a.ilac.filter(function(x){return x.id==U.duz})[0]:null,v=e||{ad:'',miktar:'',saat:'08:00',tekrar:'gun',actok:'',not:''},
  sec=function(id,L2,val){return '<select class="oa-in" id="'+id+'">'+L2.map(function(x){return '<option value="'+x[0]+'"'+((val||'')==x[0]?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>'};
 var form=OA.hd('',e?'İlacı düzelt':'İlaç ekle','')+'<div class="ob-form"><label class="oa-zl">İlaç<input class="oa-in" id="ipAd" placeholder="İlaç adı" maxlength="60" value="'+esc(v.ad)+'"></label>'+
  '<div class="oa-grid2" style="gap:8px"><label class="oa-zl">Miktar<input class="oa-in" id="ipMk" placeholder="ör. 1 tablet" maxlength="30" value="'+esc(v.miktar)+'"></label><label class="oa-zl">Saat<input class="oa-in" id="ipSa" type="time" value="'+esc(v.saat)+'"></label></div>'+
  '<div class="oa-grid2" style="gap:8px"><label class="oa-zl">Tekrar'+sec('ipTk',IP.TEKRAR,v.tekrar||'gun')+'</label><label class="oa-zl">Kullanım'+sec('ipAt',IP.ACTOK,v.actok)+'</label></div>'+
  '<label class="oa-zl">Not<input class="oa-in" id="ipNt" placeholder="İsteğe bağlı" maxlength="80" value="'+esc(v.not||'')+'"></label>'+
  '<div class="ob-satir"><button type="button" class="oa-btn" style="flex:1;justify-content:center" onclick="IP.kaydet()">'+(e?'Kaydet':'Ekle')+'</button>'+(e?'<button type="button" class="oa-btn ghost" onclick="IP.ui.duz=\'\';IP.ui.er=\'\';ORV.yenile()">Vazgeç</button>':'')+'</div>'+
  '<span class="oa-sub">Plan yalnız senin girdiğin ilaçları izler; tanı koymaz, doz önermez. Dozu hekimine ve prospektüse göre gir.</span></div>';
 // Plan listesi (düzelt / kaldır)
 var tum=IP.liste(),plan=OA.hd('','Tüm plan',OA.kp(tum.length+' ilaç','n'))+(tum.length?'<div class="ob-liste">'+tum.map(function(i){return '<div class="ip-sr"><span class="ip-st">'+esc(i.saat)+'</span><span class="ip-ad"><b>'+esc(i.ad)+'</b><span class="oa-sub">'+esc(i.miktar)+' · '+esc((IP.TEKRAR.filter(function(x){return x[0]==(i.tekrar||'gun')})[0]||['','Her gün'])[1])+'</span></span>'+
   '<button type="button" class="br-ib" onclick="IP.duzenle(\''+jq(i.id)+'\')" aria-label="'+esc(i.ad)+' düzelt" title="Düzelt">✎</button><button type="button" class="br-ib" onclick="OA.ilacSil(\''+jq(i.id)+'\')" aria-label="'+esc(i.ad)+' kaldır" title="Kaldır">✕</button></div>'}).join('')+'</div>':'<span class="oa-sub">Plan boş.</span>');
 // Son 7 gün uyum
 var gunler=[];for(var g=6;g>=0;g--){var d=new Date();d.setDate(d.getDate()-g);gunler.push(d)}
 var GA=['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],topP=0,alP=0;
 var tbl=tum.length?'<div class="ip-7" style="grid-template-columns:minmax(110px,1.6fr) repeat(7,minmax(30px,1fr))"><span></span>'+gunler.map(function(d){return '<span class="oa-sub ip-7h">'+GA[d.getDay()]+'<br>'+d.getDate()+'</span>'}).join('')+
  tum.map(function(i){return '<span class="ip-7a">'+esc(i.ad)+'</span>'+gunler.map(function(d){if(!IP.gunde(i,d)||IP.anahtar(d)<IP.basla(i))return '<span class="ip-7c yok" title="Plan dışı">–</span>';var k=IP.anahtar(d),al=a.ilacAl[k+'|'+i.id],bugunMu=k==bk;topP++;if(al)alP++;return '<span class="ip-7c '+(al?'al':bugunMu?'bk':'yok2')+'" title="'+(al?'Alındı '+OA.saat(al):bugunMu?'Bekliyor':'İşaretlenmedi')+'">'+(al?'✓':bugunMu?'·':'✕')+'</span>'}).join('')}).join('')+'</div>':OA.bos('grafik','Veri bekleniyor','İlaç eklenip "Alındı" işaretlendikçe tablo dolar.',120);
 var uyum=OA.hd('','Son 7 gün',topP?OA.kp('%'+Math.round(alP/topP*100)+' uyum',alP==topP?'g':'n'):'')+tbl;
 h+='<div class="oa-grid13">'+OA.kart('',sol,0)+OA.kart('',form,.06)+'</div><div class="oa-grid13">'+OA.kart('',uyum,.1)+OA.kart('',plan,.14)+'</div>';
 return h+'</div>'};
IP.duzenle=function(id){IP.ui.duz=id;IP.ui.er='';IP.ui.ok='';ORV.yenile();setTimeout(function(){var e=document.getElementById('ipAd');if(e)e.focus()},30)};
IP.kaydet=function(){var g=function(id){return ((document.getElementById(id)||{}).value||'').trim()},ad=g('ipAd'),mk=g('ipMk'),sa=g('ipSa');
 if(!ad||!mk||!sa){IP.ui.er='İlaç adı, miktar ve saati yaz';IP.ui.ok='';ORV.yenile();return false}
 var o={ad:ad,miktar:mk,saat:sa,tekrar:g('ipTk')||'gun',actok:g('ipAt'),not:g('ipNt')},a=OA.st();
 if(IP.ui.duz){var e=a.ilac.filter(function(x){return x.id==IP.ui.duz})[0];if(e)Object.assign(e,o);IP.ui.ok=ad+' güncellendi'}else{o.id=uid();o.eklendi=Date.now();a.ilac.push(o);IP.ui.ok=ad+' plana eklendi'}
 IP.ui.duz='';IP.ui.er='';OA.kaydet();ORV.yenile();return true};
ORV.sayfa('ilac',{ciz:IP.sayfa,baslik:'Ailem › İlaç Planı'});
