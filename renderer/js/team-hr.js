// Orvane · İnsan Kaynakları: kart ızgarası, kimlik kartı penceresi, doğrudan görev, yeni çalışan
var HRM=null;
function hrCard(c){return '<div class="kc" id="k_'+esc(c.id)+'" onclick="hrOpen(\''+jq(c.id)+'\')" title="'+esc(c.ad+' · '+c.gorev)+'">'+(c.kart?'<img src="../'+esc(c.kart)+'" alt="'+esc(c.ad)+'" loading="lazy">':hrBlank(c))+'</div>'}
function hrBlank(c){return '<div class="kx" style="background:linear-gradient(160deg,'+c.renk+'55,#1e1e21 62%)">'+av(c,72)+esc(c.ad)+'<small>'+esc(c.gorev)+'</small><small style="opacity:.7">Kart görseli yok</small></div>'}
function hrPage(){var A=tmAll(),M=A.filter(function(c){return c.grup=='yonetim'}),T=A.filter(function(c){return c.grup!='yonetim'}),g=TMS().gel,ik=g.filter(function(x){return x.asama=='ik'}).length,ceo=g.filter(function(x){return x.asama=='ceo'}).length;
return '<div class="hrh">'+av(tm('nika'),52)+'<div style="flex:1;min-width:0"><div class="en">İnsan Kaynakları</div><div class="es">Departman müdürü Nika · '+A.length+' çalışan kartı · karta tıkla, ayrıntıyı gör</div></div><button class="bt" onclick="hrPdf()"><i class="ti ti-download"></i> Tümünü PDF indir</button><button class="bt p" onclick="hrNew()"><i class="ti ti-user-plus"></i> Yeni çalışan</button></div>'+
(ik||ceo?'<div class="inf" style="margin-top:14px;cursor:pointer" onclick="nav(\'team\',\'calisan\',\''+(ik?'nika':'orin')+'\')"><i class="ti ti-sparkles"></i><div>Gelişim talepleri: '+ik+' İK incelemesinde (Nika) · '+ceo+' CEO onayında (Orin)</div></div>':'')+
'<div class="gs"><i class="ti ti-crown"></i>Yönetim <span>· '+M.length+'</span></div><div class="kg">'+M.map(hrCard).join('')+'</div>'+
'<div class="gs"><i class="ti ti-users"></i>Ekip <span>· '+T.length+'</span></div><div class="kg">'+T.map(hrCard).join('')+'<div class="kn" onclick="hrNew()"><i class="ti ti-plus"></i>Yeni çalışan kartı<span style="font-size:11.5px">Nika oluşturur</span></div></div>'}
function hrOpen(id,mode){HRM={id:id,mode:mode||'mesaj'};hrDraw()}
function hrDraw(){var c=tm(HRM.id);if(!c)return hrClose();var el=document.getElementById('hrm');
if(!el){el=document.createElement('div');el.id='hrm';el.className='mo2';el.addEventListener('mousedown',function(e){if(e.target===el)hrClose()});document.getElementById('app').appendChild(el)}
var ch=tmChain(c).map(function(n,i){var x=tmByName(n);return (i?'<i class="ti ti-chevron-right"></i> ':'')+(x?av(x,20,false)+' ':'')+esc(n)}).join(' ');
var seg='<span class="md"><span class="'+(HRM.mode=='mesaj'?'on':'')+'" onclick="HRM.mode=\'mesaj\';hrDraw()"><i class="ti ti-message-circle"></i> Mesaj</span><span class="'+(HRM.mode=='gorev'?'on':'')+'" onclick="HRM.mode=\'gorev\';hrDraw()"><i class="ti ti-bolt"></i> Doğrudan görev</span></span>';
var body=HRM.mode=='gorev'?'<div class="dm" style="padding:10px 12px">'+seg+tmTaskForm(c).replace(/^<div class="dm">/,'').replace(/<\/div>$/,'')+'</div>':
'<div>'+seg+'</div><div class="blk"><b>Hayat hikâyesi</b>'+(c.hikaye?esc(c.hikaye):'<span class="hn">Hikâye henüz yazılmadı. Burada birinci ağızdan, bir sayfalık otobiyografi görünecek. Profil › Hayat hikâyesi’nden yazabilirsin.</span>')+'</div>'+
'<div class="blk"><b>Bu hafta</b>'+tmDoneWeek(c.id).length+' görev bitti · '+tmOpen(c.id).length+' açık · token: yapay zekâ bağlı değil</div>'+
'<div class="blk" style="display:flex;gap:8px;align-items:center;padding:6px 6px 6px 14px"><input id="hrq" placeholder="'+esc(c.ad)+'’ya mesaj yaz…" style="flex:1;background:transparent;border:none;outline:none;color:#fff;font-size:13.5px" onkeydown="if(event.key==\'Enter\')hrMsg()"><button class="snd" onclick="hrMsg()" title="Gönder"><i class="ti ti-arrow-up"></i></button></div>';
el.innerHTML='<div class="mdl">'+(c.kart?'<img src="../'+esc(c.kart)+'" alt="">':'<div class="kxx" style="overflow:hidden">'+hrBlank(c)+'</div>')+'<div class="mdr"><h3>'+av(c,40)+esc(c.ad)+'<i class="ti ti-x x" title="Kapat (Esc)" onclick="hrClose()"></i></h3>'+
'<div class="blk"><b>Bağlı olduğu</b><div class="chn">'+ch+'</div></div>'+body+
'<div style="display:flex;gap:8px;margin-top:auto"><button class="bt'+(HRM.mode=='mesaj'?' p':'')+'" style="flex:1" onclick="hrGo(\''+jq(c.id)+'\')"><i class="ti ti-arrow-right"></i> Sayfasına git</button><button class="bt" onclick="hrEdit(\''+jq(c.id)+'\')"><i class="ti ti-pencil"></i> Düzenle</button></div></div></div>'}
function hrClose(){var el=document.getElementById('hrm');if(el)el.remove();HRM=null}
function hrGo(id){hrClose();nav('team','calisan',id)}
function hrEdit(id){hrClose();nav('team','calisan',id);TMTAB='prof';render()}
function hrMsg(){var e=document.getElementById('hrq'),t=e&&e.value.trim();if(!t)return;var id=HRM.id;hrClose();nav('team','calisan',id);tmSend(id,t,tmOnline()?'mesaj':'not')}
document.addEventListener('keydown',function(e){if(e.key=='Escape'&&HRM){hrClose()}},true);
// Yeni çalışan (kart görseli olmadan; kartı programın çizmesi sonraki sürümde)
function hrNew(){var A=tmAll(),o=document.getElementById('ov');o.innerHTML='<div class="dl" style="max-width:440px;width:440px"><div style="color:#fff;font-size:16px;font-weight:600">Yeni çalışan</div><div class="hn">Nika kaydı oluşturur. Kart görseli sonraki sürümde program tarafından çizilecek.</div><div class="pf" style="display:block;margin:6px 0 0">'+
'<label>Ad</label><input type="text" id="nwa" placeholder="ör. Nova"><label>Görev</label><input type="text" id="nwg" placeholder="ör. Fatura ve belge takibi">'+
'<label>Grup</label><select id="nwr"><option value="ekip">Ekip</option><option value="yonetim">Yönetim</option></select>'+
'<label>Bağlı olduğu</label><select id="nwb">'+['Çağlar'].concat(A.map(function(c){return c.ad})).map(function(n){return '<option'+(n=='Orla'?' selected':'')+'>'+esc(n)+'</option>'}).join('')+'</select>'+
'<label>Renk</label><input type="color" id="nwc" value="#5bb8ff"></div><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="bt" onclick="cfNo()">Vazgeç</button><button class="bt p" onclick="hrNewOk()">Oluştur</button></div></div>';o.style.display='flex';setTimeout(function(){var e=document.getElementById('nwa');if(e)e.focus()},30)}
function hrNewOk(){var ad=document.getElementById('nwa').value.trim(),g=document.getElementById('nwg').value.trim();if(!ad||!g){toast('Ad ve görev gerekli');return}if(tmByName(ad)){toast('Bu adla bir çalışan var');return}
var id='c'+uid();tmSet(id,{yeni:1,ad:ad,gorev:g,grup:document.getElementById('nwr').value,bagli:document.getElementById('nwb').value,renk:document.getElementById('nwc').value,grafikler:[]});cfNo();toast(ad+' eklendi');nav('team','calisan',id)}
// Bütün kartlar tek PDF (her sayfada 2 kart)
function hrPdf(){if(!API||!API.exp){toast('PDF yalnız masaüstü uygulamasında');return}var A=tmAll(),u=function(p){return new URL('../'+p,location.href).href};
var html='<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:"Segoe UI",sans-serif;margin:0;color:#222}h1{font-size:16px;margin:0 0 10px}.g{display:flex;flex-wrap:wrap;gap:14px}.k{width:46%;page-break-inside:avoid;text-align:center;font-size:11px;color:#555}.k img{width:100%;border-radius:10px}.b{border:1px dashed #aaa;border-radius:10px;aspect-ratio:800/1440;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:14px}</style></head><body><h1>Orvane · Çalışan kartları ('+A.length+')</h1><div class="g">'+
A.map(function(c){return '<div class="k">'+(c.kart?'<img src="'+u(c.kart)+'">':'<div class="b"><b>'+esc(c.ad)+'</b>'+esc(c.gorev)+'</div>')+'<div>'+esc(c.ad)+' · '+esc(c.gorev)+'</div></div>'}).join('')+'</div></body></html>';
API.exp.pdf({name:'Orvane çalışan kartları.pdf',html:html}).then(function(r){if(r&&r.ok)toast('PDF kaydedildi');else if(r&&r.err)toast('PDF hatası: '+r.err)})}
