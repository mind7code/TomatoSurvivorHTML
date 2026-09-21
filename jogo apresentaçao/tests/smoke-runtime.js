const fs = require('fs');
const vm = require('vm');

const scripts = [
  'js/config.js', 'js/audio.js', 'js/quality.js', 'js/content/addons.js',
  'js/content/enemies.js', 'js/state/player.js', 'js/combat/collision-grid.js',
  'js/render/culling.js', 'js/render/arena-decor.js'
];

const gradient = { addColorStop() {} };
const canvasContext = new Proxy({}, {
  get(target, property) {
    if (property === 'createLinearGradient' || property === 'createRadialGradient') return () => gradient;
    if (!(property in target)) target[property] = () => {};
    return target[property];
  }
});
const nodes = new Map();
const makeNode = tag => ({
  tagName: tag.toUpperCase(),style: { setProperty() {} },dataset: {},listeners: {},
  classList: { add() {},remove() {},toggle() {},contains() { return false; } },
  addEventListener(name, listener) { this.listeners[name] = listener; },
  setAttribute() {},append() {},replaceChildren() {},getAnimations() { return []; },
  querySelector() { return makeNode('span'); },
  getContext() { return canvasContext; },
  animate() { return { finished: Promise.resolve() }; }
});
const document = {
  modelContext: { registerTool(tool) { tools.set(tool.name, tool); } },
  querySelector(selector) {
    if (!nodes.has(selector)) nodes.set(selector, makeNode(selector === '#game' ? 'canvas' : 'div'));
    return nodes.get(selector);
  },
  querySelectorAll() { return []; },
  createElement(tag) { return makeNode(tag); }
};
const tools = new Map();
let frame;
const sandbox = {
  document,console,Math,Promise,performance: { now: () => 0 },
  localStorage: { getItem: () => null,setItem() {} },
  setTimeout: () => 0,clearTimeout() {},setInterval: () => 0,clearInterval() {},
  requestAnimationFrame(callback) { frame = callback; },
  addEventListener() {}
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const file of scripts) vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
const html = fs.readFileSync('tomato (2).html', 'utf8');
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
vm.runInContext(inline, sandbox, { filename: 'tomato (2).html' });

const start = tools.get('start_tomato_game');
const status = tools.get('read_tomato_status');
if (!start || !status || typeof frame !== 'function') throw Error('Jogo não registrou controles ou loop');
for (const character of ['classic', 'cherry', 'green', 'golden', 'ember']) {
  start.execute({ character });
  for (let i = 1; i <= 180; i++) frame(i * 1000 / 60);
  const snapshot = status.execute();
  if (snapshot.status !== 'playing' || snapshot.wave !== 1 || snapshot.hp <= 0)
    throw Error(`Partida inválida para ${character}: ${JSON.stringify(snapshot)}`);
}
const decor = sandbox.TomatoRender.createArenaDecor({ width: 960, height: 540 });
for (let i = 0; i < 3; i++) {
  const hit = decor.hitProps(872, 105, 5, new Set());
  if (!hit || hit.type !== 'crate' || hit.broken !== (i === 2)) throw Error('Caixa não reagiu aos tiros');
}
if (decor.hitProps(872, 105, 5, new Set())) throw Error('Caixa destruída continuou recebendo tiros');
decor.resetProps();
if (!decor.hitProps(872, 105, 5, new Set())) throw Error('Cenário não reiniciou na nova partida');
const quality = sandbox.TomatoQuality.createController(sandbox.TomatoConfig.performance);
for (let i = 0; i < 3; i++) {
  const profile = quality.profile();
  if (profile.bullets !== 300 || profile.enemyBullets !== 360) throw Error('Qualidade gráfica alterou limites de combate');
  quality.cycle();
}
console.log('Inicialização, desenho e 180 frames validados para os 5 personagens.');
