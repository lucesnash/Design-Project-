'use strict';
/* ---------- live conversation ---------- */
let liveTimers=[],liveBars=null,mic={on:false,timer:null,words:[],line:null};
function stopLive(){liveTimers.forEach(clearInterval);liveTimers=[];if(liveBars){liveBars.destroy();liveBars=null}state.demo=null;state.busy=false;mic.on=false;clearInterval(mic.timer);try{speechSynthesis.cancel()}catch(e){}}
function renderLive(){stopLive();const host=$('#live');state.mode==='signer'?buildSigner(host):buildPartner(host);renderLog()}
function logHTML(){return `<div class="card"><div class="row sp"><span class="lab">Conversation</span><button class="link" id="clear-log" style="padding:0;font-size:13px">Clear session</button></div><div class="log" id="log" role="log" aria-live="polite"></div></div>`}
function renderLog(){const l=$('#log');if(!l)return;
  l.innerHTML=state.convo.length?state.convo.map(m=>m.from==='partner'
    ?`<div class="msg p"><span class="who">Partner · ${m.t}</span><span>${esc(m.text)}</span><small>${emoChip(m.emo,m.hz)}${m.emo?patHTML(m.emo):''}</small></div>`
    :`<div class="msg s"><span class="who">Signer · ${m.t}</span><span>${esc(m.text)}</span><small>via gloves · confidence ${m.conf}%</small></div>`).join(''):`<p class="muted" style="font-size:14px">No messages yet. Play the demo conversation or use the buttons above.</p>`;
  l.scrollTop=l.scrollHeight;const c=$('#clear-log');if(c)c.onclick=()=>{state.convo=[];renderLog();toast('Session cache cleared')}}

function addMsg(m){m.t=nowT();state.convo.push(m);renderLog();
  if(m.from==='partner'){if(state.mode==='signer')buzz(m.emo);else{const n=$('#pt-sent');if(n)n.innerHTML=m.emo?`Sent to signer's glove: ${EMO[m.emo].label} ${patHTML(m.emo)}`:'Sent to signer as text'}}
  else{if(state.mode==='partner'){const b=$('#pt-in');if(b){b.textContent=m.text;b.classList.remove('ph');$('#pt-in-meta').textContent=`Recognized from signing · confidence ${m.conf}%`}speak(m.text)}}}

function buzz(k){const h=$('#hp');if(!h)return;h.className='hap '+(k?'e-'+k:'e-none');void h.offsetWidth;h.classList.add('buzz');
  $('#hp-t').innerHTML=k?`<b>Gloves buzzed: ${EMO[k].label}</b><br><span class="muted">${EMO[k].hint}</span> ${patHTML(k)}`:'<b>Single tap</b><br><span class="muted">New message</span>';
  try{navigator.vibrate&&navigator.vibrate((EMO[k]||{pat:[120]}).pat)}catch(e){}
  if(k)toast('Gloves buzz: '+EMO[k].label+' tone')}

function speak(t){const sp=$('#tts-vis');if(!state.ttsOn)return;
  try{if('speechSynthesis' in window){const u=new SpeechSynthesisUtterance(t);u.rate=state.ttsRate;speechSynthesis.cancel();speechSynthesis.speak(u)}}catch(e){}
  if(sp){sp.textContent='Speaking…';sp.className='pill ok';setTimeout(()=>{sp.textContent='Audio ready';sp.className='pill'},Math.min(5000,t.length*70))}}

