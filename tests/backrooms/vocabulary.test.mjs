import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseTSV,choices,spellingChoices,playable,lengths,Session,key} from '../../public/pages/backrooms/vocabulary.mjs';
const categories=parseTSV(readFileSync(new URL('../../public/pages/backrooms/words.tsv',import.meta.url),'utf8'));
assert.equal(categories.size,11);assert(![...categories.keys()].some(c=>/^x/i.test(c)));
for(const pool of categories.values())for(const entry of pool){const options=choices(entry,pool);assert(options.length>=2&&options.length<=3);assert.equal(new Set(options.map(key)).size,options.length);assert.equal(options.filter(o=>entry.answers.some(a=>key(a)===key(o))).length,1);}
const pool=categories.get('Saludar');const duplicates=parseTSV('category\tes\tde\nTest\tSoy Bjarne\tIch bin Bjarne\nTest\tYo soy Bjarne\tIch bin Bjarne').get('Test');assert.equal(duplicates.length,1);assert.equal(duplicates[0].answers.length,2);
assert.deepEqual(lengths(12),[5,10,12]);assert.deepEqual(lengths(2),[2]);assert.deepEqual(lengths(0),[]);
assert.throws(()=>parseTSV('wrong\theader\na\tb'));
assert.equal(playable([{de:'a',answers:['a']}]).length,0);
let s=new Session(pool,5);const first=s.current;assert.equal(s.answer('WRONG ONE'),'wrong');assert.equal(s.lives,2);assert.equal(s.answer('WRONG ONE'),'ignored');assert.equal(s.lives,2);assert.equal(s.advance(),false);assert.equal(s.current,first);assert.equal(s.answer('WRONG TWO'),'wrong');assert.equal(s.answer(s.current.answers[0]),'correct');assert.equal(s.answer(s.current.answers[0]),'ignored');s.advance();assert.equal(s.answer('WRONG THREE'),'wrong');assert.equal(s.lives,0);assert.equal(s.answer(s.current.answers[0]),'ignored');assert.equal(s.mistakes.size,2);
for(const n of [5,playable(pool).length]){s=new Session(pool,n);assert.equal(new Set(s.entries.map(e=>key(e.de))).size,n);while(s.current){assert.equal(s.answer(s.current.answers[0]),'correct');s.advance();}assert.equal(s.index,n);assert.equal(s.accuracy,100);}
s=new Session(pool,5);s.answer('WRONG');s.answer(s.current.answers[0]);s.advance();while(s.current){s.answer(s.current.answers[0]);s.advance();}assert.equal(s.accuracy,80);
console.log('PASS: real TSV, excluded categories, ambiguity, unique doors, lengths, lives, double attempts, failure, five/all runs and accuracy');

const all=[...categories.values()].flat(),known=new Set(all.flatMap(e=>e.answers).map(key));
for(const entry of all){
  const options=spellingChoices(entry,all);
  assert.equal(options.length,3);assert.equal(new Set(options.map(key)).size,3);
  assert.equal(options.filter(o=>entry.answers.some(a=>key(a)===key(o))).length,1);
  for(const wrong of options.filter(o=>key(o)!==key(entry.answers[0]))){
    assert(!known.has(key(wrong)),`Known answer used as misspelling: ${wrong}`);
    assert.equal([...wrong].length,[...entry.answers[0]].length);
    assert.equal([...wrong].filter((c,i)=>c!==[...entry.answers[0]][i]).length,1);
  }
}
s=new Session(pool,5);s.mistakes.add(0);s.answer(s.current.answers[0]);s.advance();assert.equal(s.accuracy,0);
console.log('PASS: all spelling doors have exactly one accepted answer and two unique single-letter changes, excluding the entire vocabulary; hint affects score');
