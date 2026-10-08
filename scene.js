const W=1000,H=650;
const palette={ground:['#354c3e','#3a5040','#3e5542','#3b5140','#425842'],stone:['#767968','#858775','#656f62','#90927c'],water:['#274f50','#2e5a59','#315b58']};
function randomGenerator(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};}
function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
export function project(x,y){return {x:290+x*58-y*28,y:235+x*16+y*32};}
function diamond(c,x,y,color){poly(c,[[x,y],[x+58,y+16],[x+30,y+48],[x-28,y+32]],color);}
function glow(c,x,y,size,color){const g=c.createRadialGradient(x,y,0,x,y,size);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-size,y-size,size*2,size*2);}
function pixelCharacter(c,x,y,scale=2,phase=0,mentor=false){
  const colors=mentor?{h:'#c4baa0',d:'#899785',m:'#526e61',l:'#b7c7a2'}:{h:'#594738',d:'#cdab70',m:'#4d756c',l:'#9ebea0'};
  const sprite=['     hhhh     ','    hhhhhhh   ','    hfffhf    ','    hfffff    ','     ffff     ','   dddddddd   ','  dmmddmmmmd  ','  fmmddmmmmf  ','  fmmddmmmmf  ','   mmddmmmm   ','   mmmmmmmm   ','    bbbbbb    ','    bb  bb    ','    bb  bb    ','   bbb  bbb   '];
  const dict={h:colors.h,f:'#d8ba8d',d:colors.d,m:colors.m,b:'#393d35'};
  c.save();c.translate(Math.round(x-13*scale/2),Math.round(y-15*scale));
  for(let row=0;row<sprite.length;row++)for(let col=0;col<sprite[row].length;col++){const color=dict[sprite[row][col]];if(!color)continue;c.fillStyle=color;const shift=row>11?Math.round(Math.sin(phase)*(col<7?1:-1)):0;c.fillRect(col*scale,row*scale+shift*scale,scale,scale);}
  c.fillStyle='#f0d594';c.fillRect(3*scale,6*scale,2*scale,scale);c.fillStyle='#302e26';c.fillRect(7*scale,3*scale,scale,scale);c.restore();
}

