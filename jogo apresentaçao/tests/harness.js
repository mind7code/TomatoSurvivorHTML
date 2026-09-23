// Simulação determinística de DOM, relógio e Canvas. Não substitui um navegador.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');

function createGame({ width = 1280, height = 720, seed = 17 } = {}) {
  const html = fs.readFileSync(path.join(root, 'tomato (2).html'), 'utf8');
  const timers = new Map(), events = new Map(), messages = [], tools = new Map();
  let now = 0, timerId = 0, frame;
  const schedule = (fn, delay = 0, interval = false) => {
    const id = ++timerId;timers.set(id, { fn, at: now + Math.max(1, delay), interval: interval ? Math.max(1, delay) : 0 });return id;
  };
  const context = { measureText: text => ({ width: String(text).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) };
  for (const name of ['save','restore','beginPath','closePath','fill','stroke','clearRect','fillRect','strokeRect','translate','rotate','scale','setTransform','transform','resetTransform','moveTo','lineTo','arc','ellipse','quadraticCurveTo','bezierCurveTo','roundRect','drawImage','strokeText','fillText','clip','setLineDash']) context[name] = (...args) => {
    if (args.some(arg => typeof arg === 'number' && !Number.isFinite(arg))) throw Error(`Canvas ${name}: coordenada não finita`);
  };
  class Element {
    constructor(tag = 'div', attrs = '') {
      this.tagName = tag.toUpperCase();this.children = [];this.parentElement = null;this.listeners = new Map();this.dataset = {};this.attributes = {};this.style = { setProperty(name, value) { this[name] = value; } };this.textContent = '';this.value = '';this.disabled = false;this._classes = new Set();
      this.classList = { add: (...names) => names.forEach(n => this._classes.add(n)), remove: (...names) => names.forEach(n => this._classes.delete(n)), contains: n => this._classes.has(n), toggle: (n, force) => { const on = force ?? !this._classes.has(n);if (on) this._classes.add(n);else this._classes.delete(n);return on; } };
      for (const match of attrs.matchAll(/([\w-]+)="([^"]*)"/g)) this.setAttribute(match[1], match[2]);
    }
    set className(value) { this._classes = new Set(value.split(/\s+/).filter(Boolean)); }
    get className() { return [...this._classes].join(' '); }
    set innerHTML(value) { this._html = value;this.children = [];for (const m of value.matchAll(/<(\w+)\b([^>]*)>/g)) this.append(new Element(m[1], m[2])); }
    get innerHTML() { return this._html || ''; }
    setAttribute(name, value) { this.attributes[name] = String(value);if (name === 'id') this.id = value;if (name === 'class') this.className = value;if (name.startsWith('data-')) this.dataset[name.slice(5)] = value; }
    getAttribute(name) { return this.attributes[name] ?? null; }
    append(...children) { children.forEach(c => { c.parentElement = this;this.children.push(c); }); }
    replaceChildren(...children) { this.children = [];this.append(...children); }
    addEventListener(name, fn) { if (!this.listeners.has(name)) this.listeners.set(name, []);this.listeners.get(name).push(fn); }
    dispatch(name, event = {}) { if (name === 'click' && this.disabled) return;for (const fn of this.listeners.get(name) || []) fn({ target: this, currentTarget: this, preventDefault() {}, ...event }); }
    click() { this.dispatch('click'); }
    matches(selector) { return selector[0] === '#' ? this.id === selector.slice(1) : selector[0] === '.' ? selector.slice(1).split('.').every(n => this._classes.has(n)) : this.tagName === selector.toUpperCase(); }
    querySelectorAll(selector) { const out = [];for (const child of this.children) { if (selector.split(',').some(s => child.matches(s.trim()))) out.push(child);out.push(...child.querySelectorAll(selector)); }return out; }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    getContext() { return context; }
    getBoundingClientRect() { return { left: 0, top: 0, width, height, right: width, bottom: height }; }
    get clientWidth() { return width; } get clientHeight() { return height; }
    get offsetWidth() { return width; } get offsetHeight() { return height; }
    getAnimations() { return []; }
    animate() { return { finished: Promise.resolve(), cancel() {} }; }
    focus() {} select() {} setPointerCapture() {} releasePointerCapture() {}
  }
  const document = new Element('document');document.innerHTML = html.slice(0, html.indexOf('<script src='));
  document.body = document;document.createElement = tag => new Element(tag);
  document.modelContext = { registerTool(tool) { tools.set(tool.name, tool); } };
  const math = Object.create(Math);math.random = () => { seed = (1664525 * seed + 1013904223) >>> 0;return seed / 4294967296; };
  const sandbox = { document, Math: math, performance: { now: () => now }, console: Object.fromEntries(['log','warn','error'].map(type => [type, (...args) => messages.push({ type, args })])),
    localStorage: { getItem: () => null, setItem() {} }, innerWidth: width, innerHeight: height, devicePixelRatio: 1,
    setTimeout: (fn, ms) => schedule(fn, ms), clearTimeout: id => timers.delete(id), setInterval: (fn, ms) => schedule(fn, ms, true), clearInterval: id => timers.delete(id),
    requestAnimationFrame: fn => { frame = fn; }, addEventListener: (type, fn) => { if (!events.has(type)) events.set(type, []);events.get(type).push(fn); },
    getComputedStyle: () => ({ display: 'block', visibility: 'visible' }), matchMedia: () => ({ matches: false, addEventListener() {} }) };
  sandbox.window = sandbox;vm.createContext(sandbox);
  for (const [, file] of html.matchAll(/<script src="\.\/([^"]+)"/g)) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, { filename: file });
  const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
  const instrumented = inline.replace('registerTools();draw();', 'globalThis.__evaluate = code => eval(code);registerTools();draw();');
  vm.runInContext(instrumented, sandbox, { filename: 'tomato (2).html' });
  function advance(ms) {
    const end = now + ms;let count = 0;
    while (true) {
      const pending = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!pending) break;if (++count > 10000) throw Error('Loop de timers');
      const [id, timer] = pending;now = timer.at;if (timer.interval) timer.at += timer.interval;else timers.delete(id);timer.fn();
    }
    now = end;
  }
  return { sandbox, document, tools, messages, timers, context, execute: code => sandbox.__evaluate(code), advance,
    frame(ms = 1000 / 60) { advance(ms);frame(now); },
    runFrames(fps, seconds) { for (let i = 0; i < fps * seconds; i++) this.frame(1000 / fps); },
    event(type, data = {}) { for (const fn of events.get(type) || []) fn({ target: document, preventDefault() {}, ...data }); }
  };
}
module.exports = { createGame };
