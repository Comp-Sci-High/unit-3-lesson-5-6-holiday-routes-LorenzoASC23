// Populate a long train of carts, each cart displays one fact.
// Use shared FACTS from `fact-data.js` (array of objects with id/title/short/detail)


function makeEngine(){
  const el = document.createElement('div');
  el.className = 'engine';
  el.innerHTML = `
    <div class="face">
      <div style="flex:1">
        <div style="height:36px;background:rgba(0,0,0,0.05);border-radius:6px;margin-bottom:8px"></div>
        <div style="height:12px;width:80%;background:rgba(255,255,255,0.06);border-radius:4px"></div>
      </div>
      <div class="chimney" aria-hidden="true"></div>
    </div>
      <div class="wreath" aria-hidden="true"><div class="bow-wreath">🎀</div></div>
    <div style="display:flex;gap:12px;align-items:center;margin-top:10px">
      <div style="width:46px;height:46px;border-radius:8px;background:var(--gold)"></div>
      <div style="flex:1;color:rgba(255,255,255,0.9);font-weight:700">Christmas Express</div>
    </div>
    <div class="lights" aria-hidden="true"><div class="bar"></div></div>
  `;
  return el;
}

// smoke puffs: create small elements that animate upward and are removed after finishing
let smokeInterval = null;
function startSmoke(){
  stopSmoke();
  const engine = document.querySelector('.engine');
  if(!engine) return;
  const chimney = engine.querySelector('.chimney');
  if(!chimney) return;
  smokeInterval = setInterval(()=>{
    const puff = document.createElement('div');
    puff.className = 'smoke';
    // small variance
    const left = Math.random()*12 - 6;
    puff.style.left = `calc(100% - 22px + ${left}px)`;
    chimney.appendChild(puff);
    // remove after animation
    puff.addEventListener('animationend', ()=> puff.remove());
  }, 900 + Math.random()*1200);
}
function stopSmoke(){ if(smokeInterval){ clearInterval(smokeInterval); smokeInterval = null } }

function makeCart(factObj){
  const cart = document.createElement('div');
  cart.className = 'cart';
  if((factObj.id || 0) % 2 === 0) cart.classList.add('bob');
  cart.setAttribute('role', 'button');
  cart.tabIndex = 0;
  cart.dataset.id = factObj.id;
  cart.setAttribute('aria-label', `Open details about ${factObj.title}`);
  cart.title = `Click to open fact details. Double-click (or long-press) to open full article: ${factObj.title}`;
  // small hint element for hover
  const hint = document.createElement('div');
  hint.className = 'hint';
  hint.textContent = 'Double-click for article';
  cart.appendChild(hint);

  // ornaments
  const ornaments = document.createElement('div');
  ornaments.className = 'ornaments';
  const g1 = document.createElement('span'); g1.className = 'g1';
  const g2 = document.createElement('span'); g2.className = 'g2';
  const g3 = document.createElement('span'); g3.className = 'g3';
  ornaments.appendChild(g1); ornaments.appendChild(g2); ornaments.appendChild(g3);
  cart.appendChild(ornaments);

  // small icon for the cart (emoji-based, lightweight)
  const icons = ['🎄','🎁','🎶','🕯️','🦌','🍪','⭐','🕊️','🎅'];
  const ic = document.createElement('div'); ic.style.fontSize = '20px'; ic.style.marginRight = '8px';
  ic.textContent = icons[(factObj.id || 0) % icons.length];
  // place the icon inside title area when title is added

  // CTA overlay
  const cta = document.createElement('div'); cta.className = 'cta'; cta.textContent = 'Read more →';
  cart.appendChild(cta);
  // gift on top
  const gift = document.createElement('div'); gift.className = 'gift'; gift.innerHTML = `<div class="bow">🎀</div><div class="box"></div>`;
  cart.appendChild(gift);
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = factObj.title || 'Christmas Fact';
  // prepend small icon into title
  if(ic) title.prepend(ic);
  const p = document.createElement('p');
  p.textContent = factObj.short || '';
  const wheels = document.createElement('div');
  wheels.className = 'cart-wheels';
  const wheel1 = document.createElement('div'); wheel1.className = 'wheel';
  const wheel2 = document.createElement('div'); wheel2.className = 'wheel';
  wheels.appendChild(wheel1); wheels.appendChild(wheel2);
  cart.appendChild(title);
  cart.appendChild(p);
  cart.appendChild(wheels);
  return cart;
}

function buildTrain(){
  const train = document.getElementById('train');
  if(!train) return;
  train.innerHTML = '';
  // Build one logical unit (engine + all carts). We'll ensure unit is wide enough to fill the viewport,
  // then duplicate the full sequence so the animation can translate -50% for a seamless left-loop.
  const scroller = document.querySelector('.train-scroller');
  const source = window.FACTS && Array.isArray(window.FACTS) ? window.FACTS : [];

  const unit = document.createElement('div');
  unit.className = 'unit';
  unit.style.display = 'flex';
  unit.style.gap = '20px';
  unit.appendChild(makeEngine());
  source.forEach(f => unit.appendChild(makeCart(f)));

  // Append a first copy of the unit
  train.appendChild(unit.cloneNode(true));

  // Ensure the unit width covers the scroller viewport (avoid gaps when looping)
  let unitWidth = train.getBoundingClientRect().width;
  // If scroller isn't ready yet, force a layout read
  const scrollerWidth = scroller.clientWidth || document.documentElement.clientWidth;
  while(unitWidth < scrollerWidth){
    train.appendChild(unit.cloneNode(true));
    unitWidth = train.getBoundingClientRect().width;
    // Safety guard to avoid infinite loop
    if(train.children.length > 20) break;
  }

  // Now duplicate the entire current content so animation can move -50% (one full sequence)
  const currentChildren = Array.from(train.children).map(n => n.cloneNode(true));
  currentChildren.forEach(n => train.appendChild(n));

  // Compute duration so speed feels consistent regardless of width: speedPxPerSec controls pace
  const fullWidth = train.scrollWidth; // the total width after duplication
  const singleSequenceWidth = fullWidth / 2; // one sequence worth of movement
  const speedPxPerSec = 120; // pixels per second (tweakable)
  let durationSec = Math.max(12, Math.round(singleSequenceWidth / speedPxPerSec));
  document.documentElement.style.setProperty('--train-duration', durationSec + 's');
  // start smoke only after building train
  startSmoke();
}

