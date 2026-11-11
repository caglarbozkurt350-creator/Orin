// Orvane 0.7.2 · İK Müdürü Nika'nın grafikleri (hepsi çoktan aza sıralı)
// 1) Çalışan gelişimi  2) Alanlara göre yeni çalışan ihtiyacı  3) Alanlara göre token verimliliği
var ALAN={orin:'Yönetim',orla:'Yönetim',nika:'Yönetim',echo:'İş ve kalite',vera:'İş ve kalite',luca:'İş ve kalite',otto:'Ev ve aile',marco:'Ev ve aile',mia:'Ev ve aile',iris:'Sağlık',ada:'Yazılım',remy:'Planlama',sage:'Araştırma',cleo:'İletişim',kai:'Teknik'};
var ALANLAR=['Yönetim','İş ve kalite','Ev ve aile','Sağlık','Yazılım','Planlama','Araştırma','İletişim','Teknik','Diğer'];
function alanOf(c){return (c&&(c.alan||ALAN[c.id]))||'Diğer'}
function ikIht(){var T=TMS();T.ihtiyac=T.ihtiyac||[];return T.ihtiyac}
function ikAlanBul(t){t=String(t||'').trim().toLocaleLowerCase('tr');for(var i=0;i<ALANLAR.length;i++){var a=ALANLAR[i].toLocaleLowerCase('tr');if(t==a||t.indexOf(a)>=0||a.indexOf(t)>=0&&t.length>2)return ALANLAR[i]}return 'Diğer'}
// Yatay sıralı çubuk grafiği: satır = [etiket, [parça değerleri], [renkler], sağ yazı, ipucu]
function gHBar(rows,mx){var W=260,R=17,L=78,H=rows.length*R+4,s='<svg viewBox="0 0 '+W+' '+H+'" class="ch">';mx=mx||1;
rows.forEach(function(r,i){var y=i*R+2,x=L,tot=0;s+='<text x="0" y="'+(y+11)+'">'+esc(String(r[0]).slice(0,13))+'</text>';
r[1].forEach(function(v,j){var w=Math.max(0,v/mx*(W-L-34));if(w>0)s+='<rect x="'+x+'" y="'+(y+2)+'" width="'+w+'" height="11" rx="3" fill="'+r[2][j]+'"><title>'+esc(r[4]||'')+'</title></rect>';x+=w;tot+=v});
s+='<text x="'+(x+4)+'" y="'+(y+11)+'">'+esc(r[3]!=null?r[3]:String(tot))+'</text>'});return '<div class="iksc">'+s+'</svg></div>'}
function ikLeg(a){return '<div class="hn" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:2px">'+a.map(function(x){return '<span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:'+x[1]+';margin-right:4px"></i>'+esc(x[0])+'</span>'}).join('')+'</div>'}

// 1) Gelişim: onaylanan gelişim (beceri + hafıza) sayısı, eşitlikte bekleyen talepler
function ikGelisimVeri(){var g=TMS().gel;return tmAll().map(function(c){var m=g.filter(function(x){return x.kim==c.id});
return{id:c.id,ad:c.ad,renk:c.renk,onay:m.filter(function(x){return x.asama=='tamam'}).length,bek:m.filter(function(x){return x.asama=='ik'||x.asama=='ceo'}).length,haf:tmMem(c.id).length}})
.sort(function(a,b){return b.onay-a.onay||b.bek-a.bek||b.haf-a.haf||a.ad.localeCompare(b.ad,'tr')})}
GRF.ikGelisim=function(){var d=ikGelisimVeri();if(!d.some(function(x){return x.onay||x.bek}))return{t:'Çalışan gelişimi',s:'en çoktan en aza',none:'Henüz gelişim talebi yok'};
var mx=Math.max.apply(null,d.map(function(x){return x.onay+x.bek}))||1;
return{t:'Çalışan gelişimi',s:'onaylı gelişim',h:gHBar(d.map(function(x){return[x.ad,[x.onay,x.bek],[x.renk||'#2f7bf5','#5a5a62'],x.onay+(x.bek?' +'+x.bek:''),x.onay+' onaylı, '+x.bek+' bekleyen gelişim']}),mx)+ikLeg([['Onaylı','#2f7bf5'],['Onay bekleyen','#5a5a62']])}};

