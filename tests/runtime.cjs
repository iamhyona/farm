const {parseHTML}=require('linkedom');
const vm=require('node:vm'),fs=require('node:fs');
function boot(source,initial={}){
 const {window}=parseHTML(source);const {document}=window;let tasks=[],intervals=[];
 const values=new Map(Object.entries(initial));
 const noop=()=>{},ctx=new Proxy({measureText:t=>({width:String(t).length*7}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),getImageData:()=>({data:new Uint8ClampedArray(4)}),createPattern:()=>({})},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
 window.HTMLCanvasElement.prototype.getContext=()=>ctx;
 window.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,right:390,bottom:844,width:390,height:844});
 class Img{constructor(){this.width=this.naturalWidth=256;this.height=this.naturalHeight=256;this.complete=false}set src(v){this._src=v}get src(){return this._src}}
 const sandbox={document,console,Image:Img,MutationObserver:class{observe(){}disconnect(){}},NodeFilter:{SHOW_TEXT:4},Path2D:class{moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}arc(){}ellipse(){}closePath(){}rect(){}roundRect(){}addPath(){}},innerWidth:390,innerHeight:844,devicePixelRatio:1,navigator:{},location:{hash:'#test',pathname:'/farm/',search:''},performance:{now:()=>0},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v))},getComputedStyle:()=>({fontSize:'14',paddingLeft:'0',paddingRight:'0',getPropertyValue:()=>''}),requestAnimationFrame:noop,cancelAnimationFrame:noop,setTimeout:(f,ms)=>(tasks.push({f,ms}),tasks.length),clearTimeout:noop,setInterval:(f,ms)=>(intervals.push({f,ms}),intervals.length),clearInterval:noop,addEventListener:noop,fetch:async()=>({ok:false,json:async()=>[],text:async()=>'',body:null}),URL,URLSearchParams,TextEncoder,TextDecoder,Uint8Array,crypto:require('crypto').webcrypto,Math,Date,Map,Set,JSON,Array,Promise};
 sandbox.window=sandbox;sandbox.globalThis=sandbox;
 const context=vm.createContext(sandbox);for(const m of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))vm.runInContext(m[0].includes('src="audio/player.js')?fs.readFileSync('audio/player.js','utf8'):m[1],context,{timeout:10000});
 return{qa:sandbox.__qa,document,values,context,intervals,tasks,runTimers(ms){const todo=tasks;tasks=[];for(const t of todo)if(ms==null||t.ms===ms)t.f()},event(type,target,extra={}){const e=new window.Event(type,{bubbles:true});Object.assign(e,extra);target.dispatchEvent(e)}};
}
module.exports={boot};
if(require.main===module){const r=boot(fs.readFileSync('index.html','utf8'));console.log('booted',!!r.qa,r.qa.S.inv.length)}
