// ========================================================================
// Orvane 0.9.12 · Aile Bütçesi kural denetimi (SALT OKUNUR). Hiçbir değeri değiştirmez; yalnız bulguları listeler.
// Hem uygulamada (Aylık Bütçe › Dashboard uyarısı, smoke testleri) hem de Node ile durum.json kopyası üzerinde çalışır.
// Girdi: st = durum.json'daki S nesnesi ({finans:{kayit}, orvA:{bak}, bordro:{aylar}}), bugunAy = 'YYYY-AA'.
// Kurallar (KARARLAR.md › 6):
//  1. Aylık gelir, Bordro Net Ödenen'i geçemez; tek istisna SGK Rapor Ödeneği (üst sınır = Net Ödenen + SGK ödeneği).
//     Maaş ertesi ayın 5'inde yatar: gelir ayı A'nın sınırı, A−1 ayının bordrosundan gelir.
//  2. Bakiye bildirimi: bildirilen tutar gelir yazılmaz; yalnız beklenenle farkı kayıt dışı olur.
//  3. Geçmiş aylar net 0 (banka dökümü kuralı).
// ========================================================================
var BKD=(typeof window!='undefined'&&window.BKD)||{};
(function(){
var r2=function(n){return Math.round((+n||0)*100)/100};
var ayK=function(t){return String(t||'').slice(0,7)};
BKD.ayKay=function(ay,d){var x=new Date(+ay.slice(0,4),+ay.slice(5,7)-1+d,1);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')};
BKD.KASA={aile:1,cagla:1,kubra:1};
BKD.maas=function(k){return k&&k.tur=='gelir'&&(/^br\d{4}-\d{2}$/.test(k.id||'')||/^Maaş/i.test(k.kalem||''))};
BKD.sgk=function(k){return k&&k.tur=='gelir'&&/SGK/i.test((k.kalem||'')+' '+(k.not||''))};
BKD.kdGelir=function(k){return k&&k.tur=='gelir'&&(k.kaynak=='bakiye'||/^Kayıt dışı gelir/.test(k.kalem||''))};
BKD.kisisel=function(st){return ((st&&st.finans&&st.finans.kayit)||[]).filter(function(k){return k&&k.kim!='sirket'})};
// Gelir ayı → {bordroAy, net, sgk, sinir}; o ay için bordro yoksa null
BKD.sinir=function(st,ay){var bAy=BKD.ayKay(ay,-1),m=((st&&st.bordro&&st.bordro.aylar)||[]).filter(function(x){return x&&x.ay==bAy})[0];
 if(!m||!m.v||!(+m.v.net>0))return null;var net=r2(m.v.net),sgk=r2(m.v.sgkOdenek);return{ay:ay,bordroAy:bAy,net:net,sgk:sgk,sinir:r2(net+sgk)}};
BKD.ayToplam=function(st,ay){var g=0,c=0;BKD.kisisel(st).forEach(function(k){if(ayK(k.tarih)!=ay)return;if(k.tur=='gelir')g+=+k.tutar||0;else c+=+k.tutar||0});return{gelir:r2(g),gider:r2(c),net:r2(g-c)}};
// Bir kaydın bakiyeye etkisi zaten işlenmiş mi (orv-sayfa-a3.js OA.kayitKasa ile aynı mantık)
BKD.kasa=function(st,r){var B=(st&&st.orvA&&st.orvA.bak)||{},c=st&&st.orvA&&st.orvA.cep||{};if(!r||r.kim=='sirket'||r.bakDus||r.bakEk)return null;
 if(r.hk=='c')return 'cagla';if(r.hk=='e')return c.e===0&&B.aile?'aile':'kubra';return B.aile?'aile':'cagla'};
// 0.9.12 kuralı: içe aktarılan banka kayıtları ve geçmiş ay kayıtları bakiye bildiriminde sayılmaz (orv-butce-kural.js OA.kayitKasa)
BKD.sayilmaz=function(r,bugunAy){return r.kaynak=='banka'||(!!bugunAy&&ayK(r.tarih)<bugunAy)};
BKD.ozet=function(k){return{id:k.id,tarih:k.tarih,tur:k.tur,kalem:k.kalem,tutar:r2(k.tutar),kaynak:k.kaynak||'',not:String(k.not||'').slice(0,80)}};

// Döner: [{kod, ay?, mesaj, tutar?, kayitlar:[ozet]}] — kod: gelir-siniri | cift-maas | maas-bag | bildirim-gelir | gecmis-net | bekleyen | kasa | kurus | negatif | cift-id
BKD.denetle=function(st,bugunAy){var B=[],K=BKD.kisisel(st),aylar={},bak=(st&&st.orvA&&st.orvA.bak)||{},BRA=(st&&st.bordro&&st.bordro.aylar)||[];
 K.forEach(function(k){var a=ayK(k.tarih);if(/^\d{4}-\d{2}$/.test(a))aylar[a]=1});
 Object.keys(aylar).sort().forEach(function(ay){var s=BKD.sinir(st,ay),T=BKD.ayToplam(st,ay),G=K.filter(function(k){return k.tur=='gelir'&&ayK(k.tarih)==ay});
  // 1) Gelir sınırı
  if(s&&T.gelir>s.sinir+0.005){var sup=G.filter(function(k){return !(/^br\d{4}-\d{2}$/.test(k.id||'')&&k.id=='br'+s.bordroAy)&&!(BKD.sgk(k)&&s.sgk>0)});
   B.push({kod:'gelir-siniri',ay:ay,tutar:r2(T.gelir-s.sinir),mesaj:ay+' geliri '+r2(T.gelir)+' ₺; sınır '+r2(s.sinir)+' ₺ ('+s.bordroAy+' bordrosu Net '+s.net+(s.sgk?' + SGK '+s.sgk:'')+'). Aşım '+r2(T.gelir-s.sinir)+' ₺.',kayitlar:sup.map(BKD.ozet)})}
  // Çift maaş: aynı ayda birden fazla maaş geliri
  var M=G.filter(BKD.maas);if(M.length>1)B.push({kod:'cift-maas',ay:ay,tutar:r2(M.reduce(function(n,k){return n+(+k.tutar||0)},0)),mesaj:ay+' ayında '+M.length+' maaş geliri var.',kayitlar:M.map(BKD.ozet)});
  // 3) Geçmiş aylar net 0
  if(bugunAy&&ay<bugunAy&&Math.abs(T.net)>=0.01)B.push({kod:'gecmis-net',ay:ay,tutar:T.net,mesaj:ay+' kapanmış ay ama net '+T.net+' ₺ (gelir '+T.gelir+', gider '+T.gider+').',kayitlar:[]})});
 // Bordro ↔ maaş kaydı bağı
 BRA.forEach(function(m){var b=m&&m.butce;if(!b)return;var r=K.filter(function(k){return k.id==b.id})[0];
  if(!r)B.push({kod:'maas-bag',ay:m.ay,mesaj:m.ay+' bordrosu Aile Bütçesine eklenmiş görünüyor ama maaş kaydı ('+b.id+') yok.',kayitlar:[]});
  else{if(Math.abs((+r.tutar||0)-(+b.t||0))>=0.01)B.push({kod:'maas-bag',ay:m.ay,mesaj:m.ay+' maaş kaydı '+r.tutar+' ₺, bordro bağlantısı '+b.t+' ₺.',kayitlar:[BKD.ozet(r)]});
   if(b.bak&&!BKD.KASA[r.bakEk])B.push({kod:'maas-bag',ay:m.ay,mesaj:m.ay+' maaşı bakiyeye işlenmiş ama kayıtta işaret (bakEk) yok; sonraki bakiye bildiriminde ikinci kez sayılabilir.',kayitlar:[BKD.ozet(r)]})}
  if(m.v&&+m.v.net>0&&Math.abs(+m.v.net-(+b.t||0))>=0.01)B.push({kod:'maas-bag',ay:m.ay,mesaj:m.ay+' bordro Net Ödenen '+m.v.net+' ₺ ama Aile Bütçesine '+b.t+' ₺ eklenmiş.',kayitlar:[]})});
 // 2) Bildirilen tutarın tamamı gelir yazılmış (beklenen 0)
 K.filter(function(k){return BKD.kdGelir(k)}).forEach(function(k){var bek=(String(k.not||'').match(/beklenen\s+([\d.,]+)/)||[])[1];var sifir=bek!=null&&+String(bek).replace(/\./g,'').replace(',','.')===0;
  B.push({kod:'bildirim-gelir',ay:ayK(k.tarih),tutar:r2(k.tutar),mesaj:'Bakiye bildiriminden kayıt dışı GELİR yazılmış'+(sifir?' (beklenen 0 ₺: bildirilen tutarın tamamı gelir oldu)':'')+'.',kayitlar:[BKD.ozet(k)]})});
 // Sonraki bakiye bildiriminde hesaba katılacak (işlenmemiş) kayıtlar
 var bek={},eski={};K.forEach(function(r){var k=BKD.kasa(st,r);if(!k||!bak[k])return;var bas=bak[k].bts||bak[k].ts||0;if((+r.ts||0)<=bas)return;if(BKD.sayilmaz(r,bugunAy))(eski[k]=eski[k]||[]).push(r);else (bek[k]=bek[k]||[]).push(r)});
 Object.keys(eski).forEach(function(k){var L=eski[k],net=r2(L.reduce(function(n,r){return n+(r.tur=='gelir'?1:-1)*(+r.tutar||0)},0));
  B.push({kod:'bekleyen-eski',mesaj:L.length+' içe aktarılmış / geçmiş ay kaydı '+k+' bakiyesinden sonra eklenmiş. 0.9.11 bunları sonraki bildirimde beklenen bakiyeye '+net+' ₺ olarak katardı; 0.9.12 saymaz.',tutar:net,kayitlar:L.map(BKD.ozet)})});
 Object.keys(bek).forEach(function(k){var L=bek[k],net=r2(L.reduce(function(n,r){return n+(r.tur=='gelir'?1:-1)*(+r.tutar||0)},0));
  B.push({kod:'bekleyen',mesaj:L.length+' kayıt '+k+' bakiyesine işlenmemiş; sonraki bildirimde beklenen bakiyeye '+net+' ₺ eklenecek'+(L.some(function(r){return r.kaynak=='banka'})?' (içe aktarılan banka kayıtları da var: bunlar zaten bakiyenin içinde olmalı)':'')+'.',tutar:net,kayitlar:L.map(BKD.ozet)})});
 // Aile Bütçesi = iki cep + kalan; kalan eksiye düşmemeli
 if(bak.aile){var kal=r2(bak.aile.t-(bak.cagla?bak.cagla.t:0)-(bak.kubra?bak.kubra.t:0));if(kal<0)B.push({kod:'kasa',tutar:kal,mesaj:'Aile Bütçesi ('+bak.aile.t+') iki cebin toplamından küçük; kalan '+kal+' ₺.',kayitlar:[]})}
 Object.keys(bak).forEach(function(k){if(bak[k]&&+bak[k].t<0)B.push({kod:'negatif',tutar:r2(bak[k].t),mesaj:k+' bakiyesi eksi: '+bak[k].t+' ₺.',kayitlar:[]})});
 K.forEach(function(k){if(Math.abs((+k.tutar||0)*100-Math.round((+k.tutar||0)*100))>1e-6)B.push({kod:'kurus',mesaj:'Tutar kuruştan küçük basamak taşıyor: '+k.tutar,kayitlar:[BKD.ozet(k)]})});
 var ids={};K.forEach(function(k){if(ids[k.id])B.push({kod:'cift-id',mesaj:'Aynı kimlikle iki kayıt: '+k.id,kayitlar:[BKD.ozet(k)]});ids[k.id]=1});
 return B};
if(typeof module!='undefined'&&module.exports)module.exports=BKD;
if(typeof window!='undefined')window.BKD=BKD;
})();
