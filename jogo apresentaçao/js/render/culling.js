/* Evita desenhar efeitos que estão fora da área visível da câmera. */
window.TomatoRender = window.TomatoRender || {};
window.TomatoRender.isVisible = (x, y, cameraX, cameraY, viewWidth, viewHeight, padding = 0) =>
  x >= cameraX - padding && x <= cameraX + viewWidth + padding && y >= cameraY - padding && y <= cameraY + viewHeight + padding;
