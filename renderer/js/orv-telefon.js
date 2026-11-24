// ========================================================================
// Orvane 0.9.0 · Telefonun yeni 5 sekmeli arayüzü için eşitleme eki.
// Telefona giden özete `aile` bloğu eklenir: bu ay ve geçen ayın kişisel bütçesi (S.finans, Şirket hariç),
// ilaç planı ve alındı işaretleri (S.orvA.ilac / ilacAl), sabah açlık şekeri (S.orvA.seker), TCMB kuru.
// Telefondan gelen yeni olaylar: kayit_duzelt, kayit_sil, izin_sil, ilac_al, ilac_kaydet, ilac_sil, seker.
// Telefondaki karşılığı: mobil/src/lib/ekip.ts → uygula(). Birini değiştirirken ötekini de güncelle.
// ========================================================================
var OT9={DUR:{baslanacak:1,devam:1,bitti:1,beklemede:1}};
OT9.pad=function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
OT9.ay=function(geri){var d=new Date();d=new Date(d.getFullYear(),d.getMonth()-(geri||0),1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
// Kişisel bütçe: bir ayın gelir/gider toplamı, kategoriler ve 5 haftalık dağılım (1–7, 8–14, 15–21, 22–28, 29+)
OT9.butceAy=function(ay){var f=typeof fnS=='function'?fnS():{kayit:[]},r={ay:ay,gelir:0,gider:0,kat:{},hg:[0,0,0,0,0],hc:[0,0,0,0,0]};
 f.kayit.forEach(function(k){if(k.kim=='sirket'||String(k.tarih||'').slice(0,7)!=ay)return;var t=+k.tutar||0,w=Math.min(4,Math.floor(((+String(k.tarih).slice(8,10)||1)-1)/7));
  if(k.tur=='gelir'){r.gelir+=t;r.hg[w]+=t}else{r.gider+=t;r.hc[w]+=t;r.kat[k.kalem||'Diğer']=(r.kat[k.kalem||'Diğer']||0)+t}});
 return r};
OT9.aile=function(){var a=OA.st(),f=typeof fnS=='function'?fnS():{kayit:[],piyasa:{}},bu=OT9.ay(0),once=OT9.ay(1),sin=OT9.pad(new Date(Date.now()-62*864e5)),al={},sk={};
 Object.keys(a.ilacAl||{}).forEach(function(k){if(k.slice(0,10)>=sin)al[k]=1});
 Object.keys(a.seker||{}).forEach(function(k){if(k>=sin)sk[k]=a.seker[k]});
 var islem=f.kayit.filter(function(k){var y=String(k.tarih||'').slice(0,7);return k.kim!='sirket'&&(y==bu||y==once)}).sort(function(x,y){return x.tarih<y.tarih?1:x.tarih>y.tarih?-1:(y.ts||0)-(x.ts||0)}).slice(0,60)
  .map(function(k){return[k.tarih,k.kalem||'Diğer',String(k.not||'').slice(0,60),k.tur=='gelir'?1:0,+k.tutar||0]});
 var p=f.piyasa&&f.piyasa.tcmb;
 return{fin:{bu:OT9.butceAy(bu),once:OT9.butceAy(once),islem:islem},
  ilac:(a.ilac||[]).map(function(i){return{id:i.id,ad:i.ad,miktar:i.miktar||'',saat:i.saat||'',tekrar:i.tekrar||'gun',actok:i.actok||'',not:i.not||'',stok:i.stok==null?null:+i.stok,stokTs:i.stokTs||0,eklendi:i.eklendi||0}}),
  al:al,seker:sk,tcmb:p&&p.kur&&p.kur.usd?{tarih:p.tarih,usd:p.kur.usd.satis,eur:p.kur.eur?p.kur.eur.satis:null}:null}};

// ---------- Özet: aile bloğu + kayıtların durum etiketi ----------
var _ot9Oz=bulutOzet;bulutOzet=function(){var oz=_ot9Oz();try{
 Object.keys(oz.gun).forEach(function(k){var a=E[k]||[];if(!a.some(function(x){return x.du}))return;oz.gun[k].e=a.map(function(x){return x.du?[x.k,x.i,x.d,x.du]:[x.k,x.i,x.d]})});
 oz.aile=OT9.aile()}catch(e){if(window.console)console.warn('[telefon] aile özeti',e)}return oz};

// ---------- Telefondan gelen yeni olaylar ----------
OT9.bul=function(k,es,n){var a=E[k]||[];if(!es)return -1;var es2=function(x){return x&&x.k==es[0]&&x.i==es[1]&&+x.d==+es[2]};if(n!=null&&es2(a[n]))return n;for(var i=0;i<a.length;i++)if(es2(a[i]))return i;return -1};
var _ot9Bu=bulutUygula;bulutUygula=function(e){var v=e.veri||{},a=OA.st();
 if(e.tur=='kayit'){_ot9Bu(e);if(v.du&&OT9.DUR[v.du]){var x=(E[v.k]||[]).filter(function(z){return z.pid==e.id})[0];if(x)x.du=v.du}return}
 if(e.tur=='kayit_duzelt'){var i=OT9.bul(v.k,v.eski,v.n);if(i<0)return;var en=E[v.k][i],y=v.yeni||{};
  if(y.kod)en.k=String(y.kod);if(y.is!=null)en.i=String(y.is);if(+y.dk>0)en.d=+y.dk;if(y.du&&OT9.DUR[y.du])en.du=y.du;else if(y.du==='')delete en.du;entryEdited(v.k,en);return}
 if(e.tur=='kayit_sil'){var j=OT9.bul(v.k,v.eski,v.n);if(j<0)return;var es=E[v.k].splice(j,1)[0];entryRemoved(es);if(!E[v.k].length)delete E[v.k];return}
 if(e.tur=='izin_sil'){if(!v.b)return;var d=pk(v.b),son=pk(v.s||v.b),n=0;if(isNaN(d)||isNaN(son))return;
  while(d<=son&&n<31){var gk=key(d);d.setDate(d.getDate()+1);n++;if(!D[gk]||(v.t&&D[gk]!=v.t&&!(v.t=='rapor13'&&D[gk]=='rapor4')))continue;delete D[gk];dayTypeChanged(gk)}return}
 if(e.tur=='ilac_al'){if(!v.k||!v.id)return;var ak=v.k+'|'+v.id;if(v.al)a.ilacAl[ak]=a.ilacAl[ak]||e.ts||Date.now();else delete a.ilacAl[ak];OA.kaydet();return}
 if(e.tur=='ilac_kaydet'){if(!v.id||!v.ad)return;var o={ad:String(v.ad).slice(0,40),miktar:String(v.miktar||'').slice(0,40),saat:/^\d{1,2}:\d{2}$/.test(v.saat||'')?v.saat:'08:00',tekrar:['gun','haftaici','haftasonu'].indexOf(v.tekrar)>=0?v.tekrar:'gun',actok:v.actok||'',not:String(v.not||'').slice(0,80)};
  if(v.stok!=null&&v.stok!==''){o.stok=Math.max(0,Math.round(+v.stok)||0);o.stokTs=e.ts||Date.now()}
  var m=a.ilac.filter(function(z){return z.id==v.id})[0];if(m)Object.assign(m,o);else{o.id=v.id;o.eklendi=e.ts||Date.now();a.ilac.push(o)}OA.kaydet();return}
 if(e.tur=='ilac_sil'){a.ilac=a.ilac.filter(function(z){return z.id!=v.id});OA.kaydet();return}
 if(e.tur=='seker'){if(!/^\d{4}-\d{2}-\d{2}$/.test(v.k||''))return;a.seker=a.seker||{};var sv=Math.round(+v.v);if(sv>=20&&sv<=600)a.seker[v.k]=sv;else delete a.seker[v.k];OA.kaydet();return}
 return _ot9Bu(e)};
