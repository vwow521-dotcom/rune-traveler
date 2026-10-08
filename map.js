import { levels } from './levels.js';

export function mapMarkup(current,completed){
  const points=[[9,64],[21,43],[32,61],[44,39],[56,56],[67,29],[78,48],[90,24]];
  const path=points.map(([x,y],i)=>`${i?'L':'M'}${x*7},${y*2.5}`).join(' ');
  let forest='';
  for(let i=0;i<42;i++){const x=12+(i*127)%680,y=25+(i*53)%205;forest+=`<path d="M${x-6} ${y+8} L${x} ${y-8} L${x+6} ${y+8}Z" fill="${i%2?'#456344':'#3c563c'}" opacity=".4"/>`;}
  return `<div class="world-map" aria-label="旅程路线图"><svg viewBox="0 0 700 250" preserveAspectRatio="none" aria-hidden="true"><defs><radialGradient id="map-glow"><stop stop-color="#4b5d38" stop-opacity=".55"/><stop offset="1" stop-color="#162a20"/></radialGradient></defs><rect width="700" height="250" fill="url(#map-glow)"/>${forest}<path d="M260 -20 C230 70 390 60 320 140 S340 230 350 270" fill="none" stroke="#385d58" stroke-width="24" opacity=".6"/><path d="M260 -20 C230 70 390 60 320 140 S340 230 350 270" fill="none" stroke="#84a292" stroke-width="1" opacity=".25"/><path d="${path}" fill="none" stroke="#b4a16a" stroke-width="1.4" stroke-dasharray="4 5" opacity=".7"/></svg><span class="map-region forest-region">微 光 森 林</span><span class="map-region ruins-region">星 辰 遗 迹</span><span class="map-compass">✥<small>N</small></span>${levels.map((l,i)=>`<button class="map-waypoint ${current===i?'current':''} ${completed.includes(i)?'complete':''}" style="left:${points[i][0]}%;top:${points[i][1]}%" data-level="${i}" ${i===0||completed.includes(i-1)||completed.includes(i)?'':'disabled'} title="${l.name}" aria-label="前往${l.name}"><span>${completed.includes(i)?'✓':l.icon}</span><small>${l.area}</small></button>`).join('')}</div>`;
}
