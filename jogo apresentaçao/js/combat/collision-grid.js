/* Índice espacial do combate: projéteis consultam apenas inimigos próximos. */
window.TomatoCombat = window.TomatoCombat || {};
window.TomatoCombat.createCollisionGrid = (cellSize) => {
  const cells = new Map();
  const bucketPool = [], scratch = [];
  let locations = new WeakMap(), maxRadius = 0, minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  const key = (x, y) => x + ',' + y;
  return { cells,
    rebuild(enemies) {
      for (const bucket of cells.values()) { bucket.length = 0;bucketPool.push(bucket); }
      cells.clear();maxRadius = 0;minX=minY=Infinity;maxX=maxY=-Infinity;
      for (const enemy of enemies) {
        if (enemy.dead) continue;
        maxRadius = Math.max(maxRadius, enemy.r);
        const cellX = Math.floor(enemy.x / cellSize), cellY = Math.floor(enemy.y / cellSize);
        minX=Math.min(minX,cellX);maxX=Math.max(maxX,cellX);minY=Math.min(minY,cellY);maxY=Math.max(maxY,cellY);
        const id = key(cellX, cellY), bucket = cells.get(id);
        if (bucket) bucket.push(enemy); else { const reused = bucketPool.pop() || [];reused.push(enemy);cells.set(id, reused); }
        locations.set(enemy, id);
      }
    },
    move(enemy) {
      const previous = locations.get(enemy);if (!previous) return;
      const next = key(Math.floor(enemy.x / cellSize), Math.floor(enemy.y / cellSize));if (previous === next) return;
      minX=Math.min(minX,Math.floor(enemy.x/cellSize));maxX=Math.max(maxX,Math.floor(enemy.x/cellSize));minY=Math.min(minY,Math.floor(enemy.y/cellSize));maxY=Math.max(maxY,Math.floor(enemy.y/cellSize));
      const oldBucket = cells.get(previous);if (!oldBucket) return;
      const index = oldBucket.indexOf(enemy);if (index < 0) return;oldBucket[index] = oldBucket[oldBucket.length - 1];oldBucket.pop();
      if (!oldBucket.length) cells.delete(previous);
      const bucket = cells.get(next);if (bucket) bucket.push(enemy);else cells.set(next, [enemy]);locations.set(enemy, next);
    },
    alongSegment(x1, y1, x2, y2, radius, found = scratch) {
      found.length = 0;const padding = radius + maxRadius;
      const left = Math.max(minX,Math.floor((Math.min(x1,x2)-padding)/cellSize)), right = Math.min(maxX,Math.floor((Math.max(x1,x2)+padding)/cellSize));
      const top = Math.max(minY,Math.floor((Math.min(y1,y2)-padding)/cellSize)), bottom = Math.min(maxY,Math.floor((Math.max(y1,y2)+padding)/cellSize));
      for (let x = left; x <= right; x++) for (let y = top; y <= bottom; y++) {
        const bucket = cells.get(key(x, y));
        if (bucket) found.push(...bucket);
      }
      return found;
    }
  };
};
// Primeiro contato de um segmento com um círculo; null significa ausência de impacto.
window.TomatoCombat.segmentCircle = (x1,y1,x2,y2,cx,cy,radius) => {
  const dx=x2-x1,dy=y2-y1,ox=x1-cx,oy=y1-cy,c=ox*ox+oy*oy-radius*radius;
  if(c<=0)return 0;
  const a=dx*dx+dy*dy;if(a===0)return null;
  const b=ox*dx+oy*dy,discriminant=b*b-a*c;if(discriminant<0)return null;
  const t=(-b-Math.sqrt(discriminant))/a;return t>=0&&t<=1?t:null;
};