/* signer view */
function buildSigner(host){
  host.innerHTML=`<div class="lh"><h2>Signer view</h2><div class="row"><span class="pill ${state.paired?'ok':'warn'}"><i></i>${state.paired?'Gloves linked':'Simulated stream'}</span><span class="pill" id="sg-lat">Latency · 1.9 s</span></div></div>
  <div class="card"><div class="row sp"><span class="lab">Glove sensor stream · 50 Hz</span><span class="pill ok" id="sg-st"><i></i>Ready</span></div><div class="bg-wrap" id="sg-bars"></div></div>
  <div class="card"><span class="lab">Translation</span><div class="gloss" id="sg-gloss" aria-live="polite"></div><div class="bigtext ph" id="sg-text" aria-live="polite">Make a sign to begin…</div>
    <div class="meter" aria-hidden="true"><i id="sg-conf" style="width:0"></i></div><small class="muted" id="sg-meta">Waiting for a sign</small>
    <div class="cta-row"><button class="btn primary" id="sg-send" disabled>${icon('send','sm')}Send</button><button class="btn" id="sg-edit" disabled>Edit</button><button class="btn" id="sg-clear" disabled>Clear</button></div></div>
  <div class="card"><span class="lab">Haptic feedback</span><div class="hap e-none" id="hp"><span class="gl">${icon('vib')}</span><div id="hp-t"><b>Idle</b><br><span class="muted">Your partner's tone will buzz here</span></div></div></div>
  <div class="cta-row"><button class="btn" id="sg-sign">${icon('hand','sm')}Simulate a sign</button><button class="btn" id="sg-hear">${icon('mic','sm')}Simulate partner speaking</button></div>
  <button class="btn primary block" id="demo-btn">${icon('play','sm')}Play demo conversation</button>
  ${logHTML()}`;
  liveBars=makeBars($('#sg-bars'));liveBars.set(IDLE());
  const idle=setInterval(()=>{if(!state.busy)liveBars.set(IDLE())},900);liveTimers.push(idle);
  $('#sg-send').onclick=sendDraft;$('#sg-clear').onclick=()=>setDraft('','',0);
  $('#sg-edit').onclick=()=>{const t=$('#sg-text'),on=t.isContentEditable;if(!on){t.contentEditable='true';t.focus();$('#sg-edit').textContent='Done'}else{t.contentEditable='false';state.draft=t.textContent.trim();$('#sg-edit').textContent='Edit'}};
  $('#sg-sign').onclick=manualSign;$('#sg-hear').onclick=()=>partnerSpeaks(nextLine());$('#demo-btn').onclick=toggleDemo}
function setDraft(text,gloss,conf){state.draft=text;const t=$('#sg-text');if(!t)return;t.contentEditable='false';$('#sg-edit').textContent='Edit';
  t.textContent=text||'Make a sign to begin…';t.classList.toggle('ph',!text);$('#sg-gloss').textContent=gloss||'';$('#sg-conf').style.width=conf+'%';
  $('#sg-meta').textContent=text?`Recognized from signing · confidence ${conf}%`:'Waiting for a sign';
  ['sg-send','sg-edit','sg-clear'].forEach(i=>$('#'+i).disabled=!text)}
function sendDraft(){const t=$('#sg-text');const text=(t.textContent||'').trim();if(!text||t.classList.contains('ph'))return;const conf=parseInt($('#sg-conf').style.width)||92;
  addMsg({from:'signer',text,conf});setDraft('','',0);const h=$('#hp');if(h){h.className='hap e-none';void h.offsetWidth;h.classList.add('buzz');$('#hp-t').innerHTML='<b>Sent</b><br><span class="muted">One short tap on both gloves</span>'}}
async function signSeq(signs,text){const st=$('#sg-st');state.busy=true;let gloss=[];
  for(const w of signs){st.className='pill warn';st.innerHTML='<i></i>Recognizing';liveBars.set(pat10(w));gloss.push(w.toUpperCase());$('#sg-gloss').textContent=gloss.join(' + ');await sleep(RM?300:900)}
  const conf=Math.round(rnd(90,98));liveBars.set(IDLE());st.className='pill ok';st.innerHTML='<i></i>Ready';$('#sg-lat').textContent='Latency · '+rnd(1.6,2.2).toFixed(1)+' s';setDraft(text,gloss.join(' + '),conf);state.busy=false}
