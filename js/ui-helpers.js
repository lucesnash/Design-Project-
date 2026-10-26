'use strict';
function face(k){const m={cheerful:'<path d="M8.5 14.5c1 1.6 2.2 2.3 3.5 2.3s2.5-.7 3.5-2.3"/>',calm:'<path d="M9 15.2c1.8 1 4.2 1 6 0"/>',concerned:'<path d="M9 16h6M8 9.2l2.2-.8M16 9.2l-2.2-.8"/>',urgent:'<ellipse cx="12" cy="15.8" rx="1.9" ry="2.3"/><path d="M8 8l2.4.7M16 8l-2.4.7"/>',sad:'<path d="M8.8 16.8c1-1.5 2.1-2.2 3.2-2.2s2.2.7 3.2 2.2"/>'};
  return `<svg class="face" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><circle cx="9" cy="10.8" r=".7" fill="currentColor"/><circle cx="15" cy="10.8" r=".7" fill="currentColor"/>${m[k]||'<path d="M9 15.5h6"/>'}</svg>`}
function patHTML(k){const p=(EMO[k]||{pat:[120]}).pat;return `<span class="pat" aria-hidden="true">${p.map((d,i)=>i%2?`<b style="width:${Math.max(4,d/30)}px"></b>`:`<i style="width:${Math.max(8,d/12)}px"></i>`).join('')}</span>`}
function emoChip(k,hz){if(!k)return `<span class="emo e-none">Typed text</span>`;return `<span class="emo e-${k}">${face(k)}${EMO[k].label}${hz?` · ${Math.round(hz)} Hz`:''}</span>`}

let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600)}
