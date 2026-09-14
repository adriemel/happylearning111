import {parseTSV,playable,lengths,choices,spellingChoices,Session} from './vocabulary.mjs';
import {Sound} from './audio.mjs';
import {DefeatSequence} from './defeat.mjs';
const $=id=>document.getElementById(id),sound=new Sound(),defeat=new DefeatSequence();
let categories,session,world,state='SETUP',previousState,labels=[],feedbackUntil=0,escapeTime=0,mode='spelling',sessionMode='spelling',heard=false,hintUsed=false;
const wrongFlash=document.createElement('div');wrongFlash.id='wrongFlash';document.body.append(wrongFlash);
const keys=new Set(),movement={x:0,y:0};let lookPointer=null,stickPointer=null,lastX=0,lastY=0;
function resetInput(){keys.clear();movement.x=movement.y=0;lookPointer=stickPointer=null;$('knob').style.transform='';}
function release(){wrongFlash.classList.remove('active');document.exitPointerLock?.();resetInput();sound.stop();}
function feedback(text){$('feedback').textContent=text;}
function updateHUD(){
  $('hearts').textContent='♥'.repeat(session.lives)+'♡'.repeat(3-session.lives);$('hearts').setAttribute('aria-label',`${session.lives} Leben`);
  $('progress').textContent=`${session.index} / ${session.entries.length}`;
  $('question').replaceChildren();const small=document.createElement('small');
  small.textContent=mode==='listening'?'HÖREN & LESEN':mode==='spelling'?'WELCHE SCHREIBWEISE STIMMT?':'WIE HEISST DAS AUF SPANISCH?';
  $('question').append(small,session.current?(mode==='listening'&&!hintUsed?'Höre zu. Finde das Wort.':session.current.de):'Der Ausgang wartet!');
}
function room(){
  mode=sessionMode==='mixed'?['translation','spelling','listening'][Math.floor(Math.random()*3)]:sessionMode;
  sound.cancelSpeech();heard=false;hintUsed=false;$('speechStatus').textContent='';$('hint').disabled=false;
  labels=mode==='translation'?choices(session.current,session.pool):spellingChoices(session.current,[...categories.values()].flat());
  world.room(labels,session.index,session.index===session.entries.length-1);state='PLAYING';
  $('listeningControls').hidden=mode!=='listening';
  feedback(mode==='listening'?'Höre das Wort an. Gehe zur richtig geschriebenen Tür.':'Finde die Übersetzung. Gehe zu einer Tür.');updateHUD();
}
function listen(){
  if(state!=='PLAYING'||mode!=='listening')return;
  if(sound.muted)$('mute').click();
  const entry=session.current;$('speechStatus').textContent='Wort wird vorgelesen …';
  sound.speak(entry.answers[0],ok=>{
    if(state!=='PLAYING'||session.current!==entry)return;
    if(ok){heard=true;$('speechStatus').textContent='Noch einmal? Drücke ▶ oder R.';}
    else $('speechStatus').textContent='Keine Sprachausgabe. Nutze den deutschen Hinweis oder wähle einen anderen Modus.';
  });
}
$('listen').onclick=listen;
$('hint').onclick=()=>{if(state!=='PLAYING')return;hintUsed=true;$('hint').disabled=true;session.mistakes.add(session.index);updateHUD();feedback('Mit Hinweis üben · Dieses Wort erscheint in deiner Wiederholung.');};
$('mode').onchange=()=>{$('modeHelp').textContent={mixed:'Jeder Raum wählt zufällig: Übersetzen, genau lesen oder hören & lesen. Der Hinweis oben zeigt die aktuelle Aufgabe.',translation:'Finde die spanische Übersetzung unter verschiedenen Wörtern.',spelling:'Eine Tür ist richtig, zwei enthalten einen kleinen Schreibfehler.',listening:'Höre ein spanisches Wort und finde seine richtige Schreibweise. ▶ oder R wiederholt es. Benötigt Sprachausgabe; Hinweise zählen als Übungsbedarf.'}[$('mode').value];};
function options(){const pool=playable(categories.get($('category').value));$('length').replaceChildren(...lengths(pool.length).map(n=>new Option(n===pool.length?`Alle ${n}`:`${n} Räume`,n)));$('form').querySelector('button').disabled=!pool.length;}
async function start(){
  sessionMode=$('mode').value;sound.start();$('setup').hidden=true;$('results').hidden=true;$('hud').hidden=false;state='LOADING';feedback('Die Backrooms werden vorbereitet …');
  try{if(!world){const {World}=await import('./scene.mjs');world=new World($('world'));bindScene();}session=new Session(categories.get($('category').value),Number($('length').value));if(!session.entries.length)throw Error('Diese Kategorie hat zu wenige unterschiedliche Antworten.');room();}
  catch(error){sound.stop();state='SETUP';$('hud').hidden=true;$('setup').hidden=false;$('loading').hidden=false;$('loading').textContent='Das 3D-Spiel konnte nicht starten. Bitte WebGL im Browser aktivieren oder einen anderen Browser versuchen. '+error.message;}
}
function interact(){if(state!=='PLAYING')return;if(mode==='listening'&&!heard&&!hintUsed){listen();return;}const i=world.nearest();if(i<0)return;const outcome=session.answer(labels[i]);if(outcome==='ignored')return;updateHUD();if(outcome==='correct')sound.tone(true);else sound.error();
  if(outcome==='correct'){state='ANSWER_FEEDBACK';world.open(i);feedback(`${session.current.de} = ${labels[i]} · Gehe durch die offene Tür.`);sound.speak(labels[i]);feedbackUntil=performance.now()+700;}
  else{world.fail(i);wrongFlash.classList.remove('active');void wrongFlash.offsetWidth;wrongFlash.classList.add('active');feedback('Diese Tür bleibt zu. Versuche eine andere.');state='WRONG_FEEDBACK';feedbackUntil=performance.now()+850;if(!session.lives){state='DEFEAT';wrongFlash.classList.remove('active');resetInput();feedback('');$('interact').disabled=true;defeat.start();}}
}
function finish(won){defeat.stop();state=won?'COMPLETE':'GAME_OVER';release();$('hud').hidden=true;$('results').hidden=false;$('resultTitle').textContent=won?'ENTKOMMEN!':'NOCH IM LABYRINTH';$('stats').textContent=`${session.index} / ${session.entries.length} Räume geschafft · ${session.accuracy}% ohne Fehler oder Hinweis · ${session.wrong} Fehlversuche`;$('reviewTitle').textContent=session.mistakes.size?'Diese Wörter üben wir noch:':'Perfekter Lauf!';$('review').replaceChildren(...[...session.mistakes].map(i=>{const p=document.createElement('p'),a=document.createElement('span'),b=document.createElement('span');a.textContent=session.entries[i].de;b.textContent=session.entries[i].answers.join(' / ');p.append(a,b);return p;}));$('veil').style.opacity=0;}
function setup(){defeat.stop();state='SETUP';release();$('pausePanel').hidden=$('results').hidden=$('hud').hidden=true;$('setup').hidden=false;$('labels').replaceChildren();$('veil').style.opacity=0;}
function pause(){if(!['PLAYING','DEFEAT','WRONG_FEEDBACK','ANSWER_FEEDBACK','TRANSITIONING','ESCAPING'].includes(state))return;previousState=state;state='PAUSED';defeat.element.hidden=true;release();$('pausePanel').hidden=false;}
function resume(){state=previousState;if(state==='DEFEAT')defeat.element.hidden=false;sound.start();$('pausePanel').hidden=true;resetInput();}
$('form').addEventListener('submit',e=>{e.preventDefault();start();});$('category').onchange=options;$('interact').onclick=interact;$('pause').onclick=pause;$('resume').onclick=resume;$('change').onclick=$('choose').onclick=setup;$('again').onclick=start;
$('mute').onclick=()=>{sound.setMuted(!sound.muted);$('mute').textContent=sound.muted?'Ton aus':'Ton an';$('mute').setAttribute('aria-label',sound.muted?'Ton einschalten':'Ton ausschalten');};
window.addEventListener('keydown',e=>{if(e.code==='Escape'){pause();return;}if(!['PLAYING','TRANSITIONING','ANSWER_FEEDBACK'].includes(state))return;if(e.code==='KeyR'&&!e.repeat){e.preventDefault();listen();return;}if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyE','Space'].includes(e.code)){e.preventDefault();keys.add(e.code);if(!e.repeat&&(e.code==='KeyE'||e.code==='Space'))interact();}});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement)pause();});window.addEventListener('resize',()=>world?.resize());
function bindScene(){const canvas=world.renderer.domElement;canvas.addEventListener('pointerdown',e=>{if(!['PLAYING','TRANSITIONING','ANSWER_FEEDBACK'].includes(state))return;if(e.pointerType==='mouse'){try{const request=canvas.requestPointerLock?.();request?.catch?.(()=>{});}catch{}}lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(state==='PAUSED')return;if(document.pointerLockElement===canvas)world.look(e.movementX,e.movementY,Number($('sensitivity').value));else if(lookPointer===e.pointerId){world.look(e.clientX-lastX,e.clientY-lastY);lastX=e.clientX;lastY=e.clientY;}});for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>lookPointer=null);}
const stick=$('stick');function stickMove(e){if(e.pointerId!==stickPointer)return;const r=stick.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,n=Math.max(40,Math.hypot(x,y));movement.x=x/n;movement.y=-y/n;$('knob').style.transform=`translate(${movement.x*32}px,${-movement.y*32}px)`;}
stick.onpointerdown=e=>{stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);stickMove(e);};stick.onpointermove=stickMove;for(const name of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(name,()=>{stickPointer=null;movement.x=movement.y=0;$('knob').style.transform='';});
let last=performance.now();function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(world&&['PLAYING','DEFEAT','WRONG_FEEDBACK','ANSWER_FEEDBACK','TRANSITIONING','ESCAPING'].includes(state)){
  if(state==='DEFEAT'){world.render(dt);if(defeat.update(dt))finish(false);requestAnimationFrame(frame);return;}
  if(state==='WRONG_FEEDBACK'){world.render(dt);if(now>feedbackUntil){wrongFlash.classList.remove('active');if(!session.lives)finish(false);else state='PLAYING';}requestAnimationFrame(frame);return;}
  if(state==='ANSWER_FEEDBACK'&&now>feedbackUntil)state='TRANSITIONING';
  if(state!=='ESCAPING'){world.yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt*1.8;world.move(movement.x+(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),movement.y+(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),dt);sound.walk(world.lastDistance);const i=world.nearest();$('interact').disabled=state!=='PLAYING'||i<0||world.doors[i].failed||(mode==='listening'&&!heard&&!hintUsed);$('interact').textContent=state==='TRANSITIONING'||state==='ANSWER_FEEDBACK'?'Durch die offene Tür gehen':mode==='listening'&&!heard&&!hintUsed?'Zuerst Wort anhören':i<0?'Gehe zu einer Tür':world.doors[i].failed?'Diese Tür bleibt zu':'Tür öffnen';
    if(state==='TRANSITIONING'&&world.camera.position.z< -7){session.advance();updateHUD();if(session.index===session.entries.length){state='ESCAPING';escapeTime=0;resetInput();feedback('Geschafft. Folge dem Licht!');sound.tone(true);}else room();}
  }else{escapeTime+=dt;world.camera.position.x*=Math.max(0,1-dt*2);world.yaw*=Math.max(0,1-dt*3);world.pitch*=Math.max(0,1-dt*3);world.camera.position.z-=dt*1.3;$('veil').style.opacity=Math.min(1,Math.max(0,(escapeTime-1.4)/1.6));if(escapeTime>3.3)finish(true);}
  world.render(dt);
}requestAnimationFrame(frame);}requestAnimationFrame(frame);
try{const response=await fetch('./words.tsv');if(!response.ok)throw Error();categories=parseTSV(await response.text());if(!categories.size)throw Error();$('category').replaceChildren(...[...categories.keys()].map(c=>new Option(c,c)));options();$('loading').hidden=true;$('form').hidden=false;}catch{$('loading').textContent='Die Vokabeldatei konnte nicht geladen werden. Bitte prüfe die Verbindung und lade die Seite neu.';}
