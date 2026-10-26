'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=(a,b)=>a+Math.random()*(b-a);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const icon=(n,c='')=>`<svg class="ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const nowT=()=>new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});

const state={user:'Maria',mode:null,paired:false,joined:false,mic:false,calibrated:false,voiceCal:false,accuracy:null,
  corrections:0,queued:3,modelVer:'1.3',threshold:70,hold:0.6,speed:50,ttsOn:false,ttsRate:1,sens:'Medium',
  convo:[],busy:false,demo:null,draft:'',lineIdx:0,sigIdx:0,vocIdx:0};