// 2) Yeni çalışan ihtiyacı: açık bildirimler, acil 2 puan, normal 1 puan
function ikIhtiyacVeri(){var m={};ikIht().filter(function(x){return x.durum!='kapandi'}).forEach(function(x){var a=m[x.alan]||(m[x.alan]={alan:x.alan,acil:0,normal:0});if(x.onc=='acil')a.acil++;else a.normal++});
return Object.keys(m).map(function(k){var a=m[k];a.puan=a.acil*2+a.normal;return a}).sort(function(a,b){return b.puan-a.puan||b.acil-a.acil||a.alan.localeCompare(b.alan,'tr')})}
GRF.ikIhtiyac=function(){var d=ikIhtiyacVeri();if(!d.length)return{t:'Yeni çalışan ihtiyacı',s:'alanlara göre',none:'Henüz ihtiyaç bildirilmedi'};
var mx=Math.max.apply(null,d.map(function(x){return x.puan}))||1;
return{t:'Yeni çalışan ihtiyacı',s:'acil ×2 puan',h:gHBar(d.map(function(x){return[x.alan,[x.acil*2,x.normal],['#ff6b5b','#ffb35b'],String(x.acil+x.normal),x.acil+' acil, '+x.normal+' normal']}),mx)+ikLeg([['Acil','#ff6b5b'],['Normal','#ffb35b']])}};

// 3) Token verimliliği: bu ay alan başına 10 bin token'da üretilen iş (yapay zekâ cevabı + görev sonucu)
function ikVerimVeri(){var s=ZK.st,k=s&&s.harcama&&s.harcama.kisi||{},t=pk(TODAY),ay0=+new Date(t.getFullYear(),t.getMonth(),1),m={};
tmAll().forEach(function(c){var tok=(k[c.id]&&k[c.id].token)||0;if(!tok)return;var is=tmChat(c.id).filter(function(x){return x.r=='o'&&x.model&&x.ts>=ay0}).length,a=alanOf(c),o=m[a]||(m[a]={alan:a,token:0,is:0});o.token+=tok;o.is+=is});
return Object.keys(m).map(function(a){var o=m[a];o.verim=o.is/(o.token/10000);return o}).sort(function(a,b){return b.verim-a.verim||b.is-a.is})}
GRF.ikVerim=function(){var s=ZK.st;if(!s||!s.anahtar)return{t:'Token verimliliği',s:'alanlara göre',none:'Yapay zekâ bağlı değil'};var d=ikVerimVeri();if(!d.length)return{t:'Token verimliliği',s:'alanlara göre',none:'Bu ay henüz token harcanmadı'};
var mx=Math.max.apply(null,d.map(function(x){return x.verim}))||1;
return{t:'Token verimliliği',s:'iş / 10 bin token',h:gHBar(d.map(function(x){return[x.alan,[x.verim],['#3ec98a'],(Math.round(x.verim*10)/10).toLocaleString('tr-TR'),x.is+' iş · '+fmtTok(x.token)+' token']}),mx)}};

// Nika'nın sayfası ve İK sayfası
var _ikCh=tmCharts;tmCharts=function(c){if(c.id=='nika'&&!(c.grafikler&&c.grafikler.length))c=Object.assign({},c,{grafikler:['ikGelisim','ikIhtiyac','ikVerim']});return _ikCh(c)};
var _ikHr=hrPage;hrPage=function(){var h=_ikHr(),i=h.indexOf('<div class="gs">');var k='<div class="gs"><i class="ti ti-chart-bar"></i>Nika’nın grafikleri <span>· çoktan aza</span><button class="bt" style="margin-left:auto;min-height:30px;padding:4px 12px" onclick="ikIhtForm()"><i class="ti ti-user-search"></i> İhtiyaç bildir</button></div>'+tmCharts(tm('nika'));return i>=0?h.slice(0,i)+k+h.slice(i):h+k};

