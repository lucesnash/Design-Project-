'use strict';
/* ---------- modal framework ---------- */
let cur=null,lastFocus=null;
function openModal(kicker,title,fn){closeModal(true);lastFocus=document.activeElement;const ov=$('#overlay'),sh=$('#sheet');
  sh.innerHTML=`<header class="sh-head"><div><p class="kicker">${kicker}</p><h2 id="sh-title">${title}</h2></div><button class="icon-btn" id="sh-close" aria-label="Close">${icon('x')}</button></header><div class="sh-body" id="sh-body"></div>`;
  ov.hidden=false;document.body.classList.add('lock');
  const api={cleanups:[],close:()=>closeModal(),every(f,ms){const t=setInterval(f,ms);this.cleanups.push(()=>clearInterval(t));return t},later(f,ms){const t=setTimeout(f,ms);this.cleanups.push(()=>clearTimeout(t));return t},bars(h,o){const b=makeBars(h,o);this.cleanups.push(()=>b.destroy());return b}};
  cur=api;$('#sh-close').onclick=()=>closeModal();fn($('#sh-body'),api);$('#sh-close').focus()}
function closeModal(silent){if(cur){cur.cleanups.forEach(f=>f());cur=null}const ov=$('#overlay');if(ov.hidden)return;ov.hidden=true;document.body.classList.remove('lock');
  if(!silent){if(state.mode)renderTiles();if(lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}}}
$('#overlay').addEventListener('mousedown',e=>{if(e.target.id==='overlay')closeModal()});
document.addEventListener('keydown',e=>{if($('#overlay').hidden)return;if(e.key==='Escape')closeModal();
  if(e.key==='Tab'){const f=$$('button:not([disabled]),input,select,[tabindex="0"]','#sheet').filter(x=>x.offsetParent!==null);if(!f.length)return;const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});

function openTool(k){const s=state.mode==='signer';
  if(k==='pair')return s?pairSigner():pairPartner();
  if(k==='cal')return s?calSigner():calPartner();
  if(k==='per')return s?perSigner():perPartner();
  return analytics()}
const stepsHTML=(n,i,names)=>`<div class="steps" aria-hidden="true">${Array.from({length:n},(_,j)=>`<i class="${j<i?'done':j===i?'cur':''}"></i>`).join('')}</div><div class="stepname"><span>Step ${Math.min(i+1,n)} of ${n}</span><span>${names[Math.min(i,n-1)]}</span></div>`;

/* ring helper */
const ringHTML=(label,sub='')=>`<div class="ringbox"><svg width="176" height="176" viewBox="0 0 176 176" aria-hidden="true"><circle cx="88" cy="88" r="78" fill="none" stroke="var(--line)" stroke-width="10"/><circle id="rg" cx="88" cy="88" r="78" fill="none" stroke="var(--teal)" stroke-width="10" stroke-linecap="round" stroke-dasharray="490" stroke-dashoffset="490" transform="rotate(-90 88 88)"/></svg><div class="mid"><b id="rg-l">${label}</b><small class="muted">${sub}</small></div></div>`;
function runRing(api,ms,onTick,onDone){const t0=performance.now();const id=api.every(()=>{const p=Math.min(1,(performance.now()-t0)/ms);const r=$('#rg');if(r)r.style.strokeDashoffset=490*(1-p);if(onTick)onTick(p);if(p>=1){clearInterval(id);onDone()}},50)}

