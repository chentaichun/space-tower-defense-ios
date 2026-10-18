/* Presentation budgets only. Simulation, hit detection and network commands stay independent. */
(() => {
  class RenderBudget {
    constructor(quality='medium') {
      this.quality=['low','medium','high'].includes(quality)?quality:'medium';
      // Quality controls visual cost, never combat-motion cadence.
      this.fps=60;
      this.pixelRatio={low:1,medium:1,high:1.5}[this.quality];
      this.next=0;this.cost=0;this.frameMs=0;this.samples=0;this.lastAdjustment=0;this.mode=null;
    }
    shouldDraw(now,active=true) {
      if(this.mode!==active){this.mode=active;this.next=0;}
      const interval=1000/(active?this.fps:15);
      // Small vsync jitter must not turn a 60 Hz display into alternating
      // 16/33 ms frames. High-refresh displays still obey the 60 FPS budget.
      if(now+Math.min(3,interval*.18)<this.next)return false;
      this.next=this.next&&now-this.next<interval?this.next+interval:now+interval;
      return true;
    }
    record(ms,now,frameMs=0) {
      this.cost=this.samples?this.cost*.94+ms*.06:ms;
      this.frameMs=this.samples?this.frameMs*.94+frameMs*.06:frameMs;this.samples++;
      if(this.samples<90||now-this.lastAdjustment<3000)return false;
      // Canvas command submission can be cheap while GPU work misses vsync.
      const overloaded=this.cost>12||this.frameMs>21;
      if(overloaded&&this.pixelRatio>.75){this.pixelRatio=Math.max(.75,this.pixelRatio-(this.pixelRatio>1?.25:.125));this.lastAdjustment=now;return true;}
      if(overloaded&&this.quality!=='low'){this.quality='low';this.lastAdjustment=now;return true;}
      return false;
    }
  }
  // Compare canonical values, not translated DOM output, so localization never
  // causes identical HUD text to be replaced and translated again every frame.
  const values=new WeakMap();
  function changed(node,key,value,write){let saved=values.get(node);if(!saved){saved=new Map();values.set(node,saved);}if(saved.get(key)===value)return;write();saved.set(key,value);}
  const text=(node,value)=>{value=String(value);changed(node,'text',value,()=>{node.textContent=value;});};
  const attr=(node,key,value)=>{value=String(value);changed(node,'attr:'+key,value,()=>node.setAttribute(key,value));};
  globalThis.SpaceTowerRankedRendering=Object.freeze({RenderBudget,text,attr});
})();
