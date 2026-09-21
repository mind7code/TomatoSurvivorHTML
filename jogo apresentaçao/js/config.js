/* Configurações centrais — ajuste aqui sem procurar números no código do jogo. */
window.TomatoConfig = Object.freeze({
  canvas: Object.freeze({ width: 960, height: 540, worldScale: 1.333, cameraZoom: 0.88 }),
  game: Object.freeze({ maxWaves: 20, maxWeapons: 6 }),
  performance: Object.freeze({
    maxBullets: 300,
    maxEnemyBullets: 360,
    maxParticles: 260,
    maxFlashes: 72,
    gridCell: 104,
    simulationHz: 60,
    hudRefreshSeconds: 0.10
  })
});
