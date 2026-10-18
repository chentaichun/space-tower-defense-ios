/* Presentation budgets only. Simulation, hit detection and network commands stay independent. */
(() => {
  class RenderBudget {
    constructor(quality='medium') {
      this.quality=['low','medium','high'].includes(quality)?quality:'medium';
      this.fps={low:30,medium:60,high:60}[this.quality];
      this.pixelRatio={low:1,medium:1.25,high:1.5}[this.quality];
      this.next=0;this.cost=0;this.samples=0;this.lastAdjustment=0;this.mode=null;
    }
    shouldDraw(now,active=true) {
      if(this.mode!==active){this.mode=active;this.next=0;}
      const interval=1000/(active?this.fps:15);
      if(now+.2<this.next)return false;
      this.next=this.next&&now-this.next<interval?this.next+interval:now+interval;
      return true;
    }
    record(ms,now) {
      this.cost=this.samples?this.cost*.94+ms*.06:ms;this.samples++;
      if(this.samples<90||now-this.lastAdjustment<3000)return false;
      if(this.cost>12&&this.pixelRatio>1){this.pixelRatio=Math.max(1,this.pixelRatio-.25);this.lastAdjustment=now;return true;}
      if(this.cost>22&&this.fps>30){this.fps=30;this.lastAdjustment=now;}
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
