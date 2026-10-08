(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  const overlay = $('overlay'), keys = new Set();
  let width, height, state = 'ready', previous = 0, elapsed = 0, score = 0, lives = 3;
  let rocks = [], gems = [], particles = [], stars = [], spawn = 0, gemSpawn = 0, invincible = 0, sector = 1, best = 0, toastTime = 0;
  let ship = { x: 0, y: 0 }, pointerTarget = null;
  try { best = Number(localStorage.getItem('starfall-best')) || 0; } catch {}
  $('best').textContent = String(best).padStart(4, '0');
  const random = (a, b) => a + Math.random() * (b - a);
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const oldWidth = width || rect.width;
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * devicePixelRatio); canvas.height = Math.round(height * devicePixelRatio);
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ship.x = ship.x ? ship.x / oldWidth * width : width / 2; ship.y = height - 74;
    stars = Array.from({length: 95}, () => ({x: random(0,width), y: random(0,height), r: random(.4,1.5), speed: random(8,40), alpha: random(.12,.7)}));
  }
  new ResizeObserver(resize).observe(canvas);
  function updateHUD() {
    $('score').textContent = String(Math.floor(score)).padStart(4,'0');
    $('lives').textContent = '◆ '.repeat(lives) + '◇ '.repeat(3-lives);
    $('timer').textContent = `${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;
    $('level').textContent = `SECTOR ${String(sector).padStart(2,'0')}`;
  }
  function start() {
    if (state === 'paused') { resume(); return; }
    state = 'playing'; elapsed = score = spawn = invincible = 0; gemSpawn = .7; lives = 3; sector = 1;
    rocks = []; gems = []; particles = []; keys.clear(); pointerTarget = null; toastTime = 0; $('toast').classList.remove('visible');
    ship = {x:width/2,y:height-74}; overlay.classList.add('hidden'); $('pause').disabled = false; $('start').blur(); updateHUD();
  }
  function showOverlay(label, title, description, button, hint) {
    $('overlay-label').textContent = label; $('overlay-title').textContent = title; $('overlay-text').textContent = description;
    $('start').replaceChildren(document.createTextNode(button), Object.assign(document.createElement('span'),{textContent:'↗'}));
    $('start-hint').textContent = hint; overlay.classList.remove('hidden');
  }
  function pause() {
    if (state !== 'playing') return;
    state = 'paused'; keys.clear(); pointerTarget = null;
    showOverlay('FLIGHT PAUSED','在星海中，歇一会。','航程已暂停，你的飞船正在等待。','继续航程','空格键 / P 继续');
    $('pause').textContent = '▷'; $('pause').setAttribute('aria-label','继续游戏');
  }
  function resume() {state='playing';overlay.classList.add('hidden');$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','暂停游戏');}
  function end() {
    state='over'; $('pause').disabled=true;
    const result=Math.floor(score), record=result>best;
    if(record){best=result;try{localStorage.setItem('starfall-best',String(best));}catch{} $('best').textContent=String(best).padStart(4,'0');}
    showOverlay(record?'NEW PERSONAL BEST':'FLIGHT COMPLETE',record?'新的纪录，新的星海。':'这段航程，值得纪念。',`得分 ${result} · 飞行 ${Math.floor(elapsed)} 秒 · 抵达星区 ${sector}`,'再次出发','按空格键 再挑战一次');
  }
  function burst(x,y,color,count=16){for(let i=0;i<count;i++)particles.push({x,y,vx:random(-120,120),vy:random(-120,120),life:random(.3,.75),color});}
  function update(dt){
    elapsed+=dt;score+=dt*8;invincible=Math.max(0,invincible-dt);
    const next=1+Math.floor(elapsed/20);
    if(next!==sector){sector=next;$('toast').textContent=`星区 ${String(sector).padStart(2,'0')} · 陨石正在加速`;toastTime=2.5;$('toast').classList.add('visible');}
    if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('visible');}
    let direction=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0);
    if(direction){ship.x+=direction*420*dt;pointerTarget=null;}
    else if(pointerTarget!==null)ship.x+=(pointerTarget-ship.x)*Math.min(1,dt*18);
    ship.x=Math.max(20,Math.min(width-20,ship.x));
    spawn-=dt;gemSpawn-=dt;
    if(spawn<=0){const r=random(15,30);rocks.push({x:random(r,width-r),y:-45,r,speed:random(110,165)+Math.min(sector-1,14)*20,rotation:random(0,6),spin:random(-1,1),shape:Array.from({length:8},()=>random(.7,1.15))});spawn=Math.max(.19,.75-(sector-1)*.045);}
    if(gemSpawn<=0){gems.push({x:random(30,width-30),y:-20,r:9});gemSpawn=random(1.3,2.3);}
    for(const rock of rocks){rock.y+=rock.speed*dt;rock.rotation+=rock.spin*dt;if(!rock.hit&&invincible<=0&&Math.hypot(rock.x-ship.x,rock.y-ship.y)<rock.r+11){rock.hit=true;lives--;invincible=1.7;burst(ship.x,ship.y,'#ff907d',25);if(lives<=0){updateHUD();end();return;}}}
    for(const gem of gems){gem.y+=(125+sector*8)*dt;if(!gem.hit&&Math.hypot(gem.x-ship.x,gem.y-ship.y)<27){gem.hit=true;score+=100;burst(gem.x,gem.y,'#f8d789');}}
    rocks=rocks.filter(r=>r.y<height+50&&!r.hit);gems=gems.filter(g=>g.y<height+30&&!g.hit);
    updateHUD();
  }
  function draw(dt,time){
    ctx.clearRect(0,0,width,height);
    const glow=ctx.createRadialGradient(width*.5,height*.48,0,width*.5,height*.48,width*.65);glow.addColorStop(0,'#142b3b');glow.addColorStop(1,'#080f1b');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    ctx.strokeStyle='#7fbece06';ctx.lineWidth=1;for(let x=0;x<width;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}for(let y=0;y<height;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
    for(const star of stars){if(state!=='paused')star.y=(star.y+star.speed*dt)%height;ctx.fillStyle=`rgba(190,224,240,${star.alpha})`;ctx.beginPath();ctx.arc(star.x,star.y,star.r,0,Math.PI*2);ctx.fill();}
    // Distant orbital paths give the playfield a quiet sense of scale.
    ctx.strokeStyle='#9ec3d20a';ctx.beginPath();ctx.ellipse(width*.5,height*.45,width*.37,height*.53,-.35,0,Math.PI*2);ctx.stroke();
    for(const rock of rocks){ctx.save();ctx.translate(rock.x,rock.y);ctx.rotate(rock.rotation);ctx.beginPath();rock.shape.forEach((n,i)=>{let a=i/8*Math.PI*2;let x=Math.cos(a)*rock.r*n,y=Math.sin(a)*rock.r*n;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.fillStyle='#302c36';ctx.strokeStyle='#a7808177';ctx.lineWidth=1.5;ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(-rock.r*.2,-rock.r*.1,rock.r*.27,0,Math.PI*2);ctx.strokeStyle='#aa878323';ctx.stroke();ctx.restore();}
    for(const gem of gems){ctx.save();ctx.translate(gem.x,gem.y);ctx.rotate(time*.001);ctx.shadowColor='#f6d48a';ctx.shadowBlur=17;ctx.fillStyle='#f6d48a';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(4,-4);ctx.lineTo(11,0);ctx.lineTo(4,4);ctx.lineTo(0,11);ctx.lineTo(-4,4);ctx.lineTo(-11,0);ctx.lineTo(-4,-4);ctx.closePath();ctx.fill();ctx.restore();}
    if(state!=='over'){
      ctx.save();ctx.translate(ship.x,ship.y);ctx.globalAlpha=invincible>0&&Math.floor(invincible*12)%2?.3:1;
      ctx.shadowColor='#a5f7da';ctx.shadowBlur=18;ctx.fillStyle='#a5f7da';ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(17,14);ctx.lineTo(0,7);ctx.lineTo(-17,14);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#234b51';ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(5,5);ctx.lineTo(-5,5);ctx.closePath();ctx.fill();
      ctx.fillStyle='#b4f9d177';ctx.beginPath();ctx.moveTo(-5,15);ctx.lineTo(0,26+Math.sin(time*.025)*6);ctx.lineTo(5,15);ctx.fill();ctx.restore();
    }
    for(const p of particles){if(state!=='paused'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}ctx.globalAlpha=Math.max(0,p.life/.75);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);}ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);
  }
  function frame(time){const dt=Math.min((time-previous)/1000||0,.04);previous=time;if(state==='playing')update(dt);draw(dt,time);requestAnimationFrame(frame);}
  $('start').addEventListener('click',start);$('pause').addEventListener('click',()=>state==='paused'?resume():pause());
  window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight',' ','a','d','p'].includes(e.key.toLowerCase())||['ArrowLeft','ArrowRight'].includes(e.key)){if(e.target instanceof HTMLButtonElement&&e.key===' ')return;e.preventDefault();}if(e.repeat)return;const key=e.key.length===1?e.key.toLowerCase():e.key;keys.add(key);if(key===' '&&state!=='playing')start();else if(key==='p')state==='paused'?resume():pause();});
  window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
  window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  canvas.addEventListener('pointerdown',e=>{if(state!=='playing')return;canvas.setPointerCapture(e.pointerId);pointerTarget=e.clientX-canvas.getBoundingClientRect().left;});
  canvas.addEventListener('pointermove',e=>{if(state==='playing'&&canvas.hasPointerCapture(e.pointerId))pointerTarget=e.clientX-canvas.getBoundingClientRect().left;});
  canvas.addEventListener('pointerup',()=>pointerTarget=null);canvas.addEventListener('pointercancel',()=>pointerTarget=null);
  resize();requestAnimationFrame(frame);
})();
