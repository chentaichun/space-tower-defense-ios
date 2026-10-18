import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url),html=readFileSync(new URL('index.html',root),'utf8');
const detect=html.slice(html.indexOf('    function detectLanguage()'),html.indexOf('    function syncLanguageButtonControls'));
const shared=readFileSync(new URL('game-locale.js',root),'utf8');
const languages=['zh','en','ja','ko','ru','es'];
function run(saved,requested='',device='zh-TW'){
  const context=vm.createContext({URLSearchParams,location:{search:requested?'?lang='+requested:''},navigator:{language:device},localStorage:{getItem:()=>saved},I18N:Object.fromEntries(languages.map(l=>[l,{}])),SHOP_SALE_PREVIEW:false});
  vm.runInContext(shared,context);vm.runInContext(detect,context);
  return [vm.runInContext('detectLanguage()',context),context.SpaceTowerLocale.language];
}
test('fresh installs start in English on all six device languages',()=>{
  for(const device of ['zh-TW','en-US','ja-JP','ko-KR','ru-RU','es-ES'])assert.deepEqual(run(null,'',device),['en','en']);
});
test('explicit language selections survive reload and a valid link can override them',()=>{
  for(const language of languages){assert.deepEqual(run(language),[language,language]);assert.deepEqual(run('en',language),[language,language]);}
  assert.deepEqual(run('ja','invalid'),['ja','ja']);assert.deepEqual(run('invalid'),['en','en']);
});
