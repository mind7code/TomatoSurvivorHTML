const assert = require('assert/strict');
const { createGame } = require('./harness');
const game = createGame();
for (const character of ['classic', 'cherry', 'green', 'golden', 'ember']) {
  game.tools.get('start_tomato_game').execute({ character });
  game.runFrames(60, 3);
  const snapshot = game.tools.get('read_tomato_status').execute();
  if (snapshot.status !== 'playing' || snapshot.wave !== 1 || snapshot.hp <= 0)
    throw Error(`Partida inválida para ${character}: ${JSON.stringify(snapshot)}`);
}
const decor = game.sandbox.TomatoRender.createArenaDecor({ width: 960, height: 540 });
for (let i = 0; i < 3; i++) {
  const hit = decor.hitProps(872, 105, 5, new Set());
  if (!hit || hit.type !== 'crate' || hit.broken !== (i === 2)) throw Error('Caixa não reagiu aos tiros');
}
if (decor.hitProps(872, 105, 5, new Set())) throw Error('Caixa destruída continuou recebendo tiros');
decor.resetProps();
if (!decor.hitProps(872, 105, 5, new Set())) throw Error('Cenário não reiniciou na nova partida');
const quality = game.sandbox.TomatoQuality.createController(game.sandbox.TomatoConfig.performance);
for (let i = 0; i < 3; i++) {
  const profile = quality.profile();
  if (profile.bullets !== 300 || profile.enemyBullets !== 360) throw Error('Qualidade gráfica alterou limites de combate');
  quality.cycle();
}
assert.equal(game.messages.filter(m=>m.type==='error').length,0);
console.log('5 personagens: inicialização e 180 frames; props e limites gráficos aprovados (DOM/Canvas simulados).');
