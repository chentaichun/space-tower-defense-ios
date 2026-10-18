/* Shared six-language presentation bridge. Gameplay IDs and values stay unchanged. */
(() => {
  'use strict';
  const languages=['zh','en','ja','ko','ru','es'],entries=new Map(),aliases=new Map(),patterns=[],cache=new Map();
  let language='en';
  const catalogBase=(globalThis.SpaceTowerCatalog?.turrets||[]).map(d=>({id:d.id,name:d.name,description:d.description}));
  const normalize=value=>String(value??'').trim().replace(/\s+/g,' ');
  const escapeRegex=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  function add(source,values){
    source=normalize(source);if(!source||values.length!==5||values.some(v=>typeof v!=='string'||!v))throw Error('Incomplete locale entry: '+source);
    const row=Object.fromEntries(languages.map((lang,i)=>[lang,i?values[i-1]:source]));entries.set(source,row);
  }
  function register(table){
    function walk(value,path=[]){if(typeof value==='string'){
      const values=languages.slice(1).map(lang=>path.reduce((v,key)=>v?.[key],table[lang]));
      if(values.every(v=>typeof v==='string'&&v)&&!entries.has(normalize(value)))add(value,values);
    }else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>walk(v,[...path,k]));}
    walk(table?.zh);cache.clear();
  }
  function compile(){
    aliases.clear();patterns.length=0;cache.clear();
    for(const [source,row] of entries){
      for(const lang of languages)if(!/\{\d+\}/.test(row[lang]))aliases.set(normalize(row[lang]),source);
      for(const lang of ['zh','en'])if(/\{\d+\}/.test(row[lang])){
        const keys=[];let offset=0,regex='^';
        for(const m of row[lang].matchAll(/\{(\d+)\}/g)){regex+=escapeRegex(row[lang].slice(offset,m.index))+'(.*?)';keys.push(m[1]);offset=m.index+m[0].length;}
        regex+=escapeRegex(row[lang].slice(offset))+'$';patterns.push({regex:new RegExp(regex),keys,row,weight:row[lang].replace(/\{\d+\}/g,'').length});
      }
    }
    patterns.sort((a,b)=>b.weight-a.weight);
  }
  function text(value,depth=0){
    const raw=String(value??''),key=normalize(raw);if(language==='zh'||!key||depth>3||/^(HP|VIP|MAX|G[1-8]|Lv\.\d+)$/.test(key))return raw;
    const memo=language+'|'+key;if(cache.has(memo))return raw.replace(raw.trim(),cache.get(memo));
    const source=aliases.get(key),row=entries.get(key)||entries.get(source);let out=row?.[language];
    if(out===undefined){for(const p of patterns){const m=p.regex.exec(key);if(!m)continue;const args={};p.keys.forEach((k,i)=>args[k]=text(m[i+1],depth+1));out=p.row[language].replace(/\{(\d+)\}/g,(_,k)=>args[k]??'');break;}}
    if(out===undefined)out=key;
    if(cache.size>4000)cache.clear();cache.set(memo,out);return raw.replace(raw.trim(),out);
  }
  function readLanguage(){
    let saved;try{saved=localStorage.getItem('spaceTowerLanguage');}catch{}
    const requested=new URLSearchParams(location.search).get('lang');
    return [requested,saved].find(candidate=>languages.includes(candidate))||'en';
  }
  language=typeof location==='object'?readLanguage():'en';
  const original=new WeakMap(),attributes=new WeakMap();
  const excluded='script,style,textarea,code,pre,[translate="no"],#opponentName,#matchingOpponentName,[data-player-name]';
  function translateNode(node){
    if(node.nodeType===3){
      if(!node.parentElement||node.parentElement.closest(excluded)||!node.textContent.trim())return;
      const previous=original.get(node),raw=node.textContent,source=previous&&raw===previous.output?previous.source:raw,output=text(source);
      original.set(node,{source,output});if(raw!==output)node.textContent=output;
    }else if(node.nodeType===1&&!node.closest(excluded)){
      let saved=attributes.get(node);if(!saved){saved={};attributes.set(node,saved);}
      for(const attr of ['aria-label','placeholder','title'])if(node.hasAttribute(attr)){
        const raw=node.getAttribute(attr),previous=saved[attr],source=previous&&raw===previous.output?previous.source:raw,output=text(source);
        saved[attr]={source,output};if(raw!==output)node.setAttribute(attr,output);
      }
    }
  }
  function translate(root){
    if(!root)return;translateNode(root);if(root.nodeType===3)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);while(walker.nextNode())translateNode(walker.currentNode);
  }
  function setLanguage(next){language=languages.includes(next)?next:'en';cache.clear();if(typeof document==='object'){document.documentElement.lang=language==='zh'?'zh-Hant':language;translate(document.body);translate(document.querySelector('title'));}}
  function start(){
    const body=document.body;if(!body||body.nodeType!==1)return;
    if(globalThis.V2_I18N)register(globalThis.V2_I18N);
    for(const d of catalogBase)for(const [field,index] of [['name',0],['description',1]]){
      const values=languages.slice(1).map(lang=>globalThis.V2_I18N?.[lang]?.turrets?.[d.id]?.[index]);
      if(values.every(v=>typeof v==='string'&&v))add(d[field],values);
    }
    // Reuse established translations, including core UI, instead of divergent names.
    try{if(typeof I18N!=='undefined')register(I18N);if(typeof EXTRA_I18N!=='undefined')register(EXTRA_I18N);if(typeof TASK_I18N!=='undefined')register(TASK_I18N);if(typeof SHOP_UI_I18N!=='undefined')register(SHOP_UI_I18N);}catch{}
    compile();setLanguage(document.documentElement.lang==='zh-Hant'?'zh':document.documentElement.lang||language);
    translate(document.body);
    new MutationObserver(records=>{
      const roots=new Set();for(const r of records){if(r.type==='childList')r.addedNodes.forEach(n=>roots.add(n));else roots.add(r.target);}
      for(const node of roots)if(node.isConnected)translate(node);
    }).observe(body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title']});
    window.addEventListener('space-tower-language-changed',event=>setLanguage(event.detail?.language||document.documentElement.lang.split('-')[0]));
  }
  globalThis.SpaceTowerLocale=Object.freeze({languages,add,register,compile,text,translate,setLanguage,get language(){return language;},entries});
  if(typeof document==='object')document.addEventListener('DOMContentLoaded',start,{once:true});
})();