// İhtiyaç bildirimi: elle (İK sayfası) ya da çalışanın cevabındaki [[İHTİYAÇ: alan | acil/normal | gerekçe]] satırından
function ikIhtEkle(alan,onc,gerekce,kimden){var o={id:uid(),alan:ikAlanBul(alan),onc:/acil/i.test(onc||'')?'acil':'normal',gerekce:String(gerekce||'').slice(0,300),kimden:kimden||'cagla',ts:Date.now(),durum:'acik'};ikIht().push(o);save();return o}
var IHT_RE=/\[\[\s*[İI]HT[İI]YA[ÇC]\s*:([^\]]*)\]\]/gi;
function ikIhtAyikla(id,t){var n=[];t=String(t||'').replace(IHT_RE,function(all,ic){var p=ic.split('|');n.push(ikIhtEkle(p[0],p[1],p.slice(2).join('|').trim(),id));return ''}).replace(/\n{3,}/g,'\n\n').trim();return{t:t,n:n}}
var _ikPush=tmPush;tmPush=function(id,m){if(m&&m.r=='o'&&m.model&&IHT_RE.test(m.t||'')){IHT_RE.lastIndex=0;var r=ikIhtAyikla(id,m.t);m.t=r.t;if(r.n.length)m.t+='\n\n('+r.n.map(function(x){return x.alan+' alanına '+(x.onc=='acil'?'acil ':'')+'yeni çalışan ihtiyacı bildirildi'}).join('; ')+' · İK grafiğine eklendi)'}IHT_RE.lastIndex=0;return _ikPush(id,m)};
var _ikSis=zekaSistem;zekaSistem=function(c){return _ikSis(c)+'Bir alanda iş yükü ya da beceri eksikliği yüzünden yeni bir çalışana gerçekten ihtiyaç görürsen cevabının sonuna ayrı bir satırda şunu ekle: [[İHTİYAÇ: alan | acil ya da normal | kısa gerekçe]]. Alanlar: '+ALANLAR.slice(0,-1).join(', ')+'. Gerek yoksa ekleme. Senin alanın: '+alanOf(c)+'.\n'};
function ikIhtForm(){var o=document.getElementById('ov');o.innerHTML='<div class="dl"><div style="color:#fff;margin-bottom:10px">Yeni çalışan ihtiyacı bildir</div><div style="display:flex;flex-direction:column;gap:8px"><select id="iha" class="in" style="width:100%;text-align:left">'+ALANLAR.map(function(a){return '<option>'+a+'</option>'}).join('')+'</select><select id="iho" class="in" style="width:100%;text-align:left"><option value="normal">Normal</option><option value="acil">Acil</option></select><input id="ihg" class="in" style="width:100%;text-align:left" placeholder="Kısa gerekçe (ör. Yazılım işleri birikiyor)"></div><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button class="bt" onclick="cfNo()">Vazgeç</button><button class="bt p" onclick="ikIhtGonder()">Bildir</button></div></div>';o.style.display='flex'}
function ikIhtGonder(){var a=document.getElementById('iha').value,o=document.getElementById('iho').value,g=document.getElementById('ihg').value.trim();ikIhtEkle(a,o,g,'cagla');cfNo();toast(a+' alanına ihtiyaç bildirildi');render()}

