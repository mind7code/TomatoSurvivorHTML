const assert = require('assert/strict');
const { createGame } = require('./harness');
let passed = 0;
{
  const game = createGame();
  assert.equal(game.execute('mode'), 'loading');
  assert.equal(game.timers.size, 1);
  game.execute('enterMenu()');
  assert.equal([...game.timers.values()].filter(t => !t.interval).length, 0);
  game.advance(500);
  game.document.querySelector('#changeNick').click();
  assert.equal(game.timers.size, 1);
  game.execute('enterMenu()');
  assert.equal(game.timers.size, 0);
  passed++;
  console.log('OK:', 'Timers de loading e nome não sobrevivem a troca rápida de telas');
}
function test(name, fn) {
  const game = createGame();game.execute('startGame();spawnClock=999');
  try { fn(game);assert.equal(game.messages.filter(m=>m.type==='error').length,0);passed++;console.log('OK:',name); }
  catch(error) { console.error('FALHOU:',name);throw error; }
}
const fillArsenal = "player.weapons=['shortSword','knife','hammer','pistol','rifle','smg'].map(id=>createWeapon(id));updateHud()";

test('Arsenal não interrompe modais, transições ou countdown', g => {
  for(const mode of ['loading','menu','launching','upgrade','bossReward','transition','countdown','ended']) {
    g.execute(`mode='${mode}';openArsenal()`);assert.equal(g.execute('mode'),mode);
  }
  g.execute("mode='shop';openArsenal();openArsenal();closeArsenal()");assert.equal(g.execute('mode'),'shop');
});
test('Reiniciar cancela transição e countdown anteriores', g => {
  g.execute('finishWave()');g.advance(500);g.execute('startGame();finishWave()');g.advance(600);
  assert.equal(g.execute('mode'),'transition');g.advance(450);assert.equal(g.execute('mode'),'shop');
  g.execute('nextWave();nextWave()');assert.equal(g.execute('wave'),2);
  g.advance(700);g.execute('startGame()');g.advance(4000);assert.equal(g.execute('wave'),1);assert.equal(g.execute('mode'),'playing');
  assert.equal([...g.timers.values()].filter(t=>t.interval).length,0);
});
test('Upgrade com Arsenal cheio não perde troca nem reabre nível durante pausa', g => {
  g.execute(fillArsenal);g.execute("player.xp=100;levelUp();renderChoices($('#upgradeCards'),[{name:'Arma',desc:'Teste',icon:'X',apply:()=>giveWeapon('minigun','rare')}],false)");
  g.document.querySelector('#upgradeCards').children[0].click();assert.equal(g.execute('mode'),'arsenal');assert.equal(g.execute('pendingWeapon.id'),'minigun');
  g.document.querySelector('#arsenalGrid').children[0].querySelector('.replace').click();
  assert.equal(g.execute('mode'),'playing');assert.equal(g.execute('player.weapons[0].id'),'minigun');
  g.execute('togglePause(true)');g.advance(1000);assert.equal(g.execute('mode'),'paused');
  g.execute('togglePause(false);update(1/60)');assert.equal(g.execute('mode'),'upgrade');
});
test('Recompensa de mini-chefe resolve troca antes de encerrar onda', g => {
  g.execute(fillArsenal);g.execute("weaponOffer=()=>({icon:'X',name:'Test',desc:'Test',apply:()=>giveWeapon('minigun')});showBossReward('Teste',true)");
  const cards=g.document.querySelector('#bossRewardCards').children;
  cards.find(b=>b.innerHTML.includes('<strong>Test</strong>')).click();assert.equal(g.execute('mode'),'arsenal');
  g.document.querySelector('#arsenalClose').click();assert.equal(g.execute('mode'),'transition');
  g.advance(1050);assert.equal(g.execute('mode'),'shop');assert.equal(g.execute('pendingWeapon'),null);
});
test('Compras cobram uma vez, mantém raridade superior e rejeitam melhoria esgotada', g => {
  g.execute("mode='shop';seeds=100;renderChoices($('#shopCards'),[{icon:'X',name:'Upgrade',desc:'Test',price:20,apply:()=>giveWeapon('shortSword','legendary')}],true)");
  const button=g.document.querySelector('#shopCards').children[0];button.click();button.dispatch('click');
  assert.equal(g.execute('seeds'),80);assert.equal(g.execute('player.weapons[0].rarity'),'legendary');
  g.execute("player.weapons[0].level=4;const stale=improveWeaponOffer(true);player.weapons[0].level=5;renderChoices($('#shopCards'),[stale],true)");
  g.document.querySelector('#shopCards').children[0].click();assert.equal(g.execute('seeds'),80);
  assert(!g.execute('improveWeaponOffer().desc').includes('5 → 5'));
});
test('Seleção acompanha a arma após reordenar e remover', g => {
  g.execute(fillArsenal);g.document.querySelector('#inventory').children[2].click();assert.equal(g.execute('selectedWeaponIndex'),2);
  assert.equal(g.document.querySelector('#weaponName').textContent,'Martelo');g.execute('openArsenal()');
  let card=g.document.querySelector('#arsenalGrid').children[2];card.querySelector('.arsenal-actions').children[0].click();
  assert.equal(g.execute('player.weapons[selectedWeaponIndex].id'),'hammer');
  card=g.document.querySelector('#arsenalGrid').children[0];card.querySelector('.remove').click();
  assert.equal(g.execute('player.weapons[selectedWeaponIndex].id'),'hammer');g.execute('closeArsenal()');assert.equal(g.execute('mode'),'playing');
});
test('Blur limpa input; atalhos ignoram digitação e repetição', g => {
  g.event('keydown',{code:'KeyD'});g.event('blur');assert.equal(g.execute('mode'),'paused');assert.equal(g.execute('!!keys.KeyD'),false);
  g.execute('togglePause(false)');g.event('keydown',{code:'KeyP',repeat:true});assert.equal(g.execute('mode'),'playing');
  g.event('keydown',{code:'KeyP',target:g.document.querySelector('#nickInput')});assert.equal(g.execute('mode'),'playing');
});
test('Dash parado usa última direção e knockback respeita mapa', g => {
  const x=g.execute('player.x');g.execute('dash();update(1/60)');assert(g.execute('player.x')>x);
  g.execute('player.x=24;player.y=50;player.inv=0;hitPlayer(1,100,100)');assert.equal(g.execute('player.x'),24);assert.equal(g.execute('player.y'),50);
  g.execute("EnemyManager.spawn('normal',{x:20,y:100});damageEnemy(enemies[0],1,false,42,100,100)");assert(g.execute('enemies[0].x>=enemies[0].r'));
});
test('Retirada, summons e spawn permanecem nos limites', g => {
  g.execute("player.weapons[0].cooldown=999;player.inv=100;player.x=24;player.y=300;EnemyManager.spawn('shooter',{x:30,y:300});for(let i=0;i<180;i++)update(1/60)");
  assert(g.execute('enemies.every(e=>e.x>=e.r&&e.y>=e.r&&e.x<=W-e.r&&e.y<=H-e.r)'));
  g.execute("enemies=[];wave=15;for(let i=0;i<50;i++)EnemyManager.spawn('fast',{x:-50,y:9999},{summoned:true})");assert.equal(g.execute('enemies.length'),9);
  g.execute("enemies=[];wave=11;Math.random=()=>.1;EnemyManager.spawn('normal',{x:100,y:100})");assert(g.execute('enemies[0].shielded&&enemies[0].armed'));
});
const bullet = (x=470, pierce=0) => `({x:${x},y:300,vx:3600,vy:0,r:3,damage:10,crit:false,life:1,pierce:${pierce},knock:0,color:'#fff',angle:0})`;
test('Projétil rápido acerta primeiro alvo atravessado', g => {
  g.execute(`EnemyManager.spawn('normal',{x:520,y:300});EnemyManager.spawn('normal',{x:500,y:300});enemies.forEach(e=>{e.hp=100;e.maxHp=100});bullets=[${bullet()}];updateBullets(1/60)`);
  assert.equal(g.execute('enemies[0].hp'),100);assert.equal(g.execute('enemies[1].hp'),90);assert.equal(g.execute('bullets.length'),0);
});
test('Perfuração acerta alvos distintos, sem tunneling ou acerto duplicado', g => {
  g.execute(`for(const x of [500,540,580])EnemyManager.spawn('normal',{x,y:300});enemies.forEach(e=>{e.hp=100;e.maxHp=100});bullets=[${bullet(470,2)}];bullets[0].vx=12000;updateBullets(1/60)`);
  assert(g.execute('enemies.every(e=>e.hp===90)'));assert.equal(g.execute('bullets.length'),0);
});
test('Raio grande e alcance final usam segmento completo', g => {
  g.execute(`EnemyManager.spawn('normal',{x:500,y:300});enemies[0].hp=100;bullets=[${bullet(200)}];bullets[0].r=300;updateBullets(1/60)`);assert.equal(g.execute('enemies[0].hp'),90);
  g.execute(`enemies=[];EnemyManager.spawn('normal',{x:530,y:300});enemies[0].hp=100;bullets=[${bullet()}];bullets[0].life=.001;updateBullets(1/60)`);assert.equal(g.execute('enemies[0].hp'),100);
});
test('Inimigo morto por melee concede recompensa uma única vez', g => {
  g.execute("EnemyManager.spawn('normal',{x:player.x+30,y:player.y});enemies[0].hp=1;attackWeapon(player.weapons[0]);update(1/60);processDeaths();processDeaths()");
  assert.equal(g.execute('kills'),1);assert(g.execute('seeds>0'));assert.equal(g.execute('drops.length'),1);
});
test('Dano letal não é sobrescrito pela recompensa de chefe no mesmo tick', g => {
  g.execute(`wave=5;player.hp=1;player.weapons[0].cooldown=999;EnemyManager.spawnBoss();enemies[0].x=500;enemies[0].y=300;enemies[0].hp=1;EnemyManager.spawn('normal',{x:player.x,y:player.y});bullets=[${bullet()}];update(1/60)`);
  assert.equal(g.execute('mode'),'ended');assert(g.document.querySelector('#endScreen').classList.contains('show'));assert(!g.document.querySelector('#bossRewardScreen').classList.contains('show'));
  g.execute('processDeaths()');assert.equal(g.execute('mode'),'ended');
});
test('Projétil inimigo atravessando jogador causa só um dano por invulnerabilidade', g => {
  g.execute('player.weapons[0].cooldown=999;player.x=500;player.y=300;enemyBullets=Array.from({length:2},()=>({x:440,y:300,vx:7200,vy:0,r:4,damage:10,life:2}));update(1/60)');
  assert.equal(g.execute('player.hp'),90);
});
test('Veneno sobreposto: entrada e um tick/segundo sem duplicação ao zerar relógio', g => {
  g.execute("player.maxHp=1000;player.hp=1000;hazards=Array.from({length:2},()=>({x:player.x,y:player.y,r:58,poison:true,warn:0,life:5}));for(let i=0;i<101;i++)updateHazards(.02)");
  assert.equal(g.execute('player.hp'),850);
  g.execute('player.x+=100;updateHazards(.02)');assert.equal(g.execute('player.poisonInside'),false);
});
test('Coleta de XP, cura e nível mantêm valores limitados', g => {
  g.execute("player.hp=80;heals=[{x:player.x,y:player.y,r:10,value:50,t:0}];update(1/60)");assert.equal(g.execute('player.hp'),100);
  g.execute('addXp(8,player.x,player.y);update(1/60)');assert.equal(g.execute('mode'),'upgrade');assert.equal(g.execute('player.level'),2);
  g.document.querySelector('#upgradeCards').children[0].click();assert(['playing','arsenal'].includes(g.execute('mode')));
});
test('Efeitos antigos somem entre ondas', g => {
  g.execute("particles=[{}];deathFx=[{}];damageNumbers=[{}];muzzleFlashes=[{}];impactFlashes=[{}];casings=[{}];finishWave()");
  assert.equal(g.execute('[particles,deathFx,damageNumbers,muzzleFlashes,impactFlashes,casings].reduce((n,a)=>n+a.length,0)'),0);
});
test('XP não cresce em quantidade indefinidamente e mantém todo o valor', g => {
  g.execute('for(let i=0;i<1000;i++)addXp(2,100+i%30,100+i%50)');assert.equal(g.execute('drops.length'),600);assert.equal(g.execute('drops.reduce((sum,d)=>sum+d.value,0)'),2000);
});
test('Hazard detecta travessia e respeita aviso/invulnerabilidade', g => {
  g.execute("player.x=600;player.y=300;hazards=[{x:500,y:300,r:32,damage:10,life:2,warn:1}];updateHazards(1/60,400,300)");assert.equal(g.execute('player.hp'),100);
  g.execute('hazards[0].warn=0;updateHazards(1/60,400,300);updateHazards(1/60,400,300)');assert.equal(g.execute('player.hp'),90);
});
test('Chefes executam todos os padrões e duas fases sem exceder limites', g => {
  for(const wave of [5,10,15,20]){
    g.execute(`startGame();wave=${wave};player.hp=1e8;player.maxHp=1e8;player.weapons[0].cooldown=999;player.inv=1000;EnemyManager.spawnBoss();enemies[0].hp=enemies[0].maxHp*.4;for(let step=0;step<8;step++){enemies[0].attackClock=0;update(1/60);draw()}`);
    assert(g.execute('enemyBullets.length<=quality.profile().enemyBullets'));assert(g.execute('enemies.filter(e=>!e.boss&&!e.dead).length<=9'));
  }
});
test('Carga de seis armas, projéteis e partículas respeita os tetos', g => {
  g.execute("wave=19;player.maxHp=1e8;player.hp=1e8;player.inv=1000;player.weapons=['minigun','machineGun','flamethrower','thornSprayer','rifle','shotgun'].map(id=>createWeapon(id,'legendary',5));for(let i=0;i<165;i++)EnemyManager.spawn('tank',{x:300+i%20*30,y:150+i%12*25});enemies.forEach(e=>{e.hp=1e9;e.maxHp=1e9;e.speed=0});for(let i=0;i<120;i++){update(1/60);if(i%10===0)draw()}");
  assert(g.execute('bullets.length<=quality.profile().bullets&&particles.length<=quality.profile().particles&&impactFlashes.length<=quality.profile().flashes'));
});
test('Vinte ondas, quatro chefes, recompensas, vitória e restart', g => {
  for(let wave=1;wave<=20;wave++) {
    assert.equal(g.execute('wave'),wave);
    if(wave%5===0) {
      g.execute('EnemyManager.spawnBoss();enemies.find(e=>e.boss).dead=true;processDeaths()');assert.equal(g.execute('mode'),'bossReward');
      // Escolhe poder; armas têm canApply, poderes não, evitando aleatoriedade do teste.
      const cards=g.document.querySelector('#bossRewardCards').children;
      const power=cards.find(b=>/Folha Guardiã|Molho Vulcânico|Clorofila Frenética|Coração da Horta|Semente Ancestral|Raiz Soberana/.test(b.innerHTML));power.click();
    }
    g.execute('player.xp=0;enemies=[];spawnClock=999;waveTime=0;update(1/60)');
    if(wave===20){assert.equal(g.execute('mode'),'ended');break}
    assert.equal(g.execute('mode'),'transition');g.advance(1050);assert.equal(g.execute('mode'),'shop');
    g.document.querySelector('#nextWaveBtn').click();g.advance(2600);assert.equal(g.execute('mode'),'playing');
  }
  g.document.querySelector('#restartBtn').click();assert.equal(g.execute('mode'),'menu');g.execute('startGame()');assert.equal(g.execute('wave'),1);assert.equal(g.execute('kills'),0);
});
test('Todos os catálogos de armas desenham e atacam sem valores inválidos', g => {
  g.execute("spawnClock=999;EnemyManager.spawn('tank',{x:player.x+25,y:player.y});enemies[0].hp=1e9;enemies[0].maxHp=1e9;enemies[0].speed=0;player.inv=1000;for(const id of weaponIds){player.weapons=[createWeapon(id,'legendary',5)];attackWeapon(player.weapons[0]);updateBullets(1/60);draw();if(!Number.isFinite(weaponStats(player.weapons[0]).damage))throw Error(id)}");
});
const snapshots=[];
for(const fps of [60,120,144,240]) {
  const g=createGame();g.execute("startGame();spawnClock=999;keys.KeyD=true");g.runFrames(fps,2);
  const motion=g.execute('({x:player.x,y:player.y,waveTime})');
  g.execute("startGame('ember');spawnClock=999;player.inv=1000;EnemyManager.spawn('normal',{x:player.x+100,y:player.y});enemies[0].hp=1e9;enemies[0].maxHp=1e9;enemies[0].speed=0");g.runFrames(fps,3);
  snapshots.push({motion,combat:g.execute('enemies[0].hp')});
}
for(const s of snapshots.slice(1)){assert(Math.abs(s.motion.x-snapshots[0].motion.x)<1e-7);assert(Math.abs(s.motion.waveTime-snapshots[0].motion.waveTime)<1e-7);assert.equal(s.combat,snapshots[0].combat)}
console.log(`OK: ${passed} cenários e equivalência de movimento/disparos a 60/120/144/240 FPS simulados.`);
