import {shuffle, key, spellingChoices} from './vocabulary.mjs';

const conversations = [
  {es:'Tengo hambre.', answer:'Aquí tienes un bocadillo.', wrong:['Buenas noches.','Me llamo Pablo.'], help:'„Ich habe Hunger.“ — „Hier hast du ein belegtes Brötchen.“'},
  {es:'¿Cómo te llamas?', answer:'Me llamo Bjarne.', wrong:['Tengo hambre.','Hasta mañana.'], help:'„Wie heißt du?“ — „Ich heiße Bjarne.“'},
  {es:'¿Dónde está la salida?', answer:'La salida está allí.', wrong:['Me llamo Ana.','Tengo doce años.'], help:'„Wo ist der Ausgang?“ — „Der Ausgang ist dort.“'},
  {es:'Muchas gracias.', answer:'De nada.', wrong:['Tengo sed.','Me llamo Pablo.'], help:'„Vielen Dank.“ — „Gern geschehen.“'},
  {es:'Tengo sed.', answer:'Aquí tienes agua.', wrong:['Hasta mañana.','Tengo doce años.'], help:'„Ich habe Durst.“ — „Hier hast du Wasser.“'},
];
export const PARTS = ['Batterie', 'Sicherung', 'Kabel'];
export class Mission {
  constructor(length) { this.thresholds=[1,2,3].map(n=>Math.ceil(length*n/3));this.parts=[];this.review=[];this.wrong=0; }
  pending(completed) { return this.parts.length<3 && completed>=this.thresholds[this.parts.length] ? this.parts.length : -1; }
  collect(stage) { if(stage!==this.parts.length || stage>2)return false;this.parts.push(PARTS[stage]);return true; }
  get ready(){return this.parts.length===3;}
}
export function challenge(stage, entry, pool, random=Math.random) {
  if(stage===1){
    const c=conversations[Math.floor(random()*conversations.length)];
    return {title:'Der Wächter versperrt den Weg',kind:'monster',part:PARTS[stage],prompt:'Welche Antwort passt?',es:c.es,answer:c.answer,options:shuffle([c.answer,...c.wrong],random),help:c.help};
  }
  if(stage===2)return {title:'Der verschlossene Schrank',kind:'cabinet',part:PARTS[stage],prompt:`Welches spanische Wort ist richtig geschrieben? · ${entry.de}`,es:'',answer:entry.answers[0],options:spellingChoices(entry,pool,random),help:`${entry.de} = ${entry.answers.join(' / ')}`};
  const es=entry.answers[0];
  const excluded=new Set(pool.filter(e=>e.answers.some(a=>key(a)===key(es))).map(e=>key(e.de)));
  const alternatives=[...new Set(pool.map(e=>e.de))].filter(de=>!excluded.has(key(de)));
  return {title:'Die verlassene Funkstation',kind:'radio',part:PARTS[stage],prompt:'Was bedeutet die spanische Nachricht?',es,answer:entry.de,options:shuffle([entry.de,...shuffle(alternatives,random).slice(0,2)],random),help:`${es} = ${entry.de}`};
}

export class MissionPanel {
  constructor(sound,world,onComplete,onPause){
    this.sound=sound;this.world=world;this.onComplete=onComplete;
    this.element=document.createElement('section');this.element.id='missionPanel';this.element.className='panel';this.element.hidden=true;
    this.element.setAttribute('role','dialog');this.element.setAttribute('aria-modal','true');this.element.setAttribute('aria-labelledby','missionTitle');
    this.element.innerHTML='<div class="eyebrow" id="missionKind"></div><h2 id="missionTitle"></h2><p id="missionPrompt"></p><p id="missionSpanish" lang="es"></p><button id="missionSpeak">▶ Noch einmal anhören</button><div id="missionAnswers"></div><p id="missionFeedback" role="status" aria-live="polite"></p><p class="instructions">Kein Zeitlimit. Nimm dir so viel Zeit, wie du brauchst.</p><button id="missionContinue" class="primary" hidden>Weiter</button><button id="missionPause">Pause</button>';
    document.body.append(this.element);this.$=id=>this.element.querySelector('#'+id);
    this.$('missionPause').onclick=onPause;
    this.$('missionSpeak').onclick=()=>{if(sound.muted)document.getElementById('mute').click();sound.speak(this.task.es,ok=>{if(!ok&&!this.element.hidden)this.$('missionFeedback').textContent='Sprachausgabe nicht verfügbar. Du kannst den spanischen Text lesen.';});};
    this.$('missionContinue').onclick=()=>{if(!this.solved)return;this.hide();this.onComplete();};
    this.element.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const buttons=[...this.element.querySelectorAll('button')].filter(b=>!b.hidden&&!b.disabled);const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
  }
  show(task,mission){
    this.task=task;this.mission=mission;this.solved=false;this.attempted=new Set();this.element.hidden=false;
    this.$('missionKind').textContent=task.kind==='generator'?'MISSION · AUSGANG':'GENERATORTEIL · '+task.part.toUpperCase();
    this.$('missionTitle').textContent=task.title;this.$('missionPrompt').textContent=task.prompt;this.$('missionSpanish').textContent=task.es;
    this.$('missionSpeak').hidden=!task.es;this.$('missionContinue').hidden=true;this.$('missionFeedback').textContent='';this.$('missionAnswers').replaceChildren();
    this.world.encounter(task.kind,0);
    for(const option of task.options){const b=document.createElement('button');b.textContent=option;if(task.kind!=='radio'&&task.kind!=='generator')b.lang='es';b.onclick=()=>this.answer(option,b);this.$('missionAnswers').append(b);}
    this.$('missionAnswers').querySelector('button')?.focus();
    if(task.es)this.sound.speak(task.es);
  }
  answer(option,button){
    if(this.solved||this.attempted.has(option))return;
    this.attempted.add(option);
    if(option!==this.task.answer){
      button.disabled=true;this.mission.wrong++;this.sound.error();
      if(!this.mission.review.includes(this.task.help))this.mission.review.push(this.task.help);
      this.world.encounter(this.task.kind,this.attempted.size);
      this.$('missionFeedback').textContent=(this.task.kind==='monster'?'Der Wächter kommt einen Schritt näher. ':'Noch nicht richtig. ')+this.task.help+' Wähle die passende Antwort. Kein Zeitdruck.';
      return;
    }
    this.solved=true;this.sound.cancelSpeech();this.sound.tone(true);this.world.encounter('clear',0);
    for(const b of this.$('missionAnswers').children)b.disabled=true;
    this.$('missionFeedback').textContent=this.task.kind==='generator'?'Der Generator läuft. Der Ausgang hat wieder Strom!':this.task.help+' '+this.task.part+' gefunden!';
    this.$('missionContinue').textContent=this.task.kind==='generator'?'Zum Ausgang':this.task.part+' mitnehmen';this.$('missionContinue').hidden=false;this.$('missionContinue').focus();
  }
  hide(){this.element.hidden=true;this.sound.cancelSpeech();this.world.encounter('clear',0);}
}