// Testler (yalnız smoke): geçici veriyle sıralama ve etiket ayıklama, sonra eski veri geri konur
window.__ikTest=function(){var R=[],T=TMS(),bk={gel:T.gel.slice(),iht:(T.ihtiyac||[]).slice(),st:ZK.st,ch:JSON.stringify(T.sohbet)};function t(n,ok,m){R.push({n:n,ok:!!ok,m:ok?'':String(m||'beklenmeyen sonuç')})}
try{T.gel=[{kim:'ada',asama:'tamam'},{kim:'ada',asama:'tamam'},{kim:'ada',asama:'ik'},{kim:'echo',asama:'tamam'},{kim:'echo',asama:'tamam'},{kim:'sage',asama:'tamam'},{kim:'sage',asama:'red'}];
var g=ikGelisimVeri();t('Gelişim çoktan aza',g[0].id=='ada'&&g[1].id=='echo'&&g[2].id=='sage',g.slice(0,3).map(function(x){return x.id+':'+x.onay}).join(' '));t('Reddedilen gelişim sayılmaz',g[2].onay==1&&g[2].bek==0);
T.ihtiyac=[];ikIhtEkle('Yazılım','normal','a');ikIhtEkle('Yazılım','normal','b');ikIhtEkle('Sağlık','acil','c');ikIhtEkle('Sağlık','acil','d');ikIhtEkle('Ev ve aile','normal','e');
var d=ikIhtiyacVeri();t('İhtiyaç: öncelikli alan önde',d[0].alan=='Sağlık'&&d[0].puan==4&&d[1].alan=='Yazılım'&&d[2].alan=='Ev ve aile',d.map(function(x){return x.alan+':'+x.puan}).join(' '));
var r=ikIhtAyikla('ada','Tamam.\n[[İHTİYAÇ: yazılım | acil | testler birikiyor]]');t('Cevaptaki ihtiyaç etiketi ayıklanır',r.t=='Tamam.'&&r.n[0].alan=='Yazılım'&&r.n[0].onc=='acil',JSON.stringify(r));
tmPush('ada',{r:'o',t:'Bitti [[IHTIYAC: Araştırma | normal | kaynak taraması]]',model:'claude-haiku-5-5'});var son=tmChat('ada').slice(-1)[0];t('Sohbette etiket görünmez, ihtiyaç kaydedilir',!/\[\[/.test(son.t)&&ikIht().some(function(x){return x.alan=='Araştırma'}),son.t);
t('Sistem istemi ihtiyaç kuralını içerir',/\[\[İHTİYAÇ:/.test(zekaSistem(tm('ada'))));
ZK.st={anahtar:true,butce:5,harcama:{usd:1,kisi:{ada:{usd:.1,token:20000},echo:{usd:.1,token:10000},otto:{usd:.1,token:40000}},gun:{}},aylar:{}};T.sohbet={};var now=Date.now();
['ada','ada','echo','echo','echo','otto'].forEach(function(id){tmPush(id,{r:'o',t:'x',model:'m',ts:now})});
var v=ikVerimVeri();t('Token verimi çoktan aza',v[0].alan=='İş ve kalite'&&v[0].verim==3&&v[1].alan=='Yazılım'&&v[1].verim==1&&v[2].alan=='Ev ve aile',v.map(function(x){return x.alan+':'+x.verim}).join(' '));
nav('team','ik');var h=document.getElementById('ct').innerHTML;t('İK sayfasında üç grafik',/Çalışan gelişimi/.test(h)&&/Yeni çalışan ihtiyacı/.test(h)&&/Token verimliliği/.test(h)&&(h.match(/<svg/g)||[]).length>=3);
nav('team','calisan','nika');h=document.getElementById('ct').innerHTML;t('Nika sayfasında grafikler',/Çalışan gelişimi/.test(h)&&/Token verimliliği/.test(h));
}catch(e){t('İK grafik testi',false,e.stack)}
T.gel=bk.gel;T.ihtiyac=bk.iht;ZK.st=bk.st;T.sohbet=JSON.parse(bk.ch);save();nav('home','gun',TODAY);return R};
