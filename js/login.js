'use strict';
/* ---------- login ---------- */
let signup=false;
function setTab(up){signup=up;$('#tab-in').setAttribute('aria-selected',!up);$('#tab-up').setAttribute('aria-selected',up);$('#f-name').hidden=!up;$('#form-h').textContent=up?'Create your account':'Welcome back';$('#form-sub').textContent=up?'It takes a minute. You will pair your gloves next.':'Log in to set up your gloves or join a conversation.';$('#login-btn').textContent=up?'Get Started':'Log In';$('#in-pw').autocomplete=up?'new-password':'current-password';$('#login-err').textContent=''}
$('#tab-in').onclick=()=>setTab(false);$('#tab-up').onclick=()=>setTab(true);
$('#pw-toggle').onclick=()=>{const i=$('#in-pw'),h=i.type==='password';i.type=h?'text':'password';$('#pw-toggle').textContent=h?'Hide':'Show';$('#pw-toggle').setAttribute('aria-label',h?'Hide password':'Show password')};
function enter(name){state.user=name;go('mode')}
$('#login-form').addEventListener('submit',e=>{e.preventDefault();const em=$('#in-email').value.trim(),pw=$('#in-pw').value,err=$('#login-err');
  if(!/^\S+@\S+\.\S+$/.test(em)){err.textContent='Enter a valid email, such as example@gnmail.com.';$('#in-email').focus();return}
  if(pw.length<8){err.textContent='Your password needs at least 8 characters.';$('#in-pw').focus();return}
  const nm=signup&&$('#in-name').value.trim()||em.split('@')[0];enter(nm.charAt(0).toUpperCase()+nm.slice(1))});
$('#demo-login').onclick=()=>enter('Maria');
$('#logout').onclick=()=>{state.mode=null;go('login')};
$$('.mode').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;renderDash();go('dash');renderLive()});
$('#dash-back').onclick=()=>go('mode');

