/* Presentation budgets only. Simulation, hit detection and network commands stay independent. */
(() => {
  class RenderBudget {
    constructor(quality='medium') {
      this.quality=['low','medium','high'].includes(quality)?quality:'medium';
      // Quality controls visual cost, never combat-motion cadence.
      this.fps=60;
      // Phones are 2-3x screens; 1x canvases look soft. Medium renders at up to 2x.
      this.pixelRatio={low:1.25,medium:2,high:2.5}[this.quality];this.floor=Math.max(1.25,this.pixelRatio-.25);
      this.next=0;this.cost=0;this.frameMs=0;this.samples=0;this.lastAdjustment=0;this.mode=null;
    }
    shouldDraw(now,active=true) {
      if(this.mode!==active){this.mode=active;this.next=0;this.count=0;this.lastDraw=-Infinity;}
      // Learn the display's refresh period so frames can be spaced evenly.
      if(this.lastSeen!==undefined){const d=now-this.lastSeen;if(d>2&&d<50)this.period=this.period?this.period*.9+d*.1:d;}
      this.lastSeen=now;
      if(!active){
        const interval=1000/15;
        if(now+Math.min(3,interval*.18)<this.next)return false;
        this.next=this.next&&now-this.next<interval?this.next+interval:now+interval;
        return true;
      }
      // Draw on every Nth vsync. A 60 FPS cap on a 90/144/165 Hz screen otherwise
      // alternates 1- and 2-refresh gaps, which reads as stutter even at high FPS.
      const period=this.period||1000/60,skip=Math.max(1,Math.ceil(1000/this.fps/period-.25));this.skip=skip;
      if(now-this.lastDraw>250){this.count=0;this.lastDraw=now;return true;}
      if(now-this.lastDraw<period*.5)return false;// duplicate call within one refresh
      if(++this.count>=skip){this.count=0;this.lastDraw=now;return true;}
      return false;
    }
    record(ms,now,frameMs=0) {
      this.cost=this.samples?this.cost*.94+ms*.06:ms;
      this.frameMs=this.samples?this.frameMs*.94+frameMs*.06:frameMs;this.samples++;
      if(this.samples<90||now-this.lastAdjustment<3000)return false;
      // Canvas command submission can be cheap while GPU work misses vsync.
      // Judge frame gaps against this display's own paced interval: on a 90 Hz
      // screen every other refresh (22 ms) is on time, not a missed frame.
      const expected=Math.max(1000/this.fps,(this.period||1000/60)*(this.skip||1));
      const overloaded=this.cost>12||this.frameMs>expected*1.35;
      // Never trade away visible sharpness: at most one small step below the
      // starting density, and the art quality tier never changes mid-match.
      if(overloaded&&this.pixelRatio>this.floor){this.pixelRatio=Math.max(this.floor,this.pixelRatio-.25);this.lastAdjustment=now;return true;}
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
