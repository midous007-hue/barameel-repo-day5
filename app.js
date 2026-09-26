const RUNNERS=["brona","chiller","dreamer","racer","rookie","skater"];
const RUNNER_NAMES={brona:"BRONA",chiller:"THE CHILLER",dreamer:"THE DREAMER",racer:"THE RACER",rookie:"THE ROOKIE",skater:"THE SKATER"};
const DEFAULTS={nickname:"",runner:"brona",points:0,weeklyPoints:0,collected:{collection01:{}},lastReward:null};
let state;
try{state=JSON.parse(localStorage.getItem("barameelRunState")||"null")||structuredClone(DEFAULTS)}catch(e){state=structuredClone(DEFAULTS)}
state.collected ||= {};
state.collected.collection01 ||= {};
state.points=Number(state.points)||0;
state.weeklyPoints=Number(state.weeklyPoints)||0;
function save(){localStorage.setItem("barameelRunState",JSON.stringify(state))}
function setRunner(r){if(RUNNERS.includes(r)){state.runner=r;save()}}
function setNickname(n){state.nickname=String(n||"").slice(0,24);save()}
function addPoints(n){n=Number(n)||0;state.points+=n;state.weeklyPoints+=n;save()}
function collect(c,image,p){state.collected[c] ||= {};state.collected[c][image] ||= [];const id=String(p).padStart(2,"0");if(!state.collected[c][image].includes(id)){state.collected[c][image].push(id);save();return true}return false}
function pieces(c,image){return(state.collected[c]?.[image]||[]).map(Number).sort((a,b)=>a-b)}
function count(c,image){return pieces(c,image).length}
function hasPiece(c,image,p){return pieces(c,image).includes(Number(p))}
function selected(){return state.runner||"brona"}
function setLastReward(r){state.lastReward=r;save()}

/* BARAMEEL RUN ARCADE AUDIO
   Local assets are the primary sound source. WebAudio remains as a fallback so
   a missing/blocked asset never makes a control feel dead. */
const SOUND_FILES={
  tap:"./audio/tap.wav",
  select:"./audio/select.wav",
  confirm:"./audio/confirm.wav",
  back:"./audio/back.wav",
  scan:"./audio/scan.wav",
  error:"./audio/error.wav"
};
const soundBank={};
function audioCtx(){
  if(!audioCtx.ctx){
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C)return null;
    audioCtx.ctx=new C();
    audioCtx.master=audioCtx.ctx.createGain();
    audioCtx.master.gain.value=.72;
    audioCtx.master.connect(audioCtx.ctx.destination);
  }
  if(audioCtx.ctx.state==='suspended')audioCtx.ctx.resume().catch(()=>{});
  return audioCtx.ctx;
}
function tone(freq,d=.1,type='square',gain=.22,delay=0){
  const c=audioCtx();if(!c)return;
  const o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.value=freq;
  g.gain.setValueAtTime(.0001,c.currentTime+delay);
  g.gain.exponentialRampToValueAtTime(gain,c.currentTime+delay+.008);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+delay+d);
  o.connect(g);g.connect(audioCtx.master);
  o.start(c.currentTime+delay);o.stop(c.currentTime+delay+d+.02);
}
function fallbackSound(type){
  if(type==='back'){tone(659,.08,'square',.25);tone(523,.10,'square',.22,.08);tone(392,.12,'triangle',.18,.18);return}
  if(type==='error'){tone(220,.10,'sawtooth',.28);tone(170,.11,'sawtooth',.3,.10);tone(120,.16,'square',.25,.21);return}
  if(type==='scan'){[660,880,1175,1568].forEach((f,i)=>tone(f,.06,'square',.24,i*.06));return}
  if(type==='confirm'){[523,659,784,1047,1568].forEach((f,i)=>tone(f,.07,'square',.27,i*.055));return}
  if(type==='select'){[392,523,659,988,1319].forEach((f,i)=>tone(f,.065,i<4?'square':'triangle',.25,i*.05));return}
  tone(720,.055,'square',.23);tone(980,.045,'square',.18,.055);
}
function primeSounds(){Object.entries(SOUND_FILES).forEach(([name,src])=>{const a=new Audio(src);a.preload='auto';a.playsInline=true;soundBank[name]=a})}
function play(type){
  const a=soundBank[type];
  if(a){try{a.currentTime=0;const p=a.play();if(p?.catch)p.catch(()=>fallbackSound(type));return a}catch(e){fallbackSound(type);return null}}
  fallbackSound(type);return null;
}
primeSounds();
function playRewardFrom(offset=0){let a=document.getElementById('rewardAudio');if(!a){a=document.createElement('audio');a.id='rewardAudio';a.src='./audio/reward-levelup.mp3';a.preload='auto';a.style.display='none';document.body.appendChild(a)}a.currentTime=Math.max(0,offset);a.volume=.9;const p=a.play();p?.catch(()=>{});return a}

/* Bright, isolated selection flash. It never filters/dims the page artwork. */
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
async function fetchCollection(id='collection01'){const r=await fetch(`./assets/collections/${id}/collection.json`,{cache:'no-store'});if(!r.ok)throw Error('Collection data unavailable');return r.json()}
function parseQR(raw){const s=decodeURIComponent(String(raw||'')).trim();let m=s.match(/collection0?(\d+)\|image0?(\d+)\|piece0?(\d+)/i);if(!m){const c=s.match(/collection0?(\d+)/i),i=s.match(/image0?(\d+)/i),p=s.match(/piece0?(\d+)/i);if(!p)return null;m=[null,c?c[1]:1,i?i[1]:10,p[1]]}return{collection:`collection${String(m[1]).padStart(2,'0')}`,image:`image${String(m[2]).padStart(2,'0')}`,piece:Number(m[3])}}
function rewardTransition(r){localStorage.setItem('barameelRewardTransition',JSON.stringify({startedAt:Date.now(),...r}));playRewardFrom(0)}
window.BR={RUNNERS,RUNNER_NAMES,state,setRunner,setNickname,addPoints,collect,pieces,count,hasPiece,selected,setLastReward,play,playRewardFrom,flash,go,goAfter,preload,preloadAll,idle,fetchCollection,parseQR,rewardTransition,save};