function addCartNavigation(){
  const carts = document.querySelectorAll('.cart');
  carts.forEach(c => {
    c.style.cursor = 'pointer';
    // Distinguish single vs double click: single -> fact page, double -> article page
    let clickTimer = null;
    c.addEventListener('click', (e)=>{
      // set short delay so dblclick can cancel
      if(clickTimer) clearTimeout(clickTimer);
      clickTimer = setTimeout(()=>{
        const id = c.dataset.id;
        if(id !== undefined) location.href = `fact.html?id=${id}`;
      }, 260);
    });
    c.addEventListener('dblclick', (e)=>{
      if(clickTimer) clearTimeout(clickTimer);
      const id = c.dataset.id;
      if(id !== undefined) location.href = `article.html?id=${id}`;
    });

    // Long-press (touch) support to open article
    let pressTimer = null;
    const startPress = (evt)=>{
      if(pressTimer) clearTimeout(pressTimer);
      pressTimer = setTimeout(()=>{
        const id = c.dataset.id;
        if(id !== undefined) location.href = `article.html?id=${id}`;
      }, 600);
    };
    const cancelPress = ()=>{ if(pressTimer) clearTimeout(pressTimer); pressTimer = null };
    c.addEventListener('pointerdown', (e)=>{ if(e.pointerType === 'touch') startPress(e); });
    c.addEventListener('pointerup', cancelPress);
    c.addEventListener('pointercancel', cancelPress);
    c.addEventListener('touchstart', startPress, {passive:true});
    c.addEventListener('touchend', cancelPress);
    c.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' ') location.href = `fact.html?id=${c.dataset.id}`;
    });

    // Pause train when hovering or focusing a cart for easier reading
    const trainEl = document.querySelector('.train');
    const pause = ()=>{ if(trainEl) trainEl.style.animationPlayState = 'paused'; };
    const resume = ()=>{ if(trainEl) trainEl.style.animationPlayState = 'running'; };
    c.addEventListener('mouseenter', pause);
    c.addEventListener('mouseleave', resume);
    c.addEventListener('focus', pause);
    c.addEventListener('blur', resume);

    // decorate bulbs and small sparkles per cart (do this here so we have element references)
    if(!c.querySelector('.spark')){
      const s1 = document.createElement('div'); s1.className = 'spark s1';
      const s2 = document.createElement('div'); s2.className = 'spark s2';
      c.appendChild(s1); c.appendChild(s2);
    }
  });
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=>{ buildTrain(); addCartNavigation(); });
} else { buildTrain(); addCartNavigation(); }

// Stop smoke when page is hidden to save CPU and restart when visible
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden) stopSmoke(); else startSmoke();
});

// Controls: play/pause, speed slider, lights toggle
const playPauseBtn = () => document.getElementById('playPause');
const speedInput = () => document.getElementById('speed');
const lightsBtn = () => document.getElementById('lightsToggle');

function setupControls(){
  const trainEl = document.querySelector('.train');
  const play = ()=>{ if(trainEl) trainEl.style.animationPlayState = 'running'; startSmoke(); if(lightsBtn()) lightsBtn().textContent = `Lights: On`; };
  const pause = ()=>{ if(trainEl) trainEl.style.animationPlayState = 'paused'; stopSmoke(); if(lightsBtn()) lightsBtn().textContent = `Lights: Off`; };

  const pbtn = playPauseBtn();
  if(pbtn){
    pbtn.addEventListener('click', ()=>{
      if(pbtn.dataset.state === 'paused'){
        pbtn.dataset.state = 'running'; pbtn.textContent = 'Pause'; play();
      } else { pbtn.dataset.state = 'paused'; pbtn.textContent = 'Play'; pause(); }
    });
    pbtn.dataset.state = 'running';
  }

  const s = speedInput();
  if(s){
    s.addEventListener('input', ()=>{
      // speed multiplier changes the duration: lower speed value => faster (duration = base / speed)
      const multiplier = parseFloat(s.value) || 1;
      // read current base duration (seconds) and set CSS variable to scaled value
      const base = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--train-duration')) || 28;
      // base might be like '28s'
      const seconds = typeof base === 'string' && base.endsWith('s') ? parseFloat(base) : parseFloat(base);
      const newDuration = Math.max(6, Math.round(seconds / multiplier));
      document.documentElement.style.setProperty('--train-duration', newDuration + 's');
    });
  }

  const lbtn = lightsBtn();
  if(lbtn){
    lbtn.addEventListener('click', ()=>{
      const on = !document.documentElement.classList.toggle('lights-off');
      lbtn.textContent = `Lights: ${on? 'On' : 'Off'}`;
      // visually dim bulbs when off
    });
  }

  const gbtn = document.getElementById('gamesBtn');
  if(gbtn) gbtn.addEventListener('click', ()=> location.href = 'games.html');

  const themeSelect = document.getElementById('themeSelect');
  if(themeSelect){
    themeSelect.addEventListener('change', ()=>{
      document.documentElement.dataset.theme = themeSelect.value;
    });
  }
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupControls); else setupControls();
