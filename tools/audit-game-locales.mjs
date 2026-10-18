import ts from 'typescript';
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),ctx=vm.createContext({window:{},console});
vm.runInContext(readFileSync(new URL('v2-i18n.js',root),'utf8'),ctx);
const existing=new Set();
function leaves(v){if(typeof v==='string')existing.add(v.trim());else if(v&&typeof v==='object')Object.values(v).forEach(leaves);}
leaves(ctx.window.V2_I18N.zh);
const found=new Map();
function record(value,file){
  const candidates=/<[a-z][^>]*>/i.test(value)?[...value.replace(/<[^>]*>/g,'\n').split('\n'),...Array.from(value.matchAll(/(?:aria-label|placeholder|title)="([^"]*)"/g),m=>m[1])]:[value];
  for(let text of candidates){text=text.trim();if(!/[\u3400-\u9fff]/.test(text)||existing.has(text))continue;if(!found.has(text))found.set(text,new Set());found.get(text).add(file);}
}
const files=['ranked-mode.js','ranked-network.js','ranked-home.js','game-intro.js'];
for(const file of files){const code=readFileSync(new URL(file,root),'utf8'),ast=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  function walk(n){if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))record(n.text,file);if(ts.isTemplateExpression(n))record(n.head.text+n.templateSpans.map((s,i)=>'{'+i+'}'+s.literal.text).join(''),file);ts.forEachChild(n,walk);}walk(ast);
}
record(readFileSync(new URL('ranked.html',root),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''),'ranked.html');
const entries=[...found].map(([text,files])=>({text,files:[...files]}));
writeFileSync(new URL('tmp/locale-candidates.json',root),JSON.stringify(entries,null,2));
console.log(entries.length+' additional localization candidates');
console.log(entries.map((e,i)=>i+' '+e.text).join('\n'));
