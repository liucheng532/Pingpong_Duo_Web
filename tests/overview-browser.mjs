import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const out='overview-verification';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1600,height:1000}});
const errors=[],failed=[],checks=[],viewports=[];
const check=(name,ok)=>{checks.push({name,ok:!!ok});if(!ok)throw Error(name);};
page.on('pageerror',e=>errors.push(String(e)));
page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
const state=()=>page.evaluate(()=>window.PingPongDuo.getState());
let testError=null;
try{
 await page.goto('http://127.0.0.1:8765/Demo_Video/overview/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>!!window.PingPongDuo?.getState);
 check('12 original signal routes',await page.locator('.edge').count()===12);
 check('original AVIF image decodes',await page.evaluate(async()=>{const image=new Image();image.src=document.querySelector('#overview-svg image').getAttribute('href');await image.decode();return image.naturalWidth>1000;}));
 await page.waitForTimeout(1200);
 await page.screenshot({path:out+'/overview.png',fullPage:true});
 for(const phase of ['ready','strike','clear','wait','recover']){
  await page.locator('.phase-rail button[data-phase="'+phase+'"]').click();
  await page.waitForTimeout(100);
  check('select '+phase,(await state()).phase===phase&&!(await state()).playing);
  const skill=await page.locator('#skill-name').textContent();
  check('matched skill '+phase,phase==='strike'?skill.includes('Striking'):skill.includes('Footwork'));
  if(['strike','clear'].includes(phase))await page.screenshot({path:out+'/'+phase+'.png',fullPage:true});
 }
 await page.locator('#play').click();
 const before=await state();const x1=await page.locator('#footwork-action .edge-packet').getAttribute('cx');
 await page.waitForTimeout(250);
 check('shared clock advances',(await state()).clock>before.clock);
 check('signal moves',x1!==await page.locator('#footwork-action .edge-packet').getAttribute('cx'));
 await page.locator('#play').click();
 const frozen=JSON.stringify(await state());const packet=await page.locator('#robot-actions .edge-packet').getAttribute('cx');
 await page.waitForTimeout(200);
 check('pause freezes clock',JSON.stringify(await state())===frozen);
 check('pause freezes signals',packet===await page.locator('#robot-actions .edge-packet').getAttribute('cx'));
 for(const view of ['deploy','train','full']){
  await page.locator('[data-view="'+view+'"]').click();check('view '+view,(await state()).view===view);
 }
 await page.locator('#motion').click();check('reduced motion',(await state()).reduced&&!(await state()).playing);
 for(const [width,height]of[[1440,900],[1600,1000],[1920,1080],[2048,1320],[390,844],[820,1180]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(80);
  const box=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}));
  viewports.push(box);check('viewport '+width+'x'+height,box.scrollWidth<=width&&box.scrollHeight<=height);
  if(width===390)await page.screenshot({path:out+'/mobile.png',fullPage:true});
 }
 await page.setViewportSize({width:1600,height:1000});
 await page.goto('http://127.0.0.1:8765/Demo_Video/overview/archify/deployment.html?theme=light',{waitUntil:'networkidle'});
 check('genuine Archify viewer loads',await page.locator('svg').count()>0);
 await page.waitForTimeout(900);await page.screenshot({path:out+'/archify.png',fullPage:true});
 check('no failed resources',failed.length===0);check('no JavaScript errors',errors.length===0);
 const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 await reduced.goto('http://127.0.0.1:8765/Demo_Video/overview/',{waitUntil:'networkidle'});
 check('OS reduced motion starts still',await reduced.evaluate(()=>PingPongDuo.getState().reduced&&!PingPongDuo.getState().playing));
 await reduced.close();
}catch(e){testError=e;checks.push({name:'test completion',ok:false,error:String(e)});}
finally{
 await writeFile(out+'/browser.json',JSON.stringify({ok:!testError&&!errors.length&&!failed.length,method:'GitHub Actions Chromium over HTTP using exact committed files',checks,viewports,errors,failed},null,2));
 await browser.close();
}
if(testError)throw testError;
