const RUNNERS=["brona","chiller","dreamer","racer","rookie","skater"];
const RUNNER_NAMES={brona:"BRONA",chiller:"THE CHILLER",dreamer:"THE DREAMER",racer:"THE RACER",rookie:"THE ROOKIE",skater:"THE SKATER"};
const DEFAULTS={nickname:"",runner:"brona",points:0,weeklyPoints:0,collected:{collection01:{}},lastReward:null};
let state;
try{state=JSON.parse(localStorage.getItem("barameelRunState")||"null")||structuredClone(DEFAULTS)}catch(e){state=structuredClone(DEFAULTS)}
state.collected ||= {};
state.collected.collection01 ||= {};
state.points=Number(state.points)||0; state.weeklyPoints=Number(state.weeklyPoints)||0;
function save(){localStorage.setItem("barameelRunState",JSON.stringify(state))}
function setRunner(r){if(RUNNERS.includes(r)){state.runner=r;save()}}
function setNickname(n){state.nickname=String(n||"").slice(0,24);save()}
function addPoints(n){n=Number(n)||0;state.points+=n;state.weeklyPoints+=n;save()}
function collect(c,image,p){state.collected[c] ||= {}; state.collected[c][image] ||= []; const id=String(p).padStart(2,"0"); if(!state.collected[c][image].includes(id)){state.collected[c][image].push(id);save();return true} return false}
function pieces(c,image){return (state.collected[c]?.[image]||[]).map(Number).sort((a,b)=>a-b)}
function count(c,image){return pieces(c,image).length}
function hasPiece(c,image,p){return pieces(c,image).includes(Number(p))}
function selected(){return state.runner||"brona"}
function setLastReward(r){state.lastReward=r;save()}

let audioCtx,master;
function audio(){if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();master=audioCtx.createGain();master.gain.value=.82;master.connect(audioCtx.destination)} if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
function tone(freq,d=.1,type='square',gain=.22,delay=0){const c=audio(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,c.currentTime+delay);g.gain.exponentialRampToValueAtTime(gain,c.currentTime+delay+.01);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+delay+d);o.connect(g);g.connect(master);o.start(c.currentTime+delay);o.stop(c.currentTime+delay+d+.02)}
function play(type){if(type==='back'){tone(440,.06,'square',.28);tone(330,.08,'square',.24,.055);return}if(type==='error'){tone(180,.15,'sawtooth',.3);tone(110,.18,'square',.25,.08);return}if(type==='scan'){[660,880,1175].forEach((f,i)=>tone(f,.07,'square',.28,i*.06));return}if(type==='confirm'){[523,659,784,1047].forEach((f,i)=>tone(f,.08,'triangle',.3,i*.055));return}tone(520,.08,'sine',.12)}
function playRewardFrom(offset=0){let a=document.getElementById('rewardAudio');if(!a){a=document.createElement('audio');a.id='rewardAudio';a.src='./audio/reward-levelup.mp3';a.preload='auto';a.style.display='none';document.body.appendChild(a)}a.currentTime=Math.max(0,offset);a.volume=.9;a.play().catch(()=>{});return a}
function flash(){document.documentElement.classList.remove('ui-flash');void document.documentElement.offsetWidth;document.documentElement.classList.add('ui-flash')}
function go(url){location.href=url}
function preload(src){const im=new Image();im.decoding='async';im.src=src;return im}
function idle(fn){(window.requestIdleCallback||((cb)=>setTimeout(cb,350)))(fn,{timeout:1200})}
function preloadAll(list){let i=0;const next=()=>{if(i>=list.length)return;preload(list[i++]);idle(next)};next()}
async function fetchCollection(id='collection01'){const r=await fetch(`./assets/collections/${id}/collection.json`,{cache:'no-store'});if(!r.ok)throw Error('Collection data unavailable');return r.json()}
function parseQR(raw){const s=decodeURIComponent(String(raw||'')).trim();let m=s.match(/collection0?(\d+)\|image0?(\d+)\|piece0?(\d+)/i);if(!m){const c=s.match(/collection0?(\d+)/i),i=s.match(/image0?(\d+)/i),p=s.match(/piece0?(\d+)/i);if(!p)return null;m=[null,c?c[1]:1,i?i[1]:10,p[1]]}return{collection:`collection${String(m[1]).padStart(2,'0')}`,image:`image${String(m[2]).padStart(2,'0')}`,piece:Number(m[3])}}
function rewardTransition(r){localStorage.setItem('barameelRewardTransition',JSON.stringify({startedAt:Date.now(),...r}));playRewardFrom(0)}
window.BR={RUNNERS,RUNNER_NAMES,state,setRunner,setNickname,addPoints,collect,pieces,count,hasPiece,selected,setLastReward,play,playRewardFrom,flash,go,preload,preloadAll,idle,fetchCollection,parseQR,rewardTransition,save};
