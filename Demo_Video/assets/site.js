/* One illustrative clock drives every overlay. The source artwork is a still,
   not live telemetry or a dynamically reconstructed robot rollout. */
(()=>{'use strict';
const $=id=>document.getElementById(id),svg=$('overview');if(!svg)return;
const NS='http://www.w3.org/2000/svg';
const phases=[
{id:'ready',label:'Ready',duration:2600,color:'#517990',skill:'move',match:2,note:'Hold a ready posture. The footwork branch supplies the selected action.'},
{id:'strike',label:'Strike',duration:3200,color:'#b3794e',skill:'strike',match:0,note:'Select the striking branch. The contact cue highlights the seven-joint arm correction.'},
{id:'clear',label:'Clear',duration:2800,color:'#397ea0',skill:'move',match:4,note:'Make room for the teammate. The clearance cue is paired with the footwork branch.'},
{id:'wait',label:'Wait',duration:2200,color:'#6c8b9a',skill:'move',match:2,note:'Wait in position. The footwork branch remains selected while the teammate returns.'},
{id:'recover',label:'Recover',duration:2800,color:'#47657e',skill:'move',match:0,note:'Return to a ready position. The next phase completes this illustrative cycle.'}];
let total=0;phases.forEach(p=>{p.start=total;total+=p.duration;});
const counterpart={ready:'wait',strike:'clear',clear:'strike',wait:'ready',recover:'ready'},byId=Object.fromEntries(phases.map(p=>[p.id,p]));
const media=matchMedia('(prefers-reduced-motion: reduce)');
const state={time:3650,flowTime:0,playing:!media.matches,reduced:media.matches,player:'A',speed:1,view:'overview',matchAge:900,current:'',visible:true};
let last=null,frame=0,needle=72,gateWas=null;
const attrs=(el,values)=>{for(const[k,v]of Object.entries(values))el.setAttribute(k,String(v));return el;};
const node=(tag,values={},parent)=>{const el=attrs(document.createElementNS(NS,tag),values);if(parent)parent.append(el);return el;};
const clamp=(x,lo=0,hi=1)=>Math.min(hi,Math.max(lo,x));
const setText=(id,text)=>{const el=$(id);if(el&&el.textContent!==text)el.textContent=text;};
const phaseAt=time=>phases.find(p=>time<p.start+p.duration)||phases[4];
const phaseNodes=[],center=[463.46,71.8],radius=14.8;
const labelPositions=[[463.46,50.7,'middle'],[484.2,71.8,'start'],[473.2,94,'middle'],[453.7,94,'middle'],[444.3,71.8,'end']];
phases.forEach((p,i)=>{const a=(-90+i*72)*Math.PI/180,x=center[0]+Math.cos(a)*radius,y=center[1]+Math.sin(a)*radius;
const group=node('g',{'class':'task-point',tabindex:0,role:'button','aria-label':`Select ${p.label} phase`,'data-task-phase':p.id},$('task-nodes'));
node('circle',{'class':'hit',cx:x,cy:y,r:5.2},group);node('circle',{'class':'point',cx:x,cy:y,r:2.15},group);
const[lx,ly,anchor]=labelPositions[i];node('text',{'class':'name',x:lx,y:ly,'text-anchor':anchor,'dominant-baseline':'middle'},group).textContent=p.label;
group.addEventListener('click',()=>pin(p.id));group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pin(p.id);}});phaseNodes.push(group);});
const wheels={};
[['A',120.98,111.31,95],['B',121.69,50.38,38]].forEach(([id,cx,cy,top])=>{const group=$('player-'+id.toLowerCase());
node('rect',{x:109.2,y:top,width:39.2,height:id==='A'?27:32,fill:'#f6f8fa',rx:1.5},group);
node('circle',{cx,cy,r:8.5,fill:'none',stroke:'#b5c7d2','stroke-width':.55},group);
const halo=node('circle',{cx,cy,r:10.7,fill:'none',stroke:'#b3794e','stroke-width':.65,opacity:.5},group);
const sweep=node('circle',{cx,cy,r:8.5,fill:'none',stroke:'#b3794e','stroke-width':1.1,'stroke-dasharray':'8 45.4'},group);
const dots=phases.map((p,i)=>{const a=(-90+i*72)*Math.PI/180;return node('circle',{cx:cx+8.5*Math.cos(a),cy:cy+8.5*Math.sin(a),r:1.7,fill:'#d8e2e8',stroke:'#f6f8fa','stroke-width':.5},group);});
node('text',{x:cx,y:cy+.4,'text-anchor':'middle','dominant-baseline':'middle','class':'player-id',fill:id==='A'?'#96553d':'#406d96'},group).textContent=id;
const caption=node('text',{'class':'player-label',x:id==='A'?129:130,y:id==='A'?99:65,'text-anchor':'middle',fill:'#b3794e'},group);
wheels[id]={group,cx,cy,halo,sweep,dots,caption};});
const flows=[...svg.querySelectorAll('.signal')].map((group,i)=>{const path=group.querySelector('.signal-route');return{group,path,len:path.getTotalLength(),dash:group.querySelector('.signal-dash'),head:group.querySelector('.signal-head'),aura:group.querySelector('.signal-aura'),branch:group.dataset.branch,offset:i*17.3};});
function playbackUI(){$('play').setAttribute('aria-pressed',String(state.playing));setText('play-label',state.playing?'Pause':'Play');$('motion').setAttribute('aria-pressed',String(state.reduced));document.documentElement.dataset.motion=state.reduced?'still':'running';$('workspace').dataset.playing=String(state.playing);}
function display(force=false,dt=0){
const phase=phaseAt(state.time),index=phases.indexOf(phase),progress=clamp((state.time-phase.start)/phase.duration),changed=state.current!==phase.id;
if(changed){state.current=phase.id;state.matchAge=0;gateWas=null;}
const roles={};roles[state.player]=phase.id;roles[state.player==='A'?'B':'A']=counterpart[phase.id];
const gate=phase.id==='strike'&&progress>=.28&&progress<=.78;
if(changed||force){document.documentElement.dataset.phase=phase.id;document.documentElement.style.setProperty('--accent',phase.color);
document.querySelectorAll('.phase-options button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.phase===phase.id)));
phaseNodes.forEach((g,i)=>{g.classList.toggle('active',i===index);g.setAttribute('aria-pressed',String(i===index));});
svg.querySelectorAll('.skill-focus').forEach(r=>r.classList.toggle('active',r.dataset.focus===phase.skill||r.dataset.focus==='selector'));
$('follow-player').querySelector('b').textContent=state.player;setText('task-player',state.player);
setText('selected-action',phase.skill==='strike'?'Striking skill · πstrike':'Footwork skill · πmove');setText('phase-explanation',phase.note);
for(const id of['A','B']){const p=byId[roles[id]],w=wheels[id];w.group.dataset.phase=p.id;w.caption.textContent=p.label;attrs(w.caption,{fill:p.color});w.caption.style.fontSize=p.label==='Recover'?'5.8px':'7px';attrs(w.halo,{stroke:p.color});attrs(w.sweep,{stroke:p.color});w.dots.forEach((dot,i)=>attrs(dot,{fill:i===phases.indexOf(p)?p.color:'#cad9e1',r:i===phases.indexOf(p)?2.1:1.5}));setText('role-'+id.toLowerCase(),p.label);$('role-'+id.toLowerCase()).style.color=p.color;}}
if(gateWas!==gate||force){setText('gate-status',gate?'Contact window':phase.id==='strike'?'Standby':'Bypassed');svg.querySelector('[data-focus=residual]').classList.toggle('active',gate);flows.forEach(f=>f.group.classList.toggle('active',f.branch===phase.skill||f.branch==='output'||f.branch==='phase'||(f.branch==='residual'&&gate)));gateWas=gate;}
const targetAngle=index*72,diff=((targetAngle-needle+540)%360)-180;needle=state.reduced||!state.playing||force?targetAngle:needle+diff*Math.min(1,dt/170);
attrs($('task-needle'),{transform:`rotate(${needle.toFixed(2)} ${center[0]} ${center[1]})`});attrs($('task-progress'),{'stroke-dashoffset':(93*(1-progress)).toFixed(3)});
const matchScan=state.playing&&!state.reduced&&state.matchAge<520;setText('match-status',matchScan?'Matching reference…':'Reference matched');
const candidates=[171.4,196.1,220.7,245.4,269.8];
if(phase.skill==='move'){const idx=matchScan?Math.min(4,Math.floor(state.matchAge/104)):phase.match;attrs($('reference-match'),{x:candidates[idx],y:44.5,width:18.6,height:35.7});attrs($('library-match'),{x:229.4,y:199,width:29.4,height:26.5});}
else{const idx=matchScan?Math.floor(state.matchAge/130)%2:(state.player==='A'?0:1);attrs($('reference-match'),{x:idx===0?174:236,y:104,width:49.7,height:31});attrs($('library-match'),{x:260.6,y:199,width:28.8,height:26.5});}
$('reference-match').style.strokeDashoffset=String(-state.flowTime/350);const sec=state.flowTime/1000;
flows.forEach(f=>{f.dash.style.strokeDashoffset=String(-sec*11);const p=f.path.getPointAtLength((sec*26+f.offset)%f.len);attrs(f.head,{cx:p.x,cy:p.y});attrs(f.aura,{cx:p.x,cy:p.y});});
for(const[id,w]of Object.entries(wheels)){const role=byId[roles[id]],pulse=(sec/1.7+(id==='A'?0:.4))%1;attrs(w.halo,{r:state.reduced?10.3:9.8+pulse*2.6,opacity:state.reduced?.55:.65*(1-pulse)});attrs(w.sweep,{transform:`rotate(${state.reduced?phases.indexOf(role)*72-90:sec*50} ${w.cx} ${w.cy})`});}
const striker=roles.A==='strike'?'A':roles.B==='strike'?'B':null,clearer=roles.A==='clear'?'A':roles.B==='clear'?'B':null,contact=striker==='A'?[62.1,88]:[77,84],shotPhase=sec%2.5/2.5;
const trajectory=$(striker==='B'?'ball-path-b':'ball-path-a'),bp=trajectory.getPointAtLength(trajectory.getTotalLength()*(state.reduced?.9:clamp(shotPhase/.65)));
attrs($('ball'),{cx:bp.x,cy:bp.y,opacity:striker?1:0});attrs($('ball-halo'),{cx:bp.x,cy:bp.y,opacity:striker?.32:0});
const ripple=state.reduced?.4:((shotPhase-.55+1)%1);attrs($('impact-outer'),{cx:contact[0],cy:contact[1],r:2+ripple*7,opacity:striker?.7*(1-ripple):0});attrs($('impact-inner'),{cx:contact[0],cy:contact[1],r:1+ripple*3.6,opacity:striker?.9*(1-ripple):0});
const start=clearer==='A'?[43,114]:[77,110],end=clearer==='A'?[31,114]:[91,108];attrs($('clear-path'),{d:`M${start} Q${(start[0]+end[0])/2} ${start[1]-4} ${end}`,opacity:clearer?.8:0,'stroke-dashoffset':-sec*5});attrs($('clear-target'),{cx:end[0],cy:end[1],opacity:clearer?.75:0});
const travel=state.reduced?.5:(sec%1.9)/1.9;attrs($('clear-wave'),{cx:start[0]+(end[0]-start[0])*travel,cy:start[1]+(end[1]-start[1])*travel,rx:3.4+travel*1.6,ry:1.3+travel*.8,opacity:clearer?.8*(1-travel*.7):0});
attrs($('sum-halo'),{opacity:gate?.35+.35*(.5+.5*Math.sin(sec*5)):0,r:5.5+(state.reduced?0:Math.sin(sec*4)*.4)});
$('timeline').value=String(Math.round(state.time));$('timeline').style.setProperty('--progress',`${state.time/total*100}%`);setText('time-current',(state.time/1000).toFixed(1)+' s');svg.dataset.selectedSkill=phase.skill;svg.dataset.residual=gate?'active':'bypassed';svg.dataset.following=state.player;svg.dataset.phase=phase.id;
}
function schedule(){if(!frame&&state.playing&&!state.reduced&&state.visible&&!document.hidden&&state.view==='overview')frame=requestAnimationFrame(tick);}
function tick(now){frame=0;if(!state.playing||state.reduced||!state.visible||document.hidden||state.view!=='overview'){last=null;return;}const dt=last===null?0:Math.min(80,now-last)*state.speed;last=now;state.time=(state.time+dt)%total;state.flowTime+=dt;state.matchAge+=dt;display(false,dt);schedule();}
function pause(){state.playing=false;last=null;if(frame)cancelAnimationFrame(frame);frame=0;playbackUI();}
function pin(id){const p=byId[id];if(!p)return;pause();state.time=p.start+p.duration*.52;state.matchAge=900;display(true);}
function step(direction=1){const i=phases.indexOf(phaseAt(state.time));pin(phases[(i+direction+5)%5].id);}
function toggle(){if(state.playing)pause();else{if(state.reduced)state.reduced=false;state.playing=true;last=null;playbackUI();schedule();}}
function setView(name){state.view=name;document.querySelectorAll('[data-view]').forEach(b=>{const yes=b.dataset.view===name;b.setAttribute('aria-selected',String(yes));b.tabIndex=yes?0:-1;});$('panel-overview').hidden=name!=='overview';$('panel-map').hidden=name!=='map';document.querySelector('.toolbar').hidden=name==='map';if(name==='map'){const iframe=$('archify-frame');if(!iframe.getAttribute('src'))iframe.src=iframe.dataset.src;last=null;}else schedule();}
$('play').addEventListener('click',toggle);$('next').addEventListener('click',()=>step());
$('reset').addEventListener('click',()=>{state.time=0;state.flowTime=0;state.matchAge=0;state.current='';state.player='A';state.playing=!state.reduced;last=null;display(true);playbackUI();schedule();});
$('speed').addEventListener('change',e=>{state.speed=Number(e.target.value)||1;});$('follow-player').addEventListener('click',()=>{state.player=state.player==='A'?'B':'A';display(true);});
document.querySelectorAll('.phase-options button').forEach(b=>b.addEventListener('click',()=>pin(b.dataset.phase)));
$('timeline').addEventListener('input',e=>{pause();state.time=clamp(Number(e.target.value),0,total-1);state.matchAge=900;display(true);});
$('motion').addEventListener('click',()=>{state.reduced=!state.reduced;if(state.reduced)pause();else{state.playing=true;last=null;}playbackUI();display(true);schedule();});
media.addEventListener('change',e=>{state.reduced=e.matches;if(e.matches)pause();playbackUI();display(true);});
document.querySelectorAll('[data-view]').forEach(b=>{b.addEventListener('click',()=>setView(b.dataset.view));b.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const name=b.dataset.view==='map'?'overview':'map';setView(name);$('tab-'+name).focus();}});});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('workspace').requestFullscreen)await $('workspace').requestFullscreen();}catch{}});
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||state.view!=='overview'||/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)||e.target.closest('[role=button]'))return;if(e.code==='Space'){e.preventDefault();toggle();}else if(e.key==='ArrowRight'){e.preventDefault();step();}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}else if(e.key.toLowerCase()==='r')$('reset').click();});
document.addEventListener('visibilitychange',()=>{last=null;schedule();});if('IntersectionObserver'in window)new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;last=null;schedule();},{threshold:.02}).observe($('workspace'));
window.PingPongDuo={snapshot:()=>({...state,phase:phaseAt(state.time).id,skill:svg.dataset.selectedSkill,residual:svg.dataset.residual}),seek:ms=>{pause();state.time=clamp(Number(ms)||0,0,total-1);display(true);},select:pin};
display(true);playbackUI();schedule();
})();
