const RUNNERS=["brona","chiller","dreamer","racer","rookie","skater"];
const RUNNER_NAMES={brona:"BRONA",chiller:"THE CHILLER",dreamer:"THE DREAMER",racer:"THE RACER",rookie:"THE ROOKIE",skater:"THE SKATER"};
const DEFAULTS={nickname:"",runner:"brona",points:0,weeklyPoints:0,checkpoints:[],collected:{collection01:{}},lastReward:null};
let state;
try{state=JSON.parse(localStorage.getItem("barameelRunState")||"null")||structuredClone(DEFAULTS)}catch(e){state=structuredClone(DEFAULTS)}
state.collected ||= {};
state.collected.collection01 ||= {};
state.points=Number(state.points)||0;
state.weeklyPoints=Number(state.weeklyPoints)||0;
state.checkpoints=Array.isArray(state.checkpoints)?state.checkpoints:[];
// Backfill checkpoint keys from older saves that predate the explicit checkpoint list.
(function syncLegacyCheckpoints(){
  const seen=new Set(state.checkpoints.map(String));
  Object.entries(state.collected||{}).forEach(([c,images])=>Object.entries(images||{}).forEach(([image,list])=>{
    (list||[]).forEach(piece=>seen.add(`${c}|${image}|${String(piece).padStart(2,'0')}`));
  }));
  state.checkpoints=[...seen];
})();
function save(){localStorage.setItem("barameelRunState",JSON.stringify(state))}
function checkpointKey(c,image,p){return `${c}|${image}|${String(p).padStart(2,'0')}`}
function checkpointCount(){return state.checkpoints.length}
function registerCheckpoint(c,image,p){const key=checkpointKey(c,image,p);if(!state.checkpoints.includes(key)){state.checkpoints.push(key);save();return true}return false}
function setRunner(r){if(RUNNERS.includes(r)){state.runner=r;save()}}
function setNickname(n){state.nickname=String(n||"").slice(0,24);save()}
function addPoints(n){n=Number(n)||0;state.points+=n;state.weeklyPoints+=n;save()}
function collect(c,image,p){state.collected[c] ||= {};state.collected[c][image] ||= [];const id=String(p).padStart(2,"0");if(!state.collected[c][image].includes(id)){state.collected[c][image].push(id);registerCheckpoint(c,image,p);save();return true}return false}
function pieces(c,image){return(state.collected[c]?.[image]||[]).map(Number).sort((a,b)=>a-b)}
function count(c,image){return pieces(c,image).length}
function hasPiece(c,image,p){return pieces(c,image).includes(Number(p))}
function selected(){return state.runner||"brona"}
function setLastReward(r){state.lastReward=r;save()}

/* BARAMEEL RUN ARCADE AUDIO — v7
   Audio is explicitly unlocked on the first real user gesture, then played from
   local WAV assets. WebAudio is retained as a guaranteed local fallback. */