export class Scene {
  constructor(canvas){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.base=document.createElement('canvas');this.base.width=W;this.base.height=H;this.front=document.createElement('canvas');this.front.width=W;this.front.height=H;
    this.hero={x:1,y:3};this.world={lamps:[],lit:[],runes:[],barrier:null};this.grid=false;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.fx=[];this.time=0;this.tween=null;this.ambient=true;this.chapter=0;this.canvaImage=new Image();this.canvaImage.decoding='async';this.canvaImage.src='./assets/canva-forest-v1.jpg';this.canvaImage.onload=()=>{this.canvaReady=true;};this.canvaReady=false;this.build();
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();this.last=0;this.frame=this.frame.bind(this);requestAnimationFrame(this.frame);
    const portrait=document.getElementById('portrait');const pc=portrait.getContext('2d');pc.imageSmoothingEnabled=false;pixelCharacter(pc,30,69,4,0,true);
  }
  resize(){const r=this.canvas.getBoundingClientRect();this.width=r.width;this.height=r.height;const d=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);this.ctx.setTransform(this.canvas.width/W,0,0,this.canvas.height/H,0,0);this.ctx.imageSmoothingEnabled=false;}
  build(){
    const c=this.base.getContext('2d'),f=this.front.getContext('2d'),rand=randomGenerator(894);
    const randInt=(a,b)=>Math.floor(a+rand()*(b-a));
    const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#142c2c');sky.addColorStop(.55,'#344a3b');sky.addColorStop(1,'#152b29');c.fillStyle=sky;c.fillRect(0,0,W,H);
    function tree(ctx,x,y,s=1,type=0){
      ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(s,s);
      ctx.fillStyle='#0b221b44';ctx.beginPath();ctx.ellipse(5,1,35,11,0,0,7);ctx.fill();
      ctx.fillStyle='#3c4130';ctx.fillRect(-5,-72,9,75);ctx.fillStyle='#74745b';ctx.fillRect(-5,-66,3,68);
      if(type===0){for(let layer=0;layer<4;layer++){let yy=-127+layer*22;let half=22+layer*10;poly(ctx,[[-half,yy+43],[0,yy-22],[half,yy+43]],['#315848','#284b3f','#244639','#203d31'][layer]);poly(ctx,[[0,yy-22],[-half,yy+43],[-half+13,yy+43],[5,yy+3]],'#50775a55');for(let j=0;j<18;j++){const xx=randInt(-half+8,half-8),py=yy+randInt(21,43);ctx.fillStyle=rand()>.4?'#40634b':'#172f29';ctx.fillRect(xx,py,randInt(2,7),2);}}}
      else{for(let i=0;i<27;i++){let px=Math.sin(i*2.4)*randInt(10,40),py=-66-Math.cos(i*2.4)*randInt(15,38);ctx.fillStyle=['#425f42','#547047','#344f39','#4c6441'][i%4];ctx.fillRect(Math.round(px)-13,Math.round(py)-13,27,25);}for(let i=0;i<30;i++){ctx.fillStyle='#87926244';ctx.fillRect(randInt(-38,35),randInt(-100,-43),4,3);}}
      ctx.restore();
    }
    // Distant woodland has its own softened depth layer.
    const distant=document.createElement('canvas');distant.width=W;distant.height=H;let dc=distant.getContext('2d');
    for(let i=0;i<70;i++)tree(dc,randInt(-60,1060),randInt(60,320),rand()*.6+.65,i%6===0?1:0);
    c.filter='blur(3px)';c.globalAlpha=.7;c.drawImage(distant,0,0);c.filter='none';c.globalAlpha=1;
    for(let sum=-12;sum<36;sum++)for(let x=-7;x<19;x++){let y=sum-x;if(y< -8||y>18)continue;const p=project(x,y);if(p.x< -80||p.x>W+80||p.y<130||p.y>H+70)continue;let water=(x===3||x===4)&&y!==2;let road=y===3&&x>=0&&x<=9;let plaza=(x>=0&&x<=2&&y>=0&&y<=2)||(x>=5&&x<=8&&y>=0&&y<=2)||(x===4&&y===2);
      diamond(c,p.x,p.y,water&&!road?palette.water[randInt(0,3)]:road||plaza?palette.stone[randInt(0,4)]:palette.ground[randInt(0,5)]);
      if(water&&!road){for(let i=0;i<5;i++){c.fillStyle='#92b9a429';c.fillRect(p.x+randInt(-10,34),p.y+randInt(9,33),randInt(5,17),1);}continue;}
      for(let i=0;i<(road||plaza?8:11);i++){let xx=p.x+randInt(-14,34),yy=p.y+randInt(12,34);c.fillStyle=road||plaza?['#a8ac9055','#444e4640','#c4c6a533'][i%3]:['#71806355','#203d3355','#73835c44'][i%3];c.fillRect(xx,yy,road||plaza?randInt(5,13):randInt(1,4),road||plaza?2:randInt(2,5));}
      if(road){poly(c,[[p.x-28,p.y+32],[p.x+30,p.y+48],[p.x+30,p.y+55],[p.x-28,p.y+39]],water?'#555d4d':'#4a5844');if(water){c.fillStyle='#9d9f84';c.fillRect(p.x-24,p.y+31,9,7);c.fillRect(p.x+20,p.y+44,9,7);}}
    }
    // Banks, scattered stones and wildflowers.
    for(let i=0;i<140;i++){const tx=randInt(-4,13),ty=randInt(-3,11);if((tx>=0&&tx<=8&&ty>=0&&ty<=4)||(tx===3||tx===4))continue;const p=project(tx+rand(),ty+rand());if(p.y<190)continue;c.fillStyle=['#849468','#c4b875','#bda591','#5e7752'][i%4];c.fillRect(Math.round(p.x),Math.round(p.y),i%4===0?5:2,3);c.fillStyle='#476244';c.fillRect(Math.round(p.x),Math.round(p.y)+3,2,5);}
    function block(x,y,w,h,d,top='#8c8e74',side='#525f51'){
      poly(c,[[x,y-h],[x+w,y-h+d],[x+w,y+d],[x,y]],side);poly(c,[[x+w,y-h+d],[x+w+22,y-h+d-20],[x+w+22,y+d-20],[x+w,y+d]],'#3c4e44');poly(c,[[x,y-h],[x+22,y-h-20],[x+w+22,y-h+d-20],[x+w,y-h+d]],top);
    }
    function house(x,y,w=130,h=105){
      c.fillStyle='#07160c44';c.beginPath();c.ellipse(x+60,y+18,105,30,0,0,7);c.fill();
      block(x,y,w,h,35,'#b0a78a','#968c6e');
      poly(c,[[x,y-h],[x+w,y-h+35],[x+w,y+35],[x,y]],'#8b8669');
      for(let row=0;row<7;row++){c.strokeStyle='#555f4940';c.beginPath();c.moveTo(x,y-h+row*15);c.lineTo(x+w,y-h+row*15+35);c.stroke();}
      c.fillStyle='#4d5843';for(let i=0;i<4;i++)c.fillRect(x+i*w/3,y-h+i*12,6,h);
      poly(c,[[x-16,y-h+7],[x+47,y-h-67],[x+w+70,y-h-30],[x+w+10,y-h+46]],'#556d60','#233d32');
      poly(c,[[x+w+70,y-h-30],[x+w+33,y-h-47],[x+w+22,y-h+14],[x+w+10,y-h+46]],'#344c43');
      for(let row=0;row<8;row++){const yy=y-h-58+row*12;const x1=x+42-row*7;const x2=x1+w+17; c.strokeStyle=row%2?'#83907955':'#2b493f';c.lineWidth=2;c.beginPath();c.moveTo(x1,yy);c.lineTo(x2,yy+37);c.stroke();for(let j=0;j<8;j++){c.fillStyle='#a6ac8155';c.fillRect(x1+j*17+row%2*6,yy+j*4+5,4,2);}}
      for(let xx of [x+22,x+w-32]){const yy=y-h+29+(xx-x)*.27;glow(c,xx+7,yy+12,48,'#e8b36a28');c.fillStyle='#413f2e';c.fillRect(xx-2,yy-2,22,28);c.fillStyle='#d8b879';c.fillRect(xx,yy,17,23);c.fillStyle='#f6dca0';c.fillRect(xx+2,yy+2,12,18);c.fillStyle='#5e5840';c.fillRect(xx+7,yy,3,24);c.fillRect(xx,yy+10,17,3);}
      const doorX=x+w*.5;c.fillStyle='#3e4937';c.fillRect(doorX,y-38+18,23,48);c.fillStyle='#736e4c';c.fillRect(doorX+4,y-32+18,15,41);c.fillStyle='#c1b075';c.fillRect(doorX+15,y+12,2,3);
      block(x+w*.7,y-h-38,15,45,4,'#919681','#626b54');
      for(let i=0;i<7;i++){c.fillStyle='#6d855144';c.fillRect(x+randInt(-8,w+12),y-h+randInt(-25,35),randInt(5,15),4);}
    }
    house(210,280,131,110);house(666,316,117,114);
    // Mill wheel: dark timber spokes, segmented rim and wet highlights.
    c.save();c.translate(373,293);c.scale(.72,1);c.fillStyle='#273f35';c.beginPath();c.arc(0,0,44,0,7);c.fill();c.strokeStyle='#8e8461';c.lineWidth=9;c.stroke();for(let i=0;i<12;i++){c.rotate(Math.PI/6);c.strokeStyle='#746d50';c.lineWidth=6;c.beginPath();c.moveTo(0,0);c.lineTo(0,41);c.stroke();c.fillStyle='#b1a17a';c.fillRect(-5,-46,10,7);}c.fillStyle='#b5a478';c.fillRect(-7,-7,14,14);c.restore();
    // Ruined gate on the eastern hill, moss between individual stone blocks.
    for(let side=0;side<2;side++)for(let row=0;row<5;row++)block(568+side*83,267-row*22,27,21,7,row===4?'#afb08d':'#858e75',row%2?'#6f7d65':'#626f5c');
    for(let i=0;i<5;i++)block(578+i*19,166+Math.abs(2-i)*5,22,22,6,'#a7ab86','#738164');
    c.strokeStyle='#b1c78855';c.lineWidth=1;poly(c,[[619,190],[632,208],[619,227],[607,208]],null,'#b1c78855');glow(c,620,209,40,'#b4cb8920');
    // Stairs to the ruin.
    for(let i=0;i<5;i++)block(559-i*6,280+i*9,89,7,24,'#979c7b','#64705a');
    const trees=[[-80,285,1.7],[28,326,1.45],[98,252,1.35],[152,221,1.2],[404,208,1.2],[460,203,1.35],[512,185,1.2],[764,205,1.2],[842,278,1.55],[937,348,1.8],[1029,384,1.8],[860,460,1.25],[55,450,1.55],[138,383,.95],[775,412,.8]];
    trees.sort((a,b)=>a[1]-b[1]);for(const [x,y,s]of trees)tree(c,x,y,s,x%3===0?1:0);
    // Crates, plants and fence posts give the village human scale.
    for(const [x,y] of [[211,310],[194,314],[700,359],[724,366]]){block(x,y,16,19,5,'#9b9065','#716e4c');c.strokeStyle='#444d36';c.strokeRect(x+2,y-16,12,14);}
    for(const [x,y] of [[114,355],[160,368],[797,374],[830,385]]){c.fillStyle='#665f42';c.fillRect(x,y-23,5,26);c.fillStyle='#a3a17a';c.fillRect(x-1,y-25,7,4);}
    for(const [x,y]of [[199,329],[730,385],[553,284]]){c.fillStyle='#424f39';c.fillRect(x,y-42,4,44);c.fillStyle='#ac9c60';c.fillRect(x-5,y-50,14,13);c.fillStyle='#f4d398';c.fillRect(x-2,y-48,8,9);glow(c,x+2,y-43,56,'#eec57537');}
    pixelCharacter(c,350,331,1.75,0,true);
    // Foreground silhouettes are separate so characters pass behind them.
    tree(f,-2,663,2.1);tree(f,74,729,2.2);tree(f,966,682,2.0);tree(f,1051,680,2.2);
    f.filter='blur(1px)';
    // Atmosphere: angled shafts of light and mist, applied once to scenery.
    c.globalCompositeOperation='screen';const light=c.createLinearGradient(270,0,630,550);light.addColorStop(0,'#cdcf7b15');light.addColorStop(1,'#d9d8a000');poly(c,[[290,0],[344,0],[738,650],[590,650]],light);poly(c,[[400,0],[416,0],[888,650],[800,650]],light);c.globalCompositeOperation='source-over';
    const shade=c.createLinearGradient(0,0,0,650);shade.addColorStop(0,'#0a232540');shade.addColorStop(.5,'transparent');shade.addColorStop(1,'#0b211633');c.fillStyle=shade;c.fillRect(0,0,W,H);
  }
  setWorld(world,chapter=0){this.world=structuredClone(world);this.hero={x:world.x,y:world.y};this.chapter=chapter;this.tween=null;this.fx=[];this.awakened=false;}
  reset(world,chapter){this.setWorld(world,chapter);}
  effect(kind,x,y){const p=project(x,y);for(let i=0;i<24;i++)this.fx.push({x:p.x+14,y:p.y-12,vx:(Math.random()-.5)*90,vy:-Math.random()*85-10,life:1.3,color:kind==='cast'?'#c4c0f0':'#ead593'});}
  apply(event){
    if(event.kind==='move'){this.tween={from:{...this.hero},to:{x:event.x,y:event.y},start:performance.now(),duration:this.reduced?40:480};}
    if(event.kind==='light'){this.world.lit.push([event.x,event.y]);this.effect('light',event.x,event.y);}
    if(event.kind==='cast'){this.world.barrier=null;this.effect('cast',event.x,event.y);this.flash=.4;}
    if(event.kind==='activate'){this.world.gate=true;this.effect('light',this.hero.x,this.hero.y);this.awakened=true;}
    if(event.kind==='collect'){this.world.collected=true;this.effect('light',this.hero.x,this.hero.y);}
    if(event.kind==='attune'){this.world.runes.push(event.rune);this.effect('light',this.hero.x,this.hero.y);}
    if(event.kind==='print'&&event.text==='Hello, world!'){this.awakened=true;this.effect('light',this.hero.x,this.hero.y);}
  }
  frame(now){
    const dt=Math.min((now-this.last)/1000||0,.05);this.last=now;if(!this.reduced)this.time+=dt;const c=this.ctx,t=this.time;
    c.clearRect(0,0,W,H);c.drawImage(this.base,0,0);
    // Use the Canva village render as a soft atmosphere pass. Gameplay geometry
    // remains deterministic in this canvas, so the road and targets stay reliable.
    if(this.canvaReady){c.save();c.globalAlpha=.13;c.globalCompositeOperation='soft-light';c.drawImage(this.canvaImage,0,0,W,H);c.restore();}
    // Moving highlights skim the river. They are drawn only on water tiles.
    if(!this.reduced)for(let i=0;i<38;i++){let y=(i*.43+t*.24)%14-3;const p=project(i%2+3.1,y);if(y>1.8&&y<4.2)continue;c.fillStyle=`rgba(153,193,173,${.1+Math.sin(t+i)*.06})`;c.fillRect(Math.round(p.x+8),Math.round(p.y+12),8+i%11,1);}
    if(this.chapter>3){c.fillStyle='#25203922';c.fillRect(0,0,W,H);}
    if(this.grid)for(let x=0;x<9;x++)for(let y=0;y<5;y++){let p=project(x,y);diamond(c,p.x,p.y,'#dace9310');poly(c,[[p.x,p.y],[p.x+58,p.y+16],[p.x+30,p.y+48],[p.x-28,p.y+32]],null,'#dace932a');c.font='8px monospace';c.fillStyle='#e3deb877';c.fillText(`${x},${y}`,p.x+3,p.y+25);}
    if(this.world.target){let p=project(...this.world.target);let pulse=.55+Math.sin(t*2)*.15;c.globalAlpha=pulse;poly(c,[[p.x+14,p.y+3],[p.x+35,p.y+22],[p.x+12,p.y+36],[p.x-7,p.y+19]],'#d2c08522','#cbb774');c.globalAlpha=1;glow(c,p.x+14,p.y+18,40,this.world.gate?'#e8d89177':'#e8d89122');}
    for(const lamp of this.world.lamps){const p=project(...lamp),lit=this.world.lit.some(a=>a[0]===lamp[0]&&a[1]===lamp[1]);c.fillStyle='#394638';c.fillRect(p.x+26,p.y-31,5,46);c.fillStyle='#8c8963';c.fillRect(p.x+20,p.y-40,16,16);c.fillStyle=lit?'#f4d99c':'#405647';c.fillRect(p.x+23,p.y-37,10,10);if(lit)glow(c,p.x+28,p.y-30,64,'#e4bd6660');}
    if(this.world.barrier){const p=project(...this.world.barrier),bob=Math.sin(t*2)*3;glow(c,p.x+14,p.y-14,34,'#9e8ecc35');poly(c,[[p.x-4,p.y+6],[p.x-2,p.y-24+bob],[p.x+10,p.y-40+bob],[p.x+28,p.y-24+bob],[p.x+32,p.y+6],[p.x+23,p.y+2],[p.x+14,p.y+8],[p.x+5,p.y+1]],'#363447');c.fillStyle='#d6aadf';c.fillRect(p.x+5,p.y-23+bob,5,3);c.fillRect(p.x+19,p.y-23+bob,5,3);}
    if(this.tween){let k=Math.min(1,(now-this.tween.start)/this.tween.duration);let ease=k*k*(3-2*k);this.hero.x=this.tween.from.x+(this.tween.to.x-this.tween.from.x)*ease;this.hero.y=this.tween.from.y+(this.tween.to.y-this.tween.from.y)*ease;if(k===1){this.hero={...this.tween.to};this.tween=null;}}
    let hp=project(this.hero.x,this.hero.y);c.fillStyle='#09181070';c.beginPath();c.ellipse(hp.x+14,hp.y+20,18,7,0,0,7);c.fill();glow(c,hp.x+14,hp.y,35,this.awakened?'#dcd1933a':'#e5d59513');pixelCharacter(c,hp.x+14,hp.y+20,2.5,this.tween?t*17:0);c.fillStyle='#e1d8a1';poly(c,[[hp.x+10,hp.y-35],[hp.x+18,hp.y-35],[hp.x+14,hp.y-30]],'#e1d8a1');
    if(!this.world.collected&&(this.chapter===2||this.chapter===7)){let p=project(1,3);let yy=p.y-7+Math.sin(t*2)*4;poly(c,[[p.x+38,yy-10],[p.x+44,yy],[p.x+38,yy+10],[p.x+32,yy]],'#b3d2ae');glow(c,p.x+38,yy,20,'#c3e2af55');}
    if(this.chapter===6){let p=project(4,2);for(let i=0;i<3;i++){let x=p.x-30+i*30,y=p.y-40;glow(c,x,y,25,i<this.world.runes.length?'#e4d39666':'#aab79315');c.fillStyle=i<this.world.runes.length?'#e4d396':'#849175';c.font='18px Georgia';c.fillText(['☀','☽','✦'][i],x-8,y);}}
    if(this.awakened)glow(c,hp.x+10,hp.y-28,160,'#d6bb6427');
    for(const p of this.fx){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;c.globalAlpha=Math.max(0,p.life/1.3);c.fillStyle=p.color;c.fillRect(Math.round(p.x),Math.round(p.y),3,3);}this.fx=this.fx.filter(p=>p.life>0);c.globalAlpha=1;
    c.drawImage(this.front,0,0);
    if(!this.reduced){for(let i=0;i<32;i++){let x=(i*137.6+Math.sin(t*.3+i)*27)%W,y=180+(i*57.7+Math.cos(t*.4+i)*19)%420;let alpha=Math.max(0,Math.sin(t+i*1.8))*.7;glow(c,x,y,6,`rgba(217,213,136,${alpha*.23})`);c.fillStyle=`rgba(228,223,159,${alpha})`;c.fillRect(Math.round(x),Math.round(y),2,2);}}
    const fog=c.createLinearGradient(0,0,W,0);fog.addColorStop(0,'#b4cbb708');fog.addColorStop(.5,'#b4cbb715');fog.addColorStop(1,'transparent');c.fillStyle=fog;c.fillRect(0,150+Math.sin(t*.12)*15,W,105);
    if(this.flash>0){c.fillStyle=`rgba(216,205,242,${this.flash*.35})`;c.fillRect(0,0,W,H);this.flash-=dt;}
    requestAnimationFrame(this.frame);
  }
}
