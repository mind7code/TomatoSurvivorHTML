/* Perfis de qualidade: limitam efeitos sem alterar dano, ondas ou progressão. */
window.TomatoQuality = {
  createController(base) {
    const profiles = [
      { name:'ALTA', bullets:base.maxBullets, enemyBullets:base.maxEnemyBullets, particles:base.maxParticles, flashes:base.maxFlashes, particleStride:1 },
      { name:'EQUILIBRADA', bullets:Math.round(base.maxBullets*.82), enemyBullets:Math.round(base.maxEnemyBullets*.82), particles:Math.round(base.maxParticles*.68), flashes:Math.round(base.maxFlashes*.7), particleStride:2 },
      { name:'DESEMPENHO', bullets:Math.round(base.maxBullets*.64), enemyBullets:Math.round(base.maxEnemyBullets*.64), particles:Math.round(base.maxParticles*.42), flashes:Math.round(base.maxFlashes*.45), particleStride:3 }
    ];
    let index = 1;
    return { profile: () => profiles[index], cycle: () => { index = (index + 1) % profiles.length; return profiles[index]; } };
  }
};
