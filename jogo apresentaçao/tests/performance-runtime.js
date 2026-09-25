const assert = require('node:assert/strict');
const { createGame } = require('./harness');
const game=createGame();game.execute('startGame();spawnClock=999;aimInput.state.down=true');
// Uma arma em cada suporte aponta do próprio cano para o alvo, nos quatro quadrantes.
for(const [x,y] of [[900,360],[350,360],[640,100],[640,650]]) {
  const result=game.execute(`player.x=640;player.y=360;player.weapons=Array.from({length:6},()=>createWeapon('pistol'));enemies=[];EnemyManager.spawn('tank',{x:${x},y:${y}},{summoned:true});bullets=[];updateWeapons(1/60);player.weapons.map(w=>{const p=weaponPose(w),m=weaponMuzzle(w),e=enemies[0];return {error:Math.abs(Math.sin(w.angle)*(e.x-p.x)-Math.cos(w.angle)*(e.y-p.y)),muzzle:bullets.some(b=>Math.hypot(b.x-m.x,b.y-m.y)<.001)}})`);
  for(const item of result){assert.ok(item.error<1e-7);assert.ok(item.muzzle);}
}
// O cano longo não pode pular um inimigo encostado no jogador.
assert.ok(game.execute("player.weapons=[createWeapon('sniper')];enemies=[];EnemyManager.spawn('tank',{x:640,y:330},{summoned:true});enemies[0].shieldHp=0;const before=enemies[0].hp;bullets=[];updateWeapons(1/60);updateBullets(1/60);enemies[0].hp<before"));
// Qualidade se adapta até com frames perdidos intercalados; nunca reduz tiros/dano.
const controller=game.sandbox.TomatoQuality.createController(game.sandbox.TomatoConfig.performance);
for(let i=0;i<120;i++)controller.sample(i%3===0?33:16.67,4);
assert.equal(controller.profile().name,'DESEMPENHO');
assert.equal(controller.profile().bullets,300);
for(let i=0;i<300;i++)controller.sample(16.67,4);
assert.equal(controller.profile().name,'EQUILIBRADA');
// Cache realmente elimina primitivas vetoriais por inimigo nos frames seguintes.
game.execute("enemies=[];for(let n=0;n<160;n++)EnemyManager.spawn('normal',{x:200+n%20*40,y:150+Math.floor(n/20)*45},{summoned:true});draw()");
let ellipses=0;const original=game.context.ellipse;game.context.ellipse=(...args)=>{ellipses++;original(...args);};
game.execute('for(const e of enemies)drawEnemy(e)');
assert.equal(ellipses,0);
assert.notEqual(game.document.querySelector('#touchControls').getAttribute('aria-hidden'),'true');
console.log('Mira, acerto próximo, qualidade adaptativa e cache de 160 NPCs aprovados.');
