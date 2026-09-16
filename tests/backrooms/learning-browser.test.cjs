const {chromium}=require('playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../public');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.(mjs|js)$/.test(file)?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'text/plain');res.end(data);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/pages/backrooms/index.html`);await page.locator('#form').waitFor({state:'visible'});
  await page.evaluate(async()=>{
   const {MissionPanel}=await import('./mission.mjs');const show=MissionPanel.prototype.show;MissionPanel.prototype.show=function(...args){window.testMission=this;return show.apply(this,args);};
   const {World}=await import('./scene.mjs');const room=World.prototype.room;World.prototype.room=function(...a){window.testWorld=this;return room.apply(this,a);};
   const {Sound}=await import('./audio.mjs');const walk=Sound.prototype.walk;Sound.prototype.walk=function(...a){window.testSound=this;return walk.apply(this,a);};
   window.utterances=[];window.speechSynthesis.speak=u=>{window.utterances.push(u);u.onstart?.();};window.speechSynthesis.cancel=()=>{};
  });
  await page.selectOption('#mode','listening');await page.locator('#form button').click();await page.locator('.door-label').first().waitFor();
  assert((await page.locator('#question').innerText()).includes('Höre zu.'));
  await page.evaluate(()=>testWorld.camera.position.set(0,1.65,-4));await page.waitForTimeout(100);assert(await page.locator('#interact').isDisabled());
  await page.locator('#listen').click();assert(await page.locator('#interact').isDisabled());
  const correct=await page.evaluate(()=>{const u=utterances.at(-1);u.onend();return u.text;});await page.waitForTimeout(100);assert(!(await page.locator('#interact').isDisabled()));
  await page.keyboard.press('r');assert.equal(await page.evaluate(()=>utterances.length),2);await page.evaluate(()=>utterances.at(-1).onend());
  await page.locator('#hint').click();assert(!(await page.locator('#question').innerText()).includes('Höre zu.'));
  await page.screenshot({path:path.join(root,'../backrooms-listening-desktop.png')});
  let monsterChecked=false;
  async function solveMissions(){
    while(await page.locator('#missionPanel').isVisible()){
      const kind=await page.evaluate(()=>testMission.task.kind);
      if(kind==='monster'&&!monsterChecked){
        const wrong=await page.evaluate(()=>testMission.task.options.find(o=>o!==testMission.task.answer));
        const before=await page.evaluate(()=>testWorld.encounterGroup.position.z);
        await page.locator('#missionAnswers button').filter({hasText:wrong}).click();
        const closer=await page.evaluate(()=>testWorld.encounterGroup.position.z);assert(closer>before);
        await page.waitForTimeout(1200);assert.equal(await page.evaluate(()=>testWorld.encounterGroup.position.z),closer);
        await page.locator('#missionPause').click();await page.locator('#resume').click();
        assert(await page.locator('#missionPanel').isVisible());assert.equal(await page.evaluate(()=>testWorld.encounterGroup.position.z),closer);
        await page.screenshot({path:path.join(root,'../backrooms-mission-desktop.png')});
        await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(root,'../backrooms-mission-mobile.png')});
        assert(await page.locator('#missionAnswers').isVisible());await page.setViewportSize({width:1280,height:800});monsterChecked=true;
      }
      if(kind==='generator')assert.equal(await page.evaluate(()=>testMission.mission.parts.length),3);
      const answer=await page.evaluate(()=>testMission.task.answer);
      await page.locator('#missionAnswers button').filter({hasText:answer}).click();
      await page.locator('#missionContinue').click();
      await page.waitForTimeout(100);
    }
  }
  async function choose(text){await page.evaluate(text=>{const d=testWorld.doors.find(d=>d.label.textContent===text);testWorld.camera.position.set(d.x,1.65,-4);},text);await page.waitForTimeout(100);await page.locator('#interact').click();await page.waitForTimeout(850);await page.evaluate(()=>testWorld.camera.position.z=-8);await page.waitForTimeout(150);await solveMissions();}
  await choose(correct);
  for(let i=1;i<5;i++){assert((await page.locator('#question').innerText()).includes('Höre zu.'));await page.locator('#listen').click();const word=await page.evaluate(()=>{const u=utterances.at(-1);u.onend();return u.text;});await choose(word);}
  await page.locator('#results').waitFor({state:'visible'});assert.equal(await page.locator('#resultTitle').innerText(),'ENTKOMMEN!');assert((await page.locator('#stats').innerText()).includes('80%'));assert.equal(await page.locator('#review p').count(),2);assert((await page.locator('#stats').innerText()).includes('Generator 3/3'));assert((await page.locator('#stats').innerText()).includes('1 Missions-Fehlversuche'));
  await page.locator('#again').click();await page.locator('#listen').click();await page.evaluate(()=>utterances.at(-1).onerror());assert((await page.locator('#speechStatus').innerText()).includes('Keine Sprachausgabe'));await page.locator('#hint').click();
  await page.evaluate(()=>{testWorld.camera.position.set(0,1.65,3.5);window.stepCalls=0;const ctx=testSound.context,create=ctx.createBufferSource.bind(ctx);ctx.createBufferSource=()=>{stepCalls++;return create();};});
  await page.keyboard.down('w');await page.waitForTimeout(600);await page.keyboard.up('w');assert(await page.evaluate(()=>stepCalls)>0);
  await page.evaluate(()=>{testWorld.camera.position.set(0,1.65,-4.55);testWorld.yaw=0;window.beforeWall=stepCalls;});await page.keyboard.down('w');await page.waitForTimeout(400);await page.keyboard.up('w');assert(await page.evaluate(()=>stepCalls===beforeWall));
  await page.locator('#mute').click();const steps=await page.evaluate(()=>stepCalls);await page.keyboard.down('w');await page.waitForTimeout(400);await page.keyboard.up('w');assert.equal(await page.evaluate(()=>stepCalls),steps);
  await page.locator('#pause').click();assert(await page.evaluate(()=>!testSound.active&&testSound.nodes.length===0));await page.locator('#resume').click();
  await page.evaluate(()=>{testWorld.camera.position.set(0,1.65,3.5);testWorld.yaw=0;testWorld.pitch=0;});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(root,'../backrooms-listening-mobile.png')});
  const rects=await page.evaluate(()=>Object.fromEntries(['feedback','interact','listen'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return [id,{top:r.top,bottom:r.bottom,left:r.left,right:r.right}];})));assert(rects.feedback.bottom<rects.interact.top);assert(rects.listen.left>=0&&rects.listen.right<=390);
  await page.locator('#pause').click();await page.locator('#change').click();await page.selectOption('#mode','mixed');
  await page.evaluate(()=>{Math.random=()=>.1;});await page.locator('#form button').click();await page.locator('.door-label').first().waitFor();
  const sequence=[['translation',.5],['spelling',.9],['listening',.1],['translation',.5],['spelling',.5]];
  for(const [mode,nextRandom] of sequence){
    const title=await page.locator('#question small').innerText();
    assert.equal(title,{translation:'WIE HEISST DAS AUF SPANISCH?',spelling:'WELCHE SCHREIBWEISE STIMMT?',listening:'HÖREN & LESEN'}[mode]);
    assert.equal(await page.locator('#listeningControls').isVisible(),mode==='listening');
    await page.locator('#pause').click();await page.locator('#resume').click();assert.equal(await page.locator('#question small').innerText(),title);
    let word;
    if(mode==='listening'){
      assert((await page.locator('#question').innerText()).includes('Höre zu.'));
      await page.locator('#listen').click();word=await page.evaluate(()=>{const u=utterances.at(-1);u.onend();return u.text;});
    }else word=await page.evaluate(async()=>{const {parseTSV}=await import('./vocabulary.mjs');const pool=parseTSV(await(await fetch('./words.tsv')).text()).get(document.querySelector('#category').value);return pool.find(e=>e.de===document.querySelector('#question').lastChild.textContent).answers[0];});
    await page.evaluate(n=>{Math.random=()=>n;},nextRandom);await choose(word);
  }
  await page.locator('#results').waitFor({state:'visible'});assert.equal(await page.locator('#resultTitle').innerText(),'ENTKOMMEN!');assert((await page.locator('#stats').innerText()).includes('100%'));
  console.log('PASS: mixed run switches through all three challenges, resets listening controls and prompt, keeps mode on pause, and completes with correct score');
  assert(monsterChecked);assert.deepEqual(errors,[]);console.log('PASS: all three mission stations, wrong-answer approach without time pressure, encounter pause/resume, generator gate, review, restart and second full run');console.log('PASS: listening hides prompt, waits for speech, repeats, handles failure, scores hints, resets rooms, completes five-room run; movement footsteps, mute/pause, responsive layout, no JS errors');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
