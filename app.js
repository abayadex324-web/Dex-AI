const files={html:`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Project DEX</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="card">
    <h1>Halo, Developer!</h1>
    <p>Selamat datang di project pertamamu.</p>
    <button id="hello">Klik saya</button>
  </main>
  <script src="script.js"><\/script>
</body>
</html>`,css:`body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #101827;
  color: white;
  font-family: Arial, sans-serif;
}
.card {
  text-align: center;
  padding: 32px;
  border: 1px solid #00eaff;
  border-radius: 16px;
}
button { padding: 10px 18px; background: #00eaff; border: 0; border-radius: 6px; }`,js:`document.querySelector("#hello")?.addEventListener("click", () => {
  alert("DEX AI preview berhasil!");
});`};
let active='html';const code=document.querySelector('#code'),gutter=document.querySelector('#gutter'),preview=document.querySelector('#preview');
function updateGutter(){let n=code.value.split('\n').length;gutter.textContent=Array.from({length:n},(_,i)=>i+1).join('\n');document.querySelector('#lineInfo').textContent=`Ln ${code.value.substr(0,code.selectionStart).split('\n').length}, Col 1`}
function render(){let src=files.html.replace('<link rel="stylesheet" href="style.css">',`<style>${files.css}</style>`).replace('<script src="script.js"></script>',`<script>${files.js}<\/script>`);preview.srcdoc=src}
function load(){code.value=files[active];document.querySelectorAll('[data-file]').forEach(b=>b.classList.toggle('selected',b.dataset.file===active));document.querySelector('#fileInfo').textContent=active.toUpperCase()+' · LOCAL';updateGutter();render()}
code.addEventListener('input',()=>{files[active]=code.value;updateGutter();render()});code.addEventListener('click',updateGutter);code.addEventListener('keyup',updateGutter);
document.querySelectorAll('[data-file]').forEach(b=>b.onclick=()=>{files[active]=code.value;active=b.dataset.file;load()});
document.querySelector('#refresh').onclick=()=>{files[active]=code.value;render()};
document.querySelector('#saveBtn').onclick=()=>{files[active]=code.value;localStorage.setItem('dexai-project',JSON.stringify(files));alert('Project tersimpan di browser ini.')};
try{const old=JSON.parse(localStorage.getItem('dexai-project'));if(old)Object.assign(files,old)}catch{}
document.querySelector('#newProject').onclick=()=>{if(confirm('Buat project baru?')){Object.assign(files,{html:'<!doctype html>\\n<html>\\n<body>\\n<h1>Project Baru</h1>\\n</body>\\n</html>',css:'body { font-family: Arial; }',js:'// Tulis JavaScript di sini'});load()}};
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{if(b.dataset.action==='html')active='html';if(b.dataset.action==='js')active='js';if(b.dataset.action==='clear')files[active]='';load()});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{let a=b.dataset.tab==='assistant';document.querySelector('#studioView').classList.toggle('hidden',a);document.querySelector('#assistantView').classList.toggle('hidden',!a);document.querySelector('#viewName').textContent=a?'AI ASSISTANT':'CODE STUDIO';document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n===b));document.querySelector('#sidebar').classList.remove('open')});
document.querySelector('#hamb').onclick=()=>document.querySelector('#sidebar').classList.toggle('open');
document.querySelector('#openPreview').onclick=()=>{let w=window.open();if(w){w.document.write(files.html.replace('<link rel="stylesheet" href="style.css">',`<style>${files.css}</style>`).replace('<script src="script.js"></script>',`<script>${files.js}<\/script>`));w.document.close()}};
document.querySelector('#chatSend').onclick=()=>{let t=document.querySelector('#chatInput');if(!t.value.trim())return;let p=document.createElement('p');p.textContent='AI online belum dihubungkan. Pertanyaan kamu: '+t.value;document.querySelector('#chatLog').append(p);t.value=''};
load();