/* Shared cup thresholds and original orbital rank insignia. */
(() => {
  const languages=['zh','en','ja','ko','ru','es'];
  const tiers=[
    [0,'#9aa9b6',['星塵','Stardust','星塵','성진','Звёздная пыль','Polvo estelar']],
    [700,'#cf9365',['青銅先鋒','Bronze Vanguard','ブロンズ先鋒','브론즈 선봉','Бронзовый авангард','Vanguardia de bronce']],
    [1500,'#c3e3f4',['白銀守衛','Silver Sentinel','シルバー守衛','실버 수호자','Серебряный страж','Guardián de plata']],
    [2500,'#f0ca73',['黃金統領','Gold Commander','ゴールド司令官','골드 사령관','Золотой командир','Comandante de oro']],
    [3000,'#72e7ef',['星鑽領主','Diamond Sovereign','ダイヤ領主','다이아 군주','Алмазный владыка','Soberano de diamante']],
    [4000,'#be9dff',['星耀霸主','Astral Overlord','星耀の覇者','별빛 패왕','Астральный властелин','Señor astral']],
    [6000,'#ffe2a2',['銀河王者','Galactic Champion','銀河の王者','은하의 제왕','Чемпион галактики','Campeón galáctico']]
  ].map(([min,color,names],index)=>Object.freeze({min,color,names:Object.freeze(names),index}));
  function describe(value,language='zh'){
    const cups=Math.max(0,Math.min(100000,Math.round(Number(value)||0))),tier=tiers.findLast(t=>cups>=t.min),next=tiers[tier.index+1],lang=Math.max(0,languages.indexOf(language));
    return {...tier,cups,name:tier.names[lang],nextName:next?.names[lang],next:next?.min??null,progress:next?(cups-tier.min)/(next.min-tier.min):1};
  }
  function badge(index=0){
    const tier=tiers[Math.max(0,Math.min(tiers.length-1,index))],n=tier.index,c=tier.color;
    const wings=n<2?'':Array.from({length:Math.min(4,n)},(_,i)=>`<path d="M${26-i*3} ${51+i*10} ${7-i} ${37+i*9} ${12-i} ${67+i*7} 35 89M${94+i*3} ${51+i*10} ${113+i} ${37+i*9} ${108+i} ${67+i*7} 85 89" fill="${c}" opacity="${.3+i*.15}"/>`).join('');
    const crown=n<4?'':`<path d="m35 29-5-18 19 10L60 4l11 17 19-10-5 18Z" fill="${c}" stroke="#fff4ce" stroke-width="1.2"/>`;
    const stars=Array.from({length:Math.min(5,n+1)},(_,i)=>{const x=60+(i-Math.min(4,n)/2)*10;return `<path d="m${x} 108 1.6 3.7 4 .4-3 2.6.8 4-3.4-2-3.4 2 .8-4-3-2.6 4-.4Z" fill="${c}"/>`;}).join('');
    return `<svg class="rank-insignia rank-insignia-${n}" viewBox="0 0 120 128" aria-hidden="true">${n>=5?`<ellipse cx="60" cy="63" rx="52" ry="48" fill="none" stroke="${c}" stroke-width=".7" opacity=".5"/>`:''}${wings}${crown}<path d="m60 24 34 18v34L60 108 26 76V42Z" fill="#091b2d" stroke="${c}" stroke-width="2.8"/><path d="m60 31 27 15v27l-27 26-27-26V46Z" fill="${c}" opacity=".15"/><path d="m60 32 27 14v26L60 98" fill="none" stroke="#fff" opacity=".25"/><path d="m60 43 7 16 17 6-17 7-7 20-7-20-17-7 17-6Z" fill="${c}"/><path d="m60 52 5 13-5 16-5-16Z" fill="#f5fcff" opacity=".85"/>${n>=3?`<path d="m43 88 17 16 17-16M40 40l20-11 20 11" fill="none" stroke="${c}" stroke-width="2"/>`:''}${stars}</svg>`;
  }
  globalThis.SpaceTowerRanks=Object.freeze({tiers:Object.freeze(tiers),describe,badge});
})();
