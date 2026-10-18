(() => {
  'use strict';
  const errors={LOGIN_REQUIRED:'請先回首頁登入，再開始配對',LOADOUT_NOT_READY:'請先回首頁同步五砲陣容與教學進度',RANKED_UNAVAILABLE:'配對服務尚未開放，請稍後再試',MATCHMAKING_UNAVAILABLE:'配對連線暫時中斷',MATCH_EXPIRED:'對戰已結束，請重新配對'};
  class RankedConnection {
    constructor(onState,onError){this.onState=onState;this.onError=onError;this.roomId=null;this.seq=0;this.active=false;this.chain=Promise.resolve();this.pending=null;}
    async request(body){
      const native=!window.SPACE_TOWER_LOCAL_RANKED&&(!!window.Capacitor||location.protocol==='capacitor:'||location.hostname==='localhost');
      const origin=native?'https://space-tower-defense.pages.dev':'';
      const token=localStorage.getItem('spaceTowerPlayerSession')||sessionStorage.getItem('spaceTowerPlayerSession');
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),5000);
      try{const response=await fetch(origin+'/api/ranked',{method:'POST',headers:{'Content-Type':'application/json',...(token&&!window.SPACE_TOWER_LOCAL_RANKED?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),signal:controller.signal});
        const data=await response.json();if(!response.ok)throw new Error(errors[data.error]||'連線中斷，正在重新連接');return data;
      }finally{clearTimeout(timeout);}
    }
    serial(fn){const task=this.chain.then(fn);this.chain=task.catch(()=>{});return task;}
    accept(data){if(data.roomId)this.roomId=data.roomId;if(Number.isInteger(data.ackSeq))this.seq=data.ackSeq;if(data.status==='idle'&&this.active){this.active=false;this.onError('配對已逾時，請重新開始',true);}else this.onState(data);if(['finished','cancelled'].includes(data.status)){this.active=false;clearTimeout(this.timer);}return data;}
    async begin(loadout){
      if(this.active)return;this.active=true;this.roomId=null;this.seq=0;this.pending=null;clearTimeout(this.timer);
      try{await this.serial(async()=>this.accept(await this.request({action:'join',loadout})));this.schedule(0);}catch(error){this.active=false;this.onError(error.message,true);}
    }
    async recover(){
      try{const data=await this.serial(()=>this.request({action:'status'}));if(data.status==='matched'||data.status==='searching'){this.active=true;this.accept(data);this.schedule(0);}}catch{/* A first visit is allowed before signing in. */}
    }
    schedule(delay=200){clearTimeout(this.timer);if(this.active)this.timer=setTimeout(()=>this.poll(),delay);}
    async poll(){
      const started=performance.now();
      try{await this.serial(async()=>{
        if(!this.active)return;
        if(this.pending){this.accept(await this.request({action:'command',roomId:this.roomId,command:this.pending}));this.pending=null;}
        if(this.active)this.accept(await this.request({action:this.roomId?'poll':'status',roomId:this.roomId}));
      });this.schedule(this.roomId?Math.max(25,200-(performance.now()-started)):900);}catch(error){this.onError(error.message,false);this.schedule(1500);}
    }
    async command(type,values={}){
      if(!this.active||!this.roomId||this.pending)return {ok:false,reason:'等待連線確認'};
      return this.serial(async()=>{
        if(this.pending)return {ok:false,reason:'等待連線確認'};
        this.pending={...values,type,seq:this.seq+1};
        try{const data=this.accept(await this.request({action:'command',roomId:this.roomId,command:this.pending}));this.pending=null;return data.commandResult||{ok:false};}
        catch(error){this.onError(error.message,false);return {ok:false,reason:'操作確認中，請稍候'};}
      });
    }
    async cancel(){
      return this.serial(async()=>{const data=await this.request({action:'cancel'});this.accept(data);if(data.status==='matched')this.schedule(0);return data;});
    }
  }
  window.SpaceTowerRankedConnection=RankedConnection;
})();
