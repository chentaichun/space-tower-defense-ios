import ts from 'typescript';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {WEB_FILES} from './ios-release.mjs';
const ctx=vm.createContext({console});ctx.window=ctx;
for(const f of ['v2-i18n.js','game-locale.js','game-locale-data.js','game-locale-intro.js','game-locale-ranked.js','game-locale-extra.js','game-locale-aliases.js'])vm.runInContext(readFileSync(f,'utf8'),ctx);
const tables=[],candidates=new Map(),languages=['zh','en','ja','ko','ru','es'];
const named=new Map();
function value(n){if(ts.isStringLiteralLike(n))return n.text;if(ts.isNumericLiteral(n))return Number(n.text);if(ts.isIdentifier(n))return named.get(n.text);if(ts.isPropertyAccessExpression(n))return value(n.expression)?.[n.name.text];if(ts.isArrayLiteralExpression(n))return n.elements.map(value);if(ts.isObjectLiteralExpression(n)){const out={};for(const p of n.properties){if(ts.isSpreadAssignment(p))Object.assign(out,value(p.expression));else if(ts.isPropertyAssignment(p))out[p.name.text]=value(p.initializer);}return out;}return undefined;}
function add(s,file){const parts=/<[a-z][^>]*>/i.test(s)?s.replace(/<[^>]*>/g,'\n').split('\n'):[s];for(let p of parts){p=p.trim();if(/[\u3400-\u9fff]/.test(p)&&!candidates.has(p))candidates.set(p,file);}}
for(const file of WEB_FILES.filter(f=>(f.endsWith('.js')&&!f.startsWith('game-locale')&&!f.includes('-art')&&!f.includes('enemy-catalog'))||f==='index.html'||f==='ranked.html')){
 let code=readFileSync(file,'utf8');if(file.endsWith('.html')){add(code.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''),file);code=[...code.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).join('\n');}
 const ast=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 function walk(n){if(ts.isBinaryExpression(n)&&n.operatorToken.kind===ts.SyntaxKind.EqualsToken&&ts.isPropertyAccessExpression(n.left)&&ts.isIdentifier(n.left.expression)&&named.has(n.left.expression.text)){named.get(n.left.expression.text)[n.left.name.text]=value(n.right);return;}
 if(ts.isObjectLiteralExpression(n)){const keys=n.properties.filter(ts.isPropertyAssignment).map(p=>p.name.text);if(keys.includes('zh')&&keys.includes('en')){const name=ts.isVariableDeclaration(n.parent)?n.parent.name.getText():null,table=value(n);if(name)named.set(name,table);if(file!=='v2-i18n.js')tables.push({file,line:ast.getLineAndCharacterOfPosition(n.pos).line+1,table});return;}}
 if(ts.isStringLiteralLike(n))add(n.text,file);if(ts.isTemplateExpression(n))add(n.head.text+n.templateSpans.map((s,i)=>'{'+i+'}'+s.literal.text).join(''),file);ts.forEachChild(n,walk);}walk(ast);
}
tables.push({file:'v2-i18n.js',line:1,table:ctx.V2_I18N});for(const t of tables)ctx.SpaceTowerLocale.register(t.table);ctx.SpaceTowerLocale.compile();ctx.SpaceTowerLocale.setLanguage('en');
const gaps=[];for(const t of tables){function check(v,path=[]){if(typeof v==='string'){const missing=languages.filter(lang=>typeof path.reduce((v,k)=>v?.[k],t.table[lang])!=='string');if(missing.length)gaps.push({file:t.file,line:t.line,path:path.join('.'),missing});}else if(v&&typeof v==='object')Object.entries(v).forEach(([k,v])=>check(v,[...path,k]));}check(t.table.zh);}
const missing=[...candidates].filter(([s])=>ctx.SpaceTowerLocale.text(s)===s).map(([text,file])=>({file,text}));
writeFileSync('tmp/six-language-audit.json',JSON.stringify({tables:tables.length,tableGaps:gaps,untranslatedCandidates:missing},null,2));
console.log(JSON.stringify({tables:tables.length,tableGaps:gaps.length,candidates:missing.length}));console.log(missing.map(x=>x.file+': '+x.text).join('\n'));
