/* Decoração procedural determinística da arena. Os objetos são gerados uma vez e
   reutilizados a cada frame, sem participar das colisões ou da jogabilidade. */
window.TomatoRender = window.TomatoRender || {};
window.TomatoRender.createArenaDecor = ({ width, height }) => {
  let seed = 0x71a4c3;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const pick = values => values[Math.floor(random() * values.length)];
  const objects = [];
  const safeCenter = (x, y) => (x - width / 2) ** 2 + (y - height / 2) ** 2 > 145 ** 2;

  for (let i = 0; i < 78; i++) {
    const x = 34 + random() * (width - 68), y = 42 + random() * (height - 84);
    if (!safeCenter(x, y)) continue;
    objects.push({
      x, y,
      type: pick(['stone', 'stone', 'tuft', 'tuft', 'dirt', 'twig']),
      size: .65 + random() * .75,
      rotation: random() * Math.PI * 2,
      tone: random()
    });
  }

  [
    [70, 88, 'stump'], [width - 88, 105, 'crate'], [92, height - 92, 'barrel'],
    [width - 105, height - 104, 'stump'], [width * .19, height * .83, 'crate'],
    [width * .82, height * .78, 'barrel']
  ].forEach(([x, y, type], index) => objects.push({ x, y, type, size: .9 + (index % 2) * .12, rotation: 0, tone: index / 6 }));

  const ellipse = (ctx, x, y, rx, ry, fill, stroke = null, line = 2) => {
    ctx.beginPath();ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);ctx.fillStyle = fill;ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke;ctx.lineWidth = line;ctx.stroke(); }
  };

  const draw = ctx => {
    for (const item of objects) {
      const { x, y, size, type, rotation, tone } = item;
      ctx.save();ctx.translate(x, y);ctx.rotate(rotation);
      if (type === 'dirt') {
        ctx.globalAlpha = .15;ellipse(ctx, 0, 0, 20 * size, 9 * size, tone > .5 ? '#3d5537' : '#745c3f');
      } else if (type === 'tuft') {
        ctx.globalAlpha = .55;ctx.strokeStyle = tone > .5 ? '#42633c' : '#6c8249';ctx.lineWidth = 2.3 * size;ctx.lineCap = 'round';
        for (let n = -1; n <= 1; n++) {ctx.beginPath();ctx.moveTo(n * 3, 5);ctx.quadraticCurveTo(n * 5, -3, n * 7, -9);ctx.stroke();}
      } else if (type === 'twig') {
        ctx.globalAlpha = .45;ctx.strokeStyle = '#4d3d2d';ctx.lineWidth = 3 * size;ctx.lineCap = 'round';ctx.beginPath();ctx.moveTo(-9, 4);ctx.lineTo(8, -4);ctx.lineTo(13, -10);ctx.moveTo(5, -2);ctx.lineTo(10, 5);ctx.stroke();
      } else if (type === 'stone') {
        ctx.globalAlpha = .78;ellipse(ctx, 2, 5, 12 * size, 5 * size, '#26372b44');
        ctx.globalAlpha = 1;ctx.fillStyle = tone > .5 ? '#71806b' : '#64715f';ctx.strokeStyle = '#344139';ctx.lineWidth = 3;
        ctx.beginPath();ctx.moveTo(-10 * size, 4 * size);ctx.lineTo(-6 * size, -7 * size);ctx.lineTo(3 * size, -11 * size);ctx.lineTo(11 * size, -2 * size);ctx.lineTo(8 * size, 7 * size);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.globalAlpha = .35;ctx.fillStyle = '#e2e9c8';ctx.beginPath();ctx.moveTo(-5 * size, -5 * size);ctx.lineTo(2 * size, -8 * size);ctx.lineTo(5 * size, -4 * size);ctx.closePath();ctx.fill();
      } else if (type === 'crate') {
        ellipse(ctx, 3, 13, 22 * size, 7 * size, '#26372b55');ctx.rotate(-rotation);ctx.fillStyle = '#8e653d';ctx.strokeStyle = '#36271d';ctx.lineWidth = 4;ctx.fillRect(-17 * size, -16 * size, 34 * size, 31 * size);ctx.strokeRect(-17 * size, -16 * size, 34 * size, 31 * size);ctx.lineWidth = 3;ctx.beginPath();ctx.moveTo(-14 * size, -13 * size);ctx.lineTo(14 * size, 12 * size);ctx.moveTo(14 * size, -13 * size);ctx.lineTo(-14 * size, 12 * size);ctx.stroke();
      } else if (type === 'barrel') {
        ellipse(ctx, 2, 15, 20 * size, 7 * size, '#26372b66');ctx.fillStyle = '#76503a';ctx.strokeStyle = '#2b211c';ctx.lineWidth = 4;ctx.beginPath();ctx.roundRect(-15 * size, -20 * size, 30 * size, 38 * size, 8 * size);ctx.fill();ctx.stroke();ctx.strokeStyle = '#252525';ctx.lineWidth = 5;ctx.beginPath();ctx.moveTo(-15 * size, -10 * size);ctx.lineTo(15 * size, -10 * size);ctx.moveTo(-15 * size, 8 * size);ctx.lineTo(15 * size, 8 * size);ctx.stroke();ctx.strokeStyle = '#b68758';ctx.lineWidth = 2;ctx.beginPath();ctx.moveTo(-8 * size, -17 * size);ctx.lineTo(-8 * size, 15 * size);ctx.stroke();
      } else if (type === 'stump') {
        ellipse(ctx, 2, 12, 22 * size, 7 * size, '#26372b66');ctx.fillStyle = '#6b4931';ctx.strokeStyle = '#2e271e';ctx.lineWidth = 4;ctx.beginPath();ctx.moveTo(-14 * size, -8 * size);ctx.lineTo(-12 * size, 15 * size);ctx.lineTo(13 * size, 15 * size);ctx.lineTo(15 * size, -8 * size);ctx.closePath();ctx.fill();ctx.stroke();ellipse(ctx, 0, -8 * size, 15 * size, 7 * size, '#b58a57', '#35281d', 3);ellipse(ctx, 0, -8 * size, 7 * size, 3 * size, '#85633f', null);
      }
      ctx.restore();
    }
  };

  return { draw, count: objects.length };
};
