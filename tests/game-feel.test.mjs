import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source = readFileSync(new URL('../game-feel.js', import.meta.url), 'utf8');
const extract = name => source.match(new RegExp(`  function ${name}\\([^]*?\\n  \\}`))[0];
test('major encounter warning begins exactly five or ten waves before contact', () => {
  const c = {}; vm.runInNewContext(extract('milestone'), c);
  for (const target of [50,100,150,200,500,1000,1500]) {
    const lead = target % 100 === 0 ? 10 : 5;
    assert.equal(c.milestone(target-lead-1).warning, false);
    assert.equal(c.milestone(target-lead).warning, true);
    assert.equal(c.milestone(target-lead).distance, lead);
    assert.equal(c.milestone(target).distance, 0);
    assert.equal(c.milestone(target+1).warning, false);
  }
  assert.equal(c.milestone(10).warning, false);
  assert.equal(c.milestone(750).progress, .5);
  assert.equal(c.milestone(1500).progress, 1);
  assert.equal(c.milestone(1600).progress, 1);
});
test('haptics throttle sustained critical hits and honour background, preference and reduced motion', () => {
  let now = 0; const calls = [];
  const c = {performance:{now:()=>now}, navigator:{vibrate:x=>calls.push(x)}, document:{hidden:false}, reduced:{matches:false}, haptics:true, lastHaptic:-Infinity};
  vm.runInNewContext(extract('pulse'), c);
  for (now=0;now<1000;now+=10) c.pulse(true);
  assert.equal(calls.length,6);
  c.haptics=false; now=2000; c.pulse(true);
  c.haptics=true;c.reduced.matches=true;c.pulse(true);
  c.reduced.matches=false;c.document.hidden=true;c.pulse(true);
  assert.equal(calls.length,6);
  c.document.hidden=false;c.navigator={};assert.doesNotThrow(()=>c.pulse());
});
