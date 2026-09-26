if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=20260926-4',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{}))}
