'use strict';
/* ---------- dashboard ---------- */
function tileStatus(k){const s=state.mode==='signer';
  if(k==='pair')return s?(state.paired?['ok','Connected','Left Spoke and Right Hub Glove are linked']:['warn','Needs setup','Pair the two gloves over Bluetooth']):(state.joined?['ok','Joined','Session SECB-4829, mic ready']:['warn','Not joined','Join the signer’s session and check the mic']);
  if(k==='cal')return s?(state.calibrated?['ok','Calibrated','Sign samples accuracy '+state.accuracy+'%']:['warn','Not calibrated','Flex range, IMU zero, hand fit, 10 signs']):(state.voiceCal?['ok','Voice calibrated','Pitch baseline saved']:['warn','Not calibrated','Measure your normal pitch for tone cues']);
  if(k==='per')return s?(state.corrections?['ok',state.corrections+' corrections','Model v'+state.modelVer+' on your hub glove']:['','Learning your style',state.queued+' recognitions waiting for review']):['','Reading and listening','Text size, voice speed, tone sensitivity'];
  return ['','Sample data','Accuracy, confidence and session summaries']}
function renderTiles(){const s=state.mode==='signer';
  const defs=[['pair','ble','Pairing & Onboarding'],['cal','cal','Calibration'],['per','person','Personalization'],['ana','chart','Data Analytics']];
  let nextK=null;if(s){if(!state.paired)nextK='pair';else if(!state.calibrated)nextK='cal'}else{if(!state.joined)nextK='pair';else if(!state.voiceCal)nextK='cal'}
  $('#tiles').innerHTML=defs.map(([k,ic,t])=>{const [c,l,d]=tileStatus(k);return `<button class="tile${k===nextK?' next':''}" data-tile="${k}"><span class="ti">${icon(ic)}</span><h3>${t}</h3><small>${d}</small><span class="pill ${c}"><i></i>${l}</span></button>`}).join('');
  $$('.tile').forEach(b=>b.onclick=()=>openTool(b.dataset.tile));
  const dv=$('#devices');
  if(s)dv.innerHTML=`<div class="dev"><b><span class="dot ${state.paired?'on':''}"></span>Left Spoke Glove</b><small>${state.paired?'ESP-NOW to hub · 82%':'Not paired'}</small></div><div class="dev"><b><span class="dot ${state.paired?'on':''}"></span>Right Hub Glove</b><small>${state.paired?'Bluetooth LE · 74%':'Not paired'}</small></div>`;
  else dv.innerHTML=`<div class="dev"><b><span class="dot ${state.joined?'on':''}"></span>Session</b><small>${state.joined?'SECB-4829 · joined':'Not joined'}</small></div><div class="dev"><b><span class="dot ${state.mic?'on':''}"></span>Microphone</b><small>${state.mic?'Ready':'Not checked'}</small></div>`}
function renderDash(){const s=state.mode==='signer';
  $('#mode-pill').innerHTML=s?`${icon('hand','sm')}Signer mode`:`${icon('mic','sm')}Partner mode`;$('#mode-pill').className='pill '+(s?'ok':'vio');
  $('#dash-h').textContent='Hi, '+state.user;$('#dash-sub').textContent=s?'Set up your gloves, then start a conversation.':'Join the signer, check your mic, then start talking.';renderTiles()}