async function manualSign(){if(state.busy)return;const w=VOC[state.vocIdx++%VOC.length];
  const conf=Math.round(rnd(52,99));const st=$('#sg-st');
  if(conf<state.threshold){state.busy=true;st.className='pill warn';st.innerHTML='<i></i>Recognizing';liveBars.set(pat10(w));await sleep(900);liveBars.set(IDLE());st.className='pill bad';st.innerHTML='<i></i>Not sure';
    $('#sg-gloss').textContent='';$('#sg-meta').textContent=`Low confidence (${conf}%). Nothing was added. Please sign again.`;buzz(null);$('#hp-t').innerHTML=`<b>Repeat cue</b><br><span class="muted">Confidence ${conf}% is below your ${state.threshold}% limit</span>`;state.busy=false;return}
  const t=state.draft?state.draft.replace(/[.!?]$/,'')+', '+w.toLowerCase():w;await signSeq([w],t);$('#sg-conf').style.width=conf+'%';$('#sg-meta').textContent=`Recognized from signing · confidence ${conf}%`}
function nextLine(){return PARTNER_LINES[state.lineIdx++%PARTNER_LINES.length]}

/* partner view */
function buildPartner(host){
  host.innerHTML=`<div class="lh"><h2>Partner view</h2><div class="row"><span class="pill ${state.joined?'ok':'warn'}"><i></i>${state.joined?'Session joined':'Demo session'}</span><span class="pill" id="tts-vis">Audio ready</span></div></div>
  <div class="card"><span class="lab">Signer says</span><div class="bigtext ph" id="pt-in" aria-live="polite">Waiting for the signer…</div><small class="muted" id="pt-in-meta">Signs arrive from the gloves as text</small>
    <div class="row sp"><button class="switch" id="tts" role="switch" aria-checked="${state.ttsOn}"><span class="tr"></span>${icon('spk','sm')}Read aloud</button><button class="btn sm" id="replay">Replay</button></div></div>
  <div class="card"><span class="lab">Your speech</span><div class="wave" id="wave" aria-hidden="true">${'<i></i>'.repeat(28)}</div>
    <div class="bigtext ph" id="pt-text" style="font-size:calc(22px * var(--msg-scale))" aria-live="polite">Tap the microphone and talk…</div>
    <button class="mic" id="mic" aria-pressed="false">${icon('mic')}<span id="mic-l">Tap to talk (simulated)</span></button></div>
  <div class="card"><span class="lab">Emotional tone from your voice</span><div class="tone e-none" id="tone"><span id="tone-f">${face('')}</span><div><h3 id="tone-l">Waiting for speech</h3><small class="muted" id="tone-d">Pitch and energy appear while you talk</small></div></div>
    <div class="row sp"><small class="muted">Energy</small><small id="tone-e" class="muted">–</small></div><div class="meter"><i id="tone-m" style="width:0"></i></div><small id="pt-sent" class="muted row">Tone is sent to the signer's gloves as a buzz pattern</small></div>
  <div class="card"><label class="lab" for="pt-type">Or type a reply</label><div class="row" style="flex-wrap:nowrap"><input class="input" id="pt-type" placeholder="Type a reply…" autocomplete="off"><button class="btn primary" id="pt-go">${icon('send','sm')}Send</button></div></div>
  <div class="cta-row"><button class="btn" id="pt-sim">${icon('hand','sm')}Simulate signer message</button></div>
  <button class="btn primary block" id="demo-btn">${icon('play','sm')}Play demo conversation</button>${logHTML()}`;
  $('#tts').onclick=()=>{state.ttsOn=!state.ttsOn;$('#tts').setAttribute('aria-checked',state.ttsOn);toast(state.ttsOn?'Signer messages will be read aloud':'Audio off')};
  $('#replay').onclick=()=>{const l=[...state.convo].reverse().find(m=>m.from==='signer');if(!l)return toast('No signer message yet');const was=state.ttsOn;state.ttsOn=true;speak(l.text);state.ttsOn=was;toast('Replaying message')};
  $('#mic').onclick=toggleMic;
  const send=()=>{const i=$('#pt-type'),v=i.value.trim();if(!v)return;i.value='';addMsg({from:'partner',text:v,emo:null})};
  $('#pt-go').onclick=send;$('#pt-type').addEventListener('keydown',e=>{if(e.key==='Enter')send()});
  $('#pt-sim').onclick=()=>signerSends(SIGNER_MSGS[state.sigIdx++%SIGNER_MSGS.length]);$('#demo-btn').onclick=toggleDemo}
