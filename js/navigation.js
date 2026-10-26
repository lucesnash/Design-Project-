'use strict';
/* ---------- navigation ---------- */
function go(name){stopLive();$$('.screen').forEach(s=>s.hidden=s.id!=='s-'+name);const s=$('#s-'+name);s.classList.remove('enter');void s.offsetWidth;s.classList.add('enter');window.scrollTo(0,0);s.focus({preventScroll:true})}

