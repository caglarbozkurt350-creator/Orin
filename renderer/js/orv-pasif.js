// ========================================================================
// PASİF EKİP (0.8.3) — yapay zekâ kapalıyken (manuel mod) ekip üyeleri arka plana çekilir.
// Tasarım: Claude Design "pasif ekip" (zemin, cam kartlar, yazı tipleri ve 6 tema aynı; yalnız persona izleri nötrleşir).
// Yapay zekâ açılınca (Merkez › Ayarlar › Yapay zekâ) eski görünüm aynen döner; hiçbir özellik silinmez.
// ========================================================================
ORV.pasif=function(){return typeof yzKapali=='function'&&yzKapali()};
// Persona → işlev simgesi (avatar yerine)
OA.ISLEV={otto:['linear-gradient(160deg,#ff9ad4,#e14fa0)','para'],iris:['linear-gradient(160deg,#c4b5fd,#7c3aed)','nabiz'],marco:['linear-gradient(160deg,#fda4af,#e11d48)','sepet'],nerya:['linear-gradient(160deg,#f9a8d4,#db2777)','canta'],
 mia:['linear-gradient(160deg,#ff9ad4,#e14fa0)','kalp'],remy:['linear-gradient(160deg,#5fe0f5,#3b82f6)','takvim'],sage:['linear-gradient(160deg,#7cf096,#16a34a)','ara'],orin:['linear-gradient(160deg,#ffc24a,#ff7a2f)','ev']};
(function(){var _av=OA.imgAv;OA.imgAv=function(id,cls,st){if(!ORV.pasif())return _av(id,cls,st);var f=OA.ISLEV[id]||['linear-gradient(160deg,#6b6b72,#45454b)','kisi'];
 return '<span class="'+(cls||'oa-av')+' oa-isl" style="display:inline-flex;align-items:center;justify-content:center;background:'+f[0]+';border-radius:32%;'+(st||'')+'" aria-hidden="true">'+ORV.svg(f[1],18,2.1)+'</span>'}})();
// Ailem başlığı: Mia yerine Ailem simgesi, sayfaya göre alt başlık, nötr eylemler
OA.AILE_ALT={butce:'Gelir, gider ve bakiyeler · elle girilen kayıtlar',saglik:'İlaç planı ve ölçümler · elle girilen kayıtlar',market:'Haftalık menü ve market listesi',satinalma:'Satın alma önerileri ve kararlar',evisleri:'Ev işleri ve aile takvimi'};
(function(){var _ab=OA.aiBas;OA.aiBas=function(id,dolu){if(!ORV.pasif())return _ab(id,dolu);
 var ek=id=='saglik'?'<button type="button" class="oa-btn ghost sm" onclick="ORV.git0(\'ilac\')">'+ORV.svg('nabiz',16,2)+'İlaç Planı</button>':'';
 return OA.baslik('Ailem',esc(OA.AILE_ALT[id]||'Aile kayıtları')+' · Kübra da kullanır <span class="oa-pill '+(dolu?'g':'o')+'"><span class="oa-sw" style="background:'+(dolu?'#3ecf5a':'#f5a524')+'"></span>'+(dolu?'Gerçek veri':'Veri bekleniyor')+'</span>',
  '<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">'+OA.sekmeler(OA.AILE_TABS||[],id,'OA.aiGit')+'<div class="oa-araclar">'+ek+'<button type="button" class="oa-btn ghost sm" onclick="nav(\'cal\',\'takvim\',\'\')">'+ORV.svg('takvim',16,2)+'Takvime ekle</button></div></div>',
  ORV.ikon('kalp',{renk:['#ff9ad4','#e14fa0']}))}})();
