import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Mission,challenge} from '../../public/pages/backrooms/mission.mjs';
import {parseTSV,key} from '../../public/pages/backrooms/vocabulary.mjs';
for(const length of [2,5,10,17,50]){
  const mission=new Mission(length);
  assert.equal(mission.pending(0),-1);
  assert.equal(mission.collect(1),false);
  for(let completed=1;completed<=length;completed++){
    let stage;
    while((stage=mission.pending(completed))>=0){assert.equal(mission.collect(stage),true);assert.equal(mission.collect(stage),false);}
  }
  assert.equal(mission.ready,true);assert.equal(mission.parts.length,3);assert.equal(mission.pending(length),-1);
  assert.equal(new Mission(length).ready,false);
}
const categories=parseTSV(readFileSync(new URL('../../public/pages/backrooms/words.tsv',import.meta.url),'utf8'));
for(const pool of categories.values())for(const entry of pool)for(const stage of [0,1,2]){
  const task=challenge(stage,entry,pool);
  assert(task.options.length>=2);assert.equal(new Set(task.options.map(key)).size,task.options.length);
  assert.equal(task.options.filter(o=>o===task.answer).length,1);
  if(stage===0){const valid=pool.filter(e=>e.answers.some(a=>key(a)===key(task.es))).map(e=>e.de);assert.equal(task.options.filter(o=>valid.includes(o)).length,1);}
}
console.log('PASS: short/long mission milestones, three unique parts, duplicate collection prevention, restart, unambiguous radio/spelling/conversation choices across real vocabulary.');
