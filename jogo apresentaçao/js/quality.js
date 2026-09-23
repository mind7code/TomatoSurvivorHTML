/* Perfis de qualidade: limitam efeitos sem alterar dano, ondas ou progressão. */
window.TomatoQuality = {
  createController(base) {
    const profiles = [
      { name:'ALTA', bullets:base.maxBullets, enemyBullets:base.maxEnemyBullets, particles:base.maxParticles, flashes:base.maxFlashes },
      { name:'EQUILIBRADA', bullets:base.maxBullets, enemyBullets:base.maxEnemyBullets, particles:Math.round(base.maxParticles*.68), flashes:Math.round(base.maxFlashes*.7) },
      { name:'DESEMPENHO', bullets:base.maxBullets, enemyBullets:base.maxEnemyBullets, particles:Math.round(base.maxParticles*.42), flashes:Math.round(base.maxFlashes*.45) }
    ];
    let index = 1;
    return { profile: () => profiles[index], cycle: () => { index = (index + 1) % profiles.length; return profiles[index]; } };
  }
};