// Persona metinleri → nötr metin (yalnız pasif modda, sayfa çıktısına uygulanır)
OA.PASIF_METIN=[
 [/<button[^>]*onclick="(?:OA\.hyAc|OA\.menuOner|OA\.neryaIste|OA\.gonder)\([^"]*"[^>]*>[\s\S]*?<\/button>/g,''],
 [/ · (?:Otto|Iris|Marco|Nerya|Mia|Remy|Sage|Orin)(?=<|')/g,''],
 [/Otto’nun özeti/g,'Ay özeti'],[/>Finans U\.</g,'>Kayıtlardan<'],
 [/<li>Kur tahminlerim[^<]*<\/li>/g,''],
 [/Otto tahmin üretince görünür/g,'Tahmin verisi girilince görünür'],[/Otto bekleniyor/g,'Veri bekleniyor'],
 [/ · Sage araştırır · Otto tahmin eder/g,''],[/Sage araştırır · Otto tahmin eder/g,'Kaynak: TCMB / Truncgil'],
 [/Otto’ya kayıt girilince dolar/g,'kayıt girilince dolar'],[/Otto kayıtları/g,'manuel kayıtlar'],[/Otto’ya kaydedildi/g,'Kaydedildi'],
 [/; Iris bir daha sormaz\./g,'; bir daha sorulmaz.'],[/ Iris tanı koymaz, doz önermez\./g,' Plan tanı koymaz, doz önermez.'],
 [/Boş kutuya tıkla ya da Marco’dan öneri iste\./g,'Boş kutuya tıkla.'],
 [/Nerya araştırıp önerdiğinde kartlar burada görünür; Sage araştırır, Otto görüş verir\./g,'Öneri kaydettiğinde kartlar burada görünür.'],
 [/Nerya yalnızca önerir;[^<]*/g,'Önerileri sen kaydedersin; son kararı sen verirsin.'],
 [/Nerya’nın notu/g,'Not'],[/Otto’nun görüşü/g,'Bütçe notu'],
 [/; Mia aile takvimiyle birlikte düzenler\./g,'.'],[/Çalışanların eklediği etkinlikler/g,'Eklenen etkinlikler']];
OA.pasifMetin=function(h){if(!ORV.pasif()||typeof h!='string')return h;OA.PASIF_METIN.forEach(function(r){h=h.replace(r[0],r[1])});return h};
['anasayfa','butce','saglik','market','satinalma','evisleri'].forEach(function(id){var d=ORV.sayfalar[id];if(!d||d._pasif)return;var c=d.ciz;d.ciz=function(a){return OA.pasifMetin(c.apply(this,arguments))};d._pasif=1});
// Ekip: pasif modda sade tablo (işlev önce, isim ikinci planda, durum "Kapalı")
(function(){var _ek=OA.ekip;OA.ekip=function(){if(!ORV.pasif())return _ek();var A=OA.hyListe(),f=(OA.ek&&OA.ek.f)||'tum',L=A.filter(function(c){return f=='tum'||OA.bilgi(c).g==f});
 var h='<div class="oa-pg" id="oaEkip">'+OA.baslik('Ekip',A.length+' profil · yapay zekâ kapalı · veriler elle girilir','')+
  '<div class="oa-araclar"><button type="button" class="oa-btn ghost sm" onclick="ORV.git0(\'hiyerarsi\')">'+ORV.svg('agac',16,2)+'Hiyerarşi</button><button type="button" class="oa-btn ghost sm" onclick="OA.ekArac(\'pdf\')">'+ORV.svg('indir',16,2)+'Listeyi PDF indir</button></div>'+
  '<div class="ob-uy oa-pasif-not" role="note">Ekip şu an pasif: program çalışanlar olmadan tam çalışır. Yapay zekâyı açmak için Merkez › Ayarlar › Yapay zekâ.</div>';
 var satir=L.map(function(c){var b=OA.bilgi(c),f2=OA.ISLEV[c.id]||['linear-gradient(160deg,#6b6b72,#45454b)','kisi'];return '<div class="oa-trow"><span class="oa-fsq" aria-hidden="true">'+ORV.svg(f2[1],16,2)+'</span><span><b>'+esc(b.un||c.gorev||'—')+'</b></span><span class="oa-sub">'+esc(c.ad)+'</span><span class="oa-sub">'+esc((OA.DEPAD||{})[b.g]||'')+'</span><span class="oa-kp n">Kapalı</span></div>'}).join('');
 h+=OA.kart(OA.hd('','Profiller',OA.kp(L.length+' kişi','n')),'<div class="oa-tbl2"><div class="oa-trow oa-thd"><span></span><span>İşlev</span><span>Profil</span><span>Bölüm</span><span>Durum</span></div>'+(satir||OA.bos('kisiler','Profil yok'))+'</div>',0);
 return h+'</div>'};if(ORV.sayfalar.ekip)ORV.sayfalar.ekip.ciz=function(){return OA.ekip()}})();
