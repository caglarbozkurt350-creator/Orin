// Orin · Sheets'e yazma kuyruğu (Aşama 3). Kuyruk kalıcıdır; internet yokken bekler, gelince gönderilir.
var Q=[],DR={},SYN={busy:false,last:null,err:''};
var IZL={yillik:'Yıllık izin',ucretsiz:'Ücretsiz izin',rapor13:'Rapor',rapor4:'Rapor (4. gün ve sonrası)',mazeret:'Mazeret izni',refakat:'Refakat izni',sevk:'İş yeri sevki'};
var PSO=['Başlandı','Devam ediyor','Bitti','Teslim edildi','Başkası devam ediyor'];
var PHEAD=['Proje kodu','Proje adı','Durum'],INFOTAB='Ayarlar ve Bilgiler';
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function dstr(k){var a=k.split('-');return ('0'+a[2]).slice(-2)+'.'+('0'+a[1]).slice(-2)+'.'+a[0]}
function recOf(k,e){return{tarih:dstr(k),kod:e.k,parca:e.pn||'',is:e.i,dk:e.d}}
function fpRec(k,r){return [k,String(r.kod).trim(),String(r.is).trim(),String(parseMin(r.dk))].join('|')}
function findE(u){for(var k in E){var a=E[k]||[];for(var i=0;i<a.length;i++)if(a[i].u==u)return{k:k,i:i,e:a[i]}}return null}
function qOf(u){return Q.filter(function(o){return o.u==u})[0]||null}
function enq(op){
// aynı hedefe bekleyen eski işlemleri birleştir
if(op.op=='info'||op.op=='pup'||op.op=='pdel')Q=Q.filter(function(o){return !(o.op==op.op&&o.key==op.key&&!o.conflict)});
if(op.op=='dset')Q=Q.filter(function(o){return !(o.op=='dset'&&o.k==op.k&&!o.conflict)});
if(op.op=='upd'&&Q.some(function(o){return o.u==op.u&&(o.op=='add'||o.op=='upd')&&!o.conflict}))return;
op.id=uid();op.t=Date.now();Q.push(op);save();syncLabel();flushSoon()}
// ---- Kayıt yaşam döngüsü ----
function entryAdded(k,e){e.u=e.u||uid();if(e.st)enq({op:'add',u:e.u,k:k})}
function entryApproved(k,e){e.st=1;if(e.row)enq({op:'upd',u:e.u,k:k});else if(!qOf(e.u))enq({op:'add',u:e.u,k:k})}
function entryEdited(k,e){if(S.onay){e.st=0;return}e.st=1;if(e.row)enq({op:'upd',u:e.u,k:k});else if(!qOf(e.u))enq({op:'add',u:e.u,k:k})}
function entryRemoved(e){if(!e)return;Q=Q.filter(function(o){return o.u!=e.u||o.conflict});if(e.row)enq({op:'del',row:e.row,fp:e.fp,lab:e.k+' · '+e.i});else{save();syncLabel()}}
function dayTypeChanged(k){enq({op:'dset',k:k})}
function projChanged(code){enq({op:'pup',key:code})}
function projRemoved(code){Q=Q.filter(function(o){return !(o.op=='pup'&&o.key==code)});enq({op:'pdel',key:code})}
function infoChanged(title){enq({op:'info',key:title})}
function setChanged(){infoChanged('Orin ayarları (otomatik)')}
function settingsText(){return 'Pzt–Per '+S.w1+' dk · Cuma '+S.w2+' dk · Hafta sonu çalışması '+(S.cts?'açık':'kapalı')+' · Yıllık izin hakkı '+S.hak+' gün, kullanılan '+S.kul+', devreden '+S.dev+', kalan '+f(kal())+' · Refakat hakkı '+S.ref+' gün/yıl · Rapor ücretli günü '+S.rap+' · Önce onayla '+(S.onay?'açık':'kapalı')+' · Gün toplamı sınırı '+(S.cak?'açık':'kapalı')+' · İşe başlama '+S.hire+(S.sgk?' · SGK giriş '+S.sgk:'')+' · Son güncelleme '+new Date().toLocaleString('tr-TR')}
function planText(){var ks=Object.keys(PL).sort(function(a,b){return pk(a)-pk(b)});return ks.length?(PA=='A'?'En iyi plan':'Yedekli plan')+': '+ks.map(function(k){return dstr(k)+' '+ST[PL[k].s]}).join(', '):'Uygulanmış izin planı yok'}
function projRows(){return allP().map(function(p){return [p[0],p[1],PS[p[0]]||'']})}
// ---- Gönderim ----
var _ft=null;
function flushSoon(){clearTimeout(_ft);_ft=setTimeout(flush,500)}
function canSync(){return !!(API&&API.sheets&&CONNECTED&&navigator.onLine)}
function call(p){return p.then(function(r){if(!r.ok){var er=new Error(r.err);er.offline=/İnternet/.test(r.err);throw er}return r.v})}
function run(o){var S2=API.sheets;
if(o.op=='add'){var f=findE(o.u);if(!f)return Promise.resolve();var rec=recOf(f.k,f.e);return call(S2.add(rec)).then(function(r){var g=findE(o.u);if(g){g.e.row=r.row;g.e.fp=fpRec(g.k,rec);g.e.src='sheets';g.e.st=1}})}
if(o.op=='upd'){var f2=findE(o.u);if(!f2)return Promise.resolve();var rec2=recOf(f2.k,f2.e);if(!f2.e.row)return call(S2.add(rec2)).then(function(r){f2.e.row=r.row;f2.e.fp=fpRec(f2.k,rec2)});
return call(S2.upd({row:f2.e.row,fp:f2.e.fp,rec:rec2,force:o.force})).then(function(r){if(r.conflict){o.conflict=r.current;return}var g=findE(o.u);if(g)g.e.fp=fpRec(g.k,rec2)})}
if(o.op=='del')return call(S2.del({row:o.row,fp:o.fp,force:o.force})).then(function(r){if(r.conflict)o.conflict=r.current});
if(o.op=='dset'){var k=o.k,t=D[k],lb=IZL[t],cur=DR[k];
if(lb){var rec3={tarih:dstr(k),kod:'Standart dışı',parca:'',is:'İşe gidilmedi - '+lb,dk:'?',izin:lb};
if(cur)return call(S2.upd({row:cur.row,fp:cur.fp,rec:rec3,force:o.force})).then(function(r){if(r.conflict){o.conflict=r.current;return}DR[k]={row:cur.row,fp:fpRec(k,rec3)}});
return call(S2.add(rec3)).then(function(r){DR[k]={row:r.row,fp:fpRec(k,rec3)}})}
if(cur)return call(S2.del({row:cur.row,fp:cur.fp,force:o.force})).then(function(r){if(r.conflict){o.conflict=r.current;return}delete DR[k]});return Promise.resolve()}
if(o.op=='pup'){var nm=pname(o.key);if(!nm)return Promise.resolve();return call(S2.upsert({tab:'Projeler',header:PHEAD,key:o.key,values:[nm,PS[o.key]||''],seed:projRows()}))}
if(o.op=='pdel')return call(S2.delKey({tab:'Projeler',key:o.key,width:3}));
if(o.op=='info')return call(S2.upsert({tab:INFOTAB,header:['Başlık','Bilgi'],key:o.key,values:[/izin planı/.test(o.key)?planText():settingsText()]}));
return Promise.resolve()}
function flush(){if(SYN.busy||!Q.length||!canSync())return Promise.resolve();SYN.busy=true;SYN.err='';syncLabel();
var list=Q.filter(function(o){return !o.conflict&&!(o.n>=5)}),i=0;
function step(){if(i>=list.length)return Promise.resolve();var o=list[i++];
return run(o).then(function(){if(!o.conflict)Q=Q.filter(function(x){return x!==o});return step()},function(e){if(e.offline){SYN.err='Çevrimdışı';return}o.err=e.message;o.n=(o.n||0)+1;SYN.err=e.message;return step()})}
return step().then(function(){SYN.busy=false;SYN.last=new Date();save();syncLabel();if(Q.some(function(o){return o.conflict}))toast('Sheets’te değişiklik var: çakışmayı Ayarlar › Google Sheets’ten çöz');if(area=='home'||(area=='set'&&(pg=='baglanti'||pg=='sorun')))render()})}
// Çakışma çözümü
function qForce(id){Q.forEach(function(o){if(o.id==id){o.conflict=null;o.force=true;o.n=0}});save();flush()}
function qDrop(id){Q=Q.filter(function(o){return o.id!=id});save();if(typeof shReadAll=='function')shReadAll();else render()}
function qRetry(){Q.forEach(function(o){o.n=0});flush()}
function qLabel(o){var f=o.u?findE(o.u):null,M={add:'Yeni kayıt',upd:'Kayıt düzenleme',del:'Kayıt silme',dset:'Gün türü',pup:'Proje',pdel:'Proje silme',info:'Ayar'};return M[o.op]+' · '+(f?lab(f.k).split(' ').slice(0,3).join(' ')+' · '+f.e.k+' · '+f.e.i:o.k?lab(o.k).split(' ').slice(0,3).join(' '):(o.key||o.lab||''))}
function qList(){if(!Q.length)return '<div class="hn">Bekleyen gönderim yok'+(SYN.last?' · son eşitleme '+SYN.last.toLocaleTimeString('tr-TR'):'')+'</div>';
return Q.map(function(o){return '<div class="kr"><div>'+esc(qLabel(o))+'<div class="hn">'+(o.conflict?'<span style="color:#f4a3a3">Sheets’te bu satır değişmiş: '+esc((o.conflict||[]).filter(String).join(' | ')||'boş')+'</span>':o.err?'Hata: '+esc(o.err)+(o.n>=5?' · durduruldu':''):'Sırada')+'</div></div>'+(o.conflict?'<span style="display:flex;gap:6px"><button class="bt" onclick="qDrop(\''+o.id+'\')">Sheets’tekini al</button><button class="bt d" onclick="qForce(\''+o.id+'\')">Benimkini yaz</button></span>':'')+'</div>'}).join('')+'<div style="margin-top:8px"><button class="bt" onclick="qRetry()">Şimdi gönder</button></div>'}
window.addEventListener('online',function(){syncLabel();flush()});window.addEventListener('offline',syncLabel);
setInterval(function(){if(Q.length)flush()},60000);
