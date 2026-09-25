/* Pequenos canvases transparentes reutilizados: sem gradientes por NPC/frame. */
window.TomatoRender = window.TomatoRender || {};
window.TomatoRender.createSpriteCache = (limit = 192) => {
  const entries = new Map();
  return {
    get(key, width, height, paint, scale = 1.5) {
      if (entries.has(key)) return entries.get(key);
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(width * scale);canvas.height = Math.ceil(height * scale);
      const context = canvas.getContext('2d');
      context.scale(scale, scale);paint(context);
      if (entries.size >= limit) entries.delete(entries.keys().next().value);
      entries.set(key, canvas);return canvas;
    },
    get size() { return entries.size; }
  };
};
