/* Índice espacial do combate: projéteis consultam apenas inimigos próximos. */
window.TomatoCombat = window.TomatoCombat || {};
window.TomatoCombat.createCollisionGrid = (cellSize) => {
  const cells = new Map();
  const key = (x, y) => x + ',' + y;
  return { cells,
    rebuild(enemies) {
      cells.clear();
      for (const enemy of enemies) {
        if (enemy.dead) continue;
        const cellX = Math.floor(enemy.x / cellSize), cellY = Math.floor(enemy.y / cellSize);
        const id = key(cellX, cellY), bucket = cells.get(id);
        if (bucket) bucket.push(enemy); else cells.set(id, [enemy]);
      }
    },
    nearby(x, y) {
      const found = [], baseX = Math.floor(x / cellSize), baseY = Math.floor(y / cellSize);
      for (let offsetX = -1; offsetX <= 1; offsetX++) for (let offsetY = -1; offsetY <= 1; offsetY++) {
        const bucket = cells.get(key(baseX + offsetX, baseY + offsetY));
        if (bucket) found.push(...bucket);
      }
      return found;
    }
  };
};