function setTone(k,hz,en){const t=$('#tone');if(!t)return;t.className='tone '+(k?'e-'+k:'e-none');$('#tone-f').innerHTML=face(k||'');$('#tone-l').textContent=k?EMO[k].label:'Waiting for speech';$('#tone-d').textContent=k?`Pitch ${Math.round(hz)} Hz · ${EMO[k].hint}`:'Pitch and energy appear while you talk';$('#tone-e').textContent=k?Math.round(en)+'%':'–';$('#tone-m').style.width=(k?en:0)+'%'}
function waveTick(on){$$('#wave i').forEach((b,i)=>b.style.height=(on?rnd(6,46)*(0.5+Math.sin(i/28*Math.PI)*.6):6)+'px')}
function toggleMic(){if(mic.on){finishMic();return}if(state.busy)return;listen(nextLine(),true)}
let micDone=null;
function finishMic(){if(micDone)micDone()}
function listen(line,manual){return new Promise(res=>{state.busy=true;mic.on=true;const words=line.text.split(' ');let i=0;const b=$('#mic');b.classList.add('on');b.setAttribute('aria-pressed','true');$('#mic-l').textContent=manual?'Listening… tap to send':'Listening…';
  const tx=$('#pt-text');tx.classList.remove('ph');tx.innerHTML='';const base=EMO[line.emo];let hz=line.hz,en=rnd(30,70);
  const fin=()=>{clearInterval(mic.timer);micDone=null;mic.on=false;state.busy=false;b.classList.remove('on');b.setAttribute('aria-pressed','false');$('#mic-l').textContent='Tap to talk (simulated)';waveTick(false);
    const said=words.slice(0,Math.max(1,i)).join(' ');tx.textContent=said;addMsg({from:'partner',text:said,emo:line.emo,hz});res()};
  micDone=fin;
  mic.tick=0;
  mic.timer=setInterval(()=>{waveTick(true);mic.tick++;if(mic.tick%2)return;
    if(i<words.length){i++;tx.innerHTML=esc(words.slice(0,i).join(' '))+(i<words.length?' <span class="interim">…</span>':'');hz=line.hz+rnd(-9,9);en=Math.max(15,Math.min(95,(line.emo==='urgent'?78:line.emo==='cheerful'?66:line.emo==='calm'?34:line.emo==='sad'?24:44)+rnd(-8,8)));setTone(line.emo,hz,en)}
    else fin()},110)})}
async function partnerSpeaks(line){if(state.busy)return;if($('#mic')){await listen(line,false)}else{state.busy=true;toast('Partner is speaking…');await sleep(1100);addMsg({from:'partner',text:line.text,emo:line.emo,hz:line.hz+rnd(-8,8)});state.busy=false}}
async function signerSends(step){if(state.busy)return;if($('#sg-text')){await signSeq(step.signs,step.text);await sleep(700);sendDraft()}
  else{state.busy=true;toast('Signer is signing…');await sleep(1300);addMsg({from:'signer',text:step.text,conf:Math.round(rnd(90,98))});state.busy=false}}

/* demo */
async function toggleDemo(){const b=$('#demo-btn');if(state.demo){state.demo.stop=true;if(micDone)micDone();return}
  const d={stop:false};state.demo=d;b.innerHTML=icon('stop','sm')+'Stop demo';
  for(const [w,i] of DEMO){if(d.stop)break;while(state.busy&&!d.stop)await sleep(150);if(d.stop)break;if(w==='p')await partnerSpeaks(PARTNER_LINES[i]);else await signerSends(SIGNER_MSGS[i]);await sleep(900)}
  if(state.demo===d){state.demo=null;const bb=$('#demo-btn');if(bb)bb.innerHTML=icon('play','sm')+'Play demo conversation'}}

