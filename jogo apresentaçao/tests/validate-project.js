const fs = require('fs');
const files = ['js/config.js','js/audio.js','js/quality.js','js/content/addons.js','js/content/enemies.js','js/state/player.js','js/combat/collision-grid.js','js/render/culling.js'];
for (const file of files) new Function(fs.readFileSync(file, 'utf8'));
const html = fs.readFileSync('tomato (2).html', 'utf8');
const start = html.lastIndexOf('<script>') + 8, end = html.indexOf('</script>', start);
new Function(html.slice(start, end));
for (const path of files) if (!html.includes('./' + path.replaceAll('\\', '/'))) throw new Error('Arquivo não carregado: ' + path);
console.log('Estrutura e sintaxe validadas.');
