/* Decoração procedural determinística da arena. Os objetos são gerados uma vez e
   reutilizados a cada frame; os props quebráveis são apenas visuais. */
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

  const addDetail = (x, y, type, size = .8) => {
    if (!safeCenter(x, y)) return;
    objects.push({ x, y, type, size, rotation: random() * Math.PI * 2, tone: random() });
  };
  // A arena ganha "ilhas" de história visual, deixando corredores limpos para o combate.
  const zones = [
    { x: width * .14, y: height * .17, count: 24, spreadX: 96, spreadY: 67, types: ['stone', 'stone', 'dirt', 'scrap', 'twig'] },
    { x: width * .78, y: height * .2, count: 21, spreadX: 82, spreadY: 55, types: ['tuft', 'tuft', 'dirt', 'twig', 'deadCrop'] },
    { x: width * .17, y: height * .74, count: 23, spreadX: 94, spreadY: 62, types: ['stone', 'scrap', 'dirt', 'twig'] },
    { x: width * .8, y: height * .76, count: 27, spreadX: 112, spreadY: 72, types: ['stone', 'tuft', 'dirt', 'scrap', 'deadCrop'] },
    { x: width * .5, y: height * .13, count: 14, spreadX: 125, spreadY: 34, types: ['dirt', 'twig', 'scrap'] }
  ];
  for (const zone of zones) for (let i = 0; i < zone.count; i++) {
    const angle = random() * Math.PI * 2, radius = Math.sqrt(random());
    addDetail(zone.x + Math.cos(angle) * zone.spreadX * radius, zone.y + Math.sin(angle) * zone.spreadY * radius, pick(zone.types), .55 + random() * .9);
  }
  for (let i = 0; i < 42; i++) {
    addDetail(34 + random() * (width - 68), 42 + random() * (height - 84), pick(['stone', 'tuft', 'dirt', 'twig']), .48 + random() * .65);
  }

  [
    [70, 88, 'stump'], [width - 88, 105, 'crate'], [92, height - 92, 'barrel'],
    [width - 105, height - 104, 'stump'], [width * .19, height * .83, 'crate'],
    [width * .82, height * .78, 'barrel'], [width * .13, height * .29, 'barrel'],
    [width * .89, height * .38, 'crate'], [width * .1, height * .46, 'fence'],
    [width * .89, height * .57, 'well'], [width * .23, height * .16, 'cart'],
    [width * .75, height * .19, 'scarecrow']
  ].forEach(([x, y, type], index) => objects.push({ x, y, type, size: .9 + (index % 2) * .12, rotation: 0, tone: index / 8, hp: type === 'stump' ? 0 : 3, dead: false }));
  const props = objects.filter(item => item.type === 'crate' || item.type === 'barrel');

  const ellipse = (ctx, x, y, rx, ry, fill, stroke = null, line = 2) => {
    ctx.beginPath();ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);ctx.fillStyle = fill;ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke;ctx.lineWidth = line;ctx.stroke(); }
  };

  const draw = (ctx, propsOnly = false) => {
    for (const item of propsOnly ? props : objects) {
      const { x, y, size, type, rotation, tone } = item;
      const dynamic = type === 'crate' || type === 'barrel';
      if (dynamic !== propsOnly || item.dead) continue;
      ctx.save();ctx.translate(x, y);ctx.rotate(rotation);
      if (type === 'dirt') {
        ctx.globalAlpha = .19;ellipse(ctx, 0, 0, 20 * size, 9 * size, tone > .5 ? '#282a28' : '#887464');
      } else if (type === 'tuft') {
        ctx.globalAlpha = .68;ctx.strokeStyle = tone > .5 ? '#424a3c' : '#837653';ctx.lineWidth = 2.3 * size;ctx.lineCap = 'round';
        for (let n = -1; n <= 1; n++) {ctx.beginPath();ctx.moveTo(n * 3, 5);ctx.quadraticCurveTo(n * 5, -3, n * 7, -9);ctx.stroke();}
      } else if (type === 'twig') {
        ctx.globalAlpha = .72;ctx.strokeStyle = '#302a25';ctx.lineWidth = 3 * size;ctx.lineCap = 'round';ctx.beginPath();ctx.moveTo(-9, 4);ctx.lineTo(8, -4);ctx.lineTo(13, -10);ctx.moveTo(5, -2);ctx.lineTo(10, 5);ctx.stroke();
      } else if (type === 'scrap') {
        ctx.globalAlpha = .65;ctx.fillStyle = tone > .5 ? '#766b62' : '#393e3c';ctx.strokeStyle = '#292828';ctx.lineWidth = 2;
        ctx.beginPath();ctx.moveTo(-8 * size, -3 * size);ctx.lineTo(5 * size, -6 * size);ctx.lineTo(10 * size, 4 * size);ctx.lineTo(-4 * size, 6 * size);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.strokeStyle = '#a79b87';ctx.beginPath();ctx.moveTo(-4 * size, -1 * size);ctx.lineTo(5 * size, 1 * size);ctx.stroke();
      } else if (type === 'stone') {
        ctx.globalAlpha = .78;ellipse(ctx, 2, 5, 12 * size, 5 * size, '#15151577');
        ctx.globalAlpha = 1;ctx.fillStyle = tone > .5 ? '#777672' : '#62625f';ctx.strokeStyle = '#2c2b2b';ctx.lineWidth = 3;
        ctx.beginPath();ctx.moveTo(-10 * size, 4 * size);ctx.lineTo(-6 * size, -7 * size);ctx.lineTo(3 * size, -11 * size);ctx.lineTo(11 * size, -2 * size);ctx.lineTo(8 * size, 7 * size);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.globalAlpha = .35;ctx.fillStyle = '#e2e9c8';ctx.beginPath();ctx.moveTo(-5 * size, -5 * size);ctx.lineTo(2 * size, -8 * size);ctx.lineTo(5 * size, -4 * size);ctx.closePath();ctx.fill();
      } else if (type === 'crate') {
        ellipse(ctx, 3, 13, 22 * size, 7 * size, '#26372b55');ctx.rotate(-rotation);ctx.fillStyle = '#8e653d';ctx.strokeStyle = '#36271d';ctx.lineWidth = 4;ctx.fillRect(-17 * size, -16 * size, 34 * size, 31 * size);ctx.strokeRect(-17 * size, -16 * size, 34 * size, 31 * size);ctx.lineWidth = 3;ctx.beginPath();ctx.moveTo(-14 * size, -13 * size);ctx.lineTo(14 * size, 12 * size);ctx.moveTo(14 * size, -13 * size);ctx.lineTo(-14 * size, 12 * size);ctx.stroke();
      } else if (type === 'barrel') {
        ellipse(ctx, 2, 15, 20 * size, 7 * size, '#26372b66');ctx.fillStyle = '#76503a';ctx.strokeStyle = '#2b211c';ctx.lineWidth = 4;ctx.beginPath();ctx.roundRect(-15 * size, -20 * size, 30 * size, 38 * size, 8 * size);ctx.fill();ctx.stroke();ctx.strokeStyle = '#252525';ctx.lineWidth = 5;ctx.beginPath();ctx.moveTo(-15 * size, -10 * size);ctx.lineTo(15 * size, -10 * size);ctx.moveTo(-15 * size, 8 * size);ctx.lineTo(15 * size, 8 * size);ctx.stroke();ctx.strokeStyle = '#b68758';ctx.lineWidth = 2;ctx.beginPath();ctx.moveTo(-8 * size, -17 * size);ctx.lineTo(-8 * size, 15 * size);ctx.stroke();
      } else if (type === 'stump') {
        ellipse(ctx, 2, 12, 22 * size, 7 * size, '#26372b66');ctx.fillStyle = '#6b4931';ctx.strokeStyle = '#2e271e';ctx.lineWidth = 4;ctx.beginPath();ctx.moveTo(-14 * size, -8 * size);ctx.lineTo(-12 * size, 15 * size);ctx.lineTo(13 * size, 15 * size);ctx.lineTo(15 * size, -8 * size);ctx.closePath();ctx.fill();ctx.stroke();ellipse(ctx, 0, -8 * size, 15 * size, 7 * size, '#b58a57', '#35281d', 3);ellipse(ctx, 0, -8 * size, 7 * size, 3 * size, '#85633f', null);
      } else if (type === 'deadCrop') {
        ctx.globalAlpha = .72;ctx.strokeStyle = tone > .5 ? '#71704a' : '#4d6246';ctx.lineWidth = 2.5 * size;ctx.lineCap = 'round';
        for (let n = -1; n <= 1; n++) { ctx.beginPath();ctx.moveTo(0, 8);ctx.lineTo(n * 8 * size, -10 * size);ctx.stroke(); }
      } else if (type === 'fence') {
        ellipse(ctx, 0, 12, 30 * size, 7 * size, '#26372b44');ctx.strokeStyle = '#5d402a';ctx.lineWidth = 5 * size;ctx.lineCap = 'round';ctx.beginPath();ctx.moveTo(-27 * size, 5);ctx.lineTo(28 * size, -5);ctx.moveTo(-19 * size, -12);ctx.lineTo(-14 * size, 15);ctx.moveTo(18 * size, -16);ctx.lineTo(22 * size, 10);ctx.stroke();
      } else if (type === 'well') {
        ellipse(ctx, 1, 14, 27 * size, 8 * size, '#26372b66');ellipse(ctx, 0, 3, 25 * size, 19 * size, '#6c756f', '#28302e', 4);ellipse(ctx, 0, -2, 18 * size, 11 * size, '#1c2626', '#28302e', 3);ctx.strokeStyle = '#8f988c';ctx.lineWidth = 3;ctx.beginPath();ctx.arc(0, 3, 20 * size, .1, Math.PI-.1);ctx.stroke();
      } else if (type === 'cart') {
        ellipse(ctx, 0, 14, 30 * size, 8 * size, '#26372b55');ctx.fillStyle = '#775039';ctx.strokeStyle = '#38291f';ctx.lineWidth = 4;ctx.fillRect(-21 * size, -12 * size, 38 * size, 22 * size);ctx.strokeRect(-21 * size, -12 * size, 38 * size, 22 * size);ellipse(ctx, -13 * size, 12 * size, 7 * size, 7 * size, '#4b4035', '#292522', 3);ellipse(ctx, 12 * size, 12 * size, 7 * size, 7 * size, '#4b4035', '#292522', 3);ctx.strokeStyle = '#63442e';ctx.lineWidth = 4;ctx.beginPath();ctx.moveTo(17 * size, -5 * size);ctx.lineTo(37 * size, -16 * size);ctx.stroke();
      } else if (type === 'scarecrow') {
        ellipse(ctx, 0, 16, 22 * size, 6 * size, '#26372b55');ctx.strokeStyle = '#563b27';ctx.lineWidth = 6 * size;ctx.beginPath();ctx.moveTo(0, 16 * size);ctx.lineTo(0, -20 * size);ctx.moveTo(-17 * size, -6 * size);ctx.lineTo(18 * size, -9 * size);ctx.stroke();ellipse(ctx, 0, -26 * size, 10 * size, 11 * size, '#bd8d58', '#3a2c22', 3);ctx.fillStyle = '#64442e';ctx.beginPath();ctx.moveTo(-15 * size, -33 * size);ctx.lineTo(15 * size, -33 * size);ctx.lineTo(8 * size, -43 * size);ctx.lineTo(-9 * size, -42 * size);ctx.closePath();ctx.fill();ctx.stroke();
      }
      ctx.restore();
    }
  };

  return {
    draw: ctx => draw(ctx),
    drawProps: ctx => draw(ctx, true),
    hitProps(x, y, radius, seen) {
      for (const item of props) {
        if (item.hp <= 0 || item.dead || seen.has(item)) continue;
        const reach = radius + item.size * 20;
        if ((x - item.x) ** 2 + (y - item.y) ** 2 > reach ** 2) continue;
        seen.add(item);item.hp--;
        if (item.hp === 0) item.dead = true;
        return { x: item.x, y: item.y, type: item.type, broken: item.dead };
      }
      return null;
    },
    resetProps() {
      for (const item of props) {
        item.hp = 3;item.dead = false;
      }
    },
    count: objects.length
  };
};