const SOUND_FILES={
  tap:"./audio/tap.wav",
  select:"./audio/select.wav",
  confirm:"./audio/confirm.wav",
  back:"./audio/back.wav",
  scan:"./audio/scan.wav",
  error:"./audio/error.wav",
  completion:"./audio/completion-arcade.wav"
};
const soundBank={};
let soundUnlocked=false;
let soundPrimed=false;
function getAudioContext(){
  if(!getAudioContext.ctx){
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C)return null;
    getAudioContext.ctx=new C();
    getAudioContext.master=getAudioContext.ctx.createGain();
    getAudioContext.master.gain.value=.78;
    getAudioContext.master.connect(getAudioContext.ctx.destination);
  }
  return getAudioContext.ctx;
}
function unlockAudio(){
  const c=getAudioContext();
  if(c){
    try{if(c.state==='suspended')c.resume();}catch(e){}
    // A silent one-sample source makes the unlock explicit on Safari/iOS.
    try{
      const b=c.createBuffer(1,1,c.sampleRate),o=c.createBufferSource();
      o.buffer=b;o.connect(c.destination);o.start(0);
    }catch(e){}
  }
  Object.values(soundBank).forEach(a=>{try{a.muted=true;const p=a.play();if(p?.then)p.then(()=>{a.pause();a.currentTime=0;a.muted=false}).catch(()=>{a.muted=false})}catch(e){a.muted=false}});
  soundUnlocked=true;
}
function ensureGestureAudio(){if(!soundUnlocked)unlockAudio()}
function tone(freq,d=.1,type='square',gain=.22,delay=0){
  const c=getAudioContext();if(!c)return;
  try{if(c.state==='suspended')c.resume()}catch(e){}
  const o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.value=freq;
  const t=c.currentTime+delay;
  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(gain,t+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(getAudioContext.master);
  o.start(t);o.stop(t+d+.02);
}
function fallbackSound(type){
  if(type==='back'){tone(659,.07,'square',.25);tone(523,.09,'square',.22,.07);tone(392,.12,'triangle',.18,.16);return}
  if(type==='error'){tone(220,.09,'sawtooth',.28);tone(170,.10,'sawtooth',.3,.09);tone(120,.15,'square',.25,.19);return}
  if(type==='scan'){[660,880,1175,1568].forEach((f,i)=>tone(f,.055,'square',.24,i*.055));return}
  if(type==='confirm'){[523,659,784,1047,1568].forEach((f,i)=>tone(f,.065,'square',.27,i*.05));return}
  if(type==='select'){[392,523,659,988,1319].forEach((f,i)=>tone(f,.06,i<4?'square':'triangle',.25,i*.045));return}
  tone(740,.06,'square',.25);tone(1040,.05,'square',.20,.055);
}
function primeSounds(){
  if(soundPrimed)return;
  soundPrimed=true;
  Object.entries(SOUND_FILES).forEach(([name,src])=>{
    const a=new Audio();a.src=src;a.preload='auto';a.playsInline=true;a.setAttribute('playsinline','');a.crossOrigin='anonymous';soundBank[name]=a;
    try{a.load()}catch(e){}
  });
}
function play(type){
  primeSounds();
  ensureGestureAudio();
  const a=soundBank[type];
  if(!a || a.readyState < 2){ fallbackSound(type); return null; }
  try{
    a.muted=false; a.volume=.92; a.currentTime=0;
    const p=a.play();
    if(p?.catch) p.catch(()=>fallbackSound(type));
    return a;
  }catch(e){ fallbackSound(type); return null; }
}
primeSounds();
['pointerdown','touchstart','mousedown','keydown'].forEach(ev=>window.addEventListener(ev,ensureGestureAudio,{capture:true,passive:true}));

function playRewardFrom(offset=0){ensureGestureAudio();let a=document.getElementById('rewardAudio');if(!a){a=document.createElement('audio');a.id='rewardAudio';a.src='./audio/reward-levelup.mp3';a.preload='auto';a.style.display='none';document.body.appendChild(a)}a.currentTime=Math.max(0,offset);a.volume=.9;const p=a.play();p?.catch(()=>{});return a}
function playSelect(runner){
  ensureGestureAudio();
  const roots={rookie:392,skater:440,brona:494,racer:554,chiller:622,dreamer:698};
  const root=roots[runner]||494;
  // Same arcade motif for every runner, transposed to a distinct pitch.
  [1,1.25,1.5,2,2.5].forEach((m,i)=>tone(root*m,.065,i===4?'triangle':'square',.24,i*.045));
}
function playPointsCountUp(amount,duration=2200){
  ensureGestureAudio();
  const c=getAudioContext();if(!c)return;
  const steps=Math.max(22,Math.min(38,Math.round(duration/58)));
  const span=duration/steps;
  const startF=420,endF=1320;
  for(let i=0;i<steps;i++){
    const p=i/(steps-1),f=startF+(endF-startF)*(p*p);
    tone(f,.045,'square',.11,.06+i*span/1000);
  }
  tone(880,.07,'triangle',.18,Math.max(0,(duration-220)/1000));
  tone(1175,.08,'triangle',.2,Math.max(0,(duration-125)/1000));
  tone(1568,.12,'triangle',.23,Math.max(0,(duration-20)/1000));
}
function playCompletionSound(){
  ensureGestureAudio();primeSounds();
  const a=soundBank.completion;
  if(a){try{a.currentTime=0;a.volume=.95;const p=a.play();if(p?.then)p.catch(()=>{});return a}catch(e){}}
  [523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,.11,i<5?'square':'triangle',.24,i*.09));
  tone(2093,.18,'triangle',.22,.62);
}
function rewardTransition(r){localStorage.setItem('barameelRewardTransition',JSON.stringify({startedAt:Date.now(),...r}));}
/* Navigation / utility helpers retained from the working V7 core. */
function flash(){
  let el=document.getElementById('barameelFlash');
  if(!el){el=document.createElement('div');el.id='barameelFlash';el.className='barameel-flash';document.body.appendChild(el)}
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on');
}
function go(url){location.href=url}
function goAfter(url,type,delay=180){play(type);window.setTimeout(()=>go(url),delay)}
function preload(src){const im=new Image();im.decoding='async';im.src=src;return im}
function idle(fn){(window.requestIdleCallback||((cb)=>setTimeout(cb,350)))(fn,{timeout:1200})}
function preloadAll(list){let i=0;const next=()=>{if(i>=list.length)return;preload(list[i++]);idle(next)};next()}
const collectionMemory={};
async function fetchCollection(id='collection01'){
  if(collectionMemory[id])return collectionMemory[id];
  const key=`barameelCollection:${id}`;
  try{const cached=sessionStorage.getItem(key);if(cached){const data=JSON.parse(cached);collectionMemory[id]=data;return data}}catch(e){}
  const r=await fetch(`./assets/collections/${id}/collection.json`,{cache:'force-cache'});
  if(!r.ok)throw Error('Collection data unavailable');
  const data=await r.json();
  collectionMemory[id]=data;
  try{sessionStorage.setItem(key,JSON.stringify(data))}catch(e){}
  return data;
}
function parseQR(raw){
  const s=decodeURIComponent(String(raw||'')).trim();
  let m=s.match(/collection0?(\d+)\|image0?(\d+)\|piece0?(\d+)/i);
  if(!m){
    const c=s.match(/collection0?(\d+)/i),i=s.match(/image0?(\d+)/i),p=s.match(/piece0?(\d+)/i);
    if(!p)return null;
    m=[null,c?c[1]:1,i?i[1]:10,p[1]];
  }
  return {collection:`collection${String(m[1]).padStart(2,'0')}`,image:`image${String(m[2]).padStart(2,'0')}`,piece:Number(m[3])};
}
window.BR={RUNNERS,RUNNER_NAMES,state,setRunner,setNickname,addPoints,collect,pieces,count,hasPiece,selected,setLastReward,play,playSelect,playPointsCountUp,playCompletionSound,playRewardFrom,flash,go,goAfter,preload,preloadAll,idle,fetchCollection,parseQR,rewardTransition,save,registerCheckpoint,checkpointCount};
