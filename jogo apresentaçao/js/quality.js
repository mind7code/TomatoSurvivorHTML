/* Perfis de qualidade: limitam efeitos sem alterar dano, ondas ou progressão. */
window.TomatoQuality = {
  createController(base) {
    const profiles = [
      { name:'ALTA', bullets:base.maxBullets, enemyBullets:base.maxEnemyBullets, particles:base.maxParticles, flashes:base.maxFlashes, numbers:72, pixelScale:2, glow:true },
      { name:'EQUILIBRADA', bullets:base.maxBullets, enemyBullets:base.maxEnemyBullets, particles:120, flashes:32, numbers:36, pixelScale:1.5, glow:false },
      { name:'DESEMPENHO', bullets:base.maxBullets, enemyBullets:base.maxEnemyBullets, particles:64, flashes:18, numbers:18, pixelScale:1, glow:false }
    ];
    let preferred = 1, index = 1, slow = 0, fast = 0;
    return {
      profile: () => profiles[index],
      cycle: () => { preferred = (preferred + 1) % profiles.length;index = preferred;slow = fast = 0;return profiles[index]; },
      // Histerese: reduz efeitos rapidamente, recupera só após vários segundos estáveis.
      sample(frameMs, workMs) {
        if (frameMs > 100 || frameMs <= 0) { slow = fast = 0;return false; }
        if (frameMs > 19 || workMs > 12) { slow += 4;fast = 0; }
        else { slow = Math.max(0, slow - 1);fast = frameMs < 18 && workMs < 8 ? fast + 1 : 0; }
        if (slow >= 20 && index < 2) { index++;slow = fast = 0;return true; }
        if (fast >= 300 && index > preferred) { index--;slow = fast = 0;return true; }
        return false;
      }
    };
  }
};
