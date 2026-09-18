/* PingPongDuo — one clock drives every explanatory animation.
 * Source: Overview_fig.pptx, slide 1. This is NOT a recorded robot rollout.
 * Positions and durations below are presentation choices, not controller data.
 */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const svg = $('overview-svg');
  if (!svg) return;
  const phases = [
    {id:'ready', name:'Ready', duration:3.2, color:'#668999', pose:2, note:'A ready reference is matched to the footwork branch. The action selector keeps the positioning skill active.'},
    {id:'strike', name:'Strike', duration:4.4, color:'#af572d', pose:1, note:'The striking action reaches Select through the sum. The seven-joint correction is highlighted around the illustrated contact.'},
    {id:'clear', name:'Clear', duration:3.7, color:'#33688e', pose:3, note:'A clearance reference is selected from the footwork branch. Outward chevrons show teammate clearance, not a measured trajectory.'},
    {id:'wait', name:'Wait', duration:2.8, color:'#78919d', pose:4, note:'A holding reference is selected. The footwork branch stays active while the striking branch is not selected.'},
    {id:'recover', name:'Recover', duration:3.2, color:'#466884', pose:0, note:'A recovery reference is selected from footwork before the illustrated cycle returns to Ready.'}
  ];
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = {index:1, elapsed:0, clock:0, speed:1, playing:!media.matches, reduced:media.matches, view:'full'};
  let raf = 0, lastTime = null, poseIndex = -1;
  const clamp = (x, lo=0, hi=1) => Math.min(hi, Math.max(lo,x));
  const attrs = (node, values) => { if (node) for (const [k,v] of Object.entries(values)) node.setAttribute(k,String(v)); };
  const opacity = (node, v) => { node.style.opacity = String(v); };
  const edges = Array.from(svg.querySelectorAll('.edge')).map(group => {
    const base = group.querySelector('.edge-base');
    return {group, base, light:group.querySelector('.edge-light'), dot:group.querySelector('.edge-packet'), length:base.getTotalLength(), kind:group.dataset.kind, delay:Number(group.dataset.delay)};
  });
  const ballPath = $('ball-flight');
  const rewardPath = $('reward-flight');
  const ballLength = ballPath.getTotalLength(), rewardLength = rewardPath.getTotalLength();
  const nodes = Array.from(document.querySelectorAll('[data-phase]')).filter(el => el.matches('button, .phase-node'));
  const jointDots = Array.from(svg.querySelectorAll('.correction-joint'));
  const title = phases.map(p=>p.id);
  const isStrike = () => phases[state.index].id === 'strike';

  function updateTransport() {
    root.dataset.reduced = String(state.reduced);
    root.dataset.playing = String(state.playing);
    $('play').setAttribute('aria-pressed',String(state.playing));
    $('play').setAttribute('aria-label',state.playing ? 'Pause all animation' : 'Play animation');
    $('play-icon').textContent = state.playing ? 'Ⅱ' : '▶';
    $('motion').textContent = state.reduced ? 'Motion off' : 'Motion on';
    $('motion').setAttribute('aria-pressed',String(state.reduced));
    const status = $('run-status');
    status.classList.toggle('paused',!state.playing);
    status.replaceChildren(document.createElement('i'),document.createTextNode(state.reduced ? 'STILL' : state.playing ? 'PLAYING' : 'PAUSED'));
  }

  function matchPose(index) {
    if (poseIndex === index) return;
    poseIndex = index;
    if (isStrike()) attrs($('matched-pose'),{x:[172.86,202.34,231.82,261.3][index]-1,y:100,width:28,height:32});
    else attrs($('matched-pose'),{x:[174.27,193.7,212.2,241.58,264.98][index]-1,y:46,width:25,height:31});
  }

  function phaseUI() {
    const p = phases[state.index];
    root.dataset.phase = svg.dataset.phase = p.id;
    root.style.setProperty('--phase',p.color);
    nodes.forEach(node => node.setAttribute('aria-pressed',String(node.dataset.phase===p.id)));
    $('phase-underline').style.left = `${state.index*20}%`;
    $('skill-name').textContent = isStrike() ? 'Striking + arm refinement' : 'Footwork skill';
    $('match-symbol').textContent = isStrike() ? 'π strike + Δa arm' : 'π move';
    $('select-readout').querySelector('text').textContent = isStrike() ? 'π strike + Δa arm' : 'π move';
    $('phase-description').textContent = p.note;
    $('cycle-label').textContent = `${String(state.index+1).padStart(2,'0')} / 05`;
    $('focus-footwork').classList.toggle('active',!isStrike());
    $('focus-striking').classList.toggle('active',isStrike());
    $('focus-select').classList.add('active');
    $('task-pointer').setAttribute('transform',`rotate(${state.index*72})`);
    attrs($('library-match'),{x:isStrike()?259:230,y:196.8,width:27,height:27});
    // The two role badges belong to the original fixed source snapshot.
    // Do not relabel the photographs or imply an observed role exchange.
    for (const [who,index] of [['A',1],['B',2]]) {
      $('player-'+who).querySelectorAll('.role-node').forEach(n=>n.classList.toggle('on',Number(n.dataset.index)===index));
    }
    poseIndex = -1;
    matchPose(p.pose);
    edges.forEach(e => {
      const selected = e.kind==='move' ? !isStrike() : ['hit','arm'].includes(e.kind) ? isStrike() : true;
      e.group.dataset.active = String(selected);
    });
  }

  function draw() {
    const p = phases[state.index], t = state.clock;
    const progress = clamp(state.elapsed / p.duration);
    const still = state.reduced;
    // A 0.8 s scan is a presentation motif, not a motion-matching algorithm.
    const scanning = !still && state.playing && state.elapsed < .8;
    $('reference-status').textContent = scanning ? 'Matching reference…' : 'Matched reference';
    matchPose(scanning ? Math.floor(state.elapsed/.16) % (isStrike()?4:5) : p.pose);
    const ring = svg.querySelector('.task-progress');
    ring.setAttribute('stroke-dashoffset',String(100.53*(1-progress)));
    edges.forEach(e => {
      const active = e.group.dataset.active==='true';
      if (still) { opacity(e.light,0); opacity(e.dot,0); return; }
      const period = Math.max(2.1,e.length/72);
      const local = ((t-e.delay)%period+period)%period/period;
      const distance = local*e.length;
      const band = Math.min(13,Math.max(3,e.length*.16));
      attrs(e.light,{'stroke-dasharray':`${band} ${e.length+band}`, 'stroke-dashoffset':String(band-distance)});
      const point = e.base.getPointAtLength(distance);
      attrs(e.dot,{cx:point.x,cy:point.y});
      opacity(e.light,active ? .76 : .13);
      opacity(e.dot,active ? .95 : .26);
    });
    for (const who of ['A','B']) {
      const wheel=$('player-'+who);
      const emphasize=(who==='A'&&isStrike()) || (who==='B'&&p.id==='clear');
      const pulse=still ? .2 : (t/1.7+(who==='A'?0:.42))%1;
      attrs(wheel.querySelector('.role-halo'),{r:10+pulse*4});
      opacity(wheel.querySelector('.role-halo'),(1-pulse)*(emphasize?.65:.18));
      attrs(wheel.querySelector('.player-orbit'),{transform:`rotate(${still?0:t*24})`});
    }
    const clearPulse=still?.3:(t/1.6)%1;
    opacity($('clear-cues'),p.id==='clear'?.9:isStrike()?.4:.16);
    attrs(svg.querySelector('.clear-chevron'),{transform:`translate(${clearPulse*3.5} 0)`});
    attrs(svg.querySelector('.clear-zone'),{rx:7.5+clearPulse*3,ry:2.2+clearPulse*.7});
    opacity(svg.querySelector('.clear-zone'),1-clearPulse*.6);
    const flight = still ? .92 : (state.elapsed/2.2)%1;
    const point = ballPath.getPointAtLength(clamp(flight/.78)*ballLength);
    attrs($('flying-ball'),{cx:point.x,cy:point.y});
    opacity($('flying-ball'),isStrike() && !still && flight<.82?1:0);
    opacity(ballPath,isStrike()?.7:.16);
    const contact=isStrike() ? clamp((flight-.76)/.24) : 1;
    attrs($('contact-ring'),{r:1.8+contact*5.4});
    opacity($('contact-ring'),!still && isStrike() && flight>.76 ? (1-contact)*.9 : 0);
    opacity($('contact-wash'),!still && isStrike() && flight>.76 ? (1-contact)*.65 : 0);
    const armOn=isStrike() && (still || flight>.55 && flight<.96);
    $('focus-arm').classList.toggle('active',armOn);
    jointDots.forEach((dot,i)=>opacity(dot,armOn?(still?.55:.35+.6*(.5+.5*Math.sin(t*8-i*.7))):.08));
    opacity($('sum-halo'),armOn?.6:0);
    const rPoint=rewardPath.getPointAtLength((still?.8:(t/3.2)%1)*rewardLength);
    attrs($('reward-ball'),{cx:rPoint.x,cy:rPoint.y});
    opacity($('reward-ball'),!still&&isStrike()?.95:0);
  }

  function stopLoop() { if(raf) cancelAnimationFrame(raf); raf=0; lastTime=null; }
  function tick(now) {
    raf=0;
    if(!state.playing || state.reduced || document.hidden) {lastTime=null;return;}
    const dt=lastTime===null?0:Math.min((now-lastTime)/1000,.12)*state.speed;
    lastTime=now; state.clock+=dt; state.elapsed+=dt;
    if(state.elapsed>=phases[state.index].duration) {
      state.elapsed-=phases[state.index].duration;
      state.index=(state.index+1)%phases.length;phaseUI();
    }
    draw();raf=requestAnimationFrame(tick);
  }
  function startLoop() {stopLoop();if(state.playing&&!state.reduced&&!document.hidden) raf=requestAnimationFrame(tick);}
  function setPlaying(on) {
    if(on && state.reduced) state.reduced=false;
    state.playing=on;updateTransport();draw();startLoop();
  }
  function selectPhase(id,hold=true) {
    const index=title.indexOf(id);if(index<0) return;
    state.index=index;state.elapsed=hold?1.35:0;
    if(hold)state.playing=false;
    phaseUI();updateTransport();draw();startLoop();
  }
  function reduce(on) {state.reduced=on;if(on)state.playing=false;else state.playing=true;updateTransport();draw();startLoop();}
  nodes.forEach(node=>{
    node.addEventListener('click',()=>selectPhase(node.dataset.phase));
    if(node.classList.contains('phase-node')) node.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();selectPhase(node.dataset.phase);}
    });
  });
  $('play').addEventListener('click',()=>setPlaying(!state.playing));
  $('step').addEventListener('click',()=>selectPhase(phases[(state.index+1)%5].id));
  function restart(){state.clock=0;state.elapsed=0;state.index=1;state.playing=!state.reduced;phaseUI();updateTransport();draw();startLoop();}
  $('restart').addEventListener('click',restart);
  $('motion').addEventListener('click',()=>reduce(!state.reduced));
  $('speed').addEventListener('change',()=>{state.speed=clamp(Number($('speed').value),.5,2);});
  const views={full:[0,0,510.25,240],deploy:[0,0,510.25,159],train:[0,159,510.25,81]};
  function setView(id) {
    const box=views[id];if(!box)return;
    state.view=id;svg.setAttribute('viewBox',box.join(' '));
    svg.style.aspectRatio=`${box[2]} / ${box[3]}`;
    document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===id)));
  }
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  $('fullscreen').addEventListener('click',async()=>{
    try {
      if(document.fullscreenElement) await document.exitFullscreen();
      else if(document.querySelector('.page').requestFullscreen) await document.querySelector('.page').requestFullscreen();
      else $('fullscreen').title='Fullscreen is unavailable in this browser';
    } catch { $('fullscreen').title='Fullscreen is unavailable in this browser'; }
  });
  document.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,select,textarea,button,a,[role="button"],[contenteditable="true"]')) return;
    if(e.code==='Space'){e.preventDefault();setPlaying(!state.playing);}
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();selectPhase(phases[(state.index+(e.key==='ArrowRight'?1:4))%5].id);}
    if(e.key.toLowerCase()==='r')restart();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopLoop();}else startLoop();});
  media.addEventListener('change',e=>reduce(e.matches));
  let printView='full';
  window.addEventListener('beforeprint',()=>{printView=state.view;setView('full');stopLoop();});
  window.addEventListener('afterprint',()=>{setView(printView);startLoop();});
  // Small read-only inspection interface for regression tests and integration.
  window.PingPongDuo=Object.freeze({getState:()=>({...state,phase:phases[state.index].id}),selectPhase,setView});
  phaseUI();updateTransport();draw();startLoop();
})();
