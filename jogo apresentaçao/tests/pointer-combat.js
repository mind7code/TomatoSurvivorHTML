const assert=require('node:assert/strict');
const {createGame}=require('./harness');
function game(){const g=createGame();g.execute("startGame('ember');spawnClock=999;enemies=[]");return g;}
function pointer(g,type,x=1100,y=240,extra={}){g.document.querySelector('#game').dispatch(type,{pointerId:7,pointerType:'mouse',button:0,buttons:type==='pointerup'?0:1,clientX:x,clientY:y,...extra});}
{
  const g=game();g.execute("EnemyManager.spawn('tank',{x:player.x+180,y:player.y},{summoned:true});updateWeapons(1/60)");
  assert.equal(g.execute('bullets.length'),1,'Auto-fire ataca sem clique quando existe um alvo');
  assert.equal(g.execute('Math.sign(bullets[0].vx)'),1,'Auto-fire aponta para o inimigo mais próximo');
}
for(const [dx,dy] of [[180,0],[-180,0],[0,-180],[0,180]]){
  const g=game();g.execute(`EnemyManager.spawn('tank',{x:player.x+${dx},y:player.y+${dy}},{summoned:true});updateWeapons(1/60)`);
  assert.equal(g.execute('bullets.length'),1);
  assert.ok(g.execute('Math.abs((enemies[0].x-bullets[0].spawnX)*bullets[0].vy-(enemies[0].y-bullets[0].spawnY)*bullets[0].vx)<1e-6'),'Auto-fire mira corretamente nos quatro sentidos');
}
{
  const g=game();g.execute("EnemyManager.spawn('tank',{x:player.x+180,y:player.y},{summoned:true});for(let i=0;i<120;i++)updateWeapons(1/60)");
  assert.ok(g.execute('bullets.length>=4'),'Auto-fire mantém a cadência sem entrada do mouse');
}
{
  const g=game();g.execute("EnemyManager.spawn('tank',{x:player.x+180,y:player.y},{summoned:true});updateWeapons(1/60);const first=bullets[0].vx;enemies[0].dead=true;player.weapons[0].cooldown=0;EnemyManager.spawn('tank',{x:player.x-180,y:player.y},{summoned:true});updateWeapons(1/60);window.changedTarget=first>0&&bullets.at(-1).vx<0");
  assert.equal(g.execute('window.changedTarget'),true,'Auto-fire troca de alvo quando o anterior morre');
}
{
  const g=game();g.execute("player.x=300;player.y=360;EnemyManager.spawn('tank',{x:900,y:360},{summoned:true});updateWeapons(1/60)");
  assert.equal(g.execute('bullets.length'),0,'Auto-fire não ataca fora do alcance');
  g.execute('enemies[0].x=player.x+180;updateWeapons(1/60)');assert.equal(g.execute('bullets.length'),1,'Auto-fire retoma quando o alvo entra no alcance');
}
{
  const g=game();g.execute("player.weapons=Array.from({length:6},()=>createWeapon('pistol'));for(const [x,y] of [[player.x+150,player.y],[player.x-150,player.y],[player.x,player.y-150]])EnemyManager.spawn('tank',{x,y},{summoned:true});window.nearestCalls=0;const previousNearest=nearestEnemy;nearestEnemy=(...args)=>{window.nearestCalls++;return previousNearest(...args)};updateWeapons(1/60);nearestEnemy=previousNearest");
  const targetCount=g.execute("new Set(player.weapons.map(w=>{const p=weaponPose(w);let best=-1,error=Infinity;for(let i=0;i<enemies.length;i++){const e=enemies[i],value=Math.abs(Math.sin(w.angle)*(e.x-p.x)-Math.cos(w.angle)*(e.y-p.y));if(value<error){error=value;best=i}}return best})).size");
  assert.equal(targetCount,3,'Seis armas são distribuídas entre os alvos disponíveis');
  assert.equal(g.execute('window.nearestCalls'),0,'Auto-fire não repete a busca global para cada arma');
}
{
  const g=game();pointer(g,'pointermove');g.execute('updateWeapons(1/60)');
  assert.equal(g.execute('bullets.length'),0,'Mirar sem pressionar não atira');
  pointer(g,'pointerdown');pointer(g,'pointerup');g.execute('updateWeapons(1/60)');
  assert.equal(g.execute('bullets.length'),1,'Clique rápido é consumido mesmo entre frames');
  g.execute('for(let i=0;i<90;i++)updateWeapons(1/60)');assert.equal(g.execute('bullets.length'),1);
  pointer(g,'pointerdown');g.execute('for(let i=0;i<90;i++)updateWeapons(1/60)');
  assert.ok(g.execute('bullets.length')>=4,'Segurar respeita a cadência e repete');
  pointer(g,'pointerup');const count=g.execute('bullets.length');g.execute('for(let i=0;i<90;i++)updateWeapons(1/60)');assert.equal(g.execute('bullets.length'),count);
}
for(const [x,y] of [[1100,360],[100,360],[640,80],[640,650]]){
  const g=game();g.execute("player.weapons=Array.from({length:6},()=>createWeapon('pistol'))");
  pointer(g,'pointerdown',x,y);g.execute('updateWeapons(1/60)');
  assert.equal(g.execute('bullets.length'),6);
  assert.ok(g.execute(`bullets.every(b=>{const target=aimInput.world(cameraView(),CAMERA_ZOOM),dx=target.x-b.x,dy=target.y-b.y;return Math.abs(dx*b.vy-dy*b.vx)<1e-6})`),'Todas as armas convergem na mira');
}
{
  const g=game();const canvas=g.document.querySelector('#game');
  canvas.getBoundingClientRect=()=>({left:100,top:50,width:480,height:270});
  pointer(g,'pointermove',340,185);assert.equal(g.execute('aimInput.state.x'),480);assert.equal(g.execute('aimInput.state.y'),270);
  g.execute('player.x=100;player.y=200');const first=g.execute('aimInput.world(cameraView(),CAMERA_ZOOM).x');
  g.execute('player.x=W-40');assert.ok(g.execute('aimInput.world(cameraView(),CAMERA_ZOOM).x')>first,'Mira acompanha câmera mesmo sem mover mouse');
  pointer(g,'pointerdown',340,185);g.execute('openArsenal();closeArsenal();updateWeapons(1/60)');assert.equal(g.execute('bullets.length'),0);
  pointer(g,'pointerdown',340,185);g.event('blur');assert.equal(g.execute('aimInput.state.down'),false);
  g.execute('togglePause(false)');pointer(g,'pointerdown',340,185);pointer(g,'pointercancel',340,185);g.execute('updateWeapons(1/60)');assert.equal(g.execute('bullets.length'),0);
  pointer(g,'pointerdown',340,185,{button:2});g.execute('updateWeapons(1/60)');assert.equal(g.execute('bullets.length'),0);
}
{
  const g=game();pointer(g,'pointerdown');
  const count=g.execute(`let checked=0;for(const id of weaponIds){bullets=[];slashes=[];player.weapons=[createWeapon(id)];attackWeapon(player.weapons[0]);const w=player.weapons[0],s=weaponStats(w);for(const t of [0,.03,.08,.18,.5]){w.shotAge=t;const m=window.TomatoRender.weaponAnimation(w,s,player.attackSpeed);if(!Object.values(m).every(Number.isFinite))throw Error(id);drawHeldWeapons()}if(s.type==='ranged'&&!bullets.length||s.type==='melee'&&!slashes.length)throw Error(id);checked++}checked`);
  assert.equal(count,g.execute('weaponIds.length'));
}
// Cadência real (não um cenário sem disparos) em monitores de taxas diferentes.
const counts=[];
for(const fps of [60,120,144,240]){const g=game();g.execute('player.hp=player.maxHp=1e9;waveTime=999;player.nextXp=1e9;window.testShots=0;const fire=attackWeapon;attackWeapon=w=>{window.testShots++;fire(w)}');pointer(g,'pointerdown');g.runFrames(fps,2);counts.push(g.execute('window.testShots'));}
assert.ok(counts[0]>2);assert.ok(counts.every(n=>n===counts[0]));
console.log('Auto-fire e mouse: alvo próximo, clique, segurar, soltar, seis armas, câmera/DPI e cancelamento aprovados.');
