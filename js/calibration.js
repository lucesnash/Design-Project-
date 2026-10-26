'use strict';
/* ===== Calibration (signer) ===== */
function calSigner(){openModal('Calibration','Calibrate your gloves',(root,api)=>{
  const names=['Flex range','IMU zero','Hand fit','Sign samples'];let ph=0,cap=0,res=null,bars=null;
  const PH=[
    {t:'Check flex sensor range',p:'Each finger sensor needs a clear gap between an open hand and a fist.',caps:[['Open both hands flat',()=>Array(10).fill(0).map(()=>rnd(8,16))],['Close both hands into fists',()=>Array(10).fill(0).map(()=>rnd(78,92))]],
      r:()=>{const f=['Thumb','Index','Middle','Ring','Pinky'];state.cal=state.cal||{};state.cal.flex=f.map(()=>({o:Math.round(rnd(8,16)),c:Math.round(rnd(78,92))}));return `<div class="status ok">${icon('check','sm')} All 10 flex sensors have a usable range</div><div class="scroll-x"><table class="tbl"><tr><th>Finger</th><th>Open</th><th>Fist</th><th>Span</th></tr>${f.map((n,i)=>{const x=state.cal.flex[i];return `<tr><td>${n}</td><td>${x.o}%</td><td>${x.c}%</td><td>${x.c-x.o}%</td></tr>`}).join('')}</table></div>`}},
    {t:'Zero the motion sensors',p:'Rest both hands flat on a table, palms down, and keep still. The IMU on the back of each hand removes its tilt and drift.',caps:[['Rest hands flat and still',()=>Array(10).fill(0).map(()=>rnd(8,16))]],imu:true,
      r:()=>`<div class="status ok">${icon('check','sm')} IMU zeroed on both hands</div><div class="scroll-x"><table class="tbl"><tr><th>Axis</th><th>Before</th><th>After</th></tr><tr><td>Accel X</td><td>0.04 g</td><td>0.00 g</td></tr><tr><td>Accel Z</td><td>0.97 g</td><td>1.00 g</td></tr><tr><td>Gyro drift</td><td>1.8 °/s</td><td>0.1 °/s</td></tr></table></div>`},
    {t:'Fit the gloves to your hands',p:'Spread your fingers wide and hold. The app scales every sensor to your hand size so the same sign reads the same.',caps:[['Spread fingers wide',()=>Array(10).fill(0).map(()=>rnd(4,10))]],
      r:()=>{const f=['Thumb','Index','Middle','Ring','Pinky'];return `<div class="status ok">${icon('check','sm')} Hand profile saved: medium fit</div><div class="scroll-x"><table class="tbl"><tr><th>Finger</th><th>Left gain</th><th>Right gain</th></tr>${f.map(n=>`<tr><td>${n}</td><td>×${rnd(.92,1.1).toFixed(2)}</td><td>×${rnd(.92,1.1).toFixed(2)}</td></tr>`).join('')}</table></div>`}}
  ];
  function draw(){bars&&bars.destroy();bars=null;if(ph<3)drawPhase();else drawSigns()}
  function drawPhase(){const P=PH[ph];root.innerHTML=stepsHTML(4,ph,names)+`<h3>${P.t}</h3><p class="muted">${P.p}</p>
    ${P.imu?`<div class="bubble" aria-hidden="true"><i id="bub"></i></div>`:''}<div class="card"><span class="lab">Live finger bend</span><div class="bg-wrap" id="cb"></div></div>
    <div id="cap-area"></div>`;bars=api.bars($('#cb'));bars.set(IDLE());
    if(P.imu){api.every(()=>{const b=$('#bub');if(b){const k=res?0:(cap===0&&capRunning?2:8);b.style.transform=`translate(${rnd(-k,k)}px,${rnd(-k,k)}px)`}},120)}
    capUI()}
  let capRunning=false;
  function capUI(){const P=PH[ph],a=$('#cap-area');if(res){a.innerHTML=res+`<button class="btn primary block" id="nx" style="margin-top:14px">Next</button>`;$('#nx').onclick=()=>{ph++;cap=0;res=null;draw()};return}
    a.innerHTML=`<div style="display:grid;gap:12px">${ringHTML('Ready')}<div class="status" id="cs">${icon('hand','sm')} ${P.caps[cap][0]}</div><button class="btn primary block" id="cb-go">Capture (${cap+1} of ${P.caps.length})</button></div>`;
    $('#cb-go').onclick=()=>{$('#cb-go').disabled=true;capRunning=true;bars.set(P.caps[cap][1]());$('#cs').className='status warn';$('#cs').textContent='Hold steady…';
      runRing(api,2200,p=>{const l=$('#rg-l');if(l)l.textContent=(2.2*(1-p)).toFixed(1)+'s'},()=>{capRunning=false;cap++;if(cap>=P.caps.length){res=P.r();bars.set(IDLE());toast('Captured');capUI()}else capUI()})}}
  /* sign samples, as in Fig. 20 */
  let si=1,held=false,flash=false;
  function drawSigns(){if(si>10)return doneSigns();const w=VOC[si-1];
    root.innerHTML=stepsHTML(4,3,names)+`<div class="row sp"><span class="kicker">Sign ${si} of 10</span></div><h3 style="font-size:24px">Make the sign for “${w}”</h3><p class="muted">Hold the handshape steady until the ring fills.</p>
    <div class="ringbox"><svg width="176" height="176" viewBox="0 0 176 176" aria-hidden="true"><circle cx="88" cy="88" r="78" fill="none" stroke="var(--line)" stroke-width="10"/><circle id="rg" cx="88" cy="88" r="78" fill="none" stroke="var(--teal)" stroke-width="10" stroke-linecap="round" stroke-dasharray="490" stroke-dashoffset="490" transform="rotate(-90 88 88)"/></svg><div class="mid"><svg width="64" height="64" viewBox="0 0 64 64" fill="var(--teal-tint)" stroke="var(--ink)" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><use href="#i-hand"/></svg><b id="rg-l">2.4s</b></div></div>
    <div class="status" id="sst"><span class="dot on"></span>Hold steady…</div>
    <div class="card"><span class="lab">Finger bend, live (right hand)</span><div id="sb"></div></div>
    <div class="dots" aria-hidden="true">${Array.from({length:10},(_,i)=>`<i class="${i+1<si?'d':i+1===si?'c':''}"></i>`).join('')}</div>
    <div class="cta-row"><button class="btn" id="retry">Retry sign</button><button class="btn primary" id="nxs" disabled>Next sign</button></div>`;
    bars=api.bars($('#sb'),{groups:['R'],names:false});const start=()=>{held=false;$('#nxs').disabled=true;const r=$('#rg');r.style.stroke='var(--teal)';bars.set(pat10(w).slice(0,5));$('#sst').className='status';$('#sst').innerHTML='<span class="dot on"></span>Hold steady…';
      runRing(api,2400,p=>{const l=$('#rg-l');if(l){l.textContent=(2.4*(1-p)).toFixed(1)+'s'}},()=>{held=true;$('#rg-l').textContent='Done';$('#sst').className='status ok';$('#sst').innerHTML=`${icon('check','sm')} Captured · quality ${Math.round(rnd(93,99))}%`;$('#nxs').disabled=false})};
    $('#retry').onclick=()=>{$('#rg').style.stroke='var(--amber)';$('#rg').style.strokeDashoffset=490;$('#rg-l').textContent='Retry';start()};
    $('#nxs').onclick=()=>{si++;drawSigns()};start()}
  function doneSigns(){state.calibrated=true;state.accuracy=97;root.innerHTML=stepsHTML(4,4,names)+`<div class="status ok">${icon('check','sm')} All 10 signs calibrated · accuracy 97%</div><p class="muted">Your flex ranges, IMU zero and hand fit are saved on the hub glove. Calibrate again if the gloves feel different or accuracy drops.</p><button class="btn primary block" id="chat">Start chatting →</button>`;
    renderTiles();$('#chat').onclick=()=>{closeModal();$('#live').scrollIntoView({behavior:RM?'auto':'smooth'})}}
  draw()})}

