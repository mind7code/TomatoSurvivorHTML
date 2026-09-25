// Navegador real, sem dependências npm. A instrumentação só existe no servidor de teste.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const browser = process.env.TOMATO_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const baseline = process.argv.includes('--baseline');
const wait = ms => new Promise(r => setTimeout(r, ms));
const server = http.createServer((req, res) => {
  const relative = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'tomato (2).html';
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403);res.end();return; }
  try {
    let data = fs.readFileSync(file);
    if (file.endsWith('.html')) data = data.toString().replace('registerTools();draw();', 'window.__evaluate=code=>eval(code);registerTools();draw();');
    res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.js') ? 'text/javascript; charset=utf-8' : file.endsWith('.css') ? 'text/css' : 'image/png');res.end(data);
  } catch { res.writeHead(404);res.end(); }
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tomato-browser-'));
  const child = spawn(browser, ['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'--window-size=1366,768','about:blank'], { windowsHide:true, stdio:'ignore' });
  let ws;
  try {
    child.on('error', err => console.error(err.message));
    const portFile = path.join(profile, 'DevToolsActivePort');
    for(let i=0;i<80&&!fs.existsSync(portFile);i++) await wait(100);
    const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
    const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    ws = new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
    await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
    let seq=0;const pending=new Map(),errors=[];
    ws.onmessage = ({data}) => { const msg=JSON.parse(data);if(msg.id){const entry=pending.get(msg.id);pending.delete(msg.id);if(msg.error)entry.reject(Error(JSON.stringify(msg.error)));else entry.resolve(msg.result);}else if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails); };
    const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
    const evaluate=async expression=>{const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
    await call('Runtime.enable');await call('Page.enable');
    await call('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/`});
    for(let i=0;i<50;i++){if(await evaluate('typeof window.__evaluate === "function"'))break;await wait(100);}
    const setup = `startGame();aimInput.state.active=true;aimInput.state.down=true;aimInput.state.x=760;aimInput.state.y=240;wave=19;waveTime=999;spawnClock=999;player.hp=player.maxHp=1e9;player.nextXp=1e9;player.weapons=['minigun','machineGun','autoShotgun','flamethrower','bubbleBlaster','thornSprayer'].map(id=>createWeapon(id,'legendary',5));player.attackSpeed=3;player.projectiles=2;for(let n=0;n<160;n++){EnemyManager.spawn(n%3===0?'tank':n%3===1?'normal':'fast',{x:80+(n%16)*70,y:80+Math.floor(n/16)*55},{summoned:true})}for(const e of enemies){e.hp=e.maxHp=1e9;e.damage=0}for(let n=0;n<500;n++)drops.push({x:30+(n%25)*48,y:40+Math.floor(n/25)*32,t:n/10,value:1});updateHud();`;
    await evaluate(`window.__evaluate(${JSON.stringify(setup)})`);
    await evaluate(`window.__evaluate("for(const e of enemies)e.speed=0;const simulate=update;update=function(dt){simulate(dt);while(mode==='playing'&&bullets.length<300){const a=Math.random()*Math.PI*2;bullets.push({x:Math.random()*W,y:Math.random()*H,lastX:0,lastY:0,vx:Math.cos(a)*420,vy:Math.sin(a)*420,r:4,damage:0,crit:false,life:4,pierce:0,knock:0,color:'#d7ed6d',visual:'bullet',angle:a})}}")`);
    await evaluate(`window.__evaluate("const originalDraw=draw,originalUpdate=update;window.__costs={draw:[],update:[]};draw=function(){const t=performance.now();originalDraw();window.__costs.draw.push(performance.now()-t)};update=function(dt){const t=performance.now();originalUpdate(dt);window.__costs.update.push(performance.now()-t)}")`);
    // Comparação isolada do renderizador, com a mesma simulação e cena.
    if(baseline)await evaluate('window.__evaluate("drawEnemy=drawEnemyVector;quality.sample=()=>false;resolutionLimit=2;fitCanvasResolution();quality.cycle();quality.cycle();")');
    await wait(1200);
    const stats = await evaluate(`new Promise(resolve=>{const times=[];let previous=performance.now();function sample(now){times.push(now-previous);previous=now;if(times.length<240){requestAnimationFrame(sample);return}times.sort((a,b)=>a-b);resolve({fps:1000/(times.reduce((a,b)=>a+b,0)/times.length),p50:times[120],p95:times[228],over25ms:times.filter(t=>t>25).length,state:window.__evaluate('({mode,enemies:enemies.length,bullets:bullets.length,drops:drops.length,quality:quality.profile().name,scale:PIXEL_SCALE,cache:spriteCache.size})')});}requestAnimationFrame(sample);})`);
    // Exercita as imagens de ícone e extrai screenshot para inspeção visual.
    const image = await call('Page.captureScreenshot',{format:'png'});
    const output = path.join(root, 'tests', baseline?'browser-baseline.png':'browser-performance.png');
    fs.writeFileSync(output, Buffer.from(image.data,'base64'));
    const costs=await evaluate('Object.fromEntries(Object.entries(window.__costs).map(([k,v])=>[k,{mean:v.reduce((a,b)=>a+b,0)/v.length,p95:v.sort((a,b)=>a-b)[Math.floor(v.length*.95)]}]))');
    console.log(JSON.stringify({baseline,...stats,costs,errors,screenshot:output},null,2));
    if(errors.length)process.exitCode=1;
    await call('Browser.close').catch(()=>{});
  } finally { ws?.close();child.kill();server.close(); }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
