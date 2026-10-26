'use strict';
/* ---------- finger bars ---------- */
const barSets=new Set();let barTimer=null;
function makeBars(host,o={}){const groups=o.groups||['L','R'];const L=['T','I','M','R','P'],N={T:'Thumb',I:'Index',M:'Middle',R:'Ring',P:'Pinky'};
  host.innerHTML=groups.map(g=>`<div class="bg"><div class="bg-g">${L.map(l=>`<div><div class="fb" title="${N[l]}"><i></i></div><div class="fl">${l}</div></div>`).join('')}</div>${o.names===false?'':`<div class="bn">${g==='L'?'Left · Spoke':'Right · Hub'}</div>`}</div>`).join('');
  const fills=$$('.fb i',host),n=fills.length;const b={cur:Array(n).fill(15),tgt:Array(n).fill(15),set(a){this.tgt=a.slice(0,n)},destroy(){barSets.delete(b)}};
  b.fills=fills;barSets.add(b);if(!barTimer)barTimer=setInterval(tickBars,110);return b}
function tickBars(){if(!barSets.size){clearInterval(barTimer);barTimer=null;return}
  barSets.forEach(b=>{b.fills.forEach((f,i)=>{b.cur[i]+=(b.tgt[i]-b.cur[i])*.4+(RM?0:rnd(-2.2,2.2));b.cur[i]=Math.max(3,Math.min(98,b.cur[i]));f.style.height=b.cur[i]+'%'})})}
const IDLE=()=>Array.from({length:10},()=>rnd(10,22));