/* ===== Calibration (partner voice) ===== */
function calPartner(){openModal('Calibration','Calibrate your voice',(root,api)=>{
  const names=['Room noise','Normal voice','Expressive voice'];let ph=0,done=false;
  const PH=[{t:'Check the room',p:'Stay quiet for a moment so the app can measure background noise.',cap:'Stay quiet',r:'Background noise 34 dB. Quiet enough for clear speech-to-text.',lv:6},
    {t:'Say it normally',p:'Say “Hello, how are you today?” in your everyday voice. Tone cues are measured against your own pitch, not an average.',cap:'Speak normally',r:'Your baseline pitch is 172 Hz, with a usual range of 140 to 215 Hz.',lv:45},
    {t:'Say it with feeling',p:'Say the same sentence again, as if you were happy to see them.',cap:'Speak with feeling',r:'Expressive range recorded: up to 248 Hz. Cheerful and urgent tones will be told apart.',lv:70}];
  function draw(){if(ph>=3){state.voiceCal=true;root.innerHTML=stepsHTML(3,3,names)+`<div class="status ok">${icon('check','sm')} Voice calibrated</div><p class="muted">Your pitch baseline stays on this phone. Audio is discarded right after each message is analyzed.</p><button class="btn primary block" id="ok">Done</button>`;renderTiles();$('#ok').onclick=()=>closeModal();return}
    const P=PH[ph];root.innerHTML=stepsHTML(3,ph,names)+`<h3>${P.t}</h3><p class="muted">${P.p}</p><div class="card"><div class="wave" id="cw">${'<i></i>'.repeat(28)}</div><div class="meter"><i id="cl" style="width:0"></i></div></div><div id="cap">${ringHTML('Ready')}<button class="btn primary block" id="go">${P.cap}</button></div>`;
    $('#go').onclick=()=>{$('#go').disabled=true;const w=api.every(()=>{$$('#cw i').forEach((b,i)=>b.style.height=rnd(5,P.lv/1.6)*(0.5+Math.sin(i/28*Math.PI)*.6)+'px');const c=$('#cl');if(c)c.style.width=(P.lv+rnd(-8,8))+'%'},110);
      runRing(api,2600,p=>{const l=$('#rg-l');if(l)l.textContent=(2.6*(1-p)).toFixed(1)+'s'},()=>{clearInterval(w);$('#cap').innerHTML=`<div class="status ok">${icon('check','sm')} ${P.r}</div><button class="btn primary block" id="nx" style="margin-top:12px">Next</button>`;$('#nx').onclick=()=>{ph++;draw()}})}}
  draw()})}

