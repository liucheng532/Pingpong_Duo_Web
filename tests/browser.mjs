import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const out='verification'; await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[],failed=[],checks=[],sizes=[];
const page=await browser.newPage({viewport:{width:1600,height:1000}});
page.on('pageerror',e=>errors.push(String(e)));
page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
function check(name,ok){checks.push({name,ok:!!ok});if(!ok)throw new Error(name);}
const snap=()=>page.evaluate(()=>window.PingPongDuo.snapshot());
try {
 await page.goto('http://127.0.0.1:8765/Demo_Video/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>!!window.PingPongDuo);
 check('eight original signal routes',await page.locator('.signal').count()===8);
 check('source artwork decoded',await page.evaluate(async()=>{const i=new Image();i.src=document.querySelector('#source-artwork').getAttribute('href');await i.decode();return i.naturalWidth===1400;}));
 await page.locator('[data-phase="strike"]').click();
 check('Strike selects striking skill',(await snap()).skill==='strike');
 check('illustrative strike contact gate',(await snap()).residual==='active');
 check('A strikes, B clears',await page.locator('#role-a').textContent()==='Strike'&&await page.locator('#role-b').textContent()==='Clear');
 await page.waitForTimeout(400);const frozen=await snap();await page.waitForTimeout(200);const frozen2=await snap();
 check('pause freezes both clocks',frozen.time===frozen2.time&&frozen.flowTime===frozen2.flowTime);
 await page.screenshot({path:out+'/overview-strike.png',fullPage:true});
 await page.locator('[data-phase="clear"]').click();
 check('Clear selects footwork',(await snap()).skill==='move');
 check('Clear bypasses arm residual',(await snap()).residual==='bypassed');
 check('clearing cue visible',Number(await page.locator('#clear-path').getAttribute('opacity'))>0);
 await page.waitForTimeout(400);await page.screenshot({path:out+'/overview-clear.png',fullPage:true});
 await page.locator('#follow-player').click();
 check('player follow switches',(await snap()).player==='B'&&await page.locator('#role-b').textContent()==='Clear');
 await page.locator('#follow-player').click();
 await page.locator('[data-task-phase="recover"]').focus();await page.keyboard.press('Enter');
 check('SVG selector is keyboard operable',(await snap()).phase==='recover');
 await page.locator('#timeline').evaluate(el=>{el.value='7000';el.dispatchEvent(new Event('input',{bubbles:true}));});
 check('scrubber changes phase',(await snap()).phase==='clear');
 await page.locator('#play').click();const before=await snap();await page.waitForTimeout(180);const after=await snap();
 check('play advances synchronized clocks',after.time>before.time&&after.flowTime>before.flowTime);
 await page.locator('#motion').click();check('reduced motion pauses animation',(await snap()).reduced&&!(await snap()).playing);
 for(const [width,height]of[[1440,900],[1600,1000],[1920,1080],[2048,1320],[390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(100);
  const m=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}));sizes.push({...m,height});check(`no horizontal overflow ${width}x${height}`,m.scrollWidth<=width);
  await page.screenshot({path:out+`/overview-${width}.png`,fullPage:true});
 }
 await page.setViewportSize({width:1600,height:1000});
 await page.locator('#tab-map').click();
 const iframe=await page.locator('#archify-frame').elementHandle();const child=await iframe.contentFrame();
 await child.waitForSelector('svg',{timeout:30000});await child.waitForTimeout(1000);
 check('actual Archify SVG viewer loaded',await child.locator('svg').count()>0);
 await page.screenshot({path:out+'/archify-embedded.png',fullPage:true});
 await page.locator('#tab-overview').click();check('overview restores after map',await page.locator('#panel-overview').isVisible());
 check('no failed resource responses',failed.length===0);check('no JavaScript errors',errors.length===0);
} finally {
 await writeFile(out+'/browser.json',JSON.stringify({ok:checks.every(c=>c.ok)&&!errors.length&&!failed.length,checks,sizes,errors,failed},null,2));
 await browser.close();
}
