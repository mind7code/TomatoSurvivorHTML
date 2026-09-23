window.TomatoRender = window.TomatoRender || {};
// Coordenadas lógicas da tela. O retângulo inteiro do texto precisa caber.
window.TomatoRender.placeLabel = (x, y, width, height, bounds, blockers, margin = 6) => {
  const half = Math.min(width / 2, bounds.width / 2 - margin);
  const clampX = value => Math.max(half + margin, Math.min(bounds.width - half - margin, value));
  const clampY = value => Math.max(height + margin, Math.min(bounds.height - margin, value));
  const initial = { x: clampX(x), y: clampY(y) };
  const clear = point => !blockers.some(r => point.x + half > r.x - margin && point.x - half < r.x + r.width + margin && point.y > r.y - margin && point.y - height < r.y + r.height + margin);
  if (clear(initial)) return initial;
  const xs = [initial.x, clampX(0), clampX(bounds.width)], ys = [initial.y, clampY(0), clampY(bounds.height)];
  for (const r of blockers) {
    xs.push(clampX(r.x - half - margin), clampX(r.x + r.width + half + margin));
    ys.push(clampY(r.y - margin), clampY(r.y + r.height + height + margin));
  }
  let best = null, distance = Infinity;
  for (const px of xs) for (const py of ys) {
    const d = (px-x)**2 + (py-y)**2;if(d>=distance)continue;
    const point={x:px,y:py};if(clear(point)){best=point;distance=d;}
  }
  return best;
};
