'use strict';
/* ---------- theme ---------- */
function effTheme(){const d=document.documentElement.dataset.theme;return d||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
function themeIcons(){const dark=effTheme()==='dark';$$('[data-theme-toggle] use').forEach(u=>u.setAttribute('href',dark?'#i-sun':'#i-moon'))}
$$('[data-theme-toggle]').forEach(b=>b.addEventListener('click',()=>{document.documentElement.dataset.theme=effTheme()==='dark'?'light':'dark';themeIcons();if(cur&&cur.onTheme)cur.onTheme()}));
themeIcons();

