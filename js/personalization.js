'use strict';
/* ===== Personalization (signer) ===== */
function perSigner(){openModal('Personalization','Teach the gloves your signing',(root,api)=>{
  const rows=[{h:'Water',c:64},{h:'Help',c:71},{h:'Please',c:68}].slice(0,Math.max(0,state.queued));
  function draw(){root.innerHTML=`<div class="note">${icon('person','sm')}<span>The gloves learn from your confirmations and corrections. Only the last layer of the model changes, so updates are quick and stay on your hub glove.</span></div>
  <div class="card"><div class="row sp"><b>Quick corrections</b><span class="pill ${rows.length?'warn':'ok'}">${rows.length?rows.length+' to review':'All reviewed'}</span></div>
    <div class="list">${rows.length?rows.map((r,i)=>`<div class="item" style="flex-wrap:wrap"><div class="t"><b>Heard “${r.h}”</b><small>Confidence ${r.c}%, below your limit</small></div><div class="row"><button class="btn sm" data-yes="${i}">That's right</button><label class="sr" for="fx${i}">Correct sign</label><select class="input" id="fx${i}" data-fix="${i}" style="min-height:40px;width:auto"><option value="">Fix…</option>${VOC.filter(v=>v!==r.h).map(v=>`<option>${v}</option>`).join('')}</select></div></div>`).join(''):'<p class="muted">Nothing waiting. New low-confidence signs will appear here.</p>'}</div></div>
  <div class="card"><b>Your mannerisms</b>
    <div class="field"><label for="sp">Signing speed <span class="muted" id="spv"></span></label><input class="range" id="sp" type="range" min="0" max="100" value="${state.speed}"></div>
    <div class="field"><label for="hd">Hold time before a sign counts <span class="muted" id="hdv"></span></label><input class="range" id="hd" type="range" min="3" max="15" value="${state.hold*10}"></div>
    <div class="field"><label for="th">Confidence limit <span class="muted" id="thv"></span></label><input class="range" id="th" type="range" min="50" max="95" value="${state.threshold}"><small class="muted">Below this, the gloves buzz to ask you to repeat instead of guessing.</small></div></div>
  <div class="card"><div class="row sp"><b>Update my model</b><span class="pill">Now v${state.modelVer}</span></div><p class="muted" style="font-size:14px">${state.corrections} corrections applied so far. A few-shot update uses your confirmed signs to tune the last layer.</p><div class="meter" id="um" hidden><i style="width:0"></i></div><p id="ut" class="muted" style="font-size:14px" aria-live="polite"></p><button class="btn primary block" id="upd">Update model on my hub glove</button></div>`;
    const lab=()=>{$('#spv').textContent=['Slower','Slower','Average','Faster','Faster'][Math.min(4,Math.floor(state.speed/20))];$('#hdv').textContent=state.hold.toFixed(1)+' s';$('#thv').textContent=state.threshold+'%'};lab();
    $('#sp').oninput=e=>{state.speed=+e.target.value;lab()};$('#hd').oninput=e=>{state.hold=e.target.value/10;lab()};$('#th').oninput=e=>{state.threshold=+e.target.value;lab()};
    $$('[data-yes]').forEach(b=>b.onclick=()=>{rows.splice(+b.dataset.yes,1);state.queued=rows.length;state.corrections++;toast('Confirmed. Saved for the next update');draw()});
    $$('[data-fix]').forEach(s=>s.onchange=()=>{if(!s.value)return;rows.splice(+s.dataset.fix,1);state.queued=rows.length;state.corrections++;toast('Corrected to “'+s.value+'”');draw()});
    $('#upd').onclick=()=>{if(!state.corrections){toast('Confirm or correct at least one sign first');return}$('#upd').disabled=true;$('#um').hidden=false;const S=['Collecting your confirmed signs…','Updating the last layer (few-shot)…','Quantizing to INT8…','Sending to the Right Hub Glove over Bluetooth…'];let i=0;const bar=$('#um i');
      const id=api.every(()=>{$('#ut').textContent=S[i];bar.style.width=((i+1)/S.length*100)+'%';i++;if(i>S.length){clearInterval(id);const v=(parseFloat(state.modelVer)+.1).toFixed(1);state.modelVer=v;$('#ut').innerHTML=`<b style="color:var(--teal-ink)">Done. Model v${v} is on your glove.</b> Expected gain on your signs: +${rnd(1.2,3.1).toFixed(1)}%`;$('#upd').disabled=false;renderTiles()}},800)}}
  draw()})}

/* ===== Personalization (partner) ===== */
function perPartner(){openModal('Personalization','Reading and listening settings',(root,api)=>{
  root.innerHTML=`<div class="card"><div class="field"><label for="ts">Message text size <span class="muted" id="tsv"></span></label><input class="range" id="ts" type="range" min="90" max="160" value="${state.msgScale?state.msgScale*100:100}"></div><div class="bigtext" style="font-size:calc(22px * var(--msg-scale))" id="tsp">Yes, let's eat together.</div></div>
  <div class="card"><div class="field"><label for="tr">Speech speed <span class="muted" id="trv"></span></label><input class="range" id="tr" type="range" min="6" max="14" value="${state.ttsRate*10}"></div><button class="btn sm" id="trt" style="justify-self:start">${icon('spk','sm')}Hear a sample</button></div>
  <div class="card"><b>Tone sensitivity</b><div class="seg" role="group" aria-label="Tone sensitivity" id="sg">${['Low','Medium','High'].map(s=>`<button aria-pressed="${state.sens===s}" data-s="${s}">${s}</button>`).join('')}</div><small class="muted">Higher sensitivity sends more buzzes to the signer's gloves.</small></div>
  <div class="card"><div class="field"><label for="cc"><b>Clear the session cache</b></label><select class="input" id="cc"><option>When the session ends</option><option>After 1 hour</option><option>After 24 hours</option></select><small class="muted">Messages are never kept on a server.</small></div></div>`;
  const l=()=>{$('#tsv').textContent=Math.round((state.msgScale||1)*100)+'%';$('#trv').textContent=state.ttsRate.toFixed(1)+'×'};l();
  $('#ts').oninput=e=>{state.msgScale=e.target.value/100;document.documentElement.style.setProperty('--msg-scale',state.msgScale);l()};
  $('#tr').oninput=e=>{state.ttsRate=e.target.value/10;l()};
  $('#trt').onclick=()=>{const w=state.ttsOn;state.ttsOn=true;speak('Hello, nice to meet you.');state.ttsOn=w;toast('Playing sample')};
  $$('#sg button').forEach(b=>b.onclick=()=>{state.sens=b.dataset.s;$$('#sg button').forEach(x=>x.setAttribute('aria-pressed',x===b))})})}

