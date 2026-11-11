// Orvane · sesli sohbet arayüzü. Ses tanıma ve sese çevirme servisi henüz bağlı değil; klavyeyle konuşulabilir.
var VC=null;
function hexA(h,a){h=String(h||'#3f7bff').replace('#','');if(h.length==3)h=h.split('').map(function(x){return x+x}).join('');var n=parseInt(h,16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'}
function voiceOpen(id){var c=tm(id);if(!c||VC)return;var mic=document.getElementById('tmmic'),r=mic?mic.getBoundingClientRect():null,still=(typeof MO!='undefined'&&MO.reduced);
var el=document.createElement('div');el.id='vc';el.className='vc'+(still?' still':'')+(S.mspeed=='yavas'?' slow':'');el.style.setProperty('--vc',c.renk);el.style.setProperty('--vg',hexA(c.renk,.22));
el.innerHTML='<div class="vcb"></div><div class="vtop" id="vtop">Sesli sohbet · '+esc(c.ad)+' · 00:00</div><div class="vcc" id="vcc" style="animation:none"><div class="vph"><span class="vr r1"></span><span class="vr r2"></span><span class="vr r3"></span>'+(c.foto?'<img src="../'+esc(c.foto)+'" alt="">':av(c,300))+'</div>'+
'<div class="vnm">'+esc(c.ad)+'</div><div class="vst" id="vst"></div><div class="vtx" id="vtx"></div><div class="vnote" id="vnote">Ses servisi henüz seçilmedi. Klavye düğmesiyle yazarak konuşabilirsin; sohbet bitince yazılı hâli '+esc(c.ad)+'’nın geçmişine kaydedilir.</div>'+
'<div class="vbtn"><span id="vmic" title="Mikrofonu kapat" onclick="voiceMute()"><i class="ti ti-microphone-off"></i></span><span id="vkb" title="Klavyeye geç" onclick="voiceKb()"><i class="ti ti-keyboard"></i></span><span title="Görev olarak gönder" onclick="voiceTask()"><i class="ti ti-bolt"></i></span><span class="end" title="Bitir" onclick="voiceEnd()"><i class="ti ti-phone-off"></i></span></div></div>';
document.getElementById('app').appendChild(el);
// FLIP: fotoğraf mikrofonun olduğu noktadan büyüyerek gelir
var cc=document.getElementById('vcc'),b=cc.getBoundingClientRect();if(r){cc.style.setProperty('--dx',Math.round(r.left+r.width/2-(b.left+b.width/2))+'px');cc.style.setProperty('--dy',Math.round(r.top+r.height/2-(b.top+b.height/2))+'px')}
void cc.offsetWidth;cc.style.animation='';
VC={id:id,c:c,t0:Date.now(),mute:false,log:[],spk:0};VC.tm=setInterval(voiceTick,1000);voiceState()}
function voiceTick(){if(!VC)return;var s=Math.floor((Date.now()-VC.t0)/1000),e=document.getElementById('vtop');if(e)e.textContent='Sesli sohbet · '+VC.c.ad+' · '+('0'+Math.floor(s/60)).slice(-2)+':'+('0'+s%60).slice(-2)}
function voiceBars(){return '<span class="vbars"><i></i><i></i><i></i><i></i><i></i></span>'}
function voiceState(){var el=document.getElementById('vc');if(!el||!VC)return;el.classList.toggle('spk',!!VC.spk);document.getElementById('vst').innerHTML=VC.mute?'<i class="ti ti-microphone-off"></i> Mikrofon kapalı':VC.spk?voiceBars()+' '+esc(VC.c.ad)+' konuşuyor':voiceBars()+' '+(VC.kb?'Yazmanı bekliyorum…':'Dinliyorum… <span class="hn">(ses servisi bağlı değil)</span>')}
function voiceMute(){VC.mute=!VC.mute;document.getElementById('vmic').classList.toggle('on',VC.mute);voiceState()}
function voiceKb(){VC.kb=!VC.kb;document.getElementById('vkb').classList.toggle('on',VC.kb);voiceDraw();voiceState();if(VC.kb)setTimeout(function(){var i=document.getElementById('vin');if(i)i.focus()},30)}
function voiceDraw(p){var x=document.getElementById('vtx');if(!x||!VC)return;var l=VC.log[VC.log.length-1],h='';
if(l){h='<span class="yu">Sen: “'+esc(l.ben)+'”</span>';if(l.o!=null)h+='<br>'+tmFmt(p!=null?l.o.slice(0,p):l.o);else if(!VC.spk)h+='<br><span class="yu">Cevap için yapay zekâ bağlantısı gerekiyor; mesajın kaydedilecek.</span>'}
if(VC.kb)h+='<br><input id="vin" placeholder="Söylemek istediğini yaz, Enter’a bas" onkeydown="if(event.key==\'Enter\')voiceSay(this.value)">';x.innerHTML=h;if(VC.kb){var i=document.getElementById('vin');if(i)i.focus()}}
function voiceSay(t){t=String(t||'').trim();if(!t||!VC)return;var r=tmReply(VC.c,t),l={ben:t,o:r?r.t:null};VC.log.push(l);if(!r){voiceDraw();return}
VC.spk=1;voiceState();var n=0,len=l.o.length,still=document.getElementById('vc').classList.contains('still');(function step(){if(!VC)return;n+=still?len:3;voiceDraw(Math.min(n,len));if(n<len)setTimeout(step,18);else setTimeout(function(){if(VC){VC.spk=0;voiceState();voiceDraw()}},700)})()}
function voiceTask(){var l=VC&&VC.log[VC.log.length-1];if(!l){toast('Önce görevi söyle ya da klavyeyle yaz');return}tmTaskNew(VC.id,l.ben,'normal','',VC.id!='orin');toast('Görev olarak '+VC.c.ad+'’ya gönderildi')}
function voiceEnd(){if(!VC)return;var v=VC,s=Math.floor((Date.now()-v.t0)/1000);clearInterval(v.tm);VC=null;
if(v.log.length){tmPush(v.id,{r:'sys',t:'Sesli sohbet · '+('0'+Math.floor(s/60)).slice(-2)+':'+('0'+s%60).slice(-2)});v.log.forEach(function(l){var m={r:'ben',t:l.ben,tur:'ses'};if(l.o==null)m.bek=1;tmPush(v.id,m);if(l.o!=null)tmPush(v.id,{r:'o',t:l.o})})}
var el=document.getElementById('vc');if(!el)return;el.classList.add('out');setTimeout(function(){el.remove();if(area=='team')render()},el.classList.contains('still')?10:360)}
document.addEventListener('keydown',function(e){if(e.key=='Escape'&&VC){e.stopPropagation();voiceEnd()}},true);
