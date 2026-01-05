// Simple games: uses FACTS data
const factsList = window.FACTS || []; // fallback to empty array if data not loaded

// Quiz
let qIndex = 0;
function makeQuestion(){
  if(factsList.length === 0) return;
  const fact = factsList[Math.floor(Math.random()*factsList.length)];
  const question = `Which statement correctly describes: \"${fact.title}\"?`;
  const choices = [fact.short];
  // generate wrong answers by picking other shorts
  const shuffled = factsList.filter(f=>f.id!==fact.id).slice(0,3).map(f=>f.short);
  while(choices.length < 4) choices.push(shuffled.pop() || 'A seasonal tradition');
  // shuffle
  for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]]}
  return {question,answer:fact.short,choices};
}

function renderQuiz(){
  const q = makeQuestion();
  document.getElementById('quizQ').textContent = q.question;
  const ch = document.getElementById('quizChoices'); ch.innerHTML='';
  q.choices.forEach(c =>{
    const b = document.createElement('button'); b.className='btn'; b.textContent = c;
    b.addEventListener('click', ()=>{
      alert(c === q.answer ? 'Correct! 🎉' : 'Not quite — try another!');
    });
    ch.appendChild(b);
  })
}

// Memory game
let memState = {grid:[],first:null,second:null,score:0};
function setupMemory(){
  const grid = document.getElementById('memoryGrid'); grid.innerHTML=''; memState={grid:[],first:null,second:null,score:0};
  const icons = ['🎄','🎁','🕯️','🦌','🍪','⭐','🎅','❄️'];
  const pairs = icons.concat(icons).slice(0,16);
  // shuffle
  for(let i=pairs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pairs[i],pairs[j]]=[pairs[j],pairs[i]]}
  pairs.forEach((icon,idx)=>{
    const cell = document.createElement('div'); cell.className='mem-card'; cell.dataset.icon=icon; cell.dataset.index=idx; cell.textContent='';
    cell.addEventListener('click', ()=> reveal(null,cell));
    grid.appendChild(cell);
  });
  document.getElementById('memScore').textContent = '0';
}

function reveal(handler,cell){
  if(cell.classList.contains('revealed') || memState.second) return;
  cell.textContent = cell.dataset.icon; cell.classList.add('revealed');
  if(!memState.first) memState.first = cell;
  else {
    memState.second = cell;
    const a = memState.first.dataset.icon, b = memState.second.dataset.icon;
    if(a === b){ memState.score += 1; document.getElementById('memScore').textContent = memState.score; memState.first=null; memState.second=null; }
    else { setTimeout(()=>{ memState.first.textContent=''; memState.second.textContent=''; memState.first.classList.remove('revealed'); memState.second.classList.remove('revealed'); memState.first=null; memState.second=null; },800); }
  }
}

// init
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=>{ renderQuiz(); setupMemory(); setupScramble(); setupColoring(); });
} else { renderQuiz(); setupMemory(); setupScramble(); setupColoring(); }

// Word scramble game
function scrambleWord(word){
  const arr = word.split('');
  for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]}
  return arr.join('');
}
function setupScramble(){
  const panel = document.createElement('div'); panel.className='card'; panel.innerHTML = `<h3>Word Scramble</h3><div id="scrambleQ">Loading...</div><div style="margin-top:10px"><input id="scrAnswer" placeholder="Type answer"><button id="scrCheck" class="btn">Check</button><button id="scrNext" class="btn">Next</button></div><div id="scrMsg" style="margin-top:8px;color:#ffd166"></div>`;
  document.querySelector('.games').appendChild(panel);
  const pick = ()=> factsList[Math.floor(Math.random()*factsList.length)];
  let cur = pick();
  document.getElementById('scrambleQ').textContent = scrambleWord(cur.title.replace(/\s+/g,''));
  document.getElementById('scrCheck').addEventListener('click', ()=>{
    const v = document.getElementById('scrAnswer').value.trim().toLowerCase();
    if(!v) return; if(v === cur.title.replace(/\s+/g,'').toLowerCase()){ document.getElementById('scrMsg').textContent='Correct! 🎉'; } else { document.getElementById('scrMsg').textContent='Not quite — try again.' }
  });
  document.getElementById('scrNext').addEventListener('click', ()=>{ cur = pick(); document.getElementById('scrambleQ').textContent = scrambleWord(cur.title.replace(/\s+/g,'')); document.getElementById('scrAnswer').value=''; document.getElementById('scrMsg').textContent=''; });
}

// Simple coloring activity (color a cart)
function setupColoring(){
  const panel = document.createElement('div'); panel.className='card'; panel.innerHTML = `<h3>Color the Cart</h3><canvas id="colorCanvas" width="360" height="200" style="border-radius:8px;display:block;background:linear-gradient(180deg,#2b2b2b,#1a1a1a)"></canvas><div style="margin-top:8px"><input type="color" id="picker" value="#ff2b2b"><button id="export" class="btn">Export PNG</button></div>`;
  document.querySelector('.games').appendChild(panel);
  const canvas = document.getElementById('colorCanvas'); const ctx = canvas.getContext('2d');
  function drawTemplate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // simple cart: body, window, wheel
    ctx.fillStyle = '#a62020'; ctx.fillRect(40,60,280,90);
    ctx.fillStyle = '#ffd166'; ctx.fillRect(64,76,60,30);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(80,168,22,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(200,168,22,0,Math.PI*2); ctx.fill();
  }
  drawTemplate();
  document.getElementById('picker').addEventListener('input', (e)=>{ const col=e.target.value; ctx.fillStyle = col; ctx.fillRect(40,60,280,90); // recolor body
    // redraw window and wheels
    ctx.fillStyle = '#ffd166'; ctx.fillRect(64,76,60,30);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(80,168,22,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(200,168,22,0,Math.PI*2); ctx.fill(); });
  document.getElementById('export').addEventListener('click', ()=>{ const url=canvas.toDataURL('image/png'); const a=document.createElement('a'); a.href=url; a.download='cart.png'; a.click(); });
}

// next question
document.addEventListener('click', e=>{
  if(e.target && e.target.id === 'nextQ') renderQuiz();
  if(e.target && e.target.tagName === 'BUTTON' && e.target.closest('#quizChoices')){
    // after choosing, automatically offer another question
    setTimeout(renderQuiz,400);
  }
});
