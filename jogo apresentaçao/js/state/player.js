/* Factory do estado do jogador. Mantém atributos de partida fora do núcleo visual. */
window.TomatoState = window.TomatoState || {};
window.TomatoState.createPlayer = ({ type, chars, width, height, createWeapon }) => {
  const character = chars[type];
  const starter = type === 'cherry' ? 'knife' : type === 'green' ? 'hammer' : type === 'ember' ? 'pistol' : 'shortSword';
  const trait = type === 'cherry' ? 'CEREJA: +12% crítico e arrancada menor'
    : type === 'green' ? 'VERDE: +12% defesa e regeneração'
    : type === 'golden' ? 'DOURADO: +40% sementes'
    : type === 'ember' ? 'BRASA: +35% dano, pouca vida'
    : 'CLÁSSICO: +10% dano inicial';
  return {
    x:width/2,y:height/2,r:17,hp:character.hp,maxHp:character.hp,speed:character.speed,
    damage:character.damage/13*(type==='classic'?1.1:type==='ember'?1.35:1),attackSpeed:Math.max(.75,.48/character.fireRate),
    projectileSpeed:1,crit:type==='cherry'?.12:0,critDamage:0,regen:type==='green'?.6:0,regenClock:0,poisonClock:0,poisonInside:false,
    armor:type==='green'?.12:0,color:character.color,dark:character.dark,leaf:character.leaf,level:1,xp:0,nextXp:8,
    magnet:82,projectiles:0,bulletSize:1,inv:0,dashCd:0,dashBase:type==='cherry'?1.55:2.1,dashing:0,lastX:1,lastY:0,
    seedBonus:type==='golden'?.4:0,trait,weapons:[createWeapon(starter)]
  };
};
